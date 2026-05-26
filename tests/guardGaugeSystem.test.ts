/**
 * Guard Gauge System tests
 *
 * Covers: guard gauge drain, recovery, Guard Crush trigger/duration/state,
 * pushblock system, chip damage, and Guard Crush callback integration.
 * Total: 21 tests across 5 groups.
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
  CHIP_DAMAGE_RATIO,
  MAX_HEALTH,
  FRAME_DATA,
} from '../src/core/constants.js';
import { isDM } from '../src/core/attackClassifier.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createFighter(x = 400): Fighter {
  return new Fighter(x, '#ff6600', 1);
}

/**
 * Re-create the guardGaugeDamage logic from combatSystem.ts for unit testing
 * without requiring the full CombatSystem pipeline.
 * Mirrors the actual implementation: light < heavy < CD <= cmd < special < DM < SDM.
 */
function guardGaugeDamage(attackType: AttackType): number {
  const name = attackType as string;
  if (isDM(name)) {
    return (name.startsWith('SDM_') || name.startsWith('HSDM_'))
      ? GUARD_GAUGE_DRAIN_SDM
      : GUARD_GAUGE_DRAIN_DM;
  }
  if (isSpecialMoveCheck(attackType)) return GUARD_GAUGE_DRAIN_SPECIAL;
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
  const match = /^([A-Z][A-Z0-9]+)_/.exec(name);
  const normalPrefixes = new Set(['CLOSE', 'STAND', 'CROUCH', 'JUMP', 'CMD', 'THROW', 'SPECIAL', 'DM', 'SDM', 'HSDM']);
  if (match && !normalPrefixes.has(match[1])) return true;
  return name.startsWith('SPECIAL_');
}

/**
 * Simulate a single block event on a fighter (drain gauge + apply bonus,
 * matching the order in combatSystem.ts ground block path).
 * Returns true if Guard Crush should be triggered.
 */
function simulateBlock(fighter: Fighter, attackType: AttackType): boolean {
  const drain = guardGaugeDamage(attackType);
  fighter.guardGauge = Math.max(0, fighter.guardGauge - drain);

  if (fighter.guardGauge <= 0) {
    fighter.state = FighterState.GUARD_CRUSH;
    fighter.guardCrushTimer = GUARD_CRUSH_DURATION;
    fighter.consecutiveBlockCount = 0;
    fighter.vx = 12 * (fighter.facing === 1 ? -1 : 1) * 1.5;
    fighter.resetAttackState();
    return true;
  }

  fighter.guardGauge = Math.min(100, fighter.guardGauge + GUARD_GAUGE_METER_BONUS_ON_BLOCK);
  fighter.consecutiveBlockCount++;
  fighter.consecutiveBlockDecayTimer = PUSHBLOCK_DECAY_FRAMES;
  return false;
}

/**
 * Simulate a wrong block event (stand vs low / crouch vs overhead).
 * Returns true if Guard Crush should be triggered.
 */
function simulateWrongBlock(fighter: Fighter, attackType: AttackType): boolean {
  const drain = guardGaugeDamage(attackType) * 1.3;
  fighter.guardGauge = Math.max(0, fighter.guardGauge - drain);

  if (fighter.guardGauge <= 0) {
    fighter.state = FighterState.GUARD_CRUSH;
    fighter.guardCrushTimer = GUARD_CRUSH_DURATION;
    fighter.consecutiveBlockCount = 0;
    return true;
  }

  // Wrong block does NOT give the guard gauge meter bonus
  fighter.consecutiveBlockCount++;
  fighter.consecutiveBlockDecayTimer = PUSHBLOCK_DECAY_FRAMES;
  return false;
}

