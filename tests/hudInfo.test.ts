import { describe, it, expect } from 'vitest';
import { inputToNumpad, numpadToArrow } from '../src/rendering/hudInfo.js';

describe('hudInfo input utilities', () => {
  it('inputToNumpad returns 5 for neutral', () => {
    expect(inputToNumpad({ up: false, down: false, left: false, right: false }, 1)).toBe('5');
  });
  it('inputToNumpad returns 8 for up', () => {
    expect(inputToNumpad({ up: true, down: false, left: false, right: false }, 1)).toBe('8');
  });
  it('inputToNumpad returns 6 for right when facing right', () => {
    expect(inputToNumpad({ up: false, down: false, left: false, right: true }, 1)).toBe('6');
  });
  it('inputToNumpad returns 4 for right when facing left', () => {
    expect(inputToNumpad({ up: false, down: false, left: false, right: true }, -1)).toBe('4');
  });
  it('inputToNumpad returns 2 for down', () => {
    expect(inputToNumpad({ up: false, down: true, left: false, right: false }, 1)).toBe('2');
  });
  it('numpadToArrow returns arrows for known inputs', () => {
    expect(numpadToArrow('8')).toBe('↑');
    expect(numpadToArrow('2')).toBe('↓');
    expect(numpadToArrow('6')).toBe('→');
    expect(numpadToArrow('4')).toBe('←');
  });
  it('numpadToArrow returns dot for unknown', () => {
    expect(numpadToArrow('0')).toBe('·');
  });
});
