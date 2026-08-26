# Native wrapper (AU / VST3 / Standalone)

All of the UI and MIDI logic lives in the TypeScript app at the repo root.
This directory is a thin [JUCE](https://juce.com) shim (~2 small C++ files)
that embeds the built web app in a WebView and bridges MIDI to the plugin
host — the same approach prophet-panel uses for its native builds. An Audio
Unit cannot be written in pure TypeScript (AU/VST3 require a native binary),
so the C++ here is kept to the absolute minimum: serve the web UI, shuttle
MIDI bytes.

## Requirements

- CMake ≥ 3.22 and a C++17 toolchain (Xcode on macOS, Visual Studio on Windows)
- Node.js (to build the web UI that gets embedded)
- JUCE is fetched automatically by CMake (FetchContent, tag 8.0.6)

## Build

```sh
# from the repo root
npm install
npm run build:native
```

or manually:

```sh
npm run build                       # produces dist/ (embedded into the binary)
cmake -B native/build -S native
cmake --build native/build --config Release
```

Outputs land in `native/build/MoogMuseInterface_artefacts/Release/`:

- **AU** (macOS only) — `Moog Muse Interface.component`
- **VST3** — `Moog Muse Interface.vst3`
- **Standalone** — a desktop app

`COPY_PLUGIN_AFTER_BUILD` is enabled, so plugins are also installed into the
user plugin folders automatically on macOS/Windows.

## How MIDI is routed

- **As a plugin (AU/VST3):** the plugin is an audio *effect* with MIDI in/out
  (audio passes through untouched, like prophet-panel), so you can put it on
  the same track as the Muse's audio return. Route your DAW track's MIDI
  output to the Muse; panel moves are emitted as MIDI CC into the host, and
  CCs arriving from the host (e.g. knob moves on the Muse itself) update the
  on-screen panel.
- **Standalone:** choose your MIDI *input* in the app's audio/MIDI settings.
  For output the app opens a hardware MIDI port directly, preferring the
  first port whose name contains "Muse".

## iPad

Two options:

1. **JUCE iOS build** (recommended, since iPadOS Safari has no Web MIDI):
   generate an Xcode project with

   ```sh
   cmake -B native/build-ios -S native -G Xcode -DCMAKE_SYSTEM_NAME=iOS
   ```

   then add `AUv3` to `MUSE_FORMATS` in `CMakeLists.txt` and set up signing in
   Xcode. The result runs standalone on iPad or as an AUv3 inside AUM,
   Logic for iPad, etc.
2. **Web app in a Web MIDI-capable browser** — the web UI is already
   touch-optimized and installable as a PWA, which works today on desktop
   Chrome/Edge and any iPad browser that gains Web MIDI support.
