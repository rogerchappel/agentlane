# Release candidate readiness

This repository now has a repeatable release-candidate readiness gate for the TypeScript CLI package.

## Local gate

Run the full release readiness check before cutting or approving a release candidate:

```sh
npm run release:check
node /Users/roger/Developer/my-opensource/releasebox/bin/releasebox.js check .
```

`npm run release:check` runs TypeScript checks, the test suite, the CLI smoke test, and an npm package dry-run.

## CI dry run

`.github/workflows/release-dry-run.yml` runs on manual dispatch and on release-related PR changes. It installs dependencies, runs the package verification checks, performs an npm pack dry-run, and publishes a release notes preview to the GitHub Actions summary.

## Current candidate checklist

- TypeScript compile/check gate is present.
- Node test suite gate is present.
- CLI smoke test gate is present.
- npm packaging dry-run gate is present.
- releasebox project config is present with reviewed release mode.

## Readiness run summary

Last local readiness run for this PR:

- `npm ci` — pass
- `npm run release:check` — pass
- `bash scripts/validate.sh` — pass
- `node /Users/roger/Developer/my-opensource/releasebox/bin/releasebox.js check .` — pass

No release-readiness blockers are currently known.
