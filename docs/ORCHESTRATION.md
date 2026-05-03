# ORCHESTRATION: agentlane

Owner: one isolated project sub-agent.
Workspace: isolated worktree under /Users/roger/Developer/my-opensource/_worktrees for factory changes; main checkout remains untouched.

## Rules
- Do not edit another project or oss-ideas from this repo agent.
- Work in an isolated git worktree and push verified commits back to `main`.
- Commit frequently and atomically; push the verified HEAD to `main`.
- Keep the project local-first and deterministic.
- Never publish secrets, telemetry, or surprise network calls.

## Required gates
Run and record results for:
- npm test
- npm run check
- npm run build
- npm run smoke
- bash scripts/validate.sh
- One real CLI smoke against fixtures or a temp repo/folder

## Publish
- Create public GitHub repo: https://github.com/rogerchappel/agentlane
- Push main directly when verified.
- Configure repo description and topics.
- Run /Users/roger/.openclaw/workspace/scripts/protect-github-main.sh rogerchappel agentlane main if available.
- Report commit count, test results, repo URL, and branch protection status.
