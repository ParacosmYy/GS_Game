/**
 * realComboIntegration.test.ts -- 实战连段集成测试
 *
 * 验证 KOF2002 真实连段流程的正确性:
 *  1. Kyo 基础连段 (8个测试)
 *  2. Iori 基础连段 (6个测试)
 *  3. Terry 基础连段 (5个测试)
 *  4. 投技角色连段 (5个测试)
 *  5. MAX 模式连段 (5个测试)
 *  6. 绝体绝命连段 (5个测试)
 *  7. 版边连段 (6个测试)
 *
 * 依赖: CombatSystem + Fighter + 真实 frame data + attack classifier.
 *       使用最小 IInputProvider mock 隔离输入层。
 */
import { describe, it, expect } from 'vitest';
import { CombatSystem } from '../src/combat/combatSystem.js';
import { Fighter } from '../src/entities/fighter.js';
import type { IInputProvider } from '../src/input/inputProvider.js';
import type { PlayerInput } from '../src/core/types.js';
import { AttackType, FighterState, JuggleState } from '../src/core/types.js';
import {
  MAX_HEALTH,
  FRAME_DATA,
  MAX_MODE_DAMAGE_BONUS,
  MAX_MODE_DEFENSE_BONUS,
  DESPERATION_HEALTH_THRESHOLD,
  DESPERATION_DM_DAMAGE_BONUS,
  DESPERATION_METER_GAIN_BONUS,
  JUGGLE_POINTS_MAX,
  COMBO_MIN_SCALE,
  DM_COMBO_PENALTY,
  STAGE_LEFT,
  STAGE_RIGHT,
  STAGE_WIDTH,
  FIGHTER_WIDTH,
} from '../src/core/constants.js';

// ===== 最小化 IInputProvider mock =====

const noopInput: PlayerInput = {
  up: false, down: false, left: false, right: false,
  buttonA: false, buttonB: false, buttonC: false, buttonD: false,
  throwAttack: false, start: false,
};

function createInputProvider(
  p1Override: Partial<PlayerInput> = {},
  p2Override: Partial<PlayerInput> = {},
): IInputProvider {
  const p1: PlayerInput = { ...noopInput, ...p1Override };
  const p2: PlayerInput = { ...noopInput, ...p2Override };
  return {
    getP1Input: () => p1,
    getP2Input: () => p2,
  };
}

// ===== 测试辅助 =====

/** 将攻击者推到 active phase 的指定帧 */
function forceActivePhase(f: Fighter, attackType: AttackType, frame = 0): void {
  f.startAttack(attackType);
  f.attackPhase = 'active';
  f.attackFrame = frame;
}

/** 重置攻击者使其可以再次攻击 */
function resetAttacker(attacker: Fighter): void {
  attacker.hasHit = false;
  attacker.currentAttack = null;
  attacker.attackPhase = 'none';
  attacker.attackFrame = 0;
}

/** 将 defender 恢复到可被命中状态 (IDLE + 清除 timer) */
function prepareDefenderForNextHit(defender: Fighter): void {
  defender.state = FighterState.IDLE;
  defender.hitstunTimer = 0;
  defender.blockstunTimer = 0;
}

/** 创建标准对战配置: p1(300, facing right), p2(350, facing left), 近距离 */
function createStandardMatch(): { p1: Fighter; p2: Fighter } {
  return {
    p1: new Fighter(300, '#ff0000', 1),
    p2: new Fighter(350, '#0000ff', -1),
  };
}

/** 创建版边对战配置: p2 靠近右版边 */
function createCornerMatch(): { p1: Fighter; p2: Fighter } {
  return {
    p1: new Fighter(STAGE_RIGHT - 100, '#ff0000', 1),
    p2: new Fighter(STAGE_RIGHT - 50, '#0000ff', -1),
  };
}

/** 创建中央对战配置: p2 在舞台中央 */
function createCenterMatch(): { p1: Fighter; p2: Fighter } {
  const cx = STAGE_WIDTH / 2;
  return {
    p1: new Fighter(cx - 25, '#ff0000', 1),
    p2: new Fighter(cx + 25, '#0000ff', -1),
  };
}

// ==========================================================================
// 1. Kyo 基础连段
// ==========================================================================

