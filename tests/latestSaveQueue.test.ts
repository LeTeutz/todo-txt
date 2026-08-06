import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  LatestSaveQueue,
  retryDelayMs,
  type SaveAttemptResult,
  type SaveRequest,
} from '../ui/src/utils/latestSaveQueue';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

afterEach(() => {
  vi.useRealTimers();
});

describe('LatestSaveQueue', () => {
  it('serializes writes and collapses queued edits to the newest content', async () => {
    const first = deferred<SaveAttemptResult>();
    const save = vi.fn((request: SaveRequest) =>
      request.content === 'one'
        ? first.promise
        : Promise.resolve<SaveAttemptResult>({ kind: 'saved', mtime: 3 }),
    );
    const queue = new LatestSaveQueue({ save });

    queue.enqueue({ file: 'todo', content: 'one', baseMtime: 1 });
    await Promise.resolve();
    queue.enqueue({ file: 'todo', content: 'two', baseMtime: 1 });
    queue.enqueue({ file: 'todo', content: 'three', baseMtime: 1 });
    first.resolve({ kind: 'saved', mtime: 2 });

    await queue.flush();

    expect(save.mock.calls.map(([request]) => request.content)).toEqual([
      'one',
      'three',
    ]);
    queue.dispose();
  });

  it('retries retryable failures with capped exponential backoff', async () => {
    vi.useFakeTimers();
    const onRetry = vi.fn();
    const save = vi
      .fn<(_: SaveRequest) => Promise<SaveAttemptResult>>()
      .mockResolvedValueOnce({ kind: 'retry', message: 'gateway down' })
      .mockResolvedValueOnce({ kind: 'saved', mtime: 8 });
    const queue = new LatestSaveQueue({ save, onRetry });

    queue.enqueue({ file: 'todo', content: 'draft', baseMtime: 7 });
    await queue.flush();

    expect(onRetry).toHaveBeenCalledWith(
      expect.objectContaining({ content: 'draft' }),
      { kind: 'retry', message: 'gateway down' },
      1,
      1_000,
    );

    await vi.advanceTimersByTimeAsync(1_000);
    await queue.flush();
    expect(save).toHaveBeenCalledTimes(2);
    queue.dispose();
  });

  it('does not retry conflicts without a newer explicit request', async () => {
    vi.useFakeTimers();
    const onConflict = vi.fn();
    const save = vi.fn(async (): Promise<SaveAttemptResult> => ({
      kind: 'conflict',
      message: 'stale mtime',
    }));
    const queue = new LatestSaveQueue({ save, onConflict });

    queue.enqueue({ file: 'done', content: 'mine', baseMtime: 2 });
    await queue.flush();
    await vi.runAllTimersAsync();

    expect(save).toHaveBeenCalledTimes(1);
    expect(onConflict).toHaveBeenCalledTimes(1);
    queue.dispose();
  });

  it('suppresses callbacks after disposal while a save is in flight', async () => {
    const inFlight = deferred<SaveAttemptResult>();
    const onSaved = vi.fn();
    const save = vi.fn(() => inFlight.promise);
    const queue = new LatestSaveQueue({ save, onSaved });

    queue.enqueue({ file: 'todo', content: 'draft', baseMtime: 4 });
    const completion = queue.flush();
    await Promise.resolve();
    expect(save).toHaveBeenCalledTimes(1);

    queue.dispose();
    inFlight.resolve({ kind: 'saved', mtime: 5 });
    await completion;

    expect(onSaved).not.toHaveBeenCalled();
    expect(queue.hasUnsavedWork()).toBe(false);
  });

  it('caps retry delay at thirty seconds', () => {
    expect(retryDelayMs(1)).toBe(1_000);
    expect(retryDelayMs(5)).toBe(16_000);
    expect(retryDelayMs(20)).toBe(30_000);
  });
});
