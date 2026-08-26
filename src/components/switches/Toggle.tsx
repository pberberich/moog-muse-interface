import { Param } from "../../domain";

export interface SwitchProps {
  param: Param;
  value: number;
  onChange: (value: number) => void;
  /** Colored cap, matching the hardware's accent buttons. */
  accent?: "yellow" | "orange" | "cyan";
}

/**
 * Hardware-style panel button: a small gray (or colored) cap with a separate
 * red LED indicator above it, label printed below.
 */
export function Toggle({ param, value, onChange, accent }: SwitchProps) {
  const on = value >= 64;
  return (
    <div className="control toggle" title={param.description ?? param.name}>
      <span className={on ? "led-dot on" : "led-dot"} />
      <button
        type="button"
        className={accent ? `push-btn accent-${accent}` : "push-btn"}
        aria-pressed={on}
        onClick={() => onChange(on ? 0 : 127)}
      />
      <span className="control-label">{param.name}</span>
    </div>
  );
}
