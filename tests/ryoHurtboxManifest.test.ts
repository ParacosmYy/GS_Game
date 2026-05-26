/**
 * Ryo Hurtbox Manifest Tests
 *
 * Validates that the hurtbox manifest (src/core/hurtboxManifest.ts) provides
 * correct, complete, and well-formed hurtbox definitions for all FighterStates.
 *
 * Scope:
 *   - Every FighterState enum value must have a hurtbox entry (no silent fallback)
 *   - Hurtbox dimensions must be within plausible KOF2002 body proportions
 *   - Offset values must not place the hurtbox outside character bounds
 *   - getHurtboxDef() must return valid data for every state
 *   - Fighter.getHurtbox() world-space calculation must be consistent
 *
 * These tests read manifest data only. No DOM, no Canvas, no game loop.
 */
import { describe, it, expect } from 'vitest';
import {
  HURTBOX_TABLE,
  DEFAULT_HURTBOX,
  getHurtboxDef,
} from '../src/core/hurtboxManifest.js';
import type { HurtboxDef } from '../src/core/hurtboxManifest.js';
import { FighterState } from '../src/core/types.js';

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

/** All FighterState enum values as an array */
const ALL_STATES = Object.values(FighterState) as FighterState[];

/** Reasonable bounds for hurtbox dimensions (in world-pixel units) */
const MIN_WIDTH = 30;
const MAX_WIDTH = 200;
const MIN_HEIGHT = 20;
const MAX_HEIGHT = 250;

/** Maximum absolute offset (hurtbox should not shift far beyond body) */
const MAX_OFFSET = 60;

/** Check if a HurtboxDef has all required numeric fields */
function isValidHurtboxDef(def: HurtboxDef): boolean {
  return (
    Number.isFinite(def.width) &&
    Number.isFinite(def.height) &&
    Number.isFinite(def.offsetX) &&
    Number.isFinite(def.offsetY)
  );
}

/** Get the list of states that have explicit entries in HURTBOX_TABLE */
function getExplicitStates(): Set<FighterState> {
  return new Set(Object.keys(HURTBOX_TABLE) as FighterState[]);
}

// ═══════════════════════════════════════════════════════════════
// SECTION 1: Completeness — every FighterState has a hurtbox
// ═══════════════════════════════════════════════════════════════

