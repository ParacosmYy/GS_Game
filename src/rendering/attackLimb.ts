/**
 * Attack limb rendering — extended arm/leg visuals during attack active phase
 * 基础攻击肢体渲染 + 入口函数；角色专属必杀技渲染委托给 attackLimbSpecials.ts
 */
import { Fighter } from '../entities/fighter.js';
import { AttackType } from '../core/types.js';
import { FIGHTER_WIDTH, FRAME_DATA } from '../core/constants.js';
import { ROSTER } from '../characters/index.js';
import { drawSpecialAttackLimb } from './attackLimbSpecials.js';

/** Draw extended arm/leg during attack active phase */
export function drawAttackLimb(
  ctx: CanvasRenderingContext2D,
  f: Fighter,
  sx: number,
  sy: number,
): void {
  if (f.attackPhase !== 'active' || !f.currentAttack) return;

  const data = FRAME_DATA[f.currentAttack as keyof typeof FRAME_DATA];
  const progress = f.attackFrame / (data?.active || 5);
  const name = f.currentAttack as string;

  // Determine punch (A/C) vs kick (B/D) for limb color and style
  const isPunch = name.endsWith('_A') || name.endsWith('_C')
    || f.currentAttack === AttackType.SPECIAL_PROJECTILE
    || f.currentAttack === AttackType.SPECIAL_UPPER
    || f.currentAttack === AttackType.KYO_ONIYAKI
    || f.currentAttack === AttackType.KYO_ONIYAKI_C
    || f.currentAttack === AttackType.KYO_ARAGAMI
    || f.currentAttack === AttackType.KYO_ARAGAMI_KONOKIZU
    || f.currentAttack === AttackType.KYO_ARAGAMI_YANOSABI
    || f.currentAttack === AttackType.KYO_DOKUGAMI
    || f.currentAttack === AttackType.KYO_TSUMIYOMI
    || f.currentAttack === AttackType.KYO_BATSUYOMI
    || f.currentAttack === AttackType.IORI_ONIYAKI
    || f.currentAttack === AttackType.IORI_ONIYAKI_C
    || f.currentAttack === AttackType.IORI_KOTOTSUKI
    || f.currentAttack === AttackType.TERRY_POWER_DUNK
    || f.currentAttack === AttackType.TERRY_RISING_TACKLE
    || f.currentAttack === AttackType.RYO_KO_HOU
    || f.currentAttack === AttackType.RYO_KO_HOU_C
    || f.currentAttack === AttackType.RYO_HAOU
    || f.currentAttack === AttackType.LEONA_EAR_RING
    || f.currentAttack === AttackType.LEONA_EAR_RING_C
    || f.currentAttack === AttackType.LEONA_GRAND_SABER;
  const isHeavy = name.endsWith('_C') || name.endsWith('_D')
    || f.currentAttack === AttackType.STAND_CD
    || f.currentAttack === AttackType.KYO_RED_KICK;

  const isSpecialMove = name.startsWith('KYO_') || name.startsWith('IORI_')
    || name.startsWith('TERRY_') || name.startsWith('KIM_') || name.startsWith('RYO_') || name.startsWith('LEONA_')
    || f.currentAttack === AttackType.SPECIAL_PROJECTILE
    || f.currentAttack === AttackType.SPECIAL_UPPER
    || name.startsWith('DM_');

  // Get character-specific colors
  const charDef = ROSTER.find(c => c.id === f.charId);
  const specialColor = charDef?.specialColor || '#ff4400';
  const specialGlow = charDef?.specialGlow || '#ff6600';

  const limbLen = isHeavy ? 68 : 55;
  const limbWidth = isHeavy ? 16 : 12;

  ctx.save();
  if (isSpecialMove) {
    ctx.strokeStyle = isPunch ? specialColor : specialGlow;
    ctx.lineWidth = limbWidth + 4;
    ctx.lineCap = 'round';
    ctx.shadowColor = specialGlow;
    ctx.shadowBlur = 18;
  } else {
    ctx.strokeStyle = isPunch ? '#ffdd44' : '#44ddff';
    ctx.lineWidth = limbWidth;
    ctx.lineCap = 'round';
    ctx.shadowColor = isPunch ? '#ffaa00' : '#00aaff';
    ctx.shadowBlur = 8;
  }

  // 基础攻击类型渲染
  if (name.startsWith('CLOSE')) {
    drawCloseAttack(ctx, f, sx, sy, isPunch, progress, limbLen);
  } else if (name.startsWith('STAND')) {
    drawStandAttack(ctx, f, sx, sy, isPunch, progress, limbLen);
  } else if (name.startsWith('CROUCH')) {
    drawCrouchAttack(ctx, f, sx, sy, isPunch, limbLen);
  } else if (name.startsWith('JUMP')) {
    drawJumpAttack(ctx, f, sx, sy, isPunch, limbLen);
  } else if (f.currentAttack === AttackType.CMD_NARAKU) {
    drawCmdNaraku(ctx, f, sx, sy, limbLen);
  } else if (f.currentAttack === AttackType.CMD_GOFU_YOU) {
    drawCmdGofuYou(ctx, f, sx, sy, limbLen);
  } else if (f.currentAttack === AttackType.CMD_88SHIKI) {
    drawCmd88Shiki(ctx, f, sx, sy, limbLen);
  } else if (f.currentAttack === AttackType.SPECIAL_UPPER) {
    drawSpecialUpper(ctx, f, sx, sy, limbLen);
  } else if (f.currentAttack === AttackType.SPECIAL_PROJECTILE) {
    drawSpecialProjectile(ctx, f, sx, sy, limbLen);
  } else if (f.currentAttack === AttackType.STAND_CD || f.currentAttack === AttackType.JUMP_CD) {
    drawCdAttack(ctx, f, sx, sy, limbLen);
  } else if (f.currentAttack === AttackType.THROW) {
    drawThrowAttack(ctx, f, sx, sy);
  } else {
    // 角色专属必杀技/超必杀技委托给 specials 模块
    drawSpecialAttackLimb(ctx, f, sx, sy, progress, limbLen, isHeavy);
  }
  ctx.restore();
}

