/**
 * Skeletal fighter character-specific visual parts
 * Outfit colors, head/face rendering, hair, shoes — detached from Fighter entity
 */
import { shiftColor, roundRect } from './utils.js';

// Animation tick — injected externally via setSkeletalPartsTick
let _headTick = 0;
export function setSkeletalPartsTick(t: number): void { _headTick = t; }

// Character-specific outfit color overrides (secondary colors)
export const CHAR_OUTFIT: Record<string, { shirt: string; pants: string; belt: string; shoes: string }> = {
  kyo: { shirt: '#cc4400', pants: '#2a2a55', belt: '#884422', shoes: '#442211' },
  iori: { shirt: '#e8e0d0', pants: '#2a1a3a', belt: '#882244', shoes: '#1a0a2a' },
  terry: { shirt: '#cc3333', pants: '#334488', belt: '#aa8833', shoes: '#443322' },
  kim: { shirt: '#f0f0f0', pants: '#2244aa', belt: '#cc3333', shoes: '#2244aa' },
  ryo: { shirt: '#cc8833', pants: '#cc8833', belt: '#333', shoes: '#443322' },
  leona: { shirt: '#335588', pants: '#335588', belt: '#888', shoes: '#223344' },
  kdash: { shirt: '#333344', pants: '#2a2a3a', belt: '#666', shoes: '#222233' },
  kula: { shirt: '#4488cc', pants: '#336699', belt: '#88ccff', shoes: '#335588' },
  robert: { shirt: '#226633', pants: '#226633', belt: '#884422', shoes: '#443322' },
  athena: { shirt: '#cc2222', pants: '#cc2222', belt: '#fff', shoes: '#ff6688' },
  mai: { shirt: '#cc2244', pants: '#cc2244', belt: '#fff', shoes: '#cc2244' },
  ralf: { shirt: '#cc3322', pants: '#664422', belt: '#333', shoes: '#222' },
  clark: { shirt: '#556b2f', pants: '#887744', belt: '#444', shoes: '#333' },
  joe: { shirt: '#3366aa', pants: '#cc4400', belt: '#ffcc00', shoes: '#aa8866' },
  andy: { shirt: '#dd6622', pants: '#f0f0f0', belt: '#884422', shoes: '#443322' },
  billy: { shirt: '#3366aa', pants: '#e8e8e8', belt: '#884422', shoes: '#664422' },
  chang: { shirt: '#885522', pants: '#cc8833', belt: '#553311', shoes: '#442211' },
  choi: { shirt: '#338833', pants: '#225522', belt: '#884422', shoes: '#334422' },
  mature: { shirt: '#882255', pants: '#882255', belt: '#aa3377', shoes: '#661844' },
  yashiro: { shirt: '#553377', pants: '#333355', belt: '#444', shoes: '#222' },
  chris: { shirt: '#ff8844', pants: '#cc6622', belt: '#aa4422', shoes: '#883322' },
  shermie: { shirt: '#cc44aa', pants: '#cc44aa', belt: '#dd55bb', shoes: '#992288' },
  vice: { shirt: '#3366aa', pants: '#3366aa', belt: '#4488cc', shoes: '#224488' },
  yamazaki: { shirt: '#556622', pants: '#3a4418', belt: '#886633', shoes: '#332211' },
  xiangfei: { shirt: '#ee6688', pants: '#cc4466', belt: '#ffcc44', shoes: '#aa3355' },
  mary: { shirt: '#5588cc', pants: '#4477bb', belt: '#88bbee', shoes: '#336699' },
  kasumi: { shirt: '#dd4466', pants: '#cc3355', belt: '#ee6688', shoes: '#aa2244' },
};

const DEFAULT_OUTFIT = { shirt: '#888', pants: '#556', belt: '#444', shoes: '#333' };

/** Ryo color palette variants for A/B/C/D button selection */
export const RYO_PALETTES = [
  { shirt: '#cc8833', pants: '#cc8833', belt: '#333', shoes: '#443322', headband: '#cc2222', hair: '#8B6914' }, // A: classic orange gi
  { shirt: '#3366cc', pants: '#3366cc', belt: '#222', shoes: '#222244', headband: '#cc2222', hair: '#8B6914' }, // B: blue gi
  { shirt: '#cc3333', pants: '#cc3333', belt: '#444', shoes: '#332222', headband: '#ffcc00', hair: '#8B6914' }, // C: red gi
  { shirt: '#338833', pants: '#338833', belt: '#333', shoes: '#223322', headband: '#cc2222', hair: '#8B6914' }, // D: green gi
] as const;

/** Required color fields for a Ryo palette variant */
export type RyoPalette = typeof RYO_PALETTES[number];

export function getOutfit(charId: string, colorIndex?: number): { shirt: string; pants: string; belt: string; shoes: string } {
  if (charId === 'ryo' && colorIndex !== undefined) {
    const idx = Math.max(0, Math.min(3, colorIndex));
    const pal = RYO_PALETTES[idx];
    return { shirt: pal.shirt, pants: pal.pants, belt: pal.belt, shoes: pal.shoes };
  }
  return CHAR_OUTFIT[charId] ?? DEFAULT_OUTFIT;
}

export function getHairColor(charId: string, colorIndex?: number): string {
  if (charId === 'ryo' && colorIndex !== undefined) {
    const idx = Math.max(0, Math.min(3, colorIndex));
    return RYO_PALETTES[idx].hair;
  }
  const colors: Record<string, string> = {
    kyo: '#8B4513', iori: '#8B0000', terry: '#C6A355',
    kim: '#1a1a1a', ryo: '#8B6914', leona: '#DAA520',
    kdash: '#C0C0C0', kula: '#cc8855', robert: '#2a1a0a',
    athena: '#7744cc', mai: '#7a4828', andy: '#ccaa44',
    ralf: '#ccaa44', clark: '#ccaa44', joe: '#ddbb44', billy: '#ccaa44', chang: '#222222',
    choi: '#888888',
    mature: '#dab840',
    yashiro: '#aaaacc',
    chris: '#c88848',
    shermie: '#8b4a6a',
    vice: '#a0a0b0',
    yamazaki: '#1a1a1a',
    xiangfei: '#1a1a2e',
    mary: '#ddbb44',
    kasumi: '#1a1a2a',
  };
  return colors[charId] ?? '#333';
}

/** Get headband color for a character, supporting palette variants */
export function getHeadbandColor(charId: string, colorIndex?: number): string {
  if (charId === 'ryo' && colorIndex !== undefined) {
    const idx = Math.max(0, Math.min(3, colorIndex));
    return RYO_PALETTES[idx].headband;
  }
  // Default headband colors for other characters (no palette variant)
  return '#cc2222';
}

export function getEyeColor(charId: string): string {
  const colors: Record<string, string> = {
    kyo: '#6B4226', iori: '#8B0000', terry: '#4169E1',
    kim: '#1a1a1a', ryo: '#4169E1', leona: '#4169E1',
    kdash: '#ff4400', kula: '#4488ff', robert: '#4169E1',
    athena: '#6644cc', mai: '#4488aa', andy: '#4466cc',
    ralf: '#4466aa', clark: '#664422', joe: '#664422', billy: '#4466cc', chang: '#664422',
    choi: '#cc2222',
    mature: '#663399',
    yashiro: '#553388',
    chris: '#cc6622',
    shermie: '#663399',
    vice: '#cc2222',
    yamazaki: '#553311',
    xiangfei: '#cc3355',
    mary: '#4466aa',
    kasumi: '#331122',
  };
  return colors[charId] ?? '#444';
}

/** Draw character-specific head with detailed features */
export function drawCharacterHead(
  ctx: CanvasRenderingContext2D, charId: string, facing: number, skinColor: string, headW: number,
  colorIndex?: number, tick?: number,
): void {
  const animTick = tick ?? _headTick;
  const r = headW / 2;

  // 角色面部特征差异化参数
  const isFemale = ['leona', 'kula', 'athena', 'mai', 'sherrie', 'mature', 'vice', 'xiangfei', 'kasumi', 'mary', 'shermie'].includes(charId);
  const faceScale = isFemale ? 0.92 : 1.0; // 女性面部略窄
  const eyeScale = isFemale ? 1.15 : 1.0; // 女性眼睛略大
  const eyeSpacingBase = isFemale ? 7 : 8;
  const eyeRBase = isFemale ? 6.0 : 5.5;

  // Head base — skin color with gradient
  const hg = ctx.createRadialGradient(-2, -2, 0, 0, 0, r);
  hg.addColorStop(0, shiftColor(skinColor, 25));
  hg.addColorStop(0.7, skinColor);
  hg.addColorStop(1, shiftColor(skinColor, -15));
  ctx.fillStyle = hg;
  ctx.beginPath(); ctx.ellipse(0, 0, r * faceScale, r, 0, 0, Math.PI * 2); ctx.fill();

  // Head outline
  ctx.strokeStyle = shiftColor(skinColor, -40);
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(0, 0, r * faceScale, r, 0, 0, Math.PI * 2); ctx.stroke();

  // Eyes — 角色差异化大小和间距
  const eyeSpacing = eyeSpacingBase;
  const eyeY = -2;
  const eyeR = eyeRBase * eyeScale;
  for (const side of [-1, 1]) {
    const ex = side * eyeSpacing;
    // Sclera
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(ex, eyeY, eyeR, eyeR + 0.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    // Iris
    const irisR = eyeR * 0.58;
    ctx.fillStyle = getEyeColor(charId);
    ctx.beginPath(); ctx.arc(ex + facing * 1.5, eyeY, irisR, 0, Math.PI * 2); ctx.fill();
    // Pupil
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.arc(ex + facing * 2, eyeY, irisR * 0.5, 0, Math.PI * 2); ctx.fill();
    // Eye shine
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath(); ctx.arc(ex + facing * 0.8, eyeY - 1.5, irisR * 0.35, 0, Math.PI * 2); ctx.fill();
  }

  // Eyebrows — 角色差异化角度和粗细
  const browWidth = isFemale ? 2 : 3;
  ctx.strokeStyle = getHairColor(charId, colorIndex);
  ctx.lineWidth = browWidth;
  const browAngle = getBrowAngle(charId);
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * (eyeSpacing - 5), eyeY - 8 - browAngle * side);
    ctx.lineTo(side * (eyeSpacing + 5), eyeY - 8.5 + browAngle * side);
    ctx.stroke();
  }

  // Mouth — 角色专属表情
  drawMouth(ctx, charId, r, skinColor, facing);

  // Nose hint
  ctx.fillStyle = shiftColor(skinColor, -10);
  ctx.beginPath();
  ctx.arc(facing * 1, r * 0.15, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // 女性角色腮红
  if (isFemale) {
    ctx.fillStyle = 'rgba(255, 150, 150, 0.12)';
    ctx.beginPath(); ctx.ellipse(-eyeSpacing - 2, eyeY + 4, 4, 2.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(eyeSpacing + 2, eyeY + 4, 4, 2.5, 0, 0, Math.PI * 2); ctx.fill();
  }

  // === Character-specific hair/accessories ===
  drawHair(ctx, charId, facing, r, headW, colorIndex, animTick);
}

// 眉毛角度 — 正值=内侧低(怒), 负值=内侧高(温和)
function getBrowAngle(charId: string): number {
  const angles: Record<string, number> = {
    kyo: -0.5, iori: 2, terry: 0, kim: -1, ryo: 1.5, leona: 0.5,
    kdash: 1, kula: -1.5, robert: 0, athena: -1, mai: -0.5,
    ralf: 2, clark: 1, joe: 0, andy: 0, billy: 1, chang: 0.5,
    choi: 2, mature: -0.5, yashiro: 1.5, chris: -1, shermie: -1,
    vice: 1.5, yamazaki: 3, xiangfei: -0.5, mary: 0, kasumi: -1,
  };
  return angles[charId] ?? 0;
}

// 嘴巴 — 角色专属表情
function drawMouth(ctx: CanvasRenderingContext2D, charId: string, r: number, skinColor: string, facing: number): void {
  const mouthY = r * 0.45;
  ctx.strokeStyle = shiftColor(skinColor, -30);
  ctx.lineWidth = 1.5;

  switch (charId) {
    case 'iori':
      // 冷笑 — 一侧上扬
      ctx.beginPath();
      ctx.moveTo(-5, mouthY);
      ctx.quadraticCurveTo(0, mouthY + 3, 6, mouthY - 1);
      ctx.stroke();
      break;
    case 'kyo':
      // 自信微笑
      ctx.beginPath();
      ctx.moveTo(-4, mouthY);
      ctx.quadraticCurveTo(0, mouthY + 2, 4, mouthY);
      ctx.stroke();
      break;
    case 'terry':
      // 开朗笑容 — 稍宽
      ctx.beginPath();
      ctx.moveTo(-6, mouthY - 0.5);
      ctx.quadraticCurveTo(0, mouthY + 3, 6, mouthY - 0.5);
      ctx.stroke();
      break;
    case 'yamazaki':
      // 疯狂咧嘴 — 露齿
      ctx.beginPath();
      ctx.moveTo(-6, mouthY);
      ctx.lineTo(6, mouthY);
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.fillRect(-4, mouthY - 1.5, 8, 2);
      break;
    case 'choi':
      // 锯齿嘴 — 疯狂
      ctx.beginPath();
      ctx.moveTo(-4, mouthY);
      for (let t = -3; t <= 4; t += 2) {
        ctx.lineTo(t, mouthY + (t % 4 === 1 ? 2 : 0));
      }
      ctx.stroke();
      break;
    case 'leona':
      // 紧闭 — 严肃
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-4, mouthY);
      ctx.lineTo(4, mouthY);
      ctx.stroke();
      break;
    case 'kula':
    case 'athena':
      // 开心微笑 — 上弧
      ctx.beginPath();
      ctx.moveTo(-4, mouthY);
      ctx.quadraticCurveTo(0, mouthY - 3, 4, mouthY);
      ctx.stroke();
      break;
    case 'mai':
      // 魅惑微笑
      ctx.beginPath();
      ctx.moveTo(-4, mouthY);
      ctx.quadraticCurveTo(2, mouthY + 2, 5, mouthY - 1);
      ctx.stroke();
      break;
    case 'ralf':
    case 'clark':
      // 坚毅一字
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-5, mouthY);
      ctx.lineTo(5, mouthY);
      ctx.stroke();
      break;
    default:
      // 中性
      ctx.beginPath();
      ctx.moveTo(-5, mouthY);
      ctx.lineTo(5, mouthY - 0.5);
      ctx.stroke();
      break;
  }
}

