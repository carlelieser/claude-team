import { q as derived } from "./index.js";
import { i as ipc } from "./button.js";
class TaskStore {
  tasks = [];
  loading = false;
  error = null;
  filter = {};
  viewMode = "kanban";
  #pendingTasks = derived(() => this.tasks.filter((t) => t.status === "pending"));
  get pendingTasks() {
    return this.#pendingTasks();
  }
  set pendingTasks($$value) {
    return this.#pendingTasks($$value);
  }
  #inProgressTasks = derived(() => this.tasks.filter((t) => t.status === "in_progress"));
  get inProgressTasks() {
    return this.#inProgressTasks();
  }
  set inProgressTasks($$value) {
    return this.#inProgressTasks($$value);
  }
  #completedTasks = derived(() => this.tasks.filter((t) => t.status === "completed"));
  get completedTasks() {
    return this.#completedTasks();
  }
  set completedTasks($$value) {
    return this.#completedTasks($$value);
  }
  #failedTasks = derived(() => this.tasks.filter((t) => t.status === "failed"));
  get failedTasks() {
    return this.#failedTasks();
  }
  set failedTasks($$value) {
    return this.#failedTasks($$value);
  }
  #canceledTasks = derived(() => this.tasks.filter((t) => t.status === "canceled"));
  get canceledTasks() {
    return this.#canceledTasks();
  }
  set canceledTasks($$value) {
    return this.#canceledTasks($$value);
  }
  _unsubscribeUpdated = null;
  async load(filter) {
    this.loading = true;
    this.error = null;
    if (filter) {
      this.filter = filter;
    }
    try {
      const result = await ipc.task.list(this.filter);
      if (result.ok) {
        this.tasks = [...result.value];
      } else {
        this.error = result.error.message;
      }
    } catch (e) {
      this.error = e instanceof Error ? e.message : "Unknown error";
    } finally {
      this.loading = false;
    }
  }
  async create(data) {
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
      this.error = e instanceof Error ? e.message : "Unknown error";
      return null;
    }
  }
  async update(id, data) {
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
      this.error = e instanceof Error ? e.message : "Unknown error";
      return null;
    }
  }
  async cancel(id) {
    try {
      const result = await ipc.task.cancel(id);
      if (result.ok) {
        const index = this.tasks.findIndex((t) => t.id === id);
        if (index !== -1) {
          this.tasks[index] = { ...this.tasks[index], status: "canceled" };
        }
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
  setFilter(filter) {
    this.filter = filter;
    this.load();
  }
  setViewMode(mode) {
    this.viewMode = mode;
  }
  subscribe() {
    this._unsubscribeUpdated = ipc.on.taskUpdated((task) => {
      const index = this.tasks.findIndex((t) => t.id === task.id);
      if (index !== -1) {
        this.tasks[index] = task;
      } else {
        this.tasks = [...this.tasks, task];
      }
    });
  }
  unsubscribe() {
    if (this._unsubscribeUpdated) {
      this._unsubscribeUpdated();
      this._unsubscribeUpdated = null;
    }
  }
  getById(id) {
    return this.tasks.find((t) => t.id === id);
  }
  getByStatus(status) {
    return this.tasks.filter((t) => t.status === status);
  }
}
const taskStore = new TaskStore();
export {
  taskStore as t
};
//# sourceMappingURL=tasks.svelte.js.map
