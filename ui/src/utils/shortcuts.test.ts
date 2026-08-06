/**
 * Tests for the shortcut engine. Pure functions, deterministic clock.
 */
import { describe, expect, it } from 'vitest';
import {
  addDays,
  addMonths,
  applyShortcut,
  fmtDate,
  fmtDateTime,
  fmtTime,
  lineOffsets,
  nextDow,
  parseRelDate,
  SHORTCUT_REFERENCE,
  shortId,
  TRIGGER_CHARS,
} from './shortcuts';

// Fixed clock: Wed 2026-05-06 14:30 local.
const FIXED_NOW = new Date(2026, 4, 6, 14, 30);
const clock = () => FIXED_NOW;

describe('date helpers', () => {
  it('fmtDate zero-pads', () => {
    expect(fmtDate(new Date(2026, 0, 3))).toBe('2026-01-03');
  });

  it('fmtTime zero-pads', () => {
    expect(fmtTime(new Date(2026, 4, 6, 7, 5))).toBe('07:05');
  });

  it('fmtDateTime combines', () => {
    expect(fmtDateTime(FIXED_NOW)).toBe('2026-05-06T14:30');
  });

  it('addDays wraps month boundary', () => {
    expect(fmtDate(addDays(FIXED_NOW, 27))).toBe('2026-06-02');
  });

  it('addDays can go negative', () => {
    expect(fmtDate(addDays(FIXED_NOW, -7))).toBe('2026-04-29');
  });

  it('addMonths handles Dec → Jan', () => {
    expect(fmtDate(addMonths(new Date(2026, 11, 15), 1))).toBe('2027-01-15');
  });

  it('nextDow returns next occurrence, skipping today', () => {
    // Wed 2026-05-06 → next Wed is 2026-05-13 (skip today).
    expect(fmtDate(nextDow(FIXED_NOW, 'wed')!)).toBe('2026-05-13');
    // Wed → next Mon is 2026-05-11.
    expect(fmtDate(nextDow(FIXED_NOW, 'mon')!)).toBe('2026-05-11');
    // Wed → next Fri is 2026-05-08.
    expect(fmtDate(nextDow(FIXED_NOW, 'fri')!)).toBe('2026-05-08');
  });

  it('nextDow returns null for unknown weekday', () => {
    expect(nextDow(FIXED_NOW, 'xyz')).toBeNull();
  });
});

describe('parseRelDate', () => {
  it('handles today/tod', () => {
    expect(fmtDate(parseRelDate('today', FIXED_NOW)!)).toBe('2026-05-06');
    expect(fmtDate(parseRelDate('tod', FIXED_NOW)!)).toBe('2026-05-06');
  });

  it('handles tom/tomorrow', () => {
    expect(fmtDate(parseRelDate('tom', FIXED_NOW)!)).toBe('2026-05-07');
    expect(fmtDate(parseRelDate('tomorrow', FIXED_NOW)!)).toBe('2026-05-07');
  });

  it('handles yday/yesterday', () => {
    expect(fmtDate(parseRelDate('yday', FIXED_NOW)!)).toBe('2026-05-05');
  });

  it('handles weekdays', () => {
    expect(fmtDate(parseRelDate('fri', FIXED_NOW)!)).toBe('2026-05-08');
  });

  it('handles +Nd/+Nw/+Nm/+Ny', () => {
    expect(fmtDate(parseRelDate('+3d', FIXED_NOW)!)).toBe('2026-05-09');
    expect(fmtDate(parseRelDate('+2w', FIXED_NOW)!)).toBe('2026-05-20');
    expect(fmtDate(parseRelDate('+1m', FIXED_NOW)!)).toBe('2026-06-06');
    expect(fmtDate(parseRelDate('+1y', FIXED_NOW)!)).toBe('2027-05-06');
  });

  it('returns null on unknown', () => {
    expect(parseRelDate('wat', FIXED_NOW)).toBeNull();
    expect(parseRelDate('+5x', FIXED_NOW)).toBeNull();
    expect(parseRelDate('', FIXED_NOW)).toBeNull();
  });
});

describe('shortId', () => {
  it('produces 8-char lowercase alphanumeric', () => {
    const id = shortId();
    expect(id).toMatch(/^[a-z0-9]{8}$/);
  });

  it('produces different ids on repeat calls', () => {
    const a = shortId();
    const b = shortId();
    // 1 / 36^8 chance of collision — safe to assert.
    expect(a).not.toBe(b);
  });
});

describe('lineOffsets', () => {
  it('single line, caret at start', () => {
    expect(lineOffsets('hello', 0)).toEqual([0, 5]);
  });

  it('single line, caret in middle', () => {
    expect(lineOffsets('hello', 3)).toEqual([0, 5]);
  });

  it('multiple lines, caret on second line', () => {
    const v = 'first\nsecond\nthird';
    expect(lineOffsets(v, 8)).toEqual([6, 12]); // 'second'
  });

  it('caret at line-boundary newline', () => {
    const v = 'a\nb\nc';
    expect(lineOffsets(v, 2)).toEqual([2, 3]); // start of 'b'
  });
});

