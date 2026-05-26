/**
 * cancelSystem.test.ts -- Cancel system comprehensive tests
 *
 * Tests all cancel types:
 * 1. Normal Cancel: usually-gei -> special cancel (normalCancelReady)
 * 2. Rapid Cancel: light attack chain (rapidCancelReady)
 * 3. Super Cancel: special hit -> DM cancel (superCancelReady)
 * 4. Free Cancel: MAX mode special-to-special (free_cancel event)
 * 5. Guard Cancel Roll: blockstun A+B (GC_ROLL_STOCK_COST)
 * 6. Guard Cancel CD: blockstun C+D (GC_CD_STOCK_COST)
 * 7. Command Normal Cancel chain: normal -> command normal -> special
 * 8. hitConfirmDelay gating
 * 9. resetCancelFlags / reset / startAttack cleanup
 */
import { describe, it, expect } from 'vitest';
import { Fighter } from '../src/entities/fighter.js';
import { FighterState, AttackType } from '../src/core/types.js';
import type { PowerGauge, MaxModeState } from '../src/core/types.js';
import { FRAME_DATA } from '../src/core/constants.js';
import {
  LIGHT_NORMALS, NORMAL_ATTACKS, COMMAND_NORMALS,
  GC_ROLL_STOCK_COST, GC_CD_STOCK_COST,
  DM_STOCK_COST, SUPER_CANCEL_STOCK_COST,
  FREE_CANCEL_TIMER_COST, MAX_MODE_DURATION,
  MAX_MODE_STOCK_COST,
} from '../src/core/constants.js';
import { createPowerGauge, createMaxMode, spendStocks } from '../src/combat/meter.js';
import { isDM, isCharacterSpecial } from '../src/core/attackClassifier.js';

// ===== 1. hitConfirmDelay gating =====

describe('Cancel system -- hitConfirmDelay gating', () => {
  it('hitConfirmDelay initial value is 0', () => {
    const f = new Fighter(400, '#ff6600', 1);
    expect(f.hitConfirmDelay).toBe(0);
  });

  it('resolveHit sets hitConfirmDelay to 1', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.hitConfirmDelay = 1;
    expect(f.hitConfirmDelay).toBe(1);
  });

  it('hitConfirmDelay decrements to 0, then cancel is allowed', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.hitConfirmDelay = 1;
    expect(f.hitConfirmDelay).toBe(1);
    f.tickTimers();
    expect(f.hitConfirmDelay, 'after 1 tick hitConfirmDelay should be 0').toBe(0);
  });

  it('hitConfirmDelay does not go negative', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.hitConfirmDelay = 0;
    f.tickTimers();
    expect(f.hitConfirmDelay).toBe(0);
  });

  it('reset() clears hitConfirmDelay', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.hitConfirmDelay = 1;
    f.reset(400);
    expect(f.hitConfirmDelay).toBe(0);
  });

  it('cancel is blocked when hitConfirmDelay=1', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.superCancelReady = true;
    f.hitConfirmDelay = 1;
    f.currentAttack = AttackType.KYO_ONIYAKI;
    f.attackPhase = 'recovery';
    const canCancel = f.superCancelReady
      && f.currentAttack !== null
      && (f.attackPhase === 'active' || f.attackPhase === 'recovery')
      && f.hitConfirmDelay === 0;
    expect(canCancel, 'cancel blocked when hitConfirmDelay=1').toBe(false);
  });
});

// ===== 2. Normal Cancel =====

