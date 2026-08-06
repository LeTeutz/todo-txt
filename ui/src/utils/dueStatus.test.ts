/**
 * dueStatus tests — `due:` urgency classification and ISO-date validity.
 *
 * The classification decides a COLOUR, so the failure modes are asymmetric:
 * mistaking a future deadline for an overdue one cries wolf, and mistaking a
 * garbage date for an overdue one asserts a deadline the app cannot parse.
 * Both are covered below, along with the boundary that matters most — the
 * transition from `today` to `past` at midnight.
 */
import { describe, expect, it } from 'vitest';

import { classifyDue, isRealIsoDate } from './dueStatus';

const TODAY = '2026-08-05';

// ===========================================================================
// isRealIsoDate
// ===========================================================================

describe('isRealIsoDate', () => {
  it.each([
    '2026-08-05',
    '2026-01-01',
    '2026-12-31',
    '2024-02-29', // real leap day
    '2000-02-29', // century leap year
    '1999-12-31',
  ])('accepts the real date %s', (iso) => {
    expect(isRealIsoDate(iso)).toBe(true);
  });

  it.each([
    ['month 00', '2026-00-15'],
    ['month 13', '2026-13-01'],
    ['month 99', '2026-99-01'],
    ['day 00', '2026-08-00'],
    ['day 32', '2026-08-32'],
    ['Feb 30', '2026-02-30'],
    ['Feb 31', '2026-02-31'],
    ['Feb 29 in a non-leap year', '2026-02-29'],
    ['Feb 29 in a non-leap century', '1900-02-29'],
    ['April 31', '2026-04-31'],
    ['June 31', '2026-06-31'],
    ['all zeroes', '0000-00-00'],
  ])('rejects the impossible date %s', (_label, iso) => {
    expect(isRealIsoDate(iso)).toBe(false);
  });

  it.each([
    ['unpadded month', '2026-8-05'],
    ['unpadded day', '2026-08-5'],
    ['two-digit year', '26-08-05'],
    ['slashes', '2026/08/05'],
    ['trailing text', '2026-08-05x'],
    ['leading text', 'x2026-08-05'],
    ['empty', ''],
    ['not a date', 'tomorrow'],
  ])('rejects the malformed input %s', (_label, iso) => {
    expect(isRealIsoDate(iso)).toBe(false);
  });

  it('does not depend on the host timezone', () => {
    // Validity is a property of three integers. Were this implemented with a
    // local-time Date, a negative UTC offset would shift 2026-01-01 back into
    // 2025-12-31 and the round-trip check would reject a perfectly real date.
    expect(isRealIsoDate('2026-01-01')).toBe(true);
    expect(isRealIsoDate('2026-12-31')).toBe(true);
  });
});

// ===========================================================================
// classifyDue
// ===========================================================================

describe('classifyDue', () => {
  it('classifies a date before today as past', () => {
    expect(classifyDue('file taxes due:2026-08-04', TODAY)).toBe('past');
  });

  it('classifies a long-overdue date as past', () => {
    expect(classifyDue('file taxes due:2019-01-01', TODAY)).toBe('past');
  });

  it('classifies today exactly as today', () => {
    expect(classifyDue('call mum due:2026-08-05', TODAY)).toBe('today');
  });

  it('classifies tomorrow as future', () => {
    expect(classifyDue('ship it due:2026-08-06', TODAY)).toBe('future');
  });

  it('classifies a far-future date as future', () => {
    expect(classifyDue('renew passport due:2099-01-01', TODAY)).toBe('future');
  });

  it('crosses the midnight boundary cleanly', () => {
    const line = 'call mum due:2026-08-05';
    expect(classifyDue(line, '2026-08-04')).toBe('future');
    expect(classifyDue(line, '2026-08-05')).toBe('today');
    expect(classifyDue(line, '2026-08-06')).toBe('past');
  });

  it('returns null for a line with no due: token', () => {
    expect(classifyDue('(A) ordinary task +proj @ctx', TODAY)).toBeNull();
  });

  it('returns null for an empty line', () => {
    expect(classifyDue('', TODAY)).toBeNull();
  });

  it.each([
    ['impossible month', 'thing due:2026-13-01'],
    ['impossible day', 'thing due:2026-08-32'],
    ['Feb 31', 'thing due:2026-02-31'],
    ['all zeroes — would compare as overdue under a naive string test', 'thing due:0000-00-00'],
  ])('returns null for the invalid date %s', (_label, line) => {
    expect(classifyDue(line, TODAY)).toBeNull();
  });

  it.each([
    ['unpadded', 'thing due:2026-8-5'],
    ['relative word', 'thing due:tomorrow'],
    ['no value', 'thing due:'],
  ])('returns null for the unparseable due: value %s', (_label, line) => {
    expect(classifyDue(line, TODAY)).toBeNull();
  });

  it('ignores a due-looking suffix of another key', () => {
    expect(classifyDue('thing notdue:2019-01-01', TODAY)).toBeNull();
    expect(classifyDue('thing xdue:2019-01-01', TODAY)).toBeNull();
  });

  it('reads a real due: token that follows a due-looking suffix', () => {
    expect(classifyDue('thing notdue:2099-01-01 due:2019-01-01', TODAY)).toBe(
      'past',
    );
  });

  it('is case-insensitive on the key', () => {
    expect(classifyDue('thing DUE:2019-01-01', TODAY)).toBe('past');
  });

  it('reads a due: token at the start of the line', () => {
    expect(classifyDue('due:2019-01-01 thing', TODAY)).toBe('past');
  });

  it('classifies a COMPLETED line the same way — state is the caller\u2019s call', () => {
    // This function answers "how urgent is this date", nothing more. Skipping
    // completed lines is the decoration plugin's job (it returns early on `x `
    // lines), and keeping the two concerns apart is what makes this testable.
    expect(classifyDue('x 2026-08-01 2026-07-01 taxes due:2019-01-01', TODAY)).toBe(
      'past',
    );
  });

  it('classifies an h:1 line the same way', () => {
    expect(classifyDue('someday thing h:1 due:2019-01-01', TODAY)).toBe('past');
  });
});
