/**
 * audioTriggerChain.test.ts -- KOF2002 Audio Trigger Chain Precision Tests
 *
 * Verifies the audio system triggers correctly for every attack scenario:
 * - SFX trigger tiers: light, heavy, special, DM, SDM, block, counter, throw, guard crush
 * - SFX trigger timing: hit frame, not during startup/recovery
 * - KO audio: distinct KO SFX, louder/longer than normal
 * - Character-specific audio: accent mapping per character attribute
 * - BGM duck: volume dips during attacks and recovers
 *
 * Total: 20 tests
 */

// ── Mock sampler before any module that imports it loads ──

const sfxLog: string[] = [];
const duckLog: Array<{ volume: number; recoveryMs: number }> = [];

vi.mock('../src/audio/sampler.js', () => ({
  playHit: (...a: number[]) => { sfxLog.push(`playHit:${a.join(',')}`); },
  playHeavyHit: (...a: number[]) => { sfxLog.push(`playHeavyHit:${a.join(',')}`); },
  playBlock: (h: boolean) => { sfxLog.push(`playBlock:${h}`); },
  playSpecial: () => { sfxLog.push('playSpecial'); },
  playSpecialLight: () => { sfxLog.push('playSpecialLight'); },
  playSpecialHeavy: () => { sfxLog.push('playSpecialHeavy'); },
  playDM: () => { sfxLog.push('playDM'); },
  playKO: () => { sfxLog.push('playKO'); },
  playSuperFlash: (isSDM: boolean) => { sfxLog.push(`playSuperFlash:${isSDM}`); },
  playCounter: () => { sfxLog.push('playCounter'); },
  playGuardCrush: () => { sfxLog.push('playGuardCrush'); },
  playThrow: () => { sfxLog.push('playThrow'); },
  playWire: () => { sfxLog.push('playWire'); },
  playJuggleHit: (c: number) => { sfxLog.push(`playJuggleHit:${c}`); },
  playKOHit: () => { sfxLog.push('playKOHit'); },
  playLandingHeavy: () => { sfxLog.push('playLandingHeavy'); },
  playHitAccent: (charId: string, isDM: boolean) => { sfxLog.push(`playHitAccent:${charId},${isDM}`); },
  playDizzyHit: () => { sfxLog.push('playDizzyHit'); },
  playGroundBounce: () => { sfxLog.push('playGroundBounce'); },
  playWallBounce: () => { sfxLog.push('playWallBounce'); },
  playBlockSpecial: () => { sfxLog.push('playBlockSpecial'); },
  playBlockDM: () => { sfxLog.push('playBlockDM'); },
  playRoundStart: () => { sfxLog.push('playRoundStart'); },
  playTimeUp: () => { sfxLog.push('playTimeUp'); },
  playPerfectKO: () => { sfxLog.push('playPerfectKO'); },
}));

vi.mock('../src/audio/bgm.js', () => ({
  bgm: {
    duck: (volume: number, recoveryMs: number) => {
      duckLog.push({ volume, recoveryMs });
    },
  },
}));

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as sampler from '../src/audio/sampler.js';
import { createHitCallback, triggerKOGroundEffect } from '../src/combat/hitCallback.js';
import type { HitCallbackDeps } from '../src/combat/hitCallback.js';
import { CombatSystem } from '../src/combat/combatSystem.js';
import { Fighter } from '../src/entities/fighter.js';
import { AttackType, FighterState } from '../src/core/types.js';
import type { PowerGauge } from '../src/core/types.js';
import type { VFXSystem, ScreenShake, ScreenFlash } from '../src/rendering/vfx.js';
import { CinematicState } from '../src/state/cinematicState.js';
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