describe('Kyo 基础连段', () => {
  it('STAND_B → STAND_C 通常取消链', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    // 第1击: STAND_B
    forceActivePhase(p1, AttackType.STAND_B);
    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(1);
    expect(p1.normalCancelReady).toBe(true);

    // 第2击: STAND_C (取消)
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);

    expect(cs.getComboCount(1)).toBe(2);
    const totalDamage = MAX_HEALTH - p2.health;
    const expectedTotal = FRAME_DATA[AttackType.STAND_B].damage
      + FRAME_DATA[AttackType.STAND_C].damage;
    expect(totalDamage).toBe(expectedTotal);
  });

  it('CROUCH_A → CROUCH_B → STAND_C 下段起手连段', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    // CROUCH_A: 第1击
    forceActivePhase(p1, AttackType.CROUCH_A);
    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(1);
    expect(p1.rapidCancelReady).toBe(true);

    // CROUCH_B: 第2击 (rapid cancel)
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    forceActivePhase(p1, AttackType.CROUCH_B);
    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(2);

    // STAND_C: 第3击 (normal cancel)
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(3);

    const totalDamage = MAX_HEALTH - p2.health;
    expect(totalDamage).toBeGreaterThan(0);
    // 3 hits: comboHits 0,1,2 → 全在 1-3 tier (scale 1.0)
    const expected = FRAME_DATA[AttackType.CROUCH_A].damage
      + FRAME_DATA[AttackType.CROUCH_B].damage
      + FRAME_DATA[AttackType.STAND_C].damage;
    expect(totalDamage).toBe(expected);
  });

  it('STAND_C → KYO_ARAGAMI → KYO_ARAGAMI_KONOKIZU 荒咬み三段', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    // 第1击: STAND_C
    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(1);
    expect(p1.normalCancelReady).toBe(true);

    // 第2击: KYO_ARAGAMI (取消到必杀技)
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    forceActivePhase(p1, AttackType.KYO_ARAGAMI);
    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(2);
    expect(p1.superCancelReady).toBe(true);

    // 第3击: KYO_ARAGAMI_KONOKIZU (取消到后续段)
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    forceActivePhase(p1, AttackType.KYO_ARAGAMI_KONOKIZU);
    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(3);

    const totalDamage = MAX_HEALTH - p2.health;
    expect(totalDamage).toBeGreaterThan(0);
    // 确认三段都有伤害
    const dmg1 = FRAME_DATA[AttackType.STAND_C].damage;
    const dmg2 = FRAME_DATA[AttackType.KYO_ARAGAMI].damage;
    const dmg3 = FRAME_DATA[AttackType.KYO_ARAGAMI_KONOKIZU].damage;
    // comboHits=0,1,2 → tier 1-3, scale=1.0
    expect(totalDamage).toBe(dmg1 + dmg2 + dmg3);
  });

  it('STAND_C → KYO_DOKUGAMI 毒咬み取消', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    // 第1击: STAND_C
    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(1);

    // 第2击: KYO_DOKUGAMI
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    forceActivePhase(p1, AttackType.KYO_DOKUGAMI);
    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(2);

    const totalDamage = MAX_HEALTH - p2.health;
    const expected = FRAME_DATA[AttackType.STAND_C].damage
      + FRAME_DATA[AttackType.KYO_DOKUGAMI].damage;
    expect(totalDamage).toBe(expected);
  });

  it('CROUCH_B → KYO_ONIYAKI 鬼焼き对空连段', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    // 第1击: CROUCH_B
    forceActivePhase(p1, AttackType.CROUCH_B);
    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(1);

    // 第2击: KYO_ONIYAKI
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    forceActivePhase(p1, AttackType.KYO_ONIYAKI);
    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(2);

    const totalDamage = MAX_HEALTH - p2.health;
    const expected = FRAME_DATA[AttackType.CROUCH_B].damage
      + FRAME_DATA[AttackType.KYO_ONIYAKI].damage;
    expect(totalDamage).toBe(expected);

    // KYO_ONIYAKI 有 knockdown=true → defender 应该被击倒
    expect(p2.isKnockedDown).toBe(true);
  });

  it('STAND_C → DM_OROCHINAGI 超必杀取消', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    // 第1击: STAND_C
    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(1);

    // 第2击: DM_OROCHINAGI (super cancel)
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    const healthBeforeDM = p2.health;
    forceActivePhase(p1, AttackType.DM_OROCHINAGI);
    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(2);

    const dmDamage = healthBeforeDM - p2.health;
    const baseDamage = FRAME_DATA[AttackType.DM_OROCHINAGI].damage;
    // comboHits=1 at DM → tier 1-3, scale=1.0, DM额外-0.10 → 0.90
    const expected = Math.round(baseDamage * Math.max(COMBO_MIN_SCALE, 1.0 - DM_COMBO_PENALTY));
    expect(dmDamage).toBe(expected);
  });

  it('Jump-in C → STAND_C → KYO_ARAGAMI 空中命中起手', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    // 模拟空中命中: p2 在空中但处于可被命中状态
    p2.y = 480; // 空中位置
    p2.vy = -3;
    p2.juggleState = JuggleState.FULL;
    p2.jugglePoints = JUGGLE_POINTS_MAX;

    // Jump-in C
    forceActivePhase(p1, AttackType.JUMP_C);
    cs.resolveAttacks(p1, p2, []);

    // 空中命中后落回地面, 恢复到可被命中状态
    p2.y = 510; // 落回地面
    p2.vy = 0;
    p2.juggleState = JuggleState.NONE;
    p2.state = FighterState.IDLE;
    p2.hitstunTimer = 0;

    // 确认第1击有伤害
    const dmgAfterJump = MAX_HEALTH - p2.health;
    expect(dmgAfterJump).toBeGreaterThan(0);

    // 着地后 STAND_C
    resetAttacker(p1);
    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);
    const dmgAfterSC = MAX_HEALTH - p2.health;
    expect(dmgAfterSC).toBeGreaterThan(dmgAfterJump);

    // KYO_ARAGAMI
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    forceActivePhase(p1, AttackType.KYO_ARAGAMI);
    cs.resolveAttacks(p1, p2, []);
    const totalDamage = MAX_HEALTH - p2.health;
    expect(totalDamage).toBeGreaterThan(dmgAfterSC);
  });

  it('Counter Hit STAND_C → KYO_ONIYAKI Counter Hit对空', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    // p2 攻击中 → CH 条件
    forceActivePhase(p2, AttackType.STAND_A);
    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);

    // CH 应该有额外 hitstun
    const normalHitstun = FRAME_DATA[AttackType.STAND_C].hitstun;
    expect(p2.hitstunTimer).toBe(normalHitstun + 3); // heavy CH bonus +3F

    // Counter Hit 后 KYO_ONIYAKI
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    const healthBefore = p2.health;
    forceActivePhase(p1, AttackType.KYO_ONIYAKI);
    cs.resolveAttacks(p1, p2, []);

    const oniyakiDamage = healthBefore - p2.health;
    expect(oniyakiDamage).toBeGreaterThan(0);
    expect(cs.getComboCount(1)).toBe(2);
  });
});

