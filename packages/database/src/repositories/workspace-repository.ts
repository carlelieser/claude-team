import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { DrizzleClient } from '../client.js';
import { workspaces, type Workspace, type NewWorkspace } from '../schema/workspaces.js';
import { BaseRepository } from './base-repository.js';

export class WorkspaceRepository extends BaseRepository<
  typeof workspaces,
  Workspace,
  NewWorkspace
> {
  constructor(db: DrizzleClient) {
    super(db, workspaces, workspaces.id);
  }

  /**
   * Creates a new workspace with auto-generated ID.
   */
  async createWorkspace(
    data: Omit<NewWorkspace, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Workspace> {
    return this.create({
      ...data,
      id: nanoid(),
    });
  }

  /**
   * Finds a workspace by path.
   */
  async findByPath(path: string): Promise<Workspace | undefined> {
    return this.findFirst(eq(workspaces.path, path));
  }

  /**
   * Updates workspace and refreshes updatedAt timestamp.
   */
  async updateWorkspace(
    id: string,
    data: Partial<Omit<NewWorkspace, 'id' | 'createdAt'>>
  ): Promise<Workspace | undefined> {
    return this.update(id, {
      ...data,
      updatedAt: new Date(),
    });
  }

  /**
   * Lists all workspaces.
   */
  async listAll(): Promise<Workspace[]> {
    return this.findMany();
  }
}
