/**
 * Input window (tightened timing) tests — validates COMMAND_WINDOW=12,
 * HCF_WINDOW=24, DOUBLE_QCF_WINDOW=28, and QCF leniency.
 *
 * Iter-H29 tightened: COMMAND_WINDOW 18→12, HCF_WINDOW 28→24.
 */
import { describe, it, expect } from 'vitest';
import { CommandBuffer } from '../src/input/commandBuffer.js';
import { AttackType } from '../src/core/types.js';
import {
  COMMAND_WINDOW,
  HCF_WINDOW,
  DOUBLE_QCF_WINDOW,
} from '../src/core/constants.js';

describe('COMMAND_WINDOW=12帧内指令有效', () => {
  it('constants: COMMAND_WINDOW应等于12', () => {
    expect(COMMAND_WINDOW).toBe(12);
  });

  it('QCF在12帧内完成能识别', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('downforward', 6);
    buf.record('forward', 11);
    buf.recordPress('punch', 12);
    const result = buf.checkSpecial(12, true);
    expect(result).toBe(AttackType.SPECIAL_PROJECTILE);
  });

  it('QCF刚好在12帧边界能识别', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('downforward', 6);
    buf.record('forward', 12);
    buf.recordPress('punch', 12);
    // forward at frame 12, current frame 12 => diff=0, within window
    const result = buf.checkSpecial(12, true);
    expect(result).toBe(AttackType.SPECIAL_PROJECTILE);
  });

  it('DP在12帧内完成能识别', () => {
    const buf = new CommandBuffer();
    buf.record('forward', 0);
    buf.record('down', 5);
    buf.record('downforward', 10);
    buf.recordPress('punch', 11);
    const result = buf.checkSpecial(11, true);
    expect(result).toBe(AttackType.SPECIAL_UPPER);
  });

  it('QCB在12帧内完成能识别', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('downback', 4);
    buf.record('back', 8);
    const result = buf.checkKickSpecial(10, true);
    expect(result).toBe(AttackType.KYO_RED_KICK);
  });
});

describe('超过12帧的指令不被识别', () => {
  it('QCF第1个输入在13帧前不被识别', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('downforward', 6);
    buf.record('forward', 11);
    // 检测时刻 13 — down(0) 距 13 已 13 帧 > 12
    buf.recordPress('punch', 13);
    const result = buf.checkSpecial(13, true);
    expect(result).toBeNull();
  });

  it('所有输入超过12帧窗口不被识别', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('downforward', 5);
    buf.record('forward', 10);
    // 检测时刻 25 — 所有输入 > 12帧
    buf.recordPress('punch', 25);
    const result = buf.checkSpecial(25, true);
    expect(result).toBeNull();
  });

  it('部分输入在窗口内但关键输入在窗口外不被识别', () => {
    const buf = new CommandBuffer();
    buf.record('forward', 0);    // 25帧前
    buf.record('down', 5);       // 20帧前
    buf.record('downforward', 10); // 15帧前
    // 检测时刻 25 — forward 在25帧前 > 12
    buf.recordPress('punch', 25);
    const result = buf.checkSpecial(25, true);
    expect(result).toBeNull();
  });
});

describe('HCF_WINDOW=24帧内半圆指令有效', () => {
  it('constants: HCF_WINDOW应等于24', () => {
    expect(HCF_WINDOW).toBe(24);
  });

  it('HCB在24帧内完成能识别', () => {
    const buf = new CommandBuffer();
    buf.record('forward', 0);
    buf.record('downforward', 5);
    buf.record('down', 10);
    buf.record('downback', 15);
    buf.record('back', 20);
    expect(buf.hasHCB(22)).toBe(true);
  });

  it('HCB刚好在24帧边界能识别', () => {
    const buf = new CommandBuffer();
    buf.record('forward', 0);
    buf.record('downforward', 6);
    buf.record('down', 12);
    buf.record('downback', 18);
    buf.record('back', 24);
    expect(buf.hasHCB(24)).toBe(true);
  });

  it('HCB超过24帧不被识别', () => {
    const buf = new CommandBuffer();
    buf.record('forward', 0);
    buf.record('downforward', 6);
    buf.record('down', 12);
    buf.record('downback', 18);
    buf.record('back', 24);
    // 检测时刻 26 — forward(0) 距 26 已 26帧 > 24
    expect(buf.hasHCB(26)).toBe(false);
  });

  it('HCB shortcut (forward→down→back) 在24帧内识别', () => {
    const buf = new CommandBuffer();
    buf.record('forward', 0);
    buf.record('down', 8);
    buf.record('back', 16);
    expect(buf.hasHCB(20)).toBe(true);
  });

  it('Rekka HCB followup 在24帧窗口内检测', () => {
    const buf = new CommandBuffer();
    buf.record('forward', 0);
    buf.record('down', 8);
    buf.record('back', 16);
    buf.recordPress('punch', 18);
    const result = buf.checkRekkaFollowHCB(18, true);
    expect(result).toBe(AttackType.KYO_ARAGAMI_YANOSABI);
  });

  it('Rekka HCB followup 超过24帧不被检测', () => {
    const buf = new CommandBuffer();
    buf.record('forward', 0);
    buf.record('down', 8);
    buf.record('back', 16);
    // 检测时刻 28 — forward(0) 距 28 已 28帧 > 24
    buf.recordPress('punch', 28);
    const result = buf.checkRekkaFollowHCB(28, true);
    expect(result).toBeNull();
  });
});

