import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));

const [readme, state] = await Promise.all([
  readFile(new URL("../README.md", import.meta.url), "utf8"),
  readJson(new URL("../docs/publication-state.json", import.meta.url)),
]);

assert.equal(state.npm.package, "agentlane", "publication metadata must name the npm package");
assert.equal(typeof state.npm.published, "boolean", "npm publication state must be explicit");

const claimsRegistryInstall = /(?:^|\n)\s*npm install agentlane\s*(?:\n|$)/m.test(readme);

if (claimsRegistryInstall) {
  assert.equal(
    state.npm.published,
    true,
    "README claims `npm install agentlane`, but publication-state metadata says the package is unpublished",
  );
} else if (!state.npm.published) {
  assert.match(
    readme,
    new RegExp(state.githubRelease.tarballUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    "README must link the maintained GitHub release tarball while npm is unpublished",
  );
}

console.log(`Publication docs match npm state: published=${state.npm.published}`);
