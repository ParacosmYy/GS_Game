# KOF2002 风云再起 — 项目约束

## 项目概述

HTML5 Canvas 格斗游戏，TypeScript + Vite，零外部游戏库。
**标准：与正版 KOF2002UM 一致。** 所有数值、机制、流程以正版为准，不从简、不省略、不发明原创机制。

---

## 一、KOF2002UM 真实性标准

这是本项目最高优先级的约束，所有其他规则服从于此。

### 1.1 帧数据必须可溯源

- 每个攻击的 startup / active / recovery 必须参考正版帧数据表
- 修改帧数据时，必须注明数据来源（版本、测试方法）
- 如果无法获取精确数据，必须标注 `// APPROX` 并写明估计依据，后续有精确数据时替换
- 禁止为了"手感更好"随意调数值 — 手感通过打击反馈系统（震屏/顿帧/特效）实现，不通过篡改帧数据

### 1.2 机制必须完整还原，不允许简化

以下机制如果有遗漏，必须补上，不允许标注"暂不实现"：

**战斗系统：**
- 四键系统（A轻拳/B轻脚/C重拳/D重脚）
- 近距离/远距离自动切换（proximity 判定）
- 投技/拆投（含投技无敌帧窗口）
- 指令投与普通投的区分
- 当身技（反击/架招）系统
- 防御（站防/蹲防/空防，含 proximity guard）
- 防御崩坏（Guard Crush）及恢复
- Chip 伤害（必杀技/超必杀被防时的擦伤，不能致死）
- Counter Hit（伤害加成 + 硬直加成）
- Counter Wire / Wire（壁弹机制）
- 浮空追打（Juggle）系统，含浮空值衰减
- 伤害缩放（Damage Scaling）按连击数递减
- 受身/Quick Stand（倒地后快速起身）
- CD 击飞攻击（站立/空中）

**移动系统：**
- 步行/奔跑/后撤
- 前跳/后跳/小跳/大跳/跑跳
- 前滚/后滚（含无敌帧窗口）
- 空中防御

**气槽系统：**
- 5 槽能量槽，每槽 100 点
- 攻击命中/被防/挥空/被打均获得气槽值
- MAX 模式激活（消耗气槽，12 秒持续，防御力加成）
- 风云再起模式：自动回气

**取消系统：**
- 通常技 → 命令通常技取消
- 命令通常技 → 必杀技取消
- Super Cancel（必杀技 → 超必杀技，额外消耗 1 槽）
- Free Cancel（MAX 模式下，必杀技 → 任意必杀技，消耗 MAX 时间）
- Rapid Cancel（轻攻击命中时取消到另一轻攻击）

### 1.3 游戏流程必须完整

正版流程，每一步都必须实现：

```
Title → 模式选择(单打/组队) → 队伍编排(3v3) → 选人(含色选)
→ 随机对决 → Round Intro("Round X") → 战斗(60秒倒计时)
→ Time Over/KO → Perfect 判定 → 胜负记录 → 下一轮/换人/Match End
→ Win Quote → Continue → 回到 Title
```

当前缺失的流程环节按以下优先级补全：
1. 计时器生效（Time Over 判定）
2. Perfect 判定与显示
3. Win Quote 系统
4. Title Screen
5. 模式选择（单打/3v3 组队）
6. Continue 画面

---

## 二、角色完整性定义

### 2.1 一个"完整角色"必须包含

- [ ] 4 键站立攻击（近 A/B/C/D，远 A/B/C/D）
- [ ] 4 键蹲下攻击（蹲 A/B/C/D）
- [ ] 4 键跳跃攻击（跳 A/B/C/D）
- [ ] CD 击飞攻击（站立 + 空中）
- [ ] 普通投（前投 + 后投）
- [ ] 至少 1 个命令通常技（→+B、↘+D 等）
- [ ] 至少 2 个必杀技（含不同按键版本，如轻/重）
- [ ] 至少 1 个超必杀技（DM）
- [ ] 帧数据（startup/active/recovery/damage/hitstun/blockstun/pushback/hitLevel/knockdown）
- [ ] 判定框数据（攻击框 offset + size，每招独立）
- [ ] 角色配色（至少 2 色）
- [ ] 角色头像（选人画面）
- [ ] 角色专属骨骼姿态（所有状态的 PoseSet）

