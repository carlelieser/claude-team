<script lang="ts">
  import { page } from '$app/state';
  import { agentStore } from '$lib/stores/agents.svelte';
  import { projectStore } from '$lib/stores/projects.svelte';
  import { approvalStore } from '$lib/stores/approvals.svelte';
  import { cn } from '$lib/utils';
  import * as Sidebar from '$lib/components/ui/sidebar';
  import HomeIcon from 'lucide-svelte/icons/home';
  import ClipboardListIcon from 'lucide-svelte/icons/clipboard-list';
  import UsersIcon from 'lucide-svelte/icons/users';
  import BadgeCheckIcon from 'lucide-svelte/icons/badge-check';
  import ActivityIcon from 'lucide-svelte/icons/activity';
  import SettingsIcon from 'lucide-svelte/icons/settings';
  import FolderIcon from 'lucide-svelte/icons/folder';

  const navItems = [
    { title: 'Overview', href: '/', icon: HomeIcon },
    { title: 'Tasks', href: '/tasks', icon: ClipboardListIcon },
    { title: 'Agents', href: '/agents', icon: UsersIcon },
    { title: 'Approvals', href: '/approvals', icon: BadgeCheckIcon },
    { title: 'Events', href: '/events', icon: ActivityIcon },
    { title: 'Settings', href: '/settings', icon: SettingsIcon },
  ];

  function isActive(href: string): boolean {
    if (href === '/') {
      return page.url.pathname === '/';
    }
    return page.url.pathname.startsWith(href);
  }
</script>

<Sidebar.Root collapsible="icon">
  <Sidebar.Header>
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <Sidebar.MenuButton size="lg" class="data-[state=open]:bg-sidebar-accent">
          <div
            class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
          >
            <span class="text-sm font-bold">CT</span>
          </div>
          <div class="grid flex-1 text-left text-sm leading-tight">
            <span class="truncate font-semibold">Claude Team</span>
            <span class="truncate text-xs text-muted-foreground">Dashboard</span>
          </div>
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  </Sidebar.Header>

  <Sidebar.Content>
    <Sidebar.Group>
      <Sidebar.GroupLabel>Navigation</Sidebar.GroupLabel>
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          {#each navItems as item}
            <Sidebar.MenuItem>
              <Sidebar.MenuButton isActive={isActive(item.href)} tooltipContent={item.title}>
                {#snippet child({ props })}
                  <a href={item.href} {...props}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                {/snippet}
              </Sidebar.MenuButton>
              {#if item.href === '/approvals' && approvalStore.count > 0}
                <Sidebar.MenuBadge>{approvalStore.count}</Sidebar.MenuBadge>
              {/if}
            </Sidebar.MenuItem>
          {/each}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>

    <Sidebar.Group>
      <Sidebar.GroupLabel>Agents</Sidebar.GroupLabel>
      <Sidebar.GroupContent>
        <div class="px-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          {agentStore.activeAgents.length} active
        </div>
        <Sidebar.Menu>
          {#each agentStore.agents.slice(0, 3) as agent}
            <Sidebar.MenuItem>
              <Sidebar.MenuButton size="sm" tooltipContent={agent.name}>
                <span
                  class={cn(
                    'h-2 w-2 rounded-full shrink-0',
                    agent.status === 'executing'
                      ? 'bg-success'
                      : agent.status === 'paused'
                        ? 'bg-warning'
                        : 'bg-muted-foreground/30'
                  )}
                ></span>
                <span class="truncate">{agent.name}</span>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          {/each}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  </Sidebar.Content>

  <Sidebar.Footer>
    {#if projectStore.currentProject}
      <Sidebar.Menu>
        <Sidebar.MenuItem>
          <Sidebar.MenuButton tooltipContent={projectStore.currentProject.name}>
            <FolderIcon class="size-4" />
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate text-xs text-muted-foreground">Current Project</span>
              <span class="truncate font-medium">{projectStore.currentProject.name}</span>
            </div>
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>
      </Sidebar.Menu>
    {/if}
  </Sidebar.Footer>

  <Sidebar.Rail />
</Sidebar.Root>
