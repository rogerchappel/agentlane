# agentlane plan for fixture-cli-app

- Root: `/Users/roger/Developer/my-opensource/agentlane/fixtures/repos/cli-app`
- Package manager: `unknown`
- Lanes: **6**
- Signals: files:7, directories:5, lanes:6, package-manager:unknown, agents-guidance:present, ci-config:present
- Generated at: `2026-05-02T08:00:00.000Z`

## Core planner lane

- Kind: `core`
- Branch: `lane/fixture-cli-app-core`
- Rationale: Implementation-heavy work belongs in src/**, package.json, tsconfig.json while other lanes avoid those files.
- Allowed paths: `src/**`, `package.json`, `tsconfig.json`
- Stop before touching: `.github/**`, `AGENTS.md`, `bun.lock`, `bun.lockb`, `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`

### Checks
- npm run check
- npm test

### Acceptance criteria
- The planner remains deterministic for identical inputs.
- Path scopes are conservative enough to avoid lane collisions.
- Changes stay local-first: no telemetry, no hidden network activity, no surprise shell execution.
- The lane respects AGENTS.md guidance and pauses before touching protected areas.

## CI and verification lane

- Kind: `ci`
- Branch: `lane/fixture-cli-app-ci`
- Rationale: Automation and contributor checks are concentrated in .github/**, package.json, which makes CI work easy to review.
- Allowed paths: `.github/**`, `package.json`
- Stop before touching: `AGENTS.md`, `bun.lock`, `bun.lockb`, `package-lock.json`, `pnpm-lock.yaml`, `src/**`, `yarn.lock`

### Checks
- manual workflow syntax review

### Acceptance criteria
- Automation is explicit, reviewable, and safe to run in forks.
- Checks cover the intended contributor workflow without hidden side effects.
- Changes stay local-first: no telemetry, no hidden network activity, no surprise shell execution.
- The lane respects AGENTS.md guidance and pauses before touching protected areas.

## CLI surface lane

- Kind: `cli`
- Branch: `lane/fixture-cli-app-cli`
- Rationale: This repo exposes a command-line entrypoint, so CLI ergonomics should stay scoped to src/cli.ts, src/**/*.ts, bin/**, package.json.
- Allowed paths: `src/cli.ts`, `src/**/*.ts`, `bin/**`, `package.json`
- Stop before touching: `.github/**`, `AGENTS.md`, `bun.lock`, `bun.lockb`, `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`

### Checks
- npm run build
- npm run smoke

### Acceptance criteria
- CLI help and output stay deterministic for the same repo input.
- Machine-readable output remains stable and documented.
- Changes stay local-first: no telemetry, no hidden network activity, no surprise shell execution.
- The lane respects AGENTS.md guidance and pauses before touching protected areas.

## Documentation lane

- Kind: `docs`
- Branch: `lane/fixture-cli-app-docs`
- Rationale: The repo already has docs-oriented content, so a docs lane can move quickly inside README.md.
- Allowed paths: `README.md`
- Stop before touching: `AGENTS.md`, `bun.lock`, `bun.lockb`, `package-lock.json`, `pnpm-lock.yaml`, `src/**`, `yarn.lock`

### Checks
- manual markdown review

### Acceptance criteria
- Docs clearly describe the relevant workflow and match current CLI behavior.
- Examples and command snippets are copy-pasteable.
- Changes stay local-first: no telemetry, no hidden network activity, no surprise shell execution.
- The lane respects AGENTS.md guidance and pauses before touching protected areas.

## Examples and fixtures lane

- Kind: `examples`
- Branch: `lane/fixture-cli-app-examples`
- Rationale: Examples are most useful when they evolve separately from core implementation paths like examples/**, fixtures/**, README.md, docs/**.
- Allowed paths: `examples/**`, `fixtures/**`, `README.md`, `docs/**`
- Stop before touching: `AGENTS.md`, `bun.lock`, `bun.lockb`, `package-lock.json`, `pnpm-lock.yaml`, `src/**`, `yarn.lock`

### Checks
- manual example walkthrough
- npm run smoke

### Acceptance criteria
- Examples reflect real supported workflows.
- Fixtures stay small, deterministic, and easy to inspect.
- Changes stay local-first: no telemetry, no hidden network activity, no surprise shell execution.
- The lane respects AGENTS.md guidance and pauses before touching protected areas.

## Test coverage lane

- Kind: `tests`
- Branch: `lane/fixture-cli-app-tests`
- Rationale: Test and fixture work can stay isolated to test/**, tests/**, __tests__/**, fixtures/**, package.json while protecting implementation files.
- Allowed paths: `test/**`, `tests/**`, `__tests__/**`, `fixtures/**`, `package.json`
- Stop before touching: `AGENTS.md`, `bun.lock`, `bun.lockb`, `package-lock.json`, `pnpm-lock.yaml`, `src/**`, `yarn.lock`

### Checks
- npm run check
- npm test

### Acceptance criteria
- Coverage demonstrates the target workflow or edge case.
- Fixtures and assertions are deterministic.
- Tests fail for the right reason before the fix and pass afterward.
- The lane respects AGENTS.md guidance and pauses before touching protected areas.
