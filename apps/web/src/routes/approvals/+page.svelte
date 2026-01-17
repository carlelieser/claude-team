<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { ApprovalDto } from '$lib/ipc/client';
  import { approvalStore } from '$lib/stores/approvals.svelte';
  import { ApprovalList, ApprovalDetailModal } from '$lib/components/approvals';

  let selectedApproval = $state<ApprovalDto | null>(null);

  onMount(async () => {
    await approvalStore.load();
    approvalStore.subscribe();
  });

  onDestroy(() => {
    approvalStore.unsubscribe();
  });

  function handleSelect(approval: ApprovalDto) {
    selectedApproval = approval;
  }

  function handleClose() {
    selectedApproval = null;
  }
</script>

<svelte:head>
  <title>Approvals - Claude Team</title>
</svelte:head>

<div class="flex h-full flex-col">
  <header class="flex items-center justify-between border-b px-6 py-4">
    <div>
      <h1 class="text-xl font-semibold">Approvals</h1>
      <p class="text-sm text-muted-foreground">
        Review and approve agent actions
      </p>
    </div>
    {#if approvalStore.count > 0}
      <span class="rounded-full bg-warning-muted px-3 py-1 text-sm font-medium text-warning-muted-foreground">
        {approvalStore.count} pending
      </span>
    {/if}
  </header>

  <div class="flex-1 overflow-hidden">
    <ApprovalList onSelect={handleSelect} />
  </div>
</div>

<ApprovalDetailModal approval={selectedApproval} onClose={handleClose} />
