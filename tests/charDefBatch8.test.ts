import { describe, it, expect } from 'vitest';
import { LeonaDef } from '../src/characters/leona.js';
import { MaiDef } from '../src/characters/mai.js';
import { MaryDef } from '../src/characters/mary.js';
import { MatureDef } from '../src/characters/mature.js';
import { RobertDef } from '../src/characters/robert.js';

const defs = [
  { name: 'Leona', def: LeonaDef, id: 'leona' },
  { name: 'Mai', def: MaiDef, id: 'mai' },
  { name: 'Mary', def: MaryDef, id: 'mary' },
  { name: 'Mature', def: MatureDef, id: 'mature' },
  { name: 'Robert', def: RobertDef, id: 'robert' },
];

describe('Character definitions batch 8', () => {
  for (const { name, def, id } of defs) {
    describe(`${name}`, () => {
      it('has correct id', () => expect(def.id).toBe(id));
      it('has name and nameCn', () => {
        expect(def.name).toBeDefined();
        expect(def.nameCn).toBeDefined();
      });
      it('has valid hex color', () => {
        expect(def.color).toMatch(/^#[0-9a-f]{6}$/i);
      });
      it('has stats', () => {
        expect(def.stats.walkSpeed).toBeGreaterThan(0);
        expect(def.stats.maxHealth).toBeGreaterThan(0);
      });
      it('has poses', () => {
        expect(Object.keys(def.poses).length).toBeGreaterThan(0);
      });
    });
  }
});
