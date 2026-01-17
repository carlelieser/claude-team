<script lang="ts" generics="TData, TValue">
  import type { ColumnDef } from '@tanstack/table-core';
  import { getCoreRowModel } from '@tanstack/table-core';
  import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table/index.js';
  import * as Table from '$lib/components/ui/table/index.js';
  import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '$lib/components/ui/empty';
  import SearchIcon from 'lucide-svelte/icons/search';

  interface Props<TData, TValue> {
    readonly columns: ColumnDef<TData, TValue>[];
    readonly data: TData[];
  }

  let { data, columns }: Props<TData, TValue> = $props();

  const table = createSvelteTable({
    get data() {
      return data;
    },
    get columns() {
      return columns;
    },
    getCoreRowModel: getCoreRowModel(),
  });
</script>

<div class="overflow-hidden rounded-lg border bg-card">
  <Table.Root>
    <Table.Header class="bg-muted">
      {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
        <Table.Row>
          {#each headerGroup.headers as header (header.id)}
            <Table.Head
              colspan={header.colSpan}
              class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              {#if !header.isPlaceholder}
                <FlexRender
                  content={header.column.columnDef.header}
                  context={header.getContext()}
                />
              {/if}
            </Table.Head>
          {/each}
        </Table.Row>
      {/each}
    </Table.Header>
    <Table.Body>
      {#each table.getRowModel().rows as row (row.id)}
        <Table.Row class="hover:bg-muted">
          {#each row.getVisibleCells() as cell (cell.id)}
            <Table.Cell class="px-4 py-3">
              <FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
            </Table.Cell>
          {/each}
        </Table.Row>
      {:else}
        <Table.Row>
          <Table.Cell colspan={columns.length} class="h-32">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SearchIcon />
                </EmptyMedia>
                <EmptyTitle>No tasks found</EmptyTitle>
                <EmptyDescription>Try adjusting your search or filters</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </Table.Cell>
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
</div>
