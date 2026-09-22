"use client";

import { useAppSelector } from "@/store/hooks";
import { useAppDispatch } from "@/store/hooks";
import { selectFolder } from "@/features/workspace/workspaceSlice";
import FolderTreeItem from "./FolderTreeItem";
import type { TreeFolder } from "./FolderTreeItem";
import type { NodesById } from "@/features/workspace/workspace.types";

function buildTree(nodes: NodesById, folderId: string): TreeFolder {
  const folder = nodes[folderId];
  if (!folder || folder.type !== "folder") {
    return { id: folderId, name: "Unknown", children: [] };
  }

  const children = folder.childrenIds
    .map((id) => nodes[id])
    .filter((node) => node && node.type === "folder" && !node.isDeleted)
    .map((node) => buildTree(nodes, node.id));

  return {
    id: folder.id,
    name: folder.name,
    children,
  };
}

export default function FolderTree() {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector((state) => state.workspace.nodes);
  const selectedFolderId = useAppSelector(
    (state) => state.workspace.selectedFolderId
  );
  const workspace = useAppSelector(
    (state) => state.workspace.workspaces[state.workspace.activeWorkspaceId]
  );

  if (!workspace) return null;

  const tree = buildTree(nodes, workspace.rootFolderId);

  return (
    <FolderTreeItem
      folder={tree}
      depth={0}
      selectedFolderId={selectedFolderId}
      onSelect={(folderId) => dispatch(selectFolder({ folderId }))}
    />
  );
}
