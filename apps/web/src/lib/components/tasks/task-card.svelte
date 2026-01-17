<script lang="ts">
  import type { TaskDto } from '$lib/ipc/client';
  import { agentStore } from '$lib/stores/agents.svelte';
  import { taskStore } from '$lib/stores/tasks.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';

  interface Props {
    task: TaskDto;
    compact?: boolean;
  }

  let { task, compact = false }: Props = $props();

  const agent = $derived(task.agentId ? agentStore.getById(task.agentId) : null);

  const statusColors = {
    pending: 'bg-muted text-muted-foreground border-transparent',
    in_progress: 'bg-info-muted text-info-muted-foreground border-transparent',
    completed: 'bg-success-muted text-success-muted-foreground border-transparent',
    failed: 'bg-destructive/10 text-destructive border-transparent',
    canceled: 'bg-muted text-muted-foreground border-transparent',
  };

  const priorityLabels: Record<number, string> = {
    0: 'Low',
    1: 'Medium',
    2: 'High',
    3: 'Urgent',
  };

  async function handleCancel() {
    await taskStore.cancel(task.id);
  }
</script>

<Card.Root class="px-6 {compact ? 'py-4' : ''}">
  <div class="flex items-start justify-between gap-4">
    <div class="min-w-0 flex-1">
      <h4 class="truncate font-medium">{task.title}</h4>
      {#if !compact && task.description}
        <p class="mt-1 text-sm text-muted-foreground">{task.description}</p>
      {/if}
    </div>

    <Badge class={statusColors[task.status]}>
      {task.status.replace('_', ' ')}
    </Badge>
  </div>

  <div class="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
    {#if agent}
      <span class="flex items-center gap-1">
        <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        {agent.name}
      </span>
    {/if}

    {#if task.priority > 0}
      <span
        class="rounded px-1.5 py-0.5 {task.priority >= 2
          ? 'bg-destructive/10 text-destructive'
          : 'bg-warning-muted text-warning-muted-foreground'}"
      >
        {priorityLabels[task.priority] ?? 'Normal'}
      </span>
    {/if}

    <span>
      {new Date(task.createdAt).toLocaleDateString()}
    </span>
  </div>

  {#if !compact && (task.status === 'pending' || task.status === 'in_progress')}
    <div class="mt-4 border-t pt-4">
      <Button variant="ghost" size="sm" class="text-destructive hover:text-destructive/80" onclick={handleCancel}>
        Cancel
      </Button>
    </div>
  {/if}
</Card.Root>
