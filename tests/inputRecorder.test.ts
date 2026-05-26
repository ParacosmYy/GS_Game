import { describe, it, expect } from 'vitest';
import { InputRecorder } from '../src/core/inputRecorder.js';

describe('inputRecorder', () => {
  it('can be instantiated', () => {
    const ir = new InputRecorder();
    expect(ir).toBeDefined();
  });
  it('active is false initially', () => {
    const ir = new InputRecorder();
    expect(ir.active).toBe(false);
  });
  it('frameCount is 0 initially', () => {
    const ir = new InputRecorder();
    expect(ir.frameCount).toBe(0);
  });
  it('start sets active', () => {
    const ir = new InputRecorder();
    ir.start(0);
    expect(ir.active).toBe(true);
  });
  it('stop returns array', () => {
    const ir = new InputRecorder();
    ir.start(0);
    const result = ir.stop();
    expect(Array.isArray(result)).toBe(true);
  });
  it('getRecording returns array', () => {
    const ir = new InputRecorder();
    const result = ir.getRecording();
    expect(Array.isArray(result)).toBe(true);
  });
  it('stop sets inactive', () => {
    const ir = new InputRecorder();
    ir.start(0);
    ir.stop();
    expect(ir.active).toBe(false);
  });
});
