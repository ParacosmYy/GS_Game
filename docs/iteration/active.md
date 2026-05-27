# 当前迭代

## 目标

- 记录当前正在推进的唯一主线。
- 只保留当前轮必须做的内容。

## 当前状态

- 当前主线：Ryo Vertical Slice 质量打磨。
- 完成度报告：100%（所有7个维度通过）。
- 退出条件：全部满足。
- 下一阶段：持续提升视觉质量和数据管线完整性。

## 最近完成

- Frame Contract spriteRef 从占位升级到像素帧注册表格式（IDLE:0, STAND_A:0 等）
- anchor 从 24x72 修正到实际 48x144
- duration 从全1修正到真实 ticksPerFrame
- 测试从10项扩展到23项

## 本轮验收

- Frame Contract 有真实数据驱动。
- 构建通过，测试通过。
- 不引入新的角色扩张。

## 回退方案

- Frame Contract 改动是纯数据，不改运行时逻辑。
- 回退 git revert 即可。
