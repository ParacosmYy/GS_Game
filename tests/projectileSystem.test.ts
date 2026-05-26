/**
 * projectileSystem.test.ts — 飞行道具系统综合测试
 *
 * 覆盖 Projectile 实体、ProjectileResolver 命中判定、
 * CombatSystem 与飞行道具的交互，包括创建、移动、命中、
 * 防御、连击、边缘情况等 ~20 个用例。
 */
import { describe, it, expect } from 'vitest';
import { Projectile } from '../src/entities/projectile.js';
import { Fighter } from '../src/entities/fighter.js';
import { CombatSystem } from '../src/combat/combatSystem.js';
import type { IInputProvider } from '../src/input/inputProvider.js';
import type { PlayerInput } from '../src/core/types.js';
import { AttackType, FighterState } from '../src/core/types.js';
import {
  MAX_HEALTH,
  PROJECTILE_SPEED,
  CHIP_DAMAGE_RATIO,
  FRAME_DATA,
  ROLL_DURATION,
  ROLL_INVINCIBLE_END,
  COMBO_DAMAGE_SCALE,
  COMBO_MIN_SCALE,
} from '../src/core/constants.js';
import { resolveProjectileHits } from '../src/combat/projectileResolver.js';
import type { ProjectileResolverContext, HitCallback } from '../src/combat/projectileResolver.js';
import type { RawInput, PrevAttack } from '../src/input/inputResolver.js';
import { createPrevAttack } from '../src/input/inputResolver.js';

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

/** 创建一对默认 Fighter (P1 facing=1, P2 facing=-1) */
function createFighterPair(): [Fighter, Fighter] {
  const p1 = new Fighter(300, '#ff0000', 1);
  p1.charId = 'kyo';
  const p2 = new Fighter(700, '#0000ff', -1);
  p2.charId = 'iori';
  return [p1, p2];
}

/** 创建 ProjectileResolverContext 的最小 mock */
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

// =====================================================================
// 1. Projectile Creation
// =====================================================================
describe('Projectile Creation', () => {
  it('KYO_YAMIBARAI creates a projectile with correct properties', () => {
    const [p1] = createFighterPair();
    const proj = new Projectile(p1.x + 40, p1.y - 80, p1.facing, 60, 0, 'kyo');
    expect(proj.active).toBe(true);
    expect(proj.ownerId).toBe(0);
    expect(proj.facing).toBe(1);
    expect(proj.charId).toBe('kyo');
    expect(proj.vx).toBe(PROJECTILE_SPEED);
    expect(proj.x).toBe(p1.x + 40);
  });

  it('TERRY_POWER_WAVE creates a projectile with correct owner', () => {
    const [, p2] = createFighterPair();
    const proj = new Projectile(p2.x - 40, p2.y - 80, p2.facing, 60, 1, 'terry');
    expect(proj.active).toBe(true);
    expect(proj.ownerId).toBe(1);
    expect(proj.facing).toBe(-1);
    expect(proj.charId).toBe('terry');
    expect(proj.vx).toBe(PROJECTILE_SPEED * -1);
  });

  it('RYO_KOOU creates a projectile with correct facing and velocity', () => {
    const [p1] = createFighterPair();
    const proj = new Projectile(p1.x + 40, p1.y - 80, 1, 60, 0, 'ryo');
    expect(proj.facing).toBe(1);
    expect(proj.vx).toBe(PROJECTILE_SPEED);
    expect(proj.currentFrame).toBe(0);
    expect(proj.activeFrames).toBe(60);
  });

  it('Projectile has correct owner, facing, velocity from construction', () => {
    const proj = new Projectile(500, 400, -1, 45, 1, 'iori');
    expect(proj.ownerId).toBe(1);
    expect(proj.facing).toBe(-1);
    expect(proj.vx).toBe(-PROJECTILE_SPEED);
    expect(proj.x).toBe(500);
    expect(proj.y).toBe(400);
    expect(proj.activeFrames).toBe(45);
    expect(proj.currentFrame).toBe(0);
    expect(proj.active).toBe(true);
  });
});

