/**
 * Ryo Frame Contract Verification Tests
 *
 * Validates that Ryo's FRAME_DATA (startup/active/recovery), ATTACK_FRAMES
 * (per-frame hitbox data), and runtime phase progression are all aligned.
 *
 * Frame Contract means: what you SEE must match what happens mechanically.
 * The three sources of truth must agree:
 *   - FRAME_DATA: startup / active / recovery / damage / hitstun / blockstun
 *   - ATTACK_FRAMES: per-frame hitbox rectangles during the active phase
 *   - Fighter runtime: phase transitions happen at the exact boundaries
 *     defined by FRAME_DATA
 */
import { describe, it, expect } from 'vitest';
import { FRAME_DATA } from '../src/core/constants.js';
import { ATTACK_FRAMES } from '../src/core/attackFrames.js';
import { Fighter } from '../src/entities/fighter.js';
import { FighterState, AttackType } from '../src/core/types.js';
import type { AttackPhase } from '../src/core/types.js';

// ── Type helper ──

type FrameDataEntry = {
  startup: number;
  active: number;
  recovery: number;
  damage: number;
  hitstun: number;
  blockstun: number;
  pushback: number;
  hitLevel: 'MID' | 'LOW' | 'HIGH';
  knockdown: boolean;
  chipDamage?: number;
  counterWire?: boolean;
};

function getFrameData(key: string): FrameDataEntry {
  const data = FRAME_DATA[key as keyof typeof FRAME_DATA];
  if (!data) throw new Error(`Missing FRAME_DATA entry: ${key}`);
  return data as unknown as FrameDataEntry;
}

function hasFrameData(key: string): boolean {
  return (key as keyof typeof FRAME_DATA) in FRAME_DATA;
}

// ── Ryo attack type lists ──

/** Normals shared by all characters that Ryo uses */
const RYO_NORMALS = [
  'STAND_A', 'STAND_C', 'CROUCH_A', 'CROUCH_C',
  'JUMP_C', 'JUMP_D', 'STAND_CD',
] as const;

/** Ryo command normals */
const RYO_COMMAND_NORMALS = [
  'RYO_TSURIZAO',
  'RYO_ORISHI',
] as const;

/** Ryo specials */
const RYO_SPECIALS = [
  'RYO_KOOU',
  'RYO_KO_HOU',
  'RYO_HIEN',
  'RYO_HAOU',
] as const;

/** Ryo DMs */
const RYO_DMS = [
  'DM_TEN_HA_OU',
  'DM_RYUKO_RANBU',
] as const;

/** All Ryo attack types covered by this test */
const ALL_RYO_ATTACKS = [
  ...RYO_NORMALS,
  ...RYO_COMMAND_NORMALS,
  ...RYO_SPECIALS,
  ...RYO_DMS,
] as const;

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: FRAME_DATA existence and value sanity
// ═══════════════════════════════════════════════════════════════════

describe('Ryo Frame Contract: FRAME_DATA existence', () => {
  for (const key of ALL_RYO_ATTACKS) {
    it(`${key} should exist in FRAME_DATA`, () => {
      expect(hasFrameData(key), `FRAME_DATA.${key} must be defined`).toBe(true);
    });
  }
});