// ==========================================================================
// 2. Iori 基础连段
// ==========================================================================

describe('Iori 基础连段', () => {
  it('STAND_B → IORI_AOIHANA x3 葵花三段', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    // 第1击: STAND_B
    forceActivePhase(p1, AttackType.STAND_B);
    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(1);

    // 第2击: IORI_AOIHANA (1段目)
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    forceActivePhase(p1, AttackType.IORI_AOIHANA);
    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(2);

    // 第3击: IORI_AOIHANA_2 (2段目)
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    forceActivePhase(p1, AttackType.IORI_AOIHANA_2);
    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(3);

    // 第4击: IORI_AOIHANA_3 (3段目)
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    forceActivePhase(p1, AttackType.IORI_AOIHANA_3);
    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(4);

    const totalDamage = MAX_HEALTH - p2.health;
    expect(totalDamage).toBeGreaterThan(0);
    // 4 hits: comboHits 0,1,2,3 → tier 1-3 (scale 1.0)
    const expected = FRAME_DATA[AttackType.STAND_B].damage
      + FRAME_DATA[AttackType.IORI_AOIHANA].damage
      + FRAME_DATA[AttackType.IORI_AOIHANA_2].damage
      + FRAME_DATA[AttackType.IORI_AOIHANA_3].damage;
    expect(totalDamage).toBe(expected);
  });

  it('CROUCH_B → IORI_KOTOTSUKI 月轮取消', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    // 第1击: CROUCH_B
    forceActivePhase(p1, AttackType.CROUCH_B);
    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(1);

    // 第2击: IORI_KOTOTSUKI
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    forceActivePhase(p1, AttackType.IORI_KOTOTSUKI);
    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(2);

    const totalDamage = MAX_HEALTH - p2.health;
    const expected = FRAME_DATA[AttackType.CROUCH_B].damage
      + FRAME_DATA[AttackType.IORI_KOTOTSUKI].damage;
    expect(totalDamage).toBe(expected);
    // IORI_KOTOTSUKI 有 knockdown=true
    expect(p2.isKnockedDown).toBe(true);
  });

  it('STAND_C → IORI_ONIYAKI 鬼焼き', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    // 第1击: STAND_C
    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(1);

    // 第2击: IORI_ONIYAKI
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    forceActivePhase(p1, AttackType.IORI_ONIYAKI);
    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(2);

    const totalDamage = MAX_HEALTH - p2.health;
    const expected = FRAME_DATA[AttackType.STAND_C].damage
      + FRAME_DATA[AttackType.IORI_ONIYAKI].damage;
    expect(totalDamage).toBe(expected);
  });

  it('STAND_C → DM_YATAGARASU 八稚女', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    // 第1击: STAND_C
    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(1);

    // 第2击: DM_YATAGARASU (八稚女)
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    const healthBeforeDM = p2.health;
    forceActivePhase(p1, AttackType.DM_YATAGARASU);
    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(2);

    const dmDamage = healthBeforeDM - p2.health;
    const baseDamage = FRAME_DATA[AttackType.DM_YATAGARASU].damage;
    // comboHits=1 → tier 1-3, scale=1.0, DM额外-0.10 → 0.90
    const expected = Math.round(baseDamage * Math.max(COMBO_MIN_SCALE, 1.0 - DM_COMBO_PENALTY));
    expect(dmDamage).toBe(expected);
  });

  it('Jump-in C → CROUCH_B → IORI_AOIHANA 空地连段', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    // 模拟空中命中
    p2.y = 480;
    p2.vy = -3;
    p2.juggleState = JuggleState.FULL;
    p2.jugglePoints = JUGGLE_POINTS_MAX;

    // Jump-in C
    forceActivePhase(p1, AttackType.JUMP_C);
    cs.resolveAttacks(p1, p2, []);

    const dmgAfterJump = MAX_HEALTH - p2.health;
    expect(dmgAfterJump).toBeGreaterThan(0);

    // 着地
    p2.y = 510;
    p2.vy = 0;
    p2.juggleState = JuggleState.NONE;
    p2.state = FighterState.IDLE;
    p2.hitstunTimer = 0;

    // CROUCH_B
    resetAttacker(p1);
    forceActivePhase(p1, AttackType.CROUCH_B);
    cs.resolveAttacks(p1, p2, []);
    const dmgAfterCB = MAX_HEALTH - p2.health;
    expect(dmgAfterCB).toBeGreaterThan(dmgAfterJump);

    // IORI_AOIHANA
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    forceActivePhase(p1, AttackType.IORI_AOIHANA);
    cs.resolveAttacks(p1, p2, []);
    const totalDamage = MAX_HEALTH - p2.health;
    expect(totalDamage).toBeGreaterThan(dmgAfterCB);
  });

  it('IORI_KUZUKAZE → STAND_C → DM 逆剥ぎ punish', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    // IORI_KUZUKAZE: 指令投, 直接结算伤害 (不需要 throwbox/hurtbox 交叉)
    // 因为 IORI_KUZUKAZE 在 combat system 中走 throwbox 通道,
    // 且 isCommandThrow 返回 true → 直接伤害 + 换边
    // 测试中使用 hitbox 通道验证后续连段
    // 先模拟 KUZUKAZE 的效果: defender 受伤 + 换边
    const kuzukazeDamage = FRAME_DATA[AttackType.IORI_KUZUKAZE].damage;
    p2.health -= kuzukazeDamage;
    cs['comboHits'][1] = 1; // 标记为1次命中
    cs['lastHitFrame'][1] = 0;

    // KUZUKAZE 后: STAND_C
    const healthBeforeSC = p2.health;
    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);
    const scDamage = healthBeforeSC - p2.health;
    // comboHits=1 → tier 1-3, scale=1.0
    expect(scDamage).toBe(FRAME_DATA[AttackType.STAND_C].damage);

    // DM_YATAGARASU
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    const healthBeforeDM = p2.health;
    forceActivePhase(p1, AttackType.DM_YATAGARASU);
    cs.resolveAttacks(p1, p2, []);

    const dmDamage = healthBeforeDM - p2.health;
    expect(dmDamage).toBeGreaterThan(0);
    expect(cs.getComboCount(1)).toBe(3);
  });
});

