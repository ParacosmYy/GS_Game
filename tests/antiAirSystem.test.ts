/**
 * antiAirSystem.test.ts -- 对空/反空系统集成测试
 *
 * 验证多系统协同场景:
 *  1. 对空基础 (空中hitstun减少、juggle points、knockback方向)
 *  2. 对空特定招式 (各角色升龙技对空)
 *  3. 空对地 (跳跃攻击命中/被防/CD knockdown)
 *  4. Juggle系统 (juggle points消耗、耗尽、gravity decay)
 *  5. 反空策略 (提前/晚对空、空对空、地面抢招被对空)
 *
 * 依赖: CombatSystem + Fighter + 真实 frame data + attack classifier.
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
  JUGGLE_POINTS_MAX,
  JUGGLE_COST_LIGHT,
  JUGGLE_COST_HEAVY,
  JUGGLE_COST_SPECIAL,
  JUGGLE_COST_CD,
  STAGE_GROUND_Y,
  COUNTER_WIRE_BOUNCE_VX,
  COUNTER_WIRE_BOUNCE_VY,
  WALL_BOUNCE_MAX_PER_COMBO,
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

/** 将 defender 设为空中可被juggle状态
 *  y=480: 仍在空中 (isGrounded=false, STAGE_GROUND_Y=510),
 *  但足够低让地面攻击的hitbox能命中 (hurtbox 280..480 vs hitbox ~430..475)
 */
function setAirborneForJuggle(f: Fighter, y = 480): void {
  f.y = y;
  f.vy = -5;
  f.state = FighterState.HITSTUN;
  f.juggleState = JuggleState.FULL;
  f.jugglePoints = JUGGLE_POINTS_MAX;
  f.airHitCount = 0;
}

/** 创建标准对战配置: p1(300, facing right), p2(350, facing left), 近距离 */
function createStandardMatch(): { p1: Fighter; p2: Fighter } {
  return {
    p1: new Fighter(300, '#ff0000', 1),
    p2: new Fighter(350, '#0000ff', -1),
  };
}

// ==========================================================================
// 1. 对空基础
// ==========================================================================

