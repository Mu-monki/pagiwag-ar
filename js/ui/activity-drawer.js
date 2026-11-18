/**
 * Bottom Sticker & 3D Model Info Drawer Controller
 * Displays the scanned/selected sticker's title, tagline, description, and SFX chime trigger.
 */

import { STICKER_MARKERS } from '../config/activities-data.js';
import { audioFX } from '../core/audio-fx.js';

export class ActivityDrawer {
  constructor({ drawerEl, categoryEl, titleEl, bodyEl }) {
    this.drawerEl = drawerEl;
    this.categoryEl = categoryEl;
    this.titleEl = titleEl;
    this.bodyEl = bodyEl;
    this.activeMarkerId = null;
  }

  toggleExpand() {
    this.drawerEl.classList.toggle('collapsed');
  }

  expand() {
    this.drawerEl.classList.remove('collapsed');
  }

  setActiveMarker(markerId) {
    const meta = STICKER_MARKERS.find((m) => m.id === markerId);
    if (!meta) return;

    this.activeMarkerId = markerId;
    this.categoryEl.textContent = meta.category;
    this.titleEl.textContent = `${meta.icon || '✨'} ${meta.name}`;
    this.expand();
    this.render(meta);
  }

  refreshActiveDrawer() {
    if (!this.activeMarkerId) return;
    const meta = STICKER_MARKERS.find((m) => m.id === this.activeMarkerId);
    if (meta) this.render(meta);
  }

  getActiveClipControllers() {
    return Array.from(document.querySelectorAll('.hologram-spin-target'))
      .map((el) => el.components?.['gltf-clips'])
      .filter((ctrl) => ctrl && ctrl.clips && ctrl.clips.length > 0);
  }

  render(meta) {
    const controllers = this.getActiveClipControllers();
    const primaryCtrl = controllers[0] || null;
    const tracks = primaryCtrl ? primaryCtrl.getTrackNames() : [];

    const animControlsHtml =
      tracks.length > 0
        ? `
      <div class="callout-box" style="border-color: ${meta.accentColor || '#0D254C'};">
        <div class="drawer-meta-row" style="margin-bottom: 8px;">
          <strong>🎬 Animation Tracks (${tracks.length})</strong>
          <button id="btn-anim-playpause" class="drawer-mini-btn" type="button">
            ${primaryCtrl.isPlaying ? '⏸ Pause' : '▶️ Play'}
          </button>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          ${tracks
            .map(
              (name, idx) => `
            <button type="button" class="drawer-mini-btn" data-clip-idx="${idx}"
              style="${primaryCtrl.activeIndex === idx ? 'background: var(--gold-torch);' : ''}">
              ${name}
            </button>`
            )
            .join('')}
          ${
            tracks.length > 1
              ? `<button type="button" class="drawer-mini-btn" data-clip-idx="-1"
                  style="${primaryCtrl.activeIndex === -1 ? 'background: var(--gold-torch);' : ''}">
                  All Tracks
                </button>`
              : ''
          }
        </div>
      </div>`
        : '';

    this.bodyEl.innerHTML = `
      <div class="callout-box" style="border-color: ${meta.accentColor || '#0D254C'};">
        <strong>${meta.tagline}</strong>
        <p class="activity-desc" style="margin-top: 6px;">${meta.description}</p>
      </div>
      ${animControlsHtml}
      <div class="drawer-meta-row">
        <span class="kicker-pill" style="background: ${meta.accentColor || '#1B4988'};">
          TARGET INDEX #${meta.targetIndex ?? 0}
        </span>
        <button id="btn-replay-chime" class="drawer-mini-btn" type="button">🔔 Replay Chime</button>
      </div>
    `;

    this.bodyEl.querySelectorAll('[data-clip-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        audioFX.playActionTap();
        const clipIdx = Number(btn.dataset.clipIdx);
        this.getActiveClipControllers().forEach((ctrl) => ctrl.playClip(clipIdx));
        this.render(meta);
      });
    });

    const playPauseBtn = this.bodyEl.querySelector('#btn-anim-playpause');
    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', () => {
        audioFX.playActionTap();
        this.getActiveClipControllers().forEach((ctrl) => ctrl.togglePlayPause());
        this.render(meta);
      });
    }

    const chimeBtn = this.bodyEl.querySelector('#btn-replay-chime');
    if (chimeBtn) {
      chimeBtn.addEventListener('click', () => audioFX.playMarkerLock());
    }
  }
}
