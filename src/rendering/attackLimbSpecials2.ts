/**
 * 角色专属必杀技/超必杀技攻击肢体渲染 — 京/K'/Kula/Robert/DM超必杀
 * 从 attackLimbSpecials.ts 拆分出来
 */
import { Fighter } from '../entities/fighter.js';
import { AttackType } from '../core/types.js';
import { FIGHTER_WIDTH } from '../core/constants.js';
import { drawDmLimb } from './attackLimbDMs.js';

/** 绘制京/K'/Kula/DM超必杀的攻击肢体（第二组调度） */
export function drawSpecialAttackLimb2(
  ctx: CanvasRenderingContext2D,
  f: Fighter,
  sx: number,
  sy: number,
  progress: number,
  limbLen: number,
): boolean {
  // ── 京 specials ──
  if (f.currentAttack === AttackType.KYO_75KAI || f.currentAttack === AttackType.KYO_75KAI_2) {
    drawKyo75Kai(ctx, f, sx, sy, limbLen);
    return true;
  }
  if (f.currentAttack === AttackType.KYO_RED_KICK) {
    drawKyoRedKick(ctx, f, sx, sy, limbLen);
    return true;
  }
  if (f.currentAttack === AttackType.KYO_ARAGAMI
    || f.currentAttack === AttackType.KYO_DOKUGAMI) {
    drawKyoAragami(ctx, f, sx, sy, progress, limbLen);
    return true;
  }
  if (f.currentAttack === AttackType.KYO_ARAGAMI_KONOKIZU) {
    drawKyoAragamiKonokizu(ctx, f, sx, sy, limbLen);
    return true;
  }
  if (f.currentAttack === AttackType.KYO_ARAGAMI_YANOSABI) {
    drawKyoAragamiYanosabi(ctx, f, sx, sy, limbLen);
    return true;
  }
  if (f.currentAttack === AttackType.KYO_TSUMIYOMI) {
    drawKyoTsumiyomi(ctx, f, sx, sy, limbLen);
    return true;
  }
  if (f.currentAttack === AttackType.KYO_BATSUYOMI) {
    drawKyoBatsuyomi(ctx, f, sx, sy, progress, limbLen);
    return true;
  }
  if (f.currentAttack === AttackType.KYO_ONIYAKI || f.currentAttack === AttackType.KYO_ONIYAKI_C) {
    drawKyoOniyaki(ctx, f, sx, sy, progress, limbLen);
    return true;
  }
  if (f.currentAttack === AttackType.KYO_YAMIBARAI || f.currentAttack === AttackType.KYO_YAMIBARAI_C) {
    drawKyoYamibarai(ctx, f, sx, sy, limbLen);
    return true;
  }

  // ── K' specials ──
  if (f.currentAttack === AttackType.KDASH_EINS || f.currentAttack === AttackType.KDASH_EINS_C) {
    drawKdashEins(ctx, f, sx, sy, progress, limbLen);
    return true;
  }
  if (f.currentAttack === AttackType.KDASH_CROW || f.currentAttack === AttackType.KDASH_CROW_C) {
    drawKdashCrow(ctx, f, sx, sy, progress, limbLen);
    return true;
  }
  if (f.currentAttack === AttackType.KDASH_MINUTE || f.currentAttack === AttackType.KDASH_NARROW) {
    drawKdashMinute(ctx, f, sx, sy, progress, limbLen);
    return true;
  }

  // ── 罗伯特 (Robert) ──
  if (f.currentAttack === AttackType.ROBERT_RYU_ZAN || f.currentAttack === AttackType.ROBERT_RYU_ZAN_C) {
    drawRobertRyuZan(ctx, f, sx, sy, progress, limbLen);
    return true;
  }
  if (f.currentAttack === AttackType.ROBERT_RYU_GEKI || f.currentAttack === AttackType.ROBERT_RYU_GEKI_C) {
    drawRobertRyuGeki(ctx, f, sx, sy, limbLen);
    return true;
  }
  if (f.currentAttack === AttackType.ROBERT_HIEN_RYU_JIN) {
    drawRobertHienRyuJin(ctx, f, sx, sy, progress, limbLen);
    return true;
  }
  if (f.currentAttack === AttackType.ROBERT_GENEI_KYAKU) {
    drawRobertGeneiKyaku(ctx, f, sx, sy, limbLen);
    return true;
  }
  if (f.currentAttack === AttackType.ROBERT_HIEN_RYU_KYAKU) {
    drawRobertHienRyuKyaku(ctx, f, sx, sy, limbLen);
    return true;
  }

  // ── Kula specials ──
  if (f.currentAttack === AttackType.KULA_BREATH || f.currentAttack === AttackType.KULA_BREATH_C) {
    drawKulaBreath(ctx, f, sx, sy, progress, limbLen);
    return true;
  }
  if (f.currentAttack === AttackType.KULA_SHELL || f.currentAttack === AttackType.KULA_SHELL_C) {
    drawKulaShell(ctx, f, sx, sy, progress, limbLen);
    return true;
  }
  if (f.currentAttack === AttackType.KULA_LAY || f.currentAttack === AttackType.KULA_EDGE) {
    drawKulaLay(ctx, f, sx, sy, progress, limbLen);
    return true;
  }

  // ── DM 超必杀 visuals ──
  const name = f.currentAttack as string;
  if (name.startsWith('DM_') || name.startsWith('SDM_')) {
    drawDmLimb(ctx, f, sx, sy, progress, limbLen, name);
    return true;
  }

  return false;
}

