/**
 * Portrait Manifest Regression Test
 * Verifies portrait sizes, query functions, and manifest data consistency.
 */
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  PORTRAIT_SIZES,
  PORTRAIT_MANIFEST,
  getPortrait,
  getSelectPortrait,
  getHUDPortrait,
  getVSPortrait,
  getWinPortrait,
  hasPixelPortraitData,
  getPortraitFallbackColor,
  getPortraitFallbackAccent,
  type PortraitSize,
  type PortraitManifest,
} from '../src/core/portraitManifest.js';
import { KYO_PORTRAIT_META } from '../src/content/characters/kyo/portraits/kyoPortraits.js';
import { RYO_PORTRAIT_META } from '../src/content/characters/ryo/portraits/ryoPortraits.js';
import { IORI_PORTRAIT_META } from '../src/content/characters/iori/portraits/ioriPortraits.js';
import { TERRY_PORTRAIT_META } from '../src/content/characters/terry/portraits/terryPortraits.js';
import { KIM_PORTRAIT_META } from '../src/content/characters/kim/portraits/kimPortraits.js';

const ALL_SIZES: PortraitSize[] = ['select', 'vs', 'hud', 'win'];
const ROOT_DIR = path.resolve(__dirname, '..');

const MUGEN_PORTRAIT_EXPECTATIONS = {
  kyo: {
    mugenDir: 'cvskyo',
    contentMeta: KYO_PORTRAIT_META,
    expected: {
      select: { spriteRef: '9000_1', imagePath: '/sprites/cvskyo/09000_0001.png', assetWidth: 120, assetHeight: 140 },
      vs: { spriteRef: '9000_1', imagePath: '/sprites/cvskyo/09000_0001.png', assetWidth: 120, assetHeight: 140 },
      hud: { spriteRef: '9000_0', imagePath: '/sprites/cvskyo/09000_0000.png', assetWidth: 25, assetHeight: 25 },
      win: { spriteRef: '9000_2', imagePath: '/sprites/cvskyo/09000_0002.png', assetWidth: 81, assetHeight: 59 },
    },
  },
  ryo: {
    mugenDir: 'cvsryo',
    contentMeta: RYO_PORTRAIT_META,
    expected: {
      select: { spriteRef: '9000_1', imagePath: '/sprites/cvsryo/09000_0001.png', assetWidth: 117, assetHeight: 140 },
      vs: { spriteRef: '9000_1', imagePath: '/sprites/cvsryo/09000_0001.png', assetWidth: 117, assetHeight: 140 },
      hud: { spriteRef: '9000_0', imagePath: '/sprites/cvsryo/09000_0000.png', assetWidth: 25, assetHeight: 25 },
      win: { spriteRef: '9000_2', imagePath: '/sprites/cvsryo/09000_0002.png', assetWidth: 81, assetHeight: 59 },
    },
  },
  iori: {
    mugenDir: 'yiori',
    contentMeta: IORI_PORTRAIT_META,
    expected: {
      select: { spriteRef: '9000_1', imagePath: '/sprites/yiori/09000_0001.png', assetWidth: 122, assetHeight: 137 },
      vs: { spriteRef: '9000_1', imagePath: '/sprites/yiori/09000_0001.png', assetWidth: 122, assetHeight: 137 },
      hud: { spriteRef: '9000_0', imagePath: '/sprites/yiori/09000_0000.png', assetWidth: 25, assetHeight: 25 },
      win: { spriteRef: '9000_2', imagePath: '/sprites/yiori/09000_0002.png', assetWidth: 25, assetHeight: 25 },
    },
  },
  terry: {
    mugenDir: 'cvsterry',
    contentMeta: TERRY_PORTRAIT_META,
    expected: {
      select: { spriteRef: '9000_1', imagePath: '/sprites/cvsterry/09000_0001.png', assetWidth: 120, assetHeight: 140 },
      vs: { spriteRef: '9000_1', imagePath: '/sprites/cvsterry/09000_0001.png', assetWidth: 120, assetHeight: 140 },
      hud: { spriteRef: '9000_0', imagePath: '/sprites/cvsterry/09000_0000.png', assetWidth: 25, assetHeight: 25 },
      win: { spriteRef: '9000_2', imagePath: '/sprites/cvsterry/09000_0002.png', assetWidth: 81, assetHeight: 59 },
    },
  },
  kim: {
    mugenDir: 'cvskim',
    contentMeta: KIM_PORTRAIT_META,
    expected: {
      select: { spriteRef: '9000_1', imagePath: '/sprites/cvskim/09000_0001.png', assetWidth: 120, assetHeight: 133 },
      vs: { spriteRef: '9000_1', imagePath: '/sprites/cvskim/09000_0001.png', assetWidth: 120, assetHeight: 133 },
      hud: { spriteRef: '9000_0', imagePath: '/sprites/cvskim/09000_0000.png', assetWidth: 25, assetHeight: 25 },
      win: { spriteRef: '9000_2', imagePath: '/sprites/cvskim/09000_0002.png', assetWidth: 81, assetHeight: 59 },
    },
  },
} as const;

