// All sounds are made in code with the Web Audio API, so there are no audio files to license.
const SCALE = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26, 28, 31, 33, 36];
const BASE = 392; // G4

function noteFreq(step) {
  return BASE * 2 ** (SCALE[Math.min(step, SCALE.length - 1)] / 12);
}

export class Sound {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.55;
      const comp = this.ctx.createDynamicsCompressor();
      this.master.connect(comp);
      comp.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  suspend() {
    if (this.ctx && this.ctx.state === 'running') this.ctx.suspend();
  }

  ready() {
    return this.enabled && this.ctx && this.ctx.state === 'running';
  }

  tone(freq, { type = 'sine', dur = 0.12, vol = 0.25, delay = 0, slide = 0, attack = 0.006 } = {}) {
    if (!this.ready()) return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq * slide), t + dur);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  noise({ dur = 0.08, vol = 0.2, freq = 1500, q = 1.2, delay = 0 } = {}) {
    if (!this.ready()) return;
    const t = this.ctx.currentTime + delay;
    if (!this.noiseBuffer) {
      const len = this.ctx.sampleRate * 0.5;
      this.noiseBuffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    filter.Q.value = q;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    src.start(t);
    src.stop(t + dur + 0.02);
  }

  select(index) {
    const f = noteFreq(index);
    this.tone(f, { dur: 0.11, vol: 0.18 });
    this.tone(f * 2, { type: 'triangle', dur: 0.06, vol: 0.05 });
  }

  deselect() {
    this.tone(300, { dur: 0.07, vol: 0.1, slide: 0.8 });
  }

  click() {
    this.tone(660, { type: 'triangle', dur: 0.05, vol: 0.12 });
  }

  invalid() {
    this.tone(220, { type: 'square', dur: 0.1, vol: 0.07 });
    this.tone(165, { type: 'square', dur: 0.14, vol: 0.07, delay: 0.09 });
  }

  word(length) {
    const notes = Math.min(length, 9);
    for (let i = 0; i < notes; i++) {
      this.noise({ dur: 0.06, vol: 0.18, freq: 900 + i * 260, delay: i * 0.035 });
      this.tone(noteFreq(i + 2), { type: 'triangle', dur: 0.16, vol: 0.13, delay: i * 0.035 });
    }
    if (length >= 5) {
      const d = notes * 0.035 + 0.02;
      [0, 4, 7, 12].forEach((s, i) => this.tone(BASE * 2 ** ((s + 12) / 12), { dur: 0.5, vol: 0.09, delay: d + i * 0.05 }));
    }
  }

  reward() {
    [0, 7, 12, 19, 24].forEach((s, i) => this.tone(BASE * 2 ** ((s + 12) / 12), { dur: 0.18, vol: 0.08, delay: 0.25 + i * 0.05 }));
  }

  bolt() {
    this.noise({ dur: 0.4, vol: 0.3, freq: 3000, q: 0.5 });
    this.tone(1200, { type: 'sawtooth', dur: 0.3, vol: 0.06, slide: 0.2 });
  }

  glitch() {
    this.tone(520, { type: 'sawtooth', dur: 0.45, vol: 0.12, slide: 0.15 });
    this.noise({ dur: 0.3, vol: 0.18, freq: 400, q: 3 });
  }

  goal() {
    this.tone(784, { dur: 0.12, vol: 0.12 });
    this.tone(1175, { dur: 0.2, vol: 0.12, delay: 0.09 });
  }

  levelUp() {
    const seq = [0, 4, 7, 12, 7, 12, 16, 19];
    seq.forEach((s, i) => {
      this.tone(BASE * 2 ** (s / 12), { type: 'triangle', dur: 0.2, vol: 0.16, delay: i * 0.09 });
      this.tone(BASE * 2 ** ((s + 12) / 12), { dur: 0.15, vol: 0.05, delay: i * 0.09 });
    });
    [0, 4, 7, 12].forEach((s) => this.tone(BASE * 2 ** (s / 12), { dur: 1.1, vol: 0.07, delay: seq.length * 0.09 }));
  }

  gameOver() {
    [7, 5, 3, 0].forEach((s, i) => this.tone(BASE * 2 ** ((s - 5) / 12), { type: 'triangle', dur: 0.35, vol: 0.14, delay: i * 0.22 }));
  }
}

export function vibrate(enabled, pattern) {
  if (enabled && navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch { /* not supported */ }
  }
}
