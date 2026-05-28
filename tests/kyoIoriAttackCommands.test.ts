/**
 * Kyo/Iori Attack Keys, Commands & Move List Regression Tests
 *
 * Validates:
 * - Attack key arrays have required entries (normals, specials, DMs)
 * - Move list structure and completeness
 * - Available actions arrays
 * - Win quotes
 * - Lookup functions return data for known keys
 */
import { describe, it, expect } from 'vitest';
import {
  KYO_ATTACK_KEYS, getKyoFrameData, getKyoAttackFrameData,
} from '../src/content/characters/kyo/attacks/kyoAttacks.js';
import {
  IORI_ATTACK_KEYS, getIoriFrameData, getIoriAttackFrameData,
} from '../src/content/characters/iori/attacks/ioriAttacks.js';
import {
  KYO_MOVE_LIST, KYO_WIN_QUOTES, KYO_AVAILABLE_ACTIONS,
  type KyoMoveEntry,
} from '../src/content/characters/kyo/commands/kyoCommands.js';
import {
  IORI_MOVE_LIST, IORI_WIN_QUOTES, IORI_AVAILABLE_ACTIONS,
  type IoriMoveEntry,
} from '../src/content/characters/iori/commands/ioriCommands.js';

// ════════════════════════════════════════════════════════════════
// Kyo Attack Keys
// ════════════════════════════════════════════════════════════════

describe('Kyo Attack Keys', () => {
  it('has at least 40 entries', () => {
    expect(KYO_ATTACK_KEYS.length).toBeGreaterThanOrEqual(40);
  });

  it('has all standing normals', () => {
    expect(KYO_ATTACK_KEYS).toContain('STAND_A');
    expect(KYO_ATTACK_KEYS).toContain('STAND_B');
    expect(KYO_ATTACK_KEYS).toContain('STAND_C');
    expect(KYO_ATTACK_KEYS).toContain('STAND_D');
  });

  it('has all close normals', () => {
    expect(KYO_ATTACK_KEYS).toContain('CLOSE_A');
    expect(KYO_ATTACK_KEYS).toContain('CLOSE_B');
    expect(KYO_ATTACK_KEYS).toContain('CLOSE_C');
    expect(KYO_ATTACK_KEYS).toContain('CLOSE_D');
  });

  it('has all crouch normals', () => {
    expect(KYO_ATTACK_KEYS).toContain('CROUCH_A');
    expect(KYO_ATTACK_KEYS).toContain('CROUCH_B');
    expect(KYO_ATTACK_KEYS).toContain('CROUCH_C');
    expect(KYO_ATTACK_KEYS).toContain('CROUCH_D');
  });

  it('has all jump normals', () => {
    expect(KYO_ATTACK_KEYS).toContain('JUMP_A');
    expect(KYO_ATTACK_KEYS).toContain('JUMP_B');
    expect(KYO_ATTACK_KEYS).toContain('JUMP_C');
    expect(KYO_ATTACK_KEYS).toContain('JUMP_D');
  });

  it('has command normals', () => {
    expect(KYO_ATTACK_KEYS).toContain('CMD_GOFU_YOU');
    expect(KYO_ATTACK_KEYS).toContain('CMD_88SHIKI');
    expect(KYO_ATTACK_KEYS).toContain('CMD_NARAKU');
  });

  it('has specials', () => {
    expect(KYO_ATTACK_KEYS).toContain('KYO_ONIYAKI');
    expect(KYO_ATTACK_KEYS).toContain('KYO_ONIYAKI_C');
    expect(KYO_ATTACK_KEYS).toContain('KYO_YAMIBARAI');
    expect(KYO_ATTACK_KEYS).toContain('KYO_YAMIBARAI_C');
    expect(KYO_ATTACK_KEYS).toContain('KYO_75KAI');
    expect(KYO_ATTACK_KEYS).toContain('KYO_RED_KICK');
  });

  it('has Aragami rekka chain', () => {
    expect(KYO_ATTACK_KEYS).toContain('KYO_ARAGAMI');
    expect(KYO_ATTACK_KEYS).toContain('KYO_ARAGAMI_KONOKIZU');
    expect(KYO_ATTACK_KEYS).toContain('KYO_ARAGAMI_YANOSABI');
    expect(KYO_ATTACK_KEYS).toContain('KYO_NANASE');
    expect(KYO_ATTACK_KEYS).toContain('KYO_KOTO_TSUKI');
    expect(KYO_ATTACK_KEYS).toContain('KYO_YAKISOGI');
  });

  it('has Dokugami rekka chain', () => {
    expect(KYO_ATTACK_KEYS).toContain('KYO_DOKUGAMI');
    expect(KYO_ATTACK_KEYS).toContain('KYO_TSUMIYOMI');
    expect(KYO_ATTACK_KEYS).toContain('KYO_BATSUYOMI');
  });

  it('has throws and CD blowback', () => {
    expect(KYO_ATTACK_KEYS).toContain('THROW');
    expect(KYO_ATTACK_KEYS).toContain('STAND_CD');
    expect(KYO_ATTACK_KEYS).toContain('JUMP_CD');
  });

  it('has DM/SDM/HSDM', () => {
    expect(KYO_ATTACK_KEYS).toContain('DM_OROCHINAGI');
    expect(KYO_ATTACK_KEYS).toContain('SDM_OROCHINAGI');
    expect(KYO_ATTACK_KEYS).toContain('HSDM_OROCHINAGI');
  });

  it('no duplicate keys', () => {
    const unique = new Set(KYO_ATTACK_KEYS);
    expect(unique.size).toBe(KYO_ATTACK_KEYS.length);
  });

  it('getKyoFrameData returns an object', () => {
    const fd = getKyoFrameData();
    expect(typeof fd).toBe('object');
  });

  it('getKyoAttackFrameData returns entry for known key', () => {
    const fd = getKyoAttackFrameData('STAND_A');
    expect(fd).toBeDefined();
  });
});

