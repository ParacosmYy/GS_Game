/**
 * Iori Frame Contract Validation Tests
 *
 * Validates the IORI_ACTION_CONTRACTS data:
 * - All required actions present (normals, specials, DM, SDM, states)
 * - characterId is 'iori' for all actions
 * - Frame counts match totalFrames
 * - startup + active + recovery = totalFrames for attack actions
 * - cancelWindows reference valid frame ranges
 * - hitLevel values are valid
 * - DM/SDM have 'super_flash' event tag on first frame
 * - Specials have feedbackTierOverride = 'special'
 */
import { describe, it, expect } from 'vitest';
import { IORI_ACTION_CONTRACTS, getIoriFrameContractManifest } from '../src/core/ioriFrameContract.js';

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

const REQUIRED_COMMANDS = ['iori_yumeyumi', 'iori_katanugi', 'iori_yukiwarui'];

const REQUIRED_SPECIALS = [
  'iori_aoihana', 'iori_aoihana_2', 'iori_aoihana_3',
  'iori_yamibarai', 'iori_yamibarai_c',
  'iori_oniyaki', 'iori_oniyaki_c',
  'iori_kototsuki', 'iori_kuzukaze',
];

const REQUIRED_DM = ['dm_yaotome'];
const REQUIRED_SDM = ['sdm_yaotome'];

describe('IORI_ACTION_CONTRACTS completeness', () => {
  it('has all required state actions', () => {
    for (const action of REQUIRED_STATES) {
      expect(IORI_ACTION_CONTRACTS.has(action), `state ${action}`).toBe(true);
    }
  });

  it('has all normal attacks', () => {
    for (const action of REQUIRED_NORMALS) {
      expect(IORI_ACTION_CONTRACTS.has(action), `normal ${action}`).toBe(true);
    }
  });

  it('has all command normals', () => {
    for (const action of REQUIRED_COMMANDS) {
      expect(IORI_ACTION_CONTRACTS.has(action), `command ${action}`).toBe(true);
    }
  });

  it('has all specials', () => {
    for (const action of REQUIRED_SPECIALS) {
      expect(IORI_ACTION_CONTRACTS.has(action), `special ${action}`).toBe(true);
    }
  });

  it('has DM actions', () => {
    for (const action of REQUIRED_DM) {
      expect(IORI_ACTION_CONTRACTS.has(action), `DM ${action}`).toBe(true);
    }
  });

  it('has SDM actions', () => {
    for (const action of REQUIRED_SDM) {
      expect(IORI_ACTION_CONTRACTS.has(action), `SDM ${action}`).toBe(true);
    }
  });

  it('total action count >= 45', () => {
    expect(IORI_ACTION_CONTRACTS.size).toBeGreaterThanOrEqual(45);
  });
});

describe('IORI_ACTION_CONTRACTS structure', () => {
  it('all actions have characterId = iori', () => {
    for (const [key, action] of IORI_ACTION_CONTRACTS) {
      expect(action.characterId, `${key} charId`).toBe('iori');
    }
  });

  it('all actions have actionId matching key', () => {
    for (const [key, action] of IORI_ACTION_CONTRACTS) {
      expect(action.actionId, `${key} actionId`).toBe(key);
    }
  });

  it('all actions have frames array matching totalFrames', () => {
    for (const [key, action] of IORI_ACTION_CONTRACTS) {
      expect(action.frames.length, `${key} frames.length`).toBe(action.totalFrames);
    }
  });

  it('all hitLevels are valid', () => {
    for (const [key, action] of IORI_ACTION_CONTRACTS) {
      expect(VALID_HIT_LEVELS.has(action.hitLevel), `${key} hitLevel=${action.hitLevel}`).toBe(true);
    }
  });
});

describe('IORI attack actions timing', () => {
  const ATTACK_ACTIONS = [...REQUIRED_NORMALS, ...REQUIRED_COMMANDS, ...REQUIRED_SPECIALS, ...REQUIRED_DM, ...REQUIRED_SDM];

  it('startup + active + recovery = totalFrames', () => {
    for (const actionId of ATTACK_ACTIONS) {
      const action = IORI_ACTION_CONTRACTS.get(actionId)!;
      const sum = action.startup + action.active + action.recovery;
      expect(sum, `${actionId} timing sum`).toBe(action.totalFrames);
    }
  });

  it('all attacks have positive startup', () => {
    for (const actionId of ATTACK_ACTIONS) {
      const action = IORI_ACTION_CONTRACTS.get(actionId)!;
      expect(action.startup, `${actionId} startup`).toBeGreaterThan(0);
    }
  });

  it('all attacks have positive active frames', () => {
    for (const actionId of ATTACK_ACTIONS) {
      const action = IORI_ACTION_CONTRACTS.get(actionId)!;
      expect(action.active, `${actionId} active`).toBeGreaterThan(0);
    }
  });

  it('all attacks have positive recovery', () => {
    for (const actionId of ATTACK_ACTIONS) {
      const action = IORI_ACTION_CONTRACTS.get(actionId)!;
      expect(action.recovery, `${actionId} recovery`).toBeGreaterThan(0);
    }
  });

  it('heavy normals have longer startup than light normals', () => {
    const standA = IORI_ACTION_CONTRACTS.get('stand_a')!;
    const standC = IORI_ACTION_CONTRACTS.get('stand_c')!;
    expect(standC.startup).toBeGreaterThan(standA.startup);
  });

  it('DM has longer total than normals', () => {
    const dm = IORI_ACTION_CONTRACTS.get('dm_yaotome')!;
    const standC = IORI_ACTION_CONTRACTS.get('stand_c')!;
    expect(dm.totalFrames).toBeGreaterThan(standC.totalFrames);
  });

  it('SDM has longer or equal active than DM', () => {
    const sdm = IORI_ACTION_CONTRACTS.get('sdm_yaotome')!;
    const dm = IORI_ACTION_CONTRACTS.get('dm_yaotome')!;
    expect(sdm.active).toBeGreaterThanOrEqual(dm.active);
  });
});

