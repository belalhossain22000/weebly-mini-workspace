"use client";

import { useAppSelector } from "@/store/hooks";

export default function Home() {
  const activeWorkspaceId = useAppSelector((state) => state.workspace.activeWorkspaceId);
  const workspace = useAppSelector(
    (state) => state.workspace.workspaces[state.workspace.activeWorkspaceId]
  );
  const selectedFolderId = useAppSelector((state) => state.workspace.selectedFolderId);
  const selectedFolder = useAppSelector(
    (state) => state.workspace.nodes[state.workspace.selectedFolderId]
  );

  return (
    <div className="flex flex-col flex-1 items-center justify-center gap-2 bg-zinc-50 font-sans dark:bg-black">
      <p>Workspace ID: {activeWorkspaceId}</p>
      <p>Workspace name: {workspace?.name}</p>
      <p>Workspace description: {workspace?.description}</p>
      <p>Selected folder ID: {selectedFolderId}</p>
      <p>Selected folder name: {selectedFolder?.name}</p>
      <p>
        Selected folder children count:{" "}
        {selectedFolder?.type === "folder" ? selectedFolder.childrenIds.length : "N/A"}
      </p>
    </div>
  );
}
