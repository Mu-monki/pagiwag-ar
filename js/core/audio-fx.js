/**
 * Web Audio Synthesizer & Activity MP3 Controller for PAG-IWAG AR
 */

class AudioFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.trackAudio = null;
    this.currentTrackUrl = null;
  }

  setMuted(muted) {
    this.muted = Boolean(muted);
    if (this.trackAudio) {
      this.trackAudio.muted = this.muted;
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.trackAudio) {
      this.trackAudio.muted = this.muted;
      if (!this.muted && this.trackAudio.paused && this.currentTrackUrl) {
        this.trackAudio.play().catch(() => {});
      }
    }
    if (!this.muted) {
      this.playActionTap();
    }
    return this.muted;
  }

  playActivitySound(meta, clipIndex = null) {
    if (!meta) {
      this.stopActivitySound();
      return;
    }

    const activeClip = clipIndex ?? meta.defaultClipIndex ?? 0;
    const url =
      meta.soundUrl ||
      (meta.trackSounds && (meta.trackSounds[activeClip] ?? meta.trackSounds[String(activeClip)])) ||
      null;

    if (!url) {
      this.stopActivitySound();
      return;
    }

    // Avoid restarting if the exact same MP3 is already playing
    if (this.trackAudio && this.currentTrackUrl === url && !this.trackAudio.paused) {
      this.trackAudio.loop = meta.soundLoop !== false;
      this.trackAudio.muted = this.muted;
      return;
    }

    this.stopActivitySound();

    const audio = new Audio(url);
    audio.loop = meta.soundLoop !== false;
    audio.muted = this.muted;
    audio.preload = 'auto';

    this.trackAudio = audio;
    this.currentTrackUrl = url;

    audio.play().catch(() => {
      // Browser autoplay policy fallback if triggered before user gesture
    });
  }

  setActivitySoundPaused(paused) {
    if (!this.trackAudio) return;
    if (paused) {
      this.trackAudio.pause();
    } else if (!this.muted) {
      this.trackAudio.play().catch(() => {});
    }
  }

  stopActivitySound() {
    if (this.trackAudio) {
      this.trackAudio.pause();
      this.trackAudio.currentTime = 0;
      this.trackAudio = null;
    }
    this.currentTrackUrl = null;
  }

  ensureContext() {
    if (this.muted) return;
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
    if (this.muted) return;
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

  playCameraReady() {
    this.playTone(440.0, 0.11, 'sine', 0);
    this.playTone(554.37, 0.15, 'sine', 0.08);
  }
}

export const audioFX = new AudioFX();