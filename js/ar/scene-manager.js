/**
 * AR.js Live Scene Manager & Interactive No-Camera 3D Sticker Simulator
 */

import { buildHologramEntity } from './holograms.js';
import { audioFX } from '../core/audio-fx.js';

export class SceneManager {
  constructor({ mountEl, onMarkerDetected, onMarkerLost }) {
    this.mountEl = mountEl;
    this.onMarkerDetected = onMarkerDetected;
    this.onMarkerLost = onMarkerLost;
    this.mode = null; // 'live' | 'sim'
    this.activeSimMarker = 'pagtanow';
    this.compiledAssets = null;
    this.orbitState = {
      isDragging: false,
      lastX: 0,
      lastY: 0,
      rotY: 22,
      rotX: -24,
    };
  }

  clearScene() {
    // Stop any lingering video streams created by AR.js
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
   * Mounts Live AR.js Webcam Scene with all 4 custom .patt markers
   */
  mountLiveAR(compiledAssets) {
    this.compiledAssets = compiledAssets;
    this.clearScene();
    this.mode = 'live';

    const scene = document.createElement('a-scene');
    scene.setAttribute('embedded', '');
    scene.setAttribute(
      'arjs',
      'sourceType: webcam; debugUIEnabled: false; detectionMode: mono; patternRatio: 0.70;'
    );
    scene.setAttribute('vr-mode-ui', 'enabled: false');
    scene.setAttribute('renderer', 'logarithmicDepthBuffer: true; antialias: true;');

    Object.values(compiledAssets).forEach((asset) => {
      const marker = document.createElement('a-marker');
      marker.setAttribute('type', 'pattern');
      marker.setAttribute('url', asset.pattDataUri);
      marker.setAttribute('emitevents', 'true');
      marker.setAttribute('smooth', 'true');
      marker.setAttribute('smoothCount', '5');

      const hologram = buildHologramEntity(asset.id);
      marker.appendChild(hologram);

      marker.addEventListener('markerFound', () => {
        audioFX.playMarkerLock();
        if (this.onMarkerDetected) this.onMarkerDetected(asset.id);
      });

      marker.addEventListener('markerLost', () => {
        if (this.onMarkerLost) this.onMarkerLost(asset.id);
      });

      scene.appendChild(marker);
    });

    const cam = document.createElement('a-entity');
    cam.setAttribute('camera', '');
    scene.appendChild(cam);

    this.mountEl.appendChild(scene);
  }

  /**
   * Mounts Interactive No-Camera 3D Simulator with drag-to-orbit tabletop preview
   */
  mountSimulator(compiledAssets, initialMarkerId = 'pagtanow') {
    this.compiledAssets = compiledAssets;
    this.activeSimMarker = initialMarkerId;
    this.clearScene();
    this.mode = 'sim';

    const scene = document.createElement('a-scene');
    scene.setAttribute('embedded', '');
    scene.setAttribute('vr-mode-ui', 'enabled: false');
    scene.setAttribute('background', 'color: #0D254C');

    // Lighting
    const ambient = document.createElement('a-light');
    ambient.setAttribute('type', 'ambient');
    ambient.setAttribute('color', '#FFFDF7');
    ambient.setAttribute('intensity', '0.85');
    scene.appendChild(ambient);

    const dirLight = document.createElement('a-light');
    dirLight.setAttribute('type', 'directional');
    dirLight.setAttribute('position', '2 4 3');
    dirLight.setAttribute('intensity', '0.9');
    scene.appendChild(dirLight);

    // Orbit Pivot Stage
    const stage = document.createElement('a-entity');
    stage.setAttribute('id', 'sim-stage');
    stage.setAttribute('position', '0 0.1 -2.1');
    stage.setAttribute(
      'rotation',
      `${this.orbitState.rotX} ${this.orbitState.rotY} 0`
    );

    // Tabletop Base Disc
    const tableDisc = document.createElement('a-cylinder');
    tableDisc.setAttribute('radius', '1.15');
    tableDisc.setAttribute('height', '0.06');
    tableDisc.setAttribute('position', '0 -0.04 0');
    tableDisc.setAttribute('color', '#1B4988');
    stage.appendChild(tableDisc);

    // Sticker Marker Card Plane
    const stickerPlane = document.createElement('a-plane');
    stickerPlane.setAttribute('id', 'sim-sticker-plane');
    stickerPlane.setAttribute('width', '1.25');
    stickerPlane.setAttribute('height', '1.25');
    stickerPlane.setAttribute('rotation', '-90 0 0');
    stickerPlane.setAttribute('position', '0 0.005 0');
    stickerPlane.setAttribute(
      'src',
      compiledAssets[initialMarkerId].previewDataUrl
    );
    stage.appendChild(stickerPlane);

    // Hologram Container
    const holoSlot = document.createElement('a-entity');
    holoSlot.setAttribute('id', 'sim-hologram-slot');
    holoSlot.appendChild(buildHologramEntity(initialMarkerId));
    stage.appendChild(holoSlot);

    scene.appendChild(stage);

    // Fixed Camera
    const cam = document.createElement('a-entity');
    cam.setAttribute('camera', 'active: true');
    cam.setAttribute('position', '0 1.25 0.4');
    cam.setAttribute('rotation', '-24 0 0');
    scene.appendChild(cam);

    this.mountEl.appendChild(scene);
    this.attachOrbitControls(stage);

    if (this.onMarkerDetected) {
      this.onMarkerDetected(initialMarkerId);
    }
  }

  switchSimulatorMarker(markerId) {
    if (this.mode !== 'sim' || !this.compiledAssets[markerId]) return;
    this.activeSimMarker = markerId;

    const plane = document.getElementById('sim-sticker-plane');
    const slot = document.getElementById('sim-hologram-slot');

    if (plane) {
      plane.setAttribute('src', this.compiledAssets[markerId].previewDataUrl);
    }
    if (slot) {
      slot.innerHTML = '';
      slot.appendChild(buildHologramEntity(markerId));
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

  /**
   * Updates interactive 3D hologram state (e.g., tilting TALAMPAD scales or spinning goVRnance die)
   */
  tiltTalampadScales(tiltRadians) {
    const beam = document.getElementById('talampad-beam-3d');
    if (beam) {
      const deg = Math.round((tiltRadians * 180) / Math.PI);
      beam.setAttribute(
        'animation',
        `property: rotation; to: 0 0 ${deg}; dur: 450; easing: easeOutElastic`
      );
    }
  }

  spinGovernanceDie() {
    const die = document.getElementById('govrnance-die-3d');
    if (die) {
      const rx = 360 * (1 + Math.floor(Math.random() * 2));
      const ry = 360 * (1 + Math.floor(Math.random() * 2));
      die.setAttribute(
        'animation',
        `property: rotation; to: ${rx} ${ry} 90; dur: 900; easing: easeOutCubic`
      );
    }
  }
}
