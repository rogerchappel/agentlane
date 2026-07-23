import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

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

test('uses the detected package manager for lane checks', async (t) => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'agentlane-package-managers-'));
  t.after(() => rm(rootDir, { recursive: true, force: true }));

  const cases = [
    ['npm', 'package-lock.json', ['npm install --package-lock-only', 'npm run build', 'npm test']],
    ['pnpm', 'pnpm-lock.yaml', ['pnpm install --lockfile-only', 'pnpm run build', 'pnpm run test']],
    ['yarn', 'yarn.lock', ['yarn install', 'yarn run build', 'yarn run test']],
    ['bun', 'bun.lock', ['bun install --lockfile-only', 'bun run build', 'bun run test']]
  ];

  for (const [packageManager, lockfile, expectedChecks] of cases) {
    const fixtureDir = path.join(rootDir, packageManager);
    await mkdir(fixtureDir);
    await writeFile(path.join(fixtureDir, 'package.json'), JSON.stringify({
      name: `${packageManager}-fixture`,
      scripts: { build: 'tsc', test: 'node --test' }
    }));
    await writeFile(path.join(fixtureDir, lockfile), '');

    const plan = await createPlan({ rootDir: fixtureDir, now: NOW });

    assert.equal(plan.summary.packageManager, packageManager);
    const dependencyLane = plan.lanes.find((lane) => lane.kind === 'dependencies');
    assert.ok(dependencyLane, `${packageManager} should produce a dependency lane`);
    assert.deepEqual(dependencyLane.checks, expectedChecks);
    assert.ok(dependencyLane.allowedPaths.includes(lockfile));
    assert.equal(dependencyLane.checks.some((check) => /^(npm|pnpm|yarn|bun) /.test(check) && !check.startsWith(packageManager)), false);
  }
});

test('only emits automated checks supported by repository facts', async (t) => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'agentlane-supported-checks-'));
  t.after(() => rm(rootDir, { recursive: true, force: true }));

  const fixtures = [
    {
      name: 'docs-only',
      files: { 'README.md': '# Docs', '.github/workflows/docs.yml': 'name: docs' },
      expected: ['manual markdown review', 'manual workflow syntax review']
    },
    {
      name: 'manifest-free-lockfile',
      files: { 'package-lock.json': '{}' },
      expected: ['manual markdown review', 'manual test review']
    },
    {
      name: 'partial-script',
      files: {
        'package.json': JSON.stringify({ scripts: { test: 'node --test' } }),
        'package-lock.json': '{}',
        'src/index.js': ''
      },
      expected: ['npm test', 'manual source review']
    },
    {
      name: 'bun',
      files: {
        'package.json': JSON.stringify({ scripts: { build: 'bun build src/index.ts' } }),
        'bun.lock': '',
        'src/index.ts': ''
      },
      expected: ['bun run build']
    }
  ];

  for (const fixture of fixtures) {
    const fixtureDir = path.join(rootDir, fixture.name);
    await mkdir(fixtureDir, { recursive: true });
    for (const [relativePath, contents] of Object.entries(fixture.files)) {
      const filePath = path.join(fixtureDir, relativePath);
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, contents);
    }

    const plan = await createPlan({ rootDir: fixtureDir, includeCoreLane: true });
    const checks = plan.lanes.flatMap((lane) => lane.checks);

    for (const expected of fixture.expected) {
      assert.ok(checks.includes(expected), `${fixture.name} should include ${expected}`);
    }
    assert.equal(checks.includes('bash scripts/validate.sh'), false);
    assert.equal(
      checks.some((check) => /^(npm|pnpm|yarn|bun) (run )?(test|build|check|smoke)$/.test(check)
        && !Object.keys(JSON.parse(fixture.files['package.json'] ?? '{"scripts":{}}').scripts ?? {})
          .some((script) => check.endsWith(script))),
      false,
      `${fixture.name} should not invent package scripts`
    );

    if (fixture.name === 'bun') {
      assert.equal(plan.summary.packageManager, 'bun');
      assert.ok(plan.lanes.every((lane) => lane.stopBeforeTouchingPaths.includes('bun.lock')));
      assert.ok(plan.lanes.find((lane) => lane.kind === 'dependencies')?.allowedPaths.includes('bun.lock'));
    }
  }
});
