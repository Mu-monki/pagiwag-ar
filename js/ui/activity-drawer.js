/**
 * Interactive Capacity Development Drawer Controller
 * Renders PagtaNOW Futures Sensing, TALAMPAD Ethical Dilemma Lab, goVRnance Die & Lingkod Bayani Pledge
 */

import {
  STICKER_MARKERS,
  PAGTANOW_HORIZONS,
  PAGTANOW_ARCH_CARDS,
  TALAMPAD_SCENARIOS,
  GOVRNANCE_DIE_PROMPTS,
} from '../config/activities-data.js';
import { audioFX } from '../core/audio-fx.js';

export class ActivityDrawer {
  constructor({ drawerEl, categoryEl, titleEl, bodyEl, sceneManager }) {
    this.drawerEl = drawerEl;
    this.categoryEl = categoryEl;
    this.titleEl = titleEl;
    this.bodyEl = bodyEl;
    this.sceneManager = sceneManager;

    this.state = {
      activeMarkerId: null,
      horizon: '2030',
      selectedArchCard: PAGTANOW_ARCH_CARDS[0],
      scenarioIndex: 0,
      integrityScore: 100,
      lastDilemmaFeedback: null,
      diePrompt: GOVRNANCE_DIE_PROMPTS[0],
      pledgeName: '',
      pledgeStamped: false,
    };
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

    this.state.activeMarkerId = markerId;
    this.categoryEl.textContent = meta.category;
    this.titleEl.textContent = meta.name;
    this.expand();
    this.render();
  }

  render() {
    const id = this.state.activeMarkerId;
    if (!id) return;

    if (id === 'pagtanow') {
      this.renderPagtanow();
    } else if (id === 'talampad') {
      this.renderTalampad();
    } else if (id === 'gameon') {
      this.renderGameOn();
    } else if (id === 'kabataan') {
      this.renderKabataan();
    }
  }

  renderPagtanow() {
    const horizonData = PAGTANOW_HORIZONS[this.state.horizon];
    const activeCard = this.state.selectedArchCard;

    this.bodyEl.innerHTML = `
      <p class="activity-desc">
        <strong>Futures Sensing Game:</strong> Select a horizon year and tap a <em>PagtaNOW</em> signal arch card to interpret governance trends.
      </p>

      <div class="pill-row">
        ${Object.keys(PAGTANOW_HORIZONS)
          .map(
            (yr) => `
          <button class="choice-pill ${this.state.horizon === yr ? 'active' : ''}" data-horizon="${yr}">
            ${PAGTANOW_HORIZONS[yr].label}
          </button>`
          )
          .join('')}
      </div>

      <div class="callout-box">
        <strong>Horizon Prompt (${this.state.horizon}):</strong><br/>
        ${horizonData.prompt}
      </div>

      <div class="signal-card-grid">
        ${PAGTANOW_ARCH_CARDS.map(
          (c) => `
          <button class="signal-arch-card" style="background:${c.bg};" data-arch="${c.id}">
            <small>${c.mood}</small>
            <strong>${c.verdict}</strong>
          </button>`
        ).join('')}
      </div>

      <div class="callout-box" style="border-color: ${activeCard.bg};">
        <strong>Signal Reading (${activeCard.mood}):</strong> ${activeCard.insight}
      </div>
    `;

    this.bodyEl.querySelectorAll('[data-horizon]').forEach((btn) => {
      btn.addEventListener('click', () => {
        audioFX.playActionTap();
        this.state.horizon = btn.dataset.horizon;
        this.renderPagtanow();
      });
    });

    this.bodyEl.querySelectorAll('[data-arch]').forEach((btn) => {
      btn.addEventListener('click', () => {
        audioFX.playActionTap();
        const found = PAGTANOW_ARCH_CARDS.find((c) => c.id === btn.dataset.arch);
        if (found) {
          this.state.selectedArchCard = found;
          this.renderPagtanow();
        }
      });
    });
  }

