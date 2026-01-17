import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createDatabaseClient, closeDatabaseClient, WorkspaceRepository } from '../src/index.js';
import type { DbClient } from '../src/index.js';
import { migrate } from '../src/migrations/0001_initial.js';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';

describe('WorkspaceRepository', () => {
  let dbClient: DbClient;
  let repository: WorkspaceRepository;

  beforeEach(async () => {
    const dbPath = join(tmpdir(), `test-${randomBytes(8).toString('hex')}.db`);
    dbClient = createDatabaseClient({ path: dbPath });
    await migrate(dbClient.db);
    repository = new WorkspaceRepository(dbClient.db);
  });

  afterEach(() => {
    closeDatabaseClient(dbClient);
  });

  describe('createWorkspace', () => {
    it('should create workspace with generated ID', async () => {
      const workspace = await repository.createWorkspace({
        name: 'Test Workspace',
        path: '/test/path',
      });

      expect(workspace.id).toBeDefined();
      expect(workspace.name).toBe('Test Workspace');
      expect(workspace.path).toBe('/test/path');
      expect(workspace.createdAt).toBeInstanceOf(Date);
      expect(workspace.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('findById', () => {
    it('should find workspace by ID', async () => {
      const created = await repository.createWorkspace({
        name: 'Test Workspace',
        path: '/test/path',
      });

      const found = await repository.findById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.name).toBe('Test Workspace');
    });

    it('should return undefined when workspace not found', async () => {
      const found = await repository.findById('nonexistent');
      expect(found).toBeUndefined();
    });
  });

  describe('findByPath', () => {
    it('should find workspace by path', async () => {
      await repository.createWorkspace({
        name: 'Test Workspace',
        path: '/unique/path',
      });

      const found = await repository.findByPath('/unique/path');

      expect(found).toBeDefined();
      expect(found?.path).toBe('/unique/path');
    });
  });

  describe('updateWorkspace', () => {
    it('should update workspace and refresh timestamp', async () => {
      const workspace = await repository.createWorkspace({
        name: 'Original Name',
        path: '/test/path',
      });

      const updated = await repository.updateWorkspace(workspace.id, {
        name: 'Updated Name',
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.path).toBe('/test/path');
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
        workspace.updatedAt.getTime()
      );
    });
  });

  describe('listAll', () => {
    it('should list all workspaces', async () => {
      await repository.createWorkspace({
        name: 'Workspace 1',
        path: '/path1',
      });
      await repository.createWorkspace({
        name: 'Workspace 2',
        path: '/path2',
      });

      const workspaces = await repository.listAll();

      expect(workspaces).toHaveLength(2);
      expect(workspaces.map((w) => w.name)).toContain('Workspace 1');
      expect(workspaces.map((w) => w.name)).toContain('Workspace 2');
    });
  });

  describe('delete', () => {
    it('should delete workspace', async () => {
      const workspace = await repository.createWorkspace({
        name: 'To Delete',
        path: '/delete/path',
      });

      await repository.delete(workspace.id);

      const found = await repository.findById(workspace.id);
      expect(found).toBeUndefined();
    });
  });
});
