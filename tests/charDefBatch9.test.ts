import { describe, it, expect } from 'vitest';
import { ShermieDef } from '../src/characters/shermie.js';
import { TerryDef } from '../src/characters/terry.js';
import { ViceDef } from '../src/characters/vice.js';
import { XiangfeiDef } from '../src/characters/xiangfei.js';
import { YamazakiDef } from '../src/characters/yamazaki.js';
import { YashiroDef } from '../src/characters/yashiro.js';

const defs = [
  { name: 'Shermie', def: ShermieDef, id: 'shermie' },
  { name: 'Terry', def: TerryDef, id: 'terry' },
  { name: 'Vice', def: ViceDef, id: 'vice' },
  { name: 'Xiangfei', def: XiangfeiDef, id: 'xiangfei' },
  { name: 'Yamazaki', def: YamazakiDef, id: 'yamazaki' },
  { name: 'Yashiro', def: YashiroDef, id: 'yashiro' },
];

describe('Character definitions batch 9', () => {
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