// ════════════════════════════════════════════════════════════════
// Iori Attack Keys
// ════════════════════════════════════════════════════════════════

describe('Iori Attack Keys', () => {
  it('has at least 35 entries', () => {
    expect(IORI_ATTACK_KEYS.length).toBeGreaterThanOrEqual(35);
  });

  it('has all standing normals', () => {
    expect(IORI_ATTACK_KEYS).toContain('STAND_A');
    expect(IORI_ATTACK_KEYS).toContain('STAND_B');
    expect(IORI_ATTACK_KEYS).toContain('STAND_C');
    expect(IORI_ATTACK_KEYS).toContain('STAND_D');
  });

  it('has all crouch normals', () => {
    expect(IORI_ATTACK_KEYS).toContain('CROUCH_A');
    expect(IORI_ATTACK_KEYS).toContain('CROUCH_B');
    expect(IORI_ATTACK_KEYS).toContain('CROUCH_C');
    expect(IORI_ATTACK_KEYS).toContain('CROUCH_D');
  });

  it('has command normals', () => {
    expect(IORI_ATTACK_KEYS).toContain('IORI_YUMEYUMI');
    expect(IORI_ATTACK_KEYS).toContain('IORI_KATANUGI');
    expect(IORI_ATTACK_KEYS).toContain('IORI_YUKIWARUI');
  });

  it('has specials', () => {
    expect(IORI_ATTACK_KEYS).toContain('IORI_ONIYAKI');
    expect(IORI_ATTACK_KEYS).toContain('IORI_ONIYAKI_C');
    expect(IORI_ATTACK_KEYS).toContain('IORI_YAMIBARAI');
    expect(IORI_ATTACK_KEYS).toContain('IORI_YAMIBARAI_C');
    expect(IORI_ATTACK_KEYS).toContain('IORI_KOTOTSUKI');
    expect(IORI_ATTACK_KEYS).toContain('IORI_KOTOTSUKI_D');
    expect(IORI_ATTACK_KEYS).toContain('IORI_KUZUKAZE');
  });

  it('has Aoihana A chain', () => {
    expect(IORI_ATTACK_KEYS).toContain('IORI_AOIHANA');
    expect(IORI_ATTACK_KEYS).toContain('IORI_AOIHANA_2');
    expect(IORI_ATTACK_KEYS).toContain('IORI_AOIHANA_3');
  });

  it('has Aoihana C chain', () => {
    expect(IORI_ATTACK_KEYS).toContain('IORI_AOIHANA_C');
    expect(IORI_ATTACK_KEYS).toContain('IORI_AOIHANA_C_2');
    expect(IORI_ATTACK_KEYS).toContain('IORI_AOIHANA_C_3');
  });

  it('has DM/SDM/HSDM', () => {
    expect(IORI_ATTACK_KEYS).toContain('DM_YATAGARASU');
    expect(IORI_ATTACK_KEYS).toContain('SDM_YATAGARASU');
    expect(IORI_ATTACK_KEYS).toContain('HSDM_YAOTOME');
  });

  it('no duplicate keys', () => {
    const unique = new Set(IORI_ATTACK_KEYS);
    expect(unique.size).toBe(IORI_ATTACK_KEYS.length);
  });

  it('getIoriFrameData returns an object', () => {
    const fd = getIoriFrameData();
    expect(typeof fd).toBe('object');
  });

  it('getIoriAttackFrameData returns entry for known key', () => {
    const fd = getIoriAttackFrameData('STAND_A');
    expect(fd).toBeDefined();
  });
});

