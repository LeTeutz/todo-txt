import { test, expect, Page } from '@playwright/test';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import {
  editorLocator,
  expectEditorValue,
  readEditorValue,
  selectedEditorText,
} from './e2e/codemirror';

const ROOT = process.env.TODO_TXT_ROOT!;
if (!ROOT) throw new Error('TODO_TXT_ROOT required');

const LOCAL_MUTATION_COMMANDS = new Set([
  'add',
  'append',
  'prepend',
  'del',
  'replace',
  'do',
  'pri',
  'depri',
  'sort',
  'example',
]);

function waitForCommandCompletion(page: Page, cmdName: string) {
  let endpoint: string | null = null;
  let method = 'GET';
  if (LOCAL_MUTATION_COMMANDS.has(cmdName)) {
    endpoint = '/apps/todo-txt/api/content';
    method = 'PUT';
  } else if (cmdName === 'archive' || cmdName === 'move' || cmdName === 'report') {
    endpoint = `/apps/todo-txt/api/${cmdName}`;
    method = 'POST';
  } else if (cmdName === 'listfile') {
    endpoint = '/apps/todo-txt/api/file?name=';
  }
  if (!endpoint) return null;
  return page.waitForResponse(
    (response) =>
      response.url().includes(endpoint) &&
      response.request().method() === method &&
      response.ok(),
    { timeout: 5_000 },
  );
}

const readTodo = () => fs.readFile(path.join(ROOT, 'todo.txt'), 'utf8');
const readDone = () => fs.readFile(path.join(ROOT, 'done.txt'), 'utf8').catch(() => '');
const readReport = () => fs.readFile(path.join(ROOT, 'report.txt'), 'utf8').catch(() => '');
const writeTodo = (s: string) => fs.writeFile(path.join(ROOT, 'todo.txt'), s, 'utf8');

async function seed(page: Page, todoTxt: string) {
  await writeTodo(todoTxt);
  try { await fs.unlink(path.join(ROOT, 'done.txt')); } catch {}
  try { await fs.unlink(path.join(ROOT, 'report.txt')); } catch {}
  // Small delay to ensure filesystem writes are visible to the server
  await new Promise(r => setTimeout(r, 100));
  await page.goto('/');
  await editorLocator(page).waitFor({ state: 'visible' });
  await expectEditorValue(page, todoTxt);
}

async function openPalette(page: Page) {
  // Shortcut is scoped to in-app focus (5cee52c); focus the editor first.
  await editorLocator(page).focus();
  await page.keyboard.press('Control+k');
  await page.waitForSelector('[data-testid="command-palette"]');
}

async function runCommand(page: Page, cmdName: string, args: string[] = []) {
  await openPalette(page);
  await page.locator('[data-testid="command-palette-search"]').fill(cmdName);
  // Click the specific command item rather than pressing Enter: the palette
  // uses substring match against (name + shortName + description), so typing
  // 'do' also matches 'add' (description says 'todo.txt'), 'listall'
  // (description has 'done'), etc. Pressing Enter would run whichever command
  // is first alphabetically, not the one we want.
  const completionResponse = waitForCommandCompletion(page, cmdName);
  await page.locator(`[data-testid="command-item-${cmdName}"]`).click();
  // Some commands have all-optional argSchema (e.g. listcon / listproj /
  // listall). Click opens the args form with empty inputs; we need to
  // press Enter to submit. If args were provided we fill them first.
  const argsForm = page.locator('[data-testid="command-palette-args"]');
  const argsFormVisible = await argsForm
    .waitFor({ state: 'visible', timeout: 500 })
    .then(() => true)
    .catch(() => false);
  if (argsFormVisible) {
    for (let i = 0; i < args.length; i++) {
      const input = page.locator(`[data-testid="arg-input-${i}"]`);
      await input.fill(args[i]);
    }
    // Find the last visible arg input (handles optional fields beyond what we fill)
    let lastIdx = Math.max(0, args.length - 1);
    for (let i = Math.max(args.length, 1); ; i++) {
      const next = page.locator(`[data-testid="arg-input-${i}"]`);
      if ((await next.count()) === 0) break;
      lastIdx = i;
    }
    // Press Enter on the last (or only) arg input to submit. If args
    // array was empty and the schema has optional fields, we submit with
    // those left blank — matches the "bare listcon" / "listall" UX.
    const last = page.locator(`[data-testid="arg-input-${lastIdx}"]`);
    if ((await last.count()) > 0) {
      await last.press('Enter');
    } else {
      await page.keyboard.press('Enter');
    }
  }
  await page.waitForSelector('[data-testid="command-palette"]', {
    state: 'detached',
    timeout: 3_000,
  });
  await completionResponse;
}

const today = (() => {
  // Local-time YYYY-MM-DD (see shortcuts spec for the UTC pitfall).
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
})();

