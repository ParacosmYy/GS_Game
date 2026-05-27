# 当前迭代

## 目标

- 记录当前正在推进的唯一主线。
- 只保留当前轮必须做的内容。

## 当前状态

- 当前主线：Ryo 内容包细分收口。
- 当前要做：把 `src/content/characters/ryo/` 下的内容按职责继续向真实数据迁移，避免子目录长期只停留在 README。
- 当前重点：兼容入口 `definition.ts`、`stats.ts`、`completeness.ts` 继续保留，真实数据优先进入 `commands/`、`moves/`、`attacks/`、`animations/`、`hitboxes/`、`feedback/`、`portraits/`、`reports/`。

## 本轮验收

- 至少让一个 Ryo 子域拥有真实数据归属，而不是继续散落在单文件或只有 README 的目录里。
- 约束文档、路线图和迭代工作区同步更新。
- 不引入新的角色扩张。

## 回退方案

- 保留 `definition.ts`、`stats.ts`、`completeness.ts` 的兼容入口不动。
- 新增子目录只放 README 和说明，不迁移实码时可直接回退。
- 若迁移后验证受影响，先停止扩张，回到兼容入口继续工作。
