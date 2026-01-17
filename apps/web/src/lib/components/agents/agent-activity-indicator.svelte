<script lang="ts">
  interface Props {
    status: 'idle' | 'executing' | 'paused';
    size?: 'sm' | 'md' | 'lg';
  }

  let { status, size = 'md' }: Props = $props();

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  const colors = {
    idle: 'text-muted-foreground',
    executing: 'text-success',
    paused: 'text-warning',
  };
</script>

<div class="relative {sizeClasses[size]}">
  {#if status === 'executing'}
    <div class="absolute inset-0 animate-ping rounded-full bg-success opacity-25"></div>
  {/if}

  <div
    class="relative flex h-full w-full items-center justify-center rounded-full bg-muted {colors[status]}"
  >
    {#if status === 'idle'}
      <svg class="h-1/2 w-1/2" fill="currentColor" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="6" />
      </svg>
    {:else if status === 'executing'}
      <svg class="h-1/2 w-1/2 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    {:else if status === 'paused'}
      <svg class="h-1/2 w-1/2" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
          clip-rule="evenodd"
        />
      </svg>
    {/if}
  </div>
</div>
