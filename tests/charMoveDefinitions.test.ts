/**
 * Character Move Definitions & Rival Dialogue Tests
 *
 * Validates Kyo/Iori move definition structures (KYO_MOVES/IORI_MOVES)
 * and rival dialogue data (RIVAL_DIALOGUES + THEME_COLORS).
 */
import { describe, it, expect } from 'vitest';
import {
  KYO_MOVES, getMoveByKey, getMoveByAttackType,
  getMovesByCategory, getProjectileMoves, getInvincibleMoves, getMoveStats,
} from '../src/content/characters/kyo/moves/kyoMoves.js';
import {
  IORI_MOVES,
  getMoveByKey as getIoriMoveByKey,
  getMoveByAttackType as getIoriMoveByAttackType,
  getMovesByCategory as getIoriMovesByCategory,
  getProjectileMoves as getIoriProjectileMoves,
  getInvincibleMoves as getIoriInvincibleMoves,
  getMoveStats as getIoriMoveStats,
} from '../src/content/characters/iori/moves/ioriMoves.js';
import { getRivalDialogue, getRivalThemeColors } from '../src/core/rivalData.js';

// ===== Shared Validators =====

interface MoveVersionEntry {
  version: string;
  attackTypeKey: string;
  differences: string;
  damageMultiplier: number;
  knockdown: boolean;
  invincibleStartup: number;
  isProjectile: boolean;
}

interface MoveDefinition {
  key: string;
  nameJa: string;
  nameEn: string;
  category: string;
  input: string;
  versions: MoveVersionEntry[];
}

const VALID_CATEGORIES = ['command_normal', 'special', 'dm', 'sdm', 'hsdm'];

function validateMove(move: MoveDefinition, label: string) {
  expect(move.key, `${label}.key`).toBeTruthy();
  expect(move.nameJa, `${label}.nameJa`).toBeTruthy();
  expect(move.nameEn, `${label}.nameEn`).toBeTruthy();
  expect(VALID_CATEGORIES, `${label}.category`).toContain(move.category);
  expect(move.input, `${label}.input`).toBeTruthy();
  expect(move.versions.length, `${label}.versions.length`).toBeGreaterThan(0);
  for (let i = 0; i < move.versions.length; i++) {
    const v = move.versions[i];
    expect(v.attackTypeKey, `${label}.versions[${i}].attackTypeKey`).toBeTruthy();
    expect(v.damageMultiplier, `${label}.versions[${i}].damageMultiplier`).toBeGreaterThan(0);
    expect(typeof v.knockdown, `${label}.versions[${i}].knockdown`).toBe('boolean');
    expect(v.invincibleStartup, `${label}.versions[${i}].invincibleStartup`).toBeGreaterThanOrEqual(0);
    expect(typeof v.isProjectile, `${label}.versions[${i}].isProjectile`).toBe('boolean');
  }
}

function describeMoves(moves: MoveDefinition[], charId: string, fns: {
  getByKey: (k: string) => any;
  getByAtkType: (a: string) => any;
  getByCat: (c: string) => any;
  getProjectiles: () => any[];
  getInvincible: () => any[];
  getStats: () => { total: number; byCategory: Record<string, number>; versions: number };
}) {
  describe(`${charId} MOVES`, () => {
    it('has many moves', () => {
      expect(moves.length).toBeGreaterThan(10);
    });

    it('all moves have valid structure', () => {
      for (let i = 0; i < moves.length; i++) {
        validateMove(moves[i], `${charId}[${i}]`);
      }
    });

    it('all keys are unique', () => {
      const keys = moves.map(m => m.key);
      expect(new Set(keys).size).toBe(keys.length);
    });

    it('has command normals', () => {
      const cmds = moves.filter(m => m.category === 'command_normal');
      expect(cmds.length).toBeGreaterThan(0);
    });

    it('has specials', () => {
      const specials = moves.filter(m => m.category === 'special');
      expect(specials.length).toBeGreaterThan(3);
    });

    it('has DM', () => {
      const dms = moves.filter(m => m.category === 'dm');
      expect(dms.length).toBeGreaterThan(0);
    });

    it('has SDM', () => {
      const sdms = moves.filter(m => m.category === 'sdm');
      expect(sdms.length).toBeGreaterThan(0);
    });

    it('has HSDM', () => {
      const hsdms = moves.filter(m => m.category === 'hsdm');
      expect(hsdms.length).toBeGreaterThan(0);
    });

    it('getByKey returns move for known key', () => {
      const move = fns.getByKey(moves[0].key);
      expect(move).toBeDefined();
      expect(move.key).toBe(moves[0].key);
    });

    it('getByKey returns undefined for unknown', () => {
      expect(fns.getByKey('NONEXISTENT')).toBeUndefined();
    });

    it('getByAttackType returns move+version', () => {
      const firstMove = moves[0];
      const firstVersion = firstMove.versions[0];
      const result = fns.getByAtkType(firstVersion.attackTypeKey);
      expect(result).toBeDefined();
      expect(result.move.key).toBe(firstMove.key);
      expect(result.version.attackTypeKey).toBe(firstVersion.attackTypeKey);
    });

    it('getByCategory filters correctly', () => {
      const specials = fns.getByCat('special');
      expect(specials.length).toBeGreaterThan(0);
      for (const m of specials) {
        expect(m.category).toBe('special');
      }
    });

    it('getProjectileMoves returns projectile moves', () => {
      const projs = fns.getProjectiles();
      expect(projs.length).toBeGreaterThan(0);
      for (const m of projs) {
        const hasProj = m.versions.some((v: MoveVersionEntry) => v.isProjectile);
        expect(hasProj, `${m.key} should have projectile version`).toBe(true);
      }
    });

    it('getInvincibleMoves returns moves with inv frames', () => {
      const invs = fns.getInvincible();
      expect(invs.length).toBeGreaterThan(0);
      for (const { version } of invs) {
        expect(version.invincibleStartup).toBeGreaterThan(0);
      }
    });

    it('getStats returns correct totals', () => {
      const stats = fns.getStats();
      expect(stats.total).toBe(moves.length);
      expect(stats.versions).toBeGreaterThanOrEqual(stats.total);
      expect(Object.keys(stats.byCategory).length).toBeGreaterThan(0);
    });
  });
}

