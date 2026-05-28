/**
 * Expanded Character Attack Frames Regression Tests
 *
 * Validates attack frame data for Terry, Kim, Ryo, Leona,
 * Athena, Mai, Clark, Ralf, Joe, and additional characters.
 */
import { describe, it, expect } from 'vitest';
import type { AttackFrame } from '../src/core/types.js';

// ===== Terry/Kim/Ryo/Leona =====
import {
  TERRY_BURN_KNUCKLE_FRAMES,
  TERRY_CRACK_SHOT_FRAMES,
  TERRY_POWER_WAVE_FRAMES,
  TERRY_POWER_DUNK_FRAMES,
  TERRY_RISING_TACKLE_FRAMES,
  KIM_HIENZAN_FRAMES,
  KIM_HANGETSU_FRAMES,
  KIM_HAKI_FRAMES,
  KIM_HISHOU_FRAMES,
  KIM_SANREN_FRAMES,
  RYO_KOOU_FRAMES,
  RYO_KOOU_C_FRAMES,
  RYO_KO_HOU_FRAMES,
  RYO_KO_HOU_C_FRAMES,
  RYO_HIEN_FRAMES,
  RYO_HAOU_FRAMES,
  LEONA_MOON_SLASH_FRAMES,
  LEONA_EAR_RING_FRAMES,
  LEONA_GRAND_SABER_FRAMES,
  LEONA_BALTIC_FRAMES,
} from '../src/core/attackFrames_split/terryKimRyoLeona.js';

// ===== Athena/Mai/Clark/Ralf/Joe =====
import {
  ATHENA_PSYCHO_BALL_FRAMES,
  ATHENA_PSYCHO_SWORD_FRAMES,
  ATHENA_PHOENIX_ARROW_FRAMES,
  DM_SHINING_CRYSTAL_BIT_FRAMES,
  MAI_KA_CHO_SEN_FRAMES,
  MAI_HISHO_RYU_EN_JIN_FRAMES,
  CLARK_ARGENTINE_FRAMES,
  CLARK_VULCAN_FRAMES,
  RALF_VULCAN_FRAMES,
  RALF_BACKBREAKER_FRAMES,
  JOE_HURRICANE_FRAMES,
  JOE_TIGER_KICK_FRAMES,
  JOE_BAKURETSUKEN_FRAMES,
  DM_SCREW_UPPER_FRAMES,
} from '../src/core/attackFrames_split/athenaMaiClarkRalfJoe.js';

// ===== Andy/Billy/Chang/Choi/Yashiro =====
import {
  ANDY_HISHOU_KEN_FRAMES,
  ANDY_SHOURYUU_DAN_FRAMES,
  ANDY_GEKI_HISHOU_KEN_FRAMES,
  DM_CHO_REPPA_DAN_FRAMES,
  BILLY_SANSETSU_KON_FRAMES,
  BILLY_SENPU_KON_FRAMES,
  CHANG_TEKKYUU_KAITEN_FRAMES,
  CHOI_SOUTEN_MEKKYAKU_FRAMES,
  CHOI_HISHOU_KYAKU_FRAMES,
} from '../src/core/attackFrames_split/andyBillyChangChoiYashiro.js';

// ===== Chris/Shermie/Rest =====
import {
  CHRIS_SHOT_WEAVE_FRAMES,
  CHRIS_TWISTER_DRIVE_FRAMES,
  SHERMIE_SHOOT_FRAMES,
  SHERMIE_CARNIVAL_FRAMES,
  XIANGFEI_KYU_HO_FRAMES,
  YAMAZAKI_SNAKE_ARM_FRAMES,
  KASUMI_KOOU_KEN_FRAMES,
} from '../src/core/attackFrames_split/chrisShermieRest.js';

function validateFrames(frames: AttackFrame[], name: string) {
  expect(frames.length, `${name} frame count`).toBeGreaterThan(0);
  for (let i = 0; i < frames.length; i++) {
    const f = frames[i];
    expect(Array.isArray(f.attack), `${name}[${i}].attack`).toBe(true);
    // Some frames (throws) may have empty attack arrays but throwBoxes
    const hasAttack = f.attack.length > 0;
    const hasThrow = (f as any).throwBoxes && (f as any).throwBoxes.length > 0;
    expect(hasAttack || hasThrow, `${name}[${i}] must have attack or throw boxes`).toBe(true);
    for (const box of f.attack) {
      expect(typeof box.ox).toBe('number');
      expect(typeof box.oy).toBe('number');
      expect(box.w, `${name}[${i}] w`).toBeGreaterThan(0);
      expect(box.h, `${name}[${i}] h`).toBeGreaterThan(0);
    }
  }
}