### 2.2 角色实现顺序（按正版人气 + 实现复杂度）

**第一批（核心 8 人）：** Kyo, Iori, K', Kula, Terry, Kim, Ryo, Robert
**第二批（经典 8 人）：** Athena, Mai, Leona, Clark, Ralf, Joe, Andy, Billy
**第三批（扩展角色）：** 按正版 UM 阵容逐步补全

### 2.3 角色差异化必须通过数据驱动

- 不允许在 fighterController 中写角色名 if-else
- 角色特有行为通过 `CharacterDefinition` 接口的方法实现
- 如果两个角色共享某个机制（如上勾拳），提取为通用行为，在角色定义中引用

---

## 三、架构约束

### 3.1 分层架构 — 模块职责与依赖规则

依赖方向严格单向：`core ← entities ← combat ← main → rendering/characters/state/ai/input`

```
Layer 0 (最底层，零外部依赖)
└── core/
    ├── types.ts          所有枚举、接口、类型定义的唯一来源
    ├── constants.ts      全局常量 + FRAME_DATA + HITBOX_OFFSETS（超过 600 行时按角色拆分）
    ├── gameLoop.ts       固定时间步游戏循环（不允许知道任何游戏内容）
    └── camera.ts         摄像机跟随逻辑

Layer 1 (只依赖 core/)
└── entities/
    ├── fighter.ts        Fighter 实体：位置、血量、状态、计时器。纯数据容器，不含行为逻辑
    ├── fighterController.ts  状态机 + 输入路由 + 物理。不允许包含角色特有硬编码
    └── projectile.ts     飞行道具实体

Layer 2 (只依赖 core/ + entities/)
└── combat/
    ├── combatSystem.ts   攻击判定、伤害计算、连段追踪。不直接读取输入（通过回调/参数接收）
    ├── meter.ts          气槽 + MAX 模式管理
    ├── dmManager.ts      超必杀激活检测 + Super Flash 触发
    └── hitCallback.ts    命中后的副作用分发（VFX/震屏/气槽增益）

Layer 3 (只依赖 core/)
└── input/
    ├── inputManager.ts   原始键盘事件 → PlayerInput
    ├── inputResolver.ts  PlayerInput → ResolvedInput（方向相对化 + 边沿检测）
    ├── commandBuffer.ts  方向历史缓冲 + 搓招检测（QCF/QCB/DP/双圈）
    └── simplifiedInput.ts 简化模式映射

Layer 4 (只依赖 core/ + entities/)
└── rendering/
    ├── renderer.ts       渲染编排层（thin orchestration），不含绘制逻辑，只调度子模块
    ├── stage.ts          舞台背景（视差层、粒子、装饰物）
    ├── skeletalFighter.ts 骨骼渲染：骨骼 → 圆角矩形绘制
    ├── attackLimb.ts     攻击肢体延伸视觉
    ├── projectileRenderer.ts 飞行道具绘制
    ├── vfx.ts            粒子特效系统（火花、闪光、数字）
    ├── hud.ts            HUD：血条、气槽、计时器、连击数
    ├── screens.ts        全屏覆盖层：选人、Intro、KO、Match End
    ├── pixelPortraits.ts 像素头像数据定义
    ├── utils.ts          绘图工具函数（shiftColor、roundRect）
    └── portraits/        角色头像数据（每角色一个文件）
        ├── kyoPortrait.ts
        ├── ioriPortrait.ts
        ├── terryPortrait.ts
        └── kimPortrait.ts

Layer 5 (依赖 core/ + entities/ + input/ 的接口层)
└── characters/
    ├── types.ts          CharacterDefinition 接口 + BonePose/Pose 类型
    ├── kyo.ts            角色定义：帧数据覆盖 + 招式路由 + PoseSet
    ├── iori.ts
    ├── terry.ts
    ├── kim.ts
    └── index.ts          ROSTER 注册表

Layer 6 (只依赖 core/)
└── state/
    ├── cinematicState.ts  电影化状态（顿帧、Super Flash、KO 慢放）
    ├── roundState.ts      回合管理（胜负记录、过渡动画）
    └── selectState.ts     选人状态（光标、确认、AI 切换）

Layer 7 (依赖 core/ + entities/ + characters/)
└── ai/
    └── simpleAI.ts       AI 决策 + 角色专属连段路由

Layer 8 (只依赖 audio/)
└── audio/
    ├── sfx.ts            音效合成/播放
    ├── bgm.ts            背景音乐
    └── announcer.ts      旁白播报

Layer 9 (最顶层，唯一编排入口)
└── main.ts              组装所有模块，驱动 GamePhase 状态机
```

