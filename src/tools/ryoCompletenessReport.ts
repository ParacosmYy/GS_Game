/**
 * Ryo Completeness Report Tool
 *
 * Checks the completeness of Ryo's vertical slice assets against the
 * minimum requirements defined in the Ryo Vertical Slice Plan:
 *   - 8 minimum actions: idle, walk_forward, walk_backward, jump,
 *     stand_a, stand_c, hurt, knockdown
 *   - Frame count thresholds per action
 *   - Portrait manifest data (select, vs, hud, win)
 *   - FRAME_DATA entries for attack actions
 *   - ATTACK_FRAMES entries for all Ryo attacks
 *   - Feedback tier coverage for all Ryo attacks
 *   - Hurtbox coverage for relevant states
 *   - MoveList completeness
 *
 * Reads from ROSTER, FRAME_DATA, ATTACK_FRAMES, FEEDBACK_MANIFEST,
 * HURTBOX_TABLE, PORTRAIT_MANIFEST.
 * Prints a formatted report to console and returns the structured report object.
 */

import { ROSTER } from '../characters/index.js';
import { FRAME_DATA } from '../core/constants.js';
import { PORTRAIT_MANIFEST, type PortraitSize } from '../core/portraitManifest.js';
import { ATTACK_FRAMES } from '../core/attackFrames.js';
import { getFeedback, inferTier, type FeedbackTier } from '../core/feedbackManifest.js';
import { HURTBOX_TABLE } from '../core/hurtboxManifest.js';
import type { Pose, PoseSet } from '../characters/types.js';
import { FighterState, AttackType } from '../core/types.js';
import { getResolvedFrameKey, drawRyoWinPose } from '../rendering/sprites/ryo/ryoHighResRender.js';

// ===== Type Definitions =====

export interface ActionStatus {
  /** Action identifier (e.g. "idle", "stand_a") */
  name: string;
  /** Human-readable description of current state */
  state: string;
  /** Number of frames found in pose data */
  frameCount: number;
  /** Minimum required frames per the vertical slice plan */
  minRequired: number;
  /** Whether FRAME_DATA has an entry for this action */
  hasFrameData: boolean;
  /** Whether portrait manifest has entries for this character */
  hasPortrait: boolean;
  /** Overall completion status */
  status: 'complete' | 'partial' | 'missing';
}

export interface RyoCompletenessReport {
  /** Character identifier */
  character: string;
  /** Total number of minimum actions being tracked */
  totalActions: number;
  /** Number of actions that are 'complete' */
  completeActions: number;
  /** Per-action status details */
  actions: ActionStatus[];
  /** Actions that are fully missing (no pose data at all) */
  missingActions: string[];
  /** Overall progress as a percentage (0-100) */
  overallProgress: number;
}

// ===== New dimension types =====

export interface DimensionResult {
  /** Dimension name */
  dimension: string;
  /** Total items checked */
  total: number;
  /** Items that passed */
  passed: number;
  /** Completion percentage (0-100) */
  pct: number;
  /** Items that are missing or incomplete */
  missing: string[];
  /** Items that are complete */
  complete: string[];
}

export interface RyoDimensionReport {
  /** Action frame completeness (8 minimum actions) */
  actionFrames: DimensionResult;
  /** Attack frame completeness (ATTACK_FRAMES for Ryo attacks) */
  attackFrames: DimensionResult;
  /** Feedback tier completeness (all Ryo attacks have feedback) */
  feedback: DimensionResult;
  /** Hurtbox completeness (states have HURTBOX_TABLE entries) */
  hurtbox: DimensionResult;
  /** Portrait completeness (4 size variants) */
  portrait: DimensionResult;
  /** MoveList completeness */
  moveList: DimensionResult;
  /** Visual pixel frame completeness (dedicated frames, not IDLE fallback) */
  visualFrames: DimensionResult;
  /** Weighted overall score across all dimensions (0-100) */
  overallScore: number;
}

// ===== Minimum Action Definitions =====

/** Maps action name to the pose key(s) in RyoDef.poses and minimum frame requirements */
interface ActionSpec {
  /** Human-readable name */
  label: string;
  /** Key(s) to look up in PoseSet (FighterState value or custom string) */
  poseKeys: string[];
  /** Minimum frames required for this action to be considered complete */
  minFrames: number;
  /** FRAME_DATA key(s) to check; empty if not an attack action */
  frameDataKeys: string[];
  /** Whether this action requires distinct startup/active/recovery phases */
  requiresPhaseAlignment: boolean;
  /** FighterState(s) that need hurtbox entries */
  hurtboxStates: string[];
}

