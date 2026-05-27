/**
 * Manifest Validation Tool — Multi-Character
 *
 * Validates content package completeness for all 3 characters (Ryo, Kyo, Iori).
 * Checks: FRAME_DATA, ATTACK_FRAMES, FEEDBACK_MANIFEST, SPRITE_MANIFEST, HURTBOX_TABLE.
 *
 * Usage:
 *   npx tsx src/tools/validateManifest.ts [characterId]
 *   npx tsx src/tools/validateManifest.ts all
 * Default: all
 */

import { FRAME_DATA } from '../core/frameDataConstants.js';
import { ATTACK_FRAMES } from '../core/attackFrames.js';
import { FEEDBACK_MANIFEST, inferTier } from '../core/feedbackManifest.js';
import { SPRITE_MANIFEST } from '../core/spriteManifestData.js';
import { HURTBOX_TABLE } from '../core/hurtboxManifest.js';
import { AttackType, FighterState } from '../core/types.js';
import { hasKyoHighResFrame } from '../rendering/sprites/kyo/kyoHighResRender.js';
import { hasIoriHighResFrame } from '../rendering/sprites/iori/ioriHighResRender.js';
import { hasHighResFrame } from '../rendering/sprites/ryo/ryoHighResRender.js';
import { getRegisteredEffectIds } from '../content/characterHitEffects.js';
import { initCharacterHitEffects } from '../content/registerHitEffects.js';

// ===== Required actions per character =====
const REQUIRED_ACTIONS: Record<string, string[]> = {
  ryo: [
    'idle', 'walk_forward', 'walk_backward',
    'jump_up', 'jump_forward', 'jump_backward',
    'stand_a', 'stand_c',
    'hurt_standing', 'hurt_crouching',
    'knockdown',
  ],
  kyo: [
    'idle', 'walk_forward', 'walk_backward',
    'jump_up', 'jump_forward', 'jump_backward',
    'stand_a', 'stand_c',
    'hurt_standing', 'hurt_crouching',
    'knockdown',
  ],
  iori: [
    'idle', 'walk_forward', 'walk_backward',
    'jump_up', 'jump_forward', 'jump_backward',
    'stand_a', 'stand_c',
    'hurt_standing', 'hurt_crouching',
    'knockdown',
  ],
};

// ===== Attack types per character =====
const CHARACTER_ATTACKS: Record<string, AttackType[]> = {
  ryo: [
    AttackType.STAND_A, AttackType.STAND_B, AttackType.STAND_C, AttackType.STAND_D,
    AttackType.CLOSE_A, AttackType.CLOSE_B, AttackType.CLOSE_C, AttackType.CLOSE_D,
    AttackType.CROUCH_A, AttackType.CROUCH_B, AttackType.CROUCH_C, AttackType.CROUCH_D,
    AttackType.JUMP_A, AttackType.JUMP_B, AttackType.JUMP_C, AttackType.JUMP_D,
    AttackType.STAND_CD, AttackType.JUMP_CD,
    AttackType.RYO_KOOU, AttackType.RYO_KOOU_C,
    AttackType.RYO_KO_HOU, AttackType.RYO_KO_HOU_C,
    AttackType.RYO_KOOUKEN_D, AttackType.RYO_HIO_HACKER, AttackType.RYO_ZANRETSU_KEN,
    AttackType.DM_TEN_HA_OU, AttackType.SDM_TEN_HA_OU,
    AttackType.DM_RYUKO_RANBU, AttackType.SDM_RYUKO_RANBU, AttackType.HSDM_RYUKO_RANBU,
  ],
  kyo: [
    AttackType.STAND_A, AttackType.STAND_B, AttackType.STAND_C, AttackType.STAND_D,
    AttackType.CLOSE_A, AttackType.CLOSE_B, AttackType.CLOSE_C, AttackType.CLOSE_D,
    AttackType.CROUCH_A, AttackType.CROUCH_B, AttackType.CROUCH_C, AttackType.CROUCH_D,
    AttackType.JUMP_A, AttackType.JUMP_B, AttackType.JUMP_C, AttackType.JUMP_D,
    AttackType.STAND_CD, AttackType.JUMP_CD,
    AttackType.KYO_75KAI, AttackType.KYO_75KAI_2,
    AttackType.KYO_RED_KICK,
    AttackType.KYO_ONIYAKI, AttackType.KYO_ONIYAKI_C,
    AttackType.KYO_YAMIBARAI, AttackType.KYO_YAMIBARAI_C,
    AttackType.KYO_ARAGAMI, AttackType.KYO_ARAGAMI_KONOKIZU,
    AttackType.KYO_ARAGAMI_YANOSABI,
    AttackType.KYO_NANASE, AttackType.KYO_KOTO_TSUKI, AttackType.KYO_YAKISOGI,
    AttackType.KYO_DOKUGAMI, AttackType.KYO_TSUMIYOMI, AttackType.KYO_BATSUYOMI,
    AttackType.DM_OROCHINAGI, AttackType.SDM_OROCHINAGI, AttackType.HSDM_OROCHINAGI,
  ],
  iori: [
    AttackType.STAND_A, AttackType.STAND_B, AttackType.STAND_C, AttackType.STAND_D,
    AttackType.CLOSE_A, AttackType.CLOSE_B, AttackType.CLOSE_C, AttackType.CLOSE_D,
    AttackType.CROUCH_A, AttackType.CROUCH_B, AttackType.CROUCH_C, AttackType.CROUCH_D,
    AttackType.JUMP_A, AttackType.JUMP_B, AttackType.JUMP_C, AttackType.JUMP_D,
    AttackType.STAND_CD, AttackType.JUMP_CD,
    AttackType.IORI_YUMEYUMI, AttackType.IORI_KATANUGI, AttackType.IORI_YUKIWARUI,
    AttackType.IORI_YAMIBARAI, AttackType.IORI_YAMIBARAI_C,
    AttackType.IORI_ONIYAKI, AttackType.IORI_ONIYAKI_C,
    AttackType.IORI_KOTOTSUKI, AttackType.IORI_KOTOTSUKI_D,
    AttackType.IORI_KUZUKAZE,
    AttackType.IORI_AOIHANA, AttackType.IORI_AOIHANA_2, AttackType.IORI_AOIHANA_3,
    AttackType.IORI_AOIHANA_C, AttackType.IORI_AOIHANA_C_2, AttackType.IORI_AOIHANA_C_3,
    AttackType.DM_YATAGARASU, AttackType.SDM_YATAGARASU, AttackType.HSDM_YAOTOME,
  ],
};

