import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config
export default defineConfig({
  plugins: [tailwindcss()],
  // Give Forge and Chromium the same loopback address on Windows.
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    watch: { ignored: ['**/out/**', '**/test-results/**'] },
  },
});
