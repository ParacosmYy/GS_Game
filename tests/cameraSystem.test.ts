/**
 * Camera System Tests — KOF2002 摄像机跟踪 + Zoom + KO特写 + ScreenShake
 *
 * 摄像机系统由两个模块协作：
 *   1. Camera (src/core/camera.ts) — 跟踪两个 fighter 的中点，距离驱动zoom，KO特写，平滑插值，边界钳制
 *   2. ScreenShake (src/rendering/vfx.ts) — 命中/KO 震屏，方向性偏移，确定性衰减
 *
 * Camera 已实现：水平跟踪 + lerp 平滑 + 距离驱动 zoom + KO zoom 特写。
 */
import { describe, it, expect } from 'vitest';
import { Camera } from '../src/core/camera.js';
import { ScreenShake } from '../src/rendering/vfx.js';
import { CANVAS_WIDTH, STAGE_WIDTH } from '../src/core/constants.js';
import {
  SHAKE_LIGHT,
  SHAKE_HEAVY,
  SHAKE_COUNTER,
  SHAKE_SPECIAL,
  SHAKE_DM,
  SHAKE_KO,
  SHAKE_DURATION_LIGHT,
  SHAKE_DURATION_HEAVY,
  SHAKE_DURATION_SPECIAL,
  SHAKE_DURATION_DM,
  SHAKE_DURATION_KO,
  getShakeIntensity,
  getShakeDuration,
} from '../src/core/constants.js';

// ---------------------------------------------------------------------------
// Fighter stub — 最小化 mock，只提供 Camera.update 需要的 x 属性
// ---------------------------------------------------------------------------
function makeFighter(x: number) {
  return { x } as any;
}

// ===================== 1. 基础跟踪 (5 tests) =====================
describe('Camera — 基础跟踪', () => {
  it('摄像机跟随两个 fighter 的中点', () => {
    const cam = new Camera();
    const a = makeFighter(300);
    const b = makeFighter(700);
    // 多次 update 让 lerp 收敛
    for (let i = 0; i < 100; i++) cam.update(a, b);
    const expectedTarget = (300 + 700) / 2 - CANVAS_WIDTH / 2;
    expect(cam.x).toBeCloseTo(expectedTarget, 1);
  });

  it('两个角色重叠时摄像机居中', () => {
    const cam = new Camera();
    const a = makeFighter(500);
    const b = makeFighter(500);
    for (let i = 0; i < 100; i++) cam.update(a, b);
    const expectedTarget = 500 - CANVAS_WIDTH / 2;
    expect(cam.x).toBeCloseTo(expectedTarget, 1);
  });

  it('角色移动时摄像机平滑跟随（lerp，不瞬移）', () => {
    const cam = new Camera();
    const a = makeFighter(400);
    const b = makeFighter(400);
    // 先让摄像机收敛到初始位置
    for (let i = 0; i < 100; i++) cam.update(a, b);
    const prevX = cam.x;

    // 角色突然移动
    a.x = 900;
    b.x = 900;
    cam.update(a, b);

    // 摄像机应该向目标移动但没有一步到位
    const newTarget = 900 - CANVAS_WIDTH / 2;
    expect(cam.x).not.toBeCloseTo(newTarget, 1); // 还没到
    expect(cam.x).toBeGreaterThan(prevX);         // 方向正确
    // lerp 系数 0.15，所以位移 = diff * 0.15
    const diff = newTarget - prevX;
    expect(cam.x).toBeCloseTo(prevX + diff * 0.15, 4);
  });

  it('摄像机不能超出舞台左边界', () => {
    const cam = new Camera();
    const a = makeFighter(50);
    const b = makeFighter(50);
    for (let i = 0; i < 100; i++) cam.update(a, b);
    expect(cam.x).toBeGreaterThanOrEqual(0);
  });

  it('摄像机不能超出舞台右边界', () => {
    const cam = new Camera();
    const a = makeFighter(STAGE_WIDTH - 50);
    const b = makeFighter(STAGE_WIDTH - 50);
    for (let i = 0; i < 100; i++) cam.update(a, b);
    expect(cam.x).toBeLessThanOrEqual(STAGE_WIDTH - CANVAS_WIDTH);
  });
});

