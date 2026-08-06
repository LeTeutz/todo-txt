/**
 * Exhaustive command-layer tests for every verb in COMMANDS.
 *
 * Tests go through the real public path: look up command by name in
 * COMMANDS, call cmd.apply(content, args, file). Date-dependent tests
 * mock the module-private currentDateIso via vi.spyOn + module re-export.
 */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  COMMANDS,
  Command,
  NotImplementedError,
  formatCommandErrorToast,
} from './commands';
import { STARTER_EXAMPLE } from './starterExample';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Look up a command by name. Throws if not found. */
function cmd(name: string): Command {
  const c = COMMANDS.find((c) => c.name === name);
  if (!c) throw new Error(`Test setup: no command named "${name}"`);
  return c;
}

/** Apply a command with a fixed content string and args. */
function apply(name: string, content: string, args: string[], file: 'todo' | 'done' | 'report' = 'todo') {
  return cmd(name).apply(content, args, file);
}

/** Extract mutation content or throw if result is not a mutation. */
function mutate(name: string, content: string, args: string[], file: 'todo' | 'done' | 'report' = 'todo'): string {
  const result = apply(name, content, args, file);
  if (result.type !== 'mutation') {
    throw new Error(`Expected mutation, got ${result.type}`);
  }
  return result.content;
}

// Mock the date for `do` command (it uses `new Date().toISOString()` internally)
const FIXED_DATE = '2026-07-24';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-07-24T12:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

// ---------------------------------------------------------------------------
// Meta: command registry integrity
// ---------------------------------------------------------------------------

describe('COMMANDS registry', () => {
  it('has 26 registered commands', () => {
    expect(COMMANDS.length).toBe(26);
  });

  it('every command has name, description, argSchema, and apply', () => {
    for (const c of COMMANDS) {
      expect(c.name).toBeTruthy();
      expect(c.description).toBeTruthy();
      expect(Array.isArray(c.argSchema)).toBe(true);
      expect(typeof c.apply).toBe('function');
    }
  });

  it('no duplicate names or shortNames', () => {
    const names = COMMANDS.map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
    const shorts = COMMANDS.filter((c) => c.shortName).map((c) => c.shortName);
    expect(new Set(shorts).size).toBe(shorts.length);
  });
});

describe('formatCommandErrorToast', () => {
  it('adds prefix when not already present', () => {
    expect(formatCommandErrorToast('add', 'text is required')).toBe('add: text is required');
  });

  it('does not double-prefix', () => {
    expect(formatCommandErrorToast('add', 'add: text is required')).toBe('add: text is required');
  });
});

// ---------------------------------------------------------------------------
// add
// ---------------------------------------------------------------------------

describe('add', () => {
  it('appends a new line to empty content', () => {
    expect(mutate('add', '', ['Buy milk'])).toBe('Buy milk');
  });

  it('appends to existing content (preserves trailing newline)', () => {
    expect(mutate('add', 'Task 1\n', ['Task 2'])).toBe('Task 1\nTask 2\n');
  });

  it('appends to existing content (no trailing newline)', () => {
    expect(mutate('add', 'Task 1', ['Task 2'])).toBe('Task 1\nTask 2');
  });

  it('throws on empty text', () => {
    expect(() => apply('add', '', [''])).toThrow('add: text is required');
  });

  it('throws on whitespace-only text', () => {
    expect(() => apply('add', '', ['   '])).toThrow('add: text is required');
  });

  it('preserves priority and metadata in added text', () => {
    expect(mutate('add', '', ['(A) Ship feature +project @work due:2026-08-01'])).toBe(
      '(A) Ship feature +project @work due:2026-08-01'
    );
  });
});

// ---------------------------------------------------------------------------
// do
// ---------------------------------------------------------------------------

describe('do', () => {
  it('marks a simple task done with x <date>', () => {
    const result = mutate('do', 'Buy milk\n', ['1']);
    expect(result).toBe(`x ${FIXED_DATE} Buy milk\n`);
  });

  it('priority round-trip: (A) task -> x <date> task pri:A', () => {
    const result = mutate('do', '(A) Important task\n', ['1']);
    expect(result).toBe(`x ${FIXED_DATE} Important task pri:A\n`);
  });

  it('priority (C) round-trip', () => {
    const result = mutate('do', '(C) Low task\n', ['1']);
    expect(result).toBe(`x ${FIXED_DATE} Low task pri:C\n`);
  });

  it('already-done line is idempotent (no double x)', () => {
    const content = `x 2026-07-20 Already done\n`;
    expect(mutate('do', content, ['1'])).toBe(content);
  });

  it('blank line guard: no-op on empty line', () => {
    const content = 'Task 1\n\nTask 3\n';
    expect(mutate('do', content, ['2'])).toBe(content);
  });

  it('whitespace-only line guard: no-op', () => {
    const content = 'Task 1\n   \nTask 3\n';
    expect(mutate('do', content, ['2'])).toBe(content);
  });

  it('marks correct item in multi-line file', () => {
    const content = 'First\nSecond\nThird\n';
    const result = mutate('do', content, ['2']);
    expect(result).toBe(`First\nx ${FIXED_DATE} Second\nThird\n`);
  });

  it('throws on out-of-range item#', () => {
    expect(() => apply('do', 'One\n', ['5'])).toThrow('out of range');
  });

  it('throws on non-integer item#', () => {
    expect(() => apply('do', 'One\n', ['abc'])).toThrow('must be an integer');
  });

  it('throws on item# 0', () => {
    expect(() => apply('do', 'One\n', ['0'])).toThrow('out of range');
  });
});

