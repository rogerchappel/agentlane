import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const releasePath = new URL("../.github/workflows/release.yml", import.meta.url);
const dryRunPath = new URL("../.github/workflows/release-dry-run.yml", import.meta.url);

test("semver tag releases publish the inspected tarball before announcing it", async () => {
  const workflow = await readFile(releasePath, "utf8");

  assert.match(workflow, /push:\s*\n\s*tags:\s*\n\s*- 'v\*\.\*\.\*'/);
  assert.match(workflow, /permissions:[\s\S]*id-token: write/);
  assert.match(workflow, /npm install --global npm@11\.5\.1/);
  assert.match(workflow, /npm run release:check/);
  assert.match(workflow, /npm pack --json > npm-pack\.json/);
  assert.match(workflow, /filename=.*npm-pack\.json/);
  assert.match(workflow, /npm publish "\$\{\{ steps\.package\.outputs\.filename \}\}" --access public --provenance/);
  assert.match(workflow, /gh release create[\s\S]*"\$\{\{ steps\.package\.outputs\.filename \}\}"/);

  const publishIndex = workflow.indexOf("npm publish");
  const releaseIndex = workflow.indexOf("gh release create");
  assert.ok(publishIndex > -1 && releaseIndex > publishIndex);
  assert.equal((workflow.match(/\bnpm pack\b/g) ?? []).length, 1);
});

test("pull request and manual dry runs cannot publish", async () => {
  const workflow = await readFile(dryRunPath, "utf8");

  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /pull_request:/);
  assert.doesNotMatch(workflow, /npm publish/);
  assert.doesNotMatch(workflow, /gh release create/);
});
