/**
 * Unit tests for the deterministic command implementations.
 *
 * Covers nine commands -- add, append, del, depri, do, prepend, pri, replace,
 * sort -- with at least one test per command plus a round-trip property test
 * for reversible pairs (pri/depri).
 *
 * 18 unit tests + 1 property test = 19 total.
 */
import { describe, expect, it } from 'vitest';

import {
  COMMANDS,
  formatCommandErrorToast,
  type ApplyResult,
  type Command,
} from '../ui/src/utils/commands';

// Convenience: fetch a command by canonical name, or fail the test.
function cmd(name: string): Command {
  const c = COMMANDS.find((x) => x.name === name);
  if (!c) throw new Error(`test setup error: command "${name}" not found`);
  return c;
}

// Narrow an ApplyResult to the mutation variant for easier assertions.
function asMutation(r: ApplyResult): { type: 'mutation'; content: string } {
  if (r.type !== 'mutation') throw new Error(`expected mutation, got ${r.type}`);
  return r;
}

// Narrow an ApplyResult to the server-action variant.
function asServerAction(r: ApplyResult): {
  type: 'server-action';
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
} {
  if (r.type !== 'server-action') {
    throw new Error(`expected server-action, got ${r.type}`);
  }
  return r;
}

// Narrow to the filter variant.
function asFilter(r: ApplyResult): {
  type: 'filter';
  lines: Array<{ index: number; text: string }>;
  title: string;
} {
  if (r.type !== 'filter') throw new Error(`expected filter, got ${r.type}`);
  return r;
}

// Narrow to the aggregate variant.
function asAggregate(r: ApplyResult): {
  type: 'aggregate';
  groups: Array<{ key: string; count: number }>;
  title: string;
} {
  if (r.type !== 'aggregate') throw new Error(`expected aggregate, got ${r.type}`);
  return r;
}

// ---------------------------------------------------------------------------
// add
// ---------------------------------------------------------------------------

describe('add', () => {
  it('appends a new task, preserving trailing newline', () => {
    const out = asMutation(
      cmd('add').apply('(A) Buy milk\nCall mum\n', ['Pay rent'], 'todo')
    );
    expect(out.content).toBe('(A) Buy milk\nCall mum\nPay rent\n');
  });

  it('preserves absence of trailing newline', () => {
    const out = asMutation(cmd('add').apply('Buy milk', ['Pay rent'], 'todo'));
    expect(out.content).toBe('Buy milk\nPay rent');
  });
});

// ---------------------------------------------------------------------------
// append
// ---------------------------------------------------------------------------

describe('append', () => {
  it('appends text to the specified 1-indexed line', () => {
    const out = asMutation(
      cmd('append').apply('Buy milk\nCall mum\n', ['1', '@store'], 'todo')
    );
    expect(out.content).toBe('Buy milk @store\nCall mum\n');
  });

  it('throws on out-of-range item#', () => {
    expect(() => cmd('append').apply('Buy milk\n', ['5', 'foo'], 'todo')).toThrow(
      /out of range/
    );
  });
});

// ---------------------------------------------------------------------------
// prepend
// ---------------------------------------------------------------------------

describe('prepend', () => {
  it('prepends text at the start of a line without priority', () => {
    const out = asMutation(
      cmd('prepend').apply('Buy milk\n', ['1', 'Urgent:'], 'todo')
    );
    expect(out.content).toBe('Urgent: Buy milk\n');
  });

  it('prepends AFTER a priority prefix, preserving priority at column 0', () => {
    const out = asMutation(
      cmd('prepend').apply('(A) 2026-01-01 Buy milk\n', ['1', 'URGENT'], 'todo')
    );
    expect(out.content).toBe('(A) URGENT 2026-01-01 Buy milk\n');
  });
});

// ---------------------------------------------------------------------------
// del
// ---------------------------------------------------------------------------

