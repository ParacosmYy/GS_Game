# MUGEN 数据保真度标准

本文定义"真实性"的含义：项目对 MUGEN 源数据的保真程度。

项目已转向 MUGEN-first。真实性不再指"手动调参数让骨架假人更像 KOF"，而是指：从 MUGEN 文件（SFF / AIR / ACT）提取的原始数据，在提取、转换、运行时加载的整个链路中，是否被忠实保留和使用。

骨骼假人、程序化像素帧、placeholder 渲染均已降级为 fallback，不再作为真实性目标的任何一部分。

当前执行顺序进一步收口为：**先把 Kyo 做成第一套可复制样板，再把同一条真实资产链路复制到其他角色**。Ryo 仍可作为 baseline，但不再是当前第一执行目标。

## 1. 数据源与链路概览

真实性的唯一数据源是 `references/mugen/` 下的 MUGEN 角色包。

数据链路：

```
SFF 文件 ──extractCharacterSprites──> PNG 精灵图 (public/sprites/<char>/)
                                      sprites.json (精灵元数据)

AIR 文件 ──parseAir──> animations.json (动作帧序列、碰撞框、偏移)

ACT 文件 ──(待建管线)──> 调色板数据

sprites.json + animations.json ──buildSpriteManifest──> manifest.json (运行时清单)

animations.json ──convertAirHitboxes──> hitboxes.json (运行时判定数据)

manifest.json ──spriteLoader──> 运行时 SpriteImageFrame[]
```

所有真实性维度都围绕这条链路中的数据是否被无损传递来定义。

## 2. 八个保真度维度

### 2.1 精灵图保真度（Sprite Fidelity）

定义：运行时渲染的像素是否与 MUGEN SFF 文件中的原始精灵图逐像素一致。

- 数据源：SFF 文件，经 `extractCharacterSprites` 提取为 PNG。
- 验收方法：将提取出的 PNG 与 SFF 中的原始精灵图做像素级比对。
- 通过标准：提取过程零数据丢失。每个 group/index 组合的 PNG 尺寸与 SFF 记录一致，透明通道正确保留，像素颜色未经重采样或插值修改。
- 当前状态：`public/sprites/cvskyo/` 已有完整的 PNG 精灵图集，`public/sprites/kfm/` 已有 281 张 PNG。`extractCharacterSprites` 使用 `sff-extractor` 解码 SFF 并写入 PNG。

退化判定：如果某一帧的 PNG 缺失或加载失败，运行时 fallback 到程序化渲染，该帧视为精灵图保真度不通过。

### 2.2 动画时序保真度（Animation Timing Fidelity）

定义：每个动作帧的 duration 值是否与 AIR 文件中的原始值完全一致。

- 数据源：AIR 文件中每帧的 duration 字段，经 `parseAir` 写入 `animations.json`。
- 验收方法：将 manifest 中每帧的 duration 值与 AIR 源文件逐帧比对。
- 通过标准：所有帧的 duration 值从 AIR 到 manifest 零偏差。包括 `-1`（持续到被覆盖）等特殊值也必须原样保留。
- 当前状态：`parseAir` 直接读取 AIR 帧行中的第五个整数值作为 duration，不做任何变换。`spriteLoader` 将 duration 原样传递给 `SpriteImageFrame`。

禁止项：不得为了"手感更好"手动调整 MUGEN 原始 duration 值。如果某动作的节奏与 KOF2002 原版有差异，差异必须在 AIR 文件层面解释，不得在代码层面静默覆盖。

### 2.3 精灵偏移保真度（Sprite Offset Fidelity）

定义：运行时精灵图的锚点和偏移是否与 AIR 文件中定义的 offsetX / offsetY 完全一致。

- 数据源：AIR 文件每帧的 offsetX、offsetY，经 `parseAir` 传入 manifest，经 `spriteLoader` 计算为 anchor。
- 验收方法：运行时精灵图在画面上的定位与 AIR 指定的偏移值一致。
- 通过标准：
  - AIR 的 offsetX / offsetY 值在 manifest 中原样保留。
  - `spriteLoader.buildFrame` 计算的 anchor = (width/2 + offsetX, height + offsetY) 与 MUGEN 的坐标语义一致。
  - 所有帧无需手动调整偏移即可正确对齐。
