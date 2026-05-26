/**
 * Character Select State — cursor movement, ready flags, color palette, VS splash, countdown
 * Eliminates window.__prev* global hacks by internalizing edge detection
 */
import type { PlayerInput } from '../core/types.js';
import { ROSTER } from '../characters/index.js';
import type { CharacterDefinition } from '../characters/types.js';
import { AdvancedAI } from '../ai/advancedAI.js';
import { FighterController } from '../entities/fighterController.js';
import { Fighter } from '../entities/fighter.js';
import { gameRandomInt } from '../core/prng.js';
import { CommandBuffer } from '../input/commandBuffer.js';
import { initAudio, playSelect } from '../audio/sampler.js';

// 随机选择格子放在ROSTER末尾的虚拟索引
export const RANDOM_SLOT_INDEX = ROSTER.length;

// 总格子数 = 真实角色 + 1个随机格
export const TOTAL_SELECT_SLOTS = ROSTER.length + 1;

// 颜色调色板定义 — KOF2002: A/B/C/D分别对应不同配色
export const COLOR_PALETTES = [
  { label: 'A', color: '#ffcc00' },  // P1默认色
  { label: 'B', color: '#44aaff' },  // P2色
  { label: 'C', color: '#44ff44' },  // 3P色
  { label: 'D', color: '#ff4444' },  // 4P色
] as const;

// VS闪屏持续时间(帧)
export const VS_SPLASH_DURATION = 90;

export interface SelectResult {
  p1Char: CharacterDefinition;
  p2Char: CharacterDefinition;
  p1Team: CharacterDefinition[];
  p2Team: CharacterDefinition[];
  p2IsAI: boolean;
  p2AI: AdvancedAI | null;
  p1ColorIndex: number;
  p2ColorIndex: number;
}

export class SelectState {
  p1Cursor = 0;
  p2Cursor = 1;
  p1Ready = false;
  p2Ready = false;
  p2IsAI = true;
  countdown = -1;

  // 颜色选择索引 (0=A, 1=B, 2=C, 3=D)
  p1ColorIndex = 0;
  p2ColorIndex = 1;

  // VS闪屏状态
  vsSplashTimer = -1;  // -1 = 未开始, 0~VS_SPLASH_DURATION = 闪屏进行中
  p1ConfirmedChar: CharacterDefinition | null = null;
  p2ConfirmedChar: CharacterDefinition | null = null;

  // 上/下方向边缘检测
  private prevP1Up = false;
  private prevP1Down = false;
  private prevP2Up = false;
  private prevP2Down = false;
  // 左/右方向边缘检测
  private prevP1Left = false;
  private prevP1Right = false;
  private prevP2Left = false;
  private prevP2Right = false;
  // 按键边缘检测
  private prevP1A = false;
  private prevP1B = false;
  private prevP1C = false;
  private prevP1D = false;
  private prevP2A = false;
  private prevP2B = false;
  private prevP2C = false;
  private prevP2D = false;
  private prevToggleAI = false;

  private p1Ctrl: FighterController;
  private p2Ctrl: FighterController;
  private p1: Fighter;
  private p2: Fighter;
  private p2Cmd: CommandBuffer;

  constructor(
    p1Ctrl: FighterController, p2Ctrl: FighterController,
    p1: Fighter, p2: Fighter, p2Cmd: CommandBuffer
  ) {
    this.p1Ctrl = p1Ctrl;
    this.p2Ctrl = p2Ctrl;
    this.p1 = p1;
    this.p2 = p2;
    this.p2Cmd = p2Cmd;
  }

  /** 判断光标位置是否为随机选择格 */
  isRandomSlot(index: number): boolean {
    return index === RANDOM_SLOT_INDEX;
  }

  /** 获取光标位置的角色 (随机格返回null) */
  getCharAtCursor(index: number): CharacterDefinition | null {
    if (index >= ROSTER.length) return null;
    return ROSTER[index];
  }

