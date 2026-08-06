import { test, expect, Page } from '@playwright/test';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import {
  editorLocator,
  expectEditorValue,
  readEditorValue,
  selectEditorLine,
} from './e2e/codemirror';

const ROOT = process.env.TODO_TXT_ROOT!;

async function readTodo() { return fs.readFile(path.join(ROOT, 'todo.txt'), 'utf8'); }
async function writeTodo(s: string) { await fs.writeFile(path.join(ROOT, 'todo.txt'), s, 'utf8'); }
async function readDone() { return fs.readFile(path.join(ROOT, 'done.txt'), 'utf8').catch(() => ''); }

async function seed(page: Page, todoTxt: string) {
  await writeTodo(todoTxt);
  try { await fs.unlink(path.join(ROOT, 'done.txt')); } catch {}
  try { await fs.unlink(path.join(ROOT, 'report.txt')); } catch {}
  await page.goto('/');
  await editorLocator(page).waitFor({ state: 'visible' });
  await expectEditorValue(page, todoTxt);
}

async function selectLine(page: Page, lineIdx1Based: number) {
  await editorLocator(page).waitFor({ state: 'visible' });
  await page
    .locator('[data-testid="todo-txt-selection-popover-portal"]')
    .waitFor({ state: 'hidden', timeout: 2_000 })
    .catch(() => {});
  await page.evaluate(
    () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
  );
  await selectEditorLine(page, lineIdx1Based);
  await page
    .getByRole('dialog', { name: 'Todo-txt selection actions' })
    .waitFor({ state: 'visible', timeout: 5_000 });
}

function localDate(d: Date): string {
  // Local-time YYYY-MM-DD. The app expands date shortcuts in the user's
  // local zone; `toISOString()` is UTC and goes stale for users east of
  // UTC between local midnight and UTC midnight (first seen 00:56 +02:00).
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return localDate(d);
}

function today(): string { return addDays(0); }

