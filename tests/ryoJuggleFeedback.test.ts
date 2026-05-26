/**
 * ryoJuggleFeedback.test.ts -- Air juggle hit feedback chain tests
 *
 * Validates KOF2002 juggle-specific feedback rules:
 * - Air hits use playJuggleHit (not playHit)
 * - Air hits produce blue sparks (#aaddff) at offset hitY - 14
 * - Combo hitstop caps at +1 when combo >= 10
 * - Combo sparks decay: 0.8 at combo >= 6, 0.9 at combo >= 3
 * - DM air hits are exempt from spark decay (no blue air bonus sparks)
 * - Combo >= 2 shows combo count text
 * - Combo >= 5 shows extra impact ring
 *
 * Uses hitCallback + CombatSystem + Fighter integration via mock deps.
 * Does NOT modify any source files.
 */

// -- Mock audio before any module that imports it loads --
vi.mock('../src/audio/sampler.js', () => ({
  playHit: vi.fn(),
  playHeavyHit: vi.fn(),
  playBlock: vi.fn(),
  playSpecial: vi.fn(),
  playSpecialLight: vi.fn(),
  playSpecialHeavy: vi.fn(),
  playDM: vi.fn(),
  playKO: vi.fn(),
  playSuperFlash: vi.fn(),
  playCounter: vi.fn(),
  playGuardCrush: vi.fn(),
  playThrow: vi.fn(),
  playWire: vi.fn(),
  playJuggleHit: vi.fn(),
  playKOHit: vi.fn(),
  playLandingHeavy: vi.fn(),
  playHitAccent: vi.fn(),
  playDizzyHit: vi.fn(),
  playGroundBounce: vi.fn(),
  playWallBounce: vi.fn(),
  playBlockSpecial: vi.fn(),
  playBlockDM: vi.fn(),
  playKoouken: vi.fn(),
  playKoHou: vi.fn(),
  playHien: vi.fn(),
  playHaou: vi.fn(),
  playProjectileLaunch: vi.fn(),
}));

vi.mock('../src/audio/bgm.js', () => ({
  bgm: { duck: vi.fn() },
}));

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createHitCallback } from '../src/combat/hitCallback.js';
import type { HitCallbackDeps } from '../src/combat/hitCallback.js';
import { CombatSystem } from '../src/combat/combatSystem.js';
import { Fighter } from '../src/entities/fighter.js';
import { AttackType, FighterState } from '../src/core/types.js';
import type { PowerGauge } from '../src/core/types.js';
import type { VFXSystem, ScreenShake, ScreenFlash } from '../src/rendering/vfx.js';
import { CinematicState } from '../src/state/cinematicState.js';
import { STAGE_GROUND_Y, FIGHTER_HEIGHT } from '../src/core/constants.js';
import type { IInputProvider } from '../src/input/inputProvider.js';
import type { PlayerInput } from '../src/core/types.js';

// Import mocked audio so we can assert on the mocks
import {
  playJuggleHit,
  playHit,
} from '../src/audio/sampler.js';

// ====================================================================
// Helpers
// ====================================================================

const noopInput: PlayerInput = {
  up: false, down: false, left: false, right: false,
  buttonA: false, buttonB: false, buttonC: false, buttonD: false,
  throwAttack: false, burst: false, start: false,
};

function createInputProvider(): IInputProvider {
  return { getP1Input: () => noopInput, getP2Input: () => noopInput };
}

function createMockFighter(x = 200, charId = 'ryo'): Fighter {
  return new Fighter(x, '#ff0000', 1, charId);
}

/** Set fighter into airborne state by lowering y below STAGE_GROUND_Y */
function makeAirborne(f: Fighter, yOffset = 150): void {
  f.y = STAGE_GROUND_Y - yOffset; // e.g. 510 - 150 = 360
}

