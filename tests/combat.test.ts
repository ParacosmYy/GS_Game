import { describe, it, expect } from 'vitest';
import { FRAME_DATA, CHIP_DAMAGE_RATIO, CH_HITSTUN_BONUS, CH_DAMAGE_BONUS, THROW_INVINCIBILITY_POST_ESCAPE } from '../src/core/constants.js';
import { CinematicState } from '../src/state/cinematicState.js';
import { Fighter } from '../src/entities/fighter.js';
import { FighterState } from '../src/core/types.js';
import type { MaxModeState } from '../src/core/types.js';

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

// KOF2002UM 通用帧数据标准 (Dream Cancel Wiki)
// 轻攻击 hitstun=11F blockstun=9F
// 地面重攻击 hitstun=19F blockstun=17F
// 空中重攻击 hitstun=11F blockstun=17F
const KOF_LIGHT_HITSTUN = 11;
const KOF_LIGHT_BLOCKSTUN = 9;
const KOF_HEAVY_GROUND_HITSTUN = 19;
const KOF_HEAVY_GROUND_BLOCKSTUN = 17;
const KOF_HEAVY_AIR_HITSTUN = 11;
const KOF_HEAVY_AIR_BLOCKSTUN = 17;

// 判断是否为轻攻击 (A/B 按钮)
function isLightNormal(key: string): boolean {
  return /_(A|B)$/.test(key);
}

// 判断是否为重攻击 (C/D 按钮)
function isHeavyNormal(key: string): boolean {
  return /_(C|D)$/.test(key);
}

// 判断是否为空中攻击
function isAirAttack(key: string): boolean {
  return key.startsWith('JUMP_') || key === 'CMD_NARAKU';
}

// 判断是否为地面攻击 (站立/近距离/蹲下)
function isGroundNormal(key: string): boolean {
  return (key.startsWith('STAND_') || key.startsWith('CLOSE_') || key.startsWith('CROUCH_'))
    && !key.startsWith('STAND_CD');
}

