/**
 * The vim leader commands' own text transforms.
 *
 * `sortLines` in cm-vim-todotxt.ts backs the `\s` leader command, and it must
 * uphold the same trailing-newline contract as the palette. The palette's
 * command engine (utils/commands.ts) carries a dedicated `splitLines()` /
 * `joinLines()` pair whose stated purpose is to "preserve both the trailing
 * newline (if any)", and every palette mutation routes through it. `\s` is the
 * app's other line-reordering path, so the two must agree.
 *
 * The failure mode if they do not: a todo.txt file ends with a newline, so a
 * naive `split('\n')` hands the comparator an extra `''` element, and `''`
 * sorts BEFORE every priority-less task (empty string wins `localeCompare`).
 * One `\s` keystroke then moves the terminator into the middle of the file as
 * a blank line and leaves the document without a trailing newline — which the
 * save pipeline sees as a diff on every sort.
 *
 * These are pure-function assertions — no DOM, no jsdom caveats. The mounted
 * consequences are in tests/VimMode.attack.test.tsx.
 */
import { describe, expect, it } from 'vitest';

import {
  archiveLine,
  priorityDown,
  priorityUp,
  sortLines,
} from '../ui/src/components/cm-vim-todotxt';
import { COMMANDS } from '../ui/src/utils/commands';
import { setPriority } from '../ui/src/utils/todotxt';
import { isToggleDoneShortcut } from '../ui/src/utils/todoTxtUiBehavior';

// ===========================================================================
// `\s` (leader sort) must preserve the file's trailing newline
// ===========================================================================

describe('\\s (leader sort) and the trailing newline', () => {
  it('keeps the trailing newline on a plain two-task file', () => {
    const before = 'beta task\nalpha task\n';
    const after = sortLines(before);

    // The tasks must reorder...
    expect(after.split('\n').filter((l) => l !== '')).toEqual([
      'alpha task',
      'beta task',
    ]);
    // ...without the file losing its terminator.
    expect(after.endsWith('\n')).toBe(true);
  });

  it('does not invent a blank FIRST line', () => {
    const after = sortLines('beta task\nalpha task\n');
    expect(after.split('\n')[0]).not.toBe('');
  });

  it('never changes the number of non-empty lines', () => {
    const before = '(A) alpha\nbeta\n(C) gamma\ndelta\n';
    const after = sortLines(before);
    const count = (s: string) => s.split('\n').filter((l) => l.trim()).length;
    expect(count(after)).toBe(count(before));
    // ...and never grows the blank-line count either: a sort reorders, it
    // does not create lines.
    const blanks = (s: string) => s.split('\n').filter((l) => l === '').length;
    expect(blanks(after)).toBe(blanks(before));
  });

  it('is byte-identical to the palette engine on trailing-newline shape', () => {
    // The invariant every palette mutation upholds, stated against the real
    // command engine rather than asserted from memory: `sort` round-trips
    // the terminator. `\s` must match it.
    const sortCmd = COMMANDS.find((c) => c.name === 'sort');
    expect(sortCmd).toBeTruthy();
    const before = 'beta task\nalpha task\n';
    const viaPalette = sortCmd!.apply(before, [], 'todo');
    expect(viaPalette.type).toBe('mutation');
    const paletteOut = (viaPalette as { content: string }).content;

    expect(paletteOut.endsWith('\n')).toBe(true);
    // Same terminator contract from the vim path.
    expect(sortLines(before).endsWith('\n')).toBe(paletteOut.endsWith('\n'));
  });

  it('leaves a file with no trailing newline without one', () => {
    // The other direction: `\s` must not ADD a terminator either, or the
    // save pipeline sees a phantom diff on every sort.
    const after = sortLines('beta task\nalpha task');
    expect(after.endsWith('\n')).toBe(false);
    expect(after).toBe('alpha task\nbeta task');
  });

  it('is idempotent — a second \\s changes nothing', () => {
    const once = sortLines('(A) alpha\nbeta\ngamma\n');
    expect(sortLines(once)).toBe(once);
  });

  it('preserves interior blank spacers in place rather than hoisting them', () => {
    // A user who groups tasks with a blank spacer keeps N blank lines after a
    // sort. Where they land is a design choice; how MANY there are is not.
    const before = '(A) alpha\n\n(B) beta\n';
    const after = sortLines(before);
    expect(after.split('\n').filter((l) => l === '').length).toBe(
      before.split('\n').filter((l) => l === '').length,
    );
  });

  it('preserves CRLF terminators', () => {
    // A CRLF file must survive a sort, exactly as it survives markLineDone.
    const before = 'beta task\r\nalpha task\r\n';
    const after = sortLines(before);
    expect(after).toBe('alpha task\r\nbeta task\r\n');
  });
});

// ===========================================================================
// Leader transforms that must refuse to touch a completed line
// ===========================================================================