const MINIMUM_ACTIONS: ActionSpec[] = [
  {
    label: 'idle',
    poseKeys: [FighterState.IDLE],
    minFrames: 4,
    frameDataKeys: [],
    requiresPhaseAlignment: false,
    hurtboxStates: [FighterState.IDLE],
  },
  {
    label: 'walk_forward',
    poseKeys: [FighterState.WALK],
    minFrames: 4,
    frameDataKeys: [],
    requiresPhaseAlignment: false,
    hurtboxStates: [FighterState.WALK],
  },
  {
    label: 'walk_backward',
    poseKeys: [FighterState.WALK], // WALK covers both directions in current system
    minFrames: 4,
    frameDataKeys: [],
    requiresPhaseAlignment: false,
    hurtboxStates: [FighterState.WALK],
  },
  {
    label: 'jump',
    poseKeys: [FighterState.JUMP],
    minFrames: 2,
    frameDataKeys: [],
    requiresPhaseAlignment: false,
    hurtboxStates: [FighterState.JUMP],
  },
  {
    label: 'stand_a',
    poseKeys: [FighterState.STAND_ATTACK],
    minFrames: 3, // at least startup + active + recovery frames
    frameDataKeys: [AttackType.STAND_A],
    requiresPhaseAlignment: true,
    hurtboxStates: [FighterState.STAND_ATTACK],
  },
  {
    label: 'stand_c',
    poseKeys: [FighterState.STAND_ATTACK],
    minFrames: 3,
    frameDataKeys: [AttackType.STAND_C],
    requiresPhaseAlignment: true,
    hurtboxStates: [FighterState.STAND_ATTACK],
  },
  {
    label: 'hurt',
    poseKeys: [FighterState.HITSTUN],
    minFrames: 3,
    frameDataKeys: [],
    requiresPhaseAlignment: false,
    hurtboxStates: [FighterState.HITSTUN],
  },
  {
    label: 'knockdown',
    poseKeys: [FighterState.KNOCKDOWN],
    minFrames: 3,
    frameDataKeys: [],
    requiresPhaseAlignment: false,
    hurtboxStates: [FighterState.KNOCKDOWN],
  },
];

/** Normal moves to track (beyond minimum 8) */
const NORMAL_MOVE_KEYS: { key: string; label: string }[] = [
  { key: AttackType.STAND_B, label: 'STAND_B (far B kick)' },
  { key: AttackType.STAND_D, label: 'STAND_D (far D kick)' },
  { key: AttackType.CLOSE_A, label: 'CLOSE_A (close A punch)' },
  { key: AttackType.CLOSE_B, label: 'CLOSE_B (close B kick)' },
  { key: AttackType.CLOSE_C, label: 'CLOSE_C (close C punch)' },
  { key: AttackType.CLOSE_D, label: 'CLOSE_D (close D kick)' },
  { key: AttackType.CROUCH_A, label: 'CROUCH_A (low A)' },
  { key: AttackType.CROUCH_B, label: 'CROUCH_B (low B)' },
  { key: AttackType.CROUCH_C, label: 'CROUCH_C (low C)' },
  { key: AttackType.CROUCH_D, label: 'CROUCH_D (sweep D)' },
  { key: AttackType.JUMP_A, label: 'JUMP_A (air A)' },
  { key: AttackType.JUMP_B, label: 'JUMP_B (air B)' },
  { key: AttackType.JUMP_C, label: 'JUMP_C (air C)' },
  { key: AttackType.JUMP_D, label: 'JUMP_D (air D)' },
];

/** Special moves to track (beyond minimum 8, reported separately) */
const SPECIAL_MOVE_KEYS: { key: string; label: string }[] = [
  { key: AttackType.RYO_KOOU, label: 'RYO_KOOU (QCF+A)' },
  { key: AttackType.RYO_KOOU_C, label: 'RYO_KOOU_C (QCF+C)' },
  { key: AttackType.RYO_KO_HOU, label: 'RYO_KO_HOU (DP+A)' },
  { key: AttackType.RYO_KO_HOU_C, label: 'RYO_KO_HOU_C (DP+C)' },
  { key: AttackType.RYO_HIEN, label: 'RYO_HIEN (QCB+K)' },
  { key: AttackType.RYO_HAOU, label: 'RYO_HAOU (QCF+K)' },
  { key: AttackType.RYO_TSURIZAO, label: 'RYO_TSURIZAO (->+A)' },
  { key: AttackType.RYO_ORISHI, label: 'RYO_ORISHI (v->+B)' },
  { key: 'DM_TEN_HA_OU', label: 'DM_TEN_HA_OU (DM)' },
  { key: 'DM_RYUKO_RANBU', label: 'DM_RYUKO_RANBU (DM)' },
  { key: 'SDM_RYUKO_RANBU', label: 'SDM_RYUKO_RANBU (SDM)' },
  { key: 'HSDM_RYUKO_RANBU', label: 'HSDM_RYUKO_RANBU (HSDM)' },
  { key: 'SDM_TEN_HA_OU', label: 'SDM_TEN_HA_OU (SDM)' },
];

