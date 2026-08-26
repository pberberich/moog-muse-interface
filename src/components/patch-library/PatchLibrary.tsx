import { useRef, useState } from "react";
import { PRESETS } from "../../domain";
import { useStore } from "../../state";

export function PatchLibrary() {
  const store = useStore();
  const [name, setName] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const patches = store.listPatches();

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    store.savePatch(trimmed);
    setName("");
  };

  const exportAll = () => {
    const blob = new Blob([store.exportPatches()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "muse-patches.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFile = async (file: File) => {
    try {
      const count = store.importPatches(await file.text());
      alert(`Imported ${count} patch${count === 1 ? "" : "es"}.`);
    } catch {
      alert("Could not read that file — expected a JSON patch export.");
    }
  };

  return (
    <aside className="patch-library panel-section">
      <h2>Programmer</h2>
      <span className="patch-display" title="Current patch">
        {store.currentPatchName}
      </span>
      <div className="patch-save-row">
        <input
          type="text"
          placeholder="Patch name…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
        />
        <button type="button" onClick={save} disabled={!name.trim()}>
          Save
        </button>
      </div>
      <ul className="patch-list">
        {patches.length === 0 && <li className="patch-empty">No saved patches yet.</li>}
        {patches.map((p) => (
          <li key={p.name}>
            <button
              type="button"
              className="patch-load"
              title={`Saved ${new Date(p.savedAt).toLocaleString()}`}
              onClick={() => store.loadPatch(p)}
            >
              {p.name}
            </button>
            <button
              type="button"
              className="patch-delete"
              aria-label={`Delete ${p.name}`}
              onClick={() => confirm(`Delete patch “${p.name}”?`) && store.deletePatch(p.name)}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <span className="preset-heading">Starter Presets</span>
      <ul className="patch-list">
        {PRESETS.map((p) => (
          <li key={p.name}>
            <button
              type="button"
              className="patch-load"
              title={p.description}
              onClick={() => store.applyPreset(p)}
            >
              {p.name}
            </button>
          </li>
        ))}
      </ul>
      <div className="patch-io">
        <button type="button" onClick={exportAll} disabled={patches.length === 0}>
          Export
        </button>
        <button type="button" onClick={() => fileInput.current?.click()}>
          Import
        </button>
        <input
          ref={fileInput}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importFile(f);
            e.target.value = "";
          }}
        />
      </div>
    </aside>
  );
}
