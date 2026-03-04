import { APIRequestContext } from '@playwright/test';

interface VikunjaUser {
  username: string;
  password: string;
  email?: string;
}

interface VikunjaProject {
  title: string;
  description?: string;
}

interface VikunjaTask {
  title: string;
  projectID: number;
  description?: string;
}

export class VikunjaAPI {
  private baseURL: string;
  private request: APIRequestContext;
  private authToken: string = '';

  constructor(request: APIRequestContext, baseURL: string = 'http://localhost:8080') {
    this.request = request;
    // Ensure baseURL doesn't duplicate /api/v1
    this.baseURL = baseURL.endsWith('/api/v1') ? baseURL : baseURL;
  }

  private getApiUrl(endpoint: string): string {
    return `${this.baseURL}/api/v1${endpoint}`;
  }

  async registerUser(user: VikunjaUser): Promise<any> {
    try {
      const response = await this.request.post(this.getApiUrl('/register'), {
        data: {
          username: user.username,
          password: user.password,
          email: user.email || `${user.username}@test.com`,
        },
      });
      
      if (!response.ok()) {
        const text = await response.text();
        throw new Error(`Registration failed: ${response.status()} - ${text}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async loginUser(username: string, password: string): Promise<string> {
    try {
      const response = await this.request.post(this.getApiUrl('/login'), {
        data: {
          username,
          password,
        },
      });
      
      if (!response.ok()) {
        const text = await response.text();
        throw new Error(`Login failed: ${response.status()} - ${text}`);
      }
      
      const data = await response.json();
      this.authToken = data.token;
      return this.authToken;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async getProjects(): Promise<any> {
    try {
      this.validateAuthToken();
      const response = await this.request.get(this.getApiUrl('/projects'), {
        headers: {
          Authorization: `Bearer ${this.authToken}`,
        },
      });
      
      if (!response.ok()) {
        throw new Error(`Get projects failed: ${response.status()}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Get projects error:', error);
      throw error;
    }
  }

  async createProject(project: VikunjaProject): Promise<any> {
    try {
      this.validateAuthToken();
      const response = await this.request.post(this.getApiUrl('/projects'), {
        data: project,
        headers: {
          Authorization: `Bearer ${this.authToken}`,
        },
      });
      
      if (!response.ok()) {
        const text = await response.text();
        throw new Error(`Create project failed: ${response.status()} - ${text}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Create project error:', error);
      throw error;
    }
  }

  async getProject(projectID: number): Promise<any> {
    try {
      this.validateAuthToken();
      const response = await this.request.get(this.getApiUrl(`/projects/${projectID}`), {
        headers: {
          Authorization: `Bearer ${this.authToken}`,
        },
      });
      
      if (!response.ok()) {
        throw new Error(`Get project failed: ${response.status()}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Get project error:', error);
      throw error;
    }
  }

  async updateProject(projectID: number, project: Partial<VikunjaProject>): Promise<any> {
    try {
      this.validateAuthToken();
      const response = await this.request.put(this.getApiUrl(`/projects/${projectID}`), {
        data: project,
        headers: {
          Authorization: `Bearer ${this.authToken}`,
        },
      });
      
      if (!response.ok()) {
        const text = await response.text();
        throw new Error(`Update project failed: ${response.status()} - ${text}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Update project error:', error);
      throw error;
    }
  }

  async deleteProject(projectID: number): Promise<number> {
    try {
      this.validateAuthToken();
      const response = await this.request.delete(this.getApiUrl(`/projects/${projectID}`), {
        headers: {
          Authorization: `Bearer ${this.authToken}`,
        },
      });
      
      if (!response.ok()) {
        throw new Error(`Delete project failed: ${response.status()}`);
      }
      
      return response.status();
    } catch (error) {
      console.error('Delete project error:', error);
      throw error;
    }
  }

  async createTask(task: VikunjaTask): Promise<any> {
    try {
      this.validateAuthToken();
      const response = await this.request.post(this.getApiUrl('/tasks'), {
        data: task,
        headers: {
          Authorization: `Bearer ${this.authToken}`,
        },
      });
      
      if (!response.ok()) {
        const text = await response.text();
        throw new Error(`Create task failed: ${response.status()} - ${text}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Create task error:', error);
      throw error;
    }
  }

  async getTask(taskID: number): Promise<any> {
    try {
      this.validateAuthToken();
      const response = await this.request.get(this.getApiUrl(`/tasks/${taskID}`), {
        headers: {
          Authorization: `Bearer ${this.authToken}`,
        },
      });
      
      if (!response.ok()) {
        throw new Error(`Get task failed: ${response.status()}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Get task error:', error);
      throw error;
    }
  }

  async updateTask(taskID: number, task: Partial<VikunjaTask>): Promise<any> {
    try {
      this.validateAuthToken();
      const response = await this.request.put(this.getApiUrl(`/tasks/${taskID}`), {
        data: task,
        headers: {
          Authorization: `Bearer ${this.authToken}`,
        },
      });
      
      if (!response.ok()) {
        const text = await response.text();
        throw new Error(`Update task failed: ${response.status()} - ${text}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Update task error:', error);
      throw error;
    }
  }

  async deleteTask(taskID: number): Promise<number> {
    try {
      this.validateAuthToken();
      const response = await this.request.delete(this.getApiUrl(`/tasks/${taskID}`), {
        headers: {
          Authorization: `Bearer ${this.authToken}`,
        },
      });
      
      if (!response.ok()) {
        throw new Error(`Delete task failed: ${response.status()}`);
      }
      
      return response.status();
    } catch (error) {
      console.error('Delete task error:', error);
      throw error;
    }
  }

  setAuthToken(token: string): void {
    this.authToken = token;
  }

  private validateAuthToken(): void {
    if (!this.authToken) {
      throw new Error('Auth token not set. Please login first.');
    }
  }
}
