import { MidiMessageHandler, MidiTransport, PortInfo } from "./types";

/** In-memory transport for tests: records sends, lets tests inject messages. */
export class FakeTransport implements MidiTransport {
  readonly kind = "webmidi" as const;
  sent: number[][] = [];
  private messageHandlers: MidiMessageHandler[] = [];

  async init(): Promise<void> {}

  inputs(): PortInfo[] {
    return [{ id: "fake-in", name: "Fake In" }];
  }

  outputs(): PortInfo[] {
    return [{ id: "fake-out", name: "Fake Out" }];
  }

  selectInput(): void {}
  selectOutput(): void {}

  selectedInput(): string | null {
    return "fake-in";
  }

  selectedOutput(): string | null {
    return "fake-out";
  }

  send(bytes: number[] | Uint8Array): void {
    this.sent.push([...bytes]);
  }

  onMessage(handler: MidiMessageHandler): void {
    this.messageHandlers.push(handler);
  }

  onPortsChanged(): void {}

  /** Test hook: simulate an incoming MIDI message. */
  receive(bytes: number[]): void {
    const data = Uint8Array.from(bytes);
    this.messageHandlers.forEach((h) => h(data));
  }
}
