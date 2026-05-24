# 拳皇2002 - 风云再起

KOF 2002 风格 2D 格斗游戏，基于 HTML5 Canvas + TypeScript + Vite 构建。

## 版本

当前版本: **v4.0.0** — AI对手 + 合成音效 + 4角色必杀视觉特效

## 快速启动

```bash
# 安装依赖
npm install

# 开发模式 (http://localhost:3000)
npx vite --port 3000

# 或双击 play.bat
```

### 打包分发

```bash
# 双击 build.bat，生成 dist/ 目录，可直接发送给他人
build.bat
```

## 操作说明

### P1 (WASD + JKUI;L)
| 按键 | 功能 |
|------|------|
| W | 跳跃 |
| A | 左移 / 后方向 |
| S | 蹲下 |
| D | 右移 / 前方向 |
| J | 轻拳 (A) |
| K | 轻脚 (B) |
| U | 重拳 (C) |
| I | 重脚 (D) |
| ; (分号) | 投技 |
| L | CD Blowback |

### P2 (方向键 + 小键盘) / AI 对手
| 按键 | 功能 |
|------|------|
| ↑↓←→ | 移动 |
| Numpad1 | 轻拳 (A) |
| Numpad2 | 轻脚 (B) |
| Numpad3 | 重拳 (C) |
| Numpad0 | 重脚 (D) |
| Numpad. | 投技 |
| Numpad4 | CD Blowback |

### 通用操作
| 按键 | 功能 |
|------|------|
| R | 重新开始 |
| T | 切换 P2 AI/人类 (选人界面) |
| F1 | 调试信息 |

### KOF 移动操作
| 操作 | 指令 |
|------|------|
| Dash 跑步 | →→ (快速前冲) |
| Backdash 后撤 | ←← (后跳) |
| 小跳 | 短按↑ (低弧线跳跃) |
| 中跳 | ↓↑ 或跑跳中短按↑ |
| 大跳 | ↓↑ 长按 (高弧线远跳) |
| 紧急回避 Roll | A+B (消耗能量) |

### 系统机制
| 操作 | 指令 |
|------|------|
| MAX 模式激活 | B+C 同时按 (消耗3格能量) |
| DM 超必杀技 | MAX模式下 ↓↘→↓↘→+A/C 等 |

## 角色列表

### 草薙京 (Kyo)
| 技名 | 指令 | 说明 |
|------|------|------|
| 荒咬み | ↓↘→+A | Rekka起始，可追击 |
| └ 九傷 | 荒咬み后 ↓↘→+A/C | Rekka二段 |
| └ 八錆 | 荒咬み后 ↓↙←+A/C | Rekka变招 |
| 毒咬み | ↓↘→+C | Rekka起始(C版) |
| └ 罪詠み | 毒咬み后 ↓↙←+A/C | Rekka二段 |
| └ 罰詠み | 罪詠み后 →+A/C | Rekka三段 |
| 75式改 | ↓↘→+B/D,再按K | 二连飞踢，KD |
| R.E.D. Kick | ↓↙←+B/D | 头上踢，Overhead |
| 轟斧陽 | →+B | 命令通常技，Overhead |
| 八拾八式 | ↘+D | 命令通常技，下段 |
| 奈落落とし | 空中 ↓+C | 空中命令技，KD |
| 大蛇薙 (DM) | MAX模式 ↓↘→↓↘→+A | 火炎超必杀 |

### 八神庵 (Iori)
| 技名 | 指令 | 说明 |
|------|------|------|
| 葵花 | ↓↙←+A/C,可3连 | 三段Rekka |
| 暗拂 | ↓↘→+A/C | 飞行道具 |
| 鬼焼き | →↓↘+A/C | 升龙对空 |
| 八稚女 (DM) | MAX模式 →↓↘→↓↘+A/C | 暗炎突进超必杀 |

### 泰利 (Terry)
| 技名 | 指令 | 说明 |
|------|------|------|
| Burn Knuckle | ↓↙←+A/C | 突进拳击 |
| Crack Shot | ↓↙←+B/D | 旋转踢 |
| Power Wave | ↓↘→+A/C | 地面波动 |
| Power Geyser (DM) | MAX模式 ↓↘→↓↘→+A/C | 地面爆发超必杀 |

### 金家藩 (Kim)
| 技名 | 指令 | 说明 |
|------|------|------|
| 飛燕斬 | ↓↙←+B/D | 上升踢 |
| 空斬 | →↓↘+A/C | 升龙对空 |
| 鳳凰脚 (DM) | MAX模式 ↓↘→↓↘→+B/D | 飞翔踢超必杀 |

## 功能清单

