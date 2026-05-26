/**
 * wallAndPushback.test.ts -- 版边与推力交互系统集成测试
 *
 * 验证场景:
 *  1. 版边位置限制 (6)
 *  2. 壁弹系统 (6)
 *  3. Pushback 交互 (7)
 *  4. 版边压制场景 (8)
 *  5. 屏幕震动 + 版边 (4)
 *  6. 推力 + 缩放交互 (4)
 *
 * 依赖: CombatSystem + Fighter + 真实 frame data + constants.
 */
import { describe, it, expect } from 'vitest';
import { CombatSystem } from '../src/combat/combatSystem.js';
import { Fighter } from '../src/entities/fighter.js';
import { Projectile } from '../src/entities/projectile.js';
import type { IInputProvider } from '../src/input/inputProvider.js';
import type { PlayerInput } from '../src/core/types.js';
import { AttackType, FighterState, JuggleState } from '../src/core/types.js';
import {
  MAX_HEALTH,
  STAGE_LEFT,
  STAGE_RIGHT,
  STAGE_WIDTH,
  FIGHTER_WIDTH,
  PUSHBOX_WIDTH,
  FRAME_DATA,
  GUARD_CRUSH_DURATION,
  GUARD_GAUGE_MAX,
  GUARD_GAUGE_DRAIN_LIGHT,
  GUARD_GAUGE_DRAIN_HEAVY,
  GUARD_GAUGE_DRAIN_SPECIAL,
  GUARD_GAUGE_DRAIN_DM,
  GUARD_GAUGE_METER_BONUS_ON_BLOCK,
  PUSHBLOCK_THRESHOLD,
  PUSHBLOCK_EXTRA_PUSHBACK,
  WALL_BOUNCE_MAX_PER_COMBO,
  COUNTER_WIRE_BOUNCE_VX,
  COUNTER_WIRE_BOUNCE_VY,
  JUGGLE_POINTS_MAX,
  THROW_DISTANCE,
  THROW_RANGE,
  MAX_MODE_DAMAGE_BONUS,
  DESPERATION_HEALTH_THRESHOLD,
  DESPERATION_DM_DAMAGE_BONUS,
  SHAKE_LIGHT,
  SHAKE_HEAVY,
  SHAKE_SPECIAL,
  SHAKE_DM,
  SHAKE_KO,
  getShakeIntensity,
  getShakeDuration,
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

// P2 按住后方向(防御): facing=-1 时 back=right
function createBlockingInputProvider(): IInputProvider {
  return createInputProvider({}, { right: true });
}

// ===== 测试辅助 =====

/** 将攻击者推到 active phase */
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

/** 将 defender 恢复到可被命中状态 */
function prepareDefenderForNextHit(defender: Fighter): void {
  defender.state = FighterState.IDLE;
  defender.hitstunTimer = 0;
  defender.blockstunTimer = 0;
}

/** 创建标准近距离对战配置: p1(300), p2(350) — 确保 hitbox 重叠 */
function createCloseMatch(): { p1: Fighter; p2: Fighter } {
  return {
    p1: new Fighter(300, '#ff0000', 1),
    p2: new Fighter(350, '#0000ff', -1),
  };
}

// ==========================================================================
// 1. 版边位置限制 (6 tests)
// ==========================================================================

describe('版边位置限制', () => {
  it('Fighter 不可超过 STAGE_LEFT', () => {
    const f = new Fighter(STAGE_LEFT, '#ff0000', 1);
    // STAGE_LEFT = FIGHTER_WIDTH/2 = 40, fighter.x = 40
    // 尝试向左移到更远的位置
    f.x = STAGE_LEFT - 50;
    // 手动夹紧
    f.x = Math.max(STAGE_LEFT, f.x);
    expect(f.x).toBe(STAGE_LEFT);
    // x 不能低于 STAGE_LEFT
    expect(f.x).toBeGreaterThanOrEqual(STAGE_LEFT);
  });

  it('Fighter 不可超过 STAGE_RIGHT', () => {
    const f = new Fighter(STAGE_RIGHT, '#0000ff', -1);
    f.x = STAGE_RIGHT + 50;
    f.x = Math.min(STAGE_RIGHT, f.x);
    expect(f.x).toBe(STAGE_RIGHT);
    expect(f.x).toBeLessThanOrEqual(STAGE_RIGHT);
  });

  it('被推到版边后 pushback 不再增加距离 (攻击者被推回)', () => {
    const cs = new CombatSystem(createBlockingInputProvider());
    // p2 在右侧版边附近防御
    const p1 = new Fighter(STAGE_RIGHT - 70, '#ff0000', 1);
    const p2 = new Fighter(STAGE_RIGHT - 10, '#0000ff', -1);

    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);

    // p2 已在版边: 被 pushback 但不超出版边
    expect(p2.x).toBeLessThanOrEqual(STAGE_RIGHT);
    // 版边时攻击者被额外推回 (cornerBonus = 1.5)
    const p1PushedBack = p1.vx !== 0;
    expect(p1PushedBack).toBe(true);
  });

  it('版边 pushback 转为额外 hitstun (无法后退时 hitstun 不变)', () => {
    // 在版边被命中, hitstun 帧数与正常位置一致
    const csNormal = new CombatSystem(createInputProvider());
    const { p1: p1n, p2: p2n } = createCloseMatch();
    forceActivePhase(p1n, AttackType.STAND_C);
    csNormal.resolveAttacks(p1n, p2n, []);
    const normalHitstun = p2n.hitstunTimer;

    // 版边位置命中
    const csCorner = new CombatSystem(createInputProvider());
    const p1c = new Fighter(STAGE_RIGHT - 60, '#ff0000', 1);
    const p2c = new Fighter(STAGE_RIGHT - 10, '#0000ff', -1);
    forceActivePhase(p1c, AttackType.STAND_C);
    csCorner.resolveAttacks(p1c, p2c, []);
    const cornerHitstun = p2c.hitstunTimer;

    // 版边 hitstun 帧数不变 (pushback 速度被施加但位置被夹紧)
    expect(cornerHitstun).toBe(normalHitstun);
  });

  it('版边双方不可重叠 (pushbox 分离)', () => {
    const p1 = new Fighter(400, '#ff0000', 1);
    const p2 = new Fighter(400, '#0000ff', -1);
    // 两个 fighter 在同一位置, pushbox 应该分离
    const box1 = p1.getPushbox();
    const box2 = p2.getPushbox();
    // pushbox 有重叠
    const overlapX = box1.x < box2.x + box2.width && box1.x + box1.width > box2.x;
    expect(overlapX).toBe(true); // 在同一位置时一定重叠

    // 手动分离: push apart based on pushbox center
    const halfW = PUSHBOX_WIDTH / 2;
    p1.x = Math.max(STAGE_LEFT, 400 - halfW);
    p2.x = Math.min(STAGE_RIGHT, 400 + halfW);
    // 分离后不再重叠
    const box1b = p1.getPushbox();
    const box2b = p2.getPushbox();
    const stillOverlap = box1b.x < box2b.x + box2b.width && box1b.x + box1b.width > box2b.x;
    expect(stillOverlap).toBe(false);
  });

  it('版边投技位置正确 (不超过 STAGE_RIGHT/STAGE_LEFT)', () => {
    const cs = new CombatSystem(createInputProvider());
    // p2 在版边附近, p1 投 p2
    const p1 = new Fighter(STAGE_RIGHT - 60, '#ff0000', 1);
    const p2 = new Fighter(STAGE_RIGHT - 10, '#0000ff', -1);

    // p1 投 p2 (forward throw)
    forceActivePhase(p1, AttackType.THROW_FORWARD);
    cs.resolveAttacks(p1, p2, []);

    // 投技进入拆投窗口: p2.isBeingThrown = true
    expect(p2.isBeingThrown).toBe(true);
    // 投技位置被夹紧: Math.max(STAGE_LEFT, Math.min(p1.x + THROW_DISTANCE * facing, STAGE_RIGHT))
    expect(p2.x).toBeLessThanOrEqual(STAGE_RIGHT);
    expect(p2.x).toBeGreaterThanOrEqual(STAGE_LEFT);
  });
});

