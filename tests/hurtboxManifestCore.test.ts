/**
 * Hurtbox Manifest Core Regression Tests
 *
 * Validates the state-to-hurtbox lookup table structure and consistency.
 */
import { describe, it, expect } from 'vitest';
import {
  HURTBOX_TABLE,
  DEFAULT_HURTBOX,
  getHurtboxDef,
  type HurtboxDef,
} from '../src/core/hurtboxManifest.js';
import { FighterState } from '../src/core/types.js';

function validateHurtbox(def: HurtboxDef, context: string) {
  expect(typeof def.offsetX, `${context} offsetX`).toBe('number');
  expect(typeof def.offsetY, `${context} offsetY`).toBe('number');
  expect(def.width, `${context} width`).toBeGreaterThan(0);
  expect(def.height, `${context} height`).toBeGreaterThan(0);
}

describe('HURTBOX_TABLE', () => {
  it('is non-empty object', () => {
    expect(Object.keys(HURTBOX_TABLE).length).toBeGreaterThan(0);
  });

  it('has entries for essential states', () => {
    const essentialStates: FighterState[] = [
      FighterState.IDLE,
      FighterState.WALK,
      FighterState.CROUCH,
      FighterState.JUMP,
      FighterState.HITSTUN,
      FighterState.KNOCKDOWN,
    ];
    for (const state of essentialStates) {
      expect(HURTBOX_TABLE[state], `${state}`).toBeDefined();
    }
  });

  it('all entries have valid hurtbox definitions', () => {
    for (const [state, def] of Object.entries(HURTBOX_TABLE)) {
      validateHurtbox(def!, state);
    }
  });

  it('standing states have tall boxes (height >= 190)', () => {
    const standStates = [FighterState.IDLE, FighterState.WALK, FighterState.BLOCK, FighterState.WIN];
    for (const state of standStates) {
      const def = HURTBOX_TABLE[state];
      expect(def, `${state} defined`).toBeDefined();
      expect(def!.height, `${state} height`).toBeGreaterThanOrEqual(190);
    }
  });

  it('crouching states have shorter boxes (height < standing)', () => {
    const standHeight = HURTBOX_TABLE[FighterState.IDLE]!.height;
    const crouchDef = HURTBOX_TABLE[FighterState.CROUCH];
    expect(crouchDef!.height).toBeLessThan(standHeight);
  });

  it('jump states have compact boxes', () => {
    const jumpDef = HURTBOX_TABLE[FighterState.JUMP];
    const standDef = HURTBOX_TABLE[FighterState.IDLE];
    expect(jumpDef!.width).toBeLessThan(standDef!.width);
    expect(jumpDef!.height).toBeLessThan(standDef!.height);
  });

  it('knockdown box is flat (height << width)', () => {
    const kd = HURTBOX_TABLE[FighterState.KNOCKDOWN]!;
    expect(kd.height).toBeLessThan(kd.width / 2);
  });

  it('roll boxes are narrow (evasive)', () => {
    const roll = HURTBOX_TABLE[FighterState.ROLL]!;
    const idle = HURTBOX_TABLE[FighterState.IDLE]!;
    expect(roll.width).toBeLessThanOrEqual(idle.width);
    expect(roll.height).toBeLessThan(idle.height);
  });

  it('hitstun box is wider than idle (vulnerable)', () => {
    const hitstun = HURTBOX_TABLE[FighterState.HITSTUN]!;
    const idle = HURTBOX_TABLE[FighterState.IDLE]!;
    expect(hitstun.width).toBeGreaterThanOrEqual(idle.width);
  });
});

describe('DEFAULT_HURTBOX', () => {
  it('has valid definition', () => {
    validateHurtbox(DEFAULT_HURTBOX, 'DEFAULT');
  });

  it('matches idle dimensions', () => {
    const idle = HURTBOX_TABLE[FighterState.IDLE]!;
    expect(DEFAULT_HURTBOX.width).toBe(idle.width);
    expect(DEFAULT_HURTBOX.height).toBe(idle.height);
  });
});

describe('getHurtboxDef', () => {
  it('returns correct definition for IDLE', () => {
    const def = getHurtboxDef(FighterState.IDLE);
    expect(def.width).toBe(80);
    expect(def.height).toBe(200);
  });

  it('returns correct definition for CROUCH', () => {
    const def = getHurtboxDef(FighterState.CROUCH);
    expect(def.width).toBe(90);
    expect(def.height).toBe(130);
  });

  it('returns correct definition for KNOCKDOWN', () => {
    const def = getHurtboxDef(FighterState.KNOCKDOWN);
    expect(def.width).toBe(120);
    expect(def.height).toBe(40);
  });

  it('returns default for unlisted states', () => {
    // Use a state that's likely not in the table
    // getHurtboxDef should always return a valid HurtboxDef
    const def = getHurtboxDef('NONEXISTENT_STATE' as FighterState);
    expect(def).toBeDefined();
    expect(def.width).toBeGreaterThan(0);
    expect(def.height).toBeGreaterThan(0);
  });

  it('returns same ref for listed state', () => {
    const def = getHurtboxDef(FighterState.IDLE);
    expect(def).toBe(HURTBOX_TABLE[FighterState.IDLE]);
  });
});

describe('Hurtbox physical consistency', () => {
  it('all widths are between 50 and 150 pixels', () => {
    for (const [state, def] of Object.entries(HURTBOX_TABLE)) {
      expect(def!.width, `${state} width`).toBeGreaterThanOrEqual(50);
      expect(def!.width, `${state} width`).toBeLessThanOrEqual(150);
    }
  });

  it('all heights are between 30 and 250 pixels', () => {
    for (const [state, def] of Object.entries(HURTBOX_TABLE)) {
      expect(def!.height, `${state} height`).toBeGreaterThanOrEqual(30);
      expect(def!.height, `${state} height`).toBeLessThanOrEqual(250);
    }
  });

  it('all offsets are within reasonable range (-20, 20)', () => {
    for (const [state, def] of Object.entries(HURTBOX_TABLE)) {
      expect(Math.abs(def!.offsetX), `${state} offsetX`).toBeLessThanOrEqual(20);
      expect(Math.abs(def!.offsetY), `${state} offsetY`).toBeLessThanOrEqual(30);
    }
  });
});
