# -*- coding: utf-8 -*-
"""
GS_PythonShooter — 事件系统
替代 UE5 的 Delegate/Dispatcher 机制，使用观察者模式
"""
from typing import Callable, Dict, List, Any
from collections import defaultdict
import weakref


class EventSystem:
    """
    轻量级消息总线
    用法:
        events = EventSystem()
        events.on("player_died", lambda data: print(f"Player died: {data}"))
        events.emit("player_died", {"player_id": 1, "killer_id": 2})
    """

    def __init__(self):
        self._listeners: Dict[str, List[Callable]] = defaultdict(list)

    def on(self, event_name: str, callback: Callable):
        """注册事件监听器"""
        self._listeners[event_name].append(callback)

    def off(self, event_name: str, callback: Callable):
        """移除事件监听器"""
        if event_name in self._listeners:
            self._listeners[event_name] = [
                cb for cb in self._listeners[event_name]
                if cb is not callback
            ]

    def emit(self, event_name: str, *args, **kwargs):
        """触发事件"""
        for callback in self._listeners.get(event_name, []):
            callback(*args, **kwargs)

    def clear(self):
        """清除所有监听器"""
        self._listeners.clear()


# 全局单例
global_events = EventSystem()
