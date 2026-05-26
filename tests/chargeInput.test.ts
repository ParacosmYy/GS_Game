/**
 * Charge input system tests — ChargeState, updateCharge, checkChargeMotion,
 * checkChargeRelease, and getChargeState.
 *
 * Validates the Iter-H29 charge motion implementation with CHARGE_FRAMES_REQUIRED=40.
 */
import { describe, it, expect } from 'vitest';
import { CommandBuffer } from '../src/input/commandBuffer.js';
import { CHARGE_FRAMES_REQUIRED } from '../src/core/constants.js';

describe('蓄力检测: 持续按住方向达到required帧后变为ready', () => {
  it('down蓄力: 按住↓ 40帧后ready=true', () => {
    const buf = new CommandBuffer();
    for (let i = 0; i < CHARGE_FRAMES_REQUIRED; i++) {
      buf.updateCharge('down');
    }
    const state = buf.getChargeState('down');
    expect(state.ready).toBe(true);
    expect(state.frames).toBe(CHARGE_FRAMES_REQUIRED);
    expect(state.direction).toBe('down');
  });

  it('back蓄力: 按住← 40帧后ready=true', () => {
    const buf = new CommandBuffer();
    for (let i = 0; i < CHARGE_FRAMES_REQUIRED; i++) {
      buf.updateCharge('back');
    }
    const state = buf.getChargeState('back');
    expect(state.ready).toBe(true);
    expect(state.frames).toBe(CHARGE_FRAMES_REQUIRED);
    expect(state.direction).toBe('back');
  });

  it('downback蓄力: 按住↙ 40帧后三个方向都是ready', () => {
    const buf = new CommandBuffer();
    for (let i = 0; i < CHARGE_FRAMES_REQUIRED; i++) {
      buf.updateCharge('downback');
    }
    // downback 同时蓄 down 和 back
    expect(buf.getChargeState('downback').ready).toBe(true);
    expect(buf.getChargeState('down').ready).toBe(true);
    expect(buf.getChargeState('back').ready).toBe(true);
    expect(buf.getChargeState('downback').frames).toBe(CHARGE_FRAMES_REQUIRED);
  });

  it('downforward同时蓄down但不含back', () => {
    const buf = new CommandBuffer();
    for (let i = 0; i < CHARGE_FRAMES_REQUIRED; i++) {
      buf.updateCharge('downforward');
    }
    // downforward 含 down 但不含 back
    expect(buf.getChargeState('down').ready).toBe(true);
    expect(buf.getChargeState('back').ready).toBe(false);
    expect(buf.getChargeState('back').frames).toBe(0);
  });

  it('upback同时蓄back但不含down', () => {
    const buf = new CommandBuffer();
    for (let i = 0; i < CHARGE_FRAMES_REQUIRED; i++) {
      buf.updateCharge('upback');
    }
    expect(buf.getChargeState('back').ready).toBe(true);
    expect(buf.getChargeState('down').ready).toBe(false);
    expect(buf.getChargeState('down').frames).toBe(0);
  });
});

describe('蓄力释放: ↓蓄↑检测成功，重置蓄力计数', () => {
  it('↓蓄满后切换到↑触发down_charge_up', () => {
    const buf = new CommandBuffer();
    for (let i = 0; i < CHARGE_FRAMES_REQUIRED; i++) {
      buf.updateCharge('down');
    }
    // 切换到 up 并检测
    const motion = buf.checkChargeMotion('up', 'punch', 100);
    expect(motion).toBe('down_charge_up');
  });

  it('↓蓄满后切换到upforward也触发down_charge_up', () => {
    const buf = new CommandBuffer();
    for (let i = 0; i < CHARGE_FRAMES_REQUIRED; i++) {
      buf.updateCharge('down');
    }
    const motion = buf.checkChargeMotion('upforward', 'punch', 100);
    expect(motion).toBe('down_charge_up');
  });

  it('↓蓄↑触发后down蓄力计数被重置为0', () => {
    const buf = new CommandBuffer();
    for (let i = 0; i < CHARGE_FRAMES_REQUIRED; i++) {
      buf.updateCharge('down');
    }
    expect(buf.getChargeState('down').frames).toBe(CHARGE_FRAMES_REQUIRED);
    buf.checkChargeMotion('up', 'punch', 100);
    // 蓄力计数被重置
    expect(buf.getChargeState('down').frames).toBe(0);
  });

  it('↓蓄满后切换到forward不触发(方向错误)', () => {
    const buf = new CommandBuffer();
    for (let i = 0; i < CHARGE_FRAMES_REQUIRED; i++) {
      buf.updateCharge('down');
    }
    const motion = buf.checkChargeMotion('forward', 'punch', 100);
    expect(motion).toBeNull();
  });
});

