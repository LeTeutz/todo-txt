/**
 * cm-todotxt-decorations — CodeMirror 6 ViewPlugin that applies
 * inline Decorations for todo.txt syntax elements.
 *
 * Reuses the same regex patterns as the existing tokenize() in
 * utils/todotxt.ts but operates directly on CM6 doc lines for
 * performance (avoids creating intermediate Token[] arrays).
 *
 * Color tokens reference the app's CSS variables (defined in index.css)
 * so themes still work correctly.
 *
 * Decoration classes:
 *   - .todotxt-pri-a / -b / -c / -other   (amber/green/blue/muted, bold)
 *   - .todotxt-project                     (violet)
 *   - .todotxt-context                     (teal)
 *   - .todotxt-date                        (blue)
 *   - .todotxt-keyvalue                    (cyan)
 *   - .todotxt-due-past                    (danger, bold — overdue)
 *   - .todotxt-due-today                   (warning, bold — due today)
 *   - .todotxt-done                        (dimmed, strikethrough)
 *   - .todotxt-hidden                      (muted + italic — h:1 lines)
 *
 * The `h:1` mark carries COLOUR only. How strongly an `h:1` line is pushed out
 * of the way (dim / removed from view / left alone) is a view mode the user
 * controls, and it lives in its own compartment — see components/
 * cm-todotxt-filter.ts and utils/hidden.ts. Keeping opacity out of this layer
 * is what makes the treatment identical whether highlighting is on or off.
 */
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  type PluginValue,
} from '@codemirror/view';
import { RangeSetBuilder } from '@codemirror/state';
import type { Extension } from '@codemirror/state';
import { classifyDue } from '../utils/dueStatus';

// ---------------------------------------------------------------------------
// Regex patterns (from todotxt.ts spec)
// ---------------------------------------------------------------------------
const PRIORITY_RE = /^\(([A-Z])\)\s/;
const DATE_RE = /\d{4}-\d{2}-\d{2}/g;
const COMPLETION_RE = /^x\s/;
const PROJECT_RE = /(?:^|\s)(\+\S+)/g;
const CONTEXT_RE = /(?:^|\s)(@\S+)/g;
const KEYVALUE_RE = /(?:^|\s)([A-Za-z][A-Za-z0-9_-]*:\S+)/g;
const HIDDEN_RE = /(?:^|\s)h:1(?=\s|$)/i;
/**
 * Locates the `due:` token for TINTING.
 *
 * A lookahead, not a consuming `(?:\s|$)`, and the capture group starts at
 * `due:` so `m.index + m[0].indexOf('due:')` is the exact token offset. The
 * previous version consumed the trailing space and then recovered the position
 * with `text.indexOf('due:…')`, which finds the FIRST textual occurrence — so
 * on a line like `notdue:2020-01-01 due:2020-01-01` it tinted a substring of
 * the wrong token.
 *
 * Which date this finds must agree with `lineDue` in utils/filterExpr (same
 * shape, same case-insensitivity), because `classifyDue` reads that one to
 * decide the colour while this one decides where to paint it.
 */
const DUE_RE = /(?:^|\s)(due:\d{4}-\d{2}-\d{2})(?=\s|$)/i;

// ---------------------------------------------------------------------------
// Decoration marks (shared — instantiated once, reused across all lines)
// ---------------------------------------------------------------------------
const priADeco = Decoration.mark({ class: 'todotxt-pri-a' });
const priBDeco = Decoration.mark({ class: 'todotxt-pri-b' });
const priCDeco = Decoration.mark({ class: 'todotxt-pri-c' });
const priOtherDeco = Decoration.mark({ class: 'todotxt-pri-other' });
const projectDeco = Decoration.mark({ class: 'todotxt-project' });
const contextDeco = Decoration.mark({ class: 'todotxt-context' });
const dateDeco = Decoration.mark({ class: 'todotxt-date' });
const keyvalueDeco = Decoration.mark({ class: 'todotxt-keyvalue' });
const duePastDeco = Decoration.mark({ class: 'todotxt-due-past' });
const dueTodayDeco = Decoration.mark({ class: 'todotxt-due-today' });
const doneDeco = Decoration.mark({ class: 'todotxt-done' });
const hiddenDeco = Decoration.mark({ class: 'todotxt-hidden' });

// ---------------------------------------------------------------------------
// Today helper (cached per second for perf)
// ---------------------------------------------------------------------------
let _todayCache = '';
let _todayCacheTs = 0;

