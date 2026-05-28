# 迭代待办

## 规则

- 这里只放下一轮或更后面才做的事项。
- 未进入本轮实施的任务，先放这里。
- 一旦进入 active，就从 backlog 里移走。
- 所有事项必须对应 [KOF 差距矩阵](../product/kof-gap-matrix.md) 的某项差距。
- 当前主线是 MUGEN-first 资产集成，优先级围绕 MUGEN 管线推进。

## 高优先级

- **[High]** 将 cvskyo PNG sprite 接入 Kyo 角色渲染器，替换程序化 fallback 帧
  - 对应差距：视觉帧真实性、sprite 替代骨架假人
- **[High]** 将 cvsryo PNG sprite 接入 Ryo 角色渲染器，替换程序化 fallback 帧
  - 对应差距：视觉帧真实性、基线角色闭环
- **[High]** 用 MUGEN 管线完成 Terry/Kim 内容包（extractCharacterSprites → manifest → 运行时接入）
  - 对应差距：多角色内容包完整度

## 中优先级

- **[Medium]** 批量提取 references/mugen/ 下其余 KOF2002 角色的 DEF/AIR/SFF 资源
  - 对应差距：角色数量覆盖、KOF2002 原版阵容
- **[Medium]** 为新角色自动化 manifest 校验（validateManifest 扩展为管线内步骤）
  - 对应差距：资产管线稳定性、内容包闭环
- **[Medium]** ACT palette 解析器 + 运行时 palette 切换
  - 对应差距：palette 真实性、选人/战斗换色
- **[Medium]** 把 `animations/` 对接真实 PNG sprite manifest，消除程序化 pose 依赖
  - 对应差距：动作帧真实性
- **[Medium]** 把 `hitboxes/` 对接 convertAirHitboxes 输出的 MUGEN 判定数据
  - 对应差距：判定帧与视觉帧对齐
- **[Medium]** 把 `feedback/` 对接 light/heavy/special/DM 反馈矩阵，绑定 hit event
  - 对应差距：打击感分层

## 低优先级

- **[Low]** SND（音效）提取管线：从 MUGEN .snd 文件提取 WAV/OGG 样本
  - 对应差距：角色专属音效真实性
- **[Low]** 真实 sprite 上的残影（afterimage）效果
  - 对应差距：视觉效果高级特性
- **[Low]** 真实 sprite 胜利姿势（win poses）运行时播放
  - 对应差距：胜利仪式感
- **[Low]** 把 `portraits/` 接入 MUGEN 提取的选人/胜利肖像
  - 对应差距：肖像真实性
- **[Low]** 把 `reports/` 变成完整度、manifest 校验、资产覆盖率固定输出
  - 对应差距：验收工具闭环

## 历史待办（已推进或降级）

- ~~把 `commands/` 里的输入/路由说明迁成正式数据文件~~ → Terry/Kim 内容包已实现 commands
- ~~等 Ryo 内容包细分稳定后，再评估 Kyo / Iori 的复制模板~~ → 内容包模板已稳定，3 角色共用
- ~~Phase 2 优先继续补：流程仪式感、多角色内容包、菜单/VS/HUD 一致性~~ → 已转向 MUGEN-first，资产导入优先于流程打磨