// ---------------------------------------------------------------------------
// del
// ---------------------------------------------------------------------------

describe('del', () => {
  it('removes an entire line by item#', () => {
    const content = 'First\nSecond\nThird\n';
    expect(mutate('del', content, ['2'])).toBe('First\nThird\n');
  });

  it('removes a term from a line (all occurrences)', () => {
    const content = 'Buy milk and milk and bread\n';
    expect(mutate('del', content, ['1', 'milk'])).toBe('Buy and and bread\n');
  });

  it('term removal is case-insensitive', () => {
    const content = 'Buy MILK and Milk and milk\n';
    expect(mutate('del', content, ['1', 'milk'])).toBe('Buy and and\n');
  });

  it('removes whole words only (not substrings)', () => {
    const content = 'milkshake milk milky\n';
    // "milk" as a whole word only matches standalone "milk", not inside milkshake/milky
    expect(mutate('del', content, ['1', 'milk'])).toBe('milkshake milky\n');
  });

  it('del last line of file', () => {
    const content = 'Only line\n';
    expect(mutate('del', content, ['1'])).toBe('\n');
  });

  it('throws on out-of-range', () => {
    expect(() => apply('del', 'One\n', ['3'])).toThrow('out of range');
  });
});

// ---------------------------------------------------------------------------
// list / listall filtering
// ---------------------------------------------------------------------------

describe('list', () => {
  const content = [
    '(A) Important @work +project',
    '(B) Medium task @home',
    'x 2026-07-20 Done task @work',
    'low priority task @work +project',
    '',
  ].join('\n');

  it('no filter returns all non-blank lines', () => {
    const result = apply('list', content, ['']);
    expect(result.type).toBe('filter');
    if (result.type === 'filter') {
      expect(result.lines.length).toBe(4);
    }
  });

  it('single term filter is case-insensitive', () => {
    const result = apply('list', content, ['IMPORTANT']);
    if (result.type === 'filter') {
      expect(result.lines.length).toBe(1);
      expect(result.lines[0].text).toContain('Important');
    }
  });

  it('multi-term AND filter', () => {
    const result = apply('list', content, ['@work +project']);
    if (result.type === 'filter') {
      // Lines that contain BOTH @work AND +project
      expect(result.lines.length).toBe(2);
      for (const line of result.lines) {
        expect(line.text.toLowerCase()).toContain('@work');
        expect(line.text.toLowerCase()).toContain('+project');
      }
    }
  });

  it('-TERM negation excludes matching lines', () => {
    const result = apply('list', content, ['@work -Important']);
    if (result.type === 'filter') {
      // @work lines that do NOT contain "Important"
      for (const line of result.lines) {
        expect(line.text.toLowerCase()).toContain('@work');
        expect(line.text.toLowerCase()).not.toContain('important');
      }
      expect(result.lines.length).toBe(2); // done task + low priority
    }
  });

  it('combined positive + negation', () => {
    const result = apply('list', content, ['task -home']);
    if (result.type === 'filter') {
      for (const line of result.lines) {
        expect(line.text.toLowerCase()).toContain('task');
        expect(line.text.toLowerCase()).not.toContain('@home');
      }
    }
  });
});

describe('listall', () => {
  const content = '(A) Active\nx 2026-07-20 Done\n';

  it('returns all non-blank lines (active + done)', () => {
    const result = apply('listall', content, ['']);
    if (result.type === 'filter') {
      expect(result.lines.length).toBe(2);
    }
  });

  it('filters apply to listall too (case-insensitive)', () => {
    const result = apply('listall', content, ['ACTIVE']);
    if (result.type === 'filter') {
      expect(result.lines.length).toBe(1);
      expect(result.lines[0].text).toContain('Active');
    }
  });
});

// ---------------------------------------------------------------------------
// pri
// ---------------------------------------------------------------------------

describe('pri', () => {
  it('sets priority on an unprioritized line', () => {
    expect(mutate('pri', 'Buy milk\n', ['1', 'A'])).toBe('(A) Buy milk\n');
  });

  it('replaces existing priority', () => {
    expect(mutate('pri', '(C) Task\n', ['1', 'A'])).toBe('(A) Task\n');
  });

  it('accepts lowercase input (normalizes to uppercase)', () => {
    expect(mutate('pri', 'Task\n', ['1', 'b'])).toBe('(B) Task\n');
  });

  it('throws on invalid priority (not A-Z)', () => {
    expect(() => apply('pri', 'Task\n', ['1', '5'])).toThrow('must be A-Z');
  });

  it('throws on empty priority arg', () => {
    expect(() => apply('pri', 'Task\n', ['1', ''])).toThrow('must be A-Z');
  });
});

