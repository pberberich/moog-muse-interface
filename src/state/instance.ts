import { createTransport } from "../midi";
import { MuseStore } from "./museStore";

/** The app-wide store singleton. Tests construct their own MuseStore instead. */
export const store = new MuseStore(createTransport());
