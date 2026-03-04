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

export const test = base.extend<{
  authenticatedAPI: VikunjaAPI;
  apiUser: APIUser;
}>({
  authenticatedAPI: async ({ }, use) => {
    // Create API context if not exists
    if (!globalAPI) {
      const requestContext = await playwrightRequest.newContext({
        baseURL: 'http://localhost:8080',
      });
      globalAPI = new VikunjaAPI(requestContext);

      // Register and login a shared user if not already done
      if (!globalAPIUser) {
        const timestamp = Date.now();
        globalAPIUser = {
          username: `apiuser_${timestamp}`,
          password: 'TestPassword123!',
          email: `apiuser_${timestamp}@test.com`,
        };

        try {
          // Try registration with /register endpoint
          await globalAPI.registerUser(globalAPIUser);
        } catch (regError: any) {
          // If registration fails, try to login with predefined user
          if (regError.message.includes('404') || regError.message.includes('429')) {
            globalAPIUser = {
              username: 'testuser123',
              password: 'TestPassword123!',
              email: 'testuser123@test.com',
            };
          }
        }

        // Login to get token
        try {
          const token = await globalAPI.loginUser(globalAPIUser.username, globalAPIUser.password);
          globalAPIUser.token = token;
        } catch (loginError) {
          console.error('Failed to authenticate global API user:', loginError);
          throw loginError;
        }
      } else {
        // Reuse existing token
        globalAPI.setAuthToken(globalAPIUser.token!);
      }
    }

    await use(globalAPI);
  },

  apiUser: async ({ }, use) => {
    if (!globalAPIUser || !globalAPIUser.token) {
      throw new Error('Global API user not initialized');
    }
    await use(globalAPIUser);
  },
});

export { expect } from '@playwright/test';
