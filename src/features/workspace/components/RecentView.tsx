"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectFolder, toggleStar } from "@/features/workspace/workspaceSlice";
import {
  formatBytes,
  formatRelativeTime,
} from "@/features/explorer/explorer.utils";
import { useIsClient } from "@/lib/useIsClient";
import EmptyState from "@/components/shared/EmptyState";
import { FolderIcon, FileIcon } from "@/components/ui/FileFolderIcon";

function RecentEmptyIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15.5 14" />
    </svg>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={filled ? "#F59E0B" : "none"}
      stroke={filled ? "#F59E0B" : "currentColor"}
      strokeWidth="1.8"
    >
      <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9" />
    </svg>
  );
}

interface RecentViewProps {
  onOpenFile: (fileId: string) => void;
  onNavigate: (folderId: string) => void;
  onRename: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
}

export default function RecentView({
  onOpenFile,
  onNavigate,
  onRename,
  onDelete,
}: RecentViewProps) {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector((state) => state.workspace.nodes);
  const activeWorkspaceId = useAppSelector(
    (state) => state.workspace.activeWorkspaceId
  );
  const rootFolderId = useAppSelector(
    (state) =>
      state.workspace.workspaces[state.workspace.activeWorkspaceId]?.rootFolderId
  );
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const isMounted = useIsClient();

  const recentNodes = Object.values(nodes)
    .filter(
      (node) =>
        node.workspaceId === activeWorkspaceId &&
        !node.isDeleted &&
        node.id !== rootFolderId
    )
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 50);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-zinc-50 dark:bg-black">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-6 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-gray-500">
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 7 12 12 15.5 14" />
          </svg>
          <h2 className="text-body-sm font-semibold text-gray-900 dark:text-gray-50">Recent</h2>
        </div>
        <span className="text-caption text-gray-400">{recentNodes.length} item{recentNodes.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="flex flex-1 flex-col gap-5 p-4 sm:gap-6 sm:p-6">
        <div>
          <h1 className="text-heading-3 text-gray-900 dark:text-gray-50">Recently Modified</h1>
          <p className="mt-1 text-body-sm text-gray-500 dark:text-gray-400">
            Files and folders sorted by last activity
          </p>
        </div>

        {recentNodes.length === 0 ? (
          <EmptyState
            icon={<RecentEmptyIcon />}
            title="No recent activity"
            description="Files and folders you have recently modified will appear here."
          />
        ) : (
          <div className="flex flex-col gap-1">
            {recentNodes.map((node) => (
              <div key={node.id} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenuId(null);
                    if (node.type === "folder") {
                      dispatch(selectFolder({ folderId: node.id }));
                      onNavigate(node.id);
                    } else {
                      onOpenFile(node.id);
                    }
                  }}
                  className="group relative flex w-full cursor-pointer items-center gap-3 rounded-lg border border-gray-100 bg-white px-3 py-2.5 text-left transition-colors hover:border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
                >
                  {node.type === "folder" ? <FolderIcon /> : <FileIcon />}
                  <span className="flex-1 truncate text-body-sm font-medium text-gray-900 dark:text-gray-50">
                    {node.name}
                  </span>
                  {node.isStarred && (
                    <span className="shrink-0">
                      <StarIcon filled />
                    </span>
                  )}
                  <span className="hidden shrink-0 text-caption text-gray-400 sm:inline">
                    {node.type === "file"
                      ? formatBytes(node.content.length)
                      : `${node.childrenIds.length} item${node.childrenIds.length !== 1 ? "s" : ""}`}
                  </span>
                  <span className="hidden w-24 shrink-0 text-right text-caption text-gray-400 sm:inline">
                    {isMounted ? formatRelativeTime(node.updatedAt) : ""}
                  </span>
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
                    className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center text-gray-400 hover:text-gray-600 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 dark:hover:text-gray-200"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="5" r="1.5" />
                      <circle cx="12" cy="12" r="1.5" />
                      <circle cx="12" cy="19" r="1.5" />
                    </svg>
                  </span>
                </button>

                {openMenuId === node.id && (
                  <div className="absolute right-0 top-full z-10 mt-1 min-w-[140px] overflow-hidden rounded-md border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(toggleStar({ nodeId: node.id }));
                        setOpenMenuId(null);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-body-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      <StarIcon filled={node.isStarred} />
                      {node.isStarred ? "Unstar" : "Star"}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRename(node.id);
                        setOpenMenuId(null);
                      }}
                      className="block w-full px-3 py-2 text-left text-body-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
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