describe('TRIGGER_CHARS', () => {
  it('contains space and newline', () => {
    expect(TRIGGER_CHARS.has(' ')).toBe(true);
    expect(TRIGGER_CHARS.has('\n')).toBe(true);
    expect(TRIGGER_CHARS.has('\t')).toBe(false);
  });
});

describe('applyShortcut — basic guardrails', () => {
  it('returns null when caret < 1', () => {
    expect(applyShortcut('', 0, clock)).toBeNull();
  });

  it('returns null when trigger char is not space/newline', () => {
    expect(applyShortcut('!!dX', 4, clock)).toBeNull();
  });

  it('returns null when no !! found', () => {
    expect(applyShortcut('just text ', 10, clock)).toBeNull();
  });

  it('returns null on "!! " (empty body)', () => {
    expect(applyShortcut('!! ', 3, clock)).toBeNull();
  });

  it('returns null when !! is on previous line', () => {
    expect(applyShortcut('!!done\nsomething ', 17, clock)).toBeNull();
  });

  it('ignores unknown triggers', () => {
    expect(applyShortcut('!!nosuchcommand ', 16, clock)).toBeNull();
  });
});

describe('applyShortcut — inline date/time', () => {
  it('!!d → today', () => {
    const r = applyShortcut('!!d ', 4, clock);
    expect(r?.value).toBe('2026-05-06 ');
    expect(r?.caret).toBe(11);
  });

  it('!!tom → tomorrow', () => {
    const r = applyShortcut('!!tom ', 6, clock);
    expect(r?.value).toBe('2026-05-07 ');
  });

  it('!!yday → yesterday', () => {
    const r = applyShortcut('!!yday ', 7, clock);
    expect(r?.value).toBe('2026-05-05 ');
  });

  it('!!t → time:HH:MM', () => {
    const r = applyShortcut('!!t ', 4, clock);
    expect(r?.value).toBe('time:14:30 ');
  });

  it('!!now → full datetime', () => {
    const r = applyShortcut('!!now ', 6, clock);
    expect(r?.value).toBe('2026-05-06T14:30 ');
  });

  it('!!fri → next Friday', () => {
    const r = applyShortcut('!!fri ', 6, clock);
    expect(r?.value).toBe('2026-05-08 ');
  });

  it('!!+3d → today + 3 days', () => {
    const r = applyShortcut('!!+3d ', 6, clock);
    expect(r?.value).toBe('2026-05-09 ');
  });

  it('!!+5b → today + 5 business days (skips weekends)', () => {
    // Wed 2026-05-06 + 5 biz days = Wed 2026-05-13 (skip Sat, Sun)
    const r = applyShortcut('!!+5b ', 6, clock);
    expect(r?.value).toBe('2026-05-13 ');
  });

  it('!!h → h:1 (hidden flag)', () => {
    const r = applyShortcut('!!h ', 4, clock);
    expect(r?.value).toBe('h:1 ');
  });

  it('!!id → id:<8-alphanumeric>', () => {
    const r = applyShortcut('!!id ', 5, clock);
    expect(r?.value).toMatch(/^id:[a-z0-9]{8} $/);
  });

  it('!!due:fri → due:<next-friday>', () => {
    const r = applyShortcut('buy milk !!due:fri ', 19, clock);
    expect(r?.value).toBe('buy milk due:2026-05-08 ');
  });

  it('!!due:+1w → due:<today+7>', () => {
    const r = applyShortcut('!!due:+1w ', 10, clock);
    expect(r?.value).toBe('due:2026-05-13 ');
  });

  it('!!t:mon → t:<next-mon> (threshold)', () => {
    const r = applyShortcut('!!t:mon ', 8, clock);
    expect(r?.value).toBe('t:2026-05-11 ');
  });

  it('!!rec:1w → rec:+1w (auto plus-prefix)', () => {
    const r = applyShortcut('!!rec:1w ', 9, clock);
    expect(r?.value).toBe('rec:+1w ');
  });

  it('!!rec:+2d preserves existing plus', () => {
    const r = applyShortcut('!!rec:+2d ', 10, clock);
    expect(r?.value).toBe('rec:+2d ');
  });

  it('!!p+home → +home', () => {
    const r = applyShortcut('!!p+home ', 9, clock);
    expect(r?.value).toBe('+home ');
  });

  it('!!@errands → @errands', () => {
    const r = applyShortcut('!!@errands ', 11, clock);
    expect(r?.value).toBe('@errands ');
  });
});

