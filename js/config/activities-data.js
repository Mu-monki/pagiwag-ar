/**
 * PAG-IWAG 2026 — Capacity Development Activities & Sticker Definitions
 * UP NCPAG Governance Reform, Innovation and Transformation Research Collaboratories (GRIT Labs)
 */

export const STICKER_MARKERS = [
  {
    id: 'pagtanow',
    name: 'PagtaNOW: Sense the Future',
    shortLabel: 'PagtaNOW',
    category: 'CAPACITY DEV 01 • FUTURES SENSING GAME',
    tagline: 'Peering into the Future of Philippine Governance',
    accentColor: '#2B7A78',
    secondaryColor: '#F6A821',
    description:
      'PagtaNOW trains student leaders and local bureaucrats to spot weak signals of change before crises strike. Select a future horizon and inspect a PagtaNOW Foresight Arch Card.',
  },
  {
    id: 'talampad',
    name: 'TALAMPAD: Choose Accountability!',
    shortLabel: 'TALAMPAD',
    category: 'CAPACITY DEV 02 • DECISION-MAKING LAB',
    tagline: 'Tracing Accountability: Leadership, Administration & Management through Principled Actions & Decisions',
    accentColor: '#D63629',
    secondaryColor: '#1B4988',
    description:
      'Navigate real-world public administration dilemmas. Every decision shifts the Scales of Justice and tests whole-of-society integrity.',
  },
  {
    id: 'gameon',
    name: 'PAG-IWAG Game On! (goVRnance)',
    shortLabel: 'goVRnance',
    category: 'INTERACTIVE SIMULATION • PLAYTESTING',
    tagline: 'Gaming for Good Governance & Civic Co-Creation',
    accentColor: '#1B4988',
    secondaryColor: '#FFD147',
    description:
      'Roll the goVRnance Civic Action Die to trigger rapid tabletop & VR governance challenges across participating State Universities and Colleges (SUCs).',
  },
  {
    id: 'kabataan',
    name: 'Ang Bukas: Lingkod Bayani Pledge',
    shortLabel: 'Lingkod Bayani',
    category: 'WHOLE-OF-SOCIETY COMMITMENT',
    tagline: 'Kabataan Para sa Matapat na Pamahalaan',
    accentColor: '#F6A821',
    secondaryColor: '#0D254C',
    description:
      'Public office is a position of TRUST, NOT of PRIVILEGE. Seal your commitment as a principled citizen and future public servant.',
  },
];

export const PAGTANOW_HORIZONS = {
  '2030': {
    label: '2030 • Near Horizon',
    prompt:
      'AI-assisted barangay budget dashboards become standard across SUCs and LGUs. How do youth monitors ensure marginalized coastal & rural voices are not left offline?',
  },
  '2035': {
    label: '2035 • Reform Horizon',
    prompt:
      'Climate-adaptive flood infrastructure requires co-signed citizen audits before funds are released. What early-warning metrics should communities track?',
  },
  '2040': {
    label: '2040 • Generational Horizon',
    prompt:
      'Today’s UP & SUC student delegates are now department heads and mayors. Which institutional habit built during PAG-IWAG keeps local governance incorruptible?',
  },
};

export const PAGTANOW_ARCH_CARDS = [
  {
    id: 'smile-teeth',
    mood: 'SMILE WITH TEETH',
    verdict: 'YES. ANYTHING IS POSSIBLE.',
    bg: '#F6A821',
    insight:
      'High civic optimism! Participatory citizen assemblies and open procurement portals turn public skepticism into shared ownership.',
  },
  {
    id: 'yes-limit',
    mood: 'HOPEFUL REALIST',
    verdict: 'YES, PERO MAY HANGGANAN.',
    bg: '#3B429F',
    insight:
      'Digital transparency tools work—but only when paired with strong whistleblower protection and independent COA/SUC monitoring.',
  },
  {
    id: 'no-konti',
    mood: 'CAUTIOUS OBSERVER',
    verdict: 'NO, PERO BAKA MERON KONTI.',
    bg: '#2B7A78',
    insight:
      'Legacy red tape slows reform, yet pocket innovations led by young LGU planners show measurable integrity gains.',
  },
  {
    id: 'sadt-cry',
    mood: 'SADT WITH CRY',
    verdict: 'NO. DEINS. WALA.',
    bg: '#162B4D',
    insight:
      'Warning signal! When flood-control or disaster funds lack public audit trails, community trust erodes fastest. Time for Pag-iwag intervention.',
  },
];

