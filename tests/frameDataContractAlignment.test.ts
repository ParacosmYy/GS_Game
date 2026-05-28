import { describe, it, expect } from 'vitest';
import { KYO_ACTION_CONTRACTS } from '../src/core/kyoFrameContract.js';
import { IORI_ACTION_CONTRACTS } from '../src/core/ioriFrameContract.js';
import { RYO_ACTION_CONTRACTS } from '../src/core/ryoFrameContract.js';
import { KYO_FRAME_DATA } from '../src/content/characters/kyo/frameData/kyoFrameData.js';
import { IORI_FRAME_DATA } from '../src/content/characters/iori/frameData/ioriFrameData.js';
import { RYO_FRAME_DATA } from '../src/content/characters/ryo/frameData/ryoFrameData.js';

type FD = { startup: number; active: number; recovery: number };

function checkAlignment(
  charId: string,
  contracts: Map<string, import('../src/core/frameContract.js').ActionContract>,
  frameData: Record<string, FD>,
) {
  const results: { action: string; field: string; contract: number; frameData: number }[] = [];
  let checked = 0;

  for (const [actionId, contract] of contracts) {
    const fdKey = (contract as { attackType?: string | null }).attackType ?? actionId;
    const fd = frameData[fdKey as string];
    if (!fd) continue;

    checked++;
    if (contract.startup !== fd.startup) {
      results.push({ action: actionId, field: 'startup', contract: contract.startup, frameData: fd.startup });
    }
    if (contract.active !== fd.active) {
      results.push({ action: actionId, field: 'active', contract: contract.active, frameData: fd.active });
    }
    if (contract.recovery !== fd.recovery) {
      results.push({ action: actionId, field: 'recovery', contract: contract.recovery, frameData: fd.recovery });
    }
    const expectedTotal = fd.startup + fd.active + fd.recovery;
    if (contract.totalFrames !== expectedTotal) {
      results.push({ action: actionId, field: 'totalFrames', contract: contract.totalFrames, frameData: expectedTotal });
    }
    if (contract.frames.length !== expectedTotal) {
      results.push({ action: actionId, field: 'frames.length', contract: contract.frames.length, frameData: expectedTotal });
    }
  }

  return { checked, mismatches: results };
}

describe('Kyo Frame Contract alignment', () => {
  const { checked, mismatches } = checkAlignment('kyo', KYO_ACTION_CONTRACTS, KYO_FRAME_DATA);

  it('validates at least 12 attack actions against FRAME_DATA', () => {
    expect(checked).toBeGreaterThanOrEqual(12);
  });

  it('all ActionContract startup/active/recovery match FRAME_DATA', () => {
    if (mismatches.length > 0) {
      const details = mismatches.map(m => `${m.action}.${m.field}: contract=${m.contract} frameData=${m.frameData}`);
      throw new Error(`Kyo has ${mismatches.length} misalignments:\n${details.join('\n')}`);
    }
    expect(mismatches).toHaveLength(0);
  });

  // Per-category spot checks to ensure key attack types are covered
  it('specials align (oniyaki, yamibarai, aragami, dokugami)', () => {
    const specials = ['kyo_oniyaki', 'kyo_oniyaki_c', 'kyo_yamibarai', 'kyo_yamibarai_c', 'kyo_aragami', 'kyo_dokugami'];
    const specialMismatches = mismatches.filter(m => specials.includes(m.action));
    expect(specialMismatches).toHaveLength(0);
  });

  it('command normals align (75kai, red_kick, gofu_you, 88shiki, naraku)', () => {
    const cmds = ['kyo_75kai', 'kyo_75kai_2', 'kyo_red_kick', 'cmd_gofu_you', 'cmd_88shiki', 'cmd_naraku'];
    const cmdMismatches = mismatches.filter(m => cmds.includes(m.action));
    expect(cmdMismatches).toHaveLength(0);
  });

  it('DM/SDM align (orochinagi)', () => {
    const supers = ['dm_orochinagi', 'sdm_orochinagi'];
    const superMismatches = mismatches.filter(m => supers.includes(m.action));
    expect(superMismatches).toHaveLength(0);
  });
});

describe('Iori Frame Contract alignment', () => {
  const { checked, mismatches } = checkAlignment('iori', IORI_ACTION_CONTRACTS, IORI_FRAME_DATA);

  it('validates at least 12 attack actions against FRAME_DATA', () => {
    expect(checked).toBeGreaterThanOrEqual(12);
  });

  it('all ActionContract startup/active/recovery match FRAME_DATA', () => {
    if (mismatches.length > 0) {
      const details = mismatches.map(m => `${m.action}.${m.field}: contract=${m.contract} frameData=${m.frameData}`);
      throw new Error(`Iori has ${mismatches.length} misalignments:\n${details.join('\n')}`);
    }
    expect(mismatches).toHaveLength(0);
  });

  it('specials align (aoihana, yamibarai, oniyaki, kototsuki, kuzukaze)', () => {
    const specials = ['iori_aoihana', 'iori_aoihana_2', 'iori_aoihana_3', 'iori_yamibarai', 'iori_yamibarai_c',
      'iori_oniyaki', 'iori_oniyaki_c', 'iori_kototsuki', 'iori_kuzukaze'];
    const specialMismatches = mismatches.filter(m => specials.includes(m.action));
    expect(specialMismatches).toHaveLength(0);
  });

  it('command normals align (yumeyumi, katanugi, yukiwarui)', () => {
    const cmds = ['iori_yumeyumi', 'iori_katanugi', 'iori_yukiwarui'];
    const cmdMismatches = mismatches.filter(m => cmds.includes(m.action));
    expect(cmdMismatches).toHaveLength(0);
  });

  it('DM/SDM align (yaotome)', () => {
    const supers = ['dm_yaotome', 'sdm_yaotome'];
    const superMismatches = mismatches.filter(m => supers.includes(m.action));
    expect(superMismatches).toHaveLength(0);
  });
});

describe('Ryo Frame Contract alignment', () => {
  const { checked, mismatches } = checkAlignment('ryo', RYO_ACTION_CONTRACTS, RYO_FRAME_DATA);

  it('validates at least 8 attack actions against FRAME_DATA', () => {
    expect(checked).toBeGreaterThanOrEqual(8);
  });

  it('all ActionContract startup/active/recovery match FRAME_DATA', () => {
    if (mismatches.length > 0) {
      const details = mismatches.map(m => `${m.action}.${m.field}: contract=${m.contract} frameData=${m.frameData}`);
      throw new Error(`Ryo has ${mismatches.length} misalignments:\n${details.join('\n')}`);
    }
    expect(mismatches).toHaveLength(0);
  });
});
