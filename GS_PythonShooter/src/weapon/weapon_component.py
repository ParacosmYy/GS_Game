# -*- coding: utf-8 -*-
"""
GS_PythonShooter — 武器管理组件
对应 C++ UShooterWeaponComponent
管理：武器插槽、切换
"""
from typing import List, Optional, Callable
from ..core.constants import WeaponSlot, WeaponStats, WeaponState
from .weapon_base import WeaponBase
from .weapon_data import WEAPON_DB


class WeaponComponent:
    """
    武器组件（挂载到角色上）

    用法:
        wc = WeaponComponent()
        wc.equip("AK-47")
        wc.switch_slot(WeaponSlot.PRIMARY)
    """

    def __init__(self):
        # 4 个武器槽位
        self._slots: List[Optional[WeaponBase]] = [None] * 4
        self._current_slot = WeaponSlot.PRIMARY
        self._is_switching = False
        self._switch_timer = 0.0

        # 回调
        self.on_weapon_changed: Optional[Callable] = None

    # ─── 属性 ───────────────────────────────────────────

    @property
    def current_weapon(self) -> Optional[WeaponBase]:
        return self._slots[self._current_slot.value]

    @property
    def current_slot(self) -> WeaponSlot:
        return self._current_slot

    def get_weapon_in_slot(self, slot: WeaponSlot) -> Optional[WeaponBase]:
        return self._slots[slot.value]

    def has_weapon_in_slot(self, slot: WeaponSlot) -> bool:
        return self._slots[slot.value] is not None

    # ─── 装备/卸下 ─────────────────────────────────────

    def equip(self, weapon_name: str, slot: Optional[WeaponSlot] = None):
        """装备武器"""
        if weapon_name not in WEAPON_DB:
            return

        stats = WEAPON_DB[weapon_name]

        # 自动分配槽位
        if slot is None:
            slot = self._detect_slot(weapon_name)

        weapon = WeaponBase(stats)
        self._slots[slot.value] = weapon
        self.switch_slot(slot)

    def unequip(self, slot: WeaponSlot):
        """卸下武器"""
        idx = slot.value
        if self._slots[idx]:
            self._slots[idx] = None

    # ─── 切换 ───────────────────────────────────────────

    def switch_slot(self, slot: WeaponSlot):
        """切换到指定槽位"""
        if self._is_switching or not self._slots[slot.value]:
            return

        old_weapon = self.current_weapon
        self._current_slot = slot
        self._switch_timer = self.current_weapon.stats.equip_time
        self._is_switching = True

        if self.on_weapon_changed:
            self.on_weapon_changed(old_weapon, self.current_weapon)

    def cycle_weapon(self, direction: int = 1):
        """循环切换武器"""
        for i in range(1, 5):
            idx = (self._current_slot.value + i * direction) % 4
            if self._slots[idx]:
                self.switch_slot(WeaponSlot(idx))
                return

        # 如果没找到其他武器，切换到刀
        if self._slots[WeaponSlot.KNIFE.value]:
            self.switch_slot(WeaponSlot.KNIFE)

    # ─── 开火/换弹 ─────────────────────────────────────

    def start_fire(self):
        if self.current_weapon:
            self.current_weapon.start_fire()

    def end_fire(self):
        if self.current_weapon:
            self.current_weapon.end_fire()

    def reload(self):
        if self.current_weapon:
            self.current_weapon.start_reload()

    @property
    def is_reloading(self) -> bool:
        return bool(self.current_weapon and
                    self.current_weapon.state == WeaponState.RELOADING.value)

    # ─── 更新 ───────────────────────────────────────────

    def update(self, dt: float):
        """每帧更新所有武器和切换计时"""
        if self._is_switching:
            self._switch_timer -= dt
            if self._switch_timer <= 0:
                self._is_switching = False

        if self.current_weapon:
            self.current_weapon.update(dt)

    # ─── 辅助 ───────────────────────────────────────────

    def _detect_slot(self, weapon_name: str) -> WeaponSlot:
        """根据武器名自动判断槽位"""
        weapon_name = weapon_name.lower()
        if any(kw in weapon_name for kw in ["knife", "bayonet", "karambit"]):
            return WeaponSlot.KNIFE
        if any(kw in weapon_name for kw in ["glock", "pistol", "deagle",
                                              "usp", "p2000", "five-seven"]):
            return WeaponSlot.SECONDARY
        if any(kw in weapon_name for kw in ["hegrenade", "flashbang",
                                              "smokegrenade", "molotov"]):
            return WeaponSlot.GRENADE
        return WeaponSlot.PRIMARY

    def spawn_defaults(self):
        """生成默认武器"""
        self.equip("Glock-18", WeaponSlot.SECONDARY)
        self.equip("Knife", WeaponSlot.KNIFE)
