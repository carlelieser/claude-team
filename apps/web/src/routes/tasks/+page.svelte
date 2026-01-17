<script lang="ts">
  import { Header } from '$lib/components/layout';
  import { TaskKanbanBoard, TaskList, TaskCreateForm } from '$lib/components/tasks';
  import { taskStore, type ViewMode } from '$lib/stores/tasks.svelte';
  import { Button } from '$lib/components/ui/button';

  let showCreateForm = $state(false);
</script>

<Header title="Tasks" subtitle="Manage and track task progress">
  {#snippet actions()}
    <div class="flex items-center gap-2">
      <div class="flex rounded-lg border bg-muted p-1">
        <button
          class="rounded px-2 py-1 text-xs font-medium transition-colors {taskStore.viewMode === 'kanban'
            ? 'bg-card shadow-sm'
            : 'text-muted-foreground hover:text-foreground'}"
          onclick={() => taskStore.setViewMode('kanban')}
        >
          Kanban
        </button>
        <button
          class="rounded px-2 py-1 text-xs font-medium transition-colors {taskStore.viewMode === 'list'
            ? 'bg-card shadow-sm'
            : 'text-muted-foreground hover:text-foreground'}"
          onclick={() => taskStore.setViewMode('list')}
        >
          List
        </button>
      </div>

      <Button onclick={() => (showCreateForm = true)}>
        New Task
      </Button>
    </div>
  {/snippet}
</Header>

<div class="flex-1 overflow-auto p-6">
  {#if taskStore.viewMode === 'kanban'}
    <TaskKanbanBoard />
  {:else}
    <TaskList />
  {/if}
</div>

{#if showCreateForm}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="w-full max-w-md rounded-xl bg-card p-6 shadow-xl">
      <h2 class="mb-4 text-lg font-semibold">Create New Task</h2>
      <TaskCreateForm onClose={() => (showCreateForm = false)} />
    </div>
  </div>
{/if}