- 当前状态：`spriteLoader` 的 `buildFrame` 使用 `Math.floor(sprite.width / 2) + f.offsetX` 和 `sprite.height + f.offsetY` 计算 anchor，与 MUGEN 的中心-脚底坐标系语义匹配。

禁止项：不得为了"看起来更居中"在运行时硬编码偏移修正值。如果定位不对，修正必须在坐标转换逻辑中完成，而非逐帧打补丁。

### 2.4 碰撞框保真度（Hitbox Fidelity）

定义：运行时的攻击判定框（hitbox）和受击判定框（hurtbox）是否与 AIR 文件中的 Clsn1 / Clsn2 数据完全一致。

- 数据源：AIR 文件中每帧的 Clsn1（攻击框）、Clsn2（受击框）、Clsn2Default（默认受击框），经 `parseAir` 提取，经 `convertAirHitboxes` 转换为 FrameBox 格式。
- 验收方法：将运行时 hitbox/hurtbox 的位置和尺寸与 AIR 源文件逐帧比对。
- 通过标准：
  - Clsn1（攻击框）的 left/top/right/bottom 全部转换并保留。
  - Clsn2（受击框）的 left/top/right/bottom 全部转换并保留。
  - Clsn2Default 在帧级未指定 Clsn2 时正确继承。
  - 坐标转换（AIR 的 left/top/right/bottom 到 FrameBox 的 ox/oy/w/h）无损。
- 当前状态：`convertAirHitboxes` 将 `Clsn1/Clsn2` 的 left/top/right/bottom 转换为 `ox/oy/w/h` 格式。startup/active/recovery 分段基于 attackBoxes 是否为 null 判断。

禁止项：判定数据不得写在渲染函数里。调试可视化工具只读取判定数据，不成为判定来源。

### 2.5 动作覆盖率（Move Coverage）

定义：每个角色的 MUGEN AIR 文件中定义的所有动作（Begin Action）是否都已映射到运行时的 FighterState。

- 数据源：AIR 文件中的 `[Begin Action N]` 列表。
- 验收方法：统计 AIR 中定义的动作总数，与 manifest 中成功映射到 FighterState 的动作数之比。
- 通过标准：
  - 所有基础动作（idle/walk/crouch/jump/hurt/knockdown）100% 映射。
  - 所有通常技（stand A/B/C/D, crouch A/B/C/D, air A/B/C/D）100% 映射。
  - 所有必杀技和 DM 动作至少有映射条目（即使帧数据待补全）。
  - 覆盖率低于 80% 的角色不得声称"动作保真度通过"。
- 当前状态：`buildSpriteManifest` 内置了 `DEFAULT_STATE_MAP`，覆盖了从 Action 0（IDLE）到 Action 9000（PORTRAIT）的标准 MUGEN 动作编号到 FighterState 的映射。

### 2.6 调色板支持（Palette Support）

定义：游戏是否能显示 MUGEN ACT 文件定义的多种调色板（配色方案）。

- 数据源：MUGEN 角色目录下的 `.act` 文件（每个文件代表一种配色）。
- 验收方法：ACT 文件数量与运行时可切换的调色板槽数量之比。
- 通过标准：
  - 每个角色至少支持 4 个调色板槽位。
  - 调色板数据从 ACT 文件解析，不得硬编码。
  - 运行时可动态切换调色板，无需重新加载精灵图。
- 当前状态：ACT 文件已存在于 `references/mugen/chars-extracted/` 下各角色目录中（如 cvskyo 有 act001~act012 共 12 种调色板）。ACT 到运行时的调色板加载管线尚未建设。

优先级：调色板管线属于"可以推迟但不得遗忘"的维度。当前优先完成精灵图、时序、偏移、碰撞框和动作覆盖率，再建调色板管线。

### 2.7 打击反馈保真度（Feedback Authenticity）

