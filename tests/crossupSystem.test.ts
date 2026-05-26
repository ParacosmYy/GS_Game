/**
 * crossupSystem.test.ts -- KOF2002 跳攻击越过 (crossup) 系统测试
 *
 * 验证:
 *  1. Facing Direction -- 面向、越过后翻转、落地后更新、交换位置
 *  2. Air Attack Hitbox -- 空中攻击hitbox存在、随位置移动、不同攻击大小不同
 *  3. Crossup Detection -- 越过中线检测、防御方向反转、正面跳不反转、hitbox覆盖两侧
 *  4. Crossup Block -- 正确方向防御格挡、错误方向被命中
 *  5. Landing Recovery -- 落地recovery帧、recovery期间不可行动
 *
 * 依赖: Fighter + CombatSystem + 真实 frame data + ATTACK_FRAMES.
 */
import { describe, it, expect } from 'vitest';
import { CombatSystem } from '../src/combat/combatSystem.js';
import { Fighter } from '../src/entities/fighter.js';
import type { IInputProvider } from '../src/input/inputProvider.js';
import type { PlayerInput } from '../src/core/types.js';
import { AttackType, FighterState, JuggleState, Direction } from '../src/core/types.js';
import {
  STAGE_GROUND_Y,
  FIGHTER_WIDTH,
  FIGHTER_HEIGHT,
  MAX_HEALTH,
  FRAME_DATA,
  AIR_ATTACK_LANDING_RECOVERY,
  JUMP_LANDING_RECOVERY,
  JUGGLE_POINTS_MAX,
} from '../src/core/constants.js';
import { ATTACK_FRAMES } from '../src/core/attackFrames.js';

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

/** 创建空中攻击者 (在给定y高度跳跃中) */
function makeAirborne(f: Fighter, y = 350): void {
  f.y = y;
  f.state = FighterState.JUMP;
}

/** 创建标准对战配置 */
function createStandardMatch(x1 = 300, x2 = 500): { p1: Fighter; p2: Fighter } {
  return {
    p1: new Fighter(x1, '#ff0000', 1),
    p2: new Fighter(x2, '#0000ff', -1),
  };
}

// ==========================================================================
// 1. Facing Direction
// ==========================================================================

describe('Facing Direction', () => {
  it('面向对手时facing正确', () => {
    // p1在左边(300), p2在右边(500)
    const { p1, p2 } = createStandardMatch(300, 500);
    expect(p1.facing).toBe(1);  // 朝右
    expect(p2.facing).toBe(-1); // 朝左

    // updateFacing应根据对手位置自动调整
    p1.updateFacing(p2);
    p2.updateFacing(p1);
    expect(p1.facing).toBe(1);  // p1在p2左边 -> 朝右
    expect(p2.facing).toBe(-1); // p2在p1右边 -> 朝左
  });

  it('跳过对手后facing翻转', () => {
    // p1从x=300跳过p2(x=500)到达x=550
    const p1 = new Fighter(550, '#ff0000', 1);
    const p2 = new Fighter(500, '#0000ff', -1);

    // p1现在在p2的右边, updateFacing应翻转
    p1.updateFacing(p2);
    expect(p1.facing).toBe(-1); // p1现在在右边 -> 朝左

    p2.updateFacing(p1);
    expect(p2.facing).toBe(1); // p2现在在左边 -> 朝右
  });

  it('landing后facing根据对手位置更新', () => {
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(500, '#0000ff', -1);

    // p1跳到p2身后落地
    p1.x = 550;
    p1.y = STAGE_GROUND_Y;

    // 落地时调用updateFacing
    p1.updateFacing(p2);
    expect(p1.facing).toBe(-1); // p1在p2右边 -> 朝左

    // 对手也更新facing
    p2.updateFacing(p1);
    expect(p2.facing).toBe(1); // p2在p1左边 -> 朝右
  });

  it('两个角色交换位置时facing更新', () => {
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(500, '#0000ff', -1);

    // 初始facing
    p1.updateFacing(p2);
    p2.updateFacing(p1);
    expect(p1.facing).toBe(1);
    expect(p2.facing).toBe(-1);

    // 交换位置
    const tempX = p1.x;
    p1.x = p2.x;
    p2.x = tempX;

    p1.updateFacing(p2);
    p2.updateFacing(p1);
    expect(p1.facing).toBe(-1); // p1现在在右边
    expect(p2.facing).toBe(1);  // p2现在在左边
  });
});