describe('对空基础', () => {
  it('空中对手被命中 -> 空中hitstun减少 (x0.65)', () => {
    // 普通命中 (地面)
    const csGround = new CombatSystem(createInputProvider());
    const p1g = new Fighter(300, '#ff0000', 1);
    const p2g = new Fighter(350, '#0000ff', -1);
    forceActivePhase(p1g, AttackType.STAND_C);
    csGround.resolveAttacks(p1g, p2g, []);
    const groundHitstun = p2g.hitstunTimer;

    // 空中命中
    const csAir = new CombatSystem(createInputProvider());
    const p1a = new Fighter(300, '#ff0000', 1);
    const p2a = new Fighter(350, '#0000ff', -1);
    setAirborneForJuggle(p2a);
    forceActivePhase(p1a, AttackType.STAND_C);
    csAir.resolveAttacks(p1a, p2a, []);

    const airHitstun = p2a.hitstunTimer;
    const baseHitstun = FRAME_DATA[AttackType.STAND_C].hitstun;
    const expectedAirHitstun = Math.round(baseHitstun * 0.65);
    expect(airHitstun).toBe(expectedAirHitstun);
    expect(airHitstun).toBeLessThan(groundHitstun);
  });

  it('对空通常技命中 -> juggle points 被消耗', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();
    setAirborneForJuggle(p2);

    const jpBefore = p2.jugglePoints;
    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);

    // STAND_C is heavy -> JUGGLE_COST_HEAVY=2, but progressive: ceil(2 * (1 + 0*0.2)) = 2
    expect(p2.jugglePoints).toBeLessThan(jpBefore);
    expect(p2.airHitCount).toBe(1);
  });

  it('对空特殊技命中 -> 更高 juggle points 消耗', () => {
    // 轻攻击 (STAND_A): cost = JUGGLE_COST_LIGHT = 1
    const csLight = new CombatSystem(createInputProvider());
    const p1l = new Fighter(300, '#ff0000', 1);
    const p2l = new Fighter(350, '#0000ff', -1);
    setAirborneForJuggle(p2l);
    forceActivePhase(p1l, AttackType.STAND_A);
    csLight.resolveAttacks(p1l, p2l, []);
    const lightConsumed = JUGGLE_POINTS_MAX - p2l.jugglePoints;

    // 重攻击 (STAND_C): cost = JUGGLE_COST_HEAVY = 2
    const csHeavy = new CombatSystem(createInputProvider());
    const p1h = new Fighter(300, '#ff0000', 1);
    const p2h = new Fighter(350, '#0000ff', -1);
    setAirborneForJuggle(p2h);
    forceActivePhase(p1h, AttackType.STAND_C);
    csHeavy.resolveAttacks(p1h, p2h, []);
    const heavyConsumed = JUGGLE_POINTS_MAX - p2h.jugglePoints;

    // 重攻击消耗 > 轻攻击消耗
    expect(lightConsumed).toBe(JUGGLE_COST_LIGHT); // 1
    expect(heavyConsumed).toBe(JUGGLE_COST_HEAVY); // 2
    expect(heavyConsumed).toBeGreaterThan(lightConsumed);
  });

  it('空中命中 -> knockback方向受facing影响', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();
    setAirborneForJuggle(p2);

    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);

    // p1 facing=1 (right), pushback pushes p2 in -facing direction
    // After hit, p2.vx should have a pushback component
    const fd = FRAME_DATA[AttackType.STAND_C];
    // comboHits=1 -> scale=1.0
    const expectedPushback = fd.pushback * 1.0;
    // p2 facing=-1, pushback direction = -facing = +1 (right)
    // But defender gets pushed away from attacker
    expect(Math.abs(p2.vx)).toBeGreaterThan(0);
  });

  it('空中命中不触发 ground knockdown', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();
    setAirborneForJuggle(p2); // y=480, 空中

    // STAND_C is not a knockdown move, but even if it were:
    // Knockdown applies but defender stays airborne
    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);

    // 空中对手不会进入地面KNOCKDOWN状态
    expect(p2.state).not.toBe(FighterState.KNOCKDOWN);
    // y should still be airborne
    expect(p2.y).toBeLessThan(STAGE_GROUND_Y);
  });

  it('空中防御 -> 正常blockstun', () => {
    // p2 在空中 + 空中防御
    const cs = new CombatSystem(createBlockingInputProvider());
    const { p1, p2 } = createStandardMatch();
    // Set p2 airborne with JUMP state (enables air block)
    p2.y = 480;
    p2.vy = -5;
    p2.state = FighterState.JUMP;
    p2.juggleState = JuggleState.FULL;
    p2.jugglePoints = JUGGLE_POINTS_MAX;

    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);

    // STAND_C is MID hitLevel, air block can block MID
    expect(p2.state).toBe(FighterState.AIR_BLOCK);
    expect(p2.blockstunTimer).toBeGreaterThan(0);
  });

  it('多段对空 -> 每段独立判定 (KYO_ONIYAKI_C 多段)', () => {
    // KYO_ONIYAKI_C has active=14 frames (multi-hit)
    // Simulate two separate hits
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();
    setAirborneForJuggle(p2);

    // 第1段
    forceActivePhase(p1, AttackType.KYO_ONIYAKI_C, 0);
    cs.resolveAttacks(p1, p2, []);
    expect(p2.airHitCount).toBe(1);

    // 第2段: 需要重置attacker但保持defender空中
    resetAttacker(p1);
    p2.state = FighterState.HITSTUN; // 保持空中hitstun
    p2.hitstunTimer = 10;
    forceActivePhase(p1, AttackType.KYO_ONIYAKI_C, 5);
    cs.resolveAttacks(p1, p2, []);
    expect(p2.airHitCount).toBe(2);
  });

  it('对空Counter Hit -> FULL juggle state', () => {
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);

    // p2 在空中 + 攻击中 (CH条件)
    p2.y = 480;
    p2.vy = -5;
    p2.state = FighterState.AIR_ATTACK; // 空中攻击中 -> CH
    p2.juggleState = JuggleState.FULL;
    p2.jugglePoints = JUGGLE_POINTS_MAX;
    p2.airHitCount = 0;

    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);

    // Counter Hit 空中: juggleState = FULL, jugglePoints = JUGGLE_POINTS_MAX
    expect(p2.juggleState).toBe(JuggleState.FULL);
    expect(p2.jugglePoints).toBe(JUGGLE_POINTS_MAX);
  });
});

