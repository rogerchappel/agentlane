# Release Checklist

Use this checklist before publishing or announcing AgentLane.

1. Install dependencies with `npm ci`.
2. Run `npm run release:check`.
3. Run `bash scripts/validate.sh`.
4. Confirm `npm run package:smoke` lists the compiled CLI and support docs.
5. Run the fixture examples in `README.md` and confirm lane plans still include checks and acceptance criteria.

## npm trusted publishing

The `Release` GitHub Actions workflow publishes with npm trusted publishing. In
the npm package settings for `agentlane`, configure GitHub Actions as a trusted
publisher with owner `rogerchappel`, repository `agentlane`, and workflow
filename `release.yml`. Leave the environment name empty. The workflow needs
`id-token: write`; it does not need an `NPM_TOKEN` secret.

Trusted publishers can only be configured after the package exists on npm. For
the first publication, a maintainer must publish `agentlane` manually with an
npm account that has the required 2FA, then configure the publisher before the
next tag-driven release. Confirm the package version is still available before
any manual bootstrap publication.

## Release order and recovery

A `v*.*.*` tag runs the full release check, builds one tarball, publishes that
exact tarball to npm with public access and provenance, and only then creates
the GitHub release with the same file. Pull-request and manually dispatched dry
runs perform checks and generate notes, but never publish or create a release.

If npm publication fails, no GitHub release is created. Correct the npm trusted
publisher or package metadata and rerun the failed workflow. If npm publication
succeeds but GitHub release creation fails, do not republish or reuse the tag
for another package version: download and inspect the immutable npm package,
then create the matching GitHub release from that tarball and the generated
notes. Never create the GitHub release first, because that would advertise a
version that users cannot install.
