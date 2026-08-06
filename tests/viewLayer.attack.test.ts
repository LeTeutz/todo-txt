/**
 * One date-validity policy across every view layer.
 *
 * The app takes a deliberate position on shape-valid but impossible dates:
 * `dueStatus.classifyDue` refuses to classify `due:2026-02-31` or
 * `due:0000-00-00`, and cm-todotxt-due.test.tsx pins it ("does not tint an
 * invalid date, however overdue it looks as a string"). The reason is that
 * painting a red deadline asserts urgency the app cannot actually parse.
 *
 * The filter layer and the threshold layer must agree, because all three read
 * the same token off the same line. A naive string comparison makes them
 * disagree, and the disagreement is user-visible in two ways:
 *
 *   - `filter due:overdue` surfaces a deadline the editor itself declines to
 *     tint, so the chip count and the decoration tell different stories.
 *   - two equally malformed `t:` tokens get OPPOSITE treatment, decided by
 *     lexicographic luck rather than any rule the user could predict:
 *     `t:2026-02-31` sorts below today and stays visible, `t:9999-99-99`
 *     sorts above it and is hidden. A `t:` typo that happens to sort high
 *     pushes a real task to 0.14 opacity with nothing on screen explaining
 *     why.
 *
 * Tokenizing is deliberately NOT gated: `lineDue` and `lineThreshold` keep
 * reporting what is written on the line, because the decoration layer relies
 * on finding the same token the tint does. Validity is a matching decision,
 * not a tokenizing one.
 *
 * The remaining sections pin the degenerate and boundary cases of the filter
 * grammar, and the one shared definition of a blank line, so a later refactor
 * cannot quietly lose either.
 */
import { describe, expect, it } from 'vitest';

import {
  addDaysIso,
  filterCounts,
  isFilterable,
  lineDue,
  matchesFilter,
  parseFilterExpr,
  tryParseFilterExpr,
} from '../ui/src/utils/filterExpr';
import {
  isThresholdFuture,
  lineThreshold,
  thresholdCounts,
} from '../ui/src/utils/threshold';
import { classifyDue } from '../ui/src/utils/dueStatus';
import { hiddenCounts, isHiddenLine } from '../ui/src/utils/hidden';
import { COMMANDS } from '../ui/src/utils/commands';

/** Fixed "today" so nothing here depends on when the suite runs. */
const TODAY = '2026-08-05';

const match = (line: string, expr: string) =>
  matchesFilter(line, parseFilterExpr(expr), TODAY);

// ===========================================================================
// `due:` terms honour the same date-validity policy as the tint
// ===========================================================================

describe('due: filter terms vs an impossible date', () => {
  it.each([
    ['Feb 31', 'pay tax due:2026-02-31'],
    ['month 13', 'pay tax due:2026-13-01'],
    ['all zeroes', 'pay tax due:0000-00-00'],
    ['day 00', 'pay tax due:2026-08-00'],
  ])('does not call %s overdue', (_label, line) => {
    // The tint layer already refuses to classify these — the filter must
    // agree, or `filter due:overdue` surfaces a deadline the editor itself
    // declines to assert.
    expect(classifyDue(line, TODAY)).toBeNull();
    expect(match(line, 'due:overdue')).toBe(false);
  });

  it('does not call an impossible date due today', () => {
    expect(match('thing due:0000-00-00', 'due:today')).toBe(false);
  });

  it('does not pull an impossible date into a due:<=Nd window', () => {
    expect(match('thing due:2026-02-31', 'due:<=7d')).toBe(false);
    expect(match('thing due:0000-00-00', 'due:<=365d')).toBe(false);
  });

  it('a negated due: term treats an impossible date as "no due date"', () => {
    // `-due:overdue` means "this line is not overdue". A line whose date
    // cannot be parsed is not overdue, so it must MATCH the negation — the
    // same answer it would give for a line with no `due:` at all.
    expect(match('thing due:2026-02-31', '-due:overdue')).toBe(true);
    expect(match('thing with no date', '-due:overdue')).toBe(true);
  });

  it('still leaves the token itself readable to lineDue', () => {
    // Deliberately unchanged: `lineDue` reports what is WRITTEN on the line.
    // Validity is a matching decision, not a tokenizing one, and the
    // decoration layer relies on `lineDue` finding the same token the tint
    // does. Only `matchesFilter` gained the validity gate.
    expect(lineDue('thing due:2026-02-31')).toBe('2026-02-31');
  });

  it('keeps real dates working exactly as before', () => {
    expect(match('a due:2026-08-04', 'due:overdue')).toBe(true);
    expect(match('a due:2026-08-05', 'due:today')).toBe(true);
    expect(match('a due:2026-08-12', 'due:<=7d')).toBe(true);
    expect(match('a due:2026-08-13', 'due:<=7d')).toBe(false);
    // A leap day is real in 2024 and not in 2026.
    expect(match('a due:2024-02-29', 'due:overdue')).toBe(true);
    expect(match('a due:2026-02-29', 'due:overdue')).toBe(false);
  });

  it('excludes an impossible date from the chip tally', () => {
    const content = 'a due:2026-08-04\nb due:2026-02-31\nc';
    // 3 real lines; only the genuinely overdue one matches.
    expect(filterCounts(content, parseFilterExpr('due:overdue'), TODAY)).toEqual(
      { matched: 1, total: 3 },
    );
  });
});

