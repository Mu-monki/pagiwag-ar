Place your teammate-designed 3D models (.glb or .gltf) here.

Recommended Export & Calibration Settings:
1. Format: Binary glTF (.glb) — self-contained with embedded textures.
2. Target polygon count: Under 30,000 triangles for smooth mobile WebAR performance.
3. Pivot/Origin: Center the model's base at (0, 0, 0).
4. MindAR Coordinate System (in js/config/activities-data.js):
   - MindAR places (0, 0, 0) at the CENTER of the sticker where 1 unit = sticker width.
   - +X is right, +Y is up along the sticker, and +Z points OUT of the sticker toward the camera.
   - Default `arRotation: '90 0 0'` stands a standard Y-up .glb model upright off the sticker face; use `'0 0 0'` if the model should face the camera flat.
