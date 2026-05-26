import { describe, it, expect } from 'vitest';
import { hasHighResFrame, getResolvedFrameKey } from '../src/rendering/sprites/ryoHighResRender.js';
import { FighterState } from '../src/core/types.js';

describe('ryoHighResRender', () => {
  it('hasHighResFrame returns false for non-ryo', () => {
    expect(hasHighResFrame('kyo', FighterState.IDLE)).toBe(false);
  });
  it('hasHighResFrame returns boolean for ryo idle', () => {
    const result = hasHighResFrame('ryo', FighterState.IDLE);
    expect(typeof result).toBe('boolean');
  });
  it('getResolvedFrameKey returns value', () => {
    const key = getResolvedFrameKey(FighterState.IDLE, null, 0, 1);
    expect(key).toBeDefined();
  });
});
