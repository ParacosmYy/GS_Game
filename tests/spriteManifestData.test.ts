/**
 * Sprite Manifest Data Tests
 *
 * Validates SPRITE_MANIFEST and RYO_ANIMATIONS from src/core/spriteManifestData.ts.
 * Checks: manifest version, Ryo animation structure, frame integrity.
 */
import { describe, it, expect } from 'vitest';
import { SPRITE_MANIFEST, RYO_ANIMATIONS } from '../src/core/spriteManifestData.js';
import type { SpriteAnimation, SpriteFrame } from '../src/core/spriteManifest.js';

// ===== SPRITE_MANIFEST Structure =====

describe('SPRITE_MANIFEST structure', () => {
  it('has version 1', () => {
    expect(SPRITE_MANIFEST.version).toBe(1);
  });

  it('has characters object', () => {
    expect(SPRITE_MANIFEST.characters).toBeDefined();
    expect(typeof SPRITE_MANIFEST.characters).toBe('object');
  });
});

// ===== RYO_ANIMATIONS =====

describe('RYO_ANIMATIONS', () => {
  const animNames = Object.keys(RYO_ANIMATIONS);

  it('is non-empty', () => {
    expect(animNames.length).toBeGreaterThan(0);
  });

  it('has idle animation', () => {
    expect(RYO_ANIMATIONS.idle).toBeDefined();
    expect(RYO_ANIMATIONS.idle.name).toBe('idle');
    expect(RYO_ANIMATIONS.idle.loop).toBe(true);
  });

  it('has walk_forward animation', () => {
    expect(RYO_ANIMATIONS.walk_forward).toBeDefined();
  });

  it('has stand_a animation', () => {
    expect(RYO_ANIMATIONS.stand_a).toBeDefined();
  });

  it('has stand_c animation', () => {
    expect(RYO_ANIMATIONS.stand_c).toBeDefined();
  });

  it('has crouch_a animation', () => {
    expect(RYO_ANIMATIONS.crouch_a).toBeDefined();
  });

  it('has hitstun animation', () => {
    expect(RYO_ANIMATIONS.hitstun).toBeDefined();
  });

  it('has knockdown animation', () => {
    expect(RYO_ANIMATIONS.knockdown).toBeDefined();
  });

  // Validate all animations
  for (const [animName, anim] of Object.entries(RYO_ANIMATIONS)) {
    describe(`RYO.${animName}`, () => {
      it('has valid name', () => {
        expect(anim.name).toBe(animName);
      });

      it('has frames', () => {
        expect(anim.frames.length).toBeGreaterThan(0);
      });

      it('each frame has required fields', () => {
        for (let i = 0; i < anim.frames.length; i++) {
          const f: SpriteFrame = anim.frames[i];
          expect(f.atlasX, `${animName}[${i}].atlasX`).toBeGreaterThanOrEqual(0);
          expect(f.atlasY, `${animName}[${i}].atlasY`).toBeGreaterThanOrEqual(0);
          expect(f.width, `${animName}[${i}].width`).toBeGreaterThan(0);
          expect(f.height, `${animName}[${i}].height`).toBeGreaterThan(0);
          expect(f.anchor, `${animName}[${i}].anchor`).toBeDefined();
          expect(f.anchor.x, `${animName}[${i}].anchor.x`).toBeGreaterThan(0);
          expect(f.anchor.y, `${animName}[${i}].anchor.y`).toBeGreaterThan(0);
        }
      });

      it('loop field is boolean', () => {
        expect(typeof anim.loop).toBe('boolean');
      });
    });
  }

  it('idle has >= 4 frames', () => {
    expect(RYO_ANIMATIONS.idle.frames.length).toBeGreaterThanOrEqual(4);
  });

  it('stand_a has >= 3 frames (startup+active+recovery)', () => {
    expect(RYO_ANIMATIONS.stand_a.frames.length).toBeGreaterThanOrEqual(3);
  });

  it('attack animations are non-looping', () => {
    const attackNames = ['stand_a', 'stand_b', 'stand_c', 'stand_d',
      'crouch_a', 'crouch_b', 'crouch_c', 'crouch_d'];
    for (const name of attackNames) {
      if (RYO_ANIMATIONS[name]) {
        expect(RYO_ANIMATIONS[name].loop, `${name}.loop`).toBe(false);
      }
    }
  });

  it('movement animations are looping', () => {
    const moveNames = ['idle', 'walk_forward', 'walk_backward'];
    for (const name of moveNames) {
      if (RYO_ANIMATIONS[name]) {
        expect(RYO_ANIMATIONS[name].loop, `${name}.loop`).toBe(true);
      }
    }
  });
});
