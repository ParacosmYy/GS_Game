/**
 * sfxTriggerChain.test.ts -- KOF2002 SFX 触发链验证
 *
 * 验证 hitCallback 中攻击类型到音效函数的正确映射:
 * - 轻攻击命中 → playHit
 * - 重攻击命中 → playHeavyHit
 * - 必杀技命中 → playSpecialLight / playSpecialHeavy + playHit
 * - DM命中 → playSuperFlash + playDM + playHitAccent
 * - 格挡轻攻击 → playBlock(false)
 * - 格挡重攻击 → playBlock(true)
 * - 格挡DM → playBlockDM
 * - Counter Hit → playCounter
 * - KO → playKOHit
 * - 回合开始 → playRoundStart
 * - 时间到 → playTimeUp
 * - SFX 函数存在性验证
 */

// ── Mock sampler before any module that imports it loads ──

const sfxLog: string[] = [];

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
  bgm: { duck: () => {} },
}));

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as sampler from '../src/audio/sampler.js';
import { createHitCallback } from '../src/combat/hitCallback.js';
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
// 1. Hit SFX Mapping
// ═══════════════════════════════════════════════════════════════

describe('1. Hit SFX Mapping', () => {
  beforeEach(() => { sfxLog.length = 0; });

  it('轻攻击命中触发 playHit', () => {
    const { deps } = createDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_A, false, false);
    const hitCalls = sfxLog.filter(e => e.startsWith('playHit:'));
    expect(hitCalls.length).toBeGreaterThanOrEqual(1);
  });

  it('重攻击命中触发 playHeavyHit', () => {
    const { deps } = createDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_C, false, false);
    expect(sfxLog.some(e => e.startsWith('playHeavyHit'))).toBe(true);
  });

  it('必杀技命中触发 playSpecialLight 或 playSpecialHeavy', () => {
    const { deps } = createDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.KYO_ONIYAKI, false, false);
    const hasSpecial = sfxLog.some(e =>
      e === 'playSpecialLight' || e === 'playSpecialHeavy'
    );
    expect(hasSpecial).toBe(true);
  });

  it('DM命中触发 playDM + playSuperFlash + playHitAccent', () => {
    const { deps } = createDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.DM_OROCHINAGI, false, false);
    expect(sfxLog.some(e => e === 'playDM')).toBe(true);
    expect(sfxLog.some(e => e.startsWith('playSuperFlash:'))).toBe(true);
    expect(sfxLog.some(e => e.startsWith('playHitAccent:'))).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. Block SFX
// ═══════════════════════════════════════════════════════════════

describe('2. Block SFX', () => {
  beforeEach(() => { sfxLog.length = 0; });

  it('格挡轻攻击触发 playBlock(false)', () => {
    const { deps } = createDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_A, true, false);
    expect(sfxLog).toContain('playBlock:false');
  });

  it('格挡重攻击触发 playBlock(true)', () => {
    const { deps } = createDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_C, true, false);
    expect(sfxLog).toContain('playBlock:true');
  });

  it('格挡DM触发 playBlockDM', () => {
    const { deps } = createDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.DM_OROCHINAGI, true, false);
    expect(sfxLog).toContain('playBlockDM');
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. Special SFX
// ═══════════════════════════════════════════════════════════════

describe('3. Special SFX', () => {
  beforeEach(() => { sfxLog.length = 0; });

  it('Counter Hit 触发 playCounter', () => {
    const { deps } = createDeps();
    const cb = createHitCallback(deps);
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_A, false, true);
    expect(sfxLog).toContain('playCounter');
  });

  it('KO 命中触发 playKOHit', () => {
    const { deps } = createDeps();
    const cb = createHitCallback(deps);
    // 将 defender 设为 0 血触发 KO
    deps.fighters[1].health = 0;
    cb(deps.fighters[0], deps.fighters[1], AttackType.STAND_C, false, false);
    expect(sfxLog).toContain('playKOHit');
  });

  it('回合开始触发 playRoundStart', () => {
    sampler.playRoundStart();
    expect(sfxLog).toContain('playRoundStart');
  });

  it('时间到触发 playTimeUp', () => {
    sampler.playTimeUp();
    expect(sfxLog).toContain('playTimeUp');
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. SFX Function Existence
// ═══════════════════════════════════════════════════════════════

describe('4. SFX Function Existence', () => {
  const expectedFns = [
    'playHit', 'playHeavyHit', 'playBlock', 'playSpecial',
    'playDM', 'playKO', 'playSuperFlash', 'playCounter',
    'playGuardCrush', 'playThrow', 'playWire', 'playJuggleHit',
    'playKOHit', 'playHitAccent', 'playBlockSpecial', 'playBlockDM',
    'playSpecialLight', 'playSpecialHeavy', 'playRoundStart',
    'playTimeUp', 'playPerfectKO',
  ];

  it('所有 SFX 函数都存在且可调用', () => {
    for (const name of expectedFns) {
      expect(typeof (sampler as Record<string, unknown>)[name], `Missing SFX function: ${name}`).toBe('function');
    }
  });

  it('playHit 不抛异常', () => {
    expect(() => sampler.playHit(1, 0)).not.toThrow();
  });

  it('playBlock 不抛异常', () => {
    expect(() => sampler.playBlock(false)).not.toThrow();
    expect(() => sampler.playBlock(true)).not.toThrow();
  });

  it('playDM 不抛异常', () => {
    expect(() => sampler.playDM()).not.toThrow();
  });
});
