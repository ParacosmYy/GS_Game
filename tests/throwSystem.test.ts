/**
 * throwSystem.test.ts -- 投技系统测试
 *
 * 验证:
 *  1. 普通投技命中: 范围内+对手可被投 -> 成功
 *  2. 投技失败: 范围外 -> miss
 *  3. 投技拆解: 拆投窗口内按对应按钮 -> 拆投
 *  4. 投技无敌: 被投后短暂投技无敌
 *  5. 命令投技: 不可拆投, 直接结算伤害
 *  6. 空中不可被地面投技
 *  7. DIZZY状态可被投 (风云再起特色)
 */
import { describe, it, expect } from 'vitest';
import { CombatSystem } from '../src/combat/combatSystem.js';
import { Fighter } from '../src/entities/fighter.js';
import type { IInputProvider } from '../src/input/inputProvider.js';
import type { PlayerInput } from '../src/core/types.js';
import { AttackType, FighterState, Direction } from '../src/core/types.js';
import {
  THROW_RANGE, THROW_DISTANCE,
  THROW_INVINCIBILITY_POST_ESCAPE,
  THROW_INVINCIBILITY_POST_STUN,
  THROW_INVINCIBILITY_WAKEUP,
  THROW_INVINCIBILITY_LANDING,
  THROW_INVINCIBILITY_JUMP_STARTUP,
  MAX_HEALTH,
  STAGE_GROUND_Y,
} from '../src/core/constants.js';
import type { CharacterDefinition, CharacterStats } from '../src/characters/types.js';

// ===== 最小化 IInputProvider mock =====

const NO_INPUT: PlayerInput = {
  up: false, down: false, left: false, right: false,
  buttonA: false, buttonB: false, buttonC: false, buttonD: false,
  throwAttack: false, start: false,
};

function createInputProvider(
  p1Override: Partial<PlayerInput> = {},
  p2Override: Partial<PlayerInput> = {},
): IInputProvider {
  const p1: PlayerInput = { ...NO_INPUT, ...p1Override };
  const p2: PlayerInput = { ...NO_INPUT, ...p2Override };
  return {
    getP1Input: () => p1,
    getP2Input: () => p2,
  };
}

// ===== Mock CharacterDefinition with isCommandThrow =====

function createCommandThrowCharDef(): CharacterDefinition {
  return {
    id: 'test_cmd_throw',
    name: 'Test Command Throw',
    nameCn: '测试指令投',
    color: '#ff0000',
    accentColor: '#ff6600',
    specialColor: '#ffaa00',
    specialGlow: '#ffcc44',
    portrait: '',
    winQuotes: [],
    stats: {
      walkSpeed: 4,
      runSpeed: 7,
      jumpVelocity: -14,
      hopVelocity: -10,
      hyperJumpVelocity: -17,
      maxHealth: 1000,
      pushWidth: 60,
      jumpForwardSpeed: 5,
    } as CharacterStats,
    poses: {},
    routeSpecial: () => null,
    routeNormal: () => null,
    routeRekkaFollowup: () => null,
    onAttackActive: () => false,
    getRekkaChain: () => null,
    // IORI_KUZUKAZE and CLARK_ARGENTINE are command throws
    isCommandThrow: (at: AttackType) => {
      return at === AttackType.IORI_KUZUKAZE || at === AttackType.CLARK_ARGENTINE;
    },
  };
}

// ===== 测试辅助 =====

/** 将攻击者强制推到 active phase */
function forceActivePhase(f: Fighter, attackType: AttackType, frame = 0): void {
  f.startAttack(attackType);
  f.attackPhase = 'active';
  f.attackFrame = frame;
}

/** 创建一对近距离的格斗家 (P1 在左, P2 在右) */
function createClosePair(dist = 50): [Fighter, Fighter] {
  const p1 = new Fighter(400, '#ff0000', 1 as Direction);
  const p2 = new Fighter(400 + dist, '#0000ff', -1 as Direction);
  return [p1, p2];
}

// ============================================================
// 1. 普通投技命中
// ============================================================

