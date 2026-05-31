# KOF 差距矩阵 (MUGEN-First)

本文是当前项目相对正版 KOF2002 风云再起体验的差距清单与优先级指南。

项目已转向 MUGEN-First 策略：所有视觉、动画、判定数据优先从 MUGEN SFF/AIR/ACT 文件提取。提取工具链已存在（parseAir / buildSpriteManifest / convertAirHitboxes / extractCharacterSprites）。差距矩阵现在以 MUGEN 管线完整度为核心衡量标准。

原则：

- 所有"新功能添加点"必须先映射到本矩阵里的某一项差距。
- 先闭合最高层级差距，再做低层级扩展。
- 以 MUGEN 数据替换程序化/骨架假人的进度，是衡量项目真实进展的首要指标。
- 只有 MUGEN 管线数据到位后，才认为该项差距被闭合；纯程序化/fallback 方案不构成闭合。
- 公共骨架复用优先于角色私有实现。
- 当前样板顺序为：Kyo 第一样板，Ryo 继续作为 baseline，其他角色全部按 Kyo 的链路复制。

---

## Tier 0 -- MUGEN 管线完整度 (最高优先级)

本层衡量 MUGEN 数据从源文件到运行时的完整链路。链条为：

```
SFF 提取 PNG -> manifest 生成 -> AIR 解析动画 -> AIR Clsn 提取判定 -> 运行时注册 -> 选人可用
```

### 0.0 全角色管线状态总表（2026-05-31 更新）

关键定义：
- **ROSTER** = `src/characters/index.ts` ROSTER 数组中的角色，选人界面可见
- **SpriteReg** = `characterSpriteConfigs.ts` 中有 `registerCharacterSprites` 注册
- **PNG** = `public/sprites/<mugenDir>/` 下有 PNG 文件
- **Manifest** = `public/sprites/<mugenDir>/manifest.json` 存在
- **Hitbox** = `public/sprites/<mugenDir>/hitboxes.json` 存在
- **ContentPkg** = `src/content/characters/<charId>/` 内容包目录存在

#### A. ROSTER 内角色（选人界面可见，28 个）

| charId | 中文名 | SpriteReg | mugenDir | PNG | Manifest | Hitbox | ContentPkg | 状态 |
|--------|--------|-----------|----------|-----|----------|--------|------------|------|
| kyo | 草薙京 | Y | cvskyo | 1808 | Y | Y | Y | 完整 |
| iori | 八神庵 | Y | yiori | 1439 | Y | Y | Y | 完整 |
| terry | 特瑞 | Y | cvsterry | 1407 | Y | Y | Y | 完整 |
| kim | 金家藩 | Y | cvskim | 1247 | Y | Y | Y | 完整 |
| ryo | 坂崎亮 | Y | cvsryo | 1230 | Y | Y | Y | 完整 |
| athena | 雅典娜 | Y | cvsathena | 1456 | Y | Y | Y | 完整 |
| shermie | 谢尔美 | Y | shermie | 1132 | Y | Y | Y | 完整 |
| vice | 麦卓 | Y | cvsvice | 1950 | Y | Y | Y | 完整 |
| yamazaki | 山崎龙二 | Y | cvsyamazaki | 1955 | Y | Y | Y | 完整 |
| kdash | K' | Y | kdash | 1959 | Y | Y | N | 缺内容包 |
| mai | 不知火舞 | Y | mai | 1362 | Y | Y | N | 缺内容包 |
| andy | 安迪 | Y | andy | 942 | Y | Y | N | 缺内容包 |
| clark | 克拉克 | Y | clark | 846 | Y | Y | N | 缺内容包 |
| yashiro | 七枷社 | Y | yashiro | 1511 | Y | Y | N | 缺内容包 |
| leona | 莉安娜 | N | -- | 0 | N | N | N | 缺MUGEN源 |
| kula | 库拉 | N | -- | 0 | N | N | N | 缺MUGEN源 |
| robert | 罗伯特 | N | -- | 0 | N | N | N | 缺MUGEN源 |
| ralf | 拉尔夫 | N | -- | 0 | N | N | N | 缺MUGEN源 |
| joe | 东丈 | N | -- | 0 | N | N | N | 缺MUGEN源 |
| billy | 比利 | N | -- | 0 | N | N | N | 缺MUGEN源 |
| choi | 蔡宝奇 | N | -- | 0 | N | N | N | 缺MUGEN源 |
| chang | 陈可汗 | N | -- | 0 | N | N | N | 缺MUGEN源 |
| mature | 麦卓(异) | N | -- | 0 | N | N | N | 缺MUGEN源 |
| chris | 克里斯 | N | -- | 0 | N | N | N | 缺MUGEN源 |
| mary | 玛丽 | N | -- | 0 | N | N | N | 缺MUGEN源 |
| xiangfei | 李香绯 | N | -- | 0 | N | N | N | 非KOF2002 |
| kasumi | 雏菊 | N | -- | 0 | N | N | N | 非KOF2002 |
| kfm | KFM | N | -- | 0 | N | N | N | 占位角色 |

