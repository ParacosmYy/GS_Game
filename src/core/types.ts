// ===== Fighter States =====
export enum FighterState {
  IDLE = 'IDLE',
  WALK = 'WALK',
  RUN = 'RUN',
  BACKDASH = 'BACKDASH',
  JUMP = 'JUMP',
  RUN_JUMP = 'RUN_JUMP',
  HOP = 'HOP',
  HYPER_JUMP = 'HYPER_JUMP',
  CROUCH = 'CROUCH',
  ROLL = 'ROLL',
  BACK_ROLL = 'BACK_ROLL',
  STAND_ATTACK = 'STAND_ATTACK',
  CROUCH_ATTACK = 'CROUCH_ATTACK',
  AIR_ATTACK = 'AIR_ATTACK',
  COUNTER_STANCE = 'COUNTER_STANCE',
  THROW = 'THROW',
  BLOCK = 'BLOCK',
  AIR_BLOCK = 'AIR_BLOCK',
  GUARD_CRUSH = 'GUARD_CRUSH',
  HITSTUN = 'HITSTUN',
  KNOCKDOWN = 'KNOCKDOWN',
  MAX_MODE = 'MAX_MODE',  // MAX模式激活动画 (短暂)
  TAUNT = 'TAUNT',        // 嘲讽 (Start键，削减对手气槽)
}

