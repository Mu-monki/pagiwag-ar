/**
 * 3D Model (.glb/.gltf) & Procedural Hologram Builders for PAG-IWAG MindAR Stickers
 *
 * Supports two coordinate modes:
 * - mode === 'ar': Centered MindAR image target coordinates (`arPosition`, `arScale`, `arRotation`),
 *   where +Z extends outward from the sticker toward the viewer.
 * - mode === 'sim': Normalized tabletop 3D Simulator coordinates (`simPosition`, `simScale`, `simRotation`),
 *   where +Y extends upward from the table.
 */

if (typeof AFRAME !== 'undefined' && !AFRAME.components['gltf-clips']) {
  AFRAME.registerComponent('gltf-clips', {
    init() {
      this.mixer = null;
      this.clips = [];
      this.actions = [];
      this.activeIndex = 0; // -1 = all tracks, >= 0 = single track index
      // this.isPlaying = true;
      this.clipsPlaying = true;

      this.el.addEventListener('model-loaded', (e) => {
        const model = e.detail?.model;
        if (!model || !Array.isArray(model.animations) || model.animations.length === 0) return;

        this.clips = model.animations;
        this.mixer = new THREE.AnimationMixer(model);
        this.actions = this.clips.map((clip) => this.mixer.clipAction(clip));
        this.playClip(0);

        window.dispatchEvent(new CustomEvent('gltf-clips-loaded'));
      });
    },
    getTrackNames() {
      return this.clips.map((c, idx) => c.name || `Track ${idx + 1}`);
    },
    playClip(index) {
      if (!this.mixer || this.actions.length === 0) return;
      this.activeIndex = index;
      // this.isPlaying = true;
      this.clipsPlaying = true;
      this.actions.forEach((action, idx) => {
        if (index === -1 || idx === index) {
          action.enabled = true;
          action.paused = false;
          action.reset().play();
        } else {
          action.stop();
        }
      });
    },
    togglePlayPause() {
      if (!this.mixer || this.actions.length === 0) return false;
      // this.isPlaying = !this.isPlaying;
      this.clipsPlaying = !this.clipsPlaying;
      this.actions.forEach((action, idx) => {
        if (this.activeIndex === -1 || idx === this.activeIndex) {
          action.paused = !this.clipsPlaying;
        }
      });
      return this.clipsPlaying;
    },
    tick(time, timeDelta) {
      if (this.mixer && this.clipsPlaying) this.mixer.update(timeDelta / 1000);
    },
    remove() {
      if (this.mixer) {
        this.mixer.stopAllAction();
        this.mixer = null;
      }
    },
  });
}

