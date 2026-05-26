/**
 * Ryo Sprite/Animation Manifest 测试
 *
 * 验证 Ryo 的 sprite manifest 和 animation manifest 数据完整性：
 * - Ryo 在 SPRITE_MANIFEST 中存在且拥有所有必要动画
 * - Ryo 拥有 4 色 palette 变体
 * - Ryo 在 ANIMATION_MANIFEST 中存在且拥有全部 19 个必要序列
 * - Ryo 拥有角色专属必杀技和 DM 序列
 * - 攻击序列帧数与 FRAME_DATA 对齐
 * - cancelFrames 落在 active/recovery 范围内
 * - Portrait manifest 包含 Ryo 且尺寸正确
 */
import { describe, it, expect } from 'vitest';
import {
  SPRITE_MANIFEST,
  RYO_ANIMATIONS,
} from '../src/core/spriteManifestData.js';
import {
  getAnimation,
  hasAnimation,
  getAnimationNames,
  getAnimationDuration,
  getAnimationFrameCount,
} from '../src/core/spriteManifest.js';
import {
  ANIMATION_MANIFEST,
  REQUIRED_SEQUENCES,
} from '../src/core/animationManifestData.js';
import {
  getSequence,
  hasSequence,
  getSequenceNames,
  isCancelFrame,
  getActiveFrames,
} from '../src/core/animationManifest.js';
import {
  PORTRAIT_MANIFEST,
  PORTRAIT_SIZES,
  getSelectPortrait,
} from '../src/core/portraitManifest.js';
import { FRAME_DATA } from '../src/core/frameDataConstants.js';

// ===== 常量 =====

/** Ryo 的 charId */
const RYO = 'ryo';

/** 19 个必要动画序列名称 */
const REQUIRED_19 = REQUIRED_SEQUENCES;

/** Ryo 专属必杀技序列名 (AttackType 映射名) */
const RYO_SPECIALS = [
  'ryo_koou',
  'ryo_ko_hou',
  'ryo_hien',
  'ryo_haou',
  'dm_ten_ha_ou',
] as const;

/** 通常技 FRAME_DATA key → animation name 映射 */
const NORMAL_ATTACK_MAP: Record<string, string> = {
  STAND_A: 'stand_a',
  STAND_B: 'stand_b',
  STAND_C: 'stand_c',
  STAND_D: 'stand_d',
  CROUCH_A: 'crouch_a',
  CROUCH_B: 'crouch_b',
  CROUCH_C: 'crouch_c',
  CROUCH_D: 'crouch_d',
};

/** 必杀技 FRAME_DATA key → animation name 映射 */
const SPECIAL_ATTACK_MAP: Record<string, string> = {
  RYO_KOOU: 'ryo_koou',
  RYO_KO_HOU: 'ryo_ko_hou',
  RYO_HIEN: 'ryo_hien',
  RYO_HAOU: 'ryo_haou',
  DM_TEN_HA_OU: 'dm_ten_ha_ou',
};

// =====================================================================
// 1. Ryo exists in SPRITE_MANIFEST
// =====================================================================

describe('Ryo SPRITE_MANIFEST 存在性', () => {
  it('Ryo 存在于 SPRITE_MANIFEST.characters', () => {
    expect(SPRITE_MANIFEST.characters[RYO]).toBeDefined();
    expect(SPRITE_MANIFEST.characters[RYO].charId).toBe(RYO);
  });

  it('Ryo 有 fallbackColors 全部 4 字段', () => {
    const char = SPRITE_MANIFEST.characters[RYO];
    expect(char.fallbackColors).toEqual({
      body: '#FFD699',
      head: '#FFD699',
      outfit: '#DD6600',
      hair: '#8B4513',
    });
  });
});

// =====================================================================
// 2. Ryo has all required body part entries (19 animations in sprite manifest)
// =====================================================================

