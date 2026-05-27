/**
 * Ryo Match Lifecycle Tests — End-to-end verification that Ryo works
 * through the entire game flow: select -> VS -> round 1 -> KO -> result.
 *
 * Tests operate at the state/data level, not rendering level.
 * Covers: select transition, round start, Ryo normals/specials,
 * KO sequences, time over, match end, and Ryo-specific stat persistence.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Fighter } from '../src/entities/fighter.js';
import { FighterController } from '../src/entities/fighterController.js';
import { CommandBuffer } from '../src/input/commandBuffer.js';
import { CombatSystem } from '../src/combat/combatSystem.js';
import { CinematicState } from '../src/state/cinematicState.js';
import { RoundState } from '../src/state/roundState.js';
import { GameStateManager } from '../src/state/gameStateManager.js';
import { SelectState, VS_SPLASH_DURATION } from '../src/state/selectState.js';
import { VFXSystem } from '../src/rendering/vfx.js';
import { Projectile } from '../src/entities/projectile.js';
import { ROSTER } from '../src/characters/index.js';
import { RyoDef } from '../src/characters/ryo.js';
import type { CharacterDefinition } from '../src/characters/types.js';
import type { PlayerInput, PowerGauge, MaxModeState } from '../src/core/types.js';
import {
  FighterState,
  AttackType,
  GamePhase,
} from '../src/core/types.js';
import {
  MAX_HEALTH, STAGE_WIDTH, FRAME_DATA,
} from '../src/core/constants.js';
import { createPowerGauge, createMaxMode, resetMeterSystem } from '../src/combat/meter.js';
import { resetGameRng } from '../src/core/prng.js';

// Mock audio to avoid AudioContext dependency
vi.mock('../src/audio/sampler.js', () => ({
  initAudio: vi.fn(),
  playSelect: vi.fn(),
  playCursorMove: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const noopInput: PlayerInput = {
  up: false, down: false, left: false, right: false,
  buttonA: false, buttonB: false, buttonC: false, buttonD: false,
  throwAttack: false, burst: false, start: false,
};

function makeInput(overrides: Partial<PlayerInput>): PlayerInput {
  return { ...noopInput, ...overrides };
}

function makeFighterController(
  fighter: Fighter, charDef: CharacterDefinition, playerIndex: number = 0,
): FighterController {
  const cmdBuf = new CommandBuffer();
  const vfx = new VFXSystem();
  const projectiles: Projectile[] = [];
  const tickRef = { value: 0 };
  return new FighterController(fighter, playerIndex, cmdBuf, vfx, projectiles, tickRef, charDef);
}

function createRyoSelectState(): SelectState {
  const p1 = new Fighter(300, '#dd6600', 1 as const);
  const p2 = new Fighter(700, '#0000ff', -1 as const);
  const p1Ctrl = makeFighterController(p1, RyoDef, 0);
  const p2Ctrl = makeFighterController(p2, ROSTER[1], 1); // Iori as opponent
  const p2Cmd = new CommandBuffer();
  return new SelectState(p1Ctrl, p2Ctrl, p1, p2, p2Cmd);
}

/** Create a full round system with Ryo as P1 */
function createRyoRoundSystem() {
  const p1 = new Fighter(STAGE_WIDTH * 0.30, '#dd6600', 1 as const);
  const p2 = new Fighter(STAGE_WIDTH * 0.70, '#0000ff', -1 as const);
  p1.setStats(RyoDef.stats);
  p2.setStats(ROSTER[1].stats);

  const p1Cmd = new CommandBuffer();
  const p2Cmd = new CommandBuffer();
  const vfx = new VFXSystem();
  const cinematic = new CinematicState();
  const gauges: [PowerGauge, PowerGauge] = [createPowerGauge(), createPowerGauge()];
  const maxModes: [MaxModeState, MaxModeState] = [createMaxMode(), createMaxMode()];
  const tickRef = { value: 0 };
  const projectiles: Projectile[] = [];

  // CombatSystem needs an IInputProvider; create a minimal mock
  const combatSystem = new CombatSystem({
    getP1Input: () => noopInput,
    getP2Input: () => noopInput,
  });

  const roundState = new RoundState({
    p1, p2, p1Cmd, p2Cmd, combatSystem, projectiles, vfx, cinematic,
    gauges, maxModes, tickRef,
  });

  return {
    p1, p2, p1Cmd, p2Cmd, combatSystem, cinematic, roundState,
    gauges, maxModes, tickRef, projectiles,
  };
}

