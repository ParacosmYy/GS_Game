/**
 * ryoKooukenProjectile.test.ts — Ryo Ko'ou Ken projectile entity tests
 *
 * Covers RYO_KOOU (weak) and RYO_KOOU_C (strong) projectile spawning,
 * movement, hitbox dimensions, damage, duration, collision, and edge cases.
 * 15 test cases.
 */
import { describe, it, expect } from 'vitest';
import { Projectile } from '../src/entities/projectile.js';
import { Fighter } from '../src/entities/fighter.js';
import {
  PROJECTILE_SPEED,
  FRAME_DATA,
  MAX_HEALTH,
  CHIP_DAMAGE_RATIO,
} from '../src/core/constants.js';
import { AttackType, FighterState } from '../src/core/types.js';
import { resolveProjectileHits } from '../src/combat/projectileResolver.js';
import type { ProjectileResolverContext, HitCallback } from '../src/combat/projectileResolver.js';
import type { IInputProvider } from '../src/input/inputProvider.js';
import type { PlayerInput } from '../src/core/types.js';
import { createPrevAttack } from '../src/input/inputResolver.js';

// ===== Test helpers =====

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

function createResolverContext(
  overrides: Partial<ProjectileResolverContext> = {},
): ProjectileResolverContext {
  return {
    inputProvider: createInputProvider(),
    prev: [createPrevAttack(), createPrevAttack()],
    comboHits: [0, 0],
    lastHitFrame: [0, 0],
    currentFrame: 0,
    maxModes: [false, false],
    onGuardCrush: null,
    scaledDamage: (base: number) => base,
    ...overrides,
  };
}

// Ryo Ko'ou Ken weak projectile constructor helper
function createKooukenWeak(ownerId: number = 0, x: number = 300, facing: 1 | -1 = 1): Projectile {
  return new Projectile(x, 410, facing, 60, ownerId, 'ryo', 20, 15);
}

// Ryo Ko'ou Ken strong projectile constructor helper
function createKooukenStrong(ownerId: number = 0, x: number = 300, facing: 1 | -1 = 1): Projectile {
  return new Projectile(x, 410, facing, 60, ownerId, 'ryo', 25, 17.5);
}

function createFighterPair(): [Fighter, Fighter] {
  const p1 = new Fighter(300, '#dd6600', 1);
  p1.charId = 'ryo';
  const p2 = new Fighter(700, '#0000ff', -1);
  p2.charId = 'kyo';
  return [p1, p2];
}

// ===== Tests =====

describe('Ryo Ko\'ou Ken Projectile: Spawning', () => {
  it('RYO_KOOU spawns a projectile entity with correct properties', () => {
    const proj = createKooukenWeak();
    expect(proj.active).toBe(true);
    expect(proj.ownerId).toBe(0);
    expect(proj.facing).toBe(1);
    expect(proj.charId).toBe('ryo');
    expect(proj.vx).toBe(PROJECTILE_SPEED);
    expect(proj.activeFrames).toBe(60);
    expect(proj.currentFrame).toBe(0);
  });

  it('RYO_KOOU_C spawns a stronger/larger projectile', () => {
    const weak = createKooukenWeak();
    const strong = createKooukenStrong();

    // Both have same duration and speed
    expect(strong.activeFrames).toBe(weak.activeFrames);
    expect(strong.vx).toBe(weak.vx);

    // Strong has larger hitbox
    expect(strong.hitboxW).toBeGreaterThan(weak.hitboxW);
    expect(strong.hitboxH).toBeGreaterThan(weak.hitboxH);
  });

  it('weak projectile hitbox is 40x30 (hitW=20, hitH=15)', () => {
    const proj = createKooukenWeak();
    const hb = proj.getHitbox()!;
    expect(hb.width).toBe(40);  // 20 * 2
    expect(hb.height).toBe(30); // 15 * 2
  });

  it('strong projectile hitbox is 50x35 (hitW=25, hitH=17.5)', () => {
    const proj = createKooukenStrong();
    const hb = proj.getHitbox()!;
    expect(hb.width).toBe(50);  // 25 * 2
    expect(hb.height).toBe(35); // 17.5 * 2
  });
});

describe('Ryo Ko\'ou Ken Projectile: Movement', () => {
  it('projectile moves forward at correct speed (8 px/frame)', () => {
    const proj = createKooukenWeak();
    const startX = proj.x;
    proj.update();
    expect(proj.x).toBe(startX + PROJECTILE_SPEED);
    expect(proj.currentFrame).toBe(1);

    proj.update();
    expect(proj.x).toBe(startX + 2 * PROJECTILE_SPEED);
    expect(proj.currentFrame).toBe(2);
  });

  it('projectile moves left when facing=-1', () => {
    const proj = createKooukenWeak(1, 700, -1);
    const startX = proj.x;
    proj.update();
    expect(proj.x).toBe(startX - PROJECTILE_SPEED);
  });

  it('projectile travels approximately 480px over its lifetime (60 frames * 8px)', () => {
    const proj = createKooukenWeak(0, 300);
    const startX = proj.x;
    for (let i = 0; i < 60; i++) {
      if (!proj.active) break;
      proj.update();
    }
    // At frame 60, it deactivates; it moved 59 frames of actual travel
    // (deactivation happens after position update at frame 60)
    expect(proj.x).toBe(startX + 60 * PROJECTILE_SPEED);
    expect(proj.active).toBe(false);
  });
});

