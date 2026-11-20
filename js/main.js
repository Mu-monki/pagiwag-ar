/**
 * PAG-IWAG AR — Main Application Boot Sequence & MindAR Event Wiring
 */

import { STICKER_MARKERS } from './config/activities-data.js';
import { compileAllStickerAssets } from './core/marker-compiler.js';
import { checkCameraEnvironment } from './core/camera-preflight.js';
import { audioFX } from './core/audio-fx.js';
import { SceneManager } from './ar/scene-manager.js';
import { ActivityDrawer } from './ui/activity-drawer.js';
import {
  renderKitModalGrid,
  downloadPrintableSheet,
} from './ui/marker-exporter.js';

document.addEventListener('DOMContentLoaded', async () => {
  const splashScreen = document.getElementById('splash-screen');
  const statusText = document.getElementById('loader-status-text');
  const percentText = document.getElementById('loader-percent');
  const progressBar = document.getElementById('loader-progressbar');
  const barFill = document.getElementById('loader-bar-fill');
  const checklistEl = document.getElementById('asset-checklist');

  const btnLaunchAR = document.getElementById('btn-launch-ar');
  const btnLaunchSim = document.getElementById('btn-launch-sim');
  const btnOpenKit = document.getElementById('btn-open-kit');

  const workspace = document.getElementById('ar-workspace');
  const sceneMount = document.getElementById('scene-mount');
  const hudModeBadge = document.getElementById('hud-mode-badge');
  const btnToggleSfx = document.getElementById('btn-toggle-sfx');
  const btnToggleMode = document.getElementById('btn-toggle-mode');
  const btnBackSplash = document.getElementById('btn-back-splash');
  const btnHudKit = document.getElementById('btn-hud-kit');

  const diagnosticBanner = document.getElementById('diagnostic-banner');
  const diagnosticText = document.getElementById('diagnostic-text');
  const btnDismissBanner = document.getElementById('btn-dismiss-banner');

  const scanReticle = document.getElementById('scan-reticle');
  const reticleHintText = document.getElementById('reticle-hint-text');
  const simStickerBar = document.getElementById('sim-sticker-bar');

  const kitModal = document.getElementById('kit-modal');
  const kitGrid = document.getElementById('kit-grid');
  const btnCloseKit = document.getElementById('btn-close-kit');
  const btnDownloadSheet = document.getElementById('btn-download-sheet');

  let compiledBundle = null;
  let sceneManager = null;
  let infoDrawer = null;

  function showDiagnostic(message) {
    diagnosticText.textContent = message;
    diagnosticBanner.classList.remove('hidden');
  }

  function hideDiagnostic() {
    diagnosticBanner.classList.add('hidden');
  }

  // Render splash checklist chips & simulator tabs dynamically from STICKER_MARKERS
  checklistEl.innerHTML = STICKER_MARKERS.map(
    (s) => `
      <div class="asset-chip" data-asset="${s.id}">
        <div class="asset-chip-left">
          <span class="chip-dot"></span>
          <span>${s.shortLabel}</span>
        </div>
        <span class="asset-chip-tag" data-tag="${s.id}">checking</span>
      </div>`
  ).join('');

  simStickerBar.innerHTML = STICKER_MARKERS.map(
    (s, idx) => `
      <button class="sim-tab ${idx === 0 ? 'active' : ''}" data-marker="${s.id}">
        ${s.icon || '✨'} ${s.shortLabel}
      </button>`
  ).join('');

  // 1. Functional Splash Screen MindAR Bundle & 3D Model Check
  statusText.textContent = 'Checking stickers.mind & 3D models...';
  compiledBundle = await compileAllStickerAssets((asset, step, total) => {
    const pct = Math.round((step / total) * 90);
    barFill.style.width = `${pct}%`;
    percentText.textContent = `${pct}%`;
    progressBar.setAttribute('aria-valuenow', String(pct));

    const chip = checklistEl.querySelector(`.asset-chip[data-asset="${asset.id}"]`);
    const tag = checklistEl.querySelector(`[data-tag="${asset.id}"]`);
    if (chip) {
      chip.classList.add(asset.hasMindBundle ? 'ready' : 'sim-only');
    }
    if (tag) {
      const targetBadge = asset.hasMindBundle ? 'MIND' : 'SIM';
      const modelBadge = asset.hasCustomModel ? '+GLB' : '+3D';
      tag.textContent = `${targetBadge}${modelBadge}`;
    }
    statusText.textContent = `Verified ${asset.shortLabel} (${step}/${total})...`;
  });

  statusText.textContent = 'Preparing borderless sticker kit...';
  renderKitModalGrid(kitGrid, compiledBundle.items);

  barFill.style.width = '100%';
  percentText.textContent = '100%';
  progressBar.setAttribute('aria-valuenow', '100');
  statusText.textContent = compiledBundle.hasMindBundle
    ? `Ready! stickers.mind loaded (${STICKER_MARKERS.length} image targets).`
    : 'Ready! Add stickers.mind in marker_patterns/ for live MindAR camera tracking.';

  btnLaunchAR.disabled = false;
  btnLaunchSim.disabled = false;
  btnOpenKit.disabled = false;

  // 2. Initialize Scene Manager & Sticker Info Drawer
  sceneManager = new SceneManager({
    mountEl: sceneMount,
    onMarkerDetected: (markerId) => {
      scanReticle.classList.add('hidden');
      infoDrawer.setActiveMarker(markerId);
    },
    onMarkerLost: () => {
      if (sceneManager.mode === 'live') {
        scanReticle.classList.remove('hidden');
      }
    },
    onCameraReady: () => {
      if (reticleHintText) {
        reticleHintText.innerHTML =
          'Point camera at any borderless <strong>PAG-IWAG</strong> sticker';
      }
    },
    onCameraError: (reason) => {
      enterSimulatorMode(reason);
    },
  });

  infoDrawer = new ActivityDrawer({
    drawerEl: document.getElementById('activity-drawer'),
    categoryEl: document.getElementById('drawer-category'),
    titleEl: document.getElementById('drawer-title'),
    bodyEl: document.getElementById('drawer-body'),
  });
  
  window.addEventListener('gltf-clips-loaded', () => {
    infoDrawer.refreshActiveDrawer();
  });

  // 3. Mode Launchers
  function enterLiveMode() {
    const env = checkCameraEnvironment();
    if (!env.supported) {
      enterSimulatorMode(env.reason);
      return;
    }

    hideDiagnostic();
    splashScreen.classList.add('hidden');
    workspace.classList.remove('hidden');
    simStickerBar.classList.add('hidden');
    scanReticle.classList.remove('hidden');

    if (reticleHintText) {
      reticleHintText.innerHTML =
        'Starting MindAR camera… Point at any <strong>PAG-IWAG</strong> sticker';
    }

    hudModeBadge.textContent = 'MINDAR TRACKING';
    hudModeBadge.className = 'hud-badge hud-badge--live';
    btnToggleMode.textContent = 'Switch to 3D Sim';

    sceneManager.mountLiveAR(compiledBundle);
  }

  function enterSimulatorMode(diagnosticMsg = null) {
    splashScreen.classList.add('hidden');
    workspace.classList.remove('hidden');
    scanReticle.classList.add('hidden');
    simStickerBar.classList.remove('hidden');

    hudModeBadge.textContent = '3D SIMULATOR';
    hudModeBadge.className = 'hud-badge hud-badge--sim';
    btnToggleMode.innerHTML = '<i class="fa-solid fa-tower-broadcast"></i> Try Live AR';

    if (diagnosticMsg) {
      showDiagnostic(diagnosticMsg);
    } else {
      hideDiagnostic();
    }

    const firstId = STICKER_MARKERS[0] ? STICKER_MARKERS[0].id : 'pagtanow';
    simStickerBar.querySelectorAll('.sim-tab').forEach((t, idx) => {
      t.classList.toggle('active', idx === 0);
    });
    sceneManager.mountSimulator(compiledBundle, firstId);
  }

  btnLaunchAR.addEventListener('click', () => {
    audioFX.playActionTap();
    enterLiveMode();
  });

  btnLaunchSim.addEventListener('click', () => {
    audioFX.playActionTap();
    enterSimulatorMode();
  });

  btnToggleMode.addEventListener('click', () => {
    audioFX.playActionTap();
    if (sceneManager.mode === 'live') {
      enterSimulatorMode();
    } else {
      enterLiveMode();
    }
  });

  btnToggleSfx.addEventListener('click', () => {
    const muted = audioFX.toggleMute();
    btnToggleSfx.textContent = muted ? '🔇' : '🔊';
    btnToggleSfx.title = muted ? 'Unmute Sound Effects' : 'Mute Sound Effects';
  });

  btnBackSplash.addEventListener('click', () => {
    audioFX.playActionTap();
    sceneManager.clearScene();
    workspace.classList.add('hidden');
    splashScreen.classList.remove('hidden');
  });

  simStickerBar.querySelectorAll('.sim-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      simStickerBar.querySelectorAll('.sim-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      sceneManager.switchSimulatorMarker(tab.dataset.marker);
    });
  });

  document.getElementById('drawer-toggle-bar').addEventListener('click', () => {
    audioFX.playActionTap();
    infoDrawer.toggleExpand();
  });

  btnDismissBanner.addEventListener('click', hideDiagnostic);

  btnOpenKit.addEventListener('click', () => {
    audioFX.playActionTap();
    kitModal.classList.remove('hidden');
  });

  btnHudKit.addEventListener('click', () => {
    audioFX.playActionTap();
    kitModal.classList.remove('hidden');
  });

  btnCloseKit.addEventListener('click', () => {
    audioFX.playActionTap();
    kitModal.classList.add('hidden');
  });

  btnDownloadSheet.addEventListener('click', () => {
    downloadPrintableSheet(compiledBundle.items);
  });
});
