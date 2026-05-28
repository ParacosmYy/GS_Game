/**
 * Ryo Attack Keys, Commands & Move Definitions Regression Tests
 *
 * Validates Ryo attack key arrays, command/move list structure,
 * move definitions with version entries, and query API functions.
 */
import { describe, it, expect } from 'vitest';
import {
  RYO_ATTACK_KEYS, getRyoFrameData, getRyoAttackFrameData,
} from '../src/content/characters/ryo/attacks/ryoAttacks.js';
import {
  RYO_MOVE_LIST, RYO_AVAILABLE_ACTIONS,
  type RyoMoveEntry,
} from '../src/content/characters/ryo/commands/ryoCommands.js';
import {
  RYO_MOVES, getMoveByKey, getMoveByAttackType,
  getMovesByCategory, getProjectileMoves, getInvincibleMoves,
  getMoveStats,
  type MoveDefinition, type MoveVersionEntry,
} from '../src/content/characters/ryo/moves/ryoMoves.js';

const VALID_MOVE_TYPES: RyoMoveEntry['type'][] = ['command', 'special', 'dm', 'sdm', 'hsdm', 'system'];
const VALID_CATEGORIES: MoveDefinition['category'][] = ['command_normal', 'special', 'dm', 'sdm', 'hsdm'];
const VALID_VERSIONS: MoveVersionEntry['version'][] = ['A', 'C', 'D', 'MAX'];

// ════════════════════════════════════════════════════════════════
// Ryo Attack Keys
// ════════════════════════════════════════════════════════════════

describe('Ryo Attack Keys', () => {
  it('has at least 30 entries', () => {
    expect(RYO_ATTACK_KEYS.length).toBeGreaterThanOrEqual(30);
  });

  it('has all standing normals', () => {
    expect(RYO_ATTACK_KEYS).toContain('STAND_A');
    expect(RYO_ATTACK_KEYS).toContain('STAND_B');
    expect(RYO_ATTACK_KEYS).toContain('STAND_C');
    expect(RYO_ATTACK_KEYS).toContain('STAND_D');
  });

  it('has all crouch normals', () => {
    expect(RYO_ATTACK_KEYS).toContain('CROUCH_A');
    expect(RYO_ATTACK_KEYS).toContain('CROUCH_B');
    expect(RYO_ATTACK_KEYS).toContain('CROUCH_C');
    expect(RYO_ATTACK_KEYS).toContain('CROUCH_D');
  });

  it('has command normals', () => {
    expect(RYO_ATTACK_KEYS).toContain('RYO_TSURIZAO');
    expect(RYO_ATTACK_KEYS).toContain('RYO_ORISHI');
  });

  it('has specials', () => {
    expect(RYO_ATTACK_KEYS).toContain('RYO_KOOU');
    expect(RYO_ATTACK_KEYS).toContain('RYO_KOOU_C');
    expect(RYO_ATTACK_KEYS).toContain('RYO_KO_HOU');
    expect(RYO_ATTACK_KEYS).toContain('RYO_KO_HOU_C');
    expect(RYO_ATTACK_KEYS).toContain('RYO_HIEN');
    expect(RYO_ATTACK_KEYS).toContain('RYO_ZANRETSU_KEN');
  });

  it('has DM/SDM/HSDM', () => {
    expect(RYO_ATTACK_KEYS).toContain('DM_TEN_HA_OU');
    expect(RYO_ATTACK_KEYS).toContain('DM_RYUKO_RANBU');
    expect(RYO_ATTACK_KEYS).toContain('SDM_TEN_HA_OU');
    expect(RYO_ATTACK_KEYS).toContain('SDM_RYUKO_RANBU');
    expect(RYO_ATTACK_KEYS).toContain('HSDM_RYUKO_RANBU');
  });

  it('no duplicate keys', () => {
    const unique = new Set(RYO_ATTACK_KEYS);
    expect(unique.size).toBe(RYO_ATTACK_KEYS.length);
  });

  it('getRyoFrameData returns an object', () => {
    const fd = getRyoFrameData();
    expect(typeof fd).toBe('object');
  });

  it('getRyoAttackFrameData returns entry for known key', () => {
    const fd = getRyoAttackFrameData('STAND_A');
    expect(fd).toBeDefined();
  });
});

// ════════════════════════════════════════════════════════════════
// Ryo Commands / Move List
// ════════════════════════════════════════════════════════════════