// ==========================================================================
// 2. 对空特定招式
// ==========================================================================

describe('对空特定招式', () => {
  it('Kyo ONIYAKI 对空命中', () => {
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);
    setAirborneForJuggle(p2);

    const healthBefore = p2.health;
    forceActivePhase(p1, AttackType.KYO_ONIYAKI);
    cs.resolveAttacks(p1, p2, []);

    const damage = healthBefore - p2.health;
    // KYO_ONIYAKI damage=58
    expect(damage).toBe(FRAME_DATA[AttackType.KYO_ONIYAKI].damage);
    expect(p2.airHitCount).toBe(1);
  });

  it('Iori ONIYAKI 对空命中', () => {
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);
    setAirborneForJuggle(p2);

    const healthBefore = p2.health;
    forceActivePhase(p1, AttackType.IORI_ONIYAKI);
    cs.resolveAttacks(p1, p2, []);

    const damage = healthBefore - p2.health;
    // IORI_ONIYAKI damage=60
    expect(damage).toBe(FRAME_DATA[AttackType.IORI_ONIYAKI].damage);
    // IORI_ONIYAKI is knockdown -> resets juggle points to JUGGLE_POINTS_MAX
    expect(p2.juggleState).toBe(JuggleState.FULL);
  });

  it('Kim HIENZAN 对空命中', () => {
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);
    setAirborneForJuggle(p2);

    const healthBefore = p2.health;
    forceActivePhase(p1, AttackType.KIM_HIENZAN);
    cs.resolveAttacks(p1, p2, []);

    const damage = healthBefore - p2.health;
    // KIM_HIENZAN damage=100
    expect(damage).toBe(FRAME_DATA[AttackType.KIM_HIENZAN].damage);
    expect(p2.airHitCount).toBe(1);
  });

  it('Ryo KO_HOU 对空命中', () => {
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);
    setAirborneForJuggle(p2);

    const healthBefore = p2.health;
    forceActivePhase(p1, AttackType.RYO_KO_HOU);
    cs.resolveAttacks(p1, p2, []);

    const damage = healthBefore - p2.health;
    // RYO_KO_HOU damage=80
    expect(damage).toBe(FRAME_DATA[AttackType.RYO_KO_HOU].damage);
    expect(p2.airHitCount).toBe(1);
  });

  it('Terry RISING_TACKLE 对空命中', () => {
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);
    setAirborneForJuggle(p2);

    const healthBefore = p2.health;
    forceActivePhase(p1, AttackType.TERRY_RISING_TACKLE);
    cs.resolveAttacks(p1, p2, []);

    const damage = healthBefore - p2.health;
    // TERRY_RISING_TACKLE damage=90
    expect(damage).toBe(FRAME_DATA[AttackType.TERRY_RISING_TACKLE].damage);
    expect(p2.airHitCount).toBe(1);
  });

  it('Kula SHELL_C (Counter Shell) 对空命中', () => {
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);
    setAirborneForJuggle(p2);

    const healthBefore = p2.health;
    forceActivePhase(p1, AttackType.KULA_SHELL_C);
    cs.resolveAttacks(p1, p2, []);

    const damage = healthBefore - p2.health;
    // KULA_SHELL_C damage=85, hitbox: oy=-160, h=80 -> y=350..430
    // p2 y=480: hurtbox 280..480 -> overlap
    expect(damage).toBe(FRAME_DATA[AttackType.KULA_SHELL_C].damage);
    expect(p2.airHitCount).toBe(1);
  });

  it('Robert RYU_ZAN 对空命中', () => {
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);
    setAirborneForJuggle(p2);

    const healthBefore = p2.health;
    forceActivePhase(p1, AttackType.ROBERT_RYU_ZAN);
    cs.resolveAttacks(p1, p2, []);

    const damage = healthBefore - p2.health;
    // ROBERT_RYU_ZAN damage=80
    expect(damage).toBe(FRAME_DATA[AttackType.ROBERT_RYU_ZAN].damage);
    expect(p2.airHitCount).toBe(1);
  });

  it('各角色对空 damage 不同', () => {
    const antiAirMoves: AttackType[] = [
      AttackType.KYO_ONIYAKI,
      AttackType.IORI_ONIYAKI,
      AttackType.KIM_HIENZAN,
      AttackType.RYO_KO_HOU,
      AttackType.TERRY_RISING_TACKLE,
      AttackType.ROBERT_RYU_ZAN,
    ];

    const damages = antiAirMoves.map(move => FRAME_DATA[move].damage);
    // 并非所有damage都一样 (至少有两个不同值)
    const uniqueDamages = new Set(damages);
    expect(uniqueDamages.size).toBeGreaterThan(1);

    // 验证具体值: KIM_HIENZAN=100 > KYO_ONIYAKI=58
    expect(FRAME_DATA[AttackType.KIM_HIENZAN].damage).toBeGreaterThan(
      FRAME_DATA[AttackType.KYO_ONIYAKI].damage,
    );
  });
});

