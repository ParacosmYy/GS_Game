# -*- coding: utf-8 -*-
"""
GS_PythonShooter — HUD 系统
对应 C++ AShooterHUD

管理：准星、血量/护甲、弹药、击杀信息、伤害指示器
"""
import math
from typing import Optional
from panda3d.core import (
    NodePath, Vec2, Vec4, TextNode, CardMaker
)
from panda3d.core import TransparencyAttrib
from ..core.constants import GameConstants


class HUD:
    """
    游戏内 HUD

    使用 Panda3D 的 2D 渲染覆盖层
    """

    def __init__(self, base):
        self.base = base
        self.root = NodePath("HUD")
        self.root.reparentTo(base.render2d)
        self.root.setBin("fixed", 100)  # 始终在最前

        # 准星
        self._crosshair_nodes = []
        self._crosshair_spread = 4.0
        self._crosshair_color = (0.0, 1.0, 0.0, 1.0)

        # 血量/护甲
        self._health_text = None
        self._armor_bar = None

        # 弹药
        self._ammo_text = None

        # 击杀信息
        self._kill_feed = []
        self._kill_feed_nodes = []

        # 伤害指示器
        self._damage_indicators = []

        self._init_hud()

    def _init_hud(self):
        """初始化 HUD 元素"""
        from panda3d.core import TextNode

        # 准星（4 条线）
        for i in range(4):
            cm = CardMaker(f"Crosshair_{i}")
            cm.setFrame(-2, 2, -10, 10)  # 2x20 的矩形
            node = NodePath(cm.generate())
            node.setColor(*self._crosshair_color)
            node.reparentTo(self.root)
            self._crosshair_nodes.append(node)

        # 血量文字
        self._health_text = TextNode("HealthText")
        self._health_text.setShadow(0.05, 0.05)
        self._health_text.setShadowColor(0, 0, 0, 1)
        self._health_text.setTextColor(1, 1, 1, 1)
        hp_node = NodePath(self._health_text)
        hp_node.setScale(0.05)
        hp_node.setPos(-1.3, 0, -0.8)
        hp_node.reparentTo(self.root)

        # 弹药文字
        self._ammo_text = TextNode("AmmoText")
        self._ammo_text.setShadow(0.05, 0.05)
        self._ammo_text.setShadowColor(0, 0, 0, 1)
        self._ammo_text.setTextColor(1, 1, 1, 1)
        ammo_node = NodePath(self._ammo_text)
        ammo_node.setScale(0.06)
        ammo_node.setPos(1.0, 0, -0.8)
        ammo_node.reparentTo(self.root)

    # ─── 准星 ───────────────────────────────────────────

    def update_crosshair(self, spread: float, is_ads: bool = False,
                          target_locked: bool = False):
        """更新准星大小和颜色"""
        self._crosshair_spread = spread
        color = (1.0, 0.0, 0.0, 1.0) if target_locked else \
                (0.0, 1.0, 0.0, 1.0) if not is_ads else \
                (0.0, 0.5, 1.0, 1.0)

        size = 10.0 + spread * 500.0

        # 更新 4 条线的位置
        offsets = [(0, size), (0, -size), (-size, 0), (size, 0)]
        rotations = [0, 0, 90, 90]

        for i, (ox, oy) in enumerate(offsets):
            node = self._crosshair_nodes[i]
            node.setPos(ox * 0.001, 0, oy * 0.001)
            node.setHpr(rotations[i], 0, 0)
            node.setColor(*color)
            node.setScale(1.0, 1.0, 0.5)

    # ─── 血量/护甲 ─────────────────────────────────────

    def update_health(self, health: float, armor: float):
        """更新血量显示"""
        self._health_text.setText(f"HP: {int(health)}  AR: {int(armor)}")

        # 血量变色
        if health > 50:
            self._health_text.setTextColor(1, 1, 1, 1)
        elif health > 25:
            self._health_text.setTextColor(1, 1, 0, 1)
        else:
            self._health_text.setTextColor(1, 0, 0, 1)

    # ─── 弹药 ───────────────────────────────────────────

    def update_ammo(self, current: int, reserve: int):
        """更新弹药显示"""
        self._ammo_text.setText(f"{current} / {reserve}")

    # ─── 击杀信息 ─────────────────────────────────────

    def add_kill_feed(self, killer: str, victim: str, weapon: str = "",
                      headshot: bool = False):
        """添加击杀信息"""
        entry = f"{killer} → {victim}"
        if headshot:
            entry += " [HEADSHOT]"
        if weapon:
            entry += f" ({weapon})"

        self._kill_feed.append(entry)
        if len(self._kill_feed) > 5:
            self._kill_feed.pop(0)
        self._rebuild_kill_feed()

    def _rebuild_kill_feed(self):
        """重建击杀信息显示"""
        # 清理旧节点
        for node in self._kill_feed_nodes:
            node.removeNode()
        self._kill_feed_nodes.clear()

        # 创建新节点
        for i, entry in enumerate(self._kill_feed):
            tn = TextNode(f"KillFeed_{i}")
            tn.setText(entry)
            tn.setShadow(0.03, 0.03)
            tn.setShadowColor(0, 0, 0, 0.8)
            tn.setTextColor(1, 1, 1, 1)
            node = NodePath(tn)
            node.setScale(0.035)
            node.setPos(0.5, 0, 0.9 - i * 0.05)
            node.reparentTo(self.root)
            self._kill_feed_nodes.append(node)

    # ─── 伤害指示器 ────────────────────────────────────

    def add_damage_indicator(self, direction_degrees: float):
        """添加伤害方向指示"""
        self._damage_indicators.append({
            "angle": direction_degrees,
            "time": 0.0,
            "duration": 1.5,
            "node": None,
        })

    # ─── 更新 ───────────────────────────────────────────

    def update(self, dt: float):
        """每帧更新 HUD"""
        # 更新伤害指示器
        for d in self._damage_indicators[:]:
            d["time"] += dt
            if d["time"] >= d["duration"]:
                self._damage_indicators.remove(d)
