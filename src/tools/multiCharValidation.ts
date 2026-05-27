/**
 * Multi-Character Validation Summary
 *
 * Runs Ryo/Kyo/Iori completeness reports and prints a consolidated
 * summary with per-character scores and overall project health.
 */

import { generateRyoDimensionReport } from './ryoCompletenessReport.js';
import { generateKyoDimensionReport } from './kyoCompletenessReport.js';
import { generateIoriDimensionReport } from './ioriCompletenessReport.js';
import { validateRyoPackage } from './validateRyoPackage.js';

function progressBar(pct: number, width: number = 20): string {
  const filled = Math.round((pct / 100) * width);
  const empty = width - filled;
  return `[${'#'.repeat(filled)}${'-'.repeat(empty)}]`;
}

function dimIcon(pct: number): string {
  if (pct >= 100) return 'OK';
  if (pct >= 80) return '~~';
  return '!!';
}

interface CharSummary {
  charId: string;
  overallScore: number;
  dimensions: { name: string; pct: number; passed: number; total: number }[];
  missingCount: number;
}

function collectKyo(): CharSummary {
  const r = generateKyoDimensionReport();
  const dims = [
    { name: 'Animation Meta', pct: r.animationMeta.pct, passed: r.animationMeta.passed, total: r.animationMeta.total },
    { name: 'Frame Data', pct: r.frameData.pct, passed: r.frameData.passed, total: r.frameData.total },
    { name: 'Attack Frames', pct: r.attackFrames.pct, passed: r.attackFrames.passed, total: r.attackFrames.total },
    { name: 'Feedback', pct: r.feedback.pct, passed: r.feedback.passed, total: r.feedback.total },
    { name: 'Portrait', pct: r.portrait.pct, passed: r.portrait.passed, total: r.portrait.total },
    { name: 'MoveList', pct: r.moveList.pct, passed: r.moveList.passed, total: r.moveList.total },
    { name: 'Cancel Paths', pct: r.cancelPaths.pct, passed: r.cancelPaths.passed, total: r.cancelPaths.total },
    { name: 'Hit Effects', pct: r.hitEffects.pct, passed: r.hitEffects.passed, total: r.hitEffects.total },
  ];
  return {
    charId: 'kyo',
    overallScore: r.overallScore,
    dimensions: dims,
    missingCount: dims.reduce((s, d) => s + (d.total - d.passed), 0),
  };
}

function collectIori(): CharSummary {
  const r = generateIoriDimensionReport();
  const dims = [
    { name: 'Animation Meta', pct: r.animationMeta.pct, passed: r.animationMeta.passed, total: r.animationMeta.total },
    { name: 'Frame Data', pct: r.frameData.pct, passed: r.frameData.passed, total: r.frameData.total },
    { name: 'Attack Frames', pct: r.attackFrames.pct, passed: r.attackFrames.passed, total: r.attackFrames.total },
    { name: 'Feedback', pct: r.feedback.pct, passed: r.feedback.passed, total: r.feedback.total },
    { name: 'Portrait', pct: r.portrait.pct, passed: r.portrait.passed, total: r.portrait.total },
    { name: 'MoveList', pct: r.moveList.pct, passed: r.moveList.passed, total: r.moveList.total },
    { name: 'Cancel Paths', pct: r.cancelPaths.pct, passed: r.cancelPaths.passed, total: r.cancelPaths.total },
    { name: 'Hit Effects', pct: r.hitEffects.pct, passed: r.hitEffects.passed, total: r.hitEffects.total },
  ];
  return {
    charId: 'iori',
    overallScore: r.overallScore,
    dimensions: dims,
    missingCount: dims.reduce((s, d) => s + (d.total - d.passed), 0),
  };
}

function collectRyo(): CharSummary {
  const r = generateRyoDimensionReport();
  const dims = [
    { name: 'Action Frames', pct: r.actionFrames.pct, passed: r.actionFrames.passed, total: r.actionFrames.total },
    { name: 'Attack Frames', pct: r.attackFrames.pct, passed: r.attackFrames.passed, total: r.attackFrames.total },
    { name: 'Feedback', pct: r.feedback.pct, passed: r.feedback.passed, total: r.feedback.total },
    { name: 'Hurtbox', pct: r.hurtbox.pct, passed: r.hurtbox.passed, total: r.hurtbox.total },
    { name: 'Portrait', pct: r.portrait.pct, passed: r.portrait.passed, total: r.portrait.total },
    { name: 'MoveList', pct: r.moveList.pct, passed: r.moveList.passed, total: r.moveList.total },
    { name: 'Visual Frames', pct: r.visualFrames.pct, passed: r.visualFrames.passed, total: r.visualFrames.total },
  ];
  return {
    charId: 'ryo',
    overallScore: r.overallScore,
    dimensions: dims,
    missingCount: dims.reduce((s, d) => s + (d.total - d.passed), 0),
  };
}

export function printMultiCharSummary(): void {
  const line = '='.repeat(60);
  const dash = '-'.repeat(60);

  const characters = [collectRyo(), collectKyo(), collectIori()];

  console.log('');
  console.log(line);
  console.log('  MULTI-CHARACTER VALIDATION SUMMARY');
  console.log(line);

  for (const char of characters) {
    const icon = dimIcon(char.overallScore);
    console.log(`  ${char.charId.toUpperCase().padEnd(6)} ${progressBar(char.overallScore)} ${char.overallScore}% [${icon}]`);
    for (const dim of char.dimensions) {
      const di = dimIcon(dim.pct);
      const pctStr = `${dim.pct}%`.padStart(4);
      console.log(`    ${dim.name.padEnd(16)} ${pctStr} (${dim.passed}/${dim.total}) [${di}]`);
    }
    if (char.missingCount > 0) {
      console.log(`    Missing items: ${char.missingCount}`);
    }
    console.log('');
  }

  // Project health
  const avgScore = Math.round(
    characters.reduce((s, c) => s + c.overallScore, 0) / characters.length,
  );
  const totalMissing = characters.reduce((s, c) => s + c.missingCount, 0);

  console.log(dash);
  console.log(`  PROJECT HEALTH: ${progressBar(avgScore)} ${avgScore}%`);
  console.log(`  Total missing items across all characters: ${totalMissing}`);

  // Ryo package validation
  const ryoVal = validateRyoPackage();
  console.log(`  Ryo package validation: ${ryoVal.passedChecks}/${ryoVal.totalChecks} checks passed (${ryoVal.completenessScore}%)`);

  console.log(line);
  console.log('');
}

// Auto-run
printMultiCharSummary();
