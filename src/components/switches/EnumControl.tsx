import { optionForValue, optionSendValue } from "../../domain";
import { SwitchProps } from "./Toggle";

/** Hardware-style LED ladder selector (waveforms, octaves, filter order…). */
export function EnumControl({ param, value, onChange }: SwitchProps) {
  const active = optionForValue(param, value);
  return (
    <div className="control enum" title={param.description ?? param.name}>
      <span className="control-label">{param.name}</span>
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
            <span className="enum-led" />
            <span className="enum-text">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
