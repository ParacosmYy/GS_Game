#!/usr/bin/env npx ts-node
/**
 * characterCompletenessReport.ts
 *
 * Comprehensive completeness report for ALL characters with MUGEN assets.
 * Validates sprites, animations, hitboxes, and cross-references with game data.
 *
 * Usage: npx ts-node src/tools/characterCompletenessReport.ts [--char <mugenDir>]
 */

import * as fs from 'fs';
import * as path from 'path';

// ===== Types =====

interface ManifestSprite {
  group: number;
  index: number;
  file: string;
  width: number;
  height: number;
}

interface ManifestFrame {
  group: number;
  index: number;
  offsetX: number;
  offsetY: number;
  duration: number;
  flipH: boolean;
  hurtboxes: Array<{ left: number; top: number; right: number; bottom: number }> | null;
  attackBoxes: Array<{ left: number; top: number; right: number; bottom: number }> | null;
}

interface ManifestAnim {
  name: string;
  loopStart: number;
  frames: ManifestFrame[];
}

interface Manifest {
  characterId: string;
  sprites: Record<string, ManifestSprite>;
  animations: Record<string, ManifestAnim>;
  stateMap?: Record<string, string>;
}

interface HitboxAction {
  name: string;
  startup: number;
  active: number;
  recovery: number;
  frames: Array<{
    attack: Array<{ ox: number; oy: number; w: number; h: number }>;
    bodyOverride: { ox: number; oy: number; w: number; h: number } | null;
  }>;
}

interface HitboxData {
  characterId: string;
  actions: Record<string, HitboxAction>;
}

interface CharReport {
  mugenDir: string;
  spriteCount: number;
  animCount: number;
  stateMapCount: number;
  hasHitboxes: boolean;
  hitboxActionCount: number;
  requiredActions: RequiredActionCheck[];
  frameQuality: FrameQualityReport;
  hitboxCoverage: HitboxCoverageReport;
  score: number;
  issues: string[];
}

interface RequiredActionCheck {
  action: string;
  name: string;
  present: boolean;
  frameCount: number;
  hasAttackBoxes: boolean;
}

interface FrameQualityReport {
  totalFrames: number;
  blankFrames: number;
  zeroDurationFrames: number;
  avgDuration: number;
  framesWithHurtboxes: number;
  framesWithAttackBoxes: number;
}

interface HitboxCoverageReport {
  totalActions: number;
  actionsWithAttack: number;
  totalActiveFrames: number;
  avgStartup: number;
  avgActive: number;
  avgRecovery: number;
  multiBoxActions: number;
  singleBoxActions: number;
}

// ===== Required Actions (MUGEN standard) =====

const REQUIRED_ACTIONS: Array<{ action: string; name: string }> = [
  { action: '0', name: 'Stand/Idle' },
  { action: '20', name: 'Walk Forward' },
  { action: '21', name: 'Walk Backward' },
  { action: '11', name: 'Crouch' },
  { action: '42', name: 'Jump Forward' },
  { action: '43', name: 'Jump Back' },
  { action: '100', name: 'Run/Dash' },
  { action: '200', name: 'Stand Light Punch (far)' },
  { action: '201', name: 'Stand Light Punch (close)' },
  { action: '210', name: 'Stand Strong Punch (far)' },
  { action: '211', name: 'Stand Strong Punch (close)' },
  { action: '230', name: 'Stand Light Kick (far)' },
  { action: '231', name: 'Stand Light Kick (close)' },
  { action: '240', name: 'Stand Strong Kick (far)' },
  { action: '241', name: 'Stand Strong Kick (close)' },
  { action: '400', name: 'Crouch Light Punch' },
  { action: '410', name: 'Crouch Strong Punch' },
  { action: '430', name: 'Crouch Light Kick' },
  { action: '440', name: 'Crouch Strong Kick' },
  { action: '600', name: 'Jump Light Punch' },
  { action: '610', name: 'Jump Strong Punch' },
  { action: '630', name: 'Jump Light Kick' },
  { action: '640', name: 'Jump Strong Kick' },
  { action: '5000', name: 'Hitstun (high)' },
  { action: '5010', name: 'Hitstun (low)' },
  { action: '5050', name: 'Knockdown' },
  { action: '120', name: 'Guard/Block' },
  { action: '181', name: 'Win Pose' },
  { action: '800', name: 'Throw' },
];

// ===== Analysis Functions =====

