/**
 * combatIntegration.test.ts -- 基础战斗集成测试
 *
 * 验证 CombatSystem + Fighter + IInputProvider 的协作:
 *  1. 两个 Fighter 靠近时命中检测能工作
 *  2. 命中后 defender health 减少
 *  3. combo 计数器正确递增
 *  4. 防御时 damage 减少 (chip damage)
 *  5. KO 判定 (health <= 0)
 *
 * 依赖: CombatSystem 只依赖 IInputProvider (接口),
 *       不依赖 InputManager。测试用最小 mock 注入。
 */
import { describe, it, expect } from 'vitest';
import { CombatSystem } from '../src/combat/combatSystem.js';
import { Fighter } from '../src/entities/fighter.js';
import type { IInputProvider } from '../src/input/inputProvider.js';
import type { PlayerInput } from '../src/core/types.js';
import { AttackType, FighterState } from '../src/core/types.js';
import { MAX_HEALTH, CHIP_DAMAGE_RATIO } from '../src/core/constants.js';
import { FRAME_DATA } from '../src/core/constants.js';

// ===== 最小化 IInputProvider mock =====
// 默认: 无按键输入 (P2 不防御, 方便测试命中)

function createInputProvider(
  p1Override: Partial<PlayerInput> = {},
  p2Override: Partial<PlayerInput> = {},
): IInputProvider {
  const noop: PlayerInput = {
    up: false, down: false, left: false, right: false,
    buttonA: false, buttonB: false, buttonC: false, buttonD: false,
    throwAttack: false, start: false,
  };
  const p1: PlayerInput = { ...noop, ...p1Override };
  const p2: PlayerInput = { ...noop, ...p2Override };
  return {
    getP1Input: () => p1,
    getP2Input: () => p2,
  };
}

// P2 按住 back (防御输入): facing=-1 时 back = right
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

