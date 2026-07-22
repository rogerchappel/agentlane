import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
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
