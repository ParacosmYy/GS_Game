# -*- coding: utf-8 -*-
"""
GS_PythonShooter — 输入管理器
修复：鼠标按钮释放回调、vel 更新
"""
from typing import Callable, Dict, Tuple
from panda3d.core import (
    WindowProperties, KeyboardButton, MouseButton
)


class InputManager:
    MOVE_FORWARD = "move_forward"
    MOVE_BACKWARD = "move_backward"
    MOVE_LEFT = "move_left"
    MOVE_RIGHT = "move_right"
    JUMP = "jump"
    CROUCH = "crouch"
    SPRINT = "sprint"
    FIRE = "fire"
    ADS = "aim_down_sight"
    RELOAD = "reload"
    INTERACT = "interact"
    NEXT_WEAPON = "next_weapon"
    PREV_WEAPON = "prev_weapon"
    USE_GRENADE = "use_grenade"
    BUY_MENU = "buy_menu"

    def __init__(self, base):
        self.base = base
        self.win = base.win
        self.mw = base.mouseWatcherNode

        self._keys: Dict[str, bool] = {}
        self._mouse_btns = {"left": False, "right": False}
        self._mouse_delta = (0.0, 0.0)
        self._mouse_pos = (0.0, 0.0)
        self._action_bindings: Dict[str, list] = {}
        self._mouse_sensitivity = 0.15
        self._centered = False

        self._setup_defaults()
        self._lock_mouse(True)

    def _setup_defaults(self):
        self._key_map = {
            "w": self.MOVE_FORWARD, "s": self.MOVE_BACKWARD,
            "a": self.MOVE_LEFT, "d": self.MOVE_RIGHT,
            "space": self.JUMP, "control": self.CROUCH,
            "shift": self.SPRINT, "r": self.RELOAD,
            "e": self.INTERACT, "g": self.USE_GRENADE,
            "b": self.BUY_MENU,
            "q": "drop_weapon",
        }

    def _lock_mouse(self, locked: bool):
        p = WindowProperties()
        if locked:
            p.setCursorHidden(True)
            p.setMouseMode(WindowProperties.M_confined)
        else:
            p.setCursorHidden(False)
            p.setMouseMode(WindowProperties.M_absolute)
        self.win.requestProperties(p)

    def bind_action(self, action: str, cb: Callable):
        self._action_bindings.setdefault(action, []).append(cb)

    def get_mouse_delta(self) -> Tuple[float, float]:
        return self._mouse_delta

    def update(self):
        # 键盘
        for ks in self._key_map:
            key = KeyboardButton.ascii_key(ks[0]) if len(ks) == 1 else {
                "space": KeyboardButton.space(), "control": KeyboardButton.control(),
                "shift": KeyboardButton.shift()
            }.get(ks)
            if not key:
                continue
            down = self.mw.isButtonDown(key)
            was = self._keys.get(ks, False)
            if down and not was:
                self._keys[ks] = True
                for cb in self._action_bindings.get(self._key_map[ks], []):
                    cb(True)
            elif not down and was:
                self._keys[ks] = False
                for cb in self._action_bindings.get(self._key_map[ks], []):
                    cb(False)

        # 鼠标按钮（跟踪状态确保释放正确）
        for btn, name in [("left", self.FIRE), ("right", self.ADS)]:
            down = self.mw.isButtonDown(
                MouseButton.one() if btn == "left" else MouseButton.two())
            was = self._mouse_btns[btn]
            if down and not was:
                self._mouse_btns[btn] = True
                for cb in self._action_bindings.get(name, []):
                    cb(True)
            elif not down and was:
                self._mouse_btns[btn] = False
                for cb in self._action_bindings.get(name, []):
                    cb(False)

        # 鼠标 delta
        if self.mw.hasMouse():
            x = self.mw.getMouseX()
            y = self.mw.getMouseY()
            if not self._centered:
                self._mouse_pos = (x, y)
                self._centered = True
            else:
                dx = x - self._mouse_pos[0]
                dy = y - self._mouse_pos[1]
                self._mouse_delta = (dx * self._mouse_sensitivity,
                                     -dy * self._mouse_sensitivity)
                self._mouse_pos = (x, y)
        else:
            self._mouse_delta = (0.0, 0.0)
