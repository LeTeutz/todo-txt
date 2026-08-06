/**
 * cm-vim-todotxt — Vim leader bindings for todo.txt operations.
 *
 * Leader key: backslash (\) — universal, no collision with vim defaults.
 *
 * Bindings (vim NORMAL mode only):
 *   \x   — toggle done/undone on current line
 *   \j   — priority down (none→A, A→B→...→Z→none)
 *   \k   — priority up (none→A, Z→Y→...→A)
 *   \a   — set priority (A)
 *   \b   — set priority (B)
 *   \c   — set priority (C)
 *   \d   — insert today's date after priority
 *   \D   — archive (mark done + add archived:1 tag)
 *   \s   — sort lines in buffer (alphabetical, priorities first)
 *
 * Uses the existing pure helpers from utils/todotxt.ts so behavior is
 * consistent with the popover quick-actions.
 */
import { markLineDone, setPriority, addCreationDate, getPriority, isComplete } from '../utils/todotxt';
import { completeLineWithRecurrence } from '../utils/recurrence';
import { joinLines, splitLines } from '../utils/commands';

// ---------------------------------------------------------------------------
// Pure line transforms (exported for unit testing)
// ---------------------------------------------------------------------------

/** Today as YYYY-MM-DD. */
export function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Priority cycle down: A→B→...→Z→null (strip). */
export function priorityDown(line: string): string {
  if (isComplete(line)) return line;
  const pri = getPriority(line);
  if (!pri) return setPriority(line, 'A');
  if (pri === 'Z') return setPriority(line, null);
  return setPriority(line, String.fromCharCode(pri.charCodeAt(0) + 1));
}

/** Priority cycle up: none→A (give it top priority), Z→Y→...→B→A, A stays A. */
export function priorityUp(line: string): string {
  if (isComplete(line)) return line;
  const pri = getPriority(line);
  if (!pri) return setPriority(line, 'A');
  if (pri === 'A') return line;
  return setPriority(line, String.fromCharCode(pri.charCodeAt(0) - 1));
}

/**
 * Toggle done using the shared recurrence-aware completion path.
 *
 * May return a TWO-LINE string: completing a live `rec:` task appends the
 * next instance after the completed line. Every caller replaces a whole line
 * range with this return value, so the extra line lands in the right place
 * without any caller-side plumbing. Blank-line and already-done guards live
 * inside `completeLineWithRecurrence` / `markLineDone`.
 */
export function toggleDone(line: string): string {
  return completeLineWithRecurrence(line, today());
}

/**
 * File-aware toggle: recurrence generation is a todo.txt semantic. On
 * done.txt the toggle is a correction (un-archive / fix a mis-mark), and
 * spawning a new ACTIVE task inside done.txt would plant it where no one
 * looks — so any file other than 'todo' gets the plain toggle.
 */
export function toggleDoneForFile(line: string, file: string | undefined): string {
  return file === 'todo' || file === undefined
    ? toggleDone(line)
    : markLineDone(line, today());
}

/** Insert today's date in creation-date slot. */
export function insertDate(line: string): string {
  return addCreationDate(line, today());
}

/** Archive: mark done + append archived:1 tag. */
export function archiveLine(line: string): string {
  if (line.trim() === '') return line;
  let result = line;
  if (!isComplete(result)) {
    result = markLineDone(result, today());
  }
  if (!/\barchived:1\b/.test(result)) {
    result = `${result} archived:1`;
  }
  return result;
}

/**
 * Sort: completed lines sink to bottom, then by priority (A first), then alpha.
 *
 * Splits through the palette engine's `splitLines` / `joinLines` pair rather
 * than a bare `split('\n')`. A todo.txt file ends with a newline, and a bare
 * split hands the comparator an extra `''` element that sorts BEFORE every
 * priority-less task — which would move the file's terminator into the middle
 * of the document as a blank line AND leave the file without a trailing
 * newline. Reusing the palette pair keeps one definition of "the terminator is
 * not a line" for every reordering path.
 */
export function sortLines(text: string): string {
  const { lines, trailingNewline } = splitLines(text);
  lines.sort((a, b) => {
    const aDone = isComplete(a) ? 1 : 0;
    const bDone = isComplete(b) ? 1 : 0;
    if (aDone !== bDone) return aDone - bDone;
    const aPri = getPriority(a) ?? '\xff'; // no-priority sorts last
    const bPri = getPriority(b) ?? '\xff';
    if (aPri !== bPri) return aPri < bPri ? -1 : 1;
    return a.localeCompare(b);
  });
  return joinLines(lines, trailingNewline);
}

// ---------------------------------------------------------------------------
// Vim integration — registers leader actions.
// Called AFTER vim module is loaded.
// ---------------------------------------------------------------------------

