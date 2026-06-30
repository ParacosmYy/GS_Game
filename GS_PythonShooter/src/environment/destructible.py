# -*- coding: utf-8 -*-
"""
GS_PythonShooter — 可破坏物体
对应 C++ AShooterDestructibleActor
"""
import math
from typing import Optional
from panda3d.core import NodePath


class DestructibleObject:
    """
    可破坏物体

    支持：
    - 累计伤害触发破坏
    - 碎片效果（简化版：隐藏+替换）
    - 物理反应
    """

    def __init__(self, nodepath: NodePath, name: str = "Destructible",
                 health: float = 100.0):
        self.nodepath = nodepath
        self.name = name
        self.max_health = health
        self.health = health
        self.is_destroyed = False

        # 原始材质颜色
        self._orig_color = nodepath.getColor()

    def take_damage(self, damage: float) -> bool:
        """
        承受伤害

        Returns:
            True = 已破坏, False = 未破坏
        """
        if self.is_destroyed:
            return True

        self.health -= damage

        # 变色提示受损
        damage_pct = 1.0 - (self.health / self.max_health)
        if damage_pct > 0.3:
            r = 0.3 + damage_pct * 0.7
            self.nodepath.setColor(r, 0.2, 0.2, 1.0)

        if self.health <= 0:
            self.destroy()
            return True

        return False

    def destroy(self):
        """触发破坏"""
        if self.is_destroyed:
            return

        self.is_destroyed = True
        self.nodepath.hide()  # 隐藏完整物体

        # TODO: 生成碎片模型
        # 对于简化版，只做颜色变化模拟

    def reset(self):
        """重置破坏状态"""
        self.health = self.max_health
        self.is_destroyed = False
        self.nodepath.show()
        self.nodepath.setColor(*self._orig_color)
