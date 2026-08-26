import { useStore } from "../state/store";

export function MidiToolbar() {
  const store = useStore();
  const inputs = store.inputs();
  const outputs = store.outputs();
  const isJuce = store.transport.kind === "juce";

  return (
    <div className="midi-toolbar">
      <div className="brand">
        <span className="brand-moog">MUSE</span>
        <span className="brand-sub">MIDI Control Panel</span>
      </div>

      {store.status === "unsupported" && (
        <span className="midi-warning">{store.statusMessage}</span>
      )}
      {store.status === "denied" && (
        <span className="midi-warning">MIDI access was denied — reload and allow MIDI.</span>
      )}

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

      {store.lastIncoming && <span className="midi-activity">⇠ {store.lastIncoming}</span>}
    </div>
  );
}
