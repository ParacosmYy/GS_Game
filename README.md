# GS_PythonShooter — 超写实 3D 战术射击游戏

基于 **Panda3D** 引擎的 Python 版战术射击游戏（原 C++ UE5 版已迁移）。

---

## 🎯 启动方式

### Windows 用户

```
Game/
├── 启动游戏.bat    ← ★ 双击这个就行 ★
│
├── GS_PythonShooter/    ← 项目源码（.venv 虚拟环境在此）
└── GS_TacticalShooter/  ← 旧的 C++ UE5 项目（存档）
```

**第一次启动：**
```
双击「启动游戏.bat」
  → 选择 [1] 自动创建虚拟环境并安装依赖
  → 等待安装完成（Panda3D ~80MB）
  → 选择 [1] 启动游戏
```

**以后启动：**
```
双击「启动游戏.bat」 → 选择 [1] 启动游戏
```

---

## 📋 启动器功能

| 菜单选项 | 说明 |
|---------|------|
| 1. 启动游戏 | 使用 .venv 虚拟环境启动 Panda3D 窗口 |
| 2. 系统自检 | 验证所有模块导入和核心功能 |
| 3. 依赖审计 | 检查依赖是否在 venv 中，防止全局安装 |
| 4. 安装依赖 | 在 venv 中更新所有依赖 |
| 5. venv Shell | 进入虚拟环境命令行 |
| 6. 文档 | 查看项目文档 |

---

## 📁 项目结构

```
Game/
├── 启动游戏.bat                 ★ 启动入口
├── CONSTRAINT_DOC.md
├── README.md
├── SUBAGENT_PLAN.md
│
├── GS_PythonShooter/             ← 当前项目
│   ├── .venv/                    ← 虚拟环境（隔离依赖）
│   ├── requirements.txt          ← 依赖清单
│   ├── Pipfile                   ← Pipenv 兼容格式
│   ├── audit_deps.py             ← 依赖审计工具
│   ├── run_game.py               ← Python 入口
│   └── src/
│       ├── core/                 ← 游戏引擎核心
│       ├── input/                ← 输入管理
│       ├── character/            ← FPS 控制器 + 动画
│       ├── weapon/               ← 武器 + 弹道 + 伤害
│       ├── ai/                   ← 行为树 + AI
│       ├── environment/          ← 场景 + 可破坏物
│       ├── effects/              ← 命中效果
│       ├── ui/                   ← HUD + 菜单
│       └── render/               ← PBR + 后处理 + 光照
│
└── GS_TacticalShooter/           ← 旧 C++ UE5 项目（存档）