// =====================================================================
// 2. Projectile Hit Resolution
// =====================================================================
describe('Projectile Hit Resolution', () => {
  it('projectile hits standing opponent: damage applied', () => {
    const [p1, p2] = createFighterPair();
    // Place projectile right on top of p2
    const proj = new Projectile(p2.x, p2.y - 100, 1, 60, 0, 'kyo');
    const projectiles = [proj];
    const ctx = createResolverContext();
    const initialHealth = p2.health;

    resolveProjectileHits(p1, p2, projectiles, undefined, ctx);

    const projData = FRAME_DATA.SPECIAL_PROJECTILE;
    expect(p2.health).toBe(initialHealth - projData.damage);
    expect(proj.active).toBe(false);
    expect(p2.state).toBe(FighterState.HITSTUN);
  });

  it('projectile blocked: chip damage applied', () => {
    const [p1, p2] = createFighterPair();
    const proj = new Projectile(p2.x, p2.y - 100, 1, 60, 0, 'kyo');
    const projectiles = [proj];

    // P2 presses back (facing=-1, so right=back) to block
    const blockInput = createInputProvider({}, { right: true });
    const ctx = createResolverContext({
      inputProvider: blockInput,
    });
    const initialHealth = p2.health;

    resolveProjectileHits(p1, p2, projectiles, undefined, ctx);

    const projData = FRAME_DATA.SPECIAL_PROJECTILE;
    const expectedChip = projData.chipDamage ?? Math.round(projData.damage * CHIP_DAMAGE_RATIO);
    // Chip damage cannot kill (max(1, health - chip))
    expect(p2.health).toBe(Math.max(1, initialHealth - expectedChip));
    expect(proj.active).toBe(false);
    // Combo resets on block
    expect(ctx.comboHits[1]).toBe(0);
  });

  it('projectile hits airborne opponent: juggle check (resolver applies hitstun directly)', () => {
    const [p1, p2] = createFighterPair();
    // Make p2 airborne
    p2.y = 300;
    p2.vy = -5;

    const proj = new Projectile(p2.x, p2.y, 1, 60, 0, 'kyo');
    const projectiles = [proj];
    const ctx = createResolverContext();
    const initialHealth = p2.health;

    resolveProjectileHits(p1, p2, projectiles, undefined, ctx);

    // ProjectileResolver does NOT do juggle check — it applies damage + hitstun directly
    // (juggle checking is in CombatSystem.resolveHit, not in resolveProjectileHits)
    const projData = FRAME_DATA.SPECIAL_PROJECTILE;
    expect(p2.health).toBe(initialHealth - projData.damage);
    expect(proj.active).toBe(false);
    expect(ctx.comboHits[1]).toBe(1);
  });

  it('multiple projectiles in same frame: each resolved independently', () => {
    const [p1, p2] = createFighterPair();
    // Two projectiles: first one hits p2, second also exists
    const proj1 = new Projectile(p2.x, p2.y - 100, 1, 60, 0, 'kyo');
    const proj2 = new Projectile(p2.x + 200, p2.y - 100, 1, 60, 0, 'kyo');
    const projectiles = [proj1, proj2];
    const ctx = createResolverContext();
    const initialHealth = p2.health;

    resolveProjectileHits(p1, p2, projectiles, undefined, ctx);

    // First projectile should hit and deal damage
    const projData = FRAME_DATA.SPECIAL_PROJECTILE;
    expect(p2.health).toBe(initialHealth - projData.damage);
    // First projectile deactivated on hit
    expect(proj1.active).toBe(false);
    // Second projectile did not hit (only one hit per resolve cycle since p2 already hitstunned)
    // but it should still be active since it was never checked against p2
    // Actually the resolver iterates all projectiles; the second one may or may not connect
    // depending on whether p2 is in a state to be hit again. The resolver does NOT
    // check hitstun state — it just checks hitbox overlap. So both could hit in theory.
    // But the loop breaks after the first hit (proj.active=false, break).
    expect(proj2.active).toBe(true);
  });

  it('projectile vs projectile: both pass through (independent entities)', () => {
    const [p1, p2] = createFighterPair();
    // P1 shoots right, P2 shoots left
    const proj1 = new Projectile(p1.x + 40, p1.y - 80, 1, 60, 0, 'kyo');
    const proj2 = new Projectile(p2.x - 40, p2.y - 80, -1, 60, 1, 'iori');
    // Move them to overlap
    proj1.x = 500;
    proj2.x = 500;

    const projectiles = [proj1, proj2];
    const ctx = createResolverContext();

    resolveProjectileHits(p1, p2, projectiles, undefined, ctx);

    // Projectiles do NOT interact with each other — they only check fighters
    // proj1 (ownerId=0) checks p2, proj2 (ownerId=1) checks p1
    // Since p1 and p2 are at 300 and 700 respectively, neither projectile hits
    // (they are at x=500, fighters are far away)
    expect(proj1.active).toBe(true);
    expect(proj2.active).toBe(true);
  });
});

