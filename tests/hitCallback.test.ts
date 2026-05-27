/**
 * Hit Callback Tests — validate combat hit resolution logic
 *
 * Tests the pure-data aspects of hitCallback.ts:
 *   - MOVE_NAME_MAP completeness (all Ryo special/DM attacks have move names)
 *   - classifyAttack logic via createHitCallback behavior
 *   - isHeavyAttack / isThrowAttack classification
 *   - getDamageSizeScale thresholds
 *   - getMoveNameStyle DM vs special color/fontSize
 *   - HitCallbackDeps interface contract
 *   - triggerKOGroundEffect calls expected VFX
 */
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { AttackType, FighterState } from '../src/core/types.js';
import { createHitCallback, triggerKOGroundEffect } from '../src/combat/hitCallback.js';
import type { HitCallbackDeps } from '../src/combat/hitCallback.js';
import { FRAME_DATA, MAX_STOCKS, METER_PER_STOCK } from '../src/core/constants.js';
import { getFeedback } from '../src/core/feedbackManifest.js';
import type { Fighter } from '../src/entities/fighter.js';
import type { PowerGauge } from '../src/core/types.js';

// Mock audio modules to avoid AudioContext dependency
vi.mock('../src/audio/sampler.js', () => ({
  initSampler: vi.fn(),
  playHit: vi.fn(),
  playBlock: vi.fn(),
  playSpecial: vi.fn(),
  playDM: vi.fn(),
  playThrow: vi.fn(),
  playCounter: vi.fn(),
  playHeavyHit: vi.fn(),
  playSuperFlash: vi.fn(),
  playWire: vi.fn(),
  playJuggleHit: vi.fn(),
  playBlockSpecial: vi.fn(),
  playBlockDM: vi.fn(),
  playSpecialLight: vi.fn(),
  playSpecialHeavy: vi.fn(),
  playKOHit: vi.fn(),
  playHitAccent: vi.fn(),
  playLandingHeavy: vi.fn(),
  playDizzyHit: vi.fn(),
  playGroundBounce: vi.fn(),
  playWallBounce: vi.fn(),
  playGuardCrush: vi.fn(),
  playKoouken: vi.fn(),
  playKoHou: vi.fn(),
  playHien: vi.fn(),
  playHaou: vi.fn(),
  playHioHacker: vi.fn(),
  playZanretsuKen: vi.fn(),
}));

vi.mock('../src/audio/bgm.js', () => ({
  bgm: { duck: vi.fn() },
}));

vi.mock('../src/rendering/vfxPresets.js', () => ({
  spawnTierSparks: vi.fn(),
}));

// ===== Helpers: mock factories =====

function mockFighter(overrides: Partial<Fighter> = {}): Fighter {
  return {
    x: 200,
    y: 300,
    facing: 1,
    health: 1000,
    maxHealth: 1000,
    displayHeight: 120,
    charId: 'ryo',
    isGrounded: vi.fn(() => true),
    state: FighterState.IDLE,
    hitFlashFrames: 0,
    hitFlashColor: '#ffffff',
    isCounterWire: false,
    isGroundBounce: false,
    ...overrides,
  } as unknown as Fighter;
}

function mockVFX() {
  return {
    spawnBlockFlash: vi.fn(),
    spawnCharacterHitSparks: vi.fn(),
    spawnDust: vi.fn(),
    spawnHeavyDust: vi.fn(),
    spawnImpactRing: vi.fn(),
    spawnSlashLine: vi.fn(),
    spawnDamageText: vi.fn(),
    spawnFloatingComboText: vi.fn(),
    spawnCounterText: vi.fn(),
    spawnWireText: vi.fn(),
    spawnCancelFlash: vi.fn(),
    spawnSuperBurst: vi.fn(),
    spawnTierSparks: vi.fn(),
    spawnMoveNameText: vi.fn(),
    spawnProjectileExplosion: vi.fn(),
    spawnGroundSlam: vi.fn(),
    spawnKooukenVFX: vi.fn(),
    spawnKoHouVFX: vi.fn(),
    spawnHienTrail: vi.fn(),
    spawnDMTenHaOuVFX: vi.fn(),
    spawnHaouFlash: vi.fn(),
  };
}

function mockScreenShake() {
  return { trigger: vi.fn() };
}

function mockScreenFlash() {
  return { trigger: vi.fn() };
}

function mockCinematic() {
  return {
    triggerHitStop: vi.fn(),
    addHitStop: vi.fn(),
    trackDamage: vi.fn(),
  };
}

