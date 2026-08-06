/**
 * Pure offset math for multi-line selection operations.
 *
 * Covers `ui/src/utils/selectionRanges.ts` (lineRangesForSelections,
 * selectedText, transformSelectedLines, deleteSelectedLines,
 * duplicateSelectedLines, applyTextChanges), the per-line transforms in
 * `ui/src/utils/todotxt.ts` (markLineDone, setPriority, addCreationDate) and
 * `completeLineWithRecurrence` in `ui/src/utils/recurrence.ts`.
 *
 * The sibling `tests/selectionRanges.test.ts` covers the happy path: a
 * four-line, all-non-blank, LF-only document with no leading newline and
 * sorted ranges. This file covers everything that is not that — a document
 * whose first line is blank, CRLF terminators, overlapping and out-of-order
 * ranges, degenerate selections, and scale.
 *
 * All of it guards destructive user actions. The popover's Done, Priority,
 * Date, Delete and Duplicate buttons each resolve a set of selection ranges to
 * a set of whole lines and then rewrite them, so an off-by-one in the range
 * math is not cosmetic: it silently edits or removes a line the user did not
 * select, or silently skips one they did.
 */
import { describe, expect, it } from 'vitest';

import {
  applyTextChanges,
  deleteSelectedLines,
  duplicateSelectedLines,
  lineRangesForSelections,
  selectedText,
  transformSelectedLines,
  type TextRange,
} from '../ui/src/utils/selectionRanges';
import {
  addCreationDate,
  markLineDone,
  setPriority,
} from '../ui/src/utils/todotxt';
import { completeLineWithRecurrence } from '../ui/src/utils/recurrence';

const T = '2026-08-05';

/** Ctrl+A: one range spanning the whole document. */
const selectAll = (text: string): TextRange[] => [{ from: 0, to: text.length }];

// ===========================================================================
// A document whose FIRST line is blank
//
// The hazard is a backwards newline search that starts at index 0 instead of
// being disabled. `text.lastIndexOf('\n', Math.max(0, from - 1)) + 1` clamps
// the search START to index 0 when `from === 0`, so a newline sitting AT index
// 0 is found and `lineStart` becomes 1 — one past the selection's own start.
// The result is either an INVERTED range (`from > to`) or a degenerate
// zero-width one.
//
// The user-facing case is entirely ordinary: a todo.txt whose first line is
// blank (a spacer above the first task, or what a delete leaves behind). Put
// the caret at the very start of the document and press Shift+Down, or drag
// from the top-left to the start of line 2 — that is the selection
// {from: 0, to: 1} — then use the selection popover. A degenerate range makes
// Delete a silent no-op while the UI still reports "Selected line(s) deleted".
// ===========================================================================

describe('leading-newline document: line ranges stay well-formed', () => {
  const DOC = '\nalpha';

  it('never emits an inverted range (from > to)', () => {
    const ranges = lineRangesForSelections(DOC, [{ from: 0, to: 1 }]);

    // A clamped backwards search yields [{ from: 1, to: 0 }] here, with from
    // GREATER than to.
    for (const range of ranges) {
      expect(range.to).toBeGreaterThanOrEqual(range.from);
    }
    // The blank first line is [0, 0); the selection covers it.
    expect(ranges).toEqual([{ from: 0, to: 0 }]);
  });

  it('deletes a blank first line instead of silently no-opping', () => {
    // handleDeleteLine dispatches these changes and then unconditionally
    // toasts "Selected line(s) deleted".
    const changes = deleteSelectedLines(DOC, [{ from: 0, to: 1 }]);

    // A degenerate range yields [{ from: 1, to: 1, insert: '' }] — a
    // zero-width no-op change, so the document is untouched while the toast
    // claims success.
    expect(applyTextChanges(DOC, changes)).toBe('alpha');
  });

  it('removes both lines when two blank leading lines are selected', () => {
    const doc = '\n\nalpha';
    // Selection {0,2} covers blank line 1 and blank line 2.
    const changes = deleteSelectedLines(doc, [{ from: 0, to: 2 }]);

    // A range collapsed to the degenerate { from: 1, to: 1 } leaves '\nalpha':
    // one of the two selected blank lines survives.
    expect(applyTextChanges(doc, changes)).toBe('alpha');
  });

  it('covers line 1 under Ctrl+A on a leading-blank document', () => {
    const doc = '\nalpha\nbeta';

    // A clamped search yields [{ from: 1, to: 11 }], leaving line 1 outside
    // the range so no operation can ever reach it. The blank-line guards in
    // markLineDone / setPriority / addCreationDate mask the consequence for
    // those three, but any transform without such a guard would inherit a
    // silently-skipped first line.
    expect(lineRangesForSelections(doc, selectAll(doc))).toEqual([
      { from: 0, to: 11 },
    ]);
  });
});

