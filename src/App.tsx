import { useEffect } from "react";
import { SECTIONS } from "./domain/params";
import { store } from "./state/store";
import { Keyboard } from "./components/Keyboard";
import { MidiToolbar } from "./components/MidiToolbar";
import { PanelSection } from "./components/Panel";
import { PatchLibrary } from "./components/PatchLibrary";

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
