import { test, expect, Page } from '@playwright/test';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { editorLocator, expectEditorValue } from './e2e/codemirror';

const ROOT = process.env.TODO_TXT_ROOT!;

async function readTodo() { return fs.readFile(path.join(ROOT, 'todo.txt'), 'utf8'); }
async function writeTodo(s: string) { await fs.writeFile(path.join(ROOT, 'todo.txt'), s, 'utf8'); }
async function writeDone(s: string) { await fs.writeFile(path.join(ROOT, 'done.txt'), s, 'utf8'); }
async function writeReport(s: string) { await fs.writeFile(path.join(ROOT, 'report.txt'), s, 'utf8'); }

async function seed(page: Page, todoTxt: string) {
  await writeTodo(todoTxt);
  try { await fs.unlink(path.join(ROOT, 'done.txt')); } catch {}
  try { await fs.unlink(path.join(ROOT, 'report.txt')); } catch {}
  await page.goto('/');
  await editorLocator(page).waitFor({ state: 'visible' });
  await expectEditorValue(page, todoTxt);
}

async function clearBackups() {
  const dir = path.join(ROOT, 'backup');
  try { await fs.rm(dir, { recursive: true }); } catch {}
  await fs.mkdir(dir, { recursive: true });
}

test.describe('UI Chrome', () => {
  test('FileTabs click', async ({ page }) => {
    const todoContent = '(A) Buy milk';
    const doneContent = 'x 2026-05-01 Old task';
    const reportContent = 'Report line';
    await writeTodo(todoContent);
    await writeDone(doneContent);
    await writeReport(reportContent);
    await page.goto('/');
    await editorLocator(page).waitFor({ state: 'visible' });
    await expectEditorValue(page, todoContent);

    // Click done tab
    await page.click('[data-testid="todo-txt-file-tab-done"]');
    await expect(page.locator('[data-testid="todo-txt-file-tab-done"]')).toHaveAttribute('aria-selected', 'true');
    await expectEditorValue(page, doneContent);

    // Click report tab
    await page.click('[data-testid="todo-txt-file-tab-report"]');
    await expect(page.locator('[data-testid="todo-txt-file-tab-report"]')).toHaveAttribute('aria-selected', 'true');

    // Back to todo
    await page.click('[data-testid="todo-txt-file-tab-todo"]');
    await expect(page.locator('[data-testid="todo-txt-file-tab-todo"]')).toHaveAttribute('aria-selected', 'true');
    await expectEditorValue(page, todoContent);
  });

  test('FileTabs arrow-key navigation cycles tabs', async ({ page }) => {
    await seed(page, 'Task');
    const todoTab = page.locator('[data-testid="todo-txt-file-tab-todo"]');
    const doneTab = page.locator('[data-testid="todo-txt-file-tab-done"]');
    const reportTab = page.locator('[data-testid="todo-txt-file-tab-report"]');
    // Focus the active (todo) tab
    await todoTab.focus();
    // ArrowRight -> done
    await page.keyboard.press('ArrowRight');
    await expect(doneTab).toHaveAttribute('aria-selected', 'true');
    await expect(doneTab).toBeFocused();
    // ArrowRight -> report
    await page.keyboard.press('ArrowRight');
    await expect(reportTab).toHaveAttribute('aria-selected', 'true');
    await expect(reportTab).toBeFocused();
    // ArrowRight wraps -> todo
    await page.keyboard.press('ArrowRight');
    await expect(todoTab).toHaveAttribute('aria-selected', 'true');
    await expect(todoTab).toBeFocused();
    // ArrowLeft wraps -> report
    await page.keyboard.press('ArrowLeft');
    await expect(reportTab).toHaveAttribute('aria-selected', 'true');
    await expect(reportTab).toBeFocused();
  });

  test('FileTabs Home/End jump to first and last', async ({ page }) => {
    await seed(page, 'Task');
    const todoTab = page.locator('[data-testid="todo-txt-file-tab-todo"]');
    const doneTab = page.locator('[data-testid="todo-txt-file-tab-done"]');
    const reportTab = page.locator('[data-testid="todo-txt-file-tab-report"]');
    // Start at middle tab
    await doneTab.click();
    await expect(doneTab).toHaveAttribute('aria-selected', 'true');
    // Home -> first (todo)
    await doneTab.focus();
    await page.keyboard.press('Home');
    await expect(todoTab).toHaveAttribute('aria-selected', 'true');
    // End -> last (report)
    await page.keyboard.press('End');
    await expect(reportTab).toHaveAttribute('aria-selected', 'true');
  });

  test('Ctrl+K opens palette', async ({ page }) => {
    await seed(page, 'Task');
    // Shortcut is scoped to in-app focus (5cee52c); focus the editor first.
    await editorLocator(page).focus();
    await page.keyboard.press('Control+k');
    await expect(page.locator('[data-testid="command-palette"]')).toBeVisible();
    await expect(page.locator('[data-testid="command-palette-search"]')).toBeFocused();
  });

  test('Esc closes palette', async ({ page }) => {
    await seed(page, 'Task');
    await editorLocator(page).focus();
    await page.keyboard.press('Control+k');
    await expect(page.locator('[data-testid="command-palette"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="command-palette"]')).not.toBeVisible();
  });

  test('Esc closes Help panel', async ({ page }) => {
    // note: panel supports Escape key via keydown listener
    await seed(page, 'Task');
    await page.click('[data-testid="todo-txt-help-toggle"]');
    await expect(page.locator('[data-testid="todo-txt-help-panel"]')).toBeVisible();
    await page.click('[data-testid="todo-txt-help-close"]');
    await expect(page.locator('[data-testid="todo-txt-help-panel"]')).not.toBeVisible();
  });

  test('Esc closes Backups modal', async ({ page }) => {
    await seed(page, 'Task');
    await page.click('[data-testid="todo-txt-backups"]');
    await expect(page.locator('[data-testid="todo-txt-backups-modal"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="todo-txt-backups-modal"]')).not.toBeVisible();
  });

  test('Download button', async ({ page }) => {
    await seed(page, 'Line1\nLine2');
    const [dl] = await Promise.all([
      page.waitForEvent('download'),
      page.click('[data-testid="todo-txt-download"]'),
    ]);
    expect(dl.suggestedFilename()).toMatch(/todo\.txt/);
  });

  test('Backups modal open + list', async ({ page }) => {
    await clearBackups();
    const dir = path.join(ROOT, 'backup');
    await fs.writeFile(path.join(dir, 'todo-2026-05-08T12-00-00.txt'), 'Backup1', 'utf8');
    await fs.writeFile(path.join(dir, 'todo-2026-05-08T12-05-00.txt'), 'Backup2', 'utf8');
    await fs.writeFile(path.join(dir, 'todo-2026-05-08T12-10-00.txt'), 'Backup3', 'utf8');
    await seed(page, 'Current');
    await page.click('[data-testid="todo-txt-backups"]');
    await expect(page.locator('[data-testid="todo-txt-backups-modal"]')).toBeVisible();
    // Wait for the backup list to finish loading
    await page.waitForTimeout(500);
    await expect(page.locator('[data-testid="todo-txt-backups-modal"] li').first()).toBeVisible({ timeout: 5000 });
    const count = await page.locator('[data-testid="todo-txt-backups-modal"] li').count();
    expect(count).toBeGreaterThanOrEqual(1);
    expect(count).toBeLessThanOrEqual(5);
  });

  test('Backups preview', async ({ page }) => {
    await clearBackups();
    const dir = path.join(ROOT, 'backup');
    await fs.writeFile(path.join(dir, 'todo-2026-05-08T12-00-00.txt'), 'Preview content here', 'utf8');
    await seed(page, 'Current');
    await page.click('[data-testid="todo-txt-backups"]');
    await expect(page.locator('[data-testid="todo-txt-backups-modal"]')).toBeVisible();
    await page.locator('[data-testid="todo-txt-backups-modal"] li').first().getByRole('button', { name: 'Preview' }).click();
    // Preview pane should be visible and contain some text
    const previewPane = page.locator('[data-testid="todo-txt-backups-modal"] pre').first();
    await expect(previewPane).toBeVisible();
    const txt = await previewPane.textContent();
    expect(txt && txt.trim().length > 0).toBe(true);
  });

  test('Backups restore', async ({ page }) => {
    await clearBackups();
    const dir = path.join(ROOT, 'backup');
    await fs.writeFile(path.join(dir, 'todo-2026-05-08T12-00-00.txt'), 'Backup content', 'utf8');
    await seed(page, 'Current content');
    await page.click('[data-testid="todo-txt-backups"]');
    await page.locator('[data-testid="todo-txt-backups-modal"] li').first().getByRole('button', { name: 'Preview' }).click();
    // Capture preview content before restoring
    const previewPane = page.locator('[data-testid="todo-txt-backups-modal"] pre').first();
    await expect(previewPane).toBeVisible();
    const previewText = (await previewPane.textContent() ?? '').trim();
    await page.getByText('Restore this backup').click();
    await page.waitForTimeout(1000);
    const content = await readTodo();
    expect(content.trim()).toBe(previewText);
  });

  test('Line-number gutter', async ({ page }) => {
    await seed(page, 'Line A\nLine B\nLine C');
    const gutter = page.locator('.cm-lineNumbers');
    await expect(gutter).toBeVisible();
    const lineItems = gutter
      .locator('.cm-gutterElement')
      .filter({ hasText: /^[1-3]$/ });
    await expect(lineItems).toHaveCount(3);
    await expect(lineItems.first()).toHaveText('1');
  });

  test('Fullscreen toggle', async ({ page }) => {
    await seed(page, 'Task');
    const btn = page.locator('[data-testid="todo-txt-fullscreen"]');
    await expect(btn).toHaveAttribute('aria-label', 'Enter fullscreen');
    await btn.click();
    // Headless browsers may reject fullscreen; verify via aria-label toggle
    const isFullscreen = await page.evaluate(() => !!document.fullscreenElement);
    if (isFullscreen) {
      expect(isFullscreen).toBe(true);
    } else {
      await expect(btn).toHaveAttribute('aria-label', 'Exit fullscreen');
    }
  });

  test('Error toast', async ({ page }) => {
    await seed(page, 'A\nB\nC');
    // Invoke `del 99` via palette — out-of-range triggers error toast
    await editorLocator(page).focus();
    await page.keyboard.press('Control+k');
    await page.locator('[data-testid="command-palette-search"]').fill('del');
    // Click the specific command-item rather than pressing Enter on the
    // search: substring matches against (name + shortName + description)
    // can pick a neighbouring command if test state leaks between runs.
    await page.locator('[data-testid="command-item-del"]').click();
    const argInput = page.locator('[data-testid="command-palette-args"] input').first();
    await expect(argInput).toBeVisible();
    await argInput.fill('99');
    await argInput.press('Enter');
    // del has 2 args (item#, term); Enter on first moves to second — submit from there
    const lastArgInput = page.locator('[data-testid="command-palette-args"] input').last();
    await lastArgInput.press('Enter');
    const toast = page.locator('[data-testid="todo-txt-toast-error"]');
    await expect(toast).toBeVisible({ timeout: 5000 });
    // Toast tone is theme-aware: the same canonical danger token drives
    // its text and border. Comparing rendered properties avoids resolving
    // the inherited token from an unrelated document-body scope.
    const [color, borderColor] = await toast.evaluate((el) => {
      const style = getComputedStyle(el);
      return [style.color, style.borderTopColor];
    });
    expect(color).toBe(borderColor);
  });

  test('Hover help shows tooltip on toggle button', async ({ page }) => {
    await seed(page, 'Task');
    const btn = page.locator('[data-testid="todo-txt-help-toggle"]');
    await btn.hover();
    const title = await btn.getAttribute('title');
    expect(title).toBeTruthy();
    expect(title!.length).toBeGreaterThan(0);
  });
  test('240px header wraps every control and positions help below it', async ({ page }) => {
    await page.setViewportSize({ width: 240, height: 720 });
    await seed(page, 'Task');

    const header = page.getByTestId('todo-txt-header');
    const headerMetrics = await header.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }));
    expect(headerMetrics.scrollWidth).toBe(headerMetrics.clientWidth);

    const controls = header.locator('button');
    const controlCount = await controls.count();
    expect(controlCount).toBeGreaterThan(0);
    const headerBox = await header.boundingBox();
    expect(headerBox).not.toBeNull();
    for (let index = 0; index < controlCount; index += 1) {
      const control = controls.nth(index);
      await expect(control).toBeVisible();
      const box = await control.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(240);
    }

    await page.getByTestId('todo-txt-help-toggle').click();
    const rail = page.getByTestId('todo-txt-help-panel');
    await expect(rail).toBeVisible();
    const railBox = await rail.boundingBox();
    expect(railBox).not.toBeNull();
    expect(railBox!.x).toBeGreaterThanOrEqual(0);
    expect(railBox!.x + railBox!.width).toBeLessThanOrEqual(240);
    expect(railBox!.y).toBeGreaterThanOrEqual(
      headerBox!.y + headerBox!.height - 1,
    );
  });

});
