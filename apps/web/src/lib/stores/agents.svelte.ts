/**
 * Agent store using Svelte 5 runes
 */

import { ipc, type AgentDto, type AgentProgressPayload } from '$lib/ipc/client';

class AgentStore {
  agents = $state<AgentDto[]>([]);
  loading = $state(false);
  error = $state<string | null>(null);

  activeAgents = $derived(this.agents.filter((a) => a.status === 'executing'));
  idleAgents = $derived(this.agents.filter((a) => a.status === 'idle'));
  pausedAgents = $derived(this.agents.filter((a) => a.status === 'paused'));

  private _unsubscribeProgress: (() => void) | null = null;

  async load(): Promise<void> {
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
      this.error = e instanceof Error ? e.message : 'Unknown error';
    } finally {
      this.loading = false;
    }
  }

  async pause(agentId: string): Promise<void> {
    const result = await ipc.agent.pause(agentId);

    if (result.ok) {
      const index = this.agents.findIndex((a) => a.id === agentId);
      if (index !== -1) {
        this.agents[index] = { ...this.agents[index]!, status: 'paused' };
      }
    }
  }

  async resume(agentId: string): Promise<void> {
    const result = await ipc.agent.resume(agentId);

    if (result.ok) {
      const agent = this.agents.find((a) => a.id === agentId);
      if (agent) {
        const newStatus = agent.currentTaskId ? 'executing' : 'idle';
        const index = this.agents.findIndex((a) => a.id === agentId);
        if (index !== -1) {
          this.agents[index] = { ...this.agents[index]!, status: newStatus };
        }
      }
    }
  }

  subscribe(): void {
    this._unsubscribeProgress = ipc.on.agentProgress((payload: AgentProgressPayload) => {
      const index = this.agents.findIndex((a) => a.id === payload.agentId);
      if (index !== -1) {
        this.agents[index] = {
          ...this.agents[index]!,
          status: 'executing',
          currentTaskId: payload.taskId,
        };
      }
    });
  }

  unsubscribe(): void {
    if (this._unsubscribeProgress) {
      this._unsubscribeProgress();
      this._unsubscribeProgress = null;
    }
  }

  getById(id: string): AgentDto | undefined {
    return this.agents.find((a) => a.id === id);
  }
}

export const agentStore = new AgentStore();