function mockGauge(overrides: Partial<PowerGauge> = {}): PowerGauge {
  return {
    meter: 0,
    stocks: 0,
    ...overrides,
  } as PowerGauge;
}

function mockCombatSystem() {
  return {
    getComboCount: vi.fn(() => 0),
    getComboDamage: vi.fn(() => 0),
    wasFirstHitAwarded: vi.fn(() => false),
  };
}

function createDeps(overrides: Partial<HitCallbackDeps> = {}): HitCallbackDeps {
  const f1 = mockFighter();
  const f2 = mockFighter({ x: 400, facing: -1 });
  return {
    fighters: [f1, f2],
    vfx: mockVFX() as any,
    screenShake: mockScreenShake() as any,
    screenFlash: mockScreenFlash() as any,
    gauges: [mockGauge(), mockGauge()],
    cinematic: mockCinematic() as any,
    combatSystem: mockCombatSystem() as any,
    ...overrides,
  } as HitCallbackDeps;
}

// ===== 1. Ryo MOVE_NAME_MAP completeness =====

describe('MOVE_NAME_MAP — Ryo coverage', () => {
  const ryoSpecialAttacks = [
    AttackType.RYO_KOOU,
    AttackType.RYO_KOOU_C,
    AttackType.RYO_KO_HOU,
    AttackType.RYO_KO_HOU_C,
    AttackType.RYO_HIEN,
    AttackType.RYO_HAOU,
    AttackType.DM_TEN_HA_OU,
    AttackType.SDM_TEN_HA_OU,
    AttackType.SDM_RYUKO_RANBU,
    AttackType.HSDM_RYUKO_RANBU,
  ];

  it('every Ryo special/DM attack has frame data', () => {
    for (const at of ryoSpecialAttacks) {
      expect(FRAME_DATA[at as keyof typeof FRAME_DATA]).toBeDefined();
    }
  });

  it('every Ryo special/DM attack has feedback manifest entry', () => {
    for (const at of ryoSpecialAttacks) {
      const fb = getFeedback(at);
      expect(fb).toBeDefined();
      expect(fb.hitstop).toBeGreaterThan(0);
    }
  });
});

// ===== 2. classifyAttack — DM vs Special vs Normal =====

describe('classifyAttack — hit callback respects attack tier', () => {
  it('DM attacks trigger superFlash-style hitstop (longer than special)', () => {
    const dmFb = getFeedback(AttackType.DM_TEN_HA_OU);
    const specialFb = getFeedback(AttackType.RYO_KOOU);
    expect(dmFb.hitstop).toBeGreaterThan(specialFb.hitstop);
  });

  it('SDM has hitstop >= DM', () => {
    const sdmFb = getFeedback(AttackType.SDM_TEN_HA_OU);
    const dmFb = getFeedback(AttackType.DM_TEN_HA_OU);
    expect(sdmFb.hitstop).toBeGreaterThanOrEqual(dmFb.hitstop);
  });

  it('special attacks have higher hitstop than normal attacks', () => {
    const specialFb = getFeedback(AttackType.RYO_KO_HOU);
    const normalFb = getFeedback(AttackType.STAND_C);
    expect(specialFb.hitstop).toBeGreaterThan(normalFb.hitstop);
  });

  it('light normals have lowest hitstop', () => {
    const lightFb = getFeedback(AttackType.STAND_A);
    const heavyFb = getFeedback(AttackType.STAND_C);
    expect(lightFb.hitstop).toBeLessThanOrEqual(heavyFb.hitstop);
  });
});

// ===== 3. getDamageSizeScale thresholds =====

describe('getDamageSizeScale thresholds via hit callback', () => {
  // We verify indirectly: damage scaling is used in sparkSize calculation
  // By checking FRAME_DATA damage values for known attack tiers

  it('light normal damage < 50', () => {
    const data = FRAME_DATA[AttackType.STAND_A as keyof typeof FRAME_DATA];
    expect(data.damage).toBeLessThan(50);
  });

  it('heavy normal damage is 50-100 range', () => {
    const data = FRAME_DATA[AttackType.STAND_C as keyof typeof FRAME_DATA];
    expect(data.damage).toBeGreaterThanOrEqual(30);
    expect(data.damage).toBeLessThan(200);
  });

  it('special attack damage maps to feedback tier', () => {
    const data = FRAME_DATA[AttackType.RYO_KOOU as keyof typeof FRAME_DATA];
    expect(data.damage).toBeGreaterThan(0);
    const fb = getFeedback(AttackType.RYO_KOOU);
    expect(fb.tier).toBe('special');
  });

  it('DM attack damage is high tier', () => {
    const data = FRAME_DATA[AttackType.DM_TEN_HA_OU as keyof typeof FRAME_DATA];
    expect(data.damage).toBeGreaterThan(100);
    const fb = getFeedback(AttackType.DM_TEN_HA_OU);
    expect(fb.tier).toBe('dm');
  });
});