/** All Ryo-relevant attack types (normals + specials + DMs) */
const RYO_ALL_ATTACKS: { key: string; label: string }[] = [
  // Normals (shared)
  { key: AttackType.STAND_A, label: 'STAND_A' },
  { key: AttackType.STAND_B, label: 'STAND_B' },
  { key: AttackType.STAND_C, label: 'STAND_C' },
  { key: AttackType.STAND_D, label: 'STAND_D' },
  { key: AttackType.CLOSE_A, label: 'CLOSE_A' },
  { key: AttackType.CLOSE_B, label: 'CLOSE_B' },
  { key: AttackType.CLOSE_C, label: 'CLOSE_C' },
  { key: AttackType.CLOSE_D, label: 'CLOSE_D' },
  // Ryo command normals
  { key: AttackType.RYO_TSURIZAO, label: 'RYO_TSURIZAO' },
  { key: AttackType.RYO_ORISHI, label: 'RYO_ORISHI' },
  // Crouching/air normals (shared)
  { key: AttackType.CROUCH_A, label: 'CROUCH_A' },
  { key: AttackType.CROUCH_B, label: 'CROUCH_B' },
  { key: AttackType.CROUCH_C, label: 'CROUCH_C' },
  { key: AttackType.CROUCH_D, label: 'CROUCH_D' },
  { key: AttackType.JUMP_A, label: 'JUMP_A' },
  { key: AttackType.JUMP_B, label: 'JUMP_B' },
  { key: AttackType.JUMP_C, label: 'JUMP_C' },
  { key: AttackType.JUMP_D, label: 'JUMP_D' },
  // Throws and CD
  { key: AttackType.THROW, label: 'THROW' },
  { key: AttackType.THROW_FORWARD, label: 'THROW_FORWARD' },
  { key: AttackType.THROW_BACK, label: 'THROW_BACK' },
  { key: AttackType.STAND_CD, label: 'STAND_CD' },
  { key: AttackType.JUMP_CD, label: 'JUMP_CD' },
  // Ryo specials
  { key: AttackType.RYO_KOOU, label: 'RYO_KOOU' },
  { key: AttackType.RYO_KOOU_C, label: 'RYO_KOOU_C' },
  { key: AttackType.RYO_KO_HOU, label: 'RYO_KO_HOU' },
  { key: AttackType.RYO_KO_HOU_C, label: 'RYO_KO_HOU_C' },
  { key: AttackType.RYO_HIEN, label: 'RYO_HIEN' },
  { key: AttackType.RYO_HAOU, label: 'RYO_HAOU' },
  // Ryo DMs/SDMs/HSDMs
  { key: 'DM_TEN_HA_OU', label: 'DM_TEN_HA_OU' },
  { key: 'DM_RYUKO_RANBU', label: 'DM_RYUKO_RANBU' },
  { key: 'SDM_RYUKO_RANBU', label: 'SDM_RYUKO_RANBU' },
  { key: 'HSDM_RYUKO_RANBU', label: 'HSDM_RYUKO_RANBU' },
  { key: 'SDM_TEN_HA_OU', label: 'SDM_TEN_HA_OU' },
];

/** Ryo-specific moveList expected entries for completeness check */
const EXPECTED_RYO_MOVES: { name: string; type: string }[] = [
  { name: '冰柱割り', type: 'command' },
  { name: '落蹴', type: 'command' },
  { name: '虎煌拳', type: 'special' },
  { name: '虎咆', type: 'special' },
  { name: '飛燕疾風脚', type: 'special' },
  { name: '霸王翔吼拳', type: 'special' },
  { name: '天地霸煌拳', type: 'dm' },
  { name: '龍虎乱舞', type: 'dm' },
];

/** States that should have hurtbox entries per the vertical slice plan */
const RYO_HURTBOX_STATES: { state: string; label: string }[] = [
  { state: FighterState.IDLE, label: 'IDLE' },
  { state: FighterState.WALK, label: 'WALK' },
  { state: FighterState.JUMP, label: 'JUMP' },
  { state: FighterState.STAND_ATTACK, label: 'STAND_ATTACK' },
  { state: FighterState.HITSTUN, label: 'HITSTUN' },
  { state: FighterState.KNOCKDOWN, label: 'KNOCKDOWN' },
  { state: FighterState.CROUCH, label: 'CROUCH' },
  { state: FighterState.BLOCK, label: 'BLOCK' },
];

