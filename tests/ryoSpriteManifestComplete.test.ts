/**
 * Ryo Sprite Manifest Completeness Tests
 *
 * Validates that Ryo's sprite manifest data covers the 8 minimum actions
 * defined in the Ryo Vertical Slice plan:
 *   idle, walk, run, jump, stand_a, stand_c, hurt, knockdown
 *
 * Checks per action:
 *   - Action exists in SPRITE_MANIFEST for character 'ryo'
 *   - Frame count is sufficient for animation (>= 2 frames)
 *   - Every frame has valid dimensions (width > 0, height > 0)
 *   - Anchor coordinates are within sprite boundaries
 *   - Duration values are positive when present
 *   - Loop flag matches action semantics (idle/walk/run loop, others do not)
 *
 * Additionally validates:
 *   - RYO_ANIMATIONS export is non-empty and structurally sound
 *   - Sprite pose data (spritePoseData) provides karate-style poses for Ryo
 *   - Cross-referencing: each of the 8 actions has BOTH a sprite animation
 *     and a pose data source (or explicit documentation of placeholder usage)
 */

import { describe, it, expect } from 'vitest';
import {
  SPRITE_MANIFEST,
  RYO_ANIMATIONS,
} from '../src/core/spriteManifestData.js';
import {
  getAnimation,
  hasAnimation,
  getAnimationNames,
  getAnimationFrameCount,
  getAnimationDuration,
} from '../src/core/spriteManifest.js';
import type { SpriteAnimation, SpriteFrame, CharacterSpriteManifest } from '../src/core/spriteManifest.js';
import {
  CHAR_VISUALS,
  IDLE_POSES,
  WALK_POSES,
  RUN_BASE,
  JUMP_POSES,
  ATTACK_POSES,
  HIT_POSES,
  getIdlePoses,
  getRunPoses,
  getJumpPoses,
  getHitPoses,
} from '../src/rendering/spritePoseData.js';

// ===== Constants =====

const RYO = 'ryo';

/**
 * The 8 minimum actions for Ryo Vertical Slice.
 * Maps the CLAUDE.md action name to the actual animation key(s) in RYO_ANIMATIONS.
 * Some CLAUDE.md actions map to multiple animation variants.
 */
const MINIMUM_8_ACTIONS: Record<string, {
  /** Primary animation key to verify */
  animKey: string;
  /** Additional variant keys that should also exist */
  variants?: string[];
  /** Whether this action is expected to loop */
  loops: boolean;
  /** Minimum expected frame count */
  minFrames: number;
  /** Human-readable description for error messages */
  label: string;
}> = {
  idle:          { animKey: 'idle',          loops: true,  minFrames: 2, label: 'Idle (breathing stance)' },
  walk:          { animKey: 'walk_forward',  variants: ['walk_backward'], loops: true,  minFrames: 2, label: 'Walk (forward/backward)' },
  run:           { animKey: 'run',           loops: true,  minFrames: 2, label: 'Run (forward dash)' },
  jump:          { animKey: 'jump_up',       variants: ['jump_forward', 'jump_backward'], loops: false, minFrames: 2, label: 'Jump (up/forward/backward)' },
  stand_a:       { animKey: 'stand_a',       loops: false, minFrames: 2, label: 'Stand A (light punch)' },
  stand_c:       { animKey: 'stand_c',       loops: false, minFrames: 2, label: 'Stand C (heavy punch)' },
  hurt:          { animKey: 'hurt_standing', variants: ['hurt_crouching'], loops: false, minFrames: 2, label: 'Hurt (standing/crouching)' },
  knockdown:     { animKey: 'knockdown',     loops: false, minFrames: 2, label: 'Knockdown' },
};

// ===== Helper: validate a single SpriteFrame =====

