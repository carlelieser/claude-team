import { j as attr, k as attr_class, h as stringify } from "./index.js";
import { B as Badge } from "./badge.js";
import { e as escape_html } from "./context.js";
function Event_card($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { event } = $$props;
    const typeColors = {
      "task.": "bg-info-muted text-info-muted-foreground border-transparent",
      "agent.": "bg-accent text-accent-foreground border-transparent",
      "system.": "bg-muted text-muted-foreground border-transparent",
      "error": "bg-destructive/10 text-destructive border-transparent"
    };
    function getTypeColor(type) {
      for (const [prefix, color] of Object.entries(typeColors)) {
        if (type.startsWith(prefix)) {
          return color;
        }
      }
      return "bg-muted text-muted-foreground border-transparent";
    }
    let expanded = false;
    $$renderer2.push(`<div class="rounded-lg border bg-white p-3 text-sm"><div class="flex items-start justify-between gap-3"><div class="min-w-0 flex-1"><div class="flex items-center gap-2">`);
    Badge($$renderer2, {
      class: getTypeColor(event.type),
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->${escape_html(event.type)}`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> <span class="text-xs text-surface-400">${escape_html(new Date(event.timestamp).toLocaleTimeString())}</span></div> <div class="mt-1 flex items-center gap-2 text-xs text-surface-500"><span>Source: ${escape_html(event.source)}</span> `);
    if (event.processed) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<span class="text-success">Processed</span>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div> <button class="flex-shrink-0 p-1 text-surface-400 hover:text-surface-600"${attr("aria-expanded", expanded)}${attr("aria-label", "Expand event details")}><svg${attr_class(`h-4 w-4 transition-transform ${stringify("")}`)} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export {
  Event_card as E
};
//# sourceMappingURL=event-card.js.map
