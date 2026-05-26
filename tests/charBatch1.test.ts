import { describe, it, expect } from 'vitest';
import { AndyDef } from '../src/characters/andy.js';
import { AthenaDef } from '../src/characters/athena.js';
import { BillyDef } from '../src/characters/billy.js';
import { ChangDef } from '../src/characters/chang.js';
import { ChoiDef } from '../src/characters/choi.js';

const chars = [
  { name: 'andy', def: AndyDef },
  { name: 'athena', def: AthenaDef },
  { name: 'billy', def: BillyDef },
  { name: 'chang', def: ChangDef },
  { name: 'choi', def: ChoiDef },
];

describe('character defs batch 1', () => {
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
