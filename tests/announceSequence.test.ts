import { describe, it, expect } from 'vitest';
import { AnnounceSequence } from '../src/state/announceSequence.js';
import type { AnnounceStep } from '../src/state/announceSequence.js';

describe('AnnounceSequence', () => {
  const steps: AnnounceStep[] = [
    { text: 'ROUND 1', duration: 60, scale: 1, ease: 'popIn', sfxId: 'round', sfxTriggerFrame: 0 },
    { text: 'FIGHT!', duration: 30, scale: 1.2, ease: 'burstIn', sfxId: 'fight', sfxTriggerFrame: 0 },
  ];

  it('starts idle', () => {
    const seq = new AnnounceSequence();
    expect(seq.getPhase()).toBe('idle');
  });
  it('setSteps changes phase to running', () => {
    const seq = new AnnounceSequence();
    seq.setSteps(steps);
    expect(seq.getPhase()).toBe('running');
  });
  it('tick returns sfxId within step duration', () => {
    const seq = new AnnounceSequence();
    seq.setSteps(steps);
    let found = false;
    for (let i = 0; i < 60; i++) {
      if (seq.tick() === 'round') { found = true; break; }
    }
    expect(found).toBe(true);
  });
  it('completes after all steps', () => {
    const seq = new AnnounceSequence();
    seq.setSteps(steps);
    for (let i = 0; i < 200; i++) seq.tick();
    expect(seq.getPhase()).toBe('complete');
  });
  it('getText returns current step text', () => {
    const seq = new AnnounceSequence();
    seq.setSteps(steps);
    expect(seq.getText()).toBe('ROUND 1');
  });
});
