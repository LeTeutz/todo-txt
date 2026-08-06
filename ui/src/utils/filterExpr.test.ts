/**
 * filterExpr unit tests — the R1 filter-expression parser and matcher.
 *
 * `today` is injected everywhere rather than read from the clock, so the
 * suite cannot rot: a test asserting `due:overdue` must not start failing
 * the day the fixture's date drifts into the past.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  FILTER_STORAGE_KEY,
  addDaysIso,
  filterCounts,
  isFilterClearKeyword,
  isFilterable,
  lineDue,
  linePriority,
  loadStoredFilter,
  matchesFilter,
  parseFilterExpr,
  storeFilter,
  todayIso,
  tryParseFilterExpr,
} from './filterExpr';

const TODAY = '2026-08-05';

/** Parse then match in one step — the shape almost every case below wants. */
function hits(expr: string, line: string, today: string = TODAY): boolean {
  return matchesFilter(line, parseFilterExpr(expr), today);
}

// ===========================================================================
// Parsing — structure
// ===========================================================================

describe('parseFilterExpr — structure', () => {
  it('parses a single plain-text term', () => {
    const f = parseFilterExpr('taxes');
    expect(f.source).toBe('taxes');
    expect(f.terms).toEqual([
      { kind: 'text', negate: false, raw: 'taxes', value: 'taxes' },
    ]);
  });

  it('splits on whitespace runs and normalizes the source to single spaces', () => {
    const f = parseFilterExpr('  @home   +garden\t pri:A  ');
    expect(f.source).toBe('@home +garden pri:A');
    expect(f.terms).toHaveLength(3);
  });

  it('classifies @ctx, +proj, pri:, due: and plain text distinctly', () => {
    const kinds = parseFilterExpr('@home +garden pri:B due:today mow').terms.map(
      (t) => t.kind,
    );
    expect(kinds).toEqual(['context', 'project', 'priority', 'due', 'text']);
  });

  it('marks -term as negated and keeps the raw token for diagnostics', () => {
    const [term] = parseFilterExpr('-@waiting').terms;
    expect(term).toEqual({
      kind: 'context',
      negate: true,
      raw: '-@waiting',
      value: 'waiting',
    });
  });

  it('accepts pri: and due: keys case-insensitively', () => {
    expect(parseFilterExpr('PRI:a').terms[0]).toMatchObject({
      kind: 'priority',
      lo: 'A',
      hi: 'A',
    });
    expect(parseFilterExpr('DUE:TODAY').terms[0]).toMatchObject({
      kind: 'due',
      mode: 'today',
    });
  });

  it('expands pri:A to the degenerate range A..A', () => {
    expect(parseFilterExpr('pri:a').terms[0]).toMatchObject({ lo: 'A', hi: 'A' });
  });

  it('parses pri:A-C as an inclusive range', () => {
    expect(parseFilterExpr('pri:A-C').terms[0]).toMatchObject({
      lo: 'A',
      hi: 'C',
    });
  });

  it('parses due:<=Nd, with the d suffix optional', () => {
    expect(parseFilterExpr('due:<=7d').terms[0]).toMatchObject({
      mode: 'within',
      days: 7,
    });
    expect(parseFilterExpr('due:<=0').terms[0]).toMatchObject({
      mode: 'within',
      days: 0,
    });
  });

  it('treats a lone @ or + as plain text, not a malformed tag', () => {
    expect(parseFilterExpr('@').terms[0]).toMatchObject({
      kind: 'text',
      value: '@',
    });
    expect(parseFilterExpr('+').terms[0]).toMatchObject({
      kind: 'text',
      value: '+',
    });
  });
});

// ===========================================================================
// Parsing — errors
// ===========================================================================

describe('parseFilterExpr — errors', () => {
  it('rejects an empty expression', () => {
    expect(() => parseFilterExpr('')).toThrow(/expression is required/i);
    expect(() => parseFilterExpr('   \t ')).toThrow(/expression is required/i);
  });

  it('rejects a bare "-" with a hint instead of silently ignoring it', () => {
    expect(() => parseFilterExpr('-')).toThrow(/negate something/i);
  });

  it('rejects a reversed priority range and suggests the fix', () => {
    expect(() => parseFilterExpr('pri:C-A')).toThrow(/reversed.*pri:A-C/i);
  });

  it('rejects a non-letter priority', () => {
    expect(() => parseFilterExpr('pri:1')).toThrow(/expected a letter/i);
    expect(() => parseFilterExpr('pri:')).toThrow(/expected a letter/i);
    expect(() => parseFilterExpr('pri:AB')).toThrow(/expected a letter/i);
  });

  it('rejects an unknown due: form (the due:tomorow typo case)', () => {
    expect(() => parseFilterExpr('due:tomorow')).toThrow(/expected today/i);
    expect(() => parseFilterExpr('due:>=3d')).toThrow(/expected today/i);
    expect(() => parseFilterExpr('due:')).toThrow(/expected today/i);
  });

  it('reports the first bad term even when earlier terms are valid', () => {
    expect(() => parseFilterExpr('@home pri:9')).toThrow(/expected a letter/i);
  });

  it('tryParseFilterExpr swallows every one of those errors', () => {
    expect(tryParseFilterExpr('')).toBeNull();
    expect(tryParseFilterExpr('pri:C-A')).toBeNull();
    expect(tryParseFilterExpr('@home')).not.toBeNull();
  });
});

