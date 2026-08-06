/**
 * settings — the configurable todo.txt root (R4).
 *
 * Every competing todo.txt client lets the user say WHERE their file is,
 * because the format's whole premise is that the file is the user's, not the
 * app's. Until R4 this app was the exception: it owned a directory inside its
 * own app-data area and nothing could be pointed at the todo.txt a user
 * already keeps in Dropbox, iCloud, or a git repo.
 *
 * WHAT THIS MODULE IS AND IS NOT.
 * It is the pure half: argument parsing for the `set-root` / `where` palette
 * verbs, and formatting for what comes back. It performs no I/O and holds no
 * state — the page owns the fetch, and the BACKEND owns validation.
 *
 * That last point is deliberate and worth being explicit about: this file does
 * NOT re-implement the path policy (must be under $HOME, no credential
 * directories, symlinks resolved first). A client-side copy of a security rule
 * is worth nothing — the API is reachable without this UI — and two copies of
 * a policy drift, which is how the weaker copy becomes the one that matters.
 * The checks here are ergonomic only: catch an empty argument before spending
 * a round-trip, and turn the server's reason into a readable toast. The server
 * is the authority on every rejection.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** The shape of `GET`/`PUT /api/settings`. */
export interface SettingsResponse {
  /** Absolute path of the ACTIVE root. */
  root: string;
  /** Absolute path of the app's own data dir — where `settings.json` lives. */
  default_root: string;
  /** True when no override is stored and `root === default_root`. */
  is_default: boolean;
  /** Absolute path of `settings.json` itself. */
  settings_path: string;
  /** Resolved absolute path of each of the three files. */
  files: Record<string, string>;
}

/** Words that mean "put it back where it was". */
const RESET_WORDS = new Set([
  'default',
  'defaults',
  'reset',
  'clear',
  'none',
  'off',
]);

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

/**
 * Parse the `set-root` argument into the value to PUT.
 *
 * Returns the raw path string, or `null` for a reset. `null` is what restores
 * the app-data default, so the reset keywords are recognised here rather than
 * making the user retype an absolute path they never chose in the first place.
 *
 * Throws when the argument is missing. `set-root` with no argument is NOT
 * treated as a reset: the other view commands in this app toggle on a bare
 * verb, and borrowing that habit here would mean a stray Enter silently
 * relocated where the user's tasks are read from. A path change is not a
 * toggle-shaped action — the destructive-looking interpretation has to be
 * typed out.
 *
 * Surrounding quotes are stripped so a path pasted from a shell (`set-root
 * "~/My Notes"`) works. Whitespace inside the path is preserved: directory
 * names contain spaces, and `~` is left for the SERVER to expand — expanding
 * it here would resolve against the browser's idea of a home directory, which
 * does not exist.
 */
export function parseSetRootArg(raw: string | undefined): string | null {
  const arg = (raw ?? '').trim();
  if (arg === '') {
    throw new Error(
      'expected a directory path — e.g. `set-root ~/Documents/todo`, ' +
        'or `set-root default` to go back to the app folder',
    );
  }
  if (RESET_WORDS.has(arg.toLowerCase())) return null;
  return stripQuotes(arg);
}

/** Strip one layer of matching surrounding quotes, if present. */
function stripQuotes(value: string): string {
  if (value.length >= 2) {
    const first = value[0];
    const last = value[value.length - 1];
    if ((first === '"' || first === "'") && first === last) {
      return value.slice(1, -1).trim();
    }
  }
  return value;
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

/**
 * One-line answer to "where is my data?" for the `where` verb.
 *
 * Reports the ROOT plus the fact that all three files sit inside it, rather
 * than listing three near-identical absolute paths — the paths differ only in
 * their last segment, and a toast that repeats a 60-character prefix three
 * times is harder to read than the directory alone.
 */
export function formatWhere(settings: SettingsResponse): string {
  const suffix = settings.is_default ? ' (app default)' : ' (custom)';
  return `${settings.root}${suffix} — todo.txt, done.txt, report.txt`;
}

/** Confirmation line after a successful `set-root`. */
export function formatRootChange(settings: SettingsResponse): string {
  return settings.is_default
    ? `back to the app folder: ${settings.root}`
    : `now reading ${settings.root}`;
}

/**
 * Turn a `PUT /api/settings` failure body into a readable message.
 *
 * The backend's rejection reasons are already written for a human ("'root'
 * must not be inside ~/.ssh"), so they are passed through rather than
 * translated — a UI-side rewrite would drift from the rule that actually
 * fired and leave the user guessing which one they hit.
 */
export function formatSettingsError(
  body: unknown,
  status: number,
): string {
  if (body !== null && typeof body === 'object') {
    const error = (body as { error?: unknown }).error;
    if (typeof error === 'string' && error.trim() !== '') return error;
  }
  return `HTTP ${status}`;
}
