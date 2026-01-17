/**
 * Basic usage examples for @claude-team/database
 *
 * This file demonstrates common patterns for using the database package.
 */

import {
  createDatabaseClient,
  closeDatabaseClient,
  migrate,
  WorkspaceRepository,
  ProjectRepository,
  TaskRepository,
  EventRepository,
  AgentActionRepository,
  type DbClient,
} from '../src/index.js';

async function main() {
  // Initialize database
  const dbClient = createDatabaseClient({
    path: './examples/example.db',
    verbose: true,
  });

  // Run migrations
  await migrate(dbClient.db);

  // Create repositories
  const workspaceRepo = new WorkspaceRepository(dbClient.db);
  const projectRepo = new ProjectRepository(dbClient.db);
  const taskRepo = new TaskRepository(dbClient.db);
  const eventRepo = new EventRepository(dbClient.db);
  const actionRepo = new AgentActionRepository(dbClient.db);

  try {
    // Create a workspace
    console.log('\n=== Creating Workspace ===');
    const workspace = await workspaceRepo.createWorkspace({
      name: 'My Development Workspace',
      path: '/Users/dev/workspace',
    });
    console.log('Created workspace:', workspace);

    // Create a project
    console.log('\n=== Creating Project ===');
    const project = await projectRepo.createProject({
      workspaceId: workspace.id,
      name: 'Web Application',
      path: '/Users/dev/workspace/web-app',
      autonomyMode: 'supervised',
      config: {
        language: 'typescript',
        framework: 'react',
      },
    });
    console.log('Created project:', project);

    // Create an event
    console.log('\n=== Creating Event ===');
    const event = await eventRepo.createEvent({
      type: 'file.changed',
      source: 'filesystem',
      projectId: project.id,
      workspaceId: workspace.id,
      payload: {
        path: '/Users/dev/workspace/web-app/src/App.tsx',
        changeType: 'modified',
      },
    });
    console.log('Created event:', event);

    // Create a task
    console.log('\n=== Creating Task ===');
    const task = await taskRepo.createTask({
      projectId: project.id,
      agentId: 'code-analyzer',
      title: 'Analyze code quality',
      description: 'Run static analysis on the codebase',
      priority: 1,
    });
    console.log('Created task:', task);

    // Start the task
    console.log('\n=== Starting Task ===');
    const startedTask = await taskRepo.startTask(task.id);
    console.log('Started task:', startedTask);

    // Create an agent action
    console.log('\n=== Creating Agent Action ===');
    const action = await actionRepo.createAction({
      taskId: task.id,
      agentId: 'code-analyzer',
      projectId: project.id,
      actionType: 'file_read',
      target: '/Users/dev/workspace/web-app/src/App.tsx',
      input: { encoding: 'utf-8' },
      reasoning: 'Need to analyze the file content',
    });
    console.log('Created action:', action);

    // Complete the action
    console.log('\n=== Completing Action ===');
    const completedAction = await actionRepo.completeAction(
      action.id,
      { lines: 150, complexity: 'medium' },
      250
    );
    console.log('Completed action:', completedAction);

    // Complete the task
    console.log('\n=== Completing Task ===');
    const completedTask = await taskRepo.completeTask(task.id, {
      status: 'success',
      findings: ['No critical issues found'],
    });
    console.log('Completed task:', completedTask);

    // Mark event as processed
    console.log('\n=== Processing Event ===');
    const processedEvent = await eventRepo.markAsProcessed(
      event.id,
      'event-processor'
    );
    console.log('Processed event:', processedEvent);

    // Query examples
    console.log('\n=== Query Examples ===');

    // Find all projects in workspace
    const projects = await projectRepo.findByWorkspaceId(workspace.id);
    console.log(`Found ${projects.length} projects in workspace`);

    // Find unprocessed events
    const unprocessedEvents = await eventRepo.findUnprocessed(10);
    console.log(`Found ${unprocessedEvents.length} unprocessed events`);

    // Find pending tasks
    const pendingTasks = await taskRepo.findByStatus('pending');
    console.log(`Found ${pendingTasks.length} pending tasks`);

    // Find actions by project
    const projectActions = await actionRepo.findByProjectId(project.id);
    console.log(`Found ${projectActions.length} actions for project`);

    console.log('\n=== Example Complete ===');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Clean up
    closeDatabaseClient(dbClient);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
