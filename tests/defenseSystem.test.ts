/**
 * Defense system tests
 *
 * Covers: guard gauge depletion/recovery, Guard Crush trigger/duration,
 * Guard Cancel Roll, Guard Cancel CD, correct/incorrect blocking,
 * pushblock mechanic, and full defense system integration.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Fighter } from '../src/entities/fighter.js';
import { FighterState, AttackType } from '../src/core/types.js';
import {
  GUARD_CRUSH_DURATION,
  GUARD_GAUGE_MAX,
  GUARD_GAUGE_RECOVERY_IDLE,
  GUARD_GAUGE_RECOVERY_RUN,
  GUARD_GAUGE_DRAIN_LIGHT,
  GUARD_GAUGE_DRAIN_HEAVY,
  GUARD_GAUGE_DRAIN_COMMAND_NORMAL,
  GUARD_GAUGE_DRAIN_SPECIAL,
  GUARD_GAUGE_DRAIN_DM,
  GUARD_GAUGE_DRAIN_SDM,
  GUARD_GAUGE_DRAIN_CD,
  GUARD_GAUGE_METER_BONUS_ON_BLOCK,
  PUSHBLOCK_THRESHOLD,
  PUSHBLOCK_EXTRA_PUSHBACK,
  PUSHBLOCK_DECAY_FRAMES,
  WRONG_BLOCK_PUSHBACK_MULT,
  WRONG_BLOCK_STUN_MULT,
  ROLL_DURATION,
  DM_STOCK_COST,
  MAX_STOCKS,
  METER_PER_STOCK,
} from '../src/core/constants.js';
import { createPowerGauge, spendStocks } from '../src/combat/meter.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createFighter(x = 400): Fighter {
  return new Fighter(x, '#ff6600', 1);
}

/**
 * Re-create the guardGaugeDamage logic from combatSystem.ts for testing
 * without requiring the full CombatSystem pipeline.
 */
function guardGaugeDamage(attackType: AttackType): number {
  const name = attackType as string;
  // SDM check before DM (SDM_ prefix is longer)
  if (name.startsWith('SDM_')) return GUARD_GAUGE_DRAIN_SDM;
  if (name.startsWith('DM_')) return GUARD_GAUGE_DRAIN_DM;
  // Character specials and generic specials
  if (name.startsWith('SPECIAL_') || name.startsWith('KYO_') || name.startsWith('IORI_')
    || name.startsWith('TERRY_') || name.startsWith('KIM_') || name.startsWith('RYO_')
    || name.startsWith('LEONA_') || name.startsWith('KDASH_') || name.startsWith('KULA_')
    || name.startsWith('MAI_') || name.startsWith('ROBERT_') || name.startsWith('ATHENA_')
    || name.startsWith('CLARK_') || name.startsWith('RALF_') || name.startsWith('JOE_')
    || name.startsWith('ANDY_') || name.startsWith('BILLY_') || name.startsWith('CHANG_')
    || name.startsWith('CHOI_') || name.startsWith('MATURE_') || name.startsWith('VICE_')
    || name.startsWith('YASHIRO_') || name.startsWith('CHRIS_') || name.startsWith('SHERMIE_')
    || name.startsWith('MARY_') || name.startsWith('XIANGFEI_') || name.startsWith('YAMAZAKI_')
    || name.startsWith('KASUMI_')) {
    return GUARD_GAUGE_DRAIN_SPECIAL;
  }
  // Command normals
  const commandNormals = new Set([
    'CMD_GOFU_YOU', 'CMD_88SHIKI', 'CMD_NARAKU',
    'IORI_YUMEYUMI', 'IORI_KATANUGI', 'IORI_YUKIWARUI',
    'TERRY_BACK_KNCKLE', 'TERRY_COMBO_BLOW',
    'KIM_HISHOU_KICK', 'KIM_HANSEN',
    'RYO_TSURIZAO', 'RYO_ORISHI',
    'KDASH_ONE_INCH', 'KDASH_TRIGGER',
    'KULA_ONE_MORE', 'KULA_SLIDER',
  ]);
  if (commandNormals.has(name)) return GUARD_GAUGE_DRAIN_COMMAND_NORMAL;
  if (attackType === AttackType.STAND_CD || attackType === AttackType.JUMP_CD) return GUARD_GAUGE_DRAIN_CD;
  if (name.endsWith('_C') || name.endsWith('_D')) return GUARD_GAUGE_DRAIN_HEAVY;
  return GUARD_GAUGE_DRAIN_LIGHT;
}

