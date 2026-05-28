# KOF 差距矩阵

本文是当前项目相对正版 KOF2002 风云再起、KOF2002UM 风格体验的差距清单与优先级指南。

原则：

- 这里只描述工程和体验上的可观察差距，不复制商业素材或受保护实现。
- 所有“新功能添加点”必须先映射到本矩阵里的某一项差距。
- 先闭合最高感知差距，再做低感知扩展。
- 当前主线仍是 Ryo Vertical Slice，所有差距优先围绕 Ryo 关闭。
- 如果项目已经进入 Phase 2，也仍然优先用同一套矩阵判断 Kyo/Iori 或通用管线是否值得做。

## 1. 最高优先级差距

### 1.1 肖像气质差距

- 已闭合项：
  - portrait manifest 四尺寸规范 (select 120x120 / vs 160x160 / hud 48x48 / win 200x200)
  - Ryo/Kyo/Iori 全4尺寸像素肖像数据
  - 27角色 CHARACTER_PORTRAIT_COLORS fallback 色板
  - 肖像渲染三级链 (sizedPortraits → pixelPortrait → 渐变+字母)
- 当前差距：选人、HUD、胜利肖像还没有形成统一的正式角色气质。
- 新功能添加点：
  - `portrait manifest`
  - select/HUD/win 三套尺寸规范
  - portrait fallback 与替换路径
  - 角色肖像一致性校验
- 期望结果：
  - 第一眼看起来像正式街机角色，而不是临时占位图。

### 1.2 动作节奏差距

- 当前差距：idle / walk / jump / attack / hurt / knockdown 的重心、停顿和姿态统一性还不够。
- 已闭合项：
  - Ryo/Kyo/Iori 所有指令通常技(命令通常技)已有专用高分辨率像素帧(v2.14)
  - 不再 fallback 到程序化渲染
  - 8个校验点 + 11个回归测试保护
  - Iori动画元数据补全 (crouch/block/dizzy)
  - 3角色动画节奏一致性回归测试 (63 tests: 轻重攻击递增/hitstun<knockdown/loop属性)
  - 3角色必杀技像素帧覆盖 (134 tests: 基本+通常+必杀+DM/SDM/HSDM+命令技)
  - Kyo行走动画6帧像素帧+程序化腿部交替变异+元数据帧数修正(4→6)
  - 3角色空中轻踢(AIR_B)专属像素帧 (3帧: 蓄力/斜踢/收腿) + 渲染集成
  - 3角色空中攻击全覆盖回归测试 (14 tests: AIR_A/B/C/D帧数据完整性)
  - ioriSpecialFrames.ts 拆分为 basic specials (1670行) + super frames (480行)
  - FighterState.WIN接入—3角色胜利姿态动画实际播放 (v2.39)
  - Ryo胜利动画4帧durations修正 [6,30]→[6,8,10,30]
  - frameDataChars.ts 拆分为5角色组文件 (4611→40行聚合器)
  - overlayScreens.ts 拆分为7子文件 (2472→55行聚合器)
  - screens.ts 拆分为6子文件 (2256→58行聚合器)
  - attackFramesSpecials.ts 拆分为7子文件 (2209→10行聚合器)
  - skeletalParts.ts 拆分为3子文件 (2058→7行聚合器)
  - Iori近距离攻击专属像素帧 CLOSE_A/B/C/D (25 tests: 3角色近战动画对齐)
  - 眩晕星星KOF2002风格4色十字星旋转 (替代简单黄色圆点)
  - TypeScript编译错误清零 (51→0: 文件拆分后导入/导出补全)
  - 3角色DIZZY动画帧注册回归测试 (9 tests)
- 新功能添加点：
  - animation manifest
  - pose bank
  - 动作帧节奏校验
  - 空中、地面、受击姿态的统一节奏约束
- 期望结果：
  - 角色动起来不像骨骼假人，而像有重心、有气质的格斗角色。

### 1.3 打击反馈差距

