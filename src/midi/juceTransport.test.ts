import { afterEach, describe, expect, it, vi } from "vitest";
import { createTransport } from "./createTransport";
import { JuceTransport } from "./juceTransport";
import { JuceBackend } from "./types";
import { WebMidiTransport } from "./webMidiTransport";

function installFakeJuceBackend() {
  const listeners = new Map<string, (payload: unknown) => void>();
  const backend: JuceBackend = {
    emitEvent: vi.fn(),
    addEventListener: (name, cb) => listeners.set(name, cb)
  };
  window.__JUCE__ = { backend };
  return { backend, listeners };
}

afterEach(() => {
  delete window.__JUCE__;
});

describe("createTransport", () => {
  it("uses Web MIDI in a plain browser", () => {
    expect(createTransport()).toBeInstanceOf(WebMidiTransport);
  });

  it("uses the JUCE bridge when the native backend is present", () => {
    installFakeJuceBackend();
    expect(createTransport()).toBeInstanceOf(JuceTransport);
  });
});

describe("JuceTransport", () => {
  it("sends MIDI as midiFromUI events", async () => {
    const { backend } = installFakeJuceBackend();
    const transport = new JuceTransport();
    await transport.init();

    transport.send([0xb0, 67, 100]);

    expect(backend.emitEvent).toHaveBeenCalledWith("midiFromUI", { bytes: [0xb0, 67, 100] });
  });

  it("delivers midiToUI events to message handlers as bytes", async () => {
    const { listeners } = installFakeJuceBackend();
    const transport = new JuceTransport();
    await transport.init();

    const received: Uint8Array[] = [];
    transport.onMessage((data) => received.push(data));
    listeners.get("midiToUI")!({ bytes: [0xb0, 12, 42] });

    expect(received).toHaveLength(1);
    expect([...received[0]]).toEqual([0xb0, 12, 42]);
  });

  it("ignores malformed midiToUI payloads", async () => {
    const { listeners } = installFakeJuceBackend();
    const transport = new JuceTransport();
    await transport.init();

    const received: Uint8Array[] = [];
    transport.onMessage((data) => received.push(data));
    listeners.get("midiToUI")!({ nope: true });
    listeners.get("midiToUI")!(null);

    expect(received).toHaveLength(0);
  });
});
