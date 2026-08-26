export type ParamKind = "knob" | "toggle" | "enum";

export interface EnumOption {
  label: string;
  /** Inclusive incoming-value range that maps to this option. */
  min: number;
  max: number;
}

export interface Param {
  cc: number;
  name: string;
  kind: ParamKind;
  /** Bipolar knobs render a center detent and display -64..+63. */
  bipolar?: boolean;
  options?: EnumOption[];
  defaultValue: number;
  description?: string;
}

export interface Section {
  title: string;
  /** Silkscreen subtitle under the title, e.g. the filters' mode legends. */
  subtitle?: string;
  params: Param[];
}
