<script lang="ts">
  import type { ApprovalDto } from '$lib/ipc/client';
  import { agentStore } from '$lib/stores/agents.svelte';
  import { approvalStore } from '$lib/stores/approvals.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';

  interface Props {
    approval: ApprovalDto;
    compact?: boolean;
    onSelect?: (approval: ApprovalDto) => void;
  }

  let { approval, compact = false, onSelect }: Props = $props();

  let agent = $derived(agentStore.getById(approval.agentId));

  const statusColors = {
    pending: 'bg-warning-muted text-warning-muted-foreground',
    approved: 'bg-success-muted text-success-muted-foreground',
    rejected: 'bg-destructive/10 text-destructive',
  };

  const actionTypeIcons: Record<string, string> = {
    file_write: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    file_read: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    shell_execute: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    file_delete: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  };

  let processing = $state(false);

  async function handleApprove(e: MouseEvent) {
    e.stopPropagation();
    processing = true;
    try {
      await approvalStore.approve(approval.id);
    } finally {
      processing = false;
    }
  }

  async function handleReject(e: MouseEvent) {
    e.stopPropagation();
    processing = true;
    try {
      await approvalStore.reject(approval.id);
    } finally {
      processing = false;
    }
  }

  function handleClick() {
    onSelect?.(approval);
  }

  function formatActionType(type: string): string {
    return type.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }
</script>

<Card.Root
  role="button"
  tabindex={0}
  class="w-full cursor-pointer px-6 text-left transition-shadow hover:shadow-md {compact ? 'py-4' : ''} {processing ? 'pointer-events-none opacity-50' : ''}"
  onclick={handleClick}
  onkeydown={(e) => e.key === 'Enter' && handleClick()}
>
  <div class="flex items-start justify-between gap-4">
    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2">
        <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d={actionTypeIcons[approval.actionType] ?? actionTypeIcons['file_write']} />
          </svg>
        </span>
        <div>
          <h4 class="font-medium">
            {formatActionType(approval.actionType)}
          </h4>
          {#if approval.target}
            <p class="text-xs text-muted-foreground font-mono truncate max-w-xs">
              {approval.target}
            </p>
          {/if}
        </div>
      </div>

      {#if !compact && approval.reasoning}
        <p class="mt-2 text-sm text-muted-foreground line-clamp-2">
          {approval.reasoning}
        </p>
      {/if}
    </div>

    <Badge class={statusColors[approval.approvalStatus ?? 'pending']}>
      {approval.approvalStatus ?? 'pending'}
    </Badge>
  </div>

  <div class="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
    {#if agent}
      <span class="flex items-center gap-1">
        <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        {agent.name}
      </span>
    {/if}

    <span>
      {new Date(approval.createdAt).toLocaleString()}
    </span>
  </div>

  {#if !compact && approval.approvalStatus === 'pending'}
    <div class="mt-4 flex gap-2 border-t pt-4">
      <Button
        class="flex-1"
        size="sm"
        onclick={handleApprove}
        disabled={processing}
      >
        {#if processing}
          <span class="animate-spin">⏳</span>
        {:else}
          Approve
        {/if}
      </Button>
      <Button
        variant="ghost"
        class="flex-1 text-destructive hover:text-destructive/80"
        size="sm"
        onclick={handleReject}
        disabled={processing}
      >
        Reject
      </Button>
    </div>
  {/if}
</Card.Root>