// ---------------------------------------------------------------------------
// depri
// ---------------------------------------------------------------------------

describe('depri', () => {
  it('removes priority from a prioritized line', () => {
    expect(mutate('depri', '(A) Task\n', ['1'])).toBe('Task\n');
  });

  it('no-op on unprioritized line', () => {
    expect(mutate('depri', 'Task\n', ['1'])).toBe('Task\n');
  });

  it('no-op on completed line', () => {
    const content = 'x 2026-07-20 Done task\n';
    expect(mutate('depri', content, ['1'])).toBe(content);
  });
});

// ---------------------------------------------------------------------------
// append
// ---------------------------------------------------------------------------

describe('append', () => {
  it('appends text to an existing line', () => {
    expect(mutate('append', 'Buy\n', ['1', 'milk'])).toBe('Buy milk\n');
  });

  it('preserves (A) priority prefix', () => {
    expect(mutate('append', '(A) Task\n', ['1', '@work'])).toBe('(A) Task @work\n');
  });

  it('appends to empty line', () => {
    expect(mutate('append', '\n', ['1', 'text'])).toBe('text\n');
  });

  it('collapses double spaces', () => {
    expect(mutate('append', 'Task \n', ['1', ' extra'])).toBe('Task extra\n');
  });

  it('throws on empty text arg', () => {
    expect(() => apply('append', 'Task\n', ['1', ''])).toThrow('text is required');
  });

  it('throws on out-of-range', () => {
    expect(() => apply('append', 'One\n', ['5', 'x'])).toThrow('out of range');
  });
});

// ---------------------------------------------------------------------------
// prepend
// ---------------------------------------------------------------------------

describe('prepend', () => {
  it('prepends text to a line', () => {
    expect(mutate('prepend', 'milk\n', ['1', 'Buy'])).toBe('Buy milk\n');
  });

  it('preserves (A) priority prefix (inserts after it)', () => {
    expect(mutate('prepend', '(A) Task\n', ['1', 'URGENT'])).toBe('(A) URGENT Task\n');
  });

  it('prepends to empty line', () => {
    expect(mutate('prepend', '\n', ['1', 'new'])).toBe('new\n');
  });

  it('throws on empty text arg', () => {
    expect(() => apply('prepend', 'Task\n', ['1', ''])).toThrow('text is required');
  });
});

// ---------------------------------------------------------------------------
// replace
// ---------------------------------------------------------------------------

describe('replace', () => {
  it('replaces a line entirely', () => {
    expect(mutate('replace', 'Old text\nKeep\n', ['1', 'New text'])).toBe('New text\nKeep\n');
  });

  it('replaces with priority and metadata', () => {
    expect(mutate('replace', 'Old\n', ['1', '(B) New +proj'])).toBe('(B) New +proj\n');
  });

  it('throws on empty replacement text', () => {
    expect(() => apply('replace', 'Task\n', ['1', ''])).toThrow('text is required');
  });

  it('throws on out-of-range', () => {
    expect(() => apply('replace', 'One\n', ['3', 'X'])).toThrow('out of range');
  });
});

// ---------------------------------------------------------------------------
// deduplicate
// ---------------------------------------------------------------------------

describe('deduplicate', () => {
  it('removes exact duplicate lines (keeps first)', () => {
    const content = 'Buy milk\nBuy milk\nBuy bread\n';
    expect(mutate('deduplicate', content, [])).toBe('Buy milk\nBuy bread\n');
  });

  it('preserves blank lines (never deduped as duplicates)', () => {
    const content = 'A\n\nB\n\nC\n';
    expect(mutate('deduplicate', content, [])).toBe('A\n\nB\n\nC\n');
  });

  it('case-sensitive comparison', () => {
    const content = 'Buy Milk\nBuy milk\n';
    expect(mutate('deduplicate', content, [])).toBe('Buy Milk\nBuy milk\n');
  });

  it('multiple duplicates reduced to first occurrence', () => {
    const content = 'A\nB\nA\nC\nB\nA\n';
    expect(mutate('deduplicate', content, [])).toBe('A\nB\nC\n');
  });

  it('no-op on already-unique content', () => {
    const content = 'One\nTwo\nThree\n';
    expect(mutate('deduplicate', content, [])).toBe(content);
  });

  it('handles empty content', () => {
    expect(mutate('deduplicate', '', [])).toBe('');
  });
});

// ---------------------------------------------------------------------------
// sort
// ---------------------------------------------------------------------------

