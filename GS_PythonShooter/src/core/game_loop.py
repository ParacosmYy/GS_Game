# -*- coding: utf-8 -*-
"""
GS_PythonShooter — 游戏状态机
对应 C++ AShooterGameMode + AShooterGameState
管理：回合循环、队伍比分、经济系统、胜利条件
"""
from typing import List, Optional
from .constants import (
    TeamSide, RoundPhase, GameConstants, WeaponStats
)
from .event_system import global_events


class PlayerState:
    """玩家状态（对应 C++ AShooterPlayerState）"""

    def __init__(self, player_id: int, name: str = "Player"):
        self.player_id = player_id
        self.name = name
        self.team = TeamSide.SPECTATOR
        self.health = GameConstants.MAX_HEALTH
        self.armor = 0.0
        self.is_alive = True
        self.money = GameConstants.STARTING_MONEY
        self.total_earned = 0
        self.kills = 0
        self.deaths = 0
        self.assists = 0
        self.headshots = 0
        self.total_damage = 0.0
        self.mvp_stars = 0
        self.win_streak = 0
        self.has_armor = False
        self.has_helmet = False
        self.has_defuse_kit = False

    def add_money(self, amount: int):
        self.money = min(max(self.money + amount, 0), GameConstants.MAX_MONEY)
        if amount > 0:
            self.total_earned += amount

    def spend_money(self, amount: int) -> bool:
        if self.money < amount:
            return False
        self.money -= amount
        return True

    def add_kill(self, was_headshot: bool = False):
        self.kills += 1
        if was_headshot:
            self.headshots += 1

    def add_death(self):
        self.deaths += 1
        self.is_alive = False

    def add_assist(self):
        self.assists += 1

    def add_damage(self, amount: float):
        self.total_damage += amount

    def take_damage(self, damage: float, armor_penetration: float = 0.5):
        """应用伤害，考虑护甲"""
        actual = damage
        if self.armor > 0 and armor_penetration < 1.0:
            armor_absorb = damage * (1.0 - armor_penetration) * 0.5
            self.armor = max(0.0, self.armor - armor_absorb)
            actual = damage * armor_penetration
        self.health = max(0.0, self.health - actual)
        if self.health <= 0:
            self.is_alive = False
        return actual

    def reset_for_round(self):
        """新回合重置"""
        self.health = GameConstants.MAX_HEALTH
        self.armor = GameConstants.MAX_ARMOR if self.has_armor else 0.0
        self.is_alive = True

    @property
    def mvp_score(self) -> float:
        """MVP 加权评分"""
        return (self.kills + self.assists) * 2.0 + self.headshots * 1.5 + self.total_damage / 100.0


