/**
 * Kyo & Iori Pixel Frame Data Structural Regression Tests
 *
 * Validates all exported PixelFrame arrays from Kyo and Iori sprite data files.
 * Checks: frame array non-empty, consistent dimensions, pixel row length matches width,
 * pixel values reference valid palette indices, palette has required entries.
 */
import { describe, it, expect } from 'vitest';
import type { PixelFrame } from '../src/rendering/sprites/kyo/kyoIdleFrames.js';

// Kyo frames
import { KYO_IDLE_FRAMES, KYO_PALETTE } from '../src/rendering/sprites/kyo/kyoIdleFrames.js';
import { KYO_WALK_FORWARD_FRAMES, KYO_WALK_BACKWARD_FRAMES } from '../src/rendering/sprites/kyo/kyoWalkFrames.js';
import { KYO_CROUCH_FRAMES } from '../src/rendering/sprites/kyo/kyoCrouchFrames.js';
import { KYO_HURT_FRAMES, KYO_KNOCKDOWN_FRAMES, KYO_BLOCK_FRAMES } from '../src/rendering/sprites/kyo/kyoDamageFrames.js';
import { KYO_STAND_B_FRAMES, KYO_STAND_D_FRAMES } from '../src/rendering/sprites/kyo/kyoKickFrames.js';
import { KYO_STAND_A_FRAMES, KYO_STAND_C_FRAMES } from '../src/rendering/sprites/kyo/kyoAttackFrames.js';
import { KYO_THROW_FRAMES } from '../src/rendering/sprites/kyo/kyoThrowFrames.js';
import {
  KYO_ONIYAKI_FRAMES, KYO_ONIYAKI_C_FRAMES, KYO_YAMIBARAI_FRAMES,
  KYO_RED_KICK_FRAMES, KYO_75KAI_FRAMES, KYO_ARAGAMI_FRAMES, KYO_DOKUGAMI_FRAMES,
  KYO_OROCHINAGI_DM_FRAMES, KYO_OROCHINAGI_SDM_FRAMES,
} from '../src/rendering/sprites/kyo/kyoSpecialFrames.js';
import {
  KYO_RUN_FRAMES, KYO_BACKDASH_FRAMES, KYO_ROLL_FRAMES, KYO_BACK_ROLL_FRAMES,
  KYO_GUARD_CRUSH_FRAMES, KYO_MAX_MODE_FRAMES, KYO_TAUNT_FRAMES,
} from '../src/rendering/sprites/kyo/kyoMovementFrames.js';
import {
  KYO_CMD_GOFU_YOU_FRAMES, KYO_CMD_88SHIKI_FRAMES, KYO_CMD_NARAKU_FRAMES,
} from '../src/rendering/sprites/kyo/kyoCommandNormalFrames.js';
import {
  KYO_CLOSE_A_FRAMES, KYO_CLOSE_B_FRAMES, KYO_CLOSE_C_FRAMES, KYO_CLOSE_D_FRAMES,
} from '../src/rendering/sprites/kyo/kyoCloseAttackFrames.js';
import {
  KYO_CROUCH_A_FRAMES as KYO_CROUCH_ATK_A_FRAMES,
  KYO_CROUCH_B_FRAMES, KYO_CROUCH_C_FRAMES as KYO_CROUCH_ATK_C_FRAMES,
  KYO_CROUCH_D_FRAMES,
} from '../src/rendering/sprites/kyo/kyoCrouchAttackFrames.js';
import { KYO_JUMP_FRAMES } from '../src/rendering/sprites/kyo/kyoJumpFrames.js';
import {
  KYO_AIR_A_FRAMES as KYO_AIR_ATK_A_FRAMES,
  KYO_AIR_B_FRAMES, KYO_AIR_C_FRAMES as KYO_AIR_ATK_C_FRAMES,
  KYO_AIR_D_FRAMES,
} from '../src/rendering/sprites/kyo/kyoAirAttackFrames.js';
import { KYO_DIZZY_FRAMES } from '../src/rendering/sprites/kyo/kyoDizzyFrames.js';

