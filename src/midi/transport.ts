/**
 * MIDI transport abstraction.
 *
 * In a browser we use the Web MIDI API. When running inside the JUCE
 * AU/VST3/Standalone wrapper there is no Web MIDI, so MIDI bytes are
 * bridged over the JUCE WebView native-integration event channel instead
 * ("midiFromUI" out, "midiToUI" in) and routed by the host/plugin.
 */

export interface PortInfo {
  id: string;
  name: string;
}

export type MidiMessageHandler = (data: Uint8Array) => void;

export interface MidiTransport {
  readonly kind: "webmidi" | "juce";
  init(): Promise<void>;
  inputs(): PortInfo[];
  outputs(): PortInfo[];
  selectInput(id: string | null): void;
  selectOutput(id: string | null): void;
  selectedInput(): string | null;
  selectedOutput(): string | null;
  send(bytes: number[] | Uint8Array): void;
  onMessage(handler: MidiMessageHandler): void;
  onPortsChanged(handler: () => void): void;
}

interface JuceBackend {
  emitEvent(name: string, payload: unknown): void;
  addEventListener(name: string, cb: (payload: unknown) => void): void;
}

declare global {
  interface Window {
    __JUCE__?: { backend: JuceBackend };
  }
}

class WebMidiTransport implements MidiTransport {
  readonly kind = "webmidi" as const;
  private access: MIDIAccess | null = null;
  private inputId: string | null = null;
  private outputId: string | null = null;
  private messageHandlers: MidiMessageHandler[] = [];
  private portHandlers: (() => void)[] = [];

  async init(): Promise<void> {
    if (!navigator.requestMIDIAccess) {
      throw new Error("Web MIDI is not supported in this browser. Use Chrome, Edge, or Opera.");
    }
    this.access = await navigator.requestMIDIAccess({ sysex: false });
    this.access.onstatechange = () => {
      this.autoSelect();
      this.portHandlers.forEach((h) => h());
    };
    this.autoSelect();
  }

  /** Prefer ports whose name mentions "Muse". */
  private autoSelect(): void {
    if (!this.access) return;
    const pick = (ports: PortInfo[], current: string | null): string | null => {
      if (current && ports.some((p) => p.id === current)) return current;
      const muse = ports.find((p) => /muse/i.test(p.name));
      return (muse ?? ports[0])?.id ?? null;
    };
    this.selectInput(pick(this.inputs(), this.inputId));
    this.outputId = pick(this.outputs(), this.outputId);
  }

  inputs(): PortInfo[] {
    return [...(this.access?.inputs.values() ?? [])].map((p) => ({
      id: p.id,
      name: p.name ?? p.id
    }));
  }

  outputs(): PortInfo[] {
    return [...(this.access?.outputs.values() ?? [])].map((p) => ({
      id: p.id,
      name: p.name ?? p.id
    }));
  }

  selectInput(id: string | null): void {
    if (!this.access) return;
    for (const input of this.access.inputs.values()) {
      input.onmidimessage = null;
    }
    this.inputId = id;
    if (id) {
      const input = this.access.inputs.get(id);
      if (input) {
        input.onmidimessage = (e: MIDIMessageEvent) => {
          if (e.data) this.messageHandlers.forEach((h) => h(e.data!));
        };
      }
    }
  }

  selectOutput(id: string | null): void {
    this.outputId = id;
  }

  selectedInput(): string | null {
    return this.inputId;
  }

  selectedOutput(): string | null {
    return this.outputId;
  }

  send(bytes: number[] | Uint8Array): void {
    if (!this.access || !this.outputId) return;
    this.access.outputs.get(this.outputId)?.send([...bytes]);
  }

  onMessage(handler: MidiMessageHandler): void {
    this.messageHandlers.push(handler);
  }

  onPortsChanged(handler: () => void): void {
    this.portHandlers.push(handler);
  }
}

class JuceTransport implements MidiTransport {
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

export function createTransport(): MidiTransport {
  return window.__JUCE__ ? new JuceTransport() : new WebMidiTransport();
}