class GameLoop:
    """
    游戏循环状态机（对应 C++ AShooterGameMode）
    驱动：Warmup → FreezeTime → Action → RoundEnd → ...
    """

    def __init__(self):
        self.phase = RoundPhase.WARMUP
        self.phase_timer = 0.0
        self.current_round = 0

        # 比分
        self.t_score = 0
        self.ct_score = 0

        # 玩家列表
        self.players: List[PlayerState] = []

        self._phase_timeouts = {
            RoundPhase.WARMUP: GameConstants.WARMUP_TIME,
            RoundPhase.FREEZE_TIME: GameConstants.FREEZE_TIME_DURATION,
            RoundPhase.ACTION: GameConstants.ROUND_TIME,
            RoundPhase.ROUND_END: GameConstants.ROUND_END_TIME,
        }

    # ─── 阶段切换 ────────────────────────────────────────

    def start_warmup(self):
        self.phase = RoundPhase.WARMUP
        self.phase_timer = GameConstants.WARMUP_TIME
        global_events.emit("phase_changed", RoundPhase.WARMUP)

    def start_freeze_time(self):
        self.phase = RoundPhase.FREEZE_TIME
        self.phase_timer = GameConstants.FREEZE_TIME_DURATION
        self.current_round += 1
        global_events.emit("phase_changed", RoundPhase.FREEZE_TIME)

        # 重置玩家
        for p in self.players:
            p.reset_for_round()

        # 通知购买菜单
        global_events.emit("buy_menu_open")

    def start_action(self):
        self.phase = RoundPhase.ACTION
        self.phase_timer = GameConstants.ROUND_TIME
        global_events.emit("phase_changed", RoundPhase.ACTION)
        global_events.emit("buy_menu_close")

    def end_round(self, winning_team: TeamSide):
        self.phase = RoundPhase.ROUND_END
        self.phase_timer = GameConstants.ROUND_END_TIME

        # 加分
        if winning_team == TeamSide.TERRORIST:
            self.t_score += 1
        else:
            self.ct_score += 1

        # 经济奖励
        self._award_round_reward(winning_team, won=True)
        other = TeamSide.COUNTER_TERRORIST if winning_team == TeamSide.TERRORIST else TeamSide.TERRORIST
        self._award_round_reward(other, won=False)

        # 计算 MVP
        best = max(self.players, key=lambda p: p.mvp_score, default=None)
        if best:
            best.mvp_stars += 1

        global_events.emit("round_ended", winning_team)

        # 检查比赛结束
        if self.t_score >= 13 or self.ct_score >= 13:
            self.phase = RoundPhase.MATCH_OVER
            global_events.emit("match_ended", winning_team)

    def start_new_round(self):
        """半场交换队伍"""
        if self.current_round == GameConstants.ROUNDS_PER_HALF:
            for p in self.players:
                p.team = TeamSide.COUNTER_TERRORIST if p.team == TeamSide.TERRORIST else TeamSide.TERRORIST
        self.start_freeze_time()

    # ─── 更新 ────────────────────────────────────────────

    def update(self, dt: float):
        """每帧调用"""
        self.phase_timer -= dt

        if self.phase == RoundPhase.WARMUP and self.phase_timer <= 0:
            self.start_freeze_time()
        elif self.phase == RoundPhase.FREEZE_TIME and self.phase_timer <= 0:
            self.start_action()
        elif self.phase == RoundPhase.ACTION:
            self._check_round_end()
            if self.phase_timer <= 0:
                self.end_round(TeamSide.COUNTER_TERRORIST)
        elif self.phase == RoundPhase.ROUND_END and self.phase_timer <= 0:
            self.start_new_round()

    # ─── 内部 ────────────────────────────────────────────

    def _check_round_end(self):
        """检查是否一方全灭"""
        t_alive = any(p.is_alive and p.team == TeamSide.TERRORIST for p in self.players)
        ct_alive = any(p.is_alive and p.team == TeamSide.COUNTER_TERRORIST for p in self.players)

        if not t_alive:
            self.end_round(TeamSide.COUNTER_TERRORIST)
        elif not ct_alive:
            self.end_round(TeamSide.TERRORIST)

    def _award_round_reward(self, team: TeamSide, won: bool):
        """发放回合经济奖励"""
        for p in self.players:
            if p.team != team:
                continue
            if won:
                p.add_money(GameConstants.WIN_ROUND_REWARD)
                p.win_streak = 0
            else:
                loss_reward = min(
                    GameConstants.LOSS_REWARD_BASE +
                    p.win_streak * GameConstants.LOSS_REWARD_INCREMENT,
                    GameConstants.MAX_LOSS_STREAK_REWARD
                )
                p.add_money(loss_reward)
                p.win_streak += 1

    def add_player(self, name: str = "Player") -> PlayerState:
        """添加玩家并自动分配队伍"""
        pid = len(self.players) + 1
        player = PlayerState(pid, name)
        self.players.append(player)

        # 自动平衡队伍
        t_count = sum(1 for p in self.players if p.team == TeamSide.TERRORIST)
        ct_count = sum(1 for p in self.players if p.team == TeamSide.COUNTER_TERRORIST)
        player.team = TeamSide.TERRORIST if t_count <= ct_count else TeamSide.COUNTER_TERRORIST

        return player