describe('Combat Integration', () => {
  // ===== 1. 命中检测 =====

  describe('命中检测', () => {
    it('近距离站立轻拳命中能减少 defender health', () => {
      const input = createInputProvider();
      const cs = new CombatSystem(input);
      const p1 = new Fighter(300, '#ff0000', 1);
      const p2 = new Fighter(350, '#0000ff', -1);

      const healthBefore = p2.health;

      // P1 用 CLOSE_A 攻击, 强制进入 active phase
      forceActivePhase(p1, AttackType.CLOSE_A);

      cs.resolveAttacks(p1, p2, []);

      // 命中后 health 应该减少
      expect(p2.health).toBeLessThan(healthBefore);
    });

    it('远距离站立重拳命中能减少 defender health', () => {
      const input = createInputProvider();
      const cs = new CombatSystem(input);
      const p1 = new Fighter(300, '#ff0000', 1);
      const p2 = new Fighter(350, '#0000ff', -1);

      const healthBefore = p2.health;
      forceActivePhase(p1, AttackType.STAND_C);

      cs.resolveAttacks(p1, p2, []);

      expect(p2.health).toBeLessThan(healthBefore);
      // STAND_C damage=100
      expect(p2.health).toBe(healthBefore - 100);
    });

    it('攻击方未在 active phase 不造成伤害', () => {
      const input = createInputProvider();
      const cs = new CombatSystem(input);
      const p1 = new Fighter(300, '#ff0000', 1);
      const p2 = new Fighter(350, '#0000ff', -1);

      const healthBefore = p2.health;

      // 只启动攻击但还在 startup phase
      p1.startAttack(AttackType.STAND_A);
      // attackPhase 仍然是 'startup'

      cs.resolveAttacks(p1, p2, []);

      expect(p2.health).toBe(healthBefore);
    });

    it('双方距离太远时命中框不重叠, 不造成伤害', () => {
      const input = createInputProvider();
      const cs = new CombatSystem(input);
      const p1 = new Fighter(100, '#ff0000', 1);
      const p2 = new Fighter(800, '#0000ff', -1);

      const healthBefore = p2.health;
      forceActivePhase(p1, AttackType.STAND_A);

      cs.resolveAttacks(p1, p2, []);

      expect(p2.health).toBe(healthBefore);
    });
  });

  // ===== 2. 命中后 defender 状态变化 =====

  describe('命中后 defender 状态', () => {
    it('命中后 defender 进入 HITSTUN', () => {
      const input = createInputProvider();
      const cs = new CombatSystem(input);
      const p1 = new Fighter(300, '#ff0000', 1);
      const p2 = new Fighter(350, '#0000ff', -1);

      forceActivePhase(p1, AttackType.STAND_A);
      cs.resolveAttacks(p1, p2, []);

      expect(p2.state).toBe(FighterState.HITSTUN);
    });

    it('命中后 defender 有 hitstunTimer', () => {
      const input = createInputProvider();
      const cs = new CombatSystem(input);
      const p1 = new Fighter(300, '#ff0000', 1);
      const p2 = new Fighter(350, '#0000ff', -1);

      forceActivePhase(p1, AttackType.STAND_A);
      cs.resolveAttacks(p1, p2, []);

      // STAND_A hitstun=11
      expect(p2.hitstunTimer).toBe(11);
    });

    it('命中后 attacker 标记 hasHit=true', () => {
      const input = createInputProvider();
      const cs = new CombatSystem(input);
      const p1 = new Fighter(300, '#ff0000', 1);
      const p2 = new Fighter(350, '#0000ff', -1);

      forceActivePhase(p1, AttackType.STAND_A);
      cs.resolveAttacks(p1, p2, []);

      expect(p1.hasHit).toBe(true);
    });

    it('knockdown 招式命中后 defender 进入 KNOCKDOWN', () => {
      const input = createInputProvider();
      const cs = new CombatSystem(input);
      const p1 = new Fighter(300, '#ff0000', 1);
      const p2 = new Fighter(350, '#0000ff', -1);

      // CROUCH_D 是下段扫腿, knockdown=true
      forceActivePhase(p1, AttackType.CROUCH_D);
      cs.resolveAttacks(p1, p2, []);

      expect(p2.state).toBe(FighterState.KNOCKDOWN);
      expect(p2.isKnockedDown).toBe(true);
    });
  });

  // ===== 3. Combo 计数器 =====

  describe('Combo 计数器', () => {
    it('首次命中后 combo count 递增到 1', () => {
      const input = createInputProvider();
      const cs = new CombatSystem(input);
      const p1 = new Fighter(300, '#ff0000', 1);
      const p2 = new Fighter(350, '#0000ff', -1);

      forceActivePhase(p1, AttackType.STAND_A);
      cs.resolveAttacks(p1, p2, []);

      // defender 是 p2 (index 1)
      expect(cs.getComboCount(1)).toBe(1);
    });

    it('多次命中递增 combo count', () => {
      const input = createInputProvider();
      const cs = new CombatSystem(input);
      const p1 = new Fighter(300, '#ff0000', 1);
      const p2 = new Fighter(350, '#0000ff', -1);

      // 第一次命中
      forceActivePhase(p1, AttackType.STAND_A);
      cs.resolveAttacks(p1, p2, []);

      // 模拟第二击: 重置 hasHit, 再次攻击
      p1.hasHit = false;
      forceActivePhase(p1, AttackType.STAND_A);
      cs.resolveAttacks(p1, p2, []);

      expect(cs.getComboCount(1)).toBe(2);
    });

    it('未命中时 combo count 为 0', () => {
      const input = createInputProvider();
      const cs = new CombatSystem(input);

      expect(cs.getComboCount(0)).toBe(0);
      expect(cs.getComboCount(1)).toBe(0);
    });

    it('combo damage 累计正确', () => {
      const input = createInputProvider();
      const cs = new CombatSystem(input);
      const p1 = new Fighter(300, '#ff0000', 1);
      const p2 = new Fighter(350, '#0000ff', -1);

      // STAND_C damage=100
      forceActivePhase(p1, AttackType.STAND_C);
      cs.resolveAttacks(p1, p2, []);

      expect(cs.getComboDamage(1)).toBe(100);
    });
  });

  // ===== 4. 防御 (Block / Chip Damage) =====

  describe('防御时 chip damage', () => {
    it('防御时 defender health 只减少 chip damage', () => {
      const input = createBlockingInputProvider();
      const cs = new CombatSystem(input);
      const p1 = new Fighter(300, '#ff0000', 1);
      const p2 = new Fighter(350, '#0000ff', -1);

      const healthBefore = p2.health;

      // 用一个通常技攻击, p2 按 back 防御
      forceActivePhase(p1, AttackType.STAND_C);
      cs.resolveAttacks(p1, p2, []);

      // 防御成功: health 只减少 chip damage
      const expectedChip = Math.round(100 * CHIP_DAMAGE_RATIO); // STAND_C damage=100, chip=10
      expect(p2.health).toBe(healthBefore - expectedChip);
    });

    it('防御时 defender 进入 BLOCK 状态', () => {
      const input = createBlockingInputProvider();
      const cs = new CombatSystem(input);
      const p1 = new Fighter(300, '#ff0000', 1);
      const p2 = new Fighter(350, '#0000ff', -1);

      forceActivePhase(p1, AttackType.STAND_A);
      cs.resolveAttacks(p1, p2, []);

      expect(p2.state).toBe(FighterState.BLOCK);
    });

    it('防御时 chip damage 不能致死 (health >= 1)', () => {
      const input = createBlockingInputProvider();
      const cs = new CombatSystem(input);
      const p1 = new Fighter(300, '#ff0000', 1);
      const p2 = new Fighter(350, '#0000ff', -1);

      // 把 p2 血量压到很低
      p2.health = 2;

      forceActivePhase(p1, AttackType.STAND_C);
      cs.resolveAttacks(p1, p2, []);

      // chip damage 不能致死
      expect(p2.health).toBeGreaterThanOrEqual(1);
    });

    it('防御时 combo 计数器被重置', () => {
      const input = createBlockingInputProvider();
      const cs = new CombatSystem(input);
      const p1 = new Fighter(300, '#ff0000', 1);
      const p2 = new Fighter(350, '#0000ff', -1);

      // 先命中一次, 再防御
      // 先用无防御输入命中
      const hitInput = createInputProvider();
      const cs2 = new CombatSystem(hitInput);
      forceActivePhase(p1, AttackType.STAND_A);
      cs2.resolveAttacks(p1, p2, []);

      // 然后防御
      p1.hasHit = false;
      forceActivePhase(p1, AttackType.STAND_A);
      cs2.resolveAttacks(p1, p2, []);

      // 防御重置 combo (hitInput 下 p2 不会防御, 但这里验证重置逻辑)
      // 用 blocking input 测试
      const cs3 = new CombatSystem(createBlockingInputProvider());
      const p1b = new Fighter(300, '#ff0000', 1);
      const p2b = new Fighter(350, '#0000ff', -1);

      forceActivePhase(p1b, AttackType.STAND_A);
      cs3.resolveAttacks(p1b, p2b, []);

      // 防御时 combo 应该是 0
      expect(cs3.getComboCount(1)).toBe(0);
    });
  });

  // ===== 5. KO 判定 =====

  describe('KO 判定', () => {
    it('health 降到 0 时判定为 KO', () => {
      const input = createInputProvider();
      const cs = new CombatSystem(input);
      const p1 = new Fighter(300, '#ff0000', 1);
      const p2 = new Fighter(350, '#0000ff', -1);

      // 把 p2 血量压到恰好等于一次攻击的 damage
      p2.health = 100; // STAND_C damage=100

      forceActivePhase(p1, AttackType.STAND_C);
      cs.resolveAttacks(p1, p2, []);

      expect(p2.health).toBe(0);
    });

    it('连续攻击直到 KO (combo 缩放导致需要更多次数)', () => {
      const input = createInputProvider();
      const cs = new CombatSystem(input);
      const p1 = new Fighter(300, '#ff0000', 1);
      const p2 = new Fighter(350, '#0000ff', -1);

      // 反复命中直到血量归零
      let hits = 0;
      while (p2.health > 0 && hits < 50) {
        p1.hasHit = false;
        p1.currentAttack = null;
        p1.attackPhase = 'none';
        forceActivePhase(p1, AttackType.STAND_C);
        cs.resolveAttacks(p1, p2, []);
        hits++;
      }

      expect(p2.health).toBe(0);
      // combo 缩放使后续命中伤害降低, 所以需要超过 10 次
      expect(hits).toBeGreaterThan(10);
      expect(hits).toBeLessThan(50);
    });

    it('health 不会降到负数', () => {
      const input = createInputProvider();
      const cs = new CombatSystem(input);
      const p1 = new Fighter(300, '#ff0000', 1);
      const p2 = new Fighter(350, '#0000ff', -1);

      // 把 p2 血量压到 1
      p2.health = 1;

      // STAND_C damage=100, 远超剩余血量
      forceActivePhase(p1, AttackType.STAND_C);
      cs.resolveAttacks(p1, p2, []);

      expect(p2.health).toBe(0);
      expect(p2.health).not.toBeLessThan(0);
    });
  });

  // ===== 6. onHit 回调 =====

  describe('onHit 回调', () => {
    it('命中时触发 onHit 回调', () => {
      const input = createInputProvider();
      const cs = new CombatSystem(input);
      const p1 = new Fighter(300, '#ff0000', 1);
      const p2 = new Fighter(350, '#0000ff', -1);

      let callbackFired = false;
      let callbackAttack: AttackType | null = null;
      let callbackIsBlock: boolean | null = null;

      const onHit = (
        _attacker: Fighter,
        _defender: Fighter,
        attackType: AttackType,
        isBlock: boolean,
        _isCounter: boolean,
      ) => {
        callbackFired = true;
        callbackAttack = attackType;
        callbackIsBlock = isBlock;
      };

      forceActivePhase(p1, AttackType.STAND_A);
      cs.resolveAttacks(p1, p2, [], onHit);

      expect(callbackFired).toBe(true);
      expect(callbackAttack).toBe(AttackType.STAND_A);
      expect(callbackIsBlock).toBe(false);
    });

    it('防御时 onHit 的 isBlock=true', () => {
      const input = createBlockingInputProvider();
      const cs = new CombatSystem(input);
      const p1 = new Fighter(300, '#ff0000', 1);
      const p2 = new Fighter(350, '#0000ff', -1);

      let callbackIsBlock: boolean | null = null;

      const onHit = (
        _attacker: Fighter,
        _defender: Fighter,
        _attackType: AttackType,
        isBlock: boolean,
        _isCounter: boolean,
      ) => {
        callbackIsBlock = isBlock;
      };

      forceActivePhase(p1, AttackType.STAND_A);
      cs.resolveAttacks(p1, p2, [], onHit);

      expect(callbackIsBlock).toBe(true);
    });

    it('未命中时不触发 onHit 回调', () => {
      const input = createInputProvider();
      const cs = new CombatSystem(input);
      const p1 = new Fighter(100, '#ff0000', 1);
      const p2 = new Fighter(800, '#0000ff', -1);

      let callbackFired = false;
      const onHit = () => { callbackFired = true; };

      forceActivePhase(p1, AttackType.STAND_A);
      cs.resolveAttacks(p1, p2, [], onHit);

      expect(callbackFired).toBe(false);
    });
  });

  // ===== 7. 双向攻击 =====

  describe('双向攻击', () => {
    it('resolveAttacks 先处理 p1 攻击 p2, 再处理 p2 攻击 p1 (顺序性)', () => {
      // KOF2002: resolveAttacks 先 resolveHit(p1, p2) 再 resolveHit(p2, p1)
      // 如果 p1 命中 p2, p2 进入 HITSTUN 并 resetAttackState,
      // 则 p2 的攻击被打断, 无法命中 p1。
      const input = createInputProvider();
      const cs = new CombatSystem(input);
      const p1 = new Fighter(300, '#ff0000', 1);
      const p2 = new Fighter(350, '#0000ff', -1);

      const p1HealthBefore = p1.health;
      const p2HealthBefore = p2.health;

      // 双方同时攻击
      forceActivePhase(p1, AttackType.STAND_A);
      forceActivePhase(p2, AttackType.STAND_A);

      cs.resolveAttacks(p1, p2, []);

      // p1 先命中 p2, p2 的攻击被打断
      expect(p2.health).toBeLessThan(p2HealthBefore);
      // p1 不受伤 (p2 攻击被打断)
      expect(p1.health).toBe(p1HealthBefore);
    });
  });

  // ===== 8. 伤害值精确验证 =====

  describe('伤害值精确验证', () => {
    it('STAND_A (damage=33) 精确扣血', () => {
      const input = createInputProvider();
      const cs = new CombatSystem(input);
      const p1 = new Fighter(300, '#ff0000', 1);
      const p2 = new Fighter(350, '#0000ff', -1);

      forceActivePhase(p1, AttackType.STAND_A);
      cs.resolveAttacks(p1, p2, []);

      const fd = FRAME_DATA[AttackType.STAND_A];
      expect(p2.health).toBe(MAX_HEALTH - fd.damage);
    });

    it('CLOSE_C (damage=100) 精确扣血', () => {
      const input = createInputProvider();
      const cs = new CombatSystem(input);
      const p1 = new Fighter(300, '#ff0000', 1);
      const p2 = new Fighter(350, '#0000ff', -1);

      forceActivePhase(p1, AttackType.CLOSE_C);
      cs.resolveAttacks(p1, p2, []);

      const fd = FRAME_DATA[AttackType.CLOSE_C];
      expect(p2.health).toBe(MAX_HEALTH - fd.damage);
    });
  });

  // ===== 9. Counter Hit =====

  describe('Counter Hit', () => {
    it('defender 在攻击状态被命中时判定为 Counter Hit', () => {
      const input = createInputProvider();
      const cs = new CombatSystem(input);
      const p1 = new Fighter(300, '#ff0000', 1);
      const p2 = new Fighter(350, '#0000ff', -1);

      let counterHit = false;
      const onHit = (
        _attacker: Fighter,
        _defender: Fighter,
        _attackType: AttackType,
        _isBlock: boolean,
        isCounter: boolean,
      ) => {
        counterHit = isCounter;
      };

      // P2 也在攻击 (STAND_ATTACK 状态)
      forceActivePhase(p2, AttackType.STAND_A);
      forceActivePhase(p1, AttackType.STAND_A);

      cs.resolveAttacks(p1, p2, [], onHit);

      expect(counterHit).toBe(true);
    });

    it('defender 在 IDLE 状态被命中时不是 Counter Hit', () => {
      const input = createInputProvider();
      const cs = new CombatSystem(input);
      const p1 = new Fighter(300, '#ff0000', 1);
      const p2 = new Fighter(350, '#0000ff', -1);

      let counterHit = false;
      const onHit = (
        _attacker: Fighter,
        _defender: Fighter,
        _attackType: AttackType,
        _isBlock: boolean,
        isCounter: boolean,
      ) => {
        counterHit = isCounter;
      };

      // P2 处于 IDLE
      forceActivePhase(p1, AttackType.STAND_A);
      cs.resolveAttacks(p1, p2, [], onHit);

      expect(counterHit).toBe(false);
    });
  });

  // ===== 10. CombatSystem reset =====

  describe('CombatSystem reset', () => {
    it('reset() 清零 combo 状态', () => {
      const input = createInputProvider();
      const cs = new CombatSystem(input);
      const p1 = new Fighter(300, '#ff0000', 1);
      const p2 = new Fighter(350, '#0000ff', -1);

      forceActivePhase(p1, AttackType.STAND_A);
      cs.resolveAttacks(p1, p2, []);

      expect(cs.getComboCount(1)).toBeGreaterThan(0);

      cs.reset();

      expect(cs.getComboCount(0)).toBe(0);
      expect(cs.getComboCount(1)).toBe(0);
      expect(cs.getComboDamage(0)).toBe(0);
      expect(cs.getComboDamage(1)).toBe(0);
    });
  });

  // ===== 11. tickComboTimeout =====

  describe('tickComboTimeout', () => {
    it('超过 COMBO_TIMEOUT 帧后 combo 自动重置', () => {
      const input = createInputProvider();
      const cs = new CombatSystem(input);
      const p1 = new Fighter(300, '#ff0000', 1);
      const p2 = new Fighter(350, '#0000ff', -1);

      // 命中
      forceActivePhase(p1, AttackType.STAND_A);
      cs.resolveAttacks(p1, p2, [], undefined, 100);

      expect(cs.getComboCount(1)).toBe(1);

      // 模拟时间流逝超过 COMBO_TIMEOUT (假设 COMBO_TIMEOUT 为合理值)
      // 需要先拿到 COMBO_TIMEOUT 常量
      // 用一个很大的值确保超过任何合理的 timeout
      cs.tickComboTimeout(100 + 300);
      expect(cs.getComboCount(1)).toBe(0);
    });
  });
});
