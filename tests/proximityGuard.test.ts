/**
 * proximityGuard.test.ts -- 近身防御(Proximity Guard)与近身判定集成测试
 *
 * 验证场景:
 *  1. Proximity Guard基础 (近距离HIGH攻击可被蹲防)
 *  2. 近身/远距离判定 (CLOSE_攻击距离门控, 伤害加成)
 *  3. 防御方向 (站防/蹲防/错误防御)
 *  4. 特殊防御情况 (无敌帧/后退/攻击中/倒地不可防)
 *  5. 防御与位置 (推后/版边/攻击者位移/Pushblock版边)
 *
 * 依赖: CombatSystem + Fighter + 真实 frame data + attack classifier.
 *
 * 关键实现细节:
 *  - canBlock() 检查 defender.state === FighterState.CROUCH (不是input.down)
 *  - canAirBlock() 要求 defender.state 为 JUMP/HOP/RUN_JUMP/HYPER_JUMP/AIR_ATTACK/AIR_BLOCK
 *  - proximity guard: canBlock(hitLevel='HIGH', crouching=true, dist < PROXIMITY_GUARD_RANGE) → true
 *  - wrong block: defender按下back但block方向错误 → BLOCK状态但带额外惩罚
 *  - 逐帧hitbox: ATTACK_FRAMES表覆盖了HITBOX_OFFSETS, 实际hitbox以逐帧数据为准
 */
