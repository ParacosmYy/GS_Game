/**
 * 角色专属必杀技/超必杀技攻击肢体渲染 — 入口调度 + Iori/Terry/Kim/Ryo/Leona
 * Kyo/K'/Kula/DM 渲染在 attackLimbSpecials2.ts 中
 */
import { Fighter } from '../entities/fighter.js';
import { AttackType } from '../core/types.js';
import { FIGHTER_WIDTH } from '../core/constants.js';
import { ROSTER } from '../characters/index.js';
import { drawSpecialAttackLimb2 } from './attackLimbSpecials2.js';

/** 绘制角色专属必杀技/超必杀技的攻击肢体视觉效果 */
export function drawSpecialAttackLimb(
  ctx: CanvasRenderingContext2D,
  f: Fighter,
  sx: number,
  sy: number,
  progress: number,
  limbLen: number,
  isHeavy: boolean,
): boolean {
  const charDef = ROSTER.find(c => c.id === f.charId);
  const specialColor = charDef?.specialColor || '#ff4400';
  const specialGlow = charDef?.specialGlow || '#ff6600';

  // ── 八神庵 specials ──
  if (f.currentAttack === AttackType.IORI_AOIHANA
    || f.currentAttack === AttackType.IORI_AOIHANA_2
    || f.currentAttack === AttackType.IORI_AOIHANA_3) {
    drawIoriAoihana(ctx, f, sx, sy, progress, limbLen, specialColor, specialGlow);
    return true;
  }
  if (f.currentAttack === AttackType.IORI_ONIYAKI || f.currentAttack === AttackType.IORI_ONIYAKI_C) {
    drawIoriOniyaki(ctx, f, sx, sy, progress, limbLen, specialColor, specialGlow);
    return true;
  }
  if (f.currentAttack === AttackType.IORI_KOTOTSUKI) {
    drawIoriKototsuki(ctx, f, sx, sy, progress, limbLen, specialColor, specialGlow);
    return true;
  }
  if (f.currentAttack === AttackType.IORI_YAMIBARAI || f.currentAttack === AttackType.IORI_YAMIBARAI_C) {
    drawIoriYamibarai(ctx, f, sx, sy, limbLen);
    return true;
  }

  // ── 特瑞 specials ──
  if (f.currentAttack === AttackType.TERRY_BURN_KNUCKLE) {
    drawTerryBurnKnuckle(ctx, f, sx, sy, progress, limbLen, specialColor, specialGlow);
    return true;
  }
  if (f.currentAttack === AttackType.TERRY_CRACK_SHOT) {
    drawTerryCrackShot(ctx, f, sx, sy, limbLen);
    return true;
  }
  if (f.currentAttack === AttackType.TERRY_POWER_DUNK) {
    drawTerryPowerDunk(ctx, f, sx, sy, progress, limbLen, specialColor, specialGlow);
    return true;
  }
  if (f.currentAttack === AttackType.TERRY_RISING_TACKLE) {
    drawTerryRisingTackle(ctx, f, sx, sy, limbLen, specialColor, specialGlow);
    return true;
  }
  if (f.currentAttack === AttackType.TERRY_POWER_WAVE) {
    drawTerryPowerWave(ctx, f, sx, sy, progress, limbLen, specialColor, specialGlow);
    return true;
  }

  // ── 金 specials ──
  if (f.currentAttack === AttackType.KIM_HIENZAN) {
    drawKimHienzan(ctx, f, sx, sy, limbLen, specialColor, specialGlow);
    return true;
  }
  if (f.currentAttack === AttackType.KIM_HANGETSU) {
    drawKimHangetsu(ctx, f, sx, sy, progress, limbLen, specialColor, specialGlow);
    return true;
  }
  if (f.currentAttack === AttackType.KIM_HISHOU) {
    drawKimHishou(ctx, f, sx, sy, progress, limbLen, specialColor, specialGlow);
    return true;
  }
  if (f.currentAttack === AttackType.KIM_HAKI) {
    drawKimHaki(ctx, f, sx, sy, limbLen, specialColor, specialGlow);
    return true;
  }
  if (f.currentAttack === AttackType.KIM_SANREN) {
    drawKimSanren(ctx, f, sx, sy, limbLen, specialColor, specialGlow);
    return true;
  }

  // ── 坂崎亮 (Ryo) ──
  if (f.currentAttack === AttackType.RYO_KO_HOU || f.currentAttack === AttackType.RYO_KO_HOU_C) {
    drawRyoKoHou(ctx, f, sx, sy, progress, limbLen);
    return true;
  }
  if (f.currentAttack === AttackType.RYO_KOOU || f.currentAttack === AttackType.RYO_KOOU_C) {
    drawRyoKoou(ctx, f, sx, sy, limbLen);
    return true;
  }
  if (f.currentAttack === AttackType.RYO_HIEN) {
    drawRyoHien(ctx, f, sx, sy, limbLen);
    return true;
  }
  if (f.currentAttack === AttackType.RYO_HAOU) {
    drawRyoHaou(ctx, f, sx, sy, limbLen);
    return true;
  }
  if (f.currentAttack === AttackType.RYO_TSURIZAO) {
    drawRyoTsurizao(ctx, f, sx, sy, limbLen);
    return true;
  }
  if (f.currentAttack === AttackType.RYO_ORISHI) {
    drawRyoOrishi(ctx, f, sx, sy, limbLen);
    return true;
  }

  // ── 莉安娜 (Leona) ──
  if (f.currentAttack === AttackType.LEONA_EAR_RING || f.currentAttack === AttackType.LEONA_EAR_RING_C) {
    drawLeonaEarRing(ctx, f, sx, sy, progress, limbLen);
    return true;
  }
  if (f.currentAttack === AttackType.LEONA_MOON_SLASH || f.currentAttack === AttackType.LEONA_MOON_SLASH_C) {
    drawLeonaMoonSlash(ctx, f, sx, sy, limbLen);
    return true;
  }
  if (f.currentAttack === AttackType.LEONA_GRAND_SABER) {
    drawLeonaGrandSaber(ctx, f, sx, sy, limbLen);
    return true;
  }
  if (f.currentAttack === AttackType.LEONA_BALTIC) {
    drawLeonaBaltic(ctx, f, sx, sy, limbLen);
    return true;
  }

  // 委托给第二组：京/K'/Kula/DM
  return drawSpecialAttackLimb2(ctx, f, sx, sy, progress, limbLen);
}

