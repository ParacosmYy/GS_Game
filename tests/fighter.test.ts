import { describe, it, expect } from 'vitest';
import { Fighter } from '../src/entities/fighter.js';
import { FighterState, AttackType, JuggleState } from '../src/core/types.js';
import { MAX_HEALTH, STAGE_GROUND_Y, FIGHTER_WIDTH, THROW_INVINCIBILITY_WAKEUP, THROW_INVINCIBILITY_POST_STUN, THROW_INVINCIBILITY_POST_ESCAPE } from '../src/core/constants.js';

describe('Fighter', () => {
  function createFighter(x = 400): Fighter {
    const f = new Fighter(x, '#ff6600', 1);
    return f;
  }

  describe('初始化', () => {
    it('应该有正确的初始状态', () => {
      const f = createFighter();
      expect(f.state).toBe(FighterState.IDLE);
      expect(f.health).toBe(MAX_HEALTH);
      expect(f.currentAttack).toBeNull();
      expect(f.attackPhase).toBe('none');
      expect(f.isGrounded()).toBe(true);
      expect(f.canAct()).toBe(true);
    });

    it('应该站在地面上', () => {
      const f = createFighter();
      expect(f.y).toBe(STAGE_GROUND_Y);
    });
  });

  describe('攻击系统', () => {
    it('开始攻击时应该正确设置状态', () => {
      const f = createFighter();
      f.startAttack(AttackType.STAND_A);
      expect(f.currentAttack).toBe(AttackType.STAND_A);
      expect(f.attackPhase).toBe('startup');
      expect(f.attackFrame).toBe(0);
      expect(f.state).toBe(FighterState.STAND_ATTACK);
    });

    it('蹲下攻击应该设置 CROUCH_ATTACK 状态', () => {
      const f = createFighter();
      f.startAttack(AttackType.CROUCH_A);
      expect(f.state).toBe(FighterState.CROUCH_ATTACK);
    });

    it('空中攻击应该设置 AIR_ATTACK 状态', () => {
      const f = createFighter();
      f.startAttack(AttackType.JUMP_C);
      expect(f.state).toBe(FighterState.AIR_ATTACK);
    });

    it('投技应该设置 THROW 状态', () => {
      const f = createFighter();
      f.startAttack(AttackType.THROW);
      expect(f.state).toBe(FighterState.THROW);
    });

    it('前投应该设置 THROW 状态', () => {
      const f = createFighter();
      f.startAttack(AttackType.THROW_FORWARD);
      expect(f.state).toBe(FighterState.THROW);
    });

    it('后投应该设置 THROW 状态', () => {
      const f = createFighter();
      f.startAttack(AttackType.THROW_BACK);
      expect(f.state).toBe(FighterState.THROW);
    });
  });

  describe('攻击帧推进', () => {
    it('应该按 startup → active → recovery → end 顺序推进', () => {
      const f = createFighter();
      f.startAttack(AttackType.STAND_A);

      // STAND_A startup=5 (KOF2002UM Kyo, Dream Cancel Wiki)
      expect(f.attackPhase).toBe('startup');
      expect(f.attackFrame).toBe(0);
      f.tickAttack(); // frame 0 → 1
      expect(f.attackFrame).toBe(1);
      f.tickAttack(); // frame 1 → 2
      expect(f.attackFrame).toBe(2);
      f.tickAttack(); // frame 2 → 3
      expect(f.attackFrame).toBe(3);
      f.tickAttack(); // frame 3 → 4
      expect(f.attackFrame).toBe(4);
      f.tickAttack(); // frame 4 → startup done, active starts, frame reset to 0
      expect(f.attackPhase).toBe('active');
      expect(f.attackFrame).toBe(0);

      // active: 4帧
      f.tickAttack();
      f.tickAttack();
      f.tickAttack();
      f.tickAttack(); // active done, recovery starts
      expect(f.attackPhase).toBe('recovery');
      expect(f.attackFrame).toBe(0);

      // recovery: 5帧
      for (let i = 0; i < 5; i++) f.tickAttack();
      expect(f.currentAttack).toBeNull();
    });
  });

  describe('逐帧判定框', () => {
    it('攻击激活时应该返回非空 hitbox', () => {
      const f = createFighter();
      f.startAttack(AttackType.STAND_C);
      // 跳过 startup
      f.attackPhase = 'active';
      f.attackFrame = 0;
      const hitbox = f.getActiveHitbox();
      expect(hitbox).not.toBeNull();
      expect(hitbox!.width).toBeGreaterThan(0);
      expect(hitbox!.height).toBeGreaterThan(0);
    });

    it('多框判定应该返回多个 hitbox', () => {
      const f = createFighter();
      f.startAttack(AttackType.STAND_C);
      f.attackPhase = 'active';
      f.attackFrame = 0;
      const hitboxes = f.getActiveHitboxes();
      expect(hitboxes.length).toBeGreaterThanOrEqual(1);
    });

    it('非攻击状态应该返回空 hitbox', () => {
      const f = createFighter();
      const hitbox = f.getActiveHitbox();
      expect(hitbox).toBeNull();
      expect(f.getActiveHitboxes()).toHaveLength(0);
    });

    it('升龙拳出招时受击框应该缩小', () => {
      const f = createFighter();
      const baseHurtbox = f.getHurtbox();
      f.startAttack(AttackType.SPECIAL_UPPER);
      f.attackPhase = 'active';
      f.attackFrame = 0;
      const overrideHurtbox = f.getBodyOverride();
      expect(overrideHurtbox).not.toBeNull();
      // 升龙拳的 bodyOverride 应该比默认受击框小
      expect(overrideHurtbox!.width).toBeLessThan(baseHurtbox.width);
    });
  });

  describe('状态管理', () => {
    it('canAct 应该只在可操作状态返回 true', () => {
      const f = createFighter();
      expect(f.canAct()).toBe(true);

      f.state = FighterState.HITSTUN;
      expect(f.canAct()).toBe(false);

      f.state = FighterState.KNOCKDOWN;
      expect(f.canAct()).toBe(false);

      f.state = FighterState.BLOCK;
      expect(f.canAct()).toBe(false);

      f.state = FighterState.AIR_BLOCK;
      expect(f.canAct()).toBe(false);
    });

    it('canAirBlock 应该只在空中可防御状态返回 true', () => {
      const f = createFighter();
      expect(f.canAirBlock()).toBe(false); // 地面

      f.y = STAGE_GROUND_Y - 100;
      f.state = FighterState.JUMP;
      expect(f.canAirBlock()).toBe(true);

      f.state = FighterState.AIR_ATTACK;
      expect(f.canAirBlock()).toBe(true);

      f.state = FighterState.HITSTUN;
      expect(f.canAirBlock()).toBe(false);
    });

    it('reset 应该恢复所有状态到初始值', () => {
      const f = createFighter();
      f.health = 0;
      f.state = FighterState.KNOCKDOWN;
      f.isKnockedDown = true;
      f.guardGauge = 0;
      f.reset(400);
      expect(f.health).toBe(MAX_HEALTH);
      expect(f.state).toBe(FighterState.IDLE);
      expect(f.isKnockedDown).toBe(false);
      expect(f.guardGauge).toBe(100);
    });
  });

  describe('受击框系统', () => {
    it('getHurtbox 应该返回正确的矩形', () => {
      const f = createFighter();
      const hb = f.getHurtbox();
      expect(hb.x).toBe(f.x - FIGHTER_WIDTH / 2);
      expect(hb.y).toBe(f.y - f.displayHeight);
      expect(hb.width).toBe(FIGHTER_WIDTH);
    });

    it('蹲下时受击框高度应该减小', () => {
      const f = createFighter();
      const standHb = f.getHurtbox();
      f.state = FighterState.CROUCH;
      f.displayHeight = 50;
      const crouchHb = f.getHurtbox();
      expect(crouchHb.height).toBeLessThan(standHb.height);
    });

    it('getEffectiveHurtbox 应该在有 bodyOverride 时返回覆盖框', () => {
      const f = createFighter();
      // 非攻击状态应该返回默认受击框
      const normal = f.getEffectiveHurtbox();
      expect(normal).toEqual(f.getHurtbox());
    });
  });

  describe('投技判定框系统', () => {
    it('非攻击状态时 getThrowbox() 应该返回 null', () => {
      const f = createFighter();
      expect(f.getThrowbox()).toBeNull();
    });

    it('attackPhase 不是 active 时 getThrowbox() 应该返回 null', () => {
      const f = createFighter();
      f.startAttack(AttackType.THROW_FORWARD);
      // startup 阶段
      expect(f.attackPhase).toBe('startup');
      expect(f.getThrowbox()).toBeNull();
    });

    it('THROW_FORWARD 在 active 阶段应该返回投技判定框', () => {
      const f = createFighter();
      f.startAttack(AttackType.THROW_FORWARD);
      f.attackPhase = 'active';
      f.attackFrame = 0;
      const box = f.getThrowbox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThan(0);
      expect(box!.height).toBeGreaterThan(0);
    });

    it('THROW_BACK 在 active 阶段应该返回投技判定框', () => {
      const f = createFighter();
      f.startAttack(AttackType.THROW_BACK);
      f.attackPhase = 'active';
      f.attackFrame = 0;
      const box = f.getThrowbox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThan(0);
      expect(box!.height).toBeGreaterThan(0);
    });

    it('throwInvulnFrames > 0 时 getThrowbox() 应该返回 null', () => {
      const f = createFighter();
      f.startAttack(AttackType.THROW_FORWARD);
      f.attackPhase = 'active';
      f.attackFrame = 0;
      f.throwInvulnFrames = 5;
      expect(f.getThrowbox()).toBeNull();
    });
  });

  describe('投技可被抓状态', () => {
    it('IDLE 状态下 isThrowVulnerable() 应该返回 true', () => {
      const f = createFighter();
      f.state = FighterState.IDLE;
      expect(f.isThrowVulnerable()).toBe(true);
    });

    it('HITSTUN 状态下 isThrowVulnerable() 应该返回 false', () => {
      const f = createFighter();
      f.state = FighterState.HITSTUN;
      expect(f.isThrowVulnerable()).toBe(false);
    });

    it('KNOCKDOWN 状态下 isThrowVulnerable() 应该返回 false', () => {
      const f = createFighter();
      f.state = FighterState.KNOCKDOWN;
      expect(f.isThrowVulnerable()).toBe(false);
    });

    it('BLOCK 状态下 isThrowVulnerable() 应该返回 false', () => {
      const f = createFighter();
      f.state = FighterState.BLOCK;
      expect(f.isThrowVulnerable()).toBe(false);
    });

    it('ROLL 状态下 isThrowVulnerable() 应该返回 false', () => {
      const f = createFighter();
      f.state = FighterState.ROLL;
      expect(f.isThrowVulnerable()).toBe(false);
    });

    it('throwInvulnFrames > 0 时 isThrowVulnerable() 应该返回 false', () => {
      const f = createFighter();
      f.state = FighterState.IDLE;
      f.throwInvulnFrames = 3;
      expect(f.isThrowVulnerable()).toBe(false);
    });
  });

  describe('无敌状态', () => {
    it('正常状态下 getEffectiveHurtbox() 应该返回受击框', () => {
      const f = createFighter();
      const hurtbox = f.getEffectiveHurtbox();
      expect(hurtbox).not.toBeNull();
      expect(hurtbox).toEqual(f.getHurtbox());
    });

    it('invincible=true 时 getEffectiveHurtbox() 应该返回 null', () => {
      const f = createFighter();
      f.invincible = true;
      expect(f.getEffectiveHurtbox()).toBeNull();
    });

    it('reset() 应该清除 invincible 和 throwInvulnFrames', () => {
      const f = createFighter();
      f.invincible = true;
      f.throwInvulnFrames = 10;
      f.reset(400);
      expect(f.invincible).toBe(false);
      expect(f.throwInvulnFrames).toBe(0);
    });
  });

  describe('投技无敌帧衰减', () => {
    it('tickAttack() 每次调用应该递减 throwInvulnFrames', () => {
      const f = createFighter();
      f.startAttack(AttackType.STAND_A);
      f.throwInvulnFrames = 3;
      f.tickAttack();
      expect(f.throwInvulnFrames).toBe(2);
      f.tickAttack();
      expect(f.throwInvulnFrames).toBe(1);
      f.tickAttack();
      expect(f.throwInvulnFrames).toBe(0);
    });

    it('throwInvulnFrames 不应该低于 0', () => {
      const f = createFighter();
      f.startAttack(AttackType.STAND_A);
      f.throwInvulnFrames = 1;
      f.tickAttack();
      expect(f.throwInvulnFrames).toBe(0);
      f.tickAttack();
      expect(f.throwInvulnFrames).toBe(0);
    });
  });

  describe('投技拆投状态 (Throw Escape State)', () => {
    it('初始状态不应该处于被投状态', () => {
      const f = createFighter();
      expect(f.isBeingThrown).toBe(false);
      expect(f.throwEscapeTimer).toBe(0);
    });

    it('初始状态不应该处于投人状态', () => {
      const f = createFighter();
      expect(f.isThrowing).toBe(false);
      expect(f.throwVictim).toBeNull();
    });

    it('reset() 应该清除投技相关状态', () => {
      const f = createFighter();
      f.isBeingThrown = true;
      f.throwEscapeTimer = 8;
      f.isThrowing = true;
      f.throwVictim = createFighter(500);
      f.reset(400);
      expect(f.isBeingThrown).toBe(false);
      expect(f.throwEscapeTimer).toBe(0);
      expect(f.isThrowing).toBe(false);
      expect(f.throwVictim).toBeNull();
    });
  });

  describe('投技无敌常量验证 (KOF2002 Authentic)', () => {
    it('WAKEUP 投技无敌应为 9 帧 (KOF2002标准)', () => {
      expect(THROW_INVINCIBILITY_WAKEUP).toBe(9);
    });

    it('POST_STUN 投技无敌应为 9 帧', () => {
      expect(THROW_INVINCIBILITY_POST_STUN).toBe(9);
    });

    it('POST_ESCAPE 投技无敌应为 6 帧', () => {
      expect(THROW_INVINCIBILITY_POST_ESCAPE).toBe(6);
    });
  });
});
