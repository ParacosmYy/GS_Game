import { describe, it, expect } from 'vitest';
import { KimDef } from '../src/characters/kim.js';
import { KulaDef } from '../src/characters/kula.js';
import { LeonaDef } from '../src/characters/leona.js';
import { MaiDef } from '../src/characters/mai.js';
import { MaryDef } from '../src/characters/mary.js';

const chars = [
  { name: 'kim', def: KimDef },
  { name: 'kula', def: KulaDef },
  { name: 'leona', def: LeonaDef },
  { name: 'mai', def: MaiDef },
  { name: 'mary', def: MaryDef },
];

describe('character defs batch 3', () => {
  for (const { name, def } of chars) {
    describe(name, () => {
      it('has correct id', () => { expect(def.id).toBe(name); });
      it('has name string', () => { expect(typeof def.name).toBe('string'); });
      it('has color string', () => { expect(typeof def.color).toBe('string'); });
      it('has winQuotes array', () => { expect(Array.isArray(def.winQuotes)).toBe(true); });
      it('has stats object', () => { expect(def.stats).toBeDefined(); });
    });
  }
});
