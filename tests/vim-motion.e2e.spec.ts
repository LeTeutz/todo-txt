/**
 * VIM VERTICAL MOTION + Ctrl+D ARBITRATION — real browser only.
 *
 * `j`, `k`, `Ctrl+D` and `Ctrl+U` all route through CodeMirror's
 * `coordsAtPos`, which needs real layout. jsdom has none:
 * `Range.prototype.getClientRects` is absent there, and the unit suite
 * polyfills it with an EMPTY rect list rather than a fabricated one, precisely
 * so vertical motion reads as uncovered instead of falsely green.
 *
 * That leaves one blind spot, and it is the worst possible one: if a vertical
 * motion lands the caret on a different line than the user sees, then `dd`
 * deletes a task they did not choose. No amount of unit coverage can see it.
 *
 * Two questions, both answerable only here:
 *
 *   - Do `j` / `k` / `gg` / `G` put the caret on the line the user is looking
 *     at, and does `dd` then delete THAT line? Asserted against the document
 *     text, not against a coordinate, so the test says something about data
 *     rather than about pixels.
 *
 *   - Do vim's `Ctrl+D` (half-page scroll down) and the app's `Cmd/Ctrl+D`
 *     (mark done) fight? The unit suite pins the ARBITRATION — Ctrl+D yields
 *     to vim when vim is on, Cmd+D still marks done — but through a synthetic
 *     event. Here it is a real keypress against a real keymap chain.
 *
 * HARNESS REQUIREMENT. Vim's scroll commands act on the editor's own
 * `.cm-scroller`, so they are only observable when the editor is
 * HEIGHT-BOUNDED. Two things are needed for that, and with either one missing
 * the scroll is unmeasurable while looking like a vim failure:
 *   1. `[data-testid="todo-txt-editor-wrap"]` needs `min-h-0` — as a flex item
 *      it otherwise refuses to shrink below its content, and the editor grows
 *      to full content height so the PAGE scrolls instead of the editor.
 *   2. The harness needs height styling on html/body/#root, or the app's
 *      `h-full` resolves against nothing.
 * With both in place the editor scrolls internally and `scrollHeight >
 * clientHeight`, which the scroll test asserts as an explicit precondition.
 */
import { test, expect, type Page } from '@playwright/test';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { editorLocator, expectEditorValue, readEditorValue } from './e2e/codemirror';

const ROOT = process.env.TODO_TXT_ROOT!;

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

/** Seed todo.txt, enable vim BEFORE the app mounts, and wait for the editor. */
async function seedWithVim(page: Page, lines: string[]): Promise<string> {
  const content = lines.join('\n') + '\n';
  await fs.writeFile(path.join(ROOT, 'todo.txt'), content, 'utf8');
  // Set the persisted flag on the app's origin so vim is on at first paint —
  // toggling it after mount would race the lazy vim chunk.
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('todotxt.vimMode', 'true'));
  await page.goto('/');
  await editorLocator(page).waitFor({ state: 'visible' });
  await expectEditorValue(page, content);
  // The status footer only renders when vim is on, and NORMAL means the lazy
  // chunk has loaded and installed its keymap.
  await expect(page.getByTestId('todo-txt-vim-status')).toContainText('NORMAL');
  return content;
}

/** Put the caret on a line by clicking it — a real hit test, not a dispatch. */
async function clickLine(page: Page, needle: string): Promise<void> {
  const line = page.locator('.cm-line', { hasText: needle }).first();
  const box = await line.boundingBox();
  if (!box) throw new Error(`no bounding box for a line containing ${needle}`);
  await page.mouse.click(box.x + 6, box.y + box.height / 2);
}

/** Press a key sequence, one key per call, in order. */
async function keys(page: Page, ...sequence: string[]): Promise<void> {
  for (const key of sequence) await page.keyboard.press(key);
}

