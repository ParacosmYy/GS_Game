import { describe, it, expect } from 'vitest';
import { ViceDef } from '../src/characters/vice.js';
import { XiangfeiDef } from '../src/characters/xiangfei.js';
import { YamazakiDef } from '../src/characters/yamazaki.js';
import { YashiroDef } from '../src/characters/yashiro.js';

const chars = [
  { name: 'vice', def: ViceDef },
  { name: 'xiangfei', def: XiangfeiDef },
  { name: 'yamazaki', def: YamazakiDef },
  { name: 'yashiro', def: YashiroDef },
];

describe('character defs batch 5', () => {
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
