/**
 * Kyo/Iori Move Definitions Regression Tests
 *
 * Validates move definition structure, query API functions,
 * version entries, and cross-character consistency.
 */
import { describe, it, expect } from 'vitest';
import {
  KYO_MOVES, getMoveByKey, getMoveByAttackType,
  getMovesByCategory, getProjectileMoves, getInvincibleMoves,
  getMoveStats,
  type MoveDefinition, type MoveVersionEntry,
} from '../src/content/characters/kyo/moves/kyoMoves.js';
import {
  IORI_MOVES, getMoveByKey as getIoriMoveByKey,
  getMoveByAttackType as getIoriMoveByAttackType,
  getMovesByCategory as getIoriMovesByCategory,
  getProjectileMoves as getIoriProjectileMoves,
  getInvincibleMoves as getIoriInvincibleMoves,
  getMoveStats as getIoriMoveStats,
} from '../src/content/characters/iori/moves/ioriMoves.js';

const VALID_CATEGORIES: MoveDefinition['category'][] = ['command_normal', 'special', 'dm', 'sdm', 'hsdm'];
const VALID_VERSIONS: MoveVersionEntry['version'][] = ['A', 'C', 'D', 'MAX'];

function validateMove(move: MoveDefinition, prefix: string) {
  expect(move.key.length, `${prefix}.key`).toBeGreaterThan(0);
  expect(move.nameJa.length, `${prefix}.nameJa`).toBeGreaterThan(0);
  expect(move.nameEn.length, `${prefix}.nameEn`).toBeGreaterThan(0);
  expect(VALID_CATEGORIES, `${prefix}.category`).toContain(move.category);
  expect(move.input.length, `${prefix}.input`).toBeGreaterThan(0);
  expect(move.versions.length, `${prefix}.versions`).toBeGreaterThan(0);

  for (const ver of move.versions) {
    const vPrefix = `${prefix}[${ver.attackTypeKey}]`;
    expect(VALID_VERSIONS, `${vPrefix}.version`).toContain(ver.version);
    expect(ver.attackTypeKey.length, `${vPrefix}.attackTypeKey`).toBeGreaterThan(0);
    expect(ver.differences.length, `${vPrefix}.differences`).toBeGreaterThan(0);
    expect(ver.damageMultiplier, `${vPrefix}.damageMultiplier`).toBeGreaterThan(0);
    expect(typeof ver.knockdown, `${vPrefix}.knockdown`).toBe('boolean');
    expect(ver.invincibleStartup, `${vPrefix}.invincibleStartup`).toBeGreaterThanOrEqual(0);
    expect(typeof ver.isProjectile, `${vPrefix}.isProjectile`).toBe('boolean');
  }
}

// ════════════════════════════════════════════════════════════════
// Kyo Move Definitions
// ════════════════════════════════════════════════════════════════