// ===========================================================================
// `t:` threshold hiding honours the same policy
// ===========================================================================

describe('t: threshold vs an impossible date', () => {
  it.each([
    ['Feb 31', 'later t:2026-02-31'],
    ['month 13', 'later t:2026-13-01'],
    ['nines', 'later t:9999-99-99'],
    ['all zeroes', 'later t:0000-00-00'],
  ])('never treats %s as a future threshold', (_label, line) => {
    expect(isThresholdFuture(line, TODAY)).toBe(false);
  });

  it('gives two equally malformed t: tokens the SAME answer', () => {
    // Two malformed tokens must not diverge on lexicographic accident alone:
    // that is what makes one typo inert and the other push a real task out of
    // sight.
    expect(isThresholdFuture('a t:2026-02-31', TODAY)).toBe(
      isThresholdFuture('a t:9999-99-99', TODAY),
    );
  });

  it('still reports the written token to lineThreshold', () => {
    // Same split as `lineDue`: tokenizing is unchanged, only the future/not
    // decision gained the validity gate. `recurrence.ts` reads this to shift a
    // recurring task's `t:`, and it must keep seeing what the user typed.
    expect(lineThreshold('later t:2026-02-31')).toBe('2026-02-31');
  });

  it('keeps real thresholds working exactly as before', () => {
    expect(isThresholdFuture('a t:2026-08-06', TODAY)).toBe(true);
    // Thresholded FOR today is actionable today — not future.
    expect(isThresholdFuture('a t:2026-08-05', TODAY)).toBe(false);
    expect(isThresholdFuture('a t:2026-08-04', TODAY)).toBe(false);
    expect(isThresholdFuture('a t:2024-02-29', TODAY)).toBe(false);
  });

  it('excludes an impossible threshold from the chip tally', () => {
    const content = 'a t:2999-01-01\nb t:9999-99-99\nc';
    expect(thresholdCounts(content, 'hide', TODAY)).toEqual({
      hidden: 1,
      total: 3,
    });
  });
});

// ===========================================================================
// Degenerate and boundary filter expressions
// ===========================================================================