// ==========================================================================
// 3. 空对地
// ==========================================================================

describe('空对地', () => {
  it('跳跃攻击命中地面对手 -> 正常命中', () => {
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);

    // p1 空中攻击 (JUMP_C)
    // JUMP_C frames: oy=-70, h=35 -> hitbox y = 490-70=420..455
    // p2 grounded: hurtbox y = 510-200=310..510
    // Overlap: 420 < 510 && 455 > 310 -> YES
    p1.y = 490; // 空中但接近地面
    p1.vy = 3;
    p1.state = FighterState.AIR_ATTACK;
    forceActivePhase(p1, AttackType.JUMP_C);
    p1.attackPhase = 'active';

    // p2 地面 IDLE
    expect(p2.isGrounded()).toBe(true);

    cs.resolveAttacks(p1, p2, []);

    const damage = MAX_HEALTH - p2.health;
    expect(damage).toBe(FRAME_DATA[AttackType.JUMP_C].damage);
    expect(p2.state).toBe(FighterState.HITSTUN);
  });

  it('跳跃攻击被防 -> blockstun', () => {
    const cs = new CombatSystem(createBlockingInputProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);

    // p1 空中攻击
    p1.y = 490;
    p1.vy = 3;
    p1.state = FighterState.AIR_ATTACK;
    forceActivePhase(p1, AttackType.JUMP_C);
    p1.attackPhase = 'active';

    cs.resolveAttacks(p1, p2, []);

    // JUMP_C hitLevel=HIGH, 地面站防可以挡 HIGH (proximity guard or stand block)
    expect(p2.state).toBe(FighterState.BLOCK);
    expect(p2.blockstunTimer).toBeGreaterThan(0);
  });

  it('跳跃CD命中 -> knockdown + wall bounce', () => {
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);

    // p1 空中CD攻击
    p1.y = 490;
    p1.vy = 3;
    p1.state = FighterState.AIR_ATTACK;
    forceActivePhase(p1, AttackType.JUMP_CD);
    p1.attackPhase = 'active';

    cs.resolveAttacks(p1, p2, []);

    // JUMP_CD: knockdown + counterWire (CD attacks always cause wall bounce on hit)
    expect(p2.isCounterWire).toBe(true);
    expect(p2.wallBounceCount).toBe(1);
  });

  it('空中命中地面 -> normal hitstun (不减少)', () => {
    // 空中攻击者命中地面对手 -> 对手是地面, hitstun不减少
    const csAirAttack = new CombatSystem(createInputProvider());
    const p1a = new Fighter(300, '#ff0000', 1);
    const p2a = new Fighter(350, '#0000ff', -1);

    p1a.y = 490;
    p1a.vy = 3;
    p1a.state = FighterState.AIR_ATTACK;
    forceActivePhase(p1a, AttackType.JUMP_C);
    p1a.attackPhase = 'active';

    csAirAttack.resolveAttacks(p1a, p2a, []);
    const airAttackHitstun = p2a.hitstunTimer;

    // Ground defender hitstun is NOT reduced (only air defenders get 0.65x)
    const baseHitstun = FRAME_DATA[AttackType.JUMP_C].hitstun;
    expect(airAttackHitstun).toBe(baseHitstun);
  });

  it('空中Counter地面 -> 额外hitstun', () => {
    // 空中攻击者 Counter Hit 地面攻击中的对手
    const csNormal = new CombatSystem(createInputProvider());
    const p1n = new Fighter(300, '#ff0000', 1);
    const p2n = new Fighter(350, '#0000ff', -1);
    p1n.y = 490;
    p1n.vy = 3;
    p1n.state = FighterState.AIR_ATTACK;
    forceActivePhase(p1n, AttackType.JUMP_C);
    p1n.attackPhase = 'active';
    csNormal.resolveAttacks(p1n, p2n, []);
    const normalHitstun = p2n.hitstunTimer;

    // Counter Hit: p2 在攻击中
    const csCounter = new CombatSystem(createInputProvider());
    const p1c = new Fighter(300, '#ff0000', 1);
    const p2c = new Fighter(350, '#0000ff', -1);
    forceActivePhase(p2c, AttackType.STAND_A); // p2 攻击中 -> CH
    p1c.y = 490;
    p1c.vy = 3;
    p1c.state = FighterState.AIR_ATTACK;
    forceActivePhase(p1c, AttackType.JUMP_C);
    p1c.attackPhase = 'active';
    csCounter.resolveAttacks(p1c, p2c, []);

    const counterHitstun = p2c.hitstunTimer;
    // JUMP_C is NOT a light normal (not in LIGHT_NORMALS), so it gets CH bonus
    expect(counterHitstun).toBeGreaterThan(normalHitstun);
  });

  it('空中攻击对空中对手 -> 双方空中判定', () => {
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);

    // 双方空中, 位置接近让hitbox和hurtbox重叠
    // p1 y=490: JUMP_C hitbox y = 490-70=420..455
    // p2 y=480: hurtbox y = 480-200=280..480
    // Overlap: 420 < 480 && 455 > 280 -> YES
    p1.y = 490;
    p1.vy = -5;
    p1.state = FighterState.AIR_ATTACK;
    p2.y = 480;
    p2.vy = 2;
    p2.juggleState = JuggleState.FULL;
    p2.jugglePoints = JUGGLE_POINTS_MAX;
    p2.airHitCount = 0;

    forceActivePhase(p1, AttackType.JUMP_C);
    p1.attackPhase = 'active';

    // p2 也空中
    expect(p1.isGrounded()).toBe(false);
    expect(p2.isGrounded()).toBe(false);

    cs.resolveAttacks(p1, p2, []);

    // 空中命中: hitstun应该减少 (0.65x)
    const baseHitstun = FRAME_DATA[AttackType.JUMP_C].hitstun;
    const expectedAirHitstun = Math.round(baseHitstun * 0.65);
    expect(p2.hitstunTimer).toBe(expectedAirHitstun);
    expect(p2.airHitCount).toBe(1);
  });
});

