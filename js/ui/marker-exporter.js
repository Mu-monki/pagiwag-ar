/**
 * Borderless Sticker Kit Modal & Printable Sheet PNG Generator
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

export function renderKitModalGrid(gridEl, compiledItems) {
  gridEl.innerHTML = '';

  STICKER_MARKERS.forEach((sticker) => {
    const asset = compiledItems[sticker.id];
    if (!asset) return;

    const card = document.createElement('div');
    card.className = 'kit-item';
    card.innerHTML = `
      <img src="${asset.previewDataUrl}" alt="${sticker.name} AR Sticker" />
      <h3>${sticker.shortLabel}</h3>
      <button class="btn btn-outline" data-dl-id="${sticker.id}">
        <i class="fa-solid fa-download"></i> Download PNG
      </button>
    `;

    card.querySelector('[data-dl-id]').addEventListener('click', () => {
      audioFX.playActionTap();
      triggerDownload(asset.previewDataUrl, `PAG-IWAG-Sticker-${sticker.id}.png`);
    });

    gridEl.appendChild(card);
  });
}

export function downloadPrintableSheet(compiledItems) {
  const rows = Math.max(1, Math.ceil(STICKER_MARKERS.length / 2));
  const sheet = document.createElement('canvas');
  sheet.width = 1240;
  sheet.height = 220 + rows * 590;
  const ctx = sheet.getContext('2d');

  ctx.fillStyle = '#F7F4EB';
  ctx.fillRect(0, 0, sheet.width, sheet.height);

  ctx.fillStyle = '#0D254C';
  ctx.fillRect(40, 36, sheet.width - 80, 110);
  ctx.fillStyle = '#FFD147';
  ctx.font = 'bold 42px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PAG-IWAG 2026 — AR-Supported STICKER SHEET', sheet.width / 2, 92);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '20px sans-serif';
  ctx.fillText(
    'UP NCPAG GRIT Labs • MindAR Image Tracking — No Black Borders Required',
    sheet.width / 2,
    126
  );

  STICKER_MARKERS.forEach((sticker, idx) => {
    const asset = compiledItems[sticker.id];
    if (!asset) return;

    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = col === 0 ? 90 : 640;
    const y = 190 + row * 590;

    ctx.drawImage(asset.canvas, x, y, 500, 500);

    ctx.fillStyle = '#0D254C';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(sticker.name, x + 250, y + 532);
  });

  audioFX.playPositiveScore();
  triggerDownload(
    sheet.toDataURL('image/png'),
    'PAG-IWAG-2026-Borderless-MindAR-Sticker-Sheet.png'
  );
}