// ===== Terry =====
describe('Terry attack frames', () => {
  const terryFrames: [AttackFrame[], string][] = [
    [TERRY_BURN_KNUCKLE_FRAMES, 'BURN_KNUCKLE'],
    [TERRY_CRACK_SHOT_FRAMES, 'CRACK_SHOT'],
    [TERRY_POWER_WAVE_FRAMES, 'POWER_WAVE'],
    [TERRY_POWER_DUNK_FRAMES, 'POWER_DUNK'],
    [TERRY_RISING_TACKLE_FRAMES, 'RISING_TACKLE'],
  ];
  for (const [frames, name] of terryFrames) {
    it(`${name} has valid frames`, () => validateFrames(frames, name));
  }
});

// ===== Kim =====
describe('Kim attack frames', () => {
  const kimFrames: [AttackFrame[], string][] = [
    [KIM_HIENZAN_FRAMES, 'HIENZAN'],
    [KIM_HANGETSU_FRAMES, 'HANGETSU'],
    [KIM_HAKI_FRAMES, 'HAKI'],
    [KIM_HISHOU_FRAMES, 'HISHOU'],
    [KIM_SANREN_FRAMES, 'SANREN'],
  ];
  for (const [frames, name] of kimFrames) {
    it(`${name} has valid frames`, () => validateFrames(frames, name));
  }
});

// ===== Ryo Specials =====
describe('Ryo special attack frames (split file)', () => {
  it('KOOU has valid frames', () => validateFrames(RYO_KOOU_FRAMES, 'KOOU'));
  it('KOOU_C has valid frames', () => validateFrames(RYO_KOOU_C_FRAMES, 'KOOU_C'));
  it('KO_HOU has valid frames', () => validateFrames(RYO_KO_HOU_FRAMES, 'KO_HOU'));
  it('KO_HOU_C has valid frames', () => validateFrames(RYO_KO_HOU_C_FRAMES, 'KO_HOU_C'));
  it('HIEN has valid frames', () => validateFrames(RYO_HIEN_FRAMES, 'HIEN'));
  it('HAOU has valid frames', () => validateFrames(RYO_HAOU_FRAMES, 'HAOU'));

  it('C-version has same or more frames than A-version', () => {
    expect(RYO_KOOU_C_FRAMES.length).toBeGreaterThanOrEqual(RYO_KOOU_FRAMES.length);
    expect(RYO_KO_HOU_C_FRAMES.length).toBeGreaterThanOrEqual(RYO_KO_HOU_FRAMES.length);
  });
});

// ===== Leona =====
describe('Leona attack frames', () => {
  const leonaFrames: [AttackFrame[], string][] = [
    [LEONA_MOON_SLASH_FRAMES, 'MOON_SLASH'],
    [LEONA_EAR_RING_FRAMES, 'EAR_RING'],
    [LEONA_GRAND_SABER_FRAMES, 'GRAND_SABER'],
    [LEONA_BALTIC_FRAMES, 'BALTIC'],
  ];
  for (const [frames, name] of leonaFrames) {
    it(`${name} has valid frames`, () => validateFrames(frames, name));
  }
});

// ===== Athena =====
describe('Athena attack frames', () => {
  it('PSYCHO_BALL has valid frames', () => validateFrames(ATHENA_PSYCHO_BALL_FRAMES, 'PSYCHO_BALL'));
  it('PSYCHO_SWORD has valid frames', () => validateFrames(ATHENA_PSYCHO_SWORD_FRAMES, 'PSYCHO_SWORD'));
  it('PHOENIX_ARROW has valid frames', () => validateFrames(ATHENA_PHOENIX_ARROW_FRAMES, 'PHOENIX_ARROW'));
  it('DM_SHINING_CRYSTAL_BIT has valid frames', () => validateFrames(DM_SHINING_CRYSTAL_BIT_FRAMES, 'DM_SHINING_CRYSTAL_BIT'));
});

// ===== Mai =====
describe('Mai attack frames', () => {
  it('KA_CHO_SEN has valid frames', () => validateFrames(MAI_KA_CHO_SEN_FRAMES, 'KA_CHO_SEN'));
  it('HISHO_RYU_EN_JIN has valid frames', () => validateFrames(MAI_HISHO_RYU_EN_JIN_FRAMES, 'HISHO_RYU_EN_JIN'));
});

