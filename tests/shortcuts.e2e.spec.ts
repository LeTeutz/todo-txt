import { test, expect, Page } from '@playwright/test';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import {
  editorLocator,
  expectEditorValue,
  fillEditor,
  readEditorValue,
} from './e2e/codemirror';

const ROOT = process.env.TODO_TXT_ROOT!;
if (!ROOT) throw new Error('TODO_TXT_ROOT required');

function localDate(d: Date): string {
  // Local-time YYYY-MM-DD. The app expands date shortcuts in the user's
  // local zone; `toISOString()` is UTC and goes stale for users east of
  // UTC between local midnight and UTC midnight (first seen 00:56 +02:00).
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function today(): string {
  return localDate(new Date());
}

function addDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return localDate(d);
}

async function seedEmpty(page: Page) {
  await fs.writeFile(path.join(ROOT, 'todo.txt'), '', 'utf8');
  await page.goto('/');
  await editorLocator(page).waitFor({ state: 'visible' });
  await expectEditorValue(page, '');
}

async function fireShortcut(page: Page, token: string, triggerChar = ' ', prefix = '') {
  const ta = editorLocator(page);
  await ta.focus();
  await fillEditor(page, prefix);
  if (prefix) await page.keyboard.press('End');
  await page.keyboard.type(`!!${token}`);
  await page.keyboard.type(triggerChar);
  await page.waitForTimeout(150);
}

async function value(page: Page): Promise<string> {
  return readEditorValue(page);
}

function extractDate(text: string): string | null {
  const m = text.match(/\d{4}-\d{2}-\d{2}/);
  return m ? m[0] : null;
}

function dayOfWeek(dateStr: string): number {
  return new Date(dateStr + 'T00:00:00').getDay();
}

