/**
 * Rendering Color Utility Tests
 *
 * Validates pure color functions from src/rendering/utils.ts.
 * Tests shiftColor and parseColor — no Canvas dependency needed.
 */
import { describe, it, expect } from 'vitest';
import { shiftColor, parseColor } from '../src/rendering/utils.js';

// ===== parseColor =====

describe('parseColor', () => {
  it('parses #ff0000', () => {
    const { r, g, b } = parseColor('#ff0000');
    expect(r).toBe(255);
    expect(g).toBe(0);
    expect(b).toBe(0);
  });

  it('parses #00ff00', () => {
    const { r, g, b } = parseColor('#00ff00');
    expect(r).toBe(0);
    expect(g).toBe(255);
    expect(b).toBe(0);
  });

  it('parses #0000ff', () => {
    const { r, g, b } = parseColor('#0000ff');
    expect(r).toBe(0);
    expect(g).toBe(0);
    expect(b).toBe(255);
  });

  it('parses #000000', () => {
    const { r, g, b } = parseColor('#000000');
    expect(r).toBe(0);
    expect(g).toBe(0);
    expect(b).toBe(0);
  });

  it('parses #ffffff', () => {
    const { r, g, b } = parseColor('#ffffff');
    expect(r).toBe(255);
    expect(g).toBe(255);
    expect(b).toBe(255);
  });

  it('parses #4488ff', () => {
    const { r, g, b } = parseColor('#4488ff');
    expect(r).toBe(0x44);
    expect(g).toBe(0x88);
    expect(b).toBe(0xff);
  });

  it('parses rgb(128, 64, 32)', () => {
    const { r, g, b } = parseColor('rgb(128, 64, 32)');
    expect(r).toBe(128);
    expect(g).toBe(64);
    expect(b).toBe(32);
  });

  it('parses rgba(200, 100, 50, 0.8)', () => {
    const { r, g, b } = parseColor('rgba(200, 100, 50, 0.8)');
    expect(r).toBe(200);
    expect(g).toBe(100);
    expect(b).toBe(50);
  });

  it('returns gray for unknown format', () => {
    const { r, g, b } = parseColor('red');
    expect(r).toBe(128);
    expect(g).toBe(128);
    expect(b).toBe(128);
  });
});

// ===== shiftColor =====

describe('shiftColor', () => {
  it('brightens #000000 by 50', () => {
    const result = shiftColor('#000000', 50);
    expect(result).toBe('#323232');
  });

  it('darkens #ffffff by 50', () => {
    const result = shiftColor('#ffffff', -50);
    expect(result).toBe('#cdcdcd');
  });

  it('shifts each channel independently', () => {
    const result = shiftColor('#100020', 10);
    expect(result).toBe('#1a0a2a');
  });

  it('clamps at 255', () => {
    const result = shiftColor('#f0f0f0', 100);
    expect(result).toBe('#ffffff');
  });

  it('clamps at 0', () => {
    const result = shiftColor('#0a0a0a', -100);
    expect(result).toBe('#000000');
  });

  it('returns hex with # prefix', () => {
    const result = shiftColor('#808080', 10);
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('zero shift returns same color', () => {
    const result = shiftColor('#aabbcc', 0);
    expect(result).toBe('#aabbcc');
  });

  it('shiftColor(parseColor(x)) roundtrip is consistent', () => {
    const orig = '#4488ff';
    const shifted = shiftColor(orig, 20);
    const { r, g, b } = parseColor(shifted);
    expect(r).toBe(0x44 + 20);
    expect(g).toBe(0x88 + 20);
    expect(b).toBe(Math.min(0xff + 20, 255));
  });
});
