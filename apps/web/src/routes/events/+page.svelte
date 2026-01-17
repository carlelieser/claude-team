<script lang="ts">
  import { Header } from '$lib/components/layout';
  import { EventStream, EventFilter } from '$lib/components/events';
  import { eventStore } from '$lib/stores/events.svelte';
  import { Button } from '$lib/components/ui/button';
</script>

<Header title="Events" subtitle="Real-time activity stream">
  {#snippet actions()}
    <Button variant="secondary" size="sm" onclick={() => eventStore.clearEvents()}>
      Clear Events
    </Button>
  {/snippet}
</Header>

<div class="flex-1 overflow-auto p-4">
  <EventFilter />

  <div class="mt-4">
    <EventStream maxEvents={100} />
  </div>
</div>
