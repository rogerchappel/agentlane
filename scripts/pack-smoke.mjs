#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";

const expectedFiles = [
  "dist/cli.js",
  "dist/index.js",
  "dist/index.d.ts",
  "examples/cli-app-plan.md",
  "examples/docs-site-plan.json",
  "fixtures/repos/cli-app/package.json",
  "docs/USAGE.md",
  "AGENTS.md",
  "ROADMAP.md",
  "README.md",
  "LICENSE",
  "SAFETY.md",
  "SECURITY.md",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "CODE_OF_CONDUCT.md"
];

const output = execFileSync("npm", ["pack", "--dry-run", "--json"], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "inherit"]
});

const [pack] = JSON.parse(output);
const publishedFiles = new Set(pack.files.map((file) => file.path));
const missing = expectedFiles.filter((file) => !publishedFiles.has(file));

if (missing.length > 0) {
  console.error("agentlane package smoke failed; missing expected file(s):");
  for (const file of missing) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
if (packageJson.bin?.agentlane !== "./dist/cli.js") {
  console.error("agentlane package smoke failed; expected agentlane bin in package metadata.");
  process.exit(1);
}

console.log(`agentlane package smoke passed with ${pack.files.length} packed file(s).`);
