<script lang="ts">
  import { Header } from '$lib/components/layout';
  import { agentStore } from '$lib/stores/agents.svelte';
  import { taskStore } from '$lib/stores/tasks.svelte';
  import { eventStore } from '$lib/stores/events.svelte';
  import { AgentStatusCard } from '$lib/components/agents';
  import { TaskCard } from '$lib/components/tasks';
  import { EventCard } from '$lib/components/events';
  import * as Card from '$lib/components/ui/card';
  import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '$lib/components/ui/empty';
  import UsersIcon from 'lucide-svelte/icons/users';
  import ClockIcon from 'lucide-svelte/icons/clock';
  import PlayIcon from 'lucide-svelte/icons/play';
  import CheckCircleIcon from 'lucide-svelte/icons/check-circle';
  import ListTodoIcon from 'lucide-svelte/icons/list-todo';
  import ActivityIcon from 'lucide-svelte/icons/activity';
</script>

<Header title="Overview" subtitle="Agent activity and task status" />

<div class="flex flex-1 flex-col gap-6 overflow-auto p-6">
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <Card.Root>
      <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
        <Card.Title class="text-sm font-medium">Active Agents</Card.Title>
        <UsersIcon class="text-muted-foreground" />
      </Card.Header>
      <Card.Content>
        <div class="text-2xl font-bold">{agentStore.activeAgents.length}</div>
        <p class="text-xs text-muted-foreground">of {agentStore.agents.length} total</p>
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
        <Card.Title class="text-sm font-medium">Pending Tasks</Card.Title>
        <ClockIcon class="text-muted-foreground" />
      </Card.Header>
      <Card.Content>
        <div class="text-2xl font-bold">{taskStore.pendingTasks.length}</div>
        <p class="text-xs text-muted-foreground">in queue</p>
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
        <Card.Title class="text-sm font-medium">In Progress</Card.Title>
        <PlayIcon class="text-info" />
      </Card.Header>
      <Card.Content>
        <div class="text-2xl font-bold text-info">{taskStore.inProgressTasks.length}</div>
        <p class="text-xs text-muted-foreground">tasks running</p>
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
        <Card.Title class="text-sm font-medium">Completed Today</Card.Title>
        <CheckCircleIcon class="text-success" />
      </Card.Header>
      <Card.Content>
        <div class="text-2xl font-bold text-success">
          {taskStore.completedTasks.filter(
            (t) => new Date(t.completedAt ?? '').toDateString() === new Date().toDateString()
          ).length}
        </div>
        <p class="text-xs text-muted-foreground">tasks finished</p>
      </Card.Content>
    </Card.Root>
  </div>

  <div class="grid gap-6 lg:grid-cols-2">
    <Card.Root>
      <Card.Header>
        <Card.Title>Active Agents</Card.Title>
        <Card.Description>Currently running agents and their status</Card.Description>
      </Card.Header>
      <Card.Content>
        {#if agentStore.activeAgents.length === 0}
          <Empty class="py-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UsersIcon />
              </EmptyMedia>
              <EmptyTitle>No agents currently active</EmptyTitle>
              <EmptyDescription>Agents will appear here when running</EmptyDescription>
            </EmptyHeader>
          </Empty>
        {:else}
          <div class="space-y-3">
            {#each agentStore.activeAgents as agent (agent.id)}
              <AgentStatusCard {agent} />
            {/each}
          </div>
        {/if}
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Header>
        <Card.Title>Recent Tasks</Card.Title>
        <Card.Description>Latest tasks and their progress</Card.Description>
      </Card.Header>
      <Card.Content>
        {#if taskStore.tasks.length === 0}
          <Empty class="py-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ListTodoIcon />
              </EmptyMedia>
              <EmptyTitle>No tasks yet</EmptyTitle>
              <EmptyDescription>Tasks will appear here when created</EmptyDescription>
            </EmptyHeader>
          </Empty>
        {:else}
          <div class="space-y-3">
            {#each taskStore.tasks.slice(0, 5) as task (task.id)}
              <TaskCard {task} compact />
            {/each}
          </div>
        {/if}
      </Card.Content>
    </Card.Root>
  </div>

  <Card.Root>
    <Card.Header>
      <Card.Title>Recent Activity</Card.Title>
      <Card.Description>Latest events from the system</Card.Description>
    </Card.Header>
    <Card.Content>
      {#if eventStore.events.length === 0}
        <Empty class="py-6">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ActivityIcon />
            </EmptyMedia>
            <EmptyTitle>No recent activity</EmptyTitle>
            <EmptyDescription>Activity will appear here as agents work</EmptyDescription>
          </EmptyHeader>
        </Empty>
      {:else}
        <div class="space-y-2">
          {#each eventStore.events.slice(0, 10) as event (event.id)}
            <EventCard {event} />
          {/each}
        </div>
      {/if}
    </Card.Content>
  </Card.Root>
</div>
