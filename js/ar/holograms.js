/**
 * 3D Model (.glb/.gltf) & Procedural Hologram Builders for PAG-IWAG MindAR Stickers
 *
 * Supports two coordinate modes:
 * - mode === 'ar': Centered MindAR image target coordinates (`arPosition`, `arScale`, `arRotation`),
 *   where +Z extends outward from the sticker toward the viewer.
 * - mode === 'sim': Normalized tabletop 3D Simulator coordinates (`simPosition`, `simScale`, `simRotation`),
 *   where +Y extends upward from the table.
 */
import { audioFX } from '../core/audio-fx.js';

if (typeof AFRAME !== 'undefined' && !AFRAME.components['gltf-clips']) {
  AFRAME.registerComponent('gltf-clips', {
    init() {
      this.mixer = null;
      this.clips = [];
      this.actions = [];
      this.activeIndex = 0; // -1 = all tracks, >= 0 = single track index
      this.clipsPlaying = true;
      this.audioEl = null;
      this.currentAudioSrc = null;
      this.isTargetActive = this.el.dataset.targetActive !== 'false';
      this.retryUnlockHandler = null;

      this.unsubscribeMute = audioFX.onMuteChange((muted) => {
        if (this.audioEl) {
          this.audioEl.muted = muted;
        }
      });

      this.el.addEventListener('model-loaded', (e) => {
        const model = e.detail?.model;
        if (!model || !Array.isArray(model.animations) || model.animations.length === 0) return;

        const cfg = this.el._audioConfig || {};
        const startIdx =
          typeof cfg.defaultClipIndex === 'number' ? cfg.defaultClipIndex : 0;

        this.clips = model.animations;
        this.mixer = new THREE.AnimationMixer(model);
        this.actions = this.clips.map((clip) => this.mixer.clipAction(clip));
        this.playClip(startIdx, { autoplayAudio: this.isTargetActive });

        window.dispatchEvent(new CustomEvent('gltf-clips-loaded'));
      });
    },

    getTrackNames() {
      return this.clips.map((c, idx) => c.name || `Track ${idx + 1}`);
    },

    resolveAudioSrc(index) {
      const cfg = this.el._audioConfig || {};
      const trackSounds = cfg.trackSounds || {};

      // 1. Direct index match (0 -> line1.mp3, 1 -> line2.mp3, 2 -> line3.mp3)
      if (trackSounds[index] !== undefined && trackSounds[index] !== null) {
        return trackSounds[index];
      }
      const strIdx = String(index);
      if (trackSounds[strIdx] !== undefined && trackSounds[strIdx] !== null) {
        return trackSounds[strIdx];
      }

      // 2. Fallback match by animation clip name (e.g. 'quote1', 'quote2', 'quote3')
      if (index >= 0 && this.clips[index]) {
        const rawName = (this.clips[index].name || '').trim();
        if (rawName && trackSounds[rawName]) return trackSounds[rawName];
        const normalized = rawName.toLowerCase().replace(/\s+/g, '');
        for (const [key, val] of Object.entries(trackSounds)) {
          if (key.toLowerCase().replace(/\s+/g, '') === normalized) {
            return val;
          }
        }
      }

      // 3. Optional single-model fallback audio
      return cfg.soundUrl || null;
    },

    clearRetryUnlock() {
      if (this.retryUnlockHandler) {
        window.removeEventListener('pointerdown', this.retryUnlockHandler);
        this.retryUnlockHandler = null;
      }
    },

    stopAudio() {
      this.clearRetryUnlock();
      if (this.audioEl) {
        try {
          this.audioEl.pause();
          this.audioEl.currentTime = 0;
          this.audioEl.src = '';
        } catch {
          // Ignore audio teardown errors
        }
        this.audioEl = null;
        this.currentAudioSrc = null;
      }
    },

    playAudioForClip(index, { restart = true } = {}) {
      const src = this.resolveAudioSrc(index);
      if (!src) {
        this.stopAudio();
        return;
      }

      const cfg = this.el._audioConfig || {};
      const shouldLoop = cfg.soundLoop !== false;

      if (!this.audioEl || this.currentAudioSrc !== src) {
        this.stopAudio();
        this.audioEl = new Audio(src);
        this.audioEl.preload = 'auto';
        this.currentAudioSrc = src;
      }

      this.audioEl.loop = shouldLoop;
      this.audioEl.muted = audioFX.muted;

      if (restart) {
        try {
          this.audioEl.currentTime = 0;
        } catch {
          // Ignore seek before metadata ready
        }
      }

      const attemptPlay = () => {
        if (!this.audioEl || !this.clipsPlaying || !this.isTargetActive) return;
        const p = this.audioEl.play();
        if (p && typeof p.catch === 'function') {
          p.catch(() => {
            if (this.retryUnlockHandler) return;
            this.retryUnlockHandler = () => {
              this.clearRetryUnlock();
              attemptPlay();
            };
            window.addEventListener('pointerdown', this.retryUnlockHandler, { once: true });
          });
        }
      };

      attemptPlay();
    },

    playClip(index, { autoplayAudio = true } = {}) {
      if (!this.mixer || this.actions.length === 0) return;
      this.activeIndex = index;
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

      if (autoplayAudio && this.isTargetActive) {
        this.playAudioForClip(index, { restart: true });
      } else {
        this.stopAudio();
      }
    },

    togglePlayPause() {
      if (!this.mixer || this.actions.length === 0) return false;
      this.clipsPlaying = !this.clipsPlaying;

      this.actions.forEach((action, idx) => {
        if (this.activeIndex === -1 || idx === this.activeIndex) {
          action.paused = !this.clipsPlaying;
        }
      });

      if (this.clipsPlaying && this.isTargetActive) {
        if (this.audioEl) {
          this.audioEl.muted = audioFX.muted;
          this.audioEl.play().catch(() => {});
        } else {
          this.playAudioForClip(this.activeIndex, { restart: false });
        }
      } else if (this.audioEl) {
        this.audioEl.pause();
      }

      return this.clipsPlaying;
    },

    onTargetFound() {
      this.isTargetActive = true;
      this.el.dataset.targetActive = 'true';
      if (this.mixer && this.actions.length > 0) {
        this.playClip(this.activeIndex, { autoplayAudio: true });
      }
    },

    onTargetLost() {
      this.isTargetActive = false;
      this.el.dataset.targetActive = 'false';
      this.stopAudio();
    },

    tick(time, timeDelta) {
      if (this.mixer && this.clipsPlaying) this.mixer.update(timeDelta / 1000);
    },

    remove() {
      this.stopAudio();
      if (typeof this.unsubscribeMute === 'function') {
        this.unsubscribeMute();
        this.unsubscribeMute = null;
      }
      if (this.mixer) {
        this.mixer.stopAllAction();
        this.mixer = null;
      }
    },
  });
}

  function createStarFlareTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const c = size / 2;

  // Soft outer radial halo
  const halo = ctx.createRadialGradient(c, c, 2, c, c, c);
  halo.addColorStop(0, 'rgba(255, 255, 255, 1)');
  halo.addColorStop(0.22, 'rgba(255, 232, 150, 0.9)');
  halo.addColorStop(0.55, 'rgba(246, 168, 33, 0.25)');
  halo.addColorStop(1, 'rgba(246, 168, 33, 0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, size, size);

  // Crisp 4-point star flare
  ctx.fillStyle = '#FFFFFF';
  for (let i = 0; i < 2; i++) {
    ctx.save();
    ctx.translate(c, c);
    ctx.rotate((i * Math.PI) / 2);
    ctx.beginPath();
    ctx.moveTo(0, -c * 0.92);
    ctx.quadraticCurveTo(5, -5, c * 0.92, 0);
    ctx.quadraticCurveTo(5, 5, 0, c * 0.92);
    ctx.quadraticCurveTo(-5, 5, -c * 0.92, 0);
    ctx.quadraticCurveTo(-5, -5, 0, -c * 0.92);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  if ('SRGBColorSpace' in THREE) {
    texture.colorSpace = THREE.SRGBColorSpace;
  }
  return texture;
}

if (typeof AFRAME !== 'undefined' && !AFRAME.components['floating-constellations']) {
  AFRAME.registerComponent('floating-constellations', {
    schema: {
      starColor: { type: 'color', default: '#FFD147' },
      secondaryColor: { type: 'color', default: '#FFF6CC' },
      lineColor: { type: 'color', default: '#93C5FD' },
      radius: { type: 'number', default: 0.66 },
      orbitSpeed: { type: 'number', default: 0.22 },
    },

    init() {
      this.starTexture = createStarFlareTexture();
      this.sharedOctaGeo = new THREE.OctahedronGeometry(1, 0);
      this.clusters = [];
      this.twinklers = [];
      this.disposables = [this.sharedOctaGeo, this.starTexture];

      this.rootGroup = new THREE.Group();

      // 4 distinct constellation patterns orbiting the central model
      const templates = [
        // 1. Scales / Balance (TALAMPAD)
        {
          pts: [
            [-0.16, 0.08, 0.0],
            [0.0, 0.14, 0.02],
            [0.16, 0.08, 0.0],
            [0.0, -0.04, 0.02],
            [-0.14, -0.1, -0.02],
            [0.14, -0.1, -0.02],
          ],
          edges: [
            [0, 1],
            [1, 2],
            [1, 3],
            [0, 4],
            [2, 5],
          ],
          baseY: 0.62,
        },
        // 2. Crown / Compass
        {
          pts: [
            [0.0, 0.17, 0.0],
            [-0.12, 0.04, 0.03],
            [0.12, 0.04, -0.03],
            [-0.08, -0.12, 0.02],
            [0.08, -0.12, -0.02],
          ],
          edges: [
            [0, 1],
            [0, 2],
            [1, 2],
            [1, 3],
            [2, 4],
            [3, 4],
          ],
          baseY: 0.48,
        },
        // 3. Southern Cross / Torch
        {
          pts: [
            [0.0, 0.18, 0.0],
            [0.0, -0.16, 0.0],
            [-0.13, 0.03, 0.02],
            [0.13, 0.03, -0.02],
            [0.09, -0.08, 0.04],
          ],
          edges: [
            [0, 1],
            [2, 3],
            [3, 4],
          ],
          baseY: 0.68,
        },
        // 4. Dipper / Arc
        {
          pts: [
            [-0.18, 0.1, 0.02],
            [-0.07, 0.06, 0.0],
            [0.03, 0.01, -0.02],
            [0.05, -0.1, 0.02],
            [0.17, -0.12, 0.0],
            [0.18, 0.0, -0.02],
          ],
          edges: [
            [0, 1],
            [1, 2],
            [2, 3],
            [3, 4],
            [4, 5],
            [5, 2],
          ],
          baseY: 0.52,
        },
      ];

      templates.forEach((tpl, idx) => {
        const angle = (idx / templates.length) * Math.PI * 2;
        const clusterGroup = new THREE.Group();
        clusterGroup.position.set(
          Math.cos(angle) * this.data.radius,
          tpl.baseY,
          Math.sin(angle) * this.data.radius
        );
        // Face each constellation outward around the ring
        clusterGroup.rotation.y = -angle + Math.PI / 2;

        // Constellation connecting lines
        const lineVertices = [];
        tpl.edges.forEach(([a, b]) => {
          lineVertices.push(...tpl.pts[a], ...tpl.pts[b]);
        });
        const lineGeo = new THREE.BufferGeometry();
        lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(lineVertices, 3));
        const lineMat = new THREE.LineBasicMaterial({
          color: this.data.lineColor,
          transparent: true,
          opacity: 0.58,
          depthWrite: false,
        });
        const lines = new THREE.LineSegments(lineGeo, lineMat);
        clusterGroup.add(lines);
        this.disposables.push(lineGeo, lineMat);

        // Star nodes
        tpl.pts.forEach(([x, y, z], starIdx) => {
          const isPrimary = starIdx % 2 === 0;
          const color = isPrimary ? this.data.starColor : this.data.secondaryColor;
          const baseCoreScale = isPrimary ? 0.018 : 0.013;
          const baseSpriteScale = isPrimary ? 0.1 : 0.075;

          const coreMat = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.95,
          });
          const core = new THREE.Mesh(this.sharedOctaGeo, coreMat);
          core.position.set(x, y, z);
          core.scale.setScalar(baseCoreScale);
          clusterGroup.add(core);

          const spriteMat = new THREE.SpriteMaterial({
            map: this.starTexture,
            color,
            transparent: true,
            opacity: 0.9,
            depthWrite: false,
          });
          const sprite = new THREE.Sprite(spriteMat);
          sprite.position.set(x, y, z);
          sprite.scale.set(baseSpriteScale, baseSpriteScale, 1);
          clusterGroup.add(sprite);

          this.disposables.push(coreMat, spriteMat);
          this.twinklers.push({
            core,
            sprite,
            coreMat,
            spriteMat,
            baseCoreScale,
            baseSpriteScale,
            phase: idx * 1.7 + starIdx * 1.15,
            speed: 2.2 + ((idx + starIdx) % 4) * 0.75,
          });
        });

        this.rootGroup.add(clusterGroup);
        this.clusters.push({
          group: clusterGroup,
          lineMat,
          baseY: tpl.baseY,
          phase: idx * 1.4,
        });
      });

      // Ambient scattered twinkling micro-stars between constellations
      const ambientCount = 16;
      for (let i = 0; i < ambientCount; i++) {
        const angle = (i / ambientCount) * Math.PI * 2 + 0.25;
        const r = this.data.radius * (0.72 + (i % 3) * 0.18);
        const y = 0.24 + ((i * 37) % 10) * 0.072;
        const baseSpriteScale = 0.042 + (i % 3) * 0.014;

        const spriteMat = new THREE.SpriteMaterial({
          map: this.starTexture,
          color: i % 2 === 0 ? this.data.secondaryColor : this.data.starColor,
          transparent: true,
          opacity: 0.8,
          depthWrite: false,
        });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.position.set(Math.cos(angle) * r, y, Math.sin(angle) * r);
        sprite.scale.set(baseSpriteScale, baseSpriteScale, 1);
        this.rootGroup.add(sprite);

        this.disposables.push(spriteMat);
        this.twinklers.push({
          core: null,
          sprite,
          coreMat: null,
          spriteMat,
          baseCoreScale: 0,
          baseSpriteScale,
          phase: i * 0.9,
          speed: 2.8 + (i % 5) * 0.65,
        });
      }

      this.el.setObject3D('constellations', this.rootGroup);
    },

    tick(time, timeDelta) {
      if (!this.rootGroup) return;
      const dt = Math.min((timeDelta || 16) / 1000, 0.1);
      const t = (time || 0) / 1000;

      // Orbit the constellation field gently around the 3D model
      this.rootGroup.rotation.y += dt * this.data.orbitSpeed;

      // Gentle vertical float + line shimmer per constellation
      for (let i = 0; i < this.clusters.length; i++) {
        const c = this.clusters[i];
        c.group.position.y = c.baseY + Math.sin(t * 1.35 + c.phase) * 0.035;
        c.lineMat.opacity = 0.42 + 0.22 * (0.5 + 0.5 * Math.sin(t * 1.8 + c.phase));
      }

      // Independent twinkling for each star & flare
      for (let i = 0; i < this.twinklers.length; i++) {
        const s = this.twinklers[i];
        const pulse = 0.5 + 0.5 * Math.sin(t * s.speed + s.phase);
        const twinkleScale = 0.55 + 0.65 * pulse;

        s.sprite.scale.set(
          s.baseSpriteScale * twinkleScale,
          s.baseSpriteScale * twinkleScale,
          1
        );
        s.spriteMat.opacity = 0.35 + 0.65 * pulse;

        if (s.core && s.coreMat) {
          s.core.scale.setScalar(s.baseCoreScale * (0.7 + 0.5 * pulse));
          s.core.rotation.y += dt * 1.6;
          s.coreMat.opacity = 0.55 + 0.45 * pulse;
        }
      }
    },

    remove() {
      this.el.removeObject3D('constellations');
      this.disposables.forEach((item) => {
        if (item && typeof item.dispose === 'function') {
          item.dispose();
        }
      });
      this.disposables = [];
      this.clusters = [];
      this.twinklers = [];
      this.rootGroup = null;
    },
  });
}


