# Roadmap

This roadmap describes intended direction, not a delivery promise.

## Now

- Validate the `agentlane plan` MVP against more real-world repositories.
- Tighten path heuristics where lanes still overlap too easily.
- Improve examples so humans and agents can adopt the tool quickly.

## Next

- Add configurable path ignore rules.
- Support richer lane annotations from `AGENTS.md`.
- Offer machine-readable confidence and collision signals.

## Later

- Explore a `diff` mode for comparing two lane plans.
- Consider optional worktree hints once the planner output is stable.
- Add publish-time packaging polish after real user feedback.

## Not Planned

- autonomous agent dispatch
- hidden telemetry or cloud scoring
- surprise shell execution for repo inspection

## Roadmap Review

Before each meaningful release:

- move completed user-visible work into `CHANGELOG.md`
- remove stale commitments
- promote only the next reviewable slice into `Now`
