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

---

## H94: PRNG确定性随机数测试—17项验证 — 66→67

**commit:** <hash> | seed determinism+range+snapshot/restore+clone+gameRng globals

---

## H95: projectile resolver测试—21项验证 — 67→68

**commit:** <hash> | canBlock+guardGaugeDamage+aabbCheck+resolveProjectileHits

---

## H96: state handlers helper测试—16项验证 — 68→69

**commit:** <hash> | state handlers helper测试—16项验证

---

## H97: attack classifier测试—34项验证isDM+classify全类别 — 69→70

**commit:** <hash> | attack classifier测试—34项验证isDM+classify全类别

---

## H98: simplified input测试—15项验证Ryo+Kyo+Iori+MAX激活 — 70→71

**commit:** <hash> | simplified input测试—15项验证Ryo+Kyo+Iori+MAX激活

---

## H99: content loader测试—15项验证hasContent+loadContent+report — 71→72

**commit:** <hash> | content loader测试—15项验证hasContent+loadContent+report

---

## H100: game screens测试—14项验证transition+flow — 72→73

**commit:** <hash> | game screens测试—14项验证transition+flow

---

## H101: input log测试—16项验证record+dump/load+meta+clear — 73→74

**commit:** <hash> | input log测试—16项验证record+dump/load+meta+clear

---

## H102: replay snapshot测试—16项验证FNV1a+checksum+recorder+verifier — 74→75

**commit:** <hash> | replay snapshot测试—16项验证FNV1a+checksum+recorder+verifier

---

## H103: team state测试—12项验证createTeam+defeat+switch+order — 75→76

**commit:** <hash> | team state测试—12项验证createTeam+defeat+switch+order

---

## H104: combo trial测试—21项验证cancel+damage+runtime+eval+validate — 76→77

**commit:** <hash> | combo trial测试—21项验证cancel+damage+runtime+eval+validate

---

## H105: announce sequence测试—12项验证state machine+sfx+progress — 77→78

**commit:** <hash> | announce sequence测试—12项验证state machine+sfx+progress

---

## H106: announce presets测试—17项验证popIn+fadeIn+burstIn+sequences — 78→79

**commit:** <hash> | announce presets测试—17项验证popIn+fadeIn+burstIn+sequences

---

## H107: sprite pose data测试—12项验证constants+charVisuals+darken+lighten — 79→80

**commit:** <hash> | sprite pose data测试—12项验证constants+charVisuals+darken+lighten

---

## H108: rendering utils测试—5项验证parseColor+shiftColor — 80→81

**commit:** <hash> | rendering utils测试—5项验证parseColor+shiftColor

---

## H109: constants测试—24项验证canvas/stage/physics/combat/timing/bounds/hitstop — 81→82

**commit:** <hash> | constants测试—24项验证canvas/stage/physics/combat/timing/bounds/hitstop

---

## H110: damageScaling测试—13项验证DAMAGE_FLOORS+classifyStarter+getComboScale — 82→83

**commit:** <hash> | damageScaling测试—13项验证DAMAGE_FLOORS+classifyStarter+getComboScale

---

## H111: gameConfig测试—10项验证KOF2002_CONFIG+TRAINING_OVERRIDES+getActiveConfig — 83→84

**commit:** <hash> | gameConfig测试—10项验证KOF2002_CONFIG+TRAINING_OVERRIDES+getActiveConfig

---

## H112: gameSpeed测试—9项验证SLOWMO常量+GameSpeedController — 84→85

**commit:** <hash> | gameSpeed测试—9项验证SLOWMO常量+GameSpeedController

---

## H113: hitboxConstants测试—9项验证HITBOX_OFFSETS字段+width/height正值+拳脚偏移 — 85→86

**commit:** <hash> | hitboxConstants测试—9项验证HITBOX_OFFSETS字段+width/height正值+拳脚偏移

---

## H114: frameDataConstants测试—10项验证FRAME_DATA字段+startup+damage+拳速比较 — 86→87

**commit:** <hash> | frameDataConstants测试—10项验证FRAME_DATA字段+startup+damage+拳速比较

---

