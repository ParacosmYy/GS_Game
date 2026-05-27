# Ryo Vertical Slice Plan

本文是当前项目唯一产品主线。其他产品迭代必须服务这条线，直到 Ryo 样板闭环达标。

当前的执行口径更进一步：

- 先把一个人物做精，再做其他人物。
- 先把 Ryo 做成唯一最完整、最可复制的样板，再考虑 Kyo / Iori。
- 任何会让内容再次横向散落的改动，都要先证明不会破坏这条主线。

## 1. 背景判断

项目已经出现“优化很多，但观感仍不像 KOF”的问题。根因不是努力不足，而是主线分散：

- 角色数量扩张快于角色质量闭环。
- 骨骼/像素块 placeholder 被继续修饰，但无法达到 SNK 逐帧美术气质。
- frame data、animation manifest、sprite manifest、portrait manifest 已存在，但尚未围绕一个角色形成真实生产线。
- 打击反馈组件分散，没有被动作帧和命中事件统一驱动。

因此当前阶段必须收敛到 Ryo 一个角色。

当前最重要的推进顺序见 [KOF 差距矩阵](kof-gap-matrix.md)。本计划负责告诉我们“Ryo 样板是什么”，差距矩阵负责告诉我们“先补哪一块最值钱”。

## 2. 样板目标

Ryo 样板完成后，应满足：

- 关闭 debug box 后，Ryo 仍然像一个可信的格斗游戏角色。
- Ryo 的站姿、移动、攻击、受击、倒地有一致气质。
- Ryo 的肖像不再是色块或临时图形。
- Ryo 的攻击视觉帧、判定帧、命中反馈能通过同一份 frame contract 对齐。
- Ryo 的资产格式可以复制给 Kyo/Iori。

## 3. 最小动作范围

第一阶段只做 8 个动作：

| 动作 | 目的 | 验收 |
| --- | --- | --- |
| `idle` | 建立角色气质 | 站姿轮廓稳定，有呼吸节奏 |
| `walk_forward` | 建立移动节奏 | 脚步和身体重心可信 |
| `walk_backward` | 建立防守移动 | 后退不滑、不漂 |
| `jump` | 建立空中姿态 | 起跳、滞空、落地节奏清楚 |
| `stand_a` | light 命中样板 | 轻 hitstop、小 spark、小 pushback |
| `stand_c` | heavy 命中样板 | 重 hitstop、明显受击、强 spark |
| `hurt` | 受击样板 | 被打瞬间有姿态反馈 |
| `knockdown` | 倒地样板 | 倒下、躺地、起身前状态清楚 |

不在第一阶段做：

- 全套必杀技。
- 全角色复制。
- 高级 MAX 细节。
- 新模式。
- 大规模 UI 改版。

## 4. 资产闭环

Ryo 必须具备以下 manifest：

- `portrait manifest`：选人、HUD、胜利尺寸和资源引用。
- `sprite atlas manifest`：每帧 sprite 坐标、尺寸、anchor。
- `animation manifest`：动作名、帧序列、duration、loop。
- `hitbox manifest`：hurtbox、hitbox、throwbox。
- `feedback manifest`：命中事件到 hitstop/spark/SFX/shake/pushback 的映射。
- `move list`：战斗 HUD / 训练 HUD 必须读取的真实招式表数据，禁止写死示例文本。

运行时只能读取 manifest。工具层负责生成和校验 manifest。

Ryo 相关新增数据文件优先落到 [工作区目标架构](../architecture/workspace-architecture-target.md) 规定的 `src/content/characters/ryo/` 方向；如果暂时留在旧目录，必须说明迁移原因和回退方式。

### 4.1 当前下一步

当前不是继续扩角色，而是把 Ryo 内容包从“有入口”推进到“真实分层已开始、数据仍待填充”的状态：

- `commands/`：把出招、快捷键、标准键位和路由说明固定下来。
- `moves/`：把普通技、必杀技、DM/MAX/强化版的关系拆清楚。
- `attacks/`：把普通攻击、命令通常技、空中攻击的分类拆清楚。
- `animations/`：把动作帧、pose、manifest 和 fallback 分层。
- `hitboxes/`：把判定、受击框、攻击框与调试校验拆清楚。
- `feedback/`：把 light/heavy/special/DM 的反馈矩阵拆清楚。
- `portraits/`：把 select/HUD/win portrait 的规范和资源来源拆清楚。
- `reports/`：把完整度、校验、迁移状态写成机器可读报告。

这一步的目标不是“更多文件”，而是让每一类 Ryo 内容都有固定归属，方便下一轮继续迁移而不再散落。

### 4.2 最高优先级差距

如果要继续添加新功能，优先从下面这些“正版 KOF 观感最容易暴露差距”的点开始：

- 肖像要更像正式街机角色，不再像临时占位。
- 动作要更有重心和节奏，不再像骨骼假人。
- 命中反馈要按轻重和技能等级分层，不再只有统一闪光。
- 招式、爆气、标准按键必须在 UI 中更清楚地展示。
- 爆气后的强化技能必须和普通技能有明显区别，且资源消耗规则稳定。
- Ryo 内容包必须持续向真实数据迁移，避免子目录只剩说明文本。

## 5. 每轮推进顺序

1. 定义或修正数据格式。
2. 写校验测试或校验工具。
3. 接入 Ryo 内容包的一个明确子域（commands/moves/attacks/animations/hitboxes/feedback/portraits/reports 之一），并优先让该子域不再只剩 README。
4. 保留 fallback。
5. 验证构建。
6. 复盘是否更像 KOF。
7. 通过 [决策门](../process/decision-gates.md) 复盘本轮是否允许 +1。

补充约束：

- 如果本轮不是在推进 Ryo 单角色闭环，就不能把它包装成“主线优化”。
- 如果本轮会把 Ryo 内容分散到更多位置，必须先收口再实施。
- 如果本轮只能让文件表面更整齐，但不会让 Ryo 更完整，就不算样板推进。

本阶段还必须同步满足：

- 战斗界面显示当前角色 moveList。
- 标准爆气说明在 UI 中同时展示 `K+U` 和 `O`。
- 招式提示与角色定义数据一致，不允许 HUD 文案单独漂移。

## 6. 退出条件

Ryo 样板线达到以下条件后，才允许扩展到 Kyo/Iori：

- 8 个最小动作全部通过 manifest 驱动。
- `stand_a` 和 `stand_c` 形成 light/heavy 两档命中反馈。
- 肖像至少完成 select 和 HUD 两档资源闭环。
- hitbox/hurtbox 可视化来自数据，而不是渲染临时计算。
- 有角色完整度报告，能显示 Ryo 缺什么。
- `npx tsc --noEmit` 和 `npx vite build` 通过。

## 7. 禁止跑偏清单

如果一个任务符合以下任一项，应拒绝或重写方案：

- 新增非 Ryo 角色内容。
- 只是让骨骼假人更复杂。
- 只是增加特效，没有绑定 hit event。
- 只是修改颜色，没有资产替换路径。
- 只是新增 frame data，没有视觉帧接管。
- 只是换技术栈，没有 Ryo 数据可迁移。

## 8. 后续复制策略

Ryo 完成后复制顺序：

1. Kyo：验证火焰特效、快速连段、主角气质。
2. Iori：验证低身位、狂气姿态、rekka/突进反馈。
3. 其他角色：按队伍批量扩展。

复制时只能复制格式和工具，不复制 Ryo 的具体动作数据。