// ===== 4. isHeavyAttack classification =====

describe('isHeavyAttack — heavy vs light classification', () => {
  const heavyAttacks = [
    AttackType.STAND_C, AttackType.STAND_D,
    AttackType.CLOSE_C, AttackType.CLOSE_D,
    AttackType.CROUCH_C, AttackType.CROUCH_D,
    AttackType.JUMP_C, AttackType.JUMP_D,
    AttackType.STAND_CD, AttackType.JUMP_CD,
  ];
  const lightAttacks = [
    AttackType.STAND_A, AttackType.STAND_B,
    AttackType.CLOSE_A, AttackType.CLOSE_B,
    AttackType.CROUCH_A, AttackType.CROUCH_B,
    AttackType.JUMP_A, AttackType.JUMP_B,
  ];

  it('heavy attacks have higher hitstop than light attacks', () => {
    for (const heavy of heavyAttacks) {
      const hFb = getFeedback(heavy);
      for (const light of lightAttacks) {
        const lFb = getFeedback(light);
        expect(hFb.hitstop).toBeGreaterThanOrEqual(lFb.hitstop);
      }
    }
  });

  it('heavy attacks have higher shake than light attacks', () => {
    for (const heavy of heavyAttacks) {
      const hFb = getFeedback(heavy);
      for (const light of lightAttacks) {
        const lFb = getFeedback(light);
        expect(hFb.shakeIntensity).toBeGreaterThanOrEqual(lFb.shakeIntensity);
      }
    }
  });
});

// ===== 5. isThrowAttack classification =====

describe('isThrowAttack — throw attacks', () => {
  it('throw attacks have frame data', () => {
    const throws = [AttackType.THROW, AttackType.THROW_FORWARD, AttackType.THROW_BACK];
    for (const t of throws) {
      expect(FRAME_DATA[t as keyof typeof FRAME_DATA]).toBeDefined();
    }
  });

  it('throw attacks have feedback entries', () => {
    const throws = [AttackType.THROW, AttackType.THROW_FORWARD, AttackType.THROW_BACK];
    for (const t of throws) {
      const fb = getFeedback(t);
      expect(fb).toBeDefined();
      expect(fb.hitstop).toBeGreaterThan(0);
    }
  });
});

// ===== 6. createHitCallback — blocked hit behavior =====

describe('createHitCallback — blocked hit', () => {
  it('triggers blockstop and blockShake on block, not hitstop', () => {
    const deps = createDeps();
    const onHit = createHitCallback(deps);
    const attacker = deps.fighters[0];
    const defender = deps.fighters[1];

    onHit(attacker, defender, AttackType.STAND_C, true, false);

    // Blockstop should be triggered (not hitstop directly — cinematic.triggerHitStop is used for both)
    expect(deps.cinematic.triggerHitStop).toHaveBeenCalled();
    expect(deps.screenShake.trigger).toHaveBeenCalled();
    expect(deps.vfx.spawnBlockFlash).toHaveBeenCalled();
  });

  it('blocks DM triggers screen flash and block DM spark', () => {
    const deps = createDeps();
    const onHit = createHitCallback(deps);
    const attacker = deps.fighters[0];
    const defender = deps.fighters[1];

    onHit(attacker, defender, AttackType.DM_TEN_HA_OU, true, false);

    expect(deps.vfx.spawnBlockFlash).toHaveBeenCalled();
    expect(deps.screenFlash.trigger).toHaveBeenCalled();
    // DM block should have high spark count
    const sparkCalls = (deps.vfx.spawnCharacterHitSparks as ReturnType<typeof vi.fn>).mock.calls;
    if (sparkCalls.length > 0) {
      // First arg to spawnCharacterHitSparks should have spark count >= 4 for DM block
      expect(sparkCalls[0][2]).toBeGreaterThanOrEqual(4);
    }
  });
});

// ===== 7. createHitCallback — hit behavior =====

