/**
 * filterExpr — the filter-expression layer.
 *
 * A *filter* narrows what the user is looking at WITHOUT touching the file.
 * The editor stays fully editable; non-matching lines are merely dimmed by a
 * CodeMirror line decoration (see components/cm-todotxt-filter.ts). Nothing in
 * this module mutates anything — it parses an expression into terms and answers
 * "does this line match?".
 *
 * Grammar (whitespace-separated terms, implicitly AND'ed):
 *
 *   @ctx            line carries the `@ctx` context token
 *   +proj           line carries the `+proj` project token
 *   pri:A           line has priority A
 *   pri:A-C         line has priority in the inclusive range A..C
 *   due:today       line has `due:` equal to today
 *   due:overdue     line has `due:` strictly before today
 *   due:<=7d        line has `due:` at or before today+7 days
 *   anything else   case-insensitive substring of the raw line
 *   -term           negation of any of the above
 *
 * Design decisions worth knowing:
 *
 *   - Terms are AND'ed, never OR'ed. `@work @urgent` means both. This matches
 *     todo.sh's `list` semantics, which the palette's `list` verb already
 *     follows, so the two surfaces do not disagree.
 *   - `pri:` reads BOTH the canonical `(A) ` prefix and a trailing `pri:A`
 *     tag, because this app round-trips priority through `pri:X` when a task
 *     is completed (see markLineDone / applyDo). Without the tag branch,
 *     `filter pri:A` would silently miss every completed A-priority task on
 *     the done tab.
 *   - `due:overdue` is purely date-based (due < today) and does NOT exclude
 *     completed lines. A term describes the LINE, not a workflow state; the
 *     user composes `due:overdue -x` themselves if they want that. Keeping
 *     each term independent is what makes negation predictable.
 *   - `due:<=Nd` includes already-overdue lines (any due date <= today+N).
 *     "Due within a week" naturally covers "was due yesterday".
 *   - Matching is case-insensitive throughout, including `@ctx` / `+proj`
 *     token matching, which is whole-token (so `@work` does not match
 *     `@workshop`).
 *   - Blank lines are NOT this module's problem: callers skip them (they are
 *     structural spacers, never dimmed and never counted). `isFilterable`
 *     exists so every caller agrees on that rule.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single parsed term. `raw` is the source token, kept for diagnostics. */
export type FilterTerm =
  | { kind: 'context'; negate: boolean; raw: string; value: string }
  | { kind: 'project'; negate: boolean; raw: string; value: string }
  | { kind: 'priority'; negate: boolean; raw: string; lo: string; hi: string }
  | {
      kind: 'due';
      negate: boolean;
      raw: string;
      /** `today` / `overdue` compare against today; `within` uses `days`. */
      mode: 'today' | 'overdue' | 'within';
      days: number;
    }
  | { kind: 'text'; negate: boolean; raw: string; value: string };

/** A validated filter: the normalized source plus its parsed terms. */
export interface ParsedFilter {
  /** Source expression, whitespace-normalized to single spaces. */
  source: string;
  /** Parsed terms, in source order. AND'ed at match time. */
  terms: FilterTerm[];
}

/** Match tally for the status chip: `matched` of `total` non-blank lines. */
export interface FilterCounts {
  matched: number;
  total: number;
}

// ---------------------------------------------------------------------------
// Line-shape patterns (kept local — mirrors utils/todotxt.ts)
// ---------------------------------------------------------------------------

/** `(A) ` priority prefix on an incomplete line. */
const PRIORITY_PREFIX_RE = /^\(([A-Z])\)\s/;
/** `pri:A` tag — this app's completed-line priority round-trip form. */
const PRI_TAG_RE = /(?:^|\s)pri:([A-Za-z])(?=\s|$)/;
/** `due:YYYY-MM-DD` metadata token. */
const DUE_TOKEN_RE = /(?:^|\s)due:(\d{4}-\d{2}-\d{2})(?=\s|$)/i;
/** `<=Nd` / `<=N` relative-day form of a `due:` term. */
const WITHIN_RE = /^<=(\d{1,5})d?$/;

/** Words that clear the active filter instead of setting one. */
const CLEAR_KEYWORDS = new Set(['clear', 'off', 'none', 'reset']);

// ---------------------------------------------------------------------------
// Small pure helpers
// ---------------------------------------------------------------------------

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Today in the user's LOCAL calendar as `YYYY-MM-DD`.
 *
 * Local, not UTC — every other date producer in this app (commands.ts,
 * shortcuts.ts, the decoration plugin) stamps the local day, and a filter that
 * disagreed with the `due:` dates the app itself writes would mark a
 * just-created "due today" task as overdue for users east of UTC.
 */
export function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/**
 * Add `days` calendar days to a `YYYY-MM-DD` string.
 *
 * Arithmetic runs in UTC so a DST transition inside the window cannot shift
 * the result by a day; the input and output are bare calendar dates with no
 * time component, so UTC is purely a stable counting frame here.
 */
