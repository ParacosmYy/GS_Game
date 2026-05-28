/**
 * Kyo Frame Contract Validation Tests
 *
 * Validates the KYO_ACTION_CONTRACTS data:
 * - All required actions present (normals, command normals, specials, DM, SDM, states)
 * - characterId is 'kyo' for all actions
 * - Frame counts match totalFrames
 * - startup + active + recovery = totalFrames for attack actions
 * - hitLevel values are valid
 * - DM/SDM have 'super_flash' event tag on first frame
 * - Specials have feedbackTierOverride = 'special'
 * - Kyo-specific: rekka chain (aragami → dokugami), 75kai two-stage
 */
import { describe, it, expect } from 'vitest';
import { KYO_ACTION_CONTRACTS, getKyoFrameContractManifest } from '../src/core/kyoFrameContract.js';

const VALID_HIT_LEVELS = new Set(['MID', 'HIGH', 'LOW']);

const REQUIRED_STATES = [
  'idle', 'walk_forward', 'walk_backward', 'jump', 'run',
  'backdash', 'roll', 'back_roll', 'crouch', 'block',
  'dizzy', 'guard_crush', 'max_mode', 'taunt', 'win',
  'throw_action', 'hurt', 'knockdown',
];

const REQUIRED_NORMALS = [
  'stand_a', 'stand_b', 'stand_c', 'stand_d',
  'close_a', 'close_b', 'close_c', 'close_d',
  'crouch_a', 'crouch_b', 'crouch_c', 'crouch_d',
  'air_a', 'air_c', 'air_d',
];

const REQUIRED_COMMANDS = [
  'kyo_75kai', 'kyo_75kai_2', 'kyo_red_kick',
  'cmd_gofu_you', 'cmd_88shiki', 'cmd_naraku',
];

const REQUIRED_SPECIALS = [
  'kyo_oniyaki', 'kyo_oniyaki_c',
  'kyo_yamibarai', 'kyo_yamibarai_c',
  'kyo_aragami', 'kyo_dokugami',
];

const REQUIRED_DM = ['dm_orochinagi'];
const REQUIRED_SDM = ['sdm_orochinagi'];

const ALL_ATTACKS = [...REQUIRED_NORMALS, ...REQUIRED_COMMANDS, ...REQUIRED_SPECIALS, ...REQUIRED_DM, ...REQUIRED_SDM];

describe('KYO_ACTION_CONTRACTS completeness', () => {
  it('has all required state actions', () => {
    for (const action of REQUIRED_STATES) {
      expect(KYO_ACTION_CONTRACTS.has(action), `state ${action}`).toBe(true);
    }
  });

  it('has all normal attacks', () => {
    for (const action of REQUIRED_NORMALS) {
      expect(KYO_ACTION_CONTRACTS.has(action), `normal ${action}`).toBe(true);
    }
  });

  it('has all command normals', () => {
    for (const action of REQUIRED_COMMANDS) {
      expect(KYO_ACTION_CONTRACTS.has(action), `command ${action}`).toBe(true);
    }
  });

  it('has all specials', () => {
    for (const action of REQUIRED_SPECIALS) {
      expect(KYO_ACTION_CONTRACTS.has(action), `special ${action}`).toBe(true);
    }
  });

  it('has DM actions', () => {
    for (const action of REQUIRED_DM) {
      expect(KYO_ACTION_CONTRACTS.has(action), `DM ${action}`).toBe(true);
    }
  });

  it('has SDM actions', () => {
    for (const action of REQUIRED_SDM) {
      expect(KYO_ACTION_CONTRACTS.has(action), `SDM ${action}`).toBe(true);
    }
  });

  it('total action count >= 45', () => {
    expect(KYO_ACTION_CONTRACTS.size).toBeGreaterThanOrEqual(45);
  });
});

describe('KYO_ACTION_CONTRACTS structure', () => {
  it('all actions have characterId = kyo', () => {
    for (const [key, action] of KYO_ACTION_CONTRACTS) {
      expect(action.characterId, `${key} charId`).toBe('kyo');
    }
  });

  it('all actions have actionId matching key', () => {
    for (const [key, action] of KYO_ACTION_CONTRACTS) {
      expect(action.actionId, `${key} actionId`).toBe(key);
    }
  });

  it('all actions have frames array matching totalFrames', () => {
    for (const [key, action] of KYO_ACTION_CONTRACTS) {
      expect(action.frames.length, `${key} frames.length`).toBe(action.totalFrames);
    }
  });

  it('all hitLevels are valid', () => {
    for (const [key, action] of KYO_ACTION_CONTRACTS) {
      expect(VALID_HIT_LEVELS.has(action.hitLevel), `${key} hitLevel=${action.hitLevel}`).toBe(true);
    }
  });
});

