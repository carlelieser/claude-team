<script lang="ts">
  import { eventStore } from '$lib/stores/events.svelte';
  import EventCard from './event-card.svelte';
  import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '$lib/components/ui/empty';
  import ActivityIcon from 'lucide-svelte/icons/activity';

  interface Props {
    maxEvents?: number;
  }

  let { maxEvents = 50 }: Props = $props();

  const displayedEvents = $derived(eventStore.events.slice(0, maxEvents));
</script>

{#if eventStore.loading}
  <div class="flex items-center justify-center py-12">
    <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
  </div>
{:else if eventStore.error}
  <div class="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
    {eventStore.error}
  </div>
{:else if displayedEvents.length === 0}
  <Empty class="py-12">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <ActivityIcon />
      </EmptyMedia>
      <EmptyTitle>No events yet</EmptyTitle>
      <EmptyDescription>Events will appear here as agents work on tasks</EmptyDescription>
    </EmptyHeader>
  </Empty>
{:else}
  <div class="space-y-2">
    {#if eventStore.isStreaming}
      <div class="flex items-center gap-2 text-xs text-muted-foreground">
        <span class="relative flex h-2 w-2">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
          <span class="relative inline-flex h-2 w-2 rounded-full bg-success"></span>
        </span>
        Live streaming
      </div>
    {/if}

    {#each displayedEvents as event (event.id)}
      <EventCard {event} />
    {/each}

    {#if eventStore.events.length > maxEvents}
      <div class="text-center text-sm text-muted-foreground">
        Showing {maxEvents} of {eventStore.events.length} events
      </div>
    {/if}
  </div>
{/if}
