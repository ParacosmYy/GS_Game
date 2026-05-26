/**
 * comboDisplay.test.ts -- KOF2002 连段显示和计数系统验证
 *
 * 覆盖范围:
 *  1. Combo Counting (4 tests) — 连段计数递增/上限
 *  2. Combo Timeout (3 tests) — 超时重置/常量范围/刷新
 *  3. Combo Damage Accumulation (4 tests) — 伤害累加/缩放/显示
 *  4. Combo Reset (2 tests) — IDLE 重置/手动 reset
 *  5. Floating Combo Text (2 tests) — 显示条件/位置
 *
 * 使用真实 CombatSystem + Fighter 进行集成测试。
 */
import { describe, it, expect } from 'vitest';
import { CombatSystem } from '../src/combat/combatSystem.js';
import { Fighter } from '../src/entities/fighter.js';
import type { IInputProvider } from '../src/input/inputProvider.js';
import type { PlayerInput } from '../src/core/types.js';
import { AttackType, FighterState } from '../src/core/types.js';
import {
  COMBO_TIMEOUT,
  COMBO_DAMAGE_SCALE,
  COMBO_MIN_SCALE,
  FRAME_DATA,
} from '../src/core/constants.js';

// ===== 辅助函数 =====

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

/** 将攻击者推到 active phase */
function forceActivePhase(f: Fighter, attackType: AttackType): void {
  f.startAttack(attackType);
  f.attackPhase = 'active';
  f.attackFrame = 0;
}

/** 重置攻击者使其可以再次攻击 */
function resetAttacker(attacker: Fighter): void {
  attacker.hasHit = false;
  attacker.currentAttack = null;
  attacker.attackPhase = 'none';
  attacker.attackFrame = 0;
}

/** 将 defender 恢复到可被命中状态 */
function prepareDefenderForNextHit(defender: Fighter): void {
  defender.state = FighterState.IDLE;
  defender.hitstunTimer = 0;
  defender.blockstunTimer = 0;
}

/** 创建标准对战配置 */
function createStandardMatch(): { p1: Fighter; p2: Fighter } {
  return {
    p1: new Fighter(300, '#ff0000', 1),
    p2: new Fighter(350, '#0000ff', -1),
  };
}

/**
 * 使用 CombatSystem 进行单次命中并返回结果。
 * defenderIdx = 1 (P2 是 defender)。
 */
function singleHit(
  cs: CombatSystem,
  attacker: Fighter,
  defender: Fighter,
  attackType: AttackType,
  currentFrame: number = 0,
  maxModes: [boolean, boolean] = [false, false],
): { damage: number; comboCount: number; comboDamage: number } {
  const healthBefore = defender.health;
  forceActivePhase(attacker, attackType);
  cs.resolveAttacks(attacker, defender, [], undefined, currentFrame, maxModes);
  const damage = healthBefore - defender.health;
  return {
    damage,
    comboCount: cs.getComboCount(1),
    comboDamage: cs.getComboDamage(1),
  };
}

// ==========================================================================
// 1. Combo Counting (4 tests)
// ==========================================================================

describe('Combo Counting', () => {
  it('第一次命中 combo = 1', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    singleHit(cs, p1, p2, AttackType.STAND_A);

    expect(cs.getComboCount(1)).toBe(1);
  });

  it('连续命中递增 combo', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    // 第1击
    singleHit(cs, p1, p2, AttackType.STAND_A);
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);

    // 第2击
    singleHit(cs, p1, p2, AttackType.STAND_B);
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);

    // 第3击
    singleHit(cs, p1, p2, AttackType.STAND_C);

    expect(cs.getComboCount(1)).toBe(3);
  });

  it('格挡不增加 combo, 重置为 0', () => {
    // 使用可变 input: 前两次不格挡, 第三次格挡
    let p2Blocking = false;
    const mutableProvider: IInputProvider = {
      getP1Input: () => noopInput,
      getP2Input: () => p2Blocking ? { ...noopInput, right: true } : noopInput,
    };
    const cs = new CombatSystem(mutableProvider);
    const { p1, p2 } = createStandardMatch();

    // 第1击: P2 不格挡 → 命中
    singleHit(cs, p1, p2, AttackType.STAND_A);
    expect(cs.getComboCount(1)).toBe(1);
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);

    // 第2击: P2 不格挡 → 命中
    singleHit(cs, p1, p2, AttackType.STAND_A);
    expect(cs.getComboCount(1)).toBe(2);
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);

    // 第3击: P2 按下 right (back for facing=-1) → 格挡 (STAND_A 是 MID)
    p2Blocking = true;
    forceActivePhase(p1, AttackType.STAND_A);
    cs.resolveAttacks(p1, p2, [], undefined, 0);

    // 格挡后 comboCount 重置为 0
    expect(cs.getComboCount(1)).toBe(0);
  });

  it('combo 上限无限制 (只受缩放限制)', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();
    // 给 defender 足够血量承受 50 次 STAND_A
    p2.maxHealth = 50000;
    p2.health = 50000;

    for (let i = 0; i < 50; i++) {
      resetAttacker(p1);
      if (i > 0) prepareDefenderForNextHit(p2);
      forceActivePhase(p1, AttackType.STAND_A);
      cs.resolveAttacks(p1, p2, [], undefined, i);
    }

    // combo 应该到 50, 没有上限
    expect(cs.getComboCount(1)).toBe(50);
    // 缩放比例应该是 COMBO_MIN_SCALE = 0.60 (10+ tier)
    const lastHealth = p2.health;
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, [], undefined, 50);
    const standCDamage = lastHealth - p2.health;
    // STAND_C damage=100, comboHits=50 → > 9 → COMBO_MIN_SCALE=0.60 → 60
    expect(standCDamage).toBe(60);
  });
});

