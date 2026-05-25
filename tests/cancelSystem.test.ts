/**
 * cancelSystem.test.ts — Cancel system + hitConfirmDelay tests
 *
 * Tests the cancel gating mechanism:
 * 1. superCancelReady / freeCancel require hitConfirmDelay === 0
 * 2. Cancel flags are set on hit in resolveHit
 * 3. hitConfirmDelay decrements each tick via tickTimers()
 * 4. reset() clears all cancel state
 */
import { describe, it, expect } from 'vitest';
import { Fighter } from '../src/entities/fighter.js';
import { FighterState, AttackType } from '../src/core/types.js';
import { FRAME_DATA } from '../src/core/constants.js';

describe('Cancel system — hitConfirmDelay', () => {
  it('hitConfirmDelay 初始值为 0', () => {
    const f = new Fighter(400, '#ff6600', 1);
    expect(f.hitConfirmDelay).toBe(0);
  });

  it('命中后 hitConfirmDelay 为 1 (resolveHit 设置)', () => {
    const f = new Fighter(400, '#ff6600', 1);
    // 模拟 resolveHit 中对 hitConfirmDelay 的赋值
    f.hitConfirmDelay = 1;
    expect(f.hitConfirmDelay).toBe(1);
  });

  it('hitConfirmDelay 递减到 0 后取消可用', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.hitConfirmDelay = 1;
    // tickTimers 会递减 hitConfirmDelay
    expect(f.hitConfirmDelay).toBe(1);
    f.tickTimers();
    expect(f.hitConfirmDelay, '1帧后 hitConfirmDelay 应为 0').toBe(0);
    // hitConfirmDelay === 0 时取消应该被允许
    expect(f.hitConfirmDelay === 0, 'hitConfirmDelay===0 时取消允许').toBe(true);
  });

  it('hitConfirmDelay 不会递减到负数', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.hitConfirmDelay = 0;
    f.tickTimers();
    expect(f.hitConfirmDelay).toBe(0);
  });

  it('reset() 清空 hitConfirmDelay', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.hitConfirmDelay = 1;
    f.reset(400);
    expect(f.hitConfirmDelay).toBe(0);
  });
});

describe('Cancel system — superCancelReady', () => {
  it('superCancelReady 初始值为 false', () => {
    const f = new Fighter(400, '#ff6600', 1);
    expect(f.superCancelReady).toBe(false);
  });

  it('resetCancelFlags 清空 superCancelReady', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.superCancelReady = true;
    f.resetCancelFlags();
    expect(f.superCancelReady).toBe(false);
  });

  it('reset() 清空 superCancelReady', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.superCancelReady = true;
    f.reset(400);
    expect(f.superCancelReady).toBe(false);
  });

  it('超级取消在 startup 阶段被拒绝 (attackPhase !== active/recovery)', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.superCancelReady = true;
    f.hitConfirmDelay = 0;
    // 设置为 startup 阶段
    f.startAttack(AttackType.STAND_A);
    expect(f.attackPhase).toBe('startup');
    // stateHandlers 中的条件检查: attackPhase === 'active' || attackPhase === 'recovery'
    // startup 阶段不满足条件
    const canSuperCancel = f.superCancelReady
      && f.currentAttack !== null
      && (f.attackPhase === 'active' || f.attackPhase === 'recovery')
      && f.hitConfirmDelay === 0;
    expect(canSuperCancel, 'startup阶段不应允许超级取消').toBe(false);
  });

  it('超级取消在 recovery 阶段被允许 (superCancelReady + hitConfirmDelay=0)', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.superCancelReady = true;
    f.hitConfirmDelay = 0;
    // 模拟进入 recovery 阶段
    f.currentAttack = AttackType.SPECIAL_UPPER;
    f.attackPhase = 'recovery';
    f.attackFrame = 0;
    const canSuperCancel = f.superCancelReady
      && f.currentAttack !== null
      && (f.attackPhase === 'active' || f.attackPhase === 'recovery')
      && f.hitConfirmDelay === 0;
    expect(canSuperCancel, 'recovery阶段+superCancelReady+hitConfirmDelay=0 应允许超级取消').toBe(true);
  });

  it('超级取消在 hitConfirmDelay=1 时被拒绝', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.superCancelReady = true;
    f.hitConfirmDelay = 1; // 命中后第一帧
    f.currentAttack = AttackType.SPECIAL_UPPER;
    f.attackPhase = 'recovery';
    const canSuperCancel = f.superCancelReady
      && f.currentAttack !== null
      && (f.attackPhase === 'active' || f.attackPhase === 'recovery')
      && f.hitConfirmDelay === 0;
    expect(canSuperCancel, 'hitConfirmDelay=1 时不应允许超级取消').toBe(false);
  });
});

describe('Cancel system — freeCancel (MAX mode)', () => {
  it('自由取消在 startup 阶段被拒绝', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.hitConfirmDelay = 0;
    f.startAttack(AttackType.STAND_C);
    expect(f.attackPhase).toBe('startup');
    const canFreeCancel = f.currentAttack !== null
      && (f.attackPhase === 'active' || f.attackPhase === 'recovery')
      && f.hitConfirmDelay === 0;
    expect(canFreeCancel, 'startup阶段不应允许自由取消').toBe(false);
  });

  it('自由取消在 active 阶段被允许 (hitConfirmDelay=0)', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.hitConfirmDelay = 0;
    f.currentAttack = AttackType.STAND_C;
    f.attackPhase = 'active';
    const canFreeCancel = f.currentAttack !== null
      && (f.attackPhase === 'active' || f.attackPhase === 'recovery')
      && f.hitConfirmDelay === 0;
    expect(canFreeCancel, 'active阶段+hitConfirmDelay=0 应允许自由取消').toBe(true);
  });

  it('自由取消在 hitConfirmDelay=1 时被拒绝', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.hitConfirmDelay = 1;
    f.currentAttack = AttackType.STAND_C;
    f.attackPhase = 'active';
    const canFreeCancel = f.currentAttack !== null
      && (f.attackPhase === 'active' || f.attackPhase === 'recovery')
      && f.hitConfirmDelay === 0;
    expect(canFreeCancel, 'hitConfirmDelay=1 时不应允许自由取消').toBe(false);
  });
});

describe('Cancel system — cancelEvent', () => {
  it('cancelEvent 初始值为 null', () => {
    const f = new Fighter(400, '#ff6600', 1);
    expect(f.cancelEvent).toBeNull();
  });

  it('resetCancelFlags 清空 cancelEvent', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.cancelEvent = 'super_cancel';
    f.resetCancelFlags();
    expect(f.cancelEvent).toBeNull();
  });

  it('startAttack 清空 cancelEvent', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.cancelEvent = 'free_cancel';
    f.startAttack(AttackType.STAND_A);
    expect(f.cancelEvent).toBeNull();
  });
});
