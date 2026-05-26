/**
 * Motion SFX dispatch system — footstep, jump, landing sounds
 *
 * Handles non-combat movement sounds that are tied to fighter state
 * transitions and tick-based rhythm, not to attack phases.
 *
 * This parallels updateMovementVfx() which handles the visual feedback.
 */
import { FighterState } from '../core/types.js';
import type { Fighter } from '../entities/fighter.js';
import { playFootstep, playJump, playLandingNormal } from './sampler.js';

/**
 * Per-fighter motion SFX state to avoid re-triggering sounds.
 * Indexed by fighter identity (0 = P1, 1 = P2).
 */
const lastFootstepTick = new Map<number, number>();
const wasAirborne = new Map<number, boolean>();

/**
 * Tick the motion SFX dispatch for all fighters.
 * Call once per game loop tick, AFTER fighter state updates and savePrevState().
 *
 * @param fighters  Array of fighters (typically [p1, p2])
 * @param tick      Current game tick counter
 */
export function tickMotionSFX(fighters: Fighter[], tick: number): void {
  for (let i = 0; i < fighters.length; i++) {
    const f = fighters[i];
    const fighterId = i;

    // ── Footstep SFX ──
    // RUN: footstep every 8 ticks (matches dust VFX cadence)
    if (f.state === FighterState.RUN) {
      const lastStep = lastFootstepTick.get(fighterId) ?? -999;
      if (tick - lastStep >= 8) {
        playFootstep();
        lastFootstepTick.set(fighterId, tick);
      }
    }
    // WALK: footstep every 16 ticks (matches dust VFX cadence)
    else if (f.state === FighterState.WALK) {
      const lastStep = lastFootstepTick.get(fighterId) ?? -999;
      if (tick - lastStep >= 16) {
        playFootstep();
        lastFootstepTick.set(fighterId, tick);
      }
    }
    // Reset step timer when not walking/running so the first step
    // of a new walk/run fires immediately
    else {
      lastFootstepTick.delete(fighterId);
    }

    // ── Jump SFX ──
    // Play when transitioning from ground to any airborne state
    const isAirborne = f.state === FighterState.JUMP
      || f.state === FighterState.RUN_JUMP
      || f.state === FighterState.HOP
      || f.state === FighterState.HYPER_JUMP
      || (f.state === FighterState.BACKDASH);
    const wasAir = wasAirborne.get(fighterId) ?? false;

    if (isAirborne && !wasAir) {
      // BACKDASH gets its own SFX via playRoll in main.ts, skip jump sound
      if (f.state !== FighterState.BACKDASH) {
        playJump();
      }
    }
    wasAirborne.set(fighterId, isAirborne);

    // ── Landing SFX ──
    // Play when transitioning from airborne to ground
    // (excluding attack/landing states that have their own SFX)
    if (wasAir && !isAirborne) {
      const isGroundIdle = f.state === FighterState.IDLE
        || f.state === FighterState.CROUCH
        || f.state === FighterState.WALK
        || f.state === FighterState.RUN;
      // Don't play landing SFX if entering attack/block/stun states
      // (those have their own audio feedback)
      if (isGroundIdle) {
        playLandingNormal();
      }
    }
  }
}

/** Reset motion SFX tracking (on round reset, etc.) */
export function resetMotionSFX(): void {
  lastFootstepTick.clear();
  wasAirborne.clear();
}
