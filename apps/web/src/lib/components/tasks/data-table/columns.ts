import type { ColumnDef } from '@tanstack/table-core';
import type { TaskDto, AgentDto } from '$lib/ipc/client';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table/index.js';
import type {
  RenderComponentConfig,
  RenderSnippetConfig,
} from '$lib/components/ui/data-table/render-helpers.js';
import { createRawSnippet } from 'svelte';
import DataTableStatusCell from './data-table-status-cell.svelte';
import DataTableActionsCell from './data-table-actions-cell.svelte';

export interface TaskTableContext {
  readonly getAgentById: (id: string) => AgentDto | undefined;
  readonly onCancel: (taskId: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CellResult = RenderSnippetConfig<any> | RenderComponentConfig<any>;

export function createColumns(context: TaskTableContext): ColumnDef<TaskDto>[] {
  return [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }): CellResult => {
        const task = row.original;
        const titleSnippet = createRawSnippet<[{ title: string; description: string | null }]>(
          (getProps): { render: () => string } => {
            const { title, description } = getProps();
            const descriptionHtml =
              description !== null && description !== ''
                ? `<div class="truncate text-sm text-muted-foreground">${description}</div>`
                : '';
            return {
              render: (): string => `
                <div class="max-w-xs">
                  <div class="truncate font-medium">${title}</div>
                  ${descriptionHtml}
                </div>
              `,
            };
          }
        );
        return renderSnippet(titleSnippet, {
          title: task.title,
          description: task.description,
        });
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }): CellResult =>
        renderComponent(DataTableStatusCell, {
          status: row.original.status,
        }),
    },
    {
      accessorKey: 'agentId',
      header: 'Agent',
      cell: ({ row }): CellResult => {
        const agentId = row.original.agentId;
        const agent = agentId !== null && agentId !== '' ? context.getAgentById(agentId) : null;
        const agentSnippet = createRawSnippet<[string]>(
          (getName): { render: () => string } => {
            const name = getName();
            return {
              render: (): string => `<span class="text-sm">${name}</span>`,
            };
          }
        );
        return renderSnippet(agentSnippet, agent?.name ?? '-');
      },
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }): CellResult => {
        const prioritySnippet = createRawSnippet<[number]>(
          (getPriority): { render: () => string } => {
            const priority = getPriority();
            return {
              render: (): string =>
                `<span class="text-sm">${String(priority)}</span>`,
            };
          }
        );
        return renderSnippet(prioritySnippet, row.original.priority);
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }): CellResult => {
        const dateSnippet = createRawSnippet<[string]>(
          (getDate): { render: () => string } => {
            const date = getDate();
            const formatted = new Date(date).toLocaleDateString();
            return {
              render: (): string => `<span class="text-sm text-muted-foreground">${formatted}</span>`,
            };
          }
        );
        return renderSnippet(dateSnippet, row.original.createdAt);
      },
    },
    {
      id: 'actions',
      header: (): CellResult => {
        const headerSnippet = createRawSnippet(
          (): { render: () => string } => ({
            render: (): string => `<span class="sr-only">Actions</span>`,
          })
        );
        return renderSnippet(headerSnippet, undefined);
      },
      cell: ({ row }): CellResult =>
        renderComponent(DataTableActionsCell, {
          task: row.original,
          onCancel: context.onCancel,
        }),
    },
  ];
}
