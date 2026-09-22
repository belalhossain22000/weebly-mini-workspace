"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectFolder, toggleStar } from "@/features/workspace/workspaceSlice";
import {
  getBreadcrumbPath,
  formatBytes,
  formatRelativeTime,
} from "@/features/explorer/explorer.utils";
import { useIsClient } from "@/lib/useIsClient";
import Breadcrumbs from "@/features/explorer/components/Breadcrumbs";
import FileFolderCard from "@/features/explorer/components/FileFolderCard";
import EmptyState from "@/components/shared/EmptyState";
import Button from "@/components/ui/Button";
import { FolderIcon } from "@/components/ui/FileFolderIcon";

function EmptyFolderIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    </svg>
  );
}

function PlusCircleIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

function CreateNewCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-gray-300 p-3 text-gray-400 hover:border-primary-400 hover:text-primary-500 dark:border-gray-700 dark:hover:border-primary-500"
    >
      <PlusCircleIcon />
      <div className="flex flex-col gap-0.5 text-center">
        <p className="text-body-sm font-medium">Create new</p>
        <p className="text-caption">File or folder</p>
      </div>
    </button>
  );
}

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}


type ViewMode = "grid" | "list";

interface MainPanelProps {
  onOpenFile: (fileId: string) => void;
  onCreate: () => void;
  onRename: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
}

export default function MainPanel({
  onOpenFile,
  onCreate,
  onRename,
  onDelete,
}: MainPanelProps) {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector((state) => state.workspace.nodes);
  const selectedFolderId = useAppSelector(
    (state) => state.workspace.selectedFolderId
  );
  const workspace = useAppSelector(
    (state) => state.workspace.workspaces[state.workspace.activeWorkspaceId]
  );
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const isMounted = useIsClient();

  if (!workspace) return null;

  const selectedFolder = nodes[selectedFolderId];
  if (!selectedFolder || selectedFolder.type !== "folder") return null;

  const breadcrumbPath = getBreadcrumbPath(
    nodes,
    selectedFolderId,
    workspace.rootFolderId
  );

  const children = selectedFolder.childrenIds
    .map((id) => nodes[id])
    .filter((node) => node && !node.isDeleted);

  const isRoot = selectedFolderId === workspace.rootFolderId;

  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-zinc-50 dark:bg-black">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 sm:px-6 dark:border-gray-800">
        <Breadcrumbs
          rootId={workspace.rootFolderId}
          items={breadcrumbPath}
          onNavigate={(id) => dispatch(selectFolder({ folderId: id }))}
        />

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="primary" onClick={onCreate}>
            <span className="hidden sm:inline">+ New</span>
            <span className="sm:hidden">+</span>
          </Button>
          <div className="hidden items-center rounded-md border border-gray-200 sm:flex dark:border-gray-700">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              className={`flex h-10 w-10 items-center justify-center rounded-l-md sm:h-9 sm:w-9 ${
                viewMode === "grid"
                  ? "bg-primary-50 text-primary-600 dark:bg-primary-500/10"
                  : "text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <GridIcon />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              aria-label="List view"
              className={`flex h-10 w-10 items-center justify-center rounded-r-md border-l border-gray-200 sm:h-9 sm:w-9 dark:border-gray-700 ${
                viewMode === "list"
                  ? "bg-primary-50 text-primary-600 dark:bg-primary-500/10"
                  : "text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <ListIcon />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5 p-4 sm:gap-6 sm:p-6">
        <div className="flex items-center gap-3">
          <FolderIcon size={40} />
          <div>
            <h2 className="text-heading-3 text-gray-900 dark:text-gray-50">
              {selectedFolder.name}
            </h2>
            {isRoot && (
              <p className="text-body-sm text-gray-500 dark:text-gray-400">
                A modern workspace for building amazing things.
              </p>
            )}
          </div>
        </div>

        {children.length === 0 ? (
          <EmptyState
            icon={<EmptyFolderIcon />}
            title="This folder is empty"
            description="No files or folders here yet. Create something new."
            action={
              <Button variant="primary" onClick={onCreate}>
                + Create
              </Button>
            }
          />
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                : "flex flex-col gap-1"
            }
          >
            {children.map((node) => (
              <FileFolderCard
                key={node.id}
                name={node.name}
                type={node.type}
                meta={
                  node.type === "folder"
                    ? `${node.childrenIds.length} item${node.childrenIds.length === 1 ? "" : "s"}${isMounted ? ` · ${formatRelativeTime(node.updatedAt)}` : ""}`
                    : `${formatBytes(node.content.length)}${isMounted ? ` · ${formatRelativeTime(node.updatedAt)}` : ""}`
                }
                isStarred={node.isStarred}
                layout={viewMode}
                onClick={() => {
                  if (node.type === "folder") {
                    dispatch(selectFolder({ folderId: node.id }));
                  } else {
                    onOpenFile(node.id);
                  }
                }}
                isMenuOpen={openMenuId === node.id}
                onOpenMenu={() =>
                  setOpenMenuId((current) => (current === node.id ? null : node.id))
                }
                onToggleStar={() => {
                  dispatch(toggleStar({ nodeId: node.id }));
                  setOpenMenuId(null);
                }}
                onRename={() => {
                  onRename(node.id);
                  setOpenMenuId(null);
                }}
                onDelete={() => {
                  onDelete(node.id);
                  setOpenMenuId(null);
                }}
              />
            ))}
            {viewMode === "grid" && <CreateNewCard onClick={onCreate} />}
          </div>
        )}
      </div>
    </div>
  );
}
