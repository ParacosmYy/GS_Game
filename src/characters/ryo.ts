/**
 * 坂崎亮 (Ryo Sakazaki) — 角色定义
 *
 * 必杀技:
 *   QCF+A/C → 虎煌 (projectile, weak/strong)
 *   DP+A/C  → 虎咆 (upper, weak/strong)
 *   QCB+K   → 飛燕疾風脚 (overhead kick)
 *   QCF+K   → 霸王翔吼拳 (counter)
 * DM: QCF×2+P → 天地霸煌拳
 */
import type { CharacterDefinition, Pose } from './types.js';
import { pose, bone } from './types.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import type { CommandBuffer } from '../input/commandBuffer.js';
import { FighterState, AttackType } from '../core/types.js';
import { Projectile } from '../entities/projectile.js';
import { FRAME_DATA } from '../core/constants.js';
import { ryoPortrait } from '../rendering/portraits/ryoPortrait.js';

export const RyoDef: CharacterDefinition = {
  id: 'ryo',
  name: 'Ryo Sakazaki',
  nameCn: '坂崎亮',
  color: '#dd6600',
  accentColor: '#ff8822',
  specialColor: '#ffcc00',
  specialGlow: '#ffaa00',
  portrait: '👊',
  pixelPortrait: ryoPortrait,
  winQuotes: ['極限流空手、恐るるに足らず', 'まだ修行が足りんな', '虎の拳を見たか!'],
  moveList: [
    // 命令通常技
    { name: '冰柱割り', input: '→ + A', type: 'command' },
    { name: '落蹴', input: '↘ + B', type: 'command' },
    // 必杀技
    { name: '虎煌拳（こおうけん）', input: '↓↘→ + A / C', type: 'special' },
    { name: '虎咆（こほう）', input: '→↓↘ + A / C', type: 'special' },
    { name: '飛燕疾風脚（ひえんしっぷうきゃく）', input: '←↙↓ + K', type: 'special' },
    { name: '霸王翔吼拳（はおうしょうこうけん）', input: '↓↘→ + K', type: 'special' },
    // 超必杀技
    { name: '天地霸煌拳', input: '↓↘→↓↘→ + A / C', type: 'dm' },
    { name: '龍虎乱舞', input: '↓↘→↘↓↙← + A / C', type: 'dm' },
    // MAX超必杀技
    { name: '天地霸煌拳（MAX）', input: '↓↘→↓↘→ + AC', type: 'sdm' },
    { name: '龍虎乱舞（MAX）', input: '↓↘→↘↓↙← + AC', type: 'sdm' },
    // 系统
    { name: '爆气', input: 'K+U / O（快捷）', type: 'system' },
  ],

  stats: {
    walkSpeed: 4,
    runSpeed: 7,
    jumpVelocity: -14,
    hopVelocity: -10,
    hyperJumpVelocity: -17,
    maxHealth: 1000,
    pushWidth: 60,
    jumpForwardSpeed: 5,
    closeRange: 88,
    throwRange: 108,
  },

  poses: {
    [FighterState.IDLE]: [
      // Frame 0: 极限流空手宽站姿 — 前拳收胸，后拳护颌，双脚宽于肩，重心居中
      pose({ head: bone(1, 0, -0.03), body: bone(0, 0, -0.06), armFront: bone(14, 4, 0.45), armBack: bone(-4, 2, -0.6), legFront: bone(10, 0, 0.08), legBack: bone(-8, 0, -0.06) }),
      // Frame 1: 吸气开始 — 身体微升，前拳微张，后拳收紧
      pose({ head: bone(1, -1, -0.03), body: bone(0, -1, -0.05), armFront: bone(14, 3, 0.42), armBack: bone(-4, 1, -0.58), legFront: bone(10, -1, 0.06), legBack: bone(-8, -1, -0.05) }),
      // Frame 2: 吸气巅峰 — 最大上升，前拳前伸蓄力，后拳贴颌
      pose({ head: bone(1, -1, -0.04), body: bone(0, -2, -0.04), armFront: bone(15, 2, 0.38), armBack: bone(-3, 0, -0.55), legFront: bone(9, -1, 0.05), legBack: bone(-7, -1, -0.04) }),
      // Frame 3: 屏息 — 短暂紧张保持，重心微沉，拳位稳定
      pose({ head: bone(1, -1, -0.03), body: bone(0, -2, -0.06), armFront: bone(14, 3, 0.44), armBack: bone(-4, 1, -0.58), legFront: bone(10, -1, 0.07), legBack: bone(-8, -1, -0.05) }),
      // Frame 4: 呼气开始 — 身体回落，重心开始下沉
      pose({ head: bone(1, 0, -0.03), body: bone(0, -1, -0.06), armFront: bone(14, 4, 0.45), armBack: bone(-4, 2, -0.6), legFront: bone(10, 0, 0.08), legBack: bone(-8, 0, -0.06) }),
      // Frame 5: 呼气下沉 — 重心下沉，扎根地面，前拳微回收
      pose({ head: bone(1, 1, -0.02), body: bone(0, 1, -0.07), armFront: bone(13, 5, 0.46), armBack: bone(-5, 3, -0.62), legFront: bone(10, 1, 0.1), legBack: bone(-8, 1, -0.07) }),
      // Frame 6: 呼气完成 — 最大下沉，力量沉稳，腿微屈
      pose({ head: bone(1, 1, -0.02), body: bone(0, 2, -0.07), armFront: bone(13, 6, 0.47), armBack: bone(-5, 4, -0.63), legFront: bone(11, 1, 0.1), legBack: bone(-9, 1, -0.07) }),
      // Frame 7: 微重置 — 重心回升过渡，准备回到Frame 0
      pose({ head: bone(1, 0, -0.03), body: bone(0, 1, -0.06), armFront: bone(14, 5, 0.46), armBack: bone(-4, 3, -0.61), legFront: bone(10, 1, 0.09), legBack: bone(-8, 1, -0.06) }),
    ],
    [FighterState.WALK]: [
      // Frame 0: 左脚前迈，重心在后脚，前手护胸后手收腰
      pose({ body: bone(0, -1, -0.03), armFront: bone(10, 10, 0.25), armBack: bone(-5, 18, -0.35), legFront: bone(12, -2, 0.18), legBack: bone(-4, 2, -0.1) }),
      // Frame 1: 过渡步 — 双脚并拢经过，身体微升
      pose({ body: bone(0, 0, -0.04), armFront: bone(11, 9, 0.28), armBack: bone(-6, 17, -0.38), legFront: bone(8, 0, 0.08), legBack: bone(-6, 0, -0.06) }),
      // Frame 2: 右脚前迈，重心在前脚，手臂交替摆动
      pose({ body: bone(0, -1, -0.03), armFront: bone(11, 11, 0.27), armBack: bone(-5, 19, -0.36), legFront: bone(5, 2, -0.12), legBack: bone(-12, -2, 0.18) }),
      // Frame 3: 过渡步 — 双脚并拢经过，身体微升
      pose({ body: bone(0, 0, -0.04), armFront: bone(11, 9, 0.28), armBack: bone(-6, 17, -0.38), legFront: bone(7, 0, -0.06), legBack: bone(-7, 0, 0.08) }),
      // Frame 4: 左脚再次前迈，周期重复
      pose({ body: bone(0, -1, -0.03), armFront: bone(10, 10, 0.25), armBack: bone(-5, 18, -0.35), legFront: bone(12, -2, 0.18), legBack: bone(-4, 2, -0.1) }),
      // Frame 5: 归位过渡 — 回到中立站姿准备循环
      pose({ body: bone(0, 0, -0.04), armFront: bone(12, 8, 0.3), armBack: bone(-6, 18, -0.4), legFront: bone(8, 0, 0.05), legBack: bone(-6, 0, -0.05) }),
    ],
    [FighterState.RUN]: [
      // Frame 0: 深前倾冲刺 — 前腿大步迈出，后腿蹬地，前臂后摆后臂前摆
      pose({ body: bone(6, -2, -0.15), armFront: bone(-4, 20, -0.7), armBack: bone(14, 16, 0.5), legFront: bone(16, -6, 0.4), legBack: bone(-10, 4, -0.3), head: bone(2, 0, -0.08) }),
      // Frame 1: 腾空过渡 — 双脚离地瞬间，身体最低点
      pose({ body: bone(4, 0, -0.12), armFront: bone(2, 18, -0.4), armBack: bone(8, 20, 0.2), legFront: bone(10, 2, 0.15), legBack: bone(-8, 0, -0.1), head: bone(1, 0, -0.06) }),
      // Frame 2: 反向大步 — 后腿变前腿大步迈出，手臂交替
      pose({ body: bone(6, -2, -0.15), armFront: bone(14, 16, 0.5), armBack: bone(-4, 20, -0.7), legFront: bone(-10, 4, -0.3), legBack: bone(16, -6, 0.4), head: bone(2, 0, -0.08) }),
      // Frame 3: 腾空过渡 — 双脚离地回位
      pose({ body: bone(4, 0, -0.12), armFront: bone(8, 20, 0.2), armBack: bone(2, 18, -0.4), legFront: bone(-8, 0, -0.1), legBack: bone(10, 2, 0.15), head: bone(1, 0, -0.06) }),
    ],
    [FighterState.CROUCH]: pose({
      body: bone(0, 18, 0.08),
      head: bone(0, 14),
      armFront: bone(10, 22, 0.05),
      armBack: bone(-6, 20, -0.2),
      legFront: bone(10, 0, 0.48),
      legBack: bone(-8, 0, -0.38),
    }),
    [FighterState.BLOCK]: [
      // Frame 0: Guard up — arms crossed in front, body braced for impact
      pose({ head: bone(-1, 1, -0.04), body: bone(-1, 1, 0.05), armFront: bone(-2, 4, 0.8), armBack: bone(-8, 6, -0.6), legFront: bone(6, 0, 0.05), legBack: bone(-5, 0, -0.08) }),
      // Frame 1: Impact absorption — slight pushback, arms tighten against body
      pose({ head: bone(-2, 2, -0.06), body: bone(-3, 2, 0.08), armFront: bone(-4, 3, 0.85), armBack: bone(-10, 5, -0.65), legFront: bone(5, 1, 0.08), legBack: bone(-6, 1, -0.1) }),
      // Frame 2: Holding guard — stable defensive position, arms locked
      pose({ head: bone(-1, 1, -0.03), body: bone(-2, 1, 0.06), armFront: bone(-3, 4, 0.82), armBack: bone(-9, 5, -0.62), legFront: bone(6, 0, 0.06), legBack: bone(-5, 0, -0.08) }),
      // Frame 3: Guard recovery — preparing to counter, arms start opening
      pose({ head: bone(0, 0, -0.02), body: bone(-1, 0, 0.03), armFront: bone(0, 6, 0.5), armBack: bone(-6, 7, -0.45), legFront: bone(5, 0, 0.04), legBack: bone(-5, 0, -0.06) }),
    ],
    // COUNTER_STANCE: 4 frames — enter stance → ready → still ready → counter activation
    [FighterState.COUNTER_STANCE]: [
      // Frame 0: Enter stance — arms go to defensive position, body lowers
      pose({ head: bone(0, 2, -0.05), body: bone(0, 4, 0.08), armFront: bone(-2, 8, 0.3), armBack: bone(-6, 10, -0.5), legFront: bone(8, 2, 0.15), legBack: bone(-6, 2, -0.2) }),
      // Frame 1: Ready — hands in defensive catch position, waiting for opponent attack
      pose({ head: bone(0, 2, -0.04), body: bone(0, 5, 0.1), armFront: bone(0, 6, 0.2), armBack: bone(-5, 8, -0.45), legFront: bone(8, 3, 0.18), legBack: bone(-7, 3, -0.22) }),
      // Frame 2: Still ready — subtle tension, body braced for impact
      pose({ head: bone(0, 3, -0.05), body: bone(-1, 5, 0.1), armFront: bone(-1, 7, 0.25), armBack: bone(-5, 9, -0.48), legFront: bone(7, 3, 0.16), legBack: bone(-7, 3, -0.21) }),
      // Frame 3: Counter activation — explosive response pose, arms thrust forward
      pose({ head: bone(2, 0, -0.06), body: bone(3, 2, 0.12), armFront: bone(18, 4, 0.15, 1.2), armBack: bone(-4, 8, -0.35, 1.1), legFront: bone(6, 1, 0.1), legBack: bone(-6, 1, -0.15) }),
    ],
    // HITSTUN: 5 frames — impact → recoil → peak stagger → recovery start → guard reforming
    [FighterState.HITSTUN]: [
      // Frame 0: Impact shock — body snaps backward violently, head whiplash, arms thrown wide from blow force
      pose({ body: bone(-8, 3, -0.22), head: bone(-6, 4, -0.4), armFront: bone(-4, 20, 0.85), armBack: bone(-14, 18, 0.95), legFront: bone(6, 1, -0.1), legBack: bone(-8, 4, 0.15) }),
      // Frame 1: Recoil peak — maximum backward arch, head fully snapped back, arms splayed from impact
      pose({ body: bone(-12, 5, -0.35), head: bone(-10, 7, -0.55), armFront: bone(-2, 22, 1.0), armBack: bone(-16, 20, 1.1), legFront: bone(8, 3, -0.15), legBack: bone(-10, 6, 0.2) }),
      // Frame 2: Stagger hold — body held at furthest lean, shock still visible in pose
      pose({ body: bone(-9, 4, -0.28), head: bone(-7, 5, -0.42), armFront: bone(-6, 20, 0.75), armBack: bone(-12, 17, 0.85), legFront: bone(6, 2, -0.1), legBack: bone(-8, 4, 0.12) }),
      // Frame 3: Recovery start — body pulling forward, arms retracting, regaining balance
      pose({ body: bone(-5, 2, -0.15), head: bone(-3, 3, -0.22), armFront: bone(-2, 18, 0.45), armBack: bone(-8, 15, 0.55), legFront: bone(5, 1, -0.06), legBack: bone(-6, 2, 0.06) }),
      // Frame 4: Guard reforming — nearly upright, arms returning to fighting stance
      pose({ body: bone(-2, 1, -0.07), head: bone(-1, 1, -0.1), armFront: bone(4, 16, 0.15), armBack: bone(-6, 14, -0.2), legFront: bone(5, 0, 0.02), legBack: bone(-5, 0, -0.02) }),
    ],
    // KNOCKDOWN: 6 frames — hit launch → airborne flip → peak rotation → ground slam → bounce → lying flat
    [FighterState.KNOCKDOWN]: [
      // Frame 0: Launch impact — body blasted upward and backward, limbs splayed from violent hit
      pose({ body: bone(-6, 6, 0.3), head: bone(-8, 8, 0.45), armFront: bone(-10, 14, 0.7), armBack: bone(6, 12, -0.5), legFront: bone(-4, 4, -0.2), legBack: bone(2, 6, 0.25) }),
      // Frame 1: Rising flip — body ascending and rotating, legs tucking as momentum carries upward
      pose({ body: bone(-3, 14, 0.6), head: bone(-2, 16, 0.7), armFront: bone(-12, 20, 0.6), armBack: bone(8, 18, -0.55), legFront: bone(-8, 12, -0.35), legBack: bone(4, 14, 0.4) }),
      // Frame 2: Peak airborne rotation — body fully horizontal at apex, maximum rotation
      pose({ body: bone(0, 20, 0.95), head: bone(4, 24, 1.0), armFront: bone(-6, 24, 0.55), armBack: bone(10, 22, -0.6), legFront: bone(-12, 20, -0.35), legBack: bone(8, 22, 0.45) }),
      // Frame 3: Ground slam — body crashes down, violent impact, limbs bounce from force
      pose({ body: bone(3, 30, 1.35), head: bone(10, 34, 1.25), armFront: bone(2, 32, 0.5), armBack: bone(12, 28, -0.5), legFront: bone(-14, 30, -0.4), legBack: bone(10, 32, 0.5) }),
      // Frame 4: Settle from bounce — body flattening, momentum dissipating
      pose({ body: bone(2, 34, 1.45), head: bone(8, 37, 1.35), armFront: bone(3, 34, 0.25), armBack: bone(10, 30, -0.35), legFront: bone(-8, 34, -0.2), legBack: bone(8, 36, 0.3) }),
      // Frame 5: Lying flat on ground — motionless, body nearly horizontal
      pose({ body: bone(0, 38, 1.5), head: bone(6, 40, 1.4), armFront: bone(4, 36, 0.1), armBack: bone(8, 32, -0.25), legFront: bone(-4, 38, -0.08), legBack: bone(6, 38, 0.15) }),
    ],
    [FighterState.JUMP]: [
      // Frame 0: Launch — legs push off ground, body stretches upward, arms raised overhead
      pose({ body: bone(2, -4, -0.08), head: bone(2, -6, -0.1), armFront: bone(12, -8, -0.5), armBack: bone(-8, -6, 0.5), legFront: bone(6, 2, 0.3), legBack: bone(-6, 4, -0.35) }),
      // Frame 1: Rising — body tucking, knees pulling up, arms drawing in toward sides
      pose({ body: bone(1, -6, -0.04), head: bone(1, -5, -0.06), armFront: bone(10, 2, 0.15), armBack: bone(-6, 0, -0.1), legFront: bone(4, -6, 0.45), legBack: bone(-5, -4, -0.5) }),
      // Frame 2: Apex — body at peak compactness, knees highest, coiled tight in air
      pose({ body: bone(0, -5, -0.02), head: bone(0, -4, -0.04), armFront: bone(8, 4, 0.2), armBack: bone(-6, 2, -0.15), legFront: bone(3, -8, 0.55), legBack: bone(-4, -6, -0.55) }),
      // Frame 3: Descending — legs extending for landing, body leaning forward, arms brace
      pose({ body: bone(3, -3, 0.02), head: bone(2, -2, 0.0), armFront: bone(10, 6, 0.3), armBack: bone(-6, 4, -0.25), legFront: bone(5, -2, 0.2), legBack: bone(-5, 0, -0.25) }),
    ],
    // ── Attack poses (Kyokugenryu: rooted stance, powerful linear punches, deep horse stance) ──
    //
    // Multi-frame animation arrays. The renderer indexes by f.attackFrame within each phase
    // (startup / active / recovery), so the array must be long enough for the longest phase
    // across all attacks that share this state.
    //
    // STAND_ATTACK covers: STAND_A/B/C/D, CLOSE_A/B/C/D, RYO specials, DM_TEN_HA_OU, SDM_TEN_HA_OU
    //
    // The renderer indexes by attackFrame within each phase (startup/active/recovery),
    // resetting attackFrame to 0 at each phase transition. The pose array must be long
    // enough to cover the max single-phase frame count across ALL attacks sharing this state.
    //
    //   Max startup = 18 (DM_TEN_HA_OU)
    //   Max active  = 22 (SDM_TEN_HA_OU)
    //   Max recovery = 35 (DM_TEN_HA_OU, SDM_TEN_HA_OU)
    //   → 35 frames total
    //
    // Frame layout (per-phase indexing, NOT cumulative):
    //   Index 0-17:  used during startup phases (up to 18 frames)
    //   Index 0-21:  used during active phases (up to 22 frames)
    //   Index 0-34:  used during recovery phases (up to 35 frames)
    //
    [FighterState.STAND_ATTACK]: [
      // ── Startup (frames 0-9): wind-up progression ──
      // F0: subtle weight shift — fists tighten, body coiled in kyokugen stance
      pose({ head: bone(1, 0, 0.02), body: bone(2, 0, 0.04), armFront: bone(10, 5, 0.4, 1.0), armBack: bone(-6, 4, -0.55, 0.95), legFront: bone(9, 0, 0.08), legBack: bone(-7, 0, -0.08) }),
      // F1: pull front fist back — begin torso rotation for punch, rear fist guards chin
      pose({ head: bone(1, 0, 0.02), body: bone(1, 0, 0.06), armFront: bone(6, 4, 0.35, 1.0), armBack: bone(-6, 3, -0.6, 0.95), legFront: bone(9, 0, 0.07), legBack: bone(-7, 0, -0.09) }),
      // F2: deeper wind-up — front arm pulled to chest, body twists to load power
      pose({ head: bone(1, 0, 0.03), body: bone(0, 1, 0.08), armFront: bone(4, 4, 0.3, 1.0), armBack: bone(-6, 3, -0.62, 0.95), legFront: bone(8, 1, 0.06), legBack: bone(-8, 0, -0.1) }),
      // F3: fully cocked — fist at hip, torso rotated, weight loaded on back leg
      pose({ head: bone(0, 1, 0.03), body: bone(-2, 2, 0.1), armFront: bone(2, 6, 0.2, 1.0), armBack: bone(-5, 4, -0.58, 0.95), legFront: bone(7, 1, 0.05), legBack: bone(-8, 1, -0.12) }),
      // F4: start unwinding — power transfers from back leg, hips drive forward
      pose({ head: bone(1, 0, 0.04), body: bone(0, 1, 0.08), armFront: bone(8, 4, 0.35, 1.05), armBack: bone(-5, 4, -0.58, 0.95), legFront: bone(8, 0, 0.07), legBack: bone(-8, 1, -0.1) }),
      // F5: accelerating forward — arm snapping out, body rotating
      pose({ head: bone(2, 0, 0.04), body: bone(3, 0, 0.1), armFront: bone(18, 2, 0.45, 1.08), armBack: bone(-5, 4, -0.55, 0.92), legFront: bone(9, 0, 0.1), legBack: bone(-8, 0, -0.1) }),
      // F6: approaching full speed — arm mostly extended, committed strike
      pose({ head: bone(2, 0, 0.05), body: bone(4, 0, 0.12), armFront: bone(24, 1, 0.5, 1.12), armBack: bone(-5, 5, -0.55, 0.9), legFront: bone(10, 0, 0.12), legBack: bone(-8, 0, -0.12) }),
      // F7: near peak extension — body fully committed to strike
      pose({ head: bone(3, 0, 0.05), body: bone(5, 0, 0.14), armFront: bone(30, 1, 0.55, 1.2), armBack: bone(-6, 5, -0.58, 0.9), legFront: bone(10, 0, 0.13), legBack: bone(-9, 0, -0.13) }),
      // F8: full wind-up for heavy attacks — maximal pull-back for rear hand power
      pose({ head: bone(3, 1, 0.05), body: bone(5, 1, 0.15), armFront: bone(32, 1, 0.56, 1.25), armBack: bone(-6, 5, -0.6, 0.9), legFront: bone(10, 0, 0.14), legBack: bone(-9, 0, -0.14) }),
      // F9: final startup frame — on the edge of contact, full power loaded
      pose({ head: bone(3, 0, 0.06), body: bone(6, 0, 0.16), armFront: bone(34, 0, 0.58, 1.28), armBack: bone(-6, 5, -0.62, 0.9), legFront: bone(10, 0, 0.14), legBack: bone(-9, 0, -0.14) }),
      // ── Active (frames 10-17): strike / contact / follow-through ──
      // F10: full extension — contact moment, maximum reach, arm horizontal
      pose({ head: bone(4, 1, 0.06), body: bone(6, 0, 0.18), armFront: bone(38, 0, 0.6, 1.35), armBack: bone(-6, 6, -0.65, 0.88), legFront: bone(10, 0, 0.15), legBack: bone(-9, 0, -0.15) }),
      // F11: peak impact — deepest kyokugen stance, arm at max reach
      pose({ head: bone(4, 1, 0.07), body: bone(7, 1, 0.2), armFront: bone(40, 1, 0.62, 1.35), armBack: bone(-6, 6, -0.68, 0.88), legFront: bone(11, 0, 0.16), legBack: bone(-10, 0, -0.16) }),
      // F12: follow-through — arm starts to slow, body weight transferring back
      pose({ head: bone(4, 1, 0.06), body: bone(6, 1, 0.18), armFront: bone(36, 1, 0.58, 1.3), armBack: bone(-6, 6, -0.65, 0.88), legFront: bone(10, 0, 0.15), legBack: bone(-9, 0, -0.15) }),
      // F13: early retraction — pulling back from full extension, guard reforming
      pose({ head: bone(3, 1, 0.05), body: bone(5, 0, 0.15), armFront: bone(30, 2, 0.5, 1.22), armBack: bone(-6, 5, -0.6, 0.9), legFront: bone(10, 0, 0.13), legBack: bone(-9, 0, -0.14) }),
      // F14: mid-retraction — arm returning to kyokugen guard
      pose({ head: bone(3, 0, 0.04), body: bone(4, 0, 0.12), armFront: bone(22, 3, 0.45, 1.15), armBack: bone(-5, 4, -0.58, 0.92), legFront: bone(9, 0, 0.11), legBack: bone(-8, 0, -0.11) }),
      // F15: late active — arm back to guard height, body settling
      pose({ head: bone(2, 0, 0.04), body: bone(3, 0, 0.1), armFront: bone(18, 4, 0.42, 1.08), armBack: bone(-5, 4, -0.55, 0.93), legFront: bone(9, 0, 0.1), legBack: bone(-8, 0, -0.1) }),
      // F16: final active — arm nearly back to ready position
      pose({ head: bone(2, 0, 0.03), body: bone(3, 0, 0.08), armFront: bone(16, 4, 0.44, 1.04), armBack: bone(-5, 3, -0.58, 0.94), legFront: bone(9, 0, 0.09), legBack: bone(-8, 0, -0.08) }),
      // F17: end active — back to neutral-ready kyokugen stance
      pose({ head: bone(1, 0, 0.02), body: bone(2, 0, 0.06), armFront: bone(14, 4, 0.45, 1.02), armBack: bone(-4, 3, -0.58, 0.95), legFront: bone(10, 0, 0.08), legBack: bone(-8, 0, -0.06) }),
      // ── Recovery (frames 18-34): return to idle ──
      // F18: settling, weight redistributing back to stance
      pose({ head: bone(1, 0, 0.02), body: bone(1, 1, 0.04), armFront: bone(14, 4, 0.45, 1.0), armBack: bone(-4, 2, -0.58, 0.96), legFront: bone(10, 0, 0.08), legBack: bone(-8, 1, -0.06) }),
      // F19: back to idle-like neutral
      pose({ head: bone(1, 0, 0.01), body: bone(0, 1, 0.02), armFront: bone(14, 4, 0.45, 1.0), armBack: bone(-4, 2, -0.6, 0.97), legFront: bone(10, 0, 0.08), legBack: bone(-8, 1, -0.06) }),
      // F20-F22: extended recovery for specials (KOOU recovery=34, DM recovery=35)
      pose({ head: bone(1, 0, 0.01), body: bone(0, 0, 0.02), armFront: bone(14, 4, 0.45, 1.0), armBack: bone(-4, 2, -0.6, 0.97), legFront: bone(10, 0, 0.08), legBack: bone(-8, 1, -0.06) }),
      pose({ head: bone(1, 0, 0.01), body: bone(0, 0, 0.02), armFront: bone(14, 4, 0.45, 1.0), armBack: bone(-4, 2, -0.6, 0.97), legFront: bone(10, 0, 0.08), legBack: bone(-8, 1, -0.06) }),
      pose({ head: bone(1, 0, 0.01), body: bone(0, 0, 0.02), armFront: bone(14, 4, 0.45, 1.0), armBack: bone(-4, 2, -0.6, 0.97), legFront: bone(10, 0, 0.08), legBack: bone(-8, 1, -0.06) }),
      // F23-F26: mid recovery
      pose({ head: bone(1, 0, 0.01), body: bone(0, 0, 0.02), armFront: bone(14, 4, 0.45, 1.0), armBack: bone(-4, 2, -0.6, 0.97), legFront: bone(10, 0, 0.08), legBack: bone(-8, 1, -0.06) }),
      pose({ head: bone(1, 0, 0.01), body: bone(0, 0, 0.02), armFront: bone(14, 4, 0.45, 1.0), armBack: bone(-4, 2, -0.6, 0.97), legFront: bone(10, 0, 0.08), legBack: bone(-8, 1, -0.06) }),
      pose({ head: bone(1, 0, 0.01), body: bone(0, 0, 0.02), armFront: bone(14, 4, 0.45, 1.0), armBack: bone(-4, 2, -0.6, 0.97), legFront: bone(10, 0, 0.08), legBack: bone(-8, 1, -0.06) }),
      pose({ head: bone(1, 0, 0.01), body: bone(0, 0, 0.02), armFront: bone(14, 4, 0.45, 1.0), armBack: bone(-4, 2, -0.6, 0.97), legFront: bone(10, 0, 0.08), legBack: bone(-8, 1, -0.06) }),
      // F27-F30: late recovery
      pose({ head: bone(1, 0, 0.01), body: bone(0, 0, 0.02), armFront: bone(14, 4, 0.45, 1.0), armBack: bone(-4, 2, -0.6, 0.97), legFront: bone(10, 0, 0.08), legBack: bone(-8, 1, -0.06) }),
      pose({ head: bone(1, 0, 0.01), body: bone(0, 0, 0.02), armFront: bone(14, 4, 0.45, 1.0), armBack: bone(-4, 2, -0.6, 0.97), legFront: bone(10, 0, 0.08), legBack: bone(-8, 1, -0.06) }),
      pose({ head: bone(1, 0, 0.01), body: bone(0, 0, 0.02), armFront: bone(14, 4, 0.45, 1.0), armBack: bone(-4, 2, -0.6, 0.97), legFront: bone(10, 0, 0.08), legBack: bone(-8, 1, -0.06) }),
      pose({ head: bone(1, 0, 0.01), body: bone(0, 0, 0.02), armFront: bone(14, 4, 0.45, 1.0), armBack: bone(-4, 2, -0.6, 0.97), legFront: bone(10, 0, 0.08), legBack: bone(-8, 1, -0.06) }),
      // F31-F39: final recovery (DM_TEN_HA_OU recovery=40, SDM_TEN_HA_OU recovery=35)
      pose({ head: bone(1, 0, 0.01), body: bone(0, 0, 0.02), armFront: bone(14, 4, 0.45, 1.0), armBack: bone(-4, 2, -0.6, 0.97), legFront: bone(10, 0, 0.08), legBack: bone(-8, 1, -0.06) }),
      pose({ head: bone(1, 0, 0.01), body: bone(0, 0, 0.02), armFront: bone(14, 4, 0.45, 1.0), armBack: bone(-4, 2, -0.6, 0.97), legFront: bone(10, 0, 0.08), legBack: bone(-8, 1, -0.06) }),
      pose({ head: bone(1, 0, 0.01), body: bone(0, 0, 0.02), armFront: bone(14, 4, 0.45, 1.0), armBack: bone(-4, 2, -0.6, 0.97), legFront: bone(10, 0, 0.08), legBack: bone(-8, 1, -0.06) }),
      pose({ head: bone(1, 0, 0.01), body: bone(0, 0, 0.02), armFront: bone(14, 4, 0.45, 1.0), armBack: bone(-4, 2, -0.6, 0.97), legFront: bone(10, 0, 0.08), legBack: bone(-8, 1, -0.06) }),
      pose({ head: bone(1, 0, 0.01), body: bone(0, 0, 0.02), armFront: bone(14, 4, 0.45, 1.0), armBack: bone(-4, 2, -0.6, 0.97), legFront: bone(10, 0, 0.08), legBack: bone(-8, 1, -0.06) }),
      pose({ head: bone(1, 0, 0.01), body: bone(0, 0, 0.02), armFront: bone(14, 4, 0.45, 1.0), armBack: bone(-4, 2, -0.6, 0.97), legFront: bone(10, 0, 0.08), legBack: bone(-8, 1, -0.06) }),
      pose({ head: bone(1, 0, 0.01), body: bone(0, 0, 0.02), armFront: bone(14, 4, 0.45, 1.0), armBack: bone(-4, 2, -0.6, 0.97), legFront: bone(10, 0, 0.08), legBack: bone(-8, 1, -0.06) }),
      pose({ head: bone(1, 0, 0.01), body: bone(0, 0, 0.02), armFront: bone(14, 4, 0.45, 1.0), armBack: bone(-4, 2, -0.6, 0.97), legFront: bone(10, 0, 0.08), legBack: bone(-8, 1, -0.06) }),
      pose({ head: bone(1, 0, 0.01), body: bone(0, 0, 0.02), armFront: bone(14, 4, 0.45, 1.0), armBack: bone(-4, 2, -0.6, 0.97), legFront: bone(10, 0, 0.08), legBack: bone(-8, 1, -0.06) }),
    ],

    // CROUCH_ATTACK covers: CROUCH_A/B/C/D
    //   Max startup=7 (CROUCH_C), max active=6 (CROUCH_D), max recovery=31 (CROUCH_D)
    //   → 31 frames total
    //
    // Frame layout:
    //   0-6:   startup (crouch wind-up)
    //   7-12:  active  (crouch strike — punch/kick/uppercut/sweep)
    //   13-30: recovery (return to crouch neutral)
    //
    [FighterState.CROUCH_ATTACK]: [
      // ── Startup (frames 0-6): crouch attack wind-up ──
      // F0: crouch base, weight settling, slight arm tension
      pose({ head: bone(2, 13, 0.04), body: bone(2, 17, 0.06), armFront: bone(10, 19, 0.05, 1.0), armBack: bone(-6, 18, -0.25, 0.92), legFront: bone(12, 2, 0.36, 1.0), legBack: bone(-8, 8, -0.28) }),
      // F1: weight shifts to back leg, arm pulls back slightly
      pose({ head: bone(2, 13, 0.04), body: bone(1, 18, 0.07), armFront: bone(8, 19, 0.0, 1.0), armBack: bone(-7, 19, -0.32, 0.92), legFront: bone(11, 3, 0.34, 1.0), legBack: bone(-9, 9, -0.3) }),
      // F2: deeper crouch, arm pulling further back (body drops for power)
      pose({ head: bone(1, 14, 0.05), body: bone(0, 19, 0.09), armFront: bone(5, 19, -0.06, 1.0), armBack: bone(-7, 20, -0.38, 0.9), legFront: bone(10, 4, 0.32, 1.0), legBack: bone(-10, 10, -0.34) }),
      // F3: fully coiled — maximum wind-up, body compacted low
      pose({ head: bone(1, 15, 0.05), body: bone(-1, 20, 0.12), armFront: bone(3, 19, -0.1, 1.0), armBack: bone(-7, 21, -0.42, 0.88), legFront: bone(10, 5, 0.3, 1.0), legBack: bone(-10, 10, -0.36) }),
      // F4: beginning to uncoil, hips driving forward
      pose({ head: bone(2, 14, 0.05), body: bone(1, 19, 0.1), armFront: bone(8, 17, 0.02, 1.04), armBack: bone(-7, 20, -0.38, 0.9), legFront: bone(11, 4, 0.34, 1.02), legBack: bone(-9, 9, -0.32) }),
      // F5: accelerating hard, arm extending rapidly forward
      pose({ head: bone(3, 13, 0.06), body: bone(3, 18, 0.12), armFront: bone(14, 14, 0.12, 1.1), armBack: bone(-7, 19, -0.36, 0.88), legFront: bone(14, 3, 0.4, 1.06), legBack: bone(-10, 10, -0.34) }),
      // F6: near peak, arm/leg almost fully extended — last startup frame
      pose({ head: bone(3, 13, 0.06), body: bone(4, 17, 0.14), armFront: bone(20, 11, 0.18, 1.18), armBack: bone(-8, 18, -0.4, 0.86), legFront: bone(18, 2, 0.48, 1.1), legBack: bone(-11, 10, -0.36) }),
      // ── Active (frames 7-12): crouch strike contact ──
      // F7: full extension — CROUCH_A/B punch/kick reach, arm+leg stretched
      //   armFront ox=28: far forward for jab reach
      //   legFront ox=22, rot=0.55: sweeping leg extension for CROUCH_B/D
      pose({ head: bone(4, 12, 0.07), body: bone(5, 17, 0.16), armFront: bone(28, 8, 0.25, 1.25), armBack: bone(-9, 17, -0.5, 0.82), legFront: bone(22, 2, 0.55, 1.18), legBack: bone(-12, 10, -0.38) }),
      // F8: peak impact — maximum extension, body committed forward
      //   armFront ox=32, oy=4, rot=0.28: uppercut angle for CROUCH_C (negative rot = upward arc)
      //   legFront ox=26, rot=0.7: full sweep for CROUCH_D
      //   Both arm and leg reach maximum stretch — the visual system picks
      //   the active limb based on attack type in rendering
      pose({ head: bone(5, 11, 0.08), body: bone(6, 16, 0.18), armFront: bone(32, 4, 0.28, 1.32), armBack: bone(-9, 17, -0.55, 0.8), legFront: bone(26, 1, 0.7, 1.22), legBack: bone(-13, 11, -0.4) }),
      // F9: follow-through — power dissipating, slight overshoot
      pose({ head: bone(4, 12, 0.07), body: bone(5, 17, 0.16), armFront: bone(28, 7, 0.24, 1.22), armBack: bone(-8, 17, -0.48, 0.85), legFront: bone(22, 2, 0.52, 1.14), legBack: bone(-12, 10, -0.36) }),
      // F10: early retraction — pulling back from extended strike
      pose({ head: bone(3, 13, 0.06), body: bone(4, 18, 0.13), armFront: bone(20, 12, 0.16, 1.12), armBack: bone(-7, 18, -0.42, 0.9), legFront: bone(17, 3, 0.42, 1.06), legBack: bone(-10, 9, -0.32) }),
      // F11: mid-retraction, arms and legs returning to crouch guard
      pose({ head: bone(3, 13, 0.05), body: bone(3, 18, 0.1), armFront: bone(14, 16, 0.1, 1.04), armBack: bone(-7, 19, -0.36, 0.92), legFront: bone(14, 4, 0.38, 1.02), legBack: bone(-9, 9, -0.3) }),
      // F12: late active, settling toward crouch neutral
      pose({ head: bone(2, 14, 0.04), body: bone(2, 18, 0.09), armFront: bone(12, 18, 0.08, 1.01), armBack: bone(-6, 19, -0.3, 0.94), legFront: bone(12, 4, 0.35, 1.0), legBack: bone(-8, 9, -0.28) }),
      // ── Recovery (frames 13-30): progressive return to crouch neutral ──
      // Crouch neutral target: head(0,14) body(0,18,0.08) armFront(10,22,0.05) armBack(-6,20,-0.2) legFront(10,0,0.48) legBack(-8,0,-0.38)
      // F13: recovery start — body still slightly forward from attack
      pose({ head: bone(2, 14, 0.04), body: bone(2, 18, 0.08), armFront: bone(11, 19, 0.06, 1.0), armBack: bone(-6, 19, -0.28, 0.95), legFront: bone(11, 3, 0.38, 1.0), legBack: bone(-8, 8, -0.28) }),
      // F14: arms lowering to guard position
      pose({ head: bone(1, 14, 0.04), body: bone(1, 18, 0.08), armFront: bone(10, 20, 0.06, 1.0), armBack: bone(-6, 20, -0.25, 0.96), legFront: bone(10, 2, 0.4, 1.0), legBack: bone(-8, 6, -0.3) }),
      // F15: body centering, weight rebalancing
      pose({ head: bone(1, 14, 0.03), body: bone(1, 18, 0.08), armFront: bone(10, 21, 0.05, 1.0), armBack: bone(-6, 20, -0.22, 0.97), legFront: bone(10, 1, 0.42, 1.0), legBack: bone(-8, 4, -0.32) }),
      // F16: near crouch neutral, minor wobble
      pose({ head: bone(1, 14, 0.03), body: bone(0, 18, 0.08), armFront: bone(10, 21, 0.05, 1.0), armBack: bone(-6, 20, -0.21, 0.98), legFront: bone(10, 1, 0.44, 1.0), legBack: bone(-8, 2, -0.34) }),
      // F17-F20: settled into crouch neutral, holding guard
      pose({ head: bone(0, 14, 0.03), body: bone(0, 18, 0.08), armFront: bone(10, 22, 0.05, 1.0), armBack: bone(-6, 20, -0.2, 0.98), legFront: bone(10, 0, 0.46, 1.0), legBack: bone(-8, 0, -0.36) }),
      pose({ head: bone(0, 14, 0.03), body: bone(0, 18, 0.08), armFront: bone(10, 22, 0.05, 1.0), armBack: bone(-6, 20, -0.2, 0.99), legFront: bone(10, 0, 0.47, 1.0), legBack: bone(-8, 0, -0.37) }),
      pose({ head: bone(0, 14, 0.03), body: bone(0, 18, 0.08), armFront: bone(10, 22, 0.05, 1.0), armBack: bone(-6, 20, -0.2, 0.99), legFront: bone(10, 0, 0.48, 1.0), legBack: bone(-8, 0, -0.38) }),
      pose({ head: bone(0, 14, 0.03), body: bone(0, 18, 0.08), armFront: bone(10, 22, 0.05, 1.0), armBack: bone(-6, 20, -0.2, 1.0), legFront: bone(10, 0, 0.48, 1.0), legBack: bone(-8, 0, -0.38) }),
      // F21-F25: stable crouch idle with subtle breathing
      pose({ head: bone(0, 14, 0.03), body: bone(0, 18, 0.08), armFront: bone(10, 22, 0.05, 1.0), armBack: bone(-6, 20, -0.2, 1.0), legFront: bone(10, 0, 0.48, 1.0), legBack: bone(-8, 0, -0.38) }),
      pose({ head: bone(0, 14, 0.03), body: bone(0, 18, 0.08), armFront: bone(10, 22, 0.05, 1.0), armBack: bone(-6, 20, -0.2, 1.0), legFront: bone(10, 0, 0.48, 1.0), legBack: bone(-8, 0, -0.38) }),
      pose({ head: bone(0, 14, 0.03), body: bone(0, 18, 0.08), armFront: bone(10, 22, 0.05, 1.0), armBack: bone(-6, 20, -0.2, 1.0), legFront: bone(10, 0, 0.48, 1.0), legBack: bone(-8, 0, -0.38) }),
      pose({ head: bone(0, 14, 0.03), body: bone(0, 18, 0.08), armFront: bone(10, 22, 0.05, 1.0), armBack: bone(-6, 20, -0.2, 1.0), legFront: bone(10, 0, 0.48, 1.0), legBack: bone(-8, 0, -0.38) }),
      pose({ head: bone(0, 14, 0.03), body: bone(0, 18, 0.08), armFront: bone(10, 22, 0.05, 1.0), armBack: bone(-6, 20, -0.2, 1.0), legFront: bone(10, 0, 0.48, 1.0), legBack: bone(-8, 0, -0.38) }),
      // F26-F30: final recovery — crouch idle stable
      pose({ head: bone(0, 14, 0.03), body: bone(0, 18, 0.08), armFront: bone(10, 22, 0.05, 1.0), armBack: bone(-6, 20, -0.2, 1.0), legFront: bone(10, 0, 0.48, 1.0), legBack: bone(-8, 0, -0.38) }),
      pose({ head: bone(0, 14, 0.03), body: bone(0, 18, 0.08), armFront: bone(10, 22, 0.05, 1.0), armBack: bone(-6, 20, -0.2, 1.0), legFront: bone(10, 0, 0.48, 1.0), legBack: bone(-8, 0, -0.38) }),
      pose({ head: bone(0, 14, 0.03), body: bone(0, 18, 0.08), armFront: bone(10, 22, 0.05, 1.0), armBack: bone(-6, 20, -0.2, 1.0), legFront: bone(10, 0, 0.48, 1.0), legBack: bone(-8, 0, -0.38) }),
      pose({ head: bone(0, 14, 0.03), body: bone(0, 18, 0.08), armFront: bone(10, 22, 0.05, 1.0), armBack: bone(-6, 20, -0.2, 1.0), legFront: bone(10, 0, 0.48, 1.0), legBack: bone(-8, 0, -0.38) }),
      pose({ head: bone(0, 14, 0.03), body: bone(0, 18, 0.08), armFront: bone(10, 22, 0.05, 1.0), armBack: bone(-6, 20, -0.2, 1.0), legFront: bone(10, 0, 0.48, 1.0), legBack: bone(-8, 0, -0.38) }),
    ],

    // AIR_ATTACK covers: JUMP_A/B/C/D, JUMP_CD
    //   Max startup=12 (JUMP_CD), max active=9 (JUMP_A), recovery=0
    //   → 12 frames total
    //
    // Frame layout (per-phase indexing, NOT cumulative):
    //   Index 0-11: used during startup phases (up to 12 frames)
    //   Index 0-8:  used during active phases (up to 9 frames)
    //
    [FighterState.AIR_ATTACK]: [
      // ── Startup (frames 0-7): airborne wind-up ──
      // F0: neutral air position, starting to prepare strike
      pose({ head: bone(0, -1, -0.03), body: bone(1, 0, 0.04), armFront: bone(10, 6, 0.12, 1.0), armBack: bone(-6, 4, -0.3, 0.9), legFront: bone(5, -2, 0.1), legBack: bone(-5, 0, -0.15) }),
      // F1: arm begins to pull back, body tilts slightly
      pose({ head: bone(0, -1, -0.03), body: bone(1, 0, 0.06), armFront: bone(6, 6, 0.02, 1.0), armBack: bone(-8, 4, -0.4, 0.9), legFront: bone(4, -1, 0.08), legBack: bone(-6, 1, -0.18) }),
      // F2: arm cocked back, body rotated for power
      pose({ head: bone(0, -1, -0.04), body: bone(0, 0, 0.08), armFront: bone(3, 6, -0.08, 1.0), armBack: bone(-8, 5, -0.45, 0.9), legFront: bone(3, 0, 0.06), legBack: bone(-7, 1, -0.2) }),
      // F3: starting to extend, uncoiling
      pose({ head: bone(1, -1, -0.04), body: bone(2, 0, 0.08), armFront: bone(10, 3, 0.08, 1.05), armBack: bone(-8, 4, -0.4, 0.9), legFront: bone(6, 0, 0.15, 1.02), legBack: bone(-6, 0, -0.18) }),
      // F4: accelerating, arm extending rapidly
      pose({ head: bone(1, -1, -0.05), body: bone(3, 0, 0.1), armFront: bone(16, 0, 0.14, 1.1), armBack: bone(-9, 4, -0.42, 0.88), legFront: bone(8, 1, 0.2, 1.04), legBack: bone(-7, 0, -0.2) }),
      // F5: near full extension
      pose({ head: bone(1, -1, -0.06), body: bone(4, 0, 0.12), armFront: bone(20, -2, 0.2, 1.18), armBack: bone(-10, 3, -0.45, 0.88), legFront: bone(10, 2, 0.25, 1.06), legBack: bone(-7, -1, -0.22) }),
      // F6: almost at contact
      pose({ head: bone(2, -2, -0.06), body: bone(4, 0, 0.14), armFront: bone(24, -3, 0.24, 1.22), armBack: bone(-10, 3, -0.48, 0.88), legFront: bone(12, 3, 0.3, 1.08), legBack: bone(-8, -1, -0.24) }),
      // F7: final startup frame
      pose({ head: bone(2, -2, -0.07), body: bone(5, 0, 0.15), armFront: bone(26, -4, 0.26, 1.25), armBack: bone(-10, 2, -0.5, 0.88), legFront: bone(14, 4, 0.35, 1.1), legBack: bone(-8, -1, -0.25) }),
      // ── Active (frames 8-10): air strike contact with downward commitment ──
      // jump_a (light punch): arm thrusts forward-downward with sharp rotation
      // F8: full extension — jump_a air punch, arm snaps down at -0.4 rot for diagonal punch
      pose({ head: bone(2, -2, -0.08), body: bone(5, 2, 0.18), armFront: bone(32, -2, -0.4, 1.3), armBack: bone(-10, 2, -0.5, 0.88), legFront: bone(15, 4, 0.38, 1.12), legBack: bone(-8, -1, -0.25) }),
      // F9: jump_c (heavy punch) — arm reaches further with increased scale and stronger downward angle
      pose({ head: bone(2, -3, -0.1), body: bone(6, 3, 0.2), armFront: bone(36, 0, -0.35, 1.4), armBack: bone(-10, 3, -0.52, 0.85), legFront: bone(14, 5, 0.4, 1.14), legBack: bone(-8, -2, -0.28) }),
      // F10: jump_d (heavy kick) — leg extends far forward-downward, arm pulls back for counterbalance
      pose({ head: bone(2, -3, -0.1), body: bone(6, 3, 0.22), armFront: bone(8, 4, 0.3, 0.9), armBack: bone(-12, 3, -0.55, 0.88), legFront: bone(28, 2, -0.35, 1.35), legBack: bone(-8, -2, -0.3) }),
      // F11: extended startup for JUMP_CD (startup=12), hold peak active pose
      pose({ head: bone(2, -3, -0.1), body: bone(6, 3, 0.2), armFront: bone(34, -1, -0.38, 1.38), armBack: bone(-10, 3, -0.52, 0.86), legFront: bone(20, 4, -0.2, 1.2), legBack: bone(-8, -2, -0.28) }),
    ],
    [FighterState.THROW]: [
      // Frame 0: Grab — arms extend forward to grab opponent
      pose({ head: bone(2, 0, 0.02), body: bone(4, 0, 0.08), armFront: bone(20, 3, 0.0, 1.15), armBack: bone(14, 5, -0.1, 1.0), legFront: bone(5, 0, 0.08), legBack: bone(-5, 0, -0.08) }),
      // Frame 1: Grip secured — arms pull back, grip locked on opponent
      pose({ head: bone(1, 1, 0.04), body: bone(2, 0, 0.12), armFront: bone(14, 4, 0.1, 1.1), armBack: bone(8, 5, -0.15, 1.05), legFront: bone(6, 0, 0.1), legBack: bone(-5, 0, -0.1) }),
      // Frame 2: Turn — body rotates, pulling opponent off balance
      pose({ head: bone(0, 2, 0.08), body: bone(0, 2, 0.2), armFront: bone(6, 6, 0.2, 1.0), armBack: bone(-2, 8, -0.25, 0.95), legFront: bone(4, 1, 0.15), legBack: bone(-6, 1, -0.15) }),
      // Frame 3: Throw execution — full rotation, opponent goes flying
      pose({ head: bone(-2, 3, 0.12), body: bone(-4, 3, 0.35), armFront: bone(-4, 10, 0.4, 0.9), armBack: bone(-10, 8, -0.4, 0.85), legFront: bone(2, 2, 0.2), legBack: bone(-8, 2, -0.25) }),
      // Frame 4: Follow-through — body completing rotation, momentum carrying
      pose({ head: bone(-1, 2, 0.06), body: bone(-2, 2, 0.2), armFront: bone(0, 8, 0.3, 0.95), armBack: bone(-6, 7, -0.3, 0.9), legFront: bone(3, 1, 0.12), legBack: bone(-6, 1, -0.18) }),
      // Frame 5: Recovery — return to fighting stance, throw complete
      pose({ head: bone(1, 0, 0.02), body: bone(2, 0, 0.08), armFront: bone(8, 6, 0.15, 1.0), armBack: bone(-4, 8, -0.2, 0.95), legFront: bone(4, 0, 0.06), legBack: bone(-5, 0, -0.08) }),
    ],
    // GUARD_CRUSH: 4 frames — guard broken → stagger → vulnerable → slight recovery
    [FighterState.GUARD_CRUSH]: [
      // Frame 0: Guard broken — arms flung wide from the shattered guard
      pose({ head: bone(-4, 4, -0.22), body: bone(-3, 3, -0.12), armFront: bone(-6, 14, 0.45), armBack: bone(-8, 12, 0.35), legFront: bone(3, 1, 0.06), legBack: bone(-6, 1, -0.06) }),
      // Frame 1: Stagger backward — body reeling, off balance
      pose({ head: bone(-5, 5, -0.26), body: bone(-5, 4, -0.16), armFront: bone(-4, 16, 0.5), armBack: bone(-7, 14, 0.4), legFront: bone(4, 2, 0.08), legBack: bone(-7, 2, -0.08) }),
      // Frame 2: Vulnerable — wide open, completely defenseless
      pose({ head: bone(-3, 4, -0.2), body: bone(-4, 3, -0.1), armFront: bone(-2, 15, 0.42), armBack: bone(-6, 13, 0.32), legFront: bone(3, 1, 0.05), legBack: bone(-6, 1, -0.05) }),
      // Frame 3: Slight recovery attempt — beginning to regain composure
      pose({ head: bone(-2, 3, -0.14), body: bone(-2, 2, -0.06), armFront: bone(0, 13, 0.3), armBack: bone(-5, 11, 0.2), legFront: bone(3, 0, 0.03), legBack: bone(-5, 0, -0.03) }),
    ],
    // DIZZY: 4 frames — wobble left → straighten → wobble right → straighten with head sway
    [FighterState.DIZZY]: [
      // Frame 0: Stagger left — head tilted left, body swaying
      pose({ head: bone(-6, 2, -0.22), body: bone(-3, 1, -0.08), armFront: bone(5, 18, 0.15), armBack: bone(-8, 16, -0.1), legFront: bone(5, 1, 0.04), legBack: bone(-5, 1, -0.04) }),
      // Frame 1: Straighten slightly — passing through center
      pose({ head: bone(-1, 1, -0.06), body: bone(0, 0, 0), armFront: bone(7, 17, 0.18), armBack: bone(-6, 15, -0.15), legFront: bone(4, 0, 0.02), legBack: bone(-4, 0, -0.02) }),
      // Frame 2: Stagger right — head tilted right, body swaying opposite
      pose({ head: bone(6, 2, 0.22), body: bone(3, 1, 0.08), armFront: bone(10, 18, 0.2), armBack: bone(-4, 16, -0.2), legFront: bone(5, 1, 0.04), legBack: bone(-5, 1, -0.04) }),
      // Frame 3: Straighten with dizzy cue — nearly centered, head still unsteady
      pose({ head: bone(1, 1, 0.08), body: bone(0, 0, 0.02), armFront: bone(8, 17, 0.18), armBack: bone(-5, 15, -0.18), legFront: bone(4, 0, 0.02), legBack: bone(-4, 0, -0.02) }),
    ],
    [FighterState.HOP]: pose({
      head: bone(0, -2, -0.04),
      body: bone(0, -1, 0),
      armFront: bone(8, 5, 0.15),
      armBack: bone(-5, 4, -0.2),
      legFront: bone(4, 3, 0.1),
      legBack: bone(-5, 2, -0.15),
    }),
    [FighterState.BACKDASH]: pose({
      body: bone(-5, -8, -0.1),
      armFront: bone(8, 4, 0.55),
      armBack: bone(-12, 3, -0.2),
      legFront: bone(-2, -8, 0.45),
      legBack: bone(9, -3, -0.55),
    }),
    [FighterState.ROLL]: pose({
      body: bone(0, 24, 0.8),
      head: bone(4, 27, 0.6),
      armFront: bone(-3, 29, 0.4),
      armBack: bone(8, 24, -0.5),
      legFront: bone(-8, 27, -0.3),
      legBack: bone(5, 25, 0.45),
    }),
    [FighterState.HYPER_JUMP]: pose({
      body: bone(0, -8, -0.06),
      armFront: bone(10, 10, 0.42),
      armBack: bone(-8, 8, -0.3),
      legFront: bone(7, -6, 0.35),
      legBack: bone(-7, -4, -0.45),
    }),
    [FighterState.RUN_JUMP]: pose({
      body: bone(3, -5, -0.03),
      armFront: bone(9, 7, 0.28),
      armBack: bone(-7, 5, -0.22),
      legFront: bone(5, -3, 0.18),
      legBack: bone(-5, -1, -0.28),
    }),
    [FighterState.BACK_ROLL]: pose({
      body: bone(0, 20, -0.6),
      head: bone(-5, 23, -0.5),
      armFront: bone(5, 24, 0.3),
      armBack: bone(-7, 20, -0.4),
      legFront: bone(5, 18, -0.2),
      legBack: bone(-5, 21, 0.3),
    }),
    [FighterState.AIR_BLOCK]: [
      // Frame 0: Air guard up — arms raised to block overhead attack
      pose({ head: bone(0, -1, -0.03), body: bone(-1, -2, 0.02), armFront: bone(2, 2, -0.7), armBack: bone(-2, 0, -0.85), legFront: bone(3, -2, 0.1), legBack: bone(-4, 0, -0.15) }),
      // Frame 1: Impact absorption in air — body pushed back from block, arms absorb force
      pose({ head: bone(-2, 0, -0.05), body: bone(-3, 0, 0.06), armFront: bone(0, 4, -0.6), armBack: bone(-4, 2, -0.75), legFront: bone(2, -1, 0.08), legBack: bone(-5, 1, -0.12) }),
      // Frame 2: Recovery — preparing to land, arms lowering back
      pose({ head: bone(0, 0, -0.02), body: bone(-1, 1, 0.03), armFront: bone(4, 6, -0.45), armBack: bone(-1, 5, -0.6), legFront: bone(4, 0, 0.06), legBack: bone(-4, 1, -0.1) }),
    ],

    // ── Ryo 胜利姿势 (WIN_POSE) ──
    // 8帧动画: 从倒地恢复 → 站立 → 整理道服 → 自信格斗架势 → 呼吸循环
    // 最后两帧(loop point)适合循环播放
    WIN_POSE: [
      // Frame 0: 从恢复姿态开始 — 身体微倾，头低下，手臂放松
      pose({ head: bone(2, 6, 0.2), body: bone(4, 8, 0.12), armFront: bone(4, 20, 0.4), armBack: bone(-8, 18, 0.2), legFront: bone(8, 4, 0.12), legBack: bone(-6, 4, -0.08) }),
      // Frame 1: 站直 — 身体上升，头抬起，手臂开始回收
      pose({ head: bone(1, 3, 0.1), body: bone(2, 4, 0.06), armFront: bone(8, 16, 0.3), armBack: bone(-6, 14, 0.05), legFront: bone(7, 2, 0.08), legBack: bone(-5, 2, -0.04) }),
      // Frame 2: 完全站直 — 身体归位，准备整理道服
      pose({ head: bone(0, 1, 0.05), body: bone(1, 1, 0.02), armFront: bone(10, 14, 0.25), armBack: bone(-6, 12, -0.1), legFront: bone(6, 0, 0.06), legBack: bone(-5, 0, -0.03) }),
      // Frame 3: 整理道服 — 前手下拉整理道服下摆，后手辅助，头微低
      pose({ head: bone(2, 3, 0.15), body: bone(2, 2, 0.04), armFront: bone(14, 20, 0.45), armBack: bone(-4, 16, 0.2), legFront: bone(7, 0, 0.06), legBack: bone(-5, 0, -0.03) }),
      // Frame 4: 整理道服完成 — 双手收回，身体挺拔
      pose({ head: bone(1, 1, 0.08), body: bone(1, 0, -0.02), armFront: bone(10, 12, 0.2), armBack: bone(-6, 10, -0.2), legFront: bone(6, 0, 0.05), legBack: bone(-5, 0, -0.04) }),
      // Frame 5: 转入格斗架势 — 前手护胸，后手收腰，头正前方
      pose({ head: bone(0, 0, -0.02), body: bone(0, 0, -0.04), armFront: bone(12, 10, 0.3), armBack: bone(-6, 16, -0.4), legFront: bone(8, 0, 0.06), legBack: bone(-6, 0, -0.05) }),
      // Frame 6: 格斗架势确立 — 呼吸开始(微上升)，自信姿态 (loop point A)
      pose({ head: bone(0, -1, -0.03), body: bone(0, -1, -0.05), armFront: bone(12, 9, 0.28), armBack: bone(-6, 15, -0.38), legFront: bone(8, -1, 0.05), legBack: bone(-6, -1, -0.05) }),
      // Frame 7: 呼吸回落 — 重心微沉，架势稳定 (loop point B)
      pose({ head: bone(0, 0, -0.02), body: bone(0, 0, -0.04), armFront: bone(12, 10, 0.3), armBack: bone(-6, 16, -0.4), legFront: bone(8, 0, 0.06), legBack: bone(-6, 0, -0.05) }),
    ],

    // ── Ryo 嘲讽动画 (TAUNT) ──
    // 6帧动画: 前手招引 → 触碰头带 → 自信微笑回到架势
    [FighterState.TAUNT]: [
      // Frame 0: 开始招手 — 前手抬起，掌心向外，招引对手
      pose({ head: bone(0, 0, -0.02), body: bone(0, 0, -0.04), armFront: bone(15, 8, 0.5), armBack: bone(-6, 16, -0.4), legFront: bone(8, 0, 0.06), legBack: bone(-6, 0, -0.05) }),
      // Frame 1: 招手动作完成 — 前手完全伸出，手指弯曲勾引
      pose({ head: bone(1, -1, 0.0), body: bone(1, 0, -0.02), armFront: bone(18, 4, 0.6), armBack: bone(-6, 14, -0.35), legFront: bone(8, 0, 0.06), legBack: bone(-6, 0, -0.04) }),
      // Frame 2: 收回前手，后手触碰头带 — 身体微转
      pose({ head: bone(-1, -1, 0.1), body: bone(-1, 0, 0.02), armFront: bone(8, 10, 0.2), armBack: bone(-10, 4, -0.6), legFront: bone(7, 0, 0.04), legBack: bone(-5, 0, -0.04) }),
      // Frame 3: 后手整理头带 — 手指触及额头，头微低
      pose({ head: bone(-2, -2, 0.12), body: bone(-1, -1, 0.0), armFront: bone(6, 12, 0.15), armBack: bone(-12, -2, -0.8), legFront: bone(7, -1, 0.04), legBack: bone(-5, -1, -0.04) }),
      // Frame 4: 收回后手，自信微笑 — 身体回正
      pose({ head: bone(0, -1, -0.02), body: bone(0, 0, -0.03), armFront: bone(10, 12, 0.25), armBack: bone(-6, 10, -0.3), legFront: bone(7, 0, 0.05), legBack: bone(-5, 0, -0.04) }),
      // Frame 5: 完全回到架势 — 自信表情，准备继续战斗
      pose({ head: bone(0, 0, -0.02), body: bone(0, 0, -0.04), armFront: bone(12, 10, 0.3), armBack: bone(-6, 16, -0.4), legFront: bone(8, 0, 0.06), legBack: bone(-6, 0, -0.05) }),
    ],

    // ── Ryo MAX模式激活动画 (MAX_MODE) ──
    // 4帧动画: 蹲身蓄力 → 爆发上升 → 蓄力架势 → MAX格斗架势
    [FighterState.MAX_MODE]: [
      // Frame 0: 蹲身蓄力 — 身体下蹲，双手收紧，气力集中
      pose({ head: bone(0, 8, 0.1), body: bone(0, 12, 0.12), armFront: bone(4, 20, -0.3), armBack: bone(-4, 18, -0.5), legFront: bone(10, 6, 0.35), legBack: bone(-8, 6, -0.3) }),
      // Frame 1: 爆发上升 — 身体急剧上升，双臂张开释放能量
      pose({ head: bone(0, -5, -0.08), body: bone(0, -5, -0.1), armFront: bone(16, 4, 0.6, 1.15), armBack: bone(-14, 2, -0.7, 1.15), legFront: bone(8, -2, 0.1), legBack: bone(-6, -2, -0.08) }),
      // Frame 2: 蓄力架势 — 能量环绕，双脚扎根，双臂收于身前
      pose({ head: bone(0, -2, -0.04), body: bone(0, -2, -0.06), armFront: bone(12, 8, 0.4, 1.1), armBack: bone(-10, 6, -0.5, 1.1), legFront: bone(8, 0, 0.08), legBack: bone(-6, 0, -0.06) }),
      // Frame 3: MAX格斗架势 — 安定架势，能量内敛，呼吸稳健
      pose({ head: bone(0, -1, -0.03), body: bone(0, -1, -0.05), armFront: bone(12, 10, 0.35, 1.05), armBack: bone(-6, 14, -0.45, 1.05), legFront: bone(8, 0, 0.06), legBack: bone(-6, 0, -0.05) }),
    ],

    // ── Ryo 必杀技动画 (attack-specific poses) ──
    // 虎煌拳 QCF+A (Ko'ou Ken — fireball): startup=12, active=18, recovery=34
    [AttackType.RYO_KOOU]: [
      // Startup (0-5): 深蹲蓄气 — 双手收腰，重心下沉，气合蓄力
      pose({ body: bone(3, 6, 0.12), armFront: bone(2, 16, -0.45), armBack: bone(0, 14, -0.6), legFront: bone(10, 4, 0.22), legBack: bone(-8, 4, -0.2), head: bone(0, 1) }),
      // Frame 1: 继续下沉 — 双手紧收腰间，前膝深弯
      pose({ body: bone(5, 10, 0.18), armFront: bone(-2, 14, -0.6), armBack: bone(2, 12, -0.75), legFront: bone(14, 8, 0.28), legBack: bone(-12, 8, -0.28), head: bone(2, 2) }),
      // Frame 2: 蓄力最深 — 拳紧贴腰，身体最大旋转
      pose({ body: bone(6, 12, 0.22), armFront: bone(-4, 16, -0.7), armBack: bone(4, 14, -0.85), legFront: bone(16, 10, 0.32), legBack: bone(-14, 10, -0.32), head: bone(3, 3) }),
      // Frame 3: 开始回旋 — 重心上提，双臂开始展开
      pose({ body: bone(4, 8, 0.15), armFront: bone(0, 12, -0.5), armBack: bone(2, 10, -0.65), legFront: bone(12, 6, 0.24), legBack: bone(-10, 6, -0.24), head: bone(1, 2) }),
      // Frame 4: 回旋蓄势 — 身体前倾，手臂后引准备推出
      pose({ body: bone(3, 4, 0.1), armFront: bone(-2, 8, -0.3), armBack: bone(0, 6, -0.45), legFront: bone(9, 3, 0.18), legBack: bone(-7, 3, -0.18), head: bone(1, 1) }),
      // Frame 5: 即将推出 — 前倾加重，能量即将释放
      pose({ body: bone(5, 1, 0.08), armFront: bone(2, 4, -0.15), armBack: bone(-1, 3, -0.3), legFront: bone(8, 1, 0.14), legBack: bone(-6, 1, -0.14), head: bone(1, 0) }),
      // Active (6-12): 双手推出气功 — 身体大幅前倾，双手全力前伸
      pose({ head: bone(3, -1, 0.08), body: bone(10, -4, 0.25), armFront: bone(36, -6, 0.08, 1.5), armBack: bone(30, -8, -0.12, 1.4), legFront: bone(12, 2, 0.24), legBack: bone(-12, 4, -0.24) }),
      // Frame 7: 气功释放巅峰 — 最大延伸，身体前倾最甚
      pose({ head: bone(4, -2, 0.1), body: bone(12, -5, 0.28), armFront: bone(38, -8, 0.05, 1.55), armBack: bone(32, -10, -0.08, 1.45), legFront: bone(14, 3, 0.26), legBack: bone(-14, 5, -0.26) }),
      // Frame 8: 维持推出 — 手臂仍充分延伸
      pose({ head: bone(3, -1, 0.08), body: bone(10, -4, 0.24), armFront: bone(35, -6, 0.08, 1.45), armBack: bone(29, -8, -0.1, 1.35), legFront: bone(12, 2, 0.23), legBack: bone(-12, 4, -0.23) }),
      // Frame 9: 推出维持 — 开始缓慢回收
      pose({ head: bone(2, -1, 0.06), body: bone(8, -3, 0.2), armFront: bone(32, -4, 0.1, 1.38), armBack: bone(26, -6, -0.14, 1.28), legFront: bone(10, 1, 0.2), legBack: bone(-10, 3, -0.2) }),
      // Frame 10: 持续延伸 — 手臂继续回收
      pose({ head: bone(1, 0, 0.05), body: bone(6, -1, 0.16), armFront: bone(28, -2, 0.12, 1.3), armBack: bone(22, -4, -0.18, 1.2), legFront: bone(9, 0, 0.17), legBack: bone(-8, 2, -0.17) }),
      // Frame 11: 延伸尾声 — 手臂明显回收
      pose({ head: bone(1, 0, 0.04), body: bone(4, 1, 0.12), armFront: bone(22, 0, 0.16, 1.2), armBack: bone(18, -2, -0.2, 1.12), legFront: bone(8, 0, 0.14), legBack: bone(-7, 1, -0.14) }),
      // Frame 12: 活动帧结束 — 手臂收回途中
      pose({ head: bone(1, 1, 0.03), body: bone(3, 2, 0.08), armFront: bone(18, 2, 0.18, 1.12), armBack: bone(14, 0, -0.22, 1.05), legFront: bone(7, 0, 0.1), legBack: bone(-6, 0, -0.1) }),
      // Recovery (13-17): 手臂收回，回到架势
      pose({ head: bone(1, 1, 0.03), body: bone(2, 3, 0.06), armFront: bone(14, 6, 0.16, 1.05), armBack: bone(8, 4, -0.18, 1.0), legFront: bone(7, 1, 0.08), legBack: bone(-6, 0, -0.08) }),
      pose({ head: bone(0, 0, 0.02), body: bone(1, 2, 0.04), armFront: bone(12, 10, 0.15, 1.0), armBack: bone(2, 8, -0.25), legFront: bone(7, 0, 0.06), legBack: bone(-5, 0, -0.06) }),
      pose({ head: bone(0, 0, 0.01), body: bone(0, 1, 0.02), armFront: bone(10, 14, 0.18), armBack: bone(-4, 12, -0.35), legFront: bone(7, 0, 0.04), legBack: bone(-5, 0, -0.04) }),
      pose({ head: bone(0, 0), body: bone(0, 0), armFront: bone(8, 16, 0.2), armBack: bone(-6, 14, -0.4), legFront: bone(6, 0, 0.04), legBack: bone(-4, 0, -0.04) }),
    ],

    // 虎煌拳 QCF+C (Ko'ou Ken strong — shares RYO_KOOU animation)
    [AttackType.RYO_KOOU_C]: 'RYO_KOOU' as unknown as Pose | Pose[],

    // 虎咲 DP+A (Ko Hou — uppercut): startup=5, active=5, recovery=25
    [AttackType.RYO_KO_HOU]: [
      // Startup (0-4): 深蹲蓄力 — 身体下压，前拳收腰准备上勾
      pose({ body: bone(-1, 8, 0.08), armFront: bone(0, 16, -0.65), armBack: bone(-4, 12, -0.3), legFront: bone(12, 6, 0.28), legBack: bone(-8, 4, -0.2), head: bone(-2, 3) }),
      // Frame 1: 加深蹲 — 前拳紧贴腰间，重心最低点
      pose({ body: bone(-2, 14, 0.14), armFront: bone(-4, 18, -0.8), armBack: bone(-6, 14, -0.2), legFront: bone(16, 12, 0.35), legBack: bone(-12, 8, -0.28), head: bone(-4, 5) }),
      // Frame 2: 蹲至极低 — 脚跟离地蓄力，拳紧缩
      pose({ body: bone(-3, 18, 0.18), armFront: bone(-6, 20, -0.9), armBack: bone(-8, 16, -0.1), legFront: bone(18, 14, 0.38), legBack: bone(-14, 10, -0.32), head: bone(-5, 6) }),
      // Frame 3: 即将弹起 — 重心开始上移，拳仍蓄
      pose({ body: bone(-2, 12, 0.12), armFront: bone(-4, 18, -0.82), armBack: bone(-6, 14, -0.15), legFront: bone(14, 10, 0.3), legBack: bone(-10, 6, -0.25), head: bone(-3, 4) }),
      // Frame 4: 弹起前瞬 — 腿部发力，身体开始上冲
      pose({ body: bone(0, 4, 0.04), armFront: bone(-2, 14, -0.65), armBack: bone(-4, 10, -0.25), legFront: bone(10, 4, 0.2), legBack: bone(-8, 2, -0.15), head: bone(-1, 2) }),
      // Active (5-9): 升龙拳上冲 — 拳头上勾，身体腾空
      pose({ body: bone(3, -4, -0.12), armFront: bone(18, -16, -1.35, 1.45), armBack: bone(-12, -2, 0.4), legFront: bone(8, -6, 0.18), legBack: bone(-10, -6, -0.22), head: bone(3, -4) }),
      // Frame 6: 升龙巅峰 — 拳头最高点，最大上勾幅度，身体接近垂直
      pose({ body: bone(4, -14, -0.2), armFront: bone(24, -28, -1.5, 1.55), armBack: bone(-16, -8, 0.55), legFront: bone(4, -16, 0.08), legBack: bone(-14, -14, -0.28), head: bone(5, -10) }),
      // Frame 7: 巅峰维持 — 拳头仍高举，身体开始回落
      pose({ body: bone(2, -10, -0.15), armFront: bone(20, -22, -1.42, 1.48), armBack: bone(-14, -5, 0.48), legFront: bone(6, -12, 0.12), legBack: bone(-12, -10, -0.24), head: bone(3, -7) }),
      // Frame 8: 下降开始 — 拳头开始收回
      pose({ body: bone(1, -6, -0.08), armFront: bone(14, -14, -1.2, 1.35), armBack: bone(-10, -2, 0.35), legFront: bone(8, -6, 0.15), legBack: bone(-8, -4, -0.18), head: bone(2, -4) }),
      // Frame 9: 下降中 — 手臂回收更明显
      pose({ body: bone(0, -2, -0.04), armFront: bone(10, -8, -1.0, 1.22), armBack: bone(-8, 0, 0.25), legFront: bone(8, -2, 0.12), legBack: bone(-6, 0, -0.14), head: bone(1, -2) }),
      // Recovery (10-14): 落地恢复 — 重心下沉稳定，回到架势
      pose({ body: bone(0, 2, 0.04), armFront: bone(8, 2, -0.6, 1.08), armBack: bone(-6, 4, 0.1), legFront: bone(8, 2, 0.12), legBack: bone(-6, 2, -0.1), head: bone(0, 1) }),
      pose({ body: bone(0, 6, 0.08), armFront: bone(8, 8, -0.3, 1.02), armBack: bone(-6, 6, -0.05), legFront: bone(8, 4, 0.12), legBack: bone(-6, 4, -0.12), head: bone(0, 2) }),
      pose({ body: bone(0, 8, 0.06), armFront: bone(9, 12, -0.1, 1.0), armBack: bone(-6, 8, -0.18), legFront: bone(7, 4, 0.1), legBack: bone(-5, 4, -0.1), head: bone(0, 2) }),
      pose({ body: bone(0, 6, 0.04), armFront: bone(9, 14, 0.1), armBack: bone(-6, 10, -0.28), legFront: bone(7, 2, 0.08), legBack: bone(-5, 2, -0.08), head: bone(0, 1) }),
      pose({ body: bone(0, 3, 0.02), armFront: bone(9, 15, 0.15), armBack: bone(-5, 12, -0.32), legFront: bone(7, 1, 0.06), legBack: bone(-5, 1, -0.06), head: bone(0, 0) }),
    ],

    // 虎咲 DP+C (Ko Hou strong — shares RYO_KO_HOU animation)
    [AttackType.RYO_KO_HOU_C]: 'RYO_KO_HOU' as unknown as Pose | Pose[],

    // 飛燕疾風脚 QCB+K (Hien — flying kick): startup=10, active=8, recovery=22
    [AttackType.RYO_HIEN]: [
      // Startup (0-4): 起跳蓄力 — 身体后引，腿折叠蓄力
      pose({ body: bone(0, 2, -0.04), armFront: bone(6, 8, 0.05), armBack: bone(-6, 8, -0.3), legFront: bone(10, 2, 0.18), legBack: bone(-6, 2, -0.12), head: bone(0, 1) }),
      // Frame 1: 深蹲蓄力 — 重心下压，前腿折叠
      pose({ body: bone(-2, 8, 0.06), armFront: bone(0, 6, -0.15), armBack: bone(-8, 6, -0.35), legFront: bone(14, 8, 0.3), legBack: bone(-10, 6, -0.22), head: bone(-1, 3) }),
      // Frame 2: 即将弹起 — 身体大幅后引，手臂后摆
      pose({ body: bone(-4, 10, 0.1), armFront: bone(-6, 4, -0.3), armBack: bone(-14, 2, -0.4), legFront: bone(16, 10, 0.35), legBack: bone(-12, 8, -0.28), head: bone(-2, 4) }),
      // Frame 3: 起跳瞬间 — 腿部弹开，身体上冲
      pose({ body: bone(-2, 4, 0.02), armFront: bone(-2, 6, -0.1), armBack: bone(-10, 4, -0.3), legFront: bone(12, 4, 0.25), legBack: bone(-8, 4, -0.2), head: bone(-1, 2) }),
      // Frame 4: 腾空开始 — 身体上升，腿开始展开
      pose({ body: bone(2, -4, -0.08), armFront: bone(2, 4, 0.05), armBack: bone(-12, 2, -0.35), legFront: bone(16, -6, 0.28), legBack: bone(-10, -4, -0.25), head: bone(1, -2) }),
      // Active (5-10): 飞踢巅峰 — 身体水平前倾，踢腿充分延伸
      pose({ body: bone(10, -10, -0.22), armFront: bone(4, 6, 0.2), armBack: bone(-18, 4, -0.5), legFront: bone(32, -10, 0.1, 1.5), legBack: bone(-8, -8, -0.38), head: bone(5, -5) }),
      // Frame 6: 飞踢最大延伸 — 身体接近水平，踢腿最高点
      pose({ body: bone(14, -14, -0.35), armFront: bone(2, 8, 0.25), armBack: bone(-20, 6, -0.6), legFront: bone(36, -14, 0.05, 1.55), legBack: bone(-10, -12, -0.42), head: bone(6, -8) }),
      // Frame 7: 维持飞踢 — 延伸状态
      pose({ body: bone(12, -12, -0.3), armFront: bone(3, 6, 0.22), armBack: bone(-18, 4, -0.55), legFront: bone(34, -12, 0.08, 1.5), legBack: bone(-8, -10, -0.4), head: bone(5, -7) }),
      // Frame 8: 开始收回 — 腿部回收，身体开始回正
      pose({ body: bone(8, -8, -0.22), armFront: bone(6, 8, 0.18), armBack: bone(-14, 6, -0.45), legFront: bone(26, -6, 0.18, 1.35), legBack: bone(-6, -6, -0.35), head: bone(3, -4) }),
      // Frame 9: 继续回收 — 身体回正明显
      pose({ body: bone(5, -4, -0.14), armFront: bone(8, 10, 0.14), armBack: bone(-10, 8, -0.38), legFront: bone(20, -2, 0.22, 1.22), legBack: bone(-4, -2, -0.28), head: bone(2, -3) }),
      // Frame 10: 回收尾声 — 即将落地
      pose({ body: bone(3, -2, -0.08), armFront: bone(10, 12, 0.12), armBack: bone(-8, 10, -0.34), legFront: bone(14, 2, 0.2, 1.1), legBack: bone(-2, 0, -0.22), head: bone(1, -1) }),
      // Recovery (11-14): 落地恢复
      pose({ body: bone(1, 0, -0.04), armFront: bone(10, 14, 0.15), armBack: bone(-6, 12, -0.32), legFront: bone(10, 4, 0.15), legBack: bone(-3, 2, -0.16), head: bone(0, 0) }),
      pose({ body: bone(0, 4, 0.02), armFront: bone(10, 16, 0.18), armBack: bone(-5, 14, -0.36), legFront: bone(8, 4, 0.1), legBack: bone(-4, 2, -0.12), head: bone(0, 1) }),
      pose({ body: bone(0, 2, 0.02), armFront: bone(9, 16, 0.2), armBack: bone(-5, 14, -0.38), legFront: bone(7, 2, 0.06), legBack: bone(-4, 0, -0.08), head: bone(0, 0) }),
      pose({ body: bone(0, 0), armFront: bone(8, 16, 0.2), armBack: bone(-5, 14, -0.4), legFront: bone(6, 0, 0.04), legBack: bone(-4, 0, -0.04), head: bone(0, 0) }),
    ],

    // 霸王翔吼拳 QCF+K (Haoh — counter/power strike): startup=10, active=12, recovery=22
    [AttackType.RYO_HAOU]: [
      // Startup (0-5): 当身架势 — 重心后移，双臂交叉防御蓄力
      pose({ body: bone(-3, 4, -0.06), armFront: bone(4, 10, -0.5), armBack: bone(-2, 8, -0.6), legFront: bone(8, 4, 0.15), legBack: bone(-6, 4, -0.12), head: bone(-2, 1) }),
      // Frame 1: 深蹲蓄力 — 双臂紧收，重心最低
      pose({ body: bone(-6, 10, -0.14), armFront: bone(-2, 14, -0.75), armBack: bone(2, 12, -0.8), legFront: bone(14, 10, 0.28), legBack: bone(-12, 8, -0.22), head: bone(-4, 4) }),
      // Frame 2: 蓄力巅峰 — 双臂交叉于胸前，身体最大后仰
      pose({ body: bone(-8, 12, -0.16), armFront: bone(-4, 16, -0.82), armBack: bone(4, 14, -0.88), legFront: bone(16, 12, 0.3), legBack: bone(-14, 10, -0.25), head: bone(-5, 5) }),
      // Frame 3: 能量积蓄 — 双臂开始展开，身体开始回旋
      pose({ body: bone(-4, 8, -0.1), armFront: bone(0, 12, -0.65), armBack: bone(2, 10, -0.72), legFront: bone(10, 6, 0.22), legBack: bone(-8, 6, -0.18), head: bone(-2, 3) }),
      // Frame 4: 回旋加速 — 身体前移，手臂后引准备爆发
      pose({ body: bone(0, 4, -0.04), armFront: bone(4, 8, -0.4), armBack: bone(-2, 6, -0.5), legFront: bone(8, 2, 0.14), legBack: bone(-6, 2, -0.12), head: bone(0, 1) }),
      // Frame 5: 即将爆发 — 身体前倾，能量蓄满
      pose({ body: bone(4, 1, 0.06), armFront: bone(6, 6, -0.2), armBack: bone(-4, 4, -0.35), legFront: bone(6, 0, 0.08), legBack: bone(-4, 0, -0.06), head: bone(1, 0) }),
      // Active (6-11): 霸王之力爆发 — 单手强力推出（区别于KOOU的双手）
      pose({ head: bone(4, -2, 0.12), body: bone(14, -6, 0.28), armFront: bone(38, -10, 0.02, 1.55), armBack: bone(-10, 8, -0.6), legFront: bone(14, 2, 0.28), legBack: bone(-14, 4, -0.28) }),
      // Frame 7: 掌击巅峰 — 最大延伸，后手紧收保持平衡
      pose({ head: bone(5, -3, 0.15), body: bone(16, -8, 0.32), armFront: bone(40, -12, -0.02, 1.6), armBack: bone(-12, 10, -0.65), legFront: bone(16, 3, 0.3), legBack: bone(-16, 5, -0.3) }),
      // Frame 8: 维持推出 — 仍充分延伸
      pose({ head: bone(4, -2, 0.12), body: bone(14, -6, 0.28), armFront: bone(36, -10, 0.04, 1.5), armBack: bone(-10, 8, -0.6), legFront: bone(13, 2, 0.26), legBack: bone(-13, 4, -0.26) }),
      // Frame 9: 开始收回 — 前手缓慢回拉
      pose({ head: bone(3, -1, 0.08), body: bone(10, -3, 0.2), armFront: bone(30, -6, 0.1, 1.38), armBack: bone(-8, 10, -0.5), legFront: bone(10, 1, 0.2), legBack: bone(-10, 2, -0.2) }),
      // Frame 10: 继续收回
      pose({ head: bone(2, 0, 0.05), body: bone(6, -1, 0.14), armFront: bone(22, -2, 0.15, 1.22), armBack: bone(-6, 10, -0.42), legFront: bone(8, 0, 0.14), legBack: bone(-7, 1, -0.14) }),
      // Frame 11: 收回尾声
      pose({ head: bone(1, 1, 0.03), body: bone(4, 2, 0.08), armFront: bone(16, 4, 0.2, 1.1), armBack: bone(-5, 10, -0.38), legFront: bone(7, 1, 0.08), legBack: bone(-5, 0, -0.06) }),
      // Recovery (12-14): 能量消散，回到架势
      pose({ head: bone(0, 0, 0.02), body: bone(2, 2, 0.04), armFront: bone(12, 8, 0.18, 1.02), armBack: bone(-5, 12, -0.35), legFront: bone(7, 0, 0.04), legBack: bone(-5, 0, -0.04) }),
      pose({ head: bone(0, 0, 0.01), body: bone(0, 1, 0.02), armFront: bone(10, 14, 0.2), armBack: bone(-5, 14, -0.38), legFront: bone(6, 0, 0.02), legBack: bone(-4, 0, -0.02) }),
      pose({ head: bone(0, 0), body: bone(0, 0), armFront: bone(8, 16, 0.2), armBack: bone(-5, 14, -0.4), legFront: bone(6, 0, 0.0), legBack: bone(-4, 0, -0.0) }),
    ],

    // DM 天地霸煌拳 (Ten Ha Ou — DM): startup=18, active=10, recovery=35
    [AttackType.DM_TEN_HA_OU]: [
      // Startup (0-5): 第一轮蓄气 — 能量开始聚集，呼吸下压
      pose({ body: bone(0, 2, 0.0), armFront: bone(10, 16, 0.2), armBack: bone(-8, 14, -0.3), legFront: bone(7, 0, 0.1), legBack: bone(-5, 0, -0.1), head: bone(0, 0) }),
      // Frame 1: 深蹲 — 双手向下收，重心下沉
      pose({ body: bone(-2, 8, 0.06), armFront: bone(4, 20, 0.08), armBack: bone(-2, 18, -0.22), legFront: bone(12, 6, 0.18), legBack: bone(-10, 6, -0.18), head: bone(-1, 3) }),
      // Frame 2: 蓄力加深 — 双拳紧收腰间
      pose({ body: bone(-4, 12, 0.1), armFront: bone(-2, 22, -0.05), armBack: bone(2, 20, -0.12), legFront: bone(16, 10, 0.24), legBack: bone(-14, 10, -0.24), head: bone(-2, 5) }),
      // Frame 3: 蓄力巅峰 — 最大蹲深，能量最密集
      pose({ body: bone(-5, 14, 0.12), armFront: bone(-4, 24, -0.1), armBack: bone(4, 22, -0.08), legFront: bone(18, 12, 0.26), legBack: bone(-16, 12, -0.26), head: bone(-3, 6) }),
      // Frame 4: 开始回升 — 能量向上涌
      pose({ body: bone(-3, 10, 0.08), armFront: bone(0, 22, -0.02), armBack: bone(0, 20, -0.1), legFront: bone(14, 8, 0.2), legBack: bone(-12, 8, -0.2), head: bone(-2, 4) }),
      // Frame 5: 回升完成 — 第一波蓄气结束
      pose({ body: bone(-1, 6, 0.04), armFront: bone(4, 20, 0.08), armBack: bone(-4, 18, -0.18), legFront: bone(10, 4, 0.14), legBack: bone(-8, 4, -0.14), head: bone(-1, 2) }),
      // Startup (6-11): 第二轮蓄气 — 更深，更强
      pose({ body: bone(-2, 10, 0.08), armFront: bone(0, 24, 0.0), armBack: bone(-2, 22, -0.15), legFront: bone(14, 8, 0.2), legBack: bone(-12, 8, -0.2), head: bone(-2, 4) }),
      // Frame 7: 第二波更深 — 双拳更紧
      pose({ body: bone(-6, 16, 0.14), armFront: bone(-6, 26, -0.12), armBack: bone(6, 24, -0.06), legFront: bone(20, 14, 0.3), legBack: bone(-18, 14, -0.3), head: bone(-4, 7) }),
      // Frame 8: 第二波巅峰 — 超越第一波的蓄力深度
      pose({ body: bone(-7, 18, 0.16), armFront: bone(-8, 28, -0.15), armBack: bone(8, 26, -0.04), legFront: bone(22, 16, 0.32), legBack: bone(-20, 16, -0.32), head: bone(-5, 8) }),
      // Frame 9: 第二波回升 — 能量更猛烈地涌起
      pose({ body: bone(-4, 12, 0.1), armFront: bone(-2, 24, -0.05), armBack: bone(4, 22, -0.1), legFront: bone(16, 10, 0.24), legBack: bone(-14, 10, -0.24), head: bone(-3, 5) }),
      // Frame 10: 回升加速
      pose({ body: bone(-1, 6, 0.05), armFront: bone(4, 20, 0.1), armBack: bone(-2, 18, -0.18), legFront: bone(10, 4, 0.16), legBack: bone(-8, 4, -0.16), head: bone(-1, 3) }),
      // Frame 11: 即将释放前 — 身体前倾蓄势
      pose({ body: bone(2, 2, 0.02), armFront: bone(8, 18, 0.15), armBack: bone(-6, 16, -0.25), legFront: bone(8, 2, 0.1), legBack: bone(-6, 2, -0.1), head: bone(0, 1) }),
      // Startup (12-17): 释放前蓄势 — 身体急剧前倾，能量爆发前夕
      pose({ body: bone(4, 0, 0.06), armFront: bone(6, 14, 0.1), armBack: bone(-4, 12, -0.2), legFront: bone(8, 0, 0.12), legBack: bone(-6, 0, -0.1), head: bone(1, 0) }),
      // Frame 13: 前倾加重
      pose({ body: bone(6, -2, 0.1), armFront: bone(4, 10, 0.05), armBack: bone(-2, 8, -0.15), legFront: bone(8, 0, 0.14), legBack: bone(-6, 1, -0.12), head: bone(2, -1) }),
      // Frame 14: 身体大幅前倾
      pose({ body: bone(10, -4, 0.16), armFront: bone(2, 6, -0.05), armBack: bone(0, 6, -0.1), legFront: bone(10, 1, 0.18), legBack: bone(-8, 2, -0.16), head: bone(3, -2) }),
      // Frame 15: 最大前倾蓄势
      pose({ body: bone(12, -6, 0.2), armFront: bone(0, 4, -0.1), armBack: bone(2, 4, -0.05), legFront: bone(12, 2, 0.22), legBack: bone(-10, 3, -0.2), head: bone(4, -3) }),
      // Frame 16: 即将爆发
      pose({ body: bone(14, -7, 0.24), armFront: bone(4, 2, -0.08), armBack: bone(4, 2, 0.0), legFront: bone(13, 2, 0.24), legBack: bone(-11, 4, -0.22), head: bone(5, -3) }),
      // Frame 17: 爆发前最瞬间
      pose({ body: bone(15, -8, 0.26), armFront: bone(8, 0, 0.02), armBack: bone(6, 0, 0.02), legFront: bone(14, 2, 0.26), legBack: bone(-12, 4, -0.24), head: bone(5, -4) }),
      // Active (18-27): 天地霸煌拳爆发 — 双手全力推出，天地变色
      pose({ head: bone(6, -4, 0.2), body: bone(18, -10, 0.34), armFront: bone(40, -14, -0.02, 1.65), armBack: bone(36, -16, -0.06, 1.55), legFront: bone(16, 4, 0.32), legBack: bone(-16, 6, -0.32) }),
      // Frame 19: 爆发巅峰 — 最大延伸，scale最大
      pose({ head: bone(7, -5, 0.22), body: bone(20, -12, 0.38), armFront: bone(42, -16, -0.05, 1.7), armBack: bone(38, -18, -0.08, 1.6), legFront: bone(18, 5, 0.34), legBack: bone(-18, 7, -0.34) }),
      // Frame 20: 维持爆发 — 仍全力推出
      pose({ head: bone(6, -4, 0.2), body: bone(18, -10, 0.34), armFront: bone(40, -14, -0.02, 1.65), armBack: bone(36, -16, -0.06, 1.55), legFront: bone(16, 4, 0.32), legBack: bone(-16, 6, -0.32) }),
      // Frame 21: 开始回落 — 但仍大幅延伸
      pose({ head: bone(5, -3, 0.16), body: bone(14, -7, 0.28), armFront: bone(34, -10, 0.04, 1.5), armBack: bone(30, -12, -0.1, 1.4), legFront: bone(14, 3, 0.26), legBack: bone(-14, 5, -0.26) }),
      // Frame 22: 继续回落
      pose({ head: bone(4, -2, 0.12), body: bone(10, -4, 0.2), armFront: bone(28, -6, 0.08, 1.35), armBack: bone(24, -8, -0.14, 1.25), legFront: bone(11, 1, 0.2), legBack: bone(-10, 3, -0.2) }),
      // Frame 23: 回落继续
      pose({ head: bone(3, -1, 0.08), body: bone(7, -2, 0.14), armFront: bone(22, -4, 0.12, 1.22), armBack: bone(18, -6, -0.18, 1.12), legFront: bone(9, 0, 0.16), legBack: bone(-8, 1, -0.16) }),
      // Frame 24: 持续收回
      pose({ head: bone(2, 0, 0.06), body: bone(5, 0, 0.1), armFront: bone(18, -2, 0.14, 1.14), armBack: bone(14, -4, -0.2, 1.05), legFront: bone(8, 0, 0.12), legBack: bone(-7, 0, -0.12) }),
      // Frame 25: 收回明显
      pose({ head: bone(1, 0, 0.04), body: bone(4, 2, 0.06), armFront: bone(14, 2, 0.18, 1.08), armBack: bone(10, -2, -0.22, 1.0), legFront: bone(7, 1, 0.08), legBack: bone(-6, 0, -0.08) }),
      // Frame 26: 接近恢复
      pose({ head: bone(1, 1, 0.03), body: bone(3, 3, 0.05), armFront: bone(12, 4, 0.18, 1.04), armBack: bone(6, 2, -0.25), legFront: bone(7, 1, 0.06), legBack: bone(-5, 1, -0.06) }),
      // Frame 27: 活动帧最后一帧
      pose({ head: bone(0, 1, 0.02), body: bone(2, 4, 0.04), armFront: bone(10, 8, 0.18, 1.02), armBack: bone(4, 4, -0.28), legFront: bone(7, 0, 0.04), legBack: bone(-5, 0, -0.04) }),
      // Recovery (28-34): 能量消散，身体恢复
      pose({ head: bone(0, 0, 0.02), body: bone(1, 4, 0.03), armFront: bone(10, 10, 0.18), armBack: bone(2, 8, -0.3), legFront: bone(7, 0, 0.02), legBack: bone(-5, 0, -0.02) }),
      pose({ head: bone(0, 0, 0.01), body: bone(0, 2, 0.02), armFront: bone(10, 12, 0.18), armBack: bone(-2, 10, -0.32), legFront: bone(6, 0, 0.0), legBack: bone(-4, 0, -0.0) }),
      pose({ head: bone(0, 0), body: bone(0, 1, 0.01), armFront: bone(10, 14, 0.2), armBack: bone(-4, 12, -0.35), legFront: bone(6, 0, 0.0), legBack: bone(-4, 0, -0.0) }),
      pose({ head: bone(0, 0), body: bone(0, 0), armFront: bone(9, 16, 0.2), armBack: bone(-5, 14, -0.38), legFront: bone(6, 0, 0.0), legBack: bone(-4, 0, -0.0) }),
    ],

    // →+A 冰柱割り (Tsurizao — overhead): startup=14, active=4, recovery=18
    [AttackType.RYO_TSURIZAO]: [
      // Startup (0-7): 手刀举过头顶 — 前手从身前上举，蓄力过顶
      pose({ body: bone(0, 0, 0.0), armFront: bone(8, 14, 0.2), armBack: bone(-6, 12, -0.3), legFront: bone(7, 0, 0.1), legBack: bone(-5, 0, -0.1), head: bone(0, 0) }),
      // Frame 1: 前手开始上举 — 身体微前倾
      pose({ body: bone(2, 0, 0.04), armFront: bone(6, 8, 0.05), armBack: bone(-6, 12, -0.3), legFront: bone(8, 0, 0.12), legBack: bone(-5, 0, -0.1), head: bone(1, -1) }),
      // Frame 2: 前手继续上举 — 到肩膀高度
      pose({ body: bone(4, 0, 0.08), armFront: bone(4, 2, -0.1), armBack: bone(-6, 12, -0.3), legFront: bone(10, 0, 0.16), legBack: bone(-7, 0, -0.14), head: bone(2, -3) }),
      // Frame 3: 前手举到头顶 — 手臂向上延伸
      pose({ body: bone(4, -2, 0.1), armFront: bone(2, -4, -0.3), armBack: bone(-6, 10, -0.35), legFront: bone(10, 0, 0.16), legBack: bone(-7, 0, -0.14), head: bone(2, -4) }),
      // Frame 4: 手刀过顶 — 手臂高举过头，蓄力
      pose({ body: bone(2, -3, 0.08), armFront: bone(0, -8, -0.45, 1.1), armBack: bone(-6, 10, -0.35), legFront: bone(8, 0, 0.12), legBack: bone(-6, 0, -0.12), head: bone(1, -5) }),
      // Frame 5: 手刀最高点 — 手臂完全过顶，最大蓄力
      pose({ body: bone(0, -4, 0.06), armFront: bone(-2, -12, -0.55, 1.15), armBack: bone(-6, 8, -0.4), legFront: bone(7, 0, 0.1), legBack: bone(-5, 0, -0.1), head: bone(0, -6) }),
      // Frame 6: 蓄力保持 — 手臂过顶蓄力，重心微前移
      pose({ body: bone(2, -3, 0.08), armFront: bone(-2, -10, -0.5, 1.12), armBack: bone(-6, 8, -0.38), legFront: bone(8, 0, 0.12), legBack: bone(-6, 0, -0.1), head: bone(1, -5) }),
      // Frame 7: 即将下劈 — 身体开始前冲
      pose({ body: bone(4, -2, 0.12), armFront: bone(0, -6, -0.4, 1.1), armBack: bone(-6, 10, -0.35), legFront: bone(9, 0, 0.14), legBack: bone(-6, 0, -0.12), head: bone(2, -4) }),
      // Active (8-11): 手刀下劈 — 从头顶全力劈下
      pose({ head: bone(3, 0, 0.1), body: bone(8, 2, 0.2), armFront: bone(28, 8, 0.4, 1.35), armBack: bone(-8, 14, -0.45), legFront: bone(12, 2, 0.2), legBack: bone(-10, 2, -0.16) }),
      // Frame 9: 下劈巅峰 — 手刀最大延伸，身体前倾
      pose({ head: bone(4, 2, 0.12), body: bone(10, 4, 0.24), armFront: bone(30, 12, 0.45, 1.4), armBack: bone(-8, 16, -0.5), legFront: bone(14, 4, 0.22), legBack: bone(-12, 4, -0.18) }),
      // Frame 10: 下劈维持
      pose({ head: bone(3, 1, 0.1), body: bone(8, 3, 0.2), armFront: bone(28, 10, 0.42, 1.32), armBack: bone(-8, 15, -0.48), legFront: bone(12, 3, 0.2), legBack: bone(-10, 3, -0.16) }),
      // Frame 11: 下劈回收
      pose({ head: bone(2, 1, 0.06), body: bone(6, 2, 0.15), armFront: bone(22, 10, 0.35, 1.22), armBack: bone(-7, 14, -0.42), legFront: bone(10, 2, 0.16), legBack: bone(-8, 2, -0.14) }),
      // Recovery (12-17): 收回架势
      pose({ head: bone(1, 1, 0.04), body: bone(4, 2, 0.1), armFront: bone(16, 12, 0.28, 1.12), armBack: bone(-6, 14, -0.38), legFront: bone(8, 1, 0.1), legBack: bone(-6, 1, -0.08) }),
      pose({ head: bone(0, 0, 0.02), body: bone(2, 1, 0.06), armFront: bone(12, 14, 0.24, 1.05), armBack: bone(-6, 14, -0.36), legFront: bone(7, 0, 0.06), legBack: bone(-5, 0, -0.06) }),
      pose({ head: bone(0, 0, 0.01), body: bone(1, 1, 0.04), armFront: bone(10, 16, 0.22, 1.0), armBack: bone(-6, 14, -0.35), legFront: bone(7, 0, 0.04), legBack: bone(-5, 0, -0.04) }),
      pose({ head: bone(0, 0), body: bone(0, 0), armFront: bone(10, 16, 0.2), armBack: bone(-6, 14, -0.35), legFront: bone(6, 0, 0.02), legBack: bone(-4, 0, -0.02) }),
    ],

    // ↘+B 落蹴 (Orishi — low kick): startup=8, active=4, recovery=20
    [AttackType.RYO_ORISHI]: [
      // Startup (0-7): 蹲下蓄力 — 重心下沉，腿折叠蓄力
      pose({ body: bone(0, 6, 0.05), armFront: bone(8, 18, 0.15), armBack: bone(-6, 16, -0.3), legFront: bone(8, 4, 0.2), legBack: bone(-6, 4, -0.15), head: bone(0, 2) }),
      // Frame 1: 加深蹲 — 重心继续下沉
      pose({ body: bone(2, 10, 0.08), armFront: bone(8, 20, 0.12), armBack: bone(-6, 18, -0.28), legFront: bone(12, 8, 0.28), legBack: bone(-10, 6, -0.22), head: bone(1, 3) }),
      // Frame 2: 蹲至最深 — 前腿最大折叠，蓄力巅峰
      pose({ body: bone(3, 16, 0.12), armFront: bone(8, 24, 0.08), armBack: bone(-6, 22, -0.22), legFront: bone(16, 14, 0.35), legBack: bone(-14, 10, -0.25), head: bone(1, 5) }),
      // Frame 3: 保持深蹲 — 重心微前移
      pose({ body: bone(4, 16, 0.14), armFront: bone(8, 22, 0.06), armBack: bone(-6, 20, -0.2), legFront: bone(16, 14, 0.34), legBack: bone(-14, 10, -0.24), head: bone(1, 5) }),
      // Frame 4: 重心前移 — 准备踢出
      pose({ body: bone(3, 12, 0.1), armFront: bone(8, 20, 0.1), armBack: bone(-6, 18, -0.24), legFront: bone(14, 10, 0.3), legBack: bone(-12, 8, -0.22), head: bone(1, 4) }),
      // Frame 5: 即将踢出 — 重心继续前移
      pose({ body: bone(4, 10, 0.1), armFront: bone(8, 20, 0.1), armBack: bone(-6, 18, -0.24), legFront: bone(14, 8, 0.28), legBack: bone(-12, 6, -0.2), head: bone(1, 3) }),
      // Frame 6: 踢出前夕 — 身体前倾
      pose({ body: bone(5, 8, 0.1), armFront: bone(8, 18, 0.12), armBack: bone(-6, 16, -0.26), legFront: bone(14, 6, 0.25), legBack: bone(-12, 4, -0.18), head: bone(1, 3) }),
      // Frame 7: 踢出瞬间 — 腿即将弹出
      pose({ body: bone(5, 6, 0.1), armFront: bone(8, 16, 0.14), armBack: bone(-6, 14, -0.28), legFront: bone(14, 4, 0.22), legBack: bone(-12, 2, -0.16), head: bone(1, 2) }),
      // Active (8-11): 低段扫腿 — 腿低空扫出
      pose({ head: bone(1, 4, 0.06), body: bone(6, 14, 0.16), armFront: bone(8, 24, 0.1), armBack: bone(-6, 22, -0.2), legFront: bone(28, 10, 0.15, 1.25), legBack: bone(-14, 10, -0.25) }),
      // Frame 9: 扫腿巅峰 — 腿最大水平延伸
      pose({ head: bone(2, 5, 0.08), body: bone(8, 16, 0.18), armFront: bone(8, 26, 0.08), armBack: bone(-6, 24, -0.18), legFront: bone(32, 12, 0.1, 1.3), legBack: bone(-16, 12, -0.28) }),
      // Frame 10: 扫腿维持
      pose({ head: bone(2, 5, 0.08), body: bone(7, 15, 0.16), armFront: bone(8, 24, 0.1), armBack: bone(-6, 22, -0.2), legFront: bone(30, 11, 0.12, 1.26), legBack: bone(-15, 11, -0.26) }),
      // Frame 11: 扫腿回收
      pose({ head: bone(1, 4, 0.06), body: bone(5, 12, 0.12), armFront: bone(8, 22, 0.12), armBack: bone(-6, 20, -0.24), legFront: bone(22, 8, 0.2, 1.15), legBack: bone(-12, 8, -0.22) }),
      // Recovery (12-16): 收腿起身
      pose({ head: bone(1, 3, 0.04), body: bone(3, 10, 0.08), armFront: bone(8, 20, 0.15), armBack: bone(-6, 18, -0.28), legFront: bone(16, 6, 0.22), legBack: bone(-10, 6, -0.18) }),
      pose({ head: bone(0, 2, 0.02), body: bone(2, 6, 0.04), armFront: bone(8, 18, 0.18), armBack: bone(-6, 16, -0.3), legFront: bone(12, 3, 0.16), legBack: bone(-8, 3, -0.12) }),
      pose({ head: bone(0, 1, 0.01), body: bone(1, 4, 0.02), armFront: bone(8, 16, 0.2), armBack: bone(-6, 14, -0.32), legFront: bone(9, 1, 0.1), legBack: bone(-6, 1, -0.08) }),
      pose({ head: bone(0, 0), body: bone(0, 2, 0.01), armFront: bone(8, 16, 0.2), armBack: bone(-6, 14, -0.34), legFront: bone(7, 0, 0.06), legBack: bone(-5, 0, -0.06) }),
      pose({ head: bone(0, 0), body: bone(0, 0), armFront: bone(8, 16, 0.2), armBack: bone(-6, 14, -0.35), legFront: bone(6, 0, 0.02), legBack: bone(-4, 0, -0.02) }),
    ],
  },

  proportions: {
    headW: 44, headH: 48,
    torsoW: 64, torsoH: 82,
    armW: 26, armH: 60,
    legW: 30, legH: 74,
    shoulderY: 14, hipY: 78,
    torsoCenterY: 42, headCenterY: 8,
  },

  routeSpecial(input, cmdBuf, tick, _hasChargeRelease = false) {
    // DM: QCF×2+P → 天地霸煌拳
    const dmMotion = cmdBuf.checkDMMotion(tick, input.punchPressed, input.kickPressed);
    if (dmMotion === 'QCFx2_P') return AttackType.DM_TEN_HA_OU;

    // DM: QCF×2+K → 龍虎乱舞
    if (dmMotion === 'QCFx2_K') return AttackType.DM_RYUKO_RANBU;

    // DP+P → 虎咆 (弱P/强P区分)
    const special = cmdBuf.checkSpecial(tick, input.punchPressed || input.kickPressed);
    if (special === AttackType.SPECIAL_UPPER) {
      return input.buttonCPressed ? AttackType.RYO_KO_HOU_C : AttackType.RYO_KO_HOU;
    }

    // QCB+K → 飛燕疾風脚 (overhead)
    if (input.kickPressed && cmdBuf.hasQCB(tick)) {
      return AttackType.RYO_HIEN;
    }

    // QCF+K → 霸王翔吼拳 (counter)
    if (input.kickPressed && cmdBuf.hasQCF(tick)) {
      return AttackType.RYO_HAOU;
    }

    // QCF+P → 虎煌 (弱P/强P区分)
    if (special === AttackType.SPECIAL_PROJECTILE) {
      return input.buttonCPressed ? AttackType.RYO_KOOU_C : AttackType.RYO_KOOU;
    }

    return null;
  },

  routeNormal(input, state, _isCloseRange) {
    const isAir = state === FighterState.JUMP
      || state === FighterState.RUN_JUMP
      || state === FighterState.HOP
      || state === FighterState.HYPER_JUMP;
    if (isAir) return null;
    // →+A 冰柱割り (overhead)
    if (input.buttonAPressed && input.forward && !input.down) return AttackType.RYO_TSURIZAO;
    // ↘+B 落蹴 (low)
    if (input.buttonBPressed && input.forward && input.down) return AttackType.RYO_ORISHI;
    return null;
  },

  routeRekkaFollowup() {
    return null;
  },

  onAttackActive(fighter, attackType, projectiles, playerIndex) {
    // 虎煌: spawn visible projectile (weak/strong)
    // Weak (A): 40x30 hitbox, 60 frames travel (~480px)
    // Strong (C): 50x35 hitbox, 60 frames travel (~480px)
    if ((attackType === AttackType.RYO_KOOU || attackType === AttackType.RYO_KOOU_C) && fighter.attackFrame === 0) {
      const isStrong = attackType === AttackType.RYO_KOOU_C;
      const hitW = isStrong ? 25 : 20;
      const hitH = isStrong ? 17.5 : 15;
      projectiles.push(new Projectile(
        fighter.x + 60 * fighter.facing, fighter.y - 100, fighter.facing,
        60, playerIndex, fighter.charId,
        hitW, hitH,
      ));
      return true;
    }
    // 虎咆: rise
    if (attackType === AttackType.RYO_KO_HOU) {
      fighter.vy = -6;
      return true;
    }
    if (attackType === AttackType.RYO_KO_HOU_C) {
      fighter.vy = -8;
      return true;
    }
    return false;
  },

  getRekkaChain() {
    return null;
  },

  isCommandThrow(_attackType) { return false; },
  getCounterConfig() {
    return {
      activeFrames: 20,
      counterAttack: AttackType.RYO_KO_HOU,
      counterDamage: 50,
      failureStun: 25,
    };
  },
};
