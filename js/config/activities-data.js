/**
 * PAG-IWAG 2026 — MindAR Image Target, 3D Model & Sticker Metadata Registry
 *
 * HOW TO COMPILE & PAIR YOUR TEAMMATES' BORDERLESS STICKERS + 3D MODELS:
 * 1. Open the MindAR Image Target Compiler in your browser:
 *    https://hiukim.github.io/mind-ar-js-doc/tools/compile
 * 2. Drag & drop all borderless sticker PNGs in the exact `targetIndex` order below
 *    (0: pagtanow, 1: talampad, 2: gameon, 3: kabataan, ...), click Start, and download
 *    the single compiled file as:
 *    `marker_patterns/stickers.mind`
 * 3. Place each sticker's borderless artwork in `marker_patterns/<id>.png`
 * 4. Place each teammate's 3D model in `output_models/<id>.glb`
 *
 * COORDINATE SYSTEM NOTES:
 * - MindAR places (0, 0, 0) at the CENTER of each sticker where 1 unit = sticker width
 *   (+X right, +Y up along the sticker, +Z out toward the camera).
 *   `arRotation: '90 0 0'` stands a standard Y-up .glb model upright off the sticker face.
 * - The 3D Simulator uses normalized centered tabletop coordinates (`simScale`, `simPosition`).
 */

export const MINDAR_CONFIG = {
  targetSrc: './marker_patterns/stickers.mind',
  maxTrack: 2,
};

export const STICKER_MARKERS = [
  {
    id: 'pagtanow',
    targetIndex: 0,
    icon: '🔮',
    name: 'PagtaNOW: Sense the Future',
    shortLabel: 'PagtaNOW',
    category: 'CAPACITY DEV 01 • FUTURES SENSING',
    tagline: 'Peering into the Future of Philippine Governance',
    accentColor: '#2B7A78',
    secondaryColor: '#F6A821',

    stickerImageUrl: './marker_patterns/pagtanow.png',
    modelUrl: './output_models/rizalexport.glb',

    // Live MindAR centered coordinates (1 unit = sticker width, +Z out toward viewer)
    arScale: '0.5 0.5 0.5',
    arPosition: '0 0 0.05',
    arRotation: '90 0 0',

    // 3D Simulator normalized tabletop coordinates
    simScale: '0.5 0.5 0.5',
    simPosition: '0 0.05 0',
    simRotation: '0 0 0',
    autoSpin: false,

    description:
      'PagtaNOW trains student leaders and local bureaucrats to spot weak signals of change before crises strike across Philippine communities.',
  },
  {
    id: 'talampad',
    targetIndex: 1,
    icon: '⚖️',
    name: 'TALAMPAD: Principled Accountability',
    shortLabel: 'TALAMPAD',
    category: 'CAPACITY DEV 02 • INTEGRITY & LEADERSHIP',
    tagline: 'Tracing Accountability: Leadership, Administration & Management through Principled Actions & Decisions',
    accentColor: '#D63629',
    secondaryColor: '#1B4988',

    stickerImageUrl: './marker_patterns/talampad.png',
    modelUrl: './output_models/talampad.glb',

    // Live MindAR centered coordinates
    arScale: '0.5 0.5 0.5',
    arPosition: '0 0 0.05',
    arRotation: '90 0 0',

    // 3D Simulator normalized tabletop coordinates
    simScale: '0.5 0.5 0.5',
    simPosition: '0 0.05 0',
    simRotation: '0 0 0',
    autoSpin: true,

    description:
      'Championing ethical decision-making, public audit transparency, and whole-of-society integrity in public administration.',
  },
  {
    id: 'gameon',
    targetIndex: 2,
    icon: '🎲',
    name: 'PAG-IWAG Game On! (goVRnance)',
    shortLabel: 'goVRnance',
    category: 'CAPACITY DEV 03 • CIVIC CO-CREATION',
    tagline: 'Gaming for Good Governance & Civic Co-Creation',
    accentColor: '#1B4988',
    secondaryColor: '#FFD147',

    stickerImageUrl: './marker_patterns/gameon.png',
    modelUrl: './output_models/gameon.glb',

    // Live MindAR centered coordinates
    arScale: '0.5 0.5 0.5',
    arPosition: '0 0 0.05',
    arRotation: '90 0 0',

    // 3D Simulator normalized tabletop coordinates
    simScale: '0.5 0.5 0.5',
    simPosition: '0 0.05 0',
    simRotation: '0 0 0',
    autoSpin: true,

    description:
      'Interactive tabletop and VR governance simulations uniting State Universities and Colleges (SUCs) and local civil servants.',
  },
  {
    id: 'kabataan',
    targetIndex: 3,
    icon: '🔥',
    name: 'Ang Bukas: Lingkod Bayani',
    shortLabel: 'Lingkod Bayani',
    category: 'WHOLE-OF-SOCIETY COMMITMENT',
    tagline: 'Kabataan Para sa Matapat na Pamahalaan',
    accentColor: '#F6A821',
    secondaryColor: '#0D254C',

    stickerImageUrl: './marker_patterns/kabataan.png',
    modelUrl: './output_models/kabataan.glb',

    // Live MindAR centered coordinates
    arScale: '0.5 0.5 0.5',
    arPosition: '0 0 0.05',
    arRotation: '90 0 0',

    // 3D Simulator normalized tabletop coordinates
    simScale: '0.5 0.5 0.5',
    simPosition: '0 0.05 0',
    simRotation: '0 0 0',
    autoSpin: true,

    description:
      'Public office is a position of TRUST, NOT of PRIVILEGE — illuminating a new generation of principled citizen-leaders.',
  },

  /* =========================================================================
     EXAMPLE TEMPLATE FOR ADDING A 5TH STICKER (targetIndex: 4):
     1. Include custom_sticker.png as the 5th image when compiling stickers.mind
     2. Save custom_sticker.png in marker_patterns/ and custom_model.glb in output_models/
     3. Uncomment this block:
     =========================================================================
  {
    id: 'custom_sticker',
    targetIndex: 4,
    icon: '✨',
    name: 'PAG-IWAG Caravan Emblem',
    shortLabel: 'Caravan',
    category: 'SPECIAL EXHIBIT • 3D SHOWCASE',
    tagline: 'Whole-of-Society Governance Innovation',
    accentColor: '#1B4988',
    secondaryColor: '#F6A821',
    stickerImageUrl: './marker_patterns/custom_sticker.png',
    modelUrl: './output_models/custom_model.glb',
    arScale: '0.5 0.5 0.5',
    arPosition: '0 0 0.05',
    arRotation: '90 0 0',
    simScale: '0.5 0.5 0.5',
    simPosition: '0 0.05 0',
    simRotation: '0 0 0',
    autoSpin: true,
    description:
      'Borderless custom sticker & 3D model created by the PAG-IWAG design team.',
  },
  */
];
