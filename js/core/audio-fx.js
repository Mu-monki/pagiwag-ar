/**
 * Lightweight Web Audio Synthesizer for PAG-IWAG AR Feedback Chimes
 */

class AudioFX {
  constructor() {
    this.ctx = null;
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playTone(freq = 523.25, duration = 0.14, type = 'triangle', delay = 0) {
    try {
      this.ensureContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch {
      // Ignore audio autoplay restrictions silently
    }
  }

  playMarkerLock() {
    this.playTone(523.25, 0.14, 'triangle', 0);
    this.playTone(659.25, 0.14, 'triangle', 0.08);
    this.playTone(783.99, 0.22, 'sine', 0.16);
  }

  playActionTap() {
    this.playTone(587.33, 0.1, 'sine', 0);
  }

  playPositiveScore() {
    this.playTone(659.25, 0.12, 'triangle', 0);
    this.playTone(880.0, 0.22, 'triangle', 0.09);
  }

  playWarningScore() {
    this.playTone(329.63, 0.18, 'sawtooth', 0);
    this.playTone(261.63, 0.24, 'sawtooth', 0.12);
  }
}

export const audioFX = new AudioFX();