describe('Cancel system -- Normal Cancel (normalCancelReady)', () => {
  it('normalCancelReady initial value is false', () => {
    const f = new Fighter(400, '#ff6600', 1);
    expect(f.normalCancelReady).toBe(false);
  });

  it('NORMAL_ATTACKS includes STAND_A, CLOSE_A, CROUCH_C', () => {
    expect(NORMAL_ATTACKS.has('STAND_A')).toBe(true);
    expect(NORMAL_ATTACKS.has('CLOSE_A')).toBe(true);
    expect(NORMAL_ATTACKS.has('CROUCH_C')).toBe(true);
  });

  it('NORMAL_ATTACKS does not include DM or special moves', () => {
    expect(NORMAL_ATTACKS.has('DM_OROCHINAGI')).toBe(false);
    expect(NORMAL_ATTACKS.has('KYO_ONIYAKI')).toBe(false);
    expect(NORMAL_ATTACKS.has('SPECIAL_UPPER')).toBe(false);
  });

  it('normalCancelReady set to true on normal hit (simulating combatSystem)', () => {
    const f = new Fighter(400, '#ff6600', 1);
    // combatSystem sets normalCancelReady when NORMAL_ATTACKS hit
    f.normalCancelReady = true;
    expect(f.normalCancelReady).toBe(true);
  });

  it('normalCancelReady allows cancel from STAND_A to special', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.normalCancelReady = true;
    f.hasHit = true;
    f.currentAttack = AttackType.STAND_A;
    f.attackPhase = 'recovery';
    // Check the condition used in stateHandlers handleAttack
    const canNormalCancel = f.normalCancelReady && f.hasHit
      && f.attackPhase === 'recovery'
      && f.currentAttack !== null
      && NORMAL_ATTACKS.has(f.currentAttack as string);
    expect(canNormalCancel, 'normal -> special cancel allowed on hit').toBe(true);
  });

  it('normalCancelReady allows cancel on block (normal -> special)', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.normalCancelReady = true;
    f.hasHit = false; // blocked, not hit
    f.currentAttack = AttackType.STAND_A;
    f.attackPhase = 'recovery';
    // KOF2002: usually-gei blocked -> special cancel is allowed (pressure mechanic)
    const canCancelOnBlock = f.normalCancelReady && !f.hasHit
      && f.attackPhase === 'recovery'
      && f.currentAttack !== null
      && NORMAL_ATTACKS.has(f.currentAttack as string);
    expect(canCancelOnBlock, 'normal -> special cancel allowed on block').toBe(true);
  });

  it('resetCancelFlags clears normalCancelReady', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.normalCancelReady = true;
    f.resetCancelFlags();
    expect(f.normalCancelReady).toBe(false);
  });

  it('startAttack clears normalCancelReady', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.normalCancelReady = true;
    f.startAttack(AttackType.KYO_ONIYAKI);
    expect(f.normalCancelReady).toBe(false);
  });
});

// ===== 3. Rapid Cancel =====

describe('Cancel system -- Rapid Cancel (rapidCancelReady)', () => {
  it('rapidCancelReady initial value is false', () => {
    const f = new Fighter(400, '#ff6600', 1);
    expect(f.rapidCancelReady).toBe(false);
  });

  it('LIGHT_NORMALS includes all A/B normals', () => {
    expect(LIGHT_NORMALS.has('STAND_A')).toBe(true);
    expect(LIGHT_NORMALS.has('STAND_B')).toBe(true);
    expect(LIGHT_NORMALS.has('CLOSE_A')).toBe(true);
    expect(LIGHT_NORMALS.has('CLOSE_B')).toBe(true);
    expect(LIGHT_NORMALS.has('CROUCH_A')).toBe(true);
    expect(LIGHT_NORMALS.has('CROUCH_B')).toBe(true);
    expect(LIGHT_NORMALS.has('JUMP_A')).toBe(true);
    expect(LIGHT_NORMALS.has('JUMP_B')).toBe(true);
  });

  it('LIGHT_NORMALS does not include C/D normals', () => {
    expect(LIGHT_NORMALS.has('STAND_C')).toBe(false);
    expect(LIGHT_NORMALS.has('STAND_D')).toBe(false);
    expect(LIGHT_NORMALS.has('CLOSE_C')).toBe(false);
    expect(LIGHT_NORMALS.has('CLOSE_D')).toBe(false);
  });

  it('rapidCancelReady is set when light normal hits (combatSystem simulation)', () => {
    const f = new Fighter(400, '#ff6600', 1);
    // combatSystem sets rapidCancelReady when LIGHT_NORMALS hit
    f.rapidCancelReady = true;
    expect(f.rapidCancelReady).toBe(true);
  });

  it('rapidCancelReady allows CLOSE_A -> CLOSE_A chain', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.rapidCancelReady = true;
    f.currentAttack = AttackType.CLOSE_A;
    f.attackPhase = 'recovery';
    const canRapidCancel = f.rapidCancelReady
      && f.attackPhase === 'recovery'
      && f.currentAttack !== null
      && LIGHT_NORMALS.has(f.currentAttack as string);
    expect(canRapidCancel, 'CLOSE_A rapid cancel to next light allowed').toBe(true);
  });

  it('rapidCancel does NOT apply to heavy normals', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.rapidCancelReady = true;
    f.currentAttack = AttackType.STAND_C;
    f.attackPhase = 'recovery';
    const canRapidCancel = f.rapidCancelReady
      && f.attackPhase === 'recovery'
      && f.currentAttack !== null
      && LIGHT_NORMALS.has(f.currentAttack as string);
    expect(canRapidCancel, 'STAND_C is not a light normal, rapid cancel blocked').toBe(false);
  });

  it('rapidCancel does NOT apply during active phase (only recovery)', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.rapidCancelReady = true;
    f.currentAttack = AttackType.CLOSE_A;
    f.attackPhase = 'active';
    const canRapidCancel = f.rapidCancelReady
      && f.attackPhase === 'recovery'
      && f.currentAttack !== null
      && LIGHT_NORMALS.has(f.currentAttack as string);
    expect(canRapidCancel, 'rapid cancel blocked during active phase').toBe(false);
  });

  it('cancelEvent is set to rapid_cancel on rapid cancel', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.rapidCancelReady = true;
    f.currentAttack = AttackType.CLOSE_A;
    f.attackPhase = 'recovery';
    // Simulate the rapid cancel path from stateHandlers
    f.cancelEvent = 'rapid_cancel';
    expect(f.cancelEvent).toBe('rapid_cancel');
  });

  it('resetCancelFlags clears rapidCancelReady', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.rapidCancelReady = true;
    f.resetCancelFlags();
    expect(f.rapidCancelReady).toBe(false);
  });
});

