import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProjectDetailPage extends BasePage {
  readonly createTaskButton: Locator;
  readonly taskInput: Locator;
  readonly tasksList: Locator;
  readonly saveButton: Locator;
  readonly deleteTaskButton: Locator;
  readonly backButton: Locator;
  readonly projectTitle: Locator;

  constructor(page: Page) {
    super(page);
    this.createTaskButton = this.page.locator('button:has-text("Add Task"), button:has-text("New Task"), button[data-testid="add-task"], button:has-text("Add")').first();
    this.taskInput = this.page.locator('input[placeholder*="task" i], input[placeholder*="title" i], input[name="title"]').first();
    this.tasksList = this.page.locator('[data-testid="task-item"], [data-testid="task"], .task-item, li[role="listitem"], li[data-testid*="task"]');
    this.saveButton = this.page.locator('button:has-text("Save"), button:has-text("Add"), button[type="submit"]').first();
    this.deleteTaskButton = this.page.locator('button:has-text("Delete Task"), button:has-text("Delete"), [data-testid="delete-task"]').first();
    this.backButton = this.page.locator('button:has-text("Back"), a:has-text("Back"), [data-testid="back"]').first();
    this.projectTitle = this.page.locator('h1, h2, .project-title, [data-testid="project-title"]').first();
  }

  async createTask(taskName: string) {
    try {
      await this.createTaskButton.click({ timeout: 5000 });
    } catch (error) {
      // Try alternative selectors
      const altButton = this.page.locator('button:has-text("New")').first();
      await altButton.click({ timeout: 5000 }).catch(() => {});
    }
    
    await this.taskInput.fill(taskName);
    await this.saveButton.click();
    await this.page.waitForTimeout(500);
  }

  async completeTask(taskName: string) {
    // Find the task row and its checkbox
    const taskRow = this.page.locator(`text="${taskName}"`).first();
    const checkbox = taskRow.locator('../..//input[type="checkbox"], ../input[type="checkbox"], input[type="checkbox"]').first();
    
    try {
      await checkbox.check({ timeout: 5000 });
    } catch {
      // Try alternative approach - find checkbox near task text
      const allCheckboxes = this.page.locator('input[type="checkbox"]');
      for (let i = 0; i < await allCheckboxes.count(); i++) {
        const checkbox = allCheckboxes.nth(i);
        const parent = checkbox.locator('..');
        const text = await parent.textContent();
        if (text?.includes(taskName)) {
          await checkbox.check();
          break;
        }
      }
    }
    
    await this.page.waitForTimeout(500);
  }

  async getTaskByName(name: string): Promise<Locator> {
    return this.page.locator(`text="${name}"`).first();
  }

  async deleteTask(name: string) {
    const task = await this.getTaskByName(name);
    await task.hover();
    
    try {
      await this.deleteTaskButton.click({ timeout: 5000 });
    } catch {
      // Try alternative delete button
      const deleteBtn = task.locator('../..//button:has-text("Delete"), ../button:has-text("Delete")').first();
      await deleteBtn.click({ timeout: 5000 }).catch(() => {});
    }
    
    // Confirm deletion if modal appears
    await this.page.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete")').first().click({ timeout: 5000 }).catch(() => {});
  }

  async getTaskCount(): Promise<number> {
    return this.tasksList.count();
  }

  async goBack() {
    await this.backButton.click();
    await this.page.waitForLoadState('load');
  }
}
