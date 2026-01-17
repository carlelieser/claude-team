<script lang="ts">
  import { QuickTaskInput } from '$lib/components/popup';
  import { projectStore } from '$lib/stores/projects.svelte';
  import { onMount } from 'svelte';

  onMount(async () => {
    await projectStore.loadCurrent();
  });
</script>

<div class="flex h-screen items-center justify-center bg-transparent">
  <div class="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">
    <QuickTaskInput />
  </div>
</div>
