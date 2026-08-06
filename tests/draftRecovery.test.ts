import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  clearRecoveryDraft,
  readRecoveryDraft,
  writeRecoveryDraft,
  type RecoveryDraft,
} from '../ui/src/utils/draftRecovery';

const STORAGE_KEY = 'todo-txt.recovery.v1.todo';

beforeEach(async () => {
  window.localStorage.clear();
  vi.stubGlobal('indexedDB', undefined);
  await clearRecoveryDraft('todo');
});

describe('todo.txt recovery journal', () => {
  it('writes synchronously and restores the latest valid draft', async () => {
    const draft: RecoveryDraft = {
      version: 1,
      file: 'todo',
      content: 'unsaved line\n',
      baseMtime: 42,
      updatedAt: 123_456,
    };

    const write = writeRecoveryDraft(draft);
    expect(window.localStorage.getItem(STORAGE_KEY)).toContain('unsaved line');
    await write;

    await expect(readRecoveryDraft('todo')).resolves.toEqual(draft);
  });

  it('ignores corrupt or wrong-file records', async () => {
    window.localStorage.setItem(STORAGE_KEY, '{not-json');
    await expect(readRecoveryDraft('todo')).resolves.toBeNull();

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        file: 'done',
        content: 'wrong file',
        baseMtime: 1,
        updatedAt: 2,
      }),
    );
    await expect(readRecoveryDraft('todo')).resolves.toBeNull();
  });

  it('clears the synchronous crash mirror after an acknowledged save', async () => {
    await writeRecoveryDraft({
      version: 1,
      file: 'todo',
      content: 'saved',
      baseMtime: 1,
      updatedAt: Date.now(),
    });

    await clearRecoveryDraft('todo');

    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
    await expect(readRecoveryDraft('todo')).resolves.toBeNull();
  });

  it('retries IndexedDB after a transient open failure', async () => {
    const indexedDraft: RecoveryDraft = {
      version: 1,
      file: 'done',
      content: 'durable draft',
      baseMtime: 9,
      updatedAt: 10,
    };
    const database = {
      objectStoreNames: { contains: () => true },
      close: vi.fn(),
      transaction: () => ({
        objectStore: () => ({
          get: () => {
            const request = {} as IDBRequest;
            Object.defineProperty(request, 'result', { value: indexedDraft });
            queueMicrotask(() =>
              request.onsuccess?.call(request, new Event('success')),
            );
            return request;
          },
        }),
      }),
    } as unknown as IDBDatabase;
    let attempts = 0;
    const open = vi.fn(() => {
      attempts += 1;
      const request = {} as IDBOpenDBRequest;
      queueMicrotask(() => {
        if (attempts === 1) {
          request.onerror?.call(request, new Event('error'));
          return;
        }
        Object.defineProperty(request, 'result', { value: database });
        request.onsuccess?.call(request, new Event('success'));
      });
      return request;
    });
    vi.stubGlobal('indexedDB', { open });

    await expect(readRecoveryDraft('done')).resolves.toBeNull();
    await expect(readRecoveryDraft('done')).resolves.toEqual(indexedDraft);
    expect(open).toHaveBeenCalledTimes(2);
  });
});
