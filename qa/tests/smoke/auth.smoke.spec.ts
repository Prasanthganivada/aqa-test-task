import { test, expect } from '../../fixtures/test-fixtures';

test.describe('User Authentication - Smoke Tests', () => {
  test('should navigate to login page', async ({ loginPage }) => {
    await loginPage.navigateToLogin();
    expect(loginPage.usernameInput).toBeDefined();
    expect(loginPage.passwordInput).toBeDefined();
  });

  test('should navigate to register page', async ({ registerPage }) => {
    await registerPage.navigateToRegister();
    expect(registerPage.usernameInput).toBeDefined();
    expect(registerPage.emailInput).toBeDefined();
  });

  test('should display error on invalid login', async ({ loginPage }) => {
    await loginPage.navigateToLogin();
    await loginPage.login('invaliduser', 'wrongpassword');
    await expect(loginPage.errorMessage).toBeVisible({ timeout: 10000 });
  });
});
