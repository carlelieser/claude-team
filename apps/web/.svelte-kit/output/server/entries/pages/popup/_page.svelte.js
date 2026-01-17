import "clsx";
import { e as escape_html } from "../../../chunks/context.js";
import { p as projectStore } from "../../../chunks/projects.svelte.js";
import { B as Button } from "../../../chunks/button.js";
import { I as Input } from "../../../chunks/input.js";
function Quick_task_input($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let title = "";
    let submitting = false;
    let inputElement = null;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<form class="p-4">`);
      {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--> <div class="relative">`);
      Input($$renderer3, {
        type: "text",
        class: "pr-24 text-lg",
        placeholder: "What needs to be done?",
        disabled: submitting,
        get value() {
          return title;
        },
        set value($$value) {
          title = $$value;
          $$settled = false;
        },
        get ref() {
          return inputElement;
        },
        set ref($$value) {
          inputElement = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> <div class="absolute inset-y-0 right-2 flex items-center">`);
      Button($$renderer3, {
        type: "submit",
        size: "sm",
        disabled: !title.trim(),
        children: ($$renderer4) => {
          $$renderer4.push(`<!---->${escape_html("Add")}`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></div></div> <div class="mt-3 flex items-center justify-between text-xs text-surface-400"><span>`);
      if (projectStore.currentProject) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`Project: ${escape_html(projectStore.currentProject.name)}`);
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push(`No project selected`);
      }
      $$renderer3.push(`<!--]--></span> <span><kbd class="rounded bg-surface-100 px-1 py-0.5">Cmd+Enter</kbd> to submit, <kbd class="rounded bg-surface-100 px-1 py-0.5">Esc</kbd> to close</span></div></form>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(`<div class="flex h-screen items-center justify-center bg-transparent"><div class="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">`);
    Quick_task_input($$renderer2);
    $$renderer2.push(`<!----></div></div>`);
  });
}
export {
  _page as default
};
//# sourceMappingURL=_page.svelte.js.map