describe('Ryo Move List', () => {
  it('has at least 12 moves', () => {
    expect(RYO_MOVE_LIST.length).toBeGreaterThanOrEqual(12);
  });

  it('all moves have valid structure', () => {
    for (const move of RYO_MOVE_LIST) {
      expect(move.name.length, `name for ${move.name}`).toBeGreaterThan(0);
      expect(move.input.length, `input for ${move.name}`).toBeGreaterThan(0);
      expect(VALID_MOVE_TYPES, `type for ${move.name}`).toContain(move.type);
    }
  });

  it('has command normals', () => {
    const cmds = RYO_MOVE_LIST.filter(m => m.type === 'command');
    expect(cmds.length).toBeGreaterThanOrEqual(2);
  });

  it('has specials', () => {
    const specials = RYO_MOVE_LIST.filter(m => m.type === 'special');
    expect(specials.length).toBeGreaterThanOrEqual(5);
  });

  it('has DMs', () => {
    const dms = RYO_MOVE_LIST.filter(m => m.type === 'dm');
    expect(dms.length).toBeGreaterThanOrEqual(2);
  });

  it('has SDMs', () => {
    const sdms = RYO_MOVE_LIST.filter(m => m.type === 'sdm');
    expect(sdms.length).toBeGreaterThanOrEqual(2);
  });

  it('has HSDM', () => {
    const hsdms = RYO_MOVE_LIST.filter(m => m.type === 'hsdm');
    expect(hsdms.length).toBeGreaterThanOrEqual(1);
  });

  it('has system move', () => {
    expect(RYO_MOVE_LIST.filter(m => m.type === 'system').length).toBeGreaterThanOrEqual(1);
  });

  it('all non-system moves have attackTypeKey', () => {
    for (const move of RYO_MOVE_LIST) {
      if (move.type !== 'system') {
        expect(move.attackTypeKey, `attackTypeKey for ${move.name}`).toBeDefined();
      }
    }
  });
});

describe('Ryo Available Actions', () => {
  it('has at least 25 actions', () => {
    expect(RYO_AVAILABLE_ACTIONS.length).toBeGreaterThanOrEqual(25);
  });

  it('has core movement actions', () => {
    expect(RYO_AVAILABLE_ACTIONS).toContain('idle');
    expect(RYO_AVAILABLE_ACTIONS).toContain('walk_forward');
    expect(RYO_AVAILABLE_ACTIONS).toContain('run');
    expect(RYO_AVAILABLE_ACTIONS).toContain('jump_up');
    expect(RYO_AVAILABLE_ACTIONS).toContain('crouch');
    expect(RYO_AVAILABLE_ACTIONS).toContain('block');
  });

  it('has normal attacks', () => {
    expect(RYO_AVAILABLE_ACTIONS).toContain('stand_a');
    expect(RYO_AVAILABLE_ACTIONS).toContain('stand_c');
    expect(RYO_AVAILABLE_ACTIONS).toContain('crouch_a');
  });

  it('has Ryo specials', () => {
    expect(RYO_AVAILABLE_ACTIONS).toContain('ryo_koou');
    expect(RYO_AVAILABLE_ACTIONS).toContain('ryo_ko_hou');
    expect(RYO_AVAILABLE_ACTIONS).toContain('ryo_hien');
  });

  it('has DM', () => {
    expect(RYO_AVAILABLE_ACTIONS).toContain('dm_ten_ha_ou');
  });

  it('no duplicate actions', () => {
    const unique = new Set(RYO_AVAILABLE_ACTIONS);
    expect(unique.size).toBe(RYO_AVAILABLE_ACTIONS.length);
  });
});

// ════════════════════════════════════════════════════════════════
// Ryo Move Definitions
// ════════════════════════════════════════════════════════════════

