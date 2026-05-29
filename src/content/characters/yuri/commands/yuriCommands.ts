/**
 * Yuri Content Package — Commands
 *
 * Move list, win quotes, and available actions for Yuri Sakazaki.
 */

export interface YuriMoveEntry {
  name: string;
  nameJa: string;
  input: string;
  type: 'command' | 'special' | 'dm' | 'sdm' | 'hsdm' | 'system';
  attackTypeKey?: string;
}

export const YURI_MOVE_LIST: YuriMoveEntry[] = [
  // System
  { name: 'Run Forward', nameJa: 'ダッシュ', input: '→→', type: 'system' },
  { name: 'Back Step', nameJa: 'バックステップ', input: '←←', type: 'system' },
  { name: 'Roll Forward', nameJa: '前方回避', input: 'A+B', type: 'system' },
  { name: 'Roll Backward', nameJa: '後方回避', input: '←+A+B', type: 'system' },
  { name: 'Guard Cancel Roll', nameJa: 'GC回避', input: 'ガード中→+A+B', type: 'system' },
  { name: 'Guard Cancel CD', nameJa: 'GC CD攻撃', input: 'ガード中C+D', type: 'system' },
  { name: 'Blowback Attack', nameJa: 'ふっ飛ばし攻撃', input: 'C+D', type: 'command' },
  { name: 'Jump Blowback', nameJa: '空中ふっ飛ばし攻撃', input: '空中C+D', type: 'command' },

  // Command Normals
  { name: 'Upper Block', nameJa: '上段受け', input: '→+B', type: 'command', attackTypeKey: 'YURI_UPPER_BLOCK' },
  { name: 'Lower Block', nameJa: '下段受け', input: '↘+B', type: 'command', attackTypeKey: 'YURI_LOWER_BLOCK' },
  { name: 'Yuri Ori', nameJa: '百合折り', input: '空中←+B', type: 'command', attackTypeKey: 'YURI_ORI' },

  // Throws
  { name: 'Tsubame Otoshi', nameJa: '燕落とし', input: '近距離で→ or ←+C', type: 'command', attackTypeKey: 'YURI_THROW_C' },
  { name: 'Tsubame Otoshi', nameJa: '燕落とし', input: '近距離で→ or ←+D', type: 'command', attackTypeKey: 'YURI_THROW_D' },
  { name: 'Air Throw', nameJa: '空中投げ', input: '空中で→ or ←+C', type: 'command', attackTypeKey: 'YURI_AIR_THROW' },

  // Specials
  { name: 'Ko-ou Ken', nameJa: '虎煌拳', input: '↓↘→+A or C', type: 'special', attackTypeKey: 'YURI_KO_OU_KEN' },
  { name: 'Haoh Sho Ko Ken', nameJa: '覇王翔吼拳', input: '→←↙↓↘→+A or C', type: 'special', attackTypeKey: 'YURI_HAOH_SHO_KO_KEN' },
  { name: 'Yuri Chou Upper', nameJa: ' Yuri超 upper', input: '→↓↘+A or C', type: 'special', attackTypeKey: 'YURI_CHOU_UPPER' },
  { name: 'Hyaku Retsu Binta', nameJa: '百裂びんた', input: '↓↘→+B or D', type: 'special', attackTypeKey: 'YURI_HYAKU_RETSU_BINTA' },
  { name: 'Rai Ken', nameJa: '雷煌拳', input: '↓↘→+B or D (空中可)', type: 'special', attackTypeKey: 'YURI_RAI_KEN' },
  { name: "Hien Hou'ou Kyaku", nameJa: '飛燕鳳凰脚', input: '↓↙←+B or D', type: 'special', attackTypeKey: 'YURI_HIEN_HOU_OU_KYAKU' },
  { name: 'Hishou Kuuretsu Zan', nameJa: '飛翔空裂斬', input: '空中↓↙←+B or D', type: 'special', attackTypeKey: 'YURI_HISHOU_KUURETSU_ZAN' },

  // DM
  { name: 'Haoh Sho Ko Ken', nameJa: '覇王翔吼拳', input: '↓↘→↓↘→+A or C', type: 'dm', attackTypeKey: 'DM_YURI_HAOH_SHO_KO_KEN' },
  { name: 'Hien Hou\'ou Kyaku', nameJa: '飛燕鳳凰脚', input: '↓↘→↘↓↙←+B or D', type: 'dm', attackTypeKey: 'DM_YURI_HIEN_HOU_OU_KYAKU' },

  // SDM
  { name: 'Haoh Sho Ko Ken', nameJa: '覇王翔吼拳', input: '↓↘→↓↘→+A+C', type: 'sdm', attackTypeKey: 'SDM_YURI_HAOH_SHO_KO_KEN' },
  { name: 'Hien Hou\'ou Kyaku', nameJa: '飛燕鳳凰脚', input: '↓↘→↘↓↙←+B+D', type: 'sdm', attackTypeKey: 'SDM_YURI_HIEN_HOU_OU_KYAKU' },

  // HSDM
  { name: 'Hishou Kuuretsu Zan', nameJa: '飛翔空裂斬', input: '↓↘→↓↘→+B+D', type: 'hsdm', attackTypeKey: 'HSDM_YURI_HISHOU_KUURETSU_ZAN' },
];

export const YURI_WIN_QUOTES: string[] = [
  'まだまだ甘いね！ / You\'re still too soft!',
  '修行が足りないよ！ / You need more training!',
  'お父さんにも勝てないくせに！ / You can\'t even beat my dad!',
  'ロバートには内緒だよ！ / Keep this a secret from Robert!',
  'もっと強くなりたいな！ / I want to become even stronger!',
];

export const YURI_AVAILABLE_ACTIONS: string[] = [
  'idle', 'walk_forward', 'walk_backward', 'crouch', 'jump', 'jump_forward', 'jump_backward',
  'stand_a', 'stand_b', 'stand_c', 'stand_d',
  'close_a', 'close_b', 'close_c', 'close_d',
  'crouch_a', 'crouch_b', 'crouch_c', 'crouch_d',
  'jump_a', 'jump_b', 'jump_c', 'jump_d',
  'blowback', 'jump_blowback',
  'guard_stand', 'guard_crouch', 'guard_air',
  'hurt_stand_light', 'hurt_stand_heavy', 'hurt_crouch_light', 'hurt_crouch_heavy',
  'hurt_air', 'knockdown', 'dizzy', 'win', 'loss', 'taunt',
  'run', 'backdash', 'roll_forward', 'roll_backward',
  'throw_c', 'throw_d', 'air_throw',
  'ko_ou_ken', 'haoh_sho_ko_ken', 'chou_upper', 'hyaku_retsu_binta',
  'hien_hou_ou_kyaku', 'hishou_kuuretsu_zan', 'rai_ken',
  'dm_haoh_sho_ko_ken', 'dm_hien_hou_ou_kyaku',
  'sdm_haoh_sho_ko_ken', 'sdm_hien_hou_ou_kyaku',
  'hsdm_hishou_kuuretsu_zan',
  'max_mode', 'max_activation',
];