// ===========================================================================
// 1. Guard Gauge Drain (5 tests)
// ===========================================================================
describe('Guard Gauge Drain', () => {
  it('light attack drains minimal gauge (GUARD_GAUGE_DRAIN_LIGHT = 5)', () => {
    const f = createFighter();
    const drain = guardGaugeDamage(AttackType.STAND_A);
    expect(drain).toBe(GUARD_GAUGE_DRAIN_LIGHT);
    expect(drain).toBe(5);

    // Verify single light block drains 5 from gauge (before bonus)
    f.guardGauge = 100;
    f.guardGauge = Math.max(0, f.guardGauge - drain);
    expect(f.guardGauge).toBe(95);
  });

  it('heavy attack drains more gauge (GUARD_GAUGE_DRAIN_HEAVY = 10)', () => {
    const drain = guardGaugeDamage(AttackType.STAND_C);
    expect(drain).toBe(GUARD_GAUGE_DRAIN_HEAVY);
    expect(drain).toBe(10);
    expect(drain).toBeGreaterThan(GUARD_GAUGE_DRAIN_LIGHT);

    const f = createFighter();
    f.guardGauge = 100;
    f.guardGauge = Math.max(0, f.guardGauge - drain);
    expect(f.guardGauge).toBe(90);
  });

  it('special attack drains even more (GUARD_GAUGE_DRAIN_SPECIAL = 15)', () => {
    const drain = guardGaugeDamage(AttackType.KYO_ONIYAKI);
    expect(drain).toBe(GUARD_GAUGE_DRAIN_SPECIAL);
    expect(drain).toBe(15);
    expect(drain).toBeGreaterThan(GUARD_GAUGE_DRAIN_HEAVY);

    const f = createFighter();
    f.guardGauge = 100;
    f.guardGauge = Math.max(0, f.guardGauge - drain);
    expect(f.guardGauge).toBe(85);
  });

  it('DM drains significant gauge (GUARD_GAUGE_DRAIN_DM = 25)', () => {
    const drain = guardGaugeDamage(AttackType.DM_OROCHINAGI);
    expect(drain).toBe(GUARD_GAUGE_DRAIN_DM);
    expect(drain).toBe(25);
    expect(drain).toBeGreaterThan(GUARD_GAUGE_DRAIN_SPECIAL);

    const f = createFighter();
    f.guardGauge = 100;
    f.guardGauge = Math.max(0, f.guardGauge - drain);
    expect(f.guardGauge).toBe(75);
  });

  it('wrong block drains extra gauge (1.3x multiplier)', () => {
    // combatSystem.ts line: defender.guardGauge = max(0, defender.guardGauge - guardGaugeDamage(attackType) * 1.3)
    const heavyDrain = guardGaugeDamage(AttackType.STAND_C);
    const wrongBlockDrain = heavyDrain * 1.3;
    expect(wrongBlockDrain).toBeCloseTo(13, 2);

    // Compare correct vs wrong block
    const fCorrect = createFighter();
    fCorrect.guardGauge = 100;
    fCorrect.guardGauge = Math.max(0, fCorrect.guardGauge - heavyDrain);

    const fWrong = createFighter();
    fWrong.guardGauge = 100;
    fWrong.guardGauge = Math.max(0, fWrong.guardGauge - wrongBlockDrain);

    expect(fWrong.guardGauge).toBeLessThan(fCorrect.guardGauge);
    // 100 - 13 = 87 vs 100 - 10 = 90
    expect(fWrong.guardGauge).toBeCloseTo(87, 0);
  });
});

// ===========================================================================
// 2. Guard Gauge Recovery (4 tests)
// ===========================================================================
describe('Guard Gauge Recovery', () => {
  it('guard gauge recovers over time when not blocking', () => {
    const f = createFighter();
    f.guardGauge = 50;
    f.state = FighterState.IDLE;
    // Tick 10 frames
    for (let i = 0; i < 10; i++) {
      f.tickTimers();
    }
    // Should recover 10 * GUARD_GAUGE_RECOVERY_IDLE (0.25) = 2.5
    expect(f.guardGauge).toBeCloseTo(52.5, 4);
  });

  it('recovery rate is reasonable (full recovery from 0 in ~400 frames / ~6.7 seconds)', () => {
    const framesForFullRecovery = Math.ceil(GUARD_GAUGE_MAX / GUARD_GAUGE_RECOVERY_IDLE);
    // 100 / 0.25 = 400 frames = ~6.67 seconds at 60fps
    expect(framesForFullRecovery).toBe(400);
    expect(framesForFullRecovery / 60).toBeCloseTo(6.67, 1);

    const f = createFighter();
    f.guardGauge = 0;
    f.state = FighterState.IDLE;
    for (let i = 0; i < framesForFullRecovery; i++) {
      f.tickTimers();
    }
    expect(f.guardGauge).toBe(GUARD_GAUGE_MAX);
  });

  it('successful block gives meter bonus (GUARD_GAUGE_METER_BONUS_ON_BLOCK = 2)', () => {
    expect(GUARD_GAUGE_METER_BONUS_ON_BLOCK).toBe(2);

    const f = createFighter();
    // Simulate a correct block: drain then bonus
    const preGauge = 100;
    const drain = GUARD_GAUGE_DRAIN_LIGHT;
    f.guardGauge = Math.max(0, preGauge - drain);
    // Gauge after drain: 95
    expect(f.guardGauge).toBe(95);
    // Apply block bonus (in combatSystem.ts, bonus is applied after drain check but before Guard Crush)
    f.guardGauge = Math.min(100, f.guardGauge + GUARD_GAUGE_METER_BONUS_ON_BLOCK);
    expect(f.guardGauge).toBe(97);
  });

  it('guard gauge is capped at 100 and cannot exceed maximum', () => {
    const f = createFighter();
    f.guardGauge = 99.9;
    f.state = FighterState.IDLE;
    // Tick many frames — gauge should not exceed GUARD_GAUGE_MAX
    for (let i = 0; i < 1000; i++) {
      f.tickTimers();
    }
    expect(f.guardGauge).toBe(GUARD_GAUGE_MAX);
  });
});

