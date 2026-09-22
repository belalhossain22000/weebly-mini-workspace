"use client";

import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  deleteNode,
  selectFolder,
  switchWorkspace,
  updateFileContent,
} from "@/features/workspace/workspaceSlice";
import { countNestedItems, getNodePath } from "@/features/explorer/explorer.utils";
import { useIsHydrated } from "@/app/providers";
import Sidebar from "./Sidebar";
import WorkspaceHeader from "./WorkspaceHeader";
import MainPanel from "./MainPanel";
import CreateItemModal from "@/features/workspace-actions/components/CreateItemModal";
import CreateWorkspaceModal from "@/features/workspace-actions/components/CreateWorkspaceModal";
import RenameModal from "@/features/workspace-actions/components/RenameModal";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import SearchView from "@/features/search/components/SearchView";
import type { SearchResult } from "@/features/search/search.utils";
import TextEditor from "@/features/editor/components/TextEditor";
import UnsavedChangesModal from "@/features/editor/components/UnsavedChangesModal";
import RecentView from "./RecentView";
import StarredView from "./StarredView";
import TrashView from "./TrashView";

export default function WorkspaceLayout() {
  const dispatch = useAppDispatch();
  const isHydrated = useIsHydrated();
  const nodes = useAppSelector((state) => state.workspace.nodes);
  const activeWorkspaceId = useAppSelector(
    (state) => state.workspace.activeWorkspaceId
  );
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
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const [renameNodeId, setRenameNodeId] = useState<string | null>(null);
  const [deleteNodeId, setDeleteNodeId] = useState<string | null>(null);
  const [openFileId, setOpenFileId] = useState<string | null>(null);
  const [draftContent, setDraftContent] = useState("");
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const openFile = openFileId ? nodes[openFileId] : null;
  const isDirty = Boolean(
    openFile && openFile.type === "file" && draftContent !== openFile.content
  );

  // Warn the browser before reload/close when there are unsaved changes.
  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (openFile && openFile.type === "file") {
      setDraftContent(openFile.content);
    }
    // Reset the draft whenever a different file is opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openFileId]);

  function guardedRun(action: () => void) {
    if (isDirty) {
      setPendingAction(() => action);
    } else {
      action();
    }
  }

  function handleSave() {
    if (openFileId) {
      dispatch(updateFileContent({ nodeId: openFileId, content: draftContent }));
    }
  }

  function handleDiscard() {
    if (openFile && openFile.type === "file") {
      setDraftContent(openFile.content);
    }
  }

  const hasReadUrlOnLoad = useRef(false);

  useEffect(() => {
    if (!isHydrated || hasReadUrlOnLoad.current) return;
    hasReadUrlOnLoad.current = true;

    const folderIdFromUrl = new URLSearchParams(window.location.search).get(
      "folder"
    );
    const node = folderIdFromUrl ? nodes[folderIdFromUrl] : null;
    if (
      node &&
      node.type === "folder" &&
      node.workspaceId === activeWorkspaceId &&
      !node.isDeleted
    ) {
      dispatch(selectFolder({ folderId: node.id }));
    }
    // Runs once, right after hydration, to restore the folder from the URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated]);

  useEffect(() => {
    if (!isHydrated || !hasReadUrlOnLoad.current) return;

    const params = new URLSearchParams(window.location.search);
    if (rootFolderId && selectedFolderId === rootFolderId) {
      params.delete("folder");
    } else {
      params.set("folder", selectedFolderId);
    }
    const query = params.toString();
    window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
  }, [isHydrated, selectedFolderId, rootFolderId]);

  const deleteTarget = deleteNodeId ? nodes[deleteNodeId] : null;

  useEffect(() => {
    if (!openFileId) return;
    const file = nodes[openFileId];
    if (!file || file.isDeleted) {
      setOpenFileId(null);
    }
  }, [openFileId, nodes]);

  function handleSearchChange(value: string) {
    setSearch(value);
    if (value.trim()) {
      guardedRun(() => setActiveNav("search"));
    }
  }

  function handleSearchNavigate(result: SearchResult) {
    guardedRun(() => {
      if (result.node.type === "folder") {
        dispatch(selectFolder({ folderId: result.node.id }));
      } else if (result.node.parentId) {
        dispatch(selectFolder({ folderId: result.node.parentId }));
        setOpenFileId(result.node.id);
      }
      setActiveNav("explorer");
      setSearch("");
    });
  }

  if (!isHydrated) {
    return (
      <div className="flex min-h-0 flex-1">
        <div className="flex h-full w-64 shrink-0 flex-col gap-4 bg-gray-900 p-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-gray-800" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-28 animate-pulse rounded bg-gray-800" />
              <div className="h-2.5 w-20 animate-pulse rounded bg-gray-800" />
            </div>
          </div>
          <div className="h-10 w-full animate-pulse rounded-md bg-gray-800" />
          <div className="flex flex-col gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-9 w-full animate-pulse rounded-lg bg-gray-800" />
            ))}
          </div>
          <div className="flex flex-1 flex-col gap-2 border-t border-gray-800 pt-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 w-full animate-pulse rounded-md bg-gray-800" />
            ))}
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col bg-zinc-50 dark:bg-black">
          <div className="h-16 border-b border-gray-100 dark:border-gray-800" />
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[86px] w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-900"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1">
      <Sidebar
        activeNav={activeNav}
        onNavChange={(navId) =>
          guardedRun(() => {
            setActiveNav(navId);
            // These views replace the entire main content area,
            // so close any open file to let them render.
            if (navId === "recent" || navId === "starred" || navId === "trash") {
              setOpenFileId(null);
            }
          })
        }
        onCreateFolder={() => setIsCreateOpen(true)}
        onCreateWorkspace={() => setIsCreateWorkspaceOpen(true)}
        onRenameFolder={setRenameNodeId}
        onDeleteFolder={setDeleteNodeId}
        onSelectFolder={(folderId) =>
          guardedRun(() => {
            dispatch(selectFolder({ folderId }));
            setActiveNav("explorer");
            setOpenFileId(null);
          })
        }
        onSwitchWorkspace={(workspaceId) =>
          guardedRun(() => {
            dispatch(switchWorkspace({ workspaceId }));
            setActiveNav("explorer");
            setOpenFileId(null);
          })
        }
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <WorkspaceHeader searchValue={search} onSearchChange={handleSearchChange} />

        {openFileId ? (
          <TextEditor
            fileId={openFileId}
            draftContent={draftContent}
            onDraftChange={setDraftContent}
            isDirty={isDirty}
            onSave={handleSave}
            onDiscard={handleDiscard}
            onRequestClose={() => guardedRun(() => setOpenFileId(null))}
            onNavigate={(folderId) =>
              guardedRun(() => {
                dispatch(selectFolder({ folderId }));
                setOpenFileId(null);
              })
            }
            onRename={setRenameNodeId}
            onDelete={(nodeId) => {
              setOpenFileId(null);
              setDeleteNodeId(nodeId);
            }}
          />
        ) : activeNav === "search" ? (
          <SearchView
            query={search}
            onSearchChange={handleSearchChange}
            onNavigate={handleSearchNavigate}
            onGoHome={() =>
              guardedRun(() => {
                setActiveNav("explorer");
                setSearch("");
                if (rootFolderId) {
                  dispatch(selectFolder({ folderId: rootFolderId }));
                }
              })
            }
          />
        ) : activeNav === "recent" ? (
          <RecentView
            onOpenFile={(fileId) => guardedRun(() => setOpenFileId(fileId))}
            onNavigate={(folderId) =>
              guardedRun(() => {
                dispatch(selectFolder({ folderId }));
                setActiveNav("explorer");
              })
            }
            onRename={setRenameNodeId}
            onDelete={setDeleteNodeId}
          />
        ) : activeNav === "starred" ? (
          <StarredView
            onOpenFile={(fileId) => guardedRun(() => setOpenFileId(fileId))}
            onNavigate={(folderId) =>
              guardedRun(() => {
                dispatch(selectFolder({ folderId }));
                setActiveNav("explorer");
              })
            }
            onRename={setRenameNodeId}
            onDelete={setDeleteNodeId}
          />
        ) : activeNav === "trash" ? (
          <TrashView />
        ) : (
          <MainPanel
            onOpenFile={(fileId) => guardedRun(() => setOpenFileId(fileId))}
            onCreate={() => setIsCreateOpen(true)}
            onRename={setRenameNodeId}
            onDelete={setDeleteNodeId}
          />
        )}
      </div>

      {rootFolderId && (
        <CreateItemModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          parentId={selectedFolderId}
        />
      )}

      <CreateWorkspaceModal
        isOpen={isCreateWorkspaceOpen}
        onClose={() => setIsCreateWorkspaceOpen(false)}
      />

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

      <UnsavedChangesModal
        isOpen={Boolean(pendingAction)}
        onCancel={() => setPendingAction(null)}
        onDiscard={() => {
          handleDiscard();
          pendingAction?.();
          setPendingAction(null);
        }}
        onSave={() => {
          handleSave();
          pendingAction?.();
          setPendingAction(null);
        }}
      />
    </div>
  );
}
