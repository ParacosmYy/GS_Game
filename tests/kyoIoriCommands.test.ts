/**
 * Kyo & Iori Command Tables Regression Test
 * Verifies move list structure, category distribution, and action completeness.
 */
import { describe, it, expect } from 'vitest';
import {
  KYO_MOVE_LIST,
  KYO_WIN_QUOTES,
  KYO_AVAILABLE_ACTIONS,
  type KyoMoveEntry,
} from '../src/content/characters/kyo/commands/kyoCommands.js';
import {
  IORI_MOVE_LIST,
  IORI_WIN_QUOTES,
  IORI_AVAILABLE_ACTIONS,
  type IoriMoveEntry,
} from '../src/content/characters/iori/commands/ioriCommands.js';

const VALID_TYPES = new Set(['command', 'special', 'dm', 'sdm', 'hsdm', 'system']);

function expectValidMoveEntry(entry: KyoMoveEntry | IoriMoveEntry, charName: string) {
  expect(entry.name.length, `${charName} name`).toBeGreaterThan(0);
  expect(entry.input.length, `${charName} input`).toBeGreaterThan(0);
  expect(VALID_TYPES, `${charName} type: ${entry.type}`).toContain(entry.type);
}

describe('Kyo Move List', () => {
  it('has at least 18 moves', () => {
    expect(KYO_MOVE_LIST.length).toBeGreaterThanOrEqual(18);
  });

  it('all entries have valid structure', () => {
    for (const entry of KYO_MOVE_LIST) {
      expectValidMoveEntry(entry, 'Kyo');
    }
  });

  it('has command normals', () => {
    const cmds = KYO_MOVE_LIST.filter(e => e.type === 'command');
    expect(cmds.length).toBeGreaterThanOrEqual(2);
  });

  it('has specials including rekka chains', () => {
    const specials = KYO_MOVE_LIST.filter(e => e.type === 'special');
    expect(specials.length).toBeGreaterThanOrEqual(8);
    const attackKeys = specials.map(s => s.attackTypeKey);
    expect(attackKeys).toContain('KYO_ARAGAMI');
    expect(attackKeys).toContain('KYO_DOKUGAMI');
  });

  it('has DM, SDM, HSDM', () => {
    expect(KYO_MOVE_LIST.some(e => e.type === 'dm')).toBe(true);
    expect(KYO_MOVE_LIST.some(e => e.type === 'sdm')).toBe(true);
    expect(KYO_MOVE_LIST.some(e => e.type === 'hsdm')).toBe(true);
  });

  it('DM/SDM/HSDM entries have attackTypeKey', () => {
    const dmEntries = KYO_MOVE_LIST.filter(e => ['dm', 'sdm', 'hsdm'].includes(e.type));
    for (const entry of dmEntries) {
      expect(entry.attackTypeKey, `${entry.name}`).toBeDefined();
    }
  });

  it('system entries exist', () => {
    const sys = KYO_MOVE_LIST.filter(e => e.type === 'system');
    expect(sys.length).toBeGreaterThanOrEqual(1);
  });

  it('no duplicate attackTypeKey', () => {
    const keys = KYO_MOVE_LIST.filter(e => e.attackTypeKey).map(e => e.attackTypeKey);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('rekka chain keys present', () => {
    const keys = KYO_MOVE_LIST.map(e => e.attackTypeKey).filter(Boolean);
    expect(keys).toContain('KYO_ARAGAMI');
    expect(keys).toContain('KYO_ARAGAMI_KONOKIZU');
    expect(keys).toContain('KYO_ARAGAMI_YANOSABI');
    expect(keys).toContain('KYO_DOKUGAMI');
    expect(keys).toContain('KYO_TSUMIYOMI');
    expect(keys).toContain('KYO_BATSUYOMI');
  });

  it('win quotes exist', () => {
    expect(KYO_WIN_QUOTES.length).toBeGreaterThanOrEqual(2);
    for (const q of KYO_WIN_QUOTES) {
      expect(q.length).toBeGreaterThan(0);
    }
  });

  it('available actions include core animations', () => {
    expect(KYO_AVAILABLE_ACTIONS).toContain('idle');
    expect(KYO_AVAILABLE_ACTIONS).toContain('walk_forward');
    expect(KYO_AVAILABLE_ACTIONS).toContain('stand_a');
    expect(KYO_AVAILABLE_ACTIONS).toContain('crouch_c');
    expect(KYO_AVAILABLE_ACTIONS).toContain('knockdown');
  });

  it('available actions include Kyo specials', () => {
    expect(KYO_AVAILABLE_ACTIONS).toContain('kyo_yamibarai');
    expect(KYO_AVAILABLE_ACTIONS).toContain('kyo_oniyaki');
    expect(KYO_AVAILABLE_ACTIONS).toContain('kyo_aragami');
    expect(KYO_AVAILABLE_ACTIONS).toContain('dm_orochinagi');
  });

  it('no duplicate actions', () => {
    expect(new Set(KYO_AVAILABLE_ACTIONS).size).toBe(KYO_AVAILABLE_ACTIONS.length);
  });
});

describe('Iori Move List', () => {
  it('has at least 16 moves', () => {
    expect(IORI_MOVE_LIST.length).toBeGreaterThanOrEqual(16);
  });

  it('all entries have valid structure', () => {
    for (const entry of IORI_MOVE_LIST) {
      expectValidMoveEntry(entry, 'Iori');
    }
  });

  it('has command normals', () => {
    const cmds = IORI_MOVE_LIST.filter(e => e.type === 'command');
    expect(cmds.length).toBeGreaterThanOrEqual(2);
  });

  it('has specials including aoihana chains', () => {
    const specials = IORI_MOVE_LIST.filter(e => e.type === 'special');
    expect(specials.length).toBeGreaterThanOrEqual(8);
    const keys = specials.map(s => s.attackTypeKey);
    expect(keys).toContain('IORI_AOIHANA');
    expect(keys).toContain('IORI_AOIHANA_2');
    expect(keys).toContain('IORI_AOIHANA_3');
  });

  it('has DM, SDM, HSDM', () => {
    expect(IORI_MOVE_LIST.some(e => e.type === 'dm')).toBe(true);
    expect(IORI_MOVE_LIST.some(e => e.type === 'sdm')).toBe(true);
    expect(IORI_MOVE_LIST.some(e => e.type === 'hsdm')).toBe(true);
  });

  it('DM/SDM/HSDM entries have attackTypeKey', () => {
    const dmEntries = IORI_MOVE_LIST.filter(e => ['dm', 'sdm', 'hsdm'].includes(e.type));
    for (const entry of dmEntries) {
      expect(entry.attackTypeKey, `${entry.name}`).toBeDefined();
    }
  });

  it('has Kuzukaze command grab', () => {
    const kuzukaze = IORI_MOVE_LIST.find(e => e.attackTypeKey === 'IORI_KUZUKAZE');
    expect(kuzukaze).toBeDefined();
  });

  it('aoihana C chain is complete', () => {
    const keys = IORI_MOVE_LIST.map(e => e.attackTypeKey).filter(Boolean);
    expect(keys).toContain('IORI_AOIHANA_C');
    expect(keys).toContain('IORI_AOIHANA_C_2');
    expect(keys).toContain('IORI_AOIHANA_C_3');
  });

  it('no duplicate attackTypeKey', () => {
    const keys = IORI_MOVE_LIST.filter(e => e.attackTypeKey).map(e => e.attackTypeKey);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('win quotes exist', () => {
    expect(IORI_WIN_QUOTES.length).toBeGreaterThanOrEqual(2);
  });

  it('available actions include core animations', () => {
    expect(IORI_AVAILABLE_ACTIONS).toContain('idle');
    expect(IORI_AVAILABLE_ACTIONS).toContain('walk_forward');
    expect(IORI_AVAILABLE_ACTIONS).toContain('stand_a');
    expect(IORI_AVAILABLE_ACTIONS).toContain('knockdown');
  });

  it('available actions include Iori specials', () => {
    expect(IORI_AVAILABLE_ACTIONS).toContain('aoihana');
    expect(IORI_AVAILABLE_ACTIONS).toContain('oniyaki');
    expect(IORI_AVAILABLE_ACTIONS).toContain('yamibarai');
    expect(IORI_AVAILABLE_ACTIONS).toContain('kuzukaze');
    expect(IORI_AVAILABLE_ACTIONS).toContain('dm_yatagarasu');
  });

  it('no duplicate actions', () => {
    expect(new Set(IORI_AVAILABLE_ACTIONS).size).toBe(IORI_AVAILABLE_ACTIONS.length);
  });
});
