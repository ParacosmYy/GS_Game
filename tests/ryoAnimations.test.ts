import { describe, it, expect } from 'vitest';
import { getRyoAnimations, getRyoAnimSequence, getRyoAnimSequenceNames } from '../src/content/characters/ryo/animations.js';

describe('ryoAnimations', () => {
  it('getRyoAnimations returns object or undefined', () => {
    const anim = getRyoAnimations();
    expect(anim === undefined || typeof anim === 'object').toBe(true);
  });
  it('getRyoAnimSequenceNames returns array', () => {
    const names = getRyoAnimSequenceNames();
    expect(Array.isArray(names)).toBe(true);
    expect(names.length).toBeGreaterThan(0);
  });
  it('getRyoAnimSequence returns object for valid name', () => {
    const names = getRyoAnimSequenceNames();
    const seq = getRyoAnimSequence(names[0]);
    expect(seq).toBeDefined();
  });
  it('getRyoAnimSequence returns undefined for invalid', () => {
    const seq = getRyoAnimSequence('nonexistent_anim');
    expect(seq).toBeUndefined();
  });
  it('sequence names include idle', () => {
    const names = getRyoAnimSequenceNames();
    const hasIdle = names.some(n => n.toLowerCase().includes('idle'));
    expect(hasIdle).toBe(true);
  });
});