function todayStr(): string {
  const now = Date.now();
  if (now - _todayCacheTs < 60_000) return _todayCache;
  const d = new Date();
  _todayCache = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  _todayCacheTs = now;
  return _todayCache;
}

// ---------------------------------------------------------------------------
// Per-line mark collection (pure — exported for tests)
// ---------------------------------------------------------------------------
export interface TodotxtMark {
  from: number;
  to: number;
  deco: Decoration;
}

/**
 * Collect every syntax mark for a single NORMAL line (not blank, not `h:1`,
 * not completed) — priority, past-due, dates, +projects, @contexts and
 * key:value pairs — returned SORTED by `from`.
 *
 * The result feeds straight into a RangeSetBuilder, which requires strictly
 * non-decreasing `from` positions. Priority and past-due marks are collected
 * into the SAME array as the inline tokens (rather than added first) so a
 * token sitting left of a past-due tag — e.g. the creation date in
 * `(A) 2026-05-07 ... due:<past>` — can never produce an out-of-order add.
 * That ordering violation crashed the editor when the starter example
 * loaded; see cm-todotxt-decorations.test.ts.
 */
export function sortedLineMarks(
  text: string,
  lineFrom: number,
  today: string,
): TodotxtMark[] {
  const marks: TodotxtMark[] = [];

  // Priority
  const priMatch = text.match(PRIORITY_RE);
  if (priMatch) {
    const priEnd = lineFrom + priMatch[0].length;
    const letter = priMatch[1];
    const deco =
      letter === 'A' ? priADeco :
      letter === 'B' ? priBDeco :
      letter === 'C' ? priCDeco :
      priOtherDeco;
    marks.push({ from: lineFrom, to: priEnd, deco });
  }

  // Due-date urgency (overdue = danger, due today = warning).
  //
  // Only two of the four DueStatus values produce a mark: a FUTURE deadline is
  // not news and an UNPARSEABLE one (`due:2026-02-31`) must not be asserted as
  // urgent, so both fall through to the ordinary key:value colour. This branch
  // is only ever reached for non-completed lines — buildDecorations returns
  // early on `x ` lines, and painting a red deadline on a task the user already
  // finished would be a lie.
  const dueStatus = classifyDue(text, today);
  if (dueStatus === 'past' || dueStatus === 'today') {
    const dueMatch = DUE_RE.exec(text);
    if (dueMatch) {
      const tokenStart = dueMatch.index + dueMatch[0].indexOf(dueMatch[1]);
      marks.push({
        from: lineFrom + tokenStart,
        to: lineFrom + tokenStart + dueMatch[1].length,
        deco: dueStatus === 'past' ? duePastDeco : dueTodayDeco,
      });
    }
  }

  // Dates
  DATE_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = DATE_RE.exec(text)) !== null) {
    marks.push({
      from: lineFrom + m.index,
      to: lineFrom + m.index + m[0].length,
      deco: dateDeco,
    });
  }

  // Projects
  PROJECT_RE.lastIndex = 0;
  while ((m = PROJECT_RE.exec(text)) !== null) {
    const tokenStart = m.index + m[0].indexOf(m[1]);
    marks.push({
      from: lineFrom + tokenStart,
      to: lineFrom + tokenStart + m[1].length,
      deco: projectDeco,
    });
  }

  // Contexts
  CONTEXT_RE.lastIndex = 0;
  while ((m = CONTEXT_RE.exec(text)) !== null) {
    const tokenStart = m.index + m[0].indexOf(m[1]);
    marks.push({
      from: lineFrom + tokenStart,
      to: lineFrom + tokenStart + m[1].length,
      deco: contextDeco,
    });
  }

  // Key:value pairs
  KEYVALUE_RE.lastIndex = 0;
  while ((m = KEYVALUE_RE.exec(text)) !== null) {
    const tokenStart = m.index + m[0].indexOf(m[1]);
    marks.push({
      from: lineFrom + tokenStart,
      to: lineFrom + tokenStart + m[1].length,
      deco: keyvalueDeco,
    });
  }

  // Sorted by `from` (ties by `to`) so the RangeSetBuilder never sees an
  // out-of-order add.
  marks.sort((a, b) => a.from - b.from || a.to - b.to);
  return marks;
}

