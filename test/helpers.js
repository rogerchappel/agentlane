import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const repoRoot = path.resolve(__dirname, '..');

export function fixtureRepo(name) {
  return path.join(repoRoot, 'fixtures', 'repos', name);
}

export async function readExpected(name) {
  return readFile(path.join(repoRoot, 'test', 'fixtures', 'expected', name), 'utf8');
}
