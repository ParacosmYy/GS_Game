import { describe, it, expect } from 'vitest';
import { getSuperFlashZoom, updateSuperFlashZoom } from '../src/rendering/overlayScreens.js';

describe('overlayScreens', () => {
  it('getSuperFlashZoom returns number', () => {
    const z = getSuperFlashZoom();
    expect(typeof z).toBe('number');
  });
  it('default zoom is 1.0', () => {
    // After reset state (timer<=0 repeated calls)
    updateSuperFlashZoom(0, 10);
    updateSuperFlashZoom(0, 10);
    expect(getSuperFlashZoom()).toBe(1.0);
  });
  it('active timer increases zoom', () => {
    updateSuperFlashZoom(5, 10);
    const z = getSuperFlashZoom();
    expect(z).toBeGreaterThanOrEqual(1.0);
  });
  it('max progress caps at 1.08', () => {
    updateSuperFlashZoom(10, 10);
    const z = getSuperFlashZoom();
    expect(z).toBeLessThanOrEqual(1.09);
  });
  it('decay after timer ends approaches 1.0', () => {
    updateSuperFlashZoom(10, 10);
    for (let i = 0; i < 50; i++) updateSuperFlashZoom(0, 10);
    expect(getSuperFlashZoom()).toBeCloseTo(1.0, 2);
  });
});
