# agentlane

`agentlane` is a local-first TypeScript CLI for carving a repository into safe parallel work lanes for AI coding agents.

It reads the repo on disk, optionally folds in `AGENTS.md`, and emits deterministic Markdown or JSON lane plans with:

- branch names
- allowed paths
- stop-before-touching paths
- verification commands
- acceptance criteria

No hidden network calls. No shell-outs. No telemetry. Just a conservative lane plan you can hand to humans or agents.

## Why this exists

Parallel agents only help when they stop stepping on each other. `agentlane plan` gives each worker a clear blast radius before code starts moving.

## Install

```sh
npm install agentlane
```

For local development in this repo:

```sh
npm install
npm run build
```

## Quickstart

```sh
agentlane plan .
agentlane plan . --json
agentlane plan ../some-repo --agents ./AGENTS.md
```

## CLI

```text
agentlane plan [path] [--json] [--format markdown|json] [--agents ./AGENTS.md] [--no-core]
```

### Output model

Each lane includes:

- a stable lane id and branch name
- rationale for why the lane exists
- conservative allowed paths
- stop-before-touching paths for high-collision files
- checks to run before handoff
- acceptance criteria tuned for that lane

### Lane types

`agentlane` currently suggests these kinds of lanes when the repo signals support them:

- `core`
- `docs`
- `tests`
- `cli`
- `ci`
- `examples`
- `release`

## Safety stance

`agentlane` is a traffic cone, not an autopilot: it marks safe lanes so agents can move without clipping each other.

- Local-first and deterministic
- Reads files from disk only
- Never executes repo code to infer lanes
- Never phones home
- Treats `AGENTS.md` as a signal to stay conservative

See [SAFETY.md](SAFETY.md) for the full safety model.

## Examples

Human-readable plan:

```sh
agentlane plan fixtures/repos/cli-app
```

Machine-readable plan:

```sh
agentlane plan fixtures/repos/docs-site --json
```

See [`examples/`](examples/) and [`fixtures/`](fixtures/) for concrete inputs.

## Development

```sh
npm test
npm run check
npm run build
npm run smoke
npm run package:smoke
npm run release:check
bash scripts/validate.sh
```

`npm run release:check` runs the TypeScript check, compiled tests, fixture
smoke test, and package-surface smoke used for release-candidate review.

## Package contents

The npm package allowlist includes the compiled runtime, source, docs, examples,
fixtures, and public support documents: `README.md`, `LICENSE`, `SAFETY.md`,
`SECURITY.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, and `CODE_OF_CONDUCT.md`.

Run `npm run package:smoke` before publishing to confirm those files and the
compiled CLI are present in the tarball.

## Roadmap

V1 is intentionally small:

- deterministic lane suggestion
- markdown and JSON output
- fixture-backed tests
- no dispatch, worktree creation, or autonomous execution

See [`ROADMAP.md`](ROADMAP.md) for the next slices.

## Contributing

Small, reviewable contributions win here. Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`AGENTS.md`](AGENTS.md) before changing behavior.

## Security

Found a vulnerability or risky default? Start with [`SECURITY.md`](SECURITY.md).

## License

MIT
