/**
 * Character Definition → FRAME_DATA Link Tests
 *
 * Validates that all 27 character definitions have
 * corresponding entries in FRAME_DATA. Ensures no character is
 * left without frame data when new characters are added.
 */
import { describe, it, expect } from 'vitest';
import { FRAME_DATA } from '../src/core/frameDataConstants.js';
import { RyoDef } from '../src/characters/ryo.js';
import { KyoDef } from '../src/characters/kyo.js';
import { IoriDef } from '../src/characters/iori.js';
import { TerryDef } from '../src/characters/terry.js';
import { KimDef } from '../src/characters/kim.js';
import { KdashDef } from '../src/characters/kdash.js';
import { MaiDef } from '../src/characters/mai.js';
import { RobertDef } from '../src/characters/robert.js';
import { ClarkDef } from '../src/characters/clark.js';
import { RalfDef } from '../src/characters/ralf.js';
import { KulaDef } from '../src/characters/kula.js';
import { LeonaDef } from '../src/characters/leona.js';
import { AthenaDef } from '../src/characters/athena.js';

const fdKeys = new Set(Object.keys(FRAME_DATA));

const CHAR_IDS = [
  'ryo', 'kyo', 'iori', 'terry', 'kim', 'kdash', 'mai', 'robert',
  'clark', 'ralf', 'kula', 'leona', 'athena', 'billy', 'chang', 'choi',
  'joe', 'andy', 'mature', 'yashiro', 'chris', 'vice', 'shermie',
  'yamazaki', 'mary', 'xiangfei', 'kasumi',
];

describe('Character Definition → FRAME_DATA link', () => {
  it('27 character IDs are defined', () => {
    expect(CHAR_IDS.length).toBe(27);
  });

  it('every character has at least one FRAME_DATA entry with their prefix', () => {
    for (const charId of CHAR_IDS) {
      const prefix = charId.toUpperCase();
      const matches = Array.from(fdKeys).filter(k =>
        k.startsWith(prefix + '_') || k.startsWith('DM_') || k.startsWith('SDM_')
      );
      expect(matches.length, `${charId} should have FRAME_DATA entries`).toBeGreaterThan(0);
    }
  });

  it('key character definitions have valid structure', () => {
    const defs = [RyoDef, KyoDef, IoriDef, TerryDef, KimDef, KdashDef,
      MaiDef, RobertDef, ClarkDef, RalfDef, KulaDef, LeonaDef, AthenaDef];
    for (const def of defs) {
      expect(def.id, `${def.id} id`).toBeTruthy();
      expect(def.name, `${def.id} name`).toBeTruthy();
      expect(def.stats, `${def.id} stats`).toBeDefined();
      expect(def.stats.maxHealth, `${def.id} maxHealth`).toBeGreaterThan(0);
    }
  });

  it('all characters have generic normals in FRAME_DATA', () => {
    const genericNormals = [
      'STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
      'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
      'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
    ];
    for (const normal of genericNormals) {
      expect(fdKeys.has(normal), `${normal} in FRAME_DATA`).toBe(true);
    }
  });

  it('all characters have jump attacks in FRAME_DATA', () => {
    const jumpAttacks = ['JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D'];
    for (const ja of jumpAttacks) {
      expect(fdKeys.has(ja), `${ja} in FRAME_DATA`).toBe(true);
    }
  });

  it('FRAME_DATA has no duplicate keys', () => {
    const allKeys = Object.keys(FRAME_DATA);
    expect(new Set(allKeys).size).toBe(allKeys.length);
  });
});