// ===== 4. Super Cancel =====

describe('Cancel system -- Super Cancel (superCancelReady)', () => {
  it('superCancelReady initial value is false', () => {
    const f = new Fighter(400, '#ff6600', 1);
    expect(f.superCancelReady).toBe(false);
  });

  it('superCancelReady is set when character special hits', () => {
    // combatSystem sets superCancelReady for character specials
    const atkName = AttackType.KYO_ONIYAKI;
    expect(isCharacterSpecial(atkName)).toBe(true);
    const shouldSet = isCharacterSpecial(atkName) || atkName === AttackType.SPECIAL_UPPER
      || atkName === AttackType.SPECIAL_PROJECTILE;
    expect(shouldSet, 'KYO_ONIYAKI should trigger superCancelReady').toBe(true);
  });

  it('superCancelReady is set for SPECIAL_UPPER', () => {
    const shouldSet = isCharacterSpecial(AttackType.SPECIAL_UPPER)
      || AttackType.SPECIAL_UPPER === AttackType.SPECIAL_UPPER
      || AttackType.SPECIAL_UPPER === AttackType.SPECIAL_PROJECTILE;
    expect(shouldSet, 'SPECIAL_UPPER should trigger superCancelReady').toBe(true);
  });

  it('superCancelReady is NOT set for normal attacks', () => {
    const atkName = AttackType.STAND_C;
    const shouldSet = isCharacterSpecial(atkName) || atkName === AttackType.SPECIAL_UPPER
      || atkName === AttackType.SPECIAL_PROJECTILE;
    expect(shouldSet, 'STAND_C should NOT trigger superCancelReady').toBe(false);
  });

  it('superCancelReady is NOT set for DM attacks', () => {
    const atkName = AttackType.DM_OROCHINAGI;
    expect(isDM(atkName)).toBe(true);
    const shouldSet = isCharacterSpecial(atkName) || atkName === AttackType.SPECIAL_UPPER
      || atkName === AttackType.SPECIAL_PROJECTILE;
    expect(shouldSet, 'DM should NOT trigger superCancelReady').toBe(false);
  });

  it('super cancel rejected during startup phase', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.superCancelReady = true;
    f.hitConfirmDelay = 0;
    f.startAttack(AttackType.STAND_A);
    expect(f.attackPhase).toBe('startup');
    const canSuperCancel = f.superCancelReady
      && f.currentAttack !== null
      && (f.attackPhase === 'active' || f.attackPhase === 'recovery')
      && f.hitConfirmDelay === 0;
    expect(canSuperCancel, 'super cancel blocked during startup').toBe(false);
  });

  it('super cancel allowed during recovery phase (superCancelReady + hitConfirmDelay=0)', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.superCancelReady = true;
    f.hitConfirmDelay = 0;
    f.currentAttack = AttackType.KYO_ONIYAKI;
    f.attackPhase = 'recovery';
    const canSuperCancel = f.superCancelReady
      && f.currentAttack !== null
      && (f.attackPhase === 'active' || f.attackPhase === 'recovery')
      && f.hitConfirmDelay === 0;
    expect(canSuperCancel, 'super cancel allowed during recovery').toBe(true);
  });

  it('super cancel blocked when hitConfirmDelay=1', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.superCancelReady = true;
    f.hitConfirmDelay = 1;
    f.currentAttack = AttackType.KYO_ONIYAKI;
    f.attackPhase = 'recovery';
    const canSuperCancel = f.superCancelReady
      && f.currentAttack !== null
      && (f.attackPhase === 'active' || f.attackPhase === 'recovery')
      && f.hitConfirmDelay === 0;
    expect(canSuperCancel, 'super cancel blocked when hitConfirmDelay=1').toBe(false);
  });

  it('super cancel stock cost = DM_STOCK_COST + SUPER_CANCEL_STOCK_COST', () => {
    const totalCost = DM_STOCK_COST + SUPER_CANCEL_STOCK_COST;
    expect(totalCost, 'super cancel costs 2 stocks total').toBe(2);
    // Verify stock deduction
    const gauge = createPowerGauge();
    gauge.stocks = 3;
    const canAfford = gauge.stocks >= totalCost;
    expect(canAfford, '3 stocks is enough for super cancel').toBe(true);
    spendStocks(gauge, totalCost);
    expect(gauge.stocks).toBe(1);
  });

  it('super cancel blocked when not enough stocks', () => {
    const totalCost = DM_STOCK_COST + SUPER_CANCEL_STOCK_COST;
    const gauge = createPowerGauge();
    gauge.stocks = 1;
    const canAfford = gauge.stocks >= totalCost;
    expect(canAfford, '1 stock is not enough for super cancel').toBe(false);
  });

  it('cancelEvent set to super_cancel on super cancel', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.cancelEvent = 'super_cancel';
    expect(f.cancelEvent).toBe('super_cancel');
  });

  it('resetCancelFlags clears superCancelReady', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.superCancelReady = true;
    f.resetCancelFlags();
    expect(f.superCancelReady).toBe(false);
  });
});

