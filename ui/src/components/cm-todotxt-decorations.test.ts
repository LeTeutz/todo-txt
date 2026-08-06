/**
 * Regression guard for the "App crashed / Permission denied to access object"
 * bug hit on first use.
 *
 * buildDecorations() used to add the priority + past-due marks to the
 * RangeSetBuilder BEFORE the sorted inline marks. On a line with an inline
 * token (creation date / +project) to the LEFT of a past-due tag, the sorted
 * inline pass then added a `from` smaller than the past-due mark's `from`,
 * violating RangeSetBuilder's strict non-decreasing-`from` contract and
 * throwing — which crashed the CodeMirror editor the moment the starter
 * example loaded. sortedLineMarks now returns ALL marks pre-sorted.
 */
import { describe, it, expect } from 'vitest';
import { sortedLineMarks } from './cm-todotxt-decorations';
import { STARTER_EXAMPLE } from '../utils/starterExample';

/** Assert marks are non-decreasing by `from` — the RangeSetBuilder contract. */
function assertSortedByFrom(marks: { from: number }[]): void {
  for (let i = 1; i < marks.length; i++) {
    expect(marks[i].from).toBeGreaterThanOrEqual(marks[i - 1].from);
  }
}

describe('sortedLineMarks', () => {
  it('sorts marks when an inline token precedes a past-due tag (the crash case)', () => {
    // Creation date + project both sit LEFT of a guaranteed-past due: tag —
    // the exact line shape that crashed the editor.
    const line = '(A) 2020-01-01 file taxes +finance @home due:2020-02-02';
    const marks = sortedLineMarks(line, 0, '2026-07-24');

    assertSortedByFrom(marks);
    expect(marks.length).toBeGreaterThanOrEqual(5); // pri, due, 2x date, proj, ctx, kv
    expect(marks[0].from).toBe(0); // priority leads the line
  });

  it('keeps every starter-example line sorted with the past-due branch active', () => {
    const today = '2026-07-24'; // after the example's due:2026-05-10 → past-due fires
    for (const line of STARTER_EXAMPLE.split('\n')) {
      if (line.trim() === '') continue;
      // Mirror buildDecorations: hidden (h:1) and completed (x ) lines get a
      // single whole-line mark and never pass through sortedLineMarks.
      if (/(?:^|\s)h:1(?:\s|$)/.test(line)) continue;
      if (/^x\s/.test(line)) continue;
      assertSortedByFrom(sortedLineMarks(line, 0, today));
    }
  });

  it('offsets marks by lineFrom (multi-line documents)', () => {
    const marks = sortedLineMarks('(A) do it +proj due:2020-01-01', 100, '2026-07-24');
    assertSortedByFrom(marks);
    expect(marks[0].from).toBe(100); // priority anchored at the line offset
  });
});
