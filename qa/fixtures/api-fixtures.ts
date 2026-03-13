import { test as base, request as playwrightRequest } from '@playwright/test';
import { VikunjaAPI } from '../api/VikunjaAPI';

interface APIUser {
  username: string;
  password: string;
  email: string;
  token?: string;
}

// Shared test user cache to avoid rate limiting
let globalAPIUser: APIUser | null = null;
let globalAPI: VikunjaAPI | null = null;

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 5, baseDelay = 1000): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      if (attempt === maxRetries || !error.message?.includes('429')) {
        throw error;
      }
      const delay = baseDelay * (attempt + 1) + Math.random() * 500;
      await sleep(delay);
    }
  }
  throw new Error('Retry exhausted');
}

export const test = base.extend<{
  authenticatedAPI: VikunjaAPI;
  apiUser: APIUser;
}>({
  authenticatedAPI: async ({ }, use) => {
    // Create API context if not exists
    if (!globalAPI) {
      const requestContext = await playwrightRequest.newContext({
        baseURL: process.env['BASE_URL'] || 'http://localhost:8080',
      });
      globalAPI = new VikunjaAPI(requestContext);

      // Register and login a shared user if not already done
      if (!globalAPIUser) {
        // Use the predefined test user first (likely already created by auth tests)
        globalAPIUser = {
          username: 'testuser123',
          password: 'TestPassword123!',
          email: 'testuser123@test.com',
        };

        // Try login first — user may already exist from prior test runs
        try {
          const token = await withRetry(() =>
            globalAPI!.loginUser(globalAPIUser!.username, globalAPIUser!.password),
            5, 3000
          );
          globalAPIUser.token = token;
        } catch (loginError: any) {
          // Only register if login failed for a non-rate-limit reason (e.g. user doesn't exist)
          if (loginError.message?.includes('rate limiting')) {
            throw loginError;
          }

          // Register then login
          const timestamp = Date.now();
          globalAPIUser = {
            username: `apiuser_${timestamp}`,
            password: 'TestPassword123!',
            email: `apiuser_${timestamp}@test.com`,
          };

          await withRetry(() => globalAPI!.registerUser(globalAPIUser!), 3, 3000);
          const token = await withRetry(() =>
            globalAPI!.loginUser(globalAPIUser!.username, globalAPIUser!.password),
            5, 3000
          );
          globalAPIUser.token = token;
        }
      } else {
        // Reuse existing token
        globalAPI.setAuthToken(globalAPIUser.token!);
      }
    }

    await use(globalAPI);
  },

  apiUser: async ({ authenticatedAPI }, use) => {
    if (!globalAPIUser || !globalAPIUser.token) {
      throw new Error('Global API user not initialized');
    }
    await use(globalAPIUser);
  },
});

export { expect } from '@playwright/test';
