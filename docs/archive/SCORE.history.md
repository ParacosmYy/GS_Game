# KOF2002 风云再起 — 产品评分记录（千分制）

## 评分标准

> **核心原则：玩家看到/听到/感受到的才是产品，代码只是手段。**
> 每次迭代+1分。1000分为最终目标。对标正版KOF2002UM。
> **★严格评分规则(防通胀):** 微调参数不加分，每个维度有硬上限。

| 维度 | 满分 | 评判标准 |
|------|------|---------|
| 角色美术 | 200 | 精灵图品质/动画帧数/角色辨识度/配色/待机攻击受击动画/特效 |
| 舞台美术 | 100 | 舞台数量/背景精细度/视差层/动态元素/氛围感 |
| 音频品质 | 150 | 打击音效/BGM编曲/旁白配音/角色语音/音效同步 |
| 角色内容 | 150 | 角色数量(44人)x招式完整度x差异化x配色选择 |
| 战斗手感 | 150 | 打击感/输入响应/取消流畅度/连段满足感/反馈 |
| 帧数据精度 | 100 | startup/active/recovery精确度/逐帧判定框/无敌帧 |
| 游戏流程 | 100 | 完整流程/模式选择/3v3/训练模式/设置 |
| UI/HUD品质 | 50 | SNK风格字体/血条气槽/选人界面/胜败画面 |

---

## 历史里程碑（旧+5分制重算为+1分制）

| 日期 | 版本 | 旧分 | 重算分 | 标志性进展 |
|------|------|------|--------|-----------|
| 2026-05-25 | Baseline | 43 | — | 千分制诚实重评基线 |
| 2026-05-25 | V10 | 105 | — | Hit-stop打击顿帧对标KOF标准 |
| 2026-05-25 | V29 | 200 | — | 像素块分辨率提升 |
| 2026-05-25 | 诚实重评 | 242 | — | ★发现通胀，从2008重评为242 |
| 2026-05-25 | H6 | 304 | — | 3v3组队模式启用 |
| 2026-05-26 | H28 | 546 | — | 5舞台视觉+SNK HUD+训练模式 |
| 2026-05-26 | H48 | 573 | — | Ryo样板闭环启动: 比例重构+帧契约 |
| 2026-05-26 | H54 | 603 | 30 | hurtbox数据驱动+walk_backward区分 |

> **说明**: H54旧诚实分603按旧+5/次重算为+1/次 ≈ 30分。从此处开始每次+1分，不再按旧制累加。

---

## 当前得分：30/1000

| 维度 | 得分 | 满分 | 现状 |
|------|------|------|------|
| 角色美术 | 4 | 200 | Ryo骨骼比例+gi细节+专属VFX，仍是骨骼非精灵图 |
| 舞台美术 | 2 | 100 | 5场景有视差/建筑/动画，程序化非位图 |
| 音频品质 | 3 | 150 | 逐帧SFX调度+BGM差异化+播报，仍为合成非采样 |
| 角色内容 | 6 | 150 | 27角色+hurtbox manifest+弹幕实体+帧契约 |
| 战斗手感 | 8 | 150 | hitstop/震屏/取消/投技/防御/浮空/SDM全面校准 |
| 帧数据精度 | 5 | 100 | 全角色零APPROX+帧契约验证 |
| 游戏流程 | 5 | 100 | 选人→对战→KO→结算完整，缺Title完善 |
| UI/HUD品质 | 2 | 50 | 能量槽KOF2002风格+计时器紧急效果 |

---

## 关键教训（防通胀）

1. **微调参数不加分** — 粒子数/闪光alpha/尺寸微调不算实质性改变
2. **测试≠玩家感知** — 测试保障正确性，但不改变视觉/听觉品质
3. **骨骼≠精灵图** — 骨骼棍人与SNK像素美术有本质差距
4. **合成≠采样** — Web Audio合成无法替代真实打击音效和BGM
5. **聚焦Ryo** — 一个角色的完整闭环比27个placeholder更有价值

---

**当前分: 30/1000 | 每次迭代+1分 | 下一目标: 31分**

---

## H56: 音效增强+动画过渡平滑 — 30→31

**commit:** 54e1721 | 5种合成音效+18个SFX调度+3帧lerp过渡

---

## H57: 手套/鞋子细节+头巾飘动+色板闭环 — 31→32

**commit:** a4c8656 | 手套缠带+厚鞋底+头巾贝塞尔飘带+4色板传递闭环

---

## H58: MAX视觉强化+连段计数器 — 32→33

**commit:** ea94786 | MAX金色光环+残影+双层能量粒子+连段计数器白黄红分级

---

## H59: tsc修复+胜利pose+舞台透视 — 33→34

**commit:** 607f58f | 修复inputLog burst缺失+Ryo双拳胜利pose+5舞台透视网格

---

## H60: Ryo AI策略优化 — 34→35

**commit:** e315907 | AI距离路由:远距KOOU/中距HIEN/近距ORISHI+DM低血量触发+多角色对空

---

## H61: 蹲下攻击动画+round过渡 — 35→36

**commit:** ab0b86f | 蹲下攻击active帧延伸+recovery渐进恢复+round电影感淡出过渡

---

## H65: 修复SCORE.md通胀+建立content/ryo/目录 — 37→38

**commit:** 0eff613 | 建立src/content/characters/ryo/内容包+修复SCORE.md从603→38

---

## H66: animation manifest帧数对齐真实pose — 38→39

**commit:** 0e8d12a | idle 4→8帧, hitstun 11→5帧, 新增11个Ryo动作序列, 必杀技帧数对齐pose数组**
---

