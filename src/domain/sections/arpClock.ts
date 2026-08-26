import { enumParam, knob, toggle } from "../builders";
import { ARP_DIRECTION, ARP_OCTAVES } from "../options";
import { Section } from "../types";

export const ARP_CLOCK: Section = {
  title: "Arp / Clock",
  params: [
    toggle(112, "Arp On", 0, "Arpeggiator on/off"),
    enumParam(114, "Direction", ARP_DIRECTION, 0, "Arpeggiator direction mode"),
    toggle(113, "FW/BK", 0, "Arpeggiator forward/backward"),
    enumParam(115, "Octaves", ARP_OCTAVES, 0, "Arpeggiator octave range"),
    knob(111, "Arp Div", 64, "Arpeggiator clock division"),
    knob(110, "Seq Div", 64, "Sequencer clock division"),
    knob(116, "Tempo", 64, "Clock tempo")
  ]
};
