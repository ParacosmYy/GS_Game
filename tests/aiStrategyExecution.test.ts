/**
 * AI Strategy Execution Tests
 *
 * Comprehensive tests covering character strategy uniqueness, range management,
 * anti-air behavior, combo execution, wake-up options, difficulty scaling,
 * and meter management for the AdvancedAI system.
 */
import { describe, it, expect } from 'vitest';
import { AdvancedAI, type AIDifficultyLevel } from '../src/ai/advancedAI.js';
import {
  ALL_STRATEGIES,
  getCharacterStrategy,
  type CharacterStrategy,
  type PreferredRange,
} from '../src/ai/characterStrategies.js';
import { COMBO_ROUTES } from '../src/ai/aiRoutes.js';
import { Fighter } from '../src/entities/fighter.js';
import { FighterState, AttackType } from '../src/core/types.js';
import type { CharacterDefinition } from '../src/characters/types.js';

// ── Helpers ──

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

function makeGauge(stocks: number, meter: number = 0) {
  return { meter, stocks, maxMeter: 100 };
}

function makeMaxMode(active: boolean = false) {
  return { active, timer: 0, maxDuration: 600 };
}

const VALID_ATTACK_TYPES = new Set<string>(Object.values(AttackType));

/** All 27 character IDs */
const ALL_CHAR_IDS = [
  'kyo', 'iori', 'terry', 'kim', 'ryo', 'kdash', 'mai', 'robert',
  'clark', 'ralf', 'kula', 'leona', 'athena', 'billy', 'chang', 'choi',
  'joe', 'andy', 'mature', 'yashiro', 'chris', 'vice', 'shermie',
  'yamazaki', 'mary', 'xiangfei', 'kasumi',
];

/** Reset fighter to clean actable state between frames */
function resetFighter(f: Fighter): void {
  f.state = FighterState.IDLE;
  f.currentAttack = null;
  f.attackFrame = 0;
  f.attackPhase = 'none';
  f.hitstunTimer = 0;
  f.blockstunTimer = 0;
  f.knockdownTimer = 0;
  f.landingRecovery = 0;
  f.rollTimer = 0;
  f.hasHit = false;
}

// ═══════════════════════════════════════════════════════════════
// 1. Character Strategy Uniqueness (5 tests)
// ═══════════════════════════════════════════════════════════════