## H115: meter测试—12项验证createPowerGauge+createMaxMode+gainMeter+spendStocks — 87→88

**commit:** <hash> | meter测试—12项验证createPowerGauge+createMaxMode+gainMeter+spendStocks

---

## H116: ryoFrameContract测试—12项验证RYO_ACTION_CONTRACTS+getRyoFrameContractManifest — 88→89

**commit:** <hash> | ryoFrameContract测试—12项验证RYO_ACTION_CONTRACTS+getRyoFrameContractManifest

---

## H117: feedbackManifest测试—12项验证FEEDBACK_TIERS+inferTier+getFeedback — 89→90

**commit:** <hash> | feedbackManifest测试—12项验证FEEDBACK_TIERS+inferTier+getFeedback

---

## H118: hurtboxManifest测试—7项验证HURTBOX_TABLE+DEFAULT_HURTBOX+getHurtboxDef — 90→91

**commit:** <hash> | hurtboxManifest测试—7项验证HURTBOX_TABLE+DEFAULT_HURTBOX+getHurtboxDef

---

## H119: animationManifest测试—9项验证getSequence+getSequenceNames+hasSequence — 91→92

**commit:** <hash> | animationManifest测试—9项验证getSequence+getSequenceNames+hasSequence

---

## H120: spriteFrameCache测试—5项验证SpriteFrameCache has/get/clear/size — 92→93

**commit:** <hash> | spriteFrameCache测试—5项验证SpriteFrameCache has/get/clear/size

---

## H121: attackFrames测试—9项验证ATTACK_FRAMES entries+frame arrays — 93→94

**commit:** <hash> | attackFrames测试—9项验证ATTACK_FRAMES entries+frame arrays

---

## H122: meterEvents测试—6项验证eventBus+reset+snapshotGauge — 94→95

**commit:** <hash> | meterEvents测试—6项验证eventBus+reset+snapshotGauge

---

## H123: camera测试—5项验证Camera实例化+update+默认值 — 95→96

**commit:** <hash> | camera测试—5项验证Camera实例化+update+默认值

---

## H124: portraitManifest测试—8项验证PORTRAIT_SIZES+getPortrait+getSelect+getHUD+getVS — 96→97

**commit:** <hash> | portraitManifest测试—8项验证PORTRAIT_SIZES+getPortrait+getSelect+getHUD+getVS

---

## H125: spriteManifest测试—7项验证getAnimation+getFallbackColors+getAnimationNames — 97→98

**commit:** <hash> | spriteManifest测试—7项验证getAnimation+getFallbackColors+getAnimationNames

---

## H126: spriteManifestData测试—10项验证SPRITE_MANIFEST+RYO_ANIMATIONS — 98→99

**commit:** <hash> | spriteManifestData测试—10项验证SPRITE_MANIFEST+RYO_ANIMATIONS

---

## H127: animationBlender测试—8项验证AnimationBlender+getFighterBlender — 99→100

**commit:** <hash> | animationBlender测试—8项验证AnimationBlender+getFighterBlender

---

## H128: Ryo闭环收尾—超级必杀像素帧+肖像系统+FrameContract补全+collision数据连接 — 100→101

**commit:** db2d210 | Ryo闭环收尾—DM/SDM/HSDM像素帧+多尺寸肖像+13个FrameContract+collision数据

---

## H129: 补全8个通常技FrameContract—stand_b/d+close_b/d+crouch_a/b/c/d — 101→102

**commit:** d51d642 | 8个通常技FrameContract+64项验证测试+resolveFrameKey路由

---

## H130: resolveFrameKey路由补全—stand_b/d/close_b/d/crouch_b正确映射 — 102→103

**commit:** a817ad2 | 新通常技正确映射到最近像素帧

---

## H128: animationManifestData测试—9项验证ANIMATION_MANIFEST+getCharacterAnimManifest+REQUIRED_SEQUENCES — 100→101

**commit:** <hash> | animationManifestData测试—9项验证ANIMATION_MANIFEST+getCharacterAnimManifest+REQUIRED_SEQUENCES

---

## H129: cinematicState测试—5项验证KO_FLASH+ANNOUNCE+TRANSITION_PAUSE常量 — 101→102

