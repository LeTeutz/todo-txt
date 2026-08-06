import { expect, type Locator, type Page } from '@playwright/test';

const EDITOR_SELECTOR = '[data-testid="todo-txt-textarea"]';

export function editorLocator(page: Page): Locator {
  return page.locator(EDITOR_SELECTOR);
}

export async function readEditorValue(page: Page): Promise<string> {
  return editorLocator(page).evaluate((element) => {
    const lines = Array.from(
      element.querySelectorAll<HTMLElement>(':scope > .cm-line'),
    );
    return lines
      .map((line) => {
        const clone = line.cloneNode(true) as HTMLElement;
        clone.querySelectorAll('.cm-placeholder').forEach((node) => node.remove());
        return (clone.textContent ?? '').replace(/\u00a0/g, ' ');
      })
      .join('\n');
  });
}

export async function expectEditorValue(
  page: Page,
  expected: string,
  timeout = 5_000,
): Promise<void> {
  await expect
    .poll(() => readEditorValue(page), { timeout })
    .toBe(expected);
}

export async function fillEditor(page: Page, value: string): Promise<void> {
  const editor = editorLocator(page);
  await editor.waitFor({ state: 'visible' });
  await editor.fill(value);
  await expectEditorValue(page, value);
}

export async function selectEditorLine(
  page: Page,
  lineIndexOneBased: number,
): Promise<void> {
  const editor = editorLocator(page);
  await editor.waitFor({ state: 'visible' });
  await editor.focus();
  await editor.evaluate((element, lineIndex) => {
    const line = element.querySelectorAll<HTMLElement>(':scope > .cm-line')[
      lineIndex - 1
    ];
    if (!line) throw new Error(`Editor line ${lineIndex} does not exist`);

    element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    const range = document.createRange();
    range.selectNodeContents(line);
    const selection = window.getSelection();
    if (!selection) throw new Error('Window selection is unavailable');
    selection.removeAllRanges();
    selection.addRange(range);
    document.dispatchEvent(new Event('selectionchange', { bubbles: true }));
    element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  }, lineIndexOneBased);
  await page.evaluate(
    () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
  );
}

export async function selectedEditorText(page: Page): Promise<string> {
  return page.evaluate(() => window.getSelection()?.toString() ?? '');
}
