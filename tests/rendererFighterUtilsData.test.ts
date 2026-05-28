/**
 * Fighter Rendering Utility Data Tests
 *
 * Validates getMaxAuraColor and getAttackColorAccent from rendererFighterUtils.ts.
 * These are pure data lookup functions with no Canvas dependency.
 */
import { describe, it, expect } from 'vitest';
import { getMaxAuraColor, getAttackColorAccent } from '../src/rendering/rendererFighterUtils.js';

// ===== getMaxAuraColor =====

describe('getMaxAuraColor', () => {
  it('returns valid aura for ryo', () => {
    const c = getMaxAuraColor('ryo');
    expect(c.css).toBe('#4488ff');
    expect(c.fill).toContain('rgba');
    expect(c.stroke).toContain('rgba');
  });

  it('returns valid aura for kyo', () => {
    const c = getMaxAuraColor('kyo');
    expect(c.css).toBe('#ff8c1e');
  });

  it('returns valid aura for iori', () => {
    const c = getMaxAuraColor('iori');
    expect(c.css).toBe('#aa00ff');
  });

  it('returns fallback for unknown character', () => {
    const c = getMaxAuraColor('unknown');
    expect(c.css).toBeDefined();
    expect(c.fill).toContain('rgba');
  });

  it('each main character has distinct aura css', () => {
    const ryo = getMaxAuraColor('ryo').css;
    const kyo = getMaxAuraColor('kyo').css;
    const iori = getMaxAuraColor('iori').css;
    expect(new Set([ryo, kyo, iori]).size).toBe(3);
  });
});

// ===== getAttackColorAccent =====

describe('getAttackColorAccent', () => {
  const MAIN_CHARS = ['kyo', 'iori', 'terry', 'ryo', 'leona', 'kim', 'kula', 'ralf', 'clark'];

  it('returns valid structure for each main character', () => {
    for (const charId of MAIN_CHARS) {
      const accent = getAttackColorAccent(charId);
      expect(accent.body, `${charId}.body`).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(accent.outline, `${charId}.outline`).toBeDefined();
      expect(accent.glow, `${charId}.glow`).toBeDefined();
    }
  });

  it('returns fallback for unknown character', () => {
    const accent = getAttackColorAccent('nonexistent');
    expect(accent.body).toBeDefined();
    expect(accent.outline).toBeDefined();
    expect(accent.glow).toBeDefined();
  });

  it('kyo has warm orange accent', () => {
    expect(getAttackColorAccent('kyo').body).toBe('#ff8822');
  });

  it('iori has purple accent', () => {
    expect(getAttackColorAccent('iori').body).toBe('#aa44dd');
  });

  it('terry has blue accent', () => {
    expect(getAttackColorAccent('terry').body).toBe('#44aaff');
  });

  it('body colors are distinct across main characters', () => {
    const bodies = MAIN_CHARS.map(id => getAttackColorAccent(id).body);
    expect(new Set(bodies).size).toBe(MAIN_CHARS.length);
  });
});