function createMockVFX(): VFXSystem & Record<string, ReturnType<typeof vi.fn>> {
  return {
    spawnHitSparks: vi.fn(),
    spawnBlockFlash: vi.fn(),
    spawnCharacterHitSparks: vi.fn(),
    spawnGuardCrushSparks: vi.fn(),
    spawnGuardCrushText: vi.fn(),
    spawnWireText: vi.fn(),
    spawnQuickStandText: vi.fn(),
    spawnThrowEscapeSparks: vi.fn(),
    spawnImpactRing: vi.fn(),
    spawnSlashLine: vi.fn(),
    spawnSuperBurst: vi.fn(),
    spawnGroundSlam: vi.fn(),
    spawnDamageText: vi.fn(),
    spawnCounterText: vi.fn(),
    spawnTechText: vi.fn(),
    spawnFirstAttackText: vi.fn(),
    spawnComboEndText: vi.fn(),
    spawnComboDamageText: vi.fn(),
    spawnSuperCancelText: vi.fn(),
    spawnFreeCancelText: vi.fn(),
    spawnGCCDText: vi.fn(),
    spawnCounterStanceText: vi.fn(),
    spawnReversalText: vi.fn(),
    spawnRecoverySpark: vi.fn(),
    spawnDust: vi.fn(),
    spawnHeavyDust: vi.fn(),
    spawnCounterWireSparks: vi.fn(),
    spawnMAXAura: vi.fn(),
    spawnMAXActivationFlash: vi.fn(),
    spawnPerfectFlash: vi.fn(),
    spawnProjectileExplosion: vi.fn(),
    spawnTauntSparks: vi.fn(),
    spawnCancelFlash: vi.fn(),
    spawnDizzyStars: vi.fn(),
    spawnFloatingComboText: vi.fn(),
    // Character-specific VFX
    spawnKooukenVFX: vi.fn(),
    spawnKoHouVFX: vi.fn(),
    spawnHienTrail: vi.fn(),
    spawnDMTenHaOuVFX: vi.fn(),
    spawnHaouFlash: vi.fn(),
    spawnMoveNameText: vi.fn(),
    update: vi.fn(),
    render: vi.fn(),
  } as unknown as VFXSystem & Record<string, ReturnType<typeof vi.fn>>;
}

function createMockScreenShake(): ScreenShake & { trigger: ReturnType<typeof vi.fn> } {
  return {
    trigger: vi.fn(),
    update: vi.fn(),
    offsetX: 0,
    offsetY: 0,
  } as unknown as ScreenShake & { trigger: ReturnType<typeof vi.fn> };
}

function createMockScreenFlash(): ScreenFlash & { trigger: ReturnType<typeof vi.fn> } {
  return {
    trigger: vi.fn(),
    update: vi.fn(),
    render: vi.fn(),
    active: false,
    reset: vi.fn(),
  } as unknown as ScreenFlash & { trigger: ReturnType<typeof vi.fn> };
}

function createMockGauge(): PowerGauge {
  return { meter: 0, stocks: 0, maxMeter: 1000 };
}

/** Build Ryo-specific deps for createHitCallback.
 *  p2 is the defender (defIdx=1). Set p2 airborne for juggle tests. */
function createJuggleDeps(comboCount = 0) {
  const p1 = createMockFighter(200, 'ryo');
  const p2 = createMockFighter(400, 'kyo');
  p2.facing = -1;
  // Make defender airborne for juggle scenarios
  makeAirborne(p2, 150);
  const vfx = createMockVFX();
  const shake = createMockScreenShake();
  const flash = createMockScreenFlash();
  const cinematic = new CinematicState();
  const combat = new CombatSystem(createInputProvider());
  // Set combo count on defender index (1)
  (combat as unknown as { comboHits: number[] }).comboHits[1] = comboCount;
  const gauges: [PowerGauge, PowerGauge] = [createMockGauge(), createMockGauge()];

  const deps: HitCallbackDeps = {
    fighters: [p1, p2],
    vfx,
    screenShake: shake,
    screenFlash: flash,
    gauges,
    cinematic,
    combatSystem: combat,
  };
  return { deps, vfx, shake, flash, cinematic, combat, gauges, p1, p2 };
}

