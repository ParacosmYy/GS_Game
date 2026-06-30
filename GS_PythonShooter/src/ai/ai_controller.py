# -*- coding: utf-8 -*-
"""
GS_PythonShooter — AI 控制器
对应 C++ AShooterAIController
"""
import math
import random
import time
from typing import Optional
from .behavior_tree import (
    BehaviorTree, BTSelector, BTSequence, BTCondition,
    BTAction, BTDecorator, BTStatus
)
from .perception import AIPerception
from .tactics import (
    task_find_cover, task_shoot, task_flank,
    task_search_enemy, task_hold_position
)
from ..core.constants import AISkillLevel


class AIController:
    """
    AI 大脑

    管理：
    - 行为树运行
    - 感知系统
    - 战斗状态
    - 技能水平
    """

    def __init__(self, team_side, skill: Optional[AISkillLevel] = None):
        self.team = team_side
        self.skill = skill or AISkillLevel()
        self.perception = AIPerception()

        # 战斗状态
        self.target = None
        self.last_known_pos = (0.0, 0.0, 0.0)
        self.last_seen_time = 0.0
        self.is_in_combat = False

        # 被引用的外部对象
        self._bot = None  # AI 角色引用
        self._nav_mesh = None  # 导航网格

        # 构建行为树
        self.bt = self._build_behavior_tree()

    def possess(self, bot):
        """控制角色"""
        self._bot = bot
        self.bt.set_value("self", bot)
        self.bt.set_value("controller", self)

    def _build_behavior_tree(self) -> BehaviorTree:
        """构建 AI 行为树"""
        bt = BehaviorTree()

        bt.root = BTSelector("Root")

        # ─── 战斗分支 ───
        combat_seq = BTSequence("CombatSequence")
        combat_seq.add_child(
            BTCondition("InCombat", lambda bb: bb.get("controller").is_in_combat)
        )
        combat_seq.add_child(
            BTSelector("CombatSelector")
            .add_child(
                BTSequence("VisibleAttack")
                .add_child(
                    BTCondition("TargetVisible",
                                lambda bb: bb.get("controller").perception.is_visible(
                                    bb.get("controller").target))
                )
                .add_child(BTAction("Shoot", task_shoot))
                .add_child(BTAction("FindCover", task_find_cover))
            )
            .add_child(
                BTSequence("LostTarget")
                .add_child(
                    BTCondition("HasLastKnown",
                                lambda bb: bb.get("controller").last_known_pos != (0, 0, 0))
                )
                .add_child(BTAction("Search", task_search_enemy))
                .add_child(BTAction("Flank", task_flank))
            )
        )

        bt.root.add_child(combat_seq)

        # ─── 巡逻/防守分支 ───
        idle_seq = BTSequence("IdleSequence")
        idle_seq.add_child(
            BTDecorator("HealthCheck",
                        lambda bb: bb.get("self", None) is not None
                        if hasattr(bb.get("self"), "health") else False)
        )
        idle_seq.add_child(
            BTSelector("IdleSelector")
            .add_child(BTAction("HoldPosition", task_hold_position))
            .add_child(BTAction("FindCover", task_find_cover))
        )
        bt.root.add_child(idle_seq)

        return bt

    def update(self, dt: float):
        """每帧更新 AI"""
        # 更新感知
        self.perception.update(dt)

        # 战斗超时检查
        if self.is_in_combat and self.target:
            time_since_seen = time.time() - self.last_seen_time
            if time_since_seen > 10.0:
                self._clear_target()

        # 更新黑板
        self.bt.set_value("dt", dt)

        # Tick 行为树
        status = self.bt.tick()

    def on_target_detected(self, target):
        """检测到目标"""
        self.target = target
        self.last_known_pos = getattr(target, "position", (0, 0, 0))
        self.last_seen_time = time.time()
        self.is_in_combat = True

    def on_heard_noise(self, position: tuple):
        """听到声音"""
        self.last_known_pos = position
        if not self.is_in_combat:
            self.is_in_combat = True

    def _clear_target(self):
        self.target = None
        self.is_in_combat = False

    @property
    def aim_accuracy_modifier(self) -> float:
        """射击精度修正（值越低越不准）"""
        return 1.0 - self.skill.aim_accuracy * 0.7

    @property
    def reaction_time(self) -> float:
        """反应时间"""
        return self.skill.reaction_time + random.uniform(-0.1, 0.1)
