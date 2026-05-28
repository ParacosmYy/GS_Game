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

// --- Canvas / DOM mocks for rendering imports in test environment ---

class MockCanvasRenderingContext2D {
  canvas = {} as HTMLCanvasElement;
  fillStyle = '';
  strokeStyle = '';
  lineWidth = 1;
  globalAlpha = 1;
  globalCompositeOperation = 'source-over';
  font = '10px sans-serif';
  textAlign = 'start' as CanvasTextAlign;
  textBaseline = 'alphabetic' as CanvasTextBaseline;
  shadowColor = '';
  shadowBlur = 0;
  shadowOffsetX = 0;
  shadowOffsetY = 0;
  imageSmoothingEnabled = true;
  fillRect() {}
  strokeRect() {}
  clearRect() {}
  fillText() {}
  strokeText() {}
  measureText() { return { width: 0 } as TextMetrics; }
  beginPath() {}
  closePath() {}
  moveTo() {}
  lineTo() {}
  arc() {}
  arcTo() {}
  rect() {}
  fill() {}
  stroke() {}
  clip() {}
  save() {}
  restore() {}
  translate() {}
  rotate() {}
  scale() {}
  transform() {}
  setTransform() {}
  resetTransform() {}
  drawImage() {}
  createLinearGradient() { return { addColorStop() {} } as CanvasGradient; }
  createRadialGradient() { return { addColorStop() {} } as CanvasGradient; }
  createPattern() { return null as unknown as CanvasPattern; }
  getImageData() { return { data: new Uint8ClampedArray(0), width: 0, height: 0 } as ImageData; }
  putImageData() {}
  roundRect() {}
  quadraticCurveTo() {}
  bezierCurveTo() {}
  ellipse() {}
  isPointInPath() { return false; }
}

class MockHTMLCanvasElement {
  width = 0;
  height = 0;
  _ctx = new MockCanvasRenderingContext2D();
  getContext(_type: string) { return this._ctx; }
  toDataURL() { return 'data:image/png;base64,'; }
}

// @ts-expect-error — mock for test environment
globalThis.HTMLCanvasElement = MockHTMLCanvasElement;

if (!globalThis.document) {
  const _createElement = (_tag: string) => new MockHTMLCanvasElement();
  // @ts-expect-error — mock for test environment
  globalThis.document = {
    createElement: _createElement,
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    body: { appendChild() {}, removeChild() {}, style: {} },
    documentElement: { style: {} },
  } as unknown as Document;
}

if (!globalThis.window) {
  // @ts-expect-error — mock for test environment
  globalThis.window = globalThis;
}

if (typeof globalThis.requestAnimationFrame === 'undefined') {
  globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(() => cb(0), 0) as unknown as number;
  globalThis.cancelAnimationFrame = (id: number) => clearTimeout(id);
}