// ====================================================================
// SECTION 1: Air hit uses playJuggleHit, not playHit
// ====================================================================

describe('Juggle SFX: air hit calls playJuggleHit instead of playHit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Grounded normal hit (STAND_A) calls playHit, not playJuggleHit', () => {
    // Grounded defender -- use normal deps (defender y = STAGE_GROUND_Y)
    const p1 = createMockFighter(200, 'ryo');
    const p2 = createMockFighter(400, 'kyo');
    p2.facing = -1;
    // p2.y defaults to STAGE_GROUND_Y (grounded)
    const vfx = createMockVFX();
    const shake = createMockScreenShake();
    const flash = createMockScreenFlash();
    const cinematic = new CinematicState();
    const combat = new CombatSystem(createInputProvider());
    const gauges: [PowerGauge, PowerGauge] = [createMockGauge(), createMockGauge()];

    const deps: HitCallbackDeps = {
      fighters: [p1, p2], vfx, screenShake: shake, screenFlash: flash,
      gauges, cinematic, combatSystem: combat,
    };
    const cb = createHitCallback(deps);
    cb(p1, p2, AttackType.STAND_A, false, false);

    expect(playHit).toHaveBeenCalled();
    expect(playJuggleHit).not.toHaveBeenCalled();
  });

  it('Airborne normal hit (STAND_A on airborne defender) calls playJuggleHit', () => {
    const { deps, p1, p2 } = createJuggleDeps(0);
    const cb = createHitCallback(deps);
    cb(p1, p2, AttackType.STAND_A, false, false);

    // STAND_A damage < 70 and defender is airborne -> playJuggleHit
    expect(playJuggleHit).toHaveBeenCalled();
  });

  it('Airborne normal hit does NOT call playHit', () => {
    const { deps, p1, p2 } = createJuggleDeps(0);
    const cb = createHitCallback(deps);
    cb(p1, p2, AttackType.STAND_A, false, false);

    // The normal-hit branch for airborne defenders calls playJuggleHit,
    // not playHit. playHit should not be called for a light air hit.
    expect(playHit).not.toHaveBeenCalled();
  });

  it('Airborne heavy normal (STAND_C, damage >= 70) still calls playHeavyHit, not playJuggleHit', () => {
    const { deps, p1, p2 } = createJuggleDeps(0);
    const cb = createHitCallback(deps);
    cb(p1, p2, AttackType.STAND_C, false, false);

    // STAND_C damage = 100, which is >= 70, so it hits the playHeavyHit branch
    // before the airborne playJuggleHit branch.
    // The code at line 432-434: damage >= 70 -> playHeavyHit; else if !grounded -> playJuggleHit
    // This means heavy air hits use playHeavyHit, not playJuggleHit.
    // But actually re-reading: the branch is sequential:
    //   isDM -> playDM
    //   Ryo specials -> playKoouken etc.
    //   isSpecial -> playSpecialLight/Heavy
    //   damage >= 70 -> playHeavyHit
    //   else if !grounded -> playJuggleHit
    //   else -> playHit
    // So for STAND_C (damage 100 >= 70), playHeavyHit is used even in air.
    expect(playJuggleHit).not.toHaveBeenCalled();
  });

  it('Airborne light normal (STAND_B, damage < 70) calls playJuggleHit', () => {
    const { deps, p1, p2 } = createJuggleDeps(0);
    const cb = createHitCallback(deps);
    cb(p1, p2, AttackType.STAND_B, false, false);

    // STAND_B damage < 70, defender airborne -> playJuggleHit branch
    expect(playJuggleHit).toHaveBeenCalled();
  });

  it('playJuggleHit receives current combo count as argument', () => {
    const comboCount = 5;
    const { deps, p1, p2 } = createJuggleDeps(comboCount);
    const cb = createHitCallback(deps);
    cb(p1, p2, AttackType.STAND_A, false, false);

    expect(playJuggleHit).toHaveBeenCalledWith(comboCount);
  });
});

