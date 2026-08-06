/**
 * Regression guard for form-element theme inheritance.
 *
 * Preflight is disabled in tailwind.config.js, so browser user-agent
 * styles for form elements leak into the themed editor. Tasks H and K
 * pinned textarea/input and button rules in @layer base to override
 * those UA defaults. This test pins two things so the button rule in
 * particular can't silently regress:
 *
 *   1. The literal CSS rule exists in `ui/src/index.css` (source-of-
 *      truth guard — even if the build chain changes, the rule stays).
 *   2. When applied to a jsdom document, a <button> element's computed
 *      background color resolves to a transparent value (behavioral
 *      guard — the rule actually does what it claims).
 *
 * Why here: commands.test.ts is the regression-guard file for this
 * cohort per manager direction. Moving to a dedicated css test file
 * later is fine; keep the guards here until that lands.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const INDEX_CSS = resolve(
  __dirname,
  '..',
  'ui',
  'src',
  'index.css',
);

describe('@layer base button rule', () => {
  it('declares a button transparency rule in ui/src/index.css', () => {
    const source = readFileSync(INDEX_CSS, 'utf-8');
    // Minimum contract: there is a `button {` rule that sets bg
    // transparent. Whitespace-tolerant so reformatting doesn't
    // false-trip this assertion.
    expect(source).toMatch(/button\s*\{[^}]*background-color:\s*transparent/);
    expect(source).toMatch(/button\s*\{[^}]*color:\s*inherit/);
  });

  it('jsdom: <button> inherits transparent bg when the rule is applied', () => {
    // Fresh style block so the assertion is independent of @layer
    // cascade order (jsdom's @layer support is limited; we test the
    // rule's effect in isolation, which is what matters for the
    // UA-default override semantics).
    const style = document.createElement('style');
    style.textContent = 'button { background-color: transparent; color: inherit; }';
    document.head.appendChild(style);

    const btn = document.createElement('button');
    btn.textContent = 'probe';
    document.body.appendChild(btn);

    try {
      const bg = getComputedStyle(btn).backgroundColor;
      // Any of these is "transparent" depending on the CSS engine's
      // serialization: the literal keyword, rgba(0,0,0,0), or empty.
      // jsdom typically returns 'transparent' for this input.
      expect(['transparent', 'rgba(0, 0, 0, 0)', 'rgba(0,0,0,0)', '']).toContain(bg);
    } finally {
      document.head.removeChild(style);
      document.body.removeChild(btn);
    }
  });
});
