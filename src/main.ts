/**
 * KOF 2002 — Entry point
 * Pure initialization + game loop. All logic delegated to focused modules.
 */
import { GameLoop } from './core/gameLoop.js';
import { Camera } from './core/camera.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, STAGE_WIDTH, STAGE_GROUND_Y, KO_DISPLAY_TIME, MAX_STOCKS, METER_PER_STOCK, FRAME_DATA } from './core/constants.js';
import { GamePhase, FighterState } from './core/types.js';
import type { PowerGauge, MaxModeState } from './core/types.js';
import { InputManager, CommandBuffer, resolveInput, getDirectionInput } from './input/index.js';
import { Fighter } from './entities/fighter.js';
import { Projectile } from './entities/projectile.js';
import { FighterController, resolvePushbox } from './entities/fighterController.js';
import { CombatSystem } from './combat/combatSystem.js';
import { createPowerGauge, createMaxMode, tickMaxMode, tickAutoMeter, gainMeterOnHit } from './combat/meter.js';
import { Renderer } from './rendering/renderer.js';
import { VFXSystem, ScreenShake, ScreenFlash } from './rendering/vfx.js';
import { cycleStage, setStage, getStage, type StageId } from './rendering/stage.js';
import { drawVictoryPose } from './rendering/skeletalFighter.js';
import type { TeamDisplayInfo } from './rendering/hud.js';
import { ROSTER } from './characters/index.js';
import { SpriteManager, SpriteRenderer } from './rendering/spriteRenderer.js';
import { generatePlaceholderSpritesheet } from './rendering/placeholderSprites.js';
import { CinematicState } from './state/cinematicState.js';
import { SelectState } from './state/selectState.js';
import { RoundState } from './state/roundState.js';
import { DMManager } from './combat/dmManager.js';
import { createHitCallback, triggerKOGroundEffect } from './combat/hitCallback.js';
import { initAudio, playKO, playVictoryFanfare, playMAXActivation, playPerfect, playThrowEscape, playFight, playRoll, playCancel, playQuickStand } from './audio/sampler.js';
import { createTeam, defeatActive, switchToNext, activeChar, teamOrderString, type TeamState } from './state/teamState.js';
import { resolveSimplified } from './input/simplifiedInput.js';
import { bgm } from './audio/bgm.js';
import { announcer } from './audio/announcer.js';
import { SimpleAI } from './ai/simpleAI.js';
import { updateMovementVfx } from './state/movementVfx.js';

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// ===== Systems =====
const camera = new Camera();
const inputManager = new InputManager();
const combatSystem = new CombatSystem(inputManager);
const renderer = new Renderer(ctx);
const vfx = new VFXSystem();

// ===== Sprite System =====
const spriteManager = new SpriteManager();
const spriteRenderer = new SpriteRenderer(spriteManager);
// 注册所有角色的占位精灵图 (真实精灵图加载后将替换)
for (const char of ROSTER) {
  const sheet = generatePlaceholderSpritesheet(char.color, char.id);
  spriteManager.register(char.id, '', sheet.animations);
  const asset = spriteManager.get(char.id);
  if (asset) { asset.image = sheet.image; asset.loaded = true; }
}
renderer.setSpriteRenderer(spriteRenderer);
const screenShake = new ScreenShake();
const screenFlash = new ScreenFlash();

// ===== Entities =====
const p1 = new Fighter(STAGE_WIDTH * 0.33, ROSTER[0].color, 1);
const p2 = new Fighter(STAGE_WIDTH * 0.67, ROSTER[1].color, -1);
const projectiles: Projectile[] = [];
const tickRef = { value: 0 };
const p1Cmd = new CommandBuffer();
const p2Cmd = new CommandBuffer();
const p1Ctrl = new FighterController(p1, 0, p1Cmd, vfx, projectiles, tickRef, ROSTER[0]);
const p2Ctrl = new FighterController(p2, 1, p2Cmd, vfx, projectiles, tickRef, ROSTER[1]);
p1Ctrl.setOpponent(p2);
p2Ctrl.setOpponent(p1);
combatSystem.defenderControllers = [p1Ctrl, p2Ctrl];
const gauges: [PowerGauge, PowerGauge] = [createPowerGauge(), createPowerGauge()];
const maxModes: [MaxModeState, MaxModeState] = [createMaxMode(), createMaxMode()];
p1Ctrl.setGauge(gauges[0]);
p2Ctrl.setGauge(gauges[1]);
p1Ctrl.setMaxMode(maxModes[0]);
p2Ctrl.setMaxMode(maxModes[1]);

