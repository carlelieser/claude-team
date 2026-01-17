/**
 * Output Utilities
 * Console output helpers with colors and formatting
 */

import chalk from 'chalk';
import ora, { type Ora } from 'ora';

const ICONS = {
  success: chalk.green('✓'),
  error: chalk.red('✗'),
  warning: chalk.yellow('⚠'),
  info: chalk.blue('ℹ'),
  arrow: chalk.gray('→'),
} as const;

export function success(message: string): void {
  console.log(`${ICONS.success} ${chalk.green(message)}`);
}

export function error(message: string, details?: string): void {
  console.log(`${ICONS.error} ${chalk.red(message)}`);
  if (details) {
    console.log(chalk.gray(details));
  }
}

export function warning(message: string): void {
  console.log(`${ICONS.warning} ${chalk.yellow(message)}`);
}

export function info(message: string): void {
  console.log(`${ICONS.info} ${chalk.blue(message)}`);
}

export function section(title: string): void {
  console.log();
  console.log(chalk.bold.underline(title));
  console.log();
}

export function header(title: string): void {
  console.log();
  console.log(chalk.bold.cyan(title));
  console.log();
}

export function list(items: string[]): void {
  items.forEach((item) => {
    console.log(`  ${ICONS.arrow} ${item}`);
  });
}

export function table(
  rows: Array<{ label: string; value: string; highlight?: boolean }>
): void {
  const maxLabelLength = Math.max(...rows.map((r) => r.label.length));
  rows.forEach(({ label, value, highlight }) => {
    const paddedLabel = label.padEnd(maxLabelLength);
    const displayValue = highlight ? chalk.bold(value) : value;
    console.log(`  ${chalk.gray(paddedLabel)} ${displayValue}`);
  });
}

export function spinner(text: string): Ora {
  return ora({
    text,
    color: 'cyan',
  }).start();
}

export function divider(): void {
  console.log(chalk.gray('─'.repeat(50)));
}

export function emptyLine(): void {
  console.log();
}

export function fatal(message: string, details?: string): never {
  error(message, details);
  process.exit(1);
}

export function dim(text: string): string {
  return chalk.gray(text);
}

export function bold(text: string): string {
  return chalk.bold(text);
}

export function cyan(text: string): string {
  return chalk.cyan(text);
}

export function yellow(text: string): string {
  return chalk.yellow(text);
}

export function green(text: string): string {
  return chalk.green(text);
}

export function red(text: string): string {
  return chalk.red(text);
}
