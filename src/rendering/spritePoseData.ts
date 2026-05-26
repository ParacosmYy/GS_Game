/** 精灵姿态数据 — 角色视觉定义 + 姿态数组 + 姿态生成函数 */

/** 像素块常量 */
export const PW = 120;  // 帧宽度
export const PH = 200;  // 帧高度
export const PIXEL = 3; // 像素块大小

/** 角色视觉定义 */
export interface CharVisual {
  hairColor: string;
  skinColor: string;
  shirtColor: string;
  pantsColor: string;
  shoeColor: string;
  beltColor: string;
  headW: number;
  bodyW: number;
  legLen: number;
  hairStyle: 'spiky' | 'long' | 'short' | 'ponytail' | 'wild';
  idleStyle: 'confident' | 'lazy' | 'fighter' | 'martial' | 'tense' | 'alert' | 'rebel' | 'cute' | 'karate';
}

export const CHAR_VISUALS: Record<string, CharVisual> = {
  kyo: {
    hairColor: '#1a1a2e', skinColor: '#f5d0a9', shirtColor: '#ffffff',
    pantsColor: '#2a2a3a', shoeColor: '#8b4513', beltColor: '#4a3520',
    headW: 5, bodyW: 6, legLen: 6, hairStyle: 'spiky', idleStyle: 'confident',
  },
  iori: {
    hairColor: '#c41e3a', skinColor: '#f5d0a9', shirtColor: '#1a1a2e',
    pantsColor: '#1a1a2e', shoeColor: '#2a2a3a', beltColor: '#8b0000',
    headW: 5, bodyW: 6, legLen: 6, hairStyle: 'wild', idleStyle: 'lazy',
  },
  terry: {
    hairColor: '#c4a000', skinColor: '#f5d0a9', shirtColor: '#2a5a8a',
    pantsColor: '#3a3a4a', shoeColor: '#6a3a1a', beltColor: '#3a3a3a',
    headW: 5, bodyW: 7, legLen: 6, hairStyle: 'short', idleStyle: 'fighter',
  },
  kim: {
    hairColor: '#1a1a1a', skinColor: '#f5d0a9', shirtColor: '#ffffff',
    pantsColor: '#ffffff', shoeColor: '#1a1a1a', beltColor: '#000000',
    headW: 5, bodyW: 5, legLen: 7, hairStyle: 'short', idleStyle: 'martial',
  },
  ryo: {
    hairColor: '#5a3a22', skinColor: '#f5d0a9', shirtColor: '#f2efe8',
    pantsColor: '#ddd6c5', shoeColor: '#3a2a1a', beltColor: '#111111',
    headW: 5, bodyW: 7, legLen: 6, hairStyle: 'spiky', idleStyle: 'karate',
  },
  leona: {
    hairColor: '#1a3a8a', skinColor: '#fce4c8', shirtColor: '#3a3a5a',
    pantsColor: '#2a2a4a', shoeColor: '#1a1a2a', beltColor: '#4a4a6a',
    headW: 4, bodyW: 5, legLen: 6, hairStyle: 'ponytail', idleStyle: 'alert',
  },
  kdash: {
    hairColor: '#c0c0c0', skinColor: '#f5d0a9', shirtColor: '#1a1a2e',
    pantsColor: '#2a2a3a', shoeColor: '#4a4a4a', beltColor: '#c41e3a',
    headW: 5, bodyW: 6, legLen: 6, hairStyle: 'spiky', idleStyle: 'rebel',
  },
  kula: {
    hairColor: '#c4a060', skinColor: '#fce4c8', shirtColor: '#4a8aff',
    pantsColor: '#3a3a5a', shoeColor: '#4a4a6a', beltColor: '#6ab0ff',
    headW: 4, bodyW: 5, legLen: 5, hairStyle: 'long', idleStyle: 'cute',
  },
};

export function getDefaultVisual(): CharVisual {
  return CHAR_VISUALS.kyo;
}

/** 深色变体 — 用于角色描边和阴影 */
export function darken(hex: string, amount: number = 0.35): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const dr = Math.max(0, Math.floor(r * (1 - amount)));
  const dg = Math.max(0, Math.floor(g * (1 - amount)));
  const db = Math.max(0, Math.floor(b * (1 - amount)));
  return `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`;
}

