"use client";

import { useMemo, useState } from "react";
import { getBlockDefinition } from "@/components/blocks/registry";
import type { BlockKind, BlockStyleOverrides } from "@/components/blocks/types";
import type { LinkItem } from "@/types/link";
import type { AppearanceData, ProfileData } from "@/types/profile";
import type { DeviceId } from "@/components/admin/design-editor";
import type { useLinksManager } from "@/components/admin/use-links-manager";
import { useEditorHistory } from "@/components/admin/use-editor-history";
import { BlockLibraryPanel } from "./block-library-panel";
import { Canvas } from "./canvas";
import { InspectorPanel } from "./inspector-panel";
import { LayersPanel } from "./layers-panel";
import { EditorTopBar, type SaveState } from "./editor-top-bar";
import { AiEditorDialog } from "./ai-editor-dialog";
import { PageVersionsDialog } from "./page-versions-dialog";
import { PublishDialog } from "./publish-dialog";
import { SelectionToolbar } from "./selection-toolbar";
import { validateForPublish } from "./publish-validation";

function isLocked(link: LinkItem) {
  return (link.styleOverrides as BlockStyleOverrides | null)?.locked ?? false;
}

const DEVICE_MAX_WIDTH: Record<DeviceId, number> = {
  mobile: 420,
  tablet: 680,
  desktop: 960,
};

interface VisualEditorWorkspaceProps {
  profile: ProfileData;
  appearance: AppearanceData;
  linksManager: ReturnType<typeof useLinksManager>;
  device: DeviceId;
  onDeviceChange: (device: DeviceId) => void;
  onPublish: () => Promise<boolean>;
  onViewMessages: (link: LinkItem) => void;
  onProfileChange: (patch: Partial<ProfileData>) => void;
}

/**
 * The "Editor Visual" tab's whole surface (see design-system/architecture/
 * visual-editor.md). Composes the 4 areas the spec asked for — Block
 * Library (left), Canvas (center), Inspector (right), and this top bar —
 * around the same `useLinksManager` CRUD hook every other block UI in the
 * app already uses, so add/edit/delete/reorder behave identically
 * everywhere; this file only adds the new *interaction* layer on top
 * (selection, undo/redo, publish validation).
 */