describe('Kyo attack timing', () => {
  it('startup + active + recovery = totalFrames', () => {
    for (const actionId of ALL_ATTACKS) {
      const action = KYO_ACTION_CONTRACTS.get(actionId)!;
      const sum = action.startup + action.active + action.recovery;
      expect(sum, `${actionId} timing sum`).toBe(action.totalFrames);
    }
  });

  it('all attacks have positive startup', () => {
    for (const actionId of ALL_ATTACKS) {
      const action = KYO_ACTION_CONTRACTS.get(actionId)!;
      expect(action.startup, `${actionId} startup`).toBeGreaterThan(0);
    }
  });

  it('all attacks have positive active frames', () => {
    for (const actionId of ALL_ATTACKS) {
      const action = KYO_ACTION_CONTRACTS.get(actionId)!;
      expect(action.active, `${actionId} active`).toBeGreaterThan(0);
    }
  });

  it('all attacks have positive recovery', () => {
    for (const actionId of ALL_ATTACKS) {
      const action = KYO_ACTION_CONTRACTS.get(actionId)!;
      expect(action.recovery, `${actionId} recovery`).toBeGreaterThan(0);
    }
  });

  it('C normals have longer startup than A normals', () => {
    const standA = KYO_ACTION_CONTRACTS.get('stand_a')!;
    const standC = KYO_ACTION_CONTRACTS.get('stand_c')!;
    expect(standC.startup).toBeGreaterThan(standA.startup);
  });

  it('DM has longer total than normals', () => {
    const dm = KYO_ACTION_CONTRACTS.get('dm_orochinagi')!;
    const standC = KYO_ACTION_CONTRACTS.get('stand_c')!;
    expect(dm.totalFrames).toBeGreaterThan(standC.totalFrames);
  });

  it('SDM has longer or equal active than DM', () => {
    const sdm = KYO_ACTION_CONTRACTS.get('sdm_orochinagi')!;
    const dm = KYO_ACTION_CONTRACTS.get('dm_orochinagi')!;
    expect(sdm.active).toBeGreaterThanOrEqual(dm.active);
  });

  it('strong specials have longer active than weak', () => {
    const weakOni = KYO_ACTION_CONTRACTS.get('kyo_oniyaki')!;
    const strongOni = KYO_ACTION_CONTRACTS.get('kyo_oniyaki_c')!;
    expect(strongOni.active).toBeGreaterThan(weakOni.active);
  });
});

describe('Kyo cancel windows', () => {
  it('stand_a has cancel window', () => {
    const action = KYO_ACTION_CONTRACTS.get('stand_a')!;
    expect(action.cancelWindows.length).toBeGreaterThan(0);
  });

  it('stand_c has cancel window', () => {
    const action = KYO_ACTION_CONTRACTS.get('stand_c')!;
    expect(action.cancelWindows.length).toBeGreaterThan(0);
  });

  it('cancel window frames are within totalFrames', () => {
    for (const [key, action] of KYO_ACTION_CONTRACTS) {
      for (const cw of action.cancelWindows) {
        expect(cw.frames[0], `${key} cancel start`).toBeGreaterThanOrEqual(0);
        expect(cw.frames[1], `${key} cancel end`).toBeLessThan(action.totalFrames);
      }
    }
  });

  it('rekka (aragami) has cancel window for chain', () => {
    const aragami = KYO_ACTION_CONTRACTS.get('kyo_aragami')!;
    expect(aragami.cancelWindows.length).toBeGreaterThan(0);
  });
});

describe('Kyo frame data details', () => {
  it('DM has super_flash event tag on first frame', () => {
    const dm = KYO_ACTION_CONTRACTS.get('dm_orochinagi')!;
    expect(dm.frames[0].eventTags).toContain('super_flash');
  });

  it('SDM has super_flash event tag on first frame', () => {
    const sdm = KYO_ACTION_CONTRACTS.get('sdm_orochinagi')!;
    expect(sdm.frames[0].eventTags).toContain('super_flash');
  });

  it('specials have feedbackTierOverride = special', () => {
    for (const actionId of REQUIRED_SPECIALS) {
      const action = KYO_ACTION_CONTRACTS.get(actionId)!;
      expect(action.feedbackTierOverride, `${actionId} tier`).toBe('special');
    }
  });

  it('DM/SDM have feedbackTierOverride = super', () => {
    const dm = KYO_ACTION_CONTRACTS.get('dm_orochinagi')!;
    const sdm = KYO_ACTION_CONTRACTS.get('sdm_orochinagi')!;
    expect(dm.feedbackTierOverride).toBe('super');
    expect(sdm.feedbackTierOverride).toBe('super');
  });

  it('normals have no feedbackTierOverride', () => {
    for (const actionId of REQUIRED_NORMALS) {
      const action = KYO_ACTION_CONTRACTS.get(actionId)!;
      expect(action.feedbackTierOverride, `${actionId} tier`).toBeNull();
    }
  });

  it('all frame spriteRef strings are non-empty', () => {
    for (const [key, action] of KYO_ACTION_CONTRACTS) {
      for (const frame of action.frames) {
        expect(frame.sprite.spriteRef.length, `${key} frame ${frame.frameIndex}`).toBeGreaterThan(0);
      }
    }
  });

  it('attack frames have collision data during active phase', () => {
    const standA = KYO_ACTION_CONTRACTS.get('stand_a')!;
    for (let i = standA.startup; i < standA.startup + standA.active; i++) {
      expect(standA.frames[i].collision, `stand_a frame ${i}`).not.toBeNull();
    }
  });

  it('startup frames have no collision', () => {
    const standC = KYO_ACTION_CONTRACTS.get('stand_c')!;
    for (let i = 0; i < standC.startup; i++) {
      expect(standC.frames[i].collision, `stand_c frame ${i}`).toBeNull();
    }
  });

  it('75kai first kick exists', () => {
    const kick = KYO_ACTION_CONTRACTS.get('kyo_75kai')!;
    expect(kick).toBeDefined();
    expect(kick.startup).toBeGreaterThan(0);
  });

  it('75kai second kick exists', () => {
    const kick2 = KYO_ACTION_CONTRACTS.get('kyo_75kai_2')!;
    expect(kick2).toBeDefined();
    expect(kick2.startup).toBeGreaterThan(0);
  });
});

describe('getKyoFrameContractManifest', () => {
  it('returns characterId kyo', () => {
    const manifest = getKyoFrameContractManifest();
    expect(manifest.characterId).toBe('kyo');
  });

  it('returns the same action map', () => {
    const manifest = getKyoFrameContractManifest();
    expect(manifest.actions).toBe(KYO_ACTION_CONTRACTS);
  });
});