/** 亮色变体 — 用于上方光照高光 */
export function lighten(hex: string, amount: number = 0.3): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lr = Math.min(255, Math.floor(r + (255 - r) * amount));
  const lg = Math.min(255, Math.floor(g + (255 - g) * amount));
  const lb = Math.min(255, Math.floor(b + (255 - b) * amount));
  return `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`;
}

/** 像素块绘制 */
export function px(c: CanvasRenderingContext2D, bx: number, by: number, color: string): void {
  c.fillStyle = color;
  c.fillRect(bx * PIXEL, by * PIXEL, PIXEL, PIXEL);
}

/** 描边像素块 */
export function pxOutline(c: CanvasRenderingContext2D, bx: number, by: number, outlineColor: string): void {
  const oc = outlineColor;
  px(c, bx - 1, by, oc); px(c, bx + 1, by, oc);
  px(c, bx, by - 1, oc); px(c, bx, by + 1, oc);
}

/** 姿态定义 */
export interface Pose {
  headOff: number; bodyLean: number; armL: number; armR: number; legL: number; legR: number; crouch: boolean;
}

export const IDLE_POSES: Pose[] = [
  // MUGEN参考: 15帧×9ticks呼吸循环
  // inhale (0-4): arms tighten, slight body lift
  { headOff: 0,    bodyLean: 0, armL: 0.30, armR: -0.30, legL: -1, legR: 1, crouch: false },
  { headOff: -0.1, bodyLean: 0, armL: 0.31, armR: -0.29, legL: -1, legR: 1, crouch: false },
  { headOff: -0.2, bodyLean: 0, armL: 0.33, armR: -0.27, legL: -1, legR: 1, crouch: false },
  { headOff: -0.2, bodyLean: 0, armL: 0.35, armR: -0.25, legL: -1, legR: 1, crouch: false },
  { headOff: -0.1, bodyLean: 0, armL: 0.36, armR: -0.24, legL: -1, legR: 1, crouch: false },
  // hold at peak (5-7)
  { headOff: -0.1, bodyLean: 0, armL: 0.35, armR: -0.25, legL: -1, legR: 1, crouch: false },
  { headOff: 0,    bodyLean: 0, armL: 0.33, armR: -0.27, legL: -1, legR: 1, crouch: false },
  { headOff: 0,    bodyLean: 0, armL: 0.30, armR: -0.30, legL: -1, legR: 1, crouch: false },
  // exhale (8-14): relax, slight settle
  { headOff: 0,    bodyLean: 0, armL: 0.28, armR: -0.32, legL: -1, legR: 1, crouch: false },
  { headOff: 0.1,  bodyLean: 0, armL: 0.26, armR: -0.34, legL: -1, legR: 1, crouch: false },
  { headOff: 0.1,  bodyLean: 0, armL: 0.25, armR: -0.35, legL: -1, legR: 1, crouch: false },
  { headOff: 0,    bodyLean: 0, armL: 0.27, armR: -0.33, legL: -1, legR: 1, crouch: false },
  { headOff: 0,    bodyLean: 0, armL: 0.28, armR: -0.32, legL: -1, legR: 1, crouch: false },
  { headOff: 0,    bodyLean: 0, armL: 0.29, armR: -0.31, legL: -1, legR: 1, crouch: false },
  { headOff: 0,    bodyLean: 0, armL: 0.30, armR: -0.30, legL: -1, legR: 1, crouch: false },
];

