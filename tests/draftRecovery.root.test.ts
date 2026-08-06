/**
 * Recovery drafts are scoped to the data root they were written under.
 *
 * A recovery draft holds the user's unsaved keystrokes between the editor and
 * the disk. It is stored under a key derived from the FILE alone
 * (`todo-txt.recovery.v1.todo`), so without an explicit root check a draft
 * written while the app pointed at root A would be offered as "unsaved work"
 * after `set-root` moved the app to root B.
 *
 * Accepting it there is silent data loss. The recovery path calls
 * scheduleSave, which carries root B's mtime as the conflict token — so the
 * write MATCHES and succeeds, and root B's real todo.txt (the user's synced or
 * version-controlled file, which is the entire point of a configurable root)
 * is overwritten with unrelated content from a different directory. No
 * conflict, no warning.
 *
 * Three rules follow, one per suite below:
 *   - a draft is only ever offered under the root it was written for;
 *   - a draft with no recorded root is recoverable on the DEFAULT root and
 *     refused on a custom one, which is the safe half of that choice;
 *   - clearing a draft never clears another root's draft.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  clearRecoveryDraft,
  readRecoveryDraft,
  writeRecoveryDraft,
  type RecoveryDraft,
} from '../ui/src/utils/draftRecovery';

const DEFAULT_ROOT = '/Users/me/.kiro/crew/apps/todo-txt/data';
const SYNCED_ROOT = '/Users/me/Dropbox/notes';

const STORAGE_KEY = 'todo-txt.recovery.v1.todo';

function draft(overrides: Partial<RecoveryDraft> = {}): RecoveryDraft {
  return {
    version: 1,
    file: 'todo',
    content: 'unsaved work from the app data root\n',
    baseMtime: 1000,
    updatedAt: 5000,
    root: DEFAULT_ROOT,
    ...overrides,
  };
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
});

describe('recovery drafts are scoped to the data root', () => {
  it('does NOT offer a draft written under a different root', async () => {
    await writeRecoveryDraft(draft({ root: DEFAULT_ROOT }));

    const offered = await readRecoveryDraft('todo', {
      root: SYNCED_ROOT,
      isDefault: false,
    });

    expect(offered).toBeNull();
  });

  it('offers a draft written under the SAME root', async () => {
    const d = draft({ root: SYNCED_ROOT });
    await writeRecoveryDraft(d);

    const offered = await readRecoveryDraft('todo', {
      root: SYNCED_ROOT,
      isDefault: false,
    });

    expect(offered).not.toBeNull();
    expect(offered?.content).toBe(d.content);
  });

  it('records the root it was written under', async () => {
    await writeRecoveryDraft(draft({ root: SYNCED_ROOT }));
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!);
    expect(stored.root).toBe(SYNCED_ROOT);
  });

  it('still returns the draft when no scope is supplied (legacy callers)', async () => {
    const d = draft();
    await writeRecoveryDraft(d);
    // The unscoped overload must keep working: root scoping is additive, not
    // a breaking change for callers that supply no scope.
    await expect(readRecoveryDraft('todo')).resolves.toEqual(d);
  });
});

describe('a draft with no recorded root', () => {
  it('offers a rootless legacy draft on the DEFAULT root', async () => {
    // A draft stored without a `root` field, as an earlier shape did.
    const legacy = { ...draft() } as Record<string, unknown>;
    delete legacy.root;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));

    const offered = await readRecoveryDraft('todo', {
      root: DEFAULT_ROOT,
      isDefault: true,
    });

    expect(offered).not.toBeNull();
    expect(offered?.content).toBe('unsaved work from the app data root\n');
  });

  it('refuses a rootless legacy draft on a CUSTOM root', async () => {
    const legacy = { ...draft() } as Record<string, unknown>;
    delete legacy.root;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));

    const offered = await readRecoveryDraft('todo', {
      root: SYNCED_ROOT,
      isDefault: false,
    });

    // A rootless draft cannot be proven to belong here, and the cost of
    // guessing wrong is overwriting the user's synced file.
    expect(offered).toBeNull();
  });
});

describe('clearing a recovery draft is root-aware', () => {
  it('leaves another root\u2019s draft in place', async () => {
    await writeRecoveryDraft(draft({ root: SYNCED_ROOT }));

    await clearRecoveryDraft('todo', {
      root: DEFAULT_ROOT,
      isDefault: true,
    });

    const survivor = await readRecoveryDraft('todo', {
      root: SYNCED_ROOT,
      isDefault: false,
    });
    expect(survivor).not.toBeNull();
  });

  it('clears the draft for the matching root', async () => {
    await writeRecoveryDraft(draft({ root: SYNCED_ROOT }));

    await clearRecoveryDraft('todo', {
      root: SYNCED_ROOT,
      isDefault: false,
    });

    await expect(
      readRecoveryDraft('todo', { root: SYNCED_ROOT, isDefault: false }),
    ).resolves.toBeNull();
  });

  it('still clears unconditionally when no scope is supplied', async () => {
    await writeRecoveryDraft(draft());
    await clearRecoveryDraft('todo');
    await expect(readRecoveryDraft('todo')).resolves.toBeNull();
  });
});
