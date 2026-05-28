/**
 * Character Content Package Metadata Regression Tests
 *
 * Validates animation metadata, feedback tier summaries, and portrait metadata
 * for Kyo, Iori, and Ryo content packages.
 */
import { describe, it, expect } from 'vitest';
import {
  KYO_ANIMATION_META, getKyoAnimationNames, getKyoAnimMeta,
  getKyoAttackAnimations, getKyoLoopAnimations,
  type AnimationMeta,
} from '../src/content/characters/kyo/animations/kyoAnimations.js';
import {
  KYO_FEEDBACK_SUMMARY, getKyoFeedbackTiers, getKyoFeedback,
} from '../src/content/characters/kyo/feedback/kyoFeedback.js';
import {
  KYO_PORTRAIT_META, getKyoPortraitMeta, getKyoAvailablePortraitSizes,
  type PortraitMeta,
} from '../src/content/characters/kyo/portraits/kyoPortraits.js';
import {
  IORI_PORTRAIT_META, getIoriPortraitMeta, getIoriAvailablePortraitSizes,
} from '../src/content/characters/iori/portraits/ioriPortraits.js';
import {
  RYO_PORTRAIT_META, getRyoPortraitMeta, getRyoAvailablePortraitSizes,
} from '../src/content/characters/ryo/portraits/ryoPortraits.js';

// ════════════════════════════════════════════════════════════════
// Kyo Animation Metadata
// ════════════════════════════════════════════════════════════════

describe('Kyo Animation Metadata', () => {
  const allEntries = Object.entries(KYO_ANIMATION_META);
  const VALID_TYPES: AnimationMeta['type'][] = ['loop', 'once', 'attack'];
  const VALID_TRANSITIONS: AnimationMeta['transition'][] = ['snap', 'ease_in', 'ease_out', 'blend'];

  it('has at least 40 animation entries', () => {
    expect(allEntries.length).toBeGreaterThanOrEqual(40);
  });

  it('all entries have valid structure', () => {
    for (const [key, meta] of allEntries) {
      expect(meta.name, `${key}.name`).toBe(key);
      expect(VALID_TYPES, `${key}.type`).toContain(meta.type);
      expect(meta.totalFrames, `${key}.totalFrames`).toBeGreaterThan(0);
      expect(meta.ticksPerFrame, `${key}.ticksPerFrame`).toBeGreaterThan(0);
      expect(typeof meta.loop, `${key}.loop`).toBe('boolean');
      expect(VALID_TRANSITIONS, `${key}.transition`).toContain(meta.transition);
      expect(meta.description.length, `${key}.description`).toBeGreaterThan(0);
    }
  });

  it('loop animations have loop=true', () => {
    const loops = allEntries.filter(([, m]) => m.type === 'loop');
    for (const [key, m] of loops) {
      expect(m.loop, `${key}.loop`).toBe(true);
    }
  });

  it('attack animations have loop=false', () => {
    const attacks = allEntries.filter(([, m]) => m.type === 'attack');
    for (const [key, m] of attacks) {
      expect(m.loop, `${key}.loop`).toBe(false);
    }
  });

  it('has key movement animations', () => {
    const names = getKyoAnimationNames();
    expect(names).toContain('idle');
    expect(names).toContain('walk_forward');
    expect(names).toContain('run');
    expect(names).toContain('jump_up');
    expect(names).toContain('crouch');
    expect(names).toContain('block');
  });

  it('has all standing normals', () => {
    const names = getKyoAnimationNames();
    expect(names).toContain('stand_a');
    expect(names).toContain('stand_b');
    expect(names).toContain('stand_c');
    expect(names).toContain('stand_d');
  });

  it('has key Kyo specials', () => {
    const names = getKyoAnimationNames();
    expect(names).toContain('kyo_oniyaki');
    expect(names).toContain('kyo_yamibarai');
    expect(names).toContain('kyo_aragami');
    expect(names).toContain('dm_orochinagi');
    expect(names).toContain('sdm_orochinagi');
  });

  it('getKyoAnimMeta returns correct entry', () => {
    const idle = getKyoAnimMeta('idle');
    expect(idle).toBeDefined();
    expect(idle!.type).toBe('loop');
  });

  it('getKyoAnimMeta returns undefined for unknown', () => {
    expect(getKyoAnimMeta('nonexistent')).toBeUndefined();
  });

  it('getKyoAttackAnimations returns only attacks', () => {
    const attacks = getKyoAttackAnimations();
    expect(attacks.length).toBeGreaterThan(0);
    for (const a of attacks) {
      expect(a.type).toBe('attack');
    }
  });

  it('getKyoLoopAnimations returns only loops', () => {
    const loops = getKyoLoopAnimations();
    expect(loops.length).toBeGreaterThan(0);
    for (const l of loops) {
      expect(l.loop).toBe(true);
    }
  });

  it('heavy attacks have more frames than light', () => {
    const standA = KYO_ANIMATION_META.stand_a;
    const standC = KYO_ANIMATION_META.stand_c;
    expect(standC.totalFrames).toBeGreaterThan(standA.totalFrames);
  });

  it('specials have more frames than normals', () => {
    const standC = KYO_ANIMATION_META.stand_c;
    const oniyaki = KYO_ANIMATION_META.kyo_oniyaki;
    expect(oniyaki.totalFrames).toBeGreaterThan(standC.totalFrames);
  });

  it('DM has more frames than specials', () => {
    const oniyaki = KYO_ANIMATION_META.kyo_oniyaki;
    const dm = KYO_ANIMATION_META.dm_orochinagi;
    expect(dm.totalFrames).toBeGreaterThan(oniyaki.totalFrames);
  });
});

