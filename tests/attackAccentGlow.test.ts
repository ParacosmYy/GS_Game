/**
 * Attack Accent Glow Regression Test
 * Verifies all 27 characters have valid attack accent glow data.
 */
import { describe, it, expect } from 'vitest';
import { getAttackAccentGlow, type AttackAccentGlow } from '../src/rendering/skeletalVictory.js';

const ALL_CHARS = [
  'kyo', 'iori', 'terry', 'kim', 'ryo', 'leona', 'kdash', 'kula',
  'robert', 'mai', 'clark', 'ralf', 'joe', 'andy', 'billy', 'chang',
  'yashiro', 'athena', 'mature', 'chris', 'shermie', 'vice', 'yamazaki',
  'mary', 'kasumi', 'xiangfei', 'choi',
];

describe('Attack accent glow', () => {
  it('returns non-null for all 27 characters', () => {
    for (const charId of ALL_CHARS) {
      const glow = getAttackAccentGlow(charId);
      expect(glow, `${charId} has accent glow`).not.toBeNull();
    }
  });

  it('returns null for unknown character', () => {
    expect(getAttackAccentGlow('unknown')).toBeNull();
    expect(getAttackAccentGlow('')).toBeNull();
  });

  it('all glow values have valid numeric ranges', () => {
    for (const charId of ALL_CHARS) {
      const g = getAttackAccentGlow(charId)!;
      expect(g.blur, `${charId}.blur > 0`).toBeGreaterThan(0);
      expect(g.r, `${charId}.r 0..255`).toBeGreaterThanOrEqual(0);
      expect(g.r, `${charId}.r <= 255`).toBeLessThanOrEqual(255);
      expect(g.g, `${charId}.g 0..255`).toBeGreaterThanOrEqual(0);
      expect(g.g, `${charId}.g <= 255`).toBeLessThanOrEqual(255);
      expect(g.b, `${charId}.b 0..255`).toBeGreaterThanOrEqual(0);
      expect(g.b, `${charId}.b <= 255`).toBeLessThanOrEqual(255);
      expect(g.intensity, `${charId}.intensity > 0`).toBeGreaterThan(0);
      expect(g.intensity, `${charId}.intensity <= 1.5`).toBeLessThanOrEqual(1.5);
      expect(g.radius, `${charId}.radius >= 1`).toBeGreaterThanOrEqual(1);
      expect(g.radius, `${charId}.radius <= 5`).toBeLessThanOrEqual(5);
    }
  });

  it('shadow colors are valid hex', () => {
    for (const charId of ALL_CHARS) {
      const g = getAttackAccentGlow(charId)!;
      expect(g.shadow, `${charId}.shadow hex`).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it('Ryo/Kyo/Iori have high intensity (primary characters)', () => {
    for (const charId of ['kyo', 'iori', 'ryo']) {
      const g = getAttackAccentGlow(charId)!;
      expect(g.intensity, `${charId} intensity >= 1.0`).toBeGreaterThanOrEqual(1.0);
    }
  });

  it('heavy characters (chang/ralf) have larger blur and radius', () => {
    const chang = getAttackAccentGlow('chang')!;
    const kula = getAttackAccentGlow('kula')!;
    expect(chang.blur, 'chang blur > kula blur').toBeGreaterThan(kula.blur);
    expect(chang.radius, 'chang radius > kula radius').toBeGreaterThan(kula.radius);
  });

  it('fire characters (kyo/kdash) have warm colors (high R)', () => {
    const kyo = getAttackAccentGlow('kyo')!;
    const kdash = getAttackAccentGlow('kdash')!;
    expect(kyo.r, 'kyo.r > 200').toBeGreaterThan(200);
    expect(kdash.r, 'kdash.r > 200').toBeGreaterThan(200);
  });

  it('ice characters (kula) have cool colors (high B)', () => {
    const kula = getAttackAccentGlow('kula')!;
    expect(kula.b, 'kula.b > kula.r').toBeGreaterThan(kula.r);
  });
});
