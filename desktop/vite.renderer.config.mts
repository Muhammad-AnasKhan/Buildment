import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config
export default defineConfig({
  // UI tests must not rewrite the dependency cache of a running desktop app.
  cacheDir: process.env.TEST_UI_PORT
    ? `node_modules/.vite-tests/${process.env.TEST_UI_PORT}`
    : 'node_modules/.vite',
  plugins: [tailwindcss()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  // The local source package is not prebundled. Explicitly optimize its library
  // dependencies so CommonJS internals never reach the dev browser unchanged.
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'unified',
      'remark-parse',
      'remark-gfm',
      'extend',
      'debug',
      '@base-ui/react/button',
      '@base-ui/react/collapsible',
      '@base-ui/react/slider',
      '@base-ui/react/switch',
      '@base-ui/react/toggle',
      '@base-ui/react/toggle-group',
      'lucide-react',
      'class-variance-authority',
      'clsx',
      'd3-scale',
      'diff',
      'tailwind-merge',
      'zod',
      'use-sync-external-store/shim',
      'use-sync-external-store/shim/with-selector',
      'use-sync-external-store/shim/with-selector.js',
    ],
  },
  // Give Forge and Chromium the same loopback address on Windows.
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    watch: { ignored: ['**/out/**', '**/test-results/**'] },
  },
});