// ===== Clark =====
describe('Clark attack frames', () => {
  it('ARGENTINE has valid frames', () => validateFrames(CLARK_ARGENTINE_FRAMES, 'ARGENTINE'));
  it('VULCAN has valid frames', () => validateFrames(CLARK_VULCAN_FRAMES, 'VULCAN'));
});

// ===== Ralf =====
describe('Ralf attack frames', () => {
  it('VULCAN has valid frames', () => validateFrames(RALF_VULCAN_FRAMES, 'VULCAN'));
  it('BACKBREAKER has valid frames', () => validateFrames(RALF_BACKBREAKER_FRAMES, 'BACKBREAKER'));
});

// ===== Joe =====
describe('Joe attack frames', () => {
  it('HURRICANE has valid frames', () => validateFrames(JOE_HURRICANE_FRAMES, 'HURRICANE'));
  it('TIGER_KICK has valid frames', () => validateFrames(JOE_TIGER_KICK_FRAMES, 'TIGER_KICK'));
  it('BAKURETSUKEN has valid frames', () => validateFrames(JOE_BAKURETSUKEN_FRAMES, 'BAKURETSUKEN'));
  it('DM_SCREW_UPPER has valid frames', () => validateFrames(DM_SCREW_UPPER_FRAMES, 'DM_SCREW_UPPER'));
});

// ===== Andy =====
describe('Andy attack frames', () => {
  it('HISHOU_KEN has valid frames', () => validateFrames(ANDY_HISHOU_KEN_FRAMES, 'HISHOU_KEN'));
  it('SHOURYUU_DAN has valid frames', () => validateFrames(ANDY_SHOURYUU_DAN_FRAMES, 'SHOURYUU_DAN'));
  it('GEKI_HISHOU_KEN has valid frames', () => validateFrames(ANDY_GEKI_HISHOU_KEN_FRAMES, 'GEKI_HISHOU_KEN'));
  it('DM_CHO_REPPA_DAN has valid frames', () => validateFrames(DM_CHO_REPPA_DAN_FRAMES, 'DM_CHO_REPPA_DAN'));
});

// ===== Billy =====
describe('Billy attack frames', () => {
  it('SANSETSU_KON has valid frames', () => validateFrames(BILLY_SANSETSU_KON_FRAMES, 'SANSETSU_KON'));
  it('SENPU_KON has valid frames', () => validateFrames(BILLY_SENPU_KON_FRAMES, 'SENPU_KON'));
});

// ===== Chang =====
describe('Chang attack frames', () => {
  it('TEKKYUU_KAITEN has valid frames', () => validateFrames(CHANG_TEKKYUU_KAITEN_FRAMES, 'TEKKYUU_KAITEN'));
});

// ===== Choi =====
describe('Choi attack frames', () => {
  it('SOUTEN_MEKKYAKU has valid frames', () => validateFrames(CHOI_SOUTEN_MEKKYAKU_FRAMES, 'SOUTEN_MEKKYAKU'));
  it('HISHOU_KYAKU has valid frames', () => validateFrames(CHOI_HISHOU_KYAKU_FRAMES, 'HISHOU_KYAKU'));
});

// ===== Chris =====
describe('Chris attack frames', () => {
  it('SHOT_WEAVE has valid frames', () => validateFrames(CHRIS_SHOT_WEAVE_FRAMES, 'SHOT_WEAVE'));
  it('TWISTER_DRIVE has valid frames', () => validateFrames(CHRIS_TWISTER_DRIVE_FRAMES, 'TWISTER_DRIVE'));
});

// ===== Shermie =====
describe('Shermie attack frames', () => {
  it('SHOOT has valid frames', () => validateFrames(SHERMIE_SHOOT_FRAMES, 'SHOOT'));
  it('CARNIVAL has valid frames', () => validateFrames(SHERMIE_CARNIVAL_FRAMES, 'CARNIVAL'));
});

// ===== Xiangfei =====
describe('Xiangfei attack frames', () => {
  it('KYU_HO has valid frames', () => validateFrames(XIANGFEI_KYU_HO_FRAMES, 'KYU_HO'));
});

// ===== Yamazaki =====
describe('Yamazaki attack frames', () => {
  it('SNAKE_ARM has valid frames', () => validateFrames(YAMAZAKI_SNAKE_ARM_FRAMES, 'SNAKE_ARM'));
});

// ===== Kasumi =====
describe('Kasumi attack frames', () => {
  it('KOOU_KEN has valid frames', () => validateFrames(KASUMI_KOOU_KEN_FRAMES, 'KOOU_KEN'));
});
