import { MidiMessageHandler, MidiTransport, PortInfo } from "./types";

/**
 * Transport used inside the JUCE AU/VST3/Standalone wrapper: no Web MIDI
 * exists there, so MIDI bytes travel over the WebView's native-integration
 * event channel ("midiFromUI" out, "midiToUI" in) and the host routes them.
 */
export class JuceTransport implements MidiTransport {
  readonly kind = "juce" as const;
  private messageHandlers: MidiMessageHandler[] = [];

  async init(): Promise<void> {
    window.__JUCE__!.backend.addEventListener("midiToUI", (payload) => {
      const bytes = (payload as { bytes?: number[] })?.bytes;
      if (Array.isArray(bytes)) {
        const data = Uint8Array.from(bytes);
        this.messageHandlers.forEach((h) => h(data));
      }
    });
  }

  // Port routing is handled by the plugin host; expose a single virtual port.
  inputs(): PortInfo[] {
    return [{ id: "host", name: "Plugin host" }];
  }

  outputs(): PortInfo[] {
    return [{ id: "host", name: "Plugin host" }];
  }

  selectInput(): void {}
  selectOutput(): void {}

  selectedInput(): string | null {
    return "host";
  }

  selectedOutput(): string | null {
    return "host";
  }

  send(bytes: number[] | Uint8Array): void {
    window.__JUCE__!.backend.emitEvent("midiFromUI", { bytes: [...bytes] });
  }

  onMessage(handler: MidiMessageHandler): void {
    this.messageHandlers.push(handler);
  }

  onPortsChanged(): void {}
}