定义：命中效果（hitstop、spark、screen shake、pushback）是否符合 KOF2002 的体感。

特殊性：此维度不是 MUGEN 数据驱动的。MUGEN 不定义 hitstop 时长、火花样式或屏幕震动参数。这些值需要参考 KOF2002 原版的行为来手动设定。

- 数据源：非 MUGEN 来源。基于 KOF2002 原版的打击体感参数化。
- 验收方法：对比 light / heavy / special / DM / SDM / HSDM 六档反馈的参数是否形成合理递进。
- 通过标准：
  - 六档反馈矩阵完整定义（light / heavy / special / dm / sdm / hsdm）。
  - 每档参数包括 hitstop、spark、shake、pushback、impactRing、bodyShake。
  - 参数必须形成递进关系：light < heavy < special < dm < sdm < hsdm。
  - 反馈由 hit event 触发，不得由渲染函数临时决定。
- 当前状态：`feedbackManifest.ts` 已实现六档数据驱动 manifest，`attackTierMap` 覆盖 Ryo/Kyo/Iori 全部招式。

### 2.8 音频保真度（Sound Authenticity）

定义：角色语音和打击音效是否匹配。

- 数据源：MUGEN SND 文件（角色语音、打击音效），未来管线目标。
- 通过标准：
  - 角色核心招式有专属语音片段。
  - 轻重攻击有不同的打击音效。
  - DM/HSDM 有专属发动音效。
- 当前状态：音频采用 Web Audio API 程序化合成。SND 文件解析管线尚未建设。

优先级：音频保真度在精灵图、时序、偏移、碰撞框之后。当前程序化合成的音效作为可接受的 fallback。

## 3. 保真度等级定义

每个维度按三级评定：

- **通过（Green）**：数据从 MUGEN 源到运行时全链路无损失，或有明确的等价转换说明。
- **部分通过（Yellow）**：主要数据链路已通，但存在已知的偏差或缺失项，且偏差有记录和计划。
- **未通过（Red）**：数据链路断裂，运行时使用的是 placeholder 或手写数据而非 MUGEN 源数据。

## 4. 每轮保真度复盘

每轮涉及角色数据或渲染时，必须回答：

1. 本轮改动是否让任何维度从 Red/Yellow 向 Green 推进？如果是，哪个维度、推进了什么？
2. 本轮改动是否引入了新的保真度退化？例如：手动覆盖了 MUGEN 的 duration、偏移、碰撞框数据。
3. 当前最薄弱的保真度维度是什么？下一轮应优先补哪个？

如果一轮改动不能回答以上任何一个问题，不应声称"提升了真实性"。

## 5. 禁止项

以下行为明确违反 MUGEN 数据保真原则：

- 为了"手感更好"覆盖 AIR 文件中的 duration 值。
- 为了"看起来更居中"硬编码精灵偏移修正。
- 在渲染函数中内嵌碰撞框数据而非从 manifest 读取。
- 把骨骼假人渲染或程序化像素帧作为"正式方向"继续精修。这些只能作为 fallback 存在。
- 在未建立 ACT 解析管线的情况下硬编码调色板颜色。
- 在 MUGEN manifest 数据已到位的情况下继续使用手写帧数据。

## 6. 与差距矩阵的关系

本文定义验收标准，[KOF 差距矩阵](kof-gap-matrix.md) 定义优先级排序。两者配合使用：

- 差距矩阵告诉你"下一步先补什么"。
- 本文档告诉你"补到什么程度算通过"。

优先闭合顺序：

1. 精灵图保真度（2.1）：先让真实像素出现在画面上。
2. 动画时序保真度（2.2）：让真实帧率驱动动画。
3. 精灵偏移保真度（2.3）：让真实定位生效。
4. 碰撞框保真度（2.4）：让真实判定生效。
5. 动作覆盖率（2.5）：让所有 MUGEN 动作有映射。
6. 打击反馈保真度（2.7）：让命中体感匹配 KOF2002。
7. 调色板支持（2.6）：让多配色可切换。
8. 音频保真度（2.8）：让声音匹配动作。