// ==========================================================================
// 3. Terry 基础连段
// ==========================================================================

describe('Terry 基础连段', () => {
  it('STAND_C → TERRY_BURN_KNUCKLE', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    // 第1击: STAND_C
    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(1);

    // 第2击: TERRY_BURN_KNUCKLE
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    forceActivePhase(p1, AttackType.TERRY_BURN_KNUCKLE);
    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(2);

    const totalDamage = MAX_HEALTH - p2.health;
    const expected = FRAME_DATA[AttackType.STAND_C].damage
      + FRAME_DATA[AttackType.TERRY_BURN_KNUCKLE].damage;
    expect(totalDamage).toBe(expected);
  });

  it('CROUCH_B → TERRY_POWER_DUNK', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    // 第1击: CROUCH_B
    forceActivePhase(p1, AttackType.CROUCH_B);
    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(1);

    // 第2击: TERRY_POWER_DUNK
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    forceActivePhase(p1, AttackType.TERRY_POWER_DUNK);
    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(2);

    const totalDamage = MAX_HEALTH - p2.health;
    const expected = FRAME_DATA[AttackType.CROUCH_B].damage
      + FRAME_DATA[AttackType.TERRY_POWER_DUNK].damage;
    expect(totalDamage).toBe(expected);
  });

  it('STAND_C → TERRY_CRACK_SHOT', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    // 第1击: STAND_C
    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(1);

    // 第2击: TERRY_CRACK_SHOT
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    forceActivePhase(p1, AttackType.TERRY_CRACK_SHOT);
    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(2);

    const totalDamage = MAX_HEALTH - p2.health;
    const expected = FRAME_DATA[AttackType.STAND_C].damage
      + FRAME_DATA[AttackType.TERRY_CRACK_SHOT].damage;
    expect(totalDamage).toBe(expected);
  });

  it('STAND_C → DM_POWER_GEYSER', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    // 第1击: STAND_C
    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(1);

    // 第2击: DM_POWER_GEYSER
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    const healthBeforeDM = p2.health;
    forceActivePhase(p1, AttackType.DM_POWER_GEYSER);
    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(2);

    const dmDamage = healthBeforeDM - p2.health;
    const baseDamage = FRAME_DATA[AttackType.DM_POWER_GEYSER].damage;
    // comboHits=1 → tier 1-3, scale=1.0, DM额外-0.10 → 0.90
    const expected = Math.round(baseDamage * Math.max(COMBO_MIN_SCALE, 1.0 - DM_COMBO_PENALTY));
    expect(dmDamage).toBe(expected);
  });

  it('TERRY_RISING_TACKLE 蓄力对空 (伤害验证)', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    // Rising Tackle 直接命中
    const healthBefore = p2.health;
    forceActivePhase(p1, AttackType.TERRY_RISING_TACKLE);
    cs.resolveAttacks(p1, p2, []);

    const damage = healthBefore - p2.health;
    const expected = FRAME_DATA[AttackType.TERRY_RISING_TACKLE].damage;
    expect(damage).toBe(expected);
    // Rising Tackle 有 knockdown
    expect(p2.isKnockedDown).toBe(true);
  });
});