function buildProceduralFallback(markerId) {
  const root = document.createElement('a-entity');
  root.setAttribute('position', '0 0.08 0');

  if (markerId === 'pagtanow') {
    const pedestal = document.createElement('a-cylinder');
    pedestal.setAttribute('radius', '0.32');
    pedestal.setAttribute('height', '0.12');
    pedestal.setAttribute('color', '#0D254C');
    pedestal.setAttribute('position', '0 0.06 0');
    root.appendChild(pedestal);

    const globe = document.createElement('a-sphere');
    globe.setAttribute('radius', '0.42');
    globe.setAttribute('position', '0 0.58 0');
    globe.setAttribute('color', '#2B7A78');
    globe.setAttribute('opacity', '0.78');
    globe.setAttribute('metalness', '0.15');
    globe.setAttribute('roughness', '0.2');
    globe.setAttribute(
      'animation',
      'property: rotation; to: 0 360 0; loop: true; dur: 9000; easing: linear'
    );
    root.appendChild(globe);

    const core = document.createElement('a-dodecahedron');
    core.setAttribute('radius', '0.2');
    core.setAttribute('position', '0 0.58 0');
    core.setAttribute('color', '#FFD147');
    core.setAttribute(
      'animation',
      'property: position; dir: alternate; dur: 1800; loop: true; to: 0 0.66 0'
    );
    root.appendChild(core);

    const ring = document.createElement('a-torus');
    ring.setAttribute('radius', '0.58');
    ring.setAttribute('radius-tubular', '0.02');
    ring.setAttribute('position', '0 0.58 0');
    ring.setAttribute('rotation', '68 15 0');
    ring.setAttribute('color', '#F6A821');
    ring.setAttribute(
      'animation',
      'property: rotation; to: 68 375 0; loop: true; dur: 5000; easing: linear'
    );
    root.appendChild(ring);
  } else if (markerId === 'talampad') {
    const pillar = document.createElement('a-cylinder');
    pillar.setAttribute('radius', '0.08');
    pillar.setAttribute('height', '0.85');
    pillar.setAttribute('position', '0 0.42 0');
    pillar.setAttribute('color', '#1B4988');
    root.appendChild(pillar);

    const flame = document.createElement('a-cone');
    flame.setAttribute('radius-bottom', '0.12');
    flame.setAttribute('radius-top', '0.01');
    flame.setAttribute('height', '0.26');
    flame.setAttribute('position', '0 0.98 0');
    flame.setAttribute('color', '#F6A821');
    flame.setAttribute(
      'animation',
      'property: scale; dir: alternate; dur: 900; loop: true; to: 1.15 1.25 1.15'
    );
    root.appendChild(flame);

    const beam = document.createElement('a-box');
    beam.setAttribute('width', '0.96');
    beam.setAttribute('height', '0.05');
    beam.setAttribute('depth', '0.06');
    beam.setAttribute('position', '0 0.74 0');
    beam.setAttribute('color', '#FFD147');
    root.appendChild(beam);

    const leftPan = document.createElement('a-cylinder');
    leftPan.setAttribute('radius', '0.16');
    leftPan.setAttribute('height', '0.04');
    leftPan.setAttribute('position', '-0.44 0.56 0');
    leftPan.setAttribute('color', '#D63629');
    root.appendChild(leftPan);

    const rightPan = document.createElement('a-cylinder');
    rightPan.setAttribute('radius', '0.16');
    rightPan.setAttribute('height', '0.04');
    rightPan.setAttribute('position', '0.44 0.56 0');
    rightPan.setAttribute('color', '#2B7A78');
    root.appendChild(rightPan);
  } else if (markerId === 'gameon') {
    const die = document.createElement('a-box');
    die.setAttribute('width', '0.46');
    die.setAttribute('height', '0.46');
    die.setAttribute('depth', '0.46');
    die.setAttribute('position', '0 0.56 0');
    die.setAttribute('color', '#1B4988');
    die.setAttribute(
      'animation',
      'property: rotation; to: 360 360 0; loop: true; dur: 7000; easing: linear'
    );
    root.appendChild(die);

    const halo = document.createElement('a-torus');
    halo.setAttribute('radius', '0.52');
    halo.setAttribute('radius-tubular', '0.025');
    halo.setAttribute('rotation', '90 0 0');
    halo.setAttribute('position', '0 0.22 0');
    halo.setAttribute('color', '#FFD147');
    root.appendChild(halo);
  } else {
    const base = document.createElement('a-cylinder');
    base.setAttribute('radius', '0.24');
    base.setAttribute('height', '0.44');
    base.setAttribute('position', '0 0.22 0');
    base.setAttribute('color', '#1B4988');
    root.appendChild(base);

    const sunburst = document.createElement('a-octahedron');
    sunburst.setAttribute('radius', '0.32');
    sunburst.setAttribute('position', '0 0.72 0');
    sunburst.setAttribute('color', '#F6A821');
    sunburst.setAttribute(
      'animation',
      'property: rotation; to: 0 360 360; loop: true; dur: 6500; easing: linear'
    );
    root.appendChild(sunburst);

    const outerRing = document.createElement('a-ring');
    outerRing.setAttribute('radius-inner', '0.42');
    outerRing.setAttribute('radius-outer', '0.50');
    outerRing.setAttribute('position', '0 0.72 0');
    outerRing.setAttribute('color', '#D63629');
    outerRing.setAttribute('side', 'double');
    root.appendChild(outerRing);
  }

  return root;
}

