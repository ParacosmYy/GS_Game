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
 *   - Special move pose data
 *
 * Reads from ROSTER (src/characters/index.ts), FRAME_DATA
 * (src/core/constants.ts), and PORTRAIT_MANIFEST (src/core/portraitManifest.ts).
 * Prints a formatted report to console and returns the structured report object.
 */

import { ROSTER } from '../characters/index.js';
import { FRAME_DATA } from '../core/constants.js';
import { PORTRAIT_MANIFEST } from '../core/portraitManifest.js';
import type { Pose, PoseSet } from '../characters/types.js';
import { FighterState, AttackType } from '../core/types.js';

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
}

const MINIMUM_ACTIONS: ActionSpec[] = [
  {
    label: 'idle',
    poseKeys: [FighterState.IDLE],
    minFrames: 4,
    frameDataKeys: [],
    requiresPhaseAlignment: false,
  },
  {
    label: 'walk_forward',
    poseKeys: [FighterState.WALK],
    minFrames: 4,
    frameDataKeys: [],
    requiresPhaseAlignment: false,
  },
  {
    label: 'walk_backward',
    poseKeys: [FighterState.WALK], // WALK covers both directions in current system
    minFrames: 4,
    frameDataKeys: [],
    requiresPhaseAlignment: false,
  },
  {
    label: 'jump',
    poseKeys: [FighterState.JUMP],
    minFrames: 2,
    frameDataKeys: [],
    requiresPhaseAlignment: false,
  },
  {
    label: 'stand_a',
    poseKeys: [FighterState.STAND_ATTACK],
    minFrames: 3, // at least startup + active + recovery frames
    frameDataKeys: [AttackType.STAND_A],
    requiresPhaseAlignment: true,
  },
  {
    label: 'stand_c',
    poseKeys: [FighterState.STAND_ATTACK],
    minFrames: 3,
    frameDataKeys: [AttackType.STAND_C],
    requiresPhaseAlignment: true,
  },
  {
    label: 'hurt',
    poseKeys: [FighterState.HITSTUN],
    minFrames: 3,
    frameDataKeys: [],
    requiresPhaseAlignment: false,
  },
  {
    label: 'knockdown',
    poseKeys: [FighterState.KNOCKDOWN],
    minFrames: 3,
    frameDataKeys: [],
    requiresPhaseAlignment: false,
  },
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

export function printRyoReport(): void {
  const report = generateRyoReport();

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

  // Special moves section
  console.log('  SPECIAL MOVES:');
  for (const spec of SPECIAL_MOVE_KEYS) {
    const inFrameData = hasFrameDataEntry(spec.key);
    const inPoses = spec.key in (ROSTER.find(c => c.id === 'ryo')?.poses ?? {});
    let status = '';
    if (inFrameData && inPoses) {
      status = '[OK] pose + frame data';
    } else if (inFrameData) {
      status = '[~~] frame data only (no pose)';
    } else if (inPoses) {
      status = '[~~] pose only (no frame data)';
    } else {
      status = '[!!] MISSING';
    }
    console.log(`    ${spec.label.padEnd(28)} ${status}`);
  }

  // Missing actions summary
  if (report.missingActions.length > 0) {
    console.log(dash);
    console.log('  MISSING ACTIONS (no pose data at all):');
    for (const name of report.missingActions) {
      console.log(`    - ${name}`);
    }
  }

  console.log(line);
  console.log('');
}

// ===== Additional: Extended Report =====

/** Extended report that also checks animation manifest data */
export function generateRyoExtendedReport(): RyoCompletenessReport & {
  specialMoves: { key: string; label: string; hasPose: boolean; hasFrameData: boolean }[];
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
    portraitSizes,
  };
}