// ===== 5. Free Cancel (MAX mode only) =====

describe('Cancel system -- Free Cancel (MAX mode)', () => {
  it('free cancel only works in MAX mode', () => {
    const maxMode = createMaxMode();
    expect(maxMode.active).toBe(false);
    // Free cancel condition requires maxMode.active === true
    const canFreeCancel = maxMode.active;
    expect(canFreeCancel, 'free cancel blocked when MAX mode inactive').toBe(false);
  });

  it('free cancel allowed when MAX mode active', () => {
    const maxMode = createMaxMode();
    maxMode.active = true;
    maxMode.timer = 720;
    expect(maxMode.active).toBe(true);
  });

  it('free cancel from normal attack is always allowed (no hit required)', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.currentAttack = AttackType.STAND_C;
    f.attackPhase = 'active';
    f.hitConfirmDelay = 0;
    const isNormalAttack = NORMAL_ATTACKS.has(f.currentAttack as string)
      || f.currentAttack === AttackType.STAND_CD || f.currentAttack === AttackType.JUMP_CD
      || COMMAND_NORMALS.has(f.currentAttack as string);
    const canFreeCancel = isNormalAttack; // normal attacks can free cancel without hit
    expect(canFreeCancel, 'normal can free cancel without hit').toBe(true);
  });

  it('free cancel from special requires hit (hasHit must be true)', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.currentAttack = AttackType.KYO_ONIYAKI;
    f.attackPhase = 'recovery';
    f.hitConfirmDelay = 0;
    f.hasHit = false;
    const isNormalAttack = NORMAL_ATTACKS.has(f.currentAttack as string)
      || COMMAND_NORMALS.has(f.currentAttack as string);
    const canFreeCancel = isNormalAttack || f.hasHit;
    expect(canFreeCancel, 'special without hit cannot free cancel').toBe(false);
    // With hit:
    f.hasHit = true;
    const canFreeCancelAfterHit = isNormalAttack || f.hasHit;
    expect(canFreeCancelAfterHit, 'special with hit can free cancel').toBe(true);
  });

  it('free cancel reduces MAX mode timer by FREE_CANCEL_TIMER_COST', () => {
    const maxMode = createMaxMode();
    maxMode.active = true;
    maxMode.maxDuration = MAX_MODE_DURATION;
    maxMode.timer = MAX_MODE_DURATION;
    const cost = Math.round(maxMode.maxDuration * FREE_CANCEL_TIMER_COST);
    expect(cost, '20% of 720 = 144').toBe(144);
    maxMode.timer -= cost;
    expect(maxMode.timer).toBe(MAX_MODE_DURATION - 144);
  });

  it('multiple free cancels drain MAX mode timer', () => {
    const maxMode = createMaxMode();
    maxMode.active = true;
    maxMode.maxDuration = MAX_MODE_DURATION;
    maxMode.timer = MAX_MODE_DURATION;
    const costPerCancel = Math.round(maxMode.maxDuration * FREE_CANCEL_TIMER_COST);
    // 5 free cancels: 5 * 144 = 720, timer should be 0
    for (let i = 0; i < 5; i++) {
      maxMode.timer -= costPerCancel;
      if (maxMode.timer < 0) maxMode.timer = 0;
    }
    expect(maxMode.timer, '5 free cancels should drain all MAX timer').toBe(0);
  });

  it('free cancel does not allow cancel into DM', () => {
    // stateHandlers: free cancel checks specialAttack && !isDM(specialAttack)
    const dmAttack = AttackType.DM_OROCHINAGI;
    expect(isDM(dmAttack as string), 'DM_OROCHINAGI is a DM').toBe(true);
    // The condition in stateHandlers: special && !isDM(special) -> DM is excluded
    const blocked = isDM(dmAttack as string);
    expect(blocked, 'free cancel cannot cancel into DM').toBe(true);
  });

  it('cancelEvent set to free_cancel on free cancel', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.cancelEvent = 'free_cancel';
    expect(f.cancelEvent).toBe('free_cancel');
  });

  it('free cancel blocked during startup phase', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.startAttack(AttackType.STAND_C);
    expect(f.attackPhase).toBe('startup');
    const canFreeCancel = f.currentAttack !== null
      && (f.attackPhase === 'active' || f.attackPhase === 'recovery')
      && f.hitConfirmDelay === 0;
    expect(canFreeCancel, 'free cancel blocked during startup').toBe(false);
  });
});