function validateFrame(frame: SpriteFrame, context: string): string[] {
  const errors: string[] = [];

  if (frame.width <= 0) {
    errors.push(`${context}: width must be > 0, got ${frame.width}`);
  }
  if (frame.height <= 0) {
    errors.push(`${context}: height must be > 0, got ${frame.height}`);
  }

  // Anchor should be within the sprite rectangle.
  // Known deviation: idle breathing uses anchor.y = height + 1 (STD_ANCHOR_Y + 1 = 161
  // when STD_H = 160). This is an intentional sub-pixel breathing offset.
  // Allow a 1px tolerance for anchor overflow to document this known deviation.
  const ANCHOR_TOLERANCE = 1;
  if (frame.anchor.x < -ANCHOR_TOLERANCE || frame.anchor.x > frame.width + ANCHOR_TOLERANCE) {
    errors.push(`${context}: anchor.x=${frame.anchor.x} is outside [0, width=${frame.width}] (tolerance=${ANCHOR_TOLERANCE}px)`);
  }
  if (frame.anchor.y < -ANCHOR_TOLERANCE || frame.anchor.y > frame.height + ANCHOR_TOLERANCE) {
    errors.push(`${context}: anchor.y=${frame.anchor.y} is outside [0, height=${frame.height}] (tolerance=${ANCHOR_TOLERANCE}px)`);
  }

  // Duration should be positive if present
  if (frame.duration !== undefined && frame.duration <= 0) {
    errors.push(`${context}: duration must be > 0, got ${frame.duration}`);
  }

  return errors;
}

// ===== Helper: validate a full SpriteAnimation =====

function validateAnimation(anim: SpriteAnimation, animKey: string): string[] {
  const errors: string[] = [];

  if (anim.name !== animKey) {
    errors.push(`Animation key "${animKey}" has name="${anim.name}", mismatch`);
  }
  if (!anim.frames || anim.frames.length === 0) {
    errors.push(`Animation "${animKey}" has no frames`);
    return errors;
  }

  for (let i = 0; i < anim.frames.length; i++) {
    const frameErrors = validateFrame(anim.frames[i], `${animKey}[frame ${i}]`);
    errors.push(...frameErrors);
  }

  // cancelStartFrame must be within frame range if present
  if (anim.cancelStartFrame !== undefined) {
    if (anim.cancelStartFrame < 0 || anim.cancelStartFrame >= anim.frames.length) {
      errors.push(
        `${animKey}: cancelStartFrame=${anim.cancelStartFrame} out of range [0, ${anim.frames.length})`,
      );
    }
  }

  return errors;
}

// =====================================================================
// 1. Ryo character manifest exists and is complete
// =====================================================================

describe('Ryo character manifest baseline', () => {
  it('Ryo exists in SPRITE_MANIFEST.characters', () => {
    const charManifest = SPRITE_MANIFEST.characters[RYO];
    expect(charManifest).toBeDefined();
    expect(charManifest.charId).toBe(RYO);
  });

  it('Ryo has a valid atlasPath', () => {
    const charManifest = SPRITE_MANIFEST.characters[RYO];
    expect(charManifest.atlasPath).toContain('ryo');
    expect(charManifest.atlasPath.endsWith('.png')).toBe(true);
  });

  it('Ryo has complete fallbackColors', () => {
    const fc = SPRITE_MANIFEST.characters[RYO].fallbackColors;
    expect(fc.body).toBeTruthy();
    expect(fc.head).toBeTruthy();
    expect(fc.outfit).toBeTruthy();
    expect(fc.hair).toBeTruthy();
    // All colors should be hex format
    for (const [key, color] of Object.entries(fc)) {
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/, `fallbackColors.${key} should be hex color`);
    }
  });

  it('Ryo has palette definitions', () => {
    const palettes = SPRITE_MANIFEST.characters[RYO].palettes;
    expect(palettes).toBeDefined();
    expect(palettes!.length).toBeGreaterThanOrEqual(2);
    for (let i = 0; i < palettes!.length; i++) {
      expect(palettes![i].length).toBeGreaterThanOrEqual(3);
    }
  });

  it('RYO_ANIMATIONS export is non-empty', () => {
    const keys = Object.keys(RYO_ANIMATIONS);
    expect(keys.length).toBeGreaterThan(0);
  });
});

