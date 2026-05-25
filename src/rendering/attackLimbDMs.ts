/**
 * DM/SDM 超必杀技攻击肢体渲染 — 从 attackLimbSpecials2.ts 拆分
 */
import { Fighter } from '../entities/fighter.js';
import { FIGHTER_WIDTH } from '../core/constants.js';

/** 绘制DM/SDM超必杀技的攻击肢体 */
export function drawDmLimb(
  ctx: CanvasRenderingContext2D,
  f: Fighter,
  sx: number,
  sy: number,
  progress: number,
  limbLen: number,
  attackName: string,
): void {
  switch (attackName) {
    case 'DM_YATAGARASU': drawDmYatagarasu(ctx, f, sx, sy, progress, limbLen); break;
    case 'DM_POWER_GEYSER': drawDmPowerGeyser(ctx, f, sx, sy, progress, limbLen); break;
    case 'DM_PHOENIX_KICK': drawDmPhoenixKick(ctx, f, sx, sy, progress, limbLen); break;
    case 'DM_OROCHINAGI': drawDmOrochinagi(ctx, f, sx, sy, progress, limbLen); break;
    case 'DM_CHAIN_SHOT': drawDmChainShot(ctx, f, sx, sy, progress, limbLen); break;
    case 'DM_FREEZE': drawDmFreeze(ctx, f, sx, sy, progress, limbLen); break;
    case 'DM_RYU_KO_RYU': drawDmRyuKoRyu(ctx, f, sx, sy, progress, limbLen); break;
    case 'DM_HAOU_SHOKOU': drawDmHaouShokou(ctx, f, sx, sy, progress, limbLen); break;
    case 'DM_TEN_HA_OU': drawDmTenHaOu(ctx, f, sx, sy, progress, limbLen); break;
    case 'DM_V_SLASHER': drawDmVSlasher(ctx, f, sx, sy, progress, limbLen); break;
  }
}

function drawDmYatagarasu(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number,
): void {
  ctx.strokeStyle = '#aa22ff';
  ctx.shadowColor = '#8800cc';
  ctx.shadowBlur = 25;
  ctx.lineWidth = 16;
  const reach = limbLen * 1.5;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.5);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.4);
  ctx.stroke();
  ctx.fillStyle = '#aa22ff44';
  ctx.beginPath();
  ctx.arc(sx + (FIGHTER_WIDTH / 2 + reach * 0.5) * f.facing, sy - f.displayHeight * 0.45,
    20 + progress * 15, 0, Math.PI * 2);
  ctx.fill();
}

function drawDmPowerGeyser(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number,
): void {
  ctx.strokeStyle = '#ffcc00';
  ctx.shadowColor = '#ff8800';
  ctx.shadowBlur = 25;
  ctx.lineWidth = 18;
  const reach = limbLen * 1.0;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.3);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - 5);
  ctx.stroke();
  ctx.fillStyle = '#ffcc0066';
  for (let i = 0; i < 3; i++) {
    const ex = sx + (FIGHTER_WIDTH / 2 + reach * (0.3 + i * 0.3)) * f.facing;
    ctx.beginPath();
    ctx.moveTo(ex, sy);
    ctx.lineTo(ex - 8, sy - 30 - progress * 20 - i * 10);
    ctx.lineTo(ex + 8, sy);
    ctx.fill();
  }
}

function drawDmPhoenixKick(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number,
): void {
  ctx.strokeStyle = '#44ddff';
  ctx.shadowColor = '#22aaff';
  ctx.shadowBlur = 25;
  ctx.lineWidth = 16;
  const reach = limbLen * 1.5;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.4);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.3);
  ctx.stroke();
  ctx.strokeStyle = '#88ccff44';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(sx + (FIGHTER_WIDTH / 2 + reach * 0.6) * f.facing, sy - f.displayHeight * 0.35,
    25 + progress * 15, -Math.PI * 0.8, Math.PI * 0.3);
  ctx.stroke();
}

function drawDmOrochinagi(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number,
): void {
  ctx.strokeStyle = '#ff4400';
  ctx.shadowColor = '#ff6600';
  ctx.shadowBlur = 20;
  ctx.lineWidth = 14;
  const reach = limbLen * 1.5;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.55);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.45);
  ctx.stroke();
  ctx.strokeStyle = '#ffaa00';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(sx + (FIGHTER_WIDTH / 2 + reach * 0.7) * f.facing, sy - f.displayHeight * 0.5,
    15 * (0.5 + progress * 0.5), 0, Math.PI * 2);
  ctx.stroke();
}

