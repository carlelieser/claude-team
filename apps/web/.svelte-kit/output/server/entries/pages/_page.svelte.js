import { e as attributes, f as clsx, g as bind_props, l as sanitize_props, s as spread_props, m as slot, n as ensure_array_like } from "../../chunks/index.js";
import "../../chunks/client.js";
import { a as agentStore } from "../../chunks/agents.svelte.js";
import "clsx";
import "../../chunks/sheet-content.js";
import { c as cn } from "../../chunks/button.js";
import { t as taskStore } from "../../chunks/tasks.svelte.js";
import { e as eventStore } from "../../chunks/events.svelte.js";
import { H as Header } from "../../chunks/badge.js";
import { A as Agent_status_card } from "../../chunks/agent-status-card.js";
import { E as Empty, a as Empty_header, b as Empty_media, c as Empty_title, d as Empty_description } from "../../chunks/empty-description.js";
import { T as Task_card } from "../../chunks/task-card.js";
import { E as Event_card } from "../../chunks/event-card.js";
import { C as Card } from "../../chunks/card.js";
import { U as Users } from "../../chunks/users.js";
import { I as Icon } from "../../chunks/Icon.js";
import { C as Circle_check_big } from "../../chunks/circle-check-big.js";
import { e as escape_html } from "../../chunks/context.js";
function Card_content($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      class: className,
      children,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    $$renderer2.push(`<div${attributes({
      "data-slot": "card-content",
      class: clsx(cn("px-6", className)),
      ...restProps
    })}>`);
    children?.($$renderer2);
    $$renderer2.push(`<!----></div>`);
    bind_props($$props, { ref });
  });
}
function Card_description($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      class: className,
      children,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    $$renderer2.push(`<p${attributes({
      "data-slot": "card-description",
      class: clsx(cn("text-muted-foreground text-sm", className)),
      ...restProps
    })}>`);
    children?.($$renderer2);
    $$renderer2.push(`<!----></p>`);
    bind_props($$props, { ref });
  });
}
function Card_header($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      class: className,
      children,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    $$renderer2.push(`<div${attributes({
      "data-slot": "card-header",
      class: clsx(cn("@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6", className)),
      ...restProps
    })}>`);
    children?.($$renderer2);
    $$renderer2.push(`<!----></div>`);
    bind_props($$props, { ref });
  });
}
function Card_title($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      class: className,
      children,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    $$renderer2.push(`<div${attributes({
      "data-slot": "card-title",
      class: clsx(cn("leading-none font-semibold", className)),
      ...restProps
    })}>`);
    children?.($$renderer2);
    $$renderer2.push(`<!----></div>`);
    bind_props($$props, { ref });
  });
}
function Clock($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.562.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   * ---
   *
   * The MIT License (MIT) (for portions derived from Feather)
   *
   * Copyright (c) 2013-2023 Cole Bemis
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in all
   * copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   * SOFTWARE.
   *
   */
  const iconNode = [
    ["path", { "d": "M12 6v6l4 2" }],
    ["circle", { "cx": "12", "cy": "12", "r": "10" }]
  ];
  Icon($$renderer, spread_props([
    { name: "clock" },
    $$sanitized_props,
    {
      /**
       * @component @name Clock
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTIgNnY2bDQgMiIgLz4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/clock
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Play($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.562.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   * ---
   *
   * The MIT License (MIT) (for portions derived from Feather)
   *
   * Copyright (c) 2013-2023 Cole Bemis
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in all
   * copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   * SOFTWARE.
   *
   */
  const iconNode = [
    [
      "path",
      {
        "d": "M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"
      }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "play" },
    $$sanitized_props,
    {
      /**
       * @component @name Play
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNNSA1YTIgMiAwIDAgMSAzLjAwOC0xLjcyOGwxMS45OTcgNi45OThhMiAyIDAgMCAxIC4wMDMgMy40NThsLTEyIDdBMiAyIDAgMCAxIDUgMTl6IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/play
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    Header($$renderer2, {
      title: "Overview",
      subtitle: "Agent activity and task status"
    });
    $$renderer2.push(`<!----> <div class="flex flex-1 flex-col gap-6 overflow-auto p-6"><div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">`);
    Card($$renderer2, {
      children: ($$renderer3) => {
        Card_header($$renderer3, {
          class: "flex flex-row items-center justify-between space-y-0 pb-2",
          children: ($$renderer4) => {
            Card_title($$renderer4, {
              class: "text-sm font-medium",
              children: ($$renderer5) => {
                $$renderer5.push(`<!---->Active Agents`);
              },
              $$slots: { default: true }
            });
            $$renderer4.push(`<!----> `);
            Users($$renderer4, { class: "text-muted-foreground" });
            $$renderer4.push(`<!---->`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----> `);
        Card_content($$renderer3, {
          children: ($$renderer4) => {
            $$renderer4.push(`<div class="text-2xl font-bold">${escape_html(agentStore.activeAgents.length)}</div> <p class="text-xs text-muted-foreground">of ${escape_html(agentStore.agents.length)} total</p>`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!---->`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Card($$renderer2, {
      children: ($$renderer3) => {
        Card_header($$renderer3, {
          class: "flex flex-row items-center justify-between space-y-0 pb-2",
          children: ($$renderer4) => {
            Card_title($$renderer4, {
              class: "text-sm font-medium",
              children: ($$renderer5) => {
                $$renderer5.push(`<!---->Pending Tasks`);
              },
              $$slots: { default: true }
            });
            $$renderer4.push(`<!----> `);
            Clock($$renderer4, { class: "text-muted-foreground" });
            $$renderer4.push(`<!---->`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----> `);
        Card_content($$renderer3, {
          children: ($$renderer4) => {
            $$renderer4.push(`<div class="text-2xl font-bold">${escape_html(taskStore.pendingTasks.length)}</div> <p class="text-xs text-muted-foreground">in queue</p>`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!---->`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Card($$renderer2, {
      children: ($$renderer3) => {
        Card_header($$renderer3, {
          class: "flex flex-row items-center justify-between space-y-0 pb-2",
          children: ($$renderer4) => {
            Card_title($$renderer4, {
              class: "text-sm font-medium",
              children: ($$renderer5) => {
                $$renderer5.push(`<!---->In Progress`);
              },
              $$slots: { default: true }
            });
            $$renderer4.push(`<!----> `);
            Play($$renderer4, { class: "text-info" });
            $$renderer4.push(`<!---->`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----> `);
        Card_content($$renderer3, {
          children: ($$renderer4) => {
            $$renderer4.push(`<div class="text-2xl font-bold text-info">${escape_html(taskStore.inProgressTasks.length)}</div> <p class="text-xs text-muted-foreground">tasks running</p>`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!---->`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Card($$renderer2, {
      children: ($$renderer3) => {
        Card_header($$renderer3, {
          class: "flex flex-row items-center justify-between space-y-0 pb-2",
          children: ($$renderer4) => {
            Card_title($$renderer4, {
              class: "text-sm font-medium",
              children: ($$renderer5) => {
                $$renderer5.push(`<!---->Completed Today`);
              },
              $$slots: { default: true }
            });
            $$renderer4.push(`<!----> `);
            Circle_check_big($$renderer4, { class: "text-success" });
            $$renderer4.push(`<!---->`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----> `);
        Card_content($$renderer3, {
          children: ($$renderer4) => {
            $$renderer4.push(`<div class="text-2xl font-bold text-success">${escape_html(taskStore.completedTasks.filter((t) => new Date(t.completedAt ?? "").toDateString() === (/* @__PURE__ */ new Date()).toDateString()).length)}</div> <p class="text-xs text-muted-foreground">tasks finished</p>`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!---->`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div> <div class="grid gap-6 lg:grid-cols-2">`);
    Card($$renderer2, {
      children: ($$renderer3) => {
        Card_header($$renderer3, {
          children: ($$renderer4) => {
            Card_title($$renderer4, {
              children: ($$renderer5) => {
                $$renderer5.push(`<!---->Active Agents`);
              },
              $$slots: { default: true }
            });
            $$renderer4.push(`<!----> `);
            Card_description($$renderer4, {
              children: ($$renderer5) => {
                $$renderer5.push(`<!---->Currently running agents and their status`);
              },
              $$slots: { default: true }
            });
            $$renderer4.push(`<!---->`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----> `);
        Card_content($$renderer3, {
          children: ($$renderer4) => {
            if (agentStore.activeAgents.length === 0) {
              $$renderer4.push("<!--[-->");
              Empty($$renderer4, {
                class: "py-6",
                children: ($$renderer5) => {
                  Empty_header($$renderer5, {
                    children: ($$renderer6) => {
                      Empty_media($$renderer6, {
                        variant: "icon",
                        children: ($$renderer7) => {
                          Users($$renderer7, { class: "size-5" });
                        },
                        $$slots: { default: true }
                      });
                      $$renderer6.push(`<!----> `);
                      Empty_title($$renderer6, {
                        children: ($$renderer7) => {
                          $$renderer7.push(`<!---->No agents currently active`);
                        },
                        $$slots: { default: true }
                      });
                      $$renderer6.push(`<!----> `);
                      Empty_description($$renderer6, {
                        children: ($$renderer7) => {
                          $$renderer7.push(`<!---->Agents will appear here when running`);
                        },
                        $$slots: { default: true }
                      });
                      $$renderer6.push(`<!---->`);
                    },
                    $$slots: { default: true }
                  });
                },
                $$slots: { default: true }
              });
            } else {
              $$renderer4.push("<!--[!-->");
              $$renderer4.push(`<div class="space-y-3"><!--[-->`);
              const each_array = ensure_array_like(agentStore.activeAgents);
              for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
                let agent = each_array[$$index];
                Agent_status_card($$renderer4, { agent });
              }
              $$renderer4.push(`<!--]--></div>`);
            }
            $$renderer4.push(`<!--]-->`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!---->`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Card($$renderer2, {
      children: ($$renderer3) => {
        Card_header($$renderer3, {
          children: ($$renderer4) => {
            Card_title($$renderer4, {
              children: ($$renderer5) => {
                $$renderer5.push(`<!---->Recent Tasks`);
              },
              $$slots: { default: true }
            });
            $$renderer4.push(`<!----> `);
            Card_description($$renderer4, {
              children: ($$renderer5) => {
                $$renderer5.push(`<!---->Latest tasks and their progress`);
              },
              $$slots: { default: true }
            });
            $$renderer4.push(`<!---->`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----> `);
        Card_content($$renderer3, {
          children: ($$renderer4) => {
            if (taskStore.tasks.length === 0) {
              $$renderer4.push("<!--[-->");
              $$renderer4.push(`<div class="rounded-lg bg-muted p-6 text-center text-sm text-muted-foreground">No tasks yet</div>`);
            } else {
              $$renderer4.push("<!--[!-->");
              $$renderer4.push(`<div class="space-y-3"><!--[-->`);
              const each_array_1 = ensure_array_like(taskStore.tasks.slice(0, 5));
              for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
                let task = each_array_1[$$index_1];
                Task_card($$renderer4, { task, compact: true });
              }
              $$renderer4.push(`<!--]--></div>`);
            }
            $$renderer4.push(`<!--]-->`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!---->`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div> `);
    Card($$renderer2, {
      children: ($$renderer3) => {
        Card_header($$renderer3, {
          children: ($$renderer4) => {
            Card_title($$renderer4, {
              children: ($$renderer5) => {
                $$renderer5.push(`<!---->Recent Activity`);
              },
              $$slots: { default: true }
            });
            $$renderer4.push(`<!----> `);
            Card_description($$renderer4, {
              children: ($$renderer5) => {
                $$renderer5.push(`<!---->Latest events from the system`);
              },
              $$slots: { default: true }
            });
            $$renderer4.push(`<!---->`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----> `);
        Card_content($$renderer3, {
          children: ($$renderer4) => {
            if (eventStore.events.length === 0) {
              $$renderer4.push("<!--[-->");
              $$renderer4.push(`<div class="rounded-lg bg-muted p-6 text-center text-sm text-muted-foreground">No recent activity</div>`);
            } else {
              $$renderer4.push("<!--[!-->");
              $$renderer4.push(`<div class="space-y-2"><!--[-->`);
              const each_array_2 = ensure_array_like(eventStore.events.slice(0, 10));
              for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
                let event = each_array_2[$$index_2];
                Event_card($$renderer4, { event });
              }
              $$renderer4.push(`<!--]--></div>`);
            }
            $$renderer4.push(`<!--]-->`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!---->`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div>`);
  });
}
export {
  _page as default
};
//# sourceMappingURL=_page.svelte.js.map