/** States that should have dedicated visual pixel frames (not IDLE fallback) */
const RYO_VISUAL_FRAME_STATES: { key: string; label: string }[] = [
  { key: 'IDLE', label: 'IDLE' },
  { key: 'WALK_FORWARD', label: 'WALK_FORWARD' },
  { key: 'WALK_BACKWARD', label: 'WALK_BACKWARD' },
  { key: 'JUMP', label: 'JUMP' },
  { key: 'CROUCH', label: 'CROUCH' },
  { key: 'RUN', label: 'RUN' },
  { key: 'BACKDASH', label: 'BACKDASH' },
  { key: 'ROLL', label: 'ROLL' },
  { key: 'BACK_ROLL', label: 'BACK_ROLL' },
  { key: 'STAND_A', label: 'STAND_A' },
  { key: 'STAND_B', label: 'STAND_B' },
  { key: 'STAND_C', label: 'STAND_C' },
  { key: 'STAND_D', label: 'STAND_D' },
  { key: 'CLOSE_B', label: 'CLOSE_B' },
  { key: 'CLOSE_D', label: 'CLOSE_D' },
  { key: 'CROUCH_A', label: 'CROUCH_A' },
  { key: 'CROUCH_B', label: 'CROUCH_B' },
  { key: 'CROUCH_C', label: 'CROUCH_C' },
  { key: 'CROUCH_D', label: 'CROUCH_D' },
  { key: 'AIR_A', label: 'AIR_A' },
  { key: 'AIR_C', label: 'AIR_C' },
  { key: 'AIR_D', label: 'AIR_D' },
  { key: 'KO_HOU', label: 'KO_HOU (DP)' },
  { key: 'KOOU', label: 'KOOU (QCF)' },
  { key: 'HIEN', label: 'HIEN (QCB)' },
  { key: 'HAOU', label: 'HAOU (counter)' },
  { key: 'KOOU_C', label: 'KOOU_C (strong)' },
  { key: 'KO_HOU_C', label: 'KO_HOU_C (strong)' },
  { key: 'DM_TEN_HA_OU', label: 'DM_TEN_HA_OU' },
  { key: 'RYUKO_RANBU', label: 'RYUKO_RANBU (DM/SDM shared)' },
  { key: 'SDM_TEN_HA_OU', label: 'SDM_TEN_HA_OU' },
  { key: 'HSDM_RYUKO_RANBU', label: 'HSDM_RYUKO_RANBU' },
  { key: 'HURT', label: 'HURT' },
  { key: 'KNOCKDOWN', label: 'KNOCKDOWN' },
  { key: 'BLOCK', label: 'BLOCK' },
  { key: 'GUARD_CRUSH', label: 'GUARD_CRUSH' },
  { key: 'MAX_MODE', label: 'MAX_MODE' },
  { key: 'TAUNT', label: 'TAUNT' },
  { key: 'COUNTER_STANCE', label: 'COUNTER_STANCE' },
  { key: 'WIN', label: 'WIN' },
  { key: 'DIZZY', label: 'DIZZY' },
  { key: 'THROW', label: 'THROW' },
];

// ===== Helper Functions =====

/** Count frames in a PoseSet entry (single Pose = 1 frame, array = length) */
function countFrames(poseData: Pose | Pose[] | undefined): number {
  if (poseData === undefined) return 0;
  if (Array.isArray(poseData)) return poseData.length;
  return 1; // single Pose counts as 1 frame
}

/** Check if a string key exists in FRAME_DATA */
function hasFrameDataEntry(key: string): boolean {
  return key in FRAME_DATA;
}

/** Check if a string key exists in ATTACK_FRAMES */
function hasAttackFrameEntry(key: string): boolean {
  return key in ATTACK_FRAMES;
}

/** Build a DimensionResult from parallel checks */
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

// ===== Main Report Generator =====

export function generateRyoReport(): RyoCompletenessReport {
  // Find Ryo in ROSTER
  const ryoDef = ROSTER.find(c => c.id === 'ryo');
  if (!ryoDef) {
    return {
      character: 'ryo',
      totalActions: MINIMUM_ACTIONS.length,
      completeActions: 0,
      actions: [],
      missingActions: MINIMUM_ACTIONS.map(a => a.label),
      overallProgress: 0,
    };
  }

  const poses: PoseSet = ryoDef.poses;

  // Check portrait manifest
  const portraitEntries = PORTRAIT_MANIFEST.portraits['ryo'];
  const hasPortrait = portraitEntries !== undefined
    && 'select' in portraitEntries
    && 'hud' in portraitEntries;

  // Evaluate each minimum action
  const actions: ActionStatus[] = MINIMUM_ACTIONS.map((spec) => {
    // Try each pose key; use the first one found
    let bestFrameCount = 0;
    let foundKey = false;

    for (const poseKey of spec.poseKeys) {
      const poseData = poses[poseKey];
      if (poseData !== undefined) {
        foundKey = true;
        const count = countFrames(poseData);
        if (count > bestFrameCount) {
          bestFrameCount = count;
        }
      }
    }

    // Check FRAME_DATA for all required keys
    const hasAllFrameData = spec.frameDataKeys.length === 0
      || spec.frameDataKeys.every(key => hasFrameDataEntry(key));

    // Determine status
    let status: 'complete' | 'partial' | 'missing';
    if (!foundKey) {
      status = 'missing';
    } else if (bestFrameCount >= spec.minFrames && hasAllFrameData) {
      status = 'complete';
    } else {
      status = 'partial';
    }

    // Build state description
    let state: string;
    if (!foundKey) {
      state = 'No pose data';
    } else if (bestFrameCount >= spec.minFrames && hasAllFrameData) {
      state = `OK (${bestFrameCount} frames)`;
    } else if (bestFrameCount < spec.minFrames) {
      state = `Low frames (${bestFrameCount}/${spec.minFrames})`;
    } else {
      state = `Missing FRAME_DATA`;
    }

    return {
      name: spec.label,
      state,
      frameCount: bestFrameCount,
      minRequired: spec.minFrames,
      hasFrameData: hasAllFrameData,
      hasPortrait,
      status,
    };
  });

  const completeActions = actions.filter(a => a.status === 'complete').length;
  const missingActions = actions.filter(a => a.status === 'missing').map(a => a.name);

  // Progress: each action contributes equally to the overall percentage
  // An action that is 'complete' contributes 100%, 'partial' 50%, 'missing' 0%
  const totalWeight = actions.length;
  const earnedWeight = actions.reduce((sum, a) => {
    if (a.status === 'complete') return sum + 1;
    if (a.status === 'partial') return sum + 0.5;
    return sum;
  }, 0);
  const overallProgress = totalWeight > 0
    ? Math.round((earnedWeight / totalWeight) * 100)
    : 0;

  return {
    character: 'ryo',
    totalActions: actions.length,
    completeActions,
    actions,
    missingActions,
    overallProgress,
  };
}