// ===========================================================================
// Matching — contexts and projects
// ===========================================================================

describe('matchesFilter — @context / +project', () => {
  it('matches a context token anywhere on the line', () => {
    expect(hits('@home', 'mow the lawn @home +garden')).toBe(true);
  });

  it('matches whole tokens only — @work does not match @workshop', () => {
    expect(hits('@work', 'build a bench @workshop')).toBe(false);
    expect(hits('@work', 'file report @work')).toBe(true);
  });

  it('matches a context at the very start of the line', () => {
    expect(hits('@home', '@home vacuum')).toBe(true);
  });

  it('is case-insensitive on both sides', () => {
    expect(hits('@HOME', 'vacuum @home')).toBe(true);
    expect(hits('@home', 'vacuum @Home')).toBe(true);
  });

  it('does not match a context that is only a substring of a word', () => {
    expect(hits('@home', 'email someone@homebase.com')).toBe(false);
  });

  it('matches +project tokens by the same whole-token rule', () => {
    expect(hits('+garden', 'mow +garden')).toBe(true);
    expect(hits('+garden', 'mow +gardening')).toBe(false);
  });
});

// ===========================================================================
// Matching — priority
// ===========================================================================

describe('matchesFilter — pri:', () => {
  it('matches the canonical (A) prefix', () => {
    expect(hits('pri:A', '(A) file taxes')).toBe(true);
    expect(hits('pri:A', '(B) file taxes')).toBe(false);
  });

  it('matches inside an inclusive range', () => {
    expect(hits('pri:A-C', '(B) call bank')).toBe(true);
    expect(hits('pri:A-C', '(D) tidy desk')).toBe(false);
  });

  it('includes both range endpoints', () => {
    expect(hits('pri:B-D', '(B) x')).toBe(true);
    expect(hits('pri:B-D', '(D) x')).toBe(true);
    expect(hits('pri:B-D', '(A) x')).toBe(false);
    expect(hits('pri:B-D', '(E) x')).toBe(false);
  });

  it('reads the pri:X tag this app writes when completing a task', () => {
    // markLineDone / applyDo move (A) to a trailing pri:A tag, so the done
    // tab would otherwise be invisible to pri: filters entirely.
    expect(hits('pri:A', 'x 2026-08-01 file taxes pri:A')).toBe(true);
    expect(hits('pri:A-C', 'x 2026-08-01 call bank pri:B')).toBe(true);
  });

  it('does not match an unprioritized line', () => {
    expect(hits('pri:A', 'buy milk @errands')).toBe(false);
  });

  it('ignores a parenthesized word that is not a priority prefix', () => {
    expect(hits('pri:A', 'ask (Alice) about the invoice')).toBe(false);
  });
});

// ===========================================================================
// Matching — due:
// ===========================================================================

describe('matchesFilter — due:', () => {
  it('matches due:today only on exactly today', () => {
    expect(hits('due:today', `pay rent due:${TODAY}`)).toBe(true);
    expect(hits('due:today', 'pay rent due:2026-08-06')).toBe(false);
    expect(hits('due:today', 'pay rent due:2026-08-04')).toBe(false);
  });

  it('matches due:overdue strictly before today', () => {
    expect(hits('due:overdue', 'renew passport due:2026-07-01')).toBe(true);
    expect(hits('due:overdue', `renew passport due:${TODAY}`)).toBe(false);
  });

  it('matches due:<=Nd up to and including today+N', () => {
    expect(hits('due:<=7d', 'ship it due:2026-08-12')).toBe(true); // today+7
    expect(hits('due:<=7d', 'ship it due:2026-08-13')).toBe(false); // today+8
  });

  it('includes already-overdue lines in a due:<=Nd window', () => {
    expect(hits('due:<=7d', 'ship it due:2026-01-01')).toBe(true);
  });

  it('treats due:<=0d as "today or earlier"', () => {
    expect(hits('due:<=0d', `x due:${TODAY}`)).toBe(true);
    expect(hits('due:<=0d', 'x due:2026-08-06')).toBe(false);
  });

  it('crosses a month boundary correctly', () => {
    // 2026-08-05 + 30d = 2026-09-04
    expect(hits('due:<=30d', 'x due:2026-09-04')).toBe(true);
    expect(hits('due:<=30d', 'x due:2026-09-05')).toBe(false);
  });

  it('never matches a line with no due: token', () => {
    for (const expr of ['due:today', 'due:overdue', 'due:<=90d']) {
      expect(hits(expr, 'buy milk @errands')).toBe(false);
    }
  });

  it('ignores a malformed due value', () => {
    expect(hits('due:overdue', 'x due:soon')).toBe(false);
    expect(hits('due:overdue', 'x due:2026-7-1')).toBe(false);
  });
});