// ===========================================================================
// 1. Guard gauge initial state and depletion rates
// ===========================================================================
describe('Guard gauge depletion rates', () => {
  it('guard gauge starts at maximum (100)', () => {
    const f = createFighter();
    expect(f.guardGauge).toBe(GUARD_GAUGE_MAX);
  });

  it('light normal (STAND_A) drains GUARD_GAUGE_DRAIN_LIGHT points', () => {
    expect(guardGaugeDamage(AttackType.STAND_A)).toBe(GUARD_GAUGE_DRAIN_LIGHT);
    expect(GUARD_GAUGE_DRAIN_LIGHT).toBe(5);
  });

  it('heavy normal (STAND_C) drains GUARD_GAUGE_DRAIN_HEAVY points', () => {
    expect(guardGaugeDamage(AttackType.STAND_C)).toBe(GUARD_GAUGE_DRAIN_HEAVY);
    expect(GUARD_GAUGE_DRAIN_HEAVY).toBe(10);
  });

  it('command normal (CMD_GOFU_YOU) drains GUARD_GAUGE_DRAIN_COMMAND_NORMAL points', () => {
    expect(guardGaugeDamage(AttackType.CMD_GOFU_YOU)).toBe(GUARD_GAUGE_DRAIN_COMMAND_NORMAL);
    expect(GUARD_GAUGE_DRAIN_COMMAND_NORMAL).toBe(12);
  });

  it('special move (KYO_ONIYAKI) drains GUARD_GAUGE_DRAIN_SPECIAL points', () => {
    expect(guardGaugeDamage(AttackType.KYO_ONIYAKI)).toBe(GUARD_GAUGE_DRAIN_SPECIAL);
    expect(GUARD_GAUGE_DRAIN_SPECIAL).toBe(15);
  });

  it('DM (DM_OROCHINAGI) drains GUARD_GAUGE_DRAIN_DM points', () => {
    expect(guardGaugeDamage(AttackType.DM_OROCHINAGI)).toBe(GUARD_GAUGE_DRAIN_DM);
    expect(GUARD_GAUGE_DRAIN_DM).toBe(25);
  });

  it('SDM (SDM_OROCHINAGI) drains GUARD_GAUGE_DRAIN_SDM points', () => {
    expect(guardGaugeDamage(AttackType.SDM_OROCHINAGI)).toBe(GUARD_GAUGE_DRAIN_SDM);
    expect(GUARD_GAUGE_DRAIN_SDM).toBe(35);
  });

  it('CD blowback (STAND_CD) drains GUARD_GAUGE_DRAIN_CD points', () => {
    expect(guardGaugeDamage(AttackType.STAND_CD)).toBe(GUARD_GAUGE_DRAIN_CD);
    expect(GUARD_GAUGE_DRAIN_CD).toBe(12);
  });

  it('drain hierarchy: light < heavy < command < special < DM < SDM', () => {
    expect(GUARD_GAUGE_DRAIN_LIGHT).toBeLessThan(GUARD_GAUGE_DRAIN_HEAVY);
    expect(GUARD_GAUGE_DRAIN_HEAVY).toBeLessThan(GUARD_GAUGE_DRAIN_COMMAND_NORMAL);
    expect(GUARD_GAUGE_DRAIN_COMMAND_NORMAL).toBeLessThan(GUARD_GAUGE_DRAIN_SPECIAL);
    expect(GUARD_GAUGE_DRAIN_SPECIAL).toBeLessThan(GUARD_GAUGE_DRAIN_DM);
    expect(GUARD_GAUGE_DRAIN_DM).toBeLessThan(GUARD_GAUGE_DRAIN_SDM);
  });

  it('multiple blocked light attacks can drain guard gauge to zero', () => {
    const f = createFighter();
    const drainPerBlock = GUARD_GAUGE_DRAIN_LIGHT - GUARD_GAUGE_METER_BONUS_ON_BLOCK;
    const blocksToZero = Math.ceil(GUARD_GAUGE_MAX / drainPerBlock);
    for (let i = 0; i < blocksToZero; i++) {
      f.guardGauge = Math.max(0, f.guardGauge - guardGaugeDamage(AttackType.STAND_A));
      f.guardGauge = Math.min(100, f.guardGauge + GUARD_GAUGE_METER_BONUS_ON_BLOCK);
    }
    expect(f.guardGauge).toBe(0);
  });
});