// ════════════════════════════════════════════════════════════════
// Kyo Move List / Commands
// ════════════════════════════════════════════════════════════════

const VALID_MOVE_TYPES: KyoMoveEntry['type'][] = ['command', 'special', 'dm', 'sdm', 'hsdm', 'system'];

describe('Kyo Move List', () => {
  it('has at least 15 moves', () => {
    expect(KYO_MOVE_LIST.length).toBeGreaterThanOrEqual(15);
  });

  it('all moves have valid structure', () => {
    for (const move of KYO_MOVE_LIST) {
      expect(move.name.length, `name for ${move.name}`).toBeGreaterThan(0);
      expect(move.input.length, `input for ${move.name}`).toBeGreaterThan(0);
      expect(VALID_MOVE_TYPES, `type for ${move.name}`).toContain(move.type);
    }
  });

  it('has command normals', () => {
    const cmds = KYO_MOVE_LIST.filter(m => m.type === 'command');
    expect(cmds.length).toBeGreaterThanOrEqual(3);
    const cmdNames = cmds.map(m => m.attackTypeKey);
    expect(cmdNames).toContain('CMD_GOFU_YOU');
    expect(cmdNames).toContain('CMD_88SHIKI');
    expect(cmdNames).toContain('CMD_NARAKU');
  });

  it('has specials', () => {
    const specials = KYO_MOVE_LIST.filter(m => m.type === 'special');
    expect(specials.length).toBeGreaterThanOrEqual(8);
  });

  it('has DM entry', () => {
    const dms = KYO_MOVE_LIST.filter(m => m.type === 'dm');
    expect(dms.length).toBeGreaterThanOrEqual(1);
    expect(dms[0].attackTypeKey).toBe('DM_OROCHINAGI');
  });

  it('has SDM entry', () => {
    const sdms = KYO_MOVE_LIST.filter(m => m.type === 'sdm');
    expect(sdms.length).toBeGreaterThanOrEqual(1);
  });

  it('has HSDM entry', () => {
    const hsdms = KYO_MOVE_LIST.filter(m => m.type === 'hsdm');
    expect(hsdms.length).toBeGreaterThanOrEqual(1);
  });

  it('has system move', () => {
    const systems = KYO_MOVE_LIST.filter(m => m.type === 'system');
    expect(systems.length).toBeGreaterThanOrEqual(1);
  });

  it('all non-system moves have attackTypeKey', () => {
    for (const move of KYO_MOVE_LIST) {
      if (move.type !== 'system') {
        expect(move.attackTypeKey, `attackTypeKey for ${move.name}`).toBeDefined();
      }
    }
  });

  it('Aragami chain has correct follow-ups', () => {
    const aragami = KYO_MOVE_LIST.filter(m =>
      m.attackTypeKey?.startsWith('KYO_ARAGAMI') || m.attackTypeKey === 'KYO_NANASE' ||
      m.attackTypeKey === 'KYO_KOTO_TSUKI' || m.attackTypeKey === 'KYO_YAKISOGI',
    );
    expect(aragami.length).toBeGreaterThanOrEqual(3);
  });
});

