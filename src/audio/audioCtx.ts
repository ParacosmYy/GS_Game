/**
 * Shared audio context + noise buffer helper.
 * Used by sfx.ts and sfxMisc.ts.
 */

let audioCtx: AudioContext | null = null;

export function getCtx(): AudioContext {
  if (!audioCtx) {
    if (typeof AudioContext === 'undefined') {
      throw new Error('AudioContext not available — running in non-browser environment');
    }
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

export function initAudio(): void {
  getCtx();
}

export function noiseBuffer(ctx: AudioContext, duration: number, decay: number): AudioBufferSourceNode {
  const size = Math.floor(ctx.sampleRate * duration);
  const buf = ctx.createBuffer(1, size, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < size; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (size * decay));
  const src = ctx.createBufferSource();
  src.buffer = buf;
  return src;
}
