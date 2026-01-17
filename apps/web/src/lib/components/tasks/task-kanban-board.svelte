<script lang="ts">
  import { taskStore } from '$lib/stores/tasks.svelte';
  import TaskCard from './task-card.svelte';
  import { Empty, EmptyHeader, EmptyMedia, EmptyDescription } from '$lib/components/ui/empty';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import InboxIcon from 'lucide-svelte/icons/inbox';

  const columns = [
    { key: 'pending', label: 'Pending', tasks: () => taskStore.pendingTasks },
    { key: 'in_progress', label: 'In Progress', tasks: () => taskStore.inProgressTasks },
    { key: 'completed', label: 'Completed', tasks: () => taskStore.completedTasks },
    { key: 'failed', label: 'Failed', tasks: () => taskStore.failedTasks },
  ] as const;
</script>

{#if taskStore.loading}
  <div class="flex items-center justify-center py-12">
    <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
  </div>
{:else if taskStore.error}
  <div class="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
    {taskStore.error}
  </div>
{:else}
  <div class="flex gap-4 overflow-x-auto pb-4">
    {#each columns as column}
      {@const columnTasks = column.tasks()}
      <div class="flex w-80 flex-shrink-0 flex-col gap-3">
        <div class="flex items-center justify-between">
          <h3 class="font-medium">{column.label}</h3>
          <Badge variant="secondary">{columnTasks.length}</Badge>
        </div>

        <div class="space-y-3 rounded-lg bg-muted p-3 min-h-[200px]">
          {#if columnTasks.length === 0}
            <Empty class="py-6">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <InboxIcon />
                </EmptyMedia>
                <EmptyDescription>No tasks</EmptyDescription>
              </EmptyHeader>
            </Empty>
          {:else}
            {#each columnTasks as task (task.id)}
              <TaskCard {task} compact />
            {/each}
          {/if}
        </div>
      </div>
    {/each}
  </div>
{/if}
