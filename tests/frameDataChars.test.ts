import { describe, it, expect } from 'vitest';
import { FRAME_DATA_CHARS } from '../src/core/frameDataChars.js';

describe('frameDataChars', () => {
  it('FRAME_DATA_CHARS is object', () => {
    expect(FRAME_DATA_CHARS).toBeDefined();
    expect(typeof FRAME_DATA_CHARS).toBe('object');
  });
  it('has KYO keys', () => {
    const keys = Object.keys(FRAME_DATA_CHARS);
    const kyoKeys = keys.filter(k => k.startsWith('KYO_'));
    expect(kyoKeys.length).toBeGreaterThan(0);
  });
  it('has RYO keys', () => {
    const keys = Object.keys(FRAME_DATA_CHARS);
    const ryoKeys = keys.filter(k => k.startsWith('RYO_'));
    expect(ryoKeys.length).toBeGreaterThan(0);
  });
  it('has IORI keys', () => {
    const keys = Object.keys(FRAME_DATA_CHARS);
    const ioriKeys = keys.filter(k => k.startsWith('IORI_'));
    expect(ioriKeys.length).toBeGreaterThan(0);
  });
  it('entries have startup field', () => {
    for (const val of Object.values(FRAME_DATA_CHARS) as Record<string, unknown>[]) {
      expect(val).toHaveProperty('startup');
      expect(typeof val.startup).toBe('number');
    }
  });
  it('entries have damage field', () => {
    for (const val of Object.values(FRAME_DATA_CHARS) as Record<string, unknown>[]) {
      expect(val).toHaveProperty('damage');
    }
  });
});
