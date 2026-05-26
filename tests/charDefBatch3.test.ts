import { describe, it, expect } from 'vitest';
import { KimDef } from '../src/characters/kim.js';
import { KulaDef } from '../src/characters/kula.js';
import { LeonaDef } from '../src/characters/leona.js';
import { MaiDef } from '../src/characters/mai.js';
import { MaryDef } from '../src/characters/mary.js';

describe('characterDefs batch3', () => {
  it('KimDef has id/name/color', () => {
    expect(KimDef.id).toBe('kim');
    expect(KimDef.name).toBeDefined();
    expect(KimDef.color).toBeDefined();
  });
  it('KulaDef has id/name/color', () => {
    expect(KulaDef.id).toBe('kula');
    expect(KulaDef.name).toBeDefined();
    expect(KulaDef.color).toBeDefined();
  });
  it('LeonaDef has id/name/color', () => {
    expect(LeonaDef.id).toBe('leona');
    expect(LeonaDef.name).toBeDefined();
    expect(LeonaDef.color).toBeDefined();
  });
  it('MaiDef has id/name/color', () => {
    expect(MaiDef.id).toBe('mai');
    expect(MaiDef.name).toBeDefined();
    expect(MaiDef.color).toBeDefined();
  });
  it('MaryDef has id/name/color', () => {
    expect(MaryDef.id).toBe('mary');
    expect(MaryDef.name).toBeDefined();
    expect(MaryDef.color).toBeDefined();
  });
});
