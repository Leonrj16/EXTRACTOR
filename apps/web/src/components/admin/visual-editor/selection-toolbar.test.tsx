import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SelectionToolbar } from "./selection-toolbar";

function setup(overrides: Partial<React.ComponentProps<typeof SelectionToolbar>> = {}) {
  const handlers = {
    onDuplicate: vi.fn(),
    onHide: vi.fn(),
    onShow: vi.fn(),
    onDelete: vi.fn(),
    onClear: vi.fn(),
  };
  render(
    <SelectionToolbar
      count={3}
      duplicableCount={3}
      deletableCount={3}
      {...handlers}
      {...overrides}
    />,
  );
  return handlers;
}

describe("SelectionToolbar", () => {
  it("shows how many blocks are selected", () => {
    setup({ count: 3 });
    expect(screen.getByText("3 seleccionados")).toBeInTheDocument();
  });

  it("calls the matching handler for each action button", () => {
    const handlers = setup();

    fireEvent.click(screen.getByRole("button", { name: /Duplicar/ }));
    expect(handlers.onDuplicate).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: /Ocultar/ }));
    expect(handlers.onHide).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: /Mostrar/ }));
    expect(handlers.onShow).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: /Eliminar/ }));
    expect(handlers.onDelete).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByLabelText("Cerrar selección"));
    expect(handlers.onClear).toHaveBeenCalledTimes(1);
  });

  it("disables Duplicar when none of the selection can be duplicated (all locked)", () => {
    setup({ duplicableCount: 0 });
    expect(screen.getByRole("button", { name: /Duplicar/ })).toBeDisabled();
  });

  it("disables Eliminar when none of the selection can be deleted (all locked)", () => {
    setup({ deletableCount: 0 });
    expect(screen.getByRole("button", { name: /Eliminar/ })).toBeDisabled();
  });

  it("keeps Ocultar/Mostrar enabled even when the whole selection is locked", () => {
    // Visibility toggling isn't gated by `locked` for a single block either
    // (see canvas.tsx) — bulk actions must honor the same rule.
    setup({ duplicableCount: 0, deletableCount: 0 });
    expect(screen.getByRole("button", { name: /Ocultar/ })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: /Mostrar/ })).not.toBeDisabled();
  });
});