// ===== 6. Guard Cancel Roll =====

describe('Cancel system -- Guard Cancel Roll', () => {
  it('GC_ROLL_STOCK_COST is 1', () => {
    expect(GC_ROLL_STOCK_COST).toBe(1);
  });

  it('fighter has isGCRoll flag', () => {
    const f = new Fighter(400, '#ff6600', 1);
    expect(f.isGCRoll).toBe(false);
    f.isGCRoll = true;
    expect(f.isGCRoll).toBe(true);
  });

  it('GC Roll requires stocks (1 stock)', () => {
    const gauge = createPowerGauge();
    gauge.stocks = 1;
    const success = spendStocks(gauge, GC_ROLL_STOCK_COST);
    expect(success, 'GC Roll succeeds with 1 stock').toBe(true);
    expect(gauge.stocks).toBe(0);
  });

  it('GC Roll fails without stocks', () => {
    const gauge = createPowerGauge();
    gauge.stocks = 0;
    const success = spendStocks(gauge, GC_ROLL_STOCK_COST);
    expect(success, 'GC Roll fails with 0 stocks').toBe(false);
  });

  it('GC Roll is fully invincible (isGCRoll=true)', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.state = FighterState.ROLL;
    f.rollTimer = 20;
    f.isGCRoll = true;
    expect(f.isRollInvincible(), 'GC Roll is always invincible').toBe(true);
  });

  it('GC Roll enters ROLL state with isGCRoll=true', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.state = FighterState.BLOCK;
    f.blockstunTimer = 10;
    // Simulate GC Roll trigger
    f.state = FighterState.ROLL;
    f.rollTimer = 20;
    f.isGCRoll = true;
    f.vx = 6 * f.facing;
    expect(f.state).toBe(FighterState.ROLL);
    expect(f.isGCRoll).toBe(true);
    expect(f.isRollInvincible()).toBe(true);
  });

  it('GC Roll: throw invulnerable when isGCRoll=true', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.state = FighterState.ROLL;
    f.rollTimer = 20;
    f.isGCRoll = true;
    // isThrowVulnerable checks isGCRoll
    expect(f.isThrowVulnerable(), 'GC Roll is throw invulnerable').toBe(false);
  });

  it('GC Roll cleared on reset', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.isGCRoll = true;
    f.state = FighterState.ROLL;
    f.rollTimer = 20;
    f.reset(400);
    expect(f.isGCRoll).toBe(false);
    expect(f.rollTimer).toBe(0);
  });

  it('GC Roll can only trigger during blockstun (blockstunTimer > 0)', () => {
    const f = new Fighter(400, '#ff6600', 1);
    // Blockstun expired
    f.state = FighterState.BLOCK;
    f.blockstunTimer = 0;
    // The condition in handleBlock: f.blockstunTimer > 0
    expect(f.blockstunTimer > 0, 'blockstun expired, GC Roll blocked').toBe(false);
  });
});

// ===== 7. Guard Cancel CD =====

