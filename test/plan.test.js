import test from 'node:test';
import assert from 'node:assert/strict';

import { buildLanes, createPlan, renderPlanJson, renderPlanMarkdown } from '../dist/index.js';
import { fixtureRepo, readExpected } from './helpers.js';

const NOW = new Date('2026-05-02T08:00:00.000Z');

test('plans a CLI-oriented repo deterministically', async () => {
  const plan = await createPlan({ rootDir: fixtureRepo('cli-app'), now: NOW });
  const markdown = renderPlanMarkdown(plan);
  const json = renderPlanJson(plan);

  assert.equal(markdown, await readExpected('cli-app.md'));
  assert.equal(json, await readExpected('cli-app.json'));
});

test('plans a docs-oriented repo conservatively', async () => {
  const plan = await createPlan({ rootDir: fixtureRepo('docs-site'), now: NOW, includeCoreLane: false });
  const markdown = renderPlanMarkdown(plan);

  assert.equal(markdown, await readExpected('docs-site.md'));
});

test('falls back to docs and tests lanes when signals are sparse', async () => {
  const plan = await createPlan({ rootDir: fixtureRepo('template-kit'), now: NOW, includeCoreLane: false });

  assert.deepEqual(
    plan.lanes.map((lane) => lane.kind),
    ['docs', 'release']
  );
  assert.equal(renderPlanJson(plan), await readExpected('template-kit.json'));
});

test('suggests a dependency lane for node repos with lockfiles', () => {
  const lanes = buildLanes({
    rootDir: '/tmp/repo',
    repoName: 'repo',
    packageName: 'repo',
    packageManager: 'npm',
    files: ['package.json', 'package-lock.json', 'src/index.ts'],
    directories: ['src'],
    hasAgentsFile: false,
    scripts: { test: 'node --test' },
    hasNodeProject: true,
    protectedPathHints: []
  }, true);

  const dependencyLane = lanes.find((lane) => lane.kind === 'dependencies');
  assert.ok(dependencyLane);
  assert.deepEqual(dependencyLane.allowedPaths, ['package.json', 'package-lock.json']);
  assert.ok(dependencyLane.stopBeforeTouchingPaths.includes('src/**'));
});