// ── 基础攻击绘制子函数 ──────────────────────────────────────

function drawCloseAttack(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  isPunch: boolean, progress: number, limbLen: number,
): void {
  const reach = limbLen * 0.5 * (0.6 + progress * 0.4);
  if (isPunch) {
    ctx.beginPath();
    ctx.moveTo(sx + 8 * f.facing, sy - f.displayHeight * 0.6);
    ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.6);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.35);
    ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.25);
    ctx.stroke();
  }
}

function drawStandAttack(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  isPunch: boolean, progress: number, limbLen: number,
): void {
  if (isPunch) {
    const reach = limbLen * (0.5 + progress * 0.5);
    ctx.beginPath();
    ctx.moveTo(sx + 10 * f.facing, sy - f.displayHeight * 0.6);
    ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.6);
    ctx.stroke();
  } else {
    const reach = limbLen * (0.5 + progress * 0.5);
    ctx.beginPath();
    ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.35);
    ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.25);
    ctx.stroke();
  }
}

function drawCrouchAttack(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  isPunch: boolean, limbLen: number,
): void {
  if (isPunch) {
    const reach = limbLen * 0.8;
    ctx.beginPath();
    ctx.moveTo(sx + 5 * f.facing, sy - 10);
    ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - 5);
    ctx.stroke();
  } else {
    const reach = limbLen * 0.9;
    ctx.beginPath();
    ctx.moveTo(sx + 5 * f.facing, sy - 8);
    ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - 3);
    ctx.stroke();
  }
}

function drawJumpAttack(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  isPunch: boolean, limbLen: number,
): void {
  const reach = limbLen * 0.7;
  if (isPunch) {
    ctx.beginPath();
    ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.3);
    ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.4);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.25);
    ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.1);
    ctx.stroke();
  }
}

function drawCmdNaraku(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  limbLen: number,
): void {
  ctx.strokeStyle = '#ffaa22';
  ctx.shadowColor = '#ff6600';
  ctx.lineWidth = 12;
  const reach = limbLen * 1.0;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.3);
  ctx.lineTo(sx + 5 * f.facing, sy - f.displayHeight * 0.3 + reach);
  ctx.stroke();
}

function drawCmdGofuYou(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  limbLen: number,
): void {
  ctx.strokeStyle = '#44ddff';
  ctx.shadowColor = '#00aaff';
  const reach = limbLen * 1.0;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.5);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.7);
  ctx.stroke();
}

function drawCmd88Shiki(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  limbLen: number,
): void {
  ctx.strokeStyle = '#44ddff';
  ctx.shadowColor = '#00aaff';
  ctx.lineWidth = 10;
  const reach = limbLen * 1.1;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - 8);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - 2);
  ctx.stroke();
}

function drawSpecialUpper(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  limbLen: number,
): void {
  const reach = limbLen * 1.2;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.5);
  ctx.lineTo(sx + 10 * f.facing, sy - f.displayHeight * 0.5 - reach);
  ctx.stroke();
}

function drawSpecialProjectile(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  limbLen: number,
): void {
  const reach = limbLen * 0.6;
  ctx.beginPath();
  ctx.moveTo(sx + 10 * f.facing, sy - f.displayHeight * 0.55);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.55);
  ctx.stroke();
}

function drawCdAttack(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  limbLen: number,
): void {
  ctx.strokeStyle = '#ff4444';
  ctx.shadowColor = '#ff2222';
  ctx.lineWidth = 12;
  const reach = limbLen * 1.1;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.45);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.35);
  ctx.stroke();
}

function drawThrowAttack(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
): void {
  ctx.strokeStyle = '#ff8844';
  ctx.beginPath();
  ctx.moveTo(sx + 10 * f.facing, sy - f.displayHeight * 0.5);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + 20) * f.facing, sy - f.displayHeight * 0.5);
  ctx.stroke();
}
