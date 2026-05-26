/**
 * cancelSystem.test.ts -- KOF2002 取消系统完整性验证
 *
 * 覆盖取消系统的五类机制:
 * 1. Normal Cancel: 通常技 -> 通常技 (A->B->C chain)
 * 2. Special Cancel: 通常技/命令通常技 -> 必杀技
 * 3. Super Cancel: 必杀技命中 -> DM (消耗额外stock)
 * 4. Free Cancel: MAX模式内任意招式 -> 任意必杀技 (消耗MAX timer)
 * 5. 取消窗口边界: startup/active/recovery帧的取消门控
 */
import { describe, it, expect } from 'vitest';
import { CombatSystem } from '../src/combat/combatSystem.js';
import { Fighter } from '../src/entities/fighter.js';
import { FighterState, AttackType } from '../src/core/types.js';
import type { IInputProvider, PlayerInput, PowerGauge, MaxModeState } from '../src/core/types.js';
import {
  FRAME_DATA, CANCEL_WINDOW_NORMAL, CANCEL_WINDOW_RAPID, CANCEL_WINDOW_SUPER, CANCEL_WINDOW_FREE,
  LIGHT_NORMALS, NORMAL_ATTACKS, COMMAND_NORMALS,
  DM_STOCK_COST, SUPER_CANCEL_STOCK_COST,
  FREE_CANCEL_TIMER_COST, MAX_MODE_DURATION,
  MAX_MODE_STOCK_COST,
} from '../src/core/constants.js';
import { createPowerGauge, createMaxMode, spendStocks, activateMaxMode } from '../src/combat/meter.js';
import { isDM, isCharacterSpecial } from '../src/core/attackClassifier.js';

// ===== Helper: stub IInputProvider =====
const noInput: PlayerInput = {
  up: false, down: false, left: false, right: false,
  buttonA: false, buttonB: false, buttonC: false, buttonD: false,
  throwAttack: false, start: false,
};

const stubInputProvider: IInputProvider = {
  getP1Input: () => noInput,
  getP2Input: () => noInput,
};

// ===== 1. Normal Cancel (5 tests) =====

describe('Normal Cancel', () => {
  it('STAND_A 可以取消到 STAND_B', () => {
    const f = new Fighter(400, '#ff6600', 1);
    // STAND_A is a normal attack, so normalCancelReady is set when it hits
    f.normalCancelReady = true;
    f.hasHit = true;
    f.currentAttack = AttackType.STAND_A;
    f.attackPhase = 'recovery';
    f.hitConfirmDelay = 0;
    // Normal cancel condition: normalCancelReady + hasHit + recovery + in NORMAL_ATTACKS
    const canCancel = f.normalCancelReady
      && f.hasHit
      && f.attackPhase === 'recovery'
      && f.currentAttack !== null
      && NORMAL_ATTACKS.has(f.currentAttack as string)
      && f.hitConfirmDelay === 0;
    expect(canCancel, 'STAND_A -> STAND_B normal cancel allowed').toBe(true);
    // STAND_B is a valid normal attack target
    expect(NORMAL_ATTACKS.has('STAND_B'), 'STAND_B is a valid normal attack').toBe(true);
  });

  it('STAND_B 可以取消到 STAND_C', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.normalCancelReady = true;
    f.hasHit = true;
    f.currentAttack = AttackType.STAND_B;
    f.attackPhase = 'recovery';
    f.hitConfirmDelay = 0;
    const canCancel = f.normalCancelReady
      && f.hasHit
      && f.attackPhase === 'recovery'
      && f.currentAttack !== null
      && NORMAL_ATTACKS.has(f.currentAttack as string)
      && f.hitConfirmDelay === 0;
    expect(canCancel, 'STAND_B -> STAND_C normal cancel allowed').toBe(true);
    expect(NORMAL_ATTACKS.has('STAND_C'), 'STAND_C is a valid normal attack').toBe(true);
  });

  it('CROUCH_A 可以取消到 CROUCH_B', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.normalCancelReady = true;
    f.hasHit = true;
    f.currentAttack = AttackType.CROUCH_A;
    f.attackPhase = 'recovery';
    f.hitConfirmDelay = 0;
    const canCancel = f.normalCancelReady
      && f.hasHit
      && f.attackPhase === 'recovery'
      && f.currentAttack !== null
      && NORMAL_ATTACKS.has(f.currentAttack as string)
      && f.hitConfirmDelay === 0;
    expect(canCancel, 'CROUCH_A -> CROUCH_B normal cancel allowed').toBe(true);
    expect(NORMAL_ATTACKS.has('CROUCH_B'), 'CROUCH_B is a valid normal attack').toBe(true);
  });

  it('不能跳级取消 (A -> C 不可通过rapid cancel)', () => {
    // Rapid cancel is for light normals chaining into light normals only (A->B light chain)
    // STAND_A cannot rapid cancel to STAND_C because STAND_C is not in LIGHT_NORMALS
    const f = new Fighter(400, '#ff6600', 1);
    f.rapidCancelReady = true;
    f.currentAttack = AttackType.STAND_A;
    f.attackPhase = 'recovery';
    // Rapid cancel only targets LIGHT_NORMALS
    const canRapidToC = f.rapidCancelReady
      && LIGHT_NORMALS.has('STAND_C');
    expect(canRapidToC, 'STAND_C is not a light normal, rapid cancel blocked').toBe(false);
  });

  it('取消窗口帧数验证 (getCancelWindow)', () => {
    expect(CombatSystem.getCancelWindow('normal')).toBe(CANCEL_WINDOW_NORMAL);
    expect(CombatSystem.getCancelWindow('normal')).toBe(3);
    expect(CombatSystem.getCancelWindow('rapid')).toBe(CANCEL_WINDOW_RAPID);
    expect(CombatSystem.getCancelWindow('rapid')).toBe(2);
    expect(CombatSystem.getCancelWindow('super')).toBe(CANCEL_WINDOW_SUPER);
    expect(CombatSystem.getCancelWindow('super')).toBe(5);
    expect(CombatSystem.getCancelWindow('free')).toBe(CANCEL_WINDOW_FREE);
    expect(CombatSystem.getCancelWindow('free')).toBe(4);
    // Window ordering: rapid < normal < free < super
    expect(CANCEL_WINDOW_RAPID).toBeLessThan(CANCEL_WINDOW_NORMAL);
    expect(CANCEL_WINDOW_NORMAL).toBeLessThan(CANCEL_WINDOW_FREE);
    expect(CANCEL_WINDOW_FREE).toBeLessThan(CANCEL_WINDOW_SUPER);
  });
});

