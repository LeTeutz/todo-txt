/**
 * threshold tests — `t:` parsing, the future test, tallies, the palette
 * argument, and localStorage persistence.
 *
 * `today` is injected everywhere, so no case here can rot with the calendar.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  THRESHOLD_STORAGE_KEY,
  isThresholdFuture,
  isThresholdable,
  lineThreshold,
  loadStoredThresholdMode,
  parseThresholdArg,
  storeThresholdMode,
  thresholdCounts,
} from './threshold';

const TODAY = '2026-08-05';

// ===========================================================================
// lineThreshold
// ===========================================================================

describe('lineThreshold', () => {
  it('reads a t: token anywhere in the line', () => {
    expect(lineThreshold('t:2026-09-01 renew passport')).toBe('2026-09-01');
    expect(lineThreshold('renew passport t:2026-09-01')).toBe('2026-09-01');
    expect(lineThreshold('renew +admin t:2026-09-01 @home')).toBe('2026-09-01');
  });

  it('reads a t: token on a completed line', () => {
    expect(lineThreshold('x 2026-08-01 renew passport t:2026-09-01')).toBe('2026-09-01');
  });

  it('is case-insensitive on the key', () => {
    expect(lineThreshold('renew T:2026-09-01')).toBe('2026-09-01');
  });

  it('returns null when absent', () => {
    expect(lineThreshold('renew passport')).toBeNull();
    expect(lineThreshold('')).toBeNull();
  });

  it('requires a whole ISO date', () => {
    expect(lineThreshold('renew t:2026-09')).toBeNull();
    expect(lineThreshold('renew t:tomorrow')).toBeNull();
    expect(lineThreshold('renew t:2026-9-1')).toBeNull();
  });

  it('does not match a key that merely ends in t', () => {
    expect(lineThreshold('renew at:2026-09-01')).toBeNull();
    expect(lineThreshold('renew start:2026-09-01')).toBeNull();
    expect(lineThreshold('renew due:2026-09-01')).toBeNull();
  });

  it('requires a whitespace boundary before the key', () => {
    expect(lineThreshold('xt:2026-09-01')).toBeNull();
  });

  it('requires a whitespace boundary after the date', () => {
    expect(lineThreshold('renew t:2026-09-01x')).toBeNull();
  });
});

// ===========================================================================
// isThresholdFuture
// ===========================================================================

describe('isThresholdFuture', () => {
  it('is true for a date strictly after today', () => {
    expect(isThresholdFuture('renew t:2026-08-06', TODAY)).toBe(true);
    expect(isThresholdFuture('renew t:2027-01-01', TODAY)).toBe(true);
  });

  it('is false ON the threshold day — the task is actionable now', () => {
    expect(isThresholdFuture('renew t:2026-08-05', TODAY)).toBe(false);
  });

  it('is false for a past threshold', () => {
    expect(isThresholdFuture('renew t:2026-08-04', TODAY)).toBe(false);
    expect(isThresholdFuture('renew t:2020-01-01', TODAY)).toBe(false);
  });

  it('is false without a t: token', () => {
    expect(isThresholdFuture('renew passport', TODAY)).toBe(false);
    expect(isThresholdFuture('renew due:2027-01-01', TODAY)).toBe(false);
  });

  it('compares dates lexically but correctly across boundaries', () => {
    expect(isThresholdFuture('x t:2026-09-01', '2026-08-31')).toBe(true);
    expect(isThresholdFuture('x t:2026-12-31', '2027-01-01')).toBe(false);
  });
});

// ===========================================================================
// isThresholdable
// ===========================================================================

describe('isThresholdable', () => {
  it('excludes blank and whitespace-only lines', () => {
    expect(isThresholdable('')).toBe(false);
    expect(isThresholdable('   ')).toBe(false);
    expect(isThresholdable('\t')).toBe(false);
  });

  it('includes any real line, completed or not', () => {
    expect(isThresholdable('renew passport')).toBe(true);
    expect(isThresholdable('x 2026-08-01 renew passport')).toBe(true);
  });
});

// ===========================================================================
// thresholdCounts
// ===========================================================================

describe('thresholdCounts', () => {
  const CONTENT = [
    '(A) 2026-08-01 pay rent due:2026-08-10',
    'renew passport t:2026-09-01',
    '',
    'book dentist t:2026-08-05',
    'call mum t:2026-08-04',
    'x 2026-08-02 old task t:2026-12-01',
  ].join('\n');

  it('counts only future thresholds in hide mode', () => {
    // t:2026-09-01 and the completed t:2026-12-01 are future; t:2026-08-05 is
    // today (actionable) and t:2026-08-04 is past.
    expect(thresholdCounts(CONTENT, 'hide', TODAY)).toEqual({ hidden: 2, total: 5 });
  });

  it('reports zero hidden in show mode but the same total', () => {
    expect(thresholdCounts(CONTENT, 'show', TODAY)).toEqual({ hidden: 0, total: 5 });
  });

  it('excludes blank lines from BOTH numbers', () => {
    expect(thresholdCounts('a\n\n\nb', 'hide', TODAY)).toEqual({ hidden: 0, total: 2 });
  });

  it('handles empty content', () => {
    expect(thresholdCounts('', 'hide', TODAY)).toEqual({ hidden: 0, total: 0 });
  });

  it('ignores a trailing newline', () => {
    expect(thresholdCounts('a t:2027-01-01\n', 'hide', TODAY)).toEqual({
      hidden: 1,
      total: 1,
    });
  });

  it('re-evaluates as today moves', () => {
    const line = 'renew t:2026-09-01';
    expect(thresholdCounts(line, 'hide', '2026-08-31').hidden).toBe(1);
    expect(thresholdCounts(line, 'hide', '2026-09-01').hidden).toBe(0);
  });
});

// ===========================================================================
// parseThresholdArg
// ===========================================================================

describe('parseThresholdArg', () => {
  it('treats an omitted or empty argument as a toggle', () => {
    expect(parseThresholdArg(undefined)).toBe('toggle');
    expect(parseThresholdArg('')).toBe('toggle');
    expect(parseThresholdArg('   ')).toBe('toggle');
    expect(parseThresholdArg('toggle')).toBe('toggle');
    expect(parseThresholdArg('flip')).toBe('toggle');
  });

  it.each(['hide', 'hidden', 'on', 'yes', 'true', '1'])('maps %j to hide', (arg) => {
    expect(parseThresholdArg(arg)).toBe('hide');
  });

  it.each(['show', 'shown', 'off', 'no', 'false', '0', 'all', 'clear'])(
    'maps %j to show',
    (arg) => {
      expect(parseThresholdArg(arg)).toBe('show');
    },
  );

  it('is case- and whitespace-insensitive', () => {
    expect(parseThresholdArg('  HIDE  ')).toBe('hide');
    expect(parseThresholdArg('Show')).toBe('show');
  });

  it('throws on a typo rather than silently doing the opposite', () => {
    expect(() => parseThresholdArg('hied')).toThrow(/expected hide or show/);
    expect(() => parseThresholdArg('nope')).toThrow(/got "nope"/);
  });

  it('does NOT prefix the thrown message (the dispatcher owns the prefix)', () => {
    expect(() => parseThresholdArg('hied')).toThrow(/^(?!threshold: )/);
  });
});

// ===========================================================================
// Persistence
// ===========================================================================

describe('threshold persistence', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('defaults to show when nothing is stored', () => {
    expect(loadStoredThresholdMode()).toBe('show');
  });

  it('round-trips hide', () => {
    storeThresholdMode('hide');
    expect(localStorage.getItem(THRESHOLD_STORAGE_KEY)).toBe('hide');
    expect(loadStoredThresholdMode()).toBe('hide');
  });

  it('removes the key rather than storing the default', () => {
    storeThresholdMode('hide');
    storeThresholdMode('show');
    expect(localStorage.getItem(THRESHOLD_STORAGE_KEY)).toBeNull();
    expect(loadStoredThresholdMode()).toBe('show');
  });

  it('falls back to show for an unrecognized stored value', () => {
    localStorage.setItem(THRESHOLD_STORAGE_KEY, 'collapse');
    expect(loadStoredThresholdMode()).toBe('show');
  });

  it('falls back to show when reading throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(loadStoredThresholdMode()).toBe('show');
  });

  it('does not throw when writing is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() => storeThresholdMode('hide')).not.toThrow();
  });
});