  /** Process one frame of select screen input. Returns SelectResult if VS splash finishes */
  update(rawP1: PlayerInput, rawP2: PlayerInput, isAITogglePressed: boolean): SelectResult | null {
    // VS闪屏倒计时中
    if (this.vsSplashTimer >= 0) {
      this.vsSplashTimer++;
      if (this.vsSplashTimer >= VS_SPLASH_DURATION) {
        return this.confirm();
      }
      return null;
    }

    // P1未确认: 移动光标 + 选色 + 确认
    if (!this.p1Ready) {
      if (rawP1.left && !this.prevP1Left)
        this.p1Cursor = (this.p1Cursor - 1 + TOTAL_SELECT_SLOTS) % TOTAL_SELECT_SLOTS;
      if (rawP1.right && !this.prevP1Right)
        this.p1Cursor = (this.p1Cursor + 1) % TOTAL_SELECT_SLOTS;
      if (rawP1.up && !this.prevP1Up)
        this.p1Cursor = (this.p1Cursor - 8 + TOTAL_SELECT_SLOTS) % TOTAL_SELECT_SLOTS;
      if (rawP1.down && !this.prevP1Down)
        this.p1Cursor = (this.p1Cursor + 8) % TOTAL_SELECT_SLOTS;
      // 按键选择颜色并确认
      if (rawP1.buttonA && !this.prevP1A) { this.p1ColorIndex = 0; this.p1Ready = true; initAudio(); playSelect(); }
      if (rawP1.buttonB && !this.prevP1B) { this.p1ColorIndex = 1; this.p1Ready = true; initAudio(); playSelect(); }
      if (rawP1.buttonC && !this.prevP1C) { this.p1ColorIndex = 2; this.p1Ready = true; initAudio(); playSelect(); }
      if (rawP1.buttonD && !this.prevP1D) { this.p1ColorIndex = 3; this.p1Ready = true; initAudio(); playSelect(); }
    }

    // P2 cursor / AI auto-select
    if (this.p2IsAI) {
      if (this.p1Ready && !this.p2Ready) {
        // AI随机选择 (避开P1选的角色)
        let aiCursor = (this.p1Cursor + 1 + gameRandomInt(TOTAL_SELECT_SLOTS - 1)) % TOTAL_SELECT_SLOTS;
        this.p2Cursor = aiCursor;
        this.p2ColorIndex = gameRandomInt(4);
        this.p2Ready = true;
      }
    } else if (!this.p2Ready) {
      if (rawP2.left && !this.prevP2Left)
        this.p2Cursor = (this.p2Cursor - 1 + TOTAL_SELECT_SLOTS) % TOTAL_SELECT_SLOTS;
      if (rawP2.right && !this.prevP2Right)
        this.p2Cursor = (this.p2Cursor + 1) % TOTAL_SELECT_SLOTS;
      if (rawP2.up && !this.prevP2Up)
        this.p2Cursor = (this.p2Cursor - 8 + TOTAL_SELECT_SLOTS) % TOTAL_SELECT_SLOTS;
      if (rawP2.down && !this.prevP2Down)
        this.p2Cursor = (this.p2Cursor + 8) % TOTAL_SELECT_SLOTS;
      if (rawP2.buttonA && !this.prevP2A) { this.p2ColorIndex = 0; this.p2Ready = true; }
      if (rawP2.buttonB && !this.prevP2B) { this.p2ColorIndex = 1; this.p2Ready = true; }
      if (rawP2.buttonC && !this.prevP2C) { this.p2ColorIndex = 2; this.p2Ready = true; }
      if (rawP2.buttonD && !this.prevP2D) { this.p2ColorIndex = 3; this.p2Ready = true; }
    }

    // Toggle AI (T key, edge-detected)
    if (isAITogglePressed && !this.prevToggleAI) this.p2IsAI = !this.p2IsAI;

    // 保存前一帧状态用于边缘检测
    this.prevP1Left = rawP1.left;
    this.prevP1Right = rawP1.right;
    this.prevP1Up = rawP1.up;
    this.prevP1Down = rawP1.down;
    this.prevP1A = rawP1.buttonA;
    this.prevP1B = rawP1.buttonB;
    this.prevP1C = rawP1.buttonC;
    this.prevP1D = rawP1.buttonD;
    this.prevP2Left = rawP2.left;
    this.prevP2Right = rawP2.right;
    this.prevP2Up = rawP2.up;
    this.prevP2Down = rawP2.down;
    this.prevP2A = rawP2.buttonA;
    this.prevP2B = rawP2.buttonB;
    this.prevP2C = rawP2.buttonC;
    this.prevP2D = rawP2.buttonD;
    this.prevToggleAI = isAITogglePressed;

    // 双方确认后进入VS闪屏
    if (this.p1Ready && this.p2Ready && this.vsSplashTimer < 0) {
      this.vsSplashTimer = 0;
      // 解析随机选择
      this.p1ConfirmedChar = this.resolveChar(this.p1Cursor);
      this.p2ConfirmedChar = this.resolveChar(this.p2Cursor);
    }

    return null;
  }

  /** 解析光标位置的实际角色 (随机格→随机选一个) */
  private resolveChar(cursor: number): CharacterDefinition {
    if (cursor >= ROSTER.length) {
      return ROSTER[gameRandomInt(ROSTER.length)];
    }
    return ROSTER[cursor];
  }

  private confirm(): SelectResult {
    const p1Char = this.p1ConfirmedChar || ROSTER[0];
    const p2Char = this.p2ConfirmedChar || ROSTER[1];
    this.p1Ctrl.setCharacter(p1Char);
    this.p2Ctrl.setCharacter(p2Char);
    this.p1.setStats(p1Char.stats);
    this.p2.setStats(p2Char.stats);
    const p2AI = this.p2IsAI ? new AdvancedAI(this.p2, this.p1, p2Char, 'medium') : null;

    // Build 3-member teams: selected char + next 2 in roster (wrapping)
    const p1Idx = ROSTER.indexOf(p1Char);
    const p2Idx = ROSTER.indexOf(p2Char);
    const p1Team = [p1Char];
    for (let i = 1; i < 3; i++) p1Team.push(ROSTER[(p1Idx + i) % ROSTER.length]);
    const p2Team = [p2Char];
    for (let i = 1; i < 3; i++) p2Team.push(ROSTER[(p2Idx + i) % ROSTER.length]);

    return {
      p1Char, p2Char, p1Team, p2Team,
      p2IsAI: this.p2IsAI, p2AI,
      p1ColorIndex: this.p1ColorIndex,
      p2ColorIndex: this.p2ColorIndex,
    };
  }

  reset(): void {
    this.p1Cursor = 0;
    this.p2Cursor = 1;
    this.p1Ready = false;
    this.p2Ready = false;
    this.countdown = -1;
    this.p1ColorIndex = 0;
    this.p2ColorIndex = 1;
    this.vsSplashTimer = -1;
    this.p1ConfirmedChar = null;
    this.p2ConfirmedChar = null;
    this.prevP1Left = false;
    this.prevP1Right = false;
    this.prevP1Up = false;
    this.prevP1Down = false;
    this.prevP1A = false;
    this.prevP1B = false;
    this.prevP1C = false;
    this.prevP1D = false;
    this.prevP2Left = false;
    this.prevP2Right = false;
    this.prevP2Up = false;
    this.prevP2Down = false;
    this.prevP2A = false;
    this.prevP2B = false;
    this.prevP2C = false;
    this.prevP2D = false;
    this.prevToggleAI = false;
  }
}
