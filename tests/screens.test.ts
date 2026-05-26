import { describe, it, expect } from 'vitest';
import { WIN_QUOTE_DURATION } from '../src/rendering/screens.js';

describe('screens constants', () => {
  it('WIN_QUOTE_DURATION is 180 frames', () => {
    expect(WIN_QUOTE_DURATION).toBe(180);
  });
});
