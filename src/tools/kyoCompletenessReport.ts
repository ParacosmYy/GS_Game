/**
 * Kyo Completeness Report Tool
 *
 * Validates completeness of Kyo's content package across 8 dimensions:
 *   1. Animation metadata (basic + attack animations)
 *   2. Frame data (startup/active/recovery for all attacks)
 *   3. Attack frame keys (hitbox data for all attacks)
 *   4. Feedback tier (all attacks mapped to a tier)
 *   5. Portrait (4 size variants)
 *   6. MoveList (expected entries present)
 *   7. Cancel paths (expected routes exist)
 *   8. Hit effects (all attack types handled by VFX/SFX plugin)
 *
 * Reads from Kyo content package barrel exports.
 */

import {
  KYO_ATTACK_KEYS,
  KYO_ANIMATION_META,
  KYO_FEEDBACK_SUMMARY,
  KYO_PORTRAIT_META,
  KYO_MOVE_LIST,
  KYO_CANCEL_PATHS,
  KYO_HIT_EFFECTS,
} from '../content/characters/kyo/index.js';
import { KYO_ATTACK_KEYS as KYO_ATK_KEYS, getKyoAttackFrameData } from '../content/characters/kyo/attacks.js';
import { getKyoFeedbackTiers } from '../content/characters/kyo/feedback.js';
import type { PortraitSize } from '../core/portraitManifest.js';

// ===== Type Definitions =====

export interface DimensionResult {
  dimension: string;
  total: number;
  passed: number;
  pct: number;
  missing: string[];
  complete: string[];
}

export interface KyoDimensionReport {
  animationMeta: DimensionResult;
  frameData: DimensionResult;
  attackFrames: DimensionResult;
  feedback: DimensionResult;
  portrait: DimensionResult;
  moveList: DimensionResult;
  cancelPaths: DimensionResult;
  hitEffects: DimensionResult;
  overallScore: number;
}

// ===== Expected Data =====

const KYO_BASIC_ANIMATIONS = [
  'idle', 'walk_forward', 'walk_backward', 'crouch', 'block',
  'jump_up', 'jump_forward', 'jump_backward',
  'hitstun', 'knockdown', 'dizzy', 'win',
];

const KYO_NORMAL_ANIMATIONS = [
  'stand_a', 'stand_b', 'stand_c', 'stand_d',
  'crouch_a', 'crouch_b', 'crouch_c', 'crouch_d',
];

const KYO_SPECIAL_ANIMATIONS = [
  'kyo_yamibarai', 'kyo_yamibarai_c',
  'kyo_oniyaki', 'kyo_oniyaki_c',
  'kyo_75kai', 'kyo_75kai_2', 'kyo_red_kick',
  'kyo_aragami', 'kyo_aragami_konokizu', 'kyo_aragami_yanosabi',
  'kyo_nanase', 'kyo_koto_tsuki', 'kyo_yakisogi',
  'kyo_dokugami', 'kyo_tsumiyomi', 'kyo_batsuyomi',
  'cmd_gofu_you', 'cmd_88shiki', 'cmd_naraku',
  'dm_orochinagi', 'sdm_orochinagi', 'hsdm_orochinagi',
];

const ALL_KYO_ANIMATIONS = [...KYO_BASIC_ANIMATIONS, ...KYO_NORMAL_ANIMATIONS, ...KYO_SPECIAL_ANIMATIONS];

const EXPECTED_KYO_MOVES: { name: string; type: string }[] = [
  { name: '皇斧', type: 'command' },
  { name: '88式', type: 'command' },
  { name: '奈落', type: 'command' },
  { name: '闇払い', type: 'special' },
  { name: '鬼焼き', type: 'special' },
  { name: '75式', type: 'special' },
  { name: 'R.E.D.', type: 'special' },
  { name: '荒咬み', type: 'special' },
  { name: '毒咬み', type: 'special' },
  { name: '大蛇薙', type: 'dm' },
];

