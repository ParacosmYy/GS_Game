/**
 * AnnouncePresets — 预定义的回合过渡播报序列工厂
 *
 * 提供标准格斗游戏播报序列：回合开始、FIGHT、K.O.、PERFECT、TIME OVER、胜利。
 * 所有数值均为帧数（60 FPS 基准），渲染层按实际帧率适配。
 *
 * 动画曲线是纯函数，progress ∈ [0, 1]，返回值不限制范围（scale 可大于 1）。
 */

import type { AnnounceStep } from './announceSequence.js';

// ---------------------------------------------------------------------------
// 动画曲线工具
// ---------------------------------------------------------------------------

/**
 * 弹入曲线：先放大再缩回正常大小，模拟弹性着陆。
 * 前 15% 进度从 2.2× 缩到 1×，之后保持 1×。
 */
export function popIn(progress: number): number {
  if (progress < 0.15) {
    return 1 + (1 - progress / 0.15) * 1.2;
  }
  return 1;
}

/**
 * 淡入-保持-淡出曲线。
 * 前 15% 淡入，后 20% 淡出，中间保持满 alpha。
 */
export function fadeInHoldOut(progress: number): number {
  if (progress < 0.15) {
    return progress / 0.15;
  }
  if (progress > 0.8) {
    return (1 - progress) / 0.2;
  }
  return 1;
}

/**
 * 爆发式弹出曲线：从 3× 瞬间缩到 1×，比 popIn 更剧烈。
 * 前 10% 进度从 3× 缩到 1×，之后保持 1×。
 */
export function burstIn(progress: number): number {
  if (progress < 0.1) {
    return 1 + (1 - progress / 0.1) * 2.0;
  }
  return 1;
}

/**
 * 淡入-保持-提前淡出：用于 FIGHT! 等需要更早开始消失的文字。
 * 前 15% 淡入，50% 之后开始淡出。
 */
function fadeInEarlyOut(progress: number): number {
  if (progress < 0.15) {
    return progress / 0.15;
  }
  if (progress > 0.5) {
    return (1 - progress) / 0.5;
  }
  return 1;
}

/**
 * 淡入-保持-延迟淡出：用于 K.O. 等需要更长时间保持的文字。
 * 前 15% 淡入，85% 之后开始淡出。
 */
function fadeInLateOut(progress: number): number {
  if (progress < 0.15) {
    return progress / 0.15;
  }
  if (progress > 0.85) {
    return (1 - progress) / 0.15;
  }
  return 1;
}

// ---------------------------------------------------------------------------
// 序列工厂
// ---------------------------------------------------------------------------

/** 创建回合开始播报序列：ROUND X → READY? → FIGHT! */
export function createRoundStartSequence(roundNumber: number, isFinalRound: boolean = false): AnnounceStep[] {
  return [
    {
      id: 'round_display',
      text: isFinalRound ? 'FINAL ROUND' : `ROUND ${roundNumber}`,
      duration: 80,
      fillColor: isFinalRound ? '#ff4400' : '#ffcc00',
      glowColor: isFinalRound ? '#ff2200' : '#ff8800',
      fontSize: isFinalRound ? 60 : 52,
      scaleCurve: popIn,
      alphaCurve: fadeInHoldOut,
      sfxTriggerFrame: 5,
      sfxId: 'round_call',
      flash: isFinalRound ? { color: '#ff4400', alpha: 0.15, frames: 8 } : null,
      shockwaveRings: isFinalRound ? 3 : 1,
    },
    {
      id: 'ready_display',
      text: 'READY?',
      duration: 40,
      fillColor: '#ffffff',
      glowColor: '#4488ff',
      fontSize: 48,
      scaleCurve: popIn,
      alphaCurve: fadeInHoldOut,
      sfxTriggerFrame: 5,
      sfxId: 'ready',
      flash: null,
      shockwaveRings: 1,
    },
    {
      id: 'fight_display',
      text: 'FIGHT!',
      duration: 50,
      fillColor: '#ff4400',
      glowColor: '#ff2200',
      fontSize: 72,
      scaleCurve: burstIn,
      alphaCurve: fadeInEarlyOut,
      sfxTriggerFrame: 2,
      sfxId: 'fight',
      flash: { color: '#ffffff', alpha: 0.2, frames: 6 },
      shockwaveRings: 3,
    },
  ];
}

/** 创建 K.O. 播报序列，可选附加 PERFECT */
export function createKOSequence(isPerfect: boolean): AnnounceStep[] {
  const steps: AnnounceStep[] = [
    {
      id: 'ko_display',
      text: 'K.O.!',
      duration: 100,
      fillColor: '#ff2200',
      glowColor: '#ff0000',
      fontSize: 100,
      scaleCurve: burstIn,
      alphaCurve: fadeInLateOut,
      sfxTriggerFrame: 3,
      sfxId: 'ko',
      flash: { color: '#ff2200', alpha: 0.35, frames: 15 },
      shockwaveRings: 5,
    },
  ];

  if (isPerfect) {
    steps.push({
      id: 'perfect_display',
      text: 'PERFECT!',
      duration: 80,
      fillColor: '#ffcc00',
      glowColor: '#ffaa00',
      fontSize: 42,
      scaleCurve: popIn,
      alphaCurve: fadeInHoldOut,
      sfxTriggerFrame: 5,
      sfxId: 'perfect',
      flash: { color: '#ffcc00', alpha: 0.25, frames: 8 },
      shockwaveRings: 3,
    });
  }

  return steps;
}

/** 创建 TIME OVER 播报序列 */
export function createTimeOverSequence(): AnnounceStep[] {
  return [
    {
      id: 'time_over_display',
      text: 'TIME OVER',
      duration: 100,
      fillColor: '#ffaa00',
      glowColor: '#ff8800',
      fontSize: 72,
      scaleCurve: popIn,
      alphaCurve: fadeInHoldOut,
      sfxTriggerFrame: 5,
      sfxId: 'time_over',
      flash: { color: '#ffaa00', alpha: 0.2, frames: 8 },
      shockwaveRings: 3,
    },
  ];
}

/** 创建胜利者播报序列 */
export function createWinnerSequence(winnerName: string): AnnounceStep[] {
  return [
    {
      id: 'winner_display',
      text: winnerName,
      duration: 120,
      fillColor: '#ffcc00',
      glowColor: '#ffaa00',
      fontSize: 36,
      scaleCurve: popIn,
      alphaCurve: fadeInHoldOut,
      sfxTriggerFrame: 5,
      sfxId: 'victory',
      flash: { color: '#ffcc00', alpha: 0.15, frames: 10 },
      shockwaveRings: 2,
    },
  ];
}

/** 创建舞台开场仪式序列：舞台名称展示 */
export function createStageIntroSequence(stageName: string, accentColor: string = '#ffcc44'): AnnounceStep[] {
  return [
    {
      id: 'stage_intro_name',
      text: stageName,
      duration: 100,
      fillColor: accentColor,
      glowColor: '#ffffff',
      fontSize: 36,
      scaleCurve: popIn,
      alphaCurve: fadeInHoldOut,
      sfxTriggerFrame: 8,
      sfxId: 'round_call',
      flash: { color: accentColor, alpha: 0.12, frames: 10 },
      shockwaveRings: 2,
    },
  ];
}
