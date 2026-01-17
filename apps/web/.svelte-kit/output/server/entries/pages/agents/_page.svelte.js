import { e as escape_html } from "../../../chunks/context.js";
import "clsx";
import "../../../chunks/client.js";
import { a as agentStore } from "../../../chunks/agents.svelte.js";
import "../../../chunks/sheet-content.js";
import "../../../chunks/button.js";
import { H as Header } from "../../../chunks/badge.js";
import { n as ensure_array_like } from "../../../chunks/index.js";
import { A as Agent_status_card } from "../../../chunks/agent-status-card.js";
import { E as Empty, a as Empty_header, b as Empty_media, c as Empty_title, d as Empty_description } from "../../../chunks/empty-description.js";
import { U as Users } from "../../../chunks/users.js";
function Agent_list($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    if (agentStore.loading) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex items-center justify-center py-12"><div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (agentStore.error) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">${escape_html(agentStore.error)}</div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        if (agentStore.agents.length === 0) {
          $$renderer2.push("<!--[-->");
          Empty($$renderer2, {
            class: "py-12",
            children: ($$renderer3) => {
              Empty_header($$renderer3, {
                children: ($$renderer4) => {
                  Empty_media($$renderer4, {
                    variant: "icon",
                    children: ($$renderer5) => {
                      Users($$renderer5, { class: "size-5" });
                    },
                    $$slots: { default: true }
                  });
                  $$renderer4.push(`<!----> `);
                  Empty_title($$renderer4, {
                    children: ($$renderer5) => {
                      $$renderer5.push(`<!---->No agents configured`);
                    },
                    $$slots: { default: true }
                  });
                  $$renderer4.push(`<!----> `);
                  Empty_description($$renderer4, {
                    children: ($$renderer5) => {
                      $$renderer5.push(`<!---->Add agent definitions to the agents/ directory`);
                    },
                    $$slots: { default: true }
                  });
                  $$renderer4.push(`<!---->`);
                },
                $$slots: { default: true }
              });
            },
            $$slots: { default: true }
          });
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><!--[-->`);
          const each_array = ensure_array_like(agentStore.agents);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let agent = each_array[$$index];
            Agent_status_card($$renderer2, { agent });
          }
          $$renderer2.push(`<!--]--></div>`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    {
      let actions = function($$renderer3) {
        $$renderer3.push(`<div class="flex items-center gap-4 text-sm text-surface-500"><span><span class="font-medium text-green-600">${escape_html(agentStore.activeAgents.length)}</span> active</span> <span><span class="font-medium text-yellow-600">${escape_html(agentStore.pausedAgents.length)}</span> paused</span> <span><span class="font-medium text-surface-600">${escape_html(agentStore.idleAgents.length)}</span> idle</span></div>`);
      };
      Header($$renderer2, {
        title: "Agents",
        subtitle: "Monitor and control AI agents",
        actions
      });
    }
    $$renderer2.push(`<!----> <div class="flex-1 overflow-auto p-6">`);
    Agent_list($$renderer2);
    $$renderer2.push(`<!----></div>`);
  });
}
export {
  _page as default
};
//# sourceMappingURL=_page.svelte.js.map