#### B. 已注册 Sprite 但不在 ROSTER（有素材但选不到，12 个）

| charId | 中文名 | mugenDir | PNG | Manifest | Hitbox | ContentPkg | KOF2002? |
|--------|--------|----------|-----|----------|--------|------------|----------|
| benimaru | 二阶堂红丸 | cvsbenimaru | 1386 | Y | Y | Y | Y-需加入ROSTER |
| yuri | 坂崎由莉 | cvsyuri | 1315 | Y | Y | Y | Y-需加入ROSTER |
| kensou | 椎拳崇 | kensou | 764 | Y | Y | N | Y-需加入ROSTER |
| takuma | 坂崎琢磨 | takuma | 1080 | Y | Y | N | Y-需加入ROSTER |
| heidern | 哈迪伦 | heidern | 2663 | Y | Y | Y | Y-需加入ROSTER |
| rugal | 卢卡尔 | cvsrugal | 2309 | Y | Y | N | Y-需加入ROSTER |
| g_rugal | 欧米茄卢卡尔 | cvsg_rugal | 2191 | Y | Y | N | Y-需加入ROSTER |
| king | 金 | cvsking | 1203 | Y | Y | N | Y-需加入ROSTER |
| chunli | 春丽 | cvschunli | 1580 | Y | Y | N | 非KOF2002 |
| geese | 吉斯 | cvsgeese | 1475 | Y | Y | N | 非KOF2002 |
| gouki | 豪鬼 | cvsgouki | 1578 | Y | Y | N | 非KOF2002 |
| rock | 洛克 | cvsrock | 1593 | Y | Y | N | 非KOF2002 |

### 0.1 渲染链路诊断

**游戏运行时的渲染决策流程**（`rendererFighter.ts:976`）：

```
1. getCharacterConfig(charId) → 查 characterSpriteConfigs.ts 注册
2. getLoadedSprites(charId) → 查异步加载的 manifest.json + PNG
3. 如果 config && sprites → drawGenericCharacterSprite() → 画 MUGEN sprite
4. 如果 image.complete === false → 返回 false
5. 如果失败 → 角色专属 procedural (kyo/iori/ryo/kfm)
6. 如果仍失败 → drawSkeletalFighter() → 骨架假人
```

**已修复的根因**（2026-05-31）：
- `initAllCharacterSprites()` 原来只把 kyo/ryo 设为 PRIORITY，其余后台延迟加载
- `main.ts` 用 `.catch()` fire-and-forget 调用，不等加载完就开始游戏循环
- 结果：非 kyo/ryo 角色在游戏开始时 manifest 未加载，Image 对象未创建 → 只能骨架
- **修复**：全部角色 manifest 前置加载 + idle PNG decode 预热 + 游戏循环等加载完再启动

### 0.2 差距清单

#### 差距 A：14 个 ROSTER 角色缺内容包（但有素材）

kdash、mai、andy、clark、yashiro 已有 sprite 全链路但缺 `src/content/characters/<charId>/`。

**行动**：为这 5 个角色创建内容包，参照 Kyo 模板。

#### 差距 B：11 个 ROSTER 角色缺 MUGEN 源文件（完全缺失）

leona、kula、robert、ralf、joe、billy、choi、chang、mature、chris、mary 没有 PNG 也没有注册。

**行动**：
- 下载 MUGEN 源 → extractCharacterSprites → parseAir → convertAirHitboxes → 注册 → 内容包
- 已知来源：ZZZasd KOF2002 Complete Pack (AK1, 31.55MB)、KOF Anthology (Mega.nz, 8.72GB)

#### 差距 C：8 个 KOF2002 角色有完整素材但不在 ROSTER

benimaru、yuri、kensou、takuma、heidern、rugal、g_rugal、king 有 PNG+Manifest+Hitbox 但没有 charDef。

**行动**：创建 charDef + 加入 ROSTER + 创建内容包。

#### 差距 D：2 个非 KOF2002 角色在 ROSTER

xiangfei、kasumi 不在 KOF2002 白名单中但仍在 ROSTER。

**行动**：按 CLAUDE.md 规则，非白名单角色不扩展。

---

## Tier 1 -- 内容包集成 (高优先级)

### 1.0 内容包结构

当前状态：

- 9 个角色有完整内容包（ryo/kyo/iori/terry/kim/athena/shermie/vice/yamazaki）
- 3 个角色有 Frame Contract（ryo/kyo/iori）
- 5 个角色有完整度校验工具（ryo/kyo/iori + multiChar + multiCharValidation）
- 28 个角色有 Roster 定义（`src/characters/*.ts` + `src/characters/index.ts`）

差距：