// ===== State modules =====
const cinematic = new CinematicState();
const select = new SelectState(p1Ctrl, p2Ctrl, p1, p2, p2Cmd);
const rounds = new RoundState({ p1, p2, p1Cmd, p2Cmd, combatSystem, projectiles, vfx, cinematic, gauges, maxModes, tickRef });
const dmMgr = new DMManager({ gauges, maxModes, cinematic, vfx, screenShake, fighters: [p1, p2] });
const onHit = createHitCallback({ fighters: [p1, p2], vfx, screenShake, screenFlash, gauges, cinematic, combatSystem });
combatSystem.onThrowEscape = (_attacker, defender, hitX, hitY) => {
  vfx.spawnThrowEscapeSparks(hitX, hitY); vfx.spawnTechText(hitX, hitY - 40);
  screenShake.trigger(6, 8); screenFlash.trigger('#aaddff', 0.1, 3); playThrowEscape();
  const atkIdx = _attacker === p1 ? 0 : 1;
  const defIdx = defender === p1 ? 0 : 1;
  gauges[atkIdx].meter = Math.min(gauges[atkIdx].meter + 8, MAX_STOCKS * METER_PER_STOCK);
  gauges[defIdx].meter = Math.min(gauges[defIdx].meter + 8, MAX_STOCKS * METER_PER_STOCK);
};
combatSystem.onGuardCrush = (fighter, hitX, hitY) => {
  vfx.spawnGuardCrushSparks(hitX, hitY); vfx.spawnGuardCrushText(hitX, hitY - 60); vfx.spawnHeavyDust(fighter.x, fighter.y, 14);
  screenFlash.trigger('#ff4444', 0.3, 12); screenShake.trigger(12, 15);
};

// ===== Game state =====
let phase: GamePhase = GamePhase.TITLE;
let phaseTimer = 0;
let koTimer = 0;
let koGroundSlamDone = false;
let winner: number | null = null;
let continueCountdown = 0;
const CONTINUE_DURATION = 600; // 10秒倒计时
let continueCursorYes = true; // Continue画面光标
let modeSelectCursor = 0; // 模式选择光标
let isTrainingMode = false; // 训练模式标志
let currentWinQuote = '';
let firstAttacker: number | null = null;

function pickWinQuote(w: number | null): string {
  if (w === null) return '';
  const fighter = w === 0 ? p1 : p2;
  const charDef = ROSTER.find(c => c.id === fighter.charId);
  if (!charDef || !charDef.winQuotes.length) return '';
  return charDef.winQuotes[Math.floor(Math.random() * charDef.winQuotes.length)];
}
let debugMode = false;
let simplifiedMode = false; // Tab to toggle
let modeIndicatorTimer = 0;
let stageIndicatorTimer = 0;
let isTimeOver = false;
let p2AI: InstanceType<typeof import('./ai/simpleAI.js').SimpleAI> | null = null;
const INTRO_DURATION = 120;
let p1Team: TeamState | null = null;
let p2Team: TeamState | null = null;
let teamMode = false; // 3v3 team mode, enabled via mode select
let p1DelayedHealth = p1.maxHealth;
let p2DelayedHealth = p2.maxHealth;
let firstHitTracked = false;

