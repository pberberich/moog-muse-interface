import { ALL_PARAMS, PARAMS_BY_CC, Preset } from "../domain";
import { MidiTransport, PortInfo } from "../midi";
import {
  loadChannel,
  loadPatches,
  parsePatchJson,
  Patch,
  storeChannel,
  storePatches
} from "./patchStorage";

export type MidiStatus = "idle" | "ready" | "unsupported" | "denied";

export class MuseStore {
  private values = new Map<number, number>();
  private listeners = new Set<() => void>();
  private snapshotCache: Record<string, unknown> | null = null;

  status: MidiStatus = "idle";
  statusMessage = "";
  channel = 0; // 0-based (displayed as 1-16)
  lastIncoming = "";

  constructor(readonly transport: MidiTransport) {
    for (const p of ALL_PARAMS) this.values.set(p.cc, p.defaultValue);
    this.channel = loadChannel() ?? 0;
  }

  async init(): Promise<void> {
    try {
      await this.transport.init();
      this.status = "ready";
    } catch (err) {
      this.status =
        err instanceof Error && /not supported/i.test(err.message) ? "unsupported" : "denied";
      this.statusMessage = err instanceof Error ? err.message : String(err);
    }
    this.transport.onMessage((data) => this.handleIncoming(data));
    this.transport.onPortsChanged(() => this.emit());
    this.emit();
  }

  private handleIncoming(data: Uint8Array): void {
    if (data.length < 3) return;
    const status = data[0] & 0xf0;
    const ch = data[0] & 0x0f;
    if (status === 0xb0 && ch === this.channel) {
      const cc = data[1];
      const value = data[2];
      if (PARAMS_BY_CC.has(cc)) {
        this.values.set(cc, value);
        this.lastIncoming = `CC ${cc} = ${value}`;
        this.emit();
      }
    }
  }

  getValue(cc: number): number {
    return this.values.get(cc) ?? 0;
  }

  /** Set from the UI: updates state and transmits to the synth. */
  setValue(cc: number, value: number): void {
    const clamped = Math.max(0, Math.min(127, Math.round(value)));
    if (this.values.get(cc) === clamped) return;
    this.values.set(cc, clamped);
    this.transport.send([0xb0 | this.channel, cc, clamped]);
    this.emit();
  }

  setChannel(channel: number): void {
    this.channel = channel;
    storeChannel(channel);
    this.emit();
  }

  selectInput(id: string | null): void {
    this.transport.selectInput(id);
    this.emit();
  }

  selectOutput(id: string | null): void {
    this.transport.selectOutput(id);
    this.emit();
  }

  inputs(): PortInfo[] {
    return this.transport.inputs();
  }

  outputs(): PortInfo[] {
    return this.transport.outputs();
  }

  noteOn(note: number, velocity = 100): void {
    this.transport.send([0x90 | this.channel, note & 0x7f, velocity & 0x7f]);
  }

  noteOff(note: number): void {
    this.transport.send([0x80 | this.channel, note & 0x7f, 0]);
  }

  /** Transmit every parameter's current value to the synth. */
  sendAll(): void {
    for (const p of ALL_PARAMS) {
      this.transport.send([0xb0 | this.channel, p.cc, this.getValue(p.cc)]);
    }
  }

  resetToInit(): void {
    for (const p of ALL_PARAMS) this.values.set(p.cc, p.defaultValue);
    this.sendAll();
    this.emit();
  }

  /** Init defaults overlaid with the preset's values, transmitted in full. */
  applyPreset(preset: Preset): void {
    for (const p of ALL_PARAMS) {
      this.values.set(p.cc, preset.values[p.cc] ?? p.defaultValue);
    }
    this.sendAll();
    this.emit();
  }

  /** All-sound-off + all-notes-off on the active channel. */
  panic(): void {
    this.transport.send([0xb0 | this.channel, 120, 0]);
    this.transport.send([0xb0 | this.channel, 123, 0]);
  }

  // ----- Patch library -----

  listPatches(): Patch[] {
    return loadPatches();
  }

  savePatch(name: string): void {
    const values: Record<string, number> = {};
    for (const p of ALL_PARAMS) values[p.cc] = this.getValue(p.cc);
    const patches = loadPatches().filter((p) => p.name !== name);
    patches.unshift({ name, savedAt: new Date().toISOString(), values });
    storePatches(patches);
    this.emit();
  }

  loadPatch(patch: Patch): void {
    for (const [cc, value] of Object.entries(patch.values)) {
      const n = Number(cc);
      if (PARAMS_BY_CC.has(n)) this.values.set(n, value);
    }
    this.sendAll();
    this.emit();
  }

  deletePatch(name: string): void {
    storePatches(loadPatches().filter((p) => p.name !== name));
    this.emit();
  }

  importPatches(json: string): number {
    const valid = parsePatchJson(json);
    const existing = loadPatches().filter((e) => !valid.some((v) => v.name === e.name));
    storePatches([...valid, ...existing]);
    this.emit();
    return valid.length;
  }

  exportPatches(): string {
    return JSON.stringify(loadPatches(), null, 2);
  }

  // ----- subscription -----

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = (): Record<string, unknown> => {
    if (!this.snapshotCache) {
      this.snapshotCache = {
        values: Object.fromEntries(this.values),
        status: this.status,
        channel: this.channel,
        lastIncoming: this.lastIncoming
      };
    }
    return this.snapshotCache;
  };

  private emit(): void {
    this.snapshotCache = null;
    this.listeners.forEach((l) => l());
  }
}
