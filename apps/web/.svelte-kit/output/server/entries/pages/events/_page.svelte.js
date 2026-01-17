import "clsx";
import "../../../chunks/client.js";
import "../../../chunks/sheet-content.js";
import { B as Button } from "../../../chunks/button.js";
import { e as eventStore } from "../../../chunks/events.svelte.js";
import { H as Header } from "../../../chunks/badge.js";
import { n as ensure_array_like } from "../../../chunks/index.js";
import { I as Input } from "../../../chunks/input.js";
import { S as Select, a as Select_trigger, b as Select_content, c as Select_item } from "../../../chunks/select-trigger.js";
import { e as escape_html } from "../../../chunks/context.js";
import { E as Event_card } from "../../../chunks/event-card.js";
import { E as Empty, a as Empty_header, b as Empty_media, c as Empty_title, d as Empty_description } from "../../../chunks/empty-description.js";
import { A as Activity } from "../../../chunks/activity.js";
function Event_filter($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const eventTypes = [
      { value: "task.*", label: "task.*" },
      { value: "agent.*", label: "agent.*" },
      { value: "system.*", label: "system.*" }
    ];
    let typeFilter = eventStore.filter.type;
    let sourceFilter = eventStore.filter.source;
    const selectedTypeLabel = typeFilter ?? "All";
    function applyFilter() {
      eventStore.setFilter({ ...eventStore.filter, type: typeFilter, source: sourceFilter });
    }
    function clearFilter() {
      typeFilter = void 0;
      sourceFilter = void 0;
      eventStore.setFilter({});
    }
    async function toggleStreaming() {
      if (eventStore.isStreaming) {
        await eventStore.stopStreaming();
      } else {
        await eventStore.startStreaming();
      }
    }
    function handleTypeChange(value) {
      typeFilter = value;
      applyFilter();
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="flex flex-wrap items-center gap-4 rounded-lg border bg-white p-4"><div class="flex items-center gap-2"><span class="text-sm text-surface-600" id="type-filter-label">Type:</span> `);
      Select($$renderer3, {
        type: "single",
        onValueChange: handleTypeChange,
        get value() {
          return typeFilter;
        },
        set value($$value) {
          typeFilter = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          Select_trigger($$renderer4, {
            class: "w-auto min-w-24",
            "aria-labelledby": "type-filter-label",
            children: ($$renderer5) => {
              $$renderer5.push(`<!---->${escape_html(selectedTypeLabel)}`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----> `);
          Select_content($$renderer4, {
            children: ($$renderer5) => {
              Select_item($$renderer5, {
                value: void 0,
                children: ($$renderer6) => {
                  $$renderer6.push(`<!---->All`);
                },
                $$slots: { default: true }
              });
              $$renderer5.push(`<!----> <!--[-->`);
              const each_array = ensure_array_like(eventTypes);
              for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
                let type = each_array[$$index];
                Select_item($$renderer5, {
                  value: type.value,
                  children: ($$renderer6) => {
                    $$renderer6.push(`<!---->${escape_html(type.label)}`);
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
      $$renderer3.push(`<!----></div> <div class="flex items-center gap-2"><label class="text-sm text-surface-600" for="source-filter">Source:</label> `);
      Input($$renderer3, {
        id: "source-filter",
        type: "text",
        class: "w-32",
        placeholder: "Filter by source",
        onchange: applyFilter,
        get value() {
          return sourceFilter;
        },
        set value($$value) {
          sourceFilter = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----></div> <div class="flex items-center gap-2">`);
      Button($$renderer3, {
        variant: "ghost",
        size: "sm",
        onclick: clearFilter,
        children: ($$renderer4) => {
          $$renderer4.push(`<!---->Clear`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      Button($$renderer3, {
        variant: eventStore.isStreaming ? "secondary" : "default",
        size: "sm",
        onclick: toggleStreaming,
        children: ($$renderer4) => {
          $$renderer4.push(`<!---->${escape_html(eventStore.isStreaming ? "Pause" : "Resume")} Stream`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></div> <div class="ml-auto text-xs text-surface-500">${escape_html(eventStore.events.length)} events</div></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
function Event_stream($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { maxEvents = 50 } = $$props;
    const displayedEvents = eventStore.events.slice(0, maxEvents);
    if (eventStore.loading) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex items-center justify-center py-12"><div class="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (eventStore.error) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="rounded-lg bg-red-50 p-4 text-sm text-red-600">${escape_html(eventStore.error)}</div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        if (displayedEvents.length === 0) {
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
                      Activity($$renderer5, { class: "size-5" });
                    },
                    $$slots: { default: true }
                  });
                  $$renderer4.push(`<!----> <!---->`);
                  Empty_title($$renderer4, {
                    children: ($$renderer5) => {
                      $$renderer5.push(`<!---->No events yet`);
                    },
                    $$slots: { default: true }
                  });
                  $$renderer4.push(`<!----> <!---->`);
                  Empty_description($$renderer4, {
                    children: ($$renderer5) => {
                      $$renderer5.push(`<!---->Events will appear here as agents work on tasks`);
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
          $$renderer2.push(`<div class="space-y-2">`);
          if (eventStore.isStreaming) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<div class="flex items-center gap-2 text-xs text-surface-500"><span class="relative flex h-2 w-2"><span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span> <span class="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span></span> Live streaming</div>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]--> <!--[-->`);
          const each_array = ensure_array_like(displayedEvents);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let event = each_array[$$index];
            Event_card($$renderer2, { event });
          }
          $$renderer2.push(`<!--]--> `);
          if (eventStore.events.length > maxEvents) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<div class="text-center text-sm text-surface-400">Showing ${escape_html(maxEvents)} of ${escape_html(eventStore.events.length)} events</div>`);
          } else {
            $$renderer2.push("<!--[!-->");
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
        Button($$renderer3, {
          variant: "secondary",
          size: "sm",
          onclick: () => eventStore.clearEvents(),
          children: ($$renderer4) => {
            $$renderer4.push(`<!---->Clear Events`);
          },
          $$slots: { default: true }
        });
      };
      Header($$renderer2, {
        title: "Events",
        subtitle: "Real-time activity stream",
        actions
      });
    }
    $$renderer2.push(`<!----> <div class="flex-1 overflow-auto p-6">`);
    Event_filter($$renderer2);
    $$renderer2.push(`<!----> <div class="mt-4">`);
    Event_stream($$renderer2, { maxEvents: 100 });
    $$renderer2.push(`<!----></div></div>`);
  });
}
export {
  _page as default
};
//# sourceMappingURL=_page.svelte.js.map
