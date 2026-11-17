/**
 * PAG-IWAG Marker Compiler & Offscreen Sticker Artwork Generator
 * Draws each Capacity Development sticker inside a calibrated AR.js tracking frame
 * and encodes a 16x16 BGR 4-orientation .patt data URI (CSP-safe, zero blob: XHR).
 */

import { STICKER_MARKERS } from '../config/activities-data.js';

const CANVAS_SIZE = 512;
const PATTERN_RATIO = 0.70; // Matches <a-scene arjs="patternRatio: 0.70">
const GRID_SIZE = 16;

/**
 * Draws the custom illustrated sticker art inside the inner safe region of the AR marker.
 */
function drawStickerIllustration(ctx, id, x, y, size) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, size, size);
  ctx.clip();

  // Warm parchment background for every sticker
  ctx.fillStyle = '#F7F4EB';
  ctx.fillRect(x, y, size, size);

  const cx = x + size / 2;
  const cy = y + size / 2;

  if (id === 'pagtanow') {
    // Teal & Gold Futures Crystal Globe motif
    ctx.fillStyle = '#2B7A78';
    ctx.beginPath();
    ctx.arc(cx, cy + 8, size * 0.31, 0, Math.PI * 2);
    ctx.fill();

    // Inner glowing horizon
    ctx.fillStyle = '#FFD147';
    ctx.beginPath();
    ctx.arc(cx, cy - 4, size * 0.21, Math.PI, 0);
    ctx.fill();

    // Stylized green hills inside globe
    ctx.fillStyle = '#1B4988';
    ctx.beginPath();
    ctx.arc(cx, cy + 16, size * 0.23, 0, Math.PI);
    ctx.fill();

    // Pedestal base
    ctx.fillStyle = '#D63629';
    ctx.fillRect(cx - size * 0.18, cy + size * 0.31, size * 0.36, size * 0.08);

    // Top banner bar
    ctx.fillStyle = '#0D254C';
    ctx.fillRect(x + 14, y + 14, size - 28, size * 0.14);
    ctx.fillStyle = '#FFD147';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PagtaNOW', cx, y + 14 + size * 0.10);
  } else if (id === 'talampad') {
    // Winding Coral/Navy Accountability Path + Scales
    ctx.strokeStyle = '#D63629';
    ctx.lineWidth = size * 0.11;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x + size * 0.22, y + size * 0.82);
    ctx.bezierCurveTo(
      x + size * 0.85,
      y + size * 0.72,
      x + size * 0.15,
      y + size * 0.42,
      x + size * 0.78,
      y + size * 0.34
    );
    ctx.stroke();

    // Center gold compass circle
    ctx.fillStyle = '#F6A821';
    ctx.beginPath();
    ctx.arc(cx, cy + 10, size * 0.16, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0D254C';
    ctx.beginPath();
    ctx.moveTo(cx, cy - size * 0.11);
    ctx.lineTo(cx + size * 0.05, cy + 10);
    ctx.lineTo(cx, cy + size * 0.24);
    ctx.lineTo(cx - size * 0.05, cy + 10);
    ctx.closePath();
    ctx.fill();

    // Top Header
    ctx.fillStyle = '#1B4988';
    ctx.fillRect(x + 14, y + 14, size - 28, size * 0.14);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 25px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TALAMPAD', cx, y + 14 + size * 0.10);
  } else if (id === 'gameon') {
    // Civic Board Game Grid + VR & Governance Die
    ctx.fillStyle = '#1B4988';
    ctx.fillRect(x + size * 0.14, y + size * 0.34, size * 0.72, size * 0.48);

    // Checkerboard tiles
    const tile = (size * 0.64) / 4;
    const colors = ['#F6A821', '#2B7A78', '#D63629', '#FFD147'];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        ctx.fillStyle = colors[(r + c) % colors.length];
        ctx.fillRect(
          x + size * 0.18 + c * tile,
          y + size * 0.38 + r * tile,
          tile - 4,
          tile - 4
        );
      }
    }

    // Top Header
    ctx.fillStyle = '#D63629';
    ctx.fillRect(x + 14, y + 14, size - 28, size * 0.14);
    ctx.fillStyle = '#FFD147';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('goVRnance', cx, y + 14 + size * 0.10);
  } else {
    // Kabataan / Oblation Torch & Rising Sunburst
    ctx.fillStyle = '#F6A821';
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(cx, cy + 8);
      ctx.arc(cx, cy + 8, size * 0.36, angle, angle + 0.22);
      ctx.closePath();
      ctx.fill();
    }

    // Flame & Pedestal
    ctx.fillStyle = '#D63629';
    ctx.beginPath();
    ctx.arc(cx, cy + 2, size * 0.17, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0D254C';
    ctx.fillRect(cx - size * 0.14, cy + size * 0.18, size * 0.28, size * 0.22);

    // Top Header
    ctx.fillStyle = '#0D254C';
    ctx.fillRect(x + 14, y + 14, size - 28, size * 0.14);
    ctx.fillStyle = '#F6A821';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LINGKOD BAYANI', cx, y + 14 + size * 0.10);
  }

  // Subtle inner corner accents for strong asymmetric feature detection
  ctx.fillStyle = '#0D254C';
  ctx.fillRect(x + 10, y + size - 26, 16, 16);
  ctx.fillStyle = '#D63629';
  ctx.beginPath();
  ctx.arc(x + size - 18, y + size - 18, 9, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Generates a full 512x512 AR marker canvas with white quiet zone + black tracking frame + sticker art.
 */
export function renderMarkerCanvas(stickerId) {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  // Outer white quiet margin
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // Black AR.js marker square
  const quiet = Math.round(CANVAS_SIZE * 0.06);
  const markerOuter = CANVAS_SIZE - quiet * 2;
  ctx.fillStyle = '#000000';
  ctx.fillRect(quiet, quiet, markerOuter, markerOuter);

  // Inner illustration area matching PATTERN_RATIO
  const innerSize = Math.round(markerOuter * PATTERN_RATIO);
  const innerOffset = Math.round((CANVAS_SIZE - innerSize) / 2);

  drawStickerIllustration(ctx, stickerId, innerOffset, innerOffset, innerSize);

  return {
    canvas,
    innerOffset,
    innerSize,
  };
}

/**
 * Compiles a 16x16 4-orientation BGR .patt string from the inner sticker canvas region.
 */
function encodePattFromCanvas(sourceCanvas, innerOffset, innerSize) {
  const sampleCanvas = document.createElement('canvas');
  sampleCanvas.width = GRID_SIZE;
  sampleCanvas.height = GRID_SIZE;
  const sCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });

  sCtx.drawImage(
    sourceCanvas,
    innerOffset,
    innerOffset,
    innerSize,
    innerSize,
    0,
    0,
    GRID_SIZE,
    GRID_SIZE
  );

  const imgData = sCtx.getImageData(0, 0, GRID_SIZE, GRID_SIZE).data;

  // Extract base 16x16 RGB grid
  const baseGrid = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    const row = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      const idx = (y * GRID_SIZE + x) * 4;
      row.push({
        r: imgData[idx],
        g: imgData[idx + 1],
        b: imgData[idx + 2],
      });
    }
    baseGrid.push(row);
  }

  // Rotate grid 90 degrees counter-clockwise for the 4 ARToolKit orientations
  function rotate90CCW(grid) {
    const out = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE));
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        out[GRID_SIZE - 1 - x][y] = grid[y][x];
      }
    }
    return out;
  }

  const orientations = [baseGrid];
  for (let i = 1; i < 4; i++) {
    orientations.push(rotate90CCW(orientations[i - 1]));
  }

  const blocks = orientations.map((grid) => {
    const channels = ['b', 'g', 'r']; // ARToolKit expects B, then G, then R
    return channels
      .map((ch) =>
        grid
          .map((row) =>
            row.map((px) => String(px[ch]).padStart(3, ' ')).join(' ')
          )
          .join('\n')
      )
      .join('\n');
  });

  return blocks.join('\n\n') + '\n';
}

/**
 * Compiles all 4 PAG-IWAG sticker markers asynchronously, reporting progress to the splash screen.
 */
export async function compileAllStickerAssets(onProgress) {
  const compiledMap = {};

  for (let i = 0; i < STICKER_MARKERS.length; i++) {
    const sticker = STICKER_MARKERS[i];
    const { canvas, innerOffset, innerSize } = renderMarkerCanvas(sticker.id);
    const pattText = encodePattFromCanvas(canvas, innerOffset, innerSize);
    const pattDataUri = 'data:text/plain;charset=utf-8,' + encodeURIComponent(pattText);
    const previewDataUrl = canvas.toDataURL('image/png');

    compiledMap[sticker.id] = {
      ...sticker,
      canvas,
      previewDataUrl,
      pattText,
      pattDataUri,
    };

    if (typeof onProgress === 'function') {
      onProgress(sticker.id, i + 1, STICKER_MARKERS.length);
    }

    // Yield a frame so splash screen animations & progress bar paint smoothly
    await new Promise((resolve) => setTimeout(resolve, 90));
  }

  return compiledMap;
}