// ===== Dimension Report Generator =====

export function generateRyoDimensionReport(): RyoDimensionReport {
  const ryoDef = ROSTER.find(c => c.id === 'ryo');

  // 1. Action Frames: 8 minimum actions with sufficient pose frames
  const actionFrames = buildDimension(
    'Action Frames',
    MINIMUM_ACTIONS.map(spec => ({
      key: spec.label,
      label: spec.label,
    })),
    (key) => {
      const spec = MINIMUM_ACTIONS.find(s => s.label === key);
      if (!spec || !ryoDef) return false;
      let bestCount = 0;
      for (const pk of spec.poseKeys) {
        const pd = ryoDef.poses[pk];
        if (pd !== undefined) {
          const c = countFrames(pd);
          if (c > bestCount) bestCount = c;
        }
      }
      return bestCount >= spec.minFrames;
    },
  );

  // 2. Attack Frames: ATTACK_FRAMES entries for all Ryo attacks
  const attackFrames = buildDimension(
    'Attack Frames',
    RYO_ALL_ATTACKS,
    (key) => hasAttackFrameEntry(key),
  );

  // 3. Feedback: all Ryo attacks have feedback coverage
  const feedback = buildDimension(
    'Feedback',
    RYO_ALL_ATTACKS,
    (key) => {
      try {
        const params = getFeedback(key as AttackType);
        return params !== undefined && params.hitstop > 0;
      } catch {
        return false;
      }
    },
  );

  // 4. Hurtbox: states have HURTBOX_TABLE entries
  const hurtbox = buildDimension(
    'Hurtbox',
    RYO_HURTBOX_STATES.map(s => ({ key: s.state, label: s.label })),
    (key) => key in HURTBOX_TABLE,
  );

  // 5. Portrait: 4 size variants exist in PORTRAIT_MANIFEST
  const portraitSizes: PortraitSize[] = ['select', 'vs', 'hud', 'win'];
  const portrait = buildDimension(
    'Portrait',
    portraitSizes.map(s => ({ key: s, label: s })),
    (key) => {
      const entry = PORTRAIT_MANIFEST.portraits['ryo']?.[key as PortraitSize];
      return entry !== undefined && entry.width > 0;
    },
  );

  // 6. MoveList: expected entries present
  const moveListItems = EXPECTED_RYO_MOVES.map(m => ({
    key: `${m.type}:${m.name}`,
    label: `${m.type}/${m.name}`,
  }));
  const moveList = buildDimension(
    'MoveList',
    moveListItems,
    (key) => {
      if (!ryoDef?.moveList) return false;
      const [type, name] = key.split(':');
      // Check if moveList contains an entry matching the expected name
      // Use partial match since moveList names may contain full Japanese text
      return ryoDef.moveList.some(
        entry => entry.type === type && entry.name.includes(name),
      );
    },
  );

  // 7. Visual Frames: dedicated pixel frames for each registry key
  //    Use a state-to-key mapping to call hasHighResFrame correctly
  const STATE_MAP: Record<string, { state: FighterState; attack?: AttackType }> = {
    IDLE: { state: FighterState.IDLE },
    WALK_FORWARD: { state: FighterState.WALK, attack: undefined },
    WALK_BACKWARD: { state: FighterState.WALK, attack: undefined },
    JUMP: { state: FighterState.JUMP },
    CROUCH: { state: FighterState.CROUCH },
    RUN: { state: FighterState.RUN },
    BACKDASH: { state: FighterState.BACKDASH },
    ROLL: { state: FighterState.ROLL },
    BACK_ROLL: { state: FighterState.BACK_ROLL },
    STAND_A: { state: FighterState.STAND_ATTACK, attack: AttackType.STAND_A },
    STAND_B: { state: FighterState.STAND_ATTACK, attack: AttackType.STAND_B },
    STAND_C: { state: FighterState.STAND_ATTACK, attack: AttackType.STAND_C },
    STAND_D: { state: FighterState.STAND_ATTACK, attack: AttackType.STAND_D },
    CLOSE_B: { state: FighterState.STAND_ATTACK, attack: AttackType.CLOSE_B },
    CLOSE_D: { state: FighterState.STAND_ATTACK, attack: AttackType.CLOSE_D },
    CROUCH_A: { state: FighterState.CROUCH_ATTACK, attack: AttackType.CROUCH_A },
    CROUCH_B: { state: FighterState.CROUCH_ATTACK, attack: AttackType.CROUCH_B },
    CROUCH_C: { state: FighterState.CROUCH_ATTACK, attack: AttackType.CROUCH_C },
    CROUCH_D: { state: FighterState.CROUCH_ATTACK, attack: AttackType.CROUCH_D },
    AIR_A: { state: FighterState.AIR_ATTACK, attack: AttackType.JUMP_A },
    AIR_C: { state: FighterState.AIR_ATTACK, attack: AttackType.JUMP_C },
    AIR_D: { state: FighterState.AIR_ATTACK, attack: AttackType.JUMP_D },
    KO_HOU: { state: FighterState.STAND_ATTACK, attack: AttackType.RYO_KO_HOU },
    KOOU: { state: FighterState.STAND_ATTACK, attack: AttackType.RYO_KOOU },
    HIEN: { state: FighterState.STAND_ATTACK, attack: AttackType.RYO_HIEN },
    HAOU: { state: FighterState.STAND_ATTACK, attack: AttackType.RYO_HAOU },
    KOOU_C: { state: FighterState.STAND_ATTACK, attack: AttackType.RYO_KOOU_C },
    KO_HOU_C: { state: FighterState.STAND_ATTACK, attack: AttackType.RYO_KO_HOU_C },
    DM_TEN_HA_OU: { state: FighterState.STAND_ATTACK, attack: AttackType.DM_TEN_HA_OU },
    DM_RYUKO_RANBU: { state: FighterState.STAND_ATTACK, attack: AttackType.DM_RYUKO_RANBU },
    // RYUKO_RANBU resolves to 'RYUKO_RANBU' for both DM and SDM
    RYUKO_RANBU: { state: FighterState.STAND_ATTACK, attack: AttackType.DM_RYUKO_RANBU },
    SDM_TEN_HA_OU: { state: FighterState.STAND_ATTACK, attack: AttackType.SDM_TEN_HA_OU },
    HSDM_RYUKO_RANBU: { state: FighterState.STAND_ATTACK, attack: AttackType.HSDM_RYUKO_RANBU },
    HURT: { state: FighterState.HITSTUN },
    KNOCKDOWN: { state: FighterState.KNOCKDOWN },
    BLOCK: { state: FighterState.BLOCK },
    GUARD_CRUSH: { state: FighterState.GUARD_CRUSH },
    MAX_MODE: { state: FighterState.MAX_MODE },
    TAUNT: { state: FighterState.TAUNT },
    COUNTER_STANCE: { state: FighterState.COUNTER_STANCE },
    WIN: { state: FighterState.IDLE }, // WIN uses dedicated 'WIN' key, not a FighterState
    DIZZY: { state: FighterState.DIZZY },
    THROW: { state: FighterState.THROW },
  };
  const visualFrames = buildDimension(
    'Visual Frames',
    RYO_VISUAL_FRAME_STATES,
    (key) => {
      // WIN is a dedicated key not mapped through FighterState
      if (key === 'WIN') {
        return typeof drawRyoWinPose === 'function';
      }
      const mapping = STATE_MAP[key];
      if (!mapping) return false;
      // For walk, need to pass vx to distinguish forward/backward
      let vx = 0;
      if (key === 'WALK_FORWARD') vx = 1;
      if (key === 'WALK_BACKWARD') vx = -1;
      const resolvedKey = getResolvedFrameKey('ryo', mapping.state, mapping.attack, vx, 1);
      // Must resolve to its own dedicated key, not fallback to IDLE/CROUCH
      return resolvedKey === key;
    },
  );

  // Weighted overall score: action frames 20%, attack frames 15%, feedback 10%,
  // hurtbox 5%, portrait 10%, moveList 5%, visual frames 35%
  const weights = [
    { result: actionFrames, weight: 0.20 },
    { result: attackFrames, weight: 0.15 },
    { result: feedback, weight: 0.10 },
    { result: hurtbox, weight: 0.05 },
    { result: portrait, weight: 0.10 },
    { result: moveList, weight: 0.05 },
    { result: visualFrames, weight: 0.35 },
  ];

  const overallScore = Math.round(
    weights.reduce((sum, w) => sum + w.result.pct * w.weight, 0),
  );

  return {
    actionFrames,
    attackFrames,
    feedback,
    hurtbox,
    portrait,
    moveList,
    visualFrames,
    overallScore,
  };
}