describe('投技系统 -- 普通投技命中', () => {
  it('THROW 在投技范围内命中 -> 进入拆投窗口', () => {
    const input = createInputProvider();
    const cs = new CombatSystem(input);
    const [p1, p2] = createClosePair(50);

    forceActivePhase(p1, AttackType.THROW);
    cs.resolveAttacks(p1, p2, []);

    // 攻击者进入投技执行状态
    expect(p1.isThrowing).toBe(true);
    expect(p1.throwVictim).toBe(p2);
    expect(p1.invincible).toBe(true); // 投技执行中攻击者无敌

    // 被投者进入被投状态
    expect(p2.isBeingThrown).toBe(true);
    expect(p2.throwEscapeTimer).toBeGreaterThan(0); // 拆投窗口已开启
  });

  it('THROW_FORWARD 在范围内命中', () => {
    const input = createInputProvider();
    const cs = new CombatSystem(input);
    const [p1, p2] = createClosePair(50);

    forceActivePhase(p1, AttackType.THROW_FORWARD);
    cs.resolveAttacks(p1, p2, []);

    expect(p1.isThrowing).toBe(true);
    expect(p2.isBeingThrown).toBe(true);
  });

  it('THROW_BACK 在范围内命中', () => {
    const input = createInputProvider();
    const cs = new CombatSystem(input);
    const [p1, p2] = createClosePair(50);

    forceActivePhase(p1, AttackType.THROW_BACK);
    cs.resolveAttacks(p1, p2, []);

    expect(p1.isThrowing).toBe(true);
    expect(p2.isBeingThrown).toBe(true);
  });

  it('投技命中时被投者被移动到投技距离位置', () => {
    const input = createInputProvider();
    const cs = new CombatSystem(input);
    const [p1, p2] = createClosePair(50);

    const p1XBefore = p1.x;
    forceActivePhase(p1, AttackType.THROW);
    cs.resolveAttacks(p1, p2, []);

    // THROW (neutral) throws in attacker's facing direction
    const expectedX = p1XBefore + THROW_DISTANCE * p1.facing;
    expect(p2.x).toBe(expectedX);
  });

  it('THROW_BACK 将对手投到攻击者身后', () => {
    const input = createInputProvider();
    const cs = new CombatSystem(input);
    const [p1, p2] = createClosePair(50);

    const p1XBefore = p1.x;
    forceActivePhase(p1, AttackType.THROW_BACK);
    cs.resolveAttacks(p1, p2, []);

    // THROW_BACK: throwDir = -attacker.facing, so opponent goes behind attacker
    const throwDir = -p1.facing;
    const expectedX = p1XBefore + THROW_DISTANCE * throwDir;
    expect(p2.x).toBe(expectedX);
  });
});

// ============================================================
// 2. 投技失败 (miss)
// ============================================================