// ===========================================================================
// Matching — plain text, AND, negation
// ===========================================================================

describe('matchesFilter — text, AND, negation', () => {
  it('matches plain text as a case-insensitive substring', () => {
    expect(hits('TAXES', '(A) file taxes')).toBe(true);
    expect(hits('tax', '(A) file taxes')).toBe(true);
    expect(hits('taxi', '(A) file taxes')).toBe(false);
  });

  it("ANDs every term — one miss fails the line", () => {
    const line = '(B) mow the lawn @home +garden';
    expect(hits('@home +garden', line)).toBe(true);
    expect(hits('@home +kitchen', line)).toBe(false);
    expect(hits('@home +garden pri:A-C', line)).toBe(true);
    expect(hits('@home +garden pri:A', line)).toBe(false);
  });

  it('excludes a line that hits a negated term', () => {
    expect(hits('-@waiting', 'call plumber @phone')).toBe(true);
    expect(hits('-@waiting', 'call plumber @waiting')).toBe(false);
  });

  it('combines positive and negative terms', () => {
    const line = '(A) refactor parser +app @deep';
    expect(hits('+app -@waiting', line)).toBe(true);
    expect(hits('+app -@deep', line)).toBe(false);
  });

  it('negates pri: and due: terms too', () => {
    expect(hits('-pri:A', '(B) call bank')).toBe(true);
    expect(hits('-pri:A', '(A) call bank')).toBe(false);
    expect(hits('-due:overdue', 'x due:2026-07-01')).toBe(false);
    expect(hits('-due:overdue', `x due:${TODAY}`)).toBe(true);
  });

  it('lets a negated term match a line the term cannot apply to', () => {
    // No due: token at all -> due:overdue misses -> -due:overdue hits.
    expect(hits('-due:overdue', 'buy milk')).toBe(true);
  });

  it('treats a filter with zero terms as matching everything', () => {
    expect(matchesFilter('anything', { source: '', terms: [] }, TODAY)).toBe(true);
  });

  it('matches a negation-only filter against an unrelated line', () => {
    expect(hits('-@work -@errands', 'read a book @home')).toBe(true);
  });

  it('escapes regex metacharacters in a context value', () => {
    // A naive implementation would compile `@a.b` and match `@axb`.
    expect(hits('@a.b', 'ping @axb')).toBe(false);
    expect(hits('@a.b', 'ping @a.b')).toBe(true);
  });
});

// ===========================================================================
// Line introspection helpers
// ===========================================================================

describe('linePriority / lineDue / isFilterable', () => {
  it('prefers the (A) prefix over a pri: tag', () => {
    expect(linePriority('(A) x pri:C')).toBe('A');
  });

  it('falls back to the pri: tag and uppercases it', () => {
    expect(linePriority('x 2026-08-01 done thing pri:b')).toBe('B');
  });

  it('returns null with no priority anywhere', () => {
    expect(linePriority('plain task')).toBeNull();
  });

  it('extracts a due: date and rejects a partial one', () => {
    expect(lineDue('pay rent due:2026-08-05 @home')).toBe('2026-08-05');
    expect(lineDue('pay rent due:2026-08')).toBeNull();
  });

  it('treats blank and whitespace-only lines as non-filterable', () => {
    expect(isFilterable('')).toBe(false);
    expect(isFilterable('   \t')).toBe(false);
    expect(isFilterable('a')).toBe(true);
  });
});

// ===========================================================================
// addDaysIso
// ===========================================================================

