/**
 * charVoice — inferVoiceType Pure Function Tests
 *
 * inferVoiceType maps attack type strings to voice categories.
 * No mocking needed — entirely string-based logic.
 */
import { describe, it, expect } from 'vitest';
import { inferVoiceType } from '../src/audio/charVoice.js';

// ===== DM / SDM / HSDM =====

describe('inferVoiceType — DM tier', () => {
  it('HSDM_ prefix returns dm', () => {
    expect(inferVoiceType('HSDM_RYUKO_RANBU')).toBe('dm');
  });

  it('SDM_ prefix returns dm', () => {
    expect(inferVoiceType('SDM_OROCHINAGI')).toBe('dm');
    expect(inferVoiceType('SDM_YATAGARASU')).toBe('dm');
  });

  it('DM_ prefix returns dm', () => {
    expect(inferVoiceType('DM_OROCHINAGI')).toBe('dm');
    expect(inferVoiceType('DM_POWER_GEYSER')).toBe('dm');
    expect(inferVoiceType('DM_TEN_HA_OU')).toBe('dm');
  });
});

// ===== Character-specific specials =====

describe('inferVoiceType — character specials', () => {
  it('RYO_KOOU prefix returns special', () => {
    expect(inferVoiceType('RYO_KOOU')).toBe('special');
    expect(inferVoiceType('RYO_KOOU_KEN')).toBe('special');
  });

  it('RYO_KO_HOU prefix returns special', () => {
    expect(inferVoiceType('RYO_KO_HOU')).toBe('special');
  });

  it('RYO_HIEN prefix returns special', () => {
    expect(inferVoiceType('RYO_HIEN')).toBe('special');
    expect(inferVoiceType('RYO_HIEN_ZAN')).toBe('special');
  });

  it('RYO_HAOU prefix returns special', () => {
    expect(inferVoiceType('RYO_HAOU')).toBe('special');
    expect(inferVoiceType('RYO_HAOU_SHOUKO')).toBe('special');
  });

  it('KYO_ prefix (non-normal) returns special', () => {
    expect(inferVoiceType('KYO_ONIYAKI')).toBe('special');
    expect(inferVoiceType('KYO_YAMIBARAI')).toBe('special');
    expect(inferVoiceType('KYO_ARAGAMI')).toBe('special');
    expect(inferVoiceType('KYO_RED_KICK')).toBe('special');
  });

  it('IORI_ prefix (non-normal) returns special', () => {
    expect(inferVoiceType('IORI_ONIYAKI')).toBe('special');
    expect(inferVoiceType('IORI_AOIHANA')).toBe('special');
    expect(inferVoiceType('IORI_YAMIBARAI')).toBe('special');
    expect(inferVoiceType('IORI_KOTOTSUKI')).toBe('special');
  });

  it('KYO_/IORI_ with STAND_ falls through to heavy/light', () => {
    expect(inferVoiceType('KYO_STAND_A')).toBe('light');
    expect(inferVoiceType('IORI_STAND_C')).toBe('heavy');
  });

  it('KYO_/IORI_ with CROUCH_ falls through', () => {
    expect(inferVoiceType('KYO_CROUCH_B')).toBe('light');
    expect(inferVoiceType('IORI_CROUCH_D')).toBe('heavy');
  });

  it('KYO_/IORI_ with JUMP_ falls through', () => {
    expect(inferVoiceType('KYO_JUMP_A')).toBe('light');
    expect(inferVoiceType('IORI_JUMP_D')).toBe('heavy');
  });

  it('KYO_/IORI_ with CLOSE_ falls through', () => {
    expect(inferVoiceType('KYO_CLOSE_A')).toBe('light');
    expect(inferVoiceType('IORI_CLOSE_C')).toBe('heavy');
  });
});

// ===== Heavy detection =====

describe('inferVoiceType — heavy', () => {
  it('_C suffix returns heavy', () => {
    expect(inferVoiceType('STAND_C')).toBe('heavy');
    expect(inferVoiceType('CROUCH_C')).toBe('heavy');
    expect(inferVoiceType('JUMP_C')).toBe('heavy');
    expect(inferVoiceType('CLOSE_C')).toBe('heavy');
  });

  it('_D suffix returns heavy', () => {
    expect(inferVoiceType('STAND_D')).toBe('heavy');
    expect(inferVoiceType('CROUCH_D')).toBe('heavy');
    expect(inferVoiceType('JUMP_D')).toBe('heavy');
    expect(inferVoiceType('CLOSE_D')).toBe('heavy');
  });

  it('STAND_CD returns heavy', () => {
    expect(inferVoiceType('STAND_CD')).toBe('heavy');
  });

  it('JUMP_CD returns heavy', () => {
    expect(inferVoiceType('JUMP_CD')).toBe('heavy');
  });
});

// ===== Light detection =====

describe('inferVoiceType — light', () => {
  it('_A suffix returns light', () => {
    expect(inferVoiceType('STAND_A')).toBe('light');
    expect(inferVoiceType('CROUCH_A')).toBe('light');
    expect(inferVoiceType('JUMP_A')).toBe('light');
    expect(inferVoiceType('CLOSE_A')).toBe('light');
  });

  it('_B suffix returns light', () => {
    expect(inferVoiceType('STAND_B')).toBe('light');
    expect(inferVoiceType('CROUCH_B')).toBe('light');
    expect(inferVoiceType('JUMP_B')).toBe('light');
    expect(inferVoiceType('CLOSE_B')).toBe('light');
  });

  it('unknown attack type returns light', () => {
    expect(inferVoiceType('UNKNOWN')).toBe('light');
    expect(inferVoiceType('')).toBe('light');
  });
});

// ===== Priority ordering =====

describe('inferVoiceType — priority ordering', () => {
  it('DM prefix takes priority over character prefix', () => {
    expect(inferVoiceType('DM_KYO_SOMETHING')).toBe('dm');
    expect(inferVoiceType('SDM_IORI_ATTACK')).toBe('dm');
  });

  it('Special takes priority over heavy/light', () => {
    expect(inferVoiceType('KYO_ONIYAKI_C')).toBe('special');
    expect(inferVoiceType('IORI_AOIHANA_D')).toBe('special');
  });
});
