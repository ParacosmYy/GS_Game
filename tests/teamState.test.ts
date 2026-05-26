import { describe, it, expect } from 'vitest';
import {
  createTeam,
  activeChar,
  defeatActive,
  switchToNext,
  teamOrderString,
} from '../src/state/teamState.js';
import type { CharacterDefinition } from '../src/characters/types.js';

function makeCharDef(id: string, nameCn: string): CharacterDefinition {
  return { id, nameCn, color: '#fff' } as CharacterDefinition;
}

describe('teamState', () => {
  const chars = [
    makeCharDef('kyo', '草薙京'),
    makeCharDef('iori', '八神庵'),
    makeCharDef('terry', '特瑞'),
  ];

  describe('createTeam', () => {
    it('creates team with correct member count', () => {
      const team = createTeam(chars);
      expect(team.members.length).toBe(3);
      expect(team.activeIndex).toBe(0);
      expect(team.alive).toBe(3);
    });

    it('all members start not defeated', () => {
      const team = createTeam(chars);
      expect(team.members.every(m => !m.defeated)).toBe(true);
    });

    it('empty team has 0 members', () => {
      const team = createTeam([]);
      expect(team.members.length).toBe(0);
      expect(team.alive).toBe(0);
    });
  });

  describe('activeChar', () => {
    it('returns first member by default', () => {
      const team = createTeam(chars);
      expect(activeChar(team).id).toBe('kyo');
    });
  });

  describe('defeatActive', () => {
    it('marks current member defeated and decrements alive', () => {
      const team = createTeam(chars);
      const stillAlive = defeatActive(team);
      expect(stillAlive).toBe(true);
      expect(team.members[0].defeated).toBe(true);
      expect(team.alive).toBe(2);
    });

    it('returns false when last member defeated', () => {
      const team = createTeam([makeCharDef('ryo', '坂崎亮')]);
      expect(defeatActive(team)).toBe(false);
      expect(team.alive).toBe(0);
    });
  });

  describe('switchToNext', () => {
    it('switches to next alive member', () => {
      const team = createTeam(chars);
      defeatActive(team); // defeat kyo
      const found = switchToNext(team);
      expect(found).toBe(true);
      expect(team.activeIndex).toBe(1);
      expect(activeChar(team).id).toBe('iori');
    });

    it('skips defeated members', () => {
      const team = createTeam(chars);
      defeatActive(team); // defeat kyo
      switchToNext(team); // now at iori
      defeatActive(team); // defeat iori
      const found = switchToNext(team);
      expect(found).toBe(true);
      expect(team.activeIndex).toBe(2);
      expect(activeChar(team).id).toBe('terry');
    });

    it('returns false when no next member', () => {
      const team = createTeam(chars);
      defeatActive(team);
      switchToNext(team);
      defeatActive(team);
      switchToNext(team);
      defeatActive(team);
      expect(switchToNext(team)).toBe(false);
    });
  });

  describe('teamOrderString', () => {
    it('formats team order with arrows', () => {
      const team = createTeam(chars);
      const str = teamOrderString(team);
      expect(str).toContain('草薙京');
      expect(str).toContain('八神庵');
      expect(str).toContain('特瑞');
      expect(str).toContain('→');
    });

    it('marks active member with ►', () => {
      const team = createTeam(chars);
      const str = teamOrderString(team);
      expect(str).toContain('►草薙京');
    });

    it('marks defeated member with parentheses', () => {
      const team = createTeam(chars);
      defeatActive(team);
      const str = teamOrderString(team);
      expect(str).toContain('(草薙京)');
    });
  });
});