- 已闭合项：
  - 6档反馈矩阵 light/heavy/special/dm/sdm/hsdm 全部参数化 (hitstop/shake/spark/pushback/impactRing/bodyShake)
  - feedbackManifest.ts 数据驱动 manifest，attackTierMap 覆盖 Ryo/Kyo/Iori 全部招式
  - 命中事件统一触发链 (hitCallback → feedbackManifest → cinematicState)
  - 受击反馈与攻击重量绑定 (inferTier 自动分类 + 显式映射)
  - 角色专属 DM/SDM/HSDM 火花色板 (Kyo 火/Iori 紫/Ryo 雷)
  - Kyo大蛇薙专属火焰柱VFX、Iori闇払い专属暗能量发射VFX
  - Iori八咫烏DM专属暗能量螺旋启动VFX (取代通用DM爆发)
  - MAX mode角色属性光效: Kyo火橙/Iori暗紫/Ryo蓝雷
  - 命中闪光角色属性色: hitstop发光/残影/DM十字星按角色元素染色
  - Kyo毒咬み火焰拖尾+Iori葵花暗能量拖尾递增VFX
  - Kyo75式改二次命中递进强化、Iori琴月暗能量拖尾
  - Kyo紅丸脚专属火焰弧线拖尾VFX
  - Ryo飛燕着地扇形扬尘VFX
  - Ryo斩裂拳多段递进3层VFX (小火花→蓝能爆发→闪光+强震)
  - Kyo毒咬み收尾(節見)screenFlash强化终结感
  - Iori屑風暗能量漩涡专属VFX (暗紫螺旋+爪痕斩击+暗影wisp)
  - Ryo霸王翔吼拳属性色VFX (蓝雷替代通用金色)
  - Ryo強虎煌拳D版增强 (impactRing+screenFlash+shake升级)
  - Kyo荒咬み連撃鏈遞進火焰VFX (opener→followup→finisher遞增)
  - Ryo卸しimpactRing+Iori雪割暗能量爆裂
  - 3角色57必殺技VFX+SFX全覆蓋回歸測試 (118 tests)
  - MAX爆氣激活角色屬性色閃光 (取代通用綠色)
  - DM終結KO屬性色閃光 (DM/SDM/HSDM擊殺按殺手元素色)
  - Desperation gauge visual: HP<25%红脉冲光圈+MAX+Desperation="HSDM"闪烁文字
  - Desperation screen edge: HP<25%时屏幕边缘暗红光晕增加紧迫感
  - KOF2002幕帘转场动画: 上下滑入黑色幕帘+金色边缘光 (curtain transition)
  - Hitstop attacker glow: 攻击者hitstop期间元素色轮廓微光增强打击感
  - Announcer burst扩散环: KO/FIGHT爆发文字背后能量环扩展效果
  - Stun gauge警告光效: >85%红色脉冲光晕预警眩晕
  - HSDM招式名扫描线: HSDM banner紫粉色光线扫过增加终极感
  - 4616→4621 回归测试保护反馈矩阵完整性和层级递进
- 当前差距：hitstop、spark、shake、pushback、SFX 还没有按轻重/特殊/爆气状态形成稳定矩阵。
- 新功能添加点：
  - feedback manifest
  - light/heavy/special/DM/MAX 反馈分层
  - 命中事件统一触发链
  - 受击反馈与攻击重量绑定
- 期望结果：
  - 每次打中都能感觉到重量，而不是只看到一个通用闪光。

### 1.4 输入可见性差距

- 当前差距：招式、快捷键、标准按键、爆气说明在界面上必须更一致、更显眼。
- 已闭合项：
  - 训练模式 move list HUD (F5 切换, SNK 分组风格)
  - 训练模式 frame data 面板 (F4 切换)
  - 训练模式 input history (F3 切换, 方向+按钮)
  - 训练模式检测招式名称显示 (输入历史面板实时显示中文招式名)
  - 训练模式指令进度可视化 (QCF/QCB/DP/HCF/HCB 部分匹配进度条)
  - HSDM 分类补全 (招式表 + 训练模式面板均显示 HIDDEN SUPER DM)
  - 街机模式 Tab 招式表面板
  - 训练模式 MAX/Burst 系统说明面板 (右侧面板显示激活条件、消耗、升级规则)
- 新功能添加点：
  - 训练模式招式卡片(视觉图标输入)
- 期望结果：
  - 用户一眼知道怎么出招，怎么爆气，怎么理解角色。

## 2. 中优先级差距

### 2.1 技能与资源规则差距

- 已闭合项：
  - 6层反馈矩阵+MAX mode damage/defense bonus (1.2x/0.75x)
  - DM→SDM免费升级(MAX mode内)、DM→HSDM升级(MAX+desperation)
  - 3 Stock MAX mode activation, 1 Stock DM, Super Cancel extra stock
  - Free Cancel drains 20% MAX timer, Desperation DM damage bonus (1.3x)
  - 命中时气槽闪光反馈 (meterFlash + stockFlash)
  - DM→SDM→HSDM升级链回归测试 (8 tests, 3角色HSDM映射)
  - Kyo/Iori取消路径回归测试 (22 tests)
- 当前差距：普通气、MAX 气、强化版技能、DM/HSDM 的消耗与强化关系还需要更稳定。
- 新功能添加点：
  - MAX mode resource split
  - 强化版技能升级规则
  - 资源优先级与消耗链
  - 命中时的气槽反馈
- 期望结果：
  - 爆气后技能明显更强，且资源消耗逻辑清晰。

### 2.2 内容包与 manifest 差距

- 已闭合项：
  - Ryo 完整度校验工具 (8维报告: animationFrames/attackFrames/feedback/hurtbox/portrait/moveList/visualFrames + 加权总分)
  - Kyo 完整度校验工具 (8维报告: animationMeta/frameData/attackFrames/feedback/portrait/moveList/cancelPaths/hitEffects)
  - Iori 完整度校验工具 (8维报告: 同Kyo结构)
  - Kyo/Iori完整度回归测试 (33 tests: 维度有效性+覆盖率+最低阈值)
  - 测试总数 4621