**commit:** <hash> | cinematicState测试—5项验证KO_FLASH+ANNOUNCE+TRANSITION_PAUSE常量

---

## H130: frameContractBuilder测试—8项验证resolveFrameIndex(startup/active/recovery/clamp) — 102→103

**commit:** <hash> | frameContractBuilder测试—8项验证resolveFrameIndex(startup/active/recovery/clamp)

---

## H131: inputResolver测试—9项验证resolveInput+createPrevAttack+facing方向 — 103→104

**commit:** <hash> | inputResolver测试—9项验证resolveInput+createPrevAttack+facing方向

---

## H132: projectile测试—7项验证Projectile构造+update+active+resolveProjectileClashes — 104→105

**commit:** <hash> | projectile测试—7项验证Projectile构造+update+active+resolveProjectileClashes

---

## H133: 完整性报告增加14项通常技追踪 — 105→106

**commit:** 9e01e84 | 完整性报告增加14项通常技追踪—normal moves扩展覆盖

---

## H134: 踢技像素帧+渲染集成—6个踢技独立像素帧 — 106→107

**commit:** c2e0eeb | stand_b/d+close_b/d+crouch_b/d独立像素帧+resolveFrameKey专用路由

---

## H133: vfxPresets测试—6项验证spawnHitSparks+spawnBlockFlash+getSparkSizeScaleFromDamage — 105→106

**commit:** <hash> | vfxPresets测试—6项验证spawnHitSparks+spawnBlockFlash+getSparkSizeScaleFromDamage

---

## H134: gameStateManager测试—8项验证phase+phaseTimer+winner+isTrainingMode初始值 — 106→107

**commit:** <hash> | gameStateManager测试—8项验证phase+phaseTimer+winner+isTrainingMode初始值

---

## H135: hudInfo测试—6项验证toggleDebugOverlay+toggleInputDisplay+getCurrentFPS — 107→108

**commit:** <hash> | hudInfo测试—6项验证toggleDebugOverlay+toggleInputDisplay+getCurrentFPS

---

## H136: announceSequence测试—8项验证setSteps+tick+reset+getPhase+isComplete+isRunning — 108→109

**commit:** <hash> | announceSequence测试—8项验证setSteps+tick+reset+getPhase+isComplete+isRunning

---

## H137: types测试—19项验证FighterState+AttackType+HitLevel+HitHeight+GamePhase枚举 — 109→110

**commit:** <hash> | types测试—19项验证FighterState+AttackType+HitLevel+HitHeight+GamePhase枚举

---

## H138: commandBuffer测试—8项验证record+reset+checkSpecial+getChargeState+hasQCF — 110→111

**commit:** <hash> | commandBuffer测试—8项验证record+reset+checkSpecial+getChargeState+hasQCF

---

## H139: vfx测试—4项验证ScreenFlash构造+trigger+update衰减 — 111→112

**commit:** <hash> | vfx测试—4项验证ScreenFlash构造+trigger+update衰减

---

## H140: charactersTypes测试—6项验证bone+pose+DEFAULT_PROPORTIONS — 112→113

**commit:** <hash> | charactersTypes测试—6项验证bone+pose+DEFAULT_PROPORTIONS

---

## H141: ryo测试—9项验证RyoDef id/name/nameCn/color/winQuotes/stats/poses/moveList — 113→114

**commit:** <hash> | ryo测试—9项验证RyoDef id/name/nameCn/color/winQuotes/stats/poses/moveList

---

## H142: roster测试—6项验证ROSTER数组+ryo/kyo/iori存在+id/name一致性 — 114→115

**commit:** <hash> | roster测试—6项验证ROSTER数组+ryo/kyo/iori存在+id/name一致性

---

## H143: attackFramesSpecials测试—8项验证KYO/RYO必杀技帧数据+attack字段 — 115→116

**commit:** <hash> | attackFramesSpecials测试—8项验证KYO/RYO必杀技帧数据+attack字段

---

## H144: frameDataChars测试—6项验证FRAME_DATA_CHARS+KYO/RYO/IORI键+startup/damage字段 — 116→117