export const TALAMPAD_SCENARIOS = [
  {
    id: 'flood-audit',
    title: 'Scenario 1: Anomalous Flood-Control Variation Order',
    context:
      'You are a municipal planning officer reviewing a P61M flood-control project. A contractor offers a "fast-track courtesy gift" to approve incomplete drainage specs before typhoon season.',
    options: [
      {
        label: 'Reject gift, issue a formal Notice of Non-Compliance & publish inspection photos.',
        delta: +25,
        tilt: 0.28,
        feedback:
          'Principled Action (+25 Integrity): Transparent documentation protects both public funds and community flood safety.',
      },
      {
        label: 'Quietly delay signing without filing an official audit report.',
        delta: -5,
        tilt: -0.12,
        feedback:
          'Partial Hesitation (-5 Integrity): Silence stalls immediate harm but leaves accountability gaps unaddressed.',
      },
      {
        label: 'Sign the clearance to avoid conflict with senior officials.',
        delta: -30,
        tilt: -0.35,
        feedback:
          'Compromised Trust (-30 Integrity): Maging Pag-asa, ’Wag Paasa—public office is a trust, not a privilege.',
      },
    ],
  },
  {
    id: 'suc-scholarship',
    title: 'Scenario 2: SUC-LGU Youth Governance Fellowship',
    context:
      'A local official asks you to prioritize political allies’ relatives for limited regional policy fellowship slots over higher-scoring state university applicants.',
    options: [
      {
        label: 'Enforce blind rubric scoring and post anonymized selection results publicly.',
        delta: +25,
        tilt: 0.3,
        feedback:
          'Merit & Fairness (+25 Integrity): Institutionalizing blind rubrics removes patronage from youth leadership.',
      },
      {
        label: 'Create an informal "reserved slot" while keeping half the list merit-based.',
        delta: -15,
        tilt: -0.22,
        feedback:
          'Eroded Standard (-15 Integrity): Compromising meritocracy undermines whole-of-society credibility.',
      },
    ],
  },
];

export const GOVRNANCE_DIE_PROMPTS = [
  {
    face: '1 • CITIZEN AUDIT',
    challenge:
      'Inspect a barangay infrastructure billboard: verify project cost, contractor name, completion date, and grievance hotline within 60 seconds.',
  },
  {
    face: '2 • FORESIGHT RADAR',
    challenge:
      'Identify one emerging 2030 risk facing your host SUC province (climate, AI misinformation, or water security) and propose a preventive ordinance.',
  },
  {
    face: '3 • OPEN DATA SPRINT',
    challenge:
      'Translate a complex LGU budget line item into a 1-sentence infographic headline any high school student can understand.',
  },
  {
    face: '4 • INTEGRITY SHIELD',
    challenge:
      'Roleplay declining a conflict-of-interest favor using the PAG-IWAG mantra: "Maging Pag-asa, ’Wag Paasa."',
  },
  {
    face: '5 • CO-CREATION LAB',
    challenge:
      'Pair an SUC student researcher with a local civil servant to co-design one 30-day transparency experiment.',
  },
  {
    face: '6 • PAG-IWAG ILLUMINATE',
    challenge:
      'Wildcard! Share one concrete governance reform from your region that deserves national replication.',
  },
];
