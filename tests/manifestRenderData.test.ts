import { describe, it, expect } from 'vitest';
import { getCharacterRenderData, getCharacterColors, hasPortraitForSize } from '../src/rendering/manifestRenderData.js';

describe('manifestRenderData', () => {
  it('getCharacterRenderData for ryo returns object', () => {
    const data = getCharacterRenderData('ryo');
    expect(data).toBeDefined();
    expect(typeof data).toBe('object');
  });
  it('getCharacterRenderData for kyo returns object', () => {
    const data = getCharacterRenderData('kyo');
    expect(data).toBeDefined();
  });
  it('getCharacterColors returns color fields', () => {
    const colors = getCharacterColors('ryo');
    expect(colors).toHaveProperty('body');
    expect(colors).toHaveProperty('head');
    expect(colors).toHaveProperty('outfit');
    expect(colors).toHaveProperty('hair');
  });
  it('hasPortraitForSize returns boolean', () => {
    const result = hasPortraitForSize('ryo', 'small');
    expect(typeof result).toBe('boolean');
  });
  it('getCharacterColors for unknown returns fallback', () => {
    const colors = getCharacterColors('unknown_char');
    expect(colors).toBeDefined();
    expect(typeof colors.body).toBe('string');
  });
});