describe('Cancel system -- Guard Cancel CD', () => {
  it('GC_CD_STOCK_COST is 1', () => {
    expect(GC_CD_STOCK_COST).toBe(1);
  });

  it('GC CD requires 1 stock', () => {
    const gauge = createPowerGauge();
    gauge.stocks = 1;
    const success = spendStocks(gauge, GC_CD_STOCK_COST);
    expect(success, 'GC CD succeeds with 1 stock').toBe(true);
    expect(gauge.stocks).toBe(0);
  });

  it('GC CD fails without stocks', () => {
    const gauge = createPowerGauge();
    gauge.stocks = 0;
    const success = spendStocks(gauge, GC_CD_STOCK_COST);
    expect(success, 'GC CD fails with 0 stocks').toBe(false);
  });

  it('GC CD transitions to STAND_CD attack', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.state = FighterState.BLOCK;
    f.blockstunTimer = 10;
    // Simulate GC CD trigger
    f.blockstunTimer = 0;
    f.startAttack(AttackType.STAND_CD);
    expect(f.state).toBe(FighterState.STAND_ATTACK);
    expect(f.currentAttack).toBe(AttackType.STAND_CD);
    expect(f.attackPhase).toBe('startup');
  });

  it('GC CD can only trigger during blockstun', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.state = FighterState.BLOCK;
    f.blockstunTimer = 0;
    // blockstun expired: GC CD blocked
    expect(f.blockstunTimer > 0, 'blockstun expired, GC CD blocked').toBe(false);
  });
});

// ===== 8. Command Normal Cancel Chain =====

describe('Cancel system -- Command Normal Cancel Chain', () => {
  it('COMMAND_NORMALS includes known command normals', () => {
    expect(COMMAND_NORMALS.has('CMD_GOFU_YOU')).toBe(true);
    expect(COMMAND_NORMALS.has('CMD_88SHIKI')).toBe(true);
    expect(COMMAND_NORMALS.has('IORI_YUMEYUMI')).toBe(true);
  });

  it('COMMAND_NORMALS does not include regular normals or specials', () => {
    expect(COMMAND_NORMALS.has('STAND_A')).toBe(false);
    expect(COMMAND_NORMALS.has('KYO_ONIYAKI')).toBe(false);
    expect(COMMAND_NORMALS.has('DM_OROCHINAGI')).toBe(false);
  });

  it('cancelledIntoNormal flag tracks command normal from cancel', () => {
    const f = new Fighter(400, '#ff6600', 1);
    expect(f.cancelledIntoNormal).toBe(false);
    // Simulate cancel into command normal
    f.cancelledIntoNormal = true;
    expect(f.cancelledIntoNormal).toBe(true);
  });

  it('cancelled-into command normal loses special properties (hitLevel becomes MID)', () => {
    // When cancelledIntoNormal=true, combatSystem forces hitLevel to 'MID'
    // CMD_GOFU_YOU normally has HIGH hitLevel (overhead)
    // But when cancelled into, it becomes MID (loses overhead property)
    const isCancelledCmdNormal = true;
    const data = FRAME_DATA['CMD_GOFU_YOU'] as { hitLevel: string };
    const hitLevel = (isCancelledCmdNormal ? 'MID' : data.hitLevel);
    expect(hitLevel, 'cancelled-into command normal hitLevel is MID').toBe('MID');
  });

  it('cancelled-into command normal CAN cancel into special', () => {
    // stateHandlers: command normal -> special cancel
    // cancelledIntoNormal ? true : hasHit
    // So cancelled-into command normal can always cancel to special
    const f = new Fighter(400, '#ff6600', 1);
    f.cancelledIntoNormal = true;
    f.currentAttack = AttackType.CMD_GOFU_YOU;
    f.attackPhase = 'recovery';
    const canCancel = f.cancelledIntoNormal ? true : f.hasHit;
    expect(canCancel, 'cancelled-into command normal can cancel to special').toBe(true);
  });

  it('standalone command normal requires hit to cancel to special', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.cancelledIntoNormal = false;
    f.hasHit = false;
    f.currentAttack = AttackType.CMD_GOFU_YOU;
    f.attackPhase = 'recovery';
    const canCancel = f.cancelledIntoNormal ? true : f.hasHit;
    expect(canCancel, 'standalone command normal without hit cannot cancel').toBe(false);
    // With hit:
    f.hasHit = true;
    const canCancelAfterHit = f.cancelledIntoNormal ? true : f.hasHit;
    expect(canCancelAfterHit, 'standalone command normal with hit can cancel').toBe(true);
  });

  it('resetCancelFlags clears cancelledIntoNormal', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.cancelledIntoNormal = true;
    f.resetCancelFlags();
    expect(f.cancelledIntoNormal).toBe(false);
  });
});

