import { useEffect } from "react";
import { Keyboard, MidiToolbar, PANEL_ROWS, PanelSection, PatchLibrary, rowSections } from "./components";
import { store } from "./state";

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
            {PANEL_ROWS.map((titles, i) => (
              <div className="panel-row" key={i}>
                {rowSections(titles).map((s) => (
                  <PanelSection key={s.title} section={s} />
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
