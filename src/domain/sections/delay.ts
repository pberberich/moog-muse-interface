import { knob, toggle } from "../builders";
import { Section } from "../types";

export const DELAY: Section = {
  title: "Diffusion Delay",
  params: [
    knob(93, "Time L", 32, "Left delay time"),
    knob(94, "Time R", 32, "Right delay time"),
    toggle(95, "Link", 127, "Link left/right delay times"),
    toggle(102, "Clock Sync", 0, "Sync delay time to the clock"),
    knob(103, "Feedback", 32),
    knob(104, "Character", 0, "Delay tone/character"),
    knob(105, "Mix", 0, "Dry/wet mix"),
    toggle(106, "Timbre A", 127, "Delay on Timbre A"),
    toggle(107, "Timbre B", 127, "Delay on Timbre B")
  ]
};