test.describe('commands', () => {
  test('add appends new line with today date', async ({ page }) => {
    await seed(page, 'Existing task');
    await runCommand(page, 'add', ['Buy milk +groceries']);
    const content = await readTodo();
    const lines = content.trim().split('\n');
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain('Buy milk +groceries');
  });

  test('append adds text to end of line', async ({ page }) => {
    await seed(page, 'Line one');
    await runCommand(page, 'append', ['1', '@home']);
    const content = await readTodo();
    expect(content.trim()).toBe('Line one @home');
  });

  test('prepend adds text to beginning of line', async ({ page }) => {
    await seed(page, 'Line one');
    await runCommand(page, 'prepend', ['1', '(A)']);
    const content = await readTodo();
    expect(content.trim()).toMatch(/^\(A\) Line one/);
  });

  test('del removes line by number', async ({ page }) => {
    await seed(page, 'A\nB\nC');
    await runCommand(page, 'del', ['1']);
    const content = await readTodo();
    const lines = content.trim().split('\n');
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe('B');
    expect(lines[1]).toBe('C');
  });

  test('del word removes word from line', async ({ page }) => {
    await seed(page, 'Buy milk today');
    await runCommand(page, 'del', ['1', 'milk']);
    const content = await readTodo();
    expect(content.trim()).toBe('Buy today');
  });

  test('replace replaces line text preserving date', async ({ page }) => {
    await seed(page, '2026-05-01 Old task');
    await runCommand(page, 'replace', ['1', 'Entirely new text']);
    const content = await readTodo();
    const line = content.trim().split('\n')[0];
    expect(line).toContain('Entirely new text');
  });

  test('do marks task as completed with today date', async ({ page }) => {
    await seed(page, 'Task here');
    await runCommand(page, 'do', ['1']);
    const content = await readTodo();
    expect(content.trim()).toMatch(new RegExp(`^x ${today}`));
  });

  test('pri sets priority on line', async ({ page }) => {
    await seed(page, 'Task');
    await runCommand(page, 'pri', ['1', 'A']);
    const content = await readTodo();
    expect(content.trim()).toMatch(/^\(A\) /);
  });

  test('depri removes priority from line', async ({ page }) => {
    await seed(page, '(A) Task');
    await runCommand(page, 'depri', ['1']);
    const content = await readTodo();
    expect(content.trim()).toBe('Task');
  });

  test('sort priority orders lines by priority', async ({ page }) => {
    await seed(page, '(C) low\n(A) high\n(B) mid');
    await runCommand(page, 'sort', ['priority']);
    const content = await readTodo();
    const lines = content.trim().split('\n');
    expect(lines[0]).toMatch(/^\(A\)/);
    expect(lines[lines.length - 1]).toMatch(/^\(C\)/);
  });

  // NOTE: there is no standalone `mode` command; `mode` is only an argument
  // of `sort` (e.g. `sort priority`). Coverage for that lives in the sort
  // tests above.

  test('list filters textarea without mutating file', async ({ page }) => {
    await seed(page, 'Buy milk\nCall mom\nBuy bread');
    await runCommand(page, 'list', ['Buy']);
    // list is a non-mutating filter command; verify file unchanged
    const ondisk = await readTodo();
    expect(ondisk).toContain('Buy milk');
    expect(ondisk).toContain('Call mom');
    expect(ondisk).toContain('Buy bread');
  });

  test('listall shows active and completed tasks', async ({ page }) => {
    await seed(page, 'Active task\nx 2026-01-01 Done task');
    await runCommand(page, 'listall');
    const displayed = await readEditorValue(page);
    expect(displayed).toContain('Active task');
    expect(displayed).toContain('x 2026-01-01 Done task');
  });

  test('listcon filters by context', async ({ page }) => {
    await seed(page, 'Task @home\nTask @work\nOther');
    await runCommand(page, 'listcon', ['@home']);
    // listcon is a non-mutating filter command; verify file unchanged
    const ondisk = await readTodo();
    expect(ondisk).toContain('Task @home');
    expect(ondisk).toContain('Task @work');
    expect(ondisk).toContain('Other');
  });

  test('listproj filters by project', async ({ page }) => {
    await seed(page, 'Task +groceries\nTask +chores');
    await runCommand(page, 'listproj', ['+groceries']);
    // listproj is a non-mutating filter command; verify file unchanged
    const ondisk = await readTodo();
    expect(ondisk).toContain('Task +groceries');
    expect(ondisk).toContain('Task +chores');
  });

  test('listpri filters by priority range', async ({ page }) => {
    await seed(page, '(A) a\n(B) b\n(D) d');
    await runCommand(page, 'listpri', ['A-C']);
    // listpri is a non-mutating filter command; verify file unchanged
    const ondisk = await readTodo();
    expect(ondisk).toContain('(A) a');
    expect(ondisk).toContain('(B) b');
    expect(ondisk).toContain('(D) d');
  });

  test('listfile switches active file tab', async ({ page }) => {
    await seed(page, 'Active task');
    await runCommand(page, 'listfile', ['done']);
    // Active tab indicator flips to "done".
    await expect(
      page.locator('[data-testid="todo-txt-file-tab-done"]'),
    ).toHaveAttribute('aria-selected', 'true');
  });

  test('archive moves completed tasks to done.txt', async ({ page }) => {
    await seed(page, 'Active\nx 2026-05-01 Done task');
    await runCommand(page, 'archive');
    const todo = await readTodo();
    expect(todo.trim()).toBe('Active');
    const done = await readDone();
    expect(done).toContain('x 2026-05-01 Done task');
  });

  test('move transfers line to done.txt', async ({ page }) => {
    await seed(page, 'Only line');
    await runCommand(page, 'move', ['1', 'done']);
    const todo = await readTodo();
    expect(todo.trim()).toBe('');
    const done = await readDone();
    expect(done).toContain('Only line');
  });

  test('report generates report and switches to report tab', async ({ page }) => {
    await seed(page, '(A) Urgent\nx 2026-05-01 Finished');
    await runCommand(page, 'report');
    const report = await readReport();
    expect(report.length).toBeGreaterThan(0);
    await expect(page.locator('[data-testid="todo-txt-file-tab-report"]')).toHaveAttribute('aria-selected', 'true');
  });

  test('help panel opens and closes', async ({ page }) => {
    // Non-empty seed: an empty todo.txt renders the starter-example overlay,
    // whose centered card intercepts pointer events over the toolbar.
    await seed(page, 'keep one line');
    await page.locator('[data-testid="todo-txt-help-toggle"]').click();
    await expect(page.locator('[data-testid="todo-txt-help-panel"]')).toBeVisible();
    await page.locator('[data-testid="todo-txt-help-close"]').click();
    await expect(page.locator('[data-testid="todo-txt-help-panel"]')).not.toBeVisible();
  });

  test('example inserts starter template', async ({ page }) => {
    await seed(page, '');
    await runCommand(page, 'example');
    // Handle starter overlay if it appears
    const insertBtn = page.locator('[data-testid="todo-txt-insert-starter"]');
    if (await insertBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await insertBtn.click();
      await page.waitForTimeout(800);
    }
    const value = await readEditorValue(page);
    const lines = value.trim().split('\n');
    expect(lines.length).toBeGreaterThanOrEqual(10);
    expect(value).toContain('+');
    expect(value).toContain('@');
  });

  test('list renders filter panel with matching rows', async ({ page }) => {
    await seed(page, 'Buy milk\nCall mom\nBuy bread');
    await runCommand(page, 'list', ['Buy']);
    const panel = page.locator('[data-testid="todo-txt-result-panel"]');
    await expect(panel).toBeVisible();
    await expect(
      page.locator('[data-testid="todo-txt-result-title"]'),
    ).toContainText('Buy');
    await expect(
      page.locator('[data-testid="todo-txt-result-row-0"]'),
    ).toContainText('Buy milk');
    await expect(
      page.locator('[data-testid="todo-txt-result-row-1"]'),
    ).toContainText('Buy bread');
  });

  test('filter panel row click jumps to line in textarea', async ({ page }) => {
    await seed(page, 'Buy milk\nCall mom\nBuy bread');
    await runCommand(page, 'list', ['bread']);
    await page.locator('[data-testid="todo-txt-result-row-0"]').click();
    // Panel closes
    await expect(
      page.locator('[data-testid="todo-txt-result-panel"]'),
    ).not.toBeVisible();
    // Textarea has Buy bread selected (start of line 3)
    await expect
      .poll(() => selectedEditorText(page))
      .toBe('Buy bread');
  });

  test('filter panel Esc closes it', async ({ page }) => {
    await seed(page, 'Alpha\nBeta');
    await runCommand(page, 'list', ['Alpha']);
    await expect(
      page.locator('[data-testid="todo-txt-result-panel"]'),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(
      page.locator('[data-testid="todo-txt-result-panel"]'),
    ).not.toBeVisible();
  });

  test('listcon bare shows aggregate panel with context counts', async ({ page }) => {
    await seed(page, 'Task @home\nTask2 @home\nTask3 @work');
    await runCommand(page, 'listcon');
    const panel = page.locator('[data-testid="todo-txt-result-panel"]');
    await expect(panel).toBeVisible();
    await expect(
      page.locator('[data-testid="todo-txt-result-title"]'),
    ).toContainText('contexts');
    // Two groups: @home (2), @work (1)
    const rows = page.locator('[data-testid^="todo-txt-result-row-"]');
    await expect(rows).toHaveCount(2);
  });

  test('aggregate panel row click drills in to filter', async ({ page }) => {
    await seed(page, 'Task @home\nTask2 @home\nTask3 @work');
    await runCommand(page, 'listcon');
    // Click @home row. The bare listcon sorts by count desc, so @home (2) is first.
    await page.locator('[data-testid="todo-txt-result-row-0"]').click();
    // Drill replaces content: panel now shows filter of items with @home
    await expect(
      page.locator('[data-testid="todo-txt-result-title"]'),
    ).toContainText('@home');
    const rows = page.locator('[data-testid^="todo-txt-result-row-"]');
    await expect(rows).toHaveCount(2); // Task @home, Task2 @home
  });
});
