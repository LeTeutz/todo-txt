/**
 * todotxt — pure helpers for the todo-txt app.
 *
 * Spec: https://github.com/todotxt/todo.txt
 *
 * Incomplete task rules:
 *   1. Priority `(A)` / `(B)` / … / `(Z)` always appears first if present
 *      (uppercase letter in parens + single space).
 *   2. Creation date `YYYY-MM-DD` appears directly after priority, or at
 *      line start if no priority.
 *   3. `+project`, `@context`, and `key:value` metadata may appear anywhere
 *      after priority/date, separated by whitespace.
 *
 * Complete task rules:
 *   1. Line starts with lowercase `x ` (literal `x` + single space).
 *   2. Completion date `YYYY-MM-DD` may immediately follow `x `.
 *      If a creation date was present, it follows the completion date.
 *
 * These helpers PRESERVE whatever formatting they encounter — they do not
 * rewrite whole lines, do not normalize whitespace, and do not re-order
 * tokens except where the spec demands it (priority-first, completion-first).
 *
 * The textarea itself (see TodoTxtPage.tsx) never invokes these helpers
 * automatically. They fire only from the selection popover's quick-action
 * buttons, so the "just a text file" contract stays intact for free-form
 * typing.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TokenType =
  | 'priority'
  | 'date'
  | 'context'
  | 'project'
  | 'keyvalue'
  | 'completion'
  | 'text';

export interface Token {
  /** Semantic token class, used by syntax-highlighting overlay. */
  type: TokenType;
  /** Raw substring from the source line (no trimming). */
  value: string;
  /** Inclusive offset into the source line. */
  start: number;
  /** Exclusive end offset into the source line. */
  end: number;
}

export interface StrippedTask {
  /** Human-readable title with all todo-txt syntax removed. */
  title: string;
  /** `due:YYYY-MM-DD` metadata if found on the line. */
  due?: string;
}

export interface LineRange {
  /** Inclusive start offset expanded to the beginning of the first line. */
  start: number;
  /** Exclusive end offset expanded to the end of the last line (before `\n`). */
  end: number;
}

// ---------------------------------------------------------------------------
// Core regex patterns (module-private)
// ---------------------------------------------------------------------------

/** Matches leading `(A) ` / `(B) ` / … / `(Z) ` on an incomplete task. */
const PRIORITY_RE = /^\(([A-Z])\)\s/;

/** Matches a bare YYYY-MM-DD date followed by whitespace or end-of-string. */
const DATE_RE = /^(\d{4}-\d{2}-\d{2})(?=\s|$)/;

/** Full-string YYYY-MM-DD match (used for key:value validation). */
const FULL_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Matches the bare `x ` completion prefix (literal space only per spec). */
const COMPLETION_PREFIX_RE = /^x /;

/** Matches `x ` + completion date + trailing whitespace. */
const COMPLETION_WITH_DATE_RE = /^x\s+(\d{4}-\d{2}-\d{2})(?:\s+|$)/;

/** Matches a `key:value` metadata word (ASCII key, non-empty value). */
const KEYVALUE_RE = /^([A-Za-z][A-Za-z0-9_-]*):(.+)$/;

// ---------------------------------------------------------------------------
// Predicates
// ---------------------------------------------------------------------------

/** True if the line is complete (starts with `x ` per spec). */
export function isComplete(line: string): boolean {
  return COMPLETION_PREFIX_RE.test(line);
}

/** Returns the priority letter (A-Z) for an incomplete line, or null. */
export function getPriority(line: string): string | null {
  if (isComplete(line)) return null;
  const m = line.match(PRIORITY_RE);
  return m ? m[1] : null;
}

// ---------------------------------------------------------------------------
// Mutators (pure — return new strings)
// ---------------------------------------------------------------------------

/**
 * Toggle completion on a task line.
 *
 * - If the line is already complete, strip the `x ` prefix AND any
 *   completion date that follows, restoring the incomplete body.
 * - If the line is incomplete, prepend `x <today> ` and strip any
 *   existing priority (canonical todo.txt drops priority on completion;
 *   callers that want to preserve priority can re-apply it via a
 *   `pri:A` key:value token themselves).
 *
 * @param line  Raw task line (no trailing newline).
 * @param today Today's date as `YYYY-MM-DD`.
 */