describe('leader transforms guard completed lines', () => {
  it('\\j / \\k no-op on a completed line', () => {
    const done = 'x 2026-08-05 buy milk';
    expect(priorityDown(done)).toBe(done);
    expect(priorityUp(done)).toBe(done);
  });

  it('\\a / \\b / \\c cannot put a priority in front of `x `', () => {
    // setPriority() itself returns completed lines untouched, so the
    // guard-less defineLineAction wrappers are safe by delegation. Were this
    // to regress, `(A) x 2026-08-05 buy milk` would stop parsing as complete
    // in the filter, the report and every tally.
    const done = 'x 2026-08-05 buy milk';
    for (const p of ['A', 'B', 'C']) {
      expect(setPriority(done, p)).toBe(done);
    }
  });

  it('\\D is idempotent and does not double-tag', () => {
    const once = archiveLine('buy milk');
    expect(once).toMatch(/\barchived:1$/);
    expect(archiveLine(once)).toBe(once);
  });

  it('\\D no-ops on a blank line', () => {
    expect(archiveLine('   ')).toBe('   ');
    expect(archiveLine('')).toBe('');
  });
});

// ===========================================================================
// KEYMAP COLLISIONS — Ctrl+D is vim's half-page-down AND the app's mark-done
// ===========================================================================
//
// Two claimants for one chord: which one wins per mode, and is the loser left
// silently dead? `isToggleDoneShortcut` is the whole arbitration, so it is
// asserted directly rather than inferred from a mounted keypress.

describe('Ctrl+D / Cmd+D arbitration is explicit, not accidental', () => {
  const ev = (over: Partial<KeyboardEvent>) => ({
    altKey: false,
    ctrlKey: false,
    key: 'd',
    metaKey: false,
    shiftKey: false,
    ...over,
  });

  it('Ctrl+D yields to vim when vim is on, and marks done when it is off', () => {
    expect(isToggleDoneShortcut(ev({ ctrlKey: true }), true)).toBe(false);
    expect(isToggleDoneShortcut(ev({ ctrlKey: true }), false)).toBe(true);
  });

  it('Cmd+D still marks done in vim mode — it is not a vim binding', () => {
    // This is what keeps mark-done reachable for a vim user on macOS. If it
    // ever returns false, `\\x` becomes the ONLY way to complete a task and
    // the help rail's Cmd+D promise goes silently dead.
    expect(isToggleDoneShortcut(ev({ metaKey: true }), true)).toBe(true);
  });

  it('never fires with BOTH modifiers, or with a shift/alt companion', () => {
    expect(isToggleDoneShortcut(ev({ ctrlKey: true, metaKey: true }), false)).toBe(
      false,
    );
    expect(
      isToggleDoneShortcut(ev({ metaKey: true, shiftKey: true }), true),
    ).toBe(false);
    expect(isToggleDoneShortcut(ev({ metaKey: true, altKey: true }), true)).toBe(
      false,
    );
  });
});

// ===========================================================================
// Ctrl+Shift+D — the cross-platform Vim-mode mark-done
// ===========================================================================
//
// Vim mode yields Ctrl+D to vim's half-page scroll, which leaves Linux and
// Windows vim users with no modifier shortcut for mark-done at all: macOS keeps
// Command+D, they have no Command key, and `\x` is the only other route but
// nothing surfaces it. Ctrl+Shift+D is not a vim normal-mode binding, so it can
// carry the action on every platform without competing for a key vim wants.
describe('Ctrl+Shift+D marks done in vim mode, on every platform', () => {
  const ev = (over: Partial<KeyboardEvent>) => ({
    altKey: false,
    ctrlKey: false,
    key: 'd',
    metaKey: false,
    shiftKey: false,
    ...over,
  });

  it('is accepted in vim mode', () => {
    expect(
      isToggleDoneShortcut(ev({ ctrlKey: true, shiftKey: true }), true),
    ).toBe(true);
  });

  it('is REFUSED outside vim mode, so plain Cmd/Ctrl+D stays the one binding', () => {
    expect(
      isToggleDoneShortcut(ev({ ctrlKey: true, shiftKey: true }), false),
    ).toBe(false);
  });

  it('does not accept Cmd+Shift+D (not the escape hatch, and often a browser key)', () => {
    expect(
      isToggleDoneShortcut(ev({ metaKey: true, shiftKey: true }), true),
    ).toBe(false);
  });

  it('still refuses plain Ctrl+D in vim mode — that is vim\'s scroll', () => {
    expect(isToggleDoneShortcut(ev({ ctrlKey: true }), true)).toBe(false);
  });

  it('still accepts Command+D in vim mode (macOS keeps working)', () => {
    expect(isToggleDoneShortcut(ev({ metaKey: true }), true)).toBe(true);
  });

  it('refuses Alt companions in every combination', () => {
    expect(
      isToggleDoneShortcut(ev({ ctrlKey: true, shiftKey: true, altKey: true }), true),
    ).toBe(false);
  });
});
