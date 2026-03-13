import { test, expect } from '../../fixtures/api-fixtures';

test.describe('Projects API - CRUD Operations', () => {
  test('should use authenticated API', async ({ apiUser }) => {
    expect(apiUser.username).toBeTruthy();
    expect(apiUser.token).toBeTruthy();
  });

  test('Create: should create a project via API', async ({ authenticatedAPI }) => {
    const projectData = {
      title: `API_Project_${Date.now()}`,
      description: 'Test project via API',
    };
    
    const response = await authenticatedAPI.createProject(projectData);
    expect(response).toBeDefined();
    expect(response.title).toBe(projectData.title);
  });

  test('Read: should get all projects via API', async ({ authenticatedAPI }) => {
    const response = await authenticatedAPI.getProjects();
    expect(Array.isArray(response) || response.projects).toBeTruthy();
  });

  test('Read: should get specific project via API', async ({ authenticatedAPI }) => {
    const projectData = {
      title: `API_Project_${Date.now()}`,
    };
    const createResponse = await authenticatedAPI.createProject(projectData);
    const projectID = createResponse.id;
    
    const getResponse = await authenticatedAPI.getProject(projectID);
    expect(getResponse.title).toBe(projectData.title);
  });

  test('Update: should update a project via API', async ({ authenticatedAPI }) => {
    const projectData = {
      title: `API_Project_${Date.now()}`,
    };
    const createResponse = await authenticatedAPI.createProject(projectData);
    const projectID = createResponse.id;
    
    const updatedData = {
      title: `Updated_API_Project_${Date.now()}`,
    };
    const updateResponse = await authenticatedAPI.updateProject(projectID, updatedData);
    expect(updateResponse.title).toBe(updatedData.title);
  });

  test('Delete: should delete a project via API', async ({ authenticatedAPI }) => {
    const projectData = {
      title: `API_Project_To_Delete_${Date.now()}`,
    };
    const createResponse = await authenticatedAPI.createProject(projectData);
    const projectID = createResponse.id;
    
    const deleteStatus = await authenticatedAPI.deleteProject(projectID);
    expect([200, 204]).toContain(deleteStatus);
  });
});

test.describe('Tasks API - CRUD Operations', () => {
  test('Create: should create a task via API', async ({ authenticatedAPI }) => {
    const projectData = {
      title: `API_Task_Project_${Date.now()}`,
    };
    const projectResponse = await authenticatedAPI.createProject(projectData);
    const projectID = projectResponse.id;
    
    const taskData = {
      title: `API_Task_${Date.now()}`,
      projectID: projectID,
    };
    
    const response = await authenticatedAPI.createTask(taskData);
    expect(response).toBeDefined();
    expect(response.title).toBe(taskData.title);
  });

  test('Read: should get a task via API', async ({ authenticatedAPI }) => {
    const projectResponse = await authenticatedAPI.createProject({
      title: `API_Task_Project_${Date.now()}`,
    });
    const projectID = projectResponse.id;
    
    const taskResponse = await authenticatedAPI.createTask({
      title: `API_Task_${Date.now()}`,
      projectID: projectID,
    });
    const taskID = taskResponse.id;
    
    const getResponse = await authenticatedAPI.getTask(taskID);
    expect(getResponse.id).toBe(taskID);
  });

  test('Update: should update a task via API', async ({ authenticatedAPI }) => {
    const projectResponse = await authenticatedAPI.createProject({
      title: `API_Task_Project_${Date.now()}`,
    });
    const projectID = projectResponse.id;
    
    const taskResponse = await authenticatedAPI.createTask({
      title: `API_Task_${Date.now()}`,
      projectID: projectID,
    });
    const taskID = taskResponse.id;
    
    const updatedData = {
      title: `Updated_API_Task_${Date.now()}`,
    };
    const updateResponse = await authenticatedAPI.updateTask(taskID, updatedData);
    expect(updateResponse.title).toBe(updatedData.title);
  });

  test('Delete: should delete a task via API', async ({ authenticatedAPI }) => {
    const projectResponse = await authenticatedAPI.createProject({
      title: `API_Task_Project_${Date.now()}`,
    });
    const projectID = projectResponse.id;
    
    const taskResponse = await authenticatedAPI.createTask({
      title: `API_Task_To_Delete_${Date.now()}`,
      projectID: projectID,
    });
    const taskID = taskResponse.id;
    
    const deleteStatus = await authenticatedAPI.deleteTask(taskID);
    expect([200, 204]).toContain(deleteStatus);
  });
});
