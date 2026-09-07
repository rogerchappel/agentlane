import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import path from 'node:path';

function findTests(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap(entry => {
      const candidate = path.join(directory, entry.name);
      return entry.isDirectory()
        ? findTests(candidate)
        : entry.isFile() && entry.name.endsWith('.test.js')
          ? [candidate]
          : [];
    })
    .sort();
}

const tests = findTests('test');
if (tests.length === 0) {
  console.error('No test files found under test/');
  process.exit(1);
}

const result = spawnSync(process.execPath, ['--test', ...tests], { stdio: 'inherit' });
process.exit(result.status ?? 1);