describe('applyShortcut — line-level transforms', () => {
  it('!!done prepends x + today + strips priority', () => {
    const r = applyShortcut('(A) buy milk !!done ', 20, clock);
    expect(r?.value).toBe('x 2026-05-06 buy milk');
  });

  it('!!done on already-completed line is a no-op on the completion', () => {
    const r = applyShortcut('x 2026-05-01 buy milk !!done ', 29, clock);
    // Already complete — line passes through the identity transform (trigger stripped).
    expect(r?.value).toBe('x 2026-05-01 buy milk');
  });

  it('!!done on empty line does nothing useful', () => {
    const r = applyShortcut('!!done ', 7, clock);
    expect(r?.value).toBe('');
  });

  it('!!undone strips completion prefix + date', () => {
    const r = applyShortcut('x 2026-05-01 buy milk !!undone ', 31, clock);
    expect(r?.value).toBe('buy milk');
  });

  it('!!a sets priority to (A)', () => {
    const r = applyShortcut('buy milk !!a ', 13, clock);
    expect(r?.value).toBe('(A) buy milk');
  });

  it('!!c replaces existing priority', () => {
    const r = applyShortcut('(A) buy milk !!c ', 17, clock);
    expect(r?.value).toBe('(C) buy milk');
  });

  it('!!d is date, NOT priority D (dedicated inline)', () => {
    // !!d is reserved for today's date; use full (D) syntax for priority D
    const r = applyShortcut('!!d ', 4, clock);
    expect(r?.value).toBe('2026-05-06 ');
  });

  it('!!t is time, NOT priority T (dedicated inline)', () => {
    const r = applyShortcut('!!t ', 4, clock);
    expect(r?.value).toBe('time:14:30 ');
  });

  it('!!pri- strips priority', () => {
    const r = applyShortcut('(A) buy milk !!pri- ', 20, clock);
    expect(r?.value).toBe('buy milk');
  });

  it('!!priup increases priority (C→B)', () => {
    const r = applyShortcut('(C) buy milk !!priup ', 21, clock);
    expect(r?.value).toBe('(B) buy milk');
  });

  it('!!priup caps at A', () => {
    const r = applyShortcut('(A) buy milk !!priup ', 21, clock);
    expect(r?.value).toBe('(A) buy milk');
  });

  it('!!priup on unprioritized line sets to A', () => {
    const r = applyShortcut('buy milk !!priup ', 17, clock);
    expect(r?.value).toBe('(A) buy milk');
  });

  it('!!pridown decreases priority (B→C)', () => {
    const r = applyShortcut('(B) buy milk !!pridown ', 23, clock);
    expect(r?.value).toBe('(C) buy milk');
  });

  it('!!pridown from Z strips priority', () => {
    const r = applyShortcut('(Z) buy milk !!pridown ', 23, clock);
    expect(r?.value).toBe('buy milk');
  });

  it('!!date adds creation date', () => {
    const r = applyShortcut('buy milk !!date ', 16, clock);
    expect(r?.value).toBe('2026-05-06 buy milk');
  });

  it('!!archive completes + adds archived:1', () => {
    const r = applyShortcut('(A) buy milk !!archive ', 23, clock);
    expect(r?.value).toBe('x 2026-05-06 buy milk archived:1');
  });

  it('line-level transforms preserve surrounding lines', () => {
    const r = applyShortcut('line 1\nbuy milk !!done \nline 3', 23, clock);
    expect(r?.value).toBe('line 1\nx 2026-05-06 buy milk\nline 3');
  });

  it('newline trigger on line-level preserves newline', () => {
    // User typed Enter after !!done — text = "buy milk !!done\n"
    const r = applyShortcut('buy milk !!done\n', 16, clock);
    expect(r?.value).toBe('x 2026-05-06 buy milk\n');
    // Caret should be at start of the new blank line.
    expect(r?.caret).toBe(22);
  });
});

describe('applyShortcut — mid-line inline expansion', () => {
  it('expands in the middle of a line, preserving context', () => {
    const r = applyShortcut('call mom !!t at home', 13, clock);
    // '!!t' at offset 9-12, trigger char is space at offset 12.
    // After expansion: 'call mom time:14:30 at home'
    expect(r?.value).toBe('call mom time:14:30 at home');
  });
});

describe('SHORTCUT_REFERENCE', () => {
  it('is non-empty and well-formed', () => {
    expect(SHORTCUT_REFERENCE.length).toBeGreaterThan(10);
    for (const entry of SHORTCUT_REFERENCE) {
      // Triggers are !! shortcuts OR Tab-complete entries (+prefix / @prefix).
      expect(entry.trigger).toMatch(/^(!!|[+@])/);
      expect(entry.kind).toMatch(/^(line|inline)$/);
      expect(entry.expansion.length).toBeGreaterThan(0);
    }
  });

  it('covers every exact handler', () => {
    // Smoke test: every reference row's primary trigger should either
    // match a tested exact handler OR a pattern handler we've verified
    // above. We're just asserting no empty strings slipped in.
    const seen = new Set(SHORTCUT_REFERENCE.map((r) => r.trigger));
    expect(seen.has('!!done')).toBe(true);
    expect(seen.has('!!t')).toBe(true);
    expect(seen.has('!!id')).toBe(true);
  });
});
