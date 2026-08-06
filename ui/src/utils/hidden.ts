/**
 * hidden — the `h:1` (hide from default view) layer.
 *
 * `h:1` is the todo.txt ecosystem's "keep this in the file but out of my
 * face" tag. Simpletask, SwiftoDo and topydo all read it, and its meaning is
 * unusually explicit: unlike `t:` (which the reader INFERS is not actionable
 * yet), an `h:1` line is one the user has personally marked as noise. That
 * explicitness is why this layer offers a stronger treatment than `t:` does.
 *
 * Three modes, set from the palette (`hidden dim` / `hidden hide` /
 * `hidden show`):
 *
 *   dim  (default)  h:1 lines are pushed FAR into the visual background by the
 *                   same line-decoration machinery the filter and threshold
 *                   layers use (see components/cm-todotxt-filter.ts)
 *   hide            h:1 lines are removed from view entirely (`display: none`)
 *   show            h:1 lines are neither dimmed nor removed — no MODE
 *                   treatment applies
 *
 * `show` is NOT "the tag becomes invisible", and it does not make the tag
 * inert. The syntax layer (components/cm-todotxt-decorations.ts) styles `h:1`
 * lines muted + italic in ALL THREE modes, deliberately and independently of
 * the mode, so the tag never disappears silently from a line the user is
 * looking at. That styling currently also suppresses the overdue/due-today
 * tint on an `h:1` line, which is a real (cosmetic) loss of urgency
 * information — see the note in cm-todotxt-decorations.ts.
 *
 * WHY `hide` IS ALLOWED TO REMOVE LINES HERE, WHEN FILTER AND THRESHOLD REFUSE.
 * The filter and threshold layers deliberately never collapse the document:
 * both are heuristics the app applies on the user's behalf, so a line
 * vanishing would be the app losing the user's task for its own reasons.
 * `h:1` is the opposite — the user typed the tag whose literal meaning is
 * "hide this". Honouring it is not the app guessing. Two safeguards keep it
 * honest anyway:
 *
 *   1. `dim`, not `hide`, is the DEFAULT. A user who has never heard of this
 *      command never has a line disappear on them.
 *   2. Nothing is ever removed from the DOCUMENT, only from the view. The
 *      bytes stay in `getValue()`, in Ctrl+A, in the character count, in every
 *      save, and — crucially — in the Tab-complete vocabulary, so a +project
 *      that only exists on an h:1 line still completes. The status chip makes
 *      the mode visible so a restored `hide` can never be mistaken for missing
 *      tasks, and the cursor's own line is always exempt from the treatment so
 *      the caret can never be stranded on an invisible line.
 *
 * Nothing in this module mutates anything.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** How `h:1` lines are treated in the editor view. */
export type HiddenMode = 'show' | 'dim' | 'hide';

/** The mode a user who has never touched the command gets. */
export const DEFAULT_HIDDEN_MODE: HiddenMode = 'dim';

/** Tally for the status chip: `hidden` of `total` non-blank lines. */
export interface HiddenCounts {
  hidden: number;
  total: number;
}

// ---------------------------------------------------------------------------
// Patterns
// ---------------------------------------------------------------------------

/**
 * The `h:1` metadata token, anywhere in the line.
 *
 * Whole-token by construction (leading `^|\s`, trailing lookahead) so none of
 * `ph:1`, `h:10`, `h:1x`, `h:0` or `xh:1` can be mistaken for it. A LOOKAHEAD
 * rather than a consuming `(?:\s|$)` so two adjacent tokens cannot hide one
 * another (`h:1 h:1` — pathological, but it should still match).
 *
 * Case-insensitive, matching how the rest of this app reads metadata keys.
 * Only `h:1` counts: the ecosystem convention is that the tag is a flag, and
 * `h:0`/`h:2` are not "hide" — treating any `h:` value as truthy would hide
 * lines a user wrote `h:0` on to mean the opposite.
 */
const HIDDEN_TOKEN_RE = /(?:^|\s)h:1(?=\s|$)/i;

// ---------------------------------------------------------------------------
// Line introspection
// ---------------------------------------------------------------------------

/** True if the line carries a whole-token `h:1` tag. */
export function isHiddenLine(line: string): boolean {
  return HIDDEN_TOKEN_RE.test(line);
}