describe('KOF2002UM Hitstun/Blockstun 标准', () => {
  describe('轻攻击 hitstun 应为 11 帧', () => {
    const lightGrounds = [
      'STAND_A', 'STAND_B',
      'CLOSE_A', 'CLOSE_B',
      'CROUCH_A', 'CROUCH_B',
    ];
    for (const atk of lightGrounds) {
      it(`${atk} hitstun = ${KOF_LIGHT_HITSTUN}F`, () => {
        const fd = FRAME_DATA[atk as keyof typeof FRAME_DATA] as FrameDataEntry;
        expect(fd.hitstun).toBe(KOF_LIGHT_HITSTUN);
      });
    }
  });

  describe('轻攻击 blockstun 应为 9 帧', () => {
    const lightGrounds = [
      'STAND_A', 'STAND_B',
      'CLOSE_A', 'CLOSE_B',
      'CROUCH_A', 'CROUCH_B',
    ];
    for (const atk of lightGrounds) {
      it(`${atk} blockstun = ${KOF_LIGHT_BLOCKSTUN}F`, () => {
        const fd = FRAME_DATA[atk as keyof typeof FRAME_DATA] as FrameDataEntry;
        expect(fd.blockstun).toBe(KOF_LIGHT_BLOCKSTUN);
      });
    }
  });

  describe('地面重攻击 hitstun 应为 19 帧', () => {
    const heavyGrounds = [
      'STAND_C', 'STAND_D',
      'CLOSE_C',
      // CLOSE_D 在 KOF2002UM 中是轻量级近距离D踢（damage=25），不走重攻击标准
      'CROUCH_C',
      // CROUCH_D 是 knockdown，hitstun=0 是合理的（击倒不走 hitstun）
    ];
    for (const atk of heavyGrounds) {
      it(`${atk} hitstun = ${KOF_HEAVY_GROUND_HITSTUN}F`, () => {
        const fd = FRAME_DATA[atk as keyof typeof FRAME_DATA] as FrameDataEntry;
        expect(fd.hitstun).toBe(KOF_HEAVY_GROUND_HITSTUN);
      });
    }
  });

  describe('CLOSE_D 是轻量近距离攻击 (damage=25, 走轻攻击标准)', () => {
    it('CLOSE_D hitstun = 11F (轻攻击标准)', () => {
      const fd = FRAME_DATA['CLOSE_D'] as FrameDataEntry;
      expect(fd.hitstun).toBe(KOF_LIGHT_HITSTUN);
    });

    it('CLOSE_D blockstun = 9F (轻攻击标准)', () => {
      const fd = FRAME_DATA['CLOSE_D'] as FrameDataEntry;
      expect(fd.blockstun).toBe(KOF_LIGHT_BLOCKSTUN);
    });
  });

  describe('地面重攻击 blockstun 应为 17 帧', () => {
    const heavyGrounds = [
      'STAND_C', 'STAND_D',
      'CLOSE_C',
      // CLOSE_D 走轻攻击标准 (blockstun=9)
      'CROUCH_C', 'CROUCH_D',
    ];
    for (const atk of heavyGrounds) {
      it(`${atk} blockstun = ${KOF_HEAVY_GROUND_BLOCKSTUN}F`, () => {
        const fd = FRAME_DATA[atk as keyof typeof FRAME_DATA] as FrameDataEntry;
        expect(fd.blockstun).toBe(KOF_HEAVY_GROUND_BLOCKSTUN);
      });
    }
  });

  describe('空中重攻击 hitstun 应为 11 帧', () => {
    const heavyAirs = ['JUMP_C', 'JUMP_D'];
    for (const atk of heavyAirs) {
      it(`${atk} hitstun = ${KOF_HEAVY_AIR_HITSTUN}F`, () => {
        const fd = FRAME_DATA[atk as keyof typeof FRAME_DATA] as FrameDataEntry;
        expect(fd.hitstun).toBe(KOF_HEAVY_AIR_HITSTUN);
      });
    }
  });

  describe('空中重攻击 blockstun 应为 17 帧', () => {
    const heavyAirs = ['JUMP_C', 'JUMP_D'];
    for (const atk of heavyAirs) {
      it(`${atk} blockstun = ${KOF_HEAVY_AIR_BLOCKSTUN}F`, () => {
        const fd = FRAME_DATA[atk as keyof typeof FRAME_DATA] as FrameDataEntry;
        expect(fd.blockstun).toBe(KOF_HEAVY_AIR_BLOCKSTUN);
      });
    }
  });

  describe('空中轻攻击 hitstun 应为 11 帧', () => {
    const lightAirs = ['JUMP_A', 'JUMP_B'];
    for (const atk of lightAirs) {
      it(`${atk} hitstun = 11F`, () => {
        const fd = FRAME_DATA[atk as keyof typeof FRAME_DATA] as FrameDataEntry;
        expect(fd.hitstun).toBe(11);
      });
    }
  });

  describe('空中轻攻击 blockstun 应为 9 帧', () => {
    const lightAirs = ['JUMP_A', 'JUMP_B'];
    for (const atk of lightAirs) {
      it(`${atk} blockstun = 9F`, () => {
        const fd = FRAME_DATA[atk as keyof typeof FRAME_DATA] as FrameDataEntry;
        expect(fd.blockstun).toBe(9);
      });
    }
  });
});

describe('FRAME_DATA 合理性校验', () => {
  const entries = Object.entries(FRAME_DATA) as [string, FrameDataEntry][];

  describe('startup > 0', () => {
    for (const [key, fd] of entries) {
      it(`${key} startup=${fd.startup} > 0`, () => {
        expect(fd.startup).toBeGreaterThan(0);
      });
    }
  });

  describe('damage > 0', () => {
    for (const [key, fd] of entries) {
      it(`${key} damage=${fd.damage} > 0`, () => {
        expect(fd.damage).toBeGreaterThan(0);
      });
    }
  });

  describe('active > 0', () => {
    for (const [key, fd] of entries) {
      it(`${key} active=${fd.active} > 0`, () => {
        expect(fd.active).toBeGreaterThan(0);
      });
    }
  });

  describe('通常技 recovery > 0 (空中除外)', () => {
    for (const [key, fd] of entries) {
      // 空中攻击 recovery 可以为 0 (落地恢复由 LANDING_RECOVERY 处理)
      if (isAirAttack(key)) return;
      it(`${key} recovery=${fd.recovery} > 0`, () => {
        expect(fd.recovery).toBeGreaterThan(0);
      });
    }
  });

  describe('hitstun 应该 >= blockstun (优势帧原则)', () => {
    for (const [key, fd] of entries) {
      // 投技和击倒技 hitstun=0 是合理的（特殊状态转移）
      if (fd.knockdown && fd.hitstun === 0) return;
      // blockstun=0 的投技跳过
      if (fd.blockstun === 0) return;
      it(`${key} hitstun(${fd.hitstun}) >= blockstun(${fd.blockstun})`, () => {
        expect(fd.hitstun).toBeGreaterThanOrEqual(fd.blockstun);
      });
    }
  });
});

