<script lang="ts">
  import { taskStore } from '$lib/stores/tasks.svelte';
  import { projectStore } from '$lib/stores/projects.svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';

  let title = $state('');
  let submitting = $state(false);
  let error = $state<string | null>(null);
  let inputElement = $state<HTMLInputElement | null>(null);

  async function handleSubmit(e: Event) {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    const projectId = projectStore.currentProject?.id;
    if (!projectId) {
      error = 'No project selected';
      return;
    }

    submitting = true;
    error = null;

    const result = await taskStore.create({
      projectId,
      title: title.trim(),
    });

    submitting = false;

    if (result) {
      title = '';
      window.close();
    } else {
      error = taskStore.error || 'Failed to create task';
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      window.close();
    }

    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  }

  $effect(() => {
    if (inputElement) {
      inputElement.focus();
    }
  });
</script>

<svelte:window onkeydown={handleKeydown} />

<form class="p-4" onsubmit={handleSubmit}>
  {#if error}
    <div class="mb-3 rounded bg-destructive/10 p-2 text-xs text-destructive">
      {error}
    </div>
  {/if}

  <div class="relative">
    <Input
      type="text"
      class="pr-24 text-lg"
      placeholder="What needs to be done?"
      bind:value={title}
      bind:ref={inputElement}
      disabled={submitting}
    />

    <div class="absolute inset-y-0 right-2 flex items-center">
      <Button
        type="submit"
        size="sm"
        disabled={submitting || !title.trim()}
      >
        {submitting ? '...' : 'Add'}
      </Button>
    </div>
  </div>

  <div class="mt-3 flex items-center justify-between text-xs text-muted-foreground">
    <span>
      {#if projectStore.currentProject}
        Project: {projectStore.currentProject.name}
      {:else}
        No project selected
      {/if}
    </span>
    <span>
      <kbd class="rounded bg-muted px-1 py-0.5">Cmd+Enter</kbd> to submit,
      <kbd class="rounded bg-muted px-1 py-0.5">Esc</kbd> to close
    </span>
  </div>
</form>
