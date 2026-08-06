/**
 * shortcuts — pure text-transform engine for todo.txt power-user triggers.
 *
 * Fires from ``TodoTxtPage.onChange`` AFTER the user types the trigger
 * character (space or enter). Zero LLM, zero network, deterministic.
 *
 * ### Design
 *
 * Every shortcut is a `!!<command>[arg]` token followed by a trigger char.
 * When the user types the trigger, we:
 *   1. Scan backwards from the caret to find the nearest `!!` sequence on
 *      the same line.
 *   2. Match the token against the shortcut registry.
 *   3. If matched, splice the transformed text in place and return the new
 *      value + new caret position. The caller re-sets the textarea.
 *   4. If no match, return `null` — the original keystroke is untouched.
 *
 * Line-level transforms (`!!done`, `!!a`) operate on the WHOLE LINE, not
 * just the trigger token. Inline transforms (`!!t`, `!!d`, `!!due:fri`)
 * only replace the token itself.
 *
 * ### Supported shortcuts
 *
 * Line-level (operate on entire task line):
 *   !!done     → prepend ``x YYYY-MM-DD `` + strip priority (per the todo.txt
 *                format)
 *   !!undone   → strip ``x `` prefix + completion date
 *   !!a / !!b / !!c / ... / !!z  → set priority to that letter
 *   !!pri-     → strip priority
 *   !!archive  → prepend ``x YYYY-MM-DD `` AND add ``archived:1`` tag
 *
 * Inline (replace just the token at caret):
 *   !!t        → ``time:HH:MM`` (current time, local)
 *   !!now      → ``YYYY-MM-DDTHH:MM``
 *   !!d        → ``YYYY-MM-DD`` (today)
 *   !!tom      → tomorrow's YYYY-MM-DD
 *   !!yday     → yesterday's YYYY-MM-DD
 *   !!mon / tue / wed / thu / fri / sat / sun  → next occurrence of that day
 *   !!+1d / !!+1w / !!+2w / !!+1m  → today offset by that duration
 *   !!due:<rel>   → ``due:<resolved-date>`` where <rel> ∈ today|tom|mon|tue|...|+1w
 *   !!t:<rel>     → ``t:<resolved-date>`` (threshold / defer-until)
 *   !!rec:<spec>  → ``rec:<spec>`` passthrough with auto ``+`` prefix for
 *                   strict-from-origin (e.g. ``!!rec:1w`` → ``rec:+1w``)
 *   !!id          → ``id:<8-char-random>``
 *   !!p+foo       → ``+foo`` (quick project insertion)
 *   !!@bar        → ``@bar`` (quick context — already idiomatic, but we
 *                   accept this form for parity)
 */

import { addCreationDate, isComplete, setPriority as setPriorityHelper } from './todotxt';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ShortcutResult {
  /** New full textarea value after expansion. */
  value: string;
  /** New caret position (0-based, same convention as selectionStart). */
  caret: number;
  /** Trigger token that fired, for undo/logging. Includes the leading `!!`. */
  trigger: string;
  /** What the trigger expanded to, for undo/logging. */
  expansion: string;
}

/**
 * A clock interface so tests can inject a deterministic "now". In
 * production call sites pass `() => new Date()`.
 */
export type Clock = () => Date;

/** Set of characters that cause a shortcut to fire when typed. */
export const TRIGGER_CHARS = new Set([' ', '\n']);

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

