import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type {
  FolderNode,
  NodeType,
  WorkspaceState,
} from "./workspace.types";

function createInitialState(): WorkspaceState {
  const workspaceId = crypto.randomUUID();
  const rootFolderId = crypto.randomUUID();
  const now = Date.now();

  const rootFolder: FolderNode = {
    id: rootFolderId,
    name: "My Workspace",
    type: "folder",
    parentId: null,
    workspaceId,
    isStarred: false,
    isDeleted: false,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
    childrenIds: [],
  };

  return {
    workspaces: {
      [workspaceId]: {
        id: workspaceId,
        name: "My Workspace",
        description: "A modern workspace for building amazing things.",
        rootFolderId,
        createdAt: now,
      },
    },
    activeWorkspaceId: workspaceId,
    nodes: {
      [rootFolderId]: rootFolder,
    },
    selectedFolderId: rootFolderId,
    openFileId: null,
  };
}

const workspaceSlice = createSlice({
  name: "workspace",
  initialState: createInitialState(),
  reducers: {
    createWorkspace: (
      state,
      action: PayloadAction<{ name: string; description: string }>
    ) => {
      const workspaceId = crypto.randomUUID();
      const rootFolderId = crypto.randomUUID();
      const now = Date.now();

      state.workspaces[workspaceId] = {
        id: workspaceId,
        name: action.payload.name,
        description: action.payload.description,
        rootFolderId,
        createdAt: now,
      };

      state.nodes[rootFolderId] = {
        id: rootFolderId,
        name: action.payload.name,
        type: "folder",
        parentId: null,
        workspaceId,
        isStarred: false,
        isDeleted: false,
        deletedAt: null,
        createdAt: now,
        updatedAt: now,
        childrenIds: [],
      };

      state.activeWorkspaceId = workspaceId;
      state.selectedFolderId = rootFolderId;
      state.openFileId = null;
    },

    switchWorkspace: (state, action: PayloadAction<{ workspaceId: string }>) => {
      const workspace = state.workspaces[action.payload.workspaceId];
      if (!workspace) return;

      state.activeWorkspaceId = workspace.id;
      state.selectedFolderId = workspace.rootFolderId;
      state.openFileId = null;
    },

    renameWorkspace: (
      state,
      action: PayloadAction<{ workspaceId: string; name: string }>
    ) => {
      const workspace = state.workspaces[action.payload.workspaceId];
      if (!workspace) return;

      workspace.name = action.payload.name;

      const rootFolder = state.nodes[workspace.rootFolderId];
      if (rootFolder) {
        rootFolder.name = action.payload.name;
      }
    },

    createNode: (
      state,
      action: PayloadAction<{ parentId: string; name: string; type: NodeType }>
    ) => {
      const { parentId, name, type } = action.payload;
      const parent = state.nodes[parentId];
      if (!parent || parent.type !== "folder") return;

      const trimmedName = name.trim();
      if (!trimmedName) return;

      const hasDuplicate = parent.childrenIds.some((childId) => {
        const child = state.nodes[childId];
        return (
          child &&
          !child.isDeleted &&
          child.name.toLowerCase() === trimmedName.toLowerCase()
        );
      });
      if (hasDuplicate) return;

      const id = crypto.randomUUID();
      const now = Date.now();

      if (type === "folder") {
        state.nodes[id] = {
          id,
          name: trimmedName,
          type: "folder",
          parentId,
          workspaceId: parent.workspaceId,
          isStarred: false,
          isDeleted: false,
          deletedAt: null,
          createdAt: now,
          updatedAt: now,
          childrenIds: [],
        };
      } else {
        state.nodes[id] = {
          id,
          name: trimmedName,
          type: "file",
          parentId,
          workspaceId: parent.workspaceId,
          isStarred: false,
          isDeleted: false,
          deletedAt: null,
          createdAt: now,
          updatedAt: now,
          content: "",
        };
      }

      parent.childrenIds.push(id);
    },

    renameNode: (
      state,
      action: PayloadAction<{ nodeId: string; name: string }>
    ) => {
      const { nodeId, name } = action.payload;
      const node = state.nodes[nodeId];
      if (!node) return;

      const trimmedName = name.trim();
      if (!trimmedName) return;

      if (node.parentId) {
        const parent = state.nodes[node.parentId];
        if (parent && parent.type === "folder") {
          const hasDuplicate = parent.childrenIds.some((childId) => {
            const child = state.nodes[childId];
            return (
              child &&
              child.id !== nodeId &&
              !child.isDeleted &&
              child.name.toLowerCase() === trimmedName.toLowerCase()
            );
          });
          if (hasDuplicate) return;
        }
      }

      node.name = trimmedName;
      node.updatedAt = Date.now();
    },

    updateFileContent: (
      state,
      action: PayloadAction<{ nodeId: string; content: string }>
    ) => {
      const node = state.nodes[action.payload.nodeId];
      if (!node || node.type !== "file") return;

      node.content = action.payload.content;
      node.updatedAt = Date.now();
    },

    toggleStar: (state, action: PayloadAction<{ nodeId: string }>) => {
      const node = state.nodes[action.payload.nodeId];
      if (!node) return;

      node.isStarred = !node.isStarred;
    },

    deleteNode: (state, action: PayloadAction<{ nodeId: string }>) => {
      const node = state.nodes[action.payload.nodeId];
      if (!node) return;

      const now = Date.now();
      const idsToDelete: string[] = [];

      const collect = (id: string) => {
        idsToDelete.push(id);
        const current = state.nodes[id];
        if (current && current.type === "folder") {
          current.childrenIds.forEach(collect);
        }
      };
      collect(node.id);

      idsToDelete.forEach((id) => {
        const target = state.nodes[id];
        if (target) {
          target.isDeleted = true;
          target.deletedAt = now;
        }
      });

      if (node.parentId) {
        const parent = state.nodes[node.parentId];
        if (parent && parent.type === "folder") {
          parent.childrenIds = parent.childrenIds.filter(
            (id) => id !== node.id
          );
        }
      }

      if (
        state.selectedFolderId === node.id ||
        idsToDelete.includes(state.selectedFolderId)
      ) {
        const workspace = state.workspaces[node.workspaceId];
        state.selectedFolderId = node.parentId ?? workspace?.rootFolderId ?? state.selectedFolderId;
      }

      if (state.openFileId && idsToDelete.includes(state.openFileId)) {
        state.openFileId = null;
      }
    },

    restoreNode: (state, action: PayloadAction<{ nodeId: string }>) => {
      const node = state.nodes[action.payload.nodeId];
      if (!node) return;

      node.isDeleted = false;
      node.deletedAt = null;

      if (node.parentId) {
        const parent = state.nodes[node.parentId];
        if (parent && parent.type === "folder" && !parent.childrenIds.includes(node.id)) {
          parent.childrenIds.push(node.id);
        }
      }
    },

    permanentlyDeleteNode: (
      state,
      action: PayloadAction<{ nodeId: string }>
    ) => {
      const node = state.nodes[action.payload.nodeId];
      if (!node) return;

      const idsToRemove: string[] = [];
      const collect = (id: string) => {
        idsToRemove.push(id);
        const current = state.nodes[id];
        if (current && current.type === "folder") {
          current.childrenIds.forEach(collect);
        }
      };
      collect(node.id);

      if (node.parentId) {
        const parent = state.nodes[node.parentId];
        if (parent && parent.type === "folder") {
          parent.childrenIds = parent.childrenIds.filter(
            (id) => id !== node.id
          );
        }
      }

      idsToRemove.forEach((id) => {
        delete state.nodes[id];
      });
    },

    emptyTrash: (state) => {
      const trashedIds = Object.keys(state.nodes).filter(
        (id) => state.nodes[id].isDeleted
      );
      trashedIds.forEach((id) => {
        delete state.nodes[id];
      });
    },

    selectFolder: (state, action: PayloadAction<{ folderId: string }>) => {
      state.selectedFolderId = action.payload.folderId;
    },

    openFile: (state, action: PayloadAction<{ fileId: string }>) => {
      state.openFileId = action.payload.fileId;
    },

    closeFile: (state) => {
      state.openFileId = null;
    },
  },
});

export const {
  createWorkspace,
  switchWorkspace,
  renameWorkspace,
  createNode,
  renameNode,
  updateFileContent,
  toggleStar,
  deleteNode,
  restoreNode,
  permanentlyDeleteNode,
  emptyTrash,
  selectFolder,
  openFile,
  closeFile,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;