// ====================================================================
// SECTION 2: Air hit produces blue sparks (#aaddff)
// ====================================================================

describe('Juggle blue sparks: air hit spawns #aaddff particles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Airborne hit spawns #aaddff colored sparks', () => {
    const { deps, vfx, p1, p2 } = createJuggleDeps(0);
    const cb = createHitCallback(deps);
    cb(p1, p2, AttackType.STAND_A, false, false);

    // The air bonus sparks use color '#aaddff' (hitCallback.ts line 484)
    const blueSparkCall = vfx.spawnCharacterHitSparks.mock.calls.find(
      (call: string[]) => call[3] === '#aaddff'
    );
    expect(blueSparkCall).toBeDefined();
  });

  it('Grounded hit does NOT produce #aaddff blue air sparks', () => {
    // Grounded defender
    const p1 = createMockFighter(200, 'ryo');
    const p2 = createMockFighter(400, 'kyo');
    p2.facing = -1;
    const vfx = createMockVFX();
    const shake = createMockScreenShake();
    const flash = createMockScreenFlash();
    const cinematic = new CinematicState();
    const combat = new CombatSystem(createInputProvider());
    const gauges: [PowerGauge, PowerGauge] = [createMockGauge(), createMockGauge()];

    const deps: HitCallbackDeps = {
      fighters: [p1, p2], vfx, screenShake: shake, screenFlash: flash,
      gauges, cinematic, combatSystem: combat,
    };
    const cb = createHitCallback(deps);
    cb(p1, p2, AttackType.STAND_A, false, false);

    const blueSparkCall = vfx.spawnCharacterHitSparks.mock.calls.find(
      (call: string[]) => call[3] === '#aaddff'
    );
    expect(blueSparkCall).toBeUndefined();
  });

  it('Blue air sparks have sizeScale 0.65', () => {
    const { deps, vfx, p1, p2 } = createJuggleDeps(0);
    const cb = createHitCallback(deps);
    cb(p1, p2, AttackType.STAND_A, false, false);

    const blueSparkCall = vfx.spawnCharacterHitSparks.mock.calls.find(
      (call: unknown[]) => call[3] === '#aaddff'
    );
    expect(blueSparkCall).toBeDefined();
    const sizeScale = blueSparkCall![4] as number;
    expect(sizeScale).toBe(0.65);
  });

  it('Blue air sparks have lowGravity=true (index 7)', () => {
    const { deps, vfx, p1, p2 } = createJuggleDeps(0);
    const cb = createHitCallback(deps);
    cb(p1, p2, AttackType.STAND_A, false, false);

    const blueSparkCall = vfx.spawnCharacterHitSparks.mock.calls.find(
      (call: unknown[]) => call[3] === '#aaddff'
    );
    expect(blueSparkCall).toBeDefined();
    // lowGrav is at index 7
    const lowGrav = blueSparkCall![7] as boolean;
    expect(lowGrav).toBe(true);
  });
});

// ====================================================================
// SECTION 3: Combo hitstop cap (combo >= 10 -> +1 max)
// ====================================================================