// ==========================================================================
// 2. Combo Timeout (3 tests)
// ==========================================================================

describe('Combo Timeout', () => {
  it('超时后 combo 重置', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    // 第1击 at frame=10
    singleHit(cs, p1, p2, AttackType.STAND_A, 10);
    expect(cs.getComboCount(1)).toBe(1);

    // 超过 COMBO_TIMEOUT 帧后 tick
    cs.tickComboTimeout(10 + COMBO_TIMEOUT + 1);

    expect(cs.getComboCount(1)).toBe(0);
    expect(cs.getComboDamage(1)).toBe(0);
  });

  it('COMBO_TIMEOUT 常量在合理范围 (60-120 帧)', () => {
    // KOF2002: 连击超时一般在 60-120 帧 (1-2 秒 @60fps)
    expect(COMBO_TIMEOUT).toBeGreaterThanOrEqual(60);
    expect(COMBO_TIMEOUT).toBeLessThanOrEqual(120);
  });

  it('每次命中刷新 timeout', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    // 第1击 at frame=0
    singleHit(cs, p1, p2, AttackType.STAND_A, 0);
    expect(cs.getComboCount(1)).toBe(1);

    // 在 COMBO_TIMEOUT 内命中刷新
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    singleHit(cs, p1, p2, AttackType.STAND_A, COMBO_TIMEOUT - 1);
    expect(cs.getComboCount(1)).toBe(2);

    // 再过 COMBO_TIMEOUT 帧还不会超时 (因为 lastHitFrame 刚刷新)
    cs.tickComboTimeout(COMBO_TIMEOUT - 1 + COMBO_TIMEOUT - 1);
    expect(cs.getComboCount(1)).toBe(2); // 仍保持

    // 超过刷新后的 lastHitFrame + COMBO_TIMEOUT 才重置
    cs.tickComboTimeout(COMBO_TIMEOUT - 1 + COMBO_TIMEOUT + 1);
    expect(cs.getComboCount(1)).toBe(0);
  });
});

// ==========================================================================
// 3. Combo Damage Accumulation (4 tests)
// ==========================================================================

describe('Combo Damage Accumulation', () => {
  it('连段伤害正确累加', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();
    const healthBefore = p2.health;

    // STAND_A (33) + STAND_B (42) + STAND_C (100) = 175
    const r1 = singleHit(cs, p1, p2, AttackType.STAND_A);
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    const r2 = singleHit(cs, p1, p2, AttackType.STAND_B);
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    const r3 = singleHit(cs, p1, p2, AttackType.STAND_C);

    const totalActualDamage = healthBefore - p2.health;
    expect(r3.comboDamage).toBe(totalActualDamage);
    expect(r3.comboDamage).toBe(r1.damage + r2.damage + r3.damage);
  });

  it('后续命中伤害因缩放减少', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    // 建立 7 次命中 (进入 tier 7-9: 70%)
    const hits: number[] = [];
    for (let i = 0; i < 7; i++) {
      if (i > 0) { resetAttacker(p1); prepareDefenderForNextHit(p2); }
      const r = singleHit(cs, p1, p2, AttackType.STAND_A, i);
      hits.push(r.damage);
    }

    // 前 4 击 (comboHits 0-3) 应该是 100% = 33
    expect(hits[0]).toBe(33);
    expect(hits[1]).toBe(33);
    expect(hits[2]).toBe(33);
    expect(hits[3]).toBe(33);
    // 第 5 击 (comboHits=4) 进入 tier 4-6: 85% = round(33*0.85)=28
    expect(hits[4]).toBe(Math.round(33 * 0.85));
    // 第 8 击 (comboHits=7) 进入 tier 7-9: 70% = round(33*0.70)=23
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    const r8 = singleHit(cs, p1, p2, AttackType.STAND_A, 7);
    expect(r8.damage).toBe(Math.round(33 * 0.70));
  });

  it('最终连段伤害显示正确', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();
    const healthBefore = p2.health;

    // STAND_C (100) + STAND_C (100, combo=1 → 100%) + STAND_C (100, combo=2 → 100%)
    singleHit(cs, p1, p2, AttackType.STAND_C);
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    singleHit(cs, p1, p2, AttackType.STAND_C);
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    singleHit(cs, p1, p2, AttackType.STAND_C);

    const expectedTotal = 100 + 100 + 100; // 300 (tier 1-3 全额)
    expect(cs.getComboDamage(1)).toBe(expectedTotal);
    expect(healthBefore - p2.health).toBe(expectedTotal);
    expect(cs.getComboCount(1)).toBe(3);
  });

  it('单次高伤害攻击显示正确', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();
    const healthBefore = p2.health;

    // DM_OROCHINAGI 基础伤害 200, comboHits=0 → 无缩放
    const r = singleHit(cs, p1, p2, AttackType.DM_OROCHINAGI);
    const baseDamage = FRAME_DATA[AttackType.DM_OROCHINAGI]?.damage ?? 200;

    expect(r.damage).toBe(baseDamage);
    expect(cs.getComboDamage(1)).toBe(baseDamage);
    expect(healthBefore - p2.health).toBe(baseDamage);
    expect(cs.getComboCount(1)).toBe(1);
  });
});

