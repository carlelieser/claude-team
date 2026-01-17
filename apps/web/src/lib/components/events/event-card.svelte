<script lang="ts">
  import type { EventDto } from '$lib/ipc/client';
  import { Badge } from '$lib/components/ui/badge';

  interface Props {
    event: EventDto;
  }

  let { event }: Props = $props();

  const typeColors: Record<string, string> = {
    'task.': 'bg-info-muted text-info-muted-foreground border-transparent',
    'agent.': 'bg-accent text-accent-foreground border-transparent',
    'system.': 'bg-muted text-muted-foreground border-transparent',
    'error': 'bg-destructive/10 text-destructive border-transparent',
  };

  function getTypeColor(type: string): string {
    for (const [prefix, color] of Object.entries(typeColors)) {
      if (type.startsWith(prefix)) {
        return color;
      }
    }
    return 'bg-muted text-muted-foreground border-transparent';
  }

  function formatPayload(payload: Record<string, unknown>): string {
    return JSON.stringify(payload, null, 2);
  }

  let expanded = $state(false);
</script>

<div class="rounded-lg border bg-card p-3 text-sm">
  <div class="flex items-start justify-between gap-3">
    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2">
        <Badge class={getTypeColor(event.type)}>
          {event.type}
        </Badge>
        <span class="text-xs text-muted-foreground">
          {new Date(event.timestamp).toLocaleTimeString()}
        </span>
      </div>

      <div class="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
        <span>Source: {event.source}</span>
        {#if event.processed}
          <span class="text-success">Processed</span>
        {/if}
      </div>
    </div>

    <button
      class="flex-shrink-0 p-1 text-muted-foreground hover:text-foreground"
      onclick={() => (expanded = !expanded)}
      aria-expanded={expanded}
      aria-label={expanded ? 'Collapse event details' : 'Expand event details'}
    >
      <svg
        class="h-4 w-4 transition-transform {expanded ? 'rotate-180' : ''}"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>
  </div>

  {#if expanded}
    <div class="mt-3 overflow-x-auto rounded bg-muted p-2">
      <pre class="text-xs">{formatPayload(event.payload)}</pre>
    </div>
  {/if}
</div>