describe('Ryo sprite manifest 19 个必要动画', () => {
  it('Ryo 拥有全部 19 个必要动画序列', () => {
    for (const name of REQUIRED_19) {
      expect(
        hasAnimation(SPRITE_MANIFEST, RYO, name),
        `Ryo sprite manifest 缺少动画: ${name}`,
      ).toBe(true);
    }
  });

  it('Ryo 的基础动画帧数合理', () => {
    // idle: 4帧循环
    const idle = getAnimation(SPRITE_MANIFEST, RYO, 'idle');
    expect(idle).toBeDefined();
    expect(idle!.frames.length).toBe(4);
    expect(idle!.loop).toBe(true);

    // walk_forward: 6帧循环
    const wf = getAnimation(SPRITE_MANIFEST, RYO, 'walk_forward');
    expect(wf!.frames.length).toBe(6);
    expect(wf!.loop).toBe(true);

    // walk_backward: 6帧循环
    const wb = getAnimation(SPRITE_MANIFEST, RYO, 'walk_backward');
    expect(wb!.frames.length).toBe(6);
    expect(wb!.loop).toBe(true);
  });
});

// =====================================================================
// 3. Ryo has 4 color palette definitions
// =====================================================================

describe('Ryo palette 变体', () => {
  it('Ryo 拥有 4 色 palette 变体', () => {
    const char = SPRITE_MANIFEST.characters[RYO];
    expect(char.palettes).toBeDefined();
    expect(char.palettes!.length).toBe(4);
  });

  it('每个 palette 有 4 个颜色值', () => {
    const palettes = SPRITE_MANIFEST.characters[RYO].palettes!;
    for (let i = 0; i < palettes.length; i++) {
      expect(
        palettes[i].length,
        `palette[${i}] 应有 4 个颜色`,
      ).toBe(4);
    }
  });
});

// =====================================================================
// 4. Ryo exists in ANIMATION_MANIFEST
// =====================================================================

describe('Ryo ANIMATION_MANIFEST 存在性', () => {
  it('Ryo 存在于 ANIMATION_MANIFEST.characters', () => {
    expect(ANIMATION_MANIFEST.characters[RYO]).toBeDefined();
    expect(ANIMATION_MANIFEST.characters[RYO].charId).toBe(RYO);
  });
});

// =====================================================================
// 5. Ryo has all 19 required animation sequences
// =====================================================================

describe('Ryo animation manifest 19 个必要序列', () => {
  it('Ryo 拥有全部 19 个必要动画序列', () => {
    for (const name of REQUIRED_19) {
      expect(
        hasSequence(ANIMATION_MANIFEST, RYO, name),
        `Ryo animation manifest 缺少序列: ${name}`,
      ).toBe(true);
    }
  });

  it('循环序列 loop=true, 非循环序列 loop=false', () => {
    const loopNames = ['idle', 'walk_forward', 'walk_backward'];
    for (const name of loopNames) {
      const seq = getSequence(ANIMATION_MANIFEST, RYO, name);
      expect(seq!.loop, `${name} 应为循环`).toBe(true);
    }
    const onceNames = ['jump_up', 'jump_forward', 'jump_backward', 'hitstun', 'blockstun', 'knockdown', 'wakeup', 'win'];
    for (const name of onceNames) {
      const seq = getSequence(ANIMATION_MANIFEST, RYO, name);
      expect(seq!.loop, `${name} 应为非循环`).toBe(false);
    }
  });
});

// =====================================================================
// 6. Ryo has special move animation sequences
// =====================================================================

describe('Ryo 必杀技/DM 序列', () => {
  it('Ryo 拥有全部 5 个专属必杀技/DM 序列', () => {
    for (const name of RYO_SPECIALS) {
      expect(
        hasSequence(ANIMATION_MANIFEST, RYO, name),
        `Ryo animation manifest 缺少必杀技序列: ${name}`,
      ).toBe(true);
    }
  });

  it('ryo_ko_hou (升龙) 拥有无敌帧', () => {
    const seq = getSequence(ANIMATION_MANIFEST, RYO, 'ryo_ko_hou');
    expect(seq).toBeDefined();
    expect(
      seq!.invincibleFrames.length,
      'ryo_ko_hou 应有无敌帧',
    ).toBeGreaterThan(0);
  });

  it('Ryo sprite manifest 也拥有同名动画', () => {
    for (const name of RYO_SPECIALS) {
      expect(
        hasAnimation(SPRITE_MANIFEST, RYO, name),
        `Ryo sprite manifest 缺少必杀技动画: ${name}`,
      ).toBe(true);
    }
  });
});