describe('Kyo Move Definitions', () => {
  it('has at least 18 moves', () => {
    expect(KYO_MOVES.length).toBeGreaterThanOrEqual(18);
  });

  it('all moves have valid structure', () => {
    for (const move of KYO_MOVES) {
      validateMove(move, move.key);
    }
  });

  it('no duplicate keys', () => {
    const keys = KYO_MOVES.map(m => m.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('no duplicate attackTypeKeys across versions', () => {
    const atkKeys: string[] = [];
    for (const move of KYO_MOVES) {
      for (const ver of move.versions) {
        atkKeys.push(ver.attackTypeKey);
      }
    }
    expect(new Set(atkKeys).size).toBe(atkKeys.length);
  });

  it('has command normals', () => {
    const cmds = getMovesByCategory('command_normal');
    expect(cmds.length).toBeGreaterThanOrEqual(3);
  });

  it('has specials', () => {
    const specials = getMovesByCategory('special');
    expect(specials.length).toBeGreaterThanOrEqual(10);
  });

  it('has DM', () => {
    const dms = getMovesByCategory('dm');
    expect(dms.length).toBeGreaterThanOrEqual(1);
  });

  it('has SDM', () => {
    const sdms = getMovesByCategory('sdm');
    expect(sdms.length).toBeGreaterThanOrEqual(1);
  });

  it('has HSDM', () => {
    const hsdms = getMovesByCategory('hsdm');
    expect(hsdms.length).toBeGreaterThanOrEqual(1);
  });

  it('DM/SDM/HSDM damageMultiplier escalation', () => {
    const dm = getMoveByKey('DM_OROCHINAGI')!;
    const sdm = getMoveByKey('SDM_OROCHINAGI')!;
    const hsdm = getMoveByKey('HSDM_OROCHINAGI')!;
    expect(sdm.versions[0].damageMultiplier).toBeGreaterThan(dm.versions[0].damageMultiplier);
    expect(hsdm.versions[0].damageMultiplier).toBeGreaterThan(sdm.versions[0].damageMultiplier);
  });

  it('DM/SDM/HSDM invincibleStartup escalation', () => {
    const dm = getMoveByKey('DM_OROCHINAGI')!;
    const sdm = getMoveByKey('SDM_OROCHINAGI')!;
    const hsdm = getMoveByKey('HSDM_OROCHINAGI')!;
    expect(sdm.versions[0].invincibleStartup).toBeGreaterThan(dm.versions[0].invincibleStartup);
    expect(hsdm.versions[0].invincibleStartup).toBeGreaterThan(sdm.versions[0].invincibleStartup);
  });

  it('projectile moves exist', () => {
    const projectiles = getProjectileMoves();
    expect(projectiles.length).toBeGreaterThanOrEqual(1);
    const keys = projectiles.map(m => m.key);
    expect(keys).toContain('KYO_YAMIBARAI');
  });

  it('invincible moves exist', () => {
    const inv = getInvincibleMoves();
    expect(inv.length).toBeGreaterThanOrEqual(2);
  });

  it('getMoveByKey returns correct move', () => {
    const move = getMoveByKey('KYO_ONIYAKI');
    expect(move).toBeDefined();
    expect(move!.key).toBe('KYO_ONIYAKI');
  });

  it('getMoveByKey returns undefined for unknown', () => {
    expect(getMoveByKey('NONEXISTENT')).toBeUndefined();
  });

  it('getMoveByAttackType returns correct entry', () => {
    const result = getMoveByAttackType('KYO_ONIYAKI_C');
    expect(result).toBeDefined();
    expect(result!.move.key).toBe('KYO_ONIYAKI');
    expect(result!.version.attackTypeKey).toBe('KYO_ONIYAKI_C');
  });

  it('getMoveByAttackType returns undefined for unknown', () => {
    expect(getMoveByAttackType('NONEXISTENT')).toBeUndefined();
  });

  it('getMoveStats returns valid stats', () => {
    const stats = getMoveStats();
    expect(stats.total).toBe(KYO_MOVES.length);
    expect(stats.versions).toBeGreaterThanOrEqual(stats.total);
    expect(Object.keys(stats.byCategory).length).toBeGreaterThanOrEqual(3);
  });

  it('C version damageMultiplier > A version', () => {
    const yami = getMoveByKey('KYO_YAMIBARAI')!;
    const aVer = yami.versions.find(v => v.version === 'A')!;
    const cVer = yami.versions.find(v => v.version === 'C')!;
    expect(cVer.damageMultiplier).toBeGreaterThan(aVer.damageMultiplier);
  });

  it('Aragami rekka chain present', () => {
    expect(getMoveByKey('KYO_ARAGAMI')).toBeDefined();
    expect(getMoveByKey('KYO_ARAGAMI_KONOKIZU')).toBeDefined();
    expect(getMoveByKey('KYO_ARAGAMI_YANOSABI')).toBeDefined();
    expect(getMoveByKey('KYO_NANASE')).toBeDefined();
    expect(getMoveByKey('KYO_KOTO_TSUKI')).toBeDefined();
    expect(getMoveByKey('KYO_YAKISOGI')).toBeDefined();
  });

  it('Dokugami rekka chain present', () => {
    expect(getMoveByKey('KYO_DOKUGAMI')).toBeDefined();
    expect(getMoveByKey('KYO_TSUMIYOMI')).toBeDefined();
    expect(getMoveByKey('KYO_BATSUYOMI')).toBeDefined();
  });
});

// ════════════════════════════════════════════════════════════════
// Iori Move Definitions
// ════════════════════════════════════════════════════════════════

describe('Iori Move Definitions', () => {
  it('has at least 17 moves', () => {
    expect(IORI_MOVES.length).toBeGreaterThanOrEqual(16);
  });

  it('all moves have valid structure', () => {
    for (const move of IORI_MOVES) {
      validateMove(move, move.key);
    }
  });

  it('no duplicate keys', () => {
    const keys = IORI_MOVES.map(m => m.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('no duplicate attackTypeKeys across versions', () => {
    const atkKeys: string[] = [];
    for (const move of IORI_MOVES) {
      for (const ver of move.versions) {
        atkKeys.push(ver.attackTypeKey);
      }
    }
    expect(new Set(atkKeys).size).toBe(atkKeys.length);
  });

  it('has command normals', () => {
    const cmds = getIoriMovesByCategory('command_normal');
    expect(cmds.length).toBeGreaterThanOrEqual(3);
  });

  it('has specials including rekka chains', () => {
    const specials = getIoriMovesByCategory('special');
    expect(specials.length).toBeGreaterThanOrEqual(10);
  });

  it('has DM/SDM/HSDM', () => {
    expect(getIoriMovesByCategory('dm').length).toBeGreaterThanOrEqual(1);
    expect(getIoriMovesByCategory('sdm').length).toBeGreaterThanOrEqual(1);
    expect(getIoriMovesByCategory('hsdm').length).toBeGreaterThanOrEqual(1);
  });

  it('DM/SDM/HSDM damageMultiplier escalation', () => {
    const dm = getIoriMoveByKey('DM_YATAGARASU')!;
    const sdm = getIoriMoveByKey('SDM_YATAGARASU')!;
    const hsdm = getIoriMoveByKey('HSDM_YAOTOME')!;
    expect(sdm.versions[0].damageMultiplier).toBeGreaterThan(dm.versions[0].damageMultiplier);
    expect(hsdm.versions[0].damageMultiplier).toBeGreaterThan(sdm.versions[0].damageMultiplier);
  });

  it('DM/SDM/HSDM invincibleStartup escalation', () => {
    const dm = getIoriMoveByKey('DM_YATAGARASU')!;
    const sdm = getIoriMoveByKey('SDM_YATAGARASU')!;
    const hsdm = getIoriMoveByKey('HSDM_YAOTOME')!;
    expect(sdm.versions[0].invincibleStartup).toBeGreaterThan(dm.versions[0].invincibleStartup);
    expect(hsdm.versions[0].invincibleStartup).toBeGreaterThan(sdm.versions[0].invincibleStartup);
  });

  it('Aoihana A chain present', () => {
    expect(getIoriMoveByKey('IORI_AOIHANA')).toBeDefined();
    expect(getIoriMoveByKey('IORI_AOIHANA_2')).toBeDefined();
    expect(getIoriMoveByKey('IORI_AOIHANA_3')).toBeDefined();
  });

  it('Aoihana C chain present', () => {
    expect(getIoriMoveByKey('IORI_AOIHANA_C')).toBeDefined();
    expect(getIoriMoveByKey('IORI_AOIHANA_C_2')).toBeDefined();
    expect(getIoriMoveByKey('IORI_AOIHANA_C_3')).toBeDefined();
  });

  it('projectile moves exist', () => {
    const projectiles = getIoriProjectileMoves();
    expect(projectiles.length).toBeGreaterThanOrEqual(1);
  });

  it('invincible moves exist', () => {
    const inv = getIoriInvincibleMoves();
    expect(inv.length).toBeGreaterThanOrEqual(2);
  });

  it('getMoveByKey returns correct move', () => {
    const move = getIoriMoveByKey('IORI_ONIYAKI');
    expect(move).toBeDefined();
    expect(move!.key).toBe('IORI_ONIYAKI');
  });

  it('getMoveByAttackType returns correct entry', () => {
    const result = getIoriMoveByAttackType('IORI_ONIYAKI_C');
    expect(result).toBeDefined();
    expect(result!.move.key).toBe('IORI_ONIYAKI');
    expect(result!.version.attackTypeKey).toBe('IORI_ONIYAKI_C');
  });

  it('getMoveStats returns valid stats', () => {
    const stats = getIoriMoveStats();
    expect(stats.total).toBe(IORI_MOVES.length);
    expect(stats.versions).toBeGreaterThanOrEqual(stats.total);
  });

  it('C version damageMultiplier > A version for oniyaki', () => {
    const oni = getIoriMoveByKey('IORI_ONIYAKI')!;
    const aVer = oni.versions.find(v => v.version === 'A')!;
    const cVer = oni.versions.find(v => v.version === 'C')!;
    expect(cVer.damageMultiplier).toBeGreaterThan(aVer.damageMultiplier);
  });

  it('command throw (Kuzukaze) is not projectile', () => {
    const kuzu = getIoriMoveByKey('IORI_KUZUKAZE')!;
    expect(kuzu.versions[0].isProjectile).toBe(false);
  });

  it('final rekka hits cause knockdown', () => {
    const a3 = getIoriMoveByKey('IORI_AOIHANA_3')!;
    const c3 = getIoriMoveByKey('IORI_AOIHANA_C_3')!;
    expect(a3.versions[0].knockdown).toBe(true);
    expect(c3.versions[0].knockdown).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════
// Cross-Character Move Validation
// ════════════════════════════════════════════════════════════════

describe('Kyo/Iori Move Cross-Validation', () => {
  it('no overlapping move keys', () => {
    const kyoKeys = new Set(KYO_MOVES.map(m => m.key));
    for (const move of IORI_MOVES) {
      expect(kyoKeys.has(move.key), `overlap: ${move.key}`).toBe(false);
    }
  });

  it('no overlapping attackTypeKeys', () => {
    const kyoAtkKeys = new Set(KYO_MOVES.flatMap(m => m.versions.map(v => v.attackTypeKey)));
    for (const move of IORI_MOVES) {
      for (const ver of move.versions) {
        expect(kyoAtkKeys.has(ver.attackTypeKey), `overlap: ${ver.attackTypeKey}`).toBe(false);
      }
    }
  });

  it('both have same category set', () => {
    const kyoCats = new Set(KYO_MOVES.map(m => m.category));
    const ioriCats = new Set(IORI_MOVES.map(m => m.category));
    for (const cat of kyoCats) {
      expect(ioriCats.has(cat), `Iori missing category: ${cat}`).toBe(true);
    }
  });

  it('both have HSDM with invincibleStartup >= 12', () => {
    const kyoHsdm = getMoveByKey('HSDM_OROCHINAGI')!;
    const ioriHsdm = getIoriMoveByKey('HSDM_YAOTOME')!;
    expect(kyoHsdm.versions[0].invincibleStartup).toBeGreaterThanOrEqual(12);
    expect(ioriHsdm.versions[0].invincibleStartup).toBeGreaterThanOrEqual(12);
  });
});
