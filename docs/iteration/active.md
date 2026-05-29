# 当前迭代

## 目标

- MUGEN Asset Integration — 将已有 MUGEN 资产全面接入运行时
- 当前分数：327/2000
- 当前tag: v3.09
- 本轮方向：Shermie/Heidern/Yuri内容包+MUGEN判定集成

## 当前状态

- 当前主线：MUGEN-first 资产集成 + 多角色运行时闭环
- MUGEN 管线已闭环：parseAir → buildSpriteManifest → convertAirHitboxes → extractCharacterSprites
- 已导入资产：18角色 PNG sprite + manifest + hitboxes（28,108+ PNG）
- 运行时双路径：PNG sprite（优先）+ 程序化帧（fallback）
- 战斗系统：8/8 KOF2002 深层机制已实现
- 测试总数 10,846+ (374 files, 0 failures)
- 内容包完整度：13角色全量（Ryo/Kyo/Iori/Terry/Kim/Athena/Vice/Yamazaki/Shermie/Benimaru/Yuri/Heidern）
- 30 roster 定义，仅 KOF2002 原版角色
- 通用渲染管线：15角色通过 characterSpriteConfigs 自动加载 PNG
- MUGEN判定系统：hitbox/hurtbox/body 3层回退已接入 fighter.ts
- MUGEN查询层：8角色内容包接入 mugenHitboxQuery（Kyo/Ryo/Terry/Kim/Athena/Vice/Yamazaki/Shermie）
- animStateSync：MUGEN -1帧时长归一化 + 帧边界查询 + 动画统计
- 训练模式hitbox调试：F2开关 + F7循环 game/both/mugen 三模式
- 完整度报告：5角色各有 dimensionReport 工具

## 本轮完成

- Shermie内容包注册到主内容加载器
- Heidern完整内容包（12文件，1,768行）+ hitboxes.json（51攻击动作）
- Yuri完整内容包（12文件）+ PNG提取（1,315张）+ hitboxes.json（53攻击动作）
- Heidern/Yuri注册到主内容加载器 index.ts
- 差距矩阵更新

## 关键阻塞

- **Iori 无 MUGEN 源文件**：references/mugen/ 不含 Iori SFF/AIR/ACT，需要外部资源
- **部分 KOF2002 角色无 MUGEN 源**：Warusaki3 CVS 包不含 Andy/Joe/Robert/Daimon/Leona/Ralf/Clark 等纯 KOF 角色

## 下一步

- Yuri运行时sprite配置注册（characterSpriteConfigs）
- 寻找 Iori MUGEN 源文件并接入
- 推进差距矩阵 Tier 1 闭合
- animStateSync与baseHighResRenderer帧索引统一

## 回退方案

- git revert 即可
- 程序化 fallback 始终保留，PNG 加载失败不会导致角色消失
