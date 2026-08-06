export type WritableTodoFile = 'todo' | 'done';

export interface SaveRequestInput {
  file: WritableTodoFile;
  content: string;
  baseMtime: number;
  force?: boolean;
}

export interface SaveRequest extends SaveRequestInput {
  revision: number;
}

export type SaveAttemptResult =
  | { kind: 'saved'; mtime: number }
  | { kind: 'conflict'; message: string }
  | { kind: 'retry'; message: string }
  | { kind: 'fatal'; message: string };

export interface LatestSaveQueueOptions {
  save: (request: SaveRequest) => Promise<SaveAttemptResult>;
  onAttempt?: (request: SaveRequest) => void;
  onSaved?: (
    request: SaveRequest,
    result: Extract<SaveAttemptResult, { kind: 'saved' }>,
    isLatest: boolean,
  ) => void;
  onConflict?: (
    request: SaveRequest,
    result: Extract<SaveAttemptResult, { kind: 'conflict' }>,
  ) => void;
  onRetry?: (
    request: SaveRequest,
    result: Extract<SaveAttemptResult, { kind: 'retry' }>,
    attempt: number,
    delayMs: number,
  ) => void;
  onFatal?: (
    request: SaveRequest,
    result: Extract<SaveAttemptResult, { kind: 'fatal' }>,
  ) => void;
  setTimer?: typeof setTimeout;
  clearTimer?: typeof clearTimeout;
}

export function retryDelayMs(attempt: number): number {
  return Math.min(30_000, 1_000 * 2 ** Math.max(0, attempt - 1));
}

/**
 * Serializes writes and collapses a burst to the newest pending value.
 * Retryable failures remain queued indefinitely with capped exponential
 * backoff, so an in-memory editor recovers automatically when KiroCrew
 * returns. The browser draft journal is responsible for surviving reloads.
 */
export class LatestSaveQueue {
  private pending: SaveRequest | null = null;
  private worker: Promise<SaveAttemptResult | null> | null = null;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private retryAttempt = 0;
  private revision = 0;
  private disposed = false;

  private readonly setTimer: typeof setTimeout;
  private readonly clearTimer: typeof clearTimeout;

  constructor(private readonly options: LatestSaveQueueOptions) {
    this.setTimer = options.setTimer ?? setTimeout;
    this.clearTimer = options.clearTimer ?? clearTimeout;
  }

  enqueue(input: SaveRequestInput): SaveRequest {
    const request: SaveRequest = { ...input, revision: ++this.revision };
    this.pending = request;
    this.cancelRetryTimer();
    void this.pump();
    return request;
  }

  /** Attempt every currently queued value now, bypassing retry delay. */
  flush(): Promise<SaveAttemptResult | null> {
    this.cancelRetryTimer();
    return this.pump();
  }

  cancelPending(): void {
    this.pending = null;
    this.retryAttempt = 0;
    this.cancelRetryTimer();
  }

  hasUnsavedWork(): boolean {
    return Boolean(this.pending || this.worker || this.retryTimer);
  }

  dispose(): void {
    this.disposed = true;
    this.pending = null;
    this.cancelRetryTimer();
  }

  private cancelRetryTimer(): void {
    if (!this.retryTimer) return;
    this.clearTimer(this.retryTimer);
    this.retryTimer = null;
  }

  private pump(): Promise<SaveAttemptResult | null> {
    if (this.disposed) return Promise.resolve(null);
    if (this.worker) return this.worker;

    const worker = this.run();
    this.worker = worker;
    void worker.finally(() => {
      if (this.worker === worker) this.worker = null;
      if (this.pending && !this.retryTimer && !this.disposed) {
        void this.pump();
      }
    });
    return worker;
  }

  private async run(): Promise<SaveAttemptResult | null> {
    let lastResult: SaveAttemptResult | null = null;

    while (this.pending && !this.disposed) {
      const request = this.pending;
      this.pending = null;
      this.options.onAttempt?.(request);

      let result: SaveAttemptResult;
      try {
        result = await this.options.save(request);
      } catch (error) {
        result = {
          kind: 'retry',
          message: error instanceof Error ? error.message : String(error),
        };
      }
      lastResult = result;

      // The transport itself cannot be cancelled, but disposal must sever all
      // callbacks into the unmounted owner once an in-flight request settles.
      if (this.disposed) return result;

      const pendingAfterAttempt = this.pending as SaveRequest | null;
      const hasNewer = Boolean(
        pendingAfterAttempt &&
          pendingAfterAttempt.revision > request.revision,
      );

      if (result.kind === 'saved') {
        this.retryAttempt = 0;
        this.options.onSaved?.(request, result, !hasNewer);
        continue;
      }

      if (result.kind === 'conflict') {
        this.retryAttempt = 0;
        this.options.onConflict?.(request, result);
        if (hasNewer) continue;
        return result;
      }

      if (result.kind === 'fatal') {
        this.retryAttempt = 0;
        this.options.onFatal?.(request, result);
        if (hasNewer) continue;
        return result;
      }

      if (!hasNewer) this.pending = request;
      this.retryAttempt += 1;
      const delayMs = retryDelayMs(this.retryAttempt);
      this.options.onRetry?.(
        this.pending ?? request,
        result,
        this.retryAttempt,
        delayMs,
      );
      this.retryTimer = this.setTimer(() => {
        this.retryTimer = null;
        void this.pump();
      }, delayMs);
      return result;
    }

    return lastResult;
  }
}
