import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProjectsPage extends BasePage {
  readonly createProjectButton: Locator;
  readonly projectNameInput: Locator;
  readonly projectsList: Locator;
  readonly saveButton: Locator;
  readonly deleteButton: Locator;
  readonly editButton: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.createProjectButton = this.page.locator('a:has-text("New project")').first();
    this.projectNameInput = this.page.locator('input[name="projectTitle"]');
    this.projectsList = this.page.locator('a[href^="/projects/"][class*="list-menu-link"], a[href^="/projects/"][class*="project-button"]');
    this.saveButton = this.page.locator('button:has-text("Create")').first();
    this.deleteButton = this.page.locator('button:has-text("Delete")').first();
    this.editButton = this.page.locator('button:has-text("Edit")').first();
    this.logoutButton = this.page.locator('a:has-text("Logout"), button:has-text("Logout")').first();
  }

  /** Dismiss any modal/notification overlay that might block interactions */
  private async dismissOverlays() {
    await this.page.keyboard.press('Escape').catch(() => {});
    await this.page.waitForTimeout(300);
    // Wait for notification to disappear
    await this.page.locator('.vue-notification-group .notification-content').waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
  }

  async navigateToProjects() {
    await this.goto('/projects');
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(2000);
  }

  async createProject(projectName: string) {
    // If still on login page, login wasn't successful — wait and retry navigation
    if (this.page.url().includes('/login')) {
      await this.page.waitForTimeout(5000);
    }
    await this.navigateToProjects();
    await this.dismissOverlays();
    await this.createProjectButton.waitFor({ state: 'visible', timeout: 15000 });
    await this.createProjectButton.click();
    await this.page.waitForURL('**/projects/new');
    await this.projectNameInput.fill(projectName);
    await this.saveButton.click();
    await this.page.waitForURL(/\/projects\/\d+/, { timeout: 15000 });
    await this.page.waitForTimeout(1000);
    await this.dismissOverlays();
  }

  async getProjectByName(name: string): Promise<Locator> {
    return this.page.locator(`a:has-text("${name}")`).first();
  }

  async clickProject(name: string) {
    await this.dismissOverlays();
    const projectLink = this.page.locator(`a:has-text("${name}")`).first();
    await projectLink.click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(2000);
  }

  async deleteProject(name: string) {
    await this.clickProject(name);
    await this.page.waitForURL(/\/projects\/\d+/);
    // Open project settings dropdown (ellipsis button)
    await this.page.locator('.project-title-button').click();
    await this.page.waitForTimeout(500);
    // Click delete in the dropdown
    await this.page.locator('button:has-text("Delete"), a:has-text("Delete"), span:has-text("Delete")').first().click();
    await this.page.waitForTimeout(500);
    // Confirm deletion
    await this.page.locator('button.is-danger, button:has-text("Do it")').first().click({ timeout: 5000 });
    await this.page.waitForTimeout(1000);
    await this.dismissOverlays();
  }

  async getProjectCount(): Promise<number> {
    return this.projectsList.count();
  }

  async logout() {
    await this.dismissOverlays();
    await this.page.locator('.username-dropdown-trigger').click();
    await this.page.locator('a:has-text("Logout"), button:has-text("Logout")').first().click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
