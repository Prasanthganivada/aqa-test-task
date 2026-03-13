import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : 2,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list']
  ],
  use: {
    baseURL: process.env['BASE_URL'] || 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
  },
  timeout: 90000,
  // Note: webServer is intentionally disabled. 
  // Ensure the application is running on http://localhost:8080 before running tests.
  // You can start it with: docker-compose -f ../application/docker-compose.yml up
  // Or set SKIP_SERVER=true if application is already running
  projects: [
    // Setup project: logs in once and saves auth state for reuse
    {
      name: 'setup',
      testMatch: '**/auth.setup.ts',
    },
    // Auth tests run without saved storageState (they test login/register flows)
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
      testIgnore: ['**/auth.setup.ts', '**/auth.spec.ts', '**/auth.smoke.spec.ts'],
    },
    {
      name: 'chromium-auth',
      use: { ...devices['Desktop Chrome'] },
      testMatch: ['**/auth.spec.ts', '**/smoke/auth.smoke.spec.ts'],
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
      testIgnore: ['**/auth.setup.ts', '**/auth.spec.ts', '**/auth.smoke.spec.ts'],
    },
    {
      name: 'firefox-auth',
      use: { ...devices['Desktop Firefox'] },
      testMatch: ['**/auth.spec.ts', '**/smoke/auth.smoke.spec.ts'],
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
      testIgnore: ['**/auth.setup.ts', '**/auth.spec.ts', '**/auth.smoke.spec.ts'],
    },
    {
      name: 'webkit-auth',
      use: { ...devices['Desktop Safari'] },
      testMatch: ['**/auth.spec.ts', '**/smoke/auth.smoke.spec.ts'],
    },
  ],
});
