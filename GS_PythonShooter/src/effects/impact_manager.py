# -*- coding: utf-8 -*-
"""
GS_PythonShooter — 命中效果管理器
对应 C++ UShooterImpactManager

管理：弹孔贴花、粒子特效、撞击音效
"""
import math
import random
from typing import Optional, Dict, Tuple
from panda3d.core import NodePath, Vec3, Point3


class ImpactManager:
    """
    集中化命中效果管理器

    根据击中材质播放不同效果
    """

    # 材质-颜色映射
    SURFACE_COLORS = {
        0: (0.8, 0.8, 0.7),    # 默认（浅灰）
        1: (0.6, 0.4, 0.2),    # 木材
        2: (0.7, 0.7, 0.8),    # 金属
        3: (0.5, 0.5, 0.5),    # 混凝土
        4: (0.6, 0.3, 0.2),    # 砖墙
        5: (0.3, 0.3, 0.35),   # 钢板
    }

    def __init__(self, base):
        self.base = base
        self.root = NodePath("ImpactRoot")
        self.root.reparentTo(base.render)

        # 弹孔贴花缓存
        self._decals: list = []
        self._max_decals = 50  # 最多同时存在弹孔数

        # 粒子缓存
        self._particles: list = []

    def play_impact(self, location: Tuple[float, float, float],
                    normal: Tuple[float, float, float],
                    surface_type: int = 0,
                    is_headshot: bool = False):
        """
        播放命中效果

        1. 弹孔贴花
        2. 粒子喷射
        3. 音效（预留）
        """
        # 1. 弹孔贴花
        self._spawn_decal(location, normal, surface_type)

        # 2. 粒子效果
        self._spawn_particles(location, normal, surface_type)

        # 爆头特殊效果
        if is_headshot:
            self._spawn_headshot_effect(location)

    def play_penetration(self, exit_location: Tuple[float, float, float],
                          exit_normal: Tuple[float, float, float]):
        """穿透出口效果"""
        self._spawn_particles(exit_location, exit_normal, 2, size=0.5)

    def play_ricochet(self, location: Tuple[float, float, float],
                       direction: Tuple[float, float, float]):
        """跳弹效果"""
        self._spawn_particles(location, direction, 2, size=0.8)

    # ─── 内部 ───────────────────────────────────────────

    def _spawn_decal(self, location: tuple, normal: tuple,
                     surface_type: int):
        """生成弹孔贴花"""
        # 清理过多弹孔
        while len(self._decals) >= self._max_decals:
            old = self._decals.pop(0)
            old.removeNode()

        # 使用小平面模拟弹孔
        from panda3d.core import CardMaker
        cm = CardMaker("BulletHole")
        cm.setFrame(-3, 3, -3, 3)  # 6x6 单位

        decal = NodePath(cm.generate())
        decal.setPos(*location)
        decal.setBillboardPointEye()  # 始终面向摄像机

        # 材质颜色
        color = self.SURFACE_COLORS.get(surface_type, (0.8, 0.8, 0.7))
        decal.setColor(*color, 0.8)

        # 小随机旋转
        decal.setH(random.uniform(0, 360))

        decal.reparentTo(self.root)
        self._decals.append(decal)

    def _spawn_particles(self, location: tuple, normal: tuple,
                         surface_type: int, size: float = 1.0):
        """生成粒子喷射"""
        count = random.randint(3, 6)
        for _ in range(count):
            from panda3d.core import CardMaker
            cm = CardMaker("Debris")
            cm.setFrame(-1, 1, -1, 1)
            particle = NodePath(cm.generate())
            particle.setPos(
                location[0] + random.uniform(-5, 5),
                location[1] + random.uniform(-5, 5),
                location[2] + random.uniform(-5, 5)
            )
            color = self.SURFACE_COLORS.get(surface_type, (0.8, 0.8, 0.7))
            particle.setColor(*color, 0.6)
            particle.setScale(size * random.uniform(0.5, 1.5))
            particle.reparentTo(self.root)

            # 设置自动销毁（生命周期）
            self._particles.append({
                "node": particle,
                "lifetime": random.uniform(0.3, 0.8),
                "age": 0.0,
                "velocity": (
                    random.uniform(-20, 20),
                    random.uniform(-20, 20),
                    random.uniform(10, 40),
                ),
            })

    def _spawn_headshot_effect(self, location: tuple):
        """爆头特效"""
        # 红色粒子爆发
        for _ in range(10):
            from panda3d.core import CardMaker
            cm = CardMaker("Blood")
            cm.setFrame(-2, 2, -2, 2)
            particle = NodePath(cm.generate())
            particle.setPos(*location)
            particle.setColor(0.8, 0.1, 0.1, 0.7)
            particle.reparentTo(self.root)
            self._particles.append({
                "node": particle,
                "lifetime": random.uniform(0.5, 1.5),
                "age": 0.0,
                "velocity": (
                    random.uniform(-50, 50),
                    random.uniform(-50, 50),
                    random.uniform(20, 60),
                ),
            })

    def update(self, dt: float):
        """更新粒子生命周期"""
        for p in self._particles[:]:
            p["age"] += dt
            if p["age"] >= p["lifetime"]:
                p["node"].removeNode()
                self._particles.remove(p)
            else:
                # 简单物理运动
                pos = p["node"].getPos()
                vel = p["velocity"]
                p["node"].setPos(
                    pos.x + vel[0] * dt,
                    pos.y + vel[1] * dt,
                    pos.z + vel[2] * dt
                )
                # 重力
                p["velocity"] = (vel[0], vel[1], vel[2] - 200 * dt)
                # 淡出
                alpha = 1.0 - (p["age"] / p["lifetime"])
                p["node"].setAlphaScale(alpha)