**commit:** <hash> | frameDataChars测试—6项验证FRAME_DATA_CHARS+KYO/RYO/IORI键+startup/damage字段

---

## H145: selectState测试—7项验证VS_SPLASH_DURATION+COLOR_PALETTES+SelectState+cursor+ready — 117→118

**commit:** <hash> | selectState测试—7项验证VS_SPLASH_DURATION+COLOR_PALETTES+SelectState+cursor+ready

---

## H146: kyo测试—8项验证KyoDef id/name/color/winQuotes/stats/poses/moveList — 118→119

**commit:** <hash> | kyo测试—8项验证KyoDef id/name/color/winQuotes/stats/poses/moveList

---

## H147: iori测试—9项验证IoriDef id/name/nameCn/color/winQuotes/stats/poses/moveList/proportions — 119→120

**commit:** <hash> | iori测试—9项验证IoriDef id/name/nameCn/color/winQuotes/stats/poses/moveList/proportions

---

## H148: charBatch1测试—25项验证andy/athena/billy/chang/choi角色定义 — 120→121

**commit:** <hash> | charBatch1测试—25项验证andy/athena/billy/chang/choi角色定义

---

## H149: charBatch2—25项验证chris/clark/joe/kasumi/kdash — 121→122

**commit:** <hash> | charBatch2—25项验证chris/clark/joe/kasumi/kdash

---

## H150: charBatch3—25项验证kim/kula/leona/mai/mary — 122→123

**commit:** <hash> | charBatch3—25项验证kim/kula/leona/mai/mary

---

## H151: 倒地像素帧修复—6帧全透明→可见击倒动画 — 123→124

**commit:** 93617f8 | KD_F0-F5每帧有实际像素数据,击飞/翻滚/下落/着地/躺地

---

## H152: 翻滚像素帧+命令技路由—roll/back_roll手绘8帧+tsurizao/orishi映射 — 124→125

**commit:** b0335fa | 8个翻滚帧手绘+tsurizao→STAND_C+orishi→CROUCH_B

---

## H151: charBatch4—25项验证mature/ralf/robert/shermie/terry — 123→124

**commit:** <hash> | charBatch4—25项验证mature/ralf/robert/shermie/terry

---

## H152: charBatch5—20项验证vice/xiangfei/yamazaki/yashiro — 124→125

**commit:** <hash> | charBatch5—20项验证vice/xiangfei/yamazaki/yashiro

---

## H153: inputRecorder测试—7项验证InputRecorder start/stop/active/frameCount — 125→126

**commit:** <hash> | inputRecorder测试—7项验证InputRecorder start/stop/active/frameCount

---

## H154: inputPlayback—7项验证InputPlayback active/frameCount/isFinished/load/getInput — 126→127

**commit:** <hash> | inputPlayback—7项验证InputPlayback active/frameCount/isFinished/load/getInput

---

## H155: comboTrialData—6项验证COMBO_TRIALS+getTrialsForCharacter+getTrialById — 127→128

**commit:** <hash> | comboTrialData—6项验证COMBO_TRIALS+getTrialsForCharacter+getTrialById

---

## H156: stage—5项验证generateStars+x/y/brightness/speed — 128→129

**commit:** <hash> | stage—5项验证generateStars+x/y/brightness/speed

---

## H157: ryoContentData—8项验证RYO_CHARACTER_DATA id/displayName/weight/walkSpeed/runSpeed — 129→130

**commit:** <hash> | ryoContentData—8项验证RYO_CHARACTER_DATA id/displayName/weight/walkSpeed/runSpeed

---

## H158: ryoAttacks—5项验证RYO_ATTACK_KEYS+getRyoFrameData+getRyoAttackFrameData — 130→131

**commit:** <hash> | ryoAttacks—5项验证RYO_ATTACK_KEYS+getRyoFrameData+getRyoAttackFrameData

---

## H159: ryoCommands—5项验证RYO_MOVE_LIST+RYO_WIN_QUOTES — 131→132

**commit:** <hash> | ryoCommands—5项验证RYO_MOVE_LIST+RYO_WIN_QUOTES

---

