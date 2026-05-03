# Safety model

`agentlane` is intentionally boring in the best way: it plans lanes from files already on disk and stops there.

## Guarantees

- No telemetry or analytics.
- No network calls during planning.
- No shell execution while inspecting a repository.
- No writes to the target repository.
- Deterministic output for the same input tree and timestamp.

## Conservative defaults

Generated lanes include `stopBeforeTouchingPaths` for high-collision files such as lockfiles, CI config, source paths, and any protected path hints found in `AGENTS.md`.

The planner is a reviewer aid, not an authority. If a lane looks too broad, split it before handing it to an agent.

## Reporting risky behavior

If you find a path collision, unsafe default, or surprising side effect, please open a GitHub issue or follow the private reporting path in [SECURITY.md](SECURITY.md).
