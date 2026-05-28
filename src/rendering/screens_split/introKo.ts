/**
 * Intro overlay and KO screen
 * Split from screens.ts
 */
import {
  CANVAS_WIDTH, CANVAS_HEIGHT,
} from '../../core/constants.js';
import { roundRect, drawSNKText } from '../utils.js';
import { drawPixelPortrait } from '../pixelPortraits.js';
import type { PixelPortraitData } from '../pixelPortraits.js';
import { getPortraitForSize } from '../manifestRenderData.js';
import type { CharacterDefinition } from '../../characters/types.js';
import type { StageId } from '../stage.js';
import type { KODustParticle, KOPhase } from '../../state/cinematicState.js';
import { KO_FLASH_DURATION, KO_ANNOUNCE_DURATION, KO_TRANSITION_PAUSE } from '../../state/cinematicState.js';
import { CN_MOVE_NAMES, CHAR_COLORS } from '../moveNameDisplay.js';

// Stage name mapping — shared with other screens
const STAGE_NAMES: Record<StageId, string> = {
  temple: '日本寺庙 · Japan',
  china: '唐人街 · China',
  factory: '工場 · Factory',
  orochi: '大蛇神社 · Orochi',
  street: '街市夜市 · Street',
  rooftop: '日本屋上 · Rooftop',
};

// ===== Intro Overlay =====

// 回合介绍时间分配: ROUND显示90帧(1.5s) + FIGHT!显示60帧(1s) = 总150帧(2.5s)
const INTRO_ROUND_FRAMES = 90;
const INTRO_FIGHT_FRAMES = 60;

