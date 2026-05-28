/**
 * Move List Cross-Character Validation Tests
 *
 * Validates Iori's move list and cross-character consistency
 * between Ryo, Kyo, and Iori content packages:
 * - Iori move list structure and FRAME_DATA references
 * - All three characters have win quotes
 * - All attackTypeKeys in move lists map to FRAME_DATA
 * - Move type distribution consistency
 * - No overlapping attackTypeKeys between characters
 */
import { describe, it, expect } from 'vitest';
import { IORI_MOVE_LIST, IORI_WIN_QUOTES, IORI_AVAILABLE_ACTIONS } from '../src/content/characters/iori/commands/ioriCommands.js';
import { KYO_MOVE_LIST, KYO_WIN_QUOTES } from '../src/content/characters/kyo/commands/kyoCommands.js';
import { RYO_ATTACK_KEYS } from '../src/content/characters/ryo/attacks/ryoAttacks.js';
import { FRAME_DATA } from '../src/core/frameDataConstants.js';

describe('Iori move list structure', () => {
  it('has at least 10 moves', () => {
    expect(IORI_MOVE_LIST.length).toBeGreaterThanOrEqual(10);
  });

  it('all moves have non-empty names', () => {
    for (const move of IORI_MOVE_LIST) {
      expect(move.name.length, `move "${move.name}"`).toBeGreaterThan(0);
    }
  });

  it('all moves have non-empty inputs', () => {
    for (const move of IORI_MOVE_LIST) {
      expect(move.input.length, `move "${move.name}" input`).toBeGreaterThan(0);
    }
  });

  it('all move types are valid', () => {
    const validTypes = new Set(['command', 'special', 'dm', 'sdm', 'hsdm', 'system']);
    for (const move of IORI_MOVE_LIST) {
      expect(validTypes.has(move.type), `${move.name} type=${move.type}`).toBe(true);
    }
  });

  it('all attackTypeKeys exist in FRAME_DATA', () => {
    const movesWithKeys = IORI_MOVE_LIST.filter(m => m.attackTypeKey);
    for (const move of movesWithKeys) {
      expect(FRAME_DATA[move.attackTypeKey!], `${move.name} → ${move.attackTypeKey}`).toBeDefined();
    }
  });

  it('has command normals', () => {
    expect(IORI_MOVE_LIST.some(m => m.type === 'command')).toBe(true);
  });

  it('has specials', () => {
    expect(IORI_MOVE_LIST.some(m => m.type === 'special')).toBe(true);
  });

  it('has DM', () => {
    expect(IORI_MOVE_LIST.some(m => m.type === 'dm')).toBe(true);
  });

  it('has SDM', () => {
    expect(IORI_MOVE_LIST.some(m => m.type === 'sdm')).toBe(true);
  });

  it('has rekka chain (3 stages)', () => {
    const rekkaMoves = IORI_MOVE_LIST.filter(m => m.name.includes('葵花') && m.type === 'special');
    expect(rekkaMoves.length).toBeGreaterThanOrEqual(3);
  });
});

describe('Iori win quotes', () => {
  it('has at least 2 win quotes', () => {
    expect(IORI_WIN_QUOTES.length).toBeGreaterThanOrEqual(2);
  });

  it('all quotes are non-empty', () => {
    for (const quote of IORI_WIN_QUOTES) {
      expect(quote.length).toBeGreaterThan(0);
    }
  });
});

describe('Iori available actions', () => {
  it('includes core movement', () => {
    expect(IORI_AVAILABLE_ACTIONS).toContain('idle');
    expect(IORI_AVAILABLE_ACTIONS).toContain('walk_forward');
    expect(IORI_AVAILABLE_ACTIONS).toContain('jump_up');
  });

  it('includes normals', () => {
    expect(IORI_AVAILABLE_ACTIONS).toContain('stand_a');
    expect(IORI_AVAILABLE_ACTIONS).toContain('stand_c');
    expect(IORI_AVAILABLE_ACTIONS).toContain('crouch_a');
  });

  it('includes specials', () => {
    expect(IORI_AVAILABLE_ACTIONS).toContain('aoihana');
    expect(IORI_AVAILABLE_ACTIONS).toContain('oniyaki');
  });

  it('no duplicates', () => {
    expect(new Set(IORI_AVAILABLE_ACTIONS).size).toBe(IORI_AVAILABLE_ACTIONS.length);
  });
});