describe('sort', () => {
  it('default (priority): A before B before unprioritized', () => {
    const content = 'No priority\n(B) Beta\n(A) Alpha\n';
    expect(mutate('sort', content, [])).toBe('(A) Alpha\n(B) Beta\nNo priority\n');
  });

  it('priority sort: completed lines (no priority) sink to end', () => {
    const content = '(B) Task B\nx 2026-07-20 Done\n(A) Task A\n';
    expect(mutate('sort', content, [])).toBe('(A) Task A\n(B) Task B\nx 2026-07-20 Done\n');
  });

  it('date sort: earlier dates first', () => {
    const content = '(A) 2026-07-20 Late\n2026-01-01 Early\n(B) 2026-03-15 Mid\n';
    expect(mutate('sort', content, ['date'])).toBe(
      '2026-01-01 Early\n(B) 2026-03-15 Mid\n(A) 2026-07-20 Late\n'
    );
  });

  it('project sort: alphabetical by +project', () => {
    const content = '+zebra task\n+alpha task\nno project\n';
    expect(mutate('sort', content, ['project'])).toBe('+alpha task\n+zebra task\nno project\n');
  });

  it('context sort: alphabetical by @context', () => {
    const content = '@work task\n@admin task\nno context\n';
    expect(mutate('sort', content, ['context'])).toBe('@admin task\n@work task\nno context\n');
  });

  it('throws on invalid mode', () => {
    expect(() => apply('sort', 'A\n', ['bogus'])).toThrow('unknown mode');
  });

  it('stable sort: equal keys preserve relative order', () => {
    const content = '(A) First A\n(A) Second A\n(A) Third A\n';
    expect(mutate('sort', content, [])).toBe('(A) First A\n(A) Second A\n(A) Third A\n');
  });
});

// ---------------------------------------------------------------------------
// archive (server-action)
// ---------------------------------------------------------------------------

describe('archive', () => {
  it('returns a server-action targeting the archive endpoint', () => {
    const result = apply('archive', 'x 2026-07-20 Done\nActive\n', []);
    expect(result.type).toBe('server-action');
    if (result.type === 'server-action') {
      expect(result.endpoint).toContain('archive');
      expect(result.method).toBe('POST');
    }
  });
});

// ---------------------------------------------------------------------------
// move (server-action)
// ---------------------------------------------------------------------------

describe('move', () => {
  it('returns server-action with correct item and dest', () => {
    const result = apply('move', 'Task 1\nTask 2\n', ['1', 'done'], 'todo');
    expect(result.type).toBe('server-action');
    if (result.type === 'server-action') {
      expect(result.endpoint).toContain('move');
      expect(result.body).toEqual({ item: 1, from: 'todo', to: 'done' });
    }
  });

  it('throws when source == dest', () => {
    expect(() => apply('move', 'Task\n', ['1', 'todo'], 'todo')).toThrow(
      'source and destination are both'
    );
  });

  it('throws on invalid dest', () => {
    expect(() => apply('move', 'Task\n', ['1', 'bogus'], 'todo')).toThrow(
      'must be "todo" or "done"'
    );
  });

  it('throws on non-integer item#', () => {
    expect(() => apply('move', 'Task\n', ['abc', 'done'], 'todo')).toThrow('must be an integer');
  });
});

// ---------------------------------------------------------------------------
// report (server-action)
// ---------------------------------------------------------------------------

describe('report', () => {
  it('returns server-action targeting the report endpoint', () => {
    const result = apply('report', '', []);
    expect(result.type).toBe('server-action');
    if (result.type === 'server-action') {
      expect(result.endpoint).toContain('report');
      expect(result.method).toBe('POST');
    }
  });
});

// ---------------------------------------------------------------------------
// example
// ---------------------------------------------------------------------------

describe('example', () => {
  it('replaces content with STARTER_EXAMPLE', () => {
    expect(mutate('example', 'Old stuff\n', [])).toBe(STARTER_EXAMPLE);
  });

  it('works on empty content', () => {
    expect(mutate('example', '', [])).toBe(STARTER_EXAMPLE);
  });
});

// ---------------------------------------------------------------------------
// listpri
// ---------------------------------------------------------------------------

describe('listpri', () => {
  const content = '(A) Alpha\n(B) Beta\n(C) Charlie\nNo pri\n';

  it('no arg: returns all prioritized items', () => {
    const result = apply('listpri', content, ['']);
    if (result.type === 'filter') {
      expect(result.lines.length).toBe(3);
    }
  });

  it('single letter: filters to that priority', () => {
    const result = apply('listpri', content, ['B']);
    if (result.type === 'filter') {
      expect(result.lines.length).toBe(1);
      expect(result.lines[0].text).toContain('Beta');
    }
  });

  it('range A-B: returns A and B', () => {
    const result = apply('listpri', content, ['A-B']);
    if (result.type === 'filter') {
      expect(result.lines.length).toBe(2);
    }
  });

  it('accepts lowercase (normalizes)', () => {
    const result = apply('listpri', content, ['a']);
    if (result.type === 'filter') {
      expect(result.lines.length).toBe(1);
    }
  });

  it('throws on reversed range', () => {
    expect(() => apply('listpri', content, ['C-A'])).toThrow('reversed');
  });

  it('throws on invalid format', () => {
    expect(() => apply('listpri', content, ['123'])).toThrow('must be A-Z or a range');
  });
});

// ---------------------------------------------------------------------------
// listproj
// ---------------------------------------------------------------------------