// ════════════════════════════════════════════════════════════════
// Kyo Feedback Tier Summary
// ════════════════════════════════════════════════════════════════

describe('Kyo Feedback Tier Summary', () => {
  const TIERS = ['light', 'heavy', 'special', 'dm', 'sdm', 'hsdm'] as const;

  it('all 6 tiers have entries', () => {
    for (const tier of TIERS) {
      expect(KYO_FEEDBACK_SUMMARY[tier].length, `${tier} has entries`).toBeGreaterThan(0);
    }
  });

  it('no overlapping attack types between tiers', () => {
    const allTypes: string[] = [];
    for (const tier of TIERS) {
      allTypes.push(...KYO_FEEDBACK_SUMMARY[tier]);
    }
    expect(new Set(allTypes).size).toBe(allTypes.length);
  });

  it('light tier has stand_a and crouch_a', () => {
    expect(KYO_FEEDBACK_SUMMARY.light).toContain('STAND_A');
    expect(KYO_FEEDBACK_SUMMARY.light).toContain('CROUCH_A');
  });

  it('heavy tier has stand_c and stand_d', () => {
    expect(KYO_FEEDBACK_SUMMARY.heavy).toContain('STAND_C');
    expect(KYO_FEEDBACK_SUMMARY.heavy).toContain('STAND_D');
  });

  it('special tier has kyo moves', () => {
    expect(KYO_FEEDBACK_SUMMARY.special).toContain('KYO_ONIYAKI');
    expect(KYO_FEEDBACK_SUMMARY.special).toContain('KYO_YAMIBARAI');
  });

  it('dm tier has DM_OROCHINAGI', () => {
    expect(KYO_FEEDBACK_SUMMARY.dm).toContain('DM_OROCHINAGI');
  });

  it('hsdm tier has HSDM_OROCHINAGI', () => {
    expect(KYO_FEEDBACK_SUMMARY.hsdm).toContain('HSDM_OROCHINAGI');
  });

  it('getKyoFeedbackTiers covers attack keys', () => {
    const tiers = getKyoFeedbackTiers();
    expect(Object.keys(tiers).length).toBeGreaterThan(0);
  });

  it('getKyoFeedback returns valid params', () => {
    const fb = getKyoFeedback('STAND_A');
    expect(fb.tier).toBe('light');
    expect(fb.hitstop).toBeGreaterThan(0);
  });
});

// ════════════════════════════════════════════════════════════════
// Portrait Metadata — All 3 Characters
// ════════════════════════════════════════════════════════════════

