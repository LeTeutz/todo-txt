/**
 * recurrence tests — the `rec:` date math and the shared completion path.
 *
 * Dates are INJECTED everywhere (`completionDate` / `today` parameters), so
 * nothing in this file can rot as the real calendar moves. The only place a
 * real clock leaks in is `toggleDone` in cm-vim-todotxt, which has its own
 * test; the pure layer here never reads `Date.now()`.
 *
 * The cases are grouped so a failure names the property it broke:
 * parsing, per-unit arithmetic, the two anchors, the shared due↔t delta,
 * line rewriting, and the guards that must generate NOTHING.
 */
import { describe, expect, it } from 'vitest';

import {
  addBusinessDaysIso,
  addMonthsIso,
  completeLineWithRecurrence,
  isWeekendIso,
  isoDayDiff,
  lineRecurrence,
  nextRecurrenceLine,
  parseRecurrenceValue,
  shiftIsoByRecurrence,
  type Recurrence,
} from './recurrence';

/** Build a Recurrence without going through the parser. */
function rec(count: number, unit: Recurrence['unit'], strict = false): Recurrence {
  return { raw: `${strict ? '+' : ''}${count}${unit}`, strict, count, unit };
}

// ===========================================================================
// parseRecurrenceValue / lineRecurrence
// ===========================================================================

describe('parseRecurrenceValue', () => {
  it('parses every unit', () => {
    expect(parseRecurrenceValue('1d')).toMatchObject({ count: 1, unit: 'd', strict: false });
    expect(parseRecurrenceValue('2w')).toMatchObject({ count: 2, unit: 'w', strict: false });
    expect(parseRecurrenceValue('3m')).toMatchObject({ count: 3, unit: 'm', strict: false });
    expect(parseRecurrenceValue('4y')).toMatchObject({ count: 4, unit: 'y', strict: false });
    expect(parseRecurrenceValue('5b')).toMatchObject({ count: 5, unit: 'b', strict: false });
  });

  it('marks a leading + as strict', () => {
    expect(parseRecurrenceValue('+2w')).toMatchObject({ strict: true, count: 2, unit: 'w' });
    expect(parseRecurrenceValue('+1m')).toMatchObject({ strict: true, count: 1, unit: 'm' });
  });

  it('defaults a missing unit to days', () => {
    expect(parseRecurrenceValue('3')).toMatchObject({ count: 3, unit: 'd' });
    expect(parseRecurrenceValue('+3')).toMatchObject({ count: 3, unit: 'd', strict: true });
  });

  it('normalizes an uppercase unit', () => {
    expect(parseRecurrenceValue('2W')).toMatchObject({ count: 2, unit: 'w' });
    expect(parseRecurrenceValue('1B')).toMatchObject({ count: 1, unit: 'b' });
  });

  it('keeps the raw source for diagnostics', () => {
    expect(parseRecurrenceValue('+2w')?.raw).toBe('+2w');
  });

  it('rejects a zero count (it would recur forever on the same day)', () => {
    expect(parseRecurrenceValue('0d')).toBeNull();
    expect(parseRecurrenceValue('0')).toBeNull();
    expect(parseRecurrenceValue('+0w')).toBeNull();
  });

  it.each([
    'weekly',
    '-2w',
    '2weeks',
    '2 w',
    '',
    'd',
    '+',
    '1.5d',
    '1x',
    '99999d',
    '2w+',
  ])('rejects unparseable value %j', (value) => {
    expect(parseRecurrenceValue(value)).toBeNull();
  });
});

describe('lineRecurrence', () => {
  it('finds the token anywhere in the line', () => {
    expect(lineRecurrence('pay rent rec:1m due:2026-09-01')).toMatchObject({
      count: 1,
      unit: 'm',
    });
    expect(lineRecurrence('rec:2d water plants')).toMatchObject({ count: 2, unit: 'd' });
  });

  it('returns null when absent', () => {
    expect(lineRecurrence('pay rent due:2026-09-01')).toBeNull();
  });

  it('returns null for a malformed pattern rather than guessing', () => {
    expect(lineRecurrence('pay rent rec:monthly')).toBeNull();
  });

  it('does not match a key that merely ends in rec', () => {
    expect(lineRecurrence('check spec:1w')).toBeNull();
    expect(lineRecurrence('note prec:1w')).toBeNull();
  });

  it('requires a whitespace boundary before the key', () => {
    expect(lineRecurrence('xrec:1w')).toBeNull();
  });
});

// ===========================================================================
// Date arithmetic
// ===========================================================================

