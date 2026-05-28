/**
 * Hit Effects Coverage Cross-Reference Tests
 *
 * Validates that hit effects plugins for Ryo/Kyo/Iori:
 * - Have correct plugin structure (charId, prefixes, onHitVFX, onHitSFX)
 * - Prefixes match their character-specific attack type patterns
 * - Referenced attack types exist in FRAME_DATA
 */
import { describe, it, expect } from 'vitest';
import { RYO_HIT_EFFECTS } from '../src/content/characters/ryo/hitEffects/ryoHitEffects.js';
import { KYO_HIT_EFFECTS } from '../src/content/characters/kyo/hitEffects/kyoHitEffects.js';
import { IORI_HIT_EFFECTS } from '../src/content/characters/iori/hitEffects/ioriHitEffects.js';
import { FRAME_DATA } from '../src/core/frameDataConstants.js';

const fdKeys = new Set(Object.keys(FRAME_DATA));

describe('Hit effects plugin structure', () => {
  const plugins = [
    { name: 'Ryo', plugin: RYO_HIT_EFFECTS },
    { name: 'Kyo', plugin: KYO_HIT_EFFECTS },
    { name: 'Iori', plugin: IORI_HIT_EFFECTS },
  ];

  for (const { name, plugin } of plugins) {
    describe(`${name}`, () => {
      it('has charId', () => {
        expect(typeof plugin.charId).toBe('string');
        expect(plugin.charId.length).toBeGreaterThan(0);
      });

      it('has non-empty prefixes', () => {
        expect(Array.isArray(plugin.prefixes)).toBe(true);
        expect(plugin.prefixes.length).toBeGreaterThan(0);
      });

      it('has onHitVFX function', () => {
        expect(typeof plugin.onHitVFX).toBe('function');
      });

      it('has onHitSFX function', () => {
        expect(typeof plugin.onHitSFX).toBe('function');
      });

      it('prefixes include character prefix', () => {
        const expected = name.toUpperCase();
        const hasPrefix = plugin.prefixes.some(p =>
          p.toUpperCase().startsWith(expected)
        );
        expect(hasPrefix, `${name} prefixes include ${expected}`).toBe(true);
      });
    });
  }
});

describe('Hit effects prefixes → FRAME_DATA coverage', () => {
  it('Ryo prefixes match FRAME_DATA entries', () => {
    for (const prefix of RYO_HIT_EFFECTS.prefixes) {
      const matching = [...fdKeys].filter(k => k.startsWith(prefix));
      expect(matching.length, `prefix "${prefix}" matches FRAME_DATA`).toBeGreaterThan(0);
    }
  });

  it('Kyo prefixes match FRAME_DATA entries', () => {
    for (const prefix of KYO_HIT_EFFECTS.prefixes) {
      const matching = [...fdKeys].filter(k => k.startsWith(prefix));
      expect(matching.length, `prefix "${prefix}" matches FRAME_DATA`).toBeGreaterThan(0);
    }
  });

  it('Iori prefixes match FRAME_DATA entries', () => {
    for (const prefix of IORI_HIT_EFFECTS.prefixes) {
      const matching = [...fdKeys].filter(k => k.startsWith(prefix));
      expect(matching.length, `prefix "${prefix}" matches FRAME_DATA`).toBeGreaterThan(0);
    }
  });
});

describe('Hit effects cross-character consistency', () => {
  it('charIds are unique across plugins', () => {
    const ids = [RYO_HIT_EFFECTS, KYO_HIT_EFFECTS, IORI_HIT_EFFECTS].map(p => p.charId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('character prefixes do not overlap', () => {
    const ryoPrefixes = new Set(RYO_HIT_EFFECTS.prefixes);
    const kyoPrefixes = new Set(KYO_HIT_EFFECTS.prefixes);
    const ioriPrefixes = new Set(IORI_HIT_EFFECTS.prefixes);

    // Character-specific prefixes should not overlap
    for (const p of ryoPrefixes) {
      expect(kyoPrefixes.has(p), `Ryo prefix "${p}" not in Kyo`).toBe(false);
      expect(ioriPrefixes.has(p), `Ryo prefix "${p}" not in Iori`).toBe(false);
    }
    for (const p of kyoPrefixes) {
      expect(ioriPrefixes.has(p), `Kyo prefix "${p}" not in Iori`).toBe(false);
    }
  });

  it('each plugin handles at least 2 prefixes', () => {
    expect(RYO_HIT_EFFECTS.prefixes.length).toBeGreaterThanOrEqual(2);
    expect(KYO_HIT_EFFECTS.prefixes.length).toBeGreaterThanOrEqual(2);
    expect(IORI_HIT_EFFECTS.prefixes.length).toBeGreaterThanOrEqual(2);
  });
});
