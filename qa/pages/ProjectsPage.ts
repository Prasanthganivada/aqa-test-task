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
    this.createProjectButton = this.page.locator('button:has-text("Add"), button:has-text("New"), button:has-text("Create"), button[data-testid="new-project"]').first();
    this.projectNameInput = this.page.locator('input[placeholder*="project" i], input[placeholder*="name" i], input[name="title"]').first();
    this.projectsList = this.page.locator('[data-testid="project-item"], [data-testid="project"], .project-item, li[data-testid*="project"]');
    this.saveButton = this.page.locator('button:has-text("Save"), button:has-text("Create"), button:has-text("Add")').first();
    this.deleteButton = this.page.locator('button:has-text("Delete"), [data-testid="delete"]').first();
    this.editButton = this.page.locator('button:has-text("Edit"), [data-testid="edit"]').first();
    this.logoutButton = this.page.locator('button:has-text("Logout"), a:has-text("Logout"), [data-testid="logout"]').first();
  }

  async navigateToProjects() {
    await this.goto('/');
    await this.page.waitForLoadState('load');
  }

  async createProject(projectName: string) {
    await this.createProjectButton.click();
    await this.projectNameInput.fill(projectName);
    await this.saveButton.click();
    await this.page.waitForTimeout(1000);
  }

  async getProjectByName(name: string): Promise<Locator> {
    return this.page.locator(`text=${name}`).first();
  }

  async clickProject(name: string) {
    const projectElement = await this.getProjectByName(name);
    await projectElement.click();
    await this.page.waitForLoadState('load');
  }

  async deleteProject(name: string) {
    const project = await this.getProjectByName(name);
    await project.hover();
    const deleteBtn = this.page.locator(`[data-testid*="${name.toLowerCase()}"] button:has-text("Delete"), button:has-text("Delete")`).first();
    
    try {
      await deleteBtn.click({ timeout: 5000 });
    } catch {
      // Try alternative delete button
      await this.deleteButton.click();
    }
    
    // Confirm deletion if modal appears
    await this.page.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete")').first().click({ timeout: 5000 }).catch(() => {});
  }

  async getProjectCount(): Promise<number> {
    return this.projectsList.count();
  }

  async logout() {
    await this.logoutButton.click();
    await this.page.waitForLoadState('load');
  }
}