describe('投技系统 -- 投技失败 (miss)', () => {
  it('投技范围外不命中', () => {
    const input = createInputProvider();
    const cs = new CombatSystem(input);
    const [p1, p2] = createClosePair(300); // 远超投技范围

    forceActivePhase(p1, AttackType.THROW);
    cs.resolveAttacks(p1, p2, []);

    // 不应进入投技状态
    expect(p1.isThrowing).toBe(false);
    expect(p2.isBeingThrown).toBe(false);
    expect(p1.throwVictim).toBeNull();
  });

  it('投技范围外 hasHit 不变', () => {
    const input = createInputProvider();
    const cs = new CombatSystem(input);
    const [p1, p2] = createClosePair(300);

    forceActivePhase(p1, AttackType.THROW);
    cs.resolveAttacks(p1, p2, []);

    expect(p1.hasHit).toBe(false);
  });

  it('对手在受击硬直中不可被投', () => {
    const input = createInputProvider();
    const cs = new CombatSystem(input);
    const [p1, p2] = createClosePair(50);

    // 使 defender 进入 HITSTUN
    p2.state = FighterState.HITSTUN;
    p2.hitstunTimer = 20;

    forceActivePhase(p1, AttackType.THROW);
    cs.resolveAttacks(p1, p2, []);

    expect(p1.isThrowing).toBe(false);
    expect(p2.isBeingThrown).toBe(false);
  });

  it('对手在防御中不可被投', () => {
    const input = createInputProvider();
    const cs = new CombatSystem(input);
    const [p1, p2] = createClosePair(50);

    p2.state = FighterState.BLOCK;
    p2.blockstunTimer = 10;

    forceActivePhase(p1, AttackType.THROW);
    cs.resolveAttacks(p1, p2, []);

    expect(p1.isThrowing).toBe(false);
    expect(p2.isBeingThrown).toBe(false);
  });

  it('对手在倒地状态不可被投', () => {
    const input = createInputProvider();
    const cs = new CombatSystem(input);
    const [p1, p2] = createClosePair(50);

    p2.state = FighterState.KNOCKDOWN;
    p2.knockdownTimer = 25;
    p2.isKnockedDown = true;

    forceActivePhase(p1, AttackType.THROW);
    cs.resolveAttacks(p1, p2, []);

    expect(p1.isThrowing).toBe(false);
    expect(p2.isBeingThrown).toBe(false);
  });

  it('对手在 GUARD_CRUSH 状态不可被投', () => {
    const input = createInputProvider();
    const cs = new CombatSystem(input);
    const [p1, p2] = createClosePair(50);

    p2.state = FighterState.GUARD_CRUSH;
    p2.guardCrushTimer = 30;

    forceActivePhase(p1, AttackType.THROW);
    cs.resolveAttacks(p1, p2, []);

    expect(p1.isThrowing).toBe(false);
    expect(p2.isBeingThrown).toBe(false);
  });

  it('对手正在被投时不可再次被投', () => {
    const input = createInputProvider();
    const cs = new CombatSystem(input);
    const [p1, p2] = createClosePair(50);

    // p2 已经在被投状态
    p2.state = FighterState.THROW;
    p2.isBeingThrown = true;
    p2.throwEscapeTimer = 5;

    forceActivePhase(p1, AttackType.THROW);
    cs.resolveAttacks(p1, p2, []);

    // 新的投技不应覆盖现有投技
    // 注意: isThrowVulnerable 在 THROW 状态返回 false
    expect(p1.isThrowing).toBe(false);
  });
});

// ============================================================
// 3. 投技拆解
// ============================================================

