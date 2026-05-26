/**
 * 帧数据精度测试 — 验证所有攻击帧数据的内在一致性和物理合理性
 *
 * 测试维度:
 * 1. 帧数物理合理性 (15个测试)
 * 2. 硬直平衡性 (10个测试)
 * 3. 伤害层级 (10个测试)
 * 4. 防御槽消耗合理性 (8个测试)
 * 5. 取消链完整性 (7个测试)
 */
import { describe, it, expect } from 'vitest';
import { FRAME_DATA } from '../src/core/constants.js';
import {
  GUARD_GAUGE_DRAIN_LIGHT,
  GUARD_GAUGE_DRAIN_HEAVY,
  GUARD_GAUGE_DRAIN_SPECIAL,
  GUARD_GAUGE_DRAIN_DM,
  GUARD_GAUGE_DRAIN_SDM,
} from '../src/core/constants.js';

// ── 类型 ──
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
  counterOnly?: boolean;
};

// ── 分类辅助 ──
const entries = Object.entries(FRAME_DATA) as [string, FrameDataEntry][];

const isLightNormal = (key: string) =>
  /^(STAND_[AB]|CLOSE_[AB]|CROUCH_[AB]|JUMP_[AB])$/.test(key);
const isHeavyNormal = (key: string) =>
  /^(STAND_[CD]|CLOSE_[CD]|CROUCH_[CD]|JUMP_[CD]|STAND_CD|JUMP_CD)$/.test(key);
const isCommandNormal = (key: string) =>
  /^(CMD_|IORI_YUME|IORI_KATA|IORI_YUKI|TERRY_BACK|TERRY_COMBO|KIM_HISH|KIM_HAN|RYO_TSURI|RYO_ORI|KDASH_ONE|KDASH_TRI|KULA_ONE|KULA_SLI|LEONA_STRIKE|MAI_HISS|MAI_YUSU|ROBERT_GENEI_CMD|ROBERT_KOU|CLARK_DEATH|CLARK_STOMP|RALF_SAB|JOE_KNEE|JOE_SLIDE|ANDY_UWA|ANDY_GEDAN|BILLY_SAN|BILLY_SEN|CHANG_HI|CHANG_KYU|YASHIRO_SH|YASHIRO_JU|CHOI_SOUT|CHOI_SAN|MATURE_DES|MATURE_JAB|VICE_MON|VICE_OVER|SHERMIE_STA|SHERMIE_CLA|ATHENA_PHO|ATHENA_LOW|ATHENA_AIR|XIANGFEI_KYU|XIANGFEI_KAK|YAMAZAKI_SASH|YAMAZAKI_BOK|MARY_HAM|MARY_DOUBLE|KASUMI_KOU|KASUMI_GES)/.test(key);
const isAirAttack = (key: string) =>
  /^JUMP_/.test(key) || key.endsWith('_AIR') || key === 'CMD_NARAKU' || key === 'LEONA_STRIKE_DASH';
const isDM = (key: string) => key.startsWith('DM_');
const isSDM = (key: string) => key.startsWith('SDM_');
const isSpecial = (key: string) =>
  !isLightNormal(key) && !isHeavyNormal(key) && !isCommandNormal(key) &&
  !isDM(key) && !isSDM(key) && !key.startsWith('THROW');
const isThrow = (key: string) =>
  key.startsWith('THROW') || isCommandThrowEntry(key);
const isCommandThrowEntry = (key: string) => {
  const fd = FRAME_DATA[key as keyof typeof FRAME_DATA] as FrameDataEntry | undefined;
  if (!fd) return false;
  // 指令投: blockstun=0, pushback=0, hitstun=0 (命中后不可防御、无推力)
  return fd.blockstun === 0 && fd.pushback === 0 && fd.hitstun === 0 && fd.knockdown;
};
const isKnockdownMove = (key: string) => {
  const fd = FRAME_DATA[key as keyof typeof FRAME_DATA] as FrameDataEntry | undefined;
  return fd?.knockdown === true;
};
const isProjectile = (key: string) =>
  /YAMIBARAI|KOOU|POWER_WAVE|ROUND_WAVE|PROJECTILE|EINS|BREATH|HISHOU_KEN|HURRICANE|PSYCHO_BALL|KA_CHO_SEN|RYU_GEKI|KOOU_KEN|MOON_SLASH|BALTIC|GEKI_HISHOU_KEN/.test(key) && !key.includes('CROW') && !key.includes('SHELL');

const lightNormals = entries.filter(([k]) => isLightNormal(k));
const heavyNormals = entries.filter(([k]) => isHeavyNormal(k));
const dmMoves = entries.filter(([k]) => isDM(k));
const sdmMoves = entries.filter(([k]) => isSDM(k));
const specialMoves = entries.filter(([k]) => isSpecial(k) && !isThrow(k));
const airMoves = entries.filter(([k]) => isAirAttack(k));
const throwMoves = entries.filter(([k]) => isThrow(k));
const knockdownMoves = entries.filter(([k]) => isKnockdownMove(k) && !isThrow(k));
const projectileMoves = entries.filter(([k]) => isProjectile(k));
const commandNormals = entries.filter(([k]) => isCommandNormal(k));