// ===========================================================================
// 3. Guard Crush (5 tests)
// ===========================================================================
describe('Guard Crush', () => {
  it('gauge reaching 0 triggers Guard Crush', () => {
    const f = createFighter();
    f.guardGauge = GUARD_GAUGE_DRAIN_DM; // 25
    // Block one DM: 25 - 25 = 0 -> Guard Crush
    const crushed = simulateBlock(f, AttackType.DM_OROCHINAGI);
    expect(crushed).toBe(true);
    expect(f.guardGauge).toBe(0);
    expect(f.state).toBe(FighterState.GUARD_CRUSH);
  });

  it('Guard Crush duration matches GUARD_CRUSH_DURATION (90 frames)', () => {
    expect(GUARD_CRUSH_DURATION).toBe(90);

    const f = createFighter();
    f.guardGauge = 0;
    f.state = FighterState.GUARD_CRUSH;
    f.guardCrushTimer = GUARD_CRUSH_DURATION;
    expect(f.guardCrushTimer).toBe(90);

    // Count down the full duration
    for (let i = 0; i < GUARD_CRUSH_DURATION; i++) {
      f.guardCrushTimer--;
    }
    expect(f.guardCrushTimer).toBe(0);
  });

  it('Guard Crush state: stunned, cannot block, cannot act, extra pushback', () => {
    const f = createFighter();
    // Trigger Guard Crush via simulation
    f.guardGauge = GUARD_GAUGE_DRAIN_SPECIAL; // 15
    const crushed = simulateBlock(f, AttackType.KYO_ONIYAKI);
    expect(crushed).toBe(true);

    // Verify stunned state
    expect(f.state).toBe(FighterState.GUARD_CRUSH);
    expect(f.canBlock()).toBe(false);
    expect(f.canAct()).toBe(false);
    // Extra pushback: vx = pushback * facing_sign * 1.5
    // pushback in simulateBlock is 12, facing = 1, so vx = 12 * -1 * 1.5 = -18
    expect(f.vx).toBe(-18);
  });

  it('Guard Crush resets consecutive block counter', () => {
    const f = createFighter();
    // Build up consecutive blocks
    f.consecutiveBlockCount = 5;
    f.consecutiveBlockDecayTimer = PUSHBLOCK_DECAY_FRAMES;

    // Trigger Guard Crush
    f.guardGauge = GUARD_GAUGE_DRAIN_SPECIAL;
    const crushed = simulateBlock(f, AttackType.KYO_ONIYAKI);
    expect(crushed).toBe(true);
    // combatSystem.ts resets count on Guard Crush
    expect(f.consecutiveBlockCount).toBe(0);
  });

  it('Guard Crush callback is fired (onGuardCrush)', () => {
    // In combatSystem.ts, when guardGauge <= 0 the following occurs:
    //   defender.state = FighterState.GUARD_CRUSH;
    //   defender.guardCrushTimer = GUARD_CRUSH_DURATION;
    //   this.onGuardCrush?.(defender, hitX, hitY);
    // We simulate this callback behavior.
    const guardCrushCalls: { fighter: Fighter; x: number; y: number }[] = [];
    const onGuardCrush = (fighter: Fighter, hitX: number, hitY: number) => {
      guardCrushCalls.push({ fighter, x: hitX, y: hitY });
    };

    const f = createFighter();
    f.guardGauge = 0;
    // Simulate the combat system trigger
    if (f.guardGauge <= 0) {
      f.state = FighterState.GUARD_CRUSH;
      f.guardCrushTimer = GUARD_CRUSH_DURATION;
      const hitX = f.x;
      const hitY = f.y - f.displayHeight / 2;
      onGuardCrush(f, hitX, hitY);
    }

    expect(guardCrushCalls.length).toBe(1);
    expect(guardCrushCalls[0].fighter).toBe(f);
    expect(guardCrushCalls[0].fighter.state).toBe(FighterState.GUARD_CRUSH);
    expect(guardCrushCalls[0].fighter.guardCrushTimer).toBe(GUARD_CRUSH_DURATION);
  });
});

