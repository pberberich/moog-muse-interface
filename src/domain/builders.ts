import { ONOFF } from "./options";
import { EnumOption, Param } from "./types";

export function knob(cc: number, name: string, defaultValue = 0, description?: string): Param {
  return { cc, name, kind: "knob", defaultValue, description };
}

export function bipolarKnob(cc: number, name: string, description?: string): Param {
  return { cc, name, kind: "knob", bipolar: true, defaultValue: 64, description };
}

export function toggle(cc: number, name: string, defaultValue = 0, description?: string): Param {
  return { cc, name, kind: "toggle", options: ONOFF, defaultValue, description };
}

export function enumParam(
  cc: number,
  name: string,
  options: EnumOption[],
  defaultValue = 0,
  description?: string
): Param {
  return { cc, name, kind: "enum", options, defaultValue, description };
}