test.describe('shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await seedEmpty(page);
  });

  // === Line-level (5) ===

  test('!!done marks line as complete with today date', async ({ page }) => {
    await fireShortcut(page, 'done', ' ', '(A) Task here');
    const v = await value(page);
    expect(v).toMatch(new RegExp(`^x ${today()} Task here`));
    expect(v).not.toContain('(A)');
  });

  test('!!undone strips x-prefix from completed line', async ({ page }) => {
    await fireShortcut(page, 'undone', ' ', 'x 2026-05-01 Old task');
    const v = await value(page);
    expect(v.trim()).toBe('Old task');
  });

  test('!!a sets priority A on line', async ({ page }) => {
    await fireShortcut(page, 'a', ' ', 'Task here');
    const v = await value(page);
    expect(v.trim()).toBe('(A) Task here');
  });

  test('!!c sets priority C on line (any lowercase letter except reserved)', async ({ page }) => {
    await fireShortcut(page, 'c', ' ', 'Another task');
    const v = await value(page);
    expect(v.trim()).toBe('(C) Another task');
  });

  test('!!pri- strips priority from line', async ({ page }) => {
    await fireShortcut(page, 'pri-', ' ', '(B) Needs doing');
    const v = await value(page);
    expect(v.trim()).toBe('Needs doing');
  });

  test('!!archive marks line done with archived:1 tag', async ({ page }) => {
    await fireShortcut(page, 'archive', ' ', 'Task here ');
    const v = await value(page);
    expect(v).toMatch(/^x \d{4}-\d{2}-\d{2} .*archived:1/);
  });

  // === Inline date/time (7) ===

  test('!!t expands to time:HH:MM', async ({ page }) => {
    await fireShortcut(page, 't');
    const v = await value(page);
    expect(v).toMatch(/time:\d{2}:\d{2}/);
  });

  test('!!now expands to YYYY-MM-DDTHH:MM', async ({ page }) => {
    await fireShortcut(page, 'now');
    const v = await value(page);
    expect(v).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/);
  });

  test('!!d expands to today date', async ({ page }) => {
    await fireShortcut(page, 'd');
    const v = await value(page);
    expect(v).toContain(today());
  });

  test('Backspace immediately after expansion restores the literal shortcut', async ({ page }) => {
    await fireShortcut(page, 'd');
    expect(await value(page)).toContain(today());
    await expect(editorLocator(page)).toBeFocused();

    await page.keyboard.press('Backspace');

    await expectEditorValue(page, '!!d ');
  });

  test('!!tom expands to tomorrow date', async ({ page }) => {
    await fireShortcut(page, 'tom');
    const v = await value(page);
    expect(v).toContain(addDays(1));
  });

  test('!!yday expands to yesterday date', async ({ page }) => {
    await fireShortcut(page, 'yday');
    const v = await value(page);
    expect(v).toContain(addDays(-1));
  });

  test('!!+1d expands to tomorrow date', async ({ page }) => {
    await fireShortcut(page, '+1d');
    const v = await value(page);
    expect(v).toContain(addDays(1));
  });

  test('!!+1w expands to date 7 days from now', async ({ page }) => {
    await fireShortcut(page, '+1w');
    const v = await value(page);
    expect(v).toContain(addDays(7));
  });

  // === Weekday (7) ===

  test('!!mon expands to next Monday', async ({ page }) => {
    await fireShortcut(page, 'mon');
    const v = await value(page);
    const d = extractDate(v);
    expect(d).not.toBeNull();
    expect(dayOfWeek(d!)).toBe(1);
  });

  test('!!tue expands to next Tuesday', async ({ page }) => {
    await fireShortcut(page, 'tue');
    const v = await value(page);
    const d = extractDate(v);
    expect(d).not.toBeNull();
    expect(dayOfWeek(d!)).toBe(2);
  });

  test('!!wed expands to next Wednesday', async ({ page }) => {
    await fireShortcut(page, 'wed');
    const v = await value(page);
    const d = extractDate(v);
    expect(d).not.toBeNull();
    expect(dayOfWeek(d!)).toBe(3);
  });

  test('!!thu expands to next Thursday', async ({ page }) => {
    await fireShortcut(page, 'thu');
    const v = await value(page);
    const d = extractDate(v);
    expect(d).not.toBeNull();
    expect(dayOfWeek(d!)).toBe(4);
  });

  test('!!fri expands to next Friday', async ({ page }) => {
    await fireShortcut(page, 'fri');
    const v = await value(page);
    const d = extractDate(v);
    expect(d).not.toBeNull();
    expect(dayOfWeek(d!)).toBe(5);
  });

  test('!!sat expands to next Saturday', async ({ page }) => {
    await fireShortcut(page, 'sat');
    const v = await value(page);
    const d = extractDate(v);
    expect(d).not.toBeNull();
    expect(dayOfWeek(d!)).toBe(6);
  });

  test('!!sun expands to next Sunday', async ({ page }) => {
    await fireShortcut(page, 'sun');
    const v = await value(page);
    const d = extractDate(v);
    expect(d).not.toBeNull();
    expect(dayOfWeek(d!)).toBe(0);
  });

  // === Semantic (6) ===

  test('!!due:fri expands to due:<friday-date>', async ({ page }) => {
    await fireShortcut(page, 'due:fri');
    const v = await value(page);
    const m = v.match(/due:(\d{4}-\d{2}-\d{2})/);
    expect(m).not.toBeNull();
    expect(dayOfWeek(m![1])).toBe(5);
  });

  test('!!t:tom expands to t:<tomorrow-date>', async ({ page }) => {
    await fireShortcut(page, 't:tom');
    const v = await value(page);
    expect(v).toContain(`t:${addDays(1)}`);
  });

  test('!!rec:1w expands to rec:+1w with auto-prefix', async ({ page }) => {
    await fireShortcut(page, 'rec:1w');
    const v = await value(page);
    expect(v).toContain('rec:+1w');
  });

  test('!!rec:+2w expands to rec:+2w without double plus', async ({ page }) => {
    await fireShortcut(page, 'rec:+2w');
    const v = await value(page);
    expect(v).toContain('rec:+2w');
    expect(v).not.toContain('rec:++');
  });

  test('!!id expands to id:<8-char-alphanumeric>', async ({ page }) => {
    await fireShortcut(page, 'id');
    const v = await value(page);
    expect(v).toMatch(/id:[a-z0-9]{8}/);
  });

  test('!!p+foo expands to +foo (project)', async ({ page }) => {
    await fireShortcut(page, 'p+foo', ' ', 'Task ');
    const v = await value(page);
    expect(v).toContain('+foo');
    expect(v).not.toContain('!!');
    expect(v).not.toContain('p+foo ');
  });

  // === Plus/at (2) ===

  test('!!@bar expands to @bar (context)', async ({ page }) => {
    await fireShortcut(page, '@bar', ' ', 'Task ');
    const v = await value(page);
    expect(v).toContain('@bar');
    expect(v).not.toContain('!!');
  });

  test('Tab-complete expands +project prefix from file content', async ({ page }) => {
    await fs.writeFile(path.join(ROOT, 'todo.txt'), 'Task1 +groceries\n', 'utf8');
    await page.goto('/');
    await editorLocator(page).waitFor({ state: 'visible' });
    await expectEditorValue(page, 'Task1 +groceries\n');
    const editor = editorLocator(page);
    await editor.focus();
    // End-of-document: Ctrl+End on Linux/Windows, Cmd+ArrowDown on macOS.
    await page.keyboard.press(
      process.platform === 'darwin' ? 'Meta+ArrowDown' : 'Control+End',
    );
    await page.keyboard.press('End');
    await page.keyboard.type('+groc');
    await page.keyboard.press('Tab');

    await expectEditorValue(page, 'Task1 +groceries\n+groceries');
  });
});