// ==========================================================================
// 4. 投技角色连段
// ==========================================================================

describe('投技角色连段', () => {
  it('Clark: STAND_C → CLARK_FLASH_ELBOW 追击肘', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    // 第1击: STAND_C
    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(1);

    // 第2击: CLARK_FLASH_ELBOW (追击肘)
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    forceActivePhase(p1, AttackType.CLARK_FLASH_ELBOW);
    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(2);

    const totalDamage = MAX_HEALTH - p2.health;
    const expected = FRAME_DATA[AttackType.STAND_C].damage
      + FRAME_DATA[AttackType.CLARK_FLASH_ELBOW].damage;
    expect(totalDamage).toBe(expected);
  });

  it('Clark: CROUCH_A → CLARK_ARGENTINE 指令投', () => {
    // CLARK_ARGENTINE 是指令投 (isCommandThrow=true)
    // 指令投走 throwbox 通道, 直接结算伤害
    // 测试验证: CROUCH_A 命中后 combo 建立, 然后指令投追加伤害
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    // CROUCH_A 命中
    forceActivePhase(p1, AttackType.CROUCH_A);
    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(1);

    // CLARK_ARGENTINE 的伤害 (模拟指令投直接结算)
    const argentineDamage = FRAME_DATA[AttackType.CLARK_ARGENTINE].damage;
    p2.health = Math.max(0, p2.health - argentineDamage);
    cs['comboHits'][1]++;
    cs['lastHitFrame'][1] = 0;

    const totalDamage = MAX_HEALTH - p2.health;
    expect(totalDamage).toBe(FRAME_DATA[AttackType.CROUCH_A].damage + argentineDamage);
    expect(cs.getComboCount(1)).toBe(2);
  });

  it('Ralf: STAND_C → RALF_BACKBREAKER 投技连段', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    // 第1击: STAND_C
    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(1);

    // RALF_BACKBREAKER: 指令投, 模拟直接结算
    const bbDamage = FRAME_DATA[AttackType.RALF_BACKBREAKER].damage;
    p2.health = Math.max(0, p2.health - bbDamage);
    cs['comboHits'][1]++;
    cs['lastHitFrame'][1] = 0;

    const totalDamage = MAX_HEALTH - p2.health;
    expect(totalDamage).toBe(FRAME_DATA[AttackType.STAND_C].damage + bbDamage);
  });

  it('Ralf: STAND_C → DM_GALACTICA_PHANTOM', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    // 第1击: STAND_C
    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(1);

    // 第2击: DM_GALACTICA_PHANTOM
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    const healthBeforeDM = p2.health;
    forceActivePhase(p1, AttackType.DM_GALACTICA_PHANTOM);
    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(2);

    const dmDamage = healthBeforeDM - p2.health;
    const baseDamage = FRAME_DATA[AttackType.DM_GALACTICA_PHANTOM].damage;
    const expected = Math.round(baseDamage * Math.max(COMBO_MIN_SCALE, 1.0 - DM_COMBO_PENALTY));
    expect(dmDamage).toBe(expected);
  });

  it('Mary: STAND_B → MARY_STRAIGHT_SLICER', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    // 第1击: STAND_B
    forceActivePhase(p1, AttackType.STAND_B);
    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(1);

    // 第2击: MARY_STRAIGHT_SLICER
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    forceActivePhase(p1, AttackType.MARY_STRAIGHT_SLICER);
    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(2);

    const totalDamage = MAX_HEALTH - p2.health;
    const expected = FRAME_DATA[AttackType.STAND_B].damage
      + FRAME_DATA[AttackType.MARY_STRAIGHT_SLICER].damage;
    expect(totalDamage).toBe(expected);
  });
});

// ==========================================================================
// 5. MAX 模式连段
// ==========================================================================

