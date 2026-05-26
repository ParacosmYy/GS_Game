import { describe, it, expect } from 'vitest';
import { JoeDef } from '../src/characters/joe.js';
import { KasumiDef } from '../src/characters/kasumi.js';
import { KdashDef } from '../src/characters/kdash.js';
import { KimDef } from '../src/characters/kim.js';
import { KulaDef } from '../src/characters/kula.js';

const defs = [
  { name: 'Joe', def: JoeDef, id: 'joe' },
  { name: 'Kasumi', def: KasumiDef, id: 'kasumi' },
  { name: 'Kdash', def: KdashDef, id: 'kdash' },
  { name: 'Kim', def: KimDef, id: 'kim' },
  { name: 'Kula', def: KulaDef, id: 'kula' },
];

describe('Character definitions batch 7', () => {
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
