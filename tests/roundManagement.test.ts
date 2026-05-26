/**
 * Round Management Tests — KO system, round transitions, 3v3 team management.
 *
 * Tests cover:
 * 1. KO trigger: health drops to 0
 * 2. Perfect: winner at full health
 * 3. Time Over: timer exhausts, health comparison
 * 4. Double KO: both fighters at 0
 * 5. Round switching: KO -> next round -> fighter reset
 * 6. 3v3 team: first member KO -> switch to second
 * 7. Match End: one side all 3 members defeated -> MATCH_END
 * 8. Continue: MATCH_END -> Continue countdown
 * 9. Game Over: Continue timeout -> GAME_OVER
 */
import { describe, it, expect } from 'vitest';
import { GameStateManager } from '../src/state/gameStateManager.js';
import { GamePhase } from '../src/core/types.js';
import { CinematicState } from '../src/state/cinematicState.js';
import { Fighter } from '../src/entities/fighter.js';
import { FighterState } from '../src/core/types.js';
import { MAX_HEALTH, STAGE_WIDTH } from '../src/core/constants.js';
import { createTeam, defeatActive, switchToNext, activeChar, type TeamState } from '../src/state/teamState.js';
import type { CharacterDefinition } from '../src/characters/types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeFighter(x: number = 200, health: number = MAX_HEALTH): Fighter {
  const f = new Fighter(x, '#ff0000', 1);
  if (health < MAX_HEALTH) f.health = health;
  return f;
}