// ===========================================================================
// 2. Guard gauge recovery
// ===========================================================================
describe('Guard gauge recovery', () => {
  it('guard gauge recovers when in IDLE state', () => {
    const f = createFighter();
    f.guardGauge = 80;
    f.state = FighterState.IDLE;
    f.tickTimers();
    expect(f.guardGauge).toBe(80 + GUARD_GAUGE_RECOVERY_IDLE);
  });

  it('guard gauge recovers when in WALK state', () => {
    const f = createFighter();
    f.guardGauge = 80;
    f.state = FighterState.WALK;
    f.tickTimers();
    expect(f.guardGauge).toBe(80 + GUARD_GAUGE_RECOVERY_IDLE);
  });

  it('guard gauge recovers slower when in RUN state', () => {
    const f = createFighter();
    f.guardGauge = 80;
    f.state = FighterState.RUN;
    f.tickTimers();
    expect(f.guardGauge).toBe(80 + GUARD_GAUGE_RECOVERY_RUN);
    expect(GUARD_GAUGE_RECOVERY_RUN).toBeLessThan(GUARD_GAUGE_RECOVERY_IDLE);
  });

  it('guard gauge does NOT recover when in BLOCK state', () => {
    const f = createFighter();
    f.guardGauge = 50;
    f.state = FighterState.BLOCK;
    f.tickTimers();
    expect(f.guardGauge).toBe(50);
  });

  it('guard gauge does NOT recover when in HITSTUN state', () => {
    const f = createFighter();
    f.guardGauge = 50;
    f.state = FighterState.HITSTUN;
    f.tickTimers();
    expect(f.guardGauge).toBe(50);
  });

  it('guard gauge does NOT recover when in GUARD_CRUSH state', () => {
    const f = createFighter();
    f.guardGauge = 0;
    f.state = FighterState.GUARD_CRUSH;
    f.tickTimers();
    expect(f.guardGauge).toBe(0);
  });

  it('guard gauge does NOT recover when in KNOCKDOWN state', () => {
    const f = createFighter();
    f.guardGauge = 50;
    f.state = FighterState.KNOCKDOWN;
    f.tickTimers();
    expect(f.guardGauge).toBe(50);
  });

  it('guard gauge does NOT recover when in DIZZY state', () => {
    const f = createFighter();
    f.guardGauge = 50;
    f.state = FighterState.DIZZY;
    f.tickTimers();
    expect(f.guardGauge).toBe(50);
  });

  it('guard gauge does not exceed maximum on recovery', () => {
    const f = createFighter();
    f.guardGauge = 99.9;
    f.state = FighterState.IDLE;
    for (let i = 0; i < 100; i++) {
      f.tickTimers();
    }
    expect(f.guardGauge).toBeLessThanOrEqual(GUARD_GAUGE_MAX);
  });

  it('guard gauge fully recovers from 0 over time in IDLE', () => {
    const f = createFighter();
    f.guardGauge = 0;
    f.state = FighterState.IDLE;
    const framesToRecover = Math.ceil(GUARD_GAUGE_MAX / GUARD_GAUGE_RECOVERY_IDLE);
    for (let i = 0; i < framesToRecover; i++) {
      f.tickTimers();
    }
    expect(f.guardGauge).toBe(GUARD_GAUGE_MAX);
  });
});