function attachFloatingStickers(wrapper, urls = []) {
  if (!Array.isArray(urls) || urls.length === 0) return;

  const ring = document.createElement('a-entity');
  ring.setAttribute(
    'animation',
    'property: rotation; to: 0 360 0; loop: true; dur: 22000; easing: linear'
  );

  const radius = 0.62;
  urls.forEach((src, i) => {
    const angle = (i / urls.length) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const baseY = 0.58 + (i % 2 === 0 ? 0.06 : -0.04);
    const rotY = (-angle * 180) / Math.PI + 90;

    const card = document.createElement('a-plane');
    card.setAttribute('src', src);
    card.setAttribute('width', '0.26');
    card.setAttribute('height', '0.26');
    card.setAttribute('position', `${x.toFixed(3)} ${baseY.toFixed(3)} ${z.toFixed(3)}`);
    card.setAttribute('rotation', `0 ${rotY.toFixed(1)} 0`);
    card.setAttribute('material', 'transparent: true; alphaTest: 0.1; side: double; shader: flat;');
    card.setAttribute(
      'animation',
      `property: position; dir: alternate; loop: true; dur: ${1800 + (i % 4) * 250}; easing: easeInOutSine; to: ${x.toFixed(3)} ${(baseY + 0.08).toFixed(3)} ${z.toFixed(3)}`
    );

    ring.appendChild(card);
  });

  wrapper.appendChild(ring);
}

/**
 * Builds the 3D entity for either MindAR live tracking ('ar') or the 3D Simulator ('sim').
 */
export function buildHologramEntity(asset, mode = 'sim') {
  const isAr = mode === 'ar';
  const pos = isAr ? (asset?.arPosition || '0 0 0.05') : (asset?.simPosition || '0 0.05 0');
  const rot = isAr ? (asset?.arRotation || '90 0 0') : (asset?.simRotation || '0 0 0');
  const scl = isAr ? (asset?.arScale || '0.5 0.5 0.5') : (asset?.simScale || '0.5 0.5 0.5');

  const wrapper = document.createElement('a-entity');
  wrapper.setAttribute('position', pos);
  wrapper.setAttribute('rotation', rot);

  if (asset && asset.hasCustomModel && asset.modelUrl) {
    const gltfEntity = document.createElement('a-entity');
    gltfEntity.dataset.markerId = asset.id;
    gltfEntity.classList.add('hologram-spin-target');
    gltfEntity.setAttribute('gltf-model', `url(${asset.modelUrl})`);
    gltfEntity.setAttribute('gltf-clips', '');
    gltfEntity.setAttribute('scale', scl);

    if (asset.autoSpin !== false) {
      gltfEntity.setAttribute(
        'animation',
        'property: rotation; to: 0 360 0; loop: true; dur: 10000; easing: linear'
      );
    }

    gltfEntity.addEventListener('model-error', () => {
      console.warn(`[PAG-IWAG AR] Failed to decode ${asset.modelUrl}, using procedural hologram.`);
      wrapper.innerHTML = '';
      const fallback = buildProceduralFallback(asset.id);
      if (isAr) fallback.setAttribute('scale', scl);
      wrapper.appendChild(fallback);
    });

    wrapper.appendChild(gltfEntity);
    attachFloatingStickers(wrapper, asset?.floatingStickers);
    return wrapper;
  }

  const fallback = buildProceduralFallback(asset ? asset.id : 'pagtanow');
  if (isAr) {
    fallback.setAttribute('scale', scl);
  }
  wrapper.appendChild(fallback);
  return wrapper;
}