- 5 个有素材的 ROSTER 角色缺内容包（kdash/mai/andy/clark/yashiro）
- 8 个有素材的非 ROSTER 角色需要 charDef + 内容包（benimaru/yuri/kensou/takuma/heidern/rugal/g_rugal/king）
- 25 个 ROSTER 角色没有 Frame Contract
- 内容包之间的数据格式一致性尚无自动化校验

### 1.1 角色完整度矩阵

内容包维度衡量（有内容包的 9 个角色）：

| 维度 | Kyo | Ryo | Iori | Terry | Kim | Athena | Shermie | Vice | Yamazaki |
|------|-----|-----|------|-------|-----|--------|---------|------|----------|
| CharDef | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| Frame Contract | Y | Y | Y | N | N | N | N | N | N |
| PNG Sprite | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| Runtime Sprite Config | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| Hitbox | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| MUGEN 特殊技映射 | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| 反馈矩阵 | Y | Y | Y | N | N | N | N | N | N |
| 取消路径 | Y | Y | Y | N | N | N | N | N | N |
| 音效映射 | Y | Y | Y | N | N | N | N | N | N |
| 命中特效 | Y | Y | Y | N | N | N | N | N | N |
| 肖像数据 | Y | Y | Y | N | N | N | N | N | N |

---

## Tier 2 -- 游戏系统 (中优先级)

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

---

## Tier 3 -- 视觉打磨 (中低优先级)

### 3.0 打击反馈

已闭合项：

- 6 档反馈矩阵 light/heavy/special/dm/sdm/hsdm。
- feedbackManifest.ts 数据驱动 manifest。
- 角色专属 DM/SDM/HSDM 火花色板。
- Kyo/Iori/Ryo 大量专属 VFX。
- hitstop attacker glow、MAX 爆气角色属性色闪光。

差距：

- 反馈参数需要与真实 MUGEN sprite 的帧数据对齐。
- 当 MUGEN sprite 替换程序化帧后，VFX 触发时机和位置可能需要调整。

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

---

## 执行优先级

按 MUGEN-First 策略，当前应按以下顺序推进：

### 第一优先：闭合已有素材角色的内容包（差距 A）

1. 为 kdash/mai/andy/clark/yashiro 创建内容包
2. 为 benimaru/yuri/kensou/takuma/heidern/rugal/g_rugal/king 创建 charDef + 加入 ROSTER + 内容包

### 第二优先：下载缺失角色的 MUGEN 源（差距 B）

3. 从 ZZZasd KOF2002 Complete Pack 或 KOF Anthology 获取 leona/kula/robert/ralf/joe/billy/choi/chang/mature/chris/mary 的 MUGEN 文件
4. 运行 extractCharacterSprites + parseAir + convertAirHitboxes 全管线
5. 注册 + 内容包 + 加入 ROSTER

### 第三优先：内容包深度

6. Frame Contract 扩展到全部有素材角色
7. 取消路径、资源规则与 MUGEN 源对齐
8. 输入系统和组合系统打磨

### 第四优先：视觉与流程

9. MUGEN sprite 下的特效位置校准
10. 从 MUGEN 9000,0 提取肖像
11. 流程仪式感最终打磨

---

## 当前统计数据

| 指标 | 数值 |
|------|------|
| ROSTER 角色总数 | 28（含 2 个非 KOF2002 + 1 个 kfm 占位） |
| KOF2002 白名单角色 | 44 |
| 有 SpriteReg 的角色 | 26 |
| 有 PNG 的角色 | 26（共 37,073 张 PNG） |
| 有 Hitbox 的角色 | 26 |
| ROSTER 内有完整管线 | 14（sprite+manifest+hitbox+contentPkg） |
| ROSTER 内有素材但缺内容包 | 5（kdash/mai/andy/clark/yashiro） |
| ROSTER 内完全缺 MUGEN 源 | 11（leona/kula/robert/ralf/joe/billy/choi/chang/mature/chris/mary） |
| 有素材但不在 ROSTER 的 KOF2002 角色 | 8（benimaru/yuri/kensou/takuma/heidern/rugal/g_rugal/king） |
| 有 Frame Contract 的角色 | 3（ryo/kyo/iori） |
| 有内容包的角色 | 12（kyo/ryo/iori/terry/kim/athena/shermie/vice/yamazaki/benimaru/heidern/yuri） |
| MUGEN 提取工具 | 9（parseAir/buildSpriteManifest/convertAirHitboxes/extractCharacterSprites/等） |
| 已提取 PNG 的角色目录 | 27 |

---

## 不要做什么

- 不要为了"更多功能"横向扩角色，除非该角色已完成 MUGEN 管线闭环。
- 不要把程序化/fallback 方案视为差距闭合。只有 MUGEN 数据替换后才算闭合。
- 不要在没有 gap 对应关系时添加新系统。
- 不要在缺少 MUGEN 源的角色上花时间精修程序化像素帧。
- 不要把有素材但不在 ROSTER 的角色（benimaru/yuri 等）遗忘——它们只需要 charDef 就能上场。
