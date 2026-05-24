import { describe, it, expect } from 'vitest';
import { FRAME_DATA } from '../src/core/constants.js';

type FrameDataEntry = {
  startup: number;
  active: number;
  recovery: number;
  damage: number;
  hitstun: number;
  blockstun: number;
  pushback: number;
  hitLevel: 'MID' | 'LOW' | 'HIGH';
  knockdown: boolean;
  chipDamage?: number;
  counterWire?: boolean;
};

const VALID_HIT_LEVELS = new Set(['MID', 'LOW', 'HIGH']);

describe('FRAME_DATA 数据完整性校验', () => {
  const entries = Object.entries(FRAME_DATA) as [string, FrameDataEntry][];

  it('FRAME_DATA 应该有至少 50 个招式条目', () => {
    expect(entries.length).toBeGreaterThanOrEqual(50);
  });

  it('每个条目都有 startup > 0', () => {
    for (const [key, fd] of entries) {
      expect(fd.startup, `${key}.startup 应该 > 0`).toBeGreaterThan(0);
    }
  });

  it('每个条目都有 active > 0', () => {
    for (const [key, fd] of entries) {
      expect(fd.active, `${key}.active 应该 > 0`).toBeGreaterThan(0);
    }
  });

  it('每个条目都有 recovery >= 0', () => {
    for (const [key, fd] of entries) {
      expect(fd.recovery, `${key}.recovery 应该 >= 0`).toBeGreaterThanOrEqual(0);
    }
  });

  it('每个条目都有 damage > 0', () => {
    for (const [key, fd] of entries) {
      expect(fd.damage, `${key}.damage 应该 > 0`).toBeGreaterThan(0);
    }
  });

  it('每个条目的 hitLevel 是合法值 (MID/LOW/HIGH)', () => {
    for (const [key, fd] of entries) {
      expect(
        VALID_HIT_LEVELS.has(fd.hitLevel),
        `${key}.hitLevel="${fd.hitLevel}" 应该是 MID/LOW/HIGH 之一`
      ).toBe(true);
    }
  });

  it('每个条目的 knockdown 是布尔值', () => {
    for (const [key, fd] of entries) {
      expect(typeof fd.knockdown, `${key}.knockdown 应该是 boolean`).toBe('boolean');
    }
  });

  it('每个条目的 hitstun 和 blockstun >= 0', () => {
    for (const [key, fd] of entries) {
      expect(fd.hitstun, `${key}.hitstun 应该 >= 0`).toBeGreaterThanOrEqual(0);
      expect(fd.blockstun, `${key}.blockstun 应该 >= 0`).toBeGreaterThanOrEqual(0);
    }
  });

  it('每个条目的 pushback >= 0', () => {
    for (const [key, fd] of entries) {
      expect(fd.pushback, `${key}.pushback 应该 >= 0`).toBeGreaterThanOrEqual(0);
    }
  });

  it('startup + active + recovery 构成合理的总帧数 (>= 4)', () => {
    for (const [key, fd] of entries) {
      const total = fd.startup + fd.active + fd.recovery;
      expect(total, `${key} 总帧数应该 >= 4`).toBeGreaterThanOrEqual(4);
    }
  });

  it('chipDamage 如果存在应该 > 0', () => {
    for (const [key, fd] of entries) {
      if ('chipDamage' in fd && fd.chipDamage !== undefined) {
        expect(fd.chipDamage, `${key}.chipDamage 应该 > 0`).toBeGreaterThan(0);
      }
    }
  });

  // KOF2002UM 基本攻击类型都应该有帧数据
  const requiredNormals = [
    'STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
    'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
    'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
    'JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D',
    'STAND_CD', 'JUMP_CD',
    'THROW', 'THROW_FORWARD', 'THROW_BACK',
  ];

  it('基本攻击类型都应该有 FRAME_DATA 条目', () => {
    for (const atk of requiredNormals) {
      expect(FRAME_DATA[atk as keyof typeof FRAME_DATA], `${atk} 应该在 FRAME_DATA 中`).toBeDefined();
    }
  });

  // 角色专属必杀技也应该有帧数据
  const characterSpecials = [
    // Kyo
    'KYO_75KAI', 'KYO_75KAI_2', 'KYO_RED_KICK', 'KYO_ONIYAKI', 'KYO_ONIYAKI_C',
    'KYO_YAMIBARAI', 'KYO_YAMIBARAI_C',
    'KYO_ARAGAMI', 'KYO_ARAGAMI_KONOKIZU', 'KYO_ARAGAMI_YANOSABI',
    'KYO_DOKUGAMI', 'KYO_TSUMIYOMI', 'KYO_BATSUYOMI',
    // Iori
    'IORI_AOIHANA', 'IORI_AOIHANA_2', 'IORI_AOIHANA_3',
    'IORI_YAMIBARAI', 'IORI_YAMIBARAI_C',
    'IORI_ONIYAKI', 'IORI_ONIYAKI_C',
    'IORI_KOTOTSUKI', 'IORI_KUZUKAZE',
    // Terry
    'TERRY_POWER_WAVE', 'TERRY_BURN_KNUCKLE', 'TERRY_CRACK_SHOT',
    'TERRY_POWER_DUNK', 'TERRY_RISING_TACKLE',
    // Kim
    'KIM_HIENZAN', 'KIM_HANGETSU', 'KIM_HAKI', 'KIM_HISHOU', 'KIM_SANREN',
  ];

  it('角色专属必杀技都应该有 FRAME_DATA 条目', () => {
    for (const atk of characterSpecials) {
      expect(FRAME_DATA[atk as keyof typeof FRAME_DATA], `${atk} 应该在 FRAME_DATA 中`).toBeDefined();
    }
  });

  // DM 超必杀技应该有帧数据
  const dmAttacks = [
    'DM_OROCHINAGI', 'DM_YATAGARASU', 'DM_POWER_GEYSER',
    'DM_HIGH_ANGLE_GEYSER', 'DM_PHOENIX_KICK', 'DM_PHOENIX_HITEN',
  ];

  it('DM 超必杀技都应该有 FRAME_DATA 条目', () => {
    for (const atk of dmAttacks) {
      expect(FRAME_DATA[atk as keyof typeof FRAME_DATA], `${atk} 应该在 FRAME_DATA 中`).toBeDefined();
    }
  });

  it('DM 超必杀技伤害应该 >= 150 (正版KOF2002标准)', () => {
    for (const atk of dmAttacks) {
      const fd = FRAME_DATA[atk as keyof typeof FRAME_DATA];
      expect(fd.damage, `${atk}.damage 应该 >= 150`).toBeGreaterThanOrEqual(150);
    }
  });

  it('DM 超必杀技都应该带 chipDamage', () => {
    for (const atk of dmAttacks) {
      const fd = FRAME_DATA[atk as keyof typeof FRAME_DATA] as FrameDataEntry;
      expect(fd.chipDamage, `${atk} 应该有 chipDamage`).toBeGreaterThan(0);
    }
  });
});
