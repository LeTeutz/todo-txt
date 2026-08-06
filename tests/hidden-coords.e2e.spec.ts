/**
 * Real-browser checks that jsdom structurally cannot make.
 *
 * Two properties depend on real layout, so a headless DOM cannot cover them:
 *
 * 1. COORDINATE MAPPING OVER `display: none` LINES.
 *    `hidden hide` hides h:1 lines with a CodeMirror LINE decoration carrying
 *    `display: none`. CM6's documented way to remove a line from view is a
 *    block `Decoration.replace`, and the height map is what click-to-caret
 *    (`posAtCoords`), `coordsAtPos` and `scrollIntoView` all consult. If
 *    `display: none` desynchronises that map, a click on a line BELOW a
 *    hidden one lands the caret on the wrong line — and
 *    `captureCodeMirrorSelection` calls `coordsAtPos`, whose null return
 *    silently suppresses the selection popover. jsdom has no layout, so only
 *    a real browser can answer this.
 *
 * 2. THE AI EDIT PATH, END TO END.
 *    The popover's "Just do it ▸" feeds `pendingComments` → Submit All →
 *    POST /api/ai-edit → staged diff modal. Unit tests pin each hop
 *    (tests/PopoverAiRouting.test.tsx, tests/TodoTxtPage.staging.test.tsx),
 *    but the popover needs real selection geometry to appear at all, so the
 *    seam between them is only observable here.
 */
import { test, expect, type Page } from '@playwright/test';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import {
  editorLocator,
  expectEditorValue,
  readEditorValue,
  selectEditorLine,
} from './e2e/codemirror';

const ROOT = process.env.TODO_TXT_ROOT!;

/** Same hard guard the other destructive specs use. */
test.beforeAll(() => {
  if (!ROOT) throw new Error('TODO_TXT_ROOT must be set for e2e runs');
  const home = process.env.HOME ?? '';
  const forbidden = [
    path.join(home, '.kiro/crew/apps/todo-txt/data'),
  ];
  const resolved = path.resolve(ROOT);
  for (const bad of forbidden) {
    if (resolved === path.resolve(bad)) {
      throw new Error(`refusing to run e2e against the real data root: ${ROOT}`);
    }
  }
});

async function seed(page: Page, lines: string[]): Promise<void> {
  const content = lines.join('\n') + '\n';
  await fs.writeFile(path.join(ROOT, 'todo.txt'), content, 'utf8');
  await page.goto('/');
  await editorLocator(page).waitFor({ state: 'visible' });
  await expectEditorValue(page, content);
}

/** Run a palette command the way a user does (focus first — the shortcut is
 *  scoped to in-app focus so it cannot shadow the dashboard launcher). */
async function runCommand(page: Page, command: string): Promise<void> {
  await editorLocator(page).focus();
  await page.keyboard.press('Control+K');
  const search = page.locator('[data-testid="command-palette-search"]');
  await expect(search).toBeFocused();
  await search.fill(command);
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-testid="command-palette"]')).toBeHidden();
}

/** Select one editor line and wait for the popover, using the same helper
 *  every other popover spec relies on. A hand-rolled mouse drag does NOT
 *  reliably open the popover in this harness (CodeMirror's own selection
 *  handling swallows it), so this is the proven path — and it keeps the
 *  test honest about what it is measuring: the popover's readiness, not
 *  Playwright's drag emulation. */
async function selectLineAndOpenPopover(
  page: Page,
  lineIdx1Based: number,
): Promise<void> {
  await editorLocator(page).waitFor({ state: 'visible' });
  await page
    .getByTestId('todo-txt-selection-popover-portal')
    .waitFor({ state: 'hidden', timeout: 2000 })
    .catch(() => {});
  await page.evaluate(
    () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
  );
  await selectEditorLine(page, lineIdx1Based);
  await page
    .getByRole('dialog', { name: 'Todo-txt selection actions' })
    .waitFor({ state: 'visible', timeout: 5000 });
}

