/**
 * Task processor for executing tasks from the queue
 */

import { getLogger } from '../shared/logger.js';
import type { Result } from '../shared/result.js';
import { failure, success } from '../shared/result.js';
import type { Task, TaskHandler } from './types.js';
import type { TaskQueue } from './task-queue.js';
import { getTaskQueue } from './task-queue.js';

export interface TaskProcessorOptions {
  readonly queue?: TaskQueue;
  readonly concurrency?: number;
  readonly pollInterval?: number;
}

export interface TaskProcessor {
  start(): void;
  stop(): Promise<void>;
  process(task: Task): Promise<Result<void>>;
  register(handler: TaskHandler): void;
  isRunning(): boolean;
}

class DefaultTaskProcessor implements TaskProcessor {
  private readonly _queue: TaskQueue;
  private readonly _concurrency: number;
  private readonly _pollInterval: number;
  private readonly _handlers: TaskHandler[] = [];
  private readonly _activeTasks = new Set<string>();
  private readonly _logger = getLogger().child({ component: 'TaskProcessor' });
  private _running = false;
  private _pollTimer?: NodeJS.Timeout;

  constructor(options: TaskProcessorOptions = {}) {
    this._queue = options.queue || getTaskQueue();
    this._concurrency = options.concurrency || 5;
    this._pollInterval = options.pollInterval || 1000;
  }

  start(): void {
    if (this._running) {
      this._logger.warn('Task processor already running');
      return;
    }

    this._running = true;
    this._logger.info('Task processor started', {
      concurrency: this._concurrency,
      pollInterval: this._pollInterval,
    });

    this._poll();
  }

  async stop(): Promise<void> {
    if (!this._running) {
      this._logger.warn('Task processor already stopped');
      return;
    }

    this._running = false;

    if (this._pollTimer) {
      clearTimeout(this._pollTimer);
      this._pollTimer = undefined;
    }

    while (this._activeTasks.size > 0) {
      this._logger.debug('Waiting for active tasks to complete', {
        activeCount: this._activeTasks.size,
      });
      await this._sleep(100);
    }

    this._logger.info('Task processor stopped');
  }

  async process(task: Task): Promise<Result<void>> {
    if (this._handlers.length === 0) {
      return failure({
        type: 'validation',
        message: 'No task handlers registered',
        fields: {},
      });
    }

    this._activeTasks.add(task.id);

    const updateResult = this._queue.update(task.id, {
      status: 'in_progress',
    });

    if (!updateResult.ok) {
      this._activeTasks.delete(task.id);
      return failure(updateResult.error);
    }

    this._logger.info('Processing task', {
      taskId: task.id,
      title: task.title,
      agentId: task.agentId,
    });

    try {
      for (const handler of this._handlers) {
        await handler(task);
      }

      this._queue.update(task.id, { status: 'completed' });

      this._logger.info('Task completed', {
        taskId: task.id,
        title: task.title,
      });

      return success(undefined);
    } catch (error) {
      this._logger.error('Task failed', {
        taskId: task.id,
        title: task.title,
        error: error instanceof Error ? error.message : String(error),
      });

      this._queue.update(task.id, { status: 'failed' });

      return failure({
        type: 'unknown',
        message: error instanceof Error ? error.message : String(error),
        cause: error instanceof Error ? error : undefined,
      });
    } finally {
      this._activeTasks.delete(task.id);
    }
  }

  register(handler: TaskHandler): void {
    this._handlers.push(handler);
    this._logger.debug('Task handler registered', {
      handlerCount: this._handlers.length,
    });
  }

  isRunning(): boolean {
    return this._running;
  }

  private _poll(): void {
    if (!this._running) {
      return;
    }

    this._processNextBatch()
      .catch((error) => {
        this._logger.error('Error processing task batch', {
          error: error instanceof Error ? error.message : String(error),
        });
      })
      .finally(() => {
        if (this._running) {
          this._pollTimer = setTimeout(() => this._poll(), this._pollInterval);
        }
      });
  }

  private async _processNextBatch(): Promise<void> {
    const availableSlots = this._concurrency - this._activeTasks.size;
    if (availableSlots <= 0) {
      return;
    }

    const tasks: Task[] = [];
    for (let i = 0; i < availableSlots; i++) {
      const result = this._queue.dequeue();
      if (!result.ok || !result.value) {
        break;
      }
      tasks.push(result.value);
    }

    if (tasks.length === 0) {
      return;
    }

    this._logger.debug('Processing task batch', {
      batchSize: tasks.length,
      activeCount: this._activeTasks.size,
    });

    await Promise.all(tasks.map((task) => this.process(task)));
  }

  private _sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export function createTaskProcessor(
  options?: TaskProcessorOptions
): TaskProcessor {
  return new DefaultTaskProcessor(options);
}

let defaultTaskProcessor: TaskProcessor | undefined;

export function getTaskProcessor(): TaskProcessor {
  if (!defaultTaskProcessor) {
    defaultTaskProcessor = createTaskProcessor();
  }
  return defaultTaskProcessor;
}

export function setTaskProcessor(processor: TaskProcessor): void {
  defaultTaskProcessor = processor;
}
