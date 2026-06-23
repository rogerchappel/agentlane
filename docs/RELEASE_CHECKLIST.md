# Release Checklist

Use this checklist before publishing or announcing AgentLane.

1. Install dependencies with `npm ci`.
2. Run `npm run release:check`.
3. Run `bash scripts/validate.sh`.
4. Confirm `npm run package:smoke` lists the compiled CLI and support docs.
5. Run the fixture examples in `README.md` and confirm lane plans still include checks and acceptance criteria.
