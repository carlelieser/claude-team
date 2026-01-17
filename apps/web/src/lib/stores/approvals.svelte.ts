/**
 * Approval store using Svelte 5 runes
 */

import {
  ipc,
  type ApprovalDto,
  type ApprovalFilterDto,
  type ApprovalStatus,
} from '$lib/ipc/client';

class ApprovalStore {
  approvals = $state<ApprovalDto[]>([]);
  loading = $state(false);
  error = $state<string | null>(null);
  filter = $state<ApprovalFilterDto>({ status: 'pending' });
  count = $state(0);

  pendingApprovals = $derived(
    this.approvals.filter((a) => a.approvalStatus === 'pending')
  );
  approvedApprovals = $derived(
    this.approvals.filter((a) => a.approvalStatus === 'approved')
  );
  rejectedApprovals = $derived(
    this.approvals.filter((a) => a.approvalStatus === 'rejected')
  );

  private _unsubscribeUpdated: (() => void) | null = null;
  private _unsubscribeRequired: (() => void) | null = null;

  async load(filter?: ApprovalFilterDto): Promise<void> {
    this.loading = true;
    this.error = null;

    if (filter) {
      this.filter = filter;
    }

    try {
      const result = await ipc.approval.list(this.filter);

      if (result.ok) {
        this.approvals = [...result.value];
      } else {
        this.error = result.error.message;
      }

      await this.refreshCount();
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Unknown error';
    } finally {
      this.loading = false;
    }
  }

  async refreshCount(projectId?: string): Promise<void> {
    try {
      const result = await ipc.approval.count(projectId);

      if (result.ok) {
        this.count = result.value;
      }
    } catch (e) {
      console.error('Failed to refresh approval count:', e);
    }
  }

  async approve(id: string): Promise<ApprovalDto | null> {
    try {
      const result = await ipc.approval.approve(id);

      if (result.ok) {
        this.updateApprovalInList(result.value);
        await this.refreshCount();
        return result.value;
      } else {
        this.error = result.error.message;
        return null;
      }
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Unknown error';
      return null;
    }
  }

  async reject(id: string, reason?: string): Promise<ApprovalDto | null> {
    try {
      const result = await ipc.approval.reject(id, reason);

      if (result.ok) {
        this.updateApprovalInList(result.value);
        await this.refreshCount();
        return result.value;
      } else {
        this.error = result.error.message;
        return null;
      }
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Unknown error';
      return null;
    }
  }

  setFilter(filter: ApprovalFilterDto): void {
    this.filter = filter;
    this.load();
  }

  subscribe(): void {
    this._unsubscribeUpdated = ipc.on.approvalUpdated((approval: ApprovalDto) => {
      this.updateApprovalInList(approval);
    });

    this._unsubscribeRequired = ipc.on.approvalRequired(() => {
      this.load();
      this.refreshCount();
    });
  }

  unsubscribe(): void {
    if (this._unsubscribeUpdated) {
      this._unsubscribeUpdated();
      this._unsubscribeUpdated = null;
    }
    if (this._unsubscribeRequired) {
      this._unsubscribeRequired();
      this._unsubscribeRequired = null;
    }
  }

  getById(id: string): ApprovalDto | undefined {
    return this.approvals.find((a) => a.id === id);
  }

  getByStatus(status: ApprovalStatus): ApprovalDto[] {
    return this.approvals.filter((a) => a.approvalStatus === status);
  }

  private updateApprovalInList(approval: ApprovalDto): void {
    const index = this.approvals.findIndex((a) => a.id === approval.id);
    if (index !== -1) {
      this.approvals[index] = approval;
    } else {
      this.approvals = [...this.approvals, approval];
    }
  }
}

export const approvalStore = new ApprovalStore();
