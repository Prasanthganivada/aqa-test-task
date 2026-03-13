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
    this.createTaskButton = this.page.locator('button.add-task-button');
    this.taskInput = this.page.locator('.add-task-textarea');
    this.tasksList = this.page.locator('.tasks .task');
    this.saveButton = this.page.locator('button.add-task-button');
    this.deleteTaskButton = this.page.locator('button:has-text("Delete")').first();
    this.backButton = this.page.locator('a:has-text("Back"), button:has-text("Back")').first();
    this.projectTitle = this.page.locator('.project-title-button, h1').first();
  }

  /** Dismiss any modal/notification overlay that might block interactions */
  private async dismissOverlays() {
    await this.page.keyboard.press('Escape').catch(() => {});
    await this.page.waitForTimeout(300);
    await this.page.locator('.vue-notification-group .notification-content').waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
  }

  async createTask(taskName: string) {
    await this.dismissOverlays();
    await this.taskInput.fill(taskName);
    // Wait for Add button to become enabled after text is entered
    await this.page.locator('button.add-task-button:not([disabled])').waitFor({ state: 'visible', timeout: 5000 });
    await this.createTaskButton.click();
    await this.page.waitForTimeout(500);
  }

  async completeTask(taskName: string) {
    await this.dismissOverlays();
    const taskRow = this.page.locator(`.task:has-text("${taskName}")`).first();
    const doneToggle = taskRow.locator('.fancycheckbox, input[type="checkbox"], [class*="check"]').first();
    await doneToggle.click();
    await this.page.waitForTimeout(500);
  }

  async getTaskByName(name: string): Promise<Locator> {
    return this.page.locator(`.task:has-text("${name}"), a:has-text("${name}")`).first();
  }

  async deleteTask(name: string) {
    await this.dismissOverlays();
    // Click on the task to open its detail view
    const taskLink = this.page.locator(`.task:has-text("${name}") a, a:has-text("${name}")`).first();
    await taskLink.click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(2000);

    // In task detail, click delete
    const deleteBtn = this.page.locator('button:has-text("Delete"), a:has-text("Delete")').first();
    await deleteBtn.click({ timeout: 5000 });

    // Confirm
    await this.page.locator('button.is-danger, button:has-text("Do it"), button:has-text("Confirm")').first().click({ timeout: 5000 }).catch(() => {});
    await this.page.waitForTimeout(500);
  }

  async getTaskCount(): Promise<number> {
    return this.tasksList.count();
  }

  async goBack() {
    await this.dismissOverlays();
    await this.page.goBack();
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(1000);
  }
}
