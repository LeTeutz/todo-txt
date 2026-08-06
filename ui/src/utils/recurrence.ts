/**
 * recurrence — the `rec:` (recurring task) layer (R2, half one).
 *
 * `rec:<pattern>` is the todo.txt ecosystem's recurring-task tag. Completing a
 * task that carries one should leave the completed line alone AND drop a fresh
 * instance of the task back into the file. Before this module the tag was
 * decorative: the starter template advertised `rec:1w`, the syntax highlighter
 * coloured it, and completing the task silently ended the series.
 *
 * ## Pattern grammar
 *
 *     rec:<count><unit>       non-strict — anchored on the COMPLETION date
 *     rec:+<count><unit>      strict     — anchored on the ORIGINAL due date
 *
 * `count` is a positive integer. `unit` is one of:
 *
 *     d   days
 *     w   weeks (7 days)
 *     m   calendar months, clamped to month end (Jan 31 +1m = Feb 28/29)
 *     y   calendar years, clamped (Feb 29 +1y = Feb 28)
 *     b   business days — Saturdays and Sundays are skipped
 *
 * A missing unit means days (`rec:3` = `rec:3d`), which is what the more
 * permissive readers in the ecosystem accept. Anything else — `rec:0d`,
 * `rec:weekly`, `rec:-2w` — parses to null, and a null recurrence simply means
 * "no next instance". Failing closed matters here: guessing at a pattern we do
 * not understand would write a task line the user never asked for.
 *
 * ## Strict vs non-strict, and why both exist
 *
 *   - `rec:2w` on a task you finish five days late gives you two weeks from
 *     TODAY. Right for chores ("water the plants every 3 days" — 3 days from
 *     when you actually watered them).
 *   - `rec:+2w` gives you two weeks from the date it was ORIGINALLY due, so a
 *     late completion does not drag the schedule. Right for fixed calendars
 *     ("rent is due on the 1st" — finishing late on the 4th must not move next
 *     month's due date to the 18th).
 *
 * ## The one delta rule
 *
 * A recurring task can carry both a `due:` and a `t:`, and the GAP between
 * them is meaningful ("remind me a week before it is due"). So the next
 * instance is computed as ONE day-delta applied to BOTH tokens:
 *
 *     primaryOld = due: ?? t:                  (the token that leads)
 *     base       = strict ? primaryOld : completionDate
 *     primaryNew = shift(base, count, unit)
 *     delta      = primaryNew - primaryOld     (in whole days)
 *     due:' = due: + delta        t:' = t: + delta
 *
 * For a strict pattern `base === primaryOld`, so the leading token lands
 * exactly on `shift(due:)`. For a non-strict pattern it lands exactly on
 * `shift(completionDate)`. Either way the due↔threshold gap survives, and a
 * month-unit shift stays a calendar month on the leading token instead of
 * being flattened into "30 days".
 *
 * If a line has NEITHER `due:` nor `t:`, the next instance carries no invented
 * deadline — it gets a fresh creation date and is available immediately.
 * Fabricating a `due:` the user never wrote would change the meaning of their
 * file, which is a worse failure than a task that shows up a bit early.
 *
 * Everything here is pure. `completeLineWithRecurrence` is the single shared
 * entry point every "done" surface calls (palette `do`, Ctrl/Cmd+D, the
 * selection popover, vim `\x`), so no surface can drift from the others.
 */
import { addDaysIso, lineDue } from './filterExpr';
import { addCreationDate, isComplete, markLineDone } from './todotxt';
import { lineThreshold } from './threshold';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Interval unit of a `rec:` pattern. */
export type RecUnit = 'd' | 'w' | 'm' | 'y' | 'b';

/** A parsed `rec:` pattern. */
export interface Recurrence {
  /** Source token value, without the `rec:` key. Kept for diagnostics. */
  raw: string;
  /** True for `rec:+2w` — anchor on the original due date, not completion. */
  strict: boolean;
  /** Interval count. Always >= 1. */
  count: number;
  /** Interval unit, normalized to lowercase. */
  unit: RecUnit;
}

// ---------------------------------------------------------------------------
// Patterns
// ---------------------------------------------------------------------------

/** `rec:<value>` metadata token, whole-token, anywhere in the line. */
const REC_TOKEN_RE = /(?:^|\s)rec:(\S+)(?=\s|$)/i;