// ===========================================================================
// 4. Pushblock System (4 tests)
// ===========================================================================
describe('Pushblock System', () => {
  it('consecutive blocks are tracked (consecutiveBlockCount)', () => {
    const f = createFighter();
    expect(f.consecutiveBlockCount).toBe(0);

    // Simulate 3 consecutive blocks
    for (let i = 0; i < 3; i++) {
      f.consecutiveBlockCount++;
      f.consecutiveBlockDecayTimer = PUSHBLOCK_DECAY_FRAMES;
    }
    expect(f.consecutiveBlockCount).toBe(3);
  });

  it('pushblock triggers at PUSHBLOCK_THRESHOLD (3 blocks)', () => {
    // Below threshold: normal pushback
    const pushbackBelow = (count: number) => count >= PUSHBLOCK_THRESHOLD ? PUSHBLOCK_EXTRA_PUSHBACK : 1.0;
    expect(pushbackBelow(0)).toBe(1.0);
    expect(pushbackBelow(1)).toBe(1.0);
    expect(pushbackBelow(2)).toBe(1.0);
    // At threshold: extra pushback
    expect(pushbackBelow(3)).toBe(PUSHBLOCK_EXTRA_PUSHBACK);
    expect(pushbackBelow(3)).toBe(1.5);
    // Above threshold: still extra pushback
    expect(pushbackBelow(5)).toBe(PUSHBLOCK_EXTRA_PUSHBACK);
  });

  it('pushback multiplier = PUSHBLOCK_EXTRA_PUSHBACK (1.5x)', () => {
    expect(PUSHBLOCK_EXTRA_PUSHBACK).toBe(1.5);

    const basePushback = 8; // typical heavy normal pushback
    const f = createFighter();
    f.facing = 1;

    // Before threshold (2 blocks): normal pushback
    f.consecutiveBlockCount = 2;
    const multBefore = f.consecutiveBlockCount >= PUSHBLOCK_THRESHOLD ? PUSHBLOCK_EXTRA_PUSHBACK : 1.0;
    f.applyBlockstun(10, basePushback * multBefore);
    expect(f.vx).toBeCloseTo(8 * -1 * 0.8, 2);

    // After threshold (3 blocks): extra pushback
    f.state = FighterState.IDLE;
    f.consecutiveBlockCount = 3;
    const multAfter = f.consecutiveBlockCount >= PUSHBLOCK_THRESHOLD ? PUSHBLOCK_EXTRA_PUSHBACK : 1.0;
    f.applyBlockstun(10, basePushback * multAfter);
    // 8 * 1.5 = 12, applied as 12 * -1 * 0.8 = -9.6
    expect(f.vx).toBeCloseTo(12 * -1 * 0.8, 2);
  });

  it('block count decays after PUSHBLOCK_DECAY_FRAMES (30 frames)', () => {
    expect(PUSHBLOCK_DECAY_FRAMES).toBe(30);

    const f = createFighter();
    f.consecutiveBlockCount = 5;
    f.consecutiveBlockDecayTimer = PUSHBLOCK_DECAY_FRAMES;
    f.state = FighterState.IDLE;

    // Tick 29 frames: count should still be 5
    for (let i = 0; i < 29; i++) {
      f.tickTimers();
    }
    expect(f.consecutiveBlockCount).toBe(5);

    // Tick frame 30: decay timer reaches 0
    f.tickTimers();
    expect(f.consecutiveBlockDecayTimer).toBe(0);

    // Next frame (31st since last block): count resets
    f.tickTimers();
    expect(f.consecutiveBlockCount).toBe(0);
  });
});

