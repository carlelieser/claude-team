import { q as derived } from "./index.js";
import { i as ipc } from "./button.js";
class AgentStore {
  agents = [];
  loading = false;
  error = null;
  #activeAgents = derived(() => this.agents.filter((a) => a.status === "executing"));
  get activeAgents() {
    return this.#activeAgents();
  }
  set activeAgents($$value) {
    return this.#activeAgents($$value);
  }
  #idleAgents = derived(() => this.agents.filter((a) => a.status === "idle"));
  get idleAgents() {
    return this.#idleAgents();
  }
  set idleAgents($$value) {
    return this.#idleAgents($$value);
  }
  #pausedAgents = derived(() => this.agents.filter((a) => a.status === "paused"));
  get pausedAgents() {
    return this.#pausedAgents();
  }
  set pausedAgents($$value) {
    return this.#pausedAgents($$value);
  }
  _unsubscribeProgress = null;
  async load() {
    this.loading = true;
    this.error = null;
    try {
      const result = await ipc.agent.list();
      if (result.ok) {
        this.agents = [...result.value];
      } else {
        this.error = result.error.message;
      }
    } catch (e) {
      this.error = e instanceof Error ? e.message : "Unknown error";
    } finally {
      this.loading = false;
    }
  }
  async pause(agentId) {
    const result = await ipc.agent.pause(agentId);
    if (result.ok) {
      const index = this.agents.findIndex((a) => a.id === agentId);
      if (index !== -1) {
        this.agents[index] = { ...this.agents[index], status: "paused" };
      }
    }
  }
  async resume(agentId) {
    const result = await ipc.agent.resume(agentId);
    if (result.ok) {
      const agent = this.agents.find((a) => a.id === agentId);
      if (agent) {
        const newStatus = agent.currentTaskId ? "executing" : "idle";
        const index = this.agents.findIndex((a) => a.id === agentId);
        if (index !== -1) {
          this.agents[index] = { ...this.agents[index], status: newStatus };
        }
      }
    }
  }
  subscribe() {
    this._unsubscribeProgress = ipc.on.agentProgress((payload) => {
      const index = this.agents.findIndex((a) => a.id === payload.agentId);
      if (index !== -1) {
        this.agents[index] = {
          ...this.agents[index],
          status: "executing",
          currentTaskId: payload.taskId
        };
      }
    });
  }
  unsubscribe() {
    if (this._unsubscribeProgress) {
      this._unsubscribeProgress();
      this._unsubscribeProgress = null;
    }
  }
  getById(id) {
    return this.agents.find((a) => a.id === id);
  }
}
const agentStore = new AgentStore();
export {
  agentStore as a
};
//# sourceMappingURL=agents.svelte.js.map
