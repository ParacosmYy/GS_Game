/**
 * comboTrialData.ts -- 连击试练数据 (Kyo / Iori / Ryo)
 *
 * 为三个角色各定义5条试练，覆盖 beginner ~ expert 四个难度等级。
 * timingWindow 和 totalDamage 均基于 FRAME_DATA 真实帧数据计算。
 */
import { AttackType } from '../core/types.js';
import { FRAME_DATA } from '../core/constants.js';
import type { ComboTrial, ComboTrialStep } from './comboTrial.js';
import { calculateTotalDamage } from './comboTrial.js';

// ===== 辅助 =====

/** 安全获取FRAME_DATA中的damage值 */
function damageOf(at: AttackType): number {
  const data = FRAME_DATA[at as keyof typeof FRAME_DATA];
  return data ? data.damage : 0;
}

/** 创建步骤并自动设置timingWindow */
function step(
  attackType: AttackType,
  cancelType: ComboTrialStep['cancelType'],
  timingWindow: number,
  description: string,
): ComboTrialStep {
  return { attackType, timingWindow, cancelType, description };
}

// ──────────────────────────────────────────────
// Kyo Kusanagi 试练
// ──────────────────────────────────────────────

const KYO_TRIALS: ComboTrial[] = [
  // 1. Beginner: A → B → C basic chain
  {
    id: 'kyo_01',
    charId: 'kyo',
    name: '基础链: A → B → C',
    difficulty: 'beginner',
    steps: [
      step(AttackType.STAND_A, 'normal', 12, 'Stand A'),
      step(AttackType.STAND_B, 'rapid', 12, '→ Stand B'),
      step(AttackType.STAND_C, 'normal', 12, '→ Stand C'),
    ],
    totalDamage: 0, // placeholder, calculated below
  },
  // 2. Intermediate: Close C → QCF+P (Aragami) → QCF+P (Konokizu)
  {
    id: 'kyo_02',
    charId: 'kyo',
    name: '荒咬み连段: Close C → 荒咬み → 九傷',
    difficulty: 'intermediate',
    steps: [
      step(AttackType.CLOSE_C, 'normal', 10, 'Close C'),
      step(AttackType.KYO_ARAGAMI, 'special', 8, '→ QCF+A 荒咬み'),
      step(AttackType.KYO_ARAGAMI_KONOKIZU, 'special', 7, '→ QCF+P 九傷'),
    ],
    totalDamage: 0,
  },
  // 3. Advanced: Jump C → Stand C → QCF+P (Aragami) → DP+C (Oniyaki)
  {
    id: 'kyo_03',
    charId: 'kyo',
    name: '空C起手: Jump C → Stand C → 荒咬み → 鬼焼き',
    difficulty: 'advanced',
    steps: [
      step(AttackType.JUMP_C, 'normal', 8, 'Jump C'),
      step(AttackType.STAND_C, 'normal', 7, '→ Stand C'),
      step(AttackType.KYO_ARAGAMI, 'special', 6, '→ QCF+A 荒咬み'),
      step(AttackType.KYO_ONIYAKI_C, 'super', 5, '→ DP+C 鬼焼き'),
    ],
    totalDamage: 0,
  },
  // 4. Expert: Jump C → Stand C → QCFx2+P (Orochinagi DM)
  {
    id: 'kyo_04',
    charId: 'kyo',
    name: 'DM确认: Jump C → Stand C → 大蛇薙',
    difficulty: 'expert',
    steps: [
      step(AttackType.JUMP_C, 'normal', 5, 'Jump C'),
      step(AttackType.STAND_C, 'normal', 4, '→ Stand C'),
      step(AttackType.DM_OROCHINAGI, 'super', 5, '→ QCFx2+P 大蛇薙'),
    ],
    totalDamage: 0,
  },
  // 5. Expert: Close C → Aragami → Konokizu → DM Orochinagi (MAX combo)
  {
    id: 'kyo_05',
    charId: 'kyo',
    name: 'MAX连段: Close C → 荒咬み → 九傷 → 大蛇薙',
    difficulty: 'expert',
    steps: [
      step(AttackType.CLOSE_C, 'free', 5, 'MAX Close C'),
      step(AttackType.KYO_ARAGAMI, 'free', 5, '→ QCF+A 荒咬み'),
      step(AttackType.KYO_ARAGAMI_KONOKIZU, 'free', 5, '→ QCF+P 九傷'),
      step(AttackType.DM_OROCHINAGI, 'super', 4, '→ QCFx2+P 大蛇薙'),
    ],
    totalDamage: 0,
  },
];