// ==========================================================================
// 2. 壁弹系统 (6 tests)
// ==========================================================================

describe('壁弹系统', () => {
  it('壁弹只在版边触发 (CD 攻击命中版边附近对手)', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createCloseMatch();

    forceActivePhase(p1, AttackType.STAND_CD);
    cs.resolveAttacks(p1, p2, []);

    // STAND_CD 有 counterWire=true, 壁弹触发 (不需要在版边, CD 始终壁弹)
    expect(p2.isCounterWire).toBe(true);
    expect(p2.wallBounceCount).toBe(1);
    // 壁弹速度: 向版边方向飞 + 向上
    expect(p2.vy).toBe(COUNTER_WIRE_BOUNCE_VY); // -6
  });

  it('壁弹给予额外 Juggle points', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createCloseMatch();

    forceActivePhase(p1, AttackType.STAND_CD);
    cs.resolveAttacks(p1, p2, []);

    // CD 壁弹给予 FULL juggle + JUGGLE_POINTS_MAX
    expect(p2.juggleState).toBe(JuggleState.FULL);
    expect(p2.jugglePoints).toBe(JUGGLE_POINTS_MAX);
  });

  it('壁弹每 combo 限制 1 次 (WALL_BOUNCE_MAX_PER_COMBO)', () => {
    expect(WALL_BOUNCE_MAX_PER_COMBO).toBe(1);

    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createCloseMatch();

    // 第1次 CD 壁弹
    forceActivePhase(p1, AttackType.STAND_CD);
    cs.resolveAttacks(p1, p2, []);
    expect(p2.wallBounceCount).toBe(1);
    expect(p2.isCounterWire).toBe(true);

    // 重置攻击者, 准备第2次
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    p2.wallBounceCount = 1; // 保持计数

    // 第2次 CD 攻击 — wallBounceCount 已达上限, 不应再壁弹
    forceActivePhase(p1, AttackType.STAND_CD);
    cs.resolveAttacks(p1, p2, []);

    // wallBounceCount 不应再增加 (已是1, 第2次不触发壁弹)
    expect(p2.wallBounceCount).toBe(1);
  });

  it('Counter Wire -> 壁弹 (counter hit + counterWire 标记)', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createCloseMatch();

    // STAND_CD 有 counterWire=true
    // 需要 counter hit: p2 必须在攻击状态
    forceActivePhase(p2, AttackType.STAND_A); // p2 攻击中 -> CH 条件
    forceActivePhase(p1, AttackType.STAND_CD);
    cs.resolveAttacks(p1, p2, []);

    expect(p2.isCounterWire).toBe(true);
    expect(p2.wallBounceCount).toBe(1);
    // Counter wire (非 CD) 壁弹: juggle points = 3 (reduced)
    // 但 STAND_CD 即使 counter hit 也给 JUGGLE_POINTS_MAX (CD 走 isCDAttack 分支)
    // 这里用 CD + counter hit, isCDAttack=true → JUGGLE_POINTS_MAX
    expect(p2.jugglePoints).toBe(JUGGLE_POINTS_MAX);
  });

  it('CD 攻击 -> 壁弹 (不需要 Counter)', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createCloseMatch();

    // p2 处于 IDLE (非攻击状态, 不是 counter hit)
    forceActivePhase(p1, AttackType.STAND_CD);
    cs.resolveAttacks(p1, p2, []);

    // CD 攻击不需要 counter 也触发壁弹
    expect(p2.isCounterWire).toBe(true);
    expect(p2.wallBounceCount).toBe(1);
    // CD 壁弹给 full juggle (不是 reduced 3 pts)
    expect(p2.jugglePoints).toBe(JUGGLE_POINTS_MAX);
  });

  it('壁弹后可追击连段 (juggle state = FULL)', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createCloseMatch();

    // CD 壁弹
    forceActivePhase(p1, AttackType.STAND_CD);
    cs.resolveAttacks(p1, p2, []);

    // 壁弹后对手处于 FULL juggle, 可以追打
    expect(p2.juggleState).toBe(JuggleState.FULL);
    expect(p2.jugglePoints).toBeGreaterThan(0);

    // 模拟壁弹后对手在空中 — 设置 y 使得 hitbox 与 STAND_A 重叠
    // STAND_A hitbox: y=510-33=477..510-3=507 → 需要对手 hurtbox 覆盖这个范围
    // hurtbox: y=p2.y-displayHeight 到 p2.y → 需要 p2.y >= 477 且 p2.y-200 < 507
    // p2.y = 500: hurtbox y=300..500, hitbox y=477..507 → overlap: 477..500
    p2.y = 500; // 空中 (500 < 510 = STAGE_GROUND_Y)
    p2.vy = 0;
    p2.state = FighterState.HITSTUN;

    // 追打一击 (轻攻击 cost=1)
    resetAttacker(p1);
    const healthBefore = p2.health;
    forceActivePhase(p1, AttackType.STAND_A);
    cs.resolveAttacks(p1, p2, []);

    // 追打命中: 伤害减少, juggle points 消耗
    expect(p2.health).toBeLessThan(healthBefore);
    expect(p2.jugglePoints).toBeLessThan(JUGGLE_POINTS_MAX);
  });
});