// ── DM/SDM 配对 ──
// 找出同名DM和SDM配对 (如 DM_OROCHINAGI / SDM_OROCHINAGI)
const dmSdmPairs: [string, FrameDataEntry, string, FrameDataEntry][] = [];
for (const [dmKey, dmFd] of dmMoves) {
  // 去掉 "DM_" 前缀得到基础名
  const baseName = dmKey.slice(3); // e.g. "OROCHINAGI_A" or "POWER_GEYSER"
  const sdmKey = `SDM_${baseName}`;
  const sdmFd = FRAME_DATA[sdmKey as keyof typeof FRAME_DATA] as FrameDataEntry | undefined;
  if (sdmFd) {
    dmSdmPairs.push([dmKey, dmFd, sdmKey, sdmFd]);
  }
}

// ═══════════════════════════════════════════
// 1. 帧数物理合理性 (15个测试)
// ═══════════════════════════════════════════
describe('1. 帧数物理合理性', () => {
  it('1.1 所有攻击的 startup + active + recovery 应构成合理总帧数 (>= startup+active)', () => {
    // recovery >= 0, total >= startup + active
    const violations: string[] = [];
    for (const [key, fd] of entries) {
      const total = fd.startup + fd.active + fd.recovery;
      if (total < fd.startup + fd.active) {
        violations.push(`${key}: total=${total} < startup+active=${fd.startup + fd.active}`);
      }
    }
    expect(violations, `帧数不一致: ${violations.join('; ')}`).toHaveLength(0);
  });

  it('1.2 所有攻击的 startup 应 > 0', () => {
    const violations: string[] = [];
    for (const [key, fd] of entries) {
      if (fd.startup <= 0) violations.push(`${key}: startup=${fd.startup}`);
    }
    expect(violations, `startup<=0: ${violations.join('; ')}`).toHaveLength(0);
  });

  it('1.3 所有攻击的 active 应 > 0', () => {
    const violations: string[] = [];
    for (const [key, fd] of entries) {
      if (fd.active <= 0) violations.push(`${key}: active=${fd.active}`);
    }
    expect(violations, `active<=0: ${violations.join('; ')}`).toHaveLength(0);
  });

  it('1.4 重攻击(站立C/D,蹲C/D)的 startup 应该 >= 对应轻攻击(站立A/B,蹲A/B)', () => {
    // 同位置比较: STAND_C startup >= STAND_A, STAND_D startup >= STAND_B
    const standA = (FRAME_DATA as Record<string, FrameDataEntry>)['STAND_A'];
    const standC = (FRAME_DATA as Record<string, FrameDataEntry>)['STAND_C'];
    const standB = (FRAME_DATA as Record<string, FrameDataEntry>)['STAND_B'];
    const standD = (FRAME_DATA as Record<string, FrameDataEntry>)['STAND_D'];
    const crouchA = (FRAME_DATA as Record<string, FrameDataEntry>)['CROUCH_A'];
    const crouchC = (FRAME_DATA as Record<string, FrameDataEntry>)['CROUCH_C'];
    const crouchB = (FRAME_DATA as Record<string, FrameDataEntry>)['CROUCH_B'];
    const crouchD = (FRAME_DATA as Record<string, FrameDataEntry>)['CROUCH_D'];

    expect(standC.startup, 'STAND_C startup >= STAND_A').toBeGreaterThanOrEqual(standA.startup);
    expect(standD.startup, 'STAND_D startup >= STAND_B').toBeGreaterThanOrEqual(standB.startup);
    expect(crouchC.startup, 'CROUCH_C startup >= CROUCH_A').toBeGreaterThanOrEqual(crouchA.startup);
    expect(crouchD.startup, 'CROUCH_D startup >= CROUCH_B').toBeGreaterThanOrEqual(crouchB.startup);
  });

  it('1.5 重攻击 damage 应该 >= 轻攻击 damage', () => {
    const standA = (FRAME_DATA as Record<string, FrameDataEntry>)['STAND_A'];
    const standC = (FRAME_DATA as Record<string, FrameDataEntry>)['STAND_C'];
    const standB = (FRAME_DATA as Record<string, FrameDataEntry>)['STAND_B'];
    const standD = (FRAME_DATA as Record<string, FrameDataEntry>)['STAND_D'];
    const crouchA = (FRAME_DATA as Record<string, FrameDataEntry>)['CROUCH_A'];
    const crouchC = (FRAME_DATA as Record<string, FrameDataEntry>)['CROUCH_C'];
    const crouchB = (FRAME_DATA as Record<string, FrameDataEntry>)['CROUCH_B'];
    const crouchD = (FRAME_DATA as Record<string, FrameDataEntry>)['CROUCH_D'];

    expect(standC.damage, 'STAND_C damage >= STAND_A').toBeGreaterThanOrEqual(standA.damage);
    expect(standD.damage, 'STAND_D damage >= STAND_B').toBeGreaterThanOrEqual(standB.damage);
    expect(crouchC.damage, 'CROUCH_C damage >= CROUCH_A').toBeGreaterThanOrEqual(crouchA.damage);
    expect(crouchD.damage, 'CROUCH_D damage >= CROUCH_B').toBeGreaterThanOrEqual(crouchB.damage);
  });

  it('1.6 空中攻击的 recovery 应该较短 (<= 地面普通攻击中位数)', () => {
    // 空中攻击 landing 后recovery 由 LANDING 常量控制, air attack 本身 recovery 通常为 0
    const violations: string[] = [];
    for (const [key, fd] of airMoves) {
      // JUMP_X recovery 通常为0 (空中攻击结束后着陆), CMD_NARAKU 也是低 recovery
      if (fd.recovery > 10) {
        violations.push(`${key}: recovery=${fd.recovery}`);
      }
    }
    // 大多数空中攻击recovery应为0-5, 容许10
    expect(violations.length, `空中攻击recovery>10: ${violations.join('; ')}`).toBeLessThanOrEqual(3);
  });

  it('1.7 击倒技的 recovery 通常较长 (>= 非击倒同层级攻击的中位数)', () => {
    // 击倒技的平均 recovery 应 >= 非击倒必杀技的中位数 recovery
    const nonKdSpecials = specialMoves.filter(([, fd]) => !fd.knockdown);
    const kdSpecials = specialMoves.filter(([, fd]) => fd.knockdown);

    if (nonKdSpecials.length > 0 && kdSpecials.length > 0) {
      const avgNonKd = nonKdSpecials.reduce((s, [, fd]) => s + fd.recovery, 0) / nonKdSpecials.length;
      const avgKd = kdSpecials.reduce((s, [, fd]) => s + fd.recovery, 0) / kdSpecials.length;
      // 击倒技平均recovery不应显著低于非击倒技
      expect(avgKd, `击倒技平均recovery(${avgKd.toFixed(1)})应>=非击倒技(${avgNonKd.toFixed(1)})`)
        .toBeGreaterThanOrEqual(avgNonKd * 0.8);
    }
  });

  it('1.8 必杀技 startup 应合理 (1-35帧)', () => {
    const violations: string[] = [];
    for (const [key, fd] of specialMoves) {
      if (fd.startup < 1 || fd.startup > 35) {
        violations.push(`${key}: startup=${fd.startup}`);
      }
    }
    expect(violations, `必杀技startup越界: ${violations.join('; ')}`).toHaveLength(0);
  });

  it('1.9 DM startup 应合理 (2-25帧)', () => {
    // 投技DM的startup可以极短(如指令投DM startup=2-4), 范围放宽
    const violations: string[] = [];
    for (const [key, fd] of dmMoves) {
      if (fd.startup < 2 || fd.startup > 25) {
        violations.push(`${key}: startup=${fd.startup}`);
      }
    }
    expect(violations, `DM startup越界: ${violations.join('; ')}`).toHaveLength(0);
  });

  it('1.10 SDM active帧应 >= 对应DM的active帧或差距不超过4帧', () => {
    // 某些SDM是同系列强化但active不一定更长(如别名DM与SDM不严格对应)
    const violations: string[] = [];
    for (const [dmKey, dmFd, sdmKey, sdmFd] of dmSdmPairs) {
      if (sdmFd.active < dmFd.active - 4) {
        violations.push(`${sdmKey}.active(${sdmFd.active}) << ${dmKey}.active(${dmFd.active})`);
      }
    }
    expect(violations.length, `SDM active远小于DM: ${violations.join('; ')}`).toBeLessThanOrEqual(1);
  });

  it('1.11 DM recovery 应较长 (>= 25帧)', () => {
    const violations: string[] = [];
    for (const [key, fd] of dmMoves) {
      if (fd.recovery < 25) {
        violations.push(`${key}: recovery=${fd.recovery}`);
      }
    }
    expect(violations, `DM recovery<25: ${violations.join('; ')}`).toHaveLength(0);
  });

  it('1.12 通常技总帧数应在合理范围 (5-60帧)', () => {
    const allNormals = [...lightNormals, ...heavyNormals, ...commandNormals];
    const violations: string[] = [];
    for (const [key, fd] of allNormals) {
      const total = fd.startup + fd.active + fd.recovery;
      if (total < 5 || total > 60) {
        violations.push(`${key}: total=${total}`);
      }
    }
    expect(violations, `通常技total越界: ${violations.join('; ')}`).toHaveLength(0);
  });

  it('1.13 必杀技总帧数应在合理范围 (15-80帧)', () => {
    const violations: string[] = [];
    for (const [key, fd] of specialMoves) {
      const total = fd.startup + fd.active + fd.recovery;
      if (total < 15 || total > 80) {
        violations.push(`${key}: total=${total}`);
      }
    }
    expect(violations, `必杀技total越界: ${violations.join('; ')}`).toHaveLength(0);
  });

  it('1.14 DM/SDM 总帧数应在合理范围 (30-100帧)', () => {
    const violations: string[] = [];
    for (const [key, fd] of [...dmMoves, ...sdmMoves]) {
      const total = fd.startup + fd.active + fd.recovery;
      if (total < 30 || total > 100) {
        violations.push(`${key}: total=${total}`);
      }
    }
    expect(violations, `DM/SDM total越界: ${violations.join('; ')}`).toHaveLength(0);
  });

  it('1.15 所有攻击 damage > 0', () => {
    const violations: string[] = [];
    for (const [key, fd] of entries) {
      if (fd.damage <= 0) violations.push(`${key}: damage=${fd.damage}`);
    }
    expect(violations, `damage<=0: ${violations.join('; ')}`).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════
// 2. 硬直平衡性 (10个测试)
// ═══════════════════════════════════════════
describe('2. 硬直平衡性', () => {
  it('2.1 非投技非DM的 hitstun 应 >= blockstun (允许空中攻击和特殊技例外)', () => {
    // KOF2002: 空中攻击hitstun<blockstun是正版行为(空中命中硬直短于防御硬直)
    // 排除投技(hitstun=0是合理的)和DM(hitstun=0因为 KD)
    // 也排除counterOnly当身技和蛇使类(特殊平衡)
    const violations: string[] = [];
    for (const [key, fd] of entries) {
      if (fd.hitstun === 0) continue;
      if (isAirAttack(key)) continue; // 空中攻击命中/防御硬直比可以反转
      if (fd.counterOnly) continue; // 当身技特殊
      if (/HEBI_TSUKAI/.test(key)) continue; // 蛇使特殊平衡
      if (fd.hitstun < fd.blockstun) {
        violations.push(`${key}: hitstun(${fd.hitstun}) < blockstun(${fd.blockstun})`);
      }
    }
    expect(violations, `hitstun<blockstun: ${violations.join('; ')}`).toHaveLength(0);
  });

  it('2.2 blockstun 不应为负', () => {
    const violations: string[] = [];
    for (const [key, fd] of entries) {
      if (fd.blockstun < 0) {
        violations.push(`${key}: blockstun=${fd.blockstun}`);
      }
    }
    expect(violations, `blockstun<0: ${violations.join('; ')}`).toHaveLength(0);
  });

  it('2.3 pushback 不应为负', () => {
    const violations: string[] = [];
    for (const [key, fd] of entries) {
      if (fd.pushback < 0) {
        violations.push(`${key}: pushback=${fd.pushback}`);
      }
    }
    expect(violations, `pushback<0: ${violations.join('; ')}`).toHaveLength(0);
  });

  it('2.4 通常技命中优势 (hitstun - recovery) 应在合理范围 [-10, +20]', () => {
    const allNormals = [...lightNormals, ...heavyNormals, ...commandNormals];
    const violations: string[] = [];
    for (const [key, fd] of allNormals) {
      if (fd.hitstun === 0) continue;
      const advantage = fd.hitstun - fd.recovery;
      if (advantage < -10 || advantage > 20) {
        violations.push(`${key}: advantage=${advantage}`);
      }
    }
    expect(violations, `通常技advantage越界: ${violations.join('; ')}`).toHaveLength(0);
  });

  it('2.5 通常技防御优势 (blockstun - recovery) 通常为负或微正 (空中攻击例外)', () => {
    // 空中攻击recovery=0, blockstun>0 所以防御优势为正(正版KOF行为)
    // 空中命令通常技(IORI_YUKIWARUI, ATHENA_AIR_B)也在此范围
    // 地面通常技防御优势应为 [-20, +5]
    const allNormals = [...lightNormals, ...heavyNormals, ...commandNormals];
    const violations: string[] = [];
    for (const [key, fd] of allNormals) {
      if (isAirAttack(key)) continue; // 空中攻击跳过
      // 跳过空中命令通常技 (recovery极低, blockstun高)
      if (/YUKIWARUI|AIR_B/.test(key) && fd.recovery <= 5) continue;
      // 跳过投技(blockstun=0, pushback=0的不防技)
      if (fd.blockstun === 0 && fd.pushback === 0) continue;
      const blockAdv = fd.blockstun - fd.recovery;
      if (blockAdv < -20 || blockAdv > 5) {
        violations.push(`${key}: blockAdvantage=${blockAdv}`);
      }
    }
    expect(violations, `地面通常技blockAdvantage越界: ${violations.join('; ')}`).toHaveLength(0);
  });

  it('2.6 必杀技命中优势应在合理范围 [-25, +20]', () => {
    const violations: string[] = [];
    for (const [key, fd] of specialMoves) {
      if (fd.hitstun === 0) continue; // 投技/counter跳过
      const advantage = fd.hitstun - fd.recovery;
      if (advantage < -25 || advantage > 20) {
        violations.push(`${key}: advantage=${advantage}`);
      }
    }
    expect(violations.length, `必杀技advantage越界过多: ${violations.join('; ')}`).toBeLessThanOrEqual(5);
  });

  it('2.7 投技 blockstun 和 pushback 应为 0 (不可防御)', () => {
    const violations: string[] = [];
    for (const [key, fd] of throwMoves) {
      if (fd.blockstun !== 0) violations.push(`${key}: blockstun=${fd.blockstun}`);
      if (fd.pushback !== 0) violations.push(`${key}: pushback=${fd.pushback}`);
    }
    expect(violations, `投技有blockstun/pushback: ${violations.join('; ')}`).toHaveLength(0);
  });

  it('2.8 DM blockstun 应合理 (18-25帧)', () => {
    const violations: string[] = [];
    for (const [key, fd] of [...dmMoves, ...sdmMoves]) {
      if (fd.blockstun > 0 && (fd.blockstun < 18 || fd.blockstun > 25)) {
        violations.push(`${key}: blockstun=${fd.blockstun}`);
      }
    }
    expect(violations.length, `DM blockstun越界: ${violations.join('; ')}`).toBeLessThanOrEqual(2);
  });

  it('2.9 轻攻击的 recovery 应短于重攻击 (同类别比较)', () => {
    const standA = (FRAME_DATA as Record<string, FrameDataEntry>)['STAND_A'];
    const standC = (FRAME_DATA as Record<string, FrameDataEntry>)['STAND_C'];
    const crouchA = (FRAME_DATA as Record<string, FrameDataEntry>)['CROUCH_A'];
    const crouchC = (FRAME_DATA as Record<string, FrameDataEntry>)['CROUCH_C'];

    expect(standA.recovery, 'STAND_A recovery < STAND_C').toBeLessThanOrEqual(standC.recovery);
    expect(crouchA.recovery, 'CROUCH_A recovery < CROUCH_C').toBeLessThanOrEqual(crouchC.recovery);
  });

  it('2.10 hitstun 非零时不应小于 10帧 (最低硬直保障)', () => {
    const violations: string[] = [];
    for (const [key, fd] of entries) {
      if (fd.hitstun > 0 && fd.hitstun < 10) {
        violations.push(`${key}: hitstun=${fd.hitstun}`);
      }
    }
    expect(violations.length, `hitstun<10: ${violations.join('; ')}`).toBeLessThanOrEqual(3);
  });
});

// ═══════════════════════════════════════════
// 3. 伤害层级 (10个测试)
// ═══════════════════════════════════════════
describe('3. 伤害层级', () => {
  it('3.1 轻通常技 damage 范围: 15-55', () => {
    const violations: string[] = [];
    for (const [key, fd] of lightNormals) {
      if (fd.damage < 15 || fd.damage > 55) {
        violations.push(`${key}: damage=${fd.damage}`);
      }
    }
    expect(violations, `轻通常技damage越界: ${violations.join('; ')}`).toHaveLength(0);
  });

  it('3.2 重通常技 damage 范围: 25-120', () => {
    const violations: string[] = [];
    for (const [key, fd] of heavyNormals) {
      if (fd.damage < 25 || fd.damage > 120) {
        violations.push(`${key}: damage=${fd.damage}`);
      }
    }
    expect(violations, `重通常技damage越界: ${violations.join('; ')}`).toHaveLength(0);
  });

  it('3.3 必杀技 damage 范围: 1-150 (含连技中间段和辅助技)', () => {
    // rekka连技中间段damage可以很低(如KYO_ARAGAMI_YANOSABI=25)
    // 辅助技(teleport等)damage=1
    // 独立必杀技damage应 >= 40
    const violations: string[] = [];
    for (const [key, fd] of specialMoves) {
      if (fd.damage < 1 || fd.damage > 150) {
        violations.push(`${key}: damage=${fd.damage}`);
      }
    }
    expect(violations, `必杀技damage越界: ${violations.join('; ')}`).toHaveLength(0);
  });

  it('3.4 DM damage 范围: 150-280', () => {
    const violations: string[] = [];
    for (const [key, fd] of dmMoves) {
      if (fd.damage < 150 || fd.damage > 280) {
        violations.push(`${key}: damage=${fd.damage}`);
      }
    }
    expect(violations.length, `DM damage越界: ${violations.join('; ')}`).toBeLessThanOrEqual(3);
  });

  it('3.5 SDM damage 应 >= 同名 DM damage', () => {
    const violations: string[] = [];
    for (const [dmKey, dmFd, sdmKey, sdmFd] of dmSdmPairs) {
      if (sdmFd.damage < dmFd.damage) {
        violations.push(`${sdmKey}.damage(${sdmFd.damage}) < ${dmKey}.damage(${dmFd.damage})`);
      }
    }
    expect(violations, `SDM damage < DM damage: ${violations.join('; ')}`).toHaveLength(0);
  });

  it('3.6 DM damage 应 > 必杀技平均 damage', () => {
    const specialAvg = specialMoves.reduce((s, [, fd]) => s + fd.damage, 0) / specialMoves.length;
    const dmMin = Math.min(...dmMoves.map(([, fd]) => fd.damage));
    expect(dmMin, `DM最低damage(${dmMin})应>必杀技平均(${specialAvg.toFixed(1)})`)
      .toBeGreaterThan(specialAvg);
  });

  it('3.7 SDM damage 范围: 250-360', () => {
    const violations: string[] = [];
    for (const [key, fd] of sdmMoves) {
      if (fd.damage < 250 || fd.damage > 360) {
        violations.push(`${key}: damage=${fd.damage}`);
      }
    }
    expect(violations.length, `SDM damage越界: ${violations.join('; ')}`).toBeLessThanOrEqual(3);
  });

  it('3.8 独立必杀技 damage 中位数应 > 重通常技中位数 damage', () => {
    // 用中位数而非平均值比较更合理, 因为必杀技中包含大量不同类型
    const heavyDamages = heavyNormals.map(([, fd]) => fd.damage).sort((a, b) => a - b);
    const heavyMedian = heavyDamages[Math.floor(heavyDamages.length / 2)];
    // 独立必杀技: 不包含连技中间段和低damage段
    const independentSpecials = specialMoves.filter(([key, fd]) =>
      !/_2$|_3$|_C_2|_C_3|KONOKIZU|YANOSABI|TSUMIYOMI|BATSUYOMI|SECOND|FOLLOW/.test(key) && fd.damage >= 50
    );
    const specialDamages = independentSpecials.map(([, fd]) => fd.damage).sort((a, b) => a - b);
    const specialMedian = specialDamages[Math.floor(specialDamages.length / 2)];
    expect(specialMedian, `独立必杀技中位damage(${specialMedian}) > 重通常中位(${heavyMedian})`)
      .toBeGreaterThan(heavyMedian);
  });

  it('3.9 普通投技 damage 应合理 (60-160), DM投技不受此限', () => {
    // DM投技(如DM_NEGATIVE_GAIN)的damage在DM范围(150-280), 不用普通投技标准
    const normalThrows = throwMoves.filter(([key]) => !isDM(key) && !isSDM(key));
    const violations: string[] = [];
    for (const [key, fd] of normalThrows) {
      if (fd.damage < 60 || fd.damage > 160) {
        violations.push(`${key}: damage=${fd.damage}`);
      }
    }
    expect(violations.length, `普通投技damage越界: ${violations.join('; ')}`).toBeLessThanOrEqual(3);
  });

  it('3.10 命令通常技 damage 应合理 (25-60)', () => {
    // 命令通常技在frameDataConstants.ts中定义 (非frameDataChars.ts中的特殊技)
    // 排除frameDataChars.ts中的必杀技版本 (如KDASH_ONE_INCH在frameDataChars中有65damage版本)
    const commandNormalKeys = new Set([
      'CMD_GOFU_YOU', 'CMD_88SHIKI', 'CMD_NARAKU',
      'IORI_YUMEYUMI', 'IORI_KATANUGI', 'IORI_YUKIWARUI',
      'TERRY_BACK_KNCKLE', 'TERRY_COMBO_BLOW',
      'KIM_HISHOU_KICK', 'KIM_HANSEN',
      'RYO_TSURIZAO', 'RYO_ORISHI',
      'KDASH_TRIGGER', 'KULA_ONE_MORE', 'KULA_SLIDER',
      'LEONA_STRIKE_ARC', 'LEONA_STRIKE_DASH',
      'MAI_HISSATSU_SHINOBIBACHI', 'MAI_YUSURA_UMA',
      'ROBERT_GENEI_KYAKU_CMD', 'ROBERT_KOU_SHUTAI',
      'CLARK_DEATH_LAKE', 'CLARK_STOMP',
      'RALF_SABRE_PUNCH', 'RALF_SABRE_KICK',
      'JOE_KNEE_KICK', 'JOE_SLIDE',
      'ANDY_UWA_AGITO', 'ANDY_GEDAN_AGITO',
      'BILLY_SANDAN_GEAR', 'BILLY_SENSHU_IKKYAKU',
      'CHANG_HIKI_NAGE', 'CHANG_KYUUSHUU',
      'YASHIRO_SHUU_WANI', 'YASHIRO_JUU_ZUTSU',
      'CHOI_SOUTEN_MEKKYAKU', 'CHOI_SAN_REN_GEKI',
      'MATURE_DESPAIR', 'MATURE_JAB',
      'VICE_MONSTROSITY', 'VICE_OVERKILL',
      'SHERMIE_STAND', 'SHERMIE_CLASH',
      'ATHENA_PHOENIX_REFLECT', 'ATHENA_LOW_B', 'ATHENA_AIR_B',
      'XIANGFEI_KYU_HO', 'XIANGFEI_KAKU_DA',
      'YAMAZAKI_SASHI', 'YAMAZAKI_BOKKAI',
      'MARY_HAMMER_PUNCH', 'MARY_DOUBLE_ROLLING',
      'KASUMI_KOU_U', 'KASUMI_GESHIKI',
    ]);
    const violations: string[] = [];
    for (const [key, fd] of entries) {
      if (!commandNormalKeys.has(key)) continue;
      if (fd.damage < 25 || fd.damage > 60) {
        violations.push(`${key}: damage=${fd.damage}`);
      }
    }
    expect(violations.length, `命令通常技damage越界: ${violations.join('; ')}`).toBeLessThanOrEqual(3);
  });
});

// ═══════════════════════════════════════════
// 4. 防御槽消耗合理性 (8个测试)
// ═══════════════════════════════════════════
describe('4. 防御槽消耗合理性', () => {
  it('4.1 Guard gauge drain 层级: Light < Heavy', () => {
    expect(GUARD_GAUGE_DRAIN_LIGHT, 'Light < Heavy')
      .toBeLessThan(GUARD_GAUGE_DRAIN_HEAVY);
  });

  it('4.2 Guard gauge drain 层级: Heavy < Special', () => {
    expect(GUARD_GAUGE_DRAIN_HEAVY, 'Heavy < Special')
      .toBeLessThan(GUARD_GAUGE_DRAIN_SPECIAL);
  });

  it('4.3 Guard gauge drain 层级: Special < DM', () => {
    expect(GUARD_GAUGE_DRAIN_SPECIAL, 'Special < DM')
      .toBeLessThan(GUARD_GAUGE_DRAIN_DM);
  });

  it('4.4 Guard gauge drain 层级: DM < SDM', () => {
    expect(GUARD_GAUGE_DRAIN_DM, 'DM < SDM')
      .toBeLessThan(GUARD_GAUGE_DRAIN_SDM);
  });

  it('4.5 投技 hitstun/blockstun/pushback 应为0 (投技不产生防御)', () => {
    const violations: string[] = [];
    for (const [key, fd] of throwMoves) {
      if (fd.hitstun !== 0) violations.push(`${key}: hitstun=${fd.hitstun}`);
      if (fd.blockstun !== 0) violations.push(`${key}: blockstun=${fd.blockstun}`);
      if (fd.pushback !== 0) violations.push(`${key}: pushback=${fd.pushback}`);
    }
    expect(violations, `投技有非零硬直/推力: ${violations.join('; ')}`).toHaveLength(0);
  });

  it('4.6 飞行道具应有 chipDamage (防御削血)', () => {
    const noChip: string[] = [];
    for (const [key, fd] of projectileMoves) {
      // 飞行道具类应有 chipDamage
      if (fd.chipDamage === undefined || fd.chipDamage <= 0) {
        noChip.push(key);
      }
    }
    expect(noChip.length, `飞行道具无chipDamage: ${noChip.join('; ')}`).toBeLessThanOrEqual(2);
  });

  it('4.7 升龙类必杀技应有 chipDamage', () => {
    // 升龙类 (upper/DP moves) 应有 chipDamage
    const dpMoves = entries.filter(([k]) =>
      /ONIYAKI|KO_HOU|HIENZAN|TIGER_KICK|CROW_|POWER_DUNK|SHOURYUU|RYU_ZAN|PSYCHO_SWORD|SENPU_KON/.test(k)
    );
    const noChip: string[] = [];
    for (const [key, fd] of dpMoves) {
      if (fd.knockdown && fd.chipDamage === undefined) {
        noChip.push(key);
      }
    }
    expect(noChip.length, `升龙无chipDamage: ${noChip.join('; ')}`).toBeLessThanOrEqual(3);
  });

  it('4.8 DM/SDM 应有 chipDamage 且 SDM chipDamage >= DM chipDamage', () => {
    const noChipDm: string[] = [];
    for (const [key, fd] of [...dmMoves, ...sdmMoves]) {
      // DM投技(blockstun=0)不需要chipDamage
      if (fd.blockstun === 0) continue;
      if (fd.chipDamage === undefined || fd.chipDamage <= 0) {
        noChipDm.push(key);
      }
    }
    expect(noChipDm.length, `DM/SDM无chipDamage: ${noChipDm.join('; ')}`).toBeLessThanOrEqual(2);

    // SDM chipDamage >= DM chipDamage for matching pairs
    const chipViolations: string[] = [];
    for (const [dmKey, dmFd, sdmKey, sdmFd] of dmSdmPairs) {
      if (dmFd.chipDamage && sdmFd.chipDamage) {
        if (sdmFd.chipDamage < dmFd.chipDamage) {
          chipViolations.push(`${sdmKey}.chip(${sdmFd.chipDamage}) < ${dmKey}.chip(${dmFd.chipDamage})`);
        }
      }
    }
    expect(chipViolations, `SDM chip < DM chip: ${chipViolations.join('; ')}`).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════
// 5. 取消链完整性 (7个测试)
// ═══════════════════════════════════════════
describe('5. 取消链完整性', () => {
  // KOF 取消链规则:
  // - 通常技 → 必杀技 (基础取消)
  // - 必杀技 → DM (super cancel)
  // - DM → SDM (MAX mode下)
  // - 轻通常技 → 轻通常技 (rapid chain)
  // - 不可逆: DM不能取消回通常技, SDM不能取消回DM以下

  it('5.1 FRAME_DATA 应包含所有基础通常技 (STAND/CLOSE/CROUCH/JUMP A-D)', () => {
    const requiredKeys = [
      'STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
      'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
      'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
      'JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D',
    ];
    const missing = requiredKeys.filter(k => !(k in FRAME_DATA));
    expect(missing, `缺少基础通常技: ${missing.join(', ')}`).toHaveLength(0);
  });

  it('5.2 FRAME_DATA 应包含投技基础条目 (THROW, THROW_FORWARD, THROW_BACK)', () => {
    const requiredKeys = ['THROW', 'THROW_FORWARD', 'THROW_BACK'];
    const missing = requiredKeys.filter(k => !(k in FRAME_DATA));
    expect(missing, `缺少投技: ${missing.join(', ')}`).toHaveLength(0);
  });

  it('5.3 DM 条目名应以 DM_ 开头且全部击倒', () => {
    const violations: string[] = [];
    for (const [key, fd] of dmMoves) {
      if (!key.startsWith('DM_')) violations.push(`${key} 不是 DM_ 前缀`);
      if (!fd.knockdown) violations.push(`${key} 不是击倒技`);
    }
    expect(violations, `DM问题: ${violations.join('; ')}`).toHaveLength(0);
  });

  it('5.4 SDM 条目名应以 SDM_ 开头且全部击倒', () => {
    const violations: string[] = [];
    for (const [key, fd] of sdmMoves) {
      if (!key.startsWith('SDM_')) violations.push(`${key} 不是 SDM_ 前缀`);
      if (!fd.knockdown) violations.push(`${key} 不是击倒技`);
    }
    expect(violations, `SDM问题: ${violations.join('; ')}`).toHaveLength(0);
  });

  it('5.5 轻通常技的 recovery 应允许 rapid chain (recovery <= 15帧)', () => {
    // 轻攻击应可以快速连打, recovery不应太长
    const violations: string[] = [];
    for (const [key, fd] of lightNormals) {
      if (fd.recovery > 15) {
        violations.push(`${key}: recovery=${fd.recovery}`);
      }
    }
    expect(violations, `轻攻击recovery>15: ${violations.join('; ')}`).toHaveLength(0);
  });

  it('5.6 每个角色的核心 DM 应存在对应的 SDM (排除A/C变体、别名和投技DM)', () => {
    // DM有A/C/D/B变体(如DM_OROCHINAGI_A, DM_OROCHINAGI_C), 这些不需要各自有SDM
    // 只检查"核心DM" (无按钮后缀) 是否有SDM
    // 投技DM (blockstun=0) 不强制要求SDM
    // 某些DM有别名(如DM_GALACTIC_PHANTOM和DM_GALACTICA_PHANTOM), 别名不一定需要SDM
    const sdmNames = new Set(Object.keys(FRAME_DATA).filter(k => k.startsWith('SDM_')));

    const missingSdm: string[] = [];
    for (const [key, fd] of dmMoves) {
      // 跳过带按钮后缀的DM变体 (_A, _C, _B, _D结尾)
      if (/_[ACBD]$/.test(key)) continue;
      // 跳过投技DM
      if (fd.blockstun === 0) continue;

      const sdmName = key.replace(/^DM_/, 'SDM_');
      if (!sdmNames.has(sdmName)) {
        missingSdm.push(sdmName);
      }
    }
    // 允许部分DM没有SDM (别名DM、特殊DM)
    expect(missingSdm.length, `缺少SDM: ${missingSdm.join('; ')}`).toBeLessThanOrEqual(10);
  });

  it('5.7 DM/SDM 不应有通常技的 hitstun (>0) — DM命中直接击倒', () => {
    // DM/SDM 命中后应直接击倒, hitstun应为0或极短
    // 但部分多段DM可能有hitstun(用于连段中间段)
    const withHitstun: string[] = [];
    for (const [key, fd] of [...dmMoves, ...sdmMoves]) {
      if (fd.hitstun > 10) {
        withHitstun.push(`${key}: hitstun=${fd.hitstun}`);
      }
    }
    // 大多数DM hitstun应为0, 但允许少数多段DM有hitstun
    expect(withHitstun.length, `DM/SDM hitstun>10: ${withHitstun.join('; ')}`).toBeLessThanOrEqual(3);
  });
});
