/**
 * MUGEN Query Completeness Test
 *
 * Validates that every character with MUGEN hitbox data has a complete
 * set of query functions exposed through both their own index.ts
 * and the barrel characters/index.ts.
 */
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const CONTENT_DIR = path.resolve(__dirname, '../../src/content/characters');
const BARREL_PATH = path.join(CONTENT_DIR, 'index.ts');

const REQUIRED_MUGEN_EXPORTS = [
  'MUGEN_ACTION_MAP',
  'hasMugenData',
  'getMugenTiming',
  'getMugenActionSummary',
  'getAttackTiming',
];

const MUGEN_CHARS = [
  'kyo', 'ryo', 'iori', 'athena', 'terry', 'kim', 'vice', 'yamazaki',
  'shermie', 'benimaru', 'heidern', 'yuri',
];

const barrelContent = fs.readFileSync(BARREL_PATH, 'utf8');

describe('MUGEN Query Completeness per Character', () => {
  it.each(MUGEN_CHARS)('%s hitbox file has all required MUGEN exports', (charId) => {
    const hitboxDir = path.join(CONTENT_DIR, charId, 'hitboxes');
    const files = fs.readdirSync(hitboxDir).filter(f => f.endsWith('.ts'));
    const content = fs.readFileSync(path.join(hitboxDir, files[0]), 'utf8');
    const upper = charId.toUpperCase();
    const cap = capitalize(charId);

    // MUGEN_ACTION_MAP is UPPER_MUGEN_ACTION_MAP
    expect(content, `${charId} should export ${upper}_MUGEN_ACTION_MAP`).toContain(`${upper}_MUGEN_ACTION_MAP`);
    // Functions use camelCase with char prefix
    expect(content, `${charId} should export has${cap}MugenData`).toContain(`has${cap}MugenData`);
    expect(content, `${charId} should export get${cap}MugenTiming`).toContain(`get${cap}MugenTiming`);
    expect(content, `${charId} should export get${cap}MugenActionSummary`).toContain(`get${cap}MugenActionSummary`);
    expect(content, `${charId} should export get${cap}AttackTiming`).toContain(`get${cap}AttackTiming`);
  });

  it.each(MUGEN_CHARS)('%s hitbox file MUGEN_ACTION_MAP has >= 20 entries', (charId) => {
    const hitboxDir = path.join(CONTENT_DIR, charId, 'hitboxes');
    const files = fs.readdirSync(hitboxDir).filter(f => f.endsWith('.ts'));
    const content = fs.readFileSync(path.join(hitboxDir, files[0]), 'utf8');
    const upper = charId.toUpperCase();

    const mapStart = content.indexOf(`${upper}_MUGEN_ACTION_MAP`);
    expect(mapStart, `${charId} MUGEN_ACTION_MAP exists`).toBeGreaterThanOrEqual(0);

    const braceStart = content.indexOf('{', mapStart);
    const braceEnd = findMatchingBrace(content, braceStart);
    const mapBody = content.slice(braceStart + 1, braceEnd);
    const entries = mapBody.split(/[,\n]/).filter(l => l.includes(':') && l.trim().length > 0 && !l.trim().startsWith('//'));
    expect(entries.length, `${charId} MUGEN_ACTION_MAP should have >= 20 entries`).toBeGreaterThanOrEqual(20);
  });

  it.each(MUGEN_CHARS)('%s hitbox file has getMugenTiming with return type', (charId) => {
    const hitboxDir = path.join(CONTENT_DIR, charId, 'hitboxes');
    const files = fs.readdirSync(hitboxDir).filter(f => f.endsWith('.ts'));
    const content = fs.readFileSync(path.join(hitboxDir, files[0]), 'utf8');
    const cap = capitalize(charId);

    expect(content, `${charId} should define get${cap}MugenTiming`).toContain(`get${cap}MugenTiming`);
    expect(content, `${charId} getMugenTiming should return MugenAttackTiming`).toContain('MugenAttackTiming');
  });

  it.each(MUGEN_CHARS)('%s hitbox file has getAttackTiming with startup/active/recovery', (charId) => {
    const hitboxDir = path.join(CONTENT_DIR, charId, 'hitboxes');
    const files = fs.readdirSync(hitboxDir).filter(f => f.endsWith('.ts'));
    const content = fs.readFileSync(path.join(hitboxDir, files[0]), 'utf8');
    const cap = capitalize(charId);

    expect(content, `${charId} should define get${cap}AttackTiming`).toContain(`get${cap}AttackTiming`);
    expect(content, `${charId} getAttackTiming should have startup`).toContain('startup');
    expect(content, `${charId} getAttackTiming should have active`).toContain('active');
    expect(content, `${charId} getAttackTiming should have recovery`).toContain('recovery');
  });
});

