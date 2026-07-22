export type LaneKind =
  | 'docs'
  | 'tests'
  | 'cli'
  | 'ci'
  | 'examples'
  | 'dependencies'
  | 'release'
  | 'core';

export interface RepoFacts {
  rootDir: string;
  repoName: string;
  packageName?: string;
  packageManager: 'npm' | 'pnpm' | 'yarn' | 'bun' | 'unknown';
  files: string[];
  directories: string[];
  hasAgentsFile: boolean;
  agentsGuidance?: string;
  scripts: Record<string, string>;
  hasNodeProject: boolean;
  protectedPathHints: string[];
}

export interface Lane {
  id: string;
  kind: LaneKind;
  title: string;
  rationale: string;
  branchName: string;
  allowedPaths: string[];
  stopBeforeTouchingPaths: string[];
  checks: string[];
  acceptanceCriteria: string[];
}

export interface PlanSummary {
  repoName: string;
  packageManager: RepoFacts['packageManager'];
  laneCount: number;
  generatedAt?: string;
  inputRoot: string;
  signals: string[];
}

export interface PlanResult {
  summary: PlanSummary;
  lanes: Lane[];
}

export interface PlanOptions {
  rootDir: string;
  agentsPath?: string;
  includeCoreLane?: boolean;
  now?: Date;
}
