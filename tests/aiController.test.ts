/**
 * Tests for AIController — situation-aware AI decision system.
 */
import { describe, it, expect } from 'vitest';
import {
  AIController,
  aiDecisionToInput,
  createFighterSnapshot,
} from '../src/core/aiController.js';
import type { FighterSnapshot, AIDecision } from '../src/core/aiController.js';
import { FighterState, AttackType } from '../src/core/types.js';
import type { Direction } from '../src/core/types.js';

// ─── Test helpers ───

function makeSnapshot(overrides: Partial<FighterSnapshot> = {}): FighterSnapshot {
  return {
    x: 300,
    y: 450,
    health: 1000,
    maxHealth: 1000,
    state: FighterState.IDLE,
    facing: 1 as Direction,
    currentAttack: null,
    attackPhase: 'none',
    attackFrame: 0,
    hasHit: false,
    canAct: true,
    isGrounded: true,
    stunTimer: 0,
    inHitstun: false,
    inBlock: false,
    knockdownTimer: 0,
    ...overrides,
  };
}

/** Run update() many times and collect decisions. */
function collectDecisions(
  ai: AIController,
  self: FighterSnapshot,
  opp: FighterSnapshot,
  dist: number,
  count: number,
): AIDecision[] {
  const results: AIDecision[] = [];
  for (let i = 0; i < count; i++) {
    results.push(ai.update(self, opp, dist));
  }
  return results;
}

// ─── Tests ───

