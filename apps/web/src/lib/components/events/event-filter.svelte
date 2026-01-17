<script lang="ts">
  import { eventStore } from '$lib/stores/events.svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Select, SelectTrigger, SelectContent, SelectItem } from '$lib/components/ui/select';

  const eventTypes = [
    { value: 'task.*', label: 'task.*' },
    { value: 'agent.*', label: 'agent.*' },
    { value: 'system.*', label: 'system.*' },
  ];

  let typeFilter = $state<string | undefined>(eventStore.filter.type);
  let sourceFilter = $state<string | undefined>(eventStore.filter.source);

  let selectedTypeLabel = $derived(typeFilter ?? 'All');

  function applyFilter() {
    eventStore.setFilter({
      ...eventStore.filter,
      type: typeFilter,
      source: sourceFilter,
    });
  }

  function clearFilter() {
    typeFilter = undefined;
    sourceFilter = undefined;
    eventStore.setFilter({});
  }

  async function toggleStreaming() {
    if (eventStore.isStreaming) {
      await eventStore.stopStreaming();
    } else {
      await eventStore.startStreaming();
    }
  }
</script>

<div class="flex flex-wrap items-center gap-4 rounded-lg border bg-card p-4">
    <Select type="single" bind:value={typeFilter}>
        <SelectTrigger aria-labelledby="type-filter-label">
            {selectedTypeLabel}
        </SelectTrigger>
        <SelectContent>
            {#each eventTypes as type}
                <SelectItem value={type.value}>{type.label}</SelectItem>
            {/each}
        </SelectContent>
    </Select>

  <div class="flex items-center gap-2">
    <label class="text-sm text-muted-foreground" for="source-filter">Source:</label>
    <Input
      id="source-filter"
      type="text"
      class="w-32"
      placeholder="Filter by source"
      bind:value={sourceFilter}
      onchange={applyFilter}
    />
  </div>

  <div class="flex items-center gap-2">
    <Button variant="ghost" size="sm" onclick={clearFilter}>
      Clear
    </Button>

    <Button
      variant={eventStore.isStreaming ? 'secondary' : 'default'}
      size="sm"
      onclick={toggleStreaming}
    >
      {eventStore.isStreaming ? 'Pause' : 'Resume'} Stream
    </Button>
  </div>

  <div class="ml-auto text-xs text-muted-foreground">
    {eventStore.events.length} events
  </div>
</div>