function drawDmChainShot(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number,
): void {
  ctx.strokeStyle = '#ff4400';
  ctx.shadowColor = '#ff2200';
  ctx.shadowBlur = 25;
  ctx.lineWidth = 18;
  const reach = limbLen * 1.5;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.55);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.45);
  ctx.stroke();
  ctx.fillStyle = '#ff440044';
  ctx.beginPath();
  ctx.arc(sx + (FIGHTER_WIDTH / 2 + reach * 0.6) * f.facing, sy - f.displayHeight * 0.5,
    20 + progress * 15, 0, Math.PI * 2);
  ctx.fill();
}

function drawDmFreeze(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number,
): void {
  ctx.strokeStyle = '#44ccff';
  ctx.shadowColor = '#88eeff';
  ctx.shadowBlur = 25;
  ctx.lineWidth = 18;
  const reach = limbLen * 1.3;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.5);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.45);
  ctx.stroke();
  ctx.fillStyle = '#44ccff44';
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 + progress * 2;
    const dist = 15 + progress * 25;
    ctx.beginPath();
    ctx.arc(sx + Math.cos(angle) * dist * f.facing, sy - f.displayHeight * 0.45 + Math.sin(angle) * dist,
      6 + progress * 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawDmRyuKoRyu(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number,
): void {
  ctx.strokeStyle = '#44ff88';
  ctx.shadowColor = '#22dd66';
  ctx.shadowBlur = 25;
  ctx.lineWidth = 18;
  const reach = limbLen * 1.5;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.45);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.35);
  ctx.stroke();
  ctx.fillStyle = '#44ff8844';
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + progress * 3;
    const dist = 12 + progress * 20;
    ctx.beginPath();
    ctx.arc(sx + (FIGHTER_WIDTH / 2 + reach * 0.5) * f.facing + Math.cos(angle) * dist * 0.3,
      sy - f.displayHeight * 0.4 + Math.sin(angle) * dist,
      8 + progress * 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawDmHaouShokou(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number,
): void {
  ctx.strokeStyle = '#44ff88';
  ctx.shadowColor = '#22dd66';
  ctx.shadowBlur = 25;
  ctx.lineWidth = 16;
  const reach = limbLen * 1.5;
  ctx.beginPath();
  ctx.moveTo(sx + 10 * f.facing, sy - f.displayHeight * 0.55);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.5);
  ctx.stroke();
  ctx.fillStyle = '#44ff8866';
  ctx.beginPath();
  ctx.arc(sx + (FIGHTER_WIDTH / 2 + reach * 0.6) * f.facing, sy - f.displayHeight * 0.52,
    20 + progress * 15, 0, Math.PI * 2);
  ctx.fill();
}

function drawDmTenHaOu(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number,
): void {
  ctx.strokeStyle = '#ffaa22';
  ctx.shadowColor = '#ff8800';
  ctx.shadowBlur = 25;
  ctx.lineWidth = 18;
  const reach = limbLen * 1.5;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.45);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.35);
  ctx.stroke();
  ctx.fillStyle = '#ffcc0044';
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2 + progress * 2;
    const dist = 15 + progress * 20;
    ctx.beginPath();
    ctx.arc(sx + (FIGHTER_WIDTH / 2 + reach * 0.5) * f.facing + Math.cos(angle) * dist * 0.3,
      sy - f.displayHeight * 0.4 + Math.sin(angle) * dist,
      8 + progress * 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawDmVSlasher(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number,
): void {
  ctx.strokeStyle = '#44aaff';
  ctx.shadowColor = '#88ccff';
  ctx.shadowBlur = 25;
  ctx.lineWidth = 18;
  const reach = limbLen * 1.5;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.5);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.35);
  ctx.stroke();
  ctx.fillStyle = '#88ccff44';
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 + progress * 2.5;
    const dist = 18 + progress * 22;
    ctx.beginPath();
    ctx.arc(sx + (FIGHTER_WIDTH / 2 + reach * 0.5) * f.facing + Math.cos(angle) * dist * 0.4,
      sy - f.displayHeight * 0.42 + Math.sin(angle) * dist,
      7 + progress * 5, 0, Math.PI * 2);
    ctx.fill();
  }
}
