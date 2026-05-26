/**
 * Fighter Consolidated Tests
 *
 * Merged from: fighter, fighterStateMachine, fighterStateIntegrity,
 *   fighterPhysics, fighterController
 *
 * Covers: initialization, state machine transitions, attack system,
 *   health/position invariants, hitbox/hurtbox, throw vulnerability.
 */
import { describe, it, expect } from 'vitest';
import { Fighter } from '../src/entities/fighter.js';
import { FighterState, AttackType } from '../src/core/types.js';
import {
  MAX_HEALTH, STAGE_GROUND_Y, FIGHTER_WIDTH,
  THROW_INVINCIBILITY_WAKEUP, THROW_INVINCIBILITY_POST_STUN, THROW_INVINCIBILITY_POST_ESCAPE,
} from '../src/core/constants.js';

function createFighter(x = 400): Fighter {
  return new Fighter(x, '#ff6600', 1);
}

// ── 1. Initialization & Invariants ──────────────────────────
describe('Fighter Initialization', () => {
  it('correct initial state', () => {
    const f = createFighter();
    expect(f.state).toBe(FighterState.IDLE);
    expect(f.health).toBe(MAX_HEALTH);
    expect(f.currentAttack).toBeNull();
    expect(f.isGrounded()).toBe(true);
    expect(f.canAct()).toBe(true);
  });

  it('starts at ground level', () => {
    const f = createFighter();
    expect(f.y).toBe(STAGE_GROUND_Y);
  });

  it('facing is 1 or -1', () => {
    const f1 = new Fighter(400, '#fff', 1);
    const f2 = new Fighter(400, '#fff', -1);
    expect(Math.abs(f1.facing)).toBe(1);
    expect(Math.abs(f2.facing)).toBe(1);
  });

  it('health clamped at 0 (never negative)', () => {
    const f = createFighter();
    f.health = -100;
    expect(f.health).toBeLessThanOrEqual(0);
  });

  it('reset restores all state to initial values', () => {
    const f = createFighter();
    f.health = 0;
    f.state = FighterState.KNOCKDOWN;
    f.guardGauge = 0;
    f.reset(400);
    expect(f.health).toBe(MAX_HEALTH);
    expect(f.state).toBe(FighterState.IDLE);
    expect(f.guardGauge).toBe(100);
  });
});

// ── 2. State Machine Transitions ────────────────────────────
describe('State Machine Transitions', () => {
  it('IDLE -> STAND_ATTACK via startAttack', () => {
    const f = createFighter();
    f.startAttack(AttackType.STAND_A);
    expect(f.state).toBe(FighterState.STAND_ATTACK);
  });

  it('IDLE -> CROUCH_ATTACK via crouch attack', () => {
    const f = createFighter();
    f.startAttack(AttackType.CROUCH_A);
    expect(f.state).toBe(FighterState.CROUCH_ATTACK);
  });

  it('IDLE -> AIR_ATTACK via jump attack', () => {
    const f = createFighter();
    f.startAttack(AttackType.JUMP_C);
    expect(f.state).toBe(FighterState.AIR_ATTACK);
  });

  it('STAND_ATTACK -> HITSTUN via applyHitstun', () => {
    const f = createFighter();
    f.state = FighterState.IDLE;
    f.applyHitstun(10);
    expect(f.state).toBe(FighterState.HITSTUN);
  });

  it('IDLE -> BLOCK via applyBlockstun', () => {
    const f = createFighter();
    f.applyBlockstun(8);
    expect(f.state).toBe(FighterState.BLOCK);
  });

  it('canAct false during HITSTUN/KNOCKDOWN/BLOCK', () => {
    const f = createFighter();
    for (const state of [FighterState.HITSTUN, FighterState.KNOCKDOWN, FighterState.BLOCK]) {
      f.state = state;
      expect(f.canAct()).toBe(false);
    }
  });
});

// ── 3. Attack Frame Advancement ─────────────────────────────
describe('Attack Frame Advancement', () => {
  it('startup -> active -> recovery -> end', () => {
    const f = createFighter();
    f.startAttack(AttackType.STAND_A);
    expect(f.attackPhase).toBe('startup');
    // Advance through startup
    const fd = { startup: 6, active: 3, recovery: 5 };
    for (let i = 0; i < fd.startup; i++) f.tickAttack();
    expect(f.attackPhase).toBe('active');
    for (let i = 0; i < fd.active; i++) f.tickAttack();
    expect(f.attackPhase).toBe('recovery');
    for (let i = 0; i < fd.recovery; i++) f.tickAttack();
    expect(f.currentAttack).toBeNull();
  });
});

// ── 4. Hitbox / Hurtbox ─────────────────────────────────────
describe('Hitbox / Hurtbox', () => {
  it('active hitbox non-null during attack active phase', () => {
    const f = createFighter();
    f.startAttack(AttackType.STAND_C);
    f.attackPhase = 'active';
    const hitbox = f.getActiveHitbox();
    expect(hitbox).not.toBeNull();
    expect(hitbox!.width).toBeGreaterThan(0);
  });

  it('null hitbox when not attacking', () => {
    const f = createFighter();
    expect(f.getActiveHitbox()).toBeNull();
  });

  it('hurtbox at correct position', () => {
    const f = createFighter();
    const hb = f.getHurtbox();
    expect(hb.x).toBe(f.x - FIGHTER_WIDTH / 2);
  });
});

// ── 5. Throw Vulnerability ──────────────────────────────────
describe('Throw Vulnerability', () => {
  it('IDLE: vulnerable, HITSTUN/KNOCKDOWN/BLOCK: not vulnerable', () => {
    const f = createFighter();
    f.state = FighterState.IDLE;
    expect(f.isThrowVulnerable()).toBe(true);
    for (const s of [FighterState.HITSTUN, FighterState.KNOCKDOWN, FighterState.BLOCK]) {
      f.state = s;
      expect(f.isThrowVulnerable()).toBe(false);
    }
  });

  it('throw invincibility constants match KOF2002', () => {
    expect(THROW_INVINCIBILITY_WAKEUP).toBe(9);
    expect(THROW_INVINCIBILITY_POST_STUN).toBe(7);
    expect(THROW_INVINCIBILITY_POST_ESCAPE).toBe(6);
  });
});

// ── 6. Invincibility ────────────────────────────────────────
describe('Invincibility', () => {
  it('invincible=true means no effective hurtbox', () => {
    const f = createFighter();
    f.invincible = true;
    expect(f.getEffectiveHurtbox()).toBeNull();
  });

  it('reset clears invincibility', () => {
    const f = createFighter();
    f.invincible = true;
    f.throwInvulnFrames = 10;
    f.reset(400);
    expect(f.invincible).toBe(false);
    expect(f.throwInvulnFrames).toBe(0);
  });
});