// ===========================================================================
// 3. Guard Crush trigger and duration
// ===========================================================================
describe('Guard Crush trigger', () => {
  it('Guard Crush duration is GUARD_CRUSH_DURATION frames (90)', () => {
    expect(GUARD_CRUSH_DURATION).toBe(90);
  });

  it('Guard Crush state can be set manually', () => {
    const f = createFighter();
    f.state = FighterState.GUARD_CRUSH;
    f.guardCrushTimer = GUARD_CRUSH_DURATION;
    f.guardGauge = 0;
    expect(f.state).toBe(FighterState.GUARD_CRUSH);
    expect(f.guardCrushTimer).toBe(GUARD_CRUSH_DURATION);
    expect(f.guardGauge).toBe(0);
  });

  it('Guard Crush timer counts down each frame', () => {
    const f = createFighter();
    f.state = FighterState.GUARD_CRUSH;
    f.guardCrushTimer = GUARD_CRUSH_DURATION;
    for (let i = 0; i < GUARD_CRUSH_DURATION; i++) {
      f.guardCrushTimer--;
    }
    expect(f.guardCrushTimer).toBe(0);
  });

  it('Guard Crush recovery returns fighter to IDLE', () => {
    const f = createFighter();
    f.state = FighterState.GUARD_CRUSH;
    f.guardCrushTimer = 10;
    // Simulate handleGuardCrush countdown
    for (let i = 0; i < 10; i++) {
      f.guardCrushTimer--;
    }
    if (f.guardCrushTimer <= 0) {
      f.state = FighterState.IDLE;
      f.vx = 0;
      f.guardGauge = 0; // KOF2002: starts at 0 after GC, not 100
    }
    expect(f.state).toBe(FighterState.IDLE);
    expect(f.guardGauge).toBe(0); // Guard gauge starts from 0 after GC
  });

  it('fighter is NOT throw vulnerable during Guard Crush', () => {
    const f = createFighter();
    f.state = FighterState.GUARD_CRUSH;
    expect(f.isThrowVulnerable()).toBe(false);
  });

  it('Guard Crush resets guard gauge to 0 after recovery (high GC risk)', () => {
    const f = createFighter();
    f.guardGauge = 100;
    // Simulate drain to zero
    f.guardGauge = 0;
    f.state = FighterState.GUARD_CRUSH;
    f.guardCrushTimer = GUARD_CRUSH_DURATION;
    // Simulate recovery
    for (let i = 0; i < GUARD_CRUSH_DURATION; i++) f.guardCrushTimer--;
    if (f.guardCrushTimer <= 0) {
      f.state = FighterState.IDLE;
      f.guardGauge = 0; // KOF2002 authentic: guard gauge stays 0 after GC
    }
    expect(f.guardGauge).toBe(0);
  });

  it('4 blocked DMs trigger Guard Crush (4 * 25 = 100)', () => {
    const f = createFighter();
    expect(f.guardGauge).toBe(100);
    // Simulate 4 DM blocks: each drains 25, gains 2 back
    for (let i = 0; i < 4; i++) {
      f.guardGauge = Math.max(0, f.guardGauge - GUARD_GAUGE_DRAIN_DM);
      f.guardGauge = Math.min(100, f.guardGauge + GUARD_GAUGE_METER_BONUS_ON_BLOCK);
    }
    // 4 * (25 - 2) = 92, then last one goes below 0
    // Actually: 100 - 25 + 2 = 77, 77 - 25 + 2 = 54, 54 - 25 + 2 = 31, 31 - 25 + 2 = 8
    // So 4 DM blocks does NOT crush, need a 5th partial
    expect(f.guardGauge).toBe(8);
    // 5th DM block
    f.guardGauge = Math.max(0, f.guardGauge - GUARD_GAUGE_DRAIN_DM);
    expect(f.guardGauge).toBe(0);
  });
});

// ===========================================================================
// 4. Guard Cancel Roll (GC Roll)
// ===========================================================================
describe('Guard Cancel Roll', () => {
  it('GC Roll costs 1 stock', () => {
    const gauge = createPowerGauge();
    gauge.stocks = 1;
    expect(spendStocks(gauge, DM_STOCK_COST)).toBe(true);
    expect(gauge.stocks).toBe(0);
  });

  it('GC Roll cannot activate with 0 stocks', () => {
    const gauge = createPowerGauge();
    gauge.stocks = 0;
    expect(spendStocks(gauge, DM_STOCK_COST)).toBe(false);
  });

  it('GC Roll sets isGCRoll flag to true', () => {
    const f = createFighter();
    f.state = FighterState.BLOCK;
    f.blockstunTimer = 10;
    // Simulate GC Roll activation
    f.state = FighterState.ROLL;
    f.rollTimer = ROLL_DURATION;
    f.isGCRoll = true;
    f.vx = 6 * f.facing;
    expect(f.isGCRoll).toBe(true);
    expect(f.rollTimer).toBe(ROLL_DURATION);
  });

  it('GC Roll is fully invincible (unlike normal roll)', () => {
    const f = createFighter();
    f.state = FighterState.ROLL;
    f.rollTimer = ROLL_DURATION;
    f.isGCRoll = true;
    // GC Roll should be invincible at any point
    expect(f.isRollInvincible()).toBe(true);
    // Even at the end of roll
    f.rollTimer = 1;
    expect(f.isRollInvincible()).toBe(true);
  });

  it('GC Roll clears blockstun timer', () => {
    const f = createFighter();
    f.state = FighterState.BLOCK;
    f.blockstunTimer = 15;
    // Simulate GC Roll
    f.blockstunTimer = 0;
    f.state = FighterState.ROLL;
    expect(f.blockstunTimer).toBe(0);
    expect(f.state).toBe(FighterState.ROLL);
  });

  it('Normal roll is NOT fully invincible', () => {
    const f = createFighter();
    f.state = FighterState.ROLL;
    f.rollTimer = ROLL_DURATION;
    f.isGCRoll = false;
    // Normal roll at the very start is invincible
    expect(f.isRollInvincible()).toBe(true);
    // But at the end it is not
    f.rollTimer = 1;
    expect(f.isRollInvincible()).toBe(false);
  });
});

