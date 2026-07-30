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
import { PublishDialog } from "./publish-dialog";
import { validateForPublish } from "./publish-validation";

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
}: VisualEditorWorkspaceProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const { links, patchLink, applyOrder, createBlock, handleDuplicate, handleDelete } = linksManager;

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
    if (created) setSelectedId(created.id);
  }

  async function handleDuplicateBlock(link: LinkItem) {
    await withSaveIndicator(() => handleDuplicate(link));
  }

  async function handleDeleteBlock(link: LinkItem) {
    if (selectedId === link.id) setSelectedId(null);
    await withSaveIndicator(() => handleDelete(link));
  }

  const issues = useMemo(() => validateForPublish(profile, links), [profile, links]);
  const selectedLink = links.find((l) => l.id === selectedId) ?? null;

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
      />

      <div className="grid flex-1 grid-cols-[220px_1fr_320px] overflow-hidden">
        {!previewMode && <BlockLibraryPanel onAddBlock={handleAddBlock} />}

        <div
          className={previewMode ? "col-span-3 overflow-y-auto bg-black/20" : "overflow-y-auto bg-black/20"}
          onClick={() => setSelectedId(null)}
        >
          <div className="mx-auto py-6" style={{ maxWidth: DEVICE_MAX_WIDTH[device] }}>
            <div className="overflow-hidden rounded-2xl border border-border-subtle" onClick={(e) => e.stopPropagation()}>
              <Canvas
                profile={profile}
                appearance={appearance}
                links={links}
                selectedId={selectedId}
                onSelect={setSelectedId}
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
                selectedId={selectedId}
                onSelect={setSelectedId}
                onToggleVisibility={handleToggleVisibility}
                onToggleLock={handleToggleLock}
                onReorder={handleReorder}
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              <InspectorPanel
                link={selectedLink}
                onClose={() => setSelectedId(null)}
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
    </div>
  );
}