// ===================== 2. worldToScreen 坐标转换 (3 tests) =====================
describe('Camera — worldToScreen', () => {
  it('世界坐标正确转换为屏幕坐标', () => {
    const cam = new Camera();
    const a = makeFighter(400);
    const b = makeFighter(400);
    for (let i = 0; i < 100; i++) cam.update(a, b);
    // 摄像机居中于 x=400，screenX(400) = (400 - cam.x) * zoom
    // cam.x ≈ 0 (clamped), zoom ≈ 1.15 (角色重叠)
    expect(cam.worldToScreen(400)).toBeCloseTo((400 - cam.x) * cam.zoom, 2);
  });

  it('世界坐标 0 映射到 -cam.x * zoom', () => {
    const cam = new Camera();
    const a = makeFighter(600);
    const b = makeFighter(600);
    for (let i = 0; i < 100; i++) cam.update(a, b);
    // worldToScreen(0) = (0 - cam.x) * zoom
    expect(cam.worldToScreen(0)).toBeCloseTo(-cam.x * cam.zoom, 4);
  });

  it('摄像机左边和右边角色都在屏幕可见范围内', () => {
    const cam = new Camera();
    const leftFighter = makeFighter(300);
    const rightFighter = makeFighter(700);
    for (let i = 0; i < 100; i++) cam.update(leftFighter, rightFighter);
    const screenA = cam.worldToScreen(300);
    const screenB = cam.worldToScreen(700);
    expect(screenA).toBeGreaterThanOrEqual(0);
    expect(screenA).toBeLessThanOrEqual(CANVAS_WIDTH);
    expect(screenB).toBeGreaterThanOrEqual(0);
    expect(screenB).toBeLessThanOrEqual(CANVAS_WIDTH);
  });
});

// ===================== 3. Screen Shake — 触发与衰减 (4 tests) =====================
describe('ScreenShake — 触发与衰减', () => {
  it('命中时触发 shake，offset 不为零', () => {
    const shake = new ScreenShake();
    shake.trigger(SHAKE_HEAVY, SHAKE_DURATION_HEAVY, 1);
    shake.update();
    // 第一帧应该有偏移
    expect(Math.abs(shake.offsetX)).toBeGreaterThan(0);
  });

  it('shake 强度与攻击力度成正比（heavy > light）', () => {
    const shakeLight = new ScreenShake();
    const shakeHeavy = new ScreenShake();
    shakeLight.trigger(SHAKE_LIGHT, SHAKE_DURATION_LIGHT, 1);
    shakeHeavy.trigger(SHAKE_HEAVY, SHAKE_DURATION_HEAVY, 1);
    shakeLight.update();
    shakeHeavy.update();
    // heavy 的偏移绝对值应该大于 light
    expect(Math.abs(shakeHeavy.offsetX)).toBeGreaterThan(Math.abs(shakeLight.offsetX));
  });

  it('shake 随时间衰减至零', () => {
    const shake = new ScreenShake();
    shake.trigger(SHAKE_SPECIAL, SHAKE_DURATION_SPECIAL, 1);
    // 运行完所有持续帧
    for (let i = 0; i < SHAKE_DURATION_SPECIAL; i++) shake.update();
    expect(shake.offsetX).toBe(0);
    expect(shake.offsetY).toBe(0);
  });

  it('DM shake 比 special 更强', () => {
    const shakeSpecial = new ScreenShake();
    const shakeDM = new ScreenShake();
    shakeSpecial.trigger(SHAKE_SPECIAL, SHAKE_DURATION_SPECIAL, 1);
    shakeDM.trigger(SHAKE_DM, SHAKE_DURATION_DM, 1);
    shakeSpecial.update();
    shakeDM.update();
    expect(Math.abs(shakeDM.offsetX)).toBeGreaterThan(Math.abs(shakeSpecial.offsetX));
  });
});

