"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  restoreNode,
  permanentlyDeleteNode,
  emptyTrash,
} from "@/features/workspace/workspaceSlice";
import { formatBytes, formatRelativeTime } from "@/features/explorer/explorer.utils";
import EmptyState from "@/components/shared/EmptyState";
import Button from "@/components/ui/Button";
import { FolderIcon, FileIcon } from "@/components/ui/FileFolderIcon";

function TrashEmptyIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function RestoreIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

export default function TrashView() {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector((state) => state.workspace.nodes);
  const activeWorkspaceId = useAppSelector(
    (state) => state.workspace.activeWorkspaceId
  );
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [confirmEmptyTrash, setConfirmEmptyTrash] = useState(false);

  // Only show top-level trashed nodes (whose parent is NOT also trashed),
  // to avoid duplicates when a whole folder tree is deleted.
  const trashedNodes = Object.values(nodes).filter((node) => {
    if (node.workspaceId !== activeWorkspaceId) return false;
    if (!node.isDeleted) return false;
    if (!node.parentId) return true;
    const parent = nodes[node.parentId];
    // Show the node only if its parent is not deleted (i.e. it is the root of the deleted subtree)
    return !parent || !parent.isDeleted;
  });

  const hasTrash = trashedNodes.length > 0;

  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-zinc-50 dark:bg-black">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-3 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-gray-500">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
          </svg>
          <h2 className="text-body-sm font-semibold text-gray-900 dark:text-gray-50">Trash</h2>
        </div>
        {hasTrash && (
          <Button
            variant="ghost"
            onClick={() => setConfirmEmptyTrash(true)}
            className="text-error hover:bg-red-50 dark:hover:bg-red-950"
          >
            Empty Trash
          </Button>
        )}
      </div>

      {/* Confirm empty-trash banner */}
      {confirmEmptyTrash && (
        <div className="flex items-center justify-between gap-4 border-b border-red-200 bg-red-50 px-6 py-3 dark:border-red-900 dark:bg-red-950/30">
          <p className="text-body-sm text-red-700 dark:text-red-300">
            Permanently delete all {trashedNodes.length} item{trashedNodes.length !== 1 ? "s" : ""}? This cannot be undone.
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setConfirmEmptyTrash(false)}
              className="rounded-md px-3 py-1.5 text-caption font-medium text-gray-600 hover:bg-red-100 dark:text-gray-300 dark:hover:bg-red-900"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                dispatch(emptyTrash());
                setConfirmEmptyTrash(false);
              }}
              className="rounded-md bg-red-600 px-3 py-1.5 text-caption font-medium text-white hover:bg-red-700"
            >
              Delete All
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <h1 className="text-heading-3 text-gray-900 dark:text-gray-50">Trash</h1>
          <p className="mt-1 text-body-sm text-gray-500 dark:text-gray-400">
            Deleted items can be restored or permanently removed
          </p>
        </div>

        {!hasTrash ? (
          <EmptyState
            icon={<TrashEmptyIcon />}
            title="Trash is empty"
            description="Items you delete will appear here. You can restore or permanently remove them."
          />
        ) : (
          <div className="flex flex-col gap-1">
            {trashedNodes.map((node) => (
              <div key={node.id} className="relative">
                <div className="group flex w-full items-center gap-3 rounded-lg border border-gray-100 bg-white px-3 py-2.5 text-left transition-colors dark:border-gray-800 dark:bg-gray-900">
                  <span className="opacity-50">
                    {node.type === "folder" ? <FolderIcon /> : <FileIcon />}
                  </span>
                  <span className="flex-1 truncate text-body-sm font-medium text-gray-500 line-through dark:text-gray-400">
                    {node.name}
                  </span>
                  <span className="shrink-0 text-caption text-gray-400">
                    {node.type === "file"
                      ? formatBytes(node.content.length)
                      : `${node.childrenIds.length} item${node.childrenIds.length !== 1 ? "s" : ""}`}
                  </span>
                  <span className="w-24 shrink-0 text-right text-caption text-gray-400">
                    {node.deletedAt ? formatRelativeTime(node.deletedAt) : ""}
                  </span>

                  {/* Restore button */}
                  <button
                    type="button"
                    title="Restore"
                    onClick={() => dispatch(restoreNode({ nodeId: node.id }))}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-caption font-medium text-primary-600 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-950/40"
                  >
                    <RestoreIcon />
                    Restore
                  </button>

                  {/* More options */}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId((c) => (c === node.id ? null : node.id));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        setOpenMenuId((c) => (c === node.id ? null : node.id));
                      }
                    }}
                    className="cursor-pointer text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="5" r="1.5" />
                      <circle cx="12" cy="12" r="1.5" />
                      <circle cx="12" cy="19" r="1.5" />
                    </svg>
                  </span>
                </div>

                {openMenuId === node.id && (
                  <div className="absolute right-0 top-full z-10 mt-1 min-w-[180px] overflow-hidden rounded-md border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
                    <button
                      type="button"
                      onClick={() => {
                        dispatch(restoreNode({ nodeId: node.id }));
                        setOpenMenuId(null);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-body-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      <RestoreIcon />
                      Restore
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        dispatch(permanentlyDeleteNode({ nodeId: node.id }));
                        setOpenMenuId(null);
                      }}
                      className="block w-full px-3 py-2 text-left text-body-sm text-error hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      Delete Permanently
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
