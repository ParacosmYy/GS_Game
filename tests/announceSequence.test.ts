import { describe, it, expect } from 'vitest';
import { AnnounceSequence, type AnnounceStep } from '../src/state/announceSequence.js';
import { createRoundStartSequence, createKOSequence, createTimeOverSequence, createWinnerSequence } from '../src/state/announcePresets.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal valid AnnounceStep with sensible defaults. */
function makeStep(overrides: Partial<AnnounceStep> = {}): AnnounceStep {
  return {
    id: overrides.id ?? 'test',
    text: overrides.text ?? 'A',
    duration: overrides.duration ?? 10,
    fillColor: overrides.fillColor ?? '#fff',
    glowColor: overrides.glowColor ?? '#000',
    fontSize: overrides.fontSize ?? 10,
    scaleCurve: overrides.scaleCurve ?? (() => 1),
    alphaCurve: overrides.alphaCurve ?? (() => 1),
    sfxTriggerFrame: overrides.sfxTriggerFrame ?? null,
    sfxId: overrides.sfxId ?? null,
    flash: overrides.flash ?? null,
    shockwaveRings: overrides.shockwaveRings ?? 0,
  };
}

// ---------------------------------------------------------------------------
// AnnounceSequence — lifecycle
// ---------------------------------------------------------------------------

