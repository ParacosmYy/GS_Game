# GS_TacticalShooter — 总体约束文档

## 1. 技术栈选型

| 层级 | 技术 | 理由 |
|------|------|------|
| **引擎** | Unreal Engine 5.5+ | Nanite + Lumen + Chaos Physics 原生支持，行业 AAA 标准 |
| **语言** | C++17（UE 标准） | 性能关键型射击游戏对 GC 敏感，C++ 提供零开销抽象 |
| **渲染** | **Deferred Shading** + **Lumen** + **Hardware Ray Tracing** | 超写实全局光照、反射、阴影 — CS2 级别的视觉保真度 |
| **几何** | **Nanite** | 高精度模型直接导入，zero LOD 开销，支持百万级三角形场景 |
| **物理** | **Chaos Physics** + **Chaos Destruction** | 物理破坏、布料模拟、刚体交互 |
| **AI** | **UE Behavior Tree** + **EQS** + **AI Perception** | 官方成熟方案，支持复杂战术决策与感知系统 |
| **输入** | **Enhanced Input System** | 上下文敏感映射、组合键、瞄准/射击分离 |
| **网络** | **UE Dedicated Server** + **Iris Replication** | CS2 级精确网络同步，支持 128 tick |
| **音频** | **MetaSounds** + **Occlusion** | 程序化音频，支持空间音频与物理遮挡 |
| **UI** | **UMG** + **CommonUI** | 高性能 HUD，支持控制器导航 |

### 引擎版本约束
- 最低引擎版本：UE 5.5
- 插件约束：禁止使用蓝图节流插件，核心逻辑必须 C++
- 渲染管线：必须启用 `r.RayTracing=1`、`r.Lumen=1`、`r.Nanite=1`

---

## 2. 代码规范

### 2.1 命名约定

| 类别 | 规则 | 示例 |
|------|------|------|
| 类 | PascalCase，`T` 前缀模板，`I` 前缀接口，`U` 前缀 UObject，`A` 前缀 Actor | `AShooterCharacter`, `UShooterWeaponComponent` |
| 函数 | PascalCase，动词开头 | `FireWeapon()`, `CalculateDamage()` |
| 变量 | 驼峰式 + 类型前缀 | `m_CurrentHealth`, `m_WeaponSlot` |
| 布尔 | `b` 前缀 | `bIsReloading`, `bIsADS` |
| 枚举 | `E` 前缀，命名空间风格 | `EFireMode::Burst`, `ETeam::CounterTerrorist` |
| 结构 | `F` 前缀 | `FBallisticHitResult`, `FWeaponStats` |
| 宏/常量 | `UPPER_SNAKE` | `MAX_PLAYERS_PER_TEAM`, `DEFAULT_MOVE_SPEED` |

### 2.2 文件结构

```text
ShooterXXX.h       — 类声明（Public）
ShooterXXX.cpp     — 类实现（Private）
```

- 每文件一个类（工具结构除外）
- `.generated.h` 始终为最后一个 include
- PCH 使用引擎提供的 `CoreMinimal.h`

### 2.3 注释标准

```cpp
/// <summary>
/// 向指定目标应用伤害，考虑护甲穿透和距离衰减
/// </summary>
/// <param name="HitActor">被击中的 Actor</param>
/// <param name="Damage">原始伤害值</param>
/// <param name="HitInfo">弹道命中信息</param>
/// <returns>最终实际伤害</returns>
UFUNCTION(BlueprintCallable, Category = "Damage")
float ApplyDamage(AActor* HitActor, float Damage, const FBallisticHitResult& HitInfo);
```

- 公共 API 函数必须带 XML 文档注释
- 复杂算法必须附 inline 解释
- TODO/FIXME 标记必须带任务编号

### 2.4 性能约束

- Tick 中禁止 **new/delete**、**动态数组分配**（使用对象池）
- 武器每帧检测：Object Pooling + 空间分区
- AI 感知更新频率：≤ 5Hz idle，≤ 20Hz combat
- 网络 RPC 调用：Server/Client 含验证（Checksum + Authority Check）

---

## 3. 架构设计

### 3.1 总体架构图