  renderTalampad() {
    const scenario = TALAMPAD_SCENARIOS[this.state.scenarioIndex];

    this.bodyEl.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span class="kicker-pill" style="background:#1B4988;">INTEGRITY INDEX: ${this.state.integrityScore}</span>
        <button class="choice-pill" id="btn-next-scenario">Next Case →</button>
      </div>

      <div class="callout-box">
        <strong>${scenario.title}</strong><br/>
        <span style="display:block; margin-top:4px;">${scenario.context}</span>
      </div>

      <div class="dilemma-options">
        ${scenario.options
          .map(
            (opt, idx) => `
          <button class="dilemma-btn" data-opt-idx="${idx}">
            ${idx + 1}. ${opt.label}
          </button>`
          )
          .join('')}
      </div>

      ${
        this.state.lastDilemmaFeedback
          ? `<div class="callout-box" style="background:#FFF8E7;">${this.state.lastDilemmaFeedback}</div>`
          : ''
      }
    `;

    this.bodyEl.querySelectorAll('[data-opt-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const opt = scenario.options[Number(btn.dataset.optIdx)];
        if (!opt) return;
        this.state.integrityScore = Math.max(0, Math.min(150, this.state.integrityScore + opt.delta));
        this.state.lastDilemmaFeedback = opt.feedback;

        if (opt.delta >= 0) {
          audioFX.playPositiveScore();
        } else {
          audioFX.playWarningScore();
        }

        if (this.sceneManager) {
          this.sceneManager.tiltTalampadScales(opt.tilt);
        }
        this.renderTalampad();
      });
    });

    const nextBtn = this.bodyEl.querySelector('#btn-next-scenario');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        audioFX.playActionTap();
        this.state.scenarioIndex = (this.state.scenarioIndex + 1) % TALAMPAD_SCENARIOS.length;
        this.state.lastDilemmaFeedback = null;
        this.renderTalampad();
      });
    }
  }

  renderGameOn() {
    const current = this.state.diePrompt;

    this.bodyEl.innerHTML = `
      <p class="activity-desc">
        <strong>goVRnance & Tabletop Playtest:</strong> Roll the 3D Governance Die to draw an instant caravan challenge for your SUC or LGU table.
      </p>

      <div class="callout-box">
        <span class="kicker-pill" style="margin-bottom:6px;">${current.face}</span>
        <p style="margin-top:6px;">${current.challenge}</p>
      </div>

      <button id="btn-roll-die" class="btn btn-primary" style="width:100%;">
        🎲 Roll Civic Action Die
      </button>
    `;

    const rollBtn = this.bodyEl.querySelector('#btn-roll-die');
    if (rollBtn) {
      rollBtn.addEventListener('click', () => {
        audioFX.playMarkerLock();
        const pick =
          GOVRNANCE_DIE_PROMPTS[Math.floor(Math.random() * GOVRNANCE_DIE_PROMPTS.length)];
        this.state.diePrompt = pick;
        if (this.sceneManager) {
          this.sceneManager.spinGovernanceDie();
        }
        this.renderGameOn();
      });
    }
  }

  renderKabataan() {
    const stamped = this.state.pledgeStamped;
    const displayName = this.state.pledgeName.trim() || 'PAG-IWAG DELEGATE';

    this.bodyEl.innerHTML = `
      <p class="activity-desc">
        <strong>Ang Bukas ay Nasa Ating Pagpapasiya:</strong> Stamp your official <em>Lingkod Bayani</em> accountability commitment.
      </p>

      <div class="pledge-form">
        <input
          id="input-pledge-name"
          class="pledge-input"
          type="text"
          maxlength="36"
          placeholder="Your Name or Host SUC (e.g., UP Diliman)"
          value="${this.state.pledgeName.replace(/"/g, '&quot;')}"
        />
        <button id="btn-stamp-pledge" class="btn btn-primary">Stamp</button>
      </div>

      ${
        stamped
          ? `
        <div class="lingkod-stamp">
          <div style="font-size:0.68rem; font-weight:800; color:#D63629;">AKO AY ISANG</div>
          <div class="stamp-main">★ LINGKOD BAYANI ★</div>
          <div style="font-size:0.76rem; font-weight:700; margin-top:4px; color:#0D254C;">
            ${displayName.toUpperCase()} &bull; PAG-IWAG 2026
          </div>
        </div>`
          : ''
      }
    `;

    const input = this.bodyEl.querySelector('#input-pledge-name');
    const stampBtn = this.bodyEl.querySelector('#btn-stamp-pledge');

    if (input) {
      input.addEventListener('input', (e) => {
        this.state.pledgeName = e.target.value;
      });
    }

    if (stampBtn) {
      stampBtn.addEventListener('click', () => {
        audioFX.playPositiveScore();
        this.state.pledgeStamped = true;
        this.renderKabataan();
      });
    }
  }
}
