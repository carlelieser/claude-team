<script lang="ts">
  import { taskStore } from '$lib/stores/tasks.svelte';
  import { agentStore } from '$lib/stores/agents.svelte';
  import { projectStore } from '$lib/stores/projects.svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Select, SelectTrigger, SelectContent, SelectItem } from '$lib/components/ui/select';

  interface Props {
    onClose?: () => void;
  }

  let { onClose }: Props = $props();

  let title = $state('');
  let description = $state('');
  let agentId = $state<string | undefined>(undefined);
  let priorityValue = $state<string>('0');
  let submitting = $state(false);
  let error = $state<string | null>(null);

  const priority = $derived(parseInt(priorityValue, 10));

  const priorityOptions = [
    { value: '0', label: 'Low' },
    { value: '1', label: 'Medium' },
    { value: '2', label: 'High' },
    { value: '3', label: 'Urgent' },
  ];

  const selectedAgentLabel = $derived(
    agentId ? agentStore.agents.find((a) => a.id === agentId)?.name ?? 'Unknown' : 'Auto-assign'
  );

  const selectedPriorityLabel = $derived(
    priorityOptions.find((p) => p.value === priorityValue)?.label ?? 'Low'
  );

  async function handleSubmit(e: Event) {
    e.preventDefault();

    if (!title.trim()) {
      error = 'Title is required';
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
      description: description.trim() || undefined,
      agentId: agentId || undefined,
      priority,
    });

    submitting = false;

    if (result) {
      title = '';
      description = '';
      agentId = undefined;
      priorityValue = '0';
      onClose?.();
    } else {
      error = taskStore.error || 'Failed to create task';
    }
  }
</script>

<form class="space-y-4" onsubmit={handleSubmit}>
  {#if error}
    <div class="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
      {error}
    </div>
  {/if}

  <div>
    <label class="mb-1 block text-sm font-medium" for="title">
      Title
    </label>
    <Input
      id="title"
      type="text"
      placeholder="What needs to be done?"
      bind:value={title}
      required
    />
  </div>

  <div>
    <label class="mb-1 block text-sm font-medium" for="description">
      Description
    </label>
    <textarea
      id="description"
      class="flex min-h-[80px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
      placeholder="Add more details..."
      bind:value={description}
    ></textarea>
  </div>

  <div class="grid gap-4 sm:grid-cols-2">
    <div>
      <label class="mb-1 block text-sm font-medium" id="agent-label">
        Assign to Agent
      </label>
      <Select type="single" bind:value={agentId}>
        <SelectTrigger class="w-full" aria-labelledby="agent-label">
          {selectedAgentLabel}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={undefined}>Auto-assign</SelectItem>
          {#each agentStore.agents as agent}
            <SelectItem value={agent.id}>{agent.name}</SelectItem>
          {/each}
        </SelectContent>
      </Select>
    </div>

    <div>
      <label class="mb-1 block text-sm font-medium" id="priority-label">
        Priority
      </label>
      <Select type="single" bind:value={priorityValue}>
        <SelectTrigger class="w-full" aria-labelledby="priority-label">
          {selectedPriorityLabel}
        </SelectTrigger>
        <SelectContent>
          {#each priorityOptions as option}
            <SelectItem value={option.value}>{option.label}</SelectItem>
          {/each}
        </SelectContent>
      </Select>
    </div>
  </div>

  <div class="flex justify-end gap-3 border-t pt-4">
    {#if onClose}
      <Button type="button" variant="secondary" onclick={onClose}>
        Cancel
      </Button>
    {/if}
    <Button type="submit" disabled={submitting}>
      {submitting ? 'Creating...' : 'Create Task'}
    </Button>
  </div>
</form>
