import { EnumOption, Param } from "./types";

/** Value to transmit when the user picks an enum option (midpoint of its range). */
export function optionSendValue(opt: EnumOption): number {
  return Math.floor((opt.min + opt.max) / 2);
}

/** Which option an incoming 0-127 value falls into. */
export function optionForValue(param: Param, value: number): EnumOption | undefined {
  return param.options?.find((o) => value >= o.min && value <= o.max);
}

export function formatValue(param: Param, value: number): string {
  if (param.options) return optionForValue(param, value)?.label ?? String(value);
  if (param.bipolar) {
    const v = value - 64;
    return v > 0 ? `+${v}` : String(v);
  }
  return String(value);
}
