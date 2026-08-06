import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PIDS_FILE = path.resolve(__dirname, '.pids.json');

function killPid(pid: number) {
  try {
    process.kill(pid, 'SIGTERM');
  } catch { return; }
  setTimeout(() => {
    try { process.kill(pid, 'SIGKILL'); } catch {}
  }, 2000);
}

export default async function globalTeardown() {
  let pids: Record<string, number> = {};
  try {
    pids = JSON.parse(fs.readFileSync(PIDS_FILE, 'utf8'));
  } catch { /* no file */ }

  for (const pid of Object.values(pids)) {
    if (pid) killPid(pid);
  }

  try { fs.unlinkSync(PIDS_FILE); } catch {}
}
