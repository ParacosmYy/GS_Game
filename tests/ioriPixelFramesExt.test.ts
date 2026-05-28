/**
 * Iori Extended Pixel Frame Tests — Close Attacks, Crouch Attacks, Air Attacks, Super, Command Normals
 */
import { describe, it, expect } from 'vitest';
import type { PixelFrame } from '../src/rendering/sprites/kyo/kyoIdleFrames.js';
import { IORI_CLOSE_A_FRAMES, IORI_CLOSE_C_FRAMES, IORI_CLOSE_B_FRAMES, IORI_CLOSE_D_FRAMES } from '../src/rendering/sprites/iori/ioriCloseAttackFrames.js';
import { IORI_CROUCH_A_FRAMES as CRA, IORI_CROUCH_C_FRAMES as CRC, IORI_CROUCH_B_FRAMES as CRB, IORI_CROUCH_D_FRAMES as CRD } from '../src/rendering/sprites/iori/ioriCrouchAttackFrames.js';
import { IORI_YATAGARASU_DM_FRAMES, IORI_YATAGARASU_SDM_FRAMES, IORI_YAOTOME_HSDM_FRAMES } from '../src/rendering/sprites/iori/ioriSuperFrames.js';
import { IORI_YUMEYUMI_FRAMES, IORI_KATANUGI_FRAMES, IORI_YUKIWARUI_FRAMES } from '../src/rendering/sprites/iori/ioriCommandNormalFrames.js';
import { IORI_AIR_A_FRAMES, IORI_AIR_B_FRAMES, IORI_AIR_C_FRAMES, IORI_AIR_D_FRAMES } from '../src/rendering/sprites/iori/ioriAirAttackFrames.js';

function v(frames: PixelFrame[], label: string) {
  it(`${label} has valid structure`, () => {
    expect(frames.length).toBeGreaterThan(0);
    for (let i = 0; i < frames.length; i++) {
      const f = frames[i];
      expect(f.width, `${label}[${i}].width`).toBeGreaterThan(0);
      expect(f.height, `${label}[${i}].height`).toBeGreaterThan(0);
      expect(f.palette, `${label}[${i}].palette`).toBeDefined();
      expect(f.pixels.length, `${label}[${i}].pixels rows`).toBeGreaterThan(0);
    }
  });
}

describe('Iori Close Attacks', () => { v(IORI_CLOSE_A_FRAMES, 'IORI_CLA'); v(IORI_CLOSE_C_FRAMES, 'IORI_CLC'); v(IORI_CLOSE_B_FRAMES, 'IORI_CLB'); v(IORI_CLOSE_D_FRAMES, 'IORI_CLD'); });
describe('Iori Crouch Attacks', () => { v(CRA, 'IORI_CRA'); v(CRC, 'IORI_CRC'); v(CRB, 'IORI_CRB'); v(CRD, 'IORI_CRD'); });
describe('Iori Super Frames', () => { v(IORI_YATAGARASU_DM_FRAMES, 'IORI_DM'); v(IORI_YATAGARASU_SDM_FRAMES, 'IORI_SDM'); v(IORI_YAOTOME_HSDM_FRAMES, 'IORI_HSDM'); });
describe('Iori Command Normals', () => { v(IORI_YUMEYUMI_FRAMES, 'IORI_YMY'); v(IORI_KATANUGI_FRAMES, 'IORI_KTN'); v(IORI_YUKIWARUI_FRAMES, 'IORI_YKW'); });
describe('Iori Air Attacks', () => { v(IORI_AIR_A_FRAMES, 'IORI_AIA'); v(IORI_AIR_B_FRAMES, 'IORI_AIB'); v(IORI_AIR_C_FRAMES, 'IORI_AIC'); v(IORI_AIR_D_FRAMES, 'IORI_AID'); });

describe('Iori super frame progression', () => {
  it('SDM has >= DM frames', () => { expect(IORI_YATAGARASU_SDM_FRAMES.length).toBeGreaterThanOrEqual(IORI_YATAGARASU_DM_FRAMES.length); });
  it('HSDM has >= DM frames', () => { expect(IORI_YAOTOME_HSDM_FRAMES.length).toBeGreaterThanOrEqual(IORI_YATAGARASU_DM_FRAMES.length); });
});
