/**
 * Character Select State — cursor movement, ready flags, countdown
 * Eliminates window.__prev* global hacks by internalizing edge detection
 */
import type { PlayerInput } from '../core/types.js';
import { ROSTER } from '../characters/index.js';
import type { CharacterDefinition } from '../characters/types.js';
import { SimpleAI } from '../ai/simpleAI.js';
import { FighterController } from '../entities/fighterController.js';
import { Fighter } from '../entities/fighter.js';
import { CommandBuffer } from '../input/commandBuffer.js';
import { initAudio, playSelect } from '../audio/sfx.js';

export interface SelectResult {
  p1Char: CharacterDefinition;
  p2Char: CharacterDefinition;
  p1Team: CharacterDefinition[];  // 3 characters for P1
  p2Team: CharacterDefinition[];  // 3 characters for P2
  p2IsAI: boolean;
  p2AI: SimpleAI | null;
}

export class SelectState {
  p1Cursor = 0;
  p2Cursor = 1;
  p1Ready = false;
  p2Ready = false;
  p2IsAI = true;
  countdown = -1;

  // Internal edge detection (replaces window.__prev*)
  private prevP1Left = false;
  private prevP1Right = false;
  private prevP2Left = false;
  private prevP2Right = false;
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

  /** Process one frame of select screen input. Returns SelectResult if both confirmed */
  update(rawP1: PlayerInput, rawP2: PlayerInput, isAITogglePressed: boolean): SelectResult | null {
    // P1 cursor movement (edge-detected)
    if (!this.p1Ready) {
      if (rawP1.left && !this.prevP1Left)
        this.p1Cursor = (this.p1Cursor - 1 + ROSTER.length) % ROSTER.length;
      if (rawP1.right && !this.prevP1Right)
        this.p1Cursor = (this.p1Cursor + 1) % ROSTER.length;
      if (rawP1.buttonA) {
        this.p1Ready = true;
        initAudio();
        playSelect();
      }
    }

    // P2 cursor / AI auto-select
    if (this.p2IsAI) {
      if (this.p1Ready && !this.p2Ready) {
        this.p2Cursor = (this.p1Cursor + 1 + Math.floor(Math.random() * (ROSTER.length - 1))) % ROSTER.length;
        this.p2Ready = true;
      }
    } else if (!this.p2Ready) {
      if (rawP2.left && !this.prevP2Left)
        this.p2Cursor = (this.p2Cursor - 1 + ROSTER.length) % ROSTER.length;
      if (rawP2.right && !this.prevP2Right)
        this.p2Cursor = (this.p2Cursor + 1) % ROSTER.length;
      if (rawP2.buttonA) this.p2Ready = true;
    }

    // Toggle AI (T key, edge-detected)
    if (isAITogglePressed && !this.prevToggleAI) this.p2IsAI = !this.p2IsAI;

    // Save prev state for edge detection
    this.prevP1Left = rawP1.left;
    this.prevP1Right = rawP1.right;
    this.prevP2Left = rawP2.left;
    this.prevP2Right = rawP2.right;
    this.prevToggleAI = isAITogglePressed;

    // Countdown
    if (this.p1Ready && this.p2Ready) {
      if (this.countdown < 0) this.countdown = 60;
      this.countdown--;
      if (this.countdown <= 0) return this.confirm();
    }
    return null;
  }

  private confirm(): SelectResult {
    const p1Char = ROSTER[this.p1Cursor];
    const p2Char = ROSTER[this.p2Cursor];
    this.p1Ctrl.setCharacter(p1Char);
    this.p2Ctrl.setCharacter(p2Char);
    this.p1.setStats(p1Char.stats);
    this.p2.setStats(p2Char.stats);
    const p2AI = this.p2IsAI ? new SimpleAI(this.p2, this.p1, p2Char, 0.6) : null;

    // Build 3-member teams: selected char + next 2 in roster (wrapping)
    const p1Team = [p1Char];
    for (let i = 1; i < 3; i++) p1Team.push(ROSTER[(this.p1Cursor + i) % ROSTER.length]);
    const p2Team = [p2Char];
    for (let i = 1; i < 3; i++) p2Team.push(ROSTER[(this.p2Cursor + i) % ROSTER.length]);

    return { p1Char, p2Char, p1Team, p2Team, p2IsAI: this.p2IsAI, p2AI };
  }

  reset(): void {
    this.p1Cursor = 0;
    this.p2Cursor = 1;
    this.p1Ready = false;
    this.p2Ready = false;
    this.countdown = -1;
    this.prevP1Left = false;
    this.prevP1Right = false;
    this.prevP2Left = false;
    this.prevP2Right = false;
    this.prevToggleAI = false;
  }
}