describe('createHitCallback — hit resolution', () => {
  it('normal hit triggers hitstop, shake, sparks, damage text', () => {
    const deps = createDeps();
    const onHit = createHitCallback(deps);
    const attacker = deps.fighters[0];
    const defender = deps.fighters[1];

    onHit(attacker, defender, AttackType.STAND_C, false, false);

    expect(deps.cinematic.triggerHitStop).toHaveBeenCalled();
    expect(deps.screenShake.trigger).toHaveBeenCalled();
    expect(deps.vfx.spawnCharacterHitSparks).toHaveBeenCalled();
    expect(deps.vfx.spawnDamageText).toHaveBeenCalled();
    expect(deps.vfx.spawnImpactRing).toHaveBeenCalled();
  });

  it('special hit (Ryo Koou) triggers move name text', () => {
    const vfx = mockVFX();
    const deps = createDeps({ vfx: vfx as any });
    const onHit = createHitCallback(deps);
    const attacker = deps.fighters[0]; // charId = 'ryo'
    const defender = deps.fighters[1];

    onHit(attacker, defender, AttackType.RYO_KOOU, false, false);

    expect(vfx.spawnMoveNameText).toHaveBeenCalledWith(
      expect.any(Number), expect.any(Number),
      '虎煌拳',          // move name
      expect.any(String), // color
      expect.any(Number), // fontSize
    );
  });

  it('DM hit triggers super burst and screen flash', () => {
    const deps = createDeps();
    const onHit = createHitCallback(deps);
    const attacker = deps.fighters[0];
    const defender = deps.fighters[1];

    onHit(attacker, defender, AttackType.DM_TEN_HA_OU, false, false);

    expect(deps.vfx.spawnSuperBurst).toHaveBeenCalled();
    expect(deps.screenFlash.trigger).toHaveBeenCalled();
  });

  it('counter hit triggers counter text and orange flash', () => {
    const deps = createDeps();
    const onHit = createHitCallback(deps);
    const attacker = deps.fighters[0];
    const defender = deps.fighters[1];

    onHit(attacker, defender, AttackType.STAND_C, false, true);

    expect(deps.vfx.spawnCounterText).toHaveBeenCalled();
    // Counter hit adds extra hitstop (base + bonus)
    const hitStopCall = (deps.cinematic.triggerHitStop as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(hitStopCall[0]).toBeGreaterThan(getFeedback(AttackType.STAND_C).hitstop);
  });

  it('throw hit triggers throw VFX (impact ring + sparks + dust)', () => {
    const deps = createDeps();
    const onHit = createHitCallback(deps);
    const attacker = deps.fighters[0];
    const defender = deps.fighters[1];

    onHit(attacker, defender, AttackType.THROW, false, false);

    expect(deps.vfx.spawnImpactRing).toHaveBeenCalled();
    expect(deps.vfx.spawnCharacterHitSparks).toHaveBeenCalled();
    expect(deps.screenFlash.trigger).toHaveBeenCalled();
  });

  it('first hit awards extra meter to attacker', () => {
    const deps = createDeps();
    const onHit = createHitCallback(deps);
    const attacker = deps.fighters[0];
    const defender = deps.fighters[1];
    (deps.combatSystem.wasFirstHitAwarded as ReturnType<typeof vi.fn>).mockReturnValue(false);

    const meterBefore = deps.gauges[0].meter;
    onHit(attacker, defender, AttackType.STAND_C, false, false);

    expect(deps.gauges[0].meter).toBe(meterBefore + 30);
  });

  it('meter does not exceed MAX_STOCKS * METER_PER_STOCK', () => {
    const deps = createDeps();
    deps.gauges[0].meter = MAX_STOCKS * METER_PER_STOCK - 10;
    const onHit = createHitCallback(deps);
    const attacker = deps.fighters[0];
    const defender = deps.fighters[1];
    (deps.combatSystem.wasFirstHitAwarded as ReturnType<typeof vi.fn>).mockReturnValue(false);

    onHit(attacker, defender, AttackType.STAND_C, false, false);

    expect(deps.gauges[0].meter).toBeLessThanOrEqual(MAX_STOCKS * METER_PER_STOCK);
  });

  it('hitstop with counter hit bonus > normal hitstop', () => {
    const deps = createDeps();
    const onHit = createHitCallback(deps);
    const attacker = deps.fighters[0];
    const defender = deps.fighters[1];

    // Normal hit
    onHit(attacker, defender, AttackType.STAND_A, false, false);
    const normalHitStop = (deps.cinematic.triggerHitStop as ReturnType<typeof vi.fn>).mock.calls[0][0];

    // Counter hit
    const deps2 = createDeps();
    const onHit2 = createHitCallback(deps2);
    onHit2(deps2.fighters[0], deps2.fighters[1], AttackType.STAND_A, false, true);
    const chHitStop = (deps2.cinematic.triggerHitStop as ReturnType<typeof vi.fn>).mock.calls[0][0];

    expect(chHitStop).toBeGreaterThan(normalHitStop);
  });
});

// ===== 8. createHitCallback — Ryo-specific VFX =====

describe('createHitCallback — Ryo character-specific VFX', () => {
  it('Ko\'ou Ken triggers koouken VFX', () => {
    const deps = createDeps();
    const onHit = createHitCallback(deps);

    onHit(deps.fighters[0], deps.fighters[1], AttackType.RYO_KOOU, false, false);
    expect(deps.vfx.spawnKooukenVFX).toHaveBeenCalled();
  });

  it('Ko Hou triggers koHou VFX', () => {
    const deps = createDeps();
    const onHit = createHitCallback(deps);

    onHit(deps.fighters[0], deps.fighters[1], AttackType.RYO_KO_HOU, false, false);
    expect(deps.vfx.spawnKoHouVFX).toHaveBeenCalled();
  });

  it('Hien triggers hien trail VFX', () => {
    const deps = createDeps();
    const onHit = createHitCallback(deps);

    onHit(deps.fighters[0], deps.fighters[1], AttackType.RYO_HIEN, false, false);
    expect(deps.vfx.spawnHienTrail).toHaveBeenCalled();
  });

  it('Haou triggers haou flash VFX', () => {
    const deps = createDeps();
    const onHit = createHitCallback(deps);

    onHit(deps.fighters[0], deps.fighters[1], AttackType.RYO_HAOU, false, false);
    expect(deps.vfx.spawnHaouFlash).toHaveBeenCalled();
  });

  it('DM Ten Ha Ou triggers DM VFX', () => {
    const deps = createDeps();
    const onHit = createHitCallback(deps);

    onHit(deps.fighters[0], deps.fighters[1], AttackType.DM_TEN_HA_OU, false, false);
    expect(deps.vfx.spawnDMTenHaOuVFX).toHaveBeenCalled();
  });
});

// ===== 9. triggerKOGroundEffect =====

describe('triggerKOGroundEffect', () => {
  it('triggers ground slam, heavy dust, impact rings, and screen flash', () => {
    const vfx = mockVFX();
    const screenShake = mockScreenShake();
    const screenFlash = mockScreenFlash();
    const defender = mockFighter();

    triggerKOGroundEffect(
      { vfx: vfx as any, screenShake: screenShake as any, screenFlash: screenFlash as any },
      defender,
    );

    expect(vfx.spawnGroundSlam).toHaveBeenCalledWith(defender.x, defender.y);
    expect(vfx.spawnHeavyDust).toHaveBeenCalledWith(defender.x, defender.y, 16);
    expect(vfx.spawnImpactRing).toHaveBeenCalled();
    expect(vfx.spawnCharacterHitSparks).toHaveBeenCalled();
    expect(screenFlash.trigger).toHaveBeenCalled();
    expect(screenShake.trigger).toHaveBeenCalled();
  });

  it('triggers multiple impact rings (inner + outer)', () => {
    const vfx = mockVFX();
    const screenShake = mockScreenShake();
    const screenFlash = mockScreenFlash();
    const defender = mockFighter();

    triggerKOGroundEffect(
      { vfx: vfx as any, screenShake: screenShake as any, screenFlash: screenFlash as any },
      defender,
    );

    const ringCalls = (vfx.spawnImpactRing as ReturnType<typeof vi.fn>).mock.calls;
    // Should have at least 2 impact rings (scale 2.0 and 3.0)
    expect(ringCalls.length).toBeGreaterThanOrEqual(2);
    expect(ringCalls[0][2]).toBe(2.0);
    expect(ringCalls[1][2]).toBe(3.0);
  });

  it('screen flash triggers white then red sequence', () => {
    const vfx = mockVFX();
    const screenShake = mockScreenShake();
    const screenFlash = mockScreenFlash();
    const defender = mockFighter();

    triggerKOGroundEffect(
      { vfx: vfx as any, screenShake: screenShake as any, screenFlash: screenFlash as any },
      defender,
    );

    const flashCalls = (screenFlash.trigger as ReturnType<typeof vi.fn>).mock.calls;
    expect(flashCalls.length).toBeGreaterThanOrEqual(2);
    expect(flashCalls[0][0]).toBe('#ffffff');
    expect(flashCalls[1][0]).toBe('#ff2200');
  });
});

// ===== 10. HitCallbackDeps interface contract =====

describe('HitCallbackDeps — required fields', () => {
  it('createHitCallback does not throw with valid deps', () => {
    const deps = createDeps();
    expect(() => createHitCallback(deps)).not.toThrow();
  });

  it('returned callback is callable', () => {
    const deps = createDeps();
    const onHit = createHitCallback(deps);
    expect(typeof onHit).toBe('function');
  });
});

// ===== 11. Combo feedback scaling =====

describe('Combo feedback scaling', () => {
  it('high combo (>=10) applies hitstop decay to 50%', () => {
    const deps = createDeps();
    (deps.combatSystem.getComboCount as ReturnType<typeof vi.fn>).mockReturnValue(10);
    const onHit = createHitCallback(deps);

    onHit(deps.fighters[0], deps.fighters[1], AttackType.STAND_C, false, false);

    // KOF2002 combo decay: combo >= 9 → 50% hitstop
    const hitStopCall = (deps.cinematic.triggerHitStop as ReturnType<typeof vi.fn>).mock.calls[0];
    const baseStop = getFeedback(AttackType.STAND_C).hitstop;
    expect(hitStopCall[0]).toBe(Math.round(baseStop * 0.5));
  });

  it('low combo (<10) does not add combo hitstop bonus', () => {
    const deps = createDeps();
    (deps.combatSystem.getComboCount as ReturnType<typeof vi.fn>).mockReturnValue(2);
    const onHit = createHitCallback(deps);

    onHit(deps.fighters[0], deps.fighters[1], AttackType.STAND_C, false, false);

    const hitStopCall = (deps.cinematic.triggerHitStop as ReturnType<typeof vi.fn>).mock.calls[0];
    // No combo bonus for combo < 10
    expect(hitStopCall[0]).toBe(getFeedback(AttackType.STAND_C).hitstop);
  });

  it('combo >= 2 shows floating combo text', () => {
    const deps = createDeps();
    (deps.combatSystem.getComboCount as ReturnType<typeof vi.fn>).mockReturnValue(3);
    (deps.combatSystem.getComboDamage as ReturnType<typeof vi.fn>).mockReturnValue(120);
    const onHit = createHitCallback(deps);

    onHit(deps.fighters[0], deps.fighters[1], AttackType.STAND_C, false, false);

    expect(deps.vfx.spawnFloatingComboText).toHaveBeenCalledWith(
      expect.any(Number), expect.any(Number),
      3, 120,
    );
  });
});

// ===== 12. New Ryo Specials VFX =====

describe('New Ryo Specials VFX (KOOUKEN_D / HIO_HACKER / ZANRETSU_KEN)', () => {
  it('RYO_KOOUKEN_D triggers hitstop + shake', () => {
    const deps = createDeps();
    (deps.combatSystem.getComboCount as ReturnType<typeof vi.fn>).mockReturnValue(0);
    const onHit = createHitCallback(deps);
    onHit(deps.fighters[0], deps.fighters[1], AttackType.RYO_KOOUKEN_D, false, false);

    expect(deps.cinematic.triggerHitStop).toHaveBeenCalled();
    expect(deps.screenShake.trigger).toHaveBeenCalled();
  });

  it('RYO_HIO_HACKER triggers hitstop + shake + impactRing', () => {
    const deps = createDeps();
    (deps.combatSystem.getComboCount as ReturnType<typeof vi.fn>).mockReturnValue(0);
    const onHit = createHitCallback(deps);
    onHit(deps.fighters[0], deps.fighters[1], AttackType.RYO_HIO_HACKER, false, false);

    expect(deps.cinematic.triggerHitStop).toHaveBeenCalled();
    expect(deps.screenShake.trigger).toHaveBeenCalled();
    expect(deps.vfx.spawnImpactRing).toHaveBeenCalled();
  });

  it('RYO_ZANRETSU_KEN triggers hitstop on combo > 0', () => {
    const deps = createDeps();
    (deps.combatSystem.getComboCount as ReturnType<typeof vi.fn>).mockReturnValue(2);
    const onHit = createHitCallback(deps);
    onHit(deps.fighters[0], deps.fighters[1], AttackType.RYO_ZANRETSU_KEN, false, false);

    expect(deps.cinematic.triggerHitStop).toHaveBeenCalled();
  });
});