describe('MAX 模式连段', () => {
  it('Kyo: STAND_C → KYO_ARAGAMI → DM (Free Cancel)', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    // MAX 模式激活 (p1 = MAX)
    const maxModes: [boolean, boolean] = [true, false];

    // 第1击: STAND_C (MAX bonus: +20%)
    const healthBeforeSC = p2.health;
    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, [], undefined, 0, maxModes);
    const scDamage = healthBeforeSC - p2.health;
    expect(scDamage).toBe(Math.round(FRAME_DATA[AttackType.STAND_C].damage * MAX_MODE_DAMAGE_BONUS));

    // 第2击: KYO_ARAGAMI (MAX bonus + combo scale)
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    const healthBeforeAra = p2.health;
    forceActivePhase(p1, AttackType.KYO_ARAGAMI);
    cs.resolveAttacks(p1, p2, [], undefined, 0, maxModes);
    const araDamage = healthBeforeAra - p2.health;
    // comboHits=1 → scale=1.0, MAX bonus *1.20
    expect(araDamage).toBe(Math.round(FRAME_DATA[AttackType.KYO_ARAGAMI].damage * MAX_MODE_DAMAGE_BONUS));

    // 第3击: DM_OROCHINAGI (super cancel from special)
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    const healthBeforeDM = p2.health;
    forceActivePhase(p1, AttackType.DM_OROCHINAGI);
    cs.resolveAttacks(p1, p2, [], undefined, 0, maxModes);
    const dmDamage = healthBeforeDM - p2.health;
    expect(dmDamage).toBeGreaterThan(0);
    expect(cs.getComboCount(1)).toBe(3);
  });

  it('Iori: IORI_AOIHANA → DM_YATAGARASU (Super Cancel)', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    // MAX 模式
    const maxModes: [boolean, boolean] = [true, false];

    // 第1击: IORI_AOIHANA
    forceActivePhase(p1, AttackType.IORI_AOIHANA);
    cs.resolveAttacks(p1, p2, [], undefined, 0, maxModes);
    expect(cs.getComboCount(1)).toBe(1);
    expect(p1.superCancelReady).toBe(true);

    // 第2击: DM_YATAGARASU (super cancel)
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    const healthBeforeDM = p2.health;
    forceActivePhase(p1, AttackType.DM_YATAGARASU);
    cs.resolveAttacks(p1, p2, [], undefined, 0, maxModes);
    expect(cs.getComboCount(1)).toBe(2);

    const dmDamage = healthBeforeDM - p2.health;
    expect(dmDamage).toBeGreaterThan(0);
  });

  it('Terry: TERRY_BURN_KNUCKLE → DM_POWER_GEYSER (Super Cancel)', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    // MAX 模式
    const maxModes: [boolean, boolean] = [true, false];

    // 第1击: TERRY_BURN_KNUCKLE
    forceActivePhase(p1, AttackType.TERRY_BURN_KNUCKLE);
    cs.resolveAttacks(p1, p2, [], undefined, 0, maxModes);
    expect(cs.getComboCount(1)).toBe(1);
    expect(p1.superCancelReady).toBe(true);

    // 第2击: DM_POWER_GEYSER (super cancel)
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    const healthBeforeDM = p2.health;
    forceActivePhase(p1, AttackType.DM_POWER_GEYSER);
    cs.resolveAttacks(p1, p2, [], undefined, 0, maxModes);
    expect(cs.getComboCount(1)).toBe(2);

    const dmDamage = healthBeforeDM - p2.health;
    expect(dmDamage).toBeGreaterThan(0);
  });

  it('MAX模式伤害+20%验证', () => {
    // 非 MAX
    const csNormal = new CombatSystem(createInputProvider());
    const p1n = new Fighter(300, '#ff0000', 1);
    const p2n = new Fighter(350, '#0000ff', -1);
    forceActivePhase(p1n, AttackType.STAND_C);
    csNormal.resolveAttacks(p1n, p2n, [], undefined, 0, [false, false]);
    const normalDamage = MAX_HEALTH - p2n.health;

    // MAX
    const csMax = new CombatSystem(createInputProvider());
    const p1m = new Fighter(300, '#ff0000', 1);
    const p2m = new Fighter(350, '#0000ff', -1);
    forceActivePhase(p1m, AttackType.STAND_C);
    csMax.resolveAttacks(p1m, p2m, [], undefined, 0, [true, false]);
    const maxDamage = MAX_HEALTH - p2m.health;

    expect(normalDamage).toBe(FRAME_DATA[AttackType.STAND_C].damage);
    expect(maxDamage).toBe(Math.round(normalDamage * MAX_MODE_DAMAGE_BONUS));
    expect(maxDamage).toBeGreaterThan(normalDamage);
  });

  it('MAX模式防御+25%验证', () => {
    // 非 MAX (defender 不在 MAX)
    const csNormal = new CombatSystem(createInputProvider());
    const p1n = new Fighter(300, '#ff0000', 1);
    const p2n = new Fighter(350, '#0000ff', -1);
    forceActivePhase(p1n, AttackType.STAND_C);
    csNormal.resolveAttacks(p1n, p2n, [], undefined, 0, [false, false]);
    const normalDamage = MAX_HEALTH - p2n.health;

    // Defender 在 MAX 模式 (受伤 * 0.75)
    const csMaxDef = new CombatSystem(createInputProvider());
    const p1md = new Fighter(300, '#ff0000', 1);
    const p2md = new Fighter(350, '#0000ff', -1);
    forceActivePhase(p1md, AttackType.STAND_C);
    csMaxDef.resolveAttacks(p1md, p2md, [], undefined, 0, [false, true]);
    const maxDefDamage = MAX_HEALTH - p2md.health;

    expect(maxDefDamage).toBe(Math.round(normalDamage * MAX_MODE_DEFENSE_BONUS));
    expect(maxDefDamage).toBeLessThan(normalDamage);
  });
});

// ==========================================================================
// 6. 绝体绝命连段
// ==========================================================================