describe('投技系统 -- 投技拆解 (throw escape)', () => {
  it('拆投窗口内按 throwAttack -> 成功拆投', () => {
    // P2 在被投后立即按投技按钮
    const input = createInputProvider({}, { throwAttack: true });
    const cs = new CombatSystem(input);
    const [p1, p2] = createClosePair(50);

    // 先触发投技命中
    forceActivePhase(p1, AttackType.THROW);
    cs.resolveAttacks(p1, p2, []);

    expect(p2.isBeingThrown).toBe(true);
    expect(p2.throwEscapeTimer).toBeGreaterThan(0);

    // tickThrowState 应该让 P2 在拆投窗口内拆投
    const escaped = cs.tickThrowState(p1, p2);

    expect(escaped).toBe(true);
    expect(p1.isThrowing).toBe(false);
    expect(p2.isBeingThrown).toBe(false);
    expect(p1.throwVictim).toBeNull();
    expect(p1.invincible).toBe(false);
  });

  it('拆投后双方获得投技无敌', () => {
    const input = createInputProvider({}, { throwAttack: true });
    const cs = new CombatSystem(input);
    const [p1, p2] = createClosePair(50);

    forceActivePhase(p1, AttackType.THROW);
    cs.resolveAttacks(p1, p2, []);
    cs.tickThrowState(p1, p2);

    // 双方都获得拆投后的投技无敌帧
    expect(p1.throwInvulnFrames).toBe(THROW_INVINCIBILITY_POST_ESCAPE);
    expect(p2.throwInvulnFrames).toBe(THROW_INVINCIBILITY_POST_ESCAPE);
  });

  it('拆投后双方恢复到 IDLE', () => {
    const input = createInputProvider({}, { throwAttack: true });
    const cs = new CombatSystem(input);
    const [p1, p2] = createClosePair(50);

    forceActivePhase(p1, AttackType.THROW);
    cs.resolveAttacks(p1, p2, []);
    cs.tickThrowState(p1, p2);

    expect(p1.state).toBe(FighterState.IDLE);
    expect(p2.state).toBe(FighterState.IDLE);
  });

  it('拆投后双方被推开', () => {
    const input = createInputProvider({}, { throwAttack: true });
    const cs = new CombatSystem(input);
    const [p1, p2] = createClosePair(50);

    const p1XBefore = p1.x;
    const p2XBefore = p2.x;

    forceActivePhase(p1, AttackType.THROW);
    cs.resolveAttacks(p1, p2, []);
    cs.tickThrowState(p1, p2);

    // 双方距离应该变大
    const distBefore = Math.abs(p2XBefore - p1XBefore);
    const distAfter = Math.abs(p2.x - p1.x);
    expect(distAfter).toBeGreaterThan(distBefore);
  });

  it('拆投窗口过期 -> 投技结算伤害', () => {
    // P2 不按任何按钮 -> 拆投窗口过期 -> 伤害结算
    const input = createInputProvider();
    const cs = new CombatSystem(input);
    const [p1, p2] = createClosePair(50);

    const healthBefore = p2.health;

    forceActivePhase(p1, AttackType.THROW);
    cs.resolveAttacks(p1, p2, []);

    expect(p2.isBeingThrown).toBe(true);

    // 不断 tick 直到拆投窗口过期
    const escapeWindow = p2.throwEscapeTimer;
    for (let i = 0; i <= escapeWindow; i++) {
      cs.tickThrowState(p1, p2);
    }

    // 投技结算: 伤害减少, 被投者倒地
    expect(p2.health).toBeLessThan(healthBefore);
    expect(p2.isKnockedDown).toBe(true);
    expect(p2.isBeingThrown).toBe(false);
    expect(p1.isThrowing).toBe(false);
  });

  it('CD 按钮也可以拆投 (KOF2002 机制)', () => {
    // P2 按 C+D (blowback) 来拆投
    const input = createInputProvider({}, { buttonC: true, buttonD: true });
    const cs = new CombatSystem(input);
    const [p1, p2] = createClosePair(50);

    forceActivePhase(p1, AttackType.THROW);
    cs.resolveAttacks(p1, p2, []);

    expect(p2.isBeingThrown).toBe(true);

    const escaped = cs.tickThrowState(p1, p2);
    expect(escaped).toBe(true);
    expect(p1.isThrowing).toBe(false);
    expect(p2.isBeingThrown).toBe(false);
  });
});

// ============================================================
// 4. 投技无敌
// ============================================================

describe('投技系统 -- 投技无敌', () => {
  it('throwInvulnFrames > 0 时不可被投', () => {
    const f = new Fighter(400, '#ff0000', 1 as Direction);
    f.throwInvulnFrames = 7;

    expect(f.isThrowVulnerable()).toBe(false);
  });

  it('throwInvulnFrames = 0 时可被投', () => {
    const f = new Fighter(400, '#ff0000', 1 as Direction);
    f.throwInvulnFrames = 0;

    expect(f.isThrowVulnerable()).toBe(true);
  });

  it('拆投后投技无敌帧数正确', () => {
    expect(THROW_INVINCIBILITY_POST_ESCAPE).toBe(6);
  });

  it('受击后投技无敌帧数正确', () => {
    expect(THROW_INVINCIBILITY_POST_STUN).toBe(7);
  });

  it('起身后投技无敌帧数正确', () => {
    expect(THROW_INVINCIBILITY_WAKEUP).toBe(9);
  });

  it('跳起落地面投技无敌帧数正确', () => {
    expect(THROW_INVINCIBILITY_LANDING).toBe(2);
  });

  it('跳起启动投技无敌帧数正确', () => {
    expect(THROW_INVINCIBILITY_JUMP_STARTUP).toBe(4);
  });

  it('投技无敌期间投技判定不通过', () => {
    const input = createInputProvider();
    const cs = new CombatSystem(input);
    const [p1, p2] = createClosePair(50);

    // 给 defender 投技无敌
    p2.throwInvulnFrames = 7;

    forceActivePhase(p1, AttackType.THROW);
    cs.resolveAttacks(p1, p2, []);

    expect(p1.isThrowing).toBe(false);
    expect(p2.isBeingThrown).toBe(false);
  });
});