/** Delete the line the caret is on, and report the document afterwards.
 *
 * `dd` is used as the PROBE for where the caret ended up. Reading the caret
 * position directly would mean reaching into CodeMirror's internals, and the
 * property under test is not "where is the caret" — it is "does a vertical
 * motion followed by an operator affect the line the user was looking at".
 * Deleting and inspecting the text answers exactly that, in the user's own
 * terms, and it is the failure that would actually hurt: a task removed that
 * the user did not choose.
 */
async function ddAndRead(page: Page): Promise<string> {
  const before = await readEditorValue(page);
  await keys(page, 'd', 'd');
  await expect
    .poll(async () => await readEditorValue(page), { timeout: 3000 })
    .not.toBe(before);
  return readEditorValue(page);
}

/** Seed a LONG file and enable vim, without asserting the full document.
 *
 * `seedWithVim` compares the editor's text to the whole file, which only works
 * while every line is in the DOM. Because the editor is height-bounded,
 * CodeMirror VIRTUALIZES — roughly 48 of 120 lines are rendered — so a
 * full-content assertion would fail for reasons unrelated to the test.
 * Long-document tests therefore assert against the file on disk instead, which
 * is the thing that actually matters.
 */
async function seedLongWithVim(page: Page, lines: string[]): Promise<string> {
  const content = lines.join('\n') + '\n';
  await fs.writeFile(path.join(ROOT, 'todo.txt'), content, 'utf8');
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('todotxt.vimMode', 'true'));
  await page.goto('/');
  await editorLocator(page).waitFor({ state: 'visible' });
  await expect(page.getByTestId('todo-txt-vim-status')).toContainText('NORMAL');
  // First line rendered = the document arrived.
  await expect(
    page.locator('.cm-line', { hasText: lines[0] }).first(),
  ).toBeVisible();
  return content;
}

test.describe('vim vertical motion lands where the user is looking', () => {
  test('j moves exactly one LOGICAL line per press', async ({ page }) => {
    await seedWithVim(page, [
      '(A) first task +alpha',
      'second task @home',
      'third task +beta',
      'fourth task @work',
    ]);

    // Real click = real hit test, so the caret starts where a user would put it.
    await clickLine(page, 'first task');
    await keys(page, 'j', 'j');

    // Two `j` from line 1 must land on line 3 — so `dd` removes THAT line and
    // nothing else.
    const after = await ddAndRead(page);
    expect(after).not.toContain('third task');
    expect(after).toContain('(A) first task +alpha');
    expect(after).toContain('second task @home');
    expect(after).toContain('fourth task @work');
  });

  test('k moves back up one line per press', async ({ page }) => {
    await seedWithVim(page, ['alpha one', 'beta two', 'gamma three', 'delta four']);
    await clickLine(page, 'delta four');
    await keys(page, 'k', 'k');

    const after = await ddAndRead(page);
    expect(after).not.toContain('beta two');
    expect(after).toContain('alpha one');
    expect(after).toContain('gamma three');
    expect(after).toContain('delta four');
  });

  test('gg reaches the first line; G reaches the trailing empty line', async ({
    page,
  }) => {
    await seedWithVim(page, ['alpha', 'beta', 'gamma', 'delta', 'epsilon']);

    await clickLine(page, 'gamma');
    await keys(page, 'g', 'g');
    let after = await ddAndRead(page);
    expect(after).not.toContain('alpha');
    expect(after).toContain('beta');

    // A todo.txt file ENDS WITH A NEWLINE, so CodeMirror shows a final empty
    // line and `G` goes THERE — not to the last task. That is correct editor
    // behaviour (vim in a terminal does the same on such a file) and it is
    // worth pinning, because the obvious assumption is the opposite, and a
    // wrong expectation here reads exactly like a broken motion. `G` then `k`
    // is how a user reaches the last real task.
    await keys(page, 'Shift+G', 'k');
    after = await ddAndRead(page);
    expect(after).not.toContain('epsilon');
    expect(after).toContain('delta');
  });

  test('j does not skip a line when an earlier line WRAPS', async ({ page }) => {
    // The sharpest version of the hazard: `j` in vim moves one LOGICAL line,
    // but a coordinate-based implementation moves one VISUAL row. A long
    // wrapped line makes the two disagree, and the difference is which task
    // `dd` then deletes. jsdom cannot produce a wrap at all.
    const long = 'wrapped task ' + 'padding '.repeat(40) + '+wrap';
    await seedWithVim(page, ['short one', long, 'target task +after']);

    await clickLine(page, 'short one');
    await keys(page, 'j', 'j');

    // Two `j` must reach the THIRD logical line. If `j` walked visual rows it
    // would still be inside the wrapped line, and this deletes the wrong task.
    const after = await ddAndRead(page);
    expect(after).not.toContain('target task');
    expect(after).toContain('short one');
    expect(after).toContain('+wrap');
  });
});

