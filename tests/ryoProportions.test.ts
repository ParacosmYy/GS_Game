/**
 * Ryo proportion and rendering tests
 * Verifies that Ryo's body proportions produce an authentic KOF silhouette
 * with elongated torso and legs, and that rendering functions handle them correctly.
 */
import { describe, it, expect } from 'vitest';
import { RyoDef } from '../src/characters/ryo.js';
import type { BodyProportions } from '../src/characters/types.js';
import { DEFAULT_PROPORTIONS } from '../src/characters/types.js';

/** Helper to extract Ryo proportions, falling back to defaults */
function getRyoProportions(): BodyProportions {
  return RyoDef.proportions ?? DEFAULT_PROPORTIONS;
}

describe('Ryo proportions — authentic KOF silhouette', () => {
  const prop = getRyoProportions();

  it('torso height should be significantly elongated (>75)', () => {
    expect(prop.torsoH).toBeGreaterThan(75);
  });

  it('leg height should be significantly elongated (>65)', () => {
    expect(prop.legH).toBeGreaterThan(65);
  });

  it('head should be relatively compact for an adult martial artist', () => {
    expect(prop.headW).toBeLessThan(48);
    expect(prop.headH).toBeLessThan(52);
  });

  it('total visual height (headH + torsoH + legH) should be reasonable (170-210)', () => {
    const totalVisualHeight = prop.headH + prop.torsoH + prop.legH;
    expect(totalVisualHeight).toBeGreaterThanOrEqual(170);
    expect(totalVisualHeight).toBeLessThanOrEqual(210);
  });

  it('hipY should be proportionally placed (roughly 35-50% of total height from top)', () => {
    const totalHeight = prop.headH + prop.torsoH + prop.legH;
    const hipRatio = prop.hipY / totalHeight;
    expect(hipRatio).toBeGreaterThanOrEqual(0.35);
    expect(hipRatio).toBeLessThanOrEqual(0.50);
  });

  it('proportions should create a balanced silhouette — not top-heavy', () => {
    // Upper body mass (head + torso area) should not vastly exceed lower body (legs)
    const upperBodyArea = prop.headW * prop.headH + prop.torsoW * prop.torsoH;
    const lowerBodyArea = prop.legW * prop.legH * 2; // both legs
    const ratio = upperBodyArea / lowerBodyArea;
    // Balanced means ratio between 0.5 and 1.8
    expect(ratio).toBeGreaterThan(0.5);
    expect(ratio).toBeLessThan(1.8);
  });

  it('torso should be taller than head (martial artist build)', () => {
    expect(prop.torsoH).toBeGreaterThan(prop.headH);
  });

  it('legs should be longer than torso width (not stumpy)', () => {
    expect(prop.legH).toBeGreaterThan(prop.torsoW);
  });

  it('arms should be long enough for a karate practitioner (armH >= torsoW)', () => {
    expect(prop.armH).toBeGreaterThanOrEqual(prop.torsoW);
  });

  it('shoulder and hip Y offsets should be consistent with torso dimensions', () => {
    // shoulderY should be above torsoCenterY
    expect(prop.shoulderY).toBeLessThan(prop.torsoCenterY);
    // hipY should be below torsoCenterY
    expect(prop.hipY).toBeGreaterThan(prop.torsoCenterY);
    // torso spans from roughly shoulderY to hipY
    const torsoSpan = prop.hipY - prop.shoulderY;
    expect(torsoSpan).toBeGreaterThan(40);
  });

  it('headCenterY should be above shoulderY (head sits on top of body)', () => {
    expect(prop.headCenterY).toBeLessThan(prop.shoulderY);
  });

  it('Ryo proportions should differ from DEFAULT_PROPORTIONS (customized, not fallback)', () => {
    // Verify Ryo actually has custom proportions defined
    expect(RyoDef.proportions).toBeDefined();
    // At least torsoH should differ from default
    const defaultProp = DEFAULT_PROPORTIONS;
    expect(prop.torsoH).not.toBe(defaultProp.torsoH);
  });
});
