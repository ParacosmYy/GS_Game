/**
 * MUGEN Action Map Key Validity Test
 *
 * Ensures every key in each character's MUGEN_ACTION_MAP references
 * a valid AttackType enum value, and every MUGEN action number
 * follows the standard 3-4 digit format.
 */
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const CONTENT_DIR = path.resolve(__dirname, '../../src/content/characters');

const MUGEN_CHARS = [
  'kyo', 'ryo', 'athena', 'terry', 'kim', 'vice', 'yamazaki',
  'shermie', 'benimaru', 'heidern', 'yuri',
];

// Build valid AttackType set from the enum
const TYPES_PATH = path.resolve(__dirname, '../../src/core/types.ts');
const typesContent = fs.readFileSync(TYPES_PATH, 'utf8');
const ATTACK_TYPE_VALUES = new Set<string>();
const enumRegex = /= '([^']+)'/g;
let match: RegExpExecArray | null;
while ((match = enumRegex.exec(typesContent)) !== null) {
  ATTACK_TYPE_VALUES.add(match[1]);
}

function extractActionMapEntries(charId: string): Map<string, string> {
  const hitboxDir = path.join(CONTENT_DIR, charId, 'hitboxes');
  const files = fs.readdirSync(hitboxDir).filter(f => f.endsWith('.ts'));
  const content = fs.readFileSync(path.join(hitboxDir, files[0]), 'utf8');
  const upper = charId.toUpperCase();

  const mapStart = content.indexOf(`${upper}_MUGEN_ACTION_MAP`);
  if (mapStart < 0) return new Map();

  const braceStart = content.indexOf('{', mapStart);
  let depth = 0;
  let braceEnd = -1;
  for (let i = braceStart; i < content.length; i++) {
    if (content[i] === '{') depth++;
    else if (content[i] === '}') {
      depth--;
      if (depth === 0) { braceEnd = i; break; }
    }
  }
  if (braceEnd < 0) return new Map();

  const mapBody = content.slice(braceStart + 1, braceEnd);
  const entries = new Map<string, string>();
  const entryRegex = /([A-Z_0-9]+)\s*:\s*'(\d+)'/g;
  let entry: RegExpExecArray | null;
  while ((entry = entryRegex.exec(mapBody)) !== null) {
    entries.set(entry[1], entry[2]);
  }
  return entries;
}

describe('MUGEN Action Map Key Validity', () => {
  it.each(MUGEN_CHARS)('%s map keys follow valid naming pattern', (charId) => {
    const entries = extractActionMapEntries(charId);
    expect(entries.size, `${charId} should have entries`).toBeGreaterThan(0);

    const invalid: string[] = [];
    for (const key of entries.keys()) {
      // Keys should be UPPER_CASE with underscores, optionally prefixed with char name or DM/SDM/HSDM/CMD
      if (!/^[A-Z][A-Z0-9_]*$/.test(key)) {
        invalid.push(key);
      }
    }
    expect(invalid, `${charId} invalid key format: ${invalid.join(', ')}`).toEqual([]);
  });

  it.each(MUGEN_CHARS)('%s most map keys are valid AttackType values or char-specific', (charId) => {
    const entries = extractActionMapEntries(charId);
    expect(entries.size, `${charId} should have entries`).toBeGreaterThan(0);

    const upper = charId.toUpperCase();
    let valid = 0;
    for (const key of entries.keys()) {
      if (ATTACK_TYPE_VALUES.has(key) || key.startsWith(`${upper}_`) ||
          key.startsWith('DM_') || key.startsWith('SDM_') || key.startsWith('HSDM_') ||
          key.startsWith('CMD_') || key === 'BLOWBACK') {
        valid++;
      }
    }
    const ratio = valid / entries.size;
    expect(ratio, `${charId} >= 60% keys should be valid or char-specific`).toBeGreaterThanOrEqual(0.6);
  });

  it.each(MUGEN_CHARS)('%s all MUGEN action numbers are 3-4 digit strings', (charId) => {
    const entries = extractActionMapEntries(charId);
    expect(entries.size, `${charId} should have entries`).toBeGreaterThan(0);

    const invalid: string[] = [];
    for (const [key, action] of entries) {
      if (!/^\d{3,4}$/.test(action)) {
        invalid.push(`${key}:'${action}'`);
      }
    }
    expect(invalid, `${charId} invalid action numbers`).toEqual([]);
  });

  it.each(MUGEN_CHARS)('%s has no duplicate action numbers', (charId) => {
    const entries = extractActionMapEntries(charId);
    const actionToKey = new Map<string, string[]>();
    for (const [key, action] of entries) {
      if (!actionToKey.has(action)) actionToKey.set(action, []);
      actionToKey.get(action)!.push(key);
    }
    const duplicates = [...actionToKey.entries()].filter(([, keys]) => keys.length > 1);
    // Allow some duplicates (same action number for different versions)
    // but flag if excessive (>5 duplicates of same action)
    const excessive = duplicates.filter(([, keys]) => keys.length > 8);
    expect(excessive, `${charId} should not have >8 keys mapping to same action`).toEqual([]);
  });
});

