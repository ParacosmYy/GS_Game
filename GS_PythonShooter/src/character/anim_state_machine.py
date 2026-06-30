# -*- coding: utf-8 -*-
"""
GS_PythonShooter — 动画状态机
对应 C++ UShooterAnimInstance
管理：武器姿态、后座力动画、换弹动画
"""
from typing import Optional
from ..core.constants import (
    MovementState, WeaponState, FireMode, WeaponSlot, CharacterPose
)


class AnimationState:
    """单个动画状态节点"""

    def __init__(self, name: str):
        self.name = name
        self.blend_time = 0.1

    def on_enter(self):
        pass

    def on_exit(self):
        pass

    def update(self, dt: float) -> Optional[str]:
        """返回 None 表示停留在当前状态，返回字符串表示切换到指定状态"""
        return None


class AnimStateMachine:
    """
    动画状态机

    状态图:
    IDLE ←→ WALK ←→ RUN ←→ SPRINT
      ↓       ↓
     ADS_IDLE → ADS_WALK
      ↓
    RELOAD (结束后回到之前状态)
      ↓
    HIT_REACTION → (回到之前状态)
      ↓
    DEATH (终端状态)
    """

    STATES = [
        "IDLE", "WALK", "RUN", "SPRINT",
        "ADS_IDLE", "ADS_WALK",
        "RELOAD", "HIT_REACTION", "DEATH"
    ]

    def __init__(self):
        self.current_state = "IDLE"
        self.previous_state = "IDLE"
        self.blend_progress = 1.0  # 0-1
        self.blend_time = 0.1

        # 后座力累积
        self.recoil_pitch = 0.0
        self.recoil_yaw = 0.0
        self._recoil_decay_rate = 8.0
        self._last_fire_time = 0.0

        # 换弹计时
        self._reload_progress = 0.0
        self._reload_duration = 2.5
        self._is_reloading = False

    # ─── 状态切换 ───────────────────────────────────────

    def _can_transition(self, target: str) -> bool:
        """检查是否可以切换到目标状态"""
        if self.current_state == "DEATH":
            return target == "DEATH"
        if self.current_state == "RELOAD":
            return target in ("IDLE", "DEATH", "HIT_REACTION")
        return True

    def transition_to(self, target: str):
        if not self._can_transition(target):
            return
        if target == self.current_state:
            return
        self.previous_state = self.current_state
        self.current_state = target
        self.blend_progress = 0.0

    # ─── 外部接口 ───────────────────────────────────────

    def update_from_controller(self, movement: MovementState, is_ads: bool,
                                weapon_state: WeaponState, wants_reload: bool):
        """根据控制器状态更新动画状态机"""

        # 换弹
        if wants_reload and weapon_state == WeaponState.RELOADING:
            if self.current_state != "RELOAD":
                self.transition_to("RELOAD")
            return

        # 死亡
        if weapon_state == WeaponState.EMPTY and movement == MovementState.IDLE:
            # 简化处理
            pass

        # 瞄准/非瞄准
        if is_ads:
            if movement in (MovementState.IDLE, MovementState.WALKING):
                target = "ADS_IDLE" if movement == MovementState.IDLE else "ADS_WALK"
            else:
                target = "ADS_IDLE"
        else:
            target = {
                MovementState.IDLE: "IDLE",
                MovementState.WALKING: "WALK",
                MovementState.RUNNING: "RUN",
                MovementState.SPRINTING: "SPRINT",
                MovementState.ADS_WALKING: "ADS_WALK",
            }.get(movement, "IDLE")

        self.transition_to(target)

    def play_reload(self, duration: float):
        """触发换弹动画"""
        self._reload_duration = duration
        self._reload_progress = 0.0
        self._is_reloading = True
        self.transition_to("RELOAD")

    def end_reload(self):
        """换弹结束"""
        self._is_reloading = False
        self.transition_to(self.previous_state)

    def play_recoil(self, pitch: float, yaw: float):
        """叠加后座力动画"""
        self.recoil_pitch = min(self.recoil_pitch + pitch, 15.0)
        self.recoil_yaw += yaw * (-1 if hash(str(pitch)) % 2 == 0 else 1)
        self.recoil_yaw = max(-5.0, min(5.0, self.recoil_yaw))
        self._last_fire_time = 0.0

    def play_hit_reaction(self, hit_direction: tuple):
        """受击动画"""
        self.transition_to("HIT_REACTION")

    def play_death(self):
        """死亡动画"""
        self.transition_to("DEATH")

    # ─── 更新 ───────────────────────────────────────────

    def update(self, dt: float):
        """每帧更新混合进度和后座力衰减"""

        # 混合动画过渡
        if self.blend_progress < 1.0:
            self.blend_progress += dt / self.blend_time
            self.blend_progress = min(self.blend_progress, 1.0)

        # 后座力衰减
        self._last_fire_time += dt
        if self._last_fire_time > 0.3:  # 恢复延迟
            decay = self._recoil_decay_rate * dt
            if abs(self.recoil_pitch) > decay:
                self.recoil_pitch -= (1 if self.recoil_pitch > 0 else -1) * decay
            else:
                self.recoil_pitch = 0.0

            if abs(self.recoil_yaw) > decay:
                self.recoil_yaw -= (1 if self.recoil_yaw > 0 else -1) * decay
            else:
                self.recoil_yaw = 0.0

        # 换弹进度
        if self._is_reloading:
            self._reload_progress += dt
            if self._reload_progress >= self._reload_duration:
                self.end_reload()
