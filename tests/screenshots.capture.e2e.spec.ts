/**
 * P7b — store screenshot capture.
 *
 * Produces the three PNGs used on the app's store/registry page:
 *
 *   ui/brand/screenshots/editor.png   — seeded list, syntax highlighting,
 *                                       overdue due: red + due-today amber,
 *                                       an active @work filter chip
 *   ui/brand/screenshots/palette.png  — command palette open, "filter " typed
 *   ui/brand/screenshots/popover.png  — line selected, selection popover open
 *
 * This spec is a *capture* job, not an assertion suite: it asserts only
 * enough to guarantee the frame is the intended state (never a blank or
 * half-mounted page) before writing the file.
 *
 * Run (from `ui/`):
 *
 *   TODO_TXT_PYTHON=~/.kiro/crew/workspace/.venv-appdev/bin/python \
 *   npm run test:e2e -- screenshots.capture
 *
 * Isolation: reuses the standard harness contract — `TODO_TXT_ROOT` is a
 * disposable temp dir minted by `ui/scripts/run-e2e.mjs`, and
 * `playwright/global-setup.ts` hard-refuses to run against a real data root.
 */

import { expect, test, type Page } from '@playwright/test';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { editorLocator, expectEditorValue, selectEditorLine } from './e2e/codemirror';

const ROOT = process.env.TODO_TXT_ROOT!;

// Playwright transpiles specs to CJS, so `import.meta.url` is unavailable
// here — `__dirname` (this file's dir, `<repo>/tests`) is the portable anchor.
const SHOTS_DIR = path.resolve(__dirname, '../ui/brand/screenshots');

/** Store frames are captured at a fixed 16:10 size for consistent crops. */
const VIEWPORT = { width: 1280, height: 800 };

/** localStorage key read by `loadStoredFilter()` (utils/filterExpr.ts). */
const FILTER_STORAGE_KEY = 'todo-txt.filter.v1';

/**
 * HOST theme tokens, HARVESTED from the live dashboard (not invented):
 * getComputedStyle(document.documentElement) on http://127.0.0.1:5476 with
 * the user's active theme `amoled-midnight-dark` (2026-08-05). The first
 * capture of these frames synthesized a plausible-looking palette instead —
 * missing `--mono`/`--border-strong` made borders fall back to currentColor
 * (the "white boxes"), fonts fall back to the browser serif, and the accent
 * render amber instead of the real violet. If the store look drifts, re-run
 * the harvest (read-only page load + computed-style dump) and paste here.
 */
const DARK_THEME: Record<string, string> = {
  '--bg': '#000000',
  '--bg-elevated': '#121214',
  '--bg-hover': '#1a1a1d',
  '--bg-accent': '#09090b',
  '--text': '#d4d4d8',
  '--text-strong': '#ffffff',
  '--muted': '#6b6b72',
  '--muted-strong': '#a1a1aa',
  '--border': '#1a1a1d',
  '--border-strong': '#27272a',
  '--accent': '#7c73e6',
  '--accent-subtle': 'rgba(124,115,230,.12)',
  '--ok': '#10b981',
  '--warn': '#f59e0b',
  '--danger': '#ef4444',
  '--mono':
    "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace",
  '--font-body':
    "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
};

/**
 * The dashboard loads its fonts from Google Fonts; the bare harness page
 * loads nothing, so without this the mono stack falls through to
 * ui-monospace and the frames render in the wrong face. Same URL the
 * dashboard's index.html preloads.
 */
const FONTS_CSS_URL =
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap';

/** Local-time YYYY-MM-DD, offset by `days`. Never `toISOString()` (UTC). */
function localDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

/**
 * Seed content. Dates are computed relative to the run date so line 1 is
 * always overdue (red) and line 2 always due today (amber) — a hardcoded
 * 2026-08-04/05 pair would silently lose both decorations tomorrow.
 */
function seedContent(): string {
  return [
    `(A) Ship the release notes +todotxt @work due:${localDate(-1)}`,
    `(B) Review staged AI edit +todotxt @work due:${localDate(0)}`,
    'Water the plants @home rec:3d',
    `x ${localDate(-4)} Draft store page copy +todotxt`,
    'Renew passport t:2026-12-01 rec:+10y @errands',
    `Call the bank @phone due:${localDate(7)}`,
  ].join('\n');
}

/**
 * Write the seed to the disposable root, optionally pre-seed localStorage
 * (must happen BEFORE load — the filter chip only renders if the stored
 * expression is present at mount), then load and wait for real content.
 */
