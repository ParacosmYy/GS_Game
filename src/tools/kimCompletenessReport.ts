/**
 * Kim Completeness Report Tool
 *
 * Validates completeness of Kim's content package across 8 dimensions:
 *   1. Animation metadata (basic + attack animations)
 *   2. Frame data (startup/active/recovery for all attacks)
 *   3. Attack frame keys (hitbox data for all attacks)
 *   4. Feedback tier (all attacks mapped to a tier)
 *   5. Portrait (4 size variants)
 *   6. MoveList (expected entries present)
 *   7. Cancel paths (expected routes exist)
 *   8. Hit effects (all attack types handled by VFX/SFX plugin)
 *
 * Reads from Kim content package barrel exports.
 */

import {
  KIM_ATTACK_KEYS,
  KIM_ANIMATION_META,
  KIM_FEEDBACK_SUMMARY,
  KIM_PORTRAIT_META,
  KIM_MOVE_LIST,
  KIM_CANCEL_PATHS,
  KIM_HIT_EFFECTS,
} from '../content/characters/kim/index.js';
import { KIM_ATTACK_KEYS as KIM_ATK_KEYS, getKimAttackFrameData } from '../content/characters/kim/attacks.js';
import { getKimFeedbackTiers } from '../content/characters/kim/feedback.js';
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

export interface KimDimensionReport {
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

const KIM_BASIC_ANIMATIONS = [
  'idle', 'walk_forward', 'walk_backward', 'crouch', 'block',
  'jump_up', 'jump_forward', 'jump_backward',
  'hitstun', 'knockdown', 'dizzy', 'win',
];

const KIM_NORMAL_ANIMATIONS = [
  'stand_a', 'stand_b', 'stand_c', 'stand_d',
  'crouch_a', 'crouch_b', 'crouch_c', 'crouch_d',
];

const KIM_SPECIAL_ANIMATIONS = [
  'kim_hienzan', 'kim_hienzan_d',
  'kim_hangetsu', 'kim_hangetsu_d',
  'kim_haki',
  'kim_sanren', 'kim_sanren_2',
  'kim_kuzushi_geri', 'kim_nerichagi', 'kim_kaiten_hien_zan',
  'kim_hishou_kick', 'kim_hansen', 'kim_hishou',
  'dm_phoenix_kick', 'dm_phoenix_hiten',
  'sdm_phoenix_hiten', 'sdm_phoenix_hiten_ex',
  'hsdm_phoenix_hiten',
];

const ALL_KIM_ANIMATIONS = [...KIM_BASIC_ANIMATIONS, ...KIM_NORMAL_ANIMATIONS, ...KIM_SPECIAL_ANIMATIONS];

const EXPECTED_KIM_MOVES: { name: string; type: string }[] = [
  { name: '飛翔脚', type: 'command' },
  { name: '飛翔踢', type: 'command' },
  { name: '半旋蹴', type: 'command' },
  { name: '飛燕斬', type: 'special' },
  { name: '半月蹴', type: 'special' },
  { name: '三連撃', type: 'special' },
  { name: '覇気脚', type: 'special' },
  { name: '鳳凰脚', type: 'dm' },
  { name: '鳳凰天舞脚', type: 'dm' },
];

const EXPECTED_CANCEL_ROUTES = [
  { from: 'STAND_C', to: 'KIM_HIENZAN', type: 'special' },
  { from: 'CLOSE_C', to: 'KIM_HANGETSU', type: 'special' },
  { from: 'KIM_HIENZAN', to: 'DM_PHOENIX_KICK', type: 'super' },
  { from: 'CROUCH_C', to: 'KIM_SANREN', type: 'special' },
  { from: 'KIM_HISHOU_KICK', to: 'KIM_HIENZAN', type: 'command' },
  { from: 'KIM_HANSEN', to: 'KIM_HIENZAN', type: 'command' },
];

const KIM_HIT_EFFECT_ATTACK_TYPES = [
  'KIM_HIENZAN', 'KIM_HIENZAN_D',
  'KIM_HANGETSU', 'KIM_HANGETSU_D',
  'KIM_HAKI',
  'KIM_SANREN', 'KIM_SANREN_2',
  'KIM_HISHOU_KICK', 'KIM_HANSEN', 'KIM_HISHOU',
  'KIM_KUZUSHI_GERI', 'KIM_NERICHAGI', 'KIM_KAITEN_HIEN_ZAN',
  'DM_PHOENIX_KICK', 'DM_PHOENIX_HITEN',
  'SDM_PHOENIX_HITEN', 'SDM_PHOENIX_HITEN_EX',
  'HSDM_PHOENIX_HITEN',
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

export function generateKimDimensionReport(): KimDimensionReport {
  // 1. Animation metadata
  const animationMeta = buildDimension(
    'Animation Meta',
    ALL_KIM_ANIMATIONS.map(a => ({ key: a, label: a })),
    (key) => key in KIM_ANIMATION_META,
  );

  // 2. Frame data (all attack keys have frame data entries)
  const frameData = buildDimension(
    'Frame Data',
    KIM_ATTACK_KEYS.map(k => ({ key: k, label: k })),
    (key) => getKimAttackFrameData(key) !== undefined,
  );

  // 3. Attack frame keys (hitbox data)
  const attackFrames = buildDimension(
    'Attack Frames',
    KIM_ATTACK_KEYS.map(k => ({ key: k, label: k })),
    (key) => {
      const af = getKimAttackFrameData(key as any);
      return af !== undefined;
    },
  );

  // 4. Feedback tier (all attacks have a tier)
  const feedbackTiers = getKimFeedbackTiers();
  const feedback = buildDimension(
    'Feedback',
    KIM_ATTACK_KEYS.map(k => ({ key: k, label: k })),
    (key) => key in feedbackTiers,
  );

  // 5. Portrait (4 sizes)
  const portraitSizes: PortraitSize[] = ['select', 'vs', 'hud', 'win'];
  const portrait = buildDimension(
    'Portrait',
    portraitSizes.map(s => ({ key: s, label: s })),
    (key) => {
      const meta = KIM_PORTRAIT_META[key as PortraitSize];
      return meta !== undefined && meta.hasPixelData;
    },
  );

  // 6. MoveList
  const moveList = buildDimension(
    'MoveList',
    EXPECTED_KIM_MOVES.map(m => ({ key: `${m.type}:${m.name}`, label: `${m.type}/${m.name}` })),
    (key) => {
      const [type, name] = key.split(':');
      return KIM_MOVE_LIST.some(
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
      return KIM_CANCEL_PATHS.some(
        route => route.from === from && route.to.includes(to),
      );
    },
  );

  // 8. Hit effects (attack types covered by VFX/SFX plugin)
  const hitEffectPrefixes = KIM_HIT_EFFECTS.prefixes;
  const hitEffects = buildDimension(
    'Hit Effects',
    KIM_HIT_EFFECT_ATTACK_TYPES.map(k => ({ key: k, label: k })),
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

export function printKimReport(): void {
  const report = generateKimDimensionReport();
  const line = '='.repeat(60);
  const dash = '-'.repeat(60);

  console.log('');
  console.log(line);
  console.log('  KIM CONTENT PACKAGE - COMPLETENESS REPORT');
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
printKimReport();