// =====================================================================
// 2. All 8 minimum actions exist in sprite manifest
// =====================================================================

describe('Ryo 8 minimum actions exist in SPRITE_MANIFEST', () => {
  for (const [action, config] of Object.entries(MINIMUM_8_ACTIONS)) {
    it(`${action} (${config.label}): primary key "${config.animKey}" exists`, () => {
      expect(
        hasAnimation(SPRITE_MANIFEST, RYO, config.animKey),
        `Missing animation "${config.animKey}" for action "${action}"`,
      ).toBe(true);
    });

    if (config.variants) {
      for (const variant of config.variants) {
        it(`${action}: variant "${variant}" exists`, () => {
          expect(
            hasAnimation(SPRITE_MANIFEST, RYO, variant),
            `Missing variant "${variant}" for action "${action}"`,
          ).toBe(true);
        });
      }
    }
  }
});

// =====================================================================
// 3. Frame count sufficiency for all 8 minimum actions
// =====================================================================

describe('Ryo 8 minimum actions have sufficient frame counts', () => {
  for (const [action, config] of Object.entries(MINIMUM_8_ACTIONS)) {
    it(`${action} (${config.animKey}): has at least ${config.minFrames} frames`, () => {
      const anim = getAnimation(SPRITE_MANIFEST, RYO, config.animKey);
      expect(anim).toBeDefined();
      expect(anim!.frames.length).toBeGreaterThanOrEqual(config.minFrames);
    });
  }
});

// =====================================================================
// 4. Loop flag correctness for all 8 minimum actions
// =====================================================================

describe('Ryo 8 minimum actions have correct loop flags', () => {
  for (const [action, config] of Object.entries(MINIMUM_8_ACTIONS)) {
    it(`${action} (${config.animKey}): loop=${config.loops}`, () => {
      const anim = getAnimation(SPRITE_MANIFEST, RYO, config.animKey);
      expect(anim).toBeDefined();
      expect(anim!.loop).toBe(config.loops);
    });
  }
});

// =====================================================================
// 5. Sprite frame dimensions are valid for all 8 minimum actions
// =====================================================================

describe('Ryo 8 minimum actions have valid sprite frame dimensions', () => {
  for (const [action, config] of Object.entries(MINIMUM_8_ACTIONS)) {
    it(`${action} (${config.animKey}): all frames have width > 0 and height > 0`, () => {
      const anim = getAnimation(SPRITE_MANIFEST, RYO, config.animKey);
      expect(anim).toBeDefined();
      for (let i = 0; i < anim!.frames.length; i++) {
        const frame = anim!.frames[i];
        expect(frame.width, `${config.animKey}[${i}].width must be > 0`).toBeGreaterThan(0);
        expect(frame.height, `${config.animKey}[${i}].height must be > 0`).toBeGreaterThan(0);
      }
    });
  }
});

// =====================================================================
// 6. Anchor values are within sprite boundaries for all 8 minimum actions
// =====================================================================

