/**
 * Kyo/Iori Frame Contract Regression Tests
 *
 * Validates frame contract structure for both Kyo and Iori:
 * - Required actions present (idle, walk, jump, normals, specials, DM)
 * - Frame count consistency (startup + active + recovery = totalFrames)
 * - Attack actions have hitboxes on active frames
 * - Non-attack actions have no hitboxes
 * - characterId matches
 * - Super flash tag on DM/SDM first frames
 */
import { describe, it, expect } from 'vitest';
import { KYO_ACTION_CONTRACTS, getKyoFrameContractManifest } from '../src/core/kyoFrameContract.js';
import { IORI_ACTION_CONTRACTS, getIoriFrameContractManifest } from '../src/core/ioriFrameContract.js';
import type { ActionContract } from '../src/core/frameContract.js';

const NON_ATTACK_ACTIONS = [
  'idle', 'walk_forward', 'walk_backward', 'jump', 'run', 'backdash',
  'roll', 'back_roll', 'crouch', 'block', 'dizzy', 'guard_crush',
  'max_mode', 'taunt', 'win', 'throw_action', 'hurt', 'knockdown',
];

const NORMAL_ATTACKS = [
  'stand_a', 'stand_b', 'stand_c', 'stand_d',
  'close_a', 'close_b', 'close_c', 'close_d',
  'crouch_a', 'crouch_b', 'crouch_c', 'crouch_d',
];

const KYO_SPECIALS = [
  'kyo_75kai', 'kyo_75kai_2', 'kyo_red_kick',
  'cmd_gofu_you', 'cmd_88shiki', 'cmd_naraku',
  'kyo_oniyaki', 'kyo_oniyaki_c',
  'kyo_yamibarai', 'kyo_yamibarai_c',
  'kyo_aragami', 'kyo_dokugami',
];

const KYO_DMS = ['dm_orochinagi', 'sdm_orochinagi'];

const IORI_SPECIALS = [
  'iori_yumeyumi', 'iori_katanugi', 'iori_yukiwarui',
  'iori_aoihana', 'iori_aoihana_2', 'iori_aoihana_3',
  'iori_yamibarai', 'iori_yamibarai_c',
  'iori_oniyaki', 'iori_oniyaki_c',
  'iori_kototsuki', 'iori_kuzukaze',
];

const IORI_DMS = ['dm_yaotome', 'sdm_yaotome'];

function validateActionContract(action: ActionContract, id: string) {
  // characterId
  expect(action.characterId, `${id}.characterId`).toBeDefined();

  // Frame count
  expect(action.frames.length, `${id}.frames.length`).toBeGreaterThan(0);
  expect(action.totalFrames, `${id}.totalFrames`).toBe(action.frames.length);

  // Each frame has required sprite fields
  for (let i = 0; i < action.frames.length; i++) {
    const frame = action.frames[i];
    expect(frame.sprite, `${id}.frame[${i}].sprite`).toBeDefined();
    expect(frame.sprite.duration, `${id}.frame[${i}].duration`).toBeGreaterThan(0);
  }

  // Attack consistency
  if (action.attackType !== null) {
    expect(action.startup + action.active + action.recovery,
      `${id} startup+active+recovery`).toBe(action.totalFrames);
  }
}

describe('Kyo Frame Contract', () => {
  const contracts = KYO_ACTION_CONTRACTS;

  it('has at least 35 actions', () => {
    expect(contracts.size).toBeGreaterThanOrEqual(35);
  });

  it('all non-attack actions present', () => {
    for (const id of NON_ATTACK_ACTIONS) {
      expect(contracts.has(id), `has ${id}`).toBe(true);
    }
  });

  it('all normal attacks present', () => {
    for (const id of NORMAL_ATTACKS) {
      expect(contracts.has(id), `has ${id}`).toBe(true);
    }
  });

  it('Kyo specials present', () => {
    for (const id of KYO_SPECIALS) {
      expect(contracts.has(id), `has ${id}`).toBe(true);
    }
  });

  it('Kyo DM/SDM present', () => {
    for (const id of KYO_DMS) {
      expect(contracts.has(id), `has ${id}`).toBe(true);
    }
  });

  it('all actions pass contract validation', () => {
    for (const [id, action] of contracts) {
      validateActionContract(action, id);
    }
  });

  it('non-attack actions have null attackType', () => {
    for (const id of NON_ATTACK_ACTIONS) {
      const action = contracts.get(id)!;
      expect(action.attackType, `${id}.attackType`).toBeNull();
    }
  });

  it('attack actions have hitboxes on active frames', () => {
    for (const id of NORMAL_ATTACKS) {
      const action = contracts.get(id)!;
      if (!action.attackType) continue;
      const activeStart = action.startup;
      const activeEnd = action.startup + action.active;
      let hasHitbox = false;
      for (let i = activeStart; i < activeEnd; i++) {
        if (action.frames[i].collision?.hitboxes?.length) {
          hasHitbox = true;
          break;
        }
      }
      expect(hasHitbox, `${id} has hitboxes during active frames`).toBe(true);
    }
  });

  it('startup frames have no hitboxes', () => {
    for (const id of NORMAL_ATTACKS) {
      const action = contracts.get(id)!;
      if (!action.attackType) continue;
      for (let i = 0; i < action.startup; i++) {
        expect(action.frames[i].collision, `${id}.frame[${i}] no collision during startup`).toBeNull();
      }
    }
  });

  it('heavy attacks have more startup than light', () => {
    const standA = contracts.get('stand_a')!;
    const standC = contracts.get('stand_c')!;
    expect(standC.startup).toBeGreaterThan(standA.startup);
  });

  it('crouch attacks are low hitLevel', () => {
    for (const id of ['crouch_a', 'crouch_b', 'crouch_c', 'crouch_d']) {
      const action = contracts.get(id)!;
      expect(action.hitLevel, `${id}.hitLevel`).toBe('LOW');
    }
  });

  it('stand_d is HIGH hitLevel', () => {
    expect(contracts.get('stand_d')!.hitLevel).toBe('HIGH');
  });

  it('DM has super_flash event tag on first frame', () => {
    const dm = contracts.get('dm_orochinagi')!;
    expect(dm.frames[0].eventTags).toContain('super_flash');
  });

  it('SDM has super_flash event tag on first frame', () => {
    const sdm = contracts.get('sdm_orochinagi')!;
    expect(sdm.frames[0].eventTags).toContain('super_flash');
  });

  it('SDM has more active frames than DM', () => {
    const dm = contracts.get('dm_orochinagi')!;
    const sdm = contracts.get('sdm_orochinagi')!;
    expect(sdm.active).toBeGreaterThan(dm.active);
  });

  it('oniyaki C has more active frames than oniyaki A', () => {
    const a = contracts.get('kyo_oniyaki')!;
    const c = contracts.get('kyo_oniyaki_c')!;
    expect(c.active).toBeGreaterThan(a.active);
  });

  it('getKyoFrameContractManifest returns valid manifest', () => {
    const manifest = getKyoFrameContractManifest();
    expect(manifest.characterId).toBe('kyo');
    expect(manifest.actions.size).toBeGreaterThan(0);
  });
});

