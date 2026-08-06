import { spawn, type ChildProcess } from 'node:child_process';
import * as fs from 'node:fs';
import * as http from 'node:http';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');
const UI_DIR = path.resolve(__dirname, '..');
const PIDS_FILE = path.resolve(__dirname, '.pids.json');

function pollHttp(url: string, timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;
    const attempt = () => {
      if (Date.now() > deadline) {
        reject(new Error(`Timed out waiting for ${url}`));
        return;
      }
      http.get(url, (res) => {
        if (res.statusCode === 200) resolve();
        else setTimeout(attempt, 300);
        res.resume();
      }).on('error', () => setTimeout(attempt, 300));
    };
    attempt();
  });
}

function prefixOutput(proc: ChildProcess, tag: string) {
  proc.stdout?.on('data', (d: Buffer) => {
    for (const line of d.toString().split('\n').filter(Boolean)) {
      process.stdout.write(`[${tag}] ${line}\n`);
    }
  });
  proc.stderr?.on('data', (d: Buffer) => {
    for (const line of d.toString().split('\n').filter(Boolean)) {
      process.stdout.write(`[${tag}] ${line}\n`);
    }
  });
}

export default async function globalSetup() {
  const root = process.env.TODO_TXT_ROOT;
  if (!root) {
    throw new Error('TODO_TXT_ROOT env var is required. Set it to a disposable temp directory.');
  }
  const resolved = path.resolve(root);
  // The app's real data root — the KiroCrew app data dir, which holds the
  // user's actual tasks. Never let a test run point at it.
  const prodRoots = [
    path.resolve(os.homedir(), '.kiro/crew/apps/todo-txt/data'),
  ];
  if (prodRoots.includes(resolved)) {
    throw new Error(
      `Refusing to run: TODO_TXT_ROOT resolves to a real data path (${resolved}). Use a temp directory.`,
    );
  }

  // Seed directory
  fs.mkdirSync(resolved, { recursive: true });
  const todoPath = path.join(resolved, 'todo.txt');
  if (!fs.existsSync(todoPath)) {
    fs.writeFileSync(todoPath, '', 'utf8');
  }

  // Per-run proxy secret: the backend fails closed without one (CWE-306
  // fix), and the vite test config's signing bridge must sign with the SAME
  // value. Mint one here and pass it to both children.
  const proxySecret =
    process.env.KIROCREW_PROXY_SECRET ||
    (await import('node:crypto')).randomBytes(16).toString('hex');
  process.env.KIROCREW_PROXY_SECRET = proxySecret;

  // Spawn backend. `TODO_TXT_PYTHON` selects the interpreter (it must have
  // aiohttp available); defaults to whatever `python3` resolves to.
  const python = process.env.TODO_TXT_PYTHON || 'python3';
  const backend = spawn(python, ['backend/server.py'], {
    cwd: REPO_ROOT,
    env: {
      ...process.env,
      PORT: '9199',
      TODO_TXT_ROOT: resolved,
      LOG_LEVEL: 'WARNING',
      KIROCREW_PROXY_SECRET: proxySecret,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  prefixOutput(backend, 'backend');

  await pollHttp('http://127.0.0.1:9199/health', 15_000);

  // Spawn Vite dev server
  const vite = spawn('npx', ['vite', '--config', 'vite.test.config.ts', '--port', '5195', '--strictPort'], {
    cwd: UI_DIR,
    env: {
      ...process.env,
      TODO_TXT_ROOT: resolved,
      KIROCREW_PROXY_SECRET: proxySecret,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  prefixOutput(vite, 'vite');

  await pollHttp('http://127.0.0.1:5195/', 30_000);

  // Store PIDs
  const pids = { backend: backend.pid, vite: vite.pid };
  fs.writeFileSync(PIDS_FILE, JSON.stringify(pids), 'utf8');
  (globalThis as any).__e2e_pids = pids;

  console.log('E2E harness ready');
}
