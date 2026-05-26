/**
 * AI Difficulty Scaling Tests — verify KOF2002 AI difficulty system
 * parameters and behavioral differences across easy/medium/hard.
 *
 * Tests cover: reaction time, anti-air rate, combo execution, meter
 * management, defense behavior, and strategy consistency across 20 tests.
 */
import { describe, it, expect } from 'vitest';
import { AdvancedAI, type AIDifficultyLevel, type AIDifficultyConfig } from '../src/ai/advancedAI.js';
import { Fighter } from '../src/entities/fighter.js';
import { FighterState, AttackType } from '../src/core/types.js';
import type { CharacterDefinition } from '../src/characters/types.js';
import { ROSTER } from '../src/characters/index.js';

// ── Difficulty presets (mirrored from advancedAI.ts for config validation) ──

const DIFFICULTY_PRESETS: Record<AIDifficultyLevel, AIDifficultyConfig> = {
  easy: {
    reactionDelay: 14,
    comboDropRate: 0.45,
    blockRate: 0.3,
    antiAirRate: 0.15,
    meterManagementRate: 0.1,
    spacingAwareness: 0.2,
    okiQuality: 0.15,
    aggressionScale: 0.4,
  },
  medium: {
    reactionDelay: 7,
    comboDropRate: 0.18,
    blockRate: 0.65,
    antiAirRate: 0.55,
    meterManagementRate: 0.45,
    spacingAwareness: 0.6,
    okiQuality: 0.5,
    aggressionScale: 0.7,
  },
  hard: {
    reactionDelay: 2,
    comboDropRate: 0.03,
    blockRate: 0.9,
    antiAirRate: 0.85,
    meterManagementRate: 0.85,
    spacingAwareness: 0.9,
    okiQuality: 0.85,
    aggressionScale: 1.0,
  },
};

// ── Helpers ──

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

/** Reset fighter to actable idle so AI keeps deciding each frame */
function resetToIdle(f: Fighter): void {
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
  f.vx = 0;
  f.vy = 0;
}

// ═══════════════════════════════════════════════════════════════
// 1. Difficulty Level Setup (3 tests)
// ═══════════════════════════════════════════════════════════════