// ============================================================
// 5. 命令投技 (不可拆投)
// ============================================================

describe('投技系统 -- 命令投技 (不可拆投)', () => {
  it('命令投技直接结算伤害, 不进入拆投窗口', () => {
    const input = createInputProvider();
    const cs = new CombatSystem(input);
    const [p1, p2] = createClosePair(50);

    // 设置命令投角色定义
    const charDef = createCommandThrowCharDef();
    // 需要设置 defenderControllers 来走命令投路径
    // 由于 defenderControllers 是 CombatSystem 的公开属性, 直接赋值
    const mockCtrl = { charDef } as any;
    cs.defenderControllers = [mockCtrl, mockCtrl];

    const healthBefore = p2.health;

    forceActivePhase(p1, AttackType.IORI_KUZUKAZE);
    cs.resolveAttacks(p1, p2, []);

    // 命令投直接结算: 伤害立即减少
    expect(p2.health).toBeLessThan(healthBefore);
    // 不进入拆投窗口
    expect(p2.isBeingThrown).toBe(false);
    expect(p2.throwEscapeTimer).toBe(0);
    // 对手直接倒地
    expect(p2.state).toBe(FighterState.KNOCKDOWN);
    expect(p2.isKnockedDown).toBe(true);
  });

  it('IORI_KUZUKAZE 命令投交换双方位置', () => {
    const input = createInputProvider();
    const cs = new CombatSystem(input);
    const [p1, p2] = createClosePair(50);

    const charDef = createCommandThrowCharDef();
    const mockCtrl = { charDef } as any;
    cs.defenderControllers = [mockCtrl, mockCtrl];

    const p1XBefore = p1.x;
    const p2XBefore = p2.x;

    forceActivePhase(p1, AttackType.IORI_KUZUKAZE);
    cs.resolveAttacks(p1, p2, []);

    // 屑风: 双方位置交换
    expect(p1.x).toBe(p2XBefore);
    expect(p2.x).toBe(p1XBefore);
  });

  it('CLARK_ARGENTINE 是命令投', () => {
    const charDef = createCommandThrowCharDef();
    expect(charDef.isCommandThrow?.(AttackType.CLARK_ARGENTINE)).toBe(true);
  });

  it('普通 THROW 不是命令投', () => {
    const charDef = createCommandThrowCharDef();
    expect(charDef.isCommandThrow?.(AttackType.THROW)).toBeFalsy();
    expect(charDef.isCommandThrow?.(AttackType.THROW_FORWARD)).toBeFalsy();
    expect(charDef.isCommandThrow?.(AttackType.THROW_BACK)).toBeFalsy();
  });
});

// ============================================================
// 6. 空中不可被地面投技
// ============================================================

describe('投技系统 -- 空中不可被地面投技', () => {
  it('空中的对手不可被地面投技', () => {
    const input = createInputProvider();
    const cs = new CombatSystem(input);
    const [p1, p2] = createClosePair(50);

    // 使 defender 空中
    p2.y = STAGE_GROUND_Y - 100; // 在空中

    forceActivePhase(p1, AttackType.THROW);
    cs.resolveAttacks(p1, p2, []);

    expect(p1.isThrowing).toBe(false);
    expect(p2.isBeingThrown).toBe(false);
  });

  it('isThrowVulnerable 在空中返回 false', () => {
    const f = new Fighter(400, '#ff0000', 1 as Direction);
    f.y = STAGE_GROUND_Y - 100; // 在空中

    expect(f.isGrounded()).toBe(false);
    expect(f.isThrowVulnerable()).toBe(false);
  });

  it('空中的对手不会被投技命中, 也不会受到伤害', () => {
    const input = createInputProvider();
    const cs = new CombatSystem(input);
    const [p1, p2] = createClosePair(50);

    p2.y = STAGE_GROUND_Y - 200;
    const healthBefore = p2.health;

    forceActivePhase(p1, AttackType.THROW);
    cs.resolveAttacks(p1, p2, []);

    expect(p2.health).toBe(healthBefore);
  });
});