// ===== Attack Types (KOF 4-button: A=轻拳 B=轻脚 C=重拳 D=重脚) =====
export enum AttackType {
  // 站立 远距离 (Far Stand)
  STAND_A = 'STAND_A',
  STAND_B = 'STAND_B',
  STAND_C = 'STAND_C',
  STAND_D = 'STAND_D',
  // 站立 近距离 (Close Stand) — 对手在80px内
  CLOSE_A = 'CLOSE_A',
  CLOSE_B = 'CLOSE_B',
  CLOSE_C = 'CLOSE_C',
  CLOSE_D = 'CLOSE_D',
  // 命令通常技 (Command Normals)
  CMD_GOFU_YOU = 'CMD_GOFU_YOU',   // →+B 外式·轟斧陽 (overhead)
  CMD_88SHIKI = 'CMD_88SHIKI',     // ↘+D 八拾八式 (下段2Hit)
  CMD_NARAKU = 'CMD_NARAKU',       // 空中↓+C 外式·奈落落とし
  // Iori 命令通常技
  IORI_YUMEYUMI = 'IORI_YUMEYUMI',         // →+A 夢弾 (2-hit overhead)
  IORI_KATANUGI = 'IORI_KATANUGI',         // ↘+B 邯鄲 (low)
  IORI_YUKIWARUI = 'IORI_YUKIWARUI',       // 空中↓+C 百合折り (air crossup)
  // Terry 命令通常技
  TERRY_BACK_KNCKLE = 'TERRY_BACK_KNCKLE', // →+A Back Knuckle (overhead)
  TERRY_COMBO_BLOW = 'TERRY_COMBO_BLOW',   // ↘+B Combination Blow (low)
  // Kim 命令通常技
  KIM_HISHOU_KICK = 'KIM_HISHOU_KICK',     // →+B 飛翔脚 (overhead)
  KIM_HANSEN = 'KIM_HANSEN',               // ↘+D 半旋蹴 (2-hit mid)
  // Ryo 命令通常技
  RYO_TSURIZAO = 'RYO_TSURIZAO',           // →+A 冰柱割り (overhead)
  RYO_ORISHI = 'RYO_ORISHI',               // ↘+B 落蹴 (low)
  // K' 命令通常技
  KDASH_ONE_INCH = 'KDASH_ONE_INCH',       // →+B One Inch (overhead)
  KDASH_TRIGGER = 'KDASH_TRIGGER',         // ↘+D Trigger Shot (low)
  // Kula 命令通常技
  KULA_ONE_MORE = 'KULA_ONE_MORE',         // →+B One More Icy (overhead)
  KULA_SLIDER = 'KULA_SLIDER',             // ↘+D Slider Shoot (low)
  // Leona 命令通常技
  LEONA_STRIKE_ARC = 'LEONA_STRIKE_ARC',   // →+B Strike Arc (overhead)
  LEONA_STRIKE_DASH = 'LEONA_STRIKE_DASH', // 空中↓+D Strike Dash (air dive)
  // Mai 命令通常技
  MAI_HISSATSU_SHINOBIBACHI = 'MAI_HISSATSU_SHINOBIBACHI', // →+B 必殺忍蜂 (overhead)
  MAI_YUSURA_UMA = 'MAI_YUSURA_UMA',                     // ↘+B 夕櫻舞 (low)
  // Robert 命令通常技
  ROBERT_GENEI_KYAKU_CMD = 'ROBERT_GENEI_KYAKU_CMD', // →+A 幻影脚 (overhead)
  ROBERT_KOU_SHUTAI = 'ROBERT_KOU_SHUTAI',           // ↘+B 龍舞脚 (low)
  // Athena 命令通常技
  ATHENA_PHOENIX_REFLECT = 'ATHENA_PHOENIX_REFLECT', // →+B Psycho Reflect (overhead)
  ATHENA_LOW_B = 'ATHENA_LOW_B',                     // ↘+B (low)
  ATHENA_AIR_B = 'ATHENA_AIR_B',                     // 空中↓+B (air crossup)
  // 乔·东命令通常技 (Joe Higashi Command Normals)
  JOE_KNEE_KICK = 'JOE_KNEE_KICK',                   // →+A Knee Kick (mid)
  JOE_SLIDE = 'JOE_SLIDE',                           // →+B Slide (low)
  // 拉尔夫命令通常技
  RALF_SABRE_PUNCH = 'RALF_SABRE_PUNCH',             // →+A Sabre Punch (mid)
  RALF_SABRE_KICK = 'RALF_SABRE_KICK',               // →+B Sabre Kick (low)
  // 安迪命令通常技 (Andy Bogard Command Normals)
  ANDY_UWA_AGITO = 'ANDY_UWA_AGITO',                 // →+A 上顎 (overhead)
  ANDY_GEDAN_AGITO = 'ANDY_GEDAN_AGITO',             // →+B 下顎 (low)
  // 比利命令通常技 (Billy Kane Command Normals)
  BILLY_SANDAN_GEAR = 'BILLY_SANDAN_GEAR',           // →+A Sandan Gear (upper)
  BILLY_SENSHU_IKKYAKU = 'BILLY_SENSHU_IKKYAKU',     // →+B Senshu Ikkyaku (low)
  // 陈可汗命令通常技 (Chang Koehan Command Normals)
  CHANG_HIKI_NAGE = 'CHANG_HIKI_NAGE',               // →+A Hiki Nage (throw-like)
  CHANG_KYUUSHUU = 'CHANG_KYUUSHUU',                 // →+B Kyuushuu Geri (low)
  // 蔡宝奇命令通常技 (Choi Bounge Command Normals)
  CHOI_SOUTEN_MEKKYAKU = 'CHOI_SOUTEN_MEKKYAKU',     // →+A Souten Mekkyaku (upper)
  CHOI_SAN_REN_GEKI = 'CHOI_SAN_REN_GEKI',           // →+B San Ren Geki (low)
  // 玛卓命令通常技 (Mature Command Normals)
  MATURE_DESPAIR = 'MATURE_DESPAIR',                 // →+A Despair (upper)
  MATURE_JAB = 'MATURE_JAB',                         // →+B Jab (low)
  // 薇丝命令通常技 (Vice Command Normals)
  VICE_MONSTROSITY = 'VICE_MONSTROSITY',             // →+A Monstrosity (upper)
  VICE_OVERKILL = 'VICE_OVERKILL',                   // →+B Overkill (low)
  // 大门五郎命令通常技 (Yashiro Nanakase Command Normals)
  YASHIRO_SHUU_WANI = 'YASHIRO_SHUU_WANI',           // →+A Shuu Wani (upper)
  YASHIRO_JUU_ZUTSU = 'YASHIRO_JUU_ZUTSU',           // →+B Juu Zutsu (overhead)
  // 克里斯命令通常技 (Chris Command Normals)
  CHRIS_MAKASHIPPO = 'CHRIS_MAKASHIPPO',             // →+A Makashippo (upper)
  CHRIS_KAZAGURUMA = 'CHRIS_KAZAGURUMA',             // →+B Kazaguruma (low)
  // 夏尔美命令通常技 (Shermie Command Normals)
  SHERMIE_STAND = 'SHERMIE_STAND',                   // →+A Shermie Stand (upper)
  SHERMIE_CLASH = 'SHERMIE_CLASH',                   // →+B Shermie Clash (low)
  // 李香绯命令通常技 (Li Xiangfei Command Normals)
  XIANGFEI_KYU_HO = 'XIANGFEI_KYU_HO',               // →+A Kyu Ho (upper)
  XIANGFEI_KAKU_DA = 'XIANGFEI_KAKU_DA',             // →+B Kaku Da (low)
  // 山崎龙二命令通常技 (Yamazaki Command Normals)
  YAMAZAKI_SASHI = 'YAMAZAKI_SASHI',                 // →+A Sashi (upper)
  YAMAZAKI_BOKKAI = 'YAMAZAKI_BOKKAI',               // →+B Bokkai (low)
  // 藤堂香澄命令通常技 (Kasumi Todoh Command Normals)
  KASUMI_KOU_U = 'KASUMI_KOU_U',                     // →+A Kou'u upper (upper)
  KASUMI_GESHIKI = 'KASUMI_GESHIKI',                 // →+B Geshiki (low)
  // 布鲁·玛丽命令通常技 (Blue Mary Command Normals)
  MARY_HAMMER_PUNCH = 'MARY_HAMMER_PUNCH',           // →+A Hammer Punch (upper)
  MARY_DOUBLE_ROLLING = 'MARY_DOUBLE_ROLLING',       // →+B Double Rolling (low)
  // 蹲下 (Crouch)
  CROUCH_A = 'CROUCH_A',
  CROUCH_B = 'CROUCH_B',
  CROUCH_C = 'CROUCH_C',
  CROUCH_D = 'CROUCH_D',
  // 跳跃 (Jump)
  JUMP_A = 'JUMP_A',
  JUMP_B = 'JUMP_B',
  JUMP_C = 'JUMP_C',
  JUMP_D = 'JUMP_D',
  // Blowback Attack (CD攻击)
  STAND_CD = 'STAND_CD',
  JUMP_CD = 'JUMP_CD',
  // 投技 & 通用必杀技
  THROW = 'THROW',
  THROW_FORWARD = 'THROW_FORWARD',
  THROW_BACK = 'THROW_BACK',
  SPECIAL_PROJECTILE = 'SPECIAL_PROJECTILE',
  SPECIAL_UPPER = 'SPECIAL_UPPER',
  // 京专属必杀技 (Kyo Specials)
  KYO_75KAI = 'KYO_75KAI',         // 75式·改 ↓↘→+K,K
  KYO_75KAI_2 = 'KYO_75KAI_2',     // 75式·改 第二段
  KYO_RED_KICK = 'KYO_RED_KICK',   // R.E.D. Kick ←↓↙+K
  KYO_ONIYAKI = 'KYO_ONIYAKI',     // 鬼焼き →↓↘+A (weak upper)
  KYO_ONIYAKI_C = 'KYO_ONIYAKI_C', // 鬼焼き →↓↘+C (strong upper, invincible)
  KYO_YAMIBARAI = 'KYO_YAMIBARAI', // 闇払い ↓↘→+A (weak projectile)
  KYO_YAMIBARAI_C = 'KYO_YAMIBARAI_C', // 闇払い ↓↘→+C (strong projectile, faster)
  // 荒咬み连段系 (Aragami Chain)
  KYO_ARAGAMI = 'KYO_ARAGAMI',             // 114式·荒咬み ↓↘→+A
  KYO_ARAGAMI_KONOKIZU = 'KYO_ARAGAMI_KONOKIZU',   // 128式·九傷
  KYO_ARAGAMI_YANOSABI = 'KYO_ARAGAMI_YANOSABI',   // 127式·八錆
  KYO_NANASE = 'KYO_NANASE',                       // 七瀬
  KYO_KOTO_TSUKI = 'KYO_KOTO_TSUKI',               // 琴月陽
  KYO_YAKISOGI = 'KYO_YAKISOGI',                   // 破砕
  // 毒咬み连段系 (Dokugami Chain)
  KYO_DOKUGAMI = 'KYO_DOKUGAMI',         // 115式·毒咬み ↓↘→+C
  KYO_TSUMIYOMI = 'KYO_TSUMIYOMI',       // 401式·罪詠み
  KYO_BATSUYOMI = 'KYO_BATSUYOMI',       // 402式·罰詠み
  // 八神庵必杀技 (Iori Specials)
  IORI_AOIHANA = 'IORI_AOIHANA',       // 葵花 QCB+P (rekka)
  IORI_AOIHANA_2 = 'IORI_AOIHANA_2',   // 葵花 第二段
  IORI_AOIHANA_3 = 'IORI_AOIHANA_3',   // 葵花 第三段
  IORI_YAMIBARAI = 'IORI_YAMIBARAI',   // 闇払い ↓↘→+A (weak projectile)
  IORI_YAMIBARAI_C = 'IORI_YAMIBARAI_C', // 闇払い ↓↘→+C (strong projectile, faster)
  IORI_ONIYAKI = 'IORI_ONIYAKI',       // 鬼焼き →↓↘+A (weak upper)
  IORI_ONIYAKI_C = 'IORI_ONIYAKI_C',   // 鬼焼き →↓↘+C (strong upper, invincible)
  IORI_KOTOTSUKI = 'IORI_KOTOTSUKI',   // 琴月陰 ←↙↓↘→+K (dash)
  IORI_KUZUKAZE = 'IORI_KUZUKAZE',     // 屑風 ←↙↓↘→↗↓↙←+P (command throw)
  // 特瑞必杀技 (Terry Specials)
  TERRY_POWER_WAVE = 'TERRY_POWER_WAVE',       // Power Wave ↓↘→+P (projectile)
  TERRY_BURN_KNUCKLE = 'TERRY_BURN_KNUCKLE',   // Burn Knuckle ←↙↓+P
  TERRY_CRACK_SHOT = 'TERRY_CRACK_SHOT',       // Crack Shot ←↙↓+K
  TERRY_POWER_DUNK = 'TERRY_POWER_DUNK',       // Power Dunk →↓↘+K (升龙)
  TERRY_RISING_TACKLE = 'TERRY_RISING_TACKLE', // Rising Tackle ↓蓄↑+P (charge)
  // 金必杀技 (Kim Specials)
  KIM_HIENZAN = 'KIM_HIENZAN',         // 飛燕斬 ↓蓄↑+K (升龙)
  KIM_HANGETSU = 'KIM_HANGETSU',       // 半月斬 ←↙↓+K
  KIM_HAKI = 'KIM_HAKI',               // 覇気脚 ↓↓+K (low)
  KIM_HISHOU = 'KIM_HISHOU',           // 飛翔脚 空中↓↘→+K (air dive)
  KIM_SANREN = 'KIM_SANREN',           // 三連撃 ←↙↓+P chain
  // 坂崎亮必杀技 (Ryo Specials)
  RYO_KOOU = 'RYO_KOOU',             // 虎煌 ↓↘→+A (weak projectile)
  RYO_KOOU_C = 'RYO_KOOU_C',         // 虎煌 ↓↘→+C (strong projectile)
  RYO_KO_HOU = 'RYO_KO_HOU',         // 虎咆 →↓↘+A (weak upper)
  RYO_KO_HOU_C = 'RYO_KO_HOU_C',     // 虎咆 →↓↘+C (strong upper, invincible)
  RYO_HIEN = 'RYO_HIEN',             // 飛燕疾風脚 ←↙↓+K (overhead kick)
  RYO_HAOU = 'RYO_HAOU',             // 霸王翔吼拳 ↓↘→+K (counter)
  // 莉安娜必杀技 (Leona Specials)
  LEONA_MOON_SLASH = 'LEONA_MOON_SLASH',     // 月光 ↓↘→+A (weak projectile)
  LEONA_MOON_SLASH_C = 'LEONA_MOON_SLASH_C', // 月光 ↓↘→+C (strong projectile)
  LEONA_EAR_RING = 'LEONA_EAR_RING',         // 威光 →↓↘+A (weak upper)
  LEONA_EAR_RING_C = 'LEONA_EAR_RING_C',     // 威光 →↓↘+C (strong upper)
  LEONA_GRAND_SABER = 'LEONA_GRAND_SABER',   // 手刀 ←↙↓+P (rush)
  LEONA_BALTIC = 'LEONA_BALTIC',             // X标 ↓↘→+K (low)
  // 不知火舞必杀技 (Mai Shiranui Specials)
  MAI_KA_CHO_SEN = 'MAI_KA_CHO_SEN',               // 花蝶扇 ↓↘→+A (weak fan projectile)
  MAI_KA_CHO_SEN_C = 'MAI_KA_CHO_SEN_C',           // 花蝶扇 ↓↘→+C (strong fan projectile)
  MAI_HISHO_RYU_EN_JIN = 'MAI_HISHO_RYU_EN_JIN',   // 飛翔龍炎陣 →↓↘+K (fan lift upper)
  MAI_RYU_EN_BU = 'MAI_RYU_EN_BU',                 // 龍炎舞 ←↙↓+K (flame kick)
  // 罗伯特必杀技 (Robert Specials)
  ROBERT_RYU_GEKI = 'ROBERT_RYU_GEKI',             // 龍撃拳 ↓↘→+A (weak projectile)
  ROBERT_RYU_GEKI_C = 'ROBERT_RYU_GEKI_C',         // 龍撃拳 ↓↘→+C (strong projectile)
  ROBERT_RYU_ZAN = 'ROBERT_RYU_ZAN',               // 龍斬 →↓↘+A (weak upper)
  ROBERT_RYU_ZAN_C = 'ROBERT_RYU_ZAN_C',           // 龍斬 →↓↘+C (strong upper, invincible)
  ROBERT_HIEN_RYU_JIN = 'ROBERT_HIEN_RYU_JIN',     // 飛燕龍神脚 空中↓↘→+K (air dive)
  ROBERT_GENEI_KYAKU = 'ROBERT_GENEI_KYAKU',       // 幻影脚 ←↙↓+K (overhead kick)
  ROBERT_HIEN_RYU_KYAKU = 'ROBERT_HIEN_RYU_KYAKU', // 飛燕疾風龍脚 ↓↘→+K (rush kick)
  // K'必杀技 (K' Specials)
  KDASH_EINS = 'KDASH_EINS',                 // Eins Trigger ↓↘→+A (weak projectile)
  KDASH_EINS_C = 'KDASH_EINS_C',             // Eins Trigger ↓↘→+C (strong projectile)
  KDASH_CROW = 'KDASH_CROW',                 // Crow Bites →↓↘+A (weak upper)
  KDASH_CROW_C = 'KDASH_CROW_C',             // Crow Bites →↓↘+C (strong upper)
  KDASH_MINUTE = 'KDASH_MINUTE',             // Minute Spike ←↙↓+K (overhead)
  KDASH_NARROW = 'KDASH_NARROW',             // Narrow Spike ↓↘→+K (low)
  // 库拉必杀技 (Kula Specials)
  KULA_BREATH = 'KULA_BREATH',               // Diamond Breath ↓↘→+A (weak projectile)
  KULA_BREATH_C = 'KULA_BREATH_C',           // Diamond Breath ↓↘→+C (strong projectile)
  KULA_SHELL = 'KULA_SHELL',                 // Counter Shell →↓↘+A (weak upper)
  KULA_SHELL_C = 'KULA_SHELL_C',             // Counter Shell →↓↘+C (strong upper)
  KULA_LAY = 'KULA_LAY',                     // Lay On ←↙↓+K (sliding)
  KULA_EDGE = 'KULA_EDGE',                   // Diamond Edge ↓↘→+K (low)
  // 雅典娜必杀技 (Athena Specials)
  ATHENA_PSYCHO_BALL = 'ATHENA_PSYCHO_BALL',         // Psycho Ball ↓↙←+A (weak projectile)
  ATHENA_PSYCHO_BALL_C = 'ATHENA_PSYCHO_BALL_C',     // Psycho Ball ↓↙←+C (strong projectile)
  ATHENA_PSYCHO_SWORD = 'ATHENA_PSYCHO_SWORD',       // Psycho Sword →↓↘+A (weak upper)
  ATHENA_PSYCHO_SWORD_C = 'ATHENA_PSYCHO_SWORD_C',   // Psycho Sword →↓↘+C (strong upper)
  ATHENA_PHOENIX_ARROW = 'ATHENA_PHOENIX_ARROW',     // Phoenix Arrow ↓↘→+K (air dive)
  // 克拉克必杀技 (Clark Still Specials)
  CLARK_DEATH_LAKE = 'CLARK_DEATH_LAKE',           // →+A Death Lake Drive (overhead)
  CLARK_STOMP = 'CLARK_STOMP',                     // →+B Stomp (low)
  CLARK_ARGENTINE = 'CLARK_ARGENTINE',             // QCB+A Super Argentine Backbreaker (command grab)
  CLARK_ARGENTINE_C = 'CLARK_ARGENTINE_C',         // QCB+C Super Argentine Backbreaker (strong)
  CLARK_FLASH_ELBOW = 'CLARK_FLASH_ELBOW',         // DP+P Flash Elbow (follow-up)
  CLARK_VULCAN = 'CLARK_VULCAN',                   // QCF+K Vulcan Punch (multi-hit)
  // 拉尔夫必杀技 (Ralf Jones Specials)
  RALF_VULCAN = 'RALF_VULCAN',                     // QCF+A Vulcan Punch (multi-hit rush)
  RALF_VULCAN_C = 'RALF_VULCAN_C',                 // QCF+C Vulcan Punch (more hits/damage)
  RALF_BACKBREAKER = 'RALF_BACKBREAKER',           // HCB+P Backbreaker (command grab)
  RALF_KICK = 'RALF_KICK',                         // QCB+K Ralf Kick (diving kick)
  // 乔·东必杀技 (Joe Higashi Specials)
  JOE_HURRICANE = 'JOE_HURRICANE',                       // QCF+A Hurricane Upper (projectile, fast)
  JOE_HURRICANE_C = 'JOE_HURRICANE_C',                   // QCF+C Hurricane Upper (projectile, strong)
  JOE_TIGER_KICK = 'JOE_TIGER_KICK',                     // DP+B Tiger Kick (upper, fast)
  JOE_TIGER_KICK_D = 'JOE_TIGER_KICK_D',                 // DP+D Tiger Kick (upper, invincible)
  JOE_BAKURETSUKEN = 'JOE_BAKURETSUKEN',                 // QCB+P Bakuretsuken (rush punches)
  JOE_OUGON_KAKATO = 'JOE_OUGON_KAKATO',                 // QCB+K Ougon no Kakato (diving kick)
  // 安迪必杀技 (Andy Bogard Specials)
  ANDY_HISHOU_KEN = 'ANDY_HISHOU_KEN',                     // QCF+A 飛翔拳 (weak projectile)
  ANDY_HISHOU_KEN_C = 'ANDY_HISHOU_KEN_C',                 // QCF+C 飛翔拳 (strong projectile)
  ANDY_SHOURYUU_DAN = 'ANDY_SHOURYUU_DAN',                 // DP+A 昇龍弾 (weak upper)
  ANDY_SHOURYUU_DAN_C = 'ANDY_SHOURYUU_DAN_C',             // DP+C 昇龍弾 (strong upper, more invincible)
  ANDY_ZANEI_RYUSEI_KEN = 'ANDY_ZANEI_RYUSEI_KEN',         // HCF+B 斬影流星拳 (short dash punch)
  ANDY_ZANEI_RYUSEI_KEN_D = 'ANDY_ZANEI_RYUSEI_KEN_D',     // HCF+D 斬影流星拳 (long dash punch)
  ANDY_GEKI_HISHOU_KEN = 'ANDY_GEKI_HISHOU_KEN',           // QCB+K 激飛翔拳 (air dive)
  // 比利必杀技 (Billy Kane Specials)
  BILLY_SANSETSU_KON = 'BILLY_SANSETSU_KON',           // QCF+A Sansetsu Kon (fast staff)
  BILLY_SANSETSU_KON_C = 'BILLY_SANSETSU_KON_C',       // QCF+C Sansetsu Kon (strong staff)
  BILLY_SENPU_KON = 'BILLY_SENPU_KON',                 // QCB+A Senpu Kon (anti-air)
  BILLY_SENPU_KON_C = 'BILLY_SENPU_KON_C',             // QCB+C Senpu Kon (strong anti-air)
  BILLY_HIEN_ZAN = 'BILLY_HIEN_ZAN',                   // QCB+B Kyousoku Hien Zan (short)
  BILLY_HIEN_ZAN_D = 'BILLY_HIEN_ZAN_D',               // QCB+D Kyousoku Hien Zan (long)
  // 陈可汗必杀技 (Chang Koehan Specials)
  CHANG_TEKKYUU_KAITEN = 'CHANG_TEKKYUU_KAITEN',         // QCF+A Tekkyuu Dai Kaiten
  CHANG_TEKKYUU_KAITEN_C = 'CHANG_TEKKYUU_KAITEN_C',     // QCF+C Tekkyuu Dai Kaiten (strong)
  CHANG_TEKKYUU_FASSHU = 'CHANG_TEKKYUU_FASSHU',         // QCB+P Tekkyuu Fasshu
  CHANG_TEKKYUU_HIEN_ZAN = 'CHANG_TEKKYUU_HIEN_ZAN',     // QCF+K Tekkyuu Hien Zan
  // 蔡宝奇必杀技 (Choi Bounge Specials)
  CHOI_HISHOU_KYAKU = 'CHOI_HISHOU_KYAKU',               // QCF+A Hishou Kyaku
  CHOI_HISHOU_KYAKU_C = 'CHOI_HISHOU_KYAKU_C',           // QCF+C Hishou Kyaku (strong)
  CHOI_KAITEN_HIEN_ZAN = 'CHOI_KAITEN_HIEN_ZAN',         // QCB+A Kaiten Hien Zan
  CHOI_KAITEN_HIEN_ZAN_C = 'CHOI_KAITEN_HIEN_ZAN_C',     // QCB+C Kaiten Hien Zan (strong)
  CHOI_HOUYOKU_TENSHIN = 'CHOI_HOUYOKU_TENSHIN',         // DP+K Houyoku Tenshin Sen
  // 玛卓必杀技 (Mature Specials)
  MATURE_MASSACRE = 'MATURE_MASSACRE',                 // QCF+A Metal Massacre
  MATURE_MASSACRE_C = 'MATURE_MASSACRE_C',             // QCF+C Metal Massacre (strong)
  MATURE_HEAVENS_GATE = 'MATURE_HEAVENS_GATE',         // QCB+P Heaven's Gate
  MATURE_ECSTASY = 'MATURE_ECSTASY',                   // DP+K Ecstasy 816
  // 薇丝必杀技 (Vice Specials)
  VICE_OUTRAGE = 'VICE_OUTRAGE',                       // QCF+A Outrage (weak rush)
  VICE_OUTRAGE_C = 'VICE_OUTRAGE_C',                   // QCF+C Outrage (strong rush)
  VICE_BLACK_END = 'VICE_BLACK_END',                   // QCB+P Black End (grab slam)
  VICE_MAYHEM = 'VICE_MAYHEM',                         // HCF+K Mayhem (low rush)
  // 大门五郎必杀技 (Yashiro Nanakase Specials)
  YASHIRO_UPPER_DU = 'YASHIRO_UPPER_DU',               // QCF+A Upper Du Bag
  YASHIRO_UPPER_DU_C = 'YASHIRO_UPPER_DU_C',           // QCF+C Upper Du Bag (strong)
  YASHIRO_NIRAAI = 'YASHIRO_NIRAAI',                   // QCB+P Niraai Kaname
  YASHIRO_MUSATSU = 'YASHIRO_MUSATSU',                 // HCF+K Musatsu Niraai
  // 克里斯必杀技 (Chris Specials)
  CHRIS_SHOT_WEAVE = 'CHRIS_SHOT_WEAVE',               // QCF+A Shot Weave (weak)
  CHRIS_SHOT_WEAVE_C = 'CHRIS_SHOT_WEAVE_C',           // QCF+C Shot Weave (strong)
  CHRIS_TWISTER_DRIVE = 'CHRIS_TWISTER_DRIVE',         // QCB+K Twister Drive (knockdown)
  CHRIS_SCRAMBLE_DASH = 'CHRIS_SCRAMBLE_DASH',         // DP+K Scramble Dash (low)
  // 夏尔美必杀技 (Shermie Specials)
  SHERMIE_SHOOT = 'SHERMIE_SHOOT',                     // QCF+A Shermie Shoot (weak)
  SHERMIE_SHOOT_C = 'SHERMIE_SHOOT_C',                 // QCF+C Shermie Shoot (strong)
  SHERMIE_CARNIVAL = 'SHERMIE_CARNIVAL',               // QCB+P Shermie Carnival
  SHERMIE_AXLE_SPIN = 'SHERMIE_AXLE_SPIN',             // HCF+K Axle Spin Kick (low)
  // 布鲁·玛丽必杀技 (Blue Mary Specials)
  MARY_STRAIGHT_SLICER = 'MARY_STRAIGHT_SLICER',       // QCF+A Straight Slicer (weak rush kick)
  MARY_STRAIGHT_SLICER_C = 'MARY_STRAIGHT_SLICER_C',   // QCF+C Straight Slicer (strong rush kick)
  MARY_BACKDROP_REAL = 'MARY_BACKDROP_REAL',           // QCB+P Backdrop Real (grab slam)
  MARY_SPIDER = 'MARY_SPIDER',                         // DP+K Mary Spider (low sweep)
  // 李香绯必杀技 (Li Xiangfei Specials)
  XIANGFEI_NANPA = 'XIANGFEI_NANPA',                   // QCF+A Nanpa (weak rushing punch)
  XIANGFEI_NANPA_C = 'XIANGFEI_NANPA_C',               // QCF+C Nanpa (strong rushing punch)
  XIANGFEI_TENPATSU = 'XIANGFEI_TENPATSU',             // QCB+P Tenpatsu (upper strike)
  XIANGFEI_MAHO_HISHA = 'XIANGFEI_MAHO_HISHA',         // HCF+K Maho Hisha (low sweep)
  // 山崎龙二必杀技 (Yamazaki Specials)
  YAMAZAKI_SNAKE_ARM = 'YAMAZAKI_SNAKE_ARM',           // QCF+A Snake Arm (weak)
  YAMAZAKI_SNAKE_ARM_C = 'YAMAZAKI_SNAKE_ARM_C',       // QCF+C Snake Arm (strong)
  YAMAZAKI_SANDSTORM = 'YAMAZAKI_SANDSTORM',           // QCB+P Sandstorm (overhead knockdown)
  YAMAZAKI_BAI_GA_SE = 'YAMAZAKI_BAI_GA_SE',           // HCF+K Bai Ga Se (low sweep)
  // 藤堂香澄必杀技 (Kasumi Todoh Specials)
  KASUMI_KOOU_KEN = 'KASUMI_KOOU_KEN',                   // QCF+A Koou Ken (weak projectile)
  KASUMI_KOOU_KEN_C = 'KASUMI_KOOU_KEN_C',               // QCF+C Koou Ken (strong projectile)
  KASUMI_KASANE_ATE = 'KASUMI_KASANE_ATE',               // QCB+P Kasane Ate (palm strike)
  KASUMI_MUKIGENZAN = 'KASUMI_MUKIGENZAN',               // DP+P Mukigenzan (low sweep)
  // 超必杀技 (DM)
  DM_OROCHINAGI = 'DM_OROCHINAGI',           // 大蛇薙 (Kyo)
  DM_YATAGARASU = 'DM_YATAGARASU',           // 八稚女 (Iori)
  DM_POWER_GEYSER = 'DM_POWER_GEYSER',       // Power Geyser (Terry)
  DM_HIGH_ANGLE_GEYSER = 'DM_HIGH_ANGLE_GEYSER', // High Angle Geyser (Terry)
  DM_PHOENIX_KICK = 'DM_PHOENIX_KICK',       // 鳳凰脚 (Kim)
  DM_PHOENIX_HITEN = 'DM_PHOENIX_HITEN',     // 鳳凰天舞脚 (Kim)
  DM_TEN_HA_OU = 'DM_TEN_HA_OU',             // 天地霸煌拳 (Ryo)
  DM_V_SLASHER = 'DM_V_SLASHER',             // V字金锯 (Leona)
  DM_CHAIN_SHOT = 'DM_CHAIN_SHOT',           // Chain Shot (K')
  DM_FREEZE = 'DM_FREEZE',                   // Freeze Execution (Kula)
  DM_RYU_KO_RYU = 'DM_RYU_KO_RYU',           // 龍虎乱舞 (Robert)
  DM_HAOU_SHOKOU = 'DM_HAOU_SHOKOU',         // 霸王翔吼拳 (Robert)
  DM_HAKA_OTOSHI = 'DM_HAKA_OTOSHI',         // 蜂巢落とし (Mai)
  DM_SHINING_CRYSTAL_BIT = 'DM_SHINING_CRYSTAL_BIT', // Shining Crystal Bit (Athena)
  DM_ARGENTINE_DM = 'DM_ARGENTINE_DM',             // Super Argentine Backbreaker DM (Clark)
  DM_GALACTICA_PHANTOM = 'DM_GALACTICA_PHANTOM',   // Galactica Phantom (Ralf)
  DM_SCREW_UPPER = 'DM_SCREW_UPPER',               // Screw Upper (Joe)
  DM_CHO_REPPA_DAN = 'DM_CHO_REPPA_DAN',           // 超裂破弾 (Andy)
  DM_KAEN_SENPU_JIN = 'DM_KAEN_SENPU_JIN',             // Chou Kaen Senpu Jin (Billy)
  DM_TEKKYUU_DAI_BOUSOU = 'DM_TEKKYUU_DAI_BOUSOU',       // Tekkyuu Dai Bousou (Chang)
  DM_SHIN_CHOU_HOUYOKU = 'DM_SHIN_CHOU_HOUYOKU',         // Shin! Chou Houyoku Tenshin Sen (Choi)
  DM_NOCTURNAL_LIGHT = 'DM_NOCTURNAL_LIGHT',           // Nocturnal Light (Mature)
  DM_NEGATIVE_GAIN = 'DM_NEGATIVE_GAIN',               // Negative Gain (Vice)
  DM_ARMAGEDDON_BUSTERS = 'DM_ARMAGEDDON_BUSTERS',     // Armageddon Busters (Yashiro)
  DM_CHAIN_SLIDE_TOUCH = 'DM_CHAIN_SLIDE_TOUCH',       // Chain Slide Touch DM (Chris)
  DM_SHERMIE_CARNIVAL = 'DM_SHERMIE_CARNIVAL',         // Shermie Carnival DM (Shermie)
  DM_MARY_TYPHOON = 'DM_MARY_TYPHOON',               // Mary Typhoon DM (Mary)
  DM_CHO_KA_RINGA = 'DM_CHO_KA_RINGA',               // Chou Ka Ringa DM (Xiangfei)
  DM_GUILLOTINE = 'DM_GUILLOTINE',                     // Guillotine DM (Yamazaki)
  DM_CHO_MUKIGENZAN = 'DM_CHO_MUKIGENZAN',             // Chou Mukigenzan DM (Kasumi)
  // 超必杀技SDM (Super Desperation Move — MAX mode only, costs extra stock)
  SDM_OROCHINAGI = 'SDM_OROCHINAGI',         // 大蛇薙SDM (Kyo)
  SDM_YATAGARASU = 'SDM_YATAGARASU',         // 八稚女SDM (Iori)
  SDM_POWER_GEYSER = 'SDM_POWER_GEYSER',     // Power Geyser SDM (Terry)
  SDM_PHOENIX_KICK = 'SDM_PHOENIX_KICK',     // 鳳凰脚SDM (Kim)
  SDM_TEN_HA_OU = 'SDM_TEN_HA_OU',           // 天地霸煌拳SDM (Ryo)
  SDM_V_SLASHER = 'SDM_V_SLASHER',           // V字金锯SDM (Leona)
  SDM_CHAIN_SHOT = 'SDM_CHAIN_SHOT',         // Chain Shot SDM (K')
  SDM_FREEZE = 'SDM_FREEZE',                 // Freeze Execution SDM (Kula)
  SDM_RYU_KO_RYU = 'SDM_RYU_KO_RYU',         // 龍虎乱舞SDM (Robert)
  SDM_HAOU_SHOKOU = 'SDM_HAOU_SHOKOU',       // 霸王翔吼拳SDM (Robert)
  SDM_HAKA_OTOSHI = 'SDM_HAKA_OTOSHI',       // 蜂巢落としSDM (Mai)
  SDM_SHINING_CRYSTAL_BIT = 'SDM_SHINING_CRYSTAL_BIT', // Shining Crystal Bit SDM (Athena)
  SDM_ARGENTINE_DM = 'SDM_ARGENTINE_DM',           // Super Argentine Backbreaker SDM (Clark)
  SDM_GALACTICA_PHANTOM = 'SDM_GALACTICA_PHANTOM', // Galactica Phantom SDM (Ralf)
  SDM_SCREW_UPPER = 'SDM_SCREW_UPPER',             // Screw Upper SDM (Joe)
  SDM_CHO_REPPA_DAN = 'SDM_CHO_REPPA_DAN',         // 超裂破弾SDM (Andy)
  SDM_KAEN_SENPU_JIN = 'SDM_KAEN_SENPU_JIN',           // Chou Kaen Senpu Jin SDM (Billy)
  SDM_TEKKYUU_DAI_BOUSOU = 'SDM_TEKKYUU_DAI_BOUSOU',     // Tekkyuu Dai Bousou SDM (Chang)
  SDM_SHIN_CHOU_HOUYOKU = 'SDM_SHIN_CHOU_HOUYOKU',       // Shin! Chou Houyoku Tenshin Sen SDM (Choi)
  SDM_NOCTURNAL_LIGHT = 'SDM_NOCTURNAL_LIGHT',         // Nocturnal Light SDM (Mature)
  SDM_NEGATIVE_GAIN = 'SDM_NEGATIVE_GAIN',             // Negative Gain SDM (Vice)
  SDM_ARMAGEDDON_BUSTERS = 'SDM_ARMAGEDDON_BUSTERS',   // Armageddon Busters SDM (Yashiro)
  SDM_CHAIN_SLIDE_TOUCH = 'SDM_CHAIN_SLIDE_TOUCH',     // Chain Slide Touch SDM (Chris)
  SDM_SHERMIE_CARNIVAL = 'SDM_SHERMIE_CARNIVAL',       // Shermie Carnival SDM (Shermie)
  SDM_MARY_TYPHOON = 'SDM_MARY_TYPHOON',             // Mary Typhoon SDM (Mary)
  SDM_CHO_KA_RINGA = 'SDM_CHO_KA_RINGA',             // Chou Ka Ringa SDM (Xiangfei)
  SDM_GUILLOTINE = 'SDM_GUILLOTINE',                 // Guillotine SDM (Yamazaki)
  SDM_CHO_MUKIGENZAN = 'SDM_CHO_MUKIGENZAN',         // Chou Mukigenzan SDM (Kasumi)
}