#### 依赖规则（强制）

1. **禁止跨层依赖** — Layer N 只能依赖 Layer N-1 及以下的模块，不能依赖同层或上层
2. **禁止循环依赖** — A import B 则 B 不能 import A
3. **combat 不允许依赖 input** — combatSystem 通过参数/回调接收已解析的输入，不直接 import inputManager
4. **rendering 不允许依赖 input** — 渲染只读取 Fighter 实体状态，不读取输入
5. **entities 不允许包含角色硬编码** — fighterController 中的 `isSpecialMove` 用 `startsWith('KYO_')` 这类判断必须重构为通用机制
6. **新文件必须归入正确的 Layer** — 不允许在 src/ 根目录新建文件，每个新文件必须归属上述某个目录

#### 文件拆分规则

| 触发条件 | 拆分策略 |
|---------|---------|
| `constants.ts` 超过 600 行 | 拆为 `frameData.ts` + `combatConstants.ts` + `layoutConstants.ts`，`constants.ts` 做统一 re-export |
| `fighterController.ts` 超过 600 行 | 拆为 `stateHandlers/` 目录，每个状态族一个文件（movementStates、attackStates、stunStates） |
| `combatSystem.ts` 超过 600 行 | 拆为 `hitResolver.ts` + `projectileResolver.ts` + `throwResolver.ts` |
| `renderer.ts` 超过 600 行 | 按 Layer 4 定义已有足够拆分点，检查是否有逻辑泄露进来 |
| 单个角色定义超过 400 行 | 拆为 `kyo/` 目录：`poses.ts` + `routes.ts` + `index.ts` |

#### 模块 index.ts 规则

每个目录的 `index.ts` 只做 re-export，不包含逻辑。禁止在 index.ts 中写业务代码。
新增文件后必须同步更新所属目录的 `index.ts`

### 3.2 当前架构债务（已知违规，必须在后续迭代中修复）

以下问题已存在于代码中，在下次涉及相关模块时必须一并修复：

1. **`combatSystem.ts` 直接 import `inputManager.ts` 和 `inputResolver.ts`** — 违反 Layer 2 规则。修复方向：combatSystem 通过参数接收已解析输入，不 import input 层
2. **`renderer.ts` import `CommandBuffer`** — 违反 Layer 4 规则。修复方向：debug overlay 的输入显示通过参数传入序列化字符串，不 import CommandBuffer
3. **`fighterController.ts` 的 `isSpecialMove` 用 `startsWith('KYO_')` 硬编码角色名** — 违反 Layer 1 规则。修复方向：改为通过 CharacterDefinition 的 attack classification 或 Set 查询
4. **`fighterController.ts` 已达 604 行** — 超过 600 行限制。下次修改此文件时必须拆分
5. **`main.ts` 292 行包含游戏流程状态机** — 超过编排层职责。修复方向：提取 GameFlowController 到 `state/` 目录

### 3.3 可维护性规则