// ===== Console Report Printer =====

/** Bar visualization for progress */
function progressBar(pct: number, width: number = 20): string {
  const filled = Math.round((pct / 100) * width);
  const empty = width - filled;
  return `[${'#'.repeat(filled)}${'-'.repeat(empty)}]`;
}

/** Status icon for terminal output */
function statusIcon(status: 'complete' | 'partial' | 'missing'): string {
  switch (status) {
    case 'complete': return 'OK';
    case 'partial':  return '~~';
    case 'missing':  return '!!';
  }
}

/** Dimension status icon */
function dimIcon(pct: number): string {
  if (pct >= 100) return 'OK';
  if (pct >= 50)  return '~~';
  return '!!';
}

export function printRyoReport(): void {
  const report = generateRyoReport();
  const dimReport = generateRyoDimensionReport();

  const line = '='.repeat(60);
  const dash = '-'.repeat(60);

  console.log('');
  console.log(line);
  console.log('  RYO VERTICAL SLICE - COMPLETENESS REPORT');
  console.log(line);
  console.log(`  Character:   ${report.character}`);
  console.log(`  Progress:    ${progressBar(report.overallProgress)} ${report.overallProgress}%`);
  console.log(`  Actions:     ${report.completeActions}/${report.totalActions} complete`);
  console.log(dash);

  // Header
  const header = '  Action            Status  Frames  Min  FrameData  Portrait';
  console.log(header);
  console.log('  ' + '-'.repeat(57));

  for (const action of report.actions) {
    const name = action.name.padEnd(18);
    const icon = statusIcon(action.status);
    const frames = String(action.frameCount).padStart(3);
    const min = String(action.minRequired).padStart(3);
    const fd = action.hasFrameData ? 'yes' : ' - ';
    const portrait = action.hasPortrait ? 'yes' : ' - ';
    console.log(`  ${name} [${icon}]   ${frames}   ${min}    ${fd}        ${portrait}`);
  }

  console.log(dash);

  // Dimension summary
  console.log('  DIMENSION SUMMARY:');
  console.log(`  Dimension          Status  Pct    Passed  Missing`);
  console.log('  ' + '-'.repeat(53));

  const dimensions: { dim: DimensionResult; label: string }[] = [
    { dim: dimReport.actionFrames, label: 'Action Frames' },
    { dim: dimReport.attackFrames, label: 'Attack Frames' },
    { dim: dimReport.feedback, label: 'Feedback' },
    { dim: dimReport.hurtbox, label: 'Hurtbox' },
    { dim: dimReport.portrait, label: 'Portrait' },
    { dim: dimReport.moveList, label: 'MoveList' },
    { dim: dimReport.visualFrames, label: 'Visual Frames' },
  ];

  for (const { dim, label } of dimensions) {
    const name = label.padEnd(18);
    const icon = dimIcon(dim.pct);
    const pctStr = `${dim.pct}%`.padStart(4);
    const passedStr = `${dim.passed}/${dim.total}`.padStart(7);
    const missingStr = dim.missing.length > 0 ? String(dim.missing.length) : '-';
    console.log(`  ${name} [${icon}]  ${pctStr}  ${passedStr}  ${missingStr}`);
  }

  console.log(dash);
  console.log(`  OVERALL SCORE:    ${progressBar(dimReport.overallScore)} ${dimReport.overallScore}%`);

  console.log(dash);

  // Portrait section
  const portraitEntries = PORTRAIT_MANIFEST.portraits['ryo'];
  const sizes = ['select', 'vs', 'hud', 'win'] as const;
  console.log('  PORTRAIT MANIFEST:');
  for (const size of sizes) {
    const entry = portraitEntries?.[size];
    if (entry) {
      console.log(`    ${size.padEnd(8)}: ${entry.width}x${entry.height} at (${entry.atlasX},${entry.atlasY}) color=${entry.fallbackColor}`);
    } else {
      console.log(`    ${size.padEnd(8)}: MISSING`);
    }
  }

  console.log(dash);

  // Normal moves section (beyond minimum 8)
  console.log('  NORMAL MOVES (extended):');
  for (const norm of NORMAL_MOVE_KEYS) {
    const inFrameData = hasFrameDataEntry(norm.key);
    const inAttackFrames = hasAttackFrameEntry(norm.key);
    const status = (inFrameData && inAttackFrames) ? '[OK]' : '[~~]';
    console.log(`    ${status} ${norm.label} — frameData:${inFrameData} attackFrames:${inAttackFrames}`);
  }

  // Special moves section
  console.log('  SPECIAL MOVES:');
  for (const spec of SPECIAL_MOVE_KEYS) {
    const inFrameData = hasFrameDataEntry(spec.key);
    const inAttackFrames = hasAttackFrameEntry(spec.key);
    const inPoses = spec.key in (ROSTER.find(c => c.id === 'ryo')?.poses ?? {});
    let status = '';
    if (inFrameData && inAttackFrames && inPoses) {
      status = '[OK] pose + frame data + attack frames';
    } else if (inFrameData && inAttackFrames) {
      status = '[~~] frame data + attack frames (no pose)';
    } else if (inFrameData && inPoses) {
      status = '[~~] pose + frame data (no attack frames)';
    } else if (inAttackFrames && inPoses) {
      status = '[~~] pose + attack frames (no frame data)';
    } else if (inFrameData) {
      status = '[~~] frame data only';
    } else if (inAttackFrames) {
      status = '[~~] attack frames only';
    } else if (inPoses) {
      status = '[~~] pose only';
    } else {
      status = '[!!] MISSING';
    }
    console.log(`    ${spec.label.padEnd(28)} ${status}`);
  }

  // Missing items detail
  console.log(dash);
  let hasMissing = false;

  if (report.missingActions.length > 0) {
    hasMissing = true;
    console.log('  MISSING ACTIONS (no pose data at all):');
    for (const name of report.missingActions) {
      console.log(`    - ${name}`);
    }
  }

  if (dimReport.attackFrames.missing.length > 0) {
    hasMissing = true;
    console.log('  MISSING ATTACK FRAMES (no ATTACK_FRAMES entry):');
    for (const name of dimReport.attackFrames.missing) {
      console.log(`    - ${name}`);
    }
  }

  if (dimReport.feedback.missing.length > 0) {
    hasMissing = true;
    console.log('  MISSING FEEDBACK (no feedback tier):');
    for (const name of dimReport.feedback.missing) {
      console.log(`    - ${name}`);
    }
  }

  if (dimReport.hurtbox.missing.length > 0) {
    hasMissing = true;
    console.log('  MISSING HURTBOX (no HURTBOX_TABLE entry):');
    for (const name of dimReport.hurtbox.missing) {
      console.log(`    - ${name}`);
    }
  }

  if (dimReport.portrait.missing.length > 0) {
    hasMissing = true;
    console.log('  MISSING PORTRAITS:');
    for (const name of dimReport.portrait.missing) {
      console.log(`    - ${name}`);
    }
  }

  if (dimReport.moveList.missing.length > 0) {
    hasMissing = true;
    console.log('  MISSING MOVELIST ENTRIES:');
    for (const name of dimReport.moveList.missing) {
      console.log(`    - ${name}`);
    }
  }

  if (dimReport.visualFrames.missing.length > 0) {
    hasMissing = true;
    console.log('  MISSING VISUAL FRAMES (no dedicated pixel frame set):');
    for (const name of dimReport.visualFrames.missing) {
      console.log(`    - ${name}`);
    }
  }

  if (!hasMissing) {
    console.log('  ALL DIMENSIONS COMPLETE - no missing items.');
  }

  console.log(line);
  console.log('');
}