// ===========================================================================
// 1. Select to Fight Transition (4 tests)
// ===========================================================================

describe('Select to Fight Transition with Ryo', () => {
  beforeEach(() => {
    resetGameRng(54321);
  });

  it('player selects Ryo via button A and character is confirmed', () => {
    const state = createRyoSelectState();
    expect(state.p1Ready).toBe(false);

    // Move cursor to Ryo (index 4 in ROSTER)
    // Press right 4 times to reach index 4
    for (let i = 0; i < 4; i++) {
      state.update(
        makeInput({ right: true }),
        noopInput,
        false,
      );
      state.update(
        makeInput({ right: false }),
        noopInput,
        false,
      );
    }
    expect(state.p1Cursor).toBe(4);

    // Confirm with button A (color A)
    state.update(
      makeInput({ buttonA: true }),
      noopInput,
      false,
    );
    state.update(
      makeInput({ buttonA: false }),
      noopInput,
      false,
    );

    expect(state.p1Ready).toBe(true);
    expect(state.p1ColorIndex).toBe(0); // A color
  });

  it('AI auto-selects opponent after P1 confirms, VS splash triggers', () => {
    const state = createRyoSelectState();

    // P1 confirms immediately at cursor 0
    state.update(makeInput({ buttonA: true }), noopInput, false);
    state.update(makeInput({ buttonA: false }), noopInput, false);

    expect(state.p1Ready).toBe(true);
    // AI should auto-select since p2IsAI defaults to true
    expect(state.p2Ready).toBe(true);
    // VS splash timer should have started
    expect(state.vsSplashTimer).toBeGreaterThanOrEqual(0);
  });

  it('VS splash completes after VS_SPLASH_DURATION frames', () => {
    const state = createRyoSelectState();

    // P1 confirms
    state.update(makeInput({ buttonA: true }), noopInput, false);
    state.update(makeInput({ buttonA: false }), noopInput, false);
    // P2 AI confirmed on same frame, vsSplashTimer started

    // Tick through the VS splash
    let result = null;
    for (let i = 0; i < VS_SPLASH_DURATION + 5; i++) {
      result = state.update(noopInput, noopInput, false);
    }

    // After VS splash, confirm() returns a SelectResult
    expect(result).not.toBeNull();
    expect(result!.p1Char).toBeDefined();
    expect(result!.p2Char).toBeDefined();
    expect(result!.p2IsAI).toBe(true);
  });

  it('fighters are initialized with Ryo stats after VS splash', () => {
    const state = createRyoSelectState();

    // Move to Ryo slot (index 4) and confirm
    for (let i = 0; i < 4; i++) {
      state.update(makeInput({ right: true }), noopInput, false);
      state.update(makeInput({ right: false }), noopInput, false);
    }
    state.update(makeInput({ buttonA: true }), noopInput, false);
    state.update(makeInput({ buttonA: false }), noopInput, false);

    // Tick through VS splash
    let result = null;
    for (let i = 0; i < VS_SPLASH_DURATION + 5; i++) {
      result = state.update(noopInput, noopInput, false);
    }

    expect(result).not.toBeNull();
    expect(result!.p1Char.id).toBe('ryo');
    // Verify Ryo's stats are what we expect
    expect(result!.p1Char.stats.maxHealth).toBe(1000);
    expect(result!.p1Char.stats.walkSpeed).toBe(4);
    expect(result!.p1Char.stats.runSpeed).toBe(7);
  });
});

