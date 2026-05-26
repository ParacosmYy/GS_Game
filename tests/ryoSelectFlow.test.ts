import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  SelectState,
  RANDOM_SLOT_INDEX,
  TOTAL_SELECT_SLOTS,
  VS_SPLASH_DURATION,
  COLOR_PALETTES,
} from '../src/state/selectState.js';
import { ROSTER } from '../src/characters/index.js';
import type { PlayerInput } from '../src/core/types.js';
import { Fighter } from '../src/entities/fighter.js';
import { FighterController } from '../src/entities/fighterController.js';
import { CommandBuffer } from '../src/input/commandBuffer.js';
import { resetGameRng } from '../src/core/prng.js';
import type { CharacterDefinition } from '../src/characters/types.js';
import { Projectile } from '../src/entities/projectile.js';
import { VFXSystem } from '../src/rendering/vfx.js';
import { KyoDef } from '../src/characters/kyo.js';
import { IoriDef } from '../src/characters/iori.js';
import { RyoDef } from '../src/characters/ryo.js';

// Mock audio to avoid AudioContext dependency in tests
vi.mock('../src/audio/sampler.js', () => ({
  initAudio: vi.fn(),
  playSelect: vi.fn(),
}));

// --- Helpers ---

const RYO_ROSTER_INDEX = 4;

const noopInput: PlayerInput = {
  up: false, down: false, left: false, right: false,
  buttonA: false, buttonB: false, buttonC: false, buttonD: false,
  throwAttack: false, burst: false, start: false,
};

function makeInput(overrides: Partial<PlayerInput>): PlayerInput {
  return { ...noopInput, ...overrides };
}

function makeFighterController(fighter: Fighter, character: CharacterDefinition): FighterController {
  const cmdBuf = new CommandBuffer();
  const vfx = new VFXSystem();
  const projectiles: Projectile[] = [];
  const tickRef = { value: 0 };
  return new FighterController(fighter, 0, cmdBuf, vfx, projectiles, tickRef, character);
}

function createTestSelectState(): SelectState {
  const p1 = new Fighter(300, '#ff0000', 1 as const);
  const p2 = new Fighter(700, '#0000ff', -1 as const);
  const p1Ctrl = makeFighterController(p1, KyoDef);
  const p2Ctrl = makeFighterController(p2, IoriDef);
  const p2Cmd = new CommandBuffer();
  return new SelectState(p1Ctrl, p2Ctrl, p1, p2, p2Cmd);
}

/** Create SelectState and expose fighter references for post-select assertion. */
function createTestSelectStateWithFighters() {
  const p1 = new Fighter(300, '#ff0000', 1 as const);
  const p2 = new Fighter(700, '#0000ff', -1 as const);
  const p1Ctrl = makeFighterController(p1, KyoDef);
  const p2Ctrl = makeFighterController(p2, IoriDef);
  const p2Cmd = new CommandBuffer();
  const state = new SelectState(p1Ctrl, p2Ctrl, p1, p2, p2Cmd);
  return { state, p1, p2, p1Ctrl, p2Ctrl };
}

/** Navigate P1 cursor to a target slot by pressing right repeatedly. */
function navigateToSlot(state: SelectState, target: number): void {
  for (let i = 0; i < target; i++) {
    pressAndRelease(state, 'right');
  }
}

function pressAndRelease(
  state: SelectState,
  buttonField: keyof PlayerInput,
  p1Extra: Partial<PlayerInput> = {},
  p2Extra: Partial<PlayerInput> = {},
): void {
  state.update(
    makeInput({ [buttonField]: true, ...p1Extra }),
    makeInput(p2Extra),
    false,
  );
  state.update(
    makeInput({ [buttonField]: false, ...p1Extra }),
    makeInput(p2Extra),
    false,
  );
}

/** Run VS splash to completion and return SelectResult */
function completeSplash(state: SelectState): NonNullable<ReturnType<SelectState['update']>> {
  let result: ReturnType<SelectState['update']> = null;
  for (let i = 0; i < VS_SPLASH_DURATION + 1; i++) {
    result = state.update(noopInput, noopInput, false);
  }
  expect(result).not.toBeNull();
  return result!;
}

