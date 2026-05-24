/** Sprite Sheet Renderer — 逐帧精灵图渲染引擎
 * 替代骨骼矩形拼接, 使用真实的2D精灵图帧动画
 * 支持渐进式迁移: 有精灵图的角色用精灵图, 没有的降级到骨骼渲染
 */

import { FighterState } from '../core/types.js';

/** 精灵图帧定义 */
export interface SpriteFrame {
  /** 精灵图内的X偏移 (像素) */
  sx: number;
  /** 精灵图内的Y偏移 (像素) */
  sy: number;
  /** 帧宽度 */
  sw: number;
  /** 帧高度 */
  sh: number;
  /** 渲染X偏移 (相对角色位置, 正=前) */
  ox: number;
  /** 渲染Y偏移 (相对角色脚底, 负=上) */
  oy: number;
}

/** 角色动画定义: FighterState → SpriteFrame[] */
export type SpriteAnimationMap = Partial<Record<FighterState, SpriteFrame[]>>;

/** 角色精灵图资源 */
export interface SpriteAsset {
  /** 角色ID (匹配charId) */
  charId: string;
  /** 加载后的Image对象 */
  image: HTMLImageElement | null;
  /** 是否加载完成 */
  loaded: boolean;
  /** 动画帧映射 */
  animations: SpriteAnimationMap;
}

/** 精灵图资源管理器 */
export class SpriteManager {
  private assets = new Map<string, SpriteAsset>();
  private loadPromises: Promise<void>[] = [];

  /** 注册角色精灵图 */
  register(charId: string, src: string, animations: SpriteAnimationMap): void {
    const asset: SpriteAsset = { charId, image: null, loaded: false, animations };
    this.assets.set(charId, asset);

    const img = new Image();
    const promise = new Promise<void>((resolve) => {
      img.onload = () => {
        asset.image = img;
        asset.loaded = true;
        resolve();
      };
      img.onerror = () => {
        console.warn(`Sprite load failed: ${src}`);
        resolve();
      };
    });
    img.src = src;
    asset.image = img;
    this.loadPromises.push(promise);
  }

  /** 等待所有精灵图加载完成 */
  async loadAll(): Promise<void> {
    await Promise.all(this.loadPromises);
    this.loadPromises = [];
  }

  /** 获取角色精灵图资源 */
  get(charId: string): SpriteAsset | undefined {
    return this.assets.get(charId);
  }

  /** 是否有精灵图可用 */
  hasSprite(charId: string): boolean {
    const asset = this.assets.get(charId);
    return asset !== undefined && asset.loaded && asset.image !== null;
  }
}

/** 精灵图渲染器 */
export class SpriteRenderer {
  private manager: SpriteManager;
  /** 调色板映射 (color → replacement color) */
  private paletteCache = new Map<string, Map<string, string>>();

  constructor(manager: SpriteManager) {
    this.manager = manager;
  }

  /** 是否有精灵图可用于该角色 */
  canRender(charId: string): boolean {
    return this.manager.hasSprite(charId);
  }

  /**
   * 渲染角色精灵帧
   * @returns true if sprite was rendered, false if fallback needed
   */
  render(
    ctx: CanvasRenderingContext2D,
    charId: string,
    state: FighterState,
    frameIndex: number,
    x: number,
    y: number,
    facing: number,
    color: string,
  ): boolean {
    const asset = this.manager.get(charId);
    if (!asset || !asset.loaded || !asset.image) return false;

    const frames = asset.animations[state];
    if (!frames || frames.length === 0) return false;

    const idx = Math.min(frameIndex, frames.length - 1);
    const frame = frames[idx];

    ctx.save();
    const drawX = x + frame.ox * facing;
    const drawY = y + frame.oy;

    if (facing < 0) {
      ctx.translate(drawX, drawY);
      ctx.scale(-1, 1);
      ctx.drawImage(
        asset.image,
        frame.sx, frame.sy, frame.sw, frame.sh,
        0, 0, frame.sw, frame.sh,
      );
    } else {
      ctx.drawImage(
        asset.image,
        frame.sx, frame.sy, frame.sw, frame.sh,
        drawX, drawY, frame.sw, frame.sh,
      );
    }

    ctx.restore();
    return true;
  }
}

/** 生成占位精灵图 — 用于测试阶段, 用Canvas动态绘制简易帧 */
export function generatePlaceholderSprite(
  width: number, height: number, color: string, label: string,
): HTMLImageElement {
  const cvs = document.createElement('canvas');
  cvs.width = width;
  cvs.height = height;
  const c = cvs.getContext('2d')!;
  c.fillStyle = color;
  c.fillRect(0, 0, width, height);
  c.fillStyle = '#fff';
  c.font = `${Math.max(10, width / 6)}px monospace`;
  c.textAlign = 'center';
  c.fillText(label, width / 2, height / 2 + 4);
  const img = new Image();
  img.src = cvs.toDataURL();
  return img;
}