## H160: ryoFeedback—5项验证getRyoFeedbackTiers+getRyoFeedback+RYO_FEEDBACK_SUMMARY — 132→133

**commit:** <hash> | ryoFeedback—5项验证getRyoFeedbackTiers+getRyoFeedback+RYO_FEEDBACK_SUMMARY

---

## H161: ryoHitboxes—5项验证RYO_HITBOX_KEYS+getRyoHitboxOffsets+RYO_ATTACK_FRAME_KEYS — 133→134

**commit:** <hash> | ryoHitboxes—5项验证RYO_HITBOX_KEYS+getRyoHitboxOffsets+RYO_ATTACK_FRAME_KEYS

---

## H162: ryoAnimations—5项验证getRyoAnimations+getRyoAnimSequence+getRyoAnimSequenceNames — 134→135

**commit:** <hash> | ryoAnimations—5项验证getRyoAnimations+getRyoAnimSequence+getRyoAnimSequenceNames

---

## H163: ryoStats—6项验证RYO_STATS+walkSpeed+runSpeed+jumpVelocity+maxHealth+hopVelocity — 135→136

**commit:** <hash> | ryoStats—6项验证RYO_STATS+walkSpeed+runSpeed+jumpVelocity+maxHealth+hopVelocity

---

## H164: aiRoutes—5项验证COMBO_ROUTES+JUMP_IN_ROUTE+attack/delay字段 — 136→137

**commit:** <hash> | aiRoutes—5项验证COMBO_ROUTES+JUMP_IN_ROUTE+attack/delay字段

---

## H165: charStrategies—5项验证getCharacterStrategy+ryo/kyo/iori策略 — 137→138

**commit:** <hash> | charStrategies—5项验证getCharacterStrategy+ryo/kyo/iori策略

---

## H166: overlayScreens—5项验证getSuperFlashZoom+updateSuperFlashZoom缩放逻辑 — 138→139

**commit:** <hash> | overlayScreens—5项验证getSuperFlashZoom+updateSuperFlashZoom缩放逻辑

---

## H167: announcerOverlay—6项验证trigger/tick/isActive/getCurrentEventType/clear/queue — 139→140

**commit:** <hash> | announcerOverlay—6项验证trigger/tick/isActive/getCurrentEventType/clear/queue

---

## H168: Ryo格挡+胜利姿势像素帧+完整性报告视觉维度 — 140→141

**commit:** d883b3a | Ryo格挡+胜利姿势像素帧+完整性报告视觉维度
**commit:** 88b7fe0 | 胜利姿势接入WIN_QUOTE/MATCH_END画面

**变更：**
- 新增ryoBlockFrames.ts: 3帧格挡动画(双臂交叉护体)
- 新增ryoWinFrames.ts: 4帧胜利动画(双手叉腰自信姿态)
- BLOCK/AIR_BLOCK不再回退IDLE，有专属格挡帧
- 胜利姿势接入WIN_QUOTE/MATCH_END画面循环
- 完整性报告新增Visual Frames维度(40项)
- 导出getResolvedFrameKey/drawRyoWinPose供外部使用

---

## H168: animationBlender—8项验证startBlend/update/interpolate/cancel/getFighterBlender — 140→141

**commit:** <hash> | animationBlender—8项验证startBlend/update/interpolate/cancel/getFighterBlender

---

## H169: spritePoseData—8项验证PW/PH/PIXEL+CHAR_VISUALS+darken/lighten+pose数组 — 141→142

**commit:** <hash> | spritePoseData—8项验证PW/PH/PIXEL+CHAR_VISUALS+darken/lighten+pose数组

---

## H170: renderUtils—6项验证parseColor+shiftColor+clamp — 142→143

**commit:** <hash> | renderUtils—6项验证parseColor+shiftColor+clamp

---

## H171: manifestRenderData—5项验证getCharacterRenderData/getCharacterColors/hasPortraitForSize — 143→144

**commit:** <hash> | manifestRenderData—5项验证getCharacterRenderData/getCharacterColors/hasPortraitForSize

---

## H172: skeletalParts—5项验证CHAR_OUTFIT+RYO_PALETTES+getOutfit — 144→145