describe('Iori Frame Contract', () => {
  const contracts = IORI_ACTION_CONTRACTS;

  it('has at least 30 actions', () => {
    expect(contracts.size).toBeGreaterThanOrEqual(30);
  });

  it('all non-attack actions present', () => {
    for (const id of NON_ATTACK_ACTIONS) {
      expect(contracts.has(id), `has ${id}`).toBe(true);
    }
  });

  it('all normal attacks present', () => {
    for (const id of NORMAL_ATTACKS) {
      expect(contracts.has(id), `has ${id}`).toBe(true);
    }
  });

  it('Iori specials present', () => {
    for (const id of IORI_SPECIALS) {
      expect(contracts.has(id), `has ${id}`).toBe(true);
    }
  });

  it('Iori DM/SDM present', () => {
    for (const id of IORI_DMS) {
      expect(contracts.has(id), `has ${id}`).toBe(true);
    }
  });

  it('all actions pass contract validation', () => {
    for (const [id, action] of contracts) {
      validateActionContract(action, id);
    }
  });

  it('characterId is iori', () => {
    for (const [id, action] of contracts) {
      expect(action.characterId, `${id}.characterId`).toBe('iori');
    }
  });

  it('attack actions have hitboxes on active frames', () => {
    for (const id of NORMAL_ATTACKS) {
      const action = contracts.get(id)!;
      if (!action.attackType) continue;
      const activeStart = action.startup;
      const activeEnd = action.startup + action.active;
      let hasHitbox = false;
      for (let i = activeStart; i < activeEnd; i++) {
        if (action.frames[i].collision?.hitboxes?.length) {
          hasHitbox = true;
          break;
        }
      }
      expect(hasHitbox, `${id} has hitboxes during active frames`).toBe(true);
    }
  });

  it('DM has super_flash event tag', () => {
    const dm = contracts.get('dm_yaotome')!;
    expect(dm.frames[0].eventTags).toContain('super_flash');
  });

  it('getIoriFrameContractManifest returns valid manifest', () => {
    const manifest = getIoriFrameContractManifest();
    expect(manifest.characterId).toBe('iori');
    expect(manifest.actions.size).toBeGreaterThan(0);
  });
});

describe('Kyo/Iori Frame Contract Cross-Validation', () => {
  it('no overlapping action IDs', () => {
    const kyoKeys = new Set(KYO_ACTION_CONTRACTS.keys());
    const ioriKeys = new Set(IORI_ACTION_CONTRACTS.keys());
    // Only generic actions (stand_a, idle, etc.) should overlap
    const genericActions = new Set([...NON_ATTACK_ACTIONS, ...NORMAL_ATTACKS, 'air_a', 'air_c', 'air_d']);
    for (const key of kyoKeys) {
      if (ioriKeys.has(key) && !genericActions.has(key)) {
        // Character-specific actions shouldn't overlap
        expect.fail(`Unexpected overlap: ${key}`);
      }
    }
  });

  it('both have same non-attack action count', () => {
    const kyoNonAttack = [...KYO_ACTION_CONTRACTS.keys()].filter(k => NON_ATTACK_ACTIONS.includes(k));
    const ioriNonAttack = [...IORI_ACTION_CONTRACTS.keys()].filter(k => NON_ATTACK_ACTIONS.includes(k));
    expect(kyoNonAttack.length).toBe(ioriNonAttack.length);
  });
});