export function VisualEditorWorkspace({
  profile,
  appearance,
  linksManager,
  device,
  onDeviceChange,
  onPublish,
  onViewMessages,
  onProfileChange,
}: VisualEditorWorkspaceProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionAnchor, setSelectionAnchor] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [versionsDialogOpen, setVersionsDialogOpen] = useState(false);
  const [aiEditorDialogOpen, setAiEditorDialogOpen] = useState(false);

  const {
    links,
    patchLink,
    applyOrder,
    replaceAll,
    createBlock,
    handleDuplicate,
    handleDelete,
    handleBulkDelete,
    handleBulkDuplicate,
    handleBulkSetActive,
  } = linksManager;

  function handleVersionRestored(restoredLinks: LinkItem[]) {
    replaceAll(restoredLinks);
    clearSelection();
  }

  function handleAiApplied(result: { links: LinkItem[]; profile: Partial<ProfileData> }) {
    replaceAll(result.links);
    if (Object.keys(result.profile).length > 0) onProfileChange(result.profile);
    clearSelection();
  }

  function clearSelection() {
    setSelectedIds([]);
    setSelectionAnchor(null);
  }

  /** Plain click replaces the selection; Ctrl/Cmd+click toggles one block
   * in or out of it; Shift+click extends it to every block between the
   * last-clicked one and this one, in canvas order — the same modifier
   * scheme as most direct-manipulation editors (Figma, Photoshop). */
  function handleSelect(id: string, e: React.MouseEvent) {
    if (e.shiftKey && selectionAnchor) {
      const ids = links.map((l) => l.id);
      const anchorIndex = ids.indexOf(selectionAnchor);
      const targetIndex = ids.indexOf(id);
      if (anchorIndex !== -1 && targetIndex !== -1) {
        const [start, end] = anchorIndex < targetIndex ? [anchorIndex, targetIndex] : [targetIndex, anchorIndex];
        setSelectedIds(ids.slice(start, end + 1));
        return;
      }
    }
    if (e.metaKey || e.ctrlKey) {
      setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
      setSelectionAnchor(id);
      return;
    }
    setSelectedIds([id]);
    setSelectionAnchor(id);
  }

  async function withSaveIndicator<T>(fn: () => Promise<T>): Promise<T> {
    setSaveState("saving");
    try {
      return await fn();
    } finally {
      setSaveState("saved");
    }
  }

  const history = useEditorHistory({
    applyPatch: (id, patch) => withSaveIndicator(() => patchLink(id, patch)),
    applyReorder: (order) => withSaveIndicator(() => applyOrder(order)),
  });

  function handleInspectorPatch(linkId: string, patch: Record<string, unknown>, before: Record<string, unknown>) {
    history.recordUpdate(linkId, before, patch);
    void withSaveIndicator(() => patchLink(linkId, patch));
  }

  function handleToggleVisibility(link: LinkItem) {
    history.recordUpdate(link.id, { isActive: link.isActive }, { isActive: !link.isActive });
    void withSaveIndicator(() => patchLink(link.id, { isActive: !link.isActive }));
  }

  function handleToggleLock(link: LinkItem) {
    const styleOverrides = (link.styleOverrides ?? {}) as BlockStyleOverrides;
    const locked = !(styleOverrides.locked ?? false);
    // Not recorded in history — see use-editor-history.ts: lock is a
    // purely editor-side convenience, not content, so cluttering the undo
    // stack with it isn't worth it.
    void withSaveIndicator(() => patchLink(link.id, { styleOverrides: { ...styleOverrides, locked } }));
  }

  function handleReorder(reordered: LinkItem[]) {
    history.recordReorder(links, reordered);
    void withSaveIndicator(() => applyOrder(reordered));
  }

  async function handleAddBlock(kind: BlockKind) {
    const definition = getBlockDefinition(kind);
    if (!definition) return;
    const created = await withSaveIndicator(() =>
      createBlock(kind, { title: definition.label, metadata: definition.defaultMeta }),
    );
    if (created) setSelectedIds([created.id]);
  }

  async function handleDuplicateBlock(link: LinkItem) {
    await withSaveIndicator(() => handleDuplicate(link));
  }

  async function handleDeleteBlock(link: LinkItem) {
    setSelectedIds((prev) => prev.filter((id) => id !== link.id));
    await withSaveIndicator(() => handleDelete(link));
  }

  const selectedBlocks = useMemo(
    () => links.filter((l) => selectedIds.includes(l.id)),
    [links, selectedIds],
  );
  const duplicableSelection = useMemo(() => selectedBlocks.filter((l) => !isLocked(l)), [selectedBlocks]);
  const deletableSelection = duplicableSelection;

  async function handleBulkDuplicateBlocks() {
    if (duplicableSelection.length === 0) return;
    const created = await withSaveIndicator(() => handleBulkDuplicate(duplicableSelection));
    if (created.length > 0) setSelectedIds(created.map((l) => l.id));
  }

  async function handleBulkDeleteBlocks() {
    if (deletableSelection.length === 0) return;
    clearSelection();
    await withSaveIndicator(() => handleBulkDelete(deletableSelection));
  }

  async function handleBulkSetVisibility(isActive: boolean) {
    if (selectedBlocks.length === 0) return;
    history.recordBatch(
      selectedBlocks.map((link) => ({
        linkId: link.id,
        before: { isActive: link.isActive },
        after: { isActive },
      })),
    );
    await withSaveIndicator(() => handleBulkSetActive(selectedBlocks, isActive));
  }

  const issues = useMemo(() => validateForPublish(profile, links), [profile, links]);
  const selectedLink = selectedIds.length === 1 ? (links.find((l) => l.id === selectedIds[0]) ?? null) : null;

  async function handleConfirmPublish() {
    setPublishing(true);
    try {
      const success = await onPublish();
      if (success) setPublishDialogOpen(false);
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="flex h-full min-h-[640px] flex-col overflow-hidden">
      <EditorTopBar
        projectName={profile.displayName || profile.username}
        saveState={saveState}
        canUndo={history.canUndo}
        canRedo={history.canRedo}
        onUndo={history.undo}
        onRedo={history.redo}
        historySize={history.historySize}
        device={device}
        onDeviceChange={onDeviceChange}
        previewMode={previewMode}
        onTogglePreview={() => setPreviewMode((v) => !v)}
        isPublished={profile.isPublished}
        publicPath={`/${profile.username}`}
        onPublish={() => setPublishDialogOpen(true)}
        publishing={publishing}
        onOpenVersions={() => setVersionsDialogOpen(true)}
        onOpenAiEditor={() => setAiEditorDialogOpen(true)}
      />

      <div className="grid flex-1 grid-cols-[220px_1fr_320px] overflow-hidden">
        {!previewMode && <BlockLibraryPanel onAddBlock={handleAddBlock} />}

        <div
          className={previewMode ? "col-span-3 overflow-y-auto bg-black/20" : "overflow-y-auto bg-black/20"}
          onClick={clearSelection}
        >
          <div className="mx-auto py-6" style={{ maxWidth: DEVICE_MAX_WIDTH[device] }}>
            {!previewMode && selectedIds.length > 1 && (
              <div onClick={(e) => e.stopPropagation()}>
                <SelectionToolbar
                  count={selectedIds.length}
                  duplicableCount={duplicableSelection.length}
                  deletableCount={deletableSelection.length}
                  onDuplicate={() => void handleBulkDuplicateBlocks()}
                  onHide={() => void handleBulkSetVisibility(false)}
                  onShow={() => void handleBulkSetVisibility(true)}
                  onDelete={() => void handleBulkDeleteBlocks()}
                  onClear={clearSelection}
                />
              </div>
            )}
            <div className="overflow-hidden rounded-2xl border border-border-subtle" onClick={(e) => e.stopPropagation()}>
              <Canvas
                profile={profile}
                appearance={appearance}
                links={links}
                selectedIds={selectedIds}
                onSelect={handleSelect}
                onDuplicate={handleDuplicateBlock}
                onDelete={handleDeleteBlock}
                onToggleVisibility={handleToggleVisibility}
                onReorder={handleReorder}
                previewMode={previewMode}
                device={device}
              />
            </div>
          </div>
        </div>

        {!previewMode && (
          <div className="flex flex-col overflow-hidden border-l border-border-subtle">
            <div className="max-h-[45%] overflow-y-auto border-b border-border-subtle">
              <LayersPanel
                links={links}
                selectedIds={selectedIds}
                onSelect={handleSelect}
                onToggleVisibility={handleToggleVisibility}
                onToggleLock={handleToggleLock}
                onReorder={handleReorder}
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              <InspectorPanel
                link={selectedLink}
                selectionCount={selectedIds.length}
                onClose={clearSelection}
                onPatch={handleInspectorPatch}
                onViewMessages={onViewMessages}
              />
            </div>
          </div>
        )}
      </div>

      <PublishDialog
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
        issues={issues}
        onConfirm={handleConfirmPublish}
        publishing={publishing}
        isPublished={profile.isPublished}
      />

      <PageVersionsDialog
        open={versionsDialogOpen}
        onOpenChange={setVersionsDialogOpen}
        currentBlockCount={links.length}
        onRestored={handleVersionRestored}
      />

      <AiEditorDialog
        open={aiEditorDialogOpen}
        onOpenChange={setAiEditorDialogOpen}
        links={links}
        onApplied={handleAiApplied}
      />
    </div>
  );
}
