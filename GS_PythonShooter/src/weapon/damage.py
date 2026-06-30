# -*- coding: utf-8 -*-
"""
GS_PythonShooter — 伤害系统
对应 C++ UShooterDamageType 及其子类
"""
from enum import IntEnum
from typing import Optional
from ..core.constants import DamageInfo, GameConstants


class DamageCategory(IntEnum):
    """伤害分类"""
    RIFLE = 0
    SNIPER = 1
    SMG = 2
    PISTOL = 3
    EXPLOSIVE = 4
    MELEE = 5


# ─── 伤害类型配置 ─────────────────────────────────────────────

DAMAGE_TYPES = {
    DamageCategory.RIFLE: {
        "armor_penetration": 0.65,
        "can_penetrate": True,
        "penetration_multiplier": 0.7,
        "instant_kill": False,
    },
    DamageCategory.SNIPER: {
        "armor_penetration": 0.95,
        "can_penetrate": True,
        "penetration_multiplier": 0.8,
        "instant_kill": True,
    },
    DamageCategory.SMG: {
        "armor_penetration": 0.40,
        "can_penetrate": False,
        "penetration_multiplier": 0.5,
        "instant_kill": False,
    },
    DamageCategory.PISTOL: {
        "armor_penetration": 0.35,
        "can_penetrate": False,
        "penetration_multiplier": 0.5,
        "instant_kill": False,
    },
    DamageCategory.EXPLOSIVE: {
        "armor_penetration": 0.30,
        "can_penetrate": False,
        "penetration_multiplier": 0.5,
        "instant_kill": False,
    },
    DamageCategory.MELEE: {
        "armor_penetration": 0.50,
        "can_penetrate": False,
        "penetration_multiplier": 0.5,
        "instant_kill": False,
    },
}


# ─── 骨骼伤害倍率 ───────────────────────────────────────────

BONE_MULTIPLIERS = {
    "head": 1.4,
    "neck": 1.2,
    "spine": 1.0,
    "pelvis": 1.0,
    "upper_arm": 0.8,
    "lower_arm": 0.7,
    "hand": 0.5,
    "thigh": 0.8,
    "calf": 0.7,
    "foot": 0.5,
}


class DamageCalculator:
    """
    伤害计算器

    用法:
        calc = DamageCalculator()
        final = calc.apply_damage(
            base_damage=36.0,
            armor=50.0,
            armor_penetration=0.65,
            bone_name="head",
            distance=1000.0,
            damage_type=DamageCategory.RIFLE
        )
    """

    @staticmethod
    def get_bone_multiplier(bone_name: str) -> float:
        """获取骨骼伤害倍率"""
        name = bone_name.lower().replace("_", "")
        for key, mult in BONE_MULTIPLIERS.items():
            if key in name or name in key:
                return mult
        return 1.0

    @staticmethod
    def apply_armor(base_damage: float, armor: float,
                    armor_penetration: float) -> tuple:
        """
        应用护甲减伤

        Returns:
            (final_damage, remaining_armor)
        """
        if armor <= 0 or armor_penetration >= 1.0:
            return (base_damage, armor)

        absorb = base_damage * (1.0 - armor_penetration) * 0.5
        remaining_armor = max(0.0, armor - absorb)
        final_damage = base_damage * armor_penetration

        return (final_damage, remaining_armor)

    @staticmethod
    def apply_distance_falloff(base_damage: float, distance: float) -> float:
        """距离衰减"""
        if distance <= 500.0:
            return base_damage
        if distance >= 5000.0:
            return base_damage * 0.5
        alpha = (distance - 500.0) / 4500.0
        return base_damage * (1.0 - alpha * 0.5)

    @classmethod
    def calculate(cls, base_damage: float, armor: float,
                  armor_penetration: float, bone_name: str,
                  distance: float,
                  cat: DamageCategory = DamageCategory.RIFLE) -> float:
        """完整伤害计算流程"""
        # 1. 距离衰减
        damage = cls.apply_distance_falloff(base_damage, distance)

        # 2. 骨骼倍率
        bone_mult = cls.get_bone_multiplier(bone_name)
        damage *= bone_mult

        # 3. 护甲减伤
        damage, _ = cls.apply_armor(damage, armor, armor_penetration)

        # 4. 伤害类型修正
        dtype = DAMAGE_TYPES.get(cat, DAMAGE_TYPES[DamageCategory.RIFLE])
        if dtype["instant_kill"] and bone_mult >= 1.4:
            damage = 999.0  # AWP 爆头一击必杀

        return max(0.0, damage)