describe('listproj', () => {
  const content = '(A) Task +alpha +beta\n(B) Task +alpha\nNo project\n';

  it('no arg: returns aggregate of all +projects', () => {
    const result = apply('listproj', content, ['']);
    if (result.type === 'aggregate') {
      expect(result.groups.length).toBe(2); // +alpha, +beta
      const alpha = result.groups.find((g) => g.key === '+alpha');
      expect(alpha?.count).toBe(2);
      const beta = result.groups.find((g) => g.key === '+beta');
      expect(beta?.count).toBe(1);
    }
  });

  it('with arg: filters items for that +project', () => {
    const result = apply('listproj', content, ['alpha']);
    if (result.type === 'filter') {
      expect(result.lines.length).toBe(2);
    }
  });

  it('accepts +prefix in arg', () => {
    const result = apply('listproj', content, ['+beta']);
    if (result.type === 'filter') {
      expect(result.lines.length).toBe(1);
    }
  });
});

// ---------------------------------------------------------------------------
// listcon
// ---------------------------------------------------------------------------

describe('listcon', () => {
  const content = '(A) Task @work @admin\n(B) Task @home\nNo context\n';

  it('no arg: returns aggregate of all @contexts', () => {
    const result = apply('listcon', content, ['']);
    if (result.type === 'aggregate') {
      expect(result.groups.length).toBe(3); // @work, @admin, @home
      const work = result.groups.find((g) => g.key === '@work');
      expect(work?.count).toBe(1);
    }
  });

  it('with arg: filters items for that @context', () => {
    const result = apply('listcon', content, ['work']);
    if (result.type === 'filter') {
      expect(result.lines.length).toBe(1);
      expect(result.lines[0].text).toContain('@work');
    }
  });

  it('accepts @prefix in arg', () => {
    const result = apply('listcon', content, ['@home']);
    if (result.type === 'filter') {
      expect(result.lines.length).toBe(1);
    }
  });
});

// ---------------------------------------------------------------------------
// listfile
// ---------------------------------------------------------------------------

describe('listfile', () => {
  it('switches to todo file', () => {
    const result = apply('listfile', '', ['todo']);
    expect(result.type).toBe('switch-file');
    if (result.type === 'switch-file') {
      expect(result.target).toBe('todo');
    }
  });

  it('accepts single-letter alias "d" for done', () => {
    const result = apply('listfile', '', ['d']);
    if (result.type === 'switch-file') {
      expect(result.target).toBe('done');
    }
  });

  it('accepts "r" for report', () => {
    const result = apply('listfile', '', ['r']);
    if (result.type === 'switch-file') {
      expect(result.target).toBe('report');
    }
  });

  it('throws on unknown file name', () => {
    expect(() => apply('listfile', '', ['bogus'])).toThrow('unknown file');
  });

  it('case-insensitive: "TODO" works', () => {
    const result = apply('listfile', '', ['TODO']);
    if (result.type === 'switch-file') {
      expect(result.target).toBe('todo');
    }
  });
});

// ---------------------------------------------------------------------------
// help (stub -- throws NotImplementedError)
// ---------------------------------------------------------------------------

describe('help', () => {
  it('throws NotImplementedError', () => {
    expect(() => apply('help', '', [])).toThrow(NotImplementedError);
  });

  it('error message contains command name', () => {
    try {
      apply('help', '', []);
    } catch (e) {
      expect((e as Error).message).toContain('help');
    }
  });
});

// ---------------------------------------------------------------------------
// Inline-arg parsing simulation
// ---------------------------------------------------------------------------

describe('inline-arg parsing (palette dispatch path)', () => {
  // The palette parses "do 2" as verb="do", args=["2"].
  // We test commands accept these args correctly.

  it('"do 2" marks line 2 done', () => {
    const content = 'First\nSecond\nThird\n';
    const result = mutate('do', content, ['2']);
    expect(result).toBe(`First\nx ${FIXED_DATE} Second\nThird\n`);
  });

  it('"pri 4 C" sets line 4 to priority C', () => {
    const content = 'One\nTwo\nThree\nFour\n';
    expect(mutate('pri', content, ['4', 'C'])).toBe('One\nTwo\nThree\n(C) Four\n');
  });

  it('"append 3 rec:1w" appends metadata to line 3', () => {
    const content = 'A\nB\nWeekly review\n';
    expect(mutate('append', content, ['3', 'rec:1w'])).toBe('A\nB\nWeekly review rec:1w\n');
  });

  it('"del 2 milk" removes term from line 2', () => {
    const content = 'Buy bread\nBuy milk and milk\n';
    expect(mutate('del', content, ['2', 'milk'])).toBe('Buy bread\nBuy and\n');
  });

  it('"replace 1 (A) New task" replaces line 1', () => {
    const content = 'Old task\nKeep\n';
    expect(mutate('replace', content, ['1', '(A) New task'])).toBe('(A) New task\nKeep\n');
  });

  it('"prepend 2 URGENT" prepends to line 2', () => {
    const content = 'First\nSecond\n';
    expect(mutate('prepend', content, ['2', 'URGENT'])).toBe('First\nURGENT Second\n');
  });
});

// ---------------------------------------------------------------------------
// Edge cases across multiple commands
// ---------------------------------------------------------------------------