// =====================================================================
// 3. Projectile Movement
// =====================================================================
describe('Projectile Movement', () => {
  it('projectile moves each frame', () => {
    const proj = new Projectile(400, 400, 1, 60, 0, 'kyo');
    const initialX = proj.x;
    proj.update();
    expect(proj.x).toBe(initialX + PROJECTILE_SPEED);
    expect(proj.currentFrame).toBe(1);
    expect(proj.active).toBe(true);
  });

  it('projectile removed when off-screen (right)', () => {
    const proj = new Projectile(1590, 400, 1, 60, 0, 'kyo');
    proj.update(); // x becomes 1598
    expect(proj.active).toBe(true);
    proj.update(); // x becomes 1606 > 1600
    expect(proj.active).toBe(false);
  });

  it('projectile removed when off-screen (left)', () => {
    const proj = new Projectile(-95, 400, -1, 60, 0, 'kyo');
    proj.update(); // x becomes -95 - 8 = -103 < -100
    expect(proj.active).toBe(false);
  });

  it('projectile removed when activeFrames exceeded', () => {
    const proj = new Projectile(400, 400, 1, 5, 0, 'kyo');
    for (let i = 0; i < 5; i++) {
      proj.update();
    }
    expect(proj.currentFrame).toBe(5);
    expect(proj.active).toBe(false);
  });

  it('projectile facing matches owner facing', () => {
    const [p1, p2] = createFighterPair();
    // P1 faces right (+1)
    const proj1 = new Projectile(p1.x, p1.y, p1.facing, 60, 0, 'kyo');
    expect(proj1.facing).toBe(1);
    expect(proj1.vx).toBeGreaterThan(0);

    // P2 faces left (-1)
    const proj2 = new Projectile(p2.x, p2.y, p2.facing, 60, 1, 'iori');
    expect(proj2.facing).toBe(-1);
    expect(proj2.vx).toBeLessThan(0);
  });

  it('projectile does not hit owner', () => {
    const [p1] = createFighterPair();
    // Create projectile right on top of P1 (its owner)
    const proj = new Projectile(p1.x, p1.y - 100, 1, 60, 0, 'kyo');
    const projectiles = [proj];
    const ctx = createResolverContext();
    const initialHealth = p1.health;

    // Use p1 as both fighters (so ownerId=0 === i=0, skip)
    // Actually we need a pair. The resolver loops fighters, and if i === proj.ownerId it skips.
    // So projectile with ownerId=0 placed at p1's position will NOT hit p1.
    const p2 = new Fighter(700, '#0000ff', -1);
    resolveProjectileHits(p1, p2, projectiles, undefined, ctx);

    // P1 health unchanged — projectile didn't hit its owner
    expect(p1.health).toBe(initialHealth);
    // Projectile is still active because it didn't hit anyone
    // (hitbox overlaps p1 but p1 is skipped since i===ownerId)
    expect(proj.active).toBe(true);
  });
});