**commit:** <hash> | skeletalParts—5项验证CHAR_OUTFIT+RYO_PALETTES+getOutfit

---

## H173: portraitBatch1—5项验证kyo/iori/terry/ralf/clark肖像数据 — 145→146

**commit:** <hash> | portraitBatch1—5项验证kyo/iori/terry/ralf/clark肖像数据

---

## H174: portraitBatch2—5项验证andy/athena/billy/chang/choi肖像 — 146→147

**commit:** <hash> | portraitBatch2—5项验证andy/athena/billy/chang/choi肖像

---

## H175: portraitBatch3—5项验证chris/joe/kasumi/kdash/kim肖像 — 147→148

**commit:** <hash> | portraitBatch3—5项验证chris/joe/kasumi/kdash/kim肖像

---

## H176: portraitBatch4—5项验证kula/leona/mai/mary/mature肖像 — 148→149

**commit:** <hash> | portraitBatch4—5项验证kula/leona/mai/mary/mature肖像

---

## H177: portraitBatch5—8项验证剩余角色肖像+ryoPortraits多尺寸 — 149→150

**commit:** <hash> | portraitBatch5—8项验证剩余角色肖像+ryoPortraits多尺寸

---

## H178: charDefBatch1—5项验证andy/athena/billy/chang/choi定义文件 — 150→151

**commit:** <hash> | charDefBatch1—5项验证andy/athena/billy/chang/choi定义文件

---

## H179: charDefBatch2—5项验证chris/clark/joe/kasumi/kdash定义 — 151→152

**commit:** <hash> | charDefBatch2—5项验证chris/clark/joe/kasumi/kdash定义

---

## H180: charDefBatch3—5项验证kim/kula/leona/mai/mary定义 — 152→153

**commit:** <hash> | charDefBatch3—5项验证kim/kula/leona/mai/mary定义

---

## H181: charDefBatch4—5项验证mature/ralf/robert/shermie/terry定义 — 153→154

**commit:** <hash> | charDefBatch4—5项验证mature/ralf/robert/shermie/terry定义

---

## H182: charDefBatch5—4项验证vice/xiangfei/yamazaki/yashiro定义 — 154→155

**commit:** <hash> | charDefBatch5—4项验证vice/xiangfei/yamazaki/yashiro定义

---

## H183: ryoSpriteBatch1—6项验证idle/walk/run/jump/crouch像素帧 — 155→156

**commit:** <hash> | ryoSpriteBatch1—6项验证idle/walk/run/jump/crouch像素帧

---

## H184: ryoSpriteBatch2—6项验证攻击/踢/空中/近身像素帧 — 156→157

**commit:** <hash> | ryoSpriteBatch2—6项验证攻击/踢/空中/近身像素帧

---

## H169: Ryo格挡+胜利姿势+完整视觉帧维度 — 141→142

**commit:** d883b3a+88b7fe0 | BLOCK/WIN像素帧+完整性报告视觉维度+胜利接入

---

## H170: Ryo眩晕+投技专属像素帧+全部IDLE回退消除 — 142→143

**commit:** ab770a5 | DIZZY/THROW像素帧+42/42视觉帧100%完成

**变更：**
- 新增ryoDizzyFrames.ts: 4帧眩晕摇晃(晕眩表情+摆动)
- 新增ryoThrowFrames.ts: 4帧投技动画(抓取→投掷→恢复)
- 所有FighterState不再回退IDLE,每个状态有专属像素帧
- Visual Frames维度: 42/42=100%
- 总测试: 3397通过

---

## H185: ryoSpriteBatch3—11项验证crouch/block/damage/special/super/throw/win/dizzy帧 — 157→158

**commit:** <hash> | ryoSpriteBatch3—11项验证crouch/block/damage/special/super/throw/win/dizzy帧

---

## H186: victoryPose—5项验证getVictoryPose+角色区分+tick动画 — 158→159

**commit:** <hash> | victoryPose—5项验证getVictoryPose+角色区分+tick动画

---

## H187: ryoHighResRender—3项验证hasHighResFrame+getResolvedFrameKey — 159→160

**commit:** <hash> | ryoHighResRender—3项验证hasHighResFrame+getResolvedFrameKey

