/**
 * Task management types
 */

export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'canceled';

export interface Task {
  readonly id: string;
  readonly projectId: string;
  readonly agentId?: string;
  readonly title: string;
  readonly description?: string;
  readonly status: TaskStatus;
  readonly priority: number;
  readonly parentId?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly metadata?: Record<string, unknown>;
}

export interface CreateTaskInput {
  readonly id?: string;
  readonly projectId: string;
  readonly agentId?: string;
  readonly title: string;
  readonly description?: string;
  readonly priority?: number;
  readonly parentId?: string;
  readonly metadata?: Record<string, unknown>;
}

export interface UpdateTaskInput {
  readonly status?: TaskStatus;
  readonly title?: string;
  readonly description?: string;
  readonly priority?: number;
  readonly agentId?: string;
  readonly metadata?: Record<string, unknown>;
}

export interface TaskFilter {
  readonly projectId?: string;
  readonly agentId?: string;
  readonly status?: TaskStatus;
  readonly parentId?: string;
}

export type TaskHandler = (task: Task) => Promise<void>;
