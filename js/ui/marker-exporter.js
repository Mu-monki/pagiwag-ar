/**
 * Printable Sticker Marker Kit Modal & 2x2 Sheet PNG Generator
 */

import { STICKER_MARKERS } from '../config/activities-data.js';
import { audioFX } from '../core/audio-fx.js';

function triggerDownload(dataUrl, filename) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function renderKitModalGrid(gridEl, compiledAssets) {
  gridEl.innerHTML = '';

  STICKER_MARKERS.forEach((sticker) => {
    const asset = compiledAssets[sticker.id];
    if (!asset) return;

    const card = document.createElement('div');
    card.className = 'kit-item';
    card.innerHTML = `
      <img src="${asset.previewDataUrl}" alt="${sticker.name} AR Marker" />
      <h3>${sticker.shortLabel}</h3>
      <button class="btn btn-outline" data-dl-id="${sticker.id}">
        ⬇️ Download PNG
      </button>
    `;

    card.querySelector('[data-dl-id]').addEventListener('click', () => {
      audioFX.playActionTap();
      triggerDownload(asset.previewDataUrl, `PAG-IWAG-AR-Marker-${sticker.id}.png`);
    });

    gridEl.appendChild(card);
  });
}

export function downloadPrintableSheet(compiledAssets) {
  const sheet = document.createElement('canvas');
  sheet.width = 1240;
  sheet.height = 1420;
  const ctx = sheet.getContext('2d');

  // Cream editorial sheet background
  ctx.fillStyle = '#F7F4EB';
  ctx.fillRect(0, 0, sheet.width, sheet.height);

  // Header
  ctx.fillStyle = '#0D254C';
  ctx.fillRect(40, 36, sheet.width - 80, 110);
  ctx.fillStyle = '#FFD147';
  ctx.font = 'bold 42px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PAG-IWAG 2026 — AR STICKER MARKER SHEET', sheet.width / 2, 92);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '20px sans-serif';
  ctx.fillText(
    'UP NCPAG GRIT Labs • Scan any sticker below in PAG-IWAG AR',
    sheet.width / 2,
    126
  );

  // 2x2 Grid of calibrated markers
  const positions = [
    { x: 90, y: 190 },
    { x: 640, y: 190 },
    { x: 90, y: 780 },
    { x: 640, y: 780 },
  ];

  STICKER_MARKERS.forEach((sticker, idx) => {
    const asset = compiledAssets[sticker.id];
    const pos = positions[idx];
    if (!asset || !pos) return;

    ctx.drawImage(asset.canvas, pos.x, pos.y, 500, 500);

    ctx.fillStyle = '#0D254C';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(sticker.name, pos.x + 250, pos.y + 532);
  });

  audioFX.playPositiveScore();
  triggerDownload(
    sheet.toDataURL('image/png'),
    'PAG-IWAG-2026-Printable-AR-Sticker-Sheet.png'
  );
}