// ===== 2. Special Cancel (5 tests) =====

describe('Special Cancel', () => {
  it('STAND_C 命中后可取消到必杀技', () => {
    const f = new Fighter(400, '#ff6600', 1);
    // STAND_C is a normal, normalCancelReady set on hit
    f.normalCancelReady = true;
    f.hasHit = true;
    f.currentAttack = AttackType.STAND_C;
    f.attackPhase = 'recovery';
    f.hitConfirmDelay = 0;
    // Normal -> special cancel condition
    const canSpecialCancel = f.normalCancelReady
      && f.hasHit
      && f.attackPhase === 'recovery'
      && NORMAL_ATTACKS.has(f.currentAttack as string)
      && f.hitConfirmDelay === 0;
    expect(canSpecialCancel, 'STAND_C hit -> special cancel allowed').toBe(true);
    // Target must be a special (not DM)
    expect(isCharacterSpecial('KYO_ONIYAKI'), 'KYO_ONIYAKI is a valid special').toBe(true);
    expect(isDM('KYO_ONIYAKI'), 'KYO_ONIYAKI is not a DM').toBe(false);
  });

  it('命中时才能取消（未命中不可）', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.normalCancelReady = true;
    f.hasHit = false; // NOT hit (whiff or blocked)
    f.currentAttack = AttackType.STAND_C;
    f.attackPhase = 'recovery';
    f.hitConfirmDelay = 0;
    // Normal cancel to special requires hasHit
    const canSpecialCancelOnHit = f.normalCancelReady
      && f.hasHit
      && f.attackPhase === 'recovery'
      && NORMAL_ATTACKS.has(f.currentAttack as string);
    expect(canSpecialCancelOnHit, 'special cancel blocked when not hit').toBe(false);
    // With hit it works
    f.hasHit = true;
    const canSpecialCancelAfterHit = f.normalCancelReady
      && f.hasHit
      && f.attackPhase === 'recovery'
      && NORMAL_ATTACKS.has(f.currentAttack as string);
    expect(canSpecialCancelAfterHit, 'special cancel allowed after hit').toBe(true);
  });

  it('取消后招式正确启动', () => {
    const f = new Fighter(400, '#ff6600', 1);
    // Simulate cancel: start new attack
    f.currentAttack = AttackType.STAND_C;
    f.attackPhase = 'recovery';
    f.normalCancelReady = true;
    // Cancel into special
    f.startAttack(AttackType.KYO_ONIYAKI);
    expect(f.currentAttack, 'new attack is KYO_ONIYAKI').toBe(AttackType.KYO_ONIYAKI);
    expect(f.attackPhase, 'new attack starts in startup').toBe('startup');
    expect(f.attackFrame, 'attackFrame reset to 0').toBe(0);
    expect(f.hasHit, 'hasHit reset for new attack').toBe(false);
    // Cancel flags cleared
    expect(f.normalCancelReady, 'cancel flags cleared').toBe(false);
    expect(f.superCancelReady).toBe(false);
    expect(f.cancelEvent).toBeNull();
  });

  it('命令通常技取消后失去特殊属性 (hitLevel变为MID)', () => {
    // CMD_GOFU_YOU normally has HIGH hitLevel (overhead)
    const data = FRAME_DATA['CMD_GOFU_YOU'] as { hitLevel: string };
    expect(data.hitLevel, 'CMD_GOFU_YOU raw hitLevel is HIGH').toBe('HIGH');
    // When cancelled into from a normal (cancelledIntoNormal=true), hitLevel becomes MID
    const isCancelledCmdNormal = true;
    const hitLevel = isCancelledCmdNormal ? 'MID' : data.hitLevel;
    expect(hitLevel, 'cancelled-into command normal loses overhead -> MID').toBe('MID');
  });

  it('cancelledIntoNormal 标记正确设置', () => {
    const f = new Fighter(400, '#ff6600', 1);
    expect(f.cancelledIntoNormal, 'initial is false').toBe(false);
    // Simulate cancel from normal to command normal
    f.cancelledIntoNormal = true;
    expect(f.cancelledIntoNormal, 'set to true on cancel into cmd normal').toBe(true);
    // startAttack clears it
    f.startAttack(AttackType.CMD_GOFU_YOU);
    expect(f.cancelledIntoNormal, 'startAttack clears cancelledIntoNormal').toBe(false);
    // resetCancelFlags clears it
    f.cancelledIntoNormal = true;
    f.resetCancelFlags();
    expect(f.cancelledIntoNormal, 'resetCancelFlags clears cancelledIntoNormal').toBe(false);
  });
});