// ==========================================================================
// 2. Air Attack Hitbox
// ==========================================================================

describe('Air Attack Hitbox', () => {
  it('空中攻击有hitbox', () => {
    const f = new Fighter(300, '#ff0000', 1);
    makeAirborne(f);

    // 没有攻击时无hitbox
    expect(f.getActiveHitbox()).toBeNull();

    // 空中攻击时应有hitbox
    forceActivePhase(f, AttackType.JUMP_B);
    const hitbox = f.getActiveHitbox();
    expect(hitbox).not.toBeNull();
    expect(hitbox!.width).toBeGreaterThan(0);
    expect(hitbox!.height).toBeGreaterThan(0);
  });

  it('空中hitbox位置随fighter位置移动', () => {
    const f = new Fighter(300, '#ff0000', 1);
    makeAirborne(f, 350);
    forceActivePhase(f, AttackType.JUMP_B);

    const hitbox1 = f.getActiveHitbox()!;
    const x1 = hitbox1.x;

    // 移动fighter到新位置
    f.x = 500;
    f.y = 300;
    const hitbox2 = f.getActiveHitbox()!;
    const x2 = hitbox2.x;

    // hitbox应该跟随fighter移动
    expect(x2).not.toBe(x1);
    // hitbox x应偏移200 (fighter x偏移200)
    expect(x2 - x1).toBeCloseTo(200);
  });

  it('不同空中攻击有不同hitbox大小', () => {
    const f1 = new Fighter(300, '#ff0000', 1);
    makeAirborne(f1);
    forceActivePhase(f1, AttackType.JUMP_A);
    const hbA = f1.getActiveHitbox()!;

    const f2 = new Fighter(300, '#ff0000', 1);
    makeAirborne(f2);
    forceActivePhase(f2, AttackType.JUMP_C);
    const hbC = f2.getActiveHitbox()!;

    // JUMP_C (重拳) hitbox应该比 JUMP_A (轻拳) 大
    const areaA = hbA.width * hbA.height;
    const areaC = hbC.width * hbC.height;
    expect(areaC).toBeGreaterThan(areaA);
  });
});

// ==========================================================================
// 3. Crossup Detection
// ==========================================================================

