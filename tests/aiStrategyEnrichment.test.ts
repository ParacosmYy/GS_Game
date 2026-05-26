/**
 * aiStrategyEnrichment.test.ts
 *
 * Tests for the new strategic behavior methods in AdvancedAI:
 * - shouldAntiAir(): anti-air detection
 * - shouldPunish(): punish detection on recovery frames
 * - shouldZone(): zoning behavior at range
 * - shouldMeaty(): wake-up pressure timing
 *
 * Each test verifies the method's logic in isolation, then confirms
 * the method integrates with the existing AI decision flow.
 */
import { describe, it, expect } from 'vitest';
import { AdvancedAI } from '../src/ai/advancedAI.js';
import { Fighter } from '../src/entities/fighter.js';
import { FighterState, AttackType } from '../src/core/types.js';
import type { CharacterDefinition } from '../src/characters/types.js';
import { ROSTER } from '../src/characters/index.js';

// ── Helpers ──

/** Create a minimal CharacterDefinition for testing */
function makeCharDef(id: string = 'kyo'): CharacterDefinition {
  const found = ROSTER.find(c => c.id === id);
  if (found) return found;
  return {
    id, name: id, nameCn: id, color: '#ff0000', accentColor: '#00ff00',
    specialColor: '#0000ff', specialGlow: '#ffffff', portrait: '',
    winQuotes: [],
    stats: { walkSpeed: 4, runSpeed: 7, jumpVelocity: -14, hopVelocity: -10, hyperJumpVelocity: -17, maxHealth: 1000, pushWidth: 60, jumpForwardSpeed: 5 },
    poses: {},
    routeSpecial: () => null,
    routeNormal: () => null,
    routeRekkaFollowup: () => null,
    onAttackActive: () => false,
    getRekkaChain: () => null,
  };
}

/** Create a Fighter at position (x, ground) with given charId and facing */
function makeFighter(x: number, charId: string = 'kyo', facing: number = 1): Fighter {
  const f = new Fighter(x, '#ff0000', facing);
  f.charId = charId;
  f.state = FighterState.IDLE;
  f.hitstunTimer = 0;
  f.blockstunTimer = 0;
  f.knockdownTimer = 0;
  f.landingRecovery = 0;
  f.rollTimer = 0;
  f.currentAttack = null;
  f.attackFrame = 0;
  f.attackPhase = 'none';
  return f;
}

/** Create a PowerGauge with given stocks */
function makeGauge(stocks: number, meter: number = 0) {
  return { meter, stocks, maxMeter: 100 };
}

// ═══════════════════════════════════════════════════════════════
// shouldAntiAir tests
// ═══════════════════════════════════════════════════════════════

