/**
 * Fighter rendering utilities — extracted from rendererFighter.ts
 * Color resolution, attack accents, afterimage trail, debug overlay check
 */
import { Fighter } from '../entities/fighter.js';
import { FighterState } from '../core/types.js';
import { shiftColor } from './utils.js';
import { getCharacterColors } from './manifestRenderData.js';
import { drawSkeletalFighter } from './skeletalFighter.js';
import { drawHighResAfterimage } from './sprites/ryo/ryoHighResRender.js';
import { drawKyoHighResAfterimage } from './sprites/kyo/kyoHighResRender.js';
import { drawIoriHighResAfterimage } from './sprites/iori/ioriHighResRender.js';

// ===== Per-character MAX aura color =====
interface MaxAuraColor {
  fill: string;
  stroke: string;
  css: string;
}

const MAX_AURA_COLORS: Record<string, MaxAuraColor> = {
  ryo:  { fill: 'rgba(68, 140, 255,',  stroke: 'rgba(68, 140, 255,', css: '#4488ff' },
  kyo:  { fill: 'rgba(255, 140, 30,',   stroke: 'rgba(255, 120, 20,', css: '#ff8c1e' },
  iori: { fill: 'rgba(170, 0, 255,',    stroke: 'rgba(150, 0, 255,',  css: '#aa00ff' },
};

export function getMaxAuraColor(charId: string): MaxAuraColor {
  return MAX_AURA_COLORS[charId] || { fill: 'rgba(68, 255, 136,', stroke: 'rgba(68, 255, 136,', css: '#44ff88' };
}

/** Character-specific attack color accent — each fighter gets a unique highlight during attacks */
export function getAttackColorAccent(charId: string): { body: string; outline: string; glow: string } {
  switch (charId) {
    case 'ryo':      return { body: '#4488ff', outline: '#2266ff60', glow: '#0044dd30' };
    case 'kyo':      return { body: '#ff8822', outline: '#ff660060', glow: '#ff440030' };
    case 'iori':     return { body: '#aa44dd', outline: '#8800cc60', glow: '#6600aa30' };
    case 'terry':    return { body: '#44aaff', outline: '#2288ff60', glow: '#0066ff30' };
    case 'andy':     return { body: '#ffbb44', outline: '#ff992260', glow: '#ff770030' };
    case 'joe':      return { body: '#ffaa22', outline: '#ff880060', glow: '#ff660030' };
    case 'robert':   return { body: '#44ff88', outline: '#22dd6660', glow: '#00aa4430' };
    case 'yuri':     return { body: '#ff88cc', outline: '#ff66aa60', glow: '#ff448830' };
    case 'athena':   return { body: '#ff66aa', outline: '#ff44aa60', glow: '#ff228830' };
    case 'mai':      return { body: '#ff4466', outline: '#ff224460', glow: '#ff003330' };
    case 'kim':      return { body: '#aaddff', outline: '#88ccff60', glow: '#66aaff30' };
    case 'chang':    return { body: '#cc8844', outline: '#aa662260', glow: '#88440030' };
    case 'choi':     return { body: '#bbcc22', outline: '#99aa0060', glow: '#77880030' };
    case 'leona':    return { body: '#88aaff', outline: '#6688ff60', glow: '#4466ff30' };
    case 'ralf':     return { body: '#cc6644', outline: '#aa442260', glow: '#88220030' };
    case 'clark':    return { body: '#88bb44', outline: '#66992260', glow: '#44770030' };
    case 'whip':     return { body: '#ff88ff', outline: '#ff66dd60', glow: '#ff44bb30' };
    case 'benimaru': return { body: '#ffff66', outline: '#ffff4460', glow: '#ffff2230' };
    case 'daimon':   return { body: '#88cc44', outline: '#66aa2260', glow: '#44880030' };
    case 'shingo':   return { body: '#ff8844', outline: '#ff662260', glow: '#ff440030' };
    case 'kula':     return { body: '#88ddff', outline: '#66ccff60', glow: '#44aaff30' };
    case 'k':
    case 'kdash':    return { body: '#ff4444', outline: '#ff222260', glow: '#ff000030' };
    case 'vanessa':  return { body: '#cc44aa', outline: '#aa228860', glow: '#88006630' };
    case 'seth':     return { body: '#8866dd', outline: '#6644bb60', glow: '#44229930' };
    case 'ramon':    return { body: '#ffaa44', outline: '#ff882260', glow: '#ff660030' };
    case 'todo':     return { body: '#88cc88', outline: '#66aa6660', glow: '#44884430' };
    case 'kasumi':   return { body: '#ff7799', outline: '#ff557760', glow: '#ff335530' };
    case 'xiangfei': return { body: '#ff9977', outline: '#ff775560', glow: '#ff553330' };
    case 'billy':    return { body: '#ddaa22', outline: '#bb880060', glow: '#99660030' };
    case 'mature':   return { body: '#cc66aa', outline: '#aa448860', glow: '#88226630' };
    case 'yashiro':  return { body: '#9988cc', outline: '#7766aa60', glow: '#55448830' };
    case 'chris':    return { body: '#ffcc88', outline: '#ffaa6660', glow: '#ff884430' };
    case 'shermie':  return { body: '#dd66aa', outline: '#bb448860', glow: '#99226630' };
    case 'vice':     return { body: '#6688cc', outline: '#4466aa60', glow: '#22448830' };
    case 'yamazaki': return { body: '#bb6644', outline: '#99442260', glow: '#77220030' };
    case 'mary':     return { body: '#aa88cc', outline: '#8866aa60', glow: '#66448830' };
    case 'kfm':      return { body: '#cc3333', outline: '#aa222260', glow: '#88111130' };
    default:         return { body: '#eebb00', outline: '#ffcc0060', glow: '#ffaa0030' };
  }
}

