import type { NodesById, WorkspaceNode } from "@/features/workspace/workspace.types";
import type { BreadcrumbItem } from "./components/Breadcrumbs";

export function validateItemName(
  nodes: NodesById,
  parentId: string,
  name: string,
  excludeNodeId?: string
): string | null {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return "Name cannot be empty.";
  }

  const parent = nodes[parentId];
  if (!parent || parent.type !== "folder") {
    return "Invalid parent folder.";
  }

  const hasDuplicate = parent.childrenIds.some((childId) => {
    if (childId === excludeNodeId) return false;
    const child = nodes[childId];
    return (
      child &&
      !child.isDeleted &&
      child.name.toLowerCase() === trimmedName.toLowerCase()
    );
  });

  if (hasDuplicate) {
    return "An item with this name already exists here.";
  }

  return null;
}

export function getBreadcrumbPath(
  nodes: NodesById,
  folderId: string,
  rootFolderId: string
): BreadcrumbItem[] {
  const path: BreadcrumbItem[] = [];
  let currentId: string | null = folderId;

  while (currentId && currentId !== rootFolderId) {
    const node: WorkspaceNode | undefined = nodes[currentId];
    if (!node) break;
    path.unshift({ id: node.id, name: node.name });
    currentId = node.parentId;
  }

  return path;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}
