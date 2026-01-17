import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { DrizzleClient } from '../client.js';
import { projects, type Project, type NewProject } from '../schema/projects.js';
import { BaseRepository } from './base-repository.js';

export class ProjectRepository extends BaseRepository<
  typeof projects,
  Project,
  NewProject
> {
  constructor(db: DrizzleClient) {
    super(db, projects, projects.id);
  }

  /**
   * Creates a new project with auto-generated ID.
   */
  async createProject(
    data: Omit<NewProject, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Project> {
    return this.create({
      ...data,
      id: nanoid(),
    });
  }

  /**
   * Finds all projects in a workspace.
   */
  async findByWorkspaceId(workspaceId: string): Promise<Project[]> {
    return this.findMany(eq(projects.workspaceId, workspaceId));
  }

  /**
   * Finds a project by workspace ID and path.
   */
  async findByWorkspaceAndPath(
    workspaceId: string,
    path: string
  ): Promise<Project | undefined> {
    const condition = and(
      eq(projects.workspaceId, workspaceId),
      eq(projects.path, path)
    );
    if (!condition) return undefined;
    return this.findFirst(condition);
  }

  /**
   * Updates project and refreshes updatedAt timestamp.
   */
  async updateProject(
    id: string,
    data: Partial<Omit<NewProject, 'id' | 'createdAt'>>
  ): Promise<Project | undefined> {
    return this.update(id, {
      ...data,
      updatedAt: new Date(),
    });
  }

  /**
   * Updates project indexed timestamp.
   */
  async markAsIndexed(id: string): Promise<Project | undefined> {
    return this.update(id, {
      indexedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Finds projects by autonomy mode.
   */
  async findByAutonomyMode(
    mode: 'autonomous' | 'supervised' | 'collaborative'
  ): Promise<Project[]> {
    return this.findMany(eq(projects.autonomyMode, mode));
  }
}
