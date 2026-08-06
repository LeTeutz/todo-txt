/**
 * Command registry for the todo-txt command palette (⌘K / Ctrl+K).
 *
 * Defines the `Command` interface, the argument schema types, the
 * `NotImplementedError` sentinel, and the `COMMANDS` array — one entry per
 * todo.sh CLI verb. The verbs fall into four groups:
 *
 *   - deterministic:    add, append, del, depri, do, prepend, pri,
 *                       replace, sort
 *   - filter / list:    list, listall, listcon, listpri, listproj,
 *                       listfile
 *   - file-crossing:    archive, move, report
 *   - help:             help
 *
 * Reference: https://github.com/todotxt/todo.txt-cli
 */

/** Which of the three todo-txt files a command operates on. */
export type TodoFile = 'todo' | 'done' | 'report';

// Starter-template content is a simple string, defined in a sibling
// module so both TodoTxtPage (empty-state card) and the palette
// (`example` command) share one source of truth.
import { STARTER_EXAMPLE } from './starterExample';
import { isFilterClearKeyword, parseFilterExpr } from './filterExpr';
import { nextRecurrenceLine } from './recurrence';
import { parseThresholdArg, type ThresholdMode } from './threshold';
import { parseHiddenArg, type HiddenMode } from './hidden';
import { parseSetRootArg } from './settings';

/** Primitive types accepted by command arguments. */
export type ArgType = 'string' | 'number' | 'priority' | 'file';

/** Single argument descriptor used for palette argument prompts. */
export interface ArgDescriptor {
  /** Argument name shown in the palette (e.g. "item#", "priority"). */
  name: string;
  /** Expected primitive type for basic validation. */
  type: ArgType;
  /** If true, argument may be omitted. Defaults to required. */
  optional?: boolean;
  /** One-line help shown next to the input. */
  description?: string;
}

/** Declarative argument schema for a command. */
export type ArgSchema = ArgDescriptor[];

/**
 * Result descriptor returned by a command's `apply()`.
 *
 * Shapes:
 *   - `mutation`      -- deterministic in-file text change; palette writes
 *                        `content` back to the active file.
 *   - `filter`        -- non-mutating filter/list view; palette renders
 *                        `lines` in a read-only panel.
 *   - `aggregate`     -- non-mutating counts/summary; palette renders
 *                        `groups` (e.g. "+project -> count").
 *   - `server-action` -- command requires a backend call (archive, move,
 *                        report). Palette dispatcher performs the fetch.
 *   - `info`          -- informational output (help, version). Palette
 *                        renders `text` in a modal.
 *
 * Later tasks refine these shapes; they are defined here so stubs can
 * return the right type once implemented.
 */
export type ApplyResult =
  | { type: 'mutation'; content: string }
  | {
      type: 'filter';
      lines: Array<{ index: number; text: string }>;
      title: string;
    }
  | {
      type: 'aggregate';
      groups: Array<{ key: string; count: number }>;
      title: string;
    }
  | {
      type: 'server-action';
      endpoint: string;
      method: 'GET' | 'POST' | 'PUT' | 'DELETE';
      body?: unknown;
    }
  | { type: 'info'; text: string }
  // Request that the palette dispatcher switch the active file tab to
  // `target` and show that file's contents. Used by `listfile`; the pure
  // `apply()` cannot fetch the other file itself, so it returns this
  // descriptor and the dispatcher handles the tab switch via the
  // existing onFileChange / GET /api/file pipeline.
  | { type: 'switch-file'; target: TodoFile }
  // Set (or, with `expr: null`, clear) the in-editor dim filter. Used by
  // `filter`. `apply()` validates the expression and hands back the
  // normalized source; the page owns the React state, the localStorage
  // write, and the CodeMirror reconfiguration.
  | { type: 'set-filter'; expr: string | null }
  // Set the `t:` threshold view mode, or flip it with `mode: 'toggle'`.
  // Used by `threshold`. Same division of labour as `set-filter`: apply()
  // validates the argument, the page owns state / storage / CodeMirror.
  // `'toggle'` is resolved by the page because a pure apply() cannot see
  // which mode is currently active.
  | { type: 'set-threshold'; mode: ThresholdMode | 'toggle' }
  // Set the `h:1` view mode, or flip it with `mode: 'toggle'`. Used by
  // `hidden`. Same division of labour as `set-filter` / `set-threshold`:
  // apply() validates the argument, the page owns state / storage / CodeMirror,
  // and resolves `'toggle'` because a pure apply() cannot see the current mode.
  | { type: 'set-hidden'; mode: HiddenMode | 'toggle' }
  // Point the app at another directory (`root`), or restore the app-data
  // default (`root: null`). Used by `set-root`. Unlike the view variants above
  // this one crosses the network: the page PUTs /api/settings and the BACKEND
  // owns the path policy — see utils/settings.ts for why the client
  // deliberately does not re-implement it.
  | { type: 'set-root'; root: string | null }
  // Report where the app is currently reading and writing. Used by `where`.
  // A separate variant rather than an `info` result because the text is only
  // knowable after a GET /api/settings, and `apply()` cannot fetch.
  | { type: 'show-root' };

/**
 * A palette command.
 *
 * `apply()` takes the current file contents, the parsed arguments (in
 * schema order), and the active file name. It must be a pure function
 * for `mutation` / `filter` / `aggregate` / `info` results; `server-
 * action` results are descriptors only (the dispatcher performs I/O).
 */
