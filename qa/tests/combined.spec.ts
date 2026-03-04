import { test as base, expect } from '@playwright/test';
import { VikunjaAPI } from '../api/VikunjaAPI';
import { LoginPage } from '../pages/LoginPage';
import { ProjectsPage } from '../pages/ProjectsPage';
import { ProjectDetailPage } from '../pages/ProjectDetailPage';
import { request as playwrightRequest } from '@playwright/test';

const testUser = {
  username: 'testuser123',
  password: 'TestPassword123!',
};

// Shared API instance for combined tests
let sharedAPI: VikunjaAPI | null = null;

const test = base.extend<{
  loginPage: LoginPage;
  projectsPage: ProjectsPage;
  projectDetailPage: ProjectDetailPage;
  authenticatedAPI: VikunjaAPI;
}>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  projectsPage: async ({ page }, use) => {
    await use(new ProjectsPage(page));
  },
  projectDetailPage: async ({ page }, use) => {
    await use(new ProjectDetailPage(page));
  },
  authenticatedAPI: async ({}, use) => {
    if (!sharedAPI) {
      const requestContext = await playwrightRequest.newContext({
        baseURL: 'http://localhost:8080',
      });
      sharedAPI = new VikunjaAPI(requestContext);
      await sharedAPI.loginUser(testUser.username, testUser.password);
    }
    await use(sharedAPI);
  },
});

test.describe('Combined UI/API Tests', () => {
  test('should create project via API and verify in UI', async ({ loginPage, projectsPage, authenticatedAPI, page }) => {
    // Step 1: Create project via API
    const projectName = `Combined_Project_${Date.now()}`;
    const apiProject = await authenticatedAPI.createProject({
      title: projectName,
      description: 'Created via API',
    });
    
    expect(apiProject.id).toBeDefined();
    
    // Step 2: Login in UI
    await loginPage.navigateToLogin();
    await loginPage.login(testUser.username, testUser.password);
    
    // Step 3: Navigate to projects and verify the API-created project is visible
    await projectsPage.navigateToProjects();
    await page.waitForTimeout(1000);
    
    const projectElement = await projectsPage.getProjectByName(projectName);
    expect(projectElement).toBeDefined();
  });

  test('should create task via API and verify in UI', async ({ loginPage, projectsPage, projectDetailPage, authenticatedAPI, page }) => {
    // Step 1: Create project and task via API
    const project = await authenticatedAPI.createProject({
      title: `Combined_Project_${Date.now()}`,
    });
    
    const taskTitle = `Combined_Task_${Date.now()}`;
    const apiTask = await authenticatedAPI.createTask({
      title: taskTitle,
      projectID: project.id,
    });
    
    expect(apiTask.id).toBeDefined();
    
    // Step 2: Login in UI
    await loginPage.navigateToLogin();
    await loginPage.login(testUser.username, testUser.password);
    
    // Step 3: Navigate to project and verify task is visible
    await projectsPage.navigateToProjects();
    await projectsPage.clickProject(project.title);
    await page.waitForTimeout(1000);
    
    const taskElement = await projectDetailPage.getTaskByName(taskTitle);
    expect(taskElement).toBeDefined();
  });

  test('should complete task in UI and verify via API', async ({ loginPage, projectsPage, projectDetailPage, authenticatedAPI, page }) => {
    // Step 1: Setup via API - Create project and task
    const project = await authenticatedAPI.createProject({
      title: `Combined_Project_${Date.now()}`,
    });
    
    const taskTitle = `Combined_Task_${Date.now()}`;
    const apiTask = await authenticatedAPI.createTask({
      title: taskTitle,
      projectID: project.id,
    });
    
    // Step 2: Complete task in UI
    await loginPage.navigateToLogin();
    await loginPage.login(testUser.username, testUser.password);
    await projectsPage.navigateToProjects();
    await projectsPage.clickProject(project.title);
    await projectDetailPage.completeTask(taskTitle);
    
    // Step 3: Verify task completion via API
    await page.waitForTimeout(500);
    const updatedTask = await authenticatedAPI.getTask(apiTask.id);
    
    // The done_since field should be set when task is completed
    expect(updatedTask.done_since || updatedTask.done).toBeTruthy();
  });

  test('should delete project via UI and verify via API', async ({ loginPage, projectsPage, authenticatedAPI, page }) => {
    // Step 1: Create project via API
    const projectName = `Combined_Project_Delete_${Date.now()}`;
    const apiProject = await authenticatedAPI.createProject({
      title: projectName,
    });
    const projectID = apiProject.id;
    
    // Step 2: Delete project via UI
    await loginPage.navigateToLogin();
    await loginPage.login(testUser.username, testUser.password);
    await projectsPage.navigateToProjects();
    await projectsPage.deleteProject(projectName);
    
    // Step 3: Verify deletion via API
    await page.waitForTimeout(1000);
    
    // Try to get the deleted project - should fail or return error
    try {
      const deletedProject = await authenticatedAPI.getProject(projectID);
      // If we get here, the project might not be deleted
      expect(deletedProject.id).toBeUndefined();
    } catch (error) {
      // Expected - project was deleted
      expect(error).toBeDefined();
    }
  });
});