// ──────────────────────────────────────────────
// Iori Yagami 试练
// ──────────────────────────────────────────────

const IORI_TRIALS: ComboTrial[] = [
  // 1. Beginner: A → B → C basic chain
  {
    id: 'iori_01',
    charId: 'iori',
    name: '基础链: A → B → C',
    difficulty: 'beginner',
    steps: [
      step(AttackType.STAND_A, 'normal', 12, 'Stand A'),
      step(AttackType.STAND_B, 'rapid', 12, '→ Stand B'),
      step(AttackType.STAND_C, 'normal', 12, '→ Stand C'),
    ],
    totalDamage: 0,
  },
  // 2. Intermediate: Stand C → QCB+P (Aoihana 1st) → QCB+P (2nd) → QCB+P (3rd)
  {
    id: 'iori_02',
    charId: 'iori',
    name: '葵花三连: Stand C → 葵花×3',
    difficulty: 'intermediate',
    steps: [
      step(AttackType.STAND_C, 'normal', 10, 'Stand C'),
      step(AttackType.IORI_AOIHANA, 'special', 8, '→ QCB+A 葵花1段'),
      step(AttackType.IORI_AOIHANA_2, 'special', 7, '→ QCB+P 葵花2段'),
      step(AttackType.IORI_AOIHANA_3, 'special', 7, '→ QCB+P 葵花3段'),
    ],
    totalDamage: 0,
  },
  // 3. Advanced: Jump C → Stand C → QCB+P (Aoihana) → QCB+P (Aoihana 2nd) → DP+A (Oniyaki)
  {
    id: 'iori_03',
    charId: 'iori',
    name: '空C起手: Jump C → Stand C → 葵花×2 → 鬼焼き',
    difficulty: 'advanced',
    steps: [
      step(AttackType.JUMP_C, 'normal', 8, 'Jump C'),
      step(AttackType.STAND_C, 'normal', 7, '→ Stand C'),
      step(AttackType.IORI_AOIHANA, 'special', 6, '→ QCB+A 葵花'),
      step(AttackType.IORI_AOIHANA_2, 'special', 5, '→ QCB+P 葵花2段'),
      step(AttackType.IORI_ONIYAKI, 'super', 5, '→ DP+A 鬼焼き'),
    ],
    totalDamage: 0,
  },
  // 4. Expert: Jump C → Stand C → QCFx2+P (Yatagarasu DM)
  {
    id: 'iori_04',
    charId: 'iori',
    name: 'DM确认: Jump C → Stand C → 八咫烏',
    difficulty: 'expert',
    steps: [
      step(AttackType.JUMP_C, 'normal', 5, 'Jump C'),
      step(AttackType.STAND_C, 'normal', 4, '→ Stand C'),
      step(AttackType.DM_YATAGARASU, 'super', 5, '→ QCFx2+P 八咫烏'),
    ],
    totalDamage: 0,
  },
  // 5. Expert: Close C → Aoihana ×3 → Yatagarasu (MAX combo)
  {
    id: 'iori_05',
    charId: 'iori',
    name: 'MAX连段: Close C → 葵花×3 → 八咫烏',
    difficulty: 'expert',
    steps: [
      step(AttackType.CLOSE_C, 'free', 5, 'MAX Close C'),
      step(AttackType.IORI_AOIHANA, 'free', 5, '→ QCB+A 葵花'),
      step(AttackType.IORI_AOIHANA_2, 'free', 5, '→ QCB+P 葵花2段'),
      step(AttackType.IORI_AOIHANA_3, 'free', 5, '→ QCB+P 葵花3段'),
      step(AttackType.DM_YATAGARASU, 'super', 4, '→ QCFx2+P 八咫烏'),
    ],
    totalDamage: 0,
  },
];

// ──────────────────────────────────────────────
// Ryo Sakazaki 试练
// ──────────────────────────────────────────────