// ===========================================================================
// markLineDone's pri: round-trip and the line terminator
//
// A CRLF todo.txt is a first-class case: the backend goes out of its way to
// preserve CRLF (`_read_text_preserving_newlines` opens with newline='' so a
// CRLF file is not silently rewritten). Take a completed line carrying the
// round-trip priority tag, e.g. `x 2026-08-05 write docs pri:A`, select it, and
// press Done in the popover to UN-complete it. A trailing-whitespace trim in
// the pri: restore path (`.replace(/\s+$/, '')`) would eat the line's own
// `\r`, writing that one line back LF-terminated inside a CRLF file while the
// plain (no pri:) path keeps its CR — so the two paths disagree and the file
// ends up with mixed terminators.
//
// Nothing downstream repairs that: the save endpoint writes the editor buffer
// verbatim (`_dominant_terminator` is only consulted by archive/move), so the
// mixed terminator reaches disk.
// ===========================================================================

describe('CRLF: the pri: round-trip preserves the line terminator', () => {
  it('un-completing a pri: line keeps its trailing CR', () => {
    // Control: the plain path is correct.
    expect(markLineDone('x 2026-08-05 alpha\r', T)).toBe('alpha\r');

    // A trailing-whitespace trim would return '(A) alpha', the \r gone.
    expect(markLineDone('x 2026-08-05 alpha pri:A\r', T)).toBe('(A) alpha\r');
  });

  it('a CRLF document round-trips through Done → Done unchanged', () => {
    const doc = '(A) alpha\r\n(B) beta\r\ngamma';

    const completed = applyTextChanges(
      doc,
      transformSelectedLines(doc, selectAll(doc), (l) => markLineDone(l, T)),
    );
    const restored = applyTextChanges(
      completed,
      transformSelectedLines(completed, selectAll(completed), (l) =>
        markLineDone(l, T),
      ),
    );

    // Unguarded this yields '(A) alpha\n(B) beta\ngamma' — every CR on a
    // prioritised line lost, so a Done/undo bounce silently converts the
    // file's line endings.
    expect(restored).toBe(doc);
  });
});

// ===========================================================================
// The line-start rule, restated independently of the shipped implementation.
//
// `patchedLineRanges` below is a first-principles replica of the arithmetic
// `lineRangesForSelections` has to implement, with the one rule that matters
// spelled out:
//   const lineStart = from === 0 ? 0 : text.lastIndexOf('\n', from - 1) + 1;
//
// Keeping a second copy is deliberate: it pins the RULE rather than the current
// code, and the cross-check below runs it against the shipped function on
// documents that do not start with a newline, so the two cannot drift apart
// silently.
// ===========================================================================

