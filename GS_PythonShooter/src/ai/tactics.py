# -*- coding: utf-8 -*-
"""
GS_PythonShooter — AI 战术任务节点
对应 C++ ShooterBTTasks + ShooterBTDecorators
"""
import math
import random
import time
from .behavior_tree import BTStatus


def task_find_cover(blackboard: dict) -> BTStatus:
    """
    寻找掩体（C++ UBTTask_FindCover）

    在远离敌人的方向搜索遮挡位置
    """
    self_obj = blackboard.get("self")
    controller = blackboard.get("controller")
    if not self_obj or not controller or not controller.target:
        return BTStatus.FAILURE

    my_pos = getattr(self_obj, "position", (0, 0, 0))
    target_pos = getattr(controller.target, "position", (0, 0, 0))

    # 远离敌人方向
    away_x = my_pos[0] - target_pos[0]
    away_y = my_pos[1] - target_pos[1]
    dist = math.sqrt(away_x * away_x + away_y * away_y)
    if dist < 1:
        return BTStatus.FAILURE

    away_dir = (away_x / dist, away_y / dist)

    # 搜索掩体位置
    search_dist = random.uniform(300.0, 800.0)
    cover_pos = (
        my_pos[0] + away_dir[0] * search_dist + random.uniform(-200, 200),
        my_pos[1] + away_dir[1] * search_dist + random.uniform(-200, 200),
        my_pos[2]
    )

    blackboard["target_location"] = cover_pos
    blackboard["is_moving"] = True

    return BTStatus.SUCCESS


def task_shoot(blackboard: dict) -> BTStatus:
    """
    射击任务（C++ UBTTask_Shoot）

    向目标射击，持续一段时间
    """
    self_obj = blackboard.get("self")
    if not self_obj:
        return BTStatus.FAILURE

    # 射击
    fire_fn = getattr(self_obj, "start_fire", None)
    if fire_fn:
        fire_fn()

    # 模拟持续射击
    burst_end = blackboard.get("burst_end_time", 0)
    if burst_end == 0:
        burst_len = getattr(self_obj, "burst_length", 1.5)
        blackboard["burst_end_time"] = time.time() + random.uniform(0.3, burst_len)

    if time.time() >= blackboard["burst_end_time"]:
        stop_fn = getattr(self_obj, "end_fire", None)
        if stop_fn:
            stop_fn()
        blackboard["burst_end_time"] = 0
        return BTStatus.SUCCESS

    return BTStatus.RUNNING


def task_flank(blackboard: dict) -> BTStatus:
    """
    侧翼包抄（C++ UBTTask_Flank）

    绕到目标侧面
    """
    controller = blackboard.get("controller")
    self_obj = blackboard.get("self")
    if not controller or not controller.target or not self_obj:
        return BTStatus.FAILURE

    my_pos = getattr(self_obj, "position", (0, 0, 0))
    target_pos = getattr(controller.target, "position", (0, 0, 0))

    # 随机选择左/右侧翼
    side = 1.0 if random.random() > 0.5 else -1.0
    tx = target_pos[0] - my_pos[0]
    ty = target_pos[1] - my_pos[1]
    dist = math.sqrt(tx * tx + ty * ty)
    if dist < 1:
        return BTStatus.FAILURE

    # 垂直方向 = 侧翼
    flank_pos = (
        target_pos[0] + (-ty / dist * side + tx / dist) * 1000.0,
        target_pos[1] + (tx / dist * side + ty / dist) * 1000.0,
        target_pos[2]
    )

    blackboard["target_location"] = flank_pos
    blackboard["is_moving"] = True

    return BTStatus.SUCCESS


def task_search_enemy(blackboard: dict) -> BTStatus:
    """
    搜索敌人（C++ UBTTask_SearchEnemy）

    在最后已知位置周围搜索
    """
    controller = blackboard.get("controller")
    if not controller:
        return BTStatus.FAILURE

    last_pos = controller.last_known_pos
    if last_pos == (0, 0, 0):
        return BTStatus.FAILURE

    # 在最后已知位置周围随机搜索
    search_pos = (
        last_pos[0] + random.uniform(-500, 500),
        last_pos[1] + random.uniform(-500, 500),
        last_pos[2]
    )

    blackboard["target_location"] = search_pos
    blackboard["is_moving"] = True

    return BTStatus.SUCCESS


def task_hold_position(blackboard: dict) -> BTStatus:
    """
    固守位置（C++ 静态防守）

    在当前区域巡逻等待
    """
    self_obj = blackboard.get("self")
    if not self_obj:
        return BTStatus.FAILURE

    # 小范围移动
    my_pos = getattr(self_obj, "position", (0, 0, 0))
    if random.random() < 0.01:  # 低概率重新定位
        blackboard["target_location"] = (
            my_pos[0] + random.uniform(-200, 200),
            my_pos[1] + random.uniform(-200, 200),
            my_pos[2]
        )
        blackboard["is_moving"] = True

    return BTStatus.RUNNING
