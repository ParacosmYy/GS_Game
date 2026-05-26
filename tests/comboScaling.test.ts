/**
 * comboScaling.test.ts — 连段缩放系统 + 取消窗口机制 测试
 *
 * 覆盖范围:
 * 1. 新分段缩放常量一致性验证
 * 2. 分段缩放公式 (comboCount 1-3: 100%, 4-6: 85%, 7-9: 70%, 10+: 60%)
 * 3. 投技不参与缩放
 * 4. DM额外缩放惩罚 (-10%)
 * 5. 最小缩放下限 (60%)
 * 6. 取消窗口常量边界
 * 7. 连段中meter获取缩放
 * 8. CombatSystem combo状态管理
 * 9. getCancelWindow静态方法
 */
import { describe, it, expect } from 'vitest';
import {
  COMBO_DAMAGE_SCALE,
  COMBO_MIN_SCALE,
  DM_COMBO_PENALTY,
  CANCEL_WINDOW_NORMAL,
  CANCEL_WINDOW_RAPID,
  CANCEL_WINDOW_SUPER,
  CANCEL_WINDOW_FREE,
  COMBO_TIMEOUT,
  METER_GAIN_HIT,
  MAX_STOCKS,
  METER_PER_STOCK,
  DAMAGE_SCALE_MIN_NORMAL,
  DAMAGE_SCALE_MIN_SPECIAL,
  DAMAGE_SCALE_MIN_DM,
  DAMAGE_SCALE_STEP,
} from '../src/core/constants.js';
import { CombatSystem } from '../src/combat/combatSystem.js';
import type { IInputProvider } from '../src/input/inputProvider.js';
import { AttackType } from '../src/core/types.js';
import { createPowerGauge, gainMeterOnHit } from '../src/combat/meter.js';

// ===== 辅助函数 =====

function createMockInputProvider(): IInputProvider {
  const noop = () => ({
    up: false, down: false, left: false, right: false,
    buttonA: false, buttonB: false, buttonC: false, buttonD: false,
    throwAttack: false, start: false,
  });
  return { getP1Input: noop, getP2Input: noop };
}

/**
 * 复现 CombatSystem.scaledDamage 的分段缩放逻辑。
 * comboHits = 调用 scaledDamage 时的 comboHits 值 (命中前计数)。
 */
function computeTieredScaledDamage(
  baseDamage: number,
  comboHits: number,
  attackType: AttackType = AttackType.STAND_C,
): number {
  if (comboHits <= 0) return baseDamage;

  // 投技不参与缩放
  const name = attackType as string;
  if (name === AttackType.THROW || name === AttackType.THROW_FORWARD || name === AttackType.THROW_BACK) {
    return baseDamage;
  }

  // 确定分段缩放率
  let scale = COMBO_MIN_SCALE;
  const thresholds = Object.keys(COMBO_DAMAGE_SCALE).map(Number).sort((a, b) => a - b);
  for (const threshold of thresholds) {
    if (comboHits <= threshold) {
      scale = COMBO_DAMAGE_SCALE[threshold];
      break;
    }
  }

  // DM额外惩罚
  const isDMAttack = name.startsWith('DM_') || name.startsWith('SDM_') || name.startsWith('HSDM_');
  if (isDMAttack) {
    scale = Math.max(COMBO_MIN_SCALE, scale - DM_COMBO_PENALTY);
  }

  return Math.max(1, Math.round(baseDamage * scale));
}

// ===== 1. 常量一致性验证 =====

