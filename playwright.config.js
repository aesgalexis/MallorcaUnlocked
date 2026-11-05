import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  expect: { timeout: 10000 },
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173/MallorcaUnlocked/',
    channel: process.env.MALLORCA_BROWSER_CHANNEL || undefined,
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: { args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] },
  },
  webServer: {
    command: 'node scripts/serve.mjs --dist --port 4173 --base /MallorcaUnlocked/',
    url: 'http://127.0.0.1:4173/MallorcaUnlocked/',
    reuseExistingServer: !process.env.CI,
    timeout: 15000,
  },
});
