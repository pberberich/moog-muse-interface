import { useSyncExternalStore } from "react";
import { store } from "./instance";
import { MuseStore } from "./museStore";

/** Re-render the calling component whenever the store changes. */
export function useStore(): MuseStore {
  useSyncExternalStore(store.subscribe, store.getSnapshot);
  return store;
}
