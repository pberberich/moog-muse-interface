import { useEffect } from "react";
import {
  Keyboard,
  MidiToolbar,
  PANEL_COLUMNS,
  PanelGroup,
  PanelSection,
  PatchLibrary,
  sectionByTitle
} from "./components";
import { store } from "./state";

function BrandPlate() {
  return (
    <div className="brand-plate">
      <span className="brand-plate-name">MUSE</span>
      <span className="brand-plate-tag">
        8-Voice Polyphonic
        <br />
        Analog Control Panel
      </span>
    </div>
  );
}

function Group({ group }: { group: PanelGroup }) {
  if (group === "@brand") return <BrandPlate />;
  if (Array.isArray(group)) {
    return (
      <div className="section-pair">
        {group.map((title) => {
          const section = sectionByTitle(title);
          return section ? <PanelSection key={title} section={section} /> : null;
        })}
      </div>
    );
  }
  const section = sectionByTitle(group);
  return section ? <PanelSection section={section} /> : null;
}

export default function App() {
  useEffect(() => {
    store.init();
  }, []);

  return (
    <div className="room">
      <div className="rack">
        <div className="cheek left" />
        <div className="faceplate">
          <i className="screw tl" />
          <i className="screw tr" />
          <i className="screw bl" />
          <i className="screw br" />
          <MidiToolbar />
          <main className="panel">
            {PANEL_COLUMNS.map((col, i) => (
              <div className="panel-col" key={i} style={{ gridColumn: `span ${col.span}` }}>
                {col.groups.map((g, j) => (
                  <Group key={j} group={g} />
                ))}
              </div>
            ))}
          </main>
          <PatchLibrary />
          <Keyboard />
        </div>
        <div className="cheek right" />
      </div>
    </div>
  );
}
