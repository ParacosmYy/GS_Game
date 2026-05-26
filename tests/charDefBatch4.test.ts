import { describe, it, expect } from 'vitest';
import { MatureDef } from '../src/characters/mature.js';
import { RalfDef } from '../src/characters/ralf.js';
import { RobertDef } from '../src/characters/robert.js';
import { ShermieDef } from '../src/characters/shermie.js';
import { TerryDef } from '../src/characters/terry.js';

describe('characterDefs batch4', () => {
  it('MatureDef has id/name/color', () => {
    expect(MatureDef.id).toBe('mature');
    expect(MatureDef.name).toBeDefined();
    expect(MatureDef.color).toBeDefined();
  });
  it('RalfDef has id/name/color', () => {
    expect(RalfDef.id).toBe('ralf');
    expect(RalfDef.name).toBeDefined();
    expect(RalfDef.color).toBeDefined();
  });
  it('RobertDef has id/name/color', () => {
    expect(RobertDef.id).toBe('robert');
    expect(RobertDef.name).toBeDefined();
    expect(RobertDef.color).toBeDefined();
  });
  it('ShermieDef has id/name/color', () => {
    expect(ShermieDef.id).toBe('shermie');
    expect(ShermieDef.name).toBeDefined();
    expect(ShermieDef.color).toBeDefined();
  });
  it('TerryDef has id/name/color', () => {
    expect(TerryDef.id).toBe('terry');
    expect(TerryDef.name).toBeDefined();
    expect(TerryDef.color).toBeDefined();
  });
});
