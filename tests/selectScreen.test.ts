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

// Mock audio to avoid AudioContext dependency in tests
vi.mock('../src/audio/sampler.js', () => ({
  initAudio: vi.fn(),
  playSelect: vi.fn(),
}));

// --- Helpers ---

const noopInput: PlayerInput = {
  up: false, down: false, left: false, right: false,
  buttonA: false, buttonB: false, buttonC: false, buttonD: false,
  throwAttack: false, start: false,
};

function makeInput(overrides: Partial<PlayerInput>): PlayerInput {
  return { ...noopInput, ...overrides };
}

/** Create a real FighterController with minimal, non-null dependencies */
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

/**
 * Simulate an edge-detected button press: frame 1 = pressed, frame 2 = released.
 * Returns the state after the release frame so the edge detector is clean.
 */
function pressAndRelease(
  state: SelectState,
  buttonField: keyof PlayerInput,
  p1Extra: Partial<PlayerInput> = {},
  p2Extra: Partial<PlayerInput> = {},
): SelectState {
  // Frame 1: button goes down (edge fires)
  state.update(
    makeInput({ [buttonField]: true, ...p1Extra }),
    makeInput(p2Extra),
    false,
  );
  // Frame 2: button released (no repeat)
  state.update(
    makeInput({ [buttonField]: false, ...p1Extra }),
    makeInput(p2Extra),
    false,
  );
  return state;
}

beforeEach(() => {
  // Reset PRNG to a known seed so AI selection is deterministic
  resetGameRng(54321);
});

// ============================================================
// 1. Initial state
// ============================================================
describe('SelectState — initial state', () => {
  it('P1 cursor=0, P2 cursor=1, both not ready', () => {
    const s = createTestSelectState();
    expect(s.p1Cursor).toBe(0);
    expect(s.p2Cursor).toBe(1);
    expect(s.p1Ready).toBe(false);
    expect(s.p2Ready).toBe(false);
  });

  it(`TOTAL_SELECT_SLOTS = ROSTER.length + 1 (${ROSTER.length + 1})`, () => {
    expect(TOTAL_SELECT_SLOTS).toBe(28);
    expect(TOTAL_SELECT_SLOTS).toBe(ROSTER.length + 1);
  });

  it('COLOR_PALETTES has 4 options (A/B/C/D)', () => {
    expect(COLOR_PALETTES).toHaveLength(4);
    expect(COLOR_PALETTES[0].label).toBe('A');
    expect(COLOR_PALETTES[3].label).toBe('D');
  });
});

// ============================================================
// 2. P1 cursor movement
// ============================================================
describe('SelectState — P1 cursor movement', () => {
  it('right: 0 -> 1', () => {
    const s = createTestSelectState();
    pressAndRelease(s, 'right');
    expect(s.p1Cursor).toBe(1);
  });

  it('left wraps: 0 -> 27', () => {
    const s = createTestSelectState();
    pressAndRelease(s, 'left');
    expect(s.p1Cursor).toBe(TOTAL_SELECT_SLOTS - 1); // 27
  });

  it('down: 0 -> 8 (8-column grid)', () => {
    const s = createTestSelectState();
    pressAndRelease(s, 'down');
    expect(s.p1Cursor).toBe(8);
  });

  it('up wraps: 0 -> 20 (0 - 8 + 28 = 20)', () => {
    const s = createTestSelectState();
    pressAndRelease(s, 'up');
    expect(s.p1Cursor).toBe(TOTAL_SELECT_SLOTS - 8); // 20
  });

  it('edge detection prevents repeated movement on held button', () => {
    const s = createTestSelectState();
    // Hold right for multiple frames — should only move once
    const rightInput = makeInput({ right: true });
    s.update(rightInput, noopInput, false);
    expect(s.p1Cursor).toBe(1);
    // Still held — no edge, should not move again
    s.update(rightInput, noopInput, false);
    expect(s.p1Cursor).toBe(1);
  });
});

// ============================================================
// 3. Color selection and confirmation
// ============================================================
describe('SelectState — color selection and confirm', () => {
  it('buttonA selects colorIndex=0 and marks ready', () => {
    const s = createTestSelectState();
    pressAndRelease(s, 'buttonA');
    expect(s.p1ColorIndex).toBe(0);
    expect(s.p1Ready).toBe(true);
  });

  it('buttonD selects colorIndex=3 and marks ready', () => {
    const s = createTestSelectState();
    pressAndRelease(s, 'buttonD');
    expect(s.p1ColorIndex).toBe(3);
    expect(s.p1Ready).toBe(true);
  });

  it('after confirm, cursor movement is locked', () => {
    const s = createTestSelectState();
    pressAndRelease(s, 'buttonA');
    expect(s.p1Ready).toBe(true);
    // Try to move — should not move since P1 is ready
    pressAndRelease(s, 'right');
    expect(s.p1Cursor).toBe(0);
  });
});

