import { describe, it, expect } from 'vitest';
import { AnnounceSequence } from '../src/state/announceSequence.js';

describe('announceSequence', () => {
  it('starts idle', () => {
    const seq = new AnnounceSequence();
    expect(seq.getPhase()).toBe('idle');
  });
  it('isComplete is false initially', () => {
    const seq = new AnnounceSequence();
    expect(seq.isComplete()).toBe(false);
  });
  it('isRunning is false initially', () => {
    const seq = new AnnounceSequence();
    expect(seq.isRunning()).toBe(false);
  });
  it('setSteps starts running', () => {
    const seq = new AnnounceSequence();
    seq.setSteps([{ text: 'ROUND 1', duration: 60, sfxId: 'round1' }]);
    expect(seq.isRunning()).toBe(true);
    expect(seq.getPhase()).toBe('running');
  });
  it('getText returns step text', () => {
    const seq = new AnnounceSequence();
    seq.setSteps([{ text: 'FIGHT!', duration: 30, sfxId: 'fight' }]);
    expect(seq.getText()).toBe('FIGHT!');
  });
  it('tick returns null when idle', () => {
    const seq = new AnnounceSequence();
    expect(seq.tick()).toBeNull();
  });
  it('reset goes back to idle', () => {
    const seq = new AnnounceSequence();
    seq.setSteps([{ text: 'TEST', duration: 10 }]);
    seq.reset();
    expect(seq.getPhase()).toBe('idle');
  });
  it('getCurrentRender returns null when idle', () => {
    const seq = new AnnounceSequence();
    expect(seq.getCurrentRender()).toBeNull();
  });
});
