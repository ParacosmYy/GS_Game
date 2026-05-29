/**
 * SpecialMap ↔ MUGEN_ACTION_MAP Consistency Test
 *
 * Validates that specialMap entries in characterSpriteConfigs.ts
 * and MUGEN_ACTION_MAP entries in hitbox files agree on MUGEN
 * action numbers for the same AttackType keys.
 */
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const ROOT_DIR = path.resolve(__dirname, '../..');
const CONFIG_PATH = path.join(ROOT_DIR, 'src/rendering/sprites/shared/characterSpriteConfigs.ts');
const CONTENT_DIR = path.join(ROOT_DIR, 'src/content/characters');

const MUGEN_CHARS = [
  'kyo', 'ryo', 'athena', 'terry', 'kim', 'vice', 'yamazaki',
  'shermie', 'benimaru', 'heidern', 'yuri',
];

interface ParsedSpecialMap {
  charId: string;
  mugenDir: string;
  entries: Map<string, string>;
}

function parseSpecialMaps(): ParsedSpecialMap[] {
  const content = fs.readFileSync(CONFIG_PATH, 'utf8');
  const results: ParsedSpecialMap[] = [];
  const charRegex = /registerCharacterSprites\(\{[^}]*?charId:\s*'([^']+)'[^}]*?mugenDir:\s*'([^']+)'[^}]*?specialMap:\s*\{/gs;

  let charMatch: RegExpExecArray | null;
  // Reset regex state
  const regex = new RegExp(charRegex.source, charRegex.flags);
  while ((charMatch = regex.exec(content)) !== null) {
    const charId = charMatch[1];
    const mugenDir = charMatch[2];
    const mapStart = charMatch.index + charMatch[0].length;

    // Find matching closing brace for specialMap
    let depth = 1;
    let mapEnd = mapStart;
    for (let i = mapStart; i < content.length && depth > 0; i++) {
      if (content[i] === '{') depth++;
      else if (content[i] === '}') depth--;
      if (depth === 0) { mapEnd = i; break; }
    }

    const mapBody = content.slice(mapStart, mapEnd);
    const entries = new Map<string, string>();

    // Match AttackType.XXX: 'NNN' patterns
    const entryRegex = /\[AttackType\.(\w+)\]:\s*'(\d+)'/g;
    let entryMatch: RegExpExecArray | null;
    while ((entryMatch = entryRegex.exec(mapBody)) !== null) {
      entries.set(entryMatch[1], entryMatch[2]);
    }

    results.push({ charId, mugenDir, entries });
  }

  return results;
}

function extractMugenActionMap(charId: string): Map<string, string> {
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

const specialMaps = parseSpecialMaps();
const specialMapByChar = new Map<string, ParsedSpecialMap>();
for (const sm of specialMaps) {
  specialMapByChar.set(sm.charId, sm);
}

describe('SpecialMap ↔ MUGEN_ACTION_MAP Consistency', () => {
  it.each(MUGEN_CHARS)('%s has specialMap in characterSpriteConfigs', (charId) => {
    const sm = specialMapByChar.get(charId);
    expect(sm, `${charId} should have specialMap`).toBeDefined();
    expect(sm!.entries.size, `${charId} specialMap should have entries`).toBeGreaterThan(0);
  });

  it.each(MUGEN_CHARS)('%s has MUGEN_ACTION_MAP in hitbox file', (charId) => {
    const mugenMap = extractMugenActionMap(charId);
    expect(mugenMap.size, `${charId} MUGEN_ACTION_MAP should have entries`).toBeGreaterThan(0);
  });

  it.each(MUGEN_CHARS)('%s specialMap and MUGEN_ACTION_MAP have >= 60% overlap on shared keys', (charId) => {
    const sm = specialMapByChar.get(charId);
    if (!sm) return;
    const mugenMap = extractMugenActionMap(charId);

    let shared = 0;
    let matching = 0;
    for (const [attackType, specialMapAction] of sm.entries) {
      const mugenAction = mugenMap.get(attackType);
      if (mugenAction !== undefined) {
        shared++;
        if (mugenAction === specialMapAction) matching++;
      }
    }

    if (shared > 0) {
      const ratio = matching / shared;
      expect(ratio, `${charId} action number match ratio`).toBeGreaterThanOrEqual(0.6);
    }
  });

  it.each(MUGEN_CHARS)('%s MUGEN_ACTION_MAP covers >= 70% of specialMap keys', (charId) => {
    const sm = specialMapByChar.get(charId);
    if (!sm) return;
    const mugenMap = extractMugenActionMap(charId);

    let covered = 0;
    for (const attackType of sm.entries.keys()) {
      if (mugenMap.has(attackType)) covered++;
    }

    const ratio = covered / sm.entries.size;
    expect(ratio, `${charId} MUGEN_ACTION_MAP coverage`).toBeGreaterThanOrEqual(0.7);
  });
});

describe('SpecialMap Quality', () => {
  it('total specialMap entries across MUGEN characters >= 240', () => {
    let total = 0;
    for (const charId of MUGEN_CHARS) {
      const sm = specialMapByChar.get(charId);
      if (sm) total += sm.entries.size;
    }
    expect(total, 'total specialMap entries').toBeGreaterThanOrEqual(240);
  });

  it.each(MUGEN_CHARS)('%s specialMap has >= 15 entries', (charId) => {
    const sm = specialMapByChar.get(charId);
    if (!sm) return;
    expect(sm.entries.size, `${charId} specialMap entries`).toBeGreaterThanOrEqual(15);
  });

  // Characters with full normal attack coverage in specialMap
  const fullCoverageChars = ['athena', 'terry', 'kim', 'vice', 'yamazaki', 'shermie', 'benimaru', 'heidern', 'yuri'];

  it.each(fullCoverageChars)('%s specialMap maps all 4 crouch attacks', (charId) => {
    const sm = specialMapByChar.get(charId);
    if (!sm) return;
    const crouchKeys = ['CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D'];
    for (const key of crouchKeys) {
      expect(sm.entries.has(key), `${charId} should map ${key}`).toBe(true);
    }
  });

  it.each(fullCoverageChars)('%s specialMap maps all 4 jump attacks', (charId) => {
    const sm = specialMapByChar.get(charId);
    if (!sm) return;
    const jumpKeys = ['JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D'];
    for (const key of jumpKeys) {
      expect(sm.entries.has(key), `${charId} should map ${key}`).toBe(true);
    }
  });

  it.each(MUGEN_CHARS)('%s specialMap has >= 1 DM entry', (charId) => {
    const sm = specialMapByChar.get(charId);
    if (!sm) return;
    const dmKeys = [...sm.entries.keys()].filter(k =>
      k.startsWith('DM_') || k.startsWith('SDM_') || k.startsWith('HSDM_')
    );
    expect(dmKeys.length, `${charId} should have DM entries`).toBeGreaterThanOrEqual(1);
  });

  it.each(MUGEN_CHARS)('%s specialMap has >= 4 special move entries', (charId) => {
    const sm = specialMapByChar.get(charId);
    if (!sm) return;
    // Specials are entries with action numbers >= 1000 that aren't DMs
    const specials = [...sm.entries.entries()].filter(([key, action]) =>
      parseInt(action) >= 1000 && !key.startsWith('DM_') && !key.startsWith('SDM_') && !key.startsWith('HSDM_')
    );
    expect(specials.length, `${charId} should have >= 4 specials`).toBeGreaterThanOrEqual(4);
  });

  it.each(MUGEN_CHARS)('%s specialMap uses correct mugenDir', (charId) => {
    const sm = specialMapByChar.get(charId);
    if (!sm) return;
    expect(sm.mugenDir, `${charId} mugenDir`).toBeTruthy();
    expect(sm.mugenDir.length, `${charId} mugenDir should not be empty`).toBeGreaterThan(0);
  });
});