describe('Ryo Ko\'ou Ken Projectile: Duration', () => {
  it('projectile expires after 60 frames', () => {
    const proj = createKooukenWeak();
    expect(proj.active).toBe(true);

    for (let i = 0; i < 59; i++) {
      proj.update();
    }
    expect(proj.currentFrame).toBe(59);
    expect(proj.active).toBe(true);

    proj.update(); // frame 60
    expect(proj.currentFrame).toBe(60);
    expect(proj.active).toBe(false);
  });

  it('projectile deactivates at stage boundaries', () => {
    // Place near right boundary (1600)
    const proj = new Projectile(1590, 410, 1, 60, 0, 'ryo', 20, 15);
    proj.update(); // x = 1590 + 8 = 1598
    expect(proj.active).toBe(true);
    proj.update(); // x = 1598 + 8 = 1606 > 1600
    expect(proj.active).toBe(false);
  });
});

describe('Ryo Ko\'ou Ken Projectile: Collision', () => {
  it('projectile collides with opponent hurtbox', () => {
    const [p1, p2] = createFighterPair();
    // Place projectile directly on p2
    const proj = createKooukenWeak(0, p2.x, 1);
    proj.y = p2.y - 100;
    const ctx = createResolverContext();
    const initialHealth = p2.health;

    resolveProjectileHits(p1, p2, [proj], undefined, ctx);

    expect(p2.health).toBeLessThan(initialHealth);
    expect(proj.active).toBe(false);
    expect(p2.state).toBe(FighterState.HITSTUN);
  });

  it('on hit, projectile applies damage from FRAME_DATA.SPECIAL_PROJECTILE', () => {
    const [p1, p2] = createFighterPair();
    const proj = createKooukenWeak(0, p2.x, 1);
    proj.y = p2.y - 100;
    const ctx = createResolverContext();
    const initialHealth = p2.health;

    resolveProjectileHits(p1, p2, [proj], undefined, ctx);

    const expectedDamage = FRAME_DATA.SPECIAL_PROJECTILE.damage;
    expect(p2.health).toBe(initialHealth - expectedDamage);
  });

  it('on hit, projectile applies hitstun', () => {
    const [p1, p2] = createFighterPair();
    const proj = createKooukenWeak(0, p2.x, 1);
    proj.y = p2.y - 100;
    const ctx = createResolverContext();

    resolveProjectileHits(p1, p2, [proj], undefined, ctx);

    expect(p2.state).toBe(FighterState.HITSTUN);
    expect(p2.hitstunTimer).toBeGreaterThan(0);
  });

  it('projectile is destroyed on hit', () => {
    const [p1, p2] = createFighterPair();
    const proj = createKooukenWeak(0, p2.x, 1);
    proj.y = p2.y - 100;
    const ctx = createResolverContext();

    resolveProjectileHits(p1, p2, [proj], undefined, ctx);

    expect(proj.active).toBe(false);
    expect(proj.getHitbox()).toBeNull();
  });

  it('projectile does NOT damage the attacker', () => {
    const [p1, p2] = createFighterPair();
    // Place projectile on top of P1 (the owner)
    const proj = createKooukenWeak(0, p1.x, 1);
    proj.y = p1.y - 100;
    const ctx = createResolverContext();
    const initialHealth = p1.health;

    resolveProjectileHits(p1, p2, [proj], undefined, ctx);

    // P1 should not be hit — projectile skips owner
    expect(p1.health).toBe(initialHealth);
    expect(proj.active).toBe(true); // Projectile didn't hit anyone, still active
  });

  it('on block, projectile deals chip damage and is destroyed', () => {
    const [p1, p2] = createFighterPair();
    const proj = createKooukenWeak(0, p2.x, 1);
    proj.y = p2.y - 100;
    // P2 presses back (facing=-1, so right=true means back)
    const blockInput = createInputProvider({}, { right: true });
    const ctx = createResolverContext({ inputProvider: blockInput });
    const initialHealth = p2.health;

    resolveProjectileHits(p1, p2, [proj], undefined, ctx);

    const projData = FRAME_DATA.SPECIAL_PROJECTILE;
    const expectedChip = projData.chipDamage ?? Math.round(projData.damage * CHIP_DAMAGE_RATIO);
    expect(p2.health).toBe(Math.max(1, initialHealth - expectedChip));
    expect(proj.active).toBe(false);
  });

  it('projectile fires onHit callback with SPECIAL_PROJECTILE type', () => {
    const [p1, p2] = createFighterPair();
    const proj = createKooukenWeak(0, p2.x, 1);
    proj.y = p2.y - 100;
    const ctx = createResolverContext();

    let receivedAttackType: AttackType | null = null;
    let receivedBlocked: boolean | null = null;
    const onHit: HitCallback = (_a, _d, attackType, blocked) => {
      receivedAttackType = attackType;
      receivedBlocked = blocked;
    };

    resolveProjectileHits(p1, p2, [proj], onHit, ctx);

    expect(receivedAttackType).toBe(AttackType.SPECIAL_PROJECTILE);
    expect(receivedBlocked).toBe(false);
  });
});
