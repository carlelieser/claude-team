import { n as ensure_array_like, l as sanitize_props, s as spread_props, m as slot, e as attributes, f as clsx, g as bind_props, k as attr_class, h as stringify } from "../../../chunks/index.js";
import "../../../chunks/client.js";
import "clsx";
import "../../../chunks/sheet-content.js";
import { B as Button, c as cn } from "../../../chunks/button.js";
import { t as taskStore } from "../../../chunks/tasks.svelte.js";
import { B as Badge, H as Header } from "../../../chunks/badge.js";
import { a as agentStore } from "../../../chunks/agents.svelte.js";
import { I as Input } from "../../../chunks/input.js";
import { S as Select, a as Select_trigger, b as Select_content, c as Select_item } from "../../../chunks/select-trigger.js";
import { e as escape_html } from "../../../chunks/context.js";
import { T as Task_card } from "../../../chunks/task-card.js";
import { E as Empty, a as Empty_header, b as Empty_media, d as Empty_description, c as Empty_title } from "../../../chunks/empty-description.js";
import { I as Icon } from "../../../chunks/Icon.js";
import { createTable, getCoreRowModel } from "@tanstack/table-core";
function createRawSnippet(fn) {
  return (renderer, ...args) => {
    var getters = (
      /** @type {Getters<Params>} */
      args.map((value) => () => value)
    );
    renderer.push(
      fn(...getters).render().trim()
    );
  };
}
function Task_create_form($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { onClose } = $$props;
    let title = "";
    let description = "";
    let agentId = void 0;
    let priorityValue = "0";
    let submitting = false;
    const priorityOptions = [
      { value: "0", label: "Low" },
      { value: "1", label: "Medium" },
      { value: "2", label: "High" },
      { value: "3", label: "Urgent" }
    ];
    const selectedAgentLabel = agentId ? agentStore.agents.find((a) => a.id === agentId)?.name ?? "Unknown" : "Auto-assign";
    const selectedPriorityLabel = priorityOptions.find((p) => p.value === priorityValue)?.label ?? "Low";
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<form class="space-y-4">`);
      {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--> <div><label class="mb-1 block text-sm font-medium text-surface-700" for="title">Title</label> `);
      Input($$renderer3, {
        id: "title",
        type: "text",
        placeholder: "What needs to be done?",
        required: true,
        get value() {
          return title;
        },
        set value($$value) {
          title = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----></div> <div><label class="mb-1 block text-sm font-medium text-surface-700" for="description">Description</label> <textarea id="description" class="flex min-h-[80px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50" placeholder="Add more details...">`);
      const $$body = escape_html(description);
      if ($$body) {
        $$renderer3.push(`${$$body}`);
      }
      $$renderer3.push(`</textarea></div> <div class="grid gap-4 sm:grid-cols-2"><div><label class="mb-1 block text-sm font-medium text-surface-700" id="agent-label">Assign to Agent</label> `);
      Select($$renderer3, {
        type: "single",
        get value() {
          return agentId;
        },
        set value($$value) {
          agentId = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          Select_trigger($$renderer4, {
            class: "w-full",
            "aria-labelledby": "agent-label",
            children: ($$renderer5) => {
              $$renderer5.push(`<!---->${escape_html(selectedAgentLabel)}`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----> `);
          Select_content($$renderer4, {
            children: ($$renderer5) => {
              Select_item($$renderer5, {
                value: void 0,
                children: ($$renderer6) => {
                  $$renderer6.push(`<!---->Auto-assign`);
                },
                $$slots: { default: true }
              });
              $$renderer5.push(`<!----> <!--[-->`);
              const each_array = ensure_array_like(agentStore.agents);
              for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
                let agent = each_array[$$index];
                Select_item($$renderer5, {
                  value: agent.id,
                  children: ($$renderer6) => {
                    $$renderer6.push(`<!---->${escape_html(agent.name)}`);
                  },
                  $$slots: { default: true }
                });
              }
              $$renderer5.push(`<!--]-->`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!---->`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></div> <div><label class="mb-1 block text-sm font-medium text-surface-700" id="priority-label">Priority</label> `);
      Select($$renderer3, {
        type: "single",
        get value() {
          return priorityValue;
        },
        set value($$value) {
          priorityValue = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          Select_trigger($$renderer4, {
            class: "w-full",
            "aria-labelledby": "priority-label",
            children: ($$renderer5) => {
              $$renderer5.push(`<!---->${escape_html(selectedPriorityLabel)}`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----> `);
          Select_content($$renderer4, {
            children: ($$renderer5) => {
              $$renderer5.push(`<!--[-->`);
              const each_array_1 = ensure_array_like(priorityOptions);
              for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
                let option = each_array_1[$$index_1];
                Select_item($$renderer5, {
                  value: option.value,
                  children: ($$renderer6) => {
                    $$renderer6.push(`<!---->${escape_html(option.label)}`);
                  },
                  $$slots: { default: true }
                });
              }
              $$renderer5.push(`<!--]-->`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!---->`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></div></div> <div class="flex justify-end gap-3 border-t pt-4">`);
      if (onClose) {
        $$renderer3.push("<!--[-->");
        Button($$renderer3, {
          type: "button",
          variant: "secondary",
          onclick: onClose,
          children: ($$renderer4) => {
            $$renderer4.push(`<!---->Cancel`);
          },
          $$slots: { default: true }
        });
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--> `);
      Button($$renderer3, {
        type: "submit",
        disabled: submitting,
        children: ($$renderer4) => {
          $$renderer4.push(`<!---->${escape_html("Create Task")}`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></div></form>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
function Inbox($$renderer, $$props) {
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
      "polyline",
      { "points": "22 12 16 12 14 15 10 15 8 12 2 12" }
    ],
    [
      "path",
      {
        "d": "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"
      }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "inbox" },
    $$sanitized_props,
    {
      /**
       * @component @name Inbox
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cG9seWxpbmUgcG9pbnRzPSIyMiAxMiAxNiAxMiAxNCAxNSAxMCAxNSA4IDEyIDIgMTIiIC8+CiAgPHBhdGggZD0iTTUuNDUgNS4xMSAyIDEydjZhMiAyIDAgMCAwIDIgMmgxNmEyIDIgMCAwIDAgMi0ydi02bC0zLjQ1LTYuODlBMiAyIDAgMCAwIDE2Ljc2IDRINy4yNGEyIDIgMCAwIDAtMS43OSAxLjExeiIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/inbox
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
function Task_kanban_board($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const columns = [
      {
        key: "pending",
        label: "Pending",
        tasks: () => taskStore.pendingTasks
      },
      {
        key: "in_progress",
        label: "In Progress",
        tasks: () => taskStore.inProgressTasks
      },
      {
        key: "completed",
        label: "Completed",
        tasks: () => taskStore.completedTasks
      },
      {
        key: "failed",
        label: "Failed",
        tasks: () => taskStore.failedTasks
      }
    ];
    if (taskStore.loading) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex items-center justify-center py-12"><div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (taskStore.error) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">${escape_html(taskStore.error)}</div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<div class="flex gap-4 overflow-x-auto pb-4"><!--[-->`);
        const each_array = ensure_array_like(columns);
        for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
          let column = each_array[$$index_1];
          const columnTasks = column.tasks();
          $$renderer2.push(`<div class="flex w-80 flex-shrink-0 flex-col gap-3"><div class="flex items-center justify-between"><h3 class="font-medium text-surface-700">${escape_html(column.label)}</h3> <span class="rounded-full bg-surface-100 px-2 py-0.5 text-xs text-surface-500">${escape_html(columnTasks.length)}</span></div> <div class="space-y-3 rounded-lg bg-surface-100 p-3 min-h-[200px]">`);
          if (columnTasks.length === 0) {
            $$renderer2.push("<!--[-->");
            Empty($$renderer2, {
              class: "py-6",
              children: ($$renderer3) => {
                Empty_header($$renderer3, {
                  children: ($$renderer4) => {
                    Empty_media($$renderer4, {
                      variant: "icon",
                      children: ($$renderer5) => {
                        Inbox($$renderer5, { class: "size-4" });
                      },
                      $$slots: { default: true }
                    });
                    $$renderer4.push(`<!----> `);
                    Empty_description($$renderer4, {
                      children: ($$renderer5) => {
                        $$renderer5.push(`<!---->No tasks`);
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
            $$renderer2.push(`<!--[-->`);
            const each_array_1 = ensure_array_like(columnTasks);
            for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
              let task = each_array_1[$$index];
              Task_card($$renderer2, { task, compact: true });
            }
            $$renderer2.push(`<!--]-->`);
          }
          $$renderer2.push(`<!--]--></div></div>`);
        }
        $$renderer2.push(`<!--]--></div>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
class RenderComponentConfig {
  component;
  props;
  constructor(component, props = {}) {
    this.component = component;
    this.props = props;
  }
}
class RenderSnippetConfig {
  snippet;
  params;
  constructor(snippet, params) {
    this.snippet = snippet;
    this.params = params;
  }
}
function renderComponent(component, props = {}) {
  return new RenderComponentConfig(component, props);
}
function renderSnippet(snippet, params = {}) {
  return new RenderSnippetConfig(snippet, params);
}
function Flex_render($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { content, context, attach } = $$props;
    if (typeof content === "string") {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`${escape_html(content)}`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (content instanceof Function) {
        $$renderer2.push("<!--[-->");
        const result = content(context);
        if (result instanceof RenderComponentConfig) {
          $$renderer2.push("<!--[-->");
          const { component: Component, props } = result;
          $$renderer2.push(`<!---->`);
          Component($$renderer2, spread_props([props, { attach }]));
          $$renderer2.push(`<!---->`);
        } else {
          $$renderer2.push("<!--[!-->");
          if (result instanceof RenderSnippetConfig) {
            $$renderer2.push("<!--[-->");
            const { snippet, params } = result;
            snippet($$renderer2, { ...params, attach });
            $$renderer2.push(`<!---->`);
          } else {
            $$renderer2.push("<!--[!-->");
            $$renderer2.push(`${escape_html(result)}`);
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]-->`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function createSvelteTable(options) {
  const resolvedOptions = mergeObjects(
    {
      state: {},
      onStateChange() {
      },
      renderFallbackValue: null,
      mergeOptions: (defaultOptions, options2) => {
        return mergeObjects(defaultOptions, options2);
      }
    },
    options
  );
  const table = createTable(resolvedOptions);
  let state = table.initialState;
  function updateOptions() {
    table.setOptions((prev) => {
      return mergeObjects(prev, options, {
        state: mergeObjects(state, options.state || {}),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onStateChange: (updater) => {
          if (updater instanceof Function) state = updater(state);
          else state = mergeObjects(state, updater);
          options.onStateChange?.(updater);
        }
      });
    });
  }
  updateOptions();
  return table;
}
function mergeObjects(...sources) {
  const resolve = (src) => typeof src === "function" ? src() ?? void 0 : src;
  const findSourceWithKey = (key) => {
    for (let i = sources.length - 1; i >= 0; i--) {
      const obj = resolve(sources[i]);
      if (obj && key in obj) return obj;
    }
    return void 0;
  };
  return new Proxy(/* @__PURE__ */ Object.create(null), {
    get(_, key) {
      const src = findSourceWithKey(key);
      return src?.[key];
    },
    has(_, key) {
      return !!findSourceWithKey(key);
    },
    ownKeys() {
      const all = /* @__PURE__ */ new Set();
      for (const s of sources) {
        const obj = resolve(s);
        if (obj) {
          for (const k of Reflect.ownKeys(obj)) {
            all.add(k);
          }
        }
      }
      return [...all];
    },
    getOwnPropertyDescriptor(_, key) {
      const src = findSourceWithKey(key);
      if (!src) return void 0;
      return {
        configurable: true,
        enumerable: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value: src[key],
        writable: true
      };
    }
  });
}
function Table($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      class: className,
      children,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    $$renderer2.push(`<div data-slot="table-container" class="relative w-full overflow-x-auto"><table${attributes({
      "data-slot": "table",
      class: clsx(cn("w-full caption-bottom text-sm", className)),
      ...restProps
    })}>`);
    children?.($$renderer2);
    $$renderer2.push(`<!----></table></div>`);
    bind_props($$props, { ref });
  });
}
function Table_body($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      class: className,
      children,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    $$renderer2.push(`<tbody${attributes({
      "data-slot": "table-body",
      class: clsx(cn("[&_tr:last-child]:border-0", className)),
      ...restProps
    })}>`);
    children?.($$renderer2);
    $$renderer2.push(`<!----></tbody>`);
    bind_props($$props, { ref });
  });
}
function Table_cell($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      class: className,
      children,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    $$renderer2.push(`<td${attributes({
      "data-slot": "table-cell",
      class: clsx(cn("bg-clip-padding p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pe-0", className)),
      ...restProps
    })}>`);
    children?.($$renderer2);
    $$renderer2.push(`<!----></td>`);
    bind_props($$props, { ref });
  });
}
function Table_head($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      class: className,
      children,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    $$renderer2.push(`<th${attributes({
      "data-slot": "table-head",
      class: clsx(cn("text-foreground h-10 bg-clip-padding px-2 text-start align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pe-0", className)),
      ...restProps
    })}>`);
    children?.($$renderer2);
    $$renderer2.push(`<!----></th>`);
    bind_props($$props, { ref });
  });
}
function Table_header($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      class: className,
      children,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    $$renderer2.push(`<thead${attributes({
      "data-slot": "table-header",
      class: clsx(cn("[&_tr]:border-b", className)),
      ...restProps
    })}>`);
    children?.($$renderer2);
    $$renderer2.push(`<!----></thead>`);
    bind_props($$props, { ref });
  });
}
function Table_row($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      class: className,
      children,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    $$renderer2.push(`<tr${attributes({
      "data-slot": "table-row",
      class: clsx(cn("hover:[&,&>svelte-css-wrapper]:[&>th,td]:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors", className)),
      ...restProps
    })}>`);
    children?.($$renderer2);
    $$renderer2.push(`<!----></tr>`);
    bind_props($$props, { ref });
  });
}
function Search($$renderer, $$props) {
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
    ["path", { "d": "m21 21-4.34-4.34" }],
    ["circle", { "cx": "11", "cy": "11", "r": "8" }]
  ];
  Icon($$renderer, spread_props([
    { name: "search" },
    $$sanitized_props,
    {
      /**
       * @component @name Search
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtMjEgMjEtNC4zNC00LjM0IiAvPgogIDxjaXJjbGUgY3g9IjExIiBjeT0iMTEiIHI9IjgiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/search
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
function Task_data_table($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data, columns } = $$props;
    const table = createSvelteTable({
      get data() {
        return data;
      },
      get columns() {
        return columns;
      },
      getCoreRowModel: getCoreRowModel()
    });
    $$renderer2.push(`<div class="overflow-hidden rounded-lg border bg-white"><!---->`);
    Table($$renderer2, {
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->`);
        Table_header($$renderer3, {
          class: "bg-surface-50",
          children: ($$renderer4) => {
            $$renderer4.push(`<!--[-->`);
            const each_array = ensure_array_like(table.getHeaderGroups());
            for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
              let headerGroup = each_array[$$index_1];
              $$renderer4.push(`<!---->`);
              Table_row($$renderer4, {
                children: ($$renderer5) => {
                  $$renderer5.push(`<!--[-->`);
                  const each_array_1 = ensure_array_like(headerGroup.headers);
                  for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
                    let header = each_array_1[$$index];
                    $$renderer5.push(`<!---->`);
                    Table_head($$renderer5, {
                      colspan: header.colSpan,
                      class: "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500",
                      children: ($$renderer6) => {
                        if (!header.isPlaceholder) {
                          $$renderer6.push("<!--[-->");
                          Flex_render($$renderer6, {
                            content: header.column.columnDef.header,
                            context: header.getContext()
                          });
                        } else {
                          $$renderer6.push("<!--[!-->");
                        }
                        $$renderer6.push(`<!--]-->`);
                      },
                      $$slots: { default: true }
                    });
                    $$renderer5.push(`<!---->`);
                  }
                  $$renderer5.push(`<!--]-->`);
                },
                $$slots: { default: true }
              });
              $$renderer4.push(`<!---->`);
            }
            $$renderer4.push(`<!--]-->`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----> <!---->`);
        Table_body($$renderer3, {
          children: ($$renderer4) => {
            const each_array_2 = ensure_array_like(table.getRowModel().rows);
            if (each_array_2.length !== 0) {
              $$renderer4.push("<!--[-->");
              for (let $$index_3 = 0, $$length = each_array_2.length; $$index_3 < $$length; $$index_3++) {
                let row = each_array_2[$$index_3];
                $$renderer4.push(`<!---->`);
                Table_row($$renderer4, {
                  class: "hover:bg-surface-50",
                  children: ($$renderer5) => {
                    $$renderer5.push(`<!--[-->`);
                    const each_array_3 = ensure_array_like(row.getVisibleCells());
                    for (let $$index_2 = 0, $$length2 = each_array_3.length; $$index_2 < $$length2; $$index_2++) {
                      let cell = each_array_3[$$index_2];
                      $$renderer5.push(`<!---->`);
                      Table_cell($$renderer5, {
                        class: "px-4 py-3",
                        children: ($$renderer6) => {
                          Flex_render($$renderer6, {
                            content: cell.column.columnDef.cell,
                            context: cell.getContext()
                          });
                        },
                        $$slots: { default: true }
                      });
                      $$renderer5.push(`<!---->`);
                    }
                    $$renderer5.push(`<!--]-->`);
                  },
                  $$slots: { default: true }
                });
                $$renderer4.push(`<!---->`);
              }
            } else {
              $$renderer4.push("<!--[!-->");
              $$renderer4.push(`<!---->`);
              Table_row($$renderer4, {
                children: ($$renderer5) => {
                  $$renderer5.push(`<!---->`);
                  Table_cell($$renderer5, {
                    colspan: columns.length,
                    class: "h-32",
                    children: ($$renderer6) => {
                      $$renderer6.push(`<!---->`);
                      Empty($$renderer6, {
                        children: ($$renderer7) => {
                          $$renderer7.push(`<!---->`);
                          Empty_header($$renderer7, {
                            children: ($$renderer8) => {
                              $$renderer8.push(`<!---->`);
                              Empty_media($$renderer8, {
                                variant: "icon",
                                children: ($$renderer9) => {
                                  Search($$renderer9, { class: "size-5" });
                                },
                                $$slots: { default: true }
                              });
                              $$renderer8.push(`<!----> <!---->`);
                              Empty_title($$renderer8, {
                                children: ($$renderer9) => {
                                  $$renderer9.push(`<!---->No tasks found`);
                                },
                                $$slots: { default: true }
                              });
                              $$renderer8.push(`<!----> <!---->`);
                              Empty_description($$renderer8, {
                                children: ($$renderer9) => {
                                  $$renderer9.push(`<!---->Try adjusting your search or filters`);
                                },
                                $$slots: { default: true }
                              });
                              $$renderer8.push(`<!---->`);
                            },
                            $$slots: { default: true }
                          });
                          $$renderer7.push(`<!---->`);
                        },
                        $$slots: { default: true }
                      });
                      $$renderer6.push(`<!---->`);
                    },
                    $$slots: { default: true }
                  });
                  $$renderer5.push(`<!---->`);
                },
                $$slots: { default: true }
              });
              $$renderer4.push(`<!---->`);
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
function Data_table_status_cell($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const { status } = $$props;
    const STATUS_COLORS = {
      pending: "bg-muted text-muted-foreground border-transparent",
      in_progress: "bg-blue-100 text-blue-700 border-transparent",
      completed: "bg-green-100 text-green-700 border-transparent",
      failed: "bg-red-100 text-red-700 border-transparent",
      canceled: "bg-muted text-muted-foreground border-transparent"
    };
    const displayStatus = status.replace("_", " ");
    Badge($$renderer2, {
      class: STATUS_COLORS[status],
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->${escape_html(displayStatus)}`);
      },
      $$slots: { default: true }
    });
  });
}
function Data_table_actions_cell($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const { task, onCancel } = $$props;
    const canCancel = task.status === "pending" || task.status === "in_progress";
    $$renderer2.push(`<div class="text-right">`);
    if (canCancel) {
      $$renderer2.push("<!--[-->");
      Button($$renderer2, {
        variant: "ghost",
        size: "sm",
        class: "text-red-600 hover:text-red-700 hover:bg-red-50",
        onclick: () => onCancel(task.id),
        children: ($$renderer3) => {
          $$renderer3.push(`<!---->Cancel`);
        },
        $$slots: { default: true }
      });
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function createColumns(context) {
  return [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => {
        const task = row.original;
        const titleSnippet = createRawSnippet(
          (getProps) => {
            const { title, description } = getProps();
            const descriptionHtml = description !== null && description !== "" ? `<div class="truncate text-sm text-surface-500">${description}</div>` : "";
            return {
              render: () => `
                <div class="max-w-xs">
                  <div class="truncate font-medium text-surface-900">${title}</div>
                  ${descriptionHtml}
                </div>
              `
            };
          }
        );
        return renderSnippet(titleSnippet, {
          title: task.title,
          description: task.description
        });
      }
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => renderComponent(Data_table_status_cell, {
        status: row.original.status
      })
    },
    {
      accessorKey: "agentId",
      header: "Agent",
      cell: ({ row }) => {
        const agentId = row.original.agentId;
        const agent = agentId !== null && agentId !== "" ? context.getAgentById(agentId) : null;
        const agentSnippet = createRawSnippet(
          (getName) => {
            const name = getName();
            return {
              render: () => `<span class="text-sm text-surface-600">${name}</span>`
            };
          }
        );
        return renderSnippet(agentSnippet, agent?.name ?? "-");
      }
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => {
        const prioritySnippet = createRawSnippet(
          (getPriority) => {
            const priority = getPriority();
            return {
              render: () => `<span class="text-sm text-surface-600">${String(priority)}</span>`
            };
          }
        );
        return renderSnippet(prioritySnippet, row.original.priority);
      }
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const dateSnippet = createRawSnippet(
          (getDate) => {
            const date = getDate();
            const formatted = new Date(date).toLocaleDateString();
            return {
              render: () => `<span class="text-sm text-surface-500">${formatted}</span>`
            };
          }
        );
        return renderSnippet(dateSnippet, row.original.createdAt);
      }
    },
    {
      id: "actions",
      header: () => {
        const headerSnippet = createRawSnippet(
          () => ({
            render: () => `<span class="sr-only">Actions</span>`
          })
        );
        return renderSnippet(headerSnippet, void 0);
      },
      cell: ({ row }) => renderComponent(Data_table_actions_cell, {
        task: row.original,
        onCancel: context.onCancel
      })
    }
  ];
}
function Task_list($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const columns = createColumns({
      getAgentById: (id) => agentStore.getById(id),
      onCancel: (taskId) => taskStore.cancel(taskId)
    });
    if (taskStore.loading) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex items-center justify-center py-12"><div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (taskStore.error) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">${escape_html(taskStore.error)}</div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        Task_data_table($$renderer2, { columns, data: taskStore.tasks });
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let showCreateForm = false;
    {
      let actions = function($$renderer3) {
        $$renderer3.push(`<div class="flex items-center gap-2"><div class="flex rounded-lg border bg-surface-50 p-1"><button${attr_class(`rounded px-2 py-1 text-xs font-medium transition-colors ${stringify(taskStore.viewMode === "kanban" ? "bg-white text-surface-900 shadow-sm" : "text-surface-500 hover:text-surface-700")}`)}>Kanban</button> <button${attr_class(`rounded px-2 py-1 text-xs font-medium transition-colors ${stringify(taskStore.viewMode === "list" ? "bg-white text-surface-900 shadow-sm" : "text-surface-500 hover:text-surface-700")}`)}>List</button></div> `);
        Button($$renderer3, {
          onclick: () => showCreateForm = true,
          children: ($$renderer4) => {
            $$renderer4.push(`<!---->New Task`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----></div>`);
      };
      Header($$renderer2, {
        title: "Tasks",
        subtitle: "Manage and track task progress",
        actions
      });
    }
    $$renderer2.push(`<!----> <div class="flex-1 overflow-auto p-6">`);
    if (taskStore.viewMode === "kanban") {
      $$renderer2.push("<!--[-->");
      Task_kanban_board($$renderer2);
    } else {
      $$renderer2.push("<!--[!-->");
      Task_list($$renderer2);
    }
    $$renderer2.push(`<!--]--></div> `);
    if (showCreateForm) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"><div class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"><h2 class="mb-4 text-lg font-semibold text-surface-900">Create New Task</h2> `);
      Task_create_form($$renderer2, { onClose: () => showCreateForm = false });
      $$renderer2.push(`<!----></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};
//# sourceMappingURL=_page.svelte.js.map