// ── 八神庵 ──────────────────────────────────────

function drawIoriAoihana(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number, specialColor: string, specialGlow: string,
): void {
  const reach = limbLen * (f.currentAttack === AttackType.IORI_AOIHANA_3 ? 1.3 : 1.0);
  ctx.strokeStyle = specialColor;
  ctx.shadowColor = specialGlow;
  ctx.shadowBlur = 16;
  ctx.lineWidth = f.currentAttack === AttackType.IORI_AOIHANA_3 ? 14 : 10;
  if (f.currentAttack === AttackType.IORI_AOIHANA_2) {
    ctx.beginPath();
    ctx.moveTo(sx + 5 * f.facing, sy - 10);
    ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - 5);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(sx + 10 * f.facing, sy - f.displayHeight * 0.55);
    ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.5);
    ctx.stroke();
  }
  ctx.fillStyle = `${specialGlow}66`;
  ctx.beginPath();
  ctx.arc(sx + (FIGHTER_WIDTH / 2 + reach * 0.7) * f.facing, sy - f.displayHeight * 0.5,
    8 + progress * 6, 0, Math.PI * 2);
  ctx.fill();
}

function drawIoriOniyaki(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number, specialColor: string, specialGlow: string,
): void {
  const isStrong = f.currentAttack === AttackType.IORI_ONIYAKI_C;
  const reach = limbLen * (isStrong ? 1.5 : 1.3);
  ctx.strokeStyle = specialColor;
  ctx.shadowColor = specialGlow;
  ctx.shadowBlur = isStrong ? 28 : 20;
  ctx.lineWidth = isStrong ? 18 : 14;
  ctx.beginPath();
  ctx.moveTo(sx + 8 * f.facing, sy - f.displayHeight * 0.5);
  ctx.lineTo(sx + 12 * f.facing, sy - f.displayHeight * 0.5 - reach);
  ctx.stroke();
  ctx.fillStyle = `${specialGlow}44`;
  ctx.beginPath();
  ctx.arc(sx + 12 * f.facing, sy - f.displayHeight * 0.5 - reach,
    10 + progress * 8, 0, Math.PI * 2);
  ctx.fill();
}

function drawIoriKototsuki(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number, specialColor: string, specialGlow: string,
): void {
  const reach = limbLen * 1.2;
  ctx.strokeStyle = specialColor;
  ctx.shadowColor = specialGlow;
  ctx.shadowBlur = 16;
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.4);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.35);
  ctx.stroke();
  ctx.fillStyle = `${specialGlow}44`;
  ctx.beginPath();
  ctx.arc(sx + (FIGHTER_WIDTH / 2 + reach * 0.8) * f.facing, sy - f.displayHeight * 0.38,
    8 + progress * 6, 0, Math.PI * 2);
  ctx.fill();
}

