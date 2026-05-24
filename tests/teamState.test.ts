import { describe, it, expect } from 'vitest';
import { createTeam, activeChar, defeatActive, switchToNext, teamOrderString } from '../src/state/teamState.js';
import type { CharacterDefinition } from '../src/characters/types.js';

const mockChar = (id: string, name: string): CharacterDefinition => ({
  id,
  name,
  nameCn: name,
  color: '#ff0000',
  accentColor: '#aa0000',
  specialColor: '#ff4400',
  specialGlow: '#ff6600',
  portrait: '',
  stats: { walkSpeed: 4, runSpeed: 7, jumpVelocity: -14, hopVelocity: -10, hyperJumpVelocity: -17, maxHealth: 1000, pushWidth: 60, jumpForwardSpeed: 5 },
  poses: {},
  routeSpecial: () => null,
  routeNormal: () => null,
  routeRekkaFollowup: () => null,
  onAttackActive: () => false,
  getRekkaChain: () => null,
  isCommandThrow: () => false,
  getCounterConfig: () => null,
});

describe('TeamState', () => {
  it('createTeam should create a team with correct members', () => {
    const chars = [mockChar('a', 'A'), mockChar('b', 'B'), mockChar('c', 'C')];
    const team = createTeam(chars);
    expect(team.members).toHaveLength(3);
    expect(team.activeIndex).toBe(0);
    expect(team.alive).toBe(3);
    expect(team.members[0].defeated).toBe(false);
    expect(team.members[1].defeated).toBe(false);
    expect(team.members[2].defeated).toBe(false);
  });

  it('activeChar should return the currently active character', () => {
    const chars = [mockChar('a', 'A'), mockChar('b', 'B'), mockChar('c', 'C')];
    const team = createTeam(chars);
    expect(activeChar(team).id).toBe('a');
  });

  it('defeatActive should mark member defeated and decrement alive', () => {
    const chars = [mockChar('a', 'A'), mockChar('b', 'B'), mockChar('c', 'C')];
    const team = createTeam(chars);
    const hasAlive = defeatActive(team);
    expect(hasAlive).toBe(true);
    expect(team.members[0].defeated).toBe(true);
    expect(team.alive).toBe(2);
  });

  it('defeatActive should return false when last member defeated', () => {
    const chars = [mockChar('a', 'A')];
    const team = createTeam(chars);
    const hasAlive = defeatActive(team);
    expect(hasAlive).toBe(false);
    expect(team.alive).toBe(0);
  });

  it('switchToNext should advance to next alive member', () => {
    const chars = [mockChar('a', 'A'), mockChar('b', 'B'), mockChar('c', 'C')];
    const team = createTeam(chars);
    defeatActive(team);
    const found = switchToNext(team);
    expect(found).toBe(true);
    expect(team.activeIndex).toBe(1);
    expect(activeChar(team).id).toBe('b');
  });

  it('switchToNext should skip defeated members', () => {
    const chars = [mockChar('a', 'A'), mockChar('b', 'B'), mockChar('c', 'C')];
    const team = createTeam(chars);
    defeatActive(team);
    // Defeat member 1 too
    switchToNext(team);
    defeatActive(team);
    // Now switch to member 2
    const found = switchToNext(team);
    expect(found).toBe(true);
    expect(team.activeIndex).toBe(2);
    expect(activeChar(team).id).toBe('c');
  });

  it('switchToNext should return false when no alive members left', () => {
    const chars = [mockChar('a', 'A'), mockChar('b', 'B')];
    const team = createTeam(chars);
    defeatActive(team);
    switchToNext(team);
    defeatActive(team);
    const found = switchToNext(team);
    expect(found).toBe(false);
  });

  it('teamOrderString should show correct order with markers', () => {
    const chars = [mockChar('a', 'A'), mockChar('b', 'B'), mockChar('c', 'C')];
    const team = createTeam(chars);
    expect(teamOrderString(team)).toBe('►A → B → C');
    defeatActive(team);
    switchToNext(team);
    expect(teamOrderString(team)).toBe('(A) → ►B → C');
  });
});
