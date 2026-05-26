import { describe, it, expect } from 'vitest';
import { BillyDef } from '../src/characters/billy.js';
import { ChangDef } from '../src/characters/chang.js';
import { ChoiDef } from '../src/characters/choi.js';
import { ChrisDef } from '../src/characters/chris.js';
import { ClarkDef } from '../src/characters/clark.js';

const defs = [
  { name: 'Billy', def: BillyDef, id: 'billy' },
  { name: 'Chang', def: ChangDef, id: 'chang' },
  { name: 'Choi', def: ChoiDef, id: 'choi' },
  { name: 'Chris', def: ChrisDef, id: 'chris' },
  { name: 'Clark', def: ClarkDef, id: 'clark' },
];

describe('Character definitions batch 6', () => {
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
