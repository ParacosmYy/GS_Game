# -*- coding: utf-8 -*-
"""
GS_PythonShooter — AI 感知系统
对应 C++ AI Perception (Sight + Hearing)
"""
import math
import time
from typing import List, Tuple, Optional


class AIPerception:
    """
    AI 感知系统

    支持：
    - 视觉感知（视锥范围、遮挡检测）
    - 听觉感知（声音传播、距离衰减）
    """

    def __init__(self):
        # 视觉参数
        self.sight_range = 5000.0       # 最大视距 cm
        self.sight_angle = 90.0         # 视野角度（度）
        self.lose_sight_range = 6000.0  # 丢失目标距离
        self.sight_max_age = 5.0        # 记忆时间

        # 听觉参数
        self.hearing_range = 3000.0     # 听觉范围 cm
        self.hearing_max_age = 3.0      # 声音记忆

        # 探测到的目标
        self._detected_targets: dict = {}
        self._noise_sources: list = []

        # 队友位置缓存
        self._ally_positions: dict = {}

    def can_see(self, observer_pos: tuple, target_pos: tuple,
                world=None) -> bool:
        """
        视觉检测

        Args:
            observer_pos: 观察者位置
            target_pos: 目标位置
            world: 碰撞世界（用于遮挡检测）

        Returns:
            是否可见
        """
        dx = target_pos[0] - observer_pos[0]
        dy = target_pos[1] - observer_pos[1]
        dz = target_pos[2] - observer_pos[2]

        distance = math.sqrt(dx * dx + dy * dy + dz * dz)

        # 距离检测
        if distance > self.sight_range:
            return False

        # 角度检测（视锥）
        if distance > 0:
            # 计算目标方向与观察者朝向的夹角
            angle = math.degrees(math.atan2(dy, dx))
            # 简化为检查水平角度差
            if abs(angle) > self.sight_angle * 0.5:
                return False

        return True

    def can_hear(self, observer_pos: tuple, noise_pos: tuple,
                 noise_loudness: float = 1.0) -> bool:
        """听觉检测"""
        dx = noise_pos[0] - observer_pos[0]
        dy = noise_pos[1] - observer_pos[1]
        dz = noise_pos[2] - observer_pos[2]

        distance = math.sqrt(dx * dx + dy * dy + dz * dz)
        effective_range = self.hearing_range * noise_loudness

        return distance <= effective_range

    def report_detection(self, target_id, position: tuple):
        """记录探测到的目标"""
        self._detected_targets[target_id] = {
            "position": position,
            "time": time.time(),
        }

    def report_noise(self, position: tuple, loudness: float = 1.0):
        """记录声音源"""
        self._noise_sources.append({
            "position": position,
            "loudness": loudness,
            "time": time.time(),
        })

    def is_visible(self, target) -> bool:
        """检查目标是否在视野中"""
        target_id = id(target)
        if target_id not in self._detected_targets:
            return False
        elapsed = time.time() - self._detected_targets[target_id]["time"]
        return elapsed < self.sight_max_age

    def get_latest_noise(self) -> Optional[dict]:
        """获取最近的声音源"""
        now = time.time()
        active = [n for n in self._noise_sources
                  if now - n["time"] < self.hearing_max_age]
        return max(active, key=lambda n: n["time"]) if active else None

    def update(self, dt: float):
        """清理过期数据"""
        now = time.time()
        self._detected_targets = {
            tid: info for tid, info in self._detected_targets.items()
            if now - info["time"] < self.sight_max_age
        }
        self._noise_sources = [
            n for n in self._noise_sources
            if now - n["time"] < self.hearing_max_age
        ]
