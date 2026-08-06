/**
 * Deep test coverage for cm-vim-todotxt — the VIM leader binding layer.
 *
 * Covers every exported pure function and the registerTodotxtVimBindings
 * integration with a mock Vim object.
 */
import { describe, it, expect, vi } from 'vitest';
import {
  today,
  priorityDown,
  priorityUp,
  toggleDone,
  insertDate,
  archiveLine,
  sortLines,
  registerTodotxtVimBindings,
} from './cm-vim-todotxt';

// ---------------------------------------------------------------------------
// today()
// ---------------------------------------------------------------------------

describe('today()', () => {
  it('returns a string matching YYYY-MM-DD format', () => {
    const result = today();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('returns a valid date (parseable by Date constructor)', () => {
    const result = today();
    const d = new Date(result + 'T00:00:00');
    expect(d.getTime()).not.toBeNaN();
  });
});

// ---------------------------------------------------------------------------
// priorityDown(line)
// ---------------------------------------------------------------------------

describe('priorityDown()', () => {
  it('none → A (assigns top priority)', () => {
    expect(priorityDown('buy milk')).toBe('(A) buy milk');
  });

  it('A → B', () => {
    expect(priorityDown('(A) buy milk')).toBe('(B) buy milk');
  });

  it('B → C', () => {
    expect(priorityDown('(B) something')).toBe('(C) something');
  });

  it('Y → Z', () => {
    expect(priorityDown('(Y) low')).toBe('(Z) low');
  });

  it('Z → none (strips priority)', () => {
    expect(priorityDown('(Z) lowest')).toBe('lowest');
  });

  it('completed line is unchanged', () => {
    const done = 'x 2026-07-24 already done';
    expect(priorityDown(done)).toBe(done);
  });

  it('line with creation date, no priority → adds A', () => {
    expect(priorityDown('2026-01-01 some task')).toBe('(A) 2026-01-01 some task');
  });
});

// ---------------------------------------------------------------------------
// priorityUp(line)
// ---------------------------------------------------------------------------

describe('priorityUp()', () => {
  it('none → A (gives top priority)', () => {
    expect(priorityUp('buy milk')).toBe('(A) buy milk');
  });

  it('A stays A (caps, does NOT strip)', () => {
    expect(priorityUp('(A) top task')).toBe('(A) top task');
  });

  it('B → A', () => {
    expect(priorityUp('(B) important')).toBe('(A) important');
  });

  it('C → B', () => {
    expect(priorityUp('(C) mid')).toBe('(B) mid');
  });

  it('Z → Y', () => {
    expect(priorityUp('(Z) lowest')).toBe('(Y) lowest');
  });

  it('completed line is unchanged', () => {
    const done = 'x 2026-07-24 finished';
    expect(priorityUp(done)).toBe(done);
  });

  it('full cycle down then up: A→B→A', () => {
    const start = '(A) task';
    const down = priorityDown(start); // (B) task
    const back = priorityUp(down);    // (A) task
    expect(back).toBe(start);
  });
});

// ---------------------------------------------------------------------------
// toggleDone(line)
// ---------------------------------------------------------------------------

describe('toggleDone()', () => {
  it('active line with priority → done with pri:A tag', () => {
    const result = toggleDone('(A) buy milk');
    expect(result).toMatch(/^x \d{4}-\d{2}-\d{2} buy milk pri:A$/);
  });

  it('active line without priority → done without pri tag', () => {
    const result = toggleDone('buy milk');
    expect(result).toMatch(/^x \d{4}-\d{2}-\d{2} buy milk$/);
    expect(result).not.toContain('pri:');
  });

  it('done line → restored to active (strips x + date)', () => {
    const td = today();
    const done = `x ${td} buy milk`;
    const restored = toggleDone(done);
    expect(restored).toBe('buy milk');
    expect(restored).not.toMatch(/^x /);
  });

  it('round-trip: priority line → done → undone restores priority', () => {
    const original = '(A) important task';
    const done = toggleDone(original);
    expect(done).toMatch(/^x \d{4}-\d{2}-\d{2} important task pri:A$/);
    const undone = toggleDone(done);
    expect(undone).toBe('(A) important task');
  });

  it('round-trip: no-priority line → done → undone', () => {
    const original = 'simple task';
    const done = toggleDone(original);
    const undone = toggleDone(done);
    expect(undone).toBe('simple task');
  });

  it('blank line is unchanged', () => {
    expect(toggleDone('')).toBe('');
    expect(toggleDone('   ')).toBe('   ');
  });

  it('round-trip with (B) priority', () => {
    const original = '(B) mid priority';
    const done = toggleDone(original);
    expect(done).toContain('pri:B');
    const undone = toggleDone(done);
    expect(undone).toBe('(B) mid priority');
  });

  // --- R2: rec: recurrence on the vim \x path -----------------------------

  it('appends the next instance for a live rec: task', () => {
    const td = today();
    const lines = toggleDone('pay rent rec:+1m due:2026-08-01').split('\n');
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe(`x ${td} pay rent rec:+1m due:2026-08-01`);
    expect(lines[1]).toBe(`${td} pay rent rec:+1m due:2026-09-01`);
  });

  it('keeps (A) on the generated instance and pri:A on the completed line', () => {
    const td = today();
    const lines = toggleDone('(A) standup rec:1b').split('\n');
    expect(lines[0]).toBe(`x ${td} standup rec:1b pri:A`);
    expect(lines[1]).toBe(`(A) ${td} standup rec:1b`);
  });

  it('returns a single line for a task without rec:', () => {
    expect(toggleDone('buy milk')).not.toContain('\n');
  });

  it('never spawns anything when un-completing', () => {
    const td = today();
    const undone = toggleDone(`x ${td} pay rent rec:1m`);
    expect(undone).toBe('pay rent rec:1m');
    expect(undone).not.toContain('\n');
  });

  it('does not spawn for a malformed rec: pattern', () => {
    expect(toggleDone('pay rent rec:monthly')).not.toContain('\n');
  });
});

// ---------------------------------------------------------------------------
// insertDate(line)
// ---------------------------------------------------------------------------

describe('insertDate()', () => {
  it('inserts date at start for a no-priority line', () => {
    const result = insertDate('buy milk');
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} buy milk$/);
  });

  it('inserts date after priority', () => {
    const result = insertDate('(A) buy milk');
    expect(result).toMatch(/^\(A\) \d{4}-\d{2}-\d{2} buy milk$/);
  });

  it('no-op if creation date already present (no priority)', () => {
    const line = '2026-01-15 buy milk';
    expect(insertDate(line)).toBe(line);
  });

  it('no-op if creation date already present (with priority)', () => {
    const line = '(B) 2026-01-15 buy milk';
    expect(insertDate(line)).toBe(line);
  });

  it('double-stamp behavior: already has date → no change', () => {
    // First stamp
    const first = insertDate('task');
    // Second stamp — should be no-op since date is now in canonical position
    const second = insertDate(first);
    expect(second).toBe(first);
  });

  it('completed line is unchanged', () => {
    const done = 'x 2026-07-24 done task';
    expect(insertDate(done)).toBe(done);
  });
});

