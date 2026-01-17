<script lang="ts">
  import type { ApprovalDto } from '$lib/ipc/client';
  import { agentStore } from '$lib/stores/agents.svelte';
  import { approvalStore } from '$lib/stores/approvals.svelte';
  import { Button } from '$lib/components/ui/button';

  interface Props {
    approval: ApprovalDto | null;
    onClose: () => void;
  }

  let { approval, onClose }: Props = $props();

  let agent = $derived(approval ? agentStore.getById(approval.agentId) : null);

  let processing = $state(false);
  let rejectReason = $state('');
  let showRejectForm = $state(false);

  const statusColors = {
    pending: 'bg-warning-muted text-warning-muted-foreground',
    approved: 'bg-success-muted text-success-muted-foreground',
    rejected: 'bg-destructive/10 text-destructive',
  };

  async function handleApprove() {
    if (!approval) return;
    processing = true;
    try {
      await approvalStore.approve(approval.id);
      onClose();
    } finally {
      processing = false;
    }
  }

  async function handleReject() {
    if (!approval) return;
    processing = true;
    try {
      await approvalStore.reject(approval.id, rejectReason || undefined);
      onClose();
    } finally {
      processing = false;
    }
  }

  function formatActionType(type: string): string {
    return type.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  function formatJson(obj: unknown): string {
    if (!obj) return '';
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  }
</script>

{#if approval}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    role="dialog"
    aria-modal="true"
  >
    <div class="mx-4 max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-xl bg-card shadow-2xl">
      <div class="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h2 class="text-lg font-semibold">
            {formatActionType(approval.actionType)}
          </h2>
          {#if approval.target}
            <p class="text-sm text-muted-foreground font-mono">
              {approval.target}
            </p>
          {/if}
        </div>
        <div class="flex items-center gap-3">
          <span class="rounded-full px-2.5 py-1 text-xs font-medium {statusColors[approval.approvalStatus ?? 'pending']}">
            {approval.approvalStatus ?? 'pending'}
          </span>
          <button
            class="rounded-lg p-1 hover:bg-muted"
            onclick={onClose}
            aria-label="Close"
          >
            <svg class="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div class="max-h-[60vh] overflow-y-auto p-6">
        <div class="space-y-6">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-muted-foreground">Agent</span>
              <p class="font-medium">{agent?.name ?? approval.agentId}</p>
            </div>
            <div>
              <span class="text-muted-foreground">Created</span>
              <p class="font-medium">
                {new Date(approval.createdAt).toLocaleString()}
              </p>
            </div>
            {#if approval.approvedAt}
              <div>
                <span class="text-muted-foreground">
                  {approval.approvalStatus === 'approved' ? 'Approved At' : 'Rejected At'}
                </span>
                <p class="font-medium">
                  {new Date(approval.approvedAt).toLocaleString()}
                </p>
              </div>
            {/if}
            {#if approval.durationMs}
              <div>
                <span class="text-muted-foreground">Duration</span>
                <p class="font-medium">{approval.durationMs}ms</p>
              </div>
            {/if}
          </div>

          {#if approval.reasoning}
            <div>
              <h3 class="mb-2 text-sm font-medium">Reasoning</h3>
              <p class="rounded-lg bg-muted p-3 text-sm">
                {approval.reasoning}
              </p>
            </div>
          {/if}

          {#if approval.input}
            <div>
              <h3 class="mb-2 text-sm font-medium">Input</h3>
              <pre class="max-h-48 overflow-auto rounded-lg bg-foreground p-3 text-xs text-success font-mono">{formatJson(approval.input)}</pre>
            </div>
          {/if}

          {#if approval.output}
            <div>
              <h3 class="mb-2 text-sm font-medium">Output</h3>
              <pre class="max-h-48 overflow-auto rounded-lg bg-foreground p-3 text-xs text-info font-mono">{formatJson(approval.output)}</pre>
            </div>
          {/if}

          {#if showRejectForm}
            <div>
              <label for="reject-reason" class="mb-2 block text-sm font-medium">
                Rejection Reason (Optional)
              </label>
              <textarea
                id="reject-reason"
                class="w-full rounded-lg border border-input p-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                rows="3"
                placeholder="Enter reason for rejection..."
                bind:value={rejectReason}
              ></textarea>
            </div>
          {/if}
        </div>
      </div>

      {#if approval.approvalStatus === 'pending'}
        <div class="flex gap-3 border-t px-6 py-4">
          {#if showRejectForm}
            <Button
              variant="ghost"
              class="flex-1"
              onclick={() => (showRejectForm = false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              class="flex-1"
              onclick={handleReject}
              disabled={processing}
            >
              {#if processing}
                <span class="animate-spin">⏳</span>
              {:else}
                Confirm Reject
              {/if}
            </Button>
          {:else}
            <Button
              variant="ghost"
              class="flex-1 text-destructive hover:text-destructive/80"
              onclick={() => (showRejectForm = true)}
              disabled={processing}
            >
              Reject
            </Button>
            <Button
              class="flex-1"
              onclick={handleApprove}
              disabled={processing}
            >
              {#if processing}
                <span class="animate-spin">⏳</span>
              {:else}
                Approve
              {/if}
            </Button>
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}
