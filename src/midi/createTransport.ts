import { JuceTransport } from "./juceTransport";
import { MidiTransport } from "./types";
import { WebMidiTransport } from "./webMidiTransport";

export function createTransport(): MidiTransport {
  return window.__JUCE__ ? new JuceTransport() : new WebMidiTransport();
}
