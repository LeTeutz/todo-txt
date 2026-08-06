/**
 * Playwright E2E scenarios for the todo-txt Command Palette (T18).
 *
 * These tests exercise the full palette pipeline end-to-end:
 *
 *   Browser ⌘K/Ctrl+K → CommandPalette → COMMANDS.apply() / dispatcher
 *     → textarea mutation (client-side commands)
 *     → debounced PUT /apps/todo-txt/api/file (persists to disk)
 *     → server-action endpoints for archive / move / report
 *
 * Scenarios (spec 5 cases):
 *   (1) open palette with ⌘K, type 'do', Enter runs on line 1, editor updates
 *   (2) archive moves x-lines from todo.txt to done.txt
 *   (3) pri 1 A sets (A) priority on the first line
 *   (4) sort priority reorders the visible lines by priority
 *   (5) help opens the right-rail help panel (post-UX_1b, was HelpPanel overlay)
 *
 * Isolation contract — identical pattern to `todo-txt.e2e.spec.ts`:
 *
 *   The test run MUST use a disposable `TODO_TXT_ROOT` pointing at a
 *   temp dir. The real file at `~/.kiro/crew/apps/todo-txt/data/todo.txt`
 *   must never be touched. The `test.beforeAll` hook hard-refuses to run
 *   if the root path looks like the real location.
 *
 * To run (from worktree root):
 *
 *   TODO_TXT_ROOT=$(mktemp -d) \
 *   PLAYWRIGHT_BASE_URL=http://127.0.0.1:5195 \
 *   npx playwright test tests/command-palette.e2e.spec.ts
 *
 * The accompanying `playwright.config.ts` (added with the rest of the
 * e2e suite at CR-prep time) is responsible for starting the Vite dev
 * server + signing API bridge against `TODO_TXT_ROOT` before tests run
 * and tearing them down afterwards.
 */

import { test, expect, type Page } from '@playwright/test';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';

import { editorLocator, expectEditorValue } from './e2e/codemirror';

// ---------------------------------------------------------------------------
// Isolation helpers (mirror the patterns in todo-txt.e2e.spec.ts)
// ---------------------------------------------------------------------------

/** Disposable root for this test run. */
const TODO_TXT_ROOT =
  process.env.TODO_TXT_ROOT ??
  path.join(
    process.env.RUNNER_TEMP ?? '/tmp',
    `todo-txt-palette-e2e-${process.pid}`,
  );
const TODO_TXT_PATH = path.join(TODO_TXT_ROOT, 'todo.txt');
const DONE_TXT_PATH = path.join(TODO_TXT_ROOT, 'done.txt');
const REPORT_TXT_PATH = path.join(TODO_TXT_ROOT, 'report.txt');
const BACKUP_DIR = path.join(TODO_TXT_ROOT, 'backup');

/**
 * Seed the isolated root with the given contents. `todo.txt` defaults
 * to the given seed; `done.txt` and `report.txt` default to empty.
 */
async function resetRoot(
  seed: { todo?: string; done?: string; report?: string } = {},
): Promise<void> {
  await fs.rm(TODO_TXT_ROOT, { recursive: true, force: true });
  await fs.mkdir(TODO_TXT_ROOT, { recursive: true });
  await fs.mkdir(BACKUP_DIR, { recursive: true });
  await fs.writeFile(TODO_TXT_PATH, seed.todo ?? '', 'utf8');
  await fs.writeFile(DONE_TXT_PATH, seed.done ?? '', 'utf8');
  await fs.writeFile(REPORT_TXT_PATH, seed.report ?? '', 'utf8');
}

/** Read a file under the test root; returns '' if missing. */
async function readFileSafe(p: string): Promise<string> {
  try {
    return await fs.readFile(p, 'utf8');
  } catch {
    return '';
  }
}