describe('PORTRAIT_SIZES', () => {
  it('has all 4 size variants', () => {
    for (const size of ALL_SIZES) {
      expect(PORTRAIT_SIZES[size], size).toBeDefined();
      expect(PORTRAIT_SIZES[size].width, `${size} width`).toBeGreaterThan(0);
      expect(PORTRAIT_SIZES[size].height, `${size} height`).toBeGreaterThan(0);
    }
  });

  it('select is 120x120', () => {
    expect(PORTRAIT_SIZES.select).toEqual({ width: 120, height: 120 });
  });

  it('vs is 160x160', () => {
    expect(PORTRAIT_SIZES.vs).toEqual({ width: 160, height: 160 });
  });

  it('hud is 48x48', () => {
    expect(PORTRAIT_SIZES.hud).toEqual({ width: 48, height: 48 });
  });

  it('win is 200x200', () => {
    expect(PORTRAIT_SIZES.win).toEqual({ width: 200, height: 200 });
  });

  it('vs > select > hud in size', () => {
    expect(PORTRAIT_SIZES.vs.width).toBeGreaterThan(PORTRAIT_SIZES.select.width);
    expect(PORTRAIT_SIZES.select.width).toBeGreaterThan(PORTRAIT_SIZES.hud.width);
  });
});

describe('Query functions with mock manifest', () => {
  const mockManifest: PortraitManifest = {
    version: 1,
    portraits: {
      testchar: {
        select: { charId: 'testchar', size: 'select', atlasX: 0, atlasY: 0, width: 120, height: 120, fallbackColor: '#ff0000', fallbackAccent: '#00ff00', hasPixelPortrait: true },
        vs: { charId: 'testchar', size: 'vs', atlasX: 160, atlasY: 0, width: 160, height: 160, fallbackColor: '#ff0000', fallbackAccent: '#00ff00' },
        hud: { charId: 'testchar', size: 'hud', atlasX: 360, atlasY: 0, width: 48, height: 48, fallbackColor: '#ff0000', fallbackAccent: '#00ff00' },
        win: { charId: 'testchar', size: 'win', atlasX: 420, atlasY: 0, width: 200, height: 200, fallbackColor: '#ff0000', fallbackAccent: '#00ff00' },
      },
    },
  };

  it('getPortrait returns entry for valid char+size', () => {
    expect(getPortrait(mockManifest, 'testchar', 'select')).toBeDefined();
    expect(getPortrait(mockManifest, 'testchar', 'hud')!.width).toBe(48);
  });

  it('getPortrait returns undefined for unknown char', () => {
    expect(getPortrait(mockManifest, 'unknown', 'select')).toBeUndefined();
  });

  it('getSelectPortrait convenience', () => {
    expect(getSelectPortrait(mockManifest, 'testchar')).toBeDefined();
  });

  it('getHUDPortrait convenience', () => {
    expect(getHUDPortrait(mockManifest, 'testchar')).toBeDefined();
  });

  it('getVSPortrait convenience', () => {
    expect(getVSPortrait(mockManifest, 'testchar')).toBeDefined();
  });

  it('getWinPortrait convenience', () => {
    expect(getWinPortrait(mockManifest, 'testchar')).toBeDefined();
  });

  it('hasPixelPortraitData returns true when set', () => {
    expect(hasPixelPortraitData(mockManifest, 'testchar', 'select')).toBe(true);
  });

  it('hasPixelPortraitData returns false when not set', () => {
    expect(hasPixelPortraitData(mockManifest, 'testchar', 'vs')).toBe(false);
  });

  it('getPortraitFallbackColor returns color', () => {
    expect(getPortraitFallbackColor(mockManifest, 'testchar', 'hud')).toBe('#ff0000');
  });

  it('getPortraitFallbackAccent returns accent', () => {
    expect(getPortraitFallbackAccent(mockManifest, 'testchar', 'hud')).toBe('#00ff00');
  });

  it('fallback queries return undefined for unknown char', () => {
    expect(getPortraitFallbackColor(mockManifest, 'nobody')).toBeUndefined();
    expect(getPortraitFallbackAccent(mockManifest, 'nobody')).toBeUndefined();
  });
});

