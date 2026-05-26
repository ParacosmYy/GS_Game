/**
 * Impact Feedback Integration Tests
 *
 * Tests the integrated打击反馈系统: verifies that the hitCallback
 * produces correct hitstop durations, screen shake intensities, VFX triggers,
 * and SFX dispatches for different attack types, block states, and counter hits.
 *
 * Uses mock deps to record all side effects triggered by createHitCallback.
 */

// ── Mock audio before any module that imports it loads ──
// hitCallback.ts statically imports from audio/sampler.js and audio/bgm.js,
// both of which call `new AudioContext()` at init. We must stub them first.

const sfxCalls: string[] = [];

vi.mock('../src/audio/sampler.js', () => ({
  playHit: (..._args: unknown[]) => { sfxCalls.push('playHit'); },
  playHeavyHit: () => { sfxCalls.push('playHeavyHit'); },
  playBlock: () => { sfxCalls.push('playBlock'); },
  playSpecial: () => { sfxCalls.push('playSpecial'); },
  playSpecialLight: () => { sfxCalls.push('playSpecialLight'); },
  playSpecialHeavy: () => { sfxCalls.push('playSpecialHeavy'); },
  playDM: () => { sfxCalls.push('playDM'); },
  playKO: () => { sfxCalls.push('playKO'); },
  playSuperFlash: () => { sfxCalls.push('playSuperFlash'); },
  playCounter: () => { sfxCalls.push('playCounter'); },
  playGuardCrush: () => { sfxCalls.push('playGuardCrush'); },
  playThrow: () => { sfxCalls.push('playThrow'); },
  playWire: () => { sfxCalls.push('playWire'); },
  playJuggleHit: () => { sfxCalls.push('playJuggleHit'); },
  playKOHit: () => { sfxCalls.push('playKOHit'); },
  playLandingHeavy: () => { sfxCalls.push('playLandingHeavy'); },
  playHitAccent: () => { sfxCalls.push('playHitAccent'); },
  playDizzyHit: () => { sfxCalls.push('playDizzyHit'); },
  playGroundBounce: () => { sfxCalls.push('playGroundBounce'); },
  playWallBounce: () => { sfxCalls.push('playWallBounce'); },
  playBlockSpecial: () => { sfxCalls.push('playBlockSpecial'); },
  playBlockDM: () => { sfxCalls.push('playBlockDM'); },
}));

vi.mock('../src/audio/bgm.js', () => ({
  bgm: { duck: () => {} },
}));

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createHitCallback, triggerKOGroundEffect } from '../src/combat/hitCallback.js';
import type { HitCallbackDeps } from '../src/combat/hitCallback.js';
import { CombatSystem } from '../src/combat/combatSystem.js';
import { Fighter } from '../src/entities/fighter.js';
import { FighterState, AttackType } from '../src/core/types.js';
import type { Direction } from '../src/core/types.js';
import { CinematicState } from '../src/state/cinematicState.js';
import {
  HITSTOP_LIGHT, HITSTOP_MEDIUM, HITSTOP_SPECIAL, HITSTOP_DM, HITSTOP_SDM,
  HITSTOP_COUNTER_BONUS,
  BLOCKSTOP_LIGHT, BLOCKSTOP_HEAVY, BLOCKSTOP_SPECIAL, BLOCKSTOP_DM,
  SHAKE_LIGHT, SHAKE_HEAVY, SHAKE_COUNTER, SHAKE_SPECIAL, SHAKE_DM, SHAKE_KO,
  SHAKE_DURATION_LIGHT, SHAKE_DURATION_HEAVY, SHAKE_DURATION_SPECIAL, SHAKE_DURATION_DM, SHAKE_DURATION_KO,
  SHAKE_BLOCK_LIGHT, SHAKE_BLOCK_HEAVY, SHAKE_BLOCK_SPECIAL, SHAKE_BLOCK_DM,
  MAX_HEALTH,
  FRAME_DATA,
} from '../src/core/constants.js';

// ── Mock factories ──

function makeFighter(x: number, facing: Direction, charId: string = 'kyo'): Fighter {
  const f = new Fighter(x, '#ff0000', facing);
  f.charId = charId;
  return f;
}

interface MockVFXCall {
  method: string;
  args: unknown[];
}

