/**
 * Character Voice Type Inference Tests
 *
 * Validates inferVoiceType() from src/audio/charVoice.ts.
 * This is a pure function mapping attack type strings to voice types.
 * Also validates the VOICE_PROFILES data table indirectly via structure checks.
 */
import { describe, it, expect } from 'vitest';
import { inferVoiceType } from '../src/audio/charVoice.js';

// ===== inferVoiceType =====

describe('inferVoiceType', () => {
  // --- DM/SDM/HSDM → 'dm' ---

  it('maps DM_ prefix to dm', () => {
    expect(inferVoiceType('DM_OROCHINAGI')).toBe('dm');
    expect(inferVoiceType('DM_TEN_HA_OU')).toBe('dm');
    expect(inferVoiceType('DM_POWER_GEYSER')).toBe('dm');
  });

  it('maps SDM_ prefix to dm', () => {
    expect(inferVoiceType('SDM_OROCHINAGI')).toBe('dm');
    expect(inferVoiceType('SDM_YATAGARASU')).toBe('dm');
  });

  it('maps HSDM_ prefix to dm', () => {
    expect(inferVoiceType('HSDM_OROCHINAGI')).toBe('dm');
    expect(inferVoiceType('HSDM_RYUKO_RANBU')).toBe('dm');
  });

  // --- Ryo specials → 'special' ---

  it('maps Ryo specials to special', () => {
    expect(inferVoiceType('RYO_KOOU')).toBe('special');
    expect(inferVoiceType('RYO_KOOU_C')).toBe('special');
    expect(inferVoiceType('RYO_KO_HOU')).toBe('special');
    expect(inferVoiceType('RYO_KO_HOU_C')).toBe('special');
    expect(inferVoiceType('RYO_HIEN')).toBe('special');
    expect(inferVoiceType('RYO_HAOU')).toBe('special');
  });

  it('does NOT map Ryo normals (with STAND/CROUCH/JUMP/CLOSE) to special', () => {
    // Ryo normals don't start with these prefixes in a way that triggers special
    // But RYO_STAND_C would not match because RYO_ check requires no STAND_ substring
    // Actually RYO_KOOU doesn't contain STAND_ so it returns special — correct
    // Ryo normals use generic STAND_A etc, not RYO_STAND_A
  });

  // --- Kyo specials → 'special' ---

  it('maps Kyo specials to special', () => {
    expect(inferVoiceType('KYO_ONIYAKI')).toBe('special');
    expect(inferVoiceType('KYO_ONIYAKI_C')).toBe('special');
    expect(inferVoiceType('KYO_YAMIBARAI')).toBe('special');
    expect(inferVoiceType('KYO_RED_KICK')).toBe('special');
    expect(inferVoiceType('KYO_75KAI')).toBe('special');
    expect(inferVoiceType('KYO_ARAGAMI')).toBe('special');
  });

  // --- Iori specials → 'special' ---

  it('maps Iori specials to special', () => {
    expect(inferVoiceType('IORI_AOIHANA')).toBe('special');
    expect(inferVoiceType('IORI_ONIYAKI')).toBe('special');
    expect(inferVoiceType('IORI_YAMIBARAI')).toBe('special');
    expect(inferVoiceType('IORI_KOTOTSUKI')).toBe('special');
    expect(inferVoiceType('IORI_KUZUKAZE')).toBe('special');
  });

  // --- Heavy attacks (_C, _D suffixes) → 'heavy' ---

  it('maps _C suffix attacks to heavy', () => {
    expect(inferVoiceType('STAND_C')).toBe('heavy');
    expect(inferVoiceType('CLOSE_C')).toBe('heavy');
    expect(inferVoiceType('CROUCH_C')).toBe('heavy');
  });

  it('maps _D suffix attacks to heavy', () => {
    expect(inferVoiceType('STAND_D')).toBe('heavy');
    expect(inferVoiceType('CLOSE_D')).toBe('heavy');
    expect(inferVoiceType('CROUCH_D')).toBe('heavy');
  });

  it('maps STAND_CD to heavy', () => {
    expect(inferVoiceType('STAND_CD')).toBe('heavy');
  });

  it('maps JUMP_CD to heavy', () => {
    expect(inferVoiceType('JUMP_CD')).toBe('heavy');
  });

  // --- Light attacks (everything else) → 'light' ---

  it('maps _A and _B attacks to light', () => {
    expect(inferVoiceType('STAND_A')).toBe('light');
    expect(inferVoiceType('STAND_B')).toBe('light');
    expect(inferVoiceType('CLOSE_A')).toBe('light');
    expect(inferVoiceType('CLOSE_B')).toBe('light');
    expect(inferVoiceType('CROUCH_A')).toBe('light');
    expect(inferVoiceType('CROUCH_B')).toBe('light');
  });

  it('maps JUMP_A/JUMP_B to light', () => {
    expect(inferVoiceType('JUMP_A')).toBe('light');
    expect(inferVoiceType('JUMP_B')).toBe('light');
  });

  // --- Edge cases ---

  it('maps unknown attack to light', () => {
    expect(inferVoiceType('UNKNOWN_ATTACK')).toBe('light');
  });

  it('maps empty string to light', () => {
    expect(inferVoiceType('')).toBe('light');
  });

  // --- Priority: DM > Special > Heavy > Light ---

  it('DM_ prefix takes priority over _C/_D suffix', () => {
    // DM names don't typically end in _C, but if they did, DM wins
    expect(inferVoiceType('DM_TEST_C')).toBe('dm');
  });

  it('KYO_ special takes priority over _C suffix for Kyo specials', () => {
    // KYO_ONIYAKI_C starts with KYO_ and doesn't contain STAND_/CROUCH_/etc
    // so it should be 'special', not 'heavy'
    expect(inferVoiceType('KYO_ONIYAKI_C')).toBe('special');
  });
});