describe('←蓄→ 检测成功', () => {
  it('←蓄满后切换到→触发back_charge_forward', () => {
    const buf = new CommandBuffer();
    for (let i = 0; i < CHARGE_FRAMES_REQUIRED; i++) {
      buf.updateCharge('back');
    }
    const motion = buf.checkChargeMotion('forward', 'punch', 100);
    expect(motion).toBe('back_charge_forward');
  });

  it('←蓄满后切换到upforward也触发back_charge_forward', () => {
    const buf = new CommandBuffer();
    for (let i = 0; i < CHARGE_FRAMES_REQUIRED; i++) {
      buf.updateCharge('back');
    }
    const motion = buf.checkChargeMotion('upforward', 'punch', 100);
    expect(motion).toBe('back_charge_forward');
  });

  it('←蓄→触发后back蓄力计数被重置为0', () => {
    const buf = new CommandBuffer();
    for (let i = 0; i < CHARGE_FRAMES_REQUIRED; i++) {
      buf.updateCharge('back');
    }
    buf.checkChargeMotion('forward', 'punch', 100);
    expect(buf.getChargeState('back').frames).toBe(0);
  });

  it('←蓄满后切换到up不触发(方向错误)', () => {
    const buf = new CommandBuffer();
    for (let i = 0; i < CHARGE_FRAMES_REQUIRED; i++) {
      buf.updateCharge('back');
    }
    const motion = buf.checkChargeMotion('up', 'punch', 100);
    expect(motion).toBeNull();
  });
});

describe('蓄力不足40帧不触发', () => {
  it('down蓄力39帧不触发down_charge_up', () => {
    const buf = new CommandBuffer();
    for (let i = 0; i < CHARGE_FRAMES_REQUIRED - 1; i++) {
      buf.updateCharge('down');
    }
    const state = buf.getChargeState('down');
    expect(state.ready).toBe(false);
    expect(state.frames).toBe(CHARGE_FRAMES_REQUIRED - 1);

    const motion = buf.checkChargeMotion('up', 'punch', 100);
    expect(motion).toBeNull();
  });

  it('back蓄力10帧不触发back_charge_forward', () => {
    const buf = new CommandBuffer();
    for (let i = 0; i < 10; i++) {
      buf.updateCharge('back');
    }
    expect(buf.getChargeState('back').ready).toBe(false);
    const motion = buf.checkChargeMotion('forward', 'punch', 100);
    expect(motion).toBeNull();
  });

  it('downback蓄力39帧不触发任何蓄力技', () => {
    const buf = new CommandBuffer();
    for (let i = 0; i < CHARGE_FRAMES_REQUIRED - 1; i++) {
      buf.updateCharge('downback');
    }
    expect(buf.getChargeState('downback').ready).toBe(false);
    const motion = buf.checkChargeMotion('up', 'punch', 100);
    expect(motion).toBeNull();
  });
});

describe('蓄力中途切换方向重置计数', () => {
  it('↓蓄20帧后切neutral再↓蓄20帧不触发', () => {
    const buf = new CommandBuffer();
    // 蓄力20帧
    for (let i = 0; i < 20; i++) {
      buf.updateCharge('down');
    }
    expect(buf.getChargeState('down').frames).toBe(20);
    // 切到neutral——down蓄力重置
    buf.updateCharge('neutral');
    expect(buf.getChargeState('down').frames).toBe(0);
    // 再蓄20帧不够40
    for (let i = 0; i < 20; i++) {
      buf.updateCharge('down');
    }
    expect(buf.getChargeState('down').ready).toBe(false);
    const motion = buf.checkChargeMotion('up', 'punch', 100);
    expect(motion).toBeNull();
  });

  it('←蓄30帧后切forward(释放)再←蓄10帧不触发', () => {
    const buf = new CommandBuffer();
    for (let i = 0; i < 30; i++) {
      buf.updateCharge('back');
    }
    expect(buf.getChargeState('back').frames).toBe(30);
    // 切到 forward — back 蓄力重置
    buf.updateCharge('forward');
    expect(buf.getChargeState('back').frames).toBe(0);
    // 再蓄10帧不够
    for (let i = 0; i < 10; i++) {
      buf.updateCharge('back');
    }
    expect(buf.getChargeState('back').ready).toBe(false);
  });

  it('↓蓄30帧后切↑(非释放方向)再切回↓，蓄力重置', () => {
    const buf = new CommandBuffer();
    for (let i = 0; i < 30; i++) {
      buf.updateCharge('down');
    }
    // 切到 up — down 蓄力重置
    buf.updateCharge('up');
    expect(buf.getChargeState('down').frames).toBe(0);
    // 再切回down重新蓄力
    for (let i = 0; i < 30; i++) {
      buf.updateCharge('down');
    }
    expect(buf.getChargeState('down').ready).toBe(false);
  });

  it('downforward保持down蓄力不重置', () => {
    const buf = new CommandBuffer();
    // down 蓄力 20 帧
    for (let i = 0; i < 20; i++) {
      buf.updateCharge('down');
    }
    // 切到 downforward — down 蓄力继续 (isDown=true)
    for (let i = 0; i < 20; i++) {
      buf.updateCharge('downforward');
    }
    // down 蓄力应累计 40 帧
    expect(buf.getChargeState('down').ready).toBe(true);
    expect(buf.getChargeState('down').frames).toBe(40);
  });
});

