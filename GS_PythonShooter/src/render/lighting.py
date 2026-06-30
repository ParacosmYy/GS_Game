# -*- coding: utf-8 -*-
"""
GS_PythonShooter — 光照系统
对应 C++ 渲染管线的光照配置

管理：方向光、点光源、阴影
"""
from panda3d.core import (
    NodePath, AmbientLight, DirectionalLight, PointLight,
    Spotlight, VBase4, Vec3, Vec4
)


class LightingSystem:
    """
    光照系统

    提供：
    - 环境光（基础照明）
    - 方向光（太阳模拟）
    - 点光源（弹光、爆炸光效）
    - 阴影
    """

    def __init__(self, base):
        self.base = base
        self.root = NodePath("LightingRoot")

        self._lights: list = []
        self._setup_default_lighting()

    def _setup_default_lighting(self):
        """设置默认光照"""
        # 环境光（低强度，提供基础照明）
        ambient = AmbientLight("ambient_light")
        ambient.setColor(VBase4(0.25, 0.25, 0.3, 1.0))
        ambient_np = self.root.attachNewNode(ambient)
        self.base.render.setLight(ambient_np)
        self._lights.append(("ambient", ambient_np))

        # 主方向光（太阳）
        sun = DirectionalLight("sun_light")
        sun.setColor(VBase4(0.95, 0.92, 0.85, 1.0))
        sun.setShadowCaster(True, 2048, 2048)
        sun.getLens().setFilmSize(40, 40)
        sun.getLens().setNearFar(10, 5000)

        sun_np = self.root.attachNewNode(sun)
        sun_np.setHpr(-45, -55, 0)  # 角度模拟午后阳光
        self.base.render.setLight(sun_np)
        self._lights.append(("sun", sun_np))

        # 补光方向光
        fill = DirectionalLight("fill_light")
        fill.setColor(VBase4(0.3, 0.35, 0.4, 1.0) * 0.3)
        fill_np = self.root.attachNewNode(fill)
        fill_np.setHpr(135, 30, 0)
        self.base.render.setLight(fill_np)
        self._lights.append(("fill", fill_np))

    def add_point_light(self, position: tuple, color: tuple = (1, 1, 1),
                         intensity: float = 1.0, radius: float = 500.0
                         ) -> NodePath:
        """
        添加点光源

        Args:
            position: (x, y, z)
            color: (r, g, b)
            intensity: 强度
            radius: 影响范围

        Returns:
            光源节点路径
        """
        plight = PointLight("point_light")
        plight.setColor(VBase4(*color, 1.0) * intensity)
        plight.setAttenuation(Vec3(1.0, 0.0, 1.0 / (radius * radius)))

        pl_np = self.root.attachNewNode(plight)
        pl_np.setPos(*position)
        self.base.render.setLight(pl_np)
        self._lights.append(("point", pl_np))

        return pl_np

    def remove_light(self, light_np: NodePath):
        """移除光源"""
        self.base.render.clearLight(light_np)
        light_np.removeNode()
        self._lights = [l for l in self._lights if l[1] != light_np]

    def set_shadow_enabled(self, enabled: bool):
        """开关阴影"""
        for light_type, light_np in self._lights:
            if light_type == "sun":
                light = light_np.node()
                if hasattr(light, "setShadowCaster"):
                    light.setShadowCaster(enabled)

    def clear_all(self):
        """清除所有光源"""
        for _, light_np in self._lights:
            self.base.render.clearLight(light_np)
            light_np.removeNode()
        self._lights.clear()