// ===== Hit Level (防御判定) =====
export type HitLevel = 'MID' | 'LOW' | 'HIGH';
// MID: 站防蹲防都能挡
// LOW: 只能蹲防 (下段攻击)
// HIGH: 只能站防 (打逆/空中攻击)

export enum HitHeight {
  HIGH = 'HIGH',   // 上段 — 站防可，蹲防不可（跳跃攻击、大部分站立攻击）
  MID = 'MID',     // 中段 — 站防蹲防皆可
  LOW = 'LOW',     // 下段 — 蹲防可，站防不可（蹲攻击、下段必杀技）
}

// ===== Player Input =====
export interface PlayerInput {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  buttonA: boolean;  // 轻拳
  buttonB: boolean;  // 轻脚
  buttonC: boolean;  // 重拳
  buttonD: boolean;  // 重脚
  throwAttack: boolean;
  start: boolean;    // Start键 — 嘲讽
}

// ===== Direction =====
export type Direction = 1 | -1;

// ===== Direction Input for Command Buffer =====
export type DirectionInput =
  | 'neutral'
  | 'up'
  | 'down'
  | 'forward'
  | 'back'
  | 'upforward'
  | 'upback'
  | 'downforward'
  | 'downback';

// ===== Block Type =====
export type BlockType = 'HIGH' | 'LOW';

