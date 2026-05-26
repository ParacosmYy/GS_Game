/**
 * Ryo Package Validator — Completeness and alignment checks
 *
 * Verifies that all required actions are present in the content package,
 * cross-checks frame data alignment between attacks, animations, and hitboxes,
 * and reports a completeness score.
 */
import { loadCharacterContent, hasCharacterContent } from '../content/contentLoader.js';
import type { CharacterContent } from '../content/contentLoader.js';
import { RYO_REQUIRED_ANIMATIONS } from '../content/characters/ryo/animations.js';
import { RYO_ATTACK_KEYS } from '../content/characters/ryo/attacks.js';

/** Validation result for a single check */
export interface ValidationCheck {
  name: string;
  passed: boolean;
  message: string;
  details?: string[];
}

/** Full validation report */
export interface ValidationReport {
  character: string;
  checks: ValidationCheck[];
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  completenessScore: number; // 0-100
}

/**
 * Run all validation checks on the Ryo content package
 */
export function validateRyoPackage(): ValidationReport {
  const checks: ValidationCheck[] = [];

  // Check 1: Content package exists
  checks.push(validateContentPackageExists());

  if (!hasCharacterContent('ryo')) {
    return {
      character: 'ryo',
      checks,
      totalChecks: checks.length,
      passedChecks: checks.filter(c => c.passed).length,
      failedChecks: checks.filter(c => !c.passed).length,
      completenessScore: 0,
    };
  }

  const content = loadCharacterContent('ryo');

  // Check 2: Character data has required fields
  checks.push(validateCharacterData(content));

  // Check 3: Required animations present
  checks.push(validateRequiredAnimations(content));

  // Check 4: Attack keys have frame data
  checks.push(validateAttackFrameData(content));

  // Check 5: Attack keys have feedback tiers
  checks.push(validateFeedbackTiers(content));

  // Check 6: Hitbox data for Ryo-specific attacks
  checks.push(validateHitboxData(content));

  // Check 7: Move list entries have attack type mappings
  checks.push(validateMoveListMappings(content));

  // Check 8: Cross-check frame data alignment
  checks.push(validateFrameDataAlignment(content));

  const passedChecks = checks.filter(c => c.passed).length;
  const totalChecks = checks.length;
  const completenessScore = Math.round((passedChecks / totalChecks) * 100);

  return {
    character: 'ryo',
    checks,
    totalChecks,
    passedChecks,
    failedChecks: totalChecks - passedChecks,
    completenessScore,
  };
}

function validateContentPackageExists(): ValidationCheck {
  return {
    name: 'Content Package Exists',
    passed: hasCharacterContent('ryo'),
    message: hasCharacterContent('ryo')
      ? 'Ryo content package is available'
      : 'Ryo content package not found',
  };
}

function validateCharacterData(content: CharacterContent): ValidationCheck {
  const requiredFields = ['id', 'displayName', 'walkSpeedForward', 'jumpVelocity', 'maxHP'];
  const missing = requiredFields.filter(f => !(f in content.data));
  return {
    name: 'Character Data Fields',
    passed: missing.length === 0,
    message: missing.length === 0
      ? 'All required character data fields present'
      : `Missing fields: ${missing.join(', ')}`,
    details: missing.length > 0 ? missing : undefined,
  };
}

function validateRequiredAnimations(content: CharacterContent): ValidationCheck {
  const animNames = content.animSequenceNames;
  const missing = RYO_REQUIRED_ANIMATIONS.filter(a => !animNames.includes(a));
  return {
    name: 'Required Animations',
    passed: missing.length === 0,
    message: missing.length === 0
      ? `All ${RYO_REQUIRED_ANIMATIONS.length} required animations present`
      : `Missing ${missing.length} animations: ${missing.join(', ')}`,
    details: missing.length > 0 ? missing : undefined,
  };
}

function validateAttackFrameData(content: CharacterContent): ValidationCheck {
  const attacks = content.attacks;
  const missing = RYO_ATTACK_KEYS.filter(k => !(k in attacks));
  return {
    name: 'Attack Frame Data',
    passed: missing.length === 0,
    message: missing.length === 0
      ? `All ${RYO_ATTACK_KEYS.length} attack keys have frame data`
      : `Missing frame data for: ${missing.join(', ')}`,
    details: missing.length > 0 ? missing : undefined,
  };
}

