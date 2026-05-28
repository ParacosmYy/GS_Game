import { describe, it, expect } from 'vitest';

describe('overlayScreens constants', () => {
  it('GAME_OVER_DURATION is 180', async () => {
    const mod = await import('../src/rendering/overlayScreens.js');
    expect(mod.GAME_OVER_DURATION).toBe(180);
  }, 15000);
});
