import { Param, Section } from "../../domain";
import { useStore } from "../../state";
import { Knob } from "../knob";
import { HSlider } from "../slider";
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
  sliders?: "h";
  knobSize: number;
}

function Control({ param, sliders, knobSize }: ControlProps) {
  const store = useStore();
  const value = store.getValue(param.cc);
  const onChange = (v: number) => store.setValue(param.cc, v);
  if (param.kind === "knob") {
    if (sliders === "h") return <HSlider param={param} value={value} onChange={onChange} />;
    const big = BIG_KNOB_CCS.has(param.cc);
    return (
      <Knob
        param={param}
        value={value}
        onChange={onChange}
        size={big ? 88 : knobSize}
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
  const knobSize = dense ? 40 : compact ? 52 : 60;
  const classes = [
    "panel-section",
    sliders ? "sliders-h" : "",
    dense ? "dense" : "",
    compact ? "compact" : ""
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <section className={classes}>
      <h2>{section.title}</h2>
      <div className="section-controls">
        {section.params.map((p) => (
          <Control key={p.cc} param={p} sliders={sliders} knobSize={knobSize} />
        ))}
      </div>
    </section>
  );
}