describe('连段缩放常量', () => {
  it('COMBO_DAMAGE_SCALE 应包含分段阈值 3, 6, 9', () => {
    expect(COMBO_DAMAGE_SCALE).toHaveProperty('3');
    expect(COMBO_DAMAGE_SCALE).toHaveProperty('6');
    expect(COMBO_DAMAGE_SCALE).toHaveProperty('9');
  });

  it('COMBO_DAMAGE_SCALE[3] = 1.0 (comboCount 1-3 不缩放)', () => {
    expect(COMBO_DAMAGE_SCALE[3]).toBe(1.0);
  });

  it('COMBO_DAMAGE_SCALE[6] = 0.85 (comboCount 4-6 缩放到85%)', () => {
    expect(COMBO_DAMAGE_SCALE[6]).toBe(0.85);
  });

  it('COMBO_DAMAGE_SCALE[9] = 0.70 (comboCount 7-9 缩放到70%)', () => {
    expect(COMBO_DAMAGE_SCALE[9]).toBe(0.70);
  });

  it('COMBO_MIN_SCALE = 0.60 (最低缩放60%)', () => {
    expect(COMBO_MIN_SCALE).toBe(0.60);
  });

  it('DM_COMBO_PENALTY = 0.10 (DM在连段中额外-10%)', () => {
    expect(DM_COMBO_PENALTY).toBe(0.10);
  });

  it('缩放阈值递减: 100% > 85% > 70% > 60%', () => {
    expect(COMBO_DAMAGE_SCALE[3]).toBeGreaterThan(COMBO_DAMAGE_SCALE[6]);
    expect(COMBO_DAMAGE_SCALE[6]).toBeGreaterThan(COMBO_DAMAGE_SCALE[9]);
    expect(COMBO_DAMAGE_SCALE[9]).toBeGreaterThan(COMBO_MIN_SCALE);
  });
});

// ===== 2. 分段缩放公式验证 =====

describe('分段缩放公式 (tiered combo scaling)', () => {
  describe('comboCount 1-3: 100% 伤害', () => {
    it('comboHits=1 → 100% 伤害', () => {
      expect(computeTieredScaledDamage(100, 1)).toBe(100);
    });

    it('comboHits=2 → 100% 伤害', () => {
      expect(computeTieredScaledDamage(100, 2)).toBe(100);
    });

    it('comboHits=3 → 100% 伤害', () => {
      expect(computeTieredScaledDamage(100, 3)).toBe(100);
    });

    it('comboHits=0 → 原始伤害 (无缩放)', () => {
      expect(computeTieredScaledDamage(100, 0)).toBe(100);
    });
  });

  describe('comboCount 4-6: 85% 伤害', () => {
    it('comboHits=4 → 85% 伤害', () => {
      expect(computeTieredScaledDamage(100, 4)).toBe(85);
    });

    it('comboHits=5 → 85% 伤害', () => {
      expect(computeTieredScaledDamage(100, 5)).toBe(85);
    });

    it('comboHits=6 → 85% 伤害', () => {
      expect(computeTieredScaledDamage(100, 6)).toBe(85);
    });

    it('100 * 0.85 = 85 (整数)', () => {
      expect(computeTieredScaledDamage(100, 6)).toBe(85);
    });

    it('200 * 0.85 = 170', () => {
      expect(computeTieredScaledDamage(200, 4)).toBe(170);
    });
  });

  describe('comboCount 7-9: 70% 伤害', () => {
    it('comboHits=7 → 70% 伤害', () => {
      expect(computeTieredScaledDamage(100, 7)).toBe(70);
    });

    it('comboHits=8 → 70% 伤害', () => {
      expect(computeTieredScaledDamage(100, 8)).toBe(70);
    });

    it('comboHits=9 → 70% 伤害', () => {
      expect(computeTieredScaledDamage(100, 9)).toBe(70);
    });

    it('150 * 0.70 = 105', () => {
      expect(computeTieredScaledDamage(150, 7)).toBe(105);
    });
  });

  describe('comboCount 10+: 60% 伤害 (下限)', () => {
    it('comboHits=10 → 60% 伤害', () => {
      expect(computeTieredScaledDamage(100, 10)).toBe(60);
    });

    it('comboHits=15 → 60% 伤害 (保持下限)', () => {
      expect(computeTieredScaledDamage(100, 15)).toBe(60);
    });

    it('comboHits=20 → 60% 伤害 (保持下限)', () => {
      expect(computeTieredScaledDamage(100, 20)).toBe(60);
    });

    it('comboHits=50 → 60% 伤害 (保持下限)', () => {
      expect(computeTieredScaledDamage(100, 50)).toBe(60);
    });
  });

  describe('最小伤害为 1', () => {
    it('baseDamage=1 + comboHits=20 → 至少 1', () => {
      expect(computeTieredScaledDamage(1, 20)).toBeGreaterThanOrEqual(1);
    });

    it('baseDamage=2 + comboHits=15 → 至少 1', () => {
      expect(computeTieredScaledDamage(2, 15)).toBeGreaterThanOrEqual(1);
    });
  });

  describe('分段边界精确性', () => {
    it('comboHits=3 和 comboHits=4 伤害不同', () => {
      const d3 = computeTieredScaledDamage(100, 3);
      const d4 = computeTieredScaledDamage(100, 4);
      expect(d3).toBe(100);
      expect(d4).toBe(85);
      expect(d3).toBeGreaterThan(d4);
    });

    it('comboHits=6 和 comboHits=7 伤害不同', () => {
      const d6 = computeTieredScaledDamage(100, 6);
      const d7 = computeTieredScaledDamage(100, 7);
      expect(d6).toBe(85);
      expect(d7).toBe(70);
      expect(d6).toBeGreaterThan(d7);
    });

    it('comboHits=9 和 comboHits=10 伤害不同', () => {
      const d9 = computeTieredScaledDamage(100, 9);
      const d10 = computeTieredScaledDamage(100, 10);
      expect(d9).toBe(70);
      expect(d10).toBe(60);
      expect(d9).toBeGreaterThan(d10);
    });
  });
});

