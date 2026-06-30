# -*- coding: utf-8 -*-
"""
GS_PythonShooter — 全局常量定义
对应 C++ 版 ShooterSharedTypes.h 中的 ShooterConstants 命名空间
"""
from enum import IntEnum, auto


# ─── 队伍枚举 ──────────────────────────────────────────────────
class TeamSide(IntEnum):
    TERRORIST = 0
    COUNTER_TERRORIST = 1
    SPECTATOR = 2


# ─── 回合阶段 ──────────────────────────────────────────────────
class RoundPhase(IntEnum):
    WARMUP = 0
    FREEZE_TIME = 1
    ACTION = 2
    ROUND_END = 3
    HALF_TIME = 4
    MATCH_OVER = 5


# ─── 武器槽位 ──────────────────────────────────────────────────
class WeaponSlot(IntEnum):
    PRIMARY = 0
    SECONDARY = 1
    KNIFE = 2
    GRENADE = 3


# ─── 开火模式 ──────────────────────────────────────────────────
class FireMode(IntEnum):
    SEMI = 0    # 半自动
    BURST = 1   # 三连发
    AUTO = 2    # 全自动


# ─── 角色姿态 ──────────────────────────────────────────────────
class CharacterPose(IntEnum):
    STANDING = 0
    CROUCHING = 1
    PRONE = 2


# ─── 移动状态 ──────────────────────────────────────────────────
class MovementState(IntEnum):
    IDLE = 0
    WALKING = 1
    RUNNING = 2
    SPRINTING = 3
    ADS_WALKING = 4


# ─── 武器状态 ──────────────────────────────────────────────────
class WeaponState(IntEnum):
    IDLE = 0
    FIRING = 1
    RELOADING = 2
    SWITCHING = 3
    EMPTY = 4


# ─── 武器数据命名（对应 C++ FWeaponStats） ────────────────────
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class WeaponStats:
    """武器统计数据结构"""
    weapon_name: str = "Unknown"
    fire_mode: FireMode = FireMode.AUTO
    base_damage: float = 30.0
    headshot_multiplier: float = 1.4
    armor_penetration: float = 0.5
    fire_rate: float = 600.0       # rounds/min
    magazine_size: int = 30
    reserve_ammo: int = 90
    reload_time: float = 2.5
    equip_time: float = 1.0
    spread_stand: float = 0.04
    spread_crouch: float = 0.02
    spread_ads: float = 0.008
    recoil_vertical: float = 2.0
    recoil_horizontal: float = 0.8
    projectile_speed: float = 50000.0   # cm/s
    bullet_drop_scale: float = 1.0
    penetration_power: float = 1.0
    weapon_cost: int = 2700


# ─── 弹道命中结果 ─────────────────────────────────────────────
@dataclass
class BallisticHitResult:
    """对应 C++ FBallisticHitResult"""
    hit_actor: Optional[object] = None
    location: tuple = (0.0, 0.0, 0.0)
    normal: tuple = (0.0, 1.0, 0.0)
    exit_location: tuple = (0.0, 0.0, 0.0)
    penetration_depth: float = 0.0
    penetrated: bool = False
    final_damage: float = 0.0
    impact_material_index: int = 0
    bone_name: str = ""


# ─── 伤害信息 ─────────────────────────────────────────────────
@dataclass
class DamageInfo:
    """对应 C++ FDamageInfo"""
    base_damage: float = 0.0
    headshot_multiplier: float = 1.0
    armor_penetration: float = 0.0
    distance: float = 0.0
    damage_causer: Optional[object] = None
    instigator: Optional[object] = None
    bone_name: str = ""


# ─── AI 技能参数 ─────────────────────────────────────────────
@dataclass
class AISkillLevel:
    """对应 C++ FAISkillLevel"""
    aim_accuracy: float = 0.5
    reaction_time: float = 0.3
    aggression: float = 0.5
    utility_usage: float = 0.5
    burst_length: float = 5.0


# ─── 游戏常量 ─────────────────────────────────────────────────
class GameConstants:
    """对应 C++ ShooterConstants 命名空间"""
    MAX_PLAYERS_PER_TEAM = 5
    STARTING_MONEY = 800
    MAX_MONEY = 16000
    WIN_ROUND_REWARD = 3250
    LOSS_REWARD_BASE = 1900
    LOSS_REWARD_INCREMENT = 500
    MAX_LOSS_STREAK_REWARD = 3400
    FREEZE_TIME_DURATION = 15.0
    ROUND_TIME = 115.0
    ROUND_END_TIME = 5.0
    WARMUP_TIME = 120.0
    MAX_ROUNDS = 24
    ROUNDS_PER_HALF = 12
    MOVE_SPEED_DEFAULT = 400.0
    MOVE_SPEED_ADS = 200.0
    MOVE_SPEED_SPRINT = 520.0
    MOVE_SPEED_CROUCH = 240.0
    MAX_HEALTH = 100.0
    MAX_ARMOR = 100.0
    HEADSHOT_MULTIPLIER = 1.4
    KILL_REWARD = 300
    HEADSHOT_BONUS = 300
    BOMB_PLANT_REWARD = 300
    BOMB_DEFUSE_REWARD = 300
