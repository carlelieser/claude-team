/**
 * Project store using Svelte 5 runes
 */

import { ipc, type ProjectDto, type WorkspaceDto } from '$lib/ipc/client';

class ProjectStore {
  currentProject = $state<ProjectDto | null>(null);
  currentWorkspace = $state<WorkspaceDto | null>(null);
  projects = $state<ProjectDto[]>([]);
  workspaces = $state<WorkspaceDto[]>([]);
  loading = $state(false);
  error = $state<string | null>(null);

  recentProjects = $derived(
    [...this.projects]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
  );

  async loadWorkspaces(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      const result = await ipc.workspace.list();

      if (result.ok) {
        this.workspaces = [...result.value];
      } else {
        this.error = result.error.message;
      }
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Unknown error';
    } finally {
      this.loading = false;
    }
  }

  async loadProjects(workspaceId?: string): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      const result = await ipc.project.list(workspaceId);

      if (result.ok) {
        this.projects = [...result.value];
      } else {
        this.error = result.error.message;
      }
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Unknown error';
    } finally {
      this.loading = false;
    }
  }

  async loadCurrent(): Promise<void> {
    try {
      const [projectResult, workspaceResult] = await Promise.all([
        ipc.project.getCurrent(),
        ipc.workspace.getCurrent(),
      ]);

      if (projectResult.ok) {
        this.currentProject = projectResult.value;
      }

      if (workspaceResult.ok) {
        this.currentWorkspace = workspaceResult.value;
      }
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Unknown error';
    }
  }

  async switchProject(projectId: string): Promise<boolean> {
    try {
      const result = await ipc.project.switch(projectId);

      if (result.ok) {
        await this.loadCurrent();
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

  getProjectById(id: string): ProjectDto | undefined {
    return this.projects.find((p) => p.id === id);
  }

  getWorkspaceById(id: string): WorkspaceDto | undefined {
    return this.workspaces.find((w) => w.id === id);
  }
}

export const projectStore = new ProjectStore();
