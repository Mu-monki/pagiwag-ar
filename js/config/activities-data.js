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
  maxTrack: 1,
  // Lower values damp handheld jitter; raise filterBeta slightly if motion feels laggy
  filterMinCF: 0.0005,
  filterBeta: 0.005,
  warmupTolerance: 7,
  missTolerance: 15,
};

export const STICKER_MARKERS = [
  {
    id: 'pagtanow',
    targetIndex: 15,
    targetIndices: [15,16,17,18,19,20,21,22,23,24],
    icon: '<i class="fa-regular fa-gem"></i>',
    name: 'PagtaNOW: Images of the Future',
    shortLabel: 'PagtaNOW',
    category: 'CAPACITY DEV 01 • FUTURES THINKING',
    tagline: 'Peering into the Future of National and Local Governance',
    accentColor: '#2B7A78',
    secondaryColor: '#F6A821',

    stickerImageUrl: './marker_patterns/pagtanow.png',
    modelUrl: './output_models/rizalexport.glb',

    // Live MindAR centered coordinates (1 unit = sticker width, +Z out toward viewer)
    arScale: '0.35 0.35 0.35',
    arPosition: '0 0 0.05',
    arRotation: '90 0 0',

    // AUDIO CONFIG
    trackSounds: {
      0: './audio/line1.mp3',
      1: './audio/line2.mp3',
      2: './audio/line3.mp3',
      // '-1': './audio/line-all.mp3',
    },
    soundLoop: false,
    defaultClipIndex: 0,

    // 3D Simulator normalized tabletop coordinates
    simScale: '0.3 0.3 0.3',
    simPosition: '0 0.05 0',
    simRotation: '0 0 0',
    // autoSpin: false,
    autoSpin: true,
    floatingStickers: [
      './marker_patterns/pagtanow_cards/smile.png',
      './marker_patterns/pagtanow_cards/smile_with_teeth.png',
      './marker_patterns/pagtanow_cards/sadt_with_cry.png',
      './marker_patterns/pagtanow_cards/sadt.png',
      './marker_patterns/pagtanow_cards/no_baka_meron.png',
      './marker_patterns/pagtanow_cards/no_deins_wala.png',
      './marker_patterns/pagtanow_cards/yes_may_hangganan.png',
      './marker_patterns/pagtanow_cards/yes_anything_possible.png',
    ],

    description:
      'PagtaNOW is a game developed by the UP NCPAG GRIT Labs to explore a person’s perceptionof the future based on given prompts of scenarios.',
  },
  {
    id: 'talampad',
    targetIndex: 9,
    targetIndices: [9,10,11,12,13,14],
    // icon: '⚖️',
    icon: '<i class="fa-solid fa-star-half-stroke"></i>',
    name: 'TALAMPAD: Civic Priorities & Principled Actions',
    shortLabel: 'TALAMPAD',
    category: 'CAPACITY DEV 02 • CIVIC PRIORITIES',
    tagline: 'Tracing Accountability: Leadership, Administration & Management through Principled Actions & Decisions',
    accentColor: '#D63629',
    secondaryColor: '#1B4988',

    stickerImageUrl: './marker_patterns/talampad.png',
    modelUrl: './output_models/rizalexport.glb',

    // CONFIG FLAG
    floatingConstellations: true,
    count: 4,
    starColor: '#FFD147', 
    accentColor: '#93C5FD', 
    lineColor: '#F6A821',

    // Live MindAR centered coordinates
    arScale: '0.35 0.35 0.35',
    arPosition: '0 0 0.05',
    arRotation: '90 0 0',

    // AUDIO CONFIG
    trackSounds: {
      0: './audio/line1.mp3',
      1: './audio/line2.mp3',
      2: './audio/line3.mp3',
    },
    soundLoop: false,
    defaultClipIndex: 0,

    // 3D Simulator normalized tabletop coordinates
    simScale: '0.3 0.3 0.3',
    simPosition: '0 0.05 0',
    simRotation: '0 0 0',
    autoSpin: true,

    description:
      'TALAMPAD is an interactive game designed to explore the underlying motivations, values, and priorities that influence individuals ethical decision-making.',
  },
  {
    id: 'GoVRnance',
    targetIndex: 5,
    targetIndices: [5,6,7,8],
    // icon: '🎲',
    icon: '<i class="fa-solid fa-vr-cardboard"></i>',
    name: 'GoVRnance: A Virtual Reality Simulation Experience on Public Sector Integrity and Accountability',
    shortLabel: 'GoVRnance',
    category: 'CAPACITY DEV 03 • ETHICAL DECISION-MAKING',
    tagline: 'Serious Games for Ethical Judgement',
    accentColor: '#1B4988',
    secondaryColor: '#FFD147',

    stickerImageUrl: './marker_patterns/gameon.png',
    modelUrl: './output_models/rizalexport.glb',

    // CONFIG FLAG
    floatingMatrix: true,

    // Live MindAR centered coordinates
    arScale: '0.3 0.3 0.3',
    arPosition: '0 0 0.05',
    arRotation: '90 0 0',

    // AUDIO CONFIG
    trackSounds: {
      0: './audio/line1.mp3',
      1: './audio/line2.mp3',
      2: './audio/line3.mp3',
    },
    soundLoop: false,
    defaultClipIndex: 0,

    // 3D Simulator normalized tabletop coordinates
    simScale: '0.5 0.5 0.5',
    simPosition: '0 0.05 0',
    simRotation: '0 0 0',
    autoSpin: true,

    description:
      'A capacity building Serious Game leveraging Virtual Reality to promote critical thinking and integrity in governance decision-making processes.',
  },
  {
    id: 'PAG-IWAG Caravan',
    targetIndex: 0,
    targetIndices: [0,1,2,3,4],
    // icon: '🔥',
    icon: '<i class="fa-solid fa-fire"></i>',
    name: 'PAG-IWAG Caravan by UP NCPAG GRIT Labs',
    shortLabel: 'PAG-IWAG Caravan',
    category: 'WHOLE-OF-SOCIETY COMMITMENT',
    tagline: '"Kasama ka sa Biyahe, Patungong PAG-IWAG!"',
    accentColor: '#F6A821',
    secondaryColor: '#0D254C',

    stickerImageUrl: './marker_patterns/kabataan.png',
    modelUrl: './output_models/pagiwagjeep.glb',

    // Live MindAR centered coordinates
    arScale: '0.8 0.8 0.8',
    arPosition: '0 0 0.05',
    arRotation: '90 0 0',

    // AUDIO CONFIG !!CHANGE LATER!!
    // soundUrl: './audio/line1.mp3',
    // soundLoop: true,
    // defaultClipIndex: -1,
    // onlyAllTracks: true,

    // 3D Simulator normalized tabletop coordinates
    simScale: '1.5 1.5 1.5',
    simPosition: '0 0.05 0',
    simRotation: '0 0 0',
    autoSpin: false,

    description:
      'PAG-IWAG is a nationwide knowledge-sharing and capacity-building caravan of the University of the Philippines National College of Public Administration and Governance (UP NCPAG) Governance Reform, Innovation and Transformation Research Collaboratories (GRIT Labs)',
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