/** Zero-pad to width 2. */
function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** YYYY-MM-DD (local). */
export function fmtDate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** HH:MM (local, 24-hour). */
export function fmtTime(d: Date): string {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/** YYYY-MM-DDTHH:MM (local). */
export function fmtDateTime(d: Date): string {
  return `${fmtDate(d)}T${fmtTime(d)}`;
}

/** Add N whole days, returning a new Date. */
export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/** Add N whole months (may roll to last day if target has fewer days). */
export function addMonths(d: Date, n: number): Date {
  const r = new Date(d);
  const target = r.getMonth() + n;
  r.setMonth(target);
  return r;
}

/** Add N business days (skips Sat/Sun), returning a new Date. */
export function addBusinessDays(d: Date, n: number): Date {
  const r = new Date(d);
  let remaining = n;
  const step = n >= 0 ? 1 : -1;
  remaining = Math.abs(remaining);
  while (remaining > 0) {
    r.setDate(r.getDate() + step);
    const dow = r.getDay();
    if (dow !== 0 && dow !== 6) remaining -= 1;
  }
  return r;
}

const DOW: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

/** Next occurrence of the given day-of-week (today if it matches). */
export function nextDow(from: Date, dow: string): Date | null {
  const target = DOW[dow.toLowerCase()];
  if (target === undefined) return null;
  const cur = from.getDay();
  let delta = target - cur;
  if (delta < 0) delta += 7;
  if (delta === 0) delta = 7; // "next mon" means skip today if today is mon
  return addDays(from, delta);
}

/**
 * Parse a relative date spec used in `due:` / `t:` shortcuts.
 * Supported: today | tod | tom | yday | mon..sun | +Nd | +Nw | +Nm | +Ny.
 * Returns null on unrecognized input so the caller can fall through and
 * leave the token alone.
 */
export function parseRelDate(spec: string, now: Date): Date | null {
  const s = spec.toLowerCase().trim();
  if (!s) return null;
  if (s === 'today' || s === 'tod') return now;
  if (s === 'tom' || s === 'tomorrow') return addDays(now, 1);
  if (s === 'yday' || s === 'yesterday') return addDays(now, -1);
  if (DOW[s] !== undefined) return nextDow(now, s);
  const off = s.match(/^\+(\d+)([dwmyb])$/);
  if (off) {
    const n = parseInt(off[1], 10);
    switch (off[2]) {
      case 'd':
        return addDays(now, n);
      case 'w':
        return addDays(now, n * 7);
      case 'm':
        return addMonths(now, n);
      case 'y':
        return addMonths(now, n * 12);
      case 'b':
        return addBusinessDays(now, n);
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Random id helper
// ---------------------------------------------------------------------------

/**
 * 8-char lowercase alphanumeric id for `id:` tokens. Uses crypto when
 * available, falls back to Math.random so unit tests in jsdom don't need
 * to stub crypto.
 */
export function shortId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  const cryptoObj = (globalThis as unknown as { crypto?: Crypto }).crypto;
  if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
    const buf = new Uint8Array(8);
    cryptoObj.getRandomValues(buf);
    for (let i = 0; i < 8; i++) {
      out += chars[buf[i] % chars.length];
    }
    return out;
  }
  for (let i = 0; i < 8; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

// ---------------------------------------------------------------------------
// Line-level transforms
// ---------------------------------------------------------------------------

/**
 * Given the full textarea value and a caret position, return the
 * `[lineStart, lineEnd)` offsets of the line the caret is currently in.
 * `lineEnd` is exclusive and does NOT include the trailing `\n`.
 */
export function lineOffsets(value: string, caret: number): [number, number] {
  let start = caret;
  while (start > 0 && value[start - 1] !== '\n') start -= 1;
  let end = caret;
  while (end < value.length && value[end] !== '\n') end += 1;
  return [start, end];
}

/**
 * Remove a `!!token ` (or trailing) substring from a line, returning
 * the cleaned line. Used by line-level transforms that eat their own
 * trigger before acting on the rest of the line.
 */
function stripTriggerFromLine(line: string, fullTrigger: string): string {
  const idx = line.indexOf(fullTrigger);
  if (idx < 0) return line;
  // Eat one trailing space if present (so "buy milk !!done " → "buy milk").
  const afterIdx = idx + fullTrigger.length;
  const hasTrailingSpace = line[afterIdx] === ' ';
  const cleaned =
    line.slice(0, idx) +
    (hasTrailingSpace ? line.slice(afterIdx + 1) : line.slice(afterIdx));
  // Collapse any double-space left behind and trim.
  return cleaned.replace(/ {2,}/g, ' ').trimEnd();
}

// ---------------------------------------------------------------------------
// Shortcut registry
// ---------------------------------------------------------------------------

/**
 * A shortcut handler. Given the token body (without the leading `!!`),
 * the whole-textarea value, and caret/clock context, returns the
 * transformation to apply — either an inline splice or a full line-level
 * rewrite.
 */
type ShortcutHandler = (ctx: {
  /** Full `!!token` as typed, e.g. "!!due:fri". */
  full: string;
  /** Token body after `!!`, e.g. "due:fri". */
  body: string;
  /** Full textarea value at trigger time. */
  value: string;
  /** Trigger-char position (where the space/enter was typed). */
  caret: number;
  /** Offset where `!!` starts. */
  triggerStart: number;
  /** Offset just after the last char of the `!!token`. */
  triggerEnd: number;
  /** Clock for deterministic date/time resolution in tests. */
  now: Date;
  /** The trigger char itself (' ' or '\n') — needed so we preserve it. */
  triggerChar: string;
}) => ShortcutResult | null;

/** Inline expansion: replace `!!token` with `replacement`, keep trigger char. */
function inline(
  ctx: Parameters<ShortcutHandler>[0],
  replacement: string,
): ShortcutResult {
  const { value, triggerStart, triggerEnd, triggerChar, full } = ctx;
  const newValue =
    value.slice(0, triggerStart) +
    replacement +
    triggerChar +
    value.slice(triggerEnd + 1); // +1 eats the trigger char we already placed
  const newCaret = triggerStart + replacement.length + 1;
  return { value: newValue, caret: newCaret, trigger: full, expansion: replacement };
}

/** Line-level rewrite: transform the whole line the trigger landed on. */
function lineLevel(
  ctx: Parameters<ShortcutHandler>[0],
  transform: (line: string) => string,
): ShortcutResult {
  const { value, triggerStart, triggerEnd, triggerChar, full } = ctx;
  // Trigger char was already inserted at triggerEnd. Drop it from the
  // buffer before we rewrite the line — the line transform produces the
  // final text without a trailing space.
  const withoutTrigger =
    value.slice(0, triggerEnd) + value.slice(triggerEnd + 1);
  const [lineStart, lineEnd] = lineOffsets(withoutTrigger, triggerStart);
  const line = withoutTrigger.slice(lineStart, lineEnd);
  // Remove the trigger token from the line before running the transform.
  const cleaned = stripTriggerFromLine(line, full);
  const rewritten = transform(cleaned);
  const newValue =
    withoutTrigger.slice(0, lineStart) +
    rewritten +
    withoutTrigger.slice(lineEnd);
  // Place caret at end of rewritten line — most natural for keep-typing.
  const newCaret = lineStart + rewritten.length;
  // Re-insert the trigger char iff it was a newline, so Enter still
  // moves to the next line after the rewrite.
  if (triggerChar === '\n') {
    return {
      value: newValue.slice(0, newCaret) + '\n' + newValue.slice(newCaret),
      caret: newCaret + 1,
      trigger: full,
      expansion: rewritten,
    };
  }
  return { value: newValue, caret: newCaret, trigger: full, expansion: rewritten };
}

/**
 * Registry of static + dynamic shortcut handlers.
 * Order matters: we try `exact` first, then pattern handlers in order.
 */
const EXACT_HANDLERS: Record<string, ShortcutHandler> = {
  // ---- inline: date/time ----
  t: (ctx) => inline(ctx, `time:${fmtTime(ctx.now)}`),
  now: (ctx) => inline(ctx, fmtDateTime(ctx.now)),
  d: (ctx) => inline(ctx, fmtDate(ctx.now)),
  today: (ctx) => inline(ctx, fmtDate(ctx.now)),
  tom: (ctx) => inline(ctx, fmtDate(addDays(ctx.now, 1))),
  tomorrow: (ctx) => inline(ctx, fmtDate(addDays(ctx.now, 1))),
  yday: (ctx) => inline(ctx, fmtDate(addDays(ctx.now, -1))),
  yesterday: (ctx) => inline(ctx, fmtDate(addDays(ctx.now, -1))),
  // ---- inline: id ----
  id: (ctx) => inline(ctx, `id:${shortId()}`),
  // ---- inline: hidden flag (SwiftoDo/Simpletask convention) ----
  h: (ctx) => inline(ctx, 'h:1'),
  // ---- line-level: archive (ADDS archived:1 flag, NOT move-to-done.txt;
  //      kept because the CLI's `archive` command is semantically different) ----
  archive: (ctx) =>
    lineLevel(ctx, (line) => {
      if (!line.trim()) return line;
      const done = isComplete(line)
        ? line
        : `x ${fmtDate(ctx.now)} ${line.replace(/^\([A-Z]\)\s/, '')}`;
      return done.includes('archived:1') ? done : `${done} archived:1`;
    }),

  // ---- line-level: completion / priority. Whole-line transforms, exposed
  //      here as inline quick-keys as well as from the CLI palette so they
  //      work without leaving the editor.
  //      !!d / !!t / !!h stay inline — matched as exact handlers ABOVE first. ----
  done: (ctx) =>
    lineLevel(ctx, (line) => {
      if (!line.trim()) return line;
      if (isComplete(line)) return line;
      return `x ${fmtDate(ctx.now)} ${line.replace(/^\([A-Z]\)\s/, '')}`;
    }),
  undone: (ctx) =>
    lineLevel(ctx, (line) => line.replace(/^x\s+(\d{4}-\d{2}-\d{2}\s+)?/, '')),
  'pri-': (ctx) =>
    lineLevel(ctx, (line) => line.replace(/^\([A-Z]\)\s+/, '')),
  priup: (ctx) =>
    lineLevel(ctx, (line) => {
      const m = line.match(/^\(([A-Z])\)\s+/);
      const body = m ? line.slice(m[0].length) : line;
      if (!body.trim()) return line;
      const next = m ? String.fromCharCode(Math.max(65, m[1].charCodeAt(0) - 1)) : 'A';
      return `(${next}) ${body}`;
    }),
  pridown: (ctx) =>
    lineLevel(ctx, (line) => {
      const m = line.match(/^\(([A-Z])\)\s+/);
      if (!m) return line;
      const body = line.slice(m[0].length);
      const code = m[1].charCodeAt(0);
      return code >= 90 ? body : `(${String.fromCharCode(code + 1)}) ${body}`;
    }),
  date: (ctx) =>
    lineLevel(ctx, (line) => {
      if (!line.trim()) return line;
      const pm = line.match(/^(\([A-Z]\)\s+)/);
      const head = pm ? pm[1] : '';
      const rest = pm ? line.slice(pm[0].length) : line;
      if (/^\d{4}-\d{2}-\d{2}\s/.test(rest)) return line; // already dated
      return `${head}${fmtDate(ctx.now)} ${rest}`;
    }),
};

// The line-level completion/priority transforms are implemented as exact
// handlers above (done/undone/pri-/priup/pridown/date) plus the single-letter
// priority pattern below (!!a .. !!z). They are deliberately reachable inline
// in the editor as well as from the CLI palette, so a whole-line edit never
// requires opening the palette. !!d/!!t/!!h remain inline.

/**
 * Pattern handlers — tried in registered order after exact match fails.
 * Each entry returns a result or null (meaning "not my trigger, keep looking").
 */
const PATTERN_HANDLERS: ShortcutHandler[] = [
  // !!due:<rel> → due:<date>
  (ctx) => {
    const m = ctx.body.match(/^due:(.+)$/);
    if (!m) return null;
    const d = parseRelDate(m[1], ctx.now);
    if (!d) return null;
    return inline(ctx, `due:${fmtDate(d)}`);
  },
  // !!t:<rel> → t:<date> (threshold)
  (ctx) => {
    const m = ctx.body.match(/^t:(.+)$/);
    if (!m) return null;
    const d = parseRelDate(m[1], ctx.now);
    if (!d) return null;
    return inline(ctx, `t:${fmtDate(d)}`);
  },
  // !!rec:<spec> → rec:+<spec> (auto-prepend + if missing)
  (ctx) => {
    const m = ctx.body.match(/^rec:(.+)$/);
    if (!m) return null;
    const spec = m[1].startsWith('+') ? m[1] : `+${m[1]}`;
    // d/w/m/y/b — business days included per SwiftoDo/Topydo convention.
    if (!/^\+\d+[dwmyb]$/.test(spec)) return null;
    return inline(ctx, `rec:${spec}`);
  },
  // !!p+foo → +foo (quick project insertion mid-typing)
  (ctx) => {
    const m = ctx.body.match(/^p(\+[A-Za-z0-9_-]+)$/);
    return m ? inline(ctx, m[1]) : null;
  },
  // !!@bar → @bar (quick context insertion mid-typing)
  (ctx) => (/^@[A-Za-z0-9_-]+$/.test(ctx.body) ? inline(ctx, ctx.body) : null),
  // !!a .. !!z → set whole-line priority to that letter. d/t/h are matched
  // as exact inline handlers ABOVE, so they never reach this pattern.
  (ctx) => {
    if (!/^[a-z]$/.test(ctx.body)) return null;
    const p = ctx.body.toUpperCase();
    return lineLevel(ctx, (line) => {
      const body = line.replace(/^\([A-Z]\)\s+/, '');
      return body.trim() ? `(${p}) ${body}` : line;
    });
  },
  // !!+Nd / +Nw / +Nm / +Ny / +Nb → absolute date today+offset
  (ctx) => {
    const d = parseRelDate(`+${ctx.body.replace(/^\+/, '')}`, ctx.now);
    if (!d) return null;
    if (!/^\+?\d+[dwmyb]$/.test(ctx.body)) return null;
    return inline(ctx, fmtDate(d));
  },
  // !!mon .. !!sun on their own → next-occurrence date
  (ctx) => {
    if (!(ctx.body in DOW)) return null;
    const d = nextDow(ctx.now, ctx.body);
    if (!d) return null;
    return inline(ctx, fmtDate(d));
  },
];

// ---------------------------------------------------------------------------
// Engine entry point
// ---------------------------------------------------------------------------

/**
 * Attempt to apply a shortcut after the user just typed a trigger char
 * (space or enter) at ``caret``. `value` is the textarea content AFTER
 * that char was inserted (so `value[caret - 1]` is the trigger itself).
 *
 * Returns the new value + caret if an expansion fired, else null.
 */
export function applyShortcut(
  value: string,
  caret: number,
  now: Clock = () => new Date(),
): ShortcutResult | null {
  if (caret <= 0 || caret > value.length) return null;
  const triggerChar = value[caret - 1];
  if (!TRIGGER_CHARS.has(triggerChar)) return null;

  // Scan backwards from caret - 2 for `!!`. Abort at newline / start.
  let i = caret - 2;
  while (i >= 1) {
    if (value[i] === '\n') return null;
    if (value[i - 1] === '!' && value[i] === '!') break;
    i -= 1;
  }
  if (i < 1 || value[i - 1] !== '!' || value[i] !== '!') return null;

  const triggerStart = i - 1; // position of first '!'
  const triggerEnd = caret - 2; // last char of token body (inclusive)
  if (triggerEnd < triggerStart + 1) return null; // empty `!! ` — ignore

  const body = value.slice(triggerStart + 2, triggerEnd + 1);
  if (!body) return null;

  const full = `!!${body}`;
  const ctx = {
    full,
    body,
    value,
    caret,
    triggerStart,
    triggerEnd: triggerEnd + 1, // exclusive for splice math
    now: now(),
    triggerChar,
  };

  const exact = EXACT_HANDLERS[body] || EXACT_HANDLERS[body.toLowerCase()];
  if (exact) {
    return exact(ctx);
  }
  for (const h of PATTERN_HANDLERS) {
    const out = h(ctx);
    if (out) return out;
  }
  return null;
}

/**
 * Static reference data for the in-app cheatsheet panel.
 * Keep in sync with handler registry above.
 */
export const SHORTCUT_REFERENCE: Array<{
  trigger: string;
  expansion: string;
  kind: 'line' | 'inline';
}> = [
  // --- inline text expanders (kept; no CLI equivalent — mid-typing only) ---
  { trigger: '!!d / !!today', expansion: 'YYYY-MM-DD (today)', kind: 'inline' },
  { trigger: '!!tom', expansion: 'tomorrow', kind: 'inline' },
  { trigger: '!!yday', expansion: 'yesterday', kind: 'inline' },
  { trigger: '!!mon … !!sun', expansion: 'next that weekday', kind: 'inline' },
  { trigger: '!!+3d / !!+1w / !!+2m / !!+5b', expansion: 'offset from today (b=business days)', kind: 'inline' },
  { trigger: '!!t', expansion: 'time:HH:MM (now)', kind: 'inline' },
  { trigger: '!!now', expansion: 'YYYY-MM-DDTHH:MM', kind: 'inline' },
  { trigger: '!!due:fri / +1w / tom', expansion: 'due:<resolved-date>', kind: 'inline' },
  { trigger: '!!t:<rel>', expansion: 't:<resolved-date> (defer)', kind: 'inline' },
  { trigger: '!!rec:1w / 3d / 1m / 5b', expansion: 'rec:+1w (recurring, b=biz days)', kind: 'inline' },
  { trigger: '!!id', expansion: 'id:<8-char-random>', kind: 'inline' },
  { trigger: '!!h', expansion: 'h:1 (hide from default view)', kind: 'inline' },
  // --- line-level (kept; unique semantic vs CLI `archive` which moves to done.txt) ---
  { trigger: '!!archive', expansion: 'complete + add archived:1 tag (same line)', kind: 'line' },
  { trigger: '!!done', expansion: 'complete: prepend x + today, strip priority', kind: 'line' },
  { trigger: '!!undone', expansion: 'un-complete: strip x + completion date', kind: 'line' },
  { trigger: '!!a … !!z', expansion: 'set priority to that letter', kind: 'line' },
  { trigger: '!!pri-', expansion: 'strip priority', kind: 'line' },
  { trigger: '!!priup / !!pridown', expansion: 'bump priority up / down (A = top)', kind: 'line' },
  { trigger: '!!date', expansion: 'prepend creation date (today)', kind: 'line' },
  { trigger: '!!p+proj', expansion: '+proj (quick project)', kind: 'inline' },
  { trigger: '!!@ctx', expansion: '@ctx (quick context)', kind: 'inline' },
  // --- Tab-complete (not a !! shortcut; documented here for discoverability) ---
  { trigger: '+par<Tab>', expansion: 'cycle +projects starting with "par" (file)', kind: 'inline' },
  { trigger: '@hom<Tab>', expansion: 'cycle @contexts starting with "hom" (file)', kind: 'inline' },
];

// ---------------------------------------------------------------------------
// Tab-complete: +project / @context from existing file content
// ---------------------------------------------------------------------------

/** Extracts the word currently being typed at/before `caret`, if it
 *  starts with `+` or `@`. Returns null otherwise. */
export function getPrefixWordAtCaret(
  value: string,
  caret: number,
): { prefix: '+' | '@'; partial: string; start: number; end: number } | null {
  // Scan backwards from caret to find the start of the current word.
  let start = caret;
  while (start > 0 && !/\s/.test(value[start - 1])) start--;
  const word = value.slice(start, caret);
  if (word.length < 1) return null;
  const first = word[0];
  if (first !== '+' && first !== '@') return null;
  const partial = word.slice(1); // may be empty
  return { prefix: first as '+' | '@', partial, start, end: caret };
}

/** Scans the entire file for existing +projects and @contexts. */
export function extractProjectsAndContexts(value: string): {
  projects: string[];
  contexts: string[];
} {
  const projects = new Set<string>();
  const contexts = new Set<string>();
  // todo.txt tokens: whitespace-delimited, must start with + or @ and
  // follow with at least one identifier char. Use word-boundary regex.
  const re = /(^|\s)([+@])([A-Za-z0-9_-]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(value)) !== null) {
    if (m[2] === '+') projects.add(m[3]);
    else contexts.add(m[3]);
  }
  return {
    projects: [...projects].sort(),
    contexts: [...contexts].sort(),
  };
}

/** Given value, caret, and an optional "cycle index" for repeated Tab presses,
 *  returns the completion result or null if no match. */
export function completeProjectOrContext(
  value: string,
  caret: number,
  cycleIndex = 0,
): { value: string; caret: number; matches: string[]; chosen: string } | null {
  const word = getPrefixWordAtCaret(value, caret);
  if (!word) return null;
  const { projects, contexts } = extractProjectsAndContexts(value);
  const pool = word.prefix === '+' ? projects : contexts;
  // Case-insensitive prefix match; empty partial matches everything.
  const partialLower = word.partial.toLowerCase();
  const matches = pool.filter((n) => n.toLowerCase().startsWith(partialLower));
  // Don't suggest the exact word the user already typed if they've typed
  // the full thing — no-op.
  const filtered = matches.filter(
    (n) => n.toLowerCase() !== partialLower || partialLower === '',
  );
  if (filtered.length === 0) return null;
  const idx = ((cycleIndex % filtered.length) + filtered.length) % filtered.length;
  const chosen = filtered[idx];
  const replacement = word.prefix + chosen;
  const newValue =
    value.slice(0, word.start) + replacement + value.slice(word.end);
  const newCaret = word.start + replacement.length;
  return { value: newValue, caret: newCaret, matches: filtered, chosen };
}