async function open(page: Page, opts: { filter?: string } = {}): Promise<string> {
  const content = seedContent();
  await fs.writeFile(path.join(ROOT, 'todo.txt'), content, 'utf8');
  await fs.rm(path.join(ROOT, 'done.txt'), { force: true });
  await fs.rm(path.join(ROOT, 'report.txt'), { force: true });

  await page.setViewportSize(VIEWPORT);
  await page.addInitScript(
    ({ theme, filterKey, filter, fontsCssUrl }) => {
      const apply = () => {
        const root = document.documentElement;
        if (!root) return;
        for (const [name, value] of Object.entries(theme)) {
          root.style.setProperty(name, value);
        }
        root.style.colorScheme = 'dark';
        // The bare vite harness page gives `#root` no height, so the app
        // collapses to its content height and the frame letterboxes in white.
        // The real dashboard mounts it into a full-height flex container;
        // reproduce that here so the capture fills the viewport.
        const id = 'p7b-capture-layout';
        if (!document.getElementById(id)) {
          const style = document.createElement('style');
          style.id = id;
          style.textContent =
            'html,body{height:100%;margin:0;background:var(--bg)}' +
            '#root{height:100%;display:flex;flex-direction:column}' +
            '#root>*{flex:1 1 auto;min-height:0}';
          (document.head ?? root).appendChild(style);
        }
        // Real fonts, same source as the dashboard's index.html.
        const fid = 'p7b-capture-fonts';
        if (fontsCssUrl && !document.getElementById(fid)) {
          const link = document.createElement('link');
          link.id = fid;
          link.rel = 'stylesheet';
          link.href = fontsCssUrl;
          (document.head ?? root).appendChild(link);
        }
      };
      if (filter) {
        try {
          localStorage.setItem(filterKey, filter);
        } catch {
          /* storage unavailable — chip simply will not render */
        }
      }
      // Init scripts run at document_start, where `documentElement` can still
      // be null — so hook DOMContentLoaded FIRST (an early throw inside
      // `apply()` would otherwise skip the registration and lose the theme
      // entirely), then attempt an immediate pass for the already-parsed case.
      document.addEventListener('DOMContentLoaded', apply);
      apply();
    },
    { theme: DARK_THEME, filterKey: FILTER_STORAGE_KEY, filter: opts.filter ?? '', fontsCssUrl: FONTS_CSS_URL },
  );

  await page.goto('/');
  await expect(editorLocator(page)).toBeVisible();
  await expectEditorValue(page, content);
  // Guard the capture setup itself: if the init script's theme/layout pass is
  // lost, the frames silently letterbox in white instead of failing.
  await expect
    .poll(() =>
      page.evaluate(() => getComputedStyle(document.body).backgroundColor),
    )
    .toBe('rgb(0, 0, 0)');
  // Let the syntax/due decorations and any web font settle before capture.
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  return content;
}

/** Write the frame and fail loudly on a blank/undersized capture. */
async function capture(page: Page, name: string): Promise<void> {
  const file = path.join(SHOTS_DIR, name);
  await page.screenshot({ path: file });
  const { size } = await fs.stat(file);
  expect(size, `${name} looks like a blank frame (${size} bytes)`).toBeGreaterThan(
    20 * 1024,
  );
}

test.beforeAll(async () => {
  await fs.mkdir(SHOTS_DIR, { recursive: true });
});

test.describe('store screenshots', () => {
  test('editor.png — highlighting, due tints, active filter chip', async ({ page }) => {
    await open(page, { filter: '@work' });

    // The chip is the whole point of the pre-seeded localStorage: assert it
    // rendered rather than shipping a frame that silently lost the state.
    const chip = page.getByTestId('todo-txt-filter-chip');
    await expect(chip).toBeVisible();
    await expect(page.getByTestId('todo-txt-filter-chip-expr')).toContainText('@work');

    await capture(page, 'editor.png');
  });

  test('palette.png — command palette open with "filter " typed', async ({ page }) => {
    await open(page);

    const palette = page.locator('[data-testid="command-palette"]');
    const editor = editorLocator(page);

    // The palette listener is scoped to in-app focus: a keypress delivered to
    // the bare document does nothing. Click the editor first, then try
    // Control+K (accepted on every platform) and Meta+K (macOS habit).
    await editor.click();
    for (const combo of ['Control+K', 'Meta+K', 'Control+K'] as const) {
      await page.keyboard.press(combo);
      if (await palette.isVisible().catch(() => false)) break;
      await page.waitForTimeout(250);
    }

    const search = page.locator('[data-testid="command-palette-search"]');
    if (await palette.isVisible().catch(() => false)) {
      await expect(search).toBeFocused();
      await search.fill('filter ');
      await page.waitForTimeout(300);
    } else {
      // Documented fallback: capture the help rail instead, so the run still
      // produces three usable frames. Reported as a deviation.
      test.info().annotations.push({
        type: 'deviation',
        description: 'command palette never opened; captured help rail instead',
      });
      await page.getByTestId('todo-txt-help-toggle').click();
      await expect(page.getByTestId('todo-txt-help-panel')).toBeVisible();
      await page.waitForTimeout(300);
    }

    await capture(page, 'palette.png');
  });

  test('popover.png — selection popover on a real task line', async ({ page }) => {
    await open(page);

    // Line 2 is the due-today task, so the popover sits over decorated text.
    await selectEditorLine(page, 2);
    await expect(
      page.getByRole('dialog', { name: 'Todo-txt selection actions' }),
    ).toBeVisible();
    await page.waitForTimeout(300);

    await capture(page, 'popover.png');
  });
});