function patchedLineRanges(
  text: string,
  selections: readonly TextRange[],
): TextRange[] {
  const out: TextRange[] = [];
  for (const selection of selections) {
    const from = Math.max(0, Math.min(selection.from, selection.to, text.length));
    const to = Math.max(0, Math.min(Math.max(selection.from, selection.to), text.length));
    if (from === to) continue;
    // THE RULE: never start the backwards search at index 0 when from === 0.
    const lineStart = from === 0 ? 0 : text.lastIndexOf('\n', from - 1) + 1;
    const endProbe = text[to - 1] === '\n' ? to - 1 : to;
    const nextNewline = text.indexOf('\n', endProbe);
    out.push({ from: lineStart, to: nextNewline === -1 ? text.length : nextNewline });
  }
  return out;
}

describe('the line-start rule yields correct ranges', () => {
  it('handles a leading-newline document and agrees elsewhere', () => {
    expect(patchedLineRanges('\nalpha', [{ from: 0, to: 1 }])).toEqual([
      { from: 0, to: 0 },
    ]);
    expect(patchedLineRanges('\n\nalpha', [{ from: 0, to: 2 }])).toEqual([
      { from: 0, to: 1 },
    ]);
    expect(
      patchedLineRanges('\nalpha\nbeta', [{ from: 0, to: 11 }]),
    ).toEqual([{ from: 0, to: 11 }]);

    // Documents that do NOT start with a newline are bit-identical.
    const doc = 'alpha\nbeta\ngamma';
    for (const sel of [
      [{ from: 0, to: 3 }],
      [{ from: 0, to: 6 }],
      [{ from: 5, to: 6 }],
      [{ from: 5, to: 11 }],
      [{ from: 0, to: doc.length }],
      [{ from: 7, to: 8 }],
    ]) {
      expect(patchedLineRanges(doc, sel)).toEqual(
        lineRangesForSelections(doc, sel),
      );
    }
  });

  it('feeds delete correctly once the ranges are right', () => {
    // deleteSelectedLines' own newline-absorption logic, unchanged, fed the
    // patched ranges.
    const expand = (text: string, ranges: TextRange[]) =>
      ranges.map((range) => {
        if (range.to < text.length && text[range.to] === '\n') {
          return { from: range.from, to: range.to + 1 };
        }
        if (range.from > 0 && text[range.from - 1] === '\n') {
          return { from: range.from - 1, to: range.to };
        }
        return range;
      });

    const one = '\nalpha';
    expect(
      applyTextChanges(
        one,
        expand(one, patchedLineRanges(one, [{ from: 0, to: 1 }])).map((r) => ({
          ...r,
          insert: '',
        })),
      ),
    ).toBe('alpha');

    const two = '\n\nalpha';
    expect(
      applyTextChanges(
        two,
        expand(two, patchedLineRanges(two, [{ from: 0, to: 2 }])).map((r) => ({
          ...r,
          insert: '',
        })),
      ),
    ).toBe('alpha');
  });
});

// ===========================================================================
// Invariants of the offset math, each pinned so a refactor cannot lose it.
// ===========================================================================

describe('multi-range: every range applied EXACTLY once', () => {
  it('a line covered by two overlapping ranges is transformed once, not twice', () => {
    const doc = 'aaa\nbbbb\nccccc';
    const out = applyTextChanges(
      doc,
      transformSelectedLines(
        doc,
        [
          { from: 0, to: 14 },
          { from: 5, to: 7 }, // fully contained in the first
          { from: 1, to: 6 }, // straddles lines 1-2, overlaps both
        ],
        (line) => `M${line}`,
      ),
    );
    expect(out).toBe('Maaa\nMbbbb\nMccccc');
    expect(out.match(/MM/g)).toBeNull();
  });

  it('two ranges inside ONE line collapse to a single line rewrite', () => {
    const doc = 'alpha beta gamma';
    const changes = transformSelectedLines(
      doc,
      [
        { from: 0, to: 2 },
        { from: 11, to: 13 },
      ],
      (line) => `M${line}`,
    );
    expect(changes).toHaveLength(1);
    expect(applyTextChanges(doc, changes)).toBe('Malpha beta gamma');
  });

  it('ranges supplied out of document order are normalised before merging', () => {
    const doc = 'aaa\nbbbb\nccccc\ndddddd';
    const unsorted = [
      { from: 16, to: 17 },
      { from: 1, to: 2 },
      { from: 6, to: 7 },
    ];
    expect(lineRangesForSelections(doc, unsorted)).toEqual([
      { from: 0, to: 8 },
      { from: 15, to: 21 },
    ]);
    expect(applyTextChanges(doc, transformSelectedLines(doc, unsorted, (l) => `M${l}`))).toBe(
      'Maaa\nMbbbb\nccccc\nMdddddd',
    );
  });

  it('adjacent line ranges merge (joinAdjacent) while a gap line survives', () => {
    const doc = 'aaa\nbbbb\nccccc\ndddddd';
    // lines 1+2 are adjacent -> one range; line 4 is separated by line 3.
    expect(
      lineRangesForSelections(doc, [
        { from: 1, to: 2 },
        { from: 5, to: 6 },
        { from: 16, to: 17 },
      ]),
    ).toEqual([
      { from: 0, to: 8 },
      { from: 15, to: 21 },
    ]);
  });
});

