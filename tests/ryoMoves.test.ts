/**
 * Tests for Ryo moves definitions
 * Verifies move structure, query API, and data completeness
 */
import { describe, it, expect } from 'vitest';
import {
  RYO_MOVES,
  getMoveByKey,
  getMoveByAttackType,
  getMovesByCategory,
  getProjectileMoves,
  getInvincibleMoves,
  getMoveStats,
} from '../src/content/characters/ryo/moves/ryoMoves.js';

describe('Ryo Moves Definitions', () => {
  it('should have all expected move categories', () => {
    const categories = new Set(RYO_MOVES.map(m => m.category));
    expect(categories.has('command_normal')).toBe(true);
    expect(categories.has('special')).toBe(true);
    expect(categories.has('dm')).toBe(true);
    expect(categories.has('sdm')).toBe(true);
    expect(categories.has('hsdm')).toBe(true);
  });

  it('should have Ryo 4+ core specials', () => {
    const specials = getMovesByCategory('special');
    expect(specials.length).toBeGreaterThanOrEqual(6);
    const keys = specials.map(s => s.key);
    expect(keys).toContain('RYO_KOOU');
    expect(keys).toContain('RYO_KO_HOU');
    expect(keys).toContain('RYO_HIEN');
    expect(keys).toContain('RYO_HAOU');
    expect(keys).toContain('RYO_KOOUKEN_D');
  });

  it('Ko\'ou Ken should have A and C versions', () => {
    const koou = getMoveByKey('RYO_KOOU');
    expect(koou).toBeDefined();
    expect(koou!.versions.length).toBe(2);
    expect(koou!.versions[0].version).toBe('A');
    expect(koou!.versions[1].version).toBe('C');
    expect(koou!.versions[0].isProjectile).toBe(true);
    expect(koou!.versions[1].damageMultiplier).toBeGreaterThan(koou!.versions[0].damageMultiplier);
  });

  it('Kohou C should have more invincible startup than A', () => {
    const aVersion = getMoveByAttackType('RYO_KO_HOU');
    const cVersion = getMoveByAttackType('RYO_KO_HOU_C');
    expect(aVersion).toBeDefined();
    expect(cVersion).toBeDefined();
    expect(cVersion!.version.invincibleStartup).toBeGreaterThan(aVersion!.version.invincibleStartup);
  });

  it('should identify projectile moves correctly', () => {
    const projectiles = getProjectileMoves();
    expect(projectiles.length).toBeGreaterThanOrEqual(2); // Ko'ou + Haou
    const keys = projectiles.map(p => p.key);
    expect(keys).toContain('RYO_KOOU');
    expect(keys).toContain('RYO_HAOU');
  });

  it('should have invincible moves for anti-air', () => {
    const invincible = getInvincibleMoves();
    expect(invincible.length).toBeGreaterThanOrEqual(2); // Kohou A, Kohou C at minimum
    const keys = invincible.map(i => i.version.attackTypeKey);
    expect(keys).toContain('RYO_KO_HOU');
    expect(keys).toContain('RYO_KO_HOU_C');
  });

  it('HSDM should have highest damage multiplier', () => {
    const hsdm = getMoveByAttackType('HSDM_RYUKO_RANBU');
    expect(hsdm).toBeDefined();
    expect(hsdm!.version.damageMultiplier).toBe(2.2);
  });

  it('every move version should have a valid attackTypeKey', () => {
    for (const move of RYO_MOVES) {
      for (const ver of move.versions) {
        expect(ver.attackTypeKey).toBeTruthy();
        expect(ver.damageMultiplier).toBeGreaterThan(0);
      }
    }
  });

  it('stats should match actual data', () => {
    const stats = getMoveStats();
    expect(stats.total).toBe(RYO_MOVES.length);
    expect(stats.versions).toBeGreaterThanOrEqual(stats.total);
    expect(stats.byCategory['special']).toBeGreaterThanOrEqual(6);
    expect(stats.byCategory['dm']).toBe(2);
  });

  it('command normals should have 1 version each', () => {
    const tsurizao = getMoveByKey('RYO_TSURIZAO');
    const orishi = getMoveByKey('RYO_ORISHI');
    expect(tsurizao!.versions.length).toBe(1);
    expect(orishi!.versions.length).toBe(1);
  });
});