// ---------------------------------------------------------------------------
// Build decoration set from the document
// ---------------------------------------------------------------------------
function buildDecorations(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  const today = todayStr();

  for (const { from, to } of view.visibleRanges) {
    const doc = view.state.doc;
    let pos = from;
    // Iterate doc lines within visible range.
    const startLine = doc.lineAt(from).number;
    const endLine = doc.lineAt(to).number;

    for (let lineNum = startLine; lineNum <= endLine; lineNum++) {
      const line = doc.line(lineNum);
      const text = line.text;
      const lineFrom = line.from;

      if (text.trim() === '') continue;

      // Hidden lines (h:1)
      if (HIDDEN_RE.test(text)) {
        builder.add(lineFrom, line.to, hiddenDeco);
        continue;
      }

      // Completed lines: whole line gets dimmed/strikethrough
      if (COMPLETION_RE.test(text)) {
        builder.add(lineFrom, line.to, doneDeco);
        continue;
      }

      // Priority, past-due, and inline tokens — collected and pre-sorted
      // together by sortedLineMarks so the RangeSetBuilder always sees
      // non-decreasing `from` positions. (Adding priority/due ahead of the
      // sorted inline marks was the out-of-order crash that killed the
      // editor on the starter example.)
      for (const mark of sortedLineMarks(text, lineFrom, today)) {
        builder.add(mark.from, mark.to, mark.deco);
      }
    }
  }

  return builder.finish();
}

// ---------------------------------------------------------------------------
// ViewPlugin
// ---------------------------------------------------------------------------
class TodotxtDecoPlugin implements PluginValue {
  decorations: DecorationSet;

  constructor(view: EditorView) {
    this.decorations = buildDecorations(view);
  }

  update(update: ViewUpdate) {
    if (update.docChanged || update.viewportChanged) {
      this.decorations = buildDecorations(update.view);
    }
  }
}

const plugin = ViewPlugin.fromClass(TodotxtDecoPlugin, {
  decorations: (v) => v.decorations,
});

// ---------------------------------------------------------------------------
// CSS theme for the decoration classes
// ---------------------------------------------------------------------------
const decoTheme = EditorView.baseTheme({
  '.todotxt-pri-a': {
    color: 'var(--warn, #f59e0b)',
    fontWeight: 'bold',
  },
  '.todotxt-pri-b': {
    color: 'var(--ok, #22c55e)',
    fontWeight: 'bold',
  },
  '.todotxt-pri-c': {
    color: 'var(--accent, #3b82f6)',
    fontWeight: 'bold',
  },
  '.todotxt-pri-other': {
    color: 'var(--muted, #71717a)',
    fontWeight: 'bold',
  },
  '.todotxt-project': {
    color: '#a78bfa', // violet-400
  },
  '.todotxt-context': {
    color: '#2dd4bf', // teal-400
  },
  '.todotxt-date': {
    color: '#60a5fa', // blue-400
  },
  '.todotxt-keyvalue': {
    color: '#22d3ee', // cyan-400
  },
  '.todotxt-due-past': {
    color: 'var(--danger, #ef4444)',
    fontWeight: 'bold',
  },
  '.todotxt-due-today': {
    color: 'var(--warn, #f59e0b)',
    fontWeight: 'bold',
  },
  // A `due:` token is covered by up to three overlapping marks — the urgency
  // mark, the generic key:value mark, and the `todotxt-date` mark on the date
  // portion — and CodeMirror renders overlapping marks as NESTED spans. An
  // inner span's own `color` beats an outer one's whatever the rule order, so
  // without these descendant rules the urgency tint silently loses the date
  // digits (or the whole token) to cyan/blue. Declared after both, and in both
  // nesting directions, so the tint wins either way.
  '.todotxt-due-past .todotxt-date, .todotxt-due-past .todotxt-keyvalue': {
    color: 'var(--danger, #ef4444)',
  },
  '.todotxt-due-today .todotxt-date, .todotxt-due-today .todotxt-keyvalue': {
    color: 'var(--warn, #f59e0b)',
  },
  '.todotxt-done': {
    color: 'var(--muted, #71717a)',
    textDecoration: 'line-through',
    opacity: '0.6',
  },
  // Colour only — no opacity. How far an `h:1` line is pushed out of the way
  // is the user's `hidden` view mode, which owns opacity in its own
  // compartment (components/cm-todotxt-filter.ts). Splitting it this way is
  // what makes `hidden dim` look identical with highlighting on or off.
  '.todotxt-hidden': {
    color: 'var(--muted, #71717a)',
    fontStyle: 'italic',
  },
});

// ---------------------------------------------------------------------------
// Public export: extension bundle
// ---------------------------------------------------------------------------
export function todotxtDecorations(): Extension {
  return [plugin, decoTheme];
}