describe('ordering and shift: emitted changes stay valid under applyTextChanges', () => {
  // Deliberately unequal line lengths so an off-by-N cannot hide.
  it('a LONGER replacement on three non-adjacent blocks does not drift', () => {
    const doc = 'a\nbb\nccc\ndddd\neeeee\nffffff\nggggggg';
    const changes = transformSelectedLines(
      doc,
      [
        { from: 0, to: 1 }, // "a"
        { from: 9, to: 10 }, // "dddd"
        { from: 27, to: 28 }, // "ggggggg" — last line, no terminator
      ],
      (line) => `x ${T} ${line}`,
    );
    expect(applyTextChanges(doc, changes)).toBe(
      `x ${T} a\nbb\nccc\nx ${T} dddd\neeeee\nffffff\nx ${T} ggggggg`,
    );
  });

  it('SHORTER and LONGER replacements in the same pass do not drift', () => {
    const doc =
      'x 2026-08-01 alpha\nb\nx 2026-08-02 a very much longer completed line\nz';
    const changes = transformSelectedLines(
      doc,
      [
        { from: 0, to: 1 },
        { from: 19, to: 20 },
        { from: 21, to: 22 },
      ],
      (line) => markLineDone(line, T),
    );
    // lines 1 and 3 shrink (un-complete), line 2 grows (complete);
    // line 4 was never selected and must be byte-identical.
    expect(applyTextChanges(doc, changes)).toBe(
      `alpha\nx ${T} b\na very much longer completed line\nz`,
    );
  });

  it('a transform returning TWO lines for one keeps every later offset valid', () => {
    const doc =
      'call mum rec:1w due:2026-08-10\nshort\na much longer third task line';
    const changes = transformSelectedLines(doc, selectAll(doc), (line) =>
      completeLineWithRecurrence(line, T),
    );
    expect(applyTextChanges(doc, changes)).toBe(
      [
        `x ${T} call mum rec:1w due:2026-08-10`,
        `${T} call mum rec:1w due:2026-08-12`,
        `x ${T} short`,
        `x ${T} a much longer third task line`,
      ].join('\n'),
    );
  });

  it('two recurring lines each spawn exactly one next instance, in place', () => {
    const doc = 'water plants rec:3d\nfiller\nrent rec:+1m due:2026-09-01';
    const out = applyTextChanges(
      doc,
      transformSelectedLines(doc, selectAll(doc), (line) =>
        completeLineWithRecurrence(line, T),
      ),
    );
    const lines = out.split('\n');
    expect(lines).toHaveLength(5);
    expect(lines.filter((l) => l.includes('water plants'))).toHaveLength(2);
    expect(lines.filter((l) => l.includes('rent'))).toHaveLength(2);
    expect(lines[1]).toBe(`${T} water plants rec:3d`);
    expect(lines[4]).toBe(`${T} rent rec:+1m due:2026-10-01`);
  });
});

