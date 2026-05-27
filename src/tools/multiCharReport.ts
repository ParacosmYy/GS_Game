/**
 * Multi-Character Completeness Report
 *
 * Checks pixel frame coverage for Ryo, Kyo, and Iori by querying
 * each character's resolveFrameKey function against all FighterStates
 * and common AttackTypes. Reports coverage as a unified table.
 *
 * Run: npx tsx src/tools/multiCharReport.ts
 */

import { FighterState, AttackType } from '../core/types.js';
import { hasHighResFrame as hasRyoFrame } from '../rendering/sprites/ryo/ryoHighResRender.js';
import { hasKyoHighResFrame } from '../rendering/sprites/kyo/kyoHighResRender.js';
import { hasIoriHighResFrame } from '../rendering/sprites/iori/ioriHighResRender.js';

// ===== Character Check Functions =====

type CharCheckFn = (
  state: FighterState,
  attack: AttackType | null,
  vx: number,
  facing: number,
) => boolean;

interface CharSpec {
  id: string;
  name: string;
  check: CharCheckFn;
}

const CHARACTERS: CharSpec[] = [
  { id: 'ryo', name: 'Ryo', check: (s, a, v, f) => hasRyoFrame('ryo', s, a, v, f) },
  { id: 'kyo', name: 'Kyo', check: hasKyoHighResFrame },
  { id: 'iori', name: 'Iori', check: hasIoriHighResFrame },
];

// ===== State Checks =====

interface CheckSpec {
  label: string;
  state: FighterState;
  attack: AttackType | null;
  vx: number;
  facing: number;
}

const STATE_CHECKS: CheckSpec[] = [
  // Basic states (no attack)
  { label: 'IDLE', state: FighterState.IDLE, attack: null, vx: 0, facing: 1 },
  { label: 'WALK_FWD', state: FighterState.WALK, attack: null, vx: 1, facing: 1 },
  { label: 'WALK_BACK', state: FighterState.WALK, attack: null, vx: -1, facing: 1 },
  { label: 'RUN', state: FighterState.RUN, attack: null, vx: 0, facing: 1 },
  { label: 'BACKDASH', state: FighterState.BACKDASH, attack: null, vx: 0, facing: 1 },
  { label: 'ROLL', state: FighterState.ROLL, attack: null, vx: 0, facing: 1 },
  { label: 'BACK_ROLL', state: FighterState.BACK_ROLL, attack: null, vx: 0, facing: 1 },
  { label: 'JUMP', state: FighterState.JUMP, attack: null, vx: 0, facing: 1 },
  { label: 'CROUCH', state: FighterState.CROUCH, attack: null, vx: 0, facing: 1 },
  { label: 'BLOCK', state: FighterState.BLOCK, attack: null, vx: 0, facing: 1 },
  { label: 'AIR_BLOCK', state: FighterState.AIR_BLOCK, attack: null, vx: 0, facing: 1 },
  { label: 'HITSTUN', state: FighterState.HITSTUN, attack: null, vx: 0, facing: 1 },
  { label: 'KNOCKDOWN', state: FighterState.KNOCKDOWN, attack: null, vx: 0, facing: 1 },
  { label: 'GETUP', state: FighterState.GETUP, attack: null, vx: 0, facing: 1 },
  { label: 'DIZZY', state: FighterState.DIZZY, attack: null, vx: 0, facing: 1 },
  { label: 'THROW', state: FighterState.THROW, attack: null, vx: 0, facing: 1 },
  { label: 'GUARD_CRUSH', state: FighterState.GUARD_CRUSH, attack: null, vx: 0, facing: 1 },
  { label: 'MAX_MODE', state: FighterState.MAX_MODE, attack: null, vx: 0, facing: 1 },
  { label: 'TAUNT', state: FighterState.TAUNT, attack: null, vx: 0, facing: 1 },
  { label: 'COUNTER_STANCE', state: FighterState.COUNTER_STANCE, attack: null, vx: 0, facing: 1 },

  // Stand attacks
  { label: 'STAND_A', state: FighterState.STAND_ATTACK, attack: AttackType.STAND_A, vx: 0, facing: 1 },
  { label: 'STAND_B', state: FighterState.STAND_ATTACK, attack: AttackType.STAND_B, vx: 0, facing: 1 },
  { label: 'STAND_C', state: FighterState.STAND_ATTACK, attack: AttackType.STAND_C, vx: 0, facing: 1 },
  { label: 'STAND_D', state: FighterState.STAND_ATTACK, attack: AttackType.STAND_D, vx: 0, facing: 1 },
  { label: 'CLOSE_A', state: FighterState.STAND_ATTACK, attack: AttackType.CLOSE_A, vx: 0, facing: 1 },
  { label: 'CLOSE_B', state: FighterState.STAND_ATTACK, attack: AttackType.CLOSE_B, vx: 0, facing: 1 },
  { label: 'CLOSE_C', state: FighterState.STAND_ATTACK, attack: AttackType.CLOSE_C, vx: 0, facing: 1 },
  { label: 'CLOSE_D', state: FighterState.STAND_ATTACK, attack: AttackType.CLOSE_D, vx: 0, facing: 1 },

  // Crouch attacks
  { label: 'CROUCH_A', state: FighterState.CROUCH_ATTACK, attack: AttackType.CROUCH_A, vx: 0, facing: 1 },
  { label: 'CROUCH_B', state: FighterState.CROUCH_ATTACK, attack: AttackType.CROUCH_B, vx: 0, facing: 1 },
  { label: 'CROUCH_C', state: FighterState.CROUCH_ATTACK, attack: AttackType.CROUCH_C, vx: 0, facing: 1 },
  { label: 'CROUCH_D', state: FighterState.CROUCH_ATTACK, attack: AttackType.CROUCH_D, vx: 0, facing: 1 },

  // Air attacks
  { label: 'AIR_A', state: FighterState.AIR_ATTACK, attack: AttackType.JUMP_A, vx: 0, facing: 1 },
  { label: 'AIR_C', state: FighterState.AIR_ATTACK, attack: AttackType.JUMP_C, vx: 0, facing: 1 },
  { label: 'AIR_D', state: FighterState.AIR_ATTACK, attack: AttackType.JUMP_D, vx: 0, facing: 1 },
];