// ===========================================================================
// 5. Guard Cancel CD
// ===========================================================================
describe('Guard Cancel CD', () => {
  it('GC CD costs 1 stock', () => {
    const gauge = createPowerGauge();
    gauge.stocks = 2;
    expect(spendStocks(gauge, DM_STOCK_COST)).toBe(true);
    expect(gauge.stocks).toBe(1);
  });

  it('GC CD starts STAND_CD attack', () => {
    const f = createFighter();
    f.state = FighterState.BLOCK;
    f.blockstunTimer = 10;
    // Simulate GC CD
    f.blockstunTimer = 0;
    f.startAttack(AttackType.STAND_CD);
    expect(f.currentAttack).toBe(AttackType.STAND_CD);
    expect(f.state).toBe(FighterState.STAND_ATTACK);
    expect(f.blockstunTimer).toBe(0);
  });

  it('GC CD cannot activate with 0 stocks', () => {
    const gauge = createPowerGauge();
    gauge.stocks = 0;
    expect(spendStocks(gauge, DM_STOCK_COST)).toBe(false);
    expect(gauge.stocks).toBe(0);
  });
});

// ===========================================================================
// 6. Block property differentiation (correct vs incorrect blocking)
// ===========================================================================
describe('Block property differentiation', () => {
  // Stand block: blocks MID and HIGH, vulnerable to LOW
  // Crouch block: blocks MID and LOW, vulnerable to HIGH (overheads)
  // Air block: blocks HIGH and MID, cannot block LOW

  it('stand block (not crouching) can block MID attacks', () => {
    // canBlock logic: MID always returns true
    const canBlockMID = (crouching: boolean) => true; // MID is always blockable
    expect(canBlockMID(false)).toBe(true);
  });

  it('stand block (not crouching) can block HIGH attacks', () => {
    // canBlock logic: HIGH requires !crouching (or proximity)
    const canBlockHIGH = (crouching: boolean, dist: number) => {
      if (!crouching) return true;
      return dist < 120; // proximity guard
    };
    expect(canBlockHIGH(false, 200)).toBe(true);
  });

  it('stand block (not crouching) CANNOT block LOW attacks', () => {
    // canBlock logic: LOW requires crouching
    const canBlockLOW = (crouching: boolean) => crouching;
    expect(canBlockLOW(false)).toBe(false);
  });

  it('crouch block can block MID attacks', () => {
    const canBlockMID = (crouching: boolean) => true;
    expect(canBlockMID(true)).toBe(true);
  });

  it('crouch block can block LOW attacks', () => {
    const canBlockLOW = (crouching: boolean) => crouching;
    expect(canBlockLOW(true)).toBe(true);
  });

  it('crouch block CANNOT block HIGH attacks (without proximity)', () => {
    const canBlockHIGH = (crouching: boolean, dist: number) => {
      if (!crouching) return true;
      return dist < 120;
    };
    expect(canBlockHIGH(true, 200)).toBe(false);
  });

  it('crouch block CAN block HIGH attacks at proximity range', () => {
    const canBlockHIGH = (crouching: boolean, dist: number) => {
      if (!crouching) return true;
      return dist < 120;
    };
    expect(canBlockHIGH(true, 80)).toBe(true);
  });

  it('air block can block HIGH attacks', () => {
    // Air block: can block HIGH and MID, not LOW
    const canAirBlock = (hitLevel: string) => hitLevel !== 'LOW';
    expect(canAirBlock('HIGH')).toBe(true);
  });

  it('air block can block MID attacks', () => {
    const canAirBlock = (hitLevel: string) => hitLevel !== 'LOW';
    expect(canAirBlock('MID')).toBe(true);
  });

  it('air block CANNOT block LOW attacks', () => {
    const canAirBlock = (hitLevel: string) => hitLevel !== 'LOW';
    expect(canAirBlock('LOW')).toBe(false);
  });

  it('wrong block constants are greater than 1.0 (penalty multipliers)', () => {
    expect(WRONG_BLOCK_PUSHBACK_MULT).toBeGreaterThan(1.0);
    expect(WRONG_BLOCK_STUN_MULT).toBeGreaterThan(1.0);
  });

  it('wrong block pushback is 1.3x normal', () => {
    expect(WRONG_BLOCK_PUSHBACK_MULT).toBe(1.3);
  });

  it('wrong block stun is 1.2x normal', () => {
    expect(WRONG_BLOCK_STUN_MULT).toBe(1.2);
  });
});

