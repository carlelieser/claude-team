/**
 * FIFO task queue implementation
 */

import { nanoid } from 'nanoid';
import { getLogger } from '../shared/logger.js';
import type { Result } from '../shared/result.js';
import { failure, success } from '../shared/result.js';
import type {
  CreateTaskInput,
  Task,
  TaskFilter,
  UpdateTaskInput,
} from './types.js';

export interface TaskQueue {
  create(input: CreateTaskInput): Result<Task>;
  update(taskId: string, input: UpdateTaskInput): Result<Task>;
  get(taskId: string): Result<Task>;
  list(filter?: TaskFilter): Result<readonly Task[]>;
  delete(taskId: string): Result<void>;
  peek(): Result<Task | undefined>;
  dequeue(): Result<Task | undefined>;
  size(): number;
  clear(): void;
}

class InMemoryTaskQueue implements TaskQueue {
  private readonly _tasks = new Map<string, Task>();
  private readonly _queue: string[] = [];
  private readonly _logger = getLogger().child({ component: 'TaskQueue' });

  create(input: CreateTaskInput): Result<Task> {
    const task: Task = {
      id: nanoid(),
      projectId: input.projectId,
      agentId: input.agentId,
      title: input.title,
      description: input.description,
      status: 'pending',
      priority: input.priority || 0,
      parentId: input.parentId,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: input.metadata,
    };

    this._tasks.set(task.id, task);
    this._enqueue(task);

    this._logger.info('Task created', {
      taskId: task.id,
      projectId: task.projectId,
      title: task.title,
      priority: task.priority,
    });

    return success(task);
  }

  update(taskId: string, input: UpdateTaskInput): Result<Task> {
    const existing = this._tasks.get(taskId);
    if (!existing) {
      return failure({
        type: 'notFound',
        message: `Task not found: ${taskId}`,
        resource: 'task',
      });
    }

    const updated: Task = {
      ...existing,
      ...input,
      id: existing.id,
      projectId: existing.projectId,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
      metadata: input.metadata
        ? { ...existing.metadata, ...input.metadata }
        : existing.metadata,
    };

    this._tasks.set(taskId, updated);

    if (input.status && input.status !== existing.status) {
      this._handleStatusChange(existing, updated);
    }

    this._logger.info('Task updated', {
      taskId: updated.id,
      status: updated.status,
      changes: Object.keys(input),
    });

    return success(updated);
  }

  get(taskId: string): Result<Task> {
    const task = this._tasks.get(taskId);
    if (!task) {
      return failure({
        type: 'notFound',
        message: `Task not found: ${taskId}`,
        resource: 'task',
      });
    }
    return success(task);
  }

  list(filter?: TaskFilter): Result<readonly Task[]> {
    let tasks = Array.from(this._tasks.values());

    if (filter) {
      if (filter.projectId) {
        tasks = tasks.filter((t) => t.projectId === filter.projectId);
      }
      if (filter.agentId) {
        tasks = tasks.filter((t) => t.agentId === filter.agentId);
      }
      if (filter.status) {
        tasks = tasks.filter((t) => t.status === filter.status);
      }
      if (filter.parentId) {
        tasks = tasks.filter((t) => t.parentId === filter.parentId);
      }
    }

    tasks.sort((a, b) => b.priority - a.priority);

    return success(tasks);
  }

  delete(taskId: string): Result<void> {
    const task = this._tasks.get(taskId);
    if (!task) {
      return failure({
        type: 'notFound',
        message: `Task not found: ${taskId}`,
        resource: 'task',
      });
    }

    this._tasks.delete(taskId);
    this._removeFromQueue(taskId);

    this._logger.info('Task deleted', { taskId });

    return success(undefined);
  }

  peek(): Result<Task | undefined> {
    if (this._queue.length === 0) {
      return success(undefined);
    }

    const taskId = this._queue[0];
    if (!taskId) {
      return success(undefined);
    }

    const task = this._tasks.get(taskId);
    return success(task);
  }

  dequeue(): Result<Task | undefined> {
    if (this._queue.length === 0) {
      return success(undefined);
    }

    const taskId = this._queue.shift();
    if (!taskId) {
      return success(undefined);
    }

    const task = this._tasks.get(taskId);
    if (task) {
      this._logger.debug('Task dequeued', {
        taskId: task.id,
        queueSize: this._queue.length,
      });
    }

    return success(task);
  }

  size(): number {
    return this._queue.length;
  }

  clear(): void {
    const count = this._tasks.size;
    this._tasks.clear();
    this._queue.length = 0;
    this._logger.info('Task queue cleared', { count });
  }

  private _enqueue(task: Task): void {
    if (task.status !== 'pending') {
      return;
    }

    const index = this._findInsertionIndex(task);
    this._queue.splice(index, 0, task.id);

    this._logger.debug('Task enqueued', {
      taskId: task.id,
      priority: task.priority,
      position: index,
      queueSize: this._queue.length,
    });
  }

  private _findInsertionIndex(task: Task): number {
    for (let i = 0; i < this._queue.length; i++) {
      const queuedTaskId = this._queue[i];
      if (!queuedTaskId) {
        continue;
      }

      const queuedTask = this._tasks.get(queuedTaskId);
      if (queuedTask && task.priority > queuedTask.priority) {
        return i;
      }
    }
    return this._queue.length;
  }

  private _removeFromQueue(taskId: string): void {
    const index = this._queue.indexOf(taskId);
    if (index !== -1) {
      this._queue.splice(index, 1);
    }
  }

  private _handleStatusChange(oldTask: Task, newTask: Task): void {
    if (newTask.status === 'pending' && oldTask.status !== 'pending') {
      this._enqueue(newTask);
    } else if (newTask.status !== 'pending' && oldTask.status === 'pending') {
      this._removeFromQueue(newTask.id);
    }
  }
}

export function createTaskQueue(): TaskQueue {
  return new InMemoryTaskQueue();
}

let defaultTaskQueue: TaskQueue | undefined;

export function getTaskQueue(): TaskQueue {
  if (!defaultTaskQueue) {
    defaultTaskQueue = createTaskQueue();
  }
  return defaultTaskQueue;
}

export function setTaskQueue(queue: TaskQueue): void {
  defaultTaskQueue = queue;
}
