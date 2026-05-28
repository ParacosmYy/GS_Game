# 路线图

本项目已全面转向 **MUGEN-first**：所有角色的 sprite、动画、判定均优先从 MUGEN SFF/AIR 资产提取和驱动，程序化渲染降级为 fallback。

路线图优先级来源：[KOF 差距矩阵](kof-gap-matrix.md)。
角色范围：仅限 KOF2002 原版 roster，不横向扩展到非 KOF2002 角色。

---

## 当前资产总览

| 类别 | 数量 | 说明 |
|------|------|------|
| MUGEN PNG sprite 角色 | 18 | cvsathena, cvsbenimaru, cvschunli, cvsg_rugal, cvsgeese, cvsgouki, cvskim, cvsking, cvskyo, cvsrock, cvsrugal, cvsryo, cvsterry, cvsvice, cvsyamazaki, heidern, kfm, shermie |
| 内容包角色（完整） | 3 | Ryo、Kyo、Iori — 有 definition、stats、frame contract、hitbox、feedback、portrait 全链路 |
| 内容包角色（部分） | 2 | Terry、Kim — 有 definition、stats，待接入 MUGEN sprite |
| Roster 定义 | 28 | 全部有 CharacterDefinition，含 KOF2002 和部分非 KOF2002 占位 |
| 回归测试 | 5293+ | vitest 全通过 |

---

## Phase 0 — MUGEN 工具链（已完成）

产出物：

- `src/tools/parseAir.ts` — MUGEN AIR 文件解析器，提取动画帧序列、clamp、tick 时间
- `src/tools/buildSpriteManifest.ts` — 合并 SFF 元数据 + AIR 动画数据为单角色 manifest.json
- `src/tools/convertAirHitboxes.ts` — AIR clsndefense/clsnattack 转换为运行时 hitbox/hurtbox 格式
- `src/tools/extractCharacterSprites.ts` — 从 SFF 文件提取 PNG sprite，保留 MUGEN 原生命名 `{group}_{index}.png`
- `src/rendering/sprites/shared/spriteLoader.ts` — 运行时 manifest + PNG 加载器，输出 ImageFrameEntry[]
- `src/rendering/sprites/shared/realSpriteLoader.ts` — 通用真实 sprite 加载函数，任何角色均可使用
- `src/rendering/sprites/shared/baseHighResRenderer.ts` — 高分辨率渲染双路径基础设施（程序化像素帧 + 真实 PNG sprite）

管道流程：

```
SFF 文件 → extractCharacterSprites → PNG sprite 文件
AIR 文件 → parseAir → animations.json
PNG + animations → buildSpriteManifest → manifest.json
AIR clsndefense → convertAirHitboxes → hitbox 数据
manifest.json + PNG → spriteLoader / realSpriteLoader → 运行时渲染
```

退出标准：全链路可运行，KFM 角色已验证真实 sprite 渲染。

---

## Phase 1 — 前 5 角色 MUGEN 集成（当前阶段）

目标：将已有内容包的 5 个角色全部升级为真实 PNG sprite 驱动，程序化渲染仅作 fallback。

### Batch A：Ryo、Kyo、Iori

这三个角色已有完整内容包（definition / stats / frame contract / hitbox / feedback / portrait），升级路径明确：

- 确认 `public/sprites/cvsryo/`、`public/sprites/cvskyo/` sprite 文件覆盖核心动作
- 为 Iori 准备 MUGEN sprite 文件（当前 `public/sprites/` 下无 iori 目录）
- 每个角色执行：buildSpriteManifest → spriteLoader 接入 → 渲染器替换 → 回归验证
- 确保所有核心动作（idle / walk / jump / stand_a / stand_c / hurt / knockdown / special）有真实 sprite
- Frame Contract 对齐：将 MUGEN 动画帧与现有 frame contract 的时间轴、偏移量对齐

### Batch B：Terry、Kim

这两个角色有部分内容包，需要补全：

- Terry：`public/sprites/cvsterry/` 已有 sprite，需补全 definition + stats + frame contract + hitbox + feedback
- Kim：`public/sprites/cvskim/` 已有 sprite，需补全 definition + stats + frame contract + hitbox + feedback
- 每个角色：SFF 提取（如需） → manifest 构建 → 内容包补全 → 运行时接入 → 校验

### Phase 1 退出标准

