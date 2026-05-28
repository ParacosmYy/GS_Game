/**
 * Pixel Frame Supplement Tests — additional exports not covered in main frame tests
 *
 * Covers: Kyo rekka chain (aragami, dokugami) + DM/SDM orochinagi,
 * Iori rekka chain (aoihana 2/3, kototsuki, kuzukaze),
 * Ryo KO_HOU_C special.
 */
import { describe, it, expect } from 'vitest';
import type { PixelFrame } from '../src/rendering/sprites/kyo/kyoIdleFrames.js';
import { KYO_ARAGAMI_FRAMES, KYO_DOKUGAMI_FRAMES, KYO_OROCHINAGI_DM_FRAMES, KYO_OROCHINAGI_SDM_FRAMES } from '../src/rendering/sprites/kyo/kyoSpecialFrames.js';
import { IORI_AOIHANA_2_FRAMES, IORI_AOIHANA_3_FRAMES, IORI_KOTOTSUKI_FRAMES, IORI_KUZUKAZE_FRAMES } from '../src/rendering/sprites/iori/ioriSpecialFrames.js';
import { RYO_KO_HOU_C_FRAMES } from '../src/rendering/sprites/ryo/ryoSpecialFrames.js';

function v(frames: PixelFrame[], label: string) {
  it(`${label} has valid structure`, () => {
    expect(frames.length).toBeGreaterThan(0);
    for (let i = 0; i < frames.length; i++) {
      expect(frames[i].width, `${label}[${i}].width`).toBeGreaterThan(0);
      expect(frames[i].height, `${label}[${i}].height`).toBeGreaterThan(0);
      expect(frames[i].palette, `${label}[${i}].palette`).toBeDefined();
      expect(frames[i].pixels.length, `${label}[${i}].rows`).toBeGreaterThan(0);
    }
  });
}

// ===== Kyo Rekka Chain =====

describe('KYO_ARAGAMI_FRAMES', () => { v(KYO_ARAGAMI_FRAMES, 'KYO_ARA'); });
describe('KYO_DOKUGAMI_FRAMES', () => { v(KYO_DOKUGAMI_FRAMES, 'KYO_DOK'); });
describe('KYO_OROCHINAGI_DM_FRAMES', () => { v(KYO_OROCHINAGI_DM_FRAMES, 'KYO_DM_ORO'); });
describe('KYO_OROCHINAGI_SDM_FRAMES', () => {
  it('SDM has >= DM frames', () => {
    expect(KYO_OROCHINAGI_SDM_FRAMES.length).toBeGreaterThanOrEqual(KYO_OROCHINAGI_DM_FRAMES.length);
  });
  v(KYO_OROCHINAGI_SDM_FRAMES, 'KYO_SDM_ORO');
});

// ===== Iori Rekka Chain =====

describe('IORI_AOIHANA_2_FRAMES', () => { v(IORI_AOIHANA_2_FRAMES, 'IORI_AOI2'); });
describe('IORI_AOIHANA_3_FRAMES', () => { v(IORI_AOIHANA_3_FRAMES, 'IORI_AOI3'); });
describe('IORI_KOTOTSUKI_FRAMES', () => { v(IORI_KOTOTSUKI_FRAMES, 'IORI_KOT'); });
describe('IORI_KUZUKAZE_FRAMES', () => { v(IORI_KUZUKAZE_FRAMES, 'IORI_KZ'); });

// ===== Ryo Special =====

describe('RYO_KO_HOU_C_FRAMES', () => { v(RYO_KO_HOU_C_FRAMES, 'RYO_KHC'); });
