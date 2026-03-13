import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = this.page.locator('input[name="username"], input#username, input[placeholder*="username" i]').first();
    this.passwordInput = this.page.locator('input[type="password"]').first();
    this.loginButton = this.page.locator('button:has-text("Login"), button:has-text("Sign in"), button[type="submit"]').first();
    this.errorMessage = this.page
      .locator('.message.danger, [role="alert"], .error, .alert-danger, .notification-error')
      .first();
  }

  async navigateToLogin() {
    await this.goto('/login');
    await this.usernameInput.waitFor({ state: 'visible', timeout: 30000 });
  }

  async login(username: string, password: string) {
    for (let attempt = 0; attempt < 5; attempt++) {
      if (attempt > 0) {
        await this.page.waitForTimeout(3000 + attempt * 3000);
        await this.navigateToLogin();
      }

      await this.usernameInput.fill(username);
      await this.passwordInput.fill(password);
      await this.loginButton.click();

      await Promise.race([
        this.page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 }).catch(() => null),
        this.errorMessage.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null),
      ]);

      // Login succeeded — navigated away from /login
      if (!this.page.url().includes('/login')) {
        return;
      }

      // Error message visible — login failed as expected, stop retrying
      if (await this.errorMessage.isVisible().catch(() => false)) {
        return;
      }
    }
  }

  async getErrorMessage(): Promise<string> {
    try {
      const isVisible = await this.errorMessage.isVisible({ timeout: 2000 });
      if (isVisible) {
        return (await this.errorMessage.textContent()) || '';
      }
      return '';
    } catch {
      return '';
    }
  }

  async isErrorDisplayed(): Promise<boolean> {
    try {
      return await this.errorMessage.isVisible({ timeout: 2000 });
    } catch {
      return false;
    }
  }
}
