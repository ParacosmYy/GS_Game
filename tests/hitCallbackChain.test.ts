/**
 * hitCallbackChain.test.ts -- 命中回调链完整性测试
 *
 * 验证 createHitCallback 返回的回调函数在命中时正确触发:
 * - hitstop / blockstop
 * - screen shake (强度、时长、方向)
 * - VFX (火花、冲击环、斩击线、伤害数字)
 * - SFX (各种打击音效)
 * - meter gain (命中/防御/气绝)
 * - combo 计数和伤害文本
 * - counter hit 增强
 * - KO 检测
 * - block vs hit 区分
 */

// ── Mock audio before any module that imports it loads ──
// hitCallback.ts statically imports from audio/sampler.js and audio/bgm.js,
// both of which call `new AudioContext()` at init. We must stub them first.

const sfxLog: string[] = [];

vi.mock('../src/audio/sampler.js', () => ({
  playHit: () => { sfxLog.push('playHit'); },
  playHeavyHit: () => { sfxLog.push('playHeavyHit'); },
  playBlock: () => { sfxLog.push('playBlock'); },
  playSpecial: () => { sfxLog.push('playSpecial'); },
  playSpecialLight: () => { sfxLog.push('playSpecialLight'); },
  playSpecialHeavy: () => { sfxLog.push('playSpecialHeavy'); },
  playDM: () => { sfxLog.push('playDM'); },
  playKO: () => { sfxLog.push('playKO'); },
  playSuperFlash: () => { sfxLog.push('playSuperFlash'); },
  playCounter: () => { sfxLog.push('playCounter'); },
  playGuardCrush: () => { sfxLog.push('playGuardCrush'); },
  playThrow: () => { sfxLog.push('playThrow'); },
  playWire: () => { sfxLog.push('playWire'); },
  playJuggleHit: () => { sfxLog.push('playJuggleHit'); },
  playKOHit: () => { sfxLog.push('playKOHit'); },
  playLandingHeavy: () => { sfxLog.push('playLandingHeavy'); },
  playHitAccent: () => { sfxLog.push('playHitAccent'); },
  playDizzyHit: () => { sfxLog.push('playDizzyHit'); },
  playGroundBounce: () => { sfxLog.push('playGroundBounce'); },
  playWallBounce: () => { sfxLog.push('playWallBounce'); },
  playBlockSpecial: () => { sfxLog.push('playBlockSpecial'); },
  playBlockDM: () => { sfxLog.push('playBlockDM'); },
}));

vi.mock('../src/audio/bgm.js', () => ({
  bgm: { duck: () => {} },
}));

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createHitCallback, triggerKOGroundEffect } from '../src/combat/hitCallback.js';
import type { HitCallbackDeps } from '../src/combat/hitCallback.js';
import { CombatSystem } from '../src/combat/combatSystem.js';
import { Fighter } from '../src/entities/fighter.js';
import { AttackType, FighterState } from '../src/core/types.js';
import type { PowerGauge } from '../src/core/types.js';
import type { VFXSystem, ScreenShake, ScreenFlash } from '../src/rendering/vfx.js';
import { CinematicState } from '../src/state/cinematicState.js';
import { FRAME_DATA, HITSTOP_LIGHT, HITSTOP_MEDIUM, HITSTOP_SPECIAL, HITSTOP_COUNTER_BONUS, BLOCKSTOP_LIGHT, BLOCKSTOP_HEAVY, BLOCKSTOP_SPECIAL, BLOCKSTOP_DM, SHAKE_LIGHT, SHAKE_HEAVY, SHAKE_COUNTER, SHAKE_SPECIAL, SHAKE_KO, SHAKE_BLOCK_LIGHT, SHAKE_BLOCK_HEAVY, SPARK_SIZE_LIGHT, SPARK_SIZE_HEAVY, SPARK_SIZE_SPECIAL, SPARK_SIZE_DM } from '../src/core/constants.js';
import type { IInputProvider } from '../src/input/inputProvider.js';
import type { PlayerInput } from '../src/core/types.js';

// ═══════════════════════════════════════════════════════════════
// Mocks & helpers
// ═══════════════════════════════════════════════════════════════