// ===== Power Gauge (能量槽) =====
export interface PowerGauge {
  meter: number;         // 当前能量值 (0~maxMeter)
  stocks: number;        // 已攒满的能量条数 (0~MAX_STOCKS)
  maxMeter: number;      // 一条能量的满值
}

// ===== MAX Mode State =====
export interface MaxModeState {
  active: boolean;
  timer: number;
  maxDuration: number;
}

// ===== Rekka Chain State (荒咬み/毒咬み连段) =====
export type RekkaChain = 'aragami' | 'dokugami' | 'aoihana' | null;

// ===== Juggle State (浮空状态) =====
export enum JuggleState {
  NONE = 'NONE',       // 不可追打 (普通通常技命中后)
  HALF = 'HALF',       // 半追打 (落下前期可打)
  FULL = 'FULL',       // 全追打 (落地前都可打 — 大多数必杀技/升龙)
}

// ===== 碰撞矩形 (世界空间) =====
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ===== Close Range Distance =====
export const CLOSE_RANGE = 80;

// ===== Proximity (近敌判定) =====
// proximity guard范围在 constants.ts 中定义 (PROXIMITY_GUARD_RANGE)

// ===== Attack Phase =====
export type AttackPhase = 'startup' | 'active' | 'recovery' | 'none';