/** 根据角色idleStyle生成差异化待机姿态偏移 */
export function getIdlePoses(style: string): Pose[] {
  const base = IDLE_POSES;
  switch (style) {
    case 'confident': // Kyo
      return base.map((p, i) => ({
        ...p,
        bodyLean: 0.9,
        headOff: Math.sin(i * 0.6) * 0.25,
        armL: 0.34 + Math.sin(i * 0.7) * 0.04,
        armR: -0.72 + Math.sin(i * 0.8) * 0.08,
      }));
    case 'lazy': // Iori
      return base.map((p, i) => ({ ...p, armL: 0.15 + Math.sin(i * 0.5) * 0.03, armR: -0.15 + Math.sin(i * 0.5) * 0.03 }));
    case 'fighter': // Terry
      return base.map((p, i) => ({ ...p, bodyLean: 1, armL: 0.5, armR: -0.7 + Math.sin(i * 0.7) * 0.05 }));
    case 'martial': // Kim
      return base.map((p, i) => ({ ...p, armL: -0.2, armR: -0.3 + Math.sin(i * 0.6) * 0.05, legL: -2, legR: 2 }));
    case 'tense': // Ryo
      return base.map((p, i) => ({ ...p, bodyLean: 0.3, armL: 0.4, armR: -0.5 + Math.sin(i * 0.9) * 0.05 }));
    case 'alert': // Leona
      return base.map((p, i) => ({ ...p, armL: 0.2, armR: -0.4 + Math.sin(i * 0.4) * 0.02 }));
    case 'rebel': // K'
      return base.map((p, i) => ({ ...p, bodyLean: -0.5, armL: 0.1, armR: 0.1 }));
    case 'cute': // Kula
      return base.map((p, i) => ({ ...p, headOff: Math.sin(i * 0.8) * 0.5, armL: 0.4 + Math.sin(i) * 0.1, armR: -0.4 + Math.sin(i + 1) * 0.1 }));
    case 'karate': // Ryo
      return base.map((p, i) => ({
        ...p,
        bodyLean: 1.2,
        armL: 0.45 + Math.sin(i * 0.7) * 0.05,
        armR: -0.7 + Math.sin(i * 0.7) * 0.08,
        legL: -2,
        legR: 2,
      }));
    default:
      return base;
  }
}

export const WALK_POSES: Pose[] = [
  { headOff: 0, bodyLean: 1, armL: 0.5, armR: -0.1, legL: -2, legR: 2, crouch: false },
  { headOff: 0, bodyLean: 0.5, armL: 0.4, armR: -0.2, legL: -1, legR: 1, crouch: false },
  { headOff: 0, bodyLean: 0, armL: 0.3, armR: -0.3, legL: 0, legR: 0, crouch: false },
  { headOff: 0, bodyLean: -0.5, armL: 0.2, armR: -0.4, legL: 1, legR: -1, crouch: false },
  { headOff: 0, bodyLean: -1, armL: 0.1, armR: -0.5, legL: 2, legR: -2, crouch: false },
  { headOff: 0, bodyLean: -0.5, armL: 0.2, armR: -0.4, legL: 1, legR: -1, crouch: false },
];

/** 通用跑步基础帧 */
export const RUN_BASE: Pose[] = [
  { headOff: 1, bodyLean: 3, armL: 0.8, armR: -0.6, legL: -3, legR: 3, crouch: false },
  { headOff: 1, bodyLean: 2, armL: 0.6, armR: -0.3, legL: -1, legR: 1, crouch: false },
  { headOff: 1, bodyLean: 3, armL: 0.3, armR: -0.8, legL: 2, legR: -2, crouch: false },
  { headOff: 1, bodyLean: 2, armL: 0.4, armR: -0.5, legL: 1, legR: -1, crouch: false },
  { headOff: 1, bodyLean: 3, armL: 0.7, armR: -0.7, legL: -2, legR: 3, crouch: false },
  { headOff: 1, bodyLean: 2, armL: 0.5, armR: -0.4, legL: -1, legR: 1, crouch: false },
];

