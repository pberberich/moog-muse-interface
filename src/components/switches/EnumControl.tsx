import { optionForValue, optionSendValue } from "../../domain";
import { SwitchProps } from "./Toggle";

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