/** Resolve body/outline/glow colors from fighter state — queries manifest fallbackColors */
export function resolveFighterColors(f: Fighter, globalTick: number): { bodyColor: string; outlineColor: string; glowColor: string | null } {
  const manifestColors = getCharacterColors(f.charId ?? '');
  let bodyColor = manifestColors.outfit;
  let outlineColor = '#ffffff30';
  let glowColor: string | null = null;

  switch (f.state) {
    case FighterState.WALK:
      bodyColor = shiftColor(manifestColors.outfit, 12);
      break;
    case FighterState.RUN:
      bodyColor = shiftColor(manifestColors.outfit, 20);
      outlineColor = '#ff880050';
      glowColor = '#ff660025';
      break;
    case FighterState.BACKDASH:
      bodyColor = shiftColor(manifestColors.outfit, 35);
      outlineColor = '#88ccff60';
      glowColor = '#4488ff20';
      break;
    case FighterState.ROLL:
    case FighterState.BACK_ROLL:
      bodyColor = shiftColor(manifestColors.outfit, 40);
      outlineColor = '#44ff8860';
      glowColor = '#22ff4420';
      break;
    case FighterState.HOP:
      bodyColor = shiftColor(manifestColors.outfit, 15);
      break;
    case FighterState.HYPER_JUMP:
      bodyColor = shiftColor(manifestColors.outfit, 30);
      outlineColor = '#ff44ff50';
      glowColor = '#ff22ff25';
      break;
    case FighterState.JUMP:
    case FighterState.RUN_JUMP:
      bodyColor = shiftColor(manifestColors.outfit, 25);
      break;
    case FighterState.STAND_ATTACK:
    case FighterState.CROUCH_ATTACK:
    case FighterState.AIR_ATTACK: {
      const accent = getAttackColorAccent(f.charId ?? '');
      bodyColor = accent.body;
      outlineColor = accent.outline;
      glowColor = accent.glow;
      if (f.hitFlashFrames > 0) {
        const hitAura = getMaxAuraColor(f.charId ?? '');
        bodyColor = '#ffffff';
        outlineColor = `${hitAura.css}60`;
        glowColor = `${hitAura.css}30`;
      }
      break;
    }
    case FighterState.BLOCK:
    case FighterState.AIR_BLOCK:
      bodyColor = '#6688aa';
      outlineColor = '#88aaff60';
      glowColor = '#4466ff20';
      if (f.blockstunTimer > 0) {
        bodyColor = '#556688';
        outlineColor = '#6688cc70';
        glowColor = '#3355ff18';
        if (f.blockstunTimer > 12) {
          bodyColor = '#445577';
          outlineColor = '#5577bb80';
        }
      }
      if (f.guardGauge < 30) {
        bodyColor = '#aa8844';
        outlineColor = '#ffaa0060';
      }
      break;
    case FighterState.GUARD_CRUSH:
      bodyColor = globalTick % 6 < 3 ? '#ff4444' : '#ffffff';
      outlineColor = '#ff000080';
      glowColor = '#ff220040';
      break;
    case FighterState.HITSTUN:
      if (f.hitFlashFrames > 0) {
        bodyColor = f.hitFlashColor || '#ffffff';
        outlineColor = '#ffffffcc';
      } else {
        bodyColor = globalTick % 8 < 2 ? '#ffffff' : manifestColors.outfit;
        outlineColor = '#ff505070';
      }
      break;
    case FighterState.DIZZY:
      bodyColor = globalTick % 10 < 3 ? '#ffffaa' : globalTick % 10 < 5 ? '#ffffff' : manifestColors.outfit;
      outlineColor = '#ffcc0060';
      glowColor = '#ffcc0020';
      break;
    case FighterState.KNOCKDOWN:
      bodyColor = shiftColor(manifestColors.outfit, -50);
      outlineColor = '#88000040';
      break;
    case FighterState.GETUP:
      bodyColor = shiftColor(manifestColors.outfit, 15);
      outlineColor = '#ffffff30';
      break;
    case FighterState.CROUCH:
      bodyColor = shiftColor(manifestColors.outfit, -10);
      outlineColor = '#ffffff20';
      break;
    case FighterState.THROW:
      bodyColor = shiftColor(manifestColors.outfit, 30);
      outlineColor = '#ff440050';
      glowColor = '#ff220020';
      break;
    case FighterState.MAX_MODE:
      bodyColor = globalTick % 8 < 4 ? '#ffdd44' : manifestColors.outfit;
      outlineColor = '#ffaa0080';
      glowColor = '#ffaa0040';
      break;
  }

  if (f.counterGlowFrames > 0) {
    glowColor = '#ff8800';
    outlineColor = '#ff660088';
  }

  if (f.state === FighterState.HITSTUN && !f.isGrounded()) {
    outlineColor = '#4488ff50';
    glowColor = '#4466ff20';
  }

  return { bodyColor, outlineColor, glowColor };
}