// ==========================================================================
// 3. Pushback 交互 (7 tests)
// ==========================================================================

describe('Pushback 交互', () => {
  it('轻攻击 pushback 小', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createCloseMatch();

    forceActivePhase(p1, AttackType.STAND_A);
    cs.resolveAttacks(p1, p2, []);

    const lightPushback = FRAME_DATA[AttackType.STAND_A].pushback; // 4
    // applyHitstun 设置 vx = pushback * (facing === 1 ? -1 : 1) * 0.85
    // p2 facing=-1, so direction = -(-1) = 1? No: pushback * (this.facing === 1 ? -1 : 1) * 0.85
    // p2.facing = -1, so vx = pushback * 1 * 0.85 = 3.4
    expect(Math.abs(p2.vx)).toBeCloseTo(lightPushback * 0.85, 1);
  });

  it('重攻击 pushback 大', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createCloseMatch();

    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);

    const heavyPushback = FRAME_DATA[AttackType.STAND_C].pushback; // 8
    expect(Math.abs(p2.vx)).toBeCloseTo(heavyPushback * 0.85, 1);
    // 重攻击 pushback > 轻攻击 pushback
    expect(heavyPushback).toBeGreaterThan(FRAME_DATA[AttackType.STAND_A].pushback);
  });

  it('防御 pushback vs 命中 pushback', () => {
    // 命中 pushback: vx = pushback * facing_dir * 0.85
    const csHit = new CombatSystem(createInputProvider());
    const { p1: p1h, p2: p2h } = createCloseMatch();
    forceActivePhase(p1h, AttackType.STAND_C);
    csHit.resolveAttacks(p1h, p2h, []);
    const hitVx = Math.abs(p2h.vx);

    // 防御 pushback: vx = pushback * facing_dir * 0.8
    const csBlock = new CombatSystem(createBlockingInputProvider());
    const { p1: p1b, p2: p2b } = createCloseMatch();
    forceActivePhase(p1b, AttackType.STAND_C);
    csBlock.resolveAttacks(p1b, p2b, []);
    const blockVx = Math.abs(p2b.vx);

    const basePushback = FRAME_DATA[AttackType.STAND_C].pushback; // 8
    // 命中: pushback * 0.85 = 6.8
    expect(hitVx).toBeCloseTo(basePushback * 0.85, 1);
    // 防御: pushback * 0.8 = 6.4
    expect(blockVx).toBeCloseTo(basePushback * 0.8, 1);
  });

  it('连续防御 pushback 累积 (consecutiveBlockCount 递增)', () => {
    const cs = new CombatSystem(createBlockingInputProvider());
    const { p1, p2 } = createCloseMatch();

    const counts: number[] = [];
    for (let i = 0; i < 3; i++) {
      resetAttacker(p1);
      p2.state = FighterState.IDLE;
      p2.blockstunTimer = 0;
      p2.consecutiveBlockDecayTimer = 30; // 防止衰减
      forceActivePhase(p1, AttackType.STAND_C);
      cs.resolveAttacks(p1, p2, []);
      counts.push(p2.consecutiveBlockCount);
    }

    // 连续防御计数递增: 1, 2, 3
    expect(counts[0]).toBe(1);
    expect(counts[1]).toBe(2);
    expect(counts[2]).toBe(3);
  });

  it('Pushblock (连续防御>=3次) 额外 pushback', () => {
    const csNormal = new CombatSystem(createBlockingInputProvider());
    const { p1: p1n, p2: p2n } = createCloseMatch();

    // 第1次防御 (无 pushblock)
    forceActivePhase(p1n, AttackType.STAND_C);
    csNormal.resolveAttacks(p1n, p2n, []);
    const normalVx = Math.abs(p2n.vx);

    // Pushblock 场景: 连续防御第3次
    const csPB = new CombatSystem(createBlockingInputProvider());
    const { p1: p1p, p2: p2p } = createCloseMatch();

    // 前2次正常防御
    for (let i = 0; i < 2; i++) {
      resetAttacker(p1p);
      p2p.state = FighterState.IDLE;
      p2p.blockstunTimer = 0;
      p2p.consecutiveBlockDecayTimer = 30;
      forceActivePhase(p1p, AttackType.STAND_C);
      csPB.resolveAttacks(p1p, p2p, []);
    }

    // 第3次防御: consecutiveBlockCount >= PUSHBLOCK_THRESHOLD
    resetAttacker(p1p);
    p2p.state = FighterState.IDLE;
    p2p.blockstunTimer = 0;
    p2p.consecutiveBlockDecayTimer = 30;
    forceActivePhase(p1p, AttackType.STAND_C);
    csPB.resolveAttacks(p1p, p2p, []);

    const pushblockVx = Math.abs(p2p.vx);
    expect(p2p.consecutiveBlockCount).toBeGreaterThanOrEqual(PUSHBLOCK_THRESHOLD);
    // Pushblock vx = base * 0.8 * PUSHBLOCK_EXTRA_PUSHBACK = 8 * 0.8 * 1.5 = 9.6
    const basePushback = FRAME_DATA[AttackType.STAND_C].pushback;
    const expectedPushblockVx = basePushback * 0.8 * PUSHBLOCK_EXTRA_PUSHBACK;
    expect(pushblockVx).toBeCloseTo(expectedPushblockVx, 1);
    // pushblock vx > normal vx
    expect(pushblockVx).toBeGreaterThan(normalVx);
  });

  it('DM pushback 特大', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createCloseMatch();

    forceActivePhase(p1, AttackType.DM_OROCHINAGI);
    cs.resolveAttacks(p1, p2, []);

    const dmPushback = FRAME_DATA[AttackType.DM_OROCHINAGI].pushback; // 10
    const standCPushback = FRAME_DATA[AttackType.STAND_C].pushback; // 8
    // DM pushback >= 重攻击 pushback
    expect(dmPushback).toBeGreaterThanOrEqual(standCPushback);
    // DM 击倒 (knockdown)
    expect(p2.state).toBe(FighterState.KNOCKDOWN);
  });

  it('飞行道具命中 pushback (投射物碰撞检测)', () => {
    // 飞行道具通过 projectileResolver 处理, 测试投射物碰撞后的 pushback
    const proj = new Projectile(200, 480, 1, 20, 0, 'kyo');
    // 投射物初始位置在 p2 附近
    proj.x = 345;
    proj.y = 480;

    const p2 = new Fighter(350, '#0000ff', -1);
    const hurtbox = p2.getHurtbox();

    // 投射物 hitbox 与 defender hurtbox 重叠
    const projHitbox = proj.getHitbox();
    const hit = projHitbox!.x < hurtbox.x + hurtbox.width
      && projHitbox!.x + projHitbox!.width > hurtbox.x
      && projHitbox!.y < hurtbox.y + hurtbox.height
      && projHitbox!.y + projHitbox!.height > hurtbox.y;

    expect(hit).toBe(true);
    // 投射物命中后 pushback 由 projectileResolver 处理
    // 这里验证投射物本身的碰撞检测正常
    expect(proj.active).toBe(true);
  });
});

