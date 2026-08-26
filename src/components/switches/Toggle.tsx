import { Param } from "../../domain";

export interface SwitchProps {
  param: Param;
  value: number;
  onChange: (value: number) => void;
}

/** Illuminated on/off button, Moog panel style. */
export function Toggle({ param, value, onChange }: SwitchProps) {
  const on = value >= 64;
  return (
    <div className="control toggle" title={param.description ?? param.name}>
      <button
        type="button"
        className={on ? "toggle-btn on" : "toggle-btn"}
        aria-pressed={on}
        onClick={() => onChange(on ? 0 : 127)}
      >
        <span className="led" />
      </button>
      <span className="control-label">{param.name}</span>
    </div>
  );
}
