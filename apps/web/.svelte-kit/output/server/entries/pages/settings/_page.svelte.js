import { n as ensure_array_like, k as attr_class, h as stringify } from "../../../chunks/index.js";
import "../../../chunks/client.js";
import { B as Button, i as ipc } from "../../../chunks/button.js";
import { p as projectStore } from "../../../chunks/projects.svelte.js";
import "clsx";
import "../../../chunks/sheet-content.js";
import { H as Header, B as Badge } from "../../../chunks/badge.js";
import { C as Card } from "../../../chunks/card.js";
import { e as escape_html } from "../../../chunks/context.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    async function handleQuit() {
      await ipc.system.quit();
    }
    Header($$renderer2, { title: "Settings", subtitle: "Configure Claude Team" });
    $$renderer2.push(`<!----> <div class="flex-1 overflow-auto p-6"><div class="mx-auto max-w-2xl space-y-6">`);
    Card($$renderer2, {
      class: "px-6",
      children: ($$renderer3) => {
        $$renderer3.push(`<h2 class="mb-4 font-semibold text-surface-900">Current Project</h2> `);
        if (projectStore.currentProject) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<div class="rounded-lg bg-surface-50 p-4"><div class="font-medium text-surface-900">${escape_html(projectStore.currentProject.name)}</div> <div class="mt-1 text-sm text-surface-500">${escape_html(projectStore.currentProject.path)}</div> `);
          if (projectStore.currentProject.description) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div class="mt-2 text-sm text-surface-600">${escape_html(projectStore.currentProject.description)}</div>`);
          } else {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]--></div>`);
        } else {
          $$renderer3.push("<!--[!-->");
          $$renderer3.push(`<div class="rounded-lg bg-surface-50 p-4 text-sm text-surface-500">No project selected</div>`);
        }
        $$renderer3.push(`<!--]-->`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Card($$renderer2, {
      class: "px-6",
      children: ($$renderer3) => {
        $$renderer3.push(`<h2 class="mb-4 font-semibold text-surface-900">Projects</h2> `);
        if (projectStore.projects.length === 0) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<div class="rounded-lg bg-surface-50 p-4 text-sm text-surface-500">No projects found</div>`);
        } else {
          $$renderer3.push("<!--[!-->");
          $$renderer3.push(`<div class="space-y-2"><!--[-->`);
          const each_array = ensure_array_like(projectStore.projects);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let project = each_array[$$index];
            $$renderer3.push(`<button${attr_class(`flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors hover:bg-surface-50 ${stringify(project.id === projectStore.currentProject?.id ? "border-primary-500 bg-primary-50" : "")}`)}><div><div class="font-medium text-surface-900">${escape_html(project.name)}</div> <div class="text-xs text-surface-500">${escape_html(project.path)}</div></div> `);
            if (project.id === projectStore.currentProject?.id) {
              $$renderer3.push("<!--[-->");
              Badge($$renderer3, {
                class: "bg-success-muted text-success-muted-foreground border-transparent",
                children: ($$renderer4) => {
                  $$renderer4.push(`<!---->Current`);
                },
                $$slots: { default: true }
              });
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--></button>`);
          }
          $$renderer3.push(`<!--]--></div>`);
        }
        $$renderer3.push(`<!--]-->`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Card($$renderer2, {
      class: "px-6",
      children: ($$renderer3) => {
        $$renderer3.push(`<h2 class="mb-4 font-semibold text-surface-900">Application</h2> <div class="space-y-4"><div class="flex items-center justify-between"><div><div class="font-medium text-surface-900">Keyboard Shortcuts</div> <div class="text-sm text-surface-500">Quick access to common actions</div></div></div> <div class="rounded-lg bg-surface-50 p-4 text-sm"><div class="grid gap-3"><div class="flex items-center justify-between"><span class="text-surface-600">New Task</span> <kbd class="rounded bg-white px-2 py-1 text-xs shadow">Cmd+Shift+N</kbd></div> <div class="flex items-center justify-between"><span class="text-surface-600">Show Dashboard</span> <kbd class="rounded bg-white px-2 py-1 text-xs shadow">Cmd+Shift+D</kbd></div></div></div> <div class="border-t pt-4">`);
        Button($$renderer3, {
          variant: "destructive",
          onclick: handleQuit,
          children: ($$renderer4) => {
            $$renderer4.push(`<!---->Quit Claude Team`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----></div></div>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div></div>`);
  });
}
export {
  _page as default
};
//# sourceMappingURL=_page.svelte.js.map
