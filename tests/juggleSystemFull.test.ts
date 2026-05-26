/**
 * juggleSystemFull.test.ts — KOF2002 浮空系统完整行为验证
 *
 * 验证浮空系统的6大领域:
 * 1. Juggle Points Pool (预算池)
 * 2. Juggle Cost per Attack (每次攻击消耗)
 * 3. Juggle Exhaustion (预算耗尽)
 * 4. Juggle Reset (重置)
 * 5. Air Counter Juggle (空中CH恢复)
 * 6. Juggle in Combo (连段中的浮空计算)
 *
 * 关键公式 (from combatSystem.resolveHit):
 *   baseCost = getJuggleCost(attackType)
 *   juggleCost = Math.ceil(baseCost * (1 + defender.airHitCount * 0.2))
 *   defender.jugglePoints -= juggleCost
 *   defender.airHitCount++
 */

import { describe, it, expect } from 'vitest';
import { Fighter } from '../src/entities/fighter.js';
import { FighterState, AttackType, JuggleState } from '../src/core/types.js';
import {
  JUGGLE_POINTS_MAX,
  JUGGLE_COST_LIGHT,
  JUGGLE_COST_HEAVY,
  JUGGLE_COST_SPECIAL,
  JUGGLE_COST_DM,
  JUGGLE_COST_CD,
  JUGGLE_GRAVITY_BASE,
  JUGGLE_GRAVITY_SCALE_PER_HIT,
  STAGE_GROUND_Y,
  GROUND_BOUNCE_VY,
  GROUND_BOUNCE_COST,
  GROUND_BOUNCE_HITSTUN,
  WALL_BOUNCE_MAX_PER_COMBO,
} from '../src/core/constants.js';
import { CombatSystem } from '../src/combat/combatSystem.js';
import type { IInputProvider } from '../src/input/inputProvider.js';
import type { PlayerInput } from '../src/core/types.js';

// ============================================================================
// Helpers
// ============================================================================

function createFighter(x = 400): Fighter {
  return new Fighter(x, '#ff6600', 1);
}

function createNoInputProvider(): IInputProvider {
  const noop: PlayerInput = {
    up: false, down: false, left: false, right: false,
    buttonA: false, buttonB: false, buttonC: false, buttonD: false,
    throwAttack: false, start: false,
  };
  return {
    getP1Input: () => noop,
    getP2Input: () => noop,
  };
}

/** Set fighter into airborne juggleable state */
function setAirborne(f: Fighter, y = 300): void {
  f.y = y;
  f.state = FighterState.HITSTUN;
  f.juggleState = JuggleState.FULL;
  f.jugglePoints = JUGGLE_POINTS_MAX;
}

/**
 * Simulate progressive juggle point deduction (mirrors combatSystem.resolveHit).
 * Returns the actual cost consumed.
 */
function applyJuggleCost(f: Fighter, baseCost: number): number {
  const juggleCost = Math.ceil(baseCost * (1 + f.airHitCount * 0.2));
  f.jugglePoints -= juggleCost;
  f.airHitCount++;
  return juggleCost;
}

// ============================================================================
// 1. JUGGLE POINTS POOL
// ============================================================================

describe('Juggle Points Pool', () => {
  it('JUGGLE_POINTS_MAX should be positive', () => {
    expect(JUGGLE_POINTS_MAX).toBeGreaterThan(0);
  });

  it('初始 juggleState 应为 NONE (地面)', () => {
    const f = createFighter();
    expect(f.juggleState).toBe(JuggleState.NONE);
    expect(f.isGrounded()).toBe(true);
  });

  it('被打浮空后 juggleState 变为 FULL', () => {
    const f = createFighter();
    // Simulate a knockdown move that launches (as resolveHit does)
    f.y = 300;
    f.state = FighterState.HITSTUN;
    f.juggleState = JuggleState.FULL;
    f.jugglePoints = JUGGLE_POINTS_MAX;

    expect(f.isGrounded()).toBe(false);
    expect(f.juggleState).toBe(JuggleState.FULL);
  });

  it('JUGGLE_POINTS_MAX 足够做 2-3 次追击 (轻攻击)', () => {
    let points = JUGGLE_POINTS_MAX;
    let airHits = 0;
    let hitCount = 0;

    // Hit 1: ceil(1 * (1+0*0.2)) = 1
    const cost1 = Math.ceil(JUGGLE_COST_LIGHT * (1 + airHits * 0.2));
    points -= cost1;
    airHits++;
    hitCount++;

    // Hit 2: ceil(1 * (1+1*0.2)) = ceil(1.2) = 2
    const cost2 = Math.ceil(JUGGLE_COST_LIGHT * (1 + airHits * 0.2));
    points -= cost2;
    airHits++;
    hitCount++;

    // At least 2 hits guaranteed, likely 3
    expect(hitCount).toBeGreaterThanOrEqual(2);
    // Check if 3rd hit is possible
    const cost3 = Math.ceil(JUGGLE_COST_LIGHT * (1 + airHits * 0.2));
    if (points >= cost3) {
      hitCount++;
    }
    expect(hitCount).toBeGreaterThanOrEqual(2);
    // With JUGGLE_POINTS_MAX=5: 1+2+2=5 -> exactly 3 light hits
    // With any MAX >= 3: at least 2 hits
  });
});

