<script lang="ts">
  import { taskStore } from '$lib/stores/tasks.svelte';
  import { agentStore } from '$lib/stores/agents.svelte';
  import { TaskDataTable, createColumns } from './data-table';

  const columns = $derived(
    createColumns({
      getAgentById: (id: string) => agentStore.getById(id),
      onCancel: (taskId: string) => taskStore.cancel(taskId),
    })
  );
</script>

{#if taskStore.loading}
  <div class="flex items-center justify-center py-12">
    <div
      class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
    ></div>
  </div>
{:else if taskStore.error}
  <div class="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
    {taskStore.error}
  </div>
{:else}
  <TaskDataTable {columns} data={taskStore.tasks} />
{/if}
