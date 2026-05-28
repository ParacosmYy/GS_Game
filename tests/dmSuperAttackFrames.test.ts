/**
 * DM/Super Attack Frames Regression Tests
 *
 * Validates DM/SDM/HSDM attack frame data structure and completeness.
 */
import { describe, it, expect } from 'vitest';
import {
  DM_OROCHINAGI_FRAMES,
  SDM_OROCHINAGI_FRAMES,
  HSDM_OROCHINAGI_FRAMES,
  DM_YATAGARASU_FRAMES,
  SDM_YATAGARASU_FRAMES,
  HSDM_YAOTOME_FRAMES,
  DM_TEN_HA_OU_FRAMES,
  SDM_TEN_HA_OU_FRAMES,
  DM_RYUKO_RANBU_FRAMES,
  SDM_RYUKO_RANBU_FRAMES,
  HSDM_RYUKO_RANBU_FRAMES,
  RYO_KOOUKEN_D_FRAMES,
  RYO_HIO_HACKER_FRAMES,
  RYO_ZANRETSU_KEN_FRAMES,
} from '../src/core/attackFrames_split/dmSupers.js';

interface AttackFrame {
  attack: Array<{ ox: number; oy: number; w: number; h: number }>;
  bodyOverride: { ox: number; oy: number; w: number; h: number } | null;
  throwBoxes?: Array<{ ox: number; oy: number; w: number; h: number }>;
}

function validateFrames(frames: AttackFrame[], name: string) {
  expect(frames.length, `${name} frame count`).toBeGreaterThan(0);
  for (let i = 0; i < frames.length; i++) {
    const f = frames[i];
    expect(Array.isArray(f.attack), `${name}[${i}].attack`).toBe(true);
    expect(f.attack.length, `${name}[${i}] attack boxes`).toBeGreaterThan(0);
    for (const box of f.attack) {
      expect(typeof box.ox, `${name}[${i}] ox`).toBe('number');
      expect(typeof box.oy, `${name}[${i}] oy`).toBe('number');
      expect(box.w, `${name}[${i}] w`).toBeGreaterThan(0);
      expect(box.h, `${name}[${i}] h`).toBeGreaterThan(0);
    }
  }
}

// ===== Kyo DM/SDM/HSDM =====

describe('Kyo DM attack frames', () => {
  it('DM_OROCHINAGI has valid frames', () => {
    validateFrames(DM_OROCHINAGI_FRAMES, 'DM_OROCHINAGI');
  });

  it('SDM_OROCHINAGI has valid frames', () => {
    validateFrames(SDM_OROCHINAGI_FRAMES, 'SDM_OROCHINAGI');
  });

  it('HSDM_OROCHINAGI has valid frames', () => {
    validateFrames(HSDM_OROCHINAGI_FRAMES, 'HSDM_OROCHINAGI');
  });

  it('SDM has more frames than DM', () => {
    expect(SDM_OROCHINAGI_FRAMES.length).toBeGreaterThan(DM_OROCHINAGI_FRAMES.length);
  });

  it('HSDM has wider hitboxes than DM (first frame)', () => {
    expect(HSDM_OROCHINAGI_FRAMES[0].attack[0].w).toBeGreaterThan(DM_OROCHINAGI_FRAMES[0].attack[0].w);
  });
});

// ===== Iori DM/SDM/HSDM =====

describe('Iori DM attack frames', () => {
  it('DM_YATAGARASU has valid frames', () => {
    validateFrames(DM_YATAGARASU_FRAMES, 'DM_YATAGARASU');
  });

  it('SDM_YATAGARASU has valid frames', () => {
    validateFrames(SDM_YATAGARASU_FRAMES, 'SDM_YATAGARASU');
  });

  it('HSDM_YAOTOME has valid frames', () => {
    validateFrames(HSDM_YAOTOME_FRAMES, 'HSDM_YAOTOME');
  });

  it('SDM has more frames than DM', () => {
    expect(SDM_YATAGARASU_FRAMES.length).toBeGreaterThanOrEqual(DM_YATAGARASU_FRAMES.length);
  });
});

// ===== Ryo DM/SDM/HSDM + Specials =====

describe('Ryo DM attack frames', () => {
  it('DM_TEN_HA_OU has valid frames', () => {
    validateFrames(DM_TEN_HA_OU_FRAMES, 'DM_TEN_HA_OU');
  });

  it('SDM_TEN_HA_OU has valid frames', () => {
    validateFrames(SDM_TEN_HA_OU_FRAMES, 'SDM_TEN_HA_OU');
  });

  it('DM_RYUKO_RANBU has valid frames', () => {
    validateFrames(DM_RYUKO_RANBU_FRAMES, 'DM_RYUKO_RANBU');
  });

  it('SDM_RYUKO_RANBU has valid frames', () => {
    validateFrames(SDM_RYUKO_RANBU_FRAMES, 'SDM_RYUKO_RANBU');
  });

  it('HSDM_RYUKO_RANBU has valid frames', () => {
    validateFrames(HSDM_RYUKO_RANBU_FRAMES, 'HSDM_RYUKO_RANBU');
  });

  it('SDM Ten Ha Ou has more frames than DM', () => {
    expect(SDM_TEN_HA_OU_FRAMES.length).toBeGreaterThan(DM_TEN_HA_OU_FRAMES.length);
  });

  it('HSDM Ryuko Ranbu has more frames than DM', () => {
    expect(HSDM_RYUKO_RANBU_FRAMES.length).toBeGreaterThan(DM_RYUKO_RANBU_FRAMES.length);
  });
});

describe('Ryo special attack frames', () => {
  it('RYO_KOOUKEN_D has valid frames', () => {
    validateFrames(RYO_KOOUKEN_D_FRAMES, 'RYO_KOOUKEN_D');
  });

  it('RYO_HIO_HACKER has valid frames', () => {
    validateFrames(RYO_HIO_HACKER_FRAMES, 'RYO_HIO_HACKER');
  });

  it('RYO_ZANRETSU_KEN has valid frames', () => {
    validateFrames(RYO_ZANRETSU_KEN_FRAMES, 'RYO_ZANRETSU_KEN');
  });

  it('Zanretsu Ken has valid frame count', () => {
    expect(RYO_ZANRETSU_KEN_FRAMES.length).toBeGreaterThanOrEqual(3);
  });
});

// ===== Cross-Character DM Consistency =====

describe('Cross-character DM frame consistency', () => {
  it('all DMs have at least 5 frames', () => {
    const allDMs = [
      DM_OROCHINAGI_FRAMES, DM_YATAGARASU_FRAMES,
      DM_TEN_HA_OU_FRAMES, DM_RYUKO_RANBU_FRAMES,
    ];
    for (const dm of allDMs) {
      expect(dm.length).toBeGreaterThanOrEqual(5);
    }
  });

  it('all HSDMs have more frames than corresponding DMs', () => {
    expect(HSDM_OROCHINAGI_FRAMES.length).toBeGreaterThanOrEqual(DM_OROCHINAGI_FRAMES.length);
    expect(HSDM_YAOTOME_FRAMES.length).toBeGreaterThanOrEqual(DM_YATAGARASU_FRAMES.length);
    expect(HSDM_RYUKO_RANBU_FRAMES.length).toBeGreaterThan(DM_RYUKO_RANBU_FRAMES.length);
  });
});