test.describe('hidden lines and coordinate mapping', () => {
  test('clicking a line below a hidden one puts the caret on THAT line', async ({
    page,
  }) => {
    await seed(page, [
      'alpha first task',
      'secret middle task h:1',
      'gamma last task',
    ]);
    await runCommand(page, 'hidden hide');

    // The hidden line must genuinely be out of view, or this proves nothing
    // about the height map.
    const hidden = page.locator('.cm-line', { hasText: 'secret middle task' });
    const hiddenBox = await hidden.first().boundingBox();
    expect(hiddenBox === null || hiddenBox.height === 0).toBe(true);

    // Click into the LAST line, which sits below the collapsed one.
    const gamma = page.locator('.cm-line', { hasText: 'gamma last task' }).first();
    const box = await gamma.boundingBox();
    if (!box) throw new Error('no box for the gamma line');
    await page.mouse.click(box.x + 10, box.y + box.height / 2);
    await page.keyboard.press('End');
    await page.keyboard.type('!MARK');

    const text = await readEditorValue(page);
    expect(text).toContain('gamma last task!MARK');
    // The hidden line is untouched and the click did not land above it.
    expect(text).toContain('secret middle task h:1');
    expect(text).not.toContain('alpha first task!MARK');
    expect(text).not.toContain('secret middle task h:1!MARK');
  });

  test('a selection popover opens on a line below a hidden one', async ({
    page,
  }) => {
    await seed(page, [
      'alpha first task',
      'secret middle task h:1',
      '(A) gamma last task +proj',
    ]);
    await runCommand(page, 'hidden hide');
    // line 3 in the document — the one below the collapsed line
    await selectLineAndOpenPopover(page, 3);

    // A desynced height map makes coordsAtPos return null, which silently
    // suppresses the popover — exactly the failure this asserts against.
    // Convention from popover.e2e.spec.ts: the portal is a zero-size wrapper
    // (assert ATTACHED); the dialog inside it is what is visible.
    await expect(
      page.getByTestId('todo-txt-selection-popover-portal'),
    ).toBeAttached();
    await expect(
      page.getByRole('dialog', { name: 'Todo-txt selection actions' }),
    ).toBeVisible();
  });

  test('a hidden line is revealed while a selection covers it', async ({
    page,
  }) => {
    await seed(page, [
      'alpha first task',
      'secret middle task h:1',
      'gamma last task',
    ]);
    await runCommand(page, 'hidden hide');

    // A selection spanning a hidden line would let destructive actions
    // rewrite it unseen. The exemption must put it back on screen.
    await editorLocator(page).click();
    // ControlOrMeta: plain Control+A is beginning-of-line on macOS.
    await page.keyboard.press('ControlOrMeta+a');

    const hidden = page.locator('.cm-line', { hasText: 'secret middle task' });
    await expect(hidden.first()).toBeVisible();
    const box = await hidden.first().boundingBox();
    expect(box?.height ?? 0).toBeGreaterThan(0);
  });
});

test.describe('AI edit path — popover to pending comment', () => {
  test('"Just do it" stages a pending comment', async ({
    page,
  }) => {
    await seed(page, [
      '(A) ship the feature +kirocrew @work due:2026-05-10',
      'water the plants @home',
    ]);
    await selectLineAndOpenPopover(page, 1);

    // Convention from popover.e2e.spec.ts: the portal is a zero-size wrapper
    // (assert ATTACHED); the dialog inside it is what is visible.
    await expect(
      page.getByTestId('todo-txt-selection-popover-portal'),
    ).toBeAttached();
    await expect(
      page.getByRole('dialog', { name: 'Todo-txt selection actions' }),
    ).toBeVisible();
    await page.getByTestId('todo-txt-selection-prompt').fill('add a +release tag');
    await page.getByTestId('todo-txt-just-do-it').click();

    // The comment must land in the pending list: this click is the only
    // producer for `pendingComments`, and the staged-edit modal is
    // unreachable without one.
    await expect(page.getByTestId('todo-txt-pending-comments')).toBeVisible();
    await expect(page.getByTestId('todo-txt-pending-count')).toContainText('1');
    // And it must NOT navigate away: leaving for /chat here would strand
    // `pendingComments` with no producer at all. The e2e harness serves the app
    // at the root, so assert the absence of a chat route plus the editor still
    // being mounted.
    expect(page.url()).not.toContain('/chat');
    await expect(editorLocator(page)).toBeVisible();
  });

  test('"Ask in chat" remains available as the separate handoff', async ({
    page,
  }) => {
    await seed(page, ['review quarterly goals +work @planning']);
    await selectLineAndOpenPopover(page, 1);

    // Convention from popover.e2e.spec.ts: the portal is a zero-size wrapper
    // (assert ATTACHED); the dialog inside it is what is visible.
    await expect(
      page.getByTestId('todo-txt-selection-popover-portal'),
    ).toBeAttached();
    await expect(
      page.getByRole('dialog', { name: 'Todo-txt selection actions' }),
    ).toBeVisible();
    await page.getByTestId('todo-txt-selection-prompt').fill('what next?');
    const chatButton = page.getByTestId('todo-txt-ask-in-chat');
    await expect(chatButton).toBeVisible();
    await expect(chatButton).toBeEnabled();
    // Deliberately not clicked: the SDK launcher navigates out of the app
    // under test, which would end the run rather than assert anything.
  });
});