function drawHair(ctx: CanvasRenderingContext2D, charId: string, facing: number, r: number, headW: number, colorIndex?: number, tick?: number): void {
  if (charId === 'kyo') {
    // Kyo: brown spiky hair sticking up
    ctx.fillStyle = '#8B4513';
    const spikes = [[-12, -22], [-6, -28], [0, -25], [6, -28], [12, -22]];
    for (const [sx, sy] of spikes) {
      ctx.beginPath();
      ctx.moveTo(sx - 5, -r + 3);
      ctx.lineTo(sx, -r + sy);
      ctx.lineTo(sx + 5, -r + 3);
      ctx.closePath();
      ctx.fill();
    }
    // Hair band
    ctx.fillStyle = '#cc2200';
    ctx.fillRect(-r + 1, -r + 7, headW - 2, 5);
  } else if (charId === 'iori') {
    // Iori: long crimson hair flowing down
    ctx.fillStyle = '#8B0000';
    // Top volume
    ctx.beginPath();
    ctx.moveTo(-r - 2, -r + 3);
    ctx.quadraticCurveTo(-r + 2, -r - 8, 0, -r - 6);
    ctx.quadraticCurveTo(r - 2, -r - 8, r + 2, -r + 3);
    ctx.lineTo(r, -r + 6);
    ctx.lineTo(-r, -r + 6);
    ctx.closePath();
    ctx.fill();
    // Flowing side hair
    const sideX = r * facing * 0.6;
    ctx.fillStyle = '#8B0000';
    ctx.beginPath();
    ctx.moveTo(sideX * 0.5, -r);
    ctx.quadraticCurveTo(sideX + 4 * facing, -r + 4, sideX + 8 * facing, r + 10);
    ctx.lineTo(sideX + 4 * facing, r + 8);
    ctx.quadraticCurveTo(sideX - 2 * facing, -r + 8, sideX * 0.3, -r + 3);
    ctx.closePath();
    ctx.fill();
    // Dark overlay on face
    ctx.fillStyle = 'rgba(80,0,0,0.1)';
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  } else if (charId === 'terry') {
    // Terry: blonde hair + red cap
    ctx.fillStyle = '#C6A355';
    ctx.beginPath();
    ctx.moveTo(-r + 2, -r + 3);
    ctx.quadraticCurveTo(0, -r - 5, r - 2, -r + 3);
    ctx.lineTo(r - 4, -r + 6);
    ctx.lineTo(-r + 4, -r + 6);
    ctx.closePath();
    ctx.fill();
    // Red cap
    const cw = headW + 10, ch = 8;
    ctx.fillStyle = '#cc2222';
    ctx.beginPath();
    ctx.moveTo(-cw / 2, -r + 1);
    ctx.lineTo(-cw / 2 + 3, -r - ch);
    ctx.lineTo(cw / 2 - 3, -r - ch);
    ctx.lineTo(cw / 2, -r + 1);
    ctx.closePath();
    ctx.fill();
    // Cap brim
    ctx.fillStyle = '#aa1111';
    ctx.fillRect(-cw / 2, -r - 1, cw, 3);
    // Cap star emblem
    ctx.fillStyle = '#e8c840';
    ctx.beginPath();
    ctx.arc(-r + 6, -r - ch + 4, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (charId === 'kim') {
    // Kim: short dark hair + blue headband
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(-r + 2, -r + 3);
    ctx.quadraticCurveTo(0, -r - 6, r - 2, -r + 3);
    ctx.lineTo(r - 3, -r + 7);
    ctx.lineTo(-r + 3, -r + 7);
    ctx.closePath();
    ctx.fill();
    // Headband
    ctx.fillStyle = '#2244aa';
    ctx.beginPath();
    ctx.moveTo(-r + 1, -r + 2);
    ctx.lineTo(-r, -r - 3);
    ctx.quadraticCurveTo(0, -r - 5, r, -r - 3);
    ctx.lineTo(r - 1, -r + 2);
    ctx.closePath();
    ctx.fill();
    // Headband tails
    ctx.strokeStyle = '#1a3388';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-r, -r + 1); ctx.lineTo(-r - 6, -r + 5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(r, -r + 1); ctx.lineTo(r + 6, -r + 5); ctx.stroke();
  } else if (charId === 'ryo') {
    // Ryo: short spiky brown hair swept back + stronger brow + red headband
    // Hair — palette-aware color
    const ryoHairColor = getHairColor(charId, colorIndex);
    const ryoHeadbandColor = getHeadbandColor(charId, colorIndex);
    ctx.fillStyle = ryoHairColor;
    const spikes = [[-8, -12], [-3, -16], [2, -14], [7, -10]];
    for (const [sx, sy] of spikes) {
      ctx.beginPath();
      ctx.moveTo(sx - 4, -r + 2);
      ctx.lineTo(sx, -r + sy);
      ctx.lineTo(sx + 4, -r + 2);
      ctx.closePath();
      ctx.fill();
    }
    // Hair base — fuller coverage
    ctx.fillStyle = ryoHairColor;
    ctx.beginPath();
    ctx.moveTo(-r + 2, -r + 3);
    ctx.quadraticCurveTo(-r + 4, -r - 6, 0, -r - 4);
    ctx.quadraticCurveTo(r - 4, -r - 6, r - 2, -r + 3);
    ctx.lineTo(r - 3, -r + 7);
    ctx.lineTo(-r + 3, -r + 7);
    ctx.closePath();
    ctx.fill();
    // Darker hair base band
    ctx.fillStyle = '#6B4B14';
    ctx.fillRect(-r + 1, -r + 5, headW - 2, 2);
    // Red headband — Ryo's signature (palette-aware)
    ctx.fillStyle = ryoHeadbandColor;
    ctx.fillRect(-r, -r + 2, headW, 4);

    // Headband trailing tails — animated with sin wave flutter
    // Flutter amplitude: small in idle (1-2px), larger in motion
    const hbX = -r * facing * 0.6;
    const animTick = tick ?? _headTick;
    const flutterBase = 1.5;
    const flutterWave = Math.sin(animTick * 0.12) * flutterBase;
    const flutterWave2 = Math.sin(animTick * 0.18 + 1.2) * (flutterBase * 0.7);
    const flutterWave3 = Math.sin(animTick * 0.15 + 2.5) * (flutterBase * 0.5);

    // Tail 1 — longer ribbon, sin wave along its length
    ctx.strokeStyle = shiftColor(ryoHeadbandColor, -15);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hbX, -r + 3);
    ctx.quadraticCurveTo(
      hbX - 3 * facing + flutterWave * facing,
      -r + 6,
      hbX - 7 * facing + flutterWave2 * facing * 1.5,
      -r + 10,
    );
    ctx.stroke();

    // Tail 2 — shorter ribbon, offset phase
    ctx.strokeStyle = shiftColor(ryoHeadbandColor, -30);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(hbX, -r + 4);
    ctx.quadraticCurveTo(
      hbX - 2 * facing + flutterWave3 * facing,
      -r + 8,
      hbX - 5 * facing + flutterWave2 * facing,
      -r + 13,
    );
    ctx.stroke();

    // Tail 3 — thin wispy strand, most responsive to flutter
    ctx.strokeStyle = shiftColor(ryoHeadbandColor, -10);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(hbX + facing, -r + 3.5);
    ctx.quadraticCurveTo(
      hbX - 4 * facing + flutterWave * facing * 1.8,
      -r + 7,
      hbX - 9 * facing + flutterWave3 * facing * 2,
      -r + 12,
    );
    ctx.stroke();

    // Headband knot — small rectangle where tails emerge
    ctx.fillStyle = shiftColor(ryoHeadbandColor, -20);
    ctx.fillRect(hbX - 2, -r + 2, 4, 3);
    // Stronger jaw line — Ryo's trademark determined face
    ctx.strokeStyle = shiftColor('#e8b88a', -30);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.6, r * 0.5);
    ctx.quadraticCurveTo(-r * 0.4, r * 0.85, 0, r * 0.9);
    ctx.quadraticCurveTo(r * 0.4, r * 0.85, r * 0.6, r * 0.5);
    ctx.stroke();
    // Stronger brow ridge — Ryo's trademark glare (override default brows for more intensity)
    ctx.strokeStyle = '#5a3a0a';
    ctx.lineWidth = 3;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * (8 - 5), -4 - 2 * side);
      ctx.lineTo(side * (8 + 5), -4.5 + 2 * side);
      ctx.stroke();
    }
  } else if (charId === 'leona') {
    // Leona: short blonde hair
    ctx.fillStyle = '#DAA520';
    ctx.beginPath();
    ctx.moveTo(-r + 1, -r + 2);
    ctx.lineTo(-r - 1, -r - 7);
    ctx.quadraticCurveTo(0, -r - 9, r + 1, -r - 7);
    ctx.lineTo(r - 1, -r + 2);
    ctx.closePath();
    ctx.fill();
    // Side bangs
    ctx.fillStyle = '#B8860B';
    ctx.beginPath();
    ctx.moveTo(-r, -r + 4);
    ctx.lineTo(-r - 3, -r + 14);
    ctx.lineTo(-r + 2, -r + 10);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(r, -r + 4);
    ctx.lineTo(r + 3, -r + 14);
    ctx.lineTo(r - 2, -r + 10);
    ctx.closePath();
    ctx.fill();
  } else if (charId === 'kdash') {
    // K': silver spiky hair
    ctx.fillStyle = '#C0C0C0';
    const spikes = [[-7, -16], [-2, -20], [3, -18], [8, -14]];
    for (const [sx, sy] of spikes) {
      ctx.beginPath();
      ctx.moveTo(sx - 3, -r + 2);
      ctx.lineTo(sx, -r + sy);
      ctx.lineTo(sx + 3, -r + 2);
      ctx.closePath();
      ctx.fill();
    }
    // Dark tips
    ctx.fillStyle = '#888';
    for (const [sx, sy] of spikes) {
      ctx.beginPath();
      ctx.moveTo(sx - 1, -r + sy);
      ctx.lineTo(sx, -r + sy + 4);
      ctx.lineTo(sx + 1, -r + sy);
      ctx.closePath();
      ctx.fill();
    }
    // Sunglasses hint
    ctx.fillStyle = '#222';
    ctx.fillRect(-8, -3, 16, 4);
    ctx.fillStyle = '#ff4400';
    ctx.fillRect(-6, -2, 4, 2);
    ctx.fillRect(2, -2, 4, 2);
  } else if (charId === 'kula') {
    // Kula: strawberry blonde wavy hair
    ctx.fillStyle = '#cc8855';
    ctx.beginPath();
    ctx.moveTo(-r - 1, -r + 3);
    ctx.quadraticCurveTo(-r + 2, -r - 10, 0, -r - 8);
    ctx.quadraticCurveTo(r - 2, -r - 10, r + 1, -r + 3);
    ctx.lineTo(r - 1, -r + 6);
    ctx.lineTo(-r + 1, -r + 6);
    ctx.closePath();
    ctx.fill();
    // Side waves
    ctx.fillStyle = '#bb7744';
    ctx.beginPath();
    ctx.moveTo(-r, -r + 3);
    ctx.quadraticCurveTo(-r - 4, -r + 10, -r - 2, -r + 18);
    ctx.lineTo(-r + 2, -r + 12);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(r, -r + 3);
    ctx.quadraticCurveTo(r + 4, -r + 10, r + 2, -r + 18);
    ctx.lineTo(r - 2, -r + 12);
    ctx.closePath();
    ctx.fill();
    // Ice blue hair highlight
    ctx.fillStyle = 'rgba(100, 180, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(-3, -r + 1);
    ctx.quadraticCurveTo(0, -r - 6, 3, -r + 1);
    ctx.lineTo(2, -r + 4);
    ctx.lineTo(-2, -r + 4);
    ctx.closePath();
    ctx.fill();
  } else if (charId === 'robert') {
    // Robert: slicked-back dark hair
    ctx.fillStyle = '#2a1a0a';
    ctx.beginPath();
    ctx.moveTo(-r + 2, -r + 3);
    ctx.quadraticCurveTo(-r + 4, -r - 8, 0, -r - 6);
    ctx.quadraticCurveTo(r - 4, -r - 8, r + 2, -r + 3);
    ctx.lineTo(r, -r + 6);
    ctx.lineTo(-r, -r + 6);
    ctx.closePath();
    ctx.fill();
    // Slicked-back volume
    ctx.fillStyle = '#1a0a00';
    ctx.beginPath();
    ctx.moveTo(-r + 4, -r + 1);
    ctx.quadraticCurveTo(0, -r - 4, r - 4, -r + 1);
    ctx.lineTo(r - 5, -r + 4);
    ctx.lineTo(-r + 5, -r + 4);
    ctx.closePath();
    ctx.fill();
    // Sideburns
    ctx.fillStyle = '#2a1a0a';
    ctx.beginPath();
    ctx.moveTo(-r, -r + 4);
    ctx.lineTo(-r - 2, -r + 10);
    ctx.lineTo(-r + 2, -r + 8);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(r, -r + 4);
    ctx.lineTo(r + 2, -r + 10);
    ctx.lineTo(r - 2, -r + 8);
    ctx.closePath();
    ctx.fill();
  } else if (charId === 'athena') {
    // Athena: long purple hair with ponytail
    ctx.fillStyle = '#7744cc';
    // Top volume — full rounded bangs
    ctx.beginPath();
    ctx.moveTo(-r - 2, -r + 3);
    ctx.quadraticCurveTo(-r + 2, -r - 10, 0, -r - 8);
    ctx.quadraticCurveTo(r - 2, -r - 10, r + 2, -r + 3);
    ctx.lineTo(r, -r + 6);
    ctx.lineTo(-r, -r + 6);
    ctx.closePath();
    ctx.fill();
    // Side bangs — flowing down on both sides
    ctx.fillStyle = '#6633bb';
    ctx.beginPath();
    ctx.moveTo(-r, -r + 4);
    ctx.quadraticCurveTo(-r - 5, -r + 12, -r - 3, -r + 22);
    ctx.lineTo(-r + 2, -r + 14);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(r, -r + 4);
    ctx.quadraticCurveTo(r + 5, -r + 12, r + 3, -r + 22);
    ctx.lineTo(r - 2, -r + 14);
    ctx.closePath();
    ctx.fill();
    // Ponytail flowing to the back
    ctx.fillStyle = '#7744cc';
    const ptX = -r * facing * 0.5;
    ctx.beginPath();
    ctx.moveTo(ptX, -r + 2);
    ctx.quadraticCurveTo(ptX - 6 * facing, -r + 8, ptX - 10 * facing, -r + 20);
    ctx.quadraticCurveTo(ptX - 8 * facing, -r + 12, ptX, -r + 5);
    ctx.closePath();
    ctx.fill();
    // Hair ribbon (star-shaped accessory)
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.arc(ptX - 2 * facing, -r + 5, 2.5, 0, Math.PI * 2);
    ctx.fill();
    // Light purple highlight
    ctx.fillStyle = 'rgba(170, 120, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(-3, -r + 1);
    ctx.quadraticCurveTo(0, -r - 6, 3, -r + 1);
    ctx.lineTo(2, -r + 4);
    ctx.lineTo(-2, -r + 4);
    ctx.closePath();
    ctx.fill();
  } else if (charId === 'mai') {
    // Mai: long brown hair with ponytail and hair band
    ctx.fillStyle = '#7a4828';
    // Top volume — full flowing hair
    ctx.beginPath();
    ctx.moveTo(-r - 2, -r + 3);
    ctx.quadraticCurveTo(-r + 2, -r - 10, 0, -r - 8);
    ctx.quadraticCurveTo(r - 2, -r - 10, r + 2, -r + 3);
    ctx.lineTo(r, -r + 6);
    ctx.lineTo(-r, -r + 6);
    ctx.closePath();
    ctx.fill();
    // Side bangs — flowing down
    ctx.fillStyle = '#5a3018';
    ctx.beginPath();
    ctx.moveTo(-r, -r + 4);
    ctx.quadraticCurveTo(-r - 4, -r + 12, -r - 2, -r + 22);
    ctx.lineTo(-r + 2, -r + 14);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(r, -r + 4);
    ctx.quadraticCurveTo(r + 4, -r + 12, r + 2, -r + 22);
    ctx.lineTo(r - 2, -r + 14);
    ctx.closePath();
    ctx.fill();
    // Long ponytail flowing to the back
    ctx.fillStyle = '#7a4828';
    const ptX = -r * facing * 0.5;
    ctx.beginPath();
    ctx.moveTo(ptX, -r + 2);
    ctx.quadraticCurveTo(ptX - 8 * facing, -r + 10, ptX - 14 * facing, -r + 28);
    ctx.quadraticCurveTo(ptX - 10 * facing, -r + 14, ptX, -r + 5);
    ctx.closePath();
    ctx.fill();
    // Hair band
    ctx.fillStyle = '#ff4488';
    ctx.fillRect(-r + 1, -r + 5, headW - 2, 3);
    // Brown highlight
    ctx.fillStyle = 'rgba(160, 100, 50, 0.2)';
    ctx.beginPath();
    ctx.moveTo(-3, -r + 1);
    ctx.quadraticCurveTo(0, -r - 6, 3, -r + 1);
    ctx.lineTo(2, -r + 4);
    ctx.lineTo(-2, -r + 4);
    ctx.closePath();
    ctx.fill();
  } else if (charId === 'ralf') {
    // Ralf: blonde bandana + short spiky hair underneath
    ctx.fillStyle = '#ccaa44';
    ctx.beginPath();
    ctx.moveTo(-r + 2, -r + 3);
    ctx.quadraticCurveTo(-r + 4, -r - 6, 0, -r - 4);
    ctx.quadraticCurveTo(r - 4, -r - 6, r - 2, -r + 3);
    ctx.lineTo(r - 3, -r + 6);
    ctx.lineTo(-r + 3, -r + 6);
    ctx.closePath();
    ctx.fill();
    // Bandana
    ctx.fillStyle = '#cc8844';
    ctx.fillRect(-r, -r + 2, headW, 6);
    // Bandana knot on the back side
    ctx.fillStyle = '#aa6622';
    const knotX = -r * facing * 0.3;
    ctx.beginPath();
    ctx.moveTo(knotX, -r + 2);
    ctx.lineTo(knotX - 4 * facing, -r - 2);
    ctx.lineTo(knotX - 2 * facing, -r + 5);
    ctx.closePath();
    ctx.fill();
  } else if (charId === 'clark') {
    // Clark: blonde crew cut + sunglasses + dog tags
    ctx.fillStyle = '#ccaa44';
    ctx.beginPath();
    ctx.moveTo(-r + 2, -r + 3);
    ctx.quadraticCurveTo(-r + 4, -r - 6, 0, -r - 4);
    ctx.quadraticCurveTo(r - 4, -r - 6, r - 2, -r + 3);
    ctx.lineTo(r - 3, -r + 6);
    ctx.lineTo(-r + 3, -r + 6);
    ctx.closePath();
    ctx.fill();
    // Crew cut texture — short bristles
    ctx.fillStyle = '#b89838';
    for (let i = -2; i <= 2; i++) {
      ctx.fillRect(i * 5 - 2, -r + 1, 4, 3);
    }
    // Sunglasses — dark band across eyes
    ctx.fillStyle = '#222';
    ctx.fillRect(-r + 3, -4, headW - 6, 6);
    // Lens highlights
    ctx.fillStyle = 'rgba(80,80,120,0.3)';
    ctx.fillRect(-r + 5, -3, 6, 4);
    ctx.fillRect(r - 11, -3, 6, 4);
    // Dog tag strap hint on neck area
    ctx.fillStyle = '#887744';
    ctx.fillRect(-3, r - 2, 6, 2);
    ctx.fillStyle = '#cc9933';
    ctx.beginPath();
    ctx.arc(0, r + 2, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (charId === 'joe') {
    // Joe: short spiky blonde hair + red headband
    ctx.fillStyle = '#ddbb44';
    const spikes = [[-8, -14], [-3, -18], [2, -16], [7, -12]];
    for (const [sx, sy] of spikes) {
      ctx.beginPath();
      ctx.moveTo(sx - 4, -r + 2);
      ctx.lineTo(sx, -r + sy);
      ctx.lineTo(sx + 4, -r + 2);
      ctx.closePath();
      ctx.fill();
    }
    // Hair base
    ctx.fillStyle = '#ddbb44';
    ctx.beginPath();
    ctx.moveTo(-r + 2, -r + 3);
    ctx.quadraticCurveTo(-r + 4, -r - 4, 0, -r - 2);
    ctx.quadraticCurveTo(r - 4, -r - 4, r - 2, -r + 3);
    ctx.lineTo(r - 3, -r + 7);
    ctx.lineTo(-r + 3, -r + 7);
    ctx.closePath();
    ctx.fill();
    // Headband (red)
    ctx.fillStyle = '#ff4400';
    ctx.fillRect(-r + 1, -r + 2, headW - 2, 5);
    // Headband knot on the back
    const knotX = -r * facing * 0.6;
    ctx.fillStyle = '#cc3300';
    ctx.beginPath();
    ctx.moveTo(knotX, -r + 2);
    ctx.lineTo(knotX - 5 * facing, -r - 3);
    ctx.lineTo(knotX - 2 * facing, -r + 2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(knotX, -r + 4);
    ctx.lineTo(knotX - 4 * facing, -r + 8);
    ctx.lineTo(knotX - 1 * facing, -r + 5);
    ctx.closePath();
    ctx.fill();
    // Blonde highlight
    ctx.fillStyle = 'rgba(240, 220, 100, 0.3)';
    ctx.beginPath();
    ctx.moveTo(-3, -r + 1);
    ctx.quadraticCurveTo(0, -r - 5, 3, -r + 1);
    ctx.lineTo(2, -r + 4);
    ctx.lineTo(-2, -r + 4);
    ctx.closePath();
    ctx.fill();
  } else if (charId === 'andy') {
    // Andy: short neat blonde hair + white headband
    ctx.fillStyle = '#ccaa44';
    ctx.beginPath();
    ctx.moveTo(-r + 2, -r + 3);
    ctx.quadraticCurveTo(-r + 4, -r - 6, 0, -r - 5);
    ctx.quadraticCurveTo(r - 4, -r - 6, r - 2, -r + 3);
    ctx.lineTo(r - 3, -r + 7);
    ctx.lineTo(-r + 3, -r + 7);
    ctx.closePath();
    ctx.fill();
    // White headband
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-r + 1, -r + 3, headW - 2, 5);
    // Headband trailing tails
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-r, -r + 4); ctx.lineTo(-r - 8, -r + 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(r, -r + 4); ctx.lineTo(r + 8, -r + 8); ctx.stroke();
    // Hair highlight
    ctx.fillStyle = 'rgba(238, 204, 102, 0.3)';
    ctx.beginPath();
    ctx.moveTo(-3, -r + 2);
    ctx.quadraticCurveTo(0, -r - 3, 3, -r + 2);
    ctx.lineTo(2, -r + 5);
    ctx.lineTo(-2, -r + 5);
    ctx.closePath();
    ctx.fill();
  } else if (charId === 'billy') {
    // Billy: blonde hair + brown bandana
    ctx.fillStyle = '#ccaa44';
    ctx.beginPath();
    ctx.moveTo(-r + 2, -r + 3);
    ctx.quadraticCurveTo(-r + 4, -r - 6, 0, -r - 5);
    ctx.quadraticCurveTo(r - 4, -r - 6, r - 2, -r + 3);
    ctx.lineTo(r - 3, -r + 7);
    ctx.lineTo(-r + 3, -r + 7);
    ctx.closePath();
    ctx.fill();
    // Brown bandana
    ctx.fillStyle = '#cc8833';
    ctx.fillRect(-r, -r + 2, headW, 6);
    // Bandana knot on the back
    const knotX = -r * facing * 0.4;
    ctx.fillStyle = '#aa6622';
    ctx.beginPath();
    ctx.moveTo(knotX, -r + 2);
    ctx.lineTo(knotX - 5 * facing, -r - 4);
    ctx.lineTo(knotX - 2 * facing, -r + 3);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(knotX, -r + 4);
    ctx.lineTo(knotX - 4 * facing, -r + 9);
    ctx.lineTo(knotX - 1 * facing, -r + 5);
    ctx.closePath();
    ctx.fill();
    // Blonde highlight
    ctx.fillStyle = 'rgba(238, 204, 102, 0.3)';
    ctx.beginPath();
    ctx.moveTo(-3, -r + 1);
    ctx.quadraticCurveTo(0, -r - 5, 3, -r + 1);
    ctx.lineTo(2, -r + 4);
    ctx.lineTo(-2, -r + 4);
    ctx.closePath();
    ctx.fill();
  } else if (charId === 'chang') {
    // Chang: bald head with small topknot
    ctx.fillStyle = '#222222';
    // Small topknot on top of head
    ctx.beginPath();
    ctx.moveTo(-3, -r + 2);
    ctx.lineTo(0, -r - 10);
    ctx.lineTo(3, -r + 2);
    ctx.closePath();
    ctx.fill();
    // Slight hair stubble texture on top
    ctx.fillStyle = '#333333';
    for (let i = -3; i <= 3; i++) {
      ctx.fillRect(i * 4 - 1, -r + 1, 2, 2);
    }
  } else if (charId === 'choi') {
    // Choi: wild spiky grey hair, small head
    ctx.fillStyle = '#888888';
    const spikes = [[-10, -16], [-5, -22], [0, -18], [5, -24], [10, -16]];
    for (const [sx, sy] of spikes) {
      ctx.beginPath();
      ctx.moveTo(sx - 4, -r + 2);
      ctx.lineTo(sx, -r + sy);
      ctx.lineTo(sx + 4, -r + 2);
      ctx.closePath();
      ctx.fill();
    }
    // Hair base
    ctx.fillStyle = '#777777';
    ctx.beginPath();
    ctx.moveTo(-r + 2, -r + 3);
    ctx.quadraticCurveTo(-r + 4, -r - 6, 0, -r - 4);
    ctx.quadraticCurveTo(r - 4, -r - 6, r - 2, -r + 3);
    ctx.lineTo(r - 3, -r + 6);
    ctx.lineTo(-r + 3, -r + 6);
    ctx.closePath();
    ctx.fill();
    // Face paint stripe across eyes
    ctx.fillStyle = '#cc2222';
    ctx.fillRect(-r + 4, -4, headW - 8, 3);
  } else if (charId === 'mature') {
    // Mature: long flowing blonde hair, sultry
    ctx.fillStyle = '#dab840';
    ctx.beginPath();
    ctx.moveTo(-r + 1, -r + 2);
    ctx.lineTo(-r - 2, -r - 8);
    ctx.quadraticCurveTo(0, -r - 10, r + 2, -r - 8);
    ctx.lineTo(r - 1, -r + 2);
    ctx.closePath();
    ctx.fill();
    // Long side hair flowing down
    const sideX = r * facing * 0.7;
    ctx.fillStyle = '#c8a830';
    ctx.beginPath();
    ctx.moveTo(sideX * 0.4, -r);
    ctx.quadraticCurveTo(sideX + 5 * facing, -r + 6, sideX + 10 * facing, r + 14);
    ctx.lineTo(sideX + 6 * facing, r + 12);
    ctx.quadraticCurveTo(sideX - 2 * facing, -r + 10, sideX * 0.2, -r + 3);
    ctx.closePath();
    ctx.fill();
    // Darker blonde strands
    ctx.fillStyle = '#b89820';
    ctx.beginPath();
    ctx.moveTo(-r, -r + 4);
    ctx.lineTo(-r - 4, -r + 16);
    ctx.lineTo(-r + 2, -r + 10);
    ctx.closePath();
    ctx.fill();
  } else if (charId === 'chris') {
    // Chris: light brown spiky hair, youthful
    ctx.fillStyle = '#c88848';
    const spikes = [[-8, -14], [-3, -18], [2, -16], [7, -12]];
    for (const [sx, sy] of spikes) {
      ctx.beginPath();
      ctx.moveTo(sx - 4, -r + 2);
      ctx.lineTo(sx, -r + sy);
      ctx.lineTo(sx + 4, -r + 2);
      ctx.closePath();
      ctx.fill();
    }
    // Hair base
    ctx.fillStyle = '#c88848';
    ctx.beginPath();
    ctx.moveTo(-r + 2, -r + 3);
    ctx.quadraticCurveTo(-r + 4, -r - 6, 0, -r - 4);
    ctx.quadraticCurveTo(r - 4, -r - 6, r - 2, -r + 3);
    ctx.lineTo(r - 3, -r + 7);
    ctx.lineTo(-r + 3, -r + 7);
    ctx.closePath();
    ctx.fill();
    // Darker brown strands
    ctx.fillStyle = '#a06830';
    ctx.beginPath();
    ctx.moveTo(-r, -r + 4);
    ctx.lineTo(-r - 3, -r + 14);
    ctx.lineTo(-r + 2, -r + 9);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(r, -r + 4);
    ctx.lineTo(r + 3, -r + 14);
    ctx.lineTo(r - 2, -r + 9);
    ctx.closePath();
    ctx.fill();
    // Warm highlight
    ctx.fillStyle = 'rgba(220, 160, 80, 0.3)';
    ctx.beginPath();
    ctx.moveTo(-3, -r + 1);
    ctx.quadraticCurveTo(0, -r - 5, 3, -r + 1);
    ctx.lineTo(2, -r + 4);
    ctx.lineTo(-2, -r + 4);
    ctx.closePath();
    ctx.fill();
  } else if (charId === 'shermie') {
    // Shermie: brown-purple wavy hair, alluring
    ctx.fillStyle = '#8b5a7a';
    ctx.beginPath();
    ctx.moveTo(-r + 1, -r + 2);
    ctx.lineTo(-r - 2, -r - 8);
    ctx.quadraticCurveTo(0, -r - 12, r + 2, -r - 8);
    ctx.lineTo(r - 1, -r + 2);
    ctx.closePath();
    ctx.fill();
    // Long side hair flowing down
    const sideX = r * facing * 0.7;
    ctx.fillStyle = '#7a4a6a';
    ctx.beginPath();
    ctx.moveTo(sideX * 0.4, -r);
    ctx.quadraticCurveTo(sideX + 5 * facing, -r + 8, sideX + 12 * facing, r + 18);
    ctx.lineTo(sideX + 8 * facing, r + 16);
    ctx.quadraticCurveTo(sideX - 2 * facing, -r + 12, sideX * 0.2, -r + 3);
    ctx.closePath();
    ctx.fill();
    // Darker strands
    ctx.fillStyle = '#6b3a5a';
    ctx.beginPath();
    ctx.moveTo(-r, -r + 4);
    ctx.lineTo(-r - 4, -r + 16);
    ctx.lineTo(-r + 2, -r + 10);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(r, -r + 4);
    ctx.lineTo(r + 4, -r + 16);
    ctx.lineTo(r - 2, -r + 10);
    ctx.closePath();
    ctx.fill();
  } else if (charId === 'vice') {
    // Vice: short silver/gray hair, fierce
    ctx.fillStyle = '#a0a0b0';
    ctx.beginPath();
    ctx.moveTo(-r + 1, -r + 2);
    ctx.lineTo(-r - 1, -r - 6);
    ctx.quadraticCurveTo(0, -r - 8, r + 1, -r - 6);
    ctx.lineTo(r - 1, -r + 2);
    ctx.closePath();
    ctx.fill();
    // Short spiky bangs
    ctx.fillStyle = '#888898';
    const spikes = [[-8, -12], [-3, -15], [2, -14], [7, -11]];
    for (const [sx, sy] of spikes) {
      ctx.beginPath();
      ctx.moveTo(sx - 3, -r + 2);
      ctx.lineTo(sx, -r + sy);
      ctx.lineTo(sx + 3, -r + 2);
      ctx.closePath();
      ctx.fill();
    }
    // Side fringe — short angular
    ctx.fillStyle = '#909098';
    ctx.beginPath();
    ctx.moveTo(-r, -r + 4);
    ctx.lineTo(-r - 3, -r + 12);
    ctx.lineTo(-r + 2, -r + 8);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(r, -r + 4);
    ctx.lineTo(r + 3, -r + 12);
    ctx.lineTo(r - 2, -r + 8);
    ctx.closePath();
    ctx.fill();
  } else if (charId === 'yamazaki') {
    // Yamazaki: slicked-back black hair, menacing
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(-r + 2, -r + 3);
    ctx.quadraticCurveTo(-r + 4, -r - 8, 0, -r - 6);
    ctx.quadraticCurveTo(r - 4, -r - 8, r + 2, -r + 3);
    ctx.lineTo(r, -r + 6);
    ctx.lineTo(-r, -r + 6);
    ctx.closePath();
    ctx.fill();
    // Slicked-back volume — dark top
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath();
    ctx.moveTo(-r + 4, -r + 1);
    ctx.quadraticCurveTo(0, -r - 4, r - 4, -r + 1);
    ctx.lineTo(r - 5, -r + 4);
    ctx.lineTo(-r + 5, -r + 4);
    ctx.closePath();
    ctx.fill();
    // Sideburns
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(-r, -r + 4);
    ctx.lineTo(-r - 2, -r + 10);
    ctx.lineTo(-r + 2, -r + 8);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(r, -r + 4);
    ctx.lineTo(r + 2, -r + 10);
    ctx.lineTo(r - 2, -r + 8);
    ctx.closePath();
    ctx.fill();
  } else if (charId === 'mary') {
    // Mary: blonde medium-length hair, confident
    ctx.fillStyle = '#ddbb44';
    ctx.beginPath();
    ctx.moveTo(-r + 1, -r + 2);
    ctx.lineTo(-r - 2, -r - 6);
    ctx.quadraticCurveTo(0, -r - 10, r + 2, -r - 6);
    ctx.lineTo(r - 1, -r + 2);
    ctx.closePath();
    ctx.fill();
    // Soft bangs
    ctx.fillStyle = '#ccaa33';
    const bangs = [[-10, -14], [-4, -17], [2, -16], [8, -13]];
    for (const [bx, by] of bangs) {
      ctx.beginPath();
      ctx.moveTo(bx - 4, -r + 2);
      ctx.lineTo(bx, -r + by);
      ctx.lineTo(bx + 4, -r + 2);
      ctx.closePath();
      ctx.fill();
    }
    // Side hair — medium length framing face
    ctx.fillStyle = '#ddbb44';
    ctx.beginPath();
    ctx.moveTo(-r, -r + 4);
    ctx.lineTo(-r - 4, -r + 18);
    ctx.lineTo(-r + 3, -r + 10);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(r, -r + 4);
    ctx.lineTo(r + 4, -r + 18);
    ctx.lineTo(r - 3, -r + 10);
    ctx.closePath();
    ctx.fill();
  } else if (charId === 'kasumi') {
    // Kasumi: black hair with ponytail, disciplined
    ctx.fillStyle = '#1a1a2a';
    ctx.beginPath();
    ctx.moveTo(-r + 1, -r + 2);
    ctx.lineTo(-r - 1, -r - 6);
    ctx.quadraticCurveTo(0, -r - 8, r + 1, -r - 6);
    ctx.lineTo(r - 1, -r + 2);
    ctx.closePath();
    ctx.fill();
    // Neat bangs — straight across
    ctx.fillStyle = '#222238';
    ctx.beginPath();
    ctx.moveTo(-r + 2, -r + 2);
    ctx.lineTo(-r, -r - 4);
    ctx.lineTo(r, -r - 4);
    ctx.lineTo(r - 2, -r + 2);
    ctx.closePath();
    ctx.fill();
    // Ponytail extending back
    ctx.fillStyle = '#1a1a2a';
    ctx.beginPath();
    ctx.moveTo(r - 2, -r + 2);
    ctx.lineTo(r + 6, -r - 2);
    ctx.lineTo(r + 10, -r + 8);
    ctx.lineTo(r + 6, -r + 14);
    ctx.lineTo(r - 1, -r + 8);
    ctx.closePath();
    ctx.fill();
    // Hair ribbon
    ctx.fillStyle = '#dd4466';
    ctx.beginPath();
    ctx.moveTo(r, -r + 3);
    ctx.lineTo(r + 4, -r + 0);
    ctx.lineTo(r + 2, -r + 6);
    ctx.closePath();
    ctx.fill();
  }
}

// ===== Ryo portrait rendering — HUD & select screen =====

/** Ryo color palette variants for A/B/C/D color indices */
const RYO_COLOR_PALETTES: Array<{ hair: string; headband: string; skin: string; gi: string; giShadow: string }> = [
  // A: classic orange gi, gold-brown hair
  { hair: '#8B6914', headband: '#cc2222', skin: '#e8b07d', gi: '#f7f4ee', giShadow: '#d5cec2' },
  // B: dark gi, lighter hair
  { hair: '#a07828', headband: '#2255cc', skin: '#e8b07d', gi: '#2a2a3a', giShadow: '#1a1a2a' },
  // C: red gi, dark hair
  { hair: '#5a4020', headband: '#cc2222', skin: '#e8b07d', gi: '#cc3333', giShadow: '#992222' },
  // D: green gi, gold hair
  { hair: '#b8901a', headband: '#225522', skin: '#e8b07d', gi: '#338844', giShadow: '#226633' },
];

function getRyoPalette(colorIndex: number) {
  return RYO_COLOR_PALETTES[Math.max(0, Math.min(3, colorIndex))] ?? RYO_COLOR_PALETTES[0];
}

/**
 * Draw Ryo's HUD portrait — small face closeup for health bar area.
 *
 * Health-dependent effects:
 *   > 50%: normal expression
 *   25-50%: slightly bruised (darker shadows)
 *   < 25%: desperation (red tint, sweat drops)
 */
export function drawRyoPortrait(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  width: number, height: number,
  healthPercent: number,
  colorIndex: number,
): void {
  ctx.save();
  ctx.translate(x, y);

  const pal = getRyoPalette(colorIndex);
  const isLow = healthPercent < 0.5;
  const isDesperate = healthPercent < 0.25;

  // Clip to portrait bounds
  ctx.beginPath();
  roundRect(ctx, 0, 0, width, height, 3);
  ctx.clip();

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#0a0a18');
  bgGrad.addColorStop(1, '#151520');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Center the head within the portrait box
  const cx = width / 2;
  const cy = height * 0.45;
  const headR = Math.min(width, height) * 0.36;

  // === Head shape — skin with depth gradient ===
  const skinGrad = ctx.createRadialGradient(cx - headR * 0.1, cy - headR * 0.1, 0, cx, cy, headR);
  skinGrad.addColorStop(0, shiftColor(pal.skin, 25));
  skinGrad.addColorStop(0.55, pal.skin);
  skinGrad.addColorStop(0.85, shiftColor(pal.skin, -12));
  skinGrad.addColorStop(1, shiftColor(pal.skin, -22));
  ctx.fillStyle = skinGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, headR * 0.92, headR, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head outline — crisp SNK-style dark line
  ctx.strokeStyle = shiftColor(pal.skin, -45);
  ctx.lineWidth = Math.max(1, headR * 0.04);
  ctx.beginPath();
  ctx.ellipse(cx, cy, headR * 0.92, headR, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Cheekbone shadows — defined facial structure
  ctx.fillStyle = shiftColor(pal.skin, -10);
  ctx.beginPath();
  ctx.ellipse(cx - headR * 0.35, cy + headR * 0.12, headR * 0.18, headR * 0.12, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + headR * 0.35, cy + headR * 0.12, headR * 0.18, headR * 0.12, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Desperation red tint overlay
  if (isDesperate) {
    ctx.fillStyle = 'rgba(200, 30, 10, 0.15)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, headR * 0.92, headR, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Low health darker shadows
  if (isLow) {
    ctx.fillStyle = 'rgba(60, 20, 10, 0.18)';
    ctx.beginPath();
    ctx.ellipse(cx + headR * 0.3, cy + headR * 0.3, headR * 0.5, headR * 0.6, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // === Hair — short spiky swept-back brown hair with depth ===
  // Hair base — fuller coverage underneath spikes
  ctx.fillStyle = pal.hair;
  ctx.beginPath();
  ctx.moveTo(cx - headR * 0.9, cy - headR + headR * 0.12);
  ctx.quadraticCurveTo(cx - headR * 0.6, cy - headR - headR * 0.2, cx, cy - headR - headR * 0.15);
  ctx.quadraticCurveTo(cx + headR * 0.6, cy - headR - headR * 0.2, cx + headR * 0.9, cy - headR + headR * 0.12);
  ctx.lineTo(cx + headR * 0.88, cy - headR + headR * 0.25);
  ctx.quadraticCurveTo(cx, cy - headR + headR * 0.18, cx - headR * 0.88, cy - headR + headR * 0.25);
  ctx.closePath();
  ctx.fill();

  // Hair spikes — swept-back angular style with darker shadow layer
  const hairSpikes = [
    { x: -0.5, y: -1.15, w: 0.16 },
    { x: -0.18, y: -1.5, w: 0.18 },
    { x: 0.12, y: -1.38, w: 0.16 },
    { x: 0.38, y: -1.2, w: 0.14 },
    { x: 0.6, y: -1.0, w: 0.12 },
  ] as const;
  for (const spike of hairSpikes) {
    const spikeX = cx + spike.x * headR;
    const spikeY = cy + spike.y * headR;
    const spikeW = spike.w * headR;
    // Main spike
    ctx.fillStyle = pal.hair;
    ctx.beginPath();
    ctx.moveTo(spikeX - spikeW, cy - headR + headR * 0.1);
    ctx.lineTo(spikeX, spikeY);
    ctx.lineTo(spikeX + spikeW, cy - headR + headR * 0.1);
    ctx.closePath();
    ctx.fill();
    // Darker edge on each spike for depth
    ctx.fillStyle = shiftColor(pal.hair, -20);
    ctx.beginPath();
    ctx.moveTo(spikeX, spikeY);
    ctx.lineTo(spikeX + spikeW * 0.4, spikeY + headR * 0.06);
    ctx.lineTo(spikeX + spikeW, cy - headR + headR * 0.1);
    ctx.closePath();
    ctx.fill();
  }

  // Hair shadow band — darker zone near hairline for depth
  ctx.fillStyle = shiftColor(pal.hair, -25);
  ctx.fillRect(cx - headR * 0.85, cy - headR + headR * 0.16, headR * 1.7, headR * 0.06);
  // Hair highlight streak — subtle lighter band
  ctx.fillStyle = shiftColor(pal.hair, 20);
  ctx.fillRect(cx - headR * 0.15, cy - headR + headR * 0.08, headR * 0.1, headR * 0.12);

  // === Red headband — Ryo's signature with knot and trailing tails ===
  // Headband base — slightly wider than head for visible tails
  ctx.fillStyle = pal.headband;
  ctx.fillRect(cx - headR * 0.95, cy - headR + headR * 0.06, headR * 1.9, headR * 0.18);
  // Headband highlight — lighter center stripe
  ctx.fillStyle = shiftColor(pal.headband, 25);
  ctx.fillRect(cx - headR * 0.85, cy - headR + headR * 0.06, headR * 1.7, headR * 0.05);
  // Headband shadow — darker bottom edge
  ctx.fillStyle = shiftColor(pal.headband, -25);
  ctx.fillRect(cx - headR * 0.9, cy - headR + headR * 0.18, headR * 1.8, headR * 0.04);
  // Headband knot — small rectangle where tails emerge
  const knotX = cx - headR * 0.7;
  const knotY = cy - headR + headR * 0.14;
  ctx.fillStyle = shiftColor(pal.headband, -15);
  ctx.fillRect(knotX - headR * 0.06, knotY - headR * 0.06, headR * 0.12, headR * 0.12);
  // Headband tails — two trailing strips flowing backward
  const tailDark = shiftColor(pal.headband, -30);
  ctx.fillStyle = tailDark;
  // Tail 1 — longer, curving down
  ctx.beginPath();
  ctx.moveTo(knotX - headR * 0.04, knotY + headR * 0.04);
  ctx.quadraticCurveTo(knotX - headR * 0.25, knotY + headR * 0.15, knotX - headR * 0.35, knotY + headR * 0.45);
  ctx.lineTo(knotX - headR * 0.28, knotY + headR * 0.48);
  ctx.quadraticCurveTo(knotX - headR * 0.18, knotY + headR * 0.12, knotX + headR * 0.02, knotY + headR * 0.04);
  ctx.closePath();
  ctx.fill();
  // Tail 2 — shorter, overlapping
  ctx.beginPath();
  ctx.moveTo(knotX + headR * 0.02, knotY + headR * 0.04);
  ctx.quadraticCurveTo(knotX - headR * 0.15, knotY + headR * 0.2, knotX - headR * 0.2, knotY + headR * 0.55);
  ctx.lineTo(knotX - headR * 0.14, knotY + headR * 0.57);
  ctx.quadraticCurveTo(knotX - headR * 0.08, knotY + headR * 0.18, knotX + headR * 0.06, knotY + headR * 0.04);
  ctx.closePath();
  ctx.fill();
  // Tail highlight
  ctx.fillStyle = shiftColor(pal.headband, -10);
  ctx.beginPath();
  ctx.moveTo(knotX, knotY + headR * 0.04);
  ctx.quadraticCurveTo(knotX - headR * 0.2, knotY + headR * 0.12, knotX - headR * 0.3, knotY + headR * 0.4);
  ctx.lineTo(knotX - headR * 0.28, knotY + headR * 0.4);
  ctx.quadraticCurveTo(knotX - headR * 0.18, knotY + headR * 0.1, knotX + headR * 0.02, knotY + headR * 0.04);
  ctx.closePath();
  ctx.fill();

  // === Eyes — determined stare with upper eyelid line ===
  const eyeSpacing = headR * 0.3;
  const eyeY = cy - headR * 0.05;
  const eyeR = headR * 0.13;
  for (const side of [-1, 1]) {
    const ex = cx + side * eyeSpacing;
    // Eye socket shadow
    ctx.fillStyle = shiftColor(pal.skin, -18);
    ctx.beginPath();
    ctx.ellipse(ex, eyeY + 1, eyeR * 1.2, eyeR * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();
    // Sclera
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(ex, eyeY, eyeR, eyeR + 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    // Iris — deep blue
    ctx.fillStyle = '#4169E1';
    ctx.beginPath();
    ctx.arc(ex + 1, eyeY, eyeR * 0.55, 0, Math.PI * 2);
    ctx.fill();
    // Iris ring — darker outer edge
    ctx.strokeStyle = '#2a4a9a';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(ex + 1, eyeY, eyeR * 0.55, 0, Math.PI * 2);
    ctx.stroke();
    // Pupil
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(ex + 1.2, eyeY, eyeR * 0.28, 0, Math.PI * 2);
    ctx.fill();
    // Eye shine — upper-left catchlight
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.arc(ex + 0.3, eyeY - eyeR * 0.25, eyeR * 0.22, 0, Math.PI * 2);
    ctx.fill();
    // Lower eye shine — subtle
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.arc(ex + 1.5, eyeY + eyeR * 0.2, eyeR * 0.12, 0, Math.PI * 2);
    ctx.fill();
    // Upper eyelid line — thick, gives Ryo his characteristic narrow determined eyes
    ctx.strokeStyle = '#2a1a08';
    ctx.lineWidth = Math.max(1.5, headR * 0.06);
    ctx.beginPath();
    ctx.moveTo(ex - eyeR * 1.2, eyeY - eyeR * 0.3 - side * headR * 0.015);
    ctx.quadraticCurveTo(ex, eyeY - eyeR * 1.1, ex + eyeR * 1.2, eyeY - eyeR * 0.3 + side * headR * 0.015);
    ctx.stroke();
  }

  // === Brows — heavy angled brows, Ryo's trademark glare ===
  ctx.strokeStyle = shiftColor(pal.hair, -35);
  ctx.lineWidth = Math.max(2, headR * 0.09);
  ctx.lineCap = 'round';
  for (const side of [-1, 1]) {
    const browX = cx + side * eyeSpacing;
    ctx.beginPath();
    ctx.moveTo(browX - side * headR * 0.2, eyeY - headR * 0.18 - side * headR * 0.04);
    ctx.lineTo(browX + side * headR * 0.08, eyeY - headR * 0.24 + side * headR * 0.02);
    ctx.stroke();
  }

  // === Nose — more defined bridge and nostril hint ===
  // Nose bridge shadow line
  ctx.strokeStyle = shiftColor(pal.skin, -18);
  ctx.lineWidth = Math.max(0.8, headR * 0.035);
  ctx.beginPath();
  ctx.moveTo(cx + headR * 0.02, cy - headR * 0.02);
  ctx.lineTo(cx + headR * 0.05, cy + headR * 0.15);
  ctx.stroke();
  // Nose tip highlight
  ctx.fillStyle = shiftColor(pal.skin, 10);
  ctx.beginPath();
  ctx.arc(cx + headR * 0.02, cy + headR * 0.13, headR * 0.05, 0, Math.PI * 2);
  ctx.fill();
  // Nostril shadow
  ctx.fillStyle = shiftColor(pal.skin, -18);
  ctx.beginPath();
  ctx.ellipse(cx + headR * 0.08, cy + headR * 0.18, headR * 0.035, headR * 0.025, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // === Mouth — lip outline with expression ===
  const mouthY = cy + headR * 0.38;
  // Upper lip line
  ctx.strokeStyle = shiftColor(pal.skin, -30);
  ctx.lineWidth = Math.max(0.8, headR * 0.03);
  ctx.beginPath();
  ctx.moveTo(cx - headR * 0.14, mouthY);
  ctx.quadraticCurveTo(cx - headR * 0.04, mouthY - headR * 0.03, cx, mouthY - headR * 0.02);
  ctx.quadraticCurveTo(cx + headR * 0.04, mouthY - headR * 0.03, cx + headR * 0.14, mouthY);
  ctx.stroke();
  // Lower lip — subtle shadow
  ctx.fillStyle = shiftColor(pal.skin, -8);
  ctx.beginPath();
  ctx.moveTo(cx - headR * 0.12, mouthY);
  ctx.quadraticCurveTo(cx, mouthY + headR * 0.06, cx + headR * 0.12, mouthY);
  ctx.quadraticCurveTo(cx, mouthY + headR * 0.03, cx - headR * 0.12, mouthY);
  ctx.closePath();
  ctx.fill();
  // Mouth expression when desperate
  if (isDesperate) {
    ctx.strokeStyle = shiftColor(pal.skin, -40);
    ctx.lineWidth = Math.max(1, headR * 0.04);
    ctx.beginPath();
    ctx.moveTo(cx - headR * 0.15, mouthY - headR * 0.02);
    ctx.quadraticCurveTo(cx, mouthY + headR * 0.05, cx + headR * 0.15, mouthY - headR * 0.02);
    ctx.stroke();
  }

  // === Jaw line — strong defined jaw ===
  ctx.strokeStyle = shiftColor(pal.skin, -28);
  ctx.lineWidth = Math.max(0.8, headR * 0.035);
  ctx.beginPath();
  ctx.moveTo(cx - headR * 0.55, cy + headR * 0.55);
  ctx.quadraticCurveTo(cx - headR * 0.35, cy + headR * 0.85, cx, cy + headR * 0.9);
  ctx.quadraticCurveTo(cx + headR * 0.35, cy + headR * 0.85, cx + headR * 0.55, cy + headR * 0.55);
  ctx.stroke();
  // Chin shadow
  ctx.fillStyle = shiftColor(pal.skin, -12);
  ctx.beginPath();
  ctx.ellipse(cx, cy + headR * 0.78, headR * 0.2, headR * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sweat drops when desperate
  if (isDesperate) {
    ctx.fillStyle = 'rgba(120, 200, 255, 0.7)';
    const sweatX = cx + headR * 0.7;
    const sweatY = cy - headR * 0.3;
    ctx.beginPath();
    ctx.moveTo(sweatX, sweatY - headR * 0.06);
    ctx.quadraticCurveTo(sweatX + headR * 0.04, sweatY, sweatX, sweatY + headR * 0.04);
    ctx.quadraticCurveTo(sweatX - headR * 0.04, sweatY, sweatX, sweatY - headR * 0.06);
    ctx.fill();
    // Second smaller drop
    ctx.fillStyle = 'rgba(120, 200, 255, 0.5)';
    ctx.beginPath();
    ctx.moveTo(sweatX - headR * 0.1, sweatY + headR * 0.12);
    ctx.quadraticCurveTo(sweatX - headR * 0.06, sweatY + headR * 0.16, sweatX - headR * 0.1, sweatY + headR * 0.19);
    ctx.quadraticCurveTo(sweatX - headR * 0.14, sweatY + headR * 0.16, sweatX - headR * 0.1, sweatY + headR * 0.12);
    ctx.fill();
  }

  // Portrait border — gold SNK-style frame
  ctx.strokeStyle = 'rgba(200, 168, 50, 0.6)';
  ctx.lineWidth = 1;
  roundRect(ctx, 0, 0, width, height, 3);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draw Ryo's select screen portrait — larger upper body bust.
 *
 * Shows: head + shoulders + gi V-neck + red headband.
 * Slight 3/4 view angle simulated with offset features.
 */
export function drawRyoSelectPortrait(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  size: number,
  colorIndex: number,
): void {
  ctx.save();
  ctx.translate(x, y);

  const pal = getRyoPalette(colorIndex);

  // Clip to portrait bounds
  ctx.beginPath();
  roundRect(ctx, 0, 0, size, size, 6);
  ctx.clip();

  // Background gradient
  const bgGrad = ctx.createRadialGradient(size * 0.5, size * 0.4, 0, size * 0.5, size * 0.5, size * 0.7);
  bgGrad.addColorStop(0, '#1a1520');
  bgGrad.addColorStop(1, '#080810');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, size, size);

  // Center of portrait — slightly off-center for 3/4 view feel
  const cx = size * 0.48;
  const headCy = size * 0.35;
  const headR = size * 0.22;

  // === Shoulders / Gi top ===
  const shoulderY = size * 0.62;
  const shoulderW = size * 0.72;

  // Gi body — gradient with fabric fold shading
  const giGrad = ctx.createLinearGradient(cx - shoulderW / 2, shoulderY, cx + shoulderW / 2, shoulderY + size * 0.4);
  giGrad.addColorStop(0, pal.gi);
  giGrad.addColorStop(0.3, shiftColor(pal.gi, -5));
  giGrad.addColorStop(0.6, shiftColor(pal.gi, -10));
  giGrad.addColorStop(1, pal.giShadow);
  ctx.fillStyle = giGrad;
  ctx.beginPath();
  ctx.moveTo(cx - shoulderW / 2, shoulderY);
  ctx.quadraticCurveTo(cx - shoulderW / 2 - size * 0.05, shoulderY + size * 0.15, cx - shoulderW / 2 + size * 0.05, size);
  ctx.lineTo(cx + shoulderW / 2 - size * 0.05, size);
  ctx.quadraticCurveTo(cx + shoulderW / 2 + size * 0.05, shoulderY + size * 0.15, cx + shoulderW / 2, shoulderY);
  ctx.closePath();
  ctx.fill();

  // Gi fabric folds — diagonal shading lines for fabric drape
  ctx.strokeStyle = shiftColor(pal.gi, -15);
  ctx.lineWidth = Math.max(0.6, size * 0.006);
  ctx.beginPath();
  ctx.moveTo(cx - shoulderW * 0.35, shoulderY + size * 0.04);
  ctx.quadraticCurveTo(cx - shoulderW * 0.2, shoulderY + size * 0.15, cx - shoulderW * 0.1, shoulderY + size * 0.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + shoulderW * 0.3, shoulderY + size * 0.06);
  ctx.quadraticCurveTo(cx + shoulderW * 0.15, shoulderY + size * 0.18, cx + shoulderW * 0.08, shoulderY + size * 0.32);
  ctx.stroke();

  // Shoulder muscle definition — deltoid shadow lines
  ctx.strokeStyle = shiftColor(pal.gi, -20);
  ctx.lineWidth = Math.max(0.8, size * 0.007);
  ctx.beginPath();
  ctx.moveTo(cx - shoulderW * 0.42, shoulderY + size * 0.01);
  ctx.quadraticCurveTo(cx - shoulderW * 0.3, shoulderY + size * 0.05, cx - shoulderW * 0.15, shoulderY + size * 0.04);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + shoulderW * 0.42, shoulderY + size * 0.01);
  ctx.quadraticCurveTo(cx + shoulderW * 0.3, shoulderY + size * 0.05, cx + shoulderW * 0.15, shoulderY + size * 0.04);
  ctx.stroke();

  // Gi V-neck opening — skin visible with shadow depth
  const neckTopY = headCy + headR * 0.9;
  // V-neck shadow — darker recessed area
  ctx.fillStyle = shiftColor(pal.gi, -35);
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.07, neckTopY);
  ctx.lineTo(cx, shoulderY + size * 0.2);
  ctx.lineTo(cx + size * 0.07, neckTopY);
  ctx.closePath();
  ctx.fill();
  // V-neck skin — chest skin visible
  ctx.fillStyle = shiftColor(pal.skin, -8);
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.05, neckTopY);
  ctx.lineTo(cx, shoulderY + size * 0.17);
  ctx.lineTo(cx + size * 0.05, neckTopY);
  ctx.closePath();
  ctx.fill();
  // Chest muscle hint — pectoral line in the V-neck
  ctx.strokeStyle = shiftColor(pal.skin, -15);
  ctx.lineWidth = Math.max(0.5, size * 0.004);
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.025, neckTopY + size * 0.02);
  ctx.quadraticCurveTo(cx, neckTopY + size * 0.06, cx + size * 0.025, neckTopY + size * 0.02);
  ctx.stroke();

  // Gi V-neck outline — thick karate collar lines
  ctx.strokeStyle = shiftColor(pal.gi, -30);
  ctx.lineWidth = Math.max(1.5, size * 0.014);
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.065, neckTopY);
  ctx.lineTo(cx, shoulderY + size * 0.18);
  ctx.lineTo(cx + size * 0.065, neckTopY);
  ctx.stroke();

  // Gi collar fold — left and right lapel overlays
  // Left lapel — overlaps gi body
  ctx.fillStyle = shiftColor(pal.gi, 8);
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.065, neckTopY - size * 0.005);
  ctx.lineTo(cx - size * 0.12, shoulderY + size * 0.04);
  ctx.lineTo(cx - size * 0.02, shoulderY + size * 0.12);
  ctx.lineTo(cx - size * 0.01, neckTopY + size * 0.01);
  ctx.closePath();
  ctx.fill();
  // Right lapel
  ctx.fillStyle = shiftColor(pal.gi, -5);
  ctx.beginPath();
  ctx.moveTo(cx + size * 0.065, neckTopY - size * 0.005);
  ctx.lineTo(cx + size * 0.12, shoulderY + size * 0.04);
  ctx.lineTo(cx + size * 0.02, shoulderY + size * 0.12);
  ctx.lineTo(cx + size * 0.01, neckTopY + size * 0.01);
  ctx.closePath();
  ctx.fill();

  // Collar fold highlight lines
  ctx.strokeStyle = shiftColor(pal.gi, 30);
  ctx.lineWidth = Math.max(0.8, size * 0.006);
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.07, neckTopY - size * 0.008);
  ctx.lineTo(cx - size * 0.1, shoulderY + size * 0.05);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + size * 0.07, neckTopY - size * 0.008);
  ctx.lineTo(cx + size * 0.1, shoulderY + size * 0.05);
  ctx.stroke();

  // Belt / obi — visible at waist, black karate belt
  const beltY = shoulderY + size * 0.26;
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(cx - shoulderW * 0.35, beltY, shoulderW * 0.7, size * 0.028);
  // Belt highlight
  ctx.fillStyle = '#333';
  ctx.fillRect(cx - shoulderW * 0.33, beltY, shoulderW * 0.66, size * 0.008);
  // Belt knot — diamond shape
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.moveTo(cx, beltY - size * 0.005);
  ctx.lineTo(cx - size * 0.018, beltY + size * 0.014);
  ctx.lineTo(cx, beltY + size * 0.032);
  ctx.lineTo(cx + size * 0.018, beltY + size * 0.014);
  ctx.closePath();
  ctx.fill();
  // Belt tails — two strips hanging from knot
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.01, beltY + size * 0.03);
  ctx.quadraticCurveTo(cx - size * 0.02, beltY + size * 0.06, cx - size * 0.015, beltY + size * 0.09);
  ctx.lineTo(cx - size * 0.005, beltY + size * 0.09);
  ctx.quadraticCurveTo(cx - size * 0.01, beltY + size * 0.06, cx + size * 0.005, beltY + size * 0.03);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + size * 0.01, beltY + size * 0.03);
  ctx.quadraticCurveTo(cx + size * 0.015, beltY + size * 0.06, cx + size * 0.01, beltY + size * 0.085);
  ctx.lineTo(cx + size * 0.003, beltY + size * 0.085);
  ctx.quadraticCurveTo(cx + size * 0.005, beltY + size * 0.06, cx, beltY + size * 0.03);
  ctx.closePath();
  ctx.fill();

  // === Neck — with tendon/muscle detail ===
  // Neck shadow
  ctx.fillStyle = shiftColor(pal.skin, -15);
  ctx.beginPath();
  ctx.moveTo(cx - headR * 0.32, headCy + headR * 0.75);
  ctx.lineTo(cx - headR * 0.28, shoulderY + size * 0.02);
  ctx.lineTo(cx + headR * 0.28, shoulderY + size * 0.02);
  ctx.lineTo(cx + headR * 0.32, headCy + headR * 0.75);
  ctx.closePath();
  ctx.fill();
  // Neck main — skin
  ctx.fillStyle = shiftColor(pal.skin, -5);
  ctx.beginPath();
  ctx.moveTo(cx - headR * 0.25, headCy + headR * 0.75);
  ctx.lineTo(cx - headR * 0.2, shoulderY + size * 0.02);
  ctx.lineTo(cx + headR * 0.2, shoulderY + size * 0.02);
  ctx.lineTo(cx + headR * 0.25, headCy + headR * 0.75);
  ctx.closePath();
  ctx.fill();
  // Neck tendon line — sternocleidomastoid shadow
  ctx.strokeStyle = shiftColor(pal.skin, -12);
  ctx.lineWidth = Math.max(0.5, size * 0.004);
  ctx.beginPath();
  ctx.moveTo(cx - headR * 0.08, headCy + headR * 0.8);
  ctx.quadraticCurveTo(cx - headR * 0.05, shoulderY - size * 0.01, cx - size * 0.02, shoulderY + size * 0.02);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + headR * 0.08, headCy + headR * 0.8);
  ctx.quadraticCurveTo(cx + headR * 0.05, shoulderY - size * 0.01, cx + size * 0.02, shoulderY + size * 0.02);
  ctx.stroke();

  // === Head — detailed face with SNK-style depth ===
  const skinGrad = ctx.createRadialGradient(cx - headR * 0.1, headCy - headR * 0.1, 0, cx, headCy, headR);
  skinGrad.addColorStop(0, shiftColor(pal.skin, 25));
  skinGrad.addColorStop(0.5, pal.skin);
  skinGrad.addColorStop(0.8, shiftColor(pal.skin, -12));
  skinGrad.addColorStop(1, shiftColor(pal.skin, -20));
  ctx.fillStyle = skinGrad;
  ctx.beginPath();
  ctx.ellipse(cx, headCy, headR * 0.92, headR, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head outline
  ctx.strokeStyle = shiftColor(pal.skin, -40);
  ctx.lineWidth = Math.max(1, size * 0.006);
  ctx.beginPath();
  ctx.ellipse(cx, headCy, headR * 0.92, headR, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Cheekbone shadows
  ctx.fillStyle = shiftColor(pal.skin, -10);
  ctx.beginPath();
  ctx.ellipse(cx - headR * 0.32, headCy + headR * 0.15, headR * 0.16, headR * 0.1, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + headR * 0.32, headCy + headR * 0.15, headR * 0.16, headR * 0.1, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // === Hair — swept back spiky with depth layers ===
  // Hair base — full coverage
  ctx.fillStyle = pal.hair;
  ctx.beginPath();
  ctx.moveTo(cx - headR * 0.9, headCy - headR + headR * 0.1);
  ctx.quadraticCurveTo(cx - headR * 0.5, headCy - headR - headR * 0.22, cx, headCy - headR - headR * 0.18);
  ctx.quadraticCurveTo(cx + headR * 0.5, headCy - headR - headR * 0.22, cx + headR * 0.9, headCy - headR + headR * 0.1);
  ctx.lineTo(cx + headR * 0.88, headCy - headR + headR * 0.24);
  ctx.quadraticCurveTo(cx, headCy - headR + headR * 0.16, cx - headR * 0.88, headCy - headR + headR * 0.24);
  ctx.closePath();
  ctx.fill();

  // Hair spikes with shadow depth
  const spikes = [
    { x: -0.6, y: -1.2, w: 0.17 },
    { x: -0.25, y: -1.55, w: 0.19 },
    { x: 0.1, y: -1.4, w: 0.17 },
    { x: 0.4, y: -1.15, w: 0.15 },
    { x: 0.6, y: -0.95, w: 0.13 },
  ] as const;
  for (const spike of spikes) {
    const spikeX = cx + spike.x * headR;
    const spikeY = headCy + spike.y * headR;
    const spikeW = spike.w * headR;
    // Main spike
    ctx.fillStyle = pal.hair;
    ctx.beginPath();
    ctx.moveTo(spikeX - spikeW, headCy - headR + headR * 0.08);
    ctx.lineTo(spikeX, spikeY);
    ctx.lineTo(spikeX + spikeW, headCy - headR + headR * 0.08);
    ctx.closePath();
    ctx.fill();
    // Darker edge on spike
    ctx.fillStyle = shiftColor(pal.hair, -20);
    ctx.beginPath();
    ctx.moveTo(spikeX, spikeY);
    ctx.lineTo(spikeX + spikeW * 0.35, spikeY + headR * 0.07);
    ctx.lineTo(spikeX + spikeW, headCy - headR + headR * 0.08);
    ctx.closePath();
    ctx.fill();
  }
  // Hair shadow band — darker zone at hairline
  ctx.fillStyle = shiftColor(pal.hair, -25);
  ctx.fillRect(cx - headR * 0.85, headCy - headR + headR * 0.17, headR * 1.7, headR * 0.06);
  // Hair highlight streak
  ctx.fillStyle = shiftColor(pal.hair, 22);
  ctx.fillRect(cx - headR * 0.12, headCy - headR + headR * 0.08, headR * 0.08, headR * 0.12);

  // === Red headband — with knot and flowing tails ===
  ctx.fillStyle = pal.headband;
  ctx.fillRect(cx - headR * 0.95, headCy - headR + headR * 0.06, headR * 1.9, headR * 0.2);
  // Headband highlight stripe
  ctx.fillStyle = shiftColor(pal.headband, 28);
  ctx.fillRect(cx - headR * 0.88, headCy - headR + headR * 0.06, headR * 1.76, headR * 0.05);
  // Headband shadow edge
  ctx.fillStyle = shiftColor(pal.headband, -25);
  ctx.fillRect(cx - headR * 0.92, headCy - headR + headR * 0.2, headR * 1.84, headR * 0.04);
  // Headband knot
  const selKnotX = cx - headR * 0.72;
  const selKnotY = headCy - headR + headR * 0.15;
  ctx.fillStyle = shiftColor(pal.headband, -12);
  ctx.fillRect(selKnotX - headR * 0.06, selKnotY - headR * 0.06, headR * 0.12, headR * 0.12);
  // Headband tails — flowing ribbons
  ctx.fillStyle = shiftColor(pal.headband, -20);
  ctx.beginPath();
  ctx.moveTo(selKnotX - headR * 0.04, selKnotY + headR * 0.04);
  ctx.quadraticCurveTo(selKnotX - headR * 0.3, selKnotY + headR * 0.18, selKnotX - headR * 0.4, selKnotY + headR * 0.52);
  ctx.lineTo(selKnotX - headR * 0.32, selKnotY + headR * 0.55);
  ctx.quadraticCurveTo(selKnotX - headR * 0.22, selKnotY + headR * 0.14, selKnotX + headR * 0.02, selKnotY + headR * 0.04);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(selKnotX + headR * 0.02, selKnotY + headR * 0.04);
  ctx.quadraticCurveTo(selKnotX - headR * 0.18, selKnotY + headR * 0.25, selKnotX - headR * 0.22, selKnotY + headR * 0.65);
  ctx.lineTo(selKnotX - headR * 0.15, selKnotY + headR * 0.67);
  ctx.quadraticCurveTo(selKnotX - headR * 0.1, selKnotY + headR * 0.22, selKnotX + headR * 0.06, selKnotY + headR * 0.04);
  ctx.closePath();
  ctx.fill();

  // === Eyes — 3/4 view with upper eyelid and depth ===
  const eyeSpacing = headR * 0.28;
  const eyeY = headCy - headR * 0.02;
  const eyeR = headR * 0.13;
  for (const side of [-1, 1]) {
    // Closer eye slightly larger for 3/4 perspective
    const adjustedR = side === 1 ? eyeR * 1.08 : eyeR * 0.94;
    const ex = cx + side * eyeSpacing;
    // Eye socket shadow
    ctx.fillStyle = shiftColor(pal.skin, -16);
    ctx.beginPath();
    ctx.ellipse(ex, eyeY + 1, adjustedR * 1.2, adjustedR * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();
    // Sclera
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(ex, eyeY, adjustedR, adjustedR + 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    // Iris — deep blue
    ctx.fillStyle = '#4169E1';
    ctx.beginPath();
    ctx.arc(ex + 1, eyeY, adjustedR * 0.55, 0, Math.PI * 2);
    ctx.fill();
    // Iris ring
    ctx.strokeStyle = '#2a4a9a';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(ex + 1, eyeY, adjustedR * 0.55, 0, Math.PI * 2);
    ctx.stroke();
    // Pupil
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(ex + 1.2, eyeY, adjustedR * 0.28, 0, Math.PI * 2);
    ctx.fill();
    // Eye shine — upper-left catchlight
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.arc(ex + 0.3, eyeY - adjustedR * 0.25, adjustedR * 0.22, 0, Math.PI * 2);
    ctx.fill();
    // Lower eye shine
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.arc(ex + 1.5, eyeY + adjustedR * 0.2, adjustedR * 0.12, 0, Math.PI * 2);
    ctx.fill();
    // Upper eyelid line — thick for Ryo's characteristic narrow determined eyes
    ctx.strokeStyle = '#2a1a08';
    ctx.lineWidth = Math.max(1.5, headR * 0.06);
    ctx.beginPath();
    ctx.moveTo(ex - adjustedR * 1.3, eyeY - adjustedR * 0.35 - side * headR * 0.015);
    ctx.quadraticCurveTo(ex, eyeY - adjustedR * 1.15, ex + adjustedR * 1.3, eyeY - adjustedR * 0.35 + side * headR * 0.015);
    ctx.stroke();
  }

  // === Brows — heavy angled, Ryo's trademark glare ===
  ctx.strokeStyle = shiftColor(pal.hair, -35);
  ctx.lineWidth = Math.max(2.5, size * 0.018);
  ctx.lineCap = 'round';
  for (const side of [-1, 1]) {
    const browX = cx + side * eyeSpacing;
    ctx.beginPath();
    ctx.moveTo(browX - side * headR * 0.22, eyeY - headR * 0.18 - side * headR * 0.04);
    ctx.lineTo(browX + side * headR * 0.08, eyeY - headR * 0.24 + side * headR * 0.02);
    ctx.stroke();
  }

  // === Nose — bridge, tip, and nostril ===
  // Nose bridge shadow
  ctx.strokeStyle = shiftColor(pal.skin, -18);
  ctx.lineWidth = Math.max(0.8, size * 0.005);
  ctx.beginPath();
  ctx.moveTo(cx + headR * 0.02, headCy + headR * 0.0);
  ctx.lineTo(cx + headR * 0.06, headCy + headR * 0.2);
  ctx.stroke();
  // Nose tip highlight
  ctx.fillStyle = shiftColor(pal.skin, 10);
  ctx.beginPath();
  ctx.arc(cx + headR * 0.03, headCy + headR * 0.17, headR * 0.055, 0, Math.PI * 2);
  ctx.fill();
  // Nostril shadow
  ctx.fillStyle = shiftColor(pal.skin, -18);
  ctx.beginPath();
  ctx.ellipse(cx + headR * 0.1, headCy + headR * 0.22, headR * 0.04, headR * 0.028, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // === Mouth — lip outline with confident smirk ===
  const mouthY = headCy + headR * 0.42;
  // Upper lip line — cupid's bow shape
  ctx.strokeStyle = shiftColor(pal.skin, -30);
  ctx.lineWidth = Math.max(0.8, size * 0.006);
  ctx.beginPath();
  ctx.moveTo(cx - headR * 0.14, mouthY);
  ctx.quadraticCurveTo(cx - headR * 0.04, mouthY - headR * 0.04, cx, mouthY - headR * 0.02);
  ctx.quadraticCurveTo(cx + headR * 0.04, mouthY - headR * 0.04, cx + headR * 0.14, mouthY - headR * 0.02);
  ctx.stroke();
  // Lower lip shadow
  ctx.fillStyle = shiftColor(pal.skin, -8);
  ctx.beginPath();
  ctx.moveTo(cx - headR * 0.12, mouthY + headR * 0.01);
  ctx.quadraticCurveTo(cx, mouthY + headR * 0.06, cx + headR * 0.13, mouthY - headR * 0.01);
  ctx.quadraticCurveTo(cx, mouthY + headR * 0.03, cx - headR * 0.12, mouthY + headR * 0.01);
  ctx.closePath();
  ctx.fill();

  // === Jaw line — strong defined jaw ===
  ctx.strokeStyle = shiftColor(pal.skin, -28);
  ctx.lineWidth = Math.max(1, size * 0.007);
  ctx.beginPath();
  ctx.moveTo(cx - headR * 0.5, headCy + headR * 0.55);
  ctx.quadraticCurveTo(cx - headR * 0.3, headCy + headR * 0.85, cx, headCy + headR * 0.9);
  ctx.quadraticCurveTo(cx + headR * 0.3, headCy + headR * 0.85, cx + headR * 0.5, headCy + headR * 0.55);
  ctx.stroke();
  // Chin shadow
  ctx.fillStyle = shiftColor(pal.skin, -10);
  ctx.beginPath();
  ctx.ellipse(cx, headCy + headR * 0.78, headR * 0.18, headR * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();

  // Portrait frame
  ctx.strokeStyle = 'rgba(200, 168, 50, 0.6)';
  ctx.lineWidth = 2;
  roundRect(ctx, 0, 0, size, size, 6);
  ctx.stroke();
  // Inner gold border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  roundRect(ctx, 1, 1, size - 2, size - 2, 5);
  ctx.stroke();

  ctx.restore();
}

/** Draw a small shoe/boot shape at the bottom of a leg */
export function drawShoe(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, rot: number, color: string, facing: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const grad = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
  grad.addColorStop(0, shiftColor(color, 15));
  grad.addColorStop(1, shiftColor(color, -10));
  ctx.fillStyle = grad;
  roundRect(ctx, -w / 2 + facing * 2, -h / 2, w, h, 3);
  ctx.fill();
  ctx.strokeStyle = shiftColor(color, -30);
  ctx.lineWidth = 1;
  roundRect(ctx, -w / 2 + facing * 2, -h / 2, w, h, 3);
  ctx.stroke();
  ctx.restore();
}

/**
 * Draw attack trail behind a striking limb during the active phase.
 * Draws 2-3 fading lines in the direction opposite to the attack motion.
 * @param ctx - Canvas 2D context (already translated/rotated to limb position)
 * @param attackPhase - Current attack phase ('startup' | 'active' | 'recovery' | 'none')
 * @param isKick - true for kick (vertical trail), false for punch (horizontal trail)
 * @param color - Trail color (typically character's special color)
 * @param limbLength - Length of the striking limb for trail sizing
 * @param facing - Direction character faces (1 or -1)
 */
export function drawAttackTrail(
  ctx: CanvasRenderingContext2D,
  attackPhase: string,
  isKick: boolean,
  color: string,
  limbLength: number,
  facing: number,
): void {
  if (attackPhase !== 'active') return;

  const { r, g, b } = parseColorRGB(color);
  const trailCount = 3;
  const trailSpacing = limbLength * 0.12;
  const baseTrailLen = limbLength * 0.35;

  ctx.save();
  ctx.lineCap = 'round';

  for (let i = 1; i <= trailCount; i++) {
    const alpha = 0.35 - (i - 1) * 0.1;
    const lineWidth = 3 - (i - 1) * 0.7;
    const offset = i * trailSpacing;

    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    ctx.lineWidth = lineWidth;

    ctx.beginPath();
    if (isKick) {
      // Vertical trail for kicks — trails upward behind the extending leg
      const trailX = -facing * offset * 0.3;
      const startY = -limbLength * 0.3;
      const endY = startY - baseTrailLen * (1 + i * 0.2);
      ctx.moveTo(trailX, startY);
      ctx.lineTo(trailX + facing * offset * 0.5, endY);
    } else {
      // Horizontal trail for punches — trails backward behind the extending arm
      const trailY = -offset * 0.3;
      const startX = -limbLength * 0.3;
      const endX = startX - facing * baseTrailLen * (1 + i * 0.2);
      ctx.moveTo(startX, trailY);
      ctx.lineTo(endX, trailY + offset * 0.5);
    }
    ctx.stroke();
  }

  ctx.restore();
}

/** Parse a color string to RGB components (utility for drawAttackTrail) */
function parseColorRGB(color: string): { r: number; g: number; b: number } {
  if (color.startsWith('#')) {
    return {
      r: parseInt(color.slice(1, 3), 16),
      g: parseInt(color.slice(3, 5), 16),
      b: parseInt(color.slice(5, 7), 16),
    };
  }
  if (color.startsWith('rgba(') || color.startsWith('rgb(')) {
    const m = color.match(/(\d+)/g);
    return m ? { r: +m[0], g: +m[1], b: +m[2] } : { r: 255, g: 160, b: 0 };
  }
  return { r: 255, g: 160, b: 0 };
}
