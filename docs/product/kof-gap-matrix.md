# KOF 差距矩阵 (MUGEN-First)

本文是当前项目相对正版 KOF2002 风云再起体验的差距清单与优先级指南。

项目已转向 MUGEN-First 策略：所有视觉、动画、判定数据优先从 MUGEN SFF/AIR/ACT 文件提取。提取工具链已存在（parseAir / buildSpriteManifest / convertAirHitboxes / extractCharacterSprites）。差距矩阵现在以 MUGEN 管线完整度为核心衡量标准。

原则：

- 所有"新功能添加点"必须先映射到本矩阵里的某一项差距。
- 先闭合最高层级差距，再做低层级扩展。
- 以 MUGEN 数据替换程序化/骨架假人的进度，是衡量项目真实进展的首要指标。
- 只有 MUGEN 管线数据到位后，才认为该项差距被闭合；纯程序化/fallback 方案不构成闭合。
- 公共骨架复用优先于角色私有实现。

---

## Tier 0 -- MUGEN 管线完整度 (最高优先级)

本层衡量 MUGEN 数据从源文件到运行时的完整链路。链条为：

```
SFF 提取 PNG -> manifest 生成 -> AIR 解析动画 -> AIR Clsn 提取判定 -> 运行时接入
```

### 0.0 MUGEN 源资产可用性

当前状态：

- `references/mugen/chars-extracted/warusaki3/characters/` 包含 58 个 AIR 文件、73 个 SFF 文件。
- `references/mugen/chars-extracted/shermie/` 和 `heidern/` 为额外 KOF 角色。
- 部分角色（Iori、Leona、Kula、K'、Robert、Mai、Andy、Joe 等）在 Warusaki3 源中不存在。
- 非 KOF2002 角色存在于源中（Cammy、Chun-Li、Dan、Guile 等）但不在当前 Roster 中。

差距：

- **Iori 是核心样板角色，但在 MUGEN 源中完全没有 Warusaki3 版本**。需要找到替代 MUGEN 源或从其他 KOF2002 角色包中提取。
- 多个 Roster 角色（Leona、Kula、K'、Robert、Mai、Andy、Joe、Billy、Chang、Choi、Mature、Yashiro、Chris、Mary、Xiangfei、Kasumi、Clark、Ralf）缺少可确认的 MUGEN 源文件。
- 非 KOF2002 角色（Chun-Li、Rock、Benimaru 为 CVS 系列角色，Geese、Gouki 为跨界角色）已有 PNG 但不在 KOF2002 正式 Roster 中。

新功能添加点：

- 确认每个 KOF2002 Roster 角色的 MUGEN 源可用性。
- 为缺失源文件的角色寻找替代 MUGEN 角色包。
- 建立源文件可用性报告（per-character source availability report）。

### 0.1 PNG Sprite 提取与 Manifest

当前状态：

- 已提取 PNG sprite 的角色（17 个目录）：
  - KOF2002 Roster 内且已有 PNG：cvskyo(1,808)、cvsryo(1,230)、cvsathena(1,456)、cvsterry(1,407)、cvskim(1,247)、cvsvice(1,950)、cvsyamazaki(1,955)、shermie(1,132)、heidern(2,663)
  - Roster 内但无 PNG：Iori、Leona、Kula、K'、Robert、Mai、Andy、Joe、Billy、Chang、Choi、Mature、Yashiro、Chris、Mary、Xiangfei、Kasumi、Clark、Ralf
  - 非 Roster 但已有 PNG：cvsg_rugal(2,191)、cvsgeese(1,475)、cvsgouki(1,578)、cvsrock(1,593)、cvsking(1,203)、cvsrugal(2,309)、cvsbenimaru(1,386)、cvschunli(1,580)、kfm(281)
- 所有已提取角色都有 `manifest.json`（kfm 除外）。
- **17个角色有 `hitboxes.json`（MUGEN AIR Clsn 判定数据），共995个攻击动作、2415个活跃帧。**
- **8个ROSTER角色有 MUGEN hurtbox数据（manifest.json hurtbox字段）。**
- 动画帧时长通过 `animStateSync` 模块注册并查询，支持MUGEN -1归一化。
- 渲染管线已统一：通用MUGEN sprite路径优先 → 角色procedural fallback → 骨骼渲染。
- 训练模式 F2 开启hitbox显示，F7 循环 game/both/mugen 三种显示模式。

差距矩阵（KOF2002 Roster 角色，28 个）：

