<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    subtitle?: string;
    actions?: Snippet;
  }

  let { title, subtitle, actions }: Props = $props();
</script>

<header class="flex items-center justify-between border-b bg-card p-4">
  <div>
    <h1 class="text-lg font-semibold">{title}</h1>
    {#if subtitle}
      <p class="text-sm text-muted-foreground">{subtitle}</p>
    {/if}
  </div>

  <div class="flex items-center gap-4">
    {#if actions}
      {@render actions()}
    {/if}
  </div>
</header>
