import { describe, it, expect } from 'vitest';
import { ATTACK_FRAMES } from '../src/core/attackFrames.js';
import { AttackType } from '../src/core/types.js';

describe('逐帧判定框数据 (AttackFrames)', () => {
  it('所有已定义攻击应该有非空帧数据', () => {
    for (const [key, frames] of Object.entries(ATTACK_FRAMES)) {
      expect(frames.length, `${key} 应该有至少1帧`).toBeGreaterThan(0);
      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        expect(frame.attack.length, `${key} 第${i}帧应该有至少1个攻击框`).toBeGreaterThan(0);
        for (const box of frame.attack) {
          expect(box.w, `${key} 第${i}帧攻击框宽度应该>0`).toBeGreaterThan(0);
          expect(box.h, `${key} 第${i}帧攻击框高度应该>0`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('基本攻击类型都应该有逐帧数据', () => {
    const requiredAttacks = [
      AttackType.STAND_A, AttackType.STAND_B, AttackType.STAND_C, AttackType.STAND_D,
      AttackType.CLOSE_A, AttackType.CLOSE_B, AttackType.CLOSE_C, AttackType.CLOSE_D,
      AttackType.CROUCH_A, AttackType.CROUCH_B, AttackType.CROUCH_C, AttackType.CROUCH_D,
      AttackType.JUMP_A, AttackType.JUMP_B, AttackType.JUMP_C, AttackType.JUMP_D,
      AttackType.THROW,
      AttackType.STAND_CD, AttackType.JUMP_CD,
    ];
    for (const atk of requiredAttacks) {
      expect(ATTACK_FRAMES[atk], `${atk} 应该有逐帧数据`).toBeDefined();
    }
  });

  it('升龙拳前两帧应该有受击框缩小', () => {
    const frames = ATTACK_FRAMES[AttackType.SPECIAL_UPPER];
    expect(frames).toBeDefined();
    expect(frames![0].bodyOverride).not.toBeNull();
    expect(frames![1].bodyOverride).not.toBeNull();
    // 后续帧应该恢复默认（无覆盖）
    expect(frames![2].bodyOverride).toBeNull();
  });

  it('蹲重脚应该有受击框缩小（低姿扫堂腿）', () => {
    const frames = ATTACK_FRAMES[AttackType.CROUCH_D];
    expect(frames).toBeDefined();
    // 至少前3帧应该有 bodyOverride
    expect(frames![0].bodyOverride).not.toBeNull();
    expect(frames![2].bodyOverride).not.toBeNull();
  });

  it('DM超必杀技应该有较长的帧序列', () => {
    const dmOrochinagi = ATTACK_FRAMES[AttackType.DM_OROCHINAGI];
    expect(dmOrochinagi).toBeDefined();
    expect(dmOrochinagi!.length).toBeGreaterThanOrEqual(20);
  });

  it('攻击框应该有合理的坐标范围', () => {
    for (const [key, frames] of Object.entries(ATTACK_FRAMES)) {
      for (let i = 0; i < frames.length; i++) {
        for (const box of frames[i].attack) {
          // 攻击框不应该太大
          expect(box.w, `${key}[${i}] 宽度不应超过 200`).toBeLessThanOrEqual(200);
          expect(box.h, `${key}[${i}] 高度不应超过 200`).toBeLessThanOrEqual(200);
          // 攻击框不应该离角色太远
          expect(Math.abs(box.ox), `${key}[${i}] X偏移不应超过 150`).toBeLessThanOrEqual(150);
          expect(box.oy, `${key}[${i}] Y偏移应在 -150~50 之间`).toBeGreaterThanOrEqual(-150);
          expect(box.oy, `${key}[${i}] Y偏移应在 -150~50 之间`).toBeLessThanOrEqual(50);
        }
      }
    }
  });
});
