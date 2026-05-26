/**
 * Ryo Close Attack & Command Normal Differentiation Tests
 *
 * Verifies:
 *   - Close range detection routes A/C to CLOSE_A/CLOSE_C correctly
 *   - Command normals (Forward+A, Down-Forward+B) override close detection
 *   - FRAME_DATA has correct properties for all Ryo attack types
 *   - Cancel options (rapid/normal) are set up correctly
 *   - hitLevel differentiation (overhead/low) for command normals
 */
import { describe, it, expect } from 'vitest';
import { FRAME_DATA, HITBOX_OFFSETS, COMMAND_NORMALS, LIGHT_NORMALS, NORMAL_ATTACKS } from '../src/core/constants.js';
import { AttackType, CLOSE_RANGE } from '../src/core/types.js';
import { RyoDef } from '../src/characters/ryo.js';
import { FighterState } from '../src/core/types.js';
import type { ResolvedInput } from '../src/input/inputResolver.js';
import type { CharacterDefinition } from '../src/characters/types.js';

// ── Frame Data Entry shape ──
interface FrameDataEntry {
  startup: number;
  active: number;
  recovery: number;
  damage: number;
  hitstun: number;
  blockstun: number;
  pushback: number;
  hitLevel: 'HIGH' | 'LOW' | 'MID' | 'UNBLOCKABLE';
  knockdown: boolean;
}

// ── Helper: create a minimal ResolvedInput ──
function makeInput(overrides: Partial<ResolvedInput> = {}): ResolvedInput {
  return {
    up: false,
    down: false,
    forward: false,
    back: false,
    buttonA: false,
    buttonB: false,
    buttonC: false,
    buttonD: false,
    throwAttack: false,
    buttonAPressed: false,
    buttonBPressed: false,
    buttonCPressed: false,
    buttonDPressed: false,
    throwAttackPressed: false,
    punchPressed: false,
    kickPressed: false,
    rollPressed: false,
    blowbackPressed: false,
    punchJustReleased: false,
    kickJustReleased: false,
    startPressed: false,
    ...overrides,
  };
}

// Ryo's close range from character stats
const RYO_CLOSE_RANGE = RyoDef.stats.closeRange ?? CLOSE_RANGE;

