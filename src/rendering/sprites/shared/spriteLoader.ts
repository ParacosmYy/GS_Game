/**
 * spriteLoader.ts
 *
 * Runtime sprite loading from MUGEN-extracted manifest + PNG files.
 * Loads a sprite manifest JSON and preloads all referenced PNG images,
 * producing ImageFrameEntry[] for the createHighResRenderer() factory.
 */

import type { SpriteImageFrame } from './baseHighResRenderer.js';

// ===== Manifest Types (match buildSpriteManifest output) =====

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
  flipH: boolean;
  hurtboxes: { left: number; top: number; right: number; bottom: number }[] | null;
  attackBoxes: { left: number; top: number; right: number; bottom: number }[] | null;
}

interface ManifestAnim {
  name: string;
  loopStart: number;
  defaultHurtboxes: { left: number; top: number; right: number; bottom: number }[];
  frames: ManifestFrame[];
}

interface SpriteManifest {
  characterId: string;
  sprites: Record<string, ManifestSprite>;
  animations: Record<string, ManifestAnim>;
  stateMap: Record<string, string>;
}

// ===== Image Cache =====

const imageCache = new Map<string, HTMLImageElement>();

function loadImage(src: string): Promise<HTMLImageElement> {
  if (imageCache.has(src)) return Promise.resolve(imageCache.get(src)!);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => { imageCache.set(src, img); resolve(img); };
    img.onerror = () => reject(new Error(`Failed to load sprite: ${src}`));
    img.src = src;
  });
}

// ===== Manifest Loader =====

/**
 * Load a sprite manifest and preload all PNG images.
 * Returns a map of actionId → SpriteImageFrame[].
 */
export async function loadSpriteManifest(
  manifestPath: string,
  spritesBaseDir: string,
): Promise<Map<string, SpriteImageFrame[]>> {
  // Fetch manifest JSON
  const response = await fetch(manifestPath);
  const manifest: SpriteManifest = await response.json();

  // Preload all unique sprite images
  const loadPromises: Promise<void>[] = [];
  const spriteImages = new Map<string, HTMLImageElement>();

  for (const [key, sprite] of Object.entries(manifest.sprites)) {
    const src = `${spritesBaseDir}/${sprite.file}`;
    if (!spriteImages.has(key)) {
      loadPromises.push(
        loadImage(src).then(img => { spriteImages.set(key, img); })
      );
    }
  }
  await Promise.all(loadPromises);

  // Build animation frames
  const result = new Map<string, SpriteImageFrame[]>();

  for (const [actionId, anim] of Object.entries(manifest.animations)) {
    const frames: SpriteImageFrame[] = [];

    for (const f of anim.frames) {
      // -1 group = blank/invisible frame
      if (f.group === -1) {
        // Create a 1x1 transparent placeholder
        frames.push({
          image: createBlankImage(),
          srcRect: { x: 0, y: 0, w: 1, h: 1 },
          anchor: { x: 0, y: 0 },
          duration: f.duration,
        });
        continue;
      }

      const key = `${f.group}_${f.index}`;
      const spriteInfo = manifest.sprites[key];
      const img = spriteImages.get(key);

      if (!spriteInfo || !img) {
        // Fallback: try alternative keys
        const altKey = `${f.group}_${String(f.index).padStart(4, '0')}`;
        const altSprite = manifest.sprites[altKey];
        const altImg = spriteImages.get(altKey);
        if (altSprite && altImg) {
          frames.push(buildFrame(altImg, altSprite, f));
          continue;
        }
        // Skip missing sprites silently
        continue;
      }

      frames.push(buildFrame(img, spriteInfo, f));
    }

    result.set(actionId, frames);
  }

  return result;
}

function buildFrame(img: HTMLImageElement, sprite: ManifestSprite, f: ManifestFrame): SpriteImageFrame {
  const anchor = {
    x: Math.floor(sprite.width / 2) + f.offsetX,
    y: sprite.height + f.offsetY,
  };
  return {
    image: img,
    srcRect: { x: 0, y: 0, w: sprite.width, h: sprite.height },
    anchor,
    duration: f.duration,
  };
}

function createBlankImage(): HTMLImageElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const img = new Image();
  img.src = canvas.toDataURL();
  return img;
}

/**
 * Clear the image cache (for scene transitions).
 */
export function clearSpriteCache(): void {
  imageCache.clear();
}
