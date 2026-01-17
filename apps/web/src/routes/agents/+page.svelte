<script lang="ts">
  import { Header } from '$lib/components/layout';
  import { AgentList } from '$lib/components/agents';
  import { agentStore } from '$lib/stores/agents.svelte';
</script>

<Header title="Agents" subtitle="Monitor and control AI agents">
  {#snippet actions()}
    <div class="flex items-center gap-4 text-sm text-muted-foreground">
      <span>
        <span class="font-medium text-success">{agentStore.activeAgents.length}</span> active
      </span>
      <span>
        <span class="font-medium text-warning">{agentStore.pausedAgents.length}</span> paused
      </span>
      <span>
        <span class="font-medium">{agentStore.idleAgents.length}</span> idle
      </span>
    </div>
  {/snippet}
</Header>

<div class="flex-1 overflow-auto p-6">
  <AgentList />
</div>
