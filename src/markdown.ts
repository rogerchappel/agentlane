import type { Lane, PlanResult } from './types.js';

export function renderPlanMarkdown(plan: PlanResult): string {
  const lines: string[] = [];
  lines.push(`# agentlane plan for ${plan.summary.repoName}`);
  lines.push('');
  lines.push(`- Root: \`${plan.summary.inputRoot}\``);
  lines.push(`- Package manager: \`${plan.summary.packageManager}\``);
  lines.push(`- Lanes: **${plan.summary.laneCount}**`);
  lines.push(`- Signals: ${plan.summary.signals.join(', ')}`);
  lines.push(`- Generated at: \`${plan.summary.generatedAt}\``);
  lines.push('');

  for (const lane of plan.lanes) {
    lines.push(renderLaneMarkdown(lane));
    lines.push('');
  }

  return lines.join('\n').trimEnd() + '\n';
}

function renderLaneMarkdown(lane: Lane): string {
  return [
    `## ${lane.title}`,
    '',
    `- Kind: \`${lane.kind}\``,
    `- Branch: \`${lane.branchName}\``,
    `- Rationale: ${lane.rationale}`,
    `- Allowed paths: ${renderListInline(lane.allowedPaths)}`,
    `- Stop before touching: ${renderListInline(lane.stopBeforeTouchingPaths)}`,
    '',
    '### Checks',
    ...lane.checks.map((check) => `- ${check}`),
    '',
    '### Acceptance criteria',
    ...lane.acceptanceCriteria.map((item) => `- ${item}`)
  ].join('\n');
}

function renderListInline(values: string[]): string {
  return values.map((value) => `\`${value}\``).join(', ');
}
