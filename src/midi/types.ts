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

export interface JuceBackend {
  emitEvent(name: string, payload: unknown): void;
  addEventListener(name: string, cb: (payload: unknown) => void): void;
}

declare global {
  interface Window {
    __JUCE__?: { backend: JuceBackend };
  }
}
