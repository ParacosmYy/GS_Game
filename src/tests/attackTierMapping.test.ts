/**
 * Attack Tier Mapping Tests
 *
 * Verifies that all characters with content packages have explicit attack tier
 * mappings in the feedback manifest, rather than relying on generic pattern matching.
 */
import { describe, it, expect } from 'vitest';
import { FEEDBACK_MANIFEST, inferTier } from '../core/feedbackManifest.js';
import type { FeedbackTier } from '../core/feedbackManifest.js';

const { attackTierMap } = FEEDBACK_MANIFEST;

// Characters with content packages that should have explicit tier mappings
const CHARACTER_SPECIALS: Record<string, string[]> = {
  yuri: [
    'YURI_KO_OU_KEN', 'YURI_HAOH_SHO_KO_KEN', 'YURI_CHOU_UPPER',
    'YURI_HYAKU_RETSU_BINTA', 'YURI_HIEN_HOU_OU_KYAKU',
    'YURI_HISHOU_KUURETSU_ZAN', 'YURI_RAI_KEN',
    'DM_YURI_HAOH_SHO_KO_KEN', 'DM_YURI_HIEN_HOU_OU_KYAKU',
    'SDM_YURI_HAOH_SHO_KO_KEN', 'SDM_YURI_HIEN_HOU_OU_KYAKU',
    'HSDM_YURI_HISHOU_KUURETSU_ZAN',
  ],
  heidern: [
    'HEIDERN_STORM_BRINGER', 'HEIDERN_MOON_SLASHER', 'HEIDERN_NECK_ROLLER',
    'HEIDERN_CROSS_CUTTER', 'HEIDERN_KILLING_BRING', 'HEIDERN_ASSASSIN_STRIKE',
    'DM_HEIDERN_END', 'SDM_HEIDERN_END', 'DM_HEIDERN_EXECUTE',
  ],
  benimaru: [
    'BENIMARU_RAIJINKEN', 'BENIMARU_RAIJINKEN_C', 'BENIMARU_SUPER_INAZUMA',
    'BENIMARU_BENIMARU_COLLIDER', 'BENIMARU_SHINKICK', 'BENIMARU_FLYING_DRILL',
    'BENIMARU_IAI_GERI', 'BENIMARU_HANDOU_SANDAN',
    'DM_BENIMARU_RAIJINKEN', 'SDM_BENIMARU_RAIJINKEN', 'DM_BENIMARU_GENEI_HURRICANE',
  ],
  shermie: [
    'SHERMIE_SHOOT', 'SHERMIE_SHOOT_C', 'SHERMIE_CARNIVAL', 'SHERMIE_AXLE_SPIN',
    'SHERMIE_SPIRAL', 'SHERMIE_SPIRAL_C', 'SHERMIE_SUPLEX', 'SHERMIE_WHIP', 'SHERMIE_WHIP_C',
    'DM_SHERMIE_CARNIVAL', 'SDM_SHERMIE_CARNIVAL', 'DM_SHERMIE_FLASH', 'SDM_SHERMIE_FLASH',
  ],
  yamazaki: [
    'YAMAZAKI_BAIKAI', 'YAMAZAKI_HEBI_TSUKAI', 'YAMAZAKI_SANDAN',
    'YAMAZAKI_SADO', 'YAMAZAKI_GUILLOTINE', 'YAMAZAKI_DRILL', 'YAMAZAKI_YAKIUCHI',
    'DM_YAMAZAKI_GUILLOTINE', 'SDM_YAMAZAKI_GUILLOTINE', 'DM_YAMAZAKI_DRILL',
  ],
  vice: [
    'VICE_MAYHEM', 'VICE_MAYHEM_D', 'VICE_BLACKEND', 'VICE_OUTRAGE',
    'VICE_DECIDE', 'VICE_GORE_FEST', 'VICE_NEGATIVE_STALK',
    'DM_VICE_NEGATIVE_OWNER', 'SDM_VICE_NEGATIVE_OWNER', 'DM_VICE_WITHERING_SURFACE',
  ],
  athena: [
    'ATHENA_PSYCHO_BALL', 'ATHENA_PSYCHO_SWORD', 'ATHENA_PSYCHO_REFLECT',
    'ATHENA_PHOENIX_ARROW', 'ATHENA_TELEPORT', 'ATHENA_SUPER_PSYCHO_THROUGH',
    'DM_ATHENA_SHINING_CRYSTAL_BIT', 'SDM_ATHENA_SHINING_CRYSTAL_BIT', 'DM_ATHENA_PHOENIX_FANG_ARROW',
  ],
};