// =====================================================================
// 7. Frame counts match FRAME_DATA for attack sequences
// =====================================================================

describe('攻击序列帧数对齐 FRAME_DATA', () => {
  it('通常技帧数 = startup + active + recovery', () => {
    for (const [fdKey, animName] of Object.entries(NORMAL_ATTACK_MAP)) {
      const fd = FRAME_DATA[fdKey as keyof typeof FRAME_DATA];
      const seq = getSequence(ANIMATION_MANIFEST, RYO, animName);
      if (!fd || !seq) continue;

      const fd_any = fd as { startup: number; active: number; recovery: number };
      const expectedTotal = fd_any.startup + fd_any.active + fd_any.recovery;
      expect(
        seq.frames.length,
        `${animName}: 帧数 ${seq.frames.length} != FRAME_DATA 总帧数 ${expectedTotal}`,
      ).toBe(expectedTotal);
    }
  });

  it('必杀技帧数 = startup + active + recovery', () => {
    for (const [fdKey, animName] of Object.entries(SPECIAL_ATTACK_MAP)) {
      const fd = FRAME_DATA[fdKey as keyof typeof FRAME_DATA];
      const seq = getSequence(ANIMATION_MANIFEST, RYO, animName);
      if (!fd || !seq) continue;

      const fd_any = fd as { startup: number; active: number; recovery: number };
      const expectedTotal = fd_any.startup + fd_any.active + fd_any.recovery;
      expect(
        seq.frames.length,
        `${animName}: 帧数 ${seq.frames.length} != FRAME_DATA 总帧数 ${expectedTotal}`,
      ).toBe(expectedTotal);
    }
  });
});

// =====================================================================
// 8. cancelFrames fall within active/recovery range
// =====================================================================

describe('cancelFrames 落在 active/recovery 范围', () => {
  it('通常技 cancelFrames 从 active 阶段开始', () => {
    for (const [fdKey, animName] of Object.entries(NORMAL_ATTACK_MAP)) {
      const fd = FRAME_DATA[fdKey as keyof typeof FRAME_DATA];
      const seq = getSequence(ANIMATION_MANIFEST, RYO, animName);
      if (!fd || !seq || seq.cancelFrames.length === 0) continue;

      const fd_any = fd as { startup: number; active: number; recovery: number };
      const firstCancel = seq.cancelFrames[0];
      // 第一个取消帧应 >= startup (active 阶段起始)
      expect(
        firstCancel,
        `${animName}: 首个取消帧 ${firstCancel} 应 >= startup ${fd_any.startup}`,
      ).toBeGreaterThanOrEqual(fd_any.startup);
      // 最后一个取消帧应 < total frames
      expect(
        seq.cancelFrames[seq.cancelFrames.length - 1],
        `${animName}: 最后取消帧应 < 总帧数`,
      ).toBeLessThan(seq.frames.length);
    }
  });

  it('必杀技 cancelFrames 在合法范围内', () => {
    for (const [fdKey, animName] of Object.entries(SPECIAL_ATTACK_MAP)) {
      const fd = FRAME_DATA[fdKey as keyof typeof FRAME_DATA];
      const seq = getSequence(ANIMATION_MANIFEST, RYO, animName);
      if (!fd || !seq || seq.cancelFrames.length === 0) continue;

      const fd_any = fd as { startup: number; active: number; recovery: number };
      const firstCancel = seq.cancelFrames[0];
      expect(
        firstCancel,
        `${animName}: 首个取消帧 ${firstCancel} 应 >= startup ${fd_any.startup}`,
      ).toBeGreaterThanOrEqual(fd_any.startup);
      expect(
        seq.cancelFrames[seq.cancelFrames.length - 1],
        `${animName}: 最后取消帧应 < 总帧数`,
      ).toBeLessThan(seq.frames.length);
    }
  });
});

