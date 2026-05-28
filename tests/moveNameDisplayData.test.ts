/**
 * Move Name Display & Stage Accent Data Tests
 *
 * Validates CN_MOVE_NAMES, CHAR_COLORS from moveNameDisplay.ts
 * and getStageAccent from overlayStageIntro.ts.
 */
import { describe, it, expect } from 'vitest';
import { CN_MOVE_NAMES, CHAR_COLORS } from '../src/rendering/moveNameDisplay.js';
import { getStageAccent } from '../src/rendering/overlays/overlayStageIntro.js';

// ===== CN_MOVE_NAMES =====

describe('CN_MOVE_NAMES', () => {
  it('is a non-empty record', () => {
    expect(Object.keys(CN_MOVE_NAMES).length).toBeGreaterThan(0);
  });

  it('all values are non-empty strings', () => {
    for (const [key, value] of Object.entries(CN_MOVE_NAMES)) {
      expect(value.length, `${key} value`).toBeGreaterThan(0);
    }
  });

  it('contains Ryo specials', () => {
    expect(CN_MOVE_NAMES.RYO_KOOU).toBeDefined();
    expect(CN_MOVE_NAMES.RYO_KO_HOU).toBeDefined();
    expect(CN_MOVE_NAMES.RYO_HIEN).toBeDefined();
    expect(CN_MOVE_NAMES.RYO_HAOU).toBeDefined();
  });

  it('contains Kyo specials', () => {
    expect(CN_MOVE_NAMES.KYO_YAMIBARAI).toBeDefined();
    expect(CN_MOVE_NAMES.KYO_ONIYAKI).toBeDefined();
    expect(CN_MOVE_NAMES.KYO_ARAGAMI).toBeDefined();
    expect(CN_MOVE_NAMES.KYO_DOKUGAMI).toBeDefined();
  });

  it('contains Iori specials', () => {
    expect(CN_MOVE_NAMES.IORI_YAMIBARAI).toBeDefined();
    expect(CN_MOVE_NAMES.IORI_ONIYAKI).toBeDefined();
    expect(CN_MOVE_NAMES.IORI_AOIHANA).toBeDefined();
    expect(CN_MOVE_NAMES.IORI_KOTOTSUKI).toBeDefined();
    expect(CN_MOVE_NAMES.IORI_KUZUKAZE).toBeDefined();
  });

  it('contains DMs for all 3 characters', () => {
    expect(CN_MOVE_NAMES.DM_TEN_HA_OU).toBeDefined();
    expect(CN_MOVE_NAMES.DM_OROCHINAGI).toBeDefined();
    expect(CN_MOVE_NAMES.DM_YATAGARASU).toBeDefined();
  });

  it('contains SDMs', () => {
    expect(CN_MOVE_NAMES.SDM_TEN_HA_OU).toBeDefined();
    expect(CN_MOVE_NAMES.SDM_OROCHINAGI).toBeDefined();
    expect(CN_MOVE_NAMES.SDM_YATAGARASU).toBeDefined();
  });

  it('contains command normals', () => {
    expect(CN_MOVE_NAMES.RYO_TSURIZAO).toBeDefined();
    expect(CN_MOVE_NAMES.RYO_ORISHI).toBeDefined();
    expect(CN_MOVE_NAMES.IORI_YUMEYUMI).toBeDefined();
    expect(CN_MOVE_NAMES.IORI_KATANUGI).toBeDefined();
    expect(CN_MOVE_NAMES.CMD_GOFU_YOU).toBeDefined();
    expect(CN_MOVE_NAMES.CMD_88SHIKI).toBeDefined();
  });

  it('A and C versions of same move share the same name', () => {
    expect(CN_MOVE_NAMES.RYO_KOOU).toBe(CN_MOVE_NAMES.RYO_KOOU_C);
    expect(CN_MOVE_NAMES.KYO_YAMIBARAI).toBe(CN_MOVE_NAMES.KYO_YAMIBARAI_C);
    expect(CN_MOVE_NAMES.IORI_YAMIBARAI).toBe(CN_MOVE_NAMES.IORI_YAMIBARAI_C);
  });

  it('has at least 30 entries', () => {
    expect(Object.keys(CN_MOVE_NAMES).length).toBeGreaterThanOrEqual(30);
  });
});

// ===== CHAR_COLORS =====

describe('CHAR_COLORS', () => {
  it('has ryo, kyo, iori', () => {
    expect(CHAR_COLORS.ryo).toBeDefined();
    expect(CHAR_COLORS.kyo).toBeDefined();
    expect(CHAR_COLORS.iori).toBeDefined();
  });

  it('colors are hex format', () => {
    for (const [charId, color] of Object.entries(CHAR_COLORS)) {
      expect(color, `${charId} color`).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it('each character has a distinct color', () => {
    const colors = new Set(Object.values(CHAR_COLORS));
    expect(colors.size).toBe(Object.keys(CHAR_COLORS).length);
  });
});

// ===== getStageAccent =====

describe('getStageAccent', () => {
  const STAGES = ['temple', 'china', 'factory', 'orochi', 'street', 'rooftop'];

  it('returns a hex color for each stage', () => {
    for (const stage of STAGES) {
      const color = getStageAccent(stage);
      expect(color, `${stage} accent`).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it('returns fallback for unknown stage', () => {
    expect(getStageAccent('unknown')).toBe('#ffcc44');
  });

  it('temple accent is warm gold', () => {
    expect(getStageAccent('temple')).toBe('#ffcc44');
  });

  it('china accent is red', () => {
    expect(getStageAccent('china')).toBe('#ff4444');
  });

  it('orochi accent is purple', () => {
    expect(getStageAccent('orochi')).toBe('#aa44ff');
  });

  it('each stage has a distinct accent', () => {
    const colors = STAGES.map(s => getStageAccent(s));
    expect(new Set(colors).size).toBe(STAGES.length);
  });
});
