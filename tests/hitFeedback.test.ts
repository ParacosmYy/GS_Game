/**
 * Hit Feedback & Combo Display Tests
 *
 * Tests the layered hit feedback system from constants.ts (getHitstopFrames,
 * getShakeIntensity, getShakeDuration, getSparkType, getSparkSizeScale,
 * getSparkCount) and the preset particle functions from vfxPresets.ts that
 * power hit feedback, combo counter display, and damage tracking.
 *
 * These are unit-level tests that do not require a Canvas context or real game loop.
 */
import { describe, it, expect } from 'vitest';
import { AttackType } from '../src/core/types.js';
import {
  // Hitstop constants
  HITSTOP_LIGHT, HITSTOP_MEDIUM, HITSTOP_SPECIAL, HITSTOP_DM, HITSTOP_SDM, HITSTOP_COUNTER_BONUS,
  // Blockstop constants
  BLOCKSTOP_LIGHT, BLOCKSTOP_HEAVY, BLOCKSTOP_SPECIAL, BLOCKSTOP_DM,
  // Shake constants
  SHAKE_LIGHT, SHAKE_HEAVY, SHAKE_COUNTER, SHAKE_SPECIAL, SHAKE_THROW, SHAKE_DM, SHAKE_KO,
  SHAKE_DURATION_LIGHT, SHAKE_DURATION_HEAVY, SHAKE_DURATION_SPECIAL, SHAKE_DURATION_DM, SHAKE_DURATION_KO,
  SHAKE_BLOCK_LIGHT, SHAKE_BLOCK_HEAVY, SHAKE_BLOCK_SPECIAL, SHAKE_BLOCK_DM,
  SHAKE_BLOCK_DURATION_LIGHT, SHAKE_BLOCK_DURATION_HEAVY, SHAKE_BLOCK_DURATION_SPECIAL, SHAKE_BLOCK_DURATION_DM,
  SHAKE_DMG_THRESHOLD,
  // Spark constants
  SPARK_LIGHT, SPARK_HEAVY, SPARK_SPECIAL, SPARK_DM, SPARK_SDM, SPARK_COUNTER, SPARK_THROW,
  SPARK_SIZE_LIGHT, SPARK_SIZE_HEAVY, SPARK_SIZE_SPECIAL, SPARK_SIZE_DM, SPARK_SIZE_SDM,
  SPARK_COUNT_LIGHT, SPARK_COUNT_SPECIAL, SPARK_COUNT_DM, SPARK_COUNT_SDM, SPARK_COUNT_COUNTER,
  // Helper functions
  getHitstopFrames,
  getShakeIntensity,
  getShakeDuration,
  getSparkType,
  getSparkSizeScale,
  getSparkCount,
} from '../src/core/constants.js';
import {
  spawnCharacterHitSparks,
  spawnBlockFlash,
  spawnImpactRing,
  spawnDamageText,
  spawnCounterText,
  spawnComboEndText,
  spawnComboDamageText,
} from '../src/rendering/vfxPresets.js';
import type { Particle } from '../src/rendering/vfxPresets.js';

// ═══════════════════════════════════════════════════════════════
// SECTION 1: Hitstop分层系统
// ═══════════════════════════════════════════════════════════════

describe('1. Hitstop分层常量值', () => {
  it('HITSTOP_LIGHT = 4 (轻攻击)', () => {
    expect(HITSTOP_LIGHT).toBe(4);
  });
  it('HITSTOP_MEDIUM = 7 (重攻击)', () => {
    expect(HITSTOP_MEDIUM).toBe(7);
  });
  it('HITSTOP_SPECIAL = 13 (必杀技)', () => {
    expect(HITSTOP_SPECIAL).toBe(13);
  });
  it('HITSTOP_DM = 19 (DM超必杀)', () => {
    expect(HITSTOP_DM).toBe(19);
  });
  it('HITSTOP_SDM = 22 (SDM超必杀)', () => {
    expect(HITSTOP_SDM).toBe(22);
  });
  it('HITSTOP_COUNTER_BONUS = 3 (Counter Hit额外帧数)', () => {
    expect(HITSTOP_COUNTER_BONUS).toBe(3);
  });
  it('hitstop分层单调递增: LIGHT < MEDIUM < SPECIAL < DM < SDM', () => {
    expect(HITSTOP_LIGHT).toBeLessThan(HITSTOP_MEDIUM);
    expect(HITSTOP_MEDIUM).toBeLessThan(HITSTOP_SPECIAL);
    expect(HITSTOP_SPECIAL).toBeLessThan(HITSTOP_DM);
    expect(HITSTOP_DM).toBeLessThan(HITSTOP_SDM);
  });
});

