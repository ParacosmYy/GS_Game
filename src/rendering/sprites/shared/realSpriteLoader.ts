/**
 * realSpriteLoader.ts
 *
 * Loads real MUGEN-extracted sprites from manifest + PNG files.
 * Provides a generic loading function that works for any character.
 */

import type { SpriteImageFrame } from './baseHighResRenderer.js';
import { FighterState, AttackType } from '../../../core/types.js';
import { registerAnimDurations } from './animStateSync.js';

interface ManifestSprite {
  group: number;
  index: number;
  file: string;
  width: number;
  height: number;
}

interface ManifestFrame {
  group: number;
  index: number;
  offsetX: number;
  offsetY: number;
  duration: number;
}

interface ManifestAnim {
  name: string;
  loopStart: number;
  frames: ManifestFrame[];
}

interface SpriteManifest {
  characterId: string;
  sprites: Record<string, ManifestSprite>;
  animations: Record<string, ManifestAnim>;
}

// ===== Image cache =====
const imageCache = new Map<string, HTMLImageElement>();

function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src);
  if (cached && cached.complete) return Promise.resolve(cached);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => { imageCache.set(src, img); resolve(img); };
    img.onerror = () => reject(new Error(`Failed to load: ${src}`));
    img.src = src;
  });
}

/**
 * Load sprites from a manifest and base URL.
 * Returns Map<actionId, SpriteImageFrame[]>.
 */
