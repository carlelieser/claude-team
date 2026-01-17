<script lang="ts">
  import AppSidebar from './sidebar.svelte';
  import * as Sidebar from '$lib/components/ui/sidebar';
  import { agentStore } from '$lib/stores/agents.svelte';
  import { taskStore } from '$lib/stores/tasks.svelte';
  import { eventStore } from '$lib/stores/events.svelte';
  import { projectStore } from '$lib/stores/projects.svelte';
  import { approvalStore } from '$lib/stores/approvals.svelte';
  import { onMount, onDestroy } from 'svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();

  onMount(async () => {
    await Promise.all([
      agentStore.load(),
      taskStore.load(),
      approvalStore.refreshCount(),
      projectStore.loadCurrent(),
      projectStore.loadProjects(),
    ]);

    agentStore.subscribe();
    taskStore.subscribe();
    approvalStore.subscribe();
    eventStore.startStreaming();
  });

  onDestroy(() => {
    agentStore.unsubscribe();
    taskStore.unsubscribe();
    approvalStore.unsubscribe();
    eventStore.stopStreaming();
  });
</script>

<Sidebar.Provider>
  <AppSidebar />
  <Sidebar.Inset class="overflow-auto">
    {@render children()}
  </Sidebar.Inset>
</Sidebar.Provider>