import { describe, it, expect } from 'vitest';
import { CombatSystem } from '../src/combat/combatSystem.js';
import { Fighter } from '../src/entities/fighter.js';
import type { IInputProvider } from '../src/input/inputProvider.js';
import type { PlayerInput } from '../src/core/types.js';
import { AttackType, FighterState, JuggleState } from '../src/core/types.js';
import { CLOSE_RANGE } from '../src/core/types.js';
import {
  MAX_HEALTH,
  FRAME_DATA,
  PROXIMITY_GUARD_RANGE,
  PUSHBLOCK_THRESHOLD,
  PUSHBLOCK_EXTRA_PUSHBACK,
  WRONG_BLOCK_PUSHBACK_MULT,
  WRONG_BLOCK_STUN_MULT,
  STAGE_LEFT,
  STAGE_RIGHT,
  FIGHTER_WIDTH,
  CHIP_DAMAGE_RATIO,
  JUGGLE_POINTS_MAX,
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

// P2 facing=-1 时, back = right
// 站防: back pressed + standing state (IDLE/WALK)
function createStandBlockProvider(): IInputProvider {
  return createInputProvider({}, { right: true });
}

// 蹲防: back pressed + crouching state
// P2 facing=-1, back = right
// 注意: 只是提供input, 还需要手动设置 p2.state = FighterState.CROUCH
function createCrouchBlockProvider(): IInputProvider {
  return createInputProvider({}, { right: true, down: true });
}

// 无防御输入
function createNoBlockProvider(): IInputProvider {
  return createInputProvider({}, {});
}

// ==========================================================================
// 1. Proximity Guard基础
// ==========================================================================

describe('Proximity Guard基础', () => {
  it('近距离HIGH攻击蹲防时proximity guard生效(正确防御)', () => {
    // HIGH攻击 + 蹲防 + 距离 < PROXIMITY_GUARD_RANGE → proximity guard允许正确防御
    // 使用 CMD_GOFU_YOU (HIGH), frame 1 hitbox: {ox:45, w:48} → range [45, 93]
    // dist=80: hitbox [345, 393], p2 hurtbox [340, 420] → overlap ✓
    const dist = 80;
    const cs = new CombatSystem(createCrouchBlockProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(300 + dist, '#0000ff', -1);
    p2.state = FighterState.CROUCH;

    forceActivePhase(p1, AttackType.CMD_GOFU_YOU, 1);
    cs.resolveAttacks(p1, p2, []);

    // proximity guard生效: 蹲防正确防御HIGH
    expect(p2.state).toBe(FighterState.BLOCK);
    expect(p2.health).toBeLessThan(MAX_HEALTH); // chip damage
    expect(p2.health).toBeGreaterThan(0);
    // 正确防御的blockstun应该是标准值(无惩罚)
    const fd = FRAME_DATA[AttackType.CMD_GOFU_YOU];
    expect(p2.blockstunTimer).toBe(fd.blockstun);
  });

  it('远距离HIGH攻击蹲防变成错误防御(wrong block惩罚)', () => {
    // HIGH攻击 + 蹲防 + 距离 > PROXIMITY_GUARD_RANGE → proximity guard不生效 → wrong block
    // 使用 CMD_GOFU_YOU frame 1 hitbox: {ox:45, w:48} → range [45, 93]
    // dist=125: hitbox [345, 393], p2 hurtbox [385, 465] → overlap [385, 393] ✓ (barely)
    const dist = 125;
    const cs = new CombatSystem(createCrouchBlockProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(300 + dist, '#0000ff', -1);
    p2.state = FighterState.CROUCH;

    forceActivePhase(p1, AttackType.CMD_GOFU_YOU, 1);
    cs.resolveAttacks(p1, p2, []);

    // proximity guard不生效: 蹲防挡HIGH是wrong block → BLOCK状态但有惩罚
    expect(p2.state).toBe(FighterState.BLOCK);
    const fd = FRAME_DATA[AttackType.CMD_GOFU_YOU];
    // wrong block: blockstun * WRONG_BLOCK_STUN_MULT(1.2)
    expect(p2.blockstunTimer).toBe(Math.round(fd.blockstun * WRONG_BLOCK_STUN_MULT));
  });

  it('MID攻击可站防也可蹲防', () => {
    // STAND_C 是 MID 攻击
    // STAND_C frame 1 hitbox: {ox:55, w:50} → range [55, 105]
    const dist = 80;

    // 蹲防
    const csCrouch = new CombatSystem(createCrouchBlockProvider());
    const p1c = new Fighter(300, '#ff0000', 1);
    const p2c = new Fighter(300 + dist, '#0000ff', -1);
    p2c.state = FighterState.CROUCH;
    forceActivePhase(p1c, AttackType.STAND_C, 1);
    csCrouch.resolveAttacks(p1c, p2c, []);
    expect(p2c.state).toBe(FighterState.BLOCK);

    // 站防
    const csStand = new CombatSystem(createStandBlockProvider());
    const p1s = new Fighter(300, '#ff0000', 1);
    const p2s = new Fighter(300 + dist, '#0000ff', -1);
    forceActivePhase(p1s, AttackType.STAND_C, 1);
    csStand.resolveAttacks(p1s, p2s, []);
    expect(p2s.state).toBe(FighterState.BLOCK);
  });

  it('LOW攻击只能蹲防', () => {
    // CROUCH_B 是 LOW 攻击
    // CROUCH_B frame 1 hitbox: {ox:45, w:50} → range [45, 95]
    const dist = 80;

    // 蹲防可以挡 → 正确防御
    const csCrouch = new CombatSystem(createCrouchBlockProvider());
    const p1c = new Fighter(300, '#ff0000', 1);
    const p2c = new Fighter(300 + dist, '#0000ff', -1);
    p2c.state = FighterState.CROUCH;
    forceActivePhase(p1c, AttackType.CROUCH_B, 1);
    csCrouch.resolveAttacks(p1c, p2c, []);
    expect(p2c.state).toBe(FighterState.BLOCK);
    // 正确防御blockstun
    const fd = FRAME_DATA[AttackType.CROUCH_B];
    expect(p2c.blockstunTimer).toBe(fd.blockstun);

    // 站防不能挡 → wrong block
    const csStand = new CombatSystem(createStandBlockProvider());
    const p1s = new Fighter(300, '#ff0000', 1);
    const p2s = new Fighter(300 + dist, '#0000ff', -1);
    forceActivePhase(p1s, AttackType.CROUCH_B, 1);
    csStand.resolveAttacks(p1s, p2s, []);
    expect(p2s.state).toBe(FighterState.BLOCK);
    // wrong block惩罚: blockstun * 1.2
    expect(p2s.blockstunTimer).toBe(Math.round(fd.blockstun * WRONG_BLOCK_STUN_MULT));
  });

  it('距离小于PROXIMITY_GUARD_RANGE时proximity guard生效', () => {
    // HIGH攻击 + 蹲防 + dist < PROXIMITY_GUARD_RANGE → 正确防御
    const dist = PROXIMITY_GUARD_RANGE - 10; // 110
    // CMD_GOFU_YOU frame 1: {ox:45, w:48} → [345, 393]
    // p2 hurtbox: [370, 450] → overlap ✓
    const cs = new CombatSystem(createCrouchBlockProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(300 + dist, '#0000ff', -1);
    p2.state = FighterState.CROUCH;

    forceActivePhase(p1, AttackType.CMD_GOFU_YOU, 1);
    cs.resolveAttacks(p1, p2, []);

    expect(p2.state).toBe(FighterState.BLOCK);
    // 正确防御(无wrong block惩罚)
    const fd = FRAME_DATA[AttackType.CMD_GOFU_YOU];
    expect(p2.blockstunTimer).toBe(fd.blockstun);
  });

  it('距离大于PROXIMITY_GUARD_RANGE时proximity guard不生效', () => {
    // HIGH攻击 + 蹲防 + dist > PROXIMITY_GUARD_RANGE → wrong block
    const dist = PROXIMITY_GUARD_RANGE + 5; // 125
    // CMD_GOFU_YOU frame 1: {ox:45, w:48} → [345, 393]
    // p2 hurtbox: [385, 465] → overlap [385, 393] ✓
    const cs = new CombatSystem(createCrouchBlockProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(300 + dist, '#0000ff', -1);
    p2.state = FighterState.CROUCH;

    forceActivePhase(p1, AttackType.CMD_GOFU_YOU, 1);
    cs.resolveAttacks(p1, p2, []);

    // proximity guard不生效 → wrong block
    expect(p2.state).toBe(FighterState.BLOCK);
    const fd = FRAME_DATA[AttackType.CMD_GOFU_YOU];
    expect(p2.blockstunTimer).toBe(Math.round(fd.blockstun * WRONG_BLOCK_STUN_MULT));
  });
});

// ==========================================================================
// 2. 近身/远距离判定
// ==========================================================================

describe('近身/远距离判定', () => {
  it('CLOSE_攻击在近距离正常命中', () => {
    // CLOSE_C 在近距离(50px)应正常命中
    // CLOSE_C frame 1: {ox:40, w:48} → range [40, 88]
    // dist=50: hitbox [340, 388], p2 hurtbox [310, 390] → overlap ✓
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);

    forceActivePhase(p1, AttackType.CLOSE_C, 1);
    cs.resolveAttacks(p1, p2, []);

    expect(p2.state).toBe(FighterState.HITSTUN);
    const baseDamage = FRAME_DATA[AttackType.CLOSE_C].damage;
    // 近距离bonus条件: dist < CLOSE_RANGE * 0.5 = 40, here dist=50 → no bonus
    expect(MAX_HEALTH - p2.health).toBe(baseDamage);
  });

  it('远距离CLOSE_攻击hitbox不重叠导致不命中', () => {
    // CLOSE_C frame 1: {ox:40, w:48} → range [40, 88]
    // dist=200: hitbox [340, 388], p2 hurtbox [460, 540] → no overlap
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(500, '#0000ff', -1);

    forceActivePhase(p1, AttackType.CLOSE_C, 1);
    cs.resolveAttacks(p1, p2, []);

    expect(p2.state).toBe(FighterState.IDLE);
    expect(p2.health).toBe(MAX_HEALTH);
  });

  it('近距离STAND攻击可触发', () => {
    // STAND_C frame 1: {ox:55, w:50} → range [55, 105]
    // dist=50: hitbox [355, 405], p2 hurtbox [310, 390] → overlap ✓
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);

    forceActivePhase(p1, AttackType.STAND_C, 1);
    cs.resolveAttacks(p1, p2, []);

    expect(p2.state).toBe(FighterState.HITSTUN);
    expect(p2.health).toBeLessThan(MAX_HEALTH);
  });

  it('距离影响伤害: CLOSE_攻击在极近距离有+10% bonus', () => {
    // 极近距离: dist < CLOSE_RANGE * 0.5 = 40
    // CLOSE_C damage = 100, bonus = 100 * 1.1 = 110
    const csClose = new CombatSystem(createInputProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(330, '#0000ff', -1); // dist = 30 < 40

    forceActivePhase(p1, AttackType.CLOSE_C, 1);
    csClose.resolveAttacks(p1, p2, []);

    const baseDamage = FRAME_DATA[AttackType.CLOSE_C].damage;
    const expectedBonusDamage = Math.round(baseDamage * 1.1);
    expect(MAX_HEALTH - p2.health).toBe(expectedBonusDamage); // 110
  });

  it('版边距离判定: 版边附近防御者x被限制', () => {
    // 防御者在版边 (接近 STAGE_RIGHT)
    // STAND_C frame 1: {ox:55, w:50}
    const cs = new CombatSystem(createStandBlockProvider());
    const p1 = new Fighter(STAGE_RIGHT - 100, '#ff0000', 1);
    const p2 = new Fighter(STAGE_RIGHT - 40, '#0000ff', -1);

    forceActivePhase(p1, AttackType.STAND_C, 1);
    cs.resolveAttacks(p1, p2, []);

    expect(p2.state).toBe(FighterState.BLOCK);
    // 防御后p2被推后但不应超出STAGE_RIGHT
    expect(p2.x).toBeLessThanOrEqual(STAGE_RIGHT);
  });
});

// ==========================================================================
// 3. 防御方向
// ==========================================================================

describe('防御方向', () => {
  it('站防防HIGH', () => {
    // CMD_GOFU_YOU 是 HIGH, 站防可以挡
    // frame 1 hitbox: {ox:45, w:48} → range [45, 93]
    // dist=50: hitbox [345, 393], p2 hurtbox [310, 390] → overlap ✓
    const cs = new CombatSystem(createStandBlockProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);

    forceActivePhase(p1, AttackType.CMD_GOFU_YOU, 1);
    cs.resolveAttacks(p1, p2, []);

    expect(p2.state).toBe(FighterState.BLOCK);
    const fd = FRAME_DATA[AttackType.CMD_GOFU_YOU];
    expect(p2.health).toBe(MAX_HEALTH - Math.round(fd.damage * CHIP_DAMAGE_RATIO));
  });

  it('蹲防防LOW', () => {
    // CROUCH_B 是 LOW, 蹲防可以挡
    // frame 1 hitbox: {ox:45, w:50} → range [45, 95]
    // dist=50: hitbox [345, 395], p2 hurtbox [310, 390] → overlap ✓
    const cs = new CombatSystem(createCrouchBlockProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);
    p2.state = FighterState.CROUCH;

    forceActivePhase(p1, AttackType.CROUCH_B, 1);
    cs.resolveAttacks(p1, p2, []);

    expect(p2.state).toBe(FighterState.BLOCK);
  });

  it('站防不防LOW(错误防御惩罚)', () => {
    // CROUCH_B 是 LOW, 站防是错误防御
    const cs = new CombatSystem(createStandBlockProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);

    forceActivePhase(p1, AttackType.CROUCH_B, 1);
    cs.resolveAttacks(p1, p2, []);

    expect(p2.state).toBe(FighterState.BLOCK);
    // 错误防御有额外惩罚: blockstun * 1.2
    const fd = FRAME_DATA[AttackType.CROUCH_B];
    expect(p2.blockstunTimer).toBe(Math.round(fd.blockstun * WRONG_BLOCK_STUN_MULT));
  });

  it('蹲防不防HIGH在远距离(不按back则被命中)', () => {
    // CMD_GOFU_YOU 是 HIGH, 蹲防在远距离(dist > PROXIMITY_GUARD_RANGE)不按back → 命中
    const dist = 125;
    const cs = new CombatSystem(createNoBlockProvider()); // 不按back
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(300 + dist, '#0000ff', -1);
    p2.state = FighterState.CROUCH;

    forceActivePhase(p1, AttackType.CMD_GOFU_YOU, 1);
    cs.resolveAttacks(p1, p2, []);

    // 不按back → 不尝试防御 → 被命中
    expect(p2.state).toBe(FighterState.HITSTUN);
  });

  it('蹲防防MID', () => {
    // STAND_C 是 MID, 蹲防可以挡
    // frame 1 hitbox: {ox:55, w:50} → range [55, 105]
    const cs = new CombatSystem(createCrouchBlockProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);
    p2.state = FighterState.CROUCH;

    forceActivePhase(p1, AttackType.STAND_C, 1);
    cs.resolveAttacks(p1, p2, []);

    expect(p2.state).toBe(FighterState.BLOCK);
  });

  it('空中防御: 空中按后可防HIGH但不能防LOW', () => {
    // 空中防御HIGH攻击
    // 注意: 空中对手必须有juggleState != NONE才能被命中(KOF2002 juggle系统)
    const csHigh = new CombatSystem(createStandBlockProvider());
    const p1h = new Fighter(300, '#ff0000', 1);
    const p2h = new Fighter(350, '#0000ff', -1);
    p1h.y = 400;
    p2h.y = 400;
    p2h.vy = -5;
    p2h.state = FighterState.JUMP;
    p2h.juggleState = JuggleState.FULL; // 需要juggle state才能命中空中对手
    p2h.jugglePoints = JUGGLE_POINTS_MAX;

    forceActivePhase(p1h, AttackType.JUMP_C, 2);
    csHigh.resolveAttacks(p1h, p2h, []);

    // 空中按后防HIGH → AIR_BLOCK
    expect(p2h.state).toBe(FighterState.AIR_BLOCK);

    // 空中防御LOW: CROUCH_B是LOW, 但CROUCH_B hitbox在地面高度
    // 即便空中p2有juggle state, LOW攻击hitbox在地面不与空中p2重叠
    const csLow = new CombatSystem(createStandBlockProvider());
    const p1l = new Fighter(300, '#ff0000', 1);
    const p2l = new Fighter(350, '#0000ff', -1);
    p2l.y = 400;
    p2l.vy = -5;
    p2l.state = FighterState.JUMP;
    p2l.juggleState = JuggleState.FULL;
    p2l.jugglePoints = JUGGLE_POINTS_MAX;

    forceActivePhase(p1l, AttackType.CROUCH_B, 1);
    csLow.resolveAttacks(p1l, p2l, []);

    // LOW hitbox在地面, 不命中空中p2 → 不进入AIR_BLOCK
    expect(p2l.state).not.toBe(FighterState.AIR_BLOCK);
  });
});

// ==========================================================================
// 4. 特殊防御情况
// ==========================================================================

describe('特殊防御情况', () => {
  it('无敌帧期间不进入防御(直接跳过)', () => {
    // invincible=true → getEffectiveHurtbox()返回null → resolveHit early return
    const cs = new CombatSystem(createStandBlockProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);
    p2.invincible = true;

    forceActivePhase(p1, AttackType.STAND_C, 1);
    cs.resolveAttacks(p1, p2, []);

    // 完全无敌 → 不受任何影响
    expect(p2.state).toBe(FighterState.IDLE);
    expect(p2.health).toBe(MAX_HEALTH);
  });

  it('后退时仍然可以防御', () => {
    // WALK state + back input → can block
    // WALK 在 canBlock() 允许的状态列表中
    const cs = new CombatSystem(createStandBlockProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);
    p2.state = FighterState.WALK;

    forceActivePhase(p1, AttackType.STAND_C, 1);
    cs.resolveAttacks(p1, p2, []);

    expect(p2.state).toBe(FighterState.BLOCK);
  });

  it('攻击出招中不可防御', () => {
    // p2 在 STAND_ATTACK → canBlock() returns false
    const cs = new CombatSystem(createStandBlockProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);
    p2.state = FighterState.STAND_ATTACK;

    forceActivePhase(p1, AttackType.STAND_C, 1);
    cs.resolveAttacks(p1, p2, []);

    // 攻击中不能防御 → 被命中 (Counter Hit)
    expect(p2.state).toBe(FighterState.HITSTUN);
    expect(p2.health).toBeLessThan(MAX_HEALTH);
  });

  it('倒地中不可防御', () => {
    // KNOCKDOWN state → canBlock() returns false
    const cs = new CombatSystem(createStandBlockProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);
    p2.state = FighterState.KNOCKDOWN;
    p2.isKnockedDown = true;

    forceActivePhase(p1, AttackType.STAND_C, 1);
    cs.resolveAttacks(p1, p2, []);

    // 倒地中不能防御 → 不应进入BLOCK状态
    expect(p2.state).not.toBe(FighterState.BLOCK);
  });
});

// ==========================================================================
// 5. 防御与位置
// ==========================================================================

describe('防御与位置', () => {
  it('防御时被推后', () => {
    const cs = new CombatSystem(createStandBlockProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);

    forceActivePhase(p1, AttackType.STAND_C, 1);
    cs.resolveAttacks(p1, p2, []);

    expect(p2.state).toBe(FighterState.BLOCK);
    // 防御后vx应向后方(推后)
    // p2 facing=-1, pushback should move p2 in +x direction (away from p1)
    expect(p2.vx).not.toBe(0);
  });

  it('版边防御推力最小化(攻击者被推回)', () => {
    // 防御者在版边: 被推距离受STAGE边界限制, 攻击者反而被推
    const cs = new CombatSystem(createStandBlockProvider());
    const p1 = new Fighter(STAGE_RIGHT - 100, '#ff0000', 1);
    const p2 = new Fighter(STAGE_RIGHT - 40, '#0000ff', -1);

    forceActivePhase(p1, AttackType.STAND_C, 1);
    cs.resolveAttacks(p1, p2, []);

    expect(p2.state).toBe(FighterState.BLOCK);
    // KOF2002: 角落防御时攻击者被额外推回
    expect(p1.vx).not.toBe(0);
  });

  it('命中时攻击者有微弱推回(非版边)', () => {
    // 在命中路径(非防御), 攻击者有atkPushback
    // STAND_C pushback=8, atkPushback = 8*0.2*1.0=1.6 > 0.3 → applied
    // dist=50: hitbox overlap ✓
    const cs = new CombatSystem(createNoBlockProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);

    forceActivePhase(p1, AttackType.STAND_C, 1);
    cs.resolveAttacks(p1, p2, []);

    // 命中后攻击者被推回
    expect(p2.state).toBe(FighterState.HITSTUN);
    expect(p1.vx).toBeLessThan(0); // 被推回(向左, facing=1)
  });

  it('Pushblock版边推力: 连续防御3次触发增强推力', () => {
    const cs = new CombatSystem(createStandBlockProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);

    const pushbacks: number[] = [];

    for (let i = 0; i < 4; i++) {
      resetAttacker(p1);
      p2.state = FighterState.IDLE;
      p2.blockstunTimer = 0;
      p2.consecutiveBlockDecayTimer = 30; // 防止计数器衰减
      forceActivePhase(p1, AttackType.STAND_C, 1);
      cs.resolveAttacks(p1, p2, []);
      pushbacks.push(Math.abs(p2.vx));
    }

    // 第1-2次: 正常推力
    // 第3+次: pushblock触发 (x1.5)
    expect(p2.consecutiveBlockCount).toBeGreaterThanOrEqual(PUSHBLOCK_THRESHOLD);
    // Pushblock推力 > 正常推力
    const normalPushback = pushbacks[0];
    const pushblockPushback = pushbacks[2];
    expect(pushblockPushback).toBeCloseTo(normalPushback * PUSHBLOCK_EXTRA_PUSHBACK, 1);
  });
});
