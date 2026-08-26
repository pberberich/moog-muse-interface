import { useEffect } from "react";
import { Keyboard, MidiToolbar, Stage } from "./components";
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
          <Stage />
          <Keyboard />
        </div>
        <div className="cheek right" />
      </div>
    </div>
  );
}