/** Full flow: navigate to Ryo, confirm with a button, complete splash. */
function selectRyoAndComplete(buttonIndex: 0 | 1 | 2 | 3 = 0) {
  const ctx = createTestSelectStateWithFighters();
  navigateToSlot(ctx.state, RYO_ROSTER_INDEX);
  const button: keyof PlayerInput = ['buttonA', 'buttonB', 'buttonC', 'buttonD'][buttonIndex] as keyof PlayerInput;
  ctx.state.update(makeInput({ [button]: true }), noopInput, false);
  const result = completeSplash(ctx.state);
  return { ...ctx, result };
}

beforeEach(() => {
  resetGameRng(54321);
});

// ============================================================
// 1. Ryo roster position
// ============================================================
describe('Ryo select flow — roster position', () => {
  it('Ryo exists in ROSTER at index 4 with correct identity and fields', () => {
    expect(ROSTER[RYO_ROSTER_INDEX]).toBe(RyoDef);
    expect(RyoDef.id).toBe('ryo');
    expect(RyoDef.name).toBe('Ryo Sakazaki');
    expect(RyoDef.nameCn).toBe('坂崎亮');
    expect(RyoDef.color).toBeDefined();
    expect(RyoDef.stats.maxHealth).toBe(1000);
    expect(typeof RyoDef.routeSpecial).toBe('function');
    expect(typeof RyoDef.routeNormal).toBe('function');
    expect(typeof RyoDef.onAttackActive).toBe('function');
  });
});

// ============================================================
// 2. Cursor navigation to Ryo
// ============================================================
describe('Ryo select flow — cursor navigation', () => {
  it('cursor navigates to Ryo slot via right presses and resolves to RyoDef', () => {
    const s = createTestSelectState();
    navigateToSlot(s, RYO_ROSTER_INDEX);
    expect(s.p1Cursor).toBe(RYO_ROSTER_INDEX);
    const char = s.getCharAtCursor(RYO_ROSTER_INDEX);
    expect(char).toBe(RyoDef);
    expect(char!.id).toBe('ryo');
  });
});

// ============================================================
// 3. Color selection (A/B/C/D)
// ============================================================
describe('Ryo select flow — color palette selection', () => {
  it('selecting Ryo with button A sets p1ColorIndex = 0', () => {
    const s = createTestSelectState();
    navigateToSlot(s, RYO_ROSTER_INDEX);
    pressAndRelease(s, 'buttonA');
    expect(s.p1Cursor).toBe(RYO_ROSTER_INDEX);
    expect(s.p1ColorIndex).toBe(0);
    expect(s.p1Ready).toBe(true);
  });

  it('selecting Ryo with button B sets p1ColorIndex = 1', () => {
    const s = createTestSelectState();
    navigateToSlot(s, RYO_ROSTER_INDEX);
    pressAndRelease(s, 'buttonB');
    expect(s.p1Cursor).toBe(RYO_ROSTER_INDEX);
    expect(s.p1ColorIndex).toBe(1);
    expect(s.p1Ready).toBe(true);
  });

  it('selecting Ryo with button C sets p1ColorIndex = 2', () => {
    const s = createTestSelectState();
    navigateToSlot(s, RYO_ROSTER_INDEX);
    pressAndRelease(s, 'buttonC');
    expect(s.p1Cursor).toBe(RYO_ROSTER_INDEX);
    expect(s.p1ColorIndex).toBe(2);
    expect(s.p1Ready).toBe(true);
  });

  it('selecting Ryo with button D sets p1ColorIndex = 3', () => {
    const s = createTestSelectState();
    navigateToSlot(s, RYO_ROSTER_INDEX);
    pressAndRelease(s, 'buttonD');
    expect(s.p1Cursor).toBe(RYO_ROSTER_INDEX);
    expect(s.p1ColorIndex).toBe(3);
    expect(s.p1Ready).toBe(true);
  });
});

// ============================================================
// 4. VS splash after selection
// ============================================================
describe('Ryo select flow — VS splash', () => {
  it('both players ready triggers VS splash with Ryo as p1ConfirmedChar', () => {
    const s = createTestSelectState();
    navigateToSlot(s, RYO_ROSTER_INDEX);
    s.update(makeInput({ buttonA: true }), noopInput, false);
    expect(s.p1Ready).toBe(true);
    expect(s.p2Ready).toBe(true);
    expect(s.vsSplashTimer).toBe(0);
    expect(s.p1ConfirmedChar).toBe(RyoDef);
  });

  it(`VS splash completes after ${VS_SPLASH_DURATION} frames with correct p1Char`, () => {
    const { result } = selectRyoAndComplete(0);
    expect(result.p1Char).toBe(RyoDef);
    expect(result.p1ColorIndex).toBe(0);
    expect(result.p2IsAI).toBe(true);
    expect(result.p2AI).not.toBeNull();
  });

  it('VS splash correctly resolves character from random slot', () => {
    const s = createTestSelectState();
    navigateToSlot(s, RANDOM_SLOT_INDEX);
    expect(s.isRandomSlot(s.p1Cursor)).toBe(true);
    s.update(makeInput({ buttonA: true }), noopInput, false);
    expect(s.p1ConfirmedChar).not.toBeNull();
    expect(ROSTER).toContain(s.p1ConfirmedChar);
  });
});