### 战斗系统
- 4键攻击: A(轻拳) / B(轻脚) / C(重拳) / D(重脚)
- 近距离/远距离 通常技自动切换
- 蹲下攻击 (低段)、空中攻击 (中段)
- 投技 (近距离不可防御翻摔)
- CD Blowback (消耗能量击飞)
- 高低段判定: 空中攻击破蹲防，蹲攻击破站防
- Counter Hit (反击命中加成)
- Damage Scaling (连击伤害递减)

### 必杀技系统
- 波动拳、升龙拳等通用必杀
- 角色专属 Rekka 连段 (荒咬み/葵花等)
- 命令通常技 (→+B, ↘+D, 空中↓+C)
- DM 超必杀技 (MAX模式下发动)
- 指令优先级: 升龙 > Rekka > 波动

### KOF 移动机制
- Dash (→→)、Backdash (←←)
- 小跳 / 中跳 / 大跳 (跳跃高度分级)
- 跑跳 (跑步中跳更远更快)
- 紧急回避 Roll (A+B，消耗能量)

### 能量系统
- Power Gauge (攻击/受击/格挡 积攒)
- 3格满后可进入 MAX 模式 (B+C)
- MAX 模式下解锁 DM 超必杀技
- MAX 模式伤害加成 + 受伤减少

### AI 对手
- 距离策略系统: 接近/后退/攻击/格挡/对空/投技/必杀
- 难度可调 (0.0~1.0)
- 选人界面 T 键切换 AI/人类

### 视觉效果
- 打击火花 / 格挡闪光 / 伤害数字
- 连击计数 (X COMBO) / Counter Hit 提示
- 屏幕震动 (根据攻击强度)
- 着地灰尘 / Impact Ring
- 角色专属必杀特效: 京火焰/庵紫焰/Terry黄能量/Kim蓝气芒
- DM 爆发视觉 (全屏光效)
- 梯度血条 (绿→黄→红)
- 99秒倒计时 / ROUND 1 FIGHT! / KO 判定

### 音效系统
- Web Audio API 实时合成，无需音频文件
- 打击/格挡/必杀/DM/投技/KO/选人/Counter 8种音效

### 选人界面
- 4角色卡片选择
- P1: A/D 移动 + J 确认
- P2: ←/→ 移动 + Numpad1 确认 (或 AI 自动)

## 技术架构

```
src/
├── main.ts                    # 入口 + 游戏循环 + 选人/AI集成
├── core/
│   ├── types.ts               # 枚举/接口定义 (AttackType 30+)
│   ├── constants.ts           # 帧数据/碰撞箱/常量配置
│   ├── camera.ts              # 镜头跟踪
│   └── gameLoop.ts            # 固定60Hz逻辑 + RAF渲染
├── entities/
│   ├── fighter.ts             # 角色实体 (状态/血量/Rekka)
│   ├── fighterController.ts   # 通用状态机 (委托CharacterDefinition)
│   └── projectile.ts          # 飞行道具
├── characters/
│   ├── types.ts               # CharacterDefinition 接口
│   ├── kyo.ts                 # 草薙京 (Rekka链/火焰)
│   ├── iori.ts                # 八神庵 (葵花/紫焰)
│   ├── terry.ts               # 泰利 (Burn Knuckle/黄能量)
│   ├── kim.ts                 # 金家藩 (飛燕斬/蓝气芒)
│   └── index.ts               # ROSTER 注册表
├── combat/
│   └── combatSystem.ts        # 战斗判定 + Combo + Counter
├── input/
│   ├── inputManager.ts        # 键盘输入
│   ├── inputResolver.ts       # 方向解析 + 边沿检测
│   └── commandBuffer.ts       # 方向历史 + 必杀技检测
├── ai/
│   └── simpleAI.ts            # AI决策引擎 (距离策略)
├── audio/
│   └── sfx.ts                 # Web Audio 合成音效
└── rendering/
    ├── renderer.ts            # 渲染器 (舞台/角色/HUD/选人)
    └── vfx.ts                 # VFX粒子 + 屏幕震动
```

### 扩展角色

添加新角色只需:
1. 创建 `src/characters/newchar.ts`，实现 `CharacterDefinition` 接口
2. 在 `src/characters/index.ts` 的 `ROSTER` 数组添加一行导入

无需修改 Controller / Renderer / main.ts。

## 版本历史

| 版本 | 内容 |
|------|------|
| v1.0.0 | 基础战斗 + KOF移动机制 |
| v2.0.0 | 4键攻击 + Roll + 小中大跳 + Counter + DM大蛇薙 + MAX模式 |
| v3.0.0 | 草薙京角色化: Rekka连段/命令技/近距离技 |
| v3.1.0 | CharacterDefinition架构重构 + Iori/Terry/Kim 4角色 |
| v4.0.0 | AI对手 + Web Audio合成音效 + 全角色必杀视觉特效 |

## License

MIT