// Projectile move patterns (skip ATTACK_FRAMES length check)
const PROJECTILE_PATTERNS = [
  'KOOU', 'YAMIBARAI', 'POWER_WAVE', 'PROJECTILE', 'MOON_SLASH',
  'KA_CHO_SEN', 'PSYCHO_BALL', 'HISHOU_KEN', 'SANSETSU', 'HURRICANE',
];

export interface SectionResult {
  total: number;
  pass: number;
  issues: string[];
}

export interface CharacterReport {
  charId: string;
  sections: Array<{ name: string; result: SectionResult }>;
}

function validateFrameDataAlignment(charId: string): SectionResult {
  const attacks = CHARACTER_ATTACKS[charId] ?? [];
  const result: SectionResult = { total: attacks.length, pass: 0, issues: [] };
  const fd = FRAME_DATA as Record<string, { startup: number; active: number; recovery: number }>;

  for (const at of attacks) {
    const key = at as string;
    const frameData = fd[key];
    const attackFrames = ATTACK_FRAMES[at];

    if (!frameData) {
      result.issues.push(`${key}: missing FRAME_DATA`);
      continue;
    }
    if (!attackFrames) {
      result.issues.push(`${key}: missing ATTACK_FRAMES`);
      continue;
    }

    const isProjectile = PROJECTILE_PATTERNS.some(p => key.includes(p));
    if (attackFrames.length !== frameData.active && !isProjectile) {
      result.issues.push(`${key}: ATTACK_FRAMES length(${attackFrames.length}) !== FRAME_DATA.active(${frameData.active})`);
    } else {
      result.pass++;
    }
  }

  return result;
}

function validateFeedbackTiers(charId: string): SectionResult {
  const attacks = CHARACTER_ATTACKS[charId] ?? [];
  const result: SectionResult = { total: attacks.length, pass: 0, issues: [] };

  for (const at of attacks) {
    const explicit = FEEDBACK_MANIFEST.attackTierMap[at];
    if (!explicit) {
      result.issues.push(`${at}: no explicit tier in attackTierMap (falls back to inferTier)`);
    } else {
      result.pass++;
    }
  }

  return result;
}

