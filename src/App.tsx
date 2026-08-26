import { useEffect } from "react";
import { Keyboard, MidiToolbar, PanelSection, PatchLibrary } from "./components";
import { SECTIONS } from "./domain";
import { store } from "./state";

export default function App() {
  useEffect(() => {
    store.init();
  }, []);

  return (
    <div className="app">
      <MidiToolbar />
      <div className="app-body">
        <main className="panel">
          {SECTIONS.map((s) => (
            <PanelSection key={s.title} section={s} />
          ))}
        </main>
        <PatchLibrary />
      </div>
      <Keyboard />
    </div>
  );
}