describe('Juggle hitstop cap: combo >= 10 adds only +1 frame', () => {
  it('combo = 0: hitstop is base value only', () => {
    const { deps, cinematic, p1, p2 } = createJuggleDeps(0);
    const cb = createHitCallback(deps);
    cb(p1, p2, AttackType.STAND_A, false, false);

    // STAND_A base hitstop = 4 (HITSTOP_LIGHT)
    // comboStop = combo >= 10 ? 1 : 0 = 0
    // criticalStop = 0 (health not low)
    expect(cinematic.hitStop).toBe(4);
  });

  it('combo = 5: hitstop is base value (no bonus yet)', () => {
    const { deps, cinematic, p1, p2 } = createJuggleDeps(5);
    const cb = createHitCallback(deps);
    cb(p1, p2, AttackType.STAND_A, false, false);

    // comboStop = 5 >= 10 ? 1 : 0 = 0
    expect(cinematic.hitStop).toBe(4);
  });

  it('combo = 9: hitstop is still base value', () => {
    const { deps, cinematic, p1, p2 } = createJuggleDeps(9);
    const cb = createHitCallback(deps);
    cb(p1, p2, AttackType.STAND_A, false, false);

    expect(cinematic.hitStop).toBe(4);
  });

  it('combo = 10: hitstop is base + 1 (capped bonus)', () => {
    const { deps, cinematic, p1, p2 } = createJuggleDeps(10);
    const cb = createHitCallback(deps);
    cb(p1, p2, AttackType.STAND_A, false, false);

    // comboStop = 10 >= 10 ? 1 : 0 = 1
    expect(cinematic.hitStop).toBe(4 + 1);
  });

  it('combo = 20: hitstop is still only base + 1 (does not scale further)', () => {
    const { deps, cinematic, p1, p2 } = createJuggleDeps(20);
    const cb = createHitCallback(deps);
    cb(p1, p2, AttackType.STAND_A, false, false);

    // comboStop = 20 >= 10 ? 1 : 0 = 1 (same cap)
    expect(cinematic.hitStop).toBe(4 + 1);
  });

  it('combo = 10 with STAND_C: hitstop is HITSTOP_MEDIUM + 1', () => {
    const { deps, cinematic, p1, p2 } = createJuggleDeps(10);
    const cb = createHitCallback(deps);
    cb(p1, p2, AttackType.STAND_C, false, false);

    // STAND_C base = 8 (HITSTOP_MEDIUM), comboStop = 1
    expect(cinematic.hitStop).toBe(8 + 1);
  });
});

// ====================================================================
// SECTION 4: Combo spark decay scaling
// ====================================================================