export function drawIntro(ctx: CanvasRenderingContext2D, phaseTimer: number, currentRound: number = 1, p1Name: string = '', p2Name: string = '', stageId?: StageId, p1Wins: number = 0, p2Wins: number = 0, winsNeeded: number = 2): void {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Phase 1: "ROUND X" (0 ~ INTRO_ROUND_FRAMES)
  if (phaseTimer < INTRO_ROUND_FRAMES) {
    // KOF2002: 回合开始能量爆发 — 前5帧中心放射状扩散环
    if (phaseTimer < 5) {
      ctx.save();
      ctx.globalAlpha = (5 - phaseTimer) / 5 * 0.2;
      ctx.strokeStyle = '#ffcc44';
      ctx.lineWidth = 2;
      const burstR = 20 + phaseTimer * 40;
      ctx.beginPath();
      ctx.ellipse(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, burstR, burstR * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    // KOF2002: 回合开始暗角 — 前20帧边缘渐暗
    if (phaseTimer < 20) {
      ctx.save();
      ctx.globalAlpha = (20 - phaseTimer) / 20 * 0.3;
      const grad = ctx.createRadialGradient(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.3, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.8);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,1)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.restore();
    }
    const progress = phaseTimer / INTRO_ROUND_FRAMES;
    const fadeIn = Math.min(1, phaseTimer / 20);
    const fadeOut = phaseTimer > INTRO_ROUND_FRAMES - 20 ? (INTRO_ROUND_FRAMES - phaseTimer) / 20 : 1;
    const alpha = Math.min(fadeIn, fadeOut);
    const scaleProgress = Math.min(1, phaseTimer / 15);
    const scale = 1 + (1 - scaleProgress) * 0.6;
    ctx.globalAlpha = alpha;
    const fontSize = Math.round(52 * scale);

    // 电影感黑条
    const barAlpha = alpha * 0.7;
    ctx.fillStyle = `rgba(0,0,0,${barAlpha})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, 100);
    ctx.fillRect(0, CANVAS_HEIGHT - 100, CANVAS_WIDTH, 100);

    // "ROUND X" — SNK style
    ctx.shadowColor = '#ff8800';
    ctx.shadowBlur = 15 + (1 - scaleProgress) * 10;
    drawSNKText(ctx, `ROUND ${currentRound}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20, fontSize, '#ffcc00');
    ctx.shadowBlur = 0;
    const romanNumerals = ['', 'I', 'II', 'III', 'IV', 'V'];
    const roman = romanNumerals[currentRound] || `${currentRound}`;
    drawSNKText(ctx, roman, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10, 14, 'rgba(200,168,50,0.6)');

    // 角色名显示
    if (p1Name && p2Name) {
      const nameAlpha = Math.min(1, Math.max(0, (phaseTimer - 10) / 20));
      ctx.globalAlpha = nameAlpha * alpha;
      drawSNKText(ctx, p1Name, CANVAS_WIDTH / 2 - 30, CANVAS_HEIGHT / 2 + 35, 16, '#ff6644', '#000000', 'right');
      drawSNKText(ctx, p2Name, CANVAS_WIDTH / 2 + 30, CANVAS_HEIGHT / 2 + 35, 16, '#4488ff', '#000000', 'left');
      drawSNKText(ctx, 'VS', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 35, 14, '#ffcc00');
    }

    // KOF2002: MATCH POINT — 任一方只差一胜时显示
    const p1MatchPoint = p1Wins >= winsNeeded - 1 && p2Wins < winsNeeded;
    const p2MatchPoint = p2Wins >= winsNeeded - 1 && p1Wins < winsNeeded;
    if (p1MatchPoint || p2MatchPoint) {
      const mpAlpha = Math.min(1, Math.max(0, (phaseTimer - 40) / 15)) * fadeOut;
      ctx.globalAlpha = mpAlpha * alpha * 0.9;
      const mpColor = p1MatchPoint ? '#ff6644' : '#4488ff';
      const mpName = p1MatchPoint ? p1Name : p2Name;
      ctx.shadowColor = mpColor;
      ctx.shadowBlur = 10;
      drawSNKText(ctx, 'MATCH POINT', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 55, 16, mpColor);
      if (mpName) {
        drawSNKText(ctx, mpName, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 72, 11, 'rgba(200,200,200,0.7)');
      }
      ctx.shadowBlur = 0;
    }

    // KOF2002: 舞台名显示 — SNK风格地点卡片，金色分割线+舞台名
    if (stageId && STAGE_NAMES[stageId]) {
      const stageAlpha = Math.min(1, Math.max(0, (phaseTimer - 25) / 15)) * fadeOut;
      ctx.globalAlpha = stageAlpha * alpha;
      const locY = CANVAS_HEIGHT - 120;
      const locW = 280;
      const locX = CANVAS_WIDTH / 2 - locW / 2;

      // Horizontal divider line — gold gradient
      const divGrad = ctx.createLinearGradient(locX, 0, locX + locW, 0);
      divGrad.addColorStop(0, 'rgba(200,160,50,0)');
      divGrad.addColorStop(0.15, 'rgba(200,160,50,0.6)');
      divGrad.addColorStop(0.5, 'rgba(255,200,80,0.9)');
      divGrad.addColorStop(0.85, 'rgba(200,160,50,0.6)');
      divGrad.addColorStop(1, 'rgba(200,160,50,0)');
      ctx.strokeStyle = divGrad;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(locX, locY);
      ctx.lineTo(locX + locW, locY);
      ctx.stroke();

      // Small diamond at center
      ctx.fillStyle = 'rgba(255,200,80,0.7)';
      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH / 2, locY - 3);
      ctx.lineTo(CANVAS_WIDTH / 2 + 3, locY);
      ctx.lineTo(CANVAS_WIDTH / 2, locY + 3);
      ctx.lineTo(CANVAS_WIDTH / 2 - 3, locY);
      ctx.closePath();
      ctx.fill();

      // Stage name — gold with glow
      ctx.shadowColor = '#cc8800';
      ctx.shadowBlur = 8;
      drawSNKText(ctx, STAGE_NAMES[stageId], CANVAS_WIDTH / 2, locY + 16, 14, '#ddb844');
      ctx.shadowBlur = 0;
    }
  }
  // Phase 2: "FIGHT!" (INTRO_ROUND_FRAMES ~ total)
  else if (phaseTimer < INTRO_ROUND_FRAMES + INTRO_FIGHT_FRAMES) {
    const fightTimer = phaseTimer - INTRO_ROUND_FRAMES;
    const fp = fightTimer / INTRO_FIGHT_FRAMES;
    const scaleProgress = Math.min(1, fightTimer / 8);
    const scale = 1 + (1 - scaleProgress) * 1.8;
    const fadeAlpha = fp > 0.5 ? Math.max(0, 1 - (fp - 0.5) * 2) : 1;
    ctx.globalAlpha = Math.min(1, Math.max(0, fadeAlpha));

    // KOF2002: FIGHT!瞬间橙色全屏闪光
    if (fightTimer < 4) {
      ctx.save();
      ctx.globalAlpha = (4 - fightTimer) / 4 * 0.25;
      ctx.fillStyle = '#ff6600';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.restore();
    }

    // 冲击波环
    for (let r = 0; r < 3; r++) {
      const ringDelay = r * 0.1;
      const ringProgress = Math.min(1, Math.max(0, fp * 2 - ringDelay));
      if (ringProgress <= 0) continue;
      const ringRadius = 20 + ringProgress * (150 - r * 25);
      const ringAlpha = Math.max(0, 1 - ringProgress) * (1 - r * 0.3) * fadeAlpha;
      if (ringAlpha > 0) {
        ctx.beginPath();
        ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, ${100 + r * 60}, 0, ${ringAlpha * 0.5})`;
        ctx.lineWidth = (3 - r) * (1 - ringProgress) + 1;
        ctx.stroke();
      }
    }

    const fontSize = Math.round(72 * scale);
    ctx.shadowColor = '#ff4400';
    ctx.shadowBlur = 25 + (1 - scaleProgress) * 15;
    drawSNKText(ctx, 'FIGHT!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20, fontSize, '#ff4400');
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}

// ===== KO Screen =====

/**
 * Extended KO draw function with KO phase state machine support.
 * Renders different visuals depending on the KO phase:
 *  PENDING: Slow-mo in progress, no KO overlay yet
 *  FLASH:   Screen darkens, dramatic flash, "K.O." text scales 0.5x → 1.5x → 1.0x
 *  ANNOUNCE: "K.O." text settled at 1.0x, white with red outline, 90 ticks
 *  DONE:    Fade out, round result shown
 */
export function drawKO(
  ctx: CanvasRenderingContext2D,
  winner: number | null,
  perfectPlayer: number | null = null,
  isTimeOver: boolean = false,
  p1Hp: number = 0,
  p2Hp: number = 0,
  maxHp: number = 1000,
  koTimer: number = 0,
  koDustParticles: KODustParticle[] = [],
  cameraX: number = 0,
  koPhase?: KOPhase,
  koPhaseTimer: number = 0,
  finishingAttackType: string = '',
  finishingCharId: string = '',
): void {
  ctx.save();

  // Determine finishing tier for tier-specific KO visuals
  const finishTier = finishingAttackType.startsWith('HSDM_') ? 'hsdm'
    : finishingAttackType.startsWith('SDM_') ? 'sdm'
    : finishingAttackType.startsWith('DM_') ? 'dm'
    : isTimeOver ? 'timeover' : 'normal';

  // Tier-specific vignette colors and intensity
  const vigColors = finishTier === 'hsdm' ? { r: 160, g: 0, b: 120, intensity: 0.65 }
    : finishTier === 'sdm' ? { r: 100, g: 0, b: 120, intensity: 0.58 }
    : finishTier === 'dm' ? { r: 120, g: 20, b: 0, intensity: 0.52 }
    : { r: 160, g: 0, b: 0, intensity: 0.45 };

  // Dark overlay with tier-colored pulsing vignette
  const pulseSpeed = 0.04;
  const vignettePulse = vigColors.intensity + Math.sin(koTimer * pulseSpeed) * 0.15;
  ctx.fillStyle = `rgba(0, 0, 0, ${vignettePulse})`;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  const vigGrad = ctx.createRadialGradient(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 80, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 420);
  vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
  vigGrad.addColorStop(0.5, `rgba(${vigColors.r * 0.5},${vigColors.g},${vigColors.b * 0.5},${0.12 * vignettePulse})`);
  vigGrad.addColorStop(0.75, `rgba(${vigColors.r * 0.75},${vigColors.g},${vigColors.b * 0.75},${0.25 * vignettePulse})`);
  vigGrad.addColorStop(1, `rgba(${vigColors.r},${vigColors.g},${vigColors.b},${0.4 * vignettePulse})`);
  ctx.fillStyle = vigGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // HSDM prismatic edge flash — rainbow color cycling on screen edges
  if (finishTier === 'hsdm' && koTimer < 30) {
    const flashAlpha = (1 - koTimer / 30) * 0.2;
    const hue = (koTimer * 12) % 360;
    const pr = Math.round(128 + 127 * Math.sin(hue * Math.PI / 180));
    const pg = Math.round(128 + 127 * Math.sin((hue + 120) * Math.PI / 180));
    const pb = Math.round(128 + 127 * Math.sin((hue + 240) * Math.PI / 180));
    ctx.fillStyle = `rgba(${pr},${pg},${pb},${flashAlpha})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, 35);
    ctx.fillRect(0, CANVAS_HEIGHT - 35, CANVAS_WIDTH, 35);
    ctx.fillRect(0, 0, 25, CANVAS_HEIGHT);
    ctx.fillRect(CANVAS_WIDTH - 25, 0, 25, CANVAS_HEIGHT);
  }

  // SDM purple energy pulse — brief center burst
  if (finishTier === 'sdm' && koTimer < 20) {
    const burstAlpha = (1 - koTimer / 20) * 0.3;
    const burstR = 50 + koTimer * 15;
    const burstGrad = ctx.createRadialGradient(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 0, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, burstR);
    burstGrad.addColorStop(0, `rgba(200, 50, 255, ${burstAlpha})`);
    burstGrad.addColorStop(0.6, `rgba(150, 0, 200, ${burstAlpha * 0.4})`);
    burstGrad.addColorStop(1, 'rgba(100, 0, 150, 0)');
    ctx.fillStyle = burstGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Tier-specific title text colors
  const titleText = isTimeOver ? 'TIME OVER' : 'K.O.!';
  const titleColor = isTimeOver ? '#ffaa00'
    : finishTier === 'hsdm' ? '#ff88ff'
    : finishTier === 'sdm' ? '#dd66ff'
    : finishTier === 'dm' ? '#ff6622'
    : '#ff2200';
  const glowColor = isTimeOver ? '#ff8800'
    : finishTier === 'hsdm' ? '#ff44ff'
    : finishTier === 'sdm' ? '#aa00ff'
    : finishTier === 'dm' ? '#ff4400'
    : '#ff0000';

  // KO impact dust particles
  for (const p of koDustParticles) {
    const screenX = p.x - cameraX;
    const alpha = Math.max(0, p.life / p.maxLife) * 0.8;
    ctx.fillStyle = p.color + Math.round(alpha * 255).toString(16).padStart(2, '0');
    ctx.beginPath();
    ctx.arc(screenX, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
    ctx.fill();
  }

  // KO shockwave rings — tier-specific count and color
  const ringCount = finishTier === 'hsdm' ? 8 : finishTier === 'sdm' ? 7 : 5;
  const ringColor = isTimeOver ? '#ffaa00'
    : finishTier === 'hsdm' ? '#ff66ff'
    : finishTier === 'sdm' ? '#cc44ff'
    : finishTier === 'dm' ? '#ff6622'
    : '#ff4400';
  const ringExpandProgress = Math.min(1, koTimer / 60);
  for (let r = 0; r < ringCount; r++) {
    const ringDelay = r * 0.10;
    const ringProgress = Math.min(1, Math.max(0, ringExpandProgress * 2 - ringDelay));
    if (ringProgress <= 0) continue;
    const ringR = 30 + ringProgress * (220 - r * 20);
    const ringAlpha = Math.max(0, 1 - ringProgress) * (1 - r * 0.12);
    if (ringAlpha > 0) {
      ctx.globalAlpha = ringAlpha * 0.4;
      ctx.strokeStyle = ringColor;
      ctx.lineWidth = (4 - Math.min(r, 3)) * (1 - ringProgress) + 1;
      ctx.beginPath();
      ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20, ringR, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;

  // KO radial impact lines — tier-colored
  ctx.save();
  const lineColor = isTimeOver ? 'rgba(255, 170, 0, 0.12)'
    : finishTier === 'hsdm' ? 'rgba(255, 100, 255, 0.15)'
    : finishTier === 'sdm' ? 'rgba(200, 70, 255, 0.14)'
    : finishTier === 'dm' ? 'rgba(255, 100, 34, 0.14)'
    : 'rgba(255, 34, 0, 0.15)';
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 2;
  const lineCount = 32;
  const lineProgress = Math.min(1, koTimer / 30);
  for (let i = 0; i < lineCount; i++) {
    const angle = (i / lineCount) * Math.PI * 2;
    const innerR = 40;
    const outerR = (100 + (i % 3) * 30) * (0.5 + lineProgress * 0.5);
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2 + Math.cos(angle) * innerR, CANVAS_HEIGHT / 2 - 20 + Math.sin(angle) * innerR);
    ctx.lineTo(CANVAS_WIDTH / 2 + Math.cos(angle) * outerR, CANVAS_HEIGHT / 2 - 20 + Math.sin(angle) * outerR);
    ctx.stroke();
  }
  ctx.restore();

  // Title text — phase-aware scale animation
  const effectivePhase = koPhase ?? (koTimer > 5 ? 'ANNOUNCE' : 'FLASH');
  const effectivePhaseTimer = koPhase ? koPhaseTimer : koTimer;

  let textScale = 1;
  let textAlpha = 1;

  if (effectivePhase === 'FLASH' || (!koPhase && koTimer <= 5)) {
    // FLASH phase: scale from 0.5x → 1.5x → settle at 1.0x
    const flashProgress = Math.min(1, effectivePhaseTimer / KO_FLASH_DURATION);
    if (flashProgress < 0.3) {
      // 0→30%: scale from 0.5x up to 1.5x
      const t = flashProgress / 0.3;
      textScale = 0.5 + t * 1.0;
    } else if (flashProgress < 0.5) {
      // 30→50%: scale from 1.5x down to 0.9x (bounce undershoot)
      const t = (flashProgress - 0.3) / 0.2;
      textScale = 1.5 - t * 0.6;
    } else if (flashProgress < 0.7) {
      // 50→70%: scale from 0.9x back to 1.05x (small overshoot)
      const t = (flashProgress - 0.5) / 0.2;
      textScale = 0.9 + t * 0.15;
    } else {
      // 70→100%: settle at 1.0x
      const t = (flashProgress - 0.7) / 0.3;
      textScale = 1.05 - t * 0.05;
    }
    textAlpha = Math.min(1, flashProgress * 4);
  } else if (effectivePhase === 'ANNOUNCE') {
    // ANNOUNCE phase: stable at 1.0x, full alpha, subtle pulse
    const announceProgress = effectivePhaseTimer / KO_ANNOUNCE_DURATION;
    textScale = 1.0 + Math.sin(effectivePhaseTimer * 0.08) * 0.02;
    // Start fading near end of announce phase
    if (announceProgress > 0.85) {
      textAlpha = Math.max(0, (1 - announceProgress) / 0.15);
    }
  } else if (effectivePhase === 'DONE') {
    // DONE phase: fade out
    textAlpha = Math.max(0, 1 - effectivePhaseTimer / 30);
    textScale = 1.0;
  }
  ctx.globalAlpha = textAlpha;
  const fontSize = Math.round((isTimeOver ? 72 : 100) * textScale);

  // Enhanced K.O. text: white fill with red outline (Phase 52 spec)
  if (!isTimeOver) {
    // Red outline layer — thicker stroke for dramatic effect
    ctx.save();
    ctx.font = `bold ${fontSize}px "Courier New", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 60 + (textScale - 1) * 30;
    // Red outline
    ctx.strokeStyle = '#cc0000';
    ctx.lineWidth = Math.max(4, Math.round(fontSize / 12));
    ctx.lineJoin = 'round';
    ctx.strokeText(titleText, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
    // White fill
    ctx.fillStyle = '#ffffff';
    ctx.fillText(titleText, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
    ctx.shadowBlur = 0;
    ctx.restore();
  } else {
    // TIME OVER: keep original gold styling
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 60 + (textScale - 1) * 30;
    drawSNKText(ctx, titleText, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20, fontSize, titleColor);
    ctx.shadowBlur = 0;
  }
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;

  // Winner announcement
  if (winner !== null) {
    const wColor = winner === 0 ? '#ff6644' : '#4488ff';
    const winAlpha = Math.min(1, Math.max(0, (koTimer - 30) / 20));
    ctx.globalAlpha = winAlpha;
    ctx.shadowColor = wColor;
    ctx.shadowBlur = 12;
    drawSNKText(ctx, `P${winner + 1} WINS`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50, 28, wColor);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  } else {
    const dkAlpha = Math.min(1, Math.max(0, (koTimer - 30) / 20));
    ctx.globalAlpha = dkAlpha;
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 12;
    drawSNKText(ctx, 'DOUBLE KO', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50, 28, '#ffcc00');
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  // Finishing move name display for DM/SDM/HSDM KOs
  if (finishingAttackType && koTimer > 20) {
    const finishAlpha = Math.min(1, Math.max(0, (koTimer - 20) / 15));
    ctx.globalAlpha = finishAlpha;
    const tier = finishingAttackType.startsWith('HSDM_') ? 'HSDM'
      : finishingAttackType.startsWith('SDM_') ? 'SDM' : 'DM';
    const tierColor = tier === 'HSDM' ? '#ffff44'
      : tier === 'SDM' ? '#ff44ff' : '#ff6644';
    const tierLabel = tier === 'HSDM' ? 'HIDDEN SUPER'
      : tier === 'SDM' ? 'SUPER' : 'SUPER';

    // Tier label
    drawSNKText(ctx, tierLabel, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 82, 10, tierColor);

    // Attack name
    ctx.shadowColor = tierColor;
    ctx.shadowBlur = 10;
    const nameMap: Record<string, string> = {
      DM_TEN_HA_OU: '天地霸煌拳', SDM_TEN_HA_OU: '天地霸煌拳(MAX)',
      HSDM_RYUKO_RANBU: '龍虎乱舞(HSDM)', DM_RYUKO_RANBU: '龍虎乱舞', SDM_RYUKO_RANBU: '龍虎乱舞(MAX)',
      DM_OROCHINAGI: '大蛇薙', SDM_OROCHINAGI: '大蛇薙(MAX)', HSDM_OROCHINAGI: '大蛇薙(HSDM)',
      DM_YATAGARASU: '八咫烏', SDM_YATAGARASU: '八咫烏(MAX)', HSDM_YAOTOME: '八百萬夜闇(HSDM)',
    };
    const attackName = nameMap[finishingAttackType] ?? finishingAttackType.replace(/_/g, ' ');
    drawSNKText(ctx, attackName, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 98, 16, '#ffffff');
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  // PERFECT with golden glow and sparkles — enhanced with gold flash
  if (perfectPlayer !== null) {
    const perfAlpha = Math.min(1, Math.max(0, (koTimer - 50) / 20));
    ctx.globalAlpha = perfAlpha;

    // Phase 52: Gold flash burst behind PERFECT text
    const goldBurstR = 80 + Math.sin(koTimer * 0.06) * 20;
    const goldBurstGrad = ctx.createRadialGradient(
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 100, 5,
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 100, goldBurstR,
    );
    goldBurstGrad.addColorStop(0, `rgba(255, 220, 100, ${0.5 * perfAlpha})`);
    goldBurstGrad.addColorStop(0.3, `rgba(255, 200, 50, ${0.3 * perfAlpha})`);
    goldBurstGrad.addColorStop(1, 'rgba(255, 180, 0, 0)');
    ctx.fillStyle = goldBurstGrad;
    ctx.fillRect(CANVAS_WIDTH / 2 - goldBurstR, CANVAS_HEIGHT / 2 + 100 - goldBurstR, goldBurstR * 2, goldBurstR * 2);
    ctx.globalAlpha = perfAlpha;

    // Golden glow background behind PERFECT text
    const perfGlowGrad = ctx.createRadialGradient(
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 100, 10,
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 100, 120,
    );
    perfGlowGrad.addColorStop(0, `rgba(255, 200, 50, ${0.3 * perfAlpha})`);
    perfGlowGrad.addColorStop(0.5, `rgba(255, 170, 0, ${0.15 * perfAlpha})`);
    perfGlowGrad.addColorStop(1, 'rgba(255, 150, 0, 0)');
    ctx.fillStyle = perfGlowGrad;
    ctx.fillRect(CANVAS_WIDTH / 2 - 150, CANVAS_HEIGHT / 2 + 40, 300, 120);

    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 35;
    drawSNKText(ctx, 'PERFECT!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 100, 42, '#ffcc00');
    ctx.shadowBlur = 0;
    const perfColor = perfectPlayer === 0 ? '#ff6644' : '#4488ff';
    drawSNKText(ctx, `P${perfectPlayer + 1}`, CANVAS_WIDTH / 2 - 80, CANVAS_HEIGHT / 2 + 100, 16, perfColor);

    // Sparkle particles around PERFECT text
    const sparkleCount = 8;
    for (let s = 0; s < sparkleCount; s++) {
      const sparkleAngle = (s / sparkleCount) * Math.PI * 2 + koTimer * 0.03;
      const sparkleDist = 60 + Math.sin(koTimer * 0.05 + s) * 20;
      const sx = CANVAS_WIDTH / 2 + Math.cos(sparkleAngle) * sparkleDist;
      const sy = CANVAS_HEIGHT / 2 + 100 + Math.sin(sparkleAngle) * sparkleDist * 0.5;
      const sparkleSize = 2 + Math.sin(koTimer * 0.1 + s * 1.5) * 1.5;
      const sparkleAlpha = 0.5 + Math.sin(koTimer * 0.08 + s) * 0.3;
      ctx.fillStyle = `rgba(255, 230, 100, ${sparkleAlpha * perfAlpha})`;
      ctx.beginPath();
      // 4-pointed star shape
      ctx.moveTo(sx, sy - sparkleSize);
      ctx.lineTo(sx + sparkleSize * 0.3, sy);
      ctx.lineTo(sx, sy + sparkleSize);
      ctx.lineTo(sx - sparkleSize * 0.3, sy);
      ctx.closePath();
      ctx.fill();
    }

    // Bonus meter gain visual — golden upward arrows
    const arrowAlpha = Math.max(0, Math.sin(koTimer * 0.06)) * perfAlpha * 0.6;
    if (arrowAlpha > 0) {
      ctx.fillStyle = `rgba(255, 200, 50, ${arrowAlpha})`;
      ctx.font = 'bold 18px "Courier New", monospace';
      ctx.fillText('+METER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 140);
    }

    ctx.globalAlpha = 1;
  }

  // KO Result HP comparison — all KO types, not just time over
  if (winner !== null && koTimer > 55) {
    const resultAlpha = Math.min(1, (koTimer - 55) / 20);
    const barY = CANVAS_HEIGHT / 2 + 80;
    const barW = 240;
    const barH = 16;
    const barX = CANVAS_WIDTH / 2 - barW / 2;
    const p1Ratio = Math.max(0, p1Hp / maxHp);
    const p2Ratio = Math.max(0, p2Hp / maxHp);

    ctx.globalAlpha = resultAlpha;

    // Result card background
    ctx.fillStyle = 'rgba(5, 5, 15, 0.8)';
    roundRect(ctx, barX - 12, barY - 22, barW + 24, barH + 38, 6);
    ctx.fill();
    // Card border — winner side glows
    ctx.strokeStyle = winner === 0 ? 'rgba(255, 100, 60, 0.6)' : 'rgba(68, 136, 255, 0.6)';
    ctx.lineWidth = 1.5;
    roundRect(ctx, barX - 12, barY - 22, barW + 24, barH + 38, 6);
    ctx.stroke();

    // P1 label + HP percentage
    const p1Label = `P1 ${Math.round(p1Ratio * 100)}%`;
    drawSNKText(ctx, p1Label, barX - 5, barY - 10, 9, winner === 0 ? '#ff6644' : '#886655');
    // P2 label + HP percentage
    const p2Label = `${Math.round(p2Ratio * 100)}% P2`;
    drawSNKText(ctx, p2Label, barX + barW + 5, barY - 10, 9, winner === 1 ? '#4488ff' : '#556688');

    // HP bar background
    ctx.fillStyle = '#0f0f1a';
    roundRect(ctx, barX, barY, barW, barH, 3);
    ctx.fill();

    // P1 HP fill (left side)
    const p1FillW = Math.round(barW / 2 * p1Ratio);
    if (p1FillW > 0) {
      const p1Grad = ctx.createLinearGradient(barX, barY, barX, barY + barH);
      p1Grad.addColorStop(0, winner === 0 ? '#ff8855' : '#886655');
      p1Grad.addColorStop(1, winner === 0 ? '#cc4422' : '#554433');
      ctx.fillStyle = p1Grad;
      roundRect(ctx, barX, barY, p1FillW, barH, 3);
      ctx.fill();
    }

    // P2 HP fill (right side)
    const p2FillW = Math.round(barW / 2 * p2Ratio);
    if (p2FillW > 0) {
      const p2Grad = ctx.createLinearGradient(barX + barW - p2FillW, barY, barX + barW - p2FillW, barY + barH);
      p2Grad.addColorStop(0, winner === 1 ? '#6699ff' : '#556688');
      p2Grad.addColorStop(1, winner === 1 ? '#2244cc' : '#334455');
      ctx.fillStyle = p2Grad;
      roundRect(ctx, barX + barW - p2FillW, barY, p2FillW, barH, 3);
      ctx.fill();
    }

    // Center divider line
    ctx.strokeStyle = 'rgba(200, 168, 50, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, barY + 1);
    ctx.lineTo(CANVAS_WIDTH / 2, barY + barH - 1);
    ctx.stroke();

    // Winner side marker
    const markerX = winner === 0 ? barX - 3 : barX + barW + 3;
    const markerPulse = 0.6 + Math.sin(koTimer * 0.1) * 0.4;
    ctx.fillStyle = winner === 0 ? `rgba(255, 100, 60, ${markerPulse})` : `rgba(68, 136, 255, ${markerPulse})`;
    ctx.beginPath();
    if (winner === 0) {
      ctx.moveTo(markerX, barY + barH / 2 - 5);
      ctx.lineTo(markerX + 6, barY + barH / 2);
      ctx.lineTo(markerX, barY + barH / 2 + 5);
    } else {
      ctx.moveTo(markerX, barY + barH / 2 - 5);
      ctx.lineTo(markerX - 6, barY + barH / 2);
      ctx.lineTo(markerX, barY + barH / 2 + 5);
    }
    ctx.fill();

    // "WINNER" label under the winning side
    const winLabelX = winner === 0 ? barX + 20 : barX + barW - 20;
    drawSNKText(ctx, 'WIN', winLabelX, barY + barH + 6, 8, '#ffcc00');

    ctx.globalAlpha = 1;
  }

  // ─── Super Finish overlay (DM/SDM/HSDM KO) ────────────────────
  if (finishingAttackType && koTimer > 20) {
    const sfAlpha = Math.min(1, (koTimer - 20) / 25);
    const moveName = CN_MOVE_NAMES[finishingAttackType] ?? finishingAttackType.replace(/_/g, ' ');
    const tier: 'dm' | 'sdm' | 'hsdm' = finishingAttackType.startsWith('HSDM_') ? 'hsdm' : finishingAttackType.startsWith('SDM_') ? 'sdm' : 'dm';
    const charColor = CHAR_COLORS[finishingCharId] ?? '#ff4400';

    ctx.save();
    ctx.globalAlpha = sfAlpha;

    // Move name — large text at upper area
    const sfY = CANVAS_HEIGHT / 2 - 110;
    const sfBaseSize = tier === 'hsdm' ? 30 : tier === 'sdm' ? 26 : 22;
    const sfBurstScale = koTimer < 28 ? 1 + (1 - (koTimer - 20) / 8) * 0.5 : 1;
    const sfFontSize = Math.round(sfBaseSize * sfBurstScale);

    ctx.shadowColor = tier === 'hsdm' ? '#ffcc00' : tier === 'sdm' ? '#ffaa00' : charColor;
    ctx.shadowBlur = tier === 'hsdm' ? 25 : 18;
    // Outline
    ctx.font = `bold ${sfFontSize}px "Courier New", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(3, sfFontSize * 0.1);
    ctx.lineJoin = 'round';
    ctx.strokeText(moveName, CANVAS_WIDTH / 2, sfY);
    // Fill
    ctx.fillStyle = tier === 'hsdm' ? '#ffdd66' : tier === 'sdm' ? '#ffcc44' : charColor;
    ctx.fillText(moveName, CANVAS_WIDTH / 2, sfY);
    ctx.shadowBlur = 0;

    // Tier label
    const tierLabel = tier === 'hsdm' ? 'HIDDEN SUPER FINISH' : tier === 'sdm' ? 'MAX SUPER FINISH' : 'SUPER FINISH';
    const tierColor = tier === 'hsdm' ? '#ff6688' : tier === 'sdm' ? '#ffaa44' : '#ccddff';
    const labelAlpha = Math.min(1, Math.max(0, (koTimer - 30) / 15));
    ctx.globalAlpha = sfAlpha * labelAlpha;
    ctx.font = `bold 12px "Courier New", monospace`;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeText(tierLabel, CANVAS_WIDTH / 2, sfY + sfFontSize * 0.7 + 4);
    ctx.fillStyle = tierColor;
    ctx.fillText(tierLabel, CANVAS_WIDTH / 2, sfY + sfFontSize * 0.7 + 4);

    // HSDM extra: dual energy lines
    if (tier === 'hsdm' && koTimer < 55) {
      const lineP = (koTimer - 20) / 35;
      const lineW = Math.min(CANVAS_WIDTH * 0.8, lineP * CANVAS_WIDTH);
      const lineY1 = sfY - sfFontSize / 2 - 8;
      const lineY2 = sfY + sfFontSize / 2 + 20;
      ctx.globalAlpha = sfAlpha * Math.max(0, 1 - lineP) * 0.6;
      const hLineGrad = ctx.createLinearGradient(CANVAS_WIDTH / 2 - lineW / 2, 0, CANVAS_WIDTH / 2 + lineW / 2, 0);
      hLineGrad.addColorStop(0, 'rgba(255,200,60,0)');
      hLineGrad.addColorStop(0.3, 'rgba(255,200,60,0.8)');
      hLineGrad.addColorStop(0.5, 'rgba(255,255,200,1)');
      hLineGrad.addColorStop(0.7, 'rgba(255,200,60,0.8)');
      hLineGrad.addColorStop(1, 'rgba(255,200,60,0)');
      ctx.fillStyle = hLineGrad;
      ctx.fillRect(CANVAS_WIDTH / 2 - lineW / 2, lineY1, lineW, 2);
      ctx.fillRect(CANVAS_WIDTH / 2 - lineW / 2, lineY2, lineW, 2);
    }

    // SDM/HSDM: background glow pulse
    if ((tier === 'sdm' || tier === 'hsdm') && koTimer < 50) {
      const glowP = (koTimer - 20) / 30;
      const glowR = 60 + glowP * 100;
      const glowAlpha = Math.max(0, (1 - glowP) * 0.25);
      ctx.globalAlpha = sfAlpha * glowAlpha;
      const sfGlow = ctx.createRadialGradient(CANVAS_WIDTH / 2, sfY, 5, CANVAS_WIDTH / 2, sfY, glowR);
      sfGlow.addColorStop(0, tier === 'hsdm' ? 'rgba(255,220,80,0.6)' : 'rgba(255,180,40,0.5)');
      sfGlow.addColorStop(1, 'rgba(255,180,40,0)');
      ctx.fillStyle = sfGlow;
      ctx.fillRect(CANVAS_WIDTH / 2 - glowR, sfY - glowR, glowR * 2, glowR * 2);
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '13px "Courier New", monospace';
  ctx.fillText('Press R to restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 170);

  ctx.restore();
}