export interface Command {
  /** Canonical verb, matching todo.sh (e.g. "listproj"). */
  name: string;
  /** Optional short alias (e.g. "do" -> "x", "list" -> "ls"). */
  shortName?: string;
  /** Human-readable one-line description shown in the palette. */
  description: string;
  /** Declarative argument schema. Empty array = no args. */
  argSchema: ArgSchema;
  /** Execute the command. Stubs throw `NotImplementedError`. */
  apply(content: string, args: string[], file: TodoFile): ApplyResult;
}

/**
 * Thrown by an `apply()` that has no in-palette implementation — `help` is
 * handled by the page's own help surface rather than as a text mutation.
 * Keeping a dedicated error class lets the palette dispatcher distinguish
 * "this verb is not a palette mutation" from other runtime errors.
 */
export class NotImplementedError extends Error {
  constructor(commandName: string) {
    super(`NotImplementedError: command "${commandName}" is not yet implemented`);
    this.name = 'NotImplementedError';
  }
}

/** Helper used by every stub below. */
function stub(name: string): (content: string, args: string[], file: TodoFile) => ApplyResult {
  return (_content: string, _args: string[], _file: TodoFile): ApplyResult => {
    throw new NotImplementedError(name);
  };
}

/**
 * Compose a palette error-toast string, deduplicating a leading
 * `${cmdName}: ` prefix that the thrown Error may already carry.
 *
 * Palette double-prefix dedup: every deterministic command in this
 * module already throws with a `${cmd.name}: ` prefix (pattern dating
 * to the original CLI parity -- `add: text is required`, `pri: priority
 * must be A-Z`, etc). The palette dispatcher separately prepends
 * `${cmd.name}: ` before toasting. Without this dedup, toasts render
 * as `listfile: listfile: unknown file ...`.
 *
 * Failure mode to know about: if a command is ever introduced that
 * throws with a DIFFERENT command's name prefix (not currently a
 * pattern in this registry), this check would incorrectly strip that
 * other command's prefix and render as e.g. `listfile: add: text is
 * required`. If that pattern is introduced later, replace this helper
 * with explicit per-command dedup OR -- preferred -- drop the
 * prefixes from the throws entirely so the dispatcher is the single
 * source of truth.
 *
 * Exported so the regression test in commands.test.ts can exercise it
 * without mounting the React component.
 */
export function formatCommandErrorToast(cmdName: string, message: string): string {
  const prefix = `${cmdName}: `;
  return message.startsWith(prefix) ? message : `${prefix}${message}`;
}

// ===========================================================================
// Deterministic command implementations.
//
// All implementations below are pure (no I/O), operate on the entire file
// `content` string, and preserve both the trailing newline (if any) and any
// interior blank lines. Item numbers are 1-indexed and reference the file's
// line position (matching todo.sh semantics: `sed -n "${ITEM}p"`).
// ===========================================================================

/**
 * Split a file's contents into lines, recording whether the original ended
 * with a newline. Using `splitLines` + `joinLines` round-trips identity.
 *
 * Exported because it is the app's ONE definition of "a trailing newline is a
 * terminator, not a line". Any surface that reorders or rewrites whole lines —
 * the palette's `sort`, the vim `\s` leader — imports this pair rather than
 * carrying its own `split('\n')` / `join('\n')`, which would sort the
 * terminator into the middle of the file as a blank line.
 */
export function splitLines(content: string): { lines: string[]; trailingNewline: boolean } {
  if (content.length === 0) return { lines: [], trailingNewline: false };
  const trailingNewline = content.endsWith('\n');
  const body = trailingNewline ? content.slice(0, -1) : content;
  return { lines: body.split('\n'), trailingNewline };
}

/** Re-join lines, reproducing the original trailing-newline shape. */
export function joinLines(lines: string[], trailingNewline: boolean): string {
  if (lines.length === 0) return trailingNewline ? '\n' : '';
  return lines.join('\n') + (trailingNewline ? '\n' : '');
}

/** Ensure item# is a 1-indexed integer in range [1, lines.length]. */
function assertItemInRange(index: number, lines: string[], cmd: string): void {
  if (!Number.isInteger(index) || index < 1 || index > lines.length) {
    throw new Error(`${cmd}: item# ${index} out of range (1..${lines.length})`);
  }
}

/** Parse item# argument from args[0]. Throws on non-integer. */
function parseItemNum(raw: string | undefined, cmd: string): number {
  const trimmed = (raw ?? '').trim();
  if (trimmed === '' || !/^-?\d+$/.test(trimmed)) {
    throw new Error(`${cmd}: item# must be an integer, got "${raw}"`);
  }
  return Number.parseInt(trimmed, 10);
}

/** Matches a priority prefix at the start of a line: "(A) ". */
const PRIORITY_PREFIX_RE = /^\(([A-Z])\) /;

/** Matches a completion-marker prefix at the start of a line: "x YYYY-MM-DD ". */
const DONE_PREFIX_RE = /^x \d{4}-\d{2}-\d{2} /;

