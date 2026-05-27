/**
 * Rival Battle Data — KOF2002-style special matchup dialogue
 *
 * When specific character pairs face each other, a brief dialogue
 * exchange appears during the VS splash screen, adding personality
 * and dramatic tension to rival encounters.
 */

export interface RivalDialogue {
  /** Character IDs in the matchup (order-independent) */
  pair: [string, string];
  /** P1's line (the character whose ID comes first alphabetically) */
  lineA: string;
  /** P2's line */
  lineB: string;
  /** Color theme for the dialogue box */
  theme: 'fire' | 'destiny' | 'dark' | 'honor' | 'rivalry';
}

const RIVAL_DIALOGUES: RivalDialogue[] = [
  // Kyo vs Iori — eternal rivals
  {
    pair: ['kyo', 'iori'],
    lineA: '俺の炎でお前を燃やし尽くす！',
    lineB: 'くだらん…血の叫びを聞かせてやる',
    theme: 'fire',
  },
  // Ryo vs Robert — dojo brothers
  {
    pair: ['ryo', 'robert'],
    lineA: '見せてやる、極限流空手の真髄を！',
    lineB: '龍虎の拳、とくと拝見するぜ！',
    theme: 'honor',
  },
  // Kyo vs Ryo — protagonist clash
  {
    pair: ['kyo', 'ryo'],
    lineA: 'お前が極限流の使い手か。面白いな',
    lineB: '草薙の炎、その目で見せてもらう！',
    theme: 'rivalry',
  },
  // Iori vs Ryo — dark vs honor
  {
    pair: ['iori', 'ryo'],
    lineA: '…消えろ',
    lineB: 'その暗い力、極限流で砕く！',
    theme: 'dark',
  },
  // Kyo vs K' — flame successors
  {
    pair: ['kyo', 'kdash'],
    lineA: '俺の炎をコピーしたつもりか？',
    lineB: '…チッ、うるせえな',
    theme: 'fire',
  },
  // Athena vs Kensou (not in roster, use generic)
  // Iori vs Leona — Orochi blood
  {
    pair: ['iori', 'leona'],
    lineA: '俺と同じ血が流れているな…',
    lineB: '…関係ない。任務を遂行する',
    theme: 'dark',
  },
  // Kyo vs Chizuru (destiny)
  {
    pair: ['kyo', 'chizuru'],
    lineA: 'また会ったな、神楽',
    lineB: '運命の歯車はすでに回っています',
    theme: 'destiny',
  },
  // Kim vs Chang — justice vs criminal
  {
    pair: ['kim', 'chang'],
    lineA: '悪の道から足を洗え！',
    lineB: 'うるせえ！この鉄球で黙らせてやる！',
    theme: 'honor',
  },
  // Ryo vs Takuma — master vs student (father)
  {
    pair: ['ryo', 'takuma'],
    lineA: '父さん、その実力見せてもらいます！',
    lineB: '来い、亮！遠慮はいらん！',
    theme: 'honor',
  },
  // Terry vs Andy — brothers
  {
    pair: ['terry', 'andy'],
    lineA: '行くぜ、アンディ！手加減はなしだ！',
    lineB: '兄さん、僕も本気で行かせてもらう！',
    theme: 'rivalry',
  },
  // Mai vs Andy — couple
  {
    pair: ['mai', 'andy'],
    lineA: '安迪！今日こそ私と結婚して！',
    lineB: 'ま、舞…今は戦いに集中しよう…',
    theme: 'destiny',
  },
  // K' vs Kula — fire vs ice
  {
    pair: ['kdash', 'kula'],
    lineA: '…お前が相手か',
    lineB: 'あなたの炎、凍らせてあげる',
    theme: 'fire',
  },
  // Joe vs Terry — sparring partners
  {
    pair: ['joe', 'terry'],
    lineA: 'テリー！タイマンで勝負だ！',
    lineB: 'OK、受けて立つぜ！',
    theme: 'rivalry',
  },
];

const THEME_COLORS: Record<RivalDialogue['theme'], { bg: string; border: string; textA: string; textB: string; flash: string }> = {
  fire:    { bg: 'rgba(80, 20, 0, 0.85)',  border: '#ff4400', textA: '#ff8844', textB: '#8844ff', flash: '#ff6600' },
  destiny: { bg: 'rgba(20, 40, 60, 0.85)',  border: '#4488cc', textA: '#66aadd', textB: '#ddaa44', flash: '#4488cc' },
  dark:    { bg: 'rgba(40, 0, 40, 0.85)',   border: '#aa44aa', textA: '#cc66cc', textB: '#6666cc', flash: '#aa44aa' },
  honor:   { bg: 'rgba(20, 50, 20, 0.85)',  border: '#44aa44', textA: '#88cc44', textB: '#44ccaa', flash: '#44aa44' },
  rivalry: { bg: 'rgba(60, 40, 0, 0.85)',   border: '#ccaa44', textA: '#ffcc44', textB: '#cc8844', flash: '#ccaa44' },
};

/**
 * Find rival dialogue for a character matchup.
 * Returns undefined if the pair has no special rival dialogue.
 */
export function getRivalDialogue(charIdA: string, charIdB: string): RivalDialogue | undefined {
  return RIVAL_DIALOGUES.find(r =>
    (r.pair[0] === charIdA && r.pair[1] === charIdB) ||
    (r.pair[0] === charIdB && r.pair[1] === charIdA),
  );
}

/**
 * Get themed colors for a rival dialogue.
 * Returns colors for the dialogue box rendering.
 */
export function getRivalThemeColors(theme: RivalDialogue['theme']) {
  return THEME_COLORS[theme];
}