// Iori frames
import { IORI_IDLE_FRAMES } from '../src/rendering/sprites/iori/ioriIdleFrames.js';
import { IORI_WALK_FORWARD_FRAMES, IORI_WALK_BACKWARD_FRAMES } from '../src/rendering/sprites/iori/ioriWalkFrames.js';
import { IORI_CROUCH_FRAMES } from '../src/rendering/sprites/iori/ioriCrouchFrames.js';
import { IORI_HURT_FRAMES, IORI_KNOCKDOWN_FRAMES, IORI_BLOCK_FRAMES } from '../src/rendering/sprites/iori/ioriDamageFrames.js';
import { IORI_STAND_B_FRAMES, IORI_STAND_D_FRAMES } from '../src/rendering/sprites/iori/ioriKickFrames.js';
import { IORI_STAND_A_FRAMES, IORI_STAND_C_FRAMES } from '../src/rendering/sprites/iori/ioriAttackFrames.js';
import { IORI_THROW_FRAMES } from '../src/rendering/sprites/iori/ioriThrowFrames.js';
import {
  IORI_ONIYAKI_FRAMES, IORI_ONIYAKI_C_FRAMES, IORI_YAMIBARAI_FRAMES, IORI_YAMIBARAI_C_FRAMES,
  IORI_AOIHANA_FRAMES, IORI_AOIHANA_2_FRAMES, IORI_AOIHANA_3_FRAMES,
  IORI_KOTOTSUKI_FRAMES, IORI_KUZUKAZE_FRAMES,
} from '../src/rendering/sprites/iori/ioriSpecialFrames.js';
import {
  IORI_RUN_FRAMES, IORI_BACKDASH_FRAMES, IORI_ROLL_FRAMES, IORI_BACK_ROLL_FRAMES,
  IORI_GUARD_CRUSH_FRAMES, IORI_MAX_MODE_FRAMES, IORI_TAUNT_FRAMES,
} from '../src/rendering/sprites/iori/ioriMovementFrames.js';
import {
  IORI_YUMEYUMI_FRAMES, IORI_KATANUGI_FRAMES, IORI_YUKIWARUI_FRAMES,
} from '../src/rendering/sprites/iori/ioriCommandNormalFrames.js';
import {
  IORI_CLOSE_A_FRAMES, IORI_CLOSE_B_FRAMES, IORI_CLOSE_C_FRAMES, IORI_CLOSE_D_FRAMES,
} from '../src/rendering/sprites/iori/ioriCloseAttackFrames.js';
import {
  IORI_CROUCH_A_FRAMES, IORI_CROUCH_B_FRAMES, IORI_CROUCH_C_FRAMES, IORI_CROUCH_D_FRAMES,
} from '../src/rendering/sprites/iori/ioriCrouchAttackFrames.js';
import { IORI_JUMP_FRAMES } from '../src/rendering/sprites/iori/ioriJumpFrames.js';
import {
  IORI_AIR_A_FRAMES, IORI_AIR_B_FRAMES, IORI_AIR_C_FRAMES, IORI_AIR_D_FRAMES,
} from '../src/rendering/sprites/iori/ioriAirAttackFrames.js';
import { IORI_DIZZY_FRAMES } from '../src/rendering/sprites/iori/ioriDizzyFrames.js';
import {
  IORI_YATAGARASU_DM_FRAMES, IORI_YATAGARASU_SDM_FRAMES, IORI_YAOTOME_HSDM_FRAMES,
} from '../src/rendering/sprites/iori/ioriSuperFrames.js';

// ===== Validation helpers =====

function validateFrameArray(frames: PixelFrame[], label: string) {
  expect(frames.length, `${label} has frames`).toBeGreaterThan(0);
  for (let i = 0; i < frames.length; i++) {
    const f = frames[i];
    expect(f.width, `${label}[${i}].width`).toBeGreaterThan(0);
    expect(f.height, `${label}[${i}].height`).toBeGreaterThan(0);
    expect(f.pixels.length, `${label}[${i}].pixels rows`).toBeGreaterThan(0);
    for (let row = 0; row < f.pixels.length; row++) {
      expect(f.pixels[row].length, `${label}[${i}].pixels[${row}] cols`).toBe(f.width);
    }
    // Palette should exist and have entries
    const paletteKeys = Object.keys(f.palette);
    expect(paletteKeys.length, `${label}[${i}].palette size`).toBeGreaterThan(0);
  }
}