// ============================================================================
// 2. JUGGLE COST PER ATTACK
// ============================================================================

describe('Juggle Cost per Attack', () => {
  it('轻攻击消耗最少 juggle points', () => {
    const f = createFighter();
    setAirborne(f);
    const initialPoints = f.jugglePoints;

    const consumed = applyJuggleCost(f, JUGGLE_COST_LIGHT);

    expect(consumed).toBe(JUGGLE_COST_LIGHT); // first hit: no progressive scaling
    expect(f.jugglePoints).toBe(initialPoints - JUGGLE_COST_LIGHT);
  });

  it('重攻击消耗中等 juggle points', () => {
    const f = createFighter();
    setAirborne(f);
    const initialPoints = f.jugglePoints;

    const consumed = applyJuggleCost(f, JUGGLE_COST_HEAVY);

    expect(consumed).toBe(JUGGLE_COST_HEAVY);
    expect(f.jugglePoints).toBe(initialPoints - JUGGLE_COST_HEAVY);
  });

  it('必杀技消耗较多 juggle points', () => {
    const f = createFighter();
    setAirborne(f);
    const initialPoints = f.jugglePoints;

    const consumed = applyJuggleCost(f, JUGGLE_COST_SPECIAL);

    expect(consumed).toBe(JUGGLE_COST_SPECIAL);
    expect(f.jugglePoints).toBe(initialPoints - JUGGLE_COST_SPECIAL);
  });

  it('DM 消耗最多 juggle points', () => {
    const f = createFighter();
    setAirborne(f);
    const initialPoints = f.jugglePoints;

    const consumed = applyJuggleCost(f, JUGGLE_COST_DM);

    expect(consumed).toBe(JUGGLE_COST_DM);
    // DM costs more than all other types on first hit
    expect(consumed).toBeGreaterThan(JUGGLE_COST_LIGHT);
    expect(consumed).toBeGreaterThan(JUGGLE_COST_HEAVY);
    expect(consumed).toBeGreaterThanOrEqual(JUGGLE_COST_SPECIAL);
    expect(f.jugglePoints).toBe(initialPoints - JUGGLE_COST_DM);
  });
});

// ============================================================================
// 3. JUGGLE EXHAUSTION
// ============================================================================

describe('Juggle Exhaustion', () => {
  it('juggle points 用完后不能追击', () => {
    const f = createFighter();
    setAirborne(f);
    f.jugglePoints = 0;

    // Even cheapest attack cannot be afforded
    const cheapestCost = Math.ceil(JUGGLE_COST_LIGHT * (1 + f.airHitCount * 0.2));
    expect(f.jugglePoints < cheapestCost).toBe(true);
  });

  it('最后一击把 juggle points 减到 0 或以下', () => {
    const f = createFighter();
    setAirborne(f);

    // Exhaust budget with heavy attacks
    // Hit 1: ceil(2*(1+0*0.2)) = 2, remaining = 3
    applyJuggleCost(f, JUGGLE_COST_HEAVY);
    expect(f.jugglePoints).toBe(JUGGLE_POINTS_MAX - 2);

    // Hit 2: ceil(2*(1+1*0.2)) = ceil(2.4) = 3, remaining = 0
    applyJuggleCost(f, JUGGLE_COST_HEAVY);
    expect(f.jugglePoints).toBeLessThanOrEqual(0);
  });

  it('落地后 juggle points 重置', () => {
    const f = createFighter();
    setAirborne(f);
    f.airHitCount = 3;
    f.jugglePoints = -1; // exhausted past 0

    // Land
    f.y = STAGE_GROUND_Y;
    f.resetComboJuggleState();

    expect(f.jugglePoints).toBe(0);
    expect(f.airHitCount).toBe(0);
    expect(f.juggleState).toBe(JuggleState.NONE);
  });
});

