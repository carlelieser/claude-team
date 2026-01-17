<script lang="ts">
  import type { AgentDto } from '$lib/ipc/client';
  import { agentStore } from '$lib/stores/agents.svelte';
  import { taskStore } from '$lib/stores/tasks.svelte';
  import AgentActivityIndicator from './agent-activity-indicator.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';

  interface Props {
    agent: AgentDto;
  }

  let { agent }: Props = $props();

  let currentTask = $derived(
    agent.currentTaskId ? taskStore.getById(agent.currentTaskId) : null
  );

  const statusColors = {
    idle: 'bg-muted text-muted-foreground border-transparent',
    executing: 'bg-success-muted text-success-muted-foreground border-transparent',
    paused: 'bg-warning-muted text-warning-muted-foreground border-transparent',
  };

  const trustColors = {
    low: 'bg-destructive/10 text-destructive border-transparent',
    medium: 'bg-warning-muted text-warning-muted-foreground border-transparent',
    high: 'bg-info-muted text-info-muted-foreground border-transparent',
    full: 'bg-success-muted text-success-muted-foreground border-transparent',
  };

  async function handlePause() {
    await agentStore.pause(agent.id);
  }

  async function handleResume() {
    await agentStore.resume(agent.id);
  }
</script>

<Card.Root class="px-6">
  <div class="flex items-start justify-between">
    <div class="flex items-center gap-3">
      <AgentActivityIndicator status={agent.status} />
      <div>
        <h3 class="font-medium">{agent.name}</h3>
        <p class="text-sm text-muted-foreground">{agent.description}</p>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <Badge class={trustColors[agent.trustLevel]}>
        {agent.trustLevel}
      </Badge>
      <Badge class={statusColors[agent.status]}>
        {agent.status}
      </Badge>
    </div>
  </div>

  {#if currentTask}
    <div class="mt-4 rounded-lg bg-muted p-3">
      <div class="text-xs text-muted-foreground">Current Task</div>
      <div class="mt-1 text-sm font-medium">
        {currentTask.title}
      </div>
    </div>
  {/if}

  <div class="mt-4 flex gap-2">
    {#if agent.status === 'executing'}
      <Button variant="secondary" size="sm" onclick={handlePause}>
        Pause
      </Button>
    {:else if agent.status === 'paused'}
      <Button size="sm" onclick={handleResume}>
        Resume
      </Button>
    {:else}
      <Button variant="secondary" size="sm" disabled>
        Idle
      </Button>
    {/if}
  </div>
</Card.Root>