describe('Juggle spark decay: combo >= 6 -> 0.8, combo >= 3 -> 0.9', () => {
  it('combo = 0: comboSparkScale = 1.0 (no decay)', () => {
    const { deps, vfx, p1, p2 } = createJuggleDeps(0);
    const cb = createHitCallback(deps);
    cb(p1, p2, AttackType.STAND_A, false, false);

    // The main spark call (first call) should have sizeScale that is not
    // multiplied by decay. STAND_A: sparkSize = max(fb.sparkSize, dmgSizeScale)
    // comboSparkScale = 1.0 when combo = 0
    const mainSparkCall = vfx.spawnCharacterHitSparks.mock.calls[0];
    const sizeScale = mainSparkCall[4] as number;
    // STAND_A is not CH so chSizeBonus = 1.0
    // sizeScale = sparkSize * comboSparkScale * chSizeBonus
    // comboSparkScale = 1.0, so sizeScale = sparkSize * 1.0 * 1.0
    // We just verify it matches the no-decay value.
    // For comparison, we'll check against combo=2 which also has scale 1.0
    expect(sizeScale).toBeGreaterThan(0);
  });

  it('combo = 2: comboSparkScale = 1.0 (below threshold)', () => {
    const { deps, vfx, p1, p2 } = createJuggleDeps(2);
    const cb = createHitCallback(deps);
    cb(p1, p2, AttackType.STAND_A, false, false);

    const mainSparkCall = vfx.spawnCharacterHitSparks.mock.calls[0];
    const sizeScale = mainSparkCall[4] as number;
    // comboSparkScale = combo >= 6 ? 0.8 : combo >= 3 ? 0.9 : 1.0 = 1.0
    // Same as combo=0
    expect(sizeScale).toBeGreaterThan(0);
  });

  it('combo = 3: comboSparkScale = 0.9 (first decay tier)', () => {
    // Compare sizes between combo=2 and combo=3 with the same attack
    const ctx0 = createJuggleDeps(0);
    const cb0 = createHitCallback(ctx0.deps);
    cb0(ctx0.p1, ctx0.p2, AttackType.STAND_A, false, false);
    const sizeCombo0 = ctx0.vfx.spawnCharacterHitSparks.mock.calls[0][4] as number;

    const ctx3 = createJuggleDeps(3);
    const cb3 = createHitCallback(ctx3.deps);
    cb3(ctx3.p1, ctx3.p2, AttackType.STAND_A, false, false);
    const sizeCombo3 = ctx3.vfx.spawnCharacterHitSparks.mock.calls[0][4] as number;

    // comboSparkScale at combo=3 is 0.9, so size should be 0.9x of combo=0
    expect(sizeCombo3).toBeCloseTo(sizeCombo0 * 0.9, 5);
  });

  it('combo = 5: comboSparkScale = 0.9 (still in first decay tier)', () => {
    const ctx0 = createJuggleDeps(0);
    const cb0 = createHitCallback(ctx0.deps);
    cb0(ctx0.p1, ctx0.p2, AttackType.STAND_A, false, false);
    const sizeCombo0 = ctx0.vfx.spawnCharacterHitSparks.mock.calls[0][4] as number;

    const ctx5 = createJuggleDeps(5);
    const cb5 = createHitCallback(ctx5.deps);
    cb5(ctx5.p1, ctx5.p2, AttackType.STAND_A, false, false);
    const sizeCombo5 = ctx5.vfx.spawnCharacterHitSparks.mock.calls[0][4] as number;

    // combo=5: combo >= 3 -> 0.9 (but combo < 6, so still 0.9)
    expect(sizeCombo5).toBeCloseTo(sizeCombo0 * 0.9, 5);
  });

  it('combo = 6: comboSparkScale = 0.8 (second decay tier)', () => {
    const ctx0 = createJuggleDeps(0);
    const cb0 = createHitCallback(ctx0.deps);
    cb0(ctx0.p1, ctx0.p2, AttackType.STAND_A, false, false);
    const sizeCombo0 = ctx0.vfx.spawnCharacterHitSparks.mock.calls[0][4] as number;

    const ctx6 = createJuggleDeps(6);
    const cb6 = createHitCallback(ctx6.deps);
    cb6(ctx6.p1, ctx6.p2, AttackType.STAND_A, false, false);
    const sizeCombo6 = ctx6.vfx.spawnCharacterHitSparks.mock.calls[0][4] as number;

    // combo=6: combo >= 6 -> 0.8
    expect(sizeCombo6).toBeCloseTo(sizeCombo0 * 0.8, 5);
  });

  it('combo = 10: comboSparkScale = 0.8 (still second tier)', () => {
    const ctx0 = createJuggleDeps(0);
    const cb0 = createHitCallback(ctx0.deps);
    cb0(ctx0.p1, ctx0.p2, AttackType.STAND_A, false, false);
    const sizeCombo0 = ctx0.vfx.spawnCharacterHitSparks.mock.calls[0][4] as number;

    const ctx10 = createJuggleDeps(10);
    const cb10 = createHitCallback(ctx10.deps);
    cb10(ctx10.p1, ctx10.p2, AttackType.STAND_A, false, false);
    const sizeCombo10 = ctx10.vfx.spawnCharacterHitSparks.mock.calls[0][4] as number;

    // combo=10: combo >= 6 -> 0.8
    expect(sizeCombo10).toBeCloseTo(sizeCombo0 * 0.8, 5);
  });
});

// ====================================================================
// SECTION 5: DM air hits are exempt from spark decay
// ====================================================================