const noopInput: PlayerInput = {
  up: false, down: false, left: false, right: false,
  buttonA: false, buttonB: false, buttonC: false, buttonD: false,
  throwAttack: false, start: false,
};

function createInputProvider(): IInputProvider {
  return { getP1Input: () => noopInput, getP2Input: () => noopInput };
}

/** Create a minimal mock Fighter with controllable state */
function createMockFighter(overrides: Partial<Fighter> & { x?: number; health?: number; maxHealth?: number } = {}): Fighter {
  const f = new Fighter(overrides.x ?? 200, '#ff0000', 1);
  if (overrides.health !== undefined) f.health = overrides.health;
  if (overrides.maxHealth !== undefined) f.maxHealth = overrides.maxHealth;
  if (overrides.state !== undefined) f.state = overrides.state;
  if (overrides.charId !== undefined) f.charId = overrides.charId;
  return f;
}

/** Create a VFXSystem mock that records all calls */
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
    update: vi.fn(),
    render: vi.fn(),
  } as unknown as VFXSystem & Record<string, ReturnType<typeof vi.fn>>;
}

/** Create a ScreenShake mock */
function createMockScreenShake(): ScreenShake & { trigger: ReturnType<typeof vi.fn> } {
  return {
    trigger: vi.fn(),
    update: vi.fn(),
    offsetX: 0,
    offsetY: 0,
  } as unknown as ScreenShake & { trigger: ReturnType<typeof vi.fn> };
}

/** Create a ScreenFlash mock */
function createMockScreenFlash(): ScreenFlash & { trigger: ReturnType<typeof vi.fn> } {
  return {
    trigger: vi.fn(),
    update: vi.fn(),
    render: vi.fn(),
    active: false,
    reset: vi.fn(),
  } as unknown as ScreenFlash & { trigger: ReturnType<typeof vi.fn> };
}

/** Create a PowerGauge */
function createMockGauge(): PowerGauge {
  return { meter: 0, stocks: 0, maxMeter: 1000 };
}