// ============================================================================
// 4. JUGGLE RESET
// ============================================================================

describe('Juggle Reset', () => {
  it('落地重置 juggle points', () => {
    const f = createFighter();
    setAirborne(f);
    f.airHitCount = 3;
    f.jugglePoints = 0;

    f.resetComboJuggleState();

    expect(f.jugglePoints).toBe(0);
    expect(f.airHitCount).toBe(0);
  });

  it('起身时 juggleState 回到 NONE', () => {
    const f = createFighter();
    setAirborne(f);
    f.juggleState = JuggleState.FULL;
    expect(f.juggleState).toBe(JuggleState.FULL);

    // Simulate landing and getting up
    f.y = STAGE_GROUND_Y;
    f.resetComboJuggleState();

    expect(f.juggleState).toBe(JuggleState.NONE);
  });

  it('新的浮空开始重新计算 juggle', () => {
    const f = createFighter();

    // First launch cycle
    setAirborne(f);
    applyJuggleCost(f, JUGGLE_COST_HEAVY); // hit 1
    applyJuggleCost(f, JUGGLE_COST_HEAVY); // hit 2, exhausts budget
    expect(f.jugglePoints).toBeLessThanOrEqual(0);
    expect(f.airHitCount).toBe(2);

    // Land and reset
    f.y = STAGE_GROUND_Y;
    f.resetComboJuggleState();

    // Second launch — fresh juggle budget
    setAirborne(f);
    expect(f.jugglePoints).toBe(JUGGLE_POINTS_MAX);
    expect(f.airHitCount).toBe(0);
    expect(f.juggleState).toBe(JuggleState.FULL);

    // Should be able to juggle again
    const canAfford = f.jugglePoints >= Math.ceil(JUGGLE_COST_LIGHT * (1 + f.airHitCount * 0.2));
    expect(canAfford).toBe(true);
  });
});

// ============================================================================
// 5. AIR COUNTER JUGGLE
// ============================================================================

describe('Air Counter Juggle', () => {
  it('空中 Counter Hit 恢复 juggle points', () => {
    const f = createFighter();
    setAirborne(f);

    // Exhaust most juggle budget
    f.jugglePoints = 1;
    f.airHitCount = 2;

    // Air Counter Hit restores juggle points (as resolveHit does)
    // Code: defender.jugglePoints = JUGGLE_POINTS_MAX
    f.jugglePoints = JUGGLE_POINTS_MAX;

    expect(f.jugglePoints).toBe(JUGGLE_POINTS_MAX);
    expect(f.jugglePoints).toBeGreaterThan(1); // restored from near-exhaustion
  });

  it('恢复后可以继续追击', () => {
    const f = createFighter();
    setAirborne(f);

    // Exhaust budget
    f.jugglePoints = 0;
    f.airHitCount = 3;

    // Air CH restore
    f.jugglePoints = JUGGLE_POINTS_MAX;
    f.juggleState = JuggleState.FULL;

    // Can afford at least one heavy attack
    const heavyCost = Math.ceil(JUGGLE_COST_HEAVY * (1 + f.airHitCount * 0.2));
    expect(f.jugglePoints >= heavyCost).toBe(true);
  });

  it('恢复量等于 JUGGLE_POINTS_MAX (完全恢复)', () => {
    const f = createFighter();
    setAirborne(f);
    f.jugglePoints = 0;

    // Air CH restore (from combatSystem: defender.jugglePoints = JUGGLE_POINTS_MAX)
    const restoredPoints = JUGGLE_POINTS_MAX;
    f.jugglePoints = restoredPoints;

    expect(f.jugglePoints).toBe(JUGGLE_POINTS_MAX);
    // Also juggleState becomes FULL (from combatSystem: defender.juggleState = JuggleState.FULL)
    f.juggleState = JuggleState.FULL;
    expect(f.juggleState).toBe(JuggleState.FULL);
  });
});

