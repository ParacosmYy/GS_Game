/**
 * Voice Type Inference Regression Tests
 *
 * Validates inferVoiceType() mapping from AttackType strings to voice types.
 * Pure function — no AudioContext needed.
 */
import { describe, it, expect } from 'vitest';
import { inferVoiceType } from '../src/audio/charVoice.js';

describe('inferVoiceType', () => {
  // DM/SDM/HSDM → 'dm'
  it('HSDM maps to dm', () => {
    expect(inferVoiceType('HSDM_OROCHINAGI')).toBe('dm');
    expect(inferVoiceType('HSDM_YAOTOME')).toBe('dm');
    expect(inferVoiceType('HSDM_RYUKO_RANBU')).toBe('dm');
  });

  it('SDM maps to dm', () => {
    expect(inferVoiceType('SDM_OROCHINAGI')).toBe('dm');
    expect(inferVoiceType('SDM_YATAGARASU')).toBe('dm');
  });

  it('DM maps to dm', () => {
    expect(inferVoiceType('DM_OROCHINAGI')).toBe('dm');
    expect(inferVoiceType('DM_YATAGARASU')).toBe('dm');
    expect(inferVoiceType('DM_TEN_HA_OU')).toBe('dm');
  });

  // Kyo specials → 'special'
  it('Kyo specials map to special', () => {
    expect(inferVoiceType('KYO_ONIYAKI')).toBe('special');
    expect(inferVoiceType('KYO_ONIYAKI_C')).toBe('special');
    expect(inferVoiceType('KYO_YAMIBARAI')).toBe('special');
    expect(inferVoiceType('KYO_75KAI')).toBe('special');
    expect(inferVoiceType('KYO_RED_KICK')).toBe('special');
    expect(inferVoiceType('KYO_ARAGAMI')).toBe('special');
    expect(inferVoiceType('KYO_DOKUGAMI')).toBe('special');
  });

  // Iori specials → 'special'
  it('Iori specials map to special', () => {
    expect(inferVoiceType('IORI_ONIYAKI')).toBe('special');
    expect(inferVoiceType('IORI_YAMIBARAI')).toBe('special');
    expect(inferVoiceType('IORI_AOIHANA')).toBe('special');
    expect(inferVoiceType('IORI_KUZUKAZE')).toBe('special');
    expect(inferVoiceType('IORI_KOTOTSUKI')).toBe('special');
  });

  // Ryo specials → 'special'
  it('Ryo specials map to special', () => {
    expect(inferVoiceType('RYO_KOOU')).toBe('special');
    expect(inferVoiceType('RYO_KO_HOU')).toBe('special');
    expect(inferVoiceType('RYO_HIEN')).toBe('special');
    expect(inferVoiceType('RYO_HAOU')).toBe('special');
  });

  it('Ryo specials not in prefix list fall to light', () => {
    // RYO_ZANRETSU_KEN doesn't start with any of the listed Ryo prefixes
    expect(inferVoiceType('RYO_ZANRETSU_KEN')).toBe('light');
  });

  // Kyo normals that start with KYO_ but contain STAND/CROUCH → light
  it('Kyo normals with KYO_ prefix but containing STAND/CROUCH fall to light', () => {
    expect(inferVoiceType('KYO_STAND_A')).toBe('light');
    expect(inferVoiceType('KYO_CROUCH_A')).toBe('light');
  });

  // Heavy normals → 'heavy'
  it('_C suffix maps to heavy', () => {
    expect(inferVoiceType('STAND_C')).toBe('heavy');
    expect(inferVoiceType('CROUCH_C')).toBe('heavy');
  });

  it('_D suffix maps to heavy', () => {
    expect(inferVoiceType('STAND_D')).toBe('heavy');
    expect(inferVoiceType('CROUCH_D')).toBe('heavy');
  });

  it('CD blowback maps to heavy', () => {
    expect(inferVoiceType('STAND_CD')).toBe('heavy');
    expect(inferVoiceType('JUMP_CD')).toBe('heavy');
  });

  // Light normals → 'light'
  it('A button normals map to light', () => {
    expect(inferVoiceType('STAND_A')).toBe('light');
    expect(inferVoiceType('CROUCH_A')).toBe('light');
    expect(inferVoiceType('CLOSE_A')).toBe('light');
    expect(inferVoiceType('JUMP_A')).toBe('light');
  });

  it('B button normals map to light', () => {
    expect(inferVoiceType('STAND_B')).toBe('light');
    expect(inferVoiceType('CROUCH_B')).toBe('light');
    expect(inferVoiceType('CLOSE_B')).toBe('light');
    expect(inferVoiceType('JUMP_B')).toBe('light');
  });

  it('unknown attack defaults to light', () => {
    expect(inferVoiceType('UNKNOWN_ATTACK')).toBe('light');
  });

  it('empty string defaults to light', () => {
    expect(inferVoiceType('')).toBe('light');
  });

  // DM prefix takes priority over KYO_ prefix
  it('DM_ prefix has priority over KYO_ prefix', () => {
    expect(inferVoiceType('DM_OROCHINAGI')).toBe('dm');
  });

  it('SDM_ prefix has priority over KYO_ prefix', () => {
    expect(inferVoiceType('SDM_OROCHINAGI')).toBe('dm');
  });
});
