import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 90_000,
  fullyParallel: true,
  workers: 2,
  reporter: [['list']],
  use: { baseURL: process.env.BASE_URL || 'http://localhost:4311', acceptDownloads: true, trace: 'retain-on-failure' },
  webServer: process.env.BASE_URL ? undefined : { command: 'npx serve out -l 4311 --no-clipboard', url: 'http://localhost:4311', reuseExistingServer: true, timeout: 60_000 },
  projects: [
    { name: 'desktop', testIgnore: /mobile\.spec/, use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'phone', testIgnore: /mobile\.spec/, use: { ...devices['Pixel 7'] } },
    // Phone screen sizes, touch and user agents. iPhones use WebKit (Safari's engine) when PW_WEBKIT=1; Playwright's
    // WebKit build does not launch on every macOS version, so by default they run in Chromium at the same size.
    ...(['iPhone SE', 'iPhone 13 Mini', 'iPhone 15 Pro Max', 'Galaxy S9+', 'Galaxy S8', 'Pixel 7'] as const).map((d) => ({
      name: d, testMatch: /mobile\.spec/,
      use: { ...devices[d], ...(devices[d].defaultBrowserType === 'webkit' && !process.env.PW_WEBKIT ? { browserName: 'chromium' as const, defaultBrowserType: 'chromium' as const } : {}) },
    })),
  ],
});