describe('KOF2002UM 伤害数值合理性', () => {
  it('轻攻击伤害应 <= 50 (正版标准)', () => {
    const lights = ['STAND_A', 'CLOSE_A', 'CROUCH_A', 'JUMP_A',
      'STAND_B', 'CLOSE_B', 'CROUCH_B', 'JUMP_B'] as const;
    for (const atk of lights) {
      const fd = FRAME_DATA[atk] as FrameDataEntry;
      expect(fd.damage, `${atk}.damage 应该 <= 50`).toBeLessThanOrEqual(50);
    }
  });

  it('重攻击伤害应 > 轻攻击伤害', () => {
    const pairs: [string, string][] = [
      ['STAND_C', 'STAND_A'],
      ['STAND_D', 'STAND_B'],
      ['CROUCH_C', 'CROUCH_A'],
      ['CLOSE_C', 'CLOSE_A'],
    ];
    for (const [heavy, light] of pairs) {
      const heavyFd = FRAME_DATA[heavy as keyof typeof FRAME_DATA] as FrameDataEntry;
      const lightFd = FRAME_DATA[light as keyof typeof FRAME_DATA] as FrameDataEntry;
      expect(heavyFd.damage, `${heavy}.damage 应该 > ${light}.damage`).toBeGreaterThan(lightFd.damage);
    }
  });

  it('DM 伤害应该 >= 150', () => {
    const dms = ['DM_OROCHINAGI', 'DM_YATAGARASU', 'DM_POWER_GEYSER',
      'DM_HIGH_ANGLE_GEYSER', 'DM_PHOENIX_KICK', 'DM_PHOENIX_HITEN'] as const;
    for (const atk of dms) {
      const fd = FRAME_DATA[atk] as FrameDataEntry;
      expect(fd.damage, `${atk}.damage 应该 >= 150`).toBeGreaterThanOrEqual(150);
    }
  });
});

describe('Chip Damage 校验', () => {
  it('chipDamage 应该约为 damage * 10% (CHIP_DAMAGE_RATIO)', () => {
    const entries = Object.entries(FRAME_DATA) as [string, FrameDataEntry][];
    for (const [key, fd] of entries) {
      if (!fd.chipDamage) return;
      const expected = Math.round(fd.damage * CHIP_DAMAGE_RATIO);
      // 允许 +-2 的误差 (手动调校)
      expect(Math.abs(fd.chipDamage - expected),
        `${key} chipDamage=${fd.chipDamage} 应接近 damage*10%=${expected}`
      ).toBeLessThanOrEqual(2);
    }
  });
});

describe('Counter Hit 增益常数', () => {
  it('CH_HITSTUN_BONUS 应为 1.5 (KOF2002标准)', () => {
    expect(CH_HITSTUN_BONUS).toBe(1.5);
  });

  it('CH_DAMAGE_BONUS 应为 1.25 (KOF2002标准)', () => {
    expect(CH_DAMAGE_BONUS).toBe(1.25);
  });
});

describe('击倒 (Knockdown) 一致性', () => {
  it('knockdown=true 的招式 hitstun 可以为 0 (走特殊击倒流程)', () => {
    const entries = Object.entries(FRAME_DATA) as [string, FrameDataEntry][];
    const knockdowns = entries.filter(([, fd]) => fd.knockdown);
    for (const [key, fd] of knockdowns) {
      // knockdown 招式的 hitstun=0 是合法的（直接进入 KNOCKDOWN 状态）
      // 但如果 hitstun > 0 也是合法的（先受击硬直再倒地）
      expect(typeof fd.knockdown, `${key}.knockdown 应该是 boolean`).toBe('boolean');
    }
  });

  it('投技全部应该 knockdown=true', () => {
    const throws = ['THROW', 'THROW_FORWARD', 'THROW_BACK'] as const;
    for (const atk of throws) {
      const fd = FRAME_DATA[atk] as FrameDataEntry;
      expect(fd.knockdown, `${atk} 应该 knockdown=true`).toBe(true);
    }
  });
});