// ==========================================================================
// 4. Juggle系统
// ==========================================================================

describe('Juggle系统', () => {
  it('Juggle points 系统初始值', () => {
    const f = new Fighter(400, '#ff0000', 1);
    // 初始状态: 地面, juggle state NONE
    expect(f.juggleState).toBe(JuggleState.NONE);
    expect(f.jugglePoints).toBe(0);
    expect(f.airHitCount).toBe(0);
  });

  it('每次空中命中消耗 juggle points', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();
    setAirborneForJuggle(p2);

    const jpBefore = p2.jugglePoints;
    forceActivePhase(p1, AttackType.STAND_A);
    cs.resolveAttacks(p1, p2, []);

    // STAND_A: light -> JUGGLE_COST_LIGHT=1, progressive: ceil(1 * (1+0*0.2))=1
    expect(p2.jugglePoints).toBe(jpBefore - 1);
  });

  it('juggle points 耗尽 -> 无法继续 juggle (无伤害)', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();
    setAirborneForJuggle(p2);

    // 设置juggle points为0
    p2.jugglePoints = 0;

    const healthBefore = p2.health;
    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);

    // juggle points不足 -> juggle check early return, 无伤害
    // 注意: attacker.hasHit 在 juggle check 之前被设为 true (框重叠),
    // 但 juggle check 在 damage 之前 return, 所以 defender 不受伤害
    expect(p2.health).toBe(healthBefore);
  });

  it('轻攻击消耗少 juggle points', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();
    setAirborneForJuggle(p2);

    forceActivePhase(p1, AttackType.STAND_A);
    cs.resolveAttacks(p1, p2, []);

    // STAND_A: light -> cost 1 (baseCost=1, airHitCount=0: ceil(1*(1+0))=1)
    const consumed = JUGGLE_POINTS_MAX - p2.jugglePoints;
    expect(consumed).toBe(1);
  });

  it('重攻击消耗多 juggle points', () => {
    const cs = new CombatSystem(createInputProvider());
    const { p1, p2 } = createStandardMatch();
    setAirborneForJuggle(p2);

    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);

    // STAND_C: heavy -> cost 2 (baseCost=2, airHitCount=0: ceil(2*(1+0))=2)
    const consumed = JUGGLE_POINTS_MAX - p2.jugglePoints;
    expect(consumed).toBe(2);
  });

  it('空中投技消耗 juggle points', () => {
    // 投技在juggle check中: 走 throwbox 通道而非 hitbox 通道
    // 这里验证空中对手被命中后变成 airThrowVulnerable
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);
    setAirborneForJuggle(p2);

    // 先用普通攻击命中一次让 p2 进入 airThrowVulnerable
    forceActivePhase(p1, AttackType.STAND_A);
    cs.resolveAttacks(p1, p2, []);

    // airThrowVulnerable 在 juggle 通道中被设置
    expect(p2.airThrowVulnerable).toBe(true);
  });

  it('Counter Hit -> 恢复 juggle points', () => {
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);

    // p2 空中 + 攻击中 (CH条件)
    p2.y = 480;
    p2.vy = -5;
    p2.state = FighterState.AIR_ATTACK;
    p2.juggleState = JuggleState.FULL;
    p2.jugglePoints = 2; // 低juggle points
    p2.airHitCount = 0;

    const jpBefore = p2.jugglePoints;
    forceActivePhase(p1, AttackType.STAND_C);
    cs.resolveAttacks(p1, p2, []);

    // Counter Hit 空中: jugglePoints = min(JUGGLE_POINTS_MAX, jpBefore + 15)
    expect(p2.jugglePoints).toBe(JUGGLE_POINTS_MAX);
    expect(p2.jugglePoints).toBeGreaterThan(jpBefore);
  });

  it('wall bounce -> 恢复 juggle points', () => {
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);

    // p2 空中 + juggle state, with enough juggle points for STAND_CD
    setAirborneForJuggle(p2);
    p2.jugglePoints = JUGGLE_POINTS_MAX; // enough for CD cost

    // STAND_CD causes wall bounce on hit
    forceActivePhase(p1, AttackType.STAND_CD);
    cs.resolveAttacks(p1, p2, []);

    // Wall bounce gives full juggle: jugglePoints = JUGGLE_POINTS_MAX
    expect(p2.isCounterWire).toBe(true);
    expect(p2.juggleState).toBe(JuggleState.FULL);
    expect(p2.jugglePoints).toBe(JUGGLE_POINTS_MAX);
  });
});

