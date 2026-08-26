# Asset specification — photorealistic control assets

Drop-in asset spec for externally produced (rendered, photographed, or
AI-generated) artwork. Files placed in `public/` with these exact names
replace the built-in Blender-rendered assets with no code changes.

## Global rules (apply to every asset)

- **View**: straight top-down orthographic. No perspective, no tilt.
- **Lighting**: one consistent setup across ALL assets — soft key light from
  the upper-left (~30° off vertical), gentle fill from the right, no colored
  lighting. Shadows soft and short.
- **Format**: PNG with a real alpha channel (transparent background). No
  matte fringing (export straight or premultiplied-then-unpremultiplied).
- **Resolution**: at least the sizes below (they are 2–4× display size).
- **Style reference**: the Moog Muse front panel — matte black rubberized
  and ABS plastics, warm-white silkscreen, red-orange LEDs.
- **No text, ticks, or shadows baked into control sprites** — the panel
  plate carries the printing; the app adds drop shadows.

## 1. `panel-photo.png` — the single most valuable asset

A photorealistic straight-on image of the entire Muse faceplate: the black
control panel only, cropped exactly to the panel area **between the wood
end-cheeks**, from the top edge of the panel to just above the keybed.

- **Size**: ≥ 4400×1176 (any larger is better; will be scaled to fit).
- **Content**: panel with all printing/graphics, but ideally WITHOUT
  knobs/fader caps mounted (an empty drilled panel like a service photo) —
  the app composites live controls on top. A fully populated panel photo
  also works; the live controls will sit over the photographed ones.
- Perfectly rectangular (perspective-corrected), evenly lit, no glare
  hotspots, no reflections of the camera.

## 2. `knob-strip.png` — knob rotation filmstrip

One PNG containing **64 frames stacked vertically** (a single column),
each frame square. Frame 0 at the top.

- **Frame size**: 512×512 (min 256×256). Total image 512×32768 (or 256×16384).
- **The knob**: Muse-style — cylindrical matte-black rubberized skirt, domed
  soft-touch cap, warm-white pointer stripe inset across the cap continuing
  as a short notch on the skirt top.
- **Rotation**: frame 0 = pointer at 7 o'clock (−135° from 12 o'clock);
  frame 63 = pointer at 5 o'clock (+135°); the 64 frames step **clockwise
  linearly** between them (each step = 270°/63 ≈ 4.29°).
- **Framing**: knob centered, outer skirt diameter ≈ **68% of frame width**
  (margin left clear for the app's tick ring).
- Identical camera, lighting, and exposure on every frame — only the knob
  rotates. No background, no shadow (the app adds it).

## 3. `fader-cap-v.png` and `fader-cap-h.png` — fader caps

Single sprites, tightly cropped with ~4% transparent margin.

- **`-v`** (cap for vertical faders): wide orientation, ≈ 3:2 aspect
  (e.g. 300×200). Warm-white/bone plastic rectangular cap, softly beveled
  edges, one shallow **dark center groove** running across the top face
  horizontally.
- **`-h`**: the exact same cap rotated 90° (≈ 200×300, groove vertical).

## 4. Optional upgrades (nice-to-have, same global rules)

| File | Contents | Size |
| --- | --- | --- |
| `knob-strip-big.png` | Same spec as knob-strip; alternate cap style for the two large filter knobs | 512×32768 |
| `btn-gray.png` / `btn-gray-down.png` | Rectangular gray plastic button cap, up and pressed | 300×170 |
| `btn-yellow.png`, `btn-orange.png`, `btn-cyan.png` (+`-down`) | Colored caps, same geometry | 300×170 |
| `led-off.png` / `led-on.png` | Round 3mm LED; `on` = red-orange with soft bloom | 128×128 |
| `wheel.png` | Pitch/mod wheel front view: black rubber, fine knurling, side highlights | 240×640 |
| `key-white.png` / `key-white-down.png` | White key, top view with front lip | 300×1200 |
| `key-black.png` / `key-black-down.png` | Black key, glossy top | 200×760 |
| `wood.png` | Walnut end-cheek texture, vertical grain, tileable vertically | 256×2048 |

## Regenerating the built-in assets instead

The repo can rebuild its own versions with Blender:

```sh
blender -b -P scripts/knob_render.py  -- /tmp/knob-frames 64 256
blender -b -P scripts/fader_render.py -- /tmp/fader
node scripts/measure_stage.mjs                # needs `vite preview` running
blender -b -P scripts/plate_render.py -- scripts/stage-map.json /tmp/panel-plate.png 2
```