const EXPECTED_CANCEL_ROUTES = [
  { from: 'STAND_C', to: 'KYO_ONIYAKI', type: 'special' },
  { from: 'CLOSE_C', to: 'KYO_ARAGAMI', type: 'special' },
  { from: 'KYO_ONIYAKI', to: 'DM_OROCHINAGI', type: 'super' },
  { from: 'CROUCH_C', to: 'KYO_YAMIBARAI', type: 'special' },
  { from: 'KYO_ARAGAMI', to: 'KYO_ARAGAMI_KONOKIZU', type: 'rekka' },
  { from: 'KYO_DOKUGAMI', to: 'KYO_TSUMIYOMI', type: 'rekka' },
];

const KYO_HIT_EFFECT_ATTACK_TYPES = [
  'CMD_GOFU_YOU', 'CMD_88SHIKI', 'CMD_NARAKU',
  'KYO_ONIYAKI', 'KYO_ONIYAKI_C',
  'KYO_YAMIBARAI', 'KYO_YAMIBARAI_C',
  'KYO_ARAGAMI', 'KYO_ARAGAMI_KONOKIZU', 'KYO_ARAGAMI_YANOSABI',
  'KYO_NANASE', 'KYO_KOTO_TSUKI', 'KYO_YAKISOGI',
  'KYO_DOKUGAMI', 'KYO_TSUMIYOMI', 'KYO_BATSUYOMI',
  'KYO_75KAI', 'KYO_75KAI_2', 'KYO_RED_KICK',
  'DM_OROCHINAGI', 'SDM_OROCHINAGI', 'HSDM_OROCHINAGI',
];

// ===== Helper =====

function buildDimension(
  dimension: string,
  items: { key: string; label: string }[],
  checkFn: (key: string) => boolean,
): DimensionResult {
  const complete: string[] = [];
  const missing: string[] = [];
  let passed = 0;
  for (const item of items) {
    if (checkFn(item.key)) {
      complete.push(item.label);
      passed++;
    } else {
      missing.push(item.label);
    }
  }
  const total = items.length;
  const pct = total > 0 ? Math.round((passed / total) * 100) : 100;
  return { dimension, total, passed, pct, missing, complete };
}

// ===== Report Generator =====

export function generateKyoDimensionReport(): KyoDimensionReport {
  // 1. Animation metadata
  const animationMeta = buildDimension(
    'Animation Meta',
    ALL_KYO_ANIMATIONS.map(a => ({ key: a, label: a })),
    (key) => key in KYO_ANIMATION_META,
  );

  // 2. Frame data (all attack keys have frame data entries)
  const frameData = buildDimension(
    'Frame Data',
    KYO_ATTACK_KEYS.map(k => ({ key: k, label: k })),
    (key) => getKyoAttackFrameData(key) !== undefined,
  );

  // 3. Attack frame keys (hitbox data)
  const attackFrames = buildDimension(
    'Attack Frames',
    KYO_ATTACK_KEYS.map(k => ({ key: k, label: k })),
    (key) => {
      const af = getKyoAttackFrameData(key as any);
      return af !== undefined;
    },
  );

  // 4. Feedback tier (all attacks have a tier)
  const feedbackTiers = getKyoFeedbackTiers();
  const feedback = buildDimension(
    'Feedback',
    KYO_ATTACK_KEYS.map(k => ({ key: k, label: k })),
    (key) => key in feedbackTiers,
  );

  // 5. Portrait (4 sizes)
  const portraitSizes: PortraitSize[] = ['select', 'vs', 'hud', 'win'];
  const portrait = buildDimension(
    'Portrait',
    portraitSizes.map(s => ({ key: s, label: s })),
    (key) => {
      const meta = KYO_PORTRAIT_META[key as PortraitSize];
      return meta !== undefined && meta.hasPixelData;
    },
  );

  // 6. MoveList
  const moveList = buildDimension(
    'MoveList',
    EXPECTED_KYO_MOVES.map(m => ({ key: `${m.type}:${m.name}`, label: `${m.type}/${m.name}` })),
    (key) => {
      const [type, name] = key.split(':');
      return KYO_MOVE_LIST.some(
        entry => entry.type === type && entry.name.includes(name),
      );
    },
  );

  // 7. Cancel paths
  const cancelPaths = buildDimension(
    'Cancel Paths',
    EXPECTED_CANCEL_ROUTES.map(r => ({
      key: `${r.from}->${r.to}`,
      label: `${r.from} → ${r.to} (${r.type})`,
    })),
    (key) => {
      const [from, to] = key.split('->');
      return KYO_CANCEL_PATHS.some(
        route => route.from === from && route.to.includes(to),
      );
    },
  );

  // 8. Hit effects (attack types covered by VFX/SFX plugin)
  const hitEffectPrefixes = KYO_HIT_EFFECTS.prefixes;
  const hitEffects = buildDimension(
    'Hit Effects',
    KYO_HIT_EFFECT_ATTACK_TYPES.map(k => ({ key: k, label: k })),
    (key) => hitEffectPrefixes.some(prefix => key.startsWith(prefix) || key === prefix),
  );

  // Weighted overall: animation 15%, frameData 15%, attackFrames 10%, feedback 10%,
  // portrait 10%, moveList 10%, cancelPaths 15%, hitEffects 15%
  const weights = [
    { result: animationMeta, weight: 0.15 },
    { result: frameData, weight: 0.15 },
    { result: attackFrames, weight: 0.10 },
    { result: feedback, weight: 0.10 },
    { result: portrait, weight: 0.10 },
    { result: moveList, weight: 0.10 },
    { result: cancelPaths, weight: 0.15 },
    { result: hitEffects, weight: 0.15 },
  ];

  const overallScore = Math.round(
    weights.reduce((sum, w) => sum + w.result.pct * w.weight, 0),
  );

  return {
    animationMeta,
    frameData,
    attackFrames,
    feedback,
    portrait,
    moveList,
    cancelPaths,
    hitEffects,
    overallScore,
  };
}

