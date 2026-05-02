import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const IGNORE_DIRS = new Set([
  '.git',
  'node_modules',
  'dist',
  'coverage',
  '.next',
  '.turbo'
]);

export async function walkRepo(rootDir: string): Promise<{ files: string[]; directories: string[] }> {
  const files: string[] = [];
  const directories = new Set<string>();

  async function visit(currentDir: string): Promise<void> {
    const entries = await readdir(currentDir, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));

    for (const entry of entries) {
      const absolutePath = path.join(currentDir, entry.name);
      const relativePath = normalizeRelative(rootDir, absolutePath);

      if (entry.isDirectory()) {
        if (IGNORE_DIRS.has(entry.name)) {
          continue;
        }

        directories.add(relativePath);
        await visit(absolutePath);
        continue;
      }

      if (entry.isFile()) {
        files.push(relativePath);
      }
    }
  }

  await visit(rootDir);

  return {
    files,
    directories: Array.from(directories).sort()
  };
}

export async function readTextIfExists(filePath: string): Promise<string | undefined> {
  try {
    return await readFile(filePath, 'utf8');
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') {
      return undefined;
    }
    throw error;
  }
}

export function normalizeRelative(rootDir: string, absolutePath: string): string {
  const relative = path.relative(rootDir, absolutePath);
  return relative === '' ? '.' : relative.split(path.sep).join('/');
}

export function uniqueSorted(values: Iterable<string>): string[] {
  return Array.from(new Set(values)).sort();
}