| 角色 | PNG 提取 | Manifest | 运行时注册 | Hitbox | 内容包MUGEN |
|------|----------|----------|------------|--------|------------|
| Kyo | Y (1,808) | Y | Y | Y (77 actions) | Y |
| Iori | N | N | N | N | N |
| Terry | Y (1,407) | Y | Y | Y (55 actions) | N |
| Kim | Y (1,247) | Y | Y | Y (62 actions) | N |
| Ryo | Y (1,230) | Y | Y | Y (54 actions) | Y |
| Athena | Y (1,456) | Y | Y | Y (48 actions) | N |
| Vice | Y (1,950) | Y | Y | Y (49 actions) | N |
| Yamazaki | Y (1,955) | Y | Y | Y (69 actions) | N |
| Shermie | Y (1,132) | Y | Y | Y (43 actions) | Y |
| Yuri | Y (1,315) | Y | N | Y (53 actions) | Y |
| Benimaru | Y (1,386) | Y | Y | N | Y |
| Heidern | Y (2,663) | Y | Y | Y (51 actions) | Y |
| Leona | N | N | N | N | N |
| Kula | N | N | N | N | N |
| K' | N | N | N | N | N |
| Robert | N | N | N | N | N |
| Mai | N | N | N | N | N |
| Ralf | N | N | N | N | N |
| Andy | N | N | N | N | N |
| Clark | N | N | N | N | N |
| Joe | N | N | N | N | N |
| Billy | N | N | N | N | N |
| Chang | N | N | N | N | N |
| Choi | N | N | N | N | N |
| Mature | N | N | N | N | N |
| Yashiro | N | N | N | N | N |
| Chris | N | N | N | N | N |
| Mary | N | N | N | N | N |
| Xiangfei | N | N | N | N | N |
| Kasumi | N | N | N | N | N |

新功能添加点：

- 对已有 SFF 源但未提取的角色，运行 `extractCharacterSprites` 管线。
- **最高优先级：完成 AIR 解析管线，生成 `animations.json`（帧序列+duration）和 `hitboxes.json`（Clsn 判定框）**。
- 为 Iori 和其他缺失源的角色寻找替代 MUGEN 角色包。

### 0.2 运行时 Sprite 接入

当前状态：

- `characterSpriteRegistry.ts` + `characterSpriteConfigs.ts` 提供通用 PNG sprite 加载机制。
- 17 个角色已注册运行时 sprite 配置（kyo/ryo/athena/terry/kim/vice/yamazaki/shermie/benimaru/chunli/geese/gouki/rock/king/rugal/g_rugal/heidern）。
- 8 个 ROSTER 角色有完整 specialMap（kyo/ryo/terry/kim/athena/vice/yamazaki/shermie）。
- 通常技 action number 通过 `resolveGenericMugenAction` 标准化映射（MUGEN 标准编号）。
- 渲染管线统一：`rendererFighter.ts` 先尝试通用 MUGEN sprite → 角色 procedural → 骨骼 fallback。
- 训练模式 hitbox 调试支持 F2(开关) + F7(game/both/mugen 三模式循环)。

差距：

- specialMap 覆盖率不均匀。Kyo/Ryo 映射~25个必杀技，其他角色仅映射1-4个 DM/SDM。
- 非 ROSTER 角色（chunli/geese/gouki/rock/king/rugal/g_rugal/benimaru）的 specialMap 仍为空。
- 20 个 KOF2002 Roster 角色未注册运行时 sprite 配置。

### 0.3 MUGEN 动画数据接入

当前状态：

- `animStateSync.ts` 同步动画帧状态，支持 MUGEN -1 帧时长归一化。
- `realSpriteLoader.ts` 在 sprite 加载时自动注册帧时长到 animStateSync 缓存。
- `baseHighResRenderer.ts` 使用 `getVariableFrameIndex` 按 stateAge + frameDurations 正确计算帧索引。
- manifest.json 的 `animations` 字段包含完整的帧序列和 duration 数据。
- 8 ROSTER 角色总注册动作>=3000，总帧>=15000，总时长>=30000 ticks。

差距：

- 攻击状态帧索引使用 attackFrame 而非 animStateSync 的 stateAge 映射。
- animStateSync 的 `resolveFrameIndex` 未被 `baseHighResRenderer` 直接消费（两者各自计算帧索引）。

### 0.4 MUGEN 判定数据接入

当前状态：

- `mugenHitboxLoader.ts` 运行时加载 MUGEN AIR Clsn 判定数据（hitboxes.json）。
- `mugenHurtboxLoader.ts` 运行时加载 MUGEN hurtbox 数据（manifest.json hurtbox 字段）。
- `mugenHitboxQuery.ts` 内容包面向查询层，Kyo/Ryo 已接入。
- `fighter.ts:getActiveHitboxes()` 四级 fallback：Frame Contract → ATTACK_FRAMES → MUGEN Clsn → HITBOX_OFFSETS。
- `fighter.ts:getEffectiveHurtbox()` 三级 fallback：bodyOverride → MUGEN hurtbox → legacy hurtbox。
- `hitboxDebugMugen.ts` 已接入主循环，支持 game/both/mugen 三种显示模式。
- 17 角色共 995 个攻击动作、2415 个活跃帧的 hitbox 数据。

