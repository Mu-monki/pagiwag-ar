# PAG-IWAG 2026 — MindAR Borderless Image Tracking & 3D Model WebAR App

**Public Administration on the GO: Inculcating Whole-of-Society Accountability in Governance**  
*UP National College of Public Administration and Governance (UP NCPAG) — GRIT Labs*

## Quick Start

1. **Compile your stickers into one `.mind` file:**
   - Open https://hiukim.github.io/mind-ar-js-doc/tools/compile
   - Drop your teammates' borderless sticker PNGs in order (`pagtanow.png`, `talampad.png`, `gameon.png`, `kabataan.png`).
   - Click **Start** and save the compiled bundle as `marker_patterns/stickers.mind`.
2. **Add sticker previews & 3D `.glb` models:**
   - Save the borderless sticker PNGs in `marker_patterns/` (`pagtanow.png`, `talampad.png`, `gameon.png`, `kabataan.png`).
   - Save your teammates' `.glb` 3D models in `output_models/` (`pagtanow.glb`, `talampad.glb`, `gameon.glb`, `kabataan.glb`).
3. **Serve over HTTP/HTTPS:**
   - Run `npx serve .` or `python -m http.server 8000` inside `pag-iwag-ar/` (or deploy to GitHub Pages / Vercel).

## Folder Structure

```text
pag-iwag-ar/
├── index.html                  # A-Frame 1.5.0 + MindAR 1.2.5 image tracking shell
├── marker_patterns/            # Single `stickers.mind` bundle + borderless sticker .png files
├── output_models/              # Teammate 3D .glb / .gltf models
├── css/
│   ├── theme.css               # PAG-IWAG color tokens, editorial fonts & geometric weave borders
│   ├── splash.css              # MindAR target & 3D model preloader splash screen
│   └── components.css          # Transparent AR camera layer, HUD, info drawer & sticker kit modal
└── js/
    ├── config/
    │   └── activities-data.js  # Maps each MindAR `targetIndex` to its .glb model & sticker metadata
    ├── core/
    │   ├── marker-compiler.js  # Verifies `stickers.mind`, sticker PNGs & .glb models
    │   ├── camera-preflight.js # HTTPS / getUserMedia environment validator
    │   └── audio-fx.js         # Web Audio API chimes & SFX feedback (with HUD mute toggle)
    ├── ar/
    │   ├── scene-manager.js    # Dynamic MindAR scene & 3D simulator orbit controls
    │   └── holograms.js        # Renders teammate GLB models in MindAR space or Simulator space
    ├── ui/
    │   ├── activity-drawer.js  # Clean sticker & 3D model info card + chime replay
    │   └── marker-exporter.js  # Borderless sticker PNG & printable sheet generator
    └── main.js                 # Splash screen boot sequence & global event wiring
```
