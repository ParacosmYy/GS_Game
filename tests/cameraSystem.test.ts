/**
 * Camera System Tests — KOF2002 摄像机跟踪 + ScreenShake
 *
 * 摄像机系统由两个模块协作：
 *   1. Camera (src/core/camera.ts) — 跟踪两个 fighter 的中点，平滑插值，边界钳制
 *   2. ScreenShake (src/rendering/vfx.ts) — 命中/KO 震屏，方向性偏移，确定性衰减
 *
 * 当前 Camera 只实现了水平跟踪 + lerp 平滑；zoom / KO 特写尚未实现。
 * 测试按实际 API 编写，不测不存在的功能。
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
    // 摄像机居中于 x=400，所以 screenX(400) ≈ CANVAS_WIDTH/2
    expect(cam.worldToScreen(400)).toBeCloseTo(CANVAS_WIDTH / 2, 1);
  });

  it('世界坐标 0 映射到 -cam.x', () => {
    const cam = new Camera();
    const a = makeFighter(600);
    const b = makeFighter(600);
    for (let i = 0; i < 100; i++) cam.update(a, b);
    expect(cam.worldToScreen(0)).toBeCloseTo(-cam.x, 4);
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
    expect(screenR - screenL).toBeCloseTo(right.x - left.x, 1);
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
