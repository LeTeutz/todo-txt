/**
 * threshold — the `t:` (threshold / start date) layer.
 *
 * `t:YYYY-MM-DD` is the todo.txt ecosystem's "do not bother me with this
 * before this date" tag (SwiftoDo, Simpletask, topydo, Sleek all read it).
 * A task whose `t:` lies in the FUTURE is not actionable yet, so the user
 * usually wants it out of the way while still keeping it in the file.
 *
 * Two modes, toggled from the palette (`threshold hide` / `threshold show`):
 *
 *   show  (default)  every line renders normally — `t:` is inert
 *   hide             lines with a future `t:` are pushed visually into the
 *                    background by the same line-decoration machinery the
 *                    filter layer uses (see components/cm-todotxt-filter.ts)
 *
 * DELIBERATE DEVIATION worth knowing: "hide" does not remove lines from the
 * document. It applies a much stronger dim than a filter does. The reasoning
 * is the same one the filter layer records — this app's contract is "just a
 * text file", and an edit made against a collapsed document is how plain-text
 * tools lose data. A `t:` line that vanished would also silently disappear
 * from Ctrl+A, from a `filter` tally, and from the character count, all of
 * which read the real document. Strong dimming gets the same "it's not in my
 * way" result while every byte stays selectable, editable, and saved.
 *
 * Nothing in this module mutates anything.
 */
import { isRealIsoDate } from './filterExpr';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Whether future-threshold lines are pushed to the background. */
export type ThresholdMode = 'show' | 'hide';

/** Tally for the status chip: `hidden` of `total` non-blank lines. */
export interface ThresholdCounts {
  hidden: number;
  total: number;
}

// ---------------------------------------------------------------------------
// Patterns
// ---------------------------------------------------------------------------

/**
 * `t:YYYY-MM-DD` metadata token, anywhere in the line.
 *
 * Whole-token by construction (leading `^|\s`, trailing lookahead) so a
 * `report:2026-01-01` or an `at:2026-01-01` cannot be mistaken for one.
 * Case-insensitive because the rest of this app reads metadata keys that way.
 */
const THRESHOLD_TOKEN_RE = /(?:^|\s)t:(\d{4}-\d{2}-\d{2})(?=\s|$)/i;

// ---------------------------------------------------------------------------
// Line introspection
// ---------------------------------------------------------------------------

/** `t:` date for a line as `YYYY-MM-DD`, or null when absent/malformed. */
export function lineThreshold(line: string): string | null {
  const m = THRESHOLD_TOKEN_RE.exec(line);
  return m ? m[1] : null;
}

/**
 * True if the line carries a `t:` date strictly AFTER `today`.
 *
 * Strictly after: a task thresholded for today IS actionable today, which is
 * the whole point of writing `t:` rather than `due:`. String comparison is
 * exact for zero-padded ISO dates.
 *
 * A shape-valid but IMPOSSIBLE date (`t:2026-02-31`, `t:9999-99-99`) is never
 * future. `isRealIsoDate` is the same gate the overdue tint and the `due:`
 * filter terms use, and it matters most here: under a bare string comparison
 * `t:9999-99-99` would sort above today and push a real task to 0.14 opacity,
 * while the equally malformed `t:2026-02-31` would sort below it and stay
 * inert. Two identical typos, opposite outcomes, decided by lexicographic
 * accident and with nothing on screen to explain either. A malformed threshold
 * is instead simply inert, which is also what the user can most easily notice
 * and fix.
 */
export function isThresholdFuture(line: string, today: string): boolean {
  const t = lineThreshold(line);
  return t !== null && isRealIsoDate(t) && t > today;
}

/**
 * True if a line participates in threshold treatment at all.
 *
 * Mirrors `isFilterable` in utils/filterExpr.ts: blank / whitespace-only
 * lines are structural spacers, never decorated and never counted. Completed
 * (`x `) lines are deliberately NOT excluded — a `t:` tag on a done line is
 * historical noise, and special-casing it here would make the chip's tally
 * disagree with what the decoration actually dims.
 */
export function isThresholdable(line: string): boolean {
  return line.trim() !== '';
}

/**
 * Tally future-threshold lines over a whole file for the status chip.
 *
 * `hidden` is 0 whenever `mode === 'show'`, so the chip can render straight
 * from this without re-checking the mode. Blank lines are excluded from BOTH
 * numbers, so "2/9" always means "2 of 9 real tasks".
 */
export function thresholdCounts(
  content: string,
  mode: ThresholdMode,
  today: string,
): ThresholdCounts {
  let hidden = 0;
  let total = 0;
  for (const line of content.split('\n')) {
    if (!isThresholdable(line)) continue;
    total += 1;
    if (mode === 'hide' && isThresholdFuture(line, today)) hidden += 1;
  }
  return { hidden, total };
}

// ---------------------------------------------------------------------------
// Palette argument parsing
// ---------------------------------------------------------------------------

/** Words that turn hiding ON. */
const HIDE_WORDS = new Set(['hide', 'hidden', 'on', 'yes', 'true', '1']);
/** Words that turn hiding OFF (back to the default). */
const SHOW_WORDS = new Set(['show', 'shown', 'off', 'no', 'false', '0', 'all', 'clear']);
/** Words that flip whichever mode is active. */
const TOGGLE_WORDS = new Set(['toggle', 'flip']);

/**
 * Parse the `threshold` command's argument.
 *
 * Returns `'toggle'` for an empty argument: with only two states, bare
 * `threshold` meaning "flip it" is the useful default, and it keeps the
 * command usable from a single palette keystroke. Anything unrecognized
 * throws so a typo'd `threshold hied` complains instead of silently doing
 * the opposite of what the user meant.
 */
export function parseThresholdArg(
  raw: string | undefined,
): ThresholdMode | 'toggle' {
  const arg = (raw ?? '').trim().toLowerCase();
  if (arg === '' || TOGGLE_WORDS.has(arg)) return 'toggle';
  if (HIDE_WORDS.has(arg)) return 'hide';
  if (SHOW_WORDS.has(arg)) return 'show';
  throw new Error(
    `expected hide or show (or no argument to toggle) — got "${raw}"`,
  );
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

/** localStorage key holding the threshold mode. */
export const THRESHOLD_STORAGE_KEY = 'todo-txt.threshold.v1';

/**
 * Read the persisted mode, defaulting to `'show'`.
 *
 * Defaults to `show` on ANY doubt — absent key, unknown value, storage
 * throwing. A stale/corrupt value must never leave the user staring at a
 * document with tasks pushed into the background for reasons the current
 * build cannot explain.
 */
export function loadStoredThresholdMode(): ThresholdMode {
  try {
    return localStorage.getItem(THRESHOLD_STORAGE_KEY) === 'hide'
      ? 'hide'
      : 'show';
  } catch {
    return 'show';
  }
}

/** Persist the mode. `'show'` removes the key rather than storing a default. */
export function storeThresholdMode(mode: ThresholdMode): void {
  try {
    if (mode === 'hide') localStorage.setItem(THRESHOLD_STORAGE_KEY, 'hide');
    else localStorage.removeItem(THRESHOLD_STORAGE_KEY);
  } catch {
    // Private-browsing / quota-exceeded: the mode still works for the rest of
    // this page load, it just will not survive a reload. Not worth a toast.
  }
}
