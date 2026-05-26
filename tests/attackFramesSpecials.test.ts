import { describe, it, expect } from 'vitest';
import {
  KYO_75KAI_FRAMES, KYO_RED_KICK_FRAMES, KYO_ARAGAMI_FRAMES,
  RYO_KOOU_FRAMES, RYO_KO_HOU_FRAMES, RYO_HIEN_FRAMES, RYO_HAOU_FRAMES,
} from '../src/core/attackFramesSpecials.js';

describe('attackFramesSpecials', () => {
  it('KYO_75KAI_FRAMES is non-empty array', () => {
    expect(Array.isArray(KYO_75KAI_FRAMES)).toBe(true);
    expect(KYO_75KAI_FRAMES.length).toBeGreaterThan(0);
  });
  it('KYO_RED_KICK_FRAMES is array', () => {
    expect(Array.isArray(KYO_RED_KICK_FRAMES)).toBe(true);
    expect(KYO_RED_KICK_FRAMES.length).toBeGreaterThan(0);
  });
  it('KYO_ARAGAMI_FRAMES is array', () => {
    expect(Array.isArray(KYO_ARAGAMI_FRAMES)).toBe(true);
  });
  it('frames have attack field', () => {
    for (const f of KYO_75KAI_FRAMES) {
      expect(f).toHaveProperty('attack');
      expect(Array.isArray(f.attack)).toBe(true);
    }
  });
  it('RYO_KOOU_FRAMES is non-empty', () => {
    expect(Array.isArray(RYO_KOOU_FRAMES)).toBe(true);
    expect(RYO_KOOU_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_KO_HOU_FRAMES is non-empty', () => {
    expect(Array.isArray(RYO_KO_HOU_FRAMES)).toBe(true);
    expect(RYO_KO_HOU_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_HIEN_FRAMES is non-empty', () => {
    expect(Array.isArray(RYO_HIEN_FRAMES)).toBe(true);
  });
  it('RYO_HAOU_FRAMES is non-empty', () => {
    expect(Array.isArray(RYO_HAOU_FRAMES)).toBe(true);
  });
});
