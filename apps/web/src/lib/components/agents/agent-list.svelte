<script lang="ts">
  import { agentStore } from '$lib/stores/agents.svelte';
  import AgentStatusCard from './agent-status-card.svelte';
  import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '$lib/components/ui/empty';
  import UsersIcon from 'lucide-svelte/icons/users';
</script>

{#if agentStore.loading}
  <div class="flex items-center justify-center py-12">
    <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
  </div>
{:else if agentStore.error}
  <div class="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
    {agentStore.error}
  </div>
{:else if agentStore.agents.length === 0}
  <Empty class="py-12">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <UsersIcon />
      </EmptyMedia>
      <EmptyTitle>No agents configured</EmptyTitle>
      <EmptyDescription>Add agent definitions to the agents/ directory</EmptyDescription>
    </EmptyHeader>
  </Empty>
{:else}
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {#each agentStore.agents as agent (agent.id)}
      <AgentStatusCard {agent} />
    {/each}
  </div>
{/if}
