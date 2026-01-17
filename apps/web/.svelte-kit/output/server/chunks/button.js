import { e as attributes, f as clsx$1, g as bind_props } from "./index.js";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";
function getElectronAPI() {
  if (typeof window !== "undefined" && window.electronAPI) {
    return window.electronAPI;
  }
  return null;
}
function createMockApi() {
  const success = (value) => ({ ok: true, value });
  return {
    invoke: {
      "workspace:list": async () => success([]),
      "workspace:get": async () => ({ ok: false, error: { type: "notFound", message: "Not found", resource: "workspace" } }),
      "workspace:getCurrent": async () => success(null),
      "project:list": async () => success([]),
      "project:get": async () => ({ ok: false, error: { type: "notFound", message: "Not found", resource: "project" } }),
      "project:getCurrent": async () => success(null),
      "project:switch": async () => success(void 0),
      "task:list": async () => success([]),
      "task:get": async () => ({ ok: false, error: { type: "notFound", message: "Not found", resource: "task" } }),
      "task:create": async (data) => success({
        id: crypto.randomUUID(),
        projectId: data.projectId,
        agentId: data.agentId ?? null,
        title: data.title,
        description: data.description ?? null,
        status: "pending",
        priority: data.priority ?? 0,
        parentId: data.parentId ?? null,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        startedAt: null,
        completedAt: null,
        error: null
      }),
      "task:update": async () => ({ ok: false, error: { type: "notFound", message: "Not found", resource: "task" } }),
      "task:cancel": async () => success(void 0),
      "agent:list": async () => success([]),
      "agent:get": async () => ({ ok: false, error: { type: "notFound", message: "Not found", resource: "agent" } }),
      "agent:start": async () => success(void 0),
      "agent:stop": async () => success(void 0),
      "agent:pause": async () => success(void 0),
      "agent:resume": async () => success(void 0),
      "event:list": async () => success([]),
      "event:subscribe": async () => success(void 0),
      "event:unsubscribe": async () => success(void 0),
      "approval:list": async () => success([]),
      "approval:get": async () => ({ ok: false, error: { type: "notFound", message: "Not found", resource: "approval" } }),
      "approval:approve": async () => ({ ok: false, error: { type: "notFound", message: "Not found", resource: "approval" } }),
      "approval:reject": async () => ({ ok: false, error: { type: "notFound", message: "Not found", resource: "approval" } }),
      "approval:count": async () => success(0),
      "system:getState": async () => success({
        status: "idle",
        activeTaskCount: 0,
        pendingApprovals: 0,
        currentProjectId: null,
        currentWorkspaceId: null
      }),
      "system:quit": async () => success(void 0)
    },
    subscribe: {
      "agent:progress": () => () => {
      },
      "task:updated": () => () => {
      },
      "approval:required": () => () => {
      },
      "approval:updated": () => () => {
      },
      "event:new": () => () => {
      }
    }
  };
}
const electronAPI = getElectronAPI() ?? createMockApi();
const ipc = {
  workspace: {
    list: () => electronAPI.invoke["workspace:list"](),
    get: (id) => electronAPI.invoke["workspace:get"](id),
    getCurrent: () => electronAPI.invoke["workspace:getCurrent"]()
  },
  project: {
    list: (workspaceId) => electronAPI.invoke["project:list"](workspaceId),
    get: (id) => electronAPI.invoke["project:get"](id),
    getCurrent: () => electronAPI.invoke["project:getCurrent"](),
    switch: (id) => electronAPI.invoke["project:switch"](id)
  },
  task: {
    list: (filter) => electronAPI.invoke["task:list"](filter),
    get: (id) => electronAPI.invoke["task:get"](id),
    create: (data) => electronAPI.invoke["task:create"](data),
    update: (id, data) => electronAPI.invoke["task:update"](id, data),
    cancel: (id) => electronAPI.invoke["task:cancel"](id)
  },
  agent: {
    list: () => electronAPI.invoke["agent:list"](),
    get: (id) => electronAPI.invoke["agent:get"](id),
    start: (id, taskId) => electronAPI.invoke["agent:start"](id, taskId),
    stop: (id) => electronAPI.invoke["agent:stop"](id),
    pause: (id) => electronAPI.invoke["agent:pause"](id),
    resume: (id) => electronAPI.invoke["agent:resume"](id)
  },
  event: {
    list: (filter) => electronAPI.invoke["event:list"](filter),
    subscribe: (types) => electronAPI.invoke["event:subscribe"](types),
    unsubscribe: () => electronAPI.invoke["event:unsubscribe"]()
  },
  approval: {
    list: (filter) => electronAPI.invoke["approval:list"](filter),
    get: (id) => electronAPI.invoke["approval:get"](id),
    approve: (id) => electronAPI.invoke["approval:approve"](id),
    reject: (id, reason) => electronAPI.invoke["approval:reject"](id, reason),
    count: (projectId) => electronAPI.invoke["approval:count"](projectId)
  },
  system: {
    getState: () => electronAPI.invoke["system:getState"](),
    quit: () => electronAPI.invoke["system:quit"]()
  },
  on: {
    agentProgress: (callback) => electronAPI.subscribe["agent:progress"](callback),
    taskUpdated: (callback) => electronAPI.subscribe["task:updated"](callback),
    approvalRequired: (callback) => electronAPI.subscribe["approval:required"](callback),
    approvalUpdated: (callback) => electronAPI.subscribe["approval:updated"](callback),
    eventNew: (callback) => electronAPI.subscribe["event:new"](callback)
  }
};
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const buttonVariants = tv({
  base: "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs",
      destructive: "bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 text-white shadow-xs",
      outline: "bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 border shadow-xs",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-xs",
      ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
      link: "text-primary underline-offset-4 hover:underline"
    },
    size: {
      default: "h-9 px-4 py-2 has-[>svg]:px-3",
      sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
      lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
      icon: "size-9",
      "icon-sm": "size-8",
      "icon-lg": "size-10"
    }
  },
  defaultVariants: { variant: "default", size: "default" }
});
function Button($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      class: className,
      variant = "default",
      size = "default",
      ref = null,
      href = void 0,
      type = "button",
      disabled,
      children,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    if (href) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<a${attributes({
        "data-slot": "button",
        class: clsx$1(cn(buttonVariants({ variant, size }), className)),
        href: disabled ? void 0 : href,
        "aria-disabled": disabled,
        role: disabled ? "link" : void 0,
        tabindex: disabled ? -1 : void 0,
        ...restProps
      })}>`);
      children?.($$renderer2);
      $$renderer2.push(`<!----></a>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<button${attributes({
        "data-slot": "button",
        class: clsx$1(cn(buttonVariants({ variant, size }), className)),
        type,
        disabled,
        ...restProps
      })}>`);
      children?.($$renderer2);
      $$renderer2.push(`<!----></button>`);
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { ref });
  });
}
export {
  Button as B,
  cn as c,
  ipc as i
};
//# sourceMappingURL=button.js.map
