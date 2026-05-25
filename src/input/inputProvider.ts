/**
 * IInputProvider — 输入提供者接口
 *
 * 解耦 combat 层对 InputManager 的直接依赖。
 * CombatSystem/ProjectileResolver 通过此接口获取原始输入，
 * 不再 import InputManager。
 */
import type { PlayerInput } from '../core/types.js';

export interface IInputProvider {
  getP1Input(): PlayerInput;
  getP2Input(): PlayerInput;
}
