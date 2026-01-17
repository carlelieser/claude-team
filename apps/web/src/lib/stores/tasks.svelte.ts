/**
 * Task store using Svelte 5 runes
 */

import type { TaskStatus } from '@claude-team/core';
import {
  ipc,
  type TaskDto,
  type CreateTaskDto,
  type UpdateTaskDto,
  type TaskFilterDto,
} from '$lib/ipc/client';

export type ViewMode = 'kanban' | 'list';

class TaskStore {
  tasks = $state<TaskDto[]>([]);
  loading = $state(false);
  error = $state<string | null>(null);
  filter = $state<TaskFilterDto>({});
  viewMode = $state<ViewMode>('kanban');

  pendingTasks = $derived(this.tasks.filter((t) => t.status === 'pending'));
  inProgressTasks = $derived(this.tasks.filter((t) => t.status === 'in_progress'));
  completedTasks = $derived(this.tasks.filter((t) => t.status === 'completed'));
  failedTasks = $derived(this.tasks.filter((t) => t.status === 'failed'));
  canceledTasks = $derived(this.tasks.filter((t) => t.status === 'canceled'));

  private _unsubscribeUpdated: (() => void) | null = null;

  async load(filter?: TaskFilterDto): Promise<void> {
    this.loading = true;
    this.error = null;

    if (filter) {
      this.filter = filter;
    }

    try {
      const result = await ipc.task.list({ ...this.filter });

      if (result.ok) {
        this.tasks = [...result.value];
      } else {
        this.error = result.error.message;
      }
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Unknown error';
    } finally {
      this.loading = false;
    }
  }

  async create(data: CreateTaskDto): Promise<TaskDto | null> {
    try {
      const result = await ipc.task.create(data);

      if (result.ok) {
        this.tasks = [...this.tasks, result.value];
        return result.value;
      } else {
        this.error = result.error.message;
        return null;
      }
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Unknown error';
      return null;
    }
  }

  async update(id: string, data: UpdateTaskDto): Promise<TaskDto | null> {
    try {
      const result = await ipc.task.update(id, data);

      if (result.ok) {
        const index = this.tasks.findIndex((t) => t.id === id);
        if (index !== -1) {
          this.tasks[index] = result.value;
        }
        return result.value;
      } else {
        this.error = result.error.message;
        return null;
      }
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Unknown error';
      return null;
    }
  }

  async cancel(id: string): Promise<boolean> {
    try {
      const result = await ipc.task.cancel(id);

      if (result.ok) {
        const index = this.tasks.findIndex((t) => t.id === id);
        if (index !== -1) {
          this.tasks[index] = { ...this.tasks[index]!, status: 'canceled' };
        }
        return true;
      } else {
        this.error = result.error.message;
        return false;
      }
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Unknown error';
      return false;
    }
  }

  setFilter(filter: TaskFilterDto): void {
    this.filter = filter;
    this.load();
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode = mode;
  }

  subscribe(): void {
    this._unsubscribeUpdated = ipc.on.taskUpdated((task: TaskDto) => {
      const index = this.tasks.findIndex((t) => t.id === task.id);
      if (index !== -1) {
        this.tasks[index] = task;
      } else {
        this.tasks = [...this.tasks, task];
      }
    });
  }

  unsubscribe(): void {
    if (this._unsubscribeUpdated) {
      this._unsubscribeUpdated();
      this._unsubscribeUpdated = null;
    }
  }

  getById(id: string): TaskDto | undefined {
    return this.tasks.find((t) => t.id === id);
  }

  getByStatus(status: TaskStatus): TaskDto[] {
    return this.tasks.filter((t) => t.status === status);
  }
}

export const taskStore = new TaskStore();