// ============================================================
// 7. DIZZY状态可被投 (风云再起特色)
// ============================================================

describe('投技系统 -- DIZZY状态可被投', () => {
  it('DIZZY 状态的对手可被投', () => {
    const input = createInputProvider();
    const cs = new CombatSystem(input);
    const [p1, p2] = createClosePair(50);

    // 使 defender 进入 DIZZY 状态
    p2.applyDizzy();
    expect(p2.state).toBe(FighterState.DIZZY);

    forceActivePhase(p1, AttackType.THROW);
    cs.resolveAttacks(p1, p2, []);

    // DIZZY 状态可被投 (风云再起特色)
    expect(p1.isThrowing).toBe(true);
    expect(p2.isBeingThrown).toBe(true);
  });

  it('isThrowVulnerable 在 DIZZY 状态返回 true', () => {
    const f = new Fighter(400, '#ff0000', 1 as Direction);
    f.applyDizzy();
    expect(f.state).toBe(FighterState.DIZZY);
    expect(f.isThrowVulnerable()).toBe(true);
  });

  it('DIZZY 状态被投后结算伤害', () => {
    const input = createInputProvider();
    const cs = new CombatSystem(input);
    const [p1, p2] = createClosePair(50);

    p2.applyDizzy();
    const healthBefore = p2.health;

    forceActivePhase(p1, AttackType.THROW);
    cs.resolveAttacks(p1, p2, []);

    // tick until escape window expires
    const escapeWindow = p2.throwEscapeTimer;
    for (let i = 0; i <= escapeWindow; i++) {
      cs.tickThrowState(p1, p2);
    }

    expect(p2.health).toBeLessThan(healthBefore);
    expect(p2.isKnockedDown).toBe(true);
  });
});

// ============================================================
// 补充: 投技方向与位置约束
// ============================================================

describe('投技系统 -- 位置与边界', () => {
  it('投技不能把对手推出舞台右边界', () => {
    const input = createInputProvider();
    const cs = new CombatSystem(input);
    const p1 = new Fighter(1350, '#ff0000', 1 as Direction);
    const p2 = new Fighter(1390, '#0000ff', -1 as Direction);

    forceActivePhase(p1, AttackType.THROW);
    cs.resolveAttacks(p1, p2, []);

    // p2 的位置应该被限制在舞台范围内
    // STAGE_RIGHT = 1400 - 40 = 1360
    // 但 THROW_DISTANCE = 130, 所以 raw position = 1350 + 130 = 1480 -> clamped
    expect(p2.x).toBeLessThanOrEqual(1360);
  });

  it('投技不能把对手推出舞台左边界', () => {
    const input = createInputProvider();
    const cs = new CombatSystem(input);
    const p1 = new Fighter(50, '#ff0000', -1 as Direction);
    const p2 = new Fighter(90, '#0000ff', 1 as Direction);

    forceActivePhase(p1, AttackType.THROW);
    cs.resolveAttacks(p1, p2, []);

    // p2 的位置应该被限制在舞台范围内
    expect(p2.x).toBeGreaterThanOrEqual(40);
  });
});

// ============================================================
// 补充: Fighter.reset 清理投技状态
// ============================================================

describe('投技系统 -- reset 清理', () => {
  it('Fighter.reset 清理所有投技状态', () => {
    const f = new Fighter(400, '#ff0000', 1 as Direction);

    // 设置各种投技相关状态
    f.isBeingThrown = true;
    f.throwEscapeTimer = 5;
    f.isThrowing = true;
    f.throwVictim = new Fighter(500, '#0000ff', -1 as Direction);
    f.throwInvincibilityTimer = 10;
    f.throwInvulnFrames = 7;
    f.throwBufferTimer = 3;

    f.reset(400);

    expect(f.isBeingThrown).toBe(false);
    expect(f.throwEscapeTimer).toBe(0);
    expect(f.isThrowing).toBe(false);
    expect(f.throwVictim).toBeNull();
    expect(f.throwInvincibilityTimer).toBe(0);
    expect(f.throwInvulnFrames).toBe(0);
    expect(f.throwBufferTimer).toBe(0);
  });
});