describe('Attack Tier Mapping — 7 New Characters', () => {
  // Verify each character's specials have explicit tier mappings
  for (const [char, attacks] of Object.entries(CHARACTER_SPECIALS)) {
    describe(`${char} attack tiers`, () => {
      for (const attack of attacks) {
        it(`${attack} has explicit tier mapping`, () => {
          const tier = attackTierMap[attack as keyof typeof attackTierMap];
          expect(tier).toBeDefined();
          expect(['special', 'dm', 'sdm', 'hsdm']).toContain(tier);
        });
      }
    });
  }

  it('all specials are mapped to special tier', () => {
    const allSpecials = Object.entries(CHARACTER_SPECIALS)
      .flatMap(([, attacks]) => attacks)
      .filter(a => !a.startsWith('DM_') && !a.startsWith('SDM_') && !a.startsWith('HSDM_'));

    for (const attack of allSpecials) {
      const tier = attackTierMap[attack as keyof typeof attackTierMap];
      expect(tier).toBe('special');
    }
  });

  it('all DMs are mapped to dm tier', () => {
    const allDMs = Object.entries(CHARACTER_SPECIALS)
      .flatMap(([, attacks]) => attacks)
      .filter(a => a.startsWith('DM_') && !a.startsWith('SDM_'));

    for (const attack of allDMs) {
      const tier = attackTierMap[attack as keyof typeof attackTierMap];
      expect(tier).toBe('dm');
    }
  });

  it('all SDMs are mapped to sdm tier', () => {
    const allSDMs = Object.entries(CHARACTER_SPECIALS)
      .flatMap(([, attacks]) => attacks)
      .filter(a => a.startsWith('SDM_'));

    for (const attack of allSDMs) {
      const tier = attackTierMap[attack as keyof typeof attackTierMap];
      expect(tier).toBe('sdm');
    }
  });

  it('HSDMs are mapped to hsdm tier', () => {
    const hsdms = Object.entries(CHARACTER_SPECIALS)
      .flatMap(([, attacks]) => attacks)
      .filter(a => a.startsWith('HSDM_'));

    for (const attack of hsdms) {
      const tier = attackTierMap[attack as keyof typeof attackTierMap];
      expect(tier).toBe('hsdm');
    }
  });

  it('normals are mapped to light/heavy tiers', () => {
    const normals = ['STAND_A', 'STAND_B', 'CLOSE_A', 'CROUCH_A', 'CROUCH_B', 'JUMP_A', 'JUMP_B'];
    const heavies = ['STAND_C', 'STAND_D', 'CLOSE_C', 'CLOSE_D', 'CROUCH_C', 'CROUCH_D', 'JUMP_C', 'JUMP_D'];

    for (const n of normals) {
      const tier = attackTierMap[n as keyof typeof attackTierMap];
      expect(tier).toBe('light');
    }
    for (const h of heavies) {
      const tier = attackTierMap[h as keyof typeof attackTierMap];
      expect(tier).toBe('heavy');
    }
  });

  it('total explicit mappings >= 100', () => {
    const count = Object.keys(attackTierMap).length;
    expect(count).toBeGreaterThanOrEqual(100);
  });

  it('each tier has entries', () => {
    const tiers: FeedbackTier[] = ['light', 'heavy', 'special', 'dm', 'sdm', 'hsdm'];
    for (const tier of tiers) {
      const entries = Object.values(attackTierMap).filter(t => t === tier);
      expect(entries.length, `${tier} tier should have entries`).toBeGreaterThan(0);
    }
  });
});
