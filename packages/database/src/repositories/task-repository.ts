import { eq, and, desc, asc, isNull } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { DrizzleClient } from '../client.js';
import { tasks, type Task, type NewTask } from '../schema/tasks.js';
import { BaseRepository } from './base-repository.js';

type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'canceled';

export class TaskRepository extends BaseRepository<
  typeof tasks,
  Task,
  NewTask
> {
  constructor(db: DrizzleClient) {
    super(db, tasks, tasks.id);
  }

  /**
   * Creates a new task with auto-generated ID.
   */
  async createTask(
    data: Omit<NewTask, 'id' | 'createdAt'>
  ): Promise<Task> {
    return this.create({
      ...data,
      id: nanoid(),
    });
  }

  /**
   * Finds tasks by project ID.
   */
  async findByProjectId(projectId: string): Promise<Task[]> {
    return this.findMany(eq(tasks.projectId, projectId));
  }

  /**
   * Finds tasks by status.
   */
  async findByStatus(status: TaskStatus): Promise<Task[]> {
    return this._db
      .select()
      .from(tasks)
      .where(eq(tasks.status, status))
      .orderBy(desc(tasks.priority), asc(tasks.createdAt));
  }

  /**
   * Finds tasks by project and status.
   */
  async findByProjectAndStatus(
    projectId: string,
    status: TaskStatus
  ): Promise<Task[]> {
    return this._db
      .select()
      .from(tasks)
      .where(and(eq(tasks.projectId, projectId), eq(tasks.status, status)))
      .orderBy(desc(tasks.priority), asc(tasks.createdAt));
  }

  /**
   * Finds root tasks (tasks without parent).
   */
  async findRootTasks(projectId: string): Promise<Task[]> {
    return this._db
      .select()
      .from(tasks)
      .where(and(eq(tasks.projectId, projectId), isNull(tasks.parentId)))
      .orderBy(desc(tasks.priority), asc(tasks.createdAt));
  }

  /**
   * Finds subtasks of a parent task.
   */
  async findSubtasks(parentId: string): Promise<Task[]> {
    return this._db
      .select()
      .from(tasks)
      .where(eq(tasks.parentId, parentId))
      .orderBy(desc(tasks.priority), asc(tasks.createdAt));
  }

  /**
   * Starts a task by updating status and timestamp.
   */
  async startTask(id: string): Promise<Task | undefined> {
    return this.update(id, {
      status: 'in_progress',
      startedAt: new Date(),
    });
  }

  /**
   * Completes a task with result.
   */
  async completeTask(id: string, result?: unknown): Promise<Task | undefined> {
    return this.update(id, {
      status: 'completed',
      completedAt: new Date(),
      result: result as Record<string, unknown>,
    });
  }

  /**
   * Fails a task with error message.
   */
  async failTask(id: string, error: string): Promise<Task | undefined> {
    return this.update(id, {
      status: 'failed',
      completedAt: new Date(),
      error,
    });
  }

  /**
   * Cancels a task.
   */
  async cancelTask(id: string): Promise<Task | undefined> {
    return this.update(id, {
      status: 'canceled',
      completedAt: new Date(),
    });
  }

  /**
   * Updates task priority.
   */
  async updatePriority(id: string, priority: number): Promise<Task | undefined> {
    return this.update(id, { priority });
  }
}
