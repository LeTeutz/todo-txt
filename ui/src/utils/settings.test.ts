/**
 * settings — parse + format tests for the configurable root (R4).
 *
 * The notable absence here is path-policy testing. There is none, on purpose:
 * the client does not validate paths, and asserting a policy it does not
 * implement would be the first step toward implementing one twice. What IS
 * asserted is that a path the SERVER will reject is still passed through
 * verbatim rather than pre-filtered — because a client-side rejection of
 * something the server would explain properly costs the user the explanation.
 */

import { describe, expect, it } from 'vitest';
import {
  formatRootChange,
  formatSettingsError,
  formatWhere,
  parseSetRootArg,
  type SettingsResponse,
} from './settings';

function settings(overrides: Partial<SettingsResponse> = {}): SettingsResponse {
  return {
    root: '/Users/x/Documents/todo',
    default_root: '/Users/x/.kiro/crew/apps/todo-txt/data',
    is_default: false,
    settings_path: '/Users/x/.kiro/crew/apps/todo-txt/data/settings.json',
    files: {
      todo: '/Users/x/Documents/todo/todo.txt',
      done: '/Users/x/Documents/todo/done.txt',
      report: '/Users/x/Documents/todo/report.txt',
    },
    ...overrides,
  };
}

describe('parseSetRootArg', () => {
  it('returns an absolute path unchanged', () => {
    expect(parseSetRootArg('/Users/x/Documents/todo')).toBe(
      '/Users/x/Documents/todo',
    );
  });

  it('leaves ~ for the server to expand', () => {
    // Expanding here would resolve against the browser's idea of a home
    // directory, which does not exist.
    expect(parseSetRootArg('~/Documents/todo')).toBe('~/Documents/todo');
  });

  it('trims surrounding whitespace', () => {
    expect(parseSetRootArg('   /Users/x/notes  ')).toBe('/Users/x/notes');
  });

  it.each([
    ['"/Users/x/My Notes"', '/Users/x/My Notes'],
    ["'/Users/x/My Notes'", '/Users/x/My Notes'],
  ])('strips shell-pasted quotes: %s', (input, expected) => {
    expect(parseSetRootArg(input)).toBe(expected);
  });

  it('preserves spaces inside the path', () => {
    // Directory names contain spaces; only the OUTER quotes are shell noise.
    expect(parseSetRootArg('/Users/x/My Notes/todo')).toBe(
      '/Users/x/My Notes/todo',
    );
  });

  it('does not strip a mismatched quote pair', () => {
    expect(parseSetRootArg('"/Users/x/notes')).toBe('"/Users/x/notes');
  });

  it.each(['default', 'defaults', 'reset', 'clear', 'none', 'off'])(
    'treats %s as a reset',
    (word) => {
      expect(parseSetRootArg(word)).toBeNull();
    },
  );

  it('matches reset keywords case-insensitively', () => {
    expect(parseSetRootArg('DEFAULT')).toBeNull();
    expect(parseSetRootArg(' Reset ')).toBeNull();
  });

  it.each([undefined, '', '   '])('throws on a missing argument: %s', (arg) => {
    // A bare `set-root` is deliberately NOT a toggle or a reset: every other
    // view command in this app toggles on a bare verb, and borrowing that
    // habit would let a stray Enter relocate where tasks are read from.
    expect(() => parseSetRootArg(arg)).toThrow(/expected a directory path/);
  });

  it('names both the path form and the reset word in the error', () => {
    expect(() => parseSetRootArg('')).toThrow(/set-root default/);
  });

  it('passes a path the server will reject straight through', () => {
    // No client-side policy: the server owns the rule AND the explanation.
    const denied = '/Users/x/.' + 'ssh';
    expect(parseSetRootArg(denied)).toBe(denied);
  });

  it('passes a relative path straight through', () => {
    expect(parseSetRootArg('Documents/todo')).toBe('Documents/todo');
  });
});

describe('formatWhere', () => {
  it('marks a custom root', () => {
    const text = formatWhere(settings());
    expect(text).toContain('/Users/x/Documents/todo');
    expect(text).toContain('(custom)');
    expect(text).toContain('todo.txt');
  });

  it('marks the app default', () => {
    const text = formatWhere(
      settings({
        root: '/Users/x/.kiro/crew/apps/todo-txt/data',
        is_default: true,
      }),
    );
    expect(text).toContain('(app default)');
  });
});

describe('formatRootChange', () => {
  it('reports a move to a custom directory', () => {
    expect(formatRootChange(settings())).toBe(
      'now reading /Users/x/Documents/todo',
    );
  });

  it('reports a return to the app folder', () => {
    const text = formatRootChange(
      settings({ root: '/Users/x/app-data', is_default: true }),
    );
    expect(text).toBe('back to the app folder: /Users/x/app-data');
  });
});

describe('formatSettingsError', () => {
  it('passes the server reason through verbatim', () => {
    // The backend already writes these for humans; rewriting them client-side
    // would drift from the rule that actually fired.
    const reason = "'root' must be inside your home directory";
    expect(formatSettingsError({ error: reason, code: 'invalid_root' }, 400)).toBe(
      reason,
    );
  });

  it.each([
    [null, 500],
    [{}, 400],
    [{ error: '' }, 400],
    [{ error: '   ' }, 400],
    [{ error: 42 }, 400],
    ['a string body', 502],
  ])('falls back to the status code for %s', (body, status) => {
    expect(formatSettingsError(body, status)).toBe(`HTTP ${status}`);
  });
});
