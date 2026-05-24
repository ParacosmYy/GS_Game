/**
 * SFX — Web Audio 合成音效系统
 *
 * 无需音频文件，全部用 Web Audio API 实时合成。
 * 打击音、格挡音、必杀技音、KO音、选人确认音。
 */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

/** 初始化 (需要在用户交互后调用) */
export function initAudio(): void {
  getCtx();
}

// ─── 音效合成器 ───

/** 打击音: 短促的噪声+低频冲击 */
export function playHit(intensity: number = 1): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  // 白噪声 burst
  const bufSize = ctx.sampleRate * 0.05;
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.15));
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buf;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.25 * intensity, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  // 低频冲击
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(150 * intensity, now);
  osc.frequency.exponentialRampToValueAtTime(60, now + 0.05);
  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(0.3 * intensity, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  noise.connect(noiseGain).connect(ctx.destination);
  osc.connect(oscGain).connect(ctx.destination);
  noise.start(now);
  osc.start(now);
  noise.stop(now + 0.06);
  osc.stop(now + 0.06);
}

/** 格挡音: 金属感的高频碰撞 */
export function playBlock(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.05);
}

/** 必杀技音: 能量蓄积+释放 */
export function playSpecial(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  // 上升频率扫描
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);
  osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.setValueAtTime(0.25, now + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.25);
}

/** DM超必杀音: 强烈能量爆发 */
export function playDM(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  // 巨大的低频轰鸣
  const osc1 = ctx.createOscillator();
  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(80, now);
  osc1.frequency.exponentialRampToValueAtTime(40, now + 0.3);

  // 高频闪烁
  const osc2 = ctx.createOscillator();
  osc2.type = 'square';
  osc2.frequency.setValueAtTime(1200, now);
  osc2.frequency.exponentialRampToValueAtTime(200, now + 0.15);

  const gain1 = ctx.createGain();
  gain1.gain.setValueAtTime(0.3, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

  const gain2 = ctx.createGain();
  gain2.gain.setValueAtTime(0.15, now);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  // 白噪声冲击
  const bufSize = ctx.sampleRate * 0.15;
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.3));
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.35, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  osc1.connect(gain1).connect(ctx.destination);
  osc2.connect(gain2).connect(ctx.destination);
  noise.connect(noiseGain).connect(ctx.destination);

  osc1.start(now); osc1.stop(now + 0.4);
  osc2.start(now); osc2.stop(now + 0.2);
  noise.start(now); noise.stop(now + 0.2);
}

/** 投技音: 咔嚓+落地 */
export function playThrow(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.setValueAtTime(400, now);
  osc.frequency.setValueAtTime(200, now + 0.03);
  osc.frequency.setValueAtTime(100, now + 0.06);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

  osc.connect(gain).connect(ctx.destination);
  osc.start(now); osc.stop(now + 0.12);
}

/** KO音: 沉重的终结音 */
export function playKO(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.exponentialRampToValueAtTime(30, now + 0.5);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.4, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

  osc.connect(gain).connect(ctx.destination);
  osc.start(now); osc.stop(now + 0.6);
}

/** 选人确认音: 清脆的叮 */
export function playSelect(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, now);
  osc.frequency.setValueAtTime(1100, now + 0.05);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  osc.connect(gain).connect(ctx.destination);
  osc.start(now); osc.stop(now + 0.2);
}

/** Counter Hit 音: 尖锐提示音 */
export function playCounter(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.setValueAtTime(1500, now);
  osc.frequency.setValueAtTime(2000, now + 0.03);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc.connect(gain).connect(ctx.destination);
  osc.start(now); osc.stop(now + 0.1);
}

/** 胜利号角: C-E-G-C 上行琶音 */
export function playVictoryFanfare(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const notes = [523.3, 659.3, 784, 1047]; // C5, E5, G5, C6
  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.3;
  masterGain.connect(ctx.destination);

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    const startTime = now + i * 0.15;
    gain.gain.setValueAtTime(0.3, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
    osc.connect(gain).connect(masterGain);
    osc.start(startTime);
    osc.stop(startTime + 0.35);
  });
}

/** 重打击音: C/D攻击 — 更厚实的噪声+更强的低频 */
export function playHeavyHit(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  // 更长的噪声 burst
  const bufSize = ctx.sampleRate * 0.08;
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.25));
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buf;

  // 带通滤波让噪声更"肉感"
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 800;
  filter.Q.value = 0.8;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.35, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

  // 更重的低频冲击
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(120, now);
  osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);
  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(0.4, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  // 中频"啪"感
  const osc2 = ctx.createOscillator();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(400, now);
  osc2.frequency.exponentialRampToValueAtTime(100, now + 0.04);
  const osc2Gain = ctx.createGain();
  osc2Gain.gain.setValueAtTime(0.2, now);
  osc2Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  noise.connect(filter).connect(noiseGain).connect(ctx.destination);
  osc.connect(oscGain).connect(ctx.destination);
  osc2.connect(osc2Gain).connect(ctx.destination);
  noise.start(now); noise.stop(now + 0.1);
  osc.start(now); osc.stop(now + 0.1);
  osc2.start(now); osc2.stop(now + 0.06);
}

/** Super Flash: DM启动时的闪烁音效 */
export function playSuperFlash(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  // 上升音调
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(300, now);
  osc.frequency.exponentialRampToValueAtTime(1800, now + 0.15);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.25);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.setValueAtTime(0.25, now + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  osc.connect(gain).connect(ctx.destination);
  osc.start(now); osc.stop(now + 0.35);
}

/** 翻滚/回避音 */
export function playRoll(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
  osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.1, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  osc.connect(gain).connect(ctx.destination);
  osc.start(now); osc.stop(now + 0.2);
}

/** Guard Crush音: 破碎感 */
export function playGuardCrush(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  // 多层破碎噪声
  const bufSize = ctx.sampleRate * 0.15;
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.2));
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buf;

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 1500;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.3, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  // 破碎低频
  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.setValueAtTime(300, now);
  osc.frequency.exponentialRampToValueAtTime(60, now + 0.1);
  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(0.3, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  noise.connect(filter).connect(noiseGain).connect(ctx.destination);
  osc.connect(oscGain).connect(ctx.destination);
  noise.start(now); noise.stop(now + 0.15);
  osc.start(now); osc.stop(now + 0.15);
}

/** 投技逃脱音 */
export function playThrowEscape(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(600, now);
  osc.frequency.setValueAtTime(800, now + 0.03);
  osc.frequency.setValueAtTime(500, now + 0.06);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

  osc.connect(gain).connect(ctx.destination);
  osc.start(now); osc.stop(now + 0.12);
}
