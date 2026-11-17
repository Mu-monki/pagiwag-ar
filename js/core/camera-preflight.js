/**
 * Camera Pre-Flight Check & Safe Fallback Handler
 * Probes navigator.mediaDevices.getUserMedia with a strict timeout before mounting AR.js.
 */

export async function runCameraPreflight(timeoutMs = 4000) {
  if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
    return {
      supported: false,
      reason: 'Camera API unavailable in this browser context — switching to 3D Sticker Simulator.',
    };
  }

  const probePromise = navigator.mediaDevices
    .getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
      audio: false,
    })
    .then((stream) => {
      // Immediately release probe stream so AR.js can claim the hardware camera cleanly
      stream.getTracks().forEach((track) => track.stop());
      return { supported: true, reason: null };
    })
    .catch((err) => {
      const name = err && err.name ? err.name : 'CameraError';
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        return {
          supported: false,
          reason: 'Camera permission blocked or sandboxed — launched Interactive 3D Simulator instead.',
        };
      }
      if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        return {
          supported: false,
          reason: 'No camera hardware detected — launched Interactive 3D Simulator instead.',
        };
      }
      return {
        supported: false,
        reason: `Camera unavailable (${name}) — running Interactive 3D Simulator.`,
      };
    });

  const timeoutPromise = new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          supported: false,
          reason: 'Camera initialization timed out — switched to Interactive 3D Simulator.',
        }),
      timeoutMs
    )
  );

  return Promise.race([probePromise, timeoutPromise]);
}