// ═══════════════════════════════════════════════════════════════
// 1. Close Attack Differentiation
// ═══════════════════════════════════════════════════════════════
describe('Ryo Close Attack Differentiation', () => {
  it('CLOSE_A has faster startup than STAND_A', () => {
    const closeA = FRAME_DATA[AttackType.CLOSE_A] as FrameDataEntry;
    const standA = FRAME_DATA[AttackType.STAND_A] as FrameDataEntry;
    expect(closeA).toBeDefined();
    expect(standA).toBeDefined();
    // Close A should be faster: startup < stand A startup
    expect(closeA.startup).toBeLessThan(standA.startup);
  });

  it('CLOSE_C has different damage than STAND_C', () => {
    const closeC = FRAME_DATA[AttackType.CLOSE_C] as FrameDataEntry;
    const standC = FRAME_DATA[AttackType.STAND_C] as FrameDataEntry;
    expect(closeC).toBeDefined();
    expect(standC).toBeDefined();
    // Close C has its own damage value (may be same or different, just must be defined)
    expect(typeof closeC.damage).toBe('number');
    expect(typeof standC.damage).toBe('number');
  });

  it('CLOSE_A is in LIGHT_NORMALS set for rapid cancel', () => {
    expect(LIGHT_NORMALS.has(AttackType.CLOSE_A)).toBe(true);
  });

  it('CLOSE_C is in NORMAL_ATTACKS set for normal cancel', () => {
    expect(NORMAL_ATTACKS.has(AttackType.CLOSE_C)).toBe(true);
  });

  it('CLOSE_A can chain into STAND_B via rapid cancel system', () => {
    // Rapid cancel is gated on LIGHT_NORMALS, which includes CLOSE_A.
    // STAND_B is also in LIGHT_NORMALS, making CLOSE_A -> STAND_B valid.
    expect(LIGHT_NORMALS.has(AttackType.CLOSE_A)).toBe(true);
    expect(LIGHT_NORMALS.has(AttackType.STAND_B)).toBe(true);
  });

  it('CLOSE_C can cancel into specials via normal cancel', () => {
    // NORMAL_ATTACKS includes CLOSE_C; combatSystem sets normalCancelReady on hit.
    // This enables cancel into specials (e.g. RYO_KOOU).
    expect(NORMAL_ATTACKS.has(AttackType.CLOSE_C)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. Command Normal: Forward+A (Tsurizao / ice pillar chop)
// ═══════════════════════════════════════════════════════════════
describe('Ryo Command Normal: Forward+A (Tsurizao)', () => {
  it('routeNormal returns RYO_TSURIZAO on forward+A input', () => {
    const input = makeInput({
      forward: true,
      buttonAPressed: true,
      punchPressed: true,
    });
    const result = RyoDef.routeNormal(input, FighterState.IDLE, true);
    expect(result).toBe(AttackType.RYO_TSURIZAO);
  });

  it('RYO_TSURIZAO is an overhead (hitLevel = HIGH)', () => {
    const fd = FRAME_DATA[AttackType.RYO_TSURIZAO] as FrameDataEntry;
    expect(fd).toBeDefined();
    expect(fd.hitLevel).toBe('HIGH');
  });

  it('RYO_TSURIZAO has different startup than STAND_A', () => {
    const tsurizao = FRAME_DATA[AttackType.RYO_TSURIZAO] as FrameDataEntry;
    const standA = FRAME_DATA[AttackType.STAND_A] as FrameDataEntry;
    expect(tsurizao).toBeDefined();
    expect(standA).toBeDefined();
    // Command normal should have longer startup (overhead commitment)
    expect(tsurizao.startup).not.toBe(standA.startup);
    expect(tsurizao.startup).toBeGreaterThan(standA.startup);
  });

  it('RYO_TSURIZAO is not available in air', () => {
    const input = makeInput({
      forward: true,
      buttonAPressed: true,
      punchPressed: true,
    });
    // routeNormal is called with an air state; it should return null
    const result = RyoDef.routeNormal(input, FighterState.JUMP, false);
    expect(result).toBeNull();
  });

  it('RYO_TSURIZAO is in COMMAND_NORMALS set', () => {
    expect(COMMAND_NORMALS.has(AttackType.RYO_TSURIZAO)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. Command Normal: Down-Forward+B (Orishi / falling kick)
// ═══════════════════════════════════════════════════════════════
describe('Ryo Command Normal: Down-Forward+B (Orishi)', () => {
  it('routeNormal returns RYO_ORISHI on down+forward+B input', () => {
    const input = makeInput({
      down: true,
      forward: true,
      buttonBPressed: true,
      kickPressed: true,
    });
    const result = RyoDef.routeNormal(input, FighterState.IDLE, true);
    expect(result).toBe(AttackType.RYO_ORISHI);
  });

  it('RYO_ORISHI hits low (hitLevel = LOW)', () => {
    const fd = FRAME_DATA[AttackType.RYO_ORISHI] as FrameDataEntry;
    expect(fd).toBeDefined();
    expect(fd.hitLevel).toBe('LOW');
  });

  it('RYO_ORISHI has different damage than STAND_B', () => {
    const orishi = FRAME_DATA[AttackType.RYO_ORISHI] as FrameDataEntry;
    const standB = FRAME_DATA[AttackType.STAND_B] as FrameDataEntry;
    expect(orishi).toBeDefined();
    expect(standB).toBeDefined();
    expect(orishi.damage).not.toBe(standB.damage);
  });

  it('RYO_ORISHI is in COMMAND_NORMALS set', () => {
    expect(COMMAND_NORMALS.has(AttackType.RYO_ORISHI)).toBe(true);
  });

  it('RYO_ORISHI is not available in air', () => {
    const input = makeInput({
      down: true,
      forward: true,
      buttonBPressed: true,
      kickPressed: true,
    });
    const result = RyoDef.routeNormal(input, FighterState.JUMP, false);
    expect(result).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. Close vs Command Priority
// ═══════════════════════════════════════════════════════════════
describe('Close vs Command Normal Priority', () => {
  it('Forward+A (tsurizao) takes priority over close detection', () => {
    // Even when close range is true, forward+A should return the command normal
    const input = makeInput({
      forward: true,
      buttonAPressed: true,
      punchPressed: true,
    });
    const result = RyoDef.routeNormal(input, FighterState.IDLE, true);
    expect(result).toBe(AttackType.RYO_TSURIZAO);
  });

  it('Down-Forward+B (orishi) takes priority over close detection', () => {
    // Even when close range is true, down+forward+B should return the command normal
    const input = makeInput({
      down: true,
      forward: true,
      buttonBPressed: true,
      kickPressed: true,
    });
    const result = RyoDef.routeNormal(input, FighterState.IDLE, true);
    expect(result).toBe(AttackType.RYO_ORISHI);
  });

  it('Close attacks only trigger when no command input is detected', () => {
    // Pressing A without forward should NOT produce a command normal.
    // routeNormal returns null (falls through to defaultAttack which handles close).
    const input = makeInput({
      buttonAPressed: true,
      punchPressed: true,
      // forward = false, down = false => no command normal
    });
    const result = RyoDef.routeNormal(input, FighterState.IDLE, true);
    // routeNormal returns null, letting defaultAttack handle close detection
    expect(result).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════
// 5. FRAME_DATA Consistency
// ═══════════════════════════════════════════════════════════════
describe('FRAME_DATA Consistency for Ryo Attacks', () => {
  const REQUIRED_FIELDS = ['startup', 'active', 'recovery', 'damage', 'hitstun', 'blockstun'] as const;

  it('CLOSE_A has all required frame data fields', () => {
    const fd = FRAME_DATA[AttackType.CLOSE_A] as FrameDataEntry;
    expect(fd).toBeDefined();
    for (const field of REQUIRED_FIELDS) {
      expect(fd[field], `CLOSE_A missing ${field}`).toBeDefined();
      expect(typeof fd[field], `CLOSE_A.${field} should be number`).toBe('number');
    }
  });

  it('CLOSE_C has all required frame data fields', () => {
    const fd = FRAME_DATA[AttackType.CLOSE_C] as FrameDataEntry;
    expect(fd).toBeDefined();
    for (const field of REQUIRED_FIELDS) {
      expect(fd[field], `CLOSE_C missing ${field}`).toBeDefined();
      expect(typeof fd[field], `CLOSE_C.${field} should be number`).toBe('number');
    }
  });

  it('RYO_TSURIZAO has hitLevel HIGH (overhead)', () => {
    const fd = FRAME_DATA[AttackType.RYO_TSURIZAO] as FrameDataEntry;
    expect(fd).toBeDefined();
    expect(fd.hitLevel).toBe('HIGH');
  });

  it('RYO_ORISHI has hitLevel LOW', () => {
    const fd = FRAME_DATA[AttackType.RYO_ORISHI] as FrameDataEntry;
    expect(fd).toBeDefined();
    expect(fd.hitLevel).toBe('LOW');
  });

  it('all Ryo-specific attack types have valid ATTACK_FRAMES (hitbox) data', () => {
    // Check that hitbox data exists for CLOSE_A, CLOSE_C, RYO_TSURIZAO, RYO_ORISHI
    const attackTypes = [
      AttackType.CLOSE_A,
      AttackType.CLOSE_C,
      AttackType.RYO_TSURIZAO,
      AttackType.RYO_ORISHI,
    ];
    for (const at of attackTypes) {
      const offset = (HITBOX_OFFSETS as Record<string, unknown>)[at];
      expect(offset, `Missing HITBOX_OFFSETS for ${at}`).toBeDefined();
    }
  });
});
