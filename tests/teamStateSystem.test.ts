/**
 * TeamState System Tests — 验证 3v3 队伍管理完整行为
 *
 * 覆盖: createTeam / activeChar / defeatActive / switchToNext /
 *        spawnActiveFighter / teamOrderString / isTeamDefeated(derived)
 */
import { describe, it, expect } from 'vitest';
import {
  createTeam,
  activeChar,
  defeatActive,
  switchToNext,
  spawnActiveFighter,
  teamOrderString,
} from '../src/state/teamState.js';
import type { CharacterDefinition } from '../src/characters/types.js';
import { FighterState } from '../src/core/types.js';
import { STAGE_WIDTH } from '../src/core/constants.js';

// ── helpers ──

const mockChar = (id: string, nameCn: string): CharacterDefinition => ({
  id,
  name: id,
  nameCn,
  color: '#ff0000',
  accentColor: '#aa0000',
  specialColor: '#ff4400',
  specialGlow: '#ff6600',
  portrait: '',
  stats: {
    walkSpeed: 4,
    runSpeed: 7,
    jumpVelocity: -14,
    hopVelocity: -10,
    hyperJumpVelocity: -17,
    maxHealth: 1000,
    pushWidth: 60,
    jumpForwardSpeed: 5,
  },
  poses: {},
  routeSpecial: () => null,
  routeNormal: () => null,
  routeRekkaFollowup: () => null,
  onAttackActive: () => false,
  getRekkaChain: () => null,
  isCommandThrow: () => false,
  getCounterConfig: () => null,
});

const threeCharTeam = () =>
  createTeam([
    mockChar('kyo', '草薙京'),
    mockChar('iori', '八神庵'),
    mockChar('terry', '特瑞'),
  ]);

// ============================================================================
// 1. Team Construction
// ============================================================================

describe('Team Construction', () => {
  it('createTeam should accept a CharacterDefinition array and set members', () => {
    const chars = [mockChar('a', 'A'), mockChar('b', 'B'), mockChar('c', 'C')];
    const team = createTeam(chars);

    expect(team.members).toHaveLength(3);
    expect(team.members[0].charDef.id).toBe('a');
    expect(team.members[1].charDef.id).toBe('b');
    expect(team.members[2].charDef.id).toBe('c');
  });

  it('all team members should have defeated=false initially', () => {
    const team = threeCharTeam();

    for (const m of team.members) {
      expect(m.defeated).toBe(false);
    }
  });

  it('activeIndex should be 0 initially', () => {
    const team = threeCharTeam();

    expect(team.activeIndex).toBe(0);
    expect(team.alive).toBe(3);
  });
});

// ============================================================================
// 2. Member Management
// ============================================================================

describe('Member Management', () => {
  it('activeChar should return the currently active member', () => {
    const team = threeCharTeam();

    expect(activeChar(team).id).toBe('kyo');
    expect(activeChar(team).nameCn).toBe('草薙京');
  });

  it('alive count should reflect surviving members', () => {
    const team = threeCharTeam();

    expect(team.alive).toBe(3);

    defeatActive(team);
    expect(team.alive).toBe(2);

    switchToNext(team);
    defeatActive(team);
    expect(team.alive).toBe(1);
  });

  it('team is defeated when all members are dead (alive === 0)', () => {
    const team = threeCharTeam();

    // KO member 0
    defeatActive(team);
    switchToNext(team);
    // KO member 1
    defeatActive(team);
    switchToNext(team);
    // KO member 2 (last)
    const stillAlive = defeatActive(team);

    expect(stillAlive).toBe(false);
    expect(team.alive).toBe(0);
    // All defeated
    expect(team.members.every((m) => m.defeated)).toBe(true);
  });
});

// ============================================================================
// 3. KO and Switch
// ============================================================================

describe('KO and Switch', () => {
  it('defeatActive should mark the current member as defeated', () => {
    const team = threeCharTeam();

    defeatActive(team);

    expect(team.members[0].defeated).toBe(true);
    expect(team.members[1].defeated).toBe(false);
    expect(team.members[2].defeated).toBe(false);
  });

  it('switchToNext should advance to the next alive member', () => {
    const team = threeCharTeam();

    defeatActive(team); // KO member 0
    const found = switchToNext(team);

    expect(found).toBe(true);
    expect(team.activeIndex).toBe(1);
    expect(activeChar(team).id).toBe('iori');
  });

  it('after last member is KOd, team is fully defeated', () => {
    const team = createTeam([mockChar('solo', '单人')]);

    const stillAlive = defeatActive(team);

    expect(stillAlive).toBe(false);
    expect(team.alive).toBe(0);
    // switchToNext on a fully defeated team returns false
    expect(switchToNext(team)).toBe(false);
  });
});

// ============================================================================
// 4. Fighter Spawning
// ============================================================================

describe('Fighter Spawning', () => {
  it('spawnActiveFighter should create a Fighter for the active member', () => {
    const team = threeCharTeam();
    const fighter = spawnActiveFighter(team, 1 as const);

    expect(fighter).toBeDefined();
    expect(fighter.state).toBe(FighterState.IDLE);
  });

  it('Fighter charId should match the active character definition', () => {
    const team = threeCharTeam();
    const fighter = spawnActiveFighter(team, 1 as const);

    expect(fighter.charId).toBe('kyo');

    // Switch to second member
    defeatActive(team);
    switchToNext(team);
    const fighter2 = spawnActiveFighter(team, 1 as const);

    expect(fighter2.charId).toBe('iori');
  });

  it('P1 (facing=1) and P2 (facing=-1) should spawn at different positions', () => {
    const team = threeCharTeam();
    const p1 = spawnActiveFighter(team, 1 as const);
    const p2 = spawnActiveFighter(team, -1 as const);

    // P1 spawns at stage left side (~33%), P2 at right side (~67%)
    expect(p1.x).toBeCloseTo(STAGE_WIDTH * 0.33, 0);
    expect(p2.x).toBeCloseTo(STAGE_WIDTH * 0.67, 0);
    expect(p1.x).toBeLessThan(p2.x);

    // Facing direction is preserved
    expect(p1.facing).toBe(1);
    expect(p2.facing).toBe(-1);
  });
});

// ============================================================================
// 5. Team Display
// ============================================================================

describe('Team Display', () => {
  it('teamOrderString should format members with arrows', () => {
    const team = threeCharTeam();
    const str = teamOrderString(team);

    // Active member (index 0) should have ► prefix
    expect(str).toContain('►草薙京');
    expect(str).toContain('八神庵');
    expect(str).toContain('特瑞');
    expect(str).toContain('→');
  });

  it('KOd members should be wrapped in parentheses', () => {
    const team = threeCharTeam();

    defeatActive(team);
    switchToNext(team);
    const str = teamOrderString(team);

    // Member 0 is defeated → wrapped in parens
    expect(str).toContain('(草薙京)');
    // Member 1 is now active
    expect(str).toContain('►八神庵');
    // Member 2 is still alive but not active — plain name
    expect(str).toContain('特瑞');
  });

  it('active member should have ► marker', () => {
    const team = threeCharTeam();

    // Initially member 0 is active
    expect(teamOrderString(team)).toBe('►草薙京 → 八神庵 → 特瑞');

    // After switching, member 1 is active
    defeatActive(team);
    switchToNext(team);
    expect(teamOrderString(team)).toBe('(草薙京) → ►八神庵 → 特瑞');

    // After switching again, member 2 is active
    defeatActive(team);
    switchToNext(team);
    expect(teamOrderString(team)).toBe('(草薙京) → (八神庵) → ►特瑞');
  });
});