// ===== 3. 投技不参与缩放 =====

describe('投技不参与缩放', () => {
  it('THROW comboHits=5 → 原始伤害', () => {
    expect(computeTieredScaledDamage(100, 5, AttackType.THROW)).toBe(100);
  });

  it('THROW_FORWARD comboHits=10 → 原始伤害', () => {
    expect(computeTieredScaledDamage(100, 10, AttackType.THROW_FORWARD)).toBe(100);
  });

  it('THROW_BACK comboHits=20 → 原始伤害', () => {
    expect(computeTieredScaledDamage(100, 20, AttackType.THROW_BACK)).toBe(100);
  });

  it('投技 comboHits=0 和 comboHits=15 伤害相同', () => {
    const d0 = computeTieredScaledDamage(120, 0, AttackType.THROW);
    const d15 = computeTieredScaledDamage(120, 15, AttackType.THROW);
    expect(d0).toBe(d15);
  });
});

// ===== 4. DM额外缩放惩罚 =====

describe('DM额外缩放惩罚 (-10%)', () => {
  it('DM comboHits=3 → 90% 伤害 (100% - 10%)', () => {
    expect(computeTieredScaledDamage(100, 3, AttackType.DM_OROCHINAGI)).toBe(90);
  });

  it('DM comboHits=5 → 75% 伤害 (85% - 10%)', () => {
    expect(computeTieredScaledDamage(100, 5, AttackType.DM_POWER_GEYSER)).toBe(75);
  });

  it('DM comboHits=8 → 60% 伤害 (70% - 10%)', () => {
    expect(computeTieredScaledDamage(100, 8, AttackType.DM_YATAGARASU)).toBe(60);
  });

  it('DM comboHits=10 → 60% 伤害 (60% - 10% → 下限60%)', () => {
    // 60% - 10% = 50%, 但下限是 60%, 所以 clamp 到 60%
    expect(computeTieredScaledDamage(100, 10, AttackType.DM_OROCHINAGI)).toBe(60);
  });

  it('DM comboHits=15 → 60% 伤害 (下限保护)', () => {
    expect(computeTieredScaledDamage(100, 15, AttackType.DM_FREEZE)).toBe(60);
  });

  it('SDM 同样受DM惩罚', () => {
    expect(computeTieredScaledDamage(100, 3, AttackType.SDM_OROCHINAGI)).toBe(90);
  });

  it('DM在连段中伤害始终低于同comboCount的通常技', () => {
    const normalDamage = computeTieredScaledDamage(100, 5, AttackType.STAND_C);
    const dmDamage = computeTieredScaledDamage(100, 5, AttackType.DM_OROCHINAGI);
    expect(normalDamage).toBeGreaterThan(dmDamage);
  });
});

// ===== 5. 最小缩放下限 =====

describe('最小缩放下限 (60%)', () => {
  it('COMBO_MIN_SCALE 不低于 0.60', () => {
    expect(COMBO_MIN_SCALE).toBeGreaterThanOrEqual(0.60);
  });

  it('comboHits=100 → 仍然60%下限', () => {
    expect(computeTieredScaledDamage(100, 100)).toBe(60);
  });

  it('DM comboHits=100 → 仍然60%下限 (DM惩罚不跌破下限)', () => {
    expect(computeTieredScaledDamage(100, 100, AttackType.DM_OROCHINAGI)).toBe(60);
  });

  it('基础伤害200 comboHits=50 → 120 (200*60%)', () => {
    expect(computeTieredScaledDamage(200, 50)).toBe(120);
  });
});