function loadManifest(mugenDir: string): Manifest | null {
  const filePath = path.join('public', 'sprites', mugenDir, 'manifest.json');
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function loadHitboxData(mugenDir: string): HitboxData | null {
  const filePath = path.join('public', 'sprites', mugenDir, 'hitboxes.json');
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function checkRequiredActions(manifest: Manifest): RequiredActionCheck[] {
  return REQUIRED_ACTIONS.map(req => {
    const anim = manifest.animations[req.action];
    let hasAttack = false;
    let frameCount = 0;
    if (anim) {
      frameCount = anim.frames.length;
      hasAttack = anim.frames.some(f => f.attackBoxes !== null && f.attackBoxes.length > 0);
    }
    return {
      action: req.action,
      name: req.name,
      present: !!anim,
      frameCount,
      hasAttackBoxes: hasAttack,
    };
  });
}

function analyzeFrameQuality(manifest: Manifest): FrameQualityReport {
  let totalFrames = 0;
  let blankFrames = 0;
  let zeroDurationFrames = 0;
  let totalDuration = 0;
  let framesWithHurtboxes = 0;
  let framesWithAttackBoxes = 0;

  for (const anim of Object.values(manifest.animations)) {
    for (const frame of anim.frames) {
      totalFrames++;
      if (frame.group === -1) blankFrames++;
      if (frame.duration === 0) zeroDurationFrames++;
      totalDuration += frame.duration;
      if (frame.hurtboxes && frame.hurtboxes.length > 0) framesWithHurtboxes++;
      if (frame.attackBoxes && frame.attackBoxes.length > 0) framesWithAttackBoxes++;
    }
  }

  return {
    totalFrames,
    blankFrames,
    zeroDurationFrames,
    avgDuration: totalFrames > 0 ? Math.round(totalDuration / totalFrames) : 0,
    framesWithHurtboxes,
    framesWithAttackBoxes,
  };
}

function analyzeHitboxCoverage(hitboxData: HitboxData | null): HitboxCoverageReport {
  if (!hitboxData) {
    return {
      totalActions: 0, actionsWithAttack: 0, totalActiveFrames: 0,
      avgStartup: 0, avgActive: 0, avgRecovery: 0,
      multiBoxActions: 0, singleBoxActions: 0,
    };
  }

  const actions = Object.values(hitboxData.actions);
  const actionsWithAttack = actions.length;
  let totalActiveFrames = 0;
  let totalStartup = 0;
  let totalActive = 0;
  let totalRecovery = 0;
  let multiBox = 0;
  let singleBox = 0;

  for (const action of actions) {
    totalActiveFrames += action.frames.length;
    totalStartup += action.startup;
    totalActive += action.active;
    totalRecovery += action.recovery;
    const hasMulti = action.frames.some(f => f.attack.length > 1);
    if (hasMulti) multiBox++;
    else singleBox++;
  }

  return {
    totalActions: Object.keys(hitboxData.actions).length,
    actionsWithAttack,
    totalActiveFrames,
    avgStartup: actionsWithAttack > 0 ? Math.round(totalStartup / actionsWithAttack * 10) / 10 : 0,
    avgActive: actionsWithAttack > 0 ? Math.round(totalActive / actionsWithAttack * 10) / 10 : 0,
    avgRecovery: actionsWithAttack > 0 ? Math.round(totalRecovery / actionsWithAttack * 10) / 10 : 0,
    multiBoxActions: multiBox,
    singleBoxActions: singleBox,
  };
}

function computeScore(report: CharReport): number {
  let score = 0;
  // Required actions (max 29 points)
  const presentActions = report.requiredActions.filter(a => a.present).length;
  score += presentActions;
  // Has hitboxes (max 5 points)
  if (report.hasHitboxes) score += 5;
  // Frame quality bonus (max 10 points)
  if (report.frameQuality.zeroDurationFrames === 0) score += 5;
  if (report.frameQuality.framesWithHurtboxes > 0) score += 5;
  // Hitbox coverage bonus (max 10 points)
  score += Math.min(10, Math.floor(report.hitboxCoverage.totalActiveFrames / 10));
  return Math.min(54, score);
}

function generateReport(mugenDir: string): CharReport {
  const manifest = loadManifest(mugenDir);
  if (!manifest) {
    return {
      mugenDir,
      spriteCount: 0, animCount: 0, stateMapCount: 0,
      hasHitboxes: false, hitboxActionCount: 0,
      requiredActions: [], frameQuality: {
        totalFrames: 0, blankFrames: 0, zeroDurationFrames: 0,
        avgDuration: 0, framesWithHurtboxes: 0, framesWithAttackBoxes: 0,
      },
      hitboxCoverage: {
        totalActions: 0, actionsWithAttack: 0, totalActiveFrames: 0,
        avgStartup: 0, avgActive: 0, avgRecovery: 0,
        multiBoxActions: 0, singleBoxActions: 0,
      },
      score: 0,
      issues: ['No manifest.json found'],
    };
  }

  const hitboxData = loadHitboxData(mugenDir);
  const issues: string[] = [];

  const spriteCount = Object.keys(manifest.sprites).length;
  const animCount = Object.keys(manifest.animations).length;
  const stateMapCount = manifest.stateMap ? Object.keys(manifest.stateMap).length : 0;

  const requiredActions = checkRequiredActions(manifest);
  const missingRequired = requiredActions.filter(a => !a.present);
  if (missingRequired.length > 0) {
    issues.push(`Missing ${missingRequired.length} required actions: ${missingRequired.map(a => a.name).join(', ')}`);
  }

  const frameQuality = analyzeFrameQuality(manifest);
  if (frameQuality.zeroDurationFrames > 0) {
    issues.push(`${frameQuality.zeroDurationFrames} frames with zero duration`);
  }

  const hitboxCoverage = analyzeHitboxCoverage(hitboxData);

  const report: CharReport = {
    mugenDir,
    spriteCount,
    animCount,
    stateMapCount,
    hasHitboxes: !!hitboxData,
    hitboxActionCount: hitboxData ? Object.keys(hitboxData.actions).length : 0,
    requiredActions,
    frameQuality,
    hitboxCoverage,
    score: 0,
    issues,
  };

  report.score = computeScore(report);
  return report;
}

// ===== Output Formatting =====

function formatReport(report: CharReport): string {
  const lines: string[] = [];
  const sep = '='.repeat(60);

  lines.push(sep);
  lines.push(`  CHARACTER REPORT: ${report.mugenDir}`);
  lines.push(`  Score: ${report.score}/54`);
  lines.push(sep);

  // Asset overview
  lines.push('');
  lines.push('  ASSET OVERVIEW');
  lines.push('  ─'.repeat(25));
  lines.push(`  Sprites:       ${report.spriteCount}`);
  lines.push(`  Animations:    ${report.animCount}`);
  lines.push(`  State mappings: ${report.stateMapCount}`);
  lines.push(`  Hitbox actions: ${report.hasHitboxes ? report.hitboxActionCount : 'N/A'}`);

  // Required actions
  lines.push('');
  lines.push('  REQUIRED ACTIONS');
  lines.push('  ─'.repeat(25));
  const present = report.requiredActions.filter(a => a.present).length;
  const total = report.requiredActions.length;
  lines.push(`  Coverage: ${present}/${total} (${Math.round(present / total * 100)}%)`);
  for (const check of report.requiredActions) {
    const icon = check.present ? '+' : 'X';
    const extra = check.hasAttackBoxes ? ' [ATK]' : '';
    const frames = check.present ? ` (${check.frameCount}f)` : '';
    lines.push(`  [${icon}] Action ${check.action.padStart(4)}: ${check.name}${frames}${extra}`);
  }

  // Frame quality
  lines.push('');
  lines.push('  FRAME QUALITY');
  lines.push('  ─'.repeat(25));
  lines.push(`  Total frames:       ${report.frameQuality.totalFrames}`);
  lines.push(`  Blank frames:       ${report.frameQuality.blankFrames}`);
  lines.push(`  Zero-duration:      ${report.frameQuality.zeroDurationFrames}`);
  lines.push(`  Avg duration:       ${report.frameQuality.avgDuration} ticks`);
  lines.push(`  Frames w/ hurtbox:  ${report.frameQuality.framesWithHurtboxes}`);
  lines.push(`  Frames w/ attack:   ${report.frameQuality.framesWithAttackBoxes}`);

  // Hitbox coverage
  if (report.hasHitboxes) {
    lines.push('');
    lines.push('  HITBOX COVERAGE');
    lines.push('  ─'.repeat(25));
    lines.push(`  Attack actions:     ${report.hitboxCoverage.actionsWithAttack}`);
    lines.push(`  Active frames:      ${report.hitboxCoverage.totalActiveFrames}`);
    lines.push(`  Avg startup:        ${report.hitboxCoverage.avgStartup}f`);
    lines.push(`  Avg active:         ${report.hitboxCoverage.avgActive}f`);
    lines.push(`  Avg recovery:       ${report.hitboxCoverage.avgRecovery}f`);
    lines.push(`  Multi-box actions:  ${report.hitboxCoverage.multiBoxActions}`);
    lines.push(`  Single-box actions: ${report.hitboxCoverage.singleBoxActions}`);
  }

  // Issues
  if (report.issues.length > 0) {
    lines.push('');
    lines.push('  ISSUES');
    lines.push('  ─'.repeat(25));
    for (const issue of report.issues) {
      lines.push(`  ! ${issue}`);
    }
  }

  return lines.join('\n');
}

// ===== Summary Table =====

function formatSummaryTable(reports: CharReport[]): string {
  const lines: string[] = [];
  lines.push('');
  lines.push('═'.repeat(100));
  lines.push('  SUMMARY TABLE — ALL CHARACTERS');
  lines.push('═'.repeat(100));
  lines.push('');
  lines.push(
    '  '.padEnd(16) +
    'Sprites'.padStart(8) +
    'Anims'.padStart(6) +
    'States'.padStart(7) +
    'HB Act'.padStart(7) +
    'ReqAct'.padStart(7) +
    'Quality'.padStart(9) +
    'Score'.padStart(7)
  );
  lines.push('  ' + '─'.repeat(55));

  for (const r of reports.sort((a, b) => b.score - a.score)) {
    const present = r.requiredActions.filter(a => a.present).length;
    const qualityTag = r.frameQuality.zeroDurationFrames === 0 ? 'GOOD' : `${r.frameQuality.zeroDurationFrames} zero-dur`;
    lines.push(
      '  ' + r.mugenDir.padEnd(14) +
      String(r.spriteCount).padStart(8) +
      String(r.animCount).padStart(6) +
      String(r.stateMapCount).padStart(7) +
      (r.hasHitboxes ? String(r.hitboxActionCount).padStart(7) : '   N/A') +
      `${present}/${REQUIRED_ACTIONS.length}`.padStart(7) +
      qualityTag.padStart(9) +
      String(r.score).padStart(7)
    );
  }

  // Totals
  const totalSprites = reports.reduce((s, r) => s + r.spriteCount, 0);
  const totalAnims = reports.reduce((s, r) => s + r.animCount, 0);
  const totalHBActions = reports.filter(r => r.hasHitboxes).reduce((s, r) => s + r.hitboxActionCount, 0);
  const avgScore = Math.round(reports.reduce((s, r) => s + r.score, 0) / reports.length * 10) / 10;

  lines.push('  ' + '─'.repeat(55));
  lines.push(
    '  TOTALS'.padEnd(16) +
    String(totalSprites).padStart(8) +
    String(totalAnims).padStart(6) +
    ''.padStart(7) +
    String(totalHBActions).padStart(7) +
    ''.padStart(7) +
    ''.padStart(9) +
    String(avgScore).padStart(7)
  );
  lines.push('');

  return lines.join('\n');
}

// ===== Main =====

function main() {
  const args = process.argv.slice(2);
  const spritesDir = path.join('public', 'sprites');

  // Find all character directories with manifest.json
  const charDirs = fs.readdirSync(spritesDir).filter(dir => {
    return fs.existsSync(path.join(spritesDir, dir, 'manifest.json'));
  });

  let targetDirs = charDirs;
  const charIdx = args.indexOf('--char');
  if (charIdx >= 0 && args[charIdx + 1]) {
    targetDirs = [args[charIdx + 1]];
  }

  const reports: CharReport[] = [];

  for (const dir of targetDirs) {
    const report = generateReport(dir);
    reports.push(report);
    console.log(formatReport(report));
    console.log('');
  }

  if (reports.length > 1) {
    console.log(formatSummaryTable(reports));
  }

  // Exit code based on coverage
  const avgScore = reports.reduce((s, r) => s + r.score, 0) / reports.length;
  if (avgScore < 30) {
    console.log(`\n  OVERALL: Average score ${avgScore.toFixed(1)}/54 — BELOW THRESHOLD`);
    process.exit(1);
  } else {
    console.log(`\n  OVERALL: Average score ${avgScore.toFixed(1)}/54 — PASSING`);
  }
}

main();
