import { h as stringify, k as attr_class } from "./index.js";
import { a as agentStore } from "./agents.svelte.js";
import { t as taskStore } from "./tasks.svelte.js";
import { B as Button } from "./button.js";
import { C as Card } from "./card.js";
import "clsx";
import { B as Badge } from "./badge.js";
import { e as escape_html } from "./context.js";
function Task_card($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { task, compact = false } = $$props;
    const agent = task.agentId ? agentStore.getById(task.agentId) : null;
    const statusColors = {
      pending: "bg-muted text-muted-foreground border-transparent",
      in_progress: "bg-info-muted text-info-muted-foreground border-transparent",
      completed: "bg-success-muted text-success-muted-foreground border-transparent",
      failed: "bg-destructive/10 text-destructive border-transparent",
      canceled: "bg-muted text-muted-foreground border-transparent"
    };
    const priorityLabels = { 0: "Low", 1: "Medium", 2: "High", 3: "Urgent" };
    async function handleCancel() {
      await taskStore.cancel(task.id);
    }
    $$renderer2.push(`<!---->`);
    Card($$renderer2, {
      class: `px-6 ${stringify(compact ? "py-4" : "")}`,
      children: ($$renderer3) => {
        $$renderer3.push(`<div class="flex items-start justify-between gap-4"><div class="min-w-0 flex-1"><h4 class="truncate font-medium text-surface-900">${escape_html(task.title)}</h4> `);
        if (!compact && task.description) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<p class="mt-1 text-sm text-surface-500">${escape_html(task.description)}</p>`);
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--></div> `);
        Badge($$renderer3, {
          class: statusColors[task.status],
          children: ($$renderer4) => {
            $$renderer4.push(`<!---->${escape_html(task.status.replace("_", " "))}`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----></div> <div class="mt-3 flex flex-wrap items-center gap-2 text-xs text-surface-500">`);
        if (agent) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<span class="flex items-center gap-1"><svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg> ${escape_html(agent.name)}</span>`);
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--> `);
        if (task.priority > 0) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<span${attr_class(`rounded px-1.5 py-0.5 ${stringify(task.priority >= 2 ? "bg-destructive/10 text-destructive" : "bg-warning-muted text-warning-muted-foreground")}`)}>${escape_html(priorityLabels[task.priority] ?? "Normal")}</span>`);
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--> <span>${escape_html(new Date(task.createdAt).toLocaleDateString())}</span></div> `);
        if (!compact && (task.status === "pending" || task.status === "in_progress")) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<div class="mt-4 border-t pt-4">`);
          Button($$renderer3, {
            variant: "ghost",
            size: "sm",
            class: "text-destructive hover:text-destructive/80",
            onclick: handleCancel,
            children: ($$renderer4) => {
              $$renderer4.push(`<!---->Cancel`);
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
export {
  Task_card as T
};
//# sourceMappingURL=task-card.js.map