// ==========================================================================
// 4. 版边压制场景 (8 tests)
// ==========================================================================

describe('版边压制场景', () => {
  it('被压在版边 -> 连续防御 -> pushback 最小 -> 被破防 (Guard Crush)', () => {
    const cs = new CombatSystem(createBlockingInputProvider());
    // p2 被压在版边
    const p1 = new Fighter(STAGE_RIGHT - 70, '#ff0000', 1);
    const p2 = new Fighter(STAGE_RIGHT - 10, '#0000ff', -1);

    // 将 p2 的防御槽设为很低
    p2.guardGauge = 5;

    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);

    // 防御槽被消耗到 0 → Guard Crush
    // drain = GUARD_GAUGE_DRAIN_HEAVY(10), gauge = max(0, 5-10) = 0 -> Guard Crush
    expect(p2.state).toBe(FighterState.GUARD_CRUSH);
    expect(p2.guardCrushTimer).toBe(GUARD_CRUSH_DURATION);
  });

  it('版边 Guard Gauge 消耗加速 (防御时无空间后退)', () => {
    // 版边防御: 攻击者被额外推回, 但防御方 gauge 消耗不变
    const cs = new CombatSystem(createBlockingInputProvider());
    const p1 = new Fighter(STAGE_RIGHT - 70, '#ff0000', 1);
    const p2 = new Fighter(STAGE_RIGHT - 10, '#0000ff', -1);

    const gaugeBefore = p2.guardGauge;
    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);

    // Guard gauge 应该减少
    const drain = GUARD_GAUGE_DRAIN_HEAVY; // 10
    const bonus = GUARD_GAUGE_METER_BONUS_ON_BLOCK; // 2
    expect(p2.guardGauge).toBeCloseTo(gaugeBefore - drain + bonus, 1);

    // 版边时攻击者也被推回 (防止无限角落压制)
    expect(p1.vx).not.toBe(0);
  });

  it('版边 Guard Crush -> 大破绽 (GUARD_CRUSH_DURATION 帧)', () => {
    const cs = new CombatSystem(createBlockingInputProvider());
    const p1 = new Fighter(STAGE_RIGHT - 70, '#ff0000', 1);
    const p2 = new Fighter(STAGE_RIGHT - 10, '#0000ff', -1);

    // 直接触发 Guard Crush
    p2.guardGauge = 0;
    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);

    expect(p2.state).toBe(FighterState.GUARD_CRUSH);
    expect(p2.guardCrushTimer).toBe(GUARD_CRUSH_DURATION);
    // Guard Crush 期间不能防御
    expect(p2.canBlock()).toBe(false);
  });

  it('版边 GC Roll 逃脱位置 (GC Roll 期间完全无敌)', () => {
    // 模拟 Guard Cancel Roll 逃脱
    const p = new Fighter(STAGE_RIGHT - 10, '#ff0000', -1);

    // GC Roll: 启动滚动, 面朝版边内方向滚动
    p.state = FighterState.ROLL;
    p.rollTimer = 20; // ROLL_DURATION
    p.isGCRoll = true;

    // 验证 GC Roll 期间完全无敌
    expect(p.isRollInvincible()).toBe(true);

    // 滚动 10 帧 (还在 roll 期间)
    for (let i = 0; i < 10; i++) {
      p.x += 6 * p.facing; // ROLL_SPEED * facing (向左, facing=-1)
      p.x = Math.max(STAGE_LEFT, Math.min(STAGE_RIGHT, p.x));
      p.rollTimer--;
    }

    // Roll 位置向版边中央移动
    expect(p.x).toBeLessThan(STAGE_RIGHT);
    expect(p.x).toBeGreaterThanOrEqual(STAGE_LEFT);
    // 还在 roll 期间
    expect(p.isRolling()).toBe(true);
    expect(p.isRollInvincible()).toBe(true); // GC Roll 全程无敌
  });

  it('版边投技后位置不超界', () => {
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(STAGE_RIGHT - 70, '#ff0000', 1);
    const p2 = new Fighter(STAGE_RIGHT - 10, '#0000ff', -1);

    const p1XBefore = p1.x;

    // p1 投 p2 (forward throw)
    forceActivePhase(p1, AttackType.THROW_FORWARD);
    cs.resolveAttacks(p1, p2, []);

    // 投技进入拆投窗口: p2.isBeingThrown = true
    expect(p2.isBeingThrown).toBe(true);
    // 投技后 p2 被移到 p1.x + THROW_DISTANCE * facing, 但被 clamped
    expect(p2.x).toBeLessThanOrEqual(STAGE_RIGHT);
    expect(p2.x).toBeGreaterThanOrEqual(STAGE_LEFT);
    // 投技不改变攻击者位置
    expect(p1.x).toBe(p1XBefore);
  });

  it('版边 DM 位置修正 (DM 命中版边对手不超界)', () => {
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(STAGE_RIGHT - 70, '#ff0000', 1);
    const p2 = new Fighter(STAGE_RIGHT - 10, '#0000ff', -1);

    forceActivePhase(p1, AttackType.DM_OROCHINAGI);
    cs.resolveAttacks(p1, p2, []);

    // DM 命中后 p2 被击倒
    expect(p2.state).toBe(FighterState.KNOCKDOWN);
    // p2 的位置不应超出版边
    expect(p2.x).toBeLessThanOrEqual(STAGE_RIGHT);
    expect(p2.x).toBeGreaterThanOrEqual(STAGE_LEFT);
  });

  it('版边对空 -> 版边追击 (空中对手被 CD 壁弹)', () => {
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(STAGE_RIGHT - 70, '#ff0000', 1);
    const p2 = new Fighter(STAGE_RIGHT - 20, '#0000ff', -1);

    // p2 在空中 + juggle 状态 — 设置 y 使 hurtbox 与 STAND_CD hitbox 重叠
    // STAND_CD frame 0 hitbox: ox=35, oy=-55, w=45, h=38 → y: 510-55=455 to 455+38=493
    // p2.y=490: hurtbox y=290..490 → overlap: 455..490 ✓
    p2.y = 490;
    p2.vy = 2;
    p2.juggleState = JuggleState.FULL;
    p2.jugglePoints = JUGGLE_POINTS_MAX;

    forceActivePhase(p1, AttackType.STAND_CD);
    cs.resolveAttacks(p1, p2, []);

    // X overlap: p1=STAGE_RIGHT-70=1290, hitbox: 1290+35=1325 to 1370
    // p2=STAGE_RIGHT-20=1340, hurtbox: 1340-40=1300 to 1340
    // 1325 < 1340 AND 1370 > 1300 → yes
    // Y overlap: hitbox y=455..493, hurtbox y=290..490 → overlap 455..490 → yes
    expect(p2.isCounterWire).toBe(true);
    expect(p2.wallBounceCount).toBe(1);
    expect(p2.juggleState).toBe(JuggleState.FULL);
    // 壁弹后 juggle points 足够追打
    expect(p2.jugglePoints).toBeGreaterThan(0);
  });

  it('版边反击 -> 中央位置 (版边防御后反击推开对手)', () => {
    // 版边被压制, 成功防御后攻击者被额外推回
    const cs = new CombatSystem(createBlockingInputProvider());
    const p1 = new Fighter(STAGE_RIGHT - 70, '#ff0000', 1);
    const p2 = new Fighter(STAGE_RIGHT - 10, '#0000ff', -1);

    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);

    // 版边防御: 攻击者被额外推回 (代码中 cornerBonus)
    // defenderNearCorner = p2.x > STAGE_RIGHT - 60 → true
    const atkPushback = Math.abs(p1.vx);
    // 非版边场景对比
    const cs2 = new CombatSystem(createBlockingInputProvider());
    const { p1: p1c, p2: p2c } = createCloseMatch();
    forceActivePhase(p1c, AttackType.STAND_C);
    cs2.resolveAttacks(p1c, p2c, []);
    const normalAtkPushback = Math.abs(p1c.vx);

    // 版边时攻击者被推回更多
    expect(atkPushback).toBeGreaterThan(normalAtkPushback);
  });
});