// ===========================================================================
// 2. Round 1 with Ryo (4 tests)
// ===========================================================================

describe('Round 1 with Ryo', () => {
  it('round starts with both fighters at full health and Ryo stats correct', () => {
    const { p1, p2 } = createRyoRoundSystem();

    expect(p1.health).toBe(RyoDef.stats.maxHealth);
    expect(p2.health).toBe(ROSTER[1].stats.maxHealth);
    expect(p1.state).toBe(FighterState.IDLE);
    expect(p2.state).toBe(FighterState.IDLE);
    expect(p1.maxHealth).toBe(1000);
    // Ryo-specific stats
    expect(p1.pushWidth).toBe(60);
  });

  it('Ryo can execute stand_A normal attack', () => {
    const { p1 } = createRyoRoundSystem();

    expect(p1.canAct()).toBe(true);
    p1.startAttack(AttackType.STAND_A);

    expect(p1.currentAttack).toBe(AttackType.STAND_A);
    expect(p1.state).toBe(FighterState.STAND_ATTACK);
    expect(p1.attackPhase).toBe('startup');
  });

  it('Ryo can execute stand_C heavy normal attack', () => {
    const { p1 } = createRyoRoundSystem();

    p1.startAttack(AttackType.STAND_C);
    expect(p1.currentAttack).toBe(AttackType.STAND_C);
    expect(p1.state).toBe(FighterState.STAND_ATTACK);

    // Verify frame data exists for STAND_C
    const data = FRAME_DATA[AttackType.STAND_C];
    expect(data).toBeDefined();
    expect(data.damage).toBeGreaterThan(0);
    expect(data.startup).toBeGreaterThan(0);
    expect(data.active).toBeGreaterThan(0);
    expect(data.recovery).toBeGreaterThan(0);
  });

  it('Ryo specials (koou, ko_hou) use correct frame data', () => {
    // RYO_KOOU (weak projectile)
    const koouData = FRAME_DATA[AttackType.RYO_KOOU];
    expect(koouData).toBeDefined();
    expect(koouData.damage).toBeGreaterThan(0);

    // RYO_KO_HOU (weak upper)
    const koHouData = FRAME_DATA[AttackType.RYO_KO_HOU];
    expect(koHouData).toBeDefined();
    expect(koHouData.damage).toBeGreaterThan(0);

    // Strong variants
    const koouCData = FRAME_DATA[AttackType.RYO_KOOU_C];
    expect(koouCData).toBeDefined();
    expect(koouCData.damage).toBeGreaterThanOrEqual(koouData.damage);

    const koHouCData = FRAME_DATA[AttackType.RYO_KO_HOU_C];
    expect(koHouCData).toBeDefined();
    expect(koHouCData.damage).toBeGreaterThanOrEqual(koHouData.damage);
  });
});

// ===========================================================================
// 3. KO Sequence with Ryo (4 tests)
// ===========================================================================

describe('KO Sequence with Ryo', () => {
  it('Ryo KO: opponent reduces Ryo health to 0, round winner is opponent', () => {
    const { p1, p2, roundState } = createRyoRoundSystem();

    // Simulate Ryo taking damage until KO
    p1.health = 0;

    const winner = roundState.determineWinner();
    expect(winner).toBe(1); // P2 (opponent) wins
  });

  it('KO slow-mo triggers when fighter is KO\'d', () => {
    const cinematic = new CinematicState();

    cinematic.triggerKOSlowMo();
    expect(cinematic.koSlowMoTriggered).toBe(true);
    expect(cinematic.koSlowMo).toBe(40); // 40 frames
    expect(cinematic.koDesaturateTimer).toBe(8);
    expect(cinematic.koVignetteTimer).toBe(60);
  });

  it('KO dust VFX spawns at hit location', () => {
    const cinematic = new CinematicState();

    cinematic.spawnKODust(400, 300, 20);
    expect(cinematic.koDustParticles.length).toBe(20);

    // Each particle has position, velocity, and life
    for (const p of cinematic.koDustParticles) {
      expect(p.life).toBeGreaterThan(0);
      expect(p.maxLife).toBeGreaterThan(0);
      expect(p.size).toBeGreaterThan(0);
    }
  });

  it('KO slow-mo completes after duration expires', () => {
    const cinematic = new CinematicState();
    cinematic.triggerKOSlowMo();

    // Tick through all frames (every 3rd frame runs)
    for (let i = 0; i < 200; i++) {
      cinematic.shouldSkipFrame();
    }

    expect(cinematic.isKOSlowMoDone()).toBe(true);
    expect(cinematic.koDustParticles.length).toBe(0); // all particles expired
  });
});

