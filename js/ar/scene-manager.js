/**
 * MindAR Image Tracking Scene Manager & Interactive No-Camera 3D Simulator
 */

import { MINDAR_CONFIG } from '../config/activities-data.js';
import { buildHologramEntity } from './holograms.js';
import { audioFX } from '../core/audio-fx.js';

export class SceneManager {
  constructor({ mountEl, onMarkerDetected, onMarkerLost, onCameraReady, onCameraError }) {
    this.mountEl = mountEl;
    this.onMarkerDetected = onMarkerDetected;
    this.onMarkerLost = onMarkerLost;
    this.onCameraReady = onCameraReady;
    this.onCameraError = onCameraError;
    this.mode = null; // 'live' | 'sim'
    this.activeSimMarker = null;
    this.compiledBundle = null;
    this.videoWatchdog = null;
    this.activeTargets = new Set();
    this.orbitState = {
      isDragging: false,
      lastX: 0,
      lastY: 0,
      rotY: 22,
      rotX: -24,
    };
  }

  clearScene() {
    if (this.videoWatchdog) {
      clearTimeout(this.videoWatchdog);
      this.videoWatchdog = null;
    }

    this.activeTargets.clear();

    // Stop MindAR system cleanly if running
    const existingScene = this.mountEl.querySelector('a-scene');
    if (existingScene && existingScene.systems && existingScene.systems['mindar-image-system']) {
      try {
        existingScene.systems['mindar-image-system'].stop();
      } catch {
        // Ignore stop errors during teardown
      }
    }

    document.documentElement.classList.remove('ar-live-mode');
    document.body.classList.remove('ar-live-mode');

    const videos = document.querySelectorAll('video');
    videos.forEach((v) => {
      if (v.srcObject) {
        v.srcObject.getTracks().forEach((t) => t.stop());
      }
      v.remove();
    });
    this.mountEl.innerHTML = '';
  }

