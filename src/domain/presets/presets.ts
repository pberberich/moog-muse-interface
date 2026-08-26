/**
 * Curated starter presets. Each stores only the CCs it changes; applying a
 * preset resets every other parameter to its init default first, so results
 * are reproducible. Values reference the CC numbers in ../sections.
 */

export interface Preset {
  name: string;
  description: string;
  values: Record<number, number>;
}

export const PRESETS: Preset[] = [
  {
    name: "Warm Pad",
    description: "Detuned saws, slow envelopes, wide stereo delay",
    values: {
      44: 40, // OSC 1 octave 8'
      46: 100, // OSC 1 toward saw
      49: 40, // OSC 2 octave 8'
      50: 70, // OSC 2 slightly sharp
      51: 100, // OSC 2 toward saw
      58: 100, // OSC 1 level
      59: 92, // OSC 2 level
      92: 28, // voice detune
      9: 84, // pan spread
      67: 62, // cutoff
      68: 18, // resonance
      69: 82, // filter env amount (mildly positive)
      79: 58, // filter attack
      81: 70, // filter decay
      80: 90, // filter sustain
      82: 84, // filter release
      86: 66, // amp attack
      87: 127, // amp sustain
      89: 92, // amp release
      93: 44, // delay time L
      94: 52, // delay time R
      95: 0, // unlink delays for width
      103: 58, // delay feedback
      105: 42 // delay mix
    }
  },
  {
    name: "Muse Bass",
    description: "Mono 16' saw bass with snappy filter envelope",
    values: {
      109: 127, // mono
      5: 12, // a touch of glide
      44: 10, // OSC 1 octave 16'
      46: 110, // OSC 1 saw
      49: 10, // OSC 2 octave 16'
      51: 110, // OSC 2 saw
      58: 108, // OSC 1 level
      59: 96, // OSC 2 level
      65: 30, // some mixer drive
      67: 44, // cutoff
      68: 38, // resonance
      69: 98, // filter env amount
      79: 0, // filter attack
      81: 44, // filter decay
      80: 18, // filter sustain
      82: 28, // filter release
      86: 0, // amp attack
      88: 52, // amp decay
      87: 100, // amp sustain
      89: 22, // amp release
      85: 127, // filter env velocity
      105: 0 // delay off
    }
  },
  {
    name: "Sync Lead",
    description: "Hard-synced OSC 1 swept by the filter envelope",
    values: {
      109: 127, // mono
      5: 18, // glide
      54: 127, // sync 2→1
      44: 72, // OSC 1 octave 4'
      45: 96, // OSC 1 swept sharp
      46: 105, // OSC 1 saw
      49: 40, // OSC 2 octave 8'
      58: 112, // OSC 1 level
      59: 0, // OSC 2 silent (acts as sync master)
      67: 84, // cutoff
      68: 26, // resonance
      69: 96, // filter env amount
      79: 6, // filter attack
      81: 64, // filter decay
      80: 46, // filter sustain
      82: 40, // filter release
      86: 2, // amp attack
      87: 118, // amp sustain
      89: 36, // amp release
      104: 40, // delay character
      105: 30 // delay mix
    }
  },
  {
    name: "FM Keys",
    description: "Triangle FM electric-piano keys, velocity sensitive",
    values: {
      55: 127, // FM 2→1
      57: 58, // FM amount
      44: 40, // OSC 1 octave 8'
      46: 0, // OSC 1 triangle
      49: 72, // OSC 2 octave 4' (modulator)
      51: 0, // OSC 2 triangle
      58: 104, // OSC 1 level
      59: 0, // modulator not in the mix
      67: 92, // cutoff open
      69: 78, // gentle filter env
      79: 0, // filter attack
      81: 52, // filter decay
      80: 40, // filter sustain
      82: 46, // filter release
      86: 0, // amp attack
      88: 62, // amp decay
      87: 64, // amp sustain
      89: 44, // amp release
      85: 127, // filter env velocity
      91: 127, // amp env velocity
      105: 26 // delay mix
    }
  }
];
