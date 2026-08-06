import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { createHash, createHmac, randomBytes } from 'node:crypto';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BACKEND = 'http://127.0.0.1:9199';
const APP_PREFIX = '/apps/todo-txt';

// The per-run proxy secret. `playwright/global-setup.ts` mints one and hands
// it to BOTH the backend process and this dev server; a manual `vite` run
// generates a throwaway (the backend must then be started with the same
// value or every API call 401s — by design, that mirrors production).
const SECRET =
  process.env.KIROCREW_PROXY_SECRET || randomBytes(16).toString('hex');

/**
 * Gateway-faithful API bridge for the e2e harness.
 *
 * The real KiroCrew gateway strips `/apps/todo-txt` and signs every forwarded
 * request with `X-KiroCrew-Proxy: <ts>:<hmac_sha256(secret,
 * "<ts>:<method>:<target>:<sha256(body)>")>` where `target` is the forwarded
 * request-target (`/api/...` + query). The backend fails closed without a
 * valid signature, so a plain vite `server.proxy` entry (which cannot sign)
 * would 401 the whole suite. This middleware buffers the body, signs exactly
 * like `apps/routes.py::handle_app_api_proxy`, and forwards.
 */
function signingApiBridge(): Plugin {
  return {
    name: 'todo-txt-signing-api-bridge',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        if (!url.startsWith(`${APP_PREFIX}/api`)) return next();

        const target = url.slice(APP_PREFIX.length); // "/api/..." + query
        const chunks: Buffer[] = [];
        req.on('data', (c: Buffer) => chunks.push(c));
        req.on('end', async () => {
          const body = Buffer.concat(chunks);
          const ts = Math.floor(Date.now() / 1000).toString();
          const bodyHash = createHash('sha256').update(body).digest('hex');
          const msg = `${ts}:${req.method}:${target}:${bodyHash}`;
          const sig = createHmac('sha256', SECRET).update(msg).digest('hex');
          try {
            const upstream = await fetch(`${BACKEND}${target}`, {
              method: req.method,
              headers: {
                'X-KiroCrew-Proxy': `${ts}:${sig}`,
                ...(req.headers['content-type']
                  ? { 'content-type': String(req.headers['content-type']) }
                  : {}),
              },
              body: body.length > 0 ? body : undefined,
            });
            res.statusCode = upstream.status;
            upstream.headers.forEach((v, k) => {
              if (k !== 'transfer-encoding') res.setHeader(k, v);
            });
            const out = Buffer.from(await upstream.arrayBuffer());
            res.end(out);
          } catch (err) {
            res.statusCode = 502;
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify({ error: `backend unreachable: ${err}` }));
          }
        });
      });
    },
  };
}

export default defineConfig({
  root: __dirname,
  plugins: [react(), signingApiBridge()],
  resolve: {
    alias: {
      '@kirocrew/app-sdk': path.resolve(__dirname, '../tests/stubs/app-sdk.ts'),
    },
  },
  server: {
    port: 5195,
    strictPort: true,
    host: '127.0.0.1',
  },
});