export function markLineDone(line: string, today: string): string {
  // Blank-line guard: no-op on empty/whitespace-only lines.
  if (line.trim() === '') return line;

  if (isComplete(line)) {
    const withDate = line.match(COMPLETION_WITH_DATE_RE);
    let restored = withDate
      ? line.slice(withDate[0].length)
      : line.replace(COMPLETION_PREFIX_RE, '');
    // Round-trip: restore a pri:X tag (written on completion) back to the
    // (X) prefix, per ecosystem convention (Sleek/SimpleTask).
    const priTag = restored.match(/(?:^|\s)pri:([A-Z])(?=\s|$)/);
    if (priTag) {
      // Selections expand to whole lines split on \n only, so in a CRLF file
      // the line arrives with its own \r attached — and \r is \s, so the
      // trailing-whitespace trim below would EAT the terminator and rewrite
      // that one line as LF inside a CRLF document. The backend deliberately
      // reads with newline='' so it never silently rewrites a CRLF file; this
      // was the one path that did it from the editor side.
      const eol = restored.endsWith('\r') ? '\r' : '';
      restored =
        restored
          .replace(/(^|\s)pri:[A-Z](?=\s|$)/, '$1')
          .replace(/\s+$/, '')
          .replace(/\s{2,}/g, ' ') + eol;
      restored = setPriority(restored, priTag[1]);
    }
    return restored;
  }
  // Incomplete → completed. Strip priority but preserve it as pri:X tag
  // (ecosystem convention for round-trip preservation).
  const priMatch = line.match(PRIORITY_RE);
  const pri = priMatch ? priMatch[1] : null;
  // Same CRLF care as the un-complete branch above, for the same reason — but
  // here the hazard is placement, not trimming: appending ` pri:A` to a line
  // ending in \r would leave the carriage return in the MIDDLE of the line.
  // Detach the terminator, build the line, put it back last.
  const eol = line.endsWith('\r') ? '\r' : '';
  const body = (eol ? line.slice(0, -1) : line).replace(PRIORITY_RE, '');
  const completed = `x ${today} ${body}`;
  if (pri) {
    return `${completed} pri:${pri}${eol}`;
  }
  return completed + eol;
}

/**
 * Set, replace, or strip the priority letter on an incomplete line.
 *
 * - No-op on completed lines (spec: completed tasks have no priority).
 * - `pri` null / empty / not `[A-Za-z]` → strip existing priority.
 * - `pri` in `[A-Za-z]` → uppercase, then insert or replace at line
 *   start followed by a single space (spec Rule 1).
 */
export function setPriority(line: string, pri: string | null | undefined): string {
  // Blank-line guard, same rule as markLineDone. A selection expands to WHOLE
  // lines, so any drag across a spacer — or a plain Ctrl+A — hands the blank
  // line to this transform. Without the guard it became `(A) `: not blank any
  // more, so `list`, the filter chip and every tally count it as a task the
  // user never created.
  if (line.trim() === '') return line;

  if (isComplete(line)) {
    return line;
  }
  const stripped = line.replace(PRIORITY_RE, '');
  if (!pri) {
    return stripped;
  }
  const norm = pri.toUpperCase();
  if (!/^[A-Z]$/.test(norm)) {
    return stripped;
  }
  return `(${norm}) ${stripped}`;
}

/**
 * Insert a creation date per spec Rule 2.
 *
 * - No-op on completed lines.
 * - If priority is present, insert after `(A) ` / `(B) ` / etc.
 * - Otherwise insert at line start.
 * - No-op if a creation date is already in the canonical position.
 */
export function addCreationDate(line: string, today: string): string {
  // Blank-line guard, same rule as markLineDone / setPriority — otherwise a
  // spacer inside a selection becomes a bare `2026-08-05 `, a phantom task.
  if (line.trim() === '') return line;

  if (isComplete(line)) {
    return line;
  }
  const priMatch = line.match(PRIORITY_RE);
  if (priMatch) {
    const afterPri = line.slice(priMatch[0].length);
    if (DATE_RE.test(afterPri)) {
      return line;
    }
    return `${priMatch[0]}${today} ${afterPri}`;
  }
  if (DATE_RE.test(line)) {
    return line;
  }
  return `${today} ${line}`;
}

// ---------------------------------------------------------------------------
// Introspection / conversion
// ---------------------------------------------------------------------------

/**
 * Strip all todo-txt syntax from a line, returning `{title, due?}` — a
 * plain-task shape for export/conversion integrations. The `due` field is
 * extracted from a `due:YYYY-MM-DD` key:value token if present.
 */
export function stripTodoTxtSyntax(line: string): StrippedTask {
  let working = line;

  // Drop completion prefix + optional completion date + trailing ws.
  const withDate = working.match(COMPLETION_WITH_DATE_RE);
  if (withDate) {
    working = working.slice(withDate[0].length);
  } else {
    working = working.replace(COMPLETION_PREFIX_RE, '');
  }

  // Drop priority.
  working = working.replace(PRIORITY_RE, '');

  // Drop a leading creation date.
  working = working.replace(/^\d{4}-\d{2}-\d{2}\s+/, '');

  let due: string | undefined;
  const keepers: string[] = [];
  // Split on single-space runs to preserve meaningful whitespace.
  const parts = working.split(/\s+/).filter((p) => p.length > 0);
  for (const part of parts) {
    if (part.startsWith('+') && part.length > 1) continue;
    if (part.startsWith('@') && part.length > 1) continue;
    const kv = part.match(KEYVALUE_RE);
    if (kv) {
      if (kv[1].toLowerCase() === 'due' && FULL_DATE_RE.test(kv[2])) {
        due = kv[2];
      }
      continue;
    }
    keepers.push(part);
  }

  const title = keepers.join(' ').trim();
  return due !== undefined ? { title, due } : { title };
}

