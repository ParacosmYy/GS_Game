/**
 * ryoComboFeedback.test.ts -- Ryo-specific combo hit feedback chain tests
 *
 * Validates the full feedback chain (hitstop, shake, sparks, damage scaling)
 * for Ryo's attacks: normals, specials, DM, counter hit, and combo scaling.
 *
 * Uses hitCallback + CombatSystem + Fighter integration via mock deps.
 * Does NOT modify any source files.
 */

// ── Mock audio before any module that imports it loads ──
vi.mock('../src/audio/sampler.js', () => ({
  playHit: () => {},
  playHeavyHit: () => {},
  playBlock: () => {},
  playSpecial: () => {},
  playSpecialLight: () => {},
  playSpecialHeavy: () => {},
  playDM: () => {},
  playKO: () => {},
  playSuperFlash: () => {},
  playCounter: () => {},
  playGuardCrush: () => {},
  playThrow: () => {},
  playWire: () => {},
  playJuggleHit: () => {},
  playKOHit: () => {},
  playLandingHeavy: () => {},
  playHitAccent: () => {},
  playDizzyHit: () => {},
  playGroundBounce: () => {},
  playWallBounce: () => {},
  playBlockSpecial: () => {},
  playBlockDM: () => {},
}));

vi.mock('../src/audio/bgm.js', () => ({
  bgm: { duck: () => {} },
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
import {
  FRAME_DATA,
  HITSTOP_LIGHT, HITSTOP_MEDIUM, HITSTOP_SPECIAL, HITSTOP_DM, HITSTOP_SDM,
  HITSTOP_COUNTER_BONUS,
  SHAKE_LIGHT, SHAKE_HEAVY, SHAKE_SPECIAL, SHAKE_DM,
  SHAKE_DURATION_LIGHT, SHAKE_DURATION_HEAVY, SHAKE_DURATION_SPECIAL, SHAKE_DURATION_DM,
  SPARK_SIZE_LIGHT, SPARK_SIZE_HEAVY, SPARK_SIZE_SPECIAL, SPARK_SIZE_DM,
  SPARK_COUNT_LIGHT, SPARK_COUNT_SPECIAL, SPARK_COUNT_DM,
  COMBO_DAMAGE_SCALE, COMBO_MIN_SCALE, DM_COMBO_PENALTY,
} from '../src/core/constants.js';
import type { IInputProvider } from '../src/input/inputProvider.js';
import type { PlayerInput } from '../src/core/types.js';

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

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
    // Ryo-specific character VFX methods
    spawnKooukenVFX: vi.fn(),
    spawnKoHouVFX: vi.fn(),
    spawnHienTrail: vi.fn(),
    spawnDMTenHaOuVFX: vi.fn(),
    spawnHaouFlash: vi.fn(),
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

/** Build Ryo-specific deps for createHitCallback */
function createRyoDeps() {
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
    fighters: [p1, p2],
    vfx,
    screenShake: shake,
    screenFlash: flash,
    gauges,
    cinematic,
    combatSystem: combat,
  };
  return { deps, vfx, shake, flash, cinematic, combat, gauges };
}

/** Get FRAME_DATA damage for an attack type */
function getDamage(at: AttackType): number {
  return (FRAME_DATA as Record<string, { damage: number }>)[at as string]?.damage ?? 0;
}

// ═══════════════════════════════════════════════════════════════
// SECTION 1: Ryo Light Attack Feedback
// ═══════════════════════════════════════════════════════════════

describe('Ryo light attack feedback (STAND_A)', () => {
  it('STAND_A hit produces hitstop = HITSTOP_LIGHT (4 frames)', () => {
    const { deps, cinematic } = createRyoDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_A, false, false);
    expect(cinematic.hitStop).toBe(HITSTOP_LIGHT);
    expect(HITSTOP_LIGHT).toBe(4);
  });

  it('STAND_A hit produces shake intensity = SHAKE_LIGHT', () => {
    const { deps, shake } = createRyoDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_A, false, false);
    const shakeCall = shake.trigger.mock.calls[0] as [number, number, number];
    // Light attack damage = 33, which is <= 50, so shake = SHAKE_LIGHT
    expect(shakeCall[0]).toBe(SHAKE_LIGHT);
    expect(SHAKE_LIGHT).toBe(2);
  });

  it('STAND_A hit produces shake duration = SHAKE_DURATION_LIGHT (4)', () => {
    const { deps, shake } = createRyoDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_A, false, false);
    const shakeCall = shake.trigger.mock.calls[0] as [number, number, number];
    expect(shakeCall[1]).toBe(SHAKE_DURATION_LIGHT);
    expect(SHAKE_DURATION_LIGHT).toBe(4);
  });

  it('STAND_A hit spawns sparks with SPARK_SIZE_LIGHT (0.55) scale factor', () => {
    const { deps, vfx } = createRyoDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_A, false, false);
    // spawnCharacterHitSparks should have been called; check sizeScale argument
    expect(vfx.spawnCharacterHitSparks).toHaveBeenCalled();
    const firstCall = vfx.spawnCharacterHitSparks.mock.calls[0];
    // VFXSystem method signature: (worldX, worldY, count, charColor, sizeScale, speedScale, ...)
    // sizeScale is at index 4
    const sizeScale = firstCall[4] as number;
    expect(sizeScale).toBe(SPARK_SIZE_LIGHT);
    expect(SPARK_SIZE_LIGHT).toBe(0.55);
  });

  it('STAND_A combo A->A: each hit gets separate hitstop', () => {
    // First hit
    const ctx1 = createRyoDeps();
    const cb1 = createHitCallback(ctx1.deps);
    cb1(ctx1.deps.fighters[0], ctx1.deps.fighters[1], AttackType.STAND_A, false, false);
    const hitstop1 = ctx1.cinematic.hitStop;

    // Second hit (simulated as a fresh callback invocation with bumped combo count)
    const ctx2 = createRyoDeps();
    (ctx2.combat as unknown as { comboHits: number[] }).comboHits[1] = 1;
    const cb2 = createHitCallback(ctx2.deps);
    cb2(ctx2.deps.fighters[0], ctx2.deps.fighters[1], AttackType.STAND_A, false, false);
    const hitstop2 = ctx2.cinematic.hitStop;

    // Both hits should get the same base hitstop (HITSTOP_LIGHT)
    // Note: combo >= 10 adds +1, but combo=1 does not
    expect(hitstop1).toBe(HITSTOP_LIGHT);
    expect(hitstop2).toBe(HITSTOP_LIGHT);
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 2: Ryo Heavy Attack Feedback
// ═══════════════════════════════════════════════════════════════

describe('Ryo heavy attack feedback (STAND_C, CROUCH_D)', () => {
  it('STAND_C hit produces hitstop = HITSTOP_MEDIUM (8 frames)', () => {
    const { deps, cinematic } = createRyoDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_C, false, false);
    expect(cinematic.hitStop).toBe(HITSTOP_MEDIUM);
    expect(HITSTOP_MEDIUM).toBe(8);
  });

  it('STAND_C hit produces shake intensity = SHAKE_HEAVY (7)', () => {
    const { deps, shake } = createRyoDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_C, false, false);
    const shakeCall = shake.trigger.mock.calls[0] as [number, number, number];
    expect(shakeCall[0]).toBe(SHAKE_HEAVY);
    expect(SHAKE_HEAVY).toBe(7);
  });

  it('STAND_C hit produces shake duration = SHAKE_DURATION_HEAVY (6)', () => {
    const { deps, shake } = createRyoDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_C, false, false);
    const shakeCall = shake.trigger.mock.calls[0] as [number, number, number];
    expect(shakeCall[1]).toBe(SHAKE_DURATION_HEAVY);
    expect(SHAKE_DURATION_HEAVY).toBe(6);
  });

  it('STAND_C hit spawns sparks with >= SPARK_SIZE_HEAVY (0.85) scale factor', () => {
    const { deps, vfx } = createRyoDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_C, false, false);
    expect(vfx.spawnCharacterHitSparks).toHaveBeenCalled();
    const firstCall = vfx.spawnCharacterHitSparks.mock.calls[0];
    // VFXSystem method: sizeScale at index 4
    const sizeScale = firstCall[4] as number;
    // STAND_C damage=100 -> getDamageSizeScale(100) = 1.1 (since >= 100)
    // sparkSize = Math.max(SPARK_SIZE_HEAVY=0.85, dmgSizeScale=1.1) = 1.1
    // So the actual size is 1.1, which is >= SPARK_SIZE_HEAVY
    expect(sizeScale).toBeGreaterThanOrEqual(SPARK_SIZE_HEAVY);
    expect(SPARK_SIZE_HEAVY).toBe(0.85);
  });

  it('CROUCH_D sweep produces hitstop + knockdown feedback', () => {
    const { deps, cinematic, shake, vfx } = createRyoDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.CROUCH_D, false, false);
    // CROUCH_D is a heavy attack: HITSTOP_MEDIUM
    expect(cinematic.hitStop).toBe(HITSTOP_MEDIUM);
    // Heavy shake
    const shakeCall = shake.trigger.mock.calls[0] as [number, number, number];
    expect(shakeCall[0]).toBe(SHAKE_HEAVY);
    // Dust should spawn for grounded normal hit
    expect(vfx.spawnDust).toHaveBeenCalled();
    // FRAME_DATA confirms CROUCH_D has knockdown: true
    expect((FRAME_DATA as Record<string, { knockdown: boolean }>)[AttackType.CROUCH_D]?.knockdown).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 3: Ryo Special Attack Feedback
// ═══════════════════════════════════════════════════════════════

describe('Ryo special attack feedback (RYO_KOOU, RYO_KO_HOU, RYO_HIEN, RYO_HAOU)', () => {
  it('RYO_KOOU (projectile) hitstop = HITSTOP_SPECIAL (13 frames)', () => {
    const { deps, cinematic } = createRyoDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.RYO_KOOU, false, false);
    expect(cinematic.hitStop).toBe(HITSTOP_SPECIAL);
    expect(HITSTOP_SPECIAL).toBe(13);
  });

  it('RYO_KOOU shake intensity = SHAKE_SPECIAL (8)', () => {
    const { deps, shake } = createRyoDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.RYO_KOOU, false, false);
    const shakeCall = shake.trigger.mock.calls[0] as [number, number, number];
    expect(shakeCall[0]).toBe(SHAKE_SPECIAL);
    expect(SHAKE_SPECIAL).toBe(8);
  });

  it('RYO_KO_HOU (uppercut) hitstop = HITSTOP_SPECIAL (13 frames)', () => {
    const { deps, cinematic } = createRyoDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.RYO_KO_HOU, false, false);
    expect(cinematic.hitStop).toBe(HITSTOP_SPECIAL);
  });

  it('RYO_KO_HOU spawns sparks with SPARK_SIZE_SPECIAL (1.1) scale factor', () => {
    const { deps, vfx } = createRyoDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.RYO_KO_HOU, false, false);
    expect(vfx.spawnCharacterHitSparks).toHaveBeenCalled();
    const firstCall = vfx.spawnCharacterHitSparks.mock.calls[0];
    // VFXSystem method: sizeScale at index 4
    const sizeScale = firstCall[4] as number;
    expect(sizeScale).toBe(SPARK_SIZE_SPECIAL);
    expect(SPARK_SIZE_SPECIAL).toBe(1.1);
  });

  it('RYO_HIEN (flying kick) hitstop >= HITSTOP_SPECIAL', () => {
    const { deps, cinematic } = createRyoDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.RYO_HIEN, false, false);
    // RYO_HIEN gets base HITSTOP_SPECIAL + 2 bonus from addHitStop
    expect(cinematic.hitStop).toBeGreaterThanOrEqual(HITSTOP_SPECIAL);
  });

  it('RYO_HIEN spawns special-tier sparks (sizeScale >= SPARK_SIZE_SPECIAL)', () => {
    const { deps, vfx } = createRyoDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.RYO_HIEN, false, false);
    expect(vfx.spawnCharacterHitSparks).toHaveBeenCalled();
    const firstCall = vfx.spawnCharacterHitSparks.mock.calls[0];
    // VFXSystem method: sizeScale at index 4
    const sizeScale = firstCall[4] as number;
    expect(sizeScale).toBeGreaterThanOrEqual(SPARK_SIZE_SPECIAL);
  });

  it('RYO_HAOU (counter move) hitstop >= HITSTOP_SPECIAL', () => {
    const { deps, cinematic } = createRyoDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.RYO_HAOU, false, false);
    // RYO_HAOU gets base HITSTOP_SPECIAL + 2 bonus from addHitStop
    expect(cinematic.hitStop).toBeGreaterThanOrEqual(HITSTOP_SPECIAL);
  });

  it('RYO_HAOU on counter hit gets +HITSTOP_COUNTER_BONUS frames', () => {
    const ctx1 = createRyoDeps();
    const cb1 = createHitCallback(ctx1.deps);
    cb1(ctx1.deps.fighters[0], ctx1.deps.fighters[1], AttackType.RYO_HAOU, false, false);
    const normalStop = ctx1.cinematic.hitStop;

    const ctx2 = createRyoDeps();
    const cb2 = createHitCallback(ctx2.deps);
    cb2(ctx2.deps.fighters[0], ctx2.deps.fighters[1], AttackType.RYO_HAOU, false, true);
    const chStop = ctx2.cinematic.hitStop;

    expect(chStop).toBe(normalStop + HITSTOP_COUNTER_BONUS);
    expect(HITSTOP_COUNTER_BONUS).toBe(3);
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 4: Ryo DM Feedback
// ═══════════════════════════════════════════════════════════════

describe('Ryo DM feedback (DM_TEN_HA_OU)', () => {
  it('DM_TEN_HA_OU hitstop = HITSTOP_DM (19 frames)', () => {
    const { deps, cinematic } = createRyoDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.DM_TEN_HA_OU, false, false);
    expect(cinematic.hitStop).toBe(HITSTOP_DM);
    expect(HITSTOP_DM).toBe(19);
  });

  it('DM_TEN_HA_OU shake intensity = SHAKE_DM (14)', () => {
    const { deps, shake } = createRyoDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.DM_TEN_HA_OU, false, false);
    const shakeCall = shake.trigger.mock.calls[0] as [number, number, number];
    expect(shakeCall[0]).toBe(SHAKE_DM);
    expect(SHAKE_DM).toBe(14);
  });

  it('DM_TEN_HA_OU shake duration includes SHAKE_DURATION_DM (16) in one of the calls', () => {
    const { deps, shake } = createRyoDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.DM_TEN_HA_OU, false, false);
    // DM_TEN_HA_OU triggers multiple shake calls:
    // 1) DM-specific: trigger(14, 14, bias) at line 311
    // 2) General shake: trigger(calcShake, SHAKE_DURATION_DM, bias) at line 435
    const durations = shake.trigger.mock.calls.map((c: number[]) => c[1]);
    expect(durations).toContain(SHAKE_DURATION_DM);
    expect(SHAKE_DURATION_DM).toBe(16);
  });

  it('DM_TEN_HA_OU spawns sparks with DM-tier scale (>= SPARK_SIZE_DM = 1.3)', () => {
    const { deps, vfx } = createRyoDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.DM_TEN_HA_OU, false, false);
    expect(vfx.spawnCharacterHitSparks).toHaveBeenCalled();
    const firstCall = vfx.spawnCharacterHitSparks.mock.calls[0];
    // VFXSystem method: sizeScale at index 4
    const sizeScale = firstCall[4] as number;
    // DM gets SPARK_SIZE_DM = 1.3, but damage=200 pushes dmgSizeScale to 1.7
    // The code takes max(typeSizeScale, dmgSizeScale) so actual may be >= 1.3
    expect(sizeScale).toBeGreaterThanOrEqual(SPARK_SIZE_DM);
    expect(SPARK_SIZE_DM).toBe(1.3);
  });

  it('DM_TEN_HA_OU triggers screen flash', () => {
    const { deps, flash } = createRyoDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.DM_TEN_HA_OU, false, false);
    // DM should trigger screen flash (at least one flash.trigger call)
    expect(flash.trigger.mock.calls.length).toBeGreaterThanOrEqual(1);
    // Check for the DM-specific flash color '#fffde8'
    const dmFlashCall = flash.trigger.mock.calls.find((c: string[]) => c[0] === '#fffde8');
    expect(dmFlashCall).toBeDefined();
  });

  it('DM_TEN_HA_OU spawns super burst VFX', () => {
    const { deps, vfx } = createRyoDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.DM_TEN_HA_OU, false, false);
    expect(vfx.spawnSuperBurst).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 5: Ryo DM in MAX mode (SDM tier)
// ═══════════════════════════════════════════════════════════════

describe('Ryo DM in MAX mode (SDM_TEN_HA_OU)', () => {
  it('SDM_TEN_HA_OU hitstop = HITSTOP_SDM (22 frames)', () => {
    const { deps, cinematic } = createRyoDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.SDM_TEN_HA_OU, false, false);
    expect(cinematic.hitStop).toBe(HITSTOP_SDM);
    expect(HITSTOP_SDM).toBe(22);
  });

  it('SDM_TEN_HA_OU triggers SDM-specific screen flash (#ffdd44)', () => {
    const { deps, flash } = createRyoDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.SDM_TEN_HA_OU, false, false);
    // SDM triggers the '#ffdd44' full-screen flash from the isSDM path
    const sdmBrightFlash = flash.trigger.mock.calls.find((c: string[]) => c[0] === '#ffdd44');
    expect(sdmBrightFlash).toBeDefined();
  });

  it('SDM_TEN_HA_OU spawns super burst with isSDM=true', () => {
    const { deps, vfx } = createRyoDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.SDM_TEN_HA_OU, false, false);
    expect(vfx.spawnSuperBurst).toHaveBeenCalled();
    // Last arg should be true for SDM
    const superBurstCall = vfx.spawnSuperBurst.mock.calls[0];
    const isSDM = superBurstCall[4] as boolean;
    expect(isSDM).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 6: Ryo Combo Scaling Feedback
// ═══════════════════════════════════════════════════════════════

describe('Ryo combo scaling feedback', () => {
  it('2-hit combo (A->C): damage scales correctly at 100% (no scaling until combo hits > 3)', () => {
    // COMBO_DAMAGE_SCALE tiers: { 3: 1.0, 6: 0.85, 9: 0.70 }
    // comboHits[defIdx] counts from 0. When comboHits = 0 (first hit), scale = 1.0
    // When comboHits = 1 (second hit), comboHits <= 3 -> scale = 1.0
    const combat = new CombatSystem(createInputProvider());
    // Simulate 1 prior hit (comboHits = 1, which is the second hit in a combo)
    (combat as unknown as { comboHits: number[] }).comboHits[1] = 1;

    // scaledDamage for STAND_C (damage=100) at comboHits=1
    // scale = COMBO_DAMAGE_SCALE[3] = 1.0 since comboHits(1) <= 3
    const damage = (combat as unknown as { scaledDamage: (d: number, i: number, at?: AttackType) => number })
      .scaledDamage(100, 1, AttackType.STAND_C);
    expect(damage).toBe(100); // 100% scale
  });

  it('5-hit combo: damage scales to 85% (tier COMBO_DAMAGE_SCALE[6])', () => {
    const combat = new CombatSystem(createInputProvider());
    // comboHits = 5 (6th hit): 5 <= 6 -> scale = COMBO_DAMAGE_SCALE[6] = 0.85
    (combat as unknown as { comboHits: number[] }).comboHits[1] = 5;

    const damage = (combat as unknown as { scaledDamage: (d: number, i: number, at?: AttackType) => number })
      .scaledDamage(100, 1, AttackType.STAND_C);
    expect(damage).toBe(85); // 100 * 0.85
  });

  it('10-hit combo: damage scales to COMBO_MIN_SCALE (60%) minimum', () => {
    const combat = new CombatSystem(createInputProvider());
    // comboHits = 10: exceeds all thresholds -> scale = COMBO_MIN_SCALE = 0.60
    (combat as unknown as { comboHits: number[] }).comboHits[1] = 10;

    const damage = (combat as unknown as { scaledDamage: (d: number, i: number, at?: AttackType) => number })
      .scaledDamage(100, 1, AttackType.STAND_C);
    expect(damage).toBe(60); // 100 * 0.60
    expect(COMBO_MIN_SCALE).toBe(0.60);
  });

  it('Hitstop per hit remains constant regardless of combo count', () => {
    // hitstop is determined by attack type + counter hit, NOT combo count
    // (combo >= 10 adds +1 frame, but the base remains the same)
    const ctx1 = createRyoDeps();
    const cb1 = createHitCallback(ctx1.deps);
    cb1(ctx1.deps.fighters[0], ctx1.deps.fighters[1], AttackType.STAND_A, false, false);
    const hitstopCombo0 = ctx1.cinematic.hitStop;

    const ctx2 = createRyoDeps();
    (ctx2.combat as unknown as { comboHits: number[] }).comboHits[1] = 5;
    const cb2 = createHitCallback(ctx2.deps);
    cb2(ctx2.deps.fighters[0], ctx2.deps.fighters[1], AttackType.STAND_A, false, false);
    const hitstopCombo5 = ctx2.cinematic.hitStop;

    // combo=0 -> base = HITSTOP_LIGHT, combo=5 -> base = HITSTOP_LIGHT (no bonus until combo>=10)
    expect(hitstopCombo0).toBe(hitstopCombo5);
    expect(hitstopCombo0).toBe(HITSTOP_LIGHT);
  });

  it('Shake per hit stays constant for the same attack type', () => {
    // Shake may decay with combo count (comboShakeDecay), but the base intensity is the same
    const ctx1 = createRyoDeps();
    const cb1 = createHitCallback(ctx1.deps);
    cb1(ctx1.deps.fighters[0], ctx1.deps.fighters[1], AttackType.STAND_C, false, false);
    const shake1 = ctx1.shake.trigger.mock.calls[0] as [number, number, number];

    // With combo = 3, shake decays to max(0.6, 1 - 3*0.05) = 0.85
    const ctx2 = createRyoDeps();
    (ctx2.combat as unknown as { comboHits: number[] }).comboHits[1] = 3;
    const cb2 = createHitCallback(ctx2.deps);
    cb2(ctx2.deps.fighters[0], ctx2.deps.fighters[1], AttackType.STAND_C, false, false);
    const shake2 = ctx2.shake.trigger.mock.calls[0] as [number, number, number];

    // Base intensity is SHAKE_HEAVY for both; combo>=3 applies decay
    // ctx1: combo=0, no decay -> round(SHAKE_HEAVY * 1.0) = 7
    // ctx2: combo=3, decay -> round(SHAKE_HEAVY * 0.85) = 6
    expect(shake1[0]).toBe(SHAKE_HEAVY);
    expect(shake2[0]).toBeLessThan(shake1[0]); // decayed
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 7: Counter Hit Feedback for Ryo
// ═══════════════════════════════════════════════════════════════

describe('Ryo counter hit feedback', () => {
  it('Counter hit on STAND_C adds +3 hitstop frames', () => {
    const ctx1 = createRyoDeps();
    const cb1 = createHitCallback(ctx1.deps);
    cb1(ctx1.deps.fighters[0], ctx1.deps.fighters[1], AttackType.STAND_C, false, false);
    const normalStop = ctx1.cinematic.hitStop;

    const ctx2 = createRyoDeps();
    const cb2 = createHitCallback(ctx2.deps);
    cb2(ctx2.deps.fighters[0], ctx2.deps.fighters[1], AttackType.STAND_C, false, true);
    const chStop = ctx2.cinematic.hitStop;

    expect(chStop).toBe(normalStop + HITSTOP_COUNTER_BONUS);
    expect(normalStop).toBe(HITSTOP_MEDIUM);
    expect(chStop).toBe(HITSTOP_MEDIUM + HITSTOP_COUNTER_BONUS);
  });

  it('Counter hit spawns COUNTER text VFX', () => {
    const { deps, vfx } = createRyoDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_C, false, true);
    expect(vfx.spawnCounterText).toHaveBeenCalled();
  });

  it('Counter hit triggers orange screen flash (#ff8800)', () => {
    const { deps, flash } = createRyoDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_A, false, true);
    const chFlashCall = flash.trigger.mock.calls.find((c: string[]) => c[0] === '#ff8800');
    expect(chFlashCall).toBeDefined();
  });

  it('Counter hit with CH increases spark size bonus (2x multiplier)', () => {
    const ctx1 = createRyoDeps();
    const cb1 = createHitCallback(ctx1.deps);
    cb1(ctx1.deps.fighters[0], ctx1.deps.fighters[1], AttackType.STAND_C, false, false);
    const normalSpark = ctx1.vfx.spawnCharacterHitSparks.mock.calls[0];
    const normalSize = normalSpark[4] as number; // sizeScale at index 4

    const ctx2 = createRyoDeps();
    const cb2 = createHitCallback(ctx2.deps);
    cb2(ctx2.deps.fighters[0], ctx2.deps.fighters[1], AttackType.STAND_C, false, true);
    // First spawnCharacterHitSparks call in CH path includes chSizeBonus=2.0
    const chSpark = ctx2.vfx.spawnCharacterHitSparks.mock.calls[0];
    const chSize = chSpark[4] as number; // sizeScale at index 4

    // CH multiplies size by 2.0
    expect(chSize).toBeCloseTo(normalSize * 2.0, 5);
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 8: Counter Wire Feedback (CD attacks)
// ═══════════════════════════════════════════════════════════════

describe('Counter Wire / CD wall bounce feedback', () => {
  it('CD attack (STAND_CD) has counterWire property in FRAME_DATA', () => {
    const cdData = (FRAME_DATA as Record<string, { counterWire?: boolean }>)[AttackType.STAND_CD];
    expect(cdData?.counterWire).toBe(true);
  });

  it('STAND_CD hit spawns extra sparks for blowback effect', () => {
    const { deps, vfx } = createRyoDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_CD, false, false);
    // STAND_CD triggers CD-specific extra sparks (spawnCharacterHitSparks called multiple times)
    expect(vfx.spawnCharacterHitSparks.mock.calls.length).toBeGreaterThanOrEqual(2);
    // Screen flash for CD
    expect(deps.screenFlash.trigger).toHaveBeenCalled();
  });

  it('Counter hit on a counterWire move spawns WIRE text', () => {
    // STAND_CD has counterWire: true. On counter hit, it should trigger wire VFX.
    const { deps, vfx } = createRyoDeps();
    // Simulate counterWire by manually setting defender state
    deps.fighters[1].isCounterWire = true;
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_CD, false, true);
    // Counter hit + counterWire data should spawn wire text
    expect(vfx.spawnWireText).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 9: Ryo FRAME_DATA completeness validation
// ═══════════════════════════════════════════════════════════════

describe('Ryo FRAME_DATA completeness for feedback chain', () => {
  it('RYO_KOOU has valid damage for spark tier classification', () => {
    const data = (FRAME_DATA as Record<string, { damage: number }>)[AttackType.RYO_KOOU];
    expect(data?.damage).toBe(75);
  });

  it('RYO_KO_HOU has valid damage for spark tier classification', () => {
    const data = (FRAME_DATA as Record<string, { damage: number }>)[AttackType.RYO_KO_HOU];
    expect(data?.damage).toBe(80);
  });

  it('RYO_HIEN has valid damage for spark tier classification', () => {
    const data = (FRAME_DATA as Record<string, { damage: number }>)[AttackType.RYO_HIEN];
    expect(data?.damage).toBe(95);
  });

  it('RYO_KOOU_C has valid damage for heavy spark tier', () => {
    const data = (FRAME_DATA as Record<string, { damage: number }>)[AttackType.RYO_KOOU_C];
    expect(data?.damage).toBe(105);
  });

  it('DM_TEN_HA_OU has damage 200 which qualifies for DM tier feedback', () => {
    const data = (FRAME_DATA as Record<string, { damage: number }>)[AttackType.DM_TEN_HA_OU];
    expect(data?.damage).toBe(200);
  });

  it('SDM_TEN_HA_OU has damage 280 which qualifies for SDM tier feedback', () => {
    const data = (FRAME_DATA as Record<string, { damage: number }>)[AttackType.SDM_TEN_HA_OU];
    expect(data?.damage).toBe(280);
  });
});
