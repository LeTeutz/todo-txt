/**
 * Tests for frontend parity + race fixes (items A, 2-13).
 *
 * Covers:
 *   - Blank-line guard (item 4)
 *   - Inline-arg parsing for CommandPalette (item 5)
 *   - deduplicate command (item 6)
 *   - Filter case-insensitive + multi-term AND + -TERM negation (item 7)
 *   - Pri preservation as pri:X tag (item 8)
 *   - COMPLETION_PREFIX_RE fix (item 9)
 *   - Append double-space collapse (item 12)
 *   - Del global case-insensitive (item 7)
 */
import { describe, it, expect } from 'vitest';
import { markLineDone, isComplete } from '../ui/src/utils/todotxt';
import { COMMANDS, type ApplyResult } from '../ui/src/utils/commands';

// Helpers
function cmd(name: string) {
  const c = COMMANDS.find((c) => c.name === name || c.shortName === name);
  if (!c) throw new Error(`Command "${name}" not found`);
  return c;
}

function asMutation(result: ApplyResult) {
  if (result.type !== 'mutation') throw new Error(`Expected mutation, got ${result.type}`);
  return result;
}

function asFilter(result: ApplyResult) {
  if (result.type !== 'filter') throw new Error(`Expected filter, got ${result.type}`);
  return result;
}

function asAggregate(result: ApplyResult) {
  if (result.type !== 'aggregate') throw new Error(`Expected aggregate, got ${result.type}`);
  return result;
}

// ===========================================================================
// Item 4: Blank-line guard
// ===========================================================================

describe('blank-line guard', () => {
  it('markLineDone no-ops on empty string', () => {
    expect(markLineDone('', '2026-07-24')).toBe('');
  });

  it('markLineDone no-ops on whitespace-only line', () => {
    expect(markLineDone('   ', '2026-07-24')).toBe('   ');
  });

  it('markLineDone no-ops on tab-only line', () => {
    expect(markLineDone('\t', '2026-07-24')).toBe('\t');
  });

  it('do command no-ops on blank line', () => {
    const content = 'Buy milk\n\nSell eggs\n';
    const out = asMutation(cmd('do').apply(content, ['2'], 'todo'));
    // Line 2 is blank — content unchanged.
    expect(out.content).toBe(content);
  });

  it('do command no-ops on whitespace-only line', () => {
    const content = 'Buy milk\n   \nSell eggs\n';
    const out = asMutation(cmd('do').apply(content, ['2'], 'todo'));
    expect(out.content).toBe(content);
  });
});

// ===========================================================================
// Item 5: Inline-arg parsing (tested via the exported helpers in palette)
// ===========================================================================

describe('CommandPalette inline-arg parsing', () => {
  // We test the logic by directly calling the commands as the palette would
  // after parsing "verb rest" in the search input.

  it('do 2 marks item 2 done', () => {
    const content = 'First\nSecond\nThird\n';
    const out = asMutation(cmd('do').apply(content, ['2'], 'todo'));
    expect(out.content).toMatch(/^First\nx \d{4}-\d{2}-\d{2} Second\nThird\n$/);
  });

  it('pri 2 A sets priority on item 2', () => {
    const content = 'First\nSecond\nThird\n';
    const out = asMutation(cmd('pri').apply(content, ['2', 'A'], 'todo'));
    expect(out.content).toBe('First\n(A) Second\nThird\n');
  });

  it('add buy milk @errands adds full text as one task', () => {
    const content = 'Existing\n';
    const out = asMutation(cmd('add').apply(content, ['buy milk @errands'], 'todo'));
    expect(out.content).toBe('Existing\nbuy milk @errands\n');
  });

  it('list +proj filters by project', () => {
    const content = 'Buy milk +groceries\nCode +dev\n';
    const out = asFilter(cmd('list').apply(content, ['+groceries'], 'todo'));
    expect(out.lines).toHaveLength(1);
    expect(out.lines[0].text).toBe('Buy milk +groceries');
  });
});

// ===========================================================================
// Item 6: deduplicate command
// ===========================================================================

describe('deduplicate', () => {
  it('removes duplicate lines keeping first', () => {
    const content = 'Buy milk\nSell eggs\nBuy milk\nBuy milk\n';
    const out = asMutation(cmd('deduplicate').apply(content, [], 'todo'));
    expect(out.content).toBe('Buy milk\nSell eggs\n');
  });

  it('preserves blank lines (not considered duplicates)', () => {
    const content = 'A\n\nB\n\nA\n';
    const out = asMutation(cmd('deduplicate').apply(content, [], 'todo'));
    expect(out.content).toBe('A\n\nB\n\n');
  });

  it('no-op on unique content', () => {
    const content = 'A\nB\nC\n';
    const out = asMutation(cmd('deduplicate').apply(content, [], 'todo'));
    expect(out.content).toBe('A\nB\nC\n');
  });

  it('dedup alias works', () => {
    const c = COMMANDS.find((c) => c.shortName === 'dedup');
    expect(c).toBeDefined();
    expect(c!.name).toBe('deduplicate');
  });
});

