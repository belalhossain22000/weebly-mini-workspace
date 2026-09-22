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

  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-zinc-50 dark:bg-black">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-3 dark:border-gray-800">
        <Breadcrumbs
          rootId={workspace.rootFolderId}
          items={breadcrumbPath}
          onNavigate={(id) => dispatch(selectFolder({ folderId: id }))}
        />
        <Button variant="primary" onClick={onCreate}>
          + Create
        </Button>
      </div>

      <div className="flex-1 p-6">
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
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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
