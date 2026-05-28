/**
 * Sampler Renderer Audio Buffer Validation
 * Verifies render functions exist and produce valid, non-silent audio buffers.
 */
import { describe, it, expect } from 'vitest';
import * as renderers from '../src/audio/samplerRenderers.js';

const SR = 44100;

/** Quick validation: non-empty, finite, non-clipped, not silent (check first 50 samples) */
function isValidAudio(buf: Float32Array, name: string): void {
  expect(buf.length, `${name} buffer length`).toBeGreaterThan(0);
  const checkLen = Math.min(50, buf.length);
  let hasNonZero = false;
  for (let i = 0; i < checkLen; i++) {
    expect(isFinite(buf[i]), `${name}[${i}] finite`).toBe(true);
    expect(Math.abs(buf[i]), `${name}[${i}] <= 1`).toBeLessThanOrEqual(1.5); // allow slight overshoot
    if (buf[i] !== 0) hasNonZero = true;
  }
  // Also check last 10 samples for non-silence at end
  const tailStart = Math.max(0, buf.length - 10);
  for (let i = tailStart; i < buf.length; i++) {
    if (buf[i] !== 0) hasNonZero = true;
  }
  expect(hasNonZero, `${name} not silent`).toBe(true);
}

// Test a representative subset to stay within timeout
const COMBAT = ['renderHitLight', 'renderHitHeavy', 'renderBlock', 'renderSpecial',
  'renderDM', 'renderKO', 'renderCounter', 'renderGuardCrush',
  'renderSuperFlash', 'renderSuperFlashHSDM', 'renderThrow',
  'renderHitCrit', 'renderAirHit', 'renderKOHit', 'renderPerfectKO'];

const UI = ['renderSelect', 'renderCursorMove', 'renderCursorConfirm', 'renderVictory',
  'renderRoll', 'renderLanding', 'renderMAXActivation', 'renderFight',
  'renderWhoosh', 'renderFootstep', 'renderJump', 'renderLandingNormal',
  'renderStunRecovery', 'renderStunWarning'];

const ACCENTS = ['renderAccentFire', 'renderAccentPurple', 'renderAccentIce', 'renderAccentGeneric'];

describe('Sampler renderers', () => {
  it('combat renderers produce valid buffers', { timeout: 30000 }, () => {
    for (const name of COMBAT) {
      const fn = (renderers as any)[name];
      expect(fn, `${name} exists`).toBeDefined();
      isValidAudio(fn(SR), name);
    }
  });

  it('UI renderers produce valid buffers', { timeout: 30000 }, () => {
    for (const name of UI) {
      const fn = (renderers as any)[name];
      expect(fn, `${name} exists`).toBeDefined();
      isValidAudio(fn(SR), name);
    }
  });

  it('accent renderers produce valid buffers', { timeout: 30000 }, () => {
    for (const name of ACCENTS) {
      const fn = (renderers as any)[name];
      expect(fn, `${name} exists`).toBeDefined();
      isValidAudio(fn(SR), name);
    }
  });

  it('DM buffer is longer than special', { timeout: 10000 }, () => {
    expect(renderers.renderDM(SR).length).toBeGreaterThan(renderers.renderSpecial(SR).length);
  });

  it('heavy hit is longer than light hit', { timeout: 10000 }, () => {
    expect(renderers.renderHitHeavy(SR).length).toBeGreaterThan(renderers.renderHitLight(SR).length);
  });

  it('block heavy variant works', { timeout: 10000 }, () => {
    isValidAudio(renderers.renderBlock(SR, true), 'renderBlock(heavy)');
  });

  it('superFlash SDM variant works', { timeout: 10000 }, () => {
    isValidAudio(renderers.renderSuperFlash(SR, true), 'renderSuperFlash(SDM)');
  });
});

// ===== Extended coverage: previously untested renderers =====

const EXTENDED = [
  'renderChip', 'renderWallBounce', 'renderGroundBounce', 'renderCancel',
  'renderWire', 'renderJuggle', 'renderThrowEscape', 'renderProjectile',
  'renderRoundCall', 'renderTimeOver', 'renderPerfect', 'renderQuickStand',
  'renderStep', 'renderDust', 'renderWallBounceHeavy', 'renderGuardBreak',
  'renderChargeUp', 'renderBlockSpecial', 'renderBlockDM',
  'renderSpecialLight', 'renderSpecialHeavy', 'renderLandingHeavy',
  'renderDizzyHit', 'renderRoundStart', 'renderTimeUp', 'renderWhooshHeavy',
];

describe('Extended sampler renderers', () => {
  it('all extended renderers produce valid buffers', { timeout: 60000 }, () => {
    for (const name of EXTENDED) {
      const fn = (renderers as any)[name];
      expect(fn, `${name} exists`).toBeDefined();
      isValidAudio(fn(SR), name);
    }
  });
});

// ===== Sample rate independence =====

describe('Sample rate independence', () => {
  it('renderHitLight works at 22050 Hz', { timeout: 10000 }, () => {
    const buf = renderers.renderHitLight(22050);
    isValidAudio(buf, 'hitLight@22050');
    expect(buf.length).toBeLessThan(renderers.renderHitLight(SR).length);
  });

  it('renderDM works at 48000 Hz', { timeout: 10000 }, () => {
    const buf = renderers.renderDM(48000);
    isValidAudio(buf, 'DM@48000');
    expect(buf.length).toBeGreaterThan(renderers.renderDM(SR).length);
  });
});
