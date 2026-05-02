# agentlane plan for docs-site

- Root: `/Users/roger/Developer/my-opensource/agentlane/fixtures/repos/docs-site`
- Package manager: `unknown`
- Lanes: **2**
- Signals: files:4, directories:4, lanes:2, package-manager:unknown, ci-config:present, docs:present
- Generated at: `2026-05-02T08:00:00.000Z`

## CI and verification lane

- Kind: `ci`
- Branch: `lane/docs-site-ci`
- Rationale: Automation and contributor checks are concentrated in .github/**, scripts/**, which makes CI work easy to review.
- Allowed paths: `.github/**`, `scripts/**`
- Stop before touching: `bun.lockb`, `package-lock.json`, `pnpm-lock.yaml`, `src/**`, `yarn.lock`

### Checks
- bash scripts/validate.sh

### Acceptance criteria
- Automation is explicit, reviewable, and safe to run in forks.
- Checks cover the intended contributor workflow without hidden side effects.
- Changes stay local-first: no telemetry, no hidden network activity, no surprise shell execution.
- If an AGENTS.md file appears later, re-run planning before changing protected areas.

## Documentation lane

- Kind: `docs`
- Branch: `lane/docs-site-docs`
- Rationale: The repo already has docs-oriented content, so a docs lane can move quickly inside README.md, docs/**.
- Allowed paths: `README.md`, `docs/**`
- Stop before touching: `bun.lockb`, `package-lock.json`, `pnpm-lock.yaml`, `src/**`, `yarn.lock`

### Checks
- bash scripts/validate.sh
- manual markdown review

### Acceptance criteria
- Docs clearly describe the relevant workflow and match current CLI behavior.
- Examples and command snippets are copy-pasteable.
- Changes stay local-first: no telemetry, no hidden network activity, no surprise shell execution.
- If an AGENTS.md file appears later, re-run planning before changing protected areas.
