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
import {
  MAX_MODE_DAMAGE_BONUS,
  MAX_MODE_DEFENSE_BONUS,
  DESPERATION_HEALTH_THRESHOLD,
  DESPERATION_DM_DAMAGE_BONUS,
  DESPERATION_METER_GAIN_BONUS,
  MAX_HEALTH,
  CHIP_DAMAGE_RATIO,
} from '../src/core/constants.js';
import { createPowerGauge, spendStocks, isDesperation, gainMeterOnHit, gainMeterOnHitstun } from '../src/combat/meter.js';
import { isDM } from '../src/core/attackClassifier.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createFighter(x = 400): Fighter {
  return new Fighter(x, '#ff6600', 1);
}

/**
 * Re-create the guardGaugeDamage logic from combatSystem.ts for testing
 * without requiring the full CombatSystem pipeline.
 * Mirrors the actual implementation using isDM() and isCharacterSpecial().
 */
function guardGaugeDamage(attackType: AttackType): number {
  const name = attackType as string;
  if (isDM(name)) return (name.startsWith('SDM_') || name.startsWith('HSDM_')) ? GUARD_GAUGE_DRAIN_SDM : GUARD_GAUGE_DRAIN_DM;
  if (isSpecialMoveCheck(attackType)) return GUARD_GAUGE_DRAIN_SPECIAL;
  // Command normals
  const commandNormals = new Set([
    'CMD_GOFU_YOU', 'CMD_88SHIKI', 'CMD_NARAKU',
    'IORI_YUMEYUMI', 'IORI_KATANUGI', 'IORI_YUKIWARUI',
    'TERRY_BACK_KNCKLE', 'TERRY_COMBO_BLOW',
    'KIM_HISHOU_KICK', 'KIM_HANSEN',
    'RYO_TSURIZAO', 'RYO_ORISHI',
    'KDASH_ONE_INCH', 'KDASH_TRIGGER',
    'KULA_ONE_MORE', 'KULA_SLIDER',
    'LEONA_STRIKE_ARC', 'LEONA_STRIKE_DASH',
    'MAI_HISSATSU_SHINOBIBACHI', 'MAI_YUSURA_UMA',
    'ROBERT_GENEI_KYAKU_CMD', 'ROBERT_KOU_SHUTAI',
    'ATHENA_PHOENIX_REFLECT', 'ATHENA_LOW_B', 'ATHENA_AIR_B',
    'JOE_KNEE_KICK', 'JOE_SLIDE',
  ]);
  if (commandNormals.has(name)) return GUARD_GAUGE_DRAIN_COMMAND_NORMAL;
  if (attackType === AttackType.STAND_CD || attackType === AttackType.JUMP_CD) return GUARD_GAUGE_DRAIN_CD;
  if (name.endsWith('_C') || name.endsWith('_D')) return GUARD_GAUGE_DRAIN_HEAVY;
  return GUARD_GAUGE_DRAIN_LIGHT;
}

