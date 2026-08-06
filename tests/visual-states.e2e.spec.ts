import { expect, test, type Page } from '@playwright/test';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import {
  editorLocator,
  expectEditorValue,
  selectEditorLine,
} from './e2e/codemirror';

const ROOT = process.env.TODO_TXT_ROOT!;

const LIGHT_THEME = {
  '--bg': '#f8fafc',
  '--bg-elevated': '#ffffff',
  '--bg-hover': '#e2e8f0',
  '--bg-accent': '#f1f5f9',
  '--text': '#111827',
  '--muted': '#475569',
  '--muted-strong': '#334155',
  '--border': '#cbd5e1',
  '--border-strong': '#94a3b8',
  '--accent': '#b45309',
  '--accent-subtle': '#fef3c7',
  '--ok': '#15803d',
  '--warn': '#b45309',
  '--danger': '#b91c1c',
};

const CRT_THEME = {
  '--bg': '#071a0b',
  '--bg-elevated': '#0a2410',
  '--bg-hover': '#123a1a',
  '--bg-accent': '#0c2d13',
  '--text': '#8cff9b',
  '--muted': '#5cab68',
  '--muted-strong': '#78d986',
  '--border': '#245c2e',
  '--border-strong': '#3f8a4d',
  '--accent': '#f6ff75',
  '--accent-subtle': '#2b3210',
  '--ok': '#73ff8b',
  '--warn': '#ffe66d',
  '--danger': '#ff7b7b',
};

async function seed(page: Page, content: string): Promise<void> {
  await fs.writeFile(path.join(ROOT, 'todo.txt'), content, 'utf8');
  await fs.rm(path.join(ROOT, 'done.txt'), { force: true });
  await fs.rm(path.join(ROOT, 'report.txt'), { force: true });
  await page.goto('/');
  await expect(editorLocator(page)).toBeVisible();
  await expectEditorValue(page, content);
}

async function applyTheme(
  page: Page,
  theme: Record<string, string>,
): Promise<void> {
  await page.evaluate((tokens) => {
    for (const [name, value] of Object.entries(tokens)) {
      document.documentElement.style.setProperty(name, value);
    }
  }, theme);
}

async function computedColor(
  page: Page,
  selector: string,
  property: 'backgroundColor' | 'color' | 'borderTopColor',
): Promise<string> {
  return page.locator(selector).evaluate(
    (element, prop) => getComputedStyle(element)[prop],
    property,
  );
}

test.describe('visual release states', () => {
  test('light and CRT tokens render, hover responds, and AMOLED stays dark-only', async ({
    page,
  }) => {
    await seed(page, 'Theme verification');
    const app = page.getByTestId('todo-txt-page');

    await applyTheme(page, LIGHT_THEME);
    await expect
      .poll(() => computedColor(page, '[data-testid="todo-txt-page"]', 'backgroundColor'))
      .toBe('rgb(248, 250, 252)');
    await expect
      .poll(() => computedColor(page, '[data-testid="todo-txt-page"]', 'color'))
      .toBe('rgb(17, 24, 39)');

    await page.getByTestId('todo-txt-help-toggle').click();
    const rail = page.getByTestId('todo-txt-help-panel');
    await expect(rail).toBeVisible();
    await expect
      .poll(() =>
        computedColor(page, '[data-testid="todo-txt-help-panel"]', 'backgroundColor'),
      )
      .toBe('rgb(248, 250, 252)');
    await page.getByTestId('todo-txt-help-close').click();

    await applyTheme(page, CRT_THEME);
    await expect
      .poll(() => computedColor(page, '[data-testid="todo-txt-page"]', 'backgroundColor'))
      .toBe('rgb(7, 26, 11)');
    await expect
      .poll(() => computedColor(page, '[data-testid="todo-txt-page"]', 'color'))
      .toBe('rgb(140, 255, 155)');

    const helpToggle = page.getByTestId('todo-txt-help-toggle');
    await helpToggle.hover();
    await expect
      .poll(() =>
        computedColor(page, '[data-testid="todo-txt-help-toggle"]', 'backgroundColor'),
      )
      .toBe('rgb(18, 58, 26)');

    await page.getByTestId('todo-txt-amoled-toggle').click();
    await expect(app).toHaveAttribute('data-amoled', 'true');
    await expect
      .poll(() => computedColor(page, '[data-testid="todo-txt-page"]', 'backgroundColor'))
      .toBe('rgb(0, 0, 0)');

    await applyTheme(page, LIGHT_THEME);
    await expect(app).not.toHaveAttribute('data-amoled');
    await expect
      .poll(() => computedColor(page, '[data-testid="todo-txt-page"]', 'backgroundColor'))
      .toBe('rgb(248, 250, 252)');
  });

  test('Alt-drag exposes the multi-selection badge', async ({ page }) => {
    await page.setViewportSize({ width: 640, height: 480 });
    await seed(page, 'alpha one\nbeta two\ngamma three');

    const lines = editorLocator(page).locator(':scope > .cm-line');
    const first = await lines.nth(0).boundingBox();
    const third = await lines.nth(2).boundingBox();
    expect(first).not.toBeNull();
    expect(third).not.toBeNull();

    await page.keyboard.down('Alt');
    await page.mouse.move(first!.x + 4, first!.y + first!.height / 2);
    await page.mouse.down();
    await page.mouse.move(third!.x + 44, third!.y + third!.height / 2, {
      steps: 12,
    });
    await page.mouse.up();
    await page.keyboard.up('Alt');

    const count = page.getByTestId('todo-txt-selection-count');
    await expect(count).toBeVisible();
    await expect(count).toContainText('3 selections');
  });

  test('lower-line selection flips the popover above and focus uses accent', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 640, height: 360 });
    const content = Array.from({ length: 8 }, (_, index) => `Line ${index + 1}`).join(
      '\n',
    );
    await seed(page, content);
    await applyTheme(page, CRT_THEME);

    const selectedLine = editorLocator(page).locator(':scope > .cm-line').nth(7);
    const lineBox = await selectedLine.boundingBox();
    expect(lineBox).not.toBeNull();
    await selectEditorLine(page, 8);

    const dialog = page.getByRole('dialog', {
      name: 'Todo-txt selection actions',
    });
    await expect(dialog).toBeVisible();
    const dialogBox = await dialog.boundingBox();
    expect(dialogBox).not.toBeNull();
    expect(dialogBox!.y + dialogBox!.height).toBeLessThanOrEqual(
      lineBox!.y + 1,
    );

    const prompt = page.getByTestId('todo-txt-selection-prompt');
    const borderBefore = await prompt.evaluate(
      (element) => getComputedStyle(element).borderTopColor,
    );
    await prompt.focus();
    await expect(prompt).toBeFocused();
    await expect
      .poll(() =>
        prompt.evaluate((element) => getComputedStyle(element).borderTopColor),
      )
      .toBe('rgb(246, 255, 117)');
    expect(borderBefore).not.toBe('rgb(246, 255, 117)');
  });
});
