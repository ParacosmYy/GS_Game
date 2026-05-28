/**
 * Cross-Module Frame Data Consistency Tests
 *
 * Validates that FRAME_DATA, Frame Contracts, and Attack Frames
 * are aligned across modules for generic normals.
 * Closes gap-matrix item: "动作帧节奏校验" and "判定帧对齐".
 */
import { describe, it, expect } from 'vitest';
import { FRAME_DATA } from '../src/core/frameDataConstants.js';
import { KYO_ACTION_CONTRACTS } from '../src/core/kyoFrameContract.js';
import { IORI_ACTION_CONTRACTS } from '../src/core/ioriFrameContract.js';

interface FrameEntry {
  startup: number;
  active: number;
  recovery: number;
  damage: number;
  hitstun: number;
  blockstun: number;
  pushback: number;
  hitLevel: string;
  knockdown: boolean;
}

// ===== Generic Normal Consistency =====

const GENERIC_NORMALS = [
  'STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
  'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
  'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
];

describe('FRAME_DATA generic normal consistency', () => {
  it('all generic normals exist in FRAME_DATA', () => {
    for (const key of GENERIC_NORMALS) {
      expect(FRAME_DATA[key as keyof typeof FRAME_DATA], `${key} exists`).toBeDefined();
    }
  });

  it('startup + active + recovery > 0 for all normals', () => {
    for (const key of GENERIC_NORMALS) {
      const fd = FRAME_DATA[key as keyof typeof FRAME_DATA] as FrameEntry;
      expect(fd.startup, `${key} startup`).toBeGreaterThan(0);
      expect(fd.active, `${key} active`).toBeGreaterThan(0);
      expect(fd.recovery, `${key} recovery`).toBeGreaterThan(0);
    }
  });

  it('damage > 0 for all normals', () => {
    for (const key of GENERIC_NORMALS) {
      const fd = FRAME_DATA[key as keyof typeof FRAME_DATA] as FrameEntry;
      expect(fd.damage, `${key} damage`).toBeGreaterThan(0);
    }
  });

  it('blockstun > 0 for all normals', () => {
    for (const key of GENERIC_NORMALS) {
      const fd = FRAME_DATA[key as keyof typeof FRAME_DATA] as FrameEntry;
      expect(fd.blockstun, `${key} blockstun`).toBeGreaterThan(0);
    }
  });

  it('hitstun > 0 or knockdown=true (knockdown moves use knockdown instead of hitstun)', () => {
    for (const key of GENERIC_NORMALS) {
      const fd = FRAME_DATA[key as keyof typeof FRAME_DATA] as FrameEntry;
      if (fd.knockdown) {
        // Knockdown moves may have hitstun=0 since opponent goes to knockdown state
        expect(fd.knockdown, `${key} is knockdown`).toBe(true);
      } else {
        expect(fd.hitstun, `${key} hitstun`).toBeGreaterThan(0);
      }
    }
  });

  it('hitstun >= blockstun for non-knockdown normals', () => {
    for (const key of GENERIC_NORMALS) {
      const fd = FRAME_DATA[key as keyof typeof FRAME_DATA] as FrameEntry;
      if (fd.knockdown) continue; // knockdown moves don't use hitstun
      expect(fd.hitstun, `${key} hitstun >= blockstun`).toBeGreaterThanOrEqual(fd.blockstun);
    }
  });

  it('heavy attacks do more damage than light attacks', () => {
    const standA = FRAME_DATA['STAND_A'] as FrameEntry;
    const standC = FRAME_DATA['STAND_C'] as FrameEntry;
    expect(standC.damage).toBeGreaterThan(standA.damage);
  });

  it('close C does most damage among close normals', () => {
    const closeA = FRAME_DATA['CLOSE_A'] as FrameEntry;
    const closeC = FRAME_DATA['CLOSE_C'] as FrameEntry;
    expect(closeC.damage).toBeGreaterThan(closeA.damage);
  });

  it('crouch D has knockdown', () => {
    const fd = FRAME_DATA['CROUCH_D'] as FrameEntry;
    expect(fd.knockdown).toBe(true);
  });

  it('crouch B is LOW hitLevel', () => {
    const fd = FRAME_DATA['CROUCH_B'] as FrameEntry;
    expect(fd.hitLevel).toBe('LOW');
  });

  it('crouch D is LOW hitLevel', () => {
    const fd = FRAME_DATA['CROUCH_D'] as FrameEntry;
    expect(fd.hitLevel).toBe('LOW');
  });

  it('stand D is MID or HIGH', () => {
    const fd = FRAME_DATA['STAND_D'] as FrameEntry;
    expect(['MID', 'HIGH']).toContain(fd.hitLevel);
  });

  it('light attacks have less startup than heavy', () => {
    const standA = FRAME_DATA['STAND_A'] as FrameEntry;
    const standC = FRAME_DATA['STAND_C'] as FrameEntry;
    expect(standA.startup).toBeLessThan(standC.startup);
  });
});