describe('del', () => {
  it('removes the entire line when no term given, preserving blank lines', () => {
    const out = asMutation(
      cmd('del').apply('Buy milk\n\nCall mum\n', ['1'], 'todo')
    );
    expect(out.content).toBe('\nCall mum\n');
  });

  it('removes only the matching term when term given', () => {
    const out = asMutation(
      cmd('del').apply('Buy milk @store +shopping\n', ['1', '@store'], 'todo')
    );
    expect(out.content).toBe('Buy milk +shopping\n');
  });
});

// ---------------------------------------------------------------------------
// replace
// ---------------------------------------------------------------------------

describe('replace', () => {
  it('replaces the text of the specified line', () => {
    const out = asMutation(
      cmd('replace').apply('Buy milk\nCall mum\n', ['2', 'Call dad'], 'todo')
    );
    expect(out.content).toBe('Buy milk\nCall dad\n');
  });
});

// ---------------------------------------------------------------------------
// do
// ---------------------------------------------------------------------------

describe('do', () => {
  it('marks an item done with an x YYYY-MM-DD prefix', () => {
    const out = asMutation(cmd('do').apply('Buy milk\nCall mum\n', ['2'], 'todo'));
    expect(out.content).toMatch(/^Buy milk\nx \d{4}-\d{2}-\d{2} Call mum\n$/);
  });

  it('strips the priority prefix when marking done and preserves as pri:X tag', () => {
    const out = asMutation(cmd('do').apply('(A) Buy milk\n', ['1'], 'todo'));
    expect(out.content).toMatch(/^x \d{4}-\d{2}-\d{2} Buy milk pri:A\n$/);
    // No parenthesized priority remains at the start.
    expect(out.content).not.toMatch(/^\(/);
  });
});

// ---------------------------------------------------------------------------
// pri
// ---------------------------------------------------------------------------

describe('pri', () => {
  it('adds a priority prefix to an unprioritised item', () => {
    const out = asMutation(cmd('pri').apply('Buy milk\n', ['1', 'A'], 'todo'));
    expect(out.content).toBe('(A) Buy milk\n');
  });

  it('replaces an existing priority prefix', () => {
    const out = asMutation(
      cmd('pri').apply('(C) Buy milk\nCall mum\n', ['1', 'B'], 'todo')
    );
    expect(out.content).toBe('(B) Buy milk\nCall mum\n');
  });
});

// ---------------------------------------------------------------------------
// depri
// ---------------------------------------------------------------------------

describe('depri', () => {
  it('removes the priority prefix when present', () => {
    const out = asMutation(
      cmd('depri').apply('(A) Buy milk\nCall mum\n', ['1'], 'todo')
    );
    expect(out.content).toBe('Buy milk\nCall mum\n');
  });

  it('is a no-op when the line has no priority', () => {
    const out = asMutation(
      cmd('depri').apply('Buy milk\nCall mum\n', ['1'], 'todo')
    );
    expect(out.content).toBe('Buy milk\nCall mum\n');
  });
});

// ---------------------------------------------------------------------------
// sort
// ---------------------------------------------------------------------------

describe('sort', () => {
  it('defaults to priority mode; unpriorised lines sort to the end', () => {
    const input = 'Call mum\n(B) Pay rent\n(A) Buy milk\n';
    const out = asMutation(cmd('sort').apply(input, [], 'todo'));
    expect(out.content).toBe('(A) Buy milk\n(B) Pay rent\nCall mum\n');
  });

  it('sorts by project when given "project" mode', () => {
    const input = 'Task X +zebra\nTask Y +apple\nTask Z no-project\n';
    const out = asMutation(cmd('sort').apply(input, ['project'], 'todo'));
    expect(out.content).toBe('Task Y +apple\nTask X +zebra\nTask Z no-project\n');
  });

  it('is stable across ties and preserves trailing-newline and blank lines', () => {
    const input = '(A) first\n\n(A) second\n(A) third\n';
    const out = asMutation(cmd('sort').apply(input, ['priority'], 'todo'));
    // All three (A) lines retain relative order; blank line (no priority)
    // sorts after to the end.
    expect(out.content).toBe('(A) first\n(A) second\n(A) third\n\n');
  });
});

// ---------------------------------------------------------------------------
// Round-trip property test (reversible commands): pri then depri is identity.
// ---------------------------------------------------------------------------

describe('round-trip: pri + depri', () => {
  it('pri N X followed by depri N returns the original content', () => {
    const original = 'Buy milk\nCall mum\nPay rent\n';
    const priCmd = cmd('pri');
    const depriCmd = cmd('depri');

    // Exercise every line with every priority letter in the alphabet.
    const { lines } = (function splitLines(c: string) {
      const body = c.endsWith('\n') ? c.slice(0, -1) : c;
      return { lines: body.split('\n') };
    })(original);
    const letters = ['A', 'Z', 'M']; // sampling is enough for the property.

    for (let item = 1; item <= lines.length; item++) {
      for (const letter of letters) {
        const after = asMutation(priCmd.apply(original, [String(item), letter], 'todo'));
        const back = asMutation(depriCmd.apply(after.content, [String(item)], 'todo'));
        expect(back.content).toBe(original);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// File-crossing commands: archive, move, report.
//
// These verbs return `server-action` descriptors (no pure in-file mutation).
// Tests verify descriptor shape: endpoint, method, body.
// ---------------------------------------------------------------------------

describe('archive (file-crossing)', () => {
  it('returns a POST server-action targeting /apps/todo-txt/api/archive with empty body', () => {
    const r = asServerAction(
      cmd('archive').apply('x 2026-01-01 Buy milk\nCall mum\n', [], 'todo')
    );
    expect(r.endpoint).toBe('/apps/todo-txt/api/archive');
    expect(r.method).toBe('POST');
    expect(r.body).toEqual({});
  });
});

describe('move (file-crossing)', () => {
  it('returns a POST server-action with item/from/to in the body, derived from active file', () => {
    const r = asServerAction(
      cmd('move').apply('Call mum\nBuy milk\n', ['2', 'done'], 'todo')
    );
    expect(r.endpoint).toBe('/apps/todo-txt/api/move');
    expect(r.method).toBe('POST');
    expect(r.body).toEqual({ item: 2, from: 'todo', to: 'done' });
  });

  it('rejects invalid destinations and same-file moves', () => {
    expect(() =>
      cmd('move').apply('Call mum\n', ['1', 'report'], 'todo')
    ).toThrow(/dest must be "todo" or "done"/);
    expect(() => cmd('move').apply('Call mum\n', ['1', 'todo'], 'todo')).toThrow(
      /source and destination are both/
    );
  });
});

describe('report (file-crossing)', () => {
  it('returns a POST server-action targeting /apps/todo-txt/api/report/snapshot with empty body', () => {
    const r = asServerAction(cmd('report').apply('Buy milk\nCall mum\n', [], 'todo'));
    expect(r.endpoint).toBe('/apps/todo-txt/api/report/snapshot');
    expect(r.method).toBe('POST');
    expect(r.body).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// Filter / list commands: list, listall, listcon, listproj, listpri.
//
// All five return non-mutating `filter` (per-line) or `aggregate` (counts)
// shapes. Tests verify shape, 1-indexed positions, and blank-line skipping.
// ---------------------------------------------------------------------------

describe('list (filter)', () => {
  it('returns every non-blank line with 1-indexed positions when no term given', () => {
    const input = 'Buy milk\n\nCall mum\n(A) Pay rent\n';
    const r = asFilter(cmd('list').apply(input, [], 'todo'));
    expect(r.lines).toEqual([
      { index: 1, text: 'Buy milk' },
      { index: 3, text: 'Call mum' },
      { index: 4, text: '(A) Pay rent' },
    ]);
    expect(r.title).toBe('All active items');
  });

  it('filters by term, keeping original line numbers', () => {
    const input = 'Buy milk @store\nCall mum\nBuy bread @store\n';
    const r = asFilter(cmd('list').apply(input, ['@store'], 'todo'));
    expect(r.lines).toEqual([
      { index: 1, text: 'Buy milk @store' },
      { index: 3, text: 'Buy bread @store' },
    ]);
    expect(r.title).toBe('Items matching "@store"');
  });
});

describe('listcon (aggregate and filter)', () => {
  it('aggregates distinct @contexts with counts when no arg given', () => {
    const input = 'Buy milk @store\nCall mum @phone\nBuy bread @store\n';
    const r = asAggregate(cmd('listcon').apply(input, [], 'todo'));
    expect(r.groups).toEqual([
      { key: '@phone', count: 1 },
      { key: '@store', count: 2 },
    ]);
    expect(r.title).toBe('All @contexts');
  });

  it('filters items by a specific @context (accepts raw name or @prefixed)', () => {
    const input = 'Buy milk @store\nCall mum @phone\nBuy bread @store\n';
    const withAt = asFilter(cmd('listcon').apply(input, ['@store'], 'todo'));
    const noAt = asFilter(cmd('listcon').apply(input, ['store'], 'todo'));
    expect(withAt.lines).toEqual([
      { index: 1, text: 'Buy milk @store' },
      { index: 3, text: 'Buy bread @store' },
    ]);
    expect(noAt.lines).toEqual(withAt.lines);
    expect(withAt.title).toBe('Items with @store');
  });
});

describe('listproj (filter by specific +project)', () => {
  it('matches whole-word +project only, not substrings', () => {
    const input = 'Task X +work\nTask Y +workbench\nTask Z +home\n';
    const r = asFilter(cmd('listproj').apply(input, ['+work'], 'todo'));
    expect(r.lines).toEqual([{ index: 1, text: 'Task X +work' }]);
    expect(r.title).toBe('Items with +work');
  });
});

describe('listpri (priority filter)', () => {
  it('filters a single priority letter', () => {
    const input = '(A) Buy milk\n(B) Call mum\n(A) Pay rent\nChill\n';
    const r = asFilter(cmd('listpri').apply(input, ['A'], 'todo'));
    expect(r.lines).toEqual([
      { index: 1, text: '(A) Buy milk' },
      { index: 3, text: '(A) Pay rent' },
    ]);
    expect(r.title).toBe('Items with priority A');
  });

  it('filters by a priority range A-C and rejects reversed ranges', () => {
    const input = '(A) one\n(B) two\n(C) three\n(D) four\n';
    const r = asFilter(cmd('listpri').apply(input, ['A-C'], 'todo'));
    expect(r.lines.map((l) => l.index)).toEqual([1, 2, 3]);
    expect(r.title).toBe('Items with priority A..C');

    expect(() => cmd('listpri').apply(input, ['C-A'], 'todo')).toThrow(/reversed/);
  });
});

describe('listall (no term)', () => {
  it('returns every non-blank line across active + done', () => {
    const input = 'Active 1\nx 2026-01-01 Done 1\n\nActive 2\n';
    const r = asFilter(cmd('listall').apply(input, [], 'todo'));
    expect(r.lines).toEqual([
      { index: 1, text: 'Active 1' },
      { index: 2, text: 'x 2026-01-01 Done 1' },
      { index: 4, text: 'Active 2' },
    ]);
    expect(r.title).toBe('All items (active + done)');
  });
});

// ---------------------------------------------------------------------------
// listfile (switch-file)
//
// `listfile <name>` switches the active file tab to the named file and lets
// the dispatcher paint its contents (via the existing GET /api/file
// pipeline). applyListfile validates the argument and returns a
// `switch-file` descriptor; the dispatcher handles the side effect.
// ---------------------------------------------------------------------------

// Narrow an ApplyResult to the switch-file variant.
function asSwitchFile(r: ApplyResult): { type: 'switch-file'; target: 'todo' | 'done' | 'report' } {
  if (r.type !== 'switch-file') throw new Error(`expected switch-file, got ${r.type}`);
  return r;
}

describe('listfile (switch-file)', () => {
  it('returns a switch-file descriptor targeting the named file', () => {
    for (const name of ['todo', 'done', 'report'] as const) {
      const r = asSwitchFile(
        cmd('listfile').apply('ignored content\n', [name], 'todo'),
      );
      expect(r.target).toBe(name);
    }
  });

  it('accepts single-letter aliases t/d/r', () => {
    expect(asSwitchFile(cmd('listfile').apply('', ['t'], 'todo')).target).toBe('todo');
    expect(asSwitchFile(cmd('listfile').apply('', ['d'], 'todo')).target).toBe('done');
    expect(asSwitchFile(cmd('listfile').apply('', ['r'], 'todo')).target).toBe('report');
  });

  it('is case-insensitive and trims whitespace', () => {
    expect(asSwitchFile(cmd('listfile').apply('', ['  DONE '], 'todo')).target).toBe('done');
    expect(asSwitchFile(cmd('listfile').apply('', ['Report'], 'todo')).target).toBe('report');
  });

  it('throws a descriptive error for an unknown file name (no "listfile:" prefix — the palette wrapper adds it)', () => {
    expect(() => cmd('listfile').apply('', ['invoice'], 'todo')).toThrow(
      'unknown file "invoice" \u2014 valid: todo, done, report',
    );
    // And verify the raw message does NOT already start with "listfile:"
    // so the palette's `${cmd.name}: ${message}` wrapper produces a
    // single-prefix toast (regression guard).
    try {
      cmd('listfile').apply('', ['invoice'], 'todo');
      throw new Error('expected throw');
    } catch (err) {
      if (!(err instanceof Error)) throw err;
      expect(err.message.startsWith('listfile:')).toBe(false);
    }
  });

  it('throws for an empty argument instead of silently defaulting', () => {
    expect(() => cmd('listfile').apply('', [], 'todo')).toThrow(
      /unknown file "" .+ valid: todo, done, report/,
    );
    expect(() => cmd('listfile').apply('', [''], 'todo')).toThrow(
      /unknown file "" .+ valid: todo, done, report/,
    );
  });

  it('ignores the current file (active-file context) when computing the target', () => {
    // Called from the 'done' tab, listfile todo should still target todo.
    const r = asSwitchFile(cmd('listfile').apply('', ['todo'], 'done'));
    expect(r.target).toBe('todo');
  });
});

// ---------------------------------------------------------------------------
// formatCommandErrorToast -- systemic prefix dedup
//
// Every deterministic command in commands.ts throws with a `${name}: `
// prefix for CLI-parity reasons, and the palette dispatcher independently
// prepends the same prefix before toasting. Without dedup, every error
// toast would double-prefix: `pri: pri: priority must be A-Z`. The
// exported helper is the single point of dedup; this suite is the
// regression guard across the pattern, not just for any one command.
// ---------------------------------------------------------------------------

describe('formatCommandErrorToast (palette double-prefix dedup)', () => {
  it('adds the prefix when the raw message does not already have it', () => {
    // Matches the post-Task-F applyListfile style (raw message carries
    // no prefix; dispatcher adds it).
    expect(formatCommandErrorToast('listfile', 'unknown file "x"')).toBe(
      'listfile: unknown file "x"',
    );
  });

  it('does NOT double-prefix when the message already starts with "${cmdName}: "', () => {
    // Real example: applyPri throws 'pri: priority must be A-Z, got "1"'.
    // The dispatcher would otherwise produce 'pri: pri: priority ...'.
    let thrown: Error | null = null;
    try {
      cmd('pri').apply('Buy milk\n', ['1', '1'], 'todo');
    } catch (err) {
      if (err instanceof Error) thrown = err;
    }
    expect(thrown).not.toBeNull();
    // Sanity: the raw throw does still carry the 'pri: ' prefix.
    expect(thrown!.message.startsWith('pri: ')).toBe(true);
    // And the helper deduplicates it into a single-prefix toast.
    expect(formatCommandErrorToast('pri', thrown!.message)).toBe(thrown!.message);
  });

  it('only dedups when the EXACT "${cmdName}: " prefix matches (failure-mode guard)', () => {
    // If a command's raw message is prefixed with a DIFFERENT command's
    // name (not currently a pattern), the helper correctly leaves it
    // alone and prepends the active command's prefix. This is the
    // caveat flagged in the code comment -- the dedup is conservative
    // and name-specific on purpose.
    expect(formatCommandErrorToast('pri', 'add: text is required')).toBe(
      'pri: add: text is required',
    );
  });
});