// ===== Per-Frame Hitbox System (逐帧判定框) =====
export interface FrameBox {
  /** X offset from fighter position (positive = forward) */
  ox: number;
  /** Y offset from fighter Y (negative = upward) */
  oy: number;
  /** Box width */
  w: number;
  /** Box height */
  h: number;
}

/** Single frame of hitbox data during active phase */
export interface AttackFrame {
  /** Attack boxes for this frame (can have multiple) */
  attack: FrameBox[];
  /** Body box override relative to default (null = use default hurtbox) */
  bodyOverride: FrameBox | null;
  /** Throw boxes for this frame (null = not a throw attack) */
  throwBoxes?: FrameBox[];
}

/** Map of attack type to per-active-frame hitbox data */
export type AttackFrameTable = Partial<Record<AttackType, AttackFrame[]>>;

// ===== Command Throw Marking =====
// 指令投：不可被普通拆投，在投技判定时走特殊路径
export const COMMAND_THROWS: ReadonlySet<string> = new Set([
  // 角色专属指令投将在角色定义中通过 CharacterDefinition.isCommandThrow() 标记
]);

// ===== Counter (当身技) Configuration =====
export interface CounterConfig {
  /** 当身架招持续帧数 */
  activeFrames: number;
  /** 成功当身后触发的攻击 */
  counterAttack: AttackType;
  /** 当身成功时的伤害 */
  counterDamage: number;
  /** 当身失败（超时/被下段打中）的硬直帧 */
  failureStun: number;
}

// ===== Game Phase =====
export enum GamePhase {
  TITLE = 'TITLE',     // Title screen (KOF2002 logo + PRESS START)
  MODE_SELECT = 'MODE_SELECT', // Single vs Team battle mode
  SELECT = 'SELECT',   // Character select
  INTRO = 'INTRO',     // "ROUND 1... FIGHT!" text
  FIGHTING = 'FIGHTING', // Active gameplay
  KO = 'KO',           // KO state
  WIN_QUOTE = 'WIN_QUOTE', // 胜利台词显示
  MATCH_END = 'MATCH_END', // Match complete (best of 3)
  CONTINUE = 'CONTINUE', // Continue? countdown
  TRAINING = 'TRAINING', // Training mode (no timer, health regen, input display)
}

export type BattleMode = 'single' | 'team' | 'training';

// ===== Game State (for window.__gameState) =====
export interface PlayerState {
  x: number;
  y: number;
  health: number;
  state: string;
  facing: Direction;
  currentAttack: string | null;
  attackPhase: AttackPhase;
  attackFrame: number;
}

export interface GameState {
  players: PlayerState[];
  tick: number;
  fps: number;
  ko: boolean;
  winner: number | null; // 0=P1, 1=P2, null=none
}