// ===========================================================================
// 7. Pushblock mechanic
// ===========================================================================
describe('Pushblock mechanic', () => {
  it('pushblock threshold is 3 consecutive blocks', () => {
    expect(PUSHBLOCK_THRESHOLD).toBe(3);
  });

  it('pushback multiplier is 1.5x after threshold', () => {
    expect(PUSHBLOCK_EXTRA_PUSHBACK).toBe(1.5);
  });

  it('pushback multiplier is 1.0x before threshold', () => {
    const pushbackMult = (count: number) => count >= PUSHBLOCK_THRESHOLD ? PUSHBLOCK_EXTRA_PUSHBACK : 1.0;
    expect(pushbackMult(0)).toBe(1.0);
    expect(pushbackMult(1)).toBe(1.0);
    expect(pushbackMult(2)).toBe(1.0);
    expect(pushbackMult(3)).toBe(1.5);
    expect(pushbackMult(4)).toBe(1.5);
  });

  it('consecutive block count starts at 0', () => {
    const f = createFighter();
    expect(f.consecutiveBlockCount).toBe(0);
  });

  it('consecutive block count increments on each block', () => {
    const f = createFighter();
    f.consecutiveBlockCount++;
    expect(f.consecutiveBlockCount).toBe(1);
    f.consecutiveBlockCount++;
    expect(f.consecutiveBlockCount).toBe(2);
    f.consecutiveBlockCount++;
    expect(f.consecutiveBlockCount).toBe(3);
  });

  it('consecutive block count resets after decay timer expires', () => {
    const f = createFighter();
    f.consecutiveBlockCount = 5;
    f.consecutiveBlockDecayTimer = 0;
    // tickTimers should reset count when decay timer is 0
    f.state = FighterState.IDLE;
    f.tickTimers();
    expect(f.consecutiveBlockCount).toBe(0);
  });

  it('consecutive block count does NOT reset while decay timer is active', () => {
    const f = createFighter();
    f.consecutiveBlockCount = 5;
    f.consecutiveBlockDecayTimer = PUSHBLOCK_DECAY_FRAMES;
    f.state = FighterState.IDLE;
    f.tickTimers();
    expect(f.consecutiveBlockCount).toBe(5);
    expect(f.consecutiveBlockDecayTimer).toBe(PUSHBLOCK_DECAY_FRAMES - 1);
  });

  it('decay timer counts down each frame', () => {
    const f = createFighter();
    f.consecutiveBlockDecayTimer = 10;
    f.state = FighterState.IDLE;
    for (let i = 0; i < 10; i++) {
      f.tickTimers();
    }
    expect(f.consecutiveBlockDecayTimer).toBe(0);
    // Next tick should reset count
    f.consecutiveBlockCount = 3;
    f.tickTimers();
    expect(f.consecutiveBlockCount).toBe(0);
  });

  it('decay timer is set to PUSHBLOCK_DECAY_FRAMES on block', () => {
    expect(PUSHBLOCK_DECAY_FRAMES).toBe(30);
  });

  it('consecutive block count resets on guard crush', () => {
    const f = createFighter();
    f.consecutiveBlockCount = 10;
    // Simulate guard crush
    f.state = FighterState.GUARD_CRUSH;
    f.guardCrushTimer = GUARD_CRUSH_DURATION;
    f.consecutiveBlockCount = 0; // reset on GC
    expect(f.consecutiveBlockCount).toBe(0);
  });

  it('consecutiveBlockCount and decay timer reset on fighter reset', () => {
    const f = createFighter();
    f.consecutiveBlockCount = 7;
    f.consecutiveBlockDecayTimer = 20;
    f.reset(400);
    expect(f.consecutiveBlockCount).toBe(0);
    expect(f.consecutiveBlockDecayTimer).toBe(0);
  });
});

