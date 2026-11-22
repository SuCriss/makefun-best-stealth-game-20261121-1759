export class AudioManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  ensure() {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      this.ctx = new Ctx();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    return this.ctx;
  }

  beep({ freq = 440, dur = 0.08, type = 'sine', gain = 0.035, slide = 0, delay = 0 }) {
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  pickup() {
    this.beep({ freq: 660, dur: 0.07, type: 'triangle', gain: 0.03 });
    this.beep({ freq: 990, dur: 0.12, type: 'sine', gain: 0.025, delay: 0.06 });
  }

  alert() {
    this.beep({ freq: 220, dur: 0.12, type: 'square', gain: 0.02, slide: 80 });
    this.beep({ freq: 180, dur: 0.14, type: 'square', gain: 0.018, delay: 0.08, slide: 60 });
  }

  caught() {
    this.beep({ freq: 180, dur: 0.25, type: 'sawtooth', gain: 0.03, slide: -90 });
  }

  win() {
    [523, 659, 784, 1046].forEach((f, i) => this.beep({ freq: f, dur: 0.18, type: 'triangle', gain: 0.025, delay: i * 0.08 }));
  }

  step() {
    this.beep({ freq: 120, dur: 0.03, type: 'triangle', gain: 0.008 });
  }
}