describe('AnnounceSequence', () => {
  describe('lifecycle', () => {
    it('initial state is idle', () => {
      const seq = new AnnounceSequence();
      expect(seq.getPhase()).toBe('idle');
      expect(seq.isComplete()).toBe(false);
      expect(seq.isRunning()).toBe(false);
    });

    it('setSteps transitions to running', () => {
      const seq = new AnnounceSequence();
      seq.setSteps([makeStep()]);
      expect(seq.getPhase()).toBe('running');
      expect(seq.isRunning()).toBe(true);
      expect(seq.isComplete()).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // tick progression
  // ---------------------------------------------------------------------------

  describe('tick progression', () => {
    it('single step completes after duration frames', () => {
      const seq = new AnnounceSequence();
      seq.setSteps([makeStep({ duration: 5 })]);
      for (let i = 0; i < 4; i++) seq.tick();
      expect(seq.isRunning()).toBe(true);
      seq.tick(); // frame 5 — step ends
      expect(seq.isComplete()).toBe(true);
    });

    it('multi-step sequence advances sequentially', () => {
      const seq = new AnnounceSequence();
      seq.setSteps([
        makeStep({ id: 'a', text: 'first', duration: 3 }),
        makeStep({ id: 'b', text: 'second', duration: 5 }),
      ]);
      for (let i = 0; i < 3; i++) seq.tick();
      expect(seq.getText()).toBe('second');
      for (let i = 0; i < 5; i++) seq.tick();
      expect(seq.isComplete()).toBe(true);
    });

    it('tick on idle returns null', () => {
      const seq = new AnnounceSequence();
      expect(seq.tick()).toBeNull();
      expect(seq.getCurrentRender()).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // SFX triggering
  // ---------------------------------------------------------------------------

  describe('SFX triggering', () => {
    it('sfx fires at the specified trigger frame', () => {
      const seq = new AnnounceSequence();
      seq.setSteps([makeStep({
        duration: 10,
        sfxTriggerFrame: 3,
        sfxId: 'test_sfx',
      })]);
      // Frames 0, 1, 2 — no trigger
      for (let i = 0; i < 3; i++) expect(seq.tick()).toBeNull();
      // Frame 3 — triggers
      expect(seq.tick()).toBe('test_sfx');
      // Frames 4-9 — no repeat
      for (let i = 0; i < 6; i++) expect(seq.tick()).toBeNull();
    });

    it('sfx does not repeat even if stepFrame wraps', () => {
      const seq = new AnnounceSequence();
      seq.setSteps([makeStep({
        duration: 4,
        sfxTriggerFrame: 0,
        sfxId: 'sfx',
      })]);
      expect(seq.tick()).toBe('sfx');
      for (let i = 0; i < 3; i++) expect(seq.tick()).toBeNull();
    });

    it('step with sfxTriggerFrame=null never fires', () => {
      const seq = new AnnounceSequence();
      seq.setSteps([makeStep({
        duration: 5,
        sfxTriggerFrame: null,
        sfxId: 'never',
      })]);
      for (let i = 0; i < 5; i++) {
        expect(seq.tick()).toBeNull();
      }
    });

    it('multi-step sequence fires sfx at each step independently', () => {
      const seq = new AnnounceSequence();
      seq.setSteps([
        makeStep({ id: 'a', duration: 3, sfxTriggerFrame: 0, sfxId: 'sfx_a' }),
        makeStep({ id: 'b', duration: 4, sfxTriggerFrame: 1, sfxId: 'sfx_b' }),
      ]);

      const fired: (string | null)[] = [];
      for (let i = 0; i < 7; i++) {
        fired.push(seq.tick());
      }

      // Step a: frame 0 fires sfx_a, frames 1-2 no sfx
      expect(fired[0]).toBe('sfx_a');
      expect(fired[1]).toBeNull();
      expect(fired[2]).toBeNull();
      // Step b: frame 0 no sfx (trigger is frame 1), frame 1 fires sfx_b
      expect(fired[3]).toBeNull();
      expect(fired[4]).toBe('sfx_b');
      expect(fired[5]).toBeNull();
      expect(fired[6]).toBeNull();
      expect(seq.isComplete()).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // getCurrentRender
  // ---------------------------------------------------------------------------

  describe('getCurrentRender', () => {
    it('returns step and progress after tick', () => {
      const seq = new AnnounceSequence();
      seq.setSteps([makeStep({ id: 'a', duration: 10 })]);
      seq.tick(); // stepFrame becomes 1
      const render = seq.getCurrentRender();
      expect(render).not.toBeNull();
      expect(render!.step.id).toBe('a');
      expect(render!.progress).toBe(0.1); // 1/10
    });

    it('returns null when idle', () => {
      const seq = new AnnounceSequence();
      expect(seq.getCurrentRender()).toBeNull();
    });

    it('returns null when complete', () => {
      const seq = new AnnounceSequence();
      seq.setSteps([makeStep({ duration: 1 })]);
      seq.tick();
      expect(seq.isComplete()).toBe(true);
      expect(seq.getCurrentRender()).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // reset
  // ---------------------------------------------------------------------------

  describe('reset', () => {
    it('reset returns to idle while preserving steps', () => {
      const seq = new AnnounceSequence();
      seq.setSteps([makeStep({ text: 'hello', duration: 5 })]);
      seq.tick();
      seq.reset();
      expect(seq.getPhase()).toBe('idle');
      expect(seq.isComplete()).toBe(false);
      // After reset, phase is idle so getText returns ''
      expect(seq.getText()).toBe('');
    });

    it('sequence replays correctly after setSteps following reset', () => {
      const seq = new AnnounceSequence();
      const steps = [makeStep({ duration: 2, sfxTriggerFrame: 0, sfxId: 'ping' })];
      seq.setSteps(steps);
      expect(seq.tick()).toBe('ping');
      seq.tick();
      expect(seq.isComplete()).toBe(true);

      // reset goes to idle, then setSteps restarts
      seq.reset();
      expect(seq.getPhase()).toBe('idle');
      seq.setSteps(steps);
      expect(seq.getPhase()).toBe('running');
      expect(seq.tick()).toBe('ping');
      seq.tick();
      expect(seq.isComplete()).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// announcePresets — Round Start
// ---------------------------------------------------------------------------

describe('announcePresets — Round Start', () => {
  it('createRoundStartSequence returns 2 steps', () => {
    const steps = createRoundStartSequence(1);
    expect(steps.length).toBe(2);
  });

  it('ROUND step has correct text and sfxId', () => {
    const steps = createRoundStartSequence(1);
    expect(steps[0].text).toBe('ROUND 1');
    expect(steps[0].sfxId).toBe('round_call');
  });

  it('FIGHT step has correct text and sfxId', () => {
    const steps = createRoundStartSequence(1);
    expect(steps[1].text).toBe('FIGHT!');
    expect(steps[1].sfxId).toBe('fight');
  });

  it('different round numbers produce different text', () => {
    expect(createRoundStartSequence(2)[0].text).toBe('ROUND 2');
    expect(createRoundStartSequence(3)[0].text).toBe('ROUND 3');
    expect(createRoundStartSequence(5)[0].text).toBe('ROUND 5');
  });

  it('both steps have sfxTriggerFrame set', () => {
    const steps = createRoundStartSequence(1);
    expect(steps[0].sfxTriggerFrame).not.toBeNull();
    expect(steps[1].sfxTriggerFrame).not.toBeNull();
  });

  it('both steps have positive duration and fontSize', () => {
    const steps = createRoundStartSequence(1);
    for (const s of steps) {
      expect(s.duration).toBeGreaterThan(0);
      expect(s.fontSize).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// announcePresets — KO
// ---------------------------------------------------------------------------

describe('announcePresets — KO', () => {
  it('createKOSequence(false) returns 1 step', () => {
    const steps = createKOSequence(false);
    expect(steps.length).toBe(1);
    expect(steps[0].text).toBe('K.O.!');
    expect(steps[0].sfxId).toBe('ko');
  });

  it('createKOSequence(true) returns 2 steps with PERFECT', () => {
    const steps = createKOSequence(true);
    expect(steps.length).toBe(2);
    expect(steps[0].text).toBe('K.O.!');
    expect(steps[1].text).toBe('PERFECT!');
    expect(steps[1].sfxId).toBe('perfect');
  });
});

// ---------------------------------------------------------------------------
// announcePresets — Time Over
// ---------------------------------------------------------------------------

describe('announcePresets — Time Over', () => {
  it('createTimeOverSequence returns 1 step', () => {
    const steps = createTimeOverSequence();
    expect(steps.length).toBe(1);
    expect(steps[0].text).toBe('TIME OVER');
    expect(steps[0].sfxId).toBe('time_over');
  });
});

// ---------------------------------------------------------------------------
// announcePresets — Winner
// ---------------------------------------------------------------------------

describe('announcePresets — Winner', () => {
  it('createWinnerSequence includes winner name', () => {
    const steps = createWinnerSequence('Kyo');
    expect(steps.length).toBe(1);
    expect(steps[0].text).toBe('Kyo');
    expect(steps[0].sfxId).toBe('victory');
  });
});

// ---------------------------------------------------------------------------
// announcePresets — animation curves
// ---------------------------------------------------------------------------

describe('announcePresets — animation curves', () => {
  it('all steps have finite scale and alpha values across [0,1]', () => {
    const allSteps = [
      ...createRoundStartSequence(1),
      ...createKOSequence(true),
      ...createTimeOverSequence(),
      ...createWinnerSequence('Test'),
    ];
    for (const step of allSteps) {
      for (let p = 0; p <= 1; p += 0.05) {
        expect(isFinite(step.scaleCurve(p))).toBe(true);
        expect(isFinite(step.alphaCurve(p))).toBe(true);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Full preset integration with AnnounceSequence
// ---------------------------------------------------------------------------

describe('AnnounceSequence — full preset integration', () => {
  it('Round Start sequence runs to completion and fires both sfx', () => {
    const seq = new AnnounceSequence();
    const steps = createRoundStartSequence(1);
    seq.setSteps(steps);
    const totalFrames = steps.reduce((sum, s) => sum + s.duration, 0);
    const triggered: string[] = [];
    for (let i = 0; i < totalFrames + 10; i++) {
      const sfx = seq.tick();
      if (sfx) triggered.push(sfx);
    }
    expect(seq.isComplete()).toBe(true);
    expect(triggered).toContain('round_call');
    expect(triggered).toContain('fight');
  });

  it('KO + PERFECT sequence runs to completion and fires both sfx', () => {
    const seq = new AnnounceSequence();
    const steps = createKOSequence(true);
    seq.setSteps(steps);
    const totalFrames = steps.reduce((sum, s) => sum + s.duration, 0);
    const triggered: string[] = [];
    for (let i = 0; i < totalFrames + 10; i++) {
      const sfx = seq.tick();
      if (sfx) triggered.push(sfx);
    }
    expect(seq.isComplete()).toBe(true);
    expect(triggered).toContain('ko');
    expect(triggered).toContain('perfect');
  });

  it('KO without PERFECT fires only ko sfx', () => {
    const seq = new AnnounceSequence();
    const steps = createKOSequence(false);
    seq.setSteps(steps);
    const totalFrames = steps.reduce((sum, s) => sum + s.duration, 0);
    const triggered: string[] = [];
    for (let i = 0; i < totalFrames + 5; i++) {
      const sfx = seq.tick();
      if (sfx) triggered.push(sfx);
    }
    expect(seq.isComplete()).toBe(true);
    expect(triggered).toEqual(['ko']);
  });

  it('Time Over sequence runs to completion', () => {
    const seq = new AnnounceSequence();
    const steps = createTimeOverSequence();
    seq.setSteps(steps);
    const totalFrames = steps.reduce((sum, s) => sum + s.duration, 0);
    const triggered: string[] = [];
    for (let i = 0; i < totalFrames + 5; i++) {
      const sfx = seq.tick();
      if (sfx) triggered.push(sfx);
    }
    expect(seq.isComplete()).toBe(true);
    expect(triggered).toContain('time_over');
  });

  it('Winner sequence runs to completion', () => {
    const seq = new AnnounceSequence();
    const steps = createWinnerSequence('Iori');
    seq.setSteps(steps);
    const totalFrames = steps.reduce((sum, s) => sum + s.duration, 0);
    const triggered: string[] = [];
    for (let i = 0; i < totalFrames + 5; i++) {
      const sfx = seq.tick();
      if (sfx) triggered.push(sfx);
    }
    expect(seq.isComplete()).toBe(true);
    expect(triggered).toContain('victory');
  });
});
