# -*- coding: utf-8 -*-
"""
GS_PythonShooter — 武器基类
对应 C++ AShooterWeapon
管理：开火逻辑、弹药、散布、后座力
"""
import math
import random
import time
from typing import Optional, Callable
from ..core.constants import (
    WeaponStats, WeaponState, FireMode, BallisticHitResult,
    GameConstants
)
from .ballistics import Ballistics


class WeaponBase:
    """
    武器实例

    用法:
        ak = WeaponBase(WEAPON_DB["AK-47"])
        ak.start_fire()
        ak.update(dt)
        ak.end_fire()
    """

    def __init__(self, stats: WeaponStats):
        self.stats = stats
        self.state = WeaponState.IDLE

        # 弹药
        self.current_ammo = stats.magazine_size
        self.reserve_ammo = stats.reserve_ammo

        # 散布
        self.current_spread = 0.0
        self._spread_increment = 0.005
        self._max_spread = 0.1
        self._spread_recovery = 0.15

        # 后座力
        self.accumulated_recoil = (0.0, 0.0)
        self._consecutive_shots = 0

        # 开火计时
        self._is_firing = False
        self._fire_timer = 0.0
        self._reload_timer = 0.0

        # 回调
        self.on_fire: Optional[Callable] = None
        self.on_reload_finished: Optional[Callable] = None
        self.on_ammo_changed: Optional[Callable] = None

    # ─── 属性 ───────────────────────────────────────────

    @property
    def fire_interval(self) -> float:
        """开火间隔（秒）"""
        return 60.0 / self.stats.fire_rate if self.stats.fire_rate > 0 else 0.1

    @property
    def can_fire(self) -> bool:
        return (self.state not in (WeaponState.RELOADING, WeaponState.SWITCHING)
                and self.current_ammo > 0)

    @property
    def can_reload(self) -> bool:
        return (self.state != WeaponState.RELOADING
                and self.current_ammo < self.stats.magazine_size
                and self.reserve_ammo > 0)

    # ─── 开火 ───────────────────────────────────────────

    def start_fire(self):
        if self.state == WeaponState.RELOADING:
            return

        self._is_firing = True

        if self.stats.fire_mode == FireMode.SEMI:
            self._fire()
        else:
            self._fire()
            self._fire_timer = self.fire_interval

    def end_fire(self):
        self._is_firing = False
        self._consecutive_shots = 0

    def _fire(self):
        """执行一次开火"""
        if self.current_ammo <= 0:
            self.state = WeaponState.EMPTY
            return

        self.current_ammo -= 1
        self._consecutive_shots += 1

        # 计算散布
        spread = self._calculate_spread()
        self.current_spread = min(self.current_spread + self._spread_increment,
                                   self._max_spread)

        # 计算后座力
        recoil = self._calculate_recoil()
        self.accumulated_recoil = (
            self.accumulated_recoil[0] + recoil[0],
            self.accumulated_recoil[1] + recoil[1]
        )

        # 调用回调
        if self.on_fire:
            self.on_fire(spread, recoil)

        if self.on_ammo_changed:
            self.on_ammo_changed(self.current_ammo, self.reserve_ammo)

    def _calculate_spread(self) -> float:
        """计算当前枪口散布"""
        spread = self.stats.spread_stand + self.current_spread
        return min(spread, 0.15)

    def _calculate_recoil(self) -> tuple:
        """CS2 风格后座力模式"""
        vertical = self.stats.recoil_vertical
        horizontal = self.stats.recoil_horizontal * random.uniform(-0.5, 0.5)

        # 连发射击增加水平抖动
        if self._consecutive_shots > 3:
            horizontal *= 1.5
            vertical *= 1.2

        return (vertical, horizontal)

    # ─── 换弹 ───────────────────────────────────────────

    def start_reload(self):
        if not self.can_reload:
            return

        self.state = WeaponState.RELOADING
        self._reload_timer = self.stats.reload_time

    def _finish_reload(self):
        if self.state != WeaponState.RELOADING:
            return

        needed = self.stats.magazine_size - self.current_ammo
        available = min(needed, self.reserve_ammo)

        self.current_ammo += available
        self.reserve_ammo -= available
        self.state = WeaponState.IDLE
        self.current_spread = 0.0

        if self.on_reload_finished:
            self.on_reload_finished(self.current_ammo)

    # ─── 更新 ───────────────────────────────────────────

    def update(self, dt: float):
        """每帧调用"""

        # 自动开火
        if self._is_firing and self.stats.fire_mode != FireMode.SEMI:
            self._fire_timer -= dt
            if self._fire_timer <= 0:
                if self.can_fire:
                    self._fire()
                    self._fire_timer = self.fire_interval
                else:
                    if self.current_ammo <= 0:
                        self.state = WeaponState.EMPTY
                    self._is_firing = False

        # 换弹计时
        if self.state == WeaponState.RELOADING:
            self._reload_timer -= dt
            if self._reload_timer <= 0:
                self._finish_reload()

        # 散布恢复
        if not self._is_firing and self.current_spread > 0:
            self.current_spread = max(0.0,
                                       self.current_spread - self._spread_recovery * dt)

        # 后座力衰减
        if self.accumulated_recoil[0] != 0 or self.accumulated_recoil[1] != 0:
            decay = 8.0 * dt
            self.accumulated_recoil = (
                max(0.0, self.accumulated_recoil[0] - decay),
                self.accumulated_recoil[0] * 0.9,
            )
