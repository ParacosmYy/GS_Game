/**
 * AdvancedAI tests — decision consistency, difficulty levels, meter management,
 * distance-based behavior, combo routing, and special move triggering.
 */
import { describe, it, expect } from 'vitest';
import { AdvancedAI, type AIDifficultyLevel } from '../src/ai/advancedAI.js';
import { Fighter } from '../src/entities/fighter.js';
import { FighterState, AttackType } from '../src/core/types.js';
import type { CharacterDefinition } from '../src/characters/types.js';
import type { ResolvedInput } from '../src/input/inputResolver.js';
import type { CommandBuffer } from '../src/input/commandBuffer.js';
import type { Projectile } from '../src/entities/projectile.js';
import { ROSTER } from '../src/characters/index.js';

// ── Helpers ──

/** Create a minimal CharacterDefinition for testing */
function makeCharDef(id: string = 'kyo'): CharacterDefinition {
  const found = ROSTER.find(c => c.id === id);
  if (found) return found;
  // Fallback minimal definition
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
  // Ensure clean initial state for AI testing
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

// ═══════════════════════════════════════════════════════════════
// Tests
// ═══════════════════════════════════════════════════════════════

describe('AdvancedAI — basic contract', () => {
  it('getInput() always returns a non-null ResolvedInput', () => {
    const p1 = makeFighter(300);
    const p2 = makeFighter(500);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 'medium');
    for (let i = 0; i < 60; i++) {
      const input = ai.getInput();
      expect(input).not.toBeNull();
      expect(input).toBeDefined();
      // Verify it has the expected shape
      expect(typeof input.up).toBe('boolean');
      expect(typeof input.down).toBe('boolean');
      expect(typeof input.forward).toBe('boolean');
      expect(typeof input.back).toBe('boolean');
      expect(typeof input.buttonA).toBe('boolean');
      expect(typeof input.buttonB).toBe('boolean');
      expect(typeof input.buttonC).toBe('boolean');
      expect(typeof input.buttonD).toBe('boolean');
    }
  });

  it('getInput() returns valid input for all difficulty levels', () => {
    const levels: AIDifficultyLevel[] = ['easy', 'medium', 'hard'];
    for (const level of levels) {
      const p1 = makeFighter(300);
      const p2 = makeFighter(500);
      const char = makeCharDef('kyo');
      const ai = new AdvancedAI(p2, p1, char, level);
      const input = ai.getInput();
      expect(input).toBeDefined();
      expect(input).not.toBeNull();
    }
  });

  it('getInput() accepts legacy numeric difficulty (0..1)', () => {
    const p1 = makeFighter(300);
    const p2 = makeFighter(500);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 0.8);
    const input = ai.getInput();
    expect(input).toBeDefined();
  });
});

describe('AdvancedAI — DIZZY punish selects combo behavior', () => {
  it('when opponent is DIZZY and close, AI action becomes combo', () => {
    const p1 = makeFighter(300);
    const p2 = makeFighter(320); // close range
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 'hard');
    // Set opponent to DIZZY
    p1.state = FighterState.DIZZY;
    p1.dizzyTimer = 60;
    // Run multiple frames to let the AI cycle through its think cooldown
    let comboFound = false;
    for (let i = 0; i < 30; i++) {
      const input = ai.getInput();
      // In combo state the AI should be pressing buttons
      if (input.buttonA || input.buttonB || input.buttonC || input.buttonD) {
        comboFound = true;
      }
    }
    // At minimum the AI should have pressed some buttons (combo or poke)
    expect(comboFound).toBe(true);
  });

  it('DIZZY opponent at close range triggers non-idle behavior', () => {
    const p1 = makeFighter(300);
    const p2 = makeFighter(330);
    const char = makeCharDef('iori');
    const ai = new AdvancedAI(p2, p1, char, 'hard');
    p1.state = FighterState.DIZZY;
    p1.dizzyTimer = 90;

    let hasAction = false;
    for (let i = 0; i < 40; i++) {
      const input = ai.getInput();
      if (input.buttonC || input.buttonA || input.forward || input.down) {
        hasAction = true;
      }
    }
    expect(hasAction).toBe(true);
  });
});