// ===========================================================================
// Item 7: Filter semantics — case-insensitive, multi-term AND, -TERM negation
// ===========================================================================

describe('filter semantics', () => {
  const content = 'Buy MILK @store\nsell Eggs +farm\nClean house @home\n';

  it('list is case-insensitive', () => {
    const out = asFilter(cmd('list').apply(content, ['milk'], 'todo'));
    expect(out.lines).toHaveLength(1);
    expect(out.lines[0].text).toBe('Buy MILK @store');
  });

  it('list with uppercase query matches lowercase content', () => {
    const out = asFilter(cmd('list').apply(content, ['EGGS'], 'todo'));
    expect(out.lines).toHaveLength(1);
  });

  it('list multi-term AND', () => {
    const out = asFilter(cmd('list').apply(content, ['sell farm'], 'todo'));
    expect(out.lines).toHaveLength(1);
    expect(out.lines[0].text).toContain('sell Eggs');
  });

  it('list -TERM negation', () => {
    const out = asFilter(cmd('list').apply(content, ['-@store'], 'todo'));
    expect(out.lines).toHaveLength(2);
    expect(out.lines.every((l) => !l.text.includes('@store'))).toBe(true);
  });

  it('list multi-term with negation', () => {
    // Want items containing "eggs" but NOT containing "house"
    const out = asFilter(cmd('list').apply(content, ['eggs -house'], 'todo'));
    expect(out.lines).toHaveLength(1);
    expect(out.lines[0].text).toContain('sell Eggs');
  });

  it('listall is case-insensitive', () => {
    const out = asFilter(cmd('listall').apply(content, ['HOUSE'], 'todo'));
    expect(out.lines).toHaveLength(1);
  });
});

// ===========================================================================
// Item 7: del with TERM — global case-insensitive, preserves leading ws
// ===========================================================================

describe('del TERM global case-insensitive', () => {
  it('removes all occurrences case-insensitively', () => {
    const content = 'Buy milk MILK Milk today\n';
    const out = asMutation(cmd('del').apply(content, ['1', 'milk'], 'todo'));
    // All three variants of "milk" should be removed
    expect(out.content).not.toMatch(/milk/i);
    expect(out.content).toContain('Buy');
    expect(out.content).toContain('today');
  });

  it('preserves leading whitespace on indented lines', () => {
    const content = '  Buy milk today\n';
    const out = asMutation(cmd('del').apply(content, ['1', 'milk'], 'todo'));
    // Leading spaces preserved
    expect(out.content).toMatch(/^ /m);
  });
});

// ===========================================================================
// Item 8: Priority preservation as pri:X tag
// ===========================================================================

describe('pri preservation', () => {
  it('markLineDone preserves priority as trailing pri:A tag', () => {
    const result = markLineDone('(A) Buy milk', '2026-07-24');
    expect(result).toBe('x 2026-07-24 Buy milk pri:A');
  });

  it('markLineDone preserves priority B', () => {
    const result = markLineDone('(B) Sell eggs', '2026-01-01');
    expect(result).toBe('x 2026-01-01 Sell eggs pri:B');
  });

  it('markLineDone does not add pri tag when no priority', () => {
    const result = markLineDone('Buy milk', '2026-07-24');
    expect(result).toBe('x 2026-07-24 Buy milk');
    expect(result).not.toContain('pri:');
  });

  it('do command preserves priority as pri:X', () => {
    const content = '(C) Walk dog\n';
    const out = asMutation(cmd('do').apply(content, ['1'], 'todo'));
    expect(out.content).toMatch(/pri:C/);
    expect(out.content).not.toMatch(/^\(/);
  });
});

// ===========================================================================
// Item 9: COMPLETION_PREFIX_RE — literal space only
// ===========================================================================

describe('COMPLETION_PREFIX_RE literal space', () => {
  it('x followed by tab is NOT considered complete', () => {
    // A line starting with "x\t" should NOT match (tab is not a space).
    expect(isComplete('x\tSomething')).toBe(false);
  });

  it('x followed by space IS complete', () => {
    expect(isComplete('x 2026-01-01 Done')).toBe(true);
  });

  it('x followed by multiple spaces IS complete', () => {
    // "x " at start — the regex matches "x " (two chars).
    expect(isComplete('x  2026-01-01 Done')).toBe(true);
  });
});

// ===========================================================================
// Item 12: Append double-space collapse
// ===========================================================================

describe('append double-space collapse', () => {
  it('collapses double spaces after appending to line ending in space', () => {
    const content = 'Buy milk \n';
    const out = asMutation(cmd('append').apply(content, ['1', 'today'], 'todo'));
    expect(out.content).toBe('Buy milk today\n');
    expect(out.content).not.toContain('  ');
  });

  it('normal append has single space', () => {
    const content = 'Buy milk\n';
    const out = asMutation(cmd('append').apply(content, ['1', '@store'], 'todo'));
    expect(out.content).toBe('Buy milk @store\n');
  });
});
