export interface Patch {
  name: string;
  savedAt: string;
  values: Record<string, number>;
}

export const PATCHES_KEY = "muse-patches-v1";
export const CHANNEL_KEY = "muse-midi-channel";

export function loadPatches(): Patch[] {
  try {
    return JSON.parse(localStorage.getItem(PATCHES_KEY) ?? "[]") as Patch[];
  } catch {
    return [];
  }
}

export function storePatches(patches: Patch[]): void {
  localStorage.setItem(PATCHES_KEY, JSON.stringify(patches));
}

export function loadChannel(): number | null {
  const raw = localStorage.getItem(CHANNEL_KEY);
  if (raw === null) return null;
  const channel = Number(raw);
  return Number.isInteger(channel) && channel >= 0 && channel <= 15 ? channel : null;
}

export function storeChannel(channel: number): void {
  localStorage.setItem(CHANNEL_KEY, String(channel));
}

/** Parse a JSON export (single patch or array) into valid patches. */
export function parsePatchJson(json: string): Patch[] {
  const incoming = JSON.parse(json) as Patch | Patch[];
  const list = Array.isArray(incoming) ? incoming : [incoming];
  return list.filter((p) => p && typeof p.name === "string" && typeof p.values === "object");
}