describe('blank and whitespace-only lines inside a merged range', () => {
  // transformSelectedLines applies the transform to EVERY line of a merged
  // block, and a merged block swallows any spacer line the user used to group
  // tasks. All three transforms carry an explicit
  // `if (line.trim() === '') return line;` guard; these hold them to it.
  it('Ctrl+A then priority(A) leaves a blank spacer blank', () => {
    const doc = 'alpha\n\nbeta';
    expect(
      applyTextChanges(
        doc,
        transformSelectedLines(doc, selectAll(doc), (l) => setPriority(l, 'A')),
      ),
    ).toBe('(A) alpha\n\n(A) beta');
  });

  it('Ctrl+A then Date leaves a blank spacer blank', () => {
    const doc = 'alpha\n\nbeta';
    expect(
      applyTextChanges(
        doc,
        transformSelectedLines(doc, selectAll(doc), (l) => addCreationDate(l, T)),
      ),
    ).toBe(`${T} alpha\n\n${T} beta`);
  });

  it('a whitespace-only line keeps its exact whitespace under all three transforms', () => {
    const doc = 'alpha\n \t  \nbeta';
    for (const transform of [
      (l: string) => setPriority(l, 'A'),
      (l: string) => addCreationDate(l, T),
      (l: string) => markLineDone(l, T),
      (l: string) => completeLineWithRecurrence(l, T),
    ]) {
      const out = applyTextChanges(
        doc,
        transformSelectedLines(doc, selectAll(doc), transform),
      );
      expect(out.split('\n')[1]).toBe(' \t  ');
    }
  });

  it('a CR-only line in a CRLF document counts as blank and is left alone', () => {
    const doc = 'alpha\r\n\r\nbeta';
    expect(
      applyTextChanges(
        doc,
        transformSelectedLines(doc, selectAll(doc), (l) => setPriority(l, 'A')),
      ),
    ).toBe('(A) alpha\r\n\r\n(A) beta');
  });
});

describe('CRLF: the \\r rides into the transform and must survive', () => {
  // lineRangesForSelections splits on \n only, so every line handed to a
  // transform in a CRLF document ends with \r. This covers the forward
  // direction of all three transforms; the pri: restore direction is above.
  const doc = 'alpha\r\nbeta\r\ngamma';

  it('setPriority keeps the CR at end of line', () => {
    expect(
      applyTextChanges(
        doc,
        transformSelectedLines(doc, selectAll(doc), (l) => setPriority(l, 'A')),
      ),
    ).toBe('(A) alpha\r\n(A) beta\r\n(A) gamma');
  });

  it('addCreationDate keeps the CR at end of line', () => {
    expect(
      applyTextChanges(
        doc,
        transformSelectedLines(doc, selectAll(doc), (l) => addCreationDate(l, T)),
      ),
    ).toBe(`${T} alpha\r\n${T} beta\r\n${T} gamma`);
  });

  it('markLineDone keeps the CR at end of line', () => {
    expect(
      applyTextChanges(
        doc,
        transformSelectedLines(doc, selectAll(doc), (l) => markLineDone(l, T)),
      ),
    ).toBe(`x ${T} alpha\r\nx ${T} beta\r\nx ${T} gamma`);
  });

  it('delete absorbs the whole CRLF terminator, leaving no stray CR', () => {
    expect(
      applyTextChanges(doc, deleteSelectedLines(doc, [{ from: 0, to: 2 }])),
    ).toBe('beta\r\ngamma');
  });

  it('duplicate reproduces the CR on the copy', () => {
    expect(
      applyTextChanges(doc, duplicateSelectedLines(doc, [{ from: 0, to: 2 }])),
    ).toBe('alpha\r\nalpha\r\nbeta\r\ngamma');
  });
});