describe('DOUBLE_QCF_WINDOW=28帧内双QCF有效', () => {
  it('constants: DOUBLE_QCF_WINDOW应等于28', () => {
    expect(DOUBLE_QCF_WINDOW).toBe(28);
  });

  it('QCFx2 在28帧内完成能识别', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('forward', 3);
    buf.record('down', 14);
    buf.record('forward', 17);
    buf.recordPress('punch', 20);
    const result = buf.checkDMMotion(20, true, false);
    expect(result).toBe('QCFx2_P');
  });

  it('QCFx2 刚好在28帧边界能识别', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('forward', 3);
    buf.record('down', 14);
    buf.record('forward', 17);
    buf.recordPress('punch', 28);
    const result = buf.checkDMMotion(28, true, false);
    expect(result).toBe('QCFx2_P');
  });

  it('QCFx2 超过28帧不被识别', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('forward', 3);
    buf.record('down', 14);
    buf.record('forward', 17);
    // 检测时刻 30 — down(0) 距 30 已 30帧 > 28
    buf.recordPress('punch', 30);
    const result = buf.checkDMMotion(30, true, false);
    expect(result).toBeNull();
  });

  it('QCFx2+K 检测为 QCFx2_K', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('forward', 3);
    buf.record('down', 14);
    buf.record('forward', 17);
    buf.recordPress('kick', 20);
    const result = buf.checkDMMotion(20, false, true);
    expect(result).toBe('QCFx2_K');
  });

  it('完整6步QCFx2在28帧内识别', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('downforward', 3);
    buf.record('forward', 6);
    buf.record('down', 9);
    buf.record('downforward', 12);
    buf.record('forward', 15);
    buf.recordPress('punch', 17);
    const result = buf.checkDMMotion(17, true, false);
    expect(result).toBe('QCFx2_P');
  });

  it('QCBx2+K 在28帧内识别', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('back', 3);
    buf.record('down', 14);
    buf.record('back', 17);
    buf.recordPress('kick', 20);
    const result = buf.checkDMMotion(20, false, true);
    expect(result).toBe('QCBx2_K');
  });

  it('QCBx2+P 在28帧内识别', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('back', 3);
    buf.record('down', 14);
    buf.record('back', 17);
    buf.recordPress('punch', 20);
    const result = buf.checkDMMotion(20, true, false);
    expect(result).toBe('QCBx2_P');
  });
});

describe('QCF leniency: 斜向输入被接受为QCF一部分', () => {
  it('↓→ (跳过↘) 在6帧内被接受为QCF', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('forward', 3);
    buf.recordPress('punch', 5);
    const result = buf.checkSpecial(5, true);
    expect(result).toBe(AttackType.SPECIAL_PROJECTILE);
  });

  it('↓→ 超过6帧leniency不被接受', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('forward', 8);
    buf.recordPress('punch', 10);
    // down→forward 间隔8帧 > 6帧leniency
    const result = buf.checkSpecial(10, true);
    expect(result).toBeNull();
  });

  it('↓↘→ 完整QCF始终被接受', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('downforward', 3);
    buf.record('forward', 6);
    buf.recordPress('punch', 8);
    const result = buf.checkSpecial(8, true);
    expect(result).toBe(AttackType.SPECIAL_PROJECTILE);
  });

  it('hasQCF也支持lenient匹配', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('forward', 3);
    expect(buf.hasQCF(5)).toBe(true);
  });

  it('hasQCF lenient在6帧内返回true', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('forward', 6);
    expect(buf.hasQCF(6)).toBe(true);
  });

  it('hasQCB也支持lenient匹配', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('back', 3);
    expect(buf.hasQCB(5)).toBe(true);
  });

  it('完整3步QCF和lenient 2步QCF同时存在时都返回true', () => {
    const buf1 = new CommandBuffer();
    buf1.record('down', 0);
    buf1.record('downforward', 3);
    buf1.record('forward', 6);
    expect(buf1.hasQCF(8)).toBe(true);

    const buf2 = new CommandBuffer();
    buf2.record('down', 0);
    buf2.record('forward', 3);
    expect(buf2.hasQCF(5)).toBe(true);
  });
});

describe('DM快捷模式在DOUBLE_QCF_WINDOW内识别', () => {
  it('↓→↓↘→ 快捷模式在28帧内识别', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('forward', 3);
    buf.record('down', 10);
    buf.record('downforward', 13);
    buf.record('forward', 16);
    buf.recordPress('punch', 18);
    const result = buf.checkDMMotion(18, true, false);
    expect(result).toBe('QCFx2_P');
  });

  it('↘→↘→ 快捷模式在28帧内识别', () => {
    const buf = new CommandBuffer();
    buf.record('downforward', 0);
    buf.record('forward', 3);
    buf.record('downforward', 10);
    buf.record('forward', 13);
    buf.recordPress('punch', 16);
    const result = buf.checkDMMotion(16, true, false);
    expect(result).toBe('QCFx2_P');
  });
});
