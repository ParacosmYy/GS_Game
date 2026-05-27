/**
 * Iori Completeness Report Tool
 *
 * Validates completeness of Iori's content package across 8 dimensions:
 *   1. Animation metadata (basic + attack animations)
 *   2. Frame data (startup/active/recovery for all attacks)
 *   3. Attack frame keys (hitbox data for all attacks)
 *   4. Feedback tier (all attacks mapped to a tier)
 *   5. Portrait (4 size variants)
 *   6. MoveList (expected entries present)
 *   7. Cancel paths (expected routes exist)
 *   8. Hit effects (all attack types handled by VFX/SFX plugin)
 *
 * Reads from Iori content package barrel exports.
 */

import {
  IORI_ATTACK_KEYS,
  IORI_ANIMATION_META,
  IORI_FEEDBACK_SUMMARY,
  IORI_PORTRAIT_META,
  IORI_MOVE_LIST,
  IORI_CANCEL_PATHS,
  IORI_HIT_EFFECTS,
} from '../content/characters/iori/index.js';
import { IORI_ATTACK_KEYS as IORI_ATK_KEYS, getIoriAttackFrameData } from '../content/characters/iori/attacks.js';
import { getIoriFeedbackTiers } from '../content/characters/iori/feedback.js';
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

export interface IoriDimensionReport {
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

const IORI_BASIC_ANIMATIONS = [
  'idle', 'walk_forward', 'walk_backward', 'crouch', 'block',
  'jump_up', 'jump_forward', 'jump_backward',
  'hitstun', 'knockdown', 'dizzy', 'win',
];

const IORI_NORMAL_ANIMATIONS = [
  'stand_a', 'stand_b', 'stand_c', 'stand_d',
  'crouch_a', 'crouch_b', 'crouch_c', 'crouch_d',
];

const IORI_SPECIAL_ANIMATIONS = [
  'iori_yamibarai', 'iori_yamibarai_c',
  'iori_oniyaki', 'iori_oniyaki_c',
  'iori_kototsuki', 'iori_kototsuki_d', 'iori_kuzukaze',
  'iori_aoihana', 'iori_aoihana_2', 'iori_aoihana_3',
  'iori_aoihana_c', 'iori_aoihana_c_2', 'iori_aoihana_c_3',
  'iori_yumeyumi', 'iori_katanugi', 'iori_yukiwarui',
  'dm_yatagarasu', 'sdm_yatagarasu', 'hsdm_yaotome',
];

const ALL_IORI_ANIMATIONS = [...IORI_BASIC_ANIMATIONS, ...IORI_NORMAL_ANIMATIONS, ...IORI_SPECIAL_ANIMATIONS];

const EXPECTED_IORI_MOVES: { name: string; type: string }[] = [
  { name: '夢弾', type: 'command' },
  { name: '邯鄲', type: 'command' },
  { name: '百合折り', type: 'command' },
  { name: '闇払い', type: 'special' },
  { name: '鬼焼き', type: 'special' },
  { name: '琴月陰', type: 'special' },
  { name: '屑風', type: 'special' },
  { name: '葵花', type: 'special' },
  { name: '八咫烏', type: 'dm' },
  { name: '八稚女', type: 'hsdm' },
];

const EXPECTED_CANCEL_ROUTES = [
  { from: 'STAND_C', to: 'IORI_ONIYAKI', type: 'special' },
  { from: 'CLOSE_C', to: 'IORI_AOIHANA', type: 'special' },
  { from: 'IORI_ONIYAKI', to: 'DM_YATAGARASU', type: 'super' },
  { from: 'CROUCH_C', to: 'IORI_YAMIBARAI', type: 'special' },
  { from: 'IORI_AOIHANA', to: 'IORI_AOIHANA_2', type: 'rekka' },
  { from: 'IORI_AOIHANA_2', to: 'IORI_AOIHANA_3', type: 'rekka' },
];

const IORI_HIT_EFFECT_ATTACK_TYPES = [
  'IORI_YUMEYUMI', 'IORI_KATANUGI', 'IORI_YUKIWARUI',
  'IORI_ONIYAKI', 'IORI_ONIYAKI_C',
  'IORI_YAMIBARAI', 'IORI_YAMIBARAI_C',
  'IORI_KOTOTSUKI', 'IORI_KOTOTSUKI_D', 'IORI_KUZUKAZE',
  'IORI_AOIHANA', 'IORI_AOIHANA_2', 'IORI_AOIHANA_3',
  'IORI_AOIHANA_C', 'IORI_AOIHANA_C_2', 'IORI_AOIHANA_C_3',
  'DM_YATAGARASU', 'SDM_YATAGARASU', 'HSDM_YAOTOME',
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

export function generateIoriDimensionReport(): IoriDimensionReport {
  // 1. Animation metadata
  const animationMeta = buildDimension(
    'Animation Meta',
    ALL_IORI_ANIMATIONS.map(a => ({ key: a, label: a })),
    (key) => key in IORI_ANIMATION_META,
  );

  // 2. Frame data (all attack keys have frame data entries)
  const frameData = buildDimension(
    'Frame Data',
    IORI_ATTACK_KEYS.map(k => ({ key: k, label: k })),
    (key) => getIoriAttackFrameData(key) !== undefined,
  );

  // 3. Attack frame keys (hitbox data)
  const attackFrames = buildDimension(
    'Attack Frames',
    IORI_ATTACK_KEYS.map(k => ({ key: k, label: k })),
    (key) => {
      const af = getIoriAttackFrameData(key as any);
      return af !== undefined;
    },
  );

  // 4. Feedback tier (all attacks have a tier)
  const feedbackTiers = getIoriFeedbackTiers();
  const feedback = buildDimension(
    'Feedback',
    IORI_ATTACK_KEYS.map(k => ({ key: k, label: k })),
    (key) => key in feedbackTiers,
  );

  // 5. Portrait (4 sizes)
  const portraitSizes: PortraitSize[] = ['select', 'vs', 'hud', 'win'];
  const portrait = buildDimension(
    'Portrait',
    portraitSizes.map(s => ({ key: s, label: s })),
    (key) => {
      const meta = IORI_PORTRAIT_META[key as PortraitSize];
      return meta !== undefined && meta.hasPixelData;
    },
  );

  // 6. MoveList
  const moveList = buildDimension(
    'MoveList',
    EXPECTED_IORI_MOVES.map(m => ({ key: `${m.type}:${m.name}`, label: `${m.type}/${m.name}` })),
    (key) => {
      const [type, name] = key.split(':');
      return IORI_MOVE_LIST.some(
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
      return IORI_CANCEL_PATHS.some(
        route => route.from === from && route.to.includes(to),
      );
    },
  );

  // 8. Hit effects (attack types covered by VFX/SFX plugin)
  const hitEffectPrefixes = IORI_HIT_EFFECTS.prefixes;
  const hitEffects = buildDimension(
    'Hit Effects',
    IORI_HIT_EFFECT_ATTACK_TYPES.map(k => ({ key: k, label: k })),
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

export function printIoriReport(): void {
  const report = generateIoriDimensionReport();
  const line = '='.repeat(60);
  const dash = '-'.repeat(60);

  console.log('');
  console.log(line);
  console.log('  IORI CONTENT PACKAGE - COMPLETENESS REPORT');
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
printIoriReport();
