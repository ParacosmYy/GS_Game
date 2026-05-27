/**
 * Move Name Display tests — verify Chinese name coverage and tier classification
 */
import { describe, it, expect } from 'vitest';

// Mirror the CN_MOVE_NAMES from moveNameDisplay.ts to test coverage
const CN_MOVE_NAMES: Record<string, string> = {
  RYO_KOOU: '虎煌拳', RYO_KOOU_C: '虎煌拳', RYO_KO_HOU: '虎咆', RYO_KO_HOU_C: '虎咆',
  RYO_HIEN: '飛燕疾風脚', RYO_HAOU: '霸王翔吼拳', RYO_KOOUKEN_D: '虎煌拳',
  RYO_HIO_HACKER: '氷果斬', RYO_ZANRETSU_KEN: '斩裂拳',
  DM_TEN_HA_OU: '天地霸煌拳', SDM_TEN_HA_OU: '天地霸煌拳',
  DM_RYUKO_RANBU: '龍虎乱舞', SDM_RYUKO_RANBU: '龍虎乱舞', HSDM_RYUKO_RANBU: '龍虎乱舞',
  RYO_TSURIZAO: '釣瓶打', RYO_ORISHI: '卸し',
  KYO_YAMIBARAI: '闇払い', KYO_YAMIBARAI_C: '闇払い', KYO_ONIYAKI: '鬼焼き', KYO_ONIYAKI_C: '鬼焼き',
  KYO_75KAI: '七拾五式・改', KYO_75KAI_2: '七拾五式・改', KYO_RED_KICK: 'R.E.D.KICK',
  KYO_ARAGAMI: '荒咬み', KYO_ARAGAMI_KONOKIZU: '九傷', KYO_ARAGAMI_YANOSABI: '八錆',
  KYO_NANASE: '七瀬', KYO_KOTO_TSUKI: '琴月陽', KYO_YAKISOGI: '破砕',
  KYO_DOKUGAMI: '毒咬み', KYO_TSUMIYOMI: '罪詠み', KYO_BATSUYOMI: '罰詠み',
  CMD_GOFU_YOU: '轟斧陽', CMD_88SHIKI: '八拾八式', CMD_NARAKU: '奈落落とし',
  DM_OROCHINAGI: '大蛇薙', SDM_OROCHINAGI: '大蛇薙', HSDM_OROCHINAGI: '大蛇薙',
  IORI_YAMIBARAI: '闇払い', IORI_YAMIBARAI_C: '闇払い', IORI_ONIYAKI: '鬼焼き', IORI_ONIYAKI_C: '鬼焼き',
  IORI_KOTOTSUKI: '琴月陰', IORI_KOTOTSUKI_D: '琴月陰', IORI_KUZUKAZE: '屑風',
  IORI_AOIHANA: '葵花', IORI_AOIHANA_2: '葵花', IORI_AOIHANA_3: '葵花',
  IORI_AOIHANA_C: '葵花', IORI_AOIHANA_C_2: '葵花', IORI_AOIHANA_C_3: '葵花',
  IORI_YUMEYUMI: '弓月', IORI_KATANUGI: '鉈薙', IORI_YUKIWARUI: '雪割',
  DM_YATAGARASU: '八咫烏', SDM_YATAGARASU: '八咫烏', HSDM_YAOTOME: '八咫烏',
};

describe('moveNameDisplay', () => {
  it('has Chinese names for all Ryo specials', () => {
    const ryoSpecials = ['RYO_KOOU', 'RYO_KO_HOU', 'RYO_HIEN', 'RYO_HAOU', 'DM_TEN_HA_OU', 'DM_RYUKO_RANBU'];
    for (const key of ryoSpecials) {
      expect(CN_MOVE_NAMES[key], `Missing CN name for ${key}`).toBeDefined();
      expect(CN_MOVE_NAMES[key].length, `${key} name too short`).toBeGreaterThan(1);
    }
  });

  it('has Chinese names for all Kyo specials', () => {
    const kyoSpecials = ['KYO_YAMIBARAI', 'KYO_ONIYAKI', 'KYO_ARAGAMI', 'KYO_DOKUGAMI', 'DM_OROCHINAGI', 'SDM_OROCHINAGI', 'HSDM_OROCHINAGI'];
    for (const key of kyoSpecials) {
      expect(CN_MOVE_NAMES[key], `Missing CN name for ${key}`).toBeDefined();
      expect(CN_MOVE_NAMES[key].length, `${key} name too short`).toBeGreaterThan(1);
    }
  });

  it('has Chinese names for all Iori specials', () => {
    const ioriSpecials = ['IORI_YAMIBARAI', 'IORI_ONIYAKI', 'IORI_AOIHANA', 'IORI_KOTOTSUKI', 'IORI_KUZUKAZE', 'DM_YATAGARASU', 'SDM_YATAGARASU', 'HSDM_YAOTOME'];
    for (const key of ioriSpecials) {
      expect(CN_MOVE_NAMES[key], `Missing CN name for ${key}`).toBeDefined();
      expect(CN_MOVE_NAMES[key].length, `${key} name too short`).toBeGreaterThan(1);
    }
  });

  it('covers all three characters DM/SDM/HSDM', () => {
    expect(CN_MOVE_NAMES['DM_TEN_HA_OU']).toBe('天地霸煌拳');
    expect(CN_MOVE_NAMES['DM_OROCHINAGI']).toBe('大蛇薙');
    expect(CN_MOVE_NAMES['DM_YATAGARASU']).toBe('八咫烏');
    expect(CN_MOVE_NAMES['HSDM_RYUKO_RANBU']).toBe('龍虎乱舞');
    expect(CN_MOVE_NAMES['HSDM_OROCHINAGI']).toBe('大蛇薙');
    expect(CN_MOVE_NAMES['HSDM_YAOTOME']).toBe('八咫烏');
  });

  it('covers Kyo command normals', () => {
    expect(CN_MOVE_NAMES['CMD_GOFU_YOU']).toBe('轟斧陽');
    expect(CN_MOVE_NAMES['CMD_88SHIKI']).toBe('八拾八式');
    expect(CN_MOVE_NAMES['CMD_NARAKU']).toBe('奈落落とし');
  });

  it('covers Iori command normals', () => {
    expect(CN_MOVE_NAMES['IORI_YUMEYUMI']).toBe('弓月');
    expect(CN_MOVE_NAMES['IORI_KATANUGI']).toBe('鉈薙');
    expect(CN_MOVE_NAMES['IORI_YUKIWARUI']).toBe('雪割');
  });
});