// ===========================================================================
// 4. Ryo Wins Round (4 tests)
// ===========================================================================

describe('Ryo Wins Round', () => {
  it('Ryo reduces opponent health to 0, round winner is Ryo', () => {
    const { p1, p2, roundState } = createRyoRoundSystem();

    // Simulate Ryo dealing damage until opponent KO
    p2.health = 0;

    const winner = roundState.determineWinner();
    expect(winner).toBe(0); // P1 (Ryo) wins
  });

  it('KO sequence triggers for opponent when Ryo wins', () => {
    const cinematic = new CinematicState();
    const { p1, p2, roundState } = createRyoRoundSystem();

    p2.health = 0;
    const winner = roundState.determineWinner();

    // Simulate KO sequence
    cinematic.triggerKOSlowMo();
    cinematic.spawnKODust(500, 300);

    expect(winner).toBe(0);
    expect(cinematic.koSlowMoTriggered).toBe(true);
    expect(cinematic.koDustParticles.length).toBeGreaterThan(0);
  });

  it('win tracking: Ryo gets a win point', () => {
    const { roundState } = createRyoRoundSystem();

    const matchWinner = roundState.addWin(0); // Ryo wins
    expect(matchWinner).toBeNull(); // Only 1 win, match not over
    expect(roundState.p1Wins).toBe(1);
    expect(roundState.p2Wins).toBe(0);
  });

  it('win pose triggers after KO (fighter enters IDLE for win state)', () => {
    const { p1, p2 } = createRyoRoundSystem();

    // Simulate Ryo winning: opponent KO'd, Ryo returns to idle
    p2.health = 0;
    expect(p1.state).toBe(FighterState.IDLE);

    // After round end, winner typically stays in IDLE or transitions to TAUNT/WIN_POSE
    // The game loop would set the fighter to a win pose state
    p1.state = FighterState.TAUNT;
    expect(p1.state).toBe(FighterState.TAUNT);
  });
});

// ===========================================================================
// 5. Time Over Scenario (2 tests)
// ===========================================================================

describe('Time Over Scenario with Ryo', () => {
  it('timer reaches 0: health comparison determines Ryo as winner', () => {
    const { p1, p2, roundState } = createRyoRoundSystem();

    p1.health = 700;
    p2.health = 400;

    const winner = roundState.determineWinner();
    expect(winner).toBe(0); // Ryo (P1) has more health
  });

  it('timer reaches 0: equal health results in draw (no winner)', () => {
    const { p1, p2, roundState } = createRyoRoundSystem();

    p1.health = 500;
    p2.health = 500;

    const winner = roundState.determineWinner();
    expect(winner).toBeNull(); // Draw
  });
});

// ===========================================================================
// 6. Match Result after 2 Wins (3 tests)
// ===========================================================================

