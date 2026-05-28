/**
 * Hurtbox Manifest — per-state body collision rectangles
 *
 * Each entry defines the hurtbox relative to the fighter's foot position (x, y)
 * where y = STAGE_GROUND_Y. The box is specified as width and height, with
 * anchor offsets for fine-tuning per-state body shape.
 *
 * Rendering reads this data. Combat reads this data.
 * Neither should compute hurtboxes ad-hoc.
 */
import { FighterState } from './types.js';

/** A single hurtbox definition relative to fighter position */
export interface HurtboxDef {
  /** Horizontal offset from fighter center (negative = shift left) */
  offsetX: number;
  /** Vertical offset from fighter Y (negative = upward) */
  offsetY: number;
  /** Hurtbox width */
  width: number;
  /** Hurtbox height */
  height: number;
}

/**
 * State-to-hurtbox lookup table.
 * Falls back to a default standing box for any unlisted state.
 *
 * Values are based on KOF2002 proportions:
 * - Stand: tall narrow body
 * - Crouch: short wide body
 * - Jump: compact tucked body
 * - Hitstun: slightly expanded (reeling back)
 * - Knockdown: flat on ground
 *
 * All values in world-pixel units.
 */
export const HURTBOX_TABLE: Partial<Record<FighterState, HurtboxDef>> = {
  // ── Standing states ──
  [FighterState.IDLE]: {
    offsetX: 0,
    offsetY: 0,
    width: 80,
    height: 200,
  },
  [FighterState.WALK]: {
    offsetX: 0,
    offsetY: 0,
    width: 80,
    height: 200,
  },
  [FighterState.RUN]: {
    offsetX: 2,
    offsetY: 0,
    width: 76,
    height: 190,
  },
  [FighterState.STAND_ATTACK]: {
    offsetX: 3,
    offsetY: 0,
    width: 86,
    height: 200,
  },
  [FighterState.BLOCK]: {
    offsetX: -2,
    offsetY: 0,
    width: 78,
    height: 200,
  },
  [FighterState.COUNTER_STANCE]: {
    offsetX: 0,
    offsetY: 0,
    width: 80,
    height: 200,
  },
  [FighterState.TAUNT]: {
    offsetX: 0,
    offsetY: 0,
    width: 80,
    height: 200,
  },
  [FighterState.WIN]: {
    offsetX: 0,
    offsetY: 0,
    width: 80,
    height: 200,
  },
  [FighterState.MAX_MODE]: {
    offsetX: 0,
    offsetY: 0,
    width: 80,
    height: 200,
  },

  // ── Crouching ──
  [FighterState.CROUCH]: {
    offsetX: 0,
    offsetY: 0,
    width: 90,
    height: 130,
  },
  [FighterState.CROUCH_ATTACK]: {
    offsetX: 4,
    offsetY: 0,
    width: 92,
    height: 130,
  },

  // ── Airborne ──
  [FighterState.JUMP]: {
    offsetX: 0,
    offsetY: 0,
    width: 70,
    height: 160,
  },
  [FighterState.RUN_JUMP]: {
    offsetX: 0,
    offsetY: 0,
    width: 70,
    height: 160,
  },
  [FighterState.HOP]: {
    offsetX: 0,
    offsetY: 0,
    width: 70,
    height: 170,
  },
  [FighterState.HYPER_JUMP]: {
    offsetX: 0,
    offsetY: 0,
    width: 70,
    height: 160,
  },
  [FighterState.AIR_ATTACK]: {
    offsetX: 3,
    offsetY: 0,
    width: 78,
    height: 150,
  },
  [FighterState.AIR_BLOCK]: {
    offsetX: 0,
    offsetY: 0,
    width: 70,
    height: 160,
  },

  // ── Hit states ──
  [FighterState.HITSTUN]: {
    offsetX: -3,
    offsetY: 0,
    width: 90,
    height: 200,
  },

  [FighterState.KNOCKDOWN]: {
    offsetX: 0,
    offsetY: -20,
    width: 120,
    height: 40,
  },

  // ── Getup: transitioning from lying to standing ──
  [FighterState.GETUP]: {
    offsetX: 0,
    offsetY: -10,
    width: 100,
    height: 60,
  },

  // ── Special states ──
  [FighterState.ROLL]: {
    offsetX: 0,
    offsetY: 0,
    width: 60,
    height: 130,
  },
  [FighterState.BACK_ROLL]: {
    offsetX: 0,
    offsetY: 0,
    width: 60,
    height: 130,
  },
  [FighterState.BACKDASH]: {
    offsetX: 0,
    offsetY: 0,
    width: 70,
    height: 180,
  },
  [FighterState.THROW]: {
    offsetX: 0,
    offsetY: 0,
    width: 80,
    height: 200,
  },
  [FighterState.GUARD_CRUSH]: {
    offsetX: -4,
    offsetY: 0,
    width: 90,
    height: 200,
  },
  [FighterState.DIZZY]: {
    offsetX: 0,
    offsetY: 0,
    width: 84,
    height: 200,
  },
};

/** Default hurtbox for states not listed in the table */
export const DEFAULT_HURTBOX: HurtboxDef = {
  offsetX: 0,
  offsetY: 0,
  width: 80,
  height: 200,
};

/**
 * Look up the hurtbox definition for a given fighter state.
 * Returns the default if the state is not in the table.
 */
export function getHurtboxDef(state: FighterState): HurtboxDef {
  return HURTBOX_TABLE[state] ?? DEFAULT_HURTBOX;
}
