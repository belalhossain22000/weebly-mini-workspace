"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { deleteNode } from "@/features/workspace/workspaceSlice";
import { countNestedItems, getNodePath } from "@/features/explorer/explorer.utils";
import Sidebar from "./Sidebar";
import WorkspaceHeader from "./WorkspaceHeader";
import MainPanel from "./MainPanel";
import CreateItemModal from "@/features/workspace-actions/components/CreateItemModal";
import RenameModal from "@/features/workspace-actions/components/RenameModal";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

export default function WorkspaceLayout() {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector((state) => state.workspace.nodes);
  const selectedFolderId = useAppSelector(
    (state) => state.workspace.selectedFolderId
  );
  const rootFolderId = useAppSelector(
    (state) =>
      state.workspace.workspaces[state.workspace.activeWorkspaceId]
        ?.rootFolderId
  );

  const [activeNav, setActiveNav] = useState("explorer");
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [renameNodeId, setRenameNodeId] = useState<string | null>(null);
  const [deleteNodeId, setDeleteNodeId] = useState<string | null>(null);
  const [openFileId, setOpenFileId] = useState<string | null>(null);

  const deleteTarget = deleteNodeId ? nodes[deleteNodeId] : null;

  return (
    <div className="flex flex-1">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />

      <div className="flex min-w-0 flex-1 flex-col">
        <WorkspaceHeader searchValue={search} onSearchChange={setSearch} />

        <MainPanel
          onOpenFile={setOpenFileId}
          onCreate={() => setIsCreateOpen(true)}
          onRename={setRenameNodeId}
          onDelete={setDeleteNodeId}
        />
      </div>

      {rootFolderId && (
        <CreateItemModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          parentId={selectedFolderId}
        />
      )}

      {renameNodeId && (
        <RenameModal
          isOpen={Boolean(renameNodeId)}
          onClose={() => setRenameNodeId(null)}
          nodeId={renameNodeId}
        />
      )}

      {deleteTarget && rootFolderId && (
        <ConfirmDialog
          isOpen={Boolean(deleteNodeId)}
          onClose={() => setDeleteNodeId(null)}
          onConfirm={() => {
            dispatch(deleteNode({ nodeId: deleteTarget.id }));
            setDeleteNodeId(null);
          }}
          itemName={deleteTarget.name}
          itemType={deleteTarget.type}
          itemPath={getNodePath(nodes, deleteTarget.id, rootFolderId)}
          nestedCount={
            deleteTarget.type === "folder"
              ? countNestedItems(nodes, deleteTarget.id)
              : undefined
          }
        />
      )}

      {openFileId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 dark:bg-gray-900">
            <p className="text-body text-gray-700 dark:text-gray-200">
              File editor placeholder for: {nodes[openFileId]?.name}
            </p>
            <button
              type="button"
              onClick={() => setOpenFileId(null)}
              className="mt-4 text-body-sm text-primary-500"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