- 5 个角色全部使用真实 PNG sprite 渲染，不再依赖程序化 fallback 作为主力
- 每个角色的 manifest.json 完整覆盖核心动作
- Frame Contract 与 MUGEN 动画数据对齐
- 打击感反馈（hitstop / spark / shake / pushback）在真实 sprite 下表现正确
- 5293+ 现有测试全部通过，新增 sprite 接入测试通过
- 校验工具报告 5 角色核心维度覆盖率 >= 80%

---

## Phase 2 — 名册扩展 Batch 1（后续 8-10 角色）

目标：将 KOF2002 原版 roster 的第二批角色接入，同时自动化管道流程。

### 角色列表

Andy、Joe、Robert、Leona、Ralf、Clark、Athena、Mai

（优先选择有 MUGEN sprite 数据的角色，且在 KOF2002 原版 roster 中）

### 管道自动化

Phase 1 的手动流程需要在本阶段固化为可复用的脚本：

- `src/tools/batchExtract.ts` — 批量 SFF 提取 + manifest 构建
- `src/tools/batchValidate.ts` — 批量 manifest 校验 + 覆盖率报告
- 统一的内容包模板：从已完成的角色内容包抽象出可复制的骨架
- 自动化 Frame Contract 生成：从 MUGEN 动画数据自动生成基础 frame contract

### 每个角色的接入流程

1. 确认 sprite 来源（`public/sprites/cvs*` 目录或新提取）
2. 运行 `buildSpriteManifest` 生成 manifest
3. 基于 MUGEN AIR 数据创建 definition + stats
4. 从 AIR hitbox 数据生成 hurtbox / hitbox manifest
5. 接入通用反馈矩阵（基于 inferTier 自动分类）
6. 运行时接入 + 校验

### Phase 2 退出标准

- Batch 1 全部角色使用真实 PNG sprite 渲染
- 管道自动化脚本可一键完成新角色接入
- 每个角色的核心动作（idle / walk / jump / stand_a / stand_c / hurt / knockdown）有真实 sprite
- 通用内容包模板验证通过
- 回归测试全部通过

---

## Phase 3 — 名册扩展 Batch 2（剩余 KOF2002 角色）

目标：完成 KOF2002 原版 roster 的全部角色接入。

### 角色列表

**韩国队补全：** Chang、Choi（Kim 队友）

**日本队补全：** Benimaru、Daimon（Kyo 队友）

**其他队伍补全：**
- Kensou、Chin（Psycho Soldier 队）
- Takuma（Art of Fighting 队）
- Whip（NESTS 队）
- Maxima（NESTS 队）
- K'（NESTS 队）

**Boss 角色：**
- Rugal（已有 `cvsrugal` sprite）
- Omega Rugal（已有 `cvsg_rugal` sprite）
- Kusanagi（Kyo 克隆体）

### Boss 角色特殊处理

- Rugal / Omega Rugal 需要多段必杀技和超必杀技的专属帧数据
- Kusanagi 作为 Kyo 的变体，可复用 Kyo 的内容包结构，仅修改差异部分
- Boss AI 难度等级需独立调整

### Phase 3 退出标准

- KOF2002 原版 roster 全部角色可用（至少有核心动作的真实 sprite 渲染）
- Boss 角色有专属 AI 行为
- 选人界面可展示全部角色
- 回归测试全部通过

---

## Phase 4 — 游戏系统深化

前置条件：Phase 1-3 的核心角色接入完成，真实 sprite 渲染稳定。

### 4.1 连段系统

- 基于 MUGEN frame data 精确化 cancel 窗口
- 通常技 → 必杀技 → 超必杀技 cancel 路径完善
- Juggle 系统的浮空判定与后续攻击衔接
- Counter Wire 弹墙机制

### 4.2 Cancel 系统

- Free Cancel：基于 MUGEN state transition 数据驱动
- Super Cancel：必杀技 → 超必杀技的取消规则
- Guard Cancel：防御中消耗资源的反击机制
- MAX Cancel：MAX 模式内的特殊取消链

### 4.3 AI 改进

- 基于 MUGEN attack pattern 数据优化 AI 行为树
- 角色专属 AI 策略（从 AIR 文件中提取的攻击倾向）
- Boss 级别 AI 难度曲线
- 训练模式 AI 行为（固定模式回放）

### 4.4 资源系统