function drawIoriYamibarai(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  limbLen: number,
): void {
  const reach = limbLen * 0.7;
  ctx.strokeStyle = '#aa1133';
  ctx.shadowColor = '#8800cc';
  ctx.shadowBlur = 14;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(sx + 10 * f.facing, sy - f.displayHeight * 0.55);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.55);
  ctx.stroke();
}

// ── 特瑞 ──────────────────────────────────────

function drawTerryBurnKnuckle(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number, specialColor: string, specialGlow: string,
): void {
  const reach = limbLen * 1.2;
  ctx.strokeStyle = specialColor;
  ctx.shadowColor = specialGlow;
  ctx.shadowBlur = 18;
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(sx + 10 * f.facing, sy - f.displayHeight * 0.5);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.5);
  ctx.stroke();
  ctx.fillStyle = `${specialColor}88`;
  ctx.beginPath();
  ctx.arc(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.5,
    10 + progress * 8, 0, Math.PI * 2);
  ctx.fill();
}

function drawTerryCrackShot(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  limbLen: number,
): void {
  ctx.strokeStyle = '#4488ff';
  ctx.shadowColor = '#2266ff';
  ctx.shadowBlur = 16;
  ctx.lineWidth = 12;
  const reach = limbLen * 1.2;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.35);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.6);
  ctx.stroke();
}

function drawTerryPowerDunk(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number, specialColor: string, specialGlow: string,
): void {
  const reach = limbLen * 1.4;
  ctx.strokeStyle = specialColor;
  ctx.shadowColor = specialGlow;
  ctx.shadowBlur = 20;
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.45);
  ctx.lineTo(sx + 12 * f.facing, sy - f.displayHeight * 0.45 - reach);
  ctx.stroke();
  ctx.fillStyle = `${specialGlow}55`;
  ctx.beginPath();
  ctx.arc(sx + 12 * f.facing, sy - f.displayHeight * 0.45 - reach,
    12 + progress * 8, 0, Math.PI * 2);
  ctx.fill();
}

function drawTerryRisingTackle(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  limbLen: number, specialColor: string, specialGlow: string,
): void {
  const reach = limbLen * 1.5;
  ctx.strokeStyle = specialColor;
  ctx.shadowColor = specialGlow;
  ctx.shadowBlur = 20;
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.5);
  ctx.lineTo(sx + 8 * f.facing, sy - f.displayHeight * 0.5 - reach);
  ctx.stroke();
  ctx.strokeStyle = `${specialGlow}33`;
  ctx.lineWidth = 3;
  for (let i = 0; i < 4; i++) {
    const yOff = -reach * (0.2 + i * 0.2);
    ctx.beginPath();
    ctx.moveTo(sx + (3 + i * 3) * f.facing, sy - f.displayHeight * 0.5 + yOff);
    ctx.lineTo(sx + (3 + i * 3) * f.facing, sy - f.displayHeight * 0.5 + yOff - 15);
    ctx.stroke();
  }
}

function drawTerryPowerWave(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number, specialColor: string, specialGlow: string,
): void {
  const reach = limbLen * 0.8;
  ctx.strokeStyle = specialColor;
  ctx.shadowColor = specialGlow;
  ctx.shadowBlur = 16;
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(sx + 10 * f.facing, sy - f.displayHeight * 0.5);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.5);
  ctx.stroke();
  ctx.fillStyle = `${specialColor}44`;
  ctx.beginPath();
  ctx.arc(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.5,
    8 + progress * 8, 0, Math.PI * 2);
  ctx.fill();
}

// ── 金 ──────────────────────────────────────

function drawKimHienzan(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  limbLen: number, specialColor: string, specialGlow: string,
): void {
  const reach = limbLen * 1.4;
  ctx.strokeStyle = specialColor;
  ctx.shadowColor = specialGlow;
  ctx.shadowBlur = 18;
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.35);
  ctx.lineTo(sx + 10 * f.facing, sy - f.displayHeight * 0.35 - reach);
  ctx.stroke();
  ctx.strokeStyle = `${specialGlow}44`;
  ctx.lineWidth = 3;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(sx + (i * 4 - 4) * f.facing, sy - f.displayHeight * 0.3);
    ctx.lineTo(sx + (i * 4 - 2) * f.facing, sy - f.displayHeight * 0.3 - reach * 0.8);
    ctx.stroke();
  }
}