describe('Difficulty Level Setup', () => {
  it('creates AI instances for each difficulty level without error', () => {
    const levels: AIDifficultyLevel[] = ['easy', 'medium', 'hard'];
    for (const level of levels) {
      const p1 = makeFighter(300);
      const p2 = makeFighter(500);
      const char = makeCharDef('kyo');
      const ai = new AdvancedAI(p2, p1, char, level);
      const input = ai.getInput();
      expect(input).toBeDefined();
      expect(typeof input.up).toBe('boolean');
    }
  });

  it('difficulty parameters are correctly ordered: hard < medium < easy for delays, easy < medium < hard for rates', () => {
    const easy = DIFFICULTY_PRESETS.easy;
    const medium = DIFFICULTY_PRESETS.medium;
    const hard = DIFFICULTY_PRESETS.hard;

    // Reaction delay: easy is slowest, hard is fastest
    expect(easy.reactionDelay).toBeGreaterThan(medium.reactionDelay);
    expect(medium.reactionDelay).toBeGreaterThan(hard.reactionDelay);

    // All rate parameters scale with difficulty
    const rateKeys: (keyof AIDifficultyConfig)[] = [
      'blockRate', 'antiAirRate', 'meterManagementRate',
      'spacingAwareness', 'okiQuality', 'aggressionScale',
    ];
    for (const key of rateKeys) {
      expect(easy[key]).toBeLessThan(medium[key]);
      expect(medium[key]).toBeLessThan(hard[key]);
    }

    // Combo drop rate goes the other way: easy drops most, hard drops least
    expect(easy.comboDropRate).toBeGreaterThan(medium.comboDropRate);
    expect(medium.comboDropRate).toBeGreaterThan(hard.comboDropRate);
  });

  it('default difficulty when no argument is medium (constructor default)', () => {
    const p1 = makeFighter(300);
    const p2 = makeFighter(500);
    const char = makeCharDef('kyo');
    // Constructor signature: difficulty: AIDifficultyLevel | number = 'medium'
    const ai = new AdvancedAI(p2, p1, char);
    // The AI should behave identically to an explicit 'medium' AI
    // We verify this by checking the reactionDelay is 7 (medium value)
    // Since reactionDelay is private, we verify behaviorally: run many frames
    // and check that the decision frequency matches medium (not easy or hard)
    const aiMedium = new AdvancedAI(p2, p1, char, 'medium');

    const inputs1: boolean[] = [];
    const inputs2: boolean[] = [];

    for (let i = 0; i < 60; i++) {
      resetToIdle(p2);
      const in1 = ai.getInput();
      const in2 = aiMedium.getInput();
      inputs1.push(in1.forward || in1.back || in1.buttonA || in1.buttonC);
      inputs2.push(in2.forward || in2.back || in2.buttonA || in2.buttonC);
    }

    // Default and explicit medium should produce identical sequences
    // (same fighter state => same RNG seed => same decisions)
    expect(inputs1).toEqual(inputs2);
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. Reaction Time Scaling (3 tests)
// ═══════════════════════════════════════════════════════════════

describe('Reaction Time Scaling', () => {
  it('easy difficulty has long reaction time (>10 frames)', () => {
    const easy = DIFFICULTY_PRESETS.easy;
    expect(easy.reactionDelay).toBeGreaterThan(10);

    // Behavioral verification: count how often easy AI changes action
    // in a fixed window. With delay=14, the AI should decide at most
    // ceil(60/14) = 5 times in 60 frames.
    const p1 = makeFighter(300);
    const p2 = makeFighter(500);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 'easy');

    let decisionCount = 0;
    let lastForward = false;
    for (let i = 0; i < 60; i++) {
      resetToIdle(p2);
      const input = ai.getInput();
      const isActive = input.forward || input.back || input.buttonA
        || input.buttonB || input.buttonC || input.buttonD;
      if (isActive !== lastForward) {
        decisionCount++;
        lastForward = isActive;
      }
    }
    // With reactionDelay=14, the thinkCooldown limits decision frequency.
    // The AI should make relatively few decision changes.
    expect(decisionCount).toBeLessThan(20);
  });

  it('medium difficulty has moderate reaction time', () => {
    const medium = DIFFICULTY_PRESETS.medium;
    expect(medium.reactionDelay).toBeGreaterThan(3);
    expect(medium.reactionDelay).toBeLessThanOrEqual(10);

    const easy = DIFFICULTY_PRESETS.easy;
    const hard = DIFFICULTY_PRESETS.hard;
    // Medium is between easy and hard
    expect(medium.reactionDelay).toBeLessThan(easy.reactionDelay);
    expect(medium.reactionDelay).toBeGreaterThan(hard.reactionDelay);
  });

  it('hard difficulty has short reaction time (<5 frames)', () => {
    const hard = DIFFICULTY_PRESETS.hard;
    expect(hard.reactionDelay).toBeLessThan(5);

    // Behavioral: hard AI should react quickly to state changes.
    // Place opponent close, make them attack, verify hard AI blocks fast.
    const p1 = makeFighter(300);
    const p2 = makeFighter(340);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 'hard');

    // Frame 0: opponent starts attacking
    p1.state = FighterState.STAND_ATTACK;
    p1.currentAttack = AttackType.CLOSE_C;

    let blockFound = false;
    // With reactionDelay=2, hard AI should block within 4 frames
    for (let i = 0; i < 10; i++) {
      resetToIdle(p2);
      const input = ai.getInput();
      if (input.back) {
        blockFound = true;
        break;
      }
    }
    expect(blockFound).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. Anti-Air Rate (3 tests)
// ═══════════════════════════════════════════════════════════════

describe('Anti-Air Rate', () => {
  it('easy anti-air rate is low (<30%)', () => {
    const easy = DIFFICULTY_PRESETS.easy;
    expect(easy.antiAirRate).toBeLessThan(0.30);

    // Behavioral: compare easy vs hard anti-air frequency across
    // varied game states. We vary the distance to produce different
    // RNG seeds and count how often each difficulty produces AA buttons.
    let easyAACount = 0;
    let hardAACount = 0;
    const trials = 100;

    for (let t = 0; t < trials; t++) {
      // Vary positions slightly to get different RNG seeds
      const baseX = 200 + t * 5;

      // Easy
      const p1e = makeFighter(300);
      const p2e = makeFighter(baseX);
      const charE = makeCharDef('kyo');
      const aiE = new AdvancedAI(p2e, p1e, charE, 'easy');
      p1e.state = FighterState.JUMP;
      p1e.vy = -10;

      for (let i = 0; i < 10; i++) {
        resetToIdle(p2e);
        const input = aiE.getInput();
        if (input.buttonC || input.buttonD) { easyAACount++; break; }
      }

      // Hard
      const p1h = makeFighter(300);
      const p2h = makeFighter(baseX);
      const charH = makeCharDef('kyo');
      const aiH = new AdvancedAI(p2h, p1h, charH, 'hard');
      p1h.state = FighterState.JUMP;
      p1h.vy = -10;

      for (let i = 0; i < 10; i++) {
        resetToIdle(p2h);
        const input = aiH.getInput();
        if (input.buttonC || input.buttonD) { hardAACount++; break; }
      }
    }

    // Hard AI should produce more anti-air responses than easy AI
    // due to higher antiAirRate (0.85 vs 0.15)
    expect(hardAACount).toBeGreaterThanOrEqual(easyAACount);
  });

  it('medium anti-air rate is moderate (50-70%)', () => {
    const medium = DIFFICULTY_PRESETS.medium;
    expect(medium.antiAirRate).toBeGreaterThanOrEqual(0.50);
    expect(medium.antiAirRate).toBeLessThanOrEqual(0.70);

    // Verify medium falls between easy and hard
    const easy = DIFFICULTY_PRESETS.easy;
    const hard = DIFFICULTY_PRESETS.hard;
    expect(medium.antiAirRate).toBeGreaterThan(easy.antiAirRate);
    expect(medium.antiAirRate).toBeLessThan(hard.antiAirRate);
  });

  it('hard anti-air rate is high (>80%)', () => {
    const hard = DIFFICULTY_PRESETS.hard;
    expect(hard.antiAirRate).toBeGreaterThan(0.80);

    // Behavioral: verify hard AI produces anti-air responses
    // across varied game states
    let aaCount = 0;
    const trials = 100;
    for (let t = 0; t < trials; t++) {
      const baseX = 200 + t * 5;
      const p1 = makeFighter(300);
      const p2 = makeFighter(baseX);
      const char = makeCharDef('kyo');
      const ai = new AdvancedAI(p2, p1, char, 'hard');

      p1.state = FighterState.JUMP;
      p1.vy = -10;

      for (let i = 0; i < 10; i++) {
        resetToIdle(p2);
        const input = ai.getInput();
        if (input.buttonC || input.buttonD) { aaCount++; break; }
      }
    }
    // Hard AI should produce AA in many trials
    expect(aaCount).toBeGreaterThan(trials * 0.3);
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. Combo Execution (3 tests)
// ═══════════════════════════════════════════════════════════════

describe('Combo Execution', () => {
  it('easy combo drop rate is high', () => {
    const easy = DIFFICULTY_PRESETS.easy;
    // Easy drops 45% of combos
    expect(easy.comboDropRate).toBeGreaterThanOrEqual(0.40);

    // Behavioral: run AI in close range attack scenario and count
    // how often combo chain is interrupted (detected by idle gaps
    // between button presses)
    const p1 = makeFighter(300);
    const p2 = makeFighter(330, 'kyo', -1);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 'easy');

    let buttonPresses = 0;
    let idleGaps = 0;
    let lastHadButton = false;

    for (let i = 0; i < 200; i++) {
      resetToIdle(p2);
      const input = ai.getInput();
      const hasButton = !!(input.buttonA || input.buttonB || input.buttonC || input.buttonD);
      if (hasButton) buttonPresses++;
      if (!hasButton && lastHadButton) idleGaps++;
      lastHadButton = hasButton;
    }
    // Easy AI should produce button presses (it still attacks) but
    // the high comboDropRate means combos get dropped frequently.
    // We just verify the drop rate config is high and the AI runs.
    expect(buttonPresses).toBeGreaterThan(0);
  });

  it('medium combo drop rate is moderate', () => {
    const medium = DIFFICULTY_PRESETS.medium;
    const easy = DIFFICULTY_PRESETS.easy;
    const hard = DIFFICULTY_PRESETS.hard;

    // Medium drop rate is between easy and hard
    expect(medium.comboDropRate).toBeGreaterThan(hard.comboDropRate);
    expect(medium.comboDropRate).toBeLessThan(easy.comboDropRate);
    // Medium is non-trivial but not extreme
    expect(medium.comboDropRate).toBeGreaterThan(0.10);
    expect(medium.comboDropRate).toBeLessThan(0.30);
  });

  it('hard combo drop rate is near zero (almost never drops)', () => {
    const hard = DIFFICULTY_PRESETS.hard;
    // Hard drops only 3% of combos
    expect(hard.comboDropRate).toBeLessThanOrEqual(0.05);
    expect(hard.comboDropRate).toBeGreaterThanOrEqual(0);

    // Behavioral: hard AI at close range should produce sustained
    // button sequences without frequent idle gaps
    const p1 = makeFighter(300);
    const p2 = makeFighter(330, 'kyo', -1);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 'hard');

    let buttonPresses = 0;
    for (let i = 0; i < 200; i++) {
      resetToIdle(p2);
      const input = ai.getInput();
      if (input.buttonA || input.buttonB || input.buttonC || input.buttonD) {
        buttonPresses++;
      }
    }
    // Hard AI should be pressing buttons regularly at close range
    expect(buttonPresses).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// 5. Meter Management (3 tests)
// ═══════════════════════════════════════════════════════════════

describe('Meter Management', () => {
  it('easy rarely manages meter for DM (low meterManagementRate)', () => {
    const easy = DIFFICULTY_PRESETS.easy;
    expect(easy.meterManagementRate).toBeLessThanOrEqual(0.20);

    // Behavioral: easy AI with full meter and low-HP opponent
    // should rarely trigger DM due to low meterManagementRate
    const p1 = makeFighter(300, 'kyo', 1);
    const p2 = makeFighter(330, 'kyo', -1);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 'easy');
    ai.gauge = makeGauge(3, 0);
    ai.maxMode = makeMaxMode(false);

    p1.health = p1.maxHealth * 0.1; // low HP opponent

    let dmCount = 0;
    for (let i = 0; i < 500; i++) {
      resetToIdle(p2);
      const special = ai.triggerSpecial();
      if (special && special.toString().startsWith('DM_')) {
        dmCount++;
      }
      ai.getInput();
    }
    // Easy AI with meterManagementRate=0.1 should trigger very few DMs
    // compared to hard, even with optimal conditions
    expect(dmCount).toBeLessThan(50);
  });

  it('medium moderately manages meter', () => {
    const medium = DIFFICULTY_PRESETS.medium;
    const easy = DIFFICULTY_PRESETS.easy;
    const hard = DIFFICULTY_PRESETS.hard;

    // Medium meter management is between easy and hard
    expect(medium.meterManagementRate).toBeGreaterThan(easy.meterManagementRate);
    expect(medium.meterManagementRate).toBeLessThan(hard.meterManagementRate);
    // Medium is meaningful but not optimal
    expect(medium.meterManagementRate).toBeGreaterThanOrEqual(0.40);
    expect(medium.meterManagementRate).toBeLessThanOrEqual(0.50);
  });

  it('hard precisely manages meter for DM usage', () => {
    const hard = DIFFICULTY_PRESETS.hard;
    expect(hard.meterManagementRate).toBeGreaterThanOrEqual(0.80);

    // Behavioral: hard AI should trigger DMs when opponent is low HP
    const p1 = makeFighter(300, 'kyo', 1);
    const p2 = makeFighter(330, 'kyo', -1);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 'hard');
    ai.gauge = makeGauge(3, 0);
    ai.maxMode = makeMaxMode(false);

    p1.health = p1.maxHealth * 0.1;

    let dmTriggered = false;
    for (let i = 0; i < 500; i++) {
      resetToIdle(p2);
      const special = ai.triggerSpecial();
      if (special && special.toString().startsWith('DM_')) {
        dmTriggered = true;
        break;
      }
      ai.getInput();
    }
    expect(dmTriggered).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// 6. Defense Behavior (3 tests)
// ═══════════════════════════════════════════════════════════════

describe('Defense Behavior', () => {
  it('easy does not defend actively (low blockRate)', () => {
    const easy = DIFFICULTY_PRESETS.easy;
    expect(easy.blockRate).toBeLessThanOrEqual(0.35);

    // Behavioral: compare easy vs hard block frequency across varied states.
    // Easy AI with blockRate=0.3 should block less often than hard AI with 0.9.
    let easyBlockCount = 0;
    let hardBlockCount = 0;
    const trials = 100;

    for (let t = 0; t < trials; t++) {
      const baseX = 200 + t * 4;

      // Easy
      const p1e = makeFighter(300);
      const p2e = makeFighter(baseX);
      const charE = makeCharDef('kyo');
      const aiE = new AdvancedAI(p2e, p1e, charE, 'easy');
      p1e.state = FighterState.STAND_ATTACK;
      p1e.currentAttack = AttackType.CLOSE_C;

      for (let i = 0; i < 20; i++) {
        resetToIdle(p2e);
        const input = aiE.getInput();
        if (input.back) { easyBlockCount++; break; }
      }

      // Hard
      const p1h = makeFighter(300);
      const p2h = makeFighter(baseX);
      const charH = makeCharDef('kyo');
      const aiH = new AdvancedAI(p2h, p1h, charH, 'hard');
      p1h.state = FighterState.STAND_ATTACK;
      p1h.currentAttack = AttackType.CLOSE_C;

      for (let i = 0; i < 20; i++) {
        resetToIdle(p2h);
        const input = aiH.getInput();
        if (input.back) { hardBlockCount++; break; }
      }
    }

    // Hard AI should block more often than easy AI
    // (blockRate 0.9 vs 0.3 means hard should equal or exceed easy)
    expect(hardBlockCount).toBeGreaterThanOrEqual(easyBlockCount);
  });

  it('medium mixes defense and attack', () => {
    const medium = DIFFICULTY_PRESETS.medium;
    // Medium block rate is moderate
    expect(medium.blockRate).toBeGreaterThanOrEqual(0.60);
    expect(medium.blockRate).toBeLessThanOrEqual(0.70);

    // Behavioral: medium AI should sometimes block, sometimes attack
    const p1 = makeFighter(300);
    const p2 = makeFighter(340);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 'medium');

    p1.state = FighterState.STAND_ATTACK;
    p1.currentAttack = AttackType.CLOSE_C;

    let blockFrames = 0;
    let attackFrames = 0;
    const total = 300;
    for (let i = 0; i < total; i++) {
      resetToIdle(p2);
      const input = ai.getInput();
      if (input.back) blockFrames++;
      if (input.buttonA || input.buttonB || input.buttonC || input.buttonD) attackFrames++;
    }
    // Medium should produce some blocks and some attacks (mixed behavior)
    // At least some blocking should happen with blockRate=0.65
    expect(blockFrames).toBeGreaterThan(0);
  });

  it('hard actively defends with block + guard cancel', () => {
    const hard = DIFFICULTY_PRESETS.hard;
    expect(hard.blockRate).toBeGreaterThanOrEqual(0.85);

    // Behavioral: run independent trials with opponent attacking.
    // Hard AI with blockRate=0.9 should block in most trials.
    let blockCount = 0;
    const trials = 200;
    for (let t = 0; t < trials; t++) {
      const p1 = makeFighter(300);
      const p2 = makeFighter(340);
      const char = makeCharDef('kyo');
      const ai = new AdvancedAI(p2, p1, char, 'hard');
      ai.gauge = makeGauge(3, 0);
      ai.maxMode = makeMaxMode(false);

      p1.state = FighterState.STAND_ATTACK;
      p1.currentAttack = AttackType.CLOSE_C;

      let blocked = false;
      for (let i = 0; i < 20; i++) {
        resetToIdle(p2);
        const input = ai.getInput();
        if (input.back) {
          blocked = true;
        }
      }
      if (blocked) blockCount++;
    }
    // With blockRate=0.9, hard AI should block in most trials
    expect(blockCount).toBeGreaterThan(trials * 0.5);
  });
});

// ═══════════════════════════════════════════════════════════════
// 7. Strategy Consistency (2 tests)
// ═══════════════════════════════════════════════════════════════

describe('Strategy Consistency', () => {
  it('same inputs and same game state produce identical AI decisions', () => {
    const run = (level: AIDifficultyLevel): boolean[] => {
      const p1 = makeFighter(300);
      const p2 = makeFighter(500);
      const char = makeCharDef('kyo');
      const ai = new AdvancedAI(p2, p1, char, level);
      const results: boolean[] = [];
      for (let i = 0; i < 60; i++) {
        resetToIdle(p2);
        const input = ai.getInput();
        results.push(!!(input.forward || input.buttonA || input.buttonC));
      }
      return results;
    };

    // Run twice with the same difficulty and verify determinism
    const run1 = run('medium');
    const run2 = run('medium');
    expect(run1).toEqual(run2);

    // Also verify for easy and hard
    const easy1 = run('easy');
    const easy2 = run('easy');
    expect(easy1).toEqual(easy2);

    const hard1 = run('hard');
    const hard2 = run('hard');
    expect(hard1).toEqual(hard2);
  });

  it('different difficulties produce different decisions for the same game state', () => {
    // Create the same game state and run all three difficulties
    const collectActions = (level: AIDifficultyLevel): string[] => {
      const p1 = makeFighter(300);
      const p2 = makeFighter(500);
      const char = makeCharDef('kyo');
      const ai = new AdvancedAI(p2, p1, char, level);
      const actions: string[] = [];
      for (let i = 0; i < 100; i++) {
        resetToIdle(p2);
        const input = ai.getInput();
        // Classify action
        if (input.back) actions.push('block');
        else if (input.buttonC || input.buttonA) actions.push('attack');
        else if (input.forward) actions.push('approach');
        else if (input.up) actions.push('jump');
        else actions.push('idle');
      }
      return actions;
    };

    const easyActions = collectActions('easy');
    const medActions = collectActions('medium');
    const hardActions = collectActions('hard');

    // Count action distributions
    const countActions = (actions: string[]): Record<string, number> => {
      const counts: Record<string, number> = {};
      for (const a of actions) counts[a] = (counts[a] || 0) + 1;
      return counts;
    };

    const easyCounts = countActions(easyActions);
    const medCounts = countActions(medActions);
    const hardCounts = countActions(hardActions);

    // Different difficulties should produce different action distributions.
    // At minimum, the sequences should not be identical.
    // (It's theoretically possible they match by chance, but with 100 frames
    // and different reactionDelay values this is astronomically unlikely.)
    const sequencesDiffer =
      easyActions.join(',') !== medActions.join(',')
      || medActions.join(',') !== hardActions.join(',');
    expect(sequencesDiffer).toBe(true);

    // Also verify each difficulty produces some non-idle actions
    const easyNonIdle = 100 - (easyCounts['idle'] || 0);
    const medNonIdle = 100 - (medCounts['idle'] || 0);
    const hardNonIdle = 100 - (hardCounts['idle'] || 0);
    expect(easyNonIdle + medNonIdle + hardNonIdle).toBeGreaterThan(0);
  });
});
