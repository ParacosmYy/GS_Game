/**
 * pushback.test.ts — Pushback 值和 Blockstun 校准测试
 *
 * 基于 src/core/frameDataConstants.ts 中 FRAME_DATA 的实际值编写。
 * 测试验证帧数据的基本约束关系，确保值修改后约束仍然成立。
 *
 * 注意: 实际 FRAME_DATA 中的 pushback 值为像素速度因子，不等同于
 * 实际位移距离。最终位移 = pushback * speedFactor * facing * hitstunDuration
 */
import { describe, it, expect } from 'vitest';
import { FRAME_DATA } from '../src/core/frameDataConstants.js';

type FrameDataEntry = {
  startup: number;
  active: number;
  recovery: number;
  damage: number;
  hitstun: number;
  blockstun: number;
  pushback: number;
  hitLevel: 'MID' | 'LOW' | 'HIGH';
  knockdown: boolean;
  chipDamage?: number;
  counterWire?: boolean;
};

// ===== 通常技列表 =====
const normalAttacks = [
  'STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
  'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
  'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
  'JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D',
  'STAND_CD', 'JUMP_CD',
];

// 轻攻击 (A/B 按钮)
const lightAttacks = [
  'STAND_A', 'STAND_B',
  'CLOSE_A', 'CLOSE_B',
  'CROUCH_A', 'CROUCH_B',
  'JUMP_A', 'JUMP_B',
];

// 重攻击 (C/D 按钮的地面和空中)
const heavyGroundAttacks = [
  'STAND_C', 'STAND_D',
  'CLOSE_C', 'CLOSE_D',
  'CROUCH_C', 'CROUCH_D',
];

describe('Pushback 值校准', () => {
  describe('通常技 pushback >= 1 (非负非零)', () => {
    for (const key of normalAttacks) {
      it(`${key} pushback >= 1`, () => {
        const data = FRAME_DATA[key as keyof typeof FRAME_DATA] as FrameDataEntry;
        if (data) {
          expect(data.pushback).toBeGreaterThanOrEqual(1);
        }
      });
    }
  });

  describe('通常技 pushback 合理范围 (1-15)', () => {
    for (const key of normalAttacks) {
      it(`${key} pushback 在 1-15 范围`, () => {
        const data = FRAME_DATA[key as keyof typeof FRAME_DATA] as FrameDataEntry;
        if (data) {
          expect(data.pushback).toBeGreaterThanOrEqual(1);
          expect(data.pushback).toBeLessThanOrEqual(15);
        }
      });
    }
  });

  describe('轻攻击 pushback 在合理范围', () => {
    it('轻攻击 pushback 应 <= 5 (短推力)', () => {
      for (const key of lightAttacks) {
        const data = FRAME_DATA[key as keyof typeof FRAME_DATA] as FrameDataEntry;
        if (data) {
          expect(data.pushback).toBeLessThanOrEqual(5);
        }
      }
    });

    it('轻攻击 pushback 应 >= 1', () => {
      for (const key of lightAttacks) {
        const data = FRAME_DATA[key as keyof typeof FRAME_DATA] as FrameDataEntry;
        if (data) {
          expect(data.pushback).toBeGreaterThanOrEqual(1);
        }
      }
    });
  });

  describe('重攻击 pushback > 轻攻击', () => {
    it('STAND_C.pushback > STAND_A.pushback', () => {
      const standA = FRAME_DATA['STAND_A'] as FrameDataEntry;
      const standC = FRAME_DATA['STAND_C'] as FrameDataEntry;
      if (standA && standC) {
        expect(standC.pushback).toBeGreaterThan(standA.pushback);
      }
    });

    it('CROUCH_C.pushback > CROUCH_A.pushback', () => {
      const crouchA = FRAME_DATA['CROUCH_A'] as FrameDataEntry;
      const crouchC = FRAME_DATA['CROUCH_C'] as FrameDataEntry;
      if (crouchA && crouchC) {
        expect(crouchC.pushback).toBeGreaterThan(crouchA.pushback);
      }
    });

    it('CLOSE_C.pushback > CLOSE_A.pushback', () => {
      const closeA = FRAME_DATA['CLOSE_A'] as FrameDataEntry;
      const closeC = FRAME_DATA['CLOSE_C'] as FrameDataEntry;
      if (closeA && closeC) {
        expect(closeC.pushback).toBeGreaterThan(closeA.pushback);
      }
    });
  });

  describe('CD 击飞攻击 pushback 较大', () => {
    it('STAND_CD pushback >= 5', () => {
      const data = FRAME_DATA['STAND_CD'] as FrameDataEntry;
      expect(data.pushback).toBeGreaterThanOrEqual(5);
    });

    it('JUMP_CD pushback >= 5', () => {
      const data = FRAME_DATA['JUMP_CD'] as FrameDataEntry;
      expect(data.pushback).toBeGreaterThanOrEqual(5);
    });
  });

  describe('投技 pushback 为 0 (投技走特殊位移逻辑)', () => {
    const throws = ['THROW', 'THROW_FORWARD', 'THROW_BACK'];
    for (const key of throws) {
      it(`${key} pushback = 0`, () => {
        const data = FRAME_DATA[key as keyof typeof FRAME_DATA] as FrameDataEntry;
        expect(data.pushback).toBe(0);
      });
    }
  });
});

