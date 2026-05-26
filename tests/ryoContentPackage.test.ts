/**
 * Ryo Content Package — 验证 src/content/characters/ryo/ 导出完整性
 *
 * TDD RED: 此测试验证 content 包目录结构建立后的 re-export 正确性。
 * 目标：确保从 content 包可以正确访问 Ryo 定义、stats 和完整度报告。
 */
import { describe, it, expect } from 'vitest';
import { RyoDef, RYO_STATS, generateRyoReport, printRyoReport } from '../src/content/index.js';
import type { RyoStats, RyoCompletenessReport, ActionStatus } from '../src/content/index.js';

describe('Ryo Content Package', () => {
  it('exports RyoDef from content package', () => {
    expect(RyoDef).toBeDefined();
    expect(RyoDef.id).toBe('ryo');
    expect(RyoDef.name).toBe('Ryo Sakazaki');
    expect(RyoDef.nameCn).toBe('坂崎亮');
  });

  it('exports typed stats matching RyoDef.stats', () => {
    expect(RYO_STATS).toBeDefined();
    expect(RYO_STATS.walkSpeed).toBe(4);
    expect(RYO_STATS.maxHealth).toBe(1000);
    expect(RYO_STATS.closeRange).toBe(88);
    expect(RYO_STATS.throwRange).toBe(108);
    // closeRange and throwRange are optional in CharacterStats but Ryo provides them
  });

  it('stats match original RyoDef.stats field by field', () => {
    const original = RyoDef.stats;
    expect(RYO_STATS.walkSpeed).toBe(original.walkSpeed);
    expect(RYO_STATS.runSpeed).toBe(original.runSpeed);
    expect(RYO_STATS.jumpVelocity).toBe(original.jumpVelocity);
    expect(RYO_STATS.hopVelocity).toBe(original.hopVelocity);
    expect(RYO_STATS.hyperJumpVelocity).toBe(original.hyperJumpVelocity);
    expect(RYO_STATS.maxHealth).toBe(original.maxHealth);
    expect(RYO_STATS.pushWidth).toBe(original.pushWidth);
    expect(RYO_STATS.jumpForwardSpeed).toBe(original.jumpForwardSpeed);
    expect(RYO_STATS.closeRange).toBe(original.closeRange);
    expect(RYO_STATS.throwRange).toBe(original.throwRange);
  });

  it('generates completeness report from content package', () => {
    const report = generateRyoReport();
    expect(report.character).toBe('ryo');
    expect(report.totalActions).toBe(8);
    expect(report.completeActions).toBeGreaterThanOrEqual(0);
  });

  it('printRyoReport does not throw', () => {
    expect(() => printRyoReport()).not.toThrow();
  });

  it('RyoStats type is satisfied by RYO_STATS', () => {
    const typed: RyoStats = RYO_STATS;
    expect(typeof typed.walkSpeed).toBe('number');
    expect(typeof typed.maxHealth).toBe('number');
  });

  it('RyoCompletenessReport type is importable', () => {
    // Type-level check — if this compiles, the type export works
    const report: RyoCompletenessReport = generateRyoReport();
    expect(report.character).toBe('ryo');
  });
});