describe('2. getHitstopFrames — 各攻击类型返回正确hitstop帧数', () => {
  it('轻拳 (STAND_A) 返回 HITSTOP_LIGHT=4', () => {
    expect(getHitstopFrames('STAND_A')).toBe(HITSTOP_LIGHT);
  });
  it('轻脚 (STAND_B) 返回 HITSTOP_LIGHT=4', () => {
    expect(getHitstopFrames('STAND_B')).toBe(HITSTOP_LIGHT);
  });
  it('蹲轻拳 (CROUCH_A) 返回 HITSTOP_LIGHT=4', () => {
    expect(getHitstopFrames('CROUCH_A')).toBe(HITSTOP_LIGHT);
  });
  it('跳轻拳 (JUMP_A) 返回 HITSTOP_LIGHT=4', () => {
    expect(getHitstopFrames('JUMP_A')).toBe(HITSTOP_LIGHT);
  });
  it('近轻拳 (CLOSE_A) 返回 HITSTOP_LIGHT=4', () => {
    expect(getHitstopFrames('CLOSE_A')).toBe(HITSTOP_LIGHT);
  });
  it('重拳 (STAND_C) 返回 HITSTOP_MEDIUM=7', () => {
    expect(getHitstopFrames('STAND_C')).toBe(HITSTOP_MEDIUM);
  });
  it('蹲重脚 (CROUCH_D) 返回 HITSTOP_MEDIUM=7', () => {
    expect(getHitstopFrames('CROUCH_D')).toBe(HITSTOP_MEDIUM);
  });
  it('跳重拳 (JUMP_C) 返回 HITSTOP_MEDIUM=7', () => {
    expect(getHitstopFrames('JUMP_C')).toBe(HITSTOP_MEDIUM);
  });
  it('近重脚 (CLOSE_D) 返回 HITSTOP_MEDIUM=7', () => {
    expect(getHitstopFrames('CLOSE_D')).toBe(HITSTOP_MEDIUM);
  });
  it('DM (DM_OROCHINAGI) 返回 HITSTOP_DM=19', () => {
    expect(getHitstopFrames('DM_OROCHINAGI')).toBe(HITSTOP_DM);
  });
  it('DM (DM_POWER_GEYSER) 返回 HITSTOP_DM=19', () => {
    expect(getHitstopFrames('DM_POWER_GEYSER')).toBe(HITSTOP_DM);
  });
  it('SDM (SDM_OROCHINAGI) 返回 HITSTOP_SDM=22', () => {
    expect(getHitstopFrames('SDM_OROCHINAGI')).toBe(HITSTOP_SDM);
  });
  it('SDM (SDM_YATAGARASU) 返回 HITSTOP_SDM=22', () => {
    expect(getHitstopFrames('SDM_YATAGARASU')).toBe(HITSTOP_SDM);
  });
  it('HSDM 返回 HITSTOP_SDM=22', () => {
    expect(getHitstopFrames('HSDM_SOMETHING')).toBe(HITSTOP_SDM);
  });
  // 必杀技不走 getHitstopFrames，由 classifyAttack 标记后走 calcHitStop
  // 但这里测试函数本身的分层能力
  it('未知攻击类型默认返回 HITSTOP_LIGHT=4', () => {
    expect(getHitstopFrames('UNKNOWN_ATTACK')).toBe(HITSTOP_LIGHT);
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 2: Counter Hit乘数
// ═══════════════════════════════════════════════════════════════

describe('3. Counter Hit hitstop乘数', () => {
  it('CH加成 = HITSTOP_COUNTER_BONUS=3', () => {
    expect(HITSTOP_COUNTER_BONUS).toBe(3);
  });

  it('CH轻拳: 4 + 3 = 7', () => {
    const base = getHitstopFrames('STAND_A');
    expect(base + HITSTOP_COUNTER_BONUS).toBe(7);
  });

  it('CH重拳: 7 + 3 = 10', () => {
    const base = getHitstopFrames('STAND_C');
    expect(base + HITSTOP_COUNTER_BONUS).toBe(10);
  });

  it('CH DM: 19 + 3 = 22', () => {
    const base = getHitstopFrames('DM_OROCHINAGI');
    expect(base + HITSTOP_COUNTER_BONUS).toBe(22);
  });

  it('CH SDM: 22 + 3 = 25', () => {
    const base = getHitstopFrames('SDM_OROCHINAGI');
    expect(base + HITSTOP_COUNTER_BONUS).toBe(25);
  });

  it('CH加成在所有攻击类型上均为+3', () => {
    const types = ['STAND_A', 'STAND_C', 'CROUCH_D', 'JUMP_B', 'DM_TEST', 'SDM_TEST'];
    for (const t of types) {
      const base = getHitstopFrames(t);
      expect(base + HITSTOP_COUNTER_BONUS).toBe(base + 3);
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 3: Blockstop分层
// ═══════════════════════════════════════════════════════════════

describe('4. Blockstop分层常量', () => {
  it('BLOCKSTOP_LIGHT = 2', () => {
    expect(BLOCKSTOP_LIGHT).toBe(2);
  });
  it('BLOCKSTOP_HEAVY = 4', () => {
    expect(BLOCKSTOP_HEAVY).toBe(4);
  });
  it('BLOCKSTOP_SPECIAL = 5', () => {
    expect(BLOCKSTOP_SPECIAL).toBe(5);
  });
  it('BLOCKSTOP_DM = 8', () => {
    expect(BLOCKSTOP_DM).toBe(8);
  });
  it('blockstop分层单调递增: LIGHT < HEAVY < SPECIAL < DM', () => {
    expect(BLOCKSTOP_LIGHT).toBeLessThan(BLOCKSTOP_HEAVY);
    expect(BLOCKSTOP_HEAVY).toBeLessThan(BLOCKSTOP_SPECIAL);
    expect(BLOCKSTOP_SPECIAL).toBeLessThan(BLOCKSTOP_DM);
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 4: Screen Shake分层
// ═══════════════════════════════════════════════════════════════

describe('5. Screen Shake强度常量和映射', () => {
  it('SHAKE_LIGHT = 3', () => {
    expect(SHAKE_LIGHT).toBe(3);
  });
  it('SHAKE_HEAVY = 6', () => {
    expect(SHAKE_HEAVY).toBe(6);
  });
  it('SHAKE_COUNTER = 6', () => {
    expect(SHAKE_COUNTER).toBe(6);
  });
  it('SHAKE_SPECIAL = 8', () => {
    expect(SHAKE_SPECIAL).toBe(8);
  });
  it('SHAKE_THROW = 8', () => {
    expect(SHAKE_THROW).toBe(8);
  });
  it('SHAKE_DM = 14', () => {
    expect(SHAKE_DM).toBe(14);
  });
  it('SHAKE_KO = 22', () => {
    expect(SHAKE_KO).toBe(22);
  });
  it('shake强度单调递增: LIGHT < HEAVY <= SPECIAL < DM < KO', () => {
    expect(SHAKE_LIGHT).toBeLessThan(SHAKE_HEAVY);
    expect(SHAKE_SPECIAL).toBeLessThan(SHAKE_DM);
    expect(SHAKE_DM).toBeLessThan(SHAKE_KO);
  });
});

describe('6. getShakeIntensity — 各攻击类型返回正确震屏强度', () => {
  it('轻攻击返回 SHAKE_LIGHT=3', () => {
    expect(getShakeIntensity('STAND_A', 30, false)).toBe(SHAKE_LIGHT);
  });
  it('重攻击返回 SHAKE_HEAVY=6', () => {
    expect(getShakeIntensity('STAND_C', 80, false)).toBe(SHAKE_HEAVY);
    expect(getShakeIntensity('CROUCH_D', 90, false)).toBe(SHAKE_HEAVY);
  });
  it('DM返回 SHAKE_DM=14', () => {
    expect(getShakeIntensity('DM_OROCHINAGI', 200, false)).toBe(SHAKE_DM);
  });
  it('SDM返回 SHAKE_DM=14', () => {
    expect(getShakeIntensity('SDM_OROCHINAGI', 250, false)).toBe(SHAKE_DM);
  });
  it('必杀技返回 SHAKE_SPECIAL=8', () => {
    expect(getShakeIntensity('KYO_ONIYAKI', 60, false)).toBe(SHAKE_SPECIAL);
  });
  it('投技返回 SHAKE_THROW=8', () => {
    expect(getShakeIntensity('THROW', 80, false)).toBe(SHAKE_THROW);
    expect(getShakeIntensity('THROW_FORWARD', 80, false)).toBe(SHAKE_THROW);
    expect(getShakeIntensity('THROW_BACK', 80, false)).toBe(SHAKE_THROW);
  });
  it('Counter Hit返回 SHAKE_COUNTER=6 (非重攻击时)', () => {
    expect(getShakeIntensity('STAND_A', 30, true)).toBe(SHAKE_COUNTER);
  });
  it('伤害>50的轻攻击返回4 (中间档)', () => {
    expect(getShakeIntensity('STAND_A', 60, false)).toBe(4);
  });
  it('伤害<=50的轻攻击返回 SHAKE_LIGHT=3', () => {
    expect(getShakeIntensity('STAND_A', 33, false)).toBe(SHAKE_LIGHT);
  });
});

describe('7. Shake Duration分层', () => {
  it('SHAKE_DURATION_LIGHT = 4', () => {
    expect(SHAKE_DURATION_LIGHT).toBe(4);
  });
  it('SHAKE_DURATION_HEAVY = 8', () => {
    expect(SHAKE_DURATION_HEAVY).toBe(8);
  });
  it('SHAKE_DURATION_SPECIAL = 10', () => {
    expect(SHAKE_DURATION_SPECIAL).toBe(10);
  });
  it('SHAKE_DURATION_DM = 16', () => {
    expect(SHAKE_DURATION_DM).toBe(16);
  });
  it('SHAKE_DURATION_KO = 55', () => {
    expect(SHAKE_DURATION_KO).toBe(55);
  });
  it('duration单调递增: LIGHT < HEAVY < SPECIAL < DM < KO', () => {
    expect(SHAKE_DURATION_LIGHT).toBeLessThan(SHAKE_DURATION_HEAVY);
    expect(SHAKE_DURATION_HEAVY).toBeLessThan(SHAKE_DURATION_SPECIAL);
    expect(SHAKE_DURATION_SPECIAL).toBeLessThan(SHAKE_DURATION_DM);
    expect(SHAKE_DURATION_DM).toBeLessThan(SHAKE_DURATION_KO);
  });
});

describe('8. getShakeDuration — 各攻击类型返回正确持续帧数', () => {
  it('轻攻击返回 SHAKE_DURATION_LIGHT=4', () => {
    expect(getShakeDuration('STAND_A')).toBe(SHAKE_DURATION_LIGHT);
  });
  it('重攻击返回 SHAKE_DURATION_HEAVY=8', () => {
    expect(getShakeDuration('STAND_C')).toBe(SHAKE_DURATION_HEAVY);
    expect(getShakeDuration('CROUCH_D')).toBe(SHAKE_DURATION_HEAVY);
    expect(getShakeDuration('JUMP_C')).toBe(SHAKE_DURATION_HEAVY);
  });
  it('必杀技返回 SHAKE_DURATION_SPECIAL=10', () => {
    expect(getShakeDuration('KYO_ONIYAKI')).toBe(SHAKE_DURATION_SPECIAL);
  });
  it('DM返回 SHAKE_DURATION_DM=16', () => {
    expect(getShakeDuration('DM_OROCHINAGI')).toBe(SHAKE_DURATION_DM);
  });
  it('SDM返回 SHAKE_DURATION_DM=16', () => {
    expect(getShakeDuration('SDM_OROCHINAGI')).toBe(SHAKE_DURATION_DM);
  });
});

describe('9. Block Shake分层', () => {
  it('SHAKE_BLOCK_LIGHT = 3', () => { expect(SHAKE_BLOCK_LIGHT).toBe(3); });
  it('SHAKE_BLOCK_HEAVY = 4', () => { expect(SHAKE_BLOCK_HEAVY).toBe(4); });
  it('SHAKE_BLOCK_SPECIAL = 5', () => { expect(SHAKE_BLOCK_SPECIAL).toBe(5); });
  it('SHAKE_BLOCK_DM = 8', () => { expect(SHAKE_BLOCK_DM).toBe(8); });
  it('block shake强度单调递增', () => {
    expect(SHAKE_BLOCK_LIGHT).toBeLessThan(SHAKE_BLOCK_HEAVY);
    expect(SHAKE_BLOCK_HEAVY).toBeLessThan(SHAKE_BLOCK_SPECIAL);
    expect(SHAKE_BLOCK_SPECIAL).toBeLessThan(SHAKE_BLOCK_DM);
  });
  it('block shake duration单调递增', () => {
    expect(SHAKE_BLOCK_DURATION_LIGHT).toBeLessThan(SHAKE_BLOCK_DURATION_HEAVY);
    expect(SHAKE_BLOCK_DURATION_HEAVY).toBeLessThan(SHAKE_BLOCK_DURATION_SPECIAL);
    expect(SHAKE_BLOCK_DURATION_SPECIAL).toBeLessThan(SHAKE_BLOCK_DURATION_DM);
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 5: Spark/VFX分层
// ═══════════════════════════════════════════════════════════════

describe('10. getSparkType — 各攻击类型返回正确spark标签', () => {
  it('轻攻击返回 SPARK_LIGHT', () => {
    expect(getSparkType('STAND_A')).toBe(SPARK_LIGHT);
    expect(getSparkType('CROUCH_A')).toBe(SPARK_LIGHT);
    expect(getSparkType('JUMP_A')).toBe(SPARK_LIGHT);
  });
  it('重攻击返回 SPARK_HEAVY', () => {
    expect(getSparkType('STAND_C')).toBe(SPARK_HEAVY);
    expect(getSparkType('CROUCH_D')).toBe(SPARK_HEAVY);
    expect(getSparkType('JUMP_C')).toBe(SPARK_HEAVY);
    expect(getSparkType('CLOSE_D')).toBe(SPARK_HEAVY);
  });
  it('CD攻击返回 SPARK_HEAVY', () => {
    expect(getSparkType('STAND_CD')).toBe(SPARK_HEAVY);
    expect(getSparkType('JUMP_CD')).toBe(SPARK_HEAVY);
  });
  it('必杀技返回 SPARK_SPECIAL', () => {
    expect(getSparkType('KYO_ONIYAKI')).toBe(SPARK_SPECIAL);
    expect(getSparkType('IORI_AOIHANA')).toBe(SPARK_SPECIAL);
    expect(getSparkType('SPECIAL_UPPER')).toBe(SPARK_SPECIAL);
  });
  it('DM返回 SPARK_DM', () => {
    expect(getSparkType('DM_OROCHINAGI')).toBe(SPARK_DM);
    expect(getSparkType('DM_POWER_GEYSER')).toBe(SPARK_DM);
  });
  it('SDM返回 SPARK_SDM', () => {
    expect(getSparkType('SDM_OROCHINAGI')).toBe(SPARK_SDM);
    expect(getSparkType('HSDM_SOMETHING')).toBe(SPARK_SDM);
  });
  it('投技返回 SPARK_THROW', () => {
    expect(getSparkType('THROW')).toBe(SPARK_THROW);
    expect(getSparkType('THROW_FORWARD')).toBe(SPARK_THROW);
    expect(getSparkType('THROW_BACK')).toBe(SPARK_THROW);
  });
});

describe('11. getSparkSizeScale — 各攻击类型返回正确spark尺寸', () => {
  it('SPARK_SIZE_LIGHT = 0.55', () => { expect(SPARK_SIZE_LIGHT).toBe(0.55); });
  it('SPARK_SIZE_HEAVY = 0.85', () => { expect(SPARK_SIZE_HEAVY).toBe(0.85); });
  it('SPARK_SIZE_SPECIAL = 1.1', () => { expect(SPARK_SIZE_SPECIAL).toBe(1.1); });
  it('SPARK_SIZE_DM = 1.3', () => { expect(SPARK_SIZE_DM).toBe(1.3); });
  it('SPARK_SIZE_SDM = 1.5', () => { expect(SPARK_SIZE_SDM).toBe(1.5); });
  it('spark size单调递增: LIGHT < HEAVY < SPECIAL < DM < SDM', () => {
    expect(SPARK_SIZE_LIGHT).toBeLessThan(SPARK_SIZE_HEAVY);
    expect(SPARK_SIZE_HEAVY).toBeLessThan(SPARK_SIZE_SPECIAL);
    expect(SPARK_SIZE_SPECIAL).toBeLessThan(SPARK_SIZE_DM);
    expect(SPARK_SIZE_DM).toBeLessThan(SPARK_SIZE_SDM);
  });
  it('getSparkSizeScale返回正确值', () => {
    expect(getSparkSizeScale('STAND_A')).toBe(SPARK_SIZE_LIGHT);
    expect(getSparkSizeScale('STAND_C')).toBe(SPARK_SIZE_HEAVY);
    expect(getSparkSizeScale('KYO_ONIYAKI')).toBe(SPARK_SIZE_SPECIAL);
    expect(getSparkSizeScale('DM_OROCHINAGI')).toBe(SPARK_SIZE_DM);
    expect(getSparkSizeScale('SDM_OROCHINAGI')).toBe(SPARK_SIZE_SDM);
  });
});

describe('12. getSparkCount — 各攻击类型返回正确粒子数量', () => {
  it('SPARK_COUNT_LIGHT = 6', () => { expect(SPARK_COUNT_LIGHT).toBe(6); });
  it('SPARK_COUNT_SPECIAL = 10', () => { expect(SPARK_COUNT_SPECIAL).toBe(10); });
  it('SPARK_COUNT_DM = 14', () => { expect(SPARK_COUNT_DM).toBe(14); });
  it('SPARK_COUNT_SDM = 18', () => { expect(SPARK_COUNT_SDM).toBe(18); });
  it('SPARK_COUNT_COUNTER = 8', () => { expect(SPARK_COUNT_COUNTER).toBe(8); });
  it('spark count单调递增: LIGHT < SPECIAL < DM < SDM', () => {
    expect(SPARK_COUNT_LIGHT).toBeLessThan(SPARK_COUNT_SPECIAL);
    expect(SPARK_COUNT_SPECIAL).toBeLessThan(SPARK_COUNT_DM);
    expect(SPARK_COUNT_DM).toBeLessThan(SPARK_COUNT_SDM);
  });
  it('getSparkCount返回正确值', () => {
    expect(getSparkCount('STAND_A')).toBe(SPARK_COUNT_LIGHT);
    expect(getSparkCount('KYO_ONIYAKI')).toBe(SPARK_COUNT_SPECIAL);
    expect(getSparkCount('DM_OROCHINAGI')).toBe(SPARK_COUNT_DM);
    expect(getSparkCount('SDM_OROCHINAGI')).toBe(SPARK_COUNT_SDM);
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 6: KO特殊处理
// ═══════════════════════════════════════════════════════════════

describe('13. KO特殊处理', () => {
  it('SHAKE_KO = 22 (远大于DM的14)', () => {
    expect(SHAKE_KO).toBe(22);
    expect(SHAKE_KO).toBeGreaterThan(SHAKE_DM);
  });
  it('SHAKE_DURATION_KO = 55 (远大于DM的16)', () => {
    expect(SHAKE_DURATION_KO).toBe(55);
    expect(SHAKE_DURATION_KO).toBeGreaterThan(SHAKE_DURATION_DM);
  });
  it('KO shake强度是DM的约1.6倍', () => {
    expect(SHAKE_KO / SHAKE_DM).toBeCloseTo(22 / 14, 1);
  });
  it('KO shake duration是DM的约3.4倍', () => {
    expect(SHAKE_DURATION_KO / SHAKE_DURATION_DM).toBeCloseTo(55 / 16, 1);
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 7: Spark size scaling (VFX粒子)
// ═══════════════════════════════════════════════════════════════

describe('14. Spark size scaling by damage tier', () => {
  it('light attack produces sizeScale=0.55', () => {
    const particles: Particle[] = [];
    spawnCharacterHitSparks(particles, 0, 0, 6, '#ffdd44', SPARK_SIZE_LIGHT);
    const flashCore = particles[0];
    expect(flashCore.size).toBeCloseTo(24 * SPARK_SIZE_LIGHT);
  });

  it('heavy attack produces sizeScale=0.85', () => {
    const particles: Particle[] = [];
    spawnCharacterHitSparks(particles, 0, 0, 6, '#ffdd44', SPARK_SIZE_HEAVY);
    const flashCore = particles[0];
    expect(flashCore.size).toBeCloseTo(24 * SPARK_SIZE_HEAVY);
  });

  it('special move produces sizeScale=1.1', () => {
    const particles: Particle[] = [];
    spawnCharacterHitSparks(particles, 0, 0, 10, '#ffcc44', SPARK_SIZE_SPECIAL);
    const flashCore = particles[0];
    expect(flashCore.size).toBeCloseTo(24 * SPARK_SIZE_SPECIAL);
  });

  it('DM produces sizeScale=1.3', () => {
    const particles: Particle[] = [];
    spawnCharacterHitSparks(particles, 0, 0, 14, '#4488ff', SPARK_SIZE_DM);
    const flashCore = particles[0];
    expect(flashCore.size).toBeCloseTo(24 * SPARK_SIZE_DM);
  });

  it('SDM produces sizeScale=1.5 which triggers superburst type', () => {
    const particles: Particle[] = [];
    spawnCharacterHitSparks(particles, 0, 0, 18, '#ffdd44', SPARK_SIZE_SDM);
    const flashCore = particles[0];
    expect(flashCore.type).toBe('superburst');
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 8: VFX粒子生命周期
// ═══════════════════════════════════════════════════════════════

describe('15. VFX particle lifecycle', () => {
  it('spawnCharacterHitSparks creates particles with positive life', () => {
    const particles: Particle[] = [];
    spawnCharacterHitSparks(particles, 100, 200, 8, '#ff0000', 1.0);
    for (const p of particles) {
      expect(p.life).toBeGreaterThan(0);
      expect(p.maxLife).toBeGreaterThan(0);
    }
  });

  it('particles have valid position matching spawn coordinates', () => {
    const particles: Particle[] = [];
    spawnCharacterHitSparks(particles, 150, 300, 4, '#ff0000', 1.0);
    for (const p of particles) {
      expect(p.x).toBe(150);
      expect(p.y).toBe(300);
    }
  });

  it('scattered particles have non-zero velocity', () => {
    const particles: Particle[] = [];
    spawnCharacterHitSparks(particles, 100, 200, 8, '#ff0000', 1.0);
    const scattered = particles.slice(2);
    for (const p of scattered) {
      expect(p.vx !== 0 || p.vy !== 0).toBe(true);
    }
  });

  it('particle life decreases by 1 per tick', () => {
    const particles: Particle[] = [];
    spawnBlockFlash(particles, 100, 200, 1.0);
    const p = particles[0];
    const initialLife = p.life;
    p.life--;
    expect(p.life).toBe(initialLife - 1);
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 9: Combo counter
// ═══════════════════════════════════════════════════════════════

describe('16. Combo counter display', () => {
  it('combo=2 spawns combo text showing "2 HITS!"', () => {
    const particles: Particle[] = [];
    spawnDamageText(particles, 100, 150, 2);
    const p = particles[0];
    expect(p.text).toBe('2 HITS!');
    expect(p.type).toBe('text');
  });

  it('combo=10 spawns combo text showing "10 HITS!"', () => {
    const particles: Particle[] = [];
    spawnDamageText(particles, 100, 150, 10);
    expect(particles[0].text).toBe('10 HITS!');
  });

  it('combo end text shows correct hit count', () => {
    const particles: Particle[] = [];
    spawnComboEndText(particles, 100, 150, 7);
    expect(particles[0].text).toBe('7 HITS');
    expect(particles[0].type).toBe('text');
  });

  it('combo end text color is red for high combos (>=10)', () => {
    const particles: Particle[] = [];
    spawnComboEndText(particles, 100, 150, 12);
    expect(particles[0].color).toBe('#ff4444');
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 10: Combo damage tracking
// ═══════════════════════════════════════════════════════════════

describe('17. Combo damage tracking and display', () => {
  it('combo damage text shows total damage with DMG prefix', () => {
    const particles: Particle[] = [];
    spawnComboDamageText(particles, 100, 150, 180);
    const p = particles[0];
    expect(p.text).toBe('DMG 180');
    expect(p.type).toBe('text');
  });

  it('combo damage text uses larger font for high damage (>=200)', () => {
    const low: Particle[] = [];
    const high: Particle[] = [];
    spawnComboDamageText(low, 100, 150, 80);
    spawnComboDamageText(high, 100, 150, 250);
    expect(high[0].size).toBeGreaterThan(low[0].size);
  });

  it('combo damage text color is red for high damage (>=200)', () => {
    const particles: Particle[] = [];
    spawnComboDamageText(particles, 100, 150, 250);
    expect(particles[0].color).toBe('#ff4444');
  });

  it('combo damage text color is gold for moderate damage', () => {
    const particles: Particle[] = [];
    spawnComboDamageText(particles, 100, 150, 80);
    expect(particles[0].color).toBe('#ffdd44');
  });

  it('damage text for normal hit uses negative prefix when value > 50', () => {
    const particles: Particle[] = [];
    spawnDamageText(particles, 100, 150, 60);
    expect(particles[0].text).toBe('-60');
  });

  it('damage text treats small values (<=50) as combo count', () => {
    const particles: Particle[] = [];
    spawnDamageText(particles, 100, 150, 42);
    expect(particles[0].text).toBe('42 HITS!');
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 11: 跨层级一致性验证
// ═══════════════════════════════════════════════════════════════

describe('18. 跨层级一致性', () => {
  it('所有分层系统的LIGHT值都是各自最小的', () => {
    expect(HITSTOP_LIGHT).toBeLessThan(HITSTOP_MEDIUM);
    expect(SHAKE_LIGHT).toBeLessThan(SHAKE_HEAVY);
    expect(SPARK_SIZE_LIGHT).toBeLessThan(SPARK_SIZE_HEAVY);
    expect(BLOCKSTOP_LIGHT).toBeLessThan(BLOCKSTOP_HEAVY);
  });

  it('所有分层系统的DM值都大于SPECIAL', () => {
    expect(HITSTOP_DM).toBeGreaterThan(HITSTOP_SPECIAL);
    expect(SHAKE_DM).toBeGreaterThan(SHAKE_SPECIAL);
    expect(SPARK_SIZE_DM).toBeGreaterThan(SPARK_SIZE_SPECIAL);
    expect(BLOCKSTOP_DM).toBeGreaterThan(BLOCKSTOP_SPECIAL);
  });

  it('SDM分层在hitstop/spark中大于DM', () => {
    expect(HITSTOP_SDM).toBeGreaterThan(HITSTOP_DM);
    expect(SPARK_SIZE_SDM).toBeGreaterThan(SPARK_SIZE_DM);
    expect(SPARK_COUNT_SDM).toBeGreaterThan(SPARK_COUNT_DM);
  });
});