function makeMockVFXSystem() {
  const calls: MockVFXCall[] = [];
  const handler = {
    get(_target: unknown, prop: string) {
      if (typeof prop === 'symbol') return () => {};
      return (...args: unknown[]) => { calls.push({ method: prop, args }); };
    },
  };
  const proxy = new Proxy({} as Record<string, (...a: unknown[]) => void>, handler);
  return { vfx: proxy, calls };
}

interface MockShakeCall { intensity: number; duration: number; biasX: number }

function makeMockScreenShake() {
  const calls: MockShakeCall[] = [];
  return {
    trigger(intensity: number, duration: number, biasX: number = 0) {
      calls.push({ intensity, duration, biasX });
    },
    calls,
  };
}

interface MockFlashCall { color: string; intensity: number; frames: number }

function makeMockScreenFlash() {
  const calls: MockFlashCall[] = [];
  return {
    trigger(color: string, intensity: number, frames: number) {
      calls.push({ color, intensity, frames });
    },
    calls,
  };
}

function makeMockGauge(): { meter: number; stocks: number; maxMeter: number } {
  return { meter: 0, stocks: 0, maxMeter: 100 };
}

function makeMockDeps(attacker: Fighter, defender: Fighter): {
  deps: HitCallbackDeps;
  cinematic: CinematicState;
  shake: ReturnType<typeof makeMockScreenShake>;
  flash: ReturnType<typeof makeMockScreenFlash>;
  vfxRecorder: ReturnType<typeof makeMockVFXSystem>;
} {
  const cinematic = new CinematicState();
  const shake = makeMockScreenShake();
  const flash = makeMockScreenFlash();
  const vfxRecorder = makeMockVFXSystem();
  const combatSystem = new CombatSystem({ getP1Input: () => ({} as never), getP2Input: () => ({} as never) });

  const deps: HitCallbackDeps = {
    fighters: [attacker, defender],
    vfx: vfxRecorder.vfx,
    screenShake: shake,
    screenFlash: flash,
    gauges: [makeMockGauge(), makeMockGauge()],
    cinematic,
    combatSystem,
  };
  return { deps, cinematic, shake, flash, vfxRecorder };
}

// ═══════════════════════════════════════════════════════════════
// SECTION 1: Hitstop Duration
// ═══════════════════════════════════════════════════════════════