// =====================================================================
// 9. Portrait manifest has Ryo entry
// =====================================================================

describe('Ryo portrait manifest', () => {
  it('PORTRAIT_MANIFEST 包含 Ryo', () => {
    expect(PORTRAIT_MANIFEST.portraits[RYO]).toBeDefined();
  });

  it('Ryo 拥有全部 4 种尺寸肖像', () => {
    const sizes = ['select', 'vs', 'hud', 'win'] as const;
    for (const size of sizes) {
      expect(
        PORTRAIT_MANIFEST.portraits[RYO][size],
        `Ryo 缺少 ${size} 尺寸肖像`,
      ).toBeDefined();
    }
  });
});

// =====================================================================
// 10. Select portrait dimensions are correct
// =====================================================================

describe('Ryo select portrait 尺寸', () => {
  it('select 肖像尺寸为 120x120', () => {
    const entry = getSelectPortrait(PORTRAIT_MANIFEST, RYO);
    expect(entry).toBeDefined();
    expect(entry!.width).toBe(PORTRAIT_SIZES.select.width);
    expect(entry!.height).toBe(PORTRAIT_SIZES.select.height);
    expect(entry!.width).toBe(120);
    expect(entry!.height).toBe(120);
  });

  it('Ryo 肖像颜色与 sprite manifest 一致', () => {
    const entry = getSelectPortrait(PORTRAIT_MANIFEST, RYO);
    expect(entry!.fallbackColor).toBe('#DD6600'); // outfit
    expect(entry!.fallbackAccent).toBe('#8B4513'); // hair
  });
});

// =====================================================================
// 11. Ryo special move active frames have hitboxKey
// =====================================================================

describe('Ryo 必杀技 active 帧 hitboxKey', () => {
  it('ryo_koou active 帧有 hitboxKey = RYO_KOOU', () => {
    const activeFrames = getActiveFrames(ANIMATION_MANIFEST, RYO, 'ryo_koou');
    expect(activeFrames.length).toBeGreaterThan(0);
    for (const f of activeFrames) {
      expect(f.hitboxKey).toBe('RYO_KOOU');
    }
  });

  it('ryo_ko_hou active 帧有 hitboxKey = RYO_KO_HOU', () => {
    const activeFrames = getActiveFrames(ANIMATION_MANIFEST, RYO, 'ryo_ko_hou');
    expect(activeFrames.length).toBeGreaterThan(0);
    for (const f of activeFrames) {
      expect(f.hitboxKey).toBe('RYO_KO_HOU');
    }
  });
});

// =====================================================================
// 12. Backward-compatible names still work
// =====================================================================

describe('Ryo 向后兼容旧名', () => {
  it('sprite manifest 旧名 koouken/ko_hou/dm_haou 仍存在', () => {
    expect(hasAnimation(SPRITE_MANIFEST, RYO, 'koouken')).toBe(true);
    expect(hasAnimation(SPRITE_MANIFEST, RYO, 'ko_hou')).toBe(true);
    expect(hasAnimation(SPRITE_MANIFEST, RYO, 'dm_haou')).toBe(true);
  });

  it('animation manifest 旧名 koouken/ko_hou/hien/haou/dm_haou 仍存在', () => {
    expect(hasSequence(ANIMATION_MANIFEST, RYO, 'koouken')).toBe(true);
    expect(hasSequence(ANIMATION_MANIFEST, RYO, 'ko_hou')).toBe(true);
    expect(hasSequence(ANIMATION_MANIFEST, RYO, 'hien')).toBe(true);
    expect(hasSequence(ANIMATION_MANIFEST, RYO, 'haou')).toBe(true);
    expect(hasSequence(ANIMATION_MANIFEST, RYO, 'dm_haou')).toBe(true);
  });
});