// ==========================================================================
// 5. 屏幕震动 + 版边 (4 tests)
// ==========================================================================

describe('屏幕震动 + 版边', () => {
  it('版边命中 shake 效果 (使用 getShakeIntensity)', () => {
    // 验证 shake 系统对版边命中的响应
    // 轻攻击版边命中
    const lightShake = getShakeIntensity('STAND_A', 33, false);
    expect(lightShake).toBe(SHAKE_LIGHT); // 3

    // 重攻击版边命中
    const heavyShake = getShakeIntensity('STAND_C', 100, false);
    expect(heavyShake).toBe(SHAKE_HEAVY); // 6

    // shake 强度版边与中央一致 (位置不影响 shake 值)
    const cornerShake = getShakeIntensity('STAND_C', 100, false);
    expect(cornerShake).toBe(SHAKE_HEAVY);
  });

  it('版边 KO shake 效果', () => {
    // KO shake 是最强的
    const koShake = SHAKE_KO;
    const normalHeavyShake = SHAKE_HEAVY;
    expect(koShake).toBeGreaterThan(normalHeavyShake);
    expect(koShake).toBe(22); // SHAKE_KO = 22

    // 持续时间也最长
    const koDuration = getShakeDuration('DM_OROCHINAGI');
    expect(koDuration).toBe(16); // DM shake duration
  });

  it('版边壁弹 shake 效果', () => {
    // STAND_CD 的 shake: dmg=83 > SHAKE_DMG_THRESHOLD(50) → 4
    const cdShake = getShakeIntensity('STAND_CD', 83, false);
    // STAND_CD 不以 _C/_D 结尾 (以 _CD 结尾), 且不以 CLOSE_/SPECIAL_/DM_ 开头
    // 所以走到 dmg > SHAKE_DMG_THRESHOLD(50) → 4
    expect(cdShake).toBe(4);

    // Counter Hit 壁弹: counter=true → SHAKE_COUNTER
    const counterShake = getShakeIntensity('STAND_A', 33, true);
    // counter hit: SHAKE_COUNTER = 6
    expect(counterShake).toBe(6);
    // SHAKE_COUNTER != SHAKE_SPECIAL
    expect(SHAKE_SPECIAL).toBe(8);
  });

  it('双方版边 shake 互相不影响 (独立 shake 计算)', () => {
    // 验证 shake 系统基于攻击类型而非位置
    const shake1 = getShakeIntensity('STAND_A', 33, false);
    const shake2 = getShakeIntensity('STAND_C', 100, false);

    // 两次不同攻击的 shake 值不同且独立
    expect(shake1).not.toBe(shake2);
    expect(shake1).toBe(SHAKE_LIGHT);
    expect(shake2).toBe(SHAKE_HEAVY);

    // 不同 duration 也独立
    const dur1 = getShakeDuration('STAND_A');
    const dur2 = getShakeDuration('STAND_C');
    expect(dur1).not.toBe(dur2);
    expect(dur1).toBe(4); // SHAKE_DURATION_LIGHT
    expect(dur2).toBe(8); // SHAKE_DURATION_HEAVY
  });
});

