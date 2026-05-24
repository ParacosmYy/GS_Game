/**
 * Team State — 3v3 团队模式状态管理
 *
 * KOF2002: 每方3个角色，KO后切换下一个，能量槽跨回合保留。
 * 一方3个角色全部KO后比赛结束。
 */
import type { CharacterDefinition } from '../characters/types.js';
import { Fighter } from '../entities/fighter.js';
import { FighterState, type Direction } from '../core/types.js';
import { STAGE_WIDTH } from '../core/constants.js';

export interface TeamMember {
  charDef: CharacterDefinition;
  defeated: boolean;
}

export interface TeamState {
  members: TeamMember[];
  activeIndex: number;
  alive: number;
}

export function createTeam(charDefs: CharacterDefinition[]): TeamState {
  const members: TeamMember[] = charDefs.map((def) => ({
    charDef: def,
    defeated: false,
  }));
  return { members, activeIndex: 0, alive: members.length };
}

/** Get the currently active character definition */
export function activeChar(team: TeamState): CharacterDefinition {
  return team.members[team.activeIndex].charDef;
}

/** Mark the current member as defeated, return true if team still has alive members */
export function defeatActive(team: TeamState): boolean {
  team.members[team.activeIndex].defeated = true;
  team.alive--;
  return team.alive > 0;
}

/** Switch to the next alive member, return true if a next member exists */
export function switchToNext(team: TeamState): boolean {
  for (let i = team.activeIndex + 1; i < team.members.length; i++) {
    if (!team.members[i].defeated) {
      team.activeIndex = i;
      return true;
    }
  }
  return false;
}

/** Create a Fighter for the active team member */
export function spawnActiveFighter(team: TeamState, facing: Direction): Fighter {
  const def = activeChar(team);
  const spawnX = facing === 1 ? STAGE_WIDTH * 0.33 : STAGE_WIDTH * 0.67;
  const f = new Fighter(spawnX, def.color, facing);
  f.charId = def.id;
  f.state = FighterState.IDLE;
  return f;
}

/** Get team order display string (e.g., "Kyo → Iori → Terry") */
export function teamOrderString(team: TeamState): string {
  return team.members.map((m, i) => {
    const name = m.charDef.nameCn;
    if (m.defeated) return `(${name})`;
    if (i === team.activeIndex) return `►${name}`;
    return name;
  }).join(' → ');
}