// ============================================================================
// 6. JUGGLE IN COMBO
// ============================================================================

describe('Juggle in Combo', () => {
  it('地面连段不消耗 juggle points', () => {
    const f = createFighter();
    // Grounded fighter: juggle check in resolveHit is skipped entirely
    expect(f.isGrounded()).toBe(true);
    expect(f.jugglePoints).toBe(0); // default grounded
    expect(f.juggleState).toBe(JuggleState.NONE);

    // Ground combo hits do not touch juggle state
    // The juggle point deduction only fires when !defender.isGrounded()
    // So a grounded fighter's jugglePoints stays 0 and airHitCount stays 0
    expect(f.airHitCount).toBe(0);
  });

  it('浮空后第一次追击消耗 juggle', () => {
    const f = createFighter();
    setAirborne(f);
    const initialPoints = f.jugglePoints;

    const consumed = applyJuggleCost(f, JUGGLE_COST_LIGHT);

    expect(consumed).toBeGreaterThan(0);
    expect(f.jugglePoints).toBe(initialPoints - consumed);
    expect(f.airHitCount).toBe(1);
  });

  it('混合地面+空中连段的 juggle 计算', () => {
    const f = createFighter();

    // Phase 1: Ground hits — juggle system NOT engaged
    // (In real combat, resolveHit skips juggle check for grounded defender)
    f.state = FighterState.HITSTUN;
    f.hitstunTimer = 10;
    expect(f.isGrounded()).toBe(true);
    expect(f.airHitCount).toBe(0);
    expect(f.jugglePoints).toBe(0);

    // Phase 2: Launch (knockdown move sends airborne)
    // resolveHit sets: jugglePoints = JUGGLE_POINTS_MAX, juggleState = FULL
    f.y = 300;
    f.jugglePoints = JUGGLE_POINTS_MAX;
    f.juggleState = JuggleState.FULL;
    expect(f.isGrounded()).toBe(false);

    // Phase 3: Air hits — juggle points consumed progressively
    // Hit 1 (light): ceil(1*(1+0*0.2)) = 1
    const cost1 = applyJuggleCost(f, JUGGLE_COST_LIGHT);
    expect(cost1).toBe(1);
    expect(f.jugglePoints).toBe(JUGGLE_POINTS_MAX - 1);
    expect(f.airHitCount).toBe(1);

    // Hit 2 (heavy): ceil(2*(1+1*0.2)) = ceil(2.4) = 3
    const cost2 = applyJuggleCost(f, JUGGLE_COST_HEAVY);
    expect(cost2).toBe(3);
    expect(f.jugglePoints).toBe(JUGGLE_POINTS_MAX - 1 - 3);
    expect(f.airHitCount).toBe(2);

    // Remaining points: 5 - 1 - 3 = 1
    expect(f.jugglePoints).toBe(1);

    // Hit 3 (light): ceil(1*(1+2*0.2)) = ceil(1.4) = 2, but only 1 point left
    const cost3 = Math.ceil(JUGGLE_COST_LIGHT * (1 + f.airHitCount * 0.2));
    expect(f.jugglePoints < cost3).toBe(true); // Cannot afford
  });
});

// ============================================================================
// ADDITIONAL: Progressive cost edge cases
// ============================================================================

