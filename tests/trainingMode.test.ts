/**
 * Training Mode Tests
 *
 * Covers: TrainingModeState construction, dummy behavior cycling,
 *   input history recording, frame data display, auto-recover logic,
 *   F-key shortcuts, and reset behavior.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  TrainingModeState,
  DummyBehavior,
  type FrameDataDisplay,
  type InputHistoryEntry,
} from '../src/state/trainingMode.js';
import { Fighter } from '../src/entities/fighter.js';
import { MAX_HEALTH } from '../src/core/constants.js';
import { getHitboxDisplayMode, setHitboxDisplayMode } from '../src/rendering/hitboxDebugMugen.js';

function createFighter(x = 400, facing = 1): Fighter {
  return new Fighter(x, '#ff6600', facing as 1 | -1);
}

function createP2Gauge() {
  return { meter: 0, stocks: 0, maxMeter: 100 };
}

// ===== Construction & Defaults =====
describe('TrainingModeState defaults', () => {
  it('has correct default settings', () => {
    const t = new TrainingModeState();
    expect(t.dummyBehavior).toBe(DummyBehavior.STAND);
    expect(t.autoRecoverHP).toBe(true);
    expect(t.infiniteMeter).toBe(true);
    expect(t.showInputHistory).toBe(true);
    expect(t.showFrameData).toBe(true);
    expect(t.showHitboxes).toBe(false);
    expect(t.inputHistory).toEqual([]);
    expect(t.lastFrameData).toBeNull();
  });
});

// ===== Dummy Behavior Cycling =====
describe('Dummy behavior cycling', () => {
  it('cycles through all behaviors', () => {
    const t = new TrainingModeState();
    const behaviors = Object.values(DummyBehavior);
    // Start at STAND, cycle through all
    for (let i = 1; i < behaviors.length; i++) {
      t.cycleDummyBehavior();
      expect(t.dummyBehavior).toBe(behaviors[i]);
    }
    // One more cycle wraps back to STAND
    t.cycleDummyBehavior();
    expect(t.dummyBehavior).toBe(DummyBehavior.STAND);
  });

  it('getDummyBehaviorLabel returns human-readable string', () => {
    const t = new TrainingModeState();
    expect(t.getDummyBehaviorLabel()).toBe('STAND');
    t.dummyBehavior = DummyBehavior.BLOCK_ALL;
    expect(t.getDummyBehaviorLabel()).toBe('BLOCK ALL');
    t.dummyBehavior = DummyBehavior.CROUCH;
    expect(t.getDummyBehaviorLabel()).toBe('CROUCH');
  });
});

// ===== Input History =====
describe('Input history recording', () => {
  it('records meaningful inputs', () => {
    const t = new TrainingModeState();
    t.recordInput('→', ['A'], 10);
    expect(t.inputHistory.length).toBe(1);
    expect(t.inputHistory[0].direction).toBe('→');
    expect(t.inputHistory[0].buttons).toEqual(['A']);
    expect(t.inputHistory[0].frame).toBe(10);
  });

  it('ignores neutral + no buttons', () => {
    const t = new TrainingModeState();
    t.recordInput('·', [], 10);
    expect(t.inputHistory.length).toBe(0);
  });

  it('keeps only last 20 entries', () => {
    const t = new TrainingModeState();
    for (let i = 0; i < 30; i++) {
      t.recordInput('→', ['A'], i);
    }
    expect(t.inputHistory.length).toBe(20);
    // Oldest entry should be frame 10
    expect(t.inputHistory[0].frame).toBe(10);
    // Newest entry should be frame 29
    expect(t.inputHistory[19].frame).toBe(29);
  });

  it('records multiple buttons', () => {
    const t = new TrainingModeState();
    t.recordInput('↓', ['A', 'B', 'C'], 5);
    expect(t.inputHistory[0].buttons).toEqual(['A', 'B', 'C']);
  });
});

// ===== Frame Data Display =====
describe('Frame data display', () => {
  it('starts with null frame data', () => {
    const t = new TrainingModeState();
    expect(t.lastFrameData).toBeNull();
  });

  it('updates frame data when fighter has an active attack', () => {
    const t = new TrainingModeState();
    const p1 = createFighter();
    // Start a stand A attack
    p1.startAttack('STAND_A' as any);
    t.updateFrameData(p1, 100);
    expect(t.lastFrameData).not.toBeNull();
    expect(t.lastFrameData!.attackName).toBe('STAND_A');
    expect(t.lastFrameData!.phase).toBe('startup');
  });
});

// ===== Auto-Recover Logic =====
describe('Auto-recover HP and meter', () => {
  it('recovers P2 HP after 60-tick delay', () => {
    const t = new TrainingModeState();
    const p2 = createFighter(500);
    const gauge = createP2Gauge();

    p2.health = 500;
    // Simulate P2 being hit at tick 0
    p2.hitstunTimer = 10;
    t.applyAutoRecovery(p2, gauge, 0);
    expect(p2.health).toBe(500); // no recovery during hitstun

    // Advance to tick 59 — still not past delay
    p2.hitstunTimer = 0;
    t.applyAutoRecovery(p2, gauge, 59);
    expect(p2.health).toBe(500); // still waiting

    // Advance to tick 61 — should start recovering
    t.applyAutoRecovery(p2, gauge, 61);
    expect(p2.health).toBeGreaterThan(500);
  });

  it('does not recover when autoRecoverHP is off', () => {
    const t = new TrainingModeState();
    t.autoRecoverHP = false;
    const p2 = createFighter(500);
    const gauge = createP2Gauge();

    p2.health = 500;
    t.applyAutoRecovery(p2, gauge, 200);
    expect(p2.health).toBe(500);
  });

  it('keeps meter at max when infiniteMeter is on', () => {
    const t = new TrainingModeState();
    const p2 = createFighter(500);
    const gauge = createP2Gauge();

    t.applyAutoRecovery(p2, gauge, 0);
    expect(gauge.meter).toBe(100);
    expect(gauge.stocks).toBe(5);
  });

  it('does not touch meter when infiniteMeter is off', () => {
    const t = new TrainingModeState();
    t.infiniteMeter = false;
    const p2 = createFighter(500);
    const gauge = createP2Gauge();

    t.applyAutoRecovery(p2, gauge, 0);
    expect(gauge.meter).toBe(0);
    expect(gauge.stocks).toBe(0);
  });

  it('resets stun gauge immediately when autoRecoverHP is on', () => {
    const t = new TrainingModeState();
    const p2 = createFighter(500);
    const gauge = createP2Gauge();

    p2.stunGauge = 80;
    t.applyAutoRecovery(p2, gauge, 0);
    expect(p2.stunGauge).toBe(0);
  });

  it('does not reset stun during dizzy', () => {
    const t = new TrainingModeState();
    const p2 = createFighter(500);
    const gauge = createP2Gauge();

    p2.stunGauge = 100;
    p2.state = 'DIZZY' as any;
    t.applyAutoRecovery(p2, gauge, 0);
    expect(p2.stunGauge).toBe(100);
  });
});

// ===== F-Key Shortcuts =====
describe('F-key shortcuts', () => {
  let t: TrainingModeState;
  let p1: Fighter;
  let p2: Fighter;

  beforeEach(() => {
    t = new TrainingModeState();
    p1 = createFighter(300);
    p2 = createFighter(500);
  });

  it('F1 cycles dummy behavior', () => {
    const handled = t.handleKeyShortcuts('F1', true, p1, p2);
    expect(handled).toBe(true);
    expect(t.dummyBehavior).toBe(DummyBehavior.BLOCK_ALL);
  });

  it('F2 toggles hitbox display', () => {
    expect(t.showHitboxes).toBe(false);
    t.handleKeyShortcuts('F2', true, p1, p2);
    expect(t.showHitboxes).toBe(true);
    // Release key to clear debounce
    t.handleKeyShortcuts('F2', false, p1, p2);
    t.handleKeyShortcuts('F2', true, p1, p2);
    expect(t.showHitboxes).toBe(false);
  });

  it('F7 cycles hitbox display mode when hitboxes are shown', () => {
    setHitboxDisplayMode('game');
    // First enable hitboxes
    t.handleKeyShortcuts('F2', true, p1, p2);
    expect(t.showHitboxes).toBe(true);
    expect(getHitboxDisplayMode()).toBe('game');
    // Release debounce
    t.handleKeyShortcuts('F7', false, p1, p2);
    // Cycle to 'both'
    t.handleKeyShortcuts('F7', true, p1, p2);
    expect(getHitboxDisplayMode()).toBe('both');
    // Release debounce
    t.handleKeyShortcuts('F7', false, p1, p2);
    // Cycle to 'mugen'
    t.handleKeyShortcuts('F7', true, p1, p2);
    expect(getHitboxDisplayMode()).toBe('mugen');
    // Release debounce
    t.handleKeyShortcuts('F7', false, p1, p2);
    // Cycle back to 'game'
    t.handleKeyShortcuts('F7', true, p1, p2);
    expect(getHitboxDisplayMode()).toBe('game');
  });

  it('F3 toggles input history display', () => {
    expect(t.showInputHistory).toBe(true);
    t.handleKeyShortcuts('F3', true, p1, p2);
    expect(t.showInputHistory).toBe(false);
  });

  it('F4 toggles frame data display', () => {
    expect(t.showFrameData).toBe(true);
    t.handleKeyShortcuts('F4', true, p1, p2);
    expect(t.showFrameData).toBe(false);
  });

  it('ignores key-up events', () => {
    t.handleKeyShortcuts('F1', false, p1, p2);
    expect(t.dummyBehavior).toBe(DummyBehavior.STAND);
  });

  it('debounces rapid key repeats', () => {
    t.handleKeyShortcuts('F1', true, p1, p2);
    t.handleKeyShortcuts('F1', true, p1, p2); // debounced, should not advance again
    expect(t.dummyBehavior).toBe(DummyBehavior.BLOCK_ALL);
  });

  it('returns false for unknown keys', () => {
    const handled = t.handleKeyShortcuts('KeyA', true, p1, p2);
    expect(handled).toBe(false);
  });
});

// ===== Reset =====
describe('TrainingModeState reset', () => {
  it('resets all state to defaults', () => {
    const t = new TrainingModeState();
    t.dummyBehavior = DummyBehavior.JUMP;
    t.autoRecoverHP = false;
    t.infiniteMeter = false;
    t.showInputHistory = false;
    t.showFrameData = false;
    t.showHitboxes = true;
    t.recordInput('→', ['A'], 10);

    t.reset();

    expect(t.dummyBehavior).toBe(DummyBehavior.STAND);
    expect(t.autoRecoverHP).toBe(true);
    expect(t.infiniteMeter).toBe(true);
    expect(t.showInputHistory).toBe(true);
    expect(t.showFrameData).toBe(true);
    expect(t.showHitboxes).toBe(false);
    expect(t.inputHistory).toEqual([]);
    expect(t.lastFrameData).toBeNull();
  });
});

// ===== Dummy Input Generation =====
describe('Dummy input generation', () => {
  it('STAND returns empty input', () => {
    const t = new TrainingModeState();
    t.dummyBehavior = DummyBehavior.STAND;
    const p1 = createFighter(300);
    const p2 = createFighter(500, -1);

    const input = t.getDummyInput(p1, p2, 0, -1);
    expect(input.up).toBe(false);
    expect(input.down).toBe(false);
    expect(input.forward).toBe(false);
    expect(input.back).toBe(false);
    expect(input.buttonA).toBe(false);
  });

  it('CROUCH returns down held', () => {
    const t = new TrainingModeState();
    t.dummyBehavior = DummyBehavior.CROUCH;
    const p1 = createFighter(300);
    const p2 = createFighter(500, -1);

    const input = t.getDummyInput(p1, p2, 0, -1);
    expect(input.down).toBe(true);
  });

  it('JUMP returns up on cycle', () => {
    const t = new TrainingModeState();
    t.dummyBehavior = DummyBehavior.JUMP;
    const p1 = createFighter(300);
    const p2 = createFighter(500, -1);
    p2.vy = 0; // grounded

    // Tick 0: should trigger jump
    const input = t.getDummyInput(p1, p2, 0, -1);
    expect(input.up).toBe(true);

    // Tick 5: should not trigger
    const input2 = t.getDummyInput(p1, p2, 5, -1);
    expect(input2.up).toBe(false);
  });
});