// ============================================================
// 补充: Guard Cancel Roll 不可被投
// ============================================================

describe('投技系统 -- Guard Cancel Roll 不可被投', () => {
  it('GC Roll 期间不可被投', () => {
    const input = createInputProvider();
    const cs = new CombatSystem(input);
    const [p1, p2] = createClosePair(50);

    // 使 defender 进入 GC Roll
    p2.state = FighterState.ROLL;
    p2.rollTimer = 20;
    p2.isGCRoll = true;

    forceActivePhase(p1, AttackType.THROW);
    cs.resolveAttacks(p1, p2, []);

    expect(p1.isThrowing).toBe(false);
    expect(p2.isBeingThrown).toBe(false);
  });

  it('isThrowVulnerable 在 GC Roll 返回 false', () => {
    const f = new Fighter(400, '#ff0000', 1 as Direction);
    f.state = FighterState.ROLL;
    f.rollTimer = 20;
    f.isGCRoll = true;

    expect(f.isThrowVulnerable()).toBe(false);
  });

  it('普通 Roll 可以被投 (KOF2002)', () => {
    const input = createInputProvider();
    const cs = new CombatSystem(input);
    const [p1, p2] = createClosePair(50);

    // 使 defender 进入普通 Roll (非GC)
    p2.state = FighterState.ROLL;
    p2.rollTimer = 20;
    p2.isGCRoll = false;

    forceActivePhase(p1, AttackType.THROW);
    cs.resolveAttacks(p1, p2, []);

    // 普通 Roll 可以被投
    expect(p1.isThrowing).toBe(true);
    expect(p2.isBeingThrown).toBe(true);
  });

  it('isThrowVulnerable 在普通 Roll 返回 true', () => {
    const f = new Fighter(400, '#ff0000', 1 as Direction);
    f.state = FighterState.ROLL;
    f.rollTimer = 20;
    f.isGCRoll = false;

    expect(f.isThrowVulnerable()).toBe(true);
  });
});

// ============================================================
// 补充: Air throw vulnerability
// ============================================================

describe('投技系统 -- 空中投技判定', () => {
  it('地面对手不可被空中投', () => {
    const f = new Fighter(400, '#ff0000', 1 as Direction);
    // 地面上
    expect(f.isGrounded()).toBe(true);
    expect(f.isAirThrowVulnerable()).toBe(false);
  });

  it('空中对手默认不可被空中投 (需 airThrowVulnerable)', () => {
    const f = new Fighter(400, '#ff0000', 1 as Direction);
    f.y = STAGE_GROUND_Y - 100; // 空中
    f.airThrowVulnerable = false;

    expect(f.isAirThrowVulnerable()).toBe(false);
  });

  it('空中对手在 airThrowVulnerable=true 时可被空中投', () => {
    const f = new Fighter(400, '#ff0000', 1 as Direction);
    f.y = STAGE_GROUND_Y - 100;
    f.airThrowVulnerable = true;

    expect(f.isAirThrowVulnerable()).toBe(true);
  });

  it('空中防御中不可被空中投', () => {
    const f = new Fighter(400, '#ff0000', 1 as Direction);
    f.y = STAGE_GROUND_Y - 100;
    f.state = FighterState.AIR_BLOCK;
    f.airThrowVulnerable = true;

    expect(f.isAirThrowVulnerable()).toBe(false);
  });

  it('投技无敌帧对空中投也生效', () => {
    const f = new Fighter(400, '#ff0000', 1 as Direction);
    f.y = STAGE_GROUND_Y - 100;
    f.airThrowVulnerable = true;
    f.throwInvulnFrames = 5;

    expect(f.isAirThrowVulnerable()).toBe(false);
  });
});
