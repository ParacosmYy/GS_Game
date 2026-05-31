# 模块边界

本文是代码修改时的职责边界。任何新功能必须先归属模块。

目录迁移的最终目标见 [工作区目标架构](workspace-architecture-target.md)。本文约束当前模块边界，目标架构约束未来目录形态。

## 1. 依赖方向

允许方向：

```text
main -> state -> combat -> entities -> core
characters -> core/input types
input -> core
rendering -> core/entities/readonly data
audio -> core events
tools -> assets/core schema
```

禁止方向：

- `combat` 导入 `rendering`。
- `combat` 导入 `audio`。
- `entities` 导入 `rendering`。
- `core` 导入业务模块。
- `input` 认识具体角色。
- 通用模块通过角色名分支实现角色行为。
- 角色专属逻辑不得绕过公共骨架，直接在渲染、输入或反馈文件里自建一套私有流程。

## 2. 内容包归属

| 任务 | 归属 |
| --- | --- |
| Ryo / Kyo / Iori 肖像 manifest | `core/` schema + asset data，`rendering/` 只读；Kyo 优先作为第一样板 |
| Ryo / Kyo / Iori sprite atlas | `core/` schema，`tools/` 生成，`rendering/` 绘制；Kyo 优先作为第一样板 |
| Ryo / Kyo / Iori animation | `core/` manifest，`characters/` 只引用动作语义；Kyo 优先作为第一样板 |
| Ryo / Kyo / Iori hitbox | `core/` 数据，`combat/` 读取；Kyo 优先作为第一样板 |
| Ryo / Kyo / Iori feedback | `core/` 数据，`combat` 发事件，`rendering/audio` 响应；Kyo 优先作为第一样板 |
| 完整度报告 | `tools/` 或 `tests/` |

补充约束：

- 各角色的单一真源应逐步向 `src/content/characters/<id>/` 收口。
- 如果某个角色专属数据还留在旧目录，必须说明它是过渡层而不是新来源。
- 通用模块只负责消费数据，不负责替任何角色生成新的数据来源。
- 角色内容池内部也要继续拆分：不要把 commands / moves / attacks / animations / hitboxes / feedback / portraits / reports 再塞进同一个大文件。
- 公共基础组件优先落在 [公共基础组件总说明](public-base-components.md) 所定义的骨架上，角色内容只提供数据和少量映射。

## 2.1 文件池约束

文件池是“可组合的小文件集合”，不是“很多文件的聚合目录”。

允许：

- 一个职责一个文件。
- 一个状态机拆成 state / transitions / effects / selectors。
- 通过 `index.ts` 统一出口。

禁止：

- 一个文件承担多个不相邻职责。
- 状态机、渲染、输入、音频混写。
- 让大文件继续吸纳新逻辑。

如果某个文件开始同时解释“数据是什么”和“数据怎么流转”，就应该拆。
如果某项能力会被第二个角色复用，就应该优先抽进公共基础组件，而不是先复制到角色私有目录。

## 3. Frame Contract 边界

Frame Contract 是多个模块的共享协议：

- `core` 定义类型和数据。
- `tools` 生成和校验。
- `combat` 读取 hitbox/hurtbox 和 feedback key。
- `rendering` 读取 spriteRef/anchor/offset。
- `audio` 读取 eventTags。
- `vfx` 读取 feedback key。

任何模块不得绕过 contract 私自推导另一层信息。

## 4. 目标目录归属

新增文件优先按以下规则放置：

| 文件类型 | 目标目录 |
| --- | --- |
| 角色定义/数据 | `src/content/characters/<id>/` |
| 纯模拟逻辑 | `src/simulation/` |
| 通用运行时 | `src/engine/` |
| 浏览器组装 | `src/app/` |
| Canvas 绘制 | `src/rendering/canvas2d/` |
| 公共 UI / 输入提示 / 招式卡 / 头像裁切 / 反馈档位 / 高分辨率帧注册 | `src/rendering/shared/` 或 `src/rendering/ui/` |
| Debug overlay | `src/rendering/debug/` |
| 离线工具 | `tools/` |
| 原始资产 | `assets/source/` |
| 生成资产 | `assets/generated/` |

## 5. Placeholder 规则

- placeholder 可以存在。
- placeholder 必须可替换。
- placeholder 不得成为新主线。
- 修改 placeholder 只能为 fallback 或迁移服务。

## 6. 文件大小

现有大文件暂不为了数字拆分。只有当拆分服务以下目标时才做：

- Phase 2 内容包与流程收口。
- Frame Contract。
- 资产管线。
- 测试可读性。
- 模块边界修复。