// ============================================================
// 5. Post-select character setup
// ============================================================
describe('Ryo select flow — post-select setup', () => {
  it('Fighter receives Ryo stats after selection (health, pushWidth)', () => {
    const { p1 } = selectRyoAndComplete(0);
    // confirm() calls p1.setStats(RyoDef.stats)
    expect(p1.maxHealth).toBe(RyoDef.stats.maxHealth);
    expect(p1.pushWidth).toBe(RyoDef.stats.pushWidth);
  });

  it('AI opponent is created with valid character definition from ROSTER', () => {
    const { result } = selectRyoAndComplete(0);
    expect(result.p2IsAI).toBe(true);
    expect(result.p2AI).not.toBeNull();
    expect(result.p2Char).toBeDefined();
    expect(ROSTER).toContain(result.p2Char);
  });
});

// ============================================================
// 6. Team battle with Ryo
// ============================================================
describe('Ryo select flow — team battle', () => {
  it("Ryo team is [Ryo, next1, next2] from ROSTER with wrapping", () => {
    const { result } = selectRyoAndComplete(0);
    const ryoIdx = ROSTER.indexOf(RyoDef);
    expect(result.p1Team).toHaveLength(3);
    expect(result.p1Team[0]).toBe(ROSTER[ryoIdx]);
    expect(result.p1Team[1]).toBe(ROSTER[(ryoIdx + 1) % ROSTER.length]);
    expect(result.p1Team[2]).toBe(ROSTER[(ryoIdx + 2) % ROSTER.length]);
  });

  it('P2 team also has 3 members wrapping around ROSTER', () => {
    const { result } = selectRyoAndComplete(0);
    expect(result.p2Team).toHaveLength(3);
    const p2Idx = ROSTER.indexOf(result.p2Char);
    expect(result.p2Team[0]).toBe(ROSTER[p2Idx]);
    expect(result.p2Team[1]).toBe(ROSTER[(p2Idx + 1) % ROSTER.length]);
    expect(result.p2Team[2]).toBe(ROSTER[(p2Idx + 2) % ROSTER.length]);
  });
});

// ============================================================
// 7. Random select including Ryo
// ============================================================
describe('Ryo select flow — random select', () => {
  it('random slot is at ROSTER.length and can produce Ryo on resolution', () => {
    expect(RANDOM_SLOT_INDEX).toBe(ROSTER.length);
    // Ryo is in ROSTER so resolveChar for random slot can return Ryo
    expect(ROSTER).toContain(RyoDef);
    expect(ROSTER.indexOf(RyoDef)).toBe(RYO_ROSTER_INDEX);
  });

  it('random slot cursor returns null before resolution', () => {
    const s = createTestSelectState();
    expect(s.getCharAtCursor(RANDOM_SLOT_INDEX)).toBeNull();
    expect(s.isRandomSlot(RANDOM_SLOT_INDEX)).toBe(true);
  });
});

// ============================================================
// 8. Color palette rendering data
// ============================================================
describe('Ryo select flow — color palette rendering', () => {
  it('COLOR_PALETTES has 4 variants (A/B/C/D) matching KOF2002 convention', () => {
    expect(COLOR_PALETTES).toHaveLength(4);
    expect(COLOR_PALETTES[0].label).toBe('A');
    expect(COLOR_PALETTES[1].label).toBe('B');
    expect(COLOR_PALETTES[2].label).toBe('C');
    expect(COLOR_PALETTES[3].label).toBe('D');
  });

  it('color index is preserved through VS splash to SelectResult for all 4 palettes', () => {
    for (let colorIdx = 0; colorIdx < 4; colorIdx++) {
      const { result } = selectRyoAndComplete(colorIdx as 0 | 1 | 2 | 3);
      expect(result.p1ColorIndex).toBe(colorIdx);
    }
  });
});