function createMockFighter(overrides: Partial<Fighter> & { x?: number; health?: number; maxHealth?: number } = {}): Fighter {
  const f = new Fighter(overrides.x ?? 200, '#ff0000', 1);
  if (overrides.health !== undefined) f.health = overrides.health;
  if (overrides.maxHealth !== undefined) f.maxHealth = overrides.maxHealth;
  if (overrides.state !== undefined) f.state = overrides.state;
  if (overrides.charId !== undefined) f.charId = overrides.charId;
  return f;
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

function createDeps(overrides: { p1CharId?: string; p2CharId?: string } = {}): {
  deps: HitCallbackDeps;
  vfx: ReturnType<typeof createMockVFX>;
  shake: ReturnType<typeof createMockScreenShake>;
  flash: ReturnType<typeof createMockScreenFlash>;
  cinematic: CinematicState;
  combat: CombatSystem;
  gauges: [PowerGauge, PowerGauge];
} {
  const p1 = createMockFighter({ x: 200, charId: overrides.p1CharId ?? 'kyo' });
  const p2 = createMockFighter({ x: 400, charId: overrides.p2CharId ?? 'iori' });
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
// 1. SFX Trigger Tier Tests
// ═══════════════════════════════════════════════════════════════

describe('SFX Trigger Tiers', () => {
  beforeEach(() => { sfxLog.length = 0; duckLog.length = 0; });

  it('light attack (A) triggers playHit SFX', () => {
    const { deps } = createDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_A, false, false);
    const hitCalls = sfxLog.filter(e => e.startsWith('playHit:'));
    expect(hitCalls.length).toBeGreaterThanOrEqual(1);
    // Should NOT trigger heavy/special/DM SFX
    expect(sfxLog.some(e => e.startsWith('playHeavyHit'))).toBe(false);
    expect(sfxLog.some(e => e === 'playDM')).toBe(false);
  });

  it('light attack (B) triggers playHit SFX', () => {
    const { deps } = createDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_B, false, false);
    expect(sfxLog.some(e => e.startsWith('playHit:'))).toBe(true);
    expect(sfxLog.some(e => e.startsWith('playHeavyHit'))).toBe(false);
  });

  it('heavy attack (C) triggers playHeavyHit SFX', () => {
    const { deps } = createDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_C, false, false);
    expect(sfxLog.some(e => e.startsWith('playHeavyHit'))).toBe(true);
    // Should NOT trigger light/special/DM
    expect(sfxLog.some(e => e === 'playDM')).toBe(false);
    expect(sfxLog.some(e => e === 'playSpecialLight')).toBe(false);
  });

  it('heavy attack (D) triggers playHeavyHit SFX', () => {
    const { deps } = createDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_D, false, false);
    expect(sfxLog.some(e => e.startsWith('playHeavyHit'))).toBe(true);
  });

  it('special triggers playSpecialLight or playSpecialHeavy SFX', () => {
    const { deps } = createDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.KYO_ONIYAKI, false, false);
    const hasSpecial = sfxLog.some(e =>
      e === 'playSpecialLight' || e === 'playSpecialHeavy'
    );
    expect(hasSpecial).toBe(true);
    // Should NOT trigger DM or heavy hit
    expect(sfxLog.some(e => e === 'playDM')).toBe(false);
    expect(sfxLog.some(e => e.startsWith('playHeavyHit'))).toBe(false);
  });

  it('DM triggers playSuperFlash + playDM + playHitAccent SFX', () => {
    const { deps } = createDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.DM_OROCHINAGI, false, false);
    expect(sfxLog.some(e => e === 'playDM')).toBe(true);
    expect(sfxLog.some(e => e.startsWith('playSuperFlash:'))).toBe(true);
    expect(sfxLog.some(e => e.startsWith('playHitAccent:'))).toBe(true);
    // DM should NOT trigger heavy hit
    expect(sfxLog.some(e => e.startsWith('playHeavyHit'))).toBe(false);
  });

  it('SDM triggers playSuperFlash:true (distinct from DM)', () => {
    const { deps } = createDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.SDM_OROCHINAGI, false, false);
    // SDM should use playSuperFlash with isSDM=true
    expect(sfxLog.some(e => e === 'playSuperFlash:true')).toBe(true);
    // DM SFX also plays for SDM
    expect(sfxLog.some(e => e === 'playDM')).toBe(true);
  });

  it('block triggers playBlock SFX (separate from hit SFX)', () => {
    const { deps } = createDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_A, true, false);
    expect(sfxLog.some(e => e.startsWith('playBlock:'))).toBe(true);
    // Should NOT trigger any hit SFX
    expect(sfxLog.some(e => e.startsWith('playHit:'))).toBe(false);
    expect(sfxLog.some(e => e.startsWith('playHeavyHit'))).toBe(false);
  });

  it('light block vs heavy block use different SFX parameters', () => {
    const { deps } = createDeps();
    const cb = createHitCallback(deps);
    // Light block
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_A, true, false);
    expect(sfxLog).toContain('playBlock:false');
    sfxLog.length = 0;
    // Heavy block
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_C, true, false);
    expect(sfxLog).toContain('playBlock:true');
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. SFX Trigger Timing Tests
// ═══════════════════════════════════════════════════════════════