function drawKimHangetsu(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number, specialColor: string, specialGlow: string,
): void {
  const reach = limbLen * 1.2;
  ctx.strokeStyle = specialColor;
  ctx.shadowColor = specialGlow;
  ctx.shadowBlur = 18;
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.35);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.6);
  ctx.stroke();
  ctx.fillStyle = `${specialGlow}44`;
  ctx.beginPath();
  ctx.arc(sx + (FIGHTER_WIDTH / 2 + reach * 0.6) * f.facing, sy - f.displayHeight * 0.5,
    12 + progress * 8, 0, Math.PI * 2);
  ctx.fill();
}

function drawKimHishou(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number, specialColor: string, specialGlow: string,
): void {
  const reach = limbLen * 1.3;
  ctx.strokeStyle = specialGlow;
  ctx.shadowColor = specialColor;
  ctx.shadowBlur = 16;
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.3);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy);
  ctx.stroke();
  ctx.fillStyle = `${specialColor}44`;
  ctx.beginPath();
  ctx.arc(sx + (FIGHTER_WIDTH / 2 + reach * 0.7) * f.facing, sy - f.displayHeight * 0.1,
    10 + progress * 6, 0, Math.PI * 2);
  ctx.fill();
}

function drawKimHaki(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  limbLen: number, specialColor: string, specialGlow: string,
): void {
  ctx.strokeStyle = specialColor;
  ctx.shadowColor = specialGlow;
  ctx.shadowBlur = 14;
  ctx.lineWidth = 10;
  const reach = limbLen * 1.0;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - 8);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - 3);
  ctx.stroke();
}

function drawKimSanren(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  limbLen: number, specialColor: string, specialGlow: string,
): void {
  const reach = limbLen * 1.1;
  ctx.strokeStyle = specialColor;
  ctx.shadowColor = specialGlow;
  ctx.shadowBlur = 14;
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(sx + 10 * f.facing, sy - f.displayHeight * 0.55);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.5);
  ctx.stroke();
}

// ── 坂崎亮 (Ryo) ──────────────────────────────────────

function drawRyoKoHou(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number,
): void {
  const isStrong = f.currentAttack === AttackType.RYO_KO_HOU_C;
  const reach = limbLen * (isStrong ? 1.5 : 1.3);
  const tipX = sx + 10 * f.facing;
  const tipY = sy - f.displayHeight * 0.5 - reach;

  // Afterimage (残影) effect — fading ghost copies of the uppercut arm arc
  const ghostCount = isStrong ? 4 : 3;
  for (let g = ghostCount; g >= 1; g--) {
    const ghostAlpha = 0.15 / g;
    const ghostOffset = g * 8 * f.facing; // each ghost trails behind
    ctx.globalAlpha = ghostAlpha;
    ctx.strokeStyle = '#ffaa22';
    ctx.lineWidth = isStrong ? 16 : 12;
    ctx.shadowColor = '#ff8800';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(sx + 5 * f.facing - ghostOffset, sy - f.displayHeight * 0.5 + g * 6);
    ctx.lineTo(tipX - ghostOffset, tipY + g * 4);
    ctx.stroke();
    // Ghost glow at tip
    ctx.fillStyle = '#ffcc0033';
    ctx.beginPath();
    ctx.arc(tipX - ghostOffset, tipY + g * 4, 8 + progress * 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Restore full alpha for main limb
  ctx.globalAlpha = 1;
  ctx.strokeStyle = '#ffaa22';
  ctx.shadowColor = '#ff8800';
  ctx.shadowBlur = isStrong ? 28 : 20;
  ctx.lineWidth = isStrong ? 18 : 14;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.5);
  ctx.lineTo(tipX, tipY);
  ctx.stroke();
  ctx.fillStyle = '#ffcc0066';
  ctx.beginPath();
  ctx.arc(tipX, tipY,
    (isStrong ? 16 : 12) + progress * (isStrong ? 12 : 8), 0, Math.PI * 2);
  ctx.fill();
}

function drawRyoKoou(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  limbLen: number,
): void {
  const reach = limbLen * 0.7;
  ctx.strokeStyle = '#ffaa22';
  ctx.shadowColor = '#ff8800';
  ctx.shadowBlur = 14;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(sx + 10 * f.facing, sy - f.displayHeight * 0.55);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.55);
  ctx.stroke();
}