/**
 * Register todo.txt leader bindings on the vim instance.
 * Must be called with the Vim object from @replit/codemirror-vim.
 */
export function registerTodotxtVimBindings(Vim: any): void {
  /**
   * True when this view will accept a document change.
   *
   * Every action below dispatches its transaction DIRECTLY rather than going
   * through @replit/codemirror-vim's `dispatchChange` helper, so it does not
   * inherit that helper's `state.readOnly` check — and CodeMirror's readOnly
   * facet is advisory: it is honoured by commands that ask, and applies any
   * transaction that does not. Without this guard `\x`, `\s`, `\D` and the
   * priority/date leaders would all write into an editor the app had
   * deliberately frozen, while vim's own `dd` / `x` in the same buffer were
   * refused — one asymmetric operator set over one buffer, which is exactly
   * how a read-only document quietly stops being read-only.
   */
  const writable = (view: any): boolean => !view?.state?.readOnly;

  // Helper: transform the current line in-place.
  const defineLineAction = (name: string, transform: (line: string) => string) => {
    Vim.defineAction(name, (cm: any) => {
      const view = cm.cm6 ?? cm;
      if (!view?.state) return;
      if (!writable(view)) return;
      const state = view.state;
      const lineNum = state.doc.lineAt(state.selection.main.head);
      const lineText = lineNum.text;
      const newText = transform(lineText);
      if (newText !== lineText) {
        view.dispatch({
          changes: { from: lineNum.from, to: lineNum.to, insert: newText },
        });
      }
    });
  };

  // Helper: transform all lines (sort).
  const defineDocAction = (name: string, transform: (doc: string) => string) => {
    Vim.defineAction(name, (cm: any) => {
      const view = cm.cm6 ?? cm;
      if (!view?.state) return;
      if (!writable(view)) return;
      const doc = view.state.doc.toString();
      const newDoc = transform(doc);
      if (newDoc !== doc) {
        view.dispatch({
          changes: { from: 0, to: doc.length, insert: newDoc },
        });
      }
    });
  };

  // Register actions. Toggle-done reads the active file off the editor's
  // ancestor `[data-todo-file]` (stamped by TodoTxtPage on the editor wrap)
  // so recurrence generation stays a todo.txt-only behavior; the other
  // actions are file-agnostic raw-line edits.
  Vim.defineAction('todotxt-toggle-done', (cm: any) => {
    const view = cm.cm6 ?? cm;
    if (!view?.state) return;
    if (!writable(view)) return;
    const host = (view.dom as HTMLElement | undefined)?.closest?.(
      '[data-todo-file]',
    ) as HTMLElement | null;
    const file = host?.dataset?.todoFile;
    const state = view.state;
    const lineNum = state.doc.lineAt(state.selection.main.head);
    const newText = toggleDoneForFile(lineNum.text, file);
    if (newText !== lineNum.text) {
      view.dispatch({
        changes: { from: lineNum.from, to: lineNum.to, insert: newText },
      });
    }
  });
  defineLineAction('todotxt-priority-down', priorityDown);
  defineLineAction('todotxt-priority-up', priorityUp);
  defineLineAction('todotxt-set-pri-a', (l) => setPriority(l, 'A'));
  defineLineAction('todotxt-set-pri-b', (l) => setPriority(l, 'B'));
  defineLineAction('todotxt-set-pri-c', (l) => setPriority(l, 'C'));
  defineLineAction('todotxt-insert-date', insertDate);
  defineLineAction('todotxt-archive', archiveLine);
  defineDocAction('todotxt-sort', sortLines);

  // Map leader (\) + key to actions (Normal mode).
  Vim.mapCommand('\\x', 'action', 'todotxt-toggle-done', {}, { context: 'normal' });
  Vim.mapCommand('\\j', 'action', 'todotxt-priority-down', {}, { context: 'normal' });
  Vim.mapCommand('\\k', 'action', 'todotxt-priority-up', {}, { context: 'normal' });
  Vim.mapCommand('\\a', 'action', 'todotxt-set-pri-a', {}, { context: 'normal' });
  Vim.mapCommand('\\b', 'action', 'todotxt-set-pri-b', {}, { context: 'normal' });
  Vim.mapCommand('\\c', 'action', 'todotxt-set-pri-c', {}, { context: 'normal' });
  Vim.mapCommand('\\d', 'action', 'todotxt-insert-date', {}, { context: 'normal' });
  Vim.mapCommand('\\D', 'action', 'todotxt-archive', {}, { context: 'normal' });
  Vim.mapCommand('\\s', 'action', 'todotxt-sort', {}, { context: 'normal' });
}