function validateSpriteManifest(charId: string): SectionResult {
  const required = REQUIRED_ACTIONS[charId] ?? [];
  const result: SectionResult = { total: required.length, pass: 0, issues: [] };
  const char = SPRITE_MANIFEST.characters[charId];

  if (!char) {
    result.issues.push(`${charId}: missing from SPRITE_MANIFEST`);
    return result;
  }

  const animNames = Object.keys(char.animations);
  for (const action of required) {
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
  const status = r.issues.length === 0 ? 'OK' : '!!';
  const line = `  ${status} ${name}: ${r.pass}/${r.total}`;
  const lines = [line];
  for (const issue of r.issues) {
    lines.push(`     - ${issue}`);
  }
  return lines.join('\n');
}

function validateHitEffectsRegistration(charId: string): SectionResult {
  const registered = getRegisteredEffectIds();
  const result: SectionResult = { total: 1, pass: 0, issues: [] };
  if (registered.includes(charId)) {
    result.pass++;
  } else {
    result.issues.push(`${charId} has no CharacterHitEffects plugin registered`);
  }
  return result;
}

// Command normal high-res frame resolution checks
const CMD_NORMAL_CHECKS: Record<string, Array<{ attack: AttackType; state: FighterState }>> = {
  ryo: [
    { attack: AttackType.RYO_TSURIZAO, state: FighterState.STAND_ATTACK },
    { attack: AttackType.RYO_ORISHI, state: FighterState.STAND_ATTACK },
  ],
  kyo: [
    { attack: AttackType.CMD_GOFU_YOU, state: FighterState.STAND_ATTACK },
    { attack: AttackType.CMD_88SHIKI, state: FighterState.STAND_ATTACK },
    { attack: AttackType.CMD_NARAKU, state: FighterState.AIR_ATTACK },
  ],
  iori: [
    { attack: AttackType.IORI_YUMEYUMI, state: FighterState.STAND_ATTACK },
    { attack: AttackType.IORI_KATANUGI, state: FighterState.STAND_ATTACK },
    { attack: AttackType.IORI_YUKIWARUI, state: FighterState.STAND_ATTACK },
  ],
};

function validateCommandNormalFrames(charId: string): SectionResult {
  const checks = CMD_NORMAL_CHECKS[charId] ?? [];
  const result: SectionResult = { total: checks.length, pass: 0, issues: [] };

  for (const { attack, state } of checks) {
    let resolved = false;
    if (charId === 'kyo') resolved = hasKyoHighResFrame(state, attack, 0, 1);
    else if (charId === 'iori') resolved = hasIoriHighResFrame(state, attack, 0, 1);
    else if (charId === 'ryo') resolved = hasHighResFrame(charId, state, attack, 0, 1);

    if (resolved) {
      result.pass++;
    } else {
      result.issues.push(`${attack}: no high-res frame registered for state ${state}`);
    }
  }

  return result;
}

// Register hit effects so we can validate them
initCharacterHitEffects();

export function validateCharacter(charId: string): CharacterReport {
  const sections: Array<{ name: string; result: SectionResult }> = [
    { name: 'frameData <-> attackFrames', result: validateFrameDataAlignment(charId) },
    { name: 'feedback tier mapping', result: validateFeedbackTiers(charId) },
    { name: 'sprite manifest', result: validateSpriteManifest(charId) },
    { name: 'hit effects registration', result: validateHitEffectsRegistration(charId) },
    { name: 'command normal high-res frames', result: validateCommandNormalFrames(charId) },
  ];

  // Hurtbox coverage is global, only include once
  if (charId === 'ryo') {
    sections.push({ name: 'hurtbox coverage (global)', result: validateHurtboxCoverage() });
  }

  return { charId, sections };
}

declare const process: { argv: string[]; exit(code: number): never };

function main(): void {
  const arg = process.argv[2] ?? 'all';
  const charIds = arg === 'all' ? ['ryo', 'kyo', 'iori'] : [arg];

  console.log(`\nContent Completeness Report`);
  console.log(`${'='.repeat(60)}`);

  let totalIssues = 0;

  for (const charId of charIds) {
    if (!CHARACTER_ATTACKS[charId]) {
      console.log(`\n[${charId.toUpperCase()}] Unknown character — skipping`);
      continue;
    }

    const report = validateCharacter(charId);
    const charIssues = report.sections.reduce((sum, s) => sum + s.result.issues.length, 0);
    totalIssues += charIssues;

    const statusIcon = charIssues === 0 ? 'PASS' : 'WARN';
    console.log(`\n[${charId.toUpperCase()}] ${statusIcon} — ${report.sections.reduce((s, sec) => s + sec.result.pass, 0)}/${report.sections.reduce((s, sec) => s + sec.result.total, 0)} checks passed`);

    for (const s of report.sections) {
      console.log(formatSection(s.name, s.result));
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  const overall = totalIssues === 0 ? 'ALL PASS' : `${totalIssues} ISSUES`;
  console.log(`OVERALL: ${overall}\n`);

  process.exit(totalIssues > 0 ? 1 : 0);
}

// Only run main when executed directly as a script (not imported by tests)
const entryFile = process.argv[1];
if (entryFile && entryFile.includes('validateManifest')) {
  main();
}