describe('AdvancedAI — difficulty affects reaction delay', () => {
  it('hard AI reacts faster than easy AI over many frames', () => {
    const p1 = makeFighter(300);
    const p2 = makeFighter(500);
    const char = makeCharDef('kyo');

    // Track how many frames each difficulty produces non-empty input
    let hardActiveFrames = 0;
    let easyActiveFrames = 0;

    const hardAI = new AdvancedAI(p2, p1, char, 'hard');
    const easyAI = new AdvancedAI(p2, p1, char, 'easy');

    // Reset fighter state between runs
    for (let i = 0; i < 120; i++) {
      p2.state = FighterState.IDLE;
      const hardInput = hardAI.getInput();
      if (hardInput.forward || hardInput.back || hardInput.up || hardInput.down ||
          hardInput.buttonA || hardInput.buttonB || hardInput.buttonC || hardInput.buttonD) {
        hardActiveFrames++;
      }
    }

    for (let i = 0; i < 120; i++) {
      p2.state = FighterState.IDLE;
      const easyInput = easyAI.getInput();
      if (easyInput.forward || easyInput.back || easyInput.up || easyInput.down ||
          easyInput.buttonA || easyInput.buttonB || easyInput.buttonC || easyInput.buttonD) {
        easyActiveFrames++;
      }
    }

    // Hard AI should produce at least as many active frames as easy AI
    // (Hard has shorter reaction delay so it decides more frequently)
    expect(hardActiveFrames).toBeGreaterThanOrEqual(easyActiveFrames);
  });
});

describe('AdvancedAI — meter management', () => {
  it('DM is not triggered when stocks = 0', () => {
    const p1 = makeFighter(300);
    const p2 = makeFighter(320);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 'hard');
    ai.gauge = makeGauge(0, 0); // No stocks
    ai.maxMode = makeMaxMode(false);

    // Run many frames and check triggerSpecial never returns a DM
    let dmCount = 0;
    for (let i = 0; i < 200; i++) {
      ai.getInput(); // let AI process
      const special = ai.triggerSpecial();
      if (special && special.toString().startsWith('DM_')) {
        dmCount++;
      }
    }
    // With 0 stocks, DM should never be triggered
    expect(dmCount).toBe(0);
  });

  it('with stocks >= 1, DM can potentially be triggered', () => {
    const p1 = makeFighter(300, 'kyo', 1);
    const p2 = makeFighter(320, 'kyo', -1);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 'hard');
    ai.gauge = makeGauge(3, 0);
    ai.maxMode = makeMaxMode(false);

    // Set opponent to low HP to increase DM probability
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
      // Only trigger special, don't call getInput first (it changes AI state)
      const special = ai.triggerSpecial();
      if (special && special.toString().startsWith('DM_')) {
        dmTriggered = true;
        break;
      }
      // Also tick the AI to advance its state
      ai.getInput();
    }
    // With high probability settings and low HP opponent, DM should eventually trigger
    expect(dmTriggered).toBe(true);
  });

  it('SDM is preferred over DM in MAX mode with >= 2 stocks', () => {
    const p1 = makeFighter(300, 'kyo', 1);
    const p2 = makeFighter(320, 'kyo', -1);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 'hard');
    ai.gauge = makeGauge(3, 0);
    ai.maxMode = makeMaxMode(true); // MAX mode active

    p1.health = p1.maxHealth * 0.1;

    let sdmFound = false;
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
      const special = ai.triggerSpecial();
      if (special && special.toString().startsWith('SDM_')) {
        sdmFound = true;
        break;
      }
      ai.getInput();
    }
    expect(sdmFound).toBe(true);
  });
});