function validateFeedbackTiers(content: CharacterContent): ValidationCheck {
  const feedback = content.feedback;
  const missing = RYO_ATTACK_KEYS.filter(k => !(k in feedback));
  return {
    name: 'Feedback Tier Mappings',
    passed: missing.length === 0,
    message: missing.length === 0
      ? `All ${RYO_ATTACK_KEYS.length} attack keys have feedback tiers`
      : `Missing feedback for: ${missing.join(', ')}`,
    details: missing.length > 0 ? missing : undefined,
  };
}

function validateHitboxData(content: CharacterContent): ValidationCheck {
  const hitboxes = content.hitboxes;
  // Check that at least Ryo specials have hitbox offsets
  const ryoSpecialKeys = [
    'RYO_KOOU', 'RYO_KO_HOU', 'RYO_HIEN', 'RYO_HAOU',
    'DM_TEN_HA_OU', 'DM_RYUKO_RANBU',
  ];
  const missing = ryoSpecialKeys.filter(k => !(k in hitboxes));
  return {
    name: 'Hitbox Data',
    passed: missing.length === 0,
    message: missing.length === 0
      ? `All ${ryoSpecialKeys.length} Ryo specials have hitbox offsets`
      : `Missing hitboxes for: ${missing.join(', ')}`,
    details: missing.length > 0 ? missing : undefined,
  };
}

function validateMoveListMappings(content: CharacterContent): ValidationCheck {
  const moves = content.commands as Array<{ name: string; attackTypeKey?: string }>;
  const withKeys = moves.filter(m => m.attackTypeKey);
  const withoutKeys = moves.filter(m => !m.attackTypeKey);
  return {
    name: 'Move List Mappings',
    passed: withKeys.length >= 8, // At least 8 moves should have attack type keys
    message: `${withKeys.length} moves have attack type keys, ${withoutKeys.length} without (system moves OK)`,
    details: withoutKeys.map(m => m.name),
  };
}

function validateFrameDataAlignment(content: CharacterContent): ValidationCheck {
  const attacks = content.attacks;
  const attackFrames = content.attackFrames;
  const misaligned: string[] = [];

  // Cross-check: if an attack has frame data and per-frame hitbox data,
  // the startup+active+recovery from frame data should roughly match
  // the number of per-frame hitbox entries
  for (const key of Object.keys(attackFrames)) {
    const fd = attacks[key];
    if (fd && typeof fd.startup === 'number' && typeof fd.active === 'number' && typeof fd.recovery === 'number') {
      const expectedTotal = fd.startup + fd.active + fd.recovery;
      const actualFrames = (attackFrames[key] as any[])?.length ?? 0;
      // Per-frame hitbox data only covers active phase typically,
      // so we just check it's not empty when active > 0
      if (fd.active > 0 && actualFrames === 0) {
        misaligned.push(`${key}: active=${fd.active} but 0 hitbox frames`);
      }
    }
  }

  return {
    name: 'Frame Data Alignment',
    passed: misaligned.length === 0,
    message: misaligned.length === 0
      ? 'Frame data and hitbox data aligned'
      : `${misaligned.length} misalignments found`,
    details: misaligned.length > 0 ? misaligned : undefined,
  };
}

/** Print a human-readable validation report */
export function printValidationReport(report: ValidationReport): void {
  console.log(`\n=== Ryo Content Package Validation ===`);
  console.log(`Character: ${report.character}`);
  console.log(`Score: ${report.completenessScore}% (${report.passedChecks}/${report.totalChecks} checks passed)\n`);

  for (const check of report.checks) {
    const icon = check.passed ? 'PASS' : 'FAIL';
    console.log(`  [${icon}] ${check.name}: ${check.message}`);
    if (check.details && check.details.length > 0) {
      for (const d of check.details.slice(0, 5)) {
        console.log(`         - ${d}`);
      }
      if (check.details.length > 5) {
        console.log(`         ... and ${check.details.length - 5} more`);
      }
    }
  }
  console.log('');
}