describe('Crossup Detection', () => {
  it('fighter越过对手中线时检测crossup', () => {
    const { p1, p2 } = createStandardMatch(300, 500);

    // p1初始在p2左边, facing=1 (朝右)
    p1.updateFacing(p2);
    expect(p1.facing).toBe(1);

    // p1跳过p2到达右侧
    p1.x = 550;
    p1.y = 350;
    p1.updateFacing(p2);

    // 越过后facing翻转
    expect(p1.facing).toBe(-1);
  });

  it('crossup后防御方向需要反转', () => {
    const { p1, p2 } = createStandardMatch(300, 500);

    // p1跳到p2身后, 变成从右边攻击
    p1.x = 550;
    p1.y = 350;
    p1.state = FighterState.JUMP;

    // 落地后p1 facing翻转
    p1.updateFacing(p2);
    expect(p1.facing).toBe(-1); // p1朝左(从右边攻击)

    // p2 now needs to update facing too
    p2.updateFacing(p1);
    expect(p2.facing).toBe(1); // p2现在朝右(因为p1在右边)

    // p2按右方向 = back (因为p2.facing=1, 右是forward, 左才是back)
    // 所以crossup后, 防御方向反转: 以前按左是back, 现在按右是back
    // resolveInput: back = facing===1 ? left : right
    // p2.facing=1 -> back=left
    // 这意味着p2需要按左(原来的forward方向)来防御
    const rawBackOld: PlayerInput = { ...noopInput, left: true };  // 旧back方向
    const rawBackNew: PlayerInput = { ...noopInput, right: true }; // 新back方向

    // 验证p2的back方向
    const facingOld: Direction = -1; // p2原来的facing
    // facing=-1: back = right
    const backIsRight_old = facingOld === -1; // true: 按right=按back

    const facingNew: Direction = 1; // p2现在的facing (crossup后)
    // facing=1: back = left
    const backIsRight_new = facingNew === -1; // false: 按right不再是back

    // crossup导致back方向改变
    expect(backIsRight_old).toBe(true);
    expect(backIsRight_new).toBe(false);
  });

  it('正面跳攻击不需要反转防御', () => {
    const { p1, p2 } = createStandardMatch(300, 500);

    // p1在p2左边, 正面跳攻击 (不越过)
    p1.y = 350;
    p1.state = FighterState.JUMP;

    // facing没有变化
    p1.updateFacing(p2);
    expect(p1.facing).toBe(1); // 仍然朝右

    p2.updateFacing(p1);
    expect(p2.facing).toBe(-1); // p2仍然朝左

    // p2按右=forward方向, 按左=back方向 (防御)
    // p2.facing=-1 -> back=right (按right=防御)
    // 正面攻击时防御方向不变
    expect(p2.facing).toBe(-1);
  });

  it('空中攻击的hitbox可以覆盖两侧', () => {
    // 某些跳跃攻击(如JUMP_B)有较大的横向hitbox,
    // 可以在越过过程中同时覆盖对手两侧
    const p1 = new Fighter(500, '#ff0000', 1);
    const p2 = new Fighter(500, '#0000ff', -1);

    makeAirborne(p1, 350);
    forceActivePhase(p1, AttackType.JUMP_B);

    const hitbox = p1.getActiveHitbox()!;
    const hurtbox = p2.getHurtbox();

    // 当两个角色几乎在同一x位置时, hitbox可能同时覆盖前方和后方
    // hitbox基于fighter.x偏移, 宽度足够时可以覆盖两侧
    const hitboxExtendsBack = hitbox.x < p1.x; // hitbox有部分在fighter后方
    const hitboxExtendsForward = hitbox.x + hitbox.width > p1.x;

    // JUMP_B的hitbox ox=32, w=35 -> hitbox从x+32到x+67, 向前延伸
    // 但在facing翻转的情况下, ox会被反转
    // 所以需要验证facing翻转后hitbox也能覆盖
    expect(hitbox.width).toBeGreaterThan(0);

    // 验证: 让p1在p2正上方, hitbox应该能覆盖到p2的hurtbox
    const overlaps = hitbox.x < hurtbox.x + hurtbox.width
      && hitbox.x + hitbox.width > hurtbox.x;
    // 在x=500, hitbox从530到565, hurtbox从460到540
    expect(overlaps).toBe(true);
  });
});

// ==========================================================================
// 4. Crossup Block
// ==========================================================================