// ===== Report Generation =====

function generateReport(): void {
  const line = '='.repeat(70);
  const dash = '-'.repeat(70);

  console.log('');
  console.log(line);
  console.log('  MULTI-CHARACTER PIXEL FRAME COVERAGE REPORT');
  console.log(line);

  // Header
  const nameCol = 18;
  const charCols = CHARACTERS.map(c => c.name.padEnd(8));
  const header = `  ${'State'.padEnd(nameCol)} ${charCols.join(' ')}`;
  console.log(header);
  console.log('  ' + '-'.repeat(nameCol + 1 + CHARACTERS.length * 9));

  // Results per state
  const totals = CHARACTERS.map(() => 0);
  let total = 0;

  for (const spec of STATE_CHECKS) {
    const label = spec.label.padEnd(nameCol);
    const results = CHARACTERS.map((char, i) => {
      const has = char.check(spec.state, spec.attack, spec.vx, spec.facing);
      if (has) totals[i]++;
      return has ? '  OK  ' : 'MISS ';
    });
    total++;
    console.log(`  ${label} ${results.join(' ')}`);
  }

  console.log('  ' + '-'.repeat(nameCol + 1 + CHARACTERS.length * 9));

  // Totals
  const totalLabel = `${total}/${total}`.padEnd(nameCol);
  const totalResults = CHARACTERS.map((_, i) => {
    return `${totals[i]}/${total}`.padEnd(8);
  });
  console.log(`  ${totalLabel} ${totalResults.join(' ')}`);

  console.log(dash);

  // Percentage
  const pctLabel = 'Coverage'.padEnd(nameCol);
  const pctResults = CHARACTERS.map((_, i) => {
    const pct = Math.round((totals[i] / total) * 100);
    return `${pct}%`.padEnd(8);
  });
  console.log(`  ${pctLabel} ${pctResults.join(' ')}`);

  // Missing items per character
  console.log(dash);
  for (let ci = 0; ci < CHARACTERS.length; ci++) {
    const char = CHARACTERS[ci];
    const missing: string[] = [];
    for (const spec of STATE_CHECKS) {
      if (!char.check(spec.state, spec.attack, spec.vx, spec.facing)) {
        missing.push(spec.label);
      }
    }
    if (missing.length > 0) {
      console.log(`  ${char.name} MISSING (${missing.length}):`);
      for (const m of missing) {
        console.log(`    - ${m}`);
      }
    } else {
      console.log(`  ${char.name}: ALL COVERED (${total}/${total})`);
    }
  }

  console.log(line);
  console.log('');
}

// ===== Run =====
generateReport();