describe('degenerate selections', () => {
  const doc = 'alpha\nbeta\ngamma';

  it('a reversed range (to < from) is normalised, not dropped', () => {
    expect(lineRangesForSelections(doc, [{ from: 9, to: 2 }])).toEqual([
      { from: 0, to: 10 },
    ]);
    expect(selectedText(doc, [{ from: 5, to: 0 }])).toBe('alpha');
  });

  it('a range beyond text.length is clamped, not out-of-bounds', () => {
    expect(lineRangesForSelections(doc, [{ from: 7, to: 999 }])).toEqual([
      { from: 6, to: 16 },
    ]);
    expect(lineRangesForSelections(doc, [{ from: 900, to: 999 }])).toEqual([]);
    expect(selectedText(doc, [{ from: 11, to: 999 }])).toBe('gamma');
  });

  it('a selection ending exactly at a line start does not reach that line', () => {
    expect(lineRangesForSelections(doc, [{ from: 0, to: 6 }])).toEqual([
      { from: 0, to: 5 },
    ]);
    expect(lineRangesForSelections(doc, [{ from: 5, to: 11 }])).toEqual([
      { from: 0, to: 10 },
    ]);
  });

  it('a selection of nothing but a newline resolves to the line above it', () => {
    expect(lineRangesForSelections(doc, [{ from: 5, to: 6 }])).toEqual([
      { from: 0, to: 5 },
    ]);
  });

  it('Ctrl+A on a document with a trailing newline excludes the phantom last line', () => {
    const trailing = 'alpha\nbeta\n';
    expect(lineRangesForSelections(trailing, selectAll(trailing))).toEqual([
      { from: 0, to: 10 },
    ]);
    // ...but delete still absorbs the terminator and clears the document.
    expect(
      applyTextChanges(trailing, deleteSelectedLines(trailing, selectAll(trailing))),
    ).toBe('');
  });

  it('the last line with no terminator is handled by all three operations', () => {
    expect(lineRangesForSelections(doc, [{ from: 12, to: 13 }])).toEqual([
      { from: 11, to: 16 },
    ]);
    expect(
      applyTextChanges(doc, deleteSelectedLines(doc, [{ from: 12, to: 13 }])),
    ).toBe('alpha\nbeta');
    expect(
      applyTextChanges(doc, duplicateSelectedLines(doc, [{ from: 12, to: 13 }])),
    ).toBe('alpha\nbeta\ngamma\ngamma');
  });
});

describe('copy semantics (selectedText)', () => {
  const doc = 'alpha\nbeta\ngamma';

  it('joins ranges in DOCUMENT order with a single newline, whatever order they arrive in', () => {
    expect(
      selectedText(doc, [
        { from: 11, to: 16 },
        { from: 0, to: 5 },
        { from: 6, to: 10 },
      ]),
    ).toBe('alpha\nbeta\ngamma');
  });

  it('does NOT expand to whole lines — a partial selection copies partially', () => {
    expect(selectedText(doc, [{ from: 1, to: 3 }])).toBe('lp');
  });

  it('two ranges inside one line are joined with a newline (CodeMirror parity)', () => {
    expect(
      selectedText('alpha beta gamma', [
        { from: 0, to: 5 },
        { from: 11, to: 16 },
      ]),
    ).toBe('alpha\ngamma');
  });

  it('a contained range does not duplicate its container text', () => {
    expect(
      selectedText(doc, [
        { from: 0, to: 10 },
        { from: 2, to: 4 },
      ]),
    ).toBe('alpha\nbeta');
  });

  it('collapsed ranges are dropped rather than emitting empty separator lines', () => {
    expect(
      selectedText(doc, [
        { from: 3, to: 3 },
        { from: 0, to: 5 },
        { from: 9, to: 9 },
      ]),
    ).toBe('alpha');
  });

  it('the joinAdjacent=false / =true asymmetry is harmless for copy', () => {
    // Two ranges that TOUCH across the newline. Merged or not, the emitted
    // string is identical, because the separator selectedText inserts is the
    // same '\n' the merged slice would have contained.
    expect(
      selectedText(doc, [
        { from: 0, to: 5 },
        { from: 6, to: 10 },
      ]),
    ).toBe('alpha\nbeta');
    expect(selectedText(doc, [{ from: 0, to: 10 }])).toBe('alpha\nbeta');
  });
});