if (typeof AFRAME !== 'undefined' && !AFRAME.components['floating-matrix']) {
  AFRAME.registerComponent('floating-matrix', {
    schema: {
      color: { type: 'color', default: '#00FF66' },
      headColor: { type: 'color', default: '#E2FFE8' },
      radius: { type: 'number', default: 0.62 },
      height: { type: 'number', default: 0.95 },
      columnCount: { type: 'int', default: 24 },
      speed: { type: 'number', default: 1.0 },
      orbitSpeed: { type: 'number', default: 0.12 },
    },

    init() {
      this.texCols = 16;
      this.rows = 22;
      this.canvasWidth = 512;
      this.canvasHeight = 512;
      this.redrawTimer = 0;
      this.disposables = [];

      this.charset =
        '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF<>{}[]*+';

      // Offscreen canvas for animated Matrix digital rain columns
      this.canvas = document.createElement('canvas');
      this.canvas.width = this.canvasWidth;
      this.canvas.height = this.canvasHeight;
      this.ctx = this.canvas.getContext('2d');

      // Initialize independent rain tracks across the texture columns
      this.tracks = Array.from({ length: this.texCols }, (_, idx) => ({
        headRow: Math.random() * (this.rows + 10),
        speed: 6.0 + (idx % 5) * 1.45 + Math.random() * 2.0,
        trail: 7 + (idx % 6) + Math.floor(Math.random() * 3),
        chars: Array.from({ length: this.rows }, () => this.randomGlyph()),
      }));

      this.texture = new THREE.CanvasTexture(this.canvas);
      if ('SRGBColorSpace' in THREE) {
        this.texture.colorSpace = THREE.SRGBColorSpace;
      }
      this.texture.minFilter = THREE.LinearFilter;
      this.texture.magFilter = THREE.LinearFilter;
      this.disposables.push(this.texture);

      this.material = new THREE.MeshBasicMaterial({
        map: this.texture,
        transparent: true,
        opacity: 0.92,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      this.disposables.push(this.material);

      this.rootGroup = new THREE.Group();

      const count = Math.max(8, this.data.columnCount);
      const stripWidth = 0.11;
      const uPad = 0.002;

      for (let i = 0; i < count; i++) {
        const colIdx = i % this.texCols;
        const angle = (i / count) * Math.PI * 2 + (i % 2) * 0.14;
        const layerRadius = this.data.radius * (i % 2 === 0 ? 0.88 : 1.1);
        const centerY = 0.08 + this.data.height * 0.5 + (i % 3) * 0.04;

        const geo = new THREE.PlaneGeometry(stripWidth, this.data.height);
        const uvAttr = geo.attributes.uv;
        const u0 = colIdx / this.texCols + uPad;
        const u1 = (colIdx + 1) / this.texCols - uPad;

        for (let v = 0; v < uvAttr.count; v++) {
          uvAttr.setX(v, uvAttr.getX(v) < 0.5 ? u0 : u1);
        }
        uvAttr.needsUpdate = true;

        const strip = new THREE.Mesh(geo, this.material);
        strip.position.set(
          Math.cos(angle) * layerRadius,
          centerY,
          Math.sin(angle) * layerRadius
        );
        strip.rotation.y = -angle + Math.PI / 2;

        this.rootGroup.add(strip);
        this.disposables.push(geo);
      }

      this.drawCanvas();
      this.texture.needsUpdate = true;

      this.el.setObject3D('matrix', this.rootGroup);
    },

    randomGlyph() {
      return this.charset[Math.floor(Math.random() * this.charset.length)];
    },

    drawCanvas() {
      const ctx = this.ctx;
      if (!ctx) return;

      const colW = this.canvasWidth / this.texCols;
      const rowH = this.canvasHeight / this.rows;
      const baseColor = new THREE.Color(this.data.color);
      const rCol = Math.round(baseColor.r * 255);
      const gCol = Math.round(baseColor.g * 255);
      const bCol = Math.round(baseColor.b * 255);

      ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      ctx.font = `700 ${Math.floor(rowH * 0.82)}px "Space Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let c = 0; c < this.texCols; c++) {
        const track = this.tracks[c];
        const headIdx = Math.floor(track.headRow);
        const x = c * colW + colW * 0.5;

        for (let r = 0; r < this.rows; r++) {
          const dist = headIdx - r;
          if (dist < 0 || dist >= track.trail) continue;

          // Subtle random glyph shimmer inside active trails
          if (Math.random() < 0.08) {
            track.chars[r] = this.randomGlyph();
          }

          const y = r * rowH + rowH * 0.5;

          if (dist === 0) {
            ctx.shadowColor = this.data.color;
            ctx.shadowBlur = 10;
            ctx.fillStyle = this.data.headColor;
          } else {
            ctx.shadowBlur = 0;
            const alpha = Math.pow(1 - dist / track.trail, 1.45) * 0.92;
            ctx.fillStyle = `rgba(${rCol}, ${gCol}, ${bCol}, ${alpha.toFixed(3)})`;
          }

          ctx.fillText(track.chars[r], x, y);
        }
      }

      ctx.shadowBlur = 0;
    },

    tick(time, timeDelta) {
      if (!this.rootGroup) return;
      const dt = Math.min((timeDelta || 16) / 1000, 0.1);

      // Gentle cylindrical orbit around the central model
      this.rootGroup.rotation.y += dt * this.data.orbitSpeed;

      // Advance each rain column
      for (let c = 0; c < this.texCols; c++) {
        const track = this.tracks[c];
        track.headRow += dt * track.speed * this.data.speed;
        if (track.headRow - track.trail > this.rows) {
          track.headRow = -Math.random() * 4;
        }
      }

      // Throttle canvas redraws (~18 FPS) for smooth mobile AR performance
      this.redrawTimer += dt;
      if (this.redrawTimer >= 0.055) {
        this.redrawTimer = 0;
        this.drawCanvas();
        this.texture.needsUpdate = true;
      }
    },

    remove() {
      this.el.removeObject3D('matrix');
      this.disposables.forEach((item) => {
        if (item && typeof item.dispose === 'function') {
          item.dispose();
        }
      });
      this.disposables = [];
      this.tracks = [];
      this.rootGroup = null;
      this.ctx = null;
      this.canvas = null;
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


function attachFloatingMatrix(wrapper, config) {
  if (!config) return;

  const matrixEl = document.createElement('a-entity');
  if (typeof config === 'object') {
    const attrs = [
      config.color ? `color: ${config.color}` : '',
      config.headColor ? `headColor: ${config.headColor}` : '',
      config.radius !== undefined ? `radius: ${config.radius}` : '',
      config.height !== undefined ? `height: ${config.height}` : '',
      config.columnCount !== undefined ? `columnCount: ${config.columnCount}` : '',
      config.speed !== undefined ? `speed: ${config.speed}` : '',
      config.orbitSpeed !== undefined ? `orbitSpeed: ${config.orbitSpeed}` : '',
    ]
      .filter(Boolean)
      .join('; ');
    matrixEl.setAttribute('floating-matrix', attrs);
  } else {
    matrixEl.setAttribute('floating-matrix', '');
  }

  wrapper.appendChild(matrixEl);
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

function attachFloatingConstellations(wrapper, config) {
  if (!config) return;

  const constellationEl = document.createElement('a-entity');
  if (typeof config === 'object') {
    const attrs = [
      config.starColor ? `starColor: ${config.starColor}` : '',
      config.secondaryColor ? `secondaryColor: ${config.secondaryColor}` : '',
      config.lineColor ? `lineColor: ${config.lineColor}` : '',
      config.radius ? `radius: ${config.radius}` : '',
      config.orbitSpeed ? `orbitSpeed: ${config.orbitSpeed}` : '',
    ]
      .filter(Boolean)
      .join('; ');
    constellationEl.setAttribute('floating-constellations', attrs);
  } else {
    constellationEl.setAttribute('floating-constellations', '');
  }

  wrapper.appendChild(constellationEl);
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
    gltfEntity.dataset.targetActive = isAr ? 'false' : 'true';
    gltfEntity._audioConfig = {
      trackSounds: asset.trackSounds || null,
      soundUrl: asset.soundUrl || null,
      soundLoop: asset.soundLoop !== false,
      defaultClipIndex:
        typeof asset.defaultClipIndex === 'number' ? asset.defaultClipIndex : 0,
      onlyAllTracks: Boolean(asset.onlyAllTracks),
    };
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

    // wrapper.appendChild(gltfEntity);
    // attachFloatingStickers(wrapper, asset?.floatingStickers);
    wrapper.appendChild(gltfEntity);
    attachFloatingStickers(wrapper, asset?.floatingStickers);
    attachFloatingConstellations(wrapper, asset?.floatingConstellations);
    attachFloatingMatrix(wrapper, asset?.floatingMatrix);
    return wrapper;
  }

  const fallback = buildProceduralFallback(asset ? asset.id : 'pagtanow');
  if (isAr) {
    fallback.setAttribute('scale', scl);
  }
  wrapper.appendChild(fallback);
  return wrapper;
}
