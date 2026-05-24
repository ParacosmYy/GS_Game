/**
 * Attack limb rendering — extended arm/leg visuals during attack active phase
 */
import { Fighter } from '../entities/fighter.js';
import { AttackType } from '../core/types.js';
import { FIGHTER_WIDTH, FRAME_DATA } from '../core/constants.js';
import { ROSTER } from '../characters/index.js';

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
    || f.currentAttack === AttackType.KYO_ARAGAMI
    || f.currentAttack === AttackType.KYO_ARAGAMI_KONOKIZU
    || f.currentAttack === AttackType.KYO_ARAGAMI_YANOSABI
    || f.currentAttack === AttackType.KYO_DOKUGAMI
    || f.currentAttack === AttackType.KYO_TSUMIYOMI
    || f.currentAttack === AttackType.KYO_BATSUYOMI
    || f.currentAttack === AttackType.IORI_ONIYAKI
    || f.currentAttack === AttackType.IORI_KOTOTSUKI
    || f.currentAttack === AttackType.TERRY_POWER_DUNK
    || f.currentAttack === AttackType.TERRY_RISING_TACKLE;
  const isHeavy = name.endsWith('_C') || name.endsWith('_D')
    || f.currentAttack === AttackType.STAND_CD
    || f.currentAttack === AttackType.KYO_RED_KICK;

  const isSpecialMove = name.startsWith('KYO_') || name.startsWith('IORI_')
    || name.startsWith('TERRY_') || name.startsWith('KIM_')
    || f.currentAttack === AttackType.SPECIAL_PROJECTILE
    || f.currentAttack === AttackType.SPECIAL_UPPER
    || name.startsWith('DM_');

  // Get character-specific colors
  const charDef = ROSTER.find(c => c.id === f.charId);
  const specialColor = charDef?.specialColor || '#ff4400';
  const specialGlow = charDef?.specialGlow || '#ff6600';

  const limbLen = isHeavy ? 42 : 35;
  const limbWidth = isHeavy ? 10 : 8;

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

  if (name.startsWith('CLOSE')) {
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
  } else if (name.startsWith('STAND')) {
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
  } else if (name.startsWith('CROUCH')) {
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
  } else if (name.startsWith('JUMP')) {
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
  } else if (f.currentAttack === AttackType.CMD_NARAKU) {
    ctx.strokeStyle = '#ffaa22';
    ctx.shadowColor = '#ff6600';
    ctx.lineWidth = 12;
    const reach = limbLen * 1.0;
    ctx.beginPath();
    ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.3);
    ctx.lineTo(sx + 5 * f.facing, sy - f.displayHeight * 0.3 + reach);
    ctx.stroke();
  } else if (f.currentAttack === AttackType.CMD_GOFU_YOU) {
    ctx.strokeStyle = '#44ddff';
    ctx.shadowColor = '#00aaff';
    const reach = limbLen * 1.0;
    ctx.beginPath();
    ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.5);
    ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.7);
    ctx.stroke();
  } else if (f.currentAttack === AttackType.CMD_88SHIKI) {
    ctx.strokeStyle = '#44ddff';
    ctx.shadowColor = '#00aaff';
    ctx.lineWidth = 10;
    const reach = limbLen * 1.1;
    ctx.beginPath();
    ctx.moveTo(sx + 5 * f.facing, sy - 8);
    ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - 2);
    ctx.stroke();
  // ── 八神庵 specials ──
  } else if (f.currentAttack === AttackType.IORI_AOIHANA
    || f.currentAttack === AttackType.IORI_AOIHANA_2
    || f.currentAttack === AttackType.IORI_AOIHANA_3) {
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
  } else if (f.currentAttack === AttackType.IORI_ONIYAKI) {
    const reach = limbLen * 1.3;
    ctx.strokeStyle = specialColor;
    ctx.shadowColor = specialGlow;
    ctx.shadowBlur = 20;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(sx + 8 * f.facing, sy - f.displayHeight * 0.5);
    ctx.lineTo(sx + 12 * f.facing, sy - f.displayHeight * 0.5 - reach);
    ctx.stroke();
    ctx.fillStyle = `${specialGlow}44`;
    ctx.beginPath();
    ctx.arc(sx + 12 * f.facing, sy - f.displayHeight * 0.5 - reach,
      10 + progress * 8, 0, Math.PI * 2);
    ctx.fill();
  } else if (f.currentAttack === AttackType.IORI_KOTOTSUKI) {
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

  // ── 特瑞 specials ──
  } else if (f.currentAttack === AttackType.TERRY_BURN_KNUCKLE) {
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
  } else if (f.currentAttack === AttackType.TERRY_CRACK_SHOT) {
    ctx.strokeStyle = '#4488ff';
    ctx.shadowColor = '#2266ff';
    ctx.shadowBlur = 16;
    ctx.lineWidth = 12;
    const reach = limbLen * 1.2;
    ctx.beginPath();
    ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.35);
    ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.6);
    ctx.stroke();
  } else if (f.currentAttack === AttackType.TERRY_POWER_DUNK) {
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
  } else if (f.currentAttack === AttackType.TERRY_RISING_TACKLE) {
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

  // ── 金 specials ──
  } else if (f.currentAttack === AttackType.KIM_HIENZAN) {
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
  } else if (f.currentAttack === AttackType.KIM_HANGETSU) {
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
  } else if (f.currentAttack === AttackType.KIM_HISHOU) {
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
  } else if (f.currentAttack === AttackType.KIM_HAKI) {
    ctx.strokeStyle = specialColor;
    ctx.shadowColor = specialGlow;
    ctx.shadowBlur = 14;
    ctx.lineWidth = 10;
    const reach = limbLen * 1.0;
    ctx.beginPath();
    ctx.moveTo(sx + 5 * f.facing, sy - 8);
    ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - 3);
    ctx.stroke();
  } else if (f.currentAttack === AttackType.KIM_SANREN) {
    const reach = limbLen * 1.1;
    ctx.strokeStyle = specialColor;
    ctx.shadowColor = specialGlow;
    ctx.shadowBlur = 14;
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(sx + 10 * f.facing, sy - f.displayHeight * 0.55);
    ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.5);
    ctx.stroke();

  // ── DM 超必杀 visuals ──
  } else if (f.currentAttack === AttackType.DM_YATAGARASU) {
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
  } else if (f.currentAttack === AttackType.DM_POWER_GEYSER) {
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
  } else if (f.currentAttack === AttackType.DM_PHOENIX_KICK) {
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

  // ── 京 specials (existing) ──
  } else if (f.currentAttack === AttackType.KYO_75KAI || f.currentAttack === AttackType.KYO_75KAI_2) {
    const reach = limbLen * (f.currentAttack === AttackType.KYO_75KAI_2 ? 1.2 : 1.0);
    ctx.strokeStyle = '#ff4400';
    ctx.shadowColor = '#ff6600';
    ctx.shadowBlur = 14;
    ctx.lineWidth = f.currentAttack === AttackType.KYO_75KAI_2 ? 12 : 10;
    ctx.beginPath();
    ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.35);
    ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.25);
    ctx.stroke();
  } else if (f.currentAttack === AttackType.KYO_RED_KICK) {
    ctx.strokeStyle = '#ff4400';
    ctx.shadowColor = '#ff2200';
    ctx.shadowBlur = 16;
    ctx.lineWidth = 12;
    const reach = limbLen * 1.3;
    ctx.beginPath();
    ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.4);
    ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.65);
    ctx.stroke();
  } else if (f.currentAttack === AttackType.KYO_ARAGAMI
    || f.currentAttack === AttackType.KYO_DOKUGAMI) {
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
  } else if (f.currentAttack === AttackType.KYO_ARAGAMI_KONOKIZU) {
    const reach = limbLen * 1.2;
    ctx.strokeStyle = '#ff8822';
    ctx.shadowColor = '#ff4400';
    ctx.lineWidth = 11;
    ctx.beginPath();
    ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.5);
    ctx.lineTo(sx + 10 * f.facing, sy - f.displayHeight * 0.5 - reach);
    ctx.stroke();
  } else if (f.currentAttack === AttackType.KYO_ARAGAMI_YANOSABI) {
    ctx.strokeStyle = '#ff4400';
    ctx.shadowColor = '#ff2200';
    ctx.shadowBlur = 20;
    ctx.lineWidth = 14;
    const reach = limbLen * 1.3;
    ctx.beginPath();
    ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.7);
    ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.35);
    ctx.stroke();
  } else if (f.currentAttack === AttackType.KYO_TSUMIYOMI) {
    const reach = limbLen * 1.0;
    ctx.strokeStyle = '#ff6622';
    ctx.shadowColor = '#ff4400';
    ctx.lineWidth = 11;
    ctx.beginPath();
    ctx.moveTo(sx + 10 * f.facing, sy - f.displayHeight * 0.55);
    ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.5);
    ctx.stroke();
  } else if (f.currentAttack === AttackType.KYO_BATSUYOMI) {
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
  } else if (f.currentAttack === AttackType.KYO_ONIYAKI) {
    const reach = limbLen * 1.3;
    ctx.strokeStyle = '#ff6622';
    ctx.shadowColor = '#ff4400';
    ctx.shadowBlur = 20;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.5);
    ctx.lineTo(sx + 10 * f.facing, sy - f.displayHeight * 0.5 - reach);
    ctx.stroke();
    ctx.fillStyle = '#ffaa0066';
    ctx.beginPath();
    ctx.arc(sx + 10 * f.facing, sy - f.displayHeight * 0.5 - reach,
      12 + progress * 8, 0, Math.PI * 2);
    ctx.fill();
  } else if (f.currentAttack === AttackType.KYO_YAMIBARAI) {
    const reach = limbLen * 0.7;
    ctx.strokeStyle = '#ff6622';
    ctx.shadowColor = '#ff4400';
    ctx.shadowBlur = 14;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(sx + 10 * f.facing, sy - f.displayHeight * 0.55);
    ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.55);
    ctx.stroke();
  } else if (f.currentAttack === AttackType.IORI_YAMIBARAI) {
    const reach = limbLen * 0.7;
    ctx.strokeStyle = '#aa1133';
    ctx.shadowColor = '#8800cc';
    ctx.shadowBlur = 14;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(sx + 10 * f.facing, sy - f.displayHeight * 0.55);
    ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.55);
    ctx.stroke();
  } else if (f.currentAttack === AttackType.TERRY_POWER_WAVE) {
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
  } else if (f.currentAttack === AttackType.SPECIAL_UPPER) {
    const reach = limbLen * 1.2;
    ctx.beginPath();
    ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.5);
    ctx.lineTo(sx + 10 * f.facing, sy - f.displayHeight * 0.5 - reach);
    ctx.stroke();
  } else if (f.currentAttack === AttackType.SPECIAL_PROJECTILE) {
    const reach = limbLen * 0.6;
    ctx.beginPath();
    ctx.moveTo(sx + 10 * f.facing, sy - f.displayHeight * 0.55);
    ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.55);
    ctx.stroke();
  } else if (f.currentAttack === AttackType.STAND_CD || f.currentAttack === AttackType.JUMP_CD) {
    ctx.strokeStyle = '#ff4444';
    ctx.shadowColor = '#ff2222';
    ctx.lineWidth = 12;
    const reach = limbLen * 1.1;
    ctx.beginPath();
    ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.45);
    ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.35);
    ctx.stroke();
  } else if (f.currentAttack === AttackType.DM_OROCHINAGI) {
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
  } else if (f.currentAttack === AttackType.THROW) {
    ctx.strokeStyle = '#ff8844';
    ctx.beginPath();
    ctx.moveTo(sx + 10 * f.facing, sy - f.displayHeight * 0.5);
    ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + 20) * f.facing, sy - f.displayHeight * 0.5);
    ctx.stroke();
  }
  ctx.restore();
}