describe('PORTRAIT_MANIFEST global', () => {
  it('has version 1', () => {
    expect(PORTRAIT_MANIFEST.version).toBe(1);
  });

  it('portraits is an object', () => {
    expect(typeof PORTRAIT_MANIFEST.portraits).toBe('object');
  });

  it.each(Object.entries(MUGEN_PORTRAIT_EXPECTATIONS))('%s portrait entries point to real MUGEN portrait PNGs', (charId, config) => {
    for (const size of ALL_SIZES) {
      const entry = getPortrait(PORTRAIT_MANIFEST, charId, size);
      expect(entry, `${charId} ${size}`).toBeDefined();
      expect(entry!.source, `${charId} ${size} source`).toBe('mugen-sprite');
      expect(entry!.mugenDir, `${charId} ${size} mugenDir`).toBe(config.mugenDir);
      expect(entry!.spriteRef, `${charId} ${size} spriteRef`).toBe(config.expected[size].spriteRef);
      expect(entry!.imagePath, `${charId} ${size} imagePath`).toBe(config.expected[size].imagePath);
      expect(entry!.assetWidth, `${charId} ${size} assetWidth`).toBe(config.expected[size].assetWidth);
      expect(entry!.assetHeight, `${charId} ${size} assetHeight`).toBe(config.expected[size].assetHeight);
    }
  });

  it.each(Object.entries(MUGEN_PORTRAIT_EXPECTATIONS))('%s MUGEN portrait entries match sprite manifest records', (charId, config) => {
    const manifestPath = path.join(ROOT_DIR, `public/sprites/${config.mugenDir}/manifest.json`);
    const spriteManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as {
      sprites: Record<string, { file: string; width: number; height: number }>;
    };

    for (const size of ALL_SIZES) {
      const entry = getPortrait(PORTRAIT_MANIFEST, charId, size)!;
      const sprite = spriteManifest.sprites[entry.spriteRef!];
      expect(sprite, `${config.mugenDir} ${entry.spriteRef}`).toBeDefined();
      expect(entry.imagePath, `${charId} ${size} imagePath`).toBe(`/sprites/${config.mugenDir}/${sprite.file}`);
      const publicPath = path.join(ROOT_DIR, 'public', entry.imagePath!.replace(/^\/sprites\//, 'sprites/'));
      expect(fs.existsSync(publicPath), `${charId} ${size} PNG exists`).toBe(true);
      expect(entry.assetWidth, `${charId} ${size} assetWidth`).toBe(sprite.width);
      expect(entry.assetHeight, `${charId} ${size} assetHeight`).toBe(sprite.height);
    }
  });

  it.each(Object.entries(MUGEN_PORTRAIT_EXPECTATIONS))('%s content package portrait metadata agrees with the core portrait manifest', (charId, config) => {
    for (const size of ALL_SIZES) {
      const manifestEntry = getPortrait(PORTRAIT_MANIFEST, charId, size)!;
      const contentEntry = config.contentMeta[size];
      expect(contentEntry.source, `${charId} content ${size} source`).toBe(manifestEntry.source);
      expect(contentEntry.mugenDir, `${charId} content ${size} mugenDir`).toBe(manifestEntry.mugenDir);
      expect(contentEntry.spriteRef, `${charId} content ${size} spriteRef`).toBe(manifestEntry.spriteRef);
      expect(contentEntry.imagePath, `${charId} content ${size} imagePath`).toBe(manifestEntry.imagePath);
      expect(contentEntry.assetSize, `${charId} content ${size} assetSize`).toEqual({
        width: manifestEntry.assetWidth,
        height: manifestEntry.assetHeight,
      });
    }
  });
});