export function addDaysIso(iso: string, days: number): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) throw new Error(`addDaysIso: expected YYYY-MM-DD, got "${iso}"`);
  const base = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const shifted = new Date(base + days * 86_400_000);
  return (
    `${shifted.getUTCFullYear()}-` +
    `${pad2(shifted.getUTCMonth() + 1)}-${pad2(shifted.getUTCDate())}`
  );
}

/** True if `raw` is a "turn the filter off" word rather than an expression. */
export function isFilterClearKeyword(raw: string): boolean {
  return CLEAR_KEYWORDS.has(raw.trim().toLowerCase());
}

/**
 * True if `iso` is a real calendar date, not merely `\d{4}-\d{2}-\d{2}`-shaped.
 *
 * The token regexes across this app accept the SHAPE, which lets
 * `2026-02-31`, `2026-13-01` and `0000-00-00` through. Every layer that turns
 * a date into a CLAIM about the task — the red overdue tint, a `due:` filter
 * term, `threshold hide` — has to reject those, because a naive string
 * comparison happily calls `0000-00-00` overdue and `9999-99-99` a future
 * threshold. Two equally malformed tokens would otherwise get opposite
 * treatment purely by lexicographic accident.
 *
 * Lives HERE, in the leaf module, rather than in utils/dueStatus (which
 * re-exports it for its existing callers): dueStatus already depends on this
 * file for `lineDue`, so defining it there and importing it back would make
 * the two modules circular.
 *
 * UTC on purpose: this is a pure calendar-validity check on three integers, so
 * it must not depend on the host's timezone offset. Round-tripping through
 * `Date` is the cheapest check that rejects both an impossible month and an
 * impossible day (JS `Date` rolls `2026-02-31` forward to March 3, so the
 * components stop matching).
 */
export function isRealIsoDate(iso: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return false;
  const [year, month, day] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const d = new Date(Date.UTC(year, month - 1, day));
  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() === month - 1 &&
    d.getUTCDate() === day
  );
}

/**
 * True if a line participates in filtering at all. Blank / whitespace-only
 * lines are structural spacers: never dimmed, never counted.
 */
export function isFilterable(line: string): boolean {
  return line.trim() !== '';
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

function parsePriorityTerm(
  body: string,
  negate: boolean,
  raw: string,
): FilterTerm {
  const b = body.trim().toUpperCase();
  if (/^[A-Z]$/.test(b)) {
    return { kind: 'priority', negate, raw, lo: b, hi: b };
  }
  const range = /^([A-Z])-([A-Z])$/.exec(b);
  if (range) {
    const [, lo, hi] = range;
    if (lo > hi) {
      throw new Error(
        `pri: range "${body}" is reversed — did you mean pri:${hi}-${lo}?`,
      );
    }
    return { kind: 'priority', negate, raw, lo, hi };
  }
  throw new Error(
    `pri: expected a letter or a range (pri:A, pri:A-C) — got "${body}"`,
  );
}

function parseDueTerm(body: string, negate: boolean, raw: string): FilterTerm {
  const b = body.trim().toLowerCase();
  if (b === 'today') return { kind: 'due', negate, raw, mode: 'today', days: 0 };
  if (b === 'overdue') {
    return { kind: 'due', negate, raw, mode: 'overdue', days: 0 };
  }
  const within = WITHIN_RE.exec(b);
  if (within) {
    return {
      kind: 'due',
      negate,
      raw,
      mode: 'within',
      days: Number.parseInt(within[1], 10),
    };
  }
  throw new Error(
    `due: expected today, overdue, or <=Nd (e.g. due:<=7d) — got "${body}"`,
  );
}

function parseTerm(raw: string): FilterTerm {
  let negate = false;
  let body = raw;
  if (body.startsWith('-')) {
    negate = true;
    body = body.slice(1);
    if (body === '') {
      throw new Error('"-" is not a term — negate something, e.g. -@waiting');
    }
  }

  // `@ctx` / `+proj` need a payload; a lone `@` or `+` is plain text.
  if (body.startsWith('@') && body.length > 1) {
    return { kind: 'context', negate, raw, value: body.slice(1) };
  }
  if (body.startsWith('+') && body.length > 1) {
    return { kind: 'project', negate, raw, value: body.slice(1) };
  }

  const pri = /^pri:(.*)$/i.exec(body);
  if (pri) return parsePriorityTerm(pri[1], negate, raw);

  const due = /^due:(.*)$/i.exec(body);
  if (due) return parseDueTerm(due[1], negate, raw);

  return { kind: 'text', negate, raw, value: body };
}

/**
 * Parse a filter expression into terms.
 *
 * Throws on an empty expression or an unparseable `pri:` / `due:` term —
 * the palette turns the thrown message into an error toast, which is the
 * whole point of validating eagerly: a typo'd `due:tomorow` must complain
 * rather than silently dim every line.
 */
export function parseFilterExpr(expr: string): ParsedFilter {
  const raws = (expr ?? '')
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0);
  if (raws.length === 0) {
    throw new Error(
      'an expression is required — try @home, +proj, pri:A-C, due:overdue, ' +
        'or "filter clear"',
    );
  }
  return { source: raws.join(' '), terms: raws.map(parseTerm) };
}

