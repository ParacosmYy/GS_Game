/**
 * Arcade utilities — extracted from main.ts
 * Difficulty ramp, rival mapping, opponent generation, win quote selection
 */
import { ROSTER } from '../characters/index.js';
import { gameRandomInt } from '../core/prng.js';
import type { CharacterDefinition } from '../characters/types.js';

/** KOF2002-style rival mapping — each character's fixed final-stage rival */
export const RIVAL_MAP: Record<string, string> = {
  kyo: 'iori',
  iori: 'kyo',
  ryo: 'robert',
  robert: 'ryo',
  terry: 'andy',
  andy: 'terry',
  joe: 'terry',
  kim: 'chang',
  chang: 'kim',
  choi: 'kim',
  leona: 'ralf',
  ralf: 'clark',
  clark: 'ralf',
  athena: 'mai',
  mai: 'andy',
  kdash: 'kula',
  kula: 'kdash',
  yashiro: 'chris',
  shermie: 'yashiro',
  chris: 'yashiro',
  mature: 'vice',
  vice: 'mature',
  billy: 'yamazaki',
  yamazaki: 'billy',
  mary: 'terry',
  xiangfei: 'athena',
  kasumi: 'mai',
  kfm: 'ryo',
};

/**
 * KOF2002-style arcade difficulty ramp: difficulty increases per stage.
 *  Base difficulty from options (0=easy, 1=normal, 2=hard) → scalar 0..1.
 *  Each stage adds ramp up to a max of 0.95.
 *  Final rival stage gets an extra 0.1 spike for boss intensity.
 */
export function arcadeDifficulty(base: number, stageIndex: number, totalStages: number): number {
  const baseScalar = base === 0 ? 0.3 : base === 2 ? 0.7 : 0.5;
  const ramp = totalStages > 1 ? (stageIndex / (totalStages - 1)) * 0.3 : 0;
  const rivalSpike = stageIndex === totalStages - 1 ? 0.1 : 0;
  return Math.min(0.98, baseScalar + ramp + rivalSpike);
}

/** Generate opponent queue for arcade mode with rival as final opponent */
export function generateArcadeOpponents(p1CharId: string): CharacterDefinition[] {
  const available = ROSTER.filter(c => c.id !== p1CharId);
  const rivalId = RIVAL_MAP[p1CharId];
  const rival = rivalId ? available.find(c => c.id === rivalId) : undefined;

  const rest = rival ? available.filter(c => c.id !== rivalId) : available;

  // Fisher-Yates shuffle the non-rival opponents
  for (let i = rest.length - 1; i > 0; i--) {
    const j = gameRandomInt(i + 1);
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }

  // Place rival as final opponent (KOF tradition)
  if (rival) {
    rest.push(rival);
  }
  return rest;
}

interface WinQuoteFighter {
  charId: string;
}

export function pickWinQuote(
  winner: number | null,
  p1: WinQuoteFighter,
  p2: WinQuoteFighter,
): string {
  if (winner === null) return '';
  const fighter = winner === 0 ? p1 : p2;
  const loser = winner === 0 ? p2 : p1;
  const charDef = ROSTER.find(c => c.id === fighter.charId);
  if (!charDef || !charDef.winQuotes.length) return '';
  if (charDef.rivalWinQuotes && loser.charId in charDef.rivalWinQuotes) {
    const rivalQuotes = charDef.rivalWinQuotes[loser.charId];
    if (rivalQuotes.length > 0) {
      return rivalQuotes[gameRandomInt(rivalQuotes.length)];
    }
  }
  return charDef.winQuotes[gameRandomInt(charDef.winQuotes.length)];
}
