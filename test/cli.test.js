import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { fixtureRepo } from './helpers.js';

const cliPath = fileURLToPath(new URL('../dist/cli.js', import.meta.url));

test('prints help for the plan command', () => {
  const result = spawnSync(process.execPath, [cliPath, '--help'], { encoding: 'utf8' });

  assert.equal(result.status, 0);
  assert.match(result.stdout, /agentlane — local-first lane planning/);
  assert.match(result.stdout, /agentlane plan \[path\]/);
});

test('emits json for a fixture repo', () => {
  const result = spawnSync(process.execPath, [cliPath, 'plan', fixtureRepo('docs-site'), '--json'], { encoding: 'utf8' });

  assert.equal(result.status, 0);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.summary.repoName, 'docs-site');
  assert.deepEqual(
    parsed.lanes.map((lane) => lane.kind),
    ['ci', 'docs']
  );
});

test('emits byte-identical output for unchanged input', () => {
  for (const formatArgs of [[], ['--json']]) {
    const args = [cliPath, 'plan', fixtureRepo('cli-app'), ...formatArgs];
    const first = spawnSync(process.execPath, args, { encoding: 'utf8' });
    const second = spawnSync(process.execPath, args, { encoding: 'utf8' });

    assert.equal(first.status, 0);
    assert.equal(second.status, 0);
    assert.equal(second.stdout, first.stdout);
  }
});

test('adds a generation timestamp only when requested', () => {
  const deterministic = spawnSync(process.execPath, [cliPath, 'plan', fixtureRepo('docs-site'), '--json'], { encoding: 'utf8' });
  const timestamped = spawnSync(process.execPath, [cliPath, 'plan', fixtureRepo('docs-site'), '--json', '--generated-at'], { encoding: 'utf8' });

  assert.equal(deterministic.status, 0);
  assert.equal(timestamped.status, 0);
  assert.equal(JSON.parse(deterministic.stdout).summary.generatedAt, undefined);
  assert.match(JSON.parse(timestamped.stdout).summary.generatedAt, /^\d{4}-\d{2}-\d{2}T/);
});

test('fails on unknown flags', () => {
  const result = spawnSync(process.execPath, [cliPath, 'plan', '--wat'], { encoding: 'utf8' });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Unknown flag: --wat/);
});

test('fails when more than one repository path is provided', () => {
  const result = spawnSync(
    process.execPath,
    [cliPath, 'plan', fixtureRepo('cli-app'), fixtureRepo('docs-site'), '--json'],
    { encoding: 'utf8' }
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /agentlane: Expected at most one repository path/);
});

test('fails when --agents is followed by an option', () => {
  const result = spawnSync(process.execPath, [cliPath, 'plan', fixtureRepo('cli-app'), '--agents', '--json'], { encoding: 'utf8' });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /agentlane: Expected a path after --agents/);
});

test('fails when an explicit AGENTS path is missing', () => {
  const rootDir = fixtureRepo('cli-app');
  const missingPath = path.join(rootDir, 'DOES-NOT-EXIST.md');
  const result = spawnSync(process.execPath, [cliPath, 'plan', rootDir, '--agents', missingPath, '--json'], {
    encoding: 'utf8'
  });

  assert.equal(result.status, 1);
  assert.equal(result.stdout, '');
  assert.equal(result.stderr, `agentlane: Explicit --agents path is not a readable file: ${missingPath}\n`);
});

test('fails when an explicit AGENTS path is not a regular file', () => {
  const rootDir = fixtureRepo('cli-app');
  const result = spawnSync(process.execPath, [cliPath, 'plan', rootDir, '--agents', rootDir, '--json'], {
    encoding: 'utf8'
  });

  assert.equal(result.status, 1);
  assert.equal(result.stderr, `agentlane: Explicit --agents path is not a readable file: ${rootDir}\n`);
});

test('fails when an explicit AGENTS path is unreadable', () => {
  const rootDir = mkdtempSync(path.join(os.tmpdir(), 'agentlane-unreadable-'));
  const agentsPath = path.join(rootDir, 'PRIVATE.md');
  writeFileSync(agentsPath, 'Do not edit secrets.\n');
  chmodSync(agentsPath, 0o000);

  try {
    const result = spawnSync(process.execPath, [cliPath, 'plan', rootDir, '--agents', agentsPath, '--json'], {
      encoding: 'utf8'
    });

    assert.equal(result.status, 1);
    assert.equal(result.stderr, `agentlane: Explicit --agents path is not a readable file: ${agentsPath}\n`);
  } finally {
    chmodSync(agentsPath, 0o600);
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test('accepts an explicit AGENTS path relative to the repository root', () => {
  const rootDir = fixtureRepo('cli-app');
  const result = spawnSync(process.execPath, [cliPath, 'plan', rootDir, '--agents', 'AGENTS.md', '--json'], {
    encoding: 'utf8'
  });

  assert.equal(result.status, 0);
  assert.equal(JSON.parse(result.stdout).summary.repoName, 'fixture-cli-app');
});

test('accepts an absolute explicit AGENTS path', () => {
  const rootDir = fixtureRepo('cli-app');
  const result = spawnSync(process.execPath, [cliPath, 'plan', rootDir, '--agents', path.join(rootDir, 'AGENTS.md'), '--json'], {
    encoding: 'utf8'
  });

  assert.equal(result.status, 0);
  assert.equal(JSON.parse(result.stdout).summary.repoName, 'fixture-cli-app');
});