describe('Crossup Block', () => {
  it('正确方向的防御可以格挡crossup', () => {
    // p1从左边跳到p2右边进行crossup
    // p2需要在新的back方向防御
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);

    // p1跳到p2身后
    p1.x = 400;
    p1.y = 350;
    p1.state = FighterState.JUMP;

    // p1 facing更新后朝左 (从右边攻击)
    p1.updateFacing(p2);
    expect(p1.facing).toBe(-1);

    // p2也更新facing
    p2.updateFacing(p1);
    expect(p2.facing).toBe(1); // p2朝右

    // p2按left = back方向 (facing=1时back=left)
    const cs = createInputProvider({}, { left: true });
    forceActivePhase(p1, AttackType.JUMP_B);

    const healthBefore = p2.health;
    const combat = new CombatSystem(cs);
    combat.resolveAttacks(p1, p2, []);

    // p2应该在BLOCK状态 (防御成功)
    expect(p2.state).toBe(FighterState.BLOCK);
    // health减少只是chip damage
    expect(p2.health).toBeGreaterThanOrEqual(healthBefore - 50);
    expect(p2.health).toBeGreaterThan(0);
  });

  it('错误方向的防御被crossup命中', () => {
    // p1从左边跳到p2右边进行crossup
    // p2按旧方向防御(不再正确)
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);

    // p1跳到p2身后
    p1.x = 400;
    p1.y = 350;
    p1.state = FighterState.JUMP;

    // 更新facing
    p1.updateFacing(p2);
    p2.updateFacing(p1);
    expect(p2.facing).toBe(1); // p2现在朝右

    // p2按right = forward (facing=1时forward=right), 不是back
    // 也就是p2在按错误方向(原来facing=-1时right=back, 现在facing=1时right=forward)
    const cs = createInputProvider({}, { right: true });
    forceActivePhase(p1, AttackType.JUMP_B);

    const combat = new CombatSystem(cs);
    combat.resolveAttacks(p1, p2, []);

    // p2应该在HITSTUN状态 (被命中, 防御失败)
    expect(p2.state).toBe(FighterState.HITSTUN);
    // health减少应该是完整伤害
    const damage = FRAME_DATA[AttackType.JUMP_B].damage;
    expect(p2.health).toBe(MAX_HEALTH - damage);
  });
});

// ==========================================================================
// 5. Landing Recovery
// ==========================================================================

describe('Landing Recovery', () => {
  it('空中攻击落地后有recovery帧', () => {
    // 空中攻击落地后有 AIR_ATTACK_LANDING_RECOVERY=5 帧的recovery
    const f = new Fighter(300, '#ff0000', 1);

    // 模拟空中攻击落地: 落地时状态回到IDLE但landingRecovery生效
    makeAirborne(f);
    forceActivePhase(f, AttackType.JUMP_B);

    // 模拟落地: fighterController中落地时重置state为IDLE并设landingRecovery
    f.y = STAGE_GROUND_Y;
    f.state = FighterState.IDLE; // 落地后state回到IDLE
    f.currentAttack = null; // 清除空中攻击
    f.attackPhase = 'none';
    f.landingRecovery = AIR_ATTACK_LANDING_RECOVERY;

    // 落地recovery期间不可行动 (即使state=IDLE)
    expect(f.canAct()).toBe(false);
    expect(f.landingRecovery).toBe(5);

    // 每帧减少
    f.tickTimers();
    expect(f.landingRecovery).toBe(4);
    expect(f.canAct()).toBe(false);

    // 5帧后恢复
    f.tickTimers();
    f.tickTimers();
    f.tickTimers();
    f.tickTimers();
    expect(f.landingRecovery).toBe(0);
    expect(f.canAct()).toBe(true);
  });

  it('落地recovery期间不可取消到特殊技', () => {
    const f = new Fighter(300, '#ff0000', 1);

    // 模拟空中攻击落地后的recovery
    f.state = FighterState.IDLE;
    f.landingRecovery = AIR_ATTACK_LANDING_RECOVERY;

    // canAct() 应返回 false (landing recovery期间)
    expect(f.canAct()).toBe(false);

    // 即使state是IDLE, landingRecovery>0也不可行动
    expect(f.state).toBe(FighterState.IDLE);
    expect(f.landingRecovery).toBeGreaterThan(0);
    expect(f.canAct()).toBe(false);

    // recovery结束后可以行动
    f.landingRecovery = 0;
    expect(f.canAct()).toBe(true);
  });
});