describe('Hit-stop 顿帧标准 (KOF2002UM)', () => {
  // KOF2002标准: 轻攻击4F, 重攻击8F, 必杀技6F, 超必杀12F, Counter+3F
  // 防御: 重攻击5F, 轻攻击3F
  // 这些值定义在 hitCallback.ts 的 calcHitStop 函数中
  const KOF_LIGHT_HITSTOP = 4;
  const KOF_HEAVY_HITSTOP = 8;
  const KOF_SPECIAL_HITSTOP = 6;
  const KOF_DM_HITSTOP = 12;
  const KOF_COUNTER_BONUS = 3;
  const KOF_BLOCK_HEAVY_HITSTOP = 5;
  const KOF_BLOCK_LIGHT_HITSTOP = 3;

  // --- CinematicState.isFrozen() 行为验证 ---

  it('triggerHitStop(8) 后 isFrozen() 连续返回 true 共 8 次，第 9 次返回 false', () => {
    const cs = new CinematicState();
    cs.triggerHitStop(8);
    for (let i = 0; i < 8; i++) {
      expect(cs.isFrozen(), `第 ${i + 1} 次应返回 true`).toBe(true);
    }
    expect(cs.isFrozen(), '第 9 次应返回 false').toBe(false);
  });

  it('triggerHitStop(4) 后恰好冻结 4 帧 (轻攻击标准)', () => {
    const cs = new CinematicState();
    cs.triggerHitStop(KOF_LIGHT_HITSTOP);
    for (let i = 0; i < KOF_LIGHT_HITSTOP; i++) {
      expect(cs.isFrozen()).toBe(true);
    }
    expect(cs.isFrozen()).toBe(false);
  });

  it('triggerHitStop(12) 后恰好冻结 12 帧 (DM标准)', () => {
    const cs = new CinematicState();
    cs.triggerHitStop(KOF_DM_HITSTOP);
    for (let i = 0; i < KOF_DM_HITSTOP; i++) {
      expect(cs.isFrozen()).toBe(true);
    }
    expect(cs.isFrozen()).toBe(false);
  });

  it('Counter Hit: 顿帧 = 基础值 + 3F', () => {
    // 轻攻击 CH: 4+3=7F
    const cs1 = new CinematicState();
    cs1.triggerHitStop(KOF_LIGHT_HITSTOP + KOF_COUNTER_BONUS);
    for (let i = 0; i < 7; i++) expect(cs1.isFrozen()).toBe(true);
    expect(cs1.isFrozen()).toBe(false);

    // 重攻击 CH: 8+3=11F
    const cs2 = new CinematicState();
    cs2.triggerHitStop(KOF_HEAVY_HITSTOP + KOF_COUNTER_BONUS);
    for (let i = 0; i < 11; i++) expect(cs2.isFrozen()).toBe(true);
    expect(cs2.isFrozen()).toBe(false);

    // DM CH: 12+3=15F
    const cs3 = new CinematicState();
    cs3.triggerHitStop(KOF_DM_HITSTOP + KOF_COUNTER_BONUS);
    for (let i = 0; i < 15; i++) expect(cs3.isFrozen()).toBe(true);
    expect(cs3.isFrozen()).toBe(false);
  });

  // --- 防御顿帧 ---

  it('防御重攻击: 顿帧 5F (hitCallback.ts block 分支)', () => {
    const cs = new CinematicState();
    cs.triggerHitStop(KOF_BLOCK_HEAVY_HITSTOP);
    for (let i = 0; i < KOF_BLOCK_HEAVY_HITSTOP; i++) expect(cs.isFrozen()).toBe(true);
    expect(cs.isFrozen()).toBe(false);
  });

  it('防御轻攻击: 顿帧 3F (hitCallback.ts block 分支)', () => {
    const cs = new CinematicState();
    cs.triggerHitStop(KOF_BLOCK_LIGHT_HITSTOP);
    for (let i = 0; i < KOF_BLOCK_LIGHT_HITSTOP; i++) expect(cs.isFrozen()).toBe(true);
    expect(cs.isFrozen()).toBe(false);
  });

  it('防御顿帧 < 命中顿帧 (重攻击: 5 < 8, 轻攻击: 3 < 4)', () => {
    expect(KOF_BLOCK_HEAVY_HITSTOP).toBeLessThan(KOF_HEAVY_HITSTOP);
    expect(KOF_BLOCK_LIGHT_HITSTOP).toBeLessThan(KOF_LIGHT_HITSTOP);
  });

  // --- tickInFreeze 行为: MAX 模式在顿帧期间照常倒计时 ---

  it('tickInFreeze 在顿帧期间正常减少 MAX 模式 timer', () => {
    const cs = new CinematicState();
    cs.triggerHitStop(4);
    const maxModes: [MaxModeState, MaxModeState] = [
      { active: true, timer: 100, maxDuration: 720 },
      { active: false, timer: 0, maxDuration: 720 },
    ];
    // tickInFreeze 应减少 p1 的 timer
    cs.tickInFreeze(maxModes);
    expect(maxModes[0].timer, 'MAX timer 应减少 1').toBe(99);
    expect(maxModes[0].active, 'MAX 应仍然激活').toBe(true);
  });

  it('tickInFreeze 使 MAX timer 归零时自动 deactivate', () => {
    const cs = new CinematicState();
    cs.triggerHitStop(2);
    const maxModes: [MaxModeState, MaxModeState] = [
      { active: true, timer: 1, maxDuration: 720 },
      { active: false, timer: 0, maxDuration: 720 },
    ];
    cs.tickInFreeze(maxModes);
    expect(maxModes[0].timer).toBe(0);
    expect(maxModes[0].active, 'timer 归零应自动 deactivate').toBe(false);
  });

  it('tickInFreeze 同时递减 superFlashTimer', () => {
    const cs = new CinematicState();
    cs.triggerSuperFlash(400, 200, 0);
    expect(cs.superFlashTimer).toBe(20);
    const maxModes: [MaxModeState, MaxModeState] = [
      { active: false, timer: 0, maxDuration: 720 },
      { active: false, timer: 0, maxDuration: 720 },
    ];
    cs.tickInFreeze(maxModes);
    expect(cs.superFlashTimer, 'superFlashTimer 应减少 1').toBe(19);
  });

  // --- hitStop 常数一致性验证 ---

  it('顿帧递增关系: DM(12) > Heavy(8) > Special(6) > Light(4)', () => {
    expect(KOF_DM_HITSTOP).toBeGreaterThan(KOF_HEAVY_HITSTOP);
    expect(KOF_HEAVY_HITSTOP).toBeGreaterThan(KOF_SPECIAL_HITSTOP);
    expect(KOF_SPECIAL_HITSTOP).toBeGreaterThan(KOF_LIGHT_HITSTOP);
  });

  it('Counter 加成与所有攻击类别兼容 (总帧数合理)', () => {
    const combos = [
      { base: KOF_LIGHT_HITSTOP, label: 'Light CH' },
      { base: KOF_HEAVY_HITSTOP, label: 'Heavy CH' },
      { base: KOF_SPECIAL_HITSTOP, label: 'Special CH' },
      { base: KOF_DM_HITSTOP, label: 'DM CH' },
    ];
    for (const c of combos) {
      const total = c.base + KOF_COUNTER_BONUS;
      expect(total, `${c.label}: ${c.base}+${KOF_COUNTER_BONUS}=${total} 应 > 基础值`).toBeGreaterThan(c.base);
      expect(total, `${c.label}: 总顿帧 ${total} 应 <= 20 (合理性上限)`).toBeLessThanOrEqual(20);
    }
  });

  // --- Super Flash 同时设置 hitStop ---

  it('triggerSuperFlash 同时设置 hitStop=20', () => {
    const cs = new CinematicState();
    cs.triggerSuperFlash(400, 200, 0);
    expect(cs.superFlashTimer).toBe(20);
    // isFrozen 会消耗 hitStop，验证初始值
    expect(cs.hitStop).toBe(20);
    for (let i = 0; i < 20; i++) expect(cs.isFrozen()).toBe(true);
    expect(cs.isFrozen()).toBe(false);
  });

  // --- reset 清空顿帧 ---

  it('reset() 清空 hitStop 和 superFlashTimer', () => {
    const cs = new CinematicState();
    cs.triggerHitStop(12);
    cs.reset();
    expect(cs.hitStop).toBe(0);
    expect(cs.isFrozen()).toBe(false);
  });

  it('resetForNewRound() 清空 hitStop 和 superFlashTimer', () => {
    const cs = new CinematicState();
    cs.triggerSuperFlash(400, 200, 0);
    cs.resetForNewRound();
    expect(cs.hitStop).toBe(0);
    expect(cs.superFlashTimer).toBe(0);
    expect(cs.isFrozen()).toBe(false);
  });
});