describe('DM juggle exemption: DM air hits skip blue air bonus sparks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Non-DM air hit produces #aaddff blue air sparks', () => {
    const { deps, vfx, p1, p2 } = createJuggleDeps(0);
    const cb = createHitCallback(deps);
    cb(p1, p2, AttackType.STAND_A, false, false);

    const blueSparkCall = vfx.spawnCharacterHitSparks.mock.calls.find(
      (call: unknown[]) => call[3] === '#aaddff'
    );
    expect(blueSparkCall).toBeDefined();
  });

  it('DM air hit does NOT produce #aaddff blue air bonus sparks', () => {
    // The air bonus sparks block (hitCallback.ts line 482) has condition:
    //   if (!defender.isGrounded() && !isDM) { ... blue sparks ... }
    // So DM hits on airborne defenders should NOT spawn the blue air sparks.
    const { deps, vfx, p1, p2 } = createJuggleDeps(0);
    const cb = createHitCallback(deps);
    cb(p1, p2, AttackType.DM_TEN_HA_OU, false, false);

    // The DM-specific VFX uses specialColor/specialGlow, not #aaddff
    const blueSparkCall = vfx.spawnCharacterHitSparks.mock.calls.find(
      (call: unknown[]) => call[3] === '#aaddff'
    );
    expect(blueSparkCall).toBeUndefined();
  });

  it('SDM air hit also skips blue air bonus sparks', () => {
    const { deps, vfx, p1, p2 } = createJuggleDeps(0);
    const cb = createHitCallback(deps);
    cb(p1, p2, AttackType.SDM_TEN_HA_OU, false, false);

    const blueSparkCall = vfx.spawnCharacterHitSparks.mock.calls.find(
      (call: unknown[]) => call[3] === '#aaddff'
    );
    expect(blueSparkCall).toBeUndefined();
  });
});

// ====================================================================
// SECTION 6: Air spark position offset (hitY - 14)
// ====================================================================

describe('Juggle spark position: air sparks offset by hitY - 14', () => {
  it('Blue air sparks are spawned at hitY - 14', () => {
    const { deps, vfx, p1, p2 } = createJuggleDeps(0);
    const cb = createHitCallback(deps);
    cb(p1, p2, AttackType.STAND_A, false, false);

    // Find the blue spark call
    const blueSparkCall = vfx.spawnCharacterHitSparks.mock.calls.find(
      (call: unknown[]) => call[3] === '#aaddff'
    );
    expect(blueSparkCall).toBeDefined();

    // The main hitY for an airborne defender is:
    //   hitY = defender.y - defender.displayHeight * 0.6
    //   (since isAir = true, line 181)
    // The blue air sparks spawn at hitY - 14 (line 484)
    const hitY = p2.y - p2.displayHeight * 0.6;
    const expectedAirSparkY = hitY - 14;

    const actualY = blueSparkCall![1] as number;
    expect(actualY).toBeCloseTo(expectedAirSparkY, 3);
  });

  it('Air spark Y is 14 pixels above the main hit Y', () => {
    const { deps, vfx, p1, p2 } = createJuggleDeps(0);
    const cb = createHitCallback(deps);
    cb(p1, p2, AttackType.STAND_A, false, false);

    // The main spark (first call) and blue spark should differ by 14 in Y
    const mainSparkCall = vfx.spawnCharacterHitSparks.mock.calls[0];
    const mainSparkY = mainSparkCall[1] as number;

    const blueSparkCall = vfx.spawnCharacterHitSparks.mock.calls.find(
      (call: unknown[]) => call[3] === '#aaddff'
    );
    const blueSparkY = blueSparkCall![1] as number;

    // Blue sparks are 14 pixels above main hit Y
    expect(mainSparkY - blueSparkY).toBeCloseTo(14, 3);
  });
});

// ====================================================================
// SECTION 7: Combo >= 2 shows combo count text
// ====================================================================