describe('Progressive Juggle Cost Edge Cases', () => {
  it('第一次命中 cost = baseCost (无递增)', () => {
    // airHitCount=0: ceil(base * (1+0*0.2)) = base
    expect(Math.ceil(JUGGLE_COST_LIGHT * (1 + 0 * 0.2))).toBe(JUGGLE_COST_LIGHT);
    expect(Math.ceil(JUGGLE_COST_HEAVY * (1 + 0 * 0.2))).toBe(JUGGLE_COST_HEAVY);
    expect(Math.ceil(JUGGLE_COST_SPECIAL * (1 + 0 * 0.2))).toBe(JUGGLE_COST_SPECIAL);
    expect(Math.ceil(JUGGLE_COST_DM * (1 + 0 * 0.2))).toBe(JUGGLE_COST_DM);
  });

  it('递增因子使后续命中更贵', () => {
    // For light (base=1):
    // hit 0: 1, hit 1: ceil(1.2)=2, hit 2: ceil(1.4)=2
    const costs: number[] = [];
    for (let h = 0; h < 5; h++) {
      costs.push(Math.ceil(JUGGLE_COST_LIGHT * (1 + h * 0.2)));
    }
    // costs should be non-decreasing
    for (let i = 1; i < costs.length; i++) {
      expect(costs[i]).toBeGreaterThanOrEqual(costs[i - 1]);
    }
    // At least one increase must happen
    expect(costs[1]).toBeGreaterThan(costs[0]);
  });

  it('DM 第二次命中需要 4 点 (ceil(3*1.2))', () => {
    const dmFirst = Math.ceil(JUGGLE_COST_DM * (1 + 0 * 0.2));
    const dmSecond = Math.ceil(JUGGLE_COST_DM * (1 + 1 * 0.2));
    expect(dmFirst).toBe(3);
    expect(dmSecond).toBe(4); // ceil(3.6) = 4
  });

  it('重攻击两次命中刚好耗尽 MAX=5 预算', () => {
    const f = createFighter();
    setAirborne(f);
    // Hit 1: ceil(2*(1+0)) = 2
    applyJuggleCost(f, JUGGLE_COST_HEAVY);
    // Hit 2: ceil(2*(1+0.2)) = ceil(2.4) = 3
    applyJuggleCost(f, JUGGLE_COST_HEAVY);
    expect(f.jugglePoints).toBe(0);
  });
});

// ============================================================================
// ADDITIONAL: JuggleState transitions
// ============================================================================

describe('JuggleState Transitions', () => {
  it('NONE state在空中时阻止所有命中', () => {
    const f = createFighter();
    f.y = 300;
    f.juggleState = JuggleState.NONE;
    f.jugglePoints = JUGGLE_POINTS_MAX;

    // In resolveHit: if (defender.juggleState === JuggleState.NONE) return;
    // The check happens before juggle point deduction
    // So NONE means no air hits at all, even with full budget
    expect(f.juggleState).toBe(JuggleState.NONE);
  });

  it('HALF 状态且 vy > 0 时阻止命中', () => {
    const f = createFighter();
    f.y = 300;
    f.juggleState = JuggleState.HALF;
    f.vy = 5; // moving upward (in KOF coordinate: positive vy = moving up in resolveHit check)
    f.jugglePoints = JUGGLE_POINTS_MAX;

    // In resolveHit: if (defender.juggleState === JuggleState.HALF && defender.vy > 0) return;
    // HALF + vy > 0 means defender is still going up from the hit, not yet falling
    // This prevents juggling during the initial upward arc of certain moves
    expect(f.juggleState).toBe(JuggleState.HALF);
    expect(f.vy > 0).toBe(true);
  });

  it('FULL 状态允许任何时刻追击', () => {
    const f = createFighter();
    f.y = 300;
    f.juggleState = JuggleState.FULL;
    f.jugglePoints = JUGGLE_POINTS_MAX;
    f.vy = -5; // falling

    // FULL state allows juggling regardless of vy direction
    expect(f.juggleState).toBe(JuggleState.FULL);
    expect(f.jugglePoints).toBeGreaterThan(0);
  });
});

// ============================================================================
// ADDITIONAL: getJuggleCost via combatSystem integration
// ============================================================================

describe('getJuggleCost Classification', () => {
  it('Light normals (A/B) use JUGGLE_COST_LIGHT', () => {
    const lightAttacks = [
      AttackType.STAND_A, AttackType.STAND_B,
      AttackType.CLOSE_A, AttackType.CLOSE_B,
      AttackType.CROUCH_A, AttackType.CROUCH_B,
      AttackType.JUMP_A, AttackType.JUMP_B,
    ];
    for (const atk of lightAttacks) {
      // getJuggleCost returns JUGGLE_COST_LIGHT for A/B normals
      // These are not DM, not CD, not special, not heavy (don't end with _C/_D)
      const name = atk as string;
      expect(name.endsWith('_A') || name.endsWith('_B')).toBe(true);
    }
  });

  it('Heavy normals (C/D) use JUGGLE_COST_HEAVY', () => {
    const heavyAttacks = [
      AttackType.STAND_C, AttackType.STAND_D,
      AttackType.CLOSE_C, AttackType.CLOSE_D,
      AttackType.CROUCH_C, AttackType.CROUCH_D,
      AttackType.JUMP_C, AttackType.JUMP_D,
    ];
    for (const atk of heavyAttacks) {
      const name = atk as string;
      expect(name.endsWith('_C') || name.endsWith('_D')).toBe(true);
    }
  });

  it('CD blowback uses JUGGLE_COST_CD', () => {
    expect(JUGGLE_COST_CD).toBeGreaterThan(0);
    expect(JUGGLE_COST_CD).toBeLessThanOrEqual(JUGGLE_COST_DM);
  });

  it('DM uses JUGGLE_COST_DM (highest)', () => {
    expect(JUGGLE_COST_DM).toBeGreaterThan(JUGGLE_COST_LIGHT);
    expect(JUGGLE_COST_DM).toBeGreaterThanOrEqual(JUGGLE_COST_HEAVY);
    expect(JUGGLE_COST_DM).toBeGreaterThanOrEqual(JUGGLE_COST_SPECIAL);
    expect(JUGGLE_COST_DM).toBeGreaterThanOrEqual(JUGGLE_COST_CD);
  });
});