差距：

- 内容包层面仅 Kyo/Ryo 接入了 MUGEN 查询层，Terry/Kim/Athena/Vice/Yamazaki/Shermie 尚未。
- MUGEN hitbox 数据作为第三级 fallback，仅在 Frame Contract 和 ATTACK_FRAMES 都无数据时生效。
- 非 ROSTER 角色的内容包未接入 MUGEN 数据。

---

## Tier 1 -- 内容包集成 (高优先级)

本层衡量角色内容包从数据定义到运行时消费的完整度。

### 1.0 内容包结构

当前状态：

- 5 个角色有内容包（`src/content/characters/<name>/index.ts`）：ryo、kyo、iori、terry、kim。
- 3 个角色有 Frame Contract（ryo/kyo/iori）。
- 3 个角色有完整度校验工具（ryo/kyo/iori）。
- 28 个角色有 Roster 定义（`src/characters/*.ts` + `src/characters/index.ts`）。
- 测试总数 10,162（364 个测试文件，全部通过）。

差距：

- 23 个 Roster 角色没有内容包。
- 25 个 Roster 角色没有 Frame Contract。
- 内容包中的动画帧数据、判定数据不是 MUGEN 源数据驱动。
- 内容包之间的数据格式一致性尚无自动化校验。

新功能添加点：

- 内容包 schema 标准化（每个角色包必须包含的文件和导出）。
- 跨角色内容包一致性校验工具。
- 将 MUGEN 源数据注入内容包的自动化流程。

### 1.1 角色完整度矩阵

内容包维度衡量（仅列出有内容包的 5 个角色）：

| 维度 | Ryo | Kyo | Iori | Terry | Kim |
|------|-----|-----|------|-------|-----|
| CharDef | Y | Y | Y | Y | Y |
| Frame Contract | Y | Y | Y | N | N |
| PNG Sprite | Y | Y | N | Y | Y |
| Runtime Sprite Config | Y | Y | N | Y | Y |
| MUGEN AIR 动画 | N | N | N | N | N |
| MUGEN Clsn 判定 | N | N | N | N | N |
| 完整度校验工具 | Y | Y | Y | N | N |
| 反馈矩阵 | Y | Y | Y | N | N |
| 取消路径 | Y | Y | Y | N | N |
| 音效映射 | Y | Y | Y | N | N |
| 命中特效 | Y | Y | Y | N | N |
| 肖像数据 | Y | Y | Y | N | N |

Iori 特殊问题：

- Iori 是核心样板角色但缺少 PNG sprite 提取（MUGEN 源缺失）。
- Iori 的运行时渲染仍完全依赖程序化像素帧。
- 需要优先为 Iori 找到 MUGEN 源或确认替代方案。

### 1.2 技能与资源规则

已闭合项：

- 6 层反馈矩阵 + MAX mode damage/defense bonus。
- DM -> SDM -> HSDM 升级链。
- 3 Stock MAX mode activation，1 Stock DM，Super Cancel extra stock。
- Free Cancel drains 20% MAX timer，Desperation DM damage bonus。
- Kyo/Iori 取消路径回归测试（22 tests）。

差距：

- 资源规则数据不是从 MUGEN CMD/CNS 文件提取，而是手工定义。
- 多数角色（25/28）没有取消路径数据。

---

## Tier 2 -- 游戏系统 (中优先级)

本层是框架级系统，不来源于 MUGEN 数据，需要自行设计和实现。

### 2.0 输入系统

已闭合项：

- 训练模式 move list HUD (F5 切换)。
- 训练模式 frame data 面板 (F4 切换)。
- 训练模式 input history (F3 切换)。
- 指令进度可视化 (QCF/QCB/DP/HCF/HCB 部分匹配进度条)。
- KOF2002 视觉输入图标系统。

差距：

- 输入缓冲和指令识别精度仍需打磨。
- 多按键同时输入的边缘情况处理。

### 2.1 组合与取消系统

已闭合项：

- 通常技 -> 必杀技 -> DM 超必 -> Free Cancel 的取消路径框架。
- Super Cancel / Dream Cancel 机制。

差距：

- 取消窗口的帧精确度与原版对齐。
- 空中取消、受击取消等高级机制。

### 2.2 投技系统

差距：

- 投技判定与 MUGEN 源数据对齐。
- 投技失败动画、投技挣脱机制。

---

## Tier 3 -- 视觉打磨 (中低优先级)

本层增强 MUGEN sprite 的表现力，但不来源于 MUGEN 数据。

### 3.0 打击反馈

已闭合项：

