/**
 * Test Configuration and Constants
 */

export const TEST_CONFIG = {
  // Application URLs
  baseURL: process.env.BASE_URL || 'http://localhost:8080',
  apiBaseURL: process.env.API_BASE_URL || 'http://localhost:8080/api/v1',

  // Timeouts (in milliseconds)
  timeouts: {
    short: 2000,      // For quick checks
    medium: 5000,     // For standard operations
    long: 10000,      // For navigation and page loads
    extraLong: 30000, // For Docker container readiness
  },

  // Wait times
  waits: {
    postAction: 500,   // After buttons clicks
    pageLoad: 1000,    // After navigation
    animation: 300,    // For animations
  },

  // Viewport sizes
  viewports: {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1280, height: 720 },
  },
};

export const TEST_USERS = {
  default: {
    username: 'testuser123',
    password: 'TestPassword123!',
    email: 'testuser123@test.com',
  },
  admin: {
    username: 'admin',
    password: 'admin',
  },
};

export const TEST_DATA = {
  projects: {
    default: {
      title: 'Test Project',
      description: 'A test project for QA automation',
    },
    minimal: {
      title: 'Minimal Project',
    },
  },
  tasks: {
    default: {
      title: 'Test Task',
      description: 'A test task for QA automation',
    },
    minimal: {
      title: 'Minimal Task',
    },
  },
};

export const API_ENDPOINTS = {
  // Auth endpoints
  register: '/user/register',
  login: '/login',

  // Project endpoints
  projects: '/projects',
  projectById: (id: number) => `/projects/${id}`,

  // Task endpoints
  tasks: '/tasks',
  taskById: (id: number) => `/tasks/${id}`,

  // Team endpoints
  teams: '/teams',
  teamById: (id: number) => `/teams/${id}`,
};

export const SELECTORS = {
  // Common
  button: {
    submit: 'button[type="submit"]',
    save: 'button:has-text("Save")',
    cancel: 'button:has-text("Cancel")',
    delete: 'button:has-text("Delete")',
    edit: 'button:has-text("Edit")',
    create: 'button:has-text("Create")',
    add: 'button:has-text("Add")',
    logout: 'button:has-text("Logout"), a:has-text("Logout")',
  },

  // Forms
  input: {
    username: 'input[type="text"], input[name="username"]',
    email: 'input[type="email"]',
    password: 'input[type="password"]',
    text: 'input[type="text"]',
  },

  // Messages
  alert: {
    success: '.alert-success, .success, [role="status"]',
    error: '.alert-danger, .error, [role="alert"]',
    warning: '.alert-warning, .warning',
  },
};

export enum TestEnvironment {
  LOCAL = 'local',
  CI = 'ci',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

export const getEnvironment = (): TestEnvironment => {
  if (process.env.CI === 'true') {
    return TestEnvironment.CI;
  }
  return TestEnvironment.LOCAL;
};

export const isRunningInCI = (): boolean => {
  return process.env.CI === 'true';
};