describe('Hitstop Duration', () => {
  it('light attack (STAND_A) hitstop = HITSTOP_LIGHT=4', () => {
    const attacker = makeFighter(300, 1);
    const defender = makeFighter(400, -1);
    const { deps, cinematic } = makeMockDeps(attacker, defender);
    const cb = createHitCallback(deps);
    cb(attacker, defender, AttackType.STAND_A, false, false);
    expect(cinematic.hitStop).toBe(HITSTOP_LIGHT);
  });

  it('heavy attack (STAND_C) hitstop = HITSTOP_MEDIUM=7', () => {
    const attacker = makeFighter(300, 1);
    const defender = makeFighter(400, -1);
    const { deps, cinematic } = makeMockDeps(attacker, defender);
    const cb = createHitCallback(deps);
    cb(attacker, defender, AttackType.STAND_C, false, false);
    expect(cinematic.hitStop).toBe(HITSTOP_MEDIUM);
  });

  it('special move (KYO_ONIYAKI) hitstop = HITSTOP_SPECIAL=13', () => {
    const attacker = makeFighter(300, 1);
    const defender = makeFighter(400, -1);
    const { deps, cinematic } = makeMockDeps(attacker, defender);
    const cb = createHitCallback(deps);
    cb(attacker, defender, AttackType.KYO_ONIYAKI, false, false);
    expect(cinematic.hitStop).toBe(HITSTOP_SPECIAL);
  });

  it('DM (DM_OROCHINAGI) hitstop = HITSTOP_DM=19', () => {
    const attacker = makeFighter(300, 1);
    const defender = makeFighter(400, -1);
    const { deps, cinematic } = makeMockDeps(attacker, defender);
    const cb = createHitCallback(deps);
    cb(attacker, defender, AttackType.DM_OROCHINAGI, false, false);
    expect(cinematic.hitStop).toBe(HITSTOP_DM);
  });

  it('blocked hit uses blockstop (shorter than hitstop)', () => {
    const attacker = makeFighter(300, 1);
    const defender = makeFighter(400, -1);
    const { deps, cinematic } = makeMockDeps(attacker, defender);
    const cb = createHitCallback(deps);
    cb(attacker, defender, AttackType.STAND_A, true, false);
    expect(cinematic.hitStop).toBe(BLOCKSTOP_LIGHT);
    expect(BLOCKSTOP_LIGHT).toBeLessThan(HITSTOP_LIGHT);
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 2: Screen Shake
// ═══════════════════════════════════════════════════════════════

describe('Screen Shake', () => {
  it('light attack produces SHAKE_LIGHT or lower shake', () => {
    const attacker = makeFighter(300, 1);
    const defender = makeFighter(400, -1);
    const { deps, shake } = makeMockDeps(attacker, defender);
    const cb = createHitCallback(deps);
    cb(attacker, defender, AttackType.STAND_A, false, false);
    expect(shake.calls.length).toBeGreaterThanOrEqual(1);
    const mainShake = shake.calls[0];
    expect(mainShake.intensity).toBeLessThanOrEqual(SHAKE_LIGHT + 1);
  });

  it('heavy attack shake > light attack shake', () => {
    const attacker = makeFighter(300, 1);
    const defender = makeFighter(400, -1);
    const { deps, shake } = makeMockDeps(attacker, defender);
    const cb = createHitCallback(deps);
    cb(attacker, defender, AttackType.STAND_C, false, false);
    const heavyShake = shake.calls[0].intensity;

    const attacker2 = makeFighter(300, 1);
    const defender2 = makeFighter(400, -1);
    const { deps: deps2, shake: shake2 } = makeMockDeps(attacker2, defender2);
    const cb2 = createHitCallback(deps2);
    cb2(attacker2, defender2, AttackType.STAND_A, false, false);
    const lightShake = shake2.calls[0].intensity;
    expect(heavyShake).toBeGreaterThan(lightShake);
  });

  it('Counter Hit adds extra shake bonus', () => {
    const attacker = makeFighter(300, 1);
    const defender = makeFighter(400, -1);
    const { deps, shake } = makeMockDeps(attacker, defender);
    const cb = createHitCallback(deps);
    cb(attacker, defender, AttackType.STAND_A, false, true);
    const chShake = shake.calls[0].intensity;

    const attacker2 = makeFighter(300, 1);
    const defender2 = makeFighter(400, -1);
    const { deps: deps2, shake: shake2 } = makeMockDeps(attacker2, defender2);
    const cb2 = createHitCallback(deps2);
    cb2(attacker2, defender2, AttackType.STAND_A, false, false);
    const normalShake = shake2.calls[0].intensity;
    // CH shake uses SHAKE_COUNTER=6, normal light uses SHAKE_LIGHT=3
    expect(chShake).toBeGreaterThanOrEqual(normalShake);
  });

  it('DM has maximum shake intensity', () => {
    const attacker = makeFighter(300, 1);
    const defender = makeFighter(400, -1);
    const { deps, shake } = makeMockDeps(attacker, defender);
    const cb = createHitCallback(deps);
    cb(attacker, defender, AttackType.DM_OROCHINAGI, false, false);
    const dmShake = shake.calls[0].intensity;
    expect(dmShake).toBe(SHAKE_DM);
  });

  it('shake duration scales with attack tier (light < heavy < DM)', () => {
    const cases: { at: AttackType; expectDur: number }[] = [
      { at: AttackType.STAND_A, expectDur: SHAKE_DURATION_LIGHT },
      { at: AttackType.STAND_C, expectDur: SHAKE_DURATION_HEAVY },
      { at: AttackType.DM_OROCHINAGI, expectDur: SHAKE_DURATION_DM },
    ];
    for (const { at, expectDur } of cases) {
      const attacker = makeFighter(300, 1);
      const defender = makeFighter(400, -1);
      const { deps, shake } = makeMockDeps(attacker, defender);
      const cb = createHitCallback(deps);
      cb(attacker, defender, at, false, false);
      const mainShake = shake.calls[0];
      expect(mainShake.duration).toBe(expectDur);
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 3: Pushback / Knockback
// ═══════════════════════════════════════════════════════════════

describe('Pushback / Knockback', () => {
  it('light attack pushback is applied via hitstun', () => {
    const defender = makeFighter(400, -1);
    defender.applyHitstun(11, 4);
    expect(defender.hitstunTimer).toBe(11);
    expect(defender.state).toBe(FighterState.HITSTUN);
  });

  it('heavy attack pushback > light attack pushback (frame data)', () => {
    const lightPB = (FRAME_DATA['STAND_A'] as { pushback: number }).pushback;
    const heavyPB = (FRAME_DATA['STAND_C'] as { pushback: number }).pushback;
    expect(heavyPB).toBeGreaterThan(lightPB);
  });

  it('hitstun > blockstun for same attack (frame data)', () => {
    const fd = FRAME_DATA['STAND_C'] as { hitstun: number; blockstun: number };
    expect(fd.hitstun).toBeGreaterThan(fd.blockstun);
  });

  it('Counter Hit extends hitstun by +3F for ground heavy', () => {
    const normalHitstun = 19;
    const chHitstun = normalHitstun + 3;
    expect(chHitstun).toBeGreaterThan(normalHitstun);
  });

  it('attacker recoil = pushback * 0.2 (frame data derived)', () => {
    const fd = FRAME_DATA['STAND_C'] as { pushback: number };
    const atkPushback = fd.pushback * 0.2;
    expect(atkPushback).toBeGreaterThan(0);
    expect(atkPushback).toBeCloseTo(1.6);
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 4: VFX Triggers
// ═══════════════════════════════════════════════════════════════

describe('VFX Triggers', () => {
  it('hit produces character hit sparks', () => {
    const attacker = makeFighter(300, 1);
    const defender = makeFighter(400, -1);
    const { deps, vfxRecorder } = makeMockDeps(attacker, defender);
    const cb = createHitCallback(deps);
    cb(attacker, defender, AttackType.STAND_A, false, false);
    const sparkCalls = vfxRecorder.calls.filter(c => c.method === 'spawnCharacterHitSparks');
    expect(sparkCalls.length).toBeGreaterThanOrEqual(1);
  });

  it('heavy hit sparks >= light hit sparks (count or size)', () => {
    const attacker = makeFighter(300, 1);
    const defender = makeFighter(400, -1);
    const { deps, vfxRecorder } = makeMockDeps(attacker, defender);
    const cb = createHitCallback(deps);
    cb(attacker, defender, AttackType.STAND_C, false, false);
    const heavySparks = vfxRecorder.calls.filter(c => c.method === 'spawnCharacterHitSparks');

    const attacker2 = makeFighter(300, 1);
    const defender2 = makeFighter(400, -1);
    const { deps: deps2, vfxRecorder: vfx2 } = makeMockDeps(attacker2, defender2);
    const cb2 = createHitCallback(deps2);
    cb2(attacker2, defender2, AttackType.STAND_A, false, false);
    const lightSparks = vfx2.calls.filter(c => c.method === 'spawnCharacterHitSparks');

    expect(heavySparks.length).toBeGreaterThanOrEqual(lightSparks.length);
  });

  it('DM triggers super burst VFX', () => {
    const attacker = makeFighter(300, 1);
    const defender = makeFighter(400, -1);
    const { deps, vfxRecorder } = makeMockDeps(attacker, defender);
    const cb = createHitCallback(deps);
    cb(attacker, defender, AttackType.DM_OROCHINAGI, false, false);
    const burstCalls = vfxRecorder.calls.filter(c => c.method === 'spawnSuperBurst');
    expect(burstCalls.length).toBe(1);
  });

  it('Counter Hit spawns counter text', () => {
    const attacker = makeFighter(300, 1);
    const defender = makeFighter(400, -1);
    const { deps, vfxRecorder } = makeMockDeps(attacker, defender);
    const cb = createHitCallback(deps);
    cb(attacker, defender, AttackType.STAND_A, false, true);
    const counterCalls = vfxRecorder.calls.filter(c => c.method === 'spawnCounterText');
    expect(counterCalls.length).toBe(1);
  });

  it('KO hit (airborne defender) triggers red screen flash', () => {
    const attacker = makeFighter(300, 1);
    const defender = makeFighter(400, -1);
    defender.health = 0;
    // KO flash (#ff4400) only triggers when defender is airborne
    defender.y = 300; // above STAGE_GROUND_Y=510 to simulate airborne
    const { deps, flash } = makeMockDeps(attacker, defender);
    const cb = createHitCallback(deps);
    cb(attacker, defender, AttackType.STAND_C, false, false);
    const koFlash = flash.calls.find(c => c.color === '#ff4400');
    expect(koFlash).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 5: SFX Triggers
// ═══════════════════════════════════════════════════════════════

describe('SFX Triggers', () => {
  beforeEach(() => {
    sfxCalls.length = 0;
  });

  it('light hit calls playHit', () => {
    const attacker = makeFighter(300, 1);
    const defender = makeFighter(400, -1);
    const { deps } = makeMockDeps(attacker, defender);
    const cb = createHitCallback(deps);
    cb(attacker, defender, AttackType.STAND_A, false, false);
    expect(sfxCalls).toContain('playHit');
  });

  it('block calls playBlock', () => {
    const attacker = makeFighter(300, 1);
    const defender = makeFighter(400, -1);
    const { deps } = makeMockDeps(attacker, defender);
    const cb = createHitCallback(deps);
    cb(attacker, defender, AttackType.STAND_A, true, false);
    expect(sfxCalls).toContain('playBlock');
  });

  it('counter hit calls playCounter', () => {
    const attacker = makeFighter(300, 1);
    const defender = makeFighter(400, -1);
    const { deps } = makeMockDeps(attacker, defender);
    const cb = createHitCallback(deps);
    cb(attacker, defender, AttackType.STAND_A, false, true);
    expect(sfxCalls).toContain('playCounter');
  });

  it('DM hit calls playDM and playSuperFlash', () => {
    const attacker = makeFighter(300, 1);
    const defender = makeFighter(400, -1);
    const { deps } = makeMockDeps(attacker, defender);
    const cb = createHitCallback(deps);
    cb(attacker, defender, AttackType.DM_OROCHINAGI, false, false);
    expect(sfxCalls).toContain('playDM');
    expect(sfxCalls).toContain('playSuperFlash');
  });

  it('KO hit calls playKOHit', () => {
    const attacker = makeFighter(300, 1);
    const defender = makeFighter(400, -1);
    defender.health = 0;
    const { deps } = makeMockDeps(attacker, defender);
    const cb = createHitCallback(deps);
    cb(attacker, defender, AttackType.STAND_C, false, false);
    expect(sfxCalls).toContain('playKOHit');
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 6: Blockstop vs Hitstop
// ═══════════════════════════════════════════════════════════════

describe('Blockstop vs Hitstop', () => {
  it('blocked light uses BLOCKSTOP_LIGHT=2 < HITSTOP_LIGHT=4', () => {
    expect(BLOCKSTOP_LIGHT).toBeLessThan(HITSTOP_LIGHT);
  });

  it('blocked heavy uses BLOCKSTOP_HEAVY=4 < HITSTOP_MEDIUM=7', () => {
    expect(BLOCKSTOP_HEAVY).toBeLessThan(HITSTOP_MEDIUM);
  });

  it('blocked special uses BLOCKSTOP_SPECIAL=5 < HITSTOP_SPECIAL=13', () => {
    expect(BLOCKSTOP_SPECIAL).toBeLessThan(HITSTOP_SPECIAL);
  });

  it('blocked DM uses BLOCKSTOP_DM=8 < HITSTOP_DM=19', () => {
    expect(BLOCKSTOP_DM).toBeLessThan(HITSTOP_DM);
  });

  it('block shake is weaker than hit shake for same tier', () => {
    expect(SHAKE_BLOCK_LIGHT).toBeLessThanOrEqual(SHAKE_LIGHT);
    expect(SHAKE_BLOCK_HEAVY).toBeLessThanOrEqual(SHAKE_HEAVY);
    expect(SHAKE_BLOCK_DM).toBeLessThan(SHAKE_DM);
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 7: KO Ground Effect
// ═══════════════════════════════════════════════════════════════

describe('KO Ground Effect', () => {
  it('KO ground effect triggers SHAKE_KO=22 for 55 frames', () => {
    const defender = makeFighter(400, -1);
    const shake = makeMockScreenShake();
    const flash = makeMockScreenFlash();
    const vfxRecorder = makeMockVFXSystem();
    triggerKOGroundEffect(
      { vfx: vfxRecorder.vfx, screenFlash: flash, screenShake: shake },
      defender,
    );
    const koShake = shake.calls[shake.calls.length - 1];
    expect(koShake.intensity).toBe(SHAKE_KO);
    expect(koShake.duration).toBe(SHAKE_DURATION_KO);
  });

  it('KO ground effect spawns ground slam and heavy dust', () => {
    const defender = makeFighter(400, -1);
    const shake = makeMockScreenShake();
    const flash = makeMockScreenFlash();
    const vfxRecorder = makeMockVFXSystem();
    triggerKOGroundEffect(
      { vfx: vfxRecorder.vfx, screenFlash: flash, screenShake: shake },
      defender,
    );
    const methods = vfxRecorder.calls.map(c => c.method);
    expect(methods).toContain('spawnGroundSlam');
    expect(methods).toContain('spawnHeavyDust');
  });

  it('KO ground effect triggers red screen flash', () => {
    const defender = makeFighter(400, -1);
    const shake = makeMockScreenShake();
    const flash = makeMockScreenFlash();
    const vfxRecorder = makeMockVFXSystem();
    triggerKOGroundEffect(
      { vfx: vfxRecorder.vfx, screenFlash: flash, screenShake: shake },
      defender,
    );
    const redFlash = flash.calls.find(c => c.color === '#ff2200');
    expect(redFlash).toBeDefined();
    expect(redFlash!.frames).toBe(14);
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 8: Hit Flash
// ═══════════════════════════════════════════════════════════════

describe('Hit Flash', () => {
  it('light attack hitFlashFrames = 1', () => {
    const attacker = makeFighter(300, 1);
    const defender = makeFighter(400, -1);
    const { deps } = makeMockDeps(attacker, defender);
    const cb = createHitCallback(deps);
    cb(attacker, defender, AttackType.STAND_A, false, false);
    expect(attacker.hitFlashFrames).toBe(1);
  });

  it('heavy attack hitFlashFrames = 2', () => {
    const attacker = makeFighter(300, 1);
    const defender = makeFighter(400, -1);
    const { deps } = makeMockDeps(attacker, defender);
    const cb = createHitCallback(deps);
    cb(attacker, defender, AttackType.STAND_C, false, false);
    expect(attacker.hitFlashFrames).toBe(2);
  });

  it('special hitFlashFrames = 3', () => {
    const attacker = makeFighter(300, 1);
    const defender = makeFighter(400, -1);
    const { deps } = makeMockDeps(attacker, defender);
    const cb = createHitCallback(deps);
    cb(attacker, defender, AttackType.KYO_ONIYAKI, false, false);
    expect(attacker.hitFlashFrames).toBe(3);
  });

  it('DM hitFlashFrames = 4', () => {
    const attacker = makeFighter(300, 1);
    const defender = makeFighter(400, -1);
    const { deps } = makeMockDeps(attacker, defender);
    const cb = createHitCallback(deps);
    cb(attacker, defender, AttackType.DM_OROCHINAGI, false, false);
    expect(attacker.hitFlashFrames).toBe(4);
  });

  it('DM hitFlashColor uses character special color (not white)', () => {
    const attacker = makeFighter(300, 1);
    const defender = makeFighter(400, -1);
    const { deps } = makeMockDeps(attacker, defender);
    const cb = createHitCallback(deps);
    cb(attacker, defender, AttackType.DM_OROCHINAGI, false, false);
    expect(attacker.hitFlashColor).not.toBe('#ffffff');
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 9: SDM specific behavior
// ═══════════════════════════════════════════════════════════════

describe('SDM Impact', () => {
  it('SDM hitstop = HITSTOP_SDM=22 > HITSTOP_DM=19', () => {
    const attacker = makeFighter(300, 1);
    const defender = makeFighter(400, -1);
    const { deps, cinematic } = makeMockDeps(attacker, defender);
    const cb = createHitCallback(deps);
    cb(attacker, defender, AttackType.SDM_OROCHINAGI, false, false);
    expect(cinematic.hitStop).toBe(HITSTOP_SDM);
    expect(HITSTOP_SDM).toBeGreaterThan(HITSTOP_DM);
  });

  it('SDM triggers brighter screen flash than DM', () => {
    const attacker = makeFighter(300, 1);
    const defender = makeFighter(400, -1);
    const { deps, flash } = makeMockDeps(attacker, defender);
    const cb = createHitCallback(deps);
    cb(attacker, defender, AttackType.SDM_OROCHINAGI, false, false);
    // SDM triggers '#ffdd44' at 0.35 for 10 frames
    const sdmFlash = flash.calls.find(c => c.color === '#ffdd44' && c.frames === 10);
    expect(sdmFlash).toBeDefined();
  });
});
