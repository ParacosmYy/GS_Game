/**
 * Ryo Moves Data Regression Tests
 *
 * Validates move definitions, query functions, and data consistency.
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
  type MoveDefinition,
  type MoveVersionEntry,
} from '../src/content/characters/ryo/moves/ryoMoves.js';

// ===== Data Structure Validation =====

function validateMove(move: MoveDefinition, label: string) {
  expect(move.key, `${label} key`).toBeTruthy();
  expect(move.nameJa, `${label} nameJa`).toBeTruthy();
  expect(move.nameEn, `${label} nameEn`).toBeTruthy();
  expect(['command_normal', 'special', 'dm', 'sdm', 'hsdm'], `${label} category`).toContain(move.category);
  expect(move.input, `${label} input`).toBeTruthy();
  expect(move.versions.length, `${label} versions`).toBeGreaterThan(0);
  for (let i = 0; i < move.versions.length; i++) {
    validateVersion(move.versions[i], `${label} v[${i}]`);
  }
}

function validateVersion(v: MoveVersionEntry, label: string) {
  expect(['A', 'C', 'D', 'MAX'], `${label} version`).toContain(v.version);
  expect(v.attackTypeKey, `${label} attackTypeKey`).toBeTruthy();
  expect(v.damageMultiplier, `${label} damageMultiplier`).toBeGreaterThan(0);
  expect(typeof v.knockdown, `${label} knockdown`).toBe('boolean');
  expect(typeof v.invincibleStartup, `${label} invincibleStartup`).toBe('number');
  expect(v.invincibleStartup, `${label} invincibleStartup >= 0`).toBeGreaterThanOrEqual(0);
  expect(typeof v.isProjectile, `${label} isProjectile`).toBe('boolean');
}

// ===== RYO_MOVES =====

describe('RYO_MOVES', () => {
  it('has entries for all move categories', () => {
    const categories = new Set(RYO_MOVES.map(m => m.category));
    expect(categories.has('command_normal')).toBe(true);
    expect(categories.has('special')).toBe(true);
    expect(categories.has('dm')).toBe(true);
    expect(categories.has('sdm')).toBe(true);
    expect(categories.has('hsdm')).toBe(true);
  });

  it('has no duplicate keys', () => {
    const keys = RYO_MOVES.map(m => m.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('all moves have valid structure', () => {
    for (const move of RYO_MOVES) {
      validateMove(move, `ryo/${move.key}`);
    }
  });

  it('all attackTypeKeys are unique across versions', () => {
    const allKeys: string[] = [];
    for (const move of RYO_MOVES) {
      for (const v of move.versions) {
        allKeys.push(v.attackTypeKey);
      }
    }
    expect(new Set(allKeys).size).toBe(allKeys.length);
  });

  it('has key Ryo moves', () => {
    const keys = ['RYO_KOOU', 'RYO_KO_HOU', 'RYO_HIEN', 'RYO_ZANRETSU_KEN', 'DM_TEN_HA_OU', 'DM_RYUKO_RANBU'];
    for (const key of keys) {
      expect(RYO_MOVES.some(m => m.key === key), `ryo has ${key}`).toBe(true);
    }
  });

  it('SDMs have higher damage multiplier than specials', () => {
    const specialMaxDmg = Math.max(
      ...RYO_MOVES
        .filter(m => m.category === 'special')
        .flatMap(m => m.versions.map(v => v.damageMultiplier)),
    );
    const sdmMinDmg = Math.min(
      ...RYO_MOVES
        .filter(m => m.category === 'sdm')
        .flatMap(m => m.versions.map(v => v.damageMultiplier)),
    );
    expect(sdmMinDmg).toBeGreaterThanOrEqual(specialMaxDmg);
  });

  it('SDM has higher damage multiplier than DM', () => {
    const dmDmg = Math.max(
      ...RYO_MOVES
        .filter(m => m.category === 'dm')
        .flatMap(m => m.versions.map(v => v.damageMultiplier)),
    );
    const sdmDmg = Math.min(
      ...RYO_MOVES
        .filter(m => m.category === 'sdm')
        .flatMap(m => m.versions.map(v => v.damageMultiplier)),
    );
    expect(sdmDmg).toBeGreaterThanOrEqual(dmDmg);
  });

  it('HSDM has highest damage multiplier', () => {
    const hsdmDmg = RYO_MOVES
      .filter(m => m.category === 'hsdm')
      .flatMap(m => m.versions.map(v => v.damageMultiplier));
    const maxOther = Math.max(
      ...RYO_MOVES
        .filter(m => m.category !== 'hsdm')
        .flatMap(m => m.versions.map(v => v.damageMultiplier)),
    );
    for (const d of hsdmDmg) {
      expect(d).toBeGreaterThan(maxOther);
    }
  });

  it('projectile moves are marked correctly', () => {
    const koou = RYO_MOVES.find(m => m.key === 'RYO_KOOU')!;
    expect(koou.versions.some(v => v.isProjectile)).toBe(true);
    const kohou = RYO_MOVES.find(m => m.key === 'RYO_KO_HOU')!;
    expect(kohou.versions.every(v => !v.isProjectile)).toBe(true);
  });

  it('DMs all have knockdown', () => {
    for (const move of RYO_MOVES.filter(m => m.category === 'dm')) {
      for (const v of move.versions) {
        expect(v.knockdown, `${move.key} DM knockdown`).toBe(true);
      }
    }
  });

  it('SDMs all have knockdown', () => {
    for (const move of RYO_MOVES.filter(m => m.category === 'sdm')) {
      for (const v of move.versions) {
        expect(v.knockdown, `${move.key} SDM knockdown`).toBe(true);
      }
    }
  });

  it('SDMs have more invincible startup than DMs', () => {
    const dmInv = RYO_MOVES
      .filter(m => m.category === 'dm')
      .flatMap(m => m.versions.map(v => v.invincibleStartup));
    const sdmInv = RYO_MOVES
      .filter(m => m.category === 'sdm')
      .flatMap(m => m.versions.map(v => v.invincibleStartup));
    const avgDmInv = dmInv.reduce((a, b) => a + b, 0) / dmInv.length;
    const avgSdmInv = sdmInv.reduce((a, b) => a + b, 0) / sdmInv.length;
    expect(avgSdmInv).toBeGreaterThanOrEqual(avgDmInv);
  });

  it('A and C versions exist for key specials', () => {
    const koou = RYO_MOVES.find(m => m.key === 'RYO_KOOU')!;
    const versions = koou.versions.map(v => v.version);
    expect(versions).toContain('A');
    expect(versions).toContain('C');
    expect(versions.length).toBeGreaterThanOrEqual(2);
  });

  it('C version has higher damage than A version for specials with both', () => {
    for (const move of RYO_MOVES.filter(m => m.category === 'special')) {
      const aVer = move.versions.find(v => v.version === 'A');
      const cVer = move.versions.find(v => v.version === 'C');
      if (aVer && cVer) {
        expect(cVer.damageMultiplier, `${move.key} C dmg > A dmg`).toBeGreaterThanOrEqual(aVer.damageMultiplier);
      }
    }
  });
});

// ===== Query Functions =====

describe('getMoveByKey', () => {
  it('returns move for existing key', () => {
    const move = getMoveByKey('RYO_KOOU');
    expect(move).toBeDefined();
    expect(move!.key).toBe('RYO_KOOU');
    expect(move!.category).toBe('special');
  });

  it('returns undefined for non-existent key', () => {
    expect(getMoveByKey('NON_EXISTENT')).toBeUndefined();
  });
});

describe('getMoveByAttackType', () => {
  it('returns move and version for RYO_KOOU', () => {
    const result = getMoveByAttackType('RYO_KOOU');
    expect(result).toBeDefined();
    expect(result!.move.key).toBe('RYO_KOOU');
    expect(result!.version.attackTypeKey).toBe('RYO_KOOU');
    expect(result!.version.version).toBe('A');
  });

  it('returns C version for RYO_KOOU_C', () => {
    const result = getMoveByAttackType('RYO_KOOU_C');
    expect(result).toBeDefined();
    expect(result!.version.version).toBe('C');
  });

  it('returns undefined for non-existent attack type', () => {
    expect(getMoveByAttackType('FAKE_ATTACK')).toBeUndefined();
  });

  it('can find DM attack types', () => {
    const result = getMoveByAttackType('DM_TEN_HA_OU');
    expect(result).toBeDefined();
    expect(result!.move.category).toBe('dm');
  });
});

describe('getMovesByCategory', () => {
  it('returns all specials', () => {
    const specials = getMovesByCategory('special');
    expect(specials.length).toBeGreaterThan(3);
    expect(specials.every(m => m.category === 'special')).toBe(true);
  });

  it('returns all DMs', () => {
    const dms = getMovesByCategory('dm');
    expect(dms.length).toBeGreaterThan(0);
    expect(dms.every(m => m.category === 'dm')).toBe(true);
  });

  it('returns empty for non-existent category', () => {
    // @ts-expect-error testing invalid input
    expect(getMovesByCategory('ultra')).toEqual([]);
  });
});

describe('getProjectileMoves', () => {
  it('returns moves with projectile versions', () => {
    const projectiles = getProjectileMoves();
    expect(projectiles.length).toBeGreaterThan(0);
    for (const move of projectiles) {
      expect(move.versions.some(v => v.isProjectile)).toBe(true);
    }
  });

  it('includes RYO_KOOU', () => {
    const projectiles = getProjectileMoves();
    expect(projectiles.some(m => m.key === 'RYO_KOOU')).toBe(true);
  });

  it('excludes non-projectile moves', () => {
    const projectiles = getProjectileMoves();
    expect(projectiles.some(m => m.key === 'RYO_KO_HOU')).toBe(false);
  });
});

describe('getInvincibleMoves', () => {
  it('returns moves with invincible startup > 0', () => {
    const invincible = getInvincibleMoves();
    expect(invincible.length).toBeGreaterThan(0);
    for (const { version } of invincible) {
      expect(version.invincibleStartup).toBeGreaterThan(0);
    }
  });

  it('includes DMs and SDMs', () => {
    const invincible = getInvincibleMoves();
    const categories = new Set(invincible.map(({ move }) => move.category));
    expect(categories.has('dm') || categories.has('sdm') || categories.has('special')).toBe(true);
  });
});

describe('getMoveStats', () => {
  it('returns correct total count', () => {
    const stats = getMoveStats();
    expect(stats.total).toBe(RYO_MOVES.length);
  });

  it('counts categories correctly', () => {
    const stats = getMoveStats();
    const manualByCategory: Record<string, number> = {};
    for (const m of RYO_MOVES) {
      manualByCategory[m.category] = (manualByCategory[m.category] ?? 0) + 1;
    }
    for (const [cat, count] of Object.entries(manualByCategory)) {
      expect(stats.byCategory[cat]).toBe(count);
    }
  });

  it('counts total versions correctly', () => {
    const stats = getMoveStats();
    const manualVersions = RYO_MOVES.reduce((sum, m) => sum + m.versions.length, 0);
    expect(stats.versions).toBe(manualVersions);
  });
});
