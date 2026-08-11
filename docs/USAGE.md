# Usage

## Human-readable lane pack

```sh
agentlane plan .
```

Use Markdown output when a human or chat thread will read the plan directly.

## Machine-readable lane pack

```sh
agentlane plan . --json
```

Use JSON output when another tool or agent will consume the plan.

## Custom AGENTS file

```sh
agentlane plan ../repo --agents ../repo/AGENTS.md
```

This is useful when the repo keeps agent guidance outside the default root path.

The `plan` command accepts at most one repository path and defaults to the current directory when it is omitted. `--agents` requires a following file path; another option cannot be used as its value.
