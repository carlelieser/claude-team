<script lang="ts">
  import type { ApprovalDto } from '$lib/ipc/client';
  import { approvalStore } from '$lib/stores/approvals.svelte';
  import ApprovalCard from './approval-card.svelte';
  import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '$lib/components/ui/empty';
  import CheckCircleIcon from 'lucide-svelte/icons/check-circle';
  import FilterIcon from 'lucide-svelte/icons/filter';

  interface Props {
    onSelect?: (approval: ApprovalDto) => void;
  }

  let { onSelect }: Props = $props();

  let selectedStatus = $state<'pending' | 'approved' | 'rejected' | 'all'>('pending');

  let filteredApprovals = $derived(() => {
    if (selectedStatus === 'all') {
      return approvalStore.approvals;
    }
    return approvalStore.approvals.filter((a) => a.approvalStatus === selectedStatus);
  });

  const tabs = [
    { id: 'pending', label: 'Pending', count: approvalStore.pendingApprovals.length },
    { id: 'approved', label: 'Approved', count: approvalStore.approvedApprovals.length },
    { id: 'rejected', label: 'Rejected', count: approvalStore.rejectedApprovals.length },
    { id: 'all', label: 'All', count: approvalStore.approvals.length },
  ] as const;
</script>

<div class="flex flex-col h-full">
  <div class="flex items-center gap-1 border-b px-4 py-2">
    {#each tabs as tab}
      <button
        class="relative px-3 py-2 text-sm font-medium rounded-lg transition-colors
          {selectedStatus === tab.id
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted'}"
        onclick={() => (selectedStatus = tab.id)}
      >
        {tab.label}
        {#if tab.count > 0}
          <span class="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs {selectedStatus === tab.id ? 'bg-primary/20' : ''}">
            {tab.count}
          </span>
        {/if}
      </button>
    {/each}
  </div>

  <div class="flex-1 overflow-y-auto p-4">
    {#if approvalStore.loading}
      <div class="flex items-center justify-center py-12">
        <div class="loading loading-spinner loading-lg"></div>
      </div>
    {:else if approvalStore.error}
      <div class="rounded-lg bg-destructive/10 p-4 text-destructive">
        {approvalStore.error}
      </div>
    {:else if filteredApprovals().length === 0}
      <Empty class="py-12">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            {#if selectedStatus === 'pending'}
              <CheckCircleIcon />
            {:else}
              <FilterIcon />
            {/if}
          </EmptyMedia>
          <EmptyTitle>No {selectedStatus === 'all' ? '' : selectedStatus} approvals</EmptyTitle>
          <EmptyDescription>
            {#if selectedStatus === 'pending'}
              All actions have been reviewed
            {:else}
              No approvals match this filter
            {/if}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    {:else}
      <div class="space-y-3">
        {#each filteredApprovals() as approval (approval.id)}
          <ApprovalCard {approval} {onSelect} />
        {/each}
      </div>
    {/if}
  </div>
</div>
