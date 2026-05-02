import path from 'node:path';

import { extractProtectedPathHints } from './agents.js';
import { readTextIfExists, walkRepo } from './fs.js';
import type { RepoFacts } from './types.js';

interface PackageManifest {
  name?: string;
  scripts?: Record<string, string>;
}

export async function detectRepoFacts(rootDir: string, agentsPath?: string): Promise<RepoFacts> {
  const { files, directories } = await walkRepo(rootDir);
  const packageJsonPath = path.join(rootDir, 'package.json');
  const packageJsonRaw = await readTextIfExists(packageJsonPath);
  const packageJson: PackageManifest | undefined = packageJsonRaw
    ? (JSON.parse(packageJsonRaw) as PackageManifest)
    : undefined;

  const resolvedAgentsPath = agentsPath ? path.resolve(rootDir, agentsPath) : path.join(rootDir, 'AGENTS.md');
  const agentsGuidance = await readTextIfExists(resolvedAgentsPath);

  return {
    rootDir,
    repoName: path.basename(rootDir),
    ...(packageJson?.name ? { packageName: packageJson.name } : {}),
    packageManager: detectPackageManager(files),
    files,
    directories,
    hasAgentsFile: agentsGuidance !== undefined,
    ...(agentsGuidance !== undefined ? { agentsGuidance } : {}),
    scripts: packageJson?.scripts ?? {},
    hasNodeProject: packageJson !== undefined,
    protectedPathHints: extractProtectedPathHints(agentsGuidance)
  };
}

function detectPackageManager(files: string[]): RepoFacts['packageManager'] {
  if (files.includes('pnpm-lock.yaml')) {
    return 'pnpm';
  }
  if (files.includes('package-lock.json')) {
    return 'npm';
  }
  if (files.includes('yarn.lock')) {
    return 'yarn';
  }
  if (files.includes('bun.lock') || files.includes('bun.lockb')) {
    return 'bun';
  }
  return 'unknown';
}
