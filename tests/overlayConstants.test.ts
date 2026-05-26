import { describe, it, expect } from 'vitest';

// GAME_OVER_DURATION is exported from overlayScreens as a named export
// It's a constant number = 180 (3 seconds at 60fps)
// We test it indirectly through the module

describe('overlayScreens constants', () => {
  it('GAME_OVER_DURATION is 180', async () => {
    // Dynamic import to avoid pulling Canvas deps unnecessarily
    const mod = await import('../src/rendering/overlayScreens.js');
    expect(mod.GAME_OVER_DURATION).toBe(180);
  });
});
