export type NodeType = "folder" | "file";

interface BaseNode {
  id: string;
  name: string;
  type: NodeType;
  parentId: string | null;
  workspaceId: string;
  isStarred: boolean;
  isDeleted: boolean;
  deletedAt: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface FolderNode extends BaseNode {
  type: "folder";
  childrenIds: string[];
}

export interface FileNode extends BaseNode {
  type: "file";
  content: string;
}

export type WorkspaceNode = FolderNode | FileNode;

export type NodesById = Record<string, WorkspaceNode>;

export interface Workspace {
  id: string;
  name: string;
  description: string;
  rootFolderId: string;
  createdAt: number;
}

export type WorkspacesById = Record<string, Workspace>;

export interface WorkspaceState {
  workspaces: WorkspacesById;
  activeWorkspaceId: string;
  nodes: NodesById;
  selectedFolderId: string;
  openFileId: string | null;
}
