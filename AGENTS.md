# Agent Operating Instructions for agentlane

This file defines how AI agents and human maintainers should work in `agentlane`.

## Project Context

- Project: `agentlane`
- Repository: `https://github.com/rogerchappel/agentlane`
- Primary maintainer: `Roger Chappel`
- Default branch: `main`
- Package manager: `npm`
- Primary verification command: `bash scripts/validate.sh`

## Core Principle

Move quickly, but keep every change reviewable, reversible, verifiable, and safe.

## Branch Policy

- Work on a branch for all repository changes unless the maintainer explicitly asks for direct-to-main work.
- Branch from the latest `main` before editing.
- Do not merge without explicit maintainer approval.
- Do not rewrite shared history unless explicitly instructed.

## Atomic Commits

- Use Conventional Commits.
- One commit should represent one reviewable intent.
- Keep unrelated docs, code, tests, generated files, dependency changes, and CI changes in separate commits.
- Hard gate: if a change touches more than 3 files, split it into smaller commits unless it is a scaffold, generated output, lockfile-only dependency update, or clearly mechanical repository-wide rename.
- If a task may touch more than 3 files, write the split plan before editing.

Allowed commit types:

- `feat:`
- `fix:`
- `test:`
- `docs:`
- `refactor:`
- `ci:`
- `chore:`
- `perf:`
- `types:`

## Expected Workflow

Before editing, report:

1. Task objective
2. Expected blast radius
3. Files likely to change
4. Commit plan
5. Verification plan
6. Risk level: low, medium, or high

Then:

1. Create or confirm a branch.
2. Make the smallest coherent change.
3. Review `git status`.
4. Review `git diff`.
5. Stage only files related to the current intent.
6. Run `bash scripts/validate.sh` or a smaller targeted check when appropriate.
7. Commit atomically.
8. Return a review pack.

## Verification

Every task must include verification.

Use the smallest relevant check first:

- targeted unit test
- targeted integration test
- typecheck
- build
- smoke command
- manual documentation review

If verification cannot be run, say why and provide the exact command a maintainer should run.

## Review Pack

Every completed task must return:

```md
## Review Pack
Repo: agentlane
Branch:
PR:
Task:
Status: done / blocked / needs review
Summary:
Commits:
Files changed:
Verification:
Risk level:
Rollback plan:
Human decision needed:
Next recommended task:
```

## Safety Rules

Stop and ask before touching:

- authentication or authorization
- security controls
- payments or billing
- production data
- data deletion or destructive commands
- database migrations
- secrets or environment variables
- public API compatibility
- licensing
- telemetry, analytics, or privacy behavior
- production configuration
- major dependency upgrades

Never commit secrets. Never mutate production data unless explicitly instructed.

## Repository-Specific Notes

- `agentlane` must stay local-first and deterministic.
- New features should prefer explicit output over automation side effects.
- Keep fixtures small enough to inspect in a diff.
- If you widen a lane's allowed paths, explain why in the commit or PR summary.
