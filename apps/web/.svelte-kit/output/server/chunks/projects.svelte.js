import { q as derived } from "./index.js";
import { i as ipc } from "./button.js";
class ProjectStore {
  currentProject = null;
  currentWorkspace = null;
  projects = [];
  workspaces = [];
  loading = false;
  error = null;
  #recentProjects = derived(() => [...this.projects].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5));
  get recentProjects() {
    return this.#recentProjects();
  }
  set recentProjects($$value) {
    return this.#recentProjects($$value);
  }
  async loadWorkspaces() {
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
      this.error = e instanceof Error ? e.message : "Unknown error";
    } finally {
      this.loading = false;
    }
  }
  async loadProjects(workspaceId) {
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
      this.error = e instanceof Error ? e.message : "Unknown error";
    } finally {
      this.loading = false;
    }
  }
  async loadCurrent() {
    try {
      const [projectResult, workspaceResult] = await Promise.all([ipc.project.getCurrent(), ipc.workspace.getCurrent()]);
      if (projectResult.ok) {
        this.currentProject = projectResult.value;
      }
      if (workspaceResult.ok) {
        this.currentWorkspace = workspaceResult.value;
      }
    } catch (e) {
      this.error = e instanceof Error ? e.message : "Unknown error";
    }
  }
  async switchProject(projectId) {
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
      this.error = e instanceof Error ? e.message : "Unknown error";
      return false;
    }
  }
  getProjectById(id) {
    return this.projects.find((p) => p.id === id);
  }
  getWorkspaceById(id) {
    return this.workspaces.find((w) => w.id === id);
  }
}
const projectStore = new ProjectStore();
export {
  projectStore as p
};
//# sourceMappingURL=projects.svelte.js.map