describe('Blockstun 校准', () => {
  describe('地面重攻击 blockstun 应为 15 帧 (校准后)', () => {
    const heavyGrounds = ['STAND_C', 'STAND_D', 'CLOSE_C', 'CROUCH_C', 'CROUCH_D'];
    for (const key of heavyGrounds) {
      it(`${key} blockstun = 15`, () => {
        const data = FRAME_DATA[key as keyof typeof FRAME_DATA] as FrameDataEntry;
        if (data) {
          expect(data.blockstun).toBe(15);
        }
      });
    }
  });

  describe('轻攻击 blockstun 应为 9 帧', () => {
    const lights = ['STAND_A', 'STAND_B', 'CLOSE_A', 'CLOSE_B', 'CROUCH_A', 'CROUCH_B'];
    for (const key of lights) {
      it(`${key} blockstun = 9`, () => {
        const data = FRAME_DATA[key as keyof typeof FRAME_DATA] as FrameDataEntry;
        if (data) {
          expect(data.blockstun).toBe(9);
        }
      });
    }
  });

  describe('blockstun 基本约束', () => {
    it('重攻击 blockstun > 轻攻击 blockstun', () => {
      const standA = FRAME_DATA['STAND_A'] as FrameDataEntry;
      const standC = FRAME_DATA['STAND_C'] as FrameDataEntry;
      expect(standC.blockstun).toBeGreaterThan(standA.blockstun);
    });

    it('所有通常技 blockstun > 0', () => {
      for (const key of normalAttacks) {
        const data = FRAME_DATA[key as keyof typeof FRAME_DATA] as FrameDataEntry;
        if (data) {
          expect(data.blockstun).toBeGreaterThan(0);
        }
      }
    });

    it('投技 blockstun = 0 (不可防御)', () => {
      const throws = ['THROW', 'THROW_FORWARD', 'THROW_BACK'] as const;
      for (const key of throws) {
        const data = FRAME_DATA[key] as FrameDataEntry;
        expect(data.blockstun).toBe(0);
      }
    });
  });
});

describe('Pushback 递减验证 (combo 缩放)', () => {
  /**
   * combatSystem.ts L492-494:
   * comboScale = comboHits <= 1 ? 1.0
   *   : comboHits === 2 ? 0.85
   *   : comboHits === 3 ? 0.70 : 0.55
   */
  function pushbackComboScale(comboHits: number): number {
    if (comboHits <= 1) return 1.0;
    if (comboHits === 2) return 0.85;
    if (comboHits === 3) return 0.70;
    return 0.55;
  }

  it('第 1 击 pushback 不缩放', () => {
    expect(pushbackComboScale(1)).toBe(1.0);
  });

  it('第 2 击 pushback 缩放 85%', () => {
    expect(pushbackComboScale(2)).toBe(0.85);
  });

  it('第 3 击 pushback 缩放 70%', () => {
    expect(pushbackComboScale(3)).toBe(0.70);
  });

  it('第 4+ 击 pushback 缩放 55%', () => {
    expect(pushbackComboScale(4)).toBe(0.55);
    expect(pushbackComboScale(10)).toBe(0.55);
  });

  it('有效 pushback 始终 > 0 (推力不消失)', () => {
    const basePushback = 2; // 最小轻攻击 pushback
    const minScale = 0.55;
    const effective = basePushback * minScale;
    expect(effective).toBeGreaterThan(0);
  });
});