---

## H188: overlayConstants—验证GAME_OVER_DURATION=180 — 160→161

**commit:** <hash> | overlayConstants—验证GAME_OVER_DURATION=180

---

## H189: ryoMovementExt—7项验证roll/guardCrush/maxMode/taunt/counterStance帧 — 161→162

**commit:** <hash> | ryoMovementExt—7项验证roll/guardCrush/maxMode/taunt/counterStance帧

---

## H190: ryoSpriteBatch4—6项验证SDM/HSDM/heavyAttack像素帧 — 162→163

**commit:** <hash> | ryoSpriteBatch4—6项验证SDM/HSDM/heavyAttack像素帧

---

## H191: stageTempleLayers—6项验证shiftHex+hexToRgb颜色工具 — 163→164

**commit:** <hash> | stageTempleLayers—6项验证shiftHex+hexToRgb颜色工具

---

## H192: aiRoutesExt—5项验证AIR_COMBO_ROUTES+applyComboStep输入映射 — 164→165

**commit:** <hash> | aiRoutesExt—5项验证AIR_COMBO_ROUTES+applyComboStep输入映射

---

## H193: ryoSpriteBatch5—5项验证backdash/crouchD/standD/airC/walkBack帧 — 165→166

**commit:** <hash> | ryoSpriteBatch5—5项验证backdash/crouchD/standD/airC/walkBack帧

---

## H194: replayInputSource—5项验证createReplayInputSource+readFrame+isFinished — 166→167

**commit:** <hash> | replayInputSource—5项验证createReplayInputSource+readFrame+isFinished

---

## H195: pixelPortraits—4项验证PixelPortraitData结构(width/height/palette/pixels) — 167→168

**commit:** <hash> | pixelPortraits—4项验证PixelPortraitData结构(width/height/palette/pixels)

---

## H196: spritePoseDataFuncs—5项验证getIdlePoses/getRunPoses/getJumpPoses/getHitPoses/getBlockPoses — 168→169

**commit:** <hash> | spritePoseDataFuncs—5项验证getIdlePoses/getRunPoses/getJumpPoses/getHitPoses/getBlockPoses

---

## H197: charVisuals—5项验证CHAR_VISUALS角色外观数据 — 169→170

**commit:** <hash> | charVisuals—5项验证CHAR_VISUALS角色外观数据

---

## H198: andyDef—5项验证Andy角色定义id/name/stats/poses — 170→171

**commit:** <hash> | andyDef—5项验证Andy角色定义id/name/stats/poses

---

## H199: athenaDef—5项验证Athena角色定义 — 171→172

**commit:** <hash> | athenaDef—5项验证Athena角色定义

---

## H200: charDefBatch6—25项验证Billy/Chang/Choi/Chris/Clark角色定义 — 172→173

**commit:** <hash> | charDefBatch6—25项验证Billy/Chang/Choi/Chris/Clark角色定义

---

## H201: charDefBatch7—25项验证Joe/Kasumi/Kdash/Kim/Kula角色定义 — 173→174

**commit:** <hash> | charDefBatch7—25项验证Joe/Kasumi/Kdash/Kim/Kula角色定义

---

## H202: charDefBatch8—25项验证Leona/Mai/Mary/Mature/Robert角色定义 — 174→175

**commit:** <hash> | charDefBatch8—25项验证Leona/Mai/Mary/Mature/Robert角色定义

---

## H203: charDefBatch9—30项验证Shermie/Terry/Vice/Xiangfei/Yamazaki/Yashiro角色定义 — 175→176

**commit:** <hash> | charDefBatch9—30项验证Shermie/Terry/Vice/Xiangfei/Yamazaki/Yashiro角色定义

---

## H204: roster—5项验证ROSTER注册表(26+角色/唯一id/stats) — 176→177

**commit:** <hash> | roster—5项验证ROSTER注册表(26+角色/唯一id/stats)

---

## H205: vfxPresets—8项验证getSparkSizeScaleFromDamage伤害阈值 — 177→178

**commit:** <hash> | vfxPresets—8项验证getSparkSizeScaleFromDamage伤害阈值