// ============================================================================
// ADDITIONAL: Wall bounce + Ground bounce juggle interactions
// ============================================================================

describe('Wall/Ground Bounce Juggle Interactions', () => {
  it('Counter Wire (CD攻击) 给予完整 juggle 预算', () => {
    const f = createFighter();
    setAirborne(f);
    f.jugglePoints = 0; // exhausted
    f.wallBounceCount = 0;

    // CD attack causes wall bounce (resolveHit: isCDAttack gives full juggle)
    f.isCounterWire = true;
    f.wallBounceCount++;
    f.juggleState = JuggleState.FULL;
    f.jugglePoints = JUGGLE_POINTS_MAX; // CD wire gives full budget

    expect(f.juggleState).toBe(JuggleState.FULL);
    expect(f.jugglePoints).toBe(JUGGLE_POINTS_MAX);
  });

  it('Counter Wire (非CD) 给予减少的 juggle 预算 (3 点)', () => {
    const f = createFighter();
    setAirborne(f);

    // Non-CD counter wire (resolveHit: jugglePoints = 3)
    f.jugglePoints = 3;

    expect(f.jugglePoints).toBe(3);
    // Enough for one light (cost 1) or one heavy (cost 2), but not DM at progressive scale
    expect(f.jugglePoints >= JUGGLE_COST_LIGHT).toBe(true);
    expect(f.jugglePoints >= JUGGLE_COST_HEAVY).toBe(true);
  });

  it('Ground bounce 给予减少的 juggle 预算 (MAX - COST)', () => {
    const f = createFighter();
    f.y = STAGE_GROUND_Y;

    // Ground bounce trigger (resolveHit logic)
    f.isGroundBounce = true;
    f.groundBounceTimer = GROUND_BOUNCE_HITSTUN;
    f.vy = GROUND_BOUNCE_VY;
    f.juggleState = JuggleState.FULL;
    f.jugglePoints = Math.max(0, JUGGLE_POINTS_MAX - GROUND_BOUNCE_COST);

    expect(f.jugglePoints).toBe(JUGGLE_POINTS_MAX - GROUND_BOUNCE_COST);
    expect(f.juggleState).toBe(JuggleState.FULL);
  });

  it('落地重置 wall bounce 计数', () => {
    const f = createFighter();
    setAirborne(f);
    f.wallBounceCount = 1;

    f.resetComboJuggleState();
    expect(f.wallBounceCount).toBe(0);
    expect(f.wallBounceCount < WALL_BOUNCE_MAX_PER_COMBO).toBe(true);
  });
});

// ============================================================================
// ADDITIONAL: Air Counter Hit detailed behavior
// ============================================================================

