import { Param, Section } from "../../domain";
import { useStore } from "../../state";
import { Knob } from "../knob";
import { HSlider, VSlider } from "../slider";
import { EnumControl, Toggle } from "../switches";
import {
  ACCENT_CCS,
  BIG_KNOB_CCS,
  COMPACT_SECTIONS,
  DENSE_SECTIONS,
  SLIDER_SECTIONS
} from "./rows";

interface ControlProps {
  param: Param;
  sliders?: "v" | "h";
  knobSize: number;
}

function Control({ param, sliders, knobSize }: ControlProps) {
  const store = useStore();
  const value = store.getValue(param.cc);
  const onChange = (v: number) => store.setValue(param.cc, v);
  if (param.kind === "knob") {
    if (sliders === "h") return <HSlider param={param} value={value} onChange={onChange} />;
    if (sliders === "v") return <VSlider param={param} value={value} onChange={onChange} />;
    const big = BIG_KNOB_CCS.has(param.cc);
    return (
      <Knob
        param={param}
        value={value}
        onChange={onChange}
        size={big ? 96 : knobSize}
        className={big ? "lead" : undefined}
      />
    );
  }
  if (param.kind === "toggle") {
    return (
      <Toggle param={param} value={value} onChange={onChange} accent={ACCENT_CCS[param.cc]} />
    );
  }
  return <EnumControl param={param} value={value} onChange={onChange} />;
}

export function PanelSection({ section }: { section: Section }) {
  const sliders = SLIDER_SECTIONS[section.title];
  const dense = DENSE_SECTIONS.has(section.title);
  const compact = COMPACT_SECTIONS.has(section.title);
  const knobSize = dense ? 46 : compact ? 58 : 68;
  const classes = [
    "panel-section",
    sliders === "h" ? "sliders-h" : "",
    sliders === "v" ? "sliders-v" : "",
    dense ? "dense" : "",
    compact ? "compact" : ""
  ]
    .filter(Boolean)
    .join(" ");
  // vertical fader banks lay out one column per fader (4 in the envelopes,
  // 6 in the MIX block), like the hardware
  const faderCount =
    sliders === "v" ? section.params.filter((p) => p.kind === "knob").length : 0;
  return (
    <section className={classes}>
      <h2>{section.title}</h2>
      {section.subtitle && <div className="section-sub">{section.subtitle}</div>}
      <div
        className="section-controls"
        style={
          faderCount
            ? { gridTemplateColumns: `repeat(${faderCount}, minmax(0, 1fr))` }
            : undefined
        }
      >
        {section.params.map((p) => (
          <Control key={p.cc} param={p} sliders={sliders} knobSize={knobSize} />
        ))}
      </div>
    </section>
  );
}