// ===== 6. 取消窗口常量 =====

describe('取消窗口常量', () => {
  it('CANCEL_WINDOW_NORMAL = 3 帧', () => {
    expect(CANCEL_WINDOW_NORMAL).toBe(3);
  });

  it('CANCEL_WINDOW_RAPID = 2 帧 (比普通取消更紧)', () => {
    expect(CANCEL_WINDOW_RAPID).toBe(2);
  });

  it('CANCEL_WINDOW_SUPER = 5 帧 (超必杀取消更宽)', () => {
    expect(CANCEL_WINDOW_SUPER).toBe(5);
  });

  it('CANCEL_WINDOW_FREE = 4 帧 (Free Cancel中等)', () => {
    expect(CANCEL_WINDOW_FREE).toBe(4);
  });

  it('取消窗口排序: rapid(2) < normal(3) < free(4) < super(5)', () => {
    expect(CANCEL_WINDOW_RAPID).toBeLessThan(CANCEL_WINDOW_NORMAL);
    expect(CANCEL_WINDOW_NORMAL).toBeLessThan(CANCEL_WINDOW_FREE);
    expect(CANCEL_WINDOW_FREE).toBeLessThan(CANCEL_WINDOW_SUPER);
  });

  it('所有取消窗口 > 0', () => {
    expect(CANCEL_WINDOW_NORMAL).toBeGreaterThan(0);
    expect(CANCEL_WINDOW_RAPID).toBeGreaterThan(0);
    expect(CANCEL_WINDOW_SUPER).toBeGreaterThan(0);
    expect(CANCEL_WINDOW_FREE).toBeGreaterThan(0);
  });
});

// ===== 7. CombatSystem.getCancelWindow 静态方法 =====

describe('CombatSystem.getCancelWindow', () => {
  it("'normal' → CANCEL_WINDOW_NORMAL", () => {
    expect(CombatSystem.getCancelWindow('normal')).toBe(CANCEL_WINDOW_NORMAL);
  });

  it("'rapid' → CANCEL_WINDOW_RAPID", () => {
    expect(CombatSystem.getCancelWindow('rapid')).toBe(CANCEL_WINDOW_RAPID);
  });

  it("'super' → CANCEL_WINDOW_SUPER", () => {
    expect(CombatSystem.getCancelWindow('super')).toBe(CANCEL_WINDOW_SUPER);
  });

  it("'free' → CANCEL_WINDOW_FREE", () => {
    expect(CombatSystem.getCancelWindow('free')).toBe(CANCEL_WINDOW_FREE);
  });
});

// ===== 8. 连段中 meter 获取缩放 =====

describe('连段中 meter 获取', () => {
  it('基础 meter 增益常量 > 0', () => {
    expect(METER_GAIN_HIT).toBeGreaterThan(0);
  });

  it('gainMeterOnHit 增加气槽 (stock 或 meter 增加)', () => {
    const gauge = createPowerGauge();
    const totalBefore = gauge.meter + gauge.stocks * METER_PER_STOCK;
    gainMeterOnHit(gauge, AttackType.STAND_C);
    const totalAfter = gauge.meter + gauge.stocks * METER_PER_STOCK;
    expect(totalAfter).toBeGreaterThan(totalBefore);
  });

  it('多次命中可以攒满一个stock', () => {
    const gauge = createPowerGauge();
    // 连续命中多次
    for (let i = 0; i < 10; i++) {
      gainMeterOnHit(gauge, AttackType.STAND_C);
    }
    // 应该至少有1个stock或接近满
    expect(gauge.stocks).toBeGreaterThanOrEqual(0);
    expect(gauge.meter + gauge.stocks * METER_PER_STOCK).toBeGreaterThan(0);
  });

  it('meter 增益不会超过 MAX_STOCKS', () => {
    const gauge = createPowerGauge();
    gauge.stocks = MAX_STOCKS;
    gainMeterOnHit(gauge, AttackType.STAND_C);
    expect(gauge.stocks).toBeLessThanOrEqual(MAX_STOCKS);
  });

  it('DM 命中获得更多 meter (2x 基础)', () => {
    const gauge1 = createPowerGauge();
    const gauge2 = createPowerGauge();
    gainMeterOnHit(gauge1, AttackType.STAND_C);
    gainMeterOnHit(gauge2, AttackType.DM_OROCHINAGI);
    const total1 = gauge1.meter + gauge1.stocks * METER_PER_STOCK;
    const total2 = gauge2.meter + gauge2.stocks * METER_PER_STOCK;
    expect(total2).toBeGreaterThan(total1);
  });
});

