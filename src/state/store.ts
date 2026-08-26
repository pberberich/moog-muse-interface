import { useSyncExternalStore } from "react";
import { ALL_PARAMS, PARAMS_BY_CC } from "../domain/params";
import { createTransport, MidiTransport, PortInfo } from "../midi/transport";

export interface Patch {
  name: string;
  savedAt: string;
  values: Record<string, number>;
}

const STORAGE_KEY = "muse-patches-v1";
const CHANNEL_KEY = "muse-midi-channel";

export type MidiStatus = "idle" | "ready" | "unsupported" | "denied";

class MuseStore {
  readonly transport: MidiTransport = createTransport();
  private values = new Map<number, number>();
  private listeners = new Set<() => void>();
  private snapshotCache: Record<string, unknown> | null = null;

  status: MidiStatus = "idle";
  statusMessage = "";
  channel = 0; // 0-based (displayed as 1-16)
  lastIncoming = "";

  constructor() {
    for (const p of ALL_PARAMS) this.values.set(p.cc, p.defaultValue);
    const savedChannel = Number(localStorage.getItem(CHANNEL_KEY));
    if (savedChannel >= 0 && savedChannel <= 15) this.channel = savedChannel;
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
    localStorage.setItem(CHANNEL_KEY, String(channel));
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

  // ----- Patch library (localStorage) -----

  listPatches(): Patch[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as Patch[];
    } catch {
      return [];
    }
  }

  savePatch(name: string): void {
    const values: Record<string, number> = {};
    for (const p of ALL_PARAMS) values[p.cc] = this.getValue(p.cc);
    const patches = this.listPatches().filter((p) => p.name !== name);
    patches.unshift({ name, savedAt: new Date().toISOString(), values });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patches));
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
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(this.listPatches().filter((p) => p.name !== name))
    );
    this.emit();
  }

  importPatches(json: string): number {
    const incoming = JSON.parse(json) as Patch | Patch[];
    const list = Array.isArray(incoming) ? incoming : [incoming];
    const valid = list.filter((p) => p && typeof p.name === "string" && p.values);
    const existing = this.listPatches().filter((e) => !valid.some((v) => v.name === e.name));
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...valid, ...existing]));
    this.emit();
    return valid.length;
  }

  exportPatches(): string {
    return JSON.stringify(this.listPatches(), null, 2);
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

export const store = new MuseStore();

/** Re-render the calling component whenever the store changes. */
export function useStore(): MuseStore {
  useSyncExternalStore(store.subscribe, store.getSnapshot);
  return store;
}
