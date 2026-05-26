import { describe, it, expect } from 'vitest';
import { MatureDef } from '../src/characters/mature.js';
import { RalfDef } from '../src/characters/ralf.js';
import { RobertDef } from '../src/characters/robert.js';
import { ShermieDef } from '../src/characters/shermie.js';
import { TerryDef } from '../src/characters/terry.js';

const chars = [
  { name: 'mature', def: MatureDef },
  { name: 'ralf', def: RalfDef },
  { name: 'robert', def: RobertDef },
  { name: 'shermie', def: ShermieDef },
  { name: 'terry', def: TerryDef },
];

describe('character defs batch 4', () => {
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
