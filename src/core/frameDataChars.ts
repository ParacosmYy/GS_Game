/**
 * Character-specific frame data (specials + DM + SDM).
 * Merged into FRAME_DATA by frameDataConstants.ts.
 *
 * 数据源标注:
 * - 无标注: Dream Cancel Wiki KOF2002UM 精确数据
 * - KOF2002UM 校准数据: 基于KOF2002UM公开资料校准, 数据模式与精确来源一致
 *
 * Split into per-group files under frameData/ to stay under 2000 lines.
 */
import { KYO_FRAME_DATA } from '../content/characters/kyo/frameData/kyoFrameData.js';
import { IORI_FRAME_DATA } from '../content/characters/iori/frameData/ioriFrameData.js';
import { RYO_FRAME_DATA } from '../content/characters/ryo/frameData/ryoFrameData.js';
import { TERRY_KIM_DATA } from './frameData/frameDataTerryKim.js';
import { LEONA_ROBERT_MAI_DATA } from './frameData/frameDataLeonaRobertMai.js';
import { KDASH_KULA_ATHENA_CLARK_RALF_JOE_DATA } from './frameData/frameDataKdashKulaAthenaClarkRalfJoe.js';
import { ANDY_BILLY_CHANG_CHOI_MATURE_YAMAZAKI_DATA } from './frameData/frameDataAndyBillyChangChoiMatureYamazaki.js';
import { MARY_XIANGFEI_KASUMI_REST_DATA } from './frameData/frameDataMaryXiangfeiKasumiRest.js';

export const FRAME_DATA_CHARS = {
  // ── 京 (Kyo Kusanagi) — imported from content package ──
  ...KYO_FRAME_DATA,
  // ── 八神庵 (Iori Yagami) — imported from content package ──
  ...IORI_FRAME_DATA,
  // ── 特瑞+金 (Terry + Kim) ──
  ...TERRY_KIM_DATA,
  // ── 坂崎亮 (Ryo Sakazaki) — imported from content package ──
  ...RYO_FRAME_DATA,
  // ── 莉安娜+罗伯特+舞 (Leona + Robert + Mai) ──
  ...LEONA_ROBERT_MAI_DATA,
  // ── K'+库拉+雅典娜+克拉克+拉尔夫+乔 ──
  ...KDASH_KULA_ATHENA_CLARK_RALF_JOE_DATA,
  // ── 安迪+比利+陈+蔡+玛卓+山崎 ──
  ...ANDY_BILLY_CHANG_CHOI_MATURE_YAMAZAKI_DATA,
  // ── 玛丽+香绯+香澄+剩余 ──
  ...MARY_XIANGFEI_KASUMI_REST_DATA,
} as const;
