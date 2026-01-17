import { e as escape_html } from "./context.js";
import "clsx";
import { v as element, g as bind_props, e as attributes, f as clsx } from "./index.js";
import { c as cn } from "./button.js";
import { tv } from "tailwind-variants";
function Header($$renderer, $$props) {
  let { title, subtitle, actions } = $$props;
  $$renderer.push(`<header class="flex h-14 items-center justify-between border-b bg-white px-6"><div><h1 class="text-lg font-semibold text-surface-900">${escape_html(title)}</h1> `);
  if (subtitle) {
    $$renderer.push("<!--[-->");
    $$renderer.push(`<p class="text-sm text-surface-500">${escape_html(subtitle)}</p>`);
  } else {
    $$renderer.push("<!--[!-->");
  }
  $$renderer.push(`<!--]--></div> <div class="flex items-center gap-4">`);
  if (actions) {
    $$renderer.push("<!--[-->");
    actions($$renderer);
    $$renderer.push(`<!---->`);
  } else {
    $$renderer.push("<!--[!-->");
  }
  $$renderer.push(`<!--]--></div></header>`);
}
const badgeVariants = tv({
  base: "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] [&>svg]:pointer-events-none [&>svg]:size-3",
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90 border-transparent",
      secondary: "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90 border-transparent",
      destructive: "bg-destructive [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/70 border-transparent text-white",
      outline: "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground"
    }
  },
  defaultVariants: { variant: "default" }
});
function Badge($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      href,
      class: className,
      variant = "default",
      children,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    element(
      $$renderer2,
      href ? "a" : "span",
      () => {
        $$renderer2.push(`${attributes({
          "data-slot": "badge",
          href,
          class: clsx(cn(badgeVariants({ variant }), className)),
          ...restProps
        })}`);
      },
      () => {
        children?.($$renderer2);
        $$renderer2.push(`<!---->`);
      }
    );
    bind_props($$props, { ref });
  });
}
export {
  Badge as B,
  Header as H
};
//# sourceMappingURL=badge.js.map
