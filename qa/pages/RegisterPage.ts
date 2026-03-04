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
    this.registerButton = this.page.locator('button:has-text("Register"), button:has-text("Sign up"), button[type="submit"]').first();
    this.signInLink = this.page.locator('a:has-text("Sign in"), a:has-text("Login"), a:has-text("Back to login")').first();
    this.errorMessage = this.page.locator('[role="alert"], .error, .alert-danger, .notification-error').first();
  }

  async navigateToRegister() {
    await this.goto('/auth/register');
    await this.page.waitForLoadState('load');
  }

  async register(username: string, email: string, password: string) {
    await this.usernameInput.fill(username);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(password);
    await this.registerButton.click();
    // Wait for navigation or error message
    await this.page.waitForFunction(() => {
      const url = window.location.href;
      return url.includes('login') || url.includes('error') || url.includes('dashboard');
    }, { timeout: 10000 }).catch(() => {});
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
    await this.page.waitForLoadState('load');
  }
}
