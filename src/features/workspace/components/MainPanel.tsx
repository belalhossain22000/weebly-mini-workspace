"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectFolder } from "@/features/workspace/workspaceSlice";
import { getBreadcrumbPath, formatBytes, formatRelativeTime } from "@/features/explorer/explorer.utils";
import Breadcrumbs from "@/features/explorer/components/Breadcrumbs";
import FileFolderCard from "@/features/explorer/components/FileFolderCard";
import EmptyState from "@/components/shared/EmptyState";
import Button from "@/components/ui/Button";

function EmptyFolderIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    </svg>
  );
}

function FolderHeaderIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="#2563EB">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    </svg>
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
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-3 dark:border-gray-800">
        <Breadcrumbs
          rootId={workspace.rootFolderId}
          items={breadcrumbPath}
          onNavigate={(id) => dispatch(selectFolder({ folderId: id }))}
        />

        <div className="flex items-center gap-2">
          <Button variant="primary" onClick={onCreate}>
            + New
          </Button>
          <div className="flex items-center rounded-md border border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              className={`flex h-9 w-9 items-center justify-center rounded-l-md ${
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
              className={`flex h-9 w-9 items-center justify-center rounded-r-md border-l border-gray-200 dark:border-gray-700 ${
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

      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center gap-3">
          <FolderHeaderIcon />
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
            description="No files or folders here yet. Create something new to get started."
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
                ? "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
                : "flex flex-col gap-2"
            }
          >
            {children.map((node) => (
              <div key={node.id} className="relative">
                <FileFolderCard
                  name={node.name}
                  type={node.type}
                  meta={
                    node.type === "folder"
                      ? `${node.childrenIds.length} item${node.childrenIds.length === 1 ? "" : "s"} · ${formatRelativeTime(node.updatedAt)}`
                      : `${formatBytes(node.content.length)} · ${formatRelativeTime(node.updatedAt)}`
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
                  onOpenMenu={() =>
                    setOpenMenuId((current) => (current === node.id ? null : node.id))
                  }
                />
                {openMenuId === node.id && (
                  <div className="absolute right-2 top-10 z-10 min-w-[120px] overflow-hidden rounded-md border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
                    <button
                      type="button"
                      onClick={() => {
                        onRename(node.id);
                        setOpenMenuId(null);
                      }}
                      className="block w-full px-3 py-2 text-left text-body-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onDelete(node.id);
                        setOpenMenuId(null);
                      }}
                      className="block w-full px-3 py-2 text-left text-body-sm text-error hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