```
┌─────────────────────────────────────────────────────────┐
│                    GameInstance                         │
│            [Match管理, 玩家队列, 语音]                    │
├─────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│ │GameMode │ │GameState │ │PlayerState│ │PlayerController│ │
│ │(Authority)│ │(Replicated)│ │(Replicated)│ │(Input/UI)     │ │
│ └────┬────┘ └────┬─────┘ └────┬─────┘ └──────┬───────┘ │
│      │           │            │              │          │
│ ┌────▼────────────────────────▼──────────────▼───────┐ │
│ │                 ShooterCharacter                    │ │
│ │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │ │
│ │  │AnimInst  │ │WeaponComp│ │MovementComponent │   │ │
│ │  └──────────┘ └──────────┘ └──────────────────┘   │ │
│ └────────────────────────────────────────────────────┘ │
│ ┌──────────┐ ┌────────────────┐ ┌──────────────────┐  │
│ │ShooterAI │ │ShooterWeapon  │ │ImpactManager     │  │
│ │Controller│ │(Projectile)   │ │(Decal/VFX/SFX)   │  │
│ └──────────┘ └────────────────┘ └──────────────────┘  │
│ ┌──────────────────────────────────────────────────┐   │
│ │              RenderSettings                      │   │
│ │  (Lumen Config / RT Settings / PostProcess)     │   │
│ └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 3.2 游戏流（Game Loop）

```
[Lobby/Warmup]
     │ 30s 倒计时 / 玩家加载
     ▼
[FreezeTime] (10s)
     │ 购买阶段 / 无法移动
     ▼
[ActionPhase]
     │ 5v5 对抗 / 炸弹安置/拆除 / 全灭
     ▼
[RoundEnd] (5s)
     │ 结算MVP / 经济奖励
     ▼
[NextRound] or [HalfTime] or [MatchEnd]
```

### 3.3 类层次设计

```
AShooterGameMode
  ├── AShooterGameState
  ├── AShooterPlayerState (Team ID, Money, KDA, Equipment)
  │    └── AShooterPlayerController
  │         └── AShooterCharacter
  │              ├── UShooterWeaponComponent (slot 0-1, holster)
  │              ├── UShooterMovementComponent (ADSSpeed, Crouch)
  │              └── UShooterAnimInstance (State Machine)
  ├── AShooterAIController
  │    └── AShooterAIBot
  │         └── UBehaviorTree / UBTDecorator / UBTTask
  └── AShooterWeapon (Spawned Per Weapon)
       └── AShooterProjectile (Pooled)
```

### 3.4 模块职责

| 模块 | 职责 | 关键类 |
|------|------|--------|
| **Core** | 游戏模式、回合循环、队伍管理、经济系统 | `ShooterGameMode`, `ShooterGameState`, `ShooterPlayerState`, `ShooterPlayerController` |
| **Character** | FPS 角色控制、动画状态机、姿态系统 | `ShooterCharacter`, `ShooterAnimInstance`, `ShooterMovementComponent` |
| **Weapon** | 弹道模拟、武器参数、换弹/切换/开火模式 | `ShooterWeapon`, `ShooterWeaponComponent`, `ShooterBallistics`, `ShooterDamageType`, `ShooterProjectile` |
| **AI** | 感知系统、行为树、战术决策、难易度调节 | `ShooterAIController`, `ShooterAIBot`, `ShooterBTTask_FindCover`, `ShooterBTTask_Shoot`, `ShooterBTDecorator_CheckHealth` |
| **Environment** | 可破坏物、互动物体、地图要素 | `ShooterDestructibleActor`, `ShooterInteractableActor` |
| **Effects** | 命中效果、弹孔贴花、粒子系统 | `ShooterImpactManager`, `ShooterDecal`, `ShooterHitFX` |
| **UI** | HUD、准星、弹药指示器、伤害反馈 | `ShooterHUD`, `ShooterDamageIndicator` |
| **Render** | 渲染管线配置、后处理、环境光 | `ShooterRenderSettings` |

### 3.5 网络同步策略

| 属性 | 同步方式 | 更新频率 |
|------|---------|---------|
| 位置/旋转 | `ReplicatedUsing` + 插值 | 30Hz 采样 |
| 弹药数 | `Replicated` + 条件复制 | On Change |
| 血量 | `ReplicatedUsing` + 委托 | On Change |
| 武器状态 | `Replicated` (Enum) | On State Change |
| AI 行为 | Server Authoritative | 10Hz |
| 弹道命中 | Multicast RPC | Per Shot |

---

## 4. 依赖与外部引用

### 4.1 必需插件
- `ChaosPhysics` / `ChaosDestruction`
- `EnhancedInput`
- `Niagara`
- `AIModule`
- `UMG`
- `AudioModulation` (MetaSounds)

### 4.2 推荐资产商店内容
- Quixel Megascans (PBR 材质 / 高模资产)
- MetaHuman Animator (角色动画)
- BOOM Interactive 武器包 (高精度武器模型)

---

## 5. 构建配置

### 5.1 目标平台
- **Windows (DX12)** — 主要开发平台
- **Xbox Series X|S** — 次时代主机
- **PlayStation 5** — 预留扩展

### 5.2 编译配置
```ini
[Core.System]
UnrealBuildTool=Default
bWarningsAsErrors=true

[Core.Log]
GlobalLogLevel=Log
```
