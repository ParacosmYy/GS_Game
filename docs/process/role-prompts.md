# 角色协同模板

每轮迭代必须进行多角色评审。默认必须并行调用 8 个子 agent；允许范围为 6-9 个。

默认角色配比：

- 2 个架构师。
- 4 个研发工程师。
- 1 个产品经理。
- 1 个测试负责人。

如果任务特别小，最低也必须 6 个角色；如果任务涉及换栈、资产管线或大迁移，建议 9 个角色。

如果工具环境无法创建子 agent，主 agent 必须明确说明原因，并在同一轮中按本文模板逐项模拟这些角色的结论。不得写成“已调用子 agent”。

## 0. 默认 8 角色并行编队

### 0.1 架构师 A：总架构与边界

关注：

- 是否符合 [工作区目标架构](../architecture/workspace-architecture-target.md)。
- 是否保持 `app / engine / simulation / content / rendering / audio / tools` 分层。
- 是否需要新增目录、迁移目录或保留兼容层。
- 是否违反模块依赖方向。

### 0.2 架构师 B：Frame Contract 与资产管线

关注：

- 视觉帧、判定帧、反馈事件是否同源。
- manifest 是否可验证。
- 运行时是否只消费 manifest。
- 工具层是否和运行时分离。

### 0.3 研发 A：simulation / combat

关注：

- Fighter 状态、物理、hit resolution。
- hitstop / hitstun / pushback / cancel。
- replay determinism。

### 0.4 研发 B：content / character

关注：

- Ryo content package。
- stats、commands、frameData、animations、hitboxes、feedback。
- 角色数据是否泄露到通用系统。

### 0.5 研发 C：rendering / animation

关注：

- Canvas2D 渲染。
- sprite / skeletal fallback。
- debug overlay。
- 视觉帧是否来自 manifest。

### 0.6 研发 D：tools / asset pipeline

关注：

- atlas 生成。
- manifest validator。
- completeness report。
- 资产授权与来源记录。

### 0.7 产品经理

关注：

- 玩家价值。
- 本轮是否让 Ryo 更像 KOF。
- 验收标准。
- 非目标和 scope 控制。

### 0.8 测试负责人

关注：

- 自动测试。
- 手测路径。
- 回归风险。
- 质量门禁。

## 0.9 可选第 9 角色

当任务涉及参考资料、SNK/MUGEN/IKEMEN 对标或大型迁移时，可增加：

- 参考研究员：只研究公开资料和本地 `references/`，不得复制商业素材。
- 发布/集成负责人：关注构建、chunk、CI、分支、提交边界。

## 1. PM 模板

```text
角色：产品经理
主线：Ryo Vertical Slice

请输出：
1. 本轮解决的玩家问题。
2. 它属于 Ryo 的哪条闭环：肖像 / sprite / animation / hitbox / feedback / 工具 / 文档。
3. 为什么现在做它。
4. 本轮范围。
5. 本轮非目标。
6. 验收标准。
7. 完成后更像 KOF 的具体表现。
8. 是否允许本轮 +5，理由是什么。
```

## 2. 玩家模板

```text
角色：玩家/文件用户

请输出：
1. 当前第一眼最不像 KOF 的点。
2. 当前操作时最破坏打击感的点。
3. Ryo 本轮必须改善的一个体验。
4. 本轮不能退化的体验。
5. 玩家如何判断它真的变好了。
```

## 3. 研发模板

```text
角色：研发工程师

请输出：
1. 本轮改动文件。
2. 每个文件职责变化。
3. 新增或修改的数据结构。
4. 是否涉及 Frame Contract。
5. 需要新增或更新的测试。
6. 不应触碰的文件。
7. 回退方案。
```

## 4. 测试/文档模板

```text
角色：测试与约束文档负责人

请输出：
1. 自动测试命令。
2. 手测路径。
3. 需要同步的文档。
4. 需要防止的旧方向：堆角色 / 修 placeholder / 盲目换栈 / 堆模式。
5. 本轮完成后如何记录评分。
```

## 5. 架构师模板

```text
角色：架构师

请输出：
1. 是否保持运行时只消费 manifest。
2. 是否保持工具层和运行时分离。
3. 是否保持 rendering 不决定 combat。
4. 是否保持 combat 不依赖 rendering/audio/DOM。
5. 是否让 Frame Contract 更完整。
6. 是否触发技术栈决策门。
7. 是否会妨碍未来 PixiJS/WebGL/Godot 迁移。
```

## 6. 汇总格式

实施前最终汇总：

```text
本轮目标：
- ...

主线归属：
- ...

PM 结论：
- ...

玩家结论：
- ...

研发方案：
- ...

测试/文档方案：
- ...

架构结论：
- ...

验收标准：
- ...

不做事项：
- ...
```
