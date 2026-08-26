import { optionForValue, optionSendValue, Param } from "../domain/params";

interface SwitchProps {
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

/** Segmented selector for multi-position switches (waveforms, octaves…). */
export function EnumControl({ param, value, onChange }: SwitchProps) {
  const active = optionForValue(param, value);
  return (
    <div className="control enum" title={param.description ?? param.name}>
      <div className="enum-options" role="radiogroup" aria-label={param.name}>
        {param.options!.map((opt) => (
          <button
            key={opt.label}
            type="button"
            role="radio"
            aria-checked={opt === active}
            className={opt === active ? "enum-btn active" : "enum-btn"}
            onClick={() => onChange(optionSendValue(opt))}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <span className="control-label">{param.name}</span>
    </div>
  );
}