describe('addDaysIso', () => {
  it('adds days across month and year boundaries', () => {
    expect(addDaysIso('2026-08-05', 0)).toBe('2026-08-05');
    expect(addDaysIso('2026-08-05', 27)).toBe('2026-09-01');
    expect(addDaysIso('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('handles a leap day', () => {
    expect(addDaysIso('2028-02-28', 1)).toBe('2028-02-29');
    expect(addDaysIso('2028-02-28', 2)).toBe('2028-03-01');
  });

  it('rejects a non-date input', () => {
    expect(() => addDaysIso('tomorrow', 1)).toThrow(/YYYY-MM-DD/);
  });
});

// ===========================================================================
// Counts
// ===========================================================================

describe('filterCounts', () => {
  const content = [
    '(A) file taxes +finance due:2026-07-01',
    '(B) mow the lawn @home +garden',
    '',
    'buy milk @errands',
    '   ',
    'x 2026-08-01 call bank pri:A',
  ].join('\n');

  it('excludes blank lines from BOTH numbers', () => {
    const { matched, total } = filterCounts(content, null, TODAY);
    expect(total).toBe(4);
    expect(matched).toBe(4);
  });

  it('counts only matching lines against the same total', () => {
    expect(filterCounts(content, parseFilterExpr('pri:A'), TODAY)).toEqual({
      matched: 2, // the (A) prefix and the pri:A tag
      total: 4,
    });
  });

  it('reports 0/N for a filter that matches nothing', () => {
    expect(filterCounts(content, parseFilterExpr('@nowhere'), TODAY)).toEqual({
      matched: 0,
      total: 4,
    });
  });

  it('returns 0/0 for empty content', () => {
    expect(filterCounts('', parseFilterExpr('@home'), TODAY)).toEqual({
      matched: 0,
      total: 0,
    });
  });

  it('ignores a trailing newline', () => {
    expect(filterCounts('a @home\n', parseFilterExpr('@home'), TODAY)).toEqual({
      matched: 1,
      total: 1,
    });
  });
});

// ===========================================================================
// Clear keywords + persistence
// ===========================================================================

describe('isFilterClearKeyword', () => {
  it('accepts clear/off/none/reset in any case, with surrounding space', () => {
    for (const w of ['clear', 'OFF', ' none ', 'Reset']) {
      expect(isFilterClearKeyword(w)).toBe(true);
    }
  });

  it('rejects anything that could be a real expression', () => {
    for (const w of ['@clear', 'cleared', 'pri:A', '']) {
      expect(isFilterClearKeyword(w)).toBe(false);
    }
  });
});

describe('localStorage persistence', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('round-trips an expression through the versioned key', () => {
    storeFilter('@home pri:A-C');
    expect(localStorage.getItem(FILTER_STORAGE_KEY)).toBe('@home pri:A-C');
    expect(loadStoredFilter()).toBe('@home pri:A-C');
  });

  it('returns null when nothing is stored', () => {
    expect(loadStoredFilter()).toBeNull();
  });

  it('clears the key when passed null', () => {
    storeFilter('@home');
    storeFilter(null);
    expect(localStorage.getItem(FILTER_STORAGE_KEY)).toBeNull();
    expect(loadStoredFilter()).toBeNull();
  });

  it('drops a stored value the current grammar cannot parse', () => {
    localStorage.setItem(FILTER_STORAGE_KEY, 'pri:C-A');
    expect(loadStoredFilter()).toBeNull();
  });

  it('drops a stored blank value', () => {
    localStorage.setItem(FILTER_STORAGE_KEY, '   ');
    expect(loadStoredFilter()).toBeNull();
  });

  it('normalizes whitespace on the way back out', () => {
    localStorage.setItem(FILTER_STORAGE_KEY, '  @home    +garden ');
    expect(loadStoredFilter()).toBe('@home +garden');
  });

  it('survives a throwing localStorage instead of crashing the page', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(loadStoredFilter()).toBeNull();
    expect(() => storeFilter('@home')).not.toThrow();
  });
});

// ===========================================================================
// todayIso
// ===========================================================================

describe('todayIso', () => {
  it('returns the LOCAL calendar day, not the UTC one', () => {
    // 00:30 local on the 5th. A toISOString()-based implementation would
    // report the 4th for any timezone east of UTC — the exact bug fixed in
    // commands.ts, kept fixed here.
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date(2026, 7, 5, 0, 30, 0));
      expect(todayIso()).toBe('2026-08-05');
    } finally {
      vi.useRealTimers();
    }
  });

  it('zero-pads month and day', () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date(2026, 0, 9, 12, 0, 0));
      expect(todayIso()).toBe('2026-01-09');
    } finally {
      vi.useRealTimers();
    }
  });
});
