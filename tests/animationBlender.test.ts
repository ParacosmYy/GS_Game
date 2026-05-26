import { describe, it, expect } from 'vitest';
import { AnimationBlender, getFighterBlender, resetAllBlenders, getBlendDuration } from '../src/rendering/animationBlender.js';

describe('animationBlender', () => {
  it('initially not blending', () => {
    const b = new AnimationBlender();
    expect(b.isBlending()).toBe(false);
    expect(b.getBlendState()).toBeNull();
  });
  it('startBlend with duration > 0 activates', () => {
    const b = new AnimationBlender();
    b.startBlend('idle', 0, 'walk', 4);
    expect(b.isBlending()).toBe(true);
    const state = b.getBlendState();
    expect(state).not.toBeNull();
    expect(state!.fromAction).toBe('idle');
    expect(state!.toAction).toBe('walk');
  });
  it('startBlend with duration 0 does not blend', () => {
    const b = new AnimationBlender();
    b.startBlend('idle', 0, 'walk', 0);
    expect(b.isBlending()).toBe(false);
  });
  it('update progresses blend to completion', () => {
    const b = new AnimationBlender();
    b.startBlend('idle', 0, 'walk', 3);
    b.update(); b.update(); b.update();
    expect(b.isBlending()).toBe(false);
  });
  it('interpolate lerps between positions', () => {
    const b = new AnimationBlender();
    b.startBlend('idle', 0, 'walk', 2);
    b.update(); // progress = 0.5
    const result = b.interpolate({ offsetX: 0, offsetY: 0 }, { offsetX: 10, offsetY: 20 });
    expect(result.offsetX).toBeCloseTo(5, 1);
    expect(result.offsetY).toBeCloseTo(10, 1);
  });
  it('cancel stops blending', () => {
    const b = new AnimationBlender();
    b.startBlend('idle', 0, 'walk', 4);
    b.cancel();
    expect(b.isBlending()).toBe(false);
  });
  it('getFighterBlender returns same instance', () => {
    resetAllBlenders();
    const a = getFighterBlender(0);
    const b = getFighterBlender(0);
    expect(a).toBe(b);
  });
  it('getBlendDuration returns number', () => {
    const d = getBlendDuration('idle', 'walk');
    expect(typeof d).toBe('number');
  });
});