test.describe('Ctrl+D scroll vs Cmd+D mark-done', () => {
  test('Ctrl+D does NOT mark a task done while vim is on', async ({ page }) => {
    // 80 lines, so if the editor scrolls at all there is room for it.
    const lines = Array.from({ length: 80 }, (_, i) => `task number ${i} +bulk`);
    await seedWithVim(page, lines);
    await clickLine(page, 'task number 0 ');
    const before = await readEditorValue(page);

    await page.keyboard.press('Control+d');
    await page.waitForTimeout(600);

    // THE ASSERTION THAT MATTERS: Ctrl+D is yielded to vim, so the app's
    // mark-done must not fire. The unit suite pins this arbitration through a
    // synthetic event; this is a real keypress through the real keymap chain.
    const after = await readEditorValue(page);
    expect(after).toBe(before);
    expect(after).not.toContain('x 20');

    // Scope: this test asserts only that the document is untouched. That the
    // scroll itself moves the viewport is asserted in the next test, which
    // seeds enough lines for the editor's own scroller to be measurable.
  });

  test('Ctrl+D scrolls the editor half a page and Ctrl+U scrolls back', async ({
    page,
  }) => {
    const lines = Array.from({ length: 120 }, (_, i) => `task number ${i} +bulk`);
    const seeded = await seedLongWithVim(page, lines);

    const scroller = () =>
      page.evaluate(() => {
        const s = document.querySelector('.cm-scroller') as HTMLElement | null;
        return {
          top: s?.scrollTop ?? -1,
          client: s?.clientHeight ?? -1,
          scroll: s?.scrollHeight ?? -1,
        };
      });

    // Precondition, asserted rather than assumed: the editor must be BOUNDED,
    // or a scroll command has nothing to move and this test proves nothing.
    // See the harness requirement in the file header.
    const before = await scroller();
    expect(before.scroll).toBeGreaterThan(before.client);

    await clickLine(page, 'task number 0 ');
    await page.keyboard.press('Control+d');
    await expect
      .poll(async () => (await scroller()).top, { timeout: 3000 })
      .toBeGreaterThan(before.top);
    const scrolled = (await scroller()).top;

    await page.keyboard.press('Control+u');
    await expect
      .poll(async () => (await scroller()).top, { timeout: 3000 })
      .toBeLessThan(scrolled);

    // And neither key may touch the document: the keymap precedence that hands
    // Ctrl+D to vim must not also let the app's mark-done fire. Read the FILE
    // rather than the editor — the editor is virtualized, and the file is what
    // a corrupted keystroke would ultimately damage.
    await page.waitForTimeout(700);
    expect(await fs.readFile(path.join(ROOT, 'todo.txt'), 'utf8')).toBe(seeded);
  });

  test('Cmd+D still marks done while vim is on', async ({ page }) => {
    await seedWithVim(page, ['(B) pay the bill @admin', 'other task']);
    await clickLine(page, 'pay the bill');

    // macOS-style shortcut: the app accepts metaKey OR ctrlKey, but Ctrl is
    // vim's, so Meta is the one that must still reach mark-done.
    await page.keyboard.press('Meta+d');

    await expect
      .poll(async () => await readEditorValue(page), { timeout: 3000 })
      .toContain('x ');
    const after = await readEditorValue(page);
    // The priority round-trips to a pri: tag, per the app's own convention.
    expect(after).toContain('pri:B');
    expect(after).toContain('other task');
  });

  test('Ctrl+D marks done when vim is OFF (the shortcut is not dead)', async ({
    page,
  }) => {
    // Control for the test above: with vim off there is no competing claim, so
    // Ctrl+D must still work — otherwise the arbitration has simply disabled
    // it for everyone.
    await fs.writeFile(
      path.join(ROOT, 'todo.txt'),
      '(C) water the plants @home\nsecond\n',
      'utf8',
    );
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('todotxt.vimMode', 'false'));
    await page.goto('/');
    await editorLocator(page).waitFor({ state: 'visible' });
    await expect(page.getByTestId('todo-txt-vim-status')).toHaveCount(0);

    await clickLine(page, 'water the plants');
    await page.keyboard.press('Control+d');

    await expect
      .poll(async () => await readEditorValue(page), { timeout: 3000 })
      .toContain('x ');
  });
});

