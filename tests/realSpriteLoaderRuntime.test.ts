/**
 * realSpriteLoader runtime regression tests.
 *
 * Proves the battle-sprite path consumes MUGEN manifest data directly:
 * manifest.json -> Image-backed SpriteImageFrame[] -> animStateSync durations.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FighterState, AttackType } from '../src/core/types.js';
import { getAnimInfo, clearAnimCache } from '../src/rendering/sprites/shared/animStateSync.js';
import { loadRealSprites } from '../src/rendering/sprites/shared/realSpriteLoader.js';
import { drawGenericCharacterSprite } from '../src/rendering/sprites/shared/genericCharacterRenderer.js';
import { getCharacterConfig } from '../src/rendering/sprites/shared/characterSpriteRegistry.js';
import '../src/rendering/sprites/shared/characterSpriteConfigs.js';

class MockImage {
  src = '';
  complete = true;
  naturalWidth = 32;
  naturalHeight = 48;
}

function createMockContext(): CanvasRenderingContext2D {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    drawImage: vi.fn(),
    globalAlpha: 1,
  } as unknown as CanvasRenderingContext2D;
}

const SAMPLE_MANIFEST = {
  characterId: 'cvskyo',
  sprites: {
    '0_0': { group: 0, index: 0, file: '00000_0000.png', width: 34, height: 91 },
    '200_0': { group: 200, index: 0, file: '00200_0000.png', width: 48, height: 88 },
  },
  animations: {
    '000': {
      name: 'Stand',
      loopStart: 0,
      frames: [
        { group: 0, index: 0, offsetX: -2, offsetY: 3, duration: 4 },
        { group: 0, index: 0, offsetX: -1, offsetY: 2, duration: 5 },
      ],
    },
    '200': {
      name: 'Close A',
      loopStart: 0,
      frames: [
        { group: 200, index: 0, offsetX: 1, offsetY: -4, duration: 3 },
      ],
    },
  },
};

describe('realSpriteLoader battle sprite runtime path', () => {
  beforeEach(() => {
    clearAnimCache();
    vi.stubGlobal('Image', MockImage);
    vi.stubGlobal('fetch', vi.fn(async () => ({
      json: async () => SAMPLE_MANIFEST,
    })));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    clearAnimCache();
  });

  it('loads MUGEN manifest animations into image-backed battle sprite frames', async () => {
    const sprites = await loadRealSprites('/sprites/cvskyo/manifest.json', '/sprites/cvskyo', 'kyo');

    expect(sprites.has('0')).toBe(true);
    expect(sprites.has('200')).toBe(true);

    const idleFrame = sprites.get('0')![0];
    expect(idleFrame.image.src).toBe('/sprites/cvskyo/00000_0000.png');
    expect(idleFrame.srcRect).toEqual({ x: 0, y: 0, w: 34, h: 91 });
    expect(idleFrame.anchor).toEqual({ x: 15, y: 94 });
    expect(idleFrame.duration).toBe(4);

    const punchFrame = sprites.get('200')![0];
    expect(punchFrame.image.src).toBe('/sprites/cvskyo/00200_0000.png');
    expect(punchFrame.srcRect).toEqual({ x: 0, y: 0, w: 48, h: 88 });
    expect(punchFrame.anchor).toEqual({ x: 25, y: 84 });
    expect(punchFrame.duration).toBe(3);

    expect(getAnimInfo('kyo', '0')!.frameDurations).toEqual([4, 5]);
    expect(getAnimInfo('kyo', '200')!.frameDurations).toEqual([3]);
  });

  it('draws a generic character frame through Canvas drawImage once sprites are loaded', async () => {
    const sprites = await loadRealSprites('/sprites/cvskyo/manifest.json', '/sprites/cvskyo', 'kyo');
    const config = getCharacterConfig('kyo')!;
    const ctx = createMockContext();

    const drewIdle = drawGenericCharacterSprite(
      ctx,
      'kyo-runtime-test',
      config,
      sprites,
      FighterState.IDLE,
      0,
      320,
      200,
      1,
      null,
      0,
    );

    expect(drewIdle).toBe(true);
    expect(ctx.drawImage).toHaveBeenCalled();
  });

  it('draws stand attack frames from the resolved MUGEN action', async () => {
    const sprites = await loadRealSprites('/sprites/cvskyo/manifest.json', '/sprites/cvskyo', 'kyo');
    const config = getCharacterConfig('kyo')!;
    const ctx = createMockContext();

    const drewAttack = drawGenericCharacterSprite(
      ctx,
      'kyo-runtime-test-attack',
      config,
      sprites,
      FighterState.STAND_ATTACK,
      0,
      320,
      200,
      1,
      AttackType.CLOSE_A,
      0,
    );

    expect(drewAttack).toBe(true);
    expect(ctx.drawImage).toHaveBeenCalled();
  });
});
