/**
 * Tests for Kyo moves definitions
 * Verifies move structure, query API, and data completeness
 */
import { describe, it, expect } from 'vitest';
import {
  KYO_MOVES,
  getMoveByKey,
  getMoveByAttackType,
  getMovesByCategory,
  getProjectileMoves,
  getInvincibleMoves,
  getMoveStats,
} from '../src/content/characters/kyo/moves/kyoMoves.js';

describe('Kyo Moves Definitions', () => {
  it('should have all expected move categories', () => {
    const categories = new Set(KYO_MOVES.map(m => m.category));
    expect(categories.has('command_normal')).toBe(true);
    expect(categories.has('special')).toBe(true);
    expect(categories.has('dm')).toBe(true);
    expect(categories.has('sdm')).toBe(true);
    expect(categories.has('hsdm')).toBe(true);
  });

  it('should have 3 command normals', () => {
    const cmds = getMovesByCategory('command_normal');
    expect(cmds.length).toBe(3);
    const keys = cmds.map(c => c.key);
    expect(keys).toContain('CMD_GOFU_YOU');
    expect(keys).toContain('CMD_88SHIKI');
    expect(keys).toContain('CMD_NARAKU');
  });

  it('should have core specials: Yamibarai, Oniyaki, Aragami, Dokugami', () => {
    const specials = getMovesByCategory('special');
    expect(specials.length).toBeGreaterThanOrEqual(10);
    const keys = specials.map(s => s.key);
    expect(keys).toContain('KYO_YAMIBARAI');
    expect(keys).toContain('KYO_ONIYAKI');
    expect(keys).toContain('KYO_ARAGAMI');
    expect(keys).toContain('KYO_DOKUGAMI');
  });

  it('Yamibarai should have A and C versions with projectile', () => {
    const yami = getMoveByKey('KYO_YAMIBARAI');
    expect(yami).toBeDefined();
    expect(yami!.versions.length).toBe(2);
    expect(yami!.versions[0].version).toBe('A');
    expect(yami!.versions[1].version).toBe('C');
    expect(yami!.versions[0].isProjectile).toBe(true);
    expect(yami!.versions[1].isProjectile).toBe(true);
    expect(yami!.versions[1].damageMultiplier).toBeGreaterThan(yami!.versions[0].damageMultiplier);
  });

  it('Oniyaki C should have more invincible startup than A', () => {
    const aVersion = getMoveByAttackType('KYO_ONIYAKI');
    const cVersion = getMoveByAttackType('KYO_ONIYAKI_C');
    expect(aVersion).toBeDefined();
    expect(cVersion).toBeDefined();
    expect(cVersion!.version.invincibleStartup).toBeGreaterThan(aVersion!.version.invincibleStartup);
  });

  it('should identify projectile moves correctly', () => {
    const projectiles = getProjectileMoves();
    expect(projectiles.length).toBeGreaterThanOrEqual(1);
    const keys = projectiles.map(p => p.key);
    expect(keys).toContain('KYO_YAMIBARAI');
  });

  it('should have invincible moves for anti-air', () => {
    const invincible = getInvincibleMoves();
    expect(invincible.length).toBeGreaterThanOrEqual(2);
    const atkKeys = invincible.map(i => i.version.attackTypeKey);
    expect(atkKeys).toContain('KYO_ONIYAKI');
    expect(atkKeys).toContain('KYO_ONIYAKI_C');
  });

  it('Aragami chain should have follow-ups: Kono Kizu, Yano Sabi', () => {
    const aragami = getMoveByKey('KYO_ARAGAMI');
    const kizoku = getMoveByKey('KYO_ARAGAMI_KONOKIZU');
    const yanosabi = getMoveByKey('KYO_ARAGAMI_YANOSABI');
    expect(aragami).toBeDefined();
    expect(kizoku).toBeDefined();
    expect(yanosabi).toBeDefined();
  });

  it('Dokugami chain should have follow-ups: Tsumiyomi, Batsuyomi', () => {
    const dokugami = getMoveByKey('KYO_DOKUGAMI');
    const tsumiyomi = getMoveByKey('KYO_TSUMIYOMI');
    const batsuyomi = getMoveByKey('KYO_BATSUYOMI');
    expect(dokugami).toBeDefined();
    expect(tsumiyomi).toBeDefined();
    expect(batsuyomi).toBeDefined();
  });

  it('HSDM should have highest damage multiplier', () => {
    const hsdm = getMoveByAttackType('HSDM_OROCHINAGI');
    expect(hsdm).toBeDefined();
    expect(hsdm!.version.damageMultiplier).toBe(2.2);
  });

  it('HSDM should have more invincible startup than SDM', () => {
    const sdm = getMoveByAttackType('SDM_OROCHINAGI');
    const hsdm = getMoveByAttackType('HSDM_OROCHINAGI');
    expect(hsdm!.version.invincibleStartup).toBeGreaterThan(sdm!.version.invincibleStartup);
  });

  it('every move version should have valid structure', () => {
    for (const move of KYO_MOVES) {
      expect(move.key).toBeTruthy();
      expect(move.nameJa).toBeTruthy();
      expect(move.nameEn).toBeTruthy();
      expect(move.input).toBeTruthy();
      expect(move.versions.length).toBeGreaterThanOrEqual(1);
      for (const ver of move.versions) {
        expect(ver.attackTypeKey).toBeTruthy();
        expect(ver.damageMultiplier).toBeGreaterThan(0);
        expect(ver.differences).toBeTruthy();
      }
    }
  });

  it('stats should match actual data', () => {
    const stats = getMoveStats();
    expect(stats.total).toBe(KYO_MOVES.length);
    expect(stats.versions).toBeGreaterThanOrEqual(stats.total);
    expect(stats.byCategory['command_normal']).toBe(3);
    expect(stats.byCategory['dm']).toBeGreaterThanOrEqual(1);
    expect(stats.byCategory['sdm']).toBeGreaterThanOrEqual(1);
    expect(stats.byCategory['hsdm']).toBeGreaterThanOrEqual(1);
  });

  it('command normals should have 1 version each', () => {
    const cmds = getMovesByCategory('command_normal');
    for (const cmd of cmds) {
      expect(cmd.versions.length).toBe(1);
    }
  });

  it('DM invincible startup should be between SDM and specials', () => {
    const dm = getMoveByAttackType('DM_OROCHINAGI');
    const sdm = getMoveByAttackType('SDM_OROCHINAGI');
    expect(dm!.version.invincibleStartup).toBeGreaterThan(0);
    expect(sdm!.version.invincibleStartup).toBeGreaterThan(dm!.version.invincibleStartup);
  });
});