  /**
   * Mounts Live MindAR Webcam Scene using a single compiled `stickers.mind` bundle
   */
  mountLiveAR(compiledBundle) {
    this.compiledBundle = compiledBundle;

    if (!compiledBundle.hasMindBundle) {
      if (this.onCameraError) {
        this.onCameraError(
          'Compiled stickers.mind not found in marker_patterns/ yet — opened Interactive 3D Simulator.'
        );
      }
      return;
    }

    this.clearScene();
    this.mode = 'live';

    document.documentElement.classList.add('ar-live-mode');
    document.body.classList.add('ar-live-mode');

    const scene = document.createElement('a-scene');
    const minCF = MINDAR_CONFIG.filterMinCF ?? 0.0001;
    const beta = MINDAR_CONFIG.filterBeta ?? 0.001;
    const warmup = MINDAR_CONFIG.warmupTolerance ?? 5;
    const miss = MINDAR_CONFIG.missTolerance ?? 10;

    scene.setAttribute(
      'mindar-image',
      `imageTargetSrc: ${compiledBundle.resolvedMindUrl}; maxTrack: ${compiledBundle.maxTrack}; filterMinCF: ${minCF}; filterBeta: ${beta}; warmupTolerance: ${warmup}; missTolerance: ${miss}; uiLoading: no; uiScanning: no; uiError: no;`
    );
    scene.setAttribute('color-space', 'sRGB');
    scene.setAttribute('renderer', 'colorManagement: true, physicallyCorrectLights, alpha: true');
    scene.setAttribute('vr-mode-ui', 'enabled: false');
    scene.setAttribute('device-orientation-permission-ui', 'enabled: false');

    const cam = document.createElement('a-camera');
    cam.setAttribute('position', '0 0 0');
    cam.setAttribute('look-controls', 'enabled: false');
    scene.appendChild(cam);

    const assetsList = Object.values(compiledBundle.items);
    assetsList.forEach((asset, idx) => {
      const targetIndex = Number.isInteger(asset.targetIndex) ? asset.targetIndex : idx;

      const targetAnchor = document.createElement('a-entity');
      targetAnchor.setAttribute('mindar-image-target', `targetIndex: ${targetIndex}`);

      const hologram = buildHologramEntity(asset, 'ar');
      targetAnchor.appendChild(hologram);

      targetAnchor.addEventListener('targetFound', () => {
        this.activeTargets.add(asset.id);
        audioFX.playMarkerLock();
        if (this.onMarkerDetected) this.onMarkerDetected(asset.id);
      });

      targetAnchor.addEventListener('targetLost', () => {
        this.activeTargets.delete(asset.id);
        if (this.activeTargets.size === 0) {
          if (this.onMarkerLost) this.onMarkerLost(asset.id);
        } else {
          const remainingId = Array.from(this.activeTargets).pop();
          if (this.onMarkerDetected) this.onMarkerDetected(remainingId);
        }
      });

      scene.appendChild(targetAnchor);
    });

    const handleReady = () => {
      if (this.mode !== 'live') return;
      if (this.videoWatchdog) {
        clearTimeout(this.videoWatchdog);
        this.videoWatchdog = null;
      }
      audioFX.playCameraReady();
      window.dispatchEvent(new Event('resize'));
      if (this.onCameraReady) this.onCameraReady();
    };

    const handleCameraFailure = (detailMsg) => {
      if (this.mode !== 'live') return;
      if (this.videoWatchdog) {
        clearTimeout(this.videoWatchdog);
        this.videoWatchdog = null;
      }
      if (this.onCameraError) {
        this.onCameraError(
          detailMsg || 'Camera permission denied or unavailable — switched to Interactive 3D Simulator.'
        );
      }
    };

    scene.addEventListener('arReady', handleReady, { once: true });
    scene.addEventListener(
      'arError',
      (e) => {
        const errDetail = e?.detail?.error || 'MindAR failed to start camera';
        handleCameraFailure(`${errDetail} — switched to Interactive 3D Simulator.`);
      },
      { once: true }
    );

    this.mountEl.appendChild(scene);

    // Watchdog in case camera permissions stall silently
    this.videoWatchdog = setTimeout(() => {
      const vid = document.querySelector('video');
      if (vid && vid.srcObject && vid.readyState >= 2) {
        handleReady();
      } else {
        handleCameraFailure('Camera stream did not start in time — switched to Interactive 3D Simulator.');
      }
    }, 9000);
  }

