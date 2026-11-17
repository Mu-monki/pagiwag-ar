/**
 * Procedural 3D A-Frame / Three.js Hologram Builders for Each PAG-IWAG Sticker
 */

export function buildHologramEntity(markerId) {
  const root = document.createElement('a-entity');
  root.setAttribute('position', '0 0.08 0');

  if (markerId === 'pagtanow') {
    // 1. PagtaNOW: Floating Futures Crystal Globe + Orbiting Foresight Ring
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

    // Inner Golden Core (Community Horizon)
    const core = document.createElement('a-dodecahedron');
    core.setAttribute('radius', '0.2');
    core.setAttribute('position', '0 0.58 0');
    core.setAttribute('color', '#FFD147');
    core.setAttribute(
      'animation',
      'property: position; dir: alternate; dur: 1800; loop: true; to: 0 0.66 0'
    );
    root.appendChild(core);

    // Orbiting Signal Ring
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
    // 2. TALAMPAD: Animated 3D Scales of Justice & Oblation Torch Pillar
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

    // Balance Beam (Interactive tilt target)
    const beamGroup = document.createElement('a-entity');
    beamGroup.setAttribute('id', 'talampad-beam-3d');
    beamGroup.setAttribute('position', '0 0.74 0');

    const beam = document.createElement('a-box');
    beam.setAttribute('width', '0.96');
    beam.setAttribute('height', '0.05');
    beam.setAttribute('depth', '0.06');
    beam.setAttribute('color', '#FFD147');
    beamGroup.appendChild(beam);

    const leftPan = document.createElement('a-cylinder');
    leftPan.setAttribute('radius', '0.16');
    leftPan.setAttribute('height', '0.04');
    leftPan.setAttribute('position', '-0.44 -0.18 0');
    leftPan.setAttribute('color', '#D63629');
    beamGroup.appendChild(leftPan);

    const rightPan = document.createElement('a-cylinder');
    rightPan.setAttribute('radius', '0.16');
    rightPan.setAttribute('height', '0.04');
    rightPan.setAttribute('position', '0.44 -0.18 0');
    rightPan.setAttribute('color', '#2B7A78');
    beamGroup.appendChild(rightPan);

    root.appendChild(beamGroup);
  } else if (markerId === 'gameon') {
    // 3. goVRnance: Rotating 3D Governance Die + Holographic Orbit Ring
    const die = document.createElement('a-box');
    die.setAttribute('id', 'govrnance-die-3d');
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
    // 4. Lingkod Bayani: Illuminated Golden Torch & Rising Sunburst
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
