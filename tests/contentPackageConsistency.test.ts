import { describe, it, expect } from 'vitest';
import {
  RYO_ATTACK_KEYS, getRyoFrameData, getRyoAttackFrameData,
  RYO_MOVE_LIST, RYO_WIN_QUOTES,
  RYO_HITBOX_KEYS, getRyoHitboxOffsets, RYO_ATTACK_FRAME_KEYS, getRyoAttackFrames,
  getRyoFeedbackTiers, getRyoFeedback,
  getRyoAnimations, getRyoAnimSequenceNames,
  RYO_CANCEL_PATHS, findCancelRoute,
} from '../src/content/characters/ryo/index.js';
import {
  KYO_ATTACK_KEYS, getKyoFrameData, getKyoAttackFrameData,
  KYO_MOVE_LIST, KYO_WIN_QUOTES,
  KYO_HITBOX_KEYS, getKyoHitboxOffsets, KYO_ATTACK_FRAME_KEYS, getKyoAttackFrames,
  getKyoFeedbackTiers, getKyoFeedback,
  KYO_ANIMATION_META, getKyoAnimationNames,
  KYO_CANCEL_PATHS,
  KYO_FEEDBACK_SUMMARY,
  KYO_PORTRAIT_META, getKyoPortraitMeta,
} from '../src/content/characters/kyo/index.js';
import {
  IORI_ATTACK_KEYS, getIoriFrameData, getIoriAttackFrameData,
  IORI_MOVE_LIST, IORI_WIN_QUOTES,
  IORI_HITBOX_KEYS, getIoriHitboxOffsets, IORI_ATTACK_FRAME_KEYS, getIoriAttackFrames,
  getIoriFeedbackTiers, getIoriFeedback,
  IORI_ANIMATION_META, getIoriAnimationNames,
  IORI_CANCEL_PATHS,
  IORI_FEEDBACK_SUMMARY,
  IORI_PORTRAIT_META, getIoriPortraitMeta,
} from '../src/content/characters/iori/index.js';

