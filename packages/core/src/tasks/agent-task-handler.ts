/**
 * Task handler that executes tasks via agents
 *
 * This handler bridges the task queue with the agent orchestrator,
 * executing agent tasks and managing their lifecycle.
 */

import type { AgentOrchestrator } from '../agents/agent-orchestrator.js';
import { getAgentOrchestrator } from '../agents/agent-orchestrator.js';
import type {
  AgentExecutionContext,
  AgentExecutionResult,
  AgentProgress,
} from '../agents/types.js';
import type { EventBus } from '../events/event-bus.js';
import { getEventBus } from '../events/event-bus.js';
import { getLogger } from '../shared/logger.js';
import type { Result } from '../shared/result.js';
import { failure, success } from '../shared/result.js';
import {
  type CancellationTokenSource,
  createCancellationTokenSource,
} from '../shared/cancellation.js';
import type { Task, TaskHandler } from './types.js';

export interface AgentTaskMetadata {
  readonly message: string;
  readonly cwd: string;
  readonly workspaceId: string;
  readonly eventId?: string;
  readonly context?: Record<string, unknown>;
}

export interface AgentTaskResult {
  readonly task: Task;
  readonly execution: AgentExecutionResult;
  readonly timestamp: Date;
}

export interface AgentTaskHandlerOptions {
  readonly orchestrator?: AgentOrchestrator;
  readonly eventBus?: EventBus;
  readonly onProgress?: (taskId: string, message: string, progress?: AgentProgress) => void;
  readonly onResult?: (result: AgentTaskResult) => void;
}

export interface AgentTaskHandler {
  handle(task: Task): Promise<Result<AgentExecutionResult>>;
  asTaskHandler(): TaskHandler;
  cancelTask(taskId: string, reason?: string): boolean;
  isTaskRunning(taskId: string): boolean;
  getRunningTasks(): readonly string[];
}

class DefaultAgentTaskHandler implements AgentTaskHandler {
  private readonly _orchestrator: AgentOrchestrator;
  private readonly _eventBus: EventBus;
  private readonly _onProgress?: (taskId: string, message: string, progress?: AgentProgress) => void;
  private readonly _onResult?: (result: AgentTaskResult) => void;
  private readonly _logger = getLogger().child({ component: 'AgentTaskHandler' });
  private readonly _runningTasks = new Map<string, CancellationTokenSource>();

  constructor(options: AgentTaskHandlerOptions = {}) {
    this._orchestrator = options.orchestrator || getAgentOrchestrator();
    this._eventBus = options.eventBus || getEventBus();
    this._onProgress = options.onProgress;
    this._onResult = options.onResult;
  }

  cancelTask(taskId: string, reason?: string): boolean {
    const cts = this._runningTasks.get(taskId);
    if (!cts) {
      this._logger.debug('Task not found for cancellation', { taskId });
      return false;
    }

    this._logger.info('Cancelling task', { taskId, reason });
    cts.cancel(reason);
    return true;
  }

  isTaskRunning(taskId: string): boolean {
    return this._runningTasks.has(taskId);
  }

  getRunningTasks(): readonly string[] {
    return Array.from(this._runningTasks.keys());
  }

  async handle(task: Task): Promise<Result<AgentExecutionResult>> {
    if (!task.agentId) {
      this._logger.warn('Task has no assigned agent', { taskId: task.id });
      return failure({
        type: 'validation',
        message: 'Task has no assigned agent',
        fields: { agentId: 'Agent ID is required for agent tasks' },
      });
    }

    const metadata = this._extractMetadata(task);
    if (!metadata.ok) {
      return failure(metadata.error);
    }

    const { message, cwd, workspaceId, eventId } = metadata.value;

    this._logger.info('Handling agent task', {
      taskId: task.id,
      agentId: task.agentId,
      projectId: task.projectId,
      title: task.title,
    });

    const cts = createCancellationTokenSource();
    this._runningTasks.set(task.id, cts);

    this._emitTaskStarted(task, workspaceId);

    const context: AgentExecutionContext = {
      projectId: task.projectId,
      workspaceId,
      cwd,
      taskId: task.id,
      eventId,
    };

    try {
      const result = await this._orchestrator.executeAgent(
        task.agentId,
        message,
        context,
        {
          cancellationToken: cts.token,
          onProgress: (progress) => {
            this._emitAgentProgress(task, workspaceId, progress);
          },
        }
      );

      if (!result.ok) {
        this._logger.error('Agent execution failed', {
          taskId: task.id,
          agentId: task.agentId,
          error: result.error.message,
        });

        this._emitTaskFailed(task, workspaceId, result.error.message);

        return failure(result.error);
      }

      const execution = result.value;

      this._logger.info('Agent task completed', {
        taskId: task.id,
        agentId: task.agentId,
        success: execution.success,
        outputLength: execution.output.length,
        turnsUsed: execution.turnsUsed,
        cancelled: execution.cancelled,
      });

      if (execution.cancelled) {
        this._emitTaskCancelled(task, workspaceId);
      } else if (execution.success) {
        this._emitTaskCompleted(task, workspaceId, execution);
      } else {
        this._emitTaskFailed(task, workspaceId, execution.error || 'Unknown error');
      }

      if (this._onResult) {
        this._onResult({
          task,
          execution,
          timestamp: new Date(),
        });
      }

      return success(execution);
    } finally {
      this._runningTasks.delete(task.id);
      cts.dispose();
    }
  }

