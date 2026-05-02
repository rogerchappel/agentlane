import type { PlanResult } from './types.js';

export function renderPlanJson(plan: PlanResult): string {
  return JSON.stringify(plan, null, 2) + '\n';
}
