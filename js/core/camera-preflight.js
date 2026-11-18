/**
 * Non-Destructive Camera Environment Check
 * Avoids opening/closing a temporary MediaStream before AR.js claims the camera
 * (which causes hardware lock race conditions on Android Chrome & iOS Safari).
 */

export function checkCameraEnvironment() {
  if (!window.isSecureContext && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    return {
      supported: false,
      reason: 'Camera access requires HTTPS — switched to Interactive 3D Simulator.',
    };
  }

  if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
    return {
      supported: false,
      reason: 'Camera API unavailable in this browser — switched to Interactive 3D Simulator.',
    };
  }

  return { supported: true, reason: null };
}