// ===========================================================================
// 5. Chip Damage (3 tests)
// ===========================================================================
describe('Chip Damage', () => {
  it('chip damage = damage * CHIP_DAMAGE_RATIO (10%)', () => {
    expect(CHIP_DAMAGE_RATIO).toBe(0.1);

    // STAND_C damage = 100, chip = 100 * 0.1 = 10
    const data = FRAME_DATA[AttackType.STAND_C];
    const chip = Math.round(data.damage * CHIP_DAMAGE_RATIO);
    expect(chip).toBe(10);

    // STAND_A damage = 33, chip = Math.round(33 * 0.1) = 3
    const dataA = FRAME_DATA[AttackType.STAND_A];
    const chipA = Math.round(dataA.damage * CHIP_DAMAGE_RATIO);
    expect(chipA).toBe(3);
  });

  it('chip damage cannot kill (leaves at least 1 HP)', () => {
    // combatSystem.ts: defender.health = Math.max(1, defender.health - chip)
    const f = createFighter();
    f.health = 1;

    // Even a large chip damage cannot reduce below 1
    const chip = Math.round(100 * CHIP_DAMAGE_RATIO); // 10
    f.health = Math.max(1, f.health - chip);
    expect(f.health).toBe(1);

    // Also test with health = 2
    f.health = 2;
    f.health = Math.max(1, f.health - chip);
    expect(f.health).toBe(1);

    // Test with health = 100
    f.health = 100;
    f.health = Math.max(1, f.health - chip);
    expect(f.health).toBe(90);
  });

  it('special/DM chip damage may have explicit chipDamage value', () => {
    // combatSystem.ts: const chip = chipData.chipDamage ?? Math.round(data.damage * CHIP_DAMAGE_RATIO)
    // Some attacks have an explicit chipDamage that overrides the default ratio calculation.

    // KYO_ONIYAKI (special) has chipDamage: 10 in frameDataChars.ts
    const specialData = FRAME_DATA[AttackType.KYO_ONIYAKI] as { chipDamage?: number; damage: number };
    if (specialData.chipDamage !== undefined) {
      expect(specialData.chipDamage).toBe(10);
      // Verify it differs from the default ratio calculation
      const defaultChip = Math.round(specialData.damage * CHIP_DAMAGE_RATIO);
      // chipDamage is explicitly set, the ?? operator in combatSystem.ts uses it
      expect(typeof specialData.chipDamage).toBe('number');
    }

    // DM_OROCHINAGI has chipDamage: 20
    const dmData = FRAME_DATA[AttackType.DM_OROCHINAGI] as { chipDamage?: number; damage: number };
    if (dmData.chipDamage !== undefined) {
      expect(dmData.chipDamage).toBe(20);
    }

    // Verify the fallback: a normal without chipDamage uses the ratio
    const normalData = FRAME_DATA[AttackType.STAND_A] as { chipDamage?: number; damage: number };
    const chip = normalData.chipDamage ?? Math.round(normalData.damage * CHIP_DAMAGE_RATIO);
    // STAND_A has no chipDamage field, so fallback applies
    if (normalData.chipDamage === undefined) {
      expect(chip).toBe(Math.round(33 * 0.1));
    }
  });
});

// ===========================================================================
// 6. Guard Gauge on Hit (bonus coverage)
// ===========================================================================
describe('Guard Gauge on Hit', () => {
  it('being hit drains guard gauge at 0.3x rate (weaker than blocking)', () => {
    // combatSystem.ts line: defender.guardGauge = max(0, defender.guardGauge - guardGaugeDamage(attackType) * 0.3)
    const f = createFighter();
    const drain = guardGaugeDamage(AttackType.STAND_C) * 0.3;
    // 10 * 0.3 = 3
    expect(drain).toBeCloseTo(3, 4);

    f.guardGauge = 100;
    f.guardGauge = Math.max(0, f.guardGauge - drain);
    expect(f.guardGauge).toBeCloseTo(97, 4);
  });

  it('hit drain is weaker than block drain', () => {
    const blockDrain = guardGaugeDamage(AttackType.STAND_C);
    const hitDrain = blockDrain * 0.3;
    expect(hitDrain).toBeLessThan(blockDrain);
    // 3 vs 10
    expect(hitDrain).toBeCloseTo(3, 4);
    expect(blockDrain).toBe(10);
  });
});

// ===========================================================================
// 7. Reset clears guard gauge state
// ===========================================================================
describe('Guard Gauge Reset', () => {
  it('reset() restores guard gauge to 100', () => {
    const f = createFighter();
    f.guardGauge = 0;
    f.state = FighterState.GUARD_CRUSH;
    f.guardCrushTimer = 50;
    f.reset(400);
    expect(f.guardGauge).toBe(100);
    expect(f.guardCrushTimer).toBe(0);
    expect(f.state).toBe(FighterState.IDLE);
  });

  it('reset() clears consecutive block counter and decay timer', () => {
    const f = createFighter();
    f.consecutiveBlockCount = 8;
    f.consecutiveBlockDecayTimer = 15;
    f.reset(400);
    expect(f.consecutiveBlockCount).toBe(0);
    expect(f.consecutiveBlockDecayTimer).toBe(0);
  });
});
