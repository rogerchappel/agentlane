import path from 'node:path';

import { detectRepoFacts } from './detect.js';
import { uniqueSorted } from './fs.js';
import type { Lane, LaneKind, PlanOptions, PlanResult, RepoFacts } from './types.js';

const DEFAULT_STOP_PATHS = ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock', 'bun.lockb'];

export async function createPlan(options: PlanOptions): Promise<PlanResult> {
  const facts = await detectRepoFacts(options.rootDir, options.agentsPath);
  const lanes = buildLanes(facts, options.includeCoreLane ?? true);
  const signals = collectSignals(facts, lanes);

  return {
    summary: {
      repoName: facts.packageName ?? facts.repoName,
      packageManager: facts.packageManager,
      laneCount: lanes.length,
      generatedAt: (options.now ?? new Date()).toISOString(),
      inputRoot: path.resolve(options.rootDir),
      signals
    },
    lanes
  };
}

export function buildLanes(facts: RepoFacts, includeCoreLane: boolean): Lane[] {
  const lanes: Lane[] = [];

  if (includeCoreLane && shouldAddCoreLane(facts)) {
    lanes.push(buildLane(facts, 'core'));
  }

  for (const kind of suggestLaneKinds(facts)) {
    lanes.push(buildLane(facts, kind));
  }

  return lanes;
}

function shouldAddCoreLane(facts: RepoFacts): boolean {
  return facts.files.some((file) => file.startsWith('src/')) || facts.hasNodeProject;
}