/** 根据idleStyle生成差异化跑步姿态 */
export function getRunPoses(style: string): Pose[] {
  switch (style) {
    case 'confident':
      return RUN_BASE.map((p, i) => ({
        ...p, bodyLean: 4.4, armL: 0.5, armR: -1.05 + Math.sin(i * 1.2) * 0.15,
        legL: p.legL - 1, legR: p.legR + 2,
      }));
    case 'lazy':
      return RUN_BASE.map((p, i) => ({
        ...p, bodyLean: 2, headOff: 0, armL: 0.2 + Math.sin(i * 0.8) * 0.1,
        armR: -0.2 + Math.sin(i * 0.8 + 1) * 0.1,
      }));
    case 'fighter':
      return RUN_BASE.map((p, i) => ({
        ...p, bodyLean: 3.5, armL: 0.6, armR: -0.9 + Math.sin(i * 1.0) * 0.1,
        legL: p.legL * 1.2, legR: p.legR * 1.2,
      }));
    case 'martial':
      return RUN_BASE.map((p, i) => ({
        ...p, bodyLean: 2.5, armL: -0.3, armR: -0.5 + Math.sin(i * 1.1) * 0.1,
        legL: p.legL - 2, legR: p.legR + 2,
      }));
    case 'tense':
      return RUN_BASE.map((p, i) => ({
        ...p, bodyLean: 4.5, armL: 0.5, armR: -0.7,
        legL: p.legL * 1.1, legR: p.legR * 1.1,
      }));
    case 'alert':
      return RUN_BASE.map((p, i) => ({
        ...p, bodyLean: 3, headOff: 0, armL: 0.7, armR: -0.7,
        legL: Math.round(p.legL * 0.9), legR: Math.round(p.legR * 0.9),
      }));
    case 'rebel':
      return RUN_BASE.map((p, i) => ({
        ...p, bodyLean: 1.5, headOff: 0, armL: 0.1, armR: 0.1,
        legL: Math.round(p.legL * 0.8), legR: Math.round(p.legR * 0.8),
      }));
    case 'cute':
      return RUN_BASE.map((p, i) => ({
        ...p, bodyLean: 2, headOff: Math.sin(i * 1.2) * 0.8,
        armL: 0.6 + Math.sin(i * 1.3) * 0.15, armR: -0.6 + Math.sin(i * 1.3 + 1) * 0.15,
      }));
    case 'karate':
      return RUN_BASE.map((p, i) => ({
        ...p,
        bodyLean: 3.6,
        armL: 0.25 + Math.sin(i * 1.1) * 0.05,
        armR: -0.55 + Math.sin(i * 1.1 + 0.8) * 0.08,
        legL: p.legL - 1,
        legR: p.legR + 1,
      }));
    default:
      return RUN_BASE;
  }
}

export const ATTACK_POSES: Pose[] = [
  { headOff: 0, bodyLean: -1, armL: 0.3, armR: 0.5, legL: -1, legR: 1, crouch: false },
  { headOff: 1, bodyLean: 3, armL: 0.4, armR: -1.8, legL: -1, legR: 2, crouch: false },
  { headOff: 0, bodyLean: 1, armL: 0.3, armR: -0.8, legL: -1, legR: 1, crouch: false },
  { headOff: 0, bodyLean: 0, armL: 0.3, armR: -0.3, legL: -1, legR: 1, crouch: false },
];

export const CROUCH_ATTACK_POSES: Pose[] = [
  { headOff: 0, bodyLean: -1, armL: 0.3, armR: 0.3, legL: -3, legR: 3, crouch: true },
  { headOff: 1, bodyLean: 2, armL: 0.4, armR: -1.5, legL: -3, legR: 3, crouch: true },
  { headOff: 0, bodyLean: 1, armL: 0.3, armR: -0.6, legL: -3, legR: 3, crouch: true },
  { headOff: 0, bodyLean: 0, armL: 0.3, armR: -0.3, legL: -2, legR: 2, crouch: true },
];

export const AIR_ATTACK_POSES: Pose[] = [
  { headOff: 0, bodyLean: 1, armL: -0.3, armR: 0.3, legL: 1, legR: -1, crouch: false },
  { headOff: 1, bodyLean: 2, armL: 0.2, armR: -1.2, legL: 0, legR: 2, crouch: false },
  { headOff: 0, bodyLean: 1, armL: 0.1, armR: -0.5, legL: -1, legR: 1, crouch: false },
  { headOff: 0, bodyLean: 0, armL: 0, armR: 0, legL: 0, legR: 0, crouch: false },
];

export const THROW_POSES: Pose[] = [
  { headOff: 0, bodyLean: 1, armL: -0.8, armR: -0.8, legL: -1, legR: 1, crouch: false },
  { headOff: 1, bodyLean: 3, armL: -1.5, armR: -1.5, legL: -1, legR: 2, crouch: false },
  { headOff: 0, bodyLean: -2, armL: 0.6, armR: 0.6, legL: 0, legR: 0, crouch: false },
  { headOff: 0, bodyLean: 0, armL: 0.3, armR: -0.3, legL: -1, legR: 1, crouch: false },
];