describe('degenerate filter expressions', () => {
  it('rejects an empty or whitespace-only expression', () => {
    expect(() => parseFilterExpr('')).toThrow(/expression is required/);
    expect(() => parseFilterExpr('   \t \n ')).toThrow(/expression is required/);
    expect(tryParseFilterExpr('   ')).toBeNull();
  });

  it('rejects a bare negation and a malformed pri:/due: term', () => {
    expect(() => parseFilterExpr('-')).toThrow(/negate something/);
    expect(() => parseFilterExpr('pri:AA')).toThrow(/expected a letter/);
    expect(() => parseFilterExpr('pri:C-A')).toThrow(/reversed/);
    expect(() => parseFilterExpr('due:tomorow')).toThrow(/expected today/);
    expect(() => parseFilterExpr('due:<=d')).toThrow(/expected today/);
  });

  it('treats a lone @ or + as plain text, not an empty token match', () => {
    // Guards against `@` parsing as `context('')`, which `hasToken` would
    // turn into a regex matching every whitespace boundary — i.e. a filter
    // that matches everything while looking like it filters.
    expect(match('email @home', '@')).toBe(true);
    expect(match('no at sign here', '@')).toBe(false);
    expect(match('a + b', '+')).toBe(true);
    expect(match('no plus', '+')).toBe(false);
  });

  it('matches @ctx / +proj whole-token only, case-insensitively', () => {
    expect(match('go @work', '@work')).toBe(true);
    expect(match('go @workshop', '@work')).toBe(false);
    expect(match('go @WORK', '@work')).toBe(true);
    expect(match('go +Deck', '+deck')).toBe(true);
    expect(match('go +Decking', '+deck')).toBe(false);
  });

  it('AND-combines terms and matches nothing when they conflict', () => {
    expect(match('a @home', '@home -@home')).toBe(false);
    expect(
      filterCounts('a @home\nb @work', parseFilterExpr('@home @work'), TODAY),
    ).toEqual({ matched: 0, total: 2 });
  });

  it('survives unicode and a very long expression', () => {
    expect(match('café au lait', 'CAFÉ')).toBe(true);
    expect(match('turkish ı dotless', 'DOTLESS')).toBe(true);
    // Regex-special characters are escaped in @ctx / +proj matching.
    expect(match('a @c++ b', '@c++')).toBe(true);
    expect(match('a @cxx b', '@c++')).toBe(false);
    const long = 'x'.repeat(5000);
    expect(match(long, long)).toBe(true);
    expect(match(long.slice(0, 4999), long)).toBe(false);
  });

  it('counts whitespace-only lines as spacers, never as tasks', () => {
    expect(isFilterable('   \t ')).toBe(false);
    expect(filterCounts('a\n   \n\nb', null, TODAY)).toEqual({
      matched: 2,
      total: 2,
    });
    expect(thresholdCounts('a\n   \n\nb', 'hide', TODAY)).toEqual({
      hidden: 0,
      total: 2,
    });
    expect(hiddenCounts('a\n   \n\nb h:1', 'hide')).toEqual({
      hidden: 1,
      total: 2,
    });
  });

  it('reads pri: from both the (A) prefix and the pri:A round-trip tag', () => {
    // The done tab stores priority as `pri:X`, so a filter that only read the
    // prefix would silently miss every completed prioritized task.
    expect(match('(A) live task', 'pri:A')).toBe(true);
    expect(match('x 2026-08-04 done task pri:A', 'pri:A')).toBe(true);
    expect(match('x 2026-08-04 done task pri:A', 'pri:A-C')).toBe(true);
    expect(match('x 2026-08-04 done task pri:D', 'pri:A-C')).toBe(false);
  });

  it('h:1 is a flag, and near misses are not it', () => {
    expect(isHiddenLine('note h:1')).toBe(true);
    expect(isHiddenLine('note h:1 more')).toBe(true);
    for (const near of ['note h:10', 'note h:0', 'note ph:1', 'note h:1x']) {
      expect(isHiddenLine(near)).toBe(false);
    }
  });

  it('addDaysIso clamps month and year ends in a stable UTC frame', () => {
    expect(addDaysIso('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDaysIso('2026-02-28', 1)).toBe('2026-03-01');
    expect(addDaysIso('2024-02-28', 1)).toBe('2024-02-29');
    expect(addDaysIso('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDaysIso('2026-03-01', -1)).toBe('2026-02-28');
    expect(addDaysIso('2026-08-05', 0)).toBe('2026-08-05');
    expect(() => addDaysIso('not-a-date', 1)).toThrow(/expected YYYY-MM-DD/);
  });

  it('due:<=0d still includes already-overdue lines', () => {
    expect(match('a due:2026-01-01', 'due:<=0d')).toBe(true);
    expect(match('a due:2026-08-05', 'due:<=0d')).toBe(true);
    expect(match('a due:2026-08-06', 'due:<=0d')).toBe(false);
  });
});

// ===========================================================================
// One definition of "blank line" across every list / view surface
// ===========================================================================

describe('what counts as a blank line', () => {
  const CONTENT = 'Buy milk\n   \n\nSell eggs';

  it('keeps a whitespace-only line out of the list result panel', () => {
    // `isFilterable` / `isThresholdable` / `isHideable`, `enumerateNonBlank`
    // and `applyDo`'s own blank guard must share one definition of blank:
    // `trim() === ''`. Were `enumerateNonBlank` to use `=== ''` instead, the
    // result panel would offer a NUMBERED but empty row, and clicking it (or
    // running `do 2`) would report success while doing nothing — `applyDo`
    // no-ops on exactly the line the panel had just offered.
    const list = COMMANDS.find((c) => c.name === 'list')!;
    const result = list.apply(CONTENT, [], 'todo');
    expect(result.type).toBe('filter');
    if (result.type !== 'filter') return;
    expect(result.lines).toEqual([
      { index: 1, text: 'Buy milk' },
      { index: 4, text: 'Sell eggs' },
    ]);
  });

  it('keeps the real 1-based line numbers so jump-to-line stays honest', () => {
    // Skipping a row must never renumber the rows after it: the panel's index
    // is fed straight to `handleResultJump` and to `do` / `del` / `move`, so a
    // compacted number would address the wrong line.
    const listall = COMMANDS.find((c) => c.name === 'listall')!;
    const result = listall.apply(CONTENT, [], 'todo');
    if (result.type !== 'filter') throw new Error('expected a filter result');
    expect(result.lines.map((l) => l.index)).toEqual([1, 4]);
  });

  it('agrees with applyDo, which refuses to act on such a line', () => {
    const doCmd = COMMANDS.find((c) => c.name === 'do')!;
    const result = doCmd.apply(CONTENT, ['2'], 'todo');
    if (result.type !== 'mutation') throw new Error('expected a mutation');
    expect(result.content).toBe(CONTENT);
  });

  it('agrees with every chip tally', () => {
    expect(filterCounts(CONTENT, null, TODAY).total).toBe(2);
    expect(thresholdCounts(CONTENT, 'hide', TODAY).total).toBe(2);
    expect(hiddenCounts(CONTENT, 'hide').total).toBe(2);
  });
});
