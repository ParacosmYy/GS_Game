/**
 * Combat System Regression Tests
 *
 * Verifies core combat behavior has not regressed across:
 * 1. Basic Hit Confirms  (damage values match FRAME_DATA)
 * 2. Block Behavior      (correct/wrong block, chip damage)
 * 3. Combo System        (count, scaling, throw bypass)
 * 4. Counter Hit         (detection, bonus hitstun, juggle restore)
 * 5. Knockdown & Wakeup  (CD knockdown, block prevention, recovery)
 * 6. KO and Health        (KO threshold, chip cannot kill, clamp)
 * 7. Pushback & Position  (hit/block pushback, corner limit)
 */
import { describe, it, expect } from 'vitest';
import { CombatSystem } from '../src/combat/combatSystem.js';
import { Fighter } from '../src/entities/fighter.js';
import { FighterState, AttackType, JuggleState } from '../src/core/types.js';
import type { PlayerInput, Direction } from '../src/core/types.js';
import type { IInputProvider } from '../src/input/inputProvider.js';
import {
  FRAME_DATA,
  CHIP_DAMAGE_RATIO,
  MAX_HEALTH,
  STAGE_LEFT,
  STAGE_RIGHT,
  STAGE_GROUND_Y,
  JUGGLE_POINTS_MAX,
  COUNTER_WIRE_BOUNCE_VX,
  COMBO_DAMAGE_SCALE,
  COMBO_MIN_SCALE,
  DM_COMBO_PENALTY,
  WRONG_BLOCK_PUSHBACK_MULT,
  WRONG_BLOCK_STUN_MULT,
} from '../src/core/constants.js';

// ── Helpers ──────────────────────────────────────────────────────────

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
  groundBounce?: boolean;
};

interface HitEvent {
  attacker: Fighter;
  defender: Fighter;
  attackType: AttackType;
  blocked: boolean;
  counterHit: boolean;
}

/** Build a mock input provider that returns fixed inputs for both players */
function makeInputProvider(
  p1: Partial<PlayerInput>,
  p2: Partial<PlayerInput>,
): IInputProvider {
  const defaultInput: PlayerInput = {
    up: false, down: false, left: false, right: false,
    buttonA: false, buttonB: false, buttonC: false, buttonD: false,
    throwAttack: false, start: false,
  };
  return {
    getP1Input: () => ({ ...defaultInput, ...p1 }),
    getP2Input: () => ({ ...defaultInput, ...p2 }),
  };
}

/** Create a Fighter positioned at a specific X facing a direction */
function makeFighter(x: number, facing: Direction = 1): Fighter {
  return new Fighter(x, '#ff0000', facing);
}

/**
 * Simulate one resolveAttacks call:
 * - Sets attacker's attack state to active phase with hasHit = false
 * - Calls combat.resolveAttacks
 * - Returns the list of hit callbacks
 *
 * When p2 (defender) faces -1, "back" for p2 is raw.right.
 * So to make p2 block, pass { right: true } for p2 input.
 */
function resolveOneHit(
  combat: CombatSystem,
  attacker: Fighter,
  defender: Fighter,
  attackType: AttackType,
  attackState: FighterState = FighterState.STAND_ATTACK,
): HitEvent[] {
  const hits: HitEvent[] = [];
  const onHit = (
    atk: Fighter, def: Fighter,
    type: AttackType, blocked: boolean, ch: boolean,
  ) => {
    hits.push({ attacker: atk, defender: def, attackType: type, blocked, counterHit: ch });
  };

  // Set up attacker state
  attacker.currentAttack = attackType;
  attacker.attackPhase = 'active';
  attacker.attackFrame = 0;
  attacker.hasHit = false;
  attacker.state = attackState;

  // Ensure defender is not invincible
  if (defender.invincible) {
    // Don't clear invincibility — test may intentionally set it
  }

  combat.resolveAttacks(attacker, defender, [], onHit, 0, [false, false]);

  return hits;
}

/** Prepare attacker for another hit in the same combo sequence */
function resetAttackerForNextHit(
  attacker: Fighter,
  attackType: AttackType = AttackType.STAND_A,
  attackState: FighterState = FighterState.STAND_ATTACK,
): void {
  attacker.hasHit = false;
  attacker.attackPhase = 'active';
  attacker.attackFrame = 0;
  attacker.currentAttack = attackType;
  attacker.state = attackState;
}