describe('Ryo Move Definitions', () => {
  it('has at least 10 moves', () => {
    expect(RYO_MOVES.length).toBeGreaterThanOrEqual(10);
  });

  it('all moves have valid structure', () => {
    for (const move of RYO_MOVES) {
      expect(move.key.length, `${move.key}.key`).toBeGreaterThan(0);
      expect(move.nameJa.length, `${move.key}.nameJa`).toBeGreaterThan(0);
      expect(move.nameEn.length, `${move.key}.nameEn`).toBeGreaterThan(0);
      expect(VALID_CATEGORIES, `${move.key}.category`).toContain(move.category);
      expect(move.input.length, `${move.key}.input`).toBeGreaterThan(0);
      expect(move.versions.length, `${move.key}.versions`).toBeGreaterThan(0);

      for (const ver of move.versions) {
        const vP = `${move.key}[${ver.attackTypeKey}]`;
        expect(VALID_VERSIONS, `${vP}.version`).toContain(ver.version);
        expect(ver.attackTypeKey.length, `${vP}.attackTypeKey`).toBeGreaterThan(0);
        expect(ver.damageMultiplier, `${vP}.damageMultiplier`).toBeGreaterThan(0);
        expect(typeof ver.knockdown, `${vP}.knockdown`).toBe('boolean');
        expect(ver.invincibleStartup, `${vP}.invincibleStartup`).toBeGreaterThanOrEqual(0);
        expect(typeof ver.isProjectile, `${vP}.isProjectile`).toBe('boolean');
      }
    }
  });

  it('no duplicate keys', () => {
    const keys = RYO_MOVES.map(m => m.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('has specials', () => {
    const specials = getMovesByCategory('special');
    expect(specials.length).toBeGreaterThanOrEqual(5);
  });

  it('has DM/SDM/HSDM', () => {
    expect(getMovesByCategory('dm').length).toBeGreaterThanOrEqual(1);
    expect(getMovesByCategory('sdm').length).toBeGreaterThanOrEqual(1);
    expect(getMovesByCategory('hsdm').length).toBeGreaterThanOrEqual(1);
  });

  it('C versions are stronger than A versions', () => {
    const koou = getMoveByKey('RYO_KOOU');
    if (koou && koou.versions.length >= 2) {
      const aVer = koou.versions.find(v => v.version === 'A');
      const cVer = koou.versions.find(v => v.version === 'C');
      if (aVer && cVer) {
        expect(cVer.damageMultiplier).toBeGreaterThan(aVer.damageMultiplier);
      }
    }
  });

  it('DM/SDM/HSDM damageMultiplier escalation', () => {
    const dm = getMoveByKey('DM_RYUKO_RANBU')!;
    const sdm = getMoveByKey('SDM_RYUKO_RANBU')!;
    const hsdm = getMoveByKey('HSDM_RYUKO_RANBU')!;
    if (dm && sdm && hsdm) {
      expect(sdm.versions[0].damageMultiplier).toBeGreaterThan(dm.versions[0].damageMultiplier);
      expect(hsdm.versions[0].damageMultiplier).toBeGreaterThan(sdm.versions[0].damageMultiplier);
    }
  });

  it('DM/SDM/HSDM invincibleStartup escalation', () => {
    const dm = getMoveByKey('DM_RYUKO_RANBU')!;
    const sdm = getMoveByKey('SDM_RYUKO_RANBU')!;
    const hsdm = getMoveByKey('HSDM_RYUKO_RANBU')!;
    if (dm && sdm && hsdm) {
      expect(sdm.versions[0].invincibleStartup).toBeGreaterThanOrEqual(dm.versions[0].invincibleStartup);
      expect(hsdm.versions[0].invincibleStartup).toBeGreaterThanOrEqual(sdm.versions[0].invincibleStartup);
    }
  });

  it('projectile moves exist', () => {
    const projectiles = getProjectileMoves();
    expect(projectiles.length).toBeGreaterThanOrEqual(1);
  });

  it('invincible moves exist', () => {
    const inv = getInvincibleMoves();
    expect(inv.length).toBeGreaterThanOrEqual(1);
  });

  it('getMoveByKey returns correct move', () => {
    const move = getMoveByKey('RYO_KO_HOU');
    expect(move).toBeDefined();
    expect(move!.key).toBe('RYO_KO_HOU');
  });

  it('getMoveByKey returns undefined for unknown', () => {
    expect(getMoveByKey('NONEXISTENT')).toBeUndefined();
  });

  it('getMoveByAttackType returns correct entry', () => {
    const result = getMoveByAttackType('RYO_KO_HOU_C');
    expect(result).toBeDefined();
    expect(result!.move.key).toBe('RYO_KO_HOU');
    expect(result!.version.attackTypeKey).toBe('RYO_KO_HOU_C');
  });

  it('getMoveStats returns valid stats', () => {
    const stats = getMoveStats();
    expect(stats.total).toBe(RYO_MOVES.length);
    expect(stats.versions).toBeGreaterThanOrEqual(stats.total);
    expect(Object.keys(stats.byCategory).length).toBeGreaterThanOrEqual(3);
  });
});