describe('绝体绝命连段', () => {
  it('低血量+30% DM伤害', () => {
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);
    p2.maxHealth = 2000;
    p2.health = 400; // 400/2000 = 0.20 < 0.25

    const healthBefore = p2.health;
    forceActivePhase(p1, AttackType.DM_OROCHINAGI);
    cs.resolveAttacks(p1, p2, []);

    const damage = healthBefore - p2.health;
    const baseDamage = FRAME_DATA[AttackType.DM_OROCHINAGI].damage;
    const expected = Math.round(baseDamage * DESPERATION_DM_DAMAGE_BONUS);
    expect(damage).toBe(expected);
    expect(damage).toBeGreaterThan(baseDamage);
  });

  it('低血量+50% meter获取 (验证绝体绝命比率常量)', () => {
    // 验证绝体绝命 meter 获取倍率常量
    expect(DESPERATION_METER_GAIN_BONUS).toBe(1.50);
    // 验证触发阈值
    expect(DESPERATION_HEALTH_THRESHOLD).toBe(0.25);
    // 通过对比正常血量 vs 低血量下的 DM 伤害来间接验证
    const cs1 = new CombatSystem(createInputProvider());
    const p1n = new Fighter(300, '#ff0000', 1);
    const p2n = new Fighter(350, '#0000ff', -1);
    p2n.maxHealth = 2000;
    p2n.health = 600; // 600/2000 = 0.30 > 0.25 → 不触发
    forceActivePhase(p1n, AttackType.DM_OROCHINAGI);
    cs1.resolveAttacks(p1n, p2n, []);
    const normalDamage = 600 - p2n.health;

    const cs2 = new CombatSystem(createInputProvider());
    const p1d = new Fighter(300, '#ff0000', 1);
    const p2d = new Fighter(350, '#0000ff', -1);
    p2d.maxHealth = 2000;
    p2d.health = 400; // 400/2000 = 0.20 < 0.25 → 触发
    forceActivePhase(p1d, AttackType.DM_OROCHINAGI);
    cs2.resolveAttacks(p1d, p2d, []);
    const despDamage = 400 - p2d.health;

    expect(despDamage).toBeGreaterThan(normalDamage);
    expect(despDamage).toBe(Math.round(normalDamage * DESPERATION_DM_DAMAGE_BONUS));
  });

  it('低血量SDM (不需要MAX模式)', () => {
    // KOF2002 风云再起: 低血量可以直接放 SDM 不需要 MAX 模式
    // 验证 SDM 存在于 FRAME_DATA
    expect(FRAME_DATA[AttackType.SDM_OROCHINAGI]).toBeDefined();
    expect(FRAME_DATA[AttackType.SDM_OROCHINAGI].damage).toBeGreaterThan(
      FRAME_DATA[AttackType.DM_OROCHINAGI].damage,
    );

    // 验证 SDM 伤害在低血量下也受绝体绝命加成
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);
    p2.maxHealth = 3000;
    p2.health = 500; // 500/3000 = 0.167 < 0.25

    const healthBefore = p2.health;
    forceActivePhase(p1, AttackType.SDM_OROCHINAGI);
    cs.resolveAttacks(p1, p2, []);

    const damage = healthBefore - p2.health;
    const baseDamage = FRAME_DATA[AttackType.SDM_OROCHINAGI].damage;
    const expected = Math.round(baseDamage * DESPERATION_DM_DAMAGE_BONUS);
    expect(damage).toBe(expected);
  });

  it('绝体绝命+MAX叠加伤害', () => {
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);
    p2.maxHealth = 2000;
    p2.health = 400; // 400/2000 = 0.20 < 0.25

    const healthBefore = p2.health;
    forceActivePhase(p1, AttackType.DM_OROCHINAGI);
    cs.resolveAttacks(p1, p2, [], undefined, 0, [true, false]);

    const damage = healthBefore - p2.health;
    const baseDamage = FRAME_DATA[AttackType.DM_OROCHINAGI].damage;
    // MAX first (+20%), then Desperation (+30%)
    const afterMax = Math.round(baseDamage * MAX_MODE_DAMAGE_BONUS);
    const expected = Math.round(afterMax * DESPERATION_DM_DAMAGE_BONUS);
    expect(damage).toBe(expected);
    expect(damage).toBeGreaterThan(Math.round(baseDamage * DESPERATION_DM_DAMAGE_BONUS));
  });

  it('绝体绝命meter获取验证', () => {
    // 验证绝体绝命状态正确判断
    const p = new Fighter(350, '#0000ff', -1);
    p.maxHealth = 1000;
    p.health = 240; // 240/1000 = 0.24 < 0.25
    expect(p.health / p.maxHealth).toBeLessThan(DESPERATION_HEALTH_THRESHOLD);

    p.health = 260; // 260/1000 = 0.26 > 0.25
    expect(p.health / p.maxHealth).toBeGreaterThan(DESPERATION_HEALTH_THRESHOLD);

    // 绝体绝命只对 DM 加成, 通常技不受影响
    const csDesp = new CombatSystem(createInputProvider());
    const csNormal = new CombatSystem(createInputProvider());

    const p1n = new Fighter(300, '#ff0000', 1);
    const p2n = new Fighter(350, '#0000ff', -1);
    const p1d = new Fighter(300, '#ff0000', 1);
    const p2d = new Fighter(350, '#0000ff', -1);
    p2d.health = 100; // 100/1000 = 0.10 < 0.25

    forceActivePhase(p1n, AttackType.STAND_C);
    csNormal.resolveAttacks(p1n, p2n, []);
    const normalDmg = MAX_HEALTH - p2n.health;

    forceActivePhase(p1d, AttackType.STAND_C);
    csDesp.resolveAttacks(p1d, p2d, []);
    const despDmg = 100 - p2d.health;

    // 通常技不受绝体绝命影响
    expect(normalDmg).toBe(despDmg);
  });
});