// ---------------------------------------------------------------------------
// Textarea helpers
// ---------------------------------------------------------------------------

/**
 * Given a textarea, expand its current selection to whole-line offsets.
 *
 * - `start` moves back to the start of the first selected line (or 0).
 * - `end` moves forward to the end of the last selected line, NOT
 *   including the trailing `\n` (so callers can splice cleanly without
 *   consuming the following empty line).
 * - A zero-width selection expands to the single line containing the
 *   caret.
 * - A selection whose endpoint sits just after a `\n` (e.g. from a
 *   triple-click that includes the newline) is backed off so we don't
 *   grab the following line.
 */
export function lineRangeForSelection(textarea: HTMLTextAreaElement): LineRange {
  const value = textarea.value;
  const selStart = textarea.selectionStart ?? 0;
  const selEnd = textarea.selectionEnd ?? selStart;

  // Clamp to [0, value.length].
  const s = Math.max(0, Math.min(value.length, selStart));
  let e = Math.max(s, Math.min(value.length, selEnd));

  // If selection spans a trailing newline, back off one char so we don't
  // pull in the next line.
  if (e > s && e > 0 && value[e - 1] === '\n') {
    e -= 1;
  }

  // Expand start backwards to the beginning of its line.
  let start = s;
  while (start > 0 && value[start - 1] !== '\n') {
    start -= 1;
  }

  // Expand end forwards to just before the next newline (or EOS).
  let end = e;
  while (end < value.length && value[end] !== '\n') {
    end += 1;
  }

  return { start, end };
}

// ---------------------------------------------------------------------------
// Tokenizer
// ---------------------------------------------------------------------------

/**
 * Tokenize a single task line into ordered, non-overlapping semantic
 * tokens. The concatenation of every `token.value` in order equals the
 * original line exactly — whitespace is emitted as `text` tokens so the
 * syntax-highlighting overlay can render a `<pre>` that aligns perfectly
 * with the underlying textarea.
 *
 * Recognized tokens:
 *   - `completion` — `x ` prefix on completed lines.
 *   - `date`       — `YYYY-MM-DD` in the completion-date or creation-date slot.
 *   - `priority`   — `(A) ` / `(B) ` / … / `(Z) ` at line start on incomplete lines.
 *   - `project`    — `+foo` anywhere in the body.
 *   - `context`    — `@foo` anywhere in the body.
 *   - `keyvalue`   — `key:value` anywhere in the body.
 *   - `text`       — everything else (including whitespace).
 *
 * Empty input returns an empty array.
 */
export function tokenize(line: string): Token[] {
  const tokens: Token[] = [];
  let idx = 0;

  const push = (type: TokenType, len: number): void => {
    if (len <= 0) return;
    tokens.push({
      type,
      value: line.slice(idx, idx + len),
      start: idx,
      end: idx + len,
    });
    idx += len;
  };

  const consumeWhitespace = (): void => {
    const rest = line.slice(idx);
    const m = rest.match(/^\s+/);
    if (m) {
      push('text', m[0].length);
    }
  };

  // Leading `x ` completion marker (and optional completion date).
  const compPrefix = line.slice(idx).match(COMPLETION_PREFIX_RE);
  if (compPrefix) {
    push('completion', compPrefix[0].length);
    const compDate = line.slice(idx).match(DATE_RE);
    if (compDate) {
      push('date', compDate[1].length);
      consumeWhitespace();
    }
  } else {
    // Leading priority on incomplete lines.
    const pri = line.slice(idx).match(PRIORITY_RE);
    if (pri) {
      push('priority', pri[0].length);
    }
  }

  // Creation date (always in "canonical" slot after priority / completion block).
  const creation = line.slice(idx).match(DATE_RE);
  if (creation) {
    push('date', creation[1].length);
    consumeWhitespace();
  }

  // Walk remaining body.
  while (idx < line.length) {
    const rest = line.slice(idx);
    const wsMatch = rest.match(/^\s+/);
    if (wsMatch) {
      push('text', wsMatch[0].length);
      continue;
    }
    const wordMatch = rest.match(/^\S+/);
    if (!wordMatch) break;
    const word = wordMatch[0];

    if (word.startsWith('+') && word.length > 1) {
      push('project', word.length);
    } else if (word.startsWith('@') && word.length > 1) {
      push('context', word.length);
    } else if (KEYVALUE_RE.test(word)) {
      push('keyvalue', word.length);
    } else {
      push('text', word.length);
    }
  }

  return tokens;
}