const RYO_TRIALS: ComboTrial[] = [
  // 1. Beginner: A → B → C basic chain
  {
    id: 'ryo_01',
    charId: 'ryo',
    name: '基础链: A → B → C',
    difficulty: 'beginner',
    steps: [
      step(AttackType.STAND_A, 'normal', 12, 'Stand A'),
      step(AttackType.STAND_B, 'rapid', 12, '→ Stand B'),
      step(AttackType.STAND_C, 'normal', 12, '→ Stand C'),
    ],
    totalDamage: 0,
  },
  // 2. Intermediate: Stand C → QCF+A (Ko'ou Ken) → QCF+A (Ko'ou Ken again)
  {
    id: 'ryo_02',
    charId: 'ryo',
    name: '虎煌连射: Stand C → 虎煌 → 虎煌',
    difficulty: 'intermediate',
    steps: [
      step(AttackType.STAND_C, 'normal', 10, 'Stand C'),
      step(AttackType.RYO_KOOU, 'special', 8, '→ QCF+A 虎煌'),
      step(AttackType.RYO_KOOU, 'special', 7, '→ QCF+A 虎煌'),
    ],
    totalDamage: 0,
  },
  // 3. Advanced: Jump C → Stand C → QCF+A (Ko'ou Ken) → DP+A (Kohou)
  {
    id: 'ryo_03',
    charId: 'ryo',
    name: '空C起手: Jump C → Stand C → 虎煌 → 虎咆',
    difficulty: 'advanced',
    steps: [
      step(AttackType.JUMP_C, 'normal', 8, 'Jump C'),
      step(AttackType.STAND_C, 'normal', 7, '→ Stand C'),
      step(AttackType.RYO_KOOU, 'special', 6, '→ QCF+A 虎煌'),
      step(AttackType.RYO_KO_HOU, 'super', 5, '→ DP+A 虎咆'),
    ],
    totalDamage: 0,
  },
  // 4. Expert: Jump C → Stand C → QCFx2+P (Ten Ha Ou DM)
  {
    id: 'ryo_04',
    charId: 'ryo',
    name: 'DM确认: Jump C → Stand C → 天地霸煌拳',
    difficulty: 'expert',
    steps: [
      step(AttackType.JUMP_C, 'normal', 5, 'Jump C'),
      step(AttackType.STAND_C, 'normal', 4, '→ Stand C'),
      step(AttackType.DM_TEN_HA_OU, 'super', 5, '→ QCFx2+P 天地霸煌拳'),
    ],
    totalDamage: 0,
  },
  // 5. Expert: Close C → Ko'ou Ken → Ko'ou Ken C → Ten Ha Ou (MAX combo)
  {
    id: 'ryo_05',
    charId: 'ryo',
    name: 'MAX连段: Close C → 虎煌 → 虎煌C → 天地霸煌拳',
    difficulty: 'expert',
    steps: [
      step(AttackType.CLOSE_C, 'free', 5, 'MAX Close C'),
      step(AttackType.RYO_KOOU, 'free', 5, '→ QCF+A 虎煌'),
      step(AttackType.RYO_KOOU_C, 'free', 5, '→ QCF+C 虎煌C'),
      step(AttackType.DM_TEN_HA_OU, 'super', 4, '→ QCFx2+P 天地霸煌拳'),
    ],
    totalDamage: 0,
  },
];

// ===== 自动计算 totalDamage 并导出 =====

/** 填充totalDamage字段 */
function fillDamage(trials: ComboTrial[]): ComboTrial[] {
  for (const trial of trials) {
    trial.totalDamage = calculateTotalDamage(trial.steps);
  }
  return trials;
}

/** 所有试练的完整列表 */
export const COMBO_TRIALS: ComboTrial[] = [
  ...fillDamage(KYO_TRIALS),
  ...fillDamage(IORI_TRIALS),
  ...fillDamage(RYO_TRIALS),
];

/** 按角色ID获取试练 */
export function getTrialsForCharacter(charId: string): ComboTrial[] {
  return COMBO_TRIALS.filter(t => t.charId === charId);
}

/** 按难度获取试练 */
export function getTrialsByDifficulty(difficulty: ComboTrial['difficulty']): ComboTrial[] {
  return COMBO_TRIALS.filter(t => t.difficulty === difficulty);
}

/** 按ID获取单条试练 */
export function getTrialById(id: string): ComboTrial | undefined {
  return COMBO_TRIALS.find(t => t.id === id);
}

/** 获取所有参与试练的角色ID列表 */
export function getTrialCharacterIds(): string[] {
  const ids = new Set(COMBO_TRIALS.map(t => t.charId));
  return [...ids];
}