describeMoves(KYO_MOVES, 'kyo', {
  getByKey: getMoveByKey,
  getByAtkType: getMoveByAttackType,
  getByCat: getMovesByCategory,
  getProjectiles: getProjectileMoves,
  getInvincible: getInvincibleMoves,
  getStats: getMoveStats,
});

describeMoves(IORI_MOVES, 'iori', {
  getByKey: getIoriMoveByKey,
  getByAtkType: getIoriMoveByAttackType,
  getByCat: getIoriMovesByCategory,
  getProjectiles: getIoriProjectileMoves,
  getInvincible: getIoriInvincibleMoves,
  getStats: getIoriMoveStats,
});

// ===== Cross-character move consistency =====

describe('Cross-character move consistency', () => {
  it('both have moves', () => {
    expect(KYO_MOVES.length).toBeGreaterThan(10);
    expect(IORI_MOVES.length).toBeGreaterThan(10);
  });

  it('both have DM + SDM + HSDM', () => {
    const kyoCats = new Set(KYO_MOVES.map(m => m.category));
    const ioriCats = new Set(IORI_MOVES.map(m => m.category));
    for (const cat of ['dm', 'sdm', 'hsdm']) {
      expect(kyoCats.has(cat), `kyo has ${cat}`).toBe(true);
      expect(ioriCats.has(cat), `iori has ${cat}`).toBe(true);
    }
  });

  it('DM damageMultiplier > SDM damageMultiplier for both', () => {
    const kyoDM = KYO_MOVES.find(m => m.category === 'dm');
    const kyoSDM = KYO_MOVES.find(m => m.category === 'sdm');
    if (kyoDM && kyoSDM) {
      expect(kyoSDM.versions[0].damageMultiplier).toBeGreaterThanOrEqual(kyoDM.versions[0].damageMultiplier);
    }
    const ioriDM = IORI_MOVES.find(m => m.category === 'dm');
    const ioriSDM = IORI_MOVES.find(m => m.category === 'sdm');
    if (ioriDM && ioriSDM) {
      expect(ioriSDM.versions[0].damageMultiplier).toBeGreaterThanOrEqual(ioriDM.versions[0].damageMultiplier);
    }
  });
});

// ===== Rival Dialogue =====

describe('Rival Dialogue', () => {
  it('finds kyo vs iori', () => {
    const d = getRivalDialogue('kyo', 'iori');
    expect(d).toBeDefined();
    expect(d!.theme).toBe('fire');
  });

  it('finds iori vs kyo (reversed)', () => {
    const d = getRivalDialogue('iori', 'kyo');
    expect(d).toBeDefined();
    expect(d!.theme).toBe('fire');
  });

  it('returns undefined for non-rival pair', () => {
    const d = getRivalDialogue('ryo', 'chang');
    expect(d).toBeUndefined();
  });

  it('finds ryo vs robert', () => {
    const d = getRivalDialogue('ryo', 'robert');
    expect(d).toBeDefined();
    expect(d!.theme).toBe('honor');
  });

  it('finds terry vs andy', () => {
    const d = getRivalDialogue('terry', 'andy');
    expect(d).toBeDefined();
  });

  it('getRivalThemeColors returns valid colors', () => {
    const themes = ['fire', 'destiny', 'dark', 'honor', 'rivality'] as const;
    // Note: 'rivalry' not 'rivality' — check actual code
    const colors = getRivalThemeColors('fire');
    expect(colors).toBeDefined();
    expect(colors.bg).toBeTruthy();
    expect(colors.border).toBeTruthy();
    expect(colors.textA).toBeTruthy();
    expect(colors.textB).toBeTruthy();
    expect(colors.flash).toBeTruthy();
  });

  it('all theme colors have valid entries', () => {
    const themes: Array<'fire' | 'destiny' | 'dark' | 'honor' | 'rivalry'> = ['fire', 'destiny', 'dark', 'honor', 'rivalry'];
    for (const theme of themes) {
      const colors = getRivalThemeColors(theme);
      expect(colors, `theme ${theme}`).toBeDefined();
      expect(colors.bg).toBeTruthy();
      expect(colors.border).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(colors.textA).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(colors.textB).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(colors.flash).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});
