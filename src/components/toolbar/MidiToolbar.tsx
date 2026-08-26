import { useStore } from "../../state";

export function MidiToolbar() {
  const store = useStore();
  const inputs = store.inputs();
  const outputs = store.outputs();
  const isJuce = store.transport.kind === "juce";

  return (
    <div className="midi-toolbar">
      {/* the top rail carries the big moog script, like the hardware's back panel */}
      <span className="moog-script" aria-hidden="true">
        moog
      </span>

      {store.status === "unsupported" && (
        <span className="midi-warning">{store.statusMessage}</span>
      )}
      {store.status === "denied" && (
        <span className="midi-warning">MIDI access was denied — reload and allow MIDI.</span>
      )}

      <div className="toolbar-controls">
      {store.status === "ready" && !isJuce && (
        <>
          <label>
            In
            <select
              value={store.transport.selectedInput() ?? ""}
              onChange={(e) => store.selectInput(e.target.value || null)}
            >
              <option value="">— none —</option>
              {inputs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Out
            <select
              value={store.transport.selectedOutput() ?? ""}
              onChange={(e) => store.selectOutput(e.target.value || null)}
            >
              <option value="">— none —</option>
              {outputs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        </>
      )}

      {isJuce && <span className="midi-ok">MIDI via plugin host</span>}

      <label>
        Ch
        <select value={store.channel} onChange={(e) => store.setChannel(Number(e.target.value))}>
          {Array.from({ length: 16 }, (_, i) => (
            <option key={i} value={i}>
              {i + 1}
            </option>
          ))}
        </select>
      </label>

      <button type="button" onClick={() => store.sendAll()} title="Transmit every parameter to the Muse">
        Send all
      </button>
      <button type="button" onClick={() => store.resetToInit()} title="Reset panel to the init patch and transmit it">
        Init
      </button>
      <button
        type="button"
        onClick={() => store.swapCompare()}
        title="Swap between two edit buffers (hardware-style compare)"
      >
        A/B
      </button>
      <button
        type="button"
        className="panic-btn"
        onClick={() => store.panic()}
        title="All sound off + all notes off (CC 120/123)"
      >
        Panic
      </button>

      {store.lastIncoming && <span className="midi-activity">⇠ {store.lastIncoming}</span>}
      </div>
    </div>
  );
}
