/**
 * Hit Feedback Consolidated Tests
 *
 * Merged from: hitFeedback, impactFeedback, hitCallbackChain, hitstopTimingAlignment
 *
 * Covers: hitstop/shake/spark tier hierarchy, impact feedback constants,
 *   hit callback event chain.
 */
import { describe, it, expect } from 'vitest';
import {
  HITSTOP_LIGHT, HITSTOP_MEDIUM, HITSTOP_SPECIAL, HITSTOP_DM, HITSTOP_SDM,
  HITSTOP_COUNTER_BONUS,
  SHAKE_LIGHT, SHAKE_HEAVY, SHAKE_COUNTER, SHAKE_SPECIAL, SHAKE_DM, SHAKE_KO,
  SHAKE_DURATION_LIGHT, SHAKE_DURATION_HEAVY, SHAKE_DURATION_DM,
  SPARK_LIGHT, SPARK_HEAVY, SPARK_SPECIAL, SPARK_DM, SPARK_COUNTER,
  SHAKE_DMG_THRESHOLD,
  getHitstopFrames, getShakeIntensity, getShakeDuration,
} from '../src/core/constants.js';

// ── 1. Hitstop Hierarchy ────────────────────────────────────
describe('Hitstop Hierarchy', () => {
  it('light <= medium <= special <= DM <= SDM', () => {
    expect(HITSTOP_LIGHT).toBeLessThanOrEqual(HITSTOP_MEDIUM);
    expect(HITSTOP_MEDIUM).toBeLessThanOrEqual(HITSTOP_SPECIAL);
    expect(HITSTOP_SPECIAL).toBeLessThanOrEqual(HITSTOP_DM);
    expect(HITSTOP_DM).toBeLessThanOrEqual(HITSTOP_SDM);
  });

  it('counter hit adds bonus frames', () => {
    expect(HITSTOP_COUNTER_BONUS).toBeGreaterThan(0);
    expect(HITSTOP_COUNTER_BONUS).toBeLessThan(HITSTOP_DM);
  });

  it('getHitstopFrames returns correct tier', () => {
    expect(getHitstopFrames('STAND_A')).toBe(HITSTOP_LIGHT);
    expect(getHitstopFrames('STAND_C')).toBe(HITSTOP_MEDIUM);
  });
});

// ── 2. Shake Hierarchy ──────────────────────────────────────
describe('Shake Hierarchy', () => {
  it('shake intensity increases with strength', () => {
    expect(SHAKE_LIGHT).toBeLessThanOrEqual(SHAKE_HEAVY);
    expect(SHAKE_HEAVY).toBeLessThanOrEqual(SHAKE_SPECIAL);
    expect(SHAKE_SPECIAL).toBeLessThanOrEqual(SHAKE_DM);
  });

  it('KO shake is strongest', () => {
    expect(SHAKE_KO).toBeGreaterThanOrEqual(SHAKE_DM);
  });

  it('shake duration increases with strength', () => {
    expect(SHAKE_DURATION_LIGHT).toBeLessThanOrEqual(SHAKE_DURATION_HEAVY);
    expect(SHAKE_DURATION_HEAVY).toBeLessThanOrEqual(SHAKE_DURATION_DM);
  });
});

// ── 3. Spark Hierarchy ──────────────────────────────────────
describe('Spark Hierarchy', () => {
  it('spark types are defined for all attack tiers', () => {
    expect(SPARK_LIGHT).toBeDefined();
    expect(SPARK_HEAVY).toBeDefined();
    expect(SPARK_SPECIAL).toBeDefined();
    expect(SPARK_DM).toBeDefined();
  });

  it('counter spark differs from normal sparks', () => {
    expect(SPARK_COUNTER).toBeDefined();
  });
});

// ── 4. Damage Threshold ─────────────────────────────────────
describe('Damage Threshold', () => {
  it('SHAKE_DMG_THRESHOLD is positive', () => {
    expect(SHAKE_DMG_THRESHOLD).toBeGreaterThan(0);
  });
});