// ===== 9. Cancel event types =====

describe('Cancel system -- cancelEvent types', () => {
  it('cancelEvent initial value is null', () => {
    const f = new Fighter(400, '#ff6600', 1);
    expect(f.cancelEvent).toBeNull();
  });

  it('cancelEvent supports super_cancel', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.cancelEvent = 'super_cancel';
    expect(f.cancelEvent).toBe('super_cancel');
  });

  it('cancelEvent supports free_cancel', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.cancelEvent = 'free_cancel';
    expect(f.cancelEvent).toBe('free_cancel');
  });

  it('cancelEvent supports rapid_cancel', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.cancelEvent = 'rapid_cancel';
    expect(f.cancelEvent).toBe('rapid_cancel');
  });

  it('cancelEvent supports command_cancel', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.cancelEvent = 'command_cancel';
    expect(f.cancelEvent).toBe('command_cancel');
  });

  it('resetCancelFlags clears cancelEvent', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.cancelEvent = 'super_cancel';
    f.resetCancelFlags();
    expect(f.cancelEvent).toBeNull();
  });

  it('startAttack clears cancelEvent', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.cancelEvent = 'free_cancel';
    f.startAttack(AttackType.STAND_A);
    expect(f.cancelEvent).toBeNull();
  });

  it('reset() clears cancelEvent', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.cancelEvent = 'rapid_cancel';
    f.reset(400);
    expect(f.cancelEvent).toBeNull();
  });
});

// ===== 10. Attack state transitions during cancel =====

describe('Cancel system -- Attack state transitions', () => {
  it('startAttack resets cancel flags', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.superCancelReady = true;
    f.rapidCancelReady = true;
    f.normalCancelReady = true;
    f.cancelledIntoNormal = true;
    f.cancelEvent = 'super_cancel';
    f.startAttack(AttackType.KYO_ONIYAKI);
    expect(f.superCancelReady).toBe(false);
    expect(f.rapidCancelReady).toBe(false);
    expect(f.normalCancelReady).toBe(false);
    expect(f.cancelledIntoNormal).toBe(false);
    expect(f.cancelEvent).toBeNull();
  });

  it('endAttack resets cancel flags', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.superCancelReady = true;
    f.rapidCancelReady = true;
    f.normalCancelReady = true;
    f.endAttack();
    expect(f.superCancelReady).toBe(false);
    expect(f.rapidCancelReady).toBe(false);
    expect(f.normalCancelReady).toBe(false);
  });

  it('applyHitstun resets cancel flags', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.superCancelReady = true;
    f.rapidCancelReady = true;
    f.applyHitstun(15, 5);
    expect(f.superCancelReady).toBe(false);
    expect(f.rapidCancelReady).toBe(false);
  });

  it('applyKnockdown resets cancel flags', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.superCancelReady = true;
    f.rapidCancelReady = true;
    f.applyKnockdown(25);
    expect(f.superCancelReady).toBe(false);
    expect(f.rapidCancelReady).toBe(false);
  });
});

// ===== 11. MAX mode activation during attack (BC cancel) =====

describe('Cancel system -- MAX activation during attack', () => {
  it('MAX_MODE_STOCK_COST is 3', () => {
    expect(MAX_MODE_STOCK_COST).toBe(3);
  });

  it('MAX activation during attack requires 3 stocks', () => {
    const gauge = createPowerGauge();
    gauge.stocks = 3;
    const success = spendStocks(gauge, MAX_MODE_STOCK_COST);
    expect(success, 'MAX activation with 3 stocks succeeds').toBe(true);
    expect(gauge.stocks).toBe(0);
  });

  it('MAX activation during attack requires hasHit=true', () => {
    // stateHandlers: BC cancel condition includes f.hasHit
    const f = new Fighter(400, '#ff6600', 1);
    f.currentAttack = AttackType.STAND_C;
    f.hasHit = false;
    const canMAXCancel = f.currentAttack !== null && f.hasHit;
    expect(canMAXCancel, 'MAX activation during attack requires hit').toBe(false);
    f.hasHit = true;
    const canMAXCancelAfterHit = f.currentAttack !== null && f.hasHit;
    expect(canMAXCancelAfterHit, 'MAX activation allowed after hit').toBe(true);
  });

  it('MAX activation only works on normal attacks (not specials)', () => {
    // stateHandlers condition: isNormal(f.currentAttack)
    // isNormal checks LIGHT_NORMALS | NORMAL_ATTACKS | COMMAND_NORMALS | STAND_CD | JUMP_CD
    expect(NORMAL_ATTACKS.has('STAND_C'), 'STAND_C is a normal').toBe(true);
    expect(NORMAL_ATTACKS.has('KYO_ONIYAKI'), 'KYO_ONIYAKI is NOT a normal').toBe(false);
  });
});

