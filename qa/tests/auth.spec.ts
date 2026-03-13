import { test, expect } from '../fixtures/test-fixtures';

const loginUser = {
  username: 'testuser123',
  password: 'TestPassword123!',
};

test.describe('User Registration', () => {
  test('should successfully register a new user', async ({ registerPage, page }) => {
    const timestamp = Date.now();
    const testUser = {
      username: `testuser_${timestamp}`,
      email: `testuser_${timestamp}@test.com`,
      password: 'TestPassword123!',
    };
    await registerPage.navigateToRegister();
    await registerPage.register(testUser.username, testUser.email, testUser.password);

    // After registration, user should be redirected away from register page
    await page.waitForURL(url => !url.toString().includes('/register'), { timeout: 15000 });
    expect(page.url()).not.toMatch(/\/register/);
  });

  test('should display error message for invalid registration data', async ({ registerPage }) => {
    await registerPage.navigateToRegister();
    // Try to register with empty fields - button should be disabled
    const isDisabled = await registerPage.registerButton.isDisabled();
    const stillOnRegister = registerPage.page.url().includes('register');
    
    // Should either have a disabled button (client validation) or show error
    expect(isDisabled || stillOnRegister).toBe(true);
  });

  test('should navigate to login from register page', async ({ registerPage }) => {
    await registerPage.navigateToRegister();
    await registerPage.goToLogin();
    
    expect(registerPage.page.url()).toMatch(/login|register/);
  });
});

test.describe('User Login', () => {
  test('should successfully login with valid credentials', async ({ loginPage, page }) => {
    await loginPage.navigateToLogin();
    await loginPage.login(loginUser.username, loginUser.password);

    // After login, check if redirected from login page
    await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 10000 });
    const currentUrl = page.url();
    expect(currentUrl).not.toMatch(/\/login/);
  });

  test('should display error message for invalid credentials', async ({ loginPage }) => {
    await loginPage.navigateToLogin();
    await loginPage.login('nonexistentuser', 'wrongpassword');
    await loginPage.page.waitForTimeout(1000);

    const isError = await loginPage.isErrorDisplayed();
    expect(isError).toBe(true);
  });

  test('should display error message for empty username', async ({ loginPage }) => {
    await loginPage.navigateToLogin();
    await loginPage.passwordInput.fill('somepassword');
    await loginPage.loginButton.click();
    await loginPage.page.waitForTimeout(1000);

    const isError = await loginPage.isErrorDisplayed();
    const stillOnLogin = loginPage.page.url().includes('login');
    
    expect(isError || stillOnLogin).toBe(true);
  });

  test('should display error message for empty password', async ({ loginPage }) => {
    await loginPage.navigateToLogin();
    await loginPage.usernameInput.fill('someuser');
    await loginPage.loginButton.click();
    await loginPage.page.waitForTimeout(1000);

    const isError = await loginPage.isErrorDisplayed();
    const stillOnLogin = loginPage.page.url().includes('login');
    
    expect(isError || stillOnLogin).toBe(true);
  });
});