// ===================== 4. Screen Shake — 确定性 (2 tests) =====================
describe('ScreenShake — 确定性（无随机性）', () => {
  it('相同输入产生完全相同的 shake 序列', () => {
    const shake1 = new ScreenShake();
    const shake2 = new ScreenShake();
    shake1.trigger(SHAKE_HEAVY, SHAKE_DURATION_HEAVY, 1);
    shake2.trigger(SHAKE_HEAVY, SHAKE_DURATION_HEAVY, 1);
    for (let i = 0; i < SHAKE_DURATION_HEAVY; i++) {
      shake1.update();
      shake2.update();
      expect(shake1.offsetX).toBe(shake2.offsetX);
      expect(shake1.offsetY).toBe(shake2.offsetY);
    }
  });

  it('不同 biasX 方向产生不同水平偏移符号', () => {
    const shakeRight = new ScreenShake();
    const shakeLeft = new ScreenShake();
    shakeRight.trigger(SHAKE_HEAVY, SHAKE_DURATION_HEAVY, 1);
    shakeLeft.trigger(SHAKE_HEAVY, SHAKE_DURATION_HEAVY, -1);
    shakeRight.update();
    shakeLeft.update();
    // 第一帧偏移方向应跟随 biasX
    expect(shakeRight.offsetX).toBeGreaterThan(0);
    expect(shakeLeft.offsetX).toBeLessThan(0);
  });
});

// ===================== 5. Screen Shake — 分层常量一致性 (2 tests) =====================
describe('ScreenShake — 分层常量一致性', () => {
  it('KO shake 是最强震动', () => {
    expect(SHAKE_KO).toBeGreaterThan(SHAKE_DM);
    expect(SHAKE_KO).toBeGreaterThan(SHAKE_SPECIAL);
    expect(SHAKE_KO).toBeGreaterThan(SHAKE_HEAVY);
    expect(SHAKE_KO).toBeGreaterThan(SHAKE_LIGHT);
  });

  it('KO shake 持续时间最长', () => {
    expect(SHAKE_DURATION_KO).toBeGreaterThan(SHAKE_DURATION_DM);
    expect(SHAKE_DURATION_DM).toBeGreaterThan(SHAKE_DURATION_SPECIAL);
    expect(SHAKE_DURATION_SPECIAL).toBeGreaterThan(SHAKE_DURATION_HEAVY);
    expect(SHAKE_DURATION_HEAVY).toBeGreaterThan(SHAKE_DURATION_LIGHT);
  });
});

// ===================== 6. getShakeIntensity / getShakeDuration 一致性 (3 tests) =====================
describe('getShakeIntensity / getShakeDuration — 辅助函数', () => {
  it('DM 攻击返回 DM 级 shake', () => {
    expect(getShakeIntensity('DM_HADOU', 100, false)).toBe(SHAKE_DM);
    expect(getShakeDuration('DM_HADOU')).toBe(SHAKE_DURATION_DM);
  });

  it('重攻击返回 heavy 级 shake', () => {
    expect(getShakeIntensity('STAND_C', 80, false)).toBe(SHAKE_HEAVY);
    expect(getShakeDuration('STAND_C')).toBe(SHAKE_DURATION_HEAVY);
  });

  it('Counter Hit 使用 counter shake 强度', () => {
    // 轻攻击 + counter 使用 SHAKE_COUNTER (不是 SHAKE_LIGHT)
    expect(getShakeIntensity('STAND_A', 30, true)).toBe(SHAKE_COUNTER);
    // 非counter轻攻击使用 SHAKE_LIGHT
    expect(getShakeIntensity('STAND_A', 30, false)).toBe(SHAKE_LIGHT);
  });
});