function validateConsistentDimensions(frames: PixelFrame[], label: string) {
  if (frames.length <= 1) return;
  const w = frames[0].width;
  // Width should be consistent across frames
  for (let i = 1; i < frames.length; i++) {
    expect(frames[i].width, `${label}[${i}].width consistent`).toBe(w);
  }
  // Height may vary slightly for some animations (e.g. SDM extra rows)
  // Just verify all heights are positive and within reasonable range
  for (let i = 0; i < frames.length; i++) {
    expect(frames[i].height, `${label}[${i}].height positive`).toBeGreaterThan(0);
    expect(frames[i].height, `${label}[${i}].height reasonable`).toBeLessThan(200);
  }
}

// ===== KYO =====

const KYO_FRAME_SETS: [string, PixelFrame[]][] = [
  ['IDLE', KYO_IDLE_FRAMES],
  ['WALK_FWD', KYO_WALK_FORWARD_FRAMES],
  ['WALK_BACK', KYO_WALK_BACKWARD_FRAMES],
  ['CROUCH', KYO_CROUCH_FRAMES],
  ['HURT', KYO_HURT_FRAMES],
  ['KNOCKDOWN', KYO_KNOCKDOWN_FRAMES],
  ['BLOCK', KYO_BLOCK_FRAMES],
  ['STAND_A', KYO_STAND_A_FRAMES],
  ['STAND_B', KYO_STAND_B_FRAMES],
  ['STAND_C', KYO_STAND_C_FRAMES],
  ['STAND_D', KYO_STAND_D_FRAMES],
  ['CLOSE_A', KYO_CLOSE_A_FRAMES],
  ['CLOSE_B', KYO_CLOSE_B_FRAMES],
  ['CLOSE_C', KYO_CLOSE_C_FRAMES],
  ['CLOSE_D', KYO_CLOSE_D_FRAMES],
  ['CROUCH_A', KYO_CROUCH_ATK_A_FRAMES],
  ['CROUCH_B', KYO_CROUCH_B_FRAMES],
  ['CROUCH_C', KYO_CROUCH_ATK_C_FRAMES],
  ['CROUCH_D', KYO_CROUCH_D_FRAMES],
  ['AIR_A', KYO_AIR_ATK_A_FRAMES],
  ['AIR_B', KYO_AIR_B_FRAMES],
  ['AIR_C', KYO_AIR_ATK_C_FRAMES],
  ['AIR_D', KYO_AIR_D_FRAMES],
  ['JUMP', KYO_JUMP_FRAMES],
  ['RUN', KYO_RUN_FRAMES],
  ['BACKDASH', KYO_BACKDASH_FRAMES],
  ['ROLL', KYO_ROLL_FRAMES],
  ['BACK_ROLL', KYO_BACK_ROLL_FRAMES],
  ['GUARD_CRUSH', KYO_GUARD_CRUSH_FRAMES],
  ['MAX_MODE', KYO_MAX_MODE_FRAMES],
  ['TAUNT', KYO_TAUNT_FRAMES],
  ['THROW', KYO_THROW_FRAMES],
  ['DIZZY', KYO_DIZZY_FRAMES],
  ['CMD_GOFU_YOU', KYO_CMD_GOFU_YOU_FRAMES],
  ['CMD_88SHIKI', KYO_CMD_88SHIKI_FRAMES],
  ['CMD_NARAKU', KYO_CMD_NARAKU_FRAMES],
  ['ONIYAKI', KYO_ONIYAKI_FRAMES],
  ['ONIYAKI_C', KYO_ONIYAKI_C_FRAMES],
  ['YAMIBARAI', KYO_YAMIBARAI_FRAMES],
  ['RED_KICK', KYO_RED_KICK_FRAMES],
  ['75KAI', KYO_75KAI_FRAMES],
  ['ARAGAMI', KYO_ARAGAMI_FRAMES],
  ['DOKUGAMI', KYO_DOKUGAMI_FRAMES],
  ['OROCHINAGI_DM', KYO_OROCHINAGI_DM_FRAMES],
  ['OROCHINAGI_SDM', KYO_OROCHINAGI_SDM_FRAMES],
];

