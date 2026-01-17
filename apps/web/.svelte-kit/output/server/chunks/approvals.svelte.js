import { q as derived } from "./index.js";
import { i as ipc } from "./button.js";
class ApprovalStore {
  approvals = [];
  loading = false;
  error = null;
  filter = { status: "pending" };
  count = 0;
  #pendingApprovals = derived(() => this.approvals.filter((a) => a.approvalStatus === "pending"));
  get pendingApprovals() {
    return this.#pendingApprovals();
  }
  set pendingApprovals($$value) {
    return this.#pendingApprovals($$value);
  }
  #approvedApprovals = derived(() => this.approvals.filter((a) => a.approvalStatus === "approved"));
  get approvedApprovals() {
    return this.#approvedApprovals();
  }
  set approvedApprovals($$value) {
    return this.#approvedApprovals($$value);
  }
  #rejectedApprovals = derived(() => this.approvals.filter((a) => a.approvalStatus === "rejected"));
  get rejectedApprovals() {
    return this.#rejectedApprovals();
  }
  set rejectedApprovals($$value) {
    return this.#rejectedApprovals($$value);
  }
  _unsubscribeUpdated = null;
  _unsubscribeRequired = null;
  async load(filter) {
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
      this.error = e instanceof Error ? e.message : "Unknown error";
    } finally {
      this.loading = false;
    }
  }
  async refreshCount(projectId) {
    try {
      const result = await ipc.approval.count(projectId);
      if (result.ok) {
        this.count = result.value;
      }
    } catch (e) {
      console.error("Failed to refresh approval count:", e);
    }
  }
  async approve(id) {
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
      this.error = e instanceof Error ? e.message : "Unknown error";
      return null;
    }
  }
  async reject(id, reason) {
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
      this.error = e instanceof Error ? e.message : "Unknown error";
      return null;
    }
  }
  setFilter(filter) {
    this.filter = filter;
    this.load();
  }
  subscribe() {
    this._unsubscribeUpdated = ipc.on.approvalUpdated((approval) => {
      this.updateApprovalInList(approval);
    });
    this._unsubscribeRequired = ipc.on.approvalRequired(() => {
      this.load();
      this.refreshCount();
    });
  }
  unsubscribe() {
    if (this._unsubscribeUpdated) {
      this._unsubscribeUpdated();
      this._unsubscribeUpdated = null;
    }
    if (this._unsubscribeRequired) {
      this._unsubscribeRequired();
      this._unsubscribeRequired = null;
    }
  }
  getById(id) {
    return this.approvals.find((a) => a.id === id);
  }
  getByStatus(status) {
    return this.approvals.filter((a) => a.approvalStatus === status);
  }
  updateApprovalInList(approval) {
    const index = this.approvals.findIndex((a) => a.id === approval.id);
    if (index !== -1) {
      this.approvals[index] = approval;
    } else {
      this.approvals = [...this.approvals, approval];
    }
  }
}
const approvalStore = new ApprovalStore();
export {
  approvalStore as a
};
//# sourceMappingURL=approvals.svelte.js.map
