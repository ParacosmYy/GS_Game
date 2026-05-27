# 当前迭代

## 目标

- Phase 2 (137→2000) 持续迭代
- 当前分数：137/2000
- 本轮：街机模式对手递进 — 闭合差距矩阵 3.1 流程仪式感

## 当前状态

- 当前主线：Phase 2 游戏流程进阶 + 街机仪式感
- Phase 1：Ryo Vertical Slice 100% 完成
- 战斗系统：8/8 KOF2002 深层机制已实现（MAX/FreeCancel/GuardCancel/Juggle/CounterWire/Blowback）
- 当前最高优先级仍然是按 [KOF 差距矩阵](../product/kof-gap-matrix.md) 逐项闭合差距
- 当前迭代要点：街机模式对手递进、菜单/选人/VS/胜负画面、招式表与输入可见性、Kyo/Iori 内容包接入

## 本轮完成

- Round 15: 街机模式对手递进
  - 新增 NEXT_MATCH 阶段：胜场后自动推进到下一个对手
  - 从ROSTER生成随机对手队列（排除P1所选角色）
  - NEXT STAGE过渡画面：显示对手名字+进度条+舞台编号
  - 全部对手击败后显示 CONGRATULATIONS 画面
  - 游戏流程 24→25

- Round 14: KO结果HP对比面板

- Round 13: 菜单导航光标SFX

## 复盘

- 本轮提升：游戏流程维度 +1
- 更像 KOF：赢得比赛后自动进入下一场战斗，有STAGE过渡画面和进度指示，接近街机街机模式体验
- 仍不像 KOF：角色仍是程序化骨骼/像素帧渲染，不是SNK精灵图
- 下一轮最小任务：根据差距矩阵优先级，继续补流程仪式感或多角色内容包的可感知改进
- 闭合差距矩阵：3.1 流程与场景仪式感差距（街机对手递进闭合）

## 回退方案

- 改动涉及 GameStateManager(街机状态) + main.ts(流程分支) + overlayScreens(过渡画面) + types(新阶段)
- 回退 git revert 即可
