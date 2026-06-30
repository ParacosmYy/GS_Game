# -*- coding: utf-8 -*-
"""
GS_PythonShooter — 场景管理器
修复：为所有盒子添加 CollisionNode，支持射击检测和角色碰撞
"""
from typing import List, Tuple
from panda3d.core import (
    NodePath, CardMaker, AmbientLight, DirectionalLight, VBase4,
    CollisionNode, CollisionBox, Point3, BitMask32
)


class SceneManager:
    def __init__(self, base):
        self.base = base
        self.render = base.render
        self.root = NodePath("SceneRoot")
        self.root.reparentTo(self.render)
        self._static_objects: List[NodePath] = []

    def create_test_arena(self):
        """创建测试地图（含碰撞）"""
        # 地面
        self._create_floor("Floor", 4000, 4000, (0, 0, -1), (0.4, 0.38, 0.32))

        # 墙壁
        wh, wt = 400, 40
        for name, w, d, h, pos in [
            ("Wall_N", 2000, wt, wh, (0, -1000, wh/2)),
            ("Wall_S", 2000, wt, wh, (0, 1000, wh/2)),
            ("Wall_E", wt, 2000, wh, (1000, 0, wh/2)),
            ("Wall_W", wt, 2000, wh, (-1000, 0, wh/2)),
        ]:
            self._create_box_3d(name, w, d, h, pos, (0.55, 0.5, 0.45))

        # 掩体
        self._create_box_3d("Cover1", 40, 200, 160, (0, 0, 80), (0.35, 0.35, 0.35))
        self._create_box_3d("Cover2", 200, 40, 120, (300, 300, 60), (0.4, 0.35, 0.3))
        self._create_box_3d("Cover3", 200, 40, 120, (-300, -300, 60), (0.4, 0.35, 0.3))
        self._create_box_3d("SiteA", 300, 300, 10, (500, 500, 5), (0.6, 0.2, 0.2))
        self._create_box_3d("SiteB", 300, 300, 10, (-500, -500, 5), (0.2, 0.2, 0.6))

    def _create_floor(self, name, w, d, pos, color):
        cm = CardMaker(name)
        cm.setFrame(-w/2, w/2, -d/2, d/2)
        card = NodePath(cm.generate())
        card.setPos(*pos)
        card.setColor(*color, 1.0)
        card.setHpr(0, -90, 0)
        card.setTwoSided(True)
        card.reparentTo(self.root)
        return card

    def _create_box_3d(self, name, w, d, h, pos, color):
        """带碰撞的 3D 盒子"""
        root = NodePath(name)
        root.setPos(*pos)
        root.reparentTo(self.root)

        half_w, half_d, half_h = w/2, d/2, h/2

        # 视觉面
        for fname, fpos, fhpr, fsize in [
            ("f", (0, half_d, 0), (0, 0, 0), (w, h)),
            ("b", (0, -half_d, 0), (0, 180, 0), (w, h)),
            ("r", (half_w, 0, 0), (0, 90, 0), (d, h)),
            ("l", (-half_w, 0, 0), (0, -90, 0), (d, h)),
            ("t", (0, 0, half_h), (0, 0, -90), (w, d)),
            ("bo", (0, 0, -half_h), (0, 0, 90), (w, d)),
        ]:
            cm = CardMaker(f"{name}_{fname}")
            cm.setFrame(-fsize[0]/2, fsize[0]/2, -fsize[1]/2, fsize[1]/2)
            face = NodePath(cm.generate())
            face.setPos(*fpos)
            face.setHpr(*fhpr)
            face.setColor(*color, 1.0)
            face.setTwoSided(True)
            face.reparentTo(root)

        # 碰撞盒 — 用于射击检测和角色碰撞
        cn = CollisionNode(f"collide_{name}")
        cn.addSolid(CollisionBox(Point3(0, 0, 0),
                                  half_w, half_d, half_h))
        cn.setIntoCollideMask(BitMask32.bit(0))
        cn.setFromCollideMask(BitMask32.bit(0))
        cnp = root.attachNewNode(cn)

        self._static_objects.append(root)
        return root

    def create_lighting(self):
        self.base.setBackgroundColor(0.5, 0.6, 0.7, 1)
        al = AmbientLight("ambient")
        al.setColor(VBase4(0.4, 0.4, 0.45, 1))
        self.root.setLight(self.root.attachNewNode(al))
        dl = DirectionalLight("sun")
        dl.setColor(VBase4(0.95, 0.92, 0.85, 1))
        dlnp = self.root.attachNewNode(dl)
        dlnp.setHpr(-45, -55, 0)
        self.root.setLight(dlnp)
        fl = DirectionalLight("fill")
        fl.setColor(VBase4(0.2, 0.25, 0.3, 1))
        flnp = self.root.attachNewNode(fl)
        flnp.setHpr(135, 30, 0)
        self.root.setLight(flnp)

    def get_player_spawn(self, team: int) -> tuple:
        return (800, -800, 64) if team == 0 else (-800, 800, 64)

    def update(self, dt):
        pass