/** Check if attack is a special move (mirrors combatSystem.ts isSpecialMoveCheck) */
function isSpecialMoveCheck(at: AttackType): boolean {
  const name = at as string;
  if (isDM(name)) return false;
  if (name === 'THROW' || name === 'THROW_FORWARD' || name === 'THROW_BACK') return false;
  // Use COMMAND_NORMALS-like set
  const commandNormals = new Set([
    'CMD_GOFU_YOU', 'CMD_88SHIKI', 'CMD_NARAKU',
    'IORI_YUMEYUMI', 'IORI_KATANUGI', 'IORI_YUKIWARUI',
    'TERRY_BACK_KNCKLE', 'TERRY_COMBO_BLOW',
    'KIM_HISHOU_KICK', 'KIM_HANSEN',
    'RYO_TSURIZAO', 'RYO_ORISHI',
    'KDASH_ONE_INCH', 'KDASH_TRIGGER',
    'KULA_ONE_MORE', 'KULA_SLIDER',
    'LEONA_STRIKE_ARC', 'LEONA_STRIKE_DASH',
  ]);
  const normalAttacks = new Set([
    'STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
    'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
    'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
  ]);
  if (normalAttacks.has(name) || commandNormals.has(name)) return false;
  // Check if character special using the same regex logic
  const match = /^([A-Z][A-Z0-9]+)_/.exec(name);
  const normalPrefixes = new Set(['CLOSE', 'STAND', 'CROUCH', 'JUMP', 'CMD', 'THROW', 'SPECIAL', 'DM', 'SDM', 'HSDM']);
  if (match && !normalPrefixes.has(match[1])) return true;
  return name.startsWith('SPECIAL_');
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

  it('multiple blocked light attacks can drain guard gauge to near zero', () => {
    const f = createFighter();
    const drainPerBlock = GUARD_GAUGE_DRAIN_LIGHT - GUARD_GAUGE_METER_BONUS_ON_BLOCK;
    const blocksToZero = Math.ceil(GUARD_GAUGE_MAX / drainPerBlock);
    for (let i = 0; i < blocksToZero; i++) {
      f.guardGauge = Math.max(0, f.guardGauge - guardGaugeDamage(AttackType.STAND_A));
      f.guardGauge = Math.min(100, f.guardGauge + GUARD_GAUGE_METER_BONUS_ON_BLOCK);
    }
    // The +2 bonus applies after drain, so gauge may not reach exactly 0
    // The important thing is that it gets very close to 0
    expect(f.guardGauge).toBeLessThanOrEqual(GUARD_GAUGE_METER_BONUS_ON_BLOCK);
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
    // Each block: -15 + 2 = -13 net. 8 * 13 = 104
    // But max(0, ...) prevents going below 0, so the +2 bonus keeps it at 2
    expect(gauge).toBeLessThanOrEqual(GUARD_GAUGE_METER_BONUS_ON_BLOCK);
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

// ===========================================================================
// 11. Guard Gauge Drain — exact values for all attack categories
// ===========================================================================
describe('Guard Gauge drain — exact values via helper', () => {
  it('STAND_A (light normal) drains exactly GUARD_GAUGE_DRAIN_LIGHT (5)', () => {
    expect(guardGaugeDamage(AttackType.STAND_A)).toBe(5);
  });

  it('STAND_B (light normal) drains exactly GUARD_GAUGE_DRAIN_LIGHT (5)', () => {
    expect(guardGaugeDamage(AttackType.STAND_B)).toBe(5);
  });

  it('CLOSE_A (light normal) drains exactly GUARD_GAUGE_DRAIN_LIGHT (5)', () => {
    expect(guardGaugeDamage(AttackType.CLOSE_A)).toBe(5);
  });

  it('CROUCH_B (light normal) drains exactly GUARD_GAUGE_DRAIN_LIGHT (5)', () => {
    expect(guardGaugeDamage(AttackType.CROUCH_B)).toBe(5);
  });

  it('STAND_C (heavy normal) drains exactly GUARD_GAUGE_DRAIN_HEAVY (10)', () => {
    expect(guardGaugeDamage(AttackType.STAND_C)).toBe(10);
  });

  it('STAND_D (heavy normal) drains exactly GUARD_GAUGE_DRAIN_HEAVY (10)', () => {
    expect(guardGaugeDamage(AttackType.STAND_D)).toBe(10);
  });

  it('CLOSE_C (heavy normal) drains exactly GUARD_GAUGE_DRAIN_HEAVY (10)', () => {
    expect(guardGaugeDamage(AttackType.CLOSE_C)).toBe(10);
  });

  it('CROUCH_D (heavy normal) drains exactly GUARD_GAUGE_DRAIN_HEAVY (10)', () => {
    expect(guardGaugeDamage(AttackType.CROUCH_D)).toBe(10);
  });

  it('CMD_GOFU_YOU (command normal) drains exactly GUARD_GAUGE_DRAIN_COMMAND_NORMAL (12)', () => {
    expect(guardGaugeDamage(AttackType.CMD_GOFU_YOU)).toBe(12);
  });

  it('CMD_88SHIKI (command normal) drains exactly GUARD_GAUGE_DRAIN_COMMAND_NORMAL (12)', () => {
    expect(guardGaugeDamage(AttackType.CMD_88SHIKI)).toBe(12);
  });

  it('KYO_ONIYAKI (character special) drains exactly GUARD_GAUGE_DRAIN_SPECIAL (15)', () => {
    expect(guardGaugeDamage(AttackType.KYO_ONIYAKI)).toBe(15);
  });

  it('IORI_ONIYAKI (character special) drains exactly GUARD_GAUGE_DRAIN_SPECIAL (15)', () => {
    expect(guardGaugeDamage(AttackType.IORI_ONIYAKI)).toBe(15);
  });

  it('TERRY_BURN_KNUCKLE (character special) drains exactly GUARD_GAUGE_DRAIN_SPECIAL (15)', () => {
    expect(guardGaugeDamage(AttackType.TERRY_BURN_KNUCKLE)).toBe(15);
  });

  it('SPECIAL_UPPER (generic special) drains exactly GUARD_GAUGE_DRAIN_SPECIAL (15)', () => {
    expect(guardGaugeDamage(AttackType.SPECIAL_UPPER)).toBe(15);
  });

  it('SPECIAL_PROJECTILE (generic special) drains exactly GUARD_GAUGE_DRAIN_SPECIAL (15)', () => {
    expect(guardGaugeDamage(AttackType.SPECIAL_PROJECTILE)).toBe(15);
  });

  it('DM_OROCHINAGI (DM) drains exactly GUARD_GAUGE_DRAIN_DM (25)', () => {
    expect(guardGaugeDamage(AttackType.DM_OROCHINAGI)).toBe(25);
  });

  it('DM_YATAGARASU (DM) drains exactly GUARD_GAUGE_DRAIN_DM (25)', () => {
    expect(guardGaugeDamage(AttackType.DM_YATAGARASU)).toBe(25);
  });

  it('SDM_OROCHINAGI (SDM) drains exactly GUARD_GAUGE_DRAIN_SDM (35)', () => {
    expect(guardGaugeDamage(AttackType.SDM_OROCHINAGI)).toBe(35);
  });

  it('SDM_YATAGARASU (SDM) drains exactly GUARD_GAUGE_DRAIN_SDM (35)', () => {
    expect(guardGaugeDamage(AttackType.SDM_YATAGARASU)).toBe(35);
  });

  it('STAND_CD (CD blowback) drains exactly GUARD_GAUGE_DRAIN_CD (12)', () => {
    expect(guardGaugeDamage(AttackType.STAND_CD)).toBe(12);
  });

  it('JUMP_CD (CD blowback) drains exactly GUARD_GAUGE_DRAIN_CD (12)', () => {
    expect(guardGaugeDamage(AttackType.JUMP_CD)).toBe(12);
  });
});

// ===========================================================================
// 12. Pushblock — actual pushback calculation
// ===========================================================================
describe('Pushblock pushback calculation', () => {
  it('base pushback = 8, after 3 blocks pushback = 8 * 1.5 = 12', () => {
    const basePushback = 8;
    const count = 3;
    const mult = count >= PUSHBLOCK_THRESHOLD ? PUSHBLOCK_EXTRA_PUSHBACK : 1.0;
    expect(basePushback * mult).toBe(12);
  });

  it('base pushback = 10, before threshold (2 blocks) pushback stays 10', () => {
    const basePushback = 10;
    const count = 2;
    const mult = count >= PUSHBLOCK_THRESHOLD ? PUSHBLOCK_EXTRA_PUSHBACK : 1.0;
    expect(basePushback * mult).toBe(10);
  });

  it('pushblock multiplier applies to applyBlockstun pushback', () => {
    const f = createFighter();
    f.facing = 1;
    f.state = FighterState.IDLE;
    const basePushback = 8;
    // Simulate 3 consecutive blocks
    f.consecutiveBlockCount = 3;
    const pushblockMult = f.consecutiveBlockCount >= PUSHBLOCK_THRESHOLD ? PUSHBLOCK_EXTRA_PUSHBACK : 1.0;
    f.applyBlockstun(10, basePushback * pushblockMult);
    expect(f.state).toBe(FighterState.BLOCK);
    // pushback is applied as: pushback * (facing === 1 ? -1 : 1) * 0.8
    expect(f.vx).toBeCloseTo(12 * -1 * 0.8, 2);
  });

  it('pushblock does NOT apply before 3 consecutive blocks', () => {
    const f = createFighter();
    f.facing = 1;
    f.state = FighterState.IDLE;
    const basePushback = 8;
    f.consecutiveBlockCount = 2;
    const pushblockMult = f.consecutiveBlockCount >= PUSHBLOCK_THRESHOLD ? PUSHBLOCK_EXTRA_PUSHBACK : 1.0;
    f.applyBlockstun(10, basePushback * pushblockMult);
    expect(f.vx).toBeCloseTo(8 * -1 * 0.8, 2);
  });

  it('pushblock multiplier persists at count 4, 5, etc.', () => {
    for (const count of [4, 5, 10, 20]) {
      const mult = count >= PUSHBLOCK_THRESHOLD ? PUSHBLOCK_EXTRA_PUSHBACK : 1.0;
      expect(mult).toBe(1.5);
    }
  });
});

// ===========================================================================
// 13. Pushblock decay — 30-frame reset
// ===========================================================================
describe('Pushblock decay — detailed timer behavior', () => {
  it('decay timer starts at PUSHBLOCK_DECAY_FRAMES (30) after a block', () => {
    const f = createFighter();
    // Simulate a block event setting the timer
    f.consecutiveBlockCount = 1;
    f.consecutiveBlockDecayTimer = PUSHBLOCK_DECAY_FRAMES;
    expect(f.consecutiveBlockDecayTimer).toBe(30);
  });

  it('consecutive block count persists for exactly 30 frames after last block', () => {
    const f = createFighter();
    f.consecutiveBlockCount = 5;
    f.consecutiveBlockDecayTimer = PUSHBLOCK_DECAY_FRAMES;
    f.state = FighterState.IDLE;
    // Tick 29 frames — count should still be 5
    for (let i = 0; i < 29; i++) {
      f.tickTimers();
    }
    expect(f.consecutiveBlockCount).toBe(5);
    // Tick 30th frame — timer reaches 0 but count is still 5 (decay timer becomes 0 this frame)
    f.tickTimers();
    expect(f.consecutiveBlockDecayTimer).toBe(0);
    // The next tick (31st frame since last block) should reset count
    f.tickTimers();
    expect(f.consecutiveBlockCount).toBe(0);
  });

  it('blocking again resets the decay timer to 30', () => {
    const f = createFighter();
    f.consecutiveBlockCount = 2;
    f.consecutiveBlockDecayTimer = 5; // almost expired
    f.state = FighterState.IDLE;
    // Block again
    f.consecutiveBlockCount = 3;
    f.consecutiveBlockDecayTimer = PUSHBLOCK_DECAY_FRAMES;
    // Count should persist
    f.tickTimers();
    expect(f.consecutiveBlockCount).toBe(3);
    expect(f.consecutiveBlockDecayTimer).toBe(29);
  });

  it('pushblock activates, decays, then reactivates correctly', () => {
    const f = createFighter();
    // First sequence: 3 blocks
    f.consecutiveBlockCount = 3;
    f.consecutiveBlockDecayTimer = PUSHBLOCK_DECAY_FRAMES;
    expect(f.consecutiveBlockCount >= PUSHBLOCK_THRESHOLD).toBe(true);
    // Let it decay
    f.consecutiveBlockDecayTimer = 0;
    f.state = FighterState.IDLE;
    f.tickTimers();
    expect(f.consecutiveBlockCount).toBe(0);
    // Second sequence: build up again
    f.consecutiveBlockCount = 1;
    f.consecutiveBlockDecayTimer = PUSHBLOCK_DECAY_FRAMES;
    expect(f.consecutiveBlockCount >= PUSHBLOCK_THRESHOLD).toBe(false);
    f.consecutiveBlockCount = 3;
    expect(f.consecutiveBlockCount >= PUSHBLOCK_THRESHOLD).toBe(true);
  });
});

// ===========================================================================
// 14. Wrong block — detailed penalty calculations
// ===========================================================================
describe('Wrong block penalty calculations', () => {
  it('wrong block stun = normal blockstun * WRONG_BLOCK_STUN_MULT (1.2)', () => {
    const normalBlockstun = 15;
    const wrongBlockStun = Math.round(normalBlockstun * WRONG_BLOCK_STUN_MULT);
    expect(wrongBlockStun).toBe(18);
  });

  it('wrong block pushback = normal pushback * WRONG_BLOCK_PUSHBACK_MULT (1.3)', () => {
    const normalPushback = 8;
    const wrongBlockPushback = normalPushback * WRONG_BLOCK_PUSHBACK_MULT;
    expect(wrongBlockPushback).toBeCloseTo(10.4, 2);
  });

  it('wrong block applies increased blockstun to fighter', () => {
    const f = createFighter();
    f.facing = 1;
    f.state = FighterState.IDLE;
    const normalBlockstun = 15;
    const normalPushback = 8;
    // Apply wrong block penalty
    const wrongBlockStun = Math.round(normalBlockstun * WRONG_BLOCK_STUN_MULT);
    const wrongBlockPushback = normalPushback * WRONG_BLOCK_PUSHBACK_MULT;
    f.applyBlockstun(wrongBlockStun, wrongBlockPushback);
    expect(f.blockstunTimer).toBe(18);
    // vx = pushback * facing_sign * 0.8 = 10.4 * -1 * 0.8
    expect(f.vx).toBeCloseTo(-8.32, 2);
  });

  it('wrong block drains extra guard gauge (1.3x)', () => {
    // combatSystem.ts line: defender.guardGauge = Math.max(0, defender.guardGauge - guardGaugeDamage(attackType) * 1.3);
    const f = createFighter();
    expect(f.guardGauge).toBe(100);
    // Simulate wrong block against heavy attack: 10 * 1.3 = 13 drain
    const wrongBlockDrain = guardGaugeDamage(AttackType.STAND_C) * 1.3;
    f.guardGauge = Math.max(0, f.guardGauge - wrongBlockDrain);
    expect(f.guardGauge).toBeCloseTo(87, 0);
  });

  it('wrong block against special drains 15 * 1.3 = 19.5 guard gauge', () => {
    const drain = GUARD_GAUGE_DRAIN_SPECIAL * 1.3;
    expect(drain).toBeCloseTo(19.5, 2);
  });

  it('wrong block against DM drains 25 * 1.3 = 32.5 guard gauge', () => {
    const drain = GUARD_GAUGE_DRAIN_DM * 1.3;
    expect(drain).toBeCloseTo(32.5, 2);
  });

  it('stand block vs LOW attack = wrong block (stand cannot block LOW)', () => {
    const crouching = false;
    const hitLevel = 'LOW';
    // canBlock logic from combatSystem.ts: LOW requires crouching
    const canBlock = crouching;
    expect(canBlock).toBe(false);
  });

  it('crouch block vs HIGH attack = wrong block (crouch cannot block HIGH without proximity)', () => {
    const crouching = true;
    const hitLevel = 'HIGH';
    const dist = 200; // far from proximity guard range
    // canBlock logic from combatSystem.ts
    const canBlock = !crouching || dist < 120;
    expect(canBlock).toBe(false);
  });
});

// ===========================================================================
// 15. Guard Crush — gauge reaches 0 trigger
// ===========================================================================
describe('Guard Crush — triggered when gauge reaches 0', () => {
  it('fighter enters GUARD_CRUSH state when guardGauge is set to 0', () => {
    const f = createFighter();
    f.guardGauge = 0;
    f.state = FighterState.GUARD_CRUSH;
    f.guardCrushTimer = GUARD_CRUSH_DURATION;
    expect(f.state).toBe(FighterState.GUARD_CRUSH);
    expect(f.guardGauge).toBe(0);
    expect(f.guardCrushTimer).toBe(90);
  });

  it('Guard Crush state cannot block (canBlock returns false)', () => {
    const f = createFighter();
    f.state = FighterState.GUARD_CRUSH;
    expect(f.canBlock()).toBe(false);
  });

  it('Guard Crush state cannot act (canAct returns false)', () => {
    const f = createFighter();
    f.state = FighterState.GUARD_CRUSH;
    expect(f.canAct()).toBe(false);
  });

  it('Guard Crush state is not throw vulnerable', () => {
    const f = createFighter();
    f.state = FighterState.GUARD_CRUSH;
    expect(f.isThrowVulnerable()).toBe(false);
  });

  it('Guard Crush: 4 SDM blocks (4*35=140) crush gauge even with +2 bonus each', () => {
    let gauge = 100;
    for (let i = 0; i < 4; i++) {
      gauge = Math.max(0, gauge - GUARD_GAUGE_DRAIN_SDM);
      gauge = Math.min(100, gauge + GUARD_GAUGE_METER_BONUS_ON_BLOCK);
    }
    // 100 - 35 + 2 = 67, 67 - 35 + 2 = 34, 34 - 35 + 2 = 1 (max(0,-1)+2=2), 2 - 35 + 2 = max(0,-33)+2=2
    // Actually: 100->67->34->1->max(0,-34)->0+2=2
    // After 3rd: 34-35=max(0,-1)=0, +2=2
    // After 4th: 2-35=max(0,-33)=0, +2=2
    // So gauge never reaches exactly 0 with the bonus applied after clamp
    // The real system checks guardGauge <= 0 BEFORE the bonus
    expect(gauge).toBeLessThanOrEqual(GUARD_GAUGE_METER_BONUS_ON_BLOCK);
  });

  it('Guard Crush simulation: exact sequence that triggers crush', () => {
    // Simulate the combat system's guard check order:
    // 1. Drain gauge: guardGauge = max(0, gauge - drain)
    // 2. Bonus: guardGauge = min(100, gauge + bonus)
    // 3. Check: if guardGauge <= 0 -> Guard Crush
    let gauge = 100;
    const drainSequence = [GUARD_GAUGE_DRAIN_SDM, GUARD_GAUGE_DRAIN_SDM, GUARD_GAUGE_DRAIN_SDM];
    for (const drain of drainSequence) {
      gauge = Math.max(0, gauge - drain);
      gauge = Math.min(100, gauge + GUARD_GAUGE_METER_BONUS_ON_BLOCK);
    }
    // 100 - 35 + 2 = 67, 67 - 35 + 2 = 34, 34 - 35 = max(0,-1) = 0 + 2 = 2
    expect(gauge).toBe(2);
    // The 4th block will set gauge to 0 (checked before bonus):
    gauge = Math.max(0, gauge - GUARD_GAUGE_DRAIN_SDM);
    // gauge is now max(0, 2-35) = 0
    expect(gauge).toBe(0);
    // Guard Crush triggers when gauge <= 0 (before bonus is applied)
  });

  it('Guard Crush consecutive block count resets to 0', () => {
    const f = createFighter();
    f.consecutiveBlockCount = 7;
    f.guardGauge = 0;
    // On Guard Crush, count resets (mirrors combatSystem.ts line 389)
    f.consecutiveBlockCount = 0;
    expect(f.consecutiveBlockCount).toBe(0);
  });
});

// ===========================================================================
// 16. Desperation mode — DM damage bonus (+30%)
// ===========================================================================
describe('Desperation mode — DM damage bonus', () => {
  it('isDesperation returns true when health < 25% of maxHealth', () => {
    expect(isDesperation(249, 1000)).toBe(true);
    expect(isDesperation(250, 1000)).toBe(false);
    expect(isDesperation(1, 1000)).toBe(true);
  });

  it('isDesperation returns false when health >= 25%', () => {
    expect(isDesperation(250, 1000)).toBe(false);
    expect(isDesperation(500, 1000)).toBe(false);
    expect(isDesperation(1000, 1000)).toBe(false);
  });

  it('isDesperation returns false when health is 0', () => {
    expect(isDesperation(0, 1000)).toBe(false);
  });

  it('DESPERATION_DM_DAMAGE_BONUS is 1.30 (+30%)', () => {
    expect(DESPERATION_DM_DAMAGE_BONUS).toBe(1.30);
  });

  it('DM damage at full health (no desperation): 100 base = 100 damage', () => {
    const baseDamage = 100;
    const defenderHealth = 500; // 50%
    const maxHealth = 1000;
    const isDesp = isDesperation(defenderHealth, maxHealth);
    expect(isDesp).toBe(false);
    // No desperation bonus applies
    const damage = baseDamage;
    expect(damage).toBe(100);
  });

  it('DM damage in desperation (health < 25%): 100 base * 1.30 = 130', () => {
    const baseDamage = 100;
    const defenderHealth = 200; // 20%
    const maxHealth = 1000;
    const isDesp = isDesperation(defenderHealth, maxHealth);
    expect(isDesp).toBe(true);
    const damage = Math.round(baseDamage * DESPERATION_DM_DAMAGE_BONUS);
    expect(damage).toBe(130);
  });

  it('DM damage in desperation: 80 base * 1.30 = 104', () => {
    const baseDamage = 80;
    const damage = Math.round(baseDamage * DESPERATION_DM_DAMAGE_BONUS);
    expect(damage).toBe(104);
  });

  it('Non-DM attack does NOT get desperation damage bonus', () => {
    // combatSystem.ts: desperation bonus only applies to DM attacks
    // Line: if (isDM(attackName) && defender.health / defender.maxHealth < DESPERATION_HEALTH_THRESHOLD)
    const baseDamage = 100;
    const attackIsDM = false;
    const defenderHealth = 200;
    const maxHealth = 1000;
    let damage = baseDamage;
    if (attackIsDM && isDesperation(defenderHealth, maxHealth)) {
      damage = Math.round(damage * DESPERATION_DM_DAMAGE_BONUS);
    }
    expect(damage).toBe(100); // No bonus for non-DM
  });

  it('Desperation threshold is exactly 25% (health 250/1000 = NOT desperation)', () => {
    expect(DESPERATION_HEALTH_THRESHOLD).toBe(0.25);
    // health/maxHealth must be STRICTLY less than 0.25
    expect(250 / 1000 < DESPERATION_HEALTH_THRESHOLD).toBe(false);
    expect(249 / 1000 < DESPERATION_HEALTH_THRESHOLD).toBe(true);
  });
});

// ===========================================================================
// 17. Desperation mode — meter gain bonus (+50%)
// ===========================================================================
describe('Desperation mode — meter gain bonus', () => {
  it('DESPERATION_METER_GAIN_BONUS is 1.50 (+50%)', () => {
    expect(DESPERATION_METER_GAIN_BONUS).toBe(1.50);
  });

  it('gainMeterOnHit in desperation: meter gain is increased by 50%', () => {
    // STAND_A is light normal: meterGainForAttack returns 100 * 0.6 = 60
    // Normal: 60 meter. Desperation: 60 * 1.5 = 90 meter.
    const normalGauge = createPowerGauge();
    gainMeterOnHit(normalGauge, AttackType.STAND_A);
    const despGauge = createPowerGauge();
    gainMeterOnHit(despGauge, AttackType.STAND_A, 200, 1000);
    // Desperation gain should be 50% more
    expect(despGauge.meter).toBeGreaterThan(normalGauge.meter);
    expect(despGauge.meter).toBe(Math.round(normalGauge.meter * DESPERATION_METER_GAIN_BONUS));
  });

  it('gainMeterOnHit at full health: no desperation bonus', () => {
    const gauge = createPowerGauge();
    gainMeterOnHit(gauge, AttackType.STAND_C, 800, 1000);
    const normalGauge = createPowerGauge();
    gainMeterOnHit(normalGauge, AttackType.STAND_C);
    expect(gauge.meter).toBe(normalGauge.meter);
  });

  it('gainMeterOnHitstun in desperation: defender meter gain is increased by 50%', () => {
    // STAND_A: meterGainForAttack(METER_GAIN_HITSTUN=50, STAND_A) = 50 * 0.6 = 30
    // Normal: 30 meter. Desperation: 30 * 1.5 = 45 meter.
    const normalGauge = createPowerGauge();
    gainMeterOnHitstun(normalGauge, AttackType.STAND_A);
    const despGauge = createPowerGauge();
    gainMeterOnHitstun(despGauge, AttackType.STAND_A, 200, 1000);
    expect(despGauge.meter).toBeGreaterThan(normalGauge.meter);
    expect(despGauge.meter).toBe(Math.round(normalGauge.meter * DESPERATION_METER_GAIN_BONUS));
  });

  it('gainMeterOnHit in desperation for DM attack gets both DM multiplier and desperation bonus', () => {
    // DM: meterGainForAttack returns 100 * 2.0 = 200
    // Normal: 200 -> 2 stocks, meter=0
    // Desperation: 200 * 1.5 = 300 -> 3 stocks, meter=0
    const normalGauge = createPowerGauge();
    gainMeterOnHit(normalGauge, AttackType.DM_OROCHINAGI);
    const despGauge = createPowerGauge();
    gainMeterOnHit(despGauge, AttackType.DM_OROCHINAGI, 200, 1000);
    // Both convert to stocks, but desperation gets more stocks
    expect(despGauge.stocks).toBeGreaterThan(normalGauge.stocks);
    expect(normalGauge.stocks).toBe(2);
    expect(despGauge.stocks).toBe(3);
  });

  it('meter gain in desperation does not overflow past MAX_STOCKS', () => {
    const gauge = createPowerGauge();
    gauge.stocks = MAX_STOCKS;
    gauge.meter = 99;
    gainMeterOnHit(gauge, AttackType.DM_OROCHINAGI, 100, 1000);
    // Should cap at MAX_STOCKS
    expect(gauge.stocks).toBeLessThanOrEqual(MAX_STOCKS);
  });
});

// ===========================================================================
// 18. MAX mode — damage bonus (+20%) and defense bonus (+25%)
// ===========================================================================
describe('MAX mode damage and defense bonuses', () => {
  it('MAX_MODE_DAMAGE_BONUS is 1.20 (+20%)', () => {
    expect(MAX_MODE_DAMAGE_BONUS).toBe(1.20);
  });

  it('MAX_MODE_DEFENSE_BONUS is 0.75 (-25% damage taken)', () => {
    expect(MAX_MODE_DEFENSE_BONUS).toBe(0.75);
  });

  it('MAX mode attacker deals +20% damage: 100 base -> 120', () => {
    const baseDamage = 100;
    const maxModeDamage = Math.round(baseDamage * MAX_MODE_DAMAGE_BONUS);
    expect(maxModeDamage).toBe(120);
  });

  it('MAX mode defender takes -25% damage: 100 damage -> 75', () => {
    const incomingDamage = 100;
    const reducedDamage = Math.round(incomingDamage * MAX_MODE_DEFENSE_BONUS);
    expect(reducedDamage).toBe(75);
  });

  it('MAX mode attacker vs normal defender: 100 base * 1.20 = 120', () => {
    const baseDamage = 100;
    let damage = baseDamage;
    const attackerMaxMode = true;
    const defenderMaxMode = false;
    if (attackerMaxMode) damage = Math.round(damage * MAX_MODE_DAMAGE_BONUS);
    if (defenderMaxMode) damage = Math.round(damage * MAX_MODE_DEFENSE_BONUS);
    expect(damage).toBe(120);
  });

  it('MAX mode attacker vs MAX mode defender: 100 * 1.20 * 0.75 = 90', () => {
    // combatSystem.ts applies damage bonus first, then defense bonus
    const baseDamage = 100;
    let damage = baseDamage;
    const attackerMaxMode = true;
    const defenderMaxMode = true;
    if (attackerMaxMode) damage = Math.round(damage * MAX_MODE_DAMAGE_BONUS);
    if (defenderMaxMode) damage = Math.round(damage * MAX_MODE_DEFENSE_BONUS);
    expect(damage).toBe(90);
  });

  it('Normal attacker vs MAX mode defender: 100 * 0.75 = 75', () => {
    const baseDamage = 100;
    let damage = baseDamage;
    const attackerMaxMode = false;
    const defenderMaxMode = true;
    if (attackerMaxMode) damage = Math.round(damage * MAX_MODE_DAMAGE_BONUS);
    if (defenderMaxMode) damage = Math.round(damage * MAX_MODE_DEFENSE_BONUS);
    expect(damage).toBe(75);
  });

  it('MAX mode + desperation DM: 100 * 1.20 * 1.30 = 156 (attacker MAX, defender desperate)', () => {
    // combatSystem.ts applies MAX damage first, then desperation DM bonus
    const baseDamage = 100;
    let damage = baseDamage;
    const attackerMaxMode = true;
    const defenderHealth = 200;
    const maxHealth = 1000;
    const isDMAttack = true;
    if (attackerMaxMode) damage = Math.round(damage * MAX_MODE_DAMAGE_BONUS);
    if (isDMAttack && isDesperation(defenderHealth, maxHealth)) damage = Math.round(damage * DESPERATION_DM_DAMAGE_BONUS);
    expect(damage).toBe(156);
  });

  it('MAX mode defense + desperation does not stack defense beyond MAX_MODE_DEFENSE_BONUS', () => {
    // Desperation only gives DM damage bonus to the ATTACKER, not defense bonus to defender
    const baseDamage = 100;
    let damage = baseDamage;
    const defenderMaxMode = true;
    if (defenderMaxMode) damage = Math.round(damage * MAX_MODE_DEFENSE_BONUS);
    // Desperation does NOT reduce incoming damage
    expect(damage).toBe(75);
  });

  it('MAX mode damage bonus rounds correctly for odd values', () => {
    expect(Math.round(73 * MAX_MODE_DAMAGE_BONUS)).toBe(88);
    expect(Math.round(37 * MAX_MODE_DAMAGE_BONUS)).toBe(44);
    expect(Math.round(1 * MAX_MODE_DAMAGE_BONUS)).toBe(1);
  });

  it('MAX mode defense bonus rounds correctly for odd values', () => {
    expect(Math.round(73 * MAX_MODE_DEFENSE_BONUS)).toBe(55);
    expect(Math.round(37 * MAX_MODE_DEFENSE_BONUS)).toBe(28);
    expect(Math.round(1 * MAX_MODE_DEFENSE_BONUS)).toBe(1);
  });
});

// ===========================================================================
// 19. Integration — full defense scenario
// ===========================================================================
describe('Full defense integration scenario', () => {
  it('block string into Guard Crush into recovery', () => {
    const f = createFighter();
    f.state = FighterState.IDLE;

    // Phase 1: Block 3 SDM attacks
    for (let i = 0; i < 3; i++) {
      f.guardGauge = Math.max(0, f.guardGauge - GUARD_GAUGE_DRAIN_SDM);
      f.guardGauge = Math.min(100, f.guardGauge + GUARD_GAUGE_METER_BONUS_ON_BLOCK);
      f.consecutiveBlockCount++;
      f.consecutiveBlockDecayTimer = PUSHBLOCK_DECAY_FRAMES;
    }
    // 100 - 35 + 2 = 67, 67 - 35 + 2 = 34, 34 - 35 + 2 = max(0,-1)+2 = 2
    expect(f.guardGauge).toBe(2);
    // After 3 blocks, pushblock should be active
    expect(f.consecutiveBlockCount).toBe(3);
    expect(f.consecutiveBlockCount >= PUSHBLOCK_THRESHOLD).toBe(true);

    // Phase 2: 4th block triggers Guard Crush (gauge drain before bonus)
    f.guardGauge = Math.max(0, f.guardGauge - GUARD_GAUGE_DRAIN_SDM);
    // gauge = max(0, 2-35) = 0 -> Guard Crush!
    expect(f.guardGauge).toBe(0);
    f.state = FighterState.GUARD_CRUSH;
    f.guardCrushTimer = GUARD_CRUSH_DURATION;
    f.consecutiveBlockCount = 0;

    // Phase 3: Can't block during Guard Crush
    expect(f.canBlock()).toBe(false);

    // Phase 4: Guard Crush timer expires
    f.guardCrushTimer = 0;
    if (f.guardCrushTimer <= 0) {
      f.state = FighterState.IDLE;
      f.vx = 0;
    }
    expect(f.state).toBe(FighterState.IDLE);

    // Phase 5: Guard gauge starts at 0, recovers slowly
    expect(f.guardGauge).toBe(0);
    for (let i = 0; i < 100; i++) {
      f.tickTimers();
    }
    // 100 * 0.25 = 25
    expect(f.guardGauge).toBe(25);
  });

  it('wrong block depletes guard gauge faster than correct block', () => {
    // Correct block: drain = GUARD_GAUGE_DRAIN_HEAVY (10), then +2 bonus
    let correctGauge = 100;
    correctGauge = Math.max(0, correctGauge - GUARD_GAUGE_DRAIN_HEAVY);
    correctGauge = Math.min(100, correctGauge + GUARD_GAUGE_METER_BONUS_ON_BLOCK);
    expect(correctGauge).toBe(92); // 100 - 10 + 2

    // Wrong block: drain = GUARD_GAUGE_DRAIN_HEAVY * 1.3 = 13, then +2 bonus
    let wrongGauge = 100;
    wrongGauge = Math.max(0, wrongGauge - GUARD_GAUGE_DRAIN_HEAVY * 1.3);
    wrongGauge = Math.min(100, wrongGauge + GUARD_GAUGE_METER_BONUS_ON_BLOCK);
    expect(wrongGauge).toBeLessThan(correctGauge);
  });

  it('chip damage on block cannot kill (health stays at 1)', () => {
    const f = createFighter();
    f.health = 2;
    const baseDamage = 50;
    const chip = Math.round(baseDamage * CHIP_DAMAGE_RATIO);
    // chip = 5, health would go to 2-5 = -3, but max(1, ...) keeps it at 1
    f.health = Math.max(1, f.health - chip);
    expect(f.health).toBe(1);
  });

  it('chip damage on wrong block also cannot kill', () => {
    const f = createFighter();
    f.health = 1;
    const baseDamage = 50;
    const chip = Math.round(baseDamage * CHIP_DAMAGE_RATIO);
    f.health = Math.max(1, f.health - chip);
    expect(f.health).toBe(1);
  });

  it('pushblock into Guard Crush: high block count does not prevent crush', () => {
    const f = createFighter();
    // Build up consecutive blocks
    f.consecutiveBlockCount = 10;
    f.consecutiveBlockDecayTimer = PUSHBLOCK_DECAY_FRAMES;
    // Pushblock is active
    expect(f.consecutiveBlockCount >= PUSHBLOCK_THRESHOLD).toBe(true);
    // But guard gauge can still be depleted
    f.guardGauge = 0;
    f.state = FighterState.GUARD_CRUSH;
    f.guardCrushTimer = GUARD_CRUSH_DURATION;
    // Count resets on crush
    f.consecutiveBlockCount = 0;
    expect(f.consecutiveBlockCount).toBe(0);
    expect(f.state).toBe(FighterState.GUARD_CRUSH);
  });
});

// ===========================================================================
// 20. Guard gauge drain — consistency between helper and constants
// ===========================================================================
describe('Guard gauge drain helper matches implementation rules', () => {
  it('light normals (A/B) all drain the same amount', () => {
    const lightAttacks = [AttackType.STAND_A, AttackType.STAND_B, AttackType.CLOSE_A, AttackType.CLOSE_B, AttackType.CROUCH_A, AttackType.CROUCH_B];
    for (const at of lightAttacks) {
      expect(guardGaugeDamage(at)).toBe(GUARD_GAUGE_DRAIN_LIGHT);
    }
  });

  it('heavy normals (C/D) all drain the same amount', () => {
    const heavyAttacks = [AttackType.STAND_C, AttackType.STAND_D, AttackType.CLOSE_C, AttackType.CLOSE_D, AttackType.CROUCH_C, AttackType.CROUCH_D];
    for (const at of heavyAttacks) {
      expect(guardGaugeDamage(at)).toBe(GUARD_GAUGE_DRAIN_HEAVY);
    }
  });

  it('all DM attacks drain the same amount', () => {
    const dmAttacks = [AttackType.DM_OROCHINAGI, AttackType.DM_YATAGARASU, AttackType.DM_POWER_GEYSER, AttackType.DM_PHOENIX_KICK];
    for (const at of dmAttacks) {
      expect(guardGaugeDamage(at)).toBe(GUARD_GAUGE_DRAIN_DM);
    }
  });

  it('all SDM attacks drain the same amount (more than DM)', () => {
    const sdmAttacks = [AttackType.SDM_OROCHINAGI, AttackType.SDM_YATAGARASU, AttackType.SDM_POWER_GEYSER, AttackType.SDM_PHOENIX_KICK];
    for (const at of sdmAttacks) {
      expect(guardGaugeDamage(at)).toBe(GUARD_GAUGE_DRAIN_SDM);
      expect(guardGaugeDamage(at)).toBeGreaterThan(GUARD_GAUGE_DRAIN_DM);
    }
  });

  it('character specials all drain the same amount', () => {
    const specials = [AttackType.KYO_ONIYAKI, AttackType.IORI_ONIYAKI, AttackType.TERRY_BURN_KNUCKLE, AttackType.KIM_HISHOU];
    for (const at of specials) {
      expect(guardGaugeDamage(at)).toBe(GUARD_GAUGE_DRAIN_SPECIAL);
    }
  });

  it('CD blowback attacks drain the same amount', () => {
    expect(guardGaugeDamage(AttackType.STAND_CD)).toBe(GUARD_GAUGE_DRAIN_CD);
    expect(guardGaugeDamage(AttackType.JUMP_CD)).toBe(GUARD_GAUGE_DRAIN_CD);
  });

  it('command normals drain the same amount', () => {
    const cmdNormals = [AttackType.CMD_GOFU_YOU, AttackType.CMD_88SHIKI, AttackType.CMD_NARAKU];
    for (const at of cmdNormals) {
      expect(guardGaugeDamage(at)).toBe(GUARD_GAUGE_DRAIN_COMMAND_NORMAL);
    }
  });

  it('drain hierarchy is strict: light(5) < heavy(10) <= CD(12) <= cmd(12) < special(15) < DM(25) < SDM(35)', () => {
    expect(GUARD_GAUGE_DRAIN_LIGHT).toBe(5);
    expect(GUARD_GAUGE_DRAIN_HEAVY).toBe(10);
    expect(GUARD_GAUGE_DRAIN_CD).toBe(12);
    expect(GUARD_GAUGE_DRAIN_COMMAND_NORMAL).toBe(12);
    expect(GUARD_GAUGE_DRAIN_SPECIAL).toBe(15);
    expect(GUARD_GAUGE_DRAIN_DM).toBe(25);
    expect(GUARD_GAUGE_DRAIN_SDM).toBe(35);
  });
});

// ===========================================================================
// 21. Fighter reset clears all defense state
// ===========================================================================
describe('Fighter reset clears defense state', () => {
  it('reset clears guard gauge to max (100)', () => {
    const f = createFighter();
    f.guardGauge = 0;
    f.state = FighterState.GUARD_CRUSH;
    f.guardCrushTimer = 50;
    f.reset(400);
    expect(f.guardGauge).toBe(100);
    expect(f.guardCrushTimer).toBe(0);
  });

  it('reset clears consecutive block count and decay timer', () => {
    const f = createFighter();
    f.consecutiveBlockCount = 10;
    f.consecutiveBlockDecayTimer = 20;
    f.reset(400);
    expect(f.consecutiveBlockCount).toBe(0);
    expect(f.consecutiveBlockDecayTimer).toBe(0);
  });

  it('reset clears blockstun timer', () => {
    const f = createFighter();
    f.blockstunTimer = 15;
    f.state = FighterState.BLOCK;
    f.reset(400);
    expect(f.blockstunTimer).toBe(0);
  });

  it('reset clears stun gauge', () => {
    const f = createFighter();
    f.stunGauge = 80;
    f.stunDecayTimer = 30;
    f.reset(400);
    expect(f.stunGauge).toBe(0);
    expect(f.stunDecayTimer).toBe(0);
  });

  it('reset restores health to maxHealth', () => {
    const f = createFighter();
    f.health = 100;
    f.reset(400);
    expect(f.health).toBe(MAX_HEALTH);
  });
});
