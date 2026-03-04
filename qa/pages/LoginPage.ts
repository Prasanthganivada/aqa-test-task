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
    this.loginButton = this.page.locator('button:has-text("Sign in"), button:has-text("Login"), button[type="submit"]').first();
    this.errorMessage = this.page
      .locator('[role="alert"], .error, .alert-danger, .notification-error, :text-matches("wrong username or password", "i")')
      .first();
  }

  async navigateToLogin() {
    await this.goto('/auth/login');
    await this.page.waitForLoadState('load');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();

    await Promise.race([
      this.page.waitForURL(/dashboard|project/i, { timeout: 10000 }).catch(() => null),
      this.errorMessage.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null),
    ]);
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
