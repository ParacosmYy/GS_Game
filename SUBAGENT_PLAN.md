# GS_TacticalShooter — 多 Subagent 并行协同开发方案

## 1. 总体协作架构

```
┌──────────────────────────────────────────────────────────┐
│                     Lead Orchestrator                    │
│               [代码审查 / 集成 / 冲突解决]                │
├──────────┬──────────┬──────────┬──────────┬─────────────┤
│Agent-A   │Agent-B   │Agent-C   │Agent-D   │ Agent-E     │
│Core      │Character │Weapon    │AI        │ Render+Env  │
│GameLoop  │Anim+Ctrl │Ballistics│Behavior  │ Effects+UI  │
│Economy   │Movement  │Damage    │Perception│ Config      │
└──────────┴──────────┴──────────┴──────────┴─────────────┘
```

---

## 2. 各 Subagent 分工

### Agent-A：Core 系统
**负责文件：**
| 文件 | 路径 |
|------|------|
| `ShooterGameMode.h/.cpp` | `Core/` |
| `ShooterGameState.h/.cpp` | `Core/` |
| `ShooterPlayerState.h/.cpp` | `Core/` |
| `ShooterPlayerController.h/.cpp` | `Core/` |

**具体任务：**
1. 实现 `AShooterGameMode` — 回合循环（FreezeTime → Action → RoundEnd）、队伍分配、胜利条件
2. 实现 `AShooterGameState` — 网络同步的回合数、队伍比分、当前阶段
3. 实现 `AShooterPlayerState` — 经济系统（起始 $800、击杀奖励、连败补偿）、KDA 追踪、装备清单
4. 实现 `AShooterPlayerController` — Enhanced Input 绑定、HUD 创建、Ragdoll/摄像机过渡

**产出接口：**
```cpp
// --- 外部接口（被其他 Agent 引用）---
// 回合状态枚举
UENUM()
enum class ERoundPhase : uint8 {
    FreezeTime, Action, RoundEnd, HalfTime, MatchOver
};

// GameMode 接口
UFUNCTION(BlueprintAuthorityOnly)
void StartNewRound();
UFUNCTION(BlueprintPure)
ERoundPhase GetCurrentPhase() const;

// PlayerState 接口
void AddKill(AActor* Victim);
void AddMoney(int32 Amount);
bool SpendMoney(int32 Amount);
int32 GetCurrentMoney() const;
```

---

### Agent-B：Character 模块
**负责文件：**
| 文件 | 路径 |
|------|------|
| `ShooterCharacter.h/.cpp` | `Character/` |
| `ShooterAnimInstance.h/.cpp` | `Character/` |

**具体任务：**
1. 实现 `AShooterCharacter` — FPS 相机、武器 socket 附着点、血量/护甲系统、姿态（站立/蹲伏/冲刺/ADS）
2. 实现 `UShooterAnimInstance` — 动画状态机（Idle/Walk/Run/Jump/ADS/Reload/Hit/Death），武器类型混合空间，手部 IK
3. 实现 `UShooterMovementComponent` — 不同武器/姿态下的移动速度修正、爬坡

**产出接口：**
```cpp
// --- 外部接口 ---
// Character 公开方法
void EquipWeapon(AShooterWeapon* Weapon);
void UnequipWeapon();
void PlayHitReaction(const FVector& HitDirection);
void Die(AController* Killer);

// Character 状态枚举
UENUM()
enum class ECharacterPose : uint8 {
    Standing, Crouching, Prone
};

UENUM()
enum class EMovementState : uint8 {
    Idle, Walking, Running, Sprinting, ADS_Walking
};
```

---

### Agent-C：Weapon 系统
**负责文件：**
| 文件 | 路径 |
|------|------|
| `ShooterWeapon.h/.cpp` | `Weapon/` |
| `ShooterWeaponComponent.h/.cpp` | `Weapon/` |
| `ShooterBallistics.h/.cpp` | `Weapon/` |
| `ShooterDamageType.h` | `Weapon/` |

**具体任务：**
1. 实现 `AShooterWeapon` — 武器属性（伤害、射速、弹夹容量、换弹时间、后座力模式、弹道散布），开火模式（Semi/Burst/Auto），弹药管理
2. 实现 `UShooterWeaponComponent` — 武器插槽（主/副武器）、切换逻辑、委托通知
3. 实现 `FBallisticsSolver` — 弹道模拟（重力下落、速度衰减、穿墙穿透、跳弹计算）
4. 实现 `UDamageType` — 伤害类型（穿透式/钝击/爆炸），护甲系数

**产出接口：**
```cpp
// --- 外部接口 ---
struct FWeaponStats {
    float BaseDamage;
    float HeadshotMultiplier;     // 1.4x CS2 风格
    float ArmorPenetration;       // 0-1
    float FireRate;               // rounds/min
    int32 MagazineSize;
    float ReloadTime;
    float Spread_Stand;           // 站立散布
    float Spread_Crouch;          // 蹲下散布
    float Spread_ADS;             // 瞄准散布
    FVector2D RecoilPattern;      // 后座力模式 (X:垂直 Y:水平)
};

// 弹道求解器
static FBallisticHitResult SolveBallistic(
    const FVector& StartPos,
    const FVector& Direction,
    float InitialSpeed,
    float GravityScale,
    float Damage,
    float PenetrationPower,
    UWorld* World
);
```

---

### Agent-D：AI 系统
**负责文件：**
| 文件 | 路径 |
|------|------|
| `ShooterAIController.h/.cpp` | `AI/` |
| `ShooterAIBot.h/.cpp` | `AI/` |
| `ShooterBTTasks.h/.cpp` | `AI/` |
| `ShooterBTDecorators.h/.cpp` | `AI/` |

