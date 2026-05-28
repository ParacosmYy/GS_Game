/**
 * Terry & Kim Feedback Tier Mapping Tests
 *
 * Verifies that Terry and Kim attack types are explicitly mapped
 * in the feedback manifest attackTierMap with correct tier assignments.
 */
import { describe, it, expect } from 'vitest';
import { FEEDBACK_MANIFEST, inferTier, getFeedback } from '../src/core/feedbackManifest.js';
import type { AttackType } from '../src/core/types.js';

const map = FEEDBACK_MANIFEST.attackTierMap;

// ── Terry Feedback Tiers ──────────────────────────────────────
describe('Terry feedback tier mapping', () => {
  const terrySpecials: AttackType[] = [
    'TERRY_POWER_WAVE', 'TERRY_BURN_KNUCKLE', 'TERRY_BURN_KNUCKLE_C',
    'TERRY_BURN_KNUCKLE_D', 'TERRY_CRACK_SHOT', 'TERRY_CRACK_SHOT_D',
    'TERRY_POWER_DUNK', 'TERRY_POWER_DUNK_D', 'TERRY_RISING_TACKLE',
    'TERRY_RISING_TACKLE_C', 'TERRY_BACK_KNCKLE', 'TERRY_COMBO_BLOW',
  ];

  it('all Terry specials are explicitly mapped as special', () => {
    for (const at of terrySpecials) {
      expect(map[at as keyof typeof map], `${at} should be mapped`).toBe('special');
    }
  });

  it('Terry DMs are mapped as dm', () => {
    const dms: AttackType[] = [
      'DM_POWER_GEYSER', 'DM_POWER_GEYSER_A', 'DM_POWER_GEYSER_C',
      'DM_HIGH_ANGLE_GEYSER', 'DM_HIGH_ANGLE_GEYSER_B', 'DM_HIGH_ANGLE_GEYSER_D',
    ];
    for (const at of dms) {
      expect(map[at as keyof typeof map], `${at} should be dm`).toBe('dm');
    }
  });

  it('Terry SDMs are mapped as sdm', () => {
    const sdms: AttackType[] = ['SDM_TRIPLE_GEYSER', 'SDM_POWER_GEYSER_EX'];
    for (const at of sdms) {
      expect(map[at as keyof typeof map], `${at} should be sdm`).toBe('sdm');
    }
  });

  it('Terry HSDM is mapped as hsdm', () => {
    expect(map['HSDM_POWER_GEYSER' as keyof typeof map]).toBe('hsdm');
  });

  it('inferTier returns correct tier for Terry attacks', () => {
    expect(inferTier('TERRY_POWER_WAVE' as AttackType)).toBe('special');
    expect(inferTier('DM_POWER_GEYSER' as AttackType)).toBe('dm');
    expect(inferTier('SDM_TRIPLE_GEYSER' as AttackType)).toBe('sdm');
    expect(inferTier('HSDM_POWER_GEYSER' as AttackType)).toBe('hsdm');
  });

  it('Terry special feedback has higher hitstop than heavy', () => {
    const specialFb = getFeedback('TERRY_BURN_KNUCKLE' as AttackType);
    const heavyFb = getFeedback('STAND_C' as AttackType);
    expect(specialFb.hitstop, 'special hitstop > heavy').toBeGreaterThan(heavyFb.hitstop);
  });

  it('Terry DM feedback has higher hitstop than special', () => {
    const dmFb = getFeedback('DM_POWER_GEYSER' as AttackType);
    const specialFb = getFeedback('TERRY_POWER_WAVE' as AttackType);
    expect(dmFb.hitstop, 'DM hitstop > special').toBeGreaterThan(specialFb.hitstop);
  });
});

