"use client";

import { useAppSelector } from "@/store/hooks";
import { getBreadcrumbPath, formatBytes, formatDateTime } from "@/features/explorer/explorer.utils";
import LineNumberedTextarea from "./LineNumberedTextarea";
import Breadcrumbs from "@/features/explorer/components/Breadcrumbs";
import Button from "@/components/ui/Button";

function FileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
      <path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function RenameActionIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" />
    </svg>
  );
}

function DeleteActionIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  );
}

interface TextEditorProps {
  fileId: string;
  draftContent: string;
  onDraftChange: (content: string) => void;
  isDirty: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onRequestClose: () => void;
  onNavigate: (folderId: string) => void;
  onRename: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
}

export default function TextEditor({
  fileId,
  draftContent,
  onDraftChange,
  isDirty,
  onSave,
  onDiscard,
  onRequestClose,
  onNavigate,
  onRename,
  onDelete,
}: TextEditorProps) {
  const nodes = useAppSelector((state) => state.workspace.nodes);
  const workspace = useAppSelector(
    (state) => state.workspace.workspaces[state.workspace.activeWorkspaceId]
  );

  const file = nodes[fileId];
  if (!file || file.type !== "file" || !workspace) return null;

  const breadcrumbPath = file.parentId
    ? [...getBreadcrumbPath(nodes, file.parentId, workspace.rootFolderId), { id: file.id, name: file.name }]
    : [{ id: file.id, name: file.name }];

  const wordCount = draftContent.trim() ? draftContent.trim().split(/\s+/).length : 0;
  const lineCount = draftContent.split("\n").length;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-3 dark:border-gray-800">
        <Breadcrumbs
          rootId={workspace.rootFolderId}
          items={breadcrumbPath}
          onNavigate={(id) => {
            if (id === file.id) return;
            onNavigate(id);
          }}
        />

        <div className="flex items-center gap-2">
          {isDirty && (
            <Button variant="ghost" onClick={onDiscard}>
              Discard Changes
            </Button>
          )}
          <Button variant="primary" onClick={onSave} disabled={!isDirty}>
            Save
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-gray-100 px-4 dark:border-gray-800">
        <div className="flex items-center gap-2 border-b-2 border-primary-500 px-3 py-2">
          <FileIcon />
          <span className="text-body-sm text-gray-800 dark:text-gray-100">{file.name}</span>
          <button
            type="button"
            onClick={onRequestClose}
            aria-label="Close file"
            className="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <CloseIcon />
          </button>
        </div>
        {isDirty && (
          <span className="flex items-center gap-1.5 text-caption text-warning">
            <span className="h-1.5 w-1.5 rounded-full bg-warning" />
            Unsaved changes
          </span>
        )}
      </div>

      <div className="flex min-h-0 flex-1">
        <LineNumberedTextarea value={draftContent} onChange={onDraftChange} />

        <div className="flex w-72 shrink-0 flex-col gap-6 overflow-y-auto border-l border-gray-100 p-4 dark:border-gray-800">
          <div>
            <p className="mb-2 text-caption font-semibold text-gray-500 dark:text-gray-400">
              File Information
            </p>
            <div className="flex items-center gap-3 rounded-md bg-gray-50 p-3 dark:bg-gray-800">
              <FileIcon />
              <div>
                <p className="text-body-sm font-medium text-gray-900 dark:text-gray-50">
                  {file.name}
                </p>
                <p className="text-caption text-gray-500 dark:text-gray-400">Text File</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-body-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Size</span>
              <span className="text-gray-900 dark:text-gray-100">
                {formatBytes(file.content.length)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Created</span>
              <span className="text-gray-900 dark:text-gray-100">
                {formatDateTime(file.createdAt)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Modified</span>
              <span className="text-gray-900 dark:text-gray-100">
                {formatDateTime(file.updatedAt)}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-500 dark:text-gray-400">Path</span>
              <span className="truncate text-caption text-gray-700 dark:text-gray-300">
                {breadcrumbPath.map((item) => item.name).join("/")}
              </span>
            </div>
          </div>

          <div>
            <p className="mb-2 text-caption font-semibold text-gray-500 dark:text-gray-400">
              Actions
            </p>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => onRename(file.id)}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-body-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <RenameActionIcon />
                Rename
              </button>
              <button
                type="button"
                onClick={() => onDelete(file.id)}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-body-sm text-error hover:bg-red-50 dark:hover:bg-red-950"
              >
                <DeleteActionIcon />
                Delete
              </button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-caption font-semibold text-gray-500 dark:text-gray-400">
              Quick Info
            </p>
            <div className="flex flex-col gap-2 text-body-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Characters</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {draftContent.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Lines</span>
                <span className="text-gray-900 dark:text-gray-100">{lineCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Words</span>
                <span className="text-gray-900 dark:text-gray-100">{wordCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