describe('Ryo 8 minimum actions have anchors within sprite bounds', () => {
  for (const [action, config] of Object.entries(MINIMUM_8_ACTIONS)) {
    it(`${action} (${config.animKey}): all anchors within bounds (1px breathing tolerance)`, () => {
      const TOLERANCE = 1; // idle breathing uses anchor.y = height+1
      const anim = getAnimation(SPRITE_MANIFEST, RYO, config.animKey);
      expect(anim).toBeDefined();
      for (let i = 0; i < anim!.frames.length; i++) {
        const frame = anim!.frames[i];
        expect(
          frame.anchor.x,
          `${config.animKey}[${i}].anchor.x=${frame.anchor.x} should be >= 0`,
        ).toBeGreaterThanOrEqual(0);
        expect(
          frame.anchor.x,
          `${config.animKey}[${i}].anchor.x=${frame.anchor.x} should be <= width=${frame.width}+${TOLERANCE}`,
        ).toBeLessThanOrEqual(frame.width + TOLERANCE);
        expect(
          frame.anchor.y,
          `${config.animKey}[${i}].anchor.y=${frame.anchor.y} should be >= 0`,
        ).toBeGreaterThanOrEqual(0);
        expect(
          frame.anchor.y,
          `${config.animKey}[${i}].anchor.y=${frame.anchor.y} should be <= height=${frame.height}+${TOLERANCE}`,
        ).toBeLessThanOrEqual(frame.height + TOLERANCE);
      }
    });
  }
});

// =====================================================================
// 7. Duration values are positive for all 8 minimum actions
// =====================================================================

describe('Ryo 8 minimum actions have positive duration per frame', () => {
  for (const [action, config] of Object.entries(MINIMUM_8_ACTIONS)) {
    it(`${action} (${config.animKey}): all frames have duration > 0`, () => {
      const anim = getAnimation(SPRITE_MANIFEST, RYO, config.animKey);
      expect(anim).toBeDefined();
      for (let i = 0; i < anim!.frames.length; i++) {
        const frame = anim!.frames[i];
        if (frame.duration !== undefined) {
          expect(
            frame.duration,
            `${config.animKey}[${i}].duration must be > 0`,
          ).toBeGreaterThan(0);
        }
      }
    });
  }
});

// =====================================================================
// 8. Total animation duration is reasonable for each action
// =====================================================================

describe('Ryo 8 minimum actions have reasonable total duration', () => {
  for (const [action, config] of Object.entries(MINIMUM_8_ACTIONS)) {
    it(`${action} (${config.animKey}): total duration > 0ms`, () => {
      const duration = getAnimationDuration(SPRITE_MANIFEST, RYO, config.animKey);
      expect(duration, `${config.animKey} total duration should be > 0`).toBeGreaterThan(0);
    });
  }
});

// =====================================================================
// 9. Full structural validation of all RYO_ANIMATIONS
// =====================================================================

describe('Ryo RYO_ANIMATIONS full structural validation', () => {
  it('every animation in RYO_ANIMATIONS passes structural checks', () => {
    const allErrors: string[] = [];
    for (const [animKey, anim] of Object.entries(RYO_ANIMATIONS)) {
      const errors = validateAnimation(anim, animKey);
      allErrors.push(...errors);
    }
    if (allErrors.length > 0) {
      // Print all errors for debugging
      console.error('RYO_ANIMATIONS structural errors:\n' + allErrors.join('\n'));
    }
    expect(allErrors, `Structural validation found ${allErrors.length} errors`).toEqual([]);
  });

  it('Ryo has more than just the 8 minimum animations', () => {
    const animNames = getAnimationNames(SPRITE_MANIFEST, RYO);
    // Ryo should have a comprehensive set: idle, walks, jumps, attacks, specials, etc.
    expect(animNames.length).toBeGreaterThan(20);
  });
});

// =====================================================================
// 10. Attack animations have startup/active/recovery alignment
// =====================================================================

