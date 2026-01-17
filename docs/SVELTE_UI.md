# SVELTE UI COMPONENT DIRECTIVES

## OBJECTIVE

DELIVER accessible, maintainable UI components that:
- LEVERAGE shadcn-svelte design system consistently
- REMAIN semantically correct and readable
- FOLLOW Svelte 5 idioms exclusively
- RESPECT design token boundaries

---

## FRAMEWORK VERSION

- MUST USE Svelte 5 syntax exclusively
- MUST USE SvelteKit for routing and data loading
- MUST USE shadcn-svelte components from `$lib/components/ui`

---

## COMPONENT IMPORTS

### UI Components
```svelte
<!-- CORRECT: Named exports -->
<script lang="ts">
  import { Card, CardHeader, CardContent } from "$lib/components/ui/card";
</script>

<Card>
  <CardHeader>Title</CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

```svelte
<!-- PROHIBITED: Dot notation -->
<script lang="ts">
  import * as Card from "$lib/components/ui/card";
</script>

<Card.Root>
  <Card.Header>Title</Card.Header>
</Card.Root>
```

- MUST USE named exports for all UI components
- MUST IMPORT from `$lib/components/ui`
- MUST PREFER shadcn-svelte components over custom implementations

---

## NAMING

| Element         | Convention   | Example                           |
|-----------------|--------------|-----------------------------------|
| Component files | `kebab-case` | `user-profile.svelte`             |
| Props           | `camelCase`  | `isDisabled`, `maxCount`          |
| Event callbacks | `on` prefix  | `onClick`, `onSubmit`, `onChange` |

---

## COMPONENT STRUCTURE

### Script Section
- MUST USE `lang="ts"`
- MUST USE Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`)
- MUST IMPORT page state instead of `$page` store

```svelte
<!-- CORRECT: Svelte 5 -->
<script lang="ts">
  import { page } from "$app/state";

  let { data } = $props();
  let count = $state(0);
  let doubled = $derived(count * 2);
</script>
```

```svelte
<!-- PROHIBITED: Svelte 4 -->
<script lang="ts">
  import { page } from "$app/stores";

  export let data;
  let count = 0;
  $: doubled = count * 2;
</script>
```

### Markup Section
- MUST USE semantic HTML elements
- MUST USE `{#snippet}` over `<slot>`
- MUST KEEP markup readable and properly indented

```svelte
<!-- CORRECT: Svelte 5 snippets -->
{#snippet header()}
  <h2>Title</h2>
{/snippet}

{@render header()}
```

```svelte
<!-- PROHIBITED: Svelte 4 slots -->
<slot name="header">
  <h2>Title</h2>
</slot>
```

---

## STYLING

### Tailwind Usage
- MUST USE `gap` on containers for spacing children
- MUST NOT USE arbitrary margins (`mb-*`, `mt-*`) for content flow
- MUST USE design tokens over custom color values

```svelte
<!-- CORRECT: Gap for spacing -->
<div class="flex flex-col gap-4">
  <Card>...</Card>
  <Card>...</Card>
</div>
```

```svelte
<!-- PROHIBITED: Random margins -->
<div class="flex flex-col">
  <Card class="mb-4">...</Card>
  <Card class="mb-4">...</Card>
</div>
```

### Design Tokens
- MUST USE semantic color tokens (`bg-primary`, `text-muted-foreground`)
- MUST NOT USE arbitrary colors (`bg-blue-500`, `text-[#ff0000]`)
- EXCEPTION: Only when design system lacks required token

### Icons
- MUST NOT ADD redundant size classes
- Icons HAVE default dimensions; `h-4 w-4` is unnecessary
- ONLY specify size when overriding defaults

```svelte
<!-- CORRECT -->
<Icon />
<Icon class="h-6 w-6" /> <!-- Only when overriding default -->
```

```svelte
<!-- PROHIBITED -->
<Icon class="h-4 w-4" /> <!-- Redundant if 4 is default -->
```

---

## ACCESSIBILITY

### Semantic HTML
- MUST USE appropriate elements (`<button>`, `<nav>`, `<main>`, `<article>`)
- MUST NOT USE `<div>` when semantic element exists
- MUST USE ARIA attributes only when HTML semantics insufficient

### Keyboard Navigation
- MUST ENSURE all interactive elements are focusable
- MUST SUPPORT expected keyboard patterns (Enter/Space for buttons, arrows for menus)

### Screen Reader Support
- MUST PROVIDE labels for all interactive elements
- MUST USE `aria-label` or `aria-labelledby` when visible text absent

---

## TESTING

### Stack
- **Unit/Component**: Vitest with Svelte's official testing approach
- **E2E**: Playwright

### File Location
- MUST PLACE tests in `tests/` directory (not colocated)
- MUST NAME test files `*.test.ts` or `*.spec.ts`

### Conventions
- MUST FOLLOW Svelte official testing patterns: https://svelte.dev/docs/svelte/testing
- MUST NAME tests: `should [behavior] when [condition]`
- MUST USE Arrange-Act-Assert pattern
- MUST MOCK external dependencies

---

## PROHIBITED

| VIOLATION                          | CORRECTION                              |
|------------------------------------|-----------------------------------------|
| `import * as Card`                 | USE named imports: `import { Card }`    |
| `<slot>` / `<slot name="x">`       | USE `{#snippet}` and `{@render}`        |
| `$:` reactive statements           | USE `$derived` or `$effect`             |
| `export let prop`                  | USE `let { prop } = $props()`           |
| `$page` store                      | USE `page` from `$app/state`            |
| `mb-4`, `mt-8` for content flow    | USE `gap-*` on parent container         |
| `bg-blue-500`, custom hex colors   | USE design tokens: `bg-primary`         |
| `h-4 w-4` on icons (default size)  | OMIT redundant size classes             |
| Custom component over shadcn       | USE `$lib/components/ui` equivalent     |

---

## COMPONENT CHECKLIST

- [ ] Uses Svelte 5 syntax exclusively (runes, snippets)
- [ ] Imports UI components via named exports
- [ ] Uses shadcn-svelte over custom implementations
- [ ] Semantic HTML structure
- [ ] Spacing via `gap`, not individual margins
- [ ] Design tokens only, no custom colors
- [ ] No redundant icon sizing
- [ ] Accessible (keyboard, screen reader)
