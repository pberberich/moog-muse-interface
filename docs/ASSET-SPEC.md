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
  (e.g. 300×200). Warm-white/bone plastic **pill-shaped** cap with large
  soft bevels — smooth top, no groove (matches the instrument's caps).
- **`-h`**: the exact same cap rotated 90° (≈ 200×300).

## 4. Button caps — `btn-*.png`

Single sprites, tightly cropped with ~4% transparent margin, lit states
are produced in CSS (dim/glow filters), so deliver each cap **unlit at
full material brightness**:

| File | Contents | Size |
| --- | --- | --- |
| `btn-white.png` | Warm-white molded cap, generous rounded bevels (Hold, FW/BK, Tap) | 300×200 |
| `btn-yellow.png`, `btn-orange.png`, `btn-cyan.png` | The same cap in its lit color (shown when the button is engaged) | 300×200 |
| `btn-gray.png` | Dark gray version of the same cap | 300×200 |
| `btn-red.png` | Small **red lozenge LED-button**: translucent bright-red plastic, rounded-rectangle, ≈ 2:1 | 260×140 |
| `btn-rocker.png` | Wide dark-gray rocker cap for the option selectors, ≈ 2.6:1 | 400×150 |

## 5. Optional upgrades (nice-to-have, same global rules)

| File | Contents | Size |
| --- | --- | --- |
| `knob-strip-big.png` | Same spec as knob-strip; alternate cap style for the two large filter knobs | 512×32768 |
| `led-off.png` / `led-on.png` | Round 3mm LED; `on` = red-orange with soft bloom | 128×128 |
| `wheel.png` | Pitch/mod wheel front view: bright ridged metal, side highlights | 240×640 |
| `key-white.png` / `key-white-down.png` | White key, top view with front lip | 300×1200 |
| `key-black.png` / `key-black-down.png` | Black key, glossy top | 200×760 |
| `wood.png` | Walnut end-cheek texture, vertical grain, tileable vertically | 256×2048 |

## Using an AI image service

Delivery: individual PNG files committed to this repo (chat-pasted images
cannot be used — the pixels never arrive as files). One asset per file, not
montage sheets.

Rules that make generated output usable:

- **Layout comes from real photographs of the Muse, never from generation.**
  Generated full-panel mockups invent layouts; only per-control sprites are
  wanted. Style reference: matte **black** knobs (the real Muse has no
  silver-topped knobs), warm-white silkscreen, red LEDs, walnut cheeks.
- **Knob: generate ONE frame, not a filmstrip.** A single perfect top-down
  knob **without any pointer line** (`knob-base.png`, ≥512×512, transparent,
  knob ≈68% of frame). The app composites a rotating pointer over the static
  base, which sidesteps AI frame-consistency entirely. If a pointer is
  unavoidable, put it exactly at 12 o'clock.
- Transparent background (or pure #00FF00 to key out), no drop shadow, no
  text, camera perfectly top-down, key light upper-left on every asset.
- Single sprites per file for caps/buttons/LEDs/wheels per the tables above.

## Regenerating the built-in assets instead

The repo can rebuild its own versions with Blender:

```sh
blender -b -P scripts/knob_render.py  -- /tmp/knob-frames 64 256
blender -b -P scripts/fader_render.py -- /tmp/fader
node scripts/measure_stage.mjs                # needs `vite preview` running
blender -b -P scripts/plate_render.py -- scripts/stage-map.json /tmp/panel-plate.png 2
```
