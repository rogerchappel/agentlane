# PRD: agentlane

Status: in-progress

## Scorecard

Total: 79/100
Band: promising
Last scored: 2026-04-29
Scored by: Neo

| Criterion | Points | Notes |
|---|---:|---|
| Problem pain | 17/20 | Parallel agent work needs safer lane boundaries to avoid collisions. |
| Demand signal | 15/20 | Strong internal need from multi-agent workflows; external validation still needed. |
| V1 buildability | 17/20 | Deterministic lane suggestions are feasible, but useful path inference may need iteration. |
| Differentiation | 12/15 | Agent-specific lane planning is relatively distinct. |
| Agentic workflow leverage | 15/15 | Directly improves safe parallelism and delegation. |
| Distribution potential | 3/10 | More abstract and harder to market than commit/check/PR tools. |

## Pitch

Define safe, parallel lanes of work for agents across a repo or workspace.

## Why It Matters

Throughput comes from isolated lanes with clear scope, not one giant prompt.

## V1 Scope

- CLI: `agentlane plan`
- Reads repo files and optional `AGENTS.md`
- Suggests docs/tests/CLI/CI/examples/release lanes
- Emits branch name, allowed paths, stop-before-touching paths, checks, acceptance criteria
- Outputs Markdown and JSON

## Out of Scope

- No agent dispatch
- No worktree creation in V1
- No autonomous execution

## Verification

- Fixtures for CLI repo/docs repo/template repo
- Snapshot lane plans

## Agent Prompt

Build `agentlane`, a deterministic CLI that turns a repo into safe parallel work lanes for AI coding agents. It should emit Markdown/JSON lane plans with branch names, allowed paths, stop-before-touching paths, verification commands, and acceptance criteria. Include fixtures, tests, README, and examples.