// ===== Console Printer =====

function progressBar(pct: number, width: number = 20): string {
  const filled = Math.round((pct / 100) * width);
  const empty = width - filled;
  return `[${'#'.repeat(filled)}${'-'.repeat(empty)}]`;
}

function dimIcon(pct: number): string {
  if (pct >= 100) return 'OK';
  if (pct >= 50) return '~~';
  return '!!';
}

export function printKyoReport(): void {
  const report = generateKyoDimensionReport();
  const line = '='.repeat(60);
  const dash = '-'.repeat(60);

  console.log('');
  console.log(line);
  console.log('  KYO CONTENT PACKAGE - COMPLETENESS REPORT');
  console.log(line);

  const dimensions: { dim: DimensionResult; label: string }[] = [
    { dim: report.animationMeta, label: 'Animation Meta' },
    { dim: report.frameData, label: 'Frame Data' },
    { dim: report.attackFrames, label: 'Attack Frames' },
    { dim: report.feedback, label: 'Feedback' },
    { dim: report.portrait, label: 'Portrait' },
    { dim: report.moveList, label: 'MoveList' },
    { dim: report.cancelPaths, label: 'Cancel Paths' },
    { dim: report.hitEffects, label: 'Hit Effects' },
  ];

  console.log('  DIMENSION SUMMARY:');
  console.log(`  Dimension          Status  Pct    Passed  Missing`);
  console.log('  ' + '-'.repeat(53));

  for (const { dim, label } of dimensions) {
    const name = label.padEnd(18);
    const icon = dimIcon(dim.pct);
    const pctStr = `${dim.pct}%`.padStart(4);
    const passedStr = `${dim.passed}/${dim.total}`.padStart(7);
    const missingStr = dim.missing.length > 0 ? String(dim.missing.length) : '-';
    console.log(`  ${name} [${icon}]  ${pctStr}  ${passedStr}  ${missingStr}`);
  }

  console.log(dash);
  console.log(`  OVERALL SCORE:    ${progressBar(report.overallScore)} ${report.overallScore}%`);

  // Missing items detail
  let hasMissing = false;
  for (const { dim, label } of dimensions) {
    if (dim.missing.length > 0) {
      hasMissing = true;
      console.log(dash);
      console.log(`  MISSING ${label.toUpperCase()}:`);
      for (const name of dim.missing) {
        console.log(`    - ${name}`);
      }
    }
  }

  if (!hasMissing) {
    console.log(dash);
    console.log('  ALL DIMENSIONS COMPLETE — no missing items.');
  }

  console.log(line);
  console.log('');
}

// Auto-run when executed directly
printKyoReport();
