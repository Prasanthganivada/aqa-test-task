import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class RegisterPage extends BasePage {
  readonly usernameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly registerButton: Locator;
  readonly signInLink: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = this.page.locator('input[name="username"], input#username, input[placeholder*="username" i]').first();
    this.emailInput = this.page.locator('input[type="email"], input#email, input[placeholder*="email" i]').first();
    this.passwordInput = this.page.locator('input[type="password"]').first();
    this.confirmPasswordInput = this.page.locator('input[type="password"]').nth(1);
    this.registerButton = this.page.locator('button:has-text("Create account"), button:has-text("Register"), button:has-text("Sign up"), button[type="submit"]').first();
    this.signInLink = this.page.locator('a:has-text("Login"), a:has-text("Sign in"), a:has-text("Back to login")').first();
    this.errorMessage = this.page.locator('.message.danger, [role="alert"], .error, .alert-danger, .notification-error').first();
  }

  async navigateToRegister() {
    await this.goto('/register');
    await this.usernameInput.waitFor({ state: 'visible', timeout: 30000 });
  }

  async register(username: string, email: string, password: string) {
    await this.usernameInput.fill(username);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.registerButton.click();
    // Wait for navigation away from register page or error message
    await Promise.race([
      this.page.waitForURL(url => !url.toString().includes('/register'), { timeout: 10000 }),
      this.errorMessage.waitFor({ state: 'visible', timeout: 10000 }),
    ]).catch(() => {});
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

  async goToLogin() {
    await this.signInLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