// ===== Update =====
function update(): void {
  vfx.update();
  screenShake.update();
  screenFlash.update();

  if (phase === GamePhase.TITLE) {
    tickRef.value++;
    if (inputManager.isKeyDown('Enter') || inputManager.isKeyDown('KeyJ') || inputManager.isKeyDown('KeyR')) {
      phase = GamePhase.MODE_SELECT;
      modeSelectCursor = 0;
      initAudio();
    }
    return;
  }

  if (phase === GamePhase.MODE_SELECT) {
    tickRef.value++;
    if (inputManager.isKeyDown('ArrowLeft') || inputManager.isKeyDown('KeyA')) modeSelectCursor = Math.max(0, modeSelectCursor - 1);
    if (inputManager.isKeyDown('ArrowRight') || inputManager.isKeyDown('KeyD')) modeSelectCursor = Math.min(2, modeSelectCursor + 1);
    if (inputManager.isKeyDown('Enter') || inputManager.isKeyDown('KeyJ')) {
      teamMode = modeSelectCursor === 1;
      isTrainingMode = modeSelectCursor === 2;
      phase = GamePhase.SELECT;
    }
    return;
  }

  if (phase === GamePhase.CONTINUE) {
    tickRef.value++;
    continueCountdown--;
    // 左右键切换YES/NO
    if (inputManager.isKeyDown('ArrowLeft')) continueCursorYes = true;
    if (inputManager.isKeyDown('ArrowRight')) continueCursorYes = false;
    if (inputManager.isKeyDown('KeyJ') || inputManager.isKeyDown('Enter')) {
      if (continueCursorYes) {
        // Continue: restart match with same characters
        phase = GamePhase.INTRO;
        phaseTimer = 0;
        rounds.currentRound = 1;
        rounds.fullReset();
        cinematic.reset();
        p1DelayedHealth = p1.maxHealth;
        p2DelayedHealth = p2.maxHealth;
        p1.savePrevState();
        p2.savePrevState();
        announcer.roundStart(1);
        announcer.fight();
      } else {
        // NO → back to title
        phase = GamePhase.TITLE;
      }
    }
    if (continueCountdown <= 0) {
      // Time out → Game Over → back to title
      phase = GamePhase.TITLE;
    }
    return;
  }

  if (phase === GamePhase.SELECT) {
    tickRef.value++;
    const result = select.update(inputManager.getP1Input(), inputManager.getP2Input(), inputManager.isKeyDown('KeyT'));
    if (result) {
      p2AI = isTrainingMode ? null : result.p2AI;
      // Create teams for 3v3 mode
      if (teamMode) {
        p1Team = createTeam(result.p1Team);
        p2Team = createTeam(result.p2Team);
      }
      phase = GamePhase.INTRO;
      phaseTimer = 0;
      rounds.currentRound = 1;
      isTimeOver = false;
      p1DelayedHealth = p1.maxHealth;
      p2DelayedHealth = p2.maxHealth;
      p1.savePrevState();
      p2.savePrevState();
      announcer.roundStart(1);
      announcer.fight();
    }
    return;
  }

  if (phase === GamePhase.INTRO) {
    phaseTimer++;
    if (phaseTimer >= INTRO_DURATION) { phase = GamePhase.FIGHTING; tickRef.value = 0; modeIndicatorTimer = 180; firstHitTracked = false; firstAttacker = null; koGroundSlamDone = false; bgm.start(); playFight(); screenFlash.trigger('#ffffff', 0.2, 6); }
    return;
  }

  if (phase === GamePhase.KO) {
    koTimer++;
    if (koTimer > KO_DISPLAY_TIME) {
      // 3v3 team mode: switch to next team member if available
      if (teamMode && p1Team && p2Team && winner !== null) {
        const loserTeam = winner === 0 ? p2Team : p1Team;
        const hasAlive = defeatActive(loserTeam);
        if (hasAlive && switchToNext(loserTeam)) {
          // Switch to next character — restart round with new character
          const losingIdx = winner === 0 ? 1 : 0;
          const newChar = activeChar(loserTeam);
          const loser = losingIdx === 0 ? p1 : p2;
          const loserCtrl = losingIdx === 0 ? p1Ctrl : p2Ctrl;
          loser.charId = newChar.id;
          loser.color = newChar.color;
          loser.setStats(newChar.stats);
          loserCtrl.setCharacter(newChar);
          if (p2AI && losingIdx === 1) {
            p2AI = new SimpleAI(p2, p1, newChar, 0.6);
          }
          // Restart as a new round
          rounds.startRoundTransition();
          phase = GamePhase.INTRO;
          phaseTimer = 0;
          p1DelayedHealth = p1.maxHealth;
          p2DelayedHealth = p2.maxHealth;
          cinematic.reset();
          announcer.roundStart(rounds.currentRound);
          announcer.fight();
          return;
        }
        // All team members defeated — match over
        if (!p1Team.alive || !p2Team.alive) {
          phase = GamePhase.MATCH_END;
          koTimer = 0;
          currentWinQuote = pickWinQuote(winner);
          announcer.winner();
          return;
        }
      }
      // Standard mode or team mode fallback
      const matchWinner = rounds.addWin(winner);
      if (matchWinner !== null) {
        phase = GamePhase.MATCH_END;
        koTimer = 0;
        currentWinQuote = pickWinQuote(winner);
        announcer.winner();
      } else {
        rounds.startRoundTransition();
      }
    }
    if (koTimer <= KO_DISPLAY_TIME && inputManager.isKeyDown('KeyR')) restartGame();
    return;
  }

  if (phase === GamePhase.MATCH_END) {
    koTimer++;
    if (!cinematic.victoryFanfarePlayed) { cinematic.victoryFanfarePlayed = true; playVictoryFanfare(); }
    if (koTimer > 180 || (koTimer > 60 && (inputManager.isKeyDown('KeyR') || inputManager.isKeyDown('KeyJ') || inputManager.isKeyDown('Enter')))) {
      phase = GamePhase.CONTINUE;
      continueCountdown = CONTINUE_DURATION;
      continueCursorYes = true;
    }
    return;
  }

  // === FIGHTING phase ===
  // Training mode: ESC returns to select
  if (isTrainingMode && inputManager.isKeyDown('Escape')) {
    bgm.stop(); phase = GamePhase.SELECT; select.reset(); p2AI = null; isTrainingMode = true; return;
  }
  if (cinematic.isFrozen()) { cinematic.tickInFreeze(maxModes); return; }
  cinematic.tickMaxModes(maxModes);
  cinematic.tickSuperFlash();
  tickRef.value++;
  tickAutoMeter(gauges);
  if (cinematic.shouldSkipFrame()) return;
  const rawP1 = inputManager.getP1Input();
  const rawP2 = inputManager.getP2Input();
  p1.updateFacing(p2);
  p2.updateFacing(p1);
  const p1Input = resolveInput(rawP1, p1.facing, combatSystem.getPrevAttack(0));
  const p2Input = resolveInput(rawP2, p2.facing, combatSystem.getPrevAttack(1));
  combatSystem.updateEdgeTracking(rawP1, rawP2);
  dmMgr.checkMaxActivation(p1Input, 0);
  dmMgr.checkMaxActivation(p2Input, 1);
  // MAX activation sound + screen flash + startup invincibility
  if (maxModes[0].active && maxModes[0].timer === maxModes[0].maxDuration - 1) {
    playMAXActivation(); screenFlash.trigger('#44ff88', 0.3, 8);
    vfx.spawnMAXActivationFlash(p1.x, p1.y - p1.displayHeight / 2); vfx.spawnHeavyDust(p1.x, p1.y, 8);
    p1.invincible = true; p1.throwInvulnFrames = 5; // KOF2002: MAX激活5帧无敌
  }
  if (maxModes[1].active && maxModes[1].timer === maxModes[1].maxDuration - 1) {
    playMAXActivation(); screenFlash.trigger('#44ff88', 0.3, 8);
    vfx.spawnMAXActivationFlash(p2.x, p2.y - p2.displayHeight / 2); vfx.spawnHeavyDust(p2.x, p2.y, 8);
    p2.invincible = true; p2.throwInvulnFrames = 5;
  }
  p1Cmd.record(getDirectionInput(p1Input), tickRef.value);
  p2Cmd.record(getDirectionInput(p2Input), tickRef.value);
  if (p1Input.punchPressed) p1Cmd.recordPress('punch', tickRef.value);
  if (p1Input.kickPressed) p1Cmd.recordPress('kick', tickRef.value);
  if (p1Input.punchJustReleased) p1Cmd.recordRelease('punch', tickRef.value);
  if (p1Input.kickJustReleased) p1Cmd.recordRelease('kick', tickRef.value);
  if (p2Input.punchPressed) p2Cmd.recordPress('punch', tickRef.value);
  if (p2Input.kickPressed) p2Cmd.recordPress('kick', tickRef.value);
  if (p2Input.punchJustReleased) p2Cmd.recordRelease('punch', tickRef.value);
  if (p2Input.kickJustReleased) p2Cmd.recordRelease('kick', tickRef.value);
  if (simplifiedMode && !p1.currentAttack && p1.canAct()) {
    const p1Char = ROSTER.find(c => c.id === p1.charId) || ROSTER[0];
    const simp = resolveSimplified(
      !!rawP1.buttonC && combatSystem.getPrevAttack(0) === null,
      !!rawP1.buttonD && combatSystem.getPrevAttack(0) === null,
      !!rawP1.throwAttack && combatSystem.getPrevAttack(0) === null,
      p1Char, gauges[0], maxModes[0],
    );
    if (simp.activateMax) dmMgr.checkMaxActivation(p1Input, 0);
    if (simp.attack) p1.startAttack(simp.attack);
  }

  p1Ctrl.update(p1Input);
  if (p2AI) {
    p2AI.gauge = gauges[1];
    p2AI.maxMode = maxModes[1];
    const aiInput = p2AI.getInput();
    p2Ctrl.update(aiInput);
    if (p2.canAct() && Math.random() < 0.02) { const s = p2AI.triggerSpecial(); if (s) p2.startAttack(s); }
  } else if (isTrainingMode) {
    // Training dummy: auto-block when P1 attacks nearby
    const dummyInput = { ...p2Input };
    if (p1.attackPhase === 'active' && p2.canBlock()) {
      if (p1.x < p2.x) dummyInput.back = true;
      else dummyInput.forward = true;
    }
    p2Ctrl.update(dummyInput);
  } else {
    p2Ctrl.update(p2Input);
  }

  resolvePushbox(p1, p2);
  for (const proj of projectiles) proj.update();
  combatSystem.resolveAttacks(p1, p2, projectiles, onHit, tickRef.value, [maxModes[0].active, maxModes[1].active]);
  combatSystem.tickComboTimeout(tickRef.value);
  combatSystem.tickThrowState(p1, p2, onHit);

  // First Attack detection — KOF2002: first hit bonus meter + announcer
  if (!firstHitTracked && (combatSystem.getComboCount(0) > 0 || combatSystem.getComboCount(1) > 0)) {
    firstHitTracked = true;
    const hitterIdx = combatSystem.getComboCount(0) > 0 ? 0 : 1;
    firstAttacker = hitterIdx;
    const hitter = hitterIdx === 0 ? p1 : p2;
    vfx.spawnFirstAttackText(hitter.x, hitter.y - hitter.displayHeight - 40);
    announcer.firstAttack();
    // First hit bonus: extra meter for the attacker
    if (gauges[hitterIdx]) {
      gainMeterOnHit(gauges[hitterIdx]);
    }
  }

  const healthDecay = Math.max(p1.maxHealth, p2.maxHealth) * 0.005;
  if (p1DelayedHealth > p1.health) p1DelayedHealth = Math.max(p1.health, p1DelayedHealth - healthDecay);
  if (p2DelayedHealth > p2.health) p2DelayedHealth = Math.max(p2.health, p2DelayedHealth - healthDecay);

  dmMgr.checkDMActivation();
  p1Ctrl.applyPhysics();
  p2Ctrl.applyPhysics();

  [p1, p2].forEach((f, i) => {
    const wasStun = f.prevState === FighterState.HITSTUN || f.prevState === FighterState.KNOCKDOWN;
    if (wasStun && f.state === FighterState.IDLE) {
      const lastCombo = combatSystem.getComboCount(i);
      if (lastCombo >= 3) {
        const lastDmg = combatSystem.getComboDamage(i);
        vfx.spawnComboEndText(f.x, f.y - f.displayHeight - 50, lastCombo);
        vfx.spawnComboDamageText(f.x, f.y - f.displayHeight - 50, lastDmg);
      }
      // KOF2002: 连击中断尘埃 — 对手恢复时攻击者脚下小尘埃
      if (lastCombo >= 2) {
        const opp = i === 0 ? p2 : p1;
        vfx.spawnDust(opp.x, STAGE_GROUND_Y);
      }
      combatSystem.resetCombo(i);
    }
    // 防御恢复尘埃
    if (f.prevState === FighterState.BLOCK && f.state === FighterState.IDLE) vfx.spawnDust(f.x, STAGE_GROUND_Y);
    if (f.prevState === FighterState.KNOCKDOWN && f.state === FighterState.IDLE && f.throwInvincibilityTimer === 0) {
      vfx.spawnDust(f.x, STAGE_GROUND_Y);
      vfx.spawnQuickStandText(f.x, f.y - f.displayHeight - 40);
      playQuickStand();
      // KOF2002: Quick Stand立即重置对手的连击计数, 防止起身继续追打
      const oppIdx = 1 - i;
      combatSystem.resetCombo(oppIdx);
    }

    // Roll音效
    if (f.prevState !== FighterState.ROLL && f.state === FighterState.ROLL) {
      playRoll();
      // Guard Cancel Roll: 从BLOCK进入ROLL时播放Cancel音效+VFX
      if (f.prevState === FighterState.BLOCK) {
        playCancel();
        vfx.spawnGCCDText(f.x, f.y - f.displayHeight - 30);
        screenFlash.trigger('#22ff88', 0.1, 3);
      }
    }

    // Guard Cancel CD: 从BLOCK直接进入攻击时播放Cancel音效+VFX
    if (f.prevState === FighterState.BLOCK
      && (f.state === FighterState.STAND_ATTACK || f.state === FighterState.CROUCH_ATTACK)) {
      playCancel();
      // GC CD闪光效果
      vfx.spawnCharacterHitSparks(f.x, f.y - f.displayHeight / 2, 12, '#ff8800');
      vfx.spawnGCCDText(f.x, f.y - f.displayHeight - 30);
      screenFlash.trigger('#ff8800', 0.1, 3);
    }

    // Cancel VFX: 检测取消事件并触发视觉反馈
    if (f.cancelEvent) {
      const cx = f.x;
      const cy = f.y - f.displayHeight - 30;
      if (f.cancelEvent === 'super_cancel') {
        vfx.spawnSuperCancelText(cx, cy);
        screenFlash.trigger('#4488ff', 0.15, 4);
        playCancel();
      } else if (f.cancelEvent === 'free_cancel') {
        vfx.spawnFreeCancelText(cx, cy);
        screenFlash.trigger('#44ff88', 0.12, 3);
        playCancel();
      } else if (f.cancelEvent === 'rapid_cancel' || f.cancelEvent === 'command_cancel') {
        playCancel();
      }
      f.cancelEvent = null;
    }

    f.savePrevState();
  });

  // 移动视觉反馈
  updateMovementVfx([p1, p2], vfx, tickRef.value);

  for (let i = projectiles.length - 1; i >= 0; i--) { if (!projectiles[i].active) projectiles.splice(i, 1); }

  // Projectile vs projectile collision
  for (let i = 0; i < projectiles.length; i++) {
    const a = projectiles[i];
    if (!a.active) continue;
    for (let j = i + 1; j < projectiles.length; j++) {
      const b = projectiles[j];
      if (!b.active) continue;
      if (a.ownerId === b.ownerId) continue;
      const aBox = a.getHitbox();
      const bBox = b.getHitbox();
      if (!aBox || !bBox) continue;
      const overlap = Math.min(aBox.x + aBox.width, bBox.x + bBox.width) - Math.max(aBox.x, bBox.x);
      if (overlap <= 0) continue;
      const vOverlap = Math.min(aBox.y + aBox.height, bBox.y + bBox.height) - Math.max(aBox.y, bBox.y);
      if (vOverlap <= 0) continue;
      a.active = false; b.active = false;
      const collX = (a.x + b.x) / 2, collY = (a.y + b.y) / 2;
      vfx.spawnCharacterHitSparks(collX, collY, 20, '#ffffff');
      vfx.spawnImpactRing(collX, collY);
      break;
    }
  }
  for (let i = projectiles.length - 1; i >= 0; i--) { if (!projectiles[i].active) projectiles.splice(i, 1); }

  // ── Training mode overrides ──
  if (isTrainingMode) {
    // Health regeneration: refill both fighters to max after damage
    if (p1.health < p1.maxHealth && p1.health > 0) p1.health = Math.min(p1.maxHealth, p1.health + p1.maxHealth * 0.02);
    if (p2.health < p2.maxHealth && p2.health > 0) p2.health = Math.min(p2.maxHealth, p2.health + p2.maxHealth * 0.02);
    // Full regen on KO
    if (p1.health <= 0 || p2.health <= 0) {
      p1.health = p1.maxHealth; p2.health = p2.maxHealth;
      p1DelayedHealth = p1.maxHealth; p2DelayedHealth = p2.maxHealth;
      cinematic.reset(); koGroundSlamDone = false;
    }
  }

  if (!isTrainingMode && (p1.health <= 0 || p2.health <= 0)) {
    if (!cinematic.koSlowMoTriggered) {
      // KOF2002: DM/SDM击杀时KO慢放更强(60帧, 每4帧跳1帧)
      const killer = p1.health <= 0 ? p2 : p1;
      const killerAttack = killer.currentAttack as string;
      const isDMKill = killerAttack?.startsWith('DM_') || killerAttack?.startsWith('SDM_');
      if (isDMKill) cinematic.triggerDMKOSlowMo();
      else cinematic.triggerKOSlowMo();
      // KOF2002: KO定格 — 通常12帧, DM击杀16帧
      const koDefender = p1.health <= 0 ? 0 : 1;
      const koAttacker = p1.health <= 0 ? p2 : p1;
      cinematic.triggerHitStop(isDMKill ? 16 : 12, koDefender, koAttacker.facing);
      screenFlash.trigger('#ff2200', 0.35, 15);
      screenShake.trigger(16, 15);
      playKO();
      bgm.stop();
      announcer.knockOut();
    }
    // KO'd fighter落地时触发groundslam (KOF2002正版: 空中KO落地才震地)
    if (!koGroundSlamDone && cinematic.koSlowMoTriggered) {
      // KOF2002: Double KO时双方都触发落地震地效果
      const bothKO = p1.health <= 0 && p2.health <= 0;
      const loser = p1.health <= 0 ? p1 : p2;
      if (loser.isGrounded()) {
        koGroundSlamDone = true;
        triggerKOGroundEffect({ vfx, screenFlash, screenShake }, loser);
        if (bothKO) triggerKOGroundEffect({ vfx, screenFlash, screenShake }, p1.health <= 0 ? p1 : p2);
      }
    }
    if (cinematic.koSlowMoTriggered && cinematic.isKOSlowMoDone()) {
      phase = GamePhase.KO;
      koTimer = 0;
      winner = rounds.determineWinner();
      if (winner !== null && cinematic.getPerfectPlayer(winner) !== null) {
        const pw = winner === 0 ? p1 : p2;
        vfx.spawnPerfectFlash(pw.x, pw.y - pw.displayHeight / 2);
        screenFlash.trigger('#ffcc00', 0.25, 8);
        playPerfect();
        announcer.perfect();
      }
    }
  }

  if (!isTrainingMode && tickRef.value >= 3600) {
    phase = GamePhase.KO;
    koTimer = 0;
    isTimeOver = true;
    winner = rounds.determineWinner();
    screenShake.trigger(8, 10);
    screenFlash.trigger('#ffaa00', 0.2, 8);
    bgm.stop();
    announcer.timeOver();
  }
}
// ===== Training Mode HUD =====
function drawTrainingHUD(
  ctx: CanvasRenderingContext2D, p1: Fighter, p2: Fighter,
  cs: CombatSystem, cmdBuf: CommandBuffer, tick: number,
): void {
  ctx.save();
  // Training mode banner
  ctx.fillStyle = 'rgba(0, 80, 0, 0.65)';
  ctx.fillRect(0, 0, 200, 28);
  ctx.fillStyle = '#44ff44';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('TRAINING MODE', 10, 19);

  // Damage display
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(CANVAS_WIDTH - 220, 0, 220, 60);
  ctx.font = '11px monospace';
  ctx.fillStyle = '#aaa';
  ctx.fillText('Combo:', CANVAS_WIDTH - 210, 16);
  ctx.fillStyle = '#ffcc00';
  ctx.fillText(`${cs.getComboCount(0)}`, CANVAS_WIDTH - 150, 16);
  ctx.fillStyle = '#aaa';
  ctx.fillText('Damage:', CANVAS_WIDTH - 210, 32);
  ctx.fillStyle = '#ff6644';
  ctx.fillText(`${cs.getComboDamage(0)}`, CANVAS_WIDTH - 140, 32);
  ctx.fillStyle = '#aaa';
  ctx.fillText('P1 HP:', CANVAS_WIDTH - 210, 48);
  ctx.fillStyle = '#44ff44';
  ctx.fillText(`${Math.round(p1.health)} / ${p1.maxHealth}`, CANVAS_WIDTH - 155, 48);

  // Input display (last 12 inputs)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, CANVAS_HEIGHT - 40, 400, 40);
  ctx.font = '12px monospace';
  ctx.fillStyle = '#888';
  ctx.fillText('Input:', 8, CANVAS_HEIGHT - 20);
  const hist = cmdBuf.getRecentHistory(16);
  const symbols: Record<string, string> = { neutral: '·', up: '↑', down: '↓', forward: '→', back: '←', upforward: '↗', upback: '↖', downforward: '↘', downback: '↙' };
  ctx.fillStyle = '#ccffcc';
  ctx.fillText(hist.map(h => symbols[h.direction] || '?').join(' '), 60, CANVAS_HEIGHT - 20);

  // Attack info
  if (p1.currentAttack) {
    const d = FRAME_DATA[p1.currentAttack as keyof typeof FRAME_DATA];
    if (d) {
      ctx.fillStyle = '#aaccff';
      ctx.fillText(`${p1.currentAttack} [${p1.attackPhase}] f${p1.attackFrame}  S:${d.startup} A:${d.active} R:${d.recovery} dmg:${d.damage}`, 8, CANVAS_HEIGHT - 6);
    }
  }
  ctx.restore();
}