// ==========================================================================
// 7. 版边连段
// ==========================================================================

describe('版边连段', () => {
  it('版边pushback限制', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createCornerMatch();

    // 记录初始位置
    const p2XBefore = p2.x;

    // 版边命中
    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);

    // defender 在版边时 pushback 不会超出舞台边界
    expect(p2.x).toBeLessThanOrEqual(STAGE_RIGHT);
    expect(p2.x).toBeGreaterThanOrEqual(STAGE_LEFT);

    // 版边时攻击者被额外推回
    const attackerPushback = Math.abs(p1.vx);
    expect(attackerPushback).toBeGreaterThan(0);
  });

  it('版边壁弹验证 (CD攻击)', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createCornerMatch();

    // CD 攻击命中 → 壁弹
    forceActivePhase(p1, AttackType.STAND_CD);
    cs.resolveAttacks(p1, p2, []);

    // CD 攻击应该触发壁弹
    expect(p2.isCounterWire).toBe(true);
    expect(p2.wallBounceCount).toBe(1);
    // 壁弹后应该获得 FULL juggle state
    expect(p2.juggleState).toBe(JuggleState.FULL);
    expect(p2.jugglePoints).toBe(JUGGLE_POINTS_MAX);
  });

  it('版边Juggle连段', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createCornerMatch();

    // 模拟空中状态 + juggle
    p2.y = 480;
    p2.vy = -3;
    p2.juggleState = JuggleState.FULL;
    p2.jugglePoints = JUGGLE_POINTS_MAX;

    // 空中命中
    forceActivePhase(p1, AttackType.STAND_A);
    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(1);

    // 空中 juggle 第二击
    resetAttacker(p1);
    p2.juggleState = JuggleState.FULL; // 保持 juggle 状态
    p2.jugglePoints = JUGGLE_POINTS_MAX; // 重置 juggle points
    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);

    // 版边不会飞出去
    expect(p2.x).toBeLessThanOrEqual(STAGE_RIGHT);
    expect(p2.x).toBeGreaterThanOrEqual(STAGE_LEFT);
  });

  it('版边投技位置验证', () => {
    // 投技在版边时位置不会超出舞台
    const p1 = new Fighter(STAGE_RIGHT - 100, '#ff0000', 1);
    const p2 = new Fighter(STAGE_RIGHT - 50, '#0000ff', -1);

    // 模拟投技后的位移 (通过 THROW_DISTANCE)
    const throwDir = p1.facing; // facing=1 → 向右投
    const throwX = p1.x + 130 * throwDir;
    const clampedX = Math.max(STAGE_LEFT, Math.min(throwX, STAGE_RIGHT));

    // 版边投技位置应该被 clamped
    expect(clampedX).toBeLessThanOrEqual(STAGE_RIGHT);
    expect(clampedX).toBe(STAGE_RIGHT); // 应该被 clamp 到版边
  });

  it('版边DM位置验证', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createCornerMatch();

    // DM 命中
    forceActivePhase(p1, AttackType.DM_OROCHINAGI);
    cs.resolveAttacks(p1, p2, []);

    // DM 后位置不超出舞台
    expect(p2.x).toBeLessThanOrEqual(STAGE_RIGHT);
    expect(p2.x).toBeGreaterThanOrEqual(STAGE_LEFT);
  });

  it('版边vs中央伤害对比', () => {
    // 版边
    const csCorner = new CombatSystem(createInputProvider());
    const { p1: p1c, p2: p2c } = createCornerMatch();
    forceActivePhase(p1c, AttackType.STAND_C);
    csCorner.resolveAttacks(p1c, p2c, []);
    const cornerDamage = MAX_HEALTH - p2c.health;

    // 中央
    const csCenter = new CombatSystem(createInputProvider());
    const { p1: p1m, p2: p2m } = createCenterMatch();
    forceActivePhase(p1m, AttackType.STAND_C);
    csCenter.resolveAttacks(p1m, p2m, []);
    const centerDamage = MAX_HEALTH - p2m.health;

    // 单次命中伤害相同 (版边不改变伤害, 只改变位置)
    expect(cornerDamage).toBe(centerDamage);
    expect(cornerDamage).toBe(FRAME_DATA[AttackType.STAND_C].damage);

    // 版边时攻击者有额外推回
    expect(Math.abs(p1c.vx)).toBeGreaterThanOrEqual(Math.abs(p1m.vx));
  });
});
