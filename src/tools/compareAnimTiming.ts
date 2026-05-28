#!/usr/bin/env npx ts-node
/**
 * compareAnimTiming.ts
 *
 * Compares MUGEN animation timing (from hitboxes.json) with game FRAME_DATA.
 * Identifies attacks where the timing differs significantly, helping calibrate
 * the game's hand-tuned values against the original MUGEN data.
 *
 * Output:
 *   - Per-character timing comparison table
 *   - Actions with significant timing drift
 *   - Summary statistics
 *
 * Usage: npx ts-node src/tools/compareAnimTiming.ts [--char <mugenDir>]
 */

import * as fs from 'fs';
import * as path from 'path';

// ===== Types =====

interface HitboxAction {
  name: string;
  startup: number;
  active: number;
  recovery: number;
  frames: any[];
}

interface HitboxData {
  characterId: string;
  actions: Record<string, HitboxAction>;
}

interface AnimFrame {
  group: number;
  index: number;
  duration: number;
  attackBoxes: any[] | null;
}

interface ManifestAnim {
  name: string;
  frames: AnimFrame[];
}

interface Manifest {
  animations: Record<string, ManifestAnim>;
}

interface TimingComparison {
  action: string;
  mugenStartup: number;
  mugenActive: number;
  mugenRecovery: number;
  mugenTotal: number;
  manifestStartup: number;
  manifestActive: number;
  manifestRecovery: number;
  manifestTotal: number;
  startupDiff: number;
  activeDiff: number;
  recoveryDiff: number;
  totalDiff: number;
}

interface CharTimingReport {
  mugenDir: string;
  totalActions: number;
  matchedActions: number;
  comparisons: TimingComparison[];
  significantDrifts: TimingComparison[];
  avgStartupDrift: number;
  avgActiveDrift: number;
  avgRecoveryDrift: number;
}

// ===== MUGEN Action → Attack Type Mapping =====

const ACTION_NAMES: Record<string, string> = {
  '200': 'Stand LP (far)',
  '201': 'Stand LP (close)',
  '210': 'Stand SP (far)',
  '211': 'Stand SP (close)',
  '230': 'Stand LK (far)',
  '231': 'Stand LK (close)',
  '240': 'Stand SK (far)',
  '241': 'Stand SK (close)',
  '300': 'CD Attack',
  '400': 'Crouch LP',
  '410': 'Crouch SP',
  '430': 'Crouch LK',
  '440': 'Crouch SK',
  '600': 'Jump LP',
  '610': 'Jump SP',
  '630': 'Jump LK',
  '640': 'Jump SK',
  '800': 'Throw',
  '1000': 'Special 1',
  '1010': 'Special 1 (strong)',
  '1100': 'Special 2',
  '1110': 'Special 2 (strong)',
  '1200': 'Special 3',
  '1300': 'Special 4',
  '1400': 'Special 5',
  '1500': 'Special 6',
  '2000': 'DM 1',
  '2010': 'SDM 1',
  '2020': 'HSDM 1',
  '3000': 'DM 2',
  '3010': 'SDM 2',
  '3100': 'DM 3',
};

function getActionName(action: string): string {
  return ACTION_NAMES[action] || `Action ${action}`;
}

// ===== Analysis =====

function computeManifestTiming(anim: ManifestAnim): { startup: number; active: number; recovery: number } {
  let startup = 0;
  let active = 0;
  let recovery = 0;
  let phase: 'startup' | 'active' | 'recovery' = 'startup';

  for (const frame of anim.frames) {
    const hasAttack = frame.attackBoxes !== null && frame.attackBoxes.length > 0;

    if (phase === 'startup') {
      if (hasAttack) {
        phase = 'active';
        active += frame.duration;
      } else {
        startup += frame.duration;
      }
    } else if (phase === 'active') {
      if (hasAttack) {
        active += frame.duration;
      } else {
        phase = 'recovery';
        recovery += frame.duration;
      }
    } else {
      recovery += frame.duration;
    }
  }

  return { startup, active, recovery };
}

