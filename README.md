# 拳皇2002 风云再起

KOF2002 风格 2D 格斗游戏，原创 TypeScript + Canvas 2D 实现。

## 当前状态

**主线：Ryo Vertical Slice** — 以坂崎亮(Ryo Sakazaki)为唯一样板角色，跑通完整闭环。

### Ryo 样板完成度

| 系统 | 状态 | 说明 |
|------|------|------|
| 高分辨率像素帧 (48x72) | 已完成 | idle/walk/stand_a/stand_c/crouch/crouch_a/crouch_c/hurt/knockdown/jump/air_a/air_c/air_d 全部有 SNK 风格手工像素帧 |
| 肖像 (64x80) | 已完成 | 20色调色板 SNK 风格选人肖像 |
| 动画过渡 | 已完成 | 按状态类型差异化：受击 snap(1帧)、走路 ease-in(5帧)、跳跃 ease-out(2帧) |
| 帧数据 (FRAME_DATA) | 已完成 | startup/active/recovery 三阶段，接近 KOF2002 节奏 |
| 攻击帧 (ATTACK_FRAMES) | 已完成 | 逐帧 hitbox 数据，覆盖通常技/命令技/必杀技/DM/SDM/HSDM |
| 反馈 manifest | 已完成 | 5档(light/heavy/special/dm/sdm) hitstop/shake/spark/SFX 矩阵 |
| Hurtbox manifest | 已完成 | 24个 FighterState 各有精确 hurtbox |
| 必杀技 SFX | 已完成 | 虎煌拳/虎咆/飛燕/霸王翔吼拳各有 Web Audio 合成专属音效 |
| 招式名显示 | 已完成 | special/DM 命中时显示浮动招式名 |
| moveList | 已完成 | 12条招式表(指令通常技+必杀技+DM/SDM+爆气)，HUD 颜色编码显示 |
| 完整度报告 | 已完成 | 6维度加权报告(动作帧/攻击帧/反馈/hurtbox/肖像/moveList) |
| 真实性校验 | 已完成 | 9项自动校验(动作/攻击/反馈/肖像/hitbox/帧契约/工具/取消窗口) |
| 自动测试 | 1847 pass | 帧对齐/攻击帧/反馈/hurtbox/退出条件/精度/juggle/真实性等 |

### 渲染管线

三级优先级：高分辨率像素帧 → sprite atlas → 骨骼 fallback

## 快速启动

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
```

质量检查：

```bash
npx tsc --noEmit
npx vite build
npx vitest run
```

## 技术栈

- TypeScript + Vite
- HTML5 Canvas 2D
- Vitest (1847 tests)
- Web Audio API (合成 SFX)

当前默认不换栈。是否迁移到 PixiJS / WebGL2 / Godot / Rust，必须先满足 [未来引擎架构](docs/architecture/future-engine-architecture.md) 的决策门。

## 文档入口

必须按顺序阅读：

1. [AGENTS.md](AGENTS.md)：最高执行约束。
2. [CLAUDE.md](CLAUDE.md)：长期 AI 执行手册。
3. [Ryo Vertical Slice](docs/product/ryo-vertical-slice-plan.md)：当前唯一产品主线。
4. [迭代流程](docs/process/iteration-workflow.md)：每轮闭环。
5. [决策门](docs/process/decision-gates.md)：每类重大决策的允许条件。

架构相关：

- [当前架构](docs/architecture/current-architecture.md)
- [模块边界](docs/architecture/module-boundaries.md)
- [工作区目标架构](docs/architecture/workspace-architecture-target.md)
- [资产管线架构](docs/architecture/asset-pipeline.md)
- [未来引擎架构](docs/architecture/future-engine-architecture.md)

产品相关：

- [真实性标准](docs/product/authenticity-standard.md)
- [路线图](docs/product/roadmap.md)

流程相关：

- [质量门禁](docs/process/quality-gates.md)
- [评分规则](docs/process/scoring.md)
- [Git 规则](docs/process/git-rules.md)

参考：

- [格斗游戏工程架构参考](docs/reference/fighting-game-architecture-reference.md)
- [操作说明](docs/reference/controls.md)

## 当前方向

Ryo 样板闭环后的复制策略：

1. **Kyo**：验证火焰特效、快速连段、主角气质。
2. **Iori**：验证低身位、狂气姿态、rekka 突进反馈。
3. 其他角色：按队伍批量扩展。

复制时只复制格式和工具，不复制 Ryo 的具体动作数据。

## 当前禁止方向

- 不新增角色（Ryo 闭环前）。
- 不继续把骨骼/像素块 placeholder 当正式方向。
- 不因为观感不好直接换技术栈。
- 不复制无授权商业素材。
- 不做无法验收的泛泛优化。
