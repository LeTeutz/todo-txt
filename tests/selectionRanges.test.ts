import { describe, expect, it } from 'vitest';

import {
  applyTextChanges,
  deleteSelectedLines,
  duplicateSelectedLines,
  lineRangesForSelections,
  selectedText,
  transformSelectedLines,
} from '../ui/src/utils/selectionRanges';

const TEXT = 'alpha\nbeta\ngamma\ndelta';

describe('multi-selection line operations', () => {
  it('expands selections to lines and deduplicates overlaps', () => {
    expect(
      lineRangesForSelections(TEXT, [
        { from: 1, to: 3 },
        { from: 2, to: 8 },
        { from: 12, to: 15 },
      ]),
    ).toEqual([{ from: 0, to: 16 }]);
  });

  it('applies a line transform once to every selected line', () => {
    const changes = transformSelectedLines(
      TEXT,
      [
        { from: 1, to: 2 },
        { from: 12, to: 13 },
      ],
      (line) => `x ${line}`,
    );

    expect(applyTextChanges(TEXT, changes)).toBe(
      'x alpha\nbeta\nx gamma\ndelta',
    );
  });

  it('deletes disjoint lines without leaving a leading or trailing gap', () => {
    const changes = deleteSelectedLines(TEXT, [
      { from: 1, to: 2 },
      { from: 18, to: 20 },
    ]);

    expect(applyTextChanges(TEXT, changes)).toBe('beta\ngamma');
  });

  it('duplicates each selected line after its original', () => {
    const changes = duplicateSelectedLines(TEXT, [
      { from: 1, to: 2 },
      { from: 12, to: 13 },
    ]);

    expect(applyTextChanges(TEXT, changes)).toBe(
      'alpha\nalpha\nbeta\ngamma\ngamma\ndelta',
    );
  });

  it('joins multiple copied selections in document order', () => {
    expect(
      selectedText(TEXT, [
        { from: 11, to: 16 },
        { from: 0, to: 5 },
      ]),
    ).toBe('alpha\ngamma');
  });
});