describe('AIController', () => {
  it('decides to approach at far range', () => {
    const ai = new AIController(0.5);
    const self = makeSnapshot({ x: 200, canAct: true, state: FighterState.IDLE });
    const opp = makeSnapshot({ x: 600, state: FighterState.IDLE });

    const decisions = collectDecisions(ai, self, opp, 400, 30);
    const actions = decisions.map(d => d.action);

    // At far range, AI should approach, use projectiles, or jump
    const hasApproach = actions.includes('approach');
    const hasProjectile = actions.some(
      d => d.action === 'special' && (d.attackType === AttackType.RYO_KOOU || d.attackType === AttackType.RYO_KOOU_C)
    );
    const hasJump = actions.includes('jump');

    expect(hasApproach || hasProjectile || hasJump).toBe(true);
  });

  it('decides to attack at close range', () => {
    const ai = new AIController(0.5);
    const self = makeSnapshot({ x: 300, canAct: true, state: FighterState.IDLE });
    const opp = makeSnapshot({ x: 340, state: FighterState.IDLE });

    const decisions = collectDecisions(ai, self, opp, 40, 30);
    const actions = decisions.map(d => d.action);

    // At close range, AI should attack, throw, or use specials
    const hasAttack = actions.includes('attack');
    const hasThrow = actions.some(
      d => d.attackType === AttackType.THROW_FORWARD
    );
    const hasSpecial = actions.includes('special');

    expect(hasAttack || hasThrow || hasSpecial).toBe(true);
  });

  it('difficulty affects reaction time', () => {
    const easyAI = new AIController(0.2);
    const hardAI = new AIController(0.9);

    const easyPreset = easyAI.getDifficultyPreset();
    const hardPreset = hardAI.getDifficultyPreset();

    // Easy should have longer reaction delay than hard
    expect(easyPreset.reactionDelay).toBeGreaterThan(hardPreset.reactionDelay);

    // Easy should have lower block rate than hard
    expect(easyPreset.blockRate).toBeLessThan(hardPreset.blockRate);

    // Easy should have lower anti-air rate than hard
    expect(easyPreset.antiAirRate).toBeLessThan(hardPreset.antiAirRate);
  });

  it('blocks when opponent attacks at close range (medium+ difficulty)', () => {
    const ai = new AIController(0.8); // high difficulty for reliable blocking
    const self = makeSnapshot({ x: 300, canAct: true, state: FighterState.IDLE });
    const opp = makeSnapshot({
      x: 340,
      state: FighterState.STAND_ATTACK,
      attackPhase: 'active',
      currentAttack: AttackType.STAND_C,
    });

    const decisions = collectDecisions(ai, self, opp, 40, 20);
    const blockCount = decisions.filter(d => d.action === 'block').length;

    // At high difficulty, AI should block a significant portion of the time
    expect(blockCount).toBeGreaterThan(5);
  });

  it('punishes recovery frames', () => {
    const ai = new AIController(0.7);
    const self = makeSnapshot({ x: 300, canAct: true, state: FighterState.IDLE });
    const opp = makeSnapshot({
      x: 340,
      state: FighterState.STAND_ATTACK,
      attackPhase: 'recovery',
      currentAttack: AttackType.STAND_C,
      hasHit: false,
      attackFrame: 5,
    });

    const decisions = collectDecisions(ai, self, opp, 40, 15);
    const punishActions = decisions.filter(d =>
      d.action === 'attack' || d.action === 'special'
    );

    // AI should attempt to punish recovery at this difficulty
    expect(punishActions.length).toBeGreaterThan(3);
  });

  it('uses anti-air when opponent jumps at mid range', () => {
    const ai = new AIController(0.8);
    const self = makeSnapshot({ x: 300, canAct: true, state: FighterState.IDLE });
    const opp = makeSnapshot({
      x: 400,
      state: FighterState.JUMP,
      y: 200, // airborne
    });

    const decisions = collectDecisions(ai, self, opp, 100, 20);
    const antiAir = decisions.filter(d =>
      d.action === 'special' && d.attackType === AttackType.RYO_KO_HOU_C
    );

    // At high difficulty, should anti-air frequently
    expect(antiAir.length).toBeGreaterThan(5);
  });

  it('easy AI does not block reliably', () => {
    const ai = new AIController(0.15);
    const self = makeSnapshot({ x: 300, canAct: true, state: FighterState.IDLE });
    const opp = makeSnapshot({
      x: 340,
      state: FighterState.STAND_ATTACK,
      attackPhase: 'active',
      currentAttack: AttackType.STAND_C,
    });

    const decisions = collectDecisions(ai, self, opp, 40, 20);
    const blockCount = decisions.filter(d => d.action === 'block').length;

    // Easy AI should block rarely
    expect(blockCount).toBeLessThan(12);
  });

  it('uses projectile at far range', () => {
    const ai = new AIController(0.6);
    const self = makeSnapshot({ x: 150, canAct: true, state: FighterState.IDLE });
    const opp = makeSnapshot({ x: 600, state: FighterState.IDLE });

    const decisions = collectDecisions(ai, self, opp, 450, 40);
    const hasKoou = decisions.some(d =>
      d.action === 'special' &&
      (d.attackType === AttackType.RYO_KOOU || d.attackType === AttackType.RYO_KOOU_C)
    );

    expect(hasKoou).toBe(true);
  });

  it('attempts wake-up reversal on knockdown', () => {
    const ai = new AIController(0.8);
    const self = makeSnapshot({
      x: 300,
      state: FighterState.KNOCKDOWN,
      knockdownTimer: 3,
      canAct: false,
    });
    const opp = makeSnapshot({ x: 340, state: FighterState.IDLE });

    // Run many updates to account for RNG
    let reversalCount = 0;
    for (let i = 0; i < 50; i++) {
      const freshAI = new AIController(0.9);
      const dec = freshAI.update(
        makeSnapshot({ state: FighterState.KNOCKDOWN, knockdownTimer: 3, canAct: false }),
        opp,
        40,
      );
      if (dec.action === 'special' && dec.attackType === AttackType.RYO_KO_HOU_C) {
        reversalCount++;
      }
    }

    // Should attempt reversal at least sometimes at high difficulty
    expect(reversalCount).toBeGreaterThan(5);
  });

  it('combo execution works for medium combo', () => {
    const ai = new AIController(0.7);
    const self = makeSnapshot({ x: 300, canAct: true, state: FighterState.IDLE });
    const opp = makeSnapshot({
      x: 340,
      state: FighterState.STAND_ATTACK,
      attackPhase: 'recovery',
      currentAttack: AttackType.STAND_C,
      hasHit: false,
      attackFrame: 10,
    });

    // Collect enough decisions for a combo to start
    const decisions: AIDecision[] = [];
    for (let i = 0; i < 15; i++) {
      const dec = ai.update(self, opp, 40);
      decisions.push(dec);
    }

    // Check that at least one attack was initiated
    const attackDecisions = decisions.filter(d => d.action === 'attack' || d.action === 'special');
    expect(attackDecisions.length).toBeGreaterThan(0);
  });

  it('resets state properly', () => {
    const ai = new AIController(0.5);
    const self = makeSnapshot({ canAct: true });
    const opp = makeSnapshot({ x: 340 });

    // Run some decisions
    for (let i = 0; i < 10; i++) {
      ai.update(self, opp, 40);
    }

    // Reset
    ai.reset();

    // Should be able to make fresh decisions
    const decision = ai.update(self, opp, 40);
    expect(decision).toBeDefined();
    expect(decision.action).toBeDefined();
  });

  it('default decision is idle with urgency 0', () => {
    const ai = new AIController(0.5);
    // Can't act => default idle
    const self = makeSnapshot({
      canAct: false,
      state: FighterState.HITSTUN,
      inHitstun: true,
      stunTimer: 10,
    });
    const opp = makeSnapshot({ x: 340 });

    const decision = ai.update(self, opp, 40);
    expect(decision.action).toBe('idle');
    expect(decision.urgency).toBe(0);
  });

  it('more aggressive when opponent is in corner', () => {
    const ai = new AIController(0.7);
    const self = makeSnapshot({ x: 600, canAct: true, state: FighterState.IDLE });
    // Opponent in corner (right side)
    const opp = makeSnapshot({ x: 1350, state: FighterState.IDLE });

    const decisions = collectDecisions(ai, self, opp, 40, 25);
    const attackCount = decisions.filter(d =>
      d.action === 'attack' || d.action === 'special'
    ).length;

    // Should be aggressive when opponent is cornered
    expect(attackCount).toBeGreaterThan(5);
  });

  it('tries to escape when self is in corner', () => {
    const ai = new AIController(0.7);
    // Self in corner (left side)
    const self = makeSnapshot({ x: 50, canAct: true, state: FighterState.IDLE });
    const opp = makeSnapshot({ x: 180, state: FighterState.IDLE });

    const decisions = collectDecisions(ai, self, opp, 130, 25);
    const escapeActions = decisions.filter(d =>
      d.action === 'block' || d.action === 'jump' ||
      (d.action === 'special' && d.attackType === AttackType.RYO_KO_HOU)
    );

    // Should attempt escape when cornered
    expect(escapeActions.length).toBeGreaterThan(3);
  });
});