describe('Kyo Win Quotes', () => {
  it('has at least 3 quotes', () => {
    expect(KYO_WIN_QUOTES.length).toBeGreaterThanOrEqual(3);
  });

  it('all quotes are non-empty strings', () => {
    for (const q of KYO_WIN_QUOTES) {
      expect(q.length).toBeGreaterThan(0);
    }
  });
});

describe('Kyo Available Actions', () => {
  it('has at least 25 actions', () => {
    expect(KYO_AVAILABLE_ACTIONS.length).toBeGreaterThanOrEqual(25);
  });

  it('has core movement actions', () => {
    expect(KYO_AVAILABLE_ACTIONS).toContain('idle');
    expect(KYO_AVAILABLE_ACTIONS).toContain('walk_forward');
    expect(KYO_AVAILABLE_ACTIONS).toContain('run');
    expect(KYO_AVAILABLE_ACTIONS).toContain('jump_up');
    expect(KYO_AVAILABLE_ACTIONS).toContain('crouch');
    expect(KYO_AVAILABLE_ACTIONS).toContain('block');
  });

  it('has normal attacks', () => {
    expect(KYO_AVAILABLE_ACTIONS).toContain('stand_a');
    expect(KYO_AVAILABLE_ACTIONS).toContain('stand_c');
    expect(KYO_AVAILABLE_ACTIONS).toContain('crouch_a');
    expect(KYO_AVAILABLE_ACTIONS).toContain('crouch_d');
  });

  it('has Kyo specials', () => {
    expect(KYO_AVAILABLE_ACTIONS).toContain('kyo_yamibarai');
    expect(KYO_AVAILABLE_ACTIONS).toContain('kyo_oniyaki');
    expect(KYO_AVAILABLE_ACTIONS).toContain('kyo_aragami');
  });

  it('has DM', () => {
    expect(KYO_AVAILABLE_ACTIONS).toContain('dm_orochinagi');
  });

  it('no duplicate actions', () => {
    const unique = new Set(KYO_AVAILABLE_ACTIONS);
    expect(unique.size).toBe(KYO_AVAILABLE_ACTIONS.length);
  });
});

// ════════════════════════════════════════════════════════════════
// Iori Move List / Commands
// ════════════════════════════════════════════════════════════════

describe('Iori Move List', () => {
  it('has at least 15 moves', () => {
    expect(IORI_MOVE_LIST.length).toBeGreaterThanOrEqual(15);
  });

  it('all moves have valid structure', () => {
    for (const move of IORI_MOVE_LIST) {
      expect(move.name.length, `name for ${move.name}`).toBeGreaterThan(0);
      expect(move.input.length, `input for ${move.name}`).toBeGreaterThan(0);
      expect(VALID_MOVE_TYPES, `type for ${move.name}`).toContain(move.type);
    }
  });

  it('has command normals', () => {
    const cmds = IORI_MOVE_LIST.filter(m => m.type === 'command');
    expect(cmds.length).toBeGreaterThanOrEqual(3);
    const cmdKeys = cmds.map(m => m.attackTypeKey);
    expect(cmdKeys).toContain('IORI_YUMEYUMI');
    expect(cmdKeys).toContain('IORI_KATANUGI');
    expect(cmdKeys).toContain('IORI_YUKIWARUI');
  });

  it('has specials including aoihana chain', () => {
    const specials = IORI_MOVE_LIST.filter(m => m.type === 'special');
    expect(specials.length).toBeGreaterThanOrEqual(10);
  });

  it('has aoihana A chain', () => {
    const aKeys = IORI_MOVE_LIST.filter(m =>
      m.attackTypeKey === 'IORI_AOIHANA' ||
      m.attackTypeKey === 'IORI_AOIHANA_2' ||
      m.attackTypeKey === 'IORI_AOIHANA_3',
    );
    expect(aKeys.length).toBe(3);
  });

  it('has aoihana C chain', () => {
    const cKeys = IORI_MOVE_LIST.filter(m =>
      m.attackTypeKey === 'IORI_AOIHANA_C' ||
      m.attackTypeKey === 'IORI_AOIHANA_C_2' ||
      m.attackTypeKey === 'IORI_AOIHANA_C_3',
    );
    expect(cKeys.length).toBe(3);
  });

  it('has DM entry', () => {
    const dms = IORI_MOVE_LIST.filter(m => m.type === 'dm');
    expect(dms.length).toBeGreaterThanOrEqual(1);
    expect(dms[0].attackTypeKey).toBe('DM_YATAGARASU');
  });

  it('has SDM entry', () => {
    const sdms = IORI_MOVE_LIST.filter(m => m.type === 'sdm');
    expect(sdms.length).toBeGreaterThanOrEqual(1);
  });

  it('has HSDM entry', () => {
    const hsdms = IORI_MOVE_LIST.filter(m => m.type === 'hsdm');
    expect(hsdms.length).toBeGreaterThanOrEqual(1);
  });

  it('all non-system moves have attackTypeKey', () => {
    for (const move of IORI_MOVE_LIST) {
      if (move.type !== 'system') {
        expect(move.attackTypeKey, `attackTypeKey for ${move.name}`).toBeDefined();
      }
    }
  });
});

