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

export function countNestedItems(
  nodes: NodesById,
  folderId: string
): { folders: number; files: number } {
  const folder = nodes[folderId];
  if (!folder || folder.type !== "folder") {
    return { folders: 0, files: 0 };
  }

  let folders = 0;
  let files = 0;

  for (const childId of folder.childrenIds) {
    const child = nodes[childId];
    if (!child || child.isDeleted) continue;

    if (child.type === "folder") {
      folders += 1;
      const nested = countNestedItems(nodes, child.id);
      folders += nested.folders;
      files += nested.files;
    } else {
      files += 1;
    }
  }

  return { folders, files };
}

export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function getAvailableName(
  nodes: NodesById,
  parentId: string,
  desiredName: string
): string {
  const parent = nodes[parentId];
  if (!parent || parent.type !== "folder") return desiredName;

  const siblingNames = new Set(
    parent.childrenIds
      .map((id) => nodes[id])
      .filter((node) => node && !node.isDeleted)
      .map((node) => node!.name.toLowerCase())
  );

  if (!siblingNames.has(desiredName.toLowerCase())) {
    return desiredName;
  }

  const dotIndex = desiredName.lastIndexOf(".");
  const base = dotIndex > 0 ? desiredName.slice(0, dotIndex) : desiredName;
  const extension = dotIndex > 0 ? desiredName.slice(dotIndex) : "";

  let counter = 1;
  let candidate = `${base} (${counter})${extension}`;
  while (siblingNames.has(candidate.toLowerCase())) {
    counter += 1;
    candidate = `${base} (${counter})${extension}`;
  }

  return candidate;
}

export function getNodePath(
  nodes: NodesById,
  nodeId: string,
  rootFolderId: string
): string {
  const names = getBreadcrumbPath(nodes, nodeId, rootFolderId).map(
    (item) => item.name
  );
  return `/${names.join("/")}`;
}