describe('edge cases', () => {
  it('do + depri round-trip: do preserves pri, depri on done is no-op', () => {
    // Start with (A) task, mark done, then depri the done line
    let content = '(A) Task\n';
    content = mutate('do', content, ['1']);
    expect(content).toContain('pri:A');
    // depri on a completed line removes nothing (no PRIORITY_PREFIX_RE match)
    content = mutate('depri', content, ['1']);
    expect(content).toContain('pri:A'); // pri:A is a tag, not (A) prefix
  });

  it('pri on a completed line writes a pri:X tag, not an invalid (X) prefix', () => {
    // todo.txt stores priority on a completed task as a `pri:X` tag; a
    // leading `(X)` on an `x `-prefixed line is invalid. Mirrors `do`'s
    // round-trip form.
    const content = `x ${FIXED_DATE} Done\n`;
    const result = mutate('pri', content, ['1', 'A']);
    expect(result).toBe(`x ${FIXED_DATE} Done pri:A\n`);
  });

  it('pri on a completed line replaces an existing pri:X tag', () => {
    const content = `x ${FIXED_DATE} Done pri:C\n`;
    expect(mutate('pri', content, ['1', 'A'])).toBe(`x ${FIXED_DATE} Done pri:A\n`);
  });

  it('operations on single-line file without trailing newline', () => {
    expect(mutate('do', 'Task', ['1'])).toBe(`x ${FIXED_DATE} Task`);
    expect(mutate('pri', 'Task', ['1', 'B'])).toBe('(B) Task');
    expect(mutate('del', 'Task', ['1'])).toBe('');
  });

  it('sort on empty content is no-op', () => {
    expect(mutate('sort', '', [])).toBe('');
  });

  it('sort preserves trailing newline', () => {
    const content = '(B) B\n(A) A\n';
    expect(mutate('sort', content, [])).toBe('(A) A\n(B) B\n');
  });

  it('deduplicate on single line', () => {
    expect(mutate('deduplicate', 'One\n', [])).toBe('One\n');
  });

  it('list on empty content returns empty filter', () => {
    const result = apply('list', '', ['']);
    if (result.type === 'filter') {
      expect(result.lines.length).toBe(0);
    }
  });

  it('del removes the only line, leaving empty', () => {
    expect(mutate('del', 'Only\n', ['1'])).toBe('\n');
  });

  it('append to line that already has trailing spaces collapses them', () => {
    expect(mutate('append', 'Task  \n', ['1', 'more'])).toBe('Task more\n');
  });
});

// ===========================================================================
// filter (R1) — the palette-level contract.
//
// apply() only validates + normalizes; the page owns the state change. These
// cases lock the descriptor shape and the eager-validation behaviour that
// turns a typo into an error toast instead of a filter that dims everything.
// ===========================================================================

describe('filter command', () => {
  /** Narrow to the set-filter variant. */
  function setFilter(args: string[]): { type: 'set-filter'; expr: string | null } {
    const result = apply('filter', 'ignored content', args);
    if (result.type !== 'set-filter') {
      throw new Error(`Expected set-filter, got ${result.type}`);
    }
    return result;
  }

  it('returns the normalized expression', () => {
    expect(setFilter(['  @home   pri:A-C  ']).expr).toBe('@home pri:A-C');
  });

  it('clears on "clear", on the aliases, and on no argument at all', () => {
    for (const args of [['clear'], ['off'], ['none'], ['reset'], [''], []]) {
      expect(setFilter(args).expr).toBeNull();
    }
  });

  it('is case-insensitive about the clear keyword', () => {
    expect(setFilter(['CLEAR']).expr).toBeNull();
  });

  it('does not treat @clear or "cleared" as a clear request', () => {
    expect(setFilter(['@clear']).expr).toBe('@clear');
    expect(setFilter(['cleared']).expr).toBe('cleared');
  });

  it('throws on an invalid pri: term so the palette can toast it', () => {
    expect(() => apply('filter', '', ['pri:C-A'])).toThrow(/reversed/i);
    expect(() => apply('filter', '', ['pri:9'])).toThrow(/expected a letter/i);
  });

  it('throws on an invalid due: term', () => {
    expect(() => apply('filter', '', ['due:tomorow'])).toThrow(/expected today/i);
  });

  it('throws WITHOUT a "filter: " prefix — the dispatcher adds it', () => {
    // Double-prefix regression: the toast must read
    // "filter: pri: range ... is reversed", not "filter: filter: ...".
    try {
      apply('filter', '', ['pri:C-A']);
      throw new Error('expected a throw');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      expect(message.startsWith('filter: ')).toBe(false);
      expect(formatCommandErrorToast('filter', message)).toBe(`filter: ${message}`);
    }
  });

  it('never mutates content — a filter is a view, not an edit', () => {
    const content = '(A) file taxes\n(B) mow lawn @home\n';
    expect(apply('filter', content, ['@home']).type).toBe('set-filter');
    // No mutation variant is reachable, so there is nothing to write back.
    expect(setFilter(['@home'])).not.toHaveProperty('content');
  });

  it('is registered with the "f" alias and an optional argument', () => {
    const c = cmd('filter');
    expect(c.shortName).toBe('f');
    expect(c.argSchema).toHaveLength(1);
    expect(c.argSchema[0].optional).toBe(true);
  });
});

