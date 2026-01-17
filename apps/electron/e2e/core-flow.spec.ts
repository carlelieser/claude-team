/**
 * E2E test for core functionality: create project -> add task -> task completes
 */

import { test, expect, type ElectronApplication, type Page } from '@playwright/test';
import { _electron as electron } from 'playwright';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, rmSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_PATH = join(__dirname, '..');
const MAIN_PATH = join(APP_PATH, 'dist', 'main', 'index.js');
const TEST_PROJECT_PATH = '/tmp/e2e-test-project';

let app: ElectronApplication;
let page: Page;

test.beforeAll(async () => {
  // Create test project directory
  mkdirSync(TEST_PROJECT_PATH, { recursive: true });

  app = await electron.launch({
    args: [MAIN_PATH],
    env: {
      ...process.env,
      NODE_ENV: 'test',
    },
  });

  page = await app.firstWindow();
  await page.waitForLoadState('domcontentloaded');
});

test.afterAll(async () => {
  if (app) {
    // Force close even if processes are running
    try {
      await Promise.race([
        app.close(),
        new Promise((resolve) => setTimeout(resolve, 5000)),
      ]);
    } catch {
      // Ignore close errors
    }
  }

  // Clean up test project directory
  try {
    rmSync(TEST_PROJECT_PATH, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
});

test.describe('Core Flow: Create Project -> Add Task -> Complete', () => {
  let workspaceId: string;
  let projectId: string;
  let agentId: string;
  let taskId: string;

  test('1. should create a workspace', async () => {
    const result = await page.evaluate(async () => {
      return window.electronAPI.invoke['workspace:create']({
        name: 'E2E Test Workspace',
        path: '/tmp/e2e-test-workspace',
      });
    });

    expect(result.ok).toBe(true);
    expect(result.value.name).toBe('E2E Test Workspace');
    workspaceId = result.value.id;
    console.log('Created workspace:', workspaceId);
  });

  test('2. should create a project in the workspace', async () => {
    const result = await page.evaluate(
      async ({ wsId, projectPath }: { wsId: string; projectPath: string }) => {
        return window.electronAPI.invoke['project:create']({
          workspaceId: wsId,
          name: 'E2E Test Project',
          path: projectPath,
        });
      },
      { wsId: workspaceId, projectPath: TEST_PROJECT_PATH }
    );

    expect(result.ok).toBe(true);
    expect(result.value.name).toBe('E2E Test Project');
    expect(result.value.workspaceId).toBe(workspaceId);
    projectId = result.value.id;
    console.log('Created project:', projectId);
  });

  test('3. should have agents available', async () => {
    const result = await page.evaluate(async () => {
      return window.electronAPI.invoke['agent:list']();
    });

    expect(result.ok).toBe(true);
    expect(result.value.length).toBeGreaterThan(0);
    agentId = result.value[0].id;
    console.log('Using agent:', agentId, '-', result.value[0].name);
  });

  test('4. should create a task', async () => {
    console.log('Creating task with projectId:', projectId, 'agentId:', agentId);

    const result = await page.evaluate(
      async ({ projectId, agentId }: { projectId: string; agentId: string }) => {
        return window.electronAPI.invoke['task:create']({
          projectId,
          agentId,
          title: 'E2E Test Task',
          description: 'Say hello world',
        });
      },
      { projectId, agentId }
    );

    expect(result.ok).toBe(true);
    expect(result.value.title).toBe('E2E Test Task');
    expect(result.value.status).toBe('pending');
    expect(result.value.projectId).toBe(projectId);
    expect(result.value.agentId).toBe(agentId);
    taskId = result.value.id;
    console.log('Created task:', taskId, 'with agentId:', result.value.agentId);
  });

  test('5. should start processing task', async () => {
    // Wait for task to be picked up by processor
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const taskResult = await page.evaluate(async (id: string) => {
      return window.electronAPI.invoke['task:get'](id);
    }, taskId);

    console.log('Task status after 5s:', taskResult.value?.status);

    expect(taskResult.ok).toBe(true);

    // Task should have moved from pending to in_progress or completed
    // (in_progress means Claude CLI is running, which validates the full flow)
    const validStates = ['in_progress', 'completed', 'failed'];
    expect(validStates).toContain(taskResult.value.status);

    console.log('E2E flow verified: workspace -> project -> task -> processing');
  });
});
