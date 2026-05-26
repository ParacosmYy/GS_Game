import { describe, it, expect } from 'vitest';
import { InputPlayback } from '../src/core/inputPlayback.js';

describe('inputPlayback', () => {
  it('can be instantiated', () => {
    const pb = new InputPlayback();
    expect(pb).toBeDefined();
  });
  it('active is false initially', () => {
    const pb = new InputPlayback();
    expect(pb.active).toBe(false);
  });
  it('frameCount is 0 initially', () => {
    const pb = new InputPlayback();
    expect(pb.frameCount).toBe(0);
  });
  it('isFinished is true initially', () => {
    const pb = new InputPlayback();
    expect(pb.isFinished()).toBe(true);
  });
  it('getInput returns null when no data', () => {
    const pb = new InputPlayback();
    expect(pb.getInput(0, 1)).toBeNull();
  });
  it('load accepts empty array', () => {
    const pb = new InputPlayback();
    pb.load([]);
    expect(pb.frameCount).toBe(0);
  });
  it('tickRange is null initially', () => {
    const pb = new InputPlayback();
    expect(pb.tickRange).toBeNull();
  });
});