// ── 京 specials ──────────────────────────────────────

function drawKyo75Kai(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  limbLen: number,
): void {
  const reach = limbLen * (f.currentAttack === AttackType.KYO_75KAI_2 ? 1.2 : 1.0);
  ctx.strokeStyle = '#ff4400';
  ctx.shadowColor = '#ff6600';
  ctx.shadowBlur = 14;
  ctx.lineWidth = f.currentAttack === AttackType.KYO_75KAI_2 ? 12 : 10;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.35);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.25);
  ctx.stroke();
}

function drawKyoRedKick(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  limbLen: number,
): void {
  ctx.strokeStyle = '#ff4400';
  ctx.shadowColor = '#ff2200';
  ctx.shadowBlur = 16;
  ctx.lineWidth = 12;
  const reach = limbLen * 1.3;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.4);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.65);
  ctx.stroke();
}

function drawKyoAragami(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number,
): void {
  const reach = limbLen * 1.1;
  ctx.strokeStyle = '#ff6622';
  ctx.shadowColor = '#ff4400';
  ctx.shadowBlur = 16;
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(sx + 10 * f.facing, sy - f.displayHeight * 0.6);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.55);
  ctx.stroke();
  ctx.fillStyle = '#ffaa0088';
  ctx.beginPath();
  ctx.arc(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.55,
    8 + progress * 6, 0, Math.PI * 2);
  ctx.fill();
}

function drawKyoAragamiKonokizu(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  limbLen: number,
): void {
  const reach = limbLen * 1.2;
  ctx.strokeStyle = '#ff8822';
  ctx.shadowColor = '#ff4400';
  ctx.lineWidth = 11;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.5);
  ctx.lineTo(sx + 10 * f.facing, sy - f.displayHeight * 0.5 - reach);
  ctx.stroke();
}

function drawKyoAragamiYanosabi(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  limbLen: number,
): void {
  ctx.strokeStyle = '#ff4400';
  ctx.shadowColor = '#ff2200';
  ctx.shadowBlur = 20;
  ctx.lineWidth = 14;
  const reach = limbLen * 1.3;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.7);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.35);
  ctx.stroke();
}

function drawKyoTsumiyomi(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  limbLen: number,
): void {
  const reach = limbLen * 1.0;
  ctx.strokeStyle = '#ff6622';
  ctx.shadowColor = '#ff4400';
  ctx.lineWidth = 11;
  ctx.beginPath();
  ctx.moveTo(sx + 10 * f.facing, sy - f.displayHeight * 0.55);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.5);
  ctx.stroke();
}