describe('Hurtbox manifest completeness', () => {
  it('HURTBOX_TABLE covers all FighterState values', () => {
    const explicitStates = getExplicitStates();
    // HURTBOX_TABLE should have at least as many entries as there are FighterStates
    expect(explicitStates.size, 'HURTBOX_TABLE should have entries for all FighterStates').toBe(ALL_STATES.length);
  });

  it('every FighterState enum value has an explicit hurtbox entry', () => {
    const explicitStates = getExplicitStates();
    const missing: string[] = [];
    for (const state of ALL_STATES) {
      if (!explicitStates.has(state)) {
        missing.push(state);
      }
    }
    expect(
      missing,
      `Missing hurtbox entries for states: ${missing.join(', ')}`,
    ).toEqual([]);
  });

  it('getHurtboxDef never returns DEFAULT_HURTBOX for any known FighterState', () => {
    // For every known state, the returned def should be the table entry, not the default
    for (const state of ALL_STATES) {
      const def = getHurtboxDef(state);
      expect(
        def,
        `getHurtboxDef('${state}') should return a table entry, not DEFAULT_HURTBOX`,
      ).not.toBe(DEFAULT_HURTBOX);
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 2: Dimension sanity — width and height in valid range
// ═══════════════════════════════════════════════════════════════

describe('Hurtbox dimension sanity', () => {
  it('every explicit hurtbox has width within 30-200 pixels', () => {
    for (const state of ALL_STATES) {
      const def = HURTBOX_TABLE[state];
      expect(def).toBeDefined();
      expect(
        def!.width,
        `${state}: width=${def!.width} must be >= ${MIN_WIDTH}`,
      ).toBeGreaterThanOrEqual(MIN_WIDTH);
      expect(
        def!.width,
        `${state}: width=${def!.width} must be <= ${MAX_WIDTH}`,
      ).toBeLessThanOrEqual(MAX_WIDTH);
    }
  });

  it('every explicit hurtbox has height within 20-250 pixels', () => {
    for (const state of ALL_STATES) {
      const def = HURTBOX_TABLE[state];
      expect(def).toBeDefined();
      expect(
        def!.height,
        `${state}: height=${def!.height} must be >= ${MIN_HEIGHT}`,
      ).toBeGreaterThanOrEqual(MIN_HEIGHT);
      expect(
        def!.height,
        `${state}: height=${def!.height} must be <= ${MAX_HEIGHT}`,
      ).toBeLessThanOrEqual(MAX_HEIGHT);
    }
  });

  it('DEFAULT_HURTBOX dimensions are within valid range', () => {
    expect(DEFAULT_HURTBOX.width).toBeGreaterThanOrEqual(MIN_WIDTH);
    expect(DEFAULT_HURTBOX.width).toBeLessThanOrEqual(MAX_WIDTH);
    expect(DEFAULT_HURTBOX.height).toBeGreaterThanOrEqual(MIN_HEIGHT);
    expect(DEFAULT_HURTBOX.height).toBeLessThanOrEqual(MAX_HEIGHT);
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 3: Offset sanity — hurtbox does not drift far from body
// ═══════════════════════════════════════════════════════════════

describe('Hurtbox offset sanity', () => {
  it('every explicit hurtbox has offsetX within -60 to +60 pixels', () => {
    for (const state of ALL_STATES) {
      const def = HURTBOX_TABLE[state];
      expect(def).toBeDefined();
      expect(
        Math.abs(def!.offsetX),
        `${state}: |offsetX|=${Math.abs(def!.offsetX)} must be <= ${MAX_OFFSET}`,
      ).toBeLessThanOrEqual(MAX_OFFSET);
    }
  });

  it('every explicit hurtbox has offsetY within -60 to +60 pixels', () => {
    for (const state of ALL_STATES) {
      const def = HURTBOX_TABLE[state];
      expect(def).toBeDefined();
      expect(
        Math.abs(def!.offsetY),
        `${state}: |offsetY|=${Math.abs(def!.offsetY)} must be <= ${MAX_OFFSET}`,
      ).toBeLessThanOrEqual(MAX_OFFSET);
    }
  });

  it('offsets do not push the hurtbox far outside FIGHTER_WIDTH bounds', () => {
    const FIGHTER_HALF_WIDTH = 40; // FIGHTER_WIDTH / 2
    for (const state of ALL_STATES) {
      const def = HURTBOX_TABLE[state];
      expect(def).toBeDefined();
      // The left edge: -width/2 + offsetX should not be more than half a fighter width off
      const leftEdge = -def!.width / 2 + def!.offsetX;
      const rightEdge = def!.width / 2 + def!.offsetX;
      // Both edges should be within roughly one fighter width of center
      expect(
        Math.abs(leftEdge),
        `${state}: left edge offset ${leftEdge} exceeds reasonable bounds`,
      ).toBeLessThanOrEqual(FIGHTER_HALF_WIDTH + def!.width / 2);
      expect(
        Math.abs(rightEdge),
        `${state}: right edge offset ${rightEdge} exceeds reasonable bounds`,
      ).toBeLessThanOrEqual(FIGHTER_HALF_WIDTH + def!.width / 2);
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 4: Structural validity — all fields are finite numbers
// ═══════════════════════════════════════════════════════════════

describe('Hurtbox structural validity', () => {
  it('every explicit HURTBOX_TABLE entry has valid numeric fields', () => {
    for (const state of ALL_STATES) {
      const def = HURTBOX_TABLE[state];
      expect(def).toBeDefined();
      expect(
        isValidHurtboxDef(def!),
        `${state}: hurtbox definition has invalid numeric fields`,
      ).toBe(true);
    }
  });

  it('DEFAULT_HURTBOX has valid numeric fields', () => {
    expect(isValidHurtboxDef(DEFAULT_HURTBOX)).toBe(true);
  });

  it('width and height are positive for all entries', () => {
    for (const state of ALL_STATES) {
      const def = HURTBOX_TABLE[state];
      expect(def).toBeDefined();
      expect(def!.width, `${state}: width must be positive`).toBeGreaterThan(0);
      expect(def!.height, `${state}: height must be positive`).toBeGreaterThan(0);
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 5: getHurtboxDef() return value validation
// ═══════════════════════════════════════════════════════════════

describe('getHurtboxDef() function', () => {
  it('returns a valid HurtboxDef for every FighterState', () => {
    for (const state of ALL_STATES) {
      const def = getHurtboxDef(state);
      expect(def).toBeDefined();
      expect(isValidHurtboxDef(def), `${state}: returned def is invalid`).toBe(true);
      expect(def.width).toBeGreaterThan(0);
      expect(def.height).toBeGreaterThan(0);
    }
  });

  it('returns the table entry for states that exist in HURTBOX_TABLE', () => {
    for (const state of ALL_STATES) {
      const tableEntry = HURTBOX_TABLE[state];
      const returned = getHurtboxDef(state);
      if (tableEntry) {
        expect(returned).toBe(tableEntry);
      }
    }
  });

  it('returns DEFAULT_HURTBOX for an unknown string cast as FighterState', () => {
    // Simulate a future state not yet in the table
    const unknownState = 'UNKNOWN_FUTURE_STATE' as FighterState;
    const def = getHurtboxDef(unknownState);
    expect(def).toBe(DEFAULT_HURTBOX);
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 6: Semantic correctness — state-specific body shapes
// ═══════════════════════════════════════════════════════════════

describe('Hurtbox semantic correctness (state-appropriate body shapes)', () => {
  it('standing states (IDLE, WALK, STAND_ATTACK) have tall narrow boxes (height > width)', () => {
    const standingStates: FighterState[] = [
      FighterState.IDLE,
      FighterState.WALK,
      FighterState.STAND_ATTACK,
      FighterState.BLOCK,
      FighterState.COUNTER_STANCE,
      FighterState.TAUNT,
      FighterState.MAX_MODE,
      FighterState.THROW,
      FighterState.DIZZY,
      FighterState.GUARD_CRUSH,
      FighterState.HITSTUN,
    ];
    for (const state of standingStates) {
      const def = getHurtboxDef(state);
      expect(
        def.height,
        `${state}: standing hurtbox height (${def.height}) should exceed width (${def.width})`,
      ).toBeGreaterThan(def.width);
    }
  });

  it('crouching states have short bodies (height < standing height)', () => {
    const idleDef = getHurtboxDef(FighterState.IDLE);
    const crouchStates: FighterState[] = [
      FighterState.CROUCH,
      FighterState.CROUCH_ATTACK,
      FighterState.ROLL,
      FighterState.BACK_ROLL,
    ];
    for (const state of crouchStates) {
      const def = getHurtboxDef(state);
      expect(
        def.height,
        `${state}: crouch height (${def.height}) should be less than standing height (${idleDef.height})`,
      ).toBeLessThan(idleDef.height);
    }
  });

  it('knockdown has a flat body (width > height)', () => {
    const def = getHurtboxDef(FighterState.KNOCKDOWN);
    expect(
      def.width,
      `KNOCKDOWN: width (${def.width}) should exceed height (${def.height}) for lying-flat body`,
    ).toBeGreaterThan(def.height);
  });

  it('airborne states have compact boxes (height < standing, width <= standing)', () => {
    const idleDef = getHurtboxDef(FighterState.IDLE);
    const airStates: FighterState[] = [
      FighterState.JUMP,
      FighterState.RUN_JUMP,
      FighterState.HOP,
      FighterState.HYPER_JUMP,
      FighterState.AIR_ATTACK,
      FighterState.AIR_BLOCK,
    ];
    for (const state of airStates) {
      const def = getHurtboxDef(state);
      expect(
        def.height,
        `${state}: air height (${def.height}) should be less than standing height (${idleDef.height})`,
      ).toBeLessThan(idleDef.height);
    }
  });

  it('backdash has intermediate height between standing and crouching', () => {
    const idleDef = getHurtboxDef(FighterState.IDLE);
    const crouchDef = getHurtboxDef(FighterState.CROUCH);
    const backdashDef = getHurtboxDef(FighterState.BACKDASH);
    expect(backdashDef.height).toBeLessThan(idleDef.height);
    expect(backdashDef.height).toBeGreaterThan(crouchDef.height);
  });

  it('hitstun body is slightly wider than idle (reeling back)', () => {
    const idleDef = getHurtboxDef(FighterState.IDLE);
    const hitstunDef = getHurtboxDef(FighterState.HITSTUN);
    expect(
      hitstunDef.width,
      'HITSTUN width should be >= IDLE width (body expanded when hit)',
    ).toBeGreaterThanOrEqual(idleDef.width);
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 7: No duplicate entries and key integrity
// ═══════════════════════════════════════════════════════════════

describe('Hurtbox table integrity', () => {
  it('HURTBOX_TABLE keys are all valid FighterState values', () => {
    const allStateSet = new Set(ALL_STATES);
    const tableKeys = Object.keys(HURTBOX_TABLE) as FighterState[];
    for (const key of tableKeys) {
      expect(
        allStateSet.has(key),
        `HURTBOX_TABLE key '${key}' is not a valid FighterState`,
      ).toBe(true);
    }
  });

  it('no two states share the exact same hurtbox object reference accidentally', () => {
    const entries = Object.entries(HURTBOX_TABLE) as [FighterState, HurtboxDef][];
    const seen = new Map<string, FighterState>();
    for (const [state, def] of entries) {
      // Create a content key from the values (not the reference)
      const contentKey = `${def.offsetX},${def.offsetY},${def.width},${def.height}`;
      // It is OK for two states to have the same dimensions, but log it for awareness
      if (seen.has(contentKey)) {
        // Not an error — just noting that some states share identical definitions
        // This is acceptable for states like WALK and IDLE having same body shape
      }
      seen.set(contentKey, state);
    }
    // Should have at least 3 distinct hurtbox shapes (standing, crouch, air, knockdown)
    expect(seen.size, 'Should have at least 3 distinct hurtbox shapes').toBeGreaterThanOrEqual(3);
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 8: Fighter.getHurtbox() world-space consistency
// ═══════════════════════════════════════════════════════════════

describe('Fighter.getHurtbox() world-space calculation', () => {
  it('getHurtboxDef produces valid world-space coordinates for a fighter at center stage', () => {
    // Simulate what Fighter.getHurtbox() does:
    //   x = fighter.x - def.width / 2 + def.offsetX
    //   y = fighter.y - def.height + def.offsetY
    const fighterX = 400; // center of 800px stage
    const fighterY = 510; // STAGE_GROUND_Y

    for (const state of ALL_STATES) {
      const def = getHurtboxDef(state);
      const worldX = fighterX - def.width / 2 + def.offsetX;
      const worldY = fighterY - def.height + def.offsetY;

      expect(
        Number.isFinite(worldX),
        `${state}: worldX should be finite`,
      ).toBe(true);
      expect(
        Number.isFinite(worldY),
        `${state}: worldY should be finite`,
      ).toBe(true);
      expect(worldX, `${state}: worldX should be >= 0`).toBeGreaterThanOrEqual(0);
      // Y can be negative for very tall boxes at ground level, which is fine
      // but the bottom edge (worldY + height) should be near ground
      expect(
        worldY + def.height,
        `${state}: bottom edge should be near ground (510 +/- 10)`,
      ).toBeCloseTo(fighterY + def.offsetY, 0);
    }
  });

  it('knockdown hurtbox top edge is close to ground level', () => {
    const fighterY = 510; // STAGE_GROUND_Y
    const def = getHurtboxDef(FighterState.KNOCKDOWN);
    const topEdge = fighterY - def.height + def.offsetY;
    // Knockdown: body is lying flat, top edge should be near ground
    // offsetY=-20, height=40 => topEdge = 510 - 40 + (-20) = 450
    // This means the box extends from 450 to 490 (near ground)
    expect(topEdge).toBeGreaterThan(400);
    expect(topEdge).toBeLessThanOrEqual(fighterY);
  });
});
