/**
 * Walk Animation Frame-Metadata Consistency Regression Test
 *
 * Verifies that walk_forward and walk_backward pixel frame counts
 * match the animation metadata totalFrames for all 3 characters.
 * Also verifies each walk frame has valid pixel data.
 */
import { describe, it, expect } from 'vitest';

describe('Walk animation frame-metadata consistency', () => {
  it('Ryo walk_forward: pixel frames match metadata', async () => {
    const { RYO_WALK_FORWARD_FRAMES } = await import('../src/rendering/sprites/ryo/ryoWalkFrames.js');
    const { RYO_ANIMATION_META } = await import('../src/content/characters/ryo/animations/ryoAnimations.js');
    expect(RYO_WALK_FORWARD_FRAMES.length).toBe(RYO_ANIMATION_META.walk_forward.totalFrames);
    for (let i = 0; i < RYO_WALK_FORWARD_FRAMES.length; i++) {
      const frame = RYO_WALK_FORWARD_FRAMES[i];
      expect(frame.pixels.length).toBeGreaterThan(0);
      expect(frame.width).toBeGreaterThan(0);
      expect(frame.height).toBeGreaterThan(0);
    }
  });

  it('Ryo walk_backward: pixel frames match metadata', async () => {
    const { RYO_WALK_BACKWARD_FRAMES } = await import('../src/rendering/sprites/ryo/ryoWalkFrames.js');
    const { RYO_ANIMATION_META } = await import('../src/content/characters/ryo/animations/ryoAnimations.js');
    expect(RYO_WALK_BACKWARD_FRAMES.length).toBe(RYO_ANIMATION_META.walk_backward.totalFrames);
  });

  it('Kyo walk_forward: pixel frames match metadata', async () => {
    const { KYO_WALK_FORWARD_FRAMES } = await import('../src/rendering/sprites/kyo/kyoWalkFrames.js');
    const { KYO_ANIMATION_META } = await import('../src/content/characters/kyo/animations/kyoAnimations.js');
    expect(KYO_WALK_FORWARD_FRAMES.length).toBe(KYO_ANIMATION_META.walk_forward.totalFrames);
    for (let i = 0; i < KYO_WALK_FORWARD_FRAMES.length; i++) {
      const frame = KYO_WALK_FORWARD_FRAMES[i];
      expect(frame.pixels.length).toBeGreaterThan(0);
      expect(frame.width).toBeGreaterThan(0);
      expect(frame.height).toBeGreaterThan(0);
    }
  });

  it('Kyo walk_backward: pixel frames match metadata', async () => {
    const { KYO_WALK_BACKWARD_FRAMES } = await import('../src/rendering/sprites/kyo/kyoWalkFrames.js');
    const { KYO_ANIMATION_META } = await import('../src/content/characters/kyo/animations/kyoAnimations.js');
    expect(KYO_WALK_BACKWARD_FRAMES.length).toBe(KYO_ANIMATION_META.walk_backward.totalFrames);
  });

  it('Iori walk_forward: pixel frames match metadata', async () => {
    const { IORI_WALK_FORWARD_FRAMES } = await import('../src/rendering/sprites/iori/ioriWalkFrames.js');
    const { IORI_ANIMATION_META } = await import('../src/content/characters/iori/animations/ioriAnimations.js');
    expect(IORI_WALK_FORWARD_FRAMES.length).toBe(IORI_ANIMATION_META.walk_forward.totalFrames);
    for (let i = 0; i < IORI_WALK_FORWARD_FRAMES.length; i++) {
      const frame = IORI_WALK_FORWARD_FRAMES[i];
      expect(frame.pixels.length).toBeGreaterThan(0);
      expect(frame.width).toBeGreaterThan(0);
      expect(frame.height).toBeGreaterThan(0);
    }
  });

  it('Iori walk_backward: pixel frames match metadata', async () => {
    const { IORI_WALK_BACKWARD_FRAMES } = await import('../src/rendering/sprites/iori/ioriWalkFrames.js');
    const { IORI_ANIMATION_META } = await import('../src/content/characters/iori/animations/ioriAnimations.js');
    expect(IORI_WALK_BACKWARD_FRAMES.length).toBe(IORI_ANIMATION_META.walk_backward.totalFrames);
  });

  it('all 3 characters have identical walk_forward frame counts', async () => {
    const { RYO_WALK_FORWARD_FRAMES } = await import('../src/rendering/sprites/ryo/ryoWalkFrames.js');
    const { KYO_WALK_FORWARD_FRAMES } = await import('../src/rendering/sprites/kyo/kyoWalkFrames.js');
    const { IORI_WALK_FORWARD_FRAMES } = await import('../src/rendering/sprites/iori/ioriWalkFrames.js');
    expect(RYO_WALK_FORWARD_FRAMES.length).toBe(KYO_WALK_FORWARD_FRAMES.length);
    expect(KYO_WALK_FORWARD_FRAMES.length).toBe(IORI_WALK_FORWARD_FRAMES.length);
  });

  it('all 3 characters have identical walk_backward frame counts', async () => {
    const { RYO_WALK_BACKWARD_FRAMES } = await import('../src/rendering/sprites/ryo/ryoWalkFrames.js');
    const { KYO_WALK_BACKWARD_FRAMES } = await import('../src/rendering/sprites/kyo/kyoWalkFrames.js');
    const { IORI_WALK_BACKWARD_FRAMES } = await import('../src/rendering/sprites/iori/ioriWalkFrames.js');
    expect(RYO_WALK_BACKWARD_FRAMES.length).toBe(KYO_WALK_BACKWARD_FRAMES.length);
    expect(KYO_WALK_BACKWARD_FRAMES.length).toBe(IORI_WALK_BACKWARD_FRAMES.length);
  });
});
