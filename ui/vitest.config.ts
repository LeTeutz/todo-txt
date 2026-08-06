/**
 * Vitest config — staging-only.
 *
 * Previous cohorts authored unit tests under `tests/` with vitest imports
 * but never wired a runner. Added here so tests can
 * actually run. Component tests use jsdom; pure-logic tests use the node
 * default.
 *
 * Module resolution:
 *   - root = ui/ so node_modules here is the primary resolution base
 *   - tests live at ../tests/ but resolve their imports (react, RTL, etc)
 *     against ui/node_modules/ via explicit aliases, because they are
 *     outside the ui/ package boundary and Node's upward walk won't find
 *     ui/node_modules from ../tests/
 */
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const UI_DIR = __dirname;
const REPO_ROOT = resolve(UI_DIR, '..');
const NODE_MODULES = resolve(UI_DIR, 'node_modules');

export default defineConfig({
  plugins: [react()],
  root: UI_DIR,
  resolve: {
    alias: {
      // Pin these to ui/node_modules so tests under ../tests/ resolve
      // them (they're outside the ui/ package, so upward walk fails).
      react: resolve(NODE_MODULES, 'react'),
      'react-dom': resolve(NODE_MODULES, 'react-dom'),
      'react-dom/client': resolve(NODE_MODULES, 'react-dom/client.js'),
      'react/jsx-runtime': resolve(NODE_MODULES, 'react/jsx-runtime.js'),
      'react/jsx-dev-runtime': resolve(NODE_MODULES, 'react/jsx-dev-runtime.js'),
      '@testing-library/react': resolve(NODE_MODULES, '@testing-library/react'),
      '@testing-library/jest-dom': resolve(NODE_MODULES, '@testing-library/jest-dom'),
      '@testing-library/user-event': resolve(NODE_MODULES, '@testing-library/user-event'),
      '@testing-library/dom': resolve(NODE_MODULES, '@testing-library/dom'),
      '@kirocrew/app-sdk': resolve(REPO_ROOT, 'tests/stubs/app-sdk.ts'),
      'lucide-react': resolve(NODE_MODULES, 'lucide-react'),
      diff: resolve(NODE_MODULES, 'diff'),
      // Same upward-walk problem as the entries above. Without these,
      // ../tests/CmEditor.multicursor.test.tsx and
      // ../tests/SelectionPopover.responsive.test.tsx fail to COLLECT
      // (vitest reports 2 failed files, 0 failed tests), which is easy to
      // misread as a broken suite rather than a resolution gap.
      '@codemirror/state': resolve(NODE_MODULES, '@codemirror/state'),
      '@codemirror/view': resolve(NODE_MODULES, '@codemirror/view'),
      postcss: resolve(NODE_MODULES, 'postcss'),
      tailwindcss: resolve(NODE_MODULES, 'tailwindcss'),
    },
  },
  server: {
    fs: {
      allow: [REPO_ROOT],
      strict: false,
    },
  },
  test: {
    environment: 'jsdom',
    globals: false,
    include: [
      resolve(REPO_ROOT, 'tests/**/*.test.{ts,tsx}'),
      resolve(UI_DIR, 'src/**/*.test.{ts,tsx}'),
    ],
    // Playwright e2e specs are driven by `playwright test`, not vitest.
    exclude: ['**/node_modules/**', '**/*.e2e.spec.ts'],
  },
});