- 当前差距：角色内容已开始分层，但真实数据、兼容入口、校验工具之间还需继续收口。
- 新功能添加点：
  - `src/content/characters/index.ts` barrel export
  - Ryo content package 子域数据文件
  - frame contract / animation / hitbox / feedback 校验工具
  - completeness report
- 期望结果：
  - 新内容有固定归属，不再散落在多个平面入口。

### 2.3 稳定性与回归差距

- 当前差距：部分输入、镜头、特效、命中边界虽然已改善，但仍需要更强回归保护。
- 已闭合项：
  - 4616 tests 全部通过 (vitest)
  - 6档反馈矩阵回归测试 (23 tests, 层级递进+参数完整性+3角色映射)
  - DM→SDM→HSDM升级链回归测试 (8 tests, Kyo/Iori/HSDM一致性)
  - 3角色必杀技像素帧覆盖 (134 tests, 基本+通常+必杀+DM/SDM/HSDM+命令技)
  - Kyo/Iori反馈层+帧映射回归测试 (4 tests, 27+25攻击类型全映射)
  - 3角色取消路径结构回归测试 (22 tests, 通常技→必杀技→DM超必→Free Cancel)
  - 3角色四尺寸肖像一致性回归测试 (28 tests, select/vs/hud/win全尺寸)
  - 3角色动画节奏一致性回归测试 (63 tests, 轻重攻击递增+loop属性+参数正值)
  - 3角色 manifest 校验工具 全绿 (82+89+89 checks)
  - 3角色8维完整度校验工具 (Ryo/Kyo/Iori各8维度+加权总分，3角色均100%)
  - 多角色统一校验入口 (multiCharValidation.ts)
  - Kyo/Iori完整度+命中特效前缀覆盖率回归测试 (45 tests)
  - HSDM招式表分类+CN_MOVE_NAMES覆盖回归测试 (11 tests)
- 新功能添加点：
  - smoke / ryo / combat / content 分层测试
  - frame contract 回归测试
  - 选择界面、爆气、双击冲刺、命中 VFX 的专门测试
- 期望结果：
  - 体验优化不再轻易把基础手感打坏。

## 3. 低优先级但必须保留的差距

### 3.1 流程与场景仪式感差距

- 当前差距：选人、进场、KO、胜负、重开等流程还有进一步街机化空间。
- 已闭合项：
  - 街机对手递进 + 宿敌系统(RIVAL_MAP)
  - NEXT_MATCH 对手预览 + 宿敌决战标识
  - VS 画面 + 肖像 + 调色板
  - 角色入场 INTRO 粒子特效 + 入场台词
  - KO 视觉序列 + DM/SDM/HSDM 终结画面
  - CONGRATULATIONS 通关统计面板
  - CONTINUE 倒计时画面
  - 回合结束分数明细弹窗(Win+HP Bonus+Perfect+计数动画)
  - VS画面冲击音效 + P2开场语音
  - FighterState.WIN胜利姿态接入 + 3角色专属像素帧实际播放 (v2.39)
  - Ryo胜利4帧动画完整播放(起手→交叉→完成→持定)
  - 全项目文件2000行上限合规(5大文件拆分: frameData/overlays/screens/attackFrames/skeletal)
  - 眩晕星星VFX增强(4色十字星旋转替代简单黄色圆点)
- 新功能添加点：
  - 胜利姿态动画细化
  - 角色专属胜利语音

### 3.2 长期架构差距

- 当前差距：仓库还在从单体结构向大型项目结构过渡。
- 新功能添加点：
  - `app/engine/simulation/content/tools` 目标分层
  - 资源工具链离线化
  - 更清晰的角色包、舞台包、UI 包边界

## 4. 当前最该先做什么

按当前优先级，建议先闭合以下顺序：

1. 流程与场景仪式感。
2. 多角色内容包与 content loader 稳定化。
3. 输入可见性与 UI/HUD 一致性。
4. 打击反馈与资源规则。
5. 肖像气质与动作节奏的进一步精修。
6. 回归保护与工具链强化。
7. 长期架构分层与目录收口。

## 4.1 Phase 2 当前执行清单

如果任务发生在当前 Phase 2，优先按下列方向排期：

- 街机模式对手递进、NEXT_MATCH、NEXT STAGE、CONGRATULATIONS 这类流程仪式感。
- Kyo / Iori 内容包接入、move list、frame contract、portrait / feedback / hitbox 的多角色验证。
- 菜单、选人、VS、胜负画面、训练模式招式表的 UI/HUD 一致性。
- 现有测试分层、内容校验、manifest 校验和回归保护。
- 在不破坏前四项的前提下，再继续细化肖像、动作和特效。

## 5. 不要做什么

- 不要为了“更多功能”横向扩角色。
- 不要为了“更高级”直接换技术栈。
- 不要把 placeholder 包装成正式方向。
- 不要在没有 gap 对应关系时添加新系统。