// ===========================================================================
// R2 — `do` recurrence (rec:) and the `threshold` command
// ===========================================================================

describe('do — rec: recurrence', () => {
  it('inserts the next instance directly AFTER the completed line', () => {
    const out = mutate('do', 'a\npay rent rec:+1m due:2026-08-01\nb', ['2']);
    expect(out.split('\n')).toEqual([
      'a',
      `x ${FIXED_DATE} pay rent rec:+1m due:2026-08-01`,
      `${FIXED_DATE} pay rent rec:+1m due:2026-09-01`,
      'b',
    ]);
  });

  it('anchors a non-strict pattern on the completion date', () => {
    const out = mutate('do', 'water plants rec:3d due:2026-06-01', ['1']);
    // FIXED_DATE is 2026-07-24, so the new due: is 2026-07-27.
    expect(out.split('\n')[1]).toBe(`${FIXED_DATE} water plants rec:3d due:2026-07-27`);
  });

  it('keeps (A) on the next instance while the completed line gets pri:A', () => {
    const out = mutate('do', '(A) pay rent rec:1m due:2026-08-01', ['1']);
    expect(out.split('\n')).toEqual([
      `x ${FIXED_DATE} pay rent rec:1m due:2026-08-01 pri:A`,
      `(A) ${FIXED_DATE} pay rent rec:1m due:2026-08-24`,
    ]);
  });

  it('shifts due: and t: by the same delta', () => {
    const out = mutate('do', 'renew rec:+1m due:2026-08-01 t:2026-07-25', ['1']);
    expect(out.split('\n')[1]).toBe(
      `${FIXED_DATE} renew rec:+1m due:2026-09-01 t:2026-08-25`,
    );
  });

  it('generates nothing for a task without a rec: tag', () => {
    const out = mutate('do', 'pay rent due:2026-08-01', ['1']);
    expect(out.split('\n')).toHaveLength(1);
  });

  it('generates nothing for a malformed rec: tag', () => {
    const out = mutate('do', 'pay rent rec:monthly', ['1']);
    expect(out.split('\n')).toHaveLength(1);
  });

  it('stays idempotent on an already-done recurring line', () => {
    const content = `x 2026-07-01 pay rent rec:1m`;
    expect(mutate('do', content, ['1'])).toBe(content);
  });

  it('preserves the trailing newline while inserting a line', () => {
    const out = mutate('do', 'pay rent rec:1w due:2026-08-01\n', ['1']);
    expect(out.endsWith('\n')).toBe(true);
    expect(out.split('\n').filter((l) => l !== '')).toHaveLength(2);
  });

  it('does not disturb a blank spacer line that follows', () => {
    const out = mutate('do', 'pay rent rec:1w\n\nnext', ['1']);
    expect(out.split('\n')).toEqual([
      `x ${FIXED_DATE} pay rent rec:1w`,
      `${FIXED_DATE} pay rent rec:1w`,
      '',
      'next',
    ]);
  });

  it('leaves the completed line itself byte-identical to the non-recurring path', () => {
    const withRec = mutate('do', 'ship it rec:1w due:2026-08-01', ['1']).split('\n')[0];
    const withoutRec = mutate('do', 'ship it due:2026-08-01', ['1']);
    expect(withRec).toBe(withoutRec.replace('ship it', 'ship it rec:1w'));
  });
});

