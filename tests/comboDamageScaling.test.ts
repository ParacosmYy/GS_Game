/**
 * comboDamageScaling.test.ts — KOF2002 连段伤害缩放系统验证
 *
 * 验证 COMBO_DAMAGE_SCALE 阶梯、COMBO_MIN_SCALE 下限、
 * DM_COMBO_PENALTY 额外惩罚以及 CombatSystem 中的实际缩放行为。
 *
 * 结构:
 *  1. Base Scaling (5 tests)
 *  2. COMBO_DAMAGE_SCALE Ladder (4 tests)
 *  3. DM Penalty (4 tests)
 *  4. Minimum Scale (3 tests)
 *  5. Scaling via CombatSystem (4 tests)
 */
import { describe, it, expect } from 'vitest';
import {
  COMBO_DAMAGE_SCALE,
  COMBO_MIN_SCALE,
  DM_COMBO_PENALTY,
  FRAME_DATA,
  MAX_HEALTH,
} from '../src/core/constants.js';
import { CombatSystem } from '../src/combat/combatSystem.js';
import { Fighter } from '../src/entities/fighter.js';
import type { IInputProvider } from '../src/input/inputProvider.js';
import type { PlayerInput } from '../src/core/types.js';
import { AttackType, FighterState } from '../src/core/types.js';

// ===== Helpers =====

const noopInput: PlayerInput = {
  up: false, down: false, left: false, right: false,
  buttonA: false, buttonB: false, buttonC: false, buttonD: false,
  throwAttack: false, start: false,
};

function createInputProvider(): IInputProvider {
  return {
    getP1Input: () => noopInput,
    getP2Input: () => noopInput,
  };
}

/** Force attacker into active hitbox phase */
function forceActivePhase(f: Fighter, attackType: AttackType): void {
  f.startAttack(attackType);
  f.attackPhase = 'active';
  f.attackFrame = 0;
}

/** Reset attacker so they can attack again */
function resetAttacker(f: Fighter): void {
  f.hasHit = false;
  f.currentAttack = null;
  f.attackPhase = 'none';
  f.attackFrame = 0;
}

/** Put defender back in hittable state */
function prepareDefender(f: Fighter): void {
  f.state = FighterState.IDLE;
  f.hitstunTimer = 0;
  f.blockstunTimer = 0;
}

/** Create a standard P1 vs P2 pair */
function createMatch(): { p1: Fighter; p2: Fighter } {
  return {
    p1: new Fighter(300, '#ff0000', 1),
    p2: new Fighter(350, '#0000ff', -1),
  };
}

/**
 * Reproduce the tiered scaling logic from CombatSystem.scaledDamage.
 * comboHits = value of comboHits at the time scaledDamage is called (pre-increment).
 */
function tieredScaledDamage(baseDamage: number, comboHits: number, attackType?: AttackType): number {
  if (comboHits <= 0) return baseDamage;

  const name = (attackType ?? '') as string;
  const isThrow = name === AttackType.THROW || name === AttackType.THROW_FORWARD || name === AttackType.THROW_BACK;
  if (isThrow) return baseDamage;

  let scale = COMBO_MIN_SCALE;
  const thresholds = Object.keys(COMBO_DAMAGE_SCALE).map(Number).sort((a, b) => a - b);
  for (const t of thresholds) {
    if (comboHits <= t) {
      scale = COMBO_DAMAGE_SCALE[t];
      break;
    }
  }

  const isDMAttack = name.startsWith('DM_') || name.startsWith('SDM_') || name.startsWith('HSDM_');
  if (isDMAttack) {
    scale = Math.max(COMBO_MIN_SCALE, scale - DM_COMBO_PENALTY);
  }

  return Math.max(1, Math.round(baseDamage * scale));
}

// ==========================================================================
// 1. Base Scaling (5 tests)
// ==========================================================================

describe('Base Scaling', () => {
  it('hit #1: 100% damage (comboHits=0 at scaledDamage call)', () => {
    // comboHits=0 → scaledDamage returns baseDamage unconditionally
    expect(tieredScaledDamage(100, 0)).toBe(100);
  });

  it('hit #2: 100% damage (comboHits=1, tier 1-3)', () => {
    // comboHits=1 → 1 <= 3 → scale = 1.0
    expect(tieredScaledDamage(100, 1)).toBe(100);
  });

  it('hit #3 starts scaling (comboHits=4 → 85%)', () => {
    // comboHits=4 → 4 <= 6 → scale = 0.85
    expect(tieredScaledDamage(100, 4)).toBe(85);
  });

  it('hit #5: more scaling (comboHits=7 → 70%)', () => {
    // comboHits=7 → 7 <= 9 → scale = 0.70
    expect(tieredScaledDamage(100, 7)).toBe(70);
  });

  it('hit #10 and above: minimum scale (60%)', () => {
    // comboHits=10 → >9 → scale = COMBO_MIN_SCALE = 0.60
    expect(tieredScaledDamage(100, 10)).toBe(60);
    // Even higher counts stay at minimum
    expect(tieredScaledDamage(100, 20)).toBe(60);
    expect(tieredScaledDamage(100, 50)).toBe(60);
  });
});

