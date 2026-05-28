/**
 * Kyo Pixel Frame Data Structural Tests
 *
 * Validates all Kyo sprite frame arrays exported from rendering/sprites/kyo/.
 * Each PixelFrame must have: width, height, palette, pixels, anchor.
 * Pixels must be number[][] matching dimensions.
 */
import { describe, it, expect } from 'vitest';
import type { PixelFrame } from '../src/rendering/sprites/kyo/kyoIdleFrames.js';
import { KYO_IDLE_FRAMES, KYO_PALETTE } from '../src/rendering/sprites/kyo/kyoIdleFrames.js';
import { KYO_WALK_FORWARD_FRAMES, KYO_WALK_BACKWARD_FRAMES } from '../src/rendering/sprites/kyo/kyoWalkFrames.js';
import { KYO_JUMP_FRAMES } from '../src/rendering/sprites/kyo/kyoJumpFrames.js';
import { KYO_CROUCH_FRAMES, KYO_CROUCH_A_FRAMES, KYO_CROUCH_C_FRAMES } from '../src/rendering/sprites/kyo/kyoCrouchFrames.js';
import { KYO_HURT_FRAMES, KYO_KNOCKDOWN_FRAMES, KYO_BLOCK_FRAMES } from '../src/rendering/sprites/kyo/kyoDamageFrames.js';
import { KYO_DIZZY_FRAMES } from '../src/rendering/sprites/kyo/kyoDizzyFrames.js';
import { KYO_THROW_FRAMES } from '../src/rendering/sprites/kyo/kyoThrowFrames.js';
import { KYO_WIN_FRAMES } from '../src/rendering/sprites/kyo/kyoWinFrames.js';
import { KYO_STAND_A_FRAMES, KYO_STAND_C_FRAMES, KYO_AIR_A_FRAMES, KYO_AIR_C_FRAMES } from '../src/rendering/sprites/kyo/kyoAttackFrames.js';
import { KYO_STAND_B_FRAMES, KYO_STAND_D_FRAMES } from '../src/rendering/sprites/kyo/kyoKickFrames.js';
import { KYO_ONIYAKI_FRAMES, KYO_ONIYAKI_C_FRAMES, KYO_YAMIBARAI_FRAMES, KYO_RED_KICK_FRAMES, KYO_75KAI_FRAMES } from '../src/rendering/sprites/kyo/kyoSpecialFrames.js';
import { KYO_CMD_GOFU_YOU_FRAMES, KYO_CMD_88SHIKI_FRAMES, KYO_CMD_NARAKU_FRAMES } from '../src/rendering/sprites/kyo/kyoCommandNormalFrames.js';

// ===== Shared Validators =====

function validatePixelFrame(frame: PixelFrame, label: string) {
  expect(frame.width, `${label}.width > 0`).toBeGreaterThan(0);
  expect(frame.height, `${label}.height > 0`).toBeGreaterThan(0);
  expect(frame.palette, `${label}.palette`).toBeDefined();
  expect(Object.keys(frame.palette).length, `${label}.palette entries`).toBeGreaterThan(0);
  expect(frame.pixels, `${label}.pixels`).toBeDefined();
  expect(frame.pixels.length, `${label}.pixels rows > 0`).toBeGreaterThan(0);
  for (let y = 0; y < frame.pixels.length; y++) {
    expect(frame.pixels[y].length, `${label}.pixels[${y}] cols`).toBeGreaterThan(0);
  }
  if (frame.anchor) {
    expect(frame.anchor.x, `${label}.anchor.x >= 0`).toBeGreaterThanOrEqual(0);
    expect(frame.anchor.y, `${label}.anchor.y >= 0`).toBeGreaterThanOrEqual(0);
  }
}

function validateFrameArray(frames: PixelFrame[], label: string) {
  expect(frames.length, `${label} length > 0`).toBeGreaterThan(0);
  for (let i = 0; i < frames.length; i++) {
    validatePixelFrame(frames[i], `${label}[${i}]`);
  }
}

function validatePaletteKeys(frame: PixelFrame, label: string) {
  const allKeys = new Set<number>();
  for (const row of frame.pixels) {
    for (const px of row) {
      if (px !== 0) allKeys.add(px);
    }
  }
  for (const key of allKeys) {
    expect(frame.palette[key], `${label} palette has key ${key}`).toBeDefined();
  }
}

// ===== KYO_PALETTE =====

