/**
 * Tests for Iori moves definitions
 * Verifies move structure, query API, and data completeness
 */
import { describe, it, expect } from 'vitest';
import {
  IORI_MOVES,
  getMoveByKey,
  getMoveByAttackType,
  getMovesByCategory,
  getProjectileMoves,
  getInvincibleMoves,
  getMoveStats,
} from '../src/content/characters/iori/moves/ioriMoves.js';

describe('Iori Moves Definitions', () => {
  it('should have all expected move categories', () => {
    const categories = new Set(IORI_MOVES.map(m => m.category));
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
    expect(keys).toContain('IORI_YUMEYUMI');
    expect(keys).toContain('IORI_KATANUGI');
    expect(keys).toContain('IORI_YUKIWARUI');
  });

  it('should have core specials: Yamibarai, Oniyaki, Kototsuki, Kuzukaze, Aoihana', () => {
    const specials = getMovesByCategory('special');
    expect(specials.length).toBeGreaterThanOrEqual(8);
    const keys = specials.map(s => s.key);
    expect(keys).toContain('IORI_YAMIBARAI');
    expect(keys).toContain('IORI_ONIYAKI');
    expect(keys).toContain('IORI_KOTOTSUKI');
    expect(keys).toContain('IORI_KUZUKAZE');
    expect(keys).toContain('IORI_AOIHANA');
  });

  it('Yamibarai should have A and C versions with projectile', () => {
    const yami = getMoveByKey('IORI_YAMIBARAI');
    expect(yami).toBeDefined();
    expect(yami!.versions.length).toBe(2);
    expect(yami!.versions[0].version).toBe('A');
    expect(yami!.versions[1].version).toBe('C');
    expect(yami!.versions[0].isProjectile).toBe(true);
    expect(yami!.versions[1].isProjectile).toBe(true);
    expect(yami!.versions[1].damageMultiplier).toBeGreaterThan(yami!.versions[0].damageMultiplier);
  });

  it('Oniyaki C should have more invincible startup than A', () => {
    const aVersion = getMoveByAttackType('IORI_ONIYAKI');
    const cVersion = getMoveByAttackType('IORI_ONIYAKI_C');
    expect(aVersion).toBeDefined();
    expect(cVersion).toBeDefined();
    expect(cVersion!.version.invincibleStartup).toBeGreaterThan(aVersion!.version.invincibleStartup);
  });

  it('should identify projectile moves correctly', () => {
    const projectiles = getProjectileMoves();
    expect(projectiles.length).toBeGreaterThanOrEqual(1);
    const keys = projectiles.map(p => p.key);
    expect(keys).toContain('IORI_YAMIBARAI');
  });

  it('should have invincible moves for anti-air', () => {
    const invincible = getInvincibleMoves();
    expect(invincible.length).toBeGreaterThanOrEqual(2);
    const atkKeys = invincible.map(i => i.version.attackTypeKey);
    expect(atkKeys).toContain('IORI_ONIYAKI');
    expect(atkKeys).toContain('IORI_ONIYAKI_C');
  });

  it('Aoihana chain should have 3 follow-up stages', () => {
    const aoi1 = getMoveByKey('IORI_AOIHANA');
    const aoi2 = getMoveByKey('IORI_AOIHANA_2');
    const aoi3 = getMoveByKey('IORI_AOIHANA_3');
    expect(aoi1).toBeDefined();
    expect(aoi2).toBeDefined();
    expect(aoi3).toBeDefined();
    expect(aoi3!.versions[0].knockdown).toBe(true);
  });

  it('Aoihana C chain should have 3 follow-up stages', () => {
    const aoiC1 = getMoveByKey('IORI_AOIHANA_C');
    const aoiC2 = getMoveByKey('IORI_AOIHANA_C_2');
    const aoiC3 = getMoveByKey('IORI_AOIHANA_C_3');
    expect(aoiC1).toBeDefined();
    expect(aoiC2).toBeDefined();
    expect(aoiC3).toBeDefined();
    expect(aoiC3!.versions[0].knockdown).toBe(true);
  });

  it('Kuzukaze should be a command grab (non-projectile, non-invincible)', () => {
    const kuzu = getMoveByKey('IORI_KUZUKAZE');
    expect(kuzu).toBeDefined();
    expect(kuzu!.versions[0].isProjectile).toBe(false);
    expect(kuzu!.versions[0].invincibleStartup).toBe(0);
    expect(kuzu!.versions[0].knockdown).toBe(false);
  });

  it('HSDM Yaotome should have highest damage multiplier', () => {
    const hsdm = getMoveByAttackType('HSDM_YAOTOME');
    expect(hsdm).toBeDefined();
    expect(hsdm!.version.damageMultiplier).toBe(2.2);
  });

  it('HSDM should have more invincible startup than SDM', () => {
    const sdm = getMoveByAttackType('SDM_YATAGARASU');
    const hsdm = getMoveByAttackType('HSDM_YAOTOME');
    expect(hsdm!.version.invincibleStartup).toBeGreaterThan(sdm!.version.invincibleStartup);
  });

  it('every move version should have valid structure', () => {
    for (const move of IORI_MOVES) {
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
    expect(stats.total).toBe(IORI_MOVES.length);
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
    const dm = getMoveByAttackType('DM_YATAGARASU');
    const sdm = getMoveByAttackType('SDM_YATAGARASU');
    expect(dm!.version.invincibleStartup).toBeGreaterThan(0);
    expect(sdm!.version.invincibleStartup).toBeGreaterThan(dm!.version.invincibleStartup);
  });
});