- 6 档反馈矩阵 light/heavy/special/dm/sdm/hsdm。
- feedbackManifest.ts 数据驱动 manifest。
- 角色专属 DM/SDM/HSDM 火花色板。
- Kyo/Iori/Ryo 大量专属 VFX。
- hitstop attacker glow、MAX 爆气角色属性色闪光。
- 118 tests 覆盖 3 角色 57 必杀技 VFX+SFX。

差距：

- 反馈参数需要与真实 MUGEN sprite 的帧数据对齐。
- 当 MUGEN sprite 替换程序化帧后，VFX 触发时机和位置可能需要调整。

### 3.1 视觉特效

已闭合项：

- Hit sparks、screen shake、afterimage 框架。
- 4 种屏幕转场动画（curtain/wipe/zoom/fade）。
- 眩晕星星 VFX、SuperFlash、KO 终结特效。
- VFX 粒子预设全量回归测试（45 tests）。

差距：

- 当 MUGEN sprite 以真实比例和 anchor 点显示时，特效位置需要重新校准。

---

## Tier 4 -- 流程与 UI (低优先级)

### 4.0 街机流程

已闭合项：

- 街机对手递进 + 宿敌系统。
- VS 画面 + 肖像 + 调色板。
- KO 视觉序列 + DM/SDM/HSDM 终结画面。
- Continue/Game Over/Congratulations 画面。
- READY? 三节拍回合开始序列。
- 角色专属胜利语音。

差距：

- 角色肖像应从 MUGEN 源 9000,0 sprite 提取，而非程序化 fallback。
- 选人界面肖像需要真实 MUGEN sprite 支持。

### 4.1 UI 一致性

已闭合项：

- 暂停菜单显示回合数 + 比分 + 角色名。
- 首局控制提示 (F1/F3/F5/Esc 快捷键)。
- DM/SDM/HSDM 终结 KO 差异化视觉。

差距：

- 选人界面、HUD 肖像在无真实 MUGEN sprite 时仍使用 fallback。

---

## 执行优先级

按 MUGEN-First 策略，当前应按以下顺序推进：

### 第一优先：闭合 Tier 0 管线缺口

1. **AIR 解析管线端到端**：将 `parseAir` + `convertAirHitboxes` + `buildSpriteManifest` 的输出持久化为 `animations.json` / `hitboxes.json`。
2. **运行时消费 MUGEN 动画和判定数据**：替换手写帧序列和判定框。
3. **Iori MUGEN 源确认**：为核心样板角色找到可用的 MUGEN 角色包。
4. **通常技 action number 映射**：系统化每个角色的 MUGEN action -> AttackType 对应关系。

### 第二优先：扩展 Tier 0 覆盖范围

5. 为已有 SFF 源但未提取的角色运行管线。
6. 为缺失源文件的角色寻找替代 MUGEN 角色包。
7. 运行时 sprite 接入从 9 个 KOF2002 角色扩展到全部 28 个。

### 第三优先：内容包与系统

8. 基于 MUGEN 数据重建内容包。
9. 取消路径、资源规则与 MUGEN 源对齐。
10. 输入系统和组合系统打磨。

### 第四优先：视觉与流程

11. MUGEN sprite 下的特效位置校准。
12. 从 MUGEN 9000,0 提取肖像。
13. 流程仪式感最终打磨。

---

## 当前统计数据

| 指标 | 数值 |
|------|------|
| Roster 角色总数 | 28 |
| 有内容包的角色 | 5 (Ryo/Kyo/Iori/Terry/Kim) |
| 有 Frame Contract 的角色 | 3 (Ryo/Kyo/Iori) |
| 有 PNG sprite 的 KOF2002 角色 | 11 (Kyo/Ryo/Athena/Terry/Kim/Vice/Yamazaki/Shermie/Yuri/Benimaru/Heidern) |
| 有运行时 sprite 配置的 KOF2002 角色 | 10 |
| 有 MUGEN AIR 动画数据的角色 | 0 |
| 有 MUGEN Clsn 判定数据的角色 | 0 |
| Warusaki3 源角色总数 | 58 (AIR) / 73 (SFF) |
| 已提取 PNG 的角色目录 | 18 |
| 测试总数 | 10,162 (364 files, all passing) |
| MUGEN 提取工具 | 4 (parseAir/buildSpriteManifest/convertAirHitboxes/extractCharacterSprites) |
| 完整度校验工具 | 5 (ryo/kyo/iori/multiChar/multiCharValidation) |

---

## 不要做什么

- 不要为了"更多功能"横向扩角色，除非该角色已完成 MUGEN 管线闭环。
- 不要把程序化/fallback 方案视为差距闭合。只有 MUGEN 数据替换后才算闭合。
- 不要在没有 gap 对应关系时添加新系统。
- 不要跳过 AIR 解析管线的端到端验证就继续打磨视觉特效。
- 不要在缺少 MUGEN 源的角色上花时间精修程序化像素帧。
