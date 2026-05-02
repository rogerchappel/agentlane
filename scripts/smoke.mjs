import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cliPath = path.join(repoRoot, 'dist', 'cli.js');
const fixturePath = path.join(repoRoot, 'fixtures', 'repos', 'cli-app');

const result = spawnSync(process.execPath, [cliPath, 'plan', fixturePath, '--json'], {
  cwd: repoRoot,
  encoding: 'utf8'
});

if (result.status !== 0) {
  process.stderr.write(result.stderr || 'smoke command failed\n');
  process.exit(result.status ?? 1);
}

const parsed = JSON.parse(result.stdout);
if (!Array.isArray(parsed.lanes) || parsed.lanes.length < 3) {
  process.stderr.write('expected multiple lanes in smoke output\n');
  process.exit(1);
}

process.stdout.write(`smoke ok: ${parsed.summary.repoName} -> ${parsed.lanes.length} lanes\n`);
