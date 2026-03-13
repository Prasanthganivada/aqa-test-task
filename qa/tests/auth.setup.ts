import { test as setup, } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

const testUser = {
  username: 'testuser123',
  password: 'TestPassword123!',
};

setup('authenticate', async ({ page }) => {
  // Navigate to login page
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.locator('#username').waitFor({ state: 'visible', timeout: 30000 });

  // Fill in credentials and login
  await page.locator('#username').fill(testUser.username);
  await page.locator('#password').fill(testUser.password);
  await page.locator('button:has-text("Login")').first().click();

  // Wait for successful navigation away from login
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });

  // Save the authenticated state
  await page.context().storageState({ path: authFile });
});
