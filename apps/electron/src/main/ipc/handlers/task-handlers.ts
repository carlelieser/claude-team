/**
 * Task-related IPC handlers
 */

import { ipcMain } from 'electron';
import { success, failure, type Failure } from '@claude-team/core';
import type { ServiceContainer } from '../../services/service-container.js';
import type { WindowManager } from '../../windows/window-manager.js';
import type { IpcResult } from '../channels.js';
import type {
  TaskDto,
  CreateTaskDto,
  UpdateTaskDto,
  TaskFilterDto,
} from '../../../types/dto.js';
import type { AppState } from '../../../types/index.js';

export interface TaskHandlersConfig {
  readonly services: ServiceContainer;
  readonly windows: WindowManager;
  readonly getState: () => AppState;
}

function mapTask(task: {
  id: string;
  projectId: string;
  agentId: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: number;
  parentId: string | null;
  createdAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  error: string | null;
}): TaskDto {
  return {
    id: task.id,
    projectId: task.projectId,
    agentId: task.agentId,
    title: task.title,
    description: task.description,
    status: task.status as TaskDto['status'],
    priority: task.priority,
    parentId: task.parentId,
    createdAt: task.createdAt.toISOString(),
    startedAt: task.startedAt?.toISOString() ?? null,
    completedAt: task.completedAt?.toISOString() ?? null,
    error: task.error,
  };
}

export function registerTaskHandlers(config: TaskHandlersConfig): void {
  const { services, windows, getState } = config;

  ipcMain.handle(
    'task:list',
    async (
      _event,
      filter?: TaskFilterDto
    ): Promise<IpcResult<readonly TaskDto[]>> => {
      try {
        let tasks;

        if (filter?.projectId && filter?.status) {
          tasks = await services.taskRepository.findByProjectAndStatus(
            filter.projectId,
            filter.status
          );
        } else if (filter?.projectId) {
          tasks = await services.taskRepository.findByProjectId(
            filter.projectId
          );
        } else if (filter?.status) {
          tasks = await services.taskRepository.findByStatus(filter.status);
        } else {
          tasks = await services.taskRepository.findMany();
        }

        return success(tasks.map(mapTask));
      } catch (error) {
        return failure({
          type: 'unknown',
          message: error instanceof Error ? error.message : String(error),
        } as Failure);
      }
    }
  );

  ipcMain.handle(
    'task:get',
    async (_event, id: string): Promise<IpcResult<TaskDto>> => {
      try {
        const task = await services.taskRepository.findById(id);

        if (!task) {
          return failure({
            type: 'notFound',
            message: `Task not found: ${id}`,
            resource: 'task',
          });
        }

        return success(mapTask(task));
      } catch (error) {
        return failure({
          type: 'unknown',
          message: error instanceof Error ? error.message : String(error),
        } as Failure);
      }
    }
  );

  ipcMain.handle(
    'task:create',
    async (_event, data: CreateTaskDto): Promise<IpcResult<TaskDto>> => {
      try {
        const state = getState();
        const projectId = data.projectId || state.currentProjectId;

        if (!projectId) {
          return failure({
            type: 'validation',
            message: 'No project selected',
            fields: { projectId: 'Project ID is required' },
          });
        }

        // Look up the project to get workspaceId and path
        const project = await services.projectRepository.findById(projectId);
        if (!project) {
          return failure({
            type: 'notFound',
            message: `Project not found: ${projectId}`,
            resource: 'project',
          });
        }

        const dbTask = await services.taskRepository.createTask({
          projectId,
          agentId: data.agentId ?? null,
          title: data.title,
          description: data.description ?? null,
          priority: data.priority ?? 0,
          parentId: data.parentId ?? null,
        });

        const queueInput = {
          id: dbTask.id,
          projectId,
          title: data.title,
          metadata: {
            cwd: project.path,
            workspaceId: project.workspaceId,
            message: data.description ?? data.title,
          },
          ...(data.agentId !== undefined && { agentId: data.agentId }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.priority !== undefined && { priority: data.priority }),
          ...(data.parentId !== undefined && { parentId: data.parentId }),
        };

        const queueResult = services.taskQueue.create(queueInput);

        if (!queueResult.ok) {
          services.logger.warn('Failed to add task to queue', {
            taskId: dbTask.id,
            error: queueResult.error.message,
          });
        }

        const taskDto = mapTask(dbTask);

        windows.broadcastToAll('task:updated', taskDto);

        services.logger.info('Task created', {
          taskId: dbTask.id,
          projectId,
          title: data.title,
        });

        return success(taskDto);
      } catch (error) {
        return failure({
          type: 'unknown',
          message: error instanceof Error ? error.message : String(error),
        } as Failure);
      }
    }
  );

  ipcMain.handle(
    'task:update',
    async (
      _event,
      id: string,
      data: UpdateTaskDto
    ): Promise<IpcResult<TaskDto>> => {
      try {
        const updateData = {
          ...(data.title !== undefined && { title: data.title }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.status !== undefined && { status: data.status }),
          ...(data.priority !== undefined && { priority: data.priority }),
          ...(data.agentId !== undefined && { agentId: data.agentId }),
        };

        const task = await services.taskRepository.update(id, updateData);

        if (!task) {
          return failure({
            type: 'notFound',
            message: `Task not found: ${id}`,
            resource: 'task',
          });
        }

        const taskDto = mapTask(task);

        windows.broadcastToAll('task:updated', taskDto);

        services.logger.info('Task updated', {
          taskId: id,
          changes: Object.keys(data),
        });

        return success(taskDto);
      } catch (error) {
        return failure({
          type: 'unknown',
          message: error instanceof Error ? error.message : String(error),
        } as Failure);
      }
    }
  );

  ipcMain.handle(
    'task:cancel',
    async (_event, id: string): Promise<IpcResult<void>> => {
      try {
        const isRunning = services.agentTaskHandler.isTaskRunning(id);

        if (isRunning) {
          services.logger.info('Cancelling running task', { taskId: id });
          services.agentTaskHandler.cancelTask(id, 'User requested cancellation');
        }

        const task = await services.taskRepository.cancelTask(id);

        if (!task) {
          return failure({
            type: 'notFound',
            message: `Task not found: ${id}`,
            resource: 'task',
          });
        }

        services.taskQueue.update(id, { status: 'canceled' });

        const taskDto = mapTask(task);

        windows.broadcastToAll('task:updated', taskDto);

        services.logger.info('Task canceled', { taskId: id, wasRunning: isRunning });

        return success(undefined);
      } catch (error) {
        return failure({
          type: 'unknown',
          message: error instanceof Error ? error.message : String(error),
        } as Failure);
      }
    }
  );
}
