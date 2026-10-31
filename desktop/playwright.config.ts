import { defineConfig } from '@playwright/test';
const port = Number(process.env.TEST_UI_PORT || 5179);
const url = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests/ui',
  use: {
    channel: 'chrome',
    baseURL: url,
    viewport: { width: 1240, height: 840 },
  },
  webServer: {
    env: { TEST_UI_PORT: String(port) },
    command: `node node_modules/vite/bin/vite.js --config vite.renderer.config.mts --host 127.0.0.1 --port ${port} --strictPort`,
    url,
    reuseExistingServer: false,
  },
});
