# Ryo Vertical Slice Plan

本文是当前项目唯一产品主线。其他产品迭代必须服务这条线，直到 Ryo 样板闭环达标。

## 1. 背景判断

项目已经出现“优化很多，但观感仍不像 KOF”的问题。根因不是努力不足，而是主线分散：

- 角色数量扩张快于角色质量闭环。
- 骨骼/像素块 placeholder 被继续修饰，但无法达到 SNK 逐帧美术气质。
- frame data、animation manifest、sprite manifest、portrait manifest 已存在，但尚未围绕一个角色形成真实生产线。
- 打击反馈组件分散，没有被动作帧和命中事件统一驱动。

因此当前阶段必须收敛到 Ryo 一个角色。

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

运行时只能读取 manifest。工具层负责生成和校验 manifest。

## 5. 每轮推进顺序

1. 定义或修正数据格式。
2. 写校验测试或校验工具。
3. 接入 Ryo 的一个动作或一个肖像尺寸。
4. 保留 fallback。
5. 验证构建。
6. 复盘是否更像 KOF。

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