/** A `rec:` value: optional `+`, a positive integer, an optional unit. */
const REC_VALUE_RE = /^(\+?)(\d{1,4})([dwmyb]?)$/i;

/** Bare `YYYY-MM-DD`, anchored, with a whitespace-or-end boundary. */
const LEADING_DATE_RE = /^(\d{4}-\d{2}-\d{2})(\s+|$)/;

/** `(A) ` priority prefix on an incomplete line. */
const PRIORITY_PREFIX_RE = /^\([A-Z]\)\s/;

/** One ISO calendar day in milliseconds. */
const MS_PER_DAY = 86_400_000;

// ---------------------------------------------------------------------------
// Small pure date helpers
// ---------------------------------------------------------------------------

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** Parse `YYYY-MM-DD` into numeric parts, or throw. */
function parseIso(iso: string): { y: number; m: number; d: number } {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) throw new Error(`expected YYYY-MM-DD, got "${iso}"`);
  return { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) };
}

/** Days in a 1-indexed month. Handles leap years. */
function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * Whole-day difference `b - a`. Both are bare calendar dates, so the
 * arithmetic runs in UTC where every day is exactly 86_400_000 ms — a DST
 * transition between the two dates cannot shift the count.
 */
export function isoDayDiff(a: string, b: string): number {
  const pa = parseIso(a);
  const pb = parseIso(b);
  const ta = Date.UTC(pa.y, pa.m - 1, pa.d);
  const tb = Date.UTC(pb.y, pb.m - 1, pb.d);
  return Math.round((tb - ta) / MS_PER_DAY);
}

/**
 * Add whole calendar months, clamping the day to the target month's length.
 *
 * `2026-01-31 +1m` is `2026-02-28`, not `2026-03-03`. Clamping is what every
 * calendar app does and what a user writing `rec:1m` on a month-end task
 * means; rolling over would walk the task later every single month.
 */
export function addMonthsIso(iso: string, months: number): string {
  const { y, m, d } = parseIso(iso);
  const total = y * 12 + (m - 1) + months;
  const ny = Math.floor(total / 12);
  // Floor-mod so a negative `months` cannot produce a negative month index.
  const nm = ((total % 12) + 12) % 12 + 1;
  return `${String(ny).padStart(4, '0')}-${pad2(nm)}-${pad2(
    Math.min(d, daysInMonth(ny, nm)),
  )}`;
}

/** True for Saturday / Sunday in the UTC counting frame. */
export function isWeekendIso(iso: string): boolean {
  const { y, m, d } = parseIso(iso);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return dow === 0 || dow === 6;
}

/**
 * Add `n` BUSINESS days, skipping Saturdays and Sundays.
 *
 * Steps one day at a time and skips weekends after each step, so the result
 * is always a weekday and a base that itself falls on a weekend still lands
 * correctly (Saturday +1b = Monday, Friday +1b = Monday). `n` is small by
 * construction (a `rec:` count, capped at four digits), so the loop is
 * cheaper and far easier to verify than closed-form week arithmetic.
 */
export function addBusinessDaysIso(iso: string, n: number): string {
  let cur = iso;
  for (let i = 0; i < n; i += 1) {
    cur = addDaysIso(cur, 1);
    while (isWeekendIso(cur)) cur = addDaysIso(cur, 1);
  }
  return cur;
}

