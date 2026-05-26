# 当前架构

本文描述当前真实工程结构，并指出下一阶段应如何收敛。

## 1. 技术栈

- TypeScript。
- Vite。
- HTML5 Canvas 2D。
- Vitest。

当前不换栈。优先把角色资产、动作帧、判定帧和反馈数据拆干净。

## 2. 主要目录

```text
src/
  core/          类型、常量、帧数据、manifest、回放数据
  state/         游戏阶段、回合、演出状态
  combat/        判定、伤害、能量、命中事件
  entities/      Fighter、Projectile 等实体
  characters/    角色定义和招式路由
  input/         输入采样、解析、指令缓冲
  rendering/     Canvas 绘制、HUD、舞台、角色 fallback
  audio/         音效、BGM、播报
  ai/            AI 决策
```

## 3. 当前关键问题

- `characters/` 角色数量较多，但角色完整性不足。
- `rendering/` 仍有大量骨骼、像素块、placeholder 渲染。
- `core/*Manifest*` 已有结构，但真实资产接管不足。
- `combat/` 和 frame data 已有基础，但 hit feedback 还未形成统一矩阵。
- 文件体积偏大，后续只在服务 Ryo 样板时拆分。

## 4. 下一阶段架构方向

围绕 [Ryo Vertical Slice](../product/ryo-vertical-slice-plan.md) 做：

- 把 Ryo 肖像接入 portrait manifest。
- 把 Ryo sprite 接入 sprite atlas manifest。
- 把 Ryo 动作接入 animation manifest。
- 把 Ryo 判定接入 hitbox manifest。
- 把 Ryo 命中事件接入 feedback manifest。
- 用 Frame Contract 连接 rendering/combat/audio/vfx。

## 5. 保持边界

- `core/` 可定义纯数据和纯查询。
- `combat/` 不导入 `rendering/`。
- `rendering/` 不决定命中。
- `audio/` 不决定战斗结果。
- `tools/` 负责离线资产工作。
- `characters/` 不承担通用系统职责。
