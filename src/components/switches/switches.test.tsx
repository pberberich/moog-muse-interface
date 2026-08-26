import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { enumParam, toggle } from "../../domain";
import { LFO_WAVES } from "../../domain/options";
import { EnumControl } from "./EnumControl";
import { Toggle } from "./Toggle";

afterEach(cleanup);

describe("Toggle", () => {
  it("turns on with full value and off with zero", () => {
    const onChange = vi.fn();
    const param = toggle(54, "Sync 2→1");

    const { rerender } = render(<Toggle param={param} value={0} onChange={onChange} />);
    const btn = screen.getByRole("button");
    expect(btn.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(btn);
    expect(onChange).toHaveBeenCalledWith(127);

    rerender(<Toggle param={param} value={127} onChange={onChange} />);
    expect(btn.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(btn);
    expect(onChange).toHaveBeenLastCalledWith(0);
  });
});

describe("EnumControl", () => {
  const param = enumParam(14, "Wave", LFO_WAVES);

  it("marks the option matching the current value", () => {
    render(<EnumControl param={param} value={30} onChange={() => {}} />);
    expect(screen.getByRole("radio", { name: "Saw" }).getAttribute("aria-checked")).toBe("true");
    expect(screen.getByRole("radio", { name: "Tri" }).getAttribute("aria-checked")).toBe("false");
  });

  it("sends the midpoint of the clicked option's range", () => {
    const onChange = vi.fn();
    render(<EnumControl param={param} value={0} onChange={onChange} />);
    fireEvent.click(screen.getByRole("radio", { name: "Sqr" })); // 50-74 → 62
    expect(onChange).toHaveBeenCalledWith(62);
  });
});
