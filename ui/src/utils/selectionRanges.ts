export interface TextRange {
  from: number;
  to: number;
}

export interface TextChange extends TextRange {
  insert: string;
}

function clamp(value: number, length: number): number {
  return Math.max(0, Math.min(value, length));
}

function mergeRanges(ranges: TextRange[], joinAdjacent: boolean): TextRange[] {
  const sorted = [...ranges].sort((a, b) => a.from - b.from || a.to - b.to);
  const merged: TextRange[] = [];
  for (const range of sorted) {
    const previous = merged[merged.length - 1];
    const boundary = joinAdjacent ? previous?.to + 1 : previous?.to;
    if (previous && range.from <= boundary) {
      previous.to = Math.max(previous.to, range.to);
    } else {
      merged.push({ ...range });
    }
  }
  return merged;
}

/** Expand every non-empty selection to complete logical lines. */
export function lineRangesForSelections(
  text: string,
  selections: readonly TextRange[],
): TextRange[] {
  const ranges: TextRange[] = [];
  for (const selection of selections) {
    const rawFrom = Math.min(selection.from, selection.to);
    const rawTo = Math.max(selection.from, selection.to);
    const from = clamp(rawFrom, text.length);
    const to = clamp(rawTo, text.length);
    // A COLLAPSED range is an alt-click caret, and it selects its own line.
    // This used to `continue`, which made multi-cursor silently partial: a
    // drag plus two alt-click carets showed one highlight and two blinking
    // cursors, and Done / priority / Date / Del / Dup touched only the
    // highlight. Multi-cursor is a headline feature and CodeMirror's own line
    // commands act on every range, so the carets now count.
    //
    // But only a range that was ALREADY collapsed counts. A wholly
    // out-of-range selection (stale offsets from before the document shrank)
    // also collapses — to the end of the text — and treating that as a caret
    // would silently rewrite the LAST line on the strength of a dead range.
    if (rawFrom !== rawTo && from === to) continue;
    //
    // No special case is needed below: `endProbe` already collapses to `to`
    // when `to === from`, so the line lookup resolves the caret's own line.
    // (`selectedText` deliberately keeps dropping collapsed ranges — copying
    // a zero-width range yields nothing, matching CodeMirror.)

    // `lastIndexOf(needle, 0)` still MATCHES at index 0, so a document that
    // begins with a newline would push lineStart to 1 — past the selection's
    // own start — and emit an INVERTED range {from:1,to:0}. Delete then
    // silently no-ops (while toasting success) and the transforms slice an
    // empty string. from === 0 is always a line start, so say so directly.
    const lineStart = from === 0 ? 0 : text.lastIndexOf('\n', from - 1) + 1;
    const endProbe = to > from && text[to - 1] === '\n' ? to - 1 : to;
    const nextNewline = text.indexOf('\n', endProbe);
    const lineEnd = nextNewline === -1 ? text.length : nextNewline;
    ranges.push({ from: lineStart, to: lineEnd });
  }
  return mergeRanges(ranges, true);
}

/** How many individual LINES the per-line actions will rewrite.
 *
 * Not the number of ranges (an alt-click caret is a zero-width range that
 * still selects a line) and not the number of merged blocks (four adjacent
 * lines merge into ONE block, which would report "1"). The popover's status
 * promises "actions apply to each selected line", so the honest number is
 * lines — anything else understates what a click is about to change.
 */
export function countSelectedLines(
  text: string,
  selections: readonly TextRange[],
): number {
  return lineRangesForSelections(text, selections).reduce((total, range) => {
    const block = text.slice(range.from, range.to);
    // An empty block is still one line (a caret on a blank line).
    return total + (block === '' ? 1 : block.split('\n').length);
  }, 0);
}

export function selectedText(  text: string,
  selections: readonly TextRange[],
): string {
  return mergeRanges(
    selections
      .map(({ from, to }) => ({
        from: clamp(Math.min(from, to), text.length),
        to: clamp(Math.max(from, to), text.length),
      }))
      .filter((range) => range.from !== range.to),
    false,
  )
    .map((range) => text.slice(range.from, range.to))
    .join('\n');
}

export function transformSelectedLines(
  text: string,
  selections: readonly TextRange[],
  transform: (line: string) => string,
): TextChange[] {
  return lineRangesForSelections(text, selections)
    .map((range) => {
      const current = text.slice(range.from, range.to);
      return {
        ...range,
        insert: current.split('\n').map(transform).join('\n'),
      };
    })
    .filter((change) => change.insert !== text.slice(change.from, change.to));
}

export function deleteSelectedLines(
  text: string,
  selections: readonly TextRange[],
): TextChange[] {
  const expanded = lineRangesForSelections(text, selections).map((range) => {
    if (range.to < text.length && text[range.to] === '\n') {
      return { from: range.from, to: range.to + 1 };
    }
    if (range.from > 0 && text[range.from - 1] === '\n') {
      return { from: range.from - 1, to: range.to };
    }
    return range;
  });
  return mergeRanges(expanded, false).map((range) => ({
    ...range,
    insert: '',
  }));
}

export function duplicateSelectedLines(
  text: string,
  selections: readonly TextRange[],
): TextChange[] {
  return lineRangesForSelections(text, selections).map((range) => ({
    from: range.to,
    to: range.to,
    insert: `\n${text.slice(range.from, range.to)}`,
  }));
}

/** Duplicate, plus the selection that must accompany it.
 *
 * The copy is inserted AFTER the selected block, i.e. outside the selection.
 * Under `hidden hide` / `threshold hide` that matters: those layers reveal
 * only the lines under a selection range, so a copy landing outside is born
 * `display: none` — and once the popover dismisses the selection, the original
 * collapses too. The user clicks an ADD and watches a line DISAPPEAR while the
 * file silently grows.
 *
 * Returning the grown ranges alongside the changes keeps that arithmetic in
 * one place, so the caller cannot forget it and a test can pin the real
 * implementation instead of replicating it.
 */
export function duplicateSelectedLinesWithReveal(
  text: string,
  selections: readonly TextRange[],
): { changes: TextChange[]; ranges: TextRange[] } {
  const blocks = lineRangesForSelections(text, selections);
  const changes = duplicateSelectedLines(text, selections);
  let shift = 0;
  const ranges = blocks.map((block) => {
    const from = block.from + shift;
    // Each insert adds one '\n' plus a copy of the block.
    shift += block.to - block.from + 1;
    return { from, to: block.to + shift };
  });
  return { changes, ranges };
}

/** Apply non-overlapping changes in document order. Useful in tests and
 * non-CodeMirror fallbacks; CodeMirror accepts the same change shape. */
export function applyTextChanges(
  text: string,
  changes: readonly TextChange[],
): string {
  return [...changes]
    .sort((a, b) => b.from - a.from || b.to - a.to)
    .reduce(
      (current, change) =>
        current.slice(0, change.from) +
        change.insert +
        current.slice(change.to),
      text,
    );
}