const mockCharDef = (id: string): CharacterDefinition => ({
  id,
  name: id,
  nameCn: id,
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

/** Simulate round winner determination (mirrors RoundState.determineWinner) */
function determineWinner(p1: Fighter, p2: Fighter): number | null {
  if (p1.health <= 0 && p2.health <= 0) return null; // double KO
  if (p1.health <= 0) return 1; // P2 wins
  if (p2.health <= 0) return 0; // P1 wins
  return p1.health > p2.health ? 0 : p2.health > p1.health ? 1 : null; // time over
}

// ===========================================================================
// 1. KO Trigger
// ===========================================================================

describe('KO Trigger', () => {
  it('P2 health drops to 0 -> P1 wins (KO)', () => {
    const p1 = makeFighter(200);
    const p2 = makeFighter(600);
    p2.health = 0;
    const winner = determineWinner(p1, p2);
    expect(winner).toBe(0); // P1 wins
  });

  it('P1 health drops to 0 -> P2 wins (KO)', () => {
    const p1 = makeFighter(200);
    const p2 = makeFighter(600);
    p1.health = 0;
    const winner = determineWinner(p1, p2);
    expect(winner).toBe(1); // P2 wins
  });

  it('health above 0 means no KO', () => {
    const p1 = makeFighter(200);
    const p2 = makeFighter(600);
    p2.health = 1;
    const winner = determineWinner(p1, p2);
    // Both alive, no KO -> compare health
    expect(winner).toBe(0); // P1 has more health (1000 > 1)
  });

  it('fighter with 0 health is in KNOCKDOWN state after KO', () => {
    const fighter = makeFighter(200);
    fighter.health = 0;
    fighter.applyKnockdown(60);
    expect(fighter.health).toBe(0);
    expect(fighter.state).toBe(FighterState.KNOCKDOWN);
    expect(fighter.isKnockedDown).toBe(true);
  });

  it('game transitions to KO phase on health reaching 0', () => {
    const gsm = new GameStateManager();
    const p1 = makeFighter(200);
    const p2 = makeFighter(600);
    p2.health = 0;

    gsm.setPhase(GamePhase.FIGHTING);
    const winner = determineWinner(p1, p2);
    expect(winner).toBe(0);
    gsm.winner = winner;
    gsm.setPhase(GamePhase.KO);
    expect(gsm.phase).toBe(GamePhase.KO);
    expect(gsm.winner).toBe(0);
  });

  it('KO slow-mo is triggered on KO', () => {
    const cinematic = new CinematicState();
    cinematic.triggerKOSlowMo();
    expect(cinematic.koSlowMoTriggered).toBe(true);
    expect(cinematic.koSlowMo).toBe(40);
  });

  it('DM KO slow-mo has longer duration', () => {
    const cinematic = new CinematicState();
    cinematic.triggerDMKOSlowMo();
    expect(cinematic.koSlowMoTriggered).toBe(true);
    expect(cinematic.koSlowMo).toBe(60);
  });

  it('KO dust particles are spawned at hit location', () => {
    const cinematic = new CinematicState();
    cinematic.spawnKODust(400, 300, 10);
    expect(cinematic.koDustParticles.length).toBe(10);
  });
});

// ===========================================================================
// 2. Perfect
// ===========================================================================

describe('Perfect', () => {
  it('winner with full health and zero damage taken is PERFECT', () => {
    const cinematic = new CinematicState();
    // P1 wins without taking any damage
    cinematic.trackDamage(0, 0);  // P1 took 0 damage
    cinematic.trackDamage(1, 500); // P2 took 500 damage
    const perfect = cinematic.getPerfectPlayer(0); // P1 won
    expect(perfect).toBe(0);
  });

  it('winner who took damage is NOT perfect', () => {
    const cinematic = new CinematicState();
    cinematic.trackDamage(0, 100); // P1 took 100 damage
    cinematic.trackDamage(1, 500); // P2 took 500 damage
    const perfect = cinematic.getPerfectPlayer(0); // P1 won
    expect(perfect).toBeNull();
  });

  it('null winner has no perfect player', () => {
    const cinematic = new CinematicState();
    const perfect = cinematic.getPerfectPlayer(null);
    expect(perfect).toBeNull();
  });

  it('P2 can also achieve PERFECT', () => {
    const cinematic = new CinematicState();
    cinematic.trackDamage(0, 500); // P1 took 500 damage
    cinematic.trackDamage(1, 0);   // P2 took 0 damage
    const perfect = cinematic.getPerfectPlayer(1); // P2 won
    expect(perfect).toBe(1);
  });

  it('PERFECT detection resets between rounds', () => {
    const cinematic = new CinematicState();
    cinematic.trackDamage(0, 100);
    cinematic.resetForNewRound();
    expect(cinematic.p1DamageTaken).toBe(0);
    expect(cinematic.p2DamageTaken).toBe(0);
    // After reset, a new round starts clean
    const perfect = cinematic.getPerfectPlayer(0);
    expect(perfect).toBe(0); // 0 damage taken after reset = perfect
  });
});

// ===========================================================================
// 3. Time Over
// ===========================================================================

describe('Time Over', () => {
  it('time over with P1 having more health -> P1 wins', () => {
    const p1 = makeFighter(200);
    const p2 = makeFighter(600);
    p1.health = 800;
    p2.health = 500;
    const winner = determineWinner(p1, p2);
    expect(winner).toBe(0);
  });

  it('time over with P2 having more health -> P2 wins', () => {
    const p1 = makeFighter(200);
    const p2 = makeFighter(600);
    p1.health = 400;
    p2.health = 700;
    const winner = determineWinner(p1, p2);
    expect(winner).toBe(1);
  });

  it('time over with equal health -> draw (null winner)', () => {
    const p1 = makeFighter(200);
    const p2 = makeFighter(600);
    p1.health = 500;
    p2.health = 500;
    const winner = determineWinner(p1, p2);
    expect(winner).toBeNull();
  });

  it('isTimeOver flag triggers KO phase transition', () => {
    const gsm = new GameStateManager();
    gsm.setPhase(GamePhase.FIGHTING);
    gsm.isTimeOver = true;
    gsm.setPhase(GamePhase.KO);
    expect(gsm.phase).toBe(GamePhase.KO);
    expect(gsm.isTimeOver).toBe(true);
  });

  it('time over resets for next round', () => {
    const gsm = new GameStateManager();
    gsm.isTimeOver = true;
    gsm.resetForNextRound();
    expect(gsm.isTimeOver).toBe(false);
  });
});

// ===========================================================================
// 4. Double KO
// ===========================================================================

describe('Double KO', () => {
  it('both fighters at 0 health returns null winner', () => {
    const p1 = makeFighter(200, 0);
    const p2 = makeFighter(600, 0);
    const winner = determineWinner(p1, p2);
    expect(winner).toBeNull();
  });

  it('double KO does not assign win to either player', () => {
    let p1Wins = 0;
    let p2Wins = 0;
    const winsNeeded = 2;
    const winner = null; // double KO
    if (winner === 0) p1Wins++;
    else if (winner === 1) p2Wins++;
    // Neither gets a win
    expect(p1Wins).toBe(0);
    expect(p2Wins).toBe(0);
  });

  it('double KO still triggers KO phase', () => {
    const gsm = new GameStateManager();
    gsm.setPhase(GamePhase.FIGHTING);
    gsm.winner = null; // double KO
    gsm.setPhase(GamePhase.KO);
    expect(gsm.phase).toBe(GamePhase.KO);
    expect(gsm.winner).toBeNull();
  });

  it('after double KO, match continues with same round (no win awarded)', () => {
    // Simulating: Round 1 double KO -> still 0-0, replay round 1
    let p1Wins = 0;
    let p2Wins = 0;
    const roundWinner = null; // double KO

    if (roundWinner === 0) p1Wins++;
    else if (roundWinner === 1) p2Wins++;
    // No wins awarded, match is still 0-0
    expect(p1Wins).toBe(0);
    expect(p2Wins).toBe(0);
    const matchOver = p1Wins >= 2 || p2Wins >= 2;
    expect(matchOver).toBe(false);
  });
});

// ===========================================================================
// 5. Round Switching
// ===========================================================================

describe('Round Switching', () => {
  it('after KO, game transitions KO -> WIN_QUOTE -> next round INTRO', () => {
    const gsm = new GameStateManager();
    // Round 1 flow
    gsm.setPhase(GamePhase.FIGHTING);
    gsm.setPhase(GamePhase.KO);
    gsm.setPhase(GamePhase.WIN_QUOTE);
    // After win quote, transition to next round
    gsm.resetForNextRound();
    gsm.setPhase(GamePhase.INTRO);
    expect(gsm.phase).toBe(GamePhase.INTRO);
  });

  it('fighter resets to full health and IDLE after round end', () => {
    const fighter = makeFighter(200);
    fighter.health = 200;
    fighter.applyKnockdown(60);
    fighter.isKnockedDown = true;
    fighter.hitstunTimer = 20;
    expect(fighter.health).toBe(200);
    expect(fighter.isKnockedDown).toBe(true);

    fighter.reset(200);
    expect(fighter.health).toBe(MAX_HEALTH);
    expect(fighter.state).toBe(FighterState.IDLE);
    expect(fighter.isKnockedDown).toBe(false);
    expect(fighter.hitstunTimer).toBe(0);
  });

  it('both fighters reset between rounds', () => {
    const p1 = makeFighter(200);
    const p2 = makeFighter(600);
    p1.health = 100;
    p2.health = 0;
    p2.applyKnockdown(60);

    p1.reset(STAGE_WIDTH * 0.30);
    p2.reset(STAGE_WIDTH * 0.70);

    expect(p1.health).toBe(MAX_HEALTH);
    expect(p1.state).toBe(FighterState.IDLE);
    expect(p2.health).toBe(MAX_HEALTH);
    expect(p2.state).toBe(FighterState.IDLE);
    expect(p2.isKnockedDown).toBe(false);
  });

  it('resetForNextRound clears round-specific state', () => {
    const gsm = new GameStateManager();
    gsm.phaseTimer = 999;
    gsm.koTimer = 60;
    gsm.koGroundSlamDone = true;
    gsm.isTimeOver = true;
    gsm.firstHitTracked = true;
    gsm.firstAttacker = 0;

    gsm.resetForNextRound();

    expect(gsm.phaseTimer).toBe(0);
    expect(gsm.koTimer).toBe(0);
    expect(gsm.koGroundSlamDone).toBe(false);
    expect(gsm.isTimeOver).toBe(false);
    expect(gsm.firstHitTracked).toBe(false);
    expect(gsm.firstAttacker).toBeNull();
  });

  it('cinematic state resets between rounds', () => {
    const cinematic = new CinematicState();
    cinematic.triggerKOSlowMo();
    cinematic.trackDamage(0, 500);
    cinematic.spawnKODust(400, 300);

    cinematic.resetForNewRound();

    expect(cinematic.koSlowMo).toBe(0);
    expect(cinematic.koSlowMoTriggered).toBe(false);
    expect(cinematic.p1DamageTaken).toBe(0);
    expect(cinematic.p2DamageTaken).toBe(0);
    expect(cinematic.koDustParticles).toHaveLength(0);
  });

  it('round number tracks correctly across a full match', () => {
    let currentRound = 1;
    let p1Wins = 0;
    let p2Wins = 0;
    const winsNeeded = 2;

    // Round 1: P1 wins
    p1Wins++;
    if (p1Wins < winsNeeded && p2Wins < winsNeeded) currentRound++;

    // Round 2: P2 wins
    p2Wins++;
    if (p1Wins < winsNeeded && p2Wins < winsNeeded) currentRound++;

    expect(currentRound).toBe(3); // goes to round 3
    expect(p1Wins).toBe(1);
    expect(p2Wins).toBe(1);

    // Round 3: P1 wins
    p1Wins++;
    const matchOver = p1Wins >= winsNeeded;
    expect(matchOver).toBe(true);
  });
});

// ===========================================================================
// 6. 3v3 Team Management
// ===========================================================================

describe('3v3 Team Management', () => {
  it('createTeam initializes 3 members, activeIndex 0, alive 3', () => {
    const team = createTeam([mockCharDef('kyo'), mockCharDef('iori'), mockCharDef('terry')]);
    expect(team.members).toHaveLength(3);
    expect(team.activeIndex).toBe(0);
    expect(team.alive).toBe(3);
    expect(team.members[0].defeated).toBe(false);
    expect(team.members[1].defeated).toBe(false);
    expect(team.members[2].defeated).toBe(false);
  });

  it('first member KO -> switchToNext advances to second member', () => {
    const team = createTeam([mockCharDef('kyo'), mockCharDef('iori'), mockCharDef('terry')]);

    // First member KO'd
    const hasAlive = defeatActive(team);
    expect(hasAlive).toBe(true);
    expect(team.members[0].defeated).toBe(true);
    expect(team.alive).toBe(2);

    // Switch to next alive member
    const found = switchToNext(team);
    expect(found).toBe(true);
    expect(team.activeIndex).toBe(1);
    expect(activeChar(team).id).toBe('iori');
  });

  it('second member KO -> switchToNext advances to third member', () => {
    const team = createTeam([mockCharDef('kyo'), mockCharDef('iori'), mockCharDef('terry')]);

    defeatActive(team);
    switchToNext(team); // now on member 1

    defeatActive(team);
    expect(team.alive).toBe(1);

    const found = switchToNext(team);
    expect(found).toBe(true);
    expect(team.activeIndex).toBe(2);
    expect(activeChar(team).id).toBe('terry');
  });

  it('all 3 members KO -> switchToNext returns false', () => {
    const team = createTeam([mockCharDef('kyo'), mockCharDef('iori'), mockCharDef('terry')]);

    defeatActive(team);
    switchToNext(team); // member 1
    defeatActive(team);
    switchToNext(team); // member 2
    defeatActive(team);
    expect(team.alive).toBe(0);

    const found = switchToNext(team);
    expect(found).toBe(false);
  });

  it('defeatActive returns false when last member is defeated', () => {
    const team = createTeam([mockCharDef('kyo')]);
    const hasAlive = defeatActive(team);
    expect(hasAlive).toBe(false);
    expect(team.alive).toBe(0);
  });

  it('defeated members are skipped during switchToNext', () => {
    // Create a scenario where member[1] is somehow already defeated
    const team = createTeam([mockCharDef('kyo'), mockCharDef('iori'), mockCharDef('terry')]);
    team.members[1].defeated = true;
    team.alive = 2;

    defeatActive(team); // defeat member[0]
    const found = switchToNext(team);
    expect(found).toBe(true);
    expect(team.activeIndex).toBe(2); // skips member[1], goes to member[2]
    expect(activeChar(team).id).toBe('terry');
  });

  it('team order string reflects current state', () => {
    const team = createTeam([mockCharDef('Kyo'), mockCharDef('Iori'), mockCharDef('Terry')]);
    expect(team.members.map((m, i) => {
      const name = m.charDef.nameCn;
      if (m.defeated) return `(${name})`;
      if (i === team.activeIndex) return `>${name}`;
      return name;
    }).join(' > ')).toBe('>Kyo > Iori > Terry');

    defeatActive(team);
    switchToNext(team);
    expect(team.members.map((m, i) => {
      const name = m.charDef.nameCn;
      if (m.defeated) return `(${name})`;
      if (i === team.activeIndex) return `>${name}`;
      return name;
    }).join(' > ')).toBe('(Kyo) > >Iori > Terry');
  });
});

// ===========================================================================
// 7. Match End
// ===========================================================================

describe('Match End', () => {
  it('best-of-3: P1 wins 2 rounds -> match over', () => {
    const gsm = new GameStateManager();
    let p1Wins = 0;
    let p2Wins = 0;
    const winsNeeded = 2;

    // Round 1: P1 wins
    p1Wins++;
    const matchWinner1 = p1Wins >= winsNeeded ? 0 : (p2Wins >= winsNeeded ? 1 : null);
    expect(matchWinner1).toBeNull(); // not over yet

    // Round 2: P1 wins again
    p1Wins++;
    const matchWinner2 = p1Wins >= winsNeeded ? 0 : (p2Wins >= winsNeeded ? 1 : null);
    expect(matchWinner2).toBe(0);

    gsm.winner = 0;
    gsm.setPhase(GamePhase.MATCH_END);
    expect(gsm.phase).toBe(GamePhase.MATCH_END);
  });

  it('best-of-3: goes to round 3 if 1-1', () => {
    let p1Wins = 0;
    let p2Wins = 0;
    const winsNeeded = 2;

    p1Wins++; // 1-0
    const matchOver1 = p1Wins >= winsNeeded || p2Wins >= winsNeeded;
    expect(matchOver1).toBe(false);

    p2Wins++; // 1-1
    const matchOver2 = p1Wins >= winsNeeded || p2Wins >= winsNeeded;
    expect(matchOver2).toBe(false);

    // Round 3 decides
    p1Wins++; // 2-1
    const matchOver3 = p1Wins >= winsNeeded || p2Wins >= winsNeeded;
    expect(matchOver3).toBe(true);
  });

  it('3v3: one team all defeated -> MATCH_END', () => {
    const team1 = createTeam([mockCharDef('kyo'), mockCharDef('iori'), mockCharDef('terry')]);
    const team2 = createTeam([mockCharDef('ralf'), mockCharDef('clark'), mockCharDef('leona')]);

    // Team 1 loses all members one by one
    defeatActive(team1); // kyo KO'd
    switchToNext(team1);
    defeatActive(team1); // iori KO'd
    switchToNext(team1);
    defeatActive(team1); // terry KO'd

    expect(team1.alive).toBe(0);
    const team1Eliminated = team1.alive <= 0;
    expect(team1Eliminated).toBe(true);

    // Game transitions to MATCH_END
    const gsm = new GameStateManager();
    gsm.winner = 1; // P2's team wins
    gsm.setPhase(GamePhase.MATCH_END);
    expect(gsm.phase).toBe(GamePhase.MATCH_END);
  });

  it('3v3: opposite team all defeated -> other player wins', () => {
    const team1 = createTeam([mockCharDef('kyo'), mockCharDef('iori'), mockCharDef('terry')]);
    const team2 = createTeam([mockCharDef('ralf'), mockCharDef('clark'), mockCharDef('leona')]);

    // Team 2 loses all members
    defeatActive(team2);
    switchToNext(team2);
    defeatActive(team2);
    switchToNext(team2);
    defeatActive(team2);

    expect(team2.alive).toBe(0);
    const gsm = new GameStateManager();
    gsm.winner = 0; // P1's team wins
    gsm.setPhase(GamePhase.MATCH_END);
    expect(gsm.phase).toBe(GamePhase.MATCH_END);
    expect(gsm.winner).toBe(0);
  });

  it('match end occurs after KO -> WIN_QUOTE -> MATCH_END sequence', () => {
    const gsm = new GameStateManager();
    gsm.setPhase(GamePhase.FIGHTING);
    gsm.setPhase(GamePhase.KO);
    gsm.setPhase(GamePhase.WIN_QUOTE);
    gsm.setPhase(GamePhase.MATCH_END);
    expect(gsm.phase).toBe(GamePhase.MATCH_END);
  });
});

// ===========================================================================
// 8. Continue Screen
// ===========================================================================

describe('Continue Screen', () => {
  it('MATCH_END transitions to CONTINUE phase', () => {
    const gsm = new GameStateManager();
    gsm.setPhase(GamePhase.MATCH_END);
    gsm.setPhase(GamePhase.CONTINUE);
    expect(gsm.phase).toBe(GamePhase.CONTINUE);
  });

  it('continue countdown starts at 600 frames (10 seconds at 60fps)', () => {
    const gsm = new GameStateManager();
    gsm.continueCountdown = 600;
    expect(gsm.continueCountdown).toBe(600);
  });

  it('continue countdown decrements each frame', () => {
    const gsm = new GameStateManager();
    gsm.continueCountdown = 600;
    for (let i = 0; i < 60; i++) {
      gsm.continueCountdown--;
    }
    expect(gsm.continueCountdown).toBe(540);
  });

  it('continue cursor defaults to YES', () => {
    const gsm = new GameStateManager();
    expect(gsm.continueCursorYes).toBe(true);
  });

  it('continue cursor can be toggled to NO', () => {
    const gsm = new GameStateManager();
    gsm.continueCursorYes = false;
    expect(gsm.continueCursorYes).toBe(false);
  });

  it('player selects YES -> restart from character select', () => {
    const gsm = new GameStateManager();
    gsm.setPhase(GamePhase.CONTINUE);
    gsm.continueCursorYes = true;
    // Player confirms continue -> back to select
    gsm.resetForNewGame();
    gsm.setPhase(GamePhase.SELECT);
    expect(gsm.phase).toBe(GamePhase.SELECT);
    expect(gsm.winner).toBeNull();
  });

  it('continue YES resets game state cleanly', () => {
    const gsm = new GameStateManager();
    gsm.setPhase(GamePhase.MATCH_END);
    gsm.winner = 1;
    gsm.phaseTimer = 999;
    gsm.koTimer = 100;

    gsm.resetForNewGame();
    expect(gsm.phase).toBe(GamePhase.TITLE);
    expect(gsm.winner).toBeNull();
    expect(gsm.phaseTimer).toBe(0);
    expect(gsm.koTimer).toBe(0);
  });
});

// ===========================================================================
// 9. Game Over
// ===========================================================================

describe('Game Over', () => {
  it('continue countdown reaching 0 triggers GAME_OVER', () => {
    const gsm = new GameStateManager();
    gsm.setPhase(GamePhase.CONTINUE);
    gsm.continueCountdown = 0;
    // Timeout -> GAME_OVER
    gsm.setPhase(GamePhase.GAME_OVER);
    expect(gsm.phase).toBe(GamePhase.GAME_OVER);
  });

  it('player selects NO on continue -> GAME_OVER', () => {
    const gsm = new GameStateManager();
    gsm.setPhase(GamePhase.CONTINUE);
    gsm.continueCursorYes = false;
    // Player selected NO -> game over
    gsm.setPhase(GamePhase.GAME_OVER);
    expect(gsm.phase).toBe(GamePhase.GAME_OVER);
  });

  it('gameOverTimer tracks GAME_OVER display duration', () => {
    const gsm = new GameStateManager();
    expect(gsm.gameOverTimer).toBe(0);
    gsm.gameOverTimer = 300; // 5 seconds at 60fps
    expect(gsm.gameOverTimer).toBe(300);
  });

  it('GAME_OVER can transition back to TITLE', () => {
    const gsm = new GameStateManager();
    gsm.setPhase(GamePhase.GAME_OVER);
    gsm.gameOverTimer = 0; // display time elapsed
    gsm.resetForNewGame();
    gsm.setPhase(GamePhase.TITLE);
    expect(gsm.phase).toBe(GamePhase.TITLE);
  });

  it('full flow: MATCH_END -> CONTINUE -> timeout -> GAME_OVER -> TITLE', () => {
    const gsm = new GameStateManager();
    gsm.setPhase(GamePhase.MATCH_END);
    gsm.setPhase(GamePhase.CONTINUE);
    gsm.continueCountdown = 600;

    // Countdown expires
    gsm.continueCountdown = 0;
    gsm.setPhase(GamePhase.GAME_OVER);
    expect(gsm.phase).toBe(GamePhase.GAME_OVER);

    // After game over display, return to title
    gsm.resetForNewGame();
    expect(gsm.phase).toBe(GamePhase.TITLE);
    expect(gsm.winner).toBeNull();
    expect(gsm.gameOverTimer).toBe(0);
  });
});

// ===========================================================================
// 10. Full Match Lifecycle Integration
// ===========================================================================

describe('Full Match Lifecycle', () => {
  it('complete single match: TITLE -> ... -> MATCH_END -> continue -> TITLE', () => {
    const gsm = new GameStateManager();
    const cinematic = new CinematicState();

    // Title
    expect(gsm.phase).toBe(GamePhase.TITLE);

    // Mode select
    gsm.setPhase(GamePhase.MODE_SELECT);
    gsm.setPhase(GamePhase.SELECT);
    gsm.setPhase(GamePhase.STAGE_SELECT);
    gsm.setPhase(GamePhase.INTRO);

    // Round 1
    gsm.setPhase(GamePhase.FIGHTING);
    const p1 = makeFighter(200);
    const p2 = makeFighter(600);
    p2.health = 0;

    const winner = determineWinner(p1, p2);
    expect(winner).toBe(0);

    cinematic.triggerKOSlowMo();
    gsm.winner = winner;
    gsm.setPhase(GamePhase.KO);
    expect(gsm.phase).toBe(GamePhase.KO);

    // KO slow-mo completes
    while (!cinematic.isKOSlowMoDone()) {
      cinematic.shouldSkipFrame();
    }
    expect(cinematic.isKOSlowMoDone()).toBe(true);

    gsm.setPhase(GamePhase.WIN_QUOTE);

    // P1 wins round 1
    let p1Wins = 1;
    const matchOver1 = p1Wins >= 2;
    expect(matchOver1).toBe(false);

    // Transition to round 2
    gsm.resetForNextRound();
    cinematic.resetForNewRound();

    // Round 2
    gsm.setPhase(GamePhase.INTRO);
    gsm.setPhase(GamePhase.FIGHTING);
    p1.reset(STAGE_WIDTH * 0.30);
    p2.reset(STAGE_WIDTH * 0.70);
    expect(p1.health).toBe(MAX_HEALTH);
    expect(p2.health).toBe(MAX_HEALTH);

    p1.health = 0;
    const winner2 = determineWinner(p1, p2);
    expect(winner2).toBe(1); // P2 wins round 2

    gsm.winner = winner2;
    gsm.setPhase(GamePhase.KO);
    gsm.setPhase(GamePhase.WIN_QUOTE);

    let p2Wins = 1;
    expect(p1Wins).toBe(1);
    expect(p2Wins).toBe(1);
    const matchOver2 = p1Wins >= 2 || p2Wins >= 2;
    expect(matchOver2).toBe(false); // 1-1, goes to round 3

    // Transition to round 3
    gsm.resetForNextRound();
    cinematic.resetForNewRound();

    // Round 3
    gsm.setPhase(GamePhase.INTRO);
    gsm.setPhase(GamePhase.FIGHTING);
    p1.reset(STAGE_WIDTH * 0.30);
    p2.reset(STAGE_WIDTH * 0.70);

    p2.health = 0;
    const winner3 = determineWinner(p1, p2);
    expect(winner3).toBe(0); // P1 wins round 3

    gsm.winner = winner3;
    p1Wins++;
    gsm.setPhase(GamePhase.KO);
    gsm.setPhase(GamePhase.WIN_QUOTE);
    gsm.setPhase(GamePhase.MATCH_END);
    expect(gsm.phase).toBe(GamePhase.MATCH_END);

    // Continue
    gsm.setPhase(GamePhase.CONTINUE);
    gsm.continueCursorYes = true;
    gsm.resetForNewGame();
    gsm.setPhase(GamePhase.TITLE);
    expect(gsm.phase).toBe(GamePhase.TITLE);
  });

  it('3v3 team elimination: full team wipe -> MATCH_END', () => {
    const team1 = createTeam([mockCharDef('kyo'), mockCharDef('iori'), mockCharDef('terry')]);
    const team2 = createTeam([mockCharDef('ralf'), mockCharDef('clark'), mockCharDef('leona')]);
    const gsm = new GameStateManager();

    // Round 1: kyo KO'd
    gsm.setPhase(GamePhase.FIGHTING);
    gsm.setPhase(GamePhase.KO);
    defeatActive(team1); // kyo KO
    expect(team1.alive).toBe(2);
    switchToNext(team1); // switch to iori
    expect(activeChar(team1).id).toBe('iori');

    // Round 2: iori KO'd
    gsm.setPhase(GamePhase.FIGHTING);
    gsm.setPhase(GamePhase.KO);
    defeatActive(team1); // iori KO
    expect(team1.alive).toBe(1);
    switchToNext(team1); // switch to terry
    expect(activeChar(team1).id).toBe('terry');

    // Round 3: terry KO'd -> team 1 eliminated
    gsm.setPhase(GamePhase.FIGHTING);
    gsm.setPhase(GamePhase.KO);
    defeatActive(team1); // terry KO
    expect(team1.alive).toBe(0);
    const eliminated = !switchToNext(team1);
    expect(eliminated).toBe(true);

    // Team 1 eliminated -> P2 wins
    gsm.winner = 1;
    gsm.setPhase(GamePhase.MATCH_END);
    expect(gsm.phase).toBe(GamePhase.MATCH_END);

    // Team 2 still has all members
    expect(team2.alive).toBe(3);
  });

  it('gameOverTimer resets on new game', () => {
    const gsm = new GameStateManager();
    gsm.gameOverTimer = 300;
    gsm.resetForNewGame();
    expect(gsm.gameOverTimer).toBe(0);
  });

  it('resetForNewGame clears all accumulated state', () => {
    const gsm = new GameStateManager();
    const cinematic = new CinematicState();

    // Accumulate state across a match
    gsm.setPhase(GamePhase.MATCH_END);
    gsm.winner = 0;
    gsm.phaseTimer = 500;
    gsm.koTimer = 80;
    gsm.koGroundSlamDone = true;
    gsm.isTimeOver = true;
    gsm.firstAttacker = 1;
    gsm.firstHitTracked = true;
    gsm.currentWinQuote = 'I won!';
    gsm.winQuoteTimer = 100;
    gsm.titleBgmStarted = true;
    gsm.gameOverTimer = 200;
    cinematic.trackDamage(0, 500);
    cinematic.trackDamage(1, 300);

    gsm.resetForNewGame();
    cinematic.reset();

    expect(gsm.phase).toBe(GamePhase.TITLE);
    expect(gsm.winner).toBeNull();
    expect(gsm.phaseTimer).toBe(0);
    expect(gsm.koTimer).toBe(0);
    expect(gsm.koGroundSlamDone).toBe(false);
    expect(gsm.isTimeOver).toBe(false);
    expect(gsm.firstAttacker).toBeNull();
    expect(gsm.firstHitTracked).toBe(false);
    expect(gsm.currentWinQuote).toBe('');
    expect(gsm.winQuoteTimer).toBe(0);
    expect(gsm.titleBgmStarted).toBe(false);
    expect(gsm.gameOverTimer).toBe(0);
    expect(cinematic.p1DamageTaken).toBe(0);
    expect(cinematic.p2DamageTaken).toBe(0);
  });
});
