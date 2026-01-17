import { e as escape_html } from "./context.js";
import "clsx";
import { a as agentStore } from "./agents.svelte.js";
import { t as taskStore } from "./tasks.svelte.js";
import { k as attr_class, h as stringify } from "./index.js";
import { B as Button } from "./button.js";
import { C as Card } from "./card.js";
import { B as Badge } from "./badge.js";
function Agent_activity_indicator($$renderer, $$props) {
  let { status, size = "md" } = $$props;
  const sizeClasses = { sm: "h-6 w-6", md: "h-8 w-8", lg: "h-10 w-10" };
  const colors = {
    idle: "text-muted-foreground",
    executing: "text-success",
    paused: "text-warning"
  };
  $$renderer.push(`<div${attr_class(`relative ${stringify(sizeClasses[size])}`)}>`);
  if (status === "executing") {
    $$renderer.push("<!--[-->");
    $$renderer.push(`<div class="absolute inset-0 animate-ping rounded-full bg-success opacity-25"></div>`);
  } else {
    $$renderer.push("<!--[!-->");
  }
  $$renderer.push(`<!--]--> <div${attr_class(`relative flex h-full w-full items-center justify-center rounded-full bg-surface-100 ${stringify(colors[status])}`)}>`);
  if (status === "idle") {
    $$renderer.push("<!--[-->");
    $$renderer.push(`<svg class="h-1/2 w-1/2" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="6"></circle></svg>`);
  } else {
    $$renderer.push("<!--[!-->");
    if (status === "executing") {
      $$renderer.push("<!--[-->");
      $$renderer.push(`<svg class="h-1/2 w-1/2 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`);
    } else {
      $$renderer.push("<!--[!-->");
      if (status === "paused") {
        $$renderer.push("<!--[-->");
        $$renderer.push(`<svg class="h-1/2 w-1/2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>`);
      } else {
        $$renderer.push("<!--[!-->");
      }
      $$renderer.push(`<!--]-->`);
    }
    $$renderer.push(`<!--]-->`);
  }
  $$renderer.push(`<!--]--></div></div>`);
}
function Agent_status_card($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { agent } = $$props;
    const currentTask = agent.currentTaskId ? taskStore.getById(agent.currentTaskId) : null;
    const statusColors = {
      idle: "bg-muted text-muted-foreground border-transparent",
      executing: "bg-success-muted text-success-muted-foreground border-transparent",
      paused: "bg-warning-muted text-warning-muted-foreground border-transparent"
    };
    const trustColors = {
      low: "bg-destructive/10 text-destructive border-transparent",
      medium: "bg-warning-muted text-warning-muted-foreground border-transparent",
      high: "bg-info-muted text-info-muted-foreground border-transparent",
      full: "bg-success-muted text-success-muted-foreground border-transparent"
    };
    async function handlePause() {
      await agentStore.pause(agent.id);
    }
    async function handleResume() {
      await agentStore.resume(agent.id);
    }
    $$renderer2.push(`<!---->`);
    Card($$renderer2, {
      class: "px-6",
      children: ($$renderer3) => {
        $$renderer3.push(`<div class="flex items-start justify-between"><div class="flex items-center gap-3">`);
        Agent_activity_indicator($$renderer3, { status: agent.status });
        $$renderer3.push(`<!----> <div><h3 class="font-medium text-surface-900">${escape_html(agent.name)}</h3> <p class="text-sm text-surface-500">${escape_html(agent.description)}</p></div></div> <div class="flex items-center gap-2">`);
        Badge($$renderer3, {
          class: trustColors[agent.trustLevel],
          children: ($$renderer4) => {
            $$renderer4.push(`<!---->${escape_html(agent.trustLevel)}`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----> `);
        Badge($$renderer3, {
          class: statusColors[agent.status],
          children: ($$renderer4) => {
            $$renderer4.push(`<!---->${escape_html(agent.status)}`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----></div></div> `);
        if (currentTask) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<div class="mt-4 rounded-lg bg-surface-50 p-3"><div class="text-xs text-surface-500">Current Task</div> <div class="mt-1 text-sm font-medium text-surface-900">${escape_html(currentTask.title)}</div></div>`);
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--> <div class="mt-4 flex gap-2">`);
        if (agent.status === "executing") {
          $$renderer3.push("<!--[-->");
          Button($$renderer3, {
            variant: "secondary",
            size: "sm",
            onclick: handlePause,
            children: ($$renderer4) => {
              $$renderer4.push(`<!---->Pause`);
            },
            $$slots: { default: true }
          });
        } else {
          $$renderer3.push("<!--[!-->");
          if (agent.status === "paused") {
            $$renderer3.push("<!--[-->");
            Button($$renderer3, {
              size: "sm",
              onclick: handleResume,
              children: ($$renderer4) => {
                $$renderer4.push(`<!---->Resume`);
              },
              $$slots: { default: true }
            });
          } else {
            $$renderer3.push("<!--[!-->");
            Button($$renderer3, {
              variant: "secondary",
              size: "sm",
              disabled: true,
              children: ($$renderer4) => {
                $$renderer4.push(`<!---->Idle`);
              },
              $$slots: { default: true }
            });
          }
          $$renderer3.push(`<!--]-->`);
        }
        $$renderer3.push(`<!--]--></div>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!---->`);
  });
}
export {
  Agent_status_card as A
};
//# sourceMappingURL=agent-status-card.js.map
