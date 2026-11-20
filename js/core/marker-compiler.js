/**
 * PAG-IWAG MindAR Target Bundle & 3D Model Preloader
 *
 * 1. Verifies the compiled MindAR target bundle (`marker_patterns/stickers.mind`)
 * 2. Resolves absolute URLs for MindAR so nested deployment paths work cleanly
 * 3. Loads teammates' borderless sticker PNGs (or renders borderless circular badges)
 * 4. Verifies teammates' .glb/.gltf 3D models in `output_models/`
 */

import { MINDAR_CONFIG, STICKER_MARKERS } from '../config/activities-data.js';

const CANVAS_SIZE = 512;

/**
 * Generates a borderless sticker preview illustration when a teammate's PNG
 * has not been placed into marker_patterns/ yet.
 */
export function renderBorderlessFallbackCanvas(stickerId) {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  const cx = CANVAS_SIZE / 2;
  const cy = CANVAS_SIZE / 2;
  const radius = CANVAS_SIZE * 0.45;

  // Die-cut navy & cream circular sticker aesthetic (no square AR borders)
  ctx.fillStyle = '#0D254C';
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#F7F4EB';
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 22, 0, Math.PI * 2);
  ctx.clip();

  if (stickerId === 'pagtanow') {
    ctx.fillStyle = '#2B7A78';
    ctx.beginPath();
    ctx.arc(cx, cy + 16, 135, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFD147';
    ctx.beginPath();
    ctx.arc(cx, cy - 10, 90, Math.PI, 0);
    ctx.fill();

    ctx.fillStyle = '#1B4988';
    ctx.beginPath();
    ctx.arc(cx, cy + 28, 96, 0, Math.PI);
    ctx.fill();

    ctx.fillStyle = '#0D254C';
    ctx.fillRect(70, 96, CANVAS_SIZE - 140, 56);
    ctx.fillStyle = '#FFD147';
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PagtaNOW', cx, 134);
  } else if (stickerId === 'talampad') {
    ctx.strokeStyle = '#D63629';
    ctx.lineWidth = 42;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(120, 385);
    ctx.bezierCurveTo(395, 340, 115, 215, 380, 175);
    ctx.stroke();

    ctx.fillStyle = '#F6A821';
    ctx.beginPath();
    ctx.arc(cx, cy + 20, 68, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1B4988';
    ctx.fillRect(70, 96, CANVAS_SIZE - 140, 56);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TALAMPAD', cx, 134);
  } else if (stickerId === 'gameon') {
    ctx.fillStyle = '#1B4988';
    ctx.fillRect(105, 175, 302, 200);

    const tile = 68;
    const colors = ['#F6A821', '#2B7A78', '#D63629', '#FFD147'];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        ctx.fillStyle = colors[(r + c) % colors.length];
        ctx.fillRect(120 + c * tile, 188 + r * 62, tile - 8, 54);
      }
    }

    ctx.fillStyle = '#D63629';
    ctx.fillRect(70, 96, CANVAS_SIZE - 140, 56);
    ctx.fillStyle = '#FFD147';
    ctx.font = 'bold 31px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('G oVRnance', cx, 134);
  } else {
    ctx.fillStyle = '#F6A821';
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(cx, cy + 16);
      ctx.arc(cx, cy + 16, 155, angle, angle + 0.24);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = '#D63629';
    ctx.beginPath();
    ctx.arc(cx, cy + 4, 72, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0D254C';
    ctx.fillRect(cx - 56, cy + 72, 112, 92);

    ctx.fillStyle = '#0D254C';
    ctx.fillRect(70, 96, CANVAS_SIZE - 140, 56);
    ctx.fillStyle = '#F6A821';
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PAG-IWAG', cx, 134);
  }

  ctx.restore();
  return canvas;
}

/**
 * Checks whether a binary file (.mind or .glb) exists and is not an HTML 404 page
 */
async function checkBinaryAssetExists(url) {
  if (!url) return false;
  try {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) return false;
    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    if (contentType.includes('text/html')) return false;
    const buf = await res.arrayBuffer();
    return buf.byteLength > 32;
  } catch {
    return false;
  }
}

/**
 * Loads a teammate's borderless sticker PNG onto a 512x512 canvas
 */
function tryLoadStickerImage(imageUrl) {
  if (!imageUrl) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = CANVAS_SIZE;
      canvas.height = CANVAS_SIZE;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      const scale = Math.min(CANVAS_SIZE / img.width, CANVAS_SIZE / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (CANVAS_SIZE - w) / 2, (CANVAS_SIZE - h) / 2, w, h);
      resolve(canvas);
    };
    img.onerror = () => resolve(null);
    img.src = imageUrl;
  });
}

/**
 * Pre-validates stickers.mind, sticker artwork, and 3D models
 */
export async function compileAllStickerAssets(onProgress) {
  const resolvedMindUrl = new URL(MINDAR_CONFIG.targetSrc, window.location.href).href;
  const hasMindBundle = await checkBinaryAssetExists(resolvedMindUrl);

  const items = {};

  for (let i = 0; i < STICKER_MARKERS.length; i++) {
    const sticker = STICKER_MARKERS[i];

    // 1. Load borderless sticker PNG (or render borderless circular badge fallback)
    const customCanvas = await tryLoadStickerImage(sticker.stickerImageUrl);
    const activeCanvas = customCanvas || renderBorderlessFallbackCanvas(sticker.id);
    const previewDataUrl = activeCanvas.toDataURL('image/png');

    // 2. Verify teammate's 3D .glb model in output_models/
    const hasCustomModel = await checkBinaryAssetExists(sticker.modelUrl);

    items[sticker.id] = {
      ...sticker,
      canvas: activeCanvas,
      previewDataUrl,
      hasMindBundle,
      hasCustomArtwork: Boolean(customCanvas),
      hasCustomModel,
    };

    if (typeof onProgress === 'function') {
      onProgress(items[sticker.id], i + 1, STICKER_MARKERS.length);
    }

    await new Promise((resolve) => setTimeout(resolve, 60));
  }

  return {
    hasMindBundle,
    resolvedMindUrl,
    maxTrack: MINDAR_CONFIG.maxTrack || 2,
    items,
  };
}
