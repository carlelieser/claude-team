import { h as stringify, j as attr, k as attr_class, n as ensure_array_like, o as head } from "../../../chunks/index.js";
import { o as onDestroy } from "../../../chunks/index-server.js";
import { a as approvalStore } from "../../../chunks/approvals.svelte.js";
import { B as Button } from "../../../chunks/button.js";
import "clsx";
import { a as agentStore } from "../../../chunks/agents.svelte.js";
import { C as Card } from "../../../chunks/card.js";
import { e as escape_html } from "../../../chunks/context.js";
import { E as Empty, a as Empty_header, b as Empty_media, c as Empty_title, d as Empty_description } from "../../../chunks/empty-description.js";
import { C as Circle_check_big } from "../../../chunks/circle-check-big.js";
function Approval_card($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { approval, compact = false, onSelect } = $$props;
    const agent = agentStore.getById(approval.agentId);
    const statusColors = {
      pending: "bg-warning-muted text-warning-muted-foreground",
      approved: "bg-success-muted text-success-muted-foreground",
      rejected: "bg-destructive/10 text-destructive"
    };
    const actionTypeIcons = {
      file_write: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
      file_read: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      shell_execute: "M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      file_delete: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    };
    let processing = false;
    async function handleApprove(e) {
      e.stopPropagation();
      processing = true;
      try {
        await approvalStore.approve(approval.id);
      } finally {
        processing = false;
      }
    }
    async function handleReject(e) {
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
    function formatActionType(type) {
      return type.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    }
    $$renderer2.push(`<!---->`);
    Card($$renderer2, {
      role: "button",
      tabindex: 0,
      class: `w-full cursor-pointer px-6 text-left transition-shadow hover:shadow-md ${stringify(compact ? "py-4" : "")} ${stringify(processing ? "pointer-events-none opacity-50" : "")}`,
      onclick: handleClick,
      onkeydown: (e) => e.key === "Enter" && handleClick(),
      children: ($$renderer3) => {
        $$renderer3.push(`<div class="flex items-start justify-between gap-4"><div class="min-w-0 flex-1"><div class="flex items-center gap-2"><span class="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-100"><svg class="h-4 w-4 text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round"${attr("d", actionTypeIcons[approval.actionType] ?? actionTypeIcons["file_write"])}></path></svg></span> <div><h4 class="font-medium text-surface-900">${escape_html(formatActionType(approval.actionType))}</h4> `);
        if (approval.target) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<p class="text-xs text-surface-500 font-mono truncate max-w-xs">${escape_html(approval.target)}</p>`);
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--></div></div> `);
        if (!compact && approval.reasoning) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<p class="mt-2 text-sm text-surface-600 line-clamp-2">${escape_html(approval.reasoning)}</p>`);
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--></div> <span${attr_class(`rounded-full px-2 py-1 text-xs font-medium ${stringify(statusColors[approval.approvalStatus ?? "pending"])}`)}>${escape_html(approval.approvalStatus ?? "pending")}</span></div> <div class="mt-3 flex flex-wrap items-center gap-2 text-xs text-surface-500">`);
        if (agent) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<span class="flex items-center gap-1"><svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg> ${escape_html(agent.name)}</span>`);
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--> <span>${escape_html(new Date(approval.createdAt).toLocaleString())}</span></div> `);
        if (!compact && approval.approvalStatus === "pending") {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<div class="mt-4 flex gap-2 border-t pt-4">`);
          Button($$renderer3, {
            class: "flex-1",
            size: "sm",
            onclick: handleApprove,
            disabled: processing,
            children: ($$renderer4) => {
              if (processing) {
                $$renderer4.push("<!--[-->");
                $$renderer4.push(`<span class="animate-spin">⏳</span>`);
              } else {
                $$renderer4.push("<!--[!-->");
                $$renderer4.push(`Approve`);
              }
              $$renderer4.push(`<!--]-->`);
            },
            $$slots: { default: true }
          });
          $$renderer3.push(`<!----> `);
          Button($$renderer3, {
            variant: "ghost",
            class: "flex-1 text-destructive hover:text-destructive/80",
            size: "sm",
            onclick: handleReject,
            disabled: processing,
            children: ($$renderer4) => {
              $$renderer4.push(`<!---->Reject`);
            },
            $$slots: { default: true }
          });
          $$renderer3.push(`<!----></div>`);
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]-->`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!---->`);
  });
}
function Approval_list($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { onSelect } = $$props;
    let selectedStatus = "pending";
    const filteredApprovals = () => {
      return approvalStore.approvals.filter((a) => a.approvalStatus === selectedStatus);
    };
    const tabs = [
      {
        id: "pending",
        label: "Pending",
        count: approvalStore.pendingApprovals.length
      },
      {
        id: "approved",
        label: "Approved",
        count: approvalStore.approvedApprovals.length
      },
      {
        id: "rejected",
        label: "Rejected",
        count: approvalStore.rejectedApprovals.length
      },
      {
        id: "all",
        label: "All",
        count: approvalStore.approvals.length
      }
    ];
    $$renderer2.push(`<div class="flex flex-col h-full"><div class="flex items-center gap-1 border-b px-4 py-2"><!--[-->`);
    const each_array = ensure_array_like(tabs);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let tab = each_array[$$index];
      $$renderer2.push(`<button${attr_class(`relative px-3 py-2 text-sm font-medium rounded-lg transition-colors ${stringify(selectedStatus === tab.id ? "bg-primary-100 text-primary-700" : "text-surface-600 hover:bg-surface-100")}`)}>${escape_html(tab.label)} `);
      if (tab.count > 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<span${attr_class(`ml-1.5 rounded-full bg-surface-200 px-1.5 py-0.5 text-xs ${stringify(selectedStatus === tab.id ? "bg-primary-200" : "")}`)}>${escape_html(tab.count)}</span>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></button>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="flex-1 overflow-y-auto p-4">`);
    if (approvalStore.loading) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex items-center justify-center py-12"><div class="loading loading-spinner loading-lg"></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (approvalStore.error) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="rounded-lg bg-red-50 p-4 text-red-600">${escape_html(approvalStore.error)}</div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        if (filteredApprovals().length === 0) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<!---->`);
          Empty($$renderer2, {
            class: "py-12",
            children: ($$renderer3) => {
              $$renderer3.push(`<!---->`);
              Empty_header($$renderer3, {
                children: ($$renderer4) => {
                  $$renderer4.push(`<!---->`);
                  Empty_media($$renderer4, {
                    variant: "icon",
                    children: ($$renderer5) => {
                      {
                        $$renderer5.push("<!--[-->");
                        Circle_check_big($$renderer5, { class: "size-5" });
                      }
                      $$renderer5.push(`<!--]-->`);
                    },
                    $$slots: { default: true }
                  });
                  $$renderer4.push(`<!----> <!---->`);
                  Empty_title($$renderer4, {
                    children: ($$renderer5) => {
                      $$renderer5.push(`<!---->No ${escape_html(selectedStatus)} approvals`);
                    },
                    $$slots: { default: true }
                  });
                  $$renderer4.push(`<!----> <!---->`);
                  Empty_description($$renderer4, {
                    children: ($$renderer5) => {
                      {
                        $$renderer5.push("<!--[-->");
                        $$renderer5.push(`All actions have been reviewed`);
                      }
                      $$renderer5.push(`<!--]-->`);
                    },
                    $$slots: { default: true }
                  });
                  $$renderer4.push(`<!---->`);
                },
                $$slots: { default: true }
              });
              $$renderer3.push(`<!---->`);
            },
            $$slots: { default: true }
          });
          $$renderer2.push(`<!---->`);
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`<div class="space-y-3"><!--[-->`);
          const each_array_1 = ensure_array_like(filteredApprovals());
          for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
            let approval = each_array_1[$$index_1];
            Approval_card($$renderer2, { approval, onSelect });
          }
          $$renderer2.push(`<!--]--></div>`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
function Approval_detail_modal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { approval, onClose } = $$props;
    const agent = approval ? agentStore.getById(approval.agentId) : null;
    let processing = false;
    let rejectReason = "";
    let showRejectForm = false;
    const statusColors = {
      pending: "bg-warning-muted text-warning-muted-foreground",
      approved: "bg-success-muted text-success-muted-foreground",
      rejected: "bg-destructive/10 text-destructive"
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
        await approvalStore.reject(approval.id, rejectReason || void 0);
        onClose();
      } finally {
        processing = false;
      }
    }
    function formatActionType(type) {
      return type.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    }
    function formatJson(obj) {
      if (!obj) return "";
      try {
        return JSON.stringify(obj, null, 2);
      } catch {
        return String(obj);
      }
    }
    if (approval) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true"><div class="mx-4 max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl"><div class="flex items-center justify-between border-b px-6 py-4"><div><h2 class="text-lg font-semibold text-surface-900">${escape_html(formatActionType(approval.actionType))}</h2> `);
      if (approval.target) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<p class="text-sm text-surface-500 font-mono">${escape_html(approval.target)}</p>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div> <div class="flex items-center gap-3"><span${attr_class(`rounded-full px-2.5 py-1 text-xs font-medium ${stringify(statusColors[approval.approvalStatus ?? "pending"])}`)}>${escape_html(approval.approvalStatus ?? "pending")}</span> <button class="rounded-lg p-1 hover:bg-surface-100" aria-label="Close"><svg class="h-5 w-5 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div></div> <div class="max-h-[60vh] overflow-y-auto p-6"><div class="space-y-6"><div class="grid grid-cols-2 gap-4 text-sm"><div><span class="text-surface-500">Agent</span> <p class="font-medium text-surface-900">${escape_html(agent?.name ?? approval.agentId)}</p></div> <div><span class="text-surface-500">Created</span> <p class="font-medium text-surface-900">${escape_html(new Date(approval.createdAt).toLocaleString())}</p></div> `);
      if (approval.approvedAt) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div><span class="text-surface-500">${escape_html(approval.approvalStatus === "approved" ? "Approved At" : "Rejected At")}</span> <p class="font-medium text-surface-900">${escape_html(new Date(approval.approvedAt).toLocaleString())}</p></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (approval.durationMs) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div><span class="text-surface-500">Duration</span> <p class="font-medium text-surface-900">${escape_html(approval.durationMs)}ms</p></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div> `);
      if (approval.reasoning) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div><h3 class="mb-2 text-sm font-medium text-surface-700">Reasoning</h3> <p class="rounded-lg bg-surface-50 p-3 text-sm text-surface-600">${escape_html(approval.reasoning)}</p></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (approval.input) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div><h3 class="mb-2 text-sm font-medium text-surface-700">Input</h3> <pre class="max-h-48 overflow-auto rounded-lg bg-foreground p-3 text-xs text-success font-mono">${escape_html(formatJson(approval.input))}</pre></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (approval.output) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div><h3 class="mb-2 text-sm font-medium text-surface-700">Output</h3> <pre class="max-h-48 overflow-auto rounded-lg bg-foreground p-3 text-xs text-info font-mono">${escape_html(formatJson(approval.output))}</pre></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (showRejectForm) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div><label for="reject-reason" class="mb-2 block text-sm font-medium text-surface-700">Rejection Reason (Optional)</label> <textarea id="reject-reason" class="w-full rounded-lg border border-input p-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring" rows="3" placeholder="Enter reason for rejection...">`);
        const $$body = escape_html(rejectReason);
        if ($$body) {
          $$renderer2.push(`${$$body}`);
        }
        $$renderer2.push(`</textarea></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div></div> `);
      if (approval.approvalStatus === "pending") {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="flex gap-3 border-t px-6 py-4">`);
        if (showRejectForm) {
          $$renderer2.push("<!--[-->");
          Button($$renderer2, {
            variant: "ghost",
            class: "flex-1",
            onclick: () => showRejectForm = false,
            disabled: processing,
            children: ($$renderer3) => {
              $$renderer3.push(`<!---->Cancel`);
            },
            $$slots: { default: true }
          });
          $$renderer2.push(`<!----> `);
          Button($$renderer2, {
            variant: "destructive",
            class: "flex-1",
            onclick: handleReject,
            disabled: processing,
            children: ($$renderer3) => {
              if (processing) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<span class="animate-spin">⏳</span>`);
              } else {
                $$renderer3.push("<!--[!-->");
                $$renderer3.push(`Confirm Reject`);
              }
              $$renderer3.push(`<!--]-->`);
            },
            $$slots: { default: true }
          });
          $$renderer2.push(`<!---->`);
        } else {
          $$renderer2.push("<!--[!-->");
          Button($$renderer2, {
            variant: "ghost",
            class: "flex-1 text-destructive hover:text-destructive/80",
            onclick: () => showRejectForm = true,
            disabled: processing,
            children: ($$renderer3) => {
              $$renderer3.push(`<!---->Reject`);
            },
            $$slots: { default: true }
          });
          $$renderer2.push(`<!----> `);
          Button($$renderer2, {
            class: "flex-1",
            onclick: handleApprove,
            disabled: processing,
            children: ($$renderer3) => {
              if (processing) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<span class="animate-spin">⏳</span>`);
              } else {
                $$renderer3.push("<!--[!-->");
                $$renderer3.push(`Approve`);
              }
              $$renderer3.push(`<!--]-->`);
            },
            $$slots: { default: true }
          });
          $$renderer2.push(`<!---->`);
        }
        $$renderer2.push(`<!--]--></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let selectedApproval = null;
    onDestroy(() => {
      approvalStore.unsubscribe();
    });
    function handleSelect(approval) {
      selectedApproval = approval;
    }
    function handleClose() {
      selectedApproval = null;
    }
    head("19gsovj", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Approvals - Claude Team</title>`);
      });
    });
    $$renderer2.push(`<div class="flex h-full flex-col"><header class="flex items-center justify-between border-b px-6 py-4"><div><h1 class="text-xl font-semibold text-surface-900">Approvals</h1> <p class="text-sm text-surface-500">Review and approve agent actions</p></div> `);
    if (approvalStore.count > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<span class="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">${escape_html(approvalStore.count)} pending</span>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></header> <div class="flex-1 overflow-hidden">`);
    Approval_list($$renderer2, { onSelect: handleSelect });
    $$renderer2.push(`<!----></div></div> `);
    Approval_detail_modal($$renderer2, { approval: selectedApproval, onClose: handleClose });
    $$renderer2.push(`<!---->`);
  });
}
export {
  _page as default
};
//# sourceMappingURL=_page.svelte.js.map
