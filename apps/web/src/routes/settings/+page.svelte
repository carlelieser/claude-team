<script lang="ts">
  import { Header } from '$lib/components/layout';
  import { projectStore } from '$lib/stores/projects.svelte';
  import { ipc } from '$lib/ipc/client';
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '$lib/components/ui/empty';
  import FolderIcon from 'lucide-svelte/icons/folder';
  import FolderOpenIcon from 'lucide-svelte/icons/folder-open';

  async function handleQuit() {
    await ipc.system.quit();
  }
</script>

<Header title="Settings" subtitle="Configure Claude Team" />

<div class="flex-1 overflow-auto p-6">
  <div class="mx-auto max-w-2xl space-y-6">
    <Card.Root class="px-6">
      <h2 class="font-semibold">Current Project</h2>

      {#if projectStore.currentProject}
        <div class="rounded-lg bg-muted p-4">
          <div class="font-medium">
            {projectStore.currentProject.name}
          </div>
          <div class="mt-1 text-sm text-muted-foreground">
            {projectStore.currentProject.path}
          </div>
          {#if projectStore.currentProject.description}
            <div class="mt-2 text-sm text-muted-foreground">
              {projectStore.currentProject.description}
            </div>
          {/if}
        </div>
      {:else}
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderOpenIcon />
            </EmptyMedia>
            <EmptyTitle>No project selected</EmptyTitle>
            <EmptyDescription>
              Select a project below to get started
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      {/if}
    </Card.Root>

    <Card.Root class="px-6">
      <h2 class="font-semibold">Projects</h2>

      {#if projectStore.projects.length === 0}
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderIcon />
            </EmptyMedia>
            <EmptyTitle>No projects found</EmptyTitle>
            <EmptyDescription>
              Create a project to start working with Claude Team
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      {:else}
        <div class="space-y-2">
          {#each projectStore.projects as project (project.id)}
            <button
              class="flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors hover:bg-muted {project.id === projectStore.currentProject?.id
                ? 'border-primary bg-primary/10'
                : ''}"
              onclick={() => projectStore.switchProject(project.id)}
            >
              <div>
                <div class="font-medium">{project.name}</div>
                <div class="text-xs text-muted-foreground">{project.path}</div>
              </div>
              {#if project.id === projectStore.currentProject?.id}
                <Badge class="bg-success-muted text-success-muted-foreground border-transparent">Current</Badge>
              {/if}
            </button>
          {/each}
        </div>
      {/if}
    </Card.Root>

    <Card.Root class="px-6">
      <h2 class="mb-4 font-semibold">Application</h2>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <div class="font-medium">Keyboard Shortcuts</div>
            <div class="text-sm text-muted-foreground">
              Quick access to common actions
            </div>
          </div>
        </div>

        <div class="rounded-lg bg-muted p-4 text-sm">
          <div class="grid gap-3">
            <div class="flex items-center justify-between">
              <span>New Task</span>
              <kbd class="rounded bg-card px-2 py-1 text-xs shadow">Cmd+Shift+N</kbd>
            </div>
            <div class="flex items-center justify-between">
              <span>Show Dashboard</span>
              <kbd class="rounded bg-card px-2 py-1 text-xs shadow">Cmd+Shift+D</kbd>
            </div>
          </div>
        </div>

        <div class="border-t pt-4">
          <Button variant="destructive" onclick={handleQuit}>
            Quit Claude Team
          </Button>
        </div>
      </div>
    </Card.Root>
  </div>
</div>