function validatePortraitMeta(
  meta: Record<string, PortraitMeta>,
  charId: string,
  expectedColor: string,
) {
  const SIZES = ['select', 'vs', 'hud', 'win'];

  describe(`${charId} portrait metadata`, () => {
    it('has all 4 sizes', () => {
      for (const size of SIZES) {
        expect(meta[size], `${size}`).toBeDefined();
      }
    });

    it('all sizes have positive dimensions', () => {
      for (const size of SIZES) {
        expect(meta[size].width, `${size}.width`).toBeGreaterThan(0);
        expect(meta[size].height, `${size}.height`).toBeGreaterThan(0);
      }
    });

    it('all sizes have hex primaryColor', () => {
      for (const size of SIZES) {
        expect(meta[size].primaryColor, `${size}.primaryColor`).toMatch(/^#[0-9a-fA-F]{6}$/);
      }
    });

    it('all sizes have hex accentColor', () => {
      for (const size of SIZES) {
        expect(meta[size].accentColor, `${size}.accentColor`).toMatch(/^#[0-9a-fA-F]{6}$/);
      }
    });

    it('primaryColor matches character element', () => {
      const selectColor = meta.select.primaryColor.toUpperCase();
      expect(selectColor).toContain(expectedColor.toUpperCase());
    });

    it('hasPixelData is boolean for all sizes', () => {
      for (const size of SIZES) {
        expect(typeof meta[size].hasPixelData, `${size}.hasPixelData`).toBe('boolean');
      }
    });

    it('all sizes have descriptions', () => {
      for (const size of SIZES) {
        expect(meta[size].pose.length, `${size}.pose`).toBeGreaterThan(0);
        expect(meta[size].style.length, `${size}.style`).toBeGreaterThan(0);
      }
    });
  });
}

validatePortraitMeta(KYO_PORTRAIT_META, 'Kyo', 'FF6600');
validatePortraitMeta(IORI_PORTRAIT_META, 'Iori', '8800CC');
validatePortraitMeta(RYO_PORTRAIT_META, 'Ryo', 'DD6600');

describe('Portrait query functions', () => {
  it('getKyoPortraitMeta returns correct size', () => {
    const select = getKyoPortraitMeta('select');
    expect(select.width).toBe(120);
  });

  it('getIoriPortraitMeta returns correct size', () => {
    const select = getIoriPortraitMeta('select');
    expect(select.width).toBe(120);
  });

  it('getRyoPortraitMeta returns correct size', () => {
    const select = getRyoPortraitMeta('select');
    expect(select.width).toBe(120);
  });

  it('getKyoAvailablePortraitSizes returns sizes with data', () => {
    const sizes = getKyoAvailablePortraitSizes();
    expect(sizes.length).toBeGreaterThan(0);
  });

  it('getIoriAvailablePortraitSizes returns sizes with data', () => {
    const sizes = getIoriAvailablePortraitSizes();
    expect(sizes.length).toBeGreaterThan(0);
  });

  it('getRyoAvailablePortraitSizes returns sizes with data', () => {
    const sizes = getRyoAvailablePortraitSizes();
    expect(sizes.length).toBeGreaterThan(0);
  });

  it('characters have different primary colors', () => {
    expect(KYO_PORTRAIT_META.select.primaryColor).not.toBe(IORI_PORTRAIT_META.select.primaryColor);
    expect(KYO_PORTRAIT_META.select.primaryColor).not.toBe(RYO_PORTRAIT_META.select.primaryColor);
    expect(IORI_PORTRAIT_META.select.primaryColor).not.toBe(RYO_PORTRAIT_META.select.primaryColor);
  });

  it('Kyo vs Iori vs Ryo have distinct visual identities', () => {
    // Kyo: fire orange, Iori: dark purple, Ryo: earth orange-brown
    expect(KYO_PORTRAIT_META.select.primaryColor).toBe('#FF6600');
    expect(IORI_PORTRAIT_META.select.primaryColor).toBe('#8800CC');
    expect(RYO_PORTRAIT_META.select.primaryColor).toBe('#DD6600');
  });
});