describe('Content Package Structure Consistency', () => {
  const chars = [
    { name: 'Ryo', attacks: RYO_ATTACK_KEYS, frameData: getRyoFrameData, attackFrames: getRyoAttackFrameData, moveList: RYO_MOVE_LIST, winQuotes: RYO_WIN_QUOTES, hitboxKeys: RYO_HITBOX_KEYS, hitboxFn: getRyoHitboxOffsets, atkFrameKeys: RYO_ATTACK_FRAME_KEYS, atkFrameFn: getRyoAttackFrames, feedbackTiers: getRyoFeedbackTiers, feedbackFn: getRyoFeedback, animFn: getRyoAnimations, animNamesFn: getRyoAnimSequenceNames, cancelPaths: RYO_CANCEL_PATHS },
    { name: 'Kyo', attacks: KYO_ATTACK_KEYS, frameData: getKyoFrameData, attackFrames: getKyoAttackFrameData, moveList: KYO_MOVE_LIST, winQuotes: KYO_WIN_QUOTES, hitboxKeys: KYO_HITBOX_KEYS, hitboxFn: getKyoHitboxOffsets, atkFrameKeys: KYO_ATTACK_FRAME_KEYS, atkFrameFn: getKyoAttackFrames, feedbackTiers: getKyoFeedbackTiers, feedbackFn: getKyoFeedback, animFn: () => KYO_ANIMATION_META, animNamesFn: getKyoAnimationNames, cancelPaths: KYO_CANCEL_PATHS },
    { name: 'Iori', attacks: IORI_ATTACK_KEYS, frameData: getIoriFrameData, attackFrames: getIoriAttackFrameData, moveList: IORI_MOVE_LIST, winQuotes: IORI_WIN_QUOTES, hitboxKeys: IORI_HITBOX_KEYS, hitboxFn: getIoriHitboxOffsets, atkFrameKeys: IORI_ATTACK_FRAME_KEYS, atkFrameFn: getIoriAttackFrames, feedbackTiers: getIoriFeedbackTiers, feedbackFn: getIoriFeedback, animFn: () => IORI_ANIMATION_META, animNamesFn: getIoriAnimationNames, cancelPaths: IORI_CANCEL_PATHS },
  ];

  it('all characters have non-empty attack keys', () => {
    for (const c of chars) {
      expect(c.attacks.length, `${c.name} should have attack keys`).toBeGreaterThan(0);
    }
  });

  it('all characters have frame data function', () => {
    for (const c of chars) {
      expect(typeof c.frameData, `${c.name} frameData`).toBe('function');
      const data = c.frameData('STAND_A');
      expect(data, `${c.name} STAND_A frame data`).toBeDefined();
    }
  });

  it('all characters have attack frame data function', () => {
    for (const c of chars) {
      expect(typeof c.attackFrames, `${c.name} attackFrames`).toBe('function');
    }
  });

  it('all characters have non-empty move list', () => {
    for (const c of chars) {
      expect(c.moveList.length, `${c.name} move list`).toBeGreaterThan(0);
    }
  });

  it('all characters have win quotes', () => {
    for (const c of chars) {
      expect(c.winQuotes.length, `${c.name} win quotes`).toBeGreaterThan(0);
    }
  });

  it('all characters have hitbox keys', () => {
    for (const c of chars) {
      expect(c.hitboxKeys.length, `${c.name} hitbox keys`).toBeGreaterThan(0);
    }
  });

  it('all characters have hitbox offset function', () => {
    for (const c of chars) {
      expect(typeof c.hitboxFn, `${c.name} hitbox function`).toBe('function');
    }
  });

  it('all characters have attack frame keys', () => {
    for (const c of chars) {
      expect(c.atkFrameKeys.length, `${c.name} attack frame keys`).toBeGreaterThan(0);
    }
  });

  it('all characters have feedback tier function', () => {
    for (const c of chars) {
      expect(typeof c.feedbackTiers, `${c.name} feedbackTiers`).toBe('function');
      expect(typeof c.feedbackFn, `${c.name} feedbackFn`).toBe('function');
    }
  });

  it('all characters have animation metadata', () => {
    for (const c of chars) {
      const meta = c.animFn();
      expect(meta, `${c.name} animation data should be defined`).toBeDefined();
      expect(Object.keys(meta).length, `${c.name} animation data`).toBeGreaterThan(0);
      const names = c.animNamesFn();
      expect(names.length, `${c.name} animation names`).toBeGreaterThan(0);
    }
  });

  it('all characters have cancel paths', () => {
    for (const c of chars) {
      expect(c.cancelPaths.length, `${c.name} cancel paths`).toBeGreaterThan(0);
    }
  });

  it('all characters have consistent barrel export types', () => {
    for (const c of chars) {
      // All key exports should be functions or arrays/objects
      expect(Array.isArray(c.attacks), `${c.name} attacks should be array`).toBe(true);
      expect(Array.isArray(c.moveList), `${c.name} moveList should be array`).toBe(true);
      expect(Array.isArray(c.winQuotes), `${c.name} winQuotes should be array`).toBe(true);
      expect(Array.isArray(c.hitboxKeys), `${c.name} hitboxKeys should be array`).toBe(true);
      expect(Array.isArray(c.atkFrameKeys), `${c.name} atkFrameKeys should be array`).toBe(true);
      expect(Array.isArray(c.cancelPaths), `${c.name} cancelPaths should be array`).toBe(true);
      expect(typeof c.animFn(), `${c.name} animFn should return object`).toBe('object');
    }
  });

  it('all characters have at least 5 types of attacks', () => {
    for (const c of chars) {
      // Should have at least STAND_A, STAND_B, STAND_C, STAND_D, CROUCH_A
      const hasPunch = c.attacks.some(k => k.includes('STAND_A') || k.includes('STAND_C'));
      const hasKick = c.attacks.some(k => k.includes('STAND_B') || k.includes('STAND_D'));
      const hasCrouch = c.attacks.some(k => k.includes('CROUCH'));
      expect(hasPunch, `${c.name} should have punches`).toBe(true);
      expect(hasKick, `${c.name} should have kicks`).toBe(true);
      expect(hasCrouch, `${c.name} should have crouch attacks`).toBe(true);
    }
  });
});