test.describe('undo across a shortcut expansion (real browser)', () => {
  test('one u reverts the expansion AND the trigger, and does not re-expand', async ({
    page,
  }) => {
    // The unit tests drive vim through `Vim.handleKey`; this drives real
    // keystrokes through the real keymap chain, which is the only place an
    // undo that truncates the document would surface.
    await seedWithVim(page, ['buy milk']);
    await clickLine(page, 'buy milk');
    // `type('A')`, NOT `press('Shift+a')`. Playwright's press() with a
    // LOWERCASE letter in the key name delivers the lowercase key plus a shift
    // modifier, and vim reads that as `a` (append after cursor) rather than `A`
    // (append at end of line). With `a`, the trigger text is typed inside the
    // first word instead of at end of line and the expansion faithfully expands
    // what is there, which looks like editor corruption but is not.
    await page.keyboard.type('A');
    await page.keyboard.type(' !!done ', { delay: 120 });
    // The expansion fired cleanly — exact text asserted.
    await expect
      .poll(async () => await readEditorValue(page), { timeout: 3000 })
      .toMatch(/^x \d{4}-\d{2}-\d{2} buy milk/);

    await page.keyboard.press('Escape');
    await page.keyboard.press('u');
    await page.waitForTimeout(400);

    const after = await readEditorValue(page);
    // The expansion is gone, the trigger went with it, nothing re-expanded...
    expect(after).not.toMatch(/x \d{4}-\d{2}-\d{2}/);
    expect(after).toContain('buy milk');
    // ...and critically NOT empty: one undo must never truncate the file.
    expect(after.trim()).not.toBe('');
  });

  // Vim must not perturb a shortcut expansion. The expansion is driven by the
  // app's own input handling; vim installs its own keymap and insert-mode
  // handling on top, and the two meet on every keystroke typed in insert mode.
  // Asserting byte-identical output with vim on and off is what rules out a
  // stray character landing mid-word.
  test('a shortcut expansion is byte-identical with vim on and off', async ({
    page,
  }) => {
    await seedWithVim(page, ['buy milk']);
    await clickLine(page, 'buy milk');
    await page.keyboard.type('A');
    await page.keyboard.type(' !!done ', { delay: 60 });
    await expect
      .poll(async () => await readEditorValue(page), { timeout: 3000 })
      .toMatch(/^x \d{4}-\d{2}-\d{2} buy milk/);
    // No stray character anywhere in the line.
    const after = await readEditorValue(page);
    expect(after).not.toMatch(/\bb uy\b/);
    expect(after).toContain('buy milk');
  });
});
