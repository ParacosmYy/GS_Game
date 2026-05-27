/**
 * Feedback Summary Coverage Test — verifies each character's FEEDBACK_SUMMARY
 * covers all their attack types, and every special/DM/SDM/HSDM is in the right tier.
 */
import { describe, it, expect } from 'vitest';
import { RYO_FEEDBACK_SUMMARY } from '../src/content/characters/ryo/feedback/ryoFeedback.js';
import { KYO_FEEDBACK_SUMMARY } from '../src/content/characters/kyo/feedback/kyoFeedback.js';
import { IORI_FEEDBACK_SUMMARY } from '../src/content/characters/iori/feedback/ioriFeedback.js';

const RYO_SPECIALS = [
  'RYO_KOOU', 'RYO_KOOU_C', 'RYO_KO_HOU', 'RYO_KO_HOU_C',
  'RYO_HIEN', 'RYO_HAOU', 'RYO_TSURIZAO', 'RYO_ORISHI',
  'RYO_KOOUKEN_D', 'RYO_HIO_HACKER', 'RYO_ZANRETSU_KEN',
];

const KYO_SPECIALS = [
  'CMD_GOFU_YOU', 'CMD_88SHIKI', 'CMD_NARAKU',
  'KYO_75KAI', 'KYO_75KAI_2', 'KYO_RED_KICK',
  'KYO_ONIYAKI', 'KYO_ONIYAKI_C',
  'KYO_YAMIBARAI', 'KYO_YAMIBARAI_C',
  'KYO_ARAGAMI', 'KYO_ARAGAMI_KONOKIZU', 'KYO_ARAGAMI_YANOSABI',
  'KYO_NANASE', 'KYO_KOTO_TSUKI', 'KYO_YAKISOGI',
  'KYO_DOKUGAMI', 'KYO_TSUMIYOMI', 'KYO_BATSUYOMI',
];

const IORI_SPECIALS = [
  'IORI_YUMEYUMI', 'IORI_KATANUGI', 'IORI_YUKIWARUI',
  'IORI_YAMIBARAI', 'IORI_YAMIBARAI_C',
  'IORI_ONIYAKI', 'IORI_ONIYAKI_C',
  'IORI_KOTOTSUKI', 'IORI_KOTOTSUKI_D', 'IORI_KUZUKAZE',
  'IORI_AOIHANA', 'IORI_AOIHANA_2', 'IORI_AOIHANA_3',
  'IORI_AOIHANA_C', 'IORI_AOIHANA_C_2', 'IORI_AOIHANA_C_3',
];

describe('Feedback summary coverage', () => {
  it('Ryo special tier covers all 11 specials', () => {
    RYO_SPECIALS.forEach(s => {
      expect(RYO_FEEDBACK_SUMMARY.special).toContain(s);
    });
    expect(RYO_FEEDBACK_SUMMARY.special.length).toBe(11);
  });

  it('Kyo special tier covers all 19 specials + commands', () => {
    KYO_SPECIALS.forEach(s => {
      expect(KYO_FEEDBACK_SUMMARY.special).toContain(s);
    });
    expect(KYO_FEEDBACK_SUMMARY.special.length).toBe(19);
  });

  it('Iori special tier covers all 16 specials + commands', () => {
    IORI_SPECIALS.forEach(s => {
      expect(IORI_FEEDBACK_SUMMARY.special).toContain(s);
    });
    expect(IORI_FEEDBACK_SUMMARY.special.length).toBe(16);
  });

  it('all characters have DM/SDM/HSDM entries', () => {
    expect(RYO_FEEDBACK_SUMMARY.dm.length).toBeGreaterThan(0);
    expect(RYO_FEEDBACK_SUMMARY.sdm.length).toBeGreaterThan(0);
    expect(RYO_FEEDBACK_SUMMARY.hsdm.length).toBeGreaterThan(0);
    expect(KYO_FEEDBACK_SUMMARY.dm.length).toBeGreaterThan(0);
    expect(KYO_FEEDBACK_SUMMARY.sdm.length).toBeGreaterThan(0);
    expect(KYO_FEEDBACK_SUMMARY.hsdm.length).toBeGreaterThan(0);
    expect(IORI_FEEDBACK_SUMMARY.dm.length).toBeGreaterThan(0);
    expect(IORI_FEEDBACK_SUMMARY.sdm.length).toBeGreaterThan(0);
    expect(IORI_FEEDBACK_SUMMARY.hsdm.length).toBeGreaterThan(0);
  });

  it('no overlap between tiers within each character', () => {
    for (const summary of [RYO_FEEDBACK_SUMMARY, KYO_FEEDBACK_SUMMARY, IORI_FEEDBACK_SUMMARY]) {
      const all = [...summary.light, ...summary.heavy, ...summary.special, ...summary.dm, ...summary.sdm, ...summary.hsdm];
      const unique = new Set(all);
      expect(all.length).toBe(unique.size);
    }
  });

  it('Ryo DM/SDM/HSDM are distinct', () => {
    const dmSet = new Set(RYO_FEEDBACK_SUMMARY.dm);
    const sdmSet = new Set(RYO_FEEDBACK_SUMMARY.sdm);
    const hsdmSet = new Set(RYO_FEEDBACK_SUMMARY.hsdm);
    // No overlap between dm, sdm, hsdm
    for (const d of dmSet) {
      expect(sdmSet.has(d)).toBe(false);
      expect(hsdmSet.has(d)).toBe(false);
    }
  });
});
