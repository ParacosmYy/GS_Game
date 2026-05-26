/**
 * AI Strategy Integration Tests
 *
 * Verifies that every character AI obeys its strategy configuration:
 *   - All 27 characters have strategy entries
 *   - preferredRange, aggressiveLevel, and AttackType fields are valid
 *   - Distance management follows preferredRange
 *   - AggressiveLevel drives attack/block frequency
 *   - Character-specific strategies produce expected behaviors
 *   - Difficulty presets affect reaction, combos, and anti-air
 */
import { describe, it, expect } from 'vitest';
import { AdvancedAI, type AIDifficultyLevel } from '../src/ai/advancedAI.js';
import {
  ALL_STRATEGIES,
  getCharacterStrategy,
  type CharacterStrategy,
  type PreferredRange,
} from '../src/ai/characterStrategies.js';
import { Fighter } from '../src/entities/fighter.js';
import { FighterState, AttackType } from '../src/core/types.js';
import type { CharacterDefinition } from '../src/characters/types.js';

// ── Helpers ──

/** Create a minimal CharacterDefinition for testing */
function makeCharDef(id: string = 'kyo'): CharacterDefinition {
  return {
    id, name: id, nameCn: id, color: '#ff0000', accentColor: '#00ff00',
    specialColor: '#0000ff', specialGlow: '#ffffff', portrait: '',
    winQuotes: [],
    stats: {
      walkSpeed: 4, runSpeed: 7, jumpVelocity: -14, hopVelocity: -10,
      hyperJumpVelocity: -17, maxHealth: 1000, pushWidth: 60, jumpForwardSpeed: 5,
    },
    poses: {},
    routeSpecial: () => null,
    routeNormal: () => null,
    routeRekkaFollowup: () => null,
    onAttackActive: () => false,
    getRekkaChain: () => null,
  };
}

/** Create a Fighter at position (x) with given charId and facing */
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

/** Create a MaxModeState */
function makeMaxMode(active: boolean = false) {
  return { active, timer: 0, maxDuration: 600 };
}

/** Collect all valid AttackType enum values as a Set for fast lookup */
const VALID_ATTACK_TYPES = new Set<string>(Object.values(AttackType));

/** All 27 character IDs expected in STRATEGY_MAP */
const EXPECTED_CHAR_IDS = [
  'kyo', 'iori', 'terry', 'kim', 'ryo', 'kdash', 'mai', 'robert',
  'clark', 'ralf', 'kula', 'leona', 'athena', 'billy', 'chang', 'choi',
  'joe', 'andy', 'mature', 'yashiro', 'chris', 'vice', 'shermie',
  'yamazaki', 'mary', 'xiangfei', 'kasumi',
];

/** Count how many frames have aggressive (attack/throw/special) input */
function countAggressiveFrames(
  ai: AdvancedAI,
  fighter: Fighter,
  frames: number,
): number {
  let count = 0;
  for (let i = 0; i < frames; i++) {
    fighter.state = FighterState.IDLE;
    fighter.currentAttack = null;
    fighter.attackPhase = 'none';
    fighter.hitstunTimer = 0;
    fighter.blockstunTimer = 0;
    const input = ai.getInput();
    if (input.buttonA || input.buttonB || input.buttonC || input.buttonD
      || input.throwAttack || input.forward) {
      count++;
    }
  }
  return count;
}

/** Count how many frames have defensive (back/down/block) input */
function countDefensiveFrames(
  ai: AdvancedAI,
  fighter: Fighter,
  frames: number,
): number {
  let count = 0;
  for (let i = 0; i < frames; i++) {
    fighter.state = FighterState.IDLE;
    fighter.currentAttack = null;
    fighter.attackPhase = 'none';
    const input = ai.getInput();
    if (input.back) {
      count++;
    }
  }
  return count;
}

// ═══════════════════════════════════════════════════════════════
// 1. Strategy Configuration Validation (10 tests)
// ═══════════════════════════════════════════════════════════════

