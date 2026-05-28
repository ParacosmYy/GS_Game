/**
 * getAttackColorAccent full roster + cross-ref with ROSTER regression tests
 *
 * Protects: 27-character accent coverage, no duplicate cases,
 * valid hex color format, MAX_AURA_COLORS structure consistency.
 */
import { describe, it, expect } from 'vitest';
import { getMaxAuraColor, getAttackColorAccent } from '../src/rendering/rendererFighterUtils.js';
import { ROSTER } from '../src/characters/index.js';

const HEX6 = /^#[0-9a-fA-F]{6}$/;

describe('getAttackColorAccent full roster coverage', () => {
  it('every ROSTER character returns valid hex6 body', () => {
    for (const char of ROSTER) {
      const accent = getAttackColorAccent(char.id);
      expect(accent.body, `${char.id}.body hex6`).toMatch(HEX6);
    }
  });

  it('every ROSTER character outline is defined and non-empty', () => {
    for (const char of ROSTER) {
      const accent = getAttackColorAccent(char.id);
      expect(accent.outline.length, `${char.id}.outline`).toBeGreaterThan(0);
    }
  });

  it('every ROSTER character glow is defined and non-empty', () => {
    for (const char of ROSTER) {
      const accent = getAttackColorAccent(char.id);
      expect(accent.glow.length, `${char.id}.glow`).toBeGreaterThan(0);
    }
  });

  it('all ROSTER characters get non-fallback accent', () => {
    const fallbackBody = getAttackColorAccent('zzz_nonexistent').body;
    for (const char of ROSTER) {
      const accent = getAttackColorAccent(char.id);
      expect(accent.body, `${char.id} should not use fallback`).not.toBe(fallbackBody);
    }
  });

  it('body colors are distinct across all ROSTER characters', () => {
    const bodies = ROSTER.map(c => getAttackColorAccent(c.id).body);
    expect(new Set(bodies).size).toBe(ROSTER.length);
  });

  it('fallback body for unknown character is valid hex6', () => {
    const accent = getAttackColorAccent('zzz_nonexistent');
    expect(accent.body).toMatch(HEX6);
  });

  it('3 main characters have element-appropriate colors', () => {
    const ryo = getAttackColorAccent('ryo');
    const kyo = getAttackColorAccent('kyo');
    const iori = getAttackColorAccent('iori');
    expect(ryo.body).toBe('#4488ff');
    expect(kyo.body).toBe('#ff8822');
    expect(iori.body).toBe('#aa44dd');
  });

  it('27 characters in ROSTER', () => {
    expect(ROSTER.length).toBe(27);
  });
});

describe('getMaxAuraColor structure consistency', () => {
  const AURA_CHARS = ['ryo', 'kyo', 'iori'];

  it('main 3 characters have distinct CSS colors', () => {
    const cssColors = AURA_CHARS.map(id => getMaxAuraColor(id).css);
    expect(new Set(cssColors).size).toBe(3);
  });

  it('fill and stroke contain rgba prefix', () => {
    for (const charId of AURA_CHARS) {
      const aura = getMaxAuraColor(charId);
      expect(aura.fill, `${charId}.fill`).toContain('rgba(');
      expect(aura.stroke, `${charId}.stroke`).toContain('rgba(');
    }
  });

  it('css is valid hex color', () => {
    for (const charId of AURA_CHARS) {
      const aura = getMaxAuraColor(charId);
      expect(aura.css).toMatch(HEX6);
    }
  });

  it('fallback returns valid structure', () => {
    const fb = getMaxAuraColor('zzz_unknown');
    expect(fb.css).toMatch(HEX6);
    expect(fb.fill).toContain('rgba(');
    expect(fb.stroke).toContain('rgba(');
  });

  it('css values match expected palette', () => {
    expect(getMaxAuraColor('ryo').css).toBe('#4488ff');
    expect(getMaxAuraColor('kyo').css).toBe('#ff8c1e');
    expect(getMaxAuraColor('iori').css).toBe('#aa00ff');
  });
});