/** Poll a file until the predicate passes or we time out. */
async function waitForFile(
  p: string,
  predicate: (content: string) => boolean,
  timeoutMs = 5000,
): Promise<string> {
  const start = Date.now();
  let last = '';
  while (Date.now() - start < timeoutMs) {
    last = await readFileSafe(p);
    if (predicate(last)) return last;
    await new Promise((r) => setTimeout(r, 75));
  }
  throw new Error(
    `Timed out after ${timeoutMs}ms waiting on ${p}. Last content:\n${last}`,
  );
}

/**
 * Navigate to the todo-txt page and wait for initial content GET so
 * the textarea is mounted with the seeded content.
 */
async function openTodoTxt(page: Page): Promise<void> {
  const contentLoaded = page.waitForResponse(
    (r) =>
      r.url().includes('/apps/todo-txt/api/') &&
      r.request().method() === 'GET' &&
      r.ok(),
  );
  await page.goto('/');
  await contentLoaded;
  await expect(editorLocator(page)).toBeVisible();
}

/**
 * Open the palette via the global ⌘K/Ctrl+K shortcut. Uses Control
 * because the Linux test runner's metaKey is not wired by default;
 * the TodoTxtPage listener accepts either metaKey OR ctrlKey.
 */
async function openPalette(page: Page): Promise<void> {
  // The palette shortcut is scoped to in-app focus (5cee52c) so it cannot
  // shadow the dashboard's global launcher — a press with focus on <body>
  // is deliberately ignored. Focus the editor first, as a user would.
  await editorLocator(page).focus();
  await page.keyboard.press('Control+K');
  await expect(page.locator('[data-testid="command-palette"]')).toBeVisible();
  await expect(
    page.locator('[data-testid="command-palette-search"]'),
  ).toBeFocused();
}

// ---------------------------------------------------------------------------
// Lifecycle hooks
// ---------------------------------------------------------------------------

test.beforeAll(async () => {
  // Hard guard: refuse to run anywhere near the real todo-txt data path —
  // the KiroCrew app data dir.
  const realRoots = [
    path.join('.kiro', 'crew', 'apps', 'todo-txt', 'data'),
  ];
  if (realRoots.some((r) => TODO_TXT_ROOT.includes(r))) {
    throw new Error(
      `Refusing to run: TODO_TXT_ROOT (${TODO_TXT_ROOT}) resembles a ` +
        `real data path. Set TODO_TXT_ROOT to a disposable temp dir.`,
    );
  }
});

