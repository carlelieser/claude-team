<script lang="ts">
  import '../app.css';
  import { DashboardShell } from '$lib/components/layout';

  interface Props {
    children: import('svelte').Snippet;
  }

  let { children }: Props = $props();
</script>

<DashboardShell>
  {@render children()}
</DashboardShell>