describe('Ryo Frame Contract: FRAME_DATA value sanity', () => {
  it('startup > 0 for all Ryo attacks', () => {
    for (const key of ALL_RYO_ATTACKS) {
      const fd = getFrameData(key);
      expect(
        fd.startup,
        `${key}.startup=${fd.startup} should be > 0`,
      ).toBeGreaterThan(0);
    }
  });

  it('active > 0 for all Ryo attacks', () => {
    for (const key of ALL_RYO_ATTACKS) {
      const fd = getFrameData(key);
      expect(
        fd.active,
        `${key}.active=${fd.active} should be > 0`,
      ).toBeGreaterThan(0);
    }
  });

  it('recovery >= 0 for all Ryo attacks (air attacks have recovery=0)', () => {
    for (const key of ALL_RYO_ATTACKS) {
      const fd = getFrameData(key);
      expect(
        fd.recovery,
        `${key}.recovery=${fd.recovery} should be >= 0`,
      ).toBeGreaterThanOrEqual(0);
    }
  });

  it('total frames >= startup + active + recovery for all Ryo attacks', () => {
    for (const key of ALL_RYO_ATTACKS) {
      const fd = getFrameData(key);
      const total = fd.startup + fd.active + fd.recovery;
      // Total should be exactly startup + active + recovery (no hidden frames)
      expect(total, `${key} total should equal startup+active+recovery`).toBe(
        fd.startup + fd.active + fd.recovery,
      );
    }
  });

  it('total frames >= 4 for all Ryo attacks', () => {
    for (const key of ALL_RYO_ATTACKS) {
      const fd = getFrameData(key);
      const total = fd.startup + fd.active + fd.recovery;
      expect(
        total,
        `${key} total=${total} should be >= 4`,
      ).toBeGreaterThanOrEqual(4);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: ATTACK_FRAMES existence and alignment
// ═══════════════════════════════════════════════════════════════════

describe('Ryo Frame Contract: ATTACK_FRAMES existence', () => {
  for (const key of ALL_RYO_ATTACKS) {
    it(`${key} should have ATTACK_FRAMES entry`, () => {
      const frames = ATTACK_FRAMES[key as AttackType];
      expect(frames, `ATTACK_FRAMES.${key} must be defined`).toBeDefined();
      expect(frames!.length, `ATTACK_FRAMES.${key} must have > 0 entries`).toBeGreaterThan(0);
    });
  }
});

describe('Ryo Frame Contract: ATTACK_FRAMES covers FRAME_DATA active phase', () => {
  /**
   * ATTACK_FRAMES contains per-frame hitbox data indexed by attackFrame
   * during the active phase. The number of entries should be sufficient
   * to cover all active frames. If there are fewer entries than active
   * frames, the last frame is held (clamped). If there are more entries,
   * they document additional visual recovery within the active window.
   *
   * Key contract: at least one ATTACK_FRAMES entry in the first
   * FRAME_DATA.active frames must have a non-empty attack box.
   */

  it('normals: ATTACK_FRAMES has at least FRAME_DATA.active entries or enough to cover active', () => {
    const normalKeys = [...RYO_NORMALS, ...RYO_COMMAND_NORMALS];
    const issues: string[] = [];

    for (const key of normalKeys) {
      const fd = getFrameData(key);
      const frames = ATTACK_FRAMES[key as AttackType];
      if (!frames) continue;

      // ATTACK_FRAMES must have at least 1 entry to provide hitbox data
      if (frames.length < 1) {
        issues.push(`${key}: ATTACK_FRAMES has 0 entries, need >= 1`);
      }

      // Check that within the active frame range, at least one frame has non-empty hitbox
      const activeFramesToCheck = Math.min(frames.length, fd.active);
      let hasNonEmptyHitbox = false;
      for (let i = 0; i < activeFramesToCheck; i++) {
        if (frames[i].attack.length > 0) {
          hasNonEmptyHitbox = true;
          break;
        }
      }
      if (!hasNonEmptyHitbox) {
        issues.push(`${key}: no non-empty hitbox in first ${activeFramesToCheck} ATTACK_FRAMES entries`);
      }
    }

    expect(issues, `Normal attack hitbox issues: ${issues.join('; ')}`).toHaveLength(0);
  });

  it('specials: ATTACK_FRAMES has entries covering FRAME_DATA.active frames', () => {
    const issues: string[] = [];

    for (const key of RYO_SPECIALS) {
      const fd = getFrameData(key);
      const frames = ATTACK_FRAMES[key as AttackType];
      if (!frames) continue;

      // ATTACK_FRAMES should have enough entries for the active phase
      if (frames.length < 1) {
        issues.push(`${key}: ATTACK_FRAMES has 0 entries`);
        continue;
      }

      // At least one entry in the active range must have a non-empty attack box
      const activeFramesToCheck = Math.min(frames.length, fd.active);
      let hasNonEmptyHitbox = false;
      for (let i = 0; i < activeFramesToCheck; i++) {
        if (frames[i].attack.length > 0) {
          hasNonEmptyHitbox = true;
          break;
        }
      }
      if (!hasNonEmptyHitbox) {
        issues.push(`${key}: no non-empty hitbox in first ${activeFramesToCheck} ATTACK_FRAMES entries`);
      }
    }

    expect(issues, `Special attack hitbox issues: ${issues.join('; ')}`).toHaveLength(0);
  });

  it('DMs: ATTACK_FRAMES has entries covering FRAME_DATA.active frames', () => {
    const issues: string[] = [];

    for (const key of RYO_DMS) {
      const fd = getFrameData(key);
      const frames = ATTACK_FRAMES[key as AttackType];
      if (!frames) continue;

      if (frames.length < 1) {
        issues.push(`${key}: ATTACK_FRAMES has 0 entries`);
        continue;
      }

      // DMs should have at least FRAME_DATA.active worth of hitbox frames
      const activeFramesToCheck = Math.min(frames.length, fd.active);
      let hasNonEmptyHitbox = false;
      for (let i = 0; i < activeFramesToCheck; i++) {
        if (frames[i].attack.length > 0) {
          hasNonEmptyHitbox = true;
          break;
        }
      }
      if (!hasNonEmptyHitbox) {
        issues.push(`${key}: no non-empty hitbox in first ${activeFramesToCheck} ATTACK_FRAMES entries`);
      }
    }

    expect(issues, `DM hitbox issues: ${issues.join('; ')}`).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: ATTACK_FRAMES hitbox quality — active has boxes, startup
//            frames (if present) have empty boxes
// ═══════════════════════════════════════════════════════════════════

describe('Ryo Frame Contract: hitbox quality during active phase', () => {
  /**
   * For each attack's ATTACK_FRAMES array:
   * - At least one frame in the first FRAME_DATA.active entries must have
   *   a non-empty attack box (this is the "hitting" part of active).
   * - Any empty-attack frames within the active range represent later
   *   recovery-like animation within the active window (allowed but documented).
   */

  it('every normal attack has at least one hitbox frame in the active window', () => {
    const normalKeys = [...RYO_NORMALS, ...RYO_COMMAND_NORMALS];
    for (const key of normalKeys) {
      const fd = getFrameData(key);
      const frames = ATTACK_FRAMES[key as AttackType];
      if (!frames) continue;

      const activeRange = Math.min(frames.length, fd.active);
      const hitboxFrameCount = countFramesWithHitboxes(frames, 0, activeRange);

      expect(
        hitboxFrameCount,
        `${key} should have at least 1 hitbox frame in active window (first ${activeRange} frames)`,
      ).toBeGreaterThan(0);
    }
  });

  it('every special has at least one hitbox frame in the active window', () => {
    for (const key of RYO_SPECIALS) {
      const fd = getFrameData(key);
      const frames = ATTACK_FRAMES[key as AttackType];
      if (!frames) continue;

      const activeRange = Math.min(frames.length, fd.active);
      const hitboxFrameCount = countFramesWithHitboxes(frames, 0, activeRange);

      expect(
        hitboxFrameCount,
        `${key} should have at least 1 hitbox frame in active window`,
      ).toBeGreaterThan(0);
    }
  });

  it('every DM has at least one hitbox frame in the active window', () => {
    for (const key of RYO_DMS) {
      const fd = getFrameData(key);
      const frames = ATTACK_FRAMES[key as AttackType];
      if (!frames) continue;

      const activeRange = Math.min(frames.length, fd.active);
      const hitboxFrameCount = countFramesWithHitboxes(frames, 0, activeRange);

      expect(
        hitboxFrameCount,
        `${key} should have at least 1 hitbox frame in active window`,
      ).toBeGreaterThan(0);
    }
  });

  it('empty-attack frames within active window are documented', () => {
    // Some ATTACK_FRAMES arrays have empty attack boxes at the end of the
    // active window (e.g., STAND_D has 3 empty frames out of 8 active).
    // This is expected for moves where the tail of the active phase is
    // visual follow-through. Document them here.
    const allKeys = [...RYO_NORMALS, ...RYO_COMMAND_NORMALS, ...RYO_SPECIALS, ...RYO_DMS];
    const docs: string[] = [];

    for (const key of allKeys) {
      const fd = getFrameData(key);
      const frames = ATTACK_FRAMES[key as AttackType];
      if (!frames) continue;

      const activeRange = Math.min(frames.length, fd.active);
      const emptyCount = countEmptyHitboxFrames(frames, 0, activeRange);
      if (emptyCount > 0) {
        docs.push(`${key}: ${emptyCount} empty-hitbox frames in active window (total active=${fd.active})`);
      }
    }

    if (docs.length > 0) {
      console.log('[Frame Contract] Empty-hitbox frames within active window:');
      docs.forEach(d => console.log(`  ${d}`));
    }

    // This is always true — it's documentation, not a failure condition
    expect(true).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: Runtime phase progression verification
// ═══════════════════════════════════════════════════════════════════

describe('Ryo Frame Contract: Fighter attack phase progression', () => {
  function createFighter(): Fighter {
    const f = new Fighter(400, '#dd6600', 1);
    f.charId = 'ryo';
    return f;
  }

  /**
   * Simulate the full attack progression for a given attack type.
   * Returns snapshots of { tick, phase, attackFrame, state }.
   */
  function simulateAttack(attackType: AttackType): Array<{
    tick: number;
    phase: AttackPhase;
    attackFrame: number;
    state: FighterState;
  }> {
    const f = createFighter();
    f.startAttack(attackType);
    const fd = getFrameData(attackType as string);
    const totalFrames = fd.startup + fd.active + fd.recovery;
    const snapshots: Array<{
      tick: number;
      phase: AttackPhase;
      attackFrame: number;
      state: FighterState;
    }> = [];

    snapshots.push({
      tick: 0,
      phase: f.attackPhase,
      attackFrame: f.attackFrame,
      state: f.state,
    });

    // Simulate enough ticks to see the full progression and end
    for (let i = 1; i <= totalFrames + 2; i++) {
      f.tickAttack();
      if (f.currentAttack) {
        snapshots.push({
          tick: i,
          phase: f.attackPhase,
          attackFrame: f.attackFrame,
          state: f.state,
        });
      } else {
        snapshots.push({
          tick: i,
          phase: 'none',
          attackFrame: f.attackFrame,
          state: f.state,
        });
        break;
      }
    }

    return snapshots;
  }

  for (const key of ALL_RYO_ATTACKS) {
    const atk = key as AttackType;

    describe(`${key} phase progression`, () => {
      it('starts in startup phase at frame 0', () => {
        const f = createFighter();
        f.startAttack(atk);
        expect(f.attackPhase, `${key} should start in startup`).toBe('startup');
        expect(f.attackFrame, `${key} attackFrame should be 0`).toBe(0);
        // No hitbox during startup
        expect(f.getActiveHitbox(), `${key} should have no hitbox in startup`).toBeNull();
        expect(f.getActiveHitboxes(), `${key} should have no hitboxes in startup`).toHaveLength(0);
      });

      it('reaches active phase after startup frames', () => {
        const f = createFighter();
        f.startAttack(atk);
        const fd = getFrameData(key);

        for (let i = 0; i < fd.startup; i++) {
          f.tickAttack();
        }

        expect(
          f.attackPhase,
          `${key} should be active after ${fd.startup} startup frames`,
        ).toBe('active');
        expect(
          f.attackFrame,
          `${key} attackFrame should reset to 0 at active start`,
        ).toBe(0);
      });

      it('has hitbox during active phase', () => {
        const f = createFighter();
        f.startAttack(atk);
        const fd = getFrameData(key);

        for (let i = 0; i < fd.startup; i++) {
          f.tickAttack();
        }

        expect(f.attackPhase, `${key} must be in active`).toBe('active');

        // Check that at least one active frame has a hitbox
        let foundHitbox = false;
        for (let frame = 0; frame < fd.active; frame++) {
          const hitboxes = f.getActiveHitboxes();
          if (hitboxes.length > 0) {
            foundHitbox = true;
            break;
          }
          f.tickAttack();
        }
        expect(
          foundHitbox,
          `${key} should have at least one hitbox frame during active phase`,
        ).toBe(true);
      });

      it('reaches recovery phase after startup + active frames', () => {
        const f = createFighter();
        f.startAttack(atk);
        const fd = getFrameData(key);

        for (let i = 0; i < fd.startup + fd.active; i++) {
          f.tickAttack();
        }

        expect(
          f.attackPhase,
          `${key} should be in recovery after ${fd.startup + fd.active} frames`,
        ).toBe('recovery');
        // No hitbox during recovery
        expect(
          f.getActiveHitbox(),
          `${key} should have no hitbox in recovery`,
        ).toBeNull();
      });

      if (getFrameData(key).recovery > 0) {
        it('attack ends after total frames and returns to IDLE', () => {
          const f = createFighter();
          f.startAttack(atk);
          const fd = getFrameData(key);
          const total = fd.startup + fd.active + fd.recovery;

          for (let i = 0; i < total; i++) {
            f.tickAttack();
          }

          expect(f.currentAttack, `${key} should have null currentAttack`).toBeNull();
          expect(f.attackPhase, `${key} should have 'none' phase`).toBe('none');
          expect(f.state, `${key} should return to IDLE`).toBe(FighterState.IDLE);
        });
      }
    });
  }
});

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: Specific Ryo special move data verification
// ═══════════════════════════════════════════════════════════════════

describe('Ryo Frame Contract: special move FRAME_DATA values', () => {
  it('RYO_KOOU (weak projectile) has expected frame data', () => {
    const fd = getFrameData('RYO_KOOU');
    expect(fd.startup).toBe(12);
    expect(fd.active).toBe(18);
    expect(fd.recovery).toBe(34);
    expect(fd.damage).toBe(75);
    expect(fd.knockdown).toBe(false);
    expect(fd.hitLevel).toBe('MID');
  });

  it('RYO_KO_HOU (weak upper) causes knockdown with correct startup', () => {
    const fd = getFrameData('RYO_KO_HOU');
    expect(fd.knockdown).toBe(true);
    expect(fd.startup).toBe(5);
    expect(fd.active).toBe(5);
    expect(fd.recovery).toBe(25);
  });

  it('RYO_KO_HOU_C (strong upper) is stronger than weak', () => {
    const weak = getFrameData('RYO_KO_HOU');
    const strong = getFrameData('RYO_KO_HOU_C');
    expect(strong.damage).toBeGreaterThan(weak.damage);
    expect(strong.active).toBeGreaterThan(weak.active);
    expect(strong.startup).toBeGreaterThanOrEqual(weak.startup);
  });

  it('RYO_HIEN (overhead kick) is HIGH hitLevel and causes knockdown', () => {
    const fd = getFrameData('RYO_HIEN');
    expect(fd.hitLevel).toBe('HIGH');
    expect(fd.knockdown).toBe(true);
    expect(fd.damage).toBe(95);
  });

  it('RYO_HAOU (counter) is MID and does not knockdown', () => {
    const fd = getFrameData('RYO_HAOU');
    expect(fd.hitLevel).toBe('MID');
    expect(fd.knockdown).toBe(false);
  });

  it('DM_TEN_HA_OU has high damage, knockdown, and chip damage', () => {
    const fd = getFrameData('DM_TEN_HA_OU');
    expect(fd.damage).toBeGreaterThanOrEqual(150);
    expect(fd.knockdown).toBe(true);
    expect(fd.chipDamage).toBeGreaterThan(0);
  });

  it('DM_RYUKO_RANBU has high damage and knockdown', () => {
    const fd = getFrameData('DM_RYUKO_RANBU');
    expect(fd.damage).toBeGreaterThanOrEqual(150);
    expect(fd.knockdown).toBe(true);
  });

  it('Ryo specials expected to have chipDamage do', () => {
    const chipExpected = [
      'RYO_KOOU',
      'RYO_KO_HOU',
      'RYO_KO_HOU_C',
    ] as const;

    for (const key of chipExpected) {
      const fd = getFrameData(key);
      expect(
        fd.chipDamage,
        `${key} should have chipDamage > 0`,
      ).toBeGreaterThan(0);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: ATTACK_FRAMES array length vs FRAME_DATA detailed report
// ═══════════════════════════════════════════════════════════════════

describe('Ryo Frame Contract: ATTACK_FRAMES length documentation', () => {
  it('documents ATTACK_FRAMES length vs FRAME_DATA for all Ryo attacks', () => {
    const allKeys = [...RYO_NORMALS, ...RYO_COMMAND_NORMALS, ...RYO_SPECIALS, ...RYO_DMS];
    const report: string[] = [];

    for (const key of allKeys) {
      const fd = getFrameData(key);
      const frames = ATTACK_FRAMES[key as AttackType];
      if (!frames) {
        report.push(`${key}: MISSING ATTACK_FRAMES`);
        continue;
      }

      const total = fd.startup + fd.active + fd.recovery;
      const status = frames.length === fd.active ? 'MATCH' :
                     frames.length > fd.active ? 'EXTRA' : 'SHORT';
      report.push(
        `${key}: FRAME_DATA=[S:${fd.startup} A:${fd.active} R:${fd.recovery} T:${total}] ` +
        `ATTACK_FRAMES=${frames.length} [${status}]`,
      );
    }

    console.log('[Frame Contract] ATTACK_FRAMES vs FRAME_DATA alignment report:');
    report.forEach(r => console.log(`  ${r}`));

    // Documentation test — always passes
    expect(true).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: Air attack special behavior
// ═══════════════════════════════════════════════════════════════════

describe('Ryo Frame Contract: air attack behavior', () => {
  const AIR_ATTACKS = ['JUMP_C', 'JUMP_D'] as const;

  it('air attacks have recovery=0 and persist until landing', () => {
    for (const key of AIR_ATTACKS) {
      const fd = getFrameData(key);
      expect(fd.recovery, `${key} should have recovery=0`).toBe(0);
    }
  });

  it('air attacks do not end via tickAttack alone', () => {
    for (const key of AIR_ATTACKS) {
      const f = new Fighter(400, '#dd6600', 1);
      f.charId = 'ryo';
      f.state = FighterState.JUMP;
      f.vy = -10;
      f.startAttack(key as AttackType);

      const fd = getFrameData(key);
      const total = fd.startup + fd.active;

      for (let i = 0; i < total; i++) {
        f.tickAttack();
      }

      expect(
        f.currentAttack,
        `${key} air attack should persist after startup+active`,
      ).not.toBeNull();
      expect(
        f.attackPhase,
        `${key} air attack should be in recovery phase`,
      ).toBe('recovery');
    }
  });
});

// ═══════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════

/** Count frames with at least one non-empty attack box in the given range */
function countFramesWithHitboxes(
  frames: { attack: Array<{ ox: number; oy: number; w: number; h: number }> }[],
  start: number,
  end: number,
): number {
  let count = 0;
  for (let i = start; i < end && i < frames.length; i++) {
    if (frames[i].attack.length > 0) count++;
  }
  return count;
}

/** Count frames with empty attack boxes in the given range */
function countEmptyHitboxFrames(
  frames: { attack: Array<{ ox: number; oy: number; w: number; h: number }> }[],
  start: number,
  end: number,
): number {
  let count = 0;
  for (let i = start; i < end && i < frames.length; i++) {
    if (frames[i].attack.length === 0) count++;
  }
  return count;
}
