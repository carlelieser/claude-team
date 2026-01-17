<script lang="ts">
  import type { TaskStatus } from '@claude-team/core';
  import { Badge } from '$lib/components/ui/badge';

  interface Props {
    readonly status: TaskStatus;
  }

  const { status }: Props = $props();

  const STATUS_COLORS: Record<TaskStatus, string> = {
    pending: 'bg-muted text-muted-foreground border-transparent',
    in_progress: 'bg-blue-100 text-blue-700 border-transparent',
    completed: 'bg-green-100 text-green-700 border-transparent',
    failed: 'bg-red-100 text-red-700 border-transparent',
    canceled: 'bg-muted text-muted-foreground border-transparent',
  };

  const displayStatus = $derived(status.replace('_', ' '));
</script>

<Badge class={STATUS_COLORS[status]}>
  {displayStatus}
</Badge>
