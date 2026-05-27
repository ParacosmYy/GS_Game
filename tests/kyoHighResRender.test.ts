import { describe, it, expect } from 'vitest';
import { FighterState } from '../src/core/types.js';
import { hasKyoHighResFrame } from '../src/rendering/sprites/kyoHighResRender.js';

describe('kyoHighResRender', () => {
  it('registers a high-res block frame set for Kyo', () => {
    expect(hasKyoHighResFrame(FighterState.BLOCK)).toBe(true);
  });
});