/** Draw afterimage trail for RUN/BACKDASH/ROLL — pixel frame ghosts or skeletal fallback */
export function drawAfterimageTrail(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, leanOffsetX: number,
  globalTick: number, maxModeActive: boolean,
): void {
  const trailTint = maxModeActive && (f.state === FighterState.WALK || f.state === FighterState.CROUCH)
    ? '#ffcc44'
    : f.state === FighterState.RUN
    ? '#ff8844'
    : f.state === FighterState.BACKDASH
    ? '#6699ff'
    : '#88ddaa';

  const ghostCount = 3;
  for (let i = 1; i <= ghostCount; i++) {
    const ghostAlpha = 0.32 / i;
    const trailX = sx - leanOffsetX * i * 1.5 - f.facing * 12 * i;
    let pixelDrawn = false;
    const ghostCharId = f.charId ?? '';
    if (ghostCharId === 'kyo') {
      pixelDrawn = drawKyoHighResAfterimage(
        ctx, f.state, f.stateAge,
        trailX, f.y, f.facing, f.currentAttack, f.vx,
        trailTint, ghostAlpha,
      );
    } else if (ghostCharId === 'iori') {
      pixelDrawn = drawIoriHighResAfterimage(
        ctx, f.state, f.stateAge,
        trailX, f.y, f.facing, f.currentAttack, f.vx,
        trailTint, ghostAlpha,
      );
    } else {
      pixelDrawn = drawHighResAfterimage(
        ctx, ghostCharId, f.state, f.stateAge,
        trailX, f.y, f.facing, f.currentAttack, f.vx,
        trailTint, ghostAlpha,
      );
    }
    if (!pixelDrawn) {
      const trailManifestColors = getCharacterColors(f.charId ?? '');
      const trailColor = f.state === FighterState.RUN
        ? shiftColor(trailManifestColors.outfit, 40)
        : f.state === FighterState.BACKDASH
        ? shiftColor(trailManifestColors.outfit, 60)
        : shiftColor(trailManifestColors.outfit, 50);
      const trailOutline = f.state === FighterState.RUN
        ? '#ff880050'
        : f.state === FighterState.BACKDASH
        ? '#6699ff50'
        : '#44ff8850';
      ctx.save();
      ctx.globalAlpha = ghostAlpha;
      drawSkeletalFighter(ctx, f, trailX, f.y, trailColor, trailOutline, globalTick, maxModeActive);
      ctx.restore();
    }
  }
}

/** Check if fighter debug overlay is enabled via URL params or localStorage */
export function isFighterDebugOverlayEnabled(): boolean {
  const location = globalThis.location;
  const search = location?.search;

  if (typeof search === 'string' && search.length > 1) {
    const params = new URLSearchParams(search);
    const queryFlags = ['fighterDebug', 'debugFighterOverlay', 'rendererDebug'];
    for (const key of queryFlags) {
      if (params.has(key)) {
        const value = params.get(key);
        if (value === null || value === '' || value === '1' || value === 'true') {
          return true;
        }
      }
    }
  }

  try {
    const stored = globalThis.localStorage?.getItem('rendererFighterDebug');
    return stored === '1' || stored === 'true';
  } catch {
    return false;
  }
}
