/**
 * Project-related IPC handlers
 */

import { ipcMain } from 'electron';
import { success, failure, type Failure } from '@claude-team/core';
import type { ServiceContainer } from '../../services/service-container.js';
import type { IpcResult } from '../channels.js';
import type { WorkspaceDto, ProjectDto } from '../../../types/dto.js';
import type { AppState } from '../../../types/index.js';

export interface ProjectHandlersConfig {
  readonly services: ServiceContainer;
  readonly getState: () => AppState;
  readonly updateState: (updates: Partial<AppState>) => void;
}

function mapWorkspace(workspace: {
  id: string;
  name: string;
  path: string;
  createdAt: Date;
}): WorkspaceDto {
  return {
    id: workspace.id,
    name: workspace.name,
    path: workspace.path,
    createdAt: workspace.createdAt.toISOString(),
    projectCount: 0,
  };
}

function mapProject(project: {
  id: string;
  workspaceId: string;
  name: string;
  path: string;
  createdAt: Date;
  updatedAt: Date;
  autonomyMode?: string;
  indexedAt?: Date | null;
  config?: unknown;
}): ProjectDto {
  return {
    id: project.id,
    workspaceId: project.workspaceId,
    name: project.name,
    path: project.path,
    description: null,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

export function registerProjectHandlers(config: ProjectHandlersConfig): void {
  const { services, getState, updateState } = config;

  ipcMain.handle(
    'workspace:list',
    async (): Promise<IpcResult<readonly WorkspaceDto[]>> => {
      try {
        const workspaces = await services.workspaceRepository.findMany();
        return success(workspaces.map(mapWorkspace));
      } catch (error) {
        return failure({
          type: 'unknown',
          message: error instanceof Error ? error.message : String(error),
        } as Failure);
      }
    }
  );

  ipcMain.handle(
    'workspace:get',
    async (_event, id: string): Promise<IpcResult<WorkspaceDto>> => {
      try {
        const workspace = await services.workspaceRepository.findById(id);

        if (!workspace) {
          return failure({
            type: 'notFound',
            message: `Workspace not found: ${id}`,
            resource: 'workspace',
          });
        }

        return success(mapWorkspace(workspace));
      } catch (error) {
        return failure({
          type: 'unknown',
          message: error instanceof Error ? error.message : String(error),
        } as Failure);
      }
    }
  );

  ipcMain.handle(
    'workspace:getCurrent',
    async (): Promise<IpcResult<WorkspaceDto | null>> => {
      try {
        const state = getState();

        if (!state.currentWorkspaceId) {
          return success(null);
        }

        const workspace = await services.workspaceRepository.findById(
          state.currentWorkspaceId
        );

        if (!workspace) {
          return success(null);
        }

        return success(mapWorkspace(workspace));
      } catch (error) {
        return failure({
          type: 'unknown',
          message: error instanceof Error ? error.message : String(error),
        } as Failure);
      }
    }
  );

  ipcMain.handle(
    'project:list',
    async (
      _event,
      workspaceId?: string
    ): Promise<IpcResult<readonly ProjectDto[]>> => {
      try {
        const projects = workspaceId
          ? await services.projectRepository.findByWorkspaceId(workspaceId)
          : await services.projectRepository.findMany();

        return success(projects.map(mapProject));
      } catch (error) {
        return failure({
          type: 'unknown',
          message: error instanceof Error ? error.message : String(error),
        } as Failure);
      }
    }
  );

  ipcMain.handle(
    'project:get',
    async (_event, id: string): Promise<IpcResult<ProjectDto>> => {
      try {
        const project = await services.projectRepository.findById(id);

        if (!project) {
          return failure({
            type: 'notFound',
            message: `Project not found: ${id}`,
            resource: 'project',
          });
        }

        return success(mapProject(project));
      } catch (error) {
        return failure({
          type: 'unknown',
          message: error instanceof Error ? error.message : String(error),
        } as Failure);
      }
    }
  );

  ipcMain.handle(
    'project:getCurrent',
    async (): Promise<IpcResult<ProjectDto | null>> => {
      try {
        const state = getState();

        if (!state.currentProjectId) {
          return success(null);
        }

        const project = await services.projectRepository.findById(
          state.currentProjectId
        );

        if (!project) {
          return success(null);
        }

        return success(mapProject(project));
      } catch (error) {
        return failure({
          type: 'unknown',
          message: error instanceof Error ? error.message : String(error),
        } as Failure);
      }
    }
  );

  ipcMain.handle(
    'project:switch',
    async (_event, id: string): Promise<IpcResult<void>> => {
      try {
        const project = await services.projectRepository.findById(id);

        if (!project) {
          return failure({
            type: 'notFound',
            message: `Project not found: ${id}`,
            resource: 'project',
          });
        }

        updateState({
          currentProjectId: project.id,
          currentWorkspaceId: project.workspaceId,
        });

        services.logger.info('Switched project', {
          projectId: project.id,
          workspaceId: project.workspaceId,
        });

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