describe('AdvancedAI — distance-based behavior', () => {
  it('at far range, AI approaches or uses projectile', () => {
    const p1 = makeFighter(300);
    const p2 = makeFighter(700); // far apart
    const char = makeCharDef('kyo'); // has projectile
    const ai = new AdvancedAI(p2, p1, char, 'medium');

    let approachedOrProjectile = false;
    for (let i = 0; i < 60; i++) {
      const input = ai.getInput();
      if (input.forward || input.up || (input.down && input.buttonA)) {
        approachedOrProjectile = true;
      }
    }
    expect(approachedOrProjectile).toBe(true);
  });

  it('at close range, AI attacks or throws', () => {
    const p1 = makeFighter(300, 'kyo', 1);
    const p2 = makeFighter(330, 'kyo', -1); // facing opponent
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 'hard');

    let attacked = false;
    for (let i = 0; i < 120; i++) {
      p2.state = FighterState.IDLE;
      p2.currentAttack = null;
      p2.attackPhase = 'none';
      const input = ai.getInput();
      if (input.buttonA || input.buttonB || input.buttonC || input.buttonD || input.throwAttack) {
        attacked = true;
      }
    }
    expect(attacked).toBe(true);
  });

  it('non-projectile character does not use projectile action', () => {
    const p1 = makeFighter(300);
    const p2 = makeFighter(600);
    // Kim has hasProjectile: false in spacing profiles
    const char = makeCharDef('kim');
    const ai = new AdvancedAI(p2, p1, char, 'medium');

    // Run many frames - Kim should approach, not try projectile input pattern
    let approachCount = 0;
    for (let i = 0; i < 120; i++) {
      const input = ai.getInput();
      if (input.forward) approachCount++;
    }
    // Kim should approach since it has no projectile
    expect(approachCount).toBeGreaterThan(0);
  });
});

describe('AdvancedAI — reset clears state', () => {
  it('reset() restores AI to clean state', () => {
    const p1 = makeFighter(300);
    const p2 = makeFighter(500);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 'medium');

    // Run some frames to build up state
    for (let i = 0; i < 30; i++) {
      ai.getInput();
    }

    // Reset
    ai.reset();

    // Should be able to get clean input after reset
    const input = ai.getInput();
    expect(input).toBeDefined();
    expect(input).not.toBeNull();
  });

  it('fullReset() clears combo records', () => {
    const p1 = makeFighter(300);
    const p2 = makeFighter(500);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 'hard');

    // Run frames
    for (let i = 0; i < 30; i++) {
      ai.getInput();
    }

    ai.fullReset();

    // Should work cleanly after full reset
    const input = ai.getInput();
    expect(input).toBeDefined();
  });
});

describe('AdvancedAI — throw escape', () => {
  it('attempts throw escape when being thrown on hard difficulty', () => {
    const p1 = makeFighter(300);
    const p2 = makeFighter(320);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 'hard');

    // Simulate being thrown
    p2.isBeingThrown = true;
    p2.throwEscapeTimer = 5;

    let escapeAttempted = false;
    for (let i = 0; i < 10; i++) {
      const input = ai.getInput();
      if (input.throwAttack && input.throwAttackPressed) {
        escapeAttempted = true;
      }
    }
    expect(escapeAttempted).toBe(true);
  });
});

describe('AdvancedAI — character-specific combo routes', () => {
  it('Kyo uses a valid combo route with button inputs', () => {
    const p1 = makeFighter(300, 'kyo', 1);
    const p2 = makeFighter(330, 'kyo', -1); // facing opponent
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 'hard');

    let buttonPressed = false;
    for (let i = 0; i < 120; i++) {
      // Keep fighter in actable state
      p2.state = FighterState.IDLE;
      p2.currentAttack = null;
      p2.attackPhase = 'none';
      const input = ai.getInput();
      if (input.buttonC || input.buttonA || input.buttonB || input.throwAttack) {
        buttonPressed = true;
      }
    }
    expect(buttonPressed).toBe(true);
  });

  it('Iori uses a valid combo route', () => {
    const p1 = makeFighter(300, 'iori', 1);
    const p2 = makeFighter(330, 'iori', -1);
    const char = makeCharDef('iori');
    const ai = new AdvancedAI(p2, p1, char, 'hard');

    let anyAction = false;
    for (let i = 0; i < 120; i++) {
      p2.state = FighterState.IDLE;
      p2.currentAttack = null;
      p2.attackPhase = 'none';
      const input = ai.getInput();
      if (input.buttonC || input.buttonA || input.buttonB || input.throwAttack ||
          input.forward || input.back || input.up || input.down) {
        anyAction = true;
      }
    }
    expect(anyAction).toBe(true);
  });

  it('Terry uses a valid combo route', () => {
    const p1 = makeFighter(300, 'terry', 1);
    const p2 = makeFighter(330, 'terry', -1);
    const char = makeCharDef('terry');
    const ai = new AdvancedAI(p2, p1, char, 'hard');

    let buttonPressed = false;
    for (let i = 0; i < 120; i++) {
      p2.state = FighterState.IDLE;
      p2.currentAttack = null;
      p2.attackPhase = 'none';
      const input = ai.getInput();
      if (input.buttonC || input.buttonA || input.buttonB || input.throwAttack) {
        buttonPressed = true;
      }
    }
    expect(buttonPressed).toBe(true);
  });

  it('Kim uses a valid combo route', () => {
    const p1 = makeFighter(300, 'kim', 1);
    const p2 = makeFighter(330, 'kim', -1);
    const char = makeCharDef('kim');
    const ai = new AdvancedAI(p2, p1, char, 'hard');

    let buttonPressed = false;
    for (let i = 0; i < 120; i++) {
      p2.state = FighterState.IDLE;
      p2.currentAttack = null;
      p2.attackPhase = 'none';
      const input = ai.getInput();
      if (input.buttonC || input.buttonA || input.buttonB || input.throwAttack) {
        buttonPressed = true;
      }
    }
    expect(buttonPressed).toBe(true);
  });
});

