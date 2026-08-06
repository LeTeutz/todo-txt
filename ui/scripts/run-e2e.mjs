import { spawn } from 'node:child_process';
import { existsSync, symlinkSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const uiDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(uiDir, '..');
const playwrightCli = path.join(
  uiDir,
  'node_modules',
  '@playwright',
  'test',
  'cli.js',
);

// The e2e specs live in `<repo>/tests/`, OUTSIDE `ui/`, so Node's upward
// module walk from a spec never reaches `ui/node_modules` and the very first
// `import '@playwright/test'` fails. Vitest solves this with config aliases;
// Playwright's loader has no equivalent, so ensure a root-level symlink once
// per run. Gitignored (node_modules/), safe to re-create, and a no-op when a
// real directory already exists.
const rootLink = path.join(repoRoot, 'node_modules');
if (!existsSync(rootLink)) {
  symlinkSync(path.join(uiDir, 'node_modules'), rootLink, 'junction');
}

const disposableRoot = await mkdtemp(
  path.join(os.tmpdir(), 'todo-txt-e2e-'),
);

try {
  const exitCode = await new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [
        playwrightCli,
        'test',
        '--config=playwright.config.ts',
        ...process.argv.slice(2),
      ],
      {
        cwd: uiDir,
        env: { ...process.env, TODO_TXT_ROOT: disposableRoot },
        stdio: 'inherit',
      },
    );

    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (signal) {
        console.error(`Playwright exited after signal ${signal}`);
        resolve(1);
        return;
      }
      resolve(code ?? 1);
    });
  });

  process.exitCode = exitCode;
} finally {
  await rm(disposableRoot, { recursive: true, force: true });
}