// ---------------------------------------------------------------------------
// archiveLine(line)
// ---------------------------------------------------------------------------

describe('archiveLine()', () => {
  it('active line → marks done + appends archived:1', () => {
    const result = archiveLine('(A) buy milk');
    expect(result).toMatch(/^x \d{4}-\d{2}-\d{2} buy milk pri:A archived:1$/);
  });

  it('already completed line → just appends archived:1', () => {
    const done = 'x 2026-07-20 old task';
    const result = archiveLine(done);
    expect(result).toBe('x 2026-07-20 old task archived:1');
  });

  it('already archived → no duplicate tag', () => {
    const archived = 'x 2026-07-20 task archived:1';
    expect(archiveLine(archived)).toBe(archived);
  });

  it('blank line is unchanged', () => {
    expect(archiveLine('')).toBe('');
    expect(archiveLine('   ')).toBe('   ');
  });

  it('no-priority active line → done + archived:1', () => {
    const result = archiveLine('simple task');
    expect(result).toMatch(/^x \d{4}-\d{2}-\d{2} simple task archived:1$/);
    expect(result).not.toContain('pri:');
  });
});

// ---------------------------------------------------------------------------
// sortLines(text)
// ---------------------------------------------------------------------------

describe('sortLines()', () => {
  it('priorities sort ascending (A before B before C)', () => {
    const input = '(C) third\n(A) first\n(B) second';
    const result = sortLines(input);
    const lines = result.split('\n');
    expect(lines[0]).toBe('(A) first');
    expect(lines[1]).toBe('(B) second');
    expect(lines[2]).toBe('(C) third');
  });

  it('completed lines sink to bottom', () => {
    const input = 'x 2026-01-01 done\n(A) active\nno priority';
    const result = sortLines(input);
    const lines = result.split('\n');
    expect(lines[lines.length - 1]).toBe('x 2026-01-01 done');
    expect(lines[0]).toBe('(A) active');
  });

  it('no-priority lines sort after prioritized lines', () => {
    const input = 'zzz no priority\n(Z) lowest priority';
    const result = sortLines(input);
    const lines = result.split('\n');
    expect(lines[0]).toBe('(Z) lowest priority');
    expect(lines[1]).toBe('zzz no priority');
  });

  it('stable within same priority group (alphabetical)', () => {
    const input = '(A) banana\n(A) apple\n(A) cherry';
    const result = sortLines(input);
    const lines = result.split('\n');
    expect(lines[0]).toBe('(A) apple');
    expect(lines[1]).toBe('(A) banana');
    expect(lines[2]).toBe('(A) cherry');
  });

  it('single line returns itself', () => {
    expect(sortLines('only one')).toBe('only one');
  });

  it('empty string returns empty', () => {
    expect(sortLines('')).toBe('');
  });

  it('multiple completed lines sort alphabetically among themselves', () => {
    const input = 'x 2026-07-01 zebra\nx 2026-07-01 apple';
    const result = sortLines(input);
    const lines = result.split('\n');
    expect(lines[0]).toBe('x 2026-07-01 apple');
    expect(lines[1]).toBe('x 2026-07-01 zebra');
  });
});

