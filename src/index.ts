#!/usr/bin/env node

import { program } from 'commander';
import dotenv from 'dotenv';
import { listCommand } from './commands/list';
import { exportCommand } from './commands/export';
import { cloneCommand } from './commands/clone';

// Load environment variables
dotenv.config();

// Setup CLI program
program
  .name('looker-cli')
  .description('CLI tool for managing Looker Studio reports')
  .version('1.0.0');

// Register commands
program
  .command('list')
  .description('List all accessible Looker Studio reports')
  .action(listCommand);

program
  .command('export')
  .description('Export a Looker Studio report')
  .requiredOption('--id <fileId>', 'File ID of the report to export')
  .option('--format <format>', 'Export format (json|pdf)', 'pdf')
  .option('--output <path>', 'Output file path')
  .action(exportCommand);

program
  .command('clone')
  .description('Clone a Looker Studio report')
  .requiredOption('--id <fileId>', 'File ID of the report to clone')
  .requiredOption('--name <name>', 'Name for the cloned report')
  .action(cloneCommand);

// Parse command line arguments
program.parse(process.argv);

// Show help if no command is provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