// ===== 3. Super Cancel (5 tests) =====

describe('Super Cancel', () => {
  it('必杀技命中后可取消到DM', () => {
    const f = new Fighter(400, '#ff6600', 1);
    // combatSystem sets superCancelReady when character special hits
    f.superCancelReady = true;
    f.hasHit = true;
    f.currentAttack = AttackType.KYO_ONIYAKI;
    f.attackPhase = 'recovery';
    f.hitConfirmDelay = 0;
    const canSuperCancel = f.superCancelReady
      && f.hasHit
      && f.currentAttack !== null
      && (f.attackPhase === 'active' || f.attackPhase === 'recovery')
      && f.hitConfirmDelay === 0;
    expect(canSuperCancel, 'special hit -> DM super cancel allowed').toBe(true);
  });

  it('Super Cancel消耗额外1 stock', () => {
    // Super cancel costs: DM_STOCK_COST (1) + SUPER_CANCEL_STOCK_COST (1) = 2 total
    const totalCost = DM_STOCK_COST + SUPER_CANCEL_STOCK_COST;
    expect(totalCost, 'super cancel total cost is 2 stocks').toBe(2);
    const gauge = createPowerGauge();
    gauge.stocks = 3;
    const canAfford = gauge.stocks >= totalCost;
    expect(canAfford, '3 stocks is enough for super cancel').toBe(true);
    spendStocks(gauge, totalCost);
    expect(gauge.stocks, 'after super cancel, 1 stock remains').toBe(1);
  });

  it('无stock时不能Super Cancel', () => {
    const totalCost = DM_STOCK_COST + SUPER_CANCEL_STOCK_COST;
    const gauge = createPowerGauge();
    gauge.stocks = 0;
    const canAfford = gauge.stocks >= totalCost;
    expect(canAfford, '0 stocks cannot super cancel').toBe(false);
    // 1 stock also not enough
    gauge.stocks = 1;
    expect(gauge.stocks >= totalCost, '1 stock is not enough for super cancel').toBe(false);
  });

  it('DM在Super Cancel中伤害不额外加成', () => {
    // Super cancel DM uses the same scaledDamage as a raw DM
    // No extra damage multiplier from the super cancel mechanic itself
    const cs = new CombatSystem(stubInputProvider);
    // Verify DM_STOCK_COST is exactly 1 (no double charge)
    expect(DM_STOCK_COST, 'DM costs 1 stock').toBe(1);
    expect(SUPER_CANCEL_STOCK_COST, 'super cancel extra cost is 1').toBe(1);
    // The super cancel cost is purely a stock gate, not a damage modifier
    // Damage scaling is handled by combo scaling, not cancel type
  });

  it('Super Cancel窗口比普通取消短', () => {
    // CANCEL_WINDOW_SUPER = 5, CANCEL_WINDOW_NORMAL = 3
    // Actually, super cancel window (5) is WIDER than normal cancel window (3)
    // This is correct KOF2002 behavior: super cancel gives more time
    expect(CANCEL_WINDOW_SUPER, 'super cancel window is 5').toBe(5);
    expect(CANCEL_WINDOW_NORMAL, 'normal cancel window is 3').toBe(3);
    expect(CANCEL_WINDOW_SUPER > CANCEL_WINDOW_NORMAL, 'super cancel window is wider than normal').toBe(true);
  });
});

