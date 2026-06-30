# -*- coding: utf-8 -*-
"""
GS_PythonShooter — 行为树框架
对应 C++ Behavior Tree 系统

纯 Python 实现的行为树，支持：
- Selector (选择器)：依次执行子节点，一个成功即返回
- Sequence (序列)：依次执行子节点，全部成功才返回
- Condition (条件)：检查状态
- Action (动作)：执行任务
- Decorator (装饰器)：修饰子节点行为
"""
from enum import Enum
from typing import List, Optional, Callable, Any


class BTStatus(Enum):
    """行为树节点状态"""
    SUCCESS = "success"
    FAILURE = "failure"
    RUNNING = "running"


class BTNode:
    """行为树节点基类"""

    def __init__(self, name: str = "Node"):
        self.name = name
        self._children: List[BTNode] = []

    def add_child(self, child: "BTNode"):
        self._children.append(child)
        return self

    def tick(self, blackboard: dict) -> BTStatus:
        raise NotImplementedError

    def reset(self):
        for child in self._children:
            child.reset()


class BTAction(BTNode):
    """动作节点"""

    def __init__(self, name: str, fn: Callable):
        super().__init__(name)
        self._fn = fn

    def tick(self, blackboard: dict) -> BTStatus:
        return self._fn(blackboard)


class BTCondition(BTNode):
    """条件节点"""

    def __init__(self, name: str, fn: Callable):
        super().__init__(name)
        self._fn = fn

    def tick(self, blackboard: dict) -> BTStatus:
        return BTStatus.SUCCESS if self._fn(blackboard) else BTStatus.FAILURE


class BTSelector(BTNode):
    """选择器（OR）：依次执行子节点，一个成功即返回"""

    def tick(self, blackboard: dict) -> BTStatus:
        for child in self._children:
            status = child.tick(blackboard)
            if status == BTStatus.RUNNING:
                return BTStatus.RUNNING
            if status == BTStatus.SUCCESS:
                return BTStatus.SUCCESS
        return BTStatus.FAILURE


class BTSequence(BTNode):
    """序列（AND）：依次执行子节点，全部成功才返回"""

    def __init__(self, name: str = "Sequence"):
        super().__init__(name)
        self._current_index = 0

    def tick(self, blackboard: dict) -> BTStatus:
        while self._current_index < len(self._children):
            status = self._children[self._current_index].tick(blackboard)
            if status == BTStatus.RUNNING:
                return BTStatus.RUNNING
            if status == BTStatus.FAILURE:
                self._current_index = 0
                return BTStatus.FAILURE
            self._current_index += 1

        self._current_index = 0
        return BTStatus.SUCCESS

    def reset(self):
        self._current_index = 0
        super().reset()


class BTDecorator(BTNode):
    """装饰器节点"""

    def __init__(self, name: str, condition_fn: Callable):
        super().__init__(name)
        self._condition = condition_fn
        self._child: Optional[BTNode] = None

    def set_child(self, child: BTNode):
        self._child = child
        return self

    def tick(self, blackboard: dict) -> BTStatus:
        if not self._condition(blackboard):
            return BTStatus.FAILURE
        return self._child.tick(blackboard) if self._child else BTStatus.FAILURE


class BTInverter(BTDecorator):
    """反转子节点结果"""

    def __init__(self, name: str = "Inverter"):
        super().__init__(name, lambda bb: True)

    def tick(self, blackboard: dict) -> BTStatus:
        if not self._child:
            return BTStatus.FAILURE
        result = self._child.tick(blackboard)
        if result == BTStatus.SUCCESS:
            return BTStatus.FAILURE
        if result == BTStatus.FAILURE:
            return BTStatus.SUCCESS
        return BTStatus.RUNNING


class BehaviorTree:
    """
    行为树主类

    用法:
        bt = BehaviorTree()
        bt.root = BTSelector("Root")
            .add_child(BTSequence("Attack")
                .add_child(BTCondition("EnemyVisible", ...))
                .add_child(BTAction("Shoot", ...))
            )
            .add_child(BTSequence("Patrol")
                .add_child(BTAction("MoveToCover", ...))
            )

        while running:
            status = bt.tick()
    """

    def __init__(self):
        self.root: Optional[BTNode] = None
        self.blackboard: dict = {}
        self._running = True

    def tick(self) -> BTStatus:
        if not self.root:
            return BTStatus.FAILURE
        return self.root.tick(self.blackboard)

    def set_value(self, key: str, value: Any):
        self.blackboard[key] = value

    def get_value(self, key: str, default: Any = None) -> Any:
        return self.blackboard.get(key, default)

    def reset(self):
        if self.root:
            self.root.reset()
        self.blackboard.clear()
