# 当前迭代

## 目标

- Phase 2 (137→2000) 持续迭代
- 当前分数：138/2000
- 本轮：舞台开场仪式 + 测试稳定性修复

## 当前状态

- 当前主线：Phase 2 游戏流程进阶 + 街机仪式感
- Phase 1：Ryo Vertical Slice 100% 完成
- 战斗系统：8/8 KOF2002 深层机制已实现（MAX/FreeCancel/GuardCancel/Juggle/CounterWire/Blowback）
- 当前最高优先级仍然是按 [KOF 差距矩阵](../product/kof-gap-matrix.md) 逐项闭合差距
- 当前迭代要点：街机模式对手递进、菜单/选人/VS/胜负画面、招式表与输入可见性、Kyo/Iori 内容包接入

## 本轮完成

- Round 16: 舞台开场仪式 STAGE_INTRO
  - 新增 GamePhase.STAGE_INTRO（NEXT_MATCH→STAGE_INTRO→INTRO）
  - 舞台名称覆盖层（暗色遮罩+SNK风格文字+装饰条+accent色）
  - createStageIntroSequence 播报序列工厂
  - 6舞台专属accent色映射（temple/china/factory/orochi/street/rooftop）
  - 修复3个测试import timeout（并行负载下失败）
  - Canvas/DOM mock 添加到测试setup
  - 9个回归测试覆盖
  - 测试总数 5224

- Round 15: 街机模式对手递进
  - 新增 NEXT_MATCH 阶段
  - 全部对手击败后显示 CONGRATULATIONS 画面

## 复盘

- 本轮提升：流程仪式感 +1（STAGE_INTRO填补NEXT_MATCH→INTRO间空白）
- 更像 KOF：每次NEXT_STAGE过渡后有2秒舞台名称展示，接近街机KOF体验
- 仍不像 KOF：角色仍是程序化骨骼/像素帧渲染，不是SNK精灵图
- 下一轮最小任务：回合间得分弹窗（KO后每回合显示WIN BONUS），或其他差距矩阵优先项

## 回退方案

- 改动涉及 GameStateManager(STAGE_INTRO phase) + main.ts(流程分支) + overlayStageIntro(渲染) + types(新阶段)
- 回退 git revert 即可
