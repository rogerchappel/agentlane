# Contributing

Thanks for helping improve `agentlane`.

This project values small, reviewable contributions with clear verification and conservative safety defaults.

## Before you start

- Read [`AGENTS.md`](./AGENTS.md) for repo-specific working rules.
- Prefer one reviewable intent per pull request.
- Keep changes local-first and deterministic.

## Good first contributions

- tighten lane heuristics for real repos
- add fixture repos that expose planner blind spots
- improve CLI copy or docs clarity
- strengthen tests around edge cases and collisions

## Issues

Before opening an issue:

- search existing issues
- confirm the issue applies to `agentlane`
- include enough context for maintainers to understand the use case

Bug reports should include:

- what happened
- what you expected
- steps to reproduce
- the smallest verification step that demonstrates the issue

Feature requests should include:

- the use case
- why the current planner output is insufficient
- risks or compatibility concerns
- suggested files or behavior that may need to change

## Pull Requests

Pull requests should:

- focus on one reviewable intent
- use Conventional Commits
- include tests or verification appropriate to the change
- update docs when behavior or usage changes
- avoid unrelated formatting or dependency churn
- avoid secrets, private contact details, and sensitive repo data

## Verification

Run the smallest checks that cover your change:

```sh
npm test
npm run check
npm run build
npm run smoke
bash scripts/validate.sh
```

If you cannot run a check, explain why and provide the exact command maintainers should run.

## Review Pack

Use this format for meaningful changes:

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