describe('Iori Win Quotes', () => {
  it('has at least 3 quotes', () => {
    expect(IORI_WIN_QUOTES.length).toBeGreaterThanOrEqual(3);
  });

  it('all quotes are non-empty strings', () => {
    for (const q of IORI_WIN_QUOTES) {
      expect(q.length).toBeGreaterThan(0);
    }
  });
});

describe('Iori Available Actions', () => {
  it('has at least 20 actions', () => {
    expect(IORI_AVAILABLE_ACTIONS.length).toBeGreaterThanOrEqual(20);
  });

  it('has core movement actions', () => {
    expect(IORI_AVAILABLE_ACTIONS).toContain('idle');
    expect(IORI_AVAILABLE_ACTIONS).toContain('walk_forward');
    expect(IORI_AVAILABLE_ACTIONS).toContain('jump_up');
    expect(IORI_AVAILABLE_ACTIONS).toContain('stand_a');
    expect(IORI_AVAILABLE_ACTIONS).toContain('crouch_a');
  });

  it('has Iori specials', () => {
    expect(IORI_AVAILABLE_ACTIONS).toContain('oniyaki');
    expect(IORI_AVAILABLE_ACTIONS).toContain('yamibarai');
    expect(IORI_AVAILABLE_ACTIONS).toContain('aoihana');
    expect(IORI_AVAILABLE_ACTIONS).toContain('kuzukaze');
  });

  it('has DM', () => {
    expect(IORI_AVAILABLE_ACTIONS).toContain('dm_yatagarasu');
  });

  it('no duplicate actions', () => {
    const unique = new Set(IORI_AVAILABLE_ACTIONS);
    expect(unique.size).toBe(IORI_AVAILABLE_ACTIONS.length);
  });
});

// ════════════════════════════════════════════════════════════════
// Cross-Character Validation
// ════════════════════════════════════════════════════════════════

describe('Kyo/Iori Attack & Command Cross-Validation', () => {
  it('no overlapping character-specific attack keys', () => {
    const kyoSpecific = KYO_ATTACK_KEYS.filter(k => k.startsWith('KYO_') || k.startsWith('CMD_') || k.startsWith('HSDM_OROCHINAGI'));
    const ioriSpecific = IORI_ATTACK_KEYS.filter(k => k.startsWith('IORI_'));
    const overlap = kyoSpecific.filter(k => ioriSpecific.includes(k));
    expect(overlap).toHaveLength(0);
  });

  it('share the same generic normals', () => {
    const genericNormals = ['STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
      'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D'];
    for (const key of genericNormals) {
      expect(KYO_ATTACK_KEYS).toContain(key);
      expect(IORI_ATTACK_KEYS).toContain(key);
    }
  });

  it('move lists have different HSDM names', () => {
    const kyoHsdm = KYO_MOVE_LIST.filter(m => m.type === 'hsdm');
    const ioriHsdm = IORI_MOVE_LIST.filter(m => m.type === 'hsdm');
    expect(kyoHsdm[0].name).not.toBe(ioriHsdm[0].name);
  });

  it('win quotes are different between characters', () => {
    const overlap = KYO_WIN_QUOTES.filter(q => IORI_WIN_QUOTES.includes(q));
    expect(overlap).toHaveLength(0);
  });
});