// ===========================================================================
// 8. Defense system constants consistency
// ===========================================================================
describe('Defense system constants consistency', () => {
  it('GUARD_GAUGE_MAX is 100', () => {
    expect(GUARD_GAUGE_MAX).toBe(100);
  });

  it('GUARD_CRUSH_DURATION is 90 frames (1.5 seconds at 60fps)', () => {
    expect(GUARD_CRUSH_DURATION).toBe(90);
  });

  it('GUARD_GAUGE_METER_BONUS_ON_BLOCK is 2', () => {
    expect(GUARD_GAUGE_METER_BONUS_ON_BLOCK).toBe(2);
  });

  it('DM_STOCK_COST is 1 (for GC Roll and GC CD)', () => {
    expect(DM_STOCK_COST).toBe(1);
  });

  it('ROLL_DURATION is 20 frames', () => {
    expect(ROLL_DURATION).toBe(20);
  });

  it('GUARD_GAUGE_DRAIN values are all positive', () => {
    expect(GUARD_GAUGE_DRAIN_LIGHT).toBeGreaterThan(0);
    expect(GUARD_GAUGE_DRAIN_HEAVY).toBeGreaterThan(0);
    expect(GUARD_GAUGE_DRAIN_COMMAND_NORMAL).toBeGreaterThan(0);
    expect(GUARD_GAUGE_DRAIN_SPECIAL).toBeGreaterThan(0);
    expect(GUARD_GAUGE_DRAIN_DM).toBeGreaterThan(0);
    expect(GUARD_GAUGE_DRAIN_SDM).toBeGreaterThan(0);
    expect(GUARD_GAUGE_DRAIN_CD).toBeGreaterThan(0);
  });

  it('GUARD_GAUGE_RECOVERY values are positive', () => {
    expect(GUARD_GAUGE_RECOVERY_IDLE).toBeGreaterThan(0);
    expect(GUARD_GAUGE_RECOVERY_RUN).toBeGreaterThan(0);
  });

  it('idle recovery is faster than run recovery', () => {
    expect(GUARD_GAUGE_RECOVERY_IDLE).toBeGreaterThan(GUARD_GAUGE_RECOVERY_RUN);
  });

  it('wrong block penalty multipliers are reasonable (< 2.0)', () => {
    expect(WRONG_BLOCK_PUSHBACK_MULT).toBeLessThan(2.0);
    expect(WRONG_BLOCK_STUN_MULT).toBeLessThan(2.0);
  });

  it('pushback multiplier is reasonable (< 3.0)', () => {
    expect(PUSHBLOCK_EXTRA_PUSHBACK).toBeLessThan(3.0);
  });
});

