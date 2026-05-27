/**
 * Vitest global setup — AudioContext mock for non-browser test environment.
 *
 * Many modules import audio functions that call new AudioContext().
 * This mock provides a minimal stub so tests can run in Node.js.
 */

class MockAudioContext {
  sampleRate = 44100;
  currentTime = 0;
  state = 'running';

  createBuffer(_channels: number, _length: number, _sampleRate: number) {
    return {
      getChannelData: () => new Float32Array(0),
      numberOfChannels: 1,
      length: 0,
      sampleRate: 44100,
    };
  }

  createBufferSource() {
    return {
      buffer: null as AudioBuffer | null,
      connect: () => {},
      start: () => {},
      stop: () => {},
      playbackRate: { value: 1 },
    };
  }

  createGain() {
    return {
      gain: { value: 1, linearRampToValueAtTime: () => {}, setValueAtTime: () => {} },
      connect: () => {},
      disconnect: () => {},
    };
  }

  createOscillator() {
    return {
      frequency: { value: 440, setValueAtTime: () => {}, linearRampToValueAtTime: () => {} },
      type: 'sine' as OscillatorType,
      connect: () => {},
      start: () => {},
      stop: () => {},
    };
  }

  createBiquadFilter() {
    return {
      type: 'lowpass' as BiquadFilterType,
      frequency: { value: 1000 },
      Q: { value: 1 },
      connect: () => {},
    };
  }

  createDynamicsCompressor() {
    return {
      threshold: { value: -24 },
      ratio: { value: 12 },
      attack: { value: 0.003 },
      release: { value: 0.25 },
      connect: () => {},
    };
  }

  createAnalyser() {
    return {
      fftSize: 2048,
      getByteFrequencyData: (_arr: Uint8Array) => {},
      connect: () => {},
    };
  }

  createDelay() {
    return { delayTime: { value: 0 }, connect: () => {} };
  }

  destination = {};
  close() { return Promise.resolve(); }
  resume() { return Promise.resolve(); }
}

// @ts-expect-error — mock for test environment
globalThis.AudioContext = MockAudioContext;