  /**
   * Mounts Interactive No-Camera 3D Simulator with drag-to-orbit tabletop preview
   */
  mountSimulator(compiledBundle, initialMarkerId = null) {
    this.compiledBundle = compiledBundle;
    const items = compiledBundle.items;
    const keys = Object.keys(items);
    const startId = initialMarkerId && items[initialMarkerId] ? initialMarkerId : keys[0];
    this.activeSimMarker = startId;

    this.clearScene();
    this.mode = 'sim';

    const scene = document.createElement('a-scene');
    scene.setAttribute('embedded', '');
    scene.setAttribute('vr-mode-ui', 'enabled: false');
    scene.setAttribute('background', 'color: #0D254C');

    const ambient = document.createElement('a-light');
    ambient.setAttribute('type', 'ambient');
    ambient.setAttribute('color', '#FFFDF7');
    ambient.setAttribute('intensity', '0.9');
    scene.appendChild(ambient);

    const dirLight = document.createElement('a-light');
    dirLight.setAttribute('type', 'directional');
    dirLight.setAttribute('position', '2 4 3');
    dirLight.setAttribute('intensity', '0.95');
    scene.appendChild(dirLight);

    const stage = document.createElement('a-entity');
    stage.setAttribute('id', 'sim-stage');
    stage.setAttribute('position', '0 0.1 -2.1');
    stage.setAttribute(
      'rotation',
      `${this.orbitState.rotX} ${this.orbitState.rotY} 0`
    );

    const tableDisc = document.createElement('a-cylinder');
    tableDisc.setAttribute('radius', '1.15');
    tableDisc.setAttribute('height', '0.06');
    tableDisc.setAttribute('position', '0 -0.04 0');
    tableDisc.setAttribute('color', '#1B4988');
    stage.appendChild(tableDisc);

    // Transparent alphaTest plane so die-cut / circular borderless stickers render cleanly
    const stickerPlane = document.createElement('a-plane');
    stickerPlane.setAttribute('id', 'sim-sticker-plane');
    stickerPlane.setAttribute('width', '1.25');
    stickerPlane.setAttribute('height', '1.25');
    stickerPlane.setAttribute('rotation', '-90 0 0');
    stickerPlane.setAttribute('position', '0 0.005 0');
    stickerPlane.setAttribute('material', 'transparent: true; alphaTest: 0.1;');
    stickerPlane.setAttribute('src', items[startId].previewDataUrl);
    stage.appendChild(stickerPlane);

    const holoSlot = document.createElement('a-entity');
    holoSlot.setAttribute('id', 'sim-hologram-slot');
    holoSlot.appendChild(buildHologramEntity(items[startId], 'sim'));
    stage.appendChild(holoSlot);

    scene.appendChild(stage);

    const cam = document.createElement('a-entity');
    cam.setAttribute('camera', 'active: true');
    cam.setAttribute('position', '0 1.25 0.4');
    cam.setAttribute('rotation', '-24 0 0');
    scene.appendChild(cam);

    this.mountEl.appendChild(scene);
    this.attachOrbitControls(stage);

    if (this.onMarkerDetected) {
      this.onMarkerDetected(startId);
    }
  }

  switchSimulatorMarker(markerId) {
    if (this.mode !== 'sim' || !this.compiledBundle?.items?.[markerId]) return;
    this.activeSimMarker = markerId;
    const asset = this.compiledBundle.items[markerId];

    const plane = document.getElementById('sim-sticker-plane');
    const slot = document.getElementById('sim-hologram-slot');

    if (plane) {
      plane.setAttribute('src', asset.previewDataUrl);
    }
    if (slot) {
      slot.innerHTML = '';
      slot.appendChild(buildHologramEntity(asset, 'sim'));
    }

    audioFX.playMarkerLock();
    if (this.onMarkerDetected) {
      this.onMarkerDetected(markerId);
    }
  }

  attachOrbitControls(stageEl) {
    const onDown = (clientX, clientY) => {
      this.orbitState.isDragging = true;
      this.orbitState.lastX = clientX;
      this.orbitState.lastY = clientY;
    };

    const onMove = (clientX, clientY) => {
      if (!this.orbitState.isDragging) return;
      const dx = clientX - this.orbitState.lastX;
      const dy = clientY - this.orbitState.lastY;
      this.orbitState.lastX = clientX;
      this.orbitState.lastY = clientY;

      this.orbitState.rotY += dx * 0.65;
      this.orbitState.rotX = Math.max(
        -55,
        Math.min(15, this.orbitState.rotX + dy * 0.45)
      );
      stageEl.setAttribute(
        'rotation',
        `${this.orbitState.rotX} ${this.orbitState.rotY} 0`
      );
    };

    const onUp = () => {
      this.orbitState.isDragging = false;
    };

    this.mountEl.onmousedown = (e) => onDown(e.clientX, e.clientY);
    window.onmousemove = (e) => onMove(e.clientX, e.clientY);
    window.onmouseup = onUp;

    this.mountEl.ontouchstart = (e) => {
      if (e.touches[0]) onDown(e.touches[0].clientX, e.touches[0].clientY);
    };
    this.mountEl.ontouchmove = (e) => {
      if (e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    this.mountEl.ontouchend = onUp;
  }
}
