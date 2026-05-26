import { describe, it, expect } from 'vitest';
import { AnnounceSequence } from '../src/state/announceSequence.js';
import type { AnnounceStep } from '../src/state/announceSequence.js';

function makeStep(overrides: Partial<AnnounceStep> = {}): AnnounceStep {
  return {
    id: 'test', text: 'TEST', duration: 10, fillColor: '#fff', glowColor: '#fff', fontSize: 48,
    scaleCurve: (p: number) => 1, alphaCurve: (p: number) => 1,
    sfxTriggerFrame: null, sfxId: null, flash: null, shockwaveRings: 0,
    ...overrides,
  };
}

describe('AnnounceSequence', () => {
  it('starts idle', () => expect(new AnnounceSequence().getPhase()).toBe('idle'));

  it('transitions to running after setSteps', () => {
    const seq = new AnnounceSequence();
    seq.setSteps([makeStep()]);
    expect(seq.getPhase()).toBe('running');
  });

  it('tick returns null when idle', () => expect(new AnnounceSequence().tick()).toBeNull());

  it('advances through steps', () => {
    const seq = new AnnounceSequence();
    seq.setSteps([makeStep({ duration: 2 }), makeStep({ duration: 2, text: 'STEP2' })]);
    seq.tick(); // step 0, frame 0
    seq.tick(); // step 0, frame 1 -> advance (duration=2)
    seq.tick(); // step 1, frame 0
    const r = seq.getCurrentRender();
    expect(r).not.toBeNull();
    expect(r!.step.text).toBe('STEP2');
  });

  it('completes after all steps', () => {
    const seq = new AnnounceSequence();
    seq.setSteps([makeStep({ duration: 2 })]);
    seq.tick(); // frame 0
    seq.tick(); // frame 1 -> step complete
    seq.tick(); // advance -> complete
    expect(seq.getPhase()).toBe('complete');
  });

  it('triggers sfx at correct frame', () => {
    const seq = new AnnounceSequence();
    seq.setSteps([makeStep({ duration: 5, sfxTriggerFrame: 2, sfxId: 'bell' })]);
    seq.tick(); // frame 0
    seq.tick(); // frame 1
    expect(seq.tick()).toBe('bell'); // frame 2
    expect(seq.tick()).toBeNull(); // frame 3, already triggered
  });

  it('getCurrentRender returns step and progress', () => {
    const seq = new AnnounceSequence();
    seq.setSteps([makeStep({ text: 'ROUND 1', duration: 10 })]);
    const r = seq.getCurrentRender();
    expect(r).not.toBeNull();
    expect(r!.step.text).toBe('ROUND 1');
    expect(r!.progress).toBe(0);
  });

  it('progress increases with ticks', () => {
    const seq = new AnnounceSequence();
    seq.setSteps([makeStep({ duration: 10 })]);
    seq.tick();
    expect(seq.getCurrentRender()!.progress).toBeGreaterThan(0);
  });

  it('reset returns to idle', () => {
    const seq = new AnnounceSequence();
    seq.setSteps([makeStep()]);
    seq.reset();
    expect(seq.getPhase()).toBe('idle');
  });

  it('handles empty steps array', () => {
    const seq = new AnnounceSequence();
    seq.setSteps([]);
    expect(seq.getPhase()).toBe('running');
    seq.tick();
    expect(seq.getPhase()).toBe('complete');
  });

  it('multi-step sfx fires for each step', () => {
    const seq = new AnnounceSequence();
    seq.setSteps([
      makeStep({ duration: 2, sfxTriggerFrame: 0, sfxId: 'sfx1' }),
      makeStep({ duration: 2, sfxTriggerFrame: 0, sfxId: 'sfx2' }),
    ]);
    expect(seq.tick()).toBe('sfx1');
    seq.tick();
    expect(seq.tick()).toBe('sfx2');
    seq.tick();
    expect(seq.getPhase()).toBe('complete');
  });

  it('getCurrentRender returns null when complete', () => {
    const seq = new AnnounceSequence();
    seq.setSteps([makeStep({ duration: 1 })]);
    seq.tick(); // frame 0 -> step complete
    seq.tick(); // transition
    expect(seq.getCurrentRender()).toBeNull();
  });
});
