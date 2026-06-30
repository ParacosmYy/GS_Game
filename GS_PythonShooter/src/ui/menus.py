# -*- coding: utf-8 -*-
"""
GS_PythonShooter — 菜单系统
对应 C++ UMG 菜单
"""
from typing import Optional, Callable
from panda3d.core import (
    NodePath, TextNode, CardMaker
)


class MainMenu:
    """主菜单"""

    def __init__(self, base):
        self.base = base
        self.root = NodePath("MainMenu")
        self.root.reparentTo(base.render2d)

        self._is_visible = False
        self._buttons = []

    def show(self):
        self._is_visible = True
        self.root.show()

    def hide(self):
        self._is_visible = False
        self.root.hide()

    def destroy(self):
        self.root.removeNode()


class BuyMenu:
    """
    购买菜单

    对应 CS2 的 B 键购买菜单
    """

    # 武器商品列表
    WEAPON_SHOP = [
        # (名称, 价格, 分类)
        ("AK-47", 2700, "Rifle"),
        ("M4A4", 3100, "Rifle"),
        ("AWP", 4750, "Sniper"),
        ("MAC-10", 1050, "SMG"),
        ("Desert Eagle", 700, "Pistol"),
        ("Glock-18", 200, "Pistol"),
        ("Kevlar", 650, "Equipment"),
        ("Kevlar+Helmet", 1000, "Equipment"),
        ("DefuseKit", 400, "Equipment"),
    ]

    def __init__(self, base, on_buy: Optional[Callable] = None):
        self.base = base
        self.on_buy = on_buy or (lambda item: None)
        self.root = NodePath("BuyMenu")
        self.root.reparentTo(base.render2d)
        self.root.hide()

        self._items = []
        self._is_open = False

        self._init_ui()

    def _init_ui(self):
        """初始化购买菜单 UI"""
        # 背景
        cm = CardMaker("BuyMenuBG")
        cm.setFrame(-0.5, 0.5, -0.6, 0.6)
        bg = NodePath(cm.generate())
        bg.setColor(0.1, 0.1, 0.15, 0.9)
        bg.reparentTo(self.root)

        # 标题
        title = TextNode("BuyMenuTitle")
        title.setText("BUY MENU")
        title.setTextColor(1, 1, 0, 1)
        title.setShadow(0.05, 0.05)
        tn = NodePath(title)
        tn.setScale(0.06)
        tn.setPos(0, 0, 0.55)
        tn.reparentTo(self.root)

        # 商品列表
        for i, (name, price, category) in enumerate(self.WEAPON_SHOP):
            y = 0.45 - i * 0.07
            item_text = TextNode(f"ShopItem_{i}")
            item_text.setText(f"{name}  ${price}")
            item_text.setTextColor(0.8, 0.8, 0.8, 1)
            item_text.setShadow(0.02, 0.02)
            item_node = NodePath(item_text)
            item_node.setScale(0.04)
            item_node.setPos(-0.4, 0, y)
            item_node.reparentTo(self.root)

            self._items.append({
                "name": name,
                "price": price,
                "category": category,
                "node": item_node,
            })

    def open(self, current_money: int):
        """打开购买菜单"""
        self._is_open = True
        self.root.show()

        # 更新可购买状态
        for item in self._items:
            affordable = current_money >= item["price"]
            item["node"].setColorScale(
                1, 1, 1, 1 if affordable else 0.3
            )

    def close(self):
        self._is_open = False
        self.root.hide()

    @property
    def is_open(self) -> bool:
        return self._is_open