// ==========================================================================
// 5. 反空策略
// ==========================================================================

describe('反空策略', () => {
  it('提前对空 (对手起跳时命中)', () => {
    // 对手刚开始起跳, y几乎在地面但已不是grounded
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);

    // p2 刚起跳: y略小于ground, 使用hitbox高的招式 (SPECIAL_UPPER)
    // SPECIAL_UPPER hitbox: oy=-80, h=45 -> y=430..475
    // p2 y=505: hurtbox 305..505 -> overlap with 430..475
    p2.y = STAGE_GROUND_Y - 5;
    p2.vy = -14;
    p2.state = FighterState.JUMP;
    p2.juggleState = JuggleState.FULL;
    p2.jugglePoints = JUGGLE_POINTS_MAX;
    p2.airHitCount = 0;

    expect(p2.isGrounded()).toBe(false);

    const healthBefore = p2.health;
    forceActivePhase(p1, AttackType.SPECIAL_UPPER);
    cs.resolveAttacks(p1, p2, []);

    // 对空成功
    const damage = healthBefore - p2.health;
    expect(damage).toBe(FRAME_DATA[AttackType.SPECIAL_UPPER].damage);
    expect(p2.airHitCount).toBe(1);
  });

  it('晚对空 (对手下落时命中)', () => {
    // 对手下落中, vy > 0 (falling), 位置较低
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);

    // p2 下落中, y接近地面但仍在空中
    // SPECIAL_UPPER hitbox: oy=-80, h=45 -> y=430..475
    // p2 y=480: hurtbox 280..480 -> overlap
    p2.y = 480;
    p2.vy = 10; // 下落
    p2.state = FighterState.JUMP;
    p2.juggleState = JuggleState.FULL;
    p2.jugglePoints = JUGGLE_POINTS_MAX;
    p2.airHitCount = 0;

    const healthBefore = p2.health;
    forceActivePhase(p1, AttackType.SPECIAL_UPPER);
    cs.resolveAttacks(p1, p2, []);

    const damage = healthBefore - p2.health;
    expect(damage).toBe(FRAME_DATA[AttackType.SPECIAL_UPPER].damage);
    expect(p2.airHitCount).toBe(1);
  });

  it('对空失败 (对手已过判定框 - juggle state NONE)', () => {
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);

    // p2 空中但 juggleState=NONE (不可追打)
    p2.y = 480;
    p2.vy = 5;
    p2.state = FighterState.HITSTUN;
    p2.juggleState = JuggleState.NONE; // 不可追打
    p2.jugglePoints = JUGGLE_POINTS_MAX;

    const healthBefore = p2.health;
    forceActivePhase(p1, AttackType.SPECIAL_UPPER);
    cs.resolveAttacks(p1, p2, []);

    // juggle state NONE -> 无法命中空中对手
    expect(p2.health).toBe(healthBefore);
  });

  it('空对空 (双方同时跳跃攻击)', () => {
    const cs = new CombatSystem(createInputProvider());
    const p1 = new Fighter(300, '#ff0000', 1);
    const p2 = new Fighter(350, '#0000ff', -1);

    // 双方空中, 位置让hitbox和hurtbox重叠
    // p1 y=490: JUMP_C hitbox oy=-70, h=35 -> y=420..455
    // p2 y=480: hurtbox 280..480 -> overlap: 420<480 && 455>280 -> YES
    p1.y = 490;
    p1.vy = -5;
    p1.state = FighterState.AIR_ATTACK;
    p2.y = 480;
    p2.vy = -3;
    p2.state = FighterState.AIR_ATTACK;
    p2.juggleState = JuggleState.FULL;
    p2.jugglePoints = JUGGLE_POINTS_MAX;
    p2.airHitCount = 0;

    // p1的攻击先判定
    forceActivePhase(p1, AttackType.JUMP_C);
    p1.attackPhase = 'active';

    cs.resolveAttacks(p1, p2, []);

    // p1 命中 p2 (p2 是 CH 因为 p2 也在攻击)
    expect(p1.hasHit).toBe(true);
    expect(p2.health).toBeLessThan(MAX_HEALTH);
    // CH + 空中: juggleState FULL, jugglePoints = JUGGLE_POINTS_MAX
    expect(p2.juggleState).toBe(JuggleState.FULL);
  });

  it('地面抢招被对空', () => {
    // p2 在地面出招, p1 用重攻击反打 (CH场景)
    const csNormal = new CombatSystem(createInputProvider());
    const p1n = new Fighter(300, '#ff0000', 1);
    const p2n = new Fighter(350, '#0000ff', -1);
    forceActivePhase(p1n, AttackType.STAND_C);
    csNormal.resolveAttacks(p1n, p2n, []);
    const normalHitstun = p2n.hitstunTimer;

    // Counter Hit: p2 也在攻击
    const csCounter = new CombatSystem(createInputProvider());
    const p1c = new Fighter(300, '#ff0000', 1);
    const p2c = new Fighter(350, '#0000ff', -1);
    // p2 先攻击 -> STAND_ATTACK state
    forceActivePhase(p2c, AttackType.STAND_A);
    // p1 用 STAND_C (not knockdown)
    forceActivePhase(p1c, AttackType.STAND_C);

    csCounter.resolveAttacks(p1c, p2c, []);

    // p2 在攻击状态被命中 = Counter Hit
    // STAND_C is heavy normal -> CH bonus +3F (ground CH for heavy)
    expect(p2c.hitstunTimer).toBe(normalHitstun + 3);
  });
});