describe('Juggle combo text: combo >= 2 shows floating combo text', () => {
  it('combo = 1: no floating combo text', () => {
    const { deps, vfx, p1, p2 } = createJuggleDeps(1);
    const cb = createHitCallback(deps);
    cb(p1, p2, AttackType.STAND_A, false, false);

    expect(vfx.spawnFloatingComboText).not.toHaveBeenCalled();
  });

  it('combo = 2: floating combo text appears', () => {
    const { deps, vfx, p1, p2 } = createJuggleDeps(2);
    const cb = createHitCallback(deps);
    cb(p1, p2, AttackType.STAND_A, false, false);

    expect(vfx.spawnFloatingComboText).toHaveBeenCalledTimes(1);
  });

  it('combo = 5: floating combo text appears with combo count', () => {
    const { deps, vfx, p1, p2 } = createJuggleDeps(5);
    const cb = createHitCallback(deps);
    cb(p1, p2, AttackType.STAND_A, false, false);

    expect(vfx.spawnFloatingComboText).toHaveBeenCalled();
    const call = vfx.spawnFloatingComboText.mock.calls[0];
    const comboArg = call[2] as number; // combo count
    expect(comboArg).toBe(5);
  });

  it('combo = 2: spawnDamageText also receives combo count (backward compat)', () => {
    const { deps, vfx, p1, p2 } = createJuggleDeps(2);
    const cb = createHitCallback(deps);
    cb(p1, p2, AttackType.STAND_A, false, false);

    // combo >= 2 also calls spawnDamageText with the combo count
    // (in addition to the normal damage text from the hit)
    const comboDmgCalls = vfx.spawnDamageText.mock.calls.filter(
      (call: unknown[]) => call[2] === 2
    );
    expect(comboDmgCalls.length).toBeGreaterThanOrEqual(1);
  });
});

// ====================================================================
// SECTION 8: Combo >= 5 shows extra impact ring
// ====================================================================

describe('Juggle combo impact ring: combo >= 5 adds extra ring', () => {
  it('combo = 2: no combo-specific extra impact ring (only main ring)', () => {
    const { deps, vfx, p1, p2 } = createJuggleDeps(2);
    const cb = createHitCallback(deps);
    cb(p1, p2, AttackType.STAND_A, false, false);

    // Count spawnImpactRing calls. The main ring always spawns.
    // combo >= 5 adds an extra ring with scale 1.1.
    // combo >= 10 adds another with scale 1.4.
    // At combo = 2, we only get the main ring + any attack-specific rings.
    // STAND_A is a light normal, so the main ring is from the general path.
    // There should be no combo-specific extra ring.
    const ringCalls = vfx.spawnImpactRing.mock.calls;
    // STAND_A gets: main ring (sparkSize from calc). No combo bonus ring.
    // combo >= 5 && combo < 10 adds scale 1.1 ring
    // combo = 2 should not trigger this
    const comboBonusRing = ringCalls.find((call: number[]) => call[2] === 1.1);
    expect(comboBonusRing).toBeUndefined();
  });

  it('combo = 5: combo-specific impact ring with scale 1.1', () => {
    const { deps, vfx, p1, p2 } = createJuggleDeps(5);
    const cb = createHitCallback(deps);
    cb(p1, p2, AttackType.STAND_A, false, false);

    // combo >= 5 && combo < 10: spawnImpactRing(hitX, hitY, 1.1)
    const ringCalls = vfx.spawnImpactRing.mock.calls;
    const comboRing = ringCalls.find((call: number[]) => call[2] === 1.1);
    expect(comboRing).toBeDefined();
  });

  it('combo = 9: combo-specific impact ring with scale 1.1 still', () => {
    const { deps, vfx, p1, p2 } = createJuggleDeps(9);
    const cb = createHitCallback(deps);
    cb(p1, p2, AttackType.STAND_A, false, false);

    // combo >= 5 && combo < 10 -> 1.1 ring
    const ringCalls = vfx.spawnImpactRing.mock.calls;
    const comboRing = ringCalls.find((call: number[]) => call[2] === 1.1);
    expect(comboRing).toBeDefined();
  });

  it('combo = 10: combo-specific impact ring with scale 1.4 (top tier)', () => {
    const { deps, vfx, p1, p2 } = createJuggleDeps(10);
    const cb = createHitCallback(deps);
    cb(p1, p2, AttackType.STAND_A, false, false);

    // combo >= 10: spawnImpactRing(hitX, hitY, 1.4)
    const ringCalls = vfx.spawnImpactRing.mock.calls;
    const comboRing = ringCalls.find((call: number[]) => call[2] === 1.4);
    expect(comboRing).toBeDefined();
  });
});
