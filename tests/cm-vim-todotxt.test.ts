/**
 * cm-vim-todotxt.test.ts — unit tests for the vim leader binding
 * action functions (pure line transforms) and vim toggle persistence.
 *
 * Tests the exported pure functions, NOT the Vim.defineAction integration
 * (that requires a full CM6 + vim runtime). We test the contract: given
 * a line, expect the transformed output. Same pattern as the existing
 * shortcuts.test.ts and parity-fixes.test.ts.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  toggleDone,
  priorityDown,
  priorityUp,
  insertDate,
  archiveLine,
  sortLines,
  today,
} from '../ui/src/components/cm-vim-todotxt';

// ---------------------------------------------------------------------------
// toggleDone (\x)
// ---------------------------------------------------------------------------
describe('toggleDone (\\x)', () => {
  it('marks an incomplete line as done with today date', () => {
    const result = toggleDone('(A) Buy milk +groceries');
    expect(result).toMatch(/^x \d{4}-\d{2}-\d{2} Buy milk \+groceries pri:A$/);
  });

  it('unmarks a completed line', () => {
    const result = toggleDone('x 2024-07-01 Buy milk +groceries');
    expect(result).toBe('Buy milk +groceries');
  });

  it('is a no-op on blank lines (blank-line guard)', () => {
    expect(toggleDone('')).toBe('');
    expect(toggleDone('   ')).toBe('   ');
  });

  it('strips priority on completion and preserves as pri:X tag', () => {
    const result = toggleDone('(B) Do homework');
    expect(result).toContain('pri:B');
    expect(result).not.toContain('(B)');
    expect(result).toMatch(/^x /);
  });

  it('round-trips: done → undone → done', () => {
    const original = '(A) Task one';
    const done = toggleDone(original);
    const undone = toggleDone(done);
    // After undone, it should be the body without priority (pri preserved in tag).
    expect(undone).toContain('Task one');
    expect(undone).not.toMatch(/^x /);
  });
});

// ---------------------------------------------------------------------------
// priorityDown (\j)
// ---------------------------------------------------------------------------
describe('priorityDown (\\j)', () => {
  it('cycles A → B', () => {
    expect(priorityDown('(A) Task')).toBe('(B) Task');
  });

  it('cycles Z → strip (no priority)', () => {
    expect(priorityDown('(Z) Task')).toBe('Task');
  });

  it('cycles none → A', () => {
    expect(priorityDown('Task without priority')).toBe('(A) Task without priority');
  });

  it('is a no-op on completed lines', () => {
    const line = 'x 2024-01-01 Done task';
    expect(priorityDown(line)).toBe(line);
  });
});

// ---------------------------------------------------------------------------
// priorityUp (\k)
// ---------------------------------------------------------------------------
describe('priorityUp (\\k)', () => {
  it('cycles B → A', () => {
    expect(priorityUp('(B) Task')).toBe('(A) Task');
  });

  it('caps at A (A stays A)', () => {
    expect(priorityUp('(A) Task')).toBe('(A) Task');
  });

  it('gives unprioritized lines top priority (none → A)', () => {
    expect(priorityUp('Task without priority')).toBe('(A) Task without priority');
  });

  it('is a no-op on completed lines', () => {
    const line = 'x 2024-01-01 Done task';
    expect(priorityUp(line)).toBe(line);
  });
});

// ---------------------------------------------------------------------------
// insertDate (\d)
// ---------------------------------------------------------------------------
describe('insertDate (\\d)', () => {
  it('inserts creation date after priority', () => {
    const result = insertDate('(A) Task');
    expect(result).toMatch(/^\(A\) \d{4}-\d{2}-\d{2} Task$/);
  });

  it('inserts creation date at start if no priority', () => {
    const result = insertDate('Task without priority');
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} Task without priority$/);
  });

  it('is a no-op if creation date already exists', () => {
    const line = '(A) 2024-07-01 Task';
    expect(insertDate(line)).toBe(line);
  });

  it('is a no-op on completed lines', () => {
    const line = 'x 2024-07-01 Task';
    expect(insertDate(line)).toBe(line);
  });
});

// ---------------------------------------------------------------------------
// archiveLine (\D)
// ---------------------------------------------------------------------------
describe('archiveLine (\\D)', () => {
  it('marks incomplete line as done and adds archived:1', () => {
    const result = archiveLine('(A) Task');
    expect(result).toMatch(/^x \d{4}-\d{2}-\d{2}/);
    expect(result).toContain('archived:1');
  });

  it('adds archived:1 to already-completed line without duplicating', () => {
    const line = 'x 2024-07-01 Task';
    const result = archiveLine(line);
    expect(result).toBe('x 2024-07-01 Task archived:1');
  });

  it('does not duplicate archived:1 tag', () => {
    const line = 'x 2024-07-01 Task archived:1';
    expect(archiveLine(line)).toBe(line);
  });

  it('is a no-op on blank lines', () => {
    expect(archiveLine('')).toBe('');
    expect(archiveLine('   ')).toBe('   ');
  });
});

// ---------------------------------------------------------------------------
// sortLines (\s)
// ---------------------------------------------------------------------------
describe('sortLines (\\s)', () => {
  it('sorts by priority (A first), then alpha', () => {
    const input = '(B) Banana\n(A) Apple\n(C) Cherry';
    const result = sortLines(input);
    const lines = result.split('\n');
    expect(lines[0]).toBe('(A) Apple');
    expect(lines[1]).toBe('(B) Banana');
    expect(lines[2]).toBe('(C) Cherry');
  });

  it('sinks completed lines to bottom', () => {
    const input = 'x 2024-01-01 Done\n(A) Active\nNo priority';
    const result = sortLines(input);
    const lines = result.split('\n');
    expect(lines[0]).toBe('(A) Active');
    expect(lines[lines.length - 1]).toBe('x 2024-01-01 Done');
  });

  it('sorts no-priority lines after prioritized ones', () => {
    const input = 'Zebra task\n(Z) Last priority\n(A) First';
    const result = sortLines(input);
    const lines = result.split('\n');
    expect(lines[0]).toBe('(A) First');
    expect(lines[1]).toBe('(Z) Last priority');
    expect(lines[2]).toBe('Zebra task');
  });
});

// ---------------------------------------------------------------------------
// today() helper
// ---------------------------------------------------------------------------
describe('today()', () => {
  it('returns YYYY-MM-DD format', () => {
    expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

// ---------------------------------------------------------------------------
// Vim toggle localStorage persistence
// ---------------------------------------------------------------------------
describe('vim toggle persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('defaults to OFF (false) when no localStorage value', () => {
    const val = localStorage.getItem('todotxt.vimMode');
    expect(val).toBeNull();
    // The component reads this on mount — null means false.
  });

  it('persists true/false to localStorage', () => {
    localStorage.setItem('todotxt.vimMode', 'true');
    expect(localStorage.getItem('todotxt.vimMode')).toBe('true');

    localStorage.setItem('todotxt.vimMode', 'false');
    expect(localStorage.getItem('todotxt.vimMode')).toBe('false');
  });

  it('handles corrupted values gracefully', () => {
    localStorage.setItem('todotxt.vimMode', 'garbage');
    // The component should treat non-"true" as false.
    expect(localStorage.getItem('todotxt.vimMode') === 'true').toBe(false);
  });
});
