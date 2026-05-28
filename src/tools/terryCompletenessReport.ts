/**
 * Terry Completeness Report Tool
 *
 * Validates completeness of Terry's content package across 8 dimensions:
 *   1. Animation metadata (basic + attack animations)
 *   2. Frame data (startup/active/recovery for all attacks)
 *   3. Attack frame keys (hitbox data for all attacks)
 *   4. Feedback tier (all attacks mapped to a tier)
 *   5. Portrait (4 size variants)
 *   6. MoveList (expected entries present)
 *   7. Cancel paths (expected routes exist)
 *   8. Hit effects (all attack types handled by VFX/SFX plugin)
 *
 * Reads from Terry content package barrel exports.
 */

import {
  TERRY_ATTACK_KEYS,
  TERRY_ANIMATION_META,
  TERRY_FEEDBACK_SUMMARY,
  TERRY_PORTRAIT_META,
  TERRY_MOVE_LIST,
  TERRY_CANCEL_PATHS,
  TERRY_HIT_EFFECTS,
} from '../content/characters/terry/index.js';
import { TERRY_ATTACK_KEYS as TERRY_ATK_KEYS, getTerryAttackFrameData } from '../content/characters/terry/attacks.js';
import { getTerryFeedbackTiers } from '../content/characters/terry/feedback.js';
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