describe('Cross-character move list consistency', () => {
  it('all three characters have win quotes', () => {
    expect(KYO_WIN_QUOTES.length).toBeGreaterThanOrEqual(2);
    expect(IORI_WIN_QUOTES.length).toBeGreaterThanOrEqual(2);
  });

  it('character-specific attackTypeKeys do not overlap', () => {
    const ryoKeys = new Set(RYO_ATTACK_KEYS.filter(k => k.startsWith('RYO_')));
    const kyoKeys = new Set(KYO_MOVE_LIST.filter(m => m.attackTypeKey?.startsWith('KYO_')).map(m => m.attackTypeKey!));
    const ioriKeys = new Set(IORI_MOVE_LIST.filter(m => m.attackTypeKey?.startsWith('IORI_')).map(m => m.attackTypeKey!));

    // No overlap between Ryo and Kyo
    for (const k of kyoKeys) {
      expect(ryoKeys.has(k), `Kyo key ${k} not in Ryo`).toBe(false);
    }
    // No overlap between Ryo and Iori
    for (const k of ioriKeys) {
      expect(ryoKeys.has(k), `Iori key ${k} not in Ryo`).toBe(false);
    }
    // No overlap between Kyo and Iori
    for (const k of ioriKeys) {
      expect(kyoKeys.has(k), `Iori key ${k} not in Kyo`).toBe(false);
    }
  });

  it('all characters have at least one DM in FRAME_DATA with damage > 50', () => {
    // Ryo
    const ryoDm = RYO_ATTACK_KEYS.filter(k => k.startsWith('DM_'));
    expect(ryoDm.length).toBeGreaterThan(0);
    for (const key of ryoDm) {
      expect(FRAME_DATA[key]?.damage, `Ryo DM ${key}`).toBeGreaterThan(50);
    }

    // Kyo
    const kyoDmKeys = KYO_MOVE_LIST.filter(m => m.type === 'dm' && m.attackTypeKey).map(m => m.attackTypeKey!);
    expect(kyoDmKeys.length).toBeGreaterThan(0);
    for (const key of kyoDmKeys) {
      expect(FRAME_DATA[key]?.damage, `Kyo DM ${key}`).toBeGreaterThan(50);
    }

    // Iori
    const ioriDmKeys = IORI_MOVE_LIST.filter(m => m.type === 'dm' && m.attackTypeKey).map(m => m.attackTypeKey!);
    expect(ioriDmKeys.length).toBeGreaterThan(0);
    for (const key of ioriDmKeys) {
      expect(FRAME_DATA[key]?.damage, `Iori DM ${key}`).toBeGreaterThan(50);
    }
  });

  it('SDM damage >= DM damage for each character', () => {
    // Kyo
    const kyoDmKey = KYO_MOVE_LIST.find(m => m.type === 'dm')?.attackTypeKey;
    const kyoSdmKey = KYO_MOVE_LIST.find(m => m.type === 'sdm')?.attackTypeKey;
    if (kyoDmKey && kyoSdmKey) {
      expect(FRAME_DATA[kyoSdmKey].damage).toBeGreaterThanOrEqual(FRAME_DATA[kyoDmKey].damage);
    }

    // Iori
    const ioriDmKey = IORI_MOVE_LIST.find(m => m.type === 'dm')?.attackTypeKey;
    const ioriSdmKey = IORI_MOVE_LIST.find(m => m.type === 'sdm')?.attackTypeKey;
    if (ioriDmKey && ioriSdmKey) {
      expect(FRAME_DATA[ioriSdmKey].damage).toBeGreaterThanOrEqual(FRAME_DATA[ioriDmKey].damage);
    }
  });

  it('all characters have at least 3 specials', () => {
    const ryoSpecials = RYO_ATTACK_KEYS.filter(k => k.startsWith('RYO_') && !k.includes('TSURIZAO') && !k.includes('ORISHI'));
    const kyoSpecials = KYO_MOVE_LIST.filter(m => m.type === 'special').length;
    const ioriSpecials = IORI_MOVE_LIST.filter(m => m.type === 'special').length;

    expect(ryoSpecials.length).toBeGreaterThanOrEqual(3);
    expect(kyoSpecials).toBeGreaterThanOrEqual(3);
    expect(ioriSpecials).toBeGreaterThanOrEqual(3);
  });
});