  asTaskHandler(): TaskHandler {
    return async (task: Task): Promise<void> => {
      if (!task.agentId) {
        this._logger.debug('Skipping non-agent task', { taskId: task.id });
        return;
      }

      const result = await this.handle(task);

      if (!result.ok) {
        throw new Error(result.error.message);
      }

      if (!result.value.success) {
        throw new Error(result.value.error || 'Agent execution failed');
      }
    };
  }

  private _extractMetadata(task: Task): Result<AgentTaskMetadata> {
    const metadata = task.metadata as Partial<AgentTaskMetadata> | undefined;

    if (!metadata) {
      return failure({
        type: 'validation',
        message: 'Task metadata is required for agent tasks',
        fields: { metadata: 'Metadata must contain message and cwd' },
      });
    }

    const message = metadata.message || task.description || task.title;
    const cwd = metadata.cwd;
    const workspaceId = metadata.workspaceId;

    if (!cwd) {
      return failure({
        type: 'validation',
        message: 'Task metadata must contain cwd',
        fields: { cwd: 'Working directory is required' },
      });
    }

    if (!workspaceId) {
      return failure({
        type: 'validation',
        message: 'Task metadata must contain workspaceId',
        fields: { workspaceId: 'Workspace ID is required' },
      });
    }

    return success({
      message,
      cwd,
      workspaceId,
      eventId: metadata.eventId,
      context: metadata.context,
    });
  }

  private _emitTaskStarted(task: Task, workspaceId: string): void {
    this._eventBus.publish({
      type: 'task.started',
      source: task.agentId || 'system',
      projectId: task.projectId,
      workspaceId,
      payload: {
        taskId: task.id,
        agentId: task.agentId,
        title: task.title,
      },
    });

    this._eventBus.publish({
      type: 'agent.started',
      source: task.agentId || 'system',
      projectId: task.projectId,
      workspaceId,
      payload: {
        agentId: task.agentId,
        taskId: task.id,
      },
    });

    if (this._onProgress) {
      this._onProgress(task.id, `Agent ${task.agentId} started working on task`);
    }
  }

  private _emitTaskCompleted(
    task: Task,
    workspaceId: string,
    execution: AgentExecutionResult
  ): void {
    this._eventBus.publish({
      type: 'task.completed',
      source: task.agentId || 'system',
      projectId: task.projectId,
      workspaceId,
      payload: {
        taskId: task.id,
        agentId: task.agentId,
        result: {
          success: execution.success,
          outputLength: execution.output.length,
          turnsUsed: execution.turnsUsed,
          duration: execution.endTime.getTime() - execution.startTime.getTime(),
        },
      },
    });

    this._eventBus.publish({
      type: 'agent.completed',
      source: task.agentId || 'system',
      projectId: task.projectId,
      workspaceId,
      payload: {
        agentId: task.agentId,
        taskId: task.id,
        result: {
          success: execution.success,
          outputLength: execution.output.length,
        },
      },
    });

    if (this._onProgress) {
      this._onProgress(task.id, `Agent ${task.agentId} completed task successfully`);
    }
  }

  private _emitTaskFailed(
    task: Task,
    workspaceId: string,
    error: string
  ): void {
    this._eventBus.publish({
      type: 'task.failed',
      source: task.agentId || 'system',
      projectId: task.projectId,
      workspaceId,
      payload: {
        taskId: task.id,
        agentId: task.agentId,
        error,
      },
    });

    this._eventBus.publish({
      type: 'agent.error',
      source: task.agentId || 'system',
      projectId: task.projectId,
      workspaceId,
      payload: {
        agentId: task.agentId,
        taskId: task.id,
        error,
      },
    });

    if (this._onProgress) {
      this._onProgress(task.id, `Agent ${task.agentId} failed: ${error}`);
    }
  }

  private _emitTaskCancelled(task: Task, workspaceId: string): void {
    this._eventBus.publish({
      type: 'task.cancelled',
      source: task.agentId || 'system',
      projectId: task.projectId,
      workspaceId,
      payload: {
        taskId: task.id,
        agentId: task.agentId,
      },
    });

    if (this._onProgress) {
      this._onProgress(task.id, `Agent ${task.agentId} task was cancelled`);
    }
  }

  private _emitAgentProgress(
    task: Task,
    workspaceId: string,
    progress: AgentProgress
  ): void {
    this._eventBus.publish({
      type: 'agent.progress',
      source: task.agentId || 'system',
      projectId: task.projectId,
      workspaceId,
      payload: {
        agentId: task.agentId,
        taskId: task.id,
        progress: progress.percent,
        currentTurn: progress.currentTurn,
        maxTurns: progress.maxTurns,
        message: progress.message,
        type: progress.type,
        toolName: progress.toolName,
      },
    });

    if (this._onProgress) {
      this._onProgress(task.id, progress.message, progress);
    }
  }
}

export function createAgentTaskHandler(
  options?: AgentTaskHandlerOptions
): AgentTaskHandler {
  return new DefaultAgentTaskHandler(options);
}

let defaultAgentTaskHandler: AgentTaskHandler | undefined;

export function getAgentTaskHandler(): AgentTaskHandler {
  if (!defaultAgentTaskHandler) {
    defaultAgentTaskHandler = createAgentTaskHandler();
  }
  return defaultAgentTaskHandler;
}

export function setAgentTaskHandler(handler: AgentTaskHandler): void {
  defaultAgentTaskHandler = handler;
}