describe('MUGEN Query Barrel Coverage', () => {
  it.each(MUGEN_CHARS.filter(c => c !== 'ryo'))(
    '%s MUGEN_ACTION_MAP is exported from characters/index.ts',
    (charId) => {
      const upper = charId.toUpperCase();
      expect(barrelContent, `${charId} MUGEN_ACTION_MAP in barrel`).toContain(`${upper}_MUGEN_ACTION_MAP`);
    },
  );

  it('ryo MUGEN queries available via export * wildcard', () => {
    expect(barrelContent, 'ryo wildcard export').toContain("export * from './ryo/index.js'");
    const ryoIndex = fs.readFileSync(path.join(CONTENT_DIR, 'ryo', 'index.ts'), 'utf8');
    expect(ryoIndex, 'ryo index should export MUGEN_ACTION_MAP').toContain('RYO_MUGEN_ACTION_MAP');
  });

  it.each(MUGEN_CHARS.filter(c => c !== 'ryo'))(
    '%s hasMugenData is exported from characters/index.ts',
    (charId) => {
      expect(barrelContent, `${charId} hasMugenData in barrel`).toContain(`has${capitalize(charId)}MugenData`);
    },
  );
});

describe('MUGEN Query Import Paths', () => {
  it.each(MUGEN_CHARS)('%s hitbox file imports from core', (charId) => {
    const hitboxDir = path.join(CONTENT_DIR, charId, 'hitboxes');
    const files = fs.readdirSync(hitboxDir).filter(f => f.endsWith('.ts'));
    const content = fs.readFileSync(path.join(hitboxDir, files[0]), 'utf8');

    expect(content, `${charId} hitbox imports core`).toContain('../../../../core/');
    expect(content, `${charId} hitbox imports mugenHitboxQuery`).toContain('mugenHitboxQuery');
  });

  it.each(MUGEN_CHARS)('%s hitbox file uses mugenHitboxQuery for timing lookup', (charId) => {
    const hitboxDir = path.join(CONTENT_DIR, charId, 'hitboxes');
    const files = fs.readdirSync(hitboxDir).filter(f => f.endsWith('.ts'));
    const content = fs.readFileSync(path.join(hitboxDir, files[0]), 'utf8');

    const usesQuery =
      content.includes('queryMugenHitboxes') ||
      content.includes('mugenHitboxQuery') ||
      content.includes('getMugenAttackTiming');
    expect(usesQuery, `${charId} should use MUGEN query system`).toBe(true);
  });
});