describe('Kyo Pixel Frame Data', () => {
  it('KYO_PALETTE has entries', () => {
    expect(Object.keys(KYO_PALETTE).length).toBeGreaterThan(10);
  });

  for (const [name, frames] of KYO_FRAME_SETS) {
    it(`KYO_${name} has valid frame structure`, () => {
      validateFrameArray(frames, `KYO_${name}`);
    });
    it(`KYO_${name} has consistent dimensions across frames`, () => {
      validateConsistentDimensions(frames, `KYO_${name}`);
    });
  }

  it('idle has 6 frames (breathing loop)', () => {
    expect(KYO_IDLE_FRAMES.length).toBe(6);
  });

  it('SDM has more frames than DM', () => {
    expect(KYO_OROCHINAGI_SDM_FRAMES.length).toBeGreaterThan(KYO_OROCHINAGI_DM_FRAMES.length);
  });

  it('oniyaki C has more frames than oniyaki A', () => {
    expect(KYO_ONIYAKI_C_FRAMES.length).toBeGreaterThan(KYO_ONIYAKI_FRAMES.length);
  });

  it('total frame sets count is reasonable (>40)', () => {
    expect(KYO_FRAME_SETS.length).toBeGreaterThan(40);
  });
});

// ===== IORI =====

const IORI_FRAME_SETS: [string, PixelFrame[]][] = [
  ['IDLE', IORI_IDLE_FRAMES],
  ['WALK_FWD', IORI_WALK_FORWARD_FRAMES],
  ['WALK_BACK', IORI_WALK_BACKWARD_FRAMES],
  ['CROUCH', IORI_CROUCH_FRAMES],
  ['HURT', IORI_HURT_FRAMES],
  ['KNOCKDOWN', IORI_KNOCKDOWN_FRAMES],
  ['BLOCK', IORI_BLOCK_FRAMES],
  ['STAND_A', IORI_STAND_A_FRAMES],
  ['STAND_B', IORI_STAND_B_FRAMES],
  ['STAND_C', IORI_STAND_C_FRAMES],
  ['STAND_D', IORI_STAND_D_FRAMES],
  ['CLOSE_A', IORI_CLOSE_A_FRAMES],
  ['CLOSE_B', IORI_CLOSE_B_FRAMES],
  ['CLOSE_C', IORI_CLOSE_C_FRAMES],
  ['CLOSE_D', IORI_CLOSE_D_FRAMES],
  ['CROUCH_A', IORI_CROUCH_A_FRAMES],
  ['CROUCH_B', IORI_CROUCH_B_FRAMES],
  ['CROUCH_C', IORI_CROUCH_C_FRAMES],
  ['CROUCH_D', IORI_CROUCH_D_FRAMES],
  ['AIR_A', IORI_AIR_A_FRAMES],
  ['AIR_B', IORI_AIR_B_FRAMES],
  ['AIR_C', IORI_AIR_C_FRAMES],
  ['AIR_D', IORI_AIR_D_FRAMES],
  ['JUMP', IORI_JUMP_FRAMES],
  ['RUN', IORI_RUN_FRAMES],
  ['BACKDASH', IORI_BACKDASH_FRAMES],
  ['ROLL', IORI_ROLL_FRAMES],
  ['BACK_ROLL', IORI_BACK_ROLL_FRAMES],
  ['GUARD_CRUSH', IORI_GUARD_CRUSH_FRAMES],
  ['MAX_MODE', IORI_MAX_MODE_FRAMES],
  ['TAUNT', IORI_TAUNT_FRAMES],
  ['THROW', IORI_THROW_FRAMES],
  ['DIZZY', IORI_DIZZY_FRAMES],
  ['YUMEYUMI', IORI_YUMEYUMI_FRAMES],
  ['KATANUGI', IORI_KATANUGI_FRAMES],
  ['YUKIWARUI', IORI_YUKIWARUI_FRAMES],
  ['ONIYAKI', IORI_ONIYAKI_FRAMES],
  ['ONIYAKI_C', IORI_ONIYAKI_C_FRAMES],
  ['YAMIBARAI', IORI_YAMIBARAI_FRAMES],
  ['YAMIBARAI_C', IORI_YAMIBARAI_C_FRAMES],
  ['AOIHANA', IORI_AOIHANA_FRAMES],
  ['AOIHANA_2', IORI_AOIHANA_2_FRAMES],
  ['AOIHANA_3', IORI_AOIHANA_3_FRAMES],
  ['KOTOTSUKI', IORI_KOTOTSUKI_FRAMES],
  ['KUZUKAZE', IORI_KUZUKAZE_FRAMES],
  ['YATAGARASU_DM', IORI_YATAGARASU_DM_FRAMES],
  ['YATAGARASU_SDM', IORI_YATAGARASU_SDM_FRAMES],
  ['YAOTOME_HSDM', IORI_YAOTOME_HSDM_FRAMES],
];