function drawRyoHien(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  limbLen: number,
): void {
  const reach = limbLen * 1.2;
  ctx.strokeStyle = '#ffaa22';
  ctx.shadowColor = '#ff8800';
  ctx.shadowBlur = 16;
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.55);
  ctx.lineTo(sx + 10 * f.facing, sy - f.displayHeight * 0.55 - reach);
  ctx.stroke();
}

function drawRyoHaou(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  limbLen: number,
): void {
  const reach = limbLen * 1.1;
  ctx.strokeStyle = '#ffaa22';
  ctx.shadowColor = '#ff8800';
  ctx.shadowBlur = 18;
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.moveTo(sx + 10 * f.facing, sy - f.displayHeight * 0.55);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.5);
  ctx.stroke();
}

// ── Ryo 命令通常技 ──────────────────────────────────────

/** RYO_TSURIZAO (→+A): 冰柱割り — diagonal downward knife-hand strike */
function drawRyoTsurizao(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  limbLen: number,
): void {
  const reach = limbLen * 1.1;
  ctx.strokeStyle = '#ffdd44';
  ctx.shadowColor = '#ffaa00';
  ctx.shadowBlur = 12;
  ctx.lineWidth = 10;
  // Diagonal slash from upper-right to lower-left (overhead arc)
  ctx.beginPath();
  ctx.moveTo(sx + 10 * f.facing, sy - f.displayHeight * 0.7);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.35);
  ctx.stroke();
  // Small arc hint for the overhead swing
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.strokeStyle = '#ffee88';
  ctx.lineWidth = 6;
  const arcCx = sx + 12 * f.facing;
  const arcCy = sy - f.displayHeight * 0.6;
  ctx.beginPath();
  ctx.arc(arcCx, arcCy, reach * 0.5,
    f.facing > 0 ? -Math.PI * 0.7 : Math.PI - 0.3,
    f.facing > 0 ? -Math.PI * 0.1 : Math.PI + 0.3);
  ctx.stroke();
  ctx.restore();
}

/** RYO_ORISHI (↘+B): 落蹴 — low sweeping kick near ground level */
function drawRyoOrishi(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  limbLen: number,
): void {
  const reach = limbLen * 1.1;
  ctx.strokeStyle = '#44ddff';
  ctx.shadowColor = '#00aaff';
  ctx.shadowBlur = 10;
  ctx.lineWidth = 10;
  // Horizontal line near ground level (low sweep)
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - 8);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - 3);
  ctx.stroke();
}

// ── 莉安娜 (Leona) ──────────────────────────────────────

function drawLeonaEarRing(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number,
): void {
  const isStrong = f.currentAttack === AttackType.LEONA_EAR_RING_C;
  const reach = limbLen * (isStrong ? 1.5 : 1.3);
  ctx.strokeStyle = '#44aaff';
  ctx.shadowColor = '#2266dd';
  ctx.shadowBlur = isStrong ? 28 : 20;
  ctx.lineWidth = isStrong ? 18 : 14;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.5);
  ctx.lineTo(sx + 10 * f.facing, sy - f.displayHeight * 0.5 - reach);
  ctx.stroke();
  ctx.fillStyle = '#88ccff66';
  ctx.beginPath();
  ctx.arc(sx + 10 * f.facing, sy - f.displayHeight * 0.5 - reach,
    (isStrong ? 16 : 12) + progress * (isStrong ? 12 : 8), 0, Math.PI * 2);
  ctx.fill();
}

function drawLeonaMoonSlash(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  limbLen: number,
): void {
  const reach = limbLen * 0.7;
  ctx.strokeStyle = '#44aaff';
  ctx.shadowColor = '#2266dd';
  ctx.shadowBlur = 14;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(sx + 10 * f.facing, sy - f.displayHeight * 0.55);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.55);
  ctx.stroke();
}

function drawLeonaGrandSaber(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  limbLen: number,
): void {
  const reach = limbLen * 1.2;
  ctx.strokeStyle = '#44aaff';
  ctx.shadowColor = '#2266dd';
  ctx.shadowBlur = 16;
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(sx + 10 * f.facing, sy - f.displayHeight * 0.55);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.5);
  ctx.stroke();
}

function drawLeonaBaltic(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  limbLen: number,
): void {
  const reach = limbLen * 1.0;
  ctx.strokeStyle = '#44aaff';
  ctx.shadowColor = '#2266dd';
  ctx.shadowBlur = 14;
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(sx + 8 * f.facing, sy - f.displayHeight * 0.3);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.25);
  ctx.stroke();
}