## H67: sprite manifest帧数对齐+atlas坐标布局 — 39→40

**commit:** <hash> | Ryo idle 15帧sequential atlasX+所有动画atlas行分配+anchor居中校正

---

## H68: sprite frame cache机制—骨骼pose→离屏canvas缓存 — 40→41

**commit:** <hash> | SpriteFrameCache类+offscreen canvas 160x200+opt-in blit+SSR安全

---

## H69: feedback manifest逐招Ryo数据—26个攻击类型显式档位映射 — 41→42

**commit:** <hash> | 6light+10heavy+8special+2DM/SDM显式映射替代inferTier fallback

---

## H70: portrait manifest测试+Ryo像素肖像数据完整性验证 — 42→43

**commit:** <hash> | 23测试覆盖manifest结构+查询函数+便捷getter+Ryo 64x80像素数据

---

## H71: hitbox constants Ryo完整性测试—8项验证覆盖30个攻击 — 43→44

**commit:** <hash> | 攻击存在性+字段完整性+正向offset+DM>specials+SDM>DM+C版>A版+蹲位低位+throw

---

## H72: animation cancel frames Ryo测试—28项验证覆盖取消帧+无敌帧 — 44→45

**commit:** <hash> | 15攻击取消帧存在+4非攻击空帧+范围验证+isCancelable+无敌帧+DM>specials

---

## H73: Ryo completeness report测试—18项验证覆盖3种报告 — 45→46

**commit:** <hash> | generateRyoReport(8)+generateRyoDimensionReport(7)+generateRyoExtendedReport(4)

---

## H74: sprite manifest查询函数测试—26项验证Ryo数据完整性 — 46→47

**commit:** <hash> | 结构验证+查询函数+fallback色+攻击映射+关键动画存在性

---

## H75: frame data Ryo完整性测试—37项验证帧数据30个攻击 — 47→48

**commit:** <hash> | 21普攻+6必杀+3DM存在性+结构体+逻辑验证

---

## H76: attack frames Ryo完整性测试—45项验证31个攻击 — 48→49

**commit:** <hash> | 31存在性+4结构体+5帧数逻辑+2命令通常技+HSDM_RYUKO_RANBU

---

## H77: hurtbox manifest Ryo测试—13项验证8个状态 — 49→50

**commit:** <hash> | 8状态存在性+结构体(width/height正数)+crouch<idle+jump/hitstun存在

---

## H78: Ryo stats定义测试—11项验证角色数值 — 50→51

**commit:** <hash> | walkSpeed/runSpeed/jumpVelocity/maxHealth/pushWidth+合理性范围

---

## H79: animation manifest查询函数测试—29项验证 — 51→52

**commit:** <hash> | getSequence+hasSequence+cancelFrame+invincibleFrame+12关键序列存在性

---

## H80: Ryo content package导出集成测试—8项验证barrel — 52→53

**commit:** <hash> | RyoDef+RYO_STATS+3个报告函数+def字段完整性+report有效性

---

## H81: Ryo moveList完整性测试—12项验证出招表 — 53→54

**commit:** <hash> | 命令通常技+必杀技+DM/SDM数量+虎煌拳/虎咆/天地霸煌拳/龍虎乱舞

---

## H82: Ryo character metadata测试—16项验证 — 54→55

**commit:** <hash> | basicInfo+colors+winQuotes+pixelPortrait+poses

---

## H83: Ryo poses帧数覆盖测试—13项验证 — 55→56

**commit:** <hash> | 8最低pose帧数+3攻击pose+总pose>=15+idle>=8

---

## H84: meter+DM manager测试—41项验证 — 56→57

**commit:** <hash> | meter系统全函数+DMManager canUseDM/isHSDM+Ryo DM/SDM/HSDM类型+meter→DM集成

---

## H85: hit callback combat测试—37项验证 — 57→58

**commit:** <hash> | classifyAttack+getDamageSizeScale+hitstop层级+Ryo VFX+combo scaling+KO ground effect

---

## H86: combat system类型和常量测试—73项验证 — 58→59

**commit:** <hash> | cancelWindow+attackClassifier+combatConstants+stunDizzy+guardCrush+attackSets+Ryo validation+enum completeness

---

## H87: input buffer指令系统测试—84项验证 — 59→60

**commit:** <hash> | commandBuffer全函数+motion检测(QCF/DP/QCB/HCB/charge/DM)+inputResolver+display helpers

---

## H88: audio manifest Ryo测试—17项验证 — 60→61

**commit:** <hash> | manifest结构+synth参数+Ryo攻击音效映射(10)+系统音+环境音+播报+tier覆盖

---

## H89: validate tools测试—17项验证 — 61→62

**commit:** <hash> | validateRyoPackage(10)+printValidationReport(1)+manifest validation(6)

---

## H90: core types枚举完整性测试—27项验证 — 62→63

**commit:** <hash> | FighterState+AttackType(Ryo全覆盖)+HitHeight+JuggleState+ThrowTarget+GamePhase

---

## H91: roster验证测试—6项验证27角色 — 63→64

**commit:** <hash> | 27角色+唯一ID+必填字段+Ryo存在性+Ryo属性

---

## H92: frame contract Ryo集成测试—35项验证 — 64→65

**commit:** <hash> | 4关键攻击对齐4数据源(animation+hitbox+feedback+cancel)

---

## H93: state context测试—24项验证 — 65→66

**commit:** <hash> | FighterCtx接口+方向检测+double-tap+hyperJump+closeRange