// ===================== 7. 边界条件 (3 tests) =====================
describe('Camera — 边界条件', () => {
  it('两个角色在舞台两端时摄像机居中（无 zoom 时间距超 canvas 会溢出）', () => {
    const cam = new Camera();
    const left = makeFighter(STAGE_WIDTH * 0.15);  // ~210
    const right = makeFighter(STAGE_WIDTH * 0.85);  // ~1190
    for (let i = 0; i < 100; i++) cam.update(left, right);
    // 摄像机应居中于两角色中点
    const midWorld = (left.x + right.x) / 2;
    const expectedTarget = Math.max(0, Math.min(midWorld - CANVAS_WIDTH / 2, STAGE_WIDTH - CANVAS_WIDTH));
    expect(cam.x).toBeCloseTo(expectedTarget, 1);
    // 间距 980 > CANVAS_WIDTH 800，所以至少一人会溢出屏幕
    const screenL = cam.worldToScreen(left.x);
    const screenR = cam.worldToScreen(right.x);
    // screenR - screenL = (right.x - left.x) * zoom (zoom < 1.0 for far fighters)
    expect(screenR - screenL).toBeCloseTo((right.x - left.x) * cam.zoom, 1);
  });

  it('版边时摄像机不超出边界', () => {
    const cam = new Camera();
    // 两个角色都贴右边
    const a = makeFighter(STAGE_WIDTH - 40);
    const b = makeFighter(STAGE_WIDTH - 40);
    for (let i = 0; i < 100; i++) cam.update(a, b);
    const maxCamX = STAGE_WIDTH - CANVAS_WIDTH;
    expect(cam.x).toBeLessThanOrEqual(maxCamX);
    expect(cam.x).toBeGreaterThanOrEqual(0);
  });

  it('超高速移动时摄像机不丢失（最终收敛）', () => {
    const cam = new Camera();
    const a = makeFighter(100);
    const b = makeFighter(100);
    // 先在左侧收敛
    for (let i = 0; i < 100; i++) cam.update(a, b);

    // 瞬间移到右侧很远
    a.x = STAGE_WIDTH - 100;
    b.x = STAGE_WIDTH - 100;

    // 给足够的帧数收敛
    for (let i = 0; i < 300; i++) cam.update(a, b);

    const expectedTarget = (STAGE_WIDTH - 100) - CANVAS_WIDTH / 2;
    const clampedTarget = Math.max(0, Math.min(expectedTarget, STAGE_WIDTH - CANVAS_WIDTH));
    expect(cam.x).toBeCloseTo(clampedTarget, 1);
  });
});

// ===================== 8. Zoom — 距离驱动 (4 tests) =====================
describe('Camera — Zoom 距离驱动', () => {
  it('角色靠近时 zoom > 1.0', () => {
    const cam = new Camera();
    const a = makeFighter(400);
    const b = makeFighter(440); // distance = 40, less than DISTANCE_MIN(80)
    for (let i = 0; i < 200; i++) cam.update(a, b);
    expect(cam.zoom).toBeGreaterThan(1.0);
  });

  it('角色远离时 zoom < 1.0', () => {
    const cam = new Camera();
    const a = makeFighter(100);
    const b = makeFighter(100 + CANVAS_WIDTH); // distance = CANVAS_WIDTH => far
    for (let i = 0; i < 200; i++) cam.update(a, b);
    expect(cam.zoom).toBeLessThan(1.0);
  });

  it('角色重叠时 zoom 接近 ZOOM_MAX (1.15)', () => {
    const cam = new Camera();
    const a = makeFighter(500);
    const b = makeFighter(500); // distance = 0
    for (let i = 0; i < 200; i++) cam.update(a, b);
    expect(cam.zoom).toBeCloseTo(1.15, 1);
  });

  it('角色在两端时 zoom 接近 ZOOM_MIN (0.9)', () => {
    const cam = new Camera();
    const a = makeFighter(100);
    const b = makeFighter(100 + CANVAS_WIDTH); // distance >= DISTANCE_MAX
    for (let i = 0; i < 200; i++) cam.update(a, b);
    expect(cam.zoom).toBeCloseTo(0.9, 1);
  });
});

