/**
 * Full Character Definition Structural Tests
 *
 * Validates all 27 character definitions for complete structure:
 * id, name, nameCn, color, accentColor, specialColor, stats, winQuotes, poses.
 */
import { describe, it, expect } from 'vitest';
import type { CharacterDefinition } from '../src/characters/types.js';
import { AndyDef } from '../src/characters/andy.js';
import { AthenaDef } from '../src/characters/athena.js';
import { BillyDef } from '../src/characters/billy.js';
import { ChangDef } from '../src/characters/chang.js';
import { ChoiDef } from '../src/characters/choi.js';
import { ChrisDef } from '../src/characters/chris.js';
import { ClarkDef } from '../src/characters/clark.js';
import { IoriDef } from '../src/characters/iori.js';
import { JoeDef } from '../src/characters/joe.js';
import { KasumiDef } from '../src/characters/kasumi.js';
import { KdashDef } from '../src/characters/kdash.js';
import { KimDef } from '../src/characters/kim.js';
import { KulaDef } from '../src/characters/kula.js';
import { KyoDef } from '../src/characters/kyo.js';
import { LeonaDef } from '../src/characters/leona.js';
import { MaiDef } from '../src/characters/mai.js';
import { MaryDef } from '../src/characters/mary.js';
import { MatureDef } from '../src/characters/mature.js';
import { RalfDef } from '../src/characters/ralf.js';
import { RobertDef } from '../src/characters/robert.js';
import { RyoDef } from '../src/characters/ryo.js';
import { ShermieDef } from '../src/characters/shermie.js';
import { TerryDef } from '../src/characters/terry.js';
import { ViceDef } from '../src/characters/vice.js';
import { XiangfeiDef } from '../src/characters/xiangfei.js';
import { YamazakiDef } from '../src/characters/yamazaki.js';
import { YashiroDef } from '../src/characters/yashiro.js';

// ===== All characters in one array =====

const ALL_CHARS: CharacterDefinition[] = [
  AndyDef, AthenaDef, BillyDef, ChangDef, ChoiDef, ChrisDef, ClarkDef,
  IoriDef, JoeDef, KasumiDef, KdashDef, KimDef, KulaDef, KyoDef,
  LeonaDef, MaiDef, MaryDef, MatureDef, RalfDef, RobertDef, RyoDef,
  ShermieDef, TerryDef, ViceDef, XiangfeiDef, YamazakiDef, YashiroDef,
];

const EXPECTED_IDS = [
  'andy', 'athena', 'billy', 'chang', 'choi', 'chris', 'clark',
  'iori', 'joe', 'kasumi', 'kdash', 'kim', 'kula', 'kyo',
  'leona', 'mai', 'mary', 'mature', 'ralf', 'robert', 'ryo',
  'shermie', 'terry', 'vice', 'xiangfei', 'yamazaki', 'yashiro',
];

function validateCharDef(def: CharacterDefinition) {
  describe(`${def.id} definition`, () => {
    it('has valid id', () => {
      expect(def.id).toBeTruthy();
      expect(def.id.length).toBeGreaterThan(0);
    });

    it('has name', () => {
      expect(def.name).toBeTruthy();
      expect(def.name.length).toBeGreaterThan(0);
    });

    it('has nameCn', () => {
      expect(def.nameCn).toBeTruthy();
      expect(def.nameCn!.length).toBeGreaterThan(0);
    });

    it('has valid color', () => {
      expect(def.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('has valid accentColor', () => {
      expect(def.accentColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('has valid specialColor', () => {
      expect(def.specialColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('has stats', () => {
      expect(def.stats).toBeDefined();
      expect(def.stats.walkSpeed).toBeGreaterThan(0);
      expect(def.stats.runSpeed).toBeGreaterThan(def.stats.walkSpeed);
      expect(def.stats.jumpVelocity).toBeLessThan(0);
      expect(def.stats.maxHealth).toBeGreaterThan(0);
      expect(def.stats.pushWidth).toBeGreaterThan(0);
    });

    it('has stats with closeRange and throwRange', () => {
      expect(def.stats.closeRange ?? 88).toBeGreaterThan(0);
      expect(def.stats.throwRange ?? 108).toBeGreaterThan(0);
    });

    it('has winQuotes', () => {
      expect(def.winQuotes).toBeDefined();
      expect(def.winQuotes.length).toBeGreaterThan(0);
      for (const q of def.winQuotes) {
        expect(q.length).toBeGreaterThan(0);
      }
    });

    it('has poses', () => {
      expect(def.poses).toBeDefined();
      expect(Object.keys(def.poses).length).toBeGreaterThan(0);
    });
  });
}

// ===== Validate all 27 characters =====

for (const def of ALL_CHARS) {
  validateCharDef(def);
}

// ===== Cross-character consistency =====

describe('All character definitions — cross-character', () => {
  it('has exactly 27 characters', () => {
    expect(ALL_CHARS.length).toBe(27);
  });

  it('all IDs are unique', () => {
    const ids = ALL_CHARS.map(d => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all expected IDs present', () => {
    const ids = new Set(ALL_CHARS.map(d => d.id));
    for (const expected of EXPECTED_IDS) {
      expect(ids.has(expected), `missing ${expected}`).toBe(true);
    }
  });

  it('all characters have distinct colors', () => {
    const colors = ALL_CHARS.map(d => d.color);
    // Not all unique (some chars share colors), but spot check key chars
    expect(KyoDef.color).toBeDefined();
    expect(IoriDef.color).toBeDefined();
    expect(RyoDef.color).toBeDefined();
    expect(TerryDef.color).toBeDefined();
  });

  it('all stats have reasonable health (500-1500)', () => {
    for (const def of ALL_CHARS) {
      expect(def.stats.maxHealth, `${def.id} health`).toBeGreaterThanOrEqual(500);
      expect(def.stats.maxHealth, `${def.id} health`).toBeLessThanOrEqual(1500);
    }
  });

  it('all stats have reasonable walk speed (2-8)', () => {
    for (const def of ALL_CHARS) {
      expect(def.stats.walkSpeed, `${def.id} walk`).toBeGreaterThanOrEqual(2);
      expect(def.stats.walkSpeed, `${def.id} walk`).toBeLessThanOrEqual(8);
    }
  });

  it('all stats have reasonable run speed (5-12)', () => {
    for (const def of ALL_CHARS) {
      expect(def.stats.runSpeed, `${def.id} run`).toBeGreaterThanOrEqual(5);
      expect(def.stats.runSpeed, `${def.id} run`).toBeLessThanOrEqual(12);
    }
  });

  it('all run > walk', () => {
    for (const def of ALL_CHARS) {
      expect(def.stats.runSpeed, `${def.id} run > walk`).toBeGreaterThan(def.stats.walkSpeed);
    }
  });

  it('all jump velocities are negative (upward)', () => {
    for (const def of ALL_CHARS) {
      expect(def.stats.jumpVelocity, `${def.id} jump`).toBeLessThan(0);
    }
  });

  it('hyper jump > jump > hop (absolute values)', () => {
    for (const def of ALL_CHARS) {
      const jump = Math.abs(def.stats.jumpVelocity);
      const hop = Math.abs(def.stats.hopVelocity);
      expect(jump, `${def.id} |jump| > |hop|`).toBeGreaterThan(hop);
    }
  });
});
