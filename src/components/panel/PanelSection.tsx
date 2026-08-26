import { Param, Section } from "../../domain";
import { useStore } from "../../state";
import { Knob } from "../knob";
import { HSlider, VSlider } from "../slider";
import { EnumControl, Toggle } from "../switches";
import { BIG_KNOB_CCS, SLIDER_SECTIONS } from "./rows";

function Control({ param, sliders }: { param: Param; sliders?: "v" | "h" }) {
  const store = useStore();
  const value = store.getValue(param.cc);
  const onChange = (v: number) => store.setValue(param.cc, v);
  if (param.kind === "knob") {
    if (sliders === "v") return <VSlider param={param} value={value} onChange={onChange} />;
    if (sliders === "h") return <HSlider param={param} value={value} onChange={onChange} />;
    return (
      <Knob
        param={param}
        value={value}
        onChange={onChange}
        size={BIG_KNOB_CCS.has(param.cc) ? 84 : 64}
      />
    );
  }
  if (param.kind === "toggle") return <Toggle param={param} value={value} onChange={onChange} />;
  return <EnumControl param={param} value={value} onChange={onChange} />;
}

export function PanelSection({ section }: { section: Section }) {
  const sliders = SLIDER_SECTIONS[section.title];
  const classes = ["panel-section", sliders === "v" ? "sliders-v" : "", sliders === "h" ? "sliders-h" : ""]
    .filter(Boolean)
    .join(" ");
  return (
    <section className={classes}>
      <h2>{section.title}</h2>
      <div className="section-controls">
        {section.params.map((p) => (
          <Control key={p.cc} param={p} sliders={sliders} />
        ))}
      </div>
    </section>
  );
}