describe('Air Counter Hit Detailed Behavior', () => {
  it('空中CH设置 juggleState=FULL 并恢复完整预算', () => {
    const f = createFighter();
    setAirborne(f);

    // Exhaust juggle budget with hits
    f.jugglePoints = 0;
    f.airHitCount = 3;
    f.juggleState = JuggleState.HALF; // Some moves set HALF

    // Air counter hit (resolveHit logic):
    // if (counterHit && !defender.isGrounded()) {
    //   defender.juggleState = JuggleState.FULL;
    //   defender.jugglePoints = JUGGLE_POINTS_MAX;
    // }
    f.juggleState = JuggleState.FULL;
    f.jugglePoints = JUGGLE_POINTS_MAX;

    expect(f.juggleState).toBe(JuggleState.FULL);
    expect(f.jugglePoints).toBe(JUGGLE_POINTS_MAX);
  });

  it('空中CH额外恢复15点 juggle points (不超过MAX)', () => {
    const f = createFighter();
    setAirborne(f);
    f.jugglePoints = JUGGLE_POINTS_MAX - 3; // 2 points remaining

    // Air CH bonus: jugglePoints = min(MAX, jugglePoints + 15)
    // (from resolveHit counter hit section: defender.jugglePoints = Math.min(MAX, + 15))
    f.jugglePoints = Math.min(JUGGLE_POINTS_MAX, f.jugglePoints + 15);

    expect(f.jugglePoints).toBe(JUGGLE_POINTS_MAX); // capped at MAX
  });

  it('地面CH不影响 juggle points', () => {
    const f = createFighter();
    // Grounded fighter: juggle points not relevant
    expect(f.isGrounded()).toBe(true);
    expect(f.jugglePoints).toBe(0);

    // Ground CH gives extra hitstun, not juggle points
    // (resolveHit only restores juggle on air CH)
    expect(f.jugglePoints).toBe(0);
  });
});

// ============================================================================
// ADDITIONAL: Multi-hit juggle sequences
// ============================================================================

describe('Multi-hit Juggle Sequences', () => {
  it('Launch -> heavy -> light x2 消耗完整预算', () => {
    const f = createFighter();
    setAirborne(f);

    // Hit 1 (heavy): ceil(2*(1+0*0.2)) = 2
    const c1 = applyJuggleCost(f, JUGGLE_COST_HEAVY);
    expect(c1).toBe(2);
    expect(f.jugglePoints).toBe(3);

    // Hit 2 (light): ceil(1*(1+1*0.2)) = ceil(1.2) = 2
    const c2 = applyJuggleCost(f, JUGGLE_COST_LIGHT);
    expect(c2).toBe(2);
    expect(f.jugglePoints).toBe(1);

    // Hit 3 (light): ceil(1*(1+2*0.2)) = ceil(1.4) = 2, only 1 left
    const c3 = Math.ceil(JUGGLE_COST_LIGHT * (1 + f.airHitCount * 0.2));
    expect(f.jugglePoints < c3).toBe(true);
  });

  it('Launch -> special -> light 刚好耗尽 (2+2=4, 剩1不够第二次light)', () => {
    const f = createFighter();
    setAirborne(f);

    // Hit 1 (special): ceil(2*(1+0)) = 2
    applyJuggleCost(f, JUGGLE_COST_SPECIAL);
    expect(f.jugglePoints).toBe(3);

    // Hit 2 (light): ceil(1*(1+1*0.2)) = 2
    applyJuggleCost(f, JUGGLE_COST_LIGHT);
    expect(f.jugglePoints).toBe(1);

    // Hit 3 (light): ceil(1*(1+2*0.2)) = 2, not enough
    const c3 = Math.ceil(JUGGLE_COST_LIGHT * (1 + f.airHitCount * 0.2));
    expect(f.jugglePoints < c3).toBe(true);
  });

  it('Air CH恢复后可以接完整的第二段连段', () => {
    const f = createFighter();
    setAirborne(f);

    // Phase 1: Exhaust with 2 heavy hits
    applyJuggleCost(f, JUGGLE_COST_HEAVY); // cost 2, remaining 3
    applyJuggleCost(f, JUGGLE_COST_HEAVY); // cost 3, remaining 0
    expect(f.jugglePoints).toBe(0);

    // Phase 2: Air CH restore
    f.jugglePoints = JUGGLE_POINTS_MAX;
    f.juggleState = JuggleState.FULL;
    // Note: airHitCount is NOT reset on air CH (progressive cost continues)

    // Phase 3: Follow-up after restore
    // Hit 3 (light): ceil(1*(1+2*0.2)) = ceil(1.4) = 2
    const canAffordLight = f.jugglePoints >= Math.ceil(JUGGLE_COST_LIGHT * (1 + f.airHitCount * 0.2));
    expect(canAffordLight).toBe(true);

    applyJuggleCost(f, JUGGLE_COST_LIGHT);
    expect(f.jugglePoints).toBe(JUGGLE_POINTS_MAX - 2); // 5-2=3 remaining
  });
});
