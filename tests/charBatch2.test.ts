import { describe, it, expect } from 'vitest';
import { ChrisDef } from '../src/characters/chris.js';
import { ClarkDef } from '../src/characters/clark.js';
import { JoeDef } from '../src/characters/joe.js';
import { KasumiDef } from '../src/characters/kasumi.js';
import { KdashDef } from '../src/characters/kdash.js';

const chars = [
  { name: 'chris', def: ChrisDef },
  { name: 'clark', def: ClarkDef },
  { name: 'joe', def: JoeDef },
  { name: 'kasumi', def: KasumiDef },
  { name: 'kdash', def: KdashDef },
];

describe('character defs batch 2', () => {
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