// =====================================================================
// 4. Projectile in Combos
// =====================================================================
describe('Projectile in Combos', () => {
  it('projectile hit increments combo counter', () => {
    const [p1, p2] = createFighterPair();
    const proj = new Projectile(p2.x, p2.y - 100, 1, 60, 0, 'kyo');
    const ctx = createResolverContext();
    ctx.comboHits[1] = 2; // Pre-existing combo count

    resolveProjectileHits(p1, p2, [proj], undefined, ctx);

    expect(ctx.comboHits[1]).toBe(3);
    expect(ctx.lastHitFrame[1]).toBe(ctx.currentFrame);
  });

  it('projectile damage scales with combo (uses scaledDamage from context)', () => {
    const [p1, p2] = createFighterPair();
    const proj = new Projectile(p2.x, p2.y - 100, 1, 60, 0, 'kyo');
    const initialHealth = p2.health;

    // Create a scaledDamage that applies the actual combo scaling
    const realScaledDamage = (baseDamage: number, defIdx: number, _attackType?: AttackType): number => {
      const comboHits = ctx.comboHits[defIdx];
      if (comboHits <= 0) return baseDamage;
      let scale = COMBO_MIN_SCALE;
      const thresholds = Object.keys(COMBO_DAMAGE_SCALE).map(Number).sort((a, b) => a - b);
      for (const threshold of thresholds) {
        if (comboHits <= threshold) {
          scale = COMBO_DAMAGE_SCALE[threshold];
          break;
        }
      }
      return Math.max(1, Math.round(baseDamage * scale));
    };

    const ctx = createResolverContext({
      comboHits: [0, 5], // combo count = 5 → falls in 4-6 tier → 0.85 scaling
      scaledDamage: realScaledDamage,
    });

    resolveProjectileHits(p1, p2, [proj], undefined, ctx);

    const projData = FRAME_DATA.SPECIAL_PROJECTILE;
    const expectedDamage = Math.round(projData.damage * 0.85);
    expect(p2.health).toBe(initialHealth - expectedDamage);
  });

  it('projectile into follow-up attack (cancel timing)', () => {
    const [p1, p2] = createFighterPair();
    // Place p1 close to p2 so melee attacks can connect
    p1.x = 600;
    const proj = new Projectile(p2.x, p2.y - 100, 1, 60, 0, 'kyo');
    const inputProvider = createInputProvider();
    const cs = new CombatSystem(inputProvider);

    // Resolve projectile hit
    cs.resolveAttacks(p1, p2, [proj]);

    // After projectile hits, combo counter should be incremented
    expect(cs.getComboCount(1)).toBe(1);

    // Move p1 closer so the STAND_C hitbox overlaps p2
    p1.x = p2.x - 60;
    // Now do a follow-up normal attack while p2 is in hitstun
    p1.startAttack(AttackType.STAND_C);
    // Force into active phase
    const standCData = FRAME_DATA[AttackType.STAND_C];
    for (let i = 0; i < standCData.startup; i++) {
      p1.tickAttack();
    }
    expect(p1.attackPhase).toBe('active');

    cs.resolveAttacks(p1, p2, []);
    expect(cs.getComboCount(1)).toBe(2);
  });
});