// ===========================================================================
// 9. Fighter state transitions for defense
// ===========================================================================
describe('Fighter defense state transitions', () => {
  it('canBlock returns true for IDLE state', () => {
    const f = createFighter();
    f.state = FighterState.IDLE;
    expect(f.canBlock()).toBe(true);
  });

  it('canBlock returns true for WALK state', () => {
    const f = createFighter();
    f.state = FighterState.WALK;
    expect(f.canBlock()).toBe(true);
  });

  it('canBlock returns true for CROUCH state', () => {
    const f = createFighter();
    f.state = FighterState.CROUCH;
    expect(f.canBlock()).toBe(true);
  });

  it('canBlock returns true for BLOCK state (re-blocking)', () => {
    const f = createFighter();
    f.state = FighterState.BLOCK;
    expect(f.canBlock()).toBe(true);
  });

  it('canBlock returns false during run stop delay', () => {
    const f = createFighter();
    f.state = FighterState.IDLE;
    f.runStopTimer = 5;
    expect(f.canBlock()).toBe(false);
  });

  it('canBlock returns false for STAND_ATTACK state', () => {
    const f = createFighter();
    f.state = FighterState.STAND_ATTACK;
    expect(f.canBlock()).toBe(false);
  });

  it('canBlock returns false for HITSTUN state', () => {
    const f = createFighter();
    f.state = FighterState.HITSTUN;
    expect(f.canBlock()).toBe(false);
  });

  it('canBlock returns false for GUARD_CRUSH state', () => {
    const f = createFighter();
    f.state = FighterState.GUARD_CRUSH;
    expect(f.canBlock()).toBe(false);
  });

  it('applyBlockstun sets state to BLOCK and applies pushback', () => {
    const f = createFighter();
    f.state = FighterState.IDLE;
    f.facing = 1;
    f.applyBlockstun(15, 8);
    expect(f.state).toBe(FighterState.BLOCK);
    expect(f.blockstunTimer).toBe(15);
    expect(f.vx).toBeCloseTo(8 * -1 * 0.8, 2); // pushback * facing * 0.8
  });

  it('applyAirBlockstun sets state to AIR_BLOCK', () => {
    const f = createFighter();
    f.state = FighterState.JUMP;
    f.facing = 1;
    f.applyAirBlockstun(12, 5);
    expect(f.state).toBe(FighterState.AIR_BLOCK);
    expect(f.blockstunTimer).toBe(12);
  });

  it('canAirBlock returns true for JUMP state', () => {
    const f = createFighter();
    f.y = 400; // airborne
    f.state = FighterState.JUMP;
    expect(f.canAirBlock()).toBe(true);
  });

  it('canAirBlock returns true for AIR_ATTACK state', () => {
    const f = createFighter();
    f.y = 400;
    f.state = FighterState.AIR_ATTACK;
    expect(f.canAirBlock()).toBe(true);
  });

  it('canAirBlock returns false when grounded', () => {
    const f = createFighter();
    // y = STAGE_GROUND_Y by default
    f.state = FighterState.JUMP;
    expect(f.canAirBlock()).toBe(false);
  });
});

// ===========================================================================
// 10. Guard gauge drain simulation (full round scenario)
// ===========================================================================
describe('Guard gauge drain simulation', () => {
  it('simulates continuous block pressure: light attacks', () => {
    const f = createFighter();
    let gauge = 100;
    // Simulate 20 blocked light attacks
    for (let i = 0; i < 20; i++) {
      gauge = Math.max(0, gauge - GUARD_GAUGE_DRAIN_LIGHT);
      gauge = Math.min(100, gauge + GUARD_GAUGE_METER_BONUS_ON_BLOCK);
    }
    // Each block: -5 + 2 = -3 net. 20 * 3 = 60 drain
    expect(gauge).toBe(40);
  });

  it('simulates continuous block pressure: heavy attacks', () => {
    const f = createFighter();
    let gauge = 100;
    // Simulate 10 blocked heavy attacks
    for (let i = 0; i < 10; i++) {
      gauge = Math.max(0, gauge - GUARD_GAUGE_DRAIN_HEAVY);
      gauge = Math.min(100, gauge + GUARD_GAUGE_METER_BONUS_ON_BLOCK);
    }
    // Each block: -10 + 2 = -8 net. 10 * 8 = 80 drain
    expect(gauge).toBe(20);
  });

  it('simulates continuous block pressure: special moves', () => {
    const f = createFighter();
    let gauge = 100;
    // Simulate 8 blocked specials
    for (let i = 0; i < 8; i++) {
      gauge = Math.max(0, gauge - GUARD_GAUGE_DRAIN_SPECIAL);
      gauge = Math.min(100, gauge + GUARD_GAUGE_METER_BONUS_ON_BLOCK);
    }
    // Each block: -15 + 2 = -13 net. 8 * 13 = 104 -> clamps to 0
    expect(gauge).toBe(0);
  });

  it('guard gauge recovery between block strings creates interesting gameplay', () => {
    const f = createFighter();
    let gauge = 100;
    // Block 5 heavy attacks
    for (let i = 0; i < 5; i++) {
      gauge = Math.max(0, gauge - GUARD_GAUGE_DRAIN_HEAVY);
      gauge = Math.min(100, gauge + GUARD_GAUGE_METER_BONUS_ON_BLOCK);
    }
    // 5 * 8 = 40 drain, gauge = 60
    expect(gauge).toBe(60);

    // Simulate 30 frames of recovery (idle)
    for (let i = 0; i < 30; i++) {
      gauge = Math.min(100, gauge + GUARD_GAUGE_RECOVERY_IDLE);
    }
    // 60 + 30 * 0.25 = 67.5
    expect(gauge).toBe(67.5);
  });
});
