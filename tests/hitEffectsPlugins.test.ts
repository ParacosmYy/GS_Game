/**
 * Character Hit Effects Plugin Structural Tests
 *
 * Validates all 5 CharacterHitEffects plugins (ryo, kyo, iori, terry, kim)
 * have correct structure: charId, prefixes, onHitVFX, onHitSFX.
 */
import { describe, it, expect } from 'vitest';
import type { CharacterHitEffects } from '../src/content/characterHitEffects.js';
import { RYO_HIT_EFFECTS } from '../src/content/characters/ryo/hitEffects/ryoHitEffects.js';
import { KYO_HIT_EFFECTS } from '../src/content/characters/kyo/hitEffects/kyoHitEffects.js';
import { IORI_HIT_EFFECTS } from '../src/content/characters/iori/hitEffects/ioriHitEffects.js';
import { TERRY_HIT_EFFECTS } from '../src/content/characters/terry/hitEffects/terryHitEffects.js';
import { KIM_HIT_EFFECTS } from '../src/content/characters/kim/hitEffects/kimHitEffects.js';

function validatePlugin(plugin: CharacterHitEffects, expectedCharId: string) {
  describe(`${expectedCharId} hit effects plugin`, () => {
    it('charId matches', () => {
      expect(plugin.charId).toBe(expectedCharId);
    });

    it('prefixes is non-empty array', () => {
      expect(Array.isArray(plugin.prefixes)).toBe(true);
      expect(plugin.prefixes.length).toBeGreaterThan(0);
    });

    it('prefixes are non-empty strings', () => {
      for (const p of plugin.prefixes) {
        expect(p.length).toBeGreaterThan(0);
      }
    });

    it('prefixes contain character-specific prefix', () => {
      const charPrefix = `${expectedCharId.toUpperCase()}_`;
      const hasCharPrefix = plugin.prefixes.some(p => p.startsWith(charPrefix));
      expect(hasCharPrefix, `has prefix starting with ${charPrefix}`).toBe(true);
    });

    it('onHitVFX is a function', () => {
      expect(typeof plugin.onHitVFX).toBe('function');
    });

    it('onHitSFX is a function', () => {
      expect(typeof plugin.onHitSFX).toBe('function');
    });
  });
}

// ===== All 5 plugins =====

validatePlugin(RYO_HIT_EFFECTS, 'ryo');
validatePlugin(KYO_HIT_EFFECTS, 'kyo');
validatePlugin(IORI_HIT_EFFECTS, 'iori');
validatePlugin(TERRY_HIT_EFFECTS, 'terry');
validatePlugin(KIM_HIT_EFFECTS, 'kim');

// ===== Cross-plugin consistency =====

describe('Hit effects plugins — cross-plugin consistency', () => {
  const allPlugins: CharacterHitEffects[] = [
    RYO_HIT_EFFECTS, KYO_HIT_EFFECTS, IORI_HIT_EFFECTS,
    TERRY_HIT_EFFECTS, KIM_HIT_EFFECTS,
  ];

  it('5 plugins total', () => {
    expect(allPlugins.length).toBe(5);
  });

  it('all charIds are unique', () => {
    const ids = allPlugins.map(p => p.charId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('ryo prefixes cover DM_TEN_HA', () => {
    expect(RYO_HIT_EFFECTS.prefixes).toContain('DM_TEN_HA');
  });

  it('terry prefixes cover DM_POWER_GEYSER', () => {
    expect(TERRY_HIT_EFFECTS.prefixes).toContain('DM_POWER_GEYSER');
  });

  it('kim prefixes cover SDM_PHOENIX', () => {
    expect(KIM_HIT_EFFECTS.prefixes).toContain('SDM_PHOENIX');
  });
});
