import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cssInjectedByJs from 'vite-plugin-css-injected-by-js';
import { resolve } from 'path';

export default defineConfig({
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    'process.env': '{}',
  },
  plugins: [
    react(),
    // Inlines the compiled Tailwind CSS into the mjs bundle so the
    // dashboard picks it up automatically on `import()` — no separate
    // <link rel=stylesheet> needed, which prevents Tailwind drift.
    cssInjectedByJs(),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.tsx'),
      formats: ['es'],
      fileName: () => 'index.mjs',
    },
    outDir: './dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      // Host-provided modules — resolved at runtime by the dashboard's
      // import map to /vendor/*.mjs stubs, which re-export from
      // window.__kirocrew_modules.*. NEVER bundle these:
      //   - react / react-dom: bundling creates a duplicate React
      //     instance and breaks hooks across the host-app boundary.
      //   - @kirocrew/app-sdk: its hooks rely on AppApiProvider context
      //     set up by the host; bundling a copy would pull in a stub
      //     with no provider and the hooks would throw.
      //
      // This list is a SUBSET of the host's import map (see
      // `website/vite.config.ts -> appImportMapPlugin` in the KiroCrew
      // repo). Only ids with a /vendor/*.mjs stub may be externalized —
      // externalizing anything else emits a bare specifier the browser
      // cannot resolve. Notably `@tanstack/react-query` IS in the host's
      // window registry (`website/src/app-sdk/shared-modules.ts`) but has
      // NO import-map entry or vendor stub, so it must stay bundled if it
      // is ever used here.
      //
      // `lucide-react` is DELIBERATELY NOT externalized despite having a
      // vendor stub: the stub's *named* exports are a hardcoded ~40-icon
      // subset (static ESM bindings — its Proxy default export cannot
      // satisfy a named import), and this app uses 15 icons outside that
      // list (`Copy`, `Archive`, `ChevronDown`, `NotebookPen`, ...). The
      // live symptom was: "The requested module 'lucide-react' does not
      // provide an export named 'Copy'" and the page failed to mount.
      // Bundling tree-shakes to just the icons we import (~10 kB gzip)
      // and works on any host stub revision. Icons are plain components
      // with no cross-boundary state, so a private copy is safe — unlike
      // react or the SDK.
      external: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        '@kirocrew/app-sdk',
        // Host UI kit. Unused by this app today; kept so a later import
        // resolves through the host instead of silently bundling a copy.
        // The bundle-facing id is `@kirocrew/app-sdk/ui` — `@kirocrew/ui`
        // is only the internal window-registry key.
        '@kirocrew/app-sdk/ui',
      ],
    },
  },
  server: {
    host: '127.0.0.1',
    strictPort: true,
    port: 3102,
  },
});
