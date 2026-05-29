/**
 * Yuri Content Package — Animation Metadata
 */

export interface AnimationMeta {
  name: string;
  type: 'loop' | 'once' | 'attack';
  totalFrames: number;
  ticksPerFrame: number;
  loop: boolean;
  transition: 'snap' | 'ease_in' | 'ease_out' | 'blend';
  description: string;
}

export const YURI_ANIMATION_META: Record<string, AnimationMeta> = {
  // Basic movement
  idle: { name: 'Standing Idle', type: 'loop', totalFrames: 7, ticksPerFrame: 8, loop: true, transition: 'snap', description: '立ち待機' },
  walk_forward: { name: 'Walk Forward', type: 'loop', totalFrames: 8, ticksPerFrame: 6, loop: true, transition: 'blend', description: '前進歩行' },
  walk_backward: { name: 'Walk Backward', type: 'loop', totalFrames: 8, ticksPerFrame: 6, loop: true, transition: 'blend', description: '後退歩行' },
  crouch: { name: 'Crouch', type: 'once', totalFrames: 2, ticksPerFrame: 4, loop: false, transition: 'ease_in', description: 'しゃがみ' },
  jump: { name: 'Jump', type: 'once', totalFrames: 14, ticksPerFrame: 3, loop: false, transition: 'snap', description: 'ジャンプ' },
  run: { name: 'Run', type: 'loop', totalFrames: 4, ticksPerFrame: 3, loop: true, transition: 'blend', description: 'ダッシュ' },
  backdash: { name: 'Backdash', type: 'once', totalFrames: 8, ticksPerFrame: 3, loop: false, transition: 'ease_out', description: 'バックステップ' },

  // Stand normals
  stand_a: { name: 'Stand A (Jab)', type: 'attack', totalFrames: 4, ticksPerFrame: 3, loop: false, transition: 'snap', description: '立ちA' },
  stand_b: { name: 'Stand B (Straight)', type: 'attack', totalFrames: 4, ticksPerFrame: 3, loop: false, transition: 'snap', description: '立ちB' },
  stand_c: { name: 'Stand C (Hook)', type: 'attack', totalFrames: 5, ticksPerFrame: 3, loop: false, transition: 'snap', description: '立ちC' },
  stand_d: { name: 'Stand D (Kick)', type: 'attack', totalFrames: 5, ticksPerFrame: 3, loop: false, transition: 'snap', description: '立ちD' },

  // Close normals
  close_a: { name: 'Close A (Elbow)', type: 'attack', totalFrames: 4, ticksPerFrame: 3, loop: false, transition: 'snap', description: '近距離立ちA' },
  close_b: { name: 'Close B (Knee)', type: 'attack', totalFrames: 4, ticksPerFrame: 3, loop: false, transition: 'snap', description: '近距離立ちB' },
  close_c: { name: 'Close C (Uppercut)', type: 'attack', totalFrames: 5, ticksPerFrame: 3, loop: false, transition: 'snap', description: '近距離立ちC' },
  close_d: { name: 'Close D (Side Kick)', type: 'attack', totalFrames: 5, ticksPerFrame: 3, loop: false, transition: 'snap', description: '近距離立ちD' },

  // Crouch normals
  crouch_a: { name: 'Crouch A (Jab)', type: 'attack', totalFrames: 4, ticksPerFrame: 3, loop: false, transition: 'snap', description: 'しゃがみA' },
  crouch_b: { name: 'Crouch B (Low Kick)', type: 'attack', totalFrames: 4, ticksPerFrame: 3, loop: false, transition: 'snap', description: 'しゃがみB' },
  crouch_c: { name: 'Crouch C (Upper)', type: 'attack', totalFrames: 5, ticksPerFrame: 3, loop: false, transition: 'snap', description: 'しゃがみC' },
  crouch_d: { name: 'Crouch D (Sweep)', type: 'attack', totalFrames: 5, ticksPerFrame: 3, loop: false, transition: 'snap', description: 'しゃがみD' },

  // Jump normals
  jump_a: { name: 'Jump A (Air Punch)', type: 'attack', totalFrames: 5, ticksPerFrame: 3, loop: false, transition: 'snap', description: 'ジャンプA' },
  jump_b: { name: 'Jump B (Air Kick)', type: 'attack', totalFrames: 5, ticksPerFrame: 3, loop: false, transition: 'snap', description: 'ジャンプB' },
  jump_c: { name: 'Jump C (Air Chop)', type: 'attack', totalFrames: 5, ticksPerFrame: 3, loop: false, transition: 'snap', description: 'ジャンプC' },
  jump_d: { name: 'Jump D (Air Kick)', type: 'attack', totalFrames: 6, ticksPerFrame: 3, loop: false, transition: 'snap', description: 'ジャンプD' },

  // States
  hurt_stand_light: { name: 'Stand Hurt Light', type: 'once', totalFrames: 4, ticksPerFrame: 4, loop: false, transition: 'ease_out', description: '立ち軽傷' },
  hurt_stand_heavy: { name: 'Stand Hurt Heavy', type: 'once', totalFrames: 3, ticksPerFrame: 4, loop: false, transition: 'ease_out', description: '立ち重傷' },
  hurt_crouch_light: { name: 'Crouch Hurt Light', type: 'once', totalFrames: 3, ticksPerFrame: 4, loop: false, transition: 'ease_out', description: 'しゃがみ軽傷' },
  hurt_crouch_heavy: { name: 'Crouch Hurt Heavy', type: 'once', totalFrames: 3, ticksPerFrame: 4, loop: false, transition: 'ease_out', description: 'しゃがみ重傷' },
  hurt_air: { name: 'Air Hurt', type: 'once', totalFrames: 3, ticksPerFrame: 4, loop: false, transition: 'snap', description: '空中被弾' },
  knockdown: { name: 'Knockdown', type: 'once', totalFrames: 11, ticksPerFrame: 4, loop: false, transition: 'ease_in', description: 'ダウン' },
  dizzy: { name: 'Dizzy', type: 'loop', totalFrames: 4, ticksPerFrame: 6, loop: true, transition: 'snap', description: '気絶' },

  // System
  guard_stand: { name: 'Stand Guard', type: 'once', totalFrames: 1, ticksPerFrame: 1, loop: false, transition: 'snap', description: '立ちガード' },
  guard_crouch: { name: 'Crouch Guard', type: 'once', totalFrames: 1, ticksPerFrame: 1, loop: false, transition: 'snap', description: 'しゃがみガード' },
  guard_air: { name: 'Air Guard', type: 'once', totalFrames: 1, ticksPerFrame: 1, loop: false, transition: 'snap', description: '空中ガード' },
  win: { name: 'Win Pose', type: 'once', totalFrames: 11, ticksPerFrame: 6, loop: false, transition: 'ease_out', description: '勝利ポーズ' },
  loss: { name: 'Loss', type: 'once', totalFrames: 6, ticksPerFrame: 8, loop: false, transition: 'ease_in', description: '敗北' },
  taunt: { name: 'Taunt', type: 'once', totalFrames: 8, ticksPerFrame: 6, loop: false, transition: 'snap', description: '挑発' },

  // Specials
  ko_ou_ken: { name: 'Ko-ou Ken', type: 'attack', totalFrames: 7, ticksPerFrame: 3, loop: false, transition: 'snap', description: '虎煌拳' },
  haoh_sho_ko_ken: { name: 'Haoh Sho Ko Ken', type: 'attack', totalFrames: 8, ticksPerFrame: 3, loop: false, transition: 'snap', description: '覇王翔吼拳' },
  chou_upper: { name: 'Yuri Chou Upper', type: 'attack', totalFrames: 6, ticksPerFrame: 3, loop: false, transition: 'snap', description: ' Yuri超 upper' },
  hyaku_retsu_binta: { name: 'Hyaku Retsu Binta', type: 'attack', totalFrames: 10, ticksPerFrame: 2, loop: false, transition: 'snap', description: '百裂びんた' },
  hien_hou_ou_kyaku: { name: 'Hien Hou\'ou Kyaku', type: 'attack', totalFrames: 12, ticksPerFrame: 3, loop: false, transition: 'snap', description: '飛燕鳳凰脚' },
  hishou_kuuretsu_zan: { name: 'Hishou Kuuretsu Zan', type: 'attack', totalFrames: 8, ticksPerFrame: 3, loop: false, transition: 'snap', description: '飛翔空裂斬' },
  rai_ken: { name: 'Rai Ken', type: 'attack', totalFrames: 6, ticksPerFrame: 3, loop: false, transition: 'snap', description: '雷煌拳' },

  // DM/SDM/HSDM
  dm_haoh_sho_ko_ken: { name: 'DM Haoh Sho Ko Ken', type: 'attack', totalFrames: 12, ticksPerFrame: 3, loop: false, transition: 'snap', description: 'DM覇王翔吼拳' },
  dm_hien_hou_ou_kyaku: { name: 'DM Hien Hou\'ou Kyaku', type: 'attack', totalFrames: 16, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'DM飛燕鳳凰脚' },
  sdm_haoh_sho_ko_ken: { name: 'SDM Haoh Sho Ko Ken', type: 'attack', totalFrames: 14, ticksPerFrame: 3, loop: false, transition: 'snap', description: 'SDM覇王翔吼拳' },
  sdm_hien_hou_ou_kyaku: { name: 'SDM Hien Hou\'ou Kyaku', type: 'attack', totalFrames: 18, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'SDM飛燕鳳凰脚' },
  hsdm_hishou_kuuretsu_zan: { name: 'HSDM Hishou Kuuretsu Zan', type: 'attack', totalFrames: 20, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'HSDM飛翔空裂斬' },

  // MAX mode
  max_mode: { name: 'MAX Mode', type: 'loop', totalFrames: 7, ticksPerFrame: 8, loop: true, transition: 'blend', description: 'MAXモード' },
  max_activation: { name: 'MAX Activation', type: 'once', totalFrames: 6, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'MAX発動' },
};

export function getYuriAnimationNames(): string[] {
  return Object.keys(YURI_ANIMATION_META);
}

export function getYuriAnimMeta(name: string): AnimationMeta | undefined {
  return YURI_ANIMATION_META[name];
}

export function getYuriAttackAnimations(): AnimationMeta[] {
  return Object.values(YURI_ANIMATION_META).filter(m => m.type === 'attack');
}

export function getYuriLoopAnimations(): AnimationMeta[] {
  return Object.values(YURI_ANIMATION_META).filter(m => m.loop);
}