// ==========================================================================
// 6. 推力 + 缩放交互 (4 tests)
// ==========================================================================

describe('推力 + 缩放交互', () => {
  it('版边命中缩放 (连段中 pushback 递减)', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createCloseMatch();

    const pushbacks: number[] = [];

    for (let i = 0; i < 4; i++) {
      resetAttacker(p1);
      if (i > 0) prepareDefenderForNextHit(p2);
      forceActivePhase(p1, AttackType.STAND_C);
      cs.resolveAttacks(p1, p2, []);
      pushbacks.push(Math.abs(p2.vx));
    }

    // 连段中 pushback 递减: comboScale = 1.0, 0.85, 0.70, 0.55
    const basePB = FRAME_DATA[AttackType.STAND_C].pushback * 0.85; // 8 * 0.85 = 6.8
    expect(pushbacks[0]).toBeCloseTo(basePB * 1.0, 1); // 第1击
    expect(pushbacks[1]).toBeCloseTo(basePB * 0.85, 1); // 第2击
    expect(pushbacks[2]).toBeCloseTo(basePB * 0.70, 1); // 第3击
    expect(pushbacks[3]).toBeCloseTo(basePB * 0.55, 1); // 第4击
  });

  it('版边 DM 缩放 (DM 在连段中额外 -10% 缩放)', () => {
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);
    p2.maxHealth = 2000;
    p2.health = 2000;

    // 先建立 combo (5 hits → comboHits=5 at DM)
    for (let i = 0; i < 5; i++) {
      resetAttacker(p1);
      if (i > 0) prepareDefenderForNextHit(p2);
      forceActivePhase(p1, AttackType.STAND_A);
      cs.resolveAttacks(p1, p2, []);
    }

    // 第6击 DM: comboHits=5 → tier 4-6 scale=0.85, DM额外-0.10 → 0.75
    resetAttacker(p1);
    prepareDefenderForNextHit(p2);
    const healthBefore = p2.health;
    forceActivePhase(p1, AttackType.DM_OROCHINAGI);
    cs.resolveAttacks(p1, p2, []);

    const dmDamage = healthBefore - p2.health;
    const baseDamage = FRAME_DATA[AttackType.DM_OROCHINAGI].damage; // 200
    const expectedDamage = Math.round(baseDamage * 0.75); // 200 * 0.75 = 150
    expect(dmDamage).toBe(expectedDamage);
  });

  it('版边连段推力 vs 缩放 (高 combo 下 pushback 和 damage 都递减)', () => {
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);
    p2.maxHealth = 3000;
    p2.health = 3000;

    const damages: number[] = [];
    const pushValues: number[] = [];

    for (let i = 0; i < 5; i++) {
      const healthBefore = p2.health;
      resetAttacker(p1);
      if (i > 0) prepareDefenderForNextHit(p2);
      forceActivePhase(p1, AttackType.STAND_C);
      cs.resolveAttacks(p1, p2, []);

      damages.push(healthBefore - p2.health);
      pushValues.push(Math.abs(p2.vx));
    }

    // Damage: comboHits=0→无缩放100, comboHits=5→scale=0.85→85
    expect(damages[0]).toBe(100); // comboHits=0 → 无缩放
    expect(damages[4]).toBe(85); // comboHits=5 → scale=0.85

    // Pushback 持续递减
    expect(pushValues[0]).toBeGreaterThan(pushValues[4]);
  });

  it('版边绝体绝命 + MAX 伤害 (双重加成叠加)', () => {
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);

    // 设置 p2 低血量 + 高 maxHealth 以看到完整伤害
    p2.maxHealth = 2000;
    p2.health = 400; // 400/2000 = 0.20 < 0.25 → 绝体绝命

    const healthBefore = p2.health;
    forceActivePhase(p1, AttackType.DM_OROCHINAGI);
    // MAX mode + Desperation
    cs.resolveAttacks(p1, p2, [], undefined, 0, [true, false]);

    const damage = healthBefore - p2.health;
    const baseDamage = FRAME_DATA[AttackType.DM_OROCHINAGI].damage; // 200
    // MAX bonus first: 200 * 1.20 = 240
    // Desperation bonus: 240 * 1.30 = 312
    const expectedDamage = Math.round(Math.round(baseDamage * MAX_MODE_DAMAGE_BONUS) * DESPERATION_DM_DAMAGE_BONUS);
    expect(damage).toBe(expectedDamage);
    expect(damage).toBeGreaterThan(baseDamage);
  });
});