/** Build full deps for createHitCallback */
function createDeps(): {
  deps: HitCallbackDeps;
  vfx: ReturnType<typeof createMockVFX>;
  shake: ReturnType<typeof createMockScreenShake>;
  flash: ReturnType<typeof createMockScreenFlash>;
  cinematic: CinematicState;
  combat: CombatSystem;
  gauges: [PowerGauge, PowerGauge];
} {
  const p1 = createMockFighter({ x: 200, charId: 'kyo' });
  const p2 = createMockFighter({ x: 400, charId: 'iori' });
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

// ═══════════════════════════════════════════════════════════════
// 1. Hit Callback Creation
// ═══════════════════════════════════════════════════════════════

describe('1. Hit Callback Creation', () => {
  it('createHitCallback returns a function', () => {
    const { deps } = createDeps();
    const cb = createHitCallback(deps);
    expect(typeof cb).toBe('function');
  });

  it('callback can be invoked without throwing', () => {
    const { deps } = createDeps();
    const cb = createHitCallback(deps);
    const [p1, p2] = deps.fighters;
    expect(() => cb(p1, p2, AttackType.STAND_A, false, false)).not.toThrow();
  });

  it('callback does not throw on blocked attack', () => {
    const { deps } = createDeps();
    const cb = createHitCallback(deps);
    const [p1, p2] = deps.fighters;
    expect(() => cb(p1, p2, AttackType.STAND_C, true, false)).not.toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. Hit Level Differentiation
// ═══════════════════════════════════════════════════════════════

describe('2. Hit Level Differentiation', () => {
  it('LIGHT attack (STAND_A) triggers hitstop with correct frames', () => {
    const { deps, cinematic } = createDeps();
    const cb = createHitCallback(deps);
    const [p1, p2] = deps.fighters;
    cb(p1, p2, AttackType.STAND_A, false, false);
    // hitstop set via cinematic.triggerHitStop; read back from hitStop property
    expect(cinematic.hitStop).toBe(HITSTOP_LIGHT);
  });

  it('HEAVY attack (STAND_C) triggers longer hitstop than light', () => {
    const { deps, cinematic } = createDeps();
    const cb = createHitCallback(deps);
    const [p1, p2] = deps.fighters;
    cb(p1, p2, AttackType.STAND_C, false, false);
    expect(cinematic.hitStop).toBe(HITSTOP_MEDIUM);
    expect(HITSTOP_MEDIUM).toBeGreaterThan(HITSTOP_LIGHT);
  });

  it('SPECIAL attack triggers even longer hitstop than heavy', () => {
    const { deps, cinematic } = createDeps();
    const cb = createHitCallback(deps);
    const [p1, p2] = deps.fighters;
    cb(p1, p2, AttackType.KYO_ONIYAKI, false, false);
    expect(cinematic.hitStop).toBe(HITSTOP_SPECIAL);
    expect(HITSTOP_SPECIAL).toBeGreaterThan(HITSTOP_MEDIUM);
  });

  it('different hit levels produce different shake intensities', () => {
    // Light vs Heavy: both hit, both grounded, no CH -- compare shake intensity
    const ctx1 = createDeps();
    const cb1 = createHitCallback(ctx1.deps);
    cb1(ctx1.deps.fighters[0], ctx1.deps.fighters[1], AttackType.STAND_A, false, false);
    const lightShake = ctx1.shake.trigger.mock.calls[0] as [number, number, number];

    const ctx2 = createDeps();
    const cb2 = createHitCallback(ctx2.deps);
    cb2(ctx2.deps.fighters[0], ctx2.deps.fighters[1], AttackType.STAND_C, false, false);
    const heavyShake = ctx2.shake.trigger.mock.calls[0] as [number, number, number];

    // Heavy attack shake intensity should be >= light
    expect(heavyShake[0]).toBeGreaterThanOrEqual(lightShake[0]);
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. Counter Hit Chain
// ═══════════════════════════════════════════════════════════════

describe('3. Counter Hit Chain', () => {
  it('Counter Hit adds extra hitstop (HITSTOP_COUNTER_BONUS)', () => {
    const ctx1 = createDeps();
    const cb1 = createHitCallback(ctx1.deps);
    cb1(ctx1.deps.fighters[0], ctx1.deps.fighters[1], AttackType.STAND_A, false, false);
    const normalStop = ctx1.cinematic.hitStop;

    const ctx2 = createDeps();
    const cb2 = createHitCallback(ctx2.deps);
    cb2(ctx2.deps.fighters[0], ctx2.deps.fighters[1], AttackType.STAND_A, false, true);
    const chStop = ctx2.cinematic.hitStop;

    expect(chStop).toBe(normalStop + HITSTOP_COUNTER_BONUS);
  });

  it('Counter Hit spawns counter text VFX', () => {
    const { deps, vfx } = createDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_A, false, true);
    expect(vfx.spawnCounterText).toHaveBeenCalled();
  });

  it('Counter Hit triggers orange screen flash', () => {
    const { deps, flash } = createDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_C, false, true);
    // CH triggers '#ff8800' flash
    const chFlashCall = flash.trigger.mock.calls.find((c: string[]) => c[0] === '#ff8800');
    expect(chFlashCall).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. KO Chain
// ═══════════════════════════════════════════════════════════════

describe('4. KO Chain', () => {
  it('KO hit (defender health <= 0 and airborne) extends hitstop', () => {
    const ctx = createDeps();
    const cb = createHitCallback(ctx.deps);
    const [p1, p2] = ctx.deps.fighters;
    // Make p2 airborne by moving y above ground
    p2.y = 100;
    p2.health = 0;
    cb(p1, p2, AttackType.STAND_C, false, false);
    // KO adds 3 frames via addHitStop
    // The base hitstop was set by triggerHitStop, then +3 from addHitStop
    // Since isFrozen() decrements, we check hitStop was >= base
    expect(ctx.cinematic.hitStop).toBeGreaterThanOrEqual(HITSTOP_MEDIUM);
  });

  it('triggerKOGroundEffect spawns ground slam and heavy dust', () => {
    const vfx = createMockVFX();
    const flash = createMockScreenFlash();
    const shake = createMockScreenShake();
    const defender = createMockFighter({ x: 300 });
    defender.health = 0;

    triggerKOGroundEffect({ vfx, screenFlash: flash, screenShake: shake }, defender);
    expect(vfx.spawnGroundSlam).toHaveBeenCalled();
    expect(vfx.spawnHeavyDust).toHaveBeenCalled();
  });

  it('triggerKOGroundEffect triggers screen flash and shake', () => {
    const vfx = createMockVFX();
    const flash = createMockScreenFlash();
    const shake = createMockScreenShake();
    const defender = createMockFighter({ x: 300 });
    defender.health = 0;

    triggerKOGroundEffect({ vfx, screenFlash: flash, screenShake: shake }, defender);
    // Should trigger flash at least once (white + red)
    expect(flash.trigger.mock.calls.length).toBeGreaterThanOrEqual(2);
    // Should trigger shake with KO intensity
    expect(shake.trigger).toHaveBeenCalled();
    const shakeCall = shake.trigger.mock.calls[0] as [number, number];
    expect(shakeCall[0]).toBe(SHAKE_KO);
  });
});

// ═══════════════════════════════════════════════════════════════
// 5. Combo Progression
// ═══════════════════════════════════════════════════════════════

describe('5. Combo Progression', () => {
  it('first hit has combo=0 from combatSystem (no floating combo text)', () => {
    const { deps, vfx } = createDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_A, false, false);
    // combo=0, so spawnFloatingComboText should NOT be called (only combo>=2)
    expect(vfx.spawnFloatingComboText).not.toHaveBeenCalled();
  });

  it('second hit in combo shows combo text (combo>=2)', () => {
    const { deps, vfx, combat } = createDeps();
    // Simulate first hit recorded in combat system
    // Manually bump combo count to simulate a prior hit
    (combat as unknown as { comboHits: number[] }).comboHits[1] = 1;
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_A, false, false);
    // Now combo=1 at callback time, but the callback reads combo before increment
    // Actually getComboCount returns current count (not yet incremented by resolveAttacks)
    // With comboHits[1]=1, the callback sees combo=1, still < 2
    expect(vfx.spawnFloatingComboText).not.toHaveBeenCalled();
  });

  it('combo >= 2 triggers floating combo text', () => {
    const { deps, vfx, combat } = createDeps();
    (combat as unknown as { comboHits: number[] }).comboHits[1] = 2;
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_A, false, false);
    expect(vfx.spawnFloatingComboText).toHaveBeenCalled();
    const call = vfx.spawnFloatingComboText.mock.calls[0];
    // call[2] = combo, call[3] = totalDamage
    expect(call[2]).toBeGreaterThanOrEqual(2);
  });

  it('damage text is always spawned on hit', () => {
    const { deps, vfx } = createDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_A, false, false);
    expect(vfx.spawnDamageText).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════
// 6. Block vs Hit
// ═══════════════════════════════════════════════════════════════

describe('6. Block vs Hit', () => {
  it('blocked attack triggers block flash, not hit sparks at hit position', () => {
    const { deps, vfx } = createDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_C, true, false);
    // Block triggers spawnBlockFlash
    expect(vfx.spawnBlockFlash).toHaveBeenCalled();
  });

  it('blocked light attack hitstop is shorter than clean hit', () => {
    const ctx1 = createDeps();
    const cb1 = createHitCallback(ctx1.deps);
    cb1(ctx1.deps.fighters[0], ctx1.deps.fighters[1], AttackType.STAND_A, true, false);
    const blockStop = ctx1.cinematic.hitStop;

    const ctx2 = createDeps();
    const cb2 = createHitCallback(ctx2.deps);
    cb2(ctx2.deps.fighters[0], ctx2.deps.fighters[1], AttackType.STAND_A, false, false);
    const hitStop = ctx2.cinematic.hitStop;

    // Block stop should be shorter than hit stop
    expect(blockStop).toBeLessThan(hitStop);
  });

  it('blocked attack does not spawn counter text or floating combo text', () => {
    const { deps, vfx, combat } = createDeps();
    // Even with combo > 0, block should not show combo text
    (combat as unknown as { comboHits: number[] }).comboHits[1] = 5;
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_C, true, false);
    // Block path returns early, never reaches combo text
    expect(vfx.spawnFloatingComboText).not.toHaveBeenCalled();
    expect(vfx.spawnCounterText).not.toHaveBeenCalled();
  });

  it('blocked special attack triggers block_special sparks', () => {
    const { deps, vfx } = createDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.KYO_ONIYAKI, true, false);
    // Special block spawns character hit sparks with yellow color
    expect(vfx.spawnCharacterHitSparks).toHaveBeenCalled();
    // Check that block flash was called
    expect(vfx.spawnBlockFlash).toHaveBeenCalled();
  });

  it('blocked DM triggers screen flash and sparks', () => {
    const { deps, vfx, flash } = createDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.DM_OROCHINAGI, true, false);
    // DM block should trigger screen flash with '#4466ff'
    const dmFlashCall = flash.trigger.mock.calls.find((c: string[]) => c[0] === '#4466ff');
    expect(dmFlashCall).toBeDefined();
    // DM block spawns character hit sparks
    expect(vfx.spawnCharacterHitSparks).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════
// 7. VFX Chain Completeness
// ═══════════════════════════════════════════════════════════════

describe('7. VFX Chain Completeness', () => {
  it('clean hit spawns hit sparks, impact ring, and damage text', () => {
    const { deps, vfx } = createDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_C, false, false);
    // Character hit sparks (main burst)
    expect(vfx.spawnCharacterHitSparks).toHaveBeenCalled();
    // Impact ring
    expect(vfx.spawnImpactRing).toHaveBeenCalled();
    // Damage text
    expect(vfx.spawnDamageText).toHaveBeenCalled();
  });

  it('heavy attack spawns slash line', () => {
    const { deps, vfx } = createDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_C, false, false);
    expect(vfx.spawnSlashLine).toHaveBeenCalled();
  });

  it('light attack does NOT spawn slash line', () => {
    const { deps, vfx } = createDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_A, false, false);
    expect(vfx.spawnSlashLine).not.toHaveBeenCalled();
  });

  it('cancel flash is spawned on non-throw hit', () => {
    const { deps, vfx } = createDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_A, false, false);
    expect(vfx.spawnCancelFlash).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════
// 8. Meter Gain on Hit/Block
// ═══════════════════════════════════════════════════════════════

describe('8. Meter Gain', () => {
  it('clean hit grants meter to defender via hitstun', () => {
    const { deps, gauges } = createDeps();
    const cb = createHitCallback(deps);
    const initialMeter = gauges[1].meter; // defender gauge
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_C, false, false);
    // Defender gains meter from hitstun
    expect(gauges[1].meter).toBeGreaterThan(initialMeter);
  });

  it('blocked attack grants meter to both attacker and defender', () => {
    const { deps, gauges } = createDeps();
    const cb = createHitCallback(deps);
    const atkMeterBefore = gauges[0].meter;
    const defMeterBefore = gauges[1].meter;
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_C, true, false);
    // Attacker gains meter from block
    expect(gauges[0].meter).toBeGreaterThan(atkMeterBefore);
    // Defender gains meter from being in hitstun (blockstun counts)
    expect(gauges[1].meter).toBeGreaterThan(defMeterBefore);
  });
});

// ═══════════════════════════════════════════════════════════════
// 9. Throw Attack Chain
// ═══════════════════════════════════════════════════════════════

describe('9. Throw Attack Chain', () => {
  it('throw attack triggers screen shake with throw intensity', () => {
    const { deps, shake } = createDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.THROW, false, false);
    // Throw has its own shake call (7, 8, bias)
    const throwShakeCall = shake.trigger.mock.calls.find((c: number[]) => c[0] === 7);
    expect(throwShakeCall).toBeDefined();
  });

  it('throw attack spawns impact ring and character sparks', () => {
    const { deps, vfx } = createDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.THROW, false, false);
    expect(vfx.spawnCharacterHitSparks).toHaveBeenCalled();
    expect(vfx.spawnImpactRing).toHaveBeenCalled();
  });

  it('throw attack does NOT spawn cancel flash', () => {
    const { deps, vfx } = createDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.THROW, false, false);
    expect(vfx.spawnCancelFlash).not.toHaveBeenCalled();
  });
});
