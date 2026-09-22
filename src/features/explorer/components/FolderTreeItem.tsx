"use client";

import { useState } from "react";

export interface TreeFolder {
  id: string;
  name: string;
  children: TreeFolder[];
}

interface FolderTreeItemProps {
  folder: TreeFolder;
  depth: number;
  selectedFolderId: string;
  onSelect: (folderId: string) => void;
  onRename: (folderId: string) => void;
  onDelete: (folderId: string) => void;
}

function ChevronIcon({ isExpanded }: { isExpanded: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function FolderIcon({ isSelected }: { isSelected: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={isSelected ? "#2563EB" : "#F5B942"}
    >
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    </svg>
  );
}

function MenuDotsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  );
}

export default function FolderTreeItem({
  folder,
  depth,
  selectedFolderId,
  onSelect,
  onRename,
  onDelete,
}: FolderTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(depth === 0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const hasChildren = folder.children.length > 0;
  const isSelected = folder.id === selectedFolderId;

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          onSelect(folder.id);
          if (hasChildren) setIsExpanded(true);
        }}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        className={`group relative flex items-center gap-1.5 rounded-md py-2 pr-2 text-body-sm cursor-pointer ${
          isSelected
            ? "bg-gray-800 text-white"
            : "text-gray-300 hover:bg-gray-800/60 hover:text-white"
        }`}
      >
        <span
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) setIsExpanded((v) => !v);
          }}
          className={`flex h-4 w-4 items-center justify-center text-gray-500 ${
            hasChildren ? "" : "invisible"
          }`}
        >
          <ChevronIcon isExpanded={isExpanded} />
        </span>
        <FolderIcon isSelected={isSelected} />
        <span className="flex-1 truncate">{folder.name}</span>

        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen((v) => !v);
          }}
          className={`flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded text-gray-500 hover:bg-gray-700 hover:text-white ${
            isMenuOpen ? "flex" : "hidden group-hover:flex"
          }`}
        >
          <MenuDotsIcon />
        </span>

        {isMenuOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-2 top-full z-20 mt-1 min-w-[120px] overflow-hidden rounded-md border border-gray-700 bg-gray-800 shadow-lg"
          >
            <button
              type="button"
              onClick={() => {
                onRename(folder.id);
                setIsMenuOpen(false);
              }}
              className="block w-full px-3 py-2 text-left text-body-sm text-gray-200 hover:bg-gray-700"
            >
              Rename
            </button>
            <button
              type="button"
              onClick={() => {
                onDelete(folder.id);
                setIsMenuOpen(false);
              }}
              className="block w-full px-3 py-2 text-left text-body-sm text-error hover:bg-gray-700"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div>
          {folder.children.map((child) => (
            <FolderTreeItem
              key={child.id}
              folder={child}
              depth={depth + 1}
              selectedFolderId={selectedFolderId}
              onSelect={onSelect}
              onRename={onRename}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
