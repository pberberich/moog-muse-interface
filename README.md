# Moog Muse Interface

A browser-based control panel and patch librarian for the
[Moog Muse](https://www.moogmusic.com/downloads/?product=Muse) 8-voice analog
polysynth — inspired by
[prophet-panel](https://github.com/TonyGermaneri/prophet-panel).

Every front-panel section of the Muse is mirrored on screen — oscillators,
modulation oscillator and routing, dual filters, both envelopes, the three
LFOs, mixer, voice controls, delay, and arp/clock — with **100+ parameters**
wired to the Muse's published MIDI CC chart. Turn a knob on screen and the
Muse responds; turn a knob on the Muse and the screen follows.

## Features

- **Full CC panel** — knobs, illuminated switches, and multi-position
  selectors for every parameter in the Muse MIDI implementation chart
- **Bidirectional sync** — incoming CCs (from the Muse or a controller) update
  the on-screen controls in real time
- **Patch librarian** — save/load patches locally, JSON import/export,
  one-click "Send all" to push the whole panel to the synth, init patch,
  and four curated starter presets (Warm Pad, Muse Bass, Sync Lead, FM Keys)
- **Playable keyboard** — on-screen touch keyboard plus computer-keyboard
  playing (`A`–`L` keys, `Z`/`X` to shift octaves), velocity slider, and a
  Panic button (all sound off / all notes off)
- **Runs anywhere** — plain web app (Web MIDI), installable PWA with a
  touch-friendly layout for tablets, and native **AU / VST3 / Standalone**
  builds via a thin JUCE WebView wrapper (see [`native/`](native/README.md))

## Quick start (web)

```sh
npm install
npm run dev        # http://localhost:5173
```

Open it in a Web MIDI-capable browser (Chrome, Edge, Opera), allow MIDI
access, and pick your Muse in the **In**/**Out** selectors — ports with
"Muse" in the name are auto-selected. Set **Ch** to match the Muse's MIDI
channel (Settings → MIDI on the synth), and make sure CC transmit/receive is
enabled there.

`npm run build` produces a static `dist/` you can host anywhere; a GitHub
Actions workflow deploys it to GitHub Pages on every push to `main`.

## Native plugin / standalone

The AU (macOS), VST3, and Standalone versions embed the same TypeScript UI in
a JUCE WebView; the only C++ is a ~200-line MIDI bridge. From the repo root:

```sh
npm run build:native
```

See [`native/README.md`](native/README.md) for details, including how to
target **iPad** (standalone app or AUv3 via the JUCE iOS build — the reliable
route on iPad, since iPadOS Safari lacks Web MIDI).

## Project layout

Modules are small, single-purpose files grouped in directories, each exposed
through an `index.ts` barrel, with tests colocated next to the code they cover
(`*.test.ts[x]`, run with `npm test`):

```
src/domain/            Muse parameter model (single source of truth)
  types.ts             Param/Section/EnumOption types
  options.ts           Shared enum ranges (waveforms, octaves, kb-track…)
  builders.ts          knob/toggle/enum factory helpers
  format.ts            Value ↔ label/display mapping
  sections/            One file per panel section (lfos, filters, mixer…)
src/midi/              Transport layer
  webMidiTransport.ts  Web MIDI (browser)
  juceTransport.ts     JUCE WebView bridge (plugins)
  createTransport.ts   Environment detection
  fakeTransport.ts     In-memory transport for tests
src/state/             App state
  museStore.ts         Store class (transport injected, fully testable)
  patchStorage.ts      localStorage persistence + JSON import parsing
  instance.ts          App-wide singleton
  useStore.ts          React binding
src/components/        UI, one directory per component
  knob/  switches/  panel/  toolbar/  keyboard/  patch-library/
native/                JUCE CMake project (AU / VST3 / Standalone / iOS)
```

Run the suite with `npm test` (Vitest + Testing Library; 44 tests covering the
parameter tables, MIDI transports, store behavior, persistence, and controls).

## MIDI mapping notes

CC assignments follow the Muse MIDI implementation chart from Moog's firmware
documentation, as mirrored by the open [midi.guide](https://midi.guide/d/moog/muse/)
dataset ([pencilresearch/midi](https://github.com/pencilresearch/midi)). The
published chart labels CC 81/88 "Delay" within the envelope sections; they are
exposed here as the Decay stages. If a firmware update changes any assignment,
edit `src/domain/params.ts` — it is the single source of truth for the panel.

This is an unofficial community tool, not affiliated with or endorsed by
Moog Music Inc.