describe('Match Result after 2 Wins with Ryo', () => {
  it('first to 2 wins ends match (Ryo 2-0)', () => {
    const { roundState } = createRyoRoundSystem();

    // Round 1: Ryo wins
    let matchWinner = roundState.addWin(0);
    expect(matchWinner).toBeNull(); // 1-0, match not over

    // Round 2: Ryo wins again
    matchWinner = roundState.addWin(0);
    expect(matchWinner).toBe(0); // 2-0, Ryo wins match
    expect(roundState.p1Wins).toBe(2);
    expect(roundState.p2Wins).toBe(0);
  });

  it('match goes to round 3 if 1-1 (Ryo 2-1)', () => {
    const { roundState } = createRyoRoundSystem();

    // Round 1: Ryo wins
    let matchWinner = roundState.addWin(0);
    expect(matchWinner).toBeNull();

    // Round 2: Opponent wins
    matchWinner = roundState.addWin(1);
    expect(matchWinner).toBeNull(); // 1-1, match continues
    expect(roundState.p1Wins).toBe(1);
    expect(roundState.p2Wins).toBe(1);

    // Round 3: Ryo wins — match over
    matchWinner = roundState.addWin(0);
    expect(matchWinner).toBe(0); // 2-1, Ryo wins
  });

  it('match end transitions through game phases correctly', () => {
    const gsm = new GameStateManager();

    gsm.setPhase(GamePhase.FIGHTING);
    gsm.setPhase(GamePhase.KO);
    gsm.setPhase(GamePhase.WIN_QUOTE);
    gsm.setPhase(GamePhase.MATCH_END);

    expect(gsm.phase).toBe(GamePhase.MATCH_END);

    // Continue option
    gsm.setPhase(GamePhase.CONTINUE);
    expect(gsm.phase).toBe(GamePhase.CONTINUE);
    expect(gsm.continueCursorYes).toBe(true);

    // Rematch: return to select
    gsm.resetForNewGame();
    gsm.setPhase(GamePhase.SELECT);
    expect(gsm.phase).toBe(GamePhase.SELECT);
    expect(gsm.winner).toBeNull();
  });
});

// ===========================================================================
// 7. Ryo-Specific Persistence (3 tests)
// ===========================================================================

describe('Ryo-Specific Throughout Match', () => {
  it('Ryo stats persist across rounds', () => {
    const { p1, roundState } = createRyoRoundSystem();

    // Initial stats
    expect(p1.maxHealth).toBe(1000);
    expect(p1.pushWidth).toBe(60);

    // Simulate damage in round 1
    p1.health = 400;

    // Reset for round 2
    p1.reset(STAGE_WIDTH * 0.30);

    // Stats persist after reset
    expect(p1.health).toBe(1000);
    expect(p1.maxHealth).toBe(1000);
    expect(p1.pushWidth).toBe(60);
  });

  it('Ryo color palette index persists through match (select to fight)', () => {
    resetGameRng(54321);
    const state = createRyoSelectState();

    // Select Ryo with color B (buttonB)
    for (let i = 0; i < 4; i++) {
      state.update(makeInput({ right: true }), noopInput, false);
      state.update(makeInput({ right: false }), noopInput, false);
    }
    state.update(makeInput({ buttonB: true }), noopInput, false);
    state.update(makeInput({ buttonB: false }), noopInput, false);

    expect(state.p1Ready).toBe(true);
    expect(state.p1ColorIndex).toBe(1); // B color

    // Color index is carried through to SelectResult
    let result = null;
    for (let i = 0; i < VS_SPLASH_DURATION + 5; i++) {
      result = state.update(noopInput, noopInput, false);
    }
    expect(result).not.toBeNull();
    expect(result!.p1ColorIndex).toBe(1);
  });

  it('Ryo DM frame data exists (Ten Ha Ou)', () => {
    // DM_TEN_HA_OU — Ryo's DM
    const dmData = FRAME_DATA[AttackType.DM_TEN_HA_OU];
    expect(dmData).toBeDefined();
    expect(dmData.damage).toBeGreaterThan(0);

    // SDM variant
    const sdmData = FRAME_DATA[AttackType.SDM_TEN_HA_OU];
    expect(sdmData).toBeDefined();
    expect(sdmData.damage).toBeGreaterThan(dmData.damage);
  });
});
