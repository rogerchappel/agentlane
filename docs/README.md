# agentlane docs

- [`PRD.md`](./PRD.md) — product framing and V1 scope
- [`TASKS.md`](./TASKS.md) — delivery waves for the MVP
- [`ORCHESTRATION.md`](./ORCHESTRATION.md) — repo execution rules and publish gates
- [`orchestration.json`](./orchestration.json) — machine-readable orchestration contract

## Usage notes

`agentlane` is intentionally boring in the good way:

- deterministic
- local-first
- path-scoped
- safe by default

If a repo changes shape, re-run `agentlane plan` rather than trusting an old lane pack.
