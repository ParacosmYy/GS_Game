import { describe, it, expect } from 'vitest';
import { ViceDef } from '../src/characters/vice.js';
import { XiangfeiDef } from '../src/characters/xiangfei.js';
import { YamazakiDef } from '../src/characters/yamazaki.js';
import { YashiroDef } from '../src/characters/yashiro.js';

describe('characterDefs batch5', () => {
  it('ViceDef has id/name/color', () => {
    expect(ViceDef.id).toBe('vice');
    expect(ViceDef.name).toBeDefined();
    expect(ViceDef.color).toBeDefined();
  });
  it('XiangfeiDef has id/name/color', () => {
    expect(XiangfeiDef.id).toBe('xiangfei');
    expect(XiangfeiDef.name).toBeDefined();
    expect(XiangfeiDef.color).toBeDefined();
  });
  it('YamazakiDef has id/name/color', () => {
    expect(YamazakiDef.id).toBe('yamazaki');
    expect(YamazakiDef.name).toBeDefined();
    expect(YamazakiDef.color).toBeDefined();
  });
  it('YashiroDef has id/name/color', () => {
    expect(YashiroDef.id).toBe('yashiro');
    expect(YashiroDef.name).toBeDefined();
    expect(YashiroDef.color).toBeDefined();
  });
});
