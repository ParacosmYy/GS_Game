/**
 * Ryo Content Package — Completeness Report Summary
 *
 * 汇总Ryo内容包各子域的完成状态。
 * 实际完整度数据由 tools/ryoCompletenessReport.ts 生成, 此文件提供快捷查询。
 *
 * 归属: content/characters/ryo/reports/ — 只放"校验结果摘要"
 */

export interface SubdomainStatus {
  name: string;
  hasRealData: boolean;
  dataFile: string;
  testFile: string;
  testCount: number;
}

export const RYO_SUBDOMAIN_STATUS: SubdomainStatus[] = [
  { name: 'commands', hasRealData: true, dataFile: 'commands/ryoCommands.ts', testFile: 'tests/ryoCommands.test.ts', testCount: 5 },
  { name: 'moves', hasRealData: true, dataFile: 'moves/ryoMoves.ts', testFile: 'tests/ryoMoves.test.ts', testCount: 10 },
  { name: 'attacks', hasRealData: true, dataFile: 'attacks/ryoAttacks.ts', testFile: 'tests/ryoAttacks.test.ts', testCount: 5 },
  { name: 'hitboxes', hasRealData: true, dataFile: 'hitboxes/ryoHitboxes.ts', testFile: 'tests/ryoHitboxes.test.ts', testCount: 5 },
  { name: 'feedback', hasRealData: true, dataFile: 'feedback/ryoFeedback.ts', testFile: 'tests/ryoFeedback.test.ts', testCount: 5 },
  { name: 'animations', hasRealData: true, dataFile: 'animations/ryoAnimations.ts', testFile: 'N/A', testCount: 0 },
  { name: 'portraits', hasRealData: true, dataFile: 'portraits/ryoPortraits.ts', testFile: 'N/A', testCount: 0 },
];

/** 获取有真实数据的子域数量 */
export function getCompletedSubdomains(): number {
  return RYO_SUBDOMAIN_STATUS.filter(s => s.hasRealData).length;
}

/** 获取仍需测试的子域 */
export function getSubdomainsNeedingTests(): SubdomainStatus[] {
  return RYO_SUBDOMAIN_STATUS.filter(s => s.testCount === 0);
}

/** 总完成度百分比 */
export function getRyoContentCompletion(): number {
  const total = RYO_SUBDOMAIN_STATUS.length;
  const done = getCompletedSubdomains();
  return Math.round((done / total) * 100);
}