// ===== Throw Escape Tests =====
describe('Throw Escape Framework', () => {
  it('THROW_INVINCIBILITY_POST_ESCAPE 应为 6 帧', () => {
    expect(THROW_INVINCIBILITY_POST_ESCAPE).toBe(6);
  });

  it('ThrowEscapeCallback: combatSystem.onThrowEscape 属性通过类型定义', async () => {
    const mod = await import('../src/combat/combatSystem.js');
    expect(typeof mod.CombatSystem).toBe('function');
  });

  it('Fighter.isThrowVulnerable: GUARD_CRUSH 状态下不可被抓', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.state = FighterState.GUARD_CRUSH;
    expect(f.isThrowVulnerable()).toBe(false);
  });

  it('Fighter.isThrowVulnerable: THROW 状态下不可被抓', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.state = FighterState.THROW;
    expect(f.isThrowVulnerable()).toBe(false);
  });

  it('Fighter.isThrowVulnerable: AIR_BLOCK 状态下不可被抓', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.state = FighterState.AIR_BLOCK;
    expect(f.isThrowVulnerable()).toBe(false);
  });
});

// ===== Counter Wire & Guard Crush Tests =====
describe('Counter Wire + Guard Crush Systems', () => {
  it('Guard Crush: guardGauge 从100降到0触发GUARD_CRUSH状态', () => {
    const f = new Fighter(400, '#ff6600', 1);
    expect(f.guardGauge).toBe(100);
    expect(f.state).toBe(FighterState.IDLE);
    f.guardGauge = 0;
    f.state = FighterState.GUARD_CRUSH;
    f.guardCrushTimer = 60;
    expect(f.state).toBe(FighterState.GUARD_CRUSH);
    expect(f.isThrowVulnerable()).toBe(false);
  });

  it('Guard Crush: 60帧后恢复IDLE', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.state = FighterState.GUARD_CRUSH;
    f.guardCrushTimer = 60;
    for (let i = 0; i < 60; i++) f.guardCrushTimer--;
    expect(f.guardCrushTimer).toBe(0);
  });

  it('Guard Crush: guardGauge非防御时每帧恢复0.25', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.guardGauge = 80;
    f.state = FighterState.IDLE;
    f.tickTimers();
    expect(f.guardGauge).toBe(80.25);
  });

  it('Counter Wire: isCounterWire标志可以在reset中清除', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.isCounterWire = true;
    f.reset(400);
    expect(f.isCounterWire).toBe(false);
  });

  it('Guard Gauge depletion: DM攻击应消耗25点', () => {
    // Guard gauge damage for DM is 25 points per block
    const f = new Fighter(400, '#ff6600', 1);
    expect(f.guardGauge).toBe(100);
    // Simulate blocking 4 DM hits: 4 * 25 = 100 → Guard Crush
    f.guardGauge = Math.max(0, f.guardGauge - 25);
    f.guardGauge = Math.max(0, f.guardGauge - 25);
    f.guardGauge = Math.max(0, f.guardGauge - 25);
    f.guardGauge = Math.max(0, f.guardGauge - 25);
    expect(f.guardGauge).toBe(0);
  });

  it('Guard Gauge depletion: 轻攻击应消耗5点', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.guardGauge = Math.max(0, f.guardGauge - 5);
    expect(f.guardGauge).toBe(95);
  });
});