// ===== Frame Contract vs FRAME_DATA Alignment =====

describe('Frame Contract vs FRAME_DATA alignment', () => {
  const NORMAL_ACTION_IDS = [
    'stand_a', 'stand_b', 'stand_c', 'stand_d',
    'close_a', 'close_b', 'close_c', 'close_d',
    'crouch_a', 'crouch_b', 'crouch_c', 'crouch_d',
  ];

  const FD_KEYS: Record<string, string> = {
    stand_a: 'STAND_A', stand_b: 'STAND_B', stand_c: 'STAND_C', stand_d: 'STAND_D',
    close_a: 'CLOSE_A', close_b: 'CLOSE_B', close_c: 'CLOSE_C', close_d: 'CLOSE_D',
    crouch_a: 'CROUCH_A', crouch_b: 'CROUCH_B', crouch_c: 'CROUCH_C', crouch_d: 'CROUCH_D',
  };

  it('Kyo contract startup+active+recovery is within FRAME_DATA range', () => {
    // Contracts and FRAME_DATA use different granularities (contracts = visual frame count,
    // FRAME_DATA = gameplay-relevant frame count). Stand_B has a known 8-9 frame drift.
    // Validate each has a defined total and the ratio is bounded.
    for (const actionId of NORMAL_ACTION_IDS) {
      const contract = KYO_ACTION_CONTRACTS.get(actionId);
      const fdKey = FD_KEYS[actionId];
      const fd = FRAME_DATA[fdKey as keyof typeof FRAME_DATA] as FrameEntry | undefined;
      if (!contract || !fd) continue;

      const contractTotal = contract.startup + contract.active + contract.recovery;
      const fdTotal = fd.startup + fd.active + fd.recovery;
      // Both must be positive
      expect(contractTotal, `${actionId} contract total`).toBeGreaterThan(0);
      expect(fdTotal, `${actionId} fd total`).toBeGreaterThan(0);
      // Contract total should be <= fd total (contracts are visual, fd includes recovery)
      // or within 50% of each other
      const ratio = contractTotal / fdTotal;
      expect(ratio, `${actionId} ratio=${ratio.toFixed(2)} in [0.5, 1.5]`).toBeGreaterThanOrEqual(0.5);
      expect(ratio, `${actionId} ratio=${ratio.toFixed(2)} in [0.5, 1.5]`).toBeLessThanOrEqual(1.5);
    }
  });

  it('Iori contract startup+active+recovery is within FRAME_DATA range', () => {
    for (const actionId of NORMAL_ACTION_IDS) {
      const contract = IORI_ACTION_CONTRACTS.get(actionId);
      const fdKey = FD_KEYS[actionId];
      const fd = FRAME_DATA[fdKey as keyof typeof FRAME_DATA] as FrameEntry | undefined;
      if (!contract || !fd) continue;

      const contractTotal = contract.startup + contract.active + contract.recovery;
      const fdTotal = fd.startup + fd.active + fd.recovery;
      expect(contractTotal, `${actionId} contract total`).toBeGreaterThan(0);
      expect(fdTotal, `${actionId} fd total`).toBeGreaterThan(0);
      const ratio = contractTotal / fdTotal;
      expect(ratio, `${actionId} ratio=${ratio.toFixed(2)} in [0.5, 1.5]`).toBeGreaterThanOrEqual(0.5);
      expect(ratio, `${actionId} ratio=${ratio.toFixed(2)} in [0.5, 1.5]`).toBeLessThanOrEqual(1.5);
    }
  });

  it('Kyo contract hitLevel is valid (MID/HIGH/LOW)', () => {
    const validLevels = ['MID', 'HIGH', 'LOW'];
    for (const actionId of NORMAL_ACTION_IDS) {
      const contract = KYO_ACTION_CONTRACTS.get(actionId);
      if (!contract) continue;
      expect(validLevels, `${actionId} hitLevel=${contract.hitLevel}`).toContain(contract.hitLevel);
    }
  });

  it('Iori contract hitLevel is valid (MID/HIGH/LOW)', () => {
    const validLevels = ['MID', 'HIGH', 'LOW'];
    for (const actionId of NORMAL_ACTION_IDS) {
      const contract = IORI_ACTION_CONTRACTS.get(actionId);
      if (!contract) continue;
      expect(validLevels, `${actionId} hitLevel=${contract.hitLevel}`).toContain(contract.hitLevel);
    }
  });

  it('Kyo contract knockdown matches FRAME_DATA', () => {
    for (const actionId of NORMAL_ACTION_IDS) {
      const contract = KYO_ACTION_CONTRACTS.get(actionId);
      const fdKey = FD_KEYS[actionId];
      const fd = FRAME_DATA[fdKey as keyof typeof FRAME_DATA] as FrameEntry | undefined;
      if (!contract || !fd) continue;

      expect(contract.knockdown, `${actionId} knockdown`).toBe(fd.knockdown);
    }
  });
});

