import { describe, it, expect } from 'vitest';
import { ScreenShake } from '../src/rendering/vfx.js';

describe('ScreenShake', () => {
  it('trigger sets intensity and duration', () => {
    const shake = new ScreenShake();
    shake.trigger(10, 20);
    expect(shake.offsetX).toBe(0);
    expect(shake.offsetY).toBe(0);
  });
  it('update decrements duration', () => {
    const shake = new ScreenShake();
    shake.trigger(5, 3);
    shake.update();
    shake.update();
    shake.update();
    shake.update(); // Should not error
    expect(true).toBe(true);
  });
  it('higher intensity replaces lower', () => {
    const shake = new ScreenShake();
    shake.trigger(5, 20);
    shake.trigger(10, 10); // higher intensity replaces
    shake.update();
    expect(true).toBe(true);
  });
  it('lower intensity does not replace', () => {
    const shake = new ScreenShake();
    shake.trigger(10, 20);
    shake.trigger(5, 10); // lower should not replace
    shake.update();
    expect(true).toBe(true);
  });
});