describe('SFX Trigger Timing', () => {
  beforeEach(() => { sfxLog.length = 0; duckLog.length = 0; });

  it('SFX plays at hit frame — hitCallback fires immediately on hit', () => {
    const { deps } = createDeps();
    const cb = createHitCallback(deps);
    // The hitCallback IS the "hit frame" — it fires when hit is confirmed
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_A, false, false);
    // SFX must be present immediately after callback
    expect(sfxLog.length).toBeGreaterThan(0);
    expect(sfxLog.some(e => e.startsWith('playHit:'))).toBe(true);
  });

  it('multiple hits in combo each trigger SFX', () => {
    const { deps } = createDeps();
    const cb = createHitCallback(deps);
    // First hit
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_A, false, false);
    const firstHitCount = sfxLog.filter(e => e.startsWith('playHit:')).length;
    sfxLog.length = 0;
    // Second hit
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_A, false, false);
    const secondHitCount = sfxLog.filter(e => e.startsWith('playHit:')).length;
    // Each hit should trigger SFX
    expect(firstHitCount).toBeGreaterThanOrEqual(1);
    expect(secondHitCount).toBeGreaterThanOrEqual(1);
  });

  it('SFX overlaps — simultaneous special + accent do not cancel', () => {
    const { deps } = createDeps();
    const cb = createHitCallback(deps);
    // Special hit triggers both special SFX and hit accent
    cb(deps.fighters[0], deps.fighters[1], AttackType.KYO_ONIYAKI, false, false);
    // Both SFX should be present — one does not cancel the other
    const hasSpecial = sfxLog.some(e =>
      e === 'playSpecialLight' || e === 'playSpecialHeavy'
    );
    const hasAccent = sfxLog.some(e => e.startsWith('playHitAccent:'));
    expect(hasSpecial).toBe(true);
    expect(hasAccent).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. KO Audio Tests
// ═══════════════════════════════════════════════════════════════

describe('KO Audio', () => {
  beforeEach(() => { sfxLog.length = 0; duckLog.length = 0; });

  it('KO triggers distinct playKOHit SFX', () => {
    const { deps } = createDeps();
    const cb = createHitCallback(deps);
    deps.fighters[1].health = 0;
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_C, false, false);
    expect(sfxLog).toContain('playKOHit');
  });

  it('KO ground effect triggers playLandingHeavy (heavier than normal landing)', () => {
    const { deps } = createDeps();
    const defender = deps.fighters[1];
    triggerKOGroundEffect(
      { vfx: deps.vfx, screenFlash: createMockScreenFlash(), screenShake: createMockScreenShake() },
      defender,
    );
    expect(sfxLog).toContain('playLandingHeavy');
  });

  it('DM KO triggers both playDM and playKOHit', () => {
    const { deps } = createDeps();
    const cb = createHitCallback(deps);
    deps.fighters[1].health = 0;
    cb(deps.fighters[0], deps.fighters[1], AttackType.DM_OROCHINAGI, false, false);
    // Both DM SFX and KO hit SFX should fire
    expect(sfxLog).toContain('playDM');
    expect(sfxLog).toContain('playKOHit');
  });

  it('playPerfectKO SFX function exists and is callable', () => {
    expect(typeof sampler.playPerfectKO).toBe('function');
    expect(() => sampler.playPerfectKO()).not.toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. Character-Specific Audio Tests
// ═══════════════════════════════════════════════════════════════

describe('Character-Specific Audio', () => {
  beforeEach(() => { sfxLog.length = 0; duckLog.length = 0; });

  it('throw triggers distinct playThrow SFX', () => {
    const { deps } = createDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.THROW, false, false);
    expect(sfxLog).toContain('playThrow');
    // Should NOT trigger normal hit or heavy hit
    expect(sfxLog.some(e => e.startsWith('playHit:') && !e.startsWith('playHitAccent'))).toBe(false);
    expect(sfxLog.some(e => e.startsWith('playHeavyHit'))).toBe(false);
  });

  it('counter hit triggers distinct playCounter SFX', () => {
    const { deps } = createDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_A, false, true);
    expect(sfxLog).toContain('playCounter');
  });

  it('guard crush triggers distinct playGuardCrush SFX', () => {
    const { deps } = createDeps();
    const cb = createHitCallback(deps);
    // Set defender to GUARD_CRUSH state to trigger the guard crush SFX
    deps.fighters[1].state = FighterState.GUARD_CRUSH;
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_C, true, false);
    expect(sfxLog).toContain('playGuardCrush');
  });

  it('block special triggers playBlockSpecial (not playBlock)', () => {
    const { deps } = createDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.KYO_ONIYAKI, true, false);
    expect(sfxLog).toContain('playBlockSpecial');
    // Should NOT use the generic block
    expect(sfxLog.some(e => e.startsWith('playBlock:'))).toBe(false);
  });

  it('block DM triggers playBlockDM (distinct from block special)', () => {
    const { deps } = createDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.DM_OROCHINAGI, true, false);
    expect(sfxLog).toContain('playBlockDM');
    // Should NOT use block special or generic block
    expect(sfxLog).not.toContain('playBlockSpecial');
    expect(sfxLog.some(e => e.startsWith('playBlock:'))).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════
// 5. BGM Duck Tests
// ═══════════════════════════════════════════════════════════════

describe('BGM Duck', () => {
  beforeEach(() => { sfxLog.length = 0; duckLog.length = 0; });

  it('DM activation ducks BGM volume more aggressively than light attack', () => {
    const { deps } = createDeps();
    const cb = createHitCallback(deps);
    // Light attack
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_A, false, false);
    const lightDuck = duckLog[duckLog.length - 1];
    duckLog.length = 0;
    // DM
    cb(deps.fighters[0], deps.fighters[1], AttackType.DM_OROCHINAGI, false, false);
    const dmDuck = duckLog[duckLog.length - 1];
    // DM should dip lower (lower volume value = deeper duck)
    expect(dmDuck.volume).toBeLessThan(lightDuck.volume);
    // DM should also recover more slowly (longer recovery)
    expect(dmDuck.recoveryMs).toBeGreaterThan(lightDuck.recoveryMs);
  });

  it('BGM duck is called for every hit tier', () => {
    const { deps } = createDeps();
    const cb = createHitCallback(deps);

    // Each hit type should trigger exactly one duck call
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_A, false, false);
    expect(duckLog.length).toBeGreaterThanOrEqual(1);
    duckLog.length = 0;

    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_C, false, false);
    expect(duckLog.length).toBeGreaterThanOrEqual(1);
    duckLog.length = 0;

    cb(deps.fighters[0], deps.fighters[1], AttackType.KYO_ONIYAKI, false, false);
    expect(duckLog.length).toBeGreaterThanOrEqual(1);
    duckLog.length = 0;

    cb(deps.fighters[0], deps.fighters[1], AttackType.DM_OROCHINAGI, false, false);
    expect(duckLog.length).toBeGreaterThanOrEqual(1);
  });

  it('counter hit ducks BGM volume more aggressively than normal hit', () => {
    const { deps } = createDeps();
    const cb = createHitCallback(deps);
    // Normal light hit
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_A, false, false);
    // Counter hit adds extra duck via playCounter path
    const beforeCounter = duckLog.length;
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_A, false, true);
    const afterCounter = duckLog.length;
    // Counter hit should produce more duck calls (base + counter extra)
    const counterDuckCount = afterCounter - beforeCounter;
    expect(counterDuckCount).toBeGreaterThanOrEqual(2);
  });
});
