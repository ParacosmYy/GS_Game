import { describe, it, expect } from 'vitest';
import { AndyDef } from '../src/characters/andy.js';
import { AthenaDef } from '../src/characters/athena.js';
import { BillyDef } from '../src/characters/billy.js';
import { ChangDef } from '../src/characters/chang.js';
import { ChoiDef } from '../src/characters/choi.js';

describe('characterDefs batch1', () => {
  it('AndyDef has id/name/color', () => {
    expect(AndyDef.id).toBe('andy');
    expect(AndyDef.name).toBeDefined();
    expect(AndyDef.color).toBeDefined();
  });
  it('AthenaDef has id/name/color', () => {
    expect(AthenaDef.id).toBe('athena');
    expect(AthenaDef.name).toBeDefined();
    expect(AthenaDef.color).toBeDefined();
  });
  it('BillyDef has id/name/color', () => {
    expect(BillyDef.id).toBe('billy');
    expect(BillyDef.name).toBeDefined();
    expect(BillyDef.color).toBeDefined();
  });
  it('ChangDef has id/name/color', () => {
    expect(ChangDef.id).toBe('chang');
    expect(ChangDef.name).toBeDefined();
    expect(ChangDef.color).toBeDefined();
  });
  it('ChoiDef has id/name/color', () => {
    expect(ChoiDef.id).toBe('choi');
    expect(ChoiDef.name).toBeDefined();
    expect(ChoiDef.color).toBeDefined();
  });
});