test.afterAll(async () => {
  // Only auto-clean if we generated the path ourselves.
  if (!process.env.TODO_TXT_ROOT) {
    await fs.rm(TODO_TXT_ROOT, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// Scenarios
// ---------------------------------------------------------------------------

test.describe('todo-txt Command Palette E2E', () => {
  // (1) ------------------------------------------------------------------
  test("(1) ⌘K opens palette; typing 'do' + Enter runs on line 1 and updates editor", async ({
    page,
  }) => {
    const original = 'Buy milk\nWrite tests\n';
    await resetRoot({ todo: original });
    await openTodoTxt(page);

    await openPalette(page);

    // Type 'do' — this should filter the list so that the `do` command
    // is the first (highlighted) option.
    const search = page.locator('[data-testid="command-palette-search"]');
    await search.fill('do');

    // The `do` command is visible in the filtered list.
    await expect(
      page.locator('[data-testid="command-item-do"]'),
    ).toBeVisible();

    // Choose the exact command: substring search also matches descriptions,
    // so Enter alone is intentionally not an ordering contract.
    await page.locator('[data-testid="command-item-do"]').click();
    const argInput = page.locator('[data-testid="arg-input-0"]');
    await expect(argInput).toBeVisible();
    await expect(argInput).toBeFocused();

    // Fill line number 1 and submit.
    await argInput.fill('1');
    await page.keyboard.press('Enter');

    // Palette closes.
    await expect(
      page.locator('[data-testid="command-palette"]'),
    ).toBeHidden();

    // Textarea now has the `x YYYY-MM-DD ` prefix on line 1.
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const expected = `x ${today} Buy milk\nWrite tests\n`;
    await expectEditorValue(page, expected);

    // And persists to disk via the debounced PUT pipeline.
    await waitForFile(TODO_TXT_PATH, (c) => c.startsWith(`x ${today} `));
    expect(await readFileSafe(TODO_TXT_PATH)).toBe(expected);
  });

  // (2) ------------------------------------------------------------------
  test('(2) archive moves x-lines from todo.txt into done.txt', async ({
    page,
  }) => {
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const seeded =
      `x ${today} Finished task one\n` +
      '(A) Still open\n' +
      `x ${today} Finished task two\n` +
      '(B) Also open\n';
    await resetRoot({ todo: seeded, done: '' });
    await openTodoTxt(page);

    // Wait for the archive server-action response so we know the
    // backend completed before asserting on disk state.
    const archiveResp = page.waitForResponse(
      (r) =>
        r.url().includes('/apps/todo-txt/api/archive') &&
        r.request().method() === 'POST' &&
        r.ok(),
    );

    await openPalette(page);
    const search = page.locator('[data-testid="command-palette-search"]');
    await search.fill('archive');
    await expect(
      page.locator('[data-testid="command-item-archive"]'),
    ).toBeVisible();

    // `archive` has argSchema=[], so Enter executes immediately.
    await page.keyboard.press('Enter');
    await archiveResp;

    // Palette closes post-execute.
    await expect(
      page.locator('[data-testid="command-palette"]'),
    ).toBeHidden();

    // Disk: todo.txt retains only the open lines; done.txt gained the
    // two completed lines (order preserved).
    await waitForFile(
      TODO_TXT_PATH,
      (c) => !c.includes(`x ${today} Finished task`),
    );
    await waitForFile(DONE_TXT_PATH, (c) => c.includes('Finished task one'));

    const todoAfter = await readFileSafe(TODO_TXT_PATH);
    const doneAfter = await readFileSafe(DONE_TXT_PATH);

    expect(todoAfter).toBe('(A) Still open\n(B) Also open\n');
    expect(doneAfter).toContain(`x ${today} Finished task one`);
    expect(doneAfter).toContain(`x ${today} Finished task two`);
  });

  // (3) ------------------------------------------------------------------
  test('(3) pri 1 A sets (A) priority on line 1', async ({ page }) => {
    await resetRoot({ todo: 'Walk the dog\nBuy milk\n' });
    await openTodoTxt(page);

    await openPalette(page);
    const search = page.locator('[data-testid="command-palette-search"]');
    await search.fill('pri');

    // Ensure the `pri` command row is visible (there are multiple
    // commands starting with `pri` — we rely on the list presenting
    // the exact name first after substring match + name prefix).
    await expect(
      page.locator('[data-testid="command-item-pri"]'),
    ).toBeVisible();

    // Click the pri command row directly — avoids ambiguity about
    // which filtered row is highlighted by Enter.
    await page.locator('[data-testid="command-item-pri"]').click();

    // Arg form: item# then priority.
    const itemInput = page.locator('[data-testid="arg-input-0"]');
    const priorityInput = page.locator('[data-testid="arg-input-1"]');
    await expect(itemInput).toBeVisible();
    await expect(priorityInput).toBeVisible();

    await itemInput.fill('1');
    await priorityInput.fill('A');
    await page.keyboard.press('Enter');

    // Palette closes.
    await expect(
      page.locator('[data-testid="command-palette"]'),
    ).toBeHidden();

    // Line 1 now carries `(A) ` prefix.
    await expectEditorValue(page, '(A) Walk the dog\nBuy milk\n');

    // Persisted to disk.
    await waitForFile(TODO_TXT_PATH, (c) => c.startsWith('(A) '));
    expect(await readFileSafe(TODO_TXT_PATH)).toBe(
      '(A) Walk the dog\nBuy milk\n',
    );
  });

  // (4) ------------------------------------------------------------------
  test("(4) sort priority reorders the visible lines", async ({ page }) => {
    // Mixed priorities out of order; sortLines('priority') must float
    // (A) before (B) before un-prioritised lines.
    const seeded =
      '(B) Middle task\nNo priority task\n(A) Top task\n(C) Low task\n';
    await resetRoot({ todo: seeded });
    await openTodoTxt(page);

    await openPalette(page);
    const search = page.locator('[data-testid="command-palette-search"]');
    await search.fill('sort');
    await expect(
      page.locator('[data-testid="command-item-sort"]'),
    ).toBeVisible();

    // Click the sort row to open its arg form deterministically.
    await page.locator('[data-testid="command-item-sort"]').click();

    // Arg form: mode (string).
    const modeInput = page.locator('[data-testid="arg-input-0"]');
    await expect(modeInput).toBeVisible();
    await modeInput.fill('priority');
    await page.keyboard.press('Enter');

    // Palette closes.
    await expect(
      page.locator('[data-testid="command-palette"]'),
    ).toBeHidden();

    // Textarea reordered: (A) first, then (B), then (C), then
    // un-prioritised. The exact order within each priority bucket
    // preserves input order for deterministic sort (see sortModes.ts).
    const expected =
      '(A) Top task\n(B) Middle task\n(C) Low task\nNo priority task\n';
    await expectEditorValue(page, expected);

    // Persisted to disk (sort is a client-side mutation, so the file
    // is updated via the standard debounced PUT pipeline).
    await waitForFile(TODO_TXT_PATH, (c) => c.startsWith('(A) Top task'));
    expect(await readFileSafe(TODO_TXT_PATH)).toBe(expected);
  });

  // (5) ------------------------------------------------------------------
  // Rewritten for the right-rail help panel (UX_1b, 2026-05-09). The
  // previous version asserted against the retired HelpPanel modal's
  // `todo-txt-help-format` and `todo-txt-help-commands` sections. The rail
  // replaces those with categorized accordions; structural assertions now
  // verify the new `todo-txt-help-pinned` section plus at least two
  // category regions, and a reasonable verb count across them.
  test('(5) help command opens the right-rail help panel', async ({ page }) => {
    await resetRoot({ todo: '(A) Something\n' });
    await openTodoTxt(page);

    // Rail must start hidden.
    await expect(
      page.locator('[data-testid="todo-txt-help-panel"]'),
    ).toBeHidden();

    await openPalette(page);
    const search = page.locator('[data-testid="command-palette-search"]');
    await search.fill('help');
    await expect(
      page.locator('[data-testid="command-item-help"]'),
    ).toBeVisible();

    // `help` has argSchema=[], so Enter executes immediately.
    await page.keyboard.press('Enter');

    // Palette closes.
    await expect(
      page.locator('[data-testid="command-palette"]'),
    ).toBeHidden();

    // Rail is now visible with its pinned bar and category accordions.
    const panel = page.locator('[data-testid="todo-txt-help-panel"]');
    await expect(panel).toBeVisible();
    await expect(
      page.locator('[data-testid="todo-txt-help-pinned"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="todo-txt-help-category-task-ops"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="todo-txt-help-category-filters"]'),
    ).toBeVisible();

    // The four category accordions plus the fallback surface at least
    // the 18 todo.sh CLI verbs we ship (help is self-excluded).
    const verbNames = page.locator(
      '[data-testid^="todo-txt-help-category-"] [role="region"] *',
    );
    expect(await verbNames.count()).toBeGreaterThanOrEqual(18);

    // Closing the panel via its close button restores hidden state.
    await page.locator('[data-testid="todo-txt-help-close"]').click();
    await expect(panel).toBeHidden();
  });
});
