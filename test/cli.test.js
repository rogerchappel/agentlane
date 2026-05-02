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

test('fails on unknown flags', () => {
  const result = spawnSync(process.execPath, [cliPath, 'plan', '--wat'], { encoding: 'utf8' });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Unknown flag: --wat/);
});
