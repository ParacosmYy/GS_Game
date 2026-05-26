/**
 * Manifest Validation Tool
 *
 * Validates the three-way alignment between FRAME_DATA, ATTACK_FRAMES, and
 * FEEDBACK_MANIFEST for a given character. Also checks SPRITE_MANIFEST and
 * HURTBOX_TABLE coverage.
 *
 * Usage: npx tsx src/tools/validateManifest.ts [characterId]
 * Default: ryo
 */

import { FRAME_DATA } from '../core/frameDataConstants.js';
import { ATTACK_FRAMES } from '../core/attackFrames.js';
import { FEEDBACK_MANIFEST, inferTier } from '../core/feedbackManifest.js';
import { SPRITE_MANIFEST } from '../core/spriteManifestData.js';
import { HURTBOX_TABLE } from '../core/hurtboxManifest.js';
import { AttackType, FighterState } from '../core/types.js';

// ===== Ryo required actions =====
const RYO_REQUIRED_ACTIONS = [
  'idle', 'walk_forward', 'walk_backward', 'jump',
  'stand_a', 'stand_c', 'hurt', 'knockdown',
];

// ===== Ryo attack types for frame data alignment =====
const RYO_ATTACK_TYPES: AttackType[] = [
  AttackType.STAND_A, AttackType.STAND_B, AttackType.STAND_C, AttackType.STAND_D,
  AttackType.CLOSE_A, AttackType.CLOSE_B, AttackType.CLOSE_C, AttackType.CLOSE_D,
  AttackType.CROUCH_A, AttackType.CROUCH_B, AttackType.CROUCH_C, AttackType.CROUCH_D,
  AttackType.JUMP_A, AttackType.JUMP_B, AttackType.JUMP_C, AttackType.JUMP_D,
  AttackType.STAND_CD, AttackType.JUMP_CD,
  AttackType.RYO_TSURIZAO, AttackType.RYO_ORISHI,
  AttackType.RYO_KOOU, AttackType.RYO_KOOU_C,
  AttackType.RYO_KO_HOU, AttackType.RYO_KO_HOU_C,
  AttackType.RYO_HIEN, AttackType.RYO_HAOU,
  AttackType.DM_TEN_HA_OU, AttackType.SDM_TEN_HA_OU,
  AttackType.DM_RYUKO_RANBU, AttackType.SDM_RYUKO_RANBU, AttackType.HSDM_RYUKO_RANBU,
];

interface SectionResult {
  total: number;
  pass: number;
  issues: string[];
}

function validateFrameDataAlignment(): SectionResult {
  const result: SectionResult = { total: RYO_ATTACK_TYPES.length, pass: 0, issues: [] };

  for (const at of RYO_ATTACK_TYPES) {
    const key = at as string;
    const fd = (FRAME_DATA as Record<string, { startup: number; active: number; recovery: number }>)[key];
    const af = ATTACK_FRAMES[at];

    if (!fd) {
      result.issues.push(`${key}: missing FRAME_DATA`);
      continue;
    }
    if (!af) {
      result.issues.push(`${key}: missing ATTACK_FRAMES`);
      continue;
    }

    if (af.length !== fd.active) {
      result.issues.push(`${key}: ATTACK_FRAMES length(${af.length}) !== FRAME_DATA.active(${fd.active})`);
    } else {
      result.pass++;
    }
  }

  return result;
}

function validateFeedbackTiers(): SectionResult {
  const result: SectionResult = { total: RYO_ATTACK_TYPES.length, pass: 0, issues: [] };

  for (const at of RYO_ATTACK_TYPES) {
    const explicit = FEEDBACK_MANIFEST.attackTierMap[at];
    if (!explicit) {
      result.issues.push(`${at}: no explicit tier in attackTierMap (falls back to inferTier)`);
    } else {
      result.pass++;
    }
  }

  return result;
}

function validateSpriteManifest(): SectionResult {
  const result: SectionResult = { total: RYO_REQUIRED_ACTIONS.length, pass: 0, issues: [] };
  const char = SPRITE_MANIFEST.characters.ryo;
  if (!char) {
    result.issues.push('ryo: missing from SPRITE_MANIFEST');
    return result;
  }

  const animNames = Object.keys(char.animations);
  for (const action of RYO_REQUIRED_ACTIONS) {
    if (animNames.includes(action)) {
      result.pass++;
    } else {
      result.issues.push(`${action}: missing animation in sprite manifest`);
    }
  }

  return result;
}

function validateHurtboxCoverage(): SectionResult {
  const requiredStates: Array<{ key: string; label: string }> = [
    { key: FighterState.IDLE, label: 'idle' },
    { key: FighterState.WALK, label: 'walk' },
    { key: FighterState.JUMP, label: 'jump' },
    { key: FighterState.STAND_ATTACK, label: 'stand_attack' },
    { key: FighterState.HITSTUN, label: 'hurt' },
    { key: FighterState.KNOCKDOWN, label: 'knockdown' },
    { key: FighterState.CROUCH, label: 'crouch' },
    { key: FighterState.CROUCH_ATTACK, label: 'crouch_attack' },
  ];
  const result: SectionResult = { total: requiredStates.length, pass: 0, issues: [] };

  for (const { key, label } of requiredStates) {
    if (HURTBOX_TABLE[key as keyof typeof HURTBOX_TABLE]) {
      result.pass++;
    } else {
      result.issues.push(`${label}: missing hurtbox entry`);
    }
  }

  return result;
}

function formatSection(name: string, r: SectionResult): string {
  const status = r.issues.length === 0 ? '✅' : '⚠️';
  const line = `${status} ${name}: ${r.pass}/${r.total}`;
  const lines = [line];
  for (const issue of r.issues) {
    lines.push(`   - ${issue}`);
  }
  return lines.join('\n');
}

function main(): void {
  const charId = process.argv[2] ?? 'ryo';
  console.log(`\n${charId.toUpperCase()} Manifest Validation\n`);
  console.log('='.repeat(50));

  const sections: Array<{ name: string; result: SectionResult }> = [];

  if (charId === 'ryo') {
    sections.push({ name: 'frameData ↔ attackFrames', result: validateFrameDataAlignment() });
    sections.push({ name: 'feedback tier mapping', result: validateFeedbackTiers() });
    sections.push({ name: 'sprite manifest', result: validateSpriteManifest() });
    sections.push({ name: 'hurtbox coverage', result: validateHurtboxCoverage() });
  } else {
    console.log(`Validation for "${charId}" not yet implemented.`);
    return;
  }

  for (const s of sections) {
    console.log(formatSection(s.name, s.result));
  }

  const totalIssues = sections.reduce((sum, s) => sum + s.result.issues.length, 0);
  const overall = totalIssues === 0 ? 'PASS' : `ISSUES (${totalIssues})`;
  console.log(`\n${'='.repeat(50)}`);
  console.log(`OVERALL: ${overall}\n`);

  process.exit(totalIssues > 0 ? 1 : 0);
}

main();
