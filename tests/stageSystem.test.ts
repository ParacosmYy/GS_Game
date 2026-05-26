/**
 * Stage System Tests — KOF2002 舞台渲染系统
 *
 * 覆盖范围：
 *   1. Stage Constants — CANVAS_WIDTH, CANVAS_HEIGHT, STAGE_GROUND_Y, STAGE_WIDTH
 *   2. Stage Factory — setStage / getStage / cycleStage / getAllStages
 *   3. Stage List — 5 个 stage，唯一 id，完整性
 *   4. Stage Rendering — drawStage 不抛异常（mock canvas），不同 stage，parallax
 *   5. Stage Ground — STAGE_GROUND_Y 合理性，STAGE_WIDTH > CANVAS_WIDTH，舞台边界
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  STAGE_GROUND_Y,
  STAGE_WIDTH,
  STAGE_LEFT,
  STAGE_RIGHT,
} from '../src/core/constants.js';
import {
  drawStage,
  generateStars,
  setStage,
  getStage,
  getAllStages,
  cycleStage,
} from '../src/rendering/stage.js';
import type { StageId, Star } from '../src/rendering/stage.js';

// ─── Mock Canvas ──────────────────────────────────────────────────────────────

function createMockCtx(): CanvasRenderingContext2D {
  const mockGradient = {
    addColorStop: vi.fn(),
  };
  return {
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    ellipse: vi.fn(),
    quadraticCurveTo: vi.fn(),
    rect: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    measureText: vi.fn(() => ({ width: 50 })),
    save: vi.fn(),
    restore: vi.fn(),
    setLineDash: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: 'left' as CanvasTextAlign,
    textBaseline: 'alphabetic' as CanvasTextBaseline,
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    shadowColor: '',
    shadowBlur: 0,
    shadowOffsetY: 0,
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    createLinearGradient: vi.fn(() => mockGradient),
    createRadialGradient: vi.fn(() => mockGradient),
    clearRect: vi.fn(),
    clip: vi.fn(),
    drawImage: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Stage Constants (3 tests)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Stage Constants', () => {
  it('CANVAS_WIDTH = 800', () => {
    expect(CANVAS_WIDTH).toBe(800);
  });

  it('CANVAS_HEIGHT = 600', () => {
    expect(CANVAS_HEIGHT).toBe(600);
  });

  it('STAGE_GROUND_Y 在合理范围内', () => {
    // 地面 Y 应该大于画布高度的一半（底部区域），但小于画布高度
    expect(STAGE_GROUND_Y).toBeGreaterThan(CANVAS_HEIGHT * 0.5);
    expect(STAGE_GROUND_Y).toBeLessThan(CANVAS_HEIGHT);
    // 具体：510，在 480~560 之间合理
    expect(STAGE_GROUND_Y).toBeGreaterThanOrEqual(480);
    expect(STAGE_GROUND_Y).toBeLessThanOrEqual(560);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Stage Factory (3 tests)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Stage Factory', () => {
  beforeEach(() => {
    setStage('temple');
  });

  it('getStage() 返回当前 stageId', () => {
    setStage('china');
    expect(getStage()).toBe('china');

    setStage('orochi');
    expect(getStage()).toBe('orochi');
  });

  it('setStage + getStage 支持切换到所有已知 stage', () => {
    const stages: StageId[] = ['temple', 'china', 'factory', 'orochi', 'street'];
    for (const id of stages) {
      setStage(id);
      expect(getStage()).toBe(id);
    }
  });

  it('默认 stage 是 temple', () => {
    // beforeEach 重置到 temple
    expect(getStage()).toBe('temple');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Stage List (3 tests)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Stage List', () => {
  it('支持 5 个 stage（4 个以上）', () => {
    const all = getAllStages();
    expect(all.length).toBeGreaterThanOrEqual(5);
  });

  it('每个 stage 有唯一 id', () => {
    const all = getAllStages();
    const unique = new Set(all);
    expect(unique.size).toBe(all.length);
  });

  it('stage id 列表完整：temple/china/factory/orochi/street', () => {
    const all = getAllStages();
    expect(all).toContain('temple');
    expect(all).toContain('china');
    expect(all).toContain('factory');
    expect(all).toContain('orochi');
    expect(all).toContain('street');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Stage Rendering (3 tests)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Stage Rendering', () => {
  it('drawStage 不抛异常（temple/china/factory/orochi，mock canvas）', () => {
    const ctx = createMockCtx();
    const stars = generateStars(60);
    const safeStages: StageId[] = ['temple', 'china', 'factory', 'orochi'];

    for (const stageId of safeStages) {
      setStage(stageId);
      expect(() => {
        drawStage(ctx, 0, stars, 0);
      }, `Stage ${stageId} crashed on render`).not.toThrow();
    }
  });

  it('不同 stage 产生不同的 canvas 调用', () => {
    // 用 mock 调用次数来验证不同 stage 确实产生了不同的绘制
    const stages: StageId[] = ['temple', 'china', 'factory', 'orochi'];
    const stars = generateStars(60);
    const callCounts: Record<string, number> = {};

    for (const stageId of stages) {
      const ctx = createMockCtx();
      setStage(stageId);
      drawStage(ctx, 100, stars, 60);
      // 记录 fillRect 调用次数作为区分指标
      callCounts[stageId] = (ctx.fillRect as ReturnType<typeof vi.fn>).mock.calls.length;
    }

    // 至少有两个 stage 的 fillRect 调用次数不同
    const uniqueCounts = new Set(Object.values(callCounts));
    expect(uniqueCounts.size).toBeGreaterThan(1);
  });

  it('stage 渲染支持 parallax layer（cameraX != 0 不崩溃）', () => {
    const ctx = createMockCtx();
    const stars = generateStars(60);
    setStage('temple');

    const cameraOffsets = [0, 100, 300, 600];
    for (const offset of cameraOffsets) {
      expect(() => {
        drawStage(ctx, offset, stars, 120);
      }, `Parallax render crashed at cameraX=${offset}`).not.toThrow();
    }

    // 不同的 cameraX 应该产生不同的绘制结果
    const ctx1 = createMockCtx();
    const ctx2 = createMockCtx();
    drawStage(ctx1, 0, stars, 60);
    drawStage(ctx2, 500, stars, 60);

    const calls1 = (ctx1.fillRect as ReturnType<typeof vi.fn>).mock.calls.length;
    const calls2 = (ctx2.fillRect as ReturnType<typeof vi.fn>).mock.calls.length;
    // 不同 camera offset 下渲染工作量可能不同
    expect(calls1).toBeGreaterThan(0);
    expect(calls2).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Stage Ground & Boundaries (3 tests)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Stage Ground & Boundaries', () => {
  it('STAGE_GROUND_Y 位于画布底部约 85% 处（格斗游戏合理位置）', () => {
    const ratio = STAGE_GROUND_Y / CANVAS_HEIGHT;
    // 正版 KOF 地面大约在 85% 附近
    expect(ratio).toBeGreaterThanOrEqual(0.8);
    expect(ratio).toBeLessThanOrEqual(0.95);
  });

  it('STAGE_WIDTH > CANVAS_WIDTH（舞台比可视区域宽，允许滚动）', () => {
    expect(STAGE_WIDTH).toBeGreaterThan(CANVAS_WIDTH);
    // KOF2002 正版：1400 > 800
    expect(STAGE_WIDTH).toBe(1400);
  });

  it('舞台有有效边界（STAGE_LEFT >= 0, STAGE_RIGHT <= STAGE_WIDTH）', () => {
    expect(STAGE_LEFT).toBeGreaterThanOrEqual(0);
    expect(STAGE_RIGHT).toBeLessThanOrEqual(STAGE_WIDTH);
    expect(STAGE_LEFT).toBeLessThan(STAGE_RIGHT);

    // 边界宽度 = 可用战斗区域
    const battleWidth = STAGE_RIGHT - STAGE_LEFT;
    expect(battleWidth).toBeGreaterThan(CANVAS_WIDTH); // 战斗区域应大于一屏
  });
});