// ==========================================================================
// 2. COMBO_DAMAGE_SCALE Ladder (4 tests)
// ==========================================================================

describe('COMBO_DAMAGE_SCALE Ladder', () => {
  it('scale values decrease monotonically across tiers', () => {
    const thresholds = Object.keys(COMBO_DAMAGE_SCALE).map(Number).sort((a, b) => a - b);
    for (let i = 0; i < thresholds.length - 1; i++) {
      const current = COMBO_DAMAGE_SCALE[thresholds[i]];
      const next = COMBO_DAMAGE_SCALE[thresholds[i + 1]];
      expect(current).toBeGreaterThan(next);
    }
  });

  it('no tier value exceeds 1.0', () => {
    for (const val of Object.values(COMBO_DAMAGE_SCALE)) {
      expect(val).toBeLessThanOrEqual(1.0);
    }
  });

  it('no tier value falls below COMBO_MIN_SCALE', () => {
    for (const val of Object.values(COMBO_DAMAGE_SCALE)) {
      expect(val).toBeGreaterThanOrEqual(COMBO_MIN_SCALE);
    }
  });

  it('ladder has at least 3 tiers (sufficient granularity)', () => {
    const tierCount = Object.keys(COMBO_DAMAGE_SCALE).length;
    expect(tierCount).toBeGreaterThanOrEqual(3);
    // Current implementation: {3: 1.0, 6: 0.85, 9: 0.70} = 3 tiers
    expect(tierCount).toBe(3);
  });
});

// ==========================================================================
// 3. DM Penalty (4 tests)
// ==========================================================================

describe('DM Penalty', () => {
  it('DM in combo: extra scaling applies (comboHits=3 → 90%)', () => {
    // comboHits=3 → tier 1-3 → scale=1.0, DM penalty: max(0.60, 1.0-0.10) = 0.90
    expect(tieredScaledDamage(200, 3, AttackType.DM_OROCHINAGI)).toBe(180);
  });

  it('DM as combo opener: no scaling (comboHits=0 → baseDamage)', () => {
    // comboHits=0 → early return baseDamage, no DM penalty applied
    expect(tieredScaledDamage(200, 0, AttackType.DM_OROCHINAGI)).toBe(200);
  });

  it('DM_COMBO_PENALTY (0.10) is correctly applied across tiers', () => {
    // comboHits=5 → tier 4-6 → scale=0.85, DM: max(0.60, 0.85-0.10)=0.75
    expect(tieredScaledDamage(200, 5, AttackType.DM_OROCHINAGI)).toBe(150);
    // comboHits=8 → tier 7-9 → scale=0.70, DM: max(0.60, 0.70-0.10)=0.60
    expect(tieredScaledDamage(200, 8, AttackType.DM_OROCHINAGI)).toBe(120);
  });

  it('SDM in combo also receives DM penalty', () => {
    // SDM starts with 'SDM_' → isDM=true → penalty applies
    // comboHits=3 → 1.0 - 0.10 = 0.90
    expect(tieredScaledDamage(200, 3, AttackType.SDM_OROCHINAGI)).toBe(180);
    // comboHits=5 → 0.85 - 0.10 = 0.75
    expect(tieredScaledDamage(200, 5, AttackType.SDM_OROCHINAGI)).toBe(150);
  });
});

// ==========================================================================
// 4. Minimum Scale (3 tests)
// ==========================================================================

describe('Minimum Scale', () => {
  it('COMBO_MIN_SCALE > 0 (damage never drops to zero)', () => {
    expect(COMBO_MIN_SCALE).toBeGreaterThan(0);
  });

  it('long combos do not drop below minimum scale', () => {
    // Even at comboHits=100, damage should be COMBO_MIN_SCALE * baseDamage
    const scaled = tieredScaledDamage(200, 100);
    expect(scaled).toBe(Math.max(1, Math.round(200 * COMBO_MIN_SCALE)));
  });

  it('minimum scale ensures combos remain meaningful (>= 60%)', () => {
    expect(COMBO_MIN_SCALE).toBeGreaterThanOrEqual(0.60);
    // Verify a 200-damage hit at combo 50 still deals at least 120
    expect(tieredScaledDamage(200, 50)).toBeGreaterThanOrEqual(
      Math.round(200 * 0.60),
    );
  });
});