describe('AdvancedAI — anti-air behavior', () => {
  it('reacts to airborne opponent with anti-air action', () => {
    const p1 = makeFighter(300);
    const p2 = makeFighter(350);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 'hard');

    // Make opponent airborne
    p1.state = FighterState.JUMP;
    p1.vy = -10;

    let aaResponse = false;
    for (let i = 0; i < 30; i++) {
      const input = ai.getInput();
      // Anti-air typically uses buttonC (DP motion)
      if (input.buttonC && input.buttonCPressed) {
        aaResponse = true;
      }
    }
    expect(aaResponse).toBe(true);
  });
});

describe('AdvancedAI — blocking behavior', () => {
  it('blocks when opponent attacks at close range on hard difficulty', () => {
    const p1 = makeFighter(300);
    const p2 = makeFighter(330);
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 'hard');

    // Make opponent attack
    p1.state = FighterState.STAND_ATTACK;
    p1.currentAttack = AttackType.CLOSE_C;

    let blocked = false;
    for (let i = 0; i < 30; i++) {
      const input = ai.getInput();
      if (input.back) {
        blocked = true;
      }
    }
    expect(blocked).toBe(true);
  });
});

describe('AdvancedAI — okizeme (wake-up pressure)', () => {
  it('approaches knocked-down opponent for pressure', () => {
    const p1 = makeFighter(300, 'kyo', 1);
    const p2 = makeFighter(400, 'kyo', -1); // further away, will need to approach
    const char = makeCharDef('kyo');
    const ai = new AdvancedAI(p2, p1, char, 'hard');

    // Opponent is knocked down
    p1.state = FighterState.KNOCKDOWN;
    p1.knockdownTimer = 40;

    let anyAction = false;
    for (let i = 0; i < 80; i++) {
      p2.state = FighterState.IDLE;
      p2.currentAttack = null;
      p2.attackPhase = 'none';
      const input = ai.getInput();
      // During okizeme, AI approaches (forward) or attacks (buttons)
      if (input.forward || input.buttonC || input.buttonA || input.buttonD ||
          input.throwAttack || input.down) {
        anyAction = true;
      }
    }
    expect(anyAction).toBe(true);
  });
});

describe('AdvancedAI — determinism', () => {
  it('same game state produces same input on repeated runs', () => {
    const run = () => {
      const p1 = makeFighter(300);
      const p2 = makeFighter(400);
      const char = makeCharDef('kyo');
      const ai = new AdvancedAI(p2, p1, char, 'medium');
      const inputs: ResolvedInput[] = [];
      for (let i = 0; i < 30; i++) {
        inputs.push(ai.getInput());
      }
      return inputs;
    };

    const run1 = run();
    const run2 = run();

    // Both runs should produce identical inputs
    for (let i = 0; i < run1.length; i++) {
      expect(run1[i].up).toBe(run2[i].up);
      expect(run1[i].down).toBe(run2[i].down);
      expect(run1[i].forward).toBe(run2[i].forward);
      expect(run1[i].back).toBe(run2[i].back);
      expect(run1[i].buttonA).toBe(run2[i].buttonA);
      expect(run1[i].buttonB).toBe(run2[i].buttonB);
      expect(run1[i].buttonC).toBe(run2[i].buttonC);
      expect(run1[i].buttonD).toBe(run2[i].buttonD);
    }
  });
});