describe('threshold command', () => {
  it('is registered with a short alias', () => {
    expect(cmd('threshold').shortName).toBe('th');
  });

  it('takes one optional argument', () => {
    const c = cmd('threshold');
    expect(c.argSchema).toHaveLength(1);
    expect(c.argSchema[0].optional).toBe(true);
  });

  it('returns set-threshold hide for "hide"', () => {
    expect(apply('threshold', '', ['hide'])).toEqual({
      type: 'set-threshold',
      mode: 'hide',
    });
  });

  it('returns set-threshold show for "show"', () => {
    expect(apply('threshold', '', ['show'])).toEqual({
      type: 'set-threshold',
      mode: 'show',
    });
  });

  it('returns a toggle for no argument', () => {
    expect(apply('threshold', '', [])).toEqual({ type: 'set-threshold', mode: 'toggle' });
    expect(apply('threshold', '', [''])).toEqual({ type: 'set-threshold', mode: 'toggle' });
  });

  it('never mutates the file', () => {
    const content = 'a t:2027-01-01\nb';
    expect(apply('threshold', content, ['hide']).type).toBe('set-threshold');
    expect(apply('threshold', content, ['show']).type).toBe('set-threshold');
  });

  it('throws on an unrecognized mode', () => {
    expect(() => apply('threshold', '', ['hied'])).toThrow(/expected hide or show/);
  });

  it('throws a message the dispatcher can prefix exactly once', () => {
    try {
      apply('threshold', '', ['hied']);
      throw new Error('expected a throw');
    } catch (err) {
      const message = (err as Error).message;
      expect(formatCommandErrorToast('threshold', message)).toBe(`threshold: ${message}`);
      expect(message.startsWith('threshold:')).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// R3 — the `hidden` (h:1) view command
// ---------------------------------------------------------------------------

describe('hidden command', () => {
  it('is registered with a short alias that collides with nothing', () => {
    expect(cmd('hidden').shortName).toBe('h');
    const shorts = COMMANDS.map((c) => c.shortName).filter(Boolean);
    expect(new Set(shorts).size).toBe(shorts.length);
  });

  it('takes one optional argument', () => {
    const c = cmd('hidden');
    expect(c.argSchema).toHaveLength(1);
    expect(c.argSchema[0].optional).toBe(true);
  });

  it.each([
    ['dim', 'dim'],
    ['hide', 'hide'],
    ['show', 'show'],
  ])('returns set-hidden %s for "%s"', (arg, mode) => {
    expect(apply('hidden', '', [arg])).toEqual({ type: 'set-hidden', mode });
  });

  it('maps the affirmative "on" to dim, never to hide', () => {
    // A one-word affirmative must not be able to remove lines from view.
    expect(apply('hidden', '', ['on'])).toEqual({ type: 'set-hidden', mode: 'dim' });
  });

  it('returns a toggle for no argument', () => {
    expect(apply('hidden', '', [])).toEqual({ type: 'set-hidden', mode: 'toggle' });
    expect(apply('hidden', '', [''])).toEqual({ type: 'set-hidden', mode: 'toggle' });
  });

  it('never mutates the file', () => {
    const content = 'a h:1\nb';
    for (const arg of ['dim', 'hide', 'show']) {
      expect(apply('hidden', content, [arg]).type).toBe('set-hidden');
    }
  });

  it('throws on an unrecognized mode', () => {
    expect(() => apply('hidden', '', ['hied'])).toThrow(
      /expected dim, hide or show/,
    );
  });

  it('throws a message the dispatcher can prefix exactly once', () => {
    try {
      apply('hidden', '', ['hied']);
      throw new Error('expected a throw');
    } catch (err) {
      const message = (err as Error).message;
      expect(formatCommandErrorToast('hidden', message)).toBe(`hidden: ${message}`);
      expect(message.startsWith('hidden:')).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// set-root / where (R4)
// ---------------------------------------------------------------------------

describe('set-root command', () => {
  it('is registered with a REQUIRED argument', () => {
    const c = cmd('set-root');
    expect(c.argSchema).toHaveLength(1);
    // Deliberately not optional. Unlike filter / threshold / hidden, a bare
    // verb here must not do anything: a stray Enter cannot be allowed to
    // relocate where the user's tasks are read from.
    expect(c.argSchema[0].optional).toBeFalsy();
  });

  it('has no short alias', () => {
    // A one-or-two-letter alias for "change where my data lives" is a
    // mistyping hazard with no upside — this is not a verb you run often.
    expect(cmd('set-root').shortName).toBeUndefined();
  });

  it('returns set-root with the path verbatim', () => {
    expect(apply('set-root', '', ['~/Documents/todo'])).toEqual({
      type: 'set-root',
      root: '~/Documents/todo',
    });
  });

  it('returns a null root for the reset keywords', () => {
    for (const word of ['default', 'reset', 'clear']) {
      expect(apply('set-root', '', [word])).toEqual({
        type: 'set-root',
        root: null,
      });
    }
  });

  it('never mutates the file', () => {
    const content = 'a\nb\n';
    expect(apply('set-root', content, ['~/notes']).type).toBe('set-root');
    expect(apply('set-root', content, ['default']).type).toBe('set-root');
  });

  it('throws when no path is given', () => {
    expect(() => apply('set-root', '', [])).toThrow(/expected a directory path/);
    expect(() => apply('set-root', '', [''])).toThrow(
      /expected a directory path/,
    );
  });

  it('throws a message the dispatcher can prefix exactly once', () => {
    try {
      apply('set-root', '', []);
      throw new Error('expected a throw');
    } catch (err) {
      const message = (err as Error).message;
      expect(formatCommandErrorToast('set-root', message)).toBe(
        `set-root: ${message}`,
      );
      expect(message.startsWith('set-root:')).toBe(false);
    }
  });

  it('does NOT validate the path itself', () => {
    // The server owns the policy. A client-side copy is worth nothing (the API
    // is reachable without this UI) and two copies drift.
    const denied = '/Users/x/.' + 'ssh';
    expect(apply('set-root', '', [denied])).toEqual({
      type: 'set-root',
      root: denied,
    });
    expect(apply('set-root', '', ['relative/path'])).toEqual({
      type: 'set-root',
      root: 'relative/path',
    });
  });
});

describe('where command', () => {
  it('takes no arguments', () => {
    expect(cmd('where').argSchema).toHaveLength(0);
  });

  it('returns show-root and ignores any content or file', () => {
    for (const file of ['todo', 'done', 'report'] as const) {
      expect(apply('where', 'a\nb\n', [], file)).toEqual({ type: 'show-root' });
    }
  });

  it('works from every tab', () => {
    // `where` reports a directory, not a file, so restricting it to the todo
    // tab would make the answer unavailable exactly when a user on the done
    // tab wonders where done.txt is.
    expect(apply('where', '', [], 'done')).toEqual({ type: 'show-root' });
  });
});