/** Shift `iso` forward by one parsed recurrence interval. */
export function shiftIsoByRecurrence(iso: string, rec: Recurrence): string {
  switch (rec.unit) {
    case 'd':
      return addDaysIso(iso, rec.count);
    case 'w':
      return addDaysIso(iso, rec.count * 7);
    case 'm':
      return addMonthsIso(iso, rec.count);
    case 'y':
      return addMonthsIso(iso, rec.count * 12);
    case 'b':
      return addBusinessDaysIso(iso, rec.count);
  }
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

/**
 * Parse a bare `rec:` VALUE (the part after the colon). Returns null for
 * anything unrecognized, including a zero count — `rec:0d` would generate an
 * identical task forever.
 */
export function parseRecurrenceValue(value: string): Recurrence | null {
  const m = REC_VALUE_RE.exec(value.trim());
  if (!m) return null;
  const count = Number.parseInt(m[2], 10);
  if (!Number.isInteger(count) || count < 1) return null;
  const unit = (m[3] === '' ? 'd' : m[3].toLowerCase()) as RecUnit;
  return { raw: value.trim(), strict: m[1] === '+', count, unit };
}

/** Parse the `rec:` token off a whole line. Null when absent or malformed. */
export function lineRecurrence(line: string): Recurrence | null {
  const m = REC_TOKEN_RE.exec(line);
  return m ? parseRecurrenceValue(m[1]) : null;
}

// ---------------------------------------------------------------------------
// Line rewriting
// ---------------------------------------------------------------------------

/**
 * Replace the date in a `key:YYYY-MM-DD` token, in place.
 *
 * Rewrites only the eight date characters, so the token keeps its original
 * position, spelling, and surrounding whitespace. No-op when the key is
 * absent — callers have already established it is there.
 */
function replaceDateToken(line: string, key: string, iso: string): string {
  const re = new RegExp(`(^|\\s)(${key}:)\\d{4}-\\d{2}-\\d{2}(?=\\s|$)`, 'i');
  return line.replace(re, `$1$2${iso}`);
}

/**
 * Remove the creation date from an incomplete line's canonical slot (after an
 * optional `(A) ` prefix). Leaves `due:` / `t:` / any other date alone,
 * because those are key:value tokens, not bare dates in the creation slot.
 */
function stripCreationDate(line: string): string {
  const pri = PRIORITY_PREFIX_RE.exec(line);
  const head = pri ? pri[0] : '';
  const rest = line.slice(head.length);
  const date = LEADING_DATE_RE.exec(rest);
  if (!date) return line;
  return head + rest.slice(date[0].length);
}

/**
 * Build the NEXT instance of a recurring task from its still-incomplete line.
 *
 * Returns null — meaning "generate nothing" — when the line is blank, already
 * completed, or carries no parseable `rec:` tag. The already-completed guard
 * is what keeps a toggle-off/toggle-on cycle from breeding duplicates, and it
 * is checked here rather than at each call site so every "done" surface
 * inherits it.
 *
 * The result keeps the priority prefix (a recurring task does not lose its
 * urgency when one instance is finished), keeps `rec:` so the series
 * continues, keeps projects / contexts / other metadata verbatim, carries a
 * fresh creation date of `completionDate`, and has no `x ` prefix.
 *
 * @param line           The task line as it was BEFORE completion.
 * @param completionDate Today as `YYYY-MM-DD`.
 */
export function nextRecurrenceLine(
  line: string,
  completionDate: string,
): string | null {
  if (line.trim() === '') return null;
  if (isComplete(line)) return null;

  const rec = lineRecurrence(line);
  if (rec === null) return null;

  const due = lineDue(line);
  const threshold = lineThreshold(line);

  // The leading token: `due:` when present, else `t:`. Drives the delta.
  const primaryOld = due ?? threshold;
  const base = rec.strict ? (primaryOld ?? completionDate) : completionDate;
  const primaryNew = shiftIsoByRecurrence(base, rec);
  const delta = primaryOld === null ? 0 : isoDayDiff(primaryOld, primaryNew);

  let next = line;
  if (due !== null) next = replaceDateToken(next, 'due', addDaysIso(due, delta));
  if (threshold !== null) {
    next = replaceDateToken(next, 't', addDaysIso(threshold, delta));
  }

  // Fresh creation date: this instance was created now, not when the series
  // started. Strip first so a line that already had one does not end up with
  // two bare dates in the creation slot.
  return addCreationDate(stripCreationDate(next), completionDate);
}

/**
 * THE shared "done" transform. Completes `line` and, when it was a live
 * recurring task, appends the next instance directly after it.
 *
 * Returns a string that may contain a newline. Every call site already
 * replaces a whole line range with the returned text (CodeMirror
 * `view.dispatch`, the textarea splice, `splitLines`/`joinLines` in the
 * palette), so a two-line return needs no special handling — the new
 * instance simply lands immediately after the line it came from, where the
 * user is already looking.
 *
 * Toggling a completed line back to incomplete is delegated untouched to
 * `markLineDone`, so undo-by-toggle keeps working and never spawns anything.
 */
export function completeLineWithRecurrence(line: string, today: string): string {
  const next = nextRecurrenceLine(line, today);
  const completed = markLineDone(line, today);
  return next === null ? completed : `${completed}\n${next}`;
}