describe('aiDecisionToInput', () => {
  it('approach produces forward input', () => {
    const input = aiDecisionToInput({ action: 'approach', urgency: 0.5 }, 1, 100);
    expect(input.forward).toBe(true);
    expect(input.back).toBe(false);
  });

  it('retreat produces back input', () => {
    const input = aiDecisionToInput({ action: 'retreat', urgency: 0.5 }, 1, 100);
    expect(input.back).toBe(true);
    expect(input.forward).toBe(false);
  });

  it('jump produces up+forward input', () => {
    const input = aiDecisionToInput({ action: 'jump', urgency: 0.5 }, 1, 100);
    expect(input.up).toBe(true);
    expect(input.forward).toBe(true);
  });

  it('block produces back input', () => {
    const input = aiDecisionToInput({ action: 'block', urgency: 0.5 }, 1, 100);
    expect(input.back).toBe(true);
  });

  it('block crouches at close range', () => {
    const input = aiDecisionToInput({ action: 'block', urgency: 0.5 }, 1, 60);
    expect(input.back).toBe(true);
    expect(input.down).toBe(true);
  });

  it('attack with CLOSE_C presses C button', () => {
    const input = aiDecisionToInput(
      { action: 'attack', attackType: AttackType.CLOSE_C, urgency: 0.7 },
      1, 50
    );
    expect(input.buttonC).toBe(true);
    expect(input.buttonCPressed).toBe(true);
    expect(input.punchPressed).toBe(true);
  });

  it('attack with THROW_FORWARD presses throw', () => {
    const input = aiDecisionToInput(
      { action: 'attack', attackType: AttackType.THROW_FORWARD, urgency: 0.7 },
      1, 50
    );
    expect(input.throwAttack).toBe(true);
    expect(input.throwAttackPressed).toBe(true);
    expect(input.forward).toBe(true);
  });

  it('special RYO_KOOU produces down+A input', () => {
    const input = aiDecisionToInput(
      { action: 'special', attackType: AttackType.RYO_KOOU, urgency: 0.5 },
      1, 200
    );
    expect(input.down).toBe(true);
    expect(input.buttonA).toBe(true);
    expect(input.buttonAPressed).toBe(true);
  });

  it('special RYO_KO_HOU_C produces forward+down+C input (DP motion)', () => {
    const input = aiDecisionToInput(
      { action: 'special', attackType: AttackType.RYO_KO_HOU_C, urgency: 0.8 },
      1, 150
    );
    expect(input.forward).toBe(true);
    expect(input.down).toBe(true);
    expect(input.buttonC).toBe(true);
    expect(input.buttonCPressed).toBe(true);
  });

  it('special RYO_HIEN produces back+down+D input', () => {
    const input = aiDecisionToInput(
      { action: 'special', attackType: AttackType.RYO_HIEN, urgency: 0.6 },
      1, 150
    );
    expect(input.back).toBe(true);
    expect(input.down).toBe(true);
    expect(input.buttonD).toBe(true);
    expect(input.buttonDPressed).toBe(true);
  });

  it('super DM_TEN_HA_OU produces down+C input', () => {
    const input = aiDecisionToInput(
      { action: 'super', attackType: AttackType.DM_TEN_HA_OU, urgency: 0.9 },
      1, 200
    );
    expect(input.down).toBe(true);
    expect(input.buttonC).toBe(true);
    expect(input.buttonCPressed).toBe(true);
  });

  it('idle produces no inputs', () => {
    const input = aiDecisionToInput({ action: 'idle', urgency: 0 }, 1, 100);
    expect(input.up).toBe(false);
    expect(input.down).toBe(false);
    expect(input.forward).toBe(false);
    expect(input.back).toBe(false);
    expect(input.buttonA).toBe(false);
    expect(input.buttonB).toBe(false);
    expect(input.buttonC).toBe(false);
    expect(input.buttonD).toBe(false);
    expect(input.throwAttack).toBe(false);
  });
});