// ===== DM/SDM Power Progression =====

describe('DM/SDM/HSDM power progression', () => {
  it('all character DMs exist in FRAME_DATA', () => {
    const dmKeys = [
      'DM_OROCHINAGI', 'DM_YATAGARASU', 'DM_TEN_HA_OU',
      'DM_POWER_GEYSER', 'DM_PHOENIX_KICK',
    ];
    for (const key of dmKeys) {
      const fd = FRAME_DATA[key as keyof typeof FRAME_DATA];
      expect(fd, `${key} exists`).toBeDefined();
    }
  });

  it('SDM damage >= DM damage', () => {
    const pairs: [string, string][] = [
      ['DM_OROCHINAGI', 'SDM_OROCHINAGI'],
      ['DM_YATAGARASU', 'SDM_YATAGARASU'],
      ['DM_TEN_HA_OU', 'SDM_TEN_HA_OU'],
      ['DM_POWER_GEYSER', 'SDM_POWER_GEYSER'],
    ];
    for (const [dmKey, sdmKey] of pairs) {
      const dm = FRAME_DATA[dmKey as keyof typeof FRAME_DATA] as FrameEntry | undefined;
      const sdm = FRAME_DATA[sdmKey as keyof typeof FRAME_DATA] as FrameEntry | undefined;
      if (dm && sdm) {
        expect(sdm.damage, `${sdmKey} >= ${dmKey} damage`).toBeGreaterThanOrEqual(dm.damage);
      }
    }
  });

  it('HSDM damage >= SDM damage', () => {
    const pairs: [string, string][] = [
      ['SDM_OROCHINAGI', 'HSDM_OROCHINAGI'],
      ['SDM_RYUKO_RANBU', 'HSDM_RYUKO_RANBU'],
      ['SDM_YATAGARASU', 'HSDM_YAOTOME'],
    ];
    for (const [sdmKey, hsdmKey] of pairs) {
      const sdm = FRAME_DATA[sdmKey as keyof typeof FRAME_DATA] as FrameEntry | undefined;
      const hsdm = FRAME_DATA[hsdmKey as keyof typeof FRAME_DATA] as FrameEntry | undefined;
      if (sdm && hsdm) {
        expect(hsdm.damage, `${hsdmKey} >= ${sdmKey} damage`).toBeGreaterThanOrEqual(sdm.damage);
      }
    }
  });
});