describe('isoDayDiff', () => {
  it('counts whole days, signed', () => {
    expect(isoDayDiff('2026-08-05', '2026-08-12')).toBe(7);
    expect(isoDayDiff('2026-08-12', '2026-08-05')).toBe(-7);
    expect(isoDayDiff('2026-08-05', '2026-08-05')).toBe(0);
  });

  it('crosses month and year boundaries', () => {
    expect(isoDayDiff('2026-01-31', '2026-02-01')).toBe(1);
    expect(isoDayDiff('2026-12-31', '2027-01-01')).toBe(1);
  });

  it('counts the leap day', () => {
    expect(isoDayDiff('2028-02-28', '2028-03-01')).toBe(2);
    expect(isoDayDiff('2027-02-28', '2027-03-01')).toBe(1);
  });
});

describe('addMonthsIso', () => {
  it('adds whole months', () => {
    expect(addMonthsIso('2026-08-05', 1)).toBe('2026-09-05');
    expect(addMonthsIso('2026-08-05', 3)).toBe('2026-11-05');
  });

  it('rolls the year over', () => {
    expect(addMonthsIso('2026-11-15', 2)).toBe('2027-01-15');
    expect(addMonthsIso('2026-12-01', 1)).toBe('2027-01-01');
    expect(addMonthsIso('2026-01-10', 12)).toBe('2027-01-10');
    expect(addMonthsIso('2026-06-10', 30)).toBe('2028-12-10');
  });

  it('clamps to the target month end instead of rolling over', () => {
    expect(addMonthsIso('2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonthsIso('2026-03-31', 1)).toBe('2026-04-30');
    expect(addMonthsIso('2026-05-31', 1)).toBe('2026-06-30');
    expect(addMonthsIso('2026-08-31', 6)).toBe('2027-02-28');
  });

  it('clamps onto a leap February when the target year has one', () => {
    expect(addMonthsIso('2028-01-31', 1)).toBe('2028-02-29');
  });

  it('clamps a leap day shifted by whole years', () => {
    expect(addMonthsIso('2028-02-29', 12)).toBe('2029-02-28');
    expect(addMonthsIso('2028-02-29', 48)).toBe('2032-02-29');
  });

  it('handles a negative shift without producing a bad month index', () => {
    expect(addMonthsIso('2026-01-15', -1)).toBe('2025-12-15');
    expect(addMonthsIso('2026-01-15', -13)).toBe('2024-12-15');
  });
});

describe('isWeekendIso', () => {
  it('identifies Saturday and Sunday', () => {
    // 2026-08-08 is a Saturday, 2026-08-09 a Sunday.
    expect(isWeekendIso('2026-08-08')).toBe(true);
    expect(isWeekendIso('2026-08-09')).toBe(true);
  });

  it('rejects weekdays', () => {
    for (const iso of ['2026-08-10', '2026-08-11', '2026-08-12', '2026-08-13', '2026-08-14']) {
      expect(isWeekendIso(iso)).toBe(false);
    }
  });
});

describe('addBusinessDaysIso', () => {
  it('behaves like calendar days inside one work week', () => {
    // Mon 2026-08-03 -> Tue / Wed.
    expect(addBusinessDaysIso('2026-08-03', 1)).toBe('2026-08-04');
    expect(addBusinessDaysIso('2026-08-03', 2)).toBe('2026-08-05');
  });

  it('skips the weekend from a Friday', () => {
    // Fri 2026-08-07 + 1b -> Mon 2026-08-10.
    expect(addBusinessDaysIso('2026-08-07', 1)).toBe('2026-08-10');
    expect(addBusinessDaysIso('2026-08-07', 3)).toBe('2026-08-12');
  });

  it('lands on Monday when the base itself is a weekend day', () => {
    expect(addBusinessDaysIso('2026-08-08', 1)).toBe('2026-08-10'); // Sat
    expect(addBusinessDaysIso('2026-08-09', 1)).toBe('2026-08-10'); // Sun
  });

  it('advances five business days by exactly one calendar week', () => {
    expect(addBusinessDaysIso('2026-08-03', 5)).toBe('2026-08-10');
    expect(addBusinessDaysIso('2026-08-03', 10)).toBe('2026-08-17');
  });

  it('never lands on a weekend, over a long run', () => {
    let cur = '2026-08-03';
    for (let i = 0; i < 40; i += 1) {
      cur = addBusinessDaysIso(cur, 1);
      expect(isWeekendIso(cur)).toBe(false);
    }
  });

  it('is a no-op for zero', () => {
    expect(addBusinessDaysIso('2026-08-08', 0)).toBe('2026-08-08');
  });
});

describe('shiftIsoByRecurrence', () => {
  it('shifts by each unit', () => {
    expect(shiftIsoByRecurrence('2026-08-05', rec(3, 'd'))).toBe('2026-08-08');
    expect(shiftIsoByRecurrence('2026-08-05', rec(2, 'w'))).toBe('2026-08-19');
    expect(shiftIsoByRecurrence('2026-08-05', rec(1, 'm'))).toBe('2026-09-05');
    expect(shiftIsoByRecurrence('2026-08-05', rec(1, 'y'))).toBe('2027-08-05');
    // Wed 2026-08-05 + 3b -> Mon 2026-08-10.
    expect(shiftIsoByRecurrence('2026-08-05', rec(3, 'b'))).toBe('2026-08-10');
  });

  it('treats y as 12 months, so leap-day clamping applies', () => {
    expect(shiftIsoByRecurrence('2028-02-29', rec(1, 'y'))).toBe('2029-02-28');
  });
});

// ===========================================================================
// nextRecurrenceLine — the anchors
// ===========================================================================

const TODAY = '2026-08-05';

describe('nextRecurrenceLine — non-strict anchor (completion date)', () => {
  it('anchors due: on the completion date, ignoring how late it was', () => {
    // Was due a week ago; finished today. Next is two weeks from TODAY.
    const line = '2026-07-01 pay water bill rec:2w due:2026-07-29';
    expect(nextRecurrenceLine(line, TODAY)).toBe(
      '2026-08-05 pay water bill rec:2w due:2026-08-19',
    );
  });

  it('anchors on completion even when finished EARLY', () => {
    const line = '2026-07-01 water plants rec:3d due:2026-08-20';
    expect(nextRecurrenceLine(line, TODAY)).toBe(
      '2026-08-05 water plants rec:3d due:2026-08-08',
    );
  });

  it('anchors a t:-only line on the completion date', () => {
    const line = '2026-07-01 renew passport rec:1m t:2026-07-20';
    expect(nextRecurrenceLine(line, TODAY)).toBe(
      '2026-08-05 renew passport rec:1m t:2026-09-05',
    );
  });

  it('applies month clamping through the completion anchor', () => {
    const line = '2026-01-01 file report rec:1m due:2026-01-31';
    expect(nextRecurrenceLine(line, '2026-01-31')).toBe(
      '2026-01-31 file report rec:1m due:2026-02-28',
    );
  });

  it('applies business-day skipping through the completion anchor', () => {
    // Completed Fri 2026-08-07, rec:1b -> Mon 2026-08-10.
    const line = '2026-08-01 post standup notes rec:1b due:2026-08-07';
    expect(nextRecurrenceLine(line, '2026-08-07')).toBe(
      '2026-08-07 post standup notes rec:1b due:2026-08-10',
    );
  });
});

describe('nextRecurrenceLine — strict anchor (original due:)', () => {
  it('anchors on the original due date, so lateness does not drag the series', () => {
    // Due on the 1st, paid on the 5th: next month is still the 1st.
    const line = '2026-07-01 pay rent rec:+1m due:2026-08-01';
    expect(nextRecurrenceLine(line, TODAY)).toBe(
      '2026-08-05 pay rent rec:+1m due:2026-09-01',
    );
  });

  it('stays on the same day of month across a long strict series', () => {
    let line = '2026-01-01 pay rent rec:+1m due:2026-01-01';
    const dues: string[] = [];
    for (let i = 0; i < 4; i += 1) {
      // Each occurrence completed a few days late.
      const next = nextRecurrenceLine(line, '2026-01-05');
      expect(next).not.toBeNull();
      line = next as string;
      dues.push(/due:(\S+)/.exec(line)?.[1] ?? '');
    }
    expect(dues).toEqual(['2026-02-01', '2026-03-01', '2026-04-01', '2026-05-01']);
  });

  it('falls back to t: when there is no due:', () => {
    const line = '2026-07-01 quarterly review rec:+3m t:2026-07-15';
    expect(nextRecurrenceLine(line, TODAY)).toBe(
      '2026-08-05 quarterly review rec:+3m t:2026-10-15',
    );
  });

  it('falls back to the completion date when neither due: nor t: exists', () => {
    // Nothing to shift, so this is identical to the non-strict result: a
    // fresh creation date and no invented deadline.
    const line = '2026-07-01 tidy desk rec:+1w';
    expect(nextRecurrenceLine(line, TODAY)).toBe('2026-08-05 tidy desk rec:+1w');
  });

  it('clamps a strict month-end series without walking it later', () => {
    let line = '2026-01-31 pay card rec:+1m due:2026-01-31';
    const dues: string[] = [];
    for (let i = 0; i < 3; i += 1) {
      line = nextRecurrenceLine(line, '2026-02-02') as string;
      dues.push(/due:(\S+)/.exec(line)?.[1] ?? '');
    }
    // Feb clamps to the 28th, and every later month anchors on THAT date, so
    // the series settles on the 28th rather than drifting.
    expect(dues).toEqual(['2026-02-28', '2026-03-28', '2026-04-28']);
  });
});

// ===========================================================================
// nextRecurrenceLine — the shared due↔t delta
// ===========================================================================

describe('nextRecurrenceLine — due: and t: shift by ONE delta', () => {
  it('preserves the gap for a non-strict pattern', () => {
    // t: is 7 days before due:. New due: is completion + 2w = 08-19, so the
    // delta applied to both is 08-19 - 08-30 = -11 days.
    const line = '2026-07-01 renew insurance rec:2w due:2026-08-30 t:2026-08-23';
    const next = nextRecurrenceLine(line, TODAY) as string;
    expect(next).toBe(
      '2026-08-05 renew insurance rec:2w due:2026-08-19 t:2026-08-12',
    );
    expect(isoDayDiff('2026-08-12', '2026-08-19')).toBe(7);
  });

  it('preserves the gap for a strict pattern', () => {
    const line = '2026-07-01 pay rent rec:+1m due:2026-08-01 t:2026-07-25';
    expect(nextRecurrenceLine(line, TODAY)).toBe(
      '2026-08-05 pay rent rec:+1m due:2026-09-01 t:2026-08-25',
    );
  });

  it('preserves the gap across a month-length change', () => {
    // Feb -> Mar is 28 days, so t: moves 28 days too and the 10-day gap holds.
    const line = '2026-02-18 file taxes rec:+1m due:2026-02-28 t:2026-02-18';
    const next = nextRecurrenceLine(line, '2026-02-20') as string;
    expect(next).toBe('2026-02-20 file taxes rec:+1m due:2026-03-28 t:2026-03-18');
    expect(isoDayDiff('2026-03-18', '2026-03-28')).toBe(10);
  });

  it('leads with due: when both are present, not with t:', () => {
    // If t: led, due: would land on 09-05 instead of 09-01.
    const line = 'pay rent rec:+1m due:2026-08-01 t:2026-08-05';
    expect(nextRecurrenceLine(line, TODAY)).toBe(
      '2026-08-05 pay rent rec:+1m due:2026-09-01 t:2026-09-05',
    );
  });

  it('shifts t: by the raw day delta for a business-day pattern', () => {
    // Wed 2026-08-05 + 2b = Fri 2026-08-07; delta = 07 - 06 = +1 day, so
    // t: moves one day too and the gap is preserved.
    const line = 'deploy rec:2b due:2026-08-06 t:2026-08-04';
    expect(nextRecurrenceLine(line, TODAY)).toBe(
      '2026-08-05 deploy rec:2b due:2026-08-07 t:2026-08-05',
    );
  });
});

// ===========================================================================
// nextRecurrenceLine — line shape
// ===========================================================================

describe('nextRecurrenceLine — line shape', () => {
  it('keeps the priority prefix', () => {
    expect(nextRecurrenceLine('(A) 2026-07-01 standup rec:1b', TODAY)).toBe(
      '(A) 2026-08-05 standup rec:1b',
    );
  });

  it('inserts a creation date when the original had none', () => {
    expect(nextRecurrenceLine('standup rec:1d', TODAY)).toBe('2026-08-05 standup rec:1d');
  });

  it('inserts the creation date after the priority, per spec rule 2', () => {
    expect(nextRecurrenceLine('(B) standup rec:1d', TODAY)).toBe(
      '(B) 2026-08-05 standup rec:1d',
    );
  });

  it('replaces an existing creation date rather than stacking a second one', () => {
    const next = nextRecurrenceLine('2020-01-01 standup rec:1d', TODAY) as string;
    expect(next).toBe('2026-08-05 standup rec:1d');
    expect(next.match(/\d{4}-\d{2}-\d{2}/g)).toHaveLength(1);
  });

  it('never carries an x prefix', () => {
    const next = nextRecurrenceLine('2026-07-01 standup rec:1d', TODAY) as string;
    expect(next.startsWith('x ')).toBe(false);
  });

  it('keeps the rec: tag so the series continues', () => {
    const next = nextRecurrenceLine('pay rent rec:+1m due:2026-08-01', TODAY) as string;
    expect(lineRecurrence(next)).toMatchObject({ strict: true, count: 1, unit: 'm' });
  });

  it('preserves projects, contexts and unrelated metadata verbatim', () => {
    const line = '(C) 2026-07-01 email @work +ops rec:1w due:2026-08-10 id:42 note:keep-me';
    expect(nextRecurrenceLine(line, TODAY)).toBe(
      '(C) 2026-08-05 email @work +ops rec:1w due:2026-08-12 id:42 note:keep-me',
    );
  });

  it('rewrites dates in place without moving tokens', () => {
    const line = 'due:2026-08-10 rec:1w t:2026-08-08 tail';
    expect(nextRecurrenceLine(line, TODAY)).toBe(
      '2026-08-05 due:2026-08-12 rec:1w t:2026-08-10 tail',
    );
  });

  it('leaves a lookalike key untouched while rewriting the real one', () => {
    const line = 'ship rec:1w due:2026-08-10 predue:2026-01-01 at:2026-01-01';
    expect(nextRecurrenceLine(line, TODAY)).toBe(
      '2026-08-05 ship rec:1w due:2026-08-12 predue:2026-01-01 at:2026-01-01',
    );
  });
});

// ===========================================================================
// nextRecurrenceLine — the guards (generate NOTHING)
// ===========================================================================

describe('nextRecurrenceLine — guards', () => {
  it('returns null without a rec: tag', () => {
    expect(nextRecurrenceLine('2026-07-01 pay rent due:2026-08-01', TODAY)).toBeNull();
  });

  it('returns null for a malformed rec: tag', () => {
    expect(nextRecurrenceLine('pay rent rec:monthly', TODAY)).toBeNull();
    expect(nextRecurrenceLine('pay rent rec:0d', TODAY)).toBeNull();
  });

  it('returns null on an already-completed line', () => {
    expect(nextRecurrenceLine('x 2026-08-01 pay rent rec:1m', TODAY)).toBeNull();
  });

  it('returns null on blank and whitespace-only lines', () => {
    expect(nextRecurrenceLine('', TODAY)).toBeNull();
    expect(nextRecurrenceLine('   ', TODAY)).toBeNull();
  });
});

// ===========================================================================
// completeLineWithRecurrence — the shared "done" transform
// ===========================================================================

describe('completeLineWithRecurrence', () => {
  it('returns completed line + next instance, in that order', () => {
    const out = completeLineWithRecurrence('2026-07-01 pay rent rec:+1m due:2026-08-01', TODAY);
    expect(out.split('\n')).toEqual([
      'x 2026-08-05 2026-07-01 pay rent rec:+1m due:2026-08-01',
      '2026-08-05 pay rent rec:+1m due:2026-09-01',
    ]);
  });

  it('moves the priority to pri:X on the completed line but keeps (X) on the next', () => {
    const [completed, next] = completeLineWithRecurrence(
      '(A) 2026-07-01 pay rent rec:1m due:2026-08-01',
      TODAY,
    ).split('\n');
    expect(completed).toBe('x 2026-08-05 2026-07-01 pay rent rec:1m due:2026-08-01 pri:A');
    expect(next).toBe('(A) 2026-08-05 pay rent rec:1m due:2026-09-05');
  });

  it('returns a single line for a task with no rec: tag', () => {
    const out = completeLineWithRecurrence('2026-07-01 pay rent', TODAY);
    expect(out).toBe('x 2026-08-05 2026-07-01 pay rent');
    expect(out).not.toContain('\n');
  });

  it('un-completes without spawning anything', () => {
    const out = completeLineWithRecurrence('x 2026-08-01 2026-07-01 pay rent rec:1m', TODAY);
    expect(out).toBe('2026-07-01 pay rent rec:1m');
    expect(out).not.toContain('\n');
  });

  it('round-trips: complete then un-complete the completed half', () => {
    const original = '(A) 2026-07-01 pay rent rec:1m due:2026-08-01';
    const [completed] = completeLineWithRecurrence(original, TODAY).split('\n');
    expect(completeLineWithRecurrence(completed, TODAY)).toBe(original);
  });

  it('is a no-op on blank lines', () => {
    expect(completeLineWithRecurrence('', TODAY)).toBe('');
    expect(completeLineWithRecurrence('   ', TODAY)).toBe('   ');
  });

  it('does not compound when the same task is completed twice in a row', () => {
    // Completing the generated instance yields exactly one further instance,
    // never two — the series stays a series, not a tree.
    const first = completeLineWithRecurrence('pay rent rec:1w due:2026-08-06', TODAY);
    const next = first.split('\n')[1];
    const second = completeLineWithRecurrence(next, '2026-08-12');
    expect(second.split('\n')).toHaveLength(2);
    expect(second.split('\n')[1]).toBe('2026-08-12 pay rent rec:1w due:2026-08-19');
  });
});