describe('getChargeState() 返回正确状态', () => {
  it('初始状态: frames=0, ready=false', () => {
    const buf = new CommandBuffer();
    const down = buf.getChargeState('down');
    const back = buf.getChargeState('back');
    const downback = buf.getChargeState('downback');
    expect(down.frames).toBe(0);
    expect(down.ready).toBe(false);
    expect(down.direction).toBe('down');
    expect(back.frames).toBe(0);
    expect(back.ready).toBe(false);
    expect(back.direction).toBe('back');
    expect(downback.frames).toBe(0);
    expect(downback.ready).toBe(false);
    expect(downback.direction).toBe('downback');
  });

  it('蓄力过程中状态逐步更新', () => {
    const buf = new CommandBuffer();
    for (let i = 0; i < 10; i++) {
      buf.updateCharge('down');
    }
    const state = buf.getChargeState('down');
    expect(state.frames).toBe(10);
    expect(state.ready).toBe(false);
    expect(state.direction).toBe('down');
  });

  it('超过required帧后ready保持true', () => {
    const buf = new CommandBuffer();
    for (let i = 0; i < CHARGE_FRAMES_REQUIRED + 20; i++) {
      buf.updateCharge('down');
    }
    const state = buf.getChargeState('down');
    expect(state.frames).toBe(CHARGE_FRAMES_REQUIRED + 20);
    expect(state.ready).toBe(true);
  });

  it('reset后所有蓄力状态归零', () => {
    const buf = new CommandBuffer();
    // 使用 downback 同时蓄 down 和 back
    for (let i = 0; i < CHARGE_FRAMES_REQUIRED + 10; i++) {
      buf.updateCharge('downback');
    }
    expect(buf.getChargeState('down').ready).toBe(true);
    expect(buf.getChargeState('back').ready).toBe(true);
    expect(buf.getChargeState('downback').ready).toBe(true);
    buf.reset();
    expect(buf.getChargeState('down').frames).toBe(0);
    expect(buf.getChargeState('down').ready).toBe(false);
    expect(buf.getChargeState('back').frames).toBe(0);
    expect(buf.getChargeState('back').ready).toBe(false);
    expect(buf.getChargeState('downback').frames).toBe(0);
    expect(buf.getChargeState('downback').ready).toBe(false);
  });
});

describe('updateCharge返回值', () => {
  it('返回完整ChargeState记录', () => {
    const buf = new CommandBuffer();
    const result = buf.updateCharge('down');
    expect(result.down).toBeDefined();
    expect(result.back).toBeDefined();
    expect(result.downback).toBeDefined();
    expect(result.down.frames).toBe(1);
    expect(result.down.ready).toBe(false);
    expect(result.down.direction).toBe('down');
    expect(result.back.frames).toBe(0);
  });

  it('连续调用返回递增的frames', () => {
    const buf = new CommandBuffer();
    let lastFrames = 0;
    for (let i = 0; i < 5; i++) {
      const result = buf.updateCharge('down');
      expect(result.down.frames).toBe(lastFrames + 1);
      lastFrames = result.down.frames;
    }
  });
});

describe('checkChargeRelease API', () => {
  it('↓蓄满后释放到↑返回true', () => {
    const buf = new CommandBuffer();
    for (let i = 0; i < CHARGE_FRAMES_REQUIRED; i++) {
      buf.updateCharge('down');
    }
    const released = buf.checkChargeRelease('down', 'up', 'up');
    expect(released).toBe(true);
    expect(buf.getChargeState('down').frames).toBe(0);
  });

  it('↓蓄满后释放到upforward返回true', () => {
    const buf = new CommandBuffer();
    for (let i = 0; i < CHARGE_FRAMES_REQUIRED; i++) {
      buf.updateCharge('down');
    }
    const released = buf.checkChargeRelease('down', 'up', 'upforward');
    expect(released).toBe(true);
  });

  it('←蓄满后释放到→返回true', () => {
    const buf = new CommandBuffer();
    for (let i = 0; i < CHARGE_FRAMES_REQUIRED; i++) {
      buf.updateCharge('back');
    }
    const released = buf.checkChargeRelease('back', 'forward', 'forward');
    expect(released).toBe(true);
  });

  it('←蓄满后释放到upforward返回true', () => {
    const buf = new CommandBuffer();
    for (let i = 0; i < CHARGE_FRAMES_REQUIRED; i++) {
      buf.updateCharge('back');
    }
    const released = buf.checkChargeRelease('back', 'forward', 'upforward');
    expect(released).toBe(true);
  });

  it('蓄力不足时释放返回false', () => {
    const buf = new CommandBuffer();
    for (let i = 0; i < 20; i++) {
      buf.updateCharge('down');
    }
    const released = buf.checkChargeRelease('down', 'up', 'up');
    expect(released).toBe(false);
    // 蓄力计数不应被重置
    expect(buf.getChargeState('down').frames).toBe(20);
  });

  it('方向不匹配时返回false', () => {
    const buf = new CommandBuffer();
    for (let i = 0; i < CHARGE_FRAMES_REQUIRED; i++) {
      buf.updateCharge('down');
    }
    // 释放到forward而不是up
    const released = buf.checkChargeRelease('down', 'up', 'forward');
    expect(released).toBe(false);
  });
});
