/**
 * hidden tests — `h:1` token matching, tallies, the palette argument, and
 * localStorage persistence.
 *
 * The token-matching block carries most of the weight: `h:1` is a bare flag
 * with no delimiters of its own, so every near-miss (`h:10`, `ph:1`, `h:0`)
 * has to be proven NOT to hide a line. A false positive here removes one of
 * the user's tasks from view, which is the worst failure this layer has.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  DEFAULT_HIDDEN_MODE,
  HIDDEN_STORAGE_KEY,
  hiddenCounts,
  isHiddenLine,
  isHideable,
  loadStoredHiddenMode,
  parseHiddenArg,
  storeHiddenMode,
  type HiddenMode,
} from './hidden';

// ===========================================================================
// isHiddenLine — whole-token matching and its near misses
// ===========================================================================

describe('isHiddenLine', () => {
  it('matches h:1 at the end of a line', () => {
    expect(isHiddenLine('someday learn the tin whistle h:1')).toBe(true);
  });

  it('matches h:1 at the very start of a line', () => {
    expect(isHiddenLine('h:1 buried note')).toBe(true);
  });

  it('matches h:1 in the middle of a line', () => {
    expect(isHiddenLine('note h:1 +project @ctx')).toBe(true);
  });

  it('matches a line that is nothing but the tag', () => {
    expect(isHiddenLine('h:1')).toBe(true);
  });

  it('is case-insensitive on the key', () => {
    expect(isHiddenLine('note H:1')).toBe(true);
  });

  it('matches with multiple spaces around the token', () => {
    expect(isHiddenLine('note   h:1   tail')).toBe(true);
  });

  it('matches two adjacent tags (lookahead, not a consuming delimiter)', () => {
    expect(isHiddenLine('note h:1 h:1')).toBe(true);
  });

  it('matches when a tab separates the token', () => {
    expect(isHiddenLine('note\th:1')).toBe(true);
  });

  // --- near misses: each of these must NOT remove a line from view ---

  it.each([
    ['h:0 — the explicit opposite', 'note h:0'],
    ['h:2 — not a flag value we understand', 'note h:2'],
    ['h:10 — longer value, not h:1', 'note h:10'],
    ['h:11 — longer value, not h:1', 'note h:11'],
    ['h:1x — trailing junk', 'note h:1x'],
    ['h:1.5 — trailing junk', 'note h:1.5'],
    ['ph:1 — suffix of another key', 'note ph:1'],
    ['xh:1 — suffix of another key', 'note xh:1'],
    ['hh:1 — suffix of another key', 'note hh:1'],
    ['hide:1 — a different key entirely', 'note hide:1'],
    ['h_1 — not a key:value at all', 'note h_1'],
    ['h: 1 — value detached from the key', 'note h: 1'],
    ['h:  — no value', 'note h:'],
    ['bare h — no value', 'note h'],
    ['no tag at all', 'ordinary task +proj @ctx due:2026-01-01'],
    ['empty line', ''],
  ])('does not match %s', (_label, line) => {
    expect(isHiddenLine(line)).toBe(false);
  });

  it('is stateless across calls (no lastIndex leak)', () => {
    // A `g`-flagged regex reused module-level would go false on every other
    // call. This asserts the pattern is not global.
    const line = 'note h:1';
    expect([isHiddenLine(line), isHiddenLine(line), isHiddenLine(line)]).toEqual([
      true,
      true,
      true,
    ]);
  });

  it('matches on a completed line too — the tag is not about state', () => {
    expect(isHiddenLine('x 2026-01-02 2026-01-01 old thing h:1')).toBe(true);
  });
});

// ===========================================================================
// isHideable — blank lines are structural, never treated
// ===========================================================================

describe('isHideable', () => {
  it('accepts any non-blank line', () => {
    expect(isHideable('anything')).toBe(true);
  });

  it.each([
    ['empty', ''],
    ['spaces', '   '],
    ['tab', '\t'],
    ['mixed whitespace', ' \t  '],
  ])('rejects a %s line', (_label, line) => {
    expect(isHideable(line)).toBe(false);
  });
});

// ===========================================================================
// hiddenCounts
// ===========================================================================

describe('hiddenCounts', () => {
  const CONTENT = [
    'ordinary task',
    'someday thing h:1',
    '', // blank — excluded from BOTH numbers
    'x 2026-01-02 done thing h:1',
    'note h:0', // near miss — counted in total, not in hidden
    '   ', // whitespace-only — excluded
  ].join('\n');

  it('counts h:1 lines out of non-blank lines in dim mode', () => {
    expect(hiddenCounts(CONTENT, 'dim')).toEqual({ hidden: 2, total: 4 });
  });

  it('counts identically in hide mode — only the treatment differs', () => {
    expect(hiddenCounts(CONTENT, 'hide')).toEqual({ hidden: 2, total: 4 });
  });

  it('reports 0 hidden in show mode while still counting the total', () => {
    expect(hiddenCounts(CONTENT, 'show')).toEqual({ hidden: 0, total: 4 });
  });

  it('handles an empty file without dividing by anything', () => {
    expect(hiddenCounts('', 'dim')).toEqual({ hidden: 0, total: 0 });
  });

  it('handles a file of only blank lines', () => {
    expect(hiddenCounts('\n\n   \n', 'dim')).toEqual({ hidden: 0, total: 0 });
  });

  it('counts every line when they all carry the tag', () => {
    expect(hiddenCounts('a h:1\nb h:1\nc h:1', 'dim')).toEqual({
      hidden: 3,
      total: 3,
    });
  });
});

// ===========================================================================
// parseHiddenArg
// ===========================================================================

describe('parseHiddenArg', () => {
  it('treats an empty argument as a toggle', () => {
    expect(parseHiddenArg('')).toBe('toggle');
  });

  it('treats undefined as a toggle', () => {
    expect(parseHiddenArg(undefined)).toBe('toggle');
  });

  it('treats whitespace as a toggle', () => {
    expect(parseHiddenArg('   ')).toBe('toggle');
  });

  it.each(['toggle', 'flip', 'TOGGLE', ' Flip '])(
    'reads %s as a toggle',
    (arg) => {
      expect(parseHiddenArg(arg)).toBe('toggle');
    },
  );

  it.each(['dim', 'dimmed', 'fade', 'faded', 'DIM', ' Dim '])(
    'reads %s as dim',
    (arg) => {
      expect(parseHiddenArg(arg)).toBe('dim');
    },
  );

  it.each(['on', 'yes', 'true', '1'])(
    'reads the affirmative %s as dim, not hide — the default must never remove lines',
    (arg) => {
      expect(parseHiddenArg(arg)).toBe('dim');
    },
  );

  it.each(['hide', 'hidden', 'collapse', 'gone', 'remove', 'HIDE'])(
    'reads %s as hide',
    (arg) => {
      expect(parseHiddenArg(arg)).toBe('hide');
    },
  );

  it.each([
    'show',
    'shown',
    'reveal',
    'off',
    'no',
    'false',
    '0',
    'all',
    'clear',
    'none',
    'SHOW',
  ])('reads %s as show', (arg) => {
    expect(parseHiddenArg(arg)).toBe('show');
  });

  it.each(['hied', 'dimm', 'nope', 'h:1', '2', 'showw'])(
    'throws on the unrecognized %s rather than guessing',
    (arg) => {
      expect(() => parseHiddenArg(arg)).toThrow(/expected dim, hide or show/);
    },
  );

  it('names the offending argument in the error', () => {
    expect(() => parseHiddenArg('hied')).toThrow(/"hied"/);
  });
});

// ===========================================================================
// Persistence
// ===========================================================================

describe('hidden mode persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('defaults to dim with nothing stored', () => {
    expect(loadStoredHiddenMode()).toBe('dim');
    expect(DEFAULT_HIDDEN_MODE).toBe('dim');
  });

  it('round-trips show', () => {
    storeHiddenMode('show');
    expect(localStorage.getItem(HIDDEN_STORAGE_KEY)).toBe('show');
    expect(loadStoredHiddenMode()).toBe('show');
  });

  it('round-trips hide', () => {
    storeHiddenMode('hide');
    expect(localStorage.getItem(HIDDEN_STORAGE_KEY)).toBe('hide');
    expect(loadStoredHiddenMode()).toBe('hide');
  });

  it('removes the key for the default rather than storing it', () => {
    storeHiddenMode('hide');
    storeHiddenMode('dim');
    expect(localStorage.getItem(HIDDEN_STORAGE_KEY)).toBeNull();
    expect(loadStoredHiddenMode()).toBe('dim');
  });

  it.each(['', 'HIDE', 'hidden', 'true', 'garbage', '{}'])(
    'falls back to dim on the unrecognized stored value %s',
    (raw) => {
      localStorage.setItem(HIDDEN_STORAGE_KEY, raw);
      expect(loadStoredHiddenMode()).toBe('dim');
    },
  );

  it('falls back to dim — never hide — when reading throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(loadStoredHiddenMode()).toBe('dim');
  });

  it('swallows a throwing write so the session still works', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() => storeHiddenMode('hide')).not.toThrow();
  });

  it('swallows a throwing remove', () => {
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(() => storeHiddenMode('dim')).not.toThrow();
  });

  it('round-trips every mode through the real storage', () => {
    for (const mode of ['show', 'dim', 'hide'] as HiddenMode[]) {
      storeHiddenMode(mode);
      expect(loadStoredHiddenMode()).toBe(mode);
    }
  });
});