/** Current LOCAL date in YYYY-MM-DD. Pulled through a function so tests may mock.
 *
 * Local, not UTC: every other date producer in the app (shortcuts.ts,
 * cm-vim-todotxt.ts, the overdue-highlight cache) stamps the user's local
 * calendar day, and a task completed at 00:30 belongs to the day the user
 * experienced. `toISOString()` (UTC) lagged behind for users east of UTC
 * between local midnight and UTC midnight, so `do`/`add` stamped
 * yesterday's date. */
function currentDateIso(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

// --- add ------------------------------------------------------------------

function applyAdd(content: string, args: string[]): ApplyResult {
  const text = (args[0] ?? '').trim();
  if (text === '') throw new Error('add: text is required');
  const { lines, trailingNewline } = splitLines(content);
  lines.push(text);
  return { type: 'mutation', content: joinLines(lines, trailingNewline) };
}

// --- append ---------------------------------------------------------------

function applyAppend(content: string, args: string[]): ApplyResult {
  const item = parseItemNum(args[0], 'append');
  const text = (args[1] ?? '').trim();
  if (text === '') throw new Error('append: text is required');
  const { lines, trailingNewline } = splitLines(content);
  assertItemInRange(item, lines, 'append');
  const idx = item - 1;
  const existing = lines[idx];
  // Join with single space; collapse any resulting double spaces.
  const joined = existing === '' ? text : `${existing} ${text}`;
  lines[idx] = joined.replace(/ {2,}/g, ' ');
  return { type: 'mutation', content: joinLines(lines, trailingNewline) };
}

// --- prepend --------------------------------------------------------------

function applyPrepend(content: string, args: string[]): ApplyResult {
  const item = parseItemNum(args[0], 'prepend');
  const text = (args[1] ?? '').trim();
  if (text === '') throw new Error('prepend: text is required');
  const { lines, trailingNewline } = splitLines(content);
  assertItemInRange(item, lines, 'prepend');
  const idx = item - 1;
  const existing = lines[idx];

  // todo.sh convention: if the line starts with "(A) ", insert the prepended
  // text AFTER the priority prefix so that priority stays at column 0.
  const priMatch = PRIORITY_PREFIX_RE.exec(existing);
  if (priMatch) {
    const pri = priMatch[0];
    const rest = existing.slice(pri.length);
    lines[idx] = rest === '' ? `${pri}${text}` : `${pri}${text} ${rest}`;
  } else if (existing === '') {
    lines[idx] = text;
  } else {
    lines[idx] = `${text} ${existing}`;
  }
  return { type: 'mutation', content: joinLines(lines, trailingNewline) };
}

// --- del ------------------------------------------------------------------

function applyDel(content: string, args: string[]): ApplyResult {
  const item = parseItemNum(args[0], 'del');
  const term = args[1];
  const { lines, trailingNewline } = splitLines(content);
  assertItemInRange(item, lines, 'del');
  const idx = item - 1;

  if (term === undefined || term === '') {
    // Remove the whole line.
    lines.splice(idx, 1);
  } else {
    // Remove ALL whole-word occurrences of `term` (case-insensitive, global).
    // Do NOT trim leading whitespace.
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(?:^|(?<=\\s))${escaped}(?=\\s|$)`, 'gi');
    lines[idx] = lines[idx].replace(re, '').replace(/ {2,}/g, ' ').trimEnd();
  }
  return { type: 'mutation', content: joinLines(lines, trailingNewline) };
}

// --- replace --------------------------------------------------------------

function applyReplace(content: string, args: string[]): ApplyResult {
  const item = parseItemNum(args[0], 'replace');
  const text = (args[1] ?? '').trim();
  if (text === '') throw new Error('replace: text is required');
  const { lines, trailingNewline } = splitLines(content);
  assertItemInRange(item, lines, 'replace');
  lines[item - 1] = text;
  return { type: 'mutation', content: joinLines(lines, trailingNewline) };
}

// --- do -------------------------------------------------------------------

/**
 * Mark item# done.
 *
 * Recurrence: when the line carries a live `rec:` tag and was NOT
 * already completed, the next instance is spliced in immediately AFTER the
 * completed line — the same placement every other "done" surface uses, so an
 * item number the user is reading off the screen still points where they
 * expect. `nextRecurrenceLine` owns the "should anything be generated?"
 * decision (blank / already-`x ` / no-or-malformed `rec:` all yield null), so
 * this stays a placement decision only.
 *
 * Note the next instance is computed from the PRE-completion line: it must
 * see the original `(A) ` prefix and the original `due:` / `t:` values, which
 * completion rewrites.
 */
function applyDo(content: string, args: string[]): ApplyResult {
  const item = parseItemNum(args[0], 'do');
  const { lines, trailingNewline } = splitLines(content);
  assertItemInRange(item, lines, 'do');
  const idx = item - 1;
  let line = lines[idx];

  // Blank-line guard: no-op on empty/whitespace-only lines.
  if (line.trim() === '') {
    return { type: 'mutation', content: joinLines(lines, trailingNewline) };
  }

  // Idempotent on already-done lines.
  if (DONE_PREFIX_RE.test(line)) {
    return { type: 'mutation', content: joinLines(lines, trailingNewline) };
  }

  const today = currentDateIso();
  const recurred = nextRecurrenceLine(line, today);

  // Preserve priority as pri:X tag before stripping.
  const priMatch = PRIORITY_PREFIX_RE.exec(line);
  const pri = priMatch ? priMatch[1] : null;
  line = line.replace(PRIORITY_PREFIX_RE, '');
  const completed = `x ${today} ${line}`;
  lines[idx] = pri ? `${completed} pri:${pri}` : completed;
  if (recurred !== null) lines.splice(idx + 1, 0, recurred);
  return { type: 'mutation', content: joinLines(lines, trailingNewline) };
}

// --- pri ------------------------------------------------------------------

function applyPri(content: string, args: string[]): ApplyResult {
  const item = parseItemNum(args[0], 'pri');
  const priRaw = (args[1] ?? '').trim().toUpperCase();
  if (!/^[A-Z]$/.test(priRaw)) {
    throw new Error(`pri: priority must be A-Z, got "${args[1]}"`);
  }
  const { lines, trailingNewline } = splitLines(content);
  assertItemInRange(item, lines, 'pri');
  const idx = item - 1;
  const line = lines[idx];
  if (/^x\s/.test(line)) {
    // Completed task: todo.txt stores priority as a `pri:X` tag, not a
    // `(X)` prefix (an `x`-prefixed line with a leading `(X)` is invalid).
    // Mirror the round-trip form written by `do`.
    const withoutTag = line
      .replace(/(^|\s)pri:[A-Z](?=\s|$)/, '$1')
      .replace(/\s+$/, '')
      .replace(/\s{2,}/g, ' ');
    lines[idx] = `${withoutTag} pri:${priRaw}`;
  } else {
    const withoutPri = line.replace(PRIORITY_PREFIX_RE, '');
    lines[idx] = `(${priRaw}) ${withoutPri}`;
  }
  return { type: 'mutation', content: joinLines(lines, trailingNewline) };
}

// --- depri ----------------------------------------------------------------

function applyDepri(content: string, args: string[]): ApplyResult {
  const item = parseItemNum(args[0], 'depri');
  const { lines, trailingNewline } = splitLines(content);
  assertItemInRange(item, lines, 'depri');
  const idx = item - 1;
  lines[idx] = lines[idx].replace(PRIORITY_PREFIX_RE, '');
  return { type: 'mutation', content: joinLines(lines, trailingNewline) };
}

// --- sort -----------------------------------------------------------------

type SortMode = 'priority' | 'date' | 'project' | 'context';

function applySort(content: string, args: string[]): ApplyResult {
  const modeRaw = (args[0] ?? 'priority').trim().toLowerCase();
  if (!['priority', 'date', 'project', 'context'].includes(modeRaw)) {
    throw new Error(
      `sort: unknown mode "${modeRaw}" (expected priority | date | project | context)`
    );
  }
  const mode = modeRaw as SortMode;
  const { lines, trailingNewline } = splitLines(content);

  // Lines with no matching entity sort to the end (HIGH key) and retain
  // relative order (stable).
  const HIGH = '\uFFFF';
  const keyed = lines.map((line, i) => {
    let key: string;
    switch (mode) {
      case 'priority': {
        const m = PRIORITY_PREFIX_RE.exec(line);
        key = m ? m[1] : HIGH;
        break;
      }
      case 'date': {
        const stripped = line.replace(PRIORITY_PREFIX_RE, '');
        const m = /^(\d{4}-\d{2}-\d{2})/.exec(stripped);
        key = m ? m[1] : HIGH;
        break;
      }
      case 'project': {
        const m = /\+(\S+)/.exec(line);
        key = m ? m[1] : HIGH;
        break;
      }
      case 'context': {
        const m = /@(\S+)/.exec(line);
        key = m ? m[1] : HIGH;
        break;
      }
    }
    return { line, key, i };
  });

  keyed.sort((a, b) => {
    if (a.key < b.key) return -1;
    if (a.key > b.key) return 1;
    return a.i - b.i;
  });

  return {
    type: 'mutation',
    content: joinLines(
      keyed.map((x) => x.line),
      trailingNewline
    ),
  };
}

// ===========================================================================
// Filter / list command implementations.
//
// All five commands below are non-mutating: they return either a `filter`
// view (`{ lines: {index, text}[], title }`) or an `aggregate` summary
// (`{ groups: {key, count}[], title }`). Line indexes are 1-based and refer
// to the position in the original file so callers can map a result back to
// the source line. Blank lines are skipped (matches `todo.sh list` /
// `todo.sh listall` behaviour -- sed+grep pipeline).
//
// Reference: https://github.com/todotxt/todo.txt-cli -- the usage section
// for list, listall, listcon, listproj, listpri.
// ===========================================================================

/** Escape a string for use inside a RegExp literal. */
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Collect non-blank lines from `content` together with their 1-indexed
 * position in the original file. Used by every filter / list command.
 *
 * "Blank" is `trim() === ''`, NOT `=== ''`. Every other surface in the app
 * already uses that definition — `isFilterable` (utils/filterExpr),
 * `isThresholdable` (utils/threshold), `isHideable` (utils/hidden), and
 * `applyDo`'s own blank-line guard a few hundred lines up. While this function
 * used the narrower `=== ''`, a whitespace-only line appeared in the result
 * panel as a NUMBERED but empty row that the user could click; `do` / the
 * chip tallies then disagreed with the panel about whether it was a task at
 * all, and acting on it reported success while changing nothing.
 *
 * The 1-based index is deliberately the line's REAL position, so skipping a
 * line never renumbers the ones after it — the panel feeds this index straight
 * to jump-to-line and to `do` / `del` / `move`.
 */
function enumerateNonBlank(content: string): Array<{ index: number; text: string }> {
  const { lines } = splitLines(content);
  const out: Array<{ index: number; text: string }> = [];
  lines.forEach((text, i) => {
    if (text.trim() !== '') out.push({ index: i + 1, text });
  });
  return out;
}

// --- list -----------------------------------------------------------------

/**
 * Parse filter terms: supports multiple space-separated terms with
 * implicit AND. Terms prefixed with `-` are negation (exclude).
 * Matching is case-insensitive.
 */
function matchesFilterTerms(text: string, terms: string[]): boolean {
  const lower = text.toLowerCase();
  for (const term of terms) {
    if (term.startsWith('-') && term.length > 1) {
      // Negation: line must NOT contain the term (without the `-` prefix)
      if (lower.includes(term.slice(1).toLowerCase())) return false;
    } else {
      // Positive: line must contain the term
      if (!lower.includes(term.toLowerCase())) return false;
    }
  }
  return true;
}

function applyList(content: string, args: string[]): ApplyResult {
  const raw = (args[0] ?? '').trim();
  const entries = enumerateNonBlank(content);
  if (raw === '') {
    return { type: 'filter', lines: entries, title: 'All active items' };
  }
  const terms = raw.split(/\s+/).filter((t) => t.length > 0);
  const lines = entries.filter((e) => matchesFilterTerms(e.text, terms));
  const title = `Items matching "${raw}"`;
  return { type: 'filter', lines, title };
}

// --- listall --------------------------------------------------------------

function applyListall(content: string, args: string[]): ApplyResult {
  const raw = (args[0] ?? '').trim();
  const entries = enumerateNonBlank(content);
  if (raw === '') {
    return { type: 'filter', lines: entries, title: 'All items (active + done)' };
  }
  const terms = raw.split(/\s+/).filter((t) => t.length > 0);
  const lines = entries.filter((e) => matchesFilterTerms(e.text, terms));
  const title = `All items matching "${raw}"`;
  return { type: 'filter', lines, title };
}

// --- listcon --------------------------------------------------------------

function applyListcon(content: string, args: string[]): ApplyResult {
  const raw = (args[0] ?? '').trim();
  const entries = enumerateNonBlank(content);

  if (raw === '') {
    // Aggregate every distinct @context, sorted alphabetically.
    const counts = new Map<string, number>();
    for (const { text } of entries) {
      const matches = text.match(/@\S+/g) ?? [];
      for (const m of matches) {
        counts.set(m, (counts.get(m) ?? 0) + 1);
      }
    }
    const groups = Array.from(counts.entries())
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
    return { type: 'aggregate', groups, title: 'All @contexts' };
  }

  // Filter by specific @context. Accept with or without leading '@'.
  const needle = raw.startsWith('@') ? raw : `@${raw}`;
  const needleRe = new RegExp(`(^|\\s)${escapeRegExp(needle)}(?=\\s|$)`);
  const lines = entries.filter((e) => needleRe.test(e.text));
  return { type: 'filter', lines, title: `Items with ${needle}` };
}

// --- listproj -------------------------------------------------------------

function applyListproj(content: string, args: string[]): ApplyResult {
  const raw = (args[0] ?? '').trim();
  const entries = enumerateNonBlank(content);

  if (raw === '') {
    const counts = new Map<string, number>();
    for (const { text } of entries) {
      const matches = text.match(/\+\S+/g) ?? [];
      for (const m of matches) {
        counts.set(m, (counts.get(m) ?? 0) + 1);
      }
    }
    const groups = Array.from(counts.entries())
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
    return { type: 'aggregate', groups, title: 'All +projects' };
  }

  // Filter by specific +project. Accept with or without leading '+'.
  const needle = raw.startsWith('+') ? raw : `+${raw}`;
  const needleRe = new RegExp(`(^|\\s)${escapeRegExp(needle)}(?=\\s|$)`);
  const lines = entries.filter((e) => needleRe.test(e.text));
  return { type: 'filter', lines, title: `Items with ${needle}` };
}

// --- listpri --------------------------------------------------------------

function applyListpri(content: string, args: string[]): ApplyResult {
  const raw = (args[0] ?? '').trim().toUpperCase();
  const entries = enumerateNonBlank(content);

  // No arg -> all prioritized items.
  if (raw === '') {
    const lines = entries.filter((e) => PRIORITY_PREFIX_RE.test(e.text));
    return { type: 'filter', lines, title: 'All prioritized items' };
  }

  let matches: (pri: string) => boolean;
  let title: string;

  if (/^[A-Z]$/.test(raw)) {
    matches = (p) => p === raw;
    title = `Items with priority ${raw}`;
  } else if (/^[A-Z]-[A-Z]$/.test(raw)) {
    const [lo, hi] = raw.split('-');
    if (lo > hi) {
      throw new Error(`listpri: range "${raw}" is reversed`);
    }
    matches = (p) => p >= lo && p <= hi;
    title = `Items with priority ${lo}..${hi}`;
  } else {
    throw new Error(
      `listpri: priority must be A-Z or a range A-C, got "${args[0]}"`
    );
  }

  const lines = entries.filter((e) => {
    const m = PRIORITY_PREFIX_RE.exec(e.text);
    return m !== null && matches(m[1]);
  });
  return { type: 'filter', lines, title };
}

// ===========================================================================
// File-crossing commands.
//
// `archive`, `move`, and `report` all require filesystem work that spans more
// than one file, so they do not fit the pure-function `mutation` shape. They
// return `server-action` descriptors; the palette dispatcher performs the
// fetch against the backend (archive + report endpoints are implemented in
// backend/todo_txt_handlers.py; `move` targets a dedicated endpoint that
// deletes from the source file and appends to the destination).
// ===========================================================================

/** archive: POST /apps/todo-txt/api/archive (empty body). */
function applyArchive(_content: string, _args: string[], _file: TodoFile): ApplyResult {
  return {
    type: 'server-action',
    endpoint: '/apps/todo-txt/api/archive',
    method: 'POST',
    body: {},
  };
}

/**
 * move: POST /apps/todo-txt/api/move with { item, from, to }.
 *
 * `from` is taken from the currently-active file (`file` arg), so the user
 * only supplies item# + destination. Destination must be "todo" or "done"
 * and must differ from the source file.
 */
function applyMove(_content: string, args: string[], file: TodoFile): ApplyResult {
  if (file !== 'todo' && file !== 'done') {
    throw new Error('move: switch to the todo or done tab first');
  }
  const item = parseItemNum(args[0], 'move');
  const destRaw = (args[1] ?? '').trim().toLowerCase();
  if (destRaw !== 'todo' && destRaw !== 'done') {
    throw new Error(`move: dest must be "todo" or "done", got "${args[1]}"`);
  }
  if (destRaw === file) {
    throw new Error(`move: source and destination are both "${file}"`);
  }
  return {
    type: 'server-action',
    endpoint: '/apps/todo-txt/api/move',
    method: 'POST',
    body: { item, from: file, to: destRaw },
  };
}

/** report: POST /apps/todo-txt/api/report/snapshot (empty body). */
function applyReport(_content: string, _args: string[], _file: TodoFile): ApplyResult {
  return {
    type: 'server-action',
    endpoint: '/apps/todo-txt/api/report/snapshot',
    method: 'POST',
    body: {},
  };
}

/** example: insert the starter template. Replaces current todo.txt
 *  content, which is destructive. The UI layer shows a success toast;
 *  the user can Ctrl+Z inside the textarea to revert the replacement. */
function applyExample(_content: string, _args: string[], _file: TodoFile): ApplyResult {
  return { type: 'mutation', content: STARTER_EXAMPLE };
}

// --- deduplicate ----------------------------------------------------------

/**
 * Remove duplicate lines, keeping the first occurrence. Blank lines are
 * never considered duplicates (they are structural spacers). Comparison
 * is exact (case-sensitive, whitespace-significant) to match todo.sh.
 */
function applyDeduplicate(content: string, _args: string[]): ApplyResult {
  const { lines, trailingNewline } = splitLines(content);
  const seen = new Set<string>();
  const deduped: string[] = [];
  for (const line of lines) {
    if (line.trim() === '') {
      deduped.push(line);
      continue;
    }
    if (seen.has(line)) continue;
    seen.add(line);
    deduped.push(line);
  }
  return { type: 'mutation', content: joinLines(deduped, trailingNewline) };
}

// ---------------------------------------------------------------------------
// listfile
//
// Switches the active file tab to the requested file (todo / done / report).
// Accepts one-letter aliases (t / d / r) for parity with todo.sh's single-
// character convention. This command does NOT fetch file contents itself --
// apply() is pure -- it returns a `switch-file` descriptor and the palette
// dispatcher performs the tab switch, which triggers the existing
// GET /apps/todo-txt/api/file pipeline that paints the editor.
//
// Error path: invalid names produce a thrown Error whose message is shown
// via the standard error-toast pipeline in TodoTxtPage.
// ---------------------------------------------------------------------------

/** Canonical file names plus short single-letter aliases. */
const LISTFILE_ALIASES: Record<string, TodoFile> = {
  todo: 'todo',
  done: 'done',
  report: 'report',
  t: 'todo',
  d: 'done',
  r: 'report',
};

function applyListfile(_content: string, args: string[], _file: TodoFile): ApplyResult {
  const raw = (args[0] ?? '').trim().toLowerCase();
  const target = LISTFILE_ALIASES[raw];
  if (!target) {
    // Do NOT prefix "listfile:" here -- the palette dispatcher wraps
    // every thrown error as `${cmd.name}: ${message}` before toasting,
    // which would produce a double prefix. Let the wrapper
    // own the prefix so the toast reads "listfile: unknown file ...".
    throw new Error(
      `unknown file "${args[0] ?? ''}" \u2014 valid: todo, done, report`,
    );
  }
  return { type: 'switch-file', target };
}

// ---------------------------------------------------------------------------
// filter
//
// `filter <expr>` dims every line that does not match `expr`; `filter clear`
// (or `filter` with no argument) removes it. Unlike `list`, which opens a
// read-only result panel, the filter leaves the user IN the editor with the
// whole file still editable -- see components/cm-todotxt-filter.ts.
//
// apply() only validates and normalizes. The expression is parsed here so a
// typo surfaces as an error toast at the moment the user submits it, rather
// than as a filter that silently dims every line. The page performs the state
// change, the localStorage write, and the CodeMirror reconfiguration.
// ---------------------------------------------------------------------------

function applyFilterCmd(
  _content: string,
  args: string[],
  _file: TodoFile,
): ApplyResult {
  const raw = (args[0] ?? '').trim();
  if (raw === '' || isFilterClearKeyword(raw)) {
    return { type: 'set-filter', expr: null };
  }
  // Throws on an unparseable pri:/due: term. No `filter: ` prefix here --
  // the dispatcher owns the prefix (see formatCommandErrorToast).
  const parsed = parseFilterExpr(raw);
  return { type: 'set-filter', expr: parsed.source };
}

// ---------------------------------------------------------------------------
// threshold
//
// `threshold hide` pushes every line whose `t:` date is in the FUTURE into the
// visual background; `threshold show` (the default) restores them. Bare
// `threshold` flips whichever mode is active — with only two states that is
// the useful default and keeps the toggle one palette entry away.
//
// Like `filter`, apply() only validates: it cannot read the current mode, so
// a toggle is returned as `mode: 'toggle'` for the page to resolve alongside
// the localStorage write and the CodeMirror reconfiguration.
// ---------------------------------------------------------------------------

function applyThresholdCmd(
  _content: string,
  args: string[],
  _file: TodoFile,
): ApplyResult {
  // Throws on an unrecognized word. No `threshold: ` prefix here — the
  // dispatcher owns the prefix (see formatCommandErrorToast).
  return { type: 'set-threshold', mode: parseThresholdArg(args[0]) };
}

// ---------------------------------------------------------------------------
// hidden
//
// `hidden dim` (the default) pushes `h:1` lines far into the visual background;
// `hidden hide` removes them from view entirely; `hidden show` restores them.
// Bare `hidden` flips between showing and treating — with three states a cycle
// would make a single keystroke ambiguous, and "get these back / put these
// away" is what the user actually means.
//
// Like `filter` and `threshold`, apply() only validates: it cannot read the
// current mode, so a flip is returned as `mode: 'toggle'` for the page to
// resolve alongside the localStorage write and the CodeMirror reconfiguration.
// ---------------------------------------------------------------------------

function applyHiddenCmd(
  _content: string,
  args: string[],
  _file: TodoFile,
): ApplyResult {
  // Throws on an unrecognized word. No `hidden: ` prefix here — the dispatcher
  // owns the prefix (see formatCommandErrorToast).
  return { type: 'set-hidden', mode: parseHiddenArg(args[0]) };
}

// ---------------------------------------------------------------------------
// set-root / where
//
// `set-root <dir>` points the app at a directory the user already keeps their
// todo.txt in; `set-root default` returns to the app's own data folder.
// `where` reports the active location.
//
// Both are thin: the path policy lives on the server (a client-side copy of a
// security rule is worth nothing, since the API is reachable without this UI),
// so apply() only rejects a MISSING argument — the one failure worth catching
// before spending a round-trip.
// ---------------------------------------------------------------------------

function applySetRoot(
  _content: string,
  args: string[],
  _file: TodoFile,
): ApplyResult {
  // Throws when no path was given. Deliberately NOT a toggle on a bare verb,
  // unlike the view commands above: a stray Enter must not be able to relocate
  // where the user's tasks are read from.
  return { type: 'set-root', root: parseSetRootArg(args[0]) };
}

function applyWhere(
  _content: string,
  _args: string[],
  _file: TodoFile,
): ApplyResult {
  return { type: 'show-root' };
}

/**
 * Every verb the palette supports (26) — the todo.sh set plus this app's
 * own view commands (`filter`, `threshold`, `hidden`), its location commands
 * (`set-root`, `where`) and conveniences (`example`, `deduplicate`).
 *
 * Order follows the grouping in the parent spec (add/append/prepend/...;
 * then list-family; then file-crossing; then meta). Order is significant
 * only for UI defaults; commands are looked up by name.
 */
export const COMMANDS: Command[] = [
  // --- Deterministic mutations ------------------------------------------
  {
    name: 'add',
    shortName: 'a',
    description: 'Add a new task to todo.txt.',
    argSchema: [{ name: 'text', type: 'string', description: 'Task text' }],
    apply: applyAdd,
  },
  {
    name: 'append',
    shortName: 'app',
    description: 'Append text to an existing item.',
    argSchema: [
      { name: 'item#', type: 'number', description: '1-indexed line number' },
      { name: 'text', type: 'string', description: 'Text to append' },
    ],
    apply: applyAppend,
  },
  {
    name: 'prepend',
    shortName: 'prep',
    description: 'Prepend text to an existing item.',
    argSchema: [
      { name: 'item#', type: 'number', description: '1-indexed line number' },
      { name: 'text', type: 'string', description: 'Text to prepend' },
    ],
    apply: applyPrepend,
  },
  {
    name: 'del',
    shortName: 'rm',
    description: 'Delete an item (or a term from an item).',
    argSchema: [
      { name: 'item#', type: 'number', description: '1-indexed line number' },
      { name: 'term', type: 'string', optional: true, description: 'Optional term to remove' },
    ],
    apply: applyDel,
  },
  {
    name: 'replace',
    description: 'Replace an item with new text.',
    argSchema: [
      { name: 'item#', type: 'number', description: '1-indexed line number' },
      { name: 'text', type: 'string', description: 'Replacement text' },
    ],
    apply: applyReplace,
  },
  {
    name: 'do',
    shortName: 'x',
    description: 'Mark an item as done.',
    argSchema: [{ name: 'item#', type: 'number', description: '1-indexed line number' }],
    apply: applyDo,
  },
  {
    name: 'pri',
    shortName: 'p',
    description: 'Set the priority of an item.',
    argSchema: [
      { name: 'item#', type: 'number', description: '1-indexed line number' },
      { name: 'priority', type: 'priority', description: 'A-Z' },
    ],
    apply: applyPri,
  },
  {
    name: 'depri',
    shortName: 'dp',
    description: 'Remove the priority from an item.',
    argSchema: [{ name: 'item#', type: 'number', description: '1-indexed line number' }],
    apply: applyDepri,
  },
  {
    name: 'sort',
    description: 'Sort items by priority / date / project / context.',
    argSchema: [
      {
        name: 'mode',
        type: 'string',
        optional: true,
        description: 'priority | date | project | context',
      },
    ],
    apply: applySort,
  },

  // --- Filter / list views ----------------------------------------------
  {
    name: 'list',
    shortName: 'ls',
    description: 'List active items, optionally filtered by term.',
    argSchema: [{ name: 'term', type: 'string', optional: true, description: 'Filter term' }],
    apply: applyList,
  },
  {
    name: 'listall',
    shortName: 'lsa',
    description: 'List both active and done items.',
    argSchema: [{ name: 'term', type: 'string', optional: true, description: 'Filter term' }],
    apply: applyListall,
  },
  {
    name: 'listcon',
    shortName: 'lsc',
    description: 'List all @contexts (or items for one @context).',
    argSchema: [
      { name: 'context', type: 'string', optional: true, description: 'Specific @context' },
    ],
    apply: applyListcon,
  },
  {
    name: 'listproj',
    shortName: 'lsprj',
    description: 'List all +projects (or items for one +project).',
    argSchema: [
      { name: 'project', type: 'string', optional: true, description: 'Specific +project' },
    ],
    apply: applyListproj,
  },
  {
    name: 'listpri',
    shortName: 'lsp',
    description: 'List items matching a priority (or range).',
    argSchema: [
      { name: 'priority', type: 'priority', optional: true, description: 'A-Z or range (A-C)' },
    ],
    apply: applyListpri,
  },
  {
    name: 'listfile',
    shortName: 'lf',
    description: 'List items from a specific file (todo / done / report).',
    argSchema: [{ name: 'file', type: 'file', description: 'todo | done | report' }],
    apply: applyListfile,
  },
  {
    name: 'filter',
    shortName: 'f',
    description:
      'Dim lines that do not match an expression — stays editable. `filter clear` removes it.',
    argSchema: [
      {
        name: 'expr',
        type: 'string',
        optional: true,
        description:
          '@ctx +proj pri:A pri:A-C due:today|overdue|<=7d text -negated — or "clear"',
      },
    ],
    apply: applyFilterCmd,
  },
  {
    name: 'threshold',
    shortName: 'th',
    description:
      'Push tasks whose t: date is still in the future into the background. `threshold show` restores them.',
    argSchema: [
      {
        name: 'mode',
        type: 'string',
        optional: true,
        description: 'hide | show — omit to toggle',
      },
    ],
    apply: applyThresholdCmd,
  },
  {
    name: 'hidden',
    shortName: 'h',
    description:
      'How h:1 lines look: dim (default), hide (out of view), or show. Omit the argument to flip.',
    argSchema: [
      {
        name: 'mode',
        type: 'string',
        optional: true,
        description: 'dim | hide | show — omit to toggle',
      },
    ],
    apply: applyHiddenCmd,
  },
  {
    name: 'set-root',
    description:
      'Point the app at a directory that holds your todo.txt. `set-root default` restores the app folder.',
    argSchema: [
      {
        name: 'dir',
        type: 'string',
        description:
          'absolute path inside your home directory — or "default"',
      },
    ],
    apply: applySetRoot,
  },
  {
    name: 'where',
    description: 'Show which directory todo.txt, done.txt and report.txt are read from.',
    argSchema: [],
    apply: applyWhere,
  },

  // --- File-crossing ----------------------------------------------------
  {
    name: 'archive',
    description: 'Move all done (x-prefixed) items from todo.txt to done.txt.',
    argSchema: [],
    apply: applyArchive,
  },
  {
    name: 'move',
    shortName: 'mv',
    description: 'Move an item between todo.txt and done.txt.',
    argSchema: [
      { name: 'item#', type: 'number', description: '1-indexed line number' },
      { name: 'dest', type: 'file', description: 'todo | done' },
    ],
    apply: applyMove,
  },
  {
    name: 'report',
    description: 'Snapshot active/done counts into report.txt.',
    argSchema: [],
    apply: applyReport,
  },

  // --- Meta -------------------------------------------------------------
  {
    name: 'deduplicate',
    shortName: 'dedup',
    description: 'Remove duplicate lines (keep first occurrence).',
    argSchema: [],
    apply: applyDeduplicate,
  },
  {
    name: 'help',
    shortName: '?',
    description: 'Show format spec and list of all commands.',
    argSchema: [],
    apply: stub('help'),
  },
  // --- Example template -------------------------------------------------
  {
    name: 'example',
    shortName: 'template',
    description:
      'Insert the starter example (priorities, projects, contexts, dates, recurring) — replaces current todo.txt content.',
    argSchema: [],
    apply: applyExample,
  },
];