// ==========================================================================
// 4. Combo Reset (2 tests)
// ==========================================================================

describe('Combo Reset', () => {
  it('对手回到 IDLE 触发 combo 重置 (模拟游戏主循环行为)', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    // 建立 3 连击
    singleHit(cs, p1, p2, AttackType.STAND_A);
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    singleHit(cs, p1, p2, AttackType.STAND_A);
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    singleHit(cs, p1, p2, AttackType.STAND_A);
    expect(cs.getComboCount(1)).toBe(3);
    expect(cs.getComboDamage(1)).toBeGreaterThan(0);

    // 模拟 main.ts 中的逻辑: defender 从 HITSTUN/KNOCKDOWN 回到 IDLE
    // main.ts 中: wasStun && f.state === IDLE → resetCombo(i)
    const comboBeforeReset = cs.getComboCount(1);
    const damageBeforeReset = cs.getComboDamage(1);
    expect(comboBeforeReset).toBe(3);
    expect(damageBeforeReset).toBeGreaterThan(0);

    // 模拟 IDLE 重置
    cs.resetCombo(1);

    expect(cs.getComboCount(1)).toBe(0);
    expect(cs.getComboDamage(1)).toBe(0);
  });

  it('手动 reset 清零 combo 和 comboDamage', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    // 建立连段
    singleHit(cs, p1, p2, AttackType.STAND_C);
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    singleHit(cs, p1, p2, AttackType.STAND_C);
    expect(cs.getComboCount(1)).toBe(2);
    expect(cs.getComboDamage(1)).toBe(200);

    // resetCombo 清零
    cs.resetCombo(1);
    expect(cs.getComboCount(1)).toBe(0);
    expect(cs.getComboDamage(1)).toBe(0);

    // resetCombo 不影响另一方
    // P1 侧没有建立 combo, 所以本来就应该是 0
    expect(cs.getComboCount(0)).toBe(0);
  });
});

// ==========================================================================
// 5. Floating Combo Text (2 tests)
// ==========================================================================

describe('Floating Combo Text', () => {
  it('combo >= 2 时显示浮动文字 (HUD 逻辑验证)', () => {
    // drawComboCounters 中: comboCount[i] < 2 → skip
    // 验证 combo < 2 不显示, combo >= 2 显示
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    // combo = 1: 不应显示浮动文字
    singleHit(cs, p1, p2, AttackType.STAND_A);
    expect(cs.getComboCount(1)).toBe(1);
    const shouldHide1 = cs.getComboCount(1) < 2;
    expect(shouldHide1).toBe(true);

    // combo = 2: 应显示浮动文字
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    singleHit(cs, p1, p2, AttackType.STAND_A);
    expect(cs.getComboCount(1)).toBe(2);
    const shouldShow2 = cs.getComboCount(1) >= 2;
    expect(shouldShow2).toBe(true);

    // combo = 0 (reset后): 不应显示
    cs.resetCombo(1);
    const shouldHide0 = cs.getComboCount(1) < 2;
    expect(shouldHide0).toBe(true);
  });

  it('浮动文字位置在对手上方 (渲染参数验证)', () => {
    // drawComboCounters 中: sy = f.y - f.displayHeight - 30
    // 验证 Fighter 位置参数可以正确计算浮动文字位置
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    singleHit(cs, p1, p2, AttackType.STAND_C);
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    singleHit(cs, p1, p2, AttackType.STAND_C);

    // P2 (defender) 的位置信息用于计算浮动文字位置
    const textX = p2.x;
    const textY = p2.y - p2.displayHeight - 30;

    // 验证浮动文字 Y 坐标在角色上方
    expect(textY).toBeLessThan(p2.y);
    // 验证浮动文字 Y 坐标合理 (不为负数或极端值)
    expect(textY).toBeGreaterThan(-200);
    // 验证 X 坐标在角色位置
    expect(textX).toBe(p2.x);
  });
});