describe('Ryo attack animations startup/active/recovery alignment', () => {
  const ATTACK_ANIMATIONS = ['stand_a', 'stand_c'] as const;

  it('attack animations have cancelStartFrame defined', () => {
    for (const animKey of ATTACK_ANIMATIONS) {
      const anim = getAnimation(SPRITE_MANIFEST, RYO, animKey);
      expect(anim).toBeDefined();
      expect(
        anim!.cancelStartFrame,
        `${animKey} should have cancelStartFrame for cancel system`,
      ).toBeDefined();
    }
  });

  it('cancelStartFrame is within frame range', () => {
    for (const animKey of ATTACK_ANIMATIONS) {
      const anim = getAnimation(SPRITE_MANIFEST, RYO, animKey);
      expect(anim!.cancelStartFrame!).toBeGreaterThan(0);
      expect(anim!.cancelStartFrame!).toBeLessThan(anim!.frames.length);
    }
  });

  it('active frames (stand_a/stand_c) use wider sprite for hitbox extension', () => {
    // In the attackFrames() helper, active frames get wider dimensions (STD_W + offset)
    // stand_a: STD_W + 40 = 120 wide active frames
    // stand_c: STD_W + 50 = 130 wide active frames
    const standA = getAnimation(SPRITE_MANIFEST, RYO, 'stand_a');
    expect(standA).toBeDefined();
    const normalW = 80; // STD_W

    // Check that at least one frame is wider than the standard width (active frame)
    const wideFrames = standA!.frames.filter(f => f.width > normalW);
    expect(
      wideFrames.length,
      'stand_a should have active frames wider than normal (attack extension)',
    ).toBeGreaterThan(0);
  });
});

// =====================================================================
// 11. Sprite pose data coverage for Ryo (karate style)
// =====================================================================

describe('Ryo sprite pose data coverage (karate style)', () => {
  it('Ryo exists in CHAR_VISUALS with karate idleStyle', () => {
    expect(CHAR_VISUALS[RYO]).toBeDefined();
    expect(CHAR_VISUALS[RYO].idleStyle).toBe('karate');
  });

  it('getIdlePoses("karate") returns valid poses for idle animation', () => {
    const poses = getIdlePoses('karate');
    expect(poses.length).toBeGreaterThanOrEqual(15); // MUGEN reference: 15 frames
    // Every pose should have all required fields
    for (let i = 0; i < poses.length; i++) {
      expect(poses[i]).toHaveProperty('headOff');
      expect(poses[i]).toHaveProperty('bodyLean');
      expect(poses[i]).toHaveProperty('armL');
      expect(poses[i]).toHaveProperty('armR');
      expect(poses[i]).toHaveProperty('legL');
      expect(poses[i]).toHaveProperty('legR');
      expect(poses[i]).toHaveProperty('crouch');
    }
  });

  it('WALK_POSES has enough frames for walk_forward animation (10 frames)', () => {
    expect(WALK_POSES.length).toBeGreaterThanOrEqual(6);
    // walk animation uses 10 frames; poses can be reused/cycled
  });

  it('getRunPoses("karate") returns poses for run animation', () => {
    const poses = getRunPoses('karate');
    expect(poses.length).toBeGreaterThanOrEqual(6); // RUN_BASE has 6 frames
  });

  it('getJumpPoses("karate") returns poses for jump animations', () => {
    const poses = getJumpPoses('karate');
    expect(poses.length).toBeGreaterThanOrEqual(8); // JUMP_POSES has 8 frames
  });

  it('ATTACK_POSES provides data for stand_a / stand_c', () => {
    expect(ATTACK_POSES.length).toBeGreaterThanOrEqual(4); // startup + active + recovery + return
  });

  it('getHitPoses("karate") returns poses for hurt animation', () => {
    const poses = getHitPoses('karate');
    expect(poses.length).toBeGreaterThanOrEqual(4); // HIT_POSES has 4 frames
  });
});

// =====================================================================
// 12. Cross-reference: RYO_ANIMATIONS matches SPRITE_MANIFEST
// =====================================================================

