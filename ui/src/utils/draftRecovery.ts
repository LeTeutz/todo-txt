export type RecoveryDraftFile = 'todo' | 'done';

export interface RecoveryDraft {
  version: 1;
  file: RecoveryDraftFile;
  content: string;
  baseMtime: number;
  updatedAt: number;
  /** Absolute data root this draft was written against.
   *
   * Optional ONLY for backward compatibility: drafts written before root
   * scoping existed have no root, and `DraftScope` decides what to do with
   * them (see `draftBelongsTo`). Every write from this build sets it.
   */
  root?: string;
}

/** Which data root the caller is currently pointed at.
 *
 * Passing this turns the draft store from file-keyed into (file, root)-keyed
 * WITHOUT changing the storage key, so drafts written by earlier builds are
 * still found rather than orphaned.
 */
export interface DraftScope {
  /** Absolute path of the active root (from GET /api/settings). */
  root: string;
  /** True when that root is the app's own data directory. */
  isDefault: boolean;
}

const LOCAL_STORAGE_PREFIX = 'todo-txt.recovery.v1.';
const DATABASE_NAME = 'todo-txt';
const DATABASE_VERSION = 1;
const STORE_NAME = 'recovery-drafts';

let databasePromise: Promise<IDBDatabase | null> | null = null;

function localStorageKey(file: RecoveryDraftFile): string {
  return `${LOCAL_STORAGE_PREFIX}${file}`;
}

function parseDraft(
  value: unknown,
  expectedFile: RecoveryDraftFile,
): RecoveryDraft | null {
  if (!value || typeof value !== 'object') return null;
  const draft = value as Partial<RecoveryDraft>;
  if (
    draft.version !== 1 ||
    draft.file !== expectedFile ||
    typeof draft.content !== 'string' ||
    typeof draft.baseMtime !== 'number' ||
    !Number.isFinite(draft.baseMtime) ||
    draft.baseMtime < 0 ||
    typeof draft.updatedAt !== 'number' ||
    !Number.isFinite(draft.updatedAt) ||
    draft.updatedAt <= 0 ||
    // `root` is optional (legacy records predate scoping) but must be a
    // non-empty string when present — a blank or non-string root would
    // compare equal to nothing and silently disable scoping.
    (draft.root !== undefined &&
      (typeof draft.root !== 'string' || draft.root === ''))
  ) {
    return null;
  }
  return draft as RecoveryDraft;
}

function readLocalDraft(file: RecoveryDraftFile): RecoveryDraft | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(localStorageKey(file));
    return raw ? parseDraft(JSON.parse(raw), file) : null;
  } catch {
    return null;
  }
}

function writeLocalDraft(draft: RecoveryDraft): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    // This synchronous mirror is intentional: IndexedDB transactions may not
    // finish during a browser or host crash. todo.txt is capped at 1 MiB, so
    // it remains comfortably inside normal localStorage quotas.
    window.localStorage.setItem(
      localStorageKey(draft.file),
      JSON.stringify(draft),
    );
  } catch {
    // IndexedDB remains available as the best-effort fallback below.
  }
}

function removeLocalDraft(file: RecoveryDraftFile): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.removeItem(localStorageKey(file));
  } catch {
    // Browser storage may be blocked; clearing remains best-effort.
  }
}

function openDatabase(): Promise<IDBDatabase | null> {
  if (databasePromise) return databasePromise;
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);

  const attempt = new Promise<IDBDatabase | null>((resolve) => {
    let settled = false;
    const finish = (database: IDBDatabase | null) => {
      if (settled) {
        database?.close();
        return;
      }
      settled = true;
      resolve(database);
    };

    try {
      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME, { keyPath: 'file' });
        }
      };
      request.onsuccess = () => finish(request.result);
      request.onerror = () => finish(null);
      request.onblocked = () => finish(null);
    } catch {
      finish(null);
    }
  });
  databasePromise = attempt;
  void attempt.then((database) => {
    if (!database && databasePromise === attempt) databasePromise = null;
  });
  return attempt;
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => resolve();
    transaction.onabort = () => resolve();
  });
}

async function readIndexedDraft(
  file: RecoveryDraftFile,
): Promise<RecoveryDraft | null> {
  const database = await openDatabase();
  if (!database) return null;
  try {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const request = transaction.objectStore(STORE_NAME).get(file);
    const value = await new Promise<unknown>((resolve) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    });
    return parseDraft(value, file);
  } catch {
    return null;
  }
}

async function writeIndexedDraft(draft: RecoveryDraft): Promise<void> {
  const database = await openDatabase();
  if (!database) return;
  try {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(draft);
    await transactionDone(transaction);
  } catch {
    // The synchronous mirror still protects the draft.
  }
}

async function removeIndexedDraft(file: RecoveryDraftFile): Promise<void> {
  const database = await openDatabase();
  if (!database) return;
  try {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).delete(file);
    await transactionDone(transaction);
  } catch {
    // Clearing is best-effort when IndexedDB is unavailable.
  }
}

export async function readRecoveryDraft(
  file: RecoveryDraftFile,
  scope?: DraftScope,
): Promise<RecoveryDraft | null> {
  const localDraft = readLocalDraft(file);
  const indexedDraft = await readIndexedDraft(file);
  const newest = !localDraft
    ? indexedDraft
    : !indexedDraft
      ? localDraft
      : localDraft.updatedAt >= indexedDraft.updatedAt
        ? localDraft
        : indexedDraft;
  if (newest === null) return null;
  return draftBelongsTo(newest, scope) ? newest : null;
}

/** Does this draft belong to the root the caller is pointed at?
 *
 * WHY THIS EXISTS. The draft is keyed by FILE alone, so before this check a
 * draft written while the app pointed at the app data root was offered as
 * "unsaved work" after `set-root` moved the app to a synced directory.
 * Accepting it writes with the NEW root's mtime as the conflict token, so the
 * write matches and succeeds — silently replacing the user's real todo.txt
 * with content from a different directory.
 *
 * Legacy drafts (no `root`) are accepted on the DEFAULT root only: that is
 * where every pre-scoping draft was written unless the user had already moved
 * their root, and on a custom root the cost of guessing wrong is overwriting
 * the file they sync.
 */
function draftBelongsTo(
  draft: RecoveryDraft,
  scope: DraftScope | undefined,
): boolean {
  // No scope supplied: unscoped behaviour, for callers that have no root
  // context (and for the store's own unit tests).
  if (!scope) return true;
  if (draft.root === undefined) return scope.isDefault;
  return draft.root === scope.root;
}

export function writeRecoveryDraft(draft: RecoveryDraft): Promise<void> {
  writeLocalDraft(draft);
  return writeIndexedDraft(draft);
}

export async function clearRecoveryDraft(
  file: RecoveryDraftFile,
  scope?: DraftScope,
): Promise<void> {
  if (scope) {
    // Only clear what we would have OFFERED. Clearing blind would delete a
    // draft belonging to a different root — unsaved work the user can still
    // legitimately recover by switching back.
    const existing = await readRecoveryDraft(file, scope);
    if (existing === null) return;
  }
  removeLocalDraft(file);
  await removeIndexedDraft(file);
}