function analyzeCharacter(mugenDir: string): CharTimingReport {
  const hitboxPath = path.join('public', 'sprites', mugenDir, 'hitboxes.json');
  const manifestPath = path.join('public', 'sprites', mugenDir, 'manifest.json');

  const report: CharTimingReport = {
    mugenDir,
    totalActions: 0,
    matchedActions: 0,
    comparisons: [],
    significantDrifts: [],
    avgStartupDrift: 0,
    avgActiveDrift: 0,
    avgRecoveryDrift: 0,
  };

  const hitboxData: HitboxData | null = fs.existsSync(hitboxPath)
    ? JSON.parse(fs.readFileSync(hitboxPath, 'utf-8'))
    : null;
  const manifest: Manifest | null = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
    : null;

  if (!hitboxData || !manifest) return report;

  report.totalActions = Object.keys(hitboxData.actions).length;

  for (const [actionId, hbAction] of Object.entries(hitboxData.actions)) {
    const anim = manifest.animations[actionId];
    if (!anim) continue;

    report.matchedActions++;

    const manifestTiming = computeManifestTiming(anim);

    const comparison: TimingComparison = {
      action: actionId,
      mugenStartup: hbAction.startup,
      mugenActive: hbAction.active,
      mugenRecovery: hbAction.recovery,
      mugenTotal: hbAction.startup + hbAction.active + hbAction.recovery,
      manifestStartup: manifestTiming.startup,
      manifestActive: manifestTiming.active,
      manifestRecovery: manifestTiming.recovery,
      manifestTotal: manifestTiming.startup + manifestTiming.active + manifestTiming.recovery,
      startupDiff: manifestTiming.startup - hbAction.startup,
      activeDiff: manifestTiming.active - hbAction.active,
      recoveryDiff: manifestTiming.recovery - hbAction.recovery,
      totalDiff: (manifestTiming.startup + manifestTiming.active + manifestTiming.recovery) -
                 (hbAction.startup + hbAction.active + hbAction.recovery),
    };

    report.comparisons.push(comparison);

    // Flag significant drift (>3 ticks difference in any phase)
    if (Math.abs(comparison.startupDiff) > 3 ||
        Math.abs(comparison.activeDiff) > 3 ||
        Math.abs(comparison.recoveryDiff) > 3) {
      report.significantDrifts.push(comparison);
    }
  }

  // Calculate averages
  if (report.comparisons.length > 0) {
    const sum = report.comparisons.reduce((acc, c) => ({
      startup: acc.startup + c.startupDiff,
      active: acc.active + c.activeDiff,
      recovery: acc.recovery + c.recoveryDiff,
    }), { startup: 0, active: 0, recovery: 0 });
    const n = report.comparisons.length;
    report.avgStartupDrift = Math.round(sum.startup / n * 10) / 10;
    report.avgActiveDrift = Math.round(sum.active / n * 10) / 10;
    report.avgRecoveryDrift = Math.round(sum.recovery / n * 10) / 10;
  }

  return report;
}

// ===== Output =====

function formatReport(report: CharTimingReport): string {
  const lines: string[] = [];
  const sep = '─'.repeat(70);

  lines.push('');
  lines.push(`  ${report.mugenDir} — TIMING COMPARISON`);
  lines.push(`  Matched: ${report.matchedActions}/${report.totalActions} actions`);
  lines.push(`  Avg drift: startup=${report.avgStartupDrift} active=${report.avgActiveDrift} recovery=${report.avgRecoveryDrift}`);
  lines.push(sep);
  lines.push(
    '  Action'.padEnd(22) +
    'HB S/A/R'.padStart(12) +
    'MF S/A/R'.padStart(12) +
    'Diff S/A/R'.padStart(14) +
    'Total'.padStart(8)
  );
  lines.push('  ' + '─'.repeat(65));

  for (const c of report.comparisons) {
    const name = getActionName(c.action).padEnd(20);
    const hb = `${c.mugenStartup}/${c.mugenActive}/${c.mugenRecovery}`.padStart(10);
    const mf = `${c.manifestStartup}/${c.manifestActive}/${c.manifestRecovery}`.padStart(10);
    const drift = `${c.startupDiff >= 0 ? '+' : ''}${c.startupDiff}/` +
                  `${c.activeDiff >= 0 ? '+' : ''}${c.activeDiff}/` +
                  `${c.recoveryDiff >= 0 ? '+' : ''}${c.recoveryDiff}`;
    const total = c.totalDiff === 0 ? '=' :
                  `${c.totalDiff >= 0 ? '+' : ''}${c.totalDiff}`;
    const flag = Math.abs(c.startupDiff) > 3 || Math.abs(c.activeDiff) > 3 ? ' !' : '  ';
    lines.push(`  ${name}${hb}${mf}  ${drift.padStart(12)}  ${total.padStart(5)}${flag}`);
  }

  if (report.significantDrifts.length > 0) {
    lines.push('');
    lines.push(`  SIGNIFICANT DRIFTS (${report.significantDrifts.length}):`);
    for (const d of report.significantDrifts) {
      lines.push(`    Action ${d.action} (${getActionName(d.action)}): ` +
        `startup ${d.startupDiff >= 0 ? '+' : ''}${d.startupDiff}, ` +
        `active ${d.activeDiff >= 0 ? '+' : ''}${d.activeDiff}, ` +
        `recovery ${d.recoveryDiff >= 0 ? '+' : ''}${d.recoveryDiff}`);
    }
  }

  return lines.join('\n');
}

// ===== Main =====

function main() {
  const args = process.argv.slice(2);
  const spritesDir = path.join('public', 'sprites');

  let dirs = fs.readdirSync(spritesDir).filter(d =>
    fs.existsSync(path.join(spritesDir, d, 'hitboxes.json')) &&
    fs.existsSync(path.join(spritesDir, d, 'manifest.json'))
  );

  const charIdx = args.indexOf('--char');
  if (charIdx >= 0 && args[charIdx + 1]) {
    dirs = [args[charIdx + 1]];
  }

  console.log(`Comparing animation timing for ${dirs.length} characters...`);

  let totalMatched = 0;
  let totalActions = 0;
  let totalDrifts = 0;

  for (const dir of dirs) {
    const report = analyzeCharacter(dir);
    totalMatched += report.matchedActions;
    totalActions += report.totalActions;
    totalDrifts += report.significantDrifts.length;
    console.log(formatReport(report));
  }

  console.log('');
  console.log(`SUMMARY: ${totalMatched}/${totalActions} actions matched, ${totalDrifts} significant drifts`);
}

main();
