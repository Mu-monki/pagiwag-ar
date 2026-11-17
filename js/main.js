/**
 * PAG-IWAG AR — Main Application Boot Sequence & Event Wiring
 */

import { compileAllStickerAssets } from './core/marker-compiler.js';
import { runCameraPreflight } from './core/camera-preflight.js';
import { audioFX } from './core/audio-fx.js';
import { SceneManager } from './ar/scene-manager.js';
import { ActivityDrawer } from './ui/activity-drawer.js';
import {
  renderKitModalGrid,
  downloadPrintableSheet,
} from './ui/marker-exporter.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Splash Screen Elements
  const splashScreen = document.getElementById('splash-screen');
  const statusText = document.getElementById('loader-status-text');
  const percentText = document.getElementById('loader-percent');
  const progressBar = document.getElementById('loader-progressbar');
  const barFill = document.getElementById('loader-bar-fill');

  const btnLaunchAR = document.getElementById('btn-launch-ar');
  const btnLaunchSim = document.getElementById('btn-launch-sim');
  const btnOpenKit = document.getElementById('btn-open-kit');

  // Workspace Elements
  const workspace = document.getElementById('ar-workspace');
  const sceneMount = document.getElementById('scene-mount');
  const hudModeBadge = document.getElementById('hud-mode-badge');
  const btnToggleMode = document.getElementById('btn-toggle-mode');
  const btnBackSplash = document.getElementById('btn-back-splash');
  const btnHudKit = document.getElementById('btn-hud-kit');

  const diagnosticBanner = document.getElementById('diagnostic-banner');
  const diagnosticText = document.getElementById('diagnostic-text');
  const btnDismissBanner = document.getElementById('btn-dismiss-banner');

  const scanReticle = document.getElementById('scan-reticle');
  const simStickerBar = document.getElementById('sim-sticker-bar');

  // Kit Modal Elements
  const kitModal = document.getElementById('kit-modal');
  const kitGrid = document.getElementById('kit-grid');
  const btnCloseKit = document.getElementById('btn-close-kit');
  const btnDownloadSheet = document.getElementById('btn-download-sheet');

  let compiledAssets = null;
  let sceneManager = null;
  let activityDrawer = null;

  function showDiagnostic(message) {
    diagnosticText.textContent = message;
    diagnosticBanner.classList.remove('hidden');
  }

  function hideDiagnostic() {
    diagnosticBanner.classList.add('hidden');
  }

  // 1. Functional Splash Screen Asset Preload Sequence
  statusText.textContent = 'Compiling custom AR.js .patt markers...';
  compiledAssets = await compileAllStickerAssets((assetId, step, total) => {
    const pct = Math.round((step / total) * 85);
    barFill.style.width = `${pct}%`;
    percentText.textContent = `${pct}%`;
    progressBar.setAttribute('aria-valuenow', String(pct));

    const chip = document.querySelector(`.asset-chip[data-asset="${assetId}"]`);
    if (chip) chip.classList.add('ready');
    statusText.textContent = `Compiled ${assetId.toUpperCase()} marker (${step}/${total})...`;
  });

  statusText.textContent = 'Preparing 3D holograms & printable sticker sheet...';
  renderKitModalGrid(kitGrid, compiledAssets);

  barFill.style.width = '100%';
  percentText.textContent = '100%';
  progressBar.setAttribute('aria-valuenow', '100');
  statusText.textContent = 'All PAG-IWAG AR assets ready!';

  btnLaunchAR.disabled = false;
  btnLaunchSim.disabled = false;
  btnOpenKit.disabled = false;

  // 2. Initialize Scene Manager & Interactive Activity Drawer
  sceneManager = new SceneManager({
    mountEl: sceneMount,
    onMarkerDetected: (markerId) => {
      scanReticle.classList.add('hidden');
      activityDrawer.setActiveMarker(markerId);
    },
    onMarkerLost: () => {
      if (sceneManager.mode === 'live') {
        scanReticle.classList.remove('hidden');
      }
    },
  });

  activityDrawer = new ActivityDrawer({
    drawerEl: document.getElementById('activity-drawer'),
    categoryEl: document.getElementById('drawer-category'),
    titleEl: document.getElementById('drawer-title'),
    bodyEl: document.getElementById('drawer-body'),
    sceneManager,
  });

  // 3. Mode Launchers
  function enterLiveMode() {
    splashScreen.classList.add('hidden');
    workspace.classList.remove('hidden');
    simStickerBar.classList.add('hidden');
    scanReticle.classList.remove('hidden');

    hudModeBadge.textContent = 'LIVE CAMERA';
    hudModeBadge.className = 'hud-badge hud-badge--live';
    btnToggleMode.textContent = 'Switch to 3D Sim';

    sceneManager.mountLiveAR(compiledAssets);
  }

  function enterSimulatorMode(diagnosticMsg = null) {
    splashScreen.classList.add('hidden');
    workspace.classList.remove('hidden');
    scanReticle.classList.add('hidden');
    simStickerBar.classList.remove('hidden');

    hudModeBadge.textContent = '3D SIMULATOR';
    hudModeBadge.className = 'hud-badge hud-badge--sim';
    btnToggleMode.textContent = 'Try Live Camera';

    if (diagnosticMsg) {
      showDiagnostic(diagnosticMsg);
    } else {
      hideDiagnostic();
    }

    sceneManager.mountSimulator(compiledAssets, 'pagtanow');
  }

  // Launch Live AR with 4-second camera preflight check
  btnLaunchAR.addEventListener('click', async () => {
    audioFX.playActionTap();
    btnLaunchAR.disabled = true;
    btnLaunchAR.querySelector('span:last-child').textContent = 'Checking Camera...';

    const check = await runCameraPreflight(4000);

    btnLaunchAR.disabled = false;
    btnLaunchAR.querySelector('span:last-child').textContent = 'Launch PAG-IWAG AR';

    if (check.supported) {
      hideDiagnostic();
      enterLiveMode();
    } else {
      enterSimulatorMode(check.reason);
    }
  });

  btnLaunchSim.addEventListener('click', () => {
    audioFX.playActionTap();
    enterSimulatorMode();
  });

  btnToggleMode.addEventListener('click', async () => {
    audioFX.playActionTap();
    if (sceneManager.mode === 'live') {
      enterSimulatorMode();
    } else {
      const check = await runCameraPreflight(4000);
      if (check.supported) {
        hideDiagnostic();
        enterLiveMode();
      } else {
        showDiagnostic(check.reason);
      }
    }
  });

  btnBackSplash.addEventListener('click', () => {
    audioFX.playActionTap();
    sceneManager.clearScene();
    workspace.classList.add('hidden');
    splashScreen.classList.remove('hidden');
  });

  // Simulator Tab Switcher
  simStickerBar.querySelectorAll('.sim-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      simStickerBar.querySelectorAll('.sim-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      sceneManager.switchSimulatorMarker(tab.dataset.marker);
    });
  });

  // Drawer Handle Toggle
  document.getElementById('drawer-toggle-bar').addEventListener('click', () => {
    audioFX.playActionTap();
    activityDrawer.toggleExpand();
  });

  btnDismissBanner.addEventListener('click', hideDiagnostic);

  // Kit Modal Controls
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
    downloadPrintableSheet(compiledAssets);
  });
});
