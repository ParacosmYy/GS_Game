/**
 * Cross-character Frame Contract consistency validator.
 * Checks that ActionContract manifests align with FRAME_DATA, ATTACK_FRAMES,
 * and hitbox/collision data for all 3 characters (Ryo, Kyo, Iori).
 *
 * Run: npx tsx src/tools/validateFrameContract.ts
 */
import { RYO_ACTION_CONTRACTS } from '../core/ryoFrameContract.js';
import { KYO_ACTION_CONTRACTS } from '../core/kyoFrameContract.js';
import { IORI_ACTION_CONTRACTS } from '../core/ioriFrameContract.js';
import { validateActionAlignment, type ActionContract, type AttackType } from '../core/frameContract.js';
import { RYO_FRAME_DATA } from '../content/characters/ryo/frameData/ryoFrameData.js';
import { KYO_FRAME_DATA } from '../content/characters/kyo/frameData/kyoFrameData.js';
import { IORI_FRAME_DATA } from '../content/characters/iori/frameData/ioriFrameData.js';

interface ValidationResult {
  character: string;
  totalActions: number;
  passed: number;
  failed: number;
  issues: string[];
}

function validateCharacter(
  charId: string,
  contracts: Map<string, ActionContract>,
  frameData: Record<string, { startup: number; active: number; recovery: number }>,
): ValidationResult {
  const issues: string[] = [];
  let passed = 0;

  for (const [actionId, contract] of contracts) {
    // Use attackType (e.g., "RYO_TSURIZAO") to match FRAME_DATA keys
    const fdKey = contract.attackType ?? actionId;
    const fd = frameData[fdKey];
    if (!fd) {
      // Not all actions have frame data (idle, walk, etc.) — skip
      continue;
    }

    const result = validateActionAlignment(contract, fd.startup, fd.active, fd.recovery);
    if (result.valid) {
      passed++;
    } else {
      for (const issue of result.issues) {
        issues.push(`[${charId}] ${actionId}: ${issue}`);
      }
    }

    // Additional check: active frames should have collision data
    for (let i = contract.startup; i < contract.startup + contract.active; i++) {
      if (i < contract.frames.length && contract.frames[i].collision === null) {
        issues.push(`[${charId}] ${actionId}: frame ${i} is in active phase but has null collision`);
      }
    }
  }

  return {
    character: charId,
    totalActions: contracts.size,
    passed,
    failed: issues.length,
    issues,
  };
}

export function validateAllContracts(): ValidationResult[] {
  return [
    validateCharacter('ryo', RYO_ACTION_CONTRACTS, RYO_FRAME_DATA),
    validateCharacter('kyo', KYO_ACTION_CONTRACTS, KYO_FRAME_DATA),
    validateCharacter('iori', IORI_ACTION_CONTRACTS, IORI_FRAME_DATA),
  ];
}

// CLI runner
if (typeof require !== 'undefined' && require.main === module) {
  const results = validateAllContracts();
  let totalPassed = 0;
  let totalFailed = 0;
  for (const r of results) {
    console.log(`\n=== ${r.character.toUpperCase()} ===`);
    console.log(`Actions: ${r.totalActions}, Validated: ${r.passed + r.failed}, Passed: ${r.passed}, Failed: ${r.failed}`);
    totalPassed += r.passed;
    totalFailed += r.failed;
    if (r.issues.length > 0) {
      for (const issue of r.issues) {
        console.log(`  ✗ ${issue}`);
      }
    } else {
      console.log('  ✓ All aligned');
    }
  }
  console.log(`\n=== SUMMARY ===`);
  console.log(`Total passed: ${totalPassed}, Total failed: ${totalFailed}`);
  if (totalFailed > 0) process.exit(1);
}