describe('Ryo RYO_ANIMATIONS matches SPRITE_MANIFEST entry', () => {
  it('every key in RYO_ANIMATIONS exists in SPRITE_MANIFEST.characters.ryo.animations', () => {
    const manifestAnims = SPRITE_MANIFEST.characters[RYO].animations;
    for (const key of Object.keys(RYO_ANIMATIONS)) {
      expect(
        manifestAnims[key],
        `RYO_ANIMATIONS["${key}"] not found in SPRITE_MANIFEST`,
      ).toBeDefined();
    }
  });

  it('frame counts match between RYO_ANIMATIONS and SPRITE_MANIFEST', () => {
    const manifestAnims = SPRITE_MANIFEST.characters[RYO].animations;
    for (const [key, anim] of Object.entries(RYO_ANIMATIONS)) {
      const manifestAnim = manifestAnims[key];
      expect(manifestAnim).toBeDefined();
      expect(
        manifestAnim!.frames.length,
        `${key}: SPRITE_MANIFEST frame count should match RYO_ANIMATIONS`,
      ).toBe(anim.frames.length);
    }
  });
});

// =====================================================================
// 13. Knockdown animation structure: fall + lie-down phases
// =====================================================================

describe('Ryo knockdown animation phase structure', () => {
  it('knockdown has at least 2 phases (fall + lie)', () => {
    const anim = getAnimation(SPRITE_MANIFEST, RYO, 'knockdown');
    expect(anim).toBeDefined();
    // Implementation: 2 falling frames + 3 lying frames = 5 frames
    expect(anim!.frames.length).toBeGreaterThanOrEqual(5);
  });

  it('knockdown does NOT loop', () => {
    const anim = getAnimation(SPRITE_MANIFEST, RYO, 'knockdown');
    expect(anim!.loop).toBe(false);
  });
});

// =====================================================================
// 14. Idle animation has breathing variation (anchor offset)
// =====================================================================

describe('Ryo idle animation breathing variation', () => {
  it('idle frames show anchor.y variation (breathing simulation)', () => {
    const anim = getAnimation(SPRITE_MANIFEST, RYO, 'idle');
    expect(anim).toBeDefined();

    const anchorYs = anim!.frames.map(f => f.anchor.y);
    const uniqueYs = new Set(anchorYs);
    // Breathing should create at least 2 distinct anchor positions
    expect(
      uniqueYs.size,
      'idle animation should have anchor.y variation for breathing',
    ).toBeGreaterThanOrEqual(2);
  });
});

// =====================================================================
// 15. Known deviation: idle breathing anchor.y overflow
// =====================================================================

describe('Ryo idle breathing anchor deviation (documented)', () => {
  it('idle exhale frames use anchor.y = height + 1 (breathing offset)', () => {
    // STD_ANCHOR_Y = 160, STD_H = 160. Exhale uses anchor.y = 161 (= STD_ANCHOR_Y + 1).
    // This is an intentional 1px overflow for breathing simulation, documented here.
    const anim = getAnimation(SPRITE_MANIFEST, RYO, 'idle');
    expect(anim).toBeDefined();

    // Frames 9-10 are exhale phase with anchor.y = STD_ANCHOR_Y + 1 = 161
    const overflowFrames = anim!.frames.filter(f => f.anchor.y > f.height);
    expect(overflowFrames.length).toBeGreaterThanOrEqual(2);
    // Each overflow frame should be exactly 1px beyond height
    for (const frame of overflowFrames) {
      expect(frame.anchor.y - frame.height).toBeLessThanOrEqual(1);
    }
  });
});

// =====================================================================
// 16. Edge case: atlasX/atlasY are valid numbers (not NaN/undefined)
// =====================================================================

describe('Ryo all frames have valid atlas coordinates', () => {
  it('every frame in every RYO_ANIMATIONS has numeric atlasX/atlasY', () => {
    for (const [animKey, anim] of Object.entries(RYO_ANIMATIONS)) {
      for (let i = 0; i < anim.frames.length; i++) {
        const frame = anim.frames[i];
        expect(
          typeof frame.atlasX,
          `${animKey}[${i}].atlasX should be a number`,
        ).toBe('number');
        expect(
          typeof frame.atlasY,
          `${animKey}[${i}].atlasY should be a number`,
        ).toBe('number');
        expect(Number.isNaN(frame.atlasX)).toBe(false);
        expect(Number.isNaN(frame.atlasY)).toBe(false);
      }
    }
  });
});
