#!/usr/bin/env node
import path from 'node:path';
import process from 'node:process';

import { createPlan } from './plan-builder.js';
import { renderPlanJson } from './json.js';
import { renderPlanMarkdown } from './markdown.js';

interface CliOptions {
  rootDir: string;
  format: 'markdown' | 'json';
  includeCoreLane: boolean;
  agentsPath?: string;
}

export async function run(argv = process.argv.slice(2)): Promise<number> {
  const [command, ...rest] = argv;

  if (!command || command === '--help' || command === '-h') {
    process.stdout.write(renderHelp());
    return 0;
  }

  if (command === '--version' || command === '-v') {
    process.stdout.write('0.1.0\n');
    return 0;
  }

  if (command !== 'plan') {
    process.stderr.write(`Unknown command: ${command}\n\n${renderHelp()}`);
    return 1;
  }

  try {
    const options = parsePlanArgs(rest);
    const plan = await createPlan({
      rootDir: options.rootDir,
      ...(options.agentsPath ? { agentsPath: options.agentsPath } : {}),
      includeCoreLane: options.includeCoreLane
    });

    const output = options.format === 'json' ? renderPlanJson(plan) : renderPlanMarkdown(plan);
    process.stdout.write(output);
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`agentlane: ${message}\n`);
    return 1;
  }
}

function parsePlanArgs(args: string[]): CliOptions {
  let rootDir = '.';
  let format: CliOptions['format'] = 'markdown';
  let includeCoreLane = true;
  let agentsPath: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];

    if (!token) {
      continue;
    }

    if (token === '--json') {
      format = 'json';
      continue;
    }

    if (token === '--format') {
      const next = args[index + 1];
      if (next !== 'markdown' && next !== 'json') {
        throw new Error('Expected --format markdown|json');
      }
      format = next;
      index += 1;
      continue;
    }

    if (token === '--no-core') {
      includeCoreLane = false;
      continue;
    }

    if (token === '--agents') {
      const next = args[index + 1];
      if (!next) {
        throw new Error('Expected a path after --agents');
      }
      agentsPath = next;
      index += 1;
      continue;
    }

    if (token === '--help' || token === '-h') {
      throw new Error(renderPlanHelp());
    }

    if (token.startsWith('-')) {
      throw new Error(`Unknown flag: ${token}`);
    }

    rootDir = token;
  }

  return {
    rootDir: path.resolve(rootDir),
    format,
    includeCoreLane,
    ...(agentsPath ? { agentsPath } : {})
  };
}

function renderHelp(): string {
  return `${renderBanner()}\n\n${renderPlanHelp()}`;
}

function renderBanner(): string {
  return 'agentlane — local-first lane planning for AI coding agents';
}

function renderPlanHelp(): string {
  return [
    'Usage:',
    '  agentlane plan [path] [--json] [--format markdown|json] [--agents ./AGENTS.md] [--no-core]',
    '',
    'Examples:',
    '  agentlane plan .',
    '  agentlane plan fixtures/repos/cli-app --json',
    '  agentlane plan ../some-repo --format markdown',
    '',
    'Notes:',
    '  - Reads repository files from disk only.',
    '  - Never shells out or calls the network.',
    '  - Emits deterministic Markdown or JSON lane plans.'
  ].join('\n') + '\n';
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const exitCode = await run();
  process.exit(exitCode);
}