// ============================================================
// 4. P2 AI auto-selection
// ============================================================
describe('SelectState — P2 AI auto-select', () => {
  it('when p2IsAI=true, P2 auto-selects after P1 confirms', () => {
    const s = createTestSelectState();
    expect(s.p2IsAI).toBe(true);
    pressAndRelease(s, 'buttonA');
    expect(s.p1Ready).toBe(true);
    // P2 should have been auto-selected by the same update that set p1Ready
    expect(s.p2Ready).toBe(true);
  });

  it('AI selects a different character from P1 (avoids P1 cursor)', () => {
    const s = createTestSelectState();
    pressAndRelease(s, 'buttonA');
    expect(s.p1Ready).toBe(true);
    expect(s.p2Ready).toBe(true);
    // The AI logic: aiCursor = (p1Cursor + 1 + random) % TOTAL
    // So p2Cursor should differ from p1Cursor
    expect(s.p2Cursor).not.toBe(s.p1Cursor);
  });

  it('AI picks a random color index in [0,3]', () => {
    const s = createTestSelectState();
    pressAndRelease(s, 'buttonA');
    expect(s.p2ColorIndex).toBeGreaterThanOrEqual(0);
    expect(s.p2ColorIndex).toBeLessThanOrEqual(3);
  });
});

// ============================================================
// 5. VS splash screen
// ============================================================
describe('SelectState — VS splash', () => {
  it('vsSplashTimer >= 0 when both confirm', () => {
    const s = createTestSelectState();
    // Frame 1: press buttonA -> p1Ready, AI auto-selects, vsSplashTimer=0
    s.update(makeInput({ buttonA: true }), noopInput, false);
    expect(s.p1Ready).toBe(true);
    expect(s.p2Ready).toBe(true);
    expect(s.vsSplashTimer).toBe(0);
  });

  it('update returns null during splash countdown', () => {
    const s = createTestSelectState();
    pressAndRelease(s, 'buttonA');
    // During splash, update should return null
    const result = s.update(noopInput, noopInput, false);
    expect(result).toBeNull();
  });

  it(`returns SelectResult after ${VS_SPLASH_DURATION} splash frames`, () => {
    const s = createTestSelectState();
    // Frame 1: button press -> confirm both, vsSplashTimer set to 0
    s.update(makeInput({ buttonA: true }), noopInput, false);
    expect(s.vsSplashTimer).toBe(0);

    // Run splash countdown from timer=0 to VS_SPLASH_DURATION
    // Each update increments vsSplashTimer. It returns SelectResult when >= VS_SPLASH_DURATION.
    let result: ReturnType<typeof s.update> = null;
    for (let i = 0; i < VS_SPLASH_DURATION; i++) {
      result = s.update(noopInput, noopInput, false);
    }
    expect(result).not.toBeNull();
    expect(result!.p1Char).toBeDefined();
    expect(result!.p2Char).toBeDefined();
    expect(result!.p1Team).toHaveLength(3);
    expect(result!.p2Team).toHaveLength(3);
    expect(result!.p2IsAI).toBe(true);
    expect(result!.p2AI).not.toBeNull();
    expect(typeof result!.p1ColorIndex).toBe('number');
    expect(typeof result!.p2ColorIndex).toBe('number');
  });
});

// ============================================================
// 6. Reset
// ============================================================
describe('SelectState — reset', () => {
  it('reset restores initial cursor positions', () => {
    const s = createTestSelectState();
    // Move P1 to slot 5
    for (let i = 0; i < 5; i++) pressAndRelease(s, 'right');
    expect(s.p1Cursor).toBe(5);
    s.reset();
    expect(s.p1Cursor).toBe(0);
    expect(s.p2Cursor).toBe(1);
  });

  it('reset clears ready states and splash timer', () => {
    const s = createTestSelectState();
    // Trigger confirm and start splash
    s.update(makeInput({ buttonA: true }), noopInput, false);
    expect(s.p1Ready).toBe(true);
    expect(s.p2Ready).toBe(true);
    expect(s.vsSplashTimer).toBe(0);
    s.reset();
    expect(s.p1Ready).toBe(false);
    expect(s.p2Ready).toBe(false);
    expect(s.vsSplashTimer).toBe(-1);
    expect(s.p1ColorIndex).toBe(0);
    expect(s.p2ColorIndex).toBe(1);
  });
});

// ============================================================
// 7. Random slot
// ============================================================
describe('SelectState — random slot', () => {
  it(`isRandomSlot(${RANDOM_SLOT_INDEX}) returns true`, () => {
    const s = createTestSelectState();
    expect(s.isRandomSlot(RANDOM_SLOT_INDEX)).toBe(true);
    expect(RANDOM_SLOT_INDEX).toBe(ROSTER.length); // 27
  });

  it('isRandomSlot(0) returns false', () => {
    const s = createTestSelectState();
    expect(s.isRandomSlot(0)).toBe(false);
  });

  it('getCharAtCursor(random slot) returns null', () => {
    const s = createTestSelectState();
    expect(s.getCharAtCursor(RANDOM_SLOT_INDEX)).toBeNull();
  });

  it('getCharAtCursor(valid index) returns character', () => {
    const s = createTestSelectState();
    const char = s.getCharAtCursor(0);
    expect(char).not.toBeNull();
    expect(char).toBe(ROSTER[0]);
  });
});
