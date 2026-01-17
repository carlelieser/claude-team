import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/main/index.ts'],
    outDir: 'dist/main',
    format: ['esm'],
    platform: 'node',
    target: 'node20',
    sourcemap: true,
    clean: true,
    external: ['electron', 'better-sqlite3'],
  },
  {
    entry: ['src/main/windows/preload.ts'],
    outDir: 'dist/preload',
    format: ['cjs'],
    platform: 'node',
    target: 'node20',
    sourcemap: true,
    external: ['electron'],
  },
]);