1. **单文件不超过 600 行** — 超过必须拆分。拆分时保持内聚，不要为了拆而拆
2. **switch/case 超过 15 个分支必须重构** — 用查表、策略对象或状态模式替代
3. **禁止魔法数字** — 所有硬编码数值必须提取到 `constants.ts` 或角色定义中
4. **函数不超过 50 行** — 超过就提取子函数
5. **类型优先** — 新增状态、枚举、接口必须先定义在 `types.ts` 或 `characters/types.ts`，不使用 `as` 断言绕过类型检查
6. **新增角色只动 `characters/` 目录** — 实现接口 + 注册到 ROSTER。如果引擎缺少所需机制，先改引擎接口，再加角色
7. **修改现有文件时，顺便修复该文件中的架构债务** — 不单独开 PR 修债务，但触碰有债务的文件时必须顺手清

### 3.3 可迭代性规则

1. **接口稳定** — `CharacterDefinition` 接口变更时，所有现有角色必须同步更新，不允许留编译错误
2. **常量变更要兼容** — `FRAME_DATA` 新增字段必须有默认值，不破坏现有角色数据
3. **渲染与逻辑分离** — 战斗逻辑（伤害、判定、状态转移）不得依赖渲染代码。渲染可以读取逻辑状态，反之不行
4. **新增系统不侵入现有系统** — 如需新增子系统（如当身技、训练模式），通过 `main.ts` 注册，不修改 `fighterController.ts` 的核心循环
5. **引擎能力先于角色内容** — 做新角色前先确认引擎支持其所有机制，不支持就先做引擎

---

## 四、性能预算

| 指标 | 要求 |
|------|------|
| 帧率 | 稳定 60fps，单帧不得超过 16.67ms |
| 输入延迟 | 从按键到响应不超过 2 帧（≈33ms） |
| 内存 | 游戏运行时堆内存不超过 100MB |
| 首次加载 | 从打开到 Title Screen 不超过 3 秒 |
| Canvas 绘制 | 每帧 draw call 不超过 200 次 |

性能不达标时，优先优化顺序：减少 GC（对象池）→ 减少绘制（裁剪/合批）→ 减少计算（查表替代运算）

---

## 五、反退化规则

### 5.1 已完成的功能不许退化

每次改动后必须验证以下核心流程：

1. 选人 → 进入战斗（不卡死）
2. 两个角色可以对打（AI 有反应）
3. 打到 KO 可以正常结束
4. Match End 后可以重新选人
5. `npx tsc --noEmit` 零错误

### 5.2 回归测试检查清单

以下操作在每次 commit 前至少手动验证一遍：

- [ ] 站立/蹲下/跳跃所有攻击都能正常出招
- [ ] 防御有效（站防蹲防分别测试）
- [ ] 必杀技指令能搓出来
- [ ] 气槽正常积累和消耗
- [ ] MAX 模式激活和取消系统工作
- [ ] KO 后流程不卡住
- [ ] 计时器倒计时正常

### 5.3 禁止的退化操作

- 不允许删除已有的测试/验证手段（如 F1 debug overlay）
- 不允许移除已有的角色而不留记录
- 不允许降低已实现的视觉/音效标准（如去掉震屏、减少粒子数量）
- 重构后行为必须与重构前一致，如果不一致必须在 commit message 中明确说明改变了什么行为

---

## 六、开发优先级

优先级从高到低，上层未完成时不做下层：

### P0 — 引擎核心（必须先完成）
1. 逐帧判定框系统（替代当前的统一 AABB）
2. 投技/指令投/当身技框架
3. Time Over 判定
4. 浮空值（Juggle Point）精算系统

### P1 — 表现层
5. 精灵动画引擎（Sprite Sheet 系统，替代骨骼渲染）
6. 打击反馈精调（顿帧时长、震屏强度、粒子规模 — 参照正版视频逐帧对比）
7. 采样音效系统（WAV/OGG 播放，替代合成音）

### P2 — 内容层
8. 第一批角色补全（当前 4 人 → 8 人）
9. 多场景支持（至少 3 个舞台）
10. BGM 系统（采样播放 + 跨场景无缝切换）

### P3 — 流程层
11. Title Screen + 模式选择
12. 3v3 组队模式
13. Perfect 判定 + Win Quote
14. Continue 画面

