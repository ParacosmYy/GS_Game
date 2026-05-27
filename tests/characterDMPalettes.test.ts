/**
 * Character DM spark palette tests — verify character-specific colors are consistent
 */
import { describe, it, expect } from 'vitest';
import { getCharacterDMPalette, FEEDBACK_TIERS } from '../src/core/feedbackManifest.js';

describe('character DM spark palettes', () => {
  it('returns palettes for kyo (fire)', () => {
    const dm = getCharacterDMPalette('kyo', 'dm');
    const sdm = getCharacterDMPalette('kyo', 'sdm');
    const hsdm = getCharacterDMPalette('kyo', 'hsdm');
    expect(dm).not.toBeNull();
    expect(sdm).not.toBeNull();
    expect(hsdm).not.toBeNull();
    // Fire colors should have warm tones
    expect(dm!.some(c => c.includes('ff') && c.includes('44'))).toBe(true);
  });

  it('returns palettes for iori (purple)', () => {
    const dm = getCharacterDMPalette('iori', 'dm');
    const sdm = getCharacterDMPalette('iori', 'sdm');
    const hsdm = getCharacterDMPalette('iori', 'hsdm');
    expect(dm).not.toBeNull();
    expect(sdm).not.toBeNull();
    expect(hsdm).not.toBeNull();
    // Purple tones should be present
    expect(dm!.some(c => c.includes('ff') && c.includes('aa'))).toBe(true);
  });

  it('returns palettes for ryo (lightning)', () => {
    const dm = getCharacterDMPalette('ryo', 'dm');
    const sdm = getCharacterDMPalette('ryo', 'sdm');
    const hsdm = getCharacterDMPalette('ryo', 'hsdm');
    expect(dm).not.toBeNull();
    expect(sdm).not.toBeNull();
    expect(hsdm).not.toBeNull();
    // Blue tones for lightning
    expect(dm!.some(c => c.includes('88') || c.includes('ff'))).toBe(true);
  });

  it('returns null for unknown character', () => {
    expect(getCharacterDMPalette('unknown', 'dm')).toBeNull();
  });

  it('returns null for non-DM tiers', () => {
    expect(getCharacterDMPalette('kyo', 'light')).toBeNull();
    expect(getCharacterDMPalette('kyo', 'heavy')).toBeNull();
    expect(getCharacterDMPalette('kyo', 'special')).toBeNull();
  });

  it('HSDM palette has more colors than DM palette', () => {
    const kyoDm = getCharacterDMPalette('kyo', 'dm')!;
    const kyoHsdm = getCharacterDMPalette('kyo', 'hsdm')!;
    expect(kyoHsdm.length).toBeGreaterThanOrEqual(kyoDm.length);
  });

  it('feedback tiers DM/SDM/HSDM have correct relative intensities', () => {
    expect(FEEDBACK_TIERS.sdm.hitstop).toBeGreaterThan(FEEDBACK_TIERS.dm.hitstop);
    expect(FEEDBACK_TIERS.hsdm.hitstop).toBeGreaterThan(FEEDBACK_TIERS.sdm.hitstop);
    expect(FEEDBACK_TIERS.sdm.shakeIntensity).toBeGreaterThan(FEEDBACK_TIERS.dm.shakeIntensity);
    expect(FEEDBACK_TIERS.hsdm.shakeIntensity).toBeGreaterThan(FEEDBACK_TIERS.sdm.shakeIntensity);
    expect(FEEDBACK_TIERS.hsdm.sparkCount).toBeGreaterThan(FEEDBACK_TIERS.sdm.sparkCount);
  });
});