/** Parse without throwing. Returns null for an empty or invalid expression. */
export function tryParseFilterExpr(expr: string): ParsedFilter | null {
  try {
    return parseFilterExpr(expr);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Line introspection
// ---------------------------------------------------------------------------

/** Whole-token, case-insensitive presence test for `@ctx` / `+proj`. */
function hasToken(line: string, token: string): boolean {
  return new RegExp(`(^|\\s)${escapeRegExp(token)}(?=\\s|$)`, 'i').test(line);
}

/**
 * Priority letter for a line, or null. Reads the canonical `(A) ` prefix
 * first, then falls back to a `pri:A` tag (completed-line round-trip form).
 */
export function linePriority(line: string): string | null {
  const prefix = PRIORITY_PREFIX_RE.exec(line);
  if (prefix) return prefix[1];
  const tag = PRI_TAG_RE.exec(line);
  return tag ? tag[1].toUpperCase() : null;
}

/** `due:` date for a line as `YYYY-MM-DD`, or null. */
export function lineDue(line: string): string | null {
  const m = DUE_TOKEN_RE.exec(line);
  return m ? m[1] : null;
}

// ---------------------------------------------------------------------------
// Matching
// ---------------------------------------------------------------------------

/** Evaluate one term against a line, ignoring its `negate` flag. */
function termHits(line: string, term: FilterTerm, today: string): boolean {
  switch (term.kind) {
    case 'context':
      return hasToken(line, `@${term.value}`);
    case 'project':
      return hasToken(line, `+${term.value}`);
    case 'priority': {
      const p = linePriority(line);
      return p !== null && p >= term.lo && p <= term.hi;
    }
    case 'due': {
      const due = lineDue(line);
      // An unparseable date is treated exactly like a MISSING one, so
      // `due:overdue` never surfaces a deadline the editor itself refuses to
      // paint red (see isRealIsoDate, and the "does not tint an invalid date"
      // case in cm-todotxt-due.test.tsx). Without this gate a string compare
      // would call `due:0000-00-00` overdue, and `due:2026-02-29` — a leap day
      // that does not exist in 2026 — overdue too.
      if (due === null || !isRealIsoDate(due)) return false;
      if (term.mode === 'today') return due === today;
      if (term.mode === 'overdue') return due < today;
      return due <= addDaysIso(today, term.days);
    }
    case 'text':
      return line.toLowerCase().includes(term.value.toLowerCase());
  }
}

/**
 * True if `line` satisfies every term (negated terms must NOT hit).
 *
 * A filter with zero terms matches everything — callers that mean "no filter"
 * should pass `null` rather than an empty ParsedFilter, but this keeps the
 * degenerate case from dimming the whole document.
 */
export function matchesFilter(
  line: string,
  filter: ParsedFilter,
  today: string = todayIso(),
): boolean {
  for (const term of filter.terms) {
    const hit = termHits(line, term, today);
    if (term.negate ? hit : !hit) return false;
  }
  return true;
}

/**
 * Tally matches over a whole file for the status chip. Blank lines are
 * excluded from BOTH numbers so "3/8" always means "3 of 8 real tasks".
 */
export function filterCounts(
  content: string,
  filter: ParsedFilter | null,
  today: string = todayIso(),
): FilterCounts {
  let matched = 0;
  let total = 0;
  for (const line of content.split('\n')) {
    if (!isFilterable(line)) continue;
    total += 1;
    if (filter === null || matchesFilter(line, filter, today)) matched += 1;
  }
  return { matched, total };
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

/** localStorage key holding the active filter expression (raw string). */
export const FILTER_STORAGE_KEY = 'todo-txt.filter.v1';

/**
 * Read the persisted filter expression, or null when absent/invalid.
 *
 * Validated by re-parsing: a stored expression written by an older grammar
 * (or hand-edited in devtools) is dropped rather than restored as a filter
 * that dims lines by rules the current build no longer implements.
 */
export function loadStoredFilter(): string | null {
  try {
    const raw = localStorage.getItem(FILTER_STORAGE_KEY);
    if (raw === null || raw.trim() === '') return null;
    const parsed = tryParseFilterExpr(raw);
    return parsed === null ? null : parsed.source;
  } catch {
    return null;
  }
}

/** Persist (or clear, when `expr` is null) the active filter expression. */
export function storeFilter(expr: string | null): void {
  try {
    if (expr === null) localStorage.removeItem(FILTER_STORAGE_KEY);
    else localStorage.setItem(FILTER_STORAGE_KEY, expr);
  } catch {
    // Private-browsing / quota-exceeded: the filter still works for the rest
    // of this page load, it just will not survive a reload. Not worth a toast.
  }
}