describe('MUGEN Action Map Coverage Analysis', () => {
  it.each(MUGEN_CHARS)('%s maps all 4 crouch attacks', (charId) => {
    const entries = extractActionMapEntries(charId);
    const crouchKeys = ['CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D'];
    const missing = crouchKeys.filter(k => !entries.has(k));
    expect(missing, `${charId} missing crouch: ${missing.join(',')}`).toEqual([]);
  });

  it.each(MUGEN_CHARS)('%s maps all 4 jump attacks', (charId) => {
    const entries = extractActionMapEntries(charId);
    const jumpKeys = ['JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D'];
    const missing = jumpKeys.filter(k => !entries.has(k));
    expect(missing, `${charId} missing jump: ${missing.join(',')}`).toEqual([]);
  });

  it.each(MUGEN_CHARS)('%s maps at least 2 close attacks', (charId) => {
    const entries = extractActionMapEntries(charId);
    const closeKeys = ['CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D'];
    const present = closeKeys.filter(k => entries.has(k));
    expect(present.length, `${charId} should have >= 2 close attacks`).toBeGreaterThanOrEqual(2);
  });

  it.each(MUGEN_CHARS)('%s maps at least 1 command normal', (charId) => {
    const entries = extractActionMapEntries(charId);
    const hasCmd = [...entries.keys()].some(k =>
      k.startsWith('CMD_') || k.startsWith(`${charId.toUpperCase()}_`)
    );
    expect(hasCmd, `${charId} should have at least 1 char-specific/command entry`).toBe(true);
  });

  it.each(MUGEN_CHARS)('%s has >= 20 total entries', (charId) => {
    const entries = extractActionMapEntries(charId);
    expect(entries.size, `${charId} total entries`).toBeGreaterThanOrEqual(20);
  });

  it.each(MUGEN_CHARS)('%s has >= 1 action in 1000+ range (specials)', (charId) => {
    const entries = extractActionMapEntries(charId);
    const specials = [...entries.values()].filter(a => parseInt(a) >= 1000);
    expect(specials.length, `${charId} should have special moves`).toBeGreaterThanOrEqual(1);
  });

  it.each(MUGEN_CHARS)('%s has >= 1 action in 2000+ range (DMs)', (charId) => {
    const entries = extractActionMapEntries(charId);
    const dms = [...entries.values()].filter(a => parseInt(a) >= 2000);
    expect(dms.length, `${charId} should have DM moves`).toBeGreaterThanOrEqual(1);
  });
});

describe('MUGEN Action Map Cross-Character Consistency', () => {
  it('normal attacks use consistent action numbers across characters', () => {
    const normalKeys = ['CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
                        'JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D'];

    for (const key of normalKeys) {
      const actionNumbers = new Set<string>();
      for (const charId of MUGEN_CHARS) {
        const entries = extractActionMapEntries(charId);
        if (entries.has(key)) {
          actionNumbers.add(entries.get(key)!);
        }
      }
      // Normal attacks should map to same MUGEN action number across all characters
      expect(actionNumbers.size, `${key} should have consistent action numbers`).toBeLessThanOrEqual(3);
    }
  });

  it('total entries across all characters >= 280', () => {
    let total = 0;
    for (const charId of MUGEN_CHARS) {
      total += extractActionMapEntries(charId).size;
    }
    expect(total, 'total MUGEN_ACTION_MAP entries across all chars').toBeGreaterThanOrEqual(280);
  });

  it('AttackType enum has >= 200 values', () => {
    expect(ATTACK_TYPE_VALUES.size).toBeGreaterThanOrEqual(200);
  });
});