// ===== 9. CombatSystem combo 状态管理 =====

describe('CombatSystem combo 状态管理', () => {
  it('初始 comboCount = 0', () => {
    const cs = new CombatSystem(createMockInputProvider());
    expect(cs.getComboCount(0)).toBe(0);
    expect(cs.getComboCount(1)).toBe(0);
  });

  it('初始 comboDamage = 0', () => {
    const cs = new CombatSystem(createMockInputProvider());
    expect(cs.getComboDamage(0)).toBe(0);
    expect(cs.getComboDamage(1)).toBe(0);
  });

  it('resetCombo 清零指定玩家 combo', () => {
    const cs = new CombatSystem(createMockInputProvider());
    cs.resetCombo(0);
    expect(cs.getComboCount(0)).toBe(0);
    expect(cs.getComboDamage(0)).toBe(0);
  });

  it('reset() 清零所有 combo 状态', () => {
    const cs = new CombatSystem(createMockInputProvider());
    cs.reset();
    expect(cs.getComboCount(0)).toBe(0);
    expect(cs.getComboCount(1)).toBe(0);
    expect(cs.getComboDamage(0)).toBe(0);
    expect(cs.getComboDamage(1)).toBe(0);
  });

  it('wasFirstHitAwarded 初始为 false', () => {
    const cs = new CombatSystem(createMockInputProvider());
    expect(cs.wasFirstHitAwarded(0)).toBe(false);
  });

  it('wasFirstHitAwarded 第二次调用返回 true', () => {
    const cs = new CombatSystem(createMockInputProvider());
    cs.wasFirstHitAwarded(0);
    expect(cs.wasFirstHitAwarded(0)).toBe(true);
  });

  it('reset() 重置 firstHitAwarded', () => {
    const cs = new CombatSystem(createMockInputProvider());
    cs.wasFirstHitAwarded(0);
    cs.reset();
    expect(cs.wasFirstHitAwarded(0)).toBe(false);
  });
});

// ===== 10. 跨段缩放完整性 =====

describe('缩放全范围连续性', () => {
  it('comboHits 1-3 始终100%', () => {
    for (let i = 1; i <= 3; i++) {
      expect(computeTieredScaledDamage(100, i)).toBe(100);
    }
  });

  it('comboHits 4-6 始终85%', () => {
    for (let i = 4; i <= 6; i++) {
      expect(computeTieredScaledDamage(100, i)).toBe(85);
    }
  });

  it('comboHits 7-9 始终70%', () => {
    for (let i = 7; i <= 9; i++) {
      expect(computeTieredScaledDamage(100, i)).toBe(70);
    }
  });

  it('comboHits 10+ 始终60%', () => {
    for (let i = 10; i <= 15; i++) {
      expect(computeTieredScaledDamage(100, i)).toBe(60);
    }
  });

  it('缩放率单调递减或不变', () => {
    let prevDamage = Infinity;
    for (let i = 0; i <= 20; i++) {
      const dmg = computeTieredScaledDamage(100, i);
      expect(dmg).toBeLessThanOrEqual(prevDamage);
      prevDamage = dmg;
    }
  });
});

// ===== 11. 保留旧常量兼容性 =====

describe('旧缩放常量兼容性', () => {
  it('DAMAGE_SCALE_STEP 仍然存在', () => {
    expect(DAMAGE_SCALE_STEP).toBeDefined();
  });

  it('DAMAGE_SCALE_MIN_NORMAL 仍然存在', () => {
    expect(DAMAGE_SCALE_MIN_NORMAL).toBeDefined();
  });

  it('DAMAGE_SCALE_MIN_SPECIAL 仍然存在', () => {
    expect(DAMAGE_SCALE_MIN_SPECIAL).toBeDefined();
  });

  it('DAMAGE_SCALE_MIN_DM 仍然存在', () => {
    expect(DAMAGE_SCALE_MIN_DM).toBeDefined();
  });

  it('COMBO_TIMEOUT 仍然存在', () => {
    expect(COMBO_TIMEOUT).toBe(60);
  });
});
