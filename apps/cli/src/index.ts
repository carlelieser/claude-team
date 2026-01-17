#!/usr/bin/env node

/**
 * CLI Entry Point
 * Main entry for the claude-team CLI
 */

import { run } from './cli.js';

run(process.argv).catch((err: unknown) => {
  console.error('Error:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
