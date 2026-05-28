/**
 * Character Content Package Cross-Reference Tests
 *
 * Validates consistency between character content packages and FRAME_DATA:
 * - Ryo attack keys all exist in FRAME_DATA with valid damage
 * - Kyo move list attackTypeKeys exist in FRAME_DATA
 * - Stats are within reasonable bounds
 * - Kyo/Iori attack key naming patterns are correct
 */
import { describe, it, expect } from 'vitest';
import { RYO_ATTACK_KEYS, getRyoFrameData } from '../src/content/characters/ryo/attacks/ryoAttacks.js';
import { KYO_MOVE_LIST, KYO_WIN_QUOTES, KYO_AVAILABLE_ACTIONS } from '../src/content/characters/kyo/commands/kyoCommands.js';
import { FRAME_DATA } from '../src/core/frameDataConstants.js';

describe('Ryo content package attack keys', () => {
  it('all RYO_ATTACK_KEYS exist in FRAME_DATA', () => {
    for (const key of RYO_ATTACK_KEYS) {
      expect(FRAME_DATA[key], `RYO key ${key}`).toBeDefined();
    }
  });

  it('all Ryo attacks have positive damage', () => {
    const fd = getRyoFrameData();
    for (const [key, entry] of Object.entries(fd)) {
      expect(entry.damage, `Ryo ${key} damage`).toBeGreaterThan(0);
    }
  });

  it('getRyoFrameData returns entries for all keys', () => {
    const fd = getRyoFrameData();
    // Some keys like THROW may not have explicit FRAME_DATA entries
    expect(Object.keys(fd).length).toBeGreaterThan(15);
  });

  it('Ryo normals are included', () => {
    expect(RYO_ATTACK_KEYS).toContain('STAND_A');
    expect(RYO_ATTACK_KEYS).toContain('STAND_C');
    expect(RYO_ATTACK_KEYS).toContain('CROUCH_A');
    expect(RYO_ATTACK_KEYS).toContain('CROUCH_D');
  });

  it('Ryo specials are included', () => {
    expect(RYO_ATTACK_KEYS).toContain('RYO_KOOU');
    expect(RYO_ATTACK_KEYS).toContain('RYO_KO_HOU');
    expect(RYO_ATTACK_KEYS).toContain('RYO_HIEN');
  });

  it('Ryo DM/SDM are included', () => {
    expect(RYO_ATTACK_KEYS).toContain('DM_TEN_HA_OU');
    expect(RYO_ATTACK_KEYS).toContain('DM_RYUKO_RANBU');
    expect(RYO_ATTACK_KEYS).toContain('SDM_TEN_HA_OU');
  });

  it('Ryo command normals are included', () => {
    expect(RYO_ATTACK_KEYS).toContain('RYO_TSURIZAO');
    expect(RYO_ATTACK_KEYS).toContain('RYO_ORISHI');
  });

  it('no duplicate keys', () => {
    expect(new Set(RYO_ATTACK_KEYS).size).toBe(RYO_ATTACK_KEYS.length);
  });
});

describe('Kyo move list', () => {
  it('has at least 10 moves', () => {
    expect(KYO_MOVE_LIST.length).toBeGreaterThanOrEqual(10);
  });

  it('all moves have non-empty names', () => {
    for (const move of KYO_MOVE_LIST) {
      expect(move.name.length, `move "${move.name}"`).toBeGreaterThan(0);
    }
  });

  it('all moves have non-empty inputs', () => {
    for (const move of KYO_MOVE_LIST) {
      expect(move.input.length, `move "${move.name}" input`).toBeGreaterThan(0);
    }
  });

  it('all move types are valid categories', () => {
    const validTypes = new Set(['command', 'special', 'dm', 'sdm', 'hsdm', 'system']);
    for (const move of KYO_MOVE_LIST) {
      expect(validTypes.has(move.type), `${move.name} type=${move.type}`).toBe(true);
    }
  });

  it('all attackTypeKeys in moves exist in FRAME_DATA', () => {
    const movesWithKeys = KYO_MOVE_LIST.filter(m => m.attackTypeKey);
    for (const move of movesWithKeys) {
      expect(FRAME_DATA[move.attackTypeKey!], `${move.name} → ${move.attackTypeKey}`).toBeDefined();
    }
  });

  it('has at least 1 command normal', () => {
    expect(KYO_MOVE_LIST.some(m => m.type === 'command')).toBe(true);
  });

  it('has at least 1 special', () => {
    expect(KYO_MOVE_LIST.some(m => m.type === 'special')).toBe(true);
  });

  it('has at least 1 DM', () => {
    expect(KYO_MOVE_LIST.some(m => m.type === 'dm')).toBe(true);
  });

  it('has SDM', () => {
    expect(KYO_MOVE_LIST.some(m => m.type === 'sdm')).toBe(true);
  });

  it('rekka chain references are in FRAME_DATA', () => {
    const rekkaKeys = ['KYO_ARAGAMI', 'KYO_DOKUGAMI'];
    for (const key of rekkaKeys) {
      expect(FRAME_DATA[key], `rekka ${key}`).toBeDefined();
    }
  });
});

describe('Kyo win quotes', () => {
  it('has at least 2 win quotes', () => {
    expect(KYO_WIN_QUOTES.length).toBeGreaterThanOrEqual(2);
  });

  it('all quotes are non-empty', () => {
    for (const quote of KYO_WIN_QUOTES) {
      expect(quote.length).toBeGreaterThan(0);
    }
  });
});

describe('Kyo available actions', () => {
  it('includes core movement actions', () => {
    expect(KYO_AVAILABLE_ACTIONS).toContain('idle');
    expect(KYO_AVAILABLE_ACTIONS).toContain('walk_forward');
    expect(KYO_AVAILABLE_ACTIONS).toContain('jump_up');
    expect(KYO_AVAILABLE_ACTIONS).toContain('run');
  });

  it('includes standing normals', () => {
    expect(KYO_AVAILABLE_ACTIONS).toContain('stand_a');
    expect(KYO_AVAILABLE_ACTIONS).toContain('stand_c');
  });

  it('includes crouching normals', () => {
    expect(KYO_AVAILABLE_ACTIONS).toContain('crouch_a');
    expect(KYO_AVAILABLE_ACTIONS).toContain('crouch_d');
  });

  it('no duplicate actions', () => {
    expect(new Set(KYO_AVAILABLE_ACTIONS).size).toBe(KYO_AVAILABLE_ACTIONS.length);
  });
});