describe('shouldAntiAir -- anti-air detection', () => {
  it('returns true when opponent is airborne and within range', () => {
    const aiFighter = makeFighter(400, 'kyo', 1);
    const opponent = makeFighter(450, 'kyo', -1);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(aiFighter, opponent, char, 'hard');

    // Opponent is jumping toward AI
    opponent.state = FighterState.JUMP;
    opponent.y = 400; // Above ground (510 is ground)
    opponent.vy = 5;  // Descending

    expect(ai.shouldAntiAir(opponent)).toBe(true);
  });

  it('returns false when opponent is grounded', () => {
    const aiFighter = makeFighter(400, 'kyo', 1);
    const opponent = makeFighter(450, 'kyo', -1);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(aiFighter, opponent, char, 'hard');

    // Opponent is on the ground
    opponent.state = FighterState.IDLE;
    opponent.y = 510; // Ground level

    expect(ai.shouldAntiAir(opponent)).toBe(false);
  });

  it('returns false when opponent is too far away horizontally', () => {
    const aiFighter = makeFighter(200, 'kyo', 1);
    const opponent = makeFighter(600, 'kyo', -1);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(aiFighter, opponent, char, 'hard');

    // Opponent is jumping but very far away
    opponent.state = FighterState.JUMP;
    opponent.y = 400;

    expect(ai.shouldAntiAir(opponent)).toBe(false);
  });

  it('returns true for AIR_ATTACK state at close range', () => {
    const aiFighter = makeFighter(400, 'kyo', 1);
    const opponent = makeFighter(450, 'kyo', -1);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(aiFighter, opponent, char, 'hard');

    // Opponent is doing an air attack (jump-in)
    opponent.state = FighterState.AIR_ATTACK;
    opponent.y = 350;
    opponent.vy = 3;

    expect(ai.shouldAntiAir(opponent)).toBe(true);
  });

  it('anti-air integrates with AI decision flow', () => {
    const aiFighter = makeFighter(400, 'kyo', -1);
    const opponent = makeFighter(350, 'kyo', 1);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(aiFighter, opponent, char, 'hard');

    // Opponent jumps in
    opponent.state = FighterState.JUMP;
    opponent.y = 350;
    opponent.vy = 5;

    let aaResponse = false;
    for (let i = 0; i < 30; i++) {
      aiFighter.state = FighterState.IDLE;
      aiFighter.currentAttack = null;
      aiFighter.attackPhase = 'none';
      aiFighter.attackFrame = 0;
      const input = ai.getInput();
      if (input.buttonC && input.buttonCPressed) {
        aaResponse = true;
      }
    }
    expect(aaResponse).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// shouldPunish tests
// ═══════════════════════════════════════════════════════════════

describe('shouldPunish — punish detection', () => {
  it('detects recovery state and returns optimal punish attack', () => {
    const aiFighter = makeFighter(400, 'kyo', 1);
    const opponent = makeFighter(440, 'kyo', -1);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(aiFighter, opponent, char, 'hard');

    // Opponent is in attack recovery (whiffed)
    opponent.state = FighterState.STAND_ATTACK;
    opponent.currentAttack = AttackType.STAND_C;
    opponent.attackPhase = 'recovery';
    opponent.attackFrame = 5; // Mid recovery (STAND_C has 20 recovery)
    opponent.hasHit = false;

    const result = ai.shouldPunish(opponent);
    // Should return a punish attack (CLOSE_C or SPECIAL_UPPER)
    expect(result).not.toBeNull();
  });

  it('returns null when opponent is not in recovery', () => {
    const aiFighter = makeFighter(400, 'kyo', 1);
    const opponent = makeFighter(440, 'kyo', -1);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(aiFighter, opponent, char, 'hard');

    // Opponent is attacking but in startup phase
    opponent.state = FighterState.STAND_ATTACK;
    opponent.currentAttack = AttackType.STAND_C;
    opponent.attackPhase = 'startup';
    opponent.attackFrame = 2;
    opponent.hasHit = false;

    expect(ai.shouldPunish(opponent)).toBeNull();
  });

  it('returns heavy punish for large recovery window', () => {
    const aiFighter = makeFighter(400, 'kyo', 1);
    const opponent = makeFighter(440, 'kyo', -1);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(aiFighter, opponent, char, 'hard');

    // Opponent whiffed a move with long recovery (STAND_D has 20 recovery)
    opponent.state = FighterState.STAND_ATTACK;
    opponent.currentAttack = AttackType.STAND_D;
    opponent.attackPhase = 'recovery';
    opponent.attackFrame = 0; // Just entered recovery (full 20 frames remaining)
    opponent.hasHit = false;

    const result = ai.shouldPunish(opponent);
    expect(result).not.toBeNull();
    // Should prefer heavy punish: CLOSE_C or SPECIAL_UPPER
    expect([AttackType.CLOSE_C, AttackType.SPECIAL_UPPER]).toContain(result);
  });

  it('returns light punish for small recovery window', () => {
    const aiFighter = makeFighter(400, 'kyo', 1);
    const opponent = makeFighter(440, 'kyo', -1);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(aiFighter, opponent, char, 'hard');

    // Opponent whiffed with small remaining recovery
    opponent.state = FighterState.STAND_ATTACK;
    opponent.currentAttack = AttackType.STAND_C;
    opponent.attackPhase = 'recovery';
    opponent.attackFrame = 16; // 4 frames remaining (20 - 16)
    opponent.hasHit = false;

    const result = ai.shouldPunish(opponent);
    expect(result).not.toBeNull();
    // Small window: should use light normal
    expect(result).toBe(AttackType.STAND_A);
  });

  it('returns null when AI fighter cannot act', () => {
    const aiFighter = makeFighter(400, 'kyo', 1);
    const opponent = makeFighter(440, 'kyo', -1);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(aiFighter, opponent, char, 'hard');

    // AI is in blockstun
    aiFighter.state = FighterState.BLOCK;
    aiFighter.blockstunTimer = 10;

    opponent.state = FighterState.STAND_ATTACK;
    opponent.currentAttack = AttackType.STAND_C;
    opponent.attackPhase = 'recovery';
    opponent.attackFrame = 5;
    opponent.hasHit = false;

    expect(ai.shouldPunish(opponent)).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════
// shouldZone tests
// ═══════════════════════════════════════════════════════════════

describe('shouldZone — zoning behavior', () => {
  it('selects projectile at far range for character with projectile', () => {
    const aiFighter = makeFighter(200, 'kyo', 1);
    const opponent = makeFighter(550, 'kyo', -1);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(aiFighter, opponent, char, 'hard');

    // Distance > RANGE_FAR (250)
    const dist = Math.abs(aiFighter.x - opponent.x);
    expect(dist).toBeGreaterThan(250);

    const result = ai.shouldZone(opponent);
    // Kyo has a projectile, should prefer it at far range
    expect(result).toBe(AttackType.SPECIAL_PROJECTILE);
  });

  it('returns null at far range for character without projectile', () => {
    const aiFighter = makeFighter(200, 'kim', 1);
    const opponent = makeFighter(550, 'kyo', -1);
    const char = makeCharDef('kim');
    const ai = new AdvancedAI(aiFighter, opponent, char, 'hard');

    const result = ai.shouldZone(opponent);
    // Kim has no projectile, should return null at far range
    expect(result).toBeNull();
  });

  it('selects poke at mid range', () => {
    const aiFighter = makeFighter(300, 'kyo', 1);
    const opponent = makeFighter(450, 'kyo', -1);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(aiFighter, opponent, char, 'hard');

    // Distance is between RANGE_CLOSE and RANGE_MID
    const dist = Math.abs(aiFighter.x - opponent.x);
    expect(dist).toBeGreaterThan(80);
    expect(dist).toBeLessThanOrEqual(180);

    const result = ai.shouldZone(opponent);
    // Should return a poke move (character's preferred poke or STAND_B)
    expect(result).not.toBeNull();
    expect([AttackType.STAND_B, AttackType.STAND_C, AttackType.CROUCH_B]).toContain(result);
  });

  it('returns null at close range', () => {
    const aiFighter = makeFighter(400, 'kyo', 1);
    const opponent = makeFighter(440, 'kyo', -1);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(aiFighter, opponent, char, 'hard');

    const dist = Math.abs(aiFighter.x - opponent.x);
    expect(dist).toBeLessThan(80);

    const result = ai.shouldZone(opponent);
    // Too close for zoning
    expect(result).toBeNull();
  });

  it('zoning integrates with AI decision flow at mid range', () => {
    const aiFighter = makeFighter(300, 'kyo', -1);
    const opponent = makeFighter(460, 'kyo', 1);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(aiFighter, opponent, char, 'hard');
    ai.gauge = makeGauge(0, 0);

    let zonedOrPoked = false;
    for (let i = 0; i < 60; i++) {
      aiFighter.state = FighterState.IDLE;
      aiFighter.currentAttack = null;
      aiFighter.attackPhase = 'none';
      aiFighter.attackFrame = 0;
      const input = ai.getInput();
      // Zoning should produce button inputs (poke or projectile motion)
      if (input.buttonA || input.buttonB || input.buttonC || input.buttonD ||
          input.forward || input.down) {
        zonedOrPoked = true;
      }
    }
    expect(zonedOrPoked).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// shouldMeaty tests
// ═══════════════════════════════════════════════════════════════

describe('shouldMeaty — wake-up pressure timing', () => {
  it('returns meaty attack when opponent is about to wake up', () => {
    const aiFighter = makeFighter(400, 'kyo', 1);
    const opponent = makeFighter(440, 'kyo', -1);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(aiFighter, opponent, char, 'hard');

    // Opponent is knocked down with low timer (about to wake up)
    opponent.state = FighterState.KNOCKDOWN;
    opponent.knockdownTimer = 10; // Low timer

    const result = ai.shouldMeaty(opponent);
    expect(result).not.toBeNull();
    // Close range: should be CLOSE_C (fastest heavy normal)
    expect(result).toBe(AttackType.CLOSE_C);
  });

  it('returns null when opponent has high knockdown timer', () => {
    const aiFighter = makeFighter(400, 'kyo', 1);
    const opponent = makeFighter(440, 'kyo', -1);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(aiFighter, opponent, char, 'hard');

    // Opponent just knocked down (high timer)
    opponent.state = FighterState.KNOCKDOWN;
    opponent.knockdownTimer = 60;

    expect(ai.shouldMeaty(opponent)).toBeNull();
  });

  it('returns null when opponent is too far away', () => {
    const aiFighter = makeFighter(200, 'kyo', 1);
    const opponent = makeFighter(500, 'kyo', -1);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(aiFighter, opponent, char, 'hard');

    opponent.state = FighterState.KNOCKDOWN;
    opponent.knockdownTimer = 10;

    // Distance = 300 > 120
    expect(ai.shouldMeaty(opponent)).toBeNull();
  });

  it('meaty integrates with AI okizeme decision flow', () => {
    const aiFighter = makeFighter(350, 'kyo', -1);
    const opponent = makeFighter(380, 'kyo', 1);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(aiFighter, opponent, char, 'hard');
    ai.gauge = makeGauge(0, 0);

    // Opponent is waking up
    opponent.state = FighterState.KNOCKDOWN;
    opponent.knockdownTimer = 15;

    let anyAction = false;
    for (let i = 0; i < 80; i++) {
      aiFighter.state = FighterState.IDLE;
      aiFighter.currentAttack = null;
      aiFighter.attackPhase = 'none';
      aiFighter.attackFrame = 0;

      // Advance knockdown timer
      if (opponent.knockdownTimer > 0) {
        opponent.knockdownTimer--;
        if (opponent.knockdownTimer <= 0) {
          opponent.state = FighterState.IDLE;
        }
      }

      const input = ai.getInput();
      if (input.buttonA || input.buttonB || input.buttonC || input.buttonD ||
          input.forward || input.throwAttack) {
        anyAction = true;
      }
    }
    expect(anyAction).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// Integration: all strategies work together
// ═══════════════════════════════════════════════════════════════

describe('Strategy integration with AI decision flow', () => {
  it('AI produces valid inputs across multiple game states', () => {
    const aiFighter = makeFighter(400, 'kyo', -1);
    const opponent = makeFighter(350, 'kyo', 1);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(aiFighter, opponent, char, 'hard');
    ai.gauge = makeGauge(2, 50);

    // Cycle through different opponent states
    const states: { state: FighterState; y?: number }[] = [
      { state: FighterState.IDLE },
      { state: FighterState.JUMP, y: 350 },
      { state: FighterState.STAND_ATTACK },
      { state: FighterState.KNOCKDOWN },
      { state: FighterState.CROUCH },
      { state: FighterState.DIZZY },
    ];

    for (const scenario of states) {
      opponent.state = scenario.state;
      opponent.y = scenario.y ?? 510;
      opponent.currentAttack = null;
      opponent.attackPhase = 'none';
      opponent.knockdownTimer = scenario.state === FighterState.KNOCKDOWN ? 10 : 0;

      // Run several frames for each state
      for (let i = 0; i < 15; i++) {
        aiFighter.state = FighterState.IDLE;
        aiFighter.currentAttack = null;
        aiFighter.attackPhase = 'none';
        aiFighter.attackFrame = 0;
        const input = ai.getInput();
        // Should always return valid input
        expect(input).not.toBeNull();
        expect(input).toBeDefined();
        expect(typeof input.up).toBe('boolean');
        expect(typeof input.buttonC).toBe('boolean');
      }
    }
  });

  it('hard AI uses punish detection to attack whiffed moves', () => {
    const aiFighter = makeFighter(400, 'kyo', 1);
    const opponent = makeFighter(440, 'kyo', -1);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(aiFighter, opponent, char, 'hard');
    ai.gauge = makeGauge(1, 50);

    let attackDetected = false;
    // Simulate opponent whiffing attacks
    for (let i = 0; i < 60; i++) {
      aiFighter.state = FighterState.IDLE;
      aiFighter.currentAttack = null;
      aiFighter.attackPhase = 'none';
      aiFighter.attackFrame = 0;

      // Cycle opponent through attack recovery
      if (i % 20 < 10) {
        opponent.state = FighterState.STAND_ATTACK;
        opponent.currentAttack = AttackType.STAND_D;
        opponent.attackPhase = 'recovery';
        opponent.attackFrame = (i % 10);
        opponent.hasHit = false;
      } else {
        opponent.state = FighterState.IDLE;
        opponent.currentAttack = null;
        opponent.attackPhase = 'none';
      }

      const input = ai.getInput();
      if (input.buttonA || input.buttonB || input.buttonC || input.buttonD) {
        attackDetected = true;
      }
    }
    expect(attackDetected).toBe(true);
  });

  it('all strategies produce consistent behavior after reset', () => {
    const aiFighter = makeFighter(400, 'kyo', 1);
    const opponent = makeFighter(440, 'kyo', -1);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(aiFighter, opponent, char, 'hard');

    // Run for a while
    for (let i = 0; i < 30; i++) {
      ai.getInput();
    }

    ai.reset();

    // After reset, all pending attacks should be cleared
    const antiAir = ai.shouldAntiAir(opponent);
    expect(typeof antiAir).toBe('boolean');

    const punish = ai.shouldPunish(opponent);
    // Opponent is idle, so no punish
    expect(punish).toBeNull();

    const zone = ai.shouldZone(opponent);
    // Close range, no zoning
    expect(zone).toBeNull();

    const meaty = ai.shouldMeaty(opponent);
    // Not knocked down
    expect(meaty).toBeNull();
  });
});
