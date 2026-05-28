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
} from '../src/content/characters/kyo/index.js';
import {
  IORI_ATTACK_KEYS, getIoriFrameData, getIoriAttackFrameData,
  IORI_MOVE_LIST, IORI_WIN_QUOTES,
  IORI_HITBOX_KEYS, getIoriHitboxOffsets, IORI_ATTACK_FRAME_KEYS, getIoriAttackFrames,
  getIoriFeedbackTiers, getIoriFeedback,
  IORI_ANIMATION_META, getIoriAnimationNames,
  IORI_CANCEL_PATHS,
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
