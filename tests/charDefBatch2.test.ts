import { describe, it, expect } from 'vitest';
import { ChrisDef } from '../src/characters/chris.js';
import { ClarkDef } from '../src/characters/clark.js';
import { JoeDef } from '../src/characters/joe.js';
import { KasumiDef } from '../src/characters/kasumi.js';
import { KdashDef } from '../src/characters/kdash.js';

describe('characterDefs batch2', () => {
  it('ChrisDef has id/name/color', () => {
    expect(ChrisDef.id).toBe('chris');
    expect(ChrisDef.name).toBeDefined();
    expect(ChrisDef.color).toBeDefined();
  });
  it('ClarkDef has id/name/color', () => {
    expect(ClarkDef.id).toBe('clark');
    expect(ClarkDef.name).toBeDefined();
    expect(ClarkDef.color).toBeDefined();
  });
  it('JoeDef has id/name/color', () => {
    expect(JoeDef.id).toBe('joe');
    expect(JoeDef.name).toBeDefined();
    expect(JoeDef.color).toBeDefined();
  });
  it('KasumiDef has id/name/color', () => {
    expect(KasumiDef.id).toBe('kasumi');
    expect(KasumiDef.name).toBeDefined();
    expect(KasumiDef.color).toBeDefined();
  });
  it('KdashDef has id/name/color', () => {
    expect(KdashDef.id).toBe('kdash');
    expect(KdashDef.name).toBeDefined();
    expect(KdashDef.color).toBeDefined();
  });
});
