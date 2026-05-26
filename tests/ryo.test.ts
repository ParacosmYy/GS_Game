import { describe, it, expect } from 'vitest';
import { RyoDef } from '../src/characters/ryo.js';

describe('ryo', () => {
  it('has id ryo', () => {
    expect(RyoDef.id).toBe('ryo');
  });
  it('has name', () => {
    expect(RyoDef.name).toBe('Ryo Sakazaki');
  });
  it('has nameCn', () => {
    expect(RyoDef.nameCn).toBe('坂崎亮');
  });
  it('has color string', () => {
    expect(typeof RyoDef.color).toBe('string');
    expect(RyoDef.color.length).toBeGreaterThan(0);
  });
  it('has winQuotes array', () => {
    expect(Array.isArray(RyoDef.winQuotes)).toBe(true);
    expect(RyoDef.winQuotes.length).toBeGreaterThan(0);
  });
  it('has stats', () => {
    expect(RyoDef.stats).toBeDefined();
    expect(typeof RyoDef.stats).toBe('object');
  });
  it('has poses', () => {
    expect(RyoDef.poses).toBeDefined();
    expect(typeof RyoDef.poses).toBe('object');
  });
  it('has moveList', () => {
    expect(Array.isArray(RyoDef.moveList)).toBe(true);
  });
  it('has proportions', () => {
    expect(RyoDef.proportions).toBeDefined();
  });
});