export async function loadRealSprites(
  manifestUrl: string,
  spritesBaseUrl: string,
): Promise<Map<string, SpriteImageFrame[]>> {
  const resp = await fetch(manifestUrl);
  const manifest: SpriteManifest = await resp.json();

  // Preload all unique sprite images
  const loadPromises: Promise<void>[] = [];
  const spriteImages = new Map<string, HTMLImageElement>();

  for (const [key, sprite] of Object.entries(manifest.sprites)) {
    const src = `${spritesBaseUrl}/${sprite.file}`;
    if (!spriteImages.has(key)) {
      loadPromises.push(
        loadImage(src).then(img => { spriteImages.set(key, img); })
      );
    }
  }
  await Promise.all(loadPromises);

  // Build animation frames
  const result = new Map<string, SpriteImageFrame[]>();

  // Extract charId from manifest URL: /sprites/<mugenDir>/manifest.json
  const mugenDir = manifestUrl.match(/\/sprites\/([^/]+)\//)?.[1] || manifest.characterId;
  const charId = manifest.characterId || mugenDir;

  for (const [actionId, anim] of Object.entries(manifest.animations)) {
    const frames: SpriteImageFrame[] = [];

    for (const f of anim.frames) {
      if (f.group === -1) {
        const blank = document.createElement('canvas');
        blank.width = 1; blank.height = 1;
        const blankImg = new Image();
        blankImg.src = blank.toDataURL();
        frames.push({
          image: blankImg,
          srcRect: { x: 0, y: 0, w: 1, h: 1 },
          anchor: { x: 0, y: 0 },
          duration: f.duration,
        });
        continue;
      }

      const key = `${f.group}_${f.index}`;
      const sprite = manifest.sprites[key];
      const img = spriteImages.get(key);
      if (!sprite || !img) continue;

      frames.push({
        image: img,
        srcRect: { x: 0, y: 0, w: sprite.width, h: sprite.height },
        anchor: {
          x: Math.floor(sprite.width / 2) + f.offsetX,
          y: sprite.height + f.offsetY,
        },
        duration: f.duration,
      });
    }

    if (frames.length > 0) {
      result.set(actionId, frames);
    }

    // Register frame durations for animStateSync
    const durations = anim.frames.map(f => f.duration);
    const loopingActions = new Set(['0', '5', '11', '20', '21', '100', '105', '120', '181']);
    registerAnimDurations(charId, actionId, durations, loopingActions.has(actionId));
  }

  return result;
}

/**
 * Kyo-specific MUGEN action resolver.
 * Maps our FighterState + AttackType to MUGEN action numbers from cvskyo.
 */
export function resolveKyoMugenAction(state: FighterState, attack: AttackType | null, vx: number, facing: number): string | null {
  switch (state) {
    case FighterState.IDLE: return '0';
    case FighterState.WALK: return (vx * facing > 0) ? '20' : '21';
    case FighterState.CROUCH: return '11';
    case FighterState.JUMP:
    case FighterState.RUN_JUMP:
    case FighterState.HOP:
    case FighterState.HYPER_JUMP:
    case FighterState.AIR_BLOCK:
      return (vx * facing > 0) ? '42' : '43';
    case FighterState.AIR_ATTACK:
      if (attack === AttackType.JUMP_C) return '610';
      if (attack === AttackType.JUMP_D) return '640';
      if (attack === AttackType.JUMP_B) return '630';
      if (attack === AttackType.CMD_NARAKU) return '620';
      return '600';
    case FighterState.STAND_ATTACK:
      if (attack === AttackType.KYO_ONIYAKI) return '1000';
      if (attack === AttackType.KYO_ONIYAKI_C) return '1010';
      if (attack === AttackType.KYO_YAMIBARAI || attack === AttackType.KYO_YAMIBARAI_C) return '1100';
      if (attack === AttackType.KYO_RED_KICK) return '1300';
      if (attack === AttackType.KYO_75KAI || attack === AttackType.KYO_75KAI_2) return '1200';
      if (attack === AttackType.KYO_ARAGAMI || attack === AttackType.KYO_ARAGAMI_KONOKIZU ||
          attack === AttackType.KYO_ARAGAMI_YANOSABI || attack === AttackType.KYO_NANASE ||
          attack === AttackType.KYO_KOTO_TSUKI || attack === AttackType.KYO_YAKISOGI) return '1400';
      if (attack === AttackType.KYO_DOKUGAMI || attack === AttackType.KYO_TSUMIYOMI ||
          attack === AttackType.KYO_BATSUYOMI) return '1500';
      if (attack === AttackType.DM_OROCHINAGI) return '2000';
      if (attack === AttackType.SDM_OROCHINAGI) return '2010';
      if (attack === AttackType.HSDM_OROCHINAGI) return '2020';
      if (attack === AttackType.CMD_GOFU_YOU) return '2400';
      if (attack === AttackType.CMD_88SHIKI) return '1700';
      if (attack === AttackType.CLOSE_A) return '200';
      if (attack === AttackType.CLOSE_C) return '210';
      if (attack === AttackType.CLOSE_B) return '230';
      if (attack === AttackType.CLOSE_D) return '240';
      if (attack === AttackType.STAND_C) return '211';
      if (attack === AttackType.STAND_D) return '241';
      if (attack === AttackType.STAND_B) return '231';
      return '201';
    case FighterState.CROUCH_ATTACK:
      if (attack === AttackType.CROUCH_C) return '410';
      if (attack === AttackType.CROUCH_D) return '440';
      if (attack === AttackType.CROUCH_B) return '430';
      return '400';
    case FighterState.HITSTUN: return '5000';
    case FighterState.KNOCKDOWN:
    case FighterState.GETUP: return '5050';
    case FighterState.BLOCK:
    case FighterState.AIR_BLOCK: return '120';
    case FighterState.RUN: return '100';
    case FighterState.BACKDASH: return '105';
    case FighterState.ROLL: return '100';
    case FighterState.BACK_ROLL: return '105';
    case FighterState.THROW: return '800';
    case FighterState.DIZZY: return '5300';
    case FighterState.WIN: return '181';
    case FighterState.TAUNT: return '195';
    case FighterState.COUNTER_STANCE: return '300';
    case FighterState.MAX_MODE: return '0';
    case FighterState.GUARD_CRUSH: return '120';
    default: return null;
  }
}

/**
 * Ryo-specific MUGEN action resolver.
 * Maps our FighterState + AttackType to MUGEN action numbers from cvsryo.
 *
 * Key action mapping (cvsryo MUGEN):
 *   0=stand, 20=walk_fwd, 21=walk_back, 100=run, 105=backdash, 11=crouch
 *   200=far_A, 210=far_C, 211=stand_C, 220=close_A, 230=far_B, 231=stand_B, 240=far_D, 241=stand_D
 *   400=crouch_A, 410=crouch_C, 430=crouch_B, 440=crouch_D
 *   600=jump_A, 610=jump_C, 630=jump_B, 640=jump_D
 *   1000=虎煌A, 1010=虎煌C, 1020=虎煌D, 1100=虎咆A, 1110=虎咆C
 *   1200=飛燕, 1300=霸王翔吼拳, 1400=冰果斬, 1500=斩裂拳
 *   3000=龍虎乱舞DM, 3010=龍虎乱舞SDM, 3020=龍虎乱舞HSDM
 *   3100=天地霸煌拳DM, 3101=天地霸煌拳SDM
 *   5000=hitstun, 5050=knockdown, 5300=dizzy, 800=throw
 *   120=block, 170=cmd_tsurizao, 195=taunt, 181=win, 300=counter_stance
 */
export function resolveRyoMugenAction(state: FighterState, attack: AttackType | null, vx: number, facing: number): string | null {
  switch (state) {
    case FighterState.IDLE: return '0';
    case FighterState.WALK: return (vx * facing > 0) ? '20' : '21';
    case FighterState.CROUCH: return '11';
    case FighterState.JUMP:
    case FighterState.RUN_JUMP:
    case FighterState.HOP:
    case FighterState.HYPER_JUMP:
    case FighterState.AIR_BLOCK:
      return (vx * facing > 0) ? '42' : '43';
    case FighterState.AIR_ATTACK:
      if (attack === AttackType.JUMP_C) return '610';
      if (attack === AttackType.JUMP_D) return '640';
      if (attack === AttackType.JUMP_B) return '630';
      return '600';
    case FighterState.STAND_ATTACK:
      // Specials
      if (attack === AttackType.RYO_KOOU) return '1000';
      if (attack === AttackType.RYO_KOOU_C) return '1010';
      if (attack === AttackType.RYO_KOOUKEN_D) return '1020';
      if (attack === AttackType.RYO_KO_HOU) return '1100';
      if (attack === AttackType.RYO_KO_HOU_C) return '1110';
      if (attack === AttackType.RYO_HIEN) return '1200';
      if (attack === AttackType.RYO_HAOU) return '1300';
      if (attack === AttackType.RYO_HIO_HACKER) return '1400';
      if (attack === AttackType.RYO_ZANRETSU_KEN) return '1500';
      if (attack === AttackType.RYO_TSURIZAO) return '170';
      if (attack === AttackType.RYO_ORISHI) return '1300';
      // DM/SDM/HSDM
      if (attack === AttackType.DM_RYUKO_RANBU) return '3000';
      if (attack === AttackType.SDM_RYUKO_RANBU) return '3010';
      if (attack === AttackType.HSDM_RYUKO_RANBU) return '3020';
      if (attack === AttackType.DM_TEN_HA_OU) return '3100';
      if (attack === AttackType.SDM_TEN_HA_OU) return '3100';
      // Normals
      if (attack === AttackType.CLOSE_A) return '200';
      if (attack === AttackType.CLOSE_C) return '210';
      if (attack === AttackType.STAND_C) return '211';
      if (attack === AttackType.STAND_B) return '231';
      if (attack === AttackType.CLOSE_B) return '230';
      if (attack === AttackType.STAND_D) return '241';
      if (attack === AttackType.CLOSE_D) return '240';
      return '201';
    case FighterState.CROUCH_ATTACK:
      if (attack === AttackType.CROUCH_C) return '410';
      if (attack === AttackType.CROUCH_D) return '440';
      if (attack === AttackType.CROUCH_B) return '430';
      return '400';
    case FighterState.HITSTUN: return '5000';
    case FighterState.KNOCKDOWN:
    case FighterState.GETUP: return '5050';
    case FighterState.BLOCK:
    case FighterState.AIR_BLOCK: return '120';
    case FighterState.RUN: return '100';
    case FighterState.BACKDASH: return '105';
    case FighterState.ROLL: return '100';
    case FighterState.BACK_ROLL: return '105';
    case FighterState.THROW: return '800';
    case FighterState.DIZZY: return '5300';
    case FighterState.WIN: return '181';
    case FighterState.TAUNT: return '195';
    case FighterState.COUNTER_STANCE: return '300';
    case FighterState.MAX_MODE: return '0';
    case FighterState.GUARD_CRUSH: return '120';
    default: return null;
  }
}
