import type { NodesById, WorkspaceNode } from "@/features/workspace/workspace.types";
import { getNodePath } from "@/features/explorer/explorer.utils";

export type FileTypeFilter = "text" | "markdown" | "other";
export type SortOption = "relevance" | "name" | "date";
export type TypeTab = "all" | "files" | "folders";

export interface SearchFilters {
  fileTypes: FileTypeFilter[];
  locations: string[];
  dateModified: "any" | "today" | "7days" | "30days";
}

export interface SearchResult {
  node: WorkspaceNode;
  path: string;
  snippet: string;
  matchScore: number;
}

function getFileTypeFilter(name: string): FileTypeFilter {
  if (name.toLowerCase().endsWith(".md")) return "markdown";
  if (name.toLowerCase().endsWith(".txt")) return "text";
  return "other";
}

function getSnippet(node: WorkspaceNode, query: string): string {
  if (node.type === "folder") {
    return `Folder containing ${node.childrenIds.length} item${node.childrenIds.length === 1 ? "" : "s"}`;
  }

  const content = node.content;
  const lowerContent = content.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const matchIndex = lowerContent.indexOf(lowerQuery);

  if (matchIndex === -1) {
    return content.slice(0, 80);
  }

  const start = Math.max(0, matchIndex - 20);
  const end = Math.min(content.length, matchIndex + query.length + 40);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < content.length ? "..." : "";
  return `${prefix}${content.slice(start, end)}${suffix}`;
}

export function searchWorkspace(
  nodes: NodesById,
  workspaceId: string,
  rootFolderId: string,
  query: string
): SearchResult[] {
  const trimmedQuery = query.trim().toLowerCase();
  if (!trimmedQuery) return [];

  const results: SearchResult[] = [];

  for (const node of Object.values(nodes)) {
    if (node.workspaceId !== workspaceId || node.isDeleted) continue;

    const nameMatch = node.name.toLowerCase().includes(trimmedQuery);
    const contentMatch =
      node.type === "file" && node.content.toLowerCase().includes(trimmedQuery);

    if (!nameMatch && !contentMatch) continue;

    const matchScore = nameMatch ? 2 : 1;

    results.push({
      node,
      path: getNodePath(nodes, node.id, rootFolderId),
      snippet: getSnippet(node, trimmedQuery),
      matchScore,
    });
  }

  return results;
}

export function filterResults(
  results: SearchResult[],
  typeTab: TypeTab,
  filters: SearchFilters
): SearchResult[] {
  return results.filter((result) => {
    if (typeTab === "files" && result.node.type !== "file") return false;
    if (typeTab === "folders" && result.node.type !== "folder") return false;

    if (filters.fileTypes.length > 0) {
      if (result.node.type === "folder") return false;
      const fileType = getFileTypeFilter(result.node.name);
      if (!filters.fileTypes.includes(fileType)) return false;
    }

    if (filters.locations.length > 0) {
      const topLevelSegment = result.path.split("/").filter(Boolean)[0] ?? "";
      if (!filters.locations.includes(topLevelSegment)) return false;
    }

    if (filters.dateModified !== "any") {
      const diffMs = Date.now() - result.node.updatedAt;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      if (filters.dateModified === "today" && diffDays > 1) return false;
      if (filters.dateModified === "7days" && diffDays > 7) return false;
      if (filters.dateModified === "30days" && diffDays > 30) return false;
    }

    return true;
  });
}

export function sortResults(
  results: SearchResult[],
  sortBy: SortOption
): SearchResult[] {
  const sorted = [...results];

  if (sortBy === "name") {
    sorted.sort((a, b) => a.node.name.localeCompare(b.node.name));
  } else if (sortBy === "date") {
    sorted.sort((a, b) => b.node.updatedAt - a.node.updatedAt);
  } else {
    sorted.sort((a, b) => b.matchScore - a.matchScore);
  }

  return sorted;
}

export function getTopLevelLocations(
  nodes: NodesById,
  workspaceId: string,
  rootFolderId: string
): string[] {
  const root = nodes[rootFolderId];
  if (!root || root.type !== "folder") return [];

  return root.childrenIds
    .map((id) => nodes[id])
    .filter(
      (node): node is WorkspaceNode =>
        Boolean(node) && node.workspaceId === workspaceId && !node.isDeleted
    )
    .map((node) => node.name);
}