// ---------------------------------------------------------------------------
// registerTodotxtVimBindings(Vim)
// ---------------------------------------------------------------------------

describe('registerTodotxtVimBindings()', () => {
  function createMockVim() {
    const actions: Record<string, Function> = {};
    const mappings: Array<{
      keys: string;
      type: string;
      name: string;
      args: any;
      extra: any;
    }> = [];

    const Vim = {
      defineAction: vi.fn((name: string, fn: Function) => {
        actions[name] = fn;
      }),
      mapCommand: vi.fn((keys: string, type: string, name: string, args: any, extra: any) => {
        mappings.push({ keys, type, name, args, extra });
      }),
      // Expose for assertions
      _actions: actions,
      _mappings: mappings,
    };
    return Vim;
  }

  it('registers exactly 9 actions via defineAction', () => {
    const Vim = createMockVim();
    registerTodotxtVimBindings(Vim);
    expect(Vim.defineAction).toHaveBeenCalledTimes(9);
  });

  it('registers exactly 9 mapCommand calls', () => {
    const Vim = createMockVim();
    registerTodotxtVimBindings(Vim);
    expect(Vim.mapCommand).toHaveBeenCalledTimes(9);
  });

  it('all mappings use backslash leader', () => {
    const Vim = createMockVim();
    registerTodotxtVimBindings(Vim);
    for (const m of Vim._mappings) {
      expect(m.keys).toMatch(/^\\/);
    }
  });

  it('all mappings are in normal context', () => {
    const Vim = createMockVim();
    registerTodotxtVimBindings(Vim);
    for (const m of Vim._mappings) {
      expect(m.extra).toEqual({ context: 'normal' });
    }
  });

  it('registers \\x for toggle done', () => {
    const Vim = createMockVim();
    registerTodotxtVimBindings(Vim);
    const m = Vim._mappings.find((x) => x.keys === '\\x');
    expect(m).toBeDefined();
    expect(m!.name).toBe('todotxt-toggle-done');
    expect(m!.type).toBe('action');
  });

  it('registers \\j for priority down', () => {
    const Vim = createMockVim();
    registerTodotxtVimBindings(Vim);
    const m = Vim._mappings.find((x) => x.keys === '\\j');
    expect(m).toBeDefined();
    expect(m!.name).toBe('todotxt-priority-down');
  });

  it('registers \\k for priority up', () => {
    const Vim = createMockVim();
    registerTodotxtVimBindings(Vim);
    const m = Vim._mappings.find((x) => x.keys === '\\k');
    expect(m).toBeDefined();
    expect(m!.name).toBe('todotxt-priority-up');
  });

  it('registers \\a, \\b, \\c for set priority A/B/C', () => {
    const Vim = createMockVim();
    registerTodotxtVimBindings(Vim);
    expect(Vim._mappings.find((x) => x.keys === '\\a')?.name).toBe('todotxt-set-pri-a');
    expect(Vim._mappings.find((x) => x.keys === '\\b')?.name).toBe('todotxt-set-pri-b');
    expect(Vim._mappings.find((x) => x.keys === '\\c')?.name).toBe('todotxt-set-pri-c');
  });

  it('registers \\d for insert date', () => {
    const Vim = createMockVim();
    registerTodotxtVimBindings(Vim);
    const m = Vim._mappings.find((x) => x.keys === '\\d');
    expect(m).toBeDefined();
    expect(m!.name).toBe('todotxt-insert-date');
  });

  it('registers \\D for archive', () => {
    const Vim = createMockVim();
    registerTodotxtVimBindings(Vim);
    const m = Vim._mappings.find((x) => x.keys === '\\D');
    expect(m).toBeDefined();
    expect(m!.name).toBe('todotxt-archive');
  });

  it('registers \\s for sort', () => {
    const Vim = createMockVim();
    registerTodotxtVimBindings(Vim);
    const m = Vim._mappings.find((x) => x.keys === '\\s');
    expect(m).toBeDefined();
    expect(m!.name).toBe('todotxt-sort');
  });

  it('toggle-done action calls toggleDone on the current line', () => {
    const Vim = createMockVim();
    registerTodotxtVimBindings(Vim);

    // Simulate a CodeMirror view with a single-line doc
    const lineText = '(A) buy milk';
    const mockView = {
      state: {
        doc: {
          lineAt: (_pos: number) => ({
            text: lineText,
            from: 0,
            to: lineText.length,
          }),
        },
        selection: { main: { head: 0 } },
      },
      dispatch: vi.fn(),
    };

    // Invoke the action
    const actionFn = Vim._actions['todotxt-toggle-done'];
    actionFn({ cm6: mockView });

    // Verify dispatch was called with the transformation
    expect(mockView.dispatch).toHaveBeenCalledTimes(1);
    const changes = mockView.dispatch.mock.calls[0][0].changes;
    expect(changes.from).toBe(0);
    expect(changes.to).toBe(lineText.length);
    expect(changes.insert).toMatch(/^x \d{4}-\d{2}-\d{2} buy milk pri:A$/);
  });

  it('priority-down action calls priorityDown on the current line', () => {
    const Vim = createMockVim();
    registerTodotxtVimBindings(Vim);

    const lineText = '(A) task';
    const mockView = {
      state: {
        doc: {
          lineAt: (_pos: number) => ({
            text: lineText,
            from: 0,
            to: lineText.length,
          }),
        },
        selection: { main: { head: 0 } },
      },
      dispatch: vi.fn(),
    };

    Vim._actions['todotxt-priority-down']({ cm6: mockView });
    expect(mockView.dispatch).toHaveBeenCalledTimes(1);
    expect(mockView.dispatch.mock.calls[0][0].changes.insert).toBe('(B) task');
  });

  it('sort action transforms entire document', () => {
    const Vim = createMockVim();
    registerTodotxtVimBindings(Vim);

    const docText = '(B) second\n(A) first';
    const mockView = {
      state: {
        doc: {
          toString: () => docText,
        },
        selection: { main: { head: 0 } },
      },
      dispatch: vi.fn(),
    };

    Vim._actions['todotxt-sort']({ cm6: mockView });
    expect(mockView.dispatch).toHaveBeenCalledTimes(1);
    const changes = mockView.dispatch.mock.calls[0][0].changes;
    expect(changes.from).toBe(0);
    expect(changes.to).toBe(docText.length);
    expect(changes.insert).toBe('(A) first\n(B) second');
  });

  it('action is no-op when line does not change (e.g. priorityUp on A)', () => {
    const Vim = createMockVim();
    registerTodotxtVimBindings(Vim);

    const lineText = '(A) already top';
    const mockView = {
      state: {
        doc: {
          lineAt: (_pos: number) => ({
            text: lineText,
            from: 0,
            to: lineText.length,
          }),
        },
        selection: { main: { head: 0 } },
      },
      dispatch: vi.fn(),
    };

    Vim._actions['todotxt-priority-up']({ cm6: mockView });
    // priorityUp('(A) already top') === '(A) already top' → no dispatch
    expect(mockView.dispatch).not.toHaveBeenCalled();
  });

  it('action handles missing view state gracefully', () => {
    const Vim = createMockVim();
    registerTodotxtVimBindings(Vim);

    // No .state on the view — should not throw
    expect(() => {
      Vim._actions['todotxt-toggle-done']({ cm6: {} });
    }).not.toThrow();

    expect(() => {
      Vim._actions['todotxt-toggle-done']({});
    }).not.toThrow();
  });
});
