import { Param, Section } from "../../domain";
import { useStore } from "../../state";
import { Knob } from "../knob";
import { EnumControl, Toggle } from "../switches";

function Control({ param }: { param: Param }) {
  const store = useStore();
  const value = store.getValue(param.cc);
  const onChange = (v: number) => store.setValue(param.cc, v);
  if (param.kind === "knob") return <Knob param={param} value={value} onChange={onChange} />;
  if (param.kind === "toggle") return <Toggle param={param} value={value} onChange={onChange} />;
  return <EnumControl param={param} value={value} onChange={onChange} />;
}

export function PanelSection({ section }: { section: Section }) {
  return (
    <section className="panel-section">
      <h2>{section.title}</h2>
      <div className="section-controls">
        {section.params.map((p) => (
          <Control key={p.cc} param={p} />
        ))}
      </div>
    </section>
  );
}
