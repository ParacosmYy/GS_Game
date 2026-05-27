import { describe, it, expect } from 'vitest';
import { getPortraitForSize } from '../src/rendering/manifestRenderData.js';
import type { PixelPortraitData } from '../src/rendering/pixelPortraits.js';

function countVisiblePixels(portrait: PixelPortraitData): number {
  let visible = 0;
  for (const row of portrait.pixels) {
    for (const idx of row) {
      if ((idx ?? 0) > 0) visible++;
    }
  }
  return visible;
}

describe('kyo and iori portraits', () => {
  const cases: Array<[string, 'select' | 'hud' | 'win']> = [
    ['kyo', 'select'],
    ['kyo', 'hud'],
    ['kyo', 'win'],
    ['iori', 'select'],
    ['iori', 'hud'],
    ['iori', 'win'],
  ];

  it.each(cases)('has visible pixels for %s %s portrait', (charId, size) => {
    const portrait = getPortraitForSize(charId, size);
    expect(portrait).toBeDefined();
    expect(countVisiblePixels(portrait!)).toBeGreaterThan(0);
  });
});