describe('delete: no leading or trailing gap, and no over-reach', () => {
  it('deleting the first and last lines of a three-line document keeps the middle', () => {
    const doc = 'a\nbb\nccc';
    expect(
      applyTextChanges(
        doc,
        deleteSelectedLines(doc, [
          { from: 0, to: 1 },
          { from: 5, to: 8 },
        ]),
      ),
    ).toBe('bb');
  });

  it('deleting interior + final lines leaves no double newline', () => {
    const doc = 'a\nbb\nccc\ndddd';
    expect(
      applyTextChanges(
        doc,
        deleteSelectedLines(doc, [
          { from: 2, to: 3 },
          { from: 9, to: 10 },
        ]),
      ),
    ).toBe('a\nccc');
  });

  it('joinAdjacent=false in delete is REQUIRED — true would swallow the gap line', () => {
    // The expanded ranges are {0,2} and {5,9}: 2 and 5 are three apart, so
    // joinAdjacent=false keeps them separate and line 2 ("bb") survives.
    // With joinAdjacent=true the merge test is `from <= prev.to + 1`, which
    // still separates them here — but on a one-character gap it would not.
    const doc = 'a\nbb\nccc\ndddd';
    const changes = deleteSelectedLines(doc, [
      { from: 0, to: 1 },
      { from: 5, to: 6 },
    ]);
    expect(changes).toHaveLength(2);
    expect(applyTextChanges(doc, changes)).toBe('bb\ndddd');
  });

  it('deleting every line of the document yields an empty document', () => {
    const doc = 'alpha\nbeta\ngamma';
    expect(
      applyTextChanges(doc, deleteSelectedLines(doc, selectAll(doc))),
    ).toBe('');
  });
});

describe('duplicate', () => {
  it('duplicates several non-adjacent blocks, each after its own original', () => {
    const doc = 'a\nbb\nccc\ndddd\neeeee';
    expect(
      applyTextChanges(
        doc,
        duplicateSelectedLines(doc, [
          { from: 0, to: 1 },
          { from: 5, to: 6 },
          { from: 14, to: 15 },
        ]),
      ),
    ).toBe('a\na\nbb\nccc\nccc\ndddd\neeeee\neeeee');
  });

  it('duplicates a merged multi-line block as a block', () => {
    const doc = 'a\nbb\nccc';
    expect(
      applyTextChanges(doc, duplicateSelectedLines(doc, [{ from: 0, to: 4 }])),
    ).toBe('a\nbb\na\nbb\nccc');
  });

  it('a document that ends with a newline keeps exactly one trailing newline', () => {
    const doc = 'alpha\nbeta\n';
    expect(
      applyTextChanges(doc, duplicateSelectedLines(doc, selectAll(doc))),
    ).toBe('alpha\nbeta\nalpha\nbeta\n');
  });
});

