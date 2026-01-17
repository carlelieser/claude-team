/**
 * CLI Setup
 * Commander.js configuration and command registration
 */

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { initCommand, statusCommand, doctorCommand } from './commands/index.js';
import type { InitOptions } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getPackageVersion(): string {
  try {
    const packagePath = join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(
      readFileSync(packagePath, 'utf-8')
    ) as { version: string };
    return packageJson.version;
  } catch {
    return '0.0.0';
  }
}

export function createCli(): Command {
  const program = new Command();

  program
    .name('claude-team')
    .description('AI-powered development team orchestration for solo developers')
    .version(getPackageVersion())
    .exitOverride()
    .configureOutput({
      outputError: (str, write) => write(str),
    });

  program
    .command('init')
    .description('Initialize a new claude-team project')
    .option('-n, --name <name>', 'Project name')
    .option(
      '-a, --autonomy <mode>',
      'Autonomy mode (supervised|autonomous|manual)',
      'supervised'
    )
    .action(async (options: InitOptions) => {
      await initCommand(options);
    });

  program
    .command('status')
    .description('Show project status and information')
    .action(() => {
      statusCommand();
    });

  program
    .command('doctor')
    .description('Check system health and installation')
    .action(async () => {
      await doctorCommand();
    });

  return program;
}

export async function run(argv: string[]): Promise<void> {
  const program = createCli();
  try {
    await program.parseAsync(argv);
    // Show help if no command was provided
    if (argv.length <= 2) {
      program.help();
    }
  } catch (err) {
    // Commander throws for help/version - these should exit cleanly
    if (err instanceof Error && 'code' in err) {
      const code = (err as Error & { code: string }).code;
      if (
        code === 'commander.helpDisplayed' ||
        code === 'commander.version' ||
        code === 'commander.help'
      ) {
        return;
      }
    }
    throw err;
  }
}
