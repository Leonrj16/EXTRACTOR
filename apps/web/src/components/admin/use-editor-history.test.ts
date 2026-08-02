import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { LinkItem } from "@/types/link";
import { useEditorHistory } from "./use-editor-history";

function setup() {
  const applyPatch = vi.fn().mockResolvedValue(undefined);
  const applyReorder = vi.fn().mockResolvedValue(undefined);
  const { result } = renderHook(() => useEditorHistory({ applyPatch, applyReorder }));
  return { result, applyPatch, applyReorder };
}

function makeLink(id: string, order: number): LinkItem {
  return {
    id,
    type: "LINK",
    title: id,
    url: null,
    icon: null,
    imageUrl: null,
    metadata: null,
    styleOverrides: null,
    isActive: true,
    order,
  };
}

describe("useEditorHistory", () => {
  it("starts with nothing to undo or redo", () => {
    const { result } = setup();
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
    expect(result.current.historySize).toBe(0);
  });

  it("undo of a recorded update re-applies the 'before' patch", async () => {
    const { result, applyPatch } = setup();

    act(() => {
      result.current.recordUpdate("link-1", { title: "Old" }, { title: "New" });
    });
    expect(result.current.canUndo).toBe(true);
    expect(result.current.historySize).toBe(1);

    await act(async () => {
      await result.current.undo();
    });
    expect(applyPatch).toHaveBeenCalledWith("link-1", { title: "Old" });
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);
  });

  it("redo after an undo re-applies the 'after' patch", async () => {
    const { result, applyPatch } = setup();

    act(() => {
      result.current.recordUpdate("link-1", { title: "Old" }, { title: "New" });
    });
    await act(async () => {
      await result.current.undo();
    });
    await act(async () => {
      await result.current.redo();
    });

    expect(applyPatch).toHaveBeenLastCalledWith("link-1", { title: "New" });
    expect(result.current.canRedo).toBe(false);
    expect(result.current.canUndo).toBe(true);
  });

  it("recording a new entry clears the redo stack (no branching history)", async () => {
    const { result } = setup();

    act(() => result.current.recordUpdate("link-1", { title: "A" }, { title: "B" }));
    await act(async () => {
      await result.current.undo();
    });
    expect(result.current.canRedo).toBe(true);

    act(() => result.current.recordUpdate("link-2", { title: "X" }, { title: "Y" }));
    expect(result.current.canRedo).toBe(false);
  });

  it("undo of a reorder restores the previous order via applyReorder", async () => {
    const { result, applyReorder } = setup();
    const before = [makeLink("a", 10), makeLink("b", 20)];
    const after = [makeLink("b", 10), makeLink("a", 20)];

    act(() => result.current.recordReorder(before, after));
    await act(async () => {
      await result.current.undo();
    });

    expect(applyReorder).toHaveBeenCalledWith(before);
  });

  it("undo of a batch reverts every entry in the batch, not just one", async () => {
    const { result, applyPatch } = setup();

    act(() => {
      result.current.recordBatch([
        { linkId: "a", before: { isActive: true }, after: { isActive: false } },
        { linkId: "b", before: { isActive: true }, after: { isActive: false } },
      ]);
    });
    // A batch is one history entry, not two — one Ctrl+Z undoes both blocks.
    expect(result.current.historySize).toBe(1);

    await act(async () => {
      await result.current.undo();
    });

    expect(applyPatch).toHaveBeenCalledWith("a", { isActive: true });
    expect(applyPatch).toHaveBeenCalledWith("b", { isActive: true });
    expect(applyPatch).toHaveBeenCalledTimes(2);
  });

  it("recording an empty batch is a no-op (nothing to undo)", () => {
    const { result } = setup();
    act(() => result.current.recordBatch([]));
    expect(result.current.canUndo).toBe(false);
    expect(result.current.historySize).toBe(0);
  });

  it("undo/redo do nothing when the respective stack is empty", async () => {
    const { result, applyPatch, applyReorder } = setup();

    await act(async () => {
      await result.current.undo();
      await result.current.redo();
    });

    expect(applyPatch).not.toHaveBeenCalled();
    expect(applyReorder).not.toHaveBeenCalled();
  });

  it("caps history at 50 entries, dropping the oldest first", () => {
    const { result } = setup();

    act(() => {
      for (let i = 0; i < 55; i++) {
        result.current.recordUpdate(`link-${i}`, { n: i }, { n: i + 1 });
      }
    });

    expect(result.current.historySize).toBe(50);
  });
});