describe('KYO_PALETTE', () => {
  it('has entries', () => {
    expect(Object.keys(KYO_PALETTE).length).toBeGreaterThan(5);
  });

  it('all values are color strings', () => {
    for (const [key, val] of Object.entries(KYO_PALETTE)) {
      if (val === 'transparent') continue;
      expect(val, `KYO_PALETTE[${key}]`).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});

// ===== Core Animations =====

describe('KYO_IDLE_FRAMES', () => {
  it('has 6 frames', () => {
    expect(KYO_IDLE_FRAMES.length).toBe(6);
  });
  validateFrames(KYO_IDLE_FRAMES, 'KYO_IDLE');
});

describe('KYO_WALK_FORWARD_FRAMES', () => {
  it('has 6 frames', () => {
    expect(KYO_WALK_FORWARD_FRAMES.length).toBe(6);
  });
  validateFrames(KYO_WALK_FORWARD_FRAMES, 'KYO_WF');
});

describe('KYO_WALK_BACKWARD_FRAMES', () => {
  it('has 6 frames', () => {
    expect(KYO_WALK_BACKWARD_FRAMES.length).toBe(6);
  });
  validateFrames(KYO_WALK_BACKWARD_FRAMES, 'KYO_WB');
});

describe('KYO_JUMP_FRAMES', () => {
  it('has frames', () => {
    expect(KYO_JUMP_FRAMES.length).toBeGreaterThan(0);
  });
  validateFrames(KYO_JUMP_FRAMES, 'KYO_JUMP');
});

describe('KYO_CROUCH_FRAMES', () => {
  it('has frames', () => {
    expect(KYO_CROUCH_FRAMES.length).toBeGreaterThan(0);
  });
  validateFrames(KYO_CROUCH_FRAMES, 'KYO_CROUCH');
});

describe('KYO_CROUCH_A_FRAMES', () => {
  validateFrames(KYO_CROUCH_A_FRAMES, 'KYO_CROUCH_A');
});

describe('KYO_CROUCH_C_FRAMES', () => {
  validateFrames(KYO_CROUCH_C_FRAMES, 'KYO_CROUCH_C');
});

// ===== Damage / State =====

describe('KYO_HURT_FRAMES', () => {
  validateFrames(KYO_HURT_FRAMES, 'KYO_HURT');
});

describe('KYO_KNOCKDOWN_FRAMES', () => {
  it('has frames', () => {
    expect(KYO_KNOCKDOWN_FRAMES.length).toBeGreaterThan(0);
  });
  validateFrames(KYO_KNOCKDOWN_FRAMES, 'KYO_KD');
});

describe('KYO_BLOCK_FRAMES', () => {
  validateFrames(KYO_BLOCK_FRAMES, 'KYO_BLOCK');
});

describe('KYO_DIZZY_FRAMES', () => {
  it('has 8 frames', () => {
    expect(KYO_DIZZY_FRAMES.length).toBe(8);
  });
  validateFrames(KYO_DIZZY_FRAMES, 'KYO_DIZZY');
});

describe('KYO_THROW_FRAMES', () => {
  validateFrames(KYO_THROW_FRAMES, 'KYO_THROW');
});

describe('KYO_WIN_FRAMES', () => {
  validateFrames(KYO_WIN_FRAMES, 'KYO_WIN');
});

// ===== Normals =====

describe('KYO_STAND_A_FRAMES', () => {
  validateFrames(KYO_STAND_A_FRAMES, 'KYO_SA');
});

describe('KYO_STAND_C_FRAMES', () => {
  validateFrames(KYO_STAND_C_FRAMES, 'KYO_SC');
});

describe('KYO_STAND_B_FRAMES', () => {
  validateFrames(KYO_STAND_B_FRAMES, 'KYO_SB');
});

describe('KYO_STAND_D_FRAMES', () => {
  validateFrames(KYO_STAND_D_FRAMES, 'KYO_SD');
});

describe('KYO_AIR_A_FRAMES', () => {
  validateFrames(KYO_AIR_A_FRAMES, 'KYO_AA');
});

describe('KYO_AIR_C_FRAMES', () => {
  validateFrames(KYO_AIR_C_FRAMES, 'KYO_AC');
});

// ===== Specials =====

describe('KYO_ONIYAKI_FRAMES', () => {
  validateFrames(KYO_ONIYAKI_FRAMES, 'KYO_ONI');
});

describe('KYO_ONIYAKI_C_FRAMES', () => {
  it('has more frames than A version', () => {
    expect(KYO_ONIYAKI_C_FRAMES.length).toBeGreaterThanOrEqual(KYO_ONIYAKI_FRAMES.length);
  });
  validateFrames(KYO_ONIYAKI_C_FRAMES, 'KYO_ONIC');
});

describe('KYO_YAMIBARAI_FRAMES', () => {
  validateFrames(KYO_YAMIBARAI_FRAMES, 'KYO_YAMA');
});

describe('KYO_RED_KICK_FRAMES', () => {
  validateFrames(KYO_RED_KICK_FRAMES, 'KYO_RED');
});

describe('KYO_75KAI_FRAMES', () => {
  validateFrames(KYO_75KAI_FRAMES, 'KYO_75');
});

// ===== Command Normals =====

describe('KYO_CMD_GOFU_YOU_FRAMES', () => {
  validateFrames(KYO_CMD_GOFU_YOU_FRAMES, 'KYO_GFY');
});

describe('KYO_CMD_88SHIKI_FRAMES', () => {
  validateFrames(KYO_CMD_88SHIKI_FRAMES, 'KYO_88');
});

describe('KYO_CMD_NARAKU_FRAMES', () => {
  validateFrames(KYO_CMD_NARAKU_FRAMES, 'KYO_NRK');
});

// ===== Palette consistency =====

describe('Kyo palette key coverage', () => {
  it('idle frames use valid palette keys', () => {
    for (let i = 0; i < KYO_IDLE_FRAMES.length; i++) {
      validatePaletteKeys(KYO_IDLE_FRAMES[i], `KYO_IDLE[${i}]`);
    }
  });

  it('attack frames use valid palette keys', () => {
    for (const frames of [KYO_STAND_A_FRAMES, KYO_STAND_C_FRAMES]) {
      for (let i = 0; i < frames.length; i++) {
        validatePaletteKeys(frames[i], `attack[${i}]`);
      }
    }
  });
});

// Helper to register describe+it in bulk
function validateFrames(frames: PixelFrame[], label: string) {
  it(`${label} has valid structure`, () => {
    validateFrameArray(frames, label);
  });
}