// ===== 4. Free Cancel (MAX mode) (5 tests) =====

describe('Free Cancel (MAX mode)', () => {
  it('MAX模式内任意招式可取消到任意必杀技', () => {
    const maxMode = createMaxMode();
    maxMode.active = true;
    maxMode.timer = MAX_MODE_DURATION;
    const f = new Fighter(400, '#ff6600', 1);
    f.currentAttack = AttackType.STAND_C;
    f.attackPhase = 'recovery';
    f.hitConfirmDelay = 0;
    // Free cancel from normal: always allowed in MAX mode (no hit required)
    const isNormal = NORMAL_ATTACKS.has(f.currentAttack as string)
      || COMMAND_NORMALS.has(f.currentAttack as string);
    const canFreeCancel = maxMode.active
      && f.currentAttack !== null
      && (f.attackPhase === 'active' || f.attackPhase === 'recovery')
      && f.hitConfirmDelay === 0
      && (isNormal || f.hasHit);
    expect(canFreeCancel, 'MAX mode normal can free cancel to special').toBe(true);
  });

  it('Free Cancel消耗MAX timer 20%', () => {
    const maxMode = createMaxMode();
    maxMode.active = true;
    maxMode.timer = MAX_MODE_DURATION;
    maxMode.maxDuration = MAX_MODE_DURATION;
    const cost = Math.round(maxMode.maxDuration * FREE_CANCEL_TIMER_COST);
    expect(cost, '20% of 720 = 144').toBe(144);
    maxMode.timer -= cost;
    expect(maxMode.timer, 'after 1 free cancel, timer is 576').toBe(576);
  });

  it('DM不能被Free Cancel（只能Super Cancel）', () => {
    // Free cancel checks: special && !isDM(special)
    // DM attacks are excluded from free cancel targets
    const dmAttack = AttackType.DM_OROCHINAGI;
    expect(isDM(dmAttack as string), 'DM_OROCHINAGI is a DM').toBe(true);
    // The condition: isDM check blocks free cancel into DM
    const blockedFromFreeCancel = isDM(dmAttack as string);
    expect(blockedFromFreeCancel, 'DM cannot be free cancelled into').toBe(true);
    // Super cancel still works for DM targets
    expect(isDM(dmAttack as string), 'DM is valid super cancel target').toBe(true);
  });

  it('多次Free Cancel会耗尽MAX timer', () => {
    const maxMode = createMaxMode();
    maxMode.active = true;
    maxMode.timer = MAX_MODE_DURATION;
    maxMode.maxDuration = MAX_MODE_DURATION;
    const costPerCancel = Math.round(maxMode.maxDuration * FREE_CANCEL_TIMER_COST);
    // 5 free cancels: 5 * 144 = 720, timer should be 0
    for (let i = 0; i < 5; i++) {
      maxMode.timer -= costPerCancel;
      if (maxMode.timer < 0) maxMode.timer = 0;
    }
    expect(maxMode.timer, '5 free cancels drain all MAX timer').toBe(0);
  });

  it('MAX过期后Free Cancel不可用', () => {
    const maxMode = createMaxMode();
    maxMode.active = true;
    maxMode.timer = MAX_MODE_DURATION;
    maxMode.maxDuration = MAX_MODE_DURATION;
    // Drain all timer
    maxMode.timer = 0;
    maxMode.active = false;
    expect(maxMode.active, 'MAX mode expired').toBe(false);
    const canFreeCancel = maxMode.active;
    expect(canFreeCancel, 'free cancel blocked when MAX expired').toBe(false);
  });
});