function drawKyoBatsuyomi(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number,
): void {
  ctx.strokeStyle = '#ff4400';
  ctx.shadowColor = '#ff2200';
  ctx.shadowBlur = 20;
  ctx.lineWidth = 14;
  const reach = limbLen * 1.4;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.5);
  ctx.lineTo(sx + 10 * f.facing, sy - f.displayHeight * 0.5 - reach);
  ctx.stroke();
  ctx.fillStyle = '#ffaa0066';
  ctx.beginPath();
  ctx.arc(sx + 10 * f.facing, sy - f.displayHeight * 0.5 - reach,
    12 + progress * 8, 0, Math.PI * 2);
  ctx.fill();
}

function drawKyoOniyaki(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number,
): void {
  const isStrong = f.currentAttack === AttackType.KYO_ONIYAKI_C;
  const reach = limbLen * (isStrong ? 1.5 : 1.3);
  ctx.strokeStyle = '#ff6622';
  ctx.shadowColor = '#ff4400';
  ctx.shadowBlur = isStrong ? 28 : 20;
  ctx.lineWidth = isStrong ? 18 : 14;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.5);
  ctx.lineTo(sx + 10 * f.facing, sy - f.displayHeight * 0.5 - reach);
  ctx.stroke();
  ctx.fillStyle = '#ffaa0066';
  ctx.beginPath();
  ctx.arc(sx + 10 * f.facing, sy - f.displayHeight * 0.5 - reach,
    (isStrong ? 16 : 12) + progress * (isStrong ? 12 : 8), 0, Math.PI * 2);
  ctx.fill();
}

function drawKyoYamibarai(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  limbLen: number,
): void {
  const reach = limbLen * 0.7;
  ctx.strokeStyle = '#ff6622';
  ctx.shadowColor = '#ff4400';
  ctx.shadowBlur = 14;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(sx + 10 * f.facing, sy - f.displayHeight * 0.55);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.55);
  ctx.stroke();
}

// ── K' ──────────────────────────────────────

function drawKdashEins(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number,
): void {
  const reach = limbLen * 1.1;
  ctx.strokeStyle = '#ff4400';
  ctx.shadowColor = '#ff6600';
  ctx.shadowBlur = 16;
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(sx + 10 * f.facing, sy - f.displayHeight * 0.55);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.5);
  ctx.stroke();
  ctx.fillStyle = '#ff660066';
  ctx.beginPath();
  ctx.arc(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.52,
    10 + progress * 6, 0, Math.PI * 2);
  ctx.fill();
}

function drawKdashCrow(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number,
): void {
  const isStrong = f.currentAttack === AttackType.KDASH_CROW_C;
  const reach = limbLen * (isStrong ? 1.5 : 1.3);
  ctx.strokeStyle = '#ff4400';
  ctx.shadowColor = '#ff6600';
  ctx.shadowBlur = isStrong ? 28 : 20;
  ctx.lineWidth = isStrong ? 18 : 14;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.5);
  ctx.lineTo(sx + 10 * f.facing, sy - f.displayHeight * 0.5 - reach);
  ctx.stroke();
  ctx.fillStyle = '#ff440066';
  ctx.beginPath();
  ctx.arc(sx + 10 * f.facing, sy - f.displayHeight * 0.5 - reach,
    (isStrong ? 16 : 12) + progress * (isStrong ? 12 : 8), 0, Math.PI * 2);
  ctx.fill();
}

function drawKdashMinute(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number,
): void {
  const reach = limbLen * 1.2;
  ctx.strokeStyle = '#ff4400';
  ctx.shadowColor = '#ff6600';
  ctx.shadowBlur = 16;
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.35);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.3);
  ctx.stroke();
  ctx.fillStyle = '#ff660044';
  ctx.beginPath();
  ctx.arc(sx + (FIGHTER_WIDTH / 2 + reach * 0.7) * f.facing, sy - f.displayHeight * 0.32,
    10 + progress * 6, 0, Math.PI * 2);
  ctx.fill();
}

// ── Kula ──────────────────────────────────────

function drawKulaBreath(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number,
): void {
  const reach = limbLen * 0.7;
  ctx.strokeStyle = '#44ccff';
  ctx.shadowColor = '#88eeff';
  ctx.shadowBlur = 16;
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(sx + 10 * f.facing, sy - f.displayHeight * 0.55);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.55);
  ctx.stroke();
  ctx.fillStyle = '#88eeff44';
  ctx.beginPath();
  ctx.arc(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.55,
    10 + progress * 6, 0, Math.PI * 2);
  ctx.fill();
}