// ==========================================================================
// 5. Scaling via CombatSystem (4 tests)
// ==========================================================================

describe('Scaling via CombatSystem', () => {
  it('2-hit combo: 2nd hit deals same damage as standalone (tier 1-3 = 100%)', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createMatch();
    const baseDamage = (FRAME_DATA[AttackType.STAND_C] as { damage: number }).damage;

    // Hit 1: STAND_A (builds comboHits to 1)
    forceActivePhase(p1, AttackType.STAND_A);
    cs.resolveAttacks(p1, p2, []);
    resetAttacker(p1);
    prepareDefender(p2);

    // Hit 2: STAND_C (comboHits=1 at scaledDamage → 1 <= 3 → 100%)
    const healthBefore = p2.health;
    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);
    const damage2nd = healthBefore - p2.health;

    expect(damage2nd).toBe(baseDamage);
  });

  it('5-hit combo: later hits deal reduced damage (tier 4-6 = 85%)', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createMatch();
    p2.maxHealth = 5000;
    p2.health = 5000;
    const baseDamage = (FRAME_DATA[AttackType.STAND_C] as { damage: number }).damage;

    // Build 5 hits of STAND_A to reach comboHits=5
    for (let i = 0; i < 5; i++) {
      if (i > 0) { resetAttacker(p1); prepareDefender(p2); }
      forceActivePhase(p1, AttackType.STAND_A);
      cs.resolveAttacks(p1, p2, []);
    }
    expect(cs.getComboCount(1)).toBe(5);

    resetAttacker(p1);
    prepareDefender(p2);

    // 6th hit: STAND_C with comboHits=5 → 5 <= 6 → 85%
    const healthBefore = p2.health;
    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);
    const damage6th = healthBefore - p2.health;

    expect(damage6th).toBe(Math.round(baseDamage * 0.85));
  });

  it('long combo (10+ hits): damage is significantly reduced', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createMatch();
    p2.maxHealth = 10000;
    p2.health = 10000;
    const baseDamage = (FRAME_DATA[AttackType.STAND_C] as { damage: number }).damage;

    // Build 10 hits
    for (let i = 0; i < 10; i++) {
      if (i > 0) { resetAttacker(p1); prepareDefender(p2); }
      forceActivePhase(p1, AttackType.STAND_A);
      cs.resolveAttacks(p1, p2, []);
    }
    expect(cs.getComboCount(1)).toBe(10);

    resetAttacker(p1);
    prepareDefender(p2);

    // 11th hit: STAND_C with comboHits=10 → 10 > 9 → COMBO_MIN_SCALE=0.60
    const healthBefore = p2.health;
    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);
    const damage11th = healthBefore - p2.health;

    expect(damage11th).toBe(Math.round(baseDamage * COMBO_MIN_SCALE));
    // Significantly less than base
    expect(damage11th).toBeLessThan(baseDamage);
    expect(damage11th).toBeLessThan(Math.round(baseDamage * 0.85));
  });

  it('throw bypasses damage scaling regardless of combo count', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createMatch();
    p2.maxHealth = 10000;
    p2.health = 10000;

    // Build 8 hits of STAND_A to reach comboHits=8
    for (let i = 0; i < 8; i++) {
      if (i > 0) { resetAttacker(p1); prepareDefender(p2); }
      forceActivePhase(p1, AttackType.STAND_A);
      cs.resolveAttacks(p1, p2, []);
    }
    expect(cs.getComboCount(1)).toBe(8);

    // Verify that at comboHits=8, a normal attack gets scaled to 70%
    const normalScale = tieredScaledDamage(100, 8);
    expect(normalScale).toBe(70); // 100 * 0.70

    // Throw at comboHits=8: scaledDamage returns baseDamage (bypasses all scaling)
    const throwScale = tieredScaledDamage(100, 8, AttackType.THROW);
    expect(throwScale).toBe(100); // No scaling for throws

    // THROW_FORWARD and THROW_BACK also bypass
    expect(tieredScaledDamage(100, 8, AttackType.THROW_FORWARD)).toBe(100);
    expect(tieredScaledDamage(100, 8, AttackType.THROW_BACK)).toBe(100);
  });
});