- Stock 气槽精确化（3 stock MAX、1 stock DM、Super Cancel 额外消耗）
- Desperation 模式（HP < 25%）触发条件与 HSDM 可用性
- 防御槽消耗与恢复曲线
- 眩晕槽填充速率与角色差异

### Phase 4 退出标准

- 连段系统在真实 sprite 下手感流畅
- Cancel 系统规则完整，无遗漏路径
- AI 能使用真实 sprite 角色进行有策略的战斗
- 资源系统与 KOF2002 原版规则一致

---

## Phase 5 — 视觉与音频精修

前置条件：Phase 4 的游戏系统稳定。

### 5.1 命中特效

- 打击火花 sprite 精修（基于 KOF2002 原版风格）
- 命中闪光与角色属性色绑定
- DM / SDM / HSDM 专属特效
- 必杀技专属 VFX（火焰、雷电、暗能量等）

### 5.2 画面特效

- SuperFlash 超必杀闪光过渡
- 屏幕震动分层（轻/重/特殊/DM）
- MAX 模式角色光效
- Desperation 模式屏幕边缘红光

### 5.3 舞台背景

- 基于 KOF2002 原版风格的舞台设计
- 动态背景元素（观众、天气、光影）
- 多层视差滚动

### 5.4 BGM 与音效

- 角色专属 BGM
- 打击音效分层（轻/重/特殊/DM）
- 角色语音样本
- Announcer 语音（Round / Fight / KO / Perfect）

### 5.5 UI / UX

- 选人界面精修（角色排列、光标、预览）
- VS 画面（角色肖像 + 队伍名）
- 胜利画面（角色肖像 + 胜利台词 + 统计）
- HUD 精修（HP 条、气槽、计时器、回合分数）

### Phase 5 退出标准

- 打击感视觉反馈达到街机级别
- 每个角色有至少基础级别的音效反馈
- 选人到战斗的全流程 UI 一致
- 舞台背景不再使用纯色填充

---

## Phase 6 — 完整游戏体验

前置条件：Phase 5 的视听基础达标。

### 6.1 街机模式完整流程

- Opening / Title 画面
- 队伍选择 → 角色选择 → 阶段选择
- 比赛流程（Round → Fight → KO → 分数 → 下一场）
- Boss 战（Rugal / Omega Rugal）
- Ending / Staff Roll
- Continue / Game Over

### 6.2 队伍对战系统

- 3v3 队队战（KOF 原版规则）
- 角色排列顺序选择
- 队友支援系统（如有）

### 6.3 对战模式

- 本地双人对战
- 角色选择 + 阶段选择
- 回合制对战

### 6.4 训练模式精修

- 招式列表完整展示（基于 MUGEN CMD 数据）
- 帧数据面板（startup / active / recovery / advantage）
- 输入历史记录
- 假人行为配置（站立 / 蹲下 / 跳跃 / 防御 / 随机）

### 6.5 选项与设置

- 难度选择（1-8 级）
- 时间设定（无限 / 30s / 60s / 99s）
- 按键配置
- 声音设置

### Phase 6 退出标准

- 从打开游戏到通关的完整流程无阻断性 bug
- 所有模式可正常进入和退出
- 无 placeholder 内容暴露给玩家

---

## 优先级原则

1. **资产优先**：真实 sprite / portrait / atlas / palette 的导入与接入，优先于骨架精修、placeholder 美化、渲染参数调优
2. **管道优先**：自动化资产提取和接入管道，优先于手动逐角色接入
3. **公共骨架优先**：可复用的公共组件，优先于角色私有实现
4. **KOF2002 原版优先**：仅限 KOF2002 原版 roster 角色，不扩展到非 KOF2002 角色
5. **体验闭环优先**：一个角色的完整体验闭环，优先于多个角色的部分实现
6. **稳定优先**：回归测试全绿是每个 Phase 的硬性前置条件

## 禁止事项

- 不引入非 KOF2002 原版 roster 的角色（Chun-Li、Geese、Gouki 等不在范围内）
- 不在没有真实 sprite 的情况下继续精修程序化渲染作为正式方向
- 不跳过 Phase 直接做后续内容
- 不为了"看起来更多"牺牲单个角色的完整度
- 不在 placeholder 阶段以"更专业"为理由换技术栈（PixiJS / Godot / Rust / C++）
- 不复制 MUGEN / IKEMEN / QF 的商业素材或受保护实现