### P4 — 扩展
15. 训练模式（含输入显示、帧数显示、伤害显示）
16. 剩余角色补全
17. AI 难度分级 + 角色专属 AI 策略

---

## 七、Git 约束

### 7.1 Commit 规则

- **不在每次小改动时 commit** — 只有完成一个有意义的功能单元（跨模块更新）才 commit
- 一次 commit 必须是以下之一：
  - `feat(scope):` 新功能（如新增角色、新系统）
  - `fix(scope):` Bug 修复（含根因说明）
  - `refactor(scope):` 重构（不改行为，只改结构）
  - `chore:` 构建/工具变更
- commit message 用中文描述做了什么，scope 用英文模块名
- **禁止 `--no-verify`、`--force`、`reset --hard`** — 除非用户明确要求
- **commit 前必须确认代码可编译** — 运行 `npx tsc --noEmit` 无错误
- **commit 前必须通过反退化检查清单**（第五章 5.2 节）

### 7.2 Tag 规则

- **Tag 在产品评分提升 >= 5 分时打**（百分制）
- Tag 命名：`v0.{NN}-kof2002`，NN 从 01 递增（v0.01-kof2002, v0.02-kof2002, ..., v0.10-kof2002, v0.11-kof2002...）
- **打 tag 前必须确保**：所有代码已 commit，`npx tsc --noEmit` 通过，手动验证核心流程（选人→战斗→KO）可运行
- 评分记录在 `SCORE.md` 中，每次评分更新必须追加记录不覆盖

### 7.3 分支规则

- `main` 是稳定分支，`kof-2002` 是开发分支
- 不直接在 `main` 上开发
- 合并到 `main` 前需要用户确认

---

## 八、代码风格

- TypeScript strict mode
- 使用 `type` import：`import type { X } from '...'`
- 注释用中文，标识符用英文
- 不写多行注释块（最多一行简短注释）
- 不写 docstring/JSDoc，除非是接口定义
- 枚举值用大写蛇形：`FIGHTER_STATE`
- 文件名用 camelCase：`combatSystem.ts`
- 不添加 emoji

---

## 九、质量门禁

- `npx tsc --noEmit` 零错误才能 commit
- 新增攻击类型必须同时更新：`types.ts`（枚举）+ `constants.ts`（帧数据 + 判定框）+ `fighterController.ts`（状态处理）+ 角色定义（招式路由）+ `skeletalFighter.ts`（攻击肢体视觉）
- 新增 FighterState 必须同时更新：`types.ts` + `fighterController.ts`（状态机）+ `skeletalFighter.ts`（姿态）+ 角色定义（PoseSet）
- 新增系统模块必须在 `main.ts` 中显式注册和初始化
- 不允许存在 `// TODO`、`// FIXME`、`// HACK` 注释 — 要么现在解决，要么记录到 issue

---

## 十、Bug 分级与处理

### P0 — 流程阻断（立即修）
- 选人/战斗/KO 流程卡死
- 页面崩溃或 JS 运行时错误
- 帧率掉到 30fps 以下

### P1 — 战斗破坏（当轮修）
- 攻击判定失效（该打中没打中 / 不该打中打了）
- 取消系统失效（该取消没取消 / 不该取消的取消了）
- 气槽计算错误
- 角色卡在某个状态无法恢复

### P2 — 体验不良（本轮或下轮修）
- 视觉/音效异常
- AI 行为明显不合理
- 输入响应延迟明显

### P3 — 锦上添花（记着就行）
- 代码质量问题（不影响行为）
- 性能微优化
- UI 美化

---

## 十一、重构触发条件

以下情况必须先重构再继续开发：

1. 添加新角色时需要修改引擎代码 → 先抽象接口
2. `fighterController.ts` 新增状态导致超过 600 行 → 先拆分状态处理器
3. `constants.ts` 新增帧数据导致超过 600 行 → 先按角色拆分数据文件
4. 渲染代码中出现战斗逻辑判断 → 立即抽离
5. 两个以上角色有相同机制的重复代码 → 提取为共享模块

---

## 运行命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 生产构建
npx tsc --noEmit     # 类型检查（commit 前）
```
