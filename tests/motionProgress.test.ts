import { describe, it, expect } from 'vitest';
import { CommandBuffer } from '../src/input/commandBuffer.js';
import type { DirectionInput } from '../src/core/types.js';

describe('CommandBuffer.getMotionProgress', () => {
  it('returns null when no direction history exists', () => {
    const cb = new CommandBuffer();
    expect(cb.getMotionProgress(0)).toBeNull();
  });

  it('detects partial QCF (down)', () => {
    const cb = new CommandBuffer();
    cb.record('down' as DirectionInput, 0);
    const result = cb.getMotionProgress(5);
    expect(result).not.toBeNull();
    expect(result!.motion).toBe('QCF');
    expect(result!.steps).toBeGreaterThanOrEqual(1);
  });

  it('detects full QCF (down → downforward → forward)', () => {
    const cb = new CommandBuffer();
    cb.record('down' as DirectionInput, 0);
    cb.record('downforward' as DirectionInput, 3);
    cb.record('forward' as DirectionInput, 6);
    const result = cb.getMotionProgress(10);
    expect(result).not.toBeNull();
    expect(result!.steps).toBe(result!.total);
  });

  it('detects partial QCB (down)', () => {
    const cb = new CommandBuffer();
    cb.record('down' as DirectionInput, 0);
    cb.record('downback' as DirectionInput, 3);
    const result = cb.getMotionProgress(5);
    expect(result).not.toBeNull();
    expect(['QCF', 'QCB']).toContain(result!.motion);
  });

  it('detects DP (forward → down)', () => {
    const cb = new CommandBuffer();
    cb.record('forward' as DirectionInput, 0);
    cb.record('down' as DirectionInput, 3);
    const result = cb.getMotionProgress(5);
    expect(result).not.toBeNull();
    // DP or QCF should be detected
    expect(result!.steps).toBeGreaterThanOrEqual(2);
  });

  it('returns null when all history is outside command window', () => {
    const cb = new CommandBuffer();
    cb.record('down' as DirectionInput, 0);
    // Query at frame 100, well outside the ~12-frame command window
    const result = cb.getMotionProgress(100);
    expect(result).toBeNull();
  });

  it('neutral direction inputs are ignored', () => {
    const cb = new CommandBuffer();
    // Neutral is not recorded by record()
    const result = cb.getMotionProgress(5);
    expect(result).toBeNull();
  });
});
