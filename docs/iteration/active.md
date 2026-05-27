# 当前迭代

## 目标

- 记录当前正在推进的唯一主线。
- 只保留当前轮必须做的内容。

## 当前状态

- 当前主线：Ryo 内容包细分收口。
- 当前要做：把 `src/content/characters/ryo/` 下的内容按职责拆到 `commands/`、`moves/`、`attacks/`、`animations/`、`hitboxes/`、`feedback/`、`portraits/`、`reports/`。
- 当前重点：先把定义、数值、完整度报告保留为兼容入口，再逐步迁移真实数据。

## 本轮验收

- 至少让一个 Ryo 子域拥有真实目录归属，而不是继续散落在单文件里。
- 约束文档、路线图和迭代工作区同步更新。
- 不引入新的角色扩张。

## 回退方案

- 保留 `definition.ts`、`stats.ts`、`completeness.ts` 的兼容入口不动。
- 新增子目录只放 README 和说明，不迁移实码时可直接回退。
- 若迁移后验证受影响，先停止扩张，回到兼容入口继续工作。