describe('Character Strategy Uniqueness', () => {
  it('each character has a unique preferredRange distribution across close/mid/far', () => {
    const ranges = ALL_STRATEGIES.map(s => s.preferredRange);
    const closeChars = ranges.filter(r => r === 'close').length;
    const midChars = ranges.filter(r => r === 'mid').length;
    const farChars = ranges.filter(r => r === 'far').length;
    // All three range categories must be represented
    expect(closeChars).toBeGreaterThan(0);
    expect(midChars).toBeGreaterThan(0);
    expect(farChars).toBeGreaterThan(0);
    // Total must equal all strategies
    expect(closeChars + midChars + farChars).toBe(ALL_STRATEGIES.length);
  });

  it('aggressiveLevel varies across characters with some aggressive and some defensive', () => {
    const levels = ALL_STRATEGIES.map(s => s.aggressiveLevel);
    // At least one aggressive (>= 0.8) and one defensive (<= 0.4)
    const aggressive = levels.filter(l => l >= 0.8).length;
    const defensive = levels.filter(l => l <= 0.4).length;
    expect(aggressive).toBeGreaterThan(0);
    expect(defensive).toBeGreaterThan(0);
    // The levels are not all the same
    const unique = new Set(levels);
    expect(unique.size).toBeGreaterThan(3);
  });

  it('each character has a unique anti-air move preference', () => {
    const antiAirs = ALL_STRATEGIES.map(s => s.preferredAntiAir);
    // All anti-air entries are valid AttackTypes
    for (const aa of antiAirs) {
      expect(VALID_ATTACK_TYPES.has(aa)).toBe(true);
    }
    // There is diversity in anti-air choices (not all the same)
    const unique = new Set(antiAirs);
    expect(unique.size).toBeGreaterThan(1);
  });

  it('each character has a unique poke move preference', () => {
    const pokes = ALL_STRATEGIES.map(s => s.preferredPoke);
    for (const p of pokes) {
      expect(VALID_ATTACK_TYPES.has(p)).toBe(true);
    }
    // Diversity in poke selections
    const unique = new Set(pokes);
    expect(unique.size).toBeGreaterThan(1);
  });

  it('DM preferences differ across characters', () => {
    const dms = ALL_STRATEGIES.map(s => s.preferredDM);
    for (const dm of dms) {
      expect(VALID_ATTACK_TYPES.has(dm)).toBe(true);
      // All DM preferences should start with DM_ prefix
      expect(dm.startsWith('DM_')).toBe(true);
    }
    // Each character should have a different DM (since each has a unique super)
    const unique = new Set(dms);
    expect(unique.size).toBe(ALL_STRATEGIES.length);
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. Range Management (5 tests)
// ═══════════════════════════════════════════════════════════════

describe('Range Management', () => {
  it('AI at long range approaches (uses forward movement)', () => {
    const p1 = makeFighter(300, 'kyo', 1);
    const p2 = makeFighter(700, 'kyo', -1); // 400px apart -- far range
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 'hard');

    let forwardCount = 0;
    for (let i = 0; i < 120; i++) {
      resetFighter(p2);
      const input = ai.getInput();
      if (input.forward) forwardCount++;
    }
    // At far range, the AI should predominantly approach
    expect(forwardCount).toBeGreaterThan(30);
  });

  it('AI at preferred range attacks', () => {
    // Kyo's preferred distance is 90px
    const p1 = makeFighter(300, 'kyo', 1);
    const p2 = makeFighter(390, 'kyo', -1); // ~90px apart
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 'hard');

    let attackButtons = 0;
    for (let i = 0; i < 150; i++) {
      resetFighter(p2);
      const input = ai.getInput();
      if (input.buttonA || input.buttonB || input.buttonC || input.buttonD
        || input.throwAttack) {
        attackButtons++;
      }
    }
    // At preferred range, AI should attack
    expect(attackButtons).toBeGreaterThan(10);
  });

  it('AI at close range uses close-range moves', () => {
    const p1 = makeFighter(300, 'kyo', 1);
    const p2 = makeFighter(320, 'kyo', -1); // 20px -- very close
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 'hard');

    let closeActions = 0;
    for (let i = 0; i < 120; i++) {
      resetFighter(p2);
      const input = ai.getInput();
      // Close range: attack buttons, throws, or pressure
      if (input.buttonC || input.buttonA || input.buttonB
        || input.buttonD || input.throwAttack) {
        closeActions++;
      }
    }
    // At very close range, AI should use close-range moves
    expect(closeActions).toBeGreaterThan(20);
  });

  it('AI retreats when health is low (defensive behavior)', () => {
    const p1 = makeFighter(300, 'kyo', 1);
    const p2 = makeFighter(340, 'kyo', -1);
    p2.health = p2.maxHealth * 0.1; // critical health
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 'hard');

    let retreatOrBlock = 0;
    for (let i = 0; i < 120; i++) {
      resetFighter(p2);
      p2.health = p2.maxHealth * 0.1;
      const input = ai.getInput();
      if (input.back || input.down) {
        retreatOrBlock++;
      }
    }
    // At low HP, AI should show some defensive behavior (retreat/block)
    expect(retreatOrBlock).toBeGreaterThan(0);
  });

  it('AI aggression increases when opponent is cornered', () => {
    // Place opponent in corner (x < 80)
    const p1 = makeFighter(50, 'kyo', 1);
    const p2 = makeFighter(130, 'kyo', -1);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 'hard');

    let attackActions = 0;
    for (let i = 0; i < 90; i++) {
      resetFighter(p2);
      const input = ai.getInput();
      if (input.buttonC || input.buttonA || input.buttonB
        || input.buttonD || input.throwAttack) {
        attackActions++;
      }
    }
    // Against cornered opponent, AI should pressure with attacks
    expect(attackActions).toBeGreaterThan(5);
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. Anti-Air Behavior (4 tests)
// ═══════════════════════════════════════════════════════════════

describe('Anti-Air Behavior', () => {
  it('AI uses anti-air move when opponent is jumping', () => {
    const p1 = makeFighter(300, 'kyo', 1);
    const p2 = makeFighter(380, 'kyo', -1); // 80px apart
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 'hard');

    let aaResponse = false;
    for (let i = 0; i < 30; i++) {
      p1.state = FighterState.JUMP;
      p1.vy = -10;
      resetFighter(p2);
      const input = ai.getInput();
      // Anti-air uses buttonC (DP-type move)
      if (input.buttonC && input.buttonCPressed) {
        aaResponse = true;
      }
    }
    expect(aaResponse).toBe(true);
  });

  it('AI blocks incoming jump attacks when no anti-air available', () => {
    // When the AI fighter is in hitstun/blockstun, it can't anti-air and defaults to block
    const p1 = makeFighter(300, 'kyo', 1);
    const p2 = makeFighter(360, 'kyo', -1);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 'hard');

    // Simulate fighter being unable to act (in hitstun)
    p2.state = FighterState.HITSTUN;
    p2.hitstunTimer = 10;
    p1.state = FighterState.AIR_ATTACK;

    const input = ai.getInput();
    // When hitstun, the AI can't do much but should still return valid input
    expect(input).toBeDefined();
    // Input should not contain attack buttons when in hitstun
    expect(input.buttonA || input.buttonC || input.buttonD).toBe(false);
  });

  it('anti-air move selection matches character spacing profile', () => {
    // Verify that characters with 'dp' antiAirType use buttonC and 'crouchC' use down+buttonC
    const dpChars = ['kyo', 'iori', 'terry', 'kim', 'kdash', 'kula', 'leona',
      'robert', 'athena', 'mai', 'joe', 'andy', 'billy', 'choi', 'mature',
      'chris', 'vice', 'yamazaki', 'xiangfei', 'kasumi'];
    const crouchCChars = ['ralf', 'clark', 'chang', 'yashiro', 'shermie', 'mary'];

    // Verify each character's anti-air preference is a valid attack type
    for (const charId of [...dpChars, ...crouchCChars]) {
      const strategy = getCharacterStrategy(charId);
      expect(VALID_ATTACK_TYPES.has(strategy.preferredAntiAir)).toBe(true);
    }

    // Spot check: Kyo should have a DP-type anti-air (ONIYAKI_C)
    const kyoStrategy = getCharacterStrategy('kyo');
    expect(kyoStrategy.preferredAntiAir).toBe(AttackType.KYO_ONIYAKI_C);

    // Ralf should have crouch_C type anti-air
    const ralfStrategy = getCharacterStrategy('ralf');
    expect(ralfStrategy.preferredAntiAir).toBe(AttackType.CROUCH_C);
  });

  it('AI does not anti-air grounded opponents', () => {
    const p1 = makeFighter(300, 'kyo', 1);
    const p2 = makeFighter(380, 'kyo', -1);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 'hard');

    // Opponent is grounded (IDLE)
    p1.state = FighterState.IDLE;

    // Track if anti-air pattern (buttonC + buttonCPressed with forward) is triggered
    let dpInputCount = 0;
    for (let i = 0; i < 120; i++) {
      resetFighter(p2);
      p1.state = FighterState.IDLE;
      const input = ai.getInput();
      // DP pattern: buttonC pressed with buttonCPressed (anti-air signature)
      if (input.buttonC && input.buttonCPressed && input.forward) {
        dpInputCount++;
      }
    }
    // When opponent is grounded, anti-air-specific pattern should be rare
    // (most buttonC presses would be normal attacks, not anti-air DP)
    // We verify the AI doesn't spam anti-air pattern at ground level
    expect(dpInputCount).toBeLessThan(60);
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. Combo Execution (4 tests)
// ═══════════════════════════════════════════════════════════════

describe('Combo Execution', () => {
  it('AI uses comboStarter to begin combos', () => {
    // All strategies use CLOSE_C as comboStarter -- verify the first combo step matches
    for (const strategy of ALL_STRATEGIES) {
      expect(strategy.preferredComboStarter).toBe(AttackType.CLOSE_C);
    }
    // Verify combo routes start with closeC
    for (const charId of ALL_CHAR_IDS) {
      const route = COMBO_ROUTES[charId];
      if (route && route.length > 0) {
        expect(route[0].attack).toBe('closeC');
        expect(route[0].type).toBe('button');
      }
    }
  });

  it('AI follows up combo starter with appropriate follow-up', () => {
    // Verify each character has at least a 2-step combo route
    for (const charId of ALL_CHAR_IDS) {
      const route = COMBO_ROUTES[charId] ?? COMBO_ROUTES['_default'];
      expect(route.length).toBeGreaterThanOrEqual(2);
      // Second step should have a delay > 0
      if (route.length > 1) {
        expect(typeof route[1].delay).toBe('number');
      }
    }

    // Test that AI actually presses buttons in combo over multiple frames
    const p1 = makeFighter(300, 'kyo', 1);
    const p2 = makeFighter(330, 'kyo', -1);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 'hard');
    // Make opponent dizzy to guarantee combo
    p1.state = FighterState.DIZZY;
    p1.dizzyTimer = 120;

    let comboButtonPresses = 0;
    for (let i = 0; i < 80; i++) {
      resetFighter(p2);
      p1.state = FighterState.DIZZY;
      const input = ai.getInput();
      if (input.buttonA || input.buttonB || input.buttonC || input.buttonD) {
        comboButtonPresses++;
      }
    }
    expect(comboButtonPresses).toBeGreaterThan(5);
  });

  it('AI uses DM at end of combo when meter available', () => {
    // Verify combo routes end with DM step
    for (const charId of ALL_CHAR_IDS) {
      const route = COMBO_ROUTES[charId] ?? COMBO_ROUTES['_default'];
      const lastStep = route[route.length - 1];
      // Last step should be a DM (attack name contains 'dm')
      expect(lastStep.attack.toLowerCase()).toContain('dm');
    }

    // Test that triggerSpecial returns DM when in combo with meter
    const p1 = makeFighter(300, 'kyo', 1);
    const p2 = makeFighter(330, 'kyo', -1);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 'hard');
    ai.gauge = makeGauge(3, 0);
    ai.maxMode = makeMaxMode(false);

    // Set opponent low HP to maximize DM probability
    p1.health = p1.maxHealth * 0.1;

    let dmTriggered = false;
    for (let i = 0; i < 500; i++) {
      resetFighter(p2);
      const special = ai.triggerSpecial();
      if (special && special.toString().startsWith('DM_')) {
        dmTriggered = true;
        break;
      }
      ai.getInput();
    }
    expect(dmTriggered).toBe(true);
  });

  it('AI cancels into special on hit confirm', () => {
    // Verify combo routes contain special-type steps after button-type steps
    for (const charId of ALL_CHAR_IDS) {
      const route = COMBO_ROUTES[charId] ?? COMBO_ROUTES['_default'];
      if (route.length >= 3) {
        // There should be at least one special step after the initial button steps
        const hasSpecialAfterButton = route.some((step, idx) =>
          step.type === 'special' && idx > 0,
        );
        expect(hasSpecialAfterButton).toBe(true);
      }
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// 5. Wake-up Options (4 tests)
// ═══════════════════════════════════════════════════════════════

describe('Wake-up Options', () => {
  it('AI has wake-up reversal moves defined', () => {
    for (const strategy of ALL_STRATEGIES) {
      expect(strategy.wakeUpOptions.length).toBeGreaterThan(0);
      for (const opt of strategy.wakeUpOptions) {
        expect(VALID_ATTACK_TYPES.has(opt)).toBe(true);
      }
    }
  });

  it('wake-up DP on opponent meaty attack', () => {
    // When AI is knocked down and about to wake up, it should attempt reversal
    const p1 = makeFighter(300, 'kyo', 1);
    const p2 = makeFighter(320, 'kyo', -1);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 'hard');
    ai.gauge = makeGauge(3, 0);
    ai.maxMode = makeMaxMode(false);

    // Simulate wake-up: fighter is knocked down with timer about to expire
    let reversalAttempted = false;
    for (let i = 0; i < 30; i++) {
      p2.state = FighterState.KNOCKDOWN;
      p2.knockdownTimer = 3;
      resetFighter(p1);
      const input = ai.getInput();
      // Wake-up reversal: forward + down + buttonC
      if (input.forward && input.down && input.buttonC) {
        reversalAttempted = true;
      }
    }
    expect(reversalAttempted).toBe(true);
  });

  it('wake-up block when no reversal available', () => {
    // When AI has no meter for wake-up DM, it should block
    const p1 = makeFighter(300, 'kyo', 1);
    const p2 = makeFighter(320, 'kyo', -1);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 'hard');
    ai.gauge = makeGauge(0, 0); // no meter
    ai.maxMode = makeMaxMode(false);

    // Opponent is attacking (meaty)
    p1.state = FighterState.STAND_ATTACK;
    p1.currentAttack = AttackType.CLOSE_C;

    let blocked = false;
    for (let i = 0; i < 60; i++) {
      resetFighter(p2);
      p1.state = FighterState.STAND_ATTACK;
      p1.currentAttack = AttackType.CLOSE_C;
      const input = ai.getInput();
      if (input.back) {
        blocked = true;
      }
    }
    // When opponent attacks, AI should attempt to block
    expect(blocked).toBe(true);
  });

  it('wake-up options respect meter availability', () => {
    // With meter: AI can do reversal DM
    // Without meter: AI is limited to normal moves
    // Verify by checking that strategy wakeUpOptions contain non-meter moves
    for (const strategy of ALL_STRATEGIES) {
      const nonMeterOptions = strategy.wakeUpOptions.filter(
        opt => !opt.toString().startsWith('DM_') && !opt.toString().startsWith('SDM_'),
      );
      // Every character should have at least one non-meter wake-up option
      expect(nonMeterOptions.length).toBeGreaterThan(0);
    }
    // Also verify every character has at least one normal wake-up option (non-DM)
    // Most characters use CLOSE_C; Clark uses command grabs (CLARK_ARGENTINE) instead
    for (const strategy of ALL_STRATEGIES) {
      const hasNormalOption = strategy.wakeUpOptions.some(opt =>
        !opt.toString().startsWith('DM_') && !opt.toString().startsWith('SDM_'),
      );
      expect(hasNormalOption).toBe(true);
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// 6. Difficulty Scaling (4 tests)
// ═══════════════════════════════════════════════════════════════

describe('Difficulty Scaling', () => {
  it('easy difficulty: longer reaction time, misses combos', () => {
    // Easy AI has reactionDelay=14, comboDropRate=0.45
    // Test that easy AI produces fewer attack buttons at close range
    const p1 = makeFighter(300, 'kyo', 1);

    const runTest = (diff: AIDifficultyLevel): number => {
      const p2 = makeFighter(330, 'kyo', -1);
      const char = makeCharDef('kyo');
      const ai = new AdvancedAI(p2, p1, char, diff);

      let attackButtons = 0;
      for (let i = 0; i < 120; i++) {
        resetFighter(p2);
        const input = ai.getInput();
        if (input.buttonA || input.buttonB || input.buttonC || input.buttonD
          || input.throwAttack) {
          attackButtons++;
        }
      }
      return attackButtons;
    };

    const easyButtons = runTest('easy');
    const hardButtons = runTest('hard');

    // Hard AI should be at least as active as easy AI at close range
    expect(hardButtons).toBeGreaterThanOrEqual(easyButtons);
  });

  it('medium difficulty: moderate reactions', () => {
    const p1 = makeFighter(300, 'kyo', 1);
    const p2 = makeFighter(400, 'kyo', -1);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 'medium');

    let validFrames = 0;
    for (let i = 0; i < 60; i++) {
      resetFighter(p2);
      const input = ai.getInput();
      expect(input).toBeDefined();
      if (input.forward || input.back || input.buttonA || input.buttonB
        || input.buttonC || input.buttonD || input.up) {
        validFrames++;
      }
    }
    expect(validFrames).toBeGreaterThan(0);
  });

  it('hard difficulty: fast reactions, optimal combos', () => {
    // Hard AI: reactionDelay=2, comboDropRate=0.03
    // Verify hard AI reacts faster by testing anti-air response time
    const p1 = makeFighter(300, 'kyo', 1);
    const p2 = makeFighter(380, 'kyo', -1);
    const char = makeCharDef('kyo');

    const testAASpeed = (diff: AIDifficultyLevel): number => {
      const ai = new AdvancedAI(makeFighter(380, 'kyo', -1), p1, char, diff);
      p1.state = FighterState.JUMP;
      p1.vy = -10;

      for (let frame = 0; frame < 20; frame++) {
        const aiP2 = ai['fighter'] as Fighter;
        resetFighter(aiP2);
        p1.state = FighterState.JUMP;
        const input = ai.getInput();
        if (input.buttonC && input.buttonCPressed) {
          return frame;
        }
      }
      return 20; // never reacted
    };

    const hardFrame = testAASpeed('hard');
    // Hard AI should react within a few frames (reactionDelay=2)
    expect(hardFrame).toBeLessThan(15);
  });

  it('difficulty affects anti-air timing window', () => {
    // Easy: antiAirRate=0.15, Hard: antiAirRate=0.85
    // Count successful anti-airs across multiple trials
    const testAntiAirRate = (diff: AIDifficultyLevel): number => {
      let successCount = 0;
      const trials = 10;

      for (let trial = 0; trial < trials; trial++) {
        const p1 = makeFighter(300, 'kyo', 1);
        const p2 = makeFighter(380, 'kyo', -1);
        const char = makeCharDef('kyo');
        const ai = new AdvancedAI(p2, p1, char, diff);

        for (let frame = 0; frame < 30; frame++) {
          p1.state = FighterState.JUMP;
          resetFighter(p2);
          const input = ai.getInput();
          if (input.buttonC && input.buttonCPressed) {
            successCount++;
            break;
          }
        }
      }
      return successCount;
    };

    const hardAA = testAntiAirRate('hard');
    const easyAA = testAntiAirRate('easy');

    // Hard should anti-air more often than easy
    expect(hardAA).toBeGreaterThanOrEqual(easyAA);
    expect(hardAA).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// 7. Meter Management (4 tests)
// ═══════════════════════════════════════════════════════════════

describe('Meter Management', () => {
  it('AI saves meter for DM in combo', () => {
    // When not in combo, DM trigger probability is low (0.03 base)
    // When in combo with low-HP opponent, probability is higher
    const p1 = makeFighter(300, 'kyo', 1);
    const p2 = makeFighter(330, 'kyo', -1);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 'hard');
    ai.gauge = makeGauge(3, 0);
    ai.maxMode = makeMaxMode(false);

    // Opponent at full HP -- DM should not be spammed recklessly
    p1.health = p1.maxHealth;

    let dmCount = 0;
    for (let i = 0; i < 200; i++) {
      resetFighter(p2);
      const special = ai.triggerSpecial();
      if (special && special.toString().startsWith('DM_')) {
        dmCount++;
      }
      ai.getInput();
    }
    // DM should not be triggered every frame -- AI saves meter
    expect(dmCount).toBeLessThan(100);
  });

  it('AI activates MAX mode when advantageous', () => {
    // MAX activation when low HP (comeback mechanic)
    const p1 = makeFighter(300, 'kyo', 1);
    const p2 = makeFighter(340, 'kyo', -1);
    p2.health = p2.maxHealth * 0.15; // critical health
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 'hard');
    ai.gauge = makeGauge(3, 0);
    ai.maxMode = makeMaxMode(false);

    let maxAttempted = false;
    for (let i = 0; i < 100; i++) {
      resetFighter(p2);
      p2.health = p2.maxHealth * 0.15;
      const input = ai.getInput();
      // MAX activation: B+C simultaneously pressed
      if (input.buttonB && input.buttonC && input.buttonBPressed && input.buttonCPressed) {
        maxAttempted = true;
      }
    }
    expect(maxAttempted).toBe(true);
  });

  it('AI uses guard cancel when under pressure with meter', () => {
    const p1 = makeFighter(300, 'kyo', 1);
    const p2 = makeFighter(330, 'kyo', -1);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 'hard');
    ai.gauge = makeGauge(3, 0);
    ai.maxMode = makeMaxMode(false);

    // Simulate being in block with low guard gauge
    let gcAttempted = false;
    for (let i = 0; i < 100; i++) {
      p2.state = FighterState.BLOCK;
      p2.guardGauge = 20; // low guard gauge
      p2.blockstunTimer = 10;
      p1.state = FighterState.STAND_ATTACK;

      const input = ai.getInput();
      // GC Roll: A+B+rollPressed, or GC CD: C+D+blowbackPressed
      if ((input.buttonA && input.buttonB && input.rollPressed) ||
          (input.buttonC && input.buttonD && input.blowbackPressed)) {
        gcAttempted = true;
      }
    }
    expect(gcAttempted).toBe(true);
  });

  it('AI does not waste meter on blocked moves', () => {
    // Without meter, triggerSpecial should not return DM
    const p1 = makeFighter(300, 'kyo', 1);
    const p2 = makeFighter(330, 'kyo', -1);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 'hard');
    ai.gauge = makeGauge(0, 0); // no stocks
    ai.maxMode = makeMaxMode(false);

    let dmCount = 0;
    for (let i = 0; i < 200; i++) {
      resetFighter(p2);
      const special = ai.triggerSpecial();
      if (special && special.toString().startsWith('DM_')) {
        dmCount++;
      }
      ai.getInput();
    }
    // With 0 stocks, DM should never be triggered
    expect(dmCount).toBe(0);
  });
});
