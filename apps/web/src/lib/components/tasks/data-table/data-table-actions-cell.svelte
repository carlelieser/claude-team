<script lang="ts">
  import type { TaskDto } from '$lib/ipc/client';
  import { Button } from '$lib/components/ui/button';

  interface Props {
    readonly task: TaskDto;
    readonly onCancel: (taskId: string) => void;
  }

  const { task, onCancel }: Props = $props();

  const canCancel = $derived(task.status === 'pending' || task.status === 'in_progress');
</script>

<div class="text-right">
  {#if canCancel}
    <Button
      variant="ghost"
      size="sm"
      class="text-red-600 hover:text-red-700 hover:bg-red-50"
      onclick={() => onCancel(task.id)}
    >
      Cancel
    </Button>
  {/if}
</div>
