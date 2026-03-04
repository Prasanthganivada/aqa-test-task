import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ProjectsPage } from '../pages/ProjectsPage';
import { ProjectDetailPage } from '../pages/ProjectDetailPage';

type Pages = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  projectsPage: ProjectsPage;
  projectDetailPage: ProjectDetailPage;
};

/**
 * Custom fixtures for page object injection
 * Each fixture creates a fresh instance of the page object
 */
export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
  registerPage: async ({ page }, use) => {
    const registerPage = new RegisterPage(page);
    await use(registerPage);
  },
  projectsPage: async ({ page }, use) => {
    const projectsPage = new ProjectsPage(page);
    await use(projectsPage);
  },
  projectDetailPage: async ({ page }, use) => {
    const projectDetailPage = new ProjectDetailPage(page);
    await use(projectDetailPage);
  },
});

export { expect } from '@playwright/test';
