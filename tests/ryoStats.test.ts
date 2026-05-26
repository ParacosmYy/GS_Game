import { describe, it, expect } from 'vitest';
import { RYO_STATS } from '../src/content/characters/ryo/stats.js';

describe('RYO_STATS — Ryo character stats', () => {
  it('has walkSpeed', () => {
    expect(RYO_STATS.walkSpeed).toBeDefined();
    expect(typeof RYO_STATS.walkSpeed).toBe('number');
    expect(RYO_STATS.walkSpeed).toBeGreaterThan(0);
  });

  it('has runSpeed greater than walkSpeed', () => {
    expect(RYO_STATS.runSpeed).toBeGreaterThan(RYO_STATS.walkSpeed);
  });

  it('has jumpVelocity', () => {
    expect(RYO_STATS.jumpVelocity).toBeDefined();
    expect(typeof RYO_STATS.jumpVelocity).toBe('number');
    // Jump velocity should be negative (upward in canvas coordinates)
  });

  it('has hopVelocity', () => {
    expect(RYO_STATS.hopVelocity).toBeDefined();
    expect(typeof RYO_STATS.hopVelocity).toBe('number');
  });

  it('has maxHealth', () => {
    expect(RYO_STATS.maxHealth).toBeDefined();
    expect(RYO_STATS.maxHealth).toBeGreaterThan(0);
  });

  it('has pushWidth', () => {
    expect(RYO_STATS.pushWidth).toBeDefined();
    expect(RYO_STATS.pushWidth).toBeGreaterThan(0);
  });

  it('has jumpForwardSpeed', () => {
    expect(RYO_STATS.jumpForwardSpeed).toBeDefined();
    expect(typeof RYO_STATS.jumpForwardSpeed).toBe('number');
  });

  it('run speed is reasonable for KOF', () => {
    // KOF characters typically run at 5-8 pixels/frame
    expect(RYO_STATS.runSpeed).toBeGreaterThanOrEqual(3);
    expect(RYO_STATS.runSpeed).toBeLessThanOrEqual(15);
  });

  it('maxHealth is standard KOF value', () => {
    // KOF standard health is typically 1000 or close
    expect(RYO_STATS.maxHealth).toBeGreaterThanOrEqual(100);
  });

  it('pushWidth is reasonable', () => {
    // Push width typically 20-40 for KOF characters
    expect(RYO_STATS.pushWidth).toBeGreaterThanOrEqual(10);
    expect(RYO_STATS.pushWidth).toBeLessThanOrEqual(60);
  });

  it('hyperJumpVelocity is defined', () => {
    expect(RYO_STATS.hyperJumpVelocity).toBeDefined();
  });
});