// ===== Additional: Extended Report =====

/** Extended report that also checks animation manifest data */
export function generateRyoExtendedReport(): RyoCompletenessReport & {
  specialMoves: { key: string; label: string; hasPose: boolean; hasFrameData: boolean }[];
  normalMoves: { key: string; label: string; hasFrameData: boolean; hasAttackFrames: boolean }[];
  portraitSizes: { size: string; exists: boolean; width: number; height: number }[];
} {
  const baseReport = generateRyoReport();
  const ryoDef = ROSTER.find(c => c.id === 'ryo');
  const poses = ryoDef?.poses ?? {};

  const specialMoves = SPECIAL_MOVE_KEYS.map(spec => ({
    key: spec.key,
    label: spec.label,
    hasPose: spec.key in poses,
    hasFrameData: hasFrameDataEntry(spec.key),
  }));

  const normalMoves = NORMAL_MOVE_KEYS.map(norm => ({
    key: norm.key,
    label: norm.label,
    hasFrameData: hasFrameDataEntry(norm.key),
    hasAttackFrames: hasAttackFrameEntry(norm.key),
  }));

  const portraitEntries = PORTRAIT_MANIFEST.portraits['ryo'];
  const sizes = ['select', 'vs', 'hud', 'win'] as const;
  const portraitSizes = sizes.map(size => {
    const entry = portraitEntries?.[size];
    return {
      size,
      exists: entry !== undefined,
      width: entry?.width ?? 0,
      height: entry?.height ?? 0,
    };
  });

  return {
    ...baseReport,
    specialMoves,
    normalMoves,
    portraitSizes,
  };
}

// ===== Auto-run when executed directly via `npx tsx src/tools/ryoCompletenessReport.ts` =====
printRyoReport();