export const CROUCH_POSES: Pose[] = [
  { headOff: 0, bodyLean: 0, armL: 0.4, armR: -0.4, legL: -2, legR: 2, crouch: true },
  { headOff: 0, bodyLean: 0, armL: 0.45, armR: -0.35, legL: -2, legR: 2, crouch: true },
  { headOff: 0, bodyLean: 0, armL: 0.4, armR: -0.4, legL: -2, legR: 2, crouch: true },
  { headOff: 0, bodyLean: 0, armL: 0.35, armR: -0.45, legL: -2, legR: 2, crouch: true },
];

export const JUMP_POSES: Pose[] = [
  { headOff: 0, bodyLean: 0, armL: -0.3, armR: 0.3, legL: 1, legR: -1, crouch: false },
  { headOff: 0, bodyLean: 0, armL: -0.5, armR: 0.5, legL: 0, legR: 0, crouch: false },
  { headOff: 0, bodyLean: 0, armL: -0.8, armR: 0.8, legL: -1, legR: 1, crouch: false },
  { headOff: 0, bodyLean: 0, armL: -0.7, armR: 0.7, legL: 0, legR: 0, crouch: false },
  { headOff: 0, bodyLean: 0, armL: -0.4, armR: 0.4, legL: 1, legR: -1, crouch: false },
  { headOff: 0, bodyLean: 0, armL: -0.2, armR: 0.2, legL: 1, legR: -1, crouch: false },
];

/** 根据idleStyle生成差异化跳跃姿态 */
export function getJumpPoses(style: string): Pose[] {
  switch (style) {
    case 'confident':
      return JUMP_POSES.map((p, i) => ({
        ...p,
        bodyLean: i < 3 ? 1.2 : 0.1,
        armL: -0.15,
        armR: i < 3 ? -0.55 : 0.2,
        legR: i === 2 ? 3 : p.legR,
      }));
    case 'lazy':
      return JUMP_POSES.map((p, i) => ({
        ...p, armL: -0.6 + Math.sin(i) * 0.2, armR: 0.6 + Math.sin(i) * 0.2,
        legL: p.legL * 0.5, legR: p.legR * 0.5,
      }));
    case 'fighter':
      return JUMP_POSES.map((p, i) => ({
        ...p, armL: -0.4, armR: -0.6, legL: -2, legR: 2,
        bodyLean: i < 3 ? 1.5 : -0.5,
      }));
    case 'martial':
      return JUMP_POSES.map((p, i) => ({
        ...p, armL: -0.3, armR: -0.4,
        legL: i === 2 ? -3 : p.legL, legR: i === 2 ? 4 : p.legR,
      }));
    case 'tense':
      return JUMP_POSES.map((p, i) => ({
        ...p, armL: -0.8, armR: -1.0, legL: p.legL, legR: p.legR,
        bodyLean: i < 3 ? 1 : 0,
      }));
    case 'alert':
      return JUMP_POSES.map((p, i) => ({
        ...p, armL: -0.4, armR: -0.3, legL: -2, legR: 2,
        headOff: Math.sin(i * 1.2) * 0.3,
      }));
    case 'rebel':
      return JUMP_POSES.map((p, i) => ({
        ...p, armL: 0.1, armR: 0.1, legL: p.legL * 0.6, legR: p.legR * 0.6,
      }));
    case 'cute':
      return JUMP_POSES.map((p, i) => ({
        ...p, armL: -0.8 + Math.sin(i * 1.5) * 0.3, armR: 0.8 + Math.sin(i * 1.5 + 1) * 0.3,
        legL: p.legL * 1.3, legR: p.legR * 1.3,
      }));
    case 'karate':
      return JUMP_POSES.map((p, i) => ({
        ...p,
        armL: -0.25,
        armR: i < 3 ? -0.55 : -0.25,
        bodyLean: i < 3 ? 1.1 : 0.2,
        legL: i === 2 ? -3 : p.legL,
        legR: i === 2 ? 3 : p.legR,
      }));
    default:
      return JUMP_POSES;
  }
}