describe('scale: 1200 lines, 600 ranges', () => {
  it('is correct and comfortably sub-quadratic in wall clock', () => {
    const N = 1200;
    const lines: string[] = [];
    for (let i = 0; i < N; i += 1) {
      lines.push(`task number ${i} ${'y'.repeat(i % 17)}`);
    }
    const text = lines.join('\n');
    const offsets: number[] = [];
    let acc = 0;
    for (const line of lines) {
      offsets.push(acc);
      acc += line.length + 1;
    }
    const selections = [];
    for (let i = 0; i < N; i += 2) {
      selections.push({ from: offsets[i], to: offsets[i] + 1 });
    }

    const started = Date.now();
    const changes = transformSelectedLines(text, selections, (line) =>
      setPriority(line, 'B'),
    );
    const out = applyTextChanges(text, changes);
    const elapsed = Date.now() - started;

    const outLines = out.split('\n');
    expect(changes).toHaveLength(N / 2);
    expect(outLines).toHaveLength(N);
    expect(outLines.filter((l) => l.startsWith('(B) '))).toHaveLength(N / 2);
    // Not applied twice anywhere.
    expect(outLines.filter((l) => l.startsWith('(B) (B)'))).toHaveLength(0);
    expect(outLines[0]).toBe('(B) task number 0 ');
    expect(outLines[1]).toBe('task number 1 y');
    expect(outLines[N - 1]).toBe(`task number ${N - 1} ${'y'.repeat((N - 1) % 17)}`);
    // Generous bound so this cannot flake; observed ~2 ms.
    expect(elapsed).toBeLessThan(2000);
  });

  it('delete of 600 alternating lines leaves exactly the other 600, in order', () => {
    const N = 1200;
    const lines: string[] = [];
    for (let i = 0; i < N; i += 1) lines.push(`t${i}${'z'.repeat(i % 11)}`);
    const text = lines.join('\n');
    const offsets: number[] = [];
    let acc = 0;
    for (const line of lines) {
      offsets.push(acc);
      acc += line.length + 1;
    }
    const selections = [];
    for (let i = 0; i < N; i += 2) {
      selections.push({ from: offsets[i], to: offsets[i] + 1 });
    }

    const started = Date.now();
    const out = applyTextChanges(text, deleteSelectedLines(text, selections));
    const elapsed = Date.now() - started;

    expect(out.split('\n')).toEqual(lines.filter((_, i) => i % 2 === 1));
    expect(elapsed).toBeLessThan(2000);
  });
});

// ===========================================================================
// Collapsed ranges: an alt-click caret selects its own line.
//
// A caret with no drag is a zero-width range, and it COUNTS. Skipping collapsed
// ranges would be the conservative choice for destructive buttons, but it makes
// multi-cursor silently partial: the user sees N blinking cursors and only one
// line changes. CodeMirror's own line commands act on every range, and the
// popover promises that actions apply to each selected line — this is the
// contract both of those imply.
// ===========================================================================
describe('collapsed ranges (alt-click carets) select their own line', () => {
  const doc = 'alpha\nbeta\ngamma';

  it('N carets with no drag act on all N lines', () => {
    expect(
      applyTextChanges(
        doc,
        transformSelectedLines(
          doc,
          [
            { from: 2, to: 2 },
            { from: 8, to: 8 },
            { from: 13, to: 13 },
          ],
          (line) => setPriority(line, 'A'),
        ),
      ),
    ).toBe('(A) alpha\n(A) beta\n(A) gamma');
    // Delete and Dup follow the same ranges, so they agree with the transform.
    expect(
      applyTextChanges(
        doc,
        deleteSelectedLines(doc, [
          { from: 2, to: 2 },
          { from: 13, to: 13 },
        ]),
      ),
    ).toBe('beta');
    expect(
      applyTextChanges(
        doc,
        duplicateSelectedLines(doc, [
          { from: 2, to: 2 },
          { from: 13, to: 13 },
        ]),
      ),
    ).toBe('alpha\nalpha\nbeta\ngamma\ngamma');
  });

  it('a drag PLUS alt-click carets acts on the drag AND the carets', () => {
    // The user sees one highlighted line and two extra blinking cursors. All
    // three lines change — which is what the three cursors imply, and what the
    // popover's own "actions apply to each selected line" promises.
    expect(
      applyTextChanges(
        doc,
        transformSelectedLines(
          doc,
          [
            { from: 0, to: 3 },
            { from: 8, to: 8 },
            { from: 13, to: 13 },
          ],
          (line) => setPriority(line, 'A'),
        ),
      ),
    ).toBe('(A) alpha\n(A) beta\n(A) gamma');
  });
});
