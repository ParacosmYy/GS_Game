/**
 * Element-coded Hit Flash Regression Tests
 *
 * Verifies the character-element-coded hit flash system in rendererFighter:
 *   - MAX_AURA_COLORS maps ryo/kyo/iori to distinct element colors
 *   - Unknown characters fall back to green default
 *   - Element colors produce valid hex + alpha suffix for CSS
 */
import { describe, it, expect } from 'vitest';

// MAX_AURA_COLORS is module-scoped; test through the exported rendering functions
// by verifying the color values are used correctly.
// We test the color map indirectly by verifying CSS hex + alpha construction.

const MAX_AURA_COLORS: Record<string, { css: string }> = {
  ryo: { css: '#4488ff' },
  kyo: { css: '#ff8c1e' },
  iori: { css: '#aa00ff' },
};

function getMaxAuraCss(charId: string): string {
  return MAX_AURA_COLORS[charId]?.css ?? '#44ff88';
}

function makeElementOutline(charId: string): string {
  const aura = getMaxAuraCss(charId);
  return `${aura}60`;
}

function makeElementGlow(charId: string): string {
  const aura = getMaxAuraCss(charId);
  return `${aura}30`;
}

describe('Element-coded hit flash', () => {
  it('ryo element aura is blue', () => {
    expect(getMaxAuraCss('ryo')).toBe('#4488ff');
  });

  it('kyo element aura is fire orange', () => {
    expect(getMaxAuraCss('kyo')).toBe('#ff8c1e');
  });

  it('iori element aura is purple', () => {
    expect(getMaxAuraCss('iori')).toBe('#aa00ff');
  });

  it('unknown character falls back to green', () => {
    expect(getMaxAuraCss('terry')).toBe('#44ff88');
  });

  it('element outline uses 8-digit hex with alpha 0x60', () => {
    expect(makeElementOutline('kyo')).toBe('#ff8c1e60');
    expect(makeElementOutline('iori')).toBe('#aa00ff60');
  });

  it('element glow uses 8-digit hex with alpha 0x30', () => {
    expect(makeElementGlow('ryo')).toBe('#4488ff30');
    expect(makeElementGlow('kyo')).toBe('#ff8c1e30');
  });

  it('all element colors are valid 6-digit hex', () => {
    const hexPattern = /^#[0-9a-f]{6}$/;
    for (const charId of ['ryo', 'kyo', 'iori']) {
      expect(getMaxAuraCss(charId)).toMatch(hexPattern);
    }
    // Fallback also valid
    expect(getMaxAuraCss('unknown')).toMatch(hexPattern);
  });

  it('8-digit hex colors (with alpha) are valid CSS', () => {
    // #RRGGBBAA is a valid CSS color
    const colorWithAlpha = makeElementOutline('kyo');
    expect(colorWithAlpha).toMatch(/^#[0-9a-f]{8}$/);
  });

  it('three main characters produce three distinct colors', () => {
    const colors = new Set(['ryo', 'kyo', 'iori'].map(getMaxAuraCss));
    expect(colors.size).toBe(3);
  });

  it('element outline + glow have same base but different alpha', () => {
    const outline = makeElementOutline('kyo');
    const glow = makeElementGlow('kyo');
    // Same base hex
    expect(outline.slice(0, 7)).toBe(glow.slice(0, 7));
    // Different alpha suffix
    expect(outline.slice(7)).toBe('60');
    expect(glow.slice(7)).toBe('30');
  });
});

// ===== Direct getMaxAuraColor import tests =====
describe('getMaxAuraColor direct import', () => {
  it('returns Ryo blue element for ryo', async () => {
    const { getMaxAuraColor: fn } = await import('../src/rendering/rendererFighter.js');
    const c = fn('ryo');
    expect(c.css).toBe('#4488ff');
  }, 15000);

  it('returns Kyo fire orange for kyo', async () => {
    const { getMaxAuraColor: fn } = await import('../src/rendering/rendererFighter.js');
    const c = fn('kyo');
    expect(c.css).toBe('#ff8c1e');
  }, 15000);

  it('returns Iori purple for iori', async () => {
    const { getMaxAuraColor: fn } = await import('../src/rendering/rendererFighter.js');
    const c = fn('iori');
    expect(c.css).toBe('#aa00ff');
  }, 15000);

  it('returns green fallback for unknown character', async () => {
    const { getMaxAuraColor: fn } = await import('../src/rendering/rendererFighter.js');
    const c = fn('unknown');
    expect(c.css).toBe('#44ff88');
  }, 15000);
});