export const HIT_POSES: Pose[] = [
  { headOff: -1, bodyLean: -2, armL: 0.8, armR: 0.6, legL: 0, legR: 0, crouch: false },
  { headOff: -1, bodyLean: -3, armL: 1, armR: 0.8, legL: -1, legR: 1, crouch: false },
  { headOff: -2, bodyLean: -2, armL: 0.6, armR: 0.4, legL: 0, legR: 0, crouch: false },
  { headOff: -1, bodyLean: -1, armL: 0.4, armR: 0.3, legL: 0, legR: 0, crouch: false },
];

export const BLOCK_POSES: Pose[] = [
  { headOff: -1, bodyLean: -1, armL: -0.8, armR: -0.8, legL: -1, legR: 1, crouch: false },
  { headOff: -1, bodyLean: -1, armL: -0.7, armR: -0.9, legL: -1, legR: 1, crouch: false },
  { headOff: -1, bodyLean: -1, armL: -0.8, armR: -0.8, legL: -1, legR: 1, crouch: false },
  { headOff: -1, bodyLean: -1, armL: -0.9, armR: -0.7, legL: -1, legR: 1, crouch: false },
];

/** 根据idleStyle生成差异化受击姿态 */
export function getHitPoses(style: string): Pose[] {
  switch (style) {
    case 'confident':
      return HIT_POSES.map(p => ({ ...p, bodyLean: p.bodyLean * 0.85, legL: -1, legR: 1, armL: p.armL * 0.8 }));
    case 'lazy':
      return HIT_POSES.map(p => ({ ...p, bodyLean: p.bodyLean * 0.6, armL: p.armL * 0.5, armR: p.armR * 0.5 }));
    case 'fighter':
      return HIT_POSES.map(p => ({ ...p, bodyLean: p.bodyLean * 1.2, headOff: p.headOff * 1.2 }));
    case 'martial':
      return HIT_POSES.map(p => ({ ...p, legL: -2, legR: 2, armL: p.armL * 0.7 }));
    case 'tense':
      return HIT_POSES.map(p => ({ ...p, bodyLean: p.bodyLean * 0.5, armR: -0.3 }));
    case 'alert':
      return HIT_POSES.map(p => ({ ...p, bodyLean: p.bodyLean * 1.1, legL: -2, legR: 2 }));
    case 'rebel':
      return HIT_POSES.map(p => ({ ...p, bodyLean: p.bodyLean * 0.7, headOff: 0 }));
    case 'cute':
      return HIT_POSES.map(p => ({ ...p, bodyLean: p.bodyLean * 1.3, headOff: p.headOff * 1.3 }));
    case 'karate':
      return HIT_POSES.map(p => ({ ...p, bodyLean: p.bodyLean * 1.15, armL: p.armL * 0.8, armR: p.armR * 0.9, legL: -2, legR: 2 }));
    default:
      return HIT_POSES;
  }
}

/** 根据idleStyle生成差异化防御姿态 */
export function getBlockPoses(style: string): Pose[] {
  switch (style) {
    case 'confident':
      return BLOCK_POSES.map(p => ({ ...p, armL: -0.7, armR: -1.05, bodyLean: 0.1 }));
    case 'lazy':
      return BLOCK_POSES.map(p => ({ ...p, armL: 0.1, armR: -1.2, bodyLean: -0.5 }));
    case 'fighter':
      return BLOCK_POSES.map(p => ({ ...p, armL: -1.0, armR: -1.0 }));
    case 'martial':
      return BLOCK_POSES.map(p => ({ ...p, armL: -0.6, armR: -0.6, legL: -2, legR: 2 }));
    case 'tense':
      return BLOCK_POSES.map(p => ({ ...p, armL: -0.9, armR: -0.9, bodyLean: -0.5 }));
    case 'alert':
      return BLOCK_POSES.map(p => ({ ...p, armL: -0.7, armR: -0.7, bodyLean: -1.5 }));
    case 'rebel':
      return BLOCK_POSES.map(p => ({ ...p, armL: -0.5, armR: -0.5, bodyLean: 0 }));
    case 'cute':
      return BLOCK_POSES.map(p => ({ ...p, armL: -1.2, armR: -1.2, headOff: -2 }));
    case 'karate':
      return BLOCK_POSES.map(p => ({ ...p, armL: -0.95, armR: -0.95, bodyLean: -0.2, legL: -2, legR: 2 }));
    default:
      return BLOCK_POSES;
  }
}