export interface TerryDimensionReport {
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

const TERRY_BASIC_ANIMATIONS = [
  'idle', 'walk_forward', 'walk_backward', 'crouch', 'block',
  'jump_up', 'jump_forward', 'jump_backward',
  'hitstun', 'knockdown', 'dizzy', 'win',
];

const TERRY_NORMAL_ANIMATIONS = [
  'stand_a', 'stand_b', 'stand_c', 'stand_d',
  'crouch_a', 'crouch_b', 'crouch_c', 'crouch_d',
];

const TERRY_SPECIAL_ANIMATIONS = [
  'terry_power_wave', 'terry_round_wave',
  'terry_burn_knuckle', 'terry_burn_knuckle_c', 'terry_burn_knuckle_d',
  'terry_crack_shot', 'terry_crack_shot_d',
  'terry_power_dunk', 'terry_power_dunk_d',
  'terry_rising_tackle', 'terry_rising_tackle_c',
  'terry_power_charge', 'terry_hammer_punch',
  'terry_back_knckle', 'terry_combo_blow',
  'dm_power_geyser', 'dm_high_angle_geyser',
  'sdm_triple_geyser', 'sdm_power_geyser_ex', 'sdm_high_angle_geyser',
  'hsdm_power_geyser',
];

const ALL_TERRY_ANIMATIONS = [...TERRY_BASIC_ANIMATIONS, ...TERRY_NORMAL_ANIMATIONS, ...TERRY_SPECIAL_ANIMATIONS];

const EXPECTED_TERRY_MOVES: { name: string; type: string }[] = [
  { name: 'Back Knuckle', type: 'command' },
  { name: 'Combination Blow', type: 'command' },
  { name: 'Power Wave', type: 'special' },
  { name: 'Burn Knuckle', type: 'special' },
  { name: 'Crack Shot', type: 'special' },
  { name: 'Power Dunk', type: 'special' },
  { name: 'Rising Tackle', type: 'special' },
  { name: 'Power Geyser', type: 'dm' },
  { name: 'High Angle Geyser', type: 'dm' },
  { name: 'Triple Geyser', type: 'sdm' },
];

const EXPECTED_CANCEL_ROUTES = [
  { from: 'STAND_C', to: 'TERRY_BURN_KNUCKLE', type: 'special' },
  { from: 'CLOSE_C', to: 'TERRY_POWER_WAVE', type: 'special' },
  { from: 'TERRY_POWER_WAVE', to: 'DM_POWER_GEYSER', type: 'super' },
  { from: 'CROUCH_C', to: 'TERRY_BURN_KNUCKLE', type: 'special' },
  { from: 'TERRY_BACK_KNCKLE', to: 'TERRY_BURN_KNUCKLE', type: 'command' },
  { from: 'TERRY_COMBO_BLOW', to: 'TERRY_CRACK_SHOT', type: 'command' },
];

const TERRY_HIT_EFFECT_ATTACK_TYPES = [
  'TERRY_BURN_KNUCKLE', 'TERRY_BURN_KNUCKLE_C', 'TERRY_BURN_KNUCKLE_D',
  'TERRY_POWER_WAVE', 'TERRY_ROUND_WAVE',
  'TERRY_CRACK_SHOT', 'TERRY_CRACK_SHOT_D',
  'TERRY_POWER_DUNK', 'TERRY_POWER_DUNK_D',
  'TERRY_RISING_TACKLE', 'TERRY_RISING_TACKLE_C',
  'TERRY_POWER_CHARGE', 'TERRY_HAMMER_PUNCH',
  'DM_POWER_GEYSER', 'DM_POWER_GEYSER_A', 'DM_POWER_GEYSER_C',
  'DM_HIGH_ANGLE_GEYSER', 'DM_HIGH_ANGLE_GEYSER_B', 'DM_HIGH_ANGLE_GEYSER_D',
  'SDM_TRIPLE_GEYSER', 'SDM_POWER_GEYSER_EX', 'SDM_HIGH_ANGLE_GEYSER',
  'HSDM_POWER_GEYSER',
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

export function generateTerryDimensionReport(): TerryDimensionReport {
  // 1. Animation metadata
  const animationMeta = buildDimension(
    'Animation Meta',
    ALL_TERRY_ANIMATIONS.map(a => ({ key: a, label: a })),
    (key) => key in TERRY_ANIMATION_META,
  );

  // 2. Frame data (all attack keys have frame data entries)
  const frameData = buildDimension(
    'Frame Data',
    TERRY_ATTACK_KEYS.map(k => ({ key: k, label: k })),
    (key) => getTerryAttackFrameData(key) !== undefined,
  );

  // 3. Attack frame keys (hitbox data)
  const attackFrames = buildDimension(
    'Attack Frames',
    TERRY_ATTACK_KEYS.map(k => ({ key: k, label: k })),
    (key) => {
      const af = getTerryAttackFrameData(key as any);
      return af !== undefined;
    },
  );

  // 4. Feedback tier (all attacks have a tier)
  const feedbackTiers = getTerryFeedbackTiers();
  const feedback = buildDimension(
    'Feedback',
    TERRY_ATTACK_KEYS.map(k => ({ key: k, label: k })),
    (key) => key in feedbackTiers,
  );

  // 5. Portrait (4 sizes)
  const portraitSizes: PortraitSize[] = ['select', 'vs', 'hud', 'win'];
  const portrait = buildDimension(
    'Portrait',
    portraitSizes.map(s => ({ key: s, label: s })),
    (key) => {
      const meta = TERRY_PORTRAIT_META[key as PortraitSize];
      return meta !== undefined && meta.hasPixelData;
    },
  );

  // 6. MoveList
  const moveList = buildDimension(
    'MoveList',
    EXPECTED_TERRY_MOVES.map(m => ({ key: `${m.type}:${m.name}`, label: `${m.type}/${m.name}` })),
    (key) => {
      const [type, name] = key.split(':');
      return TERRY_MOVE_LIST.some(
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
      return TERRY_CANCEL_PATHS.some(
        route => route.from === from && route.to.includes(to),
      );
    },
  );

  // 8. Hit effects (attack types covered by VFX/SFX plugin)
  const hitEffectPrefixes = TERRY_HIT_EFFECTS.prefixes;
  const hitEffects = buildDimension(
    'Hit Effects',
    TERRY_HIT_EFFECT_ATTACK_TYPES.map(k => ({ key: k, label: k })),
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

export function printTerryReport(): void {
  const report = generateTerryDimensionReport();
  const line = '='.repeat(60);
  const dash = '-'.repeat(60);

  console.log('');
  console.log(line);
  console.log('  TERRY CONTENT PACKAGE - COMPLETENESS REPORT');
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
printTerryReport();
