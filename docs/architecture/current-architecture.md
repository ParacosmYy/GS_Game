# 当前架构

本文描述当前真实工程结构，并指出下一阶段应如何收敛。

## 1. 技术栈

- TypeScript。
- Vite。
- HTML5 Canvas 2D。
- Vitest。

当前不换栈。优先把公共骨架、角色资产、动作帧、判定帧和反馈数据拆干净。

长期目标结构见 [工作区目标架构](workspace-architecture-target.md)。本文描述当前现实，目标架构描述未来迁移方向。

## 2. 主要目录

```text
src/
  core/          类型、常量、帧数据、manifest、回放数据
  state/         游戏阶段、回合、演出状态
  combat/        判定、伤害、能量、命中事件
  entities/      Fighter、Projectile 等实体
  characters/    角色定义和招式路由
  input/         输入采样、解析、指令缓冲
  rendering/     Canvas 绘制、HUD、舞台、公共组件、角色 fallback
  audio/         音效、BGM、播报
  ai/            AI 决策
```

## 3. 当前关键问题

- `characters/` 角色数量较多，但角色完整性不足。
- `rendering/` 仍有大量骨骼、像素块、placeholder 渲染。
- 公共组件已经开始显现，但还没完全收口到统一骨架。
- `core/*Manifest*` 已有结构，但真实资产接管不足。
- `combat/` 和 frame data 已有基础，但 hit feedback 还未形成统一矩阵。
- 文件体积偏大，后续只在服务 Phase 2 的内容包、流程和稳定性收口时拆分。
- `src/` 仍按技术层粗分，没有形成大型项目中常见的 `app/engine/simulation/content/tools` 边界。
- `src/content/index.ts` 已经作为内容包总 barrel 出现。
- `src/content/characters/index.ts` 已经汇总 Ryo / Kyo / Iori 内容包导出，说明角色内容层正在从分散入口向统一入口收口。
- `src/content/characters/{ryo,kyo,iori}/` 已开始建立内容包骨架，当前既有兼容入口，也有按职责拆分的迁移入口；还需要继续把 commands / moves / attacks / animations / hitboxes / feedback / portraits / reports 落到真实数据里。
- `src/rendering/sprites/` 已开始拆出高分辨率帧分组，`src/rendering/sprites/shared/` / `src/rendering/portraits/` / `src/tools/validateManifest.ts` 也已经承担公共底座和内容校验职责。
- `docs/architecture/public-base-components.md` 已定义所有角色必须共用的骨架。
- `docs/architecture/file-pool-and-state-machine.md` 作为文件池和状态机拆分的硬约束，专门约束大文件拆分与状态机粒度。

## 4. 下一阶段架构方向

围绕 [Ryo Vertical Slice](../product/ryo-vertical-slice-plan.md) 作为基线，并按 [KOF 差距矩阵](../product/kof-gap-matrix.md) 推进 Phase 2 做：

- 先把公共骨架接稳，再把 Kyo 作为当前第一样板角色接入 portrait manifest。
- 再把 Kyo sprite 接入 sprite atlas manifest，并把 Kyo 作为后续角色复制的模板。
- 再把 Kyo 动作接入 animation manifest，再把 Ryo / Iori 保持为兼容与复制参照。
- 再把 Kyo 判定接入 hitbox manifest，再把其他角色逐步复用同一套数据模型。
- 再把 Kyo 命中事件接入 feedback manifest，再把 Ryo / Iori 复用到同一反馈矩阵。
- 把各角色内容包继续拆成子目录，确保 commands / moves / attacks / animations / hitboxes / feedback / portraits / reports 有固定归属。
- 让 `src/content/index.ts` 和 `src/content/characters/index.ts` 成为统一导出入口，减少上层对分散文件的直接依赖。
- 用 Frame Contract 连接 rendering/combat/audio/vfx，并在多角色之间保持一致。
- 把状态机类文件拆成更小的文件池，不再把状态、转移、副作用和表现层混在一个大文件里。
- 任何一项能力如果会被第二个角色复用，就优先抽公共组件，而不是继续复制到角色私有目录。
- 逐步迁移到 `content/` 和 `simulation/`，但每轮只迁一个领域。

## 5. 保持边界

- `core/` 可定义纯数据和纯查询。
- `combat/` 不导入 `rendering/`。
- `rendering/` 不决定命中。
- `audio/` 不决定战斗结果。
- `tools/` 负责离线资产工作。
- `characters/` 不承担通用系统职责。