describe('MUGEN Action Map Content Quality', () => {
  it.each(MUGEN_CHARS)('%s MUGEN_ACTION_MAP has CLOSE_A mapping', (charId) => {
    const hitboxDir = path.join(CONTENT_DIR, charId, 'hitboxes');
    const files = fs.readdirSync(hitboxDir).filter(f => f.endsWith('.ts'));
    const content = fs.readFileSync(path.join(hitboxDir, files[0]), 'utf8');
    const upper = charId.toUpperCase();

    const mapStart = content.indexOf(`${upper}_MUGEN_ACTION_MAP`);
    const braceStart = content.indexOf('{', mapStart);
    const braceEnd = findMatchingBrace(content, braceStart);
    const mapBody = content.slice(braceStart + 1, braceEnd);

    expect(mapBody, `${charId} should map CLOSE_A`).toContain('CLOSE_A');
  });

  it.each(MUGEN_CHARS)('%s MUGEN_ACTION_MAP has CROUCH_A mapping', (charId) => {
    const hitboxDir = path.join(CONTENT_DIR, charId, 'hitboxes');
    const files = fs.readdirSync(hitboxDir).filter(f => f.endsWith('.ts'));
    const content = fs.readFileSync(path.join(hitboxDir, files[0]), 'utf8');
    const upper = charId.toUpperCase();

    const mapStart = content.indexOf(`${upper}_MUGEN_ACTION_MAP`);
    const braceStart = content.indexOf('{', mapStart);
    const braceEnd = findMatchingBrace(content, braceStart);
    const mapBody = content.slice(braceStart + 1, braceEnd);

    expect(mapBody, `${charId} should map CROUCH_A`).toContain('CROUCH_A');
  });

  it.each(MUGEN_CHARS)('%s MUGEN_ACTION_MAP has JUMP_A mapping', (charId) => {
    const hitboxDir = path.join(CONTENT_DIR, charId, 'hitboxes');
    const files = fs.readdirSync(hitboxDir).filter(f => f.endsWith('.ts'));
    const content = fs.readFileSync(path.join(hitboxDir, files[0]), 'utf8');
    const upper = charId.toUpperCase();

    const mapStart = content.indexOf(`${upper}_MUGEN_ACTION_MAP`);
    const braceStart = content.indexOf('{', mapStart);
    const braceEnd = findMatchingBrace(content, braceStart);
    const mapBody = content.slice(braceStart + 1, braceEnd);

    expect(mapBody, `${charId} should map JUMP_A`).toContain('JUMP_A');
  });

  it.each(MUGEN_CHARS)('%s MUGEN_ACTION_MAP has STAND_C or STAND_B mapping', (charId) => {
    const hitboxDir = path.join(CONTENT_DIR, charId, 'hitboxes');
    const files = fs.readdirSync(hitboxDir).filter(f => f.endsWith('.ts'));
    const content = fs.readFileSync(path.join(hitboxDir, files[0]), 'utf8');
    const upper = charId.toUpperCase();

    const mapStart = content.indexOf(`${upper}_MUGEN_ACTION_MAP`);
    const braceStart = content.indexOf('{', mapStart);
    const braceEnd = findMatchingBrace(content, braceStart);
    const mapBody = content.slice(braceStart + 1, braceEnd);

    const hasStand = mapBody.includes('STAND_C') || mapBody.includes('STAND_B') || mapBody.includes('STAND_D');
    expect(hasStand, `${charId} should have stand attack mapping`).toBe(true);
  });

  it.each(MUGEN_CHARS)('%s MUGEN_ACTION_MAP has special move mapping', (charId) => {
    const hitboxDir = path.join(CONTENT_DIR, charId, 'hitboxes');
    const files = fs.readdirSync(hitboxDir).filter(f => f.endsWith('.ts'));
    const content = fs.readFileSync(path.join(hitboxDir, files[0]), 'utf8');
    const upper = charId.toUpperCase();

    const mapStart = content.indexOf(`${upper}_MUGEN_ACTION_MAP`);
    const braceStart = content.indexOf('{', mapStart);
    const braceEnd = findMatchingBrace(content, braceStart);
    const mapBody = content.slice(braceStart + 1, braceEnd);

    // At least one entry should have action number >= 1000 (special/DM range)
    const highActions = mapBody.match(/'[12]\d{3}'/g) || [];
    expect(highActions.length, `${charId} should have special move mappings`).toBeGreaterThanOrEqual(1);
  });
});

describe('MUGEN Query Summary', () => {
  it('all 11 MUGEN characters have complete query coverage', () => {
    expect(MUGEN_CHARS.length).toBe(12);
    for (const charId of MUGEN_CHARS) {
      const hitboxDir = path.join(CONTENT_DIR, charId, 'hitboxes');
      const files = fs.readdirSync(hitboxDir).filter(f => f.endsWith('.ts'));
      expect(files.length, `${charId} hitbox files`).toBeGreaterThanOrEqual(1);
    }
  });

  it('Iori has MUGEN query data (ihoo1836 source)', () => {
    const hitboxDir = path.join(CONTENT_DIR, 'iori', 'hitboxes');
    if (fs.existsSync(hitboxDir)) {
      const files = fs.readdirSync(hitboxDir).filter(f => f.endsWith('.ts'));
      if (files.length > 0) {
        const content = fs.readFileSync(path.join(hitboxDir, files[0]), 'utf8');
        expect(content.includes('MUGEN_ACTION_MAP')).toBe(true);
      }
    }
  });
});

function findMatchingBrace(text: string, openPos: number): number {
  let depth = 0;
  for (let i = openPos; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
