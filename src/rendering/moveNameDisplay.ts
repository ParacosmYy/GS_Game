/**
 * Move Name Display — KOF2002-style move name flash on screen
 *
 * When a special move or DM is performed, the move name briefly appears
 * on screen with a burst-in animation and character-colored glow.
 * This is a signature KOF feature that gives each move personality.
 *
 * Tiers: special (small, quick), dm (large, dramatic),
 *        sdm (larger, golden), hsdm (full-screen flash + huge text)
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../core/constants.js';
import { AttackType } from '../core/types.js';
import { type FeedbackTier } from '../core/feedbackManifest.js';
import { RYO_MOVE_LIST } from '../content/characters/ryo/commands/ryoCommands.js';
import { KYO_MOVE_LIST } from '../content/characters/kyo/commands/kyoCommands.js';
import { IORI_MOVE_LIST } from '../content/characters/iori/commands/ioriCommands.js';

// ─── Move name registry ─────────────────────────────────────────

interface MoveNameEntry {
  displayName: string;
  tier: FeedbackTier;
}

/** Build AttackType → MoveNameEntry map from a move list, preferring Chinese names */
function buildMap(
  list: ReadonlyArray<{ name: string; type: string; attackTypeKey?: string }>,
): Partial<Record<string, MoveNameEntry>> {
  const map: Record<string, MoveNameEntry> = {};
  for (const entry of list) {
    if (!entry.attackTypeKey) continue;
    const tier = entry.type as FeedbackTier;
    if (tier !== 'special' && tier !== 'dm' && tier !== 'sdm' && tier !== 'hsdm') continue;
    const cnName = CN_MOVE_NAMES[entry.attackTypeKey];
    map[entry.attackTypeKey] = { displayName: cnName ?? entry.name, tier };
  }
  return map;
}

/** Chinese move name registry — KOF2002 authentic naming */
export const CN_MOVE_NAMES: Record<string, string> = {
  // Ryo
  RYO_KOOU: '虎煌拳', RYO_KOOU_C: '虎煌拳', RYO_KO_HOU: '虎咆', RYO_KO_HOU_C: '虎咆',
  RYO_HIEN: '飛燕疾風脚', RYO_HAOU: '霸王翔吼拳', RYO_KOOUKEN_D: '虎煌拳',
  RYO_HIO_HACKER: '氷果斬', RYO_ZANRETSU_KEN: '斩裂拳',
  DM_TEN_HA_OU: '天地霸煌拳', SDM_TEN_HA_OU: '天地霸煌拳',
  DM_RYUKO_RANBU: '龍虎乱舞', SDM_RYUKO_RANBU: '龍虎乱舞', HSDM_RYUKO_RANBU: '龍虎乱舞',
  RYO_TSURIZAO: '釣瓶打', RYO_ORISHI: '卸し',
  // Kyo
  KYO_YAMIBARAI: '闇払い', KYO_YAMIBARAI_C: '闇払い', KYO_ONIYAKI: '鬼焼き', KYO_ONIYAKI_C: '鬼焼き',
  KYO_75KAI: '七拾五式・改', KYO_75KAI_2: '七拾五式・改', KYO_RED_KICK: 'R.E.D.KICK',
  KYO_ARAGAMI: '荒咬み', KYO_ARAGAMI_KONOKIZU: '九傷', KYO_ARAGAMI_YANOSABI: '八錆',
  KYO_NANASE: '七瀬', KYO_KOTO_TSUKI: '琴月陽', KYO_YAKISOGI: '破砕',
  KYO_DOKUGAMI: '毒咬み', KYO_TSUMIYOMI: '罪詠み', KYO_BATSUYOMI: '罰詠み',
  CMD_GOFU_YOU: '轟斧陽', CMD_88SHIKI: '八拾八式', CMD_NARAKU: '奈落落とし',
  DM_OROCHINAGI: '大蛇薙', SDM_OROCHINAGI: '大蛇薙', HSDM_OROCHINAGI: '大蛇薙',
  // Iori
  IORI_YAMIBARAI: '闇払い', IORI_YAMIBARAI_C: '闇払い', IORI_ONIYAKI: '鬼焼き', IORI_ONIYAKI_C: '鬼焼き',
  IORI_KOTOTSUKI: '琴月陰', IORI_KOTOTSUKI_D: '琴月陰', IORI_KUZUKAZE: '屑風',
  IORI_AOIHANA: '葵花', IORI_AOIHANA_2: '葵花', IORI_AOIHANA_3: '葵花',
  IORI_AOIHANA_C: '葵花', IORI_AOIHANA_C_2: '葵花', IORI_AOIHANA_C_3: '葵花',
  IORI_YUMEYUMI: '弓月', IORI_KATANUGI: '鉈薙', IORI_YUKIWARUI: '雪割',
  DM_YATAGARASU: '八咫烏', SDM_YATAGARASU: '八咫烏', HSDM_YAOTOME: '八咫烏',
};

const MOVE_NAMES: Record<string, Partial<Record<string, MoveNameEntry>>> = {
  ryo: buildMap(RYO_MOVE_LIST),
  kyo: buildMap(KYO_MOVE_LIST),
  iori: buildMap(IORI_MOVE_LIST),
};

// ─── Character color for move name display ──────────────────────

export const CHAR_COLORS: Record<string, string> = {
  ryo: '#ff6644',
  kyo: '#ff4400',
  iori: '#aa44ff',
};

// ─── Display state ──────────────────────────────────────────────

interface MoveNameState {
  active: boolean;
  text: string;
  tier: FeedbackTier;
  charColor: string;
  timer: number;
  duration: number;
  x: number;
}