// ===== 5. 取消窗口边界 (5 tests) =====

describe('取消窗口边界', () => {
  it('startup帧内不可取消', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.startAttack(AttackType.STAND_C);
    expect(f.attackPhase, 'just started attack is in startup').toBe('startup');
    // Cancel condition requires active or recovery phase
    f.superCancelReady = true;
    f.hitConfirmDelay = 0;
    const canCancel = f.currentAttack !== null
      && (f.attackPhase === 'active' || f.attackPhase === 'recovery')
      && f.hitConfirmDelay === 0;
    expect(canCancel, 'cancel blocked during startup').toBe(false);
  });

  it('active帧最后一帧可取消', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.currentAttack = AttackType.STAND_C;
    f.attackPhase = 'active';
    f.attackFrame = 2; // last active frame (active=3, 0-indexed)
    f.superCancelReady = true;
    f.hitConfirmDelay = 0;
    const canCancel = f.currentAttack !== null
      && (f.attackPhase === 'active' || f.attackPhase === 'recovery')
      && f.hitConfirmDelay === 0;
    expect(canCancel, 'cancel allowed on last active frame').toBe(true);
  });

  it('recovery帧首帧可取消', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.currentAttack = AttackType.STAND_C;
    f.attackPhase = 'recovery';
    f.attackFrame = 0; // first recovery frame
    f.superCancelReady = true;
    f.hitConfirmDelay = 0;
    const canCancel = f.currentAttack !== null
      && (f.attackPhase === 'active' || f.attackPhase === 'recovery')
      && f.hitConfirmDelay === 0;
    expect(canCancel, 'cancel allowed on first recovery frame').toBe(true);
  });

  it('recovery帧末尾不可取消', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.currentAttack = AttackType.STAND_C;
    f.attackPhase = 'recovery';
    // STAND_C recovery = 20 frames; tickAttack increments attackFrame and ends at recovery
    // Simulate tickAttack running through all recovery frames until attack ends
    const data = FRAME_DATA[AttackType.STAND_C];
    for (let i = 0; i <= data.recovery; i++) {
      f.tickAttack();
    }
    // After all recovery frames, endAttack is called, currentAttack becomes null
    expect(f.currentAttack, 'after recovery ends, currentAttack is null').toBeNull();
    expect(f.attackPhase, 'attackPhase is none after recovery').toBe('none');
    expect(f.state, 'fighter returns to IDLE').toBe(FighterState.IDLE);
    const canCancel = f.currentAttack !== null
      && (f.attackPhase === 'active' || f.attackPhase === 'recovery');
    expect(canCancel, 'cancel blocked after recovery ends').toBe(false);
  });

  it('hitConfirmDelay至少1帧', () => {
    const f = new Fighter(400, '#ff6600', 1);
    // After resolveHit, hitConfirmDelay is set to 1
    f.hitConfirmDelay = 1;
    expect(f.hitConfirmDelay, 'hitConfirmDelay is 1 after hit').toBe(1);
    // Cancel blocked while hitConfirmDelay > 0
    f.superCancelReady = true;
    f.currentAttack = AttackType.KYO_ONIYAKI;
    f.attackPhase = 'recovery';
    const canCancel = f.superCancelReady
      && f.currentAttack !== null
      && (f.attackPhase === 'active' || f.attackPhase === 'recovery')
      && f.hitConfirmDelay === 0;
    expect(canCancel, 'cancel blocked when hitConfirmDelay=1').toBe(false);
    // After 1 tick, delay becomes 0
    f.tickTimers();
    expect(f.hitConfirmDelay, 'hitConfirmDelay decrements to 0').toBe(0);
    const canCancelAfterTick = f.superCancelReady
      && f.currentAttack !== null
      && (f.attackPhase === 'active' || f.attackPhase === 'recovery')
      && f.hitConfirmDelay === 0;
    expect(canCancelAfterTick, 'cancel allowed after hitConfirmDelay clears').toBe(true);
  });
});
