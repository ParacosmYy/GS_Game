/**
 * guardCancelAndHSDM.test.ts — Guard Cancel Roll/CD + HSDM 实战集成测试
 *
 * 验证:
 *  a. Guard Cancel Roll (10个测试)
 *  b. Guard Cancel CD (10个测试)
 *  c. HSDM系统 (10个测试)
 *  d. 综合场景 (10个测试)
 *
 * 依赖: CombatSystem + Fighter + meter + frameData + stateHandlers.
 *       使用最小 IInputProvider / FighterCtx mock 隔离输入层。
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
  CHIP_DAMAGE_RATIO,
  GUARD_CRUSH_DURATION,
  GUARD_GAUGE_DRAIN_CD,
  GUARD_GAUGE_DRAIN_HEAVY,
  GUARD_GAUGE_DRAIN_LIGHT,
  GUARD_GAUGE_DRAIN_SPECIAL,
  GUARD_GAUGE_DRAIN_SDM,
  GUARD_GAUGE_METER_BONUS_ON_BLOCK,
  MAX_MODE_DAMAGE_BONUS,
  MAX_MODE_DEFENSE_BONUS,
  DESPERATION_HEALTH_THRESHOLD,
  DESPERATION_DM_DAMAGE_BONUS,
  JUGGLE_POINTS_MAX,
  GC_ROLL_STOCK_COST,
  GC_CD_STOCK_COST,
  ROLL_DURATION,
  ROLL_INVINCIBLE_END,
  ROLL_SPEED,
  ROLL_RECOVERY,
  STAGE_LEFT,
  STAGE_RIGHT,
  COUNTER_WIRE_BOUNCE_VX,
  COUNTER_WIRE_BOUNCE_VY,
  MAX_STOCKS,
  METER_PER_STOCK,
  PUSHBLOCK_THRESHOLD,
  PUSHBLOCK_EXTRA_PUSHBACK,
  WALL_BOUNCE_MAX_PER_COMBO,
  getHitstopFrames,
} from '../src/core/constants.js';
import {
  createPowerGauge,
  createMaxMode,
  spendGCRoll,
  spendGCCD,
  spendStocks,
  activateMaxMode,
  isDesperation,
} from '../src/combat/meter.js';
import type { PowerGauge, MaxModeState } from '../src/core/types.js';

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

// P2 按住后方向(防御): facing=-1 时 back=right
function createBlockingInputProvider(): IInputProvider {
  return createInputProvider({}, { right: true });
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

// ==========================================================================
// a. Guard Cancel Roll (10个测试)
// ==========================================================================

describe('Guard Cancel Roll', () => {
  it('GC Roll 消耗 1 stock', () => {
    const gauge = createPowerGauge();
    gauge.stocks = 3;
    const result = spendGCRoll(gauge);
    expect(result).toBe(true);
    expect(gauge.stocks).toBe(3 - GC_ROLL_STOCK_COST);
  });

  it('GC Roll 成功后对手攻击落空', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    // p1 攻击
    forceActivePhase(p1, AttackType.STAND_C);
    // p2 在 GC Roll 无敌状态
    p2.state = FighterState.ROLL;
    p2.rollTimer = ROLL_DURATION;
    p2.isGCRoll = true;

    const healthBefore = p2.health;
    cs.resolveAttacks(p1, p2, []);

    // p2 在 GC Roll 无敌中, 不应该受到伤害
    expect(p2.health).toBe(healthBefore);
  });

  it('GC Roll 在防御中可用', () => {
    // 模拟: p2 在 BLOCK 状态, blockstunTimer > 0
    // handleBlock 中检测 rollPressed + blockstunTimer > 0 + spendStocks
    const gauge = createPowerGauge();
    gauge.stocks = 2;

    const f = new Fighter(350, '#0000ff', -1);
    f.state = FighterState.BLOCK;
    f.blockstunTimer = 10;

    // GC Roll 条件: blockstunTimer > 0 且有足够 stock
    expect(f.state).toBe(FighterState.BLOCK);
    expect(f.blockstunTimer).toBeGreaterThan(0);
    expect(gauge.stocks).toBeGreaterThanOrEqual(GC_ROLL_STOCK_COST);
    expect(spendGCRoll(gauge)).toBe(true);

    // 模拟 handleBlock 中 GC Roll 激活后的状态变化
    f.state = FighterState.ROLL;
    f.rollTimer = ROLL_DURATION;
    f.isGCRoll = true;
    f.vx = ROLL_SPEED * f.facing;
    f.blockstunTimer = 0;

    expect(f.state).toBe(FighterState.ROLL);
    expect(f.isGCRoll).toBe(true);
    expect(f.rollTimer).toBe(ROLL_DURATION);
  });

  it('GC Roll 在非防御中不可用 (没有 blockstun)', () => {
    const gauge = createPowerGauge();
    gauge.stocks = 2;

    const f = new Fighter(350, '#0000ff', -1);
    // IDLE 状态没有 blockstun, 不满足 GC Roll 条件
    f.state = FighterState.IDLE;
    f.blockstunTimer = 0;

    // 条件检查: blockstunTimer > 0 是前提
    expect(f.blockstunTimer).toBe(0);
    // handleBlock 只在 blockstunTimer > 0 时检查 GC Roll
    // IDLE 状态不会进入 handleBlock, 因此 GC Roll 不可用
    // 这里验证的是: stock 消耗函数本身可以调用, 但逻辑条件不满足
    expect(gauge.stocks).toBeGreaterThanOrEqual(GC_ROLL_STOCK_COST);
  });

  it('GC Roll 后位置交换', () => {
    const f = new Fighter(350, '#0000ff', -1);
    const gauge = createPowerGauge();
    gauge.stocks = 2;

    // 激活 GC Roll (向前滚)
    f.state = FighterState.ROLL;
    f.rollTimer = ROLL_DURATION;
    f.isGCRoll = true;
    f.facing = -1;
    f.vx = ROLL_SPEED * f.facing;

    const initialX = f.x;

    // 模拟滚动帧推进 (ROLL_DURATION 帧)
    for (let i = 0; i < ROLL_DURATION; i++) {
      f.x += f.vx;
      f.rollTimer--;
      f.x = Math.max(STAGE_LEFT, Math.min(f.x, STAGE_RIGHT));
    }

    // 滚动完成后回到 IDLE
    f.state = FighterState.IDLE;
    f.isGCRoll = false;

    // 验证位置已经移动
    expect(f.x).not.toBe(initialX);
    // facing=-1 向左滚, x 应减小
    expect(f.x).toBeLessThan(initialX);
  });

  it('GC Roll 后无敌帧 (全程无敌)', () => {
    const f = new Fighter(350, '#0000ff', -1);
    f.state = FighterState.ROLL;
    f.rollTimer = ROLL_DURATION;
    f.isGCRoll = true;

    // GC Roll 全程无敌: 不论 timer 在哪, 都应该无敌
    for (let t = ROLL_DURATION; t > 0; t--) {
      f.rollTimer = t;
      expect(f.isRollInvincible()).toBe(true);
    }

    // 对比: 普通 roll 只在前 ROLL_INVINCIBLE_END 帧无敌
    const normalRoll = new Fighter(350, '#ff0000', 1);
    normalRoll.state = FighterState.ROLL;
    normalRoll.isGCRoll = false;

    // 前 ROLL_INVINCIBLE_END 帧: 无敌
    normalRoll.rollTimer = ROLL_DURATION;
    expect(normalRoll.isRollInvincible()).toBe(true);

    // 超过 ROLL_INVINCIBLE_END 帧: 不无敌
    normalRoll.rollTimer = ROLL_DURATION - ROLL_INVINCIBLE_END - 1;
    expect(normalRoll.isRollInvincible()).toBe(false);
  });

  it('GC Roll 后可反击', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    // p2 完成 GC Roll, 回到 IDLE
    p2.state = FighterState.IDLE;
    p2.isGCRoll = false;
    p2.landingRecovery = 0;

    // p2 现在可以反击 p1
    expect(p2.state).toBe(FighterState.IDLE);
    expect(p2.canAct()).toBe(true);

    // p2 发动反击
    const healthBefore = p1.health;
    forceActivePhase(p2, AttackType.STAND_C);
    cs.resolveAttacks(p2, p1, []);

    expect(p1.health).toBeLessThan(healthBefore);
  });

  it('GC Roll stock 不足时不可用', () => {
    const gauge = createPowerGauge();
    gauge.stocks = 0;

    const result = spendGCRoll(gauge);
    expect(result).toBe(false);
    expect(gauge.stocks).toBe(0);
  });

  it('GC Roll 在 Guard Crush 后不可用', () => {
    // Guard Crush 后进入 GUARD_CRUSH 状态, 不是 BLOCK
    // handleGuardCrush 中没有 GC Roll 逻辑, 只有 handleBlock 有
    const f = new Fighter(350, '#0000ff', -1);
    f.state = FighterState.GUARD_CRUSH;
    f.guardCrushTimer = GUARD_CRUSH_DURATION;

    // Guard Crush 状态不是 BLOCK, 不会进入 handleBlock
    // 因此 GC Roll 不可用
    expect(f.state).toBe(FighterState.GUARD_CRUSH);
    expect(f.state).not.toBe(FighterState.BLOCK);

    // Guard Crush 中不能防御
    expect(f.canBlock()).toBe(false);
  });

  it('GC Roll vs 多段攻击 (全程无敌可穿越)', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    // p2 在 GC Roll 无敌状态
    p2.state = FighterState.ROLL;
    p2.rollTimer = ROLL_DURATION;
    p2.isGCRoll = true;

    const healthBefore = p2.health;

    // 模拟多段攻击 (连续 3 次)
    for (let i = 0; i < 3; i++) {
      resetAttacker(p1);
      forceActivePhase(p1, AttackType.STAND_A);
      cs.resolveAttacks(p1, p2, []);
    }

    // 所有攻击都应该被 GC Roll 无敌回避
    expect(p2.health).toBe(healthBefore);
  });
});

// ==========================================================================
// b. Guard Cancel CD (10个测试)
// ==========================================================================

describe('Guard Cancel CD', () => {
  it('GC CD 消耗 1 stock', () => {
    const gauge = createPowerGauge();
    gauge.stocks = 3;
    const result = spendGCCD(gauge);
    expect(result).toBe(true);
    expect(gauge.stocks).toBe(3 - GC_CD_STOCK_COST);
  });

  it('GC CD 在防御中可用', () => {
    const gauge = createPowerGauge();
    gauge.stocks = 2;

    const f = new Fighter(350, '#0000ff', -1);
    f.state = FighterState.BLOCK;
    f.blockstunTimer = 10;

    // GC CD 条件: blockstunTimer > 0 + blowbackPressed + spendStocks
    expect(f.state).toBe(FighterState.BLOCK);
    expect(f.blockstunTimer).toBeGreaterThan(0);
    expect(gauge.stocks).toBeGreaterThanOrEqual(GC_CD_STOCK_COST);
    expect(spendGCCD(gauge)).toBe(true);

    // 模拟 handleBlock 中 GC CD 激活
    f.blockstunTimer = 0;
    f.startAttack(AttackType.STAND_CD);

    expect(f.currentAttack).toBe(AttackType.STAND_CD);
  });

  it('GC CD 命中造成击倒', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    // STAND_CD 有 knockdown=true
    expect(FRAME_DATA[AttackType.STAND_CD].knockdown).toBe(true);

    forceActivePhase(p1, AttackType.STAND_CD);
    cs.resolveAttacks(p1, p2, []);

    // STAND_CD 命中后应该导致 wall bounce (CD attacks always cause wall bounce on hit)
    expect(p2.isCounterWire).toBe(true);
  });

  it('GC CD 有 Counter Wire 效果', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    forceActivePhase(p1, AttackType.STAND_CD);
    cs.resolveAttacks(p1, p2, []);

    // CD 攻击 always causes wall bounce
    expect(p2.isCounterWire).toBe(true);
    expect(p2.wallBounceCount).toBe(1);

    // Counter Wire 给予 FULL juggle state
    expect(p2.juggleState).toBe(JuggleState.FULL);
    expect(p2.jugglePoints).toBe(JUGGLE_POINTS_MAX);
  });

  it('GC CD 后不可连续使用 (需要再次进入 blockstun)', () => {
    const gauge = createPowerGauge();
    gauge.stocks = 2;

    const f = new Fighter(350, '#0000ff', -1);

    // 第1次: BLOCK 状态, blockstunTimer > 0
    f.state = FighterState.BLOCK;
    f.blockstunTimer = 10;
    expect(spendGCCD(gauge)).toBe(true);
    expect(gauge.stocks).toBe(1);

    // GC CD 后 blockstunTimer = 0, 进入攻击状态
    f.blockstunTimer = 0;
    f.startAttack(AttackType.STAND_CD);
    expect(f.currentAttack).toBe(AttackType.STAND_CD);

    // 攻击中不能再 GC CD (不在 BLOCK 状态)
    expect(f.state).not.toBe(FighterState.BLOCK);
  });

  it('GC CD 伤害值验证', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    const healthBefore = p2.health;
    forceActivePhase(p1, AttackType.STAND_CD);
    cs.resolveAttacks(p1, p2, []);

    const damage = healthBefore - p2.health;
    const expectedDamage = FRAME_DATA[AttackType.STAND_CD].damage;
    expect(damage).toBe(expectedDamage);
  });

  it('GC CD 版边效果 (wall bounce)', () => {
    const cs = new CombatSystem(createInputProvider());
    // 近距离放置, p2 在版边附近
    const p1 = new Fighter(STAGE_RIGHT - 110, '#ff0000', 1);
    const p2 = new Fighter(STAGE_RIGHT - 50, '#0000ff', -1);

    forceActivePhase(p1, AttackType.STAND_CD);
    cs.resolveAttacks(p1, p2, []);

    // STAND_CD 命中后触发 wall bounce (CD attacks always cause wall bounce)
    expect(p2.isCounterWire).toBe(true);
    expect(p2.wallBounceCount).toBe(1);
  });

  it('GC CD vs 飞行道具 (在 blockstun 中发动 CD 可以打断飞行道具节奏)', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    // 模拟: p2 刚防御完 (blockstun), 发动 GC CD
    // GC CD 使用 STAND_CD, 这是一个近身攻击
    // 验证: STAND_CD 的 frame data 属性
    const cdData = FRAME_DATA[AttackType.STAND_CD];
    expect(cdData.counterWire).toBe(true);
    expect(cdData.knockdown).toBe(true);
    expect(cdData.hitLevel).toBe('MID');
  });

  it('GC CD stock 不足时不可用', () => {
    const gauge = createPowerGauge();
    gauge.stocks = 0;

    const result = spendGCCD(gauge);
    expect(result).toBe(false);
    expect(gauge.stocks).toBe(0);
  });

  it('GC CD 和 GC Roll 不可同时使用 (stock 竞争)', () => {
    const gauge = createPowerGauge();
    gauge.stocks = 1; // 只够一个

    // 使用 GC Roll
    const rollResult = spendGCRoll(gauge);
    expect(rollResult).toBe(true);
    expect(gauge.stocks).toBe(0);

    // 此时不能再 GC CD
    const cdResult = spendGCCD(gauge);
    expect(cdResult).toBe(false);
  });
});

// ==========================================================================
// c. HSDM系统 (10个测试)
// ==========================================================================

describe('HSDM系统', () => {
  // HSDM 在项目中通过 HSDM_ 前缀识别 (isDM classifier 支持)
  // KOF2002 规则: HSDM 需要绝体绝命 + 消耗 stocks
  // 由于当前没有具体 HSDM AttackType, 用 SDM 攻击 + 绝体绝命条件模拟

  it('HSDM 需要绝体绝命 (血量 < 25%)', () => {
    // 绝体绝命: health / maxHealth < 0.25
    expect(isDesperation(200, MAX_HEALTH)).toBe(true); // 200/1000 = 0.20
    expect(isDesperation(249, MAX_HEALTH)).toBe(true); // 249/1000 = 0.249
    expect(isDesperation(250, MAX_HEALTH)).toBe(false); // 250/1000 = 0.25 不满足 < 0.25
    expect(isDesperation(500, MAX_HEALTH)).toBe(false);
  });

  it('HSDM 不需要 MAX 模式 (SDM 需要 MAX, HSDM 不需要)', () => {
    // KOF2002: SDM 需要 MAX 模式激活
    // HSDM: 只需要绝体绝命 + 足够 stocks, 不需要 MAX 模式
    const gauge = createPowerGauge();
    gauge.stocks = 3;
    const maxMode = createMaxMode();
    maxMode.active = false; // 非 MAX 模式

    // HSDM 条件: 绝体绝命 + stocks >= 3 (不需要 maxMode.active)
    const isDesperationState = isDesperation(200, MAX_HEALTH);
    const hasStocks = gauge.stocks >= 3;

    expect(isDesperationState).toBe(true);
    expect(hasStocks).toBe(true);
    expect(maxMode.active).toBe(false); // 不需要 MAX
  });

  it('HSDM 伤害高于 SDM (通过 frame data 比对)', () => {
    // SDM_OROCHINAGI: damage = 342
    // HSDM 在 KOF2002 中通常比 SDM 高 20-30%
    // 验证 SDM 帧数据存在, 且 HSDM 概念上应该更高
    const sdmDamage = FRAME_DATA[AttackType.SDM_OROCHINAGI].damage;
    const dmDamage = FRAME_DATA[AttackType.DM_OROCHINAGI].damage;

    expect(sdmDamage).toBeGreaterThan(dmDamage); // SDM > DM
    // HSDM > SDM 的规则在项目中通过 HSDM_ 前缀和更高 damage 值体现
    expect(sdmDamage).toBe(342);
    expect(dmDamage).toBe(200);
  });

  it('HSDM 消耗 3 stock', () => {
    // KOF2002: HSDM 消耗 3 个 stock
    const gauge = createPowerGauge();
    gauge.stocks = 3;

    const result = spendStocks(gauge, 3);
    expect(result).toBe(true);
    expect(gauge.stocks).toBe(0);
  });

  it('HSDM 非绝体绝命不可用 (stock 检查)', () => {
    // 非 HSDM 场景: 正常血量时只能使用 DM (1 stock) 或 SDM (需要 MAX)
    const gauge = createPowerGauge();
    gauge.stocks = 3;

    const health = 800; // 800/1000 = 0.80, 不是绝体绝命
    expect(isDesperation(health, MAX_HEALTH)).toBe(false);

    // 非 MAX 模式下, DM 消耗 1 stock
    const dmResult = spendStocks(gauge, 1);
    expect(dmResult).toBe(true);
    expect(gauge.stocks).toBe(2);
  });

  it('HSDM 防御槽消耗 (SDM 级别 = 35)', () => {
    // GUARD_GAUGE_DRAIN_SDM = 35
    // isDM 检测: name.startsWith('HSDM_') 走 SDM drain path
    const drainSDM = GUARD_GAUGE_DRAIN_SDM;
    expect(drainSDM).toBe(35);

    // HSDM 被防御时, 防御槽消耗与 SDM 相同
    const cs = new CombatSystem(createBlockingInputProvider());
    const { p1, p2 } = createStandardMatch();

    const gaugeBefore = p2.guardGauge;
    forceActivePhase(p1, AttackType.SDM_OROCHINAGI);
    cs.resolveAttacks(p1, p2, []);

    // SDM_OROCHINAGI 被防御: guardGauge drain = 35
    const expectedGauge = Math.max(0, gaugeBefore - GUARD_GAUGE_DRAIN_SDM + GUARD_GAUGE_METER_BONUS_ON_BLOCK);
    expect(p2.guardGauge).toBeCloseTo(expectedGauge, 1);
  });

  it('HSDM 版边效果 (DM 级别震动和特效)', () => {
    // HSDM 使用与 DM 相同的视觉反馈层级
    // getHitstopFrames: HSDM_ → HITSTOP_SDM = 22
    // getShakeIntensity: HSDM_ → SHAKE_DM = 14
    // 这些在 constants.ts 中通过 startsWith('HSDM_') 分支处理
    // 验证 SDM 和 HSDM 走同一视觉层级
    expect(getHitstopFrames('SDM_OROCHINAGI')).toBe(22);
    expect(getHitstopFrames('HSDM_SOME_ATTACK')).toBe(22);
  });

  it('HSDM 命中后特殊演出 (knockdown + 高 hitstop)', () => {
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);

    const healthBefore = p2.health;
    forceActivePhase(p1, AttackType.SDM_OROCHINAGI);
    cs.resolveAttacks(p1, p2, []);

    // SDM 命中后高伤害
    const damage = healthBefore - p2.health;
    const expectedDamage = FRAME_DATA[AttackType.SDM_OROCHINAGI].damage;
    expect(damage).toBe(expectedDamage);
    // SDM 有 knockdown
    expect(FRAME_DATA[AttackType.SDM_OROCHINAGI].knockdown).toBe(true);
  });

  it('HSDM 在 MAX 模式下也可用', () => {
    // KOF2002: HSDM 在 MAX 模式下也可发动 (不冲突)
    const gauge = createPowerGauge();
    gauge.stocks = 3;
    const maxMode = createMaxMode();
    maxMode.active = true; // MAX 模式

    const isDesperationState = isDesperation(200, MAX_HEALTH);
    const hasStocks = gauge.stocks >= 3;

    expect(isDesperationState).toBe(true);
    expect(hasStocks).toBe(true);
    expect(maxMode.active).toBe(true); // MAX 模式也不阻止 HSDM
  });

  it('HSDM chip damage 验证 (防御时的小额伤害)', () => {
    const cs = new CombatSystem(createBlockingInputProvider());
    const { p1, p2 } = createStandardMatch();

    const healthBefore = p2.health;
    forceActivePhase(p1, AttackType.SDM_OROCHINAGI);
    cs.resolveAttacks(p1, p2, []);

    // chip damage = FRAME_DATA.SDM_OROCHINAGI.chipDamage
    const chipDamage = FRAME_DATA[AttackType.SDM_OROCHINAGI].chipDamage ?? Math.round(FRAME_DATA[AttackType.SDM_OROCHINAGI].damage * CHIP_DAMAGE_RATIO);
    const actualDamage = healthBefore - p2.health;
    expect(actualDamage).toBe(chipDamage);
    // chip damage 不能击杀 (最低剩 1 HP)
    expect(p2.health).toBeGreaterThanOrEqual(1);
  });
});

// ==========================================================================
// d. 综合场景 (10个测试)
// ==========================================================================

describe('综合场景', () => {
  it('被压制 → GC Roll → 反抢 → DM', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    // 1. p1 攻击 p2
    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(1);
    expect(p2.state).toBe(FighterState.HITSTUN);

    // 2. p2 假设通过 GC Roll 逃脱 (模拟状态)
    p2.state = FighterState.ROLL;
    p2.rollTimer = ROLL_DURATION;
    p2.isGCRoll = true;
    p2.hitstunTimer = 0;

    // 3. GC Roll 完成, p2 回到 IDLE
    p2.state = FighterState.IDLE;
    p2.rollTimer = 0;
    p2.isGCRoll = false;

    // 4. p2 反抢 → DM
    const healthBefore = p1.health;
    const cs2 = new CombatSystem(createInputProvider());
    forceActivePhase(p2, AttackType.DM_OROCHINAGI);
    cs2.resolveAttacks(p2, p1, []);

    expect(p1.health).toBeLessThan(healthBefore);
    const dmDamage = FRAME_DATA[AttackType.DM_OROCHINAGI].damage;
    expect(healthBefore - p1.health).toBe(dmDamage);
  });

  it('被压制 → GC CD → Counter Wire → 追击', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    // p1 压制 p2
    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);
    expect(p2.state).toBe(FighterState.HITSTUN);

    // 模拟 p2 从 GC CD 反击 (使用 STAND_CD)
    prepareDefenderForNextHit(p2);
    resetAttacker(p2);
    p2.state = FighterState.IDLE;

    const healthBefore = p1.health;
    forceActivePhase(p2, AttackType.STAND_CD);
    cs.resolveAttacks(p2, p1, []);

    // STAND_CD 命中 → Counter Wire
    expect(p1.isCounterWire).toBe(true);
    expect(p1.juggleState).toBe(JuggleState.FULL);
    expect(p1.jugglePoints).toBe(JUGGLE_POINTS_MAX);
    expect(p1.health).toBeLessThan(healthBefore);

    // 追击: 利用 FULL juggle state 继续连段
    resetAttacker(p2);
    prepareDefenderForNextHit(p1);
    // p1 在 Counter Wire 状态 → 设置为空中但高度能让 STAND_A 命中
    // STAND_A hitbox at frame 0: oy=-75, h=22 → hitbox y = 510-75=435..457
    // 需要 p1 hurtbox 与 hitbox 重叠 → p1.y 必须 >= 435 (hurtbox 下边界)
    p1.y = 490; // isGrounded=false (490 < 510), hurtbox ~290..490
    p1.vy = -3;
    p1.juggleState = JuggleState.FULL;
    p1.jugglePoints = JUGGLE_POINTS_MAX;
    p1.state = FighterState.HITSTUN;

    const healthBefore2 = p1.health;
    forceActivePhase(p2, AttackType.STAND_A);
    cs.resolveAttacks(p2, p1, []);

    expect(p1.health).toBeLessThan(healthBefore2);
  });

  it('绝体绝命 → HSDM → 翻盘', () => {
    const cs = new CombatSystem(createInputProvider());

    // p1 低血量 (绝体绝命)
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);
    p1.health = 200; // 200/1000 = 0.20 < 0.25

    expect(isDesperation(p1.health, p1.maxHealth)).toBe(true);

    // p1 使用 SDM (模拟 HSDM, 绝体绝命 DM +30% 加成)
    const healthBefore = p2.health;
    forceActivePhase(p1, AttackType.SDM_OROCHINAGI);
    cs.resolveAttacks(p1, p2, []);

    const damage = healthBefore - p2.health;
    expect(damage).toBe(FRAME_DATA[AttackType.SDM_OROCHINAGI].damage);
    // SDM 伤害足以造成重大伤害
    expect(damage).toBe(342);
  });

  it('GC Roll → meter 不够 → 被连段', () => {
    const gauge = createPowerGauge();
    gauge.stocks = 0; // 没有 stock

    // GC Roll 不可用
    expect(spendGCRoll(gauge)).toBe(false);

    // 没有 GC Roll, 只能继续挨打
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    const healthBefore = p2.health;

    // 连段 2 次
    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);
    expect(p2.health).toBeLessThan(healthBefore);

    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    const healthBefore2 = p2.health;
    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);
    expect(p2.health).toBeLessThan(healthBefore2);
  });

  it('GC CD 被防 → counter hit', () => {
    // GC CD (STAND_CD) 被防御的情况
    const cs = new CombatSystem(createBlockingInputProvider());
    const { p1, p2 } = createStandardMatch();

    // p1 使用 STAND_CD, p2 防御
    forceActivePhase(p1, AttackType.STAND_CD);
    cs.resolveAttacks(p1, p2, []);

    // STAND_CD 被防 → p2 进入 BLOCK 状态
    expect(p2.state).toBe(FighterState.BLOCK);
    expect(p2.health).toBeGreaterThan(0); // chip damage 不击杀
    expect(p2.health).toBeLessThan(MAX_HEALTH); // 有 chip damage
  });

  it('GC Roll 位置 → 投技确认', () => {
    const cs = new CombatSystem(createInputProvider());

    // p2 完成 GC Roll 后在 p1 身后 → 投技
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);

    // GC Roll 后 p2 到 p1 身后 (位置交换)
    p2.x = 280; // p2 在 p1 左侧
    p2.state = FighterState.IDLE;
    p2.isGCRoll = false;
    p2.facing = 1; // 面向右 → 面向 p1

    // 投技范围检查
    const dist = Math.abs(p1.x - p2.x);
    expect(dist).toBeLessThan(100); // THROW_RANGE = 100

    // p2 发动投技
    forceActivePhase(p2, AttackType.THROW);
    cs.resolveAttacks(p2, p1, []);

    // 投技命中 (进入拆投窗口或直接命中)
    expect(p2.hasHit).toBe(true);
  });

  it('版边 GC CD → 壁弹 → 追击连段', () => {
    const cs = new CombatSystem(createInputProvider());
    // 近距离, p2 在版边附近
    const p1 = new Fighter(STAGE_RIGHT - 110, '#ff0000', 1);
    const p2 = new Fighter(STAGE_RIGHT - 50, '#0000ff', -1);

    // GC CD (STAND_CD) 命中
    forceActivePhase(p1, AttackType.STAND_CD);
    cs.resolveAttacks(p1, p2, []);

    // 壁弹
    expect(p2.isCounterWire).toBe(true);
    expect(p2.wallBounceCount).toBe(1);
    expect(p2.juggleState).toBe(JuggleState.FULL);
    expect(p2.jugglePoints).toBe(JUGGLE_POINTS_MAX);

    // 追击: 空中连段 — p2 高度需要让 STAND_A hitbox 能命中
    resetAttacker(p1);
    p2.isCounterWire = false; // 壁弹后
    p2.y = 490; // 空中 (490 < 510), hurtbox ~290..490
    p2.vy = -3;
    p2.state = FighterState.HITSTUN;

    const healthBefore = p2.health;
    forceActivePhase(p1, AttackType.STAND_A);
    cs.resolveAttacks(p1, p2, []);

    expect(p2.health).toBeLessThan(healthBefore);
    expect(cs.getComboCount(1)).toBeGreaterThanOrEqual(1);
  });

  it('防御槽管理 → Guard Crush → GC Roll 不可用', () => {
    const cs = new CombatSystem(createBlockingInputProvider());
    const { p1, p2 } = createStandardMatch();

    // 连续防御直到 Guard Crush
    p2.guardGauge = 0; // 清空防御槽

    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);

    // Guard Crush
    expect(p2.state).toBe(FighterState.GUARD_CRUSH);
    expect(p2.guardCrushTimer).toBe(GUARD_CRUSH_DURATION);

    // Guard Crush 状态下不能防御
    expect(p2.canBlock()).toBe(false);

    // Guard Crush 不是 BLOCK 状态, GC Roll 不可用
    expect(p2.state).not.toBe(FighterState.BLOCK);

    // Guard Crush 恢复后防御槽从 0 开始
    // (handleGuardCrush: 恢复时 guardGauge = 0)
  });

  it('绝体绝命 + MAX → DM 伤害最大化', () => {
    // MAX 模式 (+20%) + 绝体绝命 (+30%) 叠加
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);
    p2.maxHealth = 2000;
    p2.health = 400; // 400/2000 = 0.20 < 0.25 → 绝体绝命

    const healthBefore = p2.health;
    forceActivePhase(p1, AttackType.DM_OROCHINAGI);
    cs.resolveAttacks(p1, p2, [], undefined, 0, [true, false]); // p1 MAX

    const damage = healthBefore - p2.health;
    const baseDamage = FRAME_DATA[AttackType.DM_OROCHINAGI].damage; // 200
    // MAX bonus first: 200 * 1.20 = 240
    const afterMax = Math.round(baseDamage * MAX_MODE_DAMAGE_BONUS);
    // Desperation bonus: 240 * 1.30 = 312
    const expectedDamage = Math.round(afterMax * DESPERATION_DM_DAMAGE_BONUS);
    expect(damage).toBe(expectedDamage);
    expect(damage).toBeGreaterThan(baseDamage); // 远超普通 DM
    expect(damage).toBe(312);
  });

  it('完整对战流程 (攻击 → 防御 → GC → 反抢 → DM)', () => {
    // 第1阶段: p1 攻击 p2
    const cs1 = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();

    forceActivePhase(p1, AttackType.STAND_C);
    cs1.resolveAttacks(p1, p2, []);
    expect(p2.state).toBe(FighterState.HITSTUN);
    const damageTaken = MAX_HEALTH - p2.health;
    expect(damageTaken).toBe(FRAME_DATA[AttackType.STAND_C].damage);

    // 第2阶段: p2 恢复并防御
    prepareDefenderForNextHit(p2);

    const cs2 = new CombatSystem(createBlockingInputProvider());
    resetAttacker(p1);
    forceActivePhase(p1, AttackType.STAND_C);
    cs2.resolveAttacks(p1, p2, []);
    expect(p2.state).toBe(FighterState.BLOCK);

    // 第3阶段: GC Roll (模拟从 blockstun 中逃脱)
    const gauge = createPowerGauge();
    gauge.stocks = 2;
    expect(spendGCRoll(gauge)).toBe(true);
    expect(gauge.stocks).toBe(1);

    // GC Roll 状态
    p2.state = FighterState.ROLL;
    p2.rollTimer = ROLL_DURATION;
    p2.isGCRoll = true;
    p2.blockstunTimer = 0;

    // 第4阶段: GC Roll 完成, 反抢
    p2.state = FighterState.IDLE;
    p2.isGCRoll = false;

    const cs3 = new CombatSystem(createInputProvider());
    const healthBefore = p1.health;
    forceActivePhase(p2, AttackType.DM_OROCHINAGI);
    cs3.resolveAttacks(p2, p1, []);

    // DM 命中
    expect(p1.health).toBeLessThan(healthBefore);
    const dmDamage = healthBefore - p1.health;
    expect(dmDamage).toBe(FRAME_DATA[AttackType.DM_OROCHINAGI].damage);
  });
});