describe('IORI cancel windows', () => {
  it('stand_a has cancel window', () => {
    const action = IORI_ACTION_CONTRACTS.get('stand_a')!;
    expect(action.cancelWindows.length).toBeGreaterThan(0);
  });

  it('stand_c has cancel window', () => {
    const action = IORI_ACTION_CONTRACTS.get('stand_c')!;
    expect(action.cancelWindows.length).toBeGreaterThan(0);
  });

  it('cancel window frames are within totalFrames', () => {
    for (const [key, action] of IORI_ACTION_CONTRACTS) {
      for (const cw of action.cancelWindows) {
        expect(cw.frames[0], `${key} cancel start`).toBeGreaterThanOrEqual(0);
        expect(cw.frames[1], `${key} cancel end`).toBeLessThan(action.totalFrames);
      }
    }
  });

  it('rekka chain has cancel windows', () => {
    const aoihana = IORI_ACTION_CONTRACTS.get('iori_aoihana')!;
    const aoihana2 = IORI_ACTION_CONTRACTS.get('iori_aoihana_2')!;
    expect(aoihana.cancelWindows.length).toBeGreaterThan(0);
    expect(aoihana2.cancelWindows.length).toBeGreaterThan(0);
  });
});

describe('IORI frame data details', () => {
  it('DM has super_flash event tag on first frame', () => {
    const dm = IORI_ACTION_CONTRACTS.get('dm_yaotome')!;
    expect(dm.frames[0].eventTags).toContain('super_flash');
  });

  it('SDM has super_flash event tag on first frame', () => {
    const sdm = IORI_ACTION_CONTRACTS.get('sdm_yaotome')!;
    expect(sdm.frames[0].eventTags).toContain('super_flash');
  });

  it('specials have feedbackTierOverride = special', () => {
    for (const actionId of REQUIRED_SPECIALS) {
      const action = IORI_ACTION_CONTRACTS.get(actionId)!;
      expect(action.feedbackTierOverride, `${actionId} tier`).toBe('special');
    }
  });

  it('DM/SDM have feedbackTierOverride = super', () => {
    const dm = IORI_ACTION_CONTRACTS.get('dm_yaotome')!;
    const sdm = IORI_ACTION_CONTRACTS.get('sdm_yaotome')!;
    expect(dm.feedbackTierOverride).toBe('super');
    expect(sdm.feedbackTierOverride).toBe('super');
  });

  it('normals have no feedbackTierOverride', () => {
    for (const actionId of REQUIRED_NORMALS) {
      const action = IORI_ACTION_CONTRACTS.get(actionId)!;
      expect(action.feedbackTierOverride, `${actionId} tier`).toBeNull();
    }
  });

  it('all frame spriteRef strings contain pixel key', () => {
    for (const [key, action] of IORI_ACTION_CONTRACTS) {
      for (const frame of action.frames) {
        expect(frame.sprite.spriteRef.length, `${key} frame ${frame.frameIndex} spriteRef`).toBeGreaterThan(0);
      }
    }
  });

  it('attack frames have collision data during active phase', () => {
    const standA = IORI_ACTION_CONTRACTS.get('stand_a')!;
    for (let i = standA.startup; i < standA.startup + standA.active; i++) {
      expect(standA.frames[i].collision, `stand_a frame ${i}`).not.toBeNull();
    }
  });

  it('startup frames have no collision', () => {
    const standC = IORI_ACTION_CONTRACTS.get('stand_c')!;
    for (let i = 0; i < standC.startup; i++) {
      expect(standC.frames[i].collision, `stand_c frame ${i}`).toBeNull();
    }
  });
});

describe('getIoriFrameContractManifest', () => {
  it('returns characterId iori', () => {
    const manifest = getIoriFrameContractManifest();
    expect(manifest.characterId).toBe('iori');
  });

  it('returns the same action map', () => {
    const manifest = getIoriFrameContractManifest();
    expect(manifest.actions).toBe(IORI_ACTION_CONTRACTS);
  });
});