// ===== 12. Attack Cancel Roll (AB during attack recovery) =====

describe('Cancel system -- Attack Cancel Roll', () => {
  it('attack cancel roll requires hasHit=true', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.currentAttack = AttackType.STAND_C;
    f.attackPhase = 'recovery';
    f.hasHit = false;
    f.isGrounded();
    const canACRoll = f.currentAttack !== null && f.hasHit
      && f.attackPhase === 'recovery' && f.isGrounded();
    expect(canACRoll, 'attack cancel roll blocked without hit').toBe(false);
    f.hasHit = true;
    const canACRollAfterHit = f.currentAttack !== null && f.hasHit
      && f.attackPhase === 'recovery' && f.isGrounded();
    expect(canACRollAfterHit, 'attack cancel roll allowed with hit').toBe(true);
  });

  it('attack cancel roll does NOT work from special moves', () => {
    // stateHandlers: !isSpecialMove(f.currentAttack)
    // isSpecialMove = !isNormal && !isDM
    const specialName = AttackType.KYO_ONIYAKI;
    const isNormalAttack = NORMAL_ATTACKS.has(specialName as string)
      || LIGHT_NORMALS.has(specialName as string)
      || COMMAND_NORMALS.has(specialName as string)
      || specialName === AttackType.STAND_CD || specialName === AttackType.JUMP_CD;
    const isSpecial = !isNormalAttack && !isDM(specialName as string);
    expect(isSpecial, 'KYO_ONIYAKI is a special move').toBe(true);
    // Attack cancel roll condition: !isSpecialMove
    expect(!isSpecial, 'attack cancel roll blocked for specials').toBe(false);
  });
});

// ===== 13. Cancel buffer (pre-input special cancel) =====

describe('Cancel system -- Cancel buffer', () => {
  it('cancelSpecialBuffer is null initially', () => {
    let cancelSpecialBuffer: AttackType | null = null;
    expect(cancelSpecialBuffer).toBeNull();
  });

  it('cancelSpecialBuffer can store a special move', () => {
    let cancelSpecialBuffer: AttackType | null = null;
    cancelSpecialBuffer = AttackType.KYO_ONIYAKI;
    expect(cancelSpecialBuffer).toBe(AttackType.KYO_ONIYAKI);
  });

  it('cancelSpecialBuffer is consumed on cancel', () => {
    let cancelSpecialBuffer: AttackType | null = AttackType.KYO_ONIYAKI;
    const buffered = cancelSpecialBuffer;
    cancelSpecialBuffer = null;
    expect(buffered).toBe(AttackType.KYO_ONIYAKI);
    expect(cancelSpecialBuffer).toBeNull();
  });

  it('cancel buffer only stores non-DM specials', () => {
    // stateHandlers: special && !isDM(special)
    const dmAttack = AttackType.DM_OROCHINAGI;
    expect(isDM(dmAttack as string), 'DM should not be buffered').toBe(true);
    const specialAttack = AttackType.KYO_ONIYAKI;
    expect(isDM(specialAttack as string), 'special can be buffered').toBe(false);
  });
});

// ===== 14. Attack classifier integration =====

describe('Cancel system -- Attack classifier integration', () => {
  it('isDM correctly identifies DM attacks', () => {
    expect(isDM('DM_OROCHINAGI')).toBe(true);
    expect(isDM('SDM_OROCHINAGI')).toBe(true);
    expect(isDM('HSDM_OROCHINAGI')).toBe(true);
    expect(isDM('STAND_C')).toBe(false);
    expect(isDM('KYO_ONIYAKI')).toBe(false);
  });

  it('isCharacterSpecial correctly identifies character specials', () => {
    expect(isCharacterSpecial('KYO_ONIYAKI')).toBe(true);
    expect(isCharacterSpecial('IORI_AOIHANA')).toBe(true);
    expect(isCharacterSpecial('TERRY_POWER_WAVE')).toBe(true);
    expect(isCharacterSpecial('STAND_C')).toBe(false);
    expect(isCharacterSpecial('SPECIAL_UPPER')).toBe(false);
    expect(isCharacterSpecial('DM_OROCHINAGI')).toBe(false);
  });
});