// ===== Render =====
function render(): void {
  if (phase === GamePhase.TITLE) {
    renderer.drawTitle(tickRef.value);
    return;
  }
  if (phase === GamePhase.MODE_SELECT) {
    renderer.drawModeSelect(tickRef.value, modeSelectCursor);
    return;
  }
  if (phase === GamePhase.CONTINUE) {
    renderer.drawContinue(Math.ceil(continueCountdown / 60), continueCursorYes);
    return;
  }
  if (phase === GamePhase.SELECT) {
    renderer.drawCharacterSelect(select.p1Cursor, select.p2Cursor, select.p1Ready, select.p2Ready, tickRef.value, select.p2IsAI, simplifiedMode);
    return;
  }
  rounds.tickFade();
  camera.update(p1, p2);
  const isKO = phase === GamePhase.KO || phase === GamePhase.MATCH_END;
  const perfectPlayer = isKO ? cinematic.getPerfectPlayer(winner) : null;
  const p1Char = ROSTER.find(c => c.id === p1.charId) || ROSTER[0];
  const p2Char = ROSTER.find(c => c.id === p2.charId) || ROSTER[1];
  renderer.render([p1, p2], camera.x, tickRef.value, phase === GamePhase.KO, winner, screenShake.offsetX, screenShake.offsetY,
    [p1DelayedHealth, p2DelayedHealth], maxModes, perfectPlayer, rounds.p1Wins, rounds.p2Wins, p1Char.nameCn, p2Char.nameCn, isTimeOver, rounds.currentRound, firstAttacker,
    cinematic.hitStopDefender, cinematic.hitStopBias);
  renderer.drawProjectiles(projectiles, camera);
  vfx.render(ctx, camera.x);

  if (cinematic.superFlashTimer > 0)
    renderer.drawSuperFlash(ctx, cinematic.superFlashTimer, cinematic.superFlashX - camera.x, cinematic.superFlashY, maxModes[cinematic.superFlashAttacker].active ? 'SDM' : 'DM');
  renderer.drawPowerGauges(gauges, maxModes);
  if (phase === GamePhase.INTRO) renderer.drawIntro(phaseTimer, rounds.currentRound, p1Char.nameCn, p2Char.nameCn);
  renderer.drawComboCounters([p1, p2], [combatSystem.getComboCount(0), combatSystem.getComboCount(1)], [0, 0], camera, [combatSystem.getComboDamage(0), combatSystem.getComboDamage(1)]);
  if (teamMode && p1Team && p2Team) {
    const toDisp = (t: TeamState): TeamDisplayInfo => ({
      members: t.members.map((m, i) => ({ name: m.charDef.nameCn, defeated: m.defeated, active: i === t.activeIndex && !m.defeated })),
    });
    renderer.drawTeamOrder(toDisp(p1Team), toDisp(p2Team));
  }
  renderer.drawControlsHint(simplifiedMode, p1.charId);

  if (phase === GamePhase.MATCH_END) {
    if (winner !== null) { const w = winner === 0 ? p1 : p2; drawVictoryPose(ctx, w.x - camera.x, w.y, w.facing, w.color, '#ffffff30', tickRef.value, w.charId); }
    renderer.drawMatchEnd(winner, rounds.p1Wins, rounds.p2Wins, currentWinQuote || undefined, winner !== null ? (winner === 0 ? '#ff6644' : '#4488ff') : undefined, phaseTimer, winner !== null ? (winner === 0 ? p1 : p2).charId ?? undefined : undefined);
  }
  if (rounds.fadeAlpha > 0) { ctx.fillStyle = `rgba(0,0,0,${rounds.fadeAlpha})`; ctx.fillRect(0, 0, canvas.width, canvas.height); }
  screenFlash.render(ctx, canvas.width, canvas.height);
  // Control mode indicator badge
  if (modeIndicatorTimer > 0) {
    renderer.drawModeIndicator(simplifiedMode, Math.min(1, modeIndicatorTimer / 60));
    modeIndicatorTimer--;
  }
  if (stageIndicatorTimer > 0) {
    renderer.drawStageIndicator(getStage(), Math.min(1, stageIndicatorTimer / 60));
    stageIndicatorTimer--;
  }
  if (debugMode) renderer.drawDebug([p1, p2], projectiles, camera, tickRef.value, renderer.getFps(), vfx.count, [p1Cmd, p2Cmd]);
  // Training mode HUD overlay
  if (isTrainingMode && (phase === GamePhase.FIGHTING || phase === GamePhase.KO)) {
    drawTrainingHUD(ctx, p1, p2, combatSystem, p1Cmd, tickRef.value);
  }
}
function restartGame(): void {
  bgm.stop();
  phase = GamePhase.TITLE;
  phaseTimer = 0;
  koTimer = 0;
  koGroundSlamDone = false;
  winner = null;
  tickRef.value = 0;
  select.reset();
  p2AI = null;
  cinematic.reset();
  rounds.fullReset();
  p1DelayedHealth = p1.maxHealth;
  p2DelayedHealth = p2.maxHealth;
}

// ===== Events =====
let f1Down = false;
window.addEventListener('keydown', e => {
  initAudio();
  if (e.code === 'F1') { e.preventDefault(); if (!f1Down) { f1Down = true; debugMode = !debugMode; } }
  if (e.code === 'KeyM') announcer.toggle();
  if (e.code === 'KeyB') bgm.toggle();
  if (e.code === 'Tab') { e.preventDefault(); simplifiedMode = !simplifiedMode; modeIndicatorTimer = 120; }
  if (e.code === 'KeyN') { const s = cycleStage(); console.log('Stage:', s); stageIndicatorTimer = 120; }
});
window.addEventListener('keyup', e => { if (e.code === 'F1') f1Down = false; });

// ===== Start =====
new GameLoop(update, render).start();
