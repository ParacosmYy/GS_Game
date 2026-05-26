import { describe, it, expect } from 'vitest';
import { RYO_CHARACTER_DATA } from '../src/content/characters/ryo/data.js';

describe('ryoContentData', () => {
  it('RYO_CHARACTER_DATA is defined', () => {
    expect(RYO_CHARACTER_DATA).toBeDefined();
    expect(typeof RYO_CHARACTER_DATA).toBe('object');
  });
  it('has id ryo', () => {
    expect(RYO_CHARACTER_DATA.id).toBe('ryo');
  });
  it('has displayName', () => {
    expect(RYO_CHARACTER_DATA.displayName).toBeDefined();
    expect(typeof RYO_CHARACTER_DATA.displayName).toBe('string');
  });
  it('has nameCn', () => {
    expect(RYO_CHARACTER_DATA.nameCn).toBe('坂崎亮');
  });
  it('has weight number', () => {
    expect(typeof RYO_CHARACTER_DATA.weight).toBe('number');
  });
  it('has walkSpeedForward number', () => {
    expect(typeof RYO_CHARACTER_DATA.walkSpeedForward).toBe('number');
  });
  it('has runSpeed number', () => {
    expect(typeof RYO_CHARACTER_DATA.runSpeed).toBe('number');
  });
  it('has jumpVelocity number', () => {
    expect(typeof RYO_CHARACTER_DATA.jumpVelocity).toBe('number');
  });
});
