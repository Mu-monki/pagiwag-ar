# PAG-IWAG 2026 — Modular AR Web Application

**Public Administration on the GO: Inculcating Whole-of-Society Accountability in Governance**  
*UP National College of Public Administration and Governance (UP NCPAG) — GRIT Labs*

## Folder Structure

```text
pag-iwag-ar/
├── index.html                  # Semantic HTML shell, splash screen, AR HUD & modals
├── README.md                   # Setup & deployment guide
├── css/
│   ├── theme.css               # PAG-IWAG color tokens, editorial fonts & geometric weave borders
│   ├── splash.css              # Asset-loading splash screen & animated Oblation torch
│   └── components.css          # Transparent AR camera layer, HUD, activity drawers & kit modal
└── js/
    ├── config/
    │   └── activities-data.js  # Sticker metadata, PagtaNOW cards, TALAMPAD dilemmas & die prompts
    ├── core/
    │   ├── marker-compiler.js  # Offscreen canvas sticker art & inline AR.js .patt data URI generator
    │   ├── camera-preflight.js # HTTPS / getUserMedia environment validator
    │   └── audio-fx.js         # Web Audio API chimes & interaction feedback
    ├── ar/
    │   ├── scene-manager.js    # Dynamic <a-scene> / <a-marker> setup & 3D simulator orbit controls
    │   └── holograms.js        # Procedural Three.js / A-Frame holograms for all 4 stickers
    ├── ui/
    │   ├── activity-drawer.js  # Interactive UI for Futures Horizon, Dilemma Lab, Die & Pledge
    │   └── marker-exporter.js  # Single sticker PNG & 2x2 printable sheet generator
    └── main.js                 # Splash screen boot sequence & global event wiring
```

## Running Locally

Because the application uses native ES Modules (`<script type="module">`) and browser camera APIs (`getUserMedia`), serve the folder over HTTP or HTTPS rather than opening `index.html` directly via `file://`:

```bash
cd pag-iwag-ar
python3 -m http.server 8080
```

Then open `http://localhost:8080` in your browser.