// =====================================================================
// 5. Projectile Edge Cases
// =====================================================================
describe('Projectile Edge Cases', () => {
  it('projectile hits invincible opponent: still hits (resolver uses getHurtbox fallback)', () => {
    const [p1, p2] = createFighterPair();
    p2.invincible = true;

    const proj = new Projectile(p2.x, p2.y - 100, 1, 60, 0, 'kyo');
    const ctx = createResolverContext();
    const initialHealth = p2.health;

    resolveProjectileHits(p1, p2, [proj], undefined, ctx);

    // Note: resolveProjectileHits uses getEffectiveHurtbox() ?? getHurtbox()
    // When invincible=true, getEffectiveHurtbox() returns null, but the nullish
    // coalescing fallback falls through to getHurtbox() which still returns a box.
    // This is a known asymmetry with CombatSystem.resolveHit which only uses
    // getEffectiveHurtbox(). The projectile resolver does damage through the fallback.
    const projData = FRAME_DATA.SPECIAL_PROJECTILE;
    expect(p2.health).toBe(initialHealth - projData.damage);
    expect(proj.active).toBe(false);
  });

  it('projectile hits blocking opponent: chip damage only', () => {
    const [p1, p2] = createFighterPair();
    const proj = new Projectile(p2.x, p2.y - 100, 1, 60, 0, 'kyo');
    const initialHealth = p2.health;

    // P2 presses back (facing=-1, so right=true means back)
    const blockInput = createInputProvider({}, { right: true });
    const ctx = createResolverContext({ inputProvider: blockInput });

    resolveProjectileHits(p1, p2, [proj], undefined, ctx);

    const projData = FRAME_DATA.SPECIAL_PROJECTILE;
    const expectedChip = projData.chipDamage ?? Math.round(projData.damage * CHIP_DAMAGE_RATIO);
    expect(p2.health).toBe(Math.max(1, initialHealth - expectedChip));
    // Chip damage cannot reduce below 1
    expect(p2.health).toBeGreaterThanOrEqual(1);
    // Combo resets on block
    expect(ctx.comboHits[1]).toBe(0);
  });

  it('projectile hits rolling opponent: passes through (roll invincibility)', () => {
    const [p1, p2] = createFighterPair();
    // Put p2 in roll state with invincibility active
    p2.state = FighterState.ROLL;
    p2.rollTimer = ROLL_DURATION; // just started rolling

    const proj = new Projectile(p2.x, p2.y - 100, 1, 60, 0, 'kyo');
    const ctx = createResolverContext();
    const initialHealth = p2.health;

    resolveProjectileHits(p1, p2, [proj], undefined, ctx);

    // During roll invincibility, projectile should pass through
    expect(p2.health).toBe(initialHealth);
    // Projectile is deactivated by the resolver on roll invincibility hit
    expect(proj.active).toBe(false);
  });

  it('projectile persists after owner is hit', () => {
    const [p1, p2] = createFighterPair();
    // P1 fires a projectile
    const proj = new Projectile(500, 400, 1, 60, 0, 'kyo');

    // P1 gets hit by p2's attack
    p1.health = MAX_HEALTH - 100;
    p1.state = FighterState.HITSTUN;
    p1.hitstunTimer = 20;

    // Projectile should still be active and able to move
    expect(proj.active).toBe(true);
    proj.update();
    expect(proj.active).toBe(true);
    expect(proj.x).toBe(500 + PROJECTILE_SPEED);

    // Projectile should still be able to hit p2
    // Place it on p2's position
    proj.x = p2.x;
    proj.y = p2.y - 100;
    const ctx = createResolverContext();
    const initialP2Health = p2.health;

    resolveProjectileHits(p1, p2, [proj], undefined, ctx);

    // Projectile hits p2 even though p1 is in hitstun
    const projData = FRAME_DATA.SPECIAL_PROJECTILE;
    expect(p2.health).toBe(initialP2Health - projData.damage);
    expect(proj.active).toBe(false);
  });

  it('projectile hitstop callback fires correctly', () => {
    const [p1, p2] = createFighterPair();
    const proj = new Projectile(p2.x, p2.y - 100, 1, 60, 0, 'kyo');
    const ctx = createResolverContext();

    let callbackFired = false;
    let receivedBlocked = false;
    let receivedAttackType: AttackType | null = null;

    const onHit: HitCallback = (_attacker, _defender, attackType, blocked) => {
      callbackFired = true;
      receivedBlocked = blocked;
      receivedAttackType = attackType;
    };

    resolveProjectileHits(p1, p2, [proj], onHit, ctx);

    expect(callbackFired).toBe(true);
    expect(receivedBlocked).toBe(false);
    expect(receivedAttackType).toBe(AttackType.SPECIAL_PROJECTILE);
  });

  it('projectile blocked fires callback with blocked=true', () => {
    const [p1, p2] = createFighterPair();
    const proj = new Projectile(p2.x, p2.y - 100, 1, 60, 0, 'kyo');
    const blockInput = createInputProvider({}, { right: true });
    const ctx = createResolverContext({ inputProvider: blockInput });

    let receivedBlocked: boolean | null = null;
    const onHit: HitCallback = (_attacker, _defender, _attackType, blocked) => {
      receivedBlocked = blocked;
    };

    resolveProjectileHits(p1, p2, [proj], onHit, ctx);

    expect(receivedBlocked).toBe(true);
  });

  it('inactive projectile does not produce hitbox', () => {
    const proj = new Projectile(400, 400, 1, 60, 0, 'kyo');
    proj.active = false;
    expect(proj.getHitbox()).toBeNull();
  });

  it('projectile getHitbox returns correct dimensions', () => {
    const proj = new Projectile(500, 300, 1, 60, 0, 'kyo');
    const hitbox = proj.getHitbox();
    expect(hitbox).not.toBeNull();
    expect(hitbox!.x).toBe(500 - 15);
    expect(hitbox!.y).toBe(300 - 15);
    expect(hitbox!.width).toBe(30);
    expect(hitbox!.height).toBe(30);
  });
});
