import { describe, it, expect } from 'vitest';
import { createTeam, activeChar, defeatActive, switchToNext, teamOrderString } from '../src/state/teamState.js';
import { RyoDef } from '../src/characters/ryo.js';
import { KyoDef } from '../src/characters/kyo.js';
import { IoriDef } from '../src/characters/iori.js';

describe('teamState', () => {
  const team = createTeam([RyoDef, KyoDef, IoriDef]);

  it('createTeam returns valid team with 3 members', () => {
    expect(team.members.length).toBe(3);
    expect(team.activeIndex).toBe(0);
  });
  it('activeChar returns first member initially', () => {
    expect(activeChar(team).id).toBe('ryo');
  });
  it('defeatActive marks active as defeated', () => {
    const result = defeatActive(team);
    expect(result).toBe(true);
    expect(team.members[0].defeated).toBe(true);
  });
  it('switchToNext moves to next member', () => {
    const result = switchToNext(team);
    expect(result).toBe(true);
    expect(team.activeIndex).toBe(1);
    expect(activeChar(team).id).toBe('kyo');
  });
  it('teamOrderString returns non-empty string', () => {
    const str = teamOrderString(team);
    expect(typeof str).toBe('string');
    expect(str.length).toBeGreaterThan(0);
  });
});
