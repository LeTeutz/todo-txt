import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Visual-validation harness build — bundles React (standalone page has no
// host import map). Output goes to dist-harness/, never shipped.
export default defineConfig({
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': '{}',
  },
  plugins: [react()],
  build: {
    outDir: './dist-harness',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'harness.html'),
    },
  },
});