const state: MoveNameState = {
  active: false,
  text: '',
  tier: 'special',
  charColor: '#ffffff',
  timer: 0,
  duration: 60,
  x: CANVAS_WIDTH / 2,
};

// ─── Public API ─────────────────────────────────────────────────

export function triggerMoveName(
  charId: string,
  attackType: AttackType,
  charX: number,
): void {
  const charMap = MOVE_NAMES[charId];
  if (!charMap) return;
  const entry = charMap[attackType as string];
  if (!entry) return;

  state.active = true;
  state.text = entry.displayName;
  state.tier = entry.tier;
  state.charColor = CHAR_COLORS[charId] ?? '#ffffff';
  state.timer = 0;

  switch (entry.tier) {
    case 'hsdm':
      state.duration = 90;
      break;
    case 'sdm':
      state.duration = 80;
      break;
    case 'dm':
      state.duration = 70;
      break;
    default:
      state.duration = 55;
  }

  state.x = Math.max(120, Math.min(CANVAS_WIDTH - 120, charX));
}

export function tickMoveNameDisplay(): void {
  if (!state.active) return;
  state.timer++;
  if (state.timer >= state.duration) {
    state.active = false;
  }
}

// ─── Rendering ──────────────────────────────────────────────────

function drawSNKText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number, y: number,
  size: number,
  color: string,
): void {
  ctx.font = `bold ${size}px "Courier New", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = Math.max(2, size * 0.08);
  ctx.lineJoin = 'round';
  ctx.strokeText(text, x, y);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

export function drawMoveNameDisplay(ctx: CanvasRenderingContext2D): void {
  if (!state.active) return;

  const progress = state.timer / state.duration;
  ctx.save();

  // Alpha curve: burst in 0-10%, hold 10-60%, fade out 60-100%
  let alpha: number;
  if (progress < 0.1) {
    alpha = progress / 0.1;
  } else if (progress < 0.6) {
    alpha = 1.0;
  } else {
    alpha = (1 - progress) / 0.4;
  }
  ctx.globalAlpha = alpha;

  const y = 88;

  switch (state.tier) {
    case 'hsdm': {
      // Full-screen golden flash on first 8 frames
      if (state.timer < 8) {
        const flashAlpha = (1 - state.timer / 8) * 0.35;
        ctx.fillStyle = `rgba(255, 220, 80, ${flashAlpha})`;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }
      // Shockwave ring
      if (state.timer < 20) {
        const ringP = state.timer / 20;
        const ringR = 20 + ringP * 250;
        const ringA = (1 - ringP) * 0.6;
        ctx.strokeStyle = `rgba(255, 200, 60, ${ringA})`;
        ctx.lineWidth = 3 * (1 - ringP) + 1;
        ctx.beginPath();
        ctx.arc(state.x, y, ringR, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Text — massive, golden glow
      const burstScale = state.timer < 6 ? 1 + (1 - state.timer / 6) * 1.5 : 1;
      const fontSize = Math.round(32 * burstScale);
      ctx.shadowColor = '#ffcc00';
      ctx.shadowBlur = 30;
      drawSNKText(ctx, state.text, state.x, y, fontSize, '#ffcc00');
      ctx.shadowBlur = 15;
      drawSNKText(ctx, state.text, state.x, y, fontSize, '#ffffff');
      ctx.shadowBlur = 0;
      // "HSDM" tag
      if (state.timer > 5) {
        const tagAlpha = Math.min(1, (state.timer - 5) / 10) * alpha;
        ctx.globalAlpha = tagAlpha;
        drawSNKText(ctx, 'HSDM', state.x, y + 24, 10, '#ff6688');
      }
      break;
    }
    case 'sdm': {
      // Brief white flash
      if (state.timer < 5) {
        const flashAlpha = (1 - state.timer / 5) * 0.2;
        ctx.fillStyle = `rgba(255, 255, 200, ${flashAlpha})`;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }
      // Ring
      if (state.timer < 15) {
        const ringP = state.timer / 15;
        const ringR = 15 + ringP * 180;
        const ringA = (1 - ringP) * 0.4;
        ctx.strokeStyle = `rgba(255, 180, 40, ${ringA})`;
        ctx.lineWidth = 2 * (1 - ringP) + 1;
        ctx.beginPath();
        ctx.arc(state.x, y, ringR, 0, Math.PI * 2);
        ctx.stroke();
      }
      const burstScale = state.timer < 5 ? 1 + (1 - state.timer / 5) * 0.8 : 1;
      const fontSize = Math.round(26 * burstScale);
      ctx.shadowColor = '#ffaa00';
      ctx.shadowBlur = 20;
      drawSNKText(ctx, state.text, state.x, y, fontSize, '#ffcc44');
      ctx.shadowBlur = 0;
      break;
    }
    case 'dm': {
      const burstScale = state.timer < 4 ? 1 + (1 - state.timer / 4) * 0.6 : 1;
      const fontSize = Math.round(22 * burstScale);
      ctx.shadowColor = state.charColor;
      ctx.shadowBlur = 18;
      drawSNKText(ctx, state.text, state.x, y, fontSize, state.charColor);
      ctx.shadowBlur = 0;
      break;
    }
    default: {
      // Special moves: compact, quick flash
      const burstScale = state.timer < 3 ? 1 + (1 - state.timer / 3) * 0.4 : 1;
      const fontSize = Math.round(16 * burstScale);
      ctx.shadowColor = state.charColor;
      ctx.shadowBlur = 10;
      drawSNKText(ctx, state.text, state.x, y, fontSize, state.charColor);
      ctx.shadowBlur = 0;
    }
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

// ─── Reset (for round transitions) ──────────────────────────────

export function resetMoveNameDisplay(): void {
  state.active = false;
  state.timer = 0;
}