function nextWeekday(dow: number): string {
  const d = new Date();
  const diff = (dow - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return localDate(d);
}

const SEED = 'Line one\nLine two\nLine three';

test.describe('Selection Popover', () => {
  test('Popover appears', async ({ page }) => {
    await seed(page, SEED);
    await selectLine(page, 2);
    const portal = page.locator('[data-testid="todo-txt-selection-popover-portal"]');
    const popover = page.getByRole('dialog', {
      name: 'Todo-txt selection actions',
    });
    await expect(portal).toBeAttached();
    await expect(popover).toBeVisible();
    await expect(
      page.locator(
        '[data-testid="todo-txt-editor-wrap"] [data-testid="todo-txt-selection-popover-portal"]',
      ),
    ).toBeAttached();
    await expect(popover.locator('[aria-label="Mark done (Cmd/Ctrl+D)"]')).toBeVisible();
    await expect(popover.locator('[aria-label="Set due date"]')).toBeVisible();
    await expect(popover.locator('[aria-label="Delete line"]')).toBeVisible();
  });

  test('narrow menus and prompt stay usable inside the scrollable card', async ({ page }) => {
    await page.setViewportSize({ width: 240, height: 320 });
    await seed(page, SEED);
    await selectLine(page, 2);

    const dialog = page.getByRole('dialog', {
      name: 'Todo-txt selection actions',
    });
    for (const [buttonName, menuName] of [
      ['Set priority', 'Priority options'],
      ['Set due date', 'Due date options'],
    ] as const) {
      const button = page.getByRole('button', { name: buttonName });
      await button.scrollIntoViewIfNeeded();
      await button.click();
      const menu = page.getByRole('menu', { name: menuName });
      await menu.scrollIntoViewIfNeeded();
      const [dialogBox, menuBox] = await Promise.all([
        dialog.boundingBox(),
        menu.boundingBox(),
      ]);
      expect(dialogBox).not.toBeNull();
      expect(menuBox).not.toBeNull();
      expect(menuBox!.x).toBeGreaterThanOrEqual(dialogBox!.x);
      expect(menuBox!.x + menuBox!.width).toBeLessThanOrEqual(
        dialogBox!.x + dialogBox!.width,
      );
      await button.click();
    }

    const prompt = page.getByTestId('todo-txt-selection-prompt');
    await prompt.scrollIntoViewIfNeeded();
    await prompt.fill('Rewrite this clearly');
    await expect(prompt).toBeFocused();
    await expect(page.getByTestId('todo-txt-just-do-it')).toBeEnabled();
    const overflow = await dialog.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }));
    expect(overflow.scrollWidth).toBe(overflow.clientWidth);
  });

  test('Due dropdown — tom', async ({ page }) => {
    await seed(page, SEED);
    await selectLine(page, 2);
    await page.click('[aria-label="Set due date"]');
    await page.getByRole('menuitem', { name: /Tomorrow/i }).click();
    await page.waitForTimeout(800);
    const val = await readEditorValue(page);
    expect(val).toMatch(new RegExp(`due:${addDays(1)}`));
  });

  test('Due dropdown — all 7 options', async ({ page }) => {
    // Menu items have visible text: "Today", "Tomorrow", "In 3 days", "In 1 week", "In 2 weeks", "Next Friday", "Next Monday"
    const cases: [RegExp, string][] = [
      [/Today/i, addDays(0)],
      [/Tomorrow/i, addDays(1)],
      [/In 3 days/i, addDays(3)],
      [/In 1 week/i, addDays(7)],
      [/In 2 weeks/i, addDays(14)],
      [/Next Friday/i, nextWeekday(5)],
      [/Next Monday/i, nextWeekday(1)],
    ];

    for (const [labelRe, expected] of cases) {
      // Reset content via the backend API to avoid auto-save race conditions.
      // Use page.request (carries baseURL from config) instead of page.evaluate
      // fetch (whose relative-URL resolution is flaky during page.reload).
      await page.request.put('/apps/todo-txt/api/file?name=todo', {
        data: { content: SEED },
      });
      // page.goto is more reliable than page.reload after a raw request.put:
      // reload occasionally fires before the dev harness finishes serving
      // the reset content, stranding the textarea locator.
      await page.goto('/');
      await editorLocator(page).waitFor({ state: 'visible' });
      await expectEditorValue(page, SEED);
      await selectLine(page, 2);
      await page.click('[aria-label="Set due date"]');
      await page.getByRole('menuitem', { name: labelRe }).click();
      await page.waitForTimeout(800);
      const val = await readEditorValue(page);
      const line2 = val.split('\n')[1];
      expect(line2).toContain(`due:${expected}`);
    }
  });

  test('Duplicate', async ({ page }) => {
    await seed(page, SEED);
    await selectLine(page, 2);
    await page.click('[aria-label="Duplicate line"]');
    await page.waitForTimeout(800);
    const val = await readEditorValue(page);
    const lines = val.split('\n');
    expect(lines).toHaveLength(4);
    expect(lines.filter(l => l === 'Line two')).toHaveLength(2);
  });

  test('Archive (→ Done)', async ({ page }) => {
    await seed(page, SEED);
    await selectLine(page, 2);
    const archiveResponse = page.waitForResponse(
      (response) =>
        response.url().includes('/apps/todo-txt/api/archive') &&
        response.request().method() === 'POST' &&
        response.ok(),
    );
    await page.click('[aria-label="Archive line to done.txt"]');
    await archiveResponse;
    const [todo, done] = await Promise.all([readTodo(), readDone()]);
    expect(todo).not.toContain('Line two');
    expect(done).toMatch(/x \d{4}-\d{2}-\d{2} Line two/);
    expect(todo).toContain('Line one');
    expect(todo).toContain('Line three');
  });

  test('Delete', async ({ page }) => {
    await seed(page, SEED);
    await selectLine(page, 2);
    await page.click('[aria-label="Delete line"]');
    await page.waitForTimeout(800);
    const val = await readEditorValue(page);
    const lines = val.split('\n').filter(l => l.length > 0);
    expect(lines).toHaveLength(2);
    expect(lines).toContain('Line one');
    expect(lines).toContain('Line three');
  });
});