// ════════════════════════════════════════════════════════════════
// Cross-Character Feedback Summary Consistency
// ════════════════════════════════════════════════════════════════

describe('Cross-Character Feedback Consistency', () => {
  it('Kyo and Iori both have all 6 feedback tiers', () => {
    const TIERS = ['light', 'heavy', 'special', 'dm', 'sdm', 'hsdm'] as const;
    for (const tier of TIERS) {
      expect(KYO_FEEDBACK_SUMMARY[tier].length, `Kyo ${tier}`).toBeGreaterThan(0);
      expect(IORI_FEEDBACK_SUMMARY[tier].length, `Iori ${tier}`).toBeGreaterThan(0);
    }
  });

  it('Kyo and Iori share the same generic normals in light tier', () => {
    const kyoLight = KYO_FEEDBACK_SUMMARY.light;
    const ioriLight = IORI_FEEDBACK_SUMMARY.light;
    for (const key of ['STAND_A', 'CROUCH_A']) {
      expect(kyoLight).toContain(key);
      expect(ioriLight).toContain(key);
    }
  });

  it('Kyo and Iori have different special-tier entries', () => {
    const kyoSpecial = new Set(KYO_FEEDBACK_SUMMARY.special);
    const ioriSpecial = new Set(IORI_FEEDBACK_SUMMARY.special);
    // They should have different character-specific moves
    const overlap = [...kyoSpecial].filter(k => ioriSpecial.has(k));
    expect(overlap.length, 'no special-tier overlap').toBeLessThan(kyoSpecial.size);
  });

  it('no feedback tier overlap between Kyo and Iori DM tiers', () => {
    const kyoDm = new Set(KYO_FEEDBACK_SUMMARY.dm);
    const ioriDm = new Set(IORI_FEEDBACK_SUMMARY.dm);
    for (const k of kyoDm) {
      expect(ioriDm.has(k), `DM overlap: ${k}`).toBe(false);
    }
  });
});

// ════════════════════════════════════════════════════════════════
// Cross-Character Portrait Metadata Consistency
// ════════════════════════════════════════════════════════════════

describe('Cross-Character Portrait Consistency', () => {
  const SIZES = ['select', 'vs', 'hud', 'win'] as const;

  it('Kyo and Iori both have all 4 portrait sizes', () => {
    for (const size of SIZES) {
      expect(KYO_PORTRAIT_META[size], `Kyo ${size}`).toBeDefined();
      expect(IORI_PORTRAIT_META[size], `Iori ${size}`).toBeDefined();
    }
  });

  it('Kyo and Iori have different primary colors', () => {
    expect(KYO_PORTRAIT_META.select.primaryColor).not.toBe(IORI_PORTRAIT_META.select.primaryColor);
  });

  it('all portrait sizes have valid hex colors', () => {
    const hexPattern = /^#[0-9a-fA-F]{6}$/;
    for (const size of SIZES) {
      expect(KYO_PORTRAIT_META[size].primaryColor, `Kyo ${size} primaryColor`).toMatch(hexPattern);
      expect(IORI_PORTRAIT_META[size].primaryColor, `Iori ${size} primaryColor`).toMatch(hexPattern);
    }
  });

  it('getKyoPortraitMeta and getIoriPortraitMeta work for select size', () => {
    const kyoSelect = getKyoPortraitMeta('select');
    const ioriSelect = getIoriPortraitMeta('select');
    expect(kyoSelect.width).toBe(120);
    expect(ioriSelect.width).toBe(120);
  });
});
