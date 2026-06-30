#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GS_PythonShooter — 启动入口

用法:
    pip install -r requirements.txt
    python run_game.py

支持命令行参数:
    --windowed   窗口模式（默认）
    --fullscreen 全屏模式
    --width W    窗口宽度 (默认 1280)
    --height H   窗口高度 (默认 720)
    --test       运行自检后退出
"""
import sys
import os
import argparse

# 将 src 加入模块搜索路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


def parse_args():
    parser = argparse.ArgumentParser(
        description="GS_PythonShooter -- 战术射击游戏 (Python 版)"
    )
    parser.add_argument("--windowed", action="store_true", default=True,
                        help="窗口模式 (默认)")
    parser.add_argument("--fullscreen", action="store_true",
                        help="全屏模式")
    parser.add_argument("--width", type=int, default=1280,
                        help="窗口宽度")
    parser.add_argument("--height", type=int, default=720,
                        help="窗口高度")
    parser.add_argument("--test", action="store_true",
                        help="运行自检后退出")
    return parser.parse_args()


def run_self_test():
    """
    运行系统自检
    验证所有模块可以正常导入
    """
    print("=" * 50)
    print("  GS_PythonShooter -- 系统自检")
    print("=" * 50)
    print()

    checks = [
        ("core.constants", "from src.core import constants"),
        ("core.event_system", "from src.core import event_system"),
        ("core.game_loop", "from src.core import game_loop"),
        ("input.input_manager", "from src.input import input_manager"),
        ("character.first_person_controller",
         "from src.character import first_person_controller"),
        ("character.anim_state_machine",
         "from src.character import anim_state_machine"),
        ("weapon.weapon_base", "from src.weapon import weapon_base"),
        ("weapon.weapon_data", "from src.weapon import weapon_data"),
        ("weapon.weapon_component", "from src.weapon import weapon_component"),
        ("weapon.ballistics", "from src.weapon import ballistics"),
        ("weapon.damage", "from src.weapon import damage"),
        ("ai.behavior_tree", "from src.ai import behavior_tree"),
        ("ai.ai_controller", "from src.ai import ai_controller"),
        ("ai.perception", "from src.ai import perception"),
        ("ai.tactics", "from src.ai import tactics"),
        ("environment.scene", "from src.environment import scene"),
        ("environment.destructible", "from src.environment import destructible"),
        ("effects.impact_manager", "from src.effects import impact_manager"),
        ("ui.hud", "from src.ui import hud"),
        ("ui.menus", "from src.ui import menus"),
        ("render.pbr_shader", "from src.render import pbr_shader"),
        ("render.post_process", "from src.render import post_process"),
        ("render.lighting", "from src.render import lighting"),
    ]

    all_passed = True
    for name, import_stmt in checks:
        try:
            exec(import_stmt)
            print(f"  [OK] {name}")
        except ImportError as e:
            print(f"  [FAIL] {name}: {e}")
            all_passed = False

    # --- 弹道系统自检 ---
    print()
    print("[自检] 弹道模拟器:")
    try:
        from src.weapon.ballistics import Ballistics
        results = Ballistics.solve(
            (0, 0, 0), (1, 0, 0), 50000.0, 36.0, 0.65, None
        )
        print(f"  弹道追踪完成: {len(results)} 次命中")
    except Exception as e:
        print(f"  [FAIL] 弹道模拟失败: {e}")
        all_passed = False

    # --- 行为树自检 ---
    print()
    print("[自检] 行为树:")
    try:
        from src.ai.behavior_tree import (
            BehaviorTree, BTSequence, BTSelector,
            BTCondition, BTAction, BTStatus
        )
        bt = BehaviorTree()
        bt.root = BTSequence("Test")
        bt.root.add_child(BTAction("Dummy", lambda bb: BTStatus.SUCCESS))
        result = bt.tick()
        print(f"  行为树运行: {result.value}")
    except Exception as e:
        print(f"  [FAIL] 行为树失败: {e}")
        all_passed = False

    # --- 伤害计算自检 ---
    print()
    print("[自检] 伤害计算:")
    try:
        from src.weapon.damage import DamageCalculator, DamageCategory
        dmg = DamageCalculator.calculate(
            base_damage=36.0, armor=50.0, armor_penetration=0.65,
            bone_name="head", distance=1000.0, cat=DamageCategory.RIFLE
        )
        print(f"  AK-47 爆头 (50甲 @10m): {dmg:.1f} 伤害")
    except Exception as e:
        print(f"  [FAIL] 伤害计算失败: {e}")
        all_passed = False

    print()
    if all_passed:
        print("[OK] 所有自检通过!")
    else:
        print("[FAIL] 部分自检失败")

    return all_passed


def main():
    args = parse_args()

    if args.test:
        success = run_self_test()
        sys.exit(0 if success else 1)

    # 运行游戏前先自检
    if not run_self_test():
        print()
        print("! 自检未通过，请先安装依赖:")
        print("  pip install -r requirements.txt")
        print()
        input("按 Enter 继续尝试启动...")

    # 启动游戏
    print()
    print("启动 GS_PythonShooter...")
    print()

    # Panda3D 配置
    from panda3d.core import loadPrcFileData
    loadPrcFileData("", f"""
    win-size {args.width} {args.height}
    fullscreen {1 if args.fullscreen else 0}
    undecorated {1 if args.fullscreen else 0}
    """)

    # 启动应用
    from src.core.game_app import GameApp
    app = GameApp()
    app.run()


if __name__ == "__main__":
    main()