function drawKulaShell(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number,
): void {
  const isStrong = f.currentAttack === AttackType.KULA_SHELL_C;
  const reach = limbLen * 0.6;
  ctx.strokeStyle = '#44ccff';
  ctx.shadowColor = '#88eeff';
  ctx.shadowBlur = isStrong ? 20 : 14;
  ctx.lineWidth = isStrong ? 16 : 12;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.5);
  ctx.lineTo(sx + 5 * f.facing, sy - f.displayHeight * 0.5 - reach);
  ctx.stroke();
  ctx.strokeStyle = '#88eeff66';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(sx + 5 * f.facing, sy - f.displayHeight * 0.5 - reach * 0.5,
    15 + progress * 10, -Math.PI * 0.7, Math.PI * 0.7);
  ctx.stroke();
}

function drawKulaLay(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number,
): void {
  const reach = limbLen * 1.2;
  ctx.strokeStyle = '#44ccff';
  ctx.shadowColor = '#88eeff';
  ctx.shadowBlur = 16;
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.35);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.3);
  ctx.stroke();
  ctx.fillStyle = '#44ccff44';
  ctx.beginPath();
  ctx.arc(sx + (FIGHTER_WIDTH / 2 + reach * 0.7) * f.facing, sy - f.displayHeight * 0.32,
    10 + progress * 8, 0, Math.PI * 2);
  ctx.fill();
}

// ── 罗伯特 (Robert) ──────────────────────────────────────

function drawRobertRyuZan(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number,
): void {
  const isStrong = f.currentAttack === AttackType.ROBERT_RYU_ZAN_C;
  const reach = limbLen * (isStrong ? 1.5 : 1.3);
  ctx.strokeStyle = '#44ff88';
  ctx.shadowColor = '#22dd66';
  ctx.shadowBlur = isStrong ? 28 : 20;
  ctx.lineWidth = isStrong ? 18 : 14;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.5);
  ctx.lineTo(sx + 10 * f.facing, sy - f.displayHeight * 0.5 - reach);
  ctx.stroke();
  ctx.fillStyle = '#44ff8866';
  ctx.beginPath();
  ctx.arc(sx + 10 * f.facing, sy - f.displayHeight * 0.5 - reach,
    (isStrong ? 16 : 12) + progress * (isStrong ? 12 : 8), 0, Math.PI * 2);
  ctx.fill();
}

function drawRobertRyuGeki(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  limbLen: number,
): void {
  const reach = limbLen * 0.7;
  ctx.strokeStyle = '#44ff88';
  ctx.shadowColor = '#22dd66';
  ctx.shadowBlur = 14;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(sx + 10 * f.facing, sy - f.displayHeight * 0.55);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.55);
  ctx.stroke();
}

function drawRobertHienRyuJin(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number,
): void {
  const reach = limbLen * 1.4;
  ctx.strokeStyle = '#44ff88';
  ctx.shadowColor = '#22dd66';
  ctx.shadowBlur = 20;
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.45);
  ctx.lineTo(sx + 12 * f.facing, sy - f.displayHeight * 0.45 - reach);
  ctx.stroke();
  ctx.fillStyle = '#44ff8855';
  ctx.beginPath();
  ctx.arc(sx + 12 * f.facing, sy - f.displayHeight * 0.45 - reach,
    12 + progress * 8, 0, Math.PI * 2);
  ctx.fill();
}

function drawRobertGeneiKyaku(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  limbLen: number,
): void {
  const reach = limbLen * 1.2;
  ctx.strokeStyle = '#44ff88';
  ctx.shadowColor = '#22dd66';
  ctx.shadowBlur = 16;
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.35);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.3);
  ctx.stroke();
}

function drawRobertHienRyuKyaku(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  limbLen: number,
): void {
  const reach = limbLen * 1.3;
  ctx.strokeStyle = '#44ff88';
  ctx.shadowColor = '#22dd66';
  ctx.shadowBlur = 18;
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.4);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.55);
  ctx.stroke();
}
