/**
 * Airborne action routing regression tests.
 *
 * Prevents the bug where a fighter can visually remain airborne while the
 * state machine treats them as WALK/IDLE and routes attacks to grounded normals.
 */
import { describe, expect, it } from 'vitest';
import { Fighter } from '../src/entities/fighter.js';
import { defaultAttack, handleIdleWalk } from '../src/entities/stateHandlers.js';
import type { FighterCtx } from '../src/entities/stateContext.js';
import { FighterState, AttackType } from '../src/core/types.js';
import { STAGE_GROUND_Y } from '../src/core/constants.js';
import type { ResolvedInput } from '../src/input/inputResolver.js';
import type { CommandBuffer } from '../src/input/commandBuffer.js';
import type { CharacterDefinition } from '../src/characters/types.js';
import type { VFXSystem } from '../src/rendering/vfx.js';

function input(overrides: Partial<ResolvedInput> = {}): ResolvedInput {
  return {
    up: false,
    down: false,
    forward: false,
    back: false,
    buttonA: false,
    buttonB: false,
    buttonC: false,
    buttonD: false,
    throwAttack: false,
    buttonAPressed: false,
    buttonBPressed: false,
    buttonCPressed: false,
    buttonDPressed: false,
    throwAttackPressed: false,
    punchPressed: false,
    kickPressed: false,
    rollPressed: false,
    blowbackPressed: false,
    punchJustReleased: false,
    kickJustReleased: false,
    startPressed: false,
    ...overrides,
  };
}

function ctxFor(fighter: Fighter): FighterCtx {
  return {
    fighter,
    playerIndex: 0,
    cmdBuf: {} as unknown as CommandBuffer,
    vfx: {} as unknown as VFXSystem,
    projectiles: [],
    tickRef: { value: 0 },
    opponent: null,
    character: {
      stats: fighter['charStats'] ?? {
        walkSpeed: 4,
        runSpeed: 7,
        jumpVelocity: -14,
        hopVelocity: -10,
        hyperJumpVelocity: -17,
        maxHealth: 1000,
        pushWidth: 60,
        jumpForwardSpeed: 5,
      },
      routeNormal: () => null,
      routeSpecial: () => null,
      routeRekkaFollowup: () => null,
      onAttackActive: () => false,
      getRekkaChain: () => null,
    } as unknown as CharacterDefinition,
    stats: {
      walkSpeed: 4,
      runSpeed: 7,
      jumpVelocity: -14,
      hopVelocity: -10,
      hyperJumpVelocity: -17,
      maxHealth: 1000,
      pushWidth: 60,
      jumpForwardSpeed: 5,
    },
    gauge: null,
    maxMode: null,
    rekkaWindow: 0,
    counterStanceTimer: 0,
    chargeDownFrames: 0,
    wasChargingDown: false,
    wakeupBuffer: null,
    cancelSpecialBuffer: null,
    recoveryRollRequested: false,
    prevForward: false,
    prevBack: false,
    prevDown: false,
    upHoldFrames: 0,
    upWasPressed: false,
    lastForwardTick: -999,
    lastBackTick: -999,
    lastDownTick: -999,
  };
}

describe('airborne action routing', () => {
  it('routes airborne WALK state attacks as jump normals, not grounded normals', () => {
    const fighter = new Fighter(400, '#fff', 1);
    fighter.state = FighterState.WALK;
    fighter.y = STAGE_GROUND_Y - 80;

    const attack = defaultAttack(ctxFor(fighter), input({
      buttonAPressed: true,
      punchPressed: true,
    }));

    expect(attack).toBe(AttackType.JUMP_A);
  });

  it('normalizes airborne IDLE/WALK back to JUMP before walking input is applied', () => {
    const fighter = new Fighter(400, '#fff', 1);
    fighter.state = FighterState.IDLE;
    fighter.y = STAGE_GROUND_Y - 40;

    handleIdleWalk(ctxFor(fighter), input({ forward: true }));

    expect(fighter.state).toBe(FighterState.JUMP);
    expect(fighter.vx).toBe(0);
  });
});