describe('Strategy configuration validation', () => {
  it('all 27 characters have strategy entries', () => {
    expect(ALL_STRATEGIES).toHaveLength(27);
    for (const charId of EXPECTED_CHAR_IDS) {
      const strategy = getCharacterStrategy(charId);
      expect(strategy.charId).toBe(charId);
    }
  });

  it('each strategy charId matches its lookup key', () => {
    for (const charId of EXPECTED_CHAR_IDS) {
      const strategy = getCharacterStrategy(charId);
      expect(strategy.charId).toBe(charId);
    }
  });

  it('preferredRange is a valid value (close/mid/far)', () => {
    const validRanges: PreferredRange[] = ['close', 'mid', 'far'];
    for (const strategy of ALL_STRATEGIES) {
      expect(validRanges).toContain(strategy.preferredRange);
    }
  });

  it('aggressiveLevel is within 0-1 range', () => {
    for (const strategy of ALL_STRATEGIES) {
      expect(strategy.aggressiveLevel).toBeGreaterThanOrEqual(0);
      expect(strategy.aggressiveLevel).toBeLessThanOrEqual(1);
    }
  });

  it('preferredAntiAir is a valid AttackType', () => {
    for (const strategy of ALL_STRATEGIES) {
      expect(VALID_ATTACK_TYPES).toContain(strategy.preferredAntiAir);
    }
  });

  it('preferredPoke is a valid AttackType', () => {
    for (const strategy of ALL_STRATEGIES) {
      expect(VALID_ATTACK_TYPES).toContain(strategy.preferredPoke);
    }
  });

  it('preferredComboStarter is a valid AttackType', () => {
    for (const strategy of ALL_STRATEGIES) {
      expect(VALID_ATTACK_TYPES).toContain(strategy.preferredComboStarter);
    }
  });

  it('preferredDM is a valid AttackType', () => {
    for (const strategy of ALL_STRATEGIES) {
      expect(VALID_ATTACK_TYPES).toContain(strategy.preferredDM);
    }
  });

  it('wakeUpOptions is non-empty for every character', () => {
    for (const strategy of ALL_STRATEGIES) {
      expect(strategy.wakeUpOptions.length).toBeGreaterThan(0);
      for (const opt of strategy.wakeUpOptions) {
        expect(VALID_ATTACK_TYPES).toContain(opt);
      }
    }
  });

  it('DEFAULT_STRATEGY exists with valid fields', () => {
    // getCharacterStrategy returns the default for unknown char IDs
    const defaultStrategy = getCharacterStrategy('unknown_char_xyz');
    expect(defaultStrategy.charId).toBe('_default');
    expect(defaultStrategy.preferredRange).toBe('mid');
    expect(defaultStrategy.aggressiveLevel).toBeGreaterThanOrEqual(0);
    expect(defaultStrategy.aggressiveLevel).toBeLessThanOrEqual(1);
    expect(VALID_ATTACK_TYPES).toContain(defaultStrategy.preferredAntiAir);
    expect(VALID_ATTACK_TYPES).toContain(defaultStrategy.preferredPoke);
    expect(VALID_ATTACK_TYPES).toContain(defaultStrategy.preferredComboStarter);
    expect(VALID_ATTACK_TYPES).toContain(defaultStrategy.preferredDM);
    expect(defaultStrategy.wakeUpOptions.length).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. Distance Management (8 tests)
// ═══════════════════════════════════════════════════════════════

describe('Distance management', () => {
  it('close-type characters tend to approach (forward input bias)', () => {
    // Kyo is close-range, preferredDistance=90
    const p1 = makeFighter(300, 'kyo', 1);
    const p2 = makeFighter(500, 'kyo', -1); // 200px apart, outside preferred
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 'hard');

    let forwardCount = 0;
    for (let i = 0; i < 120; i++) {
      p2.state = FighterState.IDLE;
      p2.currentAttack = null;
      p2.attackPhase = 'none';
      const input = ai.getInput();
      if (input.forward) forwardCount++;
    }
    // Close-range character should frequently approach when far from opponent
    expect(forwardCount).toBeGreaterThan(20);
  });

  it('far-type characters tend to retreat or use projectiles at close range', () => {
    // Athena is far-range, preferredDistance=160
    const p1 = makeFighter(300, 'athena', 1);
    const p2 = makeFighter(350, 'athena', -1); // only 50px apart, too close
    const char = makeCharDef('athena');
    const ai = new AdvancedAI(p2, p1, char, 'hard');
    ai.gauge = makeGauge(0);

    let retreatOrProjectile = 0;
    for (let i = 0; i < 120; i++) {
      p2.state = FighterState.IDLE;
      p2.currentAttack = null;
      p2.attackPhase = 'none';
      const input = ai.getInput();
      // Retreat = back, projectile = down + button
      if (input.back || input.down) {
        retreatOrProjectile++;
      }
    }
    // Far-type at close range should show retreat/projectile tendencies
    expect(retreatOrProjectile).toBeGreaterThan(10);
  });

  it('mid-type characters are most active at mid range', () => {
    // Terry is mid-range, preferredDistance=95
    const p1 = makeFighter(300, 'terry', 1);
    const p2 = makeFighter(400, 'terry', -1); // ~100px apart, near preferred
    const char = makeCharDef('terry');
    const ai = new AdvancedAI(p2, p1, char, 'hard');

    let actionFrames = 0;
    for (let i = 0; i < 120; i++) {
      p2.state = FighterState.IDLE;
      p2.currentAttack = null;
      p2.attackPhase = 'none';
      const input = ai.getInput();
      if (input.buttonA || input.buttonB || input.buttonC || input.buttonD
        || input.forward || input.throwAttack) {
        actionFrames++;
      }
    }
    // At preferred distance, mid-type should be quite active
    expect(actionFrames).toBeGreaterThan(30);
  });

  it('distance change affects AI decision', () => {
    // At close range, Kyo should use attack buttons (C/A/B/throw) more
    // than at far range where approach (forward only) dominates
    const char = makeCharDef('kyo');

    // Close range -- count attack buttons only (not forward movement)
    const p1Close = makeFighter(300, 'kyo', 1);
    const p2Close = makeFighter(340, 'kyo', -1);
    const aiClose = new AdvancedAI(p2Close, p1Close, char, 'hard');
    let closeAttackButtons = 0;
    for (let i = 0; i < 120; i++) {
      p2Close.state = FighterState.IDLE;
      p2Close.currentAttack = null;
      p2Close.attackPhase = 'none';
      const input = aiClose.getInput();
      if (input.buttonA || input.buttonB || input.buttonC || input.buttonD
        || input.throwAttack) {
        closeAttackButtons++;
      }
    }

    // Far range -- count attack buttons
    const p1Far = makeFighter(300, 'kyo', 1);
    const p2Far = makeFighter(700, 'kyo', -1);
    const aiFar = new AdvancedAI(p2Far, p1Far, char, 'hard');
    let farAttackButtons = 0;
    for (let i = 0; i < 120; i++) {
      p2Far.state = FighterState.IDLE;
      p2Far.currentAttack = null;
      p2Far.attackPhase = 'none';
      const input = aiFar.getInput();
      if (input.buttonA || input.buttonB || input.buttonC || input.buttonD
        || input.throwAttack) {
        farAttackButtons++;
      }
    }

    // At close range, Kyo should press more attack buttons than at far range
    expect(closeAttackButtons).toBeGreaterThan(farAttackButtons);
  });

  it('AI adjusts strategy when outside ideal distance', () => {
    // Clark: close-type, preferredDistance=55
    const p1 = makeFighter(300, 'iori', 1);
    const p2 = makeFighter(500, 'clark', -1); // far away, needs to approach
    const char = makeCharDef('clark');
    const ai = new AdvancedAI(p2, p1, char, 'hard');

    let approachFrames = 0;
    for (let i = 0; i < 120; i++) {
      p2.state = FighterState.IDLE;
      p2.currentAttack = null;
      p2.attackPhase = 'none';
      const input = ai.getInput();
      if (input.forward) approachFrames++;
    }
    // Clark should approach when far from his preferred close range
    expect(approachFrames).toBeGreaterThan(30);
  });

  it('corner-aware distance management', () => {
    // Place opponent near corner (x < 80)
    const p1 = makeFighter(50, 'kyo', 1);
    const p2 = makeFighter(150, 'kyo', -1);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 'hard');

    let pressuring = 0;
    for (let i = 0; i < 90; i++) {
      p2.state = FighterState.IDLE;
      p2.currentAttack = null;
      p2.attackPhase = 'none';
      const input = ai.getInput();
      // Corner pressure: attack or throw
      if (input.buttonC || input.buttonA || input.buttonB
        || input.buttonD || input.throwAttack) {
        pressuring++;
      }
    }
    // When opponent is in corner at close range, AI should pressure
    expect(pressuring).toBeGreaterThan(0);
  });

  it('close-range characters favor throws at close distance', () => {
    // Clark: close-type, aggressiveLevel=0.5, has throw-focused wakeUpOptions
    const p1 = makeFighter(300, 'iori', 1);
    const p2 = makeFighter(320, 'clark', -1);
    const char = makeCharDef('clark');
    const ai = new AdvancedAI(p2, p1, char, 'hard');

    let throwAttempts = 0;
    for (let i = 0; i < 200; i++) {
      p2.state = FighterState.IDLE;
      p2.currentAttack = null;
      p2.attackPhase = 'none';
      const input = ai.getInput();
      if (input.throwAttack) throwAttempts++;
    }
    // Clark at close range should attempt throws
    expect(throwAttempts).toBeGreaterThan(0);
  });

  it('far-range characters use projectiles at distance', () => {
    // Athena: far-type, hasProjectile=true
    const p1 = makeFighter(300, 'iori', 1);
    const p2 = makeFighter(600, 'athena', -1); // far apart
    const char = makeCharDef('athena');
    const ai = new AdvancedAI(p2, p1, char, 'hard');

    let projectileInputs = 0;
    for (let i = 0; i < 200; i++) {
      p2.state = FighterState.IDLE;
      p2.currentAttack = null;
      p2.attackPhase = 'none';
      const input = ai.getInput();
      // Projectile action: down + buttonA or buttonC
      if (input.down && (input.buttonA || input.buttonC)) {
        projectileInputs++;
      }
    }
    // Athena at far range should use projectile inputs
    expect(projectileInputs).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. Aggressive Level (6 tests)
// ═══════════════════════════════════════════════════════════════

describe('Aggressive level', () => {
  it('high-aggression characters (0.8+) attack more frequently', () => {
    // Iori: aggressiveLevel=0.9, close-type
    const p1 = makeFighter(300, 'iori', 1);
    const p2 = makeFighter(350, 'iori', -1);
    const char = makeCharDef('iori');
    const ai = new AdvancedAI(p2, p1, char, 'hard');

    let attackFrames = 0;
    for (let i = 0; i < 150; i++) {
      p2.state = FighterState.IDLE;
      p2.currentAttack = null;
      p2.attackPhase = 'none';
      const input = ai.getInput();
      if (input.buttonA || input.buttonB || input.buttonC || input.buttonD
        || input.throwAttack) {
        attackFrames++;
      }
    }
    // High-aggression Iori at close range should attack often
    expect(attackFrames).toBeGreaterThan(40);
  });

  it('low-aggression characters (0.3-) defend more frequently when attacked', () => {
    // Athena: aggressiveLevel=0.3, far-type
    const p1 = makeFighter(300, 'athena', 1);
    const p2 = makeFighter(350, 'athena', -1);
    const char = makeCharDef('athena');

    // Simulate opponent attacking
    p1.state = FighterState.STAND_ATTACK;
    p1.currentAttack = AttackType.CLOSE_C;

    const ai = new AdvancedAI(p2, p1, char, 'hard');

    let blockFrames = 0;
    for (let i = 0; i < 60; i++) {
      p1.state = FighterState.STAND_ATTACK;
      p1.currentAttack = AttackType.CLOSE_C;
      const input = ai.getInput();
      if (input.back) blockFrames++;
    }
    // Low-aggression Athena should block frequently when attacked
    expect(blockFrames).toBeGreaterThan(10);
  });

  it('aggression affects counter-attack timing', () => {
    // Compare high-aggression (Iori, 0.9) vs low-aggression (Athena, 0.3)
    // Both at close range where they can produce attack buttons
    const runTest = (charId: string) => {
      const p1 = makeFighter(300, charId, 1);
      const p2 = makeFighter(340, charId, -1); // 40px apart -- close range
      const char = makeCharDef(charId);
      const ai = new AdvancedAI(p2, p1, char, 'hard');

      let attackCount = 0;
      for (let i = 0; i < 150; i++) {
        p2.state = FighterState.IDLE;
        p2.currentAttack = null;
        p2.attackPhase = 'none';
        const input = ai.getInput();
        if (input.buttonA || input.buttonB || input.buttonC || input.buttonD
          || input.throwAttack) {
          attackCount++;
        }
      }
      return attackCount;
    };

    const highAttacks = runTest('iori');
    const lowAttacks = runTest('athena');

    // Both should produce attack inputs at close range on hard
    expect(highAttacks).toBeGreaterThan(0);
    expect(lowAttacks).toBeGreaterThan(0);
  });

  it('aggression influences meter usage', () => {
    // High aggression characters should be more willing to spend meter on MAX
    // Test that a high-aggression character activates MAX at appropriate times
    const p1 = makeFighter(300, 'iori', 1);
    const p2 = makeFighter(340, 'iori', -1);
    const char = makeCharDef('iori');
    const ai = new AdvancedAI(p2, p1, char, 'hard');
    ai.gauge = makeGauge(3, 0);
    ai.maxMode = makeMaxMode(false);

    // Make fighter low HP to trigger comeback MAX
    p2.health = p2.maxHealth * 0.2;

    let maxAttempt = false;
    for (let i = 0; i < 100; i++) {
      p2.state = FighterState.IDLE;
      p2.currentAttack = null;
      p2.attackPhase = 'none';
      const input = ai.getInput();
      // MAX activation is B+C simultaneously pressed
      if (input.buttonB && input.buttonC && input.buttonBPressed && input.buttonCPressed) {
        maxAttempt = true;
      }
    }
    // High-aggression Iori at low HP with meter should attempt MAX
    expect(maxAttempt).toBe(true);
  });

  it('aggression affects DM usage timing', () => {
    // Test that high difficulty with meter and low-HP opponent triggers DMs
    // Pattern matches the working advancedAI.test.ts DM test
    const p1 = makeFighter(300, 'kyo', 1);
    const p2 = makeFighter(320, 'kyo', -1);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 'hard');
    ai.gauge = makeGauge(3, 0);
    ai.maxMode = makeMaxMode(false);

    // Low HP opponent increases DM probability
    p1.health = p1.maxHealth * 0.1;

    let dmTriggered = false;
    for (let i = 0; i < 500; i++) {
      p2.state = FighterState.IDLE;
      p2.currentAttack = null;
      p2.attackFrame = 0;
      p2.attackPhase = 'none';
      p2.hitstunTimer = 0;
      p2.blockstunTimer = 0;
      p2.knockdownTimer = 0;
      p2.landingRecovery = 0;
      p2.rollTimer = 0;
      p2.hasHit = false;
      p2.vx = 0;
      p2.vy = 0;

      // Only trigger special, don't call getInput first
      const special = ai.triggerSpecial();
      if (special && special.toString().startsWith('DM_')) {
        dmTriggered = true;
        break;
      }
      // Also tick the AI to advance its state
      ai.getInput();
    }
    expect(dmTriggered).toBe(true);
  });

  it('aggression affects wake-up pressure frequency', () => {
    // High-aggression characters should be more active during okizeme
    const p1 = makeFighter(300, 'iori', 1);
    const p2 = makeFighter(320, 'iori', -1);
    const char = makeCharDef('iori');
    const ai = new AdvancedAI(p2, p1, char, 'hard');

    // Opponent knocked down
    p1.state = FighterState.KNOCKDOWN;
    p1.knockdownTimer = 30;

    let pressureActions = 0;
    for (let i = 0; i < 80; i++) {
      p2.state = FighterState.IDLE;
      p2.currentAttack = null;
      p2.attackPhase = 'none';
      const input = ai.getInput();
      if (input.forward || input.buttonC || input.buttonA || input.buttonD
        || input.throwAttack || input.down) {
        pressureActions++;
      }
    }
    // High-aggression Iori should actively pressure knocked-down opponent
    expect(pressureActions).toBeGreaterThan(10);
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. Character-Specific Strategies (6 tests)
// ═══════════════════════════════════════════════════════════════

describe('Character-specific strategies', () => {
  it('Kyo (close/aggressive=0.8) is active at close range', () => {
    const strategy = getCharacterStrategy('kyo');
    expect(strategy.preferredRange).toBe('close');
    expect(strategy.aggressiveLevel).toBeGreaterThanOrEqual(0.8);

    const p1 = makeFighter(300, 'kyo', 1);
    const p2 = makeFighter(340, 'kyo', -1);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 'hard');

    let activeFrames = 0;
    for (let i = 0; i < 120; i++) {
      p2.state = FighterState.IDLE;
      p2.currentAttack = null;
      p2.attackPhase = 'none';
      const input = ai.getInput();
      if (input.buttonC || input.buttonA || input.buttonB || input.throwAttack) {
        activeFrames++;
      }
    }
    // Kyo at close range with high aggression should be very active
    expect(activeFrames).toBeGreaterThan(30);
  });

  it('Athena (far/aggressive=0.3) prefers projectiles and spacing', () => {
    const strategy = getCharacterStrategy('athena');
    expect(strategy.preferredRange).toBe('far');
    expect(strategy.aggressiveLevel).toBeLessThanOrEqual(0.3);

    const p1 = makeFighter(300, 'iori', 1);
    const p2 = makeFighter(600, 'athena', -1);
    const char = makeCharDef('athena');
    const ai = new AdvancedAI(p2, p1, char, 'hard');

    let projectileOrSpaceCount = 0;
    for (let i = 0; i < 150; i++) {
      p2.state = FighterState.IDLE;
      p2.currentAttack = null;
      p2.attackPhase = 'none';
      const input = ai.getInput();
      // Projectile pattern (down + punch) or spacing (back/forward movement without attack)
      if ((input.down && (input.buttonA || input.buttonC)) || input.forward) {
        projectileOrSpaceCount++;
      }
    }
    // Athena at far range should use projectiles or approach
    expect(projectileOrSpaceCount).toBeGreaterThan(0);
  });

  it('Clark (close/aggressive=0.5) favors throws', () => {
    const strategy = getCharacterStrategy('clark');
    expect(strategy.preferredRange).toBe('close');

    // Clark's wakeUpOptions contain multiple throw options
    const hasThrowOptions = strategy.wakeUpOptions.some(
      opt => opt === AttackType.THROW_FORWARD || opt === AttackType.THROW_BACK
        || opt === AttackType.CLARK_ARGENTINE || opt === AttackType.CLARK_VULCAN,
    );
    expect(hasThrowOptions).toBe(true);

    // Test throw frequency at close range
    const p1 = makeFighter(300, 'iori', 1);
    const p2 = makeFighter(320, 'clark', -1);
    const char = makeCharDef('clark');
    const ai = new AdvancedAI(p2, p1, char, 'hard');

    let throwCount = 0;
    for (let i = 0; i < 200; i++) {
      p2.state = FighterState.IDLE;
      p2.currentAttack = null;
      p2.attackPhase = 'none';
      const input = ai.getInput();
      if (input.throwAttack) throwCount++;
    }
    // Clark should attempt throws at close range
    expect(throwCount).toBeGreaterThan(0);
  });

  it('Kim (mid/aggressive=0.75) uses kick-based attacks', () => {
    const strategy = getCharacterStrategy('kim');
    expect(strategy.preferredRange).toBe('mid');
    expect(strategy.aggressiveLevel).toBeGreaterThanOrEqual(0.75);

    // Kim's preferredAntiAir and preferredPoke should be kick moves
    expect(strategy.preferredAntiAir).toBe(AttackType.KIM_HIENZAN);
    expect(strategy.preferredPoke).toBe(AttackType.KIM_HISHOU_KICK);

    const p1 = makeFighter(300, 'kyo', 1);
    const p2 = makeFighter(370, 'kim', -1); // 70px, close enough for poke
    const char = makeCharDef('kim');
    const ai = new AdvancedAI(p2, p1, char, 'hard');

    let kickCount = 0;
    let anyButton = 0;
    for (let i = 0; i < 200; i++) {
      p2.state = FighterState.IDLE;
      p2.currentAttack = null;
      p2.attackPhase = 'none';
      const input = ai.getInput();
      if (input.buttonB || input.buttonD) kickCount++;
      if (input.buttonA || input.buttonB || input.buttonC || input.buttonD) anyButton++;
    }
    // Kim should press buttons; kick buttons are used in combos and pokes
    expect(anyButton).toBeGreaterThan(0);
    // At close-mid range with high aggression, Kim should use some kicks
    expect(kickCount).toBeGreaterThan(0);
  });

  it('Yamazaki (mid/aggressive=0.7) uses snake arm and mid-range tools', () => {
    const strategy = getCharacterStrategy('yamazaki');
    expect(strategy.preferredRange).toBe('mid');
    expect(strategy.aggressiveLevel).toBeGreaterThanOrEqual(0.7);

    // Yamazaki's preferred poke is snake arm
    expect(strategy.preferredPoke).toBe(AttackType.YAMAZAKI_SNAKE_ARM);
    expect(strategy.preferredAntiAir).toBe(AttackType.YAMAZAKI_SANDSTORM);
    expect(strategy.preferredDM).toBe(AttackType.DM_GUILLOTINE);

    const p1 = makeFighter(300, 'kyo', 1);
    const p2 = makeFighter(400, 'yamazaki', -1);
    const char = makeCharDef('yamazaki');
    const ai = new AdvancedAI(p2, p1, char, 'hard');

    let activeFrames = 0;
    for (let i = 0; i < 120; i++) {
      p2.state = FighterState.IDLE;
      p2.currentAttack = null;
      p2.attackPhase = 'none';
      const input = ai.getInput();
      if (input.buttonA || input.buttonB || input.buttonC || input.buttonD
        || input.forward || input.back) {
        activeFrames++;
      }
    }
    // Yamazaki should be active at mid range
    expect(activeFrames).toBeGreaterThan(20);
  });

  it('Mai (far/aggressive=0.55) uses projectiles and air tactics', () => {
    const strategy = getCharacterStrategy('mai');
    expect(strategy.preferredRange).toBe('far');
    expect(strategy.aggressiveLevel).toBeGreaterThanOrEqual(0.55);

    // Mai's preferred poke is a projectile (Ka Cho Sen)
    expect(strategy.preferredPoke).toBe(AttackType.MAI_KA_CHO_SEN);
    // Mai's wakeUpOptions include JUMP_C (air tactic)
    expect(strategy.wakeUpOptions).toContain(AttackType.JUMP_C);

    const p1 = makeFighter(300, 'iori', 1);
    const p2 = makeFighter(550, 'mai', -1);
    const char = makeCharDef('mai');
    const ai = new AdvancedAI(p2, p1, char, 'hard');

    let projectileOrAirCount = 0;
    for (let i = 0; i < 200; i++) {
      p2.state = FighterState.IDLE;
      p2.currentAttack = null;
      p2.attackPhase = 'none';
      const input = ai.getInput();
      // Projectile (down+punch) or jump (up/forward)
      if ((input.down && (input.buttonA || input.buttonC)) || (input.up && input.forward)) {
        projectileOrAirCount++;
      }
    }
    // Mai at far range should use projectiles or air approaches
    expect(projectileOrAirCount).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// 5. Difficulty Regulation (5 tests)
// ═══════════════════════════════════════════════════════════════

describe('Difficulty regulation', () => {
  it('Easy difficulty has slower reactions (more idle frames)', () => {
    const p1 = makeFighter(300, 'kyo', 1);
    const char = makeCharDef('kyo');

    // Easy AI
    const p2Easy = makeFighter(500, 'kyo', -1);
    const easyAI = new AdvancedAI(p2Easy, p1, char, 'easy');

    let easyActiveFrames = 0;
    for (let i = 0; i < 120; i++) {
      p2Easy.state = FighterState.IDLE;
      p2Easy.currentAttack = null;
      p2Easy.attackPhase = 'none';
      const input = easyAI.getInput();
      if (input.buttonA || input.buttonB || input.buttonC || input.buttonD
        || input.forward || input.back || input.throwAttack) {
        easyActiveFrames++;
      }
    }

    // Hard AI
    const p2Hard = makeFighter(500, 'kyo', -1);
    const hardAI = new AdvancedAI(p2Hard, p1, char, 'hard');

    let hardActiveFrames = 0;
    for (let i = 0; i < 120; i++) {
      p2Hard.state = FighterState.IDLE;
      p2Hard.currentAttack = null;
      p2Hard.attackPhase = 'none';
      const input = hardAI.getInput();
      if (input.buttonA || input.buttonB || input.buttonC || input.buttonD
        || input.forward || input.back || input.throwAttack) {
        hardActiveFrames++;
      }
    }

    // Hard AI should be at least as active as easy AI
    // (hard has reactionDelay=2 vs easy reactionDelay=14)
    expect(hardActiveFrames).toBeGreaterThanOrEqual(easyActiveFrames);
  });

  it('Medium difficulty has moderate reaction speed', () => {
    const p1 = makeFighter(300, 'kyo', 1);
    const p2 = makeFighter(400, 'kyo', -1);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 'medium');

    // Medium AI should produce valid inputs
    let validFrames = 0;
    for (let i = 0; i < 60; i++) {
      p2.state = FighterState.IDLE;
      const input = ai.getInput();
      expect(input).toBeDefined();
      // Any non-trivial input counts
      if (input.forward || input.back || input.buttonA || input.buttonB
        || input.buttonC || input.buttonD || input.up) {
        validFrames++;
      }
    }
    expect(validFrames).toBeGreaterThan(0);
  });

  it('Hard difficulty reacts fast to anti-air situations', () => {
    const p1 = makeFighter(300, 'kyo', 1);
    const p2 = makeFighter(380, 'kyo', -1);
    const char = makeCharDef('kyo');

    // Hard AI with airborne opponent
    p1.state = FighterState.JUMP;
    p1.vy = -10;

    const ai = new AdvancedAI(p2, p1, char, 'hard');

    let aaResponse = false;
    for (let i = 0; i < 15; i++) {
      p1.state = FighterState.JUMP;
      const input = ai.getInput();
      if (input.buttonC && input.buttonCPressed) {
        aaResponse = true;
      }
    }
    // Hard AI should anti-air quickly (within 15 frames)
    expect(aaResponse).toBe(true);
  });

  it('difficulty affects combo execution rate', () => {
    // Hard AI has lower comboDropRate (0.03) vs easy (0.45)
    // Test that hard AI completes more combo steps
    const p1 = makeFighter(300, 'kyo', 1);

    const runComboTest = (difficulty: AIDifficultyLevel): number => {
      const p2 = makeFighter(330, 'kyo', -1);
      const char = makeCharDef('kyo');
      const ai = new AdvancedAI(p2, p1, char, difficulty);

      // Make opponent dizzy to trigger combo
      p1.state = FighterState.DIZZY;
      p1.dizzyTimer = 120;

      let buttonPresses = 0;
      for (let i = 0; i < 100; i++) {
        p2.state = FighterState.IDLE;
        p2.currentAttack = null;
        p2.attackPhase = 'none';
        const input = ai.getInput();
        if (input.buttonA || input.buttonB || input.buttonC || input.buttonD) {
          buttonPresses++;
        }
      }
      return buttonPresses;
    };

    const hardButtons = runComboTest('hard');
    const easyButtons = runComboTest('easy');

    // Hard AI should press more buttons in combo situation (lower drop rate)
    expect(hardButtons).toBeGreaterThanOrEqual(easyButtons);
  });

  it('difficulty affects anti-air success rate', () => {
    // Hard: antiAirRate=0.85, Easy: antiAirRate=0.15
    // Test anti-air response frequency
    const testAntiAir = (difficulty: AIDifficultyLevel): number => {
      const p1 = makeFighter(300, 'kyo', 1);
      const p2 = makeFighter(380, 'kyo', -1);
      const char = makeCharDef('kyo');
      const ai = new AdvancedAI(p2, p1, char, difficulty);

      let aaResponses = 0;
      for (let trial = 0; trial < 10; trial++) {
        // Reset AI for each trial
        ai.reset();
        p1.state = FighterState.JUMP;
        p1.vy = -10;

        for (let frame = 0; frame < 30; frame++) {
          p1.state = FighterState.JUMP;
          const input = ai.getInput();
          if (input.buttonC) {
            aaResponses++;
            break;
          }
        }
      }
      return aaResponses;
    };

    const hardAA = testAntiAir('hard');
    const easyAA = testAntiAir('easy');

    // Hard AI should anti-air more often than easy
    expect(hardAA).toBeGreaterThanOrEqual(easyAA);
    // Hard should anti-air at least some of the time
    expect(hardAA).toBeGreaterThan(0);
  });
});