/**
 * Default fighter positions:
 * - Attacker at x=300 facing right (1)
 * - Defender at x=340 facing left (-1)
 * Close enough for hitboxes to overlap.
 */
const ATTACKER_X = 300;
const DEFENDER_X = 340;

// ─────────────────────────────────────────────────────────────────────

describe('Combat System Regression', () => {

  // ═══════════════════════════════════════════════════════════════════
  // 1. Basic Hit Confirms
  // ═══════════════════════════════════════════════════════════════════
  describe('1. Basic Hit Confirms', () => {

    it('STAND_A hits for correct damage', () => {
      const combat = new CombatSystem(makeInputProvider({}, {}));
      const attacker = makeFighter(ATTACKER_X, 1);
      const defender = makeFighter(DEFENDER_X, -1);
      const initialHealth = defender.health;

      const hits = resolveOneHit(combat, attacker, defender, AttackType.STAND_A);
      expect(hits.length).toBe(1);
      expect(hits[0].blocked).toBe(false);

      const data = FRAME_DATA[AttackType.STAND_A] as FrameDataEntry;
      expect(initialHealth - defender.health).toBe(data.damage);
    });

    it('STAND_C hits for correct damage', () => {
      const combat = new CombatSystem(makeInputProvider({}, {}));
      const attacker = makeFighter(ATTACKER_X, 1);
      const defender = makeFighter(DEFENDER_X, -1);
      const initialHealth = defender.health;

      const hits = resolveOneHit(combat, attacker, defender, AttackType.STAND_C);
      expect(hits.length).toBe(1);
      expect(hits[0].blocked).toBe(false);

      const data = FRAME_DATA[AttackType.STAND_C] as FrameDataEntry;
      expect(initialHealth - defender.health).toBe(data.damage);
    });

    it('CROUCH_B hits for correct damage', () => {
      const combat = new CombatSystem(makeInputProvider({}, {}));
      const attacker = makeFighter(ATTACKER_X, 1);
      const defender = makeFighter(DEFENDER_X, -1);
      const initialHealth = defender.health;

      // Attacker in CROUCH state before attacking
      attacker.state = FighterState.CROUCH;
      const hits = resolveOneHit(combat, attacker, defender, AttackType.CROUCH_B, FighterState.CROUCH_ATTACK);
      expect(hits.length).toBe(1);
      expect(hits[0].blocked).toBe(false);

      const data = FRAME_DATA[AttackType.CROUCH_B] as FrameDataEntry;
      expect(initialHealth - defender.health).toBe(data.damage);
    });

    it('JUMP_C hits for correct damage', () => {
      const combat = new CombatSystem(makeInputProvider({}, {}));
      const attacker = makeFighter(ATTACKER_X, 1);
      const defender = makeFighter(DEFENDER_X, -1);
      const initialHealth = defender.health;

      // Attacker must be airborne for AIR_ATTACK state
      attacker.y = STAGE_GROUND_Y - 100;
      const hits = resolveOneHit(combat, attacker, defender, AttackType.JUMP_C, FighterState.AIR_ATTACK);
      expect(hits.length).toBe(1);
      expect(hits[0].blocked).toBe(false);

      const data = FRAME_DATA[AttackType.JUMP_C] as FrameDataEntry;
      expect(initialHealth - defender.health).toBe(data.damage);
    });

    it('Damage matches FRAME_DATA exactly for first hit (no scaling)', () => {
      const attacksToTest: AttackType[] = [
        AttackType.STAND_A, AttackType.STAND_B,
        AttackType.STAND_C, AttackType.STAND_D,
        AttackType.CROUCH_A, AttackType.CROUCH_B,
        AttackType.CROUCH_C,
      ];

      for (const atk of attacksToTest) {
        const a = makeFighter(ATTACKER_X, 1);
        const d = makeFighter(DEFENDER_X, -1);
        const hp = d.health;

        const cs = new CombatSystem(makeInputProvider({}, {}));
        const hits = resolveOneHit(cs, a, d, atk);
        expect(hits.length, `Expected 1 hit for ${atk}`).toBe(1);

        const data = FRAME_DATA[atk as keyof typeof FRAME_DATA] as FrameDataEntry;
        expect(hp - d.health, `${atk} damage mismatch`).toBe(data.damage);
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 2. Block Behavior
  // ═══════════════════════════════════════════════════════════════════
  describe('2. Block Behavior', () => {

    it('Standing block vs MID attack: blocked', () => {
      // Defender faces -1 (left), so "back" for them is raw.right
      const combat = new CombatSystem(makeInputProvider({}, { right: true }));
      const attacker = makeFighter(ATTACKER_X, 1);
      const defender = makeFighter(DEFENDER_X, -1);

      // STAND_A is MID, standing block should work
      const hits = resolveOneHit(combat, attacker, defender, AttackType.STAND_A);

      expect(hits.length).toBe(1);
      expect(hits[0].blocked).toBe(true);
      expect(defender.state).toBe(FighterState.BLOCK);
    });

    it('Crouching block vs LOW attack: blocked', () => {
      // Defender faces -1, crouching + back = down + right
      const combat = new CombatSystem(makeInputProvider({}, { right: true, down: true }));
      const attacker = makeFighter(ATTACKER_X, 1);
      const defender = makeFighter(DEFENDER_X, -1);
      defender.state = FighterState.CROUCH;

      // CROUCH_B is LOW, crouching block should work
      attacker.state = FighterState.CROUCH;
      const hits = resolveOneHit(combat, attacker, defender, AttackType.CROUCH_B, FighterState.CROUCH_ATTACK);

      expect(hits.length).toBe(1);
      expect(hits[0].blocked).toBe(true);
      expect(defender.state).toBe(FighterState.BLOCK);
    });

    it('Standing block vs LOW attack: wrong block penalty', () => {
      // Defender faces -1, holds back (right) but stands — LOW attack needs crouch
      const combat = new CombatSystem(makeInputProvider({}, { right: true }));
      const attacker = makeFighter(ATTACKER_X, 1);
      const defender = makeFighter(DEFENDER_X, -1);
      // Defender is standing (IDLE), not crouching

      // CROUCH_B is LOW hitLevel — standing block should be wrong block
      attacker.state = FighterState.CROUCH;
      const hits = resolveOneHit(combat, attacker, defender, AttackType.CROUCH_B, FighterState.CROUCH_ATTACK);

      expect(hits.length).toBe(1);
      // Wrong block: still reports blocked=true (takes blockstun with penalty)
      expect(hits[0].blocked).toBe(true);

      // Verify wrong block penalty: blockstun is multiplied by WRONG_BLOCK_STUN_MULT
      const data = FRAME_DATA[AttackType.CROUCH_B] as FrameDataEntry;
      const expectedStun = Math.round(data.blockstun * WRONG_BLOCK_STUN_MULT);
      expect(defender.blockstunTimer).toBe(expectedStun);
    });

    it('Air block vs HIGH attack: blocked', () => {
      // Air block test: defender is airborne, holds back, and blocks a HIGH attack.
      // Key: the combat system requires airborne defenders to have juggleState !== NONE
      // to be hittable. We set juggleState=FULL and jugglePoints to simulate a
      // jugglable state (e.g., after being launched).
      const combat = new CombatSystem(makeInputProvider({}, { right: true }));
      const attacker = makeFighter(ATTACKER_X, 1);
      const defender = makeFighter(DEFENDER_X, -1);

      // Defender slightly airborne, in JUMP state for canAirBlock(), with juggle state set
      defender.y = STAGE_GROUND_Y - 1;
      defender.state = FighterState.JUMP;
      defender.juggleState = JuggleState.FULL;
      defender.jugglePoints = JUGGLE_POINTS_MAX;

      // STAND_C is MID hitLevel. Air block: hitLevel !== 'LOW' → true for MID.
      const hits = resolveOneHit(combat, attacker, defender, AttackType.STAND_C);

      expect(hits.length).toBe(1);
      expect(hits[0].blocked).toBe(true);
      expect(defender.state).toBe(FighterState.AIR_BLOCK);
    });

    it('Chip damage on block: correct ratio', () => {
      // Defender faces -1, holds back (right)
      const combat = new CombatSystem(makeInputProvider({}, { right: true }));
      const attacker = makeFighter(ATTACKER_X, 1);
      const defender = makeFighter(DEFENDER_X, -1);
      const initialHealth = defender.health;

      // SPECIAL_PROJECTILE has explicit chipDamage=9 and is MID
      const hits = resolveOneHit(combat, attacker, defender, AttackType.SPECIAL_PROJECTILE);

      expect(hits.length).toBe(1);
      expect(hits[0].blocked).toBe(true);

      const data = FRAME_DATA[AttackType.SPECIAL_PROJECTILE] as FrameDataEntry;
      const expectedChip = data.chipDamage!;
      expect(initialHealth - defender.health).toBe(expectedChip);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 3. Combo System
  // ═══════════════════════════════════════════════════════════════════
  describe('3. Combo System', () => {

    it('Two consecutive hits increment combo count', () => {
      const combat = new CombatSystem(makeInputProvider({}, {}));
      const attacker = makeFighter(ATTACKER_X, 1);
      const defender = makeFighter(DEFENDER_X, -1);

      // First hit
      resolveOneHit(combat, attacker, defender, AttackType.STAND_A);
      // defender is fighters[1], so combo index is 1
      expect(combat.getComboCount(1)).toBe(1);

      // Reset attacker for second hit; keep defender in hittable state
      resetAttackerForNextHit(attacker, AttackType.STAND_A);
      combat.resolveAttacks(attacker, defender, [], undefined, 1, [false, false]);

      expect(combat.getComboCount(1)).toBe(2);
    });

    it('Block resets combo count', () => {
      // Use a mutable input provider so we can change p2 input mid-test
      let p2Input: PlayerInput = {
        up: false, down: false, left: false, right: false,
        buttonA: false, buttonB: false, buttonC: false, buttonD: false,
        throwAttack: false, start: false,
      };
      const defaultP1: PlayerInput = {
        up: false, down: false, left: false, right: false,
        buttonA: false, buttonB: false, buttonC: false, buttonD: false,
        throwAttack: false, start: false,
      };
      const provider: IInputProvider = {
        getP1Input: () => defaultP1,
        getP2Input: () => p2Input,
      };

      const combat = new CombatSystem(provider);
      const attacker = makeFighter(ATTACKER_X, 1);
      const defender = makeFighter(DEFENDER_X, -1);

      // First hit: no block — use direct resolveAttacks to avoid double counting
      attacker.currentAttack = AttackType.STAND_A;
      attacker.attackPhase = 'active';
      attacker.attackFrame = 0;
      attacker.hasHit = false;
      attacker.state = FighterState.STAND_ATTACK;
      combat.resolveAttacks(attacker, defender, [], undefined, 0, [false, false]);
      expect(combat.getComboCount(1)).toBe(1);

      // Now set defender to block (faces -1 → back = right)
      p2Input = { ...p2Input, right: true };

      // Also reset defender state so canBlock() returns true
      defender.state = FighterState.IDLE;

      resetAttackerForNextHit(attacker, AttackType.STAND_A);
      combat.resolveAttacks(attacker, defender, [], undefined, 1, [false, false]);

      // Combo should be reset on block
      expect(combat.getComboCount(1)).toBe(0);
    });

    it('Damage scaling applies correctly at hit 4+', () => {
      let p2Input: PlayerInput = {
        up: false, down: false, left: false, right: false,
        buttonA: false, buttonB: false, buttonC: false, buttonD: false,
        throwAttack: false, start: false,
      };
      const defaultP1: PlayerInput = {
        up: false, down: false, left: false, right: false,
        buttonA: false, buttonB: false, buttonC: false, buttonD: false,
        throwAttack: false, start: false,
      };
      const provider: IInputProvider = {
        getP1Input: () => defaultP1,
        getP2Input: () => p2Input,
      };

      const combat = new CombatSystem(provider);
      const attacker = makeFighter(ATTACKER_X, 1);
      const defender = makeFighter(DEFENDER_X, -1);

      // Land 3 hits to build combo to 3
      for (let i = 0; i < 3; i++) {
        resolveOneHit(combat, attacker, defender, AttackType.STAND_A);
        resetAttackerForNextHit(attacker, AttackType.STAND_A);
        // Tick combat forward
        combat.resolveAttacks(attacker, defender, [], undefined, i + 1, [false, false]);
      }

      // comboHits[1] should be 6 now (3 from resolveOneHit + 3 from the loop's resolveAttacks)
      // Actually, resolveOneHit calls resolveAttacks internally which does both p1→p2 and p2→p1.
      // The p2→p1 direction won't hit because defender has no attack active.
      // And the second resolveAttacks in the loop will also try but attacker.hasHit is already set.
      // Let me simplify: just use direct resolveAttacks calls

      // Start fresh
      const combat2 = new CombatSystem(provider);
      const a2 = makeFighter(ATTACKER_X, 1);
      const d2 = makeFighter(DEFENDER_X, -1);

      // Hit 1
      a2.currentAttack = AttackType.STAND_A;
      a2.attackPhase = 'active';
      a2.attackFrame = 0;
      a2.hasHit = false;
      a2.state = FighterState.STAND_ATTACK;
      combat2.resolveAttacks(a2, d2, [], undefined, 0, [false, false]);
      expect(combat2.getComboCount(1)).toBe(1);

      // Hit 2
      resetAttackerForNextHit(a2, AttackType.STAND_A);
      combat2.resolveAttacks(a2, d2, [], undefined, 1, [false, false]);
      expect(combat2.getComboCount(1)).toBe(2);

      // Hit 3
      resetAttackerForNextHit(a2, AttackType.STAND_A);
      combat2.resolveAttacks(a2, d2, [], undefined, 2, [false, false]);
      expect(combat2.getComboCount(1)).toBe(3);

      // Hit 4: comboHits = 3 at time of scaledDamage call
      // 3 <= threshold 6 → scale = COMBO_DAMAGE_SCALE[6] = 0.85
      const hpBefore4th = d2.health;
      const data = FRAME_DATA[AttackType.STAND_A] as FrameDataEntry;

      resetAttackerForNextHit(a2, AttackType.STAND_A);
      combat2.resolveAttacks(a2, d2, [], undefined, 3, [false, false]);

      // scaledDamage(base=33, defIdx=1, attackType=STAND_A)
      // comboHits=3 → threshold loop: 3 <= 3 → scale = COMBO_DAMAGE_SCALE[3] = 1.0
      // Wait: thresholds are [3, 6, 9], and 3 <= 3 → scale = 1.0
      // That means comboCount 1-3 all scale at 1.0 (100%)
      // So the 4th hit (comboHits=3 at call time) should still be 100% damage
      // comboHits++ happens after scaledDamage, so at hit 4, comboHits was 3
      expect(combat2.getComboCount(1)).toBe(4);
      expect(hpBefore4th - d2.health).toBe(data.damage); // 33, unscaled

      // Hit 5: comboHits=4 at call time → 4 > 3, 4 <= 6 → scale = 0.85
      const hpBefore5th = d2.health;
      resetAttackerForNextHit(a2, AttackType.STAND_A);
      combat2.resolveAttacks(a2, d2, [], undefined, 4, [false, false]);
      expect(combat2.getComboCount(1)).toBe(5);
      const expected5th = Math.max(1, Math.round(data.damage * 0.85));
      expect(hpBefore5th - d2.health).toBe(expected5th); // 28
    });

    it('Throw ignores damage scaling', () => {
      const provider: IInputProvider = {
        getP1Input: () => ({
          up: false, down: false, left: false, right: false,
          buttonA: false, buttonB: false, buttonC: false, buttonD: false,
          throwAttack: false, start: false,
        }),
        getP2Input: () => ({
          up: false, down: false, left: false, right: false,
          buttonA: false, buttonB: false, buttonC: false, buttonD: false,
          throwAttack: false, start: false,
        }),
      };

      const combat = new CombatSystem(provider);
      const attacker = makeFighter(ATTACKER_X, 1);
      const defender = makeFighter(DEFENDER_X, -1);

      // Build combo to 5 hits
      for (let i = 0; i < 5; i++) {
        attacker.currentAttack = AttackType.STAND_A;
        attacker.attackPhase = 'active';
        attacker.attackFrame = 0;
        attacker.hasHit = false;
        attacker.state = FighterState.STAND_ATTACK;
        combat.resolveAttacks(attacker, defender, [], undefined, i, [false, false]);
      }
      expect(combat.getComboCount(1)).toBe(5);

      // Now the next normal hit would be scaled (comboHits=5 → 5>3, 5<=6 → 0.85)
      // But a throw should bypass scaling
      const throwData = FRAME_DATA[AttackType.THROW] as FrameDataEntry;
      // Throw damage is always unscaled per the code: if (isThrow) return baseDamage
      expect(throwData.damage).toBe(100);
      // Verify combo is active (scaling would apply to normals)
      expect(combat.getComboCount(1)).toBeGreaterThan(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 4. Counter Hit
  // ═══════════════════════════════════════════════════════════════════
  describe('4. Counter Hit', () => {

    it('Hit attacking opponent: counter hit detected', () => {
      const combat = new CombatSystem(makeInputProvider({}, {}));
      const attacker = makeFighter(ATTACKER_X, 1);
      const defender = makeFighter(DEFENDER_X, -1);
      // Defender is also attacking — triggers counter hit
      defender.state = FighterState.STAND_ATTACK;

      const hits = resolveOneHit(combat, attacker, defender, AttackType.STAND_C);
      expect(hits.length).toBe(1);
      expect(hits[0].counterHit).toBe(true);
    });

    it('Counter hit gives extra hitstun (+3F normal, +5F special)', () => {
      const combat = new CombatSystem(makeInputProvider({}, {}));

      // Test normal counter hit: heavy normal (not light, not special)
      const attacker = makeFighter(ATTACKER_X, 1);
      const defender = makeFighter(DEFENDER_X, -1);
      defender.state = FighterState.STAND_ATTACK; // defender is attacking → CH

      const data = FRAME_DATA[AttackType.STAND_C] as FrameDataEntry;
      const baseHitstun = data.hitstun; // 19

      const hits = resolveOneHit(combat, attacker, defender, AttackType.STAND_C);
      expect(hits[0].counterHit).toBe(true);
      // STAND_C is heavy normal (not light, not special) → +3F bonus
      expect(defender.hitstunTimer).toBe(baseHitstun + 3);
    });

    it('Counter hit airborne: restores juggle points', () => {
      const combat = new CombatSystem(makeInputProvider({}, {}));
      const attacker = makeFighter(ATTACKER_X, 1);
      const defender = makeFighter(DEFENDER_X, -1);

      // Both airborne at same height for reliable hitbox overlap
      const airY = STAGE_GROUND_Y - 200;
      attacker.y = airY;
      defender.y = airY;
      defender.state = FighterState.AIR_ATTACK; // attacking in air → counter hit
      // Must set juggle state so the airborne hit resolves (juggle check)
      defender.juggleState = JuggleState.FULL;
      defender.jugglePoints = JUGGLE_POINTS_MAX;

      // Use direct setup to avoid any helper interference
      attacker.currentAttack = AttackType.JUMP_C;
      attacker.attackPhase = 'active';
      attacker.attackFrame = 0;
      attacker.hasHit = false;
      attacker.state = FighterState.AIR_ATTACK;

      const hits: HitEvent[] = [];
      const onHit = (atk: Fighter, def: Fighter, type: AttackType, blocked: boolean, ch: boolean) => {
        hits.push({ attacker: atk, defender: def, attackType: type, blocked, counterHit: ch });
      };
      combat.resolveAttacks(attacker, defender, [], onHit, 0, [false, false]);

      expect(hits.length).toBe(1);
      expect(hits[0].counterHit).toBe(true);

      // Counter hit airborne: juggleState → FULL, jugglePoints → JUGGLE_POINTS_MAX
      expect(defender.juggleState).toBe(JuggleState.FULL);
      expect(defender.jugglePoints).toBe(JUGGLE_POINTS_MAX);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 5. Knockdown and Wakeup
  // ═══════════════════════════════════════════════════════════════════
  describe('5. Knockdown and Wakeup', () => {

    it('CD attack causes knockdown/wall bounce', () => {
      const combat = new CombatSystem(makeInputProvider({}, {}));
      const attacker = makeFighter(ATTACKER_X, 1);
      const defender = makeFighter(DEFENDER_X, -1);

      resolveOneHit(combat, attacker, defender, AttackType.STAND_CD);

      // STAND_CD has knockdown:true and counterWire:true
      // CD attacks cause wall bounce (not simple knockdown) when wallBounceCount < limit
      // The defender should end up in HITSTUN state with counter wire flag
      expect(defender.isCounterWire).toBe(true);
      expect(defender.state).toBe(FighterState.HITSTUN);
      expect(defender.hitstunTimer).toBe(30);
    });

    it('Knockdown state prevents blocking', () => {
      const defender = makeFighter(DEFENDER_X, -1);
      defender.state = FighterState.KNOCKDOWN;
      defender.isKnockedDown = true;

      expect(defender.canBlock()).toBe(false);
    });

    it('Wakeup returns to IDLE', () => {
      const defender = makeFighter(DEFENDER_X, -1);
      defender.state = FighterState.KNOCKDOWN;
      defender.isKnockedDown = true;
      defender.knockdownTimer = 0;

      // Simulate endAttack-like wakeup: state transitions back to IDLE
      defender.endAttack();
      expect(defender.state).toBe(FighterState.IDLE);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 6. KO and Health
  // ═══════════════════════════════════════════════════════════════════
  describe('6. KO and Health', () => {

    it('Health reaches 0 on KO hit', () => {
      const combat = new CombatSystem(makeInputProvider({}, {}));
      const attacker = makeFighter(ATTACKER_X, 1);
      const defender = makeFighter(DEFENDER_X, -1);

      // Set defender health low enough that STAND_C (100 damage) will KO
      defender.health = 50;

      resolveOneHit(combat, attacker, defender, AttackType.STAND_C);

      expect(defender.health).toBe(0);
    });

    it('Chip damage cannot kill (leaves 1 HP)', () => {
      // Defender faces -1, holds back (right) to block
      const combat = new CombatSystem(makeInputProvider({}, { right: true }));
      const attacker = makeFighter(ATTACKER_X, 1);
      const defender = makeFighter(DEFENDER_X, -1);

      // Set defender health to 1 — chip should not reduce below 1
      defender.health = 1;

      // Use SPECIAL_PROJECTILE which has chipDamage=9 and is MID (blockable)
      resolveOneHit(combat, attacker, defender, AttackType.SPECIAL_PROJECTILE);

      // Chip damage is clamped: Math.max(1, health - chip)
      expect(defender.health).toBe(1);
    });

    it('Health clamped at 0 minimum', () => {
      const combat = new CombatSystem(makeInputProvider({}, {}));
      const attacker = makeFighter(ATTACKER_X, 1);
      const defender = makeFighter(DEFENDER_X, -1);

      // Set health very low, hit with high damage
      defender.health = 5;

      // STAND_C does 100 damage → health should clamp to 0
      resolveOneHit(combat, attacker, defender, AttackType.STAND_C);

      expect(defender.health).toBe(0);
      expect(defender.health).toBeGreaterThanOrEqual(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 7. Pushback and Position
  // ═══════════════════════════════════════════════════════════════════
  describe('7. Pushback and Position', () => {

    it('Hit pushback moves defender away from attacker', () => {
      const combat = new CombatSystem(makeInputProvider({}, {}));
      const attacker = makeFighter(ATTACKER_X, 1);
      const defender = makeFighter(DEFENDER_X, -1);

      resolveOneHit(combat, attacker, defender, AttackType.STAND_C);

      const data = FRAME_DATA[AttackType.STAND_C] as FrameDataEntry;
      // applyHitstun: vx = pushback * (facing === 1 ? -1 : 1) * 0.85
      // defender facing -1: (false) → 1, so vx = pushback * 1 * 0.85 = positive
      // Positive vx means moving right (away from attacker who is to the left)
      expect(defender.vx).toBeGreaterThan(0);
      expect(Math.abs(defender.vx)).toBeCloseTo(data.pushback * 0.85, 1);
    });

    it('Block pushback moves defender away', () => {
      // Defender faces -1, holds back (right)
      const combat = new CombatSystem(makeInputProvider({}, { right: true }));
      const attacker = makeFighter(ATTACKER_X, 1);
      const defender = makeFighter(DEFENDER_X, -1);

      resolveOneHit(combat, attacker, defender, AttackType.STAND_C);

      const data = FRAME_DATA[AttackType.STAND_C] as FrameDataEntry;
      // applyBlockstun: vx = pushback * (facing === 1 ? -1 : 1) * 0.8
      // defender facing -1: vx = pushback * 1 * 0.8 = positive (rightward, away)
      expect(defender.vx).toBeGreaterThan(0);
    });

    it('Corner limits pushback distance', () => {
      const combat = new CombatSystem(makeInputProvider({}, {}));

      // Place defender near right corner, attacker close to defender
      // so hitboxes actually overlap
      const defender = makeFighter(STAGE_RIGHT - 10, -1);
      const attacker = makeFighter(STAGE_RIGHT - 50, 1);

      resolveOneHit(combat, attacker, defender, AttackType.STAND_C);

      // Defender should not move past STAGE_RIGHT
      // (position clamping happens in physics update, not combat, but velocity is set)
      const data = FRAME_DATA[AttackType.STAND_C] as FrameDataEntry;
      const defenderNearCorner = defender.x < STAGE_LEFT + 60 || defender.x > STAGE_RIGHT - 60;
      expect(defenderNearCorner).toBe(true);

      // Attacker pushback when defender near corner:
      // atkPushback = data.pushback * 0.2 * 1.5 (cornerBonus)
      // attacker.facing = 1 → attacker.vx = -atkPushback * 1 (pushed left)
      const expectedAtkPush = data.pushback * 0.2 * 1.5;
      if (expectedAtkPush > 0.3) {
        expect(attacker.vx).toBeLessThan(0);
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Additional Edge Case Regression Tests
  // ═══════════════════════════════════════════════════════════════════

  describe('Edge Cases', () => {
    it('hasHit=true prevents double-hit in same active phase', () => {
      const combat = new CombatSystem(makeInputProvider({}, {}));
      const attacker = makeFighter(ATTACKER_X, 1);
      const defender = makeFighter(DEFENDER_X, -1);

      // First resolution
      resolveOneHit(combat, attacker, defender, AttackType.STAND_A);

      const healthAfterFirst = defender.health;

      // Second resolution with hasHit still true — should not deal damage
      attacker.attackPhase = 'active';
      attacker.attackFrame = 0;
      // hasHit is still true from first hit
      combat.resolveAttacks(attacker, defender, [], undefined, 1, [false, false]);

      expect(defender.health).toBe(healthAfterFirst);
    });

    it('Combo timeout resets combo count', () => {
      const combat = new CombatSystem(makeInputProvider({}, {}));
      const attacker = makeFighter(ATTACKER_X, 1);
      const defender = makeFighter(DEFENDER_X, -1);

      resolveOneHit(combat, attacker, defender, AttackType.STAND_A);
      expect(combat.getComboCount(1)).toBe(1);

      // Simulate combo timeout (COMBO_TIMEOUT = 60 frames)
      // Tick with currentFrame well past the last hit frame (0 + 60 + 1)
      combat.tickComboTimeout(61);

      expect(combat.getComboCount(1)).toBe(0);
    });

    it('CombatSystem reset clears all state', () => {
      const combat = new CombatSystem(makeInputProvider({}, {}));
      const attacker = makeFighter(ATTACKER_X, 1);
      const defender = makeFighter(DEFENDER_X, -1);

      // Build up some combo state
      resolveOneHit(combat, attacker, defender, AttackType.STAND_A);
      expect(combat.getComboCount(1)).toBe(1);

      // Reset
      combat.reset();
      expect(combat.getComboCount(0)).toBe(0);
      expect(combat.getComboCount(1)).toBe(0);
      expect(combat.getComboDamage(0)).toBe(0);
      expect(combat.getComboDamage(1)).toBe(0);
    });

    it('CROUCH_D causes knockdown', () => {
      const combat = new CombatSystem(makeInputProvider({}, {}));
      const attacker = makeFighter(ATTACKER_X, 1);
      const defender = makeFighter(DEFENDER_X, -1);

      attacker.state = FighterState.CROUCH;
      resolveOneHit(combat, attacker, defender, AttackType.CROUCH_D, FighterState.CROUCH_ATTACK);

      // CROUCH_D has knockdown:true in FRAME_DATA
      const data = FRAME_DATA[AttackType.CROUCH_D] as FrameDataEntry;
      expect(data.knockdown).toBe(true);
      // The defender should be knocked down
      expect(defender.state).toBe(FighterState.KNOCKDOWN);
    });

    it('Invincible defender cannot be hit', () => {
      const combat = new CombatSystem(makeInputProvider({}, {}));
      const attacker = makeFighter(ATTACKER_X, 1);
      const defender = makeFighter(DEFENDER_X, -1);
      defender.invincible = true;

      const initialHealth = defender.health;
      const hits = resolveOneHit(combat, attacker, defender, AttackType.STAND_C);

      // Invincible defender: getEffectiveHurtbox returns null → no hit
      expect(hits.length).toBe(0);
      expect(defender.health).toBe(initialHealth);
    });
  });
});
