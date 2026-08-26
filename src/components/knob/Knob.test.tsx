import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { bipolarKnob, knob } from "../../domain";
import { Knob } from "./Knob";

afterEach(cleanup);

describe("Knob", () => {
  it("exposes its value as an accessible slider", () => {
    render(<Knob param={knob(67, "Cutoff")} value={96} onChange={() => {}} />);
    const slider = screen.getByRole("slider", { name: "Cutoff" });
    expect(slider.getAttribute("aria-valuenow")).toBe("96");
    expect(slider.getAttribute("aria-valuemax")).toBe("127");
  });

  it("steps with arrow keys (fine steps with shift)", () => {
    const onChange = vi.fn();
    render(<Knob param={knob(67, "Cutoff")} value={50} onChange={onChange} />);
    const slider = screen.getByRole("slider", { name: "Cutoff" });

    fireEvent.keyDown(slider, { key: "ArrowUp" });
    expect(onChange).toHaveBeenLastCalledWith(54);

    fireEvent.keyDown(slider, { key: "ArrowDown", shiftKey: true });
    expect(onChange).toHaveBeenLastCalledWith(49);

    fireEvent.keyDown(slider, { key: "End" });
    expect(onChange).toHaveBeenLastCalledWith(127);
  });

  it("resets to the default on double click", () => {
    const onChange = vi.fn();
    render(<Knob param={bipolarKnob(10, "Pan")} value={20} onChange={onChange} />);
    fireEvent.dblClick(screen.getByRole("slider", { name: "Pan" }));
    expect(onChange).toHaveBeenCalledWith(64);
  });

  it("renders bipolar values as signed offsets", () => {
    render(<Knob param={bipolarKnob(10, "Pan")} value={70} onChange={() => {}} />);
    expect(screen.getByText("+6")).toBeTruthy();
  });
});
