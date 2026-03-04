import { Page } from '@playwright/test';

export class TestDataHelper {
  static generateUsername(): string {
    return `testuser_${Date.now()}`;
  }

  static generateEmail(): string {
    return `testuser_${Date.now()}@test.com`;
  }

  static generateProjectName(): string {
    return `Project_${Date.now()}`;
  }

  static generateTaskName(): string {
    return `Task_${Date.now()}`;
  }

  static generateTeamName(): string {
    return `Team_${Date.now()}`;
  }
}

export class NavigationHelper {
  constructor(private page: Page) {}

  async waitForUrlChange(timeout: number = 5000): Promise<void> {
    const currentUrl = this.page.url();
    await this.page.waitForFunction(
      (prevUrl) => window.location.href !== prevUrl,
      currentUrl,
      { timeout }
    );
  }

  async waitForElementToDisappear(selector: string, timeout: number = 5000): Promise<void> {
    await this.page.waitForSelector(selector, { state: 'hidden', timeout });
  }

  async waitForElementToAppear(selector: string, timeout: number = 5000): Promise<void> {
    await this.page.waitForSelector(selector, { state: 'visible', timeout });
  }
}

export class VerificationHelper {
  constructor(private page: Page) {}

  async isErrorDisplayed(): Promise<boolean> {
    const errorSelectors = ['.error', '.alert-danger', '[role="alert"]', '.notification-error'];
    
    for (const selector of errorSelectors) {
      try {
        const isVisible = await this.page.locator(selector).first().isVisible({ timeout: 2000 });
        if (isVisible) return true;
      } catch (error) {
        // Selector not found, continue
      }
    }
    return false;
  }

  async getErrorMessage(): Promise<string> {
    const errorSelectors = ['.error', '.alert-danger', '[role="alert"]', '.notification-error'];
    
    for (const selector of errorSelectors) {
      try {
        const text = await this.page.locator(selector).first().textContent({ timeout: 2000 });
        if (text) return text;
      } catch (error) {
        // Selector not found, continue
      }
    }
    return '';
  }

  async isSuccessDisplayed(): Promise<boolean> {
    const successSelectors = ['.success', '.alert-success', '[role="status"]', '.notification-success'];
    
    for (const selector of successSelectors) {
      try {
        const isVisible = await this.page.locator(selector).first().isVisible({ timeout: 2000 });
        if (isVisible) return true;
      } catch (error) {
        // Selector not found, continue
      }
    }
    return false;
  }
}

export class PerformanceHelper {
  constructor(private page: Page) {}

  async measureNetworkActivity(callback: () => Promise<void>): Promise<number> {
    const startTime = Date.now();
    await callback();
    return Date.now() - startTime;
  }

  async getPageLoadTime(): Promise<number> {
    const navigationTiming = await this.page.evaluate(() => {
      const timing = window.performance.timing;
      return timing.loadEventEnd - timing.navigationStart;
    });
    return navigationTiming;
  }
}