function suggestLaneKinds(facts: RepoFacts): LaneKind[] {
  const suggestions = new Set<LaneKind>();

  if (facts.files.some((file) => file.startsWith('docs/') || file === 'README.md')) {
    suggestions.add('docs');
  }
  if (facts.files.some((file) => /(^|\/)(test|tests|__tests__|specs?)\//.test(file) || /\.(test|spec)\./.test(file))) {
    suggestions.add('tests');
  }
  if (facts.files.some((file) => file.startsWith('.github/') || file.startsWith('.gitlab/'))) {
    suggestions.add('ci');
  }
  if (facts.files.some((file) => file.startsWith('examples/') || file.startsWith('example/'))) {
    suggestions.add('examples');
  }
  if (facts.hasNodeProject && facts.files.some((file) => DEFAULT_STOP_PATHS.includes(file))) {
    suggestions.add('dependencies');
  }
  if (facts.files.some((file) => file.startsWith('src/cli') || file === 'bin/agentlane' || file === 'src/cli.ts')) {
    suggestions.add('cli');
  }
  if (facts.files.some((file) => file === 'CHANGELOG.md' || file === 'RELEASE.md' || file.startsWith('.changeset/'))) {
    suggestions.add('release');
  }

  if (!suggestions.size) {
    suggestions.add('docs');
    suggestions.add('tests');
  }

  return Array.from(suggestions).sort();
}

function buildLane(facts: RepoFacts, kind: LaneKind): Lane {
  const scopedPaths = lanePathsForKind(facts, kind);
  const verification = laneChecksForKind(facts, kind);
  const acceptanceCriteria = laneAcceptanceForKind(facts, kind);
  const repoSlug = slugify(facts.packageName ?? facts.repoName);

  return {
    id: kind,
    kind,
    title: laneTitle(kind),
    rationale: laneRationale(facts, kind, scopedPaths),
    branchName: `lane/${repoSlug}-${kind}`,
    allowedPaths: scopedPaths.allowed,
    stopBeforeTouchingPaths: scopedPaths.stop,
    checks: verification,
    acceptanceCriteria
  };
}

function lanePathsForKind(facts: RepoFacts, kind: LaneKind): { allowed: string[]; stop: string[] } {
  const docsPaths = ['README.md', 'docs/**', 'ROADMAP.md', 'CHANGELOG.md', 'CONTRIBUTING.md'];
  const testPaths = ['test/**', 'tests/**', '__tests__/**', 'fixtures/**', 'package.json'];
  const cliPaths = ['src/cli.ts', 'src/**/*.ts', 'bin/**', 'package.json'];
  const ciPaths = ['.github/**', 'scripts/**', 'package.json'];
  const examplePaths = ['examples/**', 'fixtures/**', 'README.md', 'docs/**'];
  const dependencyPaths = ['package.json', 'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock', 'bun.lockb'];
  const releasePaths = ['CHANGELOG.md', 'package.json', '.github/**', 'README.md'];
  const corePaths = ['src/**', 'package.json', 'tsconfig.json'];

  const stop = new Set<string>([...DEFAULT_STOP_PATHS, ...facts.protectedPathHints]);
  if (facts.hasAgentsFile) {
    stop.add('AGENTS.md');
  }

  if (facts.files.includes('LICENSE')) {
    stop.add('LICENSE');
  }

  switch (kind) {
    case 'docs':
      stop.add('src/**');
      return { allowed: filterExistingPaths(facts, docsPaths), stop: uniqueSorted(stop) };
    case 'tests':
      stop.add('src/**');
      return { allowed: filterExistingPaths(facts, testPaths, true), stop: uniqueSorted(stop) };
    case 'cli':
      stop.add('.github/**');
      return { allowed: filterExistingPaths(facts, cliPaths, true), stop: uniqueSorted(stop) };
    case 'ci':
      stop.add('src/**');
      return { allowed: filterExistingPaths(facts, ciPaths), stop: uniqueSorted(stop) };
    case 'examples':
      stop.add('src/**');
      return { allowed: filterExistingPaths(facts, examplePaths, true), stop: uniqueSorted(stop) };
    case 'dependencies':
      stop.add('src/**');
      stop.add('.github/**');
      return { allowed: filterExistingPaths(facts, dependencyPaths), stop: uniqueSorted(stop) };
    case 'release':
      stop.add('src/**');
      return { allowed: filterExistingPaths(facts, releasePaths), stop: uniqueSorted(stop) };
    case 'core':
      stop.add('.github/**');
      return { allowed: filterExistingPaths(facts, corePaths, true), stop: uniqueSorted(stop) };
  }
}

function filterExistingPaths(facts: RepoFacts, candidates: string[], keepWhenMissing = false): string[] {
  const result = candidates.filter((candidate) => {
    if (candidate.endsWith('/**')) {
      const prefix = candidate.slice(0, -3);
      return keepWhenMissing || facts.files.some((file) => file.startsWith(prefix)) || facts.directories.includes(prefix.slice(0, -1));
    }

    if (candidate.includes('**')) {
      const prefix = candidate.split('**')[0] ?? '';
      return keepWhenMissing || facts.files.some((file) => file.startsWith(prefix));
    }

    return keepWhenMissing || facts.files.includes(candidate);
  });

  return result.length > 0 ? result : ['.'];
}

function laneChecksForKind(facts: RepoFacts, kind: LaneKind): string[] {
  const run = (script: string): string => packageScriptCommand(facts.packageManager, script);
  const shared = [run('test'), run('build')];
  const checkScript = facts.scripts.check ? [run('check')] : [run('build')];

  switch (kind) {
    case 'docs':
      return ['bash scripts/validate.sh', 'manual markdown review'];
    case 'tests':
      return uniqueSorted([run('test'), ...checkScript]);
    case 'cli':
      return uniqueSorted([run('build'), run('smoke'), 'node dist/cli.js plan --help']);
    case 'ci':
      return ['bash scripts/validate.sh'];
    case 'examples':
      return [run('smoke'), 'manual example walkthrough'];
    case 'dependencies':
      return uniqueSorted([lockfileUpdateCommand(facts.packageManager), run('test'), run('build')]);
    case 'release':
      return uniqueSorted([run('test'), run('build'), 'bash scripts/validate.sh']);
    case 'core':
      return uniqueSorted([...shared, ...checkScript]);
  }
}

function packageScriptCommand(packageManager: RepoFacts['packageManager'], script: string): string {
  if (packageManager === 'npm' || packageManager === 'unknown') {
    return script === 'test' ? 'npm test' : `npm run ${script}`;
  }

  return `${packageManager} run ${script}`;
}

function lockfileUpdateCommand(packageManager: RepoFacts['packageManager']): string {
  switch (packageManager) {
    case 'pnpm':
      return 'pnpm install --lockfile-only';
    case 'yarn':
      return 'yarn install';
    case 'bun':
      return 'bun install --lockfile-only';
    case 'npm':
    case 'unknown':
      return 'npm install --package-lock-only';
  }
}

function laneAcceptanceForKind(facts: RepoFacts, kind: LaneKind): string[] {
  const localFirstLine = 'Changes stay local-first: no telemetry, no hidden network activity, no surprise shell execution.';
  const agentsLine = facts.hasAgentsFile
    ? 'The lane respects AGENTS.md guidance and pauses before touching protected areas.'
    : 'If an AGENTS.md file appears later, re-run planning before changing protected areas.';

  switch (kind) {
    case 'docs':
      return [
        'Docs clearly describe the relevant workflow and match current CLI behavior.',
        'Examples and command snippets are copy-pasteable.',
        localFirstLine,
        agentsLine
      ];
    case 'tests':
      return [
        'Coverage demonstrates the target workflow or edge case.',
        'Fixtures and assertions are deterministic.',
        'Tests fail for the right reason before the fix and pass afterward.',
        agentsLine
      ];
    case 'cli':
      return [
        'CLI help and output stay deterministic for the same repo input.',
        'Machine-readable output remains stable and documented.',
        localFirstLine,
        agentsLine
      ];
    case 'ci':
      return [
        'Automation is explicit, reviewable, and safe to run in forks.',
        'Checks cover the intended contributor workflow without hidden side effects.',
        localFirstLine,
        agentsLine
      ];
    case 'examples':
      return [
        'Examples reflect real supported workflows.',
        'Fixtures stay small, deterministic, and easy to inspect.',
        localFirstLine,
        agentsLine
      ];
    case 'dependencies':
      return [
        'Dependency changes are limited to package metadata and lockfiles.',
        'Lockfile updates are reproducible from the documented package manager.',
        'No install script or postinstall side effect is introduced without review.',
        agentsLine
      ];
    case 'release':
      return [
        'Release metadata matches the actual shipped behavior.',
        'Changelog and package metadata are consistent.',
        'Any publish step remains explicit and human-approved.',
        agentsLine
      ];
    case 'core':
      return [
        'The planner remains deterministic for identical inputs.',
        'Path scopes are conservative enough to avoid lane collisions.',
        localFirstLine,
        agentsLine
      ];
  }
}

function laneTitle(kind: LaneKind): string {
  switch (kind) {
    case 'docs':
      return 'Documentation lane';
    case 'tests':
      return 'Test coverage lane';
    case 'cli':
      return 'CLI surface lane';
    case 'ci':
      return 'CI and verification lane';
    case 'examples':
      return 'Examples and fixtures lane';
    case 'dependencies':
      return 'Dependency maintenance lane';
    case 'release':
      return 'Release readiness lane';
    case 'core':
      return 'Core planner lane';
  }
}

function laneRationale(facts: RepoFacts, kind: LaneKind, scopedPaths: { allowed: string[] }): string {
  const pathHint = scopedPaths.allowed.join(', ');
  switch (kind) {
    case 'docs':
      return `The repo already has docs-oriented content, so a docs lane can move quickly inside ${pathHint}.`;
    case 'tests':
      return `Test and fixture work can stay isolated to ${pathHint} while protecting implementation files.`;
    case 'cli':
      return `This repo exposes a command-line entrypoint, so CLI ergonomics should stay scoped to ${pathHint}.`;
    case 'ci':
      return `Automation and contributor checks are concentrated in ${pathHint}, which makes CI work easy to review.`;
    case 'examples':
      return `Examples are most useful when they evolve separately from core implementation paths like ${pathHint}.`;
    case 'dependencies':
      return `Dependency maintenance can stay isolated to ${pathHint} while implementation and CI lanes continue independently.`;
    case 'release':
      return `Release metadata lives in ${pathHint}, which is a natural lane for changelog and packaging work.`;
    case 'core':
      return `Implementation-heavy work belongs in ${pathHint} while other lanes avoid those files.`;
  }
}

function collectSignals(facts: RepoFacts, lanes: Lane[]): string[] {
  const signals = [
    `files:${facts.files.length}`,
    `directories:${facts.directories.length}`,
    `lanes:${lanes.length}`,
    `package-manager:${facts.packageManager}`
  ];

  if (facts.hasAgentsFile) {
    signals.push('agents-guidance:present');
  }
  if (facts.files.some((file) => file.startsWith('.github/'))) {
    signals.push('ci-config:present');
  }
  if (facts.files.some((file) => file.startsWith('docs/'))) {
    signals.push('docs:present');
  }

  return signals;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}
