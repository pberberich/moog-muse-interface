import { Param } from "../../domain";

export interface SwitchProps {
  param: Param;
  value: number;
  onChange: (value: number) => void;
}

/** Backlit rectangular panel button, Muse style: glows amber when engaged. */
export function Toggle({ param, value, onChange }: SwitchProps) {
  const on = value >= 64;
  return (
    <div className="control toggle" title={param.description ?? param.name}>
      <span className="control-label">{param.name}</span>
      <button
        type="button"
        className={on ? "toggle-btn on" : "toggle-btn"}
        aria-pressed={on}
        onClick={() => onChange(on ? 0 : 127)}
      >
        <span className="toggle-lens" />
      </button>
    </div>
  );
}