// ===================== 9. KO Zoom (4 tests) =====================
describe('Camera — KO Zoom', () => {
  it('triggerKOZoom 激活 KO zoom 状态', () => {
    const cam = new Camera();
    const a = makeFighter(400);
    const b = makeFighter(600);
    for (let i = 0; i < 100; i++) cam.update(a, b);

    const zoomBeforeTrigger = cam.zoom;
    cam.triggerKOZoom(500, 300);

    // KO 触发后，下一次 update 应该进入 KO 分支（不再按 fighter 位置计算）
    // 先记录 KO 前的位置
    const xBeforeKO = cam.x;

    // KO 期间 update 不应按 fighter 中点移动
    a.x = 100;
    b.x = 100;
    cam.update(a, b);

    // 摄像机应该朝 KO 目标移动，而不是朝 fighter 新位置
    // KO 目标 X = 500 - CANVAS_WIDTH/2 = 100
    // lerp 使 x 向 100 靠近
    expect(cam.x).not.toBeCloseTo((100 + 100) / 2 - CANVAS_WIDTH / 2, 0);
  });

  it('KO 期间 zoom 逐渐接近 ZOOM_KO (1.3)', () => {
    const cam = new Camera();
    const a = makeFighter(400);
    const b = makeFighter(600);
    for (let i = 0; i < 100; i++) cam.update(a, b);

    cam.triggerKOZoom(500, 300);

    // KO duration = 60 帧，在 KO 期间 zoom 应该朝 1.3 增长
    // 跑 55 帧（仍在 KO 期间）
    for (let i = 0; i < 55; i++) cam.update(a, b);

    // zoom 应该大于 KO 前的值（靠近时约 1.1），朝 1.3 增长
    expect(cam.zoom).toBeGreaterThan(1.15);
  });

  it('KO timer 倒计到 0 后恢复普通模式', () => {
    const cam = new Camera();
    const a = makeFighter(400);
    const b = makeFighter(600);
    for (let i = 0; i < 100; i++) cam.update(a, b);

    cam.triggerKOZoom(500, 300);

    // 消耗掉全部 60 帧 KO duration
    for (let i = 0; i < 60; i++) cam.update(a, b);

    // KO 应该结束，后续 update 按正常距离计算
    // 设置角色靠近
    a.x = 500;
    b.x = 500;
    for (let i = 0; i < 200; i++) cam.update(a, b);

    // zoom 应该回落到距离驱动的值（靠近时 > 1.0，但不是 1.3）
    expect(cam.zoom).toBeGreaterThan(1.0);
    expect(cam.zoom).toBeLessThan(1.25);
  });

  it('KO 后 zoom 回到 1.0（角色中等距离时）', () => {
    const cam = new Camera();
    const a = makeFighter(300);
    const b = makeFighter(700);
    for (let i = 0; i < 100; i++) cam.update(a, b);

    cam.triggerKOZoom(500, 300);

    // 消耗 KO duration
    for (let i = 0; i < 60; i++) cam.update(a, b);

    // 中等距离 ~400，应该在 1.0 附近
    // zoom target = ZOOM_MAX - t*(ZOOM_MAX - ZOOM_MIN)
    // t = (400 - 80) / (800 - 80) ≈ 0.444
    // target = 1.15 - 0.444 * 0.25 ≈ 1.039
    for (let i = 0; i < 200; i++) cam.update(a, b);
    expect(cam.zoom).toBeCloseTo(1.039, 1);
  });
});

// ===================== 10. Zoom Lerp 平滑性 (2 tests) =====================
describe('Camera — Zoom Lerp 平滑性', () => {
  it('zoom 变化平滑（不跳变）', () => {
    const cam = new Camera();
    const a = makeFighter(400);
    const b = makeFighter(400);
    // 初始收敛
    for (let i = 0; i < 100; i++) cam.update(a, b);

    // 现在角色靠得很近，zoom 应接近 ZOOM_MAX
    // 突然拉开距离
    b.x = 400 + CANVAS_WIDTH;

    const zoomBefore = cam.zoom;
    cam.update(a, b);
    const zoomAfter = cam.zoom;

    // zoom 不应该一步到位，变化量应很小
    const zoomDelta = Math.abs(zoomAfter - zoomBefore);
    expect(zoomDelta).toBeLessThan(0.1); // lerp 系数 0.08，最多变 ~8%
  });

  it('zoom 收敛到 target 值', () => {
    const cam = new Camera();
    const a = makeFighter(400);
    const b = makeFighter(440);
    // 给足够帧数让 zoom 完全收敛
    for (let i = 0; i < 500; i++) cam.update(a, b);

    // distance = 40 < DISTANCE_MIN => t = 0 => targetZoom = ZOOM_MAX = 1.15
    expect(cam.zoom).toBeCloseTo(1.15, 2);
  });
});
