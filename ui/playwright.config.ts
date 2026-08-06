import { defineConfig } from '@playwright/test';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  testDir: path.resolve(__dirname, '../tests'),
  testMatch: /.*\.e2e\.spec\.ts$/,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5195',
    trace: 'retain-on-failure',
    actionTimeout: 5_000,
    navigationTimeout: 10_000,
    // Workaround: mise's node injects its own (ancient) libstdc++ via
    // LD_LIBRARY_PATH, which lacks GLIBCXX_3.4.29 required by playwright's
    // bundled chromium. Prepend system lib dirs so ld.so picks the newer
    // libstdc++.so.6 first.
    launchOptions: {
      env: {
        ...process.env,
        LD_LIBRARY_PATH: '/usr/lib64:/lib64:' + (process.env.LD_LIBRARY_PATH ?? ''),
      } as Record<string, string>,
    },
  },
  globalSetup: path.resolve(__dirname, './playwright/global-setup.ts'),
  globalTeardown: path.resolve(__dirname, './playwright/global-teardown.ts'),
});