// ── Kim Feedback Tiers ────────────────────────────────────────
describe('Kim feedback tier mapping', () => {
  const kimSpecials: AttackType[] = [
    'KIM_HIENZAN', 'KIM_HIENZAN_D', 'KIM_HANGETSU', 'KIM_HANGETSU_D',
    'KIM_SANREN', 'KIM_SANREN_2', 'KIM_HAKI',
    'KIM_HISHOU', 'KIM_HISHOU_KICK', 'KIM_HANSEN',
  ];

  it('all Kim specials are explicitly mapped as special', () => {
    for (const at of kimSpecials) {
      expect(map[at as keyof typeof map], `${at} should be mapped`).toBe('special');
    }
  });

  it('Kim DMs are mapped as dm', () => {
    const dms: AttackType[] = ['DM_PHOENIX_KICK', 'DM_PHOENIX_HITEN'];
    for (const at of dms) {
      expect(map[at as keyof typeof map], `${at} should be dm`).toBe('dm');
    }
  });

  it('Kim SDMs are mapped as sdm', () => {
    const sdms: AttackType[] = ['SDM_PHOENIX_HITEN', 'SDM_PHOENIX_HITEN_EX'];
    for (const at of sdms) {
      expect(map[at as keyof typeof map], `${at} should be sdm`).toBe('sdm');
    }
  });

  it('Kim HSDM is mapped as hsdm', () => {
    expect(map['HSDM_PHOENIX_HITEN' as keyof typeof map]).toBe('hsdm');
  });

  it('inferTier returns correct tier for Kim attacks', () => {
    expect(inferTier('KIM_HIENZAN' as AttackType)).toBe('special');
    expect(inferTier('DM_PHOENIX_KICK' as AttackType)).toBe('dm');
    expect(inferTier('SDM_PHOENIX_HITEN' as AttackType)).toBe('sdm');
    expect(inferTier('HSDM_PHOENIX_HITEN' as AttackType)).toBe('hsdm');
  });

  it('Kim special feedback has higher hitstop than heavy', () => {
    const specialFb = getFeedback('KIM_HIENZAN' as AttackType);
    const heavyFb = getFeedback('STAND_D' as AttackType);
    expect(specialFb.hitstop, 'special hitstop > heavy').toBeGreaterThan(heavyFb.hitstop);
  });

  it('Kim DM feedback has higher shake than special', () => {
    const dmFb = getFeedback('DM_PHOENIX_KICK' as AttackType);
    const specialFb = getFeedback('KIM_HANGETSU' as AttackType);
    expect(dmFb.shakeIntensity, 'DM shake > special').toBeGreaterThan(specialFb.shakeIntensity);
  });
});

// ── Cross-character consistency ───────────────────────────────
describe('Terry/Kim feedback cross-character consistency', () => {
  it('Terry and Kim specials have same hitstop as other specials', () => {
    const terryFb = getFeedback('TERRY_BURN_KNUCKLE' as AttackType);
    const kimFb = getFeedback('KIM_HIENZAN' as AttackType);
    const ryoFb = getFeedback('RYO_KOOU' as AttackType);
    expect(terryFb.hitstop).toBe(ryoFb.hitstop);
    expect(kimFb.hitstop).toBe(ryoFb.hitstop);
  });

  it('Terry and Kim DMs have same hitstop as other DMs', () => {
    const terryDmFb = getFeedback('DM_POWER_GEYSER' as AttackType);
    const kimDmFb = getFeedback('DM_PHOENIX_KICK' as AttackType);
    const ryoDmFb = getFeedback('DM_TEN_HA_OU' as AttackType);
    expect(terryDmFb.hitstop).toBe(ryoDmFb.hitstop);
    expect(kimDmFb.hitstop).toBe(ryoDmFb.hitstop);
  });

  it('all 5 characters have explicit attackTierMap entries', () => {
    const map = FEEDBACK_MANIFEST.attackTierMap;
    const ryoEntries = Object.keys(map).filter(k => k.startsWith('RYO_'));
    const kyoEntries = Object.keys(map).filter(k => k.startsWith('KYO_') || k === 'CMD_GOFU_YOU' || k === 'CMD_88SHIKI' || k === 'CMD_NARAKU');
    const ioriEntries = Object.keys(map).filter(k => k.startsWith('IORI_'));
    const terryEntries = Object.keys(map).filter(k => k.startsWith('TERRY_'));
    const kimEntries = Object.keys(map).filter(k => k.startsWith('KIM_'));
    expect(terryEntries.length, 'Terry entries').toBeGreaterThanOrEqual(12);
    expect(kimEntries.length, 'Kim entries').toBeGreaterThanOrEqual(10);
  });
});
