/**
 * Hit Effects Plugin Structure Regression Test
 * Verifies all 3 characters' hit effect plugins have valid structure.
 */
import { describe, it, expect } from 'vitest';
import { RYO_HIT_EFFECTS } from '../src/content/characters/ryo/hitEffects/ryoHitEffects.js';
import { KYO_HIT_EFFECTS } from '../src/content/characters/kyo/hitEffects/kyoHitEffects.js';
import { IORI_HIT_EFFECTS } from '../src/content/characters/iori/hitEffects/ioriHitEffects.js';

interface Plugin {
  charId: string;
  prefixes: string[];
  onHitVFX: (ctx: any) => boolean;
  onHitSFX: (ctx: any) => boolean;
}

const plugins: [string, Plugin][] = [
  ['Ryo', RYO_HIT_EFFECTS as any],
  ['Kyo', KYO_HIT_EFFECTS as any],
  ['Iori', IORI_HIT_EFFECTS as any],
];

describe('Hit effects plugin structure', () => {
  for (const [name, plugin] of plugins) {
    describe(`${name}`, () => {
      it('has charId', () => {
        expect(plugin.charId).toBeDefined();
        expect(typeof plugin.charId).toBe('string');
      });

      it('has non-empty prefixes', () => {
        expect(plugin.prefixes).toBeDefined();
        expect(Array.isArray(plugin.prefixes)).toBe(true);
        expect(plugin.prefixes.length).toBeGreaterThan(0);
      });

      it('prefixes are all-caps strings', () => {
        for (const pf of plugin.prefixes) {
          expect(pf, `${name} prefix`).toMatch(/^[A-Z_0-9]+$/);
        }
      });

      it('has onHitVFX handler', () => {
        expect(plugin.onHitVFX, `${name}.onHitVFX`).toBeDefined();
        expect(typeof plugin.onHitVFX).toBe('function');
      });

      it('has onHitSFX handler', () => {
        expect(plugin.onHitSFX, `${name}.onHitSFX`).toBeDefined();
        expect(typeof plugin.onHitSFX).toBe('function');
      });
    });
  }

  it('all 3 characters have unique charId', () => {
    const ids = plugins.map(([, p]) => p.charId);
    const unique = new Set(ids);
    expect(unique.size).toBe(3);
  });

  it('no prefix overlap between characters', () => {
    const allPrefixes = plugins.flatMap(([, p]) => p.prefixes);
    const unique = new Set(allPrefixes);
    expect(unique.size, 'all prefixes unique across characters').toBe(allPrefixes.length);
  });

  it('each character has a DM prefix', () => {
    for (const [name, plugin] of plugins) {
      const hasDM = plugin.prefixes.some(pf => pf.startsWith('DM_') || pf.includes('_DM_'));
      expect(hasDM, `${name} has DM prefix`).toBe(true);
    }
  });
});