describe('difficulty scaling', () => {
  it('easy AI has low stats across the board', () => {
    const ai = new AIController(0.0); // minimum difficulty
    const preset = ai.getDifficultyPreset();

    expect(preset.reactionDelay).toBeGreaterThan(10);
    expect(preset.blockRate).toBeLessThan(0.3);
    expect(preset.antiAirRate).toBeLessThan(0.2);
    expect(preset.comboDropRate).toBeGreaterThan(0.3);
  });

  it('very hard AI has near-perfect stats', () => {
    const ai = new AIController(1.0);
    const preset = ai.getDifficultyPreset();

    expect(preset.reactionDelay).toBeLessThanOrEqual(2);
    expect(preset.blockRate).toBeGreaterThan(0.9);
    expect(preset.antiAirRate).toBeGreaterThan(0.9);
    expect(preset.comboDropRate).toBe(0);
  });

  it('difficulty scales linearly between easy and very hard', () => {
    const easy = new AIController(0.0).getDifficultyPreset();
    const mid = new AIController(0.5).getDifficultyPreset();
    const hard = new AIController(1.0).getDifficultyPreset();

    // Block rate should increase with difficulty
    expect(easy.blockRate).toBeLessThan(mid.blockRate);
    expect(mid.blockRate).toBeLessThan(hard.blockRate);

    // Reaction delay should decrease with difficulty
    expect(easy.reactionDelay).toBeGreaterThan(mid.reactionDelay);
    expect(mid.reactionDelay).toBeGreaterThan(hard.reactionDelay);
  });
});

// ═══ Multi-Character AI ═══