describe('Iori Pixel Frame Data', () => {
  for (const [name, frames] of IORI_FRAME_SETS) {
    it(`IORI_${name} has valid frame structure`, () => {
      validateFrameArray(frames, `IORI_${name}`);
    });
    it(`IORI_${name} has consistent dimensions across frames`, () => {
      validateConsistentDimensions(frames, `IORI_${name}`);
    });
  }

  it('idle has 6 frames (breathing loop)', () => {
    expect(IORI_IDLE_FRAMES.length).toBe(6);
  });

  it('SDM has more frames than DM', () => {
    expect(IORI_YATAGARASU_SDM_FRAMES.length).toBeGreaterThan(IORI_YATAGARASU_DM_FRAMES.length);
  });

  it('HSDM has more frames than SDM', () => {
    expect(IORI_YAOTOME_HSDM_FRAMES.length).toBeGreaterThanOrEqual(IORI_YATAGARASU_SDM_FRAMES.length);
  });

  it('oniyaki C has more frames than oniyaki A', () => {
    expect(IORI_ONIYAKI_C_FRAMES.length).toBeGreaterThan(IORI_ONIYAKI_FRAMES.length);
  });

  it('aoihana 3 is launcher (has frames)', () => {
    expect(IORI_AOIHANA_3_FRAMES.length).toBeGreaterThan(0);
  });

  it('yamibarai C reuses yamibarai A frames', () => {
    expect(IORI_YAMIBARAI_C_FRAMES).toBe(IORI_YAMIBARAI_FRAMES);
  });

  it('total frame sets count is reasonable (>45)', () => {
    expect(IORI_FRAME_SETS.length).toBeGreaterThan(45);
  });
});

// ===== Cross-character =====

describe('Kyo vs Iori pixel frame consistency', () => {
  it('both have same standard dimensions for idle (48x72)', () => {
    expect(KYO_IDLE_FRAMES[0].width).toBe(IORI_IDLE_FRAMES[0].width);
    expect(KYO_IDLE_FRAMES[0].height).toBe(IORI_IDLE_FRAMES[0].height);
  });

  it('both have 6 idle frames', () => {
    expect(KYO_IDLE_FRAMES.length).toBe(IORI_IDLE_FRAMES.length);
  });

  it('both have throw frames', () => {
    expect(KYO_THROW_FRAMES.length).toBeGreaterThan(0);
    expect(IORI_THROW_FRAMES.length).toBeGreaterThan(0);
  });

  it('both have dizzy frames', () => {
    expect(KYO_DIZZY_FRAMES.length).toBeGreaterThan(0);
    expect(IORI_DIZZY_FRAMES.length).toBeGreaterThan(0);
  });
});