**具体任务：**
1. 实现 `AShooterAIController` — AI 感知配置（视觉/听觉/伤害）、Behavior Tree 加载
2. 实现 `AShooterAIBot` — AI 角色（继承 Character），技能水平参数（精准度、反应时间、战术倾向）
3. 实现自定义 BTTask（FindCover、Flank、HoldPosition、ThrowGrenade）
4. 实现 BTDecorator（CheckHealth、CheckEnemyVisible、CheckAmmo）

**产出接口：**
```cpp
// --- 外部接口 ---
USTRUCT()
struct FAISkillLevel {
    float AimAccuracy;        // 0-1: 弹道散布缩放
    float ReactionTime;       // 秒: 反应延迟
    float Aggression;         // 0-1: 激进/保守
    float UtilityUsage;       // 0-1: 投掷物使用频率
};

// AI 感知事件
UFUNCTION()
void OnTargetPerceived(AActor* Target);
UFUNCTION()
void OnDamageTaken(AActor* DamagedActor, float Damage);
```

---

### Agent-E：渲染/环境/效果/UI
**负责文件：**
| 文件 | 路径 |
|------|------|
| `ShooterDestructibleActor.h/.cpp` | `Environment/` |
| `ShooterImpactManager.h/.cpp` | `Effects/` |
| `ShooterHUD.h/.cpp` | `UI/` |
| `ShooterRenderSettings.h/.cpp` | `Render/` |
| `DefaultEngine.ini` | `Config/` |
| `DefaultGame.ini` | `Config/` |

**具体任务：**
1. 实现 `AShooterDestructibleActor` — Chaos 破坏系统包装，支持可破坏门窗/掩体
2. 实现 `UShooterImpactManager` — 材质感知的弹孔贴花、粒子特效、冲击声
3. 实现 `AShooterHUD` — 准星动态缩放、弹药计数、血量/护甲条、伤害方向指示器
4. 实现 `UShooterRenderSettings` — 运行时 Lumen/RT 参数调节、后处理体积控制
5. 配置 Engine.ini — Lumen 参数、Ray Tracing 开关、Nanite 配置

---

## 3. 接口定义与共享契约

### 3.1 全局枚举

```cpp
// === SharedEnums.h (所有模块引用) ===
UENUM(BlueprintType)
enum class ETeamSide : uint8 {
    Terrorist     UMETA(DisplayName="T"),
    CounterTerrorist UMETA(DisplayName="CT"),
    Spectator
};

UENUM(BlueprintType)
enum class EWeaponSlot : uint8 {
    Primary, Secondary, Knife, Grenade
};

UENUM(BlueprintType)
enum class EFireMode : uint8 {
    Semi, Burst, Auto
};
```

### 3.2 共享数据结构

```cpp
// === SharedTypes.h ===
USTRUCT(BlueprintType)
struct FBallisticHitResult {
    GENERATED_BODY()
    UPROPERTY() AActor* HitActor;
    UPROPERTY() UPrimitiveComponent* HitComponent;
    UPROPERTY() FVector Location;
    UPROPERTY() FVector Normal;
    UPROPERTY() FVector ExitLocation;     // 穿透出口
    UPROPERTY() float PenetrationDepth;
    UPROPERTY() bool bPenetrated;
    UPROPERTY() float FinalDamage;
    UPROPERTY() uint8 ImpactMaterialIndex; // 用于 ImpactManager
};

USTRUCT(BlueprintType)
struct FDamageInfo {
    GENERATED_BODY()
    UPROPERTY() float BaseDamage;
    UPROPERTY() float HeadshotMultiplier;
    UPROPERTY() float ArmorPenetration;
    UPROPERTY() float Distance;
    UPROPERTY() AActor* DamageCauser;
    UPROPERTY() AController* Instigator;
    UPROPERTY() FName BoneName;
};
```

---

## 4. 协作机制

### 4.1 开发流程

```
Phase 1 (Day 1-2): 所有 Agent 并行创建 .h 文件
    → Lead 收集 Header 做接口一致性审查
Phase 2 (Day 2-4): 各 Agent 并行实现 .cpp
    → 依赖 API 先 Mock/Stub 保证编译
Phase 3 (Day 4-5): 集成测试
    → Lead 编译全部模块，运行基础功能测试
Phase 4 (Day 5-6): 性能优化 + Bug Fix
    → Agent-A/E 主攻渲染性能，其他 Agent 修复逻辑缺陷
```

### 4.2 通信规则

| 场景 | 机制 |
|------|------|
| 接口变更 | 更新 `SharedTypes.h` 并向相关 Agent 发送消息 |
| 编译错误 | 截图/日志 → Lead 仲裁修复 |
| 性能 Regression | 记录 CPU/GPU Profile → 对应 Agent 优化 |
| 设计分歧 | Lead 做最终决策 |

### 4.3 Mock/Stub 规则

当 Agent 依赖的接口尚未就绪时：
```cpp
// 接口适配器模式
class FWeaponInterfaceProxy {
    static AShooterWeapon* GetEquippedWeapon_Stub() {
        return nullptr; // Phase 2 由 Agent-C 实现
    }
};
```
所有 Stub 必须在 Phase 2 结束时替换为真实实现。

---

## 5. 质量门禁

| 检查项 | 工具 | 通过条件 |
|--------|------|---------|
| 编译 | MSBuild / UBT | 0 Error |
| 规范 | VS Analyzer + .editorconfig | 0 Warning (除 deprecated) |
| 性能 | Unreal Insights | Tick ≤ 2ms（Server）/33ms（Client） |
| 网络 | Network Profiler | 带宽 ≤ 64kb/s per client |
| 内存 | LLM | 总内存 ≤ 4GB |