describe('AIController multi-character movesets', () => {
  const characters = ['ryo', 'kyo', 'iori'] as const;
  const expectedDPs: Record<string, AttackType[]> = {
    ryo: [AttackType.RYO_KO_HOU, AttackType.RYO_KO_HOU_C],
    kyo: [AttackType.KYO_ONIYAKI, AttackType.KYO_ONIYAKI_C],
    iori: [AttackType.IORI_ONIYAKI, AttackType.IORI_ONIYAKI_C],
  };
  const expectedProjectiles: Record<string, AttackType[]> = {
    ryo: [AttackType.RYO_KOOU, AttackType.RYO_KOOU_C],
    kyo: [AttackType.KYO_YAMIBARAI, AttackType.KYO_YAMIBARAI_C],
    iori: [AttackType.IORI_YAMIBARAI, AttackType.IORI_YAMIBARAI_C],
  };

  for (const char of characters) {
    describe(`${char} AI`, () => {
      it('uses character-specific DP for anti-air', () => {
        const ai = new AIController(0.95, char);
        const self = makeSnapshot({ x: 400, canAct: true, state: FighterState.IDLE });
        const opp = makeSnapshot({ x: 350, state: FighterState.AIR_ATTACK, y: 200 });

        const decisions = collectDecisions(ai, self, opp, 100, 50);
        const dpDecisions = decisions.filter(
          (d) => d.attackType && expectedDPs[char].includes(d.attackType),
        );
        expect(dpDecisions.length).toBeGreaterThan(0);
      });

      it('uses character-specific projectile at far range', () => {
        const ai = new AIController(0.95, char);
        const self = makeSnapshot({ x: 200, canAct: true, state: FighterState.IDLE });
        const opp = makeSnapshot({ x: 600, state: FighterState.IDLE });

        const decisions = collectDecisions(ai, self, opp, 400, 50);
        const projDecisions = decisions.filter(
          (d) => d.attackType && expectedProjectiles[char].includes(d.attackType),
        );
        expect(projDecisions.length).toBeGreaterThan(0);
      });

      it('uses character-specific DP for wake-up reversal', () => {
        const ai = new AIController(0.95, char);
        const self = makeSnapshot({
          x: 400, canAct: false, state: FighterState.KNOCKDOWN, knockdownTimer: 3,
        });
        const opp = makeSnapshot({ x: 350, state: FighterState.IDLE });

        const decisions = collectDecisions(ai, self, opp, 50, 20);
        const reversalDecisions = decisions.filter(
          (d) => d.attackType && expectedDPs[char].includes(d.attackType),
        );
        expect(reversalDecisions.length).toBeGreaterThan(0);
      });
    });
  }

  it('unknown character falls back to ryo moveset', () => {
    const ai = new AIController(0.95, 'unknown');
    const self = makeSnapshot({ x: 200, canAct: true, state: FighterState.IDLE });
    const opp = makeSnapshot({ x: 600, state: FighterState.IDLE });

    const decisions = collectDecisions(ai, self, opp, 400, 50);
    const ryoProjDecisions = decisions.filter(
      (d) => d.attackType === AttackType.RYO_KOOU_C,
    );
    expect(ryoProjDecisions.length).toBeGreaterThan(0);
  });
});

describe('AI input routing for all characters', () => {
  it('Kyo special input generates correct button presses', () => {
    const input = aiDecisionToInput(
      { action: 'special', attackType: AttackType.KYO_ONIYAKI_C, urgency: 0.8 },
      1 as Direction,
      100,
    );
    expect(input.forward).toBe(true);
    expect(input.down).toBe(true);
    expect(input.buttonC).toBe(true);
    expect(input.punchPressed).toBe(true);
  });

  it('Iori special input generates correct button presses', () => {
    const input = aiDecisionToInput(
      { action: 'special', attackType: AttackType.IORI_AOIHANA, urgency: 0.7 },
      1 as Direction,
      100,
    );
    expect(input.back).toBe(true);
    expect(input.down).toBe(true);
    expect(input.buttonA).toBe(true);
    expect(input.punchPressed).toBe(true);
  });

  it('Iori KUZUKAZE grab generates correct input', () => {
    const input = aiDecisionToInput(
      { action: 'special', attackType: AttackType.IORI_KUZUKAZE, urgency: 0.8 },
      1 as Direction,
      50,
    );
    expect(input.down).toBe(true);
    expect(input.buttonC).toBe(true);
    expect(input.punchPressed).toBe(true);
  });

  it('Kyo super input generates correct button presses', () => {
    const input = aiDecisionToInput(
      { action: 'super', attackType: AttackType.SDM_OROCHINAGI, urgency: 0.9 },
      1 as Direction,
      150,
    );
    expect(input.down).toBe(true);
    expect(input.buttonC).toBe(true);
    expect(input.punchPressed).toBe(true);
  });

  it('Iori HSDM input generates correct button presses', () => {
    const input = aiDecisionToInput(
      { action: 'super', attackType: AttackType.HSDM_YAOTOME, urgency: 1.0 },
      1 as Direction,
      80,
    );
    expect(input.down).toBe(true);
    expect(input.buttonC).toBe(true);
    expect(input.punchPressed).toBe(true);
  });
});
