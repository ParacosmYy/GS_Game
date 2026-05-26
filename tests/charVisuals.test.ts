import { describe, it, expect } from 'vitest';
import { CHAR_VISUALS, getDefaultVisual } from '../src/rendering/spritePoseData.js';

describe('spritePoseData CHAR_VISUALS', () => {
  const charIds = Object.keys(CHAR_VISUALS);
  it('has multiple character entries', () => {
    expect(charIds.length).toBeGreaterThanOrEqual(5);
  });
  it('ryo visual has expected fields', () => {
    const ryo = CHAR_VISUALS['ryo'];
    expect(ryo).toBeDefined();
    expect(ryo.hairColor).toBeDefined();
    expect(ryo.skinColor).toBeDefined();
    expect(ryo.shirtColor).toBeDefined();
    expect(ryo.hairStyle).toBeDefined();
    expect(ryo.idleStyle).toBeDefined();
  });
  it('kyo visual has spiky hair', () => {
    expect(CHAR_VISUALS['kyo'].hairStyle).toBe('spiky');
  });
  it('every visual has valid hairStyle', () => {
    const validStyles = ['spiky', 'long', 'short', 'ponytail', 'wild'];
    for (const id of Object.keys(CHAR_VISUALS)) {
      const v = CHAR_VISUALS[id];
      expect(validStyles).toContain(v.hairStyle);
    }
  });
  it('getDefaultVisual returns kyo-like visual', () => {
    const def = getDefaultVisual();
    expect(def.hairColor).toBeDefined();
    expect(typeof def.headW).toBe('number');
    expect(typeof def.legLen).toBe('number');
  });
});