/**
 * True if a line participates in hidden treatment at all.
 *
 * Mirrors `isFilterable` (utils/filterExpr.ts) and `isThresholdable`
 * (utils/threshold.ts): blank / whitespace-only lines are structural spacers,
 * never decorated and never counted. Completed (`x `) lines are NOT excluded —
 * an `h:1` tag says "hide this line" regardless of its completion state, and
 * special-casing it here would make the chip's tally disagree with what the
 * decoration actually treats.
 */
export function isHideable(line: string): boolean {
  return line.trim() !== '';
}

/**
 * Tally `h:1` lines over a whole file for the status chip.
 *
 * `hidden` is 0 whenever `mode === 'show'`, so the chip renders straight from
 * this without re-checking the mode. Blank lines are excluded from BOTH
 * numbers, so "2/9" always means "2 of 9 real tasks".
 */
export function hiddenCounts(content: string, mode: HiddenMode): HiddenCounts {
  let hidden = 0;
  let total = 0;
  for (const line of content.split('\n')) {
    if (!isHideable(line)) continue;
    total += 1;
    if (mode !== 'show' && isHiddenLine(line)) hidden += 1;
  }
  return { hidden, total };
}

// ---------------------------------------------------------------------------
// Palette argument parsing
// ---------------------------------------------------------------------------

/** Words selecting the strong-dim treatment (the default). */
const DIM_WORDS = new Set([
  'dim',
  'dimmed',
  'fade',
  'faded',
  'on',
  'yes',
  'true',
  '1',
]);
/** Words selecting outright removal from view. */
const HIDE_WORDS = new Set(['hide', 'hidden', 'collapse', 'gone', 'remove']);
/** Words turning all treatment off. */
const SHOW_WORDS = new Set([
  'show',
  'shown',
  'reveal',
  'off',
  'no',
  'false',
  '0',
  'all',
  'clear',
  'none',
]);
/** Words flipping between "treated" and "shown". */
const TOGGLE_WORDS = new Set(['toggle', 'flip']);

/**
 * Parse the `hidden` command's argument.
 *
 * Returns `'toggle'` for an empty argument. With THREE states a cycle would be
 * ambiguous — a user pressing bare `hidden` almost always means "get these
 * back" or "put these away", not "escalate me to the next strength" — so bare
 * `hidden` flips between `show` and whatever treatment applies, and the
 * strength is chosen explicitly with `hidden dim` / `hidden hide`. The page
 * resolves the flip because a pure `apply()` cannot see the current mode.
 *
 * `on`/`yes`/`true`/`1` map to `dim` rather than `hide`: they mean "turn the
 * default treatment on", and the default must never be the destructive-looking
 * one. Anything unrecognized throws, so a typo'd `hidden hied` complains
 * instead of silently doing something else.
 */
export function parseHiddenArg(raw: string | undefined): HiddenMode | 'toggle' {
  const arg = (raw ?? '').trim().toLowerCase();
  if (arg === '' || TOGGLE_WORDS.has(arg)) return 'toggle';
  if (DIM_WORDS.has(arg)) return 'dim';
  if (HIDE_WORDS.has(arg)) return 'hide';
  if (SHOW_WORDS.has(arg)) return 'show';
  throw new Error(
    `expected dim, hide or show (or no argument to toggle) — got "${raw}"`,
  );
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

/** localStorage key holding the hidden mode. */
export const HIDDEN_STORAGE_KEY = 'todo-txt.hidden.v1';

/**
 * Read the persisted mode, defaulting to `'dim'`.
 *
 * Falls back to the DEFAULT on any doubt — absent key, unknown value, storage
 * throwing. Note which way that fallback points: a corrupt value resolves to
 * `dim` (nothing leaves the view) and never to `hide`, so a storage glitch can
 * never be the reason a user's tasks appear to be missing.
 */
export function loadStoredHiddenMode(): HiddenMode {
  try {
    const raw = localStorage.getItem(HIDDEN_STORAGE_KEY);
    if (raw === 'show' || raw === 'hide' || raw === 'dim') return raw;
    return DEFAULT_HIDDEN_MODE;
  } catch {
    return DEFAULT_HIDDEN_MODE;
  }
}

/** Persist the mode. The default removes the key rather than storing it. */
export function storeHiddenMode(mode: HiddenMode): void {
  try {
    if (mode === DEFAULT_HIDDEN_MODE) localStorage.removeItem(HIDDEN_STORAGE_KEY);
    else localStorage.setItem(HIDDEN_STORAGE_KEY, mode);
  } catch {
    // Private-browsing / quota-exceeded: the mode still works for the rest of
    // this page load, it just will not survive a reload. Not worth a toast.
  }
